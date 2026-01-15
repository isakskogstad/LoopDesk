import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export const revalidate = 3600; // Cache for 1 hour

export async function GET() {
  try {
    // Fetch company names from WatchedCompany (impact companies)
    const watchedCompanies = await prisma.watchedCompany.findMany({
      select: {
        orgNumber: true,
        name: true,
      },
    });

    // Fetch VC companies
    const vcCompanies = await prisma.vCCompany.findMany({
      where: {
        orgNumber: { not: null },
      },
      select: {
        orgNumber: true,
        name: true,
      },
    });

    // Combine into a single mapping (name -> orgNumber)
    const companyMap: Record<string, string> = {};

    for (const company of watchedCompanies) {
      if (company.name && company.orgNumber) {
        // Store with normalized name (trimmed)
        companyMap[company.name.trim()] = company.orgNumber;
      }
    }

    for (const company of vcCompanies) {
      if (company.name && company.orgNumber) {
        companyMap[company.name.trim()] = company.orgNumber;
      }
    }

    return NextResponse.json({
      companies: companyMap,
      count: Object.keys(companyMap).length,
    });
  } catch (error) {
    console.error("Error fetching company names:", error);
    return NextResponse.json(
      { error: "Failed to fetch company names" },
      { status: 500 }
    );
  }
}
