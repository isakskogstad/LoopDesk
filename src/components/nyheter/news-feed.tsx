"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Loader2, AlertCircle, Newspaper } from "lucide-react";
import { NewsItem } from "./news-item";
import { NewsFilters } from "./news-filters";
import { DaySection, groupArticlesByDay } from "./day-section";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";

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
    const [companies, setCompanies] = useState<Company[]>([]);
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
    const [selectedCompany, setSelectedCompany] = useState<string | undefined>();
    const [showBookmarked, setShowBookmarked] = useState(false);
    const [showUnread, setShowUnread] = useState(false);

    // Keyboard navigation state
    const [focusedIndex, setFocusedIndex] = useState<number>(-1);

    // Offline and new articles state
    const [isOffline, setIsOffline] = useState(false);
    const [newArticlesCount, setNewArticlesCount] = useState(0);
    const lastArticleCountRef = useRef<number>(0);

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

    // Initial load
    useEffect(() => {
          fetchArticles();
          fetchCompanies();
    }, []);

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

    // Check for new articles periodically (every 60 seconds)
    useEffect(() => {
          const checkNewArticles = async () => {
                  if (isOffline || document.hidden) return;

                  try {
                            const response = await fetch("/api/nyheter?limit=1&fast=true");
                            if (response.ok) {
                                      const data = await response.json();
                                      const currentTotal = data.stats?.total || 0;

                                      // If we have a previous count and current is higher, show badge
                                      if (lastArticleCountRef.current > 0 && currentTotal > lastArticleCountRef.current) {
                                                setNewArticlesCount(currentTotal - lastArticleCountRef.current);
                                      }
                            }
                  } catch {
                            // Ignore errors for background check
                  }
          };

          const interval = setInterval(checkNewArticles, 60000); // Every minute

          return () => clearInterval(interval);
    }, [isOffline]);

    // Update lastArticleCountRef when articles change
    useEffect(() => {
          if (stats?.total) {
                  lastArticleCountRef.current = stats.total;
          }
    }, [stats?.total]);

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

    // Handle refresh (sync from FreshRSS)
    const handleRefresh = async () => {
          setIsRefreshing(true);
          setNewArticlesCount(0); // Clear badge when refreshing
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

    // Handle add feed
    const handleAddFeed = async (url: string): Promise<boolean> => {
          try {
                  const response = await fetch("/api/feeds", {
                            method: "POST",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({ url }),
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
                                      onRefresh={() => {}}
                                      isOffline={isOffline}
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
          return (
                  <div className="space-y-6">
                          <NewsFilters
                                      sources={sources}
                                      searchQuery={searchQuery}
                                      onSearchChange={setSearchQuery}
                                      onSourceChange={setSelectedSource}
                                      onBookmarkedChange={setShowBookmarked}
                                      onUnreadChange={setShowUnread}
                                      onRefresh={handleRefresh}
                                      isRefreshing={isRefreshing}
                                      onAddFeed={handleAddFeed}
                                      onRemoveFeed={handleRemoveFeed}
                                      newArticlesCount={newArticlesCount}
                                      isOffline={isOffline}
                                    />
                          <div className="flex flex-col items-center justify-center py-12 text-center">
                                    <Newspaper className="w-12 h-12 text-muted-foreground/50 mb-4" />
                                    <h3 className="text-lg font-semibold mb-2">Inga nyheter</h3>
                                    <p className="text-muted-foreground mb-4">
                                      {searchQuery || selectedSource || selectedCompany || showBookmarked || showUnread
                                                      ? "Inga nyheter matchar dina filter"
                                                      : "Inga nyheter har synkroniserats ännu"}
                                    </p>
                            {!searchQuery && !selectedSource && !selectedCompany && (
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
          <div className="space-y-6" ref={containerRef}>
            {/* Filters */}
                <NewsFilters
                          sources={sources}
                          searchQuery={searchQuery}
                          onSearchChange={setSearchQuery}
                          onSourceChange={setSelectedSource}
                          onBookmarkedChange={setShowBookmarked}
                          onUnreadChange={setShowUnread}
                          onRefresh={handleRefresh}
                          isRefreshing={isRefreshing}
                          onAddFeed={handleAddFeed}
                          onRemoveFeed={handleRemoveFeed}
                          newArticlesCount={newArticlesCount}
                          isOffline={isOffline}
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
          </div>
        );
}
