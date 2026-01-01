import { NextResponse } from "next/server";

// RSSHub instances to check (ordered by reliability)
const RSSHUB_INSTANCES = [
  { url: process.env.RSSHUB_URL || "http://localhost:1200", name: "Lokal" },
  { url: "https://rsshub.rssforever.com", name: "rssforever" },
  { url: "https://hub.slarker.me", name: "slarker" },
  { url: "https://rsshub.liumingye.cn", name: "liumingye" },
  { url: "https://rsshub.app", name: "rsshub.app (begränsad)" },
];

interface InstanceStatus {
  url: string;
  name: string;
  status: "online" | "offline" | "slow";
  latency?: number;
  version?: string;
  error?: string;
}

async function checkInstance(instance: { url: string; name: string }): Promise<InstanceStatus> {
  const start = Date.now();

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 5000);

    const response = await fetch(`${instance.url}/`, {
      signal: controller.signal,
      headers: { "Accept": "application/json" },
    });

    clearTimeout(timeout);
    const latency = Date.now() - start;

    if (!response.ok) {
      return {
        ...instance,
        status: "offline",
        latency,
        error: `HTTP ${response.status}`,
      };
    }

    // Try to parse version from response
    let version: string | undefined;
    try {
      const text = await response.text();
      // RSSHub returns HTML with version in title or JSON
      const versionMatch = text.match(/RSSHub\s*([\d.]+)?/i);
      if (versionMatch) {
        version = versionMatch[1] || "unknown";
      }
    } catch {
      // Ignore parse errors
    }

    return {
      ...instance,
      status: latency > 2000 ? "slow" : "online",
      latency,
      version,
    };
  } catch (error) {
    return {
      ...instance,
      status: "offline",
      latency: Date.now() - start,
      error: error instanceof Error ? error.message : "Connection failed",
    };
  }
}

export async function GET() {
  try {
    // Check all instances in parallel
    const statuses = await Promise.all(RSSHUB_INSTANCES.map(checkInstance));

    // Find the best available instance
    const onlineInstances = statuses.filter(s => s.status === "online");
    const recommended = onlineInstances.length > 0
      ? onlineInstances.reduce((a, b) => (a.latency || 9999) < (b.latency || 9999) ? a : b)
      : null;

    return NextResponse.json({
      instances: statuses,
      recommended: recommended?.url,
      localConfigured: !!process.env.RSSHUB_URL,
      localUrl: process.env.RSSHUB_URL || "http://localhost:1200",
    });
  } catch (error) {
    console.error("RSSHub status check failed:", error);
    return NextResponse.json(
      { error: "Failed to check RSSHub status" },
      { status: 500 }
    );
  }
}
