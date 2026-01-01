"use client";

import { useState } from "react";
import {
  ChevronDown,
  ChevronRight,
  Plus,
  Settings,
  Filter,
  Rss,
  Check,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";
import type { FeedConfig } from "@/lib/nyheter/types";
import { defaultTags } from "@/lib/nyheter/feeds";

interface FeedSidebarProps {
  sources: FeedConfig[];
  selectedCategories: string[];
  onToggleSource: (id: string, enabled: boolean) => void;
  onToggleCategory: (categoryId: string) => void;
  onAddSource: () => void;
  onManageSources: () => void;
}

export function FeedSidebar({
  sources,
  selectedCategories,
  onToggleSource,
  onToggleCategory,
  onAddSource,
  onManageSources,
}: FeedSidebarProps) {
  const [isSourcesOpen, setIsSourcesOpen] = useState(false);
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);

  const enabledCount = sources.filter((s) => s.enabled).length;
  const totalCount = sources.length;

  // Get unique categories from sources
  const categories = defaultTags.filter(tag =>
    sources.some(s => s.tags?.includes(tag.id))
  );

  const getSourceIcon = (type: string) => {
    switch (type) {
      case "twitter": return "X";
      case "linkedin": return "in";
      case "instagram": return "IG";
      case "telegram": return "TG";
      case "youtube": return "YT";
      case "reddit": return "r/";
      case "github": return "GH";
      case "facebook": return "fb";
      case "rss":
      default: return "RSS";
    }
  };

  return (
    <aside className="w-72 flex-shrink-0 space-y-2">
      {/* Add Source Button */}
      <Button
        onClick={onAddSource}
        className="w-full justify-start gap-2"
        variant="default"
      >
        <Plus className="w-4 h-4" />
        Lagg till kalla
      </Button>

      {/* Sources Section */}
      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg overflow-hidden">
        <button
          onClick={() => setIsSourcesOpen(!isSourcesOpen)}
          className="w-full px-4 py-3 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
        >
          <div className="flex items-center gap-2">
            <Rss className="w-4 h-4 text-gray-500" />
            <span className="font-medium text-sm">
              Källor
            </span>
            <span className="text-xs text-gray-500">
              {enabledCount}/{totalCount}
            </span>
          </div>
          {isSourcesOpen ? (
            <ChevronDown className="w-4 h-4 text-gray-400" />
          ) : (
            <ChevronRight className="w-4 h-4 text-gray-400" />
          )}
        </button>

        {isSourcesOpen && (
          <div className="border-t border-gray-200 dark:border-gray-800">
            <div className="max-h-80 overflow-y-auto">
              {sources.map((source) => (
                <div
                  key={source.id}
                  className="flex items-center gap-3 px-4 py-2 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                >
                  <div
                    className="w-6 h-6 rounded flex items-center justify-center text-white text-[10px] font-bold flex-shrink-0"
                    style={{ backgroundColor: source.color }}
                  >
                    {getSourceIcon(source.type)}
                  </div>
                  <span className={cn(
                    "flex-1 text-sm truncate",
                    !source.enabled && "text-gray-400"
                  )}>
                    {source.name}
                  </span>
                  <Switch
                    checked={source.enabled}
                    onCheckedChange={(checked) => onToggleSource(source.id, checked)}
                    className="scale-75"
                  />
                </div>
              ))}
            </div>
            <div className="border-t border-gray-200 dark:border-gray-800 p-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={onManageSources}
                className="w-full justify-start gap-2 text-xs"
              >
                <Settings className="w-3 h-3" />
                Hantera alla källor
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Filters Section */}
      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg overflow-hidden">
        <button
          onClick={() => setIsFiltersOpen(!isFiltersOpen)}
          className="w-full px-4 py-3 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
        >
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-gray-500" />
            <span className="font-medium text-sm">
              Filter
            </span>
            {selectedCategories.length > 0 && (
              <span className="text-xs bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300 px-1.5 py-0.5 rounded">
                {selectedCategories.length}
              </span>
            )}
          </div>
          {isFiltersOpen ? (
            <ChevronDown className="w-4 h-4 text-gray-400" />
          ) : (
            <ChevronRight className="w-4 h-4 text-gray-400" />
          )}
        </button>

        {isFiltersOpen && (
          <div className="border-t border-gray-200 dark:border-gray-800">
            <div className="p-2 space-y-1">
              {categories.map((category) => {
                const isSelected = selectedCategories.includes(category.id);
                return (
                  <button
                    key={category.id}
                    onClick={() => onToggleCategory(category.id)}
                    className={cn(
                      "w-full flex items-center gap-2 px-3 py-2 rounded text-sm transition-colors",
                      isSelected
                        ? "bg-gray-100 dark:bg-gray-800"
                        : "hover:bg-gray-50 dark:hover:bg-gray-800/50"
                    )}
                  >
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: category.color }}
                    />
                    <span className="flex-1 text-left">{category.name}</span>
                    {isSelected && (
                      <Check className="w-4 h-4 text-blue-500" />
                    )}
                  </button>
                );
              })}
            </div>
            {selectedCategories.length > 0 && (
              <div className="border-t border-gray-200 dark:border-gray-800 p-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => selectedCategories.forEach(c => onToggleCategory(c))}
                  className="w-full justify-start gap-2 text-xs text-gray-500"
                >
                  <X className="w-3 h-3" />
                  Rensa filter
                </Button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Quick Stats */}
      <div className="px-4 py-3 bg-gray-50 dark:bg-gray-900/50 rounded-lg text-xs text-gray-500 space-y-1">
        <div className="flex justify-between">
          <span>Aktiva källor</span>
          <span className="font-medium text-gray-700 dark:text-gray-300">{enabledCount}</span>
        </div>
        <div className="flex justify-between">
          <span>Totalt</span>
          <span className="font-medium text-gray-700 dark:text-gray-300">{totalCount}</span>
        </div>
      </div>
    </aside>
  );
}
