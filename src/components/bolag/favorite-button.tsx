"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";

interface FavoriteButtonProps {
  orgNr: string;
  companyName: string;
}

interface Favorite {
  orgNr: string;
  name: string;
  addedAt: string;
}

const FAVORITES_KEY = "bolagsinfo_favorites";

export function FavoriteButton({ orgNr, companyName }: FavoriteButtonProps) {
  const [isFavorite, setIsFavorite] = useState(false);

  useEffect(() => {
    const favorites = getFavorites();
    setIsFavorite(favorites.some((f) => f.orgNr === orgNr));
  }, [orgNr]);

  const toggleFavorite = () => {
    const favorites = getFavorites();

    if (isFavorite) {
      // Remove from favorites
      const updated = favorites.filter((f) => f.orgNr !== orgNr);
      saveFavorites(updated);
      setIsFavorite(false);
    } else {
      // Add to favorites
      const updated = [
        ...favorites,
        { orgNr, name: companyName, addedAt: new Date().toISOString() },
      ];
      saveFavorites(updated);
      setIsFavorite(true);
    }
  };

  return (
    <Button
      variant={isFavorite ? "default" : "outline"}
      size="sm"
      onClick={toggleFavorite}
    >
      {isFavorite ? "Bevakad" : "Bevaka"}
    </Button>
  );
}

export function getFavorites(): Favorite[] {
  if (typeof window === "undefined") return [];

  try {
    const stored = localStorage.getItem(FAVORITES_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

function saveFavorites(favorites: Favorite[]) {
  if (typeof window === "undefined") return;

  try {
    localStorage.setItem(FAVORITES_KEY, JSON.stringify(favorites));
  } catch {
    // Ignore storage errors
  }
}
