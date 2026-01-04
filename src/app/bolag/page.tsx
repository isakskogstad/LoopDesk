"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { FavoritesList } from "@/components/bolag/favorites-list";
import { SearchHistory, useSearchHistory } from "@/components/bolag/search-history";
import { SearchAutocomplete } from "@/components/ui/search-autocomplete";

export default function Home() {
  const { history, addToHistory, clearHistory } = useSearchHistory();

  return (
    <main className="min-h-screen bg-background text-foreground">
      <div className="max-w-[1200px] mx-auto px-4 py-8">
        <header className="page-header">
          <h1 className="page-title">Bolagsinfo</h1>
          <p className="page-subtitle">
            Hitta information om svenska bolag från flera källor
          </p>
        </header>

        <div className="max-w-2xl">
          <Card>
            <CardHeader>
              <CardTitle>Sök företag</CardTitle>
              <CardDescription>
                Sök på företagsnamn eller organisationsnummer
              </CardDescription>
            </CardHeader>
            <CardContent>
              <SearchAutocomplete
                placeholder="Sök på företagsnamn eller org.nr..."
                recentSearches={history}
                onSelectResult={(result) => addToHistory(result.orgNr, result.name)}
              />

              {/* Search History below for when not focused */}
              <div className="mt-4">
                <SearchHistory history={history} onClear={clearHistory} />
              </div>
            </CardContent>
          </Card>

          {/* Favorites */}
          <div className="mt-6">
            <FavoritesList />
          </div>
        </div>

        {/* Data Sources */}
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
    </main>
  );
}
