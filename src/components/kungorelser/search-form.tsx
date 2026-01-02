"use client";

import { useState } from "react";
import { Search, Loader2 } from "lucide-react";

interface SearchFormProps {
  onSearch: (query: string, options?: { skipDetails?: boolean }) => Promise<void>;
  isLoading: boolean;
}

export function SearchForm({ onSearch, isLoading }: SearchFormProps) {
  const [query, setQuery] = useState("");
  const [skipDetails, setSkipDetails] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim() || isLoading) return;
    await onSearch(query.trim(), { skipDetails });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="flex gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground/70" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Sök företagsnamn eller organisationsnummer..."
            className="w-full pl-12 pr-4 py-3 bg-card border border-border rounded-xl text-foreground placeholder:text-muted-foreground/70 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            disabled={isLoading}
          />
        </div>
        <button
          type="submit"
          disabled={!query.trim() || isLoading}
          className="px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-muted-foreground/40 dark:disabled:bg-gray-700 text-white font-medium rounded-xl transition-colors flex items-center gap-2"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              <span>Söker...</span>
            </>
          ) : (
            <>
              <Search className="w-5 h-5" />
              <span>Sök kungörelser</span>
            </>
          )}
        </button>
      </div>

      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          id="skipDetails"
          checked={skipDetails}
          onChange={(e) => setSkipDetails(e.target.checked)}
          className="w-4 h-4 rounded border-border text-blue-600 focus:ring-blue-500"
        />
        <label
          htmlFor="skipDetails"
          className="text-sm text-muted-foreground"
        >
          Snabbsökning (hoppa över detaljtexter)
        </label>
      </div>
    </form>
  );
}
