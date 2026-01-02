import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { defaultFeeds } from "@/lib/nyheter/feeds";

// Seed default feeds into database (run once)
export async function POST(request: NextRequest) {
  try {
    // Simple auth check
    const authHeader = request.headers.get("authorization");
    if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    console.log("🌱 Seeding default feeds...");

    // Get existing global feeds
    const existingFeeds = await prisma.feed.findMany({
      where: { userId: null },
    });

    const existingUrls = new Set(existingFeeds.map((f) => f.url));

    // Filter out feeds that already exist
    const newFeeds = defaultFeeds.filter((feed) => !existingUrls.has(feed.url));

    if (newFeeds.length === 0) {
      return NextResponse.json({
        success: true,
        message: "All default feeds already exist",
        existingCount: existingFeeds.length,
      });
    }

    // Insert new feeds
    const result = await prisma.feed.createMany({
      data: newFeeds.map((feed) => ({
        id: feed.id,
        name: feed.name,
        url: feed.url,
        type: feed.type,
        category: feed.category || "general",
        color: feed.color || "#666666",
        enabled: feed.enabled !== false,
        tags: feed.tags ? JSON.stringify(feed.tags) : null,
        options: feed.options ? JSON.stringify(feed.options) : null,
        userId: null, // Global feeds
      })),
      skipDuplicates: true,
    });

    console.log(`✅ Seeded ${result.count} default feeds`);

    return NextResponse.json({
      success: true,
      seeded: result.count,
      totalGlobalFeeds: existingFeeds.length + result.count,
    });
  } catch (error) {
    console.error("Error seeding feeds:", error);
    return NextResponse.json(
      { error: "Failed to seed feeds", details: error instanceof Error ? error.message : "Unknown" },
      { status: 500 }
    );
  }
}

// Also allow GET for easier testing
export async function GET() {
  return POST(new NextRequest("http://localhost"));
}
