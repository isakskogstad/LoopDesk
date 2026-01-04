"use client";

import { useState, useCallback, useMemo, useEffect, useRef } from "react";
import useSWR from "swr";
import { ExternalLink, BookOpen, X, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { NewsItemCard } from "@/components/nyheter/news-item";
import { StickyToolbar } from "@/components/nyheter/sticky-toolbar";
import { SearchBar } from "@/components/nyheter/search-bar";
import { useReadArticles } from "@/hooks/use-read-articles";
import { useBookmarks } from "@/hooks/use-bookmarks";
import { useNewArticles } from "@/hooks/use-new-articles";
import { cn } from "@/lib/utils";
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
  isEventsView?: boolean;
}

const ITEMS_PER_PAGE = 40;
const ITEMS_PER_LOAD = 20;

export function NewsFeed({ allSources, selectedCategories = [], isEventsView = false }: NewsFeedProps) {
  const [selectedArticle, setSelectedArticle] = useState<NewsItem | null>(null);
  const [articleContent, setArticleContent] = useState<ArticleParseResult | null>(null);
  const [isLoadingArticle, setIsLoadingArticle] = useState(false);
  const [displayedItems, setDisplayedItems] = useState<NewsItem[]>([]);
  const [offset, setOffset] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const loadMoreRef = useRef<HTMLDivElement>(null);

  // Read articles tracking
  const { isRead, markAsRead, readArticles } = useReadArticles();

  // Bookmarks tracking
  const { isBookmarked, toggleBookmark } = useBookmarks();

  // Keyboard shortcut for search (Cmd+K / Ctrl+K)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setIsSearchOpen(true);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Fetch pre-computed global feed from database (instant!)
  const { data: feedData, error, isLoading } = useSWR<GlobalFeedResponse>(
    `/api/feed/global?limit=${ITEMS_PER_PAGE}&offset=0`,
    fetcher,
    {
      refreshInterval: 120000, // Refresh every 2 minutes (matches cron job)
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

  // Helper to identify future events
  const isFutureEvent = useCallback((item: NewsItem) => {
    const isEvent =
      item.category === "events" ||
      item.source.type === "eventbrite" ||
      item.source.type === "di-events" ||
      item.tags?.includes("event") ||
      item.tags?.includes("events") ||
      item.tags?.includes("konferens");

    if (!isEvent) return false;

    // Check if date is in the future (allowing for today's events)
    const eventDate = new Date(item.publishedAt);
    const now = new Date();
    // Reset time to start of day to include today's events in "future/current" list
    // OR keep strict time.
    // "Events that have NOT taken place" -> strictly future or ongoing today.
    return eventDate > now;
  }, []);

  // Filter by selected sources AND view mode (Events vs News)
  const filteredItems = useMemo(() => {
    // 1. Filter by sources
    const enabledSourceIds = new Set(
      allSources
        .filter(s => s.enabled)
        .flatMap(s => [s.id, s.url])
    );

    let items = displayedItems;

    if (enabledSourceIds.size > 0) {
      items = items.filter(item =>
        enabledSourceIds.has(item.source.id) ||
        enabledSourceIds.has(item.source.url)
      );
    }

    // 2. Filter by Events View logic
    if (isEventsView) {
      // Show ONLY future events
      items = items.filter(isFutureEvent);
    } else {
      // Show everything EXCEPT future events
      // (Past events stay in the news feed)
      items = items.filter(item => !isFutureEvent(item));
    }

    return items;
  }, [displayedItems, allSources, isEventsView, isFutureEvent]);

  // New articles tracking
  const articleIds = useMemo(() => filteredItems.map(item => item.id), [filteredItems]);
  const { newArticleIds, newCount } = useNewArticles(articleIds);

  // Calculate unread count
  const unreadCount = useMemo(() => {
    return filteredItems.filter(item => !readArticles.has(item.id)).length;
  }, [filteredItems, readArticles]);

  // Load full article
  const loadFullArticle = useCallback(async (item: NewsItem) => {
    setSelectedArticle(item);
    setIsLoadingArticle(true);
    setArticleContent(null);

    // Mark as read when opening article
    markAsRead(item.id);

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
  }, [markAsRead]);

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
      <div className="flex items-center gap-3 px-4 py-3 bg-card rounded-xl border border-border dark:border-[#222]">
        <span className="relative flex h-2.5 w-2.5">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
        </span>
        <span className="text-sm font-medium text-foreground">Automatisk uppdatering</span>
        <span className="text-muted-foreground/40 dark:text-muted-foreground/50">•</span>
        <span className="text-sm text-muted-foreground">{feedData?.itemCount ?? 0} nyheter</span>
        {feedData?.cacheAge && (
          <>
            <span className="text-muted-foreground/40 dark:text-muted-foreground/50">•</span>
            <span className="text-sm text-muted-foreground/70">Uppdaterad {feedData.cacheAge} sedan</span>
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
            <div key={i} className="bg-card rounded-xl border border-border dark:border-gray-800 p-5 space-y-4">
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
        <div className="text-center py-20 bg-card rounded-xl border border-border dark:border-gray-800">
          <div className="text-muted-foreground/50 dark:text-muted-foreground mb-4">
            <BookOpen className="w-16 h-16 mx-auto" />
          </div>
          <p className="text-muted-foreground font-medium text-lg">Inga nyheter hittades</p>
          <p className="text-sm text-muted-foreground/70 dark:text-muted-foreground mt-2">
            Aktivera några källor i sidopanelen för att se nyheter
          </p>
        </div>
      )}

      {/* Feed items grouped by date */}
      {dateKeys.map((dateKey) => (
        <div key={dateKey} className="space-y-4">
          <div className="sticky top-0 z-10 bg-[#fafafa]/95 dark:bg-[#0a0a0a]/95 backdrop-blur-md py-3 -mx-1 px-1">
            <div className="flex items-center gap-3">
              <h2 className="text-sm font-bold text-foreground capitalize">
                {dateKey}
              </h2>
              <div className="flex-1 h-px bg-gradient-to-r from-gray-200 dark:from-gray-800 to-transparent" />
            </div>
          </div>
          {/* Grid or list layout based on view mode */}
          <div className={cn(
            viewMode === "grid"
              ? "grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4"
              : "space-y-4"
          )}>
            {itemsByDate[dateKey].map((item, idx) => (
              <NewsItemCard
                key={`${item.id}-${idx}`}
                item={item}
                index={idx}
                onReadMore={() => loadFullArticle(item)}
                isRead={isRead(item.id)}
                onMarkRead={() => markAsRead(item.id)}
                isBookmarked={isBookmarked(item.id)}
                onToggleBookmark={() => toggleBookmark(item.id)}
                isNew={newArticleIds.has(item.id)}
              />
            ))}
          </div>
        </div>
      ))}

      {/* Load more trigger */}
      {hasMore && (
        <div ref={loadMoreRef} className="py-8 flex justify-center">
          {isLoadingMore && (
            <div className="flex items-center gap-2 text-muted-foreground">
              <Loader2 className="w-5 h-5 animate-spin" />
              <span>Laddar fler nyheter...</span>
            </div>
          )}
        </div>
      )}

      {/* End of feed indicator */}
      {!hasMore && filteredItems.length > 0 && (
        <div className="text-center py-8 text-muted-foreground/70 text-sm">
          Du har sett alla {filteredItems.length} nyheter
        </div>
      )}

      {/* Article modal */}
      {selectedArticle && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
          <Card className="w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col bg-card shadow-2xl">
            <CardHeader className="flex-shrink-0 border-b border-border dark:border-gray-800">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <CardTitle className="text-xl leading-tight">
                    {articleContent?.title || selectedArticle.title}
                  </CardTitle>
                  <div className="flex items-center gap-2 mt-3 text-sm text-muted-foreground">
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
                <div className="text-center py-8 text-muted-foreground">
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

      {/* Sticky toolbar - show new article count instead of unread */}
      <StickyToolbar
        unreadCount={newCount}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        onScrollToTop={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        onSearch={() => setIsSearchOpen(true)}
      />

      {/* Search modal */}
      <SearchBar
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        onResultSelect={(item) => loadFullArticle(item)}
      />
    </div>
  );
}
