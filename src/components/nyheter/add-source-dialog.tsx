"use client";

import { useState } from "react";
import { Plus, X, Rss, Twitter, Linkedin, Instagram, Send, Youtube, Github, Globe } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { FeedConfig, SourceType } from "@/lib/nyheter/types";
import { generateFeedId } from "@/lib/nyheter/feeds";

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

interface AddSourceDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (config: FeedConfig) => void;
}

export function AddSourceDialog({ isOpen, onClose, onAdd }: AddSourceDialogProps) {
  const [selectedType, setSelectedType] = useState<SourceTypeOption | null>(null);
  const [formData, setFormData] = useState<Record<string, string>>({});
  const [error, setError] = useState<string | null>(null);

  const handleTypeSelect = (type: SourceTypeOption) => {
    setSelectedType(type);
    setFormData({});
    setError(null);
  };

  const handleInputChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
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
    const displayName = formData.name || formData.username || formData.company || formData.channel || formData.subreddit || formData.repo || "Ny källa";

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
    onClose();
    setSelectedType(null);
    setFormData({});
  };

  const handleBack = () => {
    setSelectedType(null);
    setFormData({});
    setError(null);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
        <CardHeader className="flex-shrink-0 border-b">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-xl">
                {selectedType ? `Lägg till ${selectedType.name}` : "Lägg till källa"}
              </CardTitle>
              <CardDescription>
                {selectedType
                  ? selectedType.description
                  : "Välj vilken typ av källa du vill lägga till"}
              </CardDescription>
            </div>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="w-4 h-4" />
            </Button>
          </div>
        </CardHeader>

        <CardContent className="flex-1 overflow-y-auto py-6">
          {!selectedType ? (
            // Source type selection
            <div className="grid grid-cols-2 gap-4">
              {sourceTypes.map((type) => (
                <button
                  key={type.type}
                  onClick={() => handleTypeSelect(type)}
                  className="flex items-center gap-4 p-4 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors text-left"
                >
                  <div
                    className="w-12 h-12 rounded-full flex items-center justify-center text-white"
                    style={{ backgroundColor: type.color }}
                  >
                    {type.icon}
                  </div>
                  <div>
                    <h3 className="font-medium">{type.name}</h3>
                    <p className="text-sm text-gray-500">{type.description}</p>
                  </div>
                </button>
              ))}
            </div>
          ) : (
            // Form for selected type
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
