"use client";

import { useState, useEffect, useCallback } from "react";

const STORAGE_KEY = "darkMode";

export function useDarkMode() {
  const [isDark, setIsDark] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  // Initialize from localStorage on mount (client-side only)
  useEffect(() => {
    if (typeof window === "undefined") return;

    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
      const shouldBeDark = stored !== null ? stored === "true" : prefersDark;

      setIsDark(shouldBeDark);

      if (shouldBeDark) {
        document.documentElement.classList.add("dark");
      } else {
        document.documentElement.classList.remove("dark");
      }
    } catch {
      // localStorage might not be available
    }

    setIsLoaded(true);
  }, []);

  const toggle = useCallback(() => {
    if (typeof window === "undefined") return;

    setIsDark((prev) => {
      const newValue = !prev;

      try {
        localStorage.setItem(STORAGE_KEY, String(newValue));
      } catch {
        // localStorage might not be available
      }

      if (newValue) {
        document.documentElement.classList.add("dark");
      } else {
        document.documentElement.classList.remove("dark");
      }

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

    if (value) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, []);

  return { isDark, toggle, setDarkMode, isLoaded };
}
