/* eslint-disable @typescript-eslint/no-require-imports */
/**
 * Import Family Offices and VC Companies from CSV files
 * Run with: node scripts/import-investor-databases.js
 */

require("dotenv").config({ path: ".env.local" });
const { PrismaClient } = require("@prisma/client");
const { PrismaNeon } = require("@prisma/adapter-neon");
const fs = require("fs");
const path = require("path");

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error("DATABASE_URL environment variable is not set");
}

const adapter = new PrismaNeon({ connectionString });
const prisma = new PrismaClient({ adapter });

// Parse semicolon-separated CSV with multiline support
function parseCSV(content, hasFamily = false) {
  const lines = [];
  let currentLine = "";
  let inQuotes = false;

  for (const char of content) {
    if (char === '"') {
      inQuotes = !inQuotes;
      currentLine += char;
    } else if (char === "\n" && !inQuotes) {
      if (currentLine.trim()) {
        lines.push(currentLine);
      }
      currentLine = "";
    } else {
      currentLine += char;
    }
  }
  if (currentLine.trim()) {
    lines.push(currentLine);
  }

  // Skip header lines
  const dataLines = lines.filter(
    (line) =>
      !line.startsWith("Tabell 1") &&
      !line.startsWith("VC-bolag;Impact-nisch") &&
      !line.startsWith("Family Office;Familj")
  );

  const records = [];

  for (const line of dataLines) {
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

    if (hasFamily) {
      // Family Office: name, family, niche, portfolio, description
      const [name, family, impactNiche, portfolioCompanies, description] =
        parts;
      if (name && name.length > 1) {
        records.push({
          name: name.trim(),
          family: family?.trim() || null,
          impactNiche: impactNiche?.trim() || null,
          portfolioCompanies: portfolioCompanies?.trim() || null,
          description: description?.trim() || null,
        });
      }
    } else {
      // VC Company: name, niche, portfolio, description, readMore
      const [name, impactNiche, portfolioCompanies, description, readMoreUrl] =
        parts;
      if (name && name.length > 1) {
        records.push({
          name: name.trim(),
          impactNiche: impactNiche?.trim() || null,
          portfolioCompanies: portfolioCompanies?.trim() || null,
          description: description?.trim() || null,
          readMoreUrl: readMoreUrl?.trim() || null,
        });
      }
    }
  }

  return records;
}

async function main() {
  console.log("Starting import of investor databases...\n");

  const basePath = "/Users/isak/Desktop/Databaser för investerare";

  // Import Family Offices
  const familyOfficesPath = path.join(basePath, "Family Offices-Tabell 1.csv");
  if (fs.existsSync(familyOfficesPath)) {
    console.log("📁 Reading Family Offices CSV...");
    const content = fs.readFileSync(familyOfficesPath, "utf-8");
    const familyOffices = parseCSV(content, true);

    console.log(`   Found ${familyOffices.length} Family Offices`);

    // Clear existing data
    await prisma.familyOffice.deleteMany();
    console.log("   Cleared existing Family Offices");

    // Insert new data
    let inserted = 0;
    for (const fo of familyOffices) {
      try {
        await prisma.familyOffice.create({ data: fo });
        inserted++;
      } catch (_error) {
        console.log(`   ⚠️  Skipped duplicate: ${fo.name}`);
      }
    }
    console.log(`   ✅ Imported ${inserted} Family Offices\n`);
  } else {
    console.log("⚠️  Family Offices file not found\n");
  }

  // Import VC Companies
  const vcPath = path.join(basePath, "VC-bolag-Tabell 1.csv");
  if (fs.existsSync(vcPath)) {
    console.log("📁 Reading VC Companies CSV...");
    const content = fs.readFileSync(vcPath, "utf-8");
    const vcCompanies = parseCSV(content, false);

    console.log(`   Found ${vcCompanies.length} VC Companies`);

    // Clear existing data
    await prisma.vCCompany.deleteMany();
    console.log("   Cleared existing VC Companies");

    // Insert new data
    let inserted = 0;
    for (const vc of vcCompanies) {
      try {
        await prisma.vCCompany.create({ data: vc });
        inserted++;
      } catch (_error) {
        console.log(`   ⚠️  Skipped duplicate: ${vc.name}`);
      }
    }
    console.log(`   ✅ Imported ${inserted} VC Companies\n`);
  } else {
    console.log("⚠️  VC Companies file not found\n");
  }

  // Print summary
  const foCount = await prisma.familyOffice.count();
  const vcCount = await prisma.vCCompany.count();

  console.log("═══════════════════════════════════════");
  console.log("           IMPORT COMPLETE");
  console.log("═══════════════════════════════════════");
  console.log(`   Family Offices: ${foCount}`);
  console.log(`   VC Companies:   ${vcCount}`);
  console.log("═══════════════════════════════════════\n");
}

main()
  .catch((e) => {
    console.error("Import failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
