import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import {
  getProtocols,
  getProtocolEventTypes,
  getProtocolStats,
  getProtocolSearches,
  type ProtocolSearchItem,
} from "@/lib/protocols";

/**
 * GET /api/protocols
 *
 * Get analyzed protocol purchases with optional filtering
 *
 * Query params:
 * - query: Search text (company name or AI summary)
 * - orgNumber: Filter by organization number
 * - eventType: Filter by event type (finansiering, ledning, etc.)
 * - fromDate: Filter by protocol date (ISO format)
 * - toDate: Filter by protocol date (ISO format)
 * - limit: Number of results (default 50)
 * - cursor: Cursor for pagination
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
      eventType: searchParams.get("eventType") || undefined,
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
    };

    const result = await getProtocols(filter);

    // Get event types, stats, and protocol searches - fetch separately for better error handling
    let protocolSearchesResult: {
      protocolSearches: ProtocolSearchItem[];
      total: number;
      nextCursor: string | null;
      hasMore: boolean;
    } = { protocolSearches: [], total: 0, nextCursor: null, hasMore: false };
    let eventTypes: string[] = [];
    let stats: { total: number; analyzed: number; byEventType: Record<string, number> } = { total: 0, analyzed: 0, byEventType: {} };

    // Fetch event types
    try {
      eventTypes = await getProtocolEventTypes();
    } catch (err) {
      console.error("[protocols] Error fetching event types:", err);
    }

    // Fetch stats
    try {
      stats = await getProtocolStats();
    } catch (err) {
      console.error("[protocols] Error fetching stats:", err);
    }

    // Fetch protocol searches
    try {
      console.log("[protocols] Fetching protocol searches with filter:", {
        query: filter.query,
        fromDate: filter.fromDate?.toISOString(),
        toDate: filter.toDate?.toISOString(),
        limit: filter.limit,
      });
      protocolSearchesResult = await getProtocolSearches({
        query: filter.query,
        fromDate: filter.fromDate,
        toDate: filter.toDate,
        limit: filter.limit,
      });
      console.log("[protocols] Protocol searches result:", {
        count: protocolSearchesResult.protocolSearches.length,
        total: protocolSearchesResult.total,
        hasMore: protocolSearchesResult.hasMore,
      });
    } catch (err) {
      console.error("[protocols] Error fetching protocol searches:", err);
    }

    return NextResponse.json({
      ...result,
      protocolSearches: protocolSearchesResult.protocolSearches,
      protocolSearchesTotal: protocolSearchesResult.total,
      eventTypes,
      stats,
      filter,
    });
  } catch (error) {
    console.error("Error fetching protocols:", error);
    return NextResponse.json(
      { error: "Failed to fetch protocols" },
      { status: 500 }
    );
  }
}
