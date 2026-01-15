'use client';

import { useState } from 'react';
import { PersonRole, getInitials, formatRoleType } from '../types';
import styles from '../PersonProfile.module.css';

interface PersonEngagementsProps {
  roles: PersonRole[];
  activeCount: number;
}

type FilterTab = 'all' | 'active' | 'board' | 'management';

export function PersonEngagements({ roles, activeCount }: PersonEngagementsProps) {
  const [activeTab, setActiveTab] = useState<FilterTab>('all');

  // Filtrera roller baserat på vald tab
  const filteredRoles = roles.filter(role => {
    switch (activeTab) {
      case 'active':
        return role.isActive;
      case 'board':
        return ['CHAIRMAN', 'VICE_CHAIRMAN', 'BOARD_MEMBER', 'BOARD_DEPUTY'].includes(role.roleType);
      case 'management':
        return ['CEO', 'DEPUTY_CEO', 'CFO', 'CTO', 'COO'].includes(role.roleType);
      default:
        return true;
    }
  });

  // Sortera: aktiva först, sedan efter startdatum
  const sortedRoles = [...filteredRoles].sort((a, b) => {
    if (a.isActive !== b.isActive) return a.isActive ? -1 : 1;
    if (a.startDate && b.startDate) return b.startDate.localeCompare(a.startDate);
    return 0;
  });

  return (
    <section className={styles.section}>
      <div className={styles.sectionHeader}>
        <div className={styles.sectionTitle}>
          <h2>Bolagsengagemang</h2>
          <span className={styles.count}>{activeCount} aktiva</span>
        </div>
      </div>

      {/* Filter tabs */}
      <div className={styles.tabs}>
        <TabButton
          active={activeTab === 'all'}
          onClick={() => setActiveTab('all')}
          label="Alla"
        />
        <TabButton
          active={activeTab === 'active'}
          onClick={() => setActiveTab('active')}
          label="Aktiva"
        />
        <TabButton
          active={activeTab === 'board'}
          onClick={() => setActiveTab('board')}
          label="Styrelse"
        />
        <TabButton
          active={activeTab === 'management'}
          onClick={() => setActiveTab('management')}
          label="Ledning"
        />
      </div>

      {/* Engagements grid */}
      <div className={styles.engagementsGrid}>
        {sortedRoles.map((role) => (
          <EngagementCard key={role.id} role={role} />
        ))}

        {sortedRoles.length === 0 && (
          <div className={styles.emptyFilter}>
            Inga engagemang matchar filtret
          </div>
        )}
      </div>
    </section>
  );
}

// === Sub-components ===

function TabButton({
  active,
  onClick,
  label,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
}) {
  return (
    <button
      className={`${styles.tab} ${active ? styles.active : ''}`}
      onClick={onClick}
    >
      {label}
    </button>
  );
}

function EngagementCard({ role }: { role: PersonRole }) {
  const initials = getInitials(role.companyName);
  const roleTitle = role.roleTitle || formatRoleType(role.roleType);

  // Formatera period
  const startYear = role.startDate ? new Date(role.startDate).getFullYear() : null;
  const endYear = role.endDate ? new Date(role.endDate).getFullYear() : null;
  const period = startYear
    ? `${startYear} - ${role.isActive ? 'Nu' : endYear || 'Okänt'}`
    : null;

  // Bestäm badge-typ
  const getBadgeClass = () => {
    if (['CHAIRMAN', 'VICE_CHAIRMAN'].includes(role.roleType)) return styles.chairman;
    if (['CEO', 'DEPUTY_CEO'].includes(role.roleType)) return styles.ceo;
    if (['BOARD_MEMBER', 'BOARD_DEPUTY'].includes(role.roleType)) return styles.board;
    return '';
  };

  return (
    <a href={`/company/${role.orgNumber}`} className={styles.engagementCard}>
      <div className={styles.engagementLogo}>
        {role.company?.logoUrl ? (
          <img src={role.company.logoUrl} alt={role.companyName} />
        ) : (
          initials
        )}
      </div>
      <div className={styles.engagementContent}>
        <div className={styles.engagementCompany}>{role.companyName}</div>
        <div className={styles.engagementRole}>{roleTitle}</div>
        <div className={styles.engagementMeta}>
          {role.isActive && (
            <span className={`${styles.engagementBadge} ${styles.active}`}>Aktiv</span>
          )}
          {getBadgeClass() && (
            <span className={`${styles.engagementBadge} ${getBadgeClass()}`}>
              {formatRoleType(role.roleType)}
            </span>
          )}
          {period && (
            <span className={styles.engagementMetaItem}>{period}</span>
          )}
        </div>
      </div>
    </a>
  );
}
