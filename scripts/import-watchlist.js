/**
 * Import Watchlist CSV Data to Neon Database
 */

const fs = require('fs');
const path = require('path');
const { PrismaClient } = require('@prisma/client');
const { PrismaPg } = require('@prisma/adapter-pg');
const { Pool } = require('pg');

// Create connection pool
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: 5,
  ssl: { rejectUnauthorized: false }
});

// Create Prisma adapter
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

const CSV_PATH = '/Users/isak/Desktop/Bevakningslista/bevkaningslita impact valuation.csv';
const LOGO_PATH = '/Users/isak/Desktop/Bevakningslista/Logotyper';

function parseSekAmount(str) {
  if (!str || str.trim() === '') return null;
  let cleaned = str.replace(/SEK\s*/gi, '').trim();
  const isNegative = cleaned.includes('-') || cleaned.includes('−');
  cleaned = cleaned.replace(/[-−]/g, '').replace(/[\s,]/g, '');
  if (cleaned.includes(',')) cleaned = cleaned.split(',')[0];
  const num = parseInt(cleaned, 10);
  if (isNaN(num)) return null;
  return isNegative ? -num : num;
}

function parseGrowth(str) {
  if (!str || str.trim() === '') return null;
  let cleaned = str.trim();
  const isNegative = cleaned.includes('−') || cleaned.includes('-');
  cleaned = cleaned.replace(/[−-]/g, '').replace(',', '.');
  const num = parseFloat(cleaned);
  if (isNaN(num)) return null;
  return isNegative ? -num : num;
}

function hasLogo(orgNumber) {
  if (!orgNumber) return false;
  const logoPath = path.join(LOGO_PATH, `${orgNumber.replace(/-/g, '')}.png`);
  return fs.existsSync(logoPath);
}

function parseCSVLine(line) {
  const result = [];
  let current = '';
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === ';' && !inQuotes) {
      result.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }
  result.push(current.trim());
  return result;
}

async function importWatchlist() {
  console.log('Reading CSV file...');
  const csvContent = fs.readFileSync(CSV_PATH, 'utf8');
  const lines = csvContent.split('\n').filter(line => line.trim());
  const header = parseCSVLine(lines[0]);
  console.log('CSV Headers:', header);

  const headerMap = {};
  header.forEach((h, i) => { headerMap[h.toLowerCase().trim()] = i; });

  const companies = [];

  for (let i = 1; i < lines.length; i++) {
    const fields = parseCSVLine(lines[i]);
    if (fields.length < 2) continue;

    const name = fields[headerMap['impact company']] || '';
    const orgNumber = fields[headerMap['org-number']] || '';
    if (!name || !orgNumber) continue;

    const company = {
      orgNumber: orgNumber.trim(),
      name: name.trim(),
      hasLogo: hasLogo(orgNumber),
      impactNiche: fields[headerMap['impact niche']] || null,
      city: fields[headerMap['city']] || null,
      ceo: fields[headerMap['ceo']] || null,
      startYear: fields[headerMap['start year']] || null,
      fundraising: fields[headerMap['fundrasing']] || null,
      totalFunding: fields[headerMap['total funding']] || null,
      latestFundingRound: fields[headerMap['latest funding round']] || null,
      latestFundingDate: fields[headerMap['date of latest funding round']] || null,
      latestValuation: fields[headerMap['latest valuation (post-money)']] || null,
      turnover2024: fields[headerMap['turnover 2024 (netto)']] || null,
      profit2024: fields[headerMap['profit (ebit) 2024']] || null,
      turnover2023: fields[headerMap['turnover 2023 (netto)']] || null,
      profit2023: fields[headerMap['profit (ebit) 2023']] || null,
      growth2023to2024: fields[headerMap['growth % 2023-2024']] || null,
      largestOwners: fields[headerMap['largest owners']] || null,
      totalFundingNum: parseSekAmount(fields[headerMap['total funding']]),
      latestValuationNum: parseSekAmount(fields[headerMap['latest valuation (post-money)']]),
      turnover2024Num: parseSekAmount(fields[headerMap['turnover 2024 (netto)']]),
      profit2024Num: parseSekAmount(fields[headerMap['profit (ebit) 2024']]),
      growthNum: parseGrowth(fields[headerMap['growth % 2023-2024']]),
      lastUpdated: new Date(),
    };
    companies.push(company);
  }

  console.log(`Parsed ${companies.length} companies from CSV`);
  console.log('Importing to database...');

  let imported = 0, errors = 0;

  for (const company of companies) {
    try {
      await prisma.watchedCompany.upsert({
        where: { orgNumber: company.orgNumber },
        update: company,
        create: company,
      });
      imported++;
      process.stdout.write(`\rImported: ${imported}/${companies.length}`);
    } catch (err) {
      errors++;
      console.error(`\nError importing ${company.name}:`, err.message);
    }
  }

  console.log(`\n\nImport complete! ${imported} imported, ${errors} errors`);

  const count = await prisma.watchedCompany.count();
  console.log(`Total companies in database: ${count}`);
}

importWatchlist()
  .then(() => process.exit(0))
  .catch((err) => { console.error('Import failed:', err); process.exit(1); })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
