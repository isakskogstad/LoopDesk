import type { SourceAdapter, FeedConfig, NewsItem, AdapterParam, NewsCategory } from "@/lib/nyheter/types";
import * as cheerio from "cheerio";

/**
 * Eventbrite Adapter
 *
 * Scrapes Eventbrite search results for events and converts them to NewsItems
 * Uses Schema.org JSON-LD data embedded in the page
 */

interface EventbriteEvent {
  "@type": "Event";
  name: string;
  startDate: string;
  endDate?: string;
  location?: {
    "@type": "Place";
    name?: string;
    address?: string | {
      addressLocality?: string;
      addressCountry?: string;
    };
  };
  description?: string;
  url?: string;
  image?: string | string[];
  offers?: {
    price?: string;
    priceCurrency?: string;
    availability?: string;
  };
  organizer?: {
    name?: string;
  };
}

function extractEventsFromSchemaOrg(html: string): EventbriteEvent[] {
  const $ = cheerio.load(html);
  const events: EventbriteEvent[] = [];

  // Find all JSON-LD script tags
  $('script[type="application/ld+json"]').each((_, element) => {
    try {
      const data = JSON.parse($(element).html() || "");

      // Handle ItemList containing events
      if (data["@type"] === "ItemList" && Array.isArray(data.itemListElement)) {
        data.itemListElement.forEach((item: any) => {
          if (item["@type"] === "Event") {
            events.push(item);
          }
        });
      }

      // Handle single Event
      if (data["@type"] === "Event") {
        events.push(data);
      }
    } catch (error) {
      console.error("Failed to parse Schema.org JSON-LD:", error);
    }
  });

  return events;
}

function formatEventDate(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString("sv-SE", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function extractLocation(location?: EventbriteEvent["location"]): string {
  if (!location) return "Stockholm";

  if (typeof location.address === "string") {
    return location.address;
  }

  if (location.address?.addressLocality) {
    return location.address.addressLocality;
  }

  return location.name || "Stockholm";
}

export const eventbriteAdapter: SourceAdapter = {
  type: "eventbrite",
  name: "Eventbrite Events",
  description: "Events från Eventbrite (konferenser, meetups, workshops)",

  params: [
    {
      name: "searchUrl",
      label: "Eventbrite Sök-URL",
      type: "url",
      required: true,
      placeholder: "https://www.eventbrite.se/d/sweden--stockholm/investment-conference/",
      description: "Full URL till Eventbrite-sökning",
    },
    {
      name: "category",
      label: "Kategori",
      type: "text",
      required: false,
      placeholder: "investment",
      description: "Typ av event (investment, tech, startup, etc.)",
    },
  ] as AdapterParam[],

  async fetchItems(config: FeedConfig): Promise<NewsItem[]> {
    try {
      const response = await fetch(config.url, {
        headers: {
          "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36",
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const html = await response.text();
      const events = extractEventsFromSchemaOrg(html);

      return events.map((event, index) => {
        const location = extractLocation(event.location);
        const startDate = formatEventDate(event.startDate);
        const endDate = event.endDate ? formatEventDate(event.endDate) : null;

        // Get image URL
        let imageUrl: string | undefined;
        if (typeof event.image === "string") {
          imageUrl = event.image;
        } else if (Array.isArray(event.image) && event.image.length > 0) {
          imageUrl = event.image[0];
        }

        // Build description
        let description = event.description || "";
        if (endDate && endDate !== startDate) {
          description = `📅 ${startDate} - ${endDate} • 📍 ${location}\n\n${description}`;
        } else {
          description = `📅 ${startDate} • 📍 ${location}\n\n${description}`;
        }

        // Add price info if available
        if (event.offers?.price) {
          description += `\n\n💰 ${event.offers.price} ${event.offers.priceCurrency || "SEK"}`;
        }

        return {
          id: `eventbrite-${Buffer.from(event.name + event.startDate).toString("base64").substring(0, 16)}`,
          title: `🎫 ${event.name}`,
          description: description.substring(0, 500),
          content: description,
          url: event.url || config.url,
          publishedAt: event.startDate,
          source: {
            id: config.id,
            name: config.name,
            type: config.type,
            url: config.url,
            color: config.color,
          },
          category: (config.options?.category as NewsCategory) || "events",
          author: event.organizer?.name,
          tags: ["event", location.toLowerCase(), config.options?.category].filter(Boolean) as string[],
          imageUrl,
        };
      });
    } catch (error) {
      console.error(`Error fetching Eventbrite events from ${config.name}:`, error);
      throw error;
    }
  },

  validate(config: FeedConfig): boolean {
    try {
      const url = new URL(config.url);
      return url.hostname.includes("eventbrite");
    } catch {
      return false;
    }
  },

  getIcon(): string {
    return "🎫";
  },
};
