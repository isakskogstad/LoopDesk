import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

// Vercel Cron job to refresh feeds
// Runs every 5 minutes in production
export async function GET(request: NextRequest) {
  // Verify cron secret in production
  const authHeader = request.headers.get("authorization");
  if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // Get all enabled feeds
    const feeds = await prisma.feed.findMany({
      where: { enabled: true },
    });

    // Clear expired cache entries
    const now = new Date();
    await prisma.feedCache.deleteMany({
      where: {
        expiresAt: { lt: now },
      },
    });

    // Log the refresh
    console.log(`Cron: Cleared expired cache, ${feeds.length} feeds active`);

    return NextResponse.json({
      success: true,
      feedCount: feeds.length,
      timestamp: now.toISOString(),
    });
  } catch (error) {
    console.error("Cron refresh error:", error);
    return NextResponse.json(
      { error: "Failed to refresh feeds" },
      { status: 500 }
    );
  }
}

// Allow both GET and POST for flexibility
export async function POST(request: NextRequest) {
  return GET(request);
}
