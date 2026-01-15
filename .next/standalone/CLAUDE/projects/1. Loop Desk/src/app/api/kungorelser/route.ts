import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { getAnnouncements, getAnnouncementsCursor, getAnnouncementTypes, getScrapeStats } from "@/lib/kungorelser";

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
 * - cursor: Cursor for pagination (use instead of offset)
 * - offset: Pagination offset (deprecated, use cursor instead)
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
      cursor: searchParams.get("cursor") || undefined,
      offset: searchParams.get("offset")
        ? parseInt(searchParams.get("offset")!, 10)
        : 0,
    };

    // Use cursor-based pagination if cursor is provided, otherwise fall back to offset
    const useCursor = Boolean(filter.cursor) || !searchParams.has("offset");

    let result;
    if (useCursor) {
      result = await getAnnouncementsCursor(filter);
    } else {
      // Legacy offset-based pagination
      const { announcements, total } = await getAnnouncements(filter);
      const hasMore = (filter.offset || 0) + announcements.length < total;
      result = { announcements, total, nextCursor: null, hasMore };
    }

    // Get types and stats for sidebar
    const [types, stats] = await Promise.all([
      getAnnouncementTypes(),
      getScrapeStats(),
    ]);

    return NextResponse.json({
      ...result,
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
