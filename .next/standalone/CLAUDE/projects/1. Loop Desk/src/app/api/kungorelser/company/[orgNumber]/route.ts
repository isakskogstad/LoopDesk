import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { getCompanyAnnouncements } from "@/lib/kungorelser";

/**
 * GET /api/kungorelser/company/[orgNumber]
 *
 * Get all announcements for a specific company
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ orgNumber: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { orgNumber } = await params;

    if (!orgNumber) {
      return NextResponse.json(
        { error: "Organization number required" },
        { status: 400 }
      );
    }

    // Normalize org number (remove dash if present)
    const normalizedOrgNr = orgNumber.replace("-", "");

    const announcements = await getCompanyAnnouncements(normalizedOrgNr);

    return NextResponse.json({
      orgNumber: normalizedOrgNr,
      count: announcements.length,
      announcements,
    });
  } catch (error) {
    console.error("Error fetching company announcements:", error);
    return NextResponse.json(
      { error: "Failed to fetch company announcements" },
      { status: 500 }
    );
  }
}
