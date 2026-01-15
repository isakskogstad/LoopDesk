import { NextRequest, NextResponse } from "next/server";
import { getAnnualReportsList } from "@/lib/bolag/bolagsverket";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const orgNr = searchParams.get("orgNr");

  if (!orgNr) {
    return NextResponse.json(
      { error: "orgNr parameter is required" },
      { status: 400 }
    );
  }

  try {
    const reports = await getAnnualReportsList(orgNr);

    return NextResponse.json({
      orgNr,
      reports: reports.map((r) => ({
        dokumentId: r.dokumentId,
        period: r.period,
        date: r.date,
        year: r.period ? new Date(r.period).getFullYear() : null,
      })),
    });
  } catch (error) {
    console.error("Error fetching annual reports:", error);
    return NextResponse.json(
      { error: "Failed to fetch annual reports" },
      { status: 500 }
    );
  }
}
