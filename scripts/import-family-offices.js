/* eslint-disable @typescript-eslint/no-require-imports */
/**
 * Import Family Offices from JavaScript data file
 * Run with: node scripts/import-family-offices.js
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

// Parse the JavaScript data file
function parseDataFile(filePath) {
  const content = fs.readFileSync(filePath, "utf-8");

  // Find the INITIAL_DATA array
  const startMatch = content.match(/const INITIAL_DATA = \[/);
  if (!startMatch) {
    throw new Error("Could not find INITIAL_DATA array");
  }

  const startIndex = content.indexOf("const INITIAL_DATA = [") + "const INITIAL_DATA = [".length;

  // Find the closing bracket
  let bracketCount = 1;
  let endIndex = startIndex;

  for (let i = startIndex; i < content.length && bracketCount > 0; i++) {
    if (content[i] === "[") bracketCount++;
    if (content[i] === "]") bracketCount--;
    endIndex = i;
  }

  const arrayContent = content.substring(startIndex, endIndex);

  // Parse each object manually
  const objects = [];
  let currentObj = "";
  let braceCount = 0;
  let inString = false;
  let stringChar = "";

  for (let i = 0; i < arrayContent.length; i++) {
    const char = arrayContent[i];
    const prevChar = i > 0 ? arrayContent[i - 1] : "";

    // Track string state
    if ((char === '"' || char === "'") && prevChar !== "\\") {
      if (!inString) {
        inString = true;
        stringChar = char;
      } else if (char === stringChar) {
        inString = false;
      }
    }

    if (!inString) {
      if (char === "{") {
        braceCount++;
        if (braceCount === 1) {
          currentObj = "";
        }
      }
      if (char === "}") {
        braceCount--;
        if (braceCount === 0) {
          currentObj += char;
          objects.push(currentObj);
          currentObj = "";
          continue;
        }
      }
    }

    if (braceCount > 0) {
      currentObj += char;
    }
  }

  // Convert JavaScript objects to JSON-parseable format
  const records = [];

  for (const objStr of objects) {
    try {
      // Clean up JavaScript object syntax to JSON
      let jsonStr = objStr
        // Remove comments
        .replace(/\/\/[^\n]*/g, "")
        // Handle trailing commas before closing braces/brackets
        .replace(/,(\s*[}\]])/g, "$1")
        // Quote unquoted keys
        .replace(/(\s*)(\w+)(\s*):/g, '$1"$2"$3:')
        // Fix double-quoted keys
        .replace(/""/g, '"')
        // Handle single quotes in values
        .replace(/'/g, '"')
        // Handle null values
        .replace(/:\s*null\b/g, ': null');

      // Try to parse
      const obj = JSON.parse(jsonStr);
      records.push(obj);
    } catch (e) {
      // If parsing fails, try to extract fields manually
      const record = extractFields(objStr);
      if (record && record.name) {
        records.push(record);
      }
    }
  }

  return records;
}

// Manual field extraction as fallback
function extractFields(objStr) {
  const extract = (key) => {
    // Match key: "value" or key: 'value'
    const match = objStr.match(new RegExp(`${key}:\\s*["']([^"']*?)["']`));
    if (match) return match[1];

    // Match key: number
    const numMatch = objStr.match(new RegExp(`${key}:\\s*(\\d+)`));
    if (numMatch) return parseInt(numMatch[1]);

    return null;
  };

  const extractArray = (key) => {
    const match = objStr.match(new RegExp(`${key}:\\s*\\[([^\\]]*?)\\]`));
    if (match) {
      return match[1]
        .split(",")
        .map(s => s.trim().replace(/^["']|["']$/g, ""))
        .filter(s => s.length > 0);
    }
    return [];
  };

  return {
    name: extract("name"),
    family: extract("family"),
    focus: extractArray("focus"),
    investments: extractArray("investments"),
    region: extract("region"),
    description: extract("description"),
    familyStory: extract("familyStory"),
    founded: extract("founded"),
    keyPeople: extractArray("keyPeople"),
    coInvestors: extractArray("coInvestors"),
    website: extract("website"),
    linkedin: extract("linkedin"),
    email: extract("email"),
    phone: extract("phone"),
  };
}

async function main() {
  console.log("Starting import of Family Offices...\n");

  const filePath = "/Users/isak/Desktop/Family offices data.md";

  if (!fs.existsSync(filePath)) {
    console.log("Data file not found:", filePath);
    process.exit(1);
  }

  console.log("Reading and parsing data file...");
  const familyOffices = parseDataFile(filePath);

  console.log(`Found ${familyOffices.length} Family Offices\n`);

  // Clear existing data
  await prisma.familyOffice.deleteMany();
  console.log("Cleared existing Family Offices");

  // Insert new data
  let inserted = 0;
  const seen = new Set();

  for (const fo of familyOffices) {
    if (!fo.name) continue;

    // Skip duplicates
    if (seen.has(fo.name)) {
      console.log(`   Skipped duplicate: ${fo.name}`);
      continue;
    }
    seen.add(fo.name);

    try {
      // Convert arrays to comma-separated strings
      const impactNiche = Array.isArray(fo.focus) ? fo.focus.join(", ") : fo.focus || null;
      const portfolioCompanies = Array.isArray(fo.investments) ? fo.investments.join(", ") : fo.investments || null;
      const keyPeople = Array.isArray(fo.keyPeople) ? fo.keyPeople.join(", ") : fo.keyPeople || null;
      const coInvestors = Array.isArray(fo.coInvestors) ? fo.coInvestors.join(", ") : fo.coInvestors || null;

      await prisma.familyOffice.create({
        data: {
          name: fo.name.trim(),
          family: fo.family?.trim() || null,
          impactNiche,
          portfolioCompanies,
          description: fo.description?.trim() || null,
          familyStory: fo.familyStory?.trim() || null,
          founded: typeof fo.founded === "number" ? fo.founded : null,
          keyPeople,
          coInvestors,
          region: fo.region?.trim() || null,
          website: fo.website?.trim() || null,
          linkedin: fo.linkedin && fo.linkedin !== "#" ? fo.linkedin.trim() : null,
          email: fo.email?.trim() || null,
          phone: fo.phone?.trim() || null,
        },
      });
      inserted++;
    } catch (error) {
      console.log(`   Error with: ${fo.name}`, error.message);
    }
  }

  console.log(`\nImported ${inserted} Family Offices\n`);

  // Print summary
  const foCount = await prisma.familyOffice.count();

  console.log("═══════════════════════════════════════");
  console.log("           IMPORT COMPLETE");
  console.log("═══════════════════════════════════════");
  console.log(`   Family Offices: ${foCount}`);
  console.log("═══════════════════════════════════════\n");

  // Show sample of imported data
  const sample = await prisma.familyOffice.findMany({ take: 3 });
  console.log("Sample entries:");
  sample.forEach((fo) => {
    console.log(`- ${fo.name} (${fo.family || "N/A"})`);
    if (fo.region) console.log(`  Region: ${fo.region}`);
    if (fo.impactNiche) console.log(`  Focus: ${fo.impactNiche.substring(0, 60)}...`);
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
