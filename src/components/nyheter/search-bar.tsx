"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { Search, X, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { NewsItem } from "@/lib/nyheter/types";

interface SearchBarProps {
  onResultSelect?: (item: NewsItem) => void;
  onClose?: () => void;
  isOpen?: boolean;
}

interface SearchResult {
  items: NewsItem[];
  count: number;
}

export function SearchBar({ onResultSelect, onClose, isOpen = false }: SearchBarProps) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<NewsItem[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const searchTimeoutRef = useRef<NodeJS.Timeout | undefined>(undefined);

  // Focus input when opened
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  // Debounced search
  const performSearch = useCallback(async (searchQuery: string) => {
    if (!searchQuery.trim()) {
      setResults([]);
      return;
    }

    setIsSearching(true);
    try {
      const res = await fetch(`/api/feed/search?q=${encodeURIComponent(searchQuery)}`);
      if (res.ok) {
        const data: SearchResult = await res.json();
        setResults(data.items);
        setSelectedIndex(0);
      }
    } catch (error) {
      console.error("Search failed:", error);
    } finally {
      setIsSearching(false);
    }
  }, []);

  const handleQueryChange = (value: string) => {
    setQuery(value);

    // Clear previous timeout
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    // Debounce search by 300ms
    searchTimeoutRef.current = setTimeout(() => {
      performSearch(value);
    }, 300);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") {
      onClose?.();
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex((prev) => Math.min(prev + 1, results.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex((prev) => Math.max(prev - 1, 0));
    } else if (e.key === "Enter" && results[selectedIndex]) {
      e.preventDefault();
      onResultSelect?.(results[selectedIndex]);
      onClose?.();
    }
  };

  const handleResultClick = (item: NewsItem) => {
    onResultSelect?.(item);
    onClose?.();
  };

  const clearSearch = () => {
    setQuery("");
    setResults([]);
    inputRef.current?.focus();
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-start justify-center p-4 pt-20"
      onClick={onClose}
    >
      <div
        className="w-full max-w-2xl bg-white dark:bg-[#111] rounded-2xl shadow-2xl border border-gray-200 dark:border-[#222] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search input */}
        <div className="flex items-center gap-3 p-4 border-b border-gray-100 dark:border-[#222]">
          <Search className="w-5 h-5 text-gray-400 flex-shrink-0" />
          <Input
            ref={inputRef}
            type="text"
            placeholder="Sök i nyheter..."
            value={query}
            onChange={(e) => handleQueryChange(e.target.value)}
            onKeyDown={handleKeyDown}
            className="flex-1 border-0 focus-visible:ring-0 focus-visible:ring-offset-0 text-base"
          />
          {isSearching && <Loader2 className="w-5 h-5 text-gray-400 animate-spin flex-shrink-0" />}
          {query && !isSearching && (
            <Button variant="ghost" size="sm" onClick={clearSearch} className="flex-shrink-0">
              <X className="w-4 h-4" />
            </Button>
          )}
          <Button variant="ghost" size="sm" onClick={onClose} className="flex-shrink-0">
            <span className="text-sm text-gray-500">Esc</span>
          </Button>
        </div>

        {/* Search results */}
        {results.length > 0 ? (
          <div className="max-h-[60vh] overflow-y-auto">
            {results.map((item, index) => (
              <button
                key={item.id}
                onClick={() => handleResultClick(item)}
                className={cn(
                  "w-full text-left p-4 border-b border-gray-50 dark:border-[#1a1a1a] hover:bg-gray-50 dark:hover:bg-[#1a1a1a] transition-colors",
                  index === selectedIndex && "bg-gray-50 dark:bg-[#1a1a1a]"
                )}
              >
                <div className="flex items-start gap-3">
                  <div
                    className="w-2 h-2 rounded-full mt-2 flex-shrink-0"
                    style={{ backgroundColor: item.source.color }}
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span
                        className="text-xs font-semibold"
                        style={{ color: item.source.color }}
                      >
                        {item.source.name}
                      </span>
                      <span className="text-xs text-gray-400">
                        {new Date(item.publishedAt).toLocaleDateString("sv-SE")}
                      </span>
                    </div>
                    <h4 className="font-semibold text-gray-900 dark:text-white mb-1 line-clamp-2">
                      {item.title}
                    </h4>
                    {item.description && (
                      <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2">
                        {item.description}
                      </p>
                    )}
                  </div>
                </div>
              </button>
            ))}
          </div>
        ) : query && !isSearching ? (
          <div className="p-8 text-center text-gray-500">
            <Search className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p>Inga resultat för "{query}"</p>
          </div>
        ) : !query ? (
          <div className="p-8 text-center text-gray-400">
            <Search className="w-12 h-12 mx-auto mb-3 opacity-20" />
            <p className="text-sm">Börja skriva för att söka...</p>
            <p className="text-xs mt-2">Tips: Sök på titel, källa eller nyckelord</p>
          </div>
        ) : null}

        {/* Keyboard shortcuts hint */}
        {results.length > 0 && (
          <div className="px-4 py-3 bg-gray-50 dark:bg-[#0a0a0a] border-t border-gray-100 dark:border-[#222] flex items-center gap-4 text-xs text-gray-500">
            <span>↑↓ Navigera</span>
            <span>↵ Öppna</span>
            <span>Esc Stäng</span>
          </div>
        )}
      </div>
    </div>
  );
}
