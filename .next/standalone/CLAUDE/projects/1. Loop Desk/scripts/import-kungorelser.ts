/**
 * Import kungörelser from JSON file to database (Supabase)
 *
 * Run with: npx tsx scripts/import-kungorelser.ts
 */

import { config } from 'dotenv';
config({ path: '.env.local' });

import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import * as fs from 'fs';

function createPrisma(): PrismaClient {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error("DATABASE_URL not set");
  }
  const pool = new Pool({ connectionString });
  const adapter = new PrismaPg(pool);
  return new PrismaClient({ adapter });
}

const prisma = createPrisma();

interface KungorelseData {
  id: string;
  url: string;
  bolag: {
    namn: string;
    orgnr: string;
  };
  kungörelse: {
    typ: string;
    rapportör: string;
    publiceringsdatum: string;
  };
  detaljer: string | null;
  rådata: string;
}

function parseDate(dateStr: string | null): Date | null {
  if (!dateStr) return null;
  try {
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return null;
    return date;
  } catch {
    return null;
  }
}

async function importKungorelser() {
  const dataPath = '/Users/isak/Desktop/kungörelser databasfiler/kungörelser_formaterad.json';

  console.log('📂 Reading JSON file...');
  const rawData = fs.readFileSync(dataPath, 'utf-8');
  const data: KungorelseData[] = JSON.parse(rawData);

  console.log(`📊 Found ${data.length} announcements to import`);

  // Transform data to match Prisma schema
  const announcements = data.map(item => ({
    id: item.id,
    query: item.bolag.namn, // Use company name as query
    reporter: item.kungörelse.rapportör || null,
    type: item.kungörelse.typ || null,
    subject: item.bolag.namn,
    pubDate: item.kungörelse.publiceringsdatum || null,
    publishedAt: parseDate(item.kungörelse.publiceringsdatum),
    detailText: item.detaljer || null,
    fullText: item.detaljer || null, // Use detaljer as fullText too
    url: item.url || null,
    orgNumber: item.bolag.orgnr || null,
  }));

  console.log('🔄 Starting batch import...');

  // Batch upsert in chunks of 100
  const chunkSize = 100;
  let imported = 0;
  let errors = 0;

  for (let i = 0; i < announcements.length; i += chunkSize) {
    const chunk = announcements.slice(i, i + chunkSize);

    try {
      // Use transaction for batch insert
      await prisma.$transaction(
        chunk.map(announcement =>
          prisma.announcement.upsert({
            where: { id: announcement.id },
            create: announcement,
            update: announcement,
          })
        )
      );

      imported += chunk.length;
      console.log(`✅ Imported ${imported}/${announcements.length} (${Math.round(imported/announcements.length*100)}%)`);
    } catch (error) {
      console.error(`❌ Error importing chunk at index ${i}:`, error);
      errors += chunk.length;

      // Try one by one for failed chunk
      for (const announcement of chunk) {
        try {
          await prisma.announcement.upsert({
            where: { id: announcement.id },
            create: announcement,
            update: announcement,
          });
          imported++;
        } catch (e) {
          console.error(`  Failed: ${announcement.id} - ${e}`);
          errors++;
        }
      }
    }
  }

  // Update stats
  await prisma.announcementScrapeStats.upsert({
    where: { id: 'stats' },
    create: {
      id: 'stats',
      totalSearches: 0,
      totalAnnouncements: imported,
      lastSearchAt: new Date(),
    },
    update: {
      totalAnnouncements: imported,
      lastSearchAt: new Date(),
    },
  });

  console.log('\n📈 Import complete!');
  console.log(`   ✅ Successfully imported: ${imported}`);
  console.log(`   ❌ Errors: ${errors}`);

  // Show summary by type
  const typeCounts = await prisma.announcement.groupBy({
    by: ['type'],
    _count: true,
    orderBy: { _count: { type: 'desc' } },
  });

  console.log('\n📊 Announcements by type:');
  typeCounts.forEach(t => {
    console.log(`   ${t.type || 'Unknown'}: ${t._count}`);
  });
}

importKungorelser()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
