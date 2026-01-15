import type { CompanyData, SearchResult } from "./types";
import { fetchFromAllabolag, searchAllabolag } from "./allabolag";
import { fetchFromBolagsverket, isBolagsverketConfigured } from "./bolagsverket";

export * from "./types";
export { formatAmount } from "./vinnova";
export { isBolagsverketConfigured };
export { searchAllabolag };

/**
 * Fetch company data from all available sources
 */
export async function getCompanyData(orgNr: string): Promise<CompanyData | null> {
  // Clean org number
  const cleanOrgNr = orgNr.replace(/\D/g, "");

  if (cleanOrgNr.length !== 10 && cleanOrgNr.length !== 12) {
    throw new Error("Ogiltigt organisationsnummer");
  }

  // Fetch from all sources in parallel
  const [allabolagData, bolagsverketData] = await Promise.all([
    fetchFromAllabolag(cleanOrgNr).catch((err) => {
      console.error("Allabolag fetch failed:", err);
      return null;
    }),
    fetchFromBolagsverket(cleanOrgNr).catch((err) => {
      console.error("Bolagsverket fetch failed:", err);
      return null;
    }),
  ]);

  // If we have no data from any source, return null
  if (!allabolagData && !bolagsverketData) {
    return null;
  }

  // Merge data (Allabolag as base, Bolagsverket as supplement)
  let companyData: CompanyData;

  if (allabolagData) {
    companyData = { ...allabolagData };

    // Add Bolagsverket data if available
    if (bolagsverketData) {
      companyData.sources.bolagsverket = true;

      // Prefer Bolagsverket for official data
      if (bolagsverketData.basic) {
        // Keep Allabolag name but use Bolagsverket status if more detailed
        if (bolagsverketData.basic.purpose && !companyData.basic.purpose) {
          companyData.basic.purpose = bolagsverketData.basic.purpose;
        }
      }

      // Merge industries (Bolagsverket may have more accurate SNI codes)
      if (bolagsverketData.industries && bolagsverketData.industries.length > 0) {
        const existingCodes = new Set(companyData.industries?.map((i) => i.code));
        const newIndustries = bolagsverketData.industries.filter(
          (i) => !existingCodes.has(i.code)
        );
        companyData.industries = [
          ...(companyData.industries || []),
          ...newIndustries,
        ];
      }
    }
  } else if (bolagsverketData) {
    // Only Bolagsverket data available
    companyData = {
      basic: bolagsverketData.basic!,
      postalAddress: bolagsverketData.postalAddress,
      industries: bolagsverketData.industries,
      flags: bolagsverketData.flags,
      sources: { bolagsverket: true },
    };
  } else {
    return null;
  }

  // Skip Vinnova on initial load - it's too slow (fetches all projects since 2010)
  // Vinnova data can be loaded separately via /api/vinnova/[companyName]

  return companyData;
}

/**
 * Search for companies by org number or name
 */
export async function searchCompanies(query: string): Promise<SearchResult[]> {
  // Check if query looks like an org number
  const cleanQuery = query.replace(/\D/g, "");

  if (cleanQuery.length === 10 || cleanQuery.length === 12) {
    // Try to fetch the company directly
    const data = await getCompanyData(cleanQuery);

    if (data) {
      return [
        {
          orgNr: data.basic.orgNr,
          name: data.basic.name,
          companyType: data.basic.companyType.name,
          status: data.basic.status.status,
          location: data.location?.municipality,
        },
      ];
    }
  }

  // Text search via Allabolag
  const results = await searchAllabolag(query);

  return results.map((r) => ({
    orgNr: r.orgnr,
    name: r.name,
    companyType: r.companyType?.name,
    status: r.status?.status,
    location: r.location?.municipality,
  }));
}

/**
 * Format org number with dash
 */
export function formatOrgNr(orgNr: string): string {
  const clean = orgNr.replace(/\D/g, "");
  if (clean.length === 10) {
    return `${clean.slice(0, 6)}-${clean.slice(6)}`;
  } else if (clean.length === 12) {
    return `${clean.slice(0, 8)}-${clean.slice(8)}`;
  }
  return orgNr;
}

/**
 * Validate org number using Luhn algorithm
 */
export function validateOrgNr(orgNr: string): boolean {
  const clean = orgNr.replace(/\D/g, "");

  if (clean.length !== 10 && clean.length !== 12) {
    return false;
  }

  // Use last 10 digits for validation
  const digits = clean.slice(-10);

  // Luhn algorithm
  let sum = 0;
  for (let i = 0; i < 10; i++) {
    let digit = parseInt(digits[i], 10);
    if (i % 2 === 0) {
      digit *= 2;
      if (digit > 9) digit -= 9;
    }
    sum += digit;
  }

  return sum % 10 === 0;
}
