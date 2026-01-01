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

function extractVideoId(url: string): string | null {
  const match = url.match(/(?:v=|\/embed\/|\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
  return match ? match[1] : null;
}

function getChannelFeedUrl(channelInput: string): string {
  // If it's already a feed URL
  if (channelInput.includes("feeds/videos.xml")) {
    return channelInput;
  }

  // If it's a channel ID
  if (channelInput.startsWith("UC") && channelInput.length === 24) {
    return `https://www.youtube.com/feeds/videos.xml?channel_id=${channelInput}`;
  }

  // If it's a full YouTube URL
  const channelMatch = channelInput.match(/youtube\.com\/channel\/([a-zA-Z0-9_-]+)/);
  if (channelMatch) {
    return `https://www.youtube.com/feeds/videos.xml?channel_id=${channelMatch[1]}`;
  }

  // If it's a @handle URL
  const handleMatch = channelInput.match(/youtube\.com\/@([a-zA-Z0-9_-]+)/);
  if (handleMatch) {
    // For handles, we need to use the playlist approach
    // This is a limitation - handles need to be resolved to channel IDs
    return `https://www.youtube.com/feeds/videos.xml?user=${handleMatch[1]}`;
  }

  // Assume it's a channel ID
  return `https://www.youtube.com/feeds/videos.xml?channel_id=${channelInput}`;
}

export const youtubeAdapter: SourceAdapter = {
  type: "youtube",
  name: "YouTube Channel",
  description: "Subscribe to a YouTube channel's video uploads",

  params: [
    {
      name: "url",
      label: "Channel ID or URL",
      type: "text",
      required: true,
      placeholder: "UCxxxxxxxxxxxxxxxx or https://youtube.com/channel/...",
      description: "YouTube channel ID, URL, or @handle",
    },
  ] as AdapterParam[],

  async fetchItems(config: FeedConfig): Promise<NewsItem[]> {
    try {
      const feedUrl = getChannelFeedUrl(config.url);
      const feed = await parser.parseURL(feedUrl);

      return feed.items.map((item) => {
        const videoId = extractVideoId(item.link || "");
        const thumbnailUrl = videoId
          ? `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`
          : undefined;

        return {
          id: generateId(item),
          title: item.title || "Ingen titel",
          description: item.contentSnippet || item.content?.slice(0, 300),
          content: item.content,
          url: item.link || "",
          publishedAt: item.isoDate || item.pubDate || new Date().toISOString(),
          source: {
            id: config.id,
            name: config.name,
            type: "youtube",
            url: config.url,
            color: config.color || "#FF0000",
          },
          category: config.category || "entertainment",
          author: item.author || feed.title,
          imageUrl: thumbnailUrl,
          tags: ["video", "youtube"],
        };
      });
    } catch (error) {
      console.error(`Error fetching YouTube feed ${config.name}:`, error);
      throw error;
    }
  },

  validate(config: FeedConfig): boolean {
    return config.url.length > 0;
  },

  getIcon(): string {
    return "youtube";
  },
};
