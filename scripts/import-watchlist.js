#!/usr/bin/env node
/* eslint-disable @typescript-eslint/no-require-imports */
/**
 * Import watchlist CSV to Neon database
 * Usage: DATABASE_URL="..." node scripts/import-watchlist.js
 */

const { PrismaClient } = require('@prisma/client');
const { PrismaPg } = require('@prisma/adapter-pg');
const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

// Create connection pool
const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  console.error('DATABASE_URL environment variable is not set');
  process.exit(1);
}

const pool = new Pool({
  connectionString,
  max: 10,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 10000,
});

const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

// Path to watchlist files
const CSV_PATH = '/Users/isak/Desktop/Bevakningslista/bevkaningslita impact valuation.csv';
const LOGOS_PATH = '/Users/isak/Desktop/Bevakningslista/Logotyper';

function parseCSV(content) {
  const lines = content.split('\n').filter(line => line.trim());
  const headers = lines[0].split(';').map(h => h.trim());

  return lines.slice(1).map(line => {
    const values = line.split(';');
    const row = {};
    headers.forEach((header, i) => {
      row[header] = values[i]?.trim() || null;
    });
    return row;
  });
}

function cleanOrgNumber(orgNumber) {
  if (!orgNumber) return null;
  // Remove dashes and spaces, keep only digits
  return orgNumber.replace(/[^0-9]/g, '');
}

function parseSwedishAmount(text) {
  if (!text) return null;
  // Remove "SEK", spaces, commas for thousands, and convert
  const cleaned = text
    .replace(/SEK/gi, '')
    .replace(/[^0-9\-.,]/g, '')
    .replace(/\./g, '')  // Remove thousands separator
    .replace(',', '.')   // Convert decimal comma to dot
    .trim();

  const num = parseFloat(cleaned);
  return isNaN(num) ? null : BigInt(Math.round(num));
}

function parseGrowth(text) {
  if (!text) return null;
  // Handle formats like "−75,0" or "318,6"
  const cleaned = text
    .replace('−', '-')
    .replace(',', '.')
    .replace(/[^0-9\-.]/g, '')
    .trim();

  const num = parseFloat(cleaned);
  return isNaN(num) ? null : num;
}

function checkLogoExists(orgNumber) {
  if (!orgNumber) return false;
  const cleanOrg = cleanOrgNumber(orgNumber);
  const logoPath = path.join(LOGOS_PATH, `${cleanOrg}.png`);
  return fs.existsSync(logoPath);
}

async function main() {
  console.log('Reading CSV file...');
  const csvContent = fs.readFileSync(CSV_PATH, 'utf-8');
  const rows = parseCSV(csvContent);

  console.log(`Found ${rows.length} companies to import`);

  let imported = 0;
  let updated = 0;
  let errors = 0;

  for (const row of rows) {
    try {
      const orgNumber = cleanOrgNumber(row['Org-number']);
      if (!orgNumber) {
        console.warn(`Skipping row without org number: ${row['Impact company']}`);
        continue;
      }

      const hasLogo = checkLogoExists(orgNumber);

      const data = {
        orgNumber,
        name: row['Impact company'] || 'Unknown',
        hasLogo,
        impactNiche: row['Impact niche'] || null,
        city: row['City'] || null,
        ceo: row['CEO'] || null,
        startYear: row['Start year'] || null,
        fundraising: row['Fundrasing'] || null,
        totalFunding: row['Total funding'] || null,
        latestFundingRound: row['Latest funding round'] || null,
        latestFundingDate: row['Date of latest funding round'] || null,
        latestValuation: row['Latest valuation (post-money)'] || null,
        turnover2024: row['Turnover 2024 (netto)'] || null,
        profit2024: row['Profit (EBIT) 2024'] || null,
        turnover2023: row['Turnover 2023 (netto)'] || null,
        profit2023: row['Profit (EBIT) 2023'] || null,
        growth2023to2024: row['Growth % 2023-2024'] || null,
        largestOwners: row['Largest owners'] || null,
        // Numeric versions
        totalFundingNum: parseSwedishAmount(row['Total funding']),
        latestValuationNum: parseSwedishAmount(row['Latest valuation (post-money)']),
        turnover2024Num: parseSwedishAmount(row['Turnover 2024 (netto)']),
        profit2024Num: parseSwedishAmount(row['Profit (EBIT) 2024']),
        growthNum: parseGrowth(row['Growth % 2023-2024']),
        lastUpdated: new Date(),
      };

      // Upsert - create or update
      const existing = await prisma.watchedCompany.findUnique({
        where: { orgNumber }
      });

      if (existing) {
        await prisma.watchedCompany.update({
          where: { orgNumber },
          data
        });
        updated++;
      } else {
        await prisma.watchedCompany.create({ data });
        imported++;
      }

      if ((imported + updated) % 20 === 0) {
        console.log(`Progress: ${imported} imported, ${updated} updated...`);
      }
    } catch (err) {
      console.error(`Error processing ${row['Impact company']}: ${err.message}`);
      errors++;
    }
  }

  console.log('\n=== Import Complete ===');
  console.log(`Imported: ${imported}`);
  console.log(`Updated: ${updated}`);
  console.log(`Errors: ${errors}`);
  console.log(`Total processed: ${imported + updated}`);

  // Count how many have logos
  const withLogos = await prisma.watchedCompany.count({
    where: { hasLogo: true }
  });
  console.log(`Companies with logos: ${withLogos}`);
}

main()
  .catch(console.error)
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
