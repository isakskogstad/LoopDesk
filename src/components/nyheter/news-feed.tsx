"use client";

import { useState, useCallback, useMemo } from "react";
import useSWR from "swr";
import { RefreshCw, Filter, ExternalLink, BookOpen, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { NewsItemCard } from "@/components/nyheter/news-item";
import { defaultTags, getEnabledFeeds } from "@/lib/nyheter/feeds";
import type { NewsItem, FeedConfig, Tag, ArticleParseResult } from "@/lib/nyheter/types";

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
}

export function NewsFeed({ allSources }: NewsFeedProps) {
  const [tags] = useState<Tag[]>(defaultTags);
  const [selectedSource, setSelectedSource] = useState<string | null>(null);
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
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

  // Filter items
  const filteredItems = useMemo(() => {
    let items = allItems;

    // Filter by source
    if (selectedSource) {
      items = items.filter((item) => item.source.id === selectedSource);
    }

    // Filter by tag
    if (selectedTag) {
      const tagFeedIds = tags.find((t) => t.id === selectedTag)?.feedIds || [];
      items = items.filter((item) => tagFeedIds.includes(item.source.id));
    }

    return items;
  }, [allItems, selectedSource, selectedTag, tags]);

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

  return (
    <div className="space-y-6">
      {/* Tag filter */}
      <div className="flex items-center gap-2 flex-wrap">
        <span className="text-sm text-gray-500">Kategorier:</span>
        <Badge
          variant={selectedTag === null ? "default" : "outline"}
          className="cursor-pointer"
          onClick={() => setSelectedTag(null)}
        >
          Alla
        </Badge>
        {tags.map((tag) => (
          <Badge
            key={tag.id}
            variant={selectedTag === tag.id ? "default" : "outline"}
            className="cursor-pointer"
            style={
              selectedTag === tag.id
                ? { backgroundColor: tag.color, borderColor: tag.color }
                : { borderColor: tag.color, color: tag.color }
            }
            onClick={() => setSelectedTag(tag.id === selectedTag ? null : tag.id)}
          >
            {tag.name}
          </Badge>
        ))}
      </div>

      {/* Source filter + refresh */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-2 flex-wrap">
          <Filter className="w-4 h-4 text-gray-500" />
          <Badge
            variant={selectedSource === null ? "default" : "outline"}
            className="cursor-pointer"
            onClick={() => setSelectedSource(null)}
          >
            Alla ({allItems.length})
          </Badge>
          {enabledFeeds.map((feed) => {
            const count = allItems.filter((i) => i.source.id === feed.id).length;
            return (
              <Badge
                key={feed.id}
                variant={selectedSource === feed.id ? "default" : "outline"}
                className="cursor-pointer"
                style={
                  selectedSource === feed.id
                    ? { backgroundColor: feed.color, borderColor: feed.color }
                    : { borderColor: feed.color, color: feed.color }
                }
                onClick={() =>
                  setSelectedSource(feed.id === selectedSource ? null : feed.id)
                }
              >
                {feed.name} ({count})
              </Badge>
            );
          })}
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={handleRefresh}
          disabled={isLoading}
        >
          <RefreshCw className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`} />
          Uppdatera
        </Button>
      </div>

      {/* Error state */}
      {error && (
        <div className="text-center py-8 text-red-500">
          <p>Kunde inte hämta nyheter</p>
        </div>
      )}

      {/* Feed items */}
      <div className="space-y-4 stagger-fade-in">
        {isLoading && allItems.length === 0 ? (
          Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="news-card space-y-2 shimmer">
              <div className="flex items-center gap-2">
                <Skeleton className="h-5 w-24" />
                <Skeleton className="h-4 w-16" />
              </div>
              <Skeleton className="h-6 w-3/4" />
              <Skeleton className="h-4 w-full" />
            </div>
          ))
        ) : filteredItems.length > 0 ? (
          filteredItems.map((item) => (
            <NewsItemCard
              key={item.id}
              item={item}
              onReadMore={() => loadFullArticle(item)}
            />
          ))
        ) : (
          <div className="text-center py-12 text-gray-500">
            <p>Inga nyheter hittades</p>
          </div>
        )}
      </div>

      {/* Article modal */}
      {selectedArticle && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 animate-fade-in">
          <Card className="article-modal w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col">
            <CardHeader className="flex-shrink-0 border-b">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <CardTitle className="text-xl">
                    {articleContent?.title || selectedArticle.title}
                  </CardTitle>
                  <div className="flex items-center gap-2 mt-2 text-sm text-gray-500">
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
                      Öppna
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
