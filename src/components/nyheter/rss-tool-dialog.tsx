"use client";

import { useState, useEffect } from "react";
import {
  Rss,
  X,
  Plus,
  Trash2,
  RefreshCw,
  Link,
  CheckCircle,
  AlertCircle,
  ChevronLeft,
  Settings,
  ExternalLink,
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
}

type View = "menu" | "sources" | "rsshub" | "status";

const COLORS = [
  "#E31937", // Red
  "#003366", // Navy
  "#00A0DC", // Blue
  "#0066CC", // Link blue
  "#22c55e", // Green
  "#f59e0b", // Amber
];

const CATEGORIES = ["Affärer", "Tech", "Nyheter", "Sport", "Övrigt"];

const RSSHUB_TEMPLATES = [
  { id: "twitter", name: "X / Twitter", icon: "X", color: "#000", labelKey: "Användarnamn", placeholder: "@elonmusk", route: "/twitter/user/" },
  { id: "linkedin", name: "LinkedIn", icon: "in", color: "#0A66C2", labelKey: "Företags-ID", placeholder: "microsoft", route: "/linkedin/company/" },
  { id: "youtube", name: "YouTube", icon: "YT", color: "#FF0000", labelKey: "Kanal-ID", placeholder: "UCxxx...", route: "/youtube/channel/" },
  { id: "github", name: "GitHub", icon: "GH", color: "#333", labelKey: "Repo (user/repo)", placeholder: "vercel/next.js", route: "/github/repos/" },
];

export function RssToolDialog({
  open,
  onOpenChange,
  sources,
  onAddFeed,
  onRemoveFeed,
  onRefresh,
}: RssToolDialogProps) {
  const [view, setView] = useState<View>("menu");
  const [isAddingSource, setIsAddingSource] = useState(false);
  const [newSourceName, setNewSourceName] = useState("");
  const [newSourceUrl, setNewSourceUrl] = useState("");
  const [newSourceCategory, setNewSourceCategory] = useState("Affärer");
  const [newSourceColor, setNewSourceColor] = useState(COLORS[0]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [logs, setLogs] = useState<{ time: string; type: string; msg: string }[]>([]);
  const [testUrl, setTestUrl] = useState("");
  const [testResult, setTestResult] = useState<{ title: string; items: number } | null>(null);
  const [rsshubTemplate, setRsshubTemplate] = useState<typeof RSSHUB_TEMPLATES[0] | null>(null);
  const [rsshubInput, setRsshubInput] = useState("");
  const [rsshubStatus, setRsshubStatus] = useState<"unknown" | "online" | "offline">("unknown");

  // Reset state when dialog closes
  useEffect(() => {
    if (!open) {
      setView("menu");
      setIsAddingSource(false);
      setError(null);
      setSuccess(null);
    }
  }, [open]);

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

  const handleCheckRsshub = async () => {
    addLog("info", "Testar RSSHub...");
    try {
      const response = await fetch("/api/health");
      const data = await response.json();
      if (data.rsshub?.available) {
        setRsshubStatus("online");
        addLog("success", "RSSHub: OK");
      } else {
        setRsshubStatus("offline");
        addLog("error", "RSSHub: Ej tillgänglig");
      }
    } catch {
      setRsshubStatus("offline");
      addLog("error", "RSSHub: Fel");
    }
  };

  const handleAddRsshubSource = async () => {
    if (!rsshubTemplate || !rsshubInput.trim()) return;

    const input = rsshubInput.trim().replace("@", "");
    const rsshubUrl = process.env.NEXT_PUBLIC_RSSHUB_URL || "https://rsshub.rssforever.com";
    const url = `${rsshubUrl}${rsshubTemplate.route}${input}`;
    const name = `${rsshubTemplate.name}: ${input}`;

    setIsLoading(true);
    addLog("info", `Lägger till ${name}...`);

    try {
      const result = await onAddFeed(url, name, "Social", rsshubTemplate.color);
      if (result.success) {
        setSuccess("RSSHub-källa tillagd!");
        addLog("success", `${name} tillagd via RSSHub`);
        setRsshubTemplate(null);
        setRsshubInput("");
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
        onClick={() => setView("rsshub")}
        className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors group"
      >
        <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center group-hover:bg-primary/10">
          <Link className="w-5 h-5 text-muted-foreground group-hover:text-primary" />
        </div>
        <div className="flex-1 text-left">
          <div className="font-medium">RSSHub</div>
          <div className="text-xs text-muted-foreground">Twitter, LinkedIn, YouTube m.fl.</div>
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

      <div className="rounded-lg bg-muted/30 divide-y divide-border overflow-hidden max-h-[260px] overflow-y-auto">
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
              <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 text-destructive hover:text-destructive"
                  onClick={() => handleDeleteSource(source.id, source.name)}
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </Button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );

  // RSSHub view
  const renderRsshub = () => (
    <div className="space-y-4">
      <div className="p-4 rounded-lg bg-muted/30">
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm font-medium">RSSHub-instans</span>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <div className={`w-2 h-2 rounded-full ${rsshubStatus === "online" ? "bg-green-500" : rsshubStatus === "offline" ? "bg-red-500" : "bg-muted-foreground"}`} />
            <span>rsshub.rssforever.com</span>
          </div>
        </div>

        {rsshubTemplate ? (
          <div className="space-y-3">
            <div>
              <label className="text-xs text-muted-foreground uppercase tracking-wide">
                {rsshubTemplate.labelKey}
              </label>
              <Input
                value={rsshubInput}
                onChange={(e) => setRsshubInput(e.target.value)}
                placeholder={rsshubTemplate.placeholder}
                className="mt-1"
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="ghost" size="sm" onClick={() => setRsshubTemplate(null)}>
                Avbryt
              </Button>
              <Button size="sm" onClick={handleAddRsshubSource} disabled={isLoading || !rsshubInput.trim()}>
                {isLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : "Lägg till"}
              </Button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-2">
            {RSSHUB_TEMPLATES.map((template) => (
              <button
                key={template.id}
                onClick={() => setRsshubTemplate(template)}
                className="flex items-center gap-2 p-3 rounded-lg border border-border hover:border-primary hover:bg-primary/5 transition-colors"
              >
                <div
                  className="w-7 h-7 rounded flex items-center justify-center text-white text-xs font-bold"
                  style={{ background: template.color }}
                >
                  {template.icon}
                </div>
                <span className="text-sm font-medium">{template.name}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      <a
        href="https://docs.rsshub.app/routes"
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground transition-colors"
      >
        <ExternalLink className="w-3.5 h-3.5" />
        Se alla tillgängliga RSSHub-routes
      </a>
    </div>
  );

  // Status view
  const renderStatus = () => (
    <div className="space-y-4">
      <div className="p-4 rounded-lg bg-muted/30 space-y-2">
        <div className="text-xs text-muted-foreground uppercase tracking-wide mb-2">System</div>
        <div className="flex justify-between text-sm py-1.5 border-b border-border">
          <span className="text-muted-foreground">RSS Parser</span>
          <span className="text-green-500">Aktiv</span>
        </div>
        <div className="flex justify-between text-sm py-1.5 border-b border-border">
          <span className="text-muted-foreground">RSSHub</span>
          <span className={rsshubStatus === "online" ? "text-green-500" : rsshubStatus === "offline" ? "text-red-500" : "text-muted-foreground"}>
            {rsshubStatus === "online" ? "Tillgänglig" : rsshubStatus === "offline" ? "Ej tillgänglig" : "–"}
          </span>
        </div>
        <div className="flex justify-between text-sm py-1.5">
          <span className="text-muted-foreground">Aktiva källor</span>
          <span className="font-mono">{sources.length}</span>
        </div>
      </div>

      <div className="p-4 rounded-lg bg-muted/30 space-y-3">
        <div className="text-xs text-muted-foreground uppercase tracking-wide">Testa flöde</div>
        <div className="flex gap-2">
          <Input
            value={testUrl}
            onChange={(e) => setTestUrl(e.target.value)}
            placeholder="https://example.com/rss"
            className="font-mono text-sm"
          />
          <Button onClick={handleTestFeed} disabled={isLoading || !testUrl.trim()}>
            {isLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : "Testa"}
          </Button>
        </div>
        {testResult && (
          <div className="text-sm">
            <div className="font-medium">{testResult.title}</div>
            <div className="text-muted-foreground">{testResult.items} artiklar</div>
          </div>
        )}
      </div>

      <div className="flex gap-2">
        <Button onClick={handleRefreshAll} className="flex-1">
          <RefreshCw className="w-4 h-4 mr-2" />
          Uppdatera alla
        </Button>
        <Button variant="outline" onClick={handleCheckRsshub}>
          Testa RSSHub
        </Button>
      </div>

      <div className="rounded-lg bg-muted/30 overflow-hidden">
        <div className="flex items-center justify-between px-3 py-2 border-b border-border">
          <span className="text-xs text-muted-foreground uppercase tracking-wide">Logg</span>
          <button onClick={() => setLogs([])} className="text-xs text-muted-foreground hover:text-foreground">
            Rensa
          </button>
        </div>
        <div className="p-3 max-h-[100px] overflow-y-auto font-mono text-xs space-y-1">
          {logs.length === 0 ? (
            <div className="text-muted-foreground text-center py-2">Ingen aktivitet</div>
          ) : (
            logs.map((log, i) => (
              <div key={i} className="flex gap-2">
                <span className="text-muted-foreground">{log.time}</span>
                <span className={log.type === "success" ? "text-green-500" : log.type === "error" ? "text-red-500" : log.type === "warning" ? "text-yellow-500" : "text-primary"}>
                  {log.msg}
                </span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader className="flex flex-row items-center gap-3">
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
              {view === "rsshub" && "RSSHub"}
              {view === "status" && "Status"}
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

        <div className="py-2">
          {view === "menu" && renderMenu()}
          {view === "sources" && renderSources()}
          {view === "rsshub" && renderRsshub()}
          {view === "status" && renderStatus()}
        </div>
      </DialogContent>
    </Dialog>
  );
}
