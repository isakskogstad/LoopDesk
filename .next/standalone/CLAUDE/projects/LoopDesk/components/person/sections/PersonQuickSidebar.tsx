'use client';

import { useState } from 'react';
import { PersonData } from '../types';
import styles from '../PersonProfile.module.css';

interface PersonQuickSidebarProps {
  person: PersonData;
  onContact?: (type: 'email' | 'phone' | 'linkedin') => void;
  onSave?: () => void;
  onShare?: () => void;
}

export function PersonQuickSidebar({ person, onContact, onSave, onShare }: PersonQuickSidebarProps) {
  const [isBookmarked, setIsBookmarked] = useState(false);

  const linkedinUrl = person.linkedinUrl ||
    (person.linkedinSlug ? `https://www.linkedin.com/in/${person.linkedinSlug}` : null);

  return (
    <aside className={styles.quickSidebar}>
      {/* LinkedIn */}
      {linkedinUrl && (
        <a
          href={linkedinUrl}
          target="_blank"
          rel="noopener noreferrer"
          className={`${styles.quickAction} ${styles.linkedin}`}
          onClick={() => onContact?.('linkedin')}
        >
          <LinkedInIcon />
          <span className={styles.quickActionTooltip}>LinkedIn</span>
        </a>
      )}

      {/* Email */}
      {person.email && (
        <a
          href={`mailto:${person.email}`}
          className={`${styles.quickAction} ${styles.email}`}
          onClick={() => onContact?.('email')}
        >
          <EmailIcon />
          <span className={styles.quickActionTooltip}>E-post</span>
        </a>
      )}

      {/* Phone */}
      {person.phone && (
        <a
          href={`tel:${person.phone}`}
          className={`${styles.quickAction} ${styles.phone}`}
          onClick={() => onContact?.('phone')}
        >
          <PhoneIcon />
          <span className={styles.quickActionTooltip}>Ring</span>
        </a>
      )}

      <div className={styles.quickSidebarDivider} />

      {/* Bookmark */}
      <button
        className={`${styles.quickAction} ${styles.bookmark} ${isBookmarked ? styles.active : ''}`}
        onClick={() => setIsBookmarked(!isBookmarked)}
      >
        <BookmarkIcon />
        <span className={styles.quickActionTooltip}>Bevaka</span>
      </button>

      {/* Share */}
      <button className={styles.quickAction} onClick={onShare}>
        <ShareIcon />
        <span className={styles.quickActionTooltip}>Dela</span>
      </button>

      {/* Add to list */}
      <button className={styles.quickAction} onClick={onSave}>
        <PlusIcon />
        <span className={styles.quickActionTooltip}>Lägg till i lista</span>
      </button>
    </aside>
  );
}

// Icons
const LinkedInIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
  </svg>
);

const EmailIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
    <polyline points="22,6 12,13 2,6" />
  </svg>
);

const PhoneIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
  </svg>
);

const BookmarkIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
  </svg>
);

const ShareIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="18" cy="5" r="3" />
    <circle cx="6" cy="12" r="3" />
    <circle cx="18" cy="19" r="3" />
    <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
    <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
  </svg>
);

const PlusIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <line x1="12" y1="5" x2="12" y2="19" />
    <line x1="5" y1="12" x2="19" y2="12" />
  </svg>
);
