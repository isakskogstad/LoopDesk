import Parser from "rss-parser";

export interface FeedValidationResult {
  valid: boolean;
  error?: string;
  feed?: {
    title: string;
    description?: string;
    type: "rss" | "atom";
    itemCount: number;
    lastBuildDate?: Date;
  };
}

/**
 * Validate that a URL points to a valid RSS/Atom feed
 */
export async function validateFeedUrl(url: string): Promise<FeedValidationResult> {
  // 1. Validate URL format
  let parsedUrl: URL;
  try {
    parsedUrl = new URL(url);
    if (!["http:", "https:"].includes(parsedUrl.protocol)) {
      return { valid: false, error: "URL måste vara http eller https" };
    }
  } catch {
    return { valid: false, error: "Ogiltig URL-format" };
  }

  // 2. Fetch and parse the feed
  const parser = new Parser({
    timeout: 10000,
    headers: {
      "User-Agent": "LoopDesk/1.0 (RSS Validator)",
      Accept: "application/rss+xml, application/atom+xml, application/xml, text/xml",
    },
  });

  try {
    const response = await fetch(url, {
      method: "GET",
      headers: {
        "User-Agent": "LoopDesk/1.0 (RSS Validator)",
        Accept: "application/rss+xml, application/atom+xml, application/xml, text/xml",
      },
      signal: AbortSignal.timeout(10000),
    });

    if (!response.ok) {
      return {
        valid: false,
        error: `Kunde inte hämta URL (HTTP ${response.status})`
      };
    }

    const contentType = response.headers.get("content-type") || "";
    const text = await response.text();

    // Check if it looks like XML/RSS
    if (!text.trim().startsWith("<?xml") && !text.trim().startsWith("<rss") && !text.trim().startsWith("<feed")) {
      // Check content type as fallback
      if (!contentType.includes("xml") && !contentType.includes("rss") && !contentType.includes("atom")) {
        return { valid: false, error: "Inte ett giltigt RSS/Atom-flöde" };
      }
    }

    // 3. Parse the feed
    const feed = await parser.parseString(text);

    if (!feed.items || feed.items.length === 0) {
      return {
        valid: true,
        feed: {
          title: feed.title || "Okänt flöde",
          description: feed.description,
          type: text.includes("<feed") ? "atom" : "rss",
          itemCount: 0,
          lastBuildDate: feed.lastBuildDate ? new Date(feed.lastBuildDate) : undefined,
        },
        error: "Flödet är tomt (inga artiklar)"
      };
    }

    // Determine feed type
    const feedType: "rss" | "atom" = text.includes("<feed") && text.includes("xmlns=\"http://www.w3.org/2005/Atom\"")
      ? "atom"
      : "rss";

    return {
      valid: true,
      feed: {
        title: feed.title || "Okänt flöde",
        description: feed.description,
        type: feedType,
        itemCount: feed.items.length,
        lastBuildDate: feed.lastBuildDate ? new Date(feed.lastBuildDate) : undefined,
      },
    };
  } catch (error) {
    if (error instanceof Error) {
      if (error.name === "AbortError" || error.message.includes("timeout")) {
        return { valid: false, error: "Timeout - servern svarar inte" };
      }
      if (error.message.includes("ENOTFOUND") || error.message.includes("getaddrinfo")) {
        return { valid: false, error: "Kunde inte hitta servern" };
      }
      if (error.message.includes("certificate")) {
        return { valid: false, error: "SSL-certifikatfel" };
      }
    }
    return { valid: false, error: "Kunde inte tolka som RSS/Atom-flöde" };
  }
}

/**
 * Generate a URL-safe ID from feed title
 */
export function generateFeedId(title: string): string {
  return title
    .toLowerCase()
    .replace(/[åä]/g, "a")
    .replace(/ö/g, "o")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .substring(0, 50);
}
