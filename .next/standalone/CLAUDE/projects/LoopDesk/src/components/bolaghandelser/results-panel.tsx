"use client";

import { useState } from "react";
import { ExternalLink, FileText, AlertCircle } from "lucide-react";

interface Company {
  orgNumber: string;
  name: string;
}

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

interface ResultsPanelProps {
  company: Company | null;
  announcements: Announcement[];
  onSelectAnnouncement: (announcement: Announcement) => void;
}

export function ResultsPanel({ company, announcements, onSelectAnnouncement }: ResultsPanelProps) {
  const [displayCount, setDisplayCount] = useState(50);

  if (!company) {
    return (
      <div className="flex-1 flex items-center justify-center text-[#666]">
        <div className="text-center">
          <FileText size={48} className="mx-auto mb-4 opacity-50" />
          <p>Välj ett bolag för att visa kungörelser</p>
        </div>
      </div>
    );
  }

  const displayedAnnouncements = announcements.slice(0, displayCount);
  const hasMore = announcements.length > displayCount;

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return "-";
    try {
      return new Date(dateStr).toLocaleDateString("sv-SE");
    } catch {
      return dateStr;
    }
  };

  const getTypeColor = (type: string | null) => {
    if (!type) return "bg-[#2a2a2a] text-[#888]";
    if (type.includes("Konkurs")) return "bg-red-500/20 text-red-400";
    if (type.includes("Likvidation")) return "bg-orange-500/20 text-orange-400";
    if (type.includes("Kallelse")) return "bg-yellow-500/20 text-yellow-400";
    return "bg-blue-500/20 text-blue-400";
  };

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2 bg-[#1a1a1a] border-b border-[#2a2a2a]">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium">{company.name}</span>
          <span className="px-2 py-0.5 bg-[#2a2a2a] rounded text-xs text-[#888]">
            {announcements.length} kungörelser
          </span>
        </div>
      </div>

      {/* Results Table */}
      {announcements.length === 0 ? (
        <div className="flex-1 flex items-center justify-center text-[#666]">
          <div className="text-center">
            <AlertCircle size={48} className="mx-auto mb-4 opacity-50" />
            <p>Inga kungörelser hittades</p>
            <p className="text-sm mt-2">Klicka på &quot;Sök&quot; för att hämta data</p>
          </div>
        </div>
      ) : (
        <div className="flex-1 overflow-y-auto">
          <table className="w-full text-sm">
            <thead className="sticky top-0 bg-[#1a1a1a] border-b border-[#2a2a2a]">
              <tr className="text-left text-[#888]">
                <th className="px-4 py-2 w-24">Datum</th>
                <th className="px-4 py-2 w-48">Typ</th>
                <th className="px-4 py-2">Detaljer</th>
                <th className="px-4 py-2 w-24">ID</th>
              </tr>
            </thead>
            <tbody>
              {displayedAnnouncements.map((announcement) => (
                <tr
                  key={announcement.id}
                  onClick={() => onSelectAnnouncement(announcement)}
                  className={`border-b border-[#1a1a1a] cursor-pointer transition-colors hover:bg-[#1a1a1a] ${
                    !announcement.detailText ? "text-yellow-500/70 italic" : ""
                  }`}
                >
                  <td className="px-4 py-3 text-[#888]">
                    {formatDate(announcement.pubDate)}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 rounded text-xs ${getTypeColor(announcement.type)}`}>
                      {announcement.type || "Okänd"}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="truncate max-w-[400px]">
                      {announcement.detailText || "[Detaljer ej hämtade]"}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    {announcement.url ? (
                      <a
                        href={announcement.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        className="flex items-center gap-1 text-[#6366f1] hover:underline"
                      >
                        {announcement.id}
                        <ExternalLink size={12} />
                      </a>
                    ) : (
                      <span className="text-[#666]">{announcement.id}</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Load more */}
          {hasMore && (
            <div className="p-4 text-center">
              <button
                onClick={() => setDisplayCount(prev => prev + 50)}
                className="px-4 py-2 bg-[#2a2a2a] hover:bg-[#3a3a3a] rounded text-sm transition-colors"
              >
                Ladda fler... ({announcements.length - displayCount} kvar)
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
