"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

interface TooltipProps {
  children: React.ReactNode;
  content: string;
  className?: string;
}

export function Tooltip({ children, content, className }: TooltipProps) {
  return (
    <span className={cn("group relative inline-flex items-center", className)}>
      {children}
      <span
        role="tooltip"
        className="pointer-events-none absolute bottom-full left-1/2 z-50 mb-2 -translate-x-1/2 whitespace-normal rounded-lg bg-gray-900 px-3 py-2 text-xs font-normal text-white opacity-0 shadow-lg transition-opacity duration-200 group-hover:opacity-100 dark:bg-gray-700 max-w-xs text-center"
      >
        {content}
        <span className="absolute left-1/2 top-full -translate-x-1/2 border-4 border-transparent border-t-gray-900 dark:border-t-gray-700" />
      </span>
    </span>
  );
}

// Financial term definitions
export const financialTerms: Record<string, string> = {
  "Avkastning EK": "Avkastning på eget kapital (ROE). Visar hur effektivt bolaget använder aktieägarnas kapital för att generera vinst. Beräknas som resultat / eget kapital.",
  "Avkastning TK": "Avkastning på totalt kapital (ROA). Mäter hur effektivt bolaget använder alla sina tillgångar. Beräknas som (resultat + räntekostnader) / totala tillgångar.",
  "Vinstmarginal": "Andelen av omsättningen som blir vinst efter alla kostnader. Beräknas som resultat / omsättning × 100.",
  "EBITDA": "Resultat före räntor, skatter, avskrivningar och nedskrivningar. Visar den operativa lönsamheten utan hänsyn till finansiering och bokföringsmässiga poster.",
  "Soliditet": "Andelen eget kapital i förhållande till totala tillgångar. Visar bolagets finansiella stabilitet. Högre soliditet = lägre finansiell risk.",
  "Likviditet": "Bolagets förmåga att betala kortfristiga skulder. Beräknas som omsättningstillgångar / kortfristiga skulder.",
  "Rörelseresultat": "Resultatet från den löpande verksamheten, före finansiella poster och skatt.",
  "Eget kapital": "Skillnaden mellan tillgångar och skulder. Representerar ägarnas andel av bolaget.",
  "Omsättning": "Totala intäkter från försäljning av varor och tjänster under perioden.",
  "Tillväxt": "Procentuell förändring i omsättning jämfört med föregående år.",
};

// Helper component for terms with tooltips
interface FinancialTermProps {
  term: keyof typeof financialTerms | string;
  children?: React.ReactNode;
  className?: string;
}

export function FinancialTerm({ term, children, className }: FinancialTermProps) {
  const definition = financialTerms[term];

  if (!definition) {
    return <span className={className}>{children || term}</span>;
  }

  return (
    <Tooltip content={definition} className={className}>
      <span className="cursor-help border-b border-dotted border-muted-foreground/50 hover:border-muted-foreground">
        {children || term}
      </span>
    </Tooltip>
  );
}
