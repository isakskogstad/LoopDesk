"use client";

import { useState, useCallback, useMemo, useEffect, useRef } from "react";
import useSWR from "swr";
import { ExternalLink, BookOpen, X, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { NewsItemCard } from "@/components/nyheter/news-item";
import type { NewsItem, FeedConfig, ArticleParseResult } from "@/lib/nyheter/types";

interface GlobalFeedResponse {
  items: NewsItem[];
  itemCount: number;
  sourceCount: number;
  lastUpdated: string | null;
  cached: boolean;
  cacheAge?: string;
  pagination?: {
    offset: number;
    limit: number;
    hasMore: boolean;
    total: number;
  };
}

const fetcher = async (url: string): Promise<GlobalFeedResponse> => {
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
  const [displayedItems, setDisplayedItems] = useState<NewsItem[]>([]);
  const [offset, setOffset] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const loadMoreRef = useRef<HTMLDivElement>(null);

  // Fetch pre-computed global feed from database (instant!)
  const { data: feedData, error, isLoading } = useSWR<GlobalFeedResponse>(
    `/api/feed/global?limit=${ITEMS_PER_PAGE}&offset=0`,
    fetcher,
    {
      refreshInterval: 60000, // Refresh every 60 seconds
      revalidateOnFocus: true,
      dedupingInterval: 30000,
    }
  );

  // Update displayed items when feed data changes
  useEffect(() => {
    if (feedData?.items) {
      setDisplayedItems(feedData.items);
      setHasMore(feedData.pagination?.hasMore ?? false);
      setOffset(feedData.items.length);
    }
  }, [feedData]);

  // Load more items on scroll
  const loadMore = useCallback(async () => {
    if (isLoadingMore || !hasMore) return;

    setIsLoadingMore(true);
    try {
      const res = await fetch(`/api/feed/global?limit=${ITEMS_PER_LOAD}&offset=${offset}`);
      const data: GlobalFeedResponse = await res.json();

      if (data.items && data.items.length > 0) {
        setDisplayedItems(prev => [...prev, ...data.items]);
        setOffset(prev => prev + data.items.length);
        setHasMore(data.pagination?.hasMore ?? false);
      } else {
        setHasMore(false);
      }
    } catch (error) {
      console.error("Error loading more:", error);
    } finally {
      setIsLoadingMore(false);
    }
  }, [offset, hasMore, isLoadingMore]);

  // Infinite scroll observer
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !isLoadingMore) {
          loadMore();
        }
      },
      { threshold: 0.1 }
    );

    if (loadMoreRef.current) {
      observer.observe(loadMoreRef.current);
    }

    return () => observer.disconnect();
  }, [loadMore, hasMore, isLoadingMore]);

  // Filter by selected sources
  const filteredItems = useMemo(() => {
    const enabledSourceIds = allSources.filter(s => s.enabled).map(s => s.id);

    if (enabledSourceIds.length === 0) {
      return displayedItems;
    }

    return displayedItems.filter(item =>
      enabledSourceIds.includes(item.source.id)
    );
  }, [displayedItems, allSources]);

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

    for (const item of filteredItems) {
      const itemDate = new Date(item.publishedAt);
      itemDate.setHours(0, 0, 0, 0);

      let key: string;
      if (itemDate.getTime() === today.getTime()) {
        key = "Idag";
      } else if (itemDate.getTime() === yesterday.getTime()) {
        key = "Igår";
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
  }, [filteredItems]);

  const dateKeys = Object.keys(itemsByDate);

  return (
    <div className="space-y-6">
      {/* Status bar - Modern compact design */}
      <div className="flex items-center gap-3 px-4 py-3 bg-white dark:bg-[#111] rounded-xl border border-gray-100 dark:border-[#222]">
        <span className="relative flex h-2.5 w-2.5">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
        </span>
        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Realtidsuppdatering</span>
        <span className="text-gray-200 dark:text-gray-700">•</span>
        <span className="text-sm text-gray-500">{feedData?.itemCount ?? 0} nyheter</span>
        {feedData?.cacheAge && (
          <>
            <span className="text-gray-200 dark:text-gray-700">•</span>
            <span className="text-sm text-gray-400">Uppdaterad {feedData.cacheAge} sedan</span>
          </>
        )}
      </div>

      {/* Error state */}
      {error && (
        <div className="text-center py-8 text-red-500 bg-red-50 dark:bg-red-950/20 rounded-lg">
          <p>Kunde inte hämta nyheter</p>
        </div>
      )}

      {/* Loading state */}
      {isLoading && displayedItems.length === 0 && (
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
      {!isLoading && filteredItems.length === 0 && !error && (
        <div className="text-center py-20 bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800">
          <div className="text-gray-300 dark:text-gray-600 mb-4">
            <BookOpen className="w-16 h-16 mx-auto" />
          </div>
          <p className="text-gray-600 dark:text-gray-400 font-medium text-lg">Inga nyheter hittades</p>
          <p className="text-sm text-gray-400 dark:text-gray-500 mt-2">
            Aktivera några källor i sidopanelen för att se nyheter
          </p>
        </div>
      )}

      {/* Feed items grouped by date */}
      {dateKeys.map((dateKey) => (
        <div key={dateKey} className="space-y-4">
          <div className="sticky top-0 z-10 bg-[#fafafa]/95 dark:bg-[#0a0a0a]/95 backdrop-blur-md py-3 -mx-1 px-1">
            <div className="flex items-center gap-3">
              <h2 className="text-sm font-bold text-gray-800 dark:text-gray-200 capitalize">
                {dateKey}
              </h2>
              <div className="flex-1 h-px bg-gradient-to-r from-gray-200 dark:from-gray-800 to-transparent" />
            </div>
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
      {!hasMore && filteredItems.length > 0 && (
        <div className="text-center py-8 text-gray-400 text-sm">
          Du har sett alla {filteredItems.length} nyheter
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
                      <span>• {Math.ceil(articleContent.wordCount / 200)} min läsning</span>
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
                  <p>Kunde inte hämta artikelns innehåll</p>
                  <p className="text-sm mt-2">
                    <a
                      href={selectedArticle.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-500 hover:underline"
                    >
                      Öppna artikeln i webbläsaren
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
