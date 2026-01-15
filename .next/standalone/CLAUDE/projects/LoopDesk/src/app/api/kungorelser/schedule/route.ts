import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { getScheduleState, updateScheduleConfig, getSchedulerLimits } from "@/lib/kungorelser/scheduler";

/**
 * GET /api/kungorelser/schedule
 *
 * Get current schedule state and configuration
 */
export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const state = await getScheduleState();
    const limits = getSchedulerLimits();

    return NextResponse.json({
      schedule: state,
      limits,
    });
  } catch (error) {
    console.error("Error getting schedule state:", error);
    return NextResponse.json(
      { error: "Failed to get schedule state" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/kungorelser/schedule
 *
 * Update schedule configuration
 *
 * Body:
 * - enabled: boolean - Enable/disable scheduled runs
 * - interval: string - Schedule interval (hourly, daily, etc.)
 */
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { enabled, interval } = body;

    const state = await updateScheduleConfig({ enabled, interval });

    return NextResponse.json({
      success: true,
      schedule: state,
    });
  } catch (error) {
    console.error("Error updating schedule:", error);
    return NextResponse.json(
      { error: "Failed to update schedule" },
      { status: 500 }
    );
  }
}
