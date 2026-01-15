import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

interface RouteParams {
  params: Promise<{ id: string }>;
}

/**
 * GET /api/person/[id]
 * Returns detailed information about a person including their roles
 */
export async function GET(request: NextRequest, { params }: RouteParams) {
  const { id } = await params;

  try {
    const person = await prisma.person.findUnique({
      where: { id },
      include: {
        roles: {
          orderBy: [
            { isActive: "desc" },
            { isPrimary: "desc" },
            { companyName: "asc" },
          ],
        },
      },
    });

    if (!person) {
      return NextResponse.json({ error: "Person not found" }, { status: 404 });
    }

    return NextResponse.json({
      id: person.id,
      name: person.name,
      firstName: person.firstName,
      lastName: person.lastName,
      birthYear: person.birthYear,
      personType: person.personType,
      allabolagId: person.allabolagId,
      totalCompanies: person.totalCompanies,
      activeCompanies: person.activeCompanies,
      totalBoardSeats: person.totalBoardSeats,
      roles: person.roles.map((role) => ({
        id: role.id,
        orgNumber: role.orgNumber,
        companyName: role.companyName,
        roleType: role.roleType,
        roleTitle: role.roleTitle,
        roleGroup: role.roleGroup,
        isActive: role.isActive,
        isPrimary: role.isPrimary,
      })),
    });
  } catch (error) {
    console.error("Error fetching person:", error);
    return NextResponse.json(
      { error: "Failed to fetch person" },
      { status: 500 }
    );
  }
}
