'use client';

import { useState, useEffect } from 'react';
import { PersonData, hasImage, getInitials } from '../types';
import styles from '../PersonProfile.module.css';

interface ContactModalProps {
  isOpen: boolean;
  onClose: () => void;
  person: PersonData;
  initialTab?: 'contact' | 'save';
}

export function ContactModal({ isOpen, onClose, person, initialTab = 'contact' }: ContactModalProps) {
  const [activeTab, setActiveTab] = useState(initialTab);
  const [selectedLists, setSelectedLists] = useState<string[]>([]);

  // Sync tab with prop
  useEffect(() => {
    setActiveTab(initialTab);
  }, [initialTab]);

  // Close on escape
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      return () => document.removeEventListener('keydown', handleEscape);
    }
  }, [isOpen, onClose]);

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) onClose();
  };

  const toggleList = (listId: string) => {
    setSelectedLists(prev =>
      prev.includes(listId)
        ? prev.filter(id => id !== listId)
        : [...prev, listId]
    );
  };

  if (!isOpen) return null;

  return (
    <div className={styles.modalOverlay} onClick={handleOverlayClick}>
      <div className={styles.modal}>
        <div className={styles.modalHeader}>
          <h3 className={styles.modalTitle}>
            {activeTab === 'contact' ? 'Kontakta' : 'Spara till lista'}
          </h3>
          <button className={styles.modalClose} onClick={onClose}>
            <CloseIcon />
          </button>
        </div>

        <div className={styles.modalBody}>
          {/* Person info */}
          <div className={styles.modalPerson}>
            <div className={styles.modalPersonAvatar}>
              {hasImage(person) ? (
                <img src={person.imageUrl} alt={person.name} />
              ) : (
                <span>{getInitials(person.name)}</span>
              )}
            </div>
            <div>
              <div className={styles.modalPersonName}>{person.name}</div>
              <div className={styles.modalPersonTitle}>
                {person.headline || person.personType || 'Person'}
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className={styles.modalTabs}>
            <button
              className={`${styles.modalTab} ${activeTab === 'contact' ? styles.active : ''}`}
              onClick={() => setActiveTab('contact')}
            >
              <div className={styles.modalTabIcon}><EmailIcon /></div>
              <div className={styles.modalTabLabel}>Kontakta</div>
            </button>
            <button
              className={`${styles.modalTab} ${activeTab === 'save' ? styles.active : ''}`}
              onClick={() => setActiveTab('save')}
            >
              <div className={styles.modalTabIcon}><BookmarkIcon /></div>
              <div className={styles.modalTabLabel}>Spara</div>
            </button>
          </div>

          {/* Contact Form */}
          {activeTab === 'contact' && (
            <form className={styles.modalForm}>
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Ämne</label>
                <select className={`${styles.formInput} ${styles.formSelect}`}>
                  <option>Affärsförfrågan</option>
                  <option>Nätverka</option>
                  <option>Partnerskap</option>
                  <option>Övrigt</option>
                </select>
              </div>
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Meddelande</label>
                <textarea
                  className={`${styles.formInput} ${styles.formTextarea}`}
                  placeholder="Skriv ditt meddelande här..."
                  rows={4}
                />
              </div>
            </form>
          )}

          {/* Save to List */}
          {activeTab === 'save' && (
            <div className={styles.listOptions}>
              {/* Example lists - would come from props/API */}
              <ListOption
                id="1"
                name="Potentiella partners"
                count={12}
                selected={selectedLists.includes('1')}
                onToggle={() => toggleList('1')}
              />
              <ListOption
                id="2"
                name="Impact-nätverket"
                count={34}
                selected={selectedLists.includes('2')}
                onToggle={() => toggleList('2')}
              />
              <ListOption
                id="3"
                name="Styrelseproffs"
                count={8}
                selected={selectedLists.includes('3')}
                onToggle={() => toggleList('3')}
              />
              <button className={styles.createListBtn}>
                <PlusIcon />
                Skapa ny lista
              </button>
            </div>
          )}
        </div>

        <div className={styles.modalFooter}>
          <button className={styles.btnSecondary} onClick={onClose}>
            Avbryt
          </button>
          <button className={styles.btnPrimary}>
            {activeTab === 'contact' ? (
              <>
                <SendIcon />
                Skicka meddelande
              </>
            ) : (
              <>
                <CheckIcon />
                Spara ({selectedLists.length})
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

// List option component
function ListOption({
  id,
  name,
  count,
  selected,
  onToggle,
}: {
  id: string;
  name: string;
  count: number;
  selected: boolean;
  onToggle: () => void;
}) {
  return (
    <div
      className={`${styles.listOption} ${selected ? styles.selected : ''}`}
      onClick={onToggle}
    >
      <div className={styles.listOptionCheckbox}>
        {selected && <CheckIcon size={12} />}
      </div>
      <div className={styles.listOptionInfo}>
        <div className={styles.listOptionName}>{name}</div>
        <div className={styles.listOptionCount}>{count} personer</div>
      </div>
    </div>
  );
}

// Icons
const CloseIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);

const EmailIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
    <polyline points="22,6 12,13 2,6" />
  </svg>
);

const BookmarkIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
  </svg>
);

const SendIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <line x1="22" y1="2" x2="11" y2="13" />
    <polygon points="22 2 15 22 11 13 2 9 22 2" />
  </svg>
);

const CheckIcon = ({ size = 16 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

const PlusIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <line x1="12" y1="5" x2="12" y2="19" />
    <line x1="5" y1="12" x2="19" y2="12" />
  </svg>
);
