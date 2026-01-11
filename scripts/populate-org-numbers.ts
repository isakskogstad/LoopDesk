/**
 * Populate orgNumber for FamilyOffice and VCCompany via Allabolag API
 */

import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error('DATABASE_URL required');
}

const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

const BASE_URL = 'https://loopdesk-production.up.railway.app';
const DELAY_MS = 1500;

async function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function searchCompany(name: string): Promise<string | null> {
  try {
    const res = await fetch(`${BASE_URL}/api/bolag/search?q=${encodeURIComponent(name)}`);
    if (!res.ok) return null;

    const data = await res.json();
    if (data.companies && data.companies.length > 0) {
      // Find best match (exact name match or first result)
      const exact = data.companies.find((c: any) =>
        c.name.toLowerCase() === name.toLowerCase()
      );
      return exact?.orgNr || data.companies[0]?.orgNr || null;
    }
    return null;
  } catch (e) {
    console.error(`  Error searching ${name}:`, e);
    return null;
  }
}

async function main() {
  console.log('=== Populerar orgNumber för FamilyOffice och VCCompany ===\n');

  // Check current status
  const foWithOrg = await prisma.familyOffice.count({ where: { orgNumber: { not: null } } });
  const foTotal = await prisma.familyOffice.count();
  const vcWithOrg = await prisma.vCCompany.count({ where: { orgNumber: { not: null } } });
  const vcTotal = await prisma.vCCompany.count();

  console.log(`FamilyOffice: ${foWithOrg}/${foTotal} har orgNumber`);
  console.log(`VCCompany: ${vcWithOrg}/${vcTotal} har orgNumber\n`);

  // Get companies without orgNumber
  const familyOffices = await prisma.familyOffice.findMany({
    where: { orgNumber: null },
    select: { id: true, name: true }
  });

  const vcCompanies = await prisma.vCCompany.findMany({
    where: { orgNumber: null },
    select: { id: true, name: true }
  });

  console.log(`Söker orgNumber för ${familyOffices.length} Family Offices...`);
  let foUpdated = 0;
  const foFailed: string[] = [];

  for (const fo of familyOffices) {
    process.stdout.write(`  ${fo.name}... `);
    const orgNr = await searchCompany(fo.name);

    if (orgNr) {
      await prisma.familyOffice.update({
        where: { id: fo.id },
        data: { orgNumber: orgNr }
      });
      console.log(`✓ ${orgNr}`);
      foUpdated++;
    } else {
      console.log('✗ Hittades ej');
      foFailed.push(fo.name);
    }
    await sleep(DELAY_MS);
  }

  console.log(`\nSöker orgNumber för ${vcCompanies.length} VC Companies...`);
  let vcUpdated = 0;
  const vcFailed: string[] = [];

  for (const vc of vcCompanies) {
    process.stdout.write(`  ${vc.name}... `);
    const orgNr = await searchCompany(vc.name);

    if (orgNr) {
      await prisma.vCCompany.update({
        where: { id: vc.id },
        data: { orgNumber: orgNr }
      });
      console.log(`✓ ${orgNr}`);
      vcUpdated++;
    } else {
      console.log('✗ Hittades ej');
      vcFailed.push(vc.name);
    }
    await sleep(DELAY_MS);
  }

  console.log('\n=== RESULTAT ===');
  console.log(`FamilyOffice: ${foUpdated} uppdaterade, ${foFailed.length} missade`);
  console.log(`VCCompany: ${vcUpdated} uppdaterade, ${vcFailed.length} missade`);

  if (foFailed.length > 0) {
    console.log('\nFamily Offices som missades:');
    foFailed.forEach(n => console.log(`  - ${n}`));
  }

  if (vcFailed.length > 0) {
    console.log('\nVC Companies som missades:');
    vcFailed.forEach(n => console.log(`  - ${n}`));
  }

  await prisma.$disconnect();
}

main().catch(async (e) => {
  console.error(e);
  await prisma.$disconnect();
  process.exit(1);
});
