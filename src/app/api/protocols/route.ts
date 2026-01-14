import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import {
  getProtocolSearches,
  type ProtocolSearchItem,
} from "@/lib/protocols";

/**
 * GET /api/protocols
 *
 * Get protocol searches (discovered protocols from Bolagsverket)
 *
 * Query params:
 * - query: Search text (company name or org number)
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

    // Fetch protocol searches from protocol_searches table
    const result = await getProtocolSearches(filter);

    return NextResponse.json({
      protocols: [], // No analyzed protocols (ProtocolPurchase table doesn't exist)
      protocolSearches: result.protocolSearches,
      total: result.total,
      nextCursor: result.nextCursor,
      hasMore: result.hasMore,
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
