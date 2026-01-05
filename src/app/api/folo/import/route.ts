import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { foloClient, type FoloFeed } from "@/lib/folo/client";

/**
 * Extract list ID from a Folo URL
 * Supports formats:
 * - https://app.follow.is/share/lists/123456
 * - https://follow.is/share/lists/123456
 * - 123456 (direct ID)
 */
function extractListId(input: string): string | null {
  // Direct ID (numeric or alphanumeric)
  if (/^[a-zA-Z0-9_-]+$/.test(input) && !input.includes("/")) {
    return input;
  }

  // URL format
  const urlPatterns = [
    /(?:app\.)?follow\.is\/share\/lists\/([a-zA-Z0-9_-]+)/,
    /(?:app\.)?follow\.is\/lists\/([a-zA-Z0-9_-]+)/,
  ];

  for (const pattern of urlPatterns) {
    const match = input.match(pattern);
    if (match?.[1]) {
      return match[1];
    }
  }

  return null;
}

/**
 * Transform Folo feed to LoopDesk feed format
 */
function transformFoloFeed(foloFeed: FoloFeed, foloListId: string) {
  // Store Folo metadata in options JSON
  const options = {
    syncSource: "folo",
    foloListId,
    foloFeedId: foloFeed.id,
    foloImage: foloFeed.image,
    foloSiteUrl: foloFeed.siteUrl,
    lastSyncedAt: new Date().toISOString(),
  };

  return {
    name: foloFeed.title,
    url: foloFeed.url,
    type: "rss" as const,
    category: null,
    color: null,
    enabled: true,
    options: JSON.stringify(options),
  };
}

interface FeedResult {
  id: string;
  name: string;
  url: string;
  type: string;
  category: string | null;
  isNew: boolean;
}

/**
 * GET /api/folo/import?listId={id}
 * Preview feeds that would be imported from a Folo list
 */
export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const listId = searchParams.get("listId");

    if (!listId) {
      return NextResponse.json(
        { error: "listId parameter required" },
        { status: 400 }
      );
    }

    const extractedId = extractListId(listId);
    if (!extractedId) {
      return NextResponse.json(
        { error: "Invalid list ID or URL format" },
        { status: 400 }
      );
    }

    // Fetch feeds from Folo
    const foloFeeds = await foloClient.fetchListFeeds(extractedId);

    // Get existing feeds for this user to mark which are new
    const existingUrls = new Set(
      (
        await prisma.feed.findMany({
          where: { userId: session.user.id },
          select: { url: true },
        })
      ).map((f) => f.url)
    );

    const previewFeeds = foloFeeds.map((feed) => ({
      id: feed.id,
      title: feed.title,
      url: feed.url,
      siteUrl: feed.siteUrl,
      image: feed.image,
      isNew: !existingUrls.has(feed.url),
    }));

    const newCount = previewFeeds.filter((f) => f.isNew).length;
    const existingCount = previewFeeds.length - newCount;

    return NextResponse.json({
      listId: extractedId,
      totalFeeds: foloFeeds.length,
      newFeeds: newCount,
      existingFeeds: existingCount,
      feeds: previewFeeds,
    });
  } catch (error) {
    console.error("Error previewing Folo feeds:", error);

    const message =
      error instanceof Error ? error.message : "Failed to preview Folo feeds";

    return NextResponse.json({ error: message }, { status: 500 });
  }
}

/**
 * POST /api/folo/import
 * Import feeds from a Folo list
 *
 * Body: { listUrl: string } or { listId: string }
 */
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { listUrl, listId } = body;

    // Get list ID from either URL or direct ID
    const input = listUrl || listId;
    if (!input) {
      return NextResponse.json(
        { error: "listUrl or listId required" },
        { status: 400 }
      );
    }

    const extractedId = extractListId(input);
    if (!extractedId) {
      return NextResponse.json(
        { error: "Invalid list ID or URL format" },
        { status: 400 }
      );
    }

    // Fetch feeds from Folo
    const foloFeeds = await foloClient.fetchListFeeds(extractedId);

    if (foloFeeds.length === 0) {
      return NextResponse.json({
        success: true,
        imported: 0,
        feeds: [],
        message: "No feeds found in this list",
      });
    }

    // Upsert each feed
    const results: FeedResult[] = [];

    for (const foloFeed of foloFeeds) {
      const feedData = transformFoloFeed(foloFeed, extractedId);

      // Check if feed already exists for this user
      const existing = await prisma.feed.findFirst({
        where: {
          userId: session.user.id,
          url: foloFeed.url,
        },
      });

      if (existing) {
        // Update existing feed with Folo metadata
        const updated = await prisma.feed.update({
          where: { id: existing.id },
          data: {
            name: feedData.name,
            category: feedData.category || existing.category,
            options: feedData.options,
          },
        });

        results.push({
          id: updated.id,
          name: updated.name,
          url: updated.url,
          type: updated.type,
          category: updated.category,
          isNew: false,
        });
      } else {
        // Create new feed
        const feedId = `folo-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

        const created = await prisma.feed.create({
          data: {
            id: feedId,
            ...feedData,
            userId: session.user.id,
          },
        });

        results.push({
          id: created.id,
          name: created.name,
          url: created.url,
          type: created.type,
          category: created.category,
          isNew: true,
        });
      }
    }

    const newCount = results.filter((r) => r.isNew).length;
    const updatedCount = results.length - newCount;

    return NextResponse.json({
      success: true,
      imported: results.length,
      newFeeds: newCount,
      updatedFeeds: updatedCount,
      listId: extractedId,
      feeds: results,
    });
  } catch (error) {
    console.error("Error importing Folo feeds:", error);

    const message =
      error instanceof Error ? error.message : "Failed to import Folo feeds";

    return NextResponse.json({ error: message }, { status: 500 });
  }
}
