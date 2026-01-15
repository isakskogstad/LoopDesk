import { NextRequest, NextResponse } from "next/server";
import { syncAllFoloLists } from "@/lib/folo/sync";

/**
 * GET /api/cron/folo-sync
 *
 * Cron job to sync feeds from Folo lists
 * Runs every hour via Railway cron or external trigger
 *
 * Requires CRON_SECRET header for security
 */
export async function GET(request: NextRequest) {
  try {
    // Verify cron secret
    const cronSecret = process.env.CRON_SECRET;
    if (cronSecret) {
      const authHeader = request.headers.get("authorization");
      if (authHeader !== `Bearer ${cronSecret}`) {
        console.warn("[folo-sync] Unauthorized request");
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }
    }

    console.log("[folo-sync] Starting Folo list sync...");

    const result = await syncAllFoloLists();

    console.log(
      `[folo-sync] Sync complete: ${result.results.length} lists, +${result.totalAdded} ~${result.totalUpdated} -${result.totalDisabled}`
    );

    return NextResponse.json({
      success: true,
      listsProcessed: result.results.length,
      totalAdded: result.totalAdded,
      totalUpdated: result.totalUpdated,
      totalDisabled: result.totalDisabled,
      totalErrors: result.totalErrors,
      duration: result.duration,
      results: result.results.map((r) => ({
        listId: r.listId,
        listName: r.listName,
        added: r.added,
        updated: r.updated,
        disabled: r.disabled,
        errors: r.errors.length,
        duration: r.duration,
      })),
    });
  } catch (error) {
    console.error("[folo-sync] Error during sync:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/cron/folo-sync
 *
 * Manual trigger for Folo sync (same as GET but allows body)
 * Useful for Railway cron which may use POST
 */
export async function POST(request: NextRequest) {
  return GET(request);
}
