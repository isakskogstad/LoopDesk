import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import fs from "fs";
import path from "path";
import companiesData from "@/data/companies.json";

interface CompanyData {
  orgNumber: string;
  name: string;
  sector?: string | null;
  municipality?: string | null;
  employees?: number | null;
  revenue?: number | null;
  profit?: number | null;
  equityRatio?: number | null;
  status?: string | null;
  valuation?: number | null;
  investmentStatus?: string | null;
}

// POST to seed companies from JSON data
export async function POST() {
  try {
    const companies = companiesData as CompanyData[];

    // Check which logos exist
    const logosDir = path.join(process.cwd(), "public", "logos");
    let existingLogos: Set<string> = new Set();
    try {
      const files = fs.readdirSync(logosDir);
      existingLogos = new Set(files.map(f => f.replace(".png", "")));
    } catch {
      // Logos dir doesn't exist
    }

    // Upsert all companies in batches
    let processed = 0;
    const batchSize = 50;

    for (let i = 0; i < companies.length; i += batchSize) {
      const batch = companies.slice(i, i + batchSize);

      for (const company of batch) {
        const hasLogo = existingLogos.has(company.orgNumber);

        try {
          await prisma.watchedCompany.upsert({
            where: { orgNumber: company.orgNumber },
            update: {
              name: company.name,
              hasLogo,
              sector: company.sector || null,
              municipality: company.municipality || null,
              employees: company.employees || null,
              revenue: company.revenue ? BigInt(company.revenue) : null,
              profit: company.profit ? BigInt(company.profit) : null,
              equityRatio: company.equityRatio || null,
              status: company.status || null,
              valuation: company.valuation ? BigInt(company.valuation) : null,
              investmentStatus: company.investmentStatus || null,
              lastUpdated: new Date(),
            },
            create: {
              orgNumber: company.orgNumber,
              name: company.name,
              hasLogo,
              sector: company.sector || null,
              municipality: company.municipality || null,
              employees: company.employees || null,
              revenue: company.revenue ? BigInt(company.revenue) : null,
              profit: company.profit ? BigInt(company.profit) : null,
              equityRatio: company.equityRatio || null,
              status: company.status || null,
              valuation: company.valuation ? BigInt(company.valuation) : null,
              investmentStatus: company.investmentStatus || null,
              lastUpdated: new Date(),
            },
          });
          processed++;
        } catch (e) {
          console.error(`Failed to upsert ${company.orgNumber}:`, e);
        }
      }
    }

    return NextResponse.json({
      success: true,
      total: companies.length,
      processed,
    });
  } catch (error) {
    console.error("Failed to seed companies:", error);
    return NextResponse.json(
      { error: "Failed to seed companies", details: String(error) },
      { status: 500 }
    );
  }
}

// GET to check seed status
export async function GET() {
  try {
    const count = await prisma.watchedCompany.count();
    const withRevenue = await prisma.watchedCompany.count({
      where: { revenue: { not: null } },
    });
    return NextResponse.json({
      seeded: count > 0,
      count,
      withFinancialData: withRevenue,
    });
  } catch (error) {
    console.error("Failed to check seed status:", error);
    return NextResponse.json(
      { error: "Failed to check status" },
      { status: 500 }
    );
  }
}
