import { NextRequest, NextResponse } from "next/server";
import { getCompanyData } from "@/lib/bolag";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ orgNr: string }> }
) {
  const { orgNr } = await params;

  if (!orgNr) {
    return NextResponse.json(
      { error: "Organisationsnummer saknas" },
      { status: 400 }
    );
  }

  try {
    const data = await getCompanyData(orgNr);

    if (!data) {
      return NextResponse.json(
        { error: "Företaget hittades inte" },
        { status: 404 }
      );
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error("Error fetching company:", error);
    return NextResponse.json(
      { error: "Ett fel uppstod vid hämtning av företagsdata" },
      { status: 500 }
    );
  }
}
