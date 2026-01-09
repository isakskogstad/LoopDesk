"use client";

import { useState, useEffect } from "react";
import {
  Rss,
  X,
  Plus,
  Trash2,
  RefreshCw,
  CheckCircle,
  AlertCircle,
  ChevronLeft,
  Settings,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface Source {
  id: string;
  name: string;
  url: string;
  type: string;
  category?: string | null;
  color?: string | null;
  count?: number;
  status?: "ok" | "error" | "loading";
}

interface RssToolDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  sources: Source[];
  onAddFeed: (url: string, name?: string, category?: string, color?: string) => Promise<{ success: boolean; error?: string }>;
  onRemoveFeed: (id: string) => Promise<boolean>;
  onRefresh: () => void;
  initialUrl?: string;
  onUrlProcessed?: () => void;
}

type View = "menu" | "sources" | "status";

const COLORS = [
  "#E31937", // Red
  "#003366", // Navy
  "#00A0DC", // Blue
  "#0066CC", // Link blue
  "#22c55e", // Green
  "#f59e0b", // Amber
];

const CATEGORIES = ["Affärer", "Tech", "Nyheter", "Sport", "Övrigt"];

export function RssToolDialog({
  open,
  onOpenChange,
  sources,
  onAddFeed,
  onRemoveFeed,
  onRefresh,
  initialUrl,
  onUrlProcessed,
}: RssToolDialogProps) {
  const [view, setView] = useState<View>("menu");
  const [isAddingSource, setIsAddingSource] = useState(false);
  const [newSourceName, setNewSourceName] = useState("");
  const [newSourceUrl, setNewSourceUrl] = useState(initialUrl || "");
  const [newSourceCategory, setNewSourceCategory] = useState("Affärer");
  const [newSourceColor, setNewSourceColor] = useState(COLORS[0]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [logs, setLogs] = useState<{ time: string; type: string; msg: string }[]>([]);
  const [testUrl, setTestUrl] = useState("");
  const [testResult, setTestResult] = useState<{ title: string; items: number } | null>(null);

  // Reset state when dialog closes
  useEffect(() => {
    if (!open) {
      setView("menu");
      setIsAddingSource(false);
      setError(null);
      setSuccess(null);
    }
  }, [open]);

  // Auto-open sources view with URL pre-filled when initialUrl is provided
  useEffect(() => {
    if (open && initialUrl) {
      setView("sources");
      setIsAddingSource(true);
      setNewSourceUrl(initialUrl);
    }
  }, [open, initialUrl]);

  const addLog = (type: string, msg: string) => {
    const time = new Date().toLocaleTimeString("sv-SE", { hour: "2-digit", minute: "2-digit", second: "2-digit" });
    setLogs((prev) => [...prev.slice(-50), { time, type, msg }]);
  };

  const handleAddSource = async () => {
    if (!newSourceUrl.trim()) {
      setError("Ange en URL");
      return;
    }

    setIsLoading(true);
    setError(null);
    addLog("info", `Lägger till ${newSourceUrl}...`);

    try {
      const result = await onAddFeed(newSourceUrl.trim(), newSourceName.trim() || undefined, newSourceCategory, newSourceColor);
      if (result.success) {
        setSuccess("Källa tillagd!");
        addLog("success", `${newSourceName || newSourceUrl} tillagd`);
        setNewSourceName("");
        setNewSourceUrl("");
        setIsAddingSource(false);
        onUrlProcessed?.(); // Clear URL from browser address bar
        setTimeout(() => setSuccess(null), 2000);
      } else {
        setError(result.error || "Kunde inte lägga till källa");
        addLog("error", result.error || "Misslyckades");
      }
    } catch {
      setError("Något gick fel");
      addLog("error", "Nätverksfel");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteSource = async (id: string, name: string) => {
    addLog("info", `Tar bort ${name}...`);
    const success = await onRemoveFeed(id);
    if (success) {
      addLog("success", `${name} borttagen`);
    } else {
      addLog("error", `Kunde inte ta bort ${name}`);
    }
  };

  const handleTestFeed = async () => {
    if (!testUrl.trim()) return;

    setIsLoading(true);
    setTestResult(null);
    addLog("info", `Testar ${testUrl}...`);

    try {
      const response = await fetch("/api/feeds/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: testUrl }),
      });
      const data = await response.json();

      if (data.valid) {
        setTestResult({ title: data.feed?.title || "Okänt", items: data.feed?.itemCount || 0 });
        addLog("success", `OK: ${data.feed?.title} (${data.feed?.itemCount} artiklar)`);
      } else {
        setError(data.error || "Ogiltigt flöde");
        addLog("error", data.error || "Ogiltigt flöde");
      }
    } catch {
      setError("Kunde inte testa flödet");
      addLog("error", "Nätverksfel");
    } finally {
      setIsLoading(false);
    }
  };

  const handleRefreshAll = () => {
    addLog("info", "Uppdaterar alla flöden...");
    onRefresh();
    addLog("success", "Uppdatering startad");
  };

  // Menu view
  const renderMenu = () => (
    <div className="space-y-2">
      <button
        onClick={() => setView("sources")}
        className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors group"
      >
        <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center group-hover:bg-primary/10">
          <Rss className="w-5 h-5 text-muted-foreground group-hover:text-primary" />
        </div>
        <div className="flex-1 text-left">
          <div className="font-medium">Källor</div>
          <div className="text-xs text-muted-foreground">Hantera RSS-flöden</div>
        </div>
        <ChevronLeft className="w-4 h-4 rotate-180 text-muted-foreground opacity-0 group-hover:opacity-100" />
      </button>

      <button
        onClick={() => setView("status")}
        className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors group"
      >
        <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center group-hover:bg-primary/10">
          <Settings className="w-5 h-5 text-muted-foreground group-hover:text-primary" />
        </div>
        <div className="flex-1 text-left">
          <div className="font-medium">Status</div>
          <div className="text-xs text-muted-foreground">Felsökning och tester</div>
        </div>
        <ChevronLeft className="w-4 h-4 rotate-180 text-muted-foreground opacity-0 group-hover:opacity-100" />
      </button>
    </div>
  );

  // Sources view
  const renderSources = () => (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <span className="text-xs text-muted-foreground uppercase tracking-wide">Aktiva källor</span>
        <Button size="sm" onClick={() => setIsAddingSource(!isAddingSource)}>
          <Plus className="w-4 h-4 mr-1" />
          Lägg till
        </Button>
      </div>

      {isAddingSource && (
        <div className="p-4 rounded-lg bg-muted/30 space-y-3">
          <div>
            <label className="text-xs text-muted-foreground uppercase tracking-wide">Namn</label>
            <Input
              value={newSourceName}
              onChange={(e) => setNewSourceName(e.target.value)}
              placeholder="T.ex. Dagens Industri"
              className="mt-1"
            />
          </div>
          <div>
            <label className="text-xs text-muted-foreground uppercase tracking-wide">RSS URL</label>
            <Input
              value={newSourceUrl}
              onChange={(e) => setNewSourceUrl(e.target.value)}
              placeholder="https://example.com/rss"
              className="mt-1 font-mono text-sm"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-muted-foreground uppercase tracking-wide">Kategori</label>
              <select
                value={newSourceCategory}
                onChange={(e) => setNewSourceCategory(e.target.value)}
                className="mt-1 w-full px-3 py-2 rounded-md bg-background border text-sm"
              >
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs text-muted-foreground uppercase tracking-wide">Färg</label>
              <div className="mt-1 flex gap-1.5">
                {COLORS.map((c) => (
                  <button
                    key={c}
                    onClick={() => setNewSourceColor(c)}
                    className={`w-6 h-6 rounded transition-transform hover:scale-110 ${newSourceColor === c ? "ring-2 ring-white ring-offset-2 ring-offset-background" : ""}`}
                    style={{ background: c }}
                  />
                ))}
              </div>
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="ghost" size="sm" onClick={() => setIsAddingSource(false)}>
              Avbryt
            </Button>
            <Button size="sm" onClick={handleAddSource} disabled={isLoading}>
              {isLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : "Lägg till"}
            </Button>
          </div>
        </div>
      )}

      <div className="rounded-lg bg-muted/30 divide-y divide-border overflow-hidden max-h-[350px] overflow-y-auto">
        {sources.length === 0 ? (
          <div className="p-8 text-center text-muted-foreground">
            <Rss className="w-8 h-8 mx-auto mb-2 opacity-30" />
            <p className="text-sm">Inga källor tillagda</p>
          </div>
        ) : (
          sources.map((source) => (
            <div key={source.id} className="flex items-center gap-3 p-3 hover:bg-muted/50 group">
              <div className="w-1 h-8 rounded-full" style={{ background: source.color || "#666" }} />
              <div className="w-8 h-8 rounded-md bg-muted flex items-center justify-center">
                <Rss className="w-4 h-4 text-muted-foreground" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-medium text-sm truncate">{source.name}</div>
                <div className="text-xs text-muted-foreground font-mono truncate">{source.url}</div>
              </div>
              {source.category && (
                <span className="text-xs px-2 py-0.5 rounded bg-primary/10 text-primary">
                  {source.category}
                </span>
              )}
              {source.count !== undefined && (
                <span className="text-xs text-muted-foreground">{source.count}</span>
              )}
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                onClick={() => handleDeleteSource(source.id, source.name)}
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          ))
        )}
      </div>
    </div>
  );

  // Status view
  const renderStatus = () => (
    <div className="space-y-5">
      {/* System Status Section */}
      <div>
        <div className="text-xs text-muted-foreground uppercase tracking-wide mb-3">Systemstatus</div>
        <div className="grid grid-cols-2 gap-3">
          <div className="p-4 rounded-lg bg-muted/30 text-center">
            <div className="w-3 h-3 rounded-full bg-green-500 mx-auto mb-2" />
            <div className="text-xs text-muted-foreground">Feed-hantering</div>
            <div className="text-sm font-medium text-green-500">Aktiv</div>
          </div>
          <div className="p-4 rounded-lg bg-muted/30 text-center">
            <div className="text-2xl font-bold text-primary mb-1">{sources.length}</div>
            <div className="text-xs text-muted-foreground">Aktiva källor</div>
          </div>
        </div>
      </div>

      {/* Test Feed Section */}
      <div>
        <div className="text-xs text-muted-foreground uppercase tracking-wide mb-3">Testa RSS-flöde</div>
        <div className="p-4 rounded-lg bg-muted/30 space-y-3">
          <div className="flex gap-2">
            <Input
              value={testUrl}
              onChange={(e) => setTestUrl(e.target.value)}
              placeholder="Klistra in RSS/Atom-URL här..."
              className="font-mono text-sm flex-1"
            />
            <Button onClick={handleTestFeed} disabled={isLoading || !testUrl.trim()}>
              {isLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : "Testa"}
            </Button>
          </div>
          {testResult && (
            <div className="p-3 rounded-md bg-green-500/10 border border-green-500/20">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-500" />
                <span className="font-medium text-sm">{testResult.title}</span>
              </div>
              <div className="text-xs text-muted-foreground mt-1 ml-6">{testResult.items} artiklar hittades</div>
            </div>
          )}
        </div>
      </div>

      {/* Actions Section */}
      <div>
        <div className="text-xs text-muted-foreground uppercase tracking-wide mb-3">Åtgärder</div>
        <Button onClick={handleRefreshAll} variant="outline" className="w-full h-auto py-3 flex-col gap-1">
          <RefreshCw className="w-5 h-5" />
          <span className="text-xs">Uppdatera alla flöden</span>
        </Button>
      </div>

      {/* Activity Log Section */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs text-muted-foreground uppercase tracking-wide">Aktivitetslogg</span>
          <button onClick={() => setLogs([])} className="text-xs text-muted-foreground hover:text-foreground transition-colors">
            Rensa
          </button>
        </div>
        <div className="rounded-lg bg-muted/30 overflow-hidden">
          <div className="p-3 min-h-[120px] max-h-[200px] overflow-y-auto font-mono text-xs space-y-1.5">
            {logs.length === 0 ? (
              <div className="text-muted-foreground text-center py-8">
                <Settings className="w-6 h-6 mx-auto mb-2 opacity-30" />
                <p>Ingen aktivitet ännu</p>
                <p className="text-[10px] mt-1">Aktivitet visas här när du testar eller uppdaterar flöden</p>
              </div>
            ) : (
              logs.map((log, i) => (
                <div key={i} className="flex gap-3 py-1 border-b border-border/50 last:border-0">
                  <span className="text-muted-foreground w-16 flex-shrink-0">{log.time}</span>
                  <span className={`flex-1 ${log.type === "success" ? "text-green-500" : log.type === "error" ? "text-red-500" : log.type === "warning" ? "text-yellow-500" : "text-foreground"}`}>
                    {log.msg}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[85vh] overflow-hidden flex flex-col">
        <DialogHeader className="flex flex-row items-center gap-3 flex-shrink-0">
          {view !== "menu" && (
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setView("menu")}>
              <ChevronLeft className="w-4 h-4" />
            </Button>
          )}
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded bg-primary/10 flex items-center justify-center">
              <Rss className="w-3 h-3 text-primary" />
            </div>
            <DialogTitle>
              {view === "menu" && "RSS"}
              {view === "sources" && "Källor"}
              {view === "status" && "Status & Felsökning"}
            </DialogTitle>
          </div>
        </DialogHeader>

        {error && (
          <div className="flex items-center gap-2 p-3 rounded-lg bg-destructive/10 text-destructive text-sm">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            {error}
            <button onClick={() => setError(null)} className="ml-auto">
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {success && (
          <div className="flex items-center gap-2 p-3 rounded-lg bg-green-500/10 text-green-500 text-sm">
            <CheckCircle className="w-4 h-4 flex-shrink-0" />
            {success}
          </div>
        )}

        <div className="py-2 flex-1 overflow-y-auto min-h-0">
          {view === "menu" && renderMenu()}
          {view === "sources" && renderSources()}
          {view === "status" && renderStatus()}
        </div>
      </DialogContent>
    </Dialog>
  );
}
