'use client';

import { useEffect, useRef } from 'react';
import { formatCurrency } from './use-company-financials';
import type { CompanyMetrics, BalanceSheet, IncomeStatement, HistoricalData } from './types';
import styles from './company-financials.module.css';

interface OverviewSectionProps {
  metrics: CompanyMetrics | null;
  balanceSheet: BalanceSheet | null;
  incomeStatement: IncomeStatement | null;
  history: HistoricalData[];
}

export function OverviewSection({ metrics, balanceSheet, incomeStatement, history }: OverviewSectionProps) {
  const waterfallChartRef = useRef<HTMLDivElement>(null);
  const radarChartRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (typeof window === 'undefined' || !incomeStatement) return;

    import('apexcharts').then((ApexCharts) => {
      // Waterfall Chart - Income Statement
      if (waterfallChartRef.current && incomeStatement) {
        waterfallChartRef.current.innerHTML = '';

        const waterfallData = [
          { x: 'Omsättning', y: incomeStatement.revenue },
          { x: 'Råvaror', y: -incomeStatement.rawMaterialCosts },
          { x: 'Personal', y: -incomeStatement.personnelCosts },
          { x: 'Externa kostn.', y: -incomeStatement.otherExternalCosts },
          { x: 'Avskrivn.', y: -incomeStatement.depreciation },
          { x: 'Rörelseresultat', y: incomeStatement.operatingResult },
        ];

        const waterfallChart = new ApexCharts.default(waterfallChartRef.current, {
          chart: {
            type: 'bar',
            height: 280,
            toolbar: { show: false },
            fontFamily: 'DM Sans, sans-serif',
          },
          plotOptions: {
            bar: {
              horizontal: false,
              columnWidth: '60%',
              borderRadius: 4,
              colors: {
                ranges: [
                  { from: -1000000000, to: 0, color: '#ef4444' },
                  { from: 0, to: 1000000000, color: '#22c55e' },
                ],
              },
            },
          },
          dataLabels: { enabled: false },
          series: [{ name: 'Belopp', data: waterfallData }],
          xaxis: {
            labels: { style: { colors: '#666', fontSize: '11px' } },
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
        });
        waterfallChart.render();
      }

      // Radar Chart - Key Metrics
      if (radarChartRef.current && metrics) {
        radarChartRef.current.innerHTML = '';

        // Normalize metrics to 0-100 scale
        const normalize = (value: number | null, min: number, max: number): number => {
          if (value === null) return 0;
          return Math.min(100, Math.max(0, ((value - min) / (max - min)) * 100));
        };

        const radarChart = new ApexCharts.default(radarChartRef.current, {
          chart: {
            type: 'radar',
            height: 280,
            toolbar: { show: false },
            fontFamily: 'DM Sans, sans-serif',
          },
          series: [{
            name: 'Nyckeltal',
            data: [
              normalize(metrics.profitMargin, -5, 20),
              normalize(metrics.roe, 0, 30),
              normalize(metrics.solidityRatio, 0, 60),
              normalize(metrics.currentRatio, 0, 3) * 33.33,
              normalize(metrics.assetTurnover, 0, 5) * 20,
            ],
          }],
          xaxis: {
            categories: ['Vinstmarginal', 'ROE', 'Soliditet', 'Likviditet', 'Kapitaloms.'],
          },
          yaxis: { show: false },
          colors: ['#3b82f6'],
          fill: { opacity: 0.25 },
          stroke: { width: 2 },
          markers: { size: 4 },
        });
        radarChart.render();
      }
    });
  }, [incomeStatement, metrics]);

  return (
    <div className={styles.overviewSection}>
      {/* Key Metrics Grid */}
      <div className={styles.metricsGrid}>
        <MetricCard
          title="Vinstmarginal"
          value={metrics?.profitMargin}
          suffix="%"
          description="Nettoresultat / Omsättning"
          benchmark="Branschsnitt: 5-10%"
        />
        <MetricCard
          title="ROE"
          value={metrics?.roe}
          suffix="%"
          description="Avkastning på eget kapital"
          benchmark="Branschsnitt: 12-18%"
        />
        <MetricCard
          title="ROA"
          value={metrics?.roa}
          suffix="%"
          description="Avkastning på totala tillgångar"
          benchmark="Branschsnitt: 5-10%"
        />
        <MetricCard
          title="Rörelsemarginal"
          value={metrics?.operatingMargin}
          suffix="%"
          description="Rörelseresultat / Omsättning"
          benchmark="Branschsnitt: 8-15%"
        />
      </div>

      {/* Charts Row */}
      <div className={styles.chartsGrid}>
        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <h3 className={styles.cardTitle}>Resultaträkning</h3>
          </div>
          <div className={styles.cardContent}>
            <div ref={waterfallChartRef} className={styles.chart} />
          </div>
        </div>

        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <h3 className={styles.cardTitle}>Nyckeltalsprofil</h3>
          </div>
          <div className={styles.cardContent}>
            <div ref={radarChartRef} className={styles.chart} />
          </div>
        </div>
      </div>

      {/* Balance Sheet */}
      {balanceSheet && (
        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <h3 className={styles.cardTitle}>Balansräkning</h3>
          </div>
          <div className={styles.cardContent}>
            <div className={styles.balanceSheetGrid}>
              <div className={styles.balanceColumn}>
                <h4>Tillgångar</h4>
                <div className={styles.balanceItems}>
                  <BalanceItem label="Anläggningstillgångar" value={balanceSheet.assets.fixed} />
                  <BalanceItem label="Kundfordringar" value={balanceSheet.assets.accountsReceivable} />
                  <BalanceItem label="Övriga fordringar" value={balanceSheet.assets.otherReceivables} />
                  <BalanceItem label="Varulager" value={balanceSheet.assets.inventory} />
                  <BalanceItem label="Kassa & bank" value={balanceSheet.assets.cashAndBank} />
                  <div className={styles.balanceTotal}>
                    <span>Summa tillgångar</span>
                    <span>{formatCurrency(balanceSheet.assets.total)}</span>
                  </div>
                </div>
              </div>

              <div className={styles.balanceColumn}>
                <h4>Eget kapital & skulder</h4>
                <div className={styles.balanceItems}>
                  <BalanceItem label="Eget kapital" value={balanceSheet.equityAndLiabilities.equity} highlight />
                  <BalanceItem label="Långfristiga skulder" value={balanceSheet.equityAndLiabilities.longTermLiabilities} />
                  <BalanceItem label="Leverantörsskulder" value={balanceSheet.equityAndLiabilities.accountsPayable} />
                  <BalanceItem label="Kortfristiga skulder" value={balanceSheet.equityAndLiabilities.currentLiabilities} />
                  <div className={styles.balanceTotal}>
                    <span>Summa EK & skulder</span>
                    <span>{formatCurrency(balanceSheet.equityAndLiabilities.total)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

interface MetricCardProps {
  title: string;
  value: number | null | undefined;
  suffix?: string;
  description: string;
  benchmark: string;
}

function MetricCard({ title, value, suffix = '', description, benchmark }: MetricCardProps) {
  const displayValue = value !== null && value !== undefined ? value.toFixed(1) : '–';
  const isPositive = value !== null && value !== undefined && value > 0;

  return (
    <div className={styles.metricCard}>
      <div className={styles.metricTitle}>{title}</div>
      <div className={`${styles.metricValue} ${isPositive ? styles.positive : ''}`}>
        {displayValue}{value !== null && value !== undefined && suffix}
      </div>
      <div className={styles.metricDescription}>{description}</div>
      <div className={styles.metricBenchmark}>{benchmark}</div>
    </div>
  );
}

interface BalanceItemProps {
  label: string;
  value: number;
  highlight?: boolean;
}

function BalanceItem({ label, value, highlight }: BalanceItemProps) {
  return (
    <div className={`${styles.balanceItem} ${highlight ? styles.highlight : ''}`}>
      <span>{label}</span>
      <span>{formatCurrency(value)}</span>
    </div>
  );
}
