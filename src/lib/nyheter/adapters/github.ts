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

function getGithubFeedUrl(input: string, feedType: string): string {
  // Clean up input
  let repo = input.trim();

  // Remove github.com prefix if present
  repo = repo.replace(/^https?:\/\/(www\.)?github\.com\//i, "");

  // Remove trailing slashes
  repo = repo.replace(/\/+$/, "");

  switch (feedType) {
    case "commits":
      return `https://github.com/${repo}/commits.atom`;
    case "releases":
      return `https://github.com/${repo}/releases.atom`;
    case "tags":
      return `https://github.com/${repo}/tags.atom`;
    case "activity":
    default:
      return `https://github.com/${repo}/activity`;
  }
}

export const githubAdapter: SourceAdapter = {
  type: "github",
  name: "GitHub Repository",
  description: "Follow commits, releases, or activity from a GitHub repository",

  params: [
    {
      name: "url",
      label: "Repository",
      type: "text",
      required: true,
      placeholder: "owner/repo or https://github.com/owner/repo",
      description: "GitHub repository (e.g., facebook/react)",
    },
    {
      name: "feedType",
      label: "Feed Type",
      type: "select",
      required: false,
      default: "releases",
      options: [
        { label: "Releases", value: "releases" },
        { label: "Commits", value: "commits" },
        { label: "Tags", value: "tags" },
      ],
    },
  ] as AdapterParam[],

  async fetchItems(config: FeedConfig): Promise<NewsItem[]> {
    try {
      const feedType = (config.options?.feedType as string) || "releases";
      const feedUrl = getGithubFeedUrl(config.url, feedType);
      const feed = await parser.parseURL(feedUrl);

      return feed.items.map((item) => ({
        id: generateId(item),
        title: item.title || "Ingen titel",
        description: item.contentSnippet || item.content?.slice(0, 500),
        content: item.content,
        url: item.link || "",
        publishedAt: item.isoDate || item.pubDate || new Date().toISOString(),
        source: {
          id: config.id,
          name: config.name,
          type: "github",
          url: config.url,
          color: config.color || "#24292e",
        },
        category: config.category || "technology",
        author: item.author,
        tags: ["github", feedType],
      }));
    } catch (error) {
      console.error(`Error fetching GitHub feed ${config.name}:`, error);
      throw error;
    }
  },

  validate(config: FeedConfig): boolean {
    // Should contain owner/repo format
    const repo = config.url.replace(/^https?:\/\/(www\.)?github\.com\//i, "");
    return /^[a-zA-Z0-9_-]+\/[a-zA-Z0-9_.-]+$/.test(repo);
  },

  getIcon(): string {
    return "github";
  },
};
