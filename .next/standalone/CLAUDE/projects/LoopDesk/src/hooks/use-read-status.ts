"use client";

import { useState, useEffect, useCallback } from "react";

const STORAGE_KEY = "loopdesk_read_events";
const MAX_STORED_IDS = 1000; // Limit to prevent localStorage overflow

interface UseReadStatusReturn {
  readIds: Set<string>;
  isRead: (id: string) => boolean;
  markAsRead: (id: string) => void;
  markAllAsRead: (ids: string[]) => void;
  unreadCount: (ids: string[]) => number;
}

/**
 * Hook for managing read/unread status of events.
 * Persists to localStorage.
 */
export function useReadStatus(): UseReadStatusReturn {
  const [readIds, setReadIds] = useState<Set<string>>(new Set());

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          setReadIds(new Set(parsed));
        }
      }
    } catch (error) {
      console.warn("Failed to load read status:", error);
    }
  }, []);

  // Save to localStorage when readIds changes
  const saveToStorage = useCallback((ids: Set<string>) => {
    try {
      // Keep only the most recent IDs to prevent overflow
      const idsArray = Array.from(ids);
      const trimmedIds = idsArray.slice(-MAX_STORED_IDS);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(trimmedIds));
    } catch (error) {
      console.warn("Failed to save read status:", error);
    }
  }, []);

  const isRead = useCallback(
    (id: string) => readIds.has(id),
    [readIds]
  );

  const markAsRead = useCallback((id: string) => {
    setReadIds((prev) => {
      if (prev.has(id)) return prev;
      const next = new Set(prev);
      next.add(id);
      saveToStorage(next);
      return next;
    });
  }, [saveToStorage]);

  const markAllAsRead = useCallback((ids: string[]) => {
    setReadIds((prev) => {
      const next = new Set(prev);
      let changed = false;
      for (const id of ids) {
        if (!next.has(id)) {
          next.add(id);
          changed = true;
        }
      }
      if (changed) {
        saveToStorage(next);
        return next;
      }
      return prev;
    });
  }, [saveToStorage]);

  const unreadCount = useCallback(
    (ids: string[]) => ids.filter((id) => !readIds.has(id)).length,
    [readIds]
  );

  return {
    readIds,
    isRead,
    markAsRead,
    markAllAsRead,
    unreadCount,
  };
}
