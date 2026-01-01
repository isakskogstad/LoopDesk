import type { SourceAdapter, FeedConfig, NewsItem } from "@/lib/nyheter/types";

/**
 * Huginn Adapter
 *
 * Huginn is a self-hosted automation tool (like IFTTT/Zapier).
 * It can create RSS feeds from various sources via its WebsiteAgent and DataOutputAgent.
 *
 * This adapter connects to a Huginn instance to fetch events from agents.
 */

export interface HuginnEvent {
  id: number;
  agent_id: number;
  payload: Record<string, unknown>;
  created_at: string;
  updated_at: string;
  expires_at?: string;
}

export interface HuginnAgent {
  id: number;
  name: string;
  type: string;
  options: Record<string, unknown>;
  created_at: string;
  working: boolean;
  disabled: boolean;
}

// Huginn API client
async function huginnFetch(
  baseUrl: string,
  endpoint: string,
  apiToken: string
): Promise<unknown> {
  const url = `${baseUrl}/api/${endpoint}`;

  const response = await fetch(url, {
    headers: {
      Authorization: `Token ${apiToken}`,
      Accept: "application/json",
    },
  });

  if (!response.ok) {
    throw new Error(`Huginn API error: ${response.status}`);
  }

  return response.json();
}

export const huginnAdapter: SourceAdapter = {
  type: "huginn",
  name: "Huginn",
  description: "Connect to a self-hosted Huginn instance for advanced automation",
  params: [
    {
      name: "instance",
      label: "Huginn Instance URL",
      type: "url",
      required: true,
      placeholder: "https://huginn.example.com",
      description: "Your Huginn instance URL",
    },
    {
      name: "api_token",
      label: "API Token",
      type: "text",
      required: true,
      placeholder: "your-api-token",
      description: "Huginn API token (found in your Huginn settings)",
    },
    {
      name: "agent_id",
      label: "Agent ID",
      type: "number",
      required: true,
      placeholder: "123",
      description: "The ID of the Huginn agent to fetch events from",
    },
    {
      name: "limit",
      label: "Event Limit",
      type: "number",
      required: false,
      default: 50,
      description: "Maximum number of events to fetch",
    },
  ],

  async fetchItems(config: FeedConfig): Promise<NewsItem[]> {
    const instance = config.options?.instance as string;
    const apiToken = config.options?.api_token as string;
    const agentId = config.options?.agent_id as number;
    const limit = (config.options?.limit as number) || 50;

    if (!instance || !apiToken || !agentId) {
      throw new Error("Huginn instance URL, API token, and agent ID are required");
    }

    try {
      // Fetch events from the agent
      const events = (await huginnFetch(
        instance,
        `agents/${agentId}/events?limit=${limit}`,
        apiToken
      )) as HuginnEvent[];

      return events.map((event) => {
        const payload = event.payload;

        // Extract common fields from payload
        const title =
          (payload.title as string) ||
          (payload.headline as string) ||
          (payload.text as string)?.substring(0, 100) ||
          "Huginn Event";

        const description =
          (payload.description as string) ||
          (payload.summary as string) ||
          (payload.text as string) ||
          (payload.body as string);

        const url =
          (payload.url as string) ||
          (payload.link as string) ||
          `${instance}/events/${event.id}`;

        const imageUrl =
          (payload.image as string) ||
          (payload.image_url as string) ||
          (payload.thumbnail as string);

        const author =
          (payload.author as string) ||
          (payload.creator as string) ||
          (payload.user as string);

        return {
          id: `huginn-${config.id}-${event.id}`,
          title,
          description: typeof description === "string" ? description.substring(0, 500) : undefined,
          content: typeof payload.content === "string" ? payload.content : undefined,
          url,
          imageUrl,
          publishedAt: event.created_at,
          author,
          source: {
            id: config.id,
            name: config.name,
            type: "huginn",
            url: instance,
            color: config.color || "#6B21A8",
          },
          category: config.category || "other",
        };
      });
    } catch (error) {
      console.error(`Error fetching Huginn events:`, error);
      throw error;
    }
  },

  validate(config: FeedConfig): boolean {
    return Boolean(
      config.options?.instance &&
        config.options?.api_token &&
        config.options?.agent_id
    );
  },

  getIcon(): string {
    return "🤖";
  },
};

/**
 * Huginn Agent Types Reference
 *
 * Common agents for news aggregation:
 *
 * 1. WebsiteAgent - Scrape websites
 *    - Extracts content using CSS selectors or XPath
 *    - Can follow pagination
 *    - Runs on schedule
 *
 * 2. RssAgent - Parse RSS/Atom feeds
 *    - Similar to native RSS parsing
 *    - Can apply transformations
 *
 * 3. DataOutputAgent - Output as RSS/JSON
 *    - Creates an RSS feed from incoming events
 *    - Public endpoint for subscription
 *
 * 4. TriggerAgent - Filter and match
 *    - Filter events based on rules
 *    - Regex matching, value comparisons
 *
 * 5. DeDuplicationAgent - Remove duplicates
 *    - Filters out repeated events
 *    - Useful for preventing duplicate news items
 *
 * Example Huginn scenario for news:
 *
 * WebsiteAgent (scrape news site)
 *   → TriggerAgent (filter by keywords)
 *   → DeDuplicationAgent (remove duplicates)
 *   → DataOutputAgent (RSS feed)
 *
 * The DataOutputAgent creates a public RSS endpoint that can be
 * consumed directly by the RSS adapter instead of using this Huginn adapter.
 */

// Helper to check if a Huginn instance is reachable
export async function checkHuginnConnection(
  instance: string,
  apiToken: string
): Promise<{ connected: boolean; error?: string }> {
  try {
    await huginnFetch(instance, "agents", apiToken);
    return { connected: true };
  } catch (error) {
    return {
      connected: false,
      error: error instanceof Error ? error.message : "Connection failed",
    };
  }
}

// List all agents from a Huginn instance
export async function listHuginnAgents(
  instance: string,
  apiToken: string
): Promise<HuginnAgent[]> {
  const agents = (await huginnFetch(instance, "agents", apiToken)) as HuginnAgent[];
  return agents.filter((agent) => agent.working && !agent.disabled);
}
