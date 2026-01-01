"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getFavorites } from "./favorite-button";

interface Favorite {
  orgNr: string;
  name: string;
  addedAt: string;
}

export function FavoritesList() {
  const [favorites, setFavorites] = useState<Favorite[]>([]);

  useEffect(() => {
    setFavorites(getFavorites());
  }, []);

  if (favorites.length === 0) {
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
              key={fav.orgNr}
              href={`/bolag/${fav.orgNr}`}
              className="block p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            >
              <p className="font-medium text-sm">{fav.name}</p>
              <p className="text-xs text-gray-500">{formatOrgNr(fav.orgNr)}</p>
            </Link>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
