"use client";

import { useState } from "react";
import { Bookmark, Share2, Archive, ChevronDown } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

export type CardSize = "feature" | "large" | "medium" | "compact";

interface NewsCardProps {
  id: string;
  title: string;
  lead?: string;
  category: string;
  source: string;
  sourceType?: "default" | "gov";
  timeAgo: string;
  imageUrl?: string;
  companyTag?: {
    name: string;
    watched?: boolean;
    href?: string;
  };
  size?: CardSize;
  expandableContent?: {
    paragraphs: string[];
    relatedArticles?: { title: string; href: string }[];
  };
  href?: string;
  style?: React.CSSProperties;
}

export function NewsCard({
  id,
  title,
  lead,
  category,
  source,
  sourceType = "default",
  timeAgo,
  imageUrl,
  companyTag,
  size = "medium",
  expandableContent,
  href = "#",
  style,
}: NewsCardProps) {
  const [saved, setSaved] = useState(false);
  const [expanded, setExpanded] = useState(false);

  const handleSave = (e: React.MouseEvent) => {
    e.stopPropagation();
    setSaved(!saved);
  };

  const handleShare = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (navigator.share) {
      navigator.share({ title, url: window.location.href });
    } else {
      navigator.clipboard.writeText(window.location.href);
    }
  };

  const handleArchive = (e: React.MouseEvent) => {
    e.stopPropagation();
    // Archive logic here
  };

  const handleExpand = (e: React.MouseEvent) => {
    e.stopPropagation();
    setExpanded(!expanded);
  };

  // Feature card layout
  if (size === "feature") {
    return (
      <article className="news-card-v2 feature" style={style}>
        <div className="card-hover-actions">
          <button
            className={`card-action-btn ${saved ? "saved" : ""}`}
            onClick={handleSave}
            title="Spara"
          >
            <Bookmark size={16} fill={saved ? "currentColor" : "none"} />
          </button>
          <button className="card-action-btn" onClick={handleShare} title="Dela">
            <Share2 size={16} />
          </button>
          <button className="card-action-btn" onClick={handleArchive} title="Arkivera">
            <Archive size={16} />
          </button>
        </div>

        <div className="flex flex-col justify-center py-6 relative z-10">
          <span className="category-v2">{category}</span>
          <h2 className="font-display text-4xl font-normal leading-tight text-foreground mb-5">
            {title}
          </h2>
          {lead && (
            <p className="font-serif text-xl italic leading-relaxed text-secondary-foreground mb-6">
              {lead}
            </p>
          )}

          {expandableContent && (
            <>
              <div className={`card-expand ${expanded ? "expanded" : ""}`}>
                <div className="pt-6 border-t border-border-subtle mt-6">
                  {expandableContent.paragraphs.map((p, i) => (
                    <p key={i} className="text-base leading-relaxed text-secondary-foreground mb-4">
                      {p}
                    </p>
                  ))}
                  {expandableContent.relatedArticles && (
                    <div className="flex gap-3 mt-4">
                      {expandableContent.relatedArticles.map((article, i) => (
                        <Link
                          key={i}
                          href={article.href}
                          className="flex-1 p-3 bg-muted rounded-md text-xs text-secondary-foreground hover:bg-border transition-colors"
                          onClick={(e) => e.stopPropagation()}
                        >
                          {article.title}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <button
                className={`expand-toggle ${expanded ? "expanded" : ""}`}
                onClick={handleExpand}
              >
                <span>{expanded ? "Visa mindre" : "Las mer"}</span>
                <ChevronDown size={14} />
              </button>
            </>
          )}

          <div className="card-meta-v2">
            <span className={`source-badge-v2 ${sourceType === "gov" ? "gov" : ""}`}>
              {source}
            </span>
            <span className="time-ago-v2">{timeAgo}</span>
            {companyTag && (
              <Link
                href={companyTag.href || "#"}
                className={`company-tag-v2 ${companyTag.watched ? "watched" : ""}`}
                onClick={(e) => e.stopPropagation()}
              >
                {companyTag.name}
              </Link>
            )}
          </div>
        </div>

        {imageUrl && (
          <div className="card-image-wrapper">
            <Image
              src={imageUrl}
              alt=""
              width={800}
              height={600}
              className="w-full h-full object-cover"
            />
          </div>
        )}
      </article>
    );
  }

  // Large card layout
  if (size === "large") {
    return (
      <article className="news-card-v2 large" style={style}>
        <div className="card-hover-actions">
          <button
            className={`card-action-btn ${saved ? "saved" : ""}`}
            onClick={handleSave}
            title="Spara"
          >
            <Bookmark size={16} fill={saved ? "currentColor" : "none"} />
          </button>
          <button className="card-action-btn" onClick={handleShare} title="Dela">
            <Share2 size={16} />
          </button>
        </div>

        {imageUrl && (
          <div className="card-image-wrapper">
            <Image
              src={imageUrl}
              alt=""
              width={600}
              height={400}
              className="w-full h-full object-cover"
            />
          </div>
        )}

        <div className="p-6">
          <span className="category-v2">{category}</span>
          <h2 className="font-display text-2xl font-normal text-foreground mb-3">
            {title}
          </h2>
          {lead && (
            <p className="font-serif text-base italic text-secondary-foreground">
              {lead}
            </p>
          )}
          <div className="card-meta-v2">
            <span className={`source-badge-v2 ${sourceType === "gov" ? "gov" : ""}`}>
              {source}
            </span>
            <span className="time-ago-v2">{timeAgo}</span>
            {companyTag && (
              <Link
                href={companyTag.href || "#"}
                className={`company-tag-v2 ${companyTag.watched ? "watched" : ""}`}
                onClick={(e) => e.stopPropagation()}
              >
                {companyTag.name}
              </Link>
            )}
          </div>
        </div>
      </article>
    );
  }

  // Medium card layout
  if (size === "medium") {
    return (
      <article className="news-card-v2 medium" style={style}>
        <div className="card-hover-actions">
          <button
            className={`card-action-btn ${saved ? "saved" : ""}`}
            onClick={handleSave}
            title="Spara"
          >
            <Bookmark size={16} fill={saved ? "currentColor" : "none"} />
          </button>
        </div>

        {imageUrl && (
          <div className="card-image-wrapper">
            <Image
              src={imageUrl}
              alt=""
              width={500}
              height={280}
              className="w-full h-full object-cover"
            />
          </div>
        )}

        <div className="p-5">
          <span className="category-v2">{category}</span>
          <h2 className="font-display text-xl font-normal text-foreground mb-2">
            {title}
          </h2>
          <div className="card-meta-v2">
            <span className={`source-badge-v2 ${sourceType === "gov" ? "gov" : ""}`}>
              {source}
            </span>
            {companyTag && (
              <Link
                href={companyTag.href || "#"}
                className={`company-tag-v2 ${companyTag.watched ? "watched" : ""}`}
                onClick={(e) => e.stopPropagation()}
              >
                {companyTag.name}
              </Link>
            )}
          </div>
        </div>
      </article>
    );
  }

  // Compact card layout
  return (
    <article className="news-card-v2 compact" style={style}>
      <div className="card-hover-actions">
        <button
          className={`card-action-btn ${saved ? "saved" : ""}`}
          onClick={handleSave}
          title="Spara"
        >
          <Bookmark size={16} fill={saved ? "currentColor" : "none"} />
        </button>
      </div>

      <span className="category-v2">{category}</span>
      <h2 className="font-display text-lg font-normal text-foreground mb-2">
        {title}
      </h2>
      <div className="card-meta-v2">
        <span className={`source-badge-v2 ${sourceType === "gov" ? "gov" : ""}`}>
          {source}
        </span>
        <span className="time-ago-v2">{timeAgo}</span>
      </div>
    </article>
  );
}
