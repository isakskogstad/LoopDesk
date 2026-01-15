import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/db";

// GET - Get all favorites for current user
export async function GET() {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ favorites: [] });
    }

    const favorites = await prisma.companyFavorite.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({
      favorites: favorites.map((f) => ({
        orgNumber: f.orgNumber,
        name: f.name,
      })),
    });
  } catch (error) {
    console.error("Error fetching favorites:", error);
    return NextResponse.json({ error: "Något gick fel" }, { status: 500 });
  }
}

// POST - Add a favorite
export async function POST(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Ej inloggad" }, { status: 401 });
    }

    const body = await request.json();
    const { orgNumber, name } = body;

    if (!orgNumber || !name) {
      return NextResponse.json(
        { error: "orgNumber och name krävs" },
        { status: 400 }
      );
    }

    const favorite = await prisma.companyFavorite.create({
      data: {
        orgNumber,
        name,
        userId: session.user.id,
      },
    });

    return NextResponse.json({
      favorite: {
        orgNumber: favorite.orgNumber,
        name: favorite.name,
      },
    });
  } catch (error) {
    console.error("Error adding favorite:", error);
    if (error instanceof Error && error.message.includes("Unique constraint")) {
      return NextResponse.json(
        { error: "Företaget är redan en favorit" },
        { status: 409 }
      );
    }
    return NextResponse.json({ error: "Något gick fel" }, { status: 500 });
  }
}

// DELETE - Remove a favorite
export async function DELETE(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Ej inloggad" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const orgNumber = searchParams.get("orgNumber");

    if (!orgNumber) {
      return NextResponse.json(
        { error: "orgNumber krävs" },
        { status: 400 }
      );
    }

    await prisma.companyFavorite.deleteMany({
      where: {
        userId: session.user.id,
        orgNumber,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error removing favorite:", error);
    return NextResponse.json({ error: "Något gick fel" }, { status: 500 });
  }
}
