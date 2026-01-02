"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { ExternalLink, Clock, ChevronRight, Bookmark, CheckCircle2 } from "lucide-react";
import { formatPublicationTime, stripHtml, cn } from "@/lib/utils";
import type { NewsItem } from "@/lib/nyheter/types";

interface NewsItemCardProps {
  item: NewsItem;
  onReadMore?: () => void;
  isRead?: boolean;
  onMarkRead?: () => void;
  index?: number;
  isBookmarked?: boolean;
  onToggleBookmark?: () => void;
  isNew?: boolean;
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

export function NewsItemCard({ item, onReadMore, isRead = false, onMarkRead, index = 0, isBookmarked = false, onToggleBookmark, isNew = false }: NewsItemCardProps) {
  const [imageError, setImageError] = useState(false);
  const [logoError, setLogoError] = useState(false);

  const logoUrl = getSourceLogoUrl(item.source.id, item.source.url, item.source.logoUrl);
  const hasImage = item.imageUrl && !imageError;

  const handleLogoError = () => {
    setLogoError(true);
  };

  const handleClick = () => {
    if (onMarkRead && !isRead) {
      onMarkRead();
    }
  };

  const currentLogoUrl = logoUrl;

  return (
    <motion.article
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: Math.min(index * 0.05, 0.3) }}
      whileHover={{ y: -4 }}
      className={cn(
        "group relative bg-white dark:bg-[#111] rounded-2xl border border-gray-100 dark:border-[#222] overflow-hidden hover:border-gray-200 dark:hover:border-[#333] hover:shadow-xl hover:shadow-black/5 dark:hover:shadow-black/20 transition-all duration-300 h-full flex flex-col",
        isRead && "opacity-60 hover:opacity-80"
      )}
    >
      {/* Image at top for grid layout */}
      {hasImage && (
        <a
          href={item.url}
          target="_blank"
          rel="noopener noreferrer"
          className="relative w-full h-48 overflow-hidden flex-shrink-0"
          onClick={handleClick}
        >
          <img
            src={item.imageUrl}
            alt=""
            className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            onError={() => setImageError(true)}
            loading="lazy"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
        </a>
      )}

      <div className="flex flex-col flex-1">
        {/* Main Content */}
        <div className="flex-1 p-5 sm:p-6 flex flex-col">
          {/* Source Header - Compact */}
          <div className="flex items-center gap-3 mb-4">
            {/* Source Logo - Rounded with subtle shadow and read indicator */}
            <div className="relative">
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
              {/* Read indicator badge */}
              {isRead && (
                <div className="absolute -bottom-1 -right-1 bg-emerald-500 rounded-full p-0.5">
                  <CheckCircle2 className="w-3 h-3 text-white" />
                </div>
              )}
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span
                  className="font-semibold text-sm block truncate"
                  style={{ color: item.source.color }}
                >
                  {item.source.name}
                </span>
                {isNew && (
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold bg-[#6366f1] text-white">
                    Ny
                  </span>
                )}
              </div>
              <div className="flex items-center gap-1.5 text-xs text-gray-400 dark:text-gray-500 mt-0.5">
                <Clock className="w-3 h-3" />
                <span>{formatPublicationTime(item.publishedAt)}</span>
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              {onToggleBookmark && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onToggleBookmark();
                  }}
                  className={cn(
                    "p-2 rounded-lg transition-colors",
                    isBookmarked
                      ? "text-[#6366f1] hover:text-[#4f46e5] hover:bg-[#6366f1]/10"
                      : "text-gray-400 hover:text-gray-600 hover:bg-gray-100 dark:hover:bg-[#222]"
                  )}
                  title={isBookmarked ? "Remove bookmark" : "Bookmark"}
                >
                  <Bookmark className={cn("w-4 h-4", isBookmarked && "fill-current")} />
                </button>
              )}
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
            onClick={handleClick}
          >
            <h3 className={cn(
              "font-bold text-lg sm:text-xl leading-tight mb-2.5 group-hover:text-[#6366f1] transition-colors duration-200 line-clamp-2",
              isRead ? "text-gray-500 dark:text-gray-500" : "text-gray-900 dark:text-white"
            )}>
              {stripHtml(item.title)}
            </h3>
          </a>

          {/* Description - More readable */}
          {item.description && (
            <p className="text-gray-500 dark:text-gray-400 text-sm sm:text-base leading-relaxed line-clamp-3 mb-4 flex-1">
              {stripHtml(item.description)}
            </p>
          )}

          {/* Footer - Author, Tags & Actions */}
          <div className="flex items-center justify-between pt-3 mt-auto border-t border-gray-50 dark:border-[#1a1a1a]">
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
                  handleClick();
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
      </div>

      {/* Accent line on hover */}
      <motion.div
        className="absolute left-0 top-0 bottom-0 w-1"
        initial={{ opacity: 0 }}
        whileHover={{ opacity: 1 }}
        transition={{ duration: 0.2 }}
        style={{ backgroundColor: item.source.color }}
      />
    </motion.article>
  );
}
