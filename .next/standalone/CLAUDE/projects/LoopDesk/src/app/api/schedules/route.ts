import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

// GET /api/schedules - List all schedules
// GET /api/schedules?widgetType=vinnova - Filter by widget type
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const widgetType = searchParams.get("widgetType");

    const where = widgetType ? { widgetType } : {};

    const schedules = await prisma.widgetSchedule.findMany({
      where,
      orderBy: { createdAt: "asc" },
    });

    return NextResponse.json({ schedules });
  } catch (error) {
    console.error("Error fetching schedules:", error);
    return NextResponse.json(
      { error: "Failed to fetch schedules" },
      { status: 500 }
    );
  }
}

// POST /api/schedules - Create a new schedule
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, widgetType, frequency, time, dayOfWeek, isActive } = body;

    if (!name || !widgetType || !frequency || !time) {
      return NextResponse.json(
        { error: "Missing required fields: name, widgetType, frequency, time" },
        { status: 400 }
      );
    }

    if (!["vinnova", "allabolag"].includes(widgetType)) {
      return NextResponse.json(
        { error: "widgetType must be 'vinnova' or 'allabolag'" },
        { status: 400 }
      );
    }

    if (!["daily", "weekdays", "weekly"].includes(frequency)) {
      return NextResponse.json(
        { error: "frequency must be 'daily', 'weekdays', or 'weekly'" },
        { status: 400 }
      );
    }

    const schedule = await prisma.widgetSchedule.create({
      data: {
        name,
        widgetType,
        frequency,
        time,
        dayOfWeek: dayOfWeek ?? null,
        isActive: isActive ?? true,
      },
    });

    return NextResponse.json({ schedule }, { status: 201 });
  } catch (error) {
    console.error("Error creating schedule:", error);
    return NextResponse.json(
      { error: "Failed to create schedule" },
      { status: 500 }
    );
  }
}

// PUT /api/schedules - Update a schedule
export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { id, ...data } = body;

    if (!id) {
      return NextResponse.json(
        { error: "Missing schedule id" },
        { status: 400 }
      );
    }

    const schedule = await prisma.widgetSchedule.update({
      where: { id },
      data,
    });

    return NextResponse.json({ schedule });
  } catch (error) {
    console.error("Error updating schedule:", error);
    return NextResponse.json(
      { error: "Failed to update schedule" },
      { status: 500 }
    );
  }
}

// DELETE /api/schedules - Delete a schedule
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { error: "Missing schedule id" },
        { status: 400 }
      );
    }

    await prisma.widgetSchedule.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting schedule:", error);
    return NextResponse.json(
      { error: "Failed to delete schedule" },
      { status: 500 }
    );
  }
}
