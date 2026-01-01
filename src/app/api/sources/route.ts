import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

// GET - Get all sources from database
export async function GET() {
  try {
    const feeds = await prisma.feed.findMany({
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

// POST - Add a new source
export async function POST(request: NextRequest) {
  try {
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
        { error: "A source with this URL already exists" },
        { status: 409 }
      );
    }
    return NextResponse.json(
      { error: "Failed to create source" },
      { status: 500 }
    );
  }
}

// PUT - Update a source
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, name, url, type, category, color, enabled, tags, options } = body;

    if (!id) {
      return NextResponse.json(
        { error: "id is required" },
        { status: 400 }
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

// DELETE - Delete a source
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { error: "id is required" },
        { status: 400 }
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
