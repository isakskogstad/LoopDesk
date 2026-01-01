"use client";

import { useState, useEffect } from "react";
import { Newspaper, Rss, Bell, Plus, Twitter, Linkedin, Instagram, Settings } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { NewsFeed } from "@/components/nyheter/news-feed";
import { AddSourceDialog } from "@/components/nyheter/add-source-dialog";
import { SourceManager } from "@/components/nyheter/source-manager";
import { defaultFeeds } from "@/lib/nyheter/feeds";
import type { FeedConfig } from "@/lib/nyheter/types";

const STORAGE_KEY = "nyhetsflödet-sources";

export default function Home() {
  const [isAddSourceOpen, setIsAddSourceOpen] = useState(false);
  const [isManageSourcesOpen, setIsManageSourcesOpen] = useState(false);
  const [allSources, setAllSources] = useState<FeedConfig[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load sources from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        // Merge with default feeds (defaults take precedence for default IDs)
        const defaultIds = new Set(defaultFeeds.map(f => f.id));
        const customFeeds = parsed.filter((f: FeedConfig) => !defaultIds.has(f.id));
        setAllSources([...defaultFeeds, ...customFeeds]);
      } catch {
        setAllSources(defaultFeeds);
      }
    } else {
      setAllSources(defaultFeeds);
    }
    setIsLoaded(true);
  }, []);

  // Save to localStorage when sources change
  useEffect(() => {
    if (isLoaded && allSources.length > 0) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(allSources));
    }
  }, [allSources, isLoaded]);

  const handleAddSource = (config: FeedConfig) => {
    setAllSources((prev) => [...prev, config]);
  };

  const handleRemoveSource = (id: string) => {
    setAllSources((prev) => prev.filter((s) => s.id !== id));
  };

  const handleToggleSource = (id: string, enabled: boolean) => {
    setAllSources((prev) =>
      prev.map((s) => (s.id === id ? { ...s, enabled } : s))
    );
  };

  const enabledCount = allSources.filter(s => s.enabled).length;

  return (
    <main className="min-h-screen">
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-display mb-4 text-gray-900 dark:text-white">
              Nyhetsflödet
            </h1>
            <p className="text-lg text-gray-600 dark:text-gray-300">
              Nyheter, pressmeddelanden och sociala medier i realtid
            </p>
          </div>

          {/* Stats cards */}
          <div className="grid gap-4 md:grid-cols-3 mb-8">
            <Card className="section-shell">
              <CardHeader className="pb-2">
                <div className="flex items-center gap-2">
                  <Rss className="w-5 h-5 text-orange-500" />
                  <CardTitle className="text-lg">RSS-flöden</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Nyheter från svenska medier
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="section-shell">
              <CardHeader className="pb-2">
                <div className="flex items-center gap-2">
                  <Newspaper className="w-5 h-5 text-blue-500" />
                  <CardTitle className="text-lg">Pressmeddelanden</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Företagsnyheter direkt
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="section-shell">
              <CardHeader className="pb-2">
                <div className="flex items-center gap-2">
                  <Bell className="w-5 h-5 text-green-500" />
                  <CardTitle className="text-lg">Realtid</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Automatisk uppdatering
                </CardDescription>
              </CardContent>
            </Card>
          </div>

          {/* Source management card */}
          <Card className="section-shell mb-8">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-headline">Källor</CardTitle>
                  <CardDescription>
                    {enabledCount} aktiva källor • Lägg till sociala medier, RSS eller webbsidor
                  </CardDescription>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    onClick={() => setIsManageSourcesOpen(true)}
                    className="btn-press"
                  >
                    <Settings className="w-4 h-4 mr-2" />
                    Hantera
                  </Button>
                  <Button onClick={() => setIsAddSourceOpen(true)} className="btn-press">
                    <Plus className="w-4 h-4 mr-2" />
                    Lägg till
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-3">
                <button
                  onClick={() => setIsAddSourceOpen(true)}
                  className="flex items-center gap-2 px-4 py-2 rounded-full border border-[#1DA1F2] text-[#1DA1F2] hover:bg-[#1DA1F2]/10 transition-colors"
                >
                  <Twitter className="w-4 h-4" />
                  <span className="text-sm font-medium">Twitter/X</span>
                </button>
                <button
                  onClick={() => setIsAddSourceOpen(true)}
                  className="flex items-center gap-2 px-4 py-2 rounded-full border border-[#0A66C2] text-[#0A66C2] hover:bg-[#0A66C2]/10 transition-colors"
                >
                  <Linkedin className="w-4 h-4" />
                  <span className="text-sm font-medium">LinkedIn</span>
                </button>
                <button
                  onClick={() => setIsAddSourceOpen(true)}
                  className="flex items-center gap-2 px-4 py-2 rounded-full border border-[#E4405F] text-[#E4405F] hover:bg-[#E4405F]/10 transition-colors"
                >
                  <Instagram className="w-4 h-4" />
                  <span className="text-sm font-medium">Instagram</span>
                </button>
                <button
                  onClick={() => setIsAddSourceOpen(true)}
                  className="flex items-center gap-2 px-4 py-2 rounded-full border border-gray-400 text-gray-600 hover:bg-gray-100 transition-colors"
                >
                  <Rss className="w-4 h-4" />
                  <span className="text-sm font-medium">RSS/Webb</span>
                </button>
              </div>
            </CardContent>
          </Card>

          {/* News Feed */}
          <Card className="section-shell">
            <CardHeader>
              <CardTitle className="text-headline">Senaste nyheterna</CardTitle>
              <CardDescription>
                Automatisk uppdatering var 60:e sekund
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoaded && <NewsFeed allSources={allSources} />}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Add Source Dialog */}
      <AddSourceDialog
        isOpen={isAddSourceOpen}
        onClose={() => setIsAddSourceOpen(false)}
        onAdd={handleAddSource}
      />

      {/* Source Manager Dialog */}
      <SourceManager
        isOpen={isManageSourcesOpen}
        onClose={() => setIsManageSourcesOpen(false)}
        sources={allSources}
        onRemove={handleRemoveSource}
        onToggle={handleToggleSource}
      />
    </main>
  );
}
