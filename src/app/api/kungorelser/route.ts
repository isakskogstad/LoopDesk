import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { getAnnouncements, getAnnouncementTypes, getScrapeStats } from "@/lib/kungorelser";

/**
 * GET /api/kungorelser
 *
 * Get announcements with optional filtering
 *
 * Query params:
 * - query: Search text
 * - orgNumber: Filter by organization number
 * - type: Filter by announcement type
 * - fromDate: Filter by date (ISO format)
 * - toDate: Filter by date (ISO format)
 * - limit: Number of results (default 50)
 * - offset: Pagination offset
 */
export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;

    const filter = {
      query: searchParams.get("query") || undefined,
      orgNumber: searchParams.get("orgNumber") || undefined,
      type: searchParams.get("type") || undefined,
      fromDate: searchParams.get("fromDate")
        ? new Date(searchParams.get("fromDate")!)
        : undefined,
      toDate: searchParams.get("toDate")
        ? new Date(searchParams.get("toDate")!)
        : undefined,
      limit: searchParams.get("limit")
        ? parseInt(searchParams.get("limit")!, 10)
        : 50,
      offset: searchParams.get("offset")
        ? parseInt(searchParams.get("offset")!, 10)
        : 0,
    };

    const { announcements, total } = await getAnnouncements(filter);

    // Get types and stats for sidebar
    const [types, stats] = await Promise.all([
      getAnnouncementTypes(),
      getScrapeStats(),
    ]);

    return NextResponse.json({
      announcements,
      total,
      types,
      stats,
      filter,
    });
  } catch (error) {
    console.error("Error fetching announcements:", error);
    return NextResponse.json(
      { error: "Failed to fetch announcements" },
      { status: 500 }
    );
  }
}
