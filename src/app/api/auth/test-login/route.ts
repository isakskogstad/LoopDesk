import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/db";

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();

    console.log("[test-login] Testing:", email);

    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
      select: { id: true, email: true, passwordHash: true, name: true }
    });

    if (!user) {
      return NextResponse.json({
        success: false,
        step: "user_lookup",
        error: "User not found"
      });
    }

    if (!user.passwordHash) {
      return NextResponse.json({
        success: false,
        step: "password_check",
        error: "No password hash stored"
      });
    }

    const isValid = await bcrypt.compare(password, user.passwordHash);

    return NextResponse.json({
      success: isValid,
      step: "bcrypt_compare",
      user: { id: user.id, email: user.email, name: user.name },
      hashPrefix: user.passwordHash.substring(0, 20)
    });

  } catch (error) {
    console.error("[test-login] Error:", error);
    return NextResponse.json({
      success: false,
      step: "exception",
      error: String(error)
    }, { status: 500 });
  }
}
