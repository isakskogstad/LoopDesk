"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";

interface SearchHistoryItem {
  orgNr: string;
  name: string;
  timestamp: number;
}

const STORAGE_KEY = "bolagsinfo-search-history";
const MAX_HISTORY = 8;

export function useSearchHistory() {
  const { data: session, status } = useSession();
  const [history, setHistory] = useState<SearchHistoryItem[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const hasSyncedRef = useRef(false);

  // Load history on mount
  useEffect(() => {
    const loadHistory = async () => {
      // First load from localStorage
      const localHistory = getLocalHistory();
      setHistory(localHistory);

      // Then try to fetch from database if logged in
      if (status === "authenticated" && session?.user && !hasSyncedRef.current) {
        try {
          const res = await fetch("/api/bolag/history");
          if (res.ok) {
            const data = await res.json();
            if (data.history && data.history.length > 0) {
              setHistory(data.history);
              saveLocalHistory(data.history);
              hasSyncedRef.current = true;
            }
          }
        } catch {
          // Use localStorage value
        }
      }

      setIsLoaded(true);
    };

    loadHistory();
  }, [session?.user, status]);

  // Sync localStorage to database on first login
  useEffect(() => {
    const syncToDatabase = async () => {
      if (status !== "authenticated" || !session?.user || hasSyncedRef.current) return;

      const localHistory = getLocalHistory();
      if (localHistory.length === 0) return;

      // Check if database already has history
      try {
        const res = await fetch("/api/bolag/history");
        if (res.ok) {
          const data = await res.json();
          if (data.history && data.history.length > 0) {
            // Database already has history, use that
            return;
          }
        }

        // Sync localStorage history to database
        for (const item of localHistory) {
          await fetch("/api/bolag/history", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ orgNr: item.orgNr, name: item.name }),
          });
        }
      } catch {
        // Ignore sync errors
      }
    };

    syncToDatabase();
  }, [session?.user, status]);

  const addToHistory = useCallback(async (orgNr: string, name: string) => {
    const newItem: SearchHistoryItem = { orgNr, name, timestamp: Date.now() };

    // Optimistic update
    setHistory((prev) => {
      const updated = [
        newItem,
        ...prev.filter((item) => item.orgNr !== orgNr),
      ].slice(0, MAX_HISTORY);
      saveLocalHistory(updated);
      return updated;
    });

    // Save to database if logged in
    if (session?.user) {
      try {
        await fetch("/api/bolag/history", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ orgNr, name }),
        });
      } catch {
        // Ignore errors - localStorage is the fallback
      }
    }
  }, [session?.user]);

  const clearHistory = useCallback(async () => {
    // Optimistic update
    setHistory([]);
    localStorage.removeItem(STORAGE_KEY);

    // Clear from database if logged in
    if (session?.user) {
      try {
        await fetch("/api/bolag/history", {
          method: "DELETE",
        });
      } catch {
        // Ignore errors
      }
    }
  }, [session?.user]);

  return { history, addToHistory, clearHistory, isLoaded };
}

// Helper functions for localStorage
function getLocalHistory(): SearchHistoryItem[] {
  if (typeof window === "undefined") return [];

  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

function saveLocalHistory(history: SearchHistoryItem[]) {
  if (typeof window === "undefined") return;

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(history));
  } catch {
    // Ignore storage errors
  }
}

interface SearchHistoryProps {
  history: SearchHistoryItem[];
  onClear: () => void;
}

export function SearchHistory({ history, onClear }: SearchHistoryProps) {
  if (history.length === 0) return null;

  const formatOrgNr = (orgNr: string) => {
    const clean = orgNr.replace(/\D/g, "");
    if (clean.length === 10) {
      return `${clean.slice(0, 6)}-${clean.slice(6)}`;
    }
    return orgNr;
  };

  return (
    <div className="mt-4 pt-4 border-t">
      <div className="flex justify-between items-center mb-2">
        <p className="text-sm text-gray-500">Senaste sökningar</p>
        <button
          onClick={onClear}
          className="text-xs text-gray-400 hover:text-gray-600"
        >
          Rensa
        </button>
      </div>
      <div className="flex flex-wrap gap-2">
        {history.map((item) => (
          <Link
            key={item.orgNr}
            href={`/bolag/${item.orgNr}`}
            className="inline-flex items-center px-3 py-1.5 text-sm bg-gray-100 dark:bg-gray-800 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
          >
            <span className="font-medium truncate max-w-[150px]">{item.name}</span>
            <span className="ml-2 text-gray-400 text-xs">{formatOrgNr(item.orgNr)}</span>
          </Link>
        ))}
      </div>
    </div>
  );
}
