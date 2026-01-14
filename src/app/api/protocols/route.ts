import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import {
  getProtocols,
  getProtocolEventTypes,
  getProtocolStats,
  getProtocolSearches,
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

    // Get event types, stats, and protocol searches
    const [eventTypes, stats, protocolSearchesResult] = await Promise.all([
      getProtocolEventTypes(),
      getProtocolStats(),
      getProtocolSearches({
        query: filter.query,
        fromDate: filter.fromDate,
        toDate: filter.toDate,
        limit: filter.limit,
      }),
    ]);

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
