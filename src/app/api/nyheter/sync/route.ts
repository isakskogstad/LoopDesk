import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { syncFromRSS, getSyncState } from "@/lib/nyheter";
import { createRSSClient } from "@/lib/rss/client";

/**
 * POST /api/nyheter/sync
 *
 * Manually trigger a sync from RSS feeds
 */
export async function POST() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Perform sync
    const result = await syncFromRSS();

    return NextResponse.json({
      success: true,
      synced: result.synced,
      errors: result.errors,
      lastItemId: result.lastItemId,
    });
  } catch (error) {
    console.error("Error syncing from RSS:", error);
    return NextResponse.json(
      { error: "Failed to sync from RSS feeds" },
      { status: 500 }
    );
  }
}

/**
 * GET /api/nyheter/sync
 *
 * Get sync status
 */
export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const [syncState, rsshubHealth] = await Promise.all([
      getSyncState(),
      createRSSClient().checkHealth(),
    ]);

    return NextResponse.json({
      syncState,
      rsshubHealth,
    });
  } catch (error) {
    console.error("Error getting sync status:", error);
    return NextResponse.json(
      { error: "Failed to get sync status" },
      { status: 500 }
    );
  }
}
