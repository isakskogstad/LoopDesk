"use client";

import { useState } from "react";
import {
      ExternalLink,
      Clock,
      Building2,
      Newspaper,
      Bookmark,
      BookmarkCheck,
      ChevronDown,
      ChevronUp,
} from "lucide-react";
import { formatRelativeTime } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

// Article type from API
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

interface NewsItemProps {
      article: Article;
      onBookmark?: (id: string) => void;
      onRead?: (id: string) => void;
      onViewCompany?: (orgNumber: string) => void;
      highlightKeywords?: boolean;
}

// Source type colors
const SOURCE_COLORS: Record<string, { color: string; bg: string }> = {
      rss: { color: "#f97316", bg: "#fff7ed" },
      twitter: { color: "#1d9bf0", bg: "#e8f5fd" },
      linkedin: { color: "#0a66c2", bg: "#e8f1f8" },
      youtube: { color: "#ff0000", bg: "#fee2e2" },
      github: { color: "#333333", bg: "#f1f5f9" },
    default: { color: "#6366f1", bg: "#eef2ff" },
};

function getSourceColor(sourceType: string, customColor: string | null) {
      if (customColor) {
              return { color: customColor, bg: `${customColor}15` };
      }
      return SOURCE_COLORS[sourceType] || SOURCE_COLORS.default;
}

function highlightText(text: string, keywords: { term: string; color: string | null }[]) {
      if (!keywords.length) return text;

      let result = text;
      for (const kw of keywords) {
              const regex = new RegExp(`(${escapeRegex(kw.term)})`, "gi");
              const color = kw.color || "#fbbf24";
              result = result.replace(
                        regex,
                        `<mark style="background-color: ${color}30; color: inherit; padding: 0 2px; border-radius: 2px;">$1</mark>`
                      );
      }
      return result;
}

function escapeRegex(str: string): string {
      return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export function NewsItem({
      article,
      onBookmark,
      onRead,
      onViewCompany,
      highlightKeywords = true,
}: NewsItemProps) {
      const [expanded, setExpanded] = useState(false);
      const [imageError, setImageError] = useState(false);

      const sourceColor = getSourceColor(article.sourceType, article.sourceColor);
      const hasDescription = article.description && article.description.length > 0;
      const isLongDescription = article.description && article.description.length > 280;
      const hasImage = article.imageUrl && !imageError;

      const keywords = highlightKeywords
        ? (article.keywordMatches || []).map((m) => m.keyword)
              : [];

      const displayDescription =
              expanded || !isLongDescription
          ? article.description
                : article.description?.slice(0, 280) + "...";

      const handleClick = () => {
              if (onRead && !article.isRead) {
                        onRead(article.id);
              }
      };

      return (
              <article
                        className={`group bg-card rounded-2xl border overflow-hidden hover:shadow-xl hover:border-primary/20 transition-all duration-300 ${
                                    article.isRead
                                      ? "border-border/50 opacity-80"
                                      : "border-border dark:border-gray-800"
                        }`}
                        onClick={handleClick}
                      >
                    <div className="flex flex-col sm:flex-row">
                        {/* Image section */}
                        {hasImage && (
                                    <div className="relative w-full sm:w-56 h-48 sm:h-auto flex-shrink-0 overflow-hidden">
                                                <img
                                                                  src={article.imageUrl!}
                                                                  alt=""
                                                                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                                                                  onError={() => setImageError(true)}
                                                                />
                                                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent sm:bg-gradient-to-r" />
                                    </div>
                            )}
                    
                        {/* Content section */}
                            <div className="flex-1 p-5 sm:p-6">
                                {/* Header with source and actions */}
                                      <div className="flex items-start justify-between gap-3 mb-3">
                                                  <div className="flex items-center gap-2 flex-wrap">
                                                                <span
                                                                                    className="text-xs font-semibold px-2.5 py-1 rounded-full"
                                                                                    style={{
                                                                                                          backgroundColor: sourceColor.bg,
                                                                                                          color: sourceColor.color,
                                                                                        }}
                                                                                  >
                                                                    {article.sourceName}
                                                                </span>
                                                                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                                                                                <Clock className="w-3.5 h-3.5" />
                                                                                <span>{formatRelativeTime(article.publishedAt)}</span>
                                                                </div>
                                                  </div>
                                      
                                          {/* Actions */}
                                                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                      {onBookmark && (
                                          <button
                                                                onClick={(e) => {
                                                                                        e.stopPropagation();
                                                                                        onBookmark(article.id);
                                                                }}
                                                                className={`p-2 rounded-lg transition-colors ${
                                                                                        article.isBookmarked
                                                                                          ? "text-amber-500 bg-amber-50 dark:bg-amber-500/10"
                                                                                          : "text-muted-foreground/50 hover:text-muted-foreground hover:bg-secondary"
                                                                }`}
                                                                title={article.isBookmarked ? "Ta bort bokmärke" : "Spara"}
                                                              >
                                              {article.isBookmarked ? (
                                                                                      <BookmarkCheck className="w-4 h-4" />
                                                                                    ) : (
                                                                                      <Bookmark className="w-4 h-4" />
                                                                                    )}
                                          </button>
                                                                )}
                                                                <a
                                                                                    href={article.url}
                                                                                    target="_blank"
                                                                                    rel="noopener noreferrer"
                                                                                    onClick={(e) => e.stopPropagation()}
                                                                                    className="p-2 rounded-lg text-muted-foreground/50 hover:text-muted-foreground hover:bg-secondary transition-colors"
                                                                                    title="Öppna artikel"
                                                                                  >
                                                                                <ExternalLink className="w-4 h-4" />
                                                                </a>
                                                  </div>
                                      </div>
                            
                                {/* Title */}
                                      <h3
                                                      className={`font-bold text-xl leading-tight mb-3 group-hover:text-primary transition-colors ${
                                                                        article.isRead ? "text-muted-foreground" : "text-foreground"
                                                      }`}
                                                      dangerouslySetInnerHTML={{
                                                                        __html: highlightText(article.title, keywords),
                                                      }}
                                                    />
                            
                                {/* Description */}
                                {hasDescription && (
                                      <p
                                                        className={`text-muted-foreground text-sm leading-relaxed mb-4 ${
                                                                            !expanded && isLongDescription ? "line-clamp-3" : ""
                                                        }`}
                                                        dangerouslySetInnerHTML={{
                                                                            __html: highlightText(displayDescription || "", keywords),
                                                        }}
                                                      />
                                    )}
                            
                                {/* Keyword badges */}
                                {article.keywordMatches && article.keywordMatches.length > 0 && (
                                      <div className="flex flex-wrap gap-1.5 mb-4">
                                          {article.keywordMatches.map((match) => (
                                                          <Badge
                                                                                key={match.keyword.id}
                                                                                variant="secondary"
                                                                                className="text-xs font-medium"
                                                                                style={{
                                                                                                        backgroundColor: match.keyword.color
                                                                                                                                  ? `${match.keyword.color}20`
                                                                                                                                  : undefined,
                                                                                                        color: match.keyword.color || undefined,
                                                                                    }}
                                                                              >
                                                              {match.keyword.term}
                                                          </Badge>
                                                        ))}
                                      </div>
                                      )}
                            
                                {/* Company matches */}
                                {article.companyMatches && article.companyMatches.length > 0 && (
                                      <div className="flex flex-wrap gap-2 mb-4">
                                          {article.companyMatches.map((match) => (
                                                          <button
                                                                                key={match.company.id}
                                                                                onClick={(e) => {
                                                                                                        e.stopPropagation();
                                                                                                        onViewCompany?.(match.company.orgNumber);
                                                                                    }}
                                                                                className="flex items-center gap-1.5 text-xs text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium transition-colors bg-blue-50 dark:bg-blue-500/10 px-2.5 py-1.5 rounded-lg"
                                                                              >
                                                                            <Building2 className="w-3.5 h-3.5" />
                                                                            <span>{match.company.name}</span>
                                                          </button>
                                                        ))}
                                      </div>
                                      )}
                            
                                {/* Expand button */}
                                {isLongDescription && (
                                      <button
                                                        onClick={(e) => {
                                                                            e.stopPropagation();
                                                                            setExpanded(!expanded);
                                                        }}
                                                        className="flex items-center gap-1 text-sm text-primary hover:text-primary/80 font-medium transition-colors"
                                                      >
                                                    <span>{expanded ? "Visa mindre" : "Läs mer"}</span>
                                          {expanded ? (
                                                                          <ChevronUp className="w-4 h-4" />
                                                                        ) : (
                                                                          <ChevronDown className="w-4 h-4" />
                                                                        )}
                                      </button>
                                      )}
                            </div>
                    </div>
              </article>
            );
}
