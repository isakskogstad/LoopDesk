/* eslint-disable @typescript-eslint/no-require-imports */
/**
 * Import updated VC Companies from CSV file
 * Run with: node scripts/import-vc-updated.js
 */

require("dotenv").config({ path: ".env.local" });
const { PrismaClient } = require("@prisma/client");
const { PrismaPg } = require("@prisma/adapter-pg");
const { Pool } = require("pg");
const fs = require("fs");

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error("DATABASE_URL environment variable is not set");
}

const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

// Parse semicolon-separated CSV with multiline support
function parseCSV(content) {
  // Handle BOM
  if (content.charCodeAt(0) === 0xFEFF) {
    content = content.slice(1);
  }

  const records = [];
  let currentRecord = "";
  let inQuotes = false;
  let isHeader = true;

  for (let i = 0; i < content.length; i++) {
    const char = content[i];

    if (char === '"') {
      // Check for escaped quote
      if (inQuotes && content[i + 1] === '"') {
        currentRecord += '"';
        i++; // Skip next quote
      } else {
        inQuotes = !inQuotes;
      }
      currentRecord += char;
    } else if ((char === "\n" || char === "\r") && !inQuotes) {
      // Skip \r in \r\n
      if (char === "\r" && content[i + 1] === "\n") {
        continue;
      }
      if (currentRecord.trim()) {
        if (isHeader) {
          isHeader = false;
        } else {
          records.push(currentRecord);
        }
      }
      currentRecord = "";
    } else {
      currentRecord += char;
    }
  }

  // Don't forget the last record
  if (currentRecord.trim() && !isHeader) {
    records.push(currentRecord);
  }

  console.log(`Parsed ${records.length} data rows`);

  const parsedRecords = [];

  for (const line of records) {
    const parts = [];
    let current = "";
    let inQ = false;

    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      if (char === '"') {
        inQ = !inQ;
      } else if (char === ";" && !inQ) {
        parts.push(current.trim().replace(/^"|"$/g, "").replace(/""/g, '"'));
        current = "";
      } else {
        current += char;
      }
    }
    parts.push(current.trim().replace(/^"|"$/g, "").replace(/""/g, '"'));

    // CSV columns:
    // 0: VC-bolag (name)
    // 1: Typ (type)
    // 2: Impact-nisch (impactNiche)
    // 3: Urval av impact-bolag de investerat i (portfolioCompanies)
    // 4: Beskrivning (sv) (description)
    // 5: Historik & bakgrund (sv) (history)
    // 6: Portföljexempel (impact) (portfolioExamples)
    // 7: Notabla affärer/exits (notableDeals)
    // 8: Hemsida (website)
    // 9: Säte/Kontor (Sverige) (office)
    // 10: E-post (email)
    // 11: Telefon (phone)
    // 12: LinkedIn (linkedin)
    // 13: Läs mer (Impact Loop) (readMoreUrl)
    // 14: Källor (länkar) (sources)
    // 15: Beskrivning (original) (descriptionOriginal)

    const [
      name,
      type,
      impactNiche,
      portfolioCompanies,
      description,
      history,
      portfolioExamples,
      notableDeals,
      website,
      office,
      email,
      phone,
      linkedin,
      readMoreUrl,
      sources,
      descriptionOriginal,
    ] = parts;

    if (name && name.length > 1) {
      parsedRecords.push({
        name: name.trim(),
        type: type?.trim() || null,
        impactNiche: impactNiche?.trim() || null,
        portfolioCompanies: portfolioCompanies?.trim() || null,
        description: description?.trim() || null,
        history: history?.trim() || null,
        portfolioExamples: portfolioExamples?.trim() || null,
        notableDeals: notableDeals?.trim() || null,
        website: website?.trim() || null,
        office: office?.trim() || null,
        email: email?.trim() || null,
        phone: phone?.trim() || null,
        linkedin: linkedin?.trim() || null,
        readMoreUrl: readMoreUrl?.trim() || null,
        sources: sources?.trim() || null,
        descriptionOriginal: descriptionOriginal?.trim() || null,
      });
    }
  }

  return parsedRecords;
}

async function main() {
  console.log("Starting import of updated VC database...\n");

  const csvPath = "/Users/isak/Desktop/ Investerar-databaser/VC-databas_uppdaterad.csv";

  if (!fs.existsSync(csvPath)) {
    console.log("CSV file not found:", csvPath);
    process.exit(1);
  }

  console.log("Reading CSV file...");
  const content = fs.readFileSync(csvPath, "utf-8");
  const vcCompanies = parseCSV(content);

  console.log(`Found ${vcCompanies.length} VC Companies\n`);

  // Clear existing data
  await prisma.vCCompany.deleteMany();
  console.log("Cleared existing VC Companies");

  // Insert new data
  let inserted = 0;
  const seen = new Set();

  for (const vc of vcCompanies) {
    // Skip duplicates
    if (seen.has(vc.name)) {
      console.log(`   Skipped duplicate: ${vc.name}`);
      continue;
    }
    seen.add(vc.name);

    try {
      await prisma.vCCompany.create({ data: vc });
      inserted++;
    } catch (error) {
      console.log(`   Error with: ${vc.name}`, error.message);
    }
  }

  console.log(`Imported ${inserted} VC Companies\n`);

  // Print summary
  const vcCount = await prisma.vCCompany.count();

  console.log("═══════════════════════════════════════");
  console.log("           IMPORT COMPLETE");
  console.log("═══════════════════════════════════════");
  console.log(`   VC Companies: ${vcCount}`);
  console.log("═══════════════════════════════════════\n");

  // Show sample of imported data
  const sample = await prisma.vCCompany.findMany({ take: 3 });
  console.log("Sample entries:");
  sample.forEach((vc) => {
    console.log(`- ${vc.name} (${vc.type || "N/A"})`);
    if (vc.website) console.log(`  Web: ${vc.website}`);
    if (vc.impactNiche) console.log(`  Focus: ${vc.impactNiche.substring(0, 60)}...`);
  });
}

main()
  .catch((e) => {
    console.error("Import failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
