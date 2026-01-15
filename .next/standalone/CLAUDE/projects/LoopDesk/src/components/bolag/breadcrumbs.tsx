"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronRight, Home } from "lucide-react";

interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface BreadcrumbsProps {
  items?: BreadcrumbItem[];
  companyName?: string;
  personName?: string;
}

export function Breadcrumbs({ items, companyName, personName }: BreadcrumbsProps) {
  const pathname = usePathname();

  // Auto-generate breadcrumbs based on path if no items provided
  const generateBreadcrumbs = (): BreadcrumbItem[] => {
    const crumbs: BreadcrumbItem[] = [{ label: "Hem", href: "/" }];

    if (pathname.startsWith("/bolag/") && !pathname.includes("/compare") && !pathname.includes("/person")) {
      // Company detail page: Hem > Bolag > [Company Name]
      crumbs.push({ label: "Bolag", href: "/bolag" });
      crumbs.push({ label: companyName || "Bolagsdetaljer" });
    } else if (pathname.startsWith("/company/")) {
      crumbs.push({ label: "Bolag", href: "/bolag" });
      crumbs.push({ label: companyName || "Bolag" });
    } else if (pathname.startsWith("/bolag/person/") || pathname.startsWith("/person/")) {
      crumbs.push({ label: "Bolag", href: "/bolag" });
      crumbs.push({ label: personName || "Person" });
    } else if (pathname.startsWith("/bolag/compare") || pathname.startsWith("/compare")) {
      crumbs.push({ label: "Bolag", href: "/bolag" });
      crumbs.push({ label: "Jämför bolag" });
    } else if (pathname === "/bolag") {
      crumbs.push({ label: "Bolag" });
    }

    return crumbs;
  };

  const breadcrumbs = items || generateBreadcrumbs();

  // Always show at least the home link

  return (
    <nav aria-label="Breadcrumb" className="breadcrumb-nav">
      <ol className="breadcrumb-list">
        {breadcrumbs.map((crumb, index) => {
          const isLast = index === breadcrumbs.length - 1;
          const isFirst = index === 0;
          const crumbKey = crumb.href || `crumb-${crumb.label}-${index}`;

          return (
            <li key={crumbKey} className="breadcrumb-item">
              {!isFirst && (
                <ChevronRight className="breadcrumb-separator" aria-hidden="true" />
              )}
              {crumb.href && !isLast ? (
                <Link
                  href={crumb.href}
                  className="breadcrumb-link"
                >
                  {isFirst ? (
                    <>
                      <Home className="h-4 w-4" aria-hidden="true" />
                      <span className="sr-only">{crumb.label}</span>
                    </>
                  ) : (
                    crumb.label
                  )}
                </Link>
              ) : (
                <span
                  className={`breadcrumb-current ${isLast ? "font-medium text-foreground dark:text-foreground" : ""}`}
                  aria-current={isLast ? "page" : undefined}
                >
                  {isFirst ? (
                    <>
                      <Home className="h-4 w-4" aria-hidden="true" />
                      <span className="sr-only">{crumb.label}</span>
                    </>
                  ) : (
                    <span className="truncate max-w-[200px] sm:max-w-[300px] inline-block align-bottom">
                      {crumb.label}
                    </span>
                  )}
                </span>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
