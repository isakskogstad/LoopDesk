"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { Rss, List, Activity, Plus, Loader2, Trash2, Check, X, ExternalLink, RefreshCw } from "lucide-react";
import { ToolPanel, ToolTabs, LogPanel, ProgressBar, StatusBadge } from "../shared";
import type { ToolTab, LogEntry, ToolStatus } from "../shared/types";

interface RssToolProps {
  onClose: () => void;
}

interface Feed {
  id: string;
  name: string;
  url: string;
  type: string;
  category?: string;
  color?: string;
  enabled: boolean;
  createdAt?: string;
}

interface ValidationResult {
  valid: boolean;
  error?: string;
  feed?: {
    title?: string;
    description?: string;
    itemCount?: number;
    type?: string;
  };
}

const TABS: ToolTab[] = [
  { id: "sources", label: "Källor", icon: <List className="w-3.5 h-3.5" /> },
  { id: "add", label: "Lägg till", icon: <Plus className="w-3.5 h-3.5" /> },
  { id: "status", label: "Status", icon: <Activity className="w-3.5 h-3.5" /> },
];

const RSSHUB_TEMPLATES = [
  {
    id: "twitter",
    name: "Twitter/X",
    template: "https://rsshub.rssforever.com/twitter/user/{username}",
    placeholder: "Användarnamn (utan @)",
    icon: (
      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
      </svg>
    ),
  },
  {
    id: "youtube",
    name: "YouTube-kanal",
    template: "https://rsshub.rssforever.com/youtube/channel/{channelId}",
    placeholder: "Kanal-ID eller @handle",
    icon: (
      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
        <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
      </svg>
    ),
  },
  {
    id: "linkedin",
    name: "LinkedIn Company",
    template: "https://rsshub.rssforever.com/linkedin/company/{companyName}",
    placeholder: "Företagsnamn (URL-slug)",
    icon: (
      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
        <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
      </svg>
    ),
  },
];

export function RssTool({ onClose }: RssToolProps) {
  const [activeTab, setActiveTab] = useState("sources");
  const [status, setStatus] = useState<ToolStatus>("idle");
  const [progress, setProgress] = useState(0);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [feeds, setFeeds] = useState<Feed[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [newFeedUrl, setNewFeedUrl] = useState("");
  const [newFeedName, setNewFeedName] = useState("");
  const [validation, setValidation] = useState<ValidationResult | null>(null);
  const [isValidating, setIsValidating] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
  const [templateInput, setTemplateInput] = useState("");
  const logIdRef = useRef(0);

  const addLog = useCallback((message: string, type: LogEntry["type"] = "info") => {
    const entry: LogEntry = {
      id: `log-${++logIdRef.current}`,
      timestamp: new Date(),
      message,
      type,
    };
    setLogs((prev) => [...prev.slice(-99), entry]);
    return entry;
  }, []);

  // Load feeds on mount
  useEffect(() => {
    loadFeeds();
  }, []);

  const loadFeeds = async () => {
    setIsLoading(true);
    setStatus("running");
    setProgress(20);
    addLog("Laddar RSS-källor...", "info");

    try {
      const response = await fetch("/api/feeds");
      setProgress(60);

      if (!response.ok) {
        throw new Error(`API returned ${response.status}`);
      }

      const data = await response.json();
      setProgress(90);
      setFeeds(data.feeds || []);
      addLog(`Laddat ${data.feeds?.length || 0} RSS-källor`, "success");
      setStatus("success");
    } catch (error) {
      addLog(`Fel: ${error instanceof Error ? error.message : "Okänt fel"}`, "error");
      setStatus("error");
    }

    setIsLoading(false);
    setProgress(100);
    setTimeout(() => setProgress(0), 1000);
  };

  const validateUrl = async (url: string) => {
    if (!url.trim()) return;

    setIsValidating(true);
    setValidation(null);
    addLog(`Validerar: ${url}`, "info");

    try {
      const response = await fetch("/api/feeds/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: url.trim() }),
      });

      const data = await response.json();
      setValidation(data);

      if (data.valid) {
        addLog(`Giltig RSS-källa: ${data.feed?.title || url}`, "success");
        if (data.feed?.title && !newFeedName) {
          setNewFeedName(data.feed.title);
        }
      } else {
        addLog(`Ogiltig källa: ${data.error || "Okänt fel"}`, "warning");
      }
    } catch (error) {
      addLog(`Valideringsfel: ${error instanceof Error ? error.message : "Okänt fel"}`, "error");
      setValidation({ valid: false, error: "Kunde inte validera" });
    }

    setIsValidating(false);
  };

  const addFeed = async () => {
    if (!newFeedUrl.trim() || !validation?.valid) return;

    setIsAdding(true);
    setStatus("running");
    setProgress(30);
    addLog(`Lägger till: ${newFeedName || newFeedUrl}`, "info");

    try {
      const response = await fetch("/api/feeds", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          url: newFeedUrl.trim(),
          name: newFeedName.trim() || undefined,
        }),
      });

      setProgress(70);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `API returned ${response.status}`);
      }

      const data = await response.json();
      setProgress(90);

      if (data.feed) {
        setFeeds((prev) => [data.feed, ...prev]);
        addLog(`Lade till: ${data.feed.name}`, "success");
        setNewFeedUrl("");
        setNewFeedName("");
        setValidation(null);
        setActiveTab("sources");
      }

      setStatus("success");
    } catch (error) {
      addLog(`Fel: ${error instanceof Error ? error.message : "Okänt fel"}`, "error");
      setStatus("error");
    }

    setIsAdding(false);
    setProgress(100);
    setTimeout(() => setProgress(0), 1000);
  };

  const deleteFeed = async (feed: Feed) => {
    addLog(`Tar bort: ${feed.name}`, "info");

    try {
      const response = await fetch(`/api/feeds/${feed.id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error(`API returned ${response.status}`);
      }

      setFeeds((prev) => prev.filter((f) => f.id !== feed.id));
      addLog(`Tog bort: ${feed.name}`, "success");
    } catch (error) {
      addLog(`Fel: ${error instanceof Error ? error.message : "Okänt fel"}`, "error");
    }
  };

  const toggleFeed = async (feed: Feed) => {
    try {
      const response = await fetch(`/api/feeds/${feed.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ enabled: !feed.enabled }),
      });

      if (!response.ok) {
        throw new Error(`API returned ${response.status}`);
      }

      setFeeds((prev) =>
        prev.map((f) => (f.id === feed.id ? { ...f, enabled: !f.enabled } : f))
      );
      addLog(`${feed.enabled ? "Inaktiverade" : "Aktiverade"}: ${feed.name}`, "info");
    } catch (error) {
      addLog(`Fel: ${error instanceof Error ? error.message : "Okänt fel"}`, "error");
    }
  };

  const applyTemplate = (templateId: string) => {
    const template = RSSHUB_TEMPLATES.find((t) => t.id === templateId);
    if (template && templateInput.trim()) {
      const url = template.template.replace("{username}", templateInput.trim())
        .replace("{channelId}", templateInput.trim())
        .replace("{companyName}", templateInput.trim());
      setNewFeedUrl(url);
      setSelectedTemplate(null);
      setTemplateInput("");
      validateUrl(url);
    }
  };

  return (
    <ToolPanel
      tool="rss"
      title="RSS-hanterare"
      icon={<Rss className="w-5 h-5" />}
      isOpen={true}
      onClose={onClose}
    >
      <ToolTabs
        tool="rss"
        tabs={TABS}
        activeTab={activeTab}
        onTabChange={setActiveTab}
      />

      <div className="tool-content space-y-4">
        {activeTab === "sources" && (
          <>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Dina RSS-källor ({feeds.length})</span>
              <button
                onClick={loadFeeds}
                disabled={isLoading}
                className="btn-secondary text-xs gap-1.5"
              >
                {isLoading ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <RefreshCw className="w-3.5 h-3.5" />
                )}
                Uppdatera
              </button>
            </div>

            {progress > 0 && (
              <ProgressBar tool="rss" progress={progress} />
            )}

            {feeds.length > 0 ? (
              <div className="space-y-2 max-h-80 overflow-y-auto">
                {feeds.map((feed) => (
                  <div
                    key={feed.id}
                    className={`p-3 rounded-lg border border-border transition-colors ${
                      feed.enabled ? "bg-secondary/50" : "bg-secondary/20 opacity-60"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-sm truncate">{feed.name}</div>
                        <div className="text-xs text-muted-foreground truncate mt-0.5">
                          {feed.url}
                        </div>
                        <div className="flex items-center gap-2 mt-1">
                          <span className={`text-xs px-1.5 py-0.5 rounded ${
                            feed.enabled
                              ? "bg-green-500/20 text-green-500"
                              : "bg-muted text-muted-foreground"
                          }`}>
                            {feed.enabled ? "Aktiv" : "Inaktiv"}
                          </span>
                          {feed.type && (
                            <span className="text-xs text-muted-foreground">
                              {feed.type}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => toggleFeed(feed)}
                          className="p-1.5 rounded hover:bg-secondary transition-colors"
                          title={feed.enabled ? "Inaktivera" : "Aktivera"}
                        >
                          {feed.enabled ? (
                            <Check className="w-3.5 h-3.5 text-green-500" />
                          ) : (
                            <X className="w-3.5 h-3.5 text-muted-foreground" />
                          )}
                        </button>
                        <a
                          href={feed.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-1.5 rounded hover:bg-secondary transition-colors"
                          title="Öppna URL"
                        >
                          <ExternalLink className="w-3.5 h-3.5 text-muted-foreground" />
                        </a>
                        <button
                          onClick={() => deleteFeed(feed)}
                          className="p-1.5 rounded hover:bg-secondary transition-colors text-red-500"
                          title="Ta bort"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="empty-state py-8">
                <Rss className="empty-state-icon w-10 h-10" />
                <p className="empty-state-title text-sm">Inga RSS-källor</p>
                <p className="empty-state-description text-xs">
                  Lägg till RSS-flöden för att hålla koll på nyheter.
                </p>
                <button
                  onClick={() => setActiveTab("add")}
                  className="btn-primary text-xs mt-3"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Lägg till källa
                </button>
              </div>
            )}
          </>
        )}

        {activeTab === "add" && (
          <>
            {/* Custom URL */}
            <div className="space-y-3">
              <label className="text-label">RSS/Atom URL</label>
              <div className="flex gap-2">
                <input
                  type="url"
                  placeholder="https://example.com/feed.xml"
                  value={newFeedUrl}
                  onChange={(e) => {
                    setNewFeedUrl(e.target.value);
                    setValidation(null);
                  }}
                  className="flex-1 px-3 py-2 bg-secondary border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-ring font-mono"
                />
                <button
                  onClick={() => validateUrl(newFeedUrl)}
                  disabled={isValidating || !newFeedUrl.trim()}
                  className="btn-secondary px-3"
                >
                  {isValidating ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    "Validera"
                  )}
                </button>
              </div>
            </div>

            {/* Validation result */}
            {validation && (
              <div className={`p-3 rounded-lg border ${
                validation.valid
                  ? "border-green-500/30 bg-green-500/10"
                  : "border-red-500/30 bg-red-500/10"
              }`}>
                {validation.valid ? (
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-green-500">
                      <Check className="w-4 h-4" />
                      <span className="text-sm font-medium">Giltig RSS-källa</span>
                    </div>
                    {validation.feed && (
                      <div className="text-xs text-muted-foreground space-y-1">
                        {validation.feed.title && <div>Titel: {validation.feed.title}</div>}
                        {validation.feed.itemCount && <div>Artiklar: {validation.feed.itemCount}</div>}
                        {validation.feed.type && <div>Typ: {validation.feed.type}</div>}
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="flex items-center gap-2 text-red-500">
                    <X className="w-4 h-4" />
                    <span className="text-sm">{validation.error || "Ogiltig källa"}</span>
                  </div>
                )}
              </div>
            )}

            {/* Custom name */}
            {validation?.valid && (
              <div className="space-y-2">
                <label className="text-label">Namn (valfritt)</label>
                <input
                  type="text"
                  placeholder="Ange ett namn för källan..."
                  value={newFeedName}
                  onChange={(e) => setNewFeedName(e.target.value)}
                  className="w-full px-3 py-2 bg-secondary border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </div>
            )}

            {/* Add button */}
            {validation?.valid && (
              <button
                onClick={addFeed}
                disabled={isAdding}
                className="btn-primary w-full"
              >
                {isAdding ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    <Plus className="w-4 h-4" />
                    Lägg till källa
                  </>
                )}
              </button>
            )}

            {/* RSSHub templates */}
            <div className="space-y-3 pt-4 border-t border-border">
              <label className="text-label">RSSHub-mallar</label>
              <p className="text-xs text-muted-foreground">
                Generera RSS-flöden från webbplatser utan inbyggt stöd.
              </p>

              <div className="grid gap-2">
                {RSSHUB_TEMPLATES.map((template) => (
                  <div key={template.id}>
                    {selectedTemplate === template.id ? (
                      <div className="p-3 rounded-lg border border-border bg-secondary space-y-2">
                        <div className="flex items-center gap-2">
                          {template.icon}
                          <span className="text-sm font-medium">{template.name}</span>
                        </div>
                        <div className="flex gap-2">
                          <input
                            type="text"
                            placeholder={template.placeholder}
                            value={templateInput}
                            onChange={(e) => setTemplateInput(e.target.value)}
                            onKeyDown={(e) => e.key === "Enter" && applyTemplate(template.id)}
                            className="flex-1 px-2 py-1.5 bg-background border border-border rounded text-sm"
                            autoFocus
                          />
                          <button
                            onClick={() => applyTemplate(template.id)}
                            disabled={!templateInput.trim()}
                            className="btn-primary px-3 py-1.5 text-xs"
                          >
                            Använd
                          </button>
                          <button
                            onClick={() => {
                              setSelectedTemplate(null);
                              setTemplateInput("");
                            }}
                            className="btn-secondary px-2 py-1.5"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ) : (
                      <button
                        onClick={() => setSelectedTemplate(template.id)}
                        className="w-full flex items-center gap-3 p-3 rounded-lg border border-border hover:bg-secondary transition-colors text-left"
                      >
                        <div className="tool-menu-icon" data-tool="rss">
                          {template.icon}
                        </div>
                        <span className="text-sm">{template.name}</span>
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

        {activeTab === "status" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Aktivitetslogg</span>
              <StatusBadge status={status} />
            </div>
            <LogPanel entries={logs} maxHeight={300} />
          </div>
        )}
      </div>
    </ToolPanel>
  );
}
