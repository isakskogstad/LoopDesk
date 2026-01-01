import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatRelativeTime(date: Date | string): string {
  const now = new Date();
  const then = new Date(date);
  const diffMs = now.getTime() - then.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return "Just nu";
  if (diffMins < 60) return `${diffMins} min sedan`;
  if (diffHours < 24) return `${diffHours} tim sedan`;
  if (diffDays < 7) return `${diffDays} dagar sedan`;

  return then.toLocaleDateString("sv-SE", {
    day: "numeric",
    month: "short",
    year: diffDays > 365 ? "numeric" : undefined,
  });
}

/**
 * Format publication time as exact time (HH:MM) for today,
 * or date + time for older articles
 */
export function formatPublicationTime(date: Date | string): string {
  const now = new Date();
  const then = new Date(date);

  // Check if valid date
  if (isNaN(then.getTime())) {
    return "";
  }

  const isToday = then.toDateString() === now.toDateString();
  const isYesterday = new Date(now.getTime() - 86400000).toDateString() === then.toDateString();

  const timeStr = then.toLocaleTimeString("sv-SE", {
    hour: "2-digit",
    minute: "2-digit",
  });

  if (isToday) {
    return timeStr;
  }

  if (isYesterday) {
    return `Igår ${timeStr}`;
  }

  // Within last 7 days - show weekday + time
  const diffDays = Math.floor((now.getTime() - then.getTime()) / 86400000);
  if (diffDays < 7) {
    const weekday = then.toLocaleDateString("sv-SE", { weekday: "short" });
    return `${weekday} ${timeStr}`;
  }

  // Older - show date + time
  return then.toLocaleDateString("sv-SE", {
    day: "numeric",
    month: "short",
  }) + ` ${timeStr}`;
}

/**
 * Format org number with dash (XXXXXX-XXXX)
 */
export function formatOrgNr(orgNr: string): string {
  const clean = orgNr.replace(/\D/g, "");
  if (clean.length === 10) return `${clean.slice(0, 6)}-${clean.slice(6)}`;
  return orgNr;
}

/**
 * Format amount in TSEK or MSEK
 */
export function formatAmount(value: string | number | undefined | null): string {
  if (value === undefined || value === null || value === "") return "-";
  const strValue = String(value);
  const isNegative = strValue.startsWith("-") || strValue.includes("−");
  const numStr = strValue.replace(/[^\d]/g, "");
  const num = parseInt(numStr, 10);
  if (isNaN(num)) return strValue;
  const sign = isNegative ? "-" : "";
  if (num >= 1000) {
    return `${sign}${(num / 1000).toFixed(0)} MSEK`;
  }
  return `${sign}${num} TSEK`;
}

/**
 * Format amount in MSEK with decimals
 */
export function formatMSEK(value: number | undefined | null, decimals = 1): string {
  if (value === undefined || value === null) return "-";
  return `${(value / 1_000_000).toFixed(decimals)} MSEK`;
}

/**
 * Strip HTML tags and decode common entities
 */
export function stripHtml(value: string | undefined | null): string {
  if (!value) return "";
  return value
    .replace(/<[^>]*>/g, "")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * Safe date parsing with fallback
 */
export function parseDate(dateStr: string | undefined | null): Date | null {
  if (!dateStr) return null;
  let date = new Date(dateStr);
  if (!isNaN(date.getTime())) return date;
  const parts = dateStr.split(/[.\-\/]/);
  if (parts.length === 3) {
    if (parts[0].length === 4) {
      date = new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
    } else {
      date = new Date(parseInt(parts[2]), parseInt(parts[1]) - 1, parseInt(parts[0]));
    }
    if (!isNaN(date.getTime())) return date;
  }
  return null;
}

/**
 * Format date to Swedish locale
 */
export function formatDate(dateStr: string | undefined | null): string {
  if (!dateStr) return "";
  const date = parseDate(dateStr);
  if (!date) return dateStr;
  return date.toLocaleDateString("sv-SE", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}
