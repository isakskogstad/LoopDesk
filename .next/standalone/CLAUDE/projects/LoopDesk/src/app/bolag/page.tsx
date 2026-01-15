"use client";

import { Card, CardContent, CardDescription, CardHeader } from "@/components/ui/card";
import { FavoritesList } from "@/components/bolag/favorites-list";
import { SearchHistory, useSearchHistory } from "@/components/bolag/search-history";
import { SearchAutocomplete } from "@/components/ui/search-autocomplete";
import { BolagsverketWidget } from "@/components/bolag/bolagsverket-widget";
import { VinnovaWidget } from "@/components/bolag/vinnova-widget";
import { EnrichDataWidget } from "@/components/bolag/enrich-data-widget";
import { MediaWidget } from "@/components/bolag/media-widget";
import { Building2, FileText, Lightbulb, Image, Search, Database, TrendingUp } from "lucide-react";

export default function Home() {
  const { history, addToHistory, clearHistory } = useSearchHistory();

  return (
    <main className="min-h-screen bg-background text-foreground">
      <div className="page-wrapper page-content">
        {/* Hero Header */}
        <header className="page-header text-center max-w-2xl mx-auto">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 text-white mb-6 shadow-lg">
            <Building2 className="w-8 h-8" />
          </div>
          <h1 className="page-title">Bolagsinfo</h1>
          <p className="page-subtitle">
            Utforska svenska bolag med data från flera officiella källor
          </p>
        </header>

        {/* Search Section */}
        <div className="max-w-2xl mx-auto">
          <Card className="shadow-lg border-2 border-border/50 hover:border-blue-200 dark:hover:border-blue-800/50 transition-colors">
            <CardHeader className="text-center pb-2">
              <div className="inline-flex items-center justify-center gap-2 text-muted-foreground mb-2">
                <Search className="w-4 h-4" />
                <span className="text-xs font-medium uppercase tracking-wider">Sök företag</span>
              </div>
              <CardDescription className="text-base">
                Sök på företagsnamn eller organisationsnummer
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-0">
              <SearchAutocomplete
                placeholder="T.ex. Spotify eller 556703-7485..."
                recentSearches={history}
                onSelectResult={(result) => addToHistory(result.orgNr, result.name)}
              />

              {/* Search History */}
              <div className="mt-4">
                <SearchHistory history={history} onClear={clearHistory} />
              </div>
            </CardContent>
          </Card>

          {/* Tool Widgets - Improved Grid */}
          <div className="mt-8">
            <h2 className="text-section mb-4 flex items-center gap-2">
              <Database className="w-4 h-4 text-muted-foreground" />
              Verktyg
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <BolagsverketWidget />
              <VinnovaWidget />
              <EnrichDataWidget />
              <MediaWidget />
            </div>
          </div>

          {/* Favorites */}
          <div className="mt-8">
            <FavoritesList />
          </div>
        </div>

        {/* Data Sources - Enhanced Design */}
        <div className="mt-16">
          <div className="text-center mb-8">
            <h2 className="section-title mb-2">Datakällor</h2>
            <p className="text-sm text-muted-foreground">
              Information aggregeras från flera officiella källor
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 max-w-4xl mx-auto">
            <div className="source-card group">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-lg bg-emerald-500/10 dark:bg-emerald-500/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <FileText className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                </div>
                <h3 className="font-semibold text-foreground">Bolagsverket</h3>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Officiell registreringsinformation, styrelse och kungörelser
              </p>
            </div>

            <div className="source-card group">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-lg bg-orange-500/10 dark:bg-orange-500/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <TrendingUp className="w-5 h-5 text-orange-600 dark:text-orange-400" />
                </div>
                <h3 className="font-semibold text-foreground">Allabolag</h3>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Bokslut, nyckeltal, ägare och befattningshavare
              </p>
            </div>

            <div className="source-card group">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-lg bg-green-500/10 dark:bg-green-500/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Lightbulb className="w-5 h-5 text-green-600 dark:text-green-400" />
                </div>
                <h3 className="font-semibold text-foreground">Vinnova</h3>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Innovationsbidrag och forskningsprojekt
              </p>
            </div>

            <div className="source-card group">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-lg bg-purple-500/10 dark:bg-purple-500/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Image className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                </div>
                <h3 className="font-semibold text-foreground">Media</h3>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Logotyper och varumärken via 6 API-källor
              </p>
            </div>
          </div>
        </div>

        {/* Stats Footer */}
        <div className="mt-16 pt-8 border-t border-border">
          <div className="flex flex-wrap justify-center gap-8 text-center">
            <div>
              <p className="text-2xl font-bold text-foreground font-mono">1.2M+</p>
              <p className="text-xs text-muted-foreground uppercase tracking-wider">Registrerade bolag</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground font-mono">4</p>
              <p className="text-xs text-muted-foreground uppercase tracking-wider">Datakällor</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground font-mono">Realtid</p>
              <p className="text-xs text-muted-foreground uppercase tracking-wider">Uppdateringar</p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
