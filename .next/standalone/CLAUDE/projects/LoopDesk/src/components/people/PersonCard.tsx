"use client";

import { useState } from "react";
import Link from "next/link";
import { Bookmark, Share2, ExternalLink, MapPin } from "lucide-react";

export type PersonType = "EXECUTIVE" | "BOARD_MEMBER" | "FOUNDER" | "INVESTOR" | "OWNER";

interface PersonCardProps {
  id: string;
  name: string;
  firstName?: string;
  lastName?: string;
  title?: string;
  location?: string;
  imageUrl?: string;
  personType: PersonType;
  totalCompanies: number;
  totalBoardSeats: number;
  activeCompanies: number;
  companies?: { name: string; role: string; isCeo?: boolean }[];
  viewMode?: "grid" | "list";
}

const typeConfig: Record<PersonType, { label: string; bg: string; icon: string }> = {
  EXECUTIVE: { label: "VD", bg: "bg-accent text-white", icon: "VD" },
  BOARD_MEMBER: { label: "Styrelse", bg: "bg-[#b8860b] text-white", icon: "ST" },
  FOUNDER: { label: "Grundare", bg: "bg-[#8b5cf6] text-white", icon: "GR" },
  INVESTOR: { label: "Investerare", bg: "bg-[#10b981] text-white", icon: "IN" },
  OWNER: { label: "Agare", bg: "bg-[#6366f1] text-white", icon: "AG" },
};

function getInitials(name: string, firstName?: string, lastName?: string): string {
  if (firstName && lastName) {
    return `${firstName[0]}${lastName[0]}`.toUpperCase();
  }
  const parts = name.split(" ");
  if (parts.length >= 2) {
    return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
  }
  return name.substring(0, 2).toUpperCase();
}

export function PersonCard({
  id,
  name,
  firstName,
  lastName,
  title,
  location,
  imageUrl,
  personType,
  totalCompanies,
  totalBoardSeats,
  activeCompanies,
  companies = [],
  viewMode = "grid",
}: PersonCardProps) {
  const [saved, setSaved] = useState(false);
  const config = typeConfig[personType];
  const initials = getInitials(name, firstName, lastName);

  const handleSave = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setSaved(!saved);
  };

  const handleShare = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (navigator.share) {
      navigator.share({ title: name, url: window.location.href });
    }
  };

  // List view
  if (viewMode === "list") {
    return (
      <Link
        href={`/person/${id}`}
        className="person-card list-item group"
      >
        <div className="card-actions">
          <button
            className={`card-action-btn ${saved ? "saved" : ""}`}
            onClick={handleSave}
          >
            <Bookmark size={14} fill={saved ? "currentColor" : "none"} />
          </button>
        </div>

        <div className="person-avatar-section">
          <div className="person-avatar">
            {imageUrl ? (
              <img src={imageUrl} alt={name} />
            ) : (
              <span className="initials">{initials}</span>
            )}
            <div className={`person-type-badge ${personType.toLowerCase()}`}>
              <span className="text-[9px] font-bold">{config.icon}</span>
            </div>
          </div>
        </div>

        <div className="person-info">
          <h3 className="person-name">{name}</h3>
          {title && <p className="person-title">{title}</p>}
          {location && (
            <span className="person-location">
              <MapPin size={12} />
              {location}
            </span>
          )}
        </div>

        <div className="person-stats">
          <div className="person-stat">
            <span className="person-stat-value">{totalCompanies}</span>
            <span className="person-stat-label">Bolag</span>
          </div>
          <div className="person-stat">
            <span className="person-stat-value">{totalBoardSeats}</span>
            <span className="person-stat-label">Styrelser</span>
          </div>
        </div>
      </Link>
    );
  }

  // Grid view
  return (
    <Link
      href={`/person/${id}`}
      className="person-card group"
    >
      <div className="card-actions">
        <button
          className={`card-action-btn ${saved ? "saved" : ""}`}
          onClick={handleSave}
        >
          <Bookmark size={14} fill={saved ? "currentColor" : "none"} />
        </button>
        <button className="card-action-btn" onClick={handleShare}>
          <Share2 size={14} />
        </button>
        <button className="card-action-btn">
          <ExternalLink size={14} />
        </button>
      </div>

      <div className="person-avatar-section">
        <div className="person-avatar">
          {imageUrl ? (
            <img src={imageUrl} alt={name} />
          ) : (
            <span className="initials">{initials}</span>
          )}
          <div className={`person-type-badge ${personType.toLowerCase()}`}>
            <span className="text-[9px] font-bold">{config.icon}</span>
          </div>
        </div>
        <h3 className="person-name">{name}</h3>
        {title && <p className="person-title">{title}</p>}
        {location && (
          <span className="person-location">
            <MapPin size={12} />
            {location}
          </span>
        )}
      </div>

      <div className="person-stats">
        <div className="person-stat">
          <span className="person-stat-value">{totalCompanies}</span>
          <span className="person-stat-label">Bolag</span>
        </div>
        <div className="person-stat">
          <span className="person-stat-value">{totalBoardSeats}</span>
          <span className="person-stat-label">Styrelser</span>
        </div>
        <div className="person-stat">
          <span className="person-stat-value">{activeCompanies}</span>
          <span className="person-stat-label">Aktiva</span>
        </div>
      </div>

      {companies.length > 0 && (
        <div className="person-companies">
          {companies.slice(0, 3).map((company, i) => (
            <span
              key={i}
              className={`person-company-tag ${company.isCeo ? "ceo-role" : ""}`}
            >
              <span className="role-indicator" />
              {company.name}
            </span>
          ))}
          {companies.length > 3 && (
            <span className="person-company-tag">
              +{companies.length - 3}
            </span>
          )}
        </div>
      )}
    </Link>
  );
}

export function PersonCardSkeleton({ viewMode = "grid" }: { viewMode?: "grid" | "list" }) {
  if (viewMode === "list") {
    return (
      <div className="skeleton-card flex items-center gap-5 p-4">
        <div className="skeleton skeleton-avatar w-14 h-14" />
        <div className="flex-1 space-y-2">
          <div className="skeleton h-4 w-32" />
          <div className="skeleton h-3 w-24" />
        </div>
      </div>
    );
  }

  return (
    <div className="skeleton-card">
      <div className="skeleton-avatar-section">
        <div className="skeleton skeleton-avatar" />
        <div className="skeleton skeleton-name" />
        <div className="skeleton skeleton-title" />
        <div className="skeleton skeleton-location" />
      </div>
      <div className="skeleton-stats">
        <div className="skeleton skeleton-stat" />
        <div className="skeleton skeleton-stat" />
        <div className="skeleton skeleton-stat" />
      </div>
    </div>
  );
}
