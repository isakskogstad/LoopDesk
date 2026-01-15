'use client';

import { formatCurrency, formatPercent, getStatusColor } from './use-company-financials';
import type { CompanyValuation, CompanyStrength, CompanyTrends } from './types';
import styles from './company-financials.module.css';

interface HighlightCardsProps {
  valuation: CompanyValuation | null;
  strength: CompanyStrength;
  trends: CompanyTrends | null;
}

export function HighlightCards({ valuation, strength, trends }: HighlightCardsProps) {
  // Valuation range text
  const valuationText = valuation?.evEbitdaRange
    ? `${formatCurrency(valuation.evEbitdaRange.low)} – ${formatCurrency(valuation.evEbitdaRange.high)}`
    : '–';
  const valuationSub = valuation?.evEbitdaRange
    ? `Baserat på EBITDA-multiplar (${valuation.evEbitdaRange.multiple - 3}–${valuation.evEbitdaRange.multiple + 5}x)`
    : 'Otillräcklig data';

  // Strength score
  const strengthScore = strength.piotroskiF?.score ?? 0;
  const strengthStatus = strength.overall || 'Weak';

  // Trend text
  const trendValue = trends?.revenueCAGR;
  const trendText = trendValue !== null && trendValue !== undefined
    ? `${trendValue >= 0 ? '+' : ''}${trendValue.toFixed(1)}% CAGR`
    : '–';
  const trendSub = trends?.yearsAnalyzed
    ? `Omsättningstillväxt (${trends.yearsAnalyzed} år)`
    : 'Otillräcklig historik';

  return (
    <div className={styles.highlightRow}>
      <div className={`${styles.highlightCard} ${styles.valuation}`}>
        <div className={styles.highlightIcon}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
          </svg>
        </div>
        <div className={styles.highlightLabel}>Värdering</div>
        <div className={styles.highlightMain}>{valuationText}</div>
        <div className={styles.highlightSub}>{valuationSub}</div>
      </div>

      <div className={`${styles.highlightCard} ${styles.strength}`}>
        <div className={styles.highlightIcon}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
          </svg>
        </div>
        <div className={styles.highlightLabel}>Finansiell styrka</div>
        <div className={styles.highlightMain}>
          <span style={{ color: getStatusColor(strengthStatus) }}>{strengthScore}</span>
          <span className={styles.highlightDivider}>/</span>
          <span>9</span>
        </div>
        <div className={styles.highlightSub}>
          Piotroski F-Score • {translateStatus(strengthStatus)}
        </div>
      </div>

      <div className={`${styles.highlightCard} ${styles.trend}`}>
        <div className={styles.highlightIcon}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
            <polyline points="17 6 23 6 23 12" />
          </svg>
        </div>
        <div className={styles.highlightLabel}>Trend</div>
        <div className={`${styles.highlightMain} ${trendValue && trendValue >= 0 ? styles.positive : styles.negative}`}>
          {trendText}
        </div>
        <div className={styles.highlightSub}>{trendSub}</div>
      </div>
    </div>
  );
}

function translateStatus(status: string): string {
  const translations: Record<string, string> = {
    'Strong': 'Stark',
    'Adequate': 'Tillräcklig',
    'Weak': 'Svag',
    'Safe': 'Säker',
    'Grey': 'Gråzon',
    'Distress': 'Risk',
  };
  return translations[status] || status;
}
