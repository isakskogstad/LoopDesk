// Person Profile Components - Dynamisk personprofil
// Export all components and types for easy importing

// Main component
export { PersonProfile, PersonProfileEmpty, PersonProfileSkeleton } from './PersonProfile';

// Section components (for custom layouts)
export { PersonHero } from './sections/PersonHero';
export { PersonStats } from './sections/PersonStats';
export { PersonPortfolio } from './sections/PersonPortfolio';
export { PersonOwnership } from './sections/PersonOwnership';
export { PersonBio } from './sections/PersonBio';
export { PersonEngagements } from './sections/PersonEngagements';
export { PersonEducation } from './sections/PersonEducation';
export { PersonSkills } from './sections/PersonSkills';
export { PersonLanguages } from './sections/PersonLanguages';
export { PersonQuickSidebar } from './sections/PersonQuickSidebar';

// Modal
export { ContactModal } from './modals/ContactModal';

// Types
export type {
  PersonData,
  PersonRole,
  PersonOwnership as PersonOwnershipType,
  BeneficialOwnership,
  PersonEducation as PersonEducationType,
  PersonLanguage,
  PortfolioSummary,
  RoleType,
  PersonType,
  OwnershipType,
} from './types';

// Utility functions
export {
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
  formatRoleType,
  formatPersonType,
  formatAmount,
} from './types';
