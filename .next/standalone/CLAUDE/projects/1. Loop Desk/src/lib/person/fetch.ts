// Fetch person data from Allabolag

import type { AllabolagPersonData, AllabolagCompanyRole } from "./types";

const BASE_URL = "https://www.allabolag.se";
const USER_AGENT =
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36";

/**
 * Normalize org number by removing dashes and spaces
 */
function normalizeOrgNumber(orgNr: string): string {
  return orgNr.replace(/[-\s]/g, "");
}

interface AllabolagCompanyData {
  roles?: {
    manager?: AllabolagCompanyRole;
    chairman?: AllabolagCompanyRole;
    roleGroups?: {
      name: string;
      roles: AllabolagCompanyRole[];
    }[];
    numberOfRoles?: number;
  };
}

/**
 * Fetch company data from Allabolag and extract person roles
 */
export async function fetchCompanyPeople(
  orgNumber: string
): Promise<{ company: { name: string; orgNr: string }; roles: AllabolagCompanyRole[] } | null> {
  try {
    const normalizedOrgNr = normalizeOrgNumber(orgNumber);
    const response = await fetch(`${BASE_URL}/${normalizedOrgNr}`, {
      headers: {
        "User-Agent": USER_AGENT,
        Accept: "text/html,application/xhtml+xml",
      },
      redirect: "follow",
    });

    if (!response.ok) {
      console.error(`Failed to fetch company ${orgNumber}: ${response.status}`);
      return null;
    }

    const html = await response.text();
    const match = html.match(
      /<script id="__NEXT_DATA__" type="application\/json">([^<]+)<\/script>/
    );

    if (!match) {
      console.error(`No NEXT_DATA found for company ${orgNumber}`);
      return null;
    }

    const data = JSON.parse(match[1]);
    const company = data.props?.pageProps?.company as AllabolagCompanyData & {
      name: string;
      orgnr: string;
    };

    if (!company) {
      return null;
    }

    const roles: AllabolagCompanyRole[] = [];

    // Add CEO
    if (company.roles?.manager) {
      roles.push(company.roles.manager);
    }

    // Add Chairman
    if (company.roles?.chairman) {
      roles.push(company.roles.chairman);
    }

    // Add role groups (Board, Management, Revision, Other)
    if (company.roles?.roleGroups) {
      for (const group of company.roles.roleGroups) {
        for (const role of group.roles) {
          // Avoid duplicates (chairman might appear in both places)
          if (!roles.some((r) => r.id === role.id && r.role === role.role)) {
            roles.push(role);
          }
        }
      }
    }

    return {
      company: { name: company.name, orgNr: company.orgnr },
      roles,
    };
  } catch (error) {
    console.error(`Error fetching company ${orgNumber}:`, error);
    return null;
  }
}

/**
 * Fetch person data from Allabolag person page
 */
export async function fetchPersonData(
  personId: string,
  personName?: string
): Promise<AllabolagPersonData | null> {
  try {
    // Build URL with name slug if available
    let url = `${BASE_URL}/befattningshavare/${personId}`;

    if (personName) {
      const slug = personName
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "");

      if (slug) {
        url = `${BASE_URL}/befattning/${slug}/-/${personId}`;
      }
    }

    const response = await fetch(url, {
      headers: {
        "User-Agent": USER_AGENT,
        Accept: "text/html,application/xhtml+xml",
      },
      redirect: "follow",
    });

    if (!response.ok) {
      console.error(`Failed to fetch person ${personId}: ${response.status}`);
      return null;
    }

    const html = await response.text();
    const match = html.match(
      /<script id="__NEXT_DATA__" type="application\/json">([^<]+)<\/script>/
    );

    if (!match) {
      console.error(`No NEXT_DATA found for person ${personId}`);
      return null;
    }

    const data = JSON.parse(match[1]);
    const pageProps = data.props?.pageProps;

    // Allabolag uses "rolePerson" structure
    const rolePerson = pageProps?.rolePerson;

    if (!rolePerson) {
      console.error(`No rolePerson data for ${personId}`);
      return null;
    }

    return {
      name: rolePerson.name,
      personId: rolePerson.personId,
      yearOfBirth: rolePerson.yearOfBirth,
      birthDate: rolePerson.birthDate,
      age: rolePerson.age,
      gender: rolePerson.gender,
      businessPerson: rolePerson.businessPerson,
      numberOfRoles: rolePerson.numberOfRoles,
      location: rolePerson.location,
      roles: rolePerson.roles,
      connections: rolePerson.connections,
      ownerships: rolePerson.ownerships,
    };
  } catch (error) {
    console.error(`Error fetching person ${personId}:`, error);
    return null;
  }
}

/**
 * Delay helper for rate limiting
 */
export function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
