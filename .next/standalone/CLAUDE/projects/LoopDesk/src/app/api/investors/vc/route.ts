import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

// Helper to convert BigInt to string for JSON serialization
function serializeBigInt<T>(obj: T): T {
  return JSON.parse(
    JSON.stringify(obj, (_, value) =>
      typeof value === "bigint" ? value.toString() : value
    )
  );
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const search = searchParams.get("q") || "";
    const niche = searchParams.get("niche") || "";

    const where: Record<string, unknown> = {};

    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { portfolioCompanies: { contains: search, mode: "insensitive" } },
      ];
    }

    if (niche) {
      where.impactNiche = { contains: niche, mode: "insensitive" };
    }

    const [rawVcCompanies, total] = await Promise.all([
      prisma.vCCompany.findMany({
        where,
        orderBy: { name: "asc" },
      }),
      prisma.vCCompany.count({ where }),
    ]);

    // Convert BigInt to string for JSON serialization
    const vcCompanies = serializeBigInt(rawVcCompanies);

    // Extract unique niches from the data
    const allNiches = new Map<string, number>();
    for (const vc of await prisma.vCCompany.findMany({
      select: { impactNiche: true },
    })) {
      if (vc.impactNiche) {
        const parts = vc.impactNiche.split(",").map((n) => n.trim());
        for (const part of parts) {
          allNiches.set(part, (allNiches.get(part) || 0) + 1);
        }
      }
    }

    const nicheFilters = Array.from(allNiches.entries())
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 15);

    return NextResponse.json({
      vcCompanies,
      total,
      filters: {
        niches: nicheFilters,
      },
    });
  } catch (error) {
    console.error("Failed to fetch VC companies:", error);
    return NextResponse.json(
      { error: "Failed to fetch VC companies" },
      { status: 500 }
    );
  }
}
