import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/db";

/**
 * GET /api/nyheter/ignore/terms
 * List ignored terms
 */
export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const terms = await prisma.ignoredTerm.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ terms });
  } catch (error) {
    console.error("Error fetching ignored terms:", error);
    return NextResponse.json({ error: "Failed to fetch ignored terms" }, { status: 500 });
  }
}

/**
 * POST /api/nyheter/ignore/terms
 * Add an ignored term
 */
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const term = typeof body.term === "string" ? body.term.trim() : "";

    if (!term) {
      return NextResponse.json({ error: "Term krävs" }, { status: 400 });
    }

    const ignored = await prisma.ignoredTerm.upsert({
      where: {
        userId_term: {
          userId: session.user.id,
          term: term.toLowerCase(),
        },
      },
      create: {
        userId: session.user.id,
        term: term.toLowerCase(),
      },
      update: {},
    });

    return NextResponse.json({ success: true, term: ignored });
  } catch (error) {
    console.error("Error adding ignored term:", error);
    return NextResponse.json({ error: "Failed to add ignored term" }, { status: 500 });
  }
}

/**
 * DELETE /api/nyheter/ignore/terms
 * Remove an ignored term
 */
export async function DELETE(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const term = typeof body.term === "string" ? body.term.trim() : "";

    if (!term) {
      return NextResponse.json({ error: "Term krävs" }, { status: 400 });
    }

    await prisma.ignoredTerm.delete({
      where: {
        userId_term: {
          userId: session.user.id,
          term: term.toLowerCase(),
        },
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error removing ignored term:", error);
    return NextResponse.json({ error: "Failed to remove ignored term" }, { status: 500 });
  }
}
