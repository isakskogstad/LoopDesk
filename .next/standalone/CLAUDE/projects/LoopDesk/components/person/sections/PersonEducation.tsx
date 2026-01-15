'use client';

import { PersonEducation as EducationType } from '../types';
import styles from '../PersonProfile.module.css';

interface PersonEducationProps {
  educations: EducationType[];
}

export function PersonEducation({ educations }: PersonEducationProps) {
  if (educations.length === 0) {
    return null;
  }

  return (
    <section className={styles.section}>
      <div className={styles.sectionHeader}>
        <div className={styles.sectionTitle}>
          <h2>Utbildning</h2>
        </div>
      </div>

      <div className={styles.educationGrid}>
        {educations.map((edu) => (
          <div key={edu.id} className={styles.educationCard}>
            <div className={styles.educationLogo}>
              <GraduationCapIcon />
            </div>
            <div className={styles.educationContent}>
              <div className={styles.educationSchool}>{edu.school}</div>
              {edu.field && (
                <div className={styles.educationField}>
                  {edu.degree && `${edu.degree}, `}
                  {edu.field}
                </div>
              )}
              {(edu.startYear || edu.endYear) && (
                <div className={styles.educationYears}>
                  {edu.startYear && edu.endYear
                    ? `${edu.startYear} - ${edu.endYear}`
                    : edu.endYear || edu.startYear}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

const GraduationCapIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
    <path d="M6 12v5c3 3 9 3 12 0v-5" />
  </svg>
);
