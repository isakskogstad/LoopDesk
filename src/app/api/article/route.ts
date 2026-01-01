import { NextRequest, NextResponse } from "next/server";
import { parseArticle } from "@/lib/nyheter/article-parser";

// GET - Parse full article from URL
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const url = searchParams.get("url");

  if (!url) {
    return NextResponse.json(
      { error: "URL parameter is required" },
      { status: 400 }
    );
  }

  try {
    const result = await parseArticle(url);

    if (!result) {
      return NextResponse.json(
        { error: "Failed to parse article" },
        { status: 404 }
      );
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error("Error parsing article:", error);
    return NextResponse.json(
      {
        error: "Failed to parse article",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

// POST - Parse article from provided HTML
export async function POST(request: NextRequest) {
  try {
    const { url, html } = (await request.json()) as { url: string; html?: string };

    if (!url) {
      return NextResponse.json(
        { error: "URL is required" },
        { status: 400 }
      );
    }

    // If HTML is provided, we'd use parseArticleFromHtml
    // For now, just fetch and parse
    const result = await parseArticle(url);

    if (!result) {
      return NextResponse.json(
        { error: "Failed to parse article" },
        { status: 404 }
      );
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error("Error parsing article:", error);
    return NextResponse.json(
      { error: "Failed to parse article" },
      { status: 500 }
    );
  }
}
