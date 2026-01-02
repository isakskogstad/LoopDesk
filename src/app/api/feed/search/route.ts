import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get("q");
    const limit = parseInt(searchParams.get("limit") || "20");

    if (!query || query.trim().length === 0) {
      return NextResponse.json({ items: [], count: 0 });
    }

    const searchTerm = query.trim();

    // Search in title, description, and content
    const items = await prisma.article.findMany({
      where: {
        OR: [
          {
            title: {
              contains: searchTerm,
              mode: "insensitive",
            },
          },
          {
            description: {
              contains: searchTerm,
              mode: "insensitive",
            },
          },
          {
            content: {
              contains: searchTerm,
              mode: "insensitive",
            },
          },
        ],
      },
      orderBy: {
        publishedAt: "desc",
      },
      take: limit,
    });

    // Transform to match NewsItem format
    const transformedItems = items.map((item) => ({
      id: item.id,
      title: item.title,
      description: item.description || item.content?.substring(0, 200) || "",
      url: item.url,
      publishedAt: item.publishedAt.toISOString(),
      imageUrl: item.imageUrl,
      author: item.author,
      tags: [],
      source: {
        id: item.sourceId,
        name: item.sourceName,
        url: "",
        color: item.sourceColor || "#6366f1",
        logoUrl: null,
      },
    }));

    return NextResponse.json({
      items: transformedItems,
      count: transformedItems.length,
    });
  } catch (error) {
    console.error("Search error:", error);
    return NextResponse.json(
      { error: "Failed to search news items" },
      { status: 500 }
    );
  }
}
