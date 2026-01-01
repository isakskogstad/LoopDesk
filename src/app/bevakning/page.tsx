"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  Search,
  Building2,
  RefreshCw,
  ChevronUp,
  ChevronDown,
  Filter,
  X,
  Users,
  MapPin,
  TrendingUp,
  TrendingDown,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { formatOrgNr } from "@/lib/utils";

interface WatchedCompany {
  id: string;
  orgNumber: string;
  name: string;
  hasLogo: boolean;
  sector?: string | null;
  municipality?: string | null;
  employees?: number | null;
  revenue?: number | null;
  profit?: number | null;
  equityRatio?: number | null;
  status?: string | null;
  valuation?: number | null;
}

interface FilterOption {
  name: string | null;
  count: number;
}

type SortField = "name" | "revenue" | "employees" | "profit" | "equityRatio" | "municipality" | "sector";

// Format large numbers to readable format (e.g., 14.4 mdkr)
function formatRevenue(value: number | null | undefined): string {
  if (!value) return "-";
  const abs = Math.abs(value);
  if (abs >= 1_000_000_000) {
    return `${(value / 1_000_000_000).toFixed(1)} mdkr`;
  }
  if (abs >= 1_000_000) {
    return `${(value / 1_000_000).toFixed(0)} mkr`;
  }
  if (abs >= 1_000) {
    return `${(value / 1_000).toFixed(0)} tkr`;
  }
  return `${value} kr`;
}

function formatProfit(value: number | null | undefined): string {
  if (value === null || value === undefined) return "-";
  const formatted = formatRevenue(value);
  if (value < 0) {
    return formatted;
  }
  return formatted;
}

export default function BevakningslistaPage() {
  const router = useRouter();
  const [companies, setCompanies] = useState<WatchedCompany[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [isSeeding, setIsSeeding] = useState(false);
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [total, setTotal] = useState(0);
  const [needsSeed, setNeedsSeed] = useState(false);
  const [sortBy, setSortBy] = useState<SortField>("revenue");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [selectedSector, setSelectedSector] = useState<string | null>(null);
  const [sectors, setSectors] = useState<FilterOption[]>([]);
  const [showFilters, setShowFilters] = useState(false);
  const observerRef = useRef<IntersectionObserver | null>(null);
  const loadMoreRef = useRef<HTMLDivElement>(null);

  const INITIAL_LIMIT = 30;
  const LOAD_MORE_LIMIT = 20;

  const fetchCompanies = useCallback(async (reset = false) => {
    if (reset) {
      setIsLoading(true);
      setPage(1);
    } else {
      setIsLoadingMore(true);
    }

    try {
      const currentPage = reset ? 1 : page;
      const limit = reset ? INITIAL_LIMIT : LOAD_MORE_LIMIT;
      const params = new URLSearchParams({
        page: String(currentPage),
        limit: String(limit),
        sortBy,
        sortOrder,
      });
      if (search) params.set("q", search);
      if (selectedSector) params.set("sector", selectedSector);

      const res = await fetch(`/api/bevakning?${params}`);
      if (res.ok) {
        const data = await res.json();

        if (reset) {
          setCompanies(data.companies);
          setPage(2);
        } else {
          setCompanies(prev => [...prev, ...data.companies]);
          setPage(prev => prev + 1);
        }

        setTotal(data.total);
        setHasMore(data.companies.length === limit && companies.length + data.companies.length < data.total);
        setNeedsSeed(data.total === 0);

        if (data.filters?.sectors) {
          setSectors(data.filters.sectors);
        }
      }
    } catch (error) {
      console.error("Failed to fetch companies:", error);
    } finally {
      setIsLoading(false);
      setIsLoadingMore(false);
    }
  }, [page, search, sortBy, sortOrder, selectedSector, companies.length]);

  // Initial load
  useEffect(() => {
    fetchCompanies(true);
  }, [search, sortBy, sortOrder, selectedSector]);

  // Infinite scroll observer
  useEffect(() => {
    if (observerRef.current) {
      observerRef.current.disconnect();
    }

    observerRef.current = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !isLoading && !isLoadingMore) {
          fetchCompanies(false);
        }
      },
      { threshold: 0.1 }
    );

    if (loadMoreRef.current) {
      observerRef.current.observe(loadMoreRef.current);
    }

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [hasMore, isLoading, isLoadingMore, fetchCompanies]);

  const handleSeed = async () => {
    setIsSeeding(true);
    try {
      const res = await fetch("/api/bevakning/seed", { method: "POST" });
      if (res.ok) {
        await fetchCompanies(true);
      }
    } catch (error) {
      console.error("Failed to seed:", error);
    } finally {
      setIsSeeding(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSearch(searchInput);
  };

  const handleSort = (field: SortField) => {
    if (sortBy === field) {
      setSortOrder(prev => prev === "asc" ? "desc" : "asc");
    } else {
      setSortBy(field);
      setSortOrder(field === "name" ? "asc" : "desc");
    }
  };

  const handleCompanyClick = (orgNumber: string) => {
    router.push(`/bolag/${orgNumber}`);
  };

  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortBy !== field) return null;
    return sortOrder === "asc" ? (
      <ChevronUp className="w-4 h-4" />
    ) : (
      <ChevronDown className="w-4 h-4" />
    );
  };

  return (
    <main className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <header className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <h1 className="text-3xl font-semibold text-gray-900 dark:text-white">
              Bevakningslista
            </h1>
            <span className="text-sm text-gray-500 dark:text-gray-400">
              {total > 0 ? `${total} bolag` : ""}
            </span>
          </div>
          <p className="text-gray-600 dark:text-gray-400">
            Bolag inom Loop Tools bevakningsområde
          </p>
        </header>

        {/* Seed button if needed */}
        {needsSeed && !isLoading && (
          <div className="mb-8 p-6 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-100 dark:border-blue-800">
            <h2 className="font-medium text-blue-900 dark:text-blue-100 mb-2">
              Importera bolag
            </h2>
            <p className="text-sm text-blue-700 dark:text-blue-300 mb-4">
              Bevakningslistan är tom. Klicka nedan för att importera alla bolag med fullständig data.
            </p>
            <Button onClick={handleSeed} disabled={isSeeding}>
              {isSeeding ? (
                <>
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  Importerar...
                </>
              ) : (
                "Importera bolag"
              )}
            </Button>
          </div>
        )}

        {/* Search and Filters */}
        <div className="mb-6 flex flex-col sm:flex-row gap-4">
          <form onSubmit={handleSearch} className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                type="text"
                placeholder="Sök bolag, sektor, kommun..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                className="pl-10"
              />
            </div>
          </form>
          <Button
            variant="outline"
            onClick={() => setShowFilters(!showFilters)}
            className={showFilters ? "bg-gray-100 dark:bg-gray-800" : ""}
          >
            <Filter className="w-4 h-4 mr-2" />
            Filter
            {selectedSector && (
              <span className="ml-2 px-2 py-0.5 text-xs bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300 rounded-full">
                1
              </span>
            )}
          </Button>
        </div>

        {/* Filter Panel */}
        {showFilters && (
          <div className="mb-6 p-4 bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-medium">Sektor</span>
              {selectedSector && (
                <button
                  onClick={() => setSelectedSector(null)}
                  className="text-xs text-blue-600 hover:text-blue-700"
                >
                  Rensa filter
                </button>
              )}
            </div>
            <div className="flex flex-wrap gap-2">
              {sectors.slice(0, 15).map((sector) => (
                <button
                  key={sector.name}
                  onClick={() => setSelectedSector(selectedSector === sector.name ? null : sector.name)}
                  className={`px-3 py-1.5 text-sm rounded-full transition-colors ${
                    selectedSector === sector.name
                      ? "bg-blue-600 text-white"
                      : "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"
                  }`}
                >
                  {sector.name}
                  <span className="ml-1.5 opacity-60">({sector.count})</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Active Filters */}
        {(search || selectedSector) && (
          <div className="mb-4 flex flex-wrap gap-2">
            {search && (
              <span className="inline-flex items-center gap-1 px-3 py-1 bg-gray-100 dark:bg-gray-800 rounded-full text-sm">
                Sök: {search}
                <button onClick={() => { setSearch(""); setSearchInput(""); }}>
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
            {selectedSector && (
              <span className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300 rounded-full text-sm">
                {selectedSector}
                <button onClick={() => setSelectedSector(null)}>
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
          </div>
        )}

        {/* Table */}
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden">
          {/* Table Header */}
          <div className="grid grid-cols-12 gap-2 px-4 py-3 bg-gray-50 dark:bg-gray-800/50 border-b border-gray-200 dark:border-gray-800 text-sm font-medium text-gray-600 dark:text-gray-400">
            <div className="col-span-4 lg:col-span-3">
              <button
                onClick={() => handleSort("name")}
                className="flex items-center gap-1 hover:text-gray-900 dark:hover:text-white"
              >
                Bolag
                <SortIcon field="name" />
              </button>
            </div>
            <div className="col-span-2 hidden lg:block">
              <button
                onClick={() => handleSort("sector")}
                className="flex items-center gap-1 hover:text-gray-900 dark:hover:text-white"
              >
                Sektor
                <SortIcon field="sector" />
              </button>
            </div>
            <div className="col-span-2 lg:col-span-1 hidden sm:block">
              <button
                onClick={() => handleSort("municipality")}
                className="flex items-center gap-1 hover:text-gray-900 dark:hover:text-white"
              >
                <MapPin className="w-3 h-3" />
                Kommun
                <SortIcon field="municipality" />
              </button>
            </div>
            <div className="col-span-2 lg:col-span-1 text-right">
              <button
                onClick={() => handleSort("employees")}
                className="flex items-center gap-1 ml-auto hover:text-gray-900 dark:hover:text-white"
              >
                <Users className="w-3 h-3" />
                <SortIcon field="employees" />
              </button>
            </div>
            <div className="col-span-3 lg:col-span-2 text-right">
              <button
                onClick={() => handleSort("revenue")}
                className="flex items-center gap-1 ml-auto hover:text-gray-900 dark:hover:text-white"
              >
                Omsättning
                <SortIcon field="revenue" />
              </button>
            </div>
            <div className="col-span-3 lg:col-span-2 text-right hidden sm:flex">
              <button
                onClick={() => handleSort("profit")}
                className="flex items-center gap-1 ml-auto hover:text-gray-900 dark:hover:text-white"
              >
                Resultat
                <SortIcon field="profit" />
              </button>
            </div>
            <div className="col-span-1 text-right hidden lg:block">
              <button
                onClick={() => handleSort("equityRatio")}
                className="flex items-center gap-1 ml-auto hover:text-gray-900 dark:hover:text-white"
              >
                Soliditet
                <SortIcon field="equityRatio" />
              </button>
            </div>
          </div>

          {/* Table Body */}
          {isLoading ? (
            <div className="divide-y divide-gray-100 dark:divide-gray-800">
              {Array.from({ length: 10 }).map((_, i) => (
                <div key={i} className="grid grid-cols-12 gap-2 px-4 py-4 animate-pulse">
                  <div className="col-span-4 lg:col-span-3 flex items-center gap-3">
                    <div className="w-10 h-10 bg-gray-200 dark:bg-gray-700 rounded-lg" />
                    <div className="flex-1">
                      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-2" />
                      <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2" />
                    </div>
                  </div>
                  <div className="col-span-2 hidden lg:block">
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-2/3" />
                  </div>
                  <div className="col-span-2 lg:col-span-1 hidden sm:block">
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2" />
                  </div>
                  <div className="col-span-2 lg:col-span-1">
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-12 ml-auto" />
                  </div>
                  <div className="col-span-3 lg:col-span-2">
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-20 ml-auto" />
                  </div>
                  <div className="col-span-3 lg:col-span-2 hidden sm:block">
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-16 ml-auto" />
                  </div>
                  <div className="col-span-1 hidden lg:block">
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-10 ml-auto" />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="divide-y divide-gray-100 dark:divide-gray-800">
              {companies.map((company) => (
                <button
                  key={company.id}
                  onClick={() => handleCompanyClick(company.orgNumber)}
                  className="w-full grid grid-cols-12 gap-2 px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors text-left"
                >
                  {/* Company Name + Logo */}
                  <div className="col-span-4 lg:col-span-3 flex items-center gap-3 min-w-0">
                    <div className="w-10 h-10 flex-shrink-0 flex items-center justify-center bg-gray-100 dark:bg-gray-800 rounded-lg overflow-hidden">
                      {company.hasLogo ? (
                        <img
                          src={`/logos/${company.orgNumber}.png`}
                          alt=""
                          className="w-8 h-8 object-contain"
                          onError={(e) => {
                            (e.target as HTMLImageElement).style.display = "none";
                          }}
                        />
                      ) : (
                        <Building2 className="w-5 h-5 text-gray-400" />
                      )}
                    </div>
                    <div className="min-w-0">
                      <p className="font-medium text-gray-900 dark:text-white truncate">
                        {company.name}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {formatOrgNr(company.orgNumber)}
                      </p>
                    </div>
                  </div>

                  {/* Sector */}
                  <div className="col-span-2 hidden lg:flex items-center">
                    {company.sector ? (
                      <span className="text-sm text-gray-600 dark:text-gray-400 truncate">
                        {company.sector}
                      </span>
                    ) : (
                      <span className="text-sm text-gray-300 dark:text-gray-600">-</span>
                    )}
                  </div>

                  {/* Municipality */}
                  <div className="col-span-2 lg:col-span-1 hidden sm:flex items-center">
                    <span className="text-sm text-gray-600 dark:text-gray-400 truncate">
                      {company.municipality || "-"}
                    </span>
                  </div>

                  {/* Employees */}
                  <div className="col-span-2 lg:col-span-1 flex items-center justify-end">
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      {company.employees ? company.employees.toLocaleString("sv-SE") : "-"}
                    </span>
                  </div>

                  {/* Revenue */}
                  <div className="col-span-3 lg:col-span-2 flex items-center justify-end">
                    <span className="text-sm font-medium text-gray-900 dark:text-white">
                      {formatRevenue(company.revenue)}
                    </span>
                  </div>

                  {/* Profit */}
                  <div className="col-span-3 lg:col-span-2 hidden sm:flex items-center justify-end gap-1">
                    {company.profit !== null && company.profit !== undefined && (
                      <>
                        {company.profit >= 0 ? (
                          <TrendingUp className="w-3 h-3 text-green-500" />
                        ) : (
                          <TrendingDown className="w-3 h-3 text-red-500" />
                        )}
                      </>
                    )}
                    <span className={`text-sm ${
                      company.profit === null || company.profit === undefined
                        ? "text-gray-400"
                        : company.profit >= 0
                        ? "text-green-600 dark:text-green-400"
                        : "text-red-600 dark:text-red-400"
                    }`}>
                      {formatProfit(company.profit)}
                    </span>
                  </div>

                  {/* Equity Ratio */}
                  <div className="col-span-1 hidden lg:flex items-center justify-end">
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      {company.equityRatio !== null ? `${company.equityRatio}%` : "-"}
                    </span>
                  </div>
                </button>
              ))}

              {/* Load More Trigger */}
              {hasMore && (
                <div ref={loadMoreRef} className="px-4 py-8 text-center">
                  {isLoadingMore ? (
                    <div className="flex items-center justify-center gap-2 text-gray-500">
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Laddar fler...</span>
                    </div>
                  ) : (
                    <span className="text-sm text-gray-400">
                      Scrolla för att ladda fler
                    </span>
                  )}
                </div>
              )}

              {/* End of list */}
              {!hasMore && companies.length > 0 && (
                <div className="px-4 py-6 text-center text-sm text-gray-400">
                  Visar alla {companies.length} bolag
                </div>
              )}

              {/* No results */}
              {!isLoading && companies.length === 0 && !needsSeed && (
                <div className="px-4 py-12 text-center">
                  <p className="text-gray-500 dark:text-gray-400">
                    Inga bolag hittades
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
