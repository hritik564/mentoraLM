import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Send } from "lucide-react";
import { Link } from "wouter";

const OPENING_MESSAGE =
  "Hey there! 👋 I'm Menti, your AI career counsellor. I'm here to help you figure out your path — whether you're confused about streams, careers, colleges, or just don't know where to start. What's on your mind?";

const CHIPS = [
  "Which stream should I choose?",
  "What career fits my interests?",
  "How do I prepare for JEE/NEET?",
  "Help me pick the right college",
];

const MAX_MESSAGES = 5;
const TYPEWRITER_SPEED = 25;

interface Message {
  role: "user" | "assistant";
  content: string;
}

function TypingDots() {
  return (
    <div
      className="flex items-center gap-1 px-4 py-3 w-fit"
      style={{ background: "#1A2440", borderRadius: "18px 18px 18px 4px" }}
    >
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          className="w-2 h-2 rounded-full bg-white/50 inline-block"
          style={{ animation: `menti-dot-pulse 1.4s ease-in-out ${i * 0.2}s infinite` }}
        />
      ))}
    </div>
  );
}

export function MentiSection() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const [inView, setInView] = useState(false);
  const [typewriterDone, setTypewriterDone] = useState(false);
  const [typewriterText, setTypewriterText] = useState("");
  const [chipsVisible, setChipsVisible] = useState(false);

  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [userCount, setUserCount] = useState(0);
  const [limitReached, setLimitReached] = useState(false);
  const [started, setStarted] = useState(false);

  // Intersection Observer — trigger once
  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setInView(true); obs.disconnect(); } },
      { threshold: 0.15 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  // Typewriter when in view
  useEffect(() => {
    if (!inView) return;
    let i = 0;
    const timer = setTimeout(() => {
      const id = setInterval(() => {
        i++;
        setTypewriterText(OPENING_MESSAGE.slice(0, i));
        if (i >= OPENING_MESSAGE.length) {
          clearInterval(id);
          setTypewriterDone(true);
          setTimeout(() => setChipsVisible(true), 200);
        }
      }, TYPEWRITER_SPEED);
      return () => clearInterval(id);
    }, 500);
    return () => clearTimeout(timer);
  }, [inView]);

  // Auto-scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }, [messages, isTyping]);

  const sendMessage = useCallback(async (text: string) => {
    if (!text.trim() || isTyping || limitReached) return;
    if (!started) setStarted(true);

    const newCount = userCount + 1;
    setUserCount(newCount);
    setChipsVisible(false);

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
      let content = "";

      setIsTyping(false);
      setMessages((prev) => [...prev, { role: "assistant", content: "" }]);

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        for (const line of decoder.decode(value, { stream: true }).split("\n")) {
          if (!line.startsWith("data: ")) continue;
          try {
            const data = JSON.parse(line.slice(6)) as { content?: string };
            if (data.content) {
              content += data.content;
              setMessages((prev) => {
                const updated = [...prev];
                updated[updated.length - 1] = { role: "assistant", content };
                return updated;
              });
            }
          } catch {}
        }
      }
    } catch {
      setIsTyping(false);
      setMessages((prev) => [...prev, {
        role: "assistant",
        content: "Oops, something went wrong. Please try again! 😊",
      }]);
    }

    if (newCount >= MAX_MESSAGES) setLimitReached(true);
  }, [isTyping, limitReached, messages, started, userCount]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage(input);
  };

  const handleKey = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(input); }
  };

  return (
    <>
      <style>{`
        @keyframes menti-dot-pulse {
          0%, 80%, 100% { opacity: 0.3; transform: scale(0.8); }
          40%            { opacity: 1;   transform: scale(1);   }
        }
        @keyframes menti-msg-in {
          from { opacity: 0; transform: translateY(10px); }
          to   { opacity: 1; transform: translateY(0);    }
        }
        .menti-msg { animation: menti-msg-in 0.3s ease-out both; }
        .menti-input:focus { border-color: #00A8FF !important; box-shadow: 0 0 0 3px rgba(0,168,255,0.15); }
        .menti-chip:hover { border-color: #00A8FF; }
        .menti-chip:hover span { background: linear-gradient(135deg,#00A8FF,#7B3FE4); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
        .menti-messages::-webkit-scrollbar { width: 4px; }
        .menti-messages::-webkit-scrollbar-track { background: transparent; }
        .menti-messages::-webkit-scrollbar-thumb { background: #1E2A45; border-radius: 4px; }
      `}</style>

      <section id="try-menti" ref={sectionRef} className="py-24 px-6">
        <div className="container mx-auto max-w-6xl">

          {/* Section header */}
          <motion.div
            className="text-center mb-12"
            initial={{ opacity: 0, y: 24 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5 }}
          >
            <div className="inline-flex items-center gap-2 bg-white/5 border border-white/10 rounded-full px-4 py-2 mb-6">
              <span className="w-2 h-2 rounded-full bg-[#00A8FF] inline-block" />
              <span className="text-sm font-medium text-white/80">Try Menti Free ✨</span>
            </div>
            <h2 className="text-3xl md:text-4xl font-extrabold text-white mb-4">
              Talk to Menti right now
            </h2>
            <p className="text-muted-foreground text-lg max-w-xl mx-auto">
              No signup needed. Ask anything about careers, streams, colleges, or exams — and see how Menti responds to you personally.
            </p>
          </motion.div>

          {/* Glow + chat container */}
          <motion.div
            className="relative mx-auto"
            style={{ maxWidth: 760 }}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={inView ? { opacity: 1, scale: 1 } : {}}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            {/* Radial glow */}
            <div
              className="absolute inset-0 pointer-events-none"
              style={{
                background: "radial-gradient(ellipse 70% 50% at 50% 100%, rgba(0,168,255,0.12), transparent)",
                borderRadius: 24,
                filter: "blur(20px)",
                transform: "translateY(20px)",
                zIndex: 0,
              }}
            />

            {/* Chat card */}
            <div
              className="relative z-10 flex flex-col overflow-hidden"
              style={{
                background: "#0F1628",
                border: "1px solid #1E2A45",
                borderRadius: 24,
                boxShadow: "0 20px 80px rgba(0,168,255,0.1)",
              }}
            >
              {/* Header */}
              <div
                className="flex items-center justify-between px-6 py-4 flex-shrink-0"
                style={{
                  background: "linear-gradient(135deg, rgba(0,168,255,0.08), rgba(123,63,228,0.08))",
                  borderBottom: "1px solid #1E2A45",
                }}
              >
                <div className="flex items-center gap-3">
                  <div
                    className="w-9 h-9 rounded-full flex items-center justify-center font-extrabold text-white text-base flex-shrink-0"
                    style={{ background: "linear-gradient(135deg, #00A8FF, #7B3FE4)" }}
                  >
                    M
                  </div>
                  <div>
                    <div className="text-white font-bold text-base leading-none">Menti</div>
                    <div className="flex items-center gap-1.5 mt-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block" />
                      <span className="text-emerald-400 text-[12px]">Online now</span>
                    </div>
                  </div>
                </div>
                <span className="text-[#6B7280] text-[12px] hidden sm:block">
                  5 free messages · No signup needed
                </span>
              </div>

              {/* Messages area */}
              <div
                className="menti-messages overflow-y-auto p-6 space-y-3 flex-shrink-0"
                style={{ height: "340px" }}
              >
                {/* Typewriter greeting (before first user message) */}
                {!started && typewriterText && (
                  <div className="flex justify-start menti-msg">
                    <div
                      className="text-sm text-white leading-relaxed"
                      style={{
                        background: "#1A2440",
                        borderRadius: "18px 18px 18px 4px",
                        padding: "12px 16px",
                        maxWidth: "75%",
                      }}
                    >
                      {typewriterText}
                      {!typewriterDone && (
                        <span className="inline-block w-0.5 h-4 bg-white/60 ml-0.5 align-middle animate-pulse" />
                      )}
                    </div>
                  </div>
                )}

                {/* Conversation messages (after first send) */}
                {started && messages.map((msg, i) => (
                  <div key={i} className={`flex menti-msg ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                    <div
                      className="text-sm text-white leading-relaxed"
                      style={{
                        background: msg.role === "user"
                          ? "linear-gradient(135deg, #00A8FF, #7B3FE4)"
                          : "#1A2440",
                        borderRadius: msg.role === "user"
                          ? "18px 18px 4px 18px"
                          : "18px 18px 18px 4px",
                        padding: "12px 16px",
                        maxWidth: msg.role === "user" ? "70%" : "75%",
                      }}
                    >
                      {msg.content}
                    </div>
                  </div>
                ))}

                {/* Typing indicator */}
                {isTyping && (
                  <div className="flex justify-start menti-msg">
                    <TypingDots />
                  </div>
                )}

                {/* Signup CTA card */}
                {limitReached && (
                  <div
                    className="menti-msg rounded-2xl p-5 text-center mt-2"
                    style={{
                      background: "linear-gradient(135deg, rgba(0,168,255,0.08), rgba(123,63,228,0.08))",
                      border: "1px solid rgba(0,168,255,0.27)",
                    }}
                  >
                    <div
                      className="w-10 h-10 rounded-full flex items-center justify-center font-extrabold text-white text-base mx-auto mb-3"
                      style={{ background: "linear-gradient(135deg, #00A8FF, #7B3FE4)" }}
                    >
                      M
                    </div>
                    <p className="text-white font-bold text-base mb-1">Want personalised advice just for you?</p>
                    <p className="text-white/60 text-sm mb-4 leading-relaxed">
                      Create your free account and Menti will remember your profile, your goals, and give you guidance that's actually built around YOUR life.
                    </p>
                    <div className="flex justify-center gap-2 flex-wrap mb-4">
                      {["✓ Free forever", "✓ 2 min setup", "✓ No card needed"].map((f) => (
                        <span
                          key={f}
                          className="text-xs text-white/70 px-3 py-1 rounded-full"
                          style={{ background: "#1A2440", border: "1px solid #2A3A5C" }}
                        >
                          {f}
                        </span>
                      ))}
                    </div>
                    <Link href="/auth/signup">
                      <button
                        className="w-full py-3 rounded-full text-white font-semibold text-sm transition-opacity hover:opacity-90"
                        style={{ background: "linear-gradient(135deg, #00A8FF, #7B3FE4)" }}
                      >
                        Start Your Free Journey →
                      </button>
                    </Link>
                  </div>
                )}

                <div ref={messagesEndRef} />
              </div>

              {/* Suggested chips */}
              <AnimatePresence>
                {chipsVisible && !started && (
                  <motion.div
                    className="px-6 pb-4 flex flex-wrap gap-2"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                  >
                    {CHIPS.map((chip, i) => (
                      <motion.button
                        key={chip}
                        initial={{ opacity: 0, y: 6 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.1 }}
                        className="menti-chip text-sm text-white/80 transition-colors"
                        style={{
                          background: "#1A2440",
                          border: "1px solid #2A3A5C",
                          borderRadius: 20,
                          padding: "8px 16px",
                          cursor: "pointer",
                        }}
                        onClick={() => sendMessage(chip)}
                      >
                        <span>{chip}</span>
                      </motion.button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Input area */}
              <div className="flex-shrink-0" style={{ borderTop: "1px solid #1E2A45" }}>
                <form onSubmit={handleSubmit} className="flex items-center gap-3 px-6 py-4">
                  <input
                    ref={inputRef}
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={handleKey}
                    placeholder={limitReached ? "Sign up free to keep chatting with Menti..." : "Ask Menti anything..."}
                    disabled={isTyping || limitReached}
                    className="menti-input flex-1 text-white text-sm placeholder:text-white/30 outline-none px-5 py-3 transition-all"
                    style={{
                      background: "#080C1A",
                      border: "1px solid #1E2A45",
                      borderRadius: 50,
                    }}
                  />
                  <button
                    type="submit"
                    disabled={!input.trim() || isTyping || limitReached}
                    className="w-11 h-11 rounded-full flex items-center justify-center flex-shrink-0 disabled:opacity-30 transition-opacity hover:opacity-85"
                    style={{ background: "linear-gradient(135deg, #00A8FF, #7B3FE4)" }}
                    aria-label="Send"
                  >
                    <Send className="w-4 h-4 text-white" />
                  </button>
                </form>

                {/* Message counter */}
                <div className="flex items-center justify-center gap-3 pb-4 text-xs text-[#6B7280]">
                  <span>{userCount} of {MAX_MESSAGES} free messages used</span>
                  <div className="flex gap-1.5">
                    {Array.from({ length: MAX_MESSAGES }).map((_, i) => (
                      <span
                        key={i}
                        className="w-2 h-2 rounded-full inline-block transition-all"
                        style={{
                          background: i < userCount
                            ? "linear-gradient(135deg, #00A8FF, #7B3FE4)"
                            : "#1E2A45",
                        }}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>
    </>
  );
}
