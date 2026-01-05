"use client";

import { useState, useRef, useEffect } from "react";
import { Search, X, Settings, RefreshCw, Plus, Rss, Trash2, Check, WifiOff } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface Source {
    sourceId: string;
    sourceName: string;
    count: number;
    feedId?: string | null;
    url?: string | null;
    category?: string | null;
    color?: string | null;
}

interface NewsFiltersProps {
    sources: Source[];
    searchQuery?: string;
    onSearchChange: (query: string) => void;
    onSourceChange: (sourceId: string | undefined) => void;
    onBookmarkedChange: (show: boolean) => void;
    onUnreadChange: (show: boolean) => void;
    onRefresh: () => void;
    isRefreshing?: boolean;
    onAddFeed?: (url: string) => Promise<{ success: boolean; error?: string; feedName?: string }>;
    onRemoveFeed?: (sourceId: string) => Promise<boolean>;
    onOpenRssTool?: () => void;
    newArticlesCount?: number;
    isOffline?: boolean;
}

export function NewsFilters({
    sources,
    searchQuery = "",
    onSearchChange,
    onRefresh,
    isRefreshing = false,
    onAddFeed,
    onRemoveFeed,
    onOpenRssTool,
    newArticlesCount = 0,
    isOffline = false,
}: NewsFiltersProps) {
    const [isSearchOpen, setIsSearchOpen] = useState(false);
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);
    const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
    const [newFeedUrl, setNewFeedUrl] = useState("");
    const [isAddingFeed, setIsAddingFeed] = useState(false);
    const [feedError, setFeedError] = useState<string | null>(null);
    const [feedSuccess, setFeedSuccess] = useState(false);
    const searchInputRef = useRef<HTMLInputElement>(null);
    const settingsRef = useRef<HTMLDivElement>(null);

    // Focus search input when opened
    useEffect(() => {
        if (isSearchOpen && searchInputRef.current) {
            searchInputRef.current.focus();
        }
    }, [isSearchOpen]);

    // Close settings when clicking outside
    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (settingsRef.current && !settingsRef.current.contains(e.target as Node)) {
                setIsSettingsOpen(false);
            }
        };
        if (isSettingsOpen) {
            document.addEventListener("mousedown", handleClickOutside);
        }
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [isSettingsOpen]);

    // Handle refresh
    const handleRefresh = () => {
        onRefresh();
        setLastUpdated(new Date());
    };

    // Format last updated time
    const formatLastUpdated = () => {
        if (!lastUpdated) return null;
        const now = new Date();
        const diffMs = now.getTime() - lastUpdated.getTime();
        const diffMins = Math.floor(diffMs / 60000);

        if (diffMins < 1) return "Just nu";
        if (diffMins < 60) return `${diffMins} min`;
        const diffHours = Math.floor(diffMins / 60);
        if (diffHours < 24) return `${diffHours} tim`;
        return lastUpdated.toLocaleDateString("sv-SE", { day: "numeric", month: "short" });
    };

    // Handle add feed
    const handleAddFeed = async () => {
        if (!newFeedUrl.trim() || !onAddFeed) return;

        setIsAddingFeed(true);
        setFeedError(null);
        setFeedSuccess(false);

        try {
            const result = await onAddFeed(newFeedUrl.trim());
            if (result.success) {
                setNewFeedUrl("");
                setFeedSuccess(true);
                setTimeout(() => setFeedSuccess(false), 2000);
            } else {
                setFeedError(result.error || "Kunde inte lägga till flödet");
            }
        } catch {
            setFeedError("Något gick fel");
        } finally {
            setIsAddingFeed(false);
        }
    };

    return (
        <div className="flex items-center justify-end gap-2 max-w-3xl mx-auto mb-6">
            {/* Offline indicator */}
            {isOffline && (
                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-400 text-xs font-medium animate-in fade-in duration-300">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                    <WifiOff className="w-3 h-3" />
                    <span>Offline</span>
                </div>
            )}

            {/* Search - expandable */}
            <div className="relative flex items-center">
                {isSearchOpen ? (
                    <div className="flex items-center gap-2 animate-in slide-in-from-right-2 duration-200">
                        <div className="relative">
                            <Input
                                ref={searchInputRef}
                                type="text"
                                placeholder="Sök..."
                                value={searchQuery}
                                onChange={(e) => onSearchChange(e.target.value)}
                                className="w-64 h-9 pl-3 pr-8 text-sm bg-secondary/50 border-0
                                           focus:bg-background focus:ring-1 focus:ring-border"
                            />
                            {searchQuery && (
                                <button
                                    onClick={() => onSearchChange("")}
                                    className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                                >
                                    <X className="w-3.5 h-3.5" />
                                </button>
                            )}
                        </div>
                        <button
                            onClick={() => {
                                setIsSearchOpen(false);
                                onSearchChange("");
                            }}
                            className="p-2 text-muted-foreground hover:text-foreground transition-colors"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    </div>
                ) : (
                    <button
                        onClick={() => setIsSearchOpen(true)}
                        className="p-2.5 rounded-lg text-muted-foreground
                                   hover:text-foreground hover:bg-secondary
                                   transition-all duration-200"
                        title="Sök"
                    >
                        <Search className="w-4 h-4" />
                    </button>
                )}
            </div>

            {/* Settings button & dropdown */}
            <div className="relative" ref={settingsRef}>
                <button
                    onClick={() => onOpenRssTool ? onOpenRssTool() : setIsSettingsOpen(!isSettingsOpen)}
                    className={`p-2.5 rounded-lg transition-all duration-200
                               ${isSettingsOpen
                                   ? "text-foreground bg-secondary"
                                   : "text-muted-foreground hover:text-foreground hover:bg-secondary"
                               }`}
                    title="RSS-inställningar"
                >
                    <Settings className={`w-4 h-4 transition-transform duration-300 ${isSettingsOpen ? "rotate-90" : ""}`} />
                </button>

                {/* Settings dropdown */}
                {isSettingsOpen && (
                    <div className="absolute right-0 top-full mt-2 w-80 p-4 rounded-xl z-50
                                    glass shadow-xl
                                    animate-in fade-in slide-in-from-top-2 duration-200">
                        <h3 className="font-mono text-[11px] font-semibold uppercase tracking-widest text-muted-foreground mb-3">
                            Lägg till RSS-källa
                        </h3>

                        {/* Add feed input */}
                        <div className="flex gap-2 mb-4">
                            <div className="relative flex-1">
                                <Rss className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
                                <Input
                                    type="url"
                                    placeholder="https://example.com/rss"
                                    value={newFeedUrl}
                                    onChange={(e) => {
                                        setNewFeedUrl(e.target.value);
                                        setFeedError(null);
                                    }}
                                    onKeyDown={(e) => e.key === "Enter" && handleAddFeed()}
                                    className="pl-9 h-9 text-sm"
                                />
                            </div>
                            <Button
                                size="sm"
                                onClick={handleAddFeed}
                                disabled={!newFeedUrl.trim() || isAddingFeed}
                                className="h-9 px-3"
                            >
                                {isAddingFeed ? (
                                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                                ) : feedSuccess ? (
                                    <Check className="w-3.5 h-3.5" />
                                ) : (
                                    <Plus className="w-3.5 h-3.5" />
                                )}
                            </Button>
                        </div>

                        {feedError && (
                            <p className="text-xs text-destructive mb-3">{feedError}</p>
                        )}

                        {/* Sources list */}
                        {sources.length > 0 && (
                            <>
                                <h3 className="font-mono text-[11px] font-semibold uppercase tracking-widest text-muted-foreground mb-2 mt-4">
                                    Dina källor ({sources.length})
                                </h3>
                                <div className="max-h-48 overflow-y-auto space-y-1">
                                    {sources.map((source) => (
                                        <div
                                            key={source.sourceId}
                                            className="flex items-center justify-between px-2 py-1.5 rounded-lg
                                                       hover:bg-secondary/50 group transition-colors"
                                        >
                                            <div className="flex items-center gap-2 min-w-0">
                                                <div className="w-5 h-5 rounded bg-secondary flex items-center justify-center flex-shrink-0">
                                                    <Rss className="w-3 h-3 text-muted-foreground" />
                                                </div>
                                                <span className="text-sm truncate">{source.sourceName}</span>
                                                <span className="text-xs text-muted-foreground">({source.count})</span>
                                            </div>
                                            {onRemoveFeed && (
                                                <button
                                                    onClick={() => onRemoveFeed(source.sourceId)}
                                                    className="p-1 rounded text-muted-foreground/50
                                                               opacity-0 group-hover:opacity-100
                                                               hover:text-destructive hover:bg-destructive/10
                                                               transition-all duration-200"
                                                    title="Ta bort källa"
                                                >
                                                    <Trash2 className="w-3.5 h-3.5" />
                                                </button>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </>
                        )}
                    </div>
                )}
            </div>

            {/* Refresh button with last updated and new articles badge */}
            <button
                onClick={handleRefresh}
                disabled={isRefreshing || isOffline}
                className={`relative flex items-center gap-2 px-3 py-2 rounded-lg
                           transition-all duration-200 group
                           ${isOffline
                               ? "text-muted-foreground/50 cursor-not-allowed"
                               : "text-muted-foreground hover:text-foreground hover:bg-secondary"
                           }`}
                title={isOffline ? "Uppdatering kräver internet" : "Uppdatera flödet"}
            >
                {/* New articles badge */}
                {newArticlesCount > 0 && !isRefreshing && (
                    <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1
                                     bg-red-500 text-white text-[10px] font-mono font-semibold
                                     rounded-full flex items-center justify-center
                                     animate-pulse">
                        {newArticlesCount > 99 ? "99+" : newArticlesCount}
                    </span>
                )}
                <RefreshCw className={`w-4 h-4 transition-transform duration-500
                                      ${isRefreshing ? "animate-spin" : "group-hover:rotate-180"}`} />
                {lastUpdated && !isRefreshing && (
                    <span className="text-xs font-mono">{formatLastUpdated()}</span>
                )}
            </button>
        </div>
    );
}
