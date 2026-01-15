import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { validateFeedUrl, generateFeedId } from "@/lib/rss/validate";

/**
 * POST /api/feeds/sync
 * Sync feeds from external source (Folo daemon)
 * Requires API key authentication (not session-based)
 */
export async function POST(request: NextRequest) {
  try {
    // API Key authentication
    const apiKey = request.headers.get("x-api-key");
    const expectedKey = process.env.FOLO_SYNC_API_KEY;

    if (!expectedKey) {
      console.error("FOLO_SYNC_API_KEY not configured");
      return NextResponse.json(
        { error: "Sync not configured" },
        { status: 503 }
      );
    }

    if (!apiKey || apiKey !== expectedKey) {
      return NextResponse.json({ error: "Invalid API key" }, { status: 401 });
    }

    // Get user email from header (daemon sends this)
    const userEmail = request.headers.get("x-user-email");
    if (!userEmail) {
      return NextResponse.json(
        { error: "User email required" },
        { status: 400 }
      );
    }

    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email: userEmail },
    });

    if (!user) {
      return NextResponse.json(
        { error: `User not found: ${userEmail}` },
        { status: 404 }
      );
    }

    const body = await request.json();
    const { feeds } = body;

    if (!Array.isArray(feeds)) {
      return NextResponse.json(
        { error: "Feeds array required" },
        { status: 400 }
      );
    }

    const results = {
      added: [] as string[],
      skipped: [] as string[],
      failed: [] as { url: string; error: string }[],
    };

    for (const feedData of feeds) {
      const { url, name, category } = feedData;

      if (!url || typeof url !== "string") {
        results.failed.push({ url: url || "unknown", error: "Invalid URL" });
        continue;
      }

      try {
        // Check if feed already exists for this user
        const existing = await prisma.feed.findFirst({
          where: {
            userId: user.id,
            url: url,
          },
        });

        if (existing) {
          results.skipped.push(url);
          continue;
        }

        // Validate the feed URL
        const validation = await validateFeedUrl(url);

        if (!validation.valid) {
          results.failed.push({
            url,
            error: validation.error || "Invalid RSS feed",
          });
          continue;
        }

        // Create the feed
        const feedName = name || validation.feed?.title || "Unknown feed";
        const feedId = generateFeedId(feedName);

        await prisma.feed.create({
          data: {
            id: `${feedId}-${Date.now()}`,
            name: feedName,
            url: url,
            type: validation.feed?.type || "rss",
            category: category || "folo-import",
            color: null,
            enabled: true,
            userId: user.id,
          },
        });

        results.added.push(url);
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : "Unknown error";
        results.failed.push({ url, error: errorMessage });
      }
    }

    console.log(
      `[Folo Sync] User ${userEmail}: added ${results.added.length}, skipped ${results.skipped.length}, failed ${results.failed.length}`
    );

    return NextResponse.json({
      success: true,
      results,
    });
  } catch (error) {
    console.error("Error syncing feeds:", error);
    return NextResponse.json(
      { error: "Failed to sync feeds" },
      { status: 500 }
    );
  }
}

/**
 * GET /api/feeds/sync
 * Get all synced feeds for a user (for daemon to check what's already synced)
 */
export async function GET(request: NextRequest) {
  try {
    const apiKey = request.headers.get("x-api-key");
    const expectedKey = process.env.FOLO_SYNC_API_KEY;

    if (!expectedKey || !apiKey || apiKey !== expectedKey) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userEmail = request.headers.get("x-user-email");
    if (!userEmail) {
      return NextResponse.json(
        { error: "User email required" },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { email: userEmail },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const feeds = await prisma.feed.findMany({
      where: { userId: user.id },
      select: { url: true, name: true, category: true },
    });

    return NextResponse.json({
      feeds: feeds.map((f) => f.url),
      count: feeds.length,
    });
  } catch (error) {
    console.error("Error fetching synced feeds:", error);
    return NextResponse.json(
      { error: "Failed to fetch feeds" },
      { status: 500 }
    );
  }
}
