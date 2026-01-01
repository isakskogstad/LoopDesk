"use client";

import { useState } from "react";
import { ExternalLink, Clock, ChevronRight } from "lucide-react";
import { formatRelativeTime } from "@/lib/utils";
import type { NewsItem } from "@/lib/nyheter/types";

interface NewsItemCardProps {
  item: NewsItem;
  onReadMore?: () => void;
}

// Source logo mapping - using favicon URLs
const SOURCE_LOGOS: Record<string, string> = {
  "di": "https://www.di.se/favicon.ico",
  "svd": "https://www.svd.se/favicon.ico",
  "dn": "https://www.dn.se/favicon.ico",
  "breakit": "https://www.breakit.se/favicon.ico",
  "nyteknik": "https://www.nyteknik.se/favicon.ico",
  "computersweden": "https://computersweden.se/favicon.ico",
  "realtid": "https://www.realtid.se/favicon.ico",
  "tn": "https://www.tn.se/favicon.ico",
  "sifted": "https://sifted.eu/favicon.ico",
  "eu-startups": "https://www.eu-startups.com/favicon.ico",
  "arcticstartup": "https://arcticstartup.com/favicon.ico",
  "techfundingnews": "https://techfundingnews.com/favicon.ico",
  "aftonbladet": "https://www.aftonbladet.se/favicon.ico",
  "expressen": "https://www.expressen.se/favicon.ico",
};

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

  const logoUrl = SOURCE_LOGOS[item.source.id];
  const hasImage = item.imageUrl && !imageError;

  return (
    <article className="group bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 overflow-hidden hover:border-gray-200 dark:hover:border-gray-700 hover:shadow-lg transition-all duration-200">
      <div className="flex">
        {/* Main Content */}
        <div className="flex-1 p-5">
          {/* Source Header */}
          <div className="flex items-center gap-3 mb-3">
            {/* Source Logo */}
            <div
              className="w-10 h-10 rounded-full flex items-center justify-center overflow-hidden flex-shrink-0 shadow-sm"
              style={{ backgroundColor: logoError || !logoUrl ? item.source.color : "transparent" }}
            >
              {logoUrl && !logoError ? (
                <img
                  src={logoUrl}
                  alt={item.source.name}
                  className="w-6 h-6 object-contain"
                  onError={() => setLogoError(true)}
                />
              ) : (
                <span className="text-white text-xs font-bold">
                  {getSourceInitials(item.source.name)}
                </span>
              )}
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span
                  className="font-medium text-sm truncate"
                  style={{ color: item.source.color }}
                >
                  {item.source.name}
                </span>
              </div>
              <div className="flex items-center gap-1.5 text-xs text-gray-400">
                <Clock className="w-3 h-3" />
                <span>{formatRelativeTime(item.publishedAt)}</span>
              </div>
            </div>

            {/* External link icon */}
            <a
              href={item.url}
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 rounded-lg text-gray-300 hover:text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors opacity-0 group-hover:opacity-100"
              onClick={(e) => e.stopPropagation()}
            >
              <ExternalLink className="w-4 h-4" />
            </a>
          </div>

          {/* Title */}
          <a
            href={item.url}
            target="_blank"
            rel="noopener noreferrer"
            className="block"
          >
            <h3 className="font-semibold text-gray-900 dark:text-white text-lg leading-snug mb-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors line-clamp-2">
              {item.title}
            </h3>
          </a>

          {/* Description */}
          {item.description && (
            <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed line-clamp-3 mb-3">
              {item.description}
            </p>
          )}

          {/* Author & Tags */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 flex-wrap">
              {item.author && (
                <span className="text-xs text-gray-500">
                  av {item.author}
                </span>
              )}
              {item.tags?.slice(0, 2).map((tag, i) => {
                const tagText = typeof tag === "string" ? tag : String(tag);
                return (
                  <span
                    key={i}
                    className="text-xs text-gray-400 bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded-full"
                  >
                    {tagText}
                  </span>
                );
              })}
            </div>

            {/* Read more button */}
            {onReadMore && (
              <button
                onClick={(e) => {
                  e.preventDefault();
                  onReadMore();
                }}
                className="flex items-center gap-1 text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium transition-colors"
              >
                <span>Las mer</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Image */}
        {hasImage && (
          <a
            href={item.url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-shrink-0 w-48 hidden sm:block"
          >
            <div className="h-full relative">
              <img
                src={item.imageUrl}
                alt=""
                className="absolute inset-0 w-full h-full object-cover"
                onError={() => setImageError(true)}
              />
              <div className="absolute inset-0 bg-gradient-to-l from-transparent to-white/20 dark:to-gray-900/20" />
            </div>
          </a>
        )}
      </div>
    </article>
  );
}
