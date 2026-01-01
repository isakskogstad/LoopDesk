"use client";

import { useState, useEffect, useCallback, useRef } from "react";

const STORAGE_KEY = "darkMode";

export function useDarkMode() {
  const [isDark, setIsDark] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const hasSyncedRef = useRef(false);

  // Initialize from localStorage on mount (client-side only)
  useEffect(() => {
    if (typeof window === "undefined") return;

    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
      const shouldBeDark = stored !== null ? stored === "true" : prefersDark;

      setIsDark(shouldBeDark);
      applyDarkMode(shouldBeDark);
    } catch {
      // localStorage might not be available
    }

    setIsLoaded(true);
  }, []);

  // Sync with database when user is logged in
  useEffect(() => {
    if (!isLoaded || hasSyncedRef.current) return;

    const syncWithDatabase = async () => {
      try {
        const res = await fetch("/api/konto/settings");
        if (res.ok) {
          const settings = await res.json();
          if (settings.darkMode !== undefined) {
            setIsDark(settings.darkMode);
            applyDarkMode(settings.darkMode);
            localStorage.setItem(STORAGE_KEY, String(settings.darkMode));
            hasSyncedRef.current = true;
          }
        }
      } catch {
        // User might not be logged in, use localStorage value
      }
    };

    syncWithDatabase();
  }, [isLoaded]);

  const applyDarkMode = (value: boolean) => {
    if (typeof document === "undefined") return;
    if (value) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  };

  const saveToDatabase = async (value: boolean) => {
    try {
      await fetch("/api/konto/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ darkMode: value }),
      });
    } catch {
      // Ignore errors - localStorage is the fallback
    }
  };

  const toggle = useCallback(() => {
    if (typeof window === "undefined") return;

    setIsDark((prev) => {
      const newValue = !prev;

      try {
        localStorage.setItem(STORAGE_KEY, String(newValue));
      } catch {
        // localStorage might not be available
      }

      applyDarkMode(newValue);
      saveToDatabase(newValue);

      return newValue;
    });
  }, []);

  const setDarkMode = useCallback((value: boolean) => {
    if (typeof window === "undefined") return;

    setIsDark(value);

    try {
      localStorage.setItem(STORAGE_KEY, String(value));
    } catch {
      // localStorage might not be available
    }

    applyDarkMode(value);
    saveToDatabase(value);
  }, []);

  return { isDark, toggle, setDarkMode, isLoaded };
}
