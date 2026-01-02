"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Network, ZoomIn, ZoomOut, Maximize2 } from "lucide-react";
import type { CompanyData } from "@/lib/bolag";

interface CorporateGraphProps {
  data: CompanyData;
}

interface GraphNode {
  id: string;
  name: string;
  orgNr: string;
  type: "current" | "parent" | "subsidiary";
  x: number;
  y: number;
}

interface GraphLine {
  from: string;
  to: string;
  x1: number;
  y1: number;
  x2: number;
  y2: number;
}

export function CorporateGraph({ data }: CorporateGraphProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [zoom, setZoom] = useState(1);
  const [nodes, setNodes] = useState<GraphNode[]>([]);
  const [lines, setLines] = useState<GraphLine[]>([]);
  const [isExpanded, setIsExpanded] = useState(false);

  const structure = data.corporateStructure;
  const hasParent = structure?.parentCompanyName && structure?.parentCompanyOrgNr;
  const hasSubsidiaries = structure?.numberOfSubsidiaries && structure.numberOfSubsidiaries > 0;

  // Get actual subsidiaries from relatedCompanies (memoized to prevent infinite loops)
  const subsidiaries = useMemo(() => {
    return (data.relatedCompanies || []).filter((rc) => {
      const relation = (rc.relation || "").toLowerCase();
      return relation.includes("dotterbolag") || relation.includes("subsidiary");
    });
  }, [data.relatedCompanies]);

  // Don't render if there's no structure data
  if (!hasParent && !hasSubsidiaries) {
    return null;
  }

  const formatOrgNr = (orgNr: string) => {
    const clean = orgNr.replace(/\D/g, "");
    if (clean.length === 10) return `${clean.slice(0, 6)}-${clean.slice(6)}`;
    return orgNr;
  };

  // Calculate positions
  useEffect(() => {
    const containerWidth = containerRef.current?.offsetWidth || 600;
    const centerX = containerWidth / 2;
    const nodeWidth = 200;
    const nodeHeight = 80;
    const verticalGap = 100;

    const newNodes: GraphNode[] = [];
    const newLines: GraphLine[] = [];

    let currentY = 50;

    // Parent node
    if (hasParent) {
      newNodes.push({
        id: structure!.parentCompanyOrgNr!,
        name: structure!.parentCompanyName!,
        orgNr: structure!.parentCompanyOrgNr!,
        type: "parent",
        x: centerX - nodeWidth / 2,
        y: currentY,
      });
      currentY += nodeHeight + verticalGap;
    }

    // Current company node
    const currentNodeY = currentY;
    newNodes.push({
      id: data.basic.orgNr,
      name: data.basic.name,
      orgNr: data.basic.orgNr,
      type: "current",
      x: centerX - nodeWidth / 2,
      y: currentY,
    });

    // Line from parent to current
    if (hasParent) {
      newLines.push({
        from: structure!.parentCompanyOrgNr!,
        to: data.basic.orgNr,
        x1: centerX,
        y1: 50 + nodeHeight,
        x2: centerX,
        y2: currentNodeY,
      });
    }

    currentY += nodeHeight + verticalGap;

    // Subsidiary nodes (show up to 5)
    // Prefer actual subsidiary data from relatedCompanies, fall back to count
    const hasRealSubsidiaries = subsidiaries.length > 0;
    const subsidiaryCount = hasRealSubsidiaries
      ? Math.min(subsidiaries.length, 5)
      : Math.min(structure?.numberOfSubsidiaries || 0, 5);

    if (subsidiaryCount > 0) {
      const spacing = Math.min(220, (containerWidth - 40) / subsidiaryCount);
      const startX = centerX - ((subsidiaryCount - 1) * spacing) / 2 - nodeWidth / 2;

      // Horizontal connector line
      if (subsidiaryCount > 1) {
        newLines.push({
          from: "connector",
          to: "connector",
          x1: startX + nodeWidth / 2,
          y1: currentY - verticalGap / 2,
          x2: startX + (subsidiaryCount - 1) * spacing + nodeWidth / 2,
          y2: currentY - verticalGap / 2,
        });
      }

      // Vertical line from current to connector
      newLines.push({
        from: data.basic.orgNr,
        to: "connector",
        x1: centerX,
        y1: currentNodeY + nodeHeight,
        x2: centerX,
        y2: currentY - verticalGap / 2,
      });

      for (let i = 0; i < subsidiaryCount; i++) {
        const x = startX + i * spacing;

        // Use real subsidiary data if available
        const subsidiary = hasRealSubsidiaries ? subsidiaries[i] : null;
        const subsidiaryId = subsidiary?.orgNr || `subsidiary-${i}`;
        const subsidiaryName = subsidiary?.name || `Dotterbolag ${i + 1}`;
        const subsidiaryOrgNr = subsidiary?.orgNr || "";

        newNodes.push({
          id: subsidiaryId,
          name: subsidiaryName,
          orgNr: subsidiaryOrgNr,
          type: "subsidiary",
          x,
          y: currentY,
        });

        // Vertical line from connector to subsidiary
        newLines.push({
          from: "connector",
          to: subsidiaryId,
          x1: x + nodeWidth / 2,
          y1: currentY - verticalGap / 2,
          x2: x + nodeWidth / 2,
          y2: currentY,
        });
      }

      currentY += nodeHeight + 30;
    }

    setNodes(newNodes);
    setLines(newLines);
  }, [data, hasParent, hasSubsidiaries, structure, subsidiaries]);

  const handleZoomIn = () => setZoom((z) => Math.min(z + 0.2, 2));
  const handleZoomOut = () => setZoom((z) => Math.max(z - 0.2, 0.5));
  const handleExpand = () => setIsExpanded(!isExpanded);

  const graphHeight = isExpanded ? 600 : 400;

  return (
    <Card className="overflow-hidden">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-title flex items-center gap-2">
            <Network className="h-5 w-5 text-indigo-500" />
            Koncernstruktur
          </CardTitle>
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="icon" onClick={handleZoomOut} className="h-8 w-8" aria-label="Zooma ut">
              <ZoomOut className="h-4 w-4" />
            </Button>
            <span className="text-xs text-muted-foreground w-12 text-center" aria-live="polite">{Math.round(zoom * 100)}%</span>
            <Button variant="ghost" size="icon" onClick={handleZoomIn} className="h-8 w-8" aria-label="Zooma in">
              <ZoomIn className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" onClick={handleExpand} className="h-8 w-8 ml-2" aria-label={isExpanded ? "Minimera vy" : "Expandera vy"}>
              <Maximize2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div
          ref={containerRef}
          className="corporate-graph relative overflow-auto bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-800 rounded-xl border border-border dark:border-gray-800"
          style={{ height: graphHeight }}
        >
          <div
            style={{
              transform: `scale(${zoom})`,
              transformOrigin: "top center",
              transition: "transform 0.2s ease",
            }}
          >
            {/* Connection lines */}
            <svg
              className="absolute inset-0 pointer-events-none"
              style={{ width: "100%", height: "100%" }}
            >
              {lines.map((line) => (
                <line
                  key={`${line.from}-${line.to}-${line.x1}-${line.y1}`}
                  x1={line.x1}
                  y1={line.y1}
                  x2={line.x2}
                  y2={line.y2}
                  stroke="currentColor"
                  strokeWidth="2"
                  className="text-muted-foreground/50 dark:text-muted-foreground"
                />
              ))}
            </svg>

            {/* Nodes */}
            {nodes.map((node) => (
              <GraphNodeComponent key={node.id} node={node} formatOrgNr={formatOrgNr} />
            ))}
          </div>

          {/* Legend */}
          <div className="absolute bottom-3 left-3 flex flex-wrap gap-2">
            {hasParent && (
              <span className="text-xs bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 px-2 py-1 rounded-full">
                Moderbolag
              </span>
            )}
            <span className="text-xs bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 px-2 py-1 rounded-full">
              Aktuellt bolag
            </span>
            {hasSubsidiaries && (
              <span className="text-xs bg-cyan-100 dark:bg-cyan-900/30 text-cyan-700 dark:text-cyan-400 px-2 py-1 rounded-full">
                {structure?.numberOfSubsidiaries} dotterbolag
              </span>
            )}
          </div>

          {/* Total in group */}
          {structure?.numberOfCompanies && structure.numberOfCompanies > 1 && (
            <div className="absolute bottom-3 right-3">
              <Badge variant="secondary" className="text-xs">
                {structure.numberOfCompanies} bolag i koncernen
              </Badge>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

function GraphNodeComponent({
  node,
  formatOrgNr,
}: {
  node: GraphNode;
  formatOrgNr: (orgNr: string) => string;
}) {
  const nodeClasses = {
    current: "corporate-graph-node corporate-graph-node-current",
    parent: "corporate-graph-node corporate-graph-node-parent",
    subsidiary: "corporate-graph-node corporate-graph-node-subsidiary",
  };

  const badgeClasses = {
    current: "bg-emerald-500 text-white",
    parent: "bg-blue-500 text-white",
    subsidiary: "bg-cyan-500 text-white",
  };

  const badgeLabels = {
    current: "Aktuellt",
    parent: "Moderbolag",
    subsidiary: "Dotterbolag",
  };

  // Make nodes clickable if they have an orgNr (including subsidiaries with real data)
  const isClickable = Boolean(node.orgNr);

  const content = (
    <>
      <span className={`corporate-graph-node-badge ${badgeClasses[node.type]}`}>
        {badgeLabels[node.type]}
      </span>
      <span className="corporate-graph-node-name line-clamp-2">{node.name}</span>
      {node.orgNr && (
        <span className="corporate-graph-node-orgnr">{formatOrgNr(node.orgNr)}</span>
      )}
    </>
  );

  if (isClickable) {
    return (
      <Link
        href={`/bolag/${node.orgNr}`}
        className={nodeClasses[node.type]}
        style={{
          left: node.x,
          top: node.y,
        }}
      >
        {content}
      </Link>
    );
  }

  return (
    <div
      className={nodeClasses[node.type]}
      style={{
        left: node.x,
        top: node.y,
      }}
    >
      {content}
    </div>
  );
}
