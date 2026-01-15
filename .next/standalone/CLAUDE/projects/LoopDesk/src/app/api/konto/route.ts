import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/db";

export async function GET() {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Ej inloggad" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        image: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) {
      return NextResponse.json({ error: "Användare hittades inte" }, { status: 404 });
    }

    return NextResponse.json(user);
  } catch (error) {
    console.error("Get profile error:", error);
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
    const { name, phone } = body;

    // Validate name
    if (name !== undefined && (typeof name !== "string" || name.length > 100)) {
      return NextResponse.json({ error: "Ogiltigt namn" }, { status: 400 });
    }

    // Validate phone (optional, basic validation)
    if (phone !== undefined && phone !== null && phone !== "") {
      if (typeof phone !== "string" || phone.length > 20) {
        return NextResponse.json({ error: "Ogiltigt telefonnummer" }, { status: 400 });
      }
      // Basic phone validation: must start with + or digit
      if (!/^[+\d]/.test(phone)) {
        return NextResponse.json({ error: "Telefonnummer måste börja med + eller siffra" }, { status: 400 });
      }
    }

    const updatedUser = await prisma.user.update({
      where: { id: session.user.id },
      data: {
        ...(name !== undefined && { name: name || null }),
        ...(phone !== undefined && { phone: phone || null }),
      },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        image: true,
      },
    });

    return NextResponse.json(updatedUser);
  } catch (error) {
    console.error("Update profile error:", error);
    return NextResponse.json({ error: "Något gick fel" }, { status: 500 });
  }
}
