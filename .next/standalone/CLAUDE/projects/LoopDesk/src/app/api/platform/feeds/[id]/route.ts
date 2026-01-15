import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/db";

interface RouteParams {
  params: Promise<{ id: string }>;
}

/**
 * GET /api/platform/feeds/[id]
 * Get a specific platform feed
 */
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;

    const feed = await prisma.feed.findFirst({
      where: {
        id,
        userId: null, // Platform feeds only
      },
    });

    if (!feed) {
      return NextResponse.json(
        { error: "Källa hittades inte" },
        { status: 404 }
      );
    }

    return NextResponse.json({ feed });
  } catch (error) {
    console.error("Error fetching platform feed:", error);
    return NextResponse.json(
      { error: "Failed to fetch feed" },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/platform/feeds/[id]
 * Remove a platform feed (admin only)
 */
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // TODO: Add admin check here if needed

    const { id } = await params;

    // Check if feed exists and is a platform feed
    const feed = await prisma.feed.findFirst({
      where: {
        id,
        userId: null, // Platform feeds only
      },
    });

    if (!feed) {
      return NextResponse.json(
        { error: "Källa hittades inte" },
        { status: 404 }
      );
    }

    // Delete articles from this feed first
    const deletedArticles = await prisma.article.deleteMany({
      where: {
        OR: [
          { feedId: id },
          { sourceId: id },
          { sourceName: feed.name },
        ],
      },
    });

    // Delete the feed
    await prisma.feed.delete({
      where: { id },
    });

    return NextResponse.json({
      success: true,
      message: `${feed.name} har tagits bort (${deletedArticles.count} artiklar)`,
    });
  } catch (error) {
    console.error("Error deleting platform feed:", error);
    return NextResponse.json(
      { error: "Kunde inte ta bort källa" },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/platform/feeds/[id]
 * Update a platform feed (admin only)
 */
export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // TODO: Add admin check here if needed

    const { id } = await params;
    const body = await request.json();
    const { name, category, color, enabled } = body;

    // Check if feed exists and is a platform feed
    const feed = await prisma.feed.findFirst({
      where: {
        id,
        userId: null, // Platform feeds only
      },
    });

    if (!feed) {
      return NextResponse.json(
        { error: "Källa hittades inte" },
        { status: 404 }
      );
    }

    // Update the feed
    const updated = await prisma.feed.update({
      where: { id },
      data: {
        ...(name !== undefined && { name }),
        ...(category !== undefined && { category }),
        ...(color !== undefined && { color }),
        ...(enabled !== undefined && { enabled }),
      },
    });

    return NextResponse.json({
      success: true,
      feed: {
        id: updated.id,
        name: updated.name,
        url: updated.url,
        type: updated.type,
        category: updated.category,
        color: updated.color,
        enabled: updated.enabled,
      },
    });
  } catch (error) {
    console.error("Error updating platform feed:", error);
    return NextResponse.json(
      { error: "Kunde inte uppdatera källa" },
      { status: 500 }
    );
  }
}
