import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/db";

/**
 * GET /api/nyheter/ignore/sources
 * List ignored sources
 */
export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const sources = await prisma.ignoredSource.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ sources });
  } catch (error) {
    console.error("Error fetching ignored sources:", error);
    return NextResponse.json({ error: "Failed to fetch ignored sources" }, { status: 500 });
  }
}

/**
 * POST /api/nyheter/ignore/sources
 * Add an ignored source
 */
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const sourceId = typeof body.sourceId === "string" ? body.sourceId.trim() : "";

    if (!sourceId) {
      return NextResponse.json({ error: "sourceId krävs" }, { status: 400 });
    }

    const ignored = await prisma.ignoredSource.upsert({
      where: {
        userId_sourceId: {
          userId: session.user.id,
          sourceId,
        },
      },
      create: {
        userId: session.user.id,
        sourceId,
      },
      update: {},
    });

    return NextResponse.json({ success: true, source: ignored });
  } catch (error) {
    console.error("Error adding ignored source:", error);
    return NextResponse.json({ error: "Failed to add ignored source" }, { status: 500 });
  }
}

/**
 * DELETE /api/nyheter/ignore/sources
 * Remove an ignored source
 */
export async function DELETE(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const sourceId = typeof body.sourceId === "string" ? body.sourceId.trim() : "";

    if (!sourceId) {
      return NextResponse.json({ error: "sourceId krävs" }, { status: 400 });
    }

    await prisma.ignoredSource.delete({
      where: {
        userId_sourceId: {
          userId: session.user.id,
          sourceId,
        },
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error removing ignored source:", error);
    return NextResponse.json({ error: "Failed to remove ignored source" }, { status: 500 });
  }
}
