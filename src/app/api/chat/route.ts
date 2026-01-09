import { NextRequest } from "next/server";
import Anthropic from "@anthropic-ai/sdk";

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
      return new Response(JSON.stringify({ error: "Messages array is required" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    const apiKey = process.env.ANTHROPIC_API_KEY?.trim();
    if (!apiKey) {
      return new Response(JSON.stringify({ error: "ANTHROPIC_API_KEY not configured" }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      });
    }

    const anthropic = new Anthropic({ apiKey });

    // Create streaming response
    const stream = await anthropic.messages.stream({
      model: "claude-sonnet-4-5-20250514",
      max_tokens: 1024,
      system: systemPrompt || "Du är en hjälpsam assistent. Svara på svenska.",
      messages: messages.map((m) => ({
        role: m.role,
        content: m.content,
      })),
    });

    // Create a ReadableStream to return to the client
    const encoder = new TextEncoder();
    const readableStream = new ReadableStream({
      async start(controller) {
        try {
          for await (const event of stream) {
            if (event.type === "content_block_delta") {
              const delta = event.delta;
              if ("text" in delta) {
                // Send each text chunk as SSE
                const data = JSON.stringify({ text: delta.text });
                controller.enqueue(encoder.encode(`data: ${data}\n\n`));
              }
            } else if (event.type === "message_stop") {
              controller.enqueue(encoder.encode(`data: [DONE]\n\n`));
            }
          }
          controller.close();
        } catch (error) {
          console.error("Streaming error:", error);
          const errorMessage = error instanceof Error ? error.message : "Unknown error";
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({ error: errorMessage })}\n\n`));
          controller.close();
        }
      },
    });

    return new Response(readableStream, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
    });
  } catch (error) {
    console.error("Chat API error:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return new Response(JSON.stringify({ error: "Failed to process chat request", details: errorMessage }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
