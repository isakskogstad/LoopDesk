import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

function escapeXml(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

function parseOPML(xml: string): { name: string; url: string }[] {
  const feeds: { name: string; url: string }[] = [];
  const regex = /<outline[^>]+xmlUrl=["']([^"']+)["'][^>]*(?:text|title)=["']([^"']+)["'][^>]*\/?>/gi;
  const regex2 = /<outline[^>]+(?:text|title)=["']([^"']+)["'][^>]*xmlUrl=["']([^"']+)["'][^>]*\/?>/gi;

  let match;
  while ((match = regex.exec(xml)) !== null) {
    feeds.push({ url: match[1], name: match[2] });
  }
  while ((match = regex2.exec(xml)) !== null) {
    feeds.push({ url: match[2], name: match[1] });
  }

  return [...new Map(feeds.map(f => [f.url, f])).values()];
}

export async function GET() {
  try {
    const feeds = await prisma.feed.findMany({ where: { enabled: true } });
    const outlines = feeds
      .map(f => '      <outline type="rss" text="' + escapeXml(f.name) + '" title="' + escapeXml(f.name) + '" xmlUrl="' + escapeXml(f.url) + '" />')
      .join("\n");

    const opml = '<?xml version="1.0" encoding="UTF-8"?>\n<opml version="2.0">\n  <head>\n    <title>Nyhetsflödet Export</title>\n    <dateCreated>' + new Date().toISOString() + '</dateCreated>\n  </head>\n  <body>\n    <outline text="Nyhetsflödet" title="Nyhetsflödet">\n' + outlines + '\n    </outline>\n  </body>\n</opml>';

    return new NextResponse(opml, {
      headers: {
        "Content-Type": "application/xml",
        "Content-Disposition": 'attachment; filename="nyhetsflödet.opml"',
      },
    });
  } catch (error) {
    console.error("OPML export error:", error);
    return NextResponse.json({ error: "Export failed" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const text = await request.text();
    const feeds = parseOPML(text);

    let imported = 0;
    for (const feed of feeds) {
      try {
        // Check if feed already exists (global feed without userId)
        const existing = await prisma.feed.findFirst({
          where: { url: feed.url, userId: null },
        });

        if (existing) {
          await prisma.feed.update({
            where: { id: existing.id },
            data: { name: feed.name },
          });
        } else {
          await prisma.feed.create({
            data: { name: feed.name, url: feed.url, type: "rss", enabled: true, userId: null },
          });
        }
        imported++;
      } catch {
        // Skip errors
      }
    }

    return NextResponse.json({ imported, total: feeds.length });
  } catch (error) {
    console.error("OPML import error:", error);
    return NextResponse.json({ error: "Import failed" }, { status: 500 });
  }
}
