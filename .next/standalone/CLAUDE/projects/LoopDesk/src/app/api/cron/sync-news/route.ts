import { NextRequest, NextResponse } from "next/server";
import { syncFromRSS, getSyncState } from "@/lib/nyheter";
import { matchArticlesToCompanies } from "@/lib/nyheter/company-matcher";
import { notifyAllClients } from "@/app/api/nyheter/stream/route";

/**
 * GET /api/cron/sync-news
 *
 * Cron job to sync news from RSS feeds
 * Runs every 15 minutes via Railway cron or external trigger
 *
 * Optional auth via CRON_SECRET header for security
 */
export async function GET(request: NextRequest) {
  try {
    // Optional: verify cron secret
    const cronSecret = process.env.CRON_SECRET;
    if (cronSecret) {
      const authHeader = request.headers.get("authorization");
      if (authHeader !== `Bearer ${cronSecret}`) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }
    }

    // Perform sync from RSS feeds
    console.log("[sync-news] Starting sync from RSS feeds...");
    const syncResult = await syncFromRSS();
    console.log(`[sync-news] Synced ${syncResult.synced} articles, ${syncResult.errors} errors`);

    // Match articles to companies
    if (syncResult.synced > 0) {
      console.log("[sync-news] Matching articles to companies...");
      const matchResult = await matchArticlesToCompanies();
      console.log(`[sync-news] Created ${matchResult.matchesCreated} company matches`);

      // Notify all connected clients about new articles in real-time
      notifyAllClients({ count: syncResult.synced });
      console.log(`[sync-news] Notified SSE clients of ${syncResult.synced} new articles`);
    }

    // Get updated sync state
    const syncState = await getSyncState();

    return NextResponse.json({
      success: true,
      synced: syncResult.synced,
      errors: syncResult.errors,
      lastItemId: syncResult.lastItemId,
      totalSynced: syncState?.totalSynced,
      lastSyncAt: syncState?.lastSyncAt,
    });
  } catch (error) {
    console.error("[sync-news] Error during sync:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
