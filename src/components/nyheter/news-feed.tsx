"use client";

import { useState, useCallback, useMemo, useEffect, useRef } from "react";
import useSWR from "swr";
import { ExternalLink, BookOpen, X, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { NewsItemCard } from "@/components/nyheter/news-item";
import { getEnabledFeeds } from "@/lib/nyheter/feeds";
import type { NewsItem, FeedConfig, ArticleParseResult } from "@/lib/nyheter/types";

interface FeedApiResponse {
  id: string;
  items: NewsItem[];
  lastUpdated: string;
  error?: string;
}

const fetcher = async (url: string): Promise<FeedApiResponse> => {
  const res = await fetch(url);
  if (!res.ok) throw new Error("Failed to fetch");
  return res.json();
};

interface NewsFeedProps {
  allSources: FeedConfig[];
  selectedCategories?: string[];
}

const ITEMS_PER_PAGE = 40;
const ITEMS_PER_LOAD = 20;

export function NewsFeed({ allSources, selectedCategories = [] }: NewsFeedProps) {
  const [selectedArticle, setSelectedArticle] = useState<NewsItem | null>(null);
  const [articleContent, setArticleContent] = useState<ArticleParseResult | null>(null);
  const [isLoadingArticle, setIsLoadingArticle] = useState(false);
  const [displayCount, setDisplayCount] = useState(ITEMS_PER_PAGE);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const loadMoreRef = useRef<HTMLDivElement>(null);

  // Get enabled feeds
  const enabledFeeds = useMemo(() => getEnabledFeeds(allSources), [allSources]);

  // Build API URLs for all feeds
  const feedUrls = useMemo(
    () =>
      enabledFeeds.map(
        (feed) =>
          `/api/feeds?url=${encodeURIComponent(feed.url)}&id=${feed.id}&name=${encodeURIComponent(feed.name)}&type=${feed.type}&retroactive=7`
      ),
    [enabledFeeds]
  );

  // Fetch all feeds with auto-refresh every 30 seconds
  const { data: feedResults, error, isLoading } = useSWR(
    feedUrls.length > 0 ? ["feeds", ...feedUrls] : null,
    async ([, ...urls]) => {
      const results = await Promise.all(
        urls.map(async (url) => {
          try {
            return await fetcher(url);
          } catch {
            return null;
          }
        })
      );
      return results.filter(Boolean) as FeedApiResponse[];
    },
    {
      refreshInterval: 30000, // Auto-refresh every 30 seconds
      revalidateOnFocus: true,
      dedupingInterval: 10000,
    }
  );

  // Combine, deduplicate, and filter items
  const allItems = useMemo(() => {
    if (!feedResults) return [];

    const items: NewsItem[] = [];
    const seenUrls = new Set<string>();
    const seenTitles = new Set<string>();

    for (const result of feedResults) {
      if (result?.items) {
        for (const item of result.items) {
          // Skip items without proper title
          if (!item.title || item.title === "Ingen titel" || item.title.trim().length < 5) {
            continue;
          }

          // Skip items without URL
          if (!item.url) continue;

          // Deduplicate by URL
          const normalizedUrl = item.url.toLowerCase().replace(/\/$/, "");
          if (seenUrls.has(normalizedUrl)) continue;
          seenUrls.add(normalizedUrl);

          // Deduplicate by similar titles (fuzzy match)
          const normalizedTitle = item.title.toLowerCase().replace(/[^\w\s]/g, "").trim();
          if (seenTitles.has(normalizedTitle)) continue;
          seenTitles.add(normalizedTitle);

          items.push(item);
        }
      }
    }

    // Filter to only show items from the last week
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

    // Sort by date (newest first)
    return items
      .filter(item => new Date(item.publishedAt) >= oneWeekAgo)
      .sort(
        (a, b) =>
          new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
      );
  }, [feedResults]);

  // Paginated items
  const displayedItems = useMemo(() => {
    return allItems.slice(0, displayCount);
  }, [allItems, displayCount]);

  // Reset display count when sources change
  useEffect(() => {
    setDisplayCount(ITEMS_PER_PAGE);
  }, [enabledFeeds.length]);

  // Infinite scroll observer
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !isLoadingMore && displayCount < allItems.length) {
          setIsLoadingMore(true);
          // Simulate small delay for smooth UX
          setTimeout(() => {
            setDisplayCount(prev => Math.min(prev + ITEMS_PER_LOAD, allItems.length));
            setIsLoadingMore(false);
          }, 300);
        }
      },
      { threshold: 0.1 }
    );

    if (loadMoreRef.current) {
      observer.observe(loadMoreRef.current);
    }

    return () => observer.disconnect();
  }, [displayCount, allItems.length, isLoadingMore]);

  // Load full article
  const loadFullArticle = useCallback(async (item: NewsItem) => {
    setSelectedArticle(item);
    setIsLoadingArticle(true);
    setArticleContent(null);

    try {
      const res = await fetch(`/api/article?url=${encodeURIComponent(item.url)}`);
      if (res.ok) {
        const data = await res.json();
        setArticleContent(data);
      }
    } catch (error) {
      console.error("Error loading article:", error);
    } finally {
      setIsLoadingArticle(false);
    }
  }, []);

  const closeArticle = useCallback(() => {
    setSelectedArticle(null);
    setArticleContent(null);
  }, []);

  // Group items by date for better organization
  const itemsByDate = useMemo(() => {
    const groups: { [key: string]: NewsItem[] } = {};
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    for (const item of displayedItems) {
      const itemDate = new Date(item.publishedAt);
      itemDate.setHours(0, 0, 0, 0);

      let key: string;
      if (itemDate.getTime() === today.getTime()) {
        key = "Idag";
      } else if (itemDate.getTime() === yesterday.getTime()) {
        key = "Igar";
      } else {
        key = itemDate.toLocaleDateString("sv-SE", {
          weekday: "long",
          day: "numeric",
          month: "long",
        });
      }

      if (!groups[key]) {
        groups[key] = [];
      }
      groups[key].push(item);
    }

    return groups;
  }, [displayedItems]);

  const dateKeys = Object.keys(itemsByDate);
  const hasMore = displayCount < allItems.length;

  return (
    <div className="space-y-8">
      {/* Live indicator */}
      <div className="flex items-center gap-2 text-sm text-gray-500">
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
        </span>
        <span>Realtidsuppdatering aktiv</span>
        <span className="text-gray-300 dark:text-gray-600">|</span>
        <span>{allItems.length} nyheter</span>
      </div>

      {/* Error state */}
      {error && (
        <div className="text-center py-8 text-red-500 bg-red-50 dark:bg-red-950/20 rounded-lg">
          <p>Kunde inte hamta nyheter</p>
        </div>
      )}

      {/* Loading state */}
      {isLoading && allItems.length === 0 && (
        <div className="space-y-6">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 p-5 space-y-4">
              <div className="flex items-center gap-3">
                <Skeleton className="h-10 w-10 rounded-full" />
                <div className="space-y-2">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-3 w-16" />
                </div>
              </div>
              <Skeleton className="h-6 w-4/5" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-2/3" />
            </div>
          ))}
        </div>
      )}

      {/* Empty state */}
      {!isLoading && allItems.length === 0 && !error && (
        <div className="text-center py-20 bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800">
          <div className="text-gray-300 dark:text-gray-600 mb-4">
            <BookOpen className="w-16 h-16 mx-auto" />
          </div>
          <p className="text-gray-600 dark:text-gray-400 font-medium text-lg">Inga nyheter hittades</p>
          <p className="text-sm text-gray-400 dark:text-gray-500 mt-2">
            Aktivera nagra kallor i sidopanelen for att se nyheter
          </p>
        </div>
      )}

      {/* Feed items grouped by date */}
      {dateKeys.map((dateKey) => (
        <div key={dateKey} className="space-y-4">
          <div className="sticky top-0 z-10 bg-gray-50/95 dark:bg-gray-950/95 backdrop-blur-sm py-2 -mx-1 px-1">
            <h2 className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider">
              {dateKey}
            </h2>
          </div>
          <div className="space-y-4">
            {itemsByDate[dateKey].map((item, index) => (
              <NewsItemCard
                key={`${item.id}-${index}`}
                item={item}
                onReadMore={() => loadFullArticle(item)}
              />
            ))}
          </div>
        </div>
      ))}

      {/* Load more trigger */}
      {hasMore && (
        <div ref={loadMoreRef} className="py-8 flex justify-center">
          {isLoadingMore && (
            <div className="flex items-center gap-2 text-gray-500">
              <Loader2 className="w-5 h-5 animate-spin" />
              <span>Laddar fler nyheter...</span>
            </div>
          )}
        </div>
      )}

      {/* End of feed indicator */}
      {!hasMore && allItems.length > 0 && (
        <div className="text-center py-8 text-gray-400 text-sm">
          Du har sett alla {allItems.length} nyheter fran den senaste veckan
        </div>
      )}

      {/* Article modal */}
      {selectedArticle && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
          <Card className="w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col bg-white dark:bg-gray-900 shadow-2xl">
            <CardHeader className="flex-shrink-0 border-b border-gray-100 dark:border-gray-800">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <CardTitle className="text-xl leading-tight">
                    {articleContent?.title || selectedArticle.title}
                  </CardTitle>
                  <div className="flex items-center gap-2 mt-3 text-sm text-gray-500">
                    <Badge variant="outline" style={{ borderColor: selectedArticle.source.color, color: selectedArticle.source.color }}>
                      {selectedArticle.source.name}
                    </Badge>
                    {articleContent?.author && <span>av {articleContent.author}</span>}
                    {articleContent?.wordCount && (
                      <span>• {Math.ceil(articleContent.wordCount / 200)} min lasning</span>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" asChild>
                    <a href={selectedArticle.url} target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  </Button>
                  <Button variant="ghost" size="sm" onClick={closeArticle}>
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="flex-1 overflow-y-auto py-6">
              {isLoadingArticle ? (
                <div className="space-y-4">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-5/6" />
                </div>
              ) : articleContent?.content ? (
                <div className="prose prose-sm dark:prose-invert max-w-none">
                  {articleContent.leadImageUrl && (
                    <img
                      src={articleContent.leadImageUrl}
                      alt=""
                      className="w-full max-h-64 object-cover rounded-lg mb-6"
                    />
                  )}
                  <div dangerouslySetInnerHTML={{ __html: articleContent.content }} />
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <BookOpen className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>Kunde inte hamta artikelns innehall</p>
                  <p className="text-sm mt-2">
                    <a
                      href={selectedArticle.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-500 hover:underline"
                    >
                      Oppna artikeln i webblasaren
                    </a>
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
