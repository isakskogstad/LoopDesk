// Person enrichment logic

import { prisma } from "@/lib/db";
import type { Person, PersonRole, RoleType } from "@prisma/client";
import { fetchCompanyPeople, delay } from "./fetch";
import {
  mapRoleTitle,
  parsePersonName,
  parseBirthYear,
  getRoleGroup,
  type EnrichmentResult,
  type AllabolagCompanyRole,
} from "./types";

interface EnrichOptions {
  /** Maximum number of companies to process */
  limit?: number;
  /** Delay between API calls in ms */
  delayMs?: number;
  /** Only process companies without enriched CEO data */
  onlyMissing?: boolean;
  /** Dry run - don't write to database */
  dryRun?: boolean;
}

/**
 * Enrich person data from WatchedCompany CEO field
 * Fetches full data from Allabolag and creates Person + PersonRole records
 */
export async function enrichCEOsFromWatchedCompanies(
  options: EnrichOptions = {}
): Promise<EnrichmentResult> {
  const { limit = 100, delayMs = 1000, onlyMissing = true, dryRun = false } = options;

  const result: EnrichmentResult = {
    processed: 0,
    created: 0,
    updated: 0,
    skipped: 0,
    errors: [],
  };

  // Get companies with CEO names
  const companies = await prisma.watchedCompany.findMany({
    where: {
      ceo: { not: null },
      status: "ACTIVE",
    },
    select: {
      id: true,
      orgNumber: true,
      name: true,
      ceo: true,
    },
    take: limit,
    orderBy: { name: "asc" },
  });

  console.log(`Found ${companies.length} companies with CEO data`);

  for (const company of companies) {
    try {
      result.processed++;

      // Check if we already have a CEO role for this company
      if (onlyMissing) {
        const existingRole = await prisma.personRole.findFirst({
          where: {
            orgNumber: company.orgNumber,
            roleType: "CEO",
          },
        });

        if (existingRole) {
          console.log(`Skipping ${company.name} - CEO already exists`);
          result.skipped++;
          continue;
        }
      }

      console.log(`Processing ${company.name} (${company.orgNumber})...`);

      // Fetch company data from Allabolag
      const data = await fetchCompanyPeople(company.orgNumber);

      if (!data) {
        result.errors.push(`${company.name}: Failed to fetch from Allabolag`);
        continue;
      }

      // Find CEO in roles
      const ceoRole = data.roles.find((r) => {
        const roleType = mapRoleTitle(r.role);
        return roleType === "CEO";
      });

      if (!ceoRole) {
        console.log(`No CEO found in Allabolag data for ${company.name}`);
        result.errors.push(`${company.name}: No CEO in Allabolag data`);
        continue;
      }

      if (dryRun) {
        console.log(`[DRY RUN] Would create/update person: ${ceoRole.name} (${ceoRole.id})`);
        result.created++;
        continue;
      }

      // Create or update person
      const personResult = await upsertPersonWithRole(
        ceoRole,
        company.orgNumber,
        data.company.name,
        company.id
      );

      if (personResult.created) {
        result.created++;
      } else {
        result.updated++;
      }

      // Also process other roles (board, management, etc.)
      for (const role of data.roles) {
        if (role.id === ceoRole.id && role.role === ceoRole.role) continue; // Skip CEO, already processed

        // Only process persons, not companies (e.g., audit firms)
        if (role.type === "Company") continue;

        await upsertPersonWithRole(role, company.orgNumber, data.company.name, company.id);
      }

      // Rate limiting
      await delay(delayMs);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      result.errors.push(`${company.name}: ${message}`);
      console.error(`Error processing ${company.name}:`, error);
    }
  }

  // Update statistics for all persons
  await updateAllPersonStats();

  return result;
}

/**
 * Create or update a person and their role
 */
async function upsertPersonWithRole(
  role: AllabolagCompanyRole,
  orgNumber: string,
  companyName: string,
  watchedCompanyId: string
): Promise<{ person: Person; role: PersonRole; created: boolean }> {
  const { firstName, lastName } = parsePersonName(role.name);
  const birthYear = parseBirthYear(role.birthDate);
  const roleType = mapRoleTitle(role.role);
  const roleGroup = getRoleGroup(roleType);

  // Try to find existing person by allabolagId
  let person = role.id
    ? await prisma.person.findUnique({
        where: { allabolagId: role.id },
      })
    : null;

  let created = false;

  // If not found by ID, try name + birthYear
  if (!person && birthYear) {
    person = await prisma.person.findFirst({
      where: {
        name: role.name,
        birthYear: birthYear,
      },
    });
  }

  // Create new person if not found
  if (!person) {
    person = await prisma.person.create({
      data: {
        name: role.name,
        firstName,
        lastName,
        birthYear,
        allabolagId: role.id || null,
        personType: roleType === "CEO" || roleType === "DEPUTY_CEO" ? "EXECUTIVE" : "BOARD_MEMBER",
        source: "allabolag",
        lastEnriched: new Date(),
      },
    });
    created = true;
    console.log(`  Created person: ${role.name}`);
  } else {
    // Update existing person with allabolagId if missing
    if (role.id && !person.allabolagId) {
      await prisma.person.update({
        where: { id: person.id },
        data: {
          allabolagId: role.id,
          lastEnriched: new Date(),
        },
      });
    }
  }

  // Upsert role
  const personRole = await prisma.personRole.upsert({
    where: {
      personId_orgNumber_roleType: {
        personId: person.id,
        orgNumber,
        roleType,
      },
    },
    create: {
      personId: person.id,
      orgNumber,
      companyName,
      watchedCompanyId,
      roleType,
      roleTitle: role.role,
      roleGroup,
      isActive: true,
      isPrimary: roleType === "CEO",
      source: "allabolag",
      sourceId: role.id,
      lastVerified: new Date(),
    },
    update: {
      companyName,
      roleTitle: role.role,
      lastVerified: new Date(),
    },
  });

  return { person, role: personRole, created };
}

/**
 * Update computed statistics for all persons
 */
async function updateAllPersonStats(): Promise<void> {
  const persons = await prisma.person.findMany({
    select: { id: true },
  });

  for (const person of persons) {
    await updatePersonStats(person.id);
  }
}

/**
 * Update computed statistics for a single person
 */
export async function updatePersonStats(personId: string): Promise<void> {
  const roles = await prisma.personRole.findMany({
    where: { personId },
  });

  const activeRoles = roles.filter((r) => r.isActive);
  const boardRoles = roles.filter((r) =>
    ["CHAIRMAN", "VICE_CHAIRMAN", "BOARD_MEMBER", "BOARD_DEPUTY"].includes(r.roleType)
  );

  const investments = await prisma.personInvestment.count({
    where: { personId },
  });

  await prisma.person.update({
    where: { id: personId },
    data: {
      totalCompanies: roles.length,
      activeCompanies: activeRoles.length,
      totalBoardSeats: boardRoles.length,
      totalInvestments: investments,
    },
  });
}

/**
 * Enrich a single company's people
 */
export async function enrichCompanyPeople(orgNumber: string): Promise<EnrichmentResult> {
  const result: EnrichmentResult = {
    processed: 0,
    created: 0,
    updated: 0,
    skipped: 0,
    errors: [],
  };

  const company = await prisma.watchedCompany.findUnique({
    where: { orgNumber },
  });

  if (!company) {
    result.errors.push(`Company ${orgNumber} not found in WatchedCompany`);
    return result;
  }

  const data = await fetchCompanyPeople(orgNumber);

  if (!data) {
    result.errors.push(`Failed to fetch ${orgNumber} from Allabolag`);
    return result;
  }

  for (const role of data.roles) {
    if (role.type === "Company") continue;

    result.processed++;

    try {
      const personResult = await upsertPersonWithRole(
        role,
        orgNumber,
        data.company.name,
        company.id
      );

      if (personResult.created) {
        result.created++;
      } else {
        result.updated++;
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      result.errors.push(`${role.name}: ${message}`);
    }
  }

  return result;
}
