"use client";

import { useState, useEffect, useCallback } from "react";

const STORAGE_KEY = "loopdesk-last-visit";

export function useNewArticles(currentArticleIds: string[]) {
  const [newArticleIds, setNewArticleIds] = useState<Set<string>>(new Set());
  const [lastVisit, setLastVisit] = useState<Date | null>(null);

  // Load last visit time from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        setLastVisit(new Date(stored));
      }
    } catch (error) {
      console.error("Failed to load last visit:", error);
    }
  }, []);

  // Update last visit time when user leaves
  useEffect(() => {
    const updateLastVisit = () => {
      const now = new Date().toISOString();
      localStorage.setItem(STORAGE_KEY, now);
    };

    // Update on unmount or page unload
    window.addEventListener("beforeunload", updateLastVisit);

    return () => {
      window.removeEventListener("beforeunload", updateLastVisit);
      updateLastVisit();
    };
  }, []);

  // Identify new articles since last visit
  useEffect(() => {
    if (!lastVisit || currentArticleIds.length === 0) {
      setNewArticleIds(new Set());
      return;
    }

    // In a real implementation, you'd check article publishedAt against lastVisit
    // For now, we'll just track unread articles
    const stored = localStorage.getItem("loopdesk-read-articles");
    const readArticles = stored ? new Set(JSON.parse(stored)) : new Set();

    const newIds = currentArticleIds.filter(id => !readArticles.has(id));
    setNewArticleIds(new Set(newIds));
  }, [currentArticleIds, lastVisit]);

  const markAllAsSeen = useCallback(() => {
    setNewArticleIds(new Set());
    const now = new Date().toISOString();
    localStorage.setItem(STORAGE_KEY, now);
  }, []);

  return {
    newArticleIds,
    newCount: newArticleIds.size,
    markAllAsSeen,
    lastVisit,
  };
}
