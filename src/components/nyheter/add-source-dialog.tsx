"use client";

import { useState } from "react";
import { Plus, X, Rss, Twitter, Linkedin, Instagram, Facebook, Send, Youtube, Github, Globe, Search, Loader2, Sparkles, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { FeedConfig, SourceType } from "@/lib/nyheter/types";
import { generateFeedId } from "@/lib/nyheter/feeds";

interface DiscoveredFeed {
  url: string;
  title: string;
  type: "rss" | "atom" | "json";
  source: "autodiscovery" | "common-pattern" | "rsshub";
}

interface DiscoveryResult {
  url: string;
  domain: string;
  feeds: DiscoveredFeed[];
  feedCount: number;
}

interface SourceTypeOption {
  type: SourceType;
  name: string;
  description: string;
  icon: React.ReactNode;
  color: string;
  fields: {
    name: string;
    label: string;
    placeholder: string;
    required: boolean;
  }[];
}

const sourceTypes: SourceTypeOption[] = [
  {
    type: "rss",
    name: "RSS/Atom",
    description: "Standard RSS eller Atom-flöde",
    icon: <Rss className="w-5 h-5" />,
    color: "#FF6600",
    fields: [
      { name: "url", label: "RSS URL", placeholder: "https://example.com/feed.xml", required: true },
      { name: "name", label: "Namn", placeholder: "Mitt flöde", required: true },
    ],
  },
  {
    type: "twitter",
    name: "Twitter/X",
    description: "Följ en Twitter-profil",
    icon: <Twitter className="w-5 h-5" />,
    color: "#1DA1F2",
    fields: [
      { name: "username", label: "Användarnamn", placeholder: "elonmusk", required: true },
      { name: "name", label: "Visningsnamn", placeholder: "Elon Musk", required: false },
    ],
  },
  {
    type: "linkedin",
    name: "LinkedIn",
    description: "Följ ett företags LinkedIn-sida",
    icon: <Linkedin className="w-5 h-5" />,
    color: "#0A66C2",
    fields: [
      { name: "company", label: "Företags-slug", placeholder: "microsoft", required: true },
      { name: "name", label: "Visningsnamn", placeholder: "Microsoft", required: false },
    ],
  },
  {
    type: "instagram",
    name: "Instagram",
    description: "Följ en Instagram-profil",
    icon: <Instagram className="w-5 h-5" />,
    color: "#E4405F",
    fields: [
      { name: "username", label: "Användarnamn", placeholder: "natgeo", required: true },
      { name: "name", label: "Visningsnamn", placeholder: "National Geographic", required: false },
    ],
  },
  {
    type: "facebook",
    name: "Facebook",
    description: "Följ en Facebook-sida",
    icon: <Facebook className="w-5 h-5" />,
    color: "#1877F2",
    fields: [
      { name: "page", label: "Sidnamn eller ID", placeholder: "meta", required: true },
      { name: "name", label: "Visningsnamn", placeholder: "Meta", required: false },
    ],
  },
  {
    type: "telegram",
    name: "Telegram",
    description: "Följ en publik Telegram-kanal",
    icon: <Send className="w-5 h-5" />,
    color: "#0088CC",
    fields: [
      { name: "channel", label: "Kanalnamn", placeholder: "durov", required: true },
      { name: "name", label: "Visningsnamn", placeholder: "Durov's Channel", required: false },
    ],
  },
  {
    type: "youtube",
    name: "YouTube",
    description: "Prenumerera på en YouTube-kanal",
    icon: <Youtube className="w-5 h-5" />,
    color: "#FF0000",
    fields: [
      { name: "channelId", label: "Kanal-ID", placeholder: "UCsBjURrPoezykLs9EqgamOA", required: true },
      { name: "name", label: "Visningsnamn", placeholder: "Fireship", required: false },
    ],
  },
  {
    type: "reddit",
    name: "Reddit",
    description: "Följ en subreddit",
    icon: <Globe className="w-5 h-5" />,
    color: "#FF4500",
    fields: [
      { name: "subreddit", label: "Subreddit", placeholder: "technology", required: true },
      { name: "name", label: "Visningsnamn", placeholder: "r/technology", required: false },
    ],
  },
  {
    type: "github",
    name: "GitHub",
    description: "Följ ett GitHub-repository",
    icon: <Github className="w-5 h-5" />,
    color: "#181717",
    fields: [
      { name: "repo", label: "Repository", placeholder: "facebook/react", required: true },
      { name: "name", label: "Visningsnamn", placeholder: "React", required: false },
    ],
  },
];

// Color palette for discovered feeds
const FEED_COLORS = [
  "#3B82F6", "#10B981", "#F59E0B", "#EF4444", "#8B5CF6",
  "#EC4899", "#06B6D4", "#84CC16", "#F97316", "#6366F1",
];

function getColorForDomain(domain: string): string {
  let hash = 0;
  for (let i = 0; i < domain.length; i++) {
    hash = domain.charCodeAt(i) + ((hash << 5) - hash);
  }
  return FEED_COLORS[Math.abs(hash) % FEED_COLORS.length];
}

interface AddSourceDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (config: FeedConfig) => void;
}

export function AddSourceDialog({ isOpen, onClose, onAdd }: AddSourceDialogProps) {
  const [mode, setMode] = useState<"discover" | "manual" | "type-select" | "type-form">("discover");
  const [selectedType, setSelectedType] = useState<SourceTypeOption | null>(null);
  const [formData, setFormData] = useState<Record<string, string>>({});
  const [error, setError] = useState<string | null>(null);

  // Discovery state
  const [discoverUrl, setDiscoverUrl] = useState("");
  const [isDiscovering, setIsDiscovering] = useState(false);
  const [discoveryResult, setDiscoveryResult] = useState<DiscoveryResult | null>(null);
  const [discoveryError, setDiscoveryError] = useState<string | null>(null);

  const handleTypeSelect = (type: SourceTypeOption) => {
    setSelectedType(type);
    setFormData({});
    setError(null);
    setMode("type-form");
  };

  const handleInputChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleDiscover = async () => {
    if (!discoverUrl.trim()) {
      setDiscoveryError("Ange en URL");
      return;
    }

    setIsDiscovering(true);
    setDiscoveryError(null);
    setDiscoveryResult(null);

    try {
      const res = await fetch(`/api/discover?url=${encodeURIComponent(discoverUrl.trim())}`);
      const data = await res.json();

      if (!res.ok) {
        setDiscoveryError(data.error || "Kunde inte analysera URL");
        return;
      }

      setDiscoveryResult(data);

      if (data.feedCount === 0) {
        setDiscoveryError("Inga RSS-flöden hittades på denna sida");
      }
    } catch {
      setDiscoveryError("Något gick fel vid analys av URL");
    } finally {
      setIsDiscovering(false);
    }
  };

  const handleAddDiscoveredFeed = (feed: DiscoveredFeed) => {
    const domain = discoveryResult?.domain || "unknown";
    const color = getColorForDomain(domain);

    // For RSSHub feeds, use the appropriate type
    const isRsshub = feed.source === "rsshub";

    const config: FeedConfig = {
      id: generateFeedId(),
      name: feed.title || `${domain} Feed`,
      url: feed.url,
      type: isRsshub ? "rsshub" : "rss",
      category: "general",
      color,
      enabled: true,
      tags: [],
      ...(isRsshub && { options: { route: feed.url } }),
    };

    onAdd(config);
    // Don't close - allow adding more feeds
    setDiscoveryResult((prev) =>
      prev
        ? {
            ...prev,
            feeds: prev.feeds.filter((f) => f.url !== feed.url),
            feedCount: prev.feedCount - 1,
          }
        : null
    );
  };

  const handleSubmit = () => {
    if (!selectedType) return;

    // Validate required fields
    for (const field of selectedType.fields) {
      if (field.required && !formData[field.name]) {
        setError(`${field.label} är obligatoriskt`);
        return;
      }
    }

    // Build the feed config based on type
    let config: FeedConfig;

    switch (selectedType.type) {
      case "rss":
        config = {
          id: generateFeedId(),
          name: formData.name,
          url: formData.url,
          type: "rss",
          category: "general",
          color: selectedType.color,
          enabled: true,
          tags: [],
        };
        break;

      case "twitter":
        config = {
          id: generateFeedId(),
          name: formData.name || `Twitter: @${formData.username}`,
          url: `/twitter/user/${formData.username}`,
          type: "twitter",
          category: "general",
          color: selectedType.color,
          enabled: true,
          tags: ["sociala-medier"],
          options: { username: formData.username, type: "user" },
        };
        break;

      case "linkedin":
        config = {
          id: generateFeedId(),
          name: formData.name || `LinkedIn: ${formData.company}`,
          url: `/linkedin/company/${formData.company}/posts`,
          type: "linkedin",
          category: "business",
          color: selectedType.color,
          enabled: true,
          tags: ["sociala-medier"],
          options: { company: formData.company },
        };
        break;

      case "instagram":
        config = {
          id: generateFeedId(),
          name: formData.name || `Instagram: @${formData.username}`,
          url: `/picuki/profile/${formData.username}`,
          type: "instagram",
          category: "general",
          color: selectedType.color,
          enabled: true,
          tags: ["sociala-medier"],
          options: { username: formData.username },
        };
        break;

      case "facebook":
        config = {
          id: generateFeedId(),
          name: formData.name || `Facebook: ${formData.page}`,
          url: `/facebook/page/${formData.page}`,
          type: "facebook",
          category: "general",
          color: selectedType.color,
          enabled: true,
          tags: ["sociala-medier"],
          options: { page: formData.page, type: "page" },
        };
        break;

      case "telegram":
        config = {
          id: generateFeedId(),
          name: formData.name || `Telegram: ${formData.channel}`,
          url: `/telegram/channel/${formData.channel}`,
          type: "telegram",
          category: "general",
          color: selectedType.color,
          enabled: true,
          tags: ["sociala-medier"],
          options: { channel: formData.channel },
        };
        break;

      case "youtube":
        config = {
          id: generateFeedId(),
          name: formData.name || `YouTube: ${formData.channelId}`,
          url: formData.channelId,
          type: "youtube",
          category: "general",
          color: selectedType.color,
          enabled: true,
          tags: ["video"],
          options: { channelId: formData.channelId },
        };
        break;

      case "reddit":
        config = {
          id: generateFeedId(),
          name: formData.name || `r/${formData.subreddit}`,
          url: formData.subreddit,
          type: "reddit",
          category: "general",
          color: selectedType.color,
          enabled: true,
          tags: ["reddit"],
          options: { sort: "hot" },
        };
        break;

      case "github":
        config = {
          id: generateFeedId(),
          name: formData.name || formData.repo,
          url: formData.repo,
          type: "github",
          category: "technology",
          color: selectedType.color,
          enabled: true,
          tags: ["utveckling"],
          options: { type: "releases" },
        };
        break;

      default:
        return;
    }

    onAdd(config);
    handleClose();
  };

  const handleBack = () => {
    if (mode === "type-form") {
      setMode("type-select");
      setSelectedType(null);
      setFormData({});
      setError(null);
    } else if (mode === "type-select") {
      setMode("discover");
    }
  };

  const handleClose = () => {
    onClose();
    setMode("discover");
    setSelectedType(null);
    setFormData({});
    setError(null);
    setDiscoverUrl("");
    setDiscoveryResult(null);
    setDiscoveryError(null);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
        <CardHeader className="flex-shrink-0 border-b">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-xl">
                {mode === "discover" && "Lägg till källa"}
                {mode === "type-select" && "Välj typ"}
                {mode === "type-form" && selectedType && `Lägg till ${selectedType.name}`}
              </CardTitle>
              <CardDescription>
                {mode === "discover" && "Klistra in en URL för att hitta RSS-flöden automatiskt"}
                {mode === "type-select" && "Välj vilken typ av källa du vill lägga till"}
                {mode === "type-form" && selectedType && selectedType.description}
              </CardDescription>
            </div>
            <Button variant="ghost" size="sm" onClick={handleClose}>
              <X className="w-4 h-4" />
            </Button>
          </div>
        </CardHeader>

        <CardContent className="flex-1 overflow-y-auto py-6">
          {/* Discover Mode */}
          {mode === "discover" && (
            <div className="space-y-6">
              {/* URL Input */}
              <div className="space-y-3">
                <div className="flex gap-2">
                  <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/70" />
                    <Input
                      placeholder="Klistra in URL (t.ex. dn.se, twitter.com/username)"
                      value={discoverUrl}
                      onChange={(e) => setDiscoverUrl(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && handleDiscover()}
                      className="pl-10"
                    />
                  </div>
                  <Button onClick={handleDiscover} disabled={isDiscovering}>
                    {isDiscovering ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Sparkles className="w-4 h-4" />
                    )}
                    <span className="ml-2">Hitta flöden</span>
                  </Button>
                </div>

                {discoveryError && (
                  <p className="text-sm text-red-500">{discoveryError}</p>
                )}
              </div>

              {/* Discovery Results */}
              {discoveryResult && discoveryResult.feeds.length > 0 && (
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-green-600 border-green-600">
                      {discoveryResult.feedCount} flöden hittade
                    </Badge>
                    <span className="text-sm text-muted-foreground">på {discoveryResult.domain}</span>
                  </div>

                  <div className="space-y-2 max-h-64 overflow-y-auto">
                    {discoveryResult.feeds.map((feed, i) => (
                      <div
                        key={i}
                        className="flex items-center justify-between p-3 bg-secondary/60 dark:bg-gray-800 rounded-lg"
                      >
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="font-medium truncate">{feed.title}</span>
                            <Badge
                              variant="secondary"
                              className="text-xs"
                            >
                              {feed.source === "rsshub" ? "RSSHub" : feed.type.toUpperCase()}
                            </Badge>
                          </div>
                          <p className="text-xs text-muted-foreground truncate mt-0.5">
                            {feed.url}
                          </p>
                        </div>
                        <div className="flex items-center gap-2 ml-2">
                          <a
                            href={feed.source === "rsshub" ? `https://rsshub.app${feed.url}` : feed.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-muted-foreground/70 hover:text-muted-foreground"
                          >
                            <ExternalLink className="w-4 h-4" />
                          </a>
                          <Button
                            size="sm"
                            onClick={() => handleAddDiscoveredFeed(feed)}
                          >
                            <Plus className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Divider */}
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-card px-2 text-muted-foreground">
                    eller lägg till manuellt
                  </span>
                </div>
              </div>

              {/* Manual Type Selection Button */}
              <Button
                variant="outline"
                className="w-full"
                onClick={() => setMode("type-select")}
              >
                Välj typ av källa manuellt
              </Button>
            </div>
          )}

          {/* Type Selection Mode */}
          {mode === "type-select" && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                {sourceTypes.map((type) => (
                  <button
                    key={type.type}
                    onClick={() => handleTypeSelect(type)}
                    className="flex items-center gap-4 p-4 border rounded-lg hover:bg-secondary/60 dark:hover:bg-gray-800 transition-colors text-left"
                  >
                    <div
                      className="w-12 h-12 rounded-full flex items-center justify-center text-white"
                      style={{ backgroundColor: type.color }}
                    >
                      {type.icon}
                    </div>
                    <div>
                      <h3 className="font-medium">{type.name}</h3>
                      <p className="text-sm text-muted-foreground">{type.description}</p>
                    </div>
                  </button>
                ))}
              </div>

              <Button variant="outline" onClick={handleBack} className="mt-4">
                Tillbaka
              </Button>
            </div>
          )}

          {/* Type Form Mode */}
          {mode === "type-form" && selectedType && (
            <div className="space-y-4">
              <div className="flex items-center gap-3 mb-6">
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center text-white"
                  style={{ backgroundColor: selectedType.color }}
                >
                  {selectedType.icon}
                </div>
                <Badge style={{ backgroundColor: selectedType.color }}>
                  {selectedType.name}
                </Badge>
              </div>

              {selectedType.fields.map((field) => (
                <div key={field.name} className="space-y-2">
                  <Label htmlFor={field.name}>
                    {field.label}
                    {field.required && <span className="text-red-500 ml-1">*</span>}
                  </Label>
                  <Input
                    id={field.name}
                    placeholder={field.placeholder}
                    value={formData[field.name] || ""}
                    onChange={(e) => handleInputChange(field.name, e.target.value)}
                  />
                </div>
              ))}

              {error && (
                <p className="text-sm text-red-500">{error}</p>
              )}

              <div className="flex gap-2 pt-4">
                <Button variant="outline" onClick={handleBack}>
                  Tillbaka
                </Button>
                <Button onClick={handleSubmit}>
                  <Plus className="w-4 h-4 mr-2" />
                  Lägg till
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
