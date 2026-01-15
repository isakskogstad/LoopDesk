// Person enrichment types

export interface AllabolagPersonData {
  name: string;
  personId: string;
  yearOfBirth?: number;
  birthDate?: string;
  age?: number;
  gender?: string;
  businessPerson?: boolean;
  numberOfRoles?: number;
  location?: {
    county?: string;
    municipality?: string;
  };
  roles?: AllabolagPersonRole[];
  connections?: AllabolagConnection[];
  ownerships?: AllabolagOwnership[];
}

export interface AllabolagPersonRole {
  id: string; // orgNumber
  name: string; // company name
  role: string; // Swedish role title
  type?: "Person" | "Company";
  status?: {
    status: string;
    statusFlag?: string;
  };
  companyNumberOfEmployees?: string;
}

export interface AllabolagConnection {
  name: string;
  id?: string;
  yearOfBirth?: number;
  sharedCompanies?: number;
}

export interface AllabolagOwnership {
  id: string; // orgNumber
  name: string; // company name
  ownership?: number;
  votes?: number;
  status?: {
    status: string;
  };
}

export interface AllabolagCompanyRole {
  name: string;
  role: string;
  id?: string;
  birthDate?: string;
  type?: "Person" | "Company";
  businessPerson?: boolean;
}

export interface EnrichmentResult {
  processed: number;
  created: number;
  updated: number;
  skipped: number;
  errors: string[];
}

export type RoleTypeMapping = {
  [key: string]: import("@prisma/client").RoleType;
};

// Map Swedish role titles to RoleType enum
export const ROLE_TYPE_MAP: RoleTypeMapping = {
  // CEO variants
  "verkställande direktör": "CEO",
  "extern verkställande direktör": "CEO",
  vd: "CEO",

  // Deputy CEO
  "vice verkställande direktör": "DEPUTY_CEO",
  "extern vice verkställande direktör": "DEPUTY_CEO",
  "vice vd": "DEPUTY_CEO",

  // Chairman
  ordförande: "CHAIRMAN",
  styrelseordförande: "CHAIRMAN",

  // Vice Chairman
  "vice ordförande": "VICE_CHAIRMAN",

  // Board members
  ledamot: "BOARD_MEMBER",
  styrelseledamot: "BOARD_MEMBER",

  // Board deputy
  suppleant: "BOARD_DEPUTY",
  styrelsesuppleant: "BOARD_DEPUTY",

  // Auditor
  revisor: "AUDITOR",
  "huvudansvarig revisor": "AUDITOR",

  // Deputy auditor
  revisorssuppleant: "DEPUTY_AUDITOR",

  // Signatory
  firmatecknare: "SIGNATORY",
  "extern firmatecknare": "SIGNATORY",

  // Procurator
  prokurist: "PROCURATOR",
};

export function mapRoleTitle(
  swedishTitle: string
): import("@prisma/client").RoleType {
  const normalized = swedishTitle.toLowerCase().trim();

  // Check direct mapping
  if (ROLE_TYPE_MAP[normalized]) {
    return ROLE_TYPE_MAP[normalized];
  }

  // Check if title contains key phrases
  for (const [key, value] of Object.entries(ROLE_TYPE_MAP)) {
    if (normalized.includes(key)) {
      return value;
    }
  }

  return "OTHER";
}

export function parsePersonName(fullName: string): {
  firstName: string;
  lastName: string;
} {
  const parts = fullName.trim().split(/\s+/);
  if (parts.length === 1) {
    return { firstName: parts[0], lastName: "" };
  }
  return {
    firstName: parts.slice(0, -1).join(" "),
    lastName: parts[parts.length - 1],
  };
}

export function parseBirthYear(birthDate?: string): number | null {
  if (!birthDate) return null;

  // Format: "1976-11-12" or "12.11.1976"
  if (birthDate.includes("-")) {
    const year = parseInt(birthDate.substring(0, 4));
    return isNaN(year) ? null : year;
  }

  if (birthDate.includes(".")) {
    const parts = birthDate.split(".");
    if (parts.length === 3) {
      const year = parseInt(parts[2]);
      return isNaN(year) ? null : year;
    }
  }

  return null;
}

export function getRoleGroup(roleType: import("@prisma/client").RoleType): string {
  switch (roleType) {
    case "CEO":
    case "DEPUTY_CEO":
    case "CFO":
    case "CTO":
    case "COO":
      return "Management";
    case "CHAIRMAN":
    case "VICE_CHAIRMAN":
    case "BOARD_MEMBER":
    case "BOARD_DEPUTY":
      return "Board";
    case "AUDITOR":
    case "DEPUTY_AUDITOR":
      return "Revision";
    case "SIGNATORY":
    case "PROCURATOR":
      return "Other";
    default:
      return "Other";
  }
}
