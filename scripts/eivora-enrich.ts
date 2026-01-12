/**
 * Eivora Enrichment Script
 *
 * Hämtar ägardata, styrelse och verkliga huvudmän från Eivora API
 * och sparar till Supabase.
 *
 * Användning:
 *   npx tsx scripts/eivora-enrich.ts [options]
 *
 * Options:
 *   --limit=N       Max antal bolag att bearbeta (default: 10)
 *   --dry-run       Testa utan att spara till databasen
 *   --table=NAME    Tabell att berika (WatchedCompany, FamilyOffice, VCCompany)
 *   --org=NUMBER    Specifikt orgnummer att berika
 *
 * Environment:
 *   NEXT_PUBLIC_SUPABASE_URL    Supabase project URL
 *   SUPABASE_SERVICE_ROLE_KEY   Service role key (for write access)
 *   EIVORA_API_KEY              Eivora API key (optional, has default)
 */

import "dotenv/config";
import { createClient } from "@supabase/supabase-js";

// Config
const EIVORA_API_KEY = process.env.EIVORA_API_KEY || "eivora_3ZXbEcVTDD8ZUHnDrTghqoML";
const EIVORA_BASE_URL = "https://api.eivora.com/v2.0";
const REQUEST_DELAY_MS = 500;

// Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

if (!supabaseUrl) {
  console.error("Missing NEXT_PUBLIC_SUPABASE_URL");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// Parse command line args
const args = process.argv.slice(2);
const getArg = (name: string, defaultValue: string) => {
  const arg = args.find(a => a.startsWith(`--${name}=`));
  return arg ? arg.split("=")[1] : defaultValue;
};
const hasFlag = (name: string) => args.includes(`--${name}`);

const LIMIT = parseInt(getArg("limit", "10"));
const DRY_RUN = hasFlag("dry-run");
const TABLE = getArg("table", "WatchedCompany");
const SPECIFIC_ORG = getArg("org", "");

// Helper functions
function cleanOrgNumber(orgNumber: string): string {
  return orgNumber.replace("-", "");
}

async function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function eivoraRequest(endpoint: string, body: Record<string, any>): Promise<any> {
  const response = await fetch(`${EIVORA_BASE_URL}/${endpoint}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": EIVORA_API_KEY,
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Eivora API error ${response.status}: ${text}`);
  }

  const data = await response.json();
  if (data._status !== "success" && data._status !== "ok") {
    throw new Error(`Eivora error: ${data._status}`);
  }

  return data;
}

interface CompanyResult {
  orgNumber: string;
  name: string;
  ownership?: { owners: number; shareCapital: number | null; error?: string };
  directors?: { count: number; error?: string };
  beneficialOwners?: { count: number; error?: string };
  error?: string;
}

async function enrichCompany(company: { id: string; orgNumber: string; name: string }): Promise<CompanyResult> {
  const orgNbr = cleanOrgNumber(company.orgNumber);
  const result: CompanyResult = { orgNumber: company.orgNumber, name: company.name };

  // 1. Ownership
  try {
    await sleep(REQUEST_DELAY_MS);
    const data = await eivoraRequest("ownership", { org_nbr: orgNbr });

    result.ownership = {
      owners: data.current_owners?.length || 0,
      shareCapital: data.share_capital?.share_capital || null,
    };

    if (!DRY_RUN && data.current_owners?.length) {
      // Delete old owners
      await supabase.from("CompanyOwner").delete().eq("orgNumber", company.orgNumber);

      // Insert new owners
      const owners = data.current_owners.map((o: any) => ({
        orgNumber: company.orgNumber,
        entityType: o.entity_type,
        entityName: o.entity_name,
        entityId: o.entity_id,
        entityOrgNumber: o.entity_type === "company" ? o.identification_number : null,
        nbrShares: o.nbr_shares,
        percentage: o.percentage,
        country: o.country,
        countryCode: o.country_code,
        lastUpdated: new Date().toISOString(),
      }));

      const { error } = await supabase.from("CompanyOwner").insert(owners);
      if (error) console.error(`  Error inserting owners: ${error.message}`);
    }

    if (!DRY_RUN && data.share_capital) {
      const sc = data.share_capital;
      await supabase.from("CompanyShareCapital").upsert({
        orgNumber: company.orgNumber,
        shareCapital: sc.share_capital,
        shareCapitalCurrency: sc.share_capital_currency,
        nbrShares: sc.nbr_shares,
        maxNbrShares: sc.max_nbr_shares,
        minNbrShares: sc.min_nbr_shares,
        lastUpdated: new Date().toISOString(),
      }, { onConflict: "orgNumber" });
    }

    if (!DRY_RUN && data.share_types?.length) {
      await supabase.from("CompanyShareType").delete().eq("orgNumber", company.orgNumber);
      const shareTypes = data.share_types.map((st: any) => ({
        orgNumber: company.orgNumber,
        shareType: st.share_type,
        series: st.series,
        nbrShares: st.nbr_shares,
        votingWeight: st.voting_weight,
        lastUpdated: new Date().toISOString(),
      }));
      await supabase.from("CompanyShareType").insert(shareTypes);
    }
  } catch (e) {
    result.ownership = { owners: 0, shareCapital: null, error: e instanceof Error ? e.message : String(e) };
  }

  // 2. Directors
  try {
    await sleep(REQUEST_DELAY_MS);
    const data = await eivoraRequest("company_directors", { org_nbr: orgNbr });

    result.directors = { count: data.directors?.length || 0 };

    if (!DRY_RUN && data.directors?.length) {
      await supabase.from("CompanyDirector").delete().eq("orgNumber", company.orgNumber);

      const directors = data.directors.map((d: any) => ({
        orgNumber: company.orgNumber,
        name: d.name,
        identificationNumber: d.identification_number,
        function: d.function,
        appointmentDate: d.appointment_date,
        lastUpdated: new Date().toISOString(),
      }));

      const { error } = await supabase.from("CompanyDirector").insert(directors);
      if (error) console.error(`  Error inserting directors: ${error.message}`);
    }
  } catch (e) {
    result.directors = { count: 0, error: e instanceof Error ? e.message : String(e) };
  }

  // 3. Beneficial Owners
  try {
    await sleep(REQUEST_DELAY_MS);
    const data = await eivoraRequest("beneficial_owners", { org_nbr: orgNbr });

    result.beneficialOwners = { count: data.beneficial_owners?.length || 0 };

    if (!DRY_RUN && data.beneficial_owners?.length) {
      await supabase.from("BeneficialOwner").delete().eq("orgNumber", company.orgNumber);

      const bos = data.beneficial_owners.map((bo: any) => ({
        orgNumber: company.orgNumber,
        entityType: bo.entity_type,
        entityName: bo.entity_name,
        entityId: bo.entity_id,
        identificationNumber: bo.identification_number,
        percentageVotesMin: bo.percentage_votes_min,
        percentageVotesMax: bo.percentage_votes_max,
        ownershipCode: bo.ownership_code,
        controlCodes: bo.control_codes,
        registeredAt: bo.updated_at,
        lastUpdated: new Date().toISOString(),
      }));

      const { error } = await supabase.from("BeneficialOwner").insert(bos);
      if (error) console.error(`  Error inserting beneficial owners: ${error.message}`);
    }
  } catch (e) {
    result.beneficialOwners = { count: 0, error: e instanceof Error ? e.message : String(e) };
  }

  // Update timestamp
  if (!DRY_RUN) {
    await supabase
      .from(TABLE)
      .update({
        eivoraLastFetched: new Date().toISOString(),
        eivoraError: null
      })
      .eq("id", company.id);
  }

  return result;
}

async function main() {
  console.log("=== Eivora Enrichment Script ===");
  console.log(`Table: ${TABLE}`);
  console.log(`Limit: ${LIMIT}`);
  console.log(`Dry run: ${DRY_RUN}`);
  if (SPECIFIC_ORG) console.log(`Specific org: ${SPECIFIC_ORG}`);
  console.log("");

  // Fetch companies
  let query = supabase
    .from(TABLE)
    .select("id, orgNumber, name")
    .not("orgNumber", "is", null);

  if (SPECIFIC_ORG) {
    query = query.eq("orgNumber", SPECIFIC_ORG);
  } else {
    query = query.or("eivoraLastFetched.is.null,eivoraLastFetched.lt." + new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString());
  }

  query = query.limit(LIMIT);

  const { data: companies, error } = await query;

  if (error) {
    console.error("Error fetching companies:", error.message);
    process.exit(1);
  }

  if (!companies?.length) {
    console.log("No companies to process.");
    return;
  }

  console.log(`Found ${companies.length} companies to process.\n`);

  let processed = 0;
  let errors = 0;

  for (const company of companies) {
    console.log(`[${processed + 1}/${companies.length}] ${company.name} (${company.orgNumber})`);

    try {
      const result = await enrichCompany(company);

      const ownerInfo = result.ownership?.error
        ? `Owners: ERROR (${result.ownership.error.substring(0, 50)})`
        : `Owners: ${result.ownership?.owners || 0}`;

      const directorInfo = result.directors?.error
        ? `Directors: ERROR`
        : `Directors: ${result.directors?.count || 0}`;

      const boInfo = result.beneficialOwners?.error
        ? `BO: ERROR`
        : `BO: ${result.beneficialOwners?.count || 0}`;

      console.log(`  ${ownerInfo}, ${directorInfo}, ${boInfo}`);
      processed++;
    } catch (e) {
      console.error(`  ERROR: ${e instanceof Error ? e.message : String(e)}`);
      errors++;
    }
  }

  console.log("\n=== Summary ===");
  console.log(`Processed: ${processed}`);
  console.log(`Errors: ${errors}`);
  if (DRY_RUN) console.log("(Dry run - no data saved)");
}

main().catch(console.error);
