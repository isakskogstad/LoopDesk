import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import fs from "fs";
import path from "path";
import companiesData from "@/data/companies.json";

// POST to seed companies from JSON data
export async function POST() {
  try {
    const companies = companiesData as { orgNumber: string; name: string }[];

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
    let created = 0;
    let updated = 0;
    const batchSize = 50;

    for (let i = 0; i < companies.length; i += batchSize) {
      const batch = companies.slice(i, i + batchSize);

      for (const company of batch) {
        const hasLogo = existingLogos.has(company.orgNumber);

        try {
          await prisma.watchedCompany.upsert({
            where: { orgNumber: company.orgNumber },
            update: { name: company.name, hasLogo },
            create: {
              orgNumber: company.orgNumber,
              name: company.name,
              hasLogo,
            },
          });
          created++;
        } catch (e) {
          console.error(`Failed to upsert ${company.orgNumber}:`, e);
        }
      }
    }

    return NextResponse.json({
      success: true,
      total: companies.length,
      processed: created,
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
    return NextResponse.json({
      seeded: count > 0,
      count,
    });
  } catch (error) {
    console.error("Failed to check seed status:", error);
    return NextResponse.json(
      { error: "Failed to check status" },
      { status: 500 }
    );
  }
}
