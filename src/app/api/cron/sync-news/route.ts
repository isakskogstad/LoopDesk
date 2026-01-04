import { NextRequest, NextResponse } from "next/server";
import { syncFromFreshRSS, getSyncState } from "@/lib/nyheter";
import { matchArticlesToCompanies } from "@/lib/nyheter/company-matcher";
import { checkFreshRSSHealth } from "@/lib/freshrss";

/**
 * GET /api/cron/sync-news
 *
 * Cron job to sync news from FreshRSS
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

    // Check FreshRSS health
    const health = await checkFreshRSSHealth();
    if (!health.connected) {
      console.warn("FreshRSS not available, skipping sync:", health.error);
      return NextResponse.json({
        success: false,
        skipped: true,
        reason: "FreshRSS not available",
        error: health.error,
      });
    }

    // Perform sync
    console.log("[sync-news] Starting sync from FreshRSS...");
    const syncResult = await syncFromFreshRSS();
    console.log(`[sync-news] Synced ${syncResult.synced} articles, ${syncResult.errors} errors`);

    // Match articles to companies
    if (syncResult.synced > 0) {
      console.log("[sync-news] Matching articles to companies...");
      const matchResult = await matchArticlesToCompanies();
      console.log(`[sync-news] Created ${matchResult.matchesCreated} company matches`);
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
