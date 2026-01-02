"use client";

import { useState, useEffect, useCallback } from "react";

const STORAGE_KEY = "loopdesk-read-articles";
const MAX_STORED_IDS = 1000; // Limit to prevent localStorage overflow

export function useReadArticles() {
  const [readArticles, setReadArticles] = useState<Set<string>>(new Set());
  const [isLoaded, setIsLoaded] = useState(false);

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        setReadArticles(new Set(parsed));
      }
    } catch (error) {
      console.error("Failed to load read articles:", error);
    }
    setIsLoaded(true);
  }, []);

  // Save to localStorage whenever readArticles changes
  useEffect(() => {
    if (!isLoaded) return;

    try {
      const arr = Array.from(readArticles);
      // Keep only the most recent MAX_STORED_IDS
      const trimmed = arr.slice(-MAX_STORED_IDS);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(trimmed));
    } catch (error) {
      console.error("Failed to save read articles:", error);
    }
  }, [readArticles, isLoaded]);

  const markAsRead = useCallback((articleId: string) => {
    setReadArticles((prev) => {
      const next = new Set(prev);
      next.add(articleId);
      return next;
    });
  }, []);

  const markAsUnread = useCallback((articleId: string) => {
    setReadArticles((prev) => {
      const next = new Set(prev);
      next.delete(articleId);
      return next;
    });
  }, []);

  const isRead = useCallback(
    (articleId: string) => {
      return readArticles.has(articleId);
    },
    [readArticles]
  );

  const clearAll = useCallback(() => {
    setReadArticles(new Set());
  }, []);

  return {
    readArticles,
    markAsRead,
    markAsUnread,
    isRead,
    clearAll,
    isLoaded,
  };
}
