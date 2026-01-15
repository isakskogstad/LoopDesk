/**
 * Parse Annual Reports from local filesystem
 * Extracts comprehensive financial data from iXBRL (xhtml) files
 */

import { createClient } from "@supabase/supabase-js";
import * as fs from "fs";
import * as path from "path";

// Config
const SUPABASE_URL = "https://rpjmsncjnhtnjnycabys.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJwam1zbmNqbmh0bmpueWNhYnlzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njc5MTY4NjAsImV4cCI6MjA4MzQ5Mjg2MH0.-bZJ76PiWuenBG4OyY1m4dRy6alJr3Fz3cqP3zQpB-0";
const LOCAL_DIR = "/Users/isak/Desktop/Resurser/arsredovisningar/downloads";

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// All iXBRL tags to extract
const IXBRL_TAGS = {
  // Income Statement (Resultaträkning)
  revenue: "Nettoomsattning",
  operatingResult: "Rorelseresultat",
  resultAfterFinancial: "ResultatEfterFinansiellaPoster",
  netIncome: "AretsResultat",
  personnelCosts: "Personalkostnader",
  otherExternalCosts: "OvrigaExternaKostnader",
  rawMaterialCosts: "RavarorFornodenheterKostnader",
  depreciation: "AvskrivningarNedskrivningarMateriellaImmateriellaAnlaggningstillgangar",
  interestExpenses: "RantekostnaderLiknandeResultatposter",
  interestIncome: "OvrigaRanteintakterLiknandeResultatposter",

  // Balance Sheet (Balansräkning)
  totalAssets: "Tillgangar",
  fixedAssets: "Anlaggningstillgangar",
  currentAssets: "Omsattningstillgangar",
  equity: "EgetKapital",
  restrictedEquity: "BundetEgetKapital",
  unrestrictedEquity: "FrittEgetKapital",
  retainedEarnings: "BalanseratResultat",
  cashAndBank: "KassaBank",
  cashAndBankAlt: "KassaBankExklRedovisningsmedel",
  inventory: "VarulagerMm",
  accountsReceivable: "Kundfordringar",
  otherReceivables: "OvrigaFordringarKortfristiga",
  longTermLiabilities: "LangfristigaSkulder",
  currentLiabilities: "KortfristigaSkulder",
  accountsPayable: "Leverantorsskulder",
  taxLiabilities: "Skatteskulder",
  accruedExpenses: "UpplupnaKostnaderForutbetaldaIntakter",
  untaxedReserves: "ObeskattadeReserver",

  // Share Capital
  shareCapital: "Aktiekapital",
  numberOfShares: "AntalAktier",
  sharePremium: "Overkursfond",

  // Key Metrics
  solidityRatio: "Soliditet",
  avgEmployees: "MedelantaletAnstallda",
};

interface ParsedData {
  orgNumber: string;
  fiscalYear: number;
  // Income Statement
  revenue: number | null;
  operatingResult: number | null;
  resultAfterFinancial: number | null;
  netIncome: number | null;
  personnelCosts: number | null;
  otherExternalCosts: number | null;
  rawMaterialCosts: number | null;
  depreciation: number | null;
  interestExpenses: number | null;
  interestIncome: number | null;
  // Balance Sheet
  totalAssets: number | null;
  fixedAssets: number | null;
  currentAssets: number | null;
  equity: number | null;
  restrictedEquity: number | null;
  unrestrictedEquity: number | null;
  retainedEarnings: number | null;
  cashAndBank: number | null;
  inventory: number | null;
  accountsReceivable: number | null;
  otherReceivables: number | null;
  longTermLiabilities: number | null;
  currentLiabilities: number | null;
  accountsPayable: number | null;
  taxLiabilities: number | null;
  accruedExpenses: number | null;
  untaxedReserves: number | null;
  // Share Capital
  shareCapital: number | null;
  numberOfShares: number | null;
  sharePremium: number | null;
  // Key Metrics
  solidityRatio: number | null;
  avgEmployees: number | null;
  // Metadata
  sourceFile: string;
}

/**
 * Extract iXBRL value from content
 * Handles multiple namespaces: se-gen-base, se-cd-base
 */
function extractIxbrlValue(content: string, tagName: string): number | null {
  const patterns = [
    new RegExp(`<ix:nonFraction[^>]*name="se-gen-base:${tagName}"[^>]*>([^<]+)</ix:nonFraction>`, "gi"),
    new RegExp(`<ix:nonFraction[^>]*name="se-cd-base:${tagName}"[^>]*>([^<]+)</ix:nonFraction>`, "gi"),
  ];

  for (const pattern of patterns) {
    const matches = [...content.matchAll(pattern)];
    if (matches.length > 0) {
      // Take the first match (usually current year)
      const rawValue = matches[0][1].trim();
      // Handle negative values in parentheses: (123) -> -123
      let cleanValue = rawValue;
      if (cleanValue.startsWith("(") && cleanValue.endsWith(")")) {
        cleanValue = "-" + cleanValue.slice(1, -1);
      }
      // Parse Swedish number format: "50 000" or "1 234 567" or "1,5"
      cleanValue = cleanValue.replace(/\s/g, "").replace(",", ".");
      // Remove any trailing minus signs
      cleanValue = cleanValue.replace(/−$/, "").replace(/-$/, "");
      // Handle leading minus
      cleanValue = cleanValue.replace(/^−/, "-");

      const parsed = parseFloat(cleanValue);
      if (!isNaN(parsed)) {
        return parsed;
      }
    }
  }
  return null;
}

/**
 * Parse a single xhtml file
 */
function parseXhtml(content: string, fileName: string): ParsedData | null {
  // Extract org number and year from filename: "559249-1541.2021.xhtml"
  const baseName = path.basename(fileName);
  const match = baseName.match(/(\d{6}-\d{4})\.(\d{4})\.xhtml/);
  if (!match) {
    return null;
  }

  const orgNumber = match[1];
  const fiscalYear = parseInt(match[2]);

  // Extract all values
  const cashAndBank = extractIxbrlValue(content, IXBRL_TAGS.cashAndBank)
    ?? extractIxbrlValue(content, IXBRL_TAGS.cashAndBankAlt);

  return {
    orgNumber,
    fiscalYear,
    // Income Statement
    revenue: extractIxbrlValue(content, IXBRL_TAGS.revenue),
    operatingResult: extractIxbrlValue(content, IXBRL_TAGS.operatingResult),
    resultAfterFinancial: extractIxbrlValue(content, IXBRL_TAGS.resultAfterFinancial),
    netIncome: extractIxbrlValue(content, IXBRL_TAGS.netIncome),
    personnelCosts: extractIxbrlValue(content, IXBRL_TAGS.personnelCosts),
    otherExternalCosts: extractIxbrlValue(content, IXBRL_TAGS.otherExternalCosts),
    rawMaterialCosts: extractIxbrlValue(content, IXBRL_TAGS.rawMaterialCosts),
    depreciation: extractIxbrlValue(content, IXBRL_TAGS.depreciation),
    interestExpenses: extractIxbrlValue(content, IXBRL_TAGS.interestExpenses),
    interestIncome: extractIxbrlValue(content, IXBRL_TAGS.interestIncome),
    // Balance Sheet
    totalAssets: extractIxbrlValue(content, IXBRL_TAGS.totalAssets),
    fixedAssets: extractIxbrlValue(content, IXBRL_TAGS.fixedAssets),
    currentAssets: extractIxbrlValue(content, IXBRL_TAGS.currentAssets),
    equity: extractIxbrlValue(content, IXBRL_TAGS.equity),
    restrictedEquity: extractIxbrlValue(content, IXBRL_TAGS.restrictedEquity),
    unrestrictedEquity: extractIxbrlValue(content, IXBRL_TAGS.unrestrictedEquity),
    retainedEarnings: extractIxbrlValue(content, IXBRL_TAGS.retainedEarnings),
    cashAndBank,
    inventory: extractIxbrlValue(content, IXBRL_TAGS.inventory),
    accountsReceivable: extractIxbrlValue(content, IXBRL_TAGS.accountsReceivable),
    otherReceivables: extractIxbrlValue(content, IXBRL_TAGS.otherReceivables),
    longTermLiabilities: extractIxbrlValue(content, IXBRL_TAGS.longTermLiabilities),
    currentLiabilities: extractIxbrlValue(content, IXBRL_TAGS.currentLiabilities),
    accountsPayable: extractIxbrlValue(content, IXBRL_TAGS.accountsPayable),
    taxLiabilities: extractIxbrlValue(content, IXBRL_TAGS.taxLiabilities),
    accruedExpenses: extractIxbrlValue(content, IXBRL_TAGS.accruedExpenses),
    untaxedReserves: extractIxbrlValue(content, IXBRL_TAGS.untaxedReserves),
    // Share Capital
    shareCapital: extractIxbrlValue(content, IXBRL_TAGS.shareCapital),
    numberOfShares: extractIxbrlValue(content, IXBRL_TAGS.numberOfShares),
    sharePremium: extractIxbrlValue(content, IXBRL_TAGS.sharePremium),
    // Key Metrics
    solidityRatio: extractIxbrlValue(content, IXBRL_TAGS.solidityRatio),
    avgEmployees: extractIxbrlValue(content, IXBRL_TAGS.avgEmployees),
    // Metadata
    sourceFile: fileName,
  };
}

/**
 * Find all xhtml files locally
 */
function findXhtmlFiles(dir: string): string[] {
  const files: string[] = [];

  const folders = fs.readdirSync(dir);
  for (const folder of folders) {
    const folderPath = path.join(dir, folder);
    if (fs.statSync(folderPath).isDirectory()) {
      const folderFiles = fs.readdirSync(folderPath);
      for (const file of folderFiles) {
        if (file.endsWith(".xhtml")) {
          files.push(path.join(folderPath, file));
        }
      }
    }
  }

  return files;
}

/**
 * Parse a local file
 */
function parseLocalFile(filePath: string): ParsedData | null {
  try {
    const content = fs.readFileSync(filePath, "utf-8");
    return parseXhtml(content, filePath);
  } catch (error) {
    console.error(`Error reading ${filePath}:`, error);
    return null;
  }
}

/**
 * Count non-null fields in parsed data
 */
function countDataFields(data: ParsedData): number {
  const fields = [
    data.revenue, data.operatingResult, data.resultAfterFinancial, data.netIncome,
    data.personnelCosts, data.otherExternalCosts, data.totalAssets, data.equity,
    data.cashAndBank, data.currentLiabilities, data.shareCapital, data.solidityRatio,
    data.avgEmployees,
  ];
  return fields.filter(f => f !== null).length;
}

/**
 * Main: Run parser
 */
async function main() {
  const args = process.argv.slice(2);
  const limit = args.includes("--limit")
    ? parseInt(args[args.indexOf("--limit") + 1])
    : 9999;
  const saveToDb = args.includes("--save");

  console.log("=== Annual Report Parser (Full Financial Data) ===");
  console.log(`Mode: ${saveToDb ? "SAVE TO DB" : "TEST"}`);
  console.log(`Limit: ${limit} files`);
  console.log(`Source: ${LOCAL_DIR}\n`);

  // Find files
  console.log("Finding xhtml files...");
  const allFiles = findXhtmlFiles(LOCAL_DIR);
  console.log(`Found ${allFiles.length} xhtml files\n`);

  // Parse files
  const filesToParse = allFiles.slice(0, limit);
  const results: ParsedData[] = [];
  let withData = 0;
  let noData = 0;

  for (let i = 0; i < filesToParse.length; i++) {
    const file = filesToParse[i];
    if (i % 100 === 0 || i === filesToParse.length - 1) {
      process.stdout.write(`\rParsing ${i + 1}/${filesToParse.length}...`);
    }

    const parsed = parseLocalFile(file);
    if (parsed && countDataFields(parsed) >= 3) {
      results.push(parsed);
      withData++;
    } else {
      noData++;
    }
  }

  console.log("\n\n=== Parse Results ===");
  console.log(`With financial data: ${withData}`);
  console.log(`Insufficient data: ${noData}`);

  // Show sample results
  console.log("\n=== Sample Data (first 10) ===");
  const sample = results.slice(0, 10);
  console.table(sample.map(r => ({
    org: r.orgNumber,
    year: r.fiscalYear,
    revenue: r.revenue,
    netIncome: r.netIncome,
    assets: r.totalAssets,
    equity: r.equity,
    cash: r.cashAndBank,
    employees: r.avgEmployees,
  })));

  // Statistics
  const stats = {
    revenue: results.filter(r => r.revenue !== null).length,
    operatingResult: results.filter(r => r.operatingResult !== null).length,
    netIncome: results.filter(r => r.netIncome !== null).length,
    totalAssets: results.filter(r => r.totalAssets !== null).length,
    equity: results.filter(r => r.equity !== null).length,
    cashAndBank: results.filter(r => r.cashAndBank !== null).length,
    currentLiabilities: results.filter(r => r.currentLiabilities !== null).length,
    shareCapital: results.filter(r => r.shareCapital !== null).length,
    solidityRatio: results.filter(r => r.solidityRatio !== null).length,
    avgEmployees: results.filter(r => r.avgEmployees !== null).length,
  };

  console.log("\n=== Field Coverage ===");
  console.table(stats);

  // Save to database
  if (saveToDb && results.length > 0) {
    console.log("\n=== Saving to Database ===");

    let inserted = 0;
    let updated = 0;
    let errors = 0;

    // Process in batches
    const batchSize = 100;
    for (let i = 0; i < results.length; i += batchSize) {
      const batch = results.slice(i, i + batchSize);
      process.stdout.write(`\rSaving ${Math.min(i + batchSize, results.length)}/${results.length}...`);

      for (const data of batch) {
        // Upsert to CompanyFinancials
        const { error } = await supabase
          .from("CompanyFinancials")
          .upsert({
            orgNumber: data.orgNumber,
            fiscalYear: data.fiscalYear,
            // Income Statement
            revenue: data.revenue,
            operatingResult: data.operatingResult,
            resultAfterFinancial: data.resultAfterFinancial,
            netIncome: data.netIncome,
            personnelCosts: data.personnelCosts,
            otherExternalCosts: data.otherExternalCosts,
            rawMaterialCosts: data.rawMaterialCosts,
            depreciation: data.depreciation,
            interestExpenses: data.interestExpenses,
            interestIncome: data.interestIncome,
            // Balance Sheet
            totalAssets: data.totalAssets,
            fixedAssets: data.fixedAssets,
            currentAssets: data.currentAssets,
            equity: data.equity,
            restrictedEquity: data.restrictedEquity,
            unrestrictedEquity: data.unrestrictedEquity,
            retainedEarnings: data.retainedEarnings,
            cashAndBank: data.cashAndBank,
            inventory: data.inventory,
            accountsReceivable: data.accountsReceivable,
            otherReceivables: data.otherReceivables,
            longTermLiabilities: data.longTermLiabilities,
            currentLiabilities: data.currentLiabilities,
            accountsPayable: data.accountsPayable,
            taxLiabilities: data.taxLiabilities,
            accruedExpenses: data.accruedExpenses,
            untaxedReserves: data.untaxedReserves,
            // Share Capital
            shareCapital: data.shareCapital,
            numberOfShares: data.numberOfShares,
            sharePremium: data.sharePremium,
            // Key Metrics
            solidityRatio: data.solidityRatio,
            avgEmployees: data.avgEmployees,
            // Metadata
            sourceFile: data.sourceFile,
            source: "annual-report",
            updatedAt: new Date().toISOString(),
          }, {
            onConflict: "orgNumber,fiscalYear",
          });

        if (error) {
          errors++;
          if (errors <= 5) {
            console.error(`\nError: ${error.message}`);
          }
        } else {
          inserted++;
        }
      }
    }

    console.log(`\n\nInserted/Updated: ${inserted}`);
    console.log(`Errors: ${errors}`);

    // Also update CompanyShareCapital for backwards compatibility
    console.log("\n=== Updating CompanyShareCapital ===");

    // Get unique companies with share capital, taking latest year
    const byOrg = new Map<string, ParsedData>();
    for (const r of results) {
      if (r.shareCapital !== null) {
        const existing = byOrg.get(r.orgNumber);
        if (!existing || r.fiscalYear > existing.fiscalYear) {
          byOrg.set(r.orgNumber, r);
        }
      }
    }

    let scUpdated = 0;
    let scInserted = 0;
    for (const [orgNumber, data] of byOrg) {
      const { data: existing } = await supabase
        .from("CompanyShareCapital")
        .select("id")
        .eq("orgNumber", orgNumber)
        .single();

      if (existing) {
        await supabase
          .from("CompanyShareCapital")
          .update({
            shareCapital: data.shareCapital,
            nbrShares: data.numberOfShares,
            shareCapitalCurrency: "SEK",
            source: "annual-report",
            lastUpdated: new Date().toISOString(),
          })
          .eq("id", existing.id);
        scUpdated++;
      } else {
        await supabase
          .from("CompanyShareCapital")
          .insert({
            id: crypto.randomUUID(),
            orgNumber,
            shareCapital: data.shareCapital,
            nbrShares: data.numberOfShares,
            shareCapitalCurrency: "SEK",
            source: "annual-report",
            lastUpdated: new Date().toISOString(),
          });
        scInserted++;
      }
    }

    console.log(`CompanyShareCapital - Inserted: ${scInserted}, Updated: ${scUpdated}`);
  }

  // Summary
  console.log("\n=== Summary ===");
  console.log(`Total xhtml files: ${allFiles.length}`);
  console.log(`Parsed: ${filesToParse.length}`);
  console.log(`With financial data: ${results.length}`);
  console.log(`Unique org numbers: ${new Set(results.map(r => r.orgNumber)).size}`);

  if (!saveToDb && results.length > 0) {
    console.log("\nRun with --save to save to database");
  }
}

main().catch(console.error);
