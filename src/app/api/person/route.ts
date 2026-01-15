import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/db";

/**
 * GET /api/person
 *
 * Get list of persons with optional filtering
 */
export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;
    const personType = searchParams.get("type");
    const query = searchParams.get("query");
    const limit = parseInt(searchParams.get("limit") || "50", 10);

    const where: Record<string, unknown> = {};

    if (personType && personType !== "all") {
      where.personType = personType;
    }

    if (query) {
      where.OR = [
        { name: { contains: query, mode: "insensitive" } },
        { title: { contains: query, mode: "insensitive" } },
        { location: { contains: query, mode: "insensitive" } },
      ];
    }

    const persons = await prisma.person.findMany({
      where,
      orderBy: { name: "asc" },
      take: Math.min(limit, 100),
      select: {
        id: true,
        name: true,
        firstName: true,
        lastName: true,
        title: true,
        location: true,
        imageUrl: true,
        personType: true,
        totalCompanies: true,
        totalBoardSeats: true,
        activeCompanies: true,
      },
    });

    return NextResponse.json({ persons });
  } catch (error) {
    console.error("Error fetching persons:", error);
    return NextResponse.json(
      { error: "Failed to fetch persons" },
      { status: 500 }
    );
  }
}
