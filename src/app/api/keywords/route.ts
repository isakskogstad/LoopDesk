import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET() {
  try {
    const keywords = await prisma.keyword.findMany({
      include: { matches: { include: { article: true }, take: 10 } },
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json({ keywords });
  } catch (error) {
    console.error("Error fetching keywords:", error);
    return NextResponse.json({ error: "Failed to fetch keywords" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { term, color } = await request.json();
    if (!term) {
      return NextResponse.json({ error: "term is required" }, { status: 400 });
    }

    const keyword = await prisma.keyword.create({
      data: { term: term.toLowerCase(), color: color || "#3b82f6", isActive: true },
    });
    return NextResponse.json({ keyword });
  } catch (error) {
    if (error instanceof Error && error.message.includes("Unique constraint")) {
      return NextResponse.json({ error: "Keyword already exists" }, { status: 409 });
    }
    return NextResponse.json({ error: "Failed to create keyword" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  const id = new URL(request.url).searchParams.get("id");
  if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });
  
  try {
    await prisma.keyword.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Failed to delete keyword" }, { status: 500 });
  }
}
