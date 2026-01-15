import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { stopScheduledRun } from "@/lib/kungorelser/scheduler";

/**
 * POST /api/kungorelser/schedule/stop
 *
 * Stop the current scheduled run
 */
export async function POST() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const result = await stopScheduledRun();

    if (result.success) {
      return NextResponse.json({
        success: true,
        message: result.message,
      });
    } else {
      return NextResponse.json(
        { error: result.message },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error("Error stopping scheduled run:", error);
    return NextResponse.json(
      { error: "Failed to stop scheduled run" },
      { status: 500 }
    );
  }
}
