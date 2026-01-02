"use client";

import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Building2, ChevronDown } from "lucide-react";
import type { CompanyData } from "@/lib/bolag";

interface CorporateTreeProps {
  data: CompanyData;
}

export function CorporateTree({ data }: CorporateTreeProps) {
  const structure = data.corporateStructure;

  // Check if we have any structure data
  const hasParent = structure?.parentCompanyName && structure?.parentCompanyOrgNr;
  const hasSubsidiaries = structure?.numberOfSubsidiaries && structure.numberOfSubsidiaries > 0;
  const hasGroup = structure?.numberOfCompanies && structure.numberOfCompanies > 1;

  if (!hasParent && !hasSubsidiaries && !hasGroup) {
    return null;
  }

  const formatOrgNr = (orgNr: string) => {
    const clean = orgNr.replace(/\D/g, "");
    if (clean.length === 10) return `${clean.slice(0, 6)}-${clean.slice(6)}`;
    return orgNr;
  };

  return (
    <Card className="overflow-hidden">
      <CardHeader className="pb-2">
        <CardTitle className="text-title flex items-center gap-2">
          <Building2 className="h-5 w-5 text-muted-foreground" />
          Koncernstruktur
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="tree-container">
          {/* Parent company node */}
          {hasParent && (
            <>
              <Link
                href={`/bolag/${structure!.parentCompanyOrgNr}`}
                className="tree-node tree-node-parent card-interactive group"
              >
                <p className="text-section text-blue-600 dark:text-blue-400 mb-1">Moderbolag</p>
                <p className="text-value text-foreground dark:text-foreground group-hover:text-blue-600 transition-colors">
                  {structure!.parentCompanyName}
                </p>
                <p className="text-mono text-xs text-muted-foreground mt-1">
                  {formatOrgNr(structure!.parentCompanyOrgNr!)}
                </p>
              </Link>
              <div className="tree-connector" />
            </>
          )}

          {/* Current company node (highlighted) */}
          <div className="tree-node tree-node-current">
            <Badge className="mb-2 bg-emerald-500/90 hover:bg-emerald-500 text-xs">
              Aktuellt bolag
            </Badge>
            <p className="text-value text-foreground dark:text-foreground font-semibold">
              {data.basic.name}
            </p>
            <p className="text-mono text-xs text-muted-foreground mt-1">
              {formatOrgNr(data.basic.orgNr)}
            </p>
          </div>

          {/* Subsidiaries indicator */}
          {hasSubsidiaries && (
            <>
              <div className="tree-connector" />
              <div className="tree-children">
                <div className="tree-node opacity-70 hover:opacity-100 transition-opacity">
                  <ChevronDown className="h-4 w-4 text-muted-foreground/70 mx-auto mb-1" />
                  <p className="text-label">Dotterbolag</p>
                  <p className="text-value-lg text-foreground dark:text-foreground">
                    {structure!.numberOfSubsidiaries}
                  </p>
                </div>
              </div>
            </>
          )}

          {/* Group info */}
          {hasGroup && !hasSubsidiaries && (
            <div className="mt-4 text-center">
              <p className="text-label">Totalt i koncernen</p>
              <p className="text-value text-foreground dark:text-foreground">
                {structure!.numberOfCompanies} bolag
              </p>
            </div>
          )}

          {/* Summary badges */}
          {(hasSubsidiaries || hasGroup) && (
            <div className="flex flex-wrap justify-center gap-2 mt-6 pt-4 border-t border-border dark:border-gray-800 w-full">
              {hasSubsidiaries && (
                <span className="text-xs bg-secondary text-muted-foreground px-3 py-1.5 rounded-full">
                  {structure!.numberOfSubsidiaries} dotterbolag
                </span>
              )}
              {hasGroup && (
                <span className="text-xs bg-secondary text-muted-foreground px-3 py-1.5 rounded-full">
                  {structure!.numberOfCompanies} bolag totalt
                </span>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
