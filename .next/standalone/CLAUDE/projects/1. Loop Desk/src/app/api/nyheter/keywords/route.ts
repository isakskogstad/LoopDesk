import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/db";

/**
 * GET /api/nyheter/keywords
 * List user keywords
 */
export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const keywords = await prisma.keyword.findMany({
      where: { userId: session.user.id, isActive: true },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ keywords });
  } catch (error) {
    console.error("Error fetching keywords:", error);
    return NextResponse.json({ error: "Failed to fetch keywords" }, { status: 500 });
  }
}

/**
 * POST /api/nyheter/keywords
 * Create or activate a keyword
 */
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const term = typeof body.term === "string" ? body.term.trim() : "";
    const color = typeof body.color === "string" ? body.color : undefined;

    if (!term) {
      return NextResponse.json({ error: "Term krävs" }, { status: 400 });
    }

    const keyword = await prisma.keyword.upsert({
      where: {
        userId_term: {
          userId: session.user.id,
          term: term.toLowerCase(),
        },
      },
      create: {
        term: term.toLowerCase(),
        color: color || null,
        userId: session.user.id,
        isActive: true,
      },
      update: {
        isActive: true,
        ...(color !== undefined ? { color } : {}),
      },
    });

    return NextResponse.json({ success: true, keyword });
  } catch (error) {
    console.error("Error creating keyword:", error);
    return NextResponse.json({ error: "Failed to create keyword" }, { status: 500 });
  }
}
