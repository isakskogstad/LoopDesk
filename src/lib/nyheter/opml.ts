import type { FeedConfig, OPMLDocument, OPMLOutline, Tag, SourceType } from "@/lib/nyheter/types";

/**
 * Generate OPML XML from feed configurations
 */
export function generateOPML(
  feeds: FeedConfig[],
  tags: Tag[],
  title: string = "Nyhetsflödet Export"
): string {
  const now = new Date().toISOString();

  // Group feeds by tags
  const feedsByTag = new Map<string, FeedConfig[]>();
  const untaggedFeeds: FeedConfig[] = [];

  for (const feed of feeds) {
    if (feed.tags && feed.tags.length > 0) {
      for (const tagId of feed.tags) {
        if (!feedsByTag.has(tagId)) {
          feedsByTag.set(tagId, []);
        }
        feedsByTag.get(tagId)!.push(feed);
      }
    } else {
      untaggedFeeds.push(feed);
    }
  }

  // Build OPML structure
  let opml = `<?xml version="1.0" encoding="UTF-8"?>
<opml version="2.0">
  <head>
    <title>${escapeXml(title)}</title>
    <dateCreated>${now}</dateCreated>
    <docs>http://opml.org/spec2.opml</docs>
  </head>
  <body>
`;

  // Add tagged feeds in folders
  for (const tag of tags) {
    const tagFeeds = feedsByTag.get(tag.id);
    if (tagFeeds && tagFeeds.length > 0) {
      opml += `    <outline text="${escapeXml(tag.name)}" title="${escapeXml(tag.name)}">\n`;
      for (const feed of tagFeeds) {
        opml += feedToOutline(feed, 6);
      }
      opml += `    </outline>\n`;
    }
  }

  // Add untagged feeds at root level
  for (const feed of untaggedFeeds) {
    opml += feedToOutline(feed, 4);
  }

  opml += `  </body>
</opml>`;

  return opml;
}

function feedToOutline(feed: FeedConfig, indent: number): string {
  const spaces = " ".repeat(indent);
  const type = feed.type === "rss" || feed.type === "atom" ? "rss" : feed.type;

  return `${spaces}<outline type="${type}" text="${escapeXml(feed.name)}" title="${escapeXml(feed.name)}" xmlUrl="${escapeXml(feed.url)}" category="${feed.category || "general"}" />\n`;
}

function escapeXml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

/**
 * Parse OPML XML into feed configurations
 */
export function parseOPML(opmlXml: string): { feeds: FeedConfig[]; tags: Tag[] } {
  const feeds: FeedConfig[] = [];
  const tags: Tag[] = [];
  const tagMap = new Map<string, string>(); // name -> id

  // Simple XML parsing using regex (works for OPML structure)
  const outlineRegex = /<outline([^>]+)(?:\/>|>[\s\S]*?<\/outline>)/gi;
  const attrRegex = /(\w+)=["']([^"']+)["']/g;

  let currentFolder: string | null = null;

  // First pass: find folders (outlines with children)
  const folderRegex = /<outline[^>]+text=["']([^"']+)["'][^>]*>[\s\S]*?<\/outline>/gi;
  let folderMatch;

  while ((folderMatch = folderRegex.exec(opmlXml)) !== null) {
    const folderContent = folderMatch[0];
    const textMatch = folderContent.match(/text=["']([^"']+)["']/);

    // Check if this outline has children (is a folder)
    if (textMatch && folderContent.includes("<outline")) {
      const folderName = textMatch[1];
      const tagId = generateTagId(folderName);

      if (!tagMap.has(folderName)) {
        tagMap.set(folderName, tagId);
        tags.push({
          id: tagId,
          name: folderName,
          color: generateColor(folderName),
          feedIds: [],
        });
      }
    }
  }

  // Second pass: extract all feed outlines
  const feedOutlineRegex = /<outline[^>]+xmlUrl=["']([^"']+)["'][^>]*\/?>/gi;
  let feedMatch;

  while ((feedMatch = feedOutlineRegex.exec(opmlXml)) !== null) {
    const outlineStr = feedMatch[0];
    const attrs: Record<string, string> = {};

    let attrMatch;
    while ((attrMatch = attrRegex.exec(outlineStr)) !== null) {
      attrs[attrMatch[1].toLowerCase()] = attrMatch[2];
    }

    if (attrs.xmlurl) {
      const feedId = generateFeedId(attrs.xmlurl);
      const feedName = attrs.title || attrs.text || new URL(attrs.xmlurl).hostname;

      // Determine which folder this feed is in
      const feedTags: string[] = [];
      for (const [tagName, tagId] of tagMap) {
        // Check if this outline is within a folder
        const folderPattern = new RegExp(
          `<outline[^>]+text=["']${escapeRegex(tagName)}["'][^>]*>[\\s\\S]*?${escapeRegex(outlineStr)}`,
          "i"
        );
        if (folderPattern.test(opmlXml)) {
          feedTags.push(tagId);
          const tag = tags.find((t) => t.id === tagId);
          if (tag) {
            tag.feedIds.push(feedId);
          }
        }
      }

      feeds.push({
        id: feedId,
        name: feedName,
        url: attrs.xmlurl,
        type: parseSourceType(attrs.type),
        category: (attrs.category as FeedConfig["category"]) || "general",
        enabled: true,
        tags: feedTags.length > 0 ? feedTags : undefined,
      });
    }
  }

  return { feeds, tags };
}

function parseSourceType(type?: string): SourceType {
  if (!type) return "rss";

  const normalized = type.toLowerCase();
  if (normalized === "rss" || normalized === "atom") return "rss";
  if (normalized === "youtube") return "youtube";
  if (normalized === "reddit") return "reddit";
  if (normalized === "github") return "github";

  return "rss";
}

function generateFeedId(url: string): string {
  let hash = 0;
  for (let i = 0; i < url.length; i++) {
    const char = url.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return `feed_${Math.abs(hash).toString(36)}`;
}

function generateTagId(name: string): string {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    const char = name.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return `tag_${Math.abs(hash).toString(36)}`;
}

function generateColor(name: string): string {
  const colors = [
    "#ef4444", "#f97316", "#f59e0b", "#eab308", "#84cc16",
    "#22c55e", "#10b981", "#14b8a6", "#06b6d4", "#0ea5e9",
    "#3b82f6", "#6366f1", "#8b5cf6", "#a855f7", "#d946ef",
    "#ec4899", "#f43f5e",
  ];

  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }

  return colors[Math.abs(hash) % colors.length];
}

function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/**
 * Validate OPML content
 */
export function validateOPML(opmlXml: string): boolean {
  try {
    // Check for basic OPML structure
    if (!opmlXml.includes("<opml")) return false;
    if (!opmlXml.includes("<head>")) return false;
    if (!opmlXml.includes("<body>")) return false;
    if (!opmlXml.includes("<outline")) return false;

    return true;
  } catch {
    return false;
  }
}
