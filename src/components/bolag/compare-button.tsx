"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

interface CompareItem {
  orgNr: string;
  name: string;
}

const STORAGE_KEY = "bolagsinfo-compare";
const MAX_COMPARE = 3;

export function useCompare() {
  const [compareList, setCompareList] = useState<CompareItem[]>([]);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        setCompareList(JSON.parse(stored));
      } catch {
        localStorage.removeItem(STORAGE_KEY);
      }
    }
  }, []);

  const addToCompare = (orgNr: string, name: string) => {
    if (compareList.length >= MAX_COMPARE) return false;
    if (compareList.some((item) => item.orgNr === orgNr)) return false;

    const updated = [...compareList, { orgNr, name }];
    setCompareList(updated);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    return true;
  };

  const removeFromCompare = (orgNr: string) => {
    const updated = compareList.filter((item) => item.orgNr !== orgNr);
    setCompareList(updated);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  };

  const clearCompare = () => {
    setCompareList([]);
    localStorage.removeItem(STORAGE_KEY);
  };

  const isInCompare = (orgNr: string) => compareList.some((item) => item.orgNr === orgNr);

  return { compareList, addToCompare, removeFromCompare, clearCompare, isInCompare };
}

interface CompareButtonProps {
  orgNr: string;
  companyName: string;
}

export function CompareButton({ orgNr, companyName }: CompareButtonProps) {
  const { compareList, addToCompare, removeFromCompare, isInCompare } = useCompare();
  const inCompare = isInCompare(orgNr);
  const canAdd = compareList.length < MAX_COMPARE;

  const handleClick = () => {
    if (inCompare) {
      removeFromCompare(orgNr);
    } else if (canAdd) {
      addToCompare(orgNr, companyName);
    }
  };

  return (
    <Button
      variant={inCompare ? "default" : "outline"}
      size="sm"
      onClick={handleClick}
      disabled={!inCompare && !canAdd}
      title={inCompare ? "Ta bort från jämförelse" : canAdd ? "Lägg till i jämförelse" : "Max 3 företag"}
    >
      {inCompare ? "I jämförelse" : "Jämför"}
    </Button>
  );
}

export function CompareBar() {
  const router = useRouter();
  const { compareList, removeFromCompare, clearCompare } = useCompare();

  if (compareList.length === 0) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-900 border-t shadow-lg p-4 z-50">
      <div className="container mx-auto max-w-5xl flex items-center justify-between">
        <div className="flex items-center gap-4">
          <span className="text-sm text-gray-500">Jämför:</span>
          <div className="flex gap-2">
            {compareList.map((item) => (
              <div
                key={item.orgNr}
                className="inline-flex items-center gap-1 px-3 py-1 bg-gray-100 dark:bg-gray-800 rounded-full text-sm"
              >
                <span className="truncate max-w-[120px]">{item.name}</span>
                <button
                  onClick={() => removeFromCompare(item.orgNr)}
                  className="ml-1 text-gray-400 hover:text-gray-600"
                >
                  x
                </button>
              </div>
            ))}
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="ghost" size="sm" onClick={clearCompare}>
            Rensa
          </Button>
          <Button
            size="sm"
            onClick={() => router.push(`/compare?companies=${compareList.map((c) => c.orgNr).join(",")}`)}
            disabled={compareList.length < 2}
          >
            Jämför ({compareList.length})
          </Button>
        </div>
      </div>
    </div>
  );
}
