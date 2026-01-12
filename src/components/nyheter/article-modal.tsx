"use client";

import { useEffect, useMemo, useState } from "react";
import { X, ExternalLink, Bookmark, BookmarkCheck, Share2 } from "lucide-react";
import { stripHtml } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface Article {
  id: string;
  url: string;
  title: string;
  description: string | null;
  content?: string | null;
  imageUrl: string | null;
  mediaThumbnail?: string | null;
  publishedAt: Date | string;
  sourceName: string;
  sourceId: string;
  sourceType: string;
  sourceColor: string | null;
  isRead: boolean;
  isBookmarked: boolean;
  author?: string | null;
}

interface ArticleModalProps {
  article: Article;
  onClose: () => void;
  onBookmark?: (id: string) => void;
  onRead?: (id: string) => void;
  onFollowTopic?: (term: string) => Promise<boolean>;
  onIgnoreTopic?: (term: string) => Promise<boolean>;
  onIgnoreSource?: (sourceId: string) => Promise<boolean>;
}

export function ArticleModal({
  article,
  onClose,
  onBookmark,
  onRead,
  onFollowTopic,
  onIgnoreTopic,
  onIgnoreSource,
}: ArticleModalProps) {
  const [topicMode, setTopicMode] = useState<"follow" | "ignore" | null>(null);
  const [topicTerm, setTopicTerm] = useState("");
  const [topicError, setTopicError] = useState<string | null>(null);
  const [isSavingTopic, setIsSavingTopic] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, []);

  const heroImage = article.mediaThumbnail || article.imageUrl;

  const contentText = useMemo(() => {
    const raw = article.content || article.description || "";
    const withBreaks = raw
      .replace(/<\s*br\s*\/?>/gi, "\n")
      .replace(/<\/p>/gi, "\n\n");
    return stripHtml(withBreaks);
  }, [article.content, article.description]);

  const hasContent = contentText.length > 0;

  const handleBookmark = () => {
    onBookmark?.(article.id);
  };

  const handleMarkAsRead = () => {
    if (!article.isRead) {
      onRead?.(article.id);
    }
  };

  const handleOpenExternal = () => {
    handleMarkAsRead();
    window.open(article.url, "_blank");
  };

  const handleShare = () => {
    navigator.share?.({ url: article.url, title: article.title });
  };

  const handleIgnoreSource = async () => {
    if (!onIgnoreSource) return;
    await onIgnoreSource(article.sourceId);
  };

  const handleTopicSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!topicTerm.trim()) return;
    setTopicError(null);
    setIsSavingTopic(true);
    try {
      if (topicMode === "follow") {
        const ok = await onFollowTopic?.(topicTerm.trim());
        if (!ok) {
          setTopicError("Kunde inte följa ämnet");
        }
      } else if (topicMode === "ignore") {
        const ok = await onIgnoreTopic?.(topicTerm.trim());
        if (!ok) {
          setTopicError("Kunde inte ignorera ämnet");
        }
      }
      setTopicTerm("");
      setTopicMode(null);
    } catch {
      setTopicError("Något gick fel");
    } finally {
      setIsSavingTopic(false);
    }
  };

  const publishedAt = new Date(article.publishedAt);
  const publishedLabel = Number.isNaN(publishedAt.getTime())
    ? "Okänt datum"
    : publishedAt.toLocaleString("sv-SE", {
        weekday: "short",
        day: "numeric",
        month: "short",
        hour: "2-digit",
        minute: "2-digit",
      });

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="w-full max-w-3xl max-h-[85vh] bg-background rounded-2xl shadow-2xl border border-border overflow-hidden animate-scaleIn">
        <div className="flex items-center justify-between px-5 sm:px-6 py-4 border-b border-border/60">
          <div className="flex items-center gap-2 text-xs sm:text-sm text-muted-foreground">
            <span className="font-medium text-foreground">{article.sourceName}</span>
            <span>•</span>
            <span>{publishedLabel}</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleShare}
              className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
              title="Dela"
            >
              <Share2 className="w-4 h-4" />
            </button>
            <button
              onClick={handleBookmark}
              className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
              title={article.isBookmarked ? "Ta bort Läs senare" : "Läs senare"}
            >
              {article.isBookmarked ? <BookmarkCheck className="w-4 h-4" /> : <Bookmark className="w-4 h-4" />}
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
              title="Stäng"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="overflow-y-auto max-h-[calc(85vh-64px)]">
          {heroImage && (
            <div className="w-full max-h-80 overflow-hidden bg-secondary">
              <img
                src={heroImage}
                alt=""
                className="w-full h-full object-cover"
                loading="lazy"
                decoding="async"
              />
            </div>
          )}
          <div className="p-5 sm:p-6 space-y-4">
            <h2 className="text-lg sm:text-xl font-semibold leading-snug text-foreground">
              {article.title}
            </h2>
            {article.author && (
              <div className="text-xs text-muted-foreground">
                Av {article.author}
              </div>
            )}

            {hasContent ? (
              <p className="text-sm sm:text-[15px] leading-relaxed whitespace-pre-wrap text-foreground/90">
                {contentText}
              </p>
            ) : (
              <div className="text-sm text-muted-foreground italic">
                Inget innehåll tillgängligt i flödet ännu.
              </div>
            )}

            <div className="flex flex-wrap gap-2 pt-2">
              <Button onClick={handleOpenExternal} className="gap-2">
                Läs hos källa
                <ExternalLink className="w-4 h-4" />
              </Button>
              <Button variant="outline" onClick={handleMarkAsRead}>
                Markera som läst
              </Button>
              <Button variant="outline" onClick={handleIgnoreSource}>
                Ignorera källa
              </Button>
            </div>

            <div className="flex flex-wrap gap-2">
              <Button variant="outline" size="sm" onClick={() => setTopicMode("follow")}>
                Följ ämne
              </Button>
              <Button variant="outline" size="sm" onClick={() => setTopicMode("ignore")}>
                Ignorera ämne
              </Button>
            </div>

            {topicMode && (
              <form onSubmit={handleTopicSubmit} className="flex flex-wrap gap-2 items-center">
                <Input
                  value={topicTerm}
                  onChange={(e) => setTopicTerm(e.target.value)}
                  placeholder={topicMode === "follow" ? "Ämne att följa" : "Ämne att ignorera"}
                  className="w-full sm:w-64"
                />
                <Button type="submit" size="sm" disabled={isSavingTopic || !topicTerm.trim()}>
                  {isSavingTopic ? "Sparar..." : "Spara"}
                </Button>
                <Button type="button" variant="ghost" size="sm" onClick={() => setTopicMode(null)}>
                  Avbryt
                </Button>
                {topicError && (
                  <span className="text-xs text-destructive">{topicError}</span>
                )}
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
