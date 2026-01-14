"use client";

import { useState, useEffect, useCallback } from "react";
import { Settings, Rss, Bell, ChevronRight, Plus, Trash2, ExternalLink, Check, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { useNotifications } from "@/hooks/use-notifications";

interface Feed {
  id: string;
  name: string;
  url: string;
  type: string;
  category?: string | null;
  color?: string | null;
  count?: number;
}

interface PlatformSettingsProps {
  variant?: "card" | "button";
}

export function PlatformSettings({ variant = "card" }: PlatformSettingsProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<"rss" | "notifications">("rss");

  // RSS state
  const [feeds, setFeeds] = useState<Feed[]>([]);
  const [isLoadingFeeds, setIsLoadingFeeds] = useState(false);
  const [newFeedUrl, setNewFeedUrl] = useState("");
  const [newFeedName, setNewFeedName] = useState("");
  const [isAddingFeed, setIsAddingFeed] = useState(false);
  const [addFeedError, setAddFeedError] = useState<string | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);

  // Notifications
  const {
    permission,
    settings: notificationSettings,
    isSupported: notificationsSupported,
    requestPermission,
    updateSettings: updateNotificationSettings,
  } = useNotifications();

  // Load feeds
  const loadFeeds = useCallback(async () => {
    setIsLoadingFeeds(true);
    try {
      const response = await fetch("/api/feeds");
      if (response.ok) {
        const data = await response.json();
        setFeeds(data.feeds || []);
      }
    } catch (error) {
      console.error("Failed to load feeds:", error);
    } finally {
      setIsLoadingFeeds(false);
    }
  }, []);

  useEffect(() => {
    if (isOpen) {
      loadFeeds();
    }
  }, [isOpen, loadFeeds]);

  // Add feed
  const handleAddFeed = async () => {
    if (!newFeedUrl.trim()) return;

    setIsAddingFeed(true);
    setAddFeedError(null);

    try {
      const response = await fetch("/api/feeds", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          url: newFeedUrl.trim(),
          name: newFeedName.trim() || undefined,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setNewFeedUrl("");
        setNewFeedName("");
        await loadFeeds();
      } else {
        setAddFeedError(data.error || "Kunde inte lägga till flödet");
      }
    } catch (error) {
      setAddFeedError("Nätverksfel");
    } finally {
      setIsAddingFeed(false);
    }
  };

  // Remove feed
  const handleRemoveFeed = async (feedId: string) => {
    try {
      const response = await fetch(`/api/feeds/${feedId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        await loadFeeds();
      }
    } catch (error) {
      console.error("Failed to remove feed:", error);
    }
  };

  // Sync feeds
  const handleSync = async () => {
    setIsSyncing(true);
    try {
      await fetch("/api/nyheter/sync", { method: "POST" });
    } catch (error) {
      console.error("Failed to sync:", error);
    } finally {
      setIsSyncing(false);
    }
  };

  // Request notification permission
  const handleRequestPermission = async () => {
    await requestPermission();
  };

  const content = (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="max-w-lg max-h-[85vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Settings className="w-5 h-5" />
            Plattformsinställningar
          </DialogTitle>
          <DialogDescription>
            Konfigurera RSS-källor, notiser och andra globala inställningar.
          </DialogDescription>
        </DialogHeader>

        {/* Tabs */}
        <div className="flex border-b border-border">
          <button
            onClick={() => setActiveTab("rss")}
            className={`flex items-center gap-2 px-4 py-3 text-sm font-medium transition-colors relative
              ${activeTab === "rss"
                ? "text-foreground"
                : "text-muted-foreground hover:text-foreground"
              }`}
          >
            <Rss className="w-4 h-4" />
            RSS-flöden
            {activeTab === "rss" && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-foreground" />
            )}
          </button>
          <button
            onClick={() => setActiveTab("notifications")}
            className={`flex items-center gap-2 px-4 py-3 text-sm font-medium transition-colors relative
              ${activeTab === "notifications"
                ? "text-foreground"
                : "text-muted-foreground hover:text-foreground"
              }`}
          >
            <Bell className="w-4 h-4" />
            Notiser
            {activeTab === "notifications" && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-foreground" />
            )}
          </button>
        </div>

        {/* Tab Content */}
        <div className="flex-1 overflow-y-auto py-4">
          {activeTab === "rss" && (
            <div className="space-y-6">
              {/* Add new feed */}
              <div className="space-y-3">
                <h3 className="text-sm font-semibold">Lägg till nytt flöde</h3>
                <div className="flex gap-2">
                  <Input
                    placeholder="RSS-URL (t.ex. https://example.com/feed.xml)"
                    value={newFeedUrl}
                    onChange={(e) => setNewFeedUrl(e.target.value)}
                    className="flex-1"
                  />
                </div>
                <div className="flex gap-2">
                  <Input
                    placeholder="Namn (valfritt)"
                    value={newFeedName}
                    onChange={(e) => setNewFeedName(e.target.value)}
                    className="flex-1"
                  />
                  <Button
                    onClick={handleAddFeed}
                    disabled={isAddingFeed || !newFeedUrl.trim()}
                    size="sm"
                  >
                    {isAddingFeed ? (
                      <RefreshCw className="w-4 h-4 animate-spin" />
                    ) : (
                      <Plus className="w-4 h-4" />
                    )}
                    Lägg till
                  </Button>
                </div>
                {addFeedError && (
                  <p className="text-sm text-destructive">{addFeedError}</p>
                )}
              </div>

              {/* Sync button */}
              <div className="flex items-center justify-between p-3 bg-secondary/50 rounded-lg">
                <div>
                  <p className="text-sm font-medium">Synkronisera alla flöden</p>
                  <p className="text-xs text-muted-foreground">
                    Hämta senaste artiklar från alla källor
                  </p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleSync}
                  disabled={isSyncing}
                >
                  <RefreshCw className={`w-4 h-4 mr-2 ${isSyncing ? "animate-spin" : ""}`} />
                  {isSyncing ? "Synkar..." : "Synka nu"}
                </Button>
              </div>

              {/* Feed list */}
              <div className="space-y-2">
                <h3 className="text-sm font-semibold">
                  Dina RSS-källor ({feeds.length})
                </h3>

                {isLoadingFeeds ? (
                  <div className="space-y-2">
                    {[1, 2, 3].map((i) => (
                      <div
                        key={i}
                        className="h-14 bg-secondary/50 rounded-lg animate-pulse"
                      />
                    ))}
                  </div>
                ) : feeds.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <Rss className="w-8 h-8 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">Inga RSS-källor tillagda ännu.</p>
                    <p className="text-xs">Lägg till ditt första flöde ovan.</p>
                  </div>
                ) : (
                  <div className="space-y-2 max-h-[200px] overflow-y-auto">
                    {feeds.map((feed) => (
                      <div
                        key={feed.id}
                        className="flex items-center justify-between p-3 bg-card border border-border rounded-lg group hover:border-foreground/20 transition-colors"
                      >
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">
                            {feed.name}
                          </p>
                          <p className="text-xs text-muted-foreground truncate">
                            {feed.url}
                          </p>
                        </div>
                        <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <a
                            href={feed.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-1.5 text-muted-foreground hover:text-foreground transition-colors"
                          >
                            <ExternalLink className="w-4 h-4" />
                          </a>
                          <button
                            onClick={() => handleRemoveFeed(feed.id)}
                            className="p-1.5 text-muted-foreground hover:text-destructive transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === "notifications" && (
            <div className="space-y-6">
              {/* Permission status */}
              {!notificationsSupported ? (
                <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
                  <p className="text-sm text-destructive">
                    Din webbläsare stöder inte push-notiser.
                  </p>
                </div>
              ) : permission === "denied" ? (
                <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
                  <p className="text-sm text-destructive">
                    Notiser är blockerade. Aktivera dem i webbläsarens inställningar.
                  </p>
                </div>
              ) : permission === "default" ? (
                <div className="p-4 bg-secondary/50 border border-border rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium">Aktivera notiser</p>
                      <p className="text-xs text-muted-foreground">
                        Få varningar vid viktiga bolagshändelser
                      </p>
                    </div>
                    <Button onClick={handleRequestPermission} size="sm">
                      <Bell className="w-4 h-4 mr-2" />
                      Aktivera
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="flex items-center gap-3 p-3 bg-green-500/10 border border-green-500/20 rounded-lg">
                    <Check className="w-5 h-5 text-green-600" />
                    <div className="flex-1">
                      <p className="text-sm text-green-700 dark:text-green-400">
                        Notiser är aktiverade
                      </p>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        // Test notification
                        if ("serviceWorker" in navigator && navigator.serviceWorker.controller) {
                          navigator.serviceWorker.controller.postMessage({
                            type: "TEST_NOTIFICATION",
                          });
                        } else {
                          new Notification("LoopDesk Test", {
                            body: "Push-notiser fungerar! Du kommer få varningar vid bolagshändelser.",
                            icon: "/icon-192.png",
                          });
                        }
                      }}
                    >
                      Testa
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Notiser fungerar även när webbläsaren är i bakgrunden och visas i macOS Notification Center.
                  </p>
                </div>
              )}

              {/* Notification settings */}
              <div className="space-y-4">
                <h3 className="text-sm font-semibold">Notiserinställningar</h3>

                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-card border border-border rounded-lg">
                    <div>
                      <p className="text-sm font-medium">Aktivera notiser</p>
                      <p className="text-xs text-muted-foreground">
                        Visa notiser för bolagshändelser
                      </p>
                    </div>
                    <Switch
                      checked={notificationSettings.enabled}
                      onCheckedChange={(checked) =>
                        updateNotificationSettings({ enabled: checked })
                      }
                      disabled={permission !== "granted"}
                    />
                  </div>

                  <div className="flex items-center justify-between p-3 bg-card border border-border rounded-lg">
                    <div>
                      <p className="text-sm font-medium">Endast kritiska</p>
                      <p className="text-xs text-muted-foreground">
                        Bara konkurs och likvidation
                      </p>
                    </div>
                    <Switch
                      checked={notificationSettings.criticalOnly}
                      onCheckedChange={(checked) =>
                        updateNotificationSettings({ criticalOnly: checked })
                      }
                      disabled={permission !== "granted" || !notificationSettings.enabled}
                    />
                  </div>

                  <div className="flex items-center justify-between p-3 bg-card border border-border rounded-lg">
                    <div>
                      <p className="text-sm font-medium">Ljudnotis</p>
                      <p className="text-xs text-muted-foreground">
                        Spela ljud vid notiser
                      </p>
                    </div>
                    <Switch
                      checked={notificationSettings.soundEnabled}
                      onCheckedChange={(checked) =>
                        updateNotificationSettings({ soundEnabled: checked })
                      }
                      disabled={permission !== "granted" || !notificationSettings.enabled}
                    />
                  </div>
                </div>
              </div>

              {/* Event categories */}
              <div className="space-y-3">
                <h3 className="text-sm font-semibold">Händelsetyper som triggar notis</h3>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { id: "konkurs", label: "Konkurs", critical: true },
                    { id: "likvidation", label: "Likvidation", critical: true },
                    { id: "fusion", label: "Fusion", critical: false },
                    { id: "emission", label: "Nyemission", critical: false },
                  ].map((event) => (
                    <div
                      key={event.id}
                      className={`p-3 rounded-lg border ${
                        event.critical
                          ? "bg-destructive/5 border-destructive/20"
                          : "bg-card border-border"
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        {event.critical ? (
                          <span className="w-2 h-2 rounded-full bg-destructive" />
                        ) : (
                          <span className="w-2 h-2 rounded-full bg-muted-foreground" />
                        )}
                        <span className="text-sm font-medium">{event.label}</span>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        {event.critical ? "Alltid aktiv" : notificationSettings.criticalOnly ? "Inaktiv" : "Aktiv"}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );

  if (variant === "button") {
    return (
      <>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setIsOpen(true)}
          className="gap-2"
        >
          <Settings className="w-4 h-4" />
          Inställningar
        </Button>
        {content}
      </>
    );
  }

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="section-card group"
      >
        <div className="section-icon">
          <Settings strokeWidth={1.5} />
        </div>
        <h2 className="section-title">Inställningar</h2>
        <p className="section-description">
          Konfigurera RSS-källor, notiser och andra plattformsinställningar.
        </p>
        <div className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
          <ChevronRight className="w-5 h-5 text-muted-foreground" />
        </div>
      </button>
      {content}
    </>
  );
}
