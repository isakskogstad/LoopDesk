import type { NewsItem, FeedFilter, GlobalFilter, FilterMatchType } from "@/lib/nyheter/types";

/**
 * Check if a string matches a filter pattern
 */
function matchesPattern(
  text: string,
  pattern: string,
  matchType: FilterMatchType,
  caseSensitive: boolean
): boolean {
  const searchText = caseSensitive ? text : text.toLowerCase();
  const searchPattern = caseSensitive ? pattern : pattern.toLowerCase();

  switch (matchType) {
    case "contains":
      return searchText.includes(searchPattern);

    case "exact":
      return searchText === searchPattern;

    case "startsWith":
      return searchText.startsWith(searchPattern);

    case "endsWith":
      return searchText.endsWith(searchPattern);

    case "regex":
      try {
        const flags = caseSensitive ? "" : "i";
        const regex = new RegExp(pattern, flags);
        return regex.test(text);
      } catch {
        console.warn(`Invalid regex pattern: ${pattern}`);
        return false;
      }

    default:
      return false;
  }
}

/**
 * Get the text to match against based on the filter field
 */
function getFieldText(item: NewsItem, field: FeedFilter["field"]): string {
  switch (field) {
    case "title":
      return item.title || "";
    case "description":
      return item.description || "";
    case "content":
      return item.content || item.fullContent || "";
    case "author":
      return item.author || "";
    case "all":
      return [
        item.title || "",
        item.description || "",
        item.content || "",
        item.fullContent || "",
        item.author || "",
        ...(item.tags || []),
      ].join(" ");
    default:
      return "";
  }
}

/**
 * Check if a news item matches a filter
 */
export function matchesFilter(item: NewsItem, filter: FeedFilter): boolean {
  if (!filter.enabled) return false;

  const text = getFieldText(item, filter.field);
  return matchesPattern(
    text,
    filter.pattern,
    filter.matchType,
    filter.caseSensitive || false
  );
}

/**
 * Apply a single filter to a news item
 * Returns the item with updated metadata, or null if filtered out
 */
export function applyFilter(
  item: NewsItem,
  filter: FeedFilter
): NewsItem | null {
  const matches = matchesFilter(item, filter);

  if (!matches) {
    // Item doesn't match the filter
    if (filter.type === "include") {
      // Include filter: item must match to be included
      return { ...item, filteredOut: true };
    }
    // Exclude or highlight: no change
    return item;
  }

  // Item matches the filter
  switch (filter.type) {
    case "exclude":
      // Exclude filter: item matches, so filter it out
      return { ...item, filteredOut: true };

    case "include":
      // Include filter: item matches, so keep it
      return item;

    case "highlight":
      // Highlight filter: mark the item
      return {
        ...item,
        matchedFilters: [...(item.matchedFilters || []), filter.id],
      };

    default:
      return item;
  }
}

/**
 * Apply multiple filters to a news item
 */
export function applyFilters(
  item: NewsItem,
  filters: FeedFilter[]
): NewsItem | null {
  let result: NewsItem | null = item;
  const enabledFilters = filters.filter((f) => f.enabled);

  // Check for include filters first
  const includeFilters = enabledFilters.filter((f) => f.type === "include");

  if (includeFilters.length > 0) {
    // At least one include filter must match
    const matchesAnyInclude = includeFilters.some((f) =>
      matchesFilter(item, f)
    );
    if (!matchesAnyInclude) {
      return { ...item, filteredOut: true };
    }
  }

  // Apply exclude and highlight filters
  for (const filter of enabledFilters) {
    if (filter.type === "include") continue; // Already handled

    result = applyFilter(result!, filter);
    if (result?.filteredOut) {
      return result;
    }
  }

  return result;
}

/**
 * Apply global filters to news items
 */
export function applyGlobalFilters(
  items: NewsItem[],
  globalFilters: GlobalFilter[]
): NewsItem[] {
  return items
    .map((item) => {
      // Find filters that apply to this item's feed
      const applicableFilters = globalFilters.filter((f) => {
        if (!f.enabled) return false;
        if (f.applyToFeeds === "all") return true;
        return f.applyToFeeds.includes(item.source.id);
      });

      if (applicableFilters.length === 0) {
        return item;
      }

      return applyFilters(item, applicableFilters);
    })
    .filter((item): item is NewsItem => item !== null && !item.filteredOut);
}

/**
 * Apply feed-specific filters to news items
 */
export function applyFeedFilters(
  items: NewsItem[],
  feedFilters: Map<string, FeedFilter[]>
): NewsItem[] {
  return items
    .map((item) => {
      const filters = feedFilters.get(item.source.id);
      if (!filters || filters.length === 0) {
        return item;
      }
      return applyFilters(item, filters);
    })
    .filter((item): item is NewsItem => item !== null && !item.filteredOut);
}

/**
 * Create a simple keyword filter
 */
export function createKeywordFilter(
  keyword: string,
  type: FeedFilter["type"] = "highlight"
): FeedFilter {
  return {
    id: `filter_${Date.now()}`,
    name: `Keyword: ${keyword}`,
    type,
    matchType: "contains",
    pattern: keyword,
    field: "all",
    caseSensitive: false,
    enabled: true,
  };
}

/**
 * Create a regex filter
 */
export function createRegexFilter(
  pattern: string,
  name: string,
  type: FeedFilter["type"] = "highlight"
): FeedFilter {
  return {
    id: `filter_${Date.now()}`,
    name,
    type,
    matchType: "regex",
    pattern,
    field: "all",
    caseSensitive: false,
    enabled: true,
  };
}

/**
 * Validate a filter pattern
 */
export function validateFilterPattern(
  pattern: string,
  matchType: FilterMatchType
): { valid: boolean; error?: string } {
  if (!pattern || pattern.trim().length === 0) {
    return { valid: false, error: "Pattern cannot be empty" };
  }

  if (matchType === "regex") {
    try {
      new RegExp(pattern);
    } catch (e) {
      return {
        valid: false,
        error: `Invalid regex: ${e instanceof Error ? e.message : "Unknown error"}`,
      };
    }
  }

  return { valid: true };
}

/**
 * Get highlighted text with matches
 */
export function highlightMatches(
  text: string,
  patterns: string[],
  highlightClass: string = "bg-yellow-200 dark:bg-yellow-800"
): string {
  if (patterns.length === 0) return text;

  let result = text;
  for (const pattern of patterns) {
    try {
      const regex = new RegExp(`(${escapeRegex(pattern)})`, "gi");
      result = result.replace(regex, `<mark class="${highlightClass}">$1</mark>`);
    } catch {
      // Skip invalid patterns
    }
  }
  return result;
}

function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
