import pg from 'pg';
const { Client } = pg;

// Loop project (London)
const loopClient = new Client({
  connectionString: "postgresql://neondb_owner:npg_bW3Jsq5tEQxL@ep-summer-glade-abc7gj8d-pooler.eu-west-2.aws.neon.tech/neondb?sslmode=require"
});

// LoopDesk project (Frankfurt)
const loopdeskClient = new Client({
  connectionString: "postgresql://neondb_owner:npg_eWiqBKdgCf71@ep-rapid-salad-agxleazh-pooler.c-2.eu-central-1.aws.neon.tech/neondb?sslmode=require"
});

async function checkData() {
  try {
    // Check loop DB
    await loopClient.connect();
    console.log('\n=== LOOP PROJECT (London) ===');

    const loopTables = await loopClient.query(`
      SELECT tablename FROM pg_tables WHERE schemaname = 'public' ORDER BY tablename
    `);
    console.log('Tables:', loopTables.rows.map(r => r.tablename).join(', '));

    const loopUsers = await loopClient.query('SELECT COUNT(*) FROM "User"');
    console.log('Users:', loopUsers.rows[0].count);

    const loopAccounts = await loopClient.query('SELECT COUNT(*) FROM "Account"');
    console.log('Accounts:', loopAccounts.rows[0].count);

    const loopSessions = await loopClient.query('SELECT COUNT(*) FROM "Session"');
    console.log('Sessions:', loopSessions.rows[0].count);

    await loopClient.end();

    // Check LoopDesk DB
    await loopdeskClient.connect();
    console.log('\n=== LOOPDESK PROJECT (Frankfurt) ===');

    const loopdeskTables = await loopdeskClient.query(`
      SELECT tablename FROM pg_tables WHERE schemaname = 'public' ORDER BY tablename
    `);
    console.log('Tables:', loopdeskTables.rows.map(r => r.tablename).join(', '));

    const loopdeskUsers = await loopdeskClient.query('SELECT COUNT(*) FROM "User"');
    console.log('Users:', loopdeskUsers.rows[0].count);

    const loopdeskAccounts = await loopdeskClient.query('SELECT COUNT(*) FROM "Account"');
    console.log('Accounts:', loopdeskAccounts.rows[0].count);

    const loopdeskSessions = await loopdeskClient.query('SELECT COUNT(*) FROM "Session"');
    console.log('Sessions:', loopdeskSessions.rows[0].count);

    await loopdeskClient.end();

  } catch (error) {
    console.error('Error:', error.message);
  }
}

checkData();
