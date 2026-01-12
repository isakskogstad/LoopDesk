"use client";

import { useState, useRef } from "react";
import {
    Bookmark,
    BookmarkCheck,
    ImageOff,
    Play,
    Headphones,
    Video,
    Twitter,
    Linkedin,
    Youtube,
} from "lucide-react";

// Media type from database
type MediaType = "image" | "video" | "audio" | "podcast" | "youtube" | "twitter" | "linkedin";

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
    // Enhanced media fields
    mediaType?: MediaType | null;
    mediaUrl?: string | null;
    mediaThumbnail?: string | null;
    mediaDuration?: string | null;
    mediaEmbed?: string | null;
    mediaPlatform?: string | null;
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
    onOpen?: (article: Article) => void;
    layout?: "compact" | "short" | "media";
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

// Get media icon component based on type
function getMediaIcon(mediaType: MediaType | null | undefined): React.ReactNode {
    switch (mediaType) {
        case "youtube":
            return <Youtube className="w-5 h-5" />;
        case "video":
            return <Video className="w-5 h-5" />;
        case "podcast":
        case "audio":
            return <Headphones className="w-5 h-5" />;
        case "twitter":
            return <Twitter className="w-5 h-5" />;
        case "linkedin":
            return <Linkedin className="w-5 h-5" />;
        default:
            return <Play className="w-5 h-5" />;
    }
}

// Get media accent color based on type
function getMediaColor(mediaType: MediaType | null | undefined): string {
    switch (mediaType) {
        case "youtube":
            return "bg-red-500";
        case "video":
            return "bg-purple-500";
        case "podcast":
        case "audio":
            return "bg-green-500";
        case "twitter":
            return "bg-sky-500";
        case "linkedin":
            return "bg-blue-600";
        default:
            return "bg-primary";
    }
}

// Get platform label
function getPlatformLabel(mediaType: MediaType | null | undefined, platform?: string | null): string {
    if (platform) return platform;
    switch (mediaType) {
        case "youtube": return "YouTube";
        case "video": return "Video";
        case "podcast": return "Podcast";
        case "audio": return "Ljud";
        case "twitter": return "Twitter";
        case "linkedin": return "LinkedIn";
        default: return "";
    }
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
    onOpen,
    layout = "short",
    highlightKeywords = true,
    isFocused = false,
    showGradientLine = true,
}: NewsItemProps) {
    const [imageError, setImageError] = useState(false);
    const [faviconError, setFaviconError] = useState(false);
    const [isImageLoaded, setIsImageLoaded] = useState(false);
    const articleRef = useRef<HTMLElement>(null);

    const hasDescription = article.description && article.description.length > 0;
    const thumbnailUrl = article.mediaThumbnail || article.imageUrl;
    const hasImage = thumbnailUrl && !imageError;
    const hasMedia = article.mediaType && article.mediaType !== "image";
    const faviconUrl = getSourceFavicon(article.url, article.sourceName);
    const { time, day } = formatTimeWithDay(article.publishedAt);

    const keywords = highlightKeywords
        ? (article.keywordMatches || []).map((m) => m.keyword)
        : [];

    // Get media display info
    const mediaColor = getMediaColor(article.mediaType);
    const mediaIcon = hasMedia ? getMediaIcon(article.mediaType) : null;
    const platformLabel = getPlatformLabel(article.mediaType, article.mediaPlatform);
    const showImage = layout === "media";
    const showDescription = layout !== "compact";

    // Click handler
    const handleCardClick = (e: React.MouseEvent) => {
        const target = e.target as HTMLElement;
        if (target.closest('button') || target.closest('a')) {
            return;
        }
        onOpen?.(article);
    };

    // Bookmark with animation
    const handleBookmark = (e: React.MouseEvent) => {
        e.stopPropagation();
        onBookmark?.(article.id);
    };

    const handleMarkAsRead = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (!article.isRead) {
            onRead?.(article.id);
        }
    };

    return (
        <article
            ref={articleRef}
            className={`
                group relative grid gap-3 sm:gap-4 md:gap-5 py-3 sm:py-4 md:py-5 cursor-pointer
                transition-all duration-200 ease-out
                ${showImage
                    ? "grid-cols-[40px_1fr] sm:grid-cols-[48px_1fr] md:grid-cols-[60px_1fr_160px] lg:grid-cols-[60px_1fr_180px]"
                    : "grid-cols-[40px_1fr] sm:grid-cols-[48px_1fr] md:grid-cols-[60px_1fr]"
                }
                ${article.isRead ? "opacity-60" : ""}
                ${isFocused ? "ring-2 ring-primary ring-offset-2 ring-offset-background rounded-xl focus-ring" : ""}
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

            {/* Hover actions */}
            <div className="absolute right-0 top-3 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                    onClick={handleBookmark}
                    className="h-8 w-8 rounded-lg border border-border bg-background/80 text-muted-foreground
                               hover:text-foreground hover:border-muted-foreground transition-colors"
                    title={article.isBookmarked ? "Ta bort Läs senare" : "Läs senare"}
                >
                    {article.isBookmarked ? <BookmarkCheck className="w-4 h-4 mx-auto" /> : <Bookmark className="w-4 h-4 mx-auto" />}
                </button>
                <button
                    onClick={handleMarkAsRead}
                    className="h-8 w-8 rounded-lg border border-border bg-background/80 text-muted-foreground
                               hover:text-foreground hover:border-muted-foreground transition-colors"
                    title="Markera som läst"
                >
                    ✓
                </button>
            </div>

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
                {/* Media type indicator + Title */}
                <div className="flex items-start gap-2 mb-2 sm:mb-2.5">
                    {/* Mobile media indicator */}
                    {hasMedia && (
                        <div className={`md:hidden flex-shrink-0 ${mediaColor} rounded p-1.5 text-white mt-0.5`}>
                            <span className="w-3.5 h-3.5 block [&>svg]:w-3.5 [&>svg]:h-3.5">
                                {mediaIcon}
                            </span>
                        </div>
                    )}
                    <h2
                        className={`
                            ${layout === "compact" ? "text-[14px] sm:text-[15px]" : "text-[15px] sm:text-[16px] md:text-[17px]"}
                            font-semibold leading-snug
                            transition-colors group-hover:text-foreground
                            ${article.isRead ? "text-muted-foreground" : "text-foreground"}
                        `}
                        dangerouslySetInnerHTML={{
                            __html: highlightText(article.title, keywords),
                        }}
                    />
                </div>

                {/* Description */}
                {showDescription && hasDescription && (
                    <p
                        className={`
                            text-sm text-muted-foreground flex-1 prose-readable
                            line-clamp-3
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

            </div>

            {/* Media thumbnail - hidden on mobile */}
            {showImage && (
                hasImage ? (
                    <div className="hidden md:block w-full rounded-xl overflow-hidden bg-secondary min-h-[100px] lg:min-h-[120px] relative">
                        <img
                            src={thumbnailUrl!}
                            alt=""
                            className={`w-full h-full object-cover transition-all duration-300
                                       ${isImageLoaded ? "blur-0" : "blur-sm"}
                                       group-hover:scale-105 group-hover:brightness-105`}
                            onError={() => setImageError(true)}
                            onLoad={() => setIsImageLoaded(true)}
                            loading="lazy"
                            decoding="async"
                        />
                        {/* Media type overlay */}
                        {hasMedia && (
                            <div className="absolute inset-0 flex items-center justify-center">
                                {/* Play button overlay */}
                                <div className={`${mediaColor} rounded-full p-3 text-white shadow-lg
                                                opacity-90 group-hover:opacity-100 group-hover:scale-110
                                                transition-all duration-200`}>
                                    {mediaIcon}
                                </div>
                                {/* Duration badge */}
                                {article.mediaDuration && (
                                    <div className="absolute bottom-2 right-2 px-2 py-0.5 rounded
                                                    bg-black/80 text-white text-xs font-mono">
                                        {article.mediaDuration}
                                    </div>
                                )}
                                {/* Platform badge */}
                                {platformLabel && (
                                    <div className={`absolute top-2 left-2 px-2 py-0.5 rounded
                                                    ${mediaColor} text-white text-xs font-medium
                                                    flex items-center gap-1`}>
                                        {mediaIcon && <span className="w-3 h-3">{mediaIcon}</span>}
                                        {platformLabel}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                ) : hasMedia ? (
                    // Media without thumbnail - show styled placeholder
                    <div className={`hidden md:flex w-full rounded-xl overflow-hidden min-h-[100px] lg:min-h-[120px]
                                    bg-gradient-to-br from-secondary to-border relative
                                    items-center justify-center transition-all duration-200
                                    group-hover:from-border group-hover:to-secondary`}>
                        <div className={`${mediaColor} rounded-full p-4 text-white shadow-lg
                                        opacity-80 group-hover:opacity-100 group-hover:scale-110
                                        transition-all duration-200`}>
                            {mediaIcon}
                        </div>
                        {/* Platform label */}
                        {platformLabel && (
                            <div className="absolute bottom-2 right-2 px-2 py-0.5 rounded
                                            bg-black/60 text-white/90 text-xs font-medium">
                                {platformLabel}
                            </div>
                        )}
                        {/* Duration */}
                        {article.mediaDuration && (
                            <div className="absolute top-2 right-2 px-2 py-0.5 rounded
                                            bg-black/60 text-white text-xs font-mono">
                                {article.mediaDuration}
                            </div>
                        )}
                    </div>
                ) : (
                    // No media - simple fallback
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
