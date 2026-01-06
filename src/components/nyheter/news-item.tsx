"use client";

import { useState, useRef } from "react";
import {
    ExternalLink,
    Bookmark,
    BookmarkCheck,
    Share2,
    ImageOff,
} from "lucide-react";
import { formatRelativeTime } from "@/lib/utils";

// Source favicon helper
function getSourceFavicon(url: string, sourceName: string): string {
    try {
        const domain = new URL(url).hostname;
        return `https://www.google.com/s2/favicons?domain=${domain}&sz=32`;
    } catch {
        const knownSources: Record<string, string> = {
            "Dagens Industri": "https://www.google.com/s2/favicons?domain=di.se&sz=32",
            "Svenska Dagbladet": "https://www.google.com/s2/favicons?domain=svd.se&sz=32",
            "Aftonbladet": "https://www.google.com/s2/favicons?domain=aftonbladet.se&sz=32",
            "Expressen": "https://www.google.com/s2/favicons?domain=expressen.se&sz=32",
            "SVT Nyheter": "https://www.google.com/s2/favicons?domain=svt.se&sz=32",
            "DN": "https://www.google.com/s2/favicons?domain=dn.se&sz=32",
            "Breakit": "https://www.google.com/s2/favicons?domain=breakit.se&sz=32",
            "Realtid": "https://www.google.com/s2/favicons?domain=realtid.se&sz=32",
            "Privata Affärer": "https://www.google.com/s2/favicons?domain=privataaffarer.se&sz=32",
        };
        return knownSources[sourceName] || "";
    }
}

// Article type
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
    showGradientLine?: boolean;
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

// Format time with optional day indicator
function formatTimeWithDay(date: Date | string): { time: string; day?: string } {
    const d = new Date(date);
    const now = new Date();
    const time = d.toLocaleTimeString("sv-SE", { hour: "2-digit", minute: "2-digit" });

    // Check if today
    if (d.toDateString() === now.toDateString()) {
        return { time };
    }

    // Check if yesterday
    const yesterday = new Date(now);
    yesterday.setDate(yesterday.getDate() - 1);
    if (d.toDateString() === yesterday.toDateString()) {
        return { time, day: "Igår" };
    }

    // Check if this week
    const weekAgo = new Date(now);
    weekAgo.setDate(weekAgo.getDate() - 7);
    if (d > weekAgo) {
        const dayName = d.toLocaleDateString("sv-SE", { weekday: "short" });
        return { time, day: dayName.charAt(0).toUpperCase() + dayName.slice(1) };
    }

    // Older
    return { time, day: d.toLocaleDateString("sv-SE", { day: "numeric", month: "short" }) };
}

export function NewsItem({
    article,
    onBookmark,
    onRead,
    onViewCompany,
    highlightKeywords = true,
    isFocused = false,
    showGradientLine = true,
}: NewsItemProps) {
    const [expanded, setExpanded] = useState(false);
    const [imageError, setImageError] = useState(false);
    const [faviconError, setFaviconError] = useState(false);
    const [isBookmarkAnimating, setIsBookmarkAnimating] = useState(false);
    const articleRef = useRef<HTMLElement>(null);

    const hasDescription = article.description && article.description.length > 0;
    const hasImage = article.imageUrl && !imageError;
    const faviconUrl = getSourceFavicon(article.url, article.sourceName);
    const { time, day } = formatTimeWithDay(article.publishedAt);

    const keywords = highlightKeywords
        ? (article.keywordMatches || []).map((m) => m.keyword)
        : [];

    // Click handler
    const handleCardClick = (e: React.MouseEvent) => {
        const target = e.target as HTMLElement;
        if (target.closest('button') || target.closest('a')) {
            return;
        }
        setExpanded(!expanded);
    };

    // Bookmark with animation
    const handleBookmark = (e: React.MouseEvent) => {
        e.stopPropagation();
        setIsBookmarkAnimating(true);
        setTimeout(() => setIsBookmarkAnimating(false), 400);
        onBookmark?.(article.id);
    };

    // Open article
    const handleOpenArticle = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (onRead && !article.isRead) {
            onRead(article.id);
        }
        window.open(article.url, '_blank');
    };

    return (
        <article
            ref={articleRef}
            className={`
                group relative grid gap-3 sm:gap-4 md:gap-5 py-4 sm:py-5 md:py-6 cursor-pointer
                transition-all duration-200 ease-out
                grid-cols-[40px_1fr] sm:grid-cols-[48px_1fr] md:grid-cols-[60px_1fr_160px] lg:grid-cols-[60px_1fr_180px]
                ${article.isRead ? "opacity-60" : ""}
                ${isFocused ? "ring-2 ring-primary ring-offset-2 ring-offset-background rounded-xl focus-ring" : ""}
                ${expanded ? "bg-secondary/30 -mx-2 sm:-mx-3 md:-mx-4 px-2 sm:px-3 md:px-4 rounded-xl" : ""}
                hover:bg-secondary/20 hover:-mx-2 sm:hover:-mx-3 md:hover:-mx-4 hover:px-2 sm:hover:px-3 md:hover:px-4 hover:rounded-xl
            `}
            style={{ minHeight: 'auto', alignItems: 'start' }}
            onClick={handleCardClick}
        >
            {/* Gradient line separator */}
            {showGradientLine && !expanded && (
                <div
                    className="absolute bottom-0 left-[40px] sm:left-[48px] md:left-[60px] right-0 h-px opacity-50
                               bg-gradient-to-r from-border via-muted-foreground/30 to-transparent
                               group-hover:opacity-0 transition-opacity"
                />
            )}

            {/* Left meta column - time & source */}
            <div className="flex flex-col items-center gap-2 sm:gap-3 pt-0.5 sm:pt-1">
                <div className="text-center">
                    <div className="font-mono text-[10px] sm:text-[11px] font-medium text-muted-foreground tabular-nums">
                        {time}
                    </div>
                    {day && (
                        <div className="font-mono text-[9px] sm:text-[10px] text-muted-foreground/70 mt-0.5 tabular-nums">
                            {day}
                        </div>
                    )}
                </div>
                {faviconUrl && !faviconError && (
                    <div className="w-5 h-5 sm:w-6 sm:h-6 md:w-7 md:h-7 rounded-md overflow-hidden transition-transform group-hover:scale-110">
                        <img
                            src={faviconUrl}
                            alt=""
                            className="w-full h-full object-cover"
                            onError={() => setFaviconError(true)}
                        />
                    </div>
                )}
            </div>

            {/* Content column */}
            <div className="min-w-0 flex flex-col">
                {/* Title */}
                <h2
                    className={`
                        text-[15px] sm:text-[16px] md:text-[17px] font-semibold leading-snug mb-2 sm:mb-2.5
                        transition-colors group-hover:text-foreground
                        ${article.isRead ? "text-muted-foreground" : "text-foreground"}
                    `}
                    dangerouslySetInnerHTML={{
                        __html: highlightText(article.title, keywords),
                    }}
                />

                {/* Description */}
                {hasDescription && (
                    <p
                        className={`
                            text-sm text-muted-foreground flex-1 prose-readable
                            ${expanded ? "" : "line-clamp-3"}
                        `}
                        dangerouslySetInnerHTML={{
                            __html: highlightText(article.description || "", keywords),
                        }}
                    />
                )}

                {/* Keyword & company badges */}
                {(article.keywordMatches?.length || article.companyMatches?.length) && (
                    <div className="flex flex-wrap gap-1.5 mt-3">
                        {article.keywordMatches?.map((match) => (
                            <span
                                key={match.keyword.id}
                                className="text-xs font-medium px-2 py-0.5 rounded-md"
                                style={{
                                    backgroundColor: match.keyword.color
                                        ? `${match.keyword.color}20`
                                        : 'hsl(var(--secondary))',
                                    color: match.keyword.color || 'hsl(var(--muted-foreground))',
                                }}
                            >
                                {match.keyword.term}
                            </span>
                        ))}
                        {article.companyMatches?.map((match) => (
                            <button
                                key={match.company.id}
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onViewCompany?.(match.company.orgNumber);
                                }}
                                className="text-xs font-medium px-2 py-0.5 rounded-md
                                           bg-blue-500/10 text-blue-600 dark:text-blue-400
                                           hover:bg-blue-500/20 transition-colors"
                            >
                                {match.company.name}
                            </button>
                        ))}
                    </div>
                )}

                {/* Expanded actions */}
                {expanded && (
                    <div className="mt-4 sm:mt-5 pt-4 sm:pt-5 border-t border-border/50 animate-in fade-in slide-in-from-top-2 duration-300">
                        <div className="flex flex-wrap gap-2">
                            <button
                                onClick={handleBookmark}
                                data-bookmarked={article.isBookmarked}
                                className={`
                                    bookmark-btn flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 sm:py-2.5 rounded-lg text-xs sm:text-sm font-medium
                                    border transition-all duration-200
                                    ${article.isBookmarked
                                        ? "bg-amber-500/10 border-amber-500/30 text-amber-600 dark:text-amber-400"
                                        : "bg-secondary border-border text-muted-foreground hover:text-foreground hover:border-muted-foreground"
                                    }
                                    hover:-translate-y-0.5 hover:shadow-md active:scale-95
                                    ${isBookmarkAnimating ? "scale-105" : ""}
                                `}
                            >
                                {article.isBookmarked ? (
                                    <BookmarkCheck className={`w-4 h-4 ${isBookmarkAnimating ? "animate-bounce" : ""}`} />
                                ) : (
                                    <Bookmark className="w-4 h-4" />
                                )}
                                <span className="hidden xs:inline">{article.isBookmarked ? "Sparad" : "Spara"}</span>
                            </button>
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    navigator.share?.({ url: article.url, title: article.title });
                                }}
                                className="flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 sm:py-2.5 rounded-lg text-xs sm:text-sm font-medium
                                           bg-secondary border border-border text-muted-foreground
                                           hover:text-foreground hover:border-muted-foreground
                                           hover:-translate-y-0.5 hover:shadow-lg transition-all duration-200"
                            >
                                <Share2 className="w-4 h-4" />
                                <span className="hidden xs:inline">Dela</span>
                            </button>
                            <button
                                onClick={handleOpenArticle}
                                className="flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 sm:py-2.5 rounded-lg text-xs sm:text-sm font-medium
                                           bg-foreground text-background flex-1 sm:flex-none justify-center
                                           hover:-translate-y-0.5 hover:shadow-lg transition-all duration-200"
                            >
                                Läs artikel
                                <ExternalLink className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* Image or fallback - hidden on mobile */}
            {!expanded && (
                hasImage ? (
                    <div className="hidden md:block w-full rounded-xl overflow-hidden bg-secondary min-h-[100px] lg:min-h-[120px]">
                        <img
                            src={article.imageUrl!}
                            alt=""
                            className="w-full h-full object-cover transition-all duration-300
                                       group-hover:scale-105 group-hover:brightness-105"
                            onError={() => setImageError(true)}
                        />
                    </div>
                ) : (
                    <div className="hidden md:flex w-full rounded-xl overflow-hidden min-h-[100px] lg:min-h-[120px]
                                    bg-gradient-to-br from-secondary to-border
                                    items-center justify-center
                                    transition-all duration-200
                                    group-hover:from-border group-hover:to-secondary">
                        <ImageOff className="w-8 h-8 lg:w-10 lg:h-10 text-muted-foreground/40
                                            transition-all duration-200
                                            group-hover:text-muted-foreground/60" />
                    </div>
                )
            )}
        </article>
    );
}
