"use client";

import { useState, useRef, useEffect } from "react";
import { Search, X, Settings, RefreshCw, Plus, Rss, Trash2, Check, WifiOff, AlignJustify, LayoutList, Image } from "lucide-react";
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
    onAddFeed?: (url: string) => Promise<{ success: boolean; error?: string; feedName?: string }>;
    onRemoveFeed?: (sourceId: string) => Promise<boolean>;
    onOpenRssTool?: () => void;
    isOffline?: boolean;
    realtimeStatus?: "connecting" | "connected" | "error";
    layout?: "compact" | "short" | "media";
    onLayoutChange?: (layout: "compact" | "short" | "media") => void;
}

export function NewsFilters({
    sources,
    searchQuery = "",
    onSearchChange,
    onAddFeed,
    onRemoveFeed,
    onOpenRssTool,
    isOffline = false,
    realtimeStatus = "connecting",
    layout = "short",
    onLayoutChange,
}: NewsFiltersProps) {
    const [isSearchOpen, setIsSearchOpen] = useState(false);
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);
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
        <div className="flex items-center justify-end gap-1.5 sm:gap-2 max-w-3xl mx-auto mb-4 sm:mb-6 px-1">
            {/* Offline indicator */}
            {isOffline && (
                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-400 text-xs font-medium animate-in fade-in duration-300">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                    <WifiOff className="w-3 h-3" />
                    <span>Offline</span>
                </div>
            )}
            {!isOffline && (
                <div
                    className={`inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium
                               ${realtimeStatus === "connected"
                                   ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                                   : realtimeStatus === "error"
                                   ? "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                                   : "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400"
                               }`}
                    title={
                        realtimeStatus === "connected"
                            ? "Uppdateras i realtid"
                            : realtimeStatus === "error"
                            ? "Realtidsanslutning misslyckades"
                            : "Ansluter..."
                    }
                >
                    <span className={`w-1.5 h-1.5 rounded-full ${realtimeStatus === "connected" ? "bg-green-500 animate-pulse" : realtimeStatus === "error" ? "bg-red-500" : "bg-yellow-500"}`} />
                    {realtimeStatus === "connected" ? "Live" : realtimeStatus === "error" ? "Realtid fel" : "..."}
                </div>
            )}

            {/* Search - expandable */}
            <div className="relative flex items-center">
                {isSearchOpen ? (
                    <div className="flex items-center gap-1.5 sm:gap-2 animate-in slide-in-from-right-2 duration-200">
                        <div className="relative">
                            <Input
                                ref={searchInputRef}
                                type="text"
                                placeholder="Sök..."
                                value={searchQuery}
                                onChange={(e) => onSearchChange(e.target.value)}
                                className="w-40 sm:w-64 h-8 sm:h-9 pl-3 pr-8 text-sm bg-secondary/50 border-0
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
                    <div className="absolute right-0 top-full mt-2 w-[calc(100vw-2rem)] sm:w-80 max-w-80 p-3 sm:p-4 rounded-xl z-50
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

            {/* Layout switch */}
            {onLayoutChange && (
                <div className="flex items-center gap-1 rounded-lg bg-secondary/60 p-1">
                    <button
                        onClick={() => onLayoutChange("compact")}
                        className={`p-1.5 rounded-md transition-colors ${layout === "compact" ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`}
                        title="Kompakt"
                    >
                        <AlignJustify className="w-4 h-4" />
                    </button>
                    <button
                        onClick={() => onLayoutChange("short")}
                        className={`p-1.5 rounded-md transition-colors ${layout === "short" ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`}
                        title="Kort"
                    >
                        <LayoutList className="w-4 h-4" />
                    </button>
                    <button
                        onClick={() => onLayoutChange("media")}
                        className={`p-1.5 rounded-md transition-colors ${layout === "media" ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`}
                        title="Kort + bild"
                    >
                        <Image className="w-4 h-4" />
                    </button>
                </div>
            )}

        </div>
    );
}
