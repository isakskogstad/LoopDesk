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
        { family: { contains: search, mode: "insensitive" } },
        { portfolioCompanies: { contains: search, mode: "insensitive" } },
      ];
    }

    if (niche) {
      where.impactNiche = { contains: niche, mode: "insensitive" };
    }

    const [rawFamilyOffices, total] = await Promise.all([
      prisma.familyOffice.findMany({
        where,
        orderBy: { name: "asc" },
      }),
      prisma.familyOffice.count({ where }),
    ]);

    // Convert BigInt to string for JSON serialization
    const familyOffices = serializeBigInt(rawFamilyOffices);

    // Extract unique niches from the data
    const allNiches = new Map<string, number>();
    for (const fo of await prisma.familyOffice.findMany({
      select: { impactNiche: true },
    })) {
      if (fo.impactNiche) {
        const parts = fo.impactNiche.split(",").map((n) => n.trim());
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
      familyOffices,
      total,
      filters: {
        niches: nicheFilters,
      },
    });
  } catch (error) {
    console.error("Failed to fetch family offices:", error);
    return NextResponse.json(
      { error: "Failed to fetch family offices" },
      { status: 500 }
    );
  }
}
