import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET() {
  const health = {
    status: "ok",
    timestamp: new Date().toISOString(),
    database: "unknown",
    rsshub: "unknown",
  };

  // Check database connection
  try {
    await prisma.$queryRaw`SELECT 1`;
    health.database = "connected";
  } catch (error) {
    health.database = "disconnected";
    health.status = "degraded";
  }

  // Check RSSHub availability
  try {
    const rsshubUrl = process.env.RSSHUB_URL || "https://rsshub.rssforever.com";
    const response = await fetch(`${rsshubUrl}/`, {
      signal: AbortSignal.timeout(5000),
    });
    health.rsshub = response.ok ? "available" : "unavailable";
  } catch {
    health.rsshub = "unavailable";
  }

  return NextResponse.json(health, {
    status: health.status === "ok" ? 200 : 503,
  });
}
