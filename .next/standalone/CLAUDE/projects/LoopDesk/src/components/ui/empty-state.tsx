"use client";

import { ReactNode } from "react";
import { Newspaper, Building2, Search, Rss, FileText, Bell, Bookmark, LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/button";

interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description: string;
  action?: {
    label: string;
    onClick?: () => void;
    href?: string;
    variant?: "default" | "outline" | "ghost";
  };
  secondaryAction?: {
    label: string;
    onClick?: () => void;
  };
  children?: ReactNode;
  className?: string;
}

/**
 * Standardized empty state component with consistent styling
 * Issue #8 - Improve empty states with illustrations
 */
export function EmptyState({
  icon: Icon = FileText,
  title,
  description,
  action,
  secondaryAction,
  children,
  className = "",
}: EmptyStateProps) {
  return (
    <div className={`empty-state ${className}`}>
      {/* Decorative background pattern */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-gradient-to-br from-secondary/50 to-transparent rounded-full blur-3xl" />
      </div>

      {/* Icon with animated ring */}
      <div className="relative empty-state-icon">
        <div className="absolute inset-0 rounded-full bg-secondary animate-pulse-soft" />
        <div className="relative w-16 h-16 rounded-full bg-secondary flex items-center justify-center">
          <Icon className="w-8 h-8 text-muted-foreground" />
        </div>
      </div>

      {/* Title */}
      <h3 className="empty-state-title">{title}</h3>

      {/* Description */}
      <p className="empty-state-description">{description}</p>

      {/* Actions */}
      {(action || secondaryAction) && (
        <div className="flex flex-col sm:flex-row gap-3">
          {action && (
            action.href ? (
              <Button asChild variant={action.variant || "default"}>
                <a href={action.href}>{action.label}</a>
              </Button>
            ) : (
              <Button onClick={action.onClick} variant={action.variant || "default"}>
                {action.label}
              </Button>
            )
          )}
          {secondaryAction && (
            <Button variant="ghost" onClick={secondaryAction.onClick}>
              {secondaryAction.label}
            </Button>
          )}
        </div>
      )}

      {/* Custom content */}
      {children}
    </div>
  );
}

// Pre-configured empty states for common use cases

export function EmptyNewsState({
  onAddFeed,
  hasFilters = false,
}: {
  onAddFeed?: () => void;
  hasFilters?: boolean;
}) {
  if (hasFilters) {
    return (
      <EmptyState
        icon={Search}
        title="Inga matchande nyheter"
        description="Prova att ändra dina filter eller sökning för att hitta fler nyheter."
      />
    );
  }

  return (
    <EmptyState
      icon={Newspaper}
      title="Inga nyheter ännu"
      description="Lägg till dina första RSS-källor för att börja följa nyheter från de medier du bryr dig om."
      action={onAddFeed ? { label: "Lägg till källa", onClick: onAddFeed } : undefined}
    />
  );
}

export function EmptyCompanyState() {
  return (
    <EmptyState
      icon={Building2}
      title="Inga bolag hittades"
      description="Prova en annan sökning eller lägg till nya bolag i din bevakningslista."
      action={{ label: "Sök bolag", href: "/bolag" }}
    />
  );
}

export function EmptyBookmarksState() {
  return (
    <EmptyState
      icon={Bookmark}
      title="Inga sparade artiklar"
      description="Klicka på bokmärkesikonen för att spara artiklar du vill läsa senare."
    />
  );
}

export function EmptySearchState({ query }: { query: string }) {
  return (
    <EmptyState
      icon={Search}
      title="Inga resultat"
      description={`Vi kunde inte hitta något som matchade "${query}". Prova en annan sökning.`}
    />
  );
}

export function EmptyFeedsState({ onAddFeed }: { onAddFeed?: () => void }) {
  return (
    <EmptyState
      icon={Rss}
      title="Inga RSS-källor"
      description="Lägg till dina favorit-nyhetskällor för att börja följa nyheter."
      action={onAddFeed ? { label: "Lägg till källa", onClick: onAddFeed } : undefined}
    />
  );
}

export function EmptyAlertsState() {
  return (
    <EmptyState
      icon={Bell}
      title="Inga nyckelord"
      description="Skapa nyckelord för att markera artiklar som matchar dina intressen."
      action={{ label: "Skapa nyckelord", href: "/installningar" }}
    />
  );
}
