import { NextRequest, NextResponse } from "next/server";
import { getVinnovaProjectsForCompany } from "@/lib/bolag/vinnova";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const companyName = searchParams.get("company");
  const orgNr = searchParams.get("orgNr");

  if (!companyName && !orgNr) {
    return NextResponse.json(
      { error: "Parameter 'company' eller 'orgNr' saknas" },
      { status: 400 }
    );
  }

  try {
    const projects = await getVinnovaProjectsForCompany(
      companyName || "",
      orgNr || undefined
    );
    return NextResponse.json({ projects });
  } catch (error) {
    console.error("Error fetching Vinnova projects:", error);
    return NextResponse.json(
      { error: "Kunde inte hämta Vinnova-projekt" },
      { status: 500 }
    );
  }
}
