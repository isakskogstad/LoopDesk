import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { runScheduledScrape } from "@/lib/kungorelser/scheduler";

/**
 * POST /api/kungorelser/schedule/run-now
 *
 * Trigger an immediate scheduled run
 */
export async function POST() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const result = await runScheduledScrape();

    if (result.success) {
      return NextResponse.json({
        success: true,
        message: result.message,
      });
    } else {
      return NextResponse.json(
        { error: result.message },
        { status: 409 }  // Conflict - already running
      );
    }
  } catch (error) {
    console.error("Error starting scheduled run:", error);
    return NextResponse.json(
      { error: "Failed to start scheduled run" },
      { status: 500 }
    );
  }
}
