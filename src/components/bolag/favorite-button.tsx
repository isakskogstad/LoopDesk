"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";

interface FavoriteButtonProps {
  orgNr: string;
  companyName: string;
}

export interface Favorite {
  orgNumber: string;
  name: string;
}

const FAVORITES_KEY = "bolagsinfo_favorites";

export function FavoriteButton({ orgNr, companyName }: FavoriteButtonProps) {
  const { data: session, status } = useSession();
  const [isFavorite, setIsFavorite] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const hasSyncedRef = useRef(false);

  // Check if favorite on mount
  useEffect(() => {
    const checkFavorite = async () => {
      // First check localStorage
      const localFavorites = getLocalFavorites();
      const isLocalFavorite = localFavorites.some((f) => f.orgNumber === orgNr);
      setIsFavorite(isLocalFavorite);

      // Then sync with database if logged in
      if (status === "authenticated" && session?.user && !hasSyncedRef.current) {
        try {
          const res = await fetch("/api/bolag/favorites");
          if (res.ok) {
            const data = await res.json();
            const dbFavorites: Favorite[] = data.favorites || [];
            const isDbFavorite = dbFavorites.some((f) => f.orgNumber === orgNr);
            setIsFavorite(isDbFavorite);

            // Sync localStorage with database
            saveLocalFavorites(dbFavorites);
            hasSyncedRef.current = true;
          }
        } catch {
          // Use localStorage value
        }
      }
    };

    checkFavorite();
  }, [orgNr, session?.user, status]);

  const toggleFavorite = async () => {
    if (isLoading) return;

    const newIsFavorite = !isFavorite;

    // Optimistic update
    setIsFavorite(newIsFavorite);
    setIsLoading(true);

    // Update localStorage
    const localFavorites = getLocalFavorites();
    if (newIsFavorite) {
      const updated = [...localFavorites, { orgNumber: orgNr, name: companyName }];
      saveLocalFavorites(updated);
    } else {
      const updated = localFavorites.filter((f) => f.orgNumber !== orgNr);
      saveLocalFavorites(updated);
    }

    // Update database if logged in
    if (session?.user) {
      try {
        if (newIsFavorite) {
          await fetch("/api/bolag/favorites", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ orgNumber: orgNr, name: companyName }),
          });
        } else {
          await fetch(`/api/bolag/favorites?orgNumber=${orgNr}`, {
            method: "DELETE",
          });
        }
      } catch {
        // Revert on error
        setIsFavorite(!newIsFavorite);
        const revertedFavorites = getLocalFavorites();
        if (!newIsFavorite) {
          saveLocalFavorites([...revertedFavorites, { orgNumber: orgNr, name: companyName }]);
        } else {
          saveLocalFavorites(revertedFavorites.filter((f) => f.orgNumber !== orgNr));
        }
      }
    }

    setIsLoading(false);
  };

  return (
    <Button
      variant={isFavorite ? "default" : "outline"}
      size="sm"
      onClick={toggleFavorite}
      disabled={isLoading}
    >
      {isFavorite ? "Bevakad" : "Bevaka"}
    </Button>
  );
}

// Helper functions for localStorage (fallback)
function getLocalFavorites(): Favorite[] {
  if (typeof window === "undefined") return [];

  try {
    const stored = localStorage.getItem(FAVORITES_KEY);
    if (!stored) return [];

    // Handle both old format (orgNr) and new format (orgNumber)
    const parsed = JSON.parse(stored);
    return parsed.map((f: { orgNr?: string; orgNumber?: string; name: string }) => ({
      orgNumber: f.orgNumber || f.orgNr || "",
      name: f.name,
    }));
  } catch {
    return [];
  }
}

function saveLocalFavorites(favorites: Favorite[]) {
  if (typeof window === "undefined") return;

  try {
    localStorage.setItem(FAVORITES_KEY, JSON.stringify(favorites));
  } catch {
    // Ignore storage errors
  }
}

// Export for use by FavoritesList
export async function getFavorites(): Promise<Favorite[]> {
  // Try to fetch from API first
  try {
    const res = await fetch("/api/bolag/favorites");
    if (res.ok) {
      const data = await res.json();
      if (data.favorites && data.favorites.length > 0) {
        return data.favorites;
      }
    }
  } catch {
    // Fall back to localStorage
  }

  return getLocalFavorites();
}

export { getLocalFavorites };
