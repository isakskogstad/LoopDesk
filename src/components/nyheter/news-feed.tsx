"use client";

import { useState, useCallback, useMemo } from "react";
import useSWR from "swr";
import { RefreshCw, ExternalLink, BookOpen, X, Clock } from "lucide-react";
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

export function NewsFeed({ allSources, selectedCategories = [] }: NewsFeedProps) {
  const [selectedArticle, setSelectedArticle] = useState<NewsItem | null>(null);
  const [articleContent, setArticleContent] = useState<ArticleParseResult | null>(null);
  const [isLoadingArticle, setIsLoadingArticle] = useState(false);

  // Get enabled feeds
  const enabledFeeds = useMemo(() => getEnabledFeeds(allSources), [allSources]);

  // Build API URLs for all feeds - include retroactive=7 for 1 week back
  const feedUrls = useMemo(
    () =>
      enabledFeeds.map(
        (feed) =>
          `/api/feeds?url=${encodeURIComponent(feed.url)}&id=${feed.id}&name=${encodeURIComponent(feed.name)}&type=${feed.type}&retroactive=7`
      ),
    [enabledFeeds]
  );

  // Fetch all feeds
  const { data: feedResults, error, isLoading, mutate } = useSWR(
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
      refreshInterval: 60000,
      revalidateOnFocus: false,
    }
  );

  // Combine all items
  const allItems = useMemo(() => {
    if (!feedResults) return [];

    const items: NewsItem[] = [];
    for (const result of feedResults) {
      if (result?.items) {
        items.push(...result.items);
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

  const handleRefresh = useCallback(async () => {
    await mutate();
  }, [mutate]);

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

    for (const item of allItems) {
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
  }, [allItems]);

  const dateKeys = Object.keys(itemsByDate);

  return (
    <div className="space-y-6">
      {/* Header with refresh and stats */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3 text-sm text-gray-500">
          <Clock className="w-4 h-4" />
          <span>{allItems.length} nyheter</span>
          {enabledFeeds.length > 0 && (
            <span className="text-gray-300 dark:text-gray-600">|</span>
          )}
          <span>{enabledFeeds.length} aktiva kallor</span>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={handleRefresh}
          disabled={isLoading}
          className="gap-2"
        >
          <RefreshCw className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`} />
          Uppdatera
        </Button>
      </div>

      {/* Error state */}
      {error && (
        <div className="text-center py-8 text-red-500 bg-red-50 dark:bg-red-950/20 rounded-lg">
          <p>Kunde inte hamta nyheter</p>
          <Button variant="outline" size="sm" onClick={handleRefresh} className="mt-2">
            Forsok igen
          </Button>
        </div>
      )}

      {/* Loading state */}
      {isLoading && allItems.length === 0 && (
        <div className="space-y-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 p-4 space-y-3">
              <div className="flex items-center gap-2">
                <Skeleton className="h-5 w-24" />
                <Skeleton className="h-4 w-16" />
              </div>
              <Skeleton className="h-6 w-3/4" />
              <Skeleton className="h-4 w-full" />
            </div>
          ))}
        </div>
      )}

      {/* Empty state */}
      {!isLoading && allItems.length === 0 && !error && (
        <div className="text-center py-16 bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800">
          <div className="text-gray-400 mb-4">
            <BookOpen className="w-12 h-12 mx-auto" />
          </div>
          <p className="text-gray-500 font-medium">Inga nyheter hittades</p>
          <p className="text-sm text-gray-400 mt-1">
            Aktivera nagra kallor for att se nyheter
          </p>
        </div>
      )}

      {/* Feed items grouped by date */}
      {dateKeys.map((dateKey) => (
        <div key={dateKey} className="space-y-3">
          <h2 className="text-sm font-medium text-gray-500 uppercase tracking-wide px-1">
            {dateKey}
          </h2>
          <div className="space-y-3">
            {itemsByDate[dateKey].map((item) => (
              <NewsItemCard
                key={item.id}
                item={item}
                onReadMore={() => loadFullArticle(item)}
              />
            ))}
          </div>
        </div>
      ))}

      {/* Article modal */}
      {selectedArticle && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 animate-fade-in">
          <Card className="w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col bg-white dark:bg-gray-900">
            <CardHeader className="flex-shrink-0 border-b border-gray-200 dark:border-gray-800">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <CardTitle className="text-xl leading-tight">
                    {articleContent?.title || selectedArticle.title}
                  </CardTitle>
                  <div className="flex items-center gap-2 mt-2 text-sm text-gray-500">
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
                      Oppna
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
