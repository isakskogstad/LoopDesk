// Common types for company data

export interface CompanyBasicInfo {
  orgNr: string;
  name: string;
  legalName?: string;
  companyType: {
    code: string;
    name: string;
    parentCode?: string;
  };
  status: {
    active: boolean;
    status: string;
    statusDate?: string;
  };
  registrationDate?: string;
  foundationDate?: string;
  foundationYear?: string;
  purpose?: string;
  tagLine?: string;
  description?: string;
}

export interface CompanyAddress {
  street?: string;
  boxAddress?: string;
  coAddress?: string;
  zipCode?: string;
  city?: string;
  country?: string;
}

export interface CompanyContact {
  phone?: string;
  phone2?: string;
  mobile?: string;
  fax?: string;
  email?: string;
  website?: string;
  socialMedia?: {
    facebook?: string;
    linkedin?: string;
    twitter?: string;
    instagram?: string;
    youtube?: string;
  };
}

export interface CompanyPerson {
  name: string;
  role: string;
  birthDate?: string;
  id?: string;
  type?: "Person" | "Company";
  businessPerson?: boolean;
}

export interface CompanyIndustry {
  code: string;
  name: string;
  description?: string;
}

export interface Shareholder {
  name: string;
  orgNr?: string;
  ownership?: number;
  votes?: number;
  country?: string;
}

export interface RegistryStatus {
  label: string;
  value: boolean;
  description?: string;
}

export interface AccountEntry {
  code: string;
  codeName?: string;
  amount: number | null;
}

export interface AnnualReport {
  year: number;
  periodStart: string;
  periodEnd: string;
  accounts: AccountEntry[];
  currency: string;
}

export interface CompanyAnnouncement {
  id: string;
  date: string;
  text: string;
  type: string;
}

export interface VinnovaProject {
  diarienummer: string;
  title: string;
  titleEn?: string;
  description?: string;
  grantedAmount: number;
  projectStart: string;
  projectEnd: string;
  status: string;
  coordinator: string;
  programme?: string;
  // Extended fields
  goals?: string;
  results?: string;
  implementation?: string;
  links?: {
    name: string;
    url: string;
  }[];
}

export interface Trademark {
  name: string;
  registrationNumber?: string;
  status?: string;
  classes?: string[];
  type?: string;
  expirationDate?: string;
}

export interface Merger {
  date: string;
  type: string;
  description?: string;
  otherCompanyName?: string;
  otherCompanyOrgNr?: string;
}

export interface Certificate {
  name: string;
  issuer?: string;
  validUntil?: string;
}

export interface StatusRemark {
  code?: string;
  description: string;
  date: string;
}

export interface RelatedCompany {
  orgNr: string;
  name: string;
  relation?: string;
}

// Aggregated company data from all sources
export interface CompanyData {
  // Basic info (all sources)
  basic: CompanyBasicInfo;

  // Addresses (Bolagsverket, Allabolag)
  postalAddress?: CompanyAddress;
  visitorAddress?: CompanyAddress;
  legalPostalAddress?: CompanyAddress;
  legalVisitorAddress?: CompanyAddress;

  // Contact (Allabolag)
  contact?: CompanyContact;

  // Location (Allabolag)
  location?: {
    county?: string;
    municipality?: string;
    countryPart?: string;
    coordinates?: [number, number];
  };

  // Domicile / Säte (Allabolag)
  domicile?: {
    municipality?: string;
    county?: string;
  };

  // Industries (Bolagsverket, Allabolag)
  industries?: CompanyIndustry[];
  naceIndustries?: string[];

  // People (Allabolag)
  people?: {
    chairman?: CompanyPerson;
    ceo?: CompanyPerson;
    contactPerson?: CompanyPerson;
    boardMembers?: CompanyPerson[];
    management?: CompanyPerson[];
    auditors?: CompanyPerson[];
    otherRoles?: CompanyPerson[];
    signatories?: string[];
    procuration?: string[];
    numberOfRoles?: number;
  };

  // Shareholders (Allabolag)
  shareholders?: {
    list?: Shareholder[];
    totalCount?: number;
    lastUpdated?: string;
  };

  // Financials (Allabolag)
  financials?: {
    revenue?: string;
    profit?: string;
    employees?: string;
    numberOfEmployees?: string;
    shareCapital?: number;
    estimatedTurnover?: string;
    turnoverYear?: number;
    annualReports?: AnnualReport[];
    corporateAccounts?: AnnualReport[];
    keyFigures?: {
      ebitda?: number;
      returnOnEquity?: number;
      returnOnAssets?: number;
      growthRate?: number;
      salariesBoard?: number;
      salariesOther?: number;
      longTermDebt?: number;
      financialAssets?: number;
    };
  };

  // Status flags (Allabolag)
  flags?: {
    mortgages?: boolean;
    paymentRemarks?: boolean;
    vatRegistered?: boolean;
    vatDescription?: string;
    marketingProtection?: boolean;
    gaselle?: boolean;
    registeredForPayrollTax?: boolean;
    registeredForNav?: boolean;
  };

  // Status remarks (Allabolag) - e.g. bankruptcy, liquidation
  statusRemarks?: StatusRemark[];

  // Vehicles (Allabolag)
  vehicles?: {
    numberOfVehicles: number;
  };

  // Rating (Allabolag)
  rating?: string;

  // Registry status entries (detailed)
  registryStatus?: RegistryStatus[];

  // Announcements (Allabolag)
  announcements?: CompanyAnnouncement[];

  // Vinnova projects
  vinnovaProjects?: VinnovaProject[];

  // Corporate structure (Allabolag)
  corporateStructure?: {
    numberOfCompanies?: number;
    numberOfSubsidiaries?: number;
    parentCompanyName?: string;
    parentCompanyOrgNr?: string;
    parentCompanyCountry?: string;
  };

  // Business units
  businessUnits?: {
    id: string;
    name: string;
    type: string;
  }[];

  // Trademarks
  trademarks?: Trademark[];

  // Mergers
  mergers?: Merger[];

  // Certificates
  certificates?: Certificate[];

  // Related companies
  relatedCompanies?: RelatedCompany[];

  // Alternative names
  alternativeNames?: string[];

  // Annual report links
  annualReportLinks?: {
    year: number;
    url: string;
  }[];

  // Data sources used
  sources: {
    bolagsverket?: boolean;
    allabolag?: boolean;
    vinnova?: boolean;
  };
}

// Search result
export interface SearchResult {
  orgNr: string;
  name: string;
  companyType?: string;
  status?: string;
  location?: string;
}
