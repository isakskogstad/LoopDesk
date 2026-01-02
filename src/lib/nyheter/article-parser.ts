import { extract, extractFromHtml } from "@extractus/article-extractor";
import type { ArticleParseResult } from "./types";

function getDomainFromUrl(url?: string): string | undefined {
  if (!url) {
    return undefined;
  }

  try {
    return new URL(url).hostname;
  } catch {
    return undefined;
  }
}

function getWordCountFromContent(content?: string): number | undefined {
  if (!content) {
    return undefined;
  }

  const text = htmlToPlainText(content);
  const words = text.split(/\s+/).filter(Boolean);
  return words.length || undefined;
}

function mapArticleData(
  url: string,
  data: {
    title?: string;
    author?: string;
    content?: string;
    published?: string;
    image?: string;
    description?: string;
    url?: string;
    source?: string;
  } | null
): ArticleParseResult | null {
  if (!data) {
    return null;
  }

  const resolvedUrl = data.url || url;

  return {
    title: data.title || undefined,
    author: data.author || undefined,
    content: data.content || undefined,
    datePublished: data.published || undefined,
    leadImageUrl: data.image || undefined,
    excerpt: data.description || undefined,
    wordCount: getWordCountFromContent(data.content),
    direction: undefined,
    domain: data.source || getDomainFromUrl(resolvedUrl),
    url: resolvedUrl,
  };
}

/**
 * Parse full article content from a URL using article-extractor
 */
export async function parseArticle(url: string): Promise<ArticleParseResult | null> {
  try {
    const result = await extract(url);
    return mapArticleData(url, result);
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
    const result = await extractFromHtml(html, url);
    return mapArticleData(url, result);
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
