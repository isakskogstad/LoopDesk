import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/db";

const MAX_HISTORY = 8;

// GET - Get search history for current user
export async function GET() {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ history: [] });
    }

    const history = await prisma.searchHistory.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: "desc" },
      take: MAX_HISTORY,
    });

    return NextResponse.json({
      history: history.map((h) => ({
        orgNr: h.query,
        name: h.name || h.query,
        timestamp: h.createdAt.getTime(),
      })),
    });
  } catch (error) {
    console.error("Error fetching search history:", error);
    return NextResponse.json({ error: "Något gick fel" }, { status: 500 });
  }
}

// POST - Add to search history
export async function POST(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Ej inloggad" }, { status: 401 });
    }

    const body = await request.json();
    const { orgNr, name } = body;

    if (!orgNr) {
      return NextResponse.json(
        { error: "orgNr krävs" },
        { status: 400 }
      );
    }

    // Delete existing entry for this org number if it exists
    await prisma.searchHistory.deleteMany({
      where: {
        userId: session.user.id,
        query: orgNr,
      },
    });

    // Add new entry
    const entry = await prisma.searchHistory.create({
      data: {
        query: orgNr,
        name: name || orgNr,
        type: "company",
        userId: session.user.id,
      },
    });

    // Clean up old entries (keep only MAX_HISTORY)
    const allHistory = await prisma.searchHistory.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: "desc" },
      skip: MAX_HISTORY,
    });

    if (allHistory.length > 0) {
      await prisma.searchHistory.deleteMany({
        where: {
          id: { in: allHistory.map((h) => h.id) },
        },
      });
    }

    return NextResponse.json({
      entry: {
        orgNr: entry.query,
        name: entry.name,
        timestamp: entry.createdAt.getTime(),
      },
    });
  } catch (error) {
    console.error("Error adding to search history:", error);
    return NextResponse.json({ error: "Något gick fel" }, { status: 500 });
  }
}

// DELETE - Clear search history
export async function DELETE() {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Ej inloggad" }, { status: 401 });
    }

    await prisma.searchHistory.deleteMany({
      where: { userId: session.user.id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error clearing search history:", error);
    return NextResponse.json({ error: "Något gick fel" }, { status: 500 });
  }
}
