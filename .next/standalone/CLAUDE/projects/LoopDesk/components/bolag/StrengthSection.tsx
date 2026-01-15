'use client';

import { getStatusColor, getStatusBgColor } from './use-company-financials';
import type { CompanyStrength, CompanyMetrics } from './types';
import styles from './company-financials.module.css';

interface StrengthSectionProps {
  strength: CompanyStrength;
  metrics: CompanyMetrics | null;
}

export function StrengthSection({ strength, metrics }: StrengthSectionProps) {
  return (
    <div className={styles.strengthSection}>
      {/* Score Cards Row */}
      <div className={styles.scoreCardsRow}>
        {/* Altman Z-Score */}
        <div className={styles.scoreCard}>
          <div className={styles.scoreCardHeader}>
            <h3>Altman Z-Score</h3>
            <a href="https://en.wikipedia.org/wiki/Altman_Z-score" target="_blank" rel="noopener noreferrer" className={styles.infoIcon}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10" />
                <path d="M12 16v-4M12 8h.01" />
              </svg>
            </a>
          </div>
          <div className={styles.scoreCardBody}>
            {strength.altmanZ ? (
              <>
                <div
                  className={styles.scoreValue}
                  style={{ color: getStatusColor(strength.altmanZ.status) }}
                >
                  {strength.altmanZ.score.toFixed(2)}
                </div>
                <div
                  className={styles.scoreBadge}
                  style={{
                    backgroundColor: getStatusBgColor(strength.altmanZ.status),
                    color: getStatusColor(strength.altmanZ.status),
                  }}
                >
                  {translateZStatus(strength.altmanZ.status)}
                </div>
                <div className={styles.scoreScale}>
                  <div className={styles.scaleBar}>
                    <div className={styles.scaleZone} style={{ background: 'var(--accent-soft)', width: '33%' }} />
                    <div className={styles.scaleZone} style={{ background: 'var(--orange-soft)', width: '34%' }} />
                    <div className={styles.scaleZone} style={{ background: 'var(--green-soft)', width: '33%' }} />
                    <div
                      className={styles.scaleMarker}
                      style={{ left: `${getZPosition(strength.altmanZ.score)}%` }}
                    />
                  </div>
                  <div className={styles.scaleLabels}>
                    <span>&lt;1.23 Risk</span>
                    <span>1.23-2.9 Gråzon</span>
                    <span>&gt;2.9 Säker</span>
                  </div>
                </div>
              </>
            ) : (
              <div className={styles.emptyState}>Otillräcklig data</div>
            )}
          </div>
        </div>

        {/* Piotroski F-Score */}
        <div className={styles.scoreCard}>
          <div className={styles.scoreCardHeader}>
            <h3>Piotroski F-Score</h3>
            <a href="https://en.wikipedia.org/wiki/Piotroski_F-score" target="_blank" rel="noopener noreferrer" className={styles.infoIcon}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10" />
                <path d="M12 16v-4M12 8h.01" />
              </svg>
            </a>
          </div>
          <div className={styles.scoreCardBody}>
            {strength.piotroskiF ? (
              <>
                <div className={styles.scoreValue}>
                  <span style={{ color: getFScoreColor(strength.piotroskiF.score) }}>
                    {strength.piotroskiF.score}
                  </span>
                  <span className={styles.scoreMax}>/9</span>
                </div>
                <div className={styles.fScoreGrid}>
                  {Array.from({ length: 9 }, (_, i) => (
                    <div
                      key={i}
                      className={`${styles.fScoreDot} ${i < strength.piotroskiF!.score ? styles.active : ''}`}
                    />
                  ))}
                </div>
                <div className={styles.fScoreDetails}>
                  {strength.piotroskiF.details.map((detail, i) => (
                    <div key={i} className={styles.fScoreDetail}>
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="var(--green)" strokeWidth="3">
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                      {detail}
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div className={styles.emptyState}>Otillräcklig data</div>
            )}
          </div>
        </div>
      </div>

      {/* Ratio Cards */}
      <div className={styles.ratioCardsGrid}>
        <RatioCard
          title="Räntetäckningsgrad"
          data={strength.interestCoverage}
          description="EBIT / Räntekostnader"
          thresholds={['<1 Svag', '1-2.5 OK', '2.5-5 Bra', '>5 Utmärkt']}
        />
        <RatioCard
          title="Current Ratio"
          data={strength.currentRatio}
          description="Omsättningstillgångar / Kortfristiga skulder"
          thresholds={['<1 Svag', '1-1.5 OK', '1.5-2 Bra', '>2 Stark']}
        />
        <RatioCard
          title="Quick Ratio"
          data={strength.quickRatio}
          description="(Oms.tillg. - Lager) / Kortfr. skulder"
          thresholds={['<0.5 Svag', '0.5-1 OK', '1-1.5 Bra', '>1.5 Stark']}
        />
        <RatioCard
          title="Skuldsättningsgrad"
          data={strength.debtRatio}
          description="Totala skulder / Eget kapital"
          thresholds={['<1 Låg', '1-2 Måttlig', '>2 Hög']}
          inverted
        />
      </div>

      {/* Overall Assessment */}
      <div className={styles.card}>
        <div className={styles.cardHeader}>
          <h3 className={styles.cardTitle}>Helhetsbedömning</h3>
        </div>
        <div className={styles.cardContent}>
          <div className={styles.overallAssessment}>
            <div
              className={styles.overallBadge}
              style={{
                backgroundColor: getStatusBgColor(strength.overall || 'Weak'),
                color: getStatusColor(strength.overall || 'Weak'),
              }}
            >
              {translateOverall(strength.overall)}
            </div>
            <p className={styles.overallDescription}>
              {getOverallDescription(strength)}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

interface RatioCardProps {
  title: string;
  data: { value: number; status: string } | null;
  description: string;
  thresholds: string[];
  inverted?: boolean;
}

function RatioCard({ title, data, description, thresholds, inverted }: RatioCardProps) {
  return (
    <div className={styles.ratioCard}>
      <div className={styles.ratioCardHeader}>
        <span className={styles.ratioTitle}>{title}</span>
        {data && (
          <span
            className={styles.ratioBadge}
            style={{
              backgroundColor: getStatusBgColor(data.status),
              color: getStatusColor(data.status),
            }}
          >
            {translateStatus(data.status)}
          </span>
        )}
      </div>
      <div className={styles.ratioValue}>
        {data ? data.value.toFixed(2) : '–'}
      </div>
      <div className={styles.ratioDescription}>{description}</div>
      <div className={styles.ratioThresholds}>
        {thresholds.map((t, i) => (
          <span key={i}>{t}</span>
        ))}
      </div>
    </div>
  );
}

function getZPosition(score: number): number {
  if (score < 0) return 0;
  if (score > 5) return 100;
  if (score <= 1.23) return (score / 1.23) * 33;
  if (score <= 2.9) return 33 + ((score - 1.23) / (2.9 - 1.23)) * 34;
  return 67 + ((score - 2.9) / (5 - 2.9)) * 33;
}

function getFScoreColor(score: number): string {
  if (score >= 7) return 'var(--green)';
  if (score >= 5) return 'var(--blue)';
  if (score >= 3) return 'var(--orange)';
  return 'var(--accent)';
}

function translateZStatus(status: string): string {
  const map: Record<string, string> = {
    'Safe': 'Säker zon',
    'Grey': 'Gråzon',
    'Distress': 'Riskzon',
  };
  return map[status] || status;
}

function translateStatus(status: string): string {
  const map: Record<string, string> = {
    'Excellent': 'Utmärkt',
    'Strong': 'Stark',
    'Good': 'Bra',
    'Adequate': 'OK',
    'Moderate': 'Måttlig',
    'Weak': 'Svag',
    'High': 'Hög',
    'Low': 'Låg',
  };
  return map[status] || status;
}

function translateOverall(status: string | null): string {
  if (!status) return 'Okänd';
  const map: Record<string, string> = {
    'Strong': 'Stark finansiell ställning',
    'Adequate': 'Tillräcklig finansiell ställning',
    'Weak': 'Svag finansiell ställning',
  };
  return map[status] || status;
}

function getOverallDescription(strength: CompanyStrength): string {
  const parts: string[] = [];

  if (strength.altmanZ) {
    if (strength.altmanZ.status === 'Safe') {
      parts.push('Altman Z-Score indikerar låg konkursrisk');
    } else if (strength.altmanZ.status === 'Grey') {
      parts.push('Altman Z-Score visar på gråzon - viss osäkerhet');
    } else {
      parts.push('Altman Z-Score indikerar förhöjd konkursrisk');
    }
  }

  if (strength.piotroskiF) {
    if (strength.piotroskiF.score >= 7) {
      parts.push('Piotroski-poängen visar stark fundamental kvalitet');
    } else if (strength.piotroskiF.score >= 5) {
      parts.push('Piotroski-poängen visar acceptabel fundamental kvalitet');
    } else {
      parts.push('Piotroski-poängen indikerar svagare fundamenta');
    }
  }

  if (strength.interestCoverage && strength.interestCoverage.value > 5) {
    parts.push('God förmåga att täcka räntekostnader');
  }

  return parts.length > 0 ? parts.join('. ') + '.' : 'Otillräcklig data för helhetsbedömning.';
}
