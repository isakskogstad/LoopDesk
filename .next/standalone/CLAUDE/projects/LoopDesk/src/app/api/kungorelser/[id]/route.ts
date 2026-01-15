import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { getAnnouncementById } from "@/lib/kungorelser";

/**
 * GET /api/kungorelser/[id]
 *
 * Get a single announcement by ID
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    if (!id) {
      return NextResponse.json(
        { error: "Announcement ID required" },
        { status: 400 }
      );
    }

    const announcement = await getAnnouncementById(id);

    if (!announcement) {
      return NextResponse.json(
        { error: "Announcement not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(announcement);
  } catch (error) {
    console.error("Error fetching announcement:", error);
    return NextResponse.json(
      { error: "Failed to fetch announcement" },
      { status: 500 }
    );
  }
}
