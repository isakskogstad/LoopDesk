import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { syncFromFreshRSS, getSyncState } from "@/lib/nyheter";
import { checkFreshRSSHealth } from "@/lib/freshrss";

/**
 * POST /api/nyheter/sync
 *
 * Manually trigger a sync from FreshRSS
 */
export async function POST() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check FreshRSS health first
    const health = await checkFreshRSSHealth();
    if (!health.connected) {
      return NextResponse.json(
        {
          error: "FreshRSS is not available",
          details: health.error,
        },
        { status: 503 }
      );
    }

    // Perform sync
    const result = await syncFromFreshRSS();

    return NextResponse.json({
      success: true,
      synced: result.synced,
      errors: result.errors,
      lastItemId: result.lastItemId,
    });
  } catch (error) {
    console.error("Error syncing from FreshRSS:", error);
    return NextResponse.json(
      { error: "Failed to sync from FreshRSS" },
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

    const [syncState, health] = await Promise.all([
      getSyncState(),
      checkFreshRSSHealth(),
    ]);

    return NextResponse.json({
      syncState,
      freshRssHealth: health,
    });
  } catch (error) {
    console.error("Error getting sync status:", error);
    return NextResponse.json(
      { error: "Failed to get sync status" },
      { status: 500 }
    );
  }
}
