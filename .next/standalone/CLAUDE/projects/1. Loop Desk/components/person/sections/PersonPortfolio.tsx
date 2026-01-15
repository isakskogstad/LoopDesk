'use client';

import { PortfolioSummary, formatAmount } from '../types';
import styles from '../PersonProfile.module.css';

interface PersonPortfolioProps {
  portfolio: PortfolioSummary;
}

export function PersonPortfolio({ portfolio }: PersonPortfolioProps) {
  const {
    totalValue,
    totalRevenue,
    totalProfit,
    totalFunding,
    totalEmployees,
  } = portfolio;

  // Samla stats som har värden
  const stats: Array<{ value: string; label: string }> = [];

  if (totalRevenue) {
    stats.push({ value: formatAmount(totalRevenue), label: 'Total omsättning' });
  }
  if (totalProfit) {
    stats.push({ value: formatAmount(totalProfit), label: 'Total vinst' });
  }
  if (totalFunding) {
    stats.push({ value: formatAmount(totalFunding), label: 'Total funding' });
  }
  if (totalEmployees) {
    stats.push({ value: totalEmployees.toString(), label: 'Totalt anställda' });
  }

  // Visa inte om ingen data finns
  if (!totalValue && stats.length === 0) {
    return null;
  }

  return (
    <section className={styles.portfolioCard}>
      <div className={styles.portfolioHeader}>
        <div>
          <div className={styles.portfolioTitle}>Aggregerat portföljvärde</div>
          {totalValue ? (
            <div className={styles.portfolioValue}>
              {formatAmount(totalValue).split(' ')[0]}
              <span className={styles.unit}> {formatAmount(totalValue).split(' ')[1]}</span>
            </div>
          ) : (
            <div className={styles.portfolioValue}>
              <span className={styles.unit}>Ej beräknat</span>
            </div>
          )}
          <div className={styles.portfolioSubtitle}>
            Totalt värde av alla bolagsengagemang
          </div>
        </div>
      </div>

      {stats.length > 0 && (
        <div className={styles.portfolioStats}>
          {stats.map((stat, index) => (
            <div key={index} className={styles.portfolioStat}>
              <div className={styles.portfolioStatValue}>
                {stat.value.split(' ')[0]}
                {stat.value.includes(' ') && (
                  <span className={styles.unit}> {stat.value.split(' ')[1]}</span>
                )}
              </div>
              <div className={styles.portfolioStatLabel}>{stat.label}</div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
