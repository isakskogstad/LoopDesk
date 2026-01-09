import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import {
  getArticles,
  getSources,
  getArticleStats,
  getGlobalFeed,
  getSyncState,
} from "@/lib/nyheter";

/**
 * GET /api/nyheter
 *
 * Get news articles with optional filtering
 *
 * Query params:
 * - query: Search text
 * - sourceId: Filter by source ID
 * - companyId: Filter by company ID
 * - fromDate: Filter by date (ISO format)
 * - toDate: Filter by date (ISO format)
 * - isRead: Filter by read status (true/false)
 * - isBookmarked: Filter by bookmark status (true/false)
 * - limit: Number of results (default 50, max 100)
 * - cursor: Cursor for pagination
 * - fast: Use global cache for fast response (default true)
 */
export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;

    // Fast path: return from global cache
    const useFastPath =
      searchParams.get("fast") !== "false" &&
      !searchParams.get("query") &&
      !searchParams.get("sourceId") &&
      !searchParams.get("companyId") &&
      !searchParams.get("isRead") &&
      !searchParams.get("isBookmarked") &&
      !searchParams.get("cursor");

    if (useFastPath) {
      const [globalFeed, sources, stats, syncState] = await Promise.all([
        getGlobalFeed(),
        getSources(session.user.id),
        getArticleStats(),
        getSyncState(),
      ]);

      if (globalFeed) {
        // Limit fast path to 30 items, enable pagination
        const limit = 30;
        const items = globalFeed.items.slice(0, limit);
        const hasMore = globalFeed.items.length > limit;
        const nextCursor = hasMore && items.length > 0 ? items[items.length - 1].id : null;

        return NextResponse.json({
          articles: items,
          total: globalFeed.itemCount,
          sources,
          stats,
          syncState: syncState
            ? {
                lastSyncAt: syncState.lastSyncAt,
                totalSynced: syncState.totalSynced,
              }
            : null,
          nextCursor,
          hasMore,
          cached: true,
        });
      }
    }

    // Full query path
    const filter = {
      query: searchParams.get("query") || undefined,
      sourceId: searchParams.get("sourceId") || undefined,
      companyId: searchParams.get("companyId") || undefined,
      fromDate: searchParams.get("fromDate")
        ? new Date(searchParams.get("fromDate")!)
        : undefined,
      toDate: searchParams.get("toDate")
        ? new Date(searchParams.get("toDate")!)
        : undefined,
      isRead:
        searchParams.get("isRead") === "true"
          ? true
          : searchParams.get("isRead") === "false"
            ? false
            : undefined,
      isBookmarked:
        searchParams.get("isBookmarked") === "true"
          ? true
          : searchParams.get("isBookmarked") === "false"
            ? false
            : undefined,
      limit: searchParams.get("limit")
        ? parseInt(searchParams.get("limit")!, 10)
        : 30,
      cursor: searchParams.get("cursor") || undefined,
    };

    const [result, sources, stats] = await Promise.all([
      getArticles(filter),
      getSources(session.user.id),
      getArticleStats(),
    ]);

    return NextResponse.json({
      articles: result.articles,
      total: result.total,
      nextCursor: result.nextCursor,
      hasMore: result.hasMore,
      sources,
      stats,
      cached: false,
    });
  } catch (error) {
    console.error("Error fetching articles:", error);
    return NextResponse.json(
      { error: "Failed to fetch articles" },
      { status: 500 }
    );
  }
}
