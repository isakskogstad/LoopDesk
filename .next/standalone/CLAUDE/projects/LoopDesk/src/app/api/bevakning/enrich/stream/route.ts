import { NextRequest } from "next/server";
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

// Format org number with hyphen
function formatOrgNumber(orgNr: string): string {
  const digits = orgNr.replace(/\D/g, "");
  if (digits.length === 10) {
    return `${digits.slice(0, 6)}-${digits.slice(6)}`;
  }
  return digits;
}

async function fetchFromAllabolag(orgNr: string): Promise<AllabolagCompany | null> {
  const cleanOrgNr = orgNr.replace(/\D/g, "");

  const response = await fetch(`${BASE_URL}/${cleanOrgNr}`, {
    headers: {
      "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36",
      Accept: "text/html,application/xhtml+xml",
    },
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

/**
 * POST /api/bevakning/enrich/stream
 * Streaming enrichment with real-time progress
 */
export async function POST(request: NextRequest) {
  const body = await request.json();
  const { limit = 20 } = body;

  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      const sendEvent = (data: object) => {
        controller.enqueue(encoder.encode(`data: ${JSON.stringify(data)}\n\n`));
      };

      try {
        // Get companies to enrich
        const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
        const batchLimit = Math.min(limit, 100);

        sendEvent({ type: "status", message: "Hämtar bolag att berika...", phase: "init" });

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

        const total = companies.length;
        const remaining = await prisma.watchedCompany.count({
          where: {
            OR: [
              { lastEnriched: null },
              { lastEnriched: { lt: oneDayAgo } },
            ],
          },
        });

        sendEvent({
          type: "start",
          message: `Börjar berika ${total} bolag`,
          total,
          remaining: remaining - total,
          phase: "processing"
        });

        let successCount = 0;
        let errorCount = 0;

        for (let i = 0; i < companies.length; i++) {
          const company = companies[i];
          const progress = Math.round(((i + 1) / total) * 100);

          sendEvent({
            type: "progress",
            current: i + 1,
            total,
            progress,
            company: company.name,
            orgNumber: company.orgNumber,
            message: `Hämtar data för ${company.name}...`,
            phase: "fetching"
          });

          try {
            const cleanOrgNr = company.orgNumber.replace(/\D/g, "");
            const formattedOrgNr = formatOrgNumber(company.orgNumber);

            // Find company in DB
            let existing = await prisma.watchedCompany.findUnique({
              where: { orgNumber: formattedOrgNr },
            });
            if (!existing) {
              existing = await prisma.watchedCompany.findUnique({
                where: { orgNumber: cleanOrgNr },
              });
            }

            if (!existing) {
              sendEvent({
                type: "error",
                current: i + 1,
                company: company.name,
                message: `${company.name}: Finns inte i bevakningslistan`,
                phase: "error"
              });
              errorCount++;
              continue;
            }

            const dbOrgNumber = existing.orgNumber;

            // Fetch from Allabolag
            sendEvent({
              type: "progress",
              current: i + 1,
              total,
              progress,
              company: company.name,
              message: `Hämtar från Allabolag...`,
              phase: "fetching"
            });

            const data = await fetchFromAllabolag(cleanOrgNr);

            if (!data) {
              await prisma.watchedCompany.update({
                where: { orgNumber: dbOrgNumber },
                data: {
                  enrichmentError: "Hittades inte på Allabolag",
                  lastEnriched: new Date(),
                },
              });
              sendEvent({
                type: "warning",
                current: i + 1,
                company: company.name,
                message: `${company.name}: Hittades inte på Allabolag`,
                phase: "warning"
              });
              errorCount++;
              continue;
            }

            // Extract financials
            let latestRevenue: number | null = null;
            let latestProfit: number | null = null;
            let latestYear: number | null = null;

            if (data.companyAccounts && data.companyAccounts.length > 0) {
              const latest = data.companyAccounts[0];
              latestYear = latest.year;
              latestRevenue = parseAmount(latest.accounts.find(a => a.code === "nettoomsattning")?.amount);
              latestProfit = parseAmount(latest.accounts.find(a => a.code === "ars_resultat")?.amount);
            }

            sendEvent({
              type: "progress",
              current: i + 1,
              total,
              progress,
              company: company.name,
              message: `Sparar ${company.name}...`,
              phase: "saving"
            });

            // Update company
            await prisma.watchedCompany.update({
              where: { orgNumber: dbOrgNumber },
              data: {
                name: data.name || existing.name,
                legalName: data.legalName || null,
                companyType: data.companyType?.name || null,
                status: data.status?.status || null,
                registrationDate: data.registrationDate || null,
                ceo: data.roles?.manager?.name || existing.ceo || null,
                chairman: data.roles?.chairman?.name || null,
                city: existing.city || data.location?.municipality || data.postalAddress?.postPlace || null,
                municipality: data.location?.municipality || null,
                startYear: existing.startYear || data.foundationYear || null,
                employees: data.numberOfEmployees ? parseInt(data.numberOfEmployees) : (data.employees ? parseInt(data.employees) : null),
                address: data.postalAddress?.addressLine || null,
                postalCode: data.postalAddress?.zipCode || null,
                phone: data.phone || null,
                email: data.email || null,
                website: data.homePage || null,
                sniCode: data.industries?.[0]?.code || null,
                sniDescription: data.industries?.[0]?.name || null,
                paymentRemarks: data.paymentRemarks ?? null,
                fSkatt: data.registeredForPayrollTax ?? null,
                momsRegistered: data.registeredForVat ?? null,
                parentCompany: data.corporateStructure?.parentCompanyName || null,
                subsidiaryCount: data.corporateStructure?.numberOfSubsidiaries || null,
                shareCapital: data.shareCapital ? BigInt(data.shareCapital) : null,
                largestOwners: existing.largestOwners || formatShareholders(data.shareholders),
                turnover2024: existing.turnover2024 || (latestYear === 2024 && latestRevenue ? `${latestRevenue} tkr` : existing.turnover2024),
                profit2024: existing.profit2024 || (latestYear === 2024 && latestProfit ? `${latestProfit} tkr` : existing.profit2024),
                turnover2024Num: existing.turnover2024Num || (latestYear === 2024 && latestRevenue ? BigInt(Math.round(latestRevenue * 1000)) : existing.turnover2024Num),
                profit2024Num: existing.profit2024Num || (latestYear === 2024 && latestProfit ? BigInt(Math.round(latestProfit * 1000)) : existing.profit2024Num),
                lastEnriched: new Date(),
                enrichmentError: null,
              },
            });

            // Build summary of what was saved
            const savedFields: string[] = [];
            if (data.roles?.manager?.name) savedFields.push("VD");
            if (data.numberOfEmployees || data.employees) savedFields.push("anställda");
            if (data.location?.municipality) savedFields.push("kommun");
            if (data.industries?.[0]?.name) savedFields.push("bransch");
            if (latestRevenue) savedFields.push("omsättning");

            successCount++;
            sendEvent({
              type: "success",
              current: i + 1,
              total,
              progress,
              company: company.name,
              message: `✓ ${company.name}: ${savedFields.length > 0 ? savedFields.join(", ") : "uppdaterad"}`,
              savedFields,
              phase: "success"
            });

            // Small delay to avoid rate limiting
            await new Promise(r => setTimeout(r, 500));

          } catch (error) {
            const errorMessage = error instanceof Error ? error.message : "Okänt fel";
            errorCount++;
            sendEvent({
              type: "error",
              current: i + 1,
              company: company.name,
              message: `✗ ${company.name}: ${errorMessage}`,
              phase: "error"
            });

            // Update with error
            try {
              const formattedOrgNr = formatOrgNumber(company.orgNumber);
              await prisma.watchedCompany.update({
                where: { orgNumber: formattedOrgNr },
                data: {
                  enrichmentError: errorMessage,
                  lastEnriched: new Date(),
                },
              });
            } catch {
              // Ignore update errors
            }
          }
        }

        // Send final summary
        sendEvent({
          type: "complete",
          message: `Klar! ${successCount} lyckades, ${errorCount} fel`,
          successCount,
          errorCount,
          total,
          remaining: remaining - total,
          phase: "done"
        });

      } catch (error) {
        sendEvent({
          type: "fatal",
          message: `Kritiskt fel: ${error instanceof Error ? error.message : "Okänt fel"}`,
          phase: "error"
        });
      } finally {
        controller.close();
      }
    }
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      "Connection": "keep-alive",
    },
  });
}
