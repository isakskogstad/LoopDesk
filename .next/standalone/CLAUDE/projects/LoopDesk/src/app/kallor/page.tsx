"use client";

import { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import {
  Rss, Plus, Trash2, ExternalLink, RefreshCw, Check, X, Loader2,
  Twitter, Youtube, Linkedin, Globe, AlertCircle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { GradientMesh } from "@/components/news-desk";

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

const CATEGORIES = ["Affärer", "Tech", "Nyheter", "Sport", "Övrigt"];

const RSSHUB_TEMPLATES = [
  {
    id: "twitter",
    name: "Twitter/X",
    template: "https://rsshub.rssforever.com/twitter/user/{username}",
    placeholder: "Användarnamn (utan @)",
    icon: <Twitter className="w-4 h-4" />,
  },
  {
    id: "youtube",
    name: "YouTube-kanal",
    template: "https://rsshub.rssforever.com/youtube/channel/{channelId}",
    placeholder: "Kanal-ID eller @handle",
    icon: <Youtube className="w-4 h-4" />,
  },
  {
    id: "linkedin",
    name: "LinkedIn Company",
    template: "https://rsshub.rssforever.com/linkedin/company/{companyName}",
    placeholder: "Företagsnamn (URL-slug)",
    icon: <Linkedin className="w-4 h-4" />,
  },
];

export default function KallorPage() {
  const { status } = useSession();
  const router = useRouter();
  const [feeds, setFeeds] = useState<Feed[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Add feed state
  const [showAddForm, setShowAddForm] = useState(false);
  const [newUrl, setNewUrl] = useState("");
  const [newName, setNewName] = useState("");
  const [newCategory, setNewCategory] = useState("Affärer");
  const [isValidating, setIsValidating] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const [validation, setValidation] = useState<ValidationResult | null>(null);

  // RSSHub template state
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
  const [templateInput, setTemplateInput] = useState("");

  // Load feeds
  const loadFeeds = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await fetch("/api/feeds");
      if (!response.ok) throw new Error("Failed to load feeds");
      const data = await response.json();
      setFeeds(data.feeds || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (status === "authenticated") {
      loadFeeds();
    } else if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status, router, loadFeeds]);

  // Validate URL
  const validateUrl = async (url: string) => {
    if (!url) return;
    setIsValidating(true);
    setValidation(null);
    try {
      const response = await fetch("/api/feeds/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url }),
      });
      const data = await response.json();
      setValidation(data);
      if (data.valid && data.feed?.title && !newName) {
        setNewName(data.feed.title);
      }
    } catch {
      setValidation({ valid: false, error: "Validation failed" });
    } finally {
      setIsValidating(false);
    }
  };

  // Add feed
  const addFeed = async () => {
    if (!newUrl || !newName) return;
    setIsAdding(true);
    try {
      const response = await fetch("/api/feeds", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          url: newUrl,
          name: newName,
          category: newCategory,
        }),
      });
      if (!response.ok) throw new Error("Failed to add feed");
      await loadFeeds();
      resetForm();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to add feed");
    } finally {
      setIsAdding(false);
    }
  };

  // Delete feed
  const deleteFeed = async (id: string) => {
    if (!confirm("Är du säker på att du vill ta bort denna källa?")) return;
    try {
      const response = await fetch(`/api/feeds/${id}`, { method: "DELETE" });
      if (!response.ok) throw new Error("Failed to delete feed");
      await loadFeeds();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete feed");
    }
  };

  // Sync feeds
  const syncFeeds = async () => {
    try {
      setIsLoading(true);
      const response = await fetch("/api/feeds/sync", { method: "POST" });
      if (!response.ok) throw new Error("Sync failed");
      await loadFeeds();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Sync failed");
    } finally {
      setIsLoading(false);
    }
  };

  // Reset form
  const resetForm = () => {
    setShowAddForm(false);
    setNewUrl("");
    setNewName("");
    setNewCategory("Affärer");
    setValidation(null);
    setSelectedTemplate(null);
    setTemplateInput("");
  };

  // Apply template
  const applyTemplate = (templateId: string) => {
    const template = RSSHUB_TEMPLATES.find(t => t.id === templateId);
    if (template && templateInput) {
      const url = template.template.replace(/\{[^}]+\}/, templateInput);
      setNewUrl(url);
      validateUrl(url);
    }
  };

  if (status === "loading" || (status === "authenticated" && isLoading && feeds.length === 0)) {
    return (
      <>
        <GradientMesh />
        <main className="min-h-screen bg-background">
          <div className="max-w-4xl mx-auto px-6 py-12">
            <div className="animate-pulse space-y-4">
              <div className="h-8 bg-muted rounded w-48" />
              <div className="h-4 bg-muted rounded w-96" />
              <div className="space-y-3 mt-8">
                {[1, 2, 3, 4, 5].map(i => (
                  <div key={i} className="h-16 bg-muted rounded-lg" />
                ))}
              </div>
            </div>
          </div>
        </main>
      </>
    );
  }

  return (
    <>
      <GradientMesh />
      <main className="min-h-screen bg-background">
        <div className="max-w-4xl mx-auto px-6 py-12">
          {/* Header */}
          <header className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h1 className="text-2xl font-bold text-foreground flex items-center gap-3">
                  <Rss className="w-6 h-6 text-accent" />
                  Nyhetskällor
                </h1>
                <p className="text-muted-foreground mt-1">
                  Hantera dina RSS-feeds och nyhetskällor
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={syncFeeds}
                  disabled={isLoading}
                >
                  <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
                  Synka
                </Button>
                <Button
                  size="sm"
                  onClick={() => setShowAddForm(true)}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Lägg till
                </Button>
              </div>
            </div>

            {error && (
              <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-3 flex items-center gap-2 text-destructive text-sm">
                <AlertCircle className="w-4 h-4" />
                {error}
                <button onClick={() => setError(null)} className="ml-auto">
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}
          </header>

          {/* Add Feed Form */}
          {showAddForm && (
            <div className="bg-card border border-border rounded-xl p-6 mb-8">
              <h3 className="font-semibold mb-4">Lägg till ny källa</h3>

              {/* RSSHub Templates */}
              <div className="mb-4">
                <label className="text-sm text-muted-foreground mb-2 block">Snabbmallar</label>
                <div className="flex gap-2 flex-wrap">
                  {RSSHUB_TEMPLATES.map(template => (
                    <button
                      key={template.id}
                      onClick={() => setSelectedTemplate(
                        selectedTemplate === template.id ? null : template.id
                      )}
                      className={`flex items-center gap-2 px-3 py-2 rounded-lg border transition-colors ${
                        selectedTemplate === template.id
                          ? 'bg-accent text-white border-accent'
                          : 'bg-secondary border-border hover:border-accent'
                      }`}
                    >
                      {template.icon}
                      <span className="text-sm">{template.name}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Template Input */}
              {selectedTemplate && (
                <div className="mb-4">
                  <label className="text-sm text-muted-foreground mb-2 block">
                    {RSSHUB_TEMPLATES.find(t => t.id === selectedTemplate)?.placeholder}
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={templateInput}
                      onChange={(e) => setTemplateInput(e.target.value)}
                      placeholder={RSSHUB_TEMPLATES.find(t => t.id === selectedTemplate)?.placeholder}
                      className="flex-1 px-3 py-2 bg-background border border-border rounded-lg text-sm"
                    />
                    <Button
                      size="sm"
                      onClick={() => applyTemplate(selectedTemplate)}
                      disabled={!templateInput}
                    >
                      Applicera
                    </Button>
                  </div>
                </div>
              )}

              {/* Manual URL */}
              <div className="mb-4">
                <label className="text-sm text-muted-foreground mb-2 block">RSS-URL</label>
                <div className="flex gap-2">
                  <input
                    type="url"
                    value={newUrl}
                    onChange={(e) => setNewUrl(e.target.value)}
                    onBlur={() => newUrl && validateUrl(newUrl)}
                    placeholder="https://example.com/feed.xml"
                    className="flex-1 px-3 py-2 bg-background border border-border rounded-lg text-sm"
                  />
                  {isValidating && <Loader2 className="w-5 h-5 animate-spin text-muted-foreground self-center" />}
                  {validation?.valid && <Check className="w-5 h-5 text-green-500 self-center" />}
                  {validation && !validation.valid && <X className="w-5 h-5 text-destructive self-center" />}
                </div>
                {validation?.error && (
                  <p className="text-sm text-destructive mt-1">{validation.error}</p>
                )}
                {validation?.feed && (
                  <p className="text-sm text-muted-foreground mt-1">
                    {validation.feed.itemCount} artiklar hittades
                  </p>
                )}
              </div>

              {/* Name */}
              <div className="mb-4">
                <label className="text-sm text-muted-foreground mb-2 block">Namn</label>
                <input
                  type="text"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="Källans namn"
                  className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm"
                />
              </div>

              {/* Category */}
              <div className="mb-6">
                <label className="text-sm text-muted-foreground mb-2 block">Kategori</label>
                <div className="flex gap-2 flex-wrap">
                  {CATEGORIES.map(cat => (
                    <button
                      key={cat}
                      onClick={() => setNewCategory(cat)}
                      className={`px-3 py-1.5 rounded-full text-sm transition-colors ${
                        newCategory === cat
                          ? 'bg-accent text-white'
                          : 'bg-secondary hover:bg-secondary/80'
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>

              {/* Actions */}
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={resetForm}>
                  Avbryt
                </Button>
                <Button
                  onClick={addFeed}
                  disabled={!newUrl || !newName || isAdding || (validation !== null && !validation.valid)}
                >
                  {isAdding ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Lägger till...
                    </>
                  ) : (
                    <>
                      <Plus className="w-4 h-4 mr-2" />
                      Lägg till källa
                    </>
                  )}
                </Button>
              </div>
            </div>
          )}

          {/* Feeds List */}
          <div className="space-y-3">
            {feeds.length === 0 && !isLoading ? (
              <div className="text-center py-12 text-muted-foreground">
                <Rss className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>Inga nyhetskällor ännu</p>
                <p className="text-sm">Klicka på "Lägg till" för att lägga till din första källa</p>
              </div>
            ) : (
              feeds.map(feed => (
                <div
                  key={feed.id}
                  className="bg-card border border-border rounded-lg p-4 flex items-center gap-4 hover:border-accent/50 transition-colors"
                >
                  <div className="w-10 h-10 rounded-lg bg-secondary flex items-center justify-center">
                    <Globe className="w-5 h-5 text-muted-foreground" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-foreground truncate">{feed.name}</h4>
                    <p className="text-sm text-muted-foreground truncate">{feed.url}</p>
                  </div>
                  {feed.category && (
                    <span className="px-2 py-1 bg-secondary rounded text-xs text-muted-foreground">
                      {feed.category}
                    </span>
                  )}
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => window.open(feed.url, "_blank")}
                      className="p-2 hover:bg-secondary rounded-lg transition-colors"
                      title="Öppna feed"
                    >
                      <ExternalLink className="w-4 h-4 text-muted-foreground" />
                    </button>
                    <button
                      onClick={() => deleteFeed(feed.id)}
                      className="p-2 hover:bg-destructive/10 rounded-lg transition-colors"
                      title="Ta bort"
                    >
                      <Trash2 className="w-4 h-4 text-destructive" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </main>
    </>
  );
}
