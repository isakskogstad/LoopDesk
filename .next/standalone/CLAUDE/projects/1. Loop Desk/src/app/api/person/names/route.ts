import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";
export const revalidate = 300; // Cache for 5 minutes

/**
 * GET /api/person/names
 * Returns a map of person names to their IDs for client-side linking
 */
export async function GET() {
  try {
    const persons = await prisma.person.findMany({
      select: {
        id: true,
        name: true,
        allabolagId: true,
      },
      orderBy: {
        name: "asc",
      },
    });

    // Build a map: name -> { id, allabolagId }
    const personMap: Record<string, { id: string; allabolagId: string | null }> = {};

    for (const person of persons) {
      // Use the full name as key
      personMap[person.name] = {
        id: person.id,
        allabolagId: person.allabolagId,
      };
    }

    return NextResponse.json({
      persons: personMap,
      count: persons.length,
    });
  } catch (error) {
    console.error("Error fetching person names:", error);
    return NextResponse.json(
      { error: "Failed to fetch person names" },
      { status: 500 }
    );
  }
}
