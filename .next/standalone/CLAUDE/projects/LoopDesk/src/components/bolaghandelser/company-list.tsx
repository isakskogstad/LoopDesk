"use client";

import { useRef, useState, useEffect } from "react";
import { Building2, Loader2 } from "lucide-react";

interface Company {
  orgNumber: string;
  name: string;
  hasLogo: boolean;
  resultCount: number;
  lastSearched: string | null;
  status: "idle" | "searching" | "done" | "error";
}

interface CompanyListProps {
  companies: Company[];
  selectedCompany: Company | null;
  onSelect: (company: Company) => void;
}

export function CompanyList({ companies, selectedCompany, onSelect }: CompanyListProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [visibleRange, setVisibleRange] = useState({ start: 0, end: 50 });

  const itemHeight = 56; // Height of each company item
  const bufferItems = 10;

  // Virtual scroll handler
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleScroll = () => {
      const scrollTop = container.scrollTop;
      const viewportHeight = container.clientHeight;

      const start = Math.max(0, Math.floor(scrollTop / itemHeight) - bufferItems);
      const end = Math.min(
        companies.length,
        Math.ceil((scrollTop + viewportHeight) / itemHeight) + bufferItems
      );

      setVisibleRange({ start, end });
    };

    container.addEventListener("scroll", handleScroll);
    handleScroll(); // Initial calculation

    return () => container.removeEventListener("scroll", handleScroll);
  }, [companies.length]);

  const totalHeight = companies.length * itemHeight;
  const visibleCompanies = companies.slice(visibleRange.start, visibleRange.end);
  const offsetY = visibleRange.start * itemHeight;

  const getBadge = (company: Company) => {
    if (company.status === "searching") {
      return (
        <span className="flex items-center gap-1 px-2 py-0.5 bg-blue-500/20 text-blue-400 rounded text-xs">
          <Loader2 size={10} className="animate-spin" />
        </span>
      );
    }
    if (company.status === "error") {
      return (
        <span className="px-2 py-0.5 bg-red-500/20 text-red-400 rounded text-xs">
          Fel
        </span>
      );
    }
    if (company.resultCount > 0) {
      return (
        <span className="px-2 py-0.5 bg-green-500/20 text-green-400 rounded text-xs font-medium">
          {company.resultCount}
        </span>
      );
    }
    if (company.lastSearched) {
      return (
        <span className="px-2 py-0.5 bg-[#2a2a2a] text-[#666] rounded text-xs">
          0
        </span>
      );
    }
    return null;
  };

  return (
    <div ref={containerRef} className="flex-1 overflow-y-auto">
      <div style={{ height: totalHeight, position: "relative" }}>
        <div style={{ transform: `translateY(${offsetY}px)` }}>
          {visibleCompanies.map((company) => (
            <div
              key={company.orgNumber}
              onClick={() => onSelect(company)}
              className={`flex items-center gap-3 px-4 py-3 cursor-pointer transition-colors border-b border-[#1a1a1a] ${
                selectedCompany?.orgNumber === company.orgNumber
                  ? "bg-[#6366f1]/10 border-l-2 border-l-[#6366f1]"
                  : "hover:bg-[#1a1a1a]"
              }`}
              style={{ height: itemHeight }}
            >
              {/* Logo or placeholder */}
              <div className="w-8 h-8 rounded-lg bg-[#2a2a2a] flex items-center justify-center overflow-hidden shrink-0">
                {company.hasLogo ? (
                  <img
                    src={`/logos/${company.orgNumber.replace(/-/g, "")}.png`}
                    alt=""
                    className="w-full h-full object-contain"
                    onError={(e) => {
                      e.currentTarget.style.display = "none";
                    }}
                  />
                ) : (
                  <Building2 size={16} className="text-[#666]" />
                )}
              </div>

              {/* Company info */}
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium truncate">{company.name}</div>
                <div className="text-xs text-[#666]">{company.orgNumber}</div>
              </div>

              {/* Badge */}
              {getBadge(company)}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
