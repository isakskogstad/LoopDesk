import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

// GET all watched companies (simplified for bolaghandelser)
export async function GET() {
  try {
    const companies = await prisma.watchedCompany.findMany({
      select: {
        orgNumber: true,
        name: true,
        hasLogo: true,
      },
      orderBy: { name: "asc" },
    });

    return NextResponse.json({
      companies,
      total: companies.length,
    });
  } catch (error) {
    console.error("Failed to fetch watchlist:", error);
    return NextResponse.json(
      { error: "Failed to fetch watchlist" },
      { status: 500 }
    );
  }
}
