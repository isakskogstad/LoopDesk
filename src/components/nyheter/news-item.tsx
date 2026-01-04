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

  const sourceColor = getSourceColor(article.sourceType, article.sourceColor);
  const hasDescription = article.description && article.description.length > 0;
  const isLongDescription = article.description && article.description.length > 200;

  const keywords = highlightKeywords
    ? (article.keywordMatches || []).map((m) => m.keyword)
    : [];

  const displayDescription =
    expanded || !isLongDescription
      ? article.description
      : article.description?.slice(0, 200) + "...";

  const handleClick = () => {
    if (onRead && !article.isRead) {
      onRead(article.id);
    }
  };

  return (
    <article
      className={`bg-card rounded-xl border overflow-hidden hover:shadow-lg transition-all duration-200 ${
        article.isRead
          ? "border-border/50 opacity-75"
          : "border-border dark:border-gray-800"
      }`}
      onClick={handleClick}
    >
      <div className="p-5">
        {/* Header */}
        <div className="flex items-start gap-4 mb-3">
          {/* Source icon/image */}
          <div
            className="w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0"
            style={{ backgroundColor: sourceColor.bg }}
          >
            {article.imageUrl ? (
              <img
                src={article.imageUrl}
                alt=""
                className="w-full h-full object-cover rounded-lg"
                onError={(e) => {
                  e.currentTarget.style.display = "none";
                }}
              />
            ) : (
              <Newspaper className="w-6 h-6" style={{ color: sourceColor.color }} />
            )}
          </div>

          <div className="flex-1 min-w-0">
            {/* Source and date */}
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              <span
                className="text-xs font-medium px-2 py-0.5 rounded-full"
                style={{
                  backgroundColor: sourceColor.bg,
                  color: sourceColor.color,
                }}
              >
                {article.sourceName}
              </span>
              <div className="flex items-center gap-1 text-xs text-muted-foreground/70">
                <Clock className="w-3 h-3" />
                <span>{formatRelativeTime(article.publishedAt)}</span>
              </div>
            </div>

            {/* Title */}
            <h3
              className={`font-semibold text-lg leading-snug line-clamp-2 ${
                article.isRead ? "text-muted-foreground" : "text-foreground"
              }`}
              dangerouslySetInnerHTML={{
                __html: highlightText(article.title, keywords),
              }}
            />
          </div>

          {/* Actions */}
          <div className="flex items-center gap-1">
            {/* Bookmark button */}
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

            {/* External link */}
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

        {/* Description */}
        {hasDescription && (
          <div className="mb-3">
            <p
              className={`text-muted-foreground text-sm leading-relaxed ${
                !expanded && isLongDescription ? "line-clamp-3" : ""
              }`}
              dangerouslySetInnerHTML={{
                __html: highlightText(displayDescription || "", keywords),
              }}
            />
          </div>
        )}

        {/* Keyword badges */}
        {article.keywordMatches && article.keywordMatches.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-3">
            {article.keywordMatches.map((match) => (
              <Badge
                key={match.keyword.id}
                variant="secondary"
                className="text-xs"
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
          <div className="flex flex-wrap gap-2 mb-3">
            {article.companyMatches.map((match) => (
              <button
                key={match.company.id}
                onClick={(e) => {
                  e.stopPropagation();
                  onViewCompany?.(match.company.orgNumber);
                }}
                className="flex items-center gap-1.5 text-xs text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium transition-colors bg-blue-50 dark:bg-blue-500/10 px-2 py-1 rounded-md"
              >
                <Building2 className="w-3 h-3" />
                <span>{match.company.name}</span>
              </button>
            ))}
          </div>
        )}

        {/* Footer */}
        {isLongDescription && (
          <div className="pt-3 border-t border-border dark:border-gray-800">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setExpanded(!expanded);
              }}
              className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              <span>{expanded ? "Visa mindre" : "Visa mer"}</span>
              {expanded ? (
                <ChevronUp className="w-4 h-4" />
              ) : (
                <ChevronDown className="w-4 h-4" />
              )}
            </button>
          </div>
        )}
      </div>
    </article>
  );
}
