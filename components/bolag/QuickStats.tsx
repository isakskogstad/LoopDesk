'use client';

import { formatCurrency, formatPercent, formatNumber } from './use-company-financials';
import type { CompanyMetrics, IncomeStatement } from './types';
import styles from './company-financials.module.css';

interface QuickStatsProps {
  metrics: CompanyMetrics | null;
  incomeStatement: IncomeStatement | null;
  avgEmployees: number | null;
  latestYear: number | null;
}

export function QuickStats({ metrics, incomeStatement, avgEmployees, latestYear }: QuickStatsProps) {
  const stats = [
    {
      label: 'Omsättning',
      value: formatCurrency(incomeStatement?.revenue, 1),
      change: metrics?.revenueGrowth,
    },
    {
      label: 'Resultat',
      value: formatCurrency(incomeStatement?.netIncome, 1),
      change: metrics?.netIncomeGrowth,
    },
    {
      label: 'EBITDA',
      value: formatCurrency(metrics?.ebitda, 1),
      change: null,
    },
    {
      label: 'Soliditet',
      value: metrics?.solidityRatio ? `${metrics.solidityRatio.toFixed(1)}%` : '–',
      change: null,
    },
    {
      label: 'Anställda',
      value: avgEmployees ? formatNumber(avgEmployees, 0) : '–',
      change: null,
    },
    {
      label: 'Räkenskapsår',
      value: latestYear?.toString() || '–',
      change: null,
    },
  ];

  return (
    <div className={styles.quickStats}>
      {stats.map((stat, index) => (
        <div key={index} className={styles.quickStat}>
          <div className={styles.quickStatValue}>{stat.value}</div>
          <div className={styles.quickStatLabel}>{stat.label}</div>
          {stat.change !== null && stat.change !== undefined && (
            <div className={`${styles.quickStatChange} ${stat.change >= 0 ? styles.positive : styles.negative}`}>
              {formatPercent(stat.change)}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
