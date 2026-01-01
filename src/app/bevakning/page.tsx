"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Search, Building2, ExternalLink, RefreshCw } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { formatOrgNr } from "@/lib/utils";

interface WatchedCompany {
  id: string;
  orgNumber: string;
  name: string;
  hasLogo: boolean;
  category?: string;
  notes?: string;
}

export default function BevakningslistaPage() {
  const router = useRouter();
  const [companies, setCompanies] = useState<WatchedCompany[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSeeding, setIsSeeding] = useState(false);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [needsSeed, setNeedsSeed] = useState(false);

  const fetchCompanies = useCallback(async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams({
        page: String(page),
        limit: "50",
      });
      if (search) {
        params.set("q", search);
      }

      const res = await fetch(`/api/bevakning?${params}`);
      if (res.ok) {
        const data = await res.json();
        setCompanies(data.companies);
        setTotalPages(data.totalPages);
        setTotal(data.total);
        setNeedsSeed(data.total === 0);
      }
    } catch (error) {
      console.error("Failed to fetch companies:", error);
    } finally {
      setIsLoading(false);
    }
  }, [page, search]);

  useEffect(() => {
    fetchCompanies();
  }, [fetchCompanies]);

  const handleSeed = async () => {
    setIsSeeding(true);
    try {
      const res = await fetch("/api/bevakning/seed", { method: "POST" });
      if (res.ok) {
        const data = await res.json();
        console.log("Seed result:", data);
        await fetchCompanies();
      }
    } catch (error) {
      console.error("Failed to seed:", error);
    } finally {
      setIsSeeding(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchCompanies();
  };

  const handleCompanyClick = (orgNumber: string) => {
    router.push(`/bolag/${orgNumber}`);
  };

  return (
    <main className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <header className="mb-8">
          <h1 className="text-3xl font-semibold text-gray-900 dark:text-white mb-2">
            Bevakningslista
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            {total > 0
              ? `${total} bolag i Loop Tools bevakningsområde`
              : "Laddar bolag..."}
          </p>
        </header>

        {/* Seed button if needed */}
        {needsSeed && !isLoading && (
          <div className="mb-8 p-6 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-100 dark:border-blue-800">
            <h2 className="font-medium text-blue-900 dark:text-blue-100 mb-2">
              Importera bolag
            </h2>
            <p className="text-sm text-blue-700 dark:text-blue-300 mb-4">
              Bevakningslistan är tom. Klicka nedan för att importera alla 1210+ bolag.
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

        {/* Search */}
        <form onSubmit={handleSearch} className="mb-6">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              type="text"
              placeholder="Sök bolag..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>
        </form>

        {/* Company Grid */}
        {isLoading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
            {Array.from({ length: 24 }).map((_, i) => (
              <div
                key={i}
                className="aspect-square bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 animate-pulse"
              />
            ))}
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
              {companies.map((company) => (
                <button
                  key={company.id}
                  onClick={() => handleCompanyClick(company.orgNumber)}
                  className="group relative aspect-square bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 p-4 flex flex-col items-center justify-center hover:border-blue-300 dark:hover:border-blue-700 hover:shadow-lg transition-all overflow-hidden"
                >
                  {/* Logo */}
                  <div className="w-16 h-16 mb-3 flex items-center justify-center">
                    {company.hasLogo ? (
                      <img
                        src={`/logos/${company.orgNumber}.png`}
                        alt={company.name}
                        className="max-w-full max-h-full object-contain"
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.display = "none";
                          (e.target as HTMLImageElement).nextElementSibling?.classList.remove("hidden");
                        }}
                      />
                    ) : null}
                    <div className={`w-12 h-12 rounded-lg bg-gray-100 dark:bg-gray-800 flex items-center justify-center ${company.hasLogo ? "hidden" : ""}`}>
                      <Building2 className="w-6 h-6 text-gray-400" />
                    </div>
                  </div>

                  {/* Name */}
                  <h3 className="text-sm font-medium text-center text-gray-900 dark:text-white line-clamp-2 leading-tight">
                    {company.name}
                  </h3>

                  {/* Org number on hover */}
                  <span className="absolute bottom-2 left-2 right-2 text-[10px] text-gray-400 text-center opacity-0 group-hover:opacity-100 transition-opacity">
                    {formatOrgNr(company.orgNumber)}
                  </span>

                  {/* External link icon on hover */}
                  <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <ExternalLink className="w-4 h-4 text-gray-400" />
                  </div>
                </button>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="mt-8 flex justify-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                >
                  Föregående
                </Button>
                <span className="flex items-center px-4 text-sm text-gray-600 dark:text-gray-400">
                  Sida {page} av {totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                >
                  Nästa
                </Button>
              </div>
            )}
          </>
        )}
      </div>
    </main>
  );
}
