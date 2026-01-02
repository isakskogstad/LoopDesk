import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { proxyManager } from "@/lib/kungorelser/proxy-manager";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

// Track app start time
const startTime = Date.now();

export async function GET() {
  const health = {
    status: "ok",
    timestamp: new Date().toISOString(),
    uptime: Math.floor((Date.now() - startTime) / 1000), // seconds
    database: {
      status: "unknown" as "connected" | "disconnected" | "unknown",
      latency: 0,
    },
    memory: {
      usage: 0,
      usageMB: 0,
      heapUsed: 0,
      heapUsedMB: 0,
      heapTotal: 0,
      heapTotalMB: 0,
      external: 0,
      externalMB: 0,
      rss: 0,
      rssMB: 0,
    },
    proxy: {
      enabled: false,
      active: false,
      total: 0,
      available: 0,
      failed: 0,
      reason: null as string | null,
    },
    rsshub: "unknown" as "available" | "unavailable" | "unknown",
  };

  // Check database connection with latency
  try {
    const dbStart = Date.now();
    await prisma.$queryRaw`SELECT 1`;
    health.database.status = "connected";
    health.database.latency = Date.now() - dbStart;
  } catch (error) {
    health.database.status = "disconnected";
    health.status = "degraded";
  }

  // Memory usage
  try {
    const memUsage = process.memoryUsage();
    health.memory = {
      usage: memUsage.heapUsed / memUsage.heapTotal,
      usageMB: Math.round(memUsage.heapUsed / 1024 / 1024),
      heapUsed: memUsage.heapUsed,
      heapUsedMB: Math.round(memUsage.heapUsed / 1024 / 1024),
      heapTotal: memUsage.heapTotal,
      heapTotalMB: Math.round(memUsage.heapTotal / 1024 / 1024),
      external: memUsage.external,
      externalMB: Math.round(memUsage.external / 1024 / 1024),
      rss: memUsage.rss,
      rssMB: Math.round(memUsage.rss / 1024 / 1024),
    };
  } catch (error) {
    console.error("Failed to get memory usage:", error);
  }

  // Proxy status
  try {
    const proxyStatus = proxyManager.getStatus();
    health.proxy = {
      enabled: process.env.TWOCAPTCHA_API_KEY ? true : false,
      active: proxyStatus.isActive,
      total: proxyStatus.total,
      available: proxyStatus.available,
      failed: proxyStatus.failed,
      reason: proxyStatus.reason,
    };
  } catch (error) {
    console.error("Failed to get proxy status:", error);
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
