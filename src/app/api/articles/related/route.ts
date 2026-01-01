import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(request: NextRequest) {
  const limit = parseInt(new URL(request.url).searchParams.get("limit") || "50");

  try {
    const articles = await prisma.article.findMany({
      where: { titleHash: { not: null } },
      orderBy: { publishedAt: "desc" },
      take: 500,
    });

    const groups = new Map<string, typeof articles>();
    for (const article of articles) {
      if (!article.titleHash) continue;
      const existing = groups.get(article.titleHash) || [];
      existing.push(article);
      groups.set(article.titleHash, existing);
    }

    const relatedGroups = [...groups.entries()]
      .filter(([_, group]) => {
        const sources = new Set(group.map(a => a.sourceId));
        return sources.size > 1;
      })
      .slice(0, limit)
      .map(([hash, group]) => ({
        hash,
        count: group.length,
        articles: group.map(a => ({
          id: a.id,
          title: a.title,
          url: a.url,
          publishedAt: a.publishedAt.toISOString(),
          source: { id: a.sourceId, name: a.sourceName, color: a.sourceColor },
        })),
      }));

    return NextResponse.json({ groups: relatedGroups });
  } catch (error) {
    console.error("Related articles error:", error);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
