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
    const sector = url.searchParams.get("sector");
    const municipality = url.searchParams.get("municipality");
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
        { sector: { contains: search, mode: "insensitive" } },
        { municipality: { contains: search, mode: "insensitive" } },
      ];
    }

    if (sector) {
      where.sector = { contains: sector, mode: "insensitive" };
    }

    if (municipality) {
      where.municipality = { contains: municipality, mode: "insensitive" };
    }

    // Build orderBy
    const orderBy: Record<string, string> = {};
    const validSortFields = ["name", "revenue", "employees", "profit", "equityRatio", "municipality", "sector"];
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

    // Get unique sectors and municipalities for filters
    const sectors = await prisma.watchedCompany.groupBy({
      by: ["sector"],
      where: { sector: { not: null } },
      _count: true,
      orderBy: { _count: { sector: "desc" } },
    });

    const municipalities = await prisma.watchedCompany.groupBy({
      by: ["municipality"],
      where: { municipality: { not: null } },
      _count: true,
      orderBy: { _count: { municipality: "desc" } },
    });

    return NextResponse.json({
      companies: companies.map(serializeCompany),
      total,
      page,
      totalPages: Math.ceil(total / limit),
      filters: {
        sectors: sectors.map(s => ({ name: s.sector, count: s._count })),
        municipalities: municipalities.map(m => ({ name: m.municipality, count: m._count })),
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
