import type { SourceAdapter, FeedConfig, NewsItem, AdapterParam } from "@/lib/nyheter/types";
import Parser from "rss-parser";

type CustomItem = {
  mediaContent?: { $?: { url?: string } };
  mediaThumbnail?: { $?: { url?: string } };
  "media:content"?: { $?: { url?: string } };
  "media:thumbnail"?: { $?: { url?: string } };
};

const parser = new Parser<Record<string, unknown>, CustomItem>({
  customFields: {
    item: [
      ["media:content", "mediaContent"],
      ["media:thumbnail", "mediaThumbnail"],
    ],
  },
});

function generateId(item: { title?: string; link?: string }): string {
  const base = `${item.title || ""}-${item.link || ""}`;
  let hash = 0;
  for (let i = 0; i < base.length; i++) {
    const char = base.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return Math.abs(hash).toString(36);
}

function extractImageUrl(item: CustomItem & Parser.Item): string | undefined {
  // Try enclosure first
  if (item.enclosure?.url) {
    return item.enclosure.url;
  }
  // Try media:content
  if (item.mediaContent?.$?.url) {
    return item.mediaContent.$.url;
  }
  // Try media:thumbnail
  if (item.mediaThumbnail?.$?.url) {
    return item.mediaThumbnail.$.url;
  }
  // Try to extract from content
  if (item.content) {
    const imgMatch = item.content.match(/<img[^>]+src=["']([^"']+)["']/i);
    if (imgMatch) {
      return imgMatch[1];
    }
  }
  return undefined;
}

export const rssAdapter: SourceAdapter = {
  type: "rss",
  name: "RSS Feed",
  description: "Standard RSS 2.0 and Atom feeds",

  params: [
    {
      name: "url",
      label: "Feed URL",
      type: "url",
      required: true,
      placeholder: "https://example.com/feed.xml",
      description: "The URL of the RSS or Atom feed",
    },
  ] as AdapterParam[],

  async fetchItems(config: FeedConfig): Promise<NewsItem[]> {
    try {
      const feed = await parser.parseURL(config.url);

      return feed.items.map((item) => ({
        id: generateId(item),
        title: item.title || "Ingen titel",
        description: item.contentSnippet || item.content?.slice(0, 300),
        content: item.content,
        url: item.link || "",
        publishedAt: item.isoDate || item.pubDate || new Date().toISOString(),
        source: {
          id: config.id,
          name: config.name,
          type: config.type,
          url: config.url,
          color: config.color,
        },
        category: config.category,
        author: item.creator,
        tags: item.categories,
        imageUrl: extractImageUrl(item as CustomItem & Parser.Item),
      }));
    } catch (error) {
      console.error(`Error fetching RSS feed ${config.name}:`, error);
      throw error;
    }
  },

  validate(config: FeedConfig): boolean {
    try {
      new URL(config.url);
      return true;
    } catch {
      return false;
    }
  },

  getIcon(): string {
    return "rss";
  },
};
