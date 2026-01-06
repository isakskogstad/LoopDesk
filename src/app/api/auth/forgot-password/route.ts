import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { getResend } from "@/lib/resend";
import { generateResetToken, hashToken } from "@/lib/passwordReset";

const BodySchema = z.object({
  email: z.string().email(),
});

export async function POST(req: Request) {
  const json = await req.json().catch(() => null);
  const parsed = BodySchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Bad request", details: parsed.error.flatten() },
      { status: 400 },
    );
  }

  // Validate required environment variables
  const appUrl = process.env.APP_URL;
  const resendFrom = process.env.RESEND_FROM;
  if (!appUrl || !resendFrom) {
    console.error("Missing required environment variables: APP_URL or RESEND_FROM");
    return NextResponse.json(
      { error: "Server configuration error" },
      { status: 500 },
    );
  }

  const email = parsed.data.email.toLowerCase();
  const user = await prisma.user.findUnique({ where: { email } });

  // Prevent user enumeration - always return success
  if (!user) return NextResponse.json({ ok: true });

  const ttlMinutes = Number(process.env.PASSWORD_RESET_TOKEN_TTL_MINUTES ?? "30");
  const expiresAt = new Date(Date.now() + ttlMinutes * 60 * 1000);

  const token = generateResetToken();
  const tokenHash = hashToken(token);

  try {
    // Invalidate existing unused tokens for this user
    await prisma.passwordResetToken.updateMany({
      where: {
        userId: user.id,
        usedAt: null,
      },
      data: { usedAt: new Date() },
    });

    await prisma.passwordResetToken.create({
      data: { userId: user.id, tokenHash, expiresAt },
    });

    const resetUrl = `${appUrl}/reset-password?token=${encodeURIComponent(token)}`;

    await getResend().emails.send({
      from: resendFrom,
      to: email,
      subject: "Återställ ditt lösenord (LoopDesk)",
      text:
        `Du (eller någon annan) bad om att återställa lösenordet för LoopDesk.\n\n` +
        `Länk (giltig i ${ttlMinutes} minuter):\n${resetUrl}\n\n` +
        `Om du inte bad om detta kan du ignorera mejlet.`,
    });
  } catch (error) {
    // Log error but return success to prevent user enumeration
    console.error("Failed to process password reset request:", error);
  }

  return NextResponse.json({ ok: true });
}
