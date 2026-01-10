import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET() {
  try {
    // Get database info
    const result = await prisma.$queryRaw<{ current_database: string; version: string }[]>`
      SELECT current_database() as current_database, version() as version
    `;

    // Get connection string info (masked)
    const dbUrl = process.env.DATABASE_URL || "NOT SET";
    const maskedUrl = dbUrl.replace(/:[^:@]+@/, ":***@");

    // Count users
    const userCount = await prisma.user.count();

    // Get sample user
    const sampleUser = await prisma.user.findFirst({
      select: { email: true, name: true }
    });

    return NextResponse.json({
      database: result[0]?.current_database,
      postgresVersion: result[0]?.version?.substring(0, 50),
      connectionString: maskedUrl.substring(0, 80),
      userCount,
      sampleUser,
      env: process.env.NODE_ENV
    });
  } catch (error) {
    return NextResponse.json({
      error: String(error)
    }, { status: 500 });
  }
}
