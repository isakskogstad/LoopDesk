"use client";

import { useState, useEffect, useCallback } from "react";

const STORAGE_KEY = "loopdesk-bookmarks";

export function useBookmarks() {
  const [bookmarks, setBookmarks] = useState<Set<string>>(new Set());
  const [isLoaded, setIsLoaded] = useState(false);

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        setBookmarks(new Set(parsed));
      }
    } catch (error) {
      console.error("Failed to load bookmarks:", error);
    }
    setIsLoaded(true);
  }, []);

  // Save to localStorage whenever bookmarks changes
  useEffect(() => {
    if (!isLoaded) return;

    try {
      const arr = Array.from(bookmarks);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(arr));
    } catch (error) {
      console.error("Failed to save bookmarks:", error);
    }
  }, [bookmarks, isLoaded]);

  const toggleBookmark = useCallback((articleId: string) => {
    setBookmarks((prev) => {
      const next = new Set(prev);
      if (next.has(articleId)) {
        next.delete(articleId);
      } else {
        next.add(articleId);
      }
      return next;
    });
  }, []);

  const addBookmark = useCallback((articleId: string) => {
    setBookmarks((prev) => {
      const next = new Set(prev);
      next.add(articleId);
      return next;
    });
  }, []);

  const removeBookmark = useCallback((articleId: string) => {
    setBookmarks((prev) => {
      const next = new Set(prev);
      next.delete(articleId);
      return next;
    });
  }, []);

  const isBookmarked = useCallback(
    (articleId: string) => {
      return bookmarks.has(articleId);
    },
    [bookmarks]
  );

  const clearAll = useCallback(() => {
    setBookmarks(new Set());
  }, []);

  return {
    bookmarks,
    toggleBookmark,
    addBookmark,
    removeBookmark,
    isBookmarked,
    clearAll,
    isLoaded,
  };
}
