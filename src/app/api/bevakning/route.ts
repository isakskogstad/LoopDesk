import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

// GET all watched companies
export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const search = url.searchParams.get("q");
    const page = parseInt(url.searchParams.get("page") || "1");
    const limit = parseInt(url.searchParams.get("limit") || "50");
    const skip = (page - 1) * limit;

    const where = search
      ? {
          OR: [
            { name: { contains: search, mode: "insensitive" as const } },
            { orgNumber: { contains: search } },
          ],
        }
      : {};

    const [companies, total] = await Promise.all([
      prisma.watchedCompany.findMany({
        where,
        orderBy: { name: "asc" },
        skip,
        take: limit,
      }),
      prisma.watchedCompany.count({ where }),
    ]);

    return NextResponse.json({
      companies,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    console.error("Failed to fetch watched companies:", error);
    return NextResponse.json(
      { error: "Failed to fetch companies" },
      { status: 500 }
    );
  }
}
