'use client';

import styles from '../PersonProfile.module.css';

interface PersonSkillsProps {
  skills: string[];
}

export function PersonSkills({ skills }: PersonSkillsProps) {
  if (skills.length === 0) {
    return null;
  }

  return (
    <section className={styles.section}>
      <div className={styles.sectionHeader}>
        <div className={styles.sectionTitle}>
          <h2>Kompetenser</h2>
          <span className={styles.count}>{skills.length}</span>
        </div>
      </div>

      <div className={styles.skillsGrid}>
        {skills.map((skill, index) => (
          <span key={index} className={styles.skillTag}>
            {skill}
          </span>
        ))}
      </div>
    </section>
  );
}
