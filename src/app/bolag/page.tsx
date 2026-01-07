"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FavoritesList } from "@/components/bolag/favorites-list";
import { SearchHistory, useSearchHistory } from "@/components/bolag/search-history";
import { SearchAutocomplete } from "@/components/ui/search-autocomplete";
import { BolagsverketWidget } from "@/components/bolag/bolagsverket-widget";
import { VinnovaWidget } from "@/components/bolag/vinnova-widget";
import { EnrichDataWidget } from "@/components/bolag/enrich-data-widget";
import { SelectedCompanyProvider, useSelectedCompany } from "@/contexts/selected-company-context";

function BolagPageContent() {
  const { history, addToHistory, clearHistory } = useSearchHistory();
  const { selectedCompany, setSelectedCompany, clearSelectedCompany } = useSelectedCompany();

  return (
    <main className="min-h-screen bg-background text-foreground">
      <div className="page-wrapper page-content">
        <header className="page-header">
          <h1 className="page-title">Bolagsinfo</h1>
        </header>

        <div className="max-w-3xl">
          {/* Search Card */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle>Sök företag</CardTitle>
            </CardHeader>
            <CardContent>
              <SearchAutocomplete
                placeholder="Sök på företagsnamn eller org.nr..."
                recentSearches={history}
                onSelectResult={(result) => {
                  addToHistory(result.orgNr, result.name);
                  setSelectedCompany({ orgNr: result.orgNr, name: result.name });
                }}
              />

              {/* Recent Searches */}
              <div className="mt-4">
                <SearchHistory history={history} onClear={clearHistory} />
              </div>
            </CardContent>
          </Card>

          {/* Selected Company Indicator */}
          {selectedCompany && (
            <div className="mt-4 p-4 bg-muted/50 rounded-lg border border-border">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Valt företag</p>
                  <p className="font-medium">{selectedCompany.name}</p>
                  <p className="text-sm text-muted-foreground">{selectedCompany.orgNr}</p>
                </div>
                <button
                  onClick={clearSelectedCompany}
                  className="text-sm text-muted-foreground hover:text-foreground"
                >
                  Rensa
                </button>
              </div>
            </div>
          )}

          {/* Tool Widgets */}
          <div className="mt-6 flex flex-wrap gap-4">
            <BolagsverketWidget selectedCompany={selectedCompany} />
            <VinnovaWidget selectedCompany={selectedCompany} />
            <EnrichDataWidget selectedCompany={selectedCompany} />
          </div>

          {/* Favorites */}
          <div className="mt-6">
            <FavoritesList />
          </div>
        </div>
      </div>
    </main>
  );
}

export default function Home() {
  return (
    <SelectedCompanyProvider>
      <BolagPageContent />
    </SelectedCompanyProvider>
  );
}
