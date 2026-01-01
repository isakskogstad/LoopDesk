import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/db";

// GET - Get all sources for the current user
export async function GET() {
  try {
    const session = await auth();
    const userId = session?.user?.id;

    // Get user's feeds and global feeds (userId is null)
    const feeds = await prisma.feed.findMany({
      where: {
        OR: [
          { userId: userId || "___none___" }, // User's own feeds
          { userId: null }, // Global feeds
        ],
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({
      feeds: feeds.map((feed) => ({
        ...feed,
        tags: feed.tags ? JSON.parse(feed.tags) : [],
        options: feed.options ? JSON.parse(feed.options) : undefined,
      })),
    });
  } catch (error) {
    console.error("Error fetching sources:", error);
    return NextResponse.json(
      { error: "Failed to fetch sources" },
      { status: 500 }
    );
  }
}

// POST - Add a new source for the current user
export async function POST(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Ej inloggad" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { name, url, type, category, color, enabled, tags, options } = body;

    if (!name || !url || !type) {
      return NextResponse.json(
        { error: "name, url, and type are required" },
        { status: 400 }
      );
    }

    const feed = await prisma.feed.create({
      data: {
        name,
        url,
        type,
        category: category || "general",
        color: color || "#666666",
        enabled: enabled !== false,
        tags: tags ? JSON.stringify(tags) : null,
        options: options ? JSON.stringify(options) : null,
        userId: session.user.id,
      },
    });

    return NextResponse.json({
      feed: {
        ...feed,
        tags: feed.tags ? JSON.parse(feed.tags) : [],
        options: feed.options ? JSON.parse(feed.options) : undefined,
      },
    });
  } catch (error) {
    console.error("Error creating source:", error);
    if (error instanceof Error && error.message.includes("Unique constraint")) {
      return NextResponse.json(
        { error: "Du har redan lagt till denna källa" },
        { status: 409 }
      );
    }
    return NextResponse.json(
      { error: "Failed to create source" },
      { status: 500 }
    );
  }
}

// PUT - Update a source (only if owned by user)
export async function PUT(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Ej inloggad" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { id, name, url, type, category, color, enabled, tags, options } = body;

    if (!id) {
      return NextResponse.json(
        { error: "id is required" },
        { status: 400 }
      );
    }

    // Check ownership
    const existing = await prisma.feed.findUnique({
      where: { id },
    });

    if (!existing) {
      return NextResponse.json(
        { error: "Källan hittades inte" },
        { status: 404 }
      );
    }

    // User can only update their own feeds
    if (existing.userId !== session.user.id) {
      return NextResponse.json(
        { error: "Du kan inte ändra denna källa" },
        { status: 403 }
      );
    }

    const feed = await prisma.feed.update({
      where: { id },
      data: {
        ...(name && { name }),
        ...(url && { url }),
        ...(type && { type }),
        ...(category && { category }),
        ...(color && { color }),
        ...(enabled !== undefined && { enabled }),
        ...(tags && { tags: JSON.stringify(tags) }),
        ...(options && { options: JSON.stringify(options) }),
      },
    });

    return NextResponse.json({
      feed: {
        ...feed,
        tags: feed.tags ? JSON.parse(feed.tags) : [],
        options: feed.options ? JSON.parse(feed.options) : undefined,
      },
    });
  } catch (error) {
    console.error("Error updating source:", error);
    return NextResponse.json(
      { error: "Failed to update source" },
      { status: 500 }
    );
  }
}

// DELETE - Delete a source (only if owned by user)
export async function DELETE(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Ej inloggad" },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { error: "id is required" },
        { status: 400 }
      );
    }

    // Check ownership
    const existing = await prisma.feed.findUnique({
      where: { id },
    });

    if (!existing) {
      return NextResponse.json(
        { error: "Källan hittades inte" },
        { status: 404 }
      );
    }

    // User can only delete their own feeds
    if (existing.userId !== session.user.id) {
      return NextResponse.json(
        { error: "Du kan inte ta bort denna källa" },
        { status: 403 }
      );
    }

    await prisma.feed.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting source:", error);
    return NextResponse.json(
      { error: "Failed to delete source" },
      { status: 500 }
    );
  }
}

// PATCH - Bulk sync sources (for initial migration from localStorage)
export async function PATCH(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Ej inloggad" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { sources } = body;

    if (!Array.isArray(sources)) {
      return NextResponse.json(
        { error: "sources must be an array" },
        { status: 400 }
      );
    }

    // Get existing feeds for this user
    const existingFeeds = await prisma.feed.findMany({
      where: { userId: session.user.id },
    });

    const existingUrls = new Set(existingFeeds.map((f) => f.url));

    // Add new sources that don't already exist
    const newSources = sources.filter(
      (s: { url: string }) => !existingUrls.has(s.url)
    );

    if (newSources.length > 0) {
      await prisma.feed.createMany({
        data: newSources.map((s: { name: string; url: string; type: string; category?: string; color?: string; enabled?: boolean; tags?: string[]; options?: object }) => ({
          name: s.name,
          url: s.url,
          type: s.type,
          category: s.category || "general",
          color: s.color || "#666666",
          enabled: s.enabled !== false,
          tags: s.tags ? JSON.stringify(s.tags) : null,
          options: s.options ? JSON.stringify(s.options) : null,
          userId: session.user.id,
        })),
        skipDuplicates: true,
      });
    }

    // Return all user's feeds
    const feeds = await prisma.feed.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({
      synced: newSources.length,
      feeds: feeds.map((feed) => ({
        ...feed,
        tags: feed.tags ? JSON.parse(feed.tags) : [],
        options: feed.options ? JSON.parse(feed.options) : undefined,
      })),
    });
  } catch (error) {
    console.error("Error syncing sources:", error);
    return NextResponse.json(
      { error: "Failed to sync sources" },
      { status: 500 }
    );
  }
}
