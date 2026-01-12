"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Loader2, AlertCircle } from "lucide-react";
import { EmptyNewsState } from "@/components/ui/empty-state";
import { NewsItem } from "./news-item";
import { NewsFilters } from "./news-filters";
import { RssToolDialog } from "./rss-tool-dialog";
import { ArticleModal } from "./article-modal";
import { DaySection, groupArticlesByDay } from "./day-section";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { useRealtimeArticles } from "@/hooks/use-realtime-articles";
import type { RealtimeArticle } from "@/lib/supabase";

// Company type for filter
interface Company {
  id: string;
  name: string;
  orgNumber: string;
}

// Types
interface Article {
    id: string;
    url: string;
    title: string;
    description: string | null;
    content?: string | null;
    author?: string | null;
    imageUrl: string | null;
    mediaThumbnail?: string | null;
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
    feedId: string;  // Always set - used for deletion
    url: string;
    category?: string | null;
    color?: string | null;
}

interface Stats {
    total: number;
    unread: number;
    bookmarked: number;
    today: number;
    sources: number;
}

interface NewsFeedProps {
    initialAddFeedUrl?: string;
}

type NewsLayout = "compact" | "short" | "media";

export function NewsFeed({ initialAddFeedUrl }: NewsFeedProps) {
    const router = useRouter();

    // State
    const [articles, setArticles] = useState<Article[]>([]);
    const [sources, setSources] = useState<Source[]>([]);
    const [rssSources, setRssSources] = useState<Source[]>([]);
    const [companies, setCompanies] = useState<Company[]>([]);
    const [stats, setStats] = useState<Stats | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isLoadingMore, setIsLoadingMore] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [nextCursor, setNextCursor] = useState<string | null>(null);
    const [hasMore, setHasMore] = useState(false);

    // Filter state
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedSource, setSelectedSource] = useState<string | undefined>();
    const [selectedCompany, setSelectedCompany] = useState<string | undefined>();
    const [showBookmarked, setShowBookmarked] = useState(false);
    const [showUnread, setShowUnread] = useState(false);

    // Keyboard navigation state
    const [focusedIndex, setFocusedIndex] = useState<number>(-1);

    // Offline and new articles state
    const [isOffline, setIsOffline] = useState(false);
    const [isRssToolOpen, setIsRssToolOpen] = useState(false);
    const [pendingFeedUrl, setPendingFeedUrl] = useState<string | undefined>(initialAddFeedUrl);
    const [realtimeStatus, setRealtimeStatus] = useState<"connecting" | "connected" | "error">("connecting");
    const [layout, setLayout] = useState<NewsLayout>("short");
    const [selectedArticle, setSelectedArticle] = useState<Article | null>(null);
    const [isArticleModalOpen, setIsArticleModalOpen] = useState(false);

    // Refs
    const loadMoreRef = useRef<HTMLDivElement>(null);
    const debounceRef = useRef<NodeJS.Timeout | null>(null);
    const articleRefs = useRef<(HTMLElement | null)[]>([]);
    const containerRef = useRef<HTMLDivElement>(null);

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
                            params.set("limit", "30"); // Max 30 per load
                            if (searchQuery) params.set("query", searchQuery);
                            if (selectedSource) params.set("sourceId", selectedSource);
                            if (selectedCompany) params.set("companyId", selectedCompany);
                            if (showBookmarked) params.set("isBookmarked", "true");
                            if (showUnread) params.set("isRead", "false");
                            if (cursor) params.set("cursor", cursor);

                            // Use fast path only when no filters
                            const useFast = !searchQuery && !selectedSource && !selectedCompany && !showBookmarked && !showUnread;
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
          [searchQuery, selectedSource, selectedCompany, showBookmarked, showUnread]
        );

    // Fetch watched companies for filter
    const fetchCompanies = useCallback(async () => {
          try {
                  const response = await fetch("/api/bevakning?limit=200");
                  if (response.ok) {
                            const data = await response.json();
                            setCompanies(data.companies.map((c: { id: string; name: string; orgNumber: string }) => ({
                                        id: c.id,
                                        name: c.name,
                                        orgNumber: c.orgNumber,
                            })));
                  }
          } catch {
                  // Ignore errors, company filter is optional
          }
    }, []);

    const refreshRssSources = useCallback(async () => {
          try {
                  const response = await fetch("/api/feeds");
                  if (!response.ok) return;
                  const data = await response.json();
                  const countMap = new Map(sources.map((s) => [s.feedId, s.count]));
                  const normalized = (data.feeds || []).map((feed: { id: string; name: string; url: string; type: string; category?: string | null; color?: string | null }) => ({
                        sourceId: feed.id,
                        sourceName: feed.name,
                        count: countMap.get(feed.id) || 0,
                        feedId: feed.id,
                        url: feed.url,
                        category: feed.category ?? null,
                        color: feed.color ?? null,
                  }));
                  setRssSources(normalized);
          } catch {
                  // Ignore errors, RSS settings can still open without list.
          }
    }, [sources]);

    // Initial load
    useEffect(() => {
          fetchArticles();
          fetchCompanies();
    }, []);

    useEffect(() => {
          refreshRssSources();
    }, [refreshRssSources]);

    // Auto-open RSS dialog if addFeed URL is provided
    useEffect(() => {
          if (pendingFeedUrl) {
                setIsRssToolOpen(true);
          }
    }, [pendingFeedUrl]);

    // Offline detection
    useEffect(() => {
          const handleOnline = () => setIsOffline(false);
          const handleOffline = () => setIsOffline(true);

          // Initial state
          setIsOffline(!navigator.onLine);

          window.addEventListener("online", handleOnline);
          window.addEventListener("offline", handleOffline);

          return () => {
                  window.removeEventListener("online", handleOnline);
                  window.removeEventListener("offline", handleOffline);
          };
    }, []);

    useEffect(() => {
          const saved = window.localStorage.getItem("newsLayout") as NewsLayout | null;
          if (saved) {
                setLayout(saved);
          }
    }, []);

    useEffect(() => {
          window.localStorage.setItem("newsLayout", layout);
    }, [layout]);

    useEffect(() => {
          if (isOffline) {
                setRealtimeStatus("error");
          } else {
                setRealtimeStatus("connecting");
          }
    }, [isOffline]);

    const matchesActiveFilters = useCallback(
          (article: Article) => {
                  if (selectedCompany) return false;

                  if (searchQuery) {
                            const query = searchQuery.toLowerCase();
                            const haystack = `${article.title} ${article.description || ""}`.toLowerCase();
                            if (!haystack.includes(query)) return false;
                  }

                  if (selectedSource && article.sourceId !== selectedSource) return false;
                  if (showBookmarked && !article.isBookmarked) return false;
                  if (showUnread && article.isRead) return false;

                  return true;
          },
          [searchQuery, selectedCompany, selectedSource, showBookmarked, showUnread]
        );

    const updateStatsForNewArticle = useCallback((article: Article) => {
          setStats((prev) => {
                if (!prev) return prev;
                const publishedAt = new Date(article.publishedAt);
                const now = new Date();
                const isToday =
                  publishedAt.getFullYear() === now.getFullYear() &&
                  publishedAt.getMonth() === now.getMonth() &&
                  publishedAt.getDate() === now.getDate();

                return {
                      ...prev,
                      total: prev.total + 1,
                      unread: prev.unread + (article.isRead ? 0 : 1),
                      bookmarked: prev.bookmarked + (article.isBookmarked ? 1 : 0),
                      today: prev.today + (isToday ? 1 : 0),
                };
          });

          setSources((prev) => {
                const idx = prev.findIndex((s) => s.sourceId === article.sourceId);
                if (idx === -1) return prev;
                return prev.map((s, i) =>
                      i === idx ? { ...s, count: s.count + 1 } : s
                );
          });
    }, []);

    const normalizeRealtimeArticle = useCallback((article: RealtimeArticle): Article => ({
          id: article.id,
          url: article.url,
          title: article.title,
          description: article.description,
          content: undefined,
          author: undefined,
          imageUrl: article.imageUrl,
          mediaThumbnail: null,
          publishedAt: article.publishedAt,
          sourceName: article.sourceName,
          sourceId: article.sourceId,
          sourceType: article.sourceType,
          sourceColor: article.sourceColor ?? null,
          isRead: article.isRead ?? false,
          isBookmarked: article.isBookmarked ?? false,
          keywordMatches: undefined,
          companyMatches: undefined,
    }), []);

    // Real-time updates via Supabase Realtime (Postgres CDC)
    // Listens for INSERT, UPDATE, and DELETE events on the Article table
    const handleRealtimeNewArticle = useCallback(
          (newArticle: RealtimeArticle) => {
                  const article = normalizeRealtimeArticle(newArticle);
                  const shouldInsert = matchesActiveFilters(article);

                  updateStatsForNewArticle(article);

                  if (!shouldInsert) {
                        return;
                  }

                  setArticles((prev) => {
                        if (prev.some((a) => a.id === article.id)) return prev;
                        return [article, ...prev];
                  });
          },
          [matchesActiveFilters, normalizeRealtimeArticle, updateStatsForNewArticle]
        );

    const handleRealtimeDelete = useCallback((articleId: string) => {
          console.log("[Realtime] Removing article from feed:", articleId);
          setArticles((prev) => prev.filter((a) => a.id !== articleId));
    }, []);

    const handleRealtimeUpdate = useCallback((updatedArticle: RealtimeArticle) => {
          console.log("[Realtime] Updating article in feed:", updatedArticle.title);
          setArticles((prev) =>
                prev.map((a) =>
                      a.id === updatedArticle.id
                            ? { ...a, ...updatedArticle }
                            : a
                )
          );
    }, []);

    useRealtimeArticles({
          enabled: !isOffline,
          onStatusChange: setRealtimeStatus,
          onNewArticle: handleRealtimeNewArticle,
          onArticleDeleted: handleRealtimeDelete,
          onArticleUpdated: handleRealtimeUpdate,
    });

    // Refetch when filters change (debounced)
    useEffect(() => {
          if (debounceRef.current) {
                  clearTimeout(debounceRef.current);
          }

          debounceRef.current = setTimeout(() => {
                  fetchArticles();
                  setFocusedIndex(-1); // Reset focus when filters change
          }, 300);

          return () => {
                  if (debounceRef.current) {
                            clearTimeout(debounceRef.current);
                  }
          };
    }, [searchQuery, selectedSource, selectedCompany, showBookmarked, showUnread]);

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

    // Keyboard navigation
    useEffect(() => {
          const handleKeyDown = (e: KeyboardEvent) => {
                  // Ignore if typing in input
                  if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
                            return;
                  }

                  switch (e.key) {
                            case "ArrowDown":
                            case "j": // Vim-style
                                      e.preventDefault();
                                      setFocusedIndex((prev) => {
                                                const next = prev + 1;
                                                if (next < articles.length) {
                                                          articleRefs.current[next]?.scrollIntoView({ behavior: "smooth", block: "center" });
                                                          return next;
                                                }
                                                return prev;
                                      });
                                      break;

                            case "ArrowUp":
                            case "k": // Vim-style
                                      e.preventDefault();
                                      setFocusedIndex((prev) => {
                                                const next = prev - 1;
                                                if (next >= 0) {
                                                          articleRefs.current[next]?.scrollIntoView({ behavior: "smooth", block: "center" });
                                                          return next;
                                                } else if (prev === -1) {
                                                          return -1;
                                                }
                                                return 0;
                                      });
                                      break;

                            case "Enter":
                            case "o": // Vim-style open
                                      if (focusedIndex >= 0 && focusedIndex < articles.length) {
                                                e.preventDefault();
                                                const article = articles[focusedIndex];
                                                handleRead(article.id);
                                                window.open(article.url, "_blank");
                                      }
                                      break;

                            case "b": // Bookmark
                                      if (focusedIndex >= 0 && focusedIndex < articles.length) {
                                                e.preventDefault();
                                                handleBookmark(articles[focusedIndex].id);
                                      }
                                      break;

                            case "r": // Mark as read
                                      if (focusedIndex >= 0 && focusedIndex < articles.length) {
                                                e.preventDefault();
                                                handleRead(articles[focusedIndex].id);
                                      }
                                      break;

                            case "Escape":
                                      setFocusedIndex(-1);
                                      break;
                  }
          };

          window.addEventListener("keydown", handleKeyDown);
          return () => window.removeEventListener("keydown", handleKeyDown);
    }, [articles, focusedIndex]);

    // Handle refresh (manual sync for RSS tool)
    const handleRefresh = async () => {
          try {
                  const response = await fetch("/api/nyheter/sync", { method: "POST" });
                  if (response.ok) {
                            await fetchArticles();
                  }
          } catch {
                  // Ignore sync errors, just refetch
                  await fetchArticles();
          }
    };

    // Handle add feed
    const handleAddFeed = async (url: string, name?: string, category?: string, color?: string): Promise<{ success: boolean; error?: string; feedName?: string }> => {
          try {
                  const response = await fetch("/api/feeds", {
                            method: "POST",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({ url, name, category, color }),
                  });
                  const data = await response.json();
                  if (response.ok) {
                            await fetchArticles();
                            await refreshRssSources();
                            return { success: true, feedName: data.feed?.name };
                  }
                  return { success: false, error: data.error || "Kunde inte lägga till flödet" };
          } catch {
                  return { success: false, error: "Nätverksfel" };
          }
    };

    const handleFollowTopic = async (term: string): Promise<boolean> => {
          try {
                  const response = await fetch("/api/nyheter/keywords", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ term }),
                  });
                  if (response.ok) {
                        await fetchArticles();
                        return true;
                  }
                  return false;
          } catch {
                  return false;
          }
    };

    const handleIgnoreTopic = async (term: string): Promise<boolean> => {
          try {
                  const response = await fetch("/api/nyheter/ignore/terms", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ term }),
                  });
                  if (response.ok) {
                        await fetchArticles();
                        return true;
                  }
                  return false;
          } catch {
                  return false;
          }
    };

    const handleIgnoreSource = async (sourceId: string): Promise<boolean> => {
          try {
                  const response = await fetch("/api/nyheter/ignore/sources", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ sourceId }),
                  });
                  if (response.ok) {
                        await fetchArticles();
                        return true;
                  }
                  return false;
          } catch {
                  return false;
          }
    };

    // Handle remove feed
    const handleRemoveFeed = async (sourceId: string): Promise<boolean> => {
          try {
                  const response = await fetch(`/api/feeds/${sourceId}`, {
                            method: "DELETE",
                  });
                  if (response.ok) {
                            await fetchArticles();
                            await refreshRssSources();
                            return true;
                  }
                  return false;
          } catch {
                  return false;
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

    const handleOpenArticleModal = async (article: Article) => {
          setSelectedArticle(article);
          setIsArticleModalOpen(true);
          if (!article.isRead) {
                await handleRead(article.id);
          }
          if (article.content === undefined) {
                try {
                      const response = await fetch(`/api/nyheter/${article.id}`);
                      if (response.ok) {
                            const full = await response.json();
                            setSelectedArticle((prev) => (prev && prev.id === article.id ? { ...prev, ...full } : prev));
                      }
                } catch {
                      // Ignore fetch errors for modal content
                }
          }
    };

    // Loading skeleton with shimmer
    if (isLoading) {
          return (
                  <div className="space-y-6">
                          <NewsFilters
                                      sources={[]}
                                      onSearchChange={() => {}}
                                      onSourceChange={() => {}}
                                      onBookmarkedChange={() => {}}
                                      onUnreadChange={() => {}}
                                      isOffline={isOffline}
                                      realtimeStatus={realtimeStatus}
                                      layout={layout}
                                      onLayoutChange={setLayout}
                          />
                          <div className="flex flex-col gap-6 max-w-3xl mx-auto">
                            {Array.from({ length: 4 }).map((_, i) => (
                                <div
                                              key={i}
                                              className="bg-card rounded-2xl border p-6 space-y-4 animate-in fade-in duration-300"
                                              style={{ animationDelay: `${i * 100}ms` }}
                                >
                                              <div className="flex items-start gap-4">
                                                              <Skeleton shimmer className="w-16 h-16 rounded-lg flex-shrink-0" />
                                                              <div className="flex-1 space-y-3">
                                                                                <div className="flex items-center gap-2">
                                                                                                    <Skeleton shimmer className="h-5 w-24" />
                                                                                                    <Skeleton shimmer className="h-4 w-20" />
                                                                                </div>
                                                                                <Skeleton shimmer className="h-6 w-full" />
                                                                                <Skeleton shimmer className="h-6 w-4/5" />
                                                              </div>
                                              </div>
                                              <Skeleton shimmer className="h-20 w-full" />
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
      const hasFilters = !!(searchQuery || selectedSource || selectedCompany || showBookmarked || showUnread);
      return (
        <div className="space-y-6">
          <NewsFilters
            sources={sources}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            onSourceChange={setSelectedSource}
            onBookmarkedChange={setShowBookmarked}
            onUnreadChange={setShowUnread}
            onAddFeed={handleAddFeed}
            onRemoveFeed={handleRemoveFeed}
            onOpenRssTool={() => setIsRssToolOpen(true)}
            isOffline={isOffline}
            realtimeStatus={realtimeStatus}
            layout={layout}
            onLayoutChange={setLayout}
          />
          <EmptyNewsState
            hasFilters={hasFilters}
            onAddFeed={() => setIsRssToolOpen(true)}
          />
          {/* RSS Tool Dialog for adding feeds */}
          <RssToolDialog
            open={isRssToolOpen}
            onOpenChange={setIsRssToolOpen}
            sources={rssSources.map(s => ({
              id: s.feedId,
              name: s.sourceName,
              url: s.url,
              type: "rss",
              category: s.category,
              color: s.color,
              count: s.count,
            }))}
            onAddFeed={handleAddFeed}
            onRemoveFeed={handleRemoveFeed}
            onRefresh={handleRefresh}
          />
        </div>
      );
    }
  
    return (
          <div className="space-y-6" ref={containerRef}>
            {/* Filters */}
                <NewsFilters
                          sources={sources}
                          searchQuery={searchQuery}
                          onSearchChange={setSearchQuery}
                          onSourceChange={setSelectedSource}
                          onBookmarkedChange={setShowBookmarked}
                          onUnreadChange={setShowUnread}
                          onAddFeed={handleAddFeed}
                          onRemoveFeed={handleRemoveFeed}
                          onOpenRssTool={() => setIsRssToolOpen(true)}
                          isOffline={isOffline}
                          realtimeStatus={realtimeStatus}
                          layout={layout}
                          onLayoutChange={setLayout}
                        />

            {/* Vertical article feed with day groupings */}
                <div className="flex flex-col max-w-3xl mx-auto">
                  {groupArticlesByDay(articles).map((group) => (
                      <div key={group.label}>
                          <DaySection label={group.label} articleCount={group.articles.length} />
                          <div className="flex flex-col">
                              {group.articles.map((article) => {
                                  const globalIndex = articles.findIndex(a => a.id === article.id);
                                  return (
                                      <div
                                          key={article.id}
                                          ref={(el) => { articleRefs.current[globalIndex] = el; }}
                                      >
                                          <NewsItem
                                              article={article}
                                              onBookmark={handleBookmark}
                                              onRead={handleRead}
                                              onViewCompany={handleViewCompany}
                                              onOpen={handleOpenArticleModal}
                                              layout={layout}
                                              isFocused={focusedIndex === globalIndex}
                                              showGradientLine={true}
                                          />
                                      </div>
                                  );
                              })}
                          </div>
                      </div>
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

            {/* RSS Tool Dialog */}
            <RssToolDialog
              open={isRssToolOpen}
              onOpenChange={setIsRssToolOpen}
              sources={rssSources.map(s => ({
                id: s.feedId,  // Always use feedId for deletion (now always set)
                name: s.sourceName,
                url: s.url,
                type: "rss",
                category: s.category,
                color: s.color,
                count: s.count,
              }))}
              onAddFeed={handleAddFeed}
              onRemoveFeed={handleRemoveFeed}
              onRefresh={handleRefresh}
              initialUrl={pendingFeedUrl}
              onUrlProcessed={() => {
                setPendingFeedUrl(undefined);
                // Remove addFeed param from URL without page reload
                const url = new URL(window.location.href);
                url.searchParams.delete("addFeed");
                window.history.replaceState({}, "", url.toString());
              }}
            />

            {isArticleModalOpen && selectedArticle && (
              <ArticleModal
                article={selectedArticle}
                onClose={() => {
                  setIsArticleModalOpen(false);
                  setSelectedArticle(null);
                }}
                onBookmark={handleBookmark}
                onRead={handleRead}
                onFollowTopic={handleFollowTopic}
                onIgnoreTopic={handleIgnoreTopic}
                onIgnoreSource={handleIgnoreSource}
              />
            )}
          </div>
        );
}
