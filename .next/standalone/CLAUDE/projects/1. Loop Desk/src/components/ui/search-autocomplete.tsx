"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Search, Building2, Loader2, Clock, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

interface SearchResult {
  orgNr: string;
  name: string;
  companyType?: string;
  status?: string;
  location?: string;
}

interface SearchAutocompleteProps {
  placeholder?: string;
  recentSearches?: { orgNr: string; name: string }[];
  onSelectResult?: (result: SearchResult) => void;
  className?: string;
}

export function SearchAutocomplete({
  placeholder = "Sök företag...",
  recentSearches = [],
  onSelectResult,
  className,
}: SearchAutocompleteProps) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [error, setError] = useState<string | null>(null);

  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Debounced search
  useEffect(() => {
    if (query.length < 2) {
      setResults([]);
      setError(null);
      return;
    }

    const controller = new AbortController();
    const timeout = setTimeout(async () => {
      setIsLoading(true);
      setError(null);

      try {
        const response = await fetch(`/api/bolag/search?q=${encodeURIComponent(query)}`, {
          signal: controller.signal,
        });
        const data = await response.json();

        if (response.ok) {
          setResults(data.results || []);
          if (data.results?.length === 0) {
            setError("Inga företag hittades");
          }
        } else {
          setError(data.error || "Ett fel uppstod");
        }
      } catch (err) {
        if ((err as Error).name !== "AbortError") {
          setError("Ett fel uppstod vid sökning");
        }
      } finally {
        setIsLoading(false);
      }
    }, 250);

    return () => {
      controller.abort();
      clearTimeout(timeout);
    };
  }, [query]);

  // Keyboard navigation
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    const items = query.length >= 2 ? results : recentSearches;

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex((prev) => Math.min(prev + 1, items.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex((prev) => Math.max(prev - 1, -1));
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (selectedIndex >= 0 && items[selectedIndex]) {
        handleSelect(items[selectedIndex]);
      } else if (query.length >= 2) {
        // Direct org number navigation
        const cleanQuery = query.replace(/\D/g, "");
        if (cleanQuery.length === 10 || cleanQuery.length === 12) {
          router.push(`/bolag/${cleanQuery}`);
          setIsOpen(false);
        }
      }
    } else if (e.key === "Escape") {
      setIsOpen(false);
      inputRef.current?.blur();
    }
  }, [query, results, recentSearches, selectedIndex, router]);

  const handleSelect = (item: { orgNr: string; name: string }) => {
    if (onSelectResult) {
      onSelectResult(item as SearchResult);
    }
    router.push(`/bolag/${item.orgNr}`);
    setIsOpen(false);
    setQuery("");
  };

  const formatOrgNr = (orgNr: string) => {
    const clean = orgNr.replace(/\D/g, "");
    if (clean.length === 10) {
      return `${clean.slice(0, 6)}-${clean.slice(6)}`;
    }
    return orgNr;
  };

  const showDropdown = isOpen && (query.length >= 2 || recentSearches.length > 0);
  const showResults = query.length >= 2;
  const items = showResults ? results : recentSearches.slice(0, 5);

  return (
    <div ref={containerRef} className={cn("relative", className)}>
      {/* Search Input */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setSelectedIndex(-1);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className={cn(
            "w-full h-11 pl-10 pr-4 rounded-xl border border-border bg-background",
            "text-sm placeholder:text-muted-foreground",
            "focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent",
            "transition-all duration-200",
            isOpen && "ring-2 ring-ring border-transparent"
          )}
        />
        {isLoading && (
          <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground animate-spin" />
        )}
      </div>

      {/* Dropdown */}
      <AnimatePresence>
        {showDropdown && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.98 }}
            transition={{ duration: 0.15, ease: [0.25, 0.1, 0.25, 1] }}
            className={cn(
              "absolute top-full left-0 right-0 mt-2 z-50",
              "rounded-xl border border-border/50 shadow-xl overflow-hidden",
              "bg-background/95 backdrop-blur-xl"
            )}
          >
            {/* Header */}
            <div className="px-3 py-2 border-b border-border/50">
              <p className="text-xs font-medium text-muted-foreground">
                {showResults ? (
                  isLoading ? "Söker..." :
                  error ? error :
                  `${results.length} träffar`
                ) : (
                  <span className="flex items-center gap-1.5">
                    <Clock className="h-3 w-3" />
                    Senaste sökningar
                  </span>
                )}
              </p>
            </div>

            {/* Results List */}
            <div className="max-h-80 overflow-y-auto">
              {items.length > 0 ? (
                <div className="py-1">
                  {items.map((item, index) => (
                    <button
                      key={item.orgNr}
                      onClick={() => handleSelect(item)}
                      onMouseEnter={() => setSelectedIndex(index)}
                      className={cn(
                        "w-full px-3 py-2.5 flex items-center gap-3 text-left transition-colors",
                        selectedIndex === index
                          ? "bg-secondary"
                          : "hover:bg-secondary/50"
                      )}
                    >
                      <div className={cn(
                        "w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0",
                        selectedIndex === index
                          ? "bg-foreground text-background"
                          : "bg-secondary"
                      )}>
                        <Building2 className="h-4 w-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm truncate">{item.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {formatOrgNr(item.orgNr)}
                          {"location" in item && (item as SearchResult).location && ` • ${(item as SearchResult).location}`}
                        </p>
                      </div>
                      {selectedIndex === index && (
                        <ArrowRight className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                      )}
                    </button>
                  ))}
                </div>
              ) : showResults && !isLoading && !error ? (
                <div className="px-3 py-6 text-center text-sm text-muted-foreground">
                  Inga resultat
                </div>
              ) : null}
            </div>

            {/* Footer hint */}
            <div className="px-3 py-2 border-t border-border/50 bg-secondary/30">
              <p className="text-[11px] text-muted-foreground">
                <kbd className="px-1.5 py-0.5 bg-background rounded text-[10px] font-mono">↑↓</kbd>
                {" "}navigera
                <span className="mx-2">•</span>
                <kbd className="px-1.5 py-0.5 bg-background rounded text-[10px] font-mono">↵</kbd>
                {" "}välj
                <span className="mx-2">•</span>
                <kbd className="px-1.5 py-0.5 bg-background rounded text-[10px] font-mono">esc</kbd>
                {" "}stäng
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
