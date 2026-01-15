"use client";

import { useState, useRef, useEffect } from "react";
import { Search, X, Settings, WifiOff, AlignJustify, LayoutList, Image, Eye, EyeOff, Rss } from "lucide-react";
import { Input } from "@/components/ui/input";

interface Source {
    sourceId: string;
    sourceName: string;
    count: number;
    feedId?: string | null;
    url?: string | null;
    category?: string | null;
    color?: string | null;
    isHidden?: boolean;
}

interface NewsFiltersProps {
    sources: Source[];
    searchQuery?: string;
    onSearchChange: (query: string) => void;
    onSourceChange: (sourceId: string | undefined) => void;
    onBookmarkedChange: (show: boolean) => void;
    onUnreadChange: (show: boolean) => void;
    onToggleSource?: (sourceId: string, hide: boolean) => Promise<void>;
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
    onToggleSource,
    onOpenRssTool,
    isOffline = false,
    realtimeStatus = "connecting",
    layout = "short",
    onLayoutChange,
}: NewsFiltersProps) {
    const [isSearchOpen, setIsSearchOpen] = useState(false);
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);
    const [togglingSource, setTogglingSource] = useState<string | null>(null);
    const searchInputRef = useRef<HTMLInputElement>(null);
    const settingsRef = useRef<HTMLDivElement>(null);

    // Separate visible and hidden sources
    const visibleSources = sources.filter((s) => !s.isHidden);
    const hiddenSources = sources.filter((s) => s.isHidden);

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

    // Handle toggle source visibility
    const handleToggleSource = async (sourceId: string, currentlyHidden: boolean) => {
        if (!onToggleSource) return;

        setTogglingSource(sourceId);
        try {
            await onToggleSource(sourceId, !currentlyHidden);
        } finally {
            setTogglingSource(null);
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
                    title="Nyhetsflöde-inställningar"
                >
                    <Settings className={`w-4 h-4 transition-transform duration-300 ${isSettingsOpen ? "rotate-90" : ""}`} />
                </button>

                {/* Settings dropdown */}
                {isSettingsOpen && (
                    <div className="absolute right-0 top-full mt-2 w-[calc(100vw-2rem)] sm:w-80 max-w-80 p-3 sm:p-4 rounded-xl z-50
                                    glass shadow-xl
                                    animate-in fade-in slide-in-from-top-2 duration-200">

                        {/* Visible sources */}
                        <h3 className="font-mono text-[11px] font-semibold uppercase tracking-widest text-muted-foreground mb-2">
                            Nyhetskällor ({visibleSources.length})
                        </h3>

                        {visibleSources.length > 0 ? (
                            <div className="max-h-48 overflow-y-auto space-y-0.5">
                                {visibleSources.map((source) => (
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
                                        {onToggleSource && (
                                            <button
                                                onClick={() => handleToggleSource(source.sourceId, false)}
                                                disabled={togglingSource === source.sourceId}
                                                className="p-1.5 rounded text-muted-foreground/50
                                                           opacity-0 group-hover:opacity-100
                                                           hover:text-orange-600 hover:bg-orange-500/10
                                                           transition-all duration-200
                                                           disabled:opacity-50"
                                                title="Dölj källa"
                                            >
                                                <EyeOff className="w-3.5 h-3.5" />
                                            </button>
                                        )}
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-xs text-muted-foreground py-2">Inga aktiva källor</p>
                        )}

                        {/* Hidden sources */}
                        {hiddenSources.length > 0 && (
                            <>
                                <h3 className="font-mono text-[11px] font-semibold uppercase tracking-widest text-muted-foreground mb-2 mt-4 pt-3 border-t border-border/50">
                                    Dolda källor ({hiddenSources.length})
                                </h3>
                                <div className="max-h-32 overflow-y-auto space-y-0.5">
                                    {hiddenSources.map((source) => (
                                        <div
                                            key={source.sourceId}
                                            className="flex items-center justify-between px-2 py-1.5 rounded-lg
                                                       bg-secondary/30 group transition-colors"
                                        >
                                            <div className="flex items-center gap-2 min-w-0">
                                                <div className="w-5 h-5 rounded bg-secondary/50 flex items-center justify-center flex-shrink-0">
                                                    <Rss className="w-3 h-3 text-muted-foreground/50" />
                                                </div>
                                                <span className="text-sm truncate text-muted-foreground">{source.sourceName}</span>
                                            </div>
                                            {onToggleSource && (
                                                <button
                                                    onClick={() => handleToggleSource(source.sourceId, true)}
                                                    disabled={togglingSource === source.sourceId}
                                                    className="p-1.5 rounded text-muted-foreground
                                                               hover:text-green-600 hover:bg-green-500/10
                                                               transition-all duration-200
                                                               disabled:opacity-50"
                                                    title="Visa källa igen"
                                                >
                                                    <Eye className="w-3.5 h-3.5" />
                                                </button>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </>
                        )}

                        {/* Info text */}
                        <p className="text-[10px] text-muted-foreground/60 mt-3 pt-2 border-t border-border/30">
                            Dölj källor för att anpassa ditt nyhetsflöde. Dolda källor påverkar bara din vy.
                        </p>
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
