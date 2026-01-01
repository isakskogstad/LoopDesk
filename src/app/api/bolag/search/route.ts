import { NextRequest, NextResponse } from "next/server";
import { searchCompanies } from "@/lib/bolag";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const query = searchParams.get("q");

  if (!query || query.length < 2) {
    return NextResponse.json(
      { error: "Sökfrågan måste vara minst 2 tecken" },
      { status: 400 }
    );
  }

  try {
    const results = await searchCompanies(query);
    return NextResponse.json({ results });
  } catch (error) {
    console.error("Error searching companies:", error);
    return NextResponse.json(
      { error: "Kunde inte söka efter företag" },
      { status: 500 }
    );
  }
}
