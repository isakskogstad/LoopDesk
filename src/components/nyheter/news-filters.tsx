"use client";

import { useState } from "react";
import { Search, X, Filter, RefreshCw, Bookmark, Eye, EyeOff, Building2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface Source {
  sourceId: string;
  sourceName: string;
  count: number;
  category?: string | null;
}

interface Company {
  id: string;
  name: string;
  orgNumber: string;
}

interface NewsFiltersProps {
  sources: Source[];
  companies?: Company[];
  selectedSource?: string;
  selectedCompany?: string;
  searchQuery?: string;
  showBookmarked?: boolean;
  showUnread?: boolean;
  onSearchChange: (query: string) => void;
  onSourceChange: (sourceId: string | undefined) => void;
  onCompanyChange?: (companyId: string | undefined) => void;
  onBookmarkedChange: (show: boolean) => void;
  onUnreadChange: (show: boolean) => void;
  onRefresh: () => void;
  isRefreshing?: boolean;
  stats?: {
    total: number;
    unread: number;
    bookmarked: number;
    today: number;
    sources: number;
  };
}

export function NewsFilters({
  sources,
  companies = [],
  selectedSource,
  selectedCompany,
  searchQuery = "",
  showBookmarked = false,
  showUnread = false,
  onSearchChange,
  onSourceChange,
  onCompanyChange,
  onBookmarkedChange,
  onUnreadChange,
  onRefresh,
  isRefreshing = false,
  stats,
}: NewsFiltersProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const hasActiveFilters = selectedSource || selectedCompany || showBookmarked || showUnread || searchQuery;

  const clearFilters = () => {
    onSearchChange("");
    onSourceChange(undefined);
    onCompanyChange?.(undefined);
    onBookmarkedChange(false);
    onUnreadChange(false);
  };

  // Group sources by category
  const groupedSources = sources.reduce(
    (acc, source) => {
      const category = source.category || "Övriga";
      if (!acc[category]) {
        acc[category] = [];
      }
      acc[category].push(source);
      return acc;
    },
    {} as Record<string, Source[]>
  );

  return (
    <div className="bg-card rounded-xl border border-border dark:border-gray-800 p-4 space-y-4">
      {/* Search and main actions */}
      <div className="flex items-center gap-3">
        {/* Search input */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Sök nyheter..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-10"
          />
          {searchQuery && (
            <button
              onClick={() => onSearchChange("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Filter toggle */}
        <Button
          variant={isExpanded ? "secondary" : "outline"}
          size="icon"
          onClick={() => setIsExpanded(!isExpanded)}
          className="relative"
        >
          <Filter className="w-4 h-4" />
          {hasActiveFilters && (
            <span className="absolute -top-1 -right-1 w-2 h-2 bg-blue-500 rounded-full" />
          )}
        </Button>

        {/* Refresh button */}
        <Button
          variant="outline"
          size="icon"
          onClick={onRefresh}
          disabled={isRefreshing}
        >
          <RefreshCw className={`w-4 h-4 ${isRefreshing ? "animate-spin" : ""}`} />
        </Button>
      </div>

      {/* Quick filters */}
      <div className="flex flex-wrap gap-2">
        <Button
          variant={showUnread ? "default" : "outline"}
          size="sm"
          onClick={() => onUnreadChange(!showUnread)}
          className="gap-1.5"
        >
          {showUnread ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
          Olästa
          {stats && (
            <Badge variant="secondary" className="ml-1 text-xs">
              {stats.unread}
            </Badge>
          )}
        </Button>

        <Button
          variant={showBookmarked ? "default" : "outline"}
          size="sm"
          onClick={() => onBookmarkedChange(!showBookmarked)}
          className="gap-1.5"
        >
          <Bookmark className="w-3.5 h-3.5" />
          Sparade
          {stats && (
            <Badge variant="secondary" className="ml-1 text-xs">
              {stats.bookmarked}
            </Badge>
          )}
        </Button>

        {/* Company filter */}
        {companies.length > 0 && onCompanyChange && (
          <Select
            value={selectedCompany || "all"}
            onValueChange={(value) => onCompanyChange(value === "all" ? undefined : value)}
          >
            <SelectTrigger className="w-[180px] h-8 text-sm">
              <Building2 className="w-3.5 h-3.5 mr-1.5" />
              <SelectValue placeholder="Alla bolag" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Alla bolag</SelectItem>
              {companies.map((company) => (
                <SelectItem key={company.id} value={company.id}>
                  {company.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}

        {hasActiveFilters && (
          <Button variant="ghost" size="sm" onClick={clearFilters} className="gap-1.5">
            <X className="w-3.5 h-3.5" />
            Rensa filter
          </Button>
        )}
      </div>

      {/* Expanded filters */}
      {isExpanded && (
        <div className="pt-4 border-t border-border dark:border-gray-800 space-y-4">
          {/* Stats */}
          {stats && (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="bg-secondary/50 rounded-lg p-3 text-center">
                <div className="text-2xl font-bold text-foreground">{stats.total}</div>
                <div className="text-xs text-muted-foreground">Totalt</div>
              </div>
              <div className="bg-secondary/50 rounded-lg p-3 text-center">
                <div className="text-2xl font-bold text-blue-600">{stats.today}</div>
                <div className="text-xs text-muted-foreground">Idag</div>
              </div>
              <div className="bg-secondary/50 rounded-lg p-3 text-center">
                <div className="text-2xl font-bold text-amber-600">{stats.unread}</div>
                <div className="text-xs text-muted-foreground">Olästa</div>
              </div>
              <div className="bg-secondary/50 rounded-lg p-3 text-center">
                <div className="text-2xl font-bold text-green-600">{stats.sources}</div>
                <div className="text-xs text-muted-foreground">Källor</div>
              </div>
            </div>
          )}

          {/* Source filter */}
          <div>
            <h4 className="text-sm font-medium text-foreground mb-2">Källor</h4>
            <div className="flex flex-wrap gap-1.5 max-h-48 overflow-y-auto">
              <Button
                variant={!selectedSource ? "default" : "outline"}
                size="sm"
                onClick={() => onSourceChange(undefined)}
              >
                Alla
              </Button>
              {Object.entries(groupedSources).map(([category, categorySources]) => (
                <div key={category} className="contents">
                  {categorySources.map((source) => (
                    <Button
                      key={source.sourceId}
                      variant={selectedSource === source.sourceId ? "default" : "outline"}
                      size="sm"
                      onClick={() => onSourceChange(source.sourceId)}
                      className="gap-1"
                    >
                      {source.sourceName}
                      <Badge variant="secondary" className="ml-1 text-xs">
                        {source.count}
                      </Badge>
                    </Button>
                  ))}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
