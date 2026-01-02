"use client";

import { useState } from "react";
import { X, Settings, Trash2, Eye, EyeOff, GripVertical } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import type { FeedConfig } from "@/lib/nyheter/types";

interface SourceManagerProps {
  isOpen: boolean;
  onClose: () => void;
  sources: FeedConfig[];
  onRemove: (id: string) => void;
  onToggle: (id: string, enabled: boolean) => void;
}

export function SourceManager({ isOpen, onClose, sources, onRemove, onToggle }: SourceManagerProps) {
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

  const handleRemove = (id: string) => {
    if (confirmDelete === id) {
      onRemove(id);
      setConfirmDelete(null);
    } else {
      setConfirmDelete(id);
    }
  };

  const getSourceIcon = (type: string) => {
    switch (type) {
      case "twitter": return "𝕏";
      case "linkedin": return "in";
      case "instagram": return "📷";
      case "telegram": return "✈️";
      case "youtube": return "▶️";
      case "reddit": return "🔴";
      case "github": return "⚫";
      case "rss": return "📡";
      default: return "📰";
    }
  };

  if (!isOpen) return null;

  const enabledSources = sources.filter(s => s.enabled);
  const disabledSources = sources.filter(s => !s.enabled);

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 animate-fade-in">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
        <CardHeader className="flex-shrink-0 border-b">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-xl flex items-center gap-2">
                <Settings className="w-5 h-5" />
                Hantera källor
              </CardTitle>
              <CardDescription>
                {sources.length} källor totalt • {enabledSources.length} aktiva
              </CardDescription>
            </div>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="w-4 h-4" />
            </Button>
          </div>
        </CardHeader>

        <CardContent className="flex-1 overflow-y-auto py-4">
          {sources.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <p>Inga källor tillagda ännu</p>
              <p className="text-sm mt-2">Lägg till din första källa för att börja</p>
            </div>
          ) : (
            <div className="space-y-2">
              {/* Active sources */}
              {enabledSources.length > 0 && (
                <div className="mb-4">
                  <h3 className="text-sm font-medium text-muted-foreground mb-2 flex items-center gap-2">
                    <Eye className="w-4 h-4" />
                    Aktiva källor ({enabledSources.length})
                  </h3>
                  <div className="space-y-2">
                    {enabledSources.map((source) => (
                      <SourceItem
                        key={source.id}
                        source={source}
                        confirmDelete={confirmDelete}
                        onToggle={onToggle}
                        onRemove={handleRemove}
                        getSourceIcon={getSourceIcon}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Disabled sources */}
              {disabledSources.length > 0 && (
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground mb-2 flex items-center gap-2">
                    <EyeOff className="w-4 h-4" />
                    Pausade källor ({disabledSources.length})
                  </h3>
                  <div className="space-y-2 opacity-60">
                    {disabledSources.map((source) => (
                      <SourceItem
                        key={source.id}
                        source={source}
                        confirmDelete={confirmDelete}
                        onToggle={onToggle}
                        onRemove={handleRemove}
                        getSourceIcon={getSourceIcon}
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

interface SourceItemProps {
  source: FeedConfig;
  confirmDelete: string | null;
  onToggle: (id: string, enabled: boolean) => void;
  onRemove: (id: string) => void;
  getSourceIcon: (type: string) => string;
}

function SourceItem({ source, confirmDelete, onToggle, onRemove, getSourceIcon }: SourceItemProps) {
  return (
    <div
      className="flex items-center gap-3 p-3 rounded-lg border bg-card hover:border-border dark:hover:border-gray-600 transition-colors"
    >
      <div className="flex items-center gap-3 flex-1 min-w-0">
        <div
          className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0"
          style={{ backgroundColor: source.color }}
        >
          {getSourceIcon(source.type)}
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-medium text-sm truncate">{source.name}</p>
          <p className="text-xs text-muted-foreground truncate">{source.type}</p>
        </div>
      </div>

      <div className="flex items-center gap-2 flex-shrink-0">
        <Switch
          checked={source.enabled}
          onCheckedChange={(checked) => onToggle(source.id, checked)}
        />
        <Button
          variant={confirmDelete === source.id ? "destructive" : "ghost"}
          size="sm"
          onClick={() => onRemove(source.id)}
          className="px-2"
        >
          <Trash2 className="w-4 h-4" />
          {confirmDelete === source.id && <span className="ml-1 text-xs">Bekräfta</span>}
        </Button>
      </div>
    </div>
  );
}
