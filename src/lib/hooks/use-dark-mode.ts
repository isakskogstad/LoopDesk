"use client";

import { useState, useEffect, useCallback } from "react";

const STORAGE_KEY = "darkMode";

export function useDarkMode() {
  const [isDark, setIsDark] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  // Initialize from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    const shouldBeDark = stored !== null ? stored === "true" : prefersDark;

    setIsDark(shouldBeDark);
    setIsLoaded(true);

    if (shouldBeDark) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, []);

  const toggle = useCallback(() => {
    setIsDark((prev) => {
      const newValue = !prev;
      localStorage.setItem(STORAGE_KEY, String(newValue));

      if (newValue) {
        document.documentElement.classList.add("dark");
      } else {
        document.documentElement.classList.remove("dark");
      }

      return newValue;
    });
  }, []);

  const setDarkMode = useCallback((value: boolean) => {
    setIsDark(value);
    localStorage.setItem(STORAGE_KEY, String(value));

    if (value) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, []);

  return { isDark, toggle, setDarkMode, isLoaded };
}
