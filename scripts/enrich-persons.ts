#!/usr/bin/env npx tsx
/**
 * Enrich person data from WatchedCompany
 *
 * Usage:
 *   npx tsx scripts/enrich-persons.ts [options]
 *
 * Options:
 *   --limit N       Process at most N companies (default: 10)
 *   --delay N       Delay N ms between API calls (default: 1000)
 *   --all           Process all companies, not just missing
 *   --dry-run       Don't write to database
 *   --company ORG   Enrich single company by org number
 */

import { enrichCEOsFromWatchedCompanies, enrichCompanyPeople } from "../src/lib/person/enrich";

async function main() {
  const args = process.argv.slice(2);

  // Parse arguments
  const limitIdx = args.indexOf("--limit");
  const limit = limitIdx >= 0 ? parseInt(args[limitIdx + 1]) : 10;

  const delayIdx = args.indexOf("--delay");
  const delayMs = delayIdx >= 0 ? parseInt(args[delayIdx + 1]) : 1000;

  const onlyMissing = !args.includes("--all");
  const dryRun = args.includes("--dry-run");

  const companyIdx = args.indexOf("--company");
  const singleCompany = companyIdx >= 0 ? args[companyIdx + 1] : null;

  console.log("=".repeat(60));
  console.log("PERSON ENRICHMENT");
  console.log("=".repeat(60));

  if (singleCompany) {
    console.log(`\nEnriching single company: ${singleCompany}`);
    const result = await enrichCompanyPeople(singleCompany);
    console.log("\nResult:", result);
    return;
  }

  console.log(`\nOptions:`);
  console.log(`  Limit: ${limit} companies`);
  console.log(`  Delay: ${delayMs}ms between calls`);
  console.log(`  Only missing: ${onlyMissing}`);
  console.log(`  Dry run: ${dryRun}`);
  console.log("");

  const result = await enrichCEOsFromWatchedCompanies({
    limit,
    delayMs,
    onlyMissing,
    dryRun,
  });

  console.log("\n" + "=".repeat(60));
  console.log("RESULTS");
  console.log("=".repeat(60));
  console.log(`Processed: ${result.processed}`);
  console.log(`Created:   ${result.created}`);
  console.log(`Updated:   ${result.updated}`);
  console.log(`Skipped:   ${result.skipped}`);
  console.log(`Errors:    ${result.errors.length}`);

  if (result.errors.length > 0) {
    console.log("\nErrors:");
    for (const error of result.errors.slice(0, 10)) {
      console.log(`  - ${error}`);
    }
    if (result.errors.length > 10) {
      console.log(`  ... and ${result.errors.length - 10} more`);
    }
  }
}

main()
  .then(() => {
    console.log("\nDone!");
    process.exit(0);
  })
  .catch((error) => {
    console.error("Fatal error:", error);
    process.exit(1);
  });
