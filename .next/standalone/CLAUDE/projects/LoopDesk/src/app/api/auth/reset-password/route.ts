import { NextResponse } from "next/server";
import { z } from "zod";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/db";
import { hashToken } from "@/lib/passwordReset";

const BodySchema = z.object({
  token: z.string().min(10),
  newPassword: z.string().min(10).max(200),
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

  const { token, newPassword } = parsed.data;
  const tokenHash = hashToken(token);

  const record = await prisma.passwordResetToken.findUnique({
    where: { tokenHash },
  });

  if (!record) return NextResponse.json({ error: "Invalid token" }, { status: 400 });
  if (record.usedAt) return NextResponse.json({ error: "Token already used" }, { status: 400 });
  if (record.expiresAt < new Date())
    return NextResponse.json({ error: "Token expired" }, { status: 400 });

  try {
    const passwordHash = await bcrypt.hash(newPassword, 12);

    // Use a transaction to update the password and invalidate all tokens for this user
    await prisma.$transaction([
      prisma.user.update({
        where: { id: record.userId },
        data: { passwordHash },
      }),
      // Invalidate all password reset tokens for this user (not just the current one)
      prisma.passwordResetToken.updateMany({
        where: {
          userId: record.userId,
          usedAt: null,
        },
        data: { usedAt: new Date() },
      }),
    ]);

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Failed to reset password:", error);
    return NextResponse.json(
      { error: "Failed to reset password" },
      { status: 500 },
    );
  }
}
