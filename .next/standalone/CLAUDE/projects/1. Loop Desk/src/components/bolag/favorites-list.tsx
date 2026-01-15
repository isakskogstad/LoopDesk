"use client";

import { useState, useEffect, useRef } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { type Favorite, getLocalFavorites } from "./favorite-button";

const FAVORITES_KEY = "bolagsinfo_favorites";

export function FavoritesList() {
  const { data: session, status } = useSession();
  const [favorites, setFavorites] = useState<Favorite[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const hasSyncedRef = useRef(false);

  useEffect(() => {
    const loadFavorites = async () => {
      // First load from localStorage
      const localFavorites = getLocalFavorites();
      setFavorites(localFavorites);

      // Then try to fetch from database if logged in
      if (status === "authenticated" && session?.user && !hasSyncedRef.current) {
        try {
          const res = await fetch("/api/bolag/favorites");
          if (res.ok) {
            const data = await res.json();
            if (data.favorites) {
              setFavorites(data.favorites);
              // Sync localStorage with database
              saveLocalFavorites(data.favorites);
              hasSyncedRef.current = true;
            }
          }
        } catch {
          // Use localStorage value
        }
      }

      setIsLoaded(true);
    };

    loadFavorites();
  }, [session?.user, status]);

  // Sync localStorage to database on first login
  useEffect(() => {
    const syncToDatabase = async () => {
      if (status !== "authenticated" || !session?.user || hasSyncedRef.current) return;

      const localFavorites = getLocalFavorites();
      if (localFavorites.length === 0) return;

      // Check if database already has favorites
      try {
        const res = await fetch("/api/bolag/favorites");
        if (res.ok) {
          const data = await res.json();
          if (data.favorites && data.favorites.length > 0) {
            // Database already has favorites, use those
            return;
          }
        }

        // Sync localStorage favorites to database
        for (const fav of localFavorites) {
          await fetch("/api/bolag/favorites", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ orgNumber: fav.orgNumber, name: fav.name }),
          });
        }
      } catch {
        // Ignore sync errors
      }
    };

    syncToDatabase();
  }, [session?.user, status]);

  if (!isLoaded || favorites.length === 0) {
    return null;
  }

  const formatOrgNr = (orgNr: string) => {
    const clean = orgNr.replace(/\D/g, "");
    if (clean.length === 10) {
      return `${clean.slice(0, 6)}-${clean.slice(6)}`;
    }
    return orgNr;
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg">Bevakade bolag</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {favorites.map((fav) => (
            <Link
              key={fav.orgNumber}
              href={`/bolag/${fav.orgNumber}`}
              className="block p-2 rounded hover:bg-secondary dark:hover:bg-gray-800 transition-colors"
            >
              <p className="font-medium text-sm">{fav.name}</p>
              <p className="text-xs text-muted-foreground">{formatOrgNr(fav.orgNumber)}</p>
            </Link>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

function saveLocalFavorites(favorites: Favorite[]) {
  if (typeof window === "undefined") return;

  try {
    localStorage.setItem(FAVORITES_KEY, JSON.stringify(favorites));
  } catch {
    // Ignore storage errors
  }
}
