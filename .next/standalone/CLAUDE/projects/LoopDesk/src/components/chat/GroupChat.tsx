"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { Send, Hash, Users, Smile, Paperclip, MoreVertical } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";
import { sv } from "date-fns/locale";

interface User {
  id: string;
  name: string | null;
  image: string | null;
}

interface Message {
  id: string;
  content: string;
  createdAt: string;
  user: User;
}

interface Room {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  image: string | null;
}

interface GroupChatProps {
  room: Room;
  currentUser: User;
  initialMessages?: Message[];
}

// Generate avatar color from name
function getAvatarColor(name: string): string {
  const colors = [
    "bg-rose-500",
    "bg-orange-500",
    "bg-amber-500",
    "bg-emerald-500",
    "bg-teal-500",
    "bg-cyan-500",
    "bg-blue-500",
    "bg-indigo-500",
    "bg-violet-500",
    "bg-purple-500",
    "bg-pink-500",
  ];
  const hash = name.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return colors[hash % colors.length];
}

// Get initials from name
function getInitials(name: string | null): string {
  if (!name) return "?";
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

export function GroupChat({ room, currentUser, initialMessages = [] }: GroupChatProps) {
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [onlineCount] = useState(Math.floor(Math.random() * 5) + 1); // Simulated
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Focus input on mount
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  // Load messages
  useEffect(() => {
    async function loadMessages() {
      try {
        const res = await fetch(`/api/chat/rooms/${room.slug}/messages`);
        if (res.ok) {
          const data = await res.json();
          setMessages(data.messages || []);
        }
      } catch (err) {
        console.error("Failed to load messages:", err);
      }
    }
    loadMessages();

    // Poll for new messages every 3 seconds
    const interval = setInterval(loadMessages, 3000);
    return () => clearInterval(interval);
  }, [room.slug]);

  const sendMessage = useCallback(async () => {
    if (!input.trim() || isLoading) return;

    const content = input.trim();
    setInput("");
    setIsLoading(true);

    // Optimistic update
    const optimisticMessage: Message = {
      id: `temp-${Date.now()}`,
      content,
      createdAt: new Date().toISOString(),
      user: currentUser,
    };
    setMessages((prev) => [...prev, optimisticMessage]);

    try {
      const res = await fetch(`/api/chat/rooms/${room.slug}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content }),
      });

      if (res.ok) {
        const data = await res.json();
        // Replace optimistic message with real one
        setMessages((prev) =>
          prev.map((m) => (m.id === optimisticMessage.id ? data.message : m))
        );
      } else {
        // Remove optimistic message on error
        setMessages((prev) => prev.filter((m) => m.id !== optimisticMessage.id));
      }
    } catch (err) {
      console.error("Failed to send message:", err);
      setMessages((prev) => prev.filter((m) => m.id !== optimisticMessage.id));
    } finally {
      setIsLoading(false);
    }
  }, [input, isLoading, room.slug, currentUser]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  // Group messages by date
  const groupedMessages = messages.reduce(
    (groups, message) => {
      const date = new Date(message.createdAt).toDateString();
      if (!groups[date]) {
        groups[date] = [];
      }
      groups[date].push(message);
      return groups;
    },
    {} as Record<string, Message[]>
  );

  return (
    <div className="flex h-screen flex-col bg-white dark:bg-zinc-900">
      {/* Header */}
      <header className="flex items-center justify-between border-b border-zinc-200 px-6 py-3 dark:border-zinc-800">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-violet-500/10 text-violet-500">
            <Hash className="h-5 w-5" />
          </div>
          <div>
            <h1 className="font-semibold text-zinc-900 dark:text-zinc-100">
              {room.name}
            </h1>
            {room.description && (
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                {room.description}
              </p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5 text-sm text-zinc-500">
            <Users className="h-4 w-4" />
            <span>{onlineCount} online</span>
          </div>
          <button className="rounded-lg p-2 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-600 dark:hover:bg-zinc-800 dark:hover:text-zinc-300">
            <MoreVertical className="h-5 w-5" />
          </button>
        </div>
      </header>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-6 py-4">
        {Object.entries(groupedMessages).map(([date, dateMessages]) => (
          <div key={date}>
            {/* Date divider */}
            <div className="my-6 flex items-center gap-4">
              <div className="h-px flex-1 bg-zinc-200 dark:bg-zinc-800" />
              <span className="text-xs font-medium text-zinc-400">
                {new Date(date).toLocaleDateString("sv-SE", {
                  weekday: "long",
                  day: "numeric",
                  month: "long",
                })}
              </span>
              <div className="h-px flex-1 bg-zinc-200 dark:bg-zinc-800" />
            </div>

            {/* Messages for this date */}
            {dateMessages.map((message, i) => {
              const prevMessage = dateMessages[i - 1];
              const showAvatar =
                !prevMessage || prevMessage.user.id !== message.user.id;
              const isCurrentUser = message.user.id === currentUser.id;

              return (
                <div
                  key={message.id}
                  className={cn(
                    "group flex gap-3",
                    showAvatar ? "mt-4" : "mt-0.5"
                  )}
                >
                  {/* Avatar */}
                  <div className="w-9 flex-shrink-0">
                    {showAvatar && (
                      <>
                        {message.user.image ? (
                          <img
                            src={message.user.image}
                            alt={message.user.name || ""}
                            className="h-9 w-9 rounded-lg object-cover"
                          />
                        ) : (
                          <div
                            className={cn(
                              "flex h-9 w-9 items-center justify-center rounded-lg text-sm font-medium text-white",
                              getAvatarColor(message.user.name || "")
                            )}
                          >
                            {getInitials(message.user.name)}
                          </div>
                        )}
                      </>
                    )}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    {showAvatar && (
                      <div className="mb-0.5 flex items-baseline gap-2">
                        <span
                          className={cn(
                            "font-semibold",
                            isCurrentUser
                              ? "text-violet-600 dark:text-violet-400"
                              : "text-zinc-900 dark:text-zinc-100"
                          )}
                        >
                          {message.user.name || "Anonym"}
                        </span>
                        <span className="text-xs text-zinc-400">
                          {formatDistanceToNow(new Date(message.createdAt), {
                            addSuffix: true,
                            locale: sv,
                          })}
                        </span>
                      </div>
                    )}
                    <p className="whitespace-pre-wrap break-words text-zinc-700 dark:text-zinc-300">
                      {message.content}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        ))}

        {messages.length === 0 && (
          <div className="flex h-full items-center justify-center">
            <div className="text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-violet-500/10 text-violet-500">
                <Hash className="h-8 w-8" />
              </div>
              <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
                Välkommen till #{room.name}
              </h2>
              <p className="mt-1 text-sm text-zinc-500">
                Detta är början på konversationen. Skriv något!
              </p>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="border-t border-zinc-200 px-6 py-4 dark:border-zinc-800">
        <div className="flex items-end gap-2 rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-3 focus-within:border-violet-500 focus-within:ring-2 focus-within:ring-violet-500/20 dark:border-zinc-700 dark:bg-zinc-800">
          <button className="flex-shrink-0 rounded-lg p-1.5 text-zinc-400 hover:bg-zinc-200 hover:text-zinc-600 dark:hover:bg-zinc-700 dark:hover:text-zinc-300">
            <Paperclip className="h-5 w-5" />
          </button>
          <textarea
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={`Meddelande #${room.name}...`}
            rows={1}
            className="max-h-32 min-h-[24px] flex-1 resize-none bg-transparent text-zinc-900 placeholder-zinc-400 focus:outline-none dark:text-zinc-100"
            style={{
              height: "auto",
              overflow: "hidden",
            }}
            onInput={(e) => {
              const target = e.target as HTMLTextAreaElement;
              target.style.height = "auto";
              target.style.height = `${Math.min(target.scrollHeight, 128)}px`;
            }}
          />
          <button className="flex-shrink-0 rounded-lg p-1.5 text-zinc-400 hover:bg-zinc-200 hover:text-zinc-600 dark:hover:bg-zinc-700 dark:hover:text-zinc-300">
            <Smile className="h-5 w-5" />
          </button>
          <button
            onClick={sendMessage}
            disabled={!input.trim() || isLoading}
            className={cn(
              "flex-shrink-0 rounded-lg p-1.5 transition-colors",
              input.trim() && !isLoading
                ? "bg-violet-500 text-white hover:bg-violet-600"
                : "text-zinc-300 dark:text-zinc-600"
            )}
          >
            <Send className="h-5 w-5" />
          </button>
        </div>
        <p className="mt-2 text-center text-xs text-zinc-400">
          Tryck Enter för att skicka, Shift+Enter för ny rad
        </p>
      </div>
    </div>
  );
}
