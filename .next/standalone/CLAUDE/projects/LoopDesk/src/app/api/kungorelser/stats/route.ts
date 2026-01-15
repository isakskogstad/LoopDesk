import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

/**
 * GET /api/kungorelser/stats
 *
 * Get announcement statistics including counts per company
 */
export async function GET() {
  try {
    // Get total count
    const total = await prisma.announcement.count();

    // Get counts by company (orgNumber)
    const byCompanyRaw = await prisma.announcement.groupBy({
      by: ["orgNumber"],
      _count: true,
      where: {
        orgNumber: { not: null },
      },
    });

    // Convert to object for easy lookup
    const byCompany: Record<string, number> = {};
    byCompanyRaw.forEach((item) => {
      if (item.orgNumber) {
        byCompany[item.orgNumber] = item._count;
      }
    });

    // Get counts by type
    const byType = await prisma.announcement.groupBy({
      by: ["type"],
      _count: true,
      orderBy: { _count: { type: "desc" } },
    });

    // Get recent announcements
    const recent = await prisma.announcement.findMany({
      orderBy: { publishedAt: "desc" },
      take: 10,
      select: {
        id: true,
        subject: true,
        type: true,
        pubDate: true,
        orgNumber: true,
      },
    });

    return NextResponse.json({
      total,
      byCompany,
      byType: byType.map((t) => ({
        type: t.type || "Okänd",
        count: t._count,
      })),
      recent,
    });
  } catch (error) {
    console.error("Error getting kungörelser stats:", error);
    return NextResponse.json(
      { error: "Failed to get stats" },
      { status: 500 }
    );
  }
}
