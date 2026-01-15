'use client';

import { useState } from 'react';
import styles from '../PersonProfile.module.css';

interface PersonBioProps {
  bio: string;
}

export function PersonBio({ bio }: PersonBioProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  // Dela upp bio i stycken
  const paragraphs = bio.split(/\n\n|\n/).filter(p => p.trim().length > 0);

  // Visa max 2 stycken om inte expanderad
  const visibleParagraphs = isExpanded ? paragraphs : paragraphs.slice(0, 2);
  const hasMore = paragraphs.length > 2;

  return (
    <section className={styles.section}>
      <div className={styles.sectionHeader}>
        <div className={styles.sectionTitle}>
          <h2>Om</h2>
        </div>
      </div>

      <div className={styles.bioCard}>
        <div className={styles.bioContent}>
          {visibleParagraphs.map((paragraph, index) => (
            <p key={index}>{paragraph}</p>
          ))}
        </div>

        {hasMore && (
          <button
            className={`${styles.bioToggle} ${isExpanded ? styles.expanded : ''}`}
            onClick={() => setIsExpanded(!isExpanded)}
          >
            {isExpanded ? 'Visa mindre' : 'Visa mer'}
            <ChevronIcon />
          </button>
        )}
      </div>
    </section>
  );
}

const ChevronIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <polyline points="6 9 12 15 18 9" />
  </svg>
);
