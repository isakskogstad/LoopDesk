"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Loader2, AlertCircle, Newspaper } from "lucide-react";
import { NewsItem } from "./news-item";
import { NewsFilters } from "./news-filters";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";

// Types
interface Article {
  id: string;
  url: string;
  title: string;
  description: string | null;
  imageUrl: string | null;
  publishedAt: Date | string;
  sourceName: string;
  sourceId: string;
  sourceType: string;
  sourceColor: string | null;
  isRead: boolean;
  isBookmarked: boolean;
  keywordMatches?: {
    keyword: {
      id: string;
      term: string;
      color: string | null;
    };
    matchedIn: string;
  }[];
  companyMatches?: {
    company: {
      id: string;
      name: string;
      orgNumber: string;
    };
    matchType: string;
  }[];
}

interface Source {
  sourceId: string;
  sourceName: string;
  count: number;
  category?: string | null;
}

interface Stats {
  total: number;
  unread: number;
  bookmarked: number;
  today: number;
  sources: number;
}

export function NewsFeed() {
  const router = useRouter();

  // State
  const [articles, setArticles] = useState<Article[]>([]);
  const [sources, setSources] = useState<Source[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(false);

  // Filter state
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSource, setSelectedSource] = useState<string | undefined>();
  const [showBookmarked, setShowBookmarked] = useState(false);
  const [showUnread, setShowUnread] = useState(false);

  // Refs
  const loadMoreRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);

  // Fetch articles
  const fetchArticles = useCallback(
    async (cursor?: string, append = false) => {
      try {
        if (!append) {
          setIsLoading(true);
        } else {
          setIsLoadingMore(true);
        }
        setError(null);

        const params = new URLSearchParams();
        if (searchQuery) params.set("query", searchQuery);
        if (selectedSource) params.set("sourceId", selectedSource);
        if (showBookmarked) params.set("isBookmarked", "true");
        if (showUnread) params.set("isRead", "false");
        if (cursor) params.set("cursor", cursor);

        // Use fast path only when no filters
        const useFast = !searchQuery && !selectedSource && !showBookmarked && !showUnread;
        if (useFast && !cursor) {
          params.set("fast", "true");
        } else {
          params.set("fast", "false");
        }

        const response = await fetch(`/api/nyheter?${params.toString()}`);
        if (!response.ok) {
          throw new Error("Failed to fetch articles");
        }

        const data = await response.json();

        if (append) {
          setArticles((prev) => [...prev, ...data.articles]);
        } else {
          setArticles(data.articles);
        }

        setSources(data.sources || []);
        setStats(data.stats || null);
        setNextCursor(data.nextCursor);
        setHasMore(data.hasMore);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unknown error");
      } finally {
        setIsLoading(false);
        setIsLoadingMore(false);
      }
    },
    [searchQuery, selectedSource, showBookmarked, showUnread]
  );

  // Initial load
  useEffect(() => {
    fetchArticles();
  }, []);

  // Refetch when filters change (debounced)
  useEffect(() => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    debounceRef.current = setTimeout(() => {
      fetchArticles();
    }, 300);

    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, [searchQuery, selectedSource, showBookmarked, showUnread]);

  // Infinite scroll
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !isLoadingMore && nextCursor) {
          fetchArticles(nextCursor, true);
        }
      },
      { threshold: 0.1 }
    );

    if (loadMoreRef.current) {
      observer.observe(loadMoreRef.current);
    }

    return () => observer.disconnect();
  }, [hasMore, isLoadingMore, nextCursor, fetchArticles]);

  // Handle refresh (sync from FreshRSS)
  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      const response = await fetch("/api/nyheter/sync", { method: "POST" });
      if (response.ok) {
        await fetchArticles();
      }
    } catch {
      // Ignore sync errors, just refetch
      await fetchArticles();
    } finally {
      setIsRefreshing(false);
    }
  };

  // Handle bookmark toggle
  const handleBookmark = async (id: string) => {
    // Optimistic update
    setArticles((prev) =>
      prev.map((a) => (a.id === id ? { ...a, isBookmarked: !a.isBookmarked } : a))
    );

    try {
      await fetch(`/api/nyheter/${id}/bookmark`, { method: "POST" });
    } catch {
      // Revert on error
      setArticles((prev) =>
        prev.map((a) => (a.id === id ? { ...a, isBookmarked: !a.isBookmarked } : a))
      );
    }
  };

  // Handle mark as read
  const handleRead = async (id: string) => {
    // Optimistic update
    setArticles((prev) =>
      prev.map((a) => (a.id === id ? { ...a, isRead: true } : a))
    );

    try {
      await fetch(`/api/nyheter/${id}/read`, { method: "POST" });
    } catch {
      // Ignore errors for read status
    }
  };

  // Handle view company
  const handleViewCompany = (orgNumber: string) => {
    router.push(`/bolag/${orgNumber}`);
  };

  // Loading skeleton
  if (isLoading) {
    return (
      <div className="space-y-6">
        <NewsFilters
          sources={[]}
          onSearchChange={() => {}}
          onSourceChange={() => {}}
          onBookmarkedChange={() => {}}
          onUnreadChange={() => {}}
          onRefresh={() => {}}
        />
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="bg-card rounded-xl border p-5 space-y-4">
              <div className="flex items-start gap-4">
                <Skeleton className="w-12 h-12 rounded-lg" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-5 w-full" />
                  <Skeleton className="h-5 w-3/4" />
                </div>
              </div>
              <Skeleton className="h-16 w-full" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <AlertCircle className="w-12 h-12 text-destructive mb-4" />
        <h3 className="text-lg font-semibold mb-2">Kunde inte ladda nyheter</h3>
        <p className="text-muted-foreground mb-4">{error}</p>
        <Button onClick={() => fetchArticles()}>Försök igen</Button>
      </div>
    );
  }

  // Empty state
  if (articles.length === 0) {
    return (
      <div className="space-y-6">
        <NewsFilters
          sources={sources}
          selectedSource={selectedSource}
          searchQuery={searchQuery}
          showBookmarked={showBookmarked}
          showUnread={showUnread}
          onSearchChange={setSearchQuery}
          onSourceChange={setSelectedSource}
          onBookmarkedChange={setShowBookmarked}
          onUnreadChange={setShowUnread}
          onRefresh={handleRefresh}
          isRefreshing={isRefreshing}
          stats={stats || undefined}
        />
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <Newspaper className="w-12 h-12 text-muted-foreground/50 mb-4" />
          <h3 className="text-lg font-semibold mb-2">Inga nyheter</h3>
          <p className="text-muted-foreground mb-4">
            {searchQuery || selectedSource || showBookmarked || showUnread
              ? "Inga nyheter matchar dina filter"
              : "Inga nyheter har synkroniserats ännu"}
          </p>
          {!searchQuery && !selectedSource && (
            <Button onClick={handleRefresh} disabled={isRefreshing}>
              {isRefreshing ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Synkroniserar...
                </>
              ) : (
                "Synkronisera nyheter"
              )}
            </Button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Filters */}
      <NewsFilters
        sources={sources}
        selectedSource={selectedSource}
        searchQuery={searchQuery}
        showBookmarked={showBookmarked}
        showUnread={showUnread}
        onSearchChange={setSearchQuery}
        onSourceChange={setSelectedSource}
        onBookmarkedChange={setShowBookmarked}
        onUnreadChange={setShowUnread}
        onRefresh={handleRefresh}
        isRefreshing={isRefreshing}
        stats={stats || undefined}
      />

      {/* Article grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {articles.map((article) => (
          <NewsItem
            key={article.id}
            article={article}
            onBookmark={handleBookmark}
            onRead={handleRead}
            onViewCompany={handleViewCompany}
          />
        ))}
      </div>

      {/* Load more indicator */}
      {hasMore && (
        <div ref={loadMoreRef} className="flex justify-center py-8">
          {isLoadingMore ? (
            <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
          ) : (
            <Button variant="outline" onClick={() => fetchArticles(nextCursor!, true)}>
              Ladda fler
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
