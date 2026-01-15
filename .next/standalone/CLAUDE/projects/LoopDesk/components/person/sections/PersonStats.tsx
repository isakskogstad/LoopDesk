'use client';

import styles from '../PersonProfile.module.css';

interface PersonStatsProps {
  totalCompanies?: number;
  totalBoardSeats?: number;
  totalInvestments?: number;
  activeCompanies?: number;
  foundedCompanies?: number;
}

export function PersonStats({
  totalCompanies,
  totalBoardSeats,
  totalInvestments,
  foundedCompanies,
}: PersonStatsProps) {
  // Samla endast stats som har värden
  const stats: Array<{ value: number; label: string; icon: React.ReactNode; colorClass: string }> = [];

  if (totalCompanies !== undefined && totalCompanies > 0) {
    stats.push({
      value: totalCompanies,
      label: 'Bolagsengagemang',
      icon: <BriefcaseIcon />,
      colorClass: styles.statIconCompanies,
    });
  }

  if (totalBoardSeats !== undefined && totalBoardSeats > 0) {
    stats.push({
      value: totalBoardSeats,
      label: 'Styrelseplatser',
      icon: <BoardIcon />,
      colorClass: styles.statIconBoards,
    });
  }

  if (foundedCompanies !== undefined && foundedCompanies > 0) {
    stats.push({
      value: foundedCompanies,
      label: 'Grundade bolag',
      icon: <StarIcon />,
      colorClass: styles.statIconFounded,
    });
  }

  if (totalInvestments !== undefined && totalInvestments > 0) {
    stats.push({
      value: totalInvestments,
      label: 'Investeringar',
      icon: <InvestmentIcon />,
      colorClass: styles.statIconInvestments,
    });
  }

  // Visa inte sektionen om inga stats finns
  if (stats.length === 0) {
    return null;
  }

  return (
    <section className={styles.statsGrid}>
      {stats.map((stat, index) => (
        <div key={index} className={styles.statCard}>
          <div className={`${styles.statIcon} ${stat.colorClass}`}>
            {stat.icon}
          </div>
          <div className={styles.statValue}>{stat.value}</div>
          <div className={styles.statLabel}>{stat.label}</div>
        </div>
      ))}
    </section>
  );
}

// Icons
const BriefcaseIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
    <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
  </svg>
);

const BoardIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <rect x="3" y="3" width="18" height="18" rx="2" />
    <path d="M3 9h18" />
  </svg>
);

const StarIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
  </svg>
);

const InvestmentIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <line x1="12" y1="1" x2="12" y2="23" />
    <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
  </svg>
);
