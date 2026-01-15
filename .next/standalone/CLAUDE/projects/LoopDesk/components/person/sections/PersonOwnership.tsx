'use client';

import {
  PersonOwnership as OwnershipType,
  BeneficialOwnership as BeneficialType,
  getInitials,
} from '../types';
import styles from '../PersonProfile.module.css';

interface PersonOwnershipProps {
  directOwnerships?: OwnershipType[];
  indirectOwnerships?: OwnershipType[];
  beneficialOwnerships?: BeneficialType[];
}

export function PersonOwnership({
  directOwnerships = [],
  indirectOwnerships = [],
  beneficialOwnerships = [],
}: PersonOwnershipProps) {
  const hasDirectOrIndirect = directOwnerships.length > 0 || indirectOwnerships.length > 0;
  const hasBeneficial = beneficialOwnerships.length > 0;

  if (!hasDirectOrIndirect && !hasBeneficial) {
    return null;
  }

  const totalCount = directOwnerships.length + indirectOwnerships.length + beneficialOwnerships.length;

  return (
    <section className={styles.section}>
      <div className={styles.sectionHeader}>
        <div className={styles.sectionTitle}>
          <h2>Ägarstruktur</h2>
          <span className={styles.count}>{totalCount} bolag</span>
        </div>
        <button className={styles.sectionAction}>
          Visa alla
          <ChevronRightIcon />
        </button>
      </div>

      <div className={styles.ownershipGrid}>
        {/* Direkta innehav */}
        {(directOwnerships.length > 0 || indirectOwnerships.length > 0) && (
          <div className={styles.ownershipCard}>
            <div className={styles.ownershipCardHeader}>
              <div className={styles.ownershipCardTitle}>Direkta innehav</div>
              <div className={styles.ownershipCardTotal}>
                {directOwnerships.length + indirectOwnerships.length} bolag
              </div>
            </div>
            <div className={styles.ownershipList}>
              {[...directOwnerships, ...indirectOwnerships].slice(0, 4).map((ownership, index) => (
                <OwnershipItem key={ownership.id || index} ownership={ownership} />
              ))}
            </div>
          </div>
        )}

        {/* Verklig huvudman */}
        {hasBeneficial && (
          <div className={styles.ownershipCard}>
            <div className={styles.ownershipCardHeader}>
              <div className={styles.ownershipCardTitle}>Verklig huvudman</div>
              <div className={styles.ownershipCardTotal}>
                {beneficialOwnerships.length} bolag
              </div>
            </div>
            <div className={styles.ownershipList}>
              {beneficialOwnerships.slice(0, 4).map((bo, index) => (
                <BeneficialOwnershipItem key={bo.id || index} ownership={bo} />
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}

// === Sub-components ===

function OwnershipItem({ ownership }: { ownership: OwnershipType }) {
  const initials = getInitials(ownership.companyName);
  const percentage = ownership.percentage;

  return (
    <div className={styles.ownershipItem}>
      <div className={styles.ownershipLogo}>{initials}</div>
      <div className={styles.ownershipInfo}>
        <div className={styles.ownershipCompany}>{ownership.companyName}</div>
        <div className={styles.ownershipMeta}>
          {ownership.company?.companyType || 'Aktiebolag'}
          {ownership.company?.city && ` - ${ownership.company.city}`}
        </div>
      </div>
      {percentage !== undefined && (
        <div className={styles.ownershipPercentage}>
          <div className={styles.ownershipPercentageValue}>{percentage.toFixed(0)}%</div>
          <div className={styles.ownershipPercentageBar}>
            <div
              className={styles.ownershipPercentageFill}
              style={{ width: `${Math.min(percentage, 100)}%` }}
            />
          </div>
        </div>
      )}
    </div>
  );
}

function BeneficialOwnershipItem({ ownership }: { ownership: BeneficialType }) {
  const companyName = ownership.companyName || `Org.nr: ${ownership.orgNumber}`;
  const initials = getInitials(companyName.replace(/Org\.nr:/, '').trim());

  // Formatera procent-range
  const percentRange = ownership.percentageVotesMin && ownership.percentageVotesMax
    ? `${ownership.percentageVotesMin}-${ownership.percentageVotesMax}%`
    : ownership.percentageVotesMax
    ? `${ownership.percentageVotesMax}%`
    : 'Okänd andel';

  return (
    <div className={styles.ownershipItem}>
      <div className={styles.ownershipLogo}>{initials}</div>
      <div className={styles.ownershipInfo}>
        <div className={styles.ownershipCompany}>{companyName}</div>
        <div className={styles.ownershipMeta}>
          {ownership.viaEntity || 'Kontroll via röster'}
        </div>
      </div>
      <div>
        <span className={`${styles.ownershipTypeBadge} ${styles.beneficial}`}>
          {percentRange}
        </span>
      </div>
    </div>
  );
}

// Icons
const ChevronRightIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <polyline points="9 18 15 12 9 6" />
  </svg>
);
