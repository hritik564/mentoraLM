import { useEffect, useRef, useState } from "react";
import { Link } from "wouter";
import { motion, useInView, AnimatePresence } from "framer-motion";
import { usePageMeta } from "@/lib/usePageMeta";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { useListServices } from "@workspace/api-client-react";
import { Brain, MessageSquare, Compass, Calendar, Star, ChevronRight, Users, Award, CheckCircle, Clock, Plus } from "lucide-react";
import { MentiSection } from "@/components/MentiSection";

const CYCLE_WORDS = ["Engineering", "Medicine", "Commerce", "Law", "Design", "Business"];
const LONGEST_WORD = CYCLE_WORDS.reduce((a, b) => (a.length >= b.length ? a : b), "");
const TYPE_SPEED = 60;
const ERASE_SPEED = 40;
const PAUSE_AFTER_TYPE = 1600;
const PAUSE_AFTER_ERASE = 200;

function CyclingWord() {
  const [wordIdx, setWordIdx] = useState(0);
  const [displayed, setDisplayed] = useState("");
  const [phase, setPhase] = useState<"typing" | "pausing" | "erasing" | "switching">("typing");

  useEffect(() => {
    const word = CYCLE_WORDS[wordIdx];
    let timeout: ReturnType<typeof setTimeout>;

    if (phase === "typing") {
      if (displayed.length < word.length) {
        timeout = setTimeout(() => setDisplayed(word.slice(0, displayed.length + 1)), TYPE_SPEED);
      } else {
        timeout = setTimeout(() => setPhase("pausing"), PAUSE_AFTER_TYPE);
      }
    } else if (phase === "pausing") {
      setPhase("erasing");
    } else if (phase === "erasing") {
      if (displayed.length > 0) {
        timeout = setTimeout(() => setDisplayed(displayed.slice(0, -1)), ERASE_SPEED);
      } else {
        timeout = setTimeout(() => setPhase("switching"), PAUSE_AFTER_ERASE);
      }
    } else if (phase === "switching") {
      setWordIdx((i) => (i + 1) % CYCLE_WORDS.length);
      setPhase("typing");
    }

    return () => clearTimeout(timeout);
  }, [phase, displayed, wordIdx]);

  return (
    <span
      className="relative inline-block"
      style={{ minWidth: `${LONGEST_WORD.length * 0.6}em` }}
    >
      <span
        style={{
          background: "linear-gradient(135deg, #00A8FF, #7B3FE4)",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
          backgroundClip: "text",
          color: "transparent",
        }}
      >
        {displayed}
      </span>
      <span
        className="animate-pulse"
        style={{
          WebkitTextFillColor: "#00A8FF",
          color: "#00A8FF",
        }}
      >
        |
      </span>
    </span>
  );
}

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: (i = 0) => ({ opacity: 1, y: 0, transition: { delay: i * 0.1, duration: 0.5 } }),
};

const howItWorksSteps = [
  { icon: Users, title: "Complete your profile", desc: "Tell us about your background, interests, and goals in 6 quick steps.", step: "01" },
  { icon: MessageSquare, title: "Chat with Menti", desc: "Menti reads your profile and counsels you like someone who's known you for years.", step: "02" },
  { icon: Compass, title: "Get your roadmap", desc: "A personalised 5-year career plan built around your unique strengths.", step: "03" },
  { icon: Calendar, title: "Book an expert session", desc: "Connect with our human counsellors for complex decisions.", step: "04" },
];

function HowItWorksSection() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const [triggered, setTriggered] = useState(false);
  const [activeSteps, setActiveSteps] = useState([false, false, false, false]);
  const [activeLines, setActiveLines] = useState([false, false, false]);

  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !triggered) {
          setTriggered(true);
          [0, 1, 2, 3].forEach((i) => {
            setTimeout(() => setActiveSteps((s) => { const n = [...s]; n[i] = true; return n; }), i * 600);
            if (i < 3) setTimeout(() => setActiveLines((l) => { const n = [...l]; n[i] = true; return n; }), i * 600 + 300);
          });
        }
      },
      { threshold: 0.2 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [triggered]);

  const gradientText = {
    background: "linear-gradient(135deg, #00A8FF, #7B3FE4)",
    WebkitBackgroundClip: "text" as const,
    WebkitTextFillColor: "transparent" as const,
    backgroundClip: "text" as const,
  };

  return (
    <section ref={sectionRef} className="py-24 px-6 bg-white/2 border-y border-white/5">
      <div className="container mx-auto max-w-6xl">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-extrabold text-white mb-4">How MentoraLM works</h2>
          <p className="text-muted-foreground max-w-xl mx-auto">From sign-up to clarity in four steps.</p>
        </div>

        {/* Desktop layout */}
        <div className="hidden md:flex items-start">
          {howItWorksSteps.map((step, i) => {
            const active = activeSteps[i];
            const Icon = step.icon;
            return (
              <div key={i} className="contents">
                <div
                  className="flex-1 flex flex-col items-center text-center px-4"
                  style={{
                    filter: active ? "drop-shadow(0 4px 20px rgba(0,168,255,0.15))" : "none",
                    transition: "filter 0.6s ease",
                  }}
                >
                  <div
                    className="text-[56px] font-extrabold leading-none mb-3"
                    style={active ? gradientText : { color: "#1E2A45", transition: "color 0.4s ease" }}
                  >
                    {step.step}
                  </div>
                  <div
                    className="w-14 h-14 rounded-xl flex items-center justify-center mb-4"
                    style={{
                      background: active
                        ? "linear-gradient(135deg, rgba(0,168,255,0.13), rgba(123,63,228,0.13))"
                        : "#0F1628",
                      border: active ? "1px solid rgba(0,168,255,0.4)" : "1px solid #1E2A45",
                      transition: "all 0.4s ease",
                    }}
                  >
                    <Icon
                      className="w-6 h-6"
                      style={{
                        color: active ? "#00A8FF" : "#2A3A5C",
                        animation: active ? "pulse-icon 2s ease-in-out infinite" : "none",
                        transition: "color 0.4s ease",
                      }}
                    />
                  </div>
                  <h3
                    className="text-base font-bold mb-2"
                    style={{ color: active ? "#ffffff" : "#4A5568", transition: "color 0.4s ease" }}
                  >
                    {step.title}
                  </h3>
                  <p
                    className="text-sm leading-relaxed"
                    style={{ color: active ? "#8888AA" : "#4A5568", transition: "color 0.4s ease" }}
                  >
                    {step.desc}
                  </p>
                </div>

                {i < 3 && (
                  <div className="flex-shrink-0 w-16 flex items-start pt-[44px]">
                    <div className="relative w-full h-[2px] bg-[#1E2A45] overflow-hidden rounded-full">
                      <div
                        style={{
                          position: "absolute",
                          top: 0,
                          left: 0,
                          height: "100%",
                          width: activeLines[i] ? "100%" : "0%",
                          background: "linear-gradient(90deg, #00A8FF, #7B3FE4)",
                          boxShadow: activeLines[i] ? "0 0 8px rgba(0,168,255,0.6)" : "none",
                          transition: "width 600ms ease, box-shadow 600ms ease",
                        }}
                      />
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Mobile layout — vertical timeline */}
        <div className="md:hidden flex flex-col">
          {howItWorksSteps.map((step, i) => {
            const active = activeSteps[i];
            const Icon = step.icon;
            return (
              <div key={i} className="flex gap-4">
                {/* Timeline column */}
                <div className="flex flex-col items-center flex-shrink-0 w-6">
                  <div
                    className="w-3 h-3 rounded-full mt-5 flex-shrink-0"
                    style={{
                      background: active ? "linear-gradient(135deg, #00A8FF, #7B3FE4)" : "#1E2A45",
                      boxShadow: active ? "0 0 8px rgba(0,168,255,0.6)" : "none",
                      transition: "all 0.4s ease",
                    }}
                  />
                  {i < 3 && (
                    <div
                      className="relative flex-1 w-[2px] bg-[#1E2A45] overflow-hidden my-1"
                      style={{ minHeight: 64 }}
                    >
                      <div
                        style={{
                          position: "absolute",
                          top: 0,
                          left: 0,
                          width: "100%",
                          height: activeLines[i] ? "100%" : "0%",
                          background: "linear-gradient(180deg, #00A8FF, #7B3FE4)",
                          boxShadow: activeLines[i] ? "0 0 8px rgba(0,168,255,0.6)" : "none",
                          transition: "height 600ms ease, box-shadow 600ms ease",
                        }}
                      />
                    </div>
                  )}
                </div>

                {/* Step content */}
                <div
                  className="flex-1 pb-8"
                  style={{
                    filter: active ? "drop-shadow(0 4px 20px rgba(0,168,255,0.15))" : "none",
                    transition: "filter 0.6s ease",
                  }}
                >
                  <div
                    className="text-4xl font-extrabold leading-none mb-2"
                    style={active ? gradientText : { color: "#1E2A45" }}
                  >
                    {step.step}
                  </div>
                  <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center mb-3"
                    style={{
                      background: active
                        ? "linear-gradient(135deg, rgba(0,168,255,0.13), rgba(123,63,228,0.13))"
                        : "#0F1628",
                      border: active ? "1px solid rgba(0,168,255,0.4)" : "1px solid #1E2A45",
                      transition: "all 0.4s ease",
                    }}
                  >
                    <Icon
                      className="w-5 h-5"
                      style={{
                        color: active ? "#00A8FF" : "#2A3A5C",
                        animation: active ? "pulse-icon 2s ease-in-out infinite" : "none",
                        transition: "color 0.4s ease",
                      }}
                    />
                  </div>
                  <h3
                    className="text-base font-bold mb-1"
                    style={{ color: active ? "#ffffff" : "#4A5568", transition: "color 0.4s ease" }}
                  >
                    {step.title}
                  </h3>
                  <p
                    className="text-sm leading-relaxed"
                    style={{ color: active ? "#8888AA" : "#4A5568", transition: "color 0.4s ease" }}
                  >
                    {step.desc}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function Counter({ to, label, suffix = "", decimals = 0 }: { to: number; label: string; suffix?: string; decimals?: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true });
  return (
    <div ref={ref} className="text-center">
      <motion.div
        className="text-4xl font-extrabold text-white mb-1"
        initial={{ opacity: 0 }}
        animate={inView ? { opacity: 1 } : {}}
      >
        <motion.span
          initial={{ textContent: "0" } as never}
          animate={inView ? { textContent: String(to) } as never : {}}
          transition={{ duration: 2, ease: "easeOut" }}
          onUpdate={(latest) => {
            if (ref.current) {
              const el = ref.current.querySelector("span.count-val");
              if (el) {
                const val = (latest as { textContent: number }).textContent;
                el.textContent = decimals > 0 ? Number(val).toFixed(decimals) : Math.round(val).toString();
              }
            }
          }}
        >
          <span className="count-val">{decimals > 0 ? (0).toFixed(decimals) : "0"}</span>
        </motion.span>
        {suffix}
      </motion.div>
      <p className="text-muted-foreground text-sm font-medium">{label}</p>
    </div>
  );
}

const floatingCards = [
  { icon: "⚙", label: "Engineering", color: "#00A8FF", angle: 0 },
  { icon: "⚕", label: "Medicine", color: "#7B3FE4", angle: 72 },
  { icon: "✏", label: "Design", color: "#FF4D6D", angle: 144 },
  { icon: "⚖", label: "Law", color: "#FF8C00", angle: 216 },
  { icon: "📊", label: "Business", color: "#10B981", angle: 288 },
];

const categoryColors: Record<string, string> = {
  engineering: "#00A8FF",
  medicine: "#7B3FE4",
  design: "#FF4D6D",
  law: "#FF8C00",
  business: "#10B981",
  career: "#6366F1",
  counselling: "#6366F1",
};

function getCategoryColor(category: string): string {
  return categoryColors[category?.toLowerCase()] ?? "#6366F1";
}

export function getCategoryVisual(category: string): { gradient: string; emoji: string } {
  const c = (category || "").toLowerCase();
  if (c.includes("interview")) {
    return { gradient: "linear-gradient(135deg, #1a1a4e, #00A8FF)", emoji: "🎯" };
  }
  if (c.includes("counsel")) {
    return { gradient: "linear-gradient(135deg, #2d1a4e, #7B3FE4)", emoji: "🧭" };
  }
  if (c.includes("resume") || c.includes("cv")) {
    return { gradient: "linear-gradient(135deg, #1a2e1a, #10B981)", emoji: "📄" };
  }
  if (c.includes("college") || c.includes("admission")) {
    return { gradient: "linear-gradient(135deg, #2e1a1a, #FF5C00)", emoji: "🎓" };
  }
  return { gradient: "linear-gradient(135deg, #1a1a2e, #7B3FE4)", emoji: "⭐" };
}


const features = [
  {
    icon: Brain,
    title: "Counselling That Knows You",
    desc: "Menti reads your full profile — education, strengths, family context, dreams — and gives advice that actually fits your life. Not generic. Yours.",
    color: "#00A8FF",
  },
  {
    icon: Users,
    title: "Real Experts, When You Need Them",
    desc: "Some decisions need a human touch. Book sessions with our expert counsellors who've guided hundreds of students just like you.",
    color: "#7B3FE4",
  },
  {
    icon: Compass,
    title: "Your Personalised Roadmap",
    desc: "A concrete, phase-by-phase career plan — from today to 5 years from now — built around your goals and updated as you grow.",
    color: "#FF8C00",
  },
];

const testimonials = [
  {
    name: "Aanya Sharma",
    stream: "Class 12, Science",
    quote: "I was completely lost between engineering and medicine. MentoraLM's AI mapped my strengths and gave me clarity I couldn't find in 2 years of searching. I'm now confidently preparing for NEET.",
    rating: 5,
  },
  {
    name: "Rohan Mehta",
    stream: "B.Com Graduate",
    quote: "The roadmap feature is unreal. It broke down exactly what I need to do each month to get into a top MBA programme. My parents were impressed too — finally, a plan they could see.",
    rating: 5,
  },
  {
    name: "Priya Krishnamurthy",
    stream: "Class 11, Commerce",
    quote: "I chatted at midnight during my anxiety phase before board exams. The AI knew my whole profile and calmed me down with actual, relevant advice. It felt like talking to a real mentor.",
    rating: 5,
  },
];

export default function HomePage() {
  usePageMeta(undefined, "MentoraLM helps Indian students discover the right career path using AI-powered counselling, personalised roadmaps, and expert sessions.");
  const { data: services } = useListServices();
  const featuresRef = useRef<HTMLDivElement>(null);
  const featuresInView = useInView(featuresRef, { once: true });
  const statsRef = useRef<HTMLDivElement>(null);
  const statsInView = useInView(statsRef, { once: true });

  const displayedServices = services ? services.slice(0, 2) : [];

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground relative overflow-hidden">
      <Navbar />
      {/* Background Orbs */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] rounded-full bg-[#00A8FF]/10 blur-[120px] animate-[pulse-slow_4s_infinite_alternate]" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[800px] h-[800px] rounded-full bg-[#7B3FE4]/10 blur-[120px] animate-[pulse-slow_4s_infinite_alternate_reverse]" />
      </div>
      <main className="flex-1 relative z-10">
        {/* Hero */}
        <section className="pt-36 pb-6 px-6">
          <div className="container mx-auto max-w-7xl">
            <div className="grid lg:grid-cols-2 gap-16 items-center">
              <motion.div initial="hidden" animate="visible" variants={{ visible: { transition: { staggerChildren: 0.12 } } }}>
                <motion.div variants={fadeUp} className="inline-flex items-center gap-2 bg-primary/10 border border-primary/20 rounded-full px-4 py-1.5 mb-6">
                  <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                  <span className="text-primary text-sm font-medium">AI-Powered Career Guidance for India</span>
                </motion.div>

                <motion.h1 variants={fadeUp} className="text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight leading-[1.1] mb-6">
                  Your AI Career Counsellor for{" "}
                  <br className="hidden md:block" />
                  <CyclingWord />
                  {" "}Students
                </motion.h1>

                <motion.p variants={fadeUp} className="text-lg text-muted-foreground max-w-xl mb-10 leading-relaxed">
                  Most career advice is generic. Ours isn't. MentoraLM's AI learns your background, strengths, and goals — then guides you like a counsellor who's known you for years.
                </motion.p>

                <motion.div variants={fadeUp} className="flex flex-col sm:flex-row gap-4">
                  <Button
                    size="lg"
                    className="bg-gradient-primary border-0 hover:opacity-90 text-white font-semibold text-base px-8 h-14 rounded-xl"
                    data-testid="hero-cta-primary"
                    onClick={() => document.getElementById("try-menti")?.scrollIntoView({ behavior: "smooth" })}
                  >
                    Try Menti Free
                    <ChevronRight className="w-5 h-5 ml-1" />
                  </Button>
                  <Link href="/services">
                    <Button
                      size="lg"
                      variant="outline"
                      className="border-primary/30 hover:border-primary/60 text-white font-semibold text-base px-8 h-14 rounded-xl bg-transparent"
                      data-testid="hero-cta-secondary"
                    >
                      Explore Services
                    </Button>
                  </Link>
                </motion.div>
              </motion.div>

              {/* Floating orbit cards — larger, proper fill */}
              <div className="hidden lg:flex items-center justify-center relative h-[520px]">
                <div className="relative w-[420px] h-[420px]">
                  {/* Outer decorative ring */}
                  <div className="absolute inset-0 rounded-full border border-white/5" />
                  <div className="absolute inset-8 rounded-full border border-white/3" />
                  {/* Central brain */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-28 h-28 rounded-full bg-gradient-primary flex items-center justify-center shadow-[0_0_80px_rgba(0,168,255,0.5)]">
                      <Brain className="w-14 h-14 text-white" />
                    </div>
                  </div>
                  {floatingCards.map((card, i) => {
                    const rad = (card.angle * Math.PI) / 180;
                    const x = 50 + 43 * Math.cos(rad);
                    const y = 50 + 43 * Math.sin(rad);
                    return (
                      <motion.div
                        key={i}
                        className="absolute -translate-x-1/2 -translate-y-1/2"
                        style={{ left: `${x}%`, top: `${y}%` }}
                        animate={{ y: [0, -10, 0] }}
                        transition={{ duration: 3 + i * 0.5, repeat: Infinity, ease: "easeInOut", delay: i * 0.6 }}
                      >
                        <div
                          className="w-[88px] h-[88px] rounded-2xl flex flex-col items-center justify-center text-white font-bold shadow-xl border"
                          style={{
                            backgroundColor: card.color + "28",
                            borderColor: card.color + "60",
                            boxShadow: `0 8px 32px ${card.color}30`,
                          }}
                        >
                          <span className="text-2xl mb-1">{card.icon}</span>
                          <span className="text-[10px] font-semibold text-white/80 tracking-wide">{card.label}</span>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Social Proof — tight gap from hero */}
        <section ref={statsRef} className="py-10 border-y border-white/5 bg-white/2">
          <div className="container mx-auto px-6 max-w-4xl">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              {statsInView && (
                <>
                  <Counter to={500} label="Students Guided" suffix="+" />
                  <Counter to={95} label="Satisfaction Rate" suffix="%" />
                  <Counter to={4.8} label="Average Rating" suffix="★" decimals={1} />
                  <Counter to={2} label="Expert Counsellors" />
                </>
              )}
              {!statsInView && (
                <>
                  {["500+", "95%", "4.8★", "2"].map((v, i) => (
                    <div key={i} className="text-center">
                      <div className="text-4xl font-extrabold text-white mb-1">{v}</div>
                      <p className="text-muted-foreground text-sm font-medium">
                        {["Students Guided", "Satisfaction Rate", "Average Rating", "Expert Counsellors"][i]}
                      </p>
                    </div>
                  ))}
                </>
              )}
            </div>
          </div>
        </section>

        {/* Features */}
        <section ref={featuresRef} className="py-24 px-6">
          <div className="container mx-auto max-w-6xl">
            <motion.div
              initial="hidden"
              animate={featuresInView ? "visible" : "hidden"}
              variants={{ visible: { transition: { staggerChildren: 0.15 } } }}
            >
              <motion.div variants={fadeUp} className="text-center mb-16">
                <h2 className="text-3xl md:text-4xl font-extrabold text-white mb-4">
                  Everything you need to navigate your career
                </h2>
                <p className="text-muted-foreground max-w-2xl mx-auto">
                  Built for Indian students who deserve personalised guidance, not one-size-fits-all advice.
                </p>
              </motion.div>

              <div className="grid md:grid-cols-3 gap-6">
                {features.map((f, i) => (
                  <motion.div
                    key={i}
                    variants={fadeUp}
                    custom={i}
                    whileHover={{ y: -6, scale: 1.02 }}
                    className="relative bg-card border border-border rounded-2xl p-8 overflow-hidden group cursor-default"
                  >
                    <div
                      className="absolute top-0 left-0 right-0 h-1 rounded-t-2xl opacity-80"
                      style={{ background: `linear-gradient(90deg, ${f.color}, transparent)` }}
                    />
                    <div
                      className="w-12 h-12 rounded-xl flex items-center justify-center mb-6"
                      style={{ backgroundColor: f.color + "22", border: `1px solid ${f.color}44` }}
                    >
                      <f.icon className="w-6 h-6" style={{ color: f.color }} />
                    </div>
                    <h3 className="text-lg font-bold text-white mb-3">{f.title}</h3>
                    <p className="text-muted-foreground text-sm leading-relaxed">{f.desc}</p>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>
        </section>

        {/* How It Works */}
        <HowItWorksSection />

        {/* Try Menti — embedded chat section */}
        <MentiSection />

        {/* Services Preview — always shown, with "Coming Soon" 3rd card */}
        <section className="pt-24 pb-8 md:py-24 px-6">
          <div className="container mx-auto max-w-6xl">
            <div className="flex items-center justify-between mb-12">
              <div>
                <h2 className="text-3xl md:text-4xl font-extrabold text-white mb-2">Our Services</h2>
                <p className="text-muted-foreground">Expert-led sessions tailored to your stage.</p>
              </div>
              <Link href="/services">
                <Button variant="outline" className="border-white/10 hover:border-white/20 hidden md:flex">
                  View all services
                  <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
              </Link>
            </div>
            <div className="grid md:grid-cols-3 gap-6">
              {displayedServices.map((service, i) => {
                const color = getCategoryColor(service.category);
                const { gradient, emoji } = getCategoryVisual(service.category);
                const svc = service as typeof service & { duration?: string; thumbnailUrl?: string };
                return (
                  <motion.div
                    key={service.id}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.1 }}
                    whileHover={{ y: -4, scale: 1.02 }}
                    className="bg-card border border-border rounded-2xl overflow-hidden group"
                  >
                    {/* Image area with category gradient + emoji */}
                    <div
                      className="h-36 relative flex items-center justify-center overflow-hidden"
                      style={{ background: gradient, borderBottom: `1px solid ${color}33` }}
                    >
                      <span className="text-6xl drop-shadow-lg">{emoji}</span>
                      {/* Duration badge */}
                      {svc.duration && (
                        <div className="absolute top-3 right-3 flex items-center gap-1 bg-black/60 backdrop-blur-sm border border-white/10 rounded-full px-2.5 py-1">
                          <Clock className="w-3 h-3 text-white/70" />
                          <span className="text-white text-xs font-medium">{svc.duration} min</span>
                        </div>
                      )}
                    </div>
                    <div className="p-6">
                      <div
                        className="inline-block text-xs font-semibold rounded-full px-3 py-1 mb-3"
                        style={{ backgroundColor: color + "18", color }}
                      >
                        {service.category}
                      </div>
                      <h3 className="text-white font-bold text-lg mb-2">{service.title}</h3>
                      <p className="text-muted-foreground text-sm mb-4 line-clamp-2">{service.shortDesc}</p>
                      <div className="flex items-center justify-between">
                        <span className="text-white font-bold text-xl">
                          ₹{service.price.toLocaleString("en-IN")}
                        </span>
                        <Link href={`/services/${service.id}`}>
                          <Button size="sm" className="bg-gradient-primary border-0 hover:opacity-90">
                            Book Now
                          </Button>
                        </Link>
                      </div>
                    </div>
                  </motion.div>
                );
              })}

              {/* "More Services Coming Soon" card */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: displayedServices.length * 0.1 }}
                className="bg-card border border-dashed border-white/15 rounded-2xl overflow-hidden flex flex-col items-center justify-center min-h-[280px] p-8 text-center group"
              >
                <div className="w-16 h-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mb-5 group-hover:border-primary/30 transition-colors">
                  <Plus className="w-8 h-8 text-white/30 group-hover:text-primary/60 transition-colors" />
                </div>
                <h3 className="text-white/60 font-bold text-lg mb-2">More Services Coming Soon</h3>
                <p className="text-muted-foreground text-sm max-w-[200px]">
                  New expert-led sessions are being added regularly.
                </p>
                <Link href="/services" className="mt-5">
                  <Button variant="outline" size="sm" className="border-white/10 hover:border-primary/30 text-white/50 hover:text-white/80">
                    Browse all services
                  </Button>
                </Link>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Testimonials */}
        <section className="pt-8 pb-12 md:py-24 px-6 bg-white/2 border-y border-white/5">
          <div className="container mx-auto max-w-6xl">
            <div className="text-center mb-8 md:mb-16">
              <h2 className="text-3xl md:text-4xl font-extrabold text-white mb-4">
                Students who found their direction
              </h2>
              <p className="text-muted-foreground">Real stories from real students across India.</p>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              {testimonials.map((t, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="bg-card border border-border rounded-2xl p-8"
                >
                  <div className="flex gap-1 mb-4">
                    {Array(t.rating).fill(0).map((_, j) => (
                      <Star key={j} className="w-4 h-4 fill-amber-400 text-amber-400" />
                    ))}
                  </div>
                  <p className="text-white/80 text-sm leading-relaxed mb-6 italic">"{t.quote}"</p>
                  <div className="flex items-center gap-3">
                    <div
                      className="flex items-center justify-center rounded-full text-white font-bold flex-shrink-0"
                      style={{
                        width: 48,
                        height: 48,
                        fontSize: 18,
                        background: "linear-gradient(135deg, #00A8FF, #7B3FE4)",
                      }}
                      aria-label={t.name}
                    >
                      {t.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="text-white font-semibold text-sm">{t.name}</p>
                      <p className="text-muted-foreground text-xs">{t.stream}</p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Banner */}
        <section className="py-10 md:py-24 px-6">
          <div className="container mx-auto max-w-4xl">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="relative rounded-3xl bg-gradient-primary p-1 overflow-hidden"
            >
              <div className="bg-[#0A0F20] rounded-[calc(1.5rem-4px)] px-10 py-16 text-center relative overflow-hidden">
                <div className="absolute inset-0 pointer-events-none">
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-48 bg-[#00A8FF]/10 blur-[80px]" />
                </div>
                <div className="relative z-10">
                  <div className="inline-flex items-center bg-primary/10 border border-primary/20 rounded-full px-4 py-1.5 mb-6" style={{ gap: 8 }}>
                    <Award className="w-4 h-4 text-primary flex-shrink-0" style={{ display: "block" }} />
                    <span className="text-primary text-sm font-medium leading-none">Join 500+ students already guided</span>
                  </div>
                  <h2 className="text-3xl md:text-4xl font-extrabold text-white mb-4">
                    Your career clarity starts today
                  </h2>
                  <p className="text-white/60 max-w-lg mx-auto mb-8">
                    Sign up free, complete your profile, and chat with Menti in minutes. No credit card needed.
                  </p>
                  <div className="flex flex-col sm:flex-row gap-4 justify-center items-stretch sm:items-center">
                    <Link href="/auth/signup" className="block w-full sm:w-auto">
                      <Button
                        size="lg"
                        className="border-0 hover:opacity-90 text-white font-bold h-14 rounded-xl w-full sm:w-auto sm:px-10 px-4 text-sm sm:text-base whitespace-normal"
                        style={{ background: "linear-gradient(135deg, #00A8FF, #7B3FE4)", boxSizing: "border-box", maxWidth: "100%" }}
                        data-testid="cta-banner-signup"
                      >
                        Start Free — No Card Needed
                        <ChevronRight className="w-5 h-5 ml-1 flex-shrink-0" />
                      </Button>
                    </Link>
                  </div>
                  <div className="flex flex-col md:flex-row items-center justify-center gap-3 md:gap-6 mt-8 text-sm text-white/50">
                    <div className="flex items-center gap-1.5"><CheckCircle className="w-4 h-4 text-emerald-400 flex-shrink-0" />Free AI counselling</div>
                    <div className="flex items-center gap-1.5"><CheckCircle className="w-4 h-4 text-emerald-400 flex-shrink-0" />Personalised roadmap</div>
                    <div className="flex items-center gap-1.5"><CheckCircle className="w-4 h-4 text-emerald-400 flex-shrink-0" />No commitment</div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
