"use client";

import { useState } from "react";
import { Rss } from "lucide-react";
import { cn } from "@/lib/utils";

interface SourceIconProps {
  url?: string;
  sourceName: string;
  size?: "sm" | "md" | "lg";
  className?: string;
}

// Known sources with custom icons
const knownSources: Record<string, string> = {
  "Dagens Industri": "di.se",
  "Svenska Dagbladet": "svd.se",
  "Aftonbladet": "aftonbladet.se",
  "Expressen": "expressen.se",
  "SVT Nyheter": "svt.se",
  "DN": "dn.se",
  "Breakit": "breakit.se",
  "Realtid": "realtid.se",
  "Privata Affärer": "privataaffarer.se",
  "E24": "e24.no",
  "Bloomberg": "bloomberg.com",
  "Reuters": "reuters.com",
  "Financial Times": "ft.com",
  "The Wall Street Journal": "wsj.com",
  "TechCrunch": "techcrunch.com",
  "Wired": "wired.com",
  "Ars Technica": "arstechnica.com",
  "The Verge": "theverge.com",
  "Hacker News": "news.ycombinator.com",
};

function getDomain(url?: string, sourceName?: string): string | null {
  // Try known sources first
  if (sourceName && knownSources[sourceName]) {
    return knownSources[sourceName];
  }

  // Try to extract from URL
  if (url) {
    try {
      return new URL(url).hostname;
    } catch {
      return null;
    }
  }

  return null;
}

const sizeClasses = {
  sm: "w-4 h-4",
  md: "w-6 h-6",
  lg: "w-8 h-8",
};

const iconSizeClasses = {
  sm: "w-2.5 h-2.5",
  md: "w-3.5 h-3.5",
  lg: "w-4 h-4",
};

export function SourceIcon({
  url,
  sourceName,
  size = "md",
  className,
}: SourceIconProps) {
  const [hasError, setHasError] = useState(false);
  const domain = getDomain(url, sourceName);

  // Use higher quality favicon service
  const faviconUrl = domain
    ? `https://www.google.com/s2/favicons?domain=${domain}&sz=64`
    : null;

  if (!faviconUrl || hasError) {
    // Fallback to initials
    const initial = sourceName?.charAt(0).toUpperCase() || "?";
    return (
      <div
        className={cn(
          sizeClasses[size],
          "source-icon-fallback rounded-md bg-secondary flex items-center justify-center",
          className
        )}
      >
        <span className="text-[10px] font-bold text-muted-foreground">
          {initial}
        </span>
      </div>
    );
  }

  return (
    <div
      className={cn(
        sizeClasses[size],
        "source-icon rounded-md overflow-hidden bg-secondary",
        className
      )}
    >
      <img
        src={faviconUrl}
        alt={sourceName || "Source"}
        className="w-full h-full object-cover"
        onError={() => setHasError(true)}
        loading="lazy"
      />
    </div>
  );
}

// Simple fallback icon
export function SourceIconFallback({
  size = "md",
  className,
}: {
  size?: "sm" | "md" | "lg";
  className?: string;
}) {
  return (
    <div
      className={cn(
        sizeClasses[size],
        "rounded-md bg-secondary flex items-center justify-center",
        className
      )}
    >
      <Rss className={cn(iconSizeClasses[size], "text-muted-foreground")} />
    </div>
  );
}
