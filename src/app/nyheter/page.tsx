"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useSession } from "next-auth/react";
import { NewsFeed } from "@/components/nyheter/news-feed";
import { AddSourceDialog } from "@/components/nyheter/add-source-dialog";
import { SourceManager } from "@/components/nyheter/source-manager";
import { FeedSidebar } from "@/components/nyheter/feed-sidebar";
import { defaultFeeds } from "@/lib/nyheter/feeds";
import type { FeedConfig } from "@/lib/nyheter/types";

const STORAGE_KEY = "nyhetsflödet-sources";
const SYNCED_KEY = "nyhetsflödet-synced";

export default function NyheterPage() {
  const { data: session, status } = useSession();
  const [isAddSourceOpen, setIsAddSourceOpen] = useState(false);
  const [isManageSourcesOpen, setIsManageSourcesOpen] = useState(false);
  const [allSources, setAllSources] = useState<FeedConfig[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const hasSyncedRef = useRef(false);

  // Fetch sources from database
  const fetchSources = useCallback(async () => {
    try {
      const res = await fetch("/api/sources");
      if (res.ok) {
        const data = await res.json();
        if (data.feeds && data.feeds.length > 0) {
          setAllSources(data.feeds);
          return true;
        }
      }
    } catch (error) {
      console.error("Failed to fetch sources:", error);
    }
    return false;
  }, []);

  // Sync localStorage sources to database (one-time migration)
  const syncLocalStorageToDatabase = useCallback(async () => {
    if (hasSyncedRef.current) return;

    const synced = localStorage.getItem(SYNCED_KEY);
    if (synced) {
      hasSyncedRef.current = true;
      return;
    }

    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) {
      // No local sources to sync, use defaults
      try {
        const res = await fetch("/api/sources", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ sources: defaultFeeds }),
        });
        if (res.ok) {
          const data = await res.json();
          if (data.feeds) {
            setAllSources(data.feeds);
          }
        }
      } catch (error) {
        console.error("Failed to sync defaults:", error);
      }
    } else {
      // Sync localStorage sources to database
      try {
        const localSources = JSON.parse(stored);
        const res = await fetch("/api/sources", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ sources: localSources }),
        });
        if (res.ok) {
          const data = await res.json();
          if (data.feeds) {
            setAllSources(data.feeds);
          }
        }
      } catch (error) {
        console.error("Failed to sync localStorage:", error);
      }
    }

    localStorage.setItem(SYNCED_KEY, "true");
    hasSyncedRef.current = true;
  }, []);

  // Load sources on mount
  useEffect(() => {
    const loadSources = async () => {
      // First, try to fetch from database
      const hasDatabaseSources = await fetchSources();

      if (!hasDatabaseSources) {
        // No database sources, load from localStorage or defaults
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
          try {
            setAllSources(JSON.parse(stored));
          } catch {
            setAllSources(defaultFeeds);
          }
        } else {
          setAllSources(defaultFeeds);
        }
      }

      setIsLoaded(true);
    };

    loadSources();
  }, [fetchSources]);

  // Sync to database when user logs in
  useEffect(() => {
    if (status === "authenticated" && isLoaded && !hasSyncedRef.current) {
      syncLocalStorageToDatabase();
    }
  }, [status, isLoaded, syncLocalStorageToDatabase]);

  // Save to localStorage as backup
  useEffect(() => {
    if (isLoaded && allSources.length > 0) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(allSources));
    }
  }, [allSources, isLoaded]);

  const handleAddSource = async (config: FeedConfig) => {
    // Optimistic update
    setAllSources((prev) => [...prev, config]);

    // Save to database if logged in
    if (session?.user) {
      try {
        const res = await fetch("/api/sources", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(config),
        });
        if (res.ok) {
          const data = await res.json();
          // Update with database ID
          setAllSources((prev) =>
            prev.map((s) => (s.url === config.url ? data.feed : s))
          );
        }
      } catch (error) {
        console.error("Failed to save source:", error);
      }
    }
  };

  const handleRemoveSource = async (id: string) => {
    const source = allSources.find((s) => s.id === id);

    // Optimistic update
    setAllSources((prev) => prev.filter((s) => s.id !== id));

    // Delete from database if logged in and source has database ID
    if (session?.user && source) {
      try {
        await fetch(`/api/sources?id=${id}`, {
          method: "DELETE",
        });
      } catch (error) {
        console.error("Failed to delete source:", error);
        // Revert on error
        if (source) {
          setAllSources((prev) => [...prev, source]);
        }
      }
    }
  };

  const handleToggleSource = async (id: string, enabled: boolean) => {
    // Optimistic update
    setAllSources((prev) =>
      prev.map((s) => (s.id === id ? { ...s, enabled } : s))
    );

    // Update in database if logged in
    if (session?.user) {
      try {
        await fetch("/api/sources", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id, enabled }),
        });
      } catch (error) {
        console.error("Failed to update source:", error);
        // Revert on error
        setAllSources((prev) =>
          prev.map((s) => (s.id === id ? { ...s, enabled: !enabled } : s))
        );
      }
    }
  };

  const handleToggleCategory = (categoryId: string) => {
    setSelectedCategories((prev) =>
      prev.includes(categoryId)
        ? prev.filter((c) => c !== categoryId)
        : [...prev, categoryId]
    );
  };

  // Filter sources based on selected categories
  const filteredSources = selectedCategories.length > 0
    ? allSources.filter((source) =>
        source.tags?.some((tag) => selectedCategories.includes(tag))
      )
    : allSources;

  return (
    <main className="min-h-screen bg-[#fafafa] dark:bg-[#0a0a0a]">
      <div className="container mx-auto px-4 sm:px-6 py-6 sm:py-10">
        {/* Clean Header */}
        <header className="mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white tracking-tight">
            Nyhetsflödet
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-2 text-base">
            Senaste nyheterna från dina bevakade källor
          </p>
        </header>

        {/* Main Layout: Feed + Sidebar */}
        <div className="flex gap-8">
          {/* Main News Feed */}
          <div className="flex-1 min-w-0">
            {isLoaded && (
              <NewsFeed
                allSources={filteredSources}
                selectedCategories={selectedCategories}
              />
            )}
          </div>

          {/* Right Sidebar */}
          <FeedSidebar
            sources={allSources}
            selectedCategories={selectedCategories}
            onToggleSource={handleToggleSource}
            onToggleCategory={handleToggleCategory}
            onAddSource={() => setIsAddSourceOpen(true)}
            onManageSources={() => setIsManageSourcesOpen(true)}
          />
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
