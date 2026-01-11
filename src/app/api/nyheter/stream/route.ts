/**
 * Server-Sent Events (SSE) endpoint for real-time news updates
 *
 * Clients connect to this endpoint and receive push notifications
 * when new articles are synced.
 */

import { NextRequest } from "next/server";
import { auth } from "@/auth";

// Store connected clients per user
const clients = new Map<string, Set<ReadableStreamDefaultController>>();

// Add a client to the notification list
export function addClient(userId: string, controller: ReadableStreamDefaultController) {
  if (!clients.has(userId)) {
    clients.set(userId, new Set());
  }
  clients.get(userId)!.add(controller);
}

// Remove a client from the notification list
export function removeClient(userId: string, controller: ReadableStreamDefaultController) {
  const userClients = clients.get(userId);
  if (userClients) {
    userClients.delete(controller);
    if (userClients.size === 0) {
      clients.delete(userId);
    }
  }
}

// Notify all clients of a specific user about new articles
export function notifyNewArticles(userId: string, data: { count: number; latestId?: string }) {
  const userClients = clients.get(userId);
  if (userClients) {
    const message = `data: ${JSON.stringify({ type: "new_articles", ...data })}\n\n`;
    const encoder = new TextEncoder();

    userClients.forEach((controller) => {
      try {
        controller.enqueue(encoder.encode(message));
      } catch {
        // Client disconnected, will be cleaned up
      }
    });
  }
}

// Notify all connected clients (global broadcast)
export function notifyAllClients(data: { count: number; latestId?: string }) {
  const encoder = new TextEncoder();
  const message = `data: ${JSON.stringify({ type: "new_articles", ...data })}\n\n`;

  clients.forEach((userClients) => {
    userClients.forEach((controller) => {
      try {
        controller.enqueue(encoder.encode(message));
      } catch {
        // Client disconnected, will be cleaned up
      }
    });
  });
}

export async function GET(request: NextRequest) {
  // Check authentication
  const session = await auth();
  if (!session?.user?.id) {
    return new Response("Unauthorized", { status: 401 });
  }

  const userId = session.user.id;
  const encoder = new TextEncoder();

  // Create a readable stream for SSE
  const stream = new ReadableStream({
    start(controller) {
      // Add this client to the list
      addClient(userId, controller);

      // Send initial connection confirmation
      const connectMessage = `data: ${JSON.stringify({ type: "connected", userId })}\n\n`;
      controller.enqueue(encoder.encode(connectMessage));

      // Send heartbeat every 30 seconds to keep connection alive
      const heartbeatInterval = setInterval(() => {
        try {
          const heartbeat = `data: ${JSON.stringify({ type: "heartbeat", timestamp: Date.now() })}\n\n`;
          controller.enqueue(encoder.encode(heartbeat));
        } catch {
          clearInterval(heartbeatInterval);
        }
      }, 30000);

      // Cleanup on close
      request.signal.addEventListener("abort", () => {
        clearInterval(heartbeatInterval);
        removeClient(userId, controller);
        try {
          controller.close();
        } catch {
          // Already closed
        }
      });
    },
    cancel(...args: unknown[]) {
      // Called when stream is cancelled
      if (args[0]) {
        removeClient(userId, args[0] as ReadableStreamDefaultController);
      }
    },
  });

  // Return SSE response with proper headers
  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      "Connection": "keep-alive",
      "X-Accel-Buffering": "no", // Disable nginx buffering
    },
  });
}
