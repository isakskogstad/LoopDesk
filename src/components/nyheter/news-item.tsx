"use client";

import { useState, useRef } from "react";
import {
      ExternalLink,
      Clock,
      Building2,
      Bookmark,
      BookmarkCheck,
      ChevronDown,
      ChevronUp,
      Eye,
      EyeOff,
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
      isFocused?: boolean;
      onOpenArticle?: (url: string, id: string) => void;
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
      isFocused = false,
      onOpenArticle,
}: NewsItemProps) {
      const [expanded, setExpanded] = useState(false);
      const [imageError, setImageError] = useState(false);
      const [isBookmarkAnimating, setIsBookmarkAnimating] = useState(false);
      const [isReadAnimating, setIsReadAnimating] = useState(false);
      const articleRef = useRef<HTMLElement>(null);

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

      // Click on card opens article in new tab
      const handleCardClick = (e: React.MouseEvent) => {
              // Don't open if clicking on interactive elements
              const target = e.target as HTMLElement;
              if (target.closest('button') || target.closest('a')) {
                        return;
              }

              if (onRead && !article.isRead) {
                        setIsReadAnimating(true);
                        setTimeout(() => setIsReadAnimating(false), 300);
                        onRead(article.id);
              }

              if (onOpenArticle) {
                        onOpenArticle(article.url, article.id);
              } else {
                        window.open(article.url, '_blank');
              }
      };

      // Bookmark with animation
      const handleBookmark = (e: React.MouseEvent) => {
              e.stopPropagation();
              setIsBookmarkAnimating(true);
              setTimeout(() => setIsBookmarkAnimating(false), 400);
              onBookmark?.(article.id);
      };

      // Toggle inline preview
      const handleTogglePreview = (e: React.MouseEvent) => {
              e.stopPropagation();
              setExpanded(!expanded);
      };

      return (
              <article
                        ref={articleRef}
                        className={`group bg-card rounded-2xl border overflow-hidden cursor-pointer
                                    hover:shadow-xl hover:border-primary/20 transition-all duration-300
                                    ${article.isRead ? "border-border/50" : "border-border dark:border-gray-800"}
                                    ${isFocused ? "ring-2 ring-primary ring-offset-2 ring-offset-background shadow-lg" : ""}
                                    ${isReadAnimating ? "animate-pulse bg-primary/5" : ""}
                        `}
                        onClick={handleCardClick}
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
                                      
                                          {/* Actions - always visible on mobile, hover on desktop */}
                                                  <div className="flex items-center gap-1 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                                                      {/* Preview toggle */}
                                                      <button
                                                                onClick={handleTogglePreview}
                                                                className={`p-2 rounded-lg transition-colors ${
                                                                          expanded
                                                                            ? "text-primary bg-primary/10"
                                                                            : "text-muted-foreground/50 hover:text-muted-foreground hover:bg-secondary"
                                                                }`}
                                                                title={expanded ? "Dölj förhandsgranskning" : "Visa förhandsgranskning"}
                                                      >
                                                                {expanded ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                                      </button>

                                                      {/* Bookmark */}
                                                      {onBookmark && (
                                          <button
                                                                onClick={handleBookmark}
                                                                className={`p-2 rounded-lg transition-all ${
                                                                                        article.isBookmarked
                                                                                          ? "text-amber-500 bg-amber-50 dark:bg-amber-500/10"
                                                                                          : "text-muted-foreground/50 hover:text-muted-foreground hover:bg-secondary"
                                                                } ${isBookmarkAnimating ? "scale-125" : "scale-100"}`}
                                                                title={article.isBookmarked ? "Ta bort bokmärke" : "Spara"}
                                                              >
                                              {article.isBookmarked ? (
                                                                                      <BookmarkCheck className={`w-4 h-4 ${isBookmarkAnimating ? "animate-bounce" : ""}`} />
                                                                                    ) : (
                                                                                      <Bookmark className="w-4 h-4" />
                                                                                    )}
                                          </button>
                                                                )}

                                                                {/* Open in new tab */}
                                                                <a
                                                                                    href={article.url}
                                                                                    target="_blank"
                                                                                    rel="noopener noreferrer"
                                                                                    onClick={(e) => e.stopPropagation()}
                                                                                    className="p-2 rounded-lg text-muted-foreground/50 hover:text-muted-foreground hover:bg-secondary transition-colors"
                                                                                    title="Öppna i ny flik"
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
                            
                                {/* Description with smooth expand animation */}
                                {hasDescription && (
                                      <div className={`overflow-hidden transition-all duration-300 ease-in-out ${
                                                expanded ? "max-h-[800px]" : "max-h-[4.5rem]"
                                      }`}>
                                                <p
                                                          className="text-muted-foreground text-sm leading-relaxed mb-4"
                                                          dangerouslySetInnerHTML={{
                                                                      __html: highlightText(article.description || "", keywords),
                                                          }}
                                                />
                                      </div>
                                    )}

                                {/* Expanded preview section */}
                                {expanded && (
                                      <div className="border-t border-border/50 pt-4 mt-2 animate-in fade-in slide-in-from-top-2 duration-300">
                                                <div className="flex items-center justify-between text-xs text-muted-foreground mb-3">
                                                          <span>Förhandsgranskning</span>
                                                          <a
                                                                      href={article.url}
                                                                      target="_blank"
                                                                      rel="noopener noreferrer"
                                                                      onClick={(e) => e.stopPropagation()}
                                                                      className="flex items-center gap-1 text-primary hover:underline"
                                                          >
                                                                      Läs hela artikeln
                                                                      <ExternalLink className="w-3 h-3" />
                                                          </a>
                                                </div>
                                      </div>
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
                            
                            </div>
                    </div>
              </article>
            );
}
