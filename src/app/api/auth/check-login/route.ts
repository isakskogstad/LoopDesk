import { NextRequest, NextResponse } from "next/server";
import { checkLoginAttempt, getErrorMessage } from "@/lib/auth/rate-limit";

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json(
        { allowed: false, message: "E-postadress krävs" },
        { status: 400 }
      );
    }

    const result = await checkLoginAttempt(email.toLowerCase());

    if (!result.allowed) {
      return NextResponse.json({
        allowed: false,
        error: result.error,
        message: getErrorMessage(result.error, result),
        ...(result.retryAfterSeconds && { retryAfterSeconds: result.retryAfterSeconds }),
        ...(result.lockoutMinutes && { lockoutMinutes: result.lockoutMinutes }),
      });
    }

    return NextResponse.json({
      allowed: true,
      remainingAttempts: result.remainingAttempts,
    });
  } catch (error) {
    console.error("[API] check-login error:", error);
    return NextResponse.json(
      { allowed: true }, // Fail open
      { status: 500 }
    );
  }
}
