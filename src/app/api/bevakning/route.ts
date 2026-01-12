import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

// Helper to serialize BigInt values
function serializeBigInt(obj: Record<string, unknown>): Record<string, unknown> {
  const serialized: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(obj)) {
    if (typeof value === "bigint") {
      serialized[key] = Number(value);
    } else if (value && typeof value === "object" && !Array.isArray(value)) {
      serialized[key] = serializeBigInt(value as Record<string, unknown>);
    } else if (Array.isArray(value)) {
      serialized[key] = value.map(item =>
        typeof item === "object" && item !== null
          ? serializeBigInt(item as Record<string, unknown>)
          : item
      );
    } else {
      serialized[key] = value;
    }
  }
  return serialized;
}

// Legacy helper for backward compatibility
function serializeCompany(company: Record<string, unknown>) {
  return serializeBigInt(company);
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

    // Get org numbers for batch queries
    const orgNumbers = companies.map(c => c.orgNumber).filter(Boolean);

    // Batch fetch related data
    const [directors, owners, beneficialOwners] = await Promise.all([
      prisma.companyDirector.findMany({
        where: { orgNumber: { in: orgNumbers } },
        select: {
          orgNumber: true,
          name: true,
          function: true,
        },
      }),
      prisma.companyOwner.findMany({
        where: { orgNumber: { in: orgNumbers } },
        select: {
          orgNumber: true,
          entityName: true,
          entityType: true,
          percentage: true,
        },
        orderBy: { percentage: "desc" },
      }),
      prisma.beneficialOwner.findMany({
        where: { orgNumber: { in: orgNumbers } },
        select: {
          orgNumber: true,
          entityName: true,
          percentageVotesMin: true,
          percentageVotesMax: true,
        },
      }),
    ]);

    // Group by orgNumber for quick lookup
    const directorsByOrg = directors.reduce((acc, d) => {
      if (!acc[d.orgNumber]) acc[d.orgNumber] = [];
      acc[d.orgNumber].push(d);
      return acc;
    }, {} as Record<string, typeof directors>);

    const ownersByOrg = owners.reduce((acc, o) => {
      if (!acc[o.orgNumber]) acc[o.orgNumber] = [];
      acc[o.orgNumber].push(o);
      return acc;
    }, {} as Record<string, typeof owners>);

    const beneficialOwnersByOrg = beneficialOwners.reduce((acc, bo) => {
      if (!acc[bo.orgNumber]) acc[bo.orgNumber] = [];
      acc[bo.orgNumber].push(bo);
      return acc;
    }, {} as Record<string, typeof beneficialOwners>);

    // Enrich companies with related data
    const enrichedCompanies = companies.map(company => {
      const companyDirectors = directorsByOrg[company.orgNumber] || [];
      const companyOwners = ownersByOrg[company.orgNumber] || [];
      const companyBeneficialOwners = beneficialOwnersByOrg[company.orgNumber] || [];

      // Find VD and chairman from directors
      const vd = companyDirectors.find(d =>
        d.function?.toLowerCase().includes("verkställande direktör")
      );
      const chairman = companyDirectors.find(d =>
        d.function?.toLowerCase().includes("ordförande") &&
        !d.function?.toLowerCase().includes("vice")
      );

      return {
        ...company,
        // Use director data if ceo/chairman fields are empty
        ceo: company.ceo || vd?.name || null,
        chairman: company.chairman || chairman?.name || null,
        // Add enriched data
        directors: companyDirectors,
        owners: companyOwners.slice(0, 10), // Top 10 owners
        beneficialOwners: companyBeneficialOwners,
        ownerCount: companyOwners.length,
        directorCount: companyDirectors.length,
      };
    });

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
      companies: enrichedCompanies.map(c => serializeBigInt(c as unknown as Record<string, unknown>)),
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
