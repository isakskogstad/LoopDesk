"use client";

import { useEffect } from "react";
import { X, ExternalLink, Calendar, Building2, User, FileText } from "lucide-react";

interface Announcement {
  id: string;
  subject: string;
  type: string | null;
  reporter: string | null;
  pubDate: string | null;
  publishedAt: string | null;
  detailText: string | null;
  fullText: string | null;
  url: string | null;
  orgNumber: string | null;
}

interface DetailModalProps {
  announcement: Announcement;
  onClose: () => void;
}

export function DetailModal({ announcement, onClose }: DetailModalProps) {
  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return "-";
    try {
      return new Date(dateStr).toLocaleDateString("sv-SE", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    } catch {
      return dateStr;
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="w-full max-w-2xl max-h-[80vh] bg-[#1a1a1a] rounded-xl shadow-2xl border border-[#2a2a2a] overflow-hidden animate-scaleIn">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-[#151515] border-b border-[#2a2a2a]">
          <div className="flex items-center gap-3">
            <div className="px-2 py-1 bg-blue-500/20 text-blue-400 rounded text-xs font-medium">
              {announcement.type || "Kungörelse"}
            </div>
            {announcement.url && (
              <a
                href={announcement.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 text-sm text-[#6366f1] hover:underline"
              >
                {announcement.id}
                <ExternalLink size={14} />
              </a>
            )}
          </div>
          <button
            onClick={onClose}
            className="p-1.5 hover:bg-[#2a2a2a] rounded-lg transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Content */}
        <div className="overflow-y-auto max-h-[calc(80vh-60px)]">
          <div className="p-6 space-y-6">
            {/* Meta info */}
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center gap-3 p-3 bg-[#0f0f0f] rounded-lg">
                <Calendar size={18} className="text-[#888]" />
                <div>
                  <div className="text-xs text-[#666]">Publiceringsdatum</div>
                  <div className="text-sm">{formatDate(announcement.pubDate)}</div>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 bg-[#0f0f0f] rounded-lg">
                <User size={18} className="text-[#888]" />
                <div>
                  <div className="text-xs text-[#666]">Rapportör</div>
                  <div className="text-sm">{announcement.reporter || "-"}</div>
                </div>
              </div>
            </div>

            {/* Subject */}
            <div className="flex items-start gap-3 p-3 bg-[#0f0f0f] rounded-lg">
              <Building2 size={18} className="text-[#888] mt-0.5" />
              <div>
                <div className="text-xs text-[#666]">Bolag</div>
                <div className="text-sm font-medium">{announcement.subject}</div>
                {announcement.orgNumber && (
                  <div className="text-xs text-[#666] mt-1">Org.nr: {announcement.orgNumber}</div>
                )}
              </div>
            </div>

            {/* Full text */}
            <div className="flex items-start gap-3 p-3 bg-[#0f0f0f] rounded-lg">
              <FileText size={18} className="text-[#888] mt-0.5 shrink-0" />
              <div className="flex-1">
                <div className="text-xs text-[#666] mb-2">Kungörelsetext</div>
                {announcement.fullText || announcement.detailText ? (
                  <div className="text-sm whitespace-pre-wrap leading-relaxed">
                    {announcement.fullText || announcement.detailText}
                  </div>
                ) : (
                  <div className="text-sm text-yellow-500/70 italic">
                    Detaljer ej hämtade
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
