'use client';

import {
  PersonData,
  hasImage,
  hasHeadline,
  getInitials,
  formatPersonType,
} from '../types';
import styles from '../PersonProfile.module.css';

interface PersonHeroProps {
  person: PersonData;
  onContact?: () => void;
  onSave?: () => void;
}

export function PersonHero({ person, onContact, onSave }: PersonHeroProps) {
  const initials = getInitials(person.name);
  const showImage = hasImage(person);
  const showHeadline = hasHeadline(person);

  return (
    <section className={styles.hero}>
      {/* Avatar */}
      <div className={styles.heroAvatar}>
        {showImage ? (
          <img
            src={person.imageUrl}
            alt={person.name}
            onError={(e) => {
              // Fallback till initialer om bild inte laddar
              e.currentTarget.style.display = 'none';
              e.currentTarget.nextElementSibling?.setAttribute('style', 'display: flex');
            }}
          />
        ) : null}
        <span
          className={styles.initials}
          style={{ display: showImage ? 'none' : 'flex' }}
        >
          {initials}
        </span>

        {/* Verifierad badge - visas om LinkedIn-koppling finns */}
        {person.linkedinSlug && (
          <>
            <div className={styles.heroAvatarBadge}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                <polyline points="22 4 12 14.01 9 11.01" />
              </svg>
            </div>
            <div className={styles.heroAvatarSource}>
              <LinkedInIcon size={10} />
              LinkedIn
            </div>
          </>
        )}
      </div>

      {/* Content */}
      <div className={styles.heroContent}>
        {/* Badges */}
        <div className={styles.heroBadges}>
          {person.personType && (
            <span className={`${styles.badge} ${styles.badgeRole}`}>
              <StarIcon size={12} />
              {formatPersonType(person.personType)}
            </span>
          )}
          {person.linkedinSlug && (
            <span className={`${styles.badge} ${styles.badgeVerified}`}>
              LinkedIn Verifierad
            </span>
          )}
        </div>

        {/* Namn */}
        <h1 className={styles.heroTitle}>{person.name}</h1>

        {/* Headline - visas endast om finns */}
        {showHeadline && (
          <p className={styles.heroHeadline}>{person.headline}</p>
        )}

        {/* Meta-info */}
        <div className={styles.heroMeta}>
          {person.location && (
            <span className={styles.heroMetaItem}>
              <LocationIcon size={16} />
              {person.location}
            </span>
          )}
          {person.activeCompanies !== undefined && person.activeCompanies > 0 && (
            <span className={styles.heroMetaItem}>
              <BriefcaseIcon size={16} />
              {person.activeCompanies} aktiva engagemang
            </span>
          )}
          {person.birthYear && (
            <span className={styles.heroMetaItem}>
              <CalendarIcon size={16} />
              Född {person.birthYear}
            </span>
          )}
        </div>

        {/* Actions */}
        <div className={styles.heroActions}>
          <button className={styles.btnPrimary} onClick={onContact}>
            <EmailIcon size={16} />
            Kontakta
          </button>
          <button className={styles.btnSecondary} onClick={onSave}>
            <BookmarkIcon size={16} />
            Spara
          </button>
        </div>
      </div>
    </section>
  );
}

// === Icon Components ===
const LinkedInIcon = ({ size = 20 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
  </svg>
);

const StarIcon = ({ size = 16 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
  </svg>
);

const LocationIcon = ({ size = 16 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
    <circle cx="12" cy="10" r="3" />
  </svg>
);

const BriefcaseIcon = ({ size = 16 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
    <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
  </svg>
);

const CalendarIcon = ({ size = 16 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
    <line x1="16" y1="2" x2="16" y2="6" />
    <line x1="8" y1="2" x2="8" y2="6" />
    <line x1="3" y1="10" x2="21" y2="10" />
  </svg>
);

const EmailIcon = ({ size = 16 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
    <polyline points="22,6 12,13 2,6" />
  </svg>
);

const BookmarkIcon = ({ size = 16 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
  </svg>
);
