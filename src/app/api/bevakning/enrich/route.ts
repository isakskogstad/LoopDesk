import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

const BASE_URL = "https://www.allabolag.se";

interface AllabolagCompany {
  name: string;
  legalName: string;
  orgnr: string;
  companyType: { code: string; name: string };
  status: { status: string; statusCode: string };
  registrationDate?: string;
  foundationYear?: string;
  revenue?: string;
  profit?: string;
  employees?: string;
  numberOfEmployees?: string;
  shareCapital?: number;
  postalAddress?: { addressLine?: string; zipCode?: string; postPlace?: string };
  location?: { county?: string; municipality?: string };
  industries?: { code: string; name: string }[];
  roles?: {
    manager?: { name: string };
    chairman?: { name: string };
  };
  shareholders?: { name: string; ownership?: number }[];
  corporateStructure?: {
    parentCompanyName?: string;
    numberOfSubsidiaries?: number;
  };
  phone?: string;
  email?: string;
  homePage?: string;
  registeredForVat?: boolean;
  registeredForPayrollTax?: boolean;
  paymentRemarks?: boolean;
  companyAccounts?: {
    year: number;
    accounts: { code: string; amount: string | null }[];
  }[];
}

async function fetchFromAllabolag(orgNr: string): Promise<AllabolagCompany | null> {
  const cleanOrgNr = orgNr.replace(/\D/g, "");

  try {
    const response = await fetch(`${BASE_URL}/${cleanOrgNr}`, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36",
        Accept: "text/html,application/xhtml+xml",
      },
      next: { revalidate: 3600 },
    });

    if (!response.ok) {
      if (response.status === 404) return null;
      throw new Error(`Allabolag returned ${response.status}`);
    }

    const html = await response.text();
    const match = html.match(/<script id="__NEXT_DATA__"[^>]*>([\s\S]*?)<\/script>/);

    if (!match) {
      throw new Error("Could not find __NEXT_DATA__ in response");
    }

    const rawData = JSON.parse(match[1]);
    return rawData.props.pageProps.company;
  } catch (error) {
    console.error("Error fetching from Allabolag:", error);
    throw error;
  }
}

function parseAmount(value: string | null | undefined): number | null {
  if (!value || value === "-" || value === "") return null;
  const cleaned = value.replace(/,/g, ".").replace(/\s/g, "");
  return parseFloat(cleaned) || null;
}

function formatShareholders(shareholders: { name: string; ownership?: number }[] | undefined): string | null {
  if (!shareholders || shareholders.length === 0) return null;
  return shareholders
    .slice(0, 5)
    .map(s => `${s.name}${s.ownership ? ` (${s.ownership}%)` : ""}`)
    .join(", ");
}

// Format org number with hyphen (XXXXXX-XXXX format)
function formatOrgNumber(orgNr: string): string {
  const digits = orgNr.replace(/\D/g, "");
  if (digits.length === 10) {
    return `${digits.slice(0, 6)}-${digits.slice(6)}`;
  }
  return digits;
}

// Enrich a single company by org number
async function enrichCompany(orgNr: string) {
  const cleanOrgNr = orgNr.replace(/\D/g, "");
  const formattedOrgNr = formatOrgNumber(orgNr);

  // Check if company exists in watchlist - try both formats
  let existing = await prisma.watchedCompany.findUnique({
    where: { orgNumber: formattedOrgNr },
  });

  // If not found with hyphen, try without
  if (!existing) {
    existing = await prisma.watchedCompany.findUnique({
      where: { orgNumber: cleanOrgNr },
    });
  }

  if (!existing) {
    return { success: false, error: "Company not in watchlist" };
  }

  // Use the format that was found in the database
  const dbOrgNumber = existing.orgNumber;

  try {
    const data = await fetchFromAllabolag(cleanOrgNr);

    if (!data) {
      await prisma.watchedCompany.update({
        where: { orgNumber: dbOrgNumber },
        data: {
          enrichmentError: "Company not found on Allabolag",
          lastEnriched: new Date(),
        },
      });
      return { success: false, error: "Company not found on Allabolag" };
    }

    // Extract latest financial data from accounts
    let latestRevenue: number | null = null;
    let latestProfit: number | null = null;
    let latestYear: number | null = null;

    if (data.companyAccounts && data.companyAccounts.length > 0) {
      const latest = data.companyAccounts[0];
      latestYear = latest.year;
      latestRevenue = parseAmount(latest.accounts.find(a => a.code === "nettoomsattning")?.amount);
      latestProfit = parseAmount(latest.accounts.find(a => a.code === "ars_resultat")?.amount);
    }

    // Update company with enriched data
    const updated = await prisma.watchedCompany.update({
      where: { orgNumber: dbOrgNumber },
      data: {
        // Update name if different
        name: data.name || existing.name,
        legalName: data.legalName || null,
        companyType: data.companyType?.name || null,
        status: data.status?.status || null,
        registrationDate: data.registrationDate || null,

        // Update CEO if not set manually
        ceo: data.roles?.manager?.name || existing.ceo || null,
        chairman: data.roles?.chairman?.name || null,

        // Update city/municipality if not set
        city: existing.city || data.location?.municipality || data.postalAddress?.postPlace || null,
        municipality: data.location?.municipality || null,

        // Update startYear if not set
        startYear: existing.startYear || data.foundationYear || null,

        // Employees
        employees: data.numberOfEmployees ? parseInt(data.numberOfEmployees) : (data.employees ? parseInt(data.employees) : null),

        // Address
        address: data.postalAddress?.addressLine || null,
        postalCode: data.postalAddress?.zipCode || null,

        // Contact
        phone: data.phone || null,
        email: data.email || null,
        website: data.homePage || null,

        // Industry
        sniCode: data.industries?.[0]?.code || null,
        sniDescription: data.industries?.[0]?.name || null,

        // Flags
        paymentRemarks: data.paymentRemarks ?? null,
        fSkatt: data.registeredForPayrollTax ?? null,
        momsRegistered: data.registeredForVat ?? null,

        // Corporate structure
        parentCompany: data.corporateStructure?.parentCompanyName || null,
        subsidiaryCount: data.corporateStructure?.numberOfSubsidiaries || null,

        // Share capital
        shareCapital: data.shareCapital ? BigInt(data.shareCapital) : null,

        // Update owners if not set manually
        largestOwners: existing.largestOwners || formatShareholders(data.shareholders),

        // Update financials from API if not set manually
        turnover2024: existing.turnover2024 || (latestYear === 2024 && latestRevenue ? `${latestRevenue} tkr` : existing.turnover2024),
        profit2024: existing.profit2024 || (latestYear === 2024 && latestProfit ? `${latestProfit} tkr` : existing.profit2024),
        turnover2024Num: existing.turnover2024Num || (latestYear === 2024 && latestRevenue ? BigInt(Math.round(latestRevenue * 1000)) : existing.turnover2024Num),
        profit2024Num: existing.profit2024Num || (latestYear === 2024 && latestProfit ? BigInt(Math.round(latestProfit * 1000)) : existing.profit2024Num),

        // Enrichment metadata
        lastEnriched: new Date(),
        enrichmentError: null,
      },
    });

    return {
      success: true,
      company: {
        orgNumber: updated.orgNumber,
        name: updated.name,
        status: updated.status,
        employees: updated.employees,
        ceo: updated.ceo,
        chairman: updated.chairman,
        city: updated.city,
        municipality: updated.municipality,
        lastEnriched: updated.lastEnriched,
      },
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";

    await prisma.watchedCompany.update({
      where: { orgNumber: dbOrgNumber },
      data: {
        enrichmentError: errorMessage,
        lastEnriched: new Date(),
      },
    });

    return { success: false, error: errorMessage };
  }
}

// POST - Enrich single company or batch
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { orgNumber, orgNumbers, all, limit } = body;

    // Single company enrichment
    if (orgNumber) {
      const result = await enrichCompany(orgNumber);
      return NextResponse.json(result);
    }

    // Batch enrichment by list of org numbers
    if (orgNumbers && Array.isArray(orgNumbers)) {
      const results = [];
      for (const orgNr of orgNumbers.slice(0, 50)) {
        const result = await enrichCompany(orgNr);
        results.push({ orgNumber: orgNr, ...result });
        // Small delay to avoid rate limiting
        await new Promise(r => setTimeout(r, 500));
      }
      return NextResponse.json({
        success: true,
        processed: results.length,
        results,
      });
    }

    // Enrich all companies that haven't been enriched recently
    if (all) {
      const batchLimit = Math.min(limit || 20, 100);
      const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

      const companies = await prisma.watchedCompany.findMany({
        where: {
          OR: [
            { lastEnriched: null },
            { lastEnriched: { lt: oneDayAgo } },
          ],
        },
        select: { orgNumber: true, name: true },
        take: batchLimit,
        orderBy: { lastEnriched: { sort: "asc", nulls: "first" } },
      });

      const results = [];
      for (const company of companies) {
        const result = await enrichCompany(company.orgNumber);
        results.push({
          orgNumber: company.orgNumber,
          company: company.name,
          ...result
        });
        await new Promise(r => setTimeout(r, 500));
      }

      return NextResponse.json({
        success: true,
        processed: results.length,
        remaining: await prisma.watchedCompany.count({
          where: {
            OR: [
              { lastEnriched: null },
              { lastEnriched: { lt: oneDayAgo } },
            ],
          },
        }) - results.length,
        results,
      });
    }

    return NextResponse.json(
      { error: "Missing orgNumber, orgNumbers array, or all flag" },
      { status: 400 }
    );
  } catch (error) {
    console.error("Enrichment error:", error);
    return NextResponse.json(
      { error: "Enrichment failed" },
      { status: 500 }
    );
  }
}

// GET - Get enrichment status
export async function GET() {
  try {
    const [total, enriched, notEnriched, withErrors] = await Promise.all([
      prisma.watchedCompany.count(),
      prisma.watchedCompany.count({ where: { lastEnriched: { not: null } } }),
      prisma.watchedCompany.count({ where: { lastEnriched: null } }),
      prisma.watchedCompany.count({ where: { enrichmentError: { not: null } } }),
    ]);

    const recentlyEnriched = await prisma.watchedCompany.findMany({
      where: { lastEnriched: { not: null } },
      select: {
        orgNumber: true,
        name: true,
        lastEnriched: true,
        enrichmentError: true,
      },
      orderBy: { lastEnriched: "desc" },
      take: 10,
    });

    return NextResponse.json({
      total,
      enriched,
      notEnriched,
      withErrors,
      recentlyEnriched,
    });
  } catch (error) {
    console.error("Error fetching enrichment status:", error);
    return NextResponse.json(
      { error: "Failed to fetch status" },
      { status: 500 }
    );
  }
}
