"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

interface SearchHistoryItem {
  orgNr: string;
  name: string;
  timestamp: number;
}

const STORAGE_KEY = "bolagsinfo-search-history";
const MAX_HISTORY = 8;

export function useSearchHistory() {
  const [history, setHistory] = useState<SearchHistoryItem[]>([]);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        setHistory(JSON.parse(stored));
      } catch {
        // Invalid data, clear it
        localStorage.removeItem(STORAGE_KEY);
      }
    }
  }, []);

  const addToHistory = (orgNr: string, name: string) => {
    const newItem: SearchHistoryItem = { orgNr, name, timestamp: Date.now() };
    const updated = [
      newItem,
      ...history.filter((item) => item.orgNr !== orgNr),
    ].slice(0, MAX_HISTORY);
    setHistory(updated);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  };

  const clearHistory = () => {
    setHistory([]);
    localStorage.removeItem(STORAGE_KEY);
  };

  return { history, addToHistory, clearHistory };
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
