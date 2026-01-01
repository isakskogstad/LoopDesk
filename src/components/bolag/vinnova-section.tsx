"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  ChevronDown,
  Copy,
  Check,
  ExternalLink,
  Target,
  Trophy,
  Wrench,
  Sparkles,
  Calendar,
  Building2,
  Coins
} from "lucide-react";
import type { VinnovaProject } from "@/lib/bolag";
import { stripHtml } from "@/lib/utils";

interface VinnovaSectionProps {
  companyName: string;
  orgNr?: string;
}

function VinnovaSkeleton() {
  return (
    <Card className="overflow-hidden">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <Skeleton className="h-6 w-40" />
          <Skeleton className="h-10 w-32 rounded-xl" />
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4 md:grid-cols-2">
          {[1, 2].map((n) => (
            <div key={`skeleton-${n}`} className="bento-box space-y-4">
              <div className="flex justify-between">
                <Skeleton className="h-5 w-3/4" />
                <Skeleton className="h-5 w-16 rounded-full" />
              </div>
              <div className="space-y-2">
                <Skeleton className="h-3 w-full" />
                <Skeleton className="h-3 w-2/3" />
              </div>
              <div className="flex gap-4">
                <Skeleton className="h-12 w-24 rounded-lg" />
                <Skeleton className="h-12 w-24 rounded-lg" />
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

const DEFAULT_VISIBLE_PROJECTS = 2;

export function VinnovaSection({ companyName, orgNr }: VinnovaSectionProps) {
  const [projects, setProjects] = useState<VinnovaProject[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedIds, setExpandedIds] = useState<Record<string, boolean>>({});
  const [expandedDetails, setExpandedDetails] = useState<Record<string, boolean>>({});
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [showAllProjects, setShowAllProjects] = useState(false);

  useEffect(() => {
    const fetchVinnova = async () => {
      setLoading(true);
      setError(null);

      try {
        const params = new URLSearchParams();
        if (orgNr) params.set("orgNr", orgNr);
        if (companyName) params.set("company", companyName);

        const response = await fetch(`/api/bolag/vinnova?${params.toString()}`);
        const data = await response.json();

        if (response.ok) {
          setProjects(data.projects || []);
        } else {
          setError(data.error || "Kunde inte hamta data");
        }
      } catch {
        setError("Ett fel uppstod vid hamtning av Vinnova-projekt");
      } finally {
        setLoading(false);
      }
    };

    fetchVinnova();
  }, [companyName, orgNr]);

  if (loading) {
    return <VinnovaSkeleton />;
  }

  if (error || !projects || projects.length === 0) {
    return null;
  }

  const totalGranted = projects.reduce((sum, p) => sum + p.grantedAmount, 0);
  const today = new Date();

  const isOngoing = (project: VinnovaProject) => {
    const status = project.status?.toLowerCase() || "";
    if (status.includes("pagaende") || status.includes("pågående")) return true;
    if (!project.projectEnd) return false;
    const endDate = new Date(project.projectEnd);
    return !isNaN(endDate.getTime()) && endDate >= today;
  };

  const ongoingCount = projects.filter(isOngoing).length;

  const sortedProjects = [...projects].sort((a, b) => {
    const aOngoing = isOngoing(a);
    const bOngoing = isOngoing(b);
    if (aOngoing !== bOngoing) return aOngoing ? -1 : 1;
    const aStart = new Date(a.projectStart || 0).getTime();
    const bStart = new Date(b.projectStart || 0).getTime();
    return bStart - aStart;
  });

  const formatPeriod = (start?: string | null, end?: string | null) => {
    if (!start && !end) return "Period saknas";
    const from = start ? start.slice(0, 7) : "okant";
    const to = end ? end.slice(0, 7) : "pagaende";
    return `${from} - ${to}`;
  };

  const handleCopy = async (diarienummer: string) => {
    try {
      await navigator.clipboard.writeText(diarienummer);
      setCopiedId(diarienummer);
      setTimeout(() => setCopiedId((prev) => (prev === diarienummer ? null : prev)), 2000);
    } catch {
      setCopiedId(null);
    }
  };

  return (
    <Card className="overflow-hidden">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <CardTitle className="text-title flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-amber-500" />
            Vinnova-projekt
          </CardTitle>

          {/* Summary stats */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-gray-100 dark:bg-gray-800">
              <span className="text-xs text-gray-500">{projects.length} projekt</span>
              {ongoingCount > 0 && (
                <>
                  <span className="text-gray-300 dark:text-gray-600">|</span>
                  <span className="text-xs text-emerald-600 dark:text-emerald-400">{ongoingCount} aktiva</span>
                </>
              )}
            </div>
            <div className="hero-metric !py-2 !px-4">
              <p className="text-label text-xs">Totalt beviljat</p>
              <p className="text-value-lg text-emerald-600">{(totalGranted / 1_000_000).toFixed(1)} <span className="text-sm text-gray-500">MSEK</span></p>
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        <div className="grid gap-4 md:grid-cols-2 stagger-fade-in">
          {(showAllProjects ? sortedProjects : sortedProjects.slice(0, DEFAULT_VISIBLE_PROJECTS)).map((project, index) => {
            const cleanDescription = stripHtml(project.description);
            const shouldClamp = cleanDescription.length > 180;
            const isExpanded = expandedIds[project.diarienummer];
            const detailsExpanded = expandedDetails[project.diarienummer];
            const ongoing = isOngoing(project);
            const hasDetails = project.goals || project.results || project.implementation || (project.links && project.links.length > 0);

            return (
              <div
                key={project.diarienummer}
                className={`bento-box card-interactive ${ongoing ? "ring-1 ring-emerald-200 dark:ring-emerald-900/50" : ""}`}
                style={{ animationDelay: `${index * 50}ms` }}
              >
                {/* Header */}
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex-1 min-w-0">
                    <p className="text-value text-gray-900 dark:text-gray-100 line-clamp-2 leading-snug">
                      {project.title}
                    </p>
                    {project.titleEn && project.title && project.title.length < 50 && (
                      <p className="text-xs text-gray-400 mt-0.5 line-clamp-1">{project.titleEn}</p>
                    )}
                  </div>
                  <Badge
                    className={`shrink-0 ${
                      ongoing
                        ? "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 border-0"
                        : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 border-0"
                    }`}
                  >
                    {ongoing ? "Pågående" : project.status || "Avslutat"}
                  </Badge>
                </div>

                {/* Key metrics grid */}
                <div className="grid grid-cols-2 gap-2 mb-3">
                  <div className="bg-white dark:bg-gray-800/50 rounded-lg p-2.5 border border-gray-100 dark:border-gray-700">
                    <div className="flex items-center gap-1.5 mb-1">
                      <Coins className="h-3 w-3 text-emerald-500" />
                      <span className="text-label text-xs">Beviljat</span>
                    </div>
                    <p className="text-value text-emerald-600 dark:text-emerald-400">
                      {(project.grantedAmount / 1_000_000).toFixed(2)} <span className="text-xs text-gray-400">MSEK</span>
                    </p>
                  </div>
                  <div className="bg-white dark:bg-gray-800/50 rounded-lg p-2.5 border border-gray-100 dark:border-gray-700">
                    <div className="flex items-center gap-1.5 mb-1">
                      <Calendar className="h-3 w-3 text-blue-500" />
                      <span className="text-label text-xs">Period</span>
                    </div>
                    <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      {formatPeriod(project.projectStart, project.projectEnd)}
                    </p>
                  </div>
                </div>

                {/* Diarienummer och koordinator */}
                <div className="flex items-center justify-between gap-2 py-2 border-t border-gray-100 dark:border-gray-800">
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-400">Diarienr:</span>
                    <span className="font-mono text-xs text-gray-600 dark:text-gray-400">{project.diarienummer}</span>
                    <button
                      type="button"
                      onClick={() => handleCopy(project.diarienummer)}
                      className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                      title="Kopiera diarienummer"
                      aria-label="Kopiera diarienummer till urklipp"
                    >
                      {copiedId === project.diarienummer ? (
                        <Check className="h-3 w-3 text-emerald-500" />
                      ) : (
                        <Copy className="h-3 w-3 text-gray-400" />
                      )}
                    </button>
                  </div>
                  {project.coordinator && (
                    <div className="flex items-center gap-1.5 text-xs text-gray-500">
                      <Building2 className="h-3 w-3" />
                      <span className="truncate max-w-[120px]">{project.coordinator}</span>
                    </div>
                  )}
                </div>

                {/* Programme badge */}
                {project.programme && (
                  <div className="pt-2">
                    <span className="inline-flex items-center text-xs bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 px-2 py-1 rounded-md">
                      {project.programme}
                    </span>
                  </div>
                )}

                {/* Description */}
                {cleanDescription && (
                  <div className="pt-3 border-t border-gray-100 dark:border-gray-800 mt-3">
                    <p className={`text-xs text-gray-500 leading-relaxed ${!isExpanded && shouldClamp ? "line-clamp-3" : ""}`}>
                      {cleanDescription}
                    </p>
                    {shouldClamp && (
                      <button
                        type="button"
                        onClick={() => setExpandedIds((prev) => ({ ...prev, [project.diarienummer]: !prev[project.diarienummer] }))}
                        className="text-xs text-blue-600 hover:text-blue-700 mt-1.5 font-medium"
                      >
                        {isExpanded ? "Visa mindre" : "Visa mer"}
                      </button>
                    )}
                  </div>
                )}

                {/* Extended details - expandable */}
                {hasDetails && (
                  <details className="group mt-3 pt-3 border-t border-gray-100 dark:border-gray-800">
                    <summary className="flex items-center justify-between cursor-pointer text-xs font-medium text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 transition-colors">
                      <span>Projektdetaljer</span>
                      <ChevronDown className="h-4 w-4 transition-transform group-open:rotate-180" />
                    </summary>

                    <div className="mt-3 space-y-3 animate-fade-in">
                      {project.goals && (
                        <div className="bg-blue-50/50 dark:bg-blue-900/10 rounded-lg p-3">
                          <div className="flex items-center gap-2 text-xs font-medium text-blue-700 dark:text-blue-400 mb-1.5">
                            <Target className="h-3.5 w-3.5" />
                            Projektmål
                          </div>
                          <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed">
                            {stripHtml(project.goals)}
                          </p>
                        </div>
                      )}

                      {project.results && (
                        <div className="bg-emerald-50/50 dark:bg-emerald-900/10 rounded-lg p-3">
                          <div className="flex items-center gap-2 text-xs font-medium text-emerald-700 dark:text-emerald-400 mb-1.5">
                            <Trophy className="h-3.5 w-3.5" />
                            Resultat
                          </div>
                          <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed">
                            {stripHtml(project.results)}
                          </p>
                        </div>
                      )}

                      {project.implementation && (
                        <div className="bg-purple-50/50 dark:bg-purple-900/10 rounded-lg p-3">
                          <div className="flex items-center gap-2 text-xs font-medium text-purple-700 dark:text-purple-400 mb-1.5">
                            <Wrench className="h-3.5 w-3.5" />
                            Implementation
                          </div>
                          <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed">
                            {stripHtml(project.implementation)}
                          </p>
                        </div>
                      )}

                      {project.links && project.links.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                          {project.links.map((link) => (
                            <a
                              key={link.url}
                              href={link.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1.5 text-xs text-blue-600 hover:text-blue-700 bg-blue-50 dark:bg-blue-900/20 px-2.5 py-1.5 rounded-md transition-colors hover:bg-blue-100 dark:hover:bg-blue-900/30"
                            >
                              <ExternalLink className="h-3 w-3" />
                              {link.name || "Länk"}
                            </a>
                          ))}
                        </div>
                      )}
                    </div>
                  </details>
                )}
              </div>
            );
          })}
        </div>

        {/* Show more/less button */}
        {sortedProjects.length > DEFAULT_VISIBLE_PROJECTS && (
          <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-800">
            <button
              type="button"
              onClick={() => setShowAllProjects(!showAllProjects)}
              className="w-full flex items-center justify-center gap-2 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100 transition-colors"
            >
              <ChevronDown className={`h-4 w-4 transition-transform ${showAllProjects ? "rotate-180" : ""}`} />
              {showAllProjects
                ? "Visa färre projekt"
                : `Visa alla ${sortedProjects.length} projekt`}
            </button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
