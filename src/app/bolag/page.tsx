"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { FavoritesList } from "@/components/bolag/favorites-list";
import { SearchHistory, useSearchHistory } from "@/components/bolag/search-history";

interface SearchResult {
  orgNr: string;
  name: string;
  companyType?: string;
  status?: string;
  location?: string;
}

export default function Home() {
  const [query, setQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [results, setResults] = useState<SearchResult[]>([]);
  const [hasSearched, setHasSearched] = useState(false);
  const router = useRouter();
  const { history, addToHistory, clearHistory } = useSearchHistory();

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setResults([]);

    if (query.length < 2) {
      setError("Ange minst 2 tecken");
      return;
    }

    // Check if it's a clean org number - go directly to company page
    const cleanQuery = query.replace(/\D/g, "");
    if (cleanQuery.length === 10 || cleanQuery.length === 12) {
      router.push(`/bolag/${cleanQuery}`);
      return;
    }

    // Text search
    setIsLoading(true);
    setHasSearched(true);

    try {
      const response = await fetch(`/api/bolag/search?q=${encodeURIComponent(query)}`);
      const data = await response.json();

      if (response.ok) {
        setResults(data.results || []);
        if (data.results?.length === 0) {
          setError("Inga företag hittades");
        }
      } else {
        setError(data.error || "Ett fel uppstod");
      }
    } catch {
      setError("Ett fel uppstod vid sökning");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (query.length < 2) {
      setResults([]);
      setHasSearched(false);
      return;
    }

    const controller = new AbortController();
    const timeout = setTimeout(async () => {
      setIsLoading(true);
      setError(null);
      setHasSearched(true);

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
    }, 300);

    return () => {
      controller.abort();
      clearTimeout(timeout);
    };
  }, [query]);

  const formatOrgNr = (orgNr: string) => {
    const clean = orgNr.replace(/\D/g, "");
    if (clean.length === 10) {
      return `${clean.slice(0, 6)}-${clean.slice(6)}`;
    }
    return orgNr;
  };

  return (
    <main className="min-h-screen bg-background text-foreground">
      <div className="max-w-[1200px] mx-auto px-4 py-12">
        <div className="max-w-2xl mx-auto">
          <header className="page-header text-center">
            <h1 className="page-title">Bolagsinfo</h1>
            <p className="page-subtitle">
              Hitta information om svenska bolag från flera källor
            </p>
          </header>

          <Card>
            <CardHeader>
              <CardTitle>Sök företag</CardTitle>
              <CardDescription>
                Sök på företagsnamn eller organisationsnummer
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSearch} className="space-y-4">
                <div className="flex gap-2">
                  <Input
                    type="text"
                    placeholder="Ex: Voi Technology eller 5591602999"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    className="flex-1"
                    disabled={isLoading}
                  />
                  <Button type="submit" disabled={isLoading}>
                    {isLoading ? "Söker..." : "Sök"}
                  </Button>
                </div>

                {error && (
                  <p className="text-sm text-red-600 dark:text-red-400">
                    {error}
                  </p>
                )}
              </form>

              {/* Search Results */}
              {results.length > 0 && (
                <div className="mt-6 space-y-2">
                  <p className="text-sm text-muted-foreground mb-3">
                    {results.length} träffar
                  </p>
                  {results.map((result) => (
                    <Link
                      key={result.orgNr}
                      href={`/bolag/${result.orgNr}`}
                      onClick={() => addToHistory(result.orgNr, result.name)}
                      className="block p-3 rounded-lg border border-border hover:bg-secondary transition-colors"
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-medium">{result.name}</p>
                          <p className="text-sm text-muted-foreground">
                            {formatOrgNr(result.orgNr)}
                            {result.location && ` - ${result.location}`}
                          </p>
                        </div>
                        <div className="text-right text-sm text-muted-foreground">
                          {result.companyType && <p>{result.companyType}</p>}
                          {result.status && <p>{result.status}</p>}
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              )}

              {hasSearched && results.length === 0 && !error && !isLoading && (
                <p className="mt-6 text-center text-muted-foreground">
                  Inga resultat hittades
                </p>
              )}

              {/* Search History */}
              {!hasSearched && (
                <SearchHistory history={history} onClear={clearHistory} />
              )}
            </CardContent>
          </Card>

          {/* Favorites */}
          <div className="mt-6">
            <FavoritesList />
          </div>

          <div className="mt-12 grid gap-4 md:grid-cols-3">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Bolagsverket</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Officiell bolagsdata
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Allabolag</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Bokslut, nyckeltal, befattningshavare
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Vinnova</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Innovationsbidrag
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </main>
  );
}
