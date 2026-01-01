"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Loader2, FileText, AlertCircle, RefreshCw } from "lucide-react";
import { AnnouncementItem } from "./announcement-item";
import { SearchForm } from "./search-form";
import { AnnouncementFilters } from "./announcement-filters";
import type { Announcement, AnnouncementFilter } from "@/lib/kungorelser/types";

interface ApiResponse {
  announcements: Announcement[];
  total: number;
  types: string[];
  stats: {
    totalSearches: number;
    totalAnnouncements: number;
    lastSearchAt: string | null;
    isRunning: boolean;
  };
}

interface SearchResult {
  success: boolean;
  query: string;
  count: number;
  announcements: Announcement[];
}

export function AnnouncementList() {
  const router = useRouter();
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [total, setTotal] = useState(0);
  const [types, setTypes] = useState<string[]>([]);
  const [stats, setStats] = useState<ApiResponse["stats"] | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSearching, setIsSearching] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<AnnouncementFilter>({
    limit: 50,
    offset: 0,
  });

  // Fetch announcements from database
  const fetchAnnouncements = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const params = new URLSearchParams();
      if (filter.query) params.set("query", filter.query);
      if (filter.orgNumber) params.set("orgNumber", filter.orgNumber);
      if (filter.type) params.set("type", filter.type);
      if (filter.fromDate) params.set("fromDate", filter.fromDate.toISOString());
      if (filter.toDate) params.set("toDate", filter.toDate.toISOString());
      if (filter.limit) params.set("limit", filter.limit.toString());
      if (filter.offset) params.set("offset", filter.offset.toString());

      const response = await fetch(`/api/kungorelser?${params.toString()}`);

      if (!response.ok) {
        throw new Error("Kunde inte hämta kungörelser");
      }

      const data: ApiResponse = await response.json();
      setAnnouncements(data.announcements);
      setTotal(data.total);
      setTypes(data.types);
      setStats(data.stats);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Ett fel uppstod");
    } finally {
      setIsLoading(false);
    }
  }, [filter]);

  // Initial load
  useEffect(() => {
    fetchAnnouncements();
  }, [fetchAnnouncements]);

  // Search for new announcements
  const handleSearch = async (query: string, options?: { skipDetails?: boolean }) => {
    try {
      setIsSearching(true);
      setError(null);

      const response = await fetch("/api/kungorelser/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query, ...options }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Sökningen misslyckades");
      }

      const result: SearchResult = await response.json();

      // Refresh the list after search
      await fetchAnnouncements();

      // Show success message (could use toast here)
      console.log(`Found ${result.count} announcements for "${result.query}"`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Sökningen misslyckades");
    } finally {
      setIsSearching(false);
    }
  };

  // Handle company view
  const handleViewCompany = (orgNumber: string) => {
    router.push(`/bolag/${orgNumber}`);
  };

  // Handle filter changes
  const handleFilterChange = (newFilter: Partial<AnnouncementFilter>) => {
    setFilter((prev) => ({
      ...prev,
      ...newFilter,
      offset: 0, // Reset offset when filter changes
    }));
  };

  // Handle pagination
  const handleLoadMore = () => {
    setFilter((prev) => ({
      ...prev,
      offset: (prev.offset || 0) + (prev.limit || 50),
    }));
  };

  const hasMore = announcements.length < total;

  return (
    <div className="space-y-6">
      {/* Search form */}
      <div className="bg-gray-50 dark:bg-gray-800/50 rounded-2xl p-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Sök nya kungörelser
        </h2>
        <SearchForm onSearch={handleSearch} isLoading={isSearching} />

        {/* Stats */}
        {stats && (
          <div className="mt-4 flex items-center gap-4 text-sm text-gray-500">
            <span>{stats.totalAnnouncements} kungörelser i databasen</span>
            <span>|</span>
            <span>{stats.totalSearches} sökningar utförda</span>
            {stats.lastSearchAt && (
              <>
                <span>|</span>
                <span>
                  Senaste sökning: {new Date(stats.lastSearchAt).toLocaleString("sv-SE")}
                </span>
              </>
            )}
          </div>
        )}
      </div>

      {/* Filters */}
      <AnnouncementFilters
        filter={filter}
        types={types}
        onFilterChange={handleFilterChange}
      />

      {/* Error message */}
      {error && (
        <div className="flex items-center gap-3 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl text-red-700 dark:text-red-400">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <span>{error}</span>
          <button
            onClick={fetchAnnouncements}
            className="ml-auto flex items-center gap-1 text-sm hover:underline"
          >
            <RefreshCw className="w-4 h-4" />
            Försök igen
          </button>
        </div>
      )}

      {/* Loading state */}
      {isLoading && announcements.length === 0 && (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
        </div>
      )}

      {/* Empty state */}
      {!isLoading && announcements.length === 0 && !error && (
        <div className="text-center py-12">
          <FileText className="w-16 h-16 mx-auto text-gray-300 dark:text-gray-700 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            Inga kungörelser hittades
          </h3>
          <p className="text-gray-500 dark:text-gray-400 max-w-md mx-auto">
            Sök efter ett företagsnamn eller organisationsnummer för att hämta kungörelser från Bolagsverket.
          </p>
        </div>
      )}

      {/* Announcements list */}
      {announcements.length > 0 && (
        <>
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-500">
              Visar {announcements.length} av {total} kungörelser
            </p>
            <button
              onClick={fetchAnnouncements}
              disabled={isLoading}
              className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-700 disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`} />
              Uppdatera
            </button>
          </div>

          <div className="space-y-4">
            {announcements.map((announcement) => (
              <AnnouncementItem
                key={announcement.id}
                announcement={announcement}
                onViewCompany={handleViewCompany}
              />
            ))}
          </div>

          {/* Load more */}
          {hasMore && (
            <div className="text-center pt-4">
              <button
                onClick={handleLoadMore}
                disabled={isLoading}
                className="px-6 py-3 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 font-medium rounded-xl transition-colors"
              >
                {isLoading ? "Laddar..." : "Visa fler"}
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
