// Person Profile Types - Dynamisk struktur för personprofiler
// Alla fält är optional för att stödja partiell data

export type RoleType =
  | 'CEO' | 'DEPUTY_CEO' | 'CFO' | 'CTO' | 'COO'
  | 'CHAIRMAN' | 'VICE_CHAIRMAN' | 'BOARD_MEMBER' | 'BOARD_DEPUTY'
  | 'AUDITOR' | 'DEPUTY_AUDITOR' | 'SIGNATORY' | 'PROCURATOR'
  | 'FOUNDER' | 'OWNER' | 'OTHER';

export type PersonType = 'EXECUTIVE' | 'BOARD_MEMBER' | 'FOUNDER' | 'INVESTOR' | 'ADVISOR' | 'OTHER';

export type OwnershipType = 'direct' | 'indirect' | 'beneficial';

// === Huvudinterface för persondata ===
export interface PersonData {
  // Grundläggande info (från Person-tabellen)
  id: string;
  name: string;
  firstName?: string;
  lastName?: string;
  birthYear?: number;
  location?: string;
  personType?: PersonType;

  // Kontaktinfo (ofta NULL - visas endast om finns)
  email?: string;
  phone?: string;
  linkedinSlug?: string;
  linkedinUrl?: string;

  // Profilbild (extern källa)
  imageUrl?: string;

  // Bio/beskrivning (ofta NULL - visas endast om finns)
  bio?: string;
  headline?: string;

  // Aggregerade siffror (från Person-tabellen)
  totalCompanies?: number;
  activeCompanies?: number;
  totalBoardSeats?: number;
  totalInvestments?: number;

  // Tags/kompetenser (ofta NULL)
  tags?: string[];

  // Relationer (fylls från andra tabeller)
  roles?: PersonRole[];
  ownerships?: PersonOwnership[];
  beneficialOwnerships?: BeneficialOwnership[];
  educations?: PersonEducation[];
  languages?: PersonLanguage[];

  // Aggregerad portfolio (beräknas)
  portfolio?: PortfolioSummary;
}

// === Roller och engagemang (från PersonRole) ===
export interface PersonRole {
  id: string;
  orgNumber: string;
  companyName: string;
  roleType: RoleType;
  roleTitle?: string;
  roleGroup?: string;
  isActive: boolean;
  isPrimary?: boolean;
  startDate?: string;
  endDate?: string;

  // Extra info om bolaget (om tillgänglig)
  company?: {
    city?: string;
    industry?: string;
    hasLogo?: boolean;
    logoUrl?: string;
  };

  // Beskrivning (från LinkedIn eller manuell)
  description?: string;
}

// === Ägarskap (från CompanyOwner via namn-matchning) ===
export interface PersonOwnership {
  id: string;
  orgNumber: string;
  companyName: string;
  percentage?: number;
  nbrShares?: number;
  ownershipType: OwnershipType;

  // Extra bolagsinfo
  company?: {
    city?: string;
    companyType?: string;
    hasLogo?: boolean;
  };
}

// === Verklig huvudman (från BeneficialOwner) ===
export interface BeneficialOwnership {
  id: string;
  orgNumber: string;
  companyName?: string;
  percentageVotesMin?: number;
  percentageVotesMax?: number;
  controlCodes?: string[];
  ownershipCode?: string;
  viaEntity?: string; // "Via: Holdingbolag AB"
}

// === Utbildning (saknas i DB - för framtida bruk) ===
export interface PersonEducation {
  id: string;
  school: string;
  field?: string;
  degree?: string;
  startYear?: number;
  endYear?: number;
  description?: string;
}

// === Språk (saknas i DB - för framtida bruk) ===
export interface PersonLanguage {
  language: string;
  level: 'native' | 'fluent' | 'professional' | 'basic';
  flagEmoji?: string;
}

// === Aggregerad portfolio ===
export interface PortfolioSummary {
  totalValue?: number;
  totalRevenue?: number;
  totalProfit?: number;
  totalFunding?: number;
  totalEmployees?: number;
  currency?: string;
}

// === Hjälpfunktioner för att kolla om data finns ===
export const hasContactInfo = (person: PersonData): boolean => {
  return !!(person.email || person.phone || person.linkedinUrl || person.linkedinSlug);
};

export const hasBio = (person: PersonData): boolean => {
  return !!(person.bio && person.bio.trim().length > 0);
};

export const hasHeadline = (person: PersonData): boolean => {
  return !!(person.headline && person.headline.trim().length > 0);
};

export const hasRoles = (person: PersonData): boolean => {
  return !!(person.roles && person.roles.length > 0);
};

export const hasOwnerships = (person: PersonData): boolean => {
  return !!(person.ownerships && person.ownerships.length > 0) ||
         !!(person.beneficialOwnerships && person.beneficialOwnerships.length > 0);
};

export const hasEducation = (person: PersonData): boolean => {
  return !!(person.educations && person.educations.length > 0);
};

export const hasSkills = (person: PersonData): boolean => {
  return !!(person.tags && person.tags.length > 0);
};

export const hasLanguages = (person: PersonData): boolean => {
  return !!(person.languages && person.languages.length > 0);
};

export const hasPortfolio = (person: PersonData): boolean => {
  if (!person.portfolio) return false;
  const p = person.portfolio;
  return !!(p.totalValue || p.totalRevenue || p.totalProfit || p.totalFunding || p.totalEmployees);
};

export const hasImage = (person: PersonData): boolean => {
  return !!(person.imageUrl && person.imageUrl.trim().length > 0);
};

// Generera initialer från namn
export const getInitials = (name: string): string => {
  return name
    .split(' ')
    .map(part => part[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
};

// Formatera rolltyp till svensk text
export const formatRoleType = (roleType: RoleType): string => {
  const map: Record<RoleType, string> = {
    CEO: 'VD',
    DEPUTY_CEO: 'Vice VD',
    CFO: 'Ekonomichef',
    CTO: 'Teknikchef',
    COO: 'Operativ chef',
    CHAIRMAN: 'Ordförande',
    VICE_CHAIRMAN: 'Vice ordförande',
    BOARD_MEMBER: 'Styrelseledamot',
    BOARD_DEPUTY: 'Styrelsesuppleant',
    AUDITOR: 'Revisor',
    DEPUTY_AUDITOR: 'Revisorssuppleant',
    SIGNATORY: 'Firmatecknare',
    PROCURATOR: 'Prokurist',
    FOUNDER: 'Grundare',
    OWNER: 'Ägare',
    OTHER: 'Övrig roll',
  };
  return map[roleType] || roleType;
};

// Formatera persontyp till svensk text
export const formatPersonType = (type: PersonType): string => {
  const map: Record<PersonType, string> = {
    EXECUTIVE: 'Företagsledare',
    BOARD_MEMBER: 'Styrelseproffs',
    FOUNDER: 'Grundare',
    INVESTOR: 'Investerare',
    ADVISOR: 'Rådgivare',
    OTHER: 'Övrig',
  };
  return map[type] || type;
};

// Formatera belopp med MSEK/KSEK
export const formatAmount = (amount: number, currency = 'SEK'): string => {
  if (amount >= 1_000_000) {
    return `${(amount / 1_000_000).toFixed(0)} MSEK`;
  } else if (amount >= 1_000) {
    return `${(amount / 1_000).toFixed(0)} KSEK`;
  }
  return `${amount} ${currency}`;
};
