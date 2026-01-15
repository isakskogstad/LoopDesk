import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { searchAndSaveAnnouncements } from "@/lib/kungorelser";

/**
 * GET /api/kungorelser/org/[orgNumber]
 *
 * Get announcements for a specific company.
 * Returns cached data if available, optionally scrapes fresh data.
 *
 * Query params:
 * - refresh: boolean - Force fresh scrape even if cache exists
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ orgNumber: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { orgNumber } = await params;
    const searchParams = request.nextUrl.searchParams;
    const forceRefresh = searchParams.get("refresh") === "true";

    // Normalize org number
    const normalizedOrg = orgNumber.replace(/\D/g, "");
    if (normalizedOrg.length !== 10) {
      return NextResponse.json(
        { error: "Invalid organization number. Must be 10 digits." },
        { status: 400 }
      );
    }

    // Get cached announcements
    const cached = await prisma.announcement.findMany({
      where: { orgNumber: normalizedOrg },
      orderBy: { publishedAt: "desc" },
    });

    // Get last scrape time from WatchedCompany or most recent announcement
    const watchedCompany = await prisma.watchedCompany.findUnique({
      where: { orgNumber: normalizedOrg },
      select: { lastScraped: true, name: true },
    });

    const lastScraped = watchedCompany?.lastScraped ||
      (cached.length > 0 ? cached[0].scrapedAt : null);

    // Determine if we need fresh data
    const cacheAgeHours = lastScraped
      ? (Date.now() - lastScraped.getTime()) / (1000 * 60 * 60)
      : Infinity;
    const shouldScrape = forceRefresh || cacheAgeHours > 24 || cached.length === 0;

    if (shouldScrape) {
      try {
        console.log(`[API] Scraping fresh data for ${normalizedOrg}`);

        const freshResults = await searchAndSaveAnnouncements(normalizedOrg, {
          forceRefresh: true,
        });

        // Update lastScraped on WatchedCompany if it exists
        if (watchedCompany) {
          await prisma.watchedCompany.update({
            where: { orgNumber: normalizedOrg },
            data: { lastScraped: new Date() },
          });
        }

        // Get company name from first result or watched company
        const companyName = freshResults[0]?.subject || watchedCompany?.name || "Okänt bolag";

        // Find latest date
        const latestDate = freshResults.length > 0
          ? freshResults.reduce((latest, r) => {
              const date = r.publishedAt || r.pubDate;
              if (!date) return latest;
              const d = new Date(date);
              return d > latest ? d : latest;
            }, new Date(0)).toISOString()
          : null;

        return NextResponse.json({
          source: "fresh",
          orgnummer: normalizedOrg,
          count: freshResults.length,
          latestDate,
          lastScraped: new Date().toISOString(),
          results: freshResults.map((r) => ({
            id: r.id,
            typ: r.type,
            datum: r.pubDate,
            foretag: r.reporter,
            subject: r.subject || companyName,
            orgnummer: r.orgNumber,
            detailText: r.detailText,
          })),
        });
      } catch (scrapeError) {
        console.error(`[API] Scrape error for ${normalizedOrg}:`, scrapeError);

        // Fall back to cached data if available
        if (cached.length > 0) {
          console.log(`[API] Returning cached data after scrape error`);
        } else {
          return NextResponse.json(
            { error: "Failed to scrape announcements" },
            { status: 500 }
          );
        }
      }
    }

    // Return cached data
    const companyName = cached[0]?.subject || watchedCompany?.name || "Okänt bolag";
    const latestDate = cached.length > 0
      ? cached.reduce((latest, r) => {
          const date = r.publishedAt || r.pubDate;
          if (!date) return latest;
          const d = new Date(date);
          return d > latest ? d : latest;
        }, new Date(0)).toISOString()
      : null;

    return NextResponse.json({
      source: "cache",
      orgnummer: normalizedOrg,
      count: cached.length,
      latestDate,
      lastScraped: lastScraped?.toISOString() || null,
      results: cached.map((a) => ({
        id: a.id,
        typ: a.type,
        datum: a.pubDate,
        foretag: a.reporter,
        subject: a.subject || companyName,
        orgnummer: a.orgNumber,
        detailText: a.detailText,
      })),
    });
  } catch (error) {
    console.error("Error fetching company announcements:", error);
    return NextResponse.json(
      { error: "Failed to fetch company announcements" },
      { status: 500 }
    );
  }
}
