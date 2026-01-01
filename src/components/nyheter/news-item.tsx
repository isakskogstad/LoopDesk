"use client";

import { ExternalLink, Clock, BookOpen } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatRelativeTime } from "@/lib/utils";
import type { NewsItem } from "@/lib/nyheter/types";

interface NewsItemCardProps {
  item: NewsItem;
  onReadMore?: () => void;
}

export function NewsItemCard({ item, onReadMore }: NewsItemCardProps) {
  return (
    <Card className="hover:shadow-md transition-shadow py-4">
      <CardContent className="p-0">
        <div className="flex gap-4">
          {/* Image */}
          {item.imageUrl && (
            <div className="flex-shrink-0 w-24 h-24 overflow-hidden rounded-lg">
              <img
                src={item.imageUrl}
                alt=""
                className="w-full h-full object-cover"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = "none";
                }}
              />
            </div>
          )}

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              <Badge
                variant="outline"
                style={{
                  borderColor: item.source.color,
                  color: item.source.color,
                }}
              >
                {item.source.name}
              </Badge>
              <span className="text-xs text-gray-500 flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {formatRelativeTime(item.publishedAt)}
              </span>
              {item.matchedFilters && item.matchedFilters.length > 0 && (
                <Badge variant="secondary" className="text-xs">
                  Markerad
                </Badge>
              )}
            </div>

            <a
              href={item.url}
              target="_blank"
              rel="noopener noreferrer"
              className="block group"
            >
              <h3 className="font-semibold text-gray-900 dark:text-white line-clamp-2 group-hover:text-blue-600 transition-colors">
                {item.title}
              </h3>
            </a>

            {item.description && (
              <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2 mt-1">
                {item.description}
              </p>
            )}

            <div className="flex items-center gap-2 mt-2">
              {item.tags?.slice(0, 3).map((tag, i) => (
                <span
                  key={i}
                  className="text-xs text-gray-500 bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded"
                >
                  {tag}
                </span>
              ))}

              <div className="ml-auto flex items-center gap-2">
                {onReadMore && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.preventDefault();
                      onReadMore();
                    }}
                    className="text-xs"
                  >
                    <BookOpen className="w-3 h-3 mr-1" />
                    Läs mer
                  </Button>
                )}
                <a
                  href={item.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-400 hover:text-gray-600"
                >
                  <ExternalLink className="w-4 h-4" />
                </a>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
