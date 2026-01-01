"use client";

import { Loader2 } from "lucide-react";

interface ActiveSearch {
  id: string;
  company: string;
  status: string;
  progress: number;
  found: number;
}

interface ActiveSearchesProps {
  searches: ActiveSearch[];
}

export function ActiveSearches({ searches }: ActiveSearchesProps) {
  if (searches.length === 0) return null;

  return (
    <div className="fixed bottom-20 right-4 w-80 bg-[#1a1a1a] rounded-xl border border-[#2a2a2a] shadow-2xl overflow-hidden z-40">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2 bg-[#151515] border-b border-[#2a2a2a]">
        <div className="flex items-center gap-2">
          <Loader2 size={14} className="text-[#6366f1] animate-spin" />
          <span className="text-sm font-medium">Aktiva sökningar</span>
        </div>
        <span className="text-xs text-[#888]">{searches.length} aktiva</span>
      </div>

      {/* Content */}
      <div className="max-h-64 overflow-y-auto">
        <table className="w-full text-xs">
          <thead className="bg-[#0f0f0f] sticky top-0">
            <tr className="text-[#666] text-left">
              <th className="px-4 py-2">Bolag</th>
              <th className="px-4 py-2 w-24">Status</th>
              <th className="px-4 py-2 w-16">Hittade</th>
            </tr>
          </thead>
          <tbody>
            {searches.map((search) => (
              <tr key={search.id} className="border-t border-[#1a1a1a]">
                <td className="px-4 py-2 truncate max-w-[120px]">
                  {search.company}
                </td>
                <td className="px-4 py-2">
                  <div className="flex items-center gap-2">
                    <div className="flex-1 h-1 bg-[#2a2a2a] rounded-full overflow-hidden">
                      <div
                        className="h-full bg-[#6366f1] transition-all duration-300"
                        style={{ width: `${search.progress}%` }}
                      />
                    </div>
                    <span className="text-[#888] w-8">{search.progress}%</span>
                  </div>
                </td>
                <td className="px-4 py-2 text-green-400">
                  {search.found > 0 && `+${search.found}`}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
