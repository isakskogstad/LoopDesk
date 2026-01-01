import type { VinnovaProject } from "./types";

// GDP API (new) - supports direct org number search
const GDP_BASE_URL = "https://api.vinnova.se/gdp_vinnova";
const GDP_API_KEY = process.env.VINNOVA_GDP_API_KEY;

// Legacy API (fallback)
const LEGACY_BASE_URL = "https://data.vinnova.se/api";

interface GDPOrganisation {
  namn?: string;
  organisationsnummer?: string;
  roll?: string;
}

interface GDPBeslutFinansiering {
  belopp?: number;
  ar?: number;
}

interface GDPFinansierad {
  diarienummer: string;
  titel?: string;
  titelEng?: string;
  beskrivning?: string;
  beskrivningEng?: string;
  startdatum?: string;
  slutdatum?: string;
  status?: string;
  organisationer?: GDPOrganisation[];
  beslutadFinansiering?: GDPBeslutFinansiering[];
}

interface VinnovaProjectRaw {
  Diarienummer: string;
  Ärenderubrik: string;
  ÄrenderubrikEngelska?: string;
  Projektreferat?: string;
  MalSvenska?: string;
  ResultatSvenska?: string;
  ImplementationSvenska?: string;
  LankLista?: { Lanknamn: string; Lankadress: string }[];
  BeviljatBidrag: number;
  ProjektStart: string;
  ProjektSlut: string;
  Status: string;
  KoordinatorOrg: string;
  KoordinatorArb?: string;
  DiarienummerProgram?: string;
}

/**
 * Check if GDP API is configured
 */
export function isVinnovaGDPConfigured(): boolean {
  return Boolean(GDP_API_KEY);
}

/**
 * Search for Vinnova projects by organization number using GDP API
 * This is fast and efficient - only returns data for the specific org
 */
export async function searchVinnovaByOrgNr(
  orgNr: string
): Promise<VinnovaProject[]> {
  if (!GDP_API_KEY) {
    console.warn("Vinnova GDP API not configured");
    return [];
  }

  try {
    // Format org number with dash (XXXXXX-XXXX)
    const cleanOrgNr = orgNr.replace(/-/g, "");
    const formattedOrgNr =
      cleanOrgNr.length === 10
        ? `${cleanOrgNr.slice(0, 6)}-${cleanOrgNr.slice(6)}`
        : orgNr;

    // API key can be passed as query param (per documentation) or header
    const url = `${GDP_BASE_URL}/finansieradeaktiviteter?organisationsnummer=${formattedOrgNr}&limit=100&authorization=${GDP_API_KEY}`;

    const response = await fetch(url, {
      next: { revalidate: 3600 }, // Cache for 1 hour
    });

    if (!response.ok) {
      if (response.status === 401) {
        console.error("Vinnova GDP API: Invalid API key");
      }
      throw new Error(`Vinnova GDP API returned ${response.status}`);
    }

    const result: GDPFinansierad[] = await response.json();

    if (!result || result.length === 0) {
      return [];
    }

    return result.map(parseGDPProject);
  } catch (error) {
    console.error("Error fetching from Vinnova GDP API:", error);
    return [];
  }
}

/**
 * Get Vinnova projects for a company
 * Uses GDP API if configured (fast), otherwise falls back to legacy (slow)
 */
export async function getVinnovaProjectsForCompany(
  companyName: string,
  orgNr?: string
): Promise<VinnovaProject[]> {
  // Try GDP API first if we have org number
  if (orgNr && isVinnovaGDPConfigured()) {
    const projects = await searchVinnovaByOrgNr(orgNr);
    if (projects.length > 0) {
      return projects;
    }
  }

  // Fallback to legacy API (slower, searches by name)
  return searchVinnovaProjectsLegacy(companyName);
}

/**
 * Legacy: Search for Vinnova projects by organization name
 * Downloads all projects and filters client-side (slow)
 */
async function searchVinnovaProjectsLegacy(
  query: string
): Promise<VinnovaProject[]> {
  try {
    // Limited to last 2 years for performance
    const twoYearsAgo = new Date();
    twoYearsAgo.setFullYear(twoYearsAgo.getFullYear() - 2);
    const dateStr = twoYearsAgo.toISOString().split("T")[0];

    const response = await fetch(`${LEGACY_BASE_URL}/projekt/${dateStr}`, {
      cache: "no-store",
    });

    if (!response.ok) {
      throw new Error(`Vinnova API returned ${response.status}`);
    }

    const projects: VinnovaProjectRaw[] = await response.json();

    // Filter by coordinator org name (case-insensitive partial match)
    const queryLower = query.toLowerCase();
    const filtered = projects.filter(
      (p) =>
        p.KoordinatorOrg?.toLowerCase().includes(queryLower) ||
        p.KoordinatorArb?.toLowerCase().includes(queryLower)
    );

    return filtered.map(parseLegacyProject);
  } catch (error) {
    console.error("Error fetching from Vinnova legacy API:", error);
    return [];
  }
}

/**
 * Get Vinnova projects by specific project IDs
 */
export async function getVinnovaProjectsByIds(
  ids: string[]
): Promise<VinnovaProject[]> {
  if (ids.length === 0) return [];

  try {
    // API accepts comma-separated IDs (max 20)
    const idsToFetch = ids.slice(0, 20).join(",");

    const response = await fetch(`${LEGACY_BASE_URL}/projekt/${idsToFetch}`, {
      next: { revalidate: 86400 },
    });

    if (!response.ok) {
      throw new Error(`Vinnova API returned ${response.status}`);
    }

    const projects: VinnovaProjectRaw[] = await response.json();
    return projects.map(parseLegacyProject);
  } catch (error) {
    console.error("Error fetching Vinnova projects by IDs:", error);
    return [];
  }
}

function parseGDPProject(raw: GDPFinansierad): VinnovaProject {
  // Find coordinator from organisationer array
  const coordinator = raw.organisationer?.find((o) => o.roll === "Koordinator");

  // Sum up all granted amounts
  const totalAmount =
    raw.beslutadFinansiering?.reduce((sum, b) => sum + (b.belopp || 0), 0) || 0;

  return {
    diarienummer: raw.diarienummer,
    title: raw.titel || "",
    titleEn: raw.titelEng,
    description: raw.beskrivning || raw.beskrivningEng,
    grantedAmount: totalAmount,
    projectStart: raw.startdatum || "",
    projectEnd: raw.slutdatum || "",
    status: raw.status || "",
    coordinator: coordinator?.namn || "",
    programme: undefined,
  };
}

function parseLegacyProject(raw: VinnovaProjectRaw): VinnovaProject {
  return {
    diarienummer: raw.Diarienummer,
    title: raw.Ärenderubrik,
    titleEn: raw.ÄrenderubrikEngelska,
    description: raw.Projektreferat,
    grantedAmount: raw.BeviljatBidrag,
    projectStart: raw.ProjektStart,
    projectEnd: raw.ProjektSlut,
    status: raw.Status,
    coordinator: raw.KoordinatorOrg,
    programme: raw.DiarienummerProgram,
    // Extended fields
    goals: raw.MalSvenska || undefined,
    results: raw.ResultatSvenska || undefined,
    implementation: raw.ImplementationSvenska || undefined,
    links: raw.LankLista?.map((l) => ({
      name: l.Lanknamn,
      url: l.Lankadress,
    })),
  };
}

/**
 * Format amount in SEK for display
 */
export function formatAmount(amount: number): string {
  if (amount >= 1_000_000) {
    return `${(amount / 1_000_000).toFixed(1)} MSEK`;
  } else if (amount >= 1_000) {
    return `${(amount / 1_000).toFixed(0)} KSEK`;
  }
  return `${amount} SEK`;
}
