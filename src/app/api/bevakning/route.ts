import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

// Helper to serialize BigInt values
function serializeCompany(company: Record<string, unknown>) {
  const serialized: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(company)) {
    if (typeof value === "bigint") {
      serialized[key] = Number(value);
    } else {
      serialized[key] = value;
    }
  }
  return serialized;
}

// GET all watched companies
export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const search = url.searchParams.get("q");
    const impactNiche = url.searchParams.get("impactNiche");
    const city = url.searchParams.get("city");
    const fundraising = url.searchParams.get("fundraising");
    const page = parseInt(url.searchParams.get("page") || "1");
    const limit = parseInt(url.searchParams.get("limit") || "50");
    const sortBy = url.searchParams.get("sortBy") || "name";
    const sortOrder = url.searchParams.get("sortOrder") || "asc";
    const skip = (page - 1) * limit;

    // Build where clause
    const where: Record<string, unknown> = {};

    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { orgNumber: { contains: search } },
        { impactNiche: { contains: search, mode: "insensitive" } },
        { city: { contains: search, mode: "insensitive" } },
        { ceo: { contains: search, mode: "insensitive" } },
        { largestOwners: { contains: search, mode: "insensitive" } },
      ];
    }

    if (impactNiche) {
      where.impactNiche = { contains: impactNiche, mode: "insensitive" };
    }

    if (city) {
      where.city = { contains: city, mode: "insensitive" };
    }

    if (fundraising) {
      where.fundraising = { contains: fundraising, mode: "insensitive" };
    }

    // Build orderBy
    const orderBy: Record<string, string> = {};
    const validSortFields = [
      "name",
      "impactNiche",
      "city",
      "turnover2024Num",
      "profit2024Num",
      "latestValuationNum",
      "totalFundingNum",
      "growthNum",
      "startYear",
    ];
    if (validSortFields.includes(sortBy)) {
      orderBy[sortBy] = sortOrder === "desc" ? "desc" : "asc";
    } else {
      orderBy.name = "asc";
    }

    const [companies, total] = await Promise.all([
      prisma.watchedCompany.findMany({
        where,
        orderBy,
        skip,
        take: limit,
      }),
      prisma.watchedCompany.count({ where }),
    ]);

    // Get unique impact niches for filters
    const impactNiches = await prisma.watchedCompany.groupBy({
      by: ["impactNiche"],
      where: { impactNiche: { not: null } },
      _count: true,
      orderBy: { _count: { impactNiche: "desc" } },
    });

    // Get unique cities for filters
    const cities = await prisma.watchedCompany.groupBy({
      by: ["city"],
      where: { city: { not: null } },
      _count: true,
      orderBy: { _count: { city: "desc" } },
    });

    // Get fundraising statuses for filters
    const fundraisingStatuses = await prisma.watchedCompany.groupBy({
      by: ["fundraising"],
      where: { fundraising: { not: null } },
      _count: true,
      orderBy: { _count: { fundraising: "desc" } },
    });

    return NextResponse.json({
      companies: companies.map(serializeCompany),
      total,
      page,
      totalPages: Math.ceil(total / limit),
      filters: {
        impactNiches: impactNiches.map(n => ({ name: n.impactNiche, count: n._count })),
        cities: cities.map(c => ({ name: c.city, count: c._count })),
        fundraisingStatuses: fundraisingStatuses.map(f => ({ name: f.fundraising, count: f._count })),
      },
    });
  } catch (error) {
    console.error("Failed to fetch watched companies:", error);
    return NextResponse.json(
      { error: "Failed to fetch companies" },
      { status: 500 }
    );
  }
}
