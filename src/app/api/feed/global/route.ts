import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

// Serve the pre-computed global news feed instantly
// This data is refreshed by the cron job every 2 minutes
export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    // Get optional pagination params
    const searchParams = request.nextUrl.searchParams;
    const limit = Math.min(parseInt(searchParams.get("limit") || "40"), 200);
    const offset = parseInt(searchParams.get("offset") || "0");

    // Fetch pre-computed feed from database
    const cache = await prisma.globalFeedCache.findUnique({
      where: { id: "global" },
    });

    if (!cache) {
      // No cache exists yet - return empty with flag to trigger client-side fetch
      return NextResponse.json({
        items: [],
        itemCount: 0,
        sourceCount: 0,
        lastUpdated: null,
        cached: false,
        message: "Feed cache not initialized. Run /api/cron/refresh to populate.",
      });
    }

    // Parse cached items
    const allItems = JSON.parse(cache.items);

    // Apply pagination
    const paginatedItems = allItems.slice(offset, offset + limit);
    const hasMore = offset + limit < allItems.length;

    // Calculate cache age
    const cacheAgeMs = Date.now() - cache.lastUpdated.getTime();
    const cacheAgeMinutes = Math.round(cacheAgeMs / 60000);

    return NextResponse.json({
      items: paginatedItems,
      itemCount: cache.itemCount,
      sourceCount: cache.sourceCount,
      lastUpdated: cache.lastUpdated.toISOString(),
      cached: true,
      cacheAge: `${cacheAgeMinutes} min`,
      pagination: {
        offset,
        limit,
        hasMore,
        total: allItems.length,
      },
    });
  } catch (error) {
    console.error("Error fetching global feed:", error);
    return NextResponse.json(
      { error: "Failed to fetch feed", details: error instanceof Error ? error.message : "Unknown" },
      { status: 500 }
    );
  }
}
