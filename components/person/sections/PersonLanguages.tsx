'use client';

import { PersonLanguage } from '../types';
import styles from '../PersonProfile.module.css';

interface PersonLanguagesProps {
  languages: PersonLanguage[];
}

const levelLabels: Record<PersonLanguage['level'], string> = {
  native: 'Modersmål',
  fluent: 'Flytande',
  professional: 'Professionell',
  basic: 'Grundläggande',
};

export function PersonLanguages({ languages }: PersonLanguagesProps) {
  if (languages.length === 0) {
    return null;
  }

  return (
    <section className={styles.section}>
      <div className={styles.sectionHeader}>
        <div className={styles.sectionTitle}>
          <h2>Språk</h2>
        </div>
      </div>

      <div className={styles.languagesList}>
        {languages.map((lang, index) => (
          <div key={index} className={styles.languageItem}>
            <div className={styles.languageFlag}>
              {lang.flagEmoji || '🌐'}
            </div>
            <div className={styles.languageInfo}>
              <div className={styles.languageName}>{lang.language}</div>
              <div className={styles.languageLevel}>{levelLabels[lang.level]}</div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
