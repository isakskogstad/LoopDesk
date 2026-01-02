import type { SourceAdapter, FeedConfig, NewsItem, AdapterParam } from "@/lib/nyheter/types";
import * as cheerio from "cheerio";

/**
 * Dagens Industri Events Adapter
 *
 * Scrapes DI's event page for conferences and events
 */

interface DIEvent {
  title: string;
  date: string;
  description: string;
  url: string;
  imageUrl?: string;
  type: string; // "Konferens", "Webbinarium", etc
  location: string; // "På plats", "Digitalt"
}

export const diEventsAdapter: SourceAdapter = {
  type: "di-events",
  name: "DI Events",
  description: "Dagens Industris konferenser och event",

  params: [
    {
      name: "url",
      label: "DI Event URL",
      type: "url",
      required: false,
      placeholder: "https://www.di.se/event/",
      description: "URL till DI:s event-sida (default: https://www.di.se/event/)",
    },
  ] as AdapterParam[],

  async fetchItems(config: FeedConfig): Promise<NewsItem[]> {
    const url = config.url || "https://www.di.se/event/";

    try {
      const response = await fetch(url, {
        headers: {
          "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36",
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const html = await response.text();
      const events = extractDIEvents(html);

      return events.map((event) => {
        const description = `📅 ${event.date}\n📍 ${event.location}\n🎯 ${event.type}\n\n${event.description}`;

        return {
          id: `di-event-${Buffer.from(event.title + event.date).toString("base64").substring(0, 16)}`,
          title: `🎫 ${event.title}`,
          description: description.substring(0, 500),
          content: description,
          url: event.url,
          publishedAt: parseDIDate(event.date),
          source: {
            id: config.id,
            name: config.name,
            type: config.type,
            url: config.url,
            color: config.color || "#e31837",
          },
          category: "events",
          author: "Dagens Industri",
          tags: ["event", "konferens", "di"],
          imageUrl: event.imageUrl,
        };
      });
    } catch (error) {
      console.error(`Error fetching DI events from ${config.name}:`, error);
      throw error;
    }
  },

  validate(config: FeedConfig): boolean {
    const url = config.url || "https://www.di.se/event/";
    try {
      const parsed = new URL(url);
      return parsed.hostname.includes("di.se");
    } catch {
      return false;
    }
  },

  getIcon(): string {
    return "🎫";
  },
};

function extractDIEvents(html: string): DIEvent[] {
  const $ = cheerio.load(html);
  const events: DIEvent[] = [];

  // DI uses .event-wrapper class for event cards
  $(".event-wrapper").each((_, element) => {
    const $el = $(element);

    // Extract data
    const title = $el.find(".event-card__header").text().trim();
    const dateEl = $el.find("time");
    const date = dateEl.text().trim();
    const dateTime = dateEl.attr("datetime") || "";
    const description = $el.find(".event-card__body").text().trim();
    const url = $el.attr("href") || "";
    const imageUrl = $el.find(".event-card__image img").attr("src");
    const metaText = $el.find(".event-card p:last-child").text().trim();

    // Parse type and location from meta text (e.g., "Konferens • På plats")
    const [type, location] = metaText.split("•").map((s) => s.trim());

    if (title && date) {
      events.push({
        title,
        date: dateTime || date,
        description,
        url: url.startsWith("http") ? url : `https://www.di.se${url}`,
        imageUrl,
        type: type || "Event",
        location: location || "På plats",
      });
    }
  });

  return events;
}

function parseDIDate(dateStr: string): string {
  // Handle ISO format from datetime attribute
  if (dateStr.includes("T")) {
    return new Date(dateStr).toISOString();
  }

  // Handle Swedish date format "19 januari 2026"
  const months: Record<string, number> = {
    januari: 0,
    februari: 1,
    mars: 2,
    april: 3,
    maj: 4,
    juni: 5,
    juli: 6,
    augusti: 7,
    september: 8,
    oktober: 9,
    november: 10,
    december: 11,
  };

  const match = dateStr.match(/(\d{1,2})\s+(\w+)\s+(\d{4})/);
  if (match) {
    const [, day, monthName, year] = match;
    const month = months[monthName.toLowerCase()];
    if (month !== undefined) {
      return new Date(parseInt(year), month, parseInt(day)).toISOString();
    }
  }

  // Fallback to current date
  return new Date().toISOString();
}
