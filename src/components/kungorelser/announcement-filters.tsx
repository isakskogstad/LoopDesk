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
    <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 p-4">
      <div className="flex items-center gap-3 mb-4">
        <Filter className="w-5 h-5 text-gray-400" />
        <span className="font-medium text-gray-900 dark:text-white">
          Filtrera kungörelser
        </span>
        {hasActiveFilters && (
          <button
            onClick={clearFilters}
            className="ml-auto flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
          >
            <X className="w-4 h-4" />
            Rensa filter
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Text search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            value={filter.query || ""}
            onChange={(e) => onFilterChange({ query: e.target.value || undefined })}
            placeholder="Sök i text..."
            className="w-full pl-10 pr-4 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm text-gray-900 dark:text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        {/* Type filter */}
        <div>
          <select
            value={filter.type || ""}
            onChange={(e) => onFilterChange({ type: e.target.value || undefined })}
            className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
            className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
            className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Till datum"
          />
        </div>
      </div>
    </div>
  );
}
