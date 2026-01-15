import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { markAsRead } from "@/lib/nyheter";

/**
 * POST /api/nyheter/[id]/read
 *
 * Mark an article as read
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const article = await markAsRead(id);

    return NextResponse.json({
      success: true,
      isRead: article.isRead,
    });
  } catch (error) {
    console.error("Error marking as read:", error);
    return NextResponse.json(
      { error: "Failed to mark as read" },
      { status: 500 }
    );
  }
}
