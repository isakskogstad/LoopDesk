import Mercury from "@postlight/mercury-parser";
import type { ArticleParseResult } from "./types";

/**
 * Parse full article content from a URL using Mercury Parser
 */
export async function parseArticle(url: string): Promise<ArticleParseResult | null> {
  try {
    const result = await Mercury.parse(url);

    if (!result) {
      return null;
    }

    return {
      title: result.title || undefined,
      author: result.author || undefined,
      content: result.content || undefined,
      datePublished: result.date_published || undefined,
      leadImageUrl: result.lead_image_url || undefined,
      excerpt: result.excerpt || undefined,
      wordCount: result.word_count || undefined,
      direction: result.direction || undefined,
      domain: result.domain || undefined,
      url: result.url || url,
    };
  } catch (error) {
    console.error("Error parsing article:", error);
    return null;
  }
}

/**
 * Extract readable content from HTML
 */
export async function parseArticleFromHtml(
  url: string,
  html: string
): Promise<ArticleParseResult | null> {
  try {
    const result = await Mercury.parse(url, { html });

    if (!result) {
      return null;
    }

    return {
      title: result.title || undefined,
      author: result.author || undefined,
      content: result.content || undefined,
      datePublished: result.date_published || undefined,
      leadImageUrl: result.lead_image_url || undefined,
      excerpt: result.excerpt || undefined,
      wordCount: result.word_count || undefined,
      direction: result.direction || undefined,
      domain: result.domain || undefined,
      url: result.url || url,
    };
  } catch (error) {
    console.error("Error parsing article from HTML:", error);
    return null;
  }
}

/**
 * Clean HTML content - remove scripts, styles, etc.
 */
export function cleanHtmlContent(html: string): string {
  return html
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, "")
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, "")
    .replace(/<noscript[^>]*>[\s\S]*?<\/noscript>/gi, "")
    .replace(/<!--[\s\S]*?-->/g, "")
    .replace(/<iframe[^>]*>[\s\S]*?<\/iframe>/gi, "");
}

/**
 * Extract plain text from HTML
 */
export function htmlToPlainText(html: string): string {
  return html
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/p>/gi, "\n\n")
    .replace(/<[^>]+>/g, "")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

/**
 * Estimate reading time in minutes
 */
export function estimateReadingTime(text: string, wordsPerMinute = 200): number {
  const wordCount = text.split(/\s+/).filter(Boolean).length;
  return Math.ceil(wordCount / wordsPerMinute);
}
