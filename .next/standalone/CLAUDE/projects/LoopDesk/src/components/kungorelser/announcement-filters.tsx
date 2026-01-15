"use client";

import { Search, Filter, X } from "lucide-react";
import type { AnnouncementFilter } from "@/lib/kungorelser/types";

interface AnnouncementFiltersProps {
  filter: AnnouncementFilter;
  types: string[];
  onFilterChange: (filter: Partial<AnnouncementFilter>) => void;
}

export function AnnouncementFilters({
  filter,
  types,
  onFilterChange,
}: AnnouncementFiltersProps) {
  const hasActiveFilters = filter.query || filter.type || filter.fromDate || filter.toDate;

  const clearFilters = () => {
    onFilterChange({
      query: undefined,
      type: undefined,
      fromDate: undefined,
      toDate: undefined,
    });
  };

  return (
    <div className="bg-card rounded-xl border border-border dark:border-gray-800 p-3 sm:p-4">
      <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
        <Filter className="w-4 h-4 sm:w-5 sm:h-5 text-muted-foreground/70 flex-shrink-0" />
        <span className="font-medium text-foreground text-sm sm:text-base">
          Filtrera kungörelser
        </span>
        {hasActiveFilters && (
          <button
            onClick={clearFilters}
            className="ml-auto flex items-center gap-1 text-xs sm:text-sm text-muted-foreground hover:text-foreground dark:hover:text-muted-foreground/50"
          >
            <X className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            <span className="hidden xs:inline">Rensa filter</span>
            <span className="xs:hidden">Rensa</span>
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2 sm:gap-4">
        {/* Text search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/70" />
          <input
            type="text"
            value={filter.query || ""}
            onChange={(e) => onFilterChange({ query: e.target.value || undefined })}
            placeholder="Sök i text..."
            className="w-full pl-10 pr-4 py-2 bg-secondary/60 dark:bg-gray-800 border border-border rounded-lg text-sm text-foreground placeholder:text-muted-foreground/70 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        {/* Type filter */}
        <div>
          <select
            value={filter.type || ""}
            onChange={(e) => onFilterChange({ type: e.target.value || undefined })}
            className="w-full px-4 py-2 bg-secondary/60 dark:bg-gray-800 border border-border rounded-lg text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">Alla typer</option>
            {types.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
        </div>

        {/* From date */}
        <div>
          <input
            type="date"
            value={filter.fromDate ? filter.fromDate.toISOString().split("T")[0] : ""}
            onChange={(e) =>
              onFilterChange({
                fromDate: e.target.value ? new Date(e.target.value) : undefined,
              })
            }
            className="w-full px-4 py-2 bg-secondary/60 dark:bg-gray-800 border border-border rounded-lg text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Från datum"
          />
        </div>

        {/* To date */}
        <div>
          <input
            type="date"
            value={filter.toDate ? filter.toDate.toISOString().split("T")[0] : ""}
            onChange={(e) =>
              onFilterChange({
                toDate: e.target.value ? new Date(e.target.value) : undefined,
              })
            }
            className="w-full px-4 py-2 bg-secondary/60 dark:bg-gray-800 border border-border rounded-lg text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Till datum"
          />
        </div>
      </div>
    </div>
  );
}
