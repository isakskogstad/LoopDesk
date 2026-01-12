import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const path = searchParams.get("path");

  if (!path) {
    return NextResponse.json(
      { error: "path parameter is required" },
      { status: 400 }
    );
  }

  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://rpjmsncjnhtnjnycabys.supabase.co";
    const fileUrl = `${supabaseUrl}/storage/v1/object/public/annual-reports/${path}`;

    // Fetch the file from Supabase Storage
    const response = await fetch(fileUrl);

    if (!response.ok) {
      return NextResponse.json(
        { error: "File not found" },
        { status: 404 }
      );
    }

    const content = await response.text();

    // Determine content type based on file extension
    const isXhtml = path.endsWith(".xhtml") || path.endsWith(".html");
    const contentType = isXhtml ? "text/html; charset=utf-8" : "application/pdf";

    // Return the content with proper headers for HTML rendering
    return new NextResponse(content, {
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=86400", // Cache for 24 hours
      },
    });
  } catch (error) {
    console.error("Error proxying annual report:", error);
    return NextResponse.json(
      { error: "Failed to fetch file" },
      { status: 500 }
    );
  }
}
