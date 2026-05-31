import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Send } from "lucide-react";
import { Link } from "wouter";

const OPENING_MESSAGE =
  "Hey there! 👋 I'm Menti, your AI career counsellor.\nI'm here to help you figure out your path — whether you're confused about streams, careers, colleges, or just don't know where to start.\nWhat's on your mind?";

const MAX_GUEST_MESSAGES = 5;

interface Message {
  role: "user" | "assistant";
  content: string;
}

export function MentiWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [userMessageCount, setUserMessageCount] = useState(0);
  const [isLimitReached, setIsLimitReached] = useState(false);
  const [hasOpened, setHasOpened] = useState(false);
  const [hasSeenLabel, setHasSeenLabel] = useState(() => {
    try {
      return localStorage.getItem("menti_widget_seen") === "true";
    } catch {
      return false;
    }
  });

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  useEffect(() => {
    if (isOpen && inputRef.current && !isLimitReached) {
      inputRef.current.focus();
    }
  }, [isOpen, isLimitReached]);

  const handleOpen = () => {
    setIsOpen(true);
    if (!hasSeenLabel) {
      setHasSeenLabel(true);
      try {
        localStorage.setItem("menti_widget_seen", "true");
      } catch {}
    }
    if (!hasOpened) {
      setHasOpened(true);
      setMessages([{ role: "assistant", content: OPENING_MESSAGE }]);
    }
  };

  const sendMessage = async (text: string) => {
    if (!text.trim() || isTyping || isLimitReached) return;

    const newCount = userMessageCount + 1;
    setUserMessageCount(newCount);

    const nextMessages: Message[] = [...messages, { role: "user", content: text }];
    setMessages(nextMessages);
    setInput("");
    setIsTyping(true);

    try {
      const res = await fetch("/api/chat/guest", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: nextMessages }),
      });

      if (!res.ok || !res.body) throw new Error("Request failed");

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let assistantContent = "";

      setIsTyping(false);
      setMessages((prev) => [...prev, { role: "assistant", content: "" }]);

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value, { stream: true });
        for (const line of chunk.split("\n")) {
          if (!line.startsWith("data: ")) continue;
          try {
            const data = JSON.parse(line.slice(6)) as { content?: string; done?: boolean; error?: string };
            if (data.content) {
              assistantContent += data.content;
              setMessages((prev) => {
                const updated = [...prev];
                updated[updated.length - 1] = { role: "assistant", content: assistantContent };
                return updated;
              });
            }
          } catch {}
        }
      }

      if (newCount >= MAX_GUEST_MESSAGES) {
        setIsLimitReached(true);
      }
    } catch {
      setIsTyping(false);
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "Oops, something went wrong. Please try again! 😊" },
      ]);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage(input);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage(input);
    }
  };

  return (
    <>
      <style>{`
        @keyframes menti-ring {
          0%   { box-shadow: 0 0 0 0   rgba(0,168,255,0.55); }
          70%  { box-shadow: 0 0 0 16px rgba(0,168,255,0);   }
          100% { box-shadow: 0 0 0 0   rgba(0,168,255,0);    }
        }
        @keyframes menti-dot-pulse {
          0%, 80%, 100% { opacity: 0.3; transform: scale(0.8); }
          40%            { opacity: 1;   transform: scale(1);   }
        }
      `}</style>

      {/* Mobile dark overlay */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            key="overlay"
            className="fixed inset-0 bg-black/50 z-[9998] md:hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Chat window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            key="chat"
            initial={{ opacity: 0, scale: 0.82, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.82, y: 12 }}
            transition={{ duration: 0.28, ease: "easeOut" }}
            className="fixed bottom-[96px] right-6 z-[9999] flex flex-col overflow-hidden"
            style={{
              width: "min(360px, 90vw)",
              height: "clamp(380px, 70vh, 480px)",
              background: "#0F1628",
              border: "1px solid #1E2A45",
              borderRadius: 20,
              boxShadow: "0 20px 60px rgba(0,0,0,0.5)",
              transformOrigin: "bottom right",
            }}
          >
            {/* Header */}
            <div
              className="flex items-center justify-between px-4 py-3 flex-shrink-0"
              style={{
                background: "linear-gradient(135deg, rgba(0,168,255,0.13), rgba(123,63,228,0.13))",
                borderBottom: "1px solid #1E2A45",
              }}
            >
              <div className="flex items-center gap-3">
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center font-extrabold text-white text-[15px] flex-shrink-0"
                  style={{ background: "linear-gradient(135deg, #00A8FF, #7B3FE4)" }}
                >
                  M
                </div>
                <div>
                  <div className="text-white font-bold text-sm leading-none">Menti</div>
                  <div className="flex items-center gap-1 mt-0.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block" />
                    <span className="text-emerald-400 text-[11px]">Online</span>
                  </div>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="text-white/50 hover:text-white transition-colors p-1 rounded-lg hover:bg-white/5"
                aria-label="Close"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {messages.map((msg, i) => (
                <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                  <div
                    className="max-w-[82%] px-4 py-2.5 text-sm text-white leading-relaxed whitespace-pre-wrap"
                    style={{
                      background:
                        msg.role === "user"
                          ? "linear-gradient(135deg, #00A8FF, #7B3FE4)"
                          : "#1A2440",
                      borderRadius:
                        msg.role === "user" ? "16px 16px 4px 16px" : "16px 16px 16px 4px",
                    }}
                  >
                    {msg.content}
                  </div>
                </div>
              ))}

              {/* Typing indicator */}
              {isTyping && (
                <div className="flex justify-start">
                  <div
                    className="flex items-center gap-1 px-4 py-3"
                    style={{ background: "#1A2440", borderRadius: "16px 16px 16px 4px" }}
                  >
                    {[0, 1, 2].map((i) => (
                      <span
                        key={i}
                        className="w-2 h-2 rounded-full bg-white/50 inline-block"
                        style={{
                          animation: `menti-dot-pulse 1.4s ease-in-out ${i * 0.2}s infinite`,
                        }}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Signup CTA card after limit */}
              {isLimitReached && (
                <div
                  className="rounded-xl p-4 mt-1"
                  style={{
                    background:
                      "linear-gradient(135deg, rgba(0,168,255,0.12), rgba(123,63,228,0.12))",
                    border: "1px solid rgba(0,168,255,0.27)",
                  }}
                >
                  <p className="text-white font-semibold text-sm mb-0.5">
                    Get personalised guidance from Menti
                  </p>
                  <p className="text-white/55 text-xs mb-3">Free • No credit card • 2 min setup</p>
                  <Link href="/auth/signup" onClick={() => setIsOpen(false)}>
                    <button
                      className="w-full py-2.5 rounded-xl text-white font-semibold text-sm transition-opacity hover:opacity-90"
                      style={{ background: "linear-gradient(135deg, #00A8FF, #7B3FE4)" }}
                    >
                      Create Free Account →
                    </button>
                  </Link>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Input area */}
            <div className="flex-shrink-0" style={{ borderTop: "1px solid #1E2A45" }}>
              {isLimitReached ? (
                <div className="px-4 py-3 text-center">
                  <Link
                    href="/auth/signup"
                    onClick={() => setIsOpen(false)}
                    className="text-sm font-semibold"
                    style={{
                      background: "linear-gradient(135deg, #00A8FF, #7B3FE4)",
                      WebkitBackgroundClip: "text",
                      WebkitTextFillColor: "transparent",
                    }}
                  >
                    Sign up free to continue chatting with Menti →
                  </Link>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="flex items-center gap-2 p-3">
                  <input
                    ref={inputRef}
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Ask Menti anything..."
                    disabled={isTyping}
                    className="flex-1 text-white text-sm placeholder:text-white/30 outline-none px-3 py-2 rounded-xl"
                    style={{ background: "#1A2440" }}
                  />
                  <button
                    type="submit"
                    disabled={!input.trim() || isTyping}
                    className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 disabled:opacity-35 transition-opacity"
                    style={{ background: "linear-gradient(135deg, #00A8FF, #7B3FE4)" }}
                    aria-label="Send"
                  >
                    <Send className="w-4 h-4 text-white" />
                  </button>
                </form>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating button + label */}
      <div className="fixed bottom-6 right-6 z-[9999] flex flex-col items-end gap-2">
        {/* "Chat with Menti ✨" label — hides after first open */}
        <AnimatePresence>
          {!hasSeenLabel && !isOpen && (
            <motion.div
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 4 }}
              className="text-white text-xs font-semibold px-3 py-1.5 rounded-full whitespace-nowrap select-none"
              style={{ background: "linear-gradient(135deg, #00A8FF, #7B3FE4)" }}
            >
              Chat with Menti ✨
            </motion.div>
          )}
        </AnimatePresence>

        {/* Circle button */}
        <motion.button
          onClick={handleOpen}
          whileHover={{ scale: 1.08 }}
          whileTap={{ scale: 0.93 }}
          className="relative w-[60px] h-[60px] rounded-full flex items-center justify-center text-white font-extrabold text-xl select-none"
          style={{
            background: "linear-gradient(135deg, #00A8FF, #7B3FE4)",
            boxShadow: "0 4px 20px rgba(0,168,255,0.4)",
            animation: "menti-ring 3s ease-out infinite",
          }}
          aria-label="Chat with Menti"
        >
          M
        </motion.button>
      </div>
    </>
  );
}
