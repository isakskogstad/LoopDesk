'use client';

import { useEffect, useRef } from 'react';
import { formatCurrency, formatPercent } from './use-company-financials';
import type { CompanyTrends, HistoricalData, CompanyMetrics } from './types';
import styles from './company-financials.module.css';

interface TrendSectionProps {
  trends: CompanyTrends | null;
  history: HistoricalData[];
  metrics: CompanyMetrics | null;
}

export function TrendSection({ trends, history, metrics }: TrendSectionProps) {
  const revenueChartRef = useRef<HTMLDivElement>(null);
  const profitChartRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (typeof window === 'undefined' || !history.length) return;

    // Dynamic import of ApexCharts
    import('apexcharts').then((ApexCharts) => {
      const sortedHistory = [...history].sort((a, b) => a.fiscalYear - b.fiscalYear);
      const years = sortedHistory.map(h => h.fiscalYear.toString());
      const revenues = sortedHistory.map(h => h.revenue || 0);
      const netIncomes = sortedHistory.map(h => h.netIncome || 0);

      const chartOptions = {
        chart: {
          type: 'area' as const,
          height: 200,
          toolbar: { show: false },
          fontFamily: 'DM Sans, sans-serif',
        },
        stroke: { curve: 'smooth' as const, width: 2 },
        fill: {
          type: 'gradient',
          gradient: {
            shadeIntensity: 1,
            opacityFrom: 0.4,
            opacityTo: 0.05,
          },
        },
        dataLabels: { enabled: false },
        xaxis: {
          categories: years,
          labels: { style: { colors: '#666' } },
        },
        yaxis: {
          labels: {
            formatter: (val: number) => formatCurrency(val, 0),
            style: { colors: '#666' },
          },
        },
        grid: { borderColor: '#f0eeea' },
        tooltip: {
          y: { formatter: (val: number) => formatCurrency(val) },
        },
      };

      // Revenue Chart
      if (revenueChartRef.current) {
        revenueChartRef.current.innerHTML = '';
        const revenueChart = new ApexCharts.default(revenueChartRef.current, {
          ...chartOptions,
          series: [{ name: 'Omsättning', data: revenues }],
          colors: ['#3b82f6'],
        });
        revenueChart.render();
      }

      // Profit Chart
      if (profitChartRef.current) {
        profitChartRef.current.innerHTML = '';
        const profitChart = new ApexCharts.default(profitChartRef.current, {
          ...chartOptions,
          series: [{ name: 'Resultat', data: netIncomes }],
          colors: ['#22c55e'],
        });
        profitChart.render();
      }
    });
  }, [history]);

  if (!trends && history.length < 2) {
    return (
      <div className={styles.emptyState}>
        <p>Minst 2 års historik krävs för trendanalys</p>
      </div>
    );
  }

  return (
    <div className={styles.trendSection}>
      {/* CAGR Summary Cards */}
      <div className={styles.trendCardsRow}>
        <div className={styles.trendCard}>
          <div className={styles.trendCardIcon} style={{ background: 'var(--blue-soft)', color: 'var(--blue)' }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
              <polyline points="17 6 23 6 23 12" />
            </svg>
          </div>
          <div className={styles.trendCardContent}>
            <div className={styles.trendCardLabel}>Omsättningstillväxt (CAGR)</div>
            <div className={`${styles.trendCardValue} ${trends?.revenueCAGR && trends.revenueCAGR >= 0 ? styles.positive : styles.negative}`}>
              {trends?.revenueCAGR !== null && trends?.revenueCAGR !== undefined
                ? formatPercent(trends.revenueCAGR)
                : '–'}
            </div>
            <div className={styles.trendCardPeriod}>
              {trends?.yearsAnalyzed ? `${trends.yearsAnalyzed} år` : '–'}
            </div>
          </div>
        </div>

        <div className={styles.trendCard}>
          <div className={styles.trendCardIcon} style={{ background: 'var(--green-soft)', color: 'var(--green)' }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="12" y1="1" x2="12" y2="23" />
              <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
            </svg>
          </div>
          <div className={styles.trendCardContent}>
            <div className={styles.trendCardLabel}>Resultattillväxt (CAGR)</div>
            <div className={`${styles.trendCardValue} ${trends?.netIncomeCAGR && trends.netIncomeCAGR >= 0 ? styles.positive : styles.negative}`}>
              {trends?.netIncomeCAGR !== null && trends?.netIncomeCAGR !== undefined
                ? formatPercent(trends.netIncomeCAGR)
                : '–'}
            </div>
            <div className={styles.trendCardPeriod}>
              {trends?.yearsAnalyzed ? `${trends.yearsAnalyzed} år` : '–'}
            </div>
          </div>
        </div>

        <div className={styles.trendCard}>
          <div className={styles.trendCardIcon} style={{ background: 'var(--purple-soft)', color: 'var(--purple)' }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
            </svg>
          </div>
          <div className={styles.trendCardContent}>
            <div className={styles.trendCardLabel}>Marginalförändring</div>
            <div className={`${styles.trendCardValue} ${trends?.marginChange && trends.marginChange >= 0 ? styles.positive : styles.negative}`}>
              {trends?.marginChange !== null && trends?.marginChange !== undefined
                ? `${trends.marginChange >= 0 ? '+' : ''}${trends.marginChange.toFixed(1)}pp`
                : '–'}
            </div>
            <div className={styles.trendCardPeriod}>procentenheter</div>
          </div>
        </div>

        <div className={styles.trendCard}>
          <div className={styles.trendCardIcon} style={{ background: 'var(--accent-gold-soft)', color: 'var(--accent-gold)' }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
            </svg>
          </div>
          <div className={styles.trendCardContent}>
            <div className={styles.trendCardLabel}>Soliditetsförändring</div>
            <div className={`${styles.trendCardValue} ${trends?.solidityChange && trends.solidityChange >= 0 ? styles.positive : styles.negative}`}>
              {trends?.solidityChange !== null && trends?.solidityChange !== undefined
                ? `${trends.solidityChange >= 0 ? '+' : ''}${trends.solidityChange.toFixed(1)}pp`
                : '–'}
            </div>
            <div className={styles.trendCardPeriod}>procentenheter</div>
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className={styles.chartsGrid}>
        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <h3 className={styles.cardTitle}>Omsättningsutveckling</h3>
          </div>
          <div className={styles.cardContent}>
            <div ref={revenueChartRef} className={styles.chart} />
          </div>
        </div>

        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <h3 className={styles.cardTitle}>Resultatutveckling</h3>
          </div>
          <div className={styles.cardContent}>
            <div ref={profitChartRef} className={styles.chart} />
          </div>
        </div>
      </div>

      {/* Historical Data Table */}
      <div className={styles.card}>
        <div className={styles.cardHeader}>
          <h3 className={styles.cardTitle}>Finansiell historik</h3>
        </div>
        <div className={styles.cardContent}>
          <div className={styles.tableWrapper}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>År</th>
                  <th>Omsättning</th>
                  <th>Resultat</th>
                  <th>Tillgångar</th>
                  <th>Eget kapital</th>
                  <th>Soliditet</th>
                  <th>Anställda</th>
                </tr>
              </thead>
              <tbody>
                {[...history]
                  .sort((a, b) => b.fiscalYear - a.fiscalYear)
                  .map((year) => (
                    <tr key={year.fiscalYear}>
                      <td className={styles.yearCell}>{year.fiscalYear}</td>
                      <td>{formatCurrency(year.revenue)}</td>
                      <td className={year.netIncome && year.netIncome < 0 ? styles.negative : ''}>
                        {formatCurrency(year.netIncome)}
                      </td>
                      <td>{formatCurrency(year.totalAssets)}</td>
                      <td>{formatCurrency(year.equity)}</td>
                      <td>{year.solidityRatio ? `${year.solidityRatio.toFixed(1)}%` : '–'}</td>
                      <td>{year.avgEmployees || '–'}</td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
