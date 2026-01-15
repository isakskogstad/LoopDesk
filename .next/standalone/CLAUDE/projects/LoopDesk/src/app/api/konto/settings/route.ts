import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/db";

export async function GET() {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Ej inloggad" }, { status: 401 });
    }

    // Get or create settings for user
    let settings = await prisma.settings.findUnique({
      where: { userId: session.user.id },
    });

    if (!settings) {
      settings = await prisma.settings.create({
        data: {
          userId: session.user.id,
          darkMode: false,
        },
      });
    }

    return NextResponse.json(settings);
  } catch (error) {
    console.error("Get settings error:", error);
    return NextResponse.json({ error: "Något gick fel" }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Ej inloggad" }, { status: 401 });
    }

    const body = await request.json();
    const { darkMode } = body;

    // Upsert settings
    const settings = await prisma.settings.upsert({
      where: { userId: session.user.id },
      update: {
        ...(darkMode !== undefined && { darkMode }),
      },
      create: {
        userId: session.user.id,
        darkMode: darkMode ?? false,
      },
    });

    return NextResponse.json(settings);
  } catch (error) {
    console.error("Update settings error:", error);
    return NextResponse.json({ error: "Något gick fel" }, { status: 500 });
  }
}
