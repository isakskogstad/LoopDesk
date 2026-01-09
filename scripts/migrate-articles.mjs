#!/usr/bin/env node
/**
 * Article Migration Script: Neon -> Supabase
 *
 * Usage:
 *   node scripts/migrate-articles.mjs
 *
 * Requirements:
 *   npm install pg
 */

import pg from 'pg';
const { Client } = pg;

// Connection strings
const NEON_URL = "postgresql://neondb_owner:npg_eWiqBKdgCf71@ep-rapid-salad-agxleazh-pooler.c-2.eu-central-1.aws.neon.tech/neondb?channel_binding=require&sslmode=require";

// Supabase - you need to update this with your actual connection string
// Get it from: Supabase Dashboard -> Project Settings -> Database -> Connection String -> URI
const SUPABASE_URL = process.env.SUPABASE_DATABASE_URL || "postgresql://postgres:[YOUR-PASSWORD]@db.[YOUR-PROJECT-REF].supabase.co:5432/postgres";

const BATCH_SIZE = 50;
const START_OFFSET = 80; // Already migrated: 0-79

const COLUMNS = [
  "id", "externalId", "url", "title", "description", "content", "author",
  "imageUrl", "publishedAt", "fetchedAt", "sourceId", "sourceName",
  "sourceColor", "sourceType", "freshRssId", "feedId", "titleHash",
  "isRead", "isBookmarked", "userId", "createdAt", "updatedAt",
  "mediaDuration", "mediaEmbed", "mediaPlatform", "mediaThumbnail",
  "mediaType", "mediaUrl"
];

async function getTotalCount(neonClient) {
  const result = await neonClient.query('SELECT COUNT(*) as total FROM "Article"');
  return parseInt(result.rows[0].total);
}

async function fetchBatch(neonClient, offset, limit) {
  const query = `
    SELECT ${COLUMNS.map(c => `"${c}"`).join(', ')}
    FROM "Article"
    ORDER BY id
    LIMIT $1 OFFSET $2
  `;
  const result = await neonClient.query(query, [limit, offset]);
  return result.rows;
}

async function insertBatch(supabaseClient, articles) {
  if (!articles.length) return 0;

  let inserted = 0;
  for (const article of articles) {
    const placeholders = COLUMNS.map((_, i) => `$${i + 1}`).join(', ');
    const colStr = COLUMNS.map(c => `"${c}"`).join(', ');

    const query = `
      INSERT INTO "Article" (${colStr})
      VALUES (${placeholders})
      ON CONFLICT (id) DO NOTHING
    `;

    const values = COLUMNS.map(col => article[col]);

    try {
      await supabaseClient.query(query, values);
      inserted++;
    } catch (error) {
      console.error(`  Error inserting ${article.id}:`, error.message);
    }
  }

  return inserted;
}

async function main() {
  console.log('='.repeat(60));
  console.log('Article Migration: Neon -> Supabase');
  console.log('='.repeat(60));

  // Check for Supabase URL
  if (SUPABASE_URL.includes('[YOUR-')) {
    console.error('\nERROR: Please set SUPABASE_DATABASE_URL environment variable');
    console.log('\nGet your connection string from:');
    console.log('Supabase Dashboard -> Project Settings -> Database -> Connection String -> URI');
    console.log('\nThen run:');
    console.log('SUPABASE_DATABASE_URL="your-url" node scripts/migrate-articles.mjs');
    process.exit(1);
  }

  // Connect to databases
  console.log('\nConnecting to Neon...');
  const neonClient = new Client({ connectionString: NEON_URL });
  await neonClient.connect();

  console.log('Connecting to Supabase...');
  const supabaseClient = new Client({ connectionString: SUPABASE_URL });
  await supabaseClient.connect();

  // Get counts
  const total = await getTotalCount(neonClient);
  console.log(`\nTotal articles in Neon: ${total}`);
  console.log(`Starting from offset: ${START_OFFSET}`);
  console.log(`Remaining to migrate: ${total - START_OFFSET}`);

  // Migrate in batches
  let offset = START_OFFSET;
  let totalInserted = 0;

  while (offset < total) {
    process.stdout.write(`\nBatch: offset ${offset}-${offset + BATCH_SIZE - 1}... `);

    // Fetch from Neon
    const articles = await fetchBatch(neonClient, offset, BATCH_SIZE);

    if (!articles.length) {
      console.log('No more articles');
      break;
    }

    // Insert to Supabase
    const inserted = await insertBatch(supabaseClient, articles);
    totalInserted += inserted;

    console.log(`Inserted ${inserted}/${articles.length} rows`);

    offset += BATCH_SIZE;
  }

  // Cleanup
  await neonClient.end();
  await supabaseClient.end();

  console.log('\n' + '='.repeat(60));
  console.log(`Migration complete! Total inserted: ${totalInserted}`);
  console.log('='.repeat(60));
}

main().catch(console.error);
