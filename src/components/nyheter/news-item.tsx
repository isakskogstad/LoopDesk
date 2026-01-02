"use client";

import { useState } from "react";
import { ExternalLink, Clock, ChevronRight, Bookmark } from "lucide-react";
import { formatPublicationTime, stripHtml } from "@/lib/utils";
import type { NewsItem } from "@/lib/nyheter/types";

interface NewsItemCardProps {
  item: NewsItem;
  onReadMore?: () => void;
}

// Source logo URLs - direct SVG/PNG logos for better quality
const SOURCE_LOGOS: Record<string, string> = {
  "di": "https://www.di.se/static/icons/favicon-32x32.png",
  "svd": "https://www.svd.se/omni-assets/svd/icons/apple-touch-icon-180x180.png",
  "dn": "https://cached-images.bonnier.news/gcs/dn-revamp/content/images/branding/DN_social.jpg",
  "breakit": "https://www.breakit.se/assets/breakit-favicon-32x32.png",
  "nyteknik": "https://www.nyteknik.se/apple-touch-icon.png",
  "computersweden": "https://computersweden.se/apple-touch-icon.png",
  "realtid": "https://www.realtid.se/apple-touch-icon.png",
  "tn": "https://tn.se/apple-touch-icon.png",
  "sifted": "https://sifted.eu/apple-touch-icon.png",
  "eu-startups": "https://www.eu-startups.com/wp-content/uploads/2020/02/cropped-eu-startups-favicon-192x192.png",
  "arcticstartup": "https://arcticstartup.com/wp-content/uploads/2023/01/cropped-as-icon-192x192.png",
  "techfundingnews": "https://techfundingnews.com/wp-content/uploads/2021/03/cropped-logo-192x192.png",
  "aftonbladet": "https://www.aftonbladet.se/static/icons/apple-touch-icon.png",
  "expressen": "https://www.expressen.se/static/icons/apple-touch-icon.png",
  "svt": "https://www.svt.se/nyheter/images/svt-news-apple-touch-icon.png",
  "sr": "https://www.sverigesradio.se/images/apple-touch-icon.png",
};

// Fallback to Google favicon service
const SOURCE_DOMAINS: Record<string, string> = {
  "di": "di.se",
  "svd": "svd.se",
  "dn": "dn.se",
  "breakit": "breakit.se",
  "nyteknik": "nyteknik.se",
  "computersweden": "computersweden.se",
  "realtid": "realtid.se",
  "tn": "tn.se",
  "sifted": "sifted.eu",
  "eu-startups": "eu-startups.com",
  "arcticstartup": "arcticstartup.com",
  "techfundingnews": "techfundingnews.com",
  "aftonbladet": "aftonbladet.se",
  "expressen": "expressen.se",
  "svt": "svt.se",
  "sr": "sverigesradio.se",
};

// Get logo URL - try direct logo first, then Google favicon, or use source's logoUrl
function getSourceLogoUrl(sourceId: string, sourceUrl?: string, logoUrl?: string): string | null {
  // First priority: use the source's logoUrl if provided
  if (logoUrl) {
    return logoUrl;
  }

  // Try direct logo mapping
  if (SOURCE_LOGOS[sourceId]) {
    return SOURCE_LOGOS[sourceId];
  }

  // Fallback to Google favicon service using source domain
  const domain = SOURCE_DOMAINS[sourceId];
  if (domain) {
    return `https://www.google.com/s2/favicons?domain=${domain}&sz=128`;
  }

  // Last resort: extract domain from sourceUrl
  if (sourceUrl) {
    try {
      const url = new URL(sourceUrl);
      return `https://www.google.com/s2/favicons?domain=${url.hostname}&sz=128`;
    } catch {
      // Invalid URL, return null
    }
  }

  return null;
}

// Fallback initials for sources without logos
function getSourceInitials(name: string): string {
  return name
    .split(" ")
    .map(word => word[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

export function NewsItemCard({ item, onReadMore }: NewsItemCardProps) {
  const [imageError, setImageError] = useState(false);
  const [logoError, setLogoError] = useState(false);

  const logoUrl = getSourceLogoUrl(item.source.id, item.source.url, item.source.logoUrl);
  const hasImage = item.imageUrl && !imageError;

  const handleLogoError = () => {
    setLogoError(true);
  };

  const currentLogoUrl = logoUrl;

  return (
    <article className="group relative bg-white dark:bg-[#111] rounded-2xl border border-gray-100 dark:border-[#222] overflow-hidden hover:border-gray-200 dark:hover:border-[#333] hover:shadow-xl hover:shadow-black/5 dark:hover:shadow-black/20 transition-all duration-300">
      <div className="flex">
        {/* Main Content */}
        <div className="flex-1 p-5 sm:p-6">
          {/* Source Header - Compact */}
          <div className="flex items-center gap-3 mb-4">
            {/* Source Logo - Rounded with subtle shadow */}
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center overflow-hidden flex-shrink-0 shadow-sm"
              style={{
                backgroundColor: logoError || !currentLogoUrl ? item.source.color : "#f8f8f8",
              }}
            >
              {currentLogoUrl && !logoError ? (
                <img
                  src={currentLogoUrl}
                  alt={item.source.name}
                  className="w-full h-full object-cover"
                  onError={handleLogoError}
                  crossOrigin="anonymous"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <span className="text-white text-sm font-bold tracking-tight">
                  {getSourceInitials(item.source.name)}
                </span>
              )}
            </div>

            <div className="flex-1 min-w-0">
              <span
                className="font-semibold text-sm block truncate"
                style={{ color: item.source.color }}
              >
                {item.source.name}
              </span>
              <div className="flex items-center gap-1.5 text-xs text-gray-400 dark:text-gray-500 mt-0.5">
                <Clock className="w-3 h-3" />
                <span>{formatPublicationTime(item.publishedAt)}</span>
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <a
                href={item.url}
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 dark:hover:bg-[#222] transition-colors"
                onClick={(e) => e.stopPropagation()}
              >
                <ExternalLink className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Title - Larger and bolder */}
          <a
            href={item.url}
            target="_blank"
            rel="noopener noreferrer"
            className="block"
          >
            <h3 className="font-bold text-gray-900 dark:text-white text-lg sm:text-xl leading-tight mb-2.5 group-hover:text-[#6366f1] transition-colors duration-200 line-clamp-2">
              {stripHtml(item.title)}
            </h3>
          </a>

          {/* Description - More readable */}
          {item.description && (
            <p className="text-gray-500 dark:text-gray-400 text-sm sm:text-base leading-relaxed line-clamp-2 mb-4">
              {stripHtml(item.description)}
            </p>
          )}

          {/* Footer - Author, Tags & Actions */}
          <div className="flex items-center justify-between pt-2 border-t border-gray-50 dark:border-[#1a1a1a]">
            <div className="flex items-center gap-2 flex-wrap">
              {item.author && (
                <span className="text-xs text-gray-400 dark:text-gray-500">
                  {item.author}
                </span>
              )}
              {item.tags?.slice(0, 2).map((tag, i) => {
                const tagText = typeof tag === "string" ? tag : String(tag);
                return (
                  <span
                    key={i}
                    className="text-xs text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-[#1a1a1a] px-2.5 py-1 rounded-full font-medium"
                  >
                    {stripHtml(tagText)}
                  </span>
                );
              })}
            </div>

            {/* Read more button - Pill style */}
            {onReadMore && (
              <button
                onClick={(e) => {
                  e.preventDefault();
                  onReadMore();
                }}
                className="flex items-center gap-1 text-sm text-[#6366f1] hover:text-[#4f46e5] font-semibold transition-colors"
              >
                <span>Läs mer</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Image - With gradient overlay */}
        {hasImage && (
          <a
            href={item.url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-shrink-0 w-44 sm:w-52 hidden sm:block relative"
          >
            <img
              src={item.imageUrl}
              alt=""
              className="absolute inset-0 w-full h-full object-cover"
              onError={() => setImageError(true)}
            />
            {/* Smooth gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-r from-white/80 dark:from-[#111]/80 via-transparent to-transparent" />
          </a>
        )}
      </div>

      {/* Accent line on hover */}
      <div
        className="absolute left-0 top-0 bottom-0 w-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
        style={{ backgroundColor: item.source.color }}
      />
    </article>
  );
}
