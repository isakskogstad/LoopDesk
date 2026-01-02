"use client";

import { useState, useEffect } from "react";
import { ArrowUp, Search, Filter, LayoutGrid, List } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface StickyToolbarProps {
  onScrollToTop?: () => void;
  onSearch?: () => void;
  onFilter?: () => void;
  unreadCount?: number;
  viewMode?: "grid" | "list";
  onViewModeChange?: (mode: "grid" | "list") => void;
}

export function StickyToolbar({
  onScrollToTop,
  onSearch,
  onFilter,
  unreadCount = 0,
  viewMode = "grid",
  onViewModeChange,
}: StickyToolbarProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      // Show toolbar after scrolling 500px down
      setIsVisible(window.scrollY > 500);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
    onScrollToTop?.();
  };

  return (
    <div
      className={cn(
        "fixed bottom-6 right-6 z-50 transition-all duration-300",
        isVisible ? "translate-y-0 opacity-100" : "translate-y-20 opacity-0 pointer-events-none"
      )}
    >
      <div className="bg-card shadow-2xl rounded-full border border-border dark:border-[#222] p-2 flex items-center gap-2">
        {/* Unread count badge */}
        {unreadCount > 0 && (
          <div className="px-3 py-1.5 bg-[#6366f1] text-white text-xs font-bold rounded-full">
            {unreadCount} nya
          </div>
        )}

        {/* View mode toggle */}
        {onViewModeChange && (
          <div className="flex rounded-full bg-secondary dark:bg-[#1a1a1a] p-1">
            <button
              onClick={() => onViewModeChange("grid")}
              className={cn(
                "p-2 rounded-full transition-colors",
                viewMode === "grid"
                  ? "bg-white dark:bg-[#222] text-[#6366f1] shadow-sm"
                  : "text-muted-foreground/70 hover:text-muted-foreground dark:hover:text-muted-foreground/50"
              )}
              title="Grid view"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              onClick={() => onViewModeChange("list")}
              className={cn(
                "p-2 rounded-full transition-colors",
                viewMode === "list"
                  ? "bg-white dark:bg-[#222] text-[#6366f1] shadow-sm"
                  : "text-muted-foreground/70 hover:text-muted-foreground dark:hover:text-muted-foreground/50"
              )}
              title="List view"
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Search button */}
        {onSearch && (
          <Button
            size="icon"
            variant="ghost"
            onClick={onSearch}
            className="rounded-full hover:bg-secondary dark:hover:bg-[#1a1a1a]"
            title="Search (⌘K)"
          >
            <Search className="w-4 h-4" />
          </Button>
        )}

        {/* Filter button */}
        {onFilter && (
          <Button
            size="icon"
            variant="ghost"
            onClick={onFilter}
            className="rounded-full hover:bg-secondary dark:hover:bg-[#1a1a1a]"
            title="Filter"
          >
            <Filter className="w-4 h-4" />
          </Button>
        )}

        {/* Scroll to top button */}
        <Button
          size="icon"
          onClick={scrollToTop}
          className="rounded-full bg-[#6366f1] hover:bg-[#4f46e5] text-white shadow-lg"
          title="Scroll to top"
        >
          <ArrowUp className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}
