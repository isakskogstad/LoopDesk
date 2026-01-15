'use client';

import { useState } from 'react';
import {
  PersonData,
  hasContactInfo,
  hasBio,
  hasHeadline,
  hasRoles,
  hasOwnerships,
  hasEducation,
  hasSkills,
  hasLanguages,
  hasPortfolio,
  hasImage,
  getInitials,
  formatPersonType,
  formatAmount,
} from './types';
import { PersonHero } from './sections/PersonHero';
import { PersonStats } from './sections/PersonStats';
import { PersonPortfolio } from './sections/PersonPortfolio';
import { PersonOwnership } from './sections/PersonOwnership';
import { PersonBio } from './sections/PersonBio';
import { PersonEngagements } from './sections/PersonEngagements';
import { PersonEducation } from './sections/PersonEducation';
import { PersonSkills } from './sections/PersonSkills';
import { PersonLanguages } from './sections/PersonLanguages';
import { PersonQuickSidebar } from './sections/PersonQuickSidebar';
import { ContactModal } from './modals/ContactModal';
import styles from './PersonProfile.module.css';

interface PersonProfileProps {
  person: PersonData;
  onContact?: (type: 'email' | 'phone' | 'linkedin') => void;
  onSave?: () => void;
  onShare?: () => void;
}

export function PersonProfile({ person, onContact, onSave, onShare }: PersonProfileProps) {
  const [isContactModalOpen, setIsContactModalOpen] = useState(false);
  const [contactModalTab, setContactModalTab] = useState<'contact' | 'save'>('contact');

  const openModal = (tab: 'contact' | 'save' = 'contact') => {
    setContactModalTab(tab);
    setIsContactModalOpen(true);
  };

  const closeModal = () => {
    setIsContactModalOpen(false);
  };

  // Beräkna vilka sektioner som ska visas
  const showPortfolio = hasPortfolio(person);
  const showOwnerships = hasOwnerships(person);
  const showBio = hasBio(person);
  const showEngagements = hasRoles(person);
  const showEducation = hasEducation(person);
  const showSkills = hasSkills(person);
  const showLanguages = hasLanguages(person);
  const showSidebar = hasContactInfo(person);

  // Antal aktiva roller
  const activeRolesCount = person.roles?.filter(r => r.isActive).length ?? 0;

  return (
    <div className={styles.layout}>
      <main className={styles.main}>
        {/* Hero - visas alltid */}
        <PersonHero
          person={person}
          onContact={() => openModal('contact')}
          onSave={() => openModal('save')}
        />

        {/* Portfolio - visas endast om aggregerad data finns */}
        {showPortfolio && (
          <PersonPortfolio portfolio={person.portfolio!} />
        )}

        {/* Stats Grid - visas alltid med tillgänglig data */}
        <PersonStats
          totalCompanies={person.totalCompanies}
          totalBoardSeats={person.totalBoardSeats}
          totalInvestments={person.totalInvestments}
          activeCompanies={person.activeCompanies}
          foundedCompanies={person.roles?.filter(r => r.roleType === 'FOUNDER').length}
        />

        {/* Ägarstruktur - visas endast om ägardata finns */}
        {showOwnerships && (
          <PersonOwnership
            directOwnerships={person.ownerships?.filter(o => o.ownershipType === 'direct')}
            indirectOwnerships={person.ownerships?.filter(o => o.ownershipType === 'indirect')}
            beneficialOwnerships={person.beneficialOwnerships}
          />
        )}

        {/* Bio - visas endast om bio finns */}
        {showBio && (
          <PersonBio bio={person.bio!} />
        )}

        {/* Bolagsengagemang - visas endast om roller finns */}
        {showEngagements && (
          <PersonEngagements
            roles={person.roles!}
            activeCount={activeRolesCount}
          />
        )}

        {/* Utbildning - visas endast om utbildningsdata finns */}
        {showEducation && (
          <PersonEducation educations={person.educations!} />
        )}

        {/* Kompetenser - visas endast om tags finns */}
        {showSkills && (
          <PersonSkills skills={person.tags!} />
        )}

        {/* Språk - visas endast om språkdata finns */}
        {showLanguages && (
          <PersonLanguages languages={person.languages!} />
        )}
      </main>

      {/* Sidebar - visas endast om kontaktinfo finns */}
      {showSidebar && (
        <PersonQuickSidebar
          person={person}
          onContact={onContact}
          onSave={() => openModal('save')}
          onShare={onShare}
        />
      )}

      {/* Contact Modal */}
      <ContactModal
        isOpen={isContactModalOpen}
        onClose={closeModal}
        person={person}
        initialTab={contactModalTab}
      />
    </div>
  );
}

// === Empty State Component ===
// Används när en person inte hittas
export function PersonProfileEmpty({ message = 'Personen kunde inte hittas' }: { message?: string }) {
  return (
    <div className={styles.emptyState}>
      <div className={styles.emptyIcon}>
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <circle cx="12" cy="8" r="4" />
          <path d="M20 21a8 8 0 1 0-16 0" />
        </svg>
      </div>
      <h2 className={styles.emptyTitle}>{message}</h2>
      <p className={styles.emptyText}>
        Kontrollera att länken är korrekt eller sök efter en annan person.
      </p>
    </div>
  );
}

// === Loading State Component ===
export function PersonProfileSkeleton() {
  return (
    <div className={styles.layout}>
      <main className={styles.main}>
        {/* Hero skeleton */}
        <div className={styles.skeletonHero}>
          <div className={styles.skeletonAvatar} />
          <div className={styles.skeletonContent}>
            <div className={styles.skeletonBadges} />
            <div className={styles.skeletonTitle} />
            <div className={styles.skeletonSubtitle} />
            <div className={styles.skeletonMeta} />
          </div>
        </div>

        {/* Stats skeleton */}
        <div className={styles.skeletonStats}>
          {[1, 2, 3, 4].map(i => (
            <div key={i} className={styles.skeletonStatCard} />
          ))}
        </div>

        {/* Section skeletons */}
        <div className={styles.skeletonSection} />
        <div className={styles.skeletonSection} />
      </main>
    </div>
  );
}
