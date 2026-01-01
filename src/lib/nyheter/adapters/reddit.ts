import type { SourceAdapter, FeedConfig, NewsItem, AdapterParam } from "@/lib/nyheter/types";
import Parser from "rss-parser";

const parser = new Parser();

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

function getSubredditFeedUrl(subreddit: string, sort: string = "hot"): string {
  // Clean up the subreddit name
  let sub = subreddit.trim();

  // Remove r/ prefix if present
  if (sub.startsWith("r/")) {
    sub = sub.slice(2);
  }

  // Remove full URL if provided
  const match = sub.match(/reddit\.com\/r\/([a-zA-Z0-9_]+)/);
  if (match) {
    sub = match[1];
  }

  return `https://www.reddit.com/r/${sub}/${sort}.rss`;
}

function extractImageFromContent(content: string): string | undefined {
  // Try to find image in content
  const imgMatch = content.match(/<img[^>]+src=["']([^"']+)["']/i);
  if (imgMatch) {
    return imgMatch[1];
  }

  // Try to find thumbnail link
  const thumbMatch = content.match(/href="([^"]+(?:\.jpg|\.png|\.gif|\.webp)[^"]*)"/i);
  if (thumbMatch) {
    return thumbMatch[1];
  }

  return undefined;
}

export const redditAdapter: SourceAdapter = {
  type: "reddit",
  name: "Reddit Subreddit",
  description: "Follow a subreddit's posts",

  params: [
    {
      name: "url",
      label: "Subreddit",
      type: "text",
      required: true,
      placeholder: "technology or r/technology",
      description: "Subreddit name (with or without r/ prefix)",
    },
    {
      name: "sort",
      label: "Sort by",
      type: "select",
      required: false,
      default: "hot",
      options: [
        { label: "Hot", value: "hot" },
        { label: "New", value: "new" },
        { label: "Top", value: "top" },
        { label: "Rising", value: "rising" },
      ],
    },
  ] as AdapterParam[],

  async fetchItems(config: FeedConfig): Promise<NewsItem[]> {
    try {
      const sort = (config.options?.sort as string) || "hot";
      const feedUrl = getSubredditFeedUrl(config.url, sort);
      const feed = await parser.parseURL(feedUrl);

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
          type: "reddit",
          url: config.url,
          color: config.color || "#FF4500",
        },
        category: config.category || "general",
        author: item.author?.replace("/u/", ""),
        imageUrl: item.content ? extractImageFromContent(item.content) : undefined,
        tags: ["reddit"],
      }));
    } catch (error) {
      console.error(`Error fetching Reddit feed ${config.name}:`, error);
      throw error;
    }
  },

  validate(config: FeedConfig): boolean {
    return config.url.length > 0;
  },

  getIcon(): string {
    return "message-circle";
  },
};
