import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { auth } from "@/auth";
import { prisma } from "@/lib/db";

export async function POST(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Ej inloggad" }, { status: 401 });
    }

    const body = await request.json();
    const { currentPassword, newPassword } = body;

    // Validate input
    if (!currentPassword || !newPassword) {
      return NextResponse.json(
        { error: "Nuvarande och nytt lösenord krävs" },
        { status: 400 }
      );
    }

    if (newPassword.length < 8) {
      return NextResponse.json(
        { error: "Nytt lösenord måste vara minst 8 tecken" },
        { status: 400 }
      );
    }

    // Get user with password hash
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { id: true, passwordHash: true },
    });

    if (!user) {
      return NextResponse.json({ error: "Användare hittades inte" }, { status: 404 });
    }

    // Check if user has a password (might be OAuth-only user)
    if (!user.passwordHash) {
      return NextResponse.json(
        { error: "Du har inget lösenord att byta. Du loggar in via Google." },
        { status: 400 }
      );
    }

    // Verify current password
    const isValid = await bcrypt.compare(currentPassword, user.passwordHash);

    if (!isValid) {
      return NextResponse.json({ error: "Fel nuvarande lösenord" }, { status: 400 });
    }

    // Hash new password
    const newPasswordHash = await bcrypt.hash(newPassword, 12);

    // Update password
    await prisma.user.update({
      where: { id: session.user.id },
      data: { passwordHash: newPasswordHash },
    });

    return NextResponse.json({ message: "Lösenord uppdaterat" });
  } catch (error) {
    console.error("Change password error:", error);
    return NextResponse.json({ error: "Något gick fel" }, { status: 500 });
  }
}
