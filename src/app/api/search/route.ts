import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get("q");
  const limit = parseInt(searchParams.get("limit") || "50");
  const offset = parseInt(searchParams.get("offset") || "0");

  if (!query) {
    return NextResponse.json({ error: "Query parameter 'q' is required" }, { status: 400 });
  }

  try {
    const articles = await prisma.article.findMany({
      where: {
        OR: [
          { title: { contains: query } },
          { description: { contains: query } },
        ],
      },
      orderBy: { publishedAt: "desc" },
      take: limit,
      skip: offset,
    });

    const total = await prisma.article.count({
      where: {
        OR: [
          { title: { contains: query } },
          { description: { contains: query } },
        ],
      },
    });

    return NextResponse.json({
      articles: articles.map(a => ({
        id: a.id,
        title: a.title,
        description: a.description,
        url: a.url,
        imageUrl: a.imageUrl,
        publishedAt: a.publishedAt.toISOString(),
        source: {
          id: a.sourceId,
          name: a.sourceName,
          color: a.sourceColor,
          type: a.sourceType,
        },
      })),
      total,
      hasMore: offset + articles.length < total,
    });
  } catch (error) {
    console.error("Search error:", error);
    return NextResponse.json({ error: "Search failed" }, { status: 500 });
  }
}
