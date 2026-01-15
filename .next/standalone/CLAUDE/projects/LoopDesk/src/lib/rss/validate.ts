/**
 * RSS Feed Validation
 *
 * Validates that a URL points to a valid RSS/Atom feed.
 * Uses feedsmith for parsing with proper error handling.
 */

import { parseFeed } from "feedsmith";
import type { Rss, Atom } from "feedsmith/types";
import type { FeedValidationResult } from "./types";

// Re-export types for backward compatibility
export type { FeedValidationResult } from "./types";

/**
 * Validate that a URL points to a valid RSS/Atom feed
 */
export async function validateFeedUrl(
  url: string
): Promise<FeedValidationResult> {
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
  try {
    const response = await fetch(url, {
      method: "GET",
      headers: {
        "User-Agent": "LoopDesk/1.0 (RSS Validator)",
        Accept:
          "application/rss+xml, application/atom+xml, application/xml, text/xml",
      },
      signal: AbortSignal.timeout(10000),
    });

    if (!response.ok) {
      return {
        valid: false,
        error: `Kunde inte hämta URL (HTTP ${response.status})`,
      };
    }

    const contentType = response.headers.get("content-type") || "";
    const text = await response.text();

    // 3. Check if it looks like XML/RSS
    const trimmedText = text.trim();
    if (
      !trimmedText.startsWith("<?xml") &&
      !trimmedText.startsWith("<rss") &&
      !trimmedText.startsWith("<feed")
    ) {
      // Check content type as fallback
      if (
        !contentType.includes("xml") &&
        !contentType.includes("rss") &&
        !contentType.includes("atom")
      ) {
        return { valid: false, error: "Inte ett giltigt RSS/Atom-flöde" };
      }
    }

    // 4. Parse the feed with feedsmith
    const { format, feed } = parseFeed(text);

    // 5. Extract feed info based on format
    const isAtom = format === "atom";
    const atomFeed = feed as Atom.Feed<string>;
    const rssFeed = feed as Rss.Feed<string>;

    const itemCount = isAtom
      ? atomFeed.entries?.length || 0
      : rssFeed.items?.length || 0;

    const title = isAtom
      ? atomFeed.title || "Okänt flöde"
      : rssFeed.title || "Okänt flöde";

    const description = isAtom ? atomFeed.subtitle : rssFeed.description;

    const lastBuildDate = isAtom
      ? atomFeed.updated
        ? new Date(atomFeed.updated)
        : undefined
      : rssFeed.lastBuildDate
        ? new Date(rssFeed.lastBuildDate)
        : undefined;

    // 6. Handle empty feeds
    if (itemCount === 0) {
      return {
        valid: true,
        feed: {
          title,
          description,
          type: isAtom ? "atom" : "rss",
          itemCount: 0,
          lastBuildDate,
        },
        error: "Flödet är tomt (inga artiklar)",
      };
    }

    return {
      valid: true,
      feed: {
        title,
        description,
        type: isAtom ? "atom" : "rss",
        itemCount,
        lastBuildDate,
      },
    };
  } catch (error) {
    // Handle specific error types
    if (error instanceof Error) {
      // Timeout errors
      if (error.name === "AbortError" || error.message.includes("timeout")) {
        return { valid: false, error: "Timeout - servern svarar inte" };
      }

      // DNS errors
      if (
        error.message.includes("ENOTFOUND") ||
        error.message.includes("getaddrinfo")
      ) {
        return { valid: false, error: "Kunde inte hitta servern" };
      }

      // SSL/TLS errors
      if (error.message.includes("certificate")) {
        return { valid: false, error: "SSL-certifikatfel" };
      }

      // Feedsmith parsing errors
      if (error.message.includes("Unrecognized feed format")) {
        return { valid: false, error: "Inte ett giltigt RSS/Atom-flöde" };
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
