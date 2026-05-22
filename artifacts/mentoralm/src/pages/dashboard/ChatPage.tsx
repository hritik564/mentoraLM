import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { useGetChatMessages, useNewChat, useGetProfile, useListServices } from "@workspace/api-client-react";
import { useAuth } from "@/lib/auth";
import { toast } from "sonner";
import { Send, RotateCcw, Bot, User, Sparkles, ChevronRight } from "lucide-react";
import { Link } from "wouter";
import type { Service } from "@workspace/api-client-react";

interface Message {
  id?: number;
  role: "user" | "assistant";
  content: string;
  streaming?: boolean;
  isFirst?: boolean;
  recommendedService?: Service;
}

/**
 * Detect the [Book a Session] marker that the system prompt instructs the AI
 * to output when deep personalised mentoring is needed.  When found, pair the
 * response with a recommended service card.
 */
function detectRecommendedService(text: string, services: Service[]): Service | undefined {
  if (!services.length) return undefined;
  // Primary signal: explicit [Book a Session] marker in the AI response
  if (text.includes("[Book a Session]")) {
    // Try to find a service name mentioned nearby
    const lower = text.toLowerCase();
    for (const service of services) {
      if (lower.includes(service.title.toLowerCase())) {
        return service;
      }
    }
    // Fall back to first published service
    return services.find((s) => s.status === "published") ?? services[0];
  }
  return undefined;
}

function RecommendedServiceCard({ service }: { service: Service }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="mt-3 rounded-xl border border-primary/30 bg-primary/5 p-4 flex items-center justify-between gap-3"
    >
      <div className="min-w-0">
        <p className="text-[11px] text-primary font-semibold uppercase tracking-wider mb-1">Recommended session</p>
        <p className="text-white text-sm font-semibold truncate">{service.title}</p>
        <p className="text-muted-foreground text-xs mt-0.5">₹{service.price.toLocaleString("en-IN")} · {service.duration} min</p>
      </div>
      <Link href={`/services/${service.id}`}>
        <Button size="sm" className="bg-gradient-primary border-0 flex-shrink-0 text-xs h-8">
          View
          <ChevronRight className="w-3 h-3 ml-1" />
        </Button>
      </Link>
    </motion.div>
  );
}

export default function ChatPage() {
  const { token } = useAuth();
  const tokenRef = useRef(token);
  useEffect(() => { tokenRef.current = token; }, [token]);

  const { data: history, refetch } = useGetChatMessages();
  const { data: profile } = useGetProfile();
  const { data: services } = useListServices();
  const newChatMutation = useNewChat();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const [isNewSession, setIsNewSession] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const completionPercent = profile?.completionPercent ?? 0;
  const hasProfile = completionPercent >= 30;

  useEffect(() => {
    if (history) {
      setMessages(history.map((m) => ({ id: m.id, role: m.role as "user" | "assistant", content: m.content })));
      setIsNewSession(false);
    }
  }, [history]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = useCallback(async () => {
    if (!input.trim() || isStreaming) return;
    const userMsg: Message = { role: "user", content: input.trim() };
    const isFirstEverMessage = messages.length === 0;
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsStreaming(true);

    const assistantMsg: Message = {
      role: "assistant",
      content: "",
      streaming: true,
      isFirst: isFirstEverMessage && hasProfile,
    };
    setMessages((prev) => [...prev, assistantMsg]);

    try {
      // Always use the freshest token from the ref (avoids stale closure issues)
      const currentToken = tokenRef.current;
      const res = await fetch("/api/chat/stream", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(currentToken ? { Authorization: `Bearer ${currentToken}` } : {}),
        },
        body: JSON.stringify({ content: userMsg.content }),
      });

      if (!res.ok) throw new Error("Failed to connect");
      if (!res.body) throw new Error("No response body");

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let accumulated = "";
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });

        // Process complete SSE frames (delimited by \n\n)
        const frames = buffer.split("\n\n");
        buffer = frames.pop() ?? "";

        for (const frame of frames) {
          for (const line of frame.split("\n")) {
            if (!line.startsWith("data: ")) continue;
            const data = line.slice(6).trim();
            if (data === "[DONE]") break;
            try {
              const parsed = JSON.parse(data);
              // Backend emits { content: "..." } chunks and { done: true } at end
              if (parsed.content) {
                accumulated += parsed.content;
                setMessages((prev) => {
                  const updated = [...prev];
                  const last = updated[updated.length - 1];
                  updated[updated.length - 1] = { ...last, content: accumulated, streaming: true };
                  return updated;
                });
              }
            } catch {
              // ignore malformed SSE lines
            }
          }
        }
      }

      // Detect [Book a Session] marker and strip it from the display text
      const recommendedService = detectRecommendedService(accumulated, services ?? []);
      const displayContent = accumulated.replace(/\[Book a Session\]/g, "").trim();

      setMessages((prev) => {
        const updated = [...prev];
        const last = updated[updated.length - 1];
        updated[updated.length - 1] = {
          ...last,
          content: displayContent,
          streaming: false,
          recommendedService,
        };
        return updated;
      });
    } catch {
      toast.error("Failed to get response. Please try again.");
      setMessages((prev) => prev.slice(0, -1));
    } finally {
      setIsStreaming(false);
    }
  }, [input, isStreaming, hasProfile, services]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const startNewChat = () => {
    newChatMutation.mutate(undefined, {
      onSuccess: () => {
        setMessages([]);
        setIsNewSession(true);
        refetch();
      },
    });
  };

  return (
    <DashboardLayout>
      <div className="max-w-3xl mx-auto h-[calc(100vh-8rem)] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between mb-6 flex-shrink-0">
          <div>
            <h1 className="text-2xl font-extrabold text-white">AI Counsellor</h1>
            <p className="text-muted-foreground text-sm">Powered by Claude. Knows your full profile.</p>
          </div>
          <Button
            variant="outline"
            size="sm"
            className="border-border text-muted-foreground hover:text-white"
            onClick={startNewChat}
            disabled={newChatMutation.isPending}
            data-testid="new-chat-btn"
          >
            <RotateCcw className="w-4 h-4 mr-2" />
            New Chat
          </Button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto space-y-6 pb-4 pr-1 scrollbar-thin">
          {messages.length === 0 && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-16">
              <div className="w-16 h-16 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center mx-auto mb-4">
                <Bot className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-white font-bold text-lg mb-2">Hello! I'm your AI career counsellor</h3>
              <p className="text-muted-foreground text-sm max-w-sm mx-auto">
                {hasProfile
                  ? "I've read your profile and I'm ready to help. Ask me about streams, colleges, exams, careers — anything."
                  : "Ask me anything about careers, streams, or exams. Complete your profile for personalised advice."}
              </p>
              {!isNewSession && (
                <div className="flex flex-wrap gap-2 justify-center mt-6">
                  {[
                    "Which stream should I choose?",
                    "Help me with college selection",
                    "What career fits my interests?",
                    "How to prepare for JEE?",
                  ].map((prompt) => (
                    <button
                      key={prompt}
                      onClick={() => { setInput(prompt); textareaRef.current?.focus(); }}
                      className="px-4 py-2 rounded-xl bg-card border border-border text-muted-foreground hover:text-white hover:border-primary/40 text-sm transition-colors"
                    >
                      {prompt}
                    </button>
                  ))}
                </div>
              )}
            </motion.div>
          )}

          <AnimatePresence initial={false}>
            {messages.map((msg, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                className={`flex gap-3 ${msg.role === "user" ? "flex-row-reverse" : "flex-row"}`}
              >
                <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                  msg.role === "user" ? "bg-primary/20" : "bg-[#7B3FE4]/20"
                }`}>
                  {msg.role === "user"
                    ? <User className="w-4 h-4 text-primary" />
                    : <Bot className="w-4 h-4 text-[#7B3FE4]" />
                  }
                </div>
                <div className="max-w-[78%] flex flex-col gap-1">
                  {/* Profile-based badge for first AI reply */}
                  {msg.role === "assistant" && msg.isFirst && (
                    <span className="flex items-center gap-1.5 text-[11px] text-[#00A8FF] font-semibold mb-0.5">
                      <Sparkles className="w-3 h-3" />
                      Based on your profile
                    </span>
                  )}
                  <div className={`px-4 py-3 rounded-2xl text-sm leading-relaxed ${
                    msg.role === "user"
                      ? "bg-primary/20 text-white rounded-tr-sm"
                      : "bg-card border border-border text-white/90 rounded-tl-sm"
                  }`}>
                    <span className="whitespace-pre-wrap">{msg.content}</span>
                    {msg.streaming && (
                      <span className="inline-flex gap-1 ml-2">
                        {[0, 1, 2].map((j) => (
                          <motion.span
                            key={j}
                            className="w-1.5 h-1.5 rounded-full bg-primary inline-block"
                            animate={{ opacity: [0.3, 1, 0.3] }}
                            transition={{ duration: 1.2, repeat: Infinity, delay: j * 0.2 }}
                          />
                        ))}
                      </span>
                    )}
                  </div>
                  {/* Recommended service card */}
                  {msg.role === "assistant" && !msg.streaming && msg.recommendedService && (
                    <RecommendedServiceCard service={msg.recommendedService} />
                  )}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
          <div ref={bottomRef} />
        </div>

        {/* Input */}
        <div className="flex-shrink-0 pt-4 border-t border-border">
          <div className="flex gap-3 items-end">
            <div className="flex-1 relative">
              <textarea
                ref={textareaRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask your AI counsellor anything..."
                rows={1}
                disabled={isStreaming}
                data-testid="chat-input"
                className="w-full bg-card border border-border rounded-xl px-4 py-3 text-white text-sm placeholder:text-muted-foreground resize-none focus:outline-none focus:border-primary/50 disabled:opacity-50 max-h-32 overflow-y-auto"
                style={{ lineHeight: "1.5" }}
                onInput={(e) => {
                  const el = e.currentTarget;
                  el.style.height = "auto";
                  el.style.height = Math.min(el.scrollHeight, 128) + "px";
                }}
              />
            </div>
            <Button
              onClick={sendMessage}
              disabled={!input.trim() || isStreaming}
              className="bg-gradient-primary border-0 hover:opacity-90 h-[46px] w-[46px] p-0 flex-shrink-0 rounded-xl"
              data-testid="send-message-btn"
            >
              <Send className="w-4 h-4" />
            </Button>
          </div>
          <p className="text-xs text-muted-foreground mt-2 text-center">
            Press Enter to send, Shift+Enter for new line
          </p>
        </div>
      </div>
    </DashboardLayout>
  );
}
