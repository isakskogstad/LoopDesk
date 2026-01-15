import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import {
  getProtocolSearches,
  getProtocolPurchases,
} from "@/lib/protocols";

/**
 * GET /api/protocols
 *
 * Get protocols from two sources:
 * 1. ProtocolPurchase - Purchased and AI-analyzed protocols from LoopLoot
 * 2. ProtocolSearch - Discovered protocols from Bolagsverket (not yet purchased)
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

    // Fetch both purchased/analyzed protocols AND discovered protocols
    const [purchasesResult, searchesResult] = await Promise.all([
      getProtocolPurchases(filter),
      getProtocolSearches(filter),
    ]);

    return NextResponse.json({
      protocols: purchasesResult.protocols,
      protocolSearches: searchesResult.protocolSearches,
      total: purchasesResult.total + searchesResult.total,
      nextCursor: purchasesResult.nextCursor || searchesResult.nextCursor,
      hasMore: purchasesResult.hasMore || searchesResult.hasMore,
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
