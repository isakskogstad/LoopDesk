"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { MessageCircle, X, Send, Loader2, Search, Database, Globe, Building2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  toolsUsed?: string[];
}

// Tool name to Swedish label mapping
const TOOL_LABELS: Record<string, { label: string; icon: typeof Search }> = {
  search_companies: { label: "Söker företag", icon: Building2 },
  get_company_details: { label: "Hämtar företagsinfo", icon: Database },
  search_announcements: { label: "Söker kungörelser", icon: Search },
  get_news: { label: "Hämtar nyheter", icon: Globe },
  get_investors: { label: "Söker investerare", icon: Search },
  web_search: { label: "Söker på webben", icon: Globe },
  web_search_20250305: { label: "Söker på webben", icon: Globe },
};

export function ChatPanel() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [activeTool, setActiveTool] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, activeTool]);

  // Focus input when panel opens
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 300);
    }
  }, [isOpen]);

  // Close panel when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (panelRef.current && !panelRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  // Close on Escape key
  useEffect(() => {
    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
    }
    return () => document.removeEventListener("keydown", handleEscape);
  }, [isOpen]);

  const sendMessage = useCallback(async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input.trim(),
    };

    const assistantMessageId = (Date.now() + 1).toString();
    const toolsUsed: string[] = [];

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);
    setActiveTool(null);

    // Add empty assistant message that will be streamed into
    setMessages((prev) => [
      ...prev,
      {
        id: assistantMessageId,
        role: "assistant",
        content: "",
        toolsUsed: [],
      },
    ]);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [...messages, userMessage].map((m) => ({
            role: m.role,
            content: m.content,
          })),
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to send message");
      }

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();

      if (!reader) {
        throw new Error("No response body");
      }

      // Read the stream
      let buffer = "";
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() || "";

        for (const line of lines) {
          if (line.startsWith("data: ")) {
            const data = line.slice(6);
            if (data === "[DONE]") {
              setActiveTool(null);
              continue;
            }

            try {
              const parsed = JSON.parse(data);

              if (parsed.tool) {
                // Tool is being executed
                setActiveTool(parsed.tool);
                if (!toolsUsed.includes(parsed.tool)) {
                  toolsUsed.push(parsed.tool);
                  // Update the message with tools used
                  setMessages((prev) =>
                    prev.map((msg) =>
                      msg.id === assistantMessageId
                        ? { ...msg, toolsUsed: [...toolsUsed] }
                        : msg
                    )
                  );
                }
              } else if (parsed.text) {
                setActiveTool(null);
                // Update the assistant message with the new text chunk
                setMessages((prev) =>
                  prev.map((msg) =>
                    msg.id === assistantMessageId
                      ? { ...msg, content: msg.content + parsed.text }
                      : msg
                  )
                );
              } else if (parsed.error) {
                throw new Error(parsed.error);
              }
            } catch {
              // Ignore parse errors for incomplete chunks
            }
          }
        }
      }
    } catch {
      // Update the assistant message with error
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === assistantMessageId
            ? { ...msg, content: msg.content || "Något gick fel. Försök igen senare." }
            : msg
        )
      );
    } finally {
      setIsLoading(false);
      setActiveTool(null);
    }
  }, [input, isLoading, messages]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  // Simple markdown-like formatting
  const formatContent = (content: string) => {
    // Split by double newlines for paragraphs
    const paragraphs = content.split(/\n\n+/);

    return paragraphs.map((paragraph, pIndex) => {
      // Check for bullet points
      if (paragraph.includes("\n- ") || paragraph.startsWith("- ")) {
        const items = paragraph.split("\n").filter(Boolean);
        return (
          <ul key={pIndex} className="list-disc pl-4 space-y-1 my-2">
            {items.map((item, iIndex) => (
              <li key={iIndex}>{item.replace(/^- /, "")}</li>
            ))}
          </ul>
        );
      }

      // Check for numbered lists
      if (/^\d+\. /.test(paragraph)) {
        const items = paragraph.split("\n").filter(Boolean);
        return (
          <ol key={pIndex} className="list-decimal pl-4 space-y-1 my-2">
            {items.map((item, iIndex) => (
              <li key={iIndex}>{item.replace(/^\d+\. /, "")}</li>
            ))}
          </ol>
        );
      }

      // Check for headers (** at start)
      if (paragraph.startsWith("**") && paragraph.endsWith("**")) {
        return (
          <p key={pIndex} className="font-semibold mt-3 mb-1">
            {paragraph.slice(2, -2)}
          </p>
        );
      }

      // Regular paragraph with bold text support
      const parts = paragraph.split(/(\*\*[^*]+\*\*)/g);
      return (
        <p key={pIndex} className="my-1">
          {parts.map((part, partIndex) => {
            if (part.startsWith("**") && part.endsWith("**")) {
              return <strong key={partIndex}>{part.slice(2, -2)}</strong>;
            }
            return <span key={partIndex}>{part}</span>;
          })}
        </p>
      );
    });
  };

  return (
    <>
      {/* Chat button */}
      <button
        onClick={() => setIsOpen(true)}
        className={cn(
          "fixed bottom-6 right-6 z-50 flex items-center justify-center",
          "w-14 h-14 rounded-full bg-primary text-primary-foreground",
          "shadow-lg hover:shadow-xl transition-all duration-200",
          "hover:scale-105 active:scale-95",
          isOpen && "opacity-0 pointer-events-none"
        )}
        aria-label="Öppna chat"
      >
        <MessageCircle className="w-6 h-6" />
      </button>

      {/* Backdrop */}
      <div
        className={cn(
          "fixed inset-0 z-40 bg-black/20 backdrop-blur-sm transition-opacity duration-300",
          isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        )}
        aria-hidden="true"
      />

      {/* Chat panel */}
      <div
        ref={panelRef}
        className={cn(
          "fixed top-0 right-0 z-50 h-full w-full sm:w-[420px] max-w-full",
          "bg-background border-l border-border shadow-2xl",
          "flex flex-col transition-transform duration-300 ease-out",
          isOpen ? "translate-x-0" : "translate-x-full"
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-border">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
              <MessageCircle className="w-4 h-4 text-primary" />
            </div>
            <div>
              <h2 className="font-medium text-sm">LoopDesk Assistant</h2>
              <p className="text-xs text-muted-foreground">AI med databasåtkomst</p>
            </div>
          </div>
          <button
            onClick={() => setIsOpen(false)}
            className="p-2 rounded-lg hover:bg-secondary transition-colors"
            aria-label="Stäng chat"
          >
            <X className="w-5 h-5 text-muted-foreground" />
          </button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.length === 0 && (
            <div className="text-center py-8">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <MessageCircle className="w-6 h-6 text-primary" />
              </div>
              <h3 className="font-medium mb-2">Hej!</h3>
              <p className="text-sm text-muted-foreground max-w-[280px] mx-auto mb-4">
                Jag kan hjälpa dig med företagsinfo, nyheter, kungörelser och investerare.
              </p>
              <div className="flex flex-wrap justify-center gap-2 text-xs">
                <button
                  onClick={() => setInput("Vilka cleantech-bolag finns i Stockholm?")}
                  className="px-3 py-1.5 rounded-full bg-secondary hover:bg-secondary/80 transition-colors"
                >
                  Cleantech i Stockholm
                </button>
                <button
                  onClick={() => setInput("Visa senaste kungörelserna")}
                  className="px-3 py-1.5 rounded-full bg-secondary hover:bg-secondary/80 transition-colors"
                >
                  Senaste kungörelser
                </button>
                <button
                  onClick={() => setInput("Vilka VC:s investerar i impact?")}
                  className="px-3 py-1.5 rounded-full bg-secondary hover:bg-secondary/80 transition-colors"
                >
                  Impact-investerare
                </button>
              </div>
            </div>
          )}

          {messages.map((message) => (
            <div
              key={message.id}
              className={cn(
                "flex",
                message.role === "user" ? "justify-end" : "justify-start"
              )}
            >
              <div
                className={cn(
                  "max-w-[90%] rounded-2xl px-4 py-2.5 text-sm",
                  message.role === "user"
                    ? "bg-primary text-primary-foreground rounded-br-md"
                    : "bg-secondary text-foreground rounded-bl-md"
                )}
              >
                {/* Tools used indicator */}
                {message.role === "assistant" && message.toolsUsed && message.toolsUsed.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mb-2 pb-2 border-b border-border/50">
                    {message.toolsUsed.map((tool) => {
                      const toolInfo = TOOL_LABELS[tool] || { label: tool, icon: Search };
                      const Icon = toolInfo.icon;
                      return (
                        <span
                          key={tool}
                          className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-background/50 text-xs text-muted-foreground"
                        >
                          <Icon className="w-3 h-3" />
                          {toolInfo.label}
                        </span>
                      );
                    })}
                  </div>
                )}

                {message.role === "user" ? (
                  <p className="whitespace-pre-wrap">{message.content}</p>
                ) : (
                  <div className="prose prose-sm dark:prose-invert max-w-none">
                    {formatContent(message.content)}
                  </div>
                )}
              </div>
            </div>
          ))}

          {/* Active tool indicator */}
          {activeTool && (
            <div className="flex justify-start">
              <div className="bg-secondary rounded-2xl rounded-bl-md px-4 py-3 flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin text-primary" />
                <span className="text-sm text-muted-foreground">
                  {TOOL_LABELS[activeTool]?.label || activeTool}...
                </span>
              </div>
            </div>
          )}

          {/* Loading indicator (no tool active) */}
          {isLoading && !activeTool && messages[messages.length - 1]?.content === "" && (
            <div className="flex justify-start">
              <div className="bg-secondary rounded-2xl rounded-bl-md px-4 py-3">
                <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="p-4 border-t border-border">
          <div className="flex items-end gap-2">
            <textarea
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Fråga om företag, nyheter, investerare..."
              rows={1}
              className={cn(
                "flex-1 resize-none rounded-xl border border-border bg-secondary/50",
                "px-4 py-3 text-sm placeholder:text-muted-foreground",
                "focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary",
                "max-h-32 min-h-[48px]"
              )}
              style={{
                height: "auto",
                minHeight: "48px",
              }}
              onInput={(e) => {
                const target = e.target as HTMLTextAreaElement;
                target.style.height = "auto";
                target.style.height = Math.min(target.scrollHeight, 128) + "px";
              }}
            />
            <button
              onClick={sendMessage}
              disabled={!input.trim() || isLoading}
              className={cn(
                "flex items-center justify-center w-12 h-12 rounded-xl",
                "bg-primary text-primary-foreground",
                "hover:bg-primary/90 transition-colors",
                "disabled:opacity-50 disabled:cursor-not-allowed"
              )}
              aria-label="Skicka meddelande"
            >
              <Send className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
