import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { searchAndSaveAnnouncements } from "@/lib/kungorelser";

/**
 * POST /api/kungorelser/search
 *
 * Search for announcements from Bolagsverket POIT
 *
 * Body:
 * - query: Company name or organization number
 * - skipDetails: Skip fetching detail text (faster but less info)
 * - detailLimit: Limit number of details to fetch
 */
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { query, skipDetails = false, detailLimit } = body;

    if (!query || typeof query !== "string" || query.trim().length < 2) {
      return NextResponse.json(
        { error: "Query must be at least 2 characters" },
        { status: 400 }
      );
    }

    console.log(`Starting announcement search for: ${query}`);

    const announcements = await searchAndSaveAnnouncements(query.trim(), {
      skipDetails,
      detailLimit,
    });

    return NextResponse.json({
      success: true,
      query: query.trim(),
      count: announcements.length,
      announcements,
    });
  } catch (error) {
    console.error("Error searching announcements:", error);
    return NextResponse.json(
      {
        error: "Search failed",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
