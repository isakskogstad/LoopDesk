'use client';

import { formatCurrency } from './use-company-financials';
import type { CompanyValuation, CompanyMetrics, IncomeStatement } from './types';
import styles from './company-financials.module.css';

interface ValuationSectionProps {
  valuation: CompanyValuation | null;
  metrics: CompanyMetrics | null;
  incomeStatement: IncomeStatement | null;
}

export function ValuationSection({ valuation, metrics, incomeStatement }: ValuationSectionProps) {
  if (!valuation) {
    return (
      <div className={styles.emptyState}>
        <p>Otillräcklig data för värderingsberäkning</p>
      </div>
    );
  }

  const revenue = incomeStatement?.revenue || 0;
  const netIncome = incomeStatement?.netIncome || 0;

  return (
    <div className={styles.valuationSection}>
      {/* Valuation Summary Card */}
      <div className={styles.card}>
        <div className={styles.cardHeader}>
          <h3 className={styles.cardTitle}>Värderingsöversikt</h3>
        </div>
        <div className={styles.cardContent}>
          <div className={styles.valuationGrid}>
            <div className={styles.valuationItem}>
              <div className={styles.valuationLabel}>Bokfört värde (Eget kapital)</div>
              <div className={styles.valuationValue}>{formatCurrency(valuation.bookValue)}</div>
            </div>
            <div className={styles.valuationItem}>
              <div className={styles.valuationLabel}>EBITDA</div>
              <div className={styles.valuationValue}>{formatCurrency(valuation.ebitda)}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Valuation Methods */}
      <div className={styles.cardGrid}>
        {/* EV/Revenue */}
        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <h3 className={styles.cardTitle}>EV/Omsättning</h3>
            <span className={styles.cardBadge}>{valuation.evRevenueRange.multiple}x</span>
          </div>
          <div className={styles.cardContent}>
            <ValuationBar
              low={valuation.evRevenueRange.low}
              mid={valuation.evRevenueRange.mid}
              high={valuation.evRevenueRange.high}
            />
            <div className={styles.valuationDetails}>
              <span>Omsättning: {formatCurrency(revenue)}</span>
            </div>
          </div>
        </div>

        {/* EV/EBITDA */}
        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <h3 className={styles.cardTitle}>EV/EBITDA</h3>
            <span className={styles.cardBadge}>{valuation.evEbitdaRange.multiple}x</span>
          </div>
          <div className={styles.cardContent}>
            <ValuationBar
              low={valuation.evEbitdaRange.low}
              mid={valuation.evEbitdaRange.mid}
              high={valuation.evEbitdaRange.high}
            />
            <div className={styles.valuationDetails}>
              <span>EBITDA: {formatCurrency(valuation.ebitda)}</span>
            </div>
          </div>
        </div>

        {/* P/E */}
        {valuation.peRange && (
          <div className={styles.card}>
            <div className={styles.cardHeader}>
              <h3 className={styles.cardTitle}>P/E-tal</h3>
              <span className={styles.cardBadge}>{valuation.peRange.multiple}x</span>
            </div>
            <div className={styles.cardContent}>
              <ValuationBar
                low={valuation.peRange.low}
                mid={valuation.peRange.mid}
                high={valuation.peRange.high}
              />
              <div className={styles.valuationDetails}>
                <span>Resultat: {formatCurrency(netIncome)}</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Multiples Table */}
      <div className={styles.card}>
        <div className={styles.cardHeader}>
          <h3 className={styles.cardTitle}>Nyckeltal för värdering</h3>
        </div>
        <div className={styles.cardContent}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Metrik</th>
                <th>Värde</th>
                <th>Branschsnitt</th>
                <th>Jämförelse</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Vinstmarginal</td>
                <td>{metrics?.profitMargin?.toFixed(1) || '–'}%</td>
                <td>5–10%</td>
                <td>{getComparison(metrics?.profitMargin, 5, 10)}</td>
              </tr>
              <tr>
                <td>ROE</td>
                <td>{metrics?.roe?.toFixed(1) || '–'}%</td>
                <td>12–18%</td>
                <td>{getComparison(metrics?.roe, 12, 18)}</td>
              </tr>
              <tr>
                <td>EBITDA-marginal</td>
                <td>{metrics?.ebitdaMargin?.toFixed(1) || '–'}%</td>
                <td>10–20%</td>
                <td>{getComparison(metrics?.ebitdaMargin, 10, 20)}</td>
              </tr>
              <tr>
                <td>Omsättning/anställd</td>
                <td>{metrics?.revenuePerEmployee ? formatCurrency(metrics.revenuePerEmployee) : '–'}</td>
                <td>1.5–2.5 MSEK</td>
                <td>{getComparison(metrics?.revenuePerEmployee ? metrics.revenuePerEmployee / 1_000_000 : null, 1.5, 2.5)}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

interface ValuationBarProps {
  low: number;
  mid: number;
  high: number;
}

function ValuationBar({ low, mid, high }: ValuationBarProps) {
  const range = high - low;
  const midPosition = ((mid - low) / range) * 100;

  return (
    <div className={styles.valuationBar}>
      <div className={styles.valuationBarTrack}>
        <div
          className={styles.valuationBarFill}
          style={{ width: '100%' }}
        />
        <div
          className={styles.valuationBarMarker}
          style={{ left: `${midPosition}%` }}
        />
      </div>
      <div className={styles.valuationBarLabels}>
        <span>{formatCurrency(low)}</span>
        <span className={styles.valuationBarMid}>{formatCurrency(mid)}</span>
        <span>{formatCurrency(high)}</span>
      </div>
    </div>
  );
}

function getComparison(value: number | null | undefined, low: number, high: number): React.ReactNode {
  if (value === null || value === undefined) return '–';

  if (value > high) {
    return <span className={styles.comparisonPositive}>↑ Över</span>;
  }
  if (value < low) {
    return <span className={styles.comparisonNegative}>↓ Under</span>;
  }
  return <span className={styles.comparisonNeutral}>→ Normal</span>;
}
