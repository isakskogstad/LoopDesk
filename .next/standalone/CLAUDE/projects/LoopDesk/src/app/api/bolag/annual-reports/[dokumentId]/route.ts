import { NextRequest, NextResponse } from "next/server";
import { getAnnualReportContent } from "@/lib/bolag/bolagsverket";

interface RouteParams {
  params: Promise<{ dokumentId: string }>;
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  const { dokumentId } = await params;

  if (!dokumentId) {
    return NextResponse.json(
      { error: "dokumentId is required" },
      { status: 400 }
    );
  }

  try {
    const result = await getAnnualReportContent(dokumentId);

    if (!result) {
      return NextResponse.json(
        { error: "Document not found" },
        { status: 404 }
      );
    }

    // Return the XHTML content directly - browsers can render this
    return new NextResponse(result.content, {
      headers: {
        "Content-Type": "application/xhtml+xml; charset=utf-8",
        "Content-Disposition": `inline; filename="${result.filename}"`,
      },
    });
  } catch (error) {
    console.error("Error fetching annual report:", error);
    return NextResponse.json(
      { error: "Failed to fetch annual report" },
      { status: 500 }
    );
  }
}
