import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { messages, systemPrompt } = body as {
      messages: ChatMessage[];
      systemPrompt?: string;
    };

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json(
        { error: "Messages array is required" },
        { status: 400 }
      );
    }

    if (!process.env.ANTHROPIC_API_KEY) {
      return NextResponse.json(
        { error: "ANTHROPIC_API_KEY not configured" },
        { status: 500 }
      );
    }

    const response = await anthropic.messages.create({
      model: "claude-3-5-sonnet-20241022",
      max_tokens: 1024,
      system: systemPrompt || "Du är en hjälpsam assistent. Svara på svenska.",
      messages: messages.map((m) => ({
        role: m.role,
        content: m.content,
      })),
    });

    const textContent = response.content.find((c) => c.type === "text");
    const content = textContent?.type === "text" ? textContent.text : "";

    return NextResponse.json({ content });
  } catch (error) {
    console.error("Chat API error:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      { error: "Failed to process chat request", details: errorMessage },
      { status: 500 }
    );
  }
}
