const { Client } = require('pg');

const NEON_URL = 'postgresql://neondb_owner:npg_eWiqBKdgCf71@ep-rapid-salad-agxleazh-pooler.c-2.eu-central-1.aws.neon.tech/neondb?sslmode=require';
const SUPABASE_URL = 'postgresql://postgres.rpjmsncjnhtnjnycabys:Wdef3579!1019@aws-1-eu-central-1.pooler.supabase.com:5432/postgres';

async function migrateTable(neon, supabase, tableName, columns) {
  console.log(`\n📦 Migrerar ${tableName}...`);

  // Hämta befintliga IDs i Supabase
  const existingIds = await supabase.query(`SELECT id FROM "${tableName}"`);
  const existingSet = new Set(existingIds.rows.map(r => r.id));
  console.log(`  Befintliga i Supabase: ${existingSet.size}`);

  // Hämta alla från Neon
  const colStr = columns.map(c => `"${c}"`).join(', ');
  const neonData = await neon.query(`SELECT ${colStr} FROM "${tableName}"`);
  console.log(`  Totalt i Neon: ${neonData.rows.length}`);

  // Filtrera nya
  const newRows = neonData.rows.filter(r => !existingSet.has(r.id));
  console.log(`  Nya att migrera: ${newRows.length}`);

  if (newRows.length === 0) {
    console.log('  ✅ Ingen data att migrera');
    return 0;
  }

  // Insert one by one with conflict handling
  let inserted = 0;

  for (let i = 0; i < newRows.length; i++) {
    const row = newRows[i];
    const values = columns.map(c => row[c]);
    const placeholders = columns.map((_, idx) => `$${idx + 1}`).join(', ');
    const colList = columns.map(c => `"${c}"`).join(', ');

    try {
      await supabase.query(
        `INSERT INTO "${tableName}" (${colList}) VALUES (${placeholders}) ON CONFLICT (id) DO NOTHING`,
        values
      );
      inserted++;
    } catch (e) {
      // Ignore duplicates and constraint errors
    }

    if ((i + 1) % 100 === 0) {
      console.log(`  Progress: ${i + 1}/${newRows.length}`);
    }
  }

  console.log(`  ✅ Migrerade ${inserted} rader`);
  return inserted;
}

async function run() {
  const neon = new Client({ connectionString: NEON_URL });
  const supabase = new Client({ connectionString: SUPABASE_URL });

  await neon.connect();
  await supabase.connect();

  console.log('🚀 Startar datamigrering Neon → Supabase\n');

  // Article columns
  const articleCols = ['id', 'externalId', 'url', 'title', 'description', 'content', 'author',
    'imageUrl', 'publishedAt', 'fetchedAt', 'sourceId', 'sourceName', 'sourceColor', 'sourceType',
    'freshRssId', 'feedId', 'titleHash', 'isRead', 'isBookmarked', 'userId', 'createdAt', 'updatedAt',
    'mediaDuration', 'mediaEmbed', 'mediaPlatform', 'mediaThumbnail', 'mediaType', 'mediaUrl'];

  await migrateTable(neon, supabase, 'Article', articleCols);

  // Person columns
  const personCols = ['id', 'name', 'firstName', 'lastName', 'birthYear', 'allabolagId', 'linkedinSlug',
    'email', 'phone', 'title', 'bio', 'imageUrl', 'location', 'personType', 'tags',
    'totalCompanies', 'activeCompanies', 'totalBoardSeats', 'totalInvestments',
    'source', 'lastEnriched', 'enrichmentError', 'isVerified', 'createdAt', 'updatedAt'];

  await migrateTable(neon, supabase, 'Person', personCols);

  // Announcement columns
  const announcementCols = ['id', 'query', 'reporter', 'type', 'subject', 'pubDate', 'publishedAt',
    'detailText', 'fullText', 'url', 'orgNumber', 'scrapedAt', 'createdAt', 'updatedAt'];

  await migrateTable(neon, supabase, 'Announcement', announcementCols);

  // PersonRole columns
  const personRoleCols = ['id', 'personId', 'orgNumber', 'companyName', 'watchedCompanyId',
    'roleType', 'roleTitle', 'roleGroup', 'startDate', 'endDate', 'isActive', 'isPrimary',
    'source', 'sourceId', 'lastVerified', 'createdAt', 'updatedAt'];

  await migrateTable(neon, supabase, 'PersonRole', personRoleCols);

  await neon.end();
  await supabase.end();

  console.log('\n✅ Migrering klar!');
}

run().catch(e => console.error('FEL:', e.message));
