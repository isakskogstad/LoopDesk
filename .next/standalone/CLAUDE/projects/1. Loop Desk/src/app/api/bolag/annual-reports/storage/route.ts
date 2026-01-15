import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

// Server-side Supabase client for storage access
function getSupabaseAdmin() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceKey) {
    // Fall back to anon key if service key not available
    const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    if (!url || !anonKey) {
      return null;
    }
    return createClient(url, anonKey);
  }

  return createClient(url, serviceKey);
}

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
    const supabase = getSupabaseAdmin();

    if (!supabase) {
      return NextResponse.json(
        { error: "Supabase not configured" },
        { status: 500 }
      );
    }

    // Normalize org number: remove hyphen for folder lookup
    const folderName = orgNr.replace(/-/g, "");

    // List files in the company's folder
    const { data: files, error } = await supabase.storage
      .from("annual-reports")
      .list(folderName, {
        limit: 100,
        sortBy: { column: "name", order: "desc" },
      });

    if (error) {
      // If folder doesn't exist, return empty array
      if (error.message.includes("not found") || error.message.includes("does not exist")) {
        return NextResponse.json({ orgNr, reports: [] });
      }
      throw error;
    }

    if (!files || files.length === 0) {
      return NextResponse.json({ orgNr, reports: [] });
    }

    // Parse file names to extract year and generate viewer URLs
    // Expected format: "556356-9192.2023.xhtml"
    const reports = files
      .filter(file => file.name.endsWith(".xhtml") || file.name.endsWith(".html") || file.name.endsWith(".pdf"))
      .map(file => {
        // Extract year from filename (e.g., "556356-9192.2023.xhtml" -> 2023)
        const yearMatch = file.name.match(/\.(\d{4})\.(xhtml|html|pdf)$/);
        const year = yearMatch ? parseInt(yearMatch[1]) : null;

        // For PDFs, use direct Supabase URL; for XHTML, use viewer page
        const isPdf = file.name.endsWith(".pdf");
        let url: string;

        if (isPdf) {
          const { data: urlData } = supabase.storage
            .from("annual-reports")
            .getPublicUrl(`${folderName}/${file.name}`);
          url = urlData?.publicUrl || "";
        } else {
          // Use internal viewer for XHTML files
          url = `/bolag/annual-report/${folderName}/${encodeURIComponent(file.name)}`;
        }

        return {
          name: file.name,
          year,
          url,
          size: file.metadata?.size || null,
          createdAt: file.created_at,
        };
      })
      .filter(report => report.year !== null)
      .sort((a, b) => (b.year || 0) - (a.year || 0)); // Sort by year descending

    return NextResponse.json({
      orgNr,
      reports,
    });
  } catch (error) {
    console.error("Error fetching annual reports from storage:", error);
    return NextResponse.json(
      { error: "Failed to fetch annual reports" },
      { status: 500 }
    );
  }
}
