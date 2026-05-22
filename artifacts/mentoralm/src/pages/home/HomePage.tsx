import { useRef } from "react";
import { Link } from "wouter";
import { motion, useInView } from "framer-motion";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { useListServices } from "@workspace/api-client-react";
import { Brain, MessageSquare, Compass, Calendar, Star, ChevronRight, Users, TrendingUp, Award, CheckCircle } from "lucide-react";

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: (i = 0) => ({ opacity: 1, y: 0, transition: { delay: i * 0.1, duration: 0.5 } }),
};

function Counter({ to, label, suffix = "" }: { to: number; label: string; suffix?: string }) {
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
              if (el) el.textContent = Math.round((latest as { textContent: number }).textContent).toString();
            }
          }}
        >
          <span className="count-val">0</span>
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

const steps = [
  { icon: Users, title: "Complete your profile", desc: "Tell us about your background, interests, and goals in 6 quick steps.", step: "01" },
  { icon: MessageSquare, title: "Chat with AI counsellor", desc: "Your personal AI that's read your profile and knows your story.", step: "02" },
  { icon: Compass, title: "Get your roadmap", desc: "A personalised 5-year career plan built around your unique strengths.", step: "03" },
  { icon: Calendar, title: "Book an expert session", desc: "Connect with our human counsellors for complex decisions.", step: "04" },
];

const features = [
  {
    icon: Brain,
    title: "Counselling That Knows You",
    desc: "Our AI reads your full profile — education, strengths, family context, dreams — and gives advice that actually fits your life. Not generic. Yours.",
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
    quote: "I was completely lost between engineering and medicine. MentorAlm's AI mapped my strengths and gave me clarity I couldn't find in 2 years of searching. I'm now confidently preparing for NEET.",
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
  const { data: services } = useListServices();
  const featuresRef = useRef<HTMLDivElement>(null);
  const featuresInView = useInView(featuresRef, { once: true });
  const statsRef = useRef<HTMLDivElement>(null);
  const statsInView = useInView(statsRef, { once: true });

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
        <section className="pt-36 pb-24 px-6">
          <div className="container mx-auto max-w-7xl">
            <div className="grid lg:grid-cols-2 gap-16 items-center">
              <motion.div initial="hidden" animate="visible" variants={{ visible: { transition: { staggerChildren: 0.12 } } }}>
                <motion.div variants={fadeUp} className="inline-flex items-center gap-2 bg-primary/10 border border-primary/20 rounded-full px-4 py-1.5 mb-6">
                  <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                  <span className="text-primary text-sm font-medium">AI-Powered Career Guidance for India</span>
                </motion.div>

                <motion.h1 variants={fadeUp} className="text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight leading-[1.1] mb-6">
                  Your AI Career Counsellor,{" "}
                  <br className="hidden md:block" />
                  <span className="text-gradient">Available 24/7</span>
                </motion.h1>

                <motion.p variants={fadeUp} className="text-lg text-muted-foreground max-w-xl mb-10 leading-relaxed">
                  Most career advice is generic. Ours isn't. MentorAlm's AI learns your background, strengths, and goals — then guides you like a counsellor who's known you for years.
                </motion.p>

                <motion.div variants={fadeUp} className="flex flex-col sm:flex-row gap-4">
                  <Link href="/auth/signup">
                    <Button
                      size="lg"
                      className="bg-gradient-primary border-0 hover:opacity-90 text-white font-semibold text-base px-8 h-14 rounded-xl"
                      data-testid="hero-cta-primary"
                    >
                      Try AI Counsellor Free
                      <ChevronRight className="w-5 h-5 ml-1" />
                    </Button>
                  </Link>
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

              {/* Floating orbit cards */}
              <div className="hidden lg:flex items-center justify-center relative h-96">
                <div className="relative w-72 h-72">
                  {/* Central brain */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-24 h-24 rounded-full bg-gradient-primary flex items-center justify-center shadow-[0_0_60px_rgba(0,168,255,0.4)]">
                      <Brain className="w-12 h-12 text-white" />
                    </div>
                  </div>
                  {/* Orbit ring */}
                  <div className="absolute inset-0 rounded-full border border-white/5" />
                  {floatingCards.map((card, i) => {
                    const rad = (card.angle * Math.PI) / 180;
                    const x = 50 + 42 * Math.cos(rad);
                    const y = 50 + 42 * Math.sin(rad);
                    return (
                      <motion.div
                        key={i}
                        className="absolute -translate-x-1/2 -translate-y-1/2"
                        style={{ left: `${x}%`, top: `${y}%` }}
                        animate={{ y: [0, -8, 0] }}
                        transition={{ duration: 3 + i * 0.4, repeat: Infinity, ease: "easeInOut", delay: i * 0.5 }}
                      >
                        <div
                          className="w-14 h-14 rounded-2xl flex flex-col items-center justify-center text-white text-lg font-bold shadow-lg border border-white/10"
                          style={{ backgroundColor: card.color + "33", borderColor: card.color + "55" }}
                        >
                          <span className="text-xl">{card.icon}</span>
                          <span className="text-[9px] font-medium mt-0.5 text-white/80">{card.label}</span>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Social Proof */}
        <section ref={statsRef} className="py-16 border-y border-white/5 bg-white/2">
          <div className="container mx-auto px-6 max-w-4xl">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              {statsInView && (
                <>
                  <Counter to={500} label="Students Guided" suffix="+" />
                  <Counter to={95} label="Satisfaction Rate" suffix="%" />
                  <Counter to={4.9} label="Average Rating" suffix="★" />
                  <Counter to={2} label="Expert Counsellors" />
                </>
              )}
              {!statsInView && (
                <>
                  {["500+ Students Guided", "95% Satisfaction Rate", "4.9★ Average Rating", "2 Expert Counsellors"].map((s, i) => (
                    <div key={i} className="text-center">
                      <div className="text-4xl font-extrabold text-white mb-1">—</div>
                      <p className="text-muted-foreground text-sm font-medium">{s}</p>
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
        <section className="py-24 px-6 bg-white/2 border-y border-white/5">
          <div className="container mx-auto max-w-6xl">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-extrabold text-white mb-4">How MentorAlm works</h2>
              <p className="text-muted-foreground max-w-xl mx-auto">From sign-up to clarity in four steps.</p>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {steps.map((step, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="relative"
                >
                  {i < steps.length - 1 && (
                    <div className="hidden lg:block absolute top-8 left-full w-full h-px bg-gradient-to-r from-primary/40 to-transparent z-0" />
                  )}
                  <div className="relative z-10">
                    <div className="text-5xl font-extrabold text-gradient mb-4 opacity-40">{step.step}</div>
                    <div className="w-12 h-12 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center mb-4">
                      <step.icon className="w-6 h-6 text-primary" />
                    </div>
                    <h3 className="text-base font-bold text-white mb-2">{step.title}</h3>
                    <p className="text-muted-foreground text-sm leading-relaxed">{step.desc}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Services Preview */}
        {services && services.length > 0 && (
          <section className="py-24 px-6">
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
                {services.slice(0, 3).map((service, i) => (
                  <motion.div
                    key={service.id}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.1 }}
                    whileHover={{ y: -4, scale: 1.02 }}
                    className="bg-card border border-border rounded-2xl overflow-hidden group"
                  >
                    <div className="h-32 bg-gradient-primary opacity-80 flex items-center justify-center">
                      <Briefcase className="w-12 h-12 text-white opacity-60" />
                    </div>
                    <div className="p-6">
                      <div className="inline-block text-xs font-semibold text-primary bg-primary/10 rounded-full px-3 py-1 mb-3">
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
                ))}
              </div>
            </div>
          </section>
        )}

        {/* Testimonials */}
        <section className="py-24 px-6 bg-white/2 border-y border-white/5">
          <div className="container mx-auto max-w-6xl">
            <div className="text-center mb-16">
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
                    <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold">
                      {t.name.charAt(0)}
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
        <section className="py-24 px-6">
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
                  <div className="inline-flex items-center gap-2 bg-primary/10 border border-primary/20 rounded-full px-4 py-1.5 mb-6">
                    <Award className="w-4 h-4 text-primary" />
                    <span className="text-primary text-sm font-medium">Join 500+ students already guided</span>
                  </div>
                  <h2 className="text-3xl md:text-4xl font-extrabold text-white mb-4">
                    Your career clarity starts today
                  </h2>
                  <p className="text-white/60 max-w-lg mx-auto mb-8">
                    Sign up free, complete your profile, and talk to your AI counsellor in minutes. No credit card needed.
                  </p>
                  <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <Link href="/auth/signup">
                      <Button
                        size="lg"
                        className="bg-white text-[#080C1A] hover:bg-white/90 font-bold px-10 h-14 rounded-xl"
                        data-testid="cta-banner-signup"
                      >
                        Start Free — No Card Needed
                        <ChevronRight className="w-5 h-5 ml-1" />
                      </Button>
                    </Link>
                  </div>
                  <div className="flex items-center justify-center gap-6 mt-8 text-sm text-white/50">
                    <div className="flex items-center gap-1.5"><CheckCircle className="w-4 h-4 text-emerald-400" />Free AI counselling</div>
                    <div className="flex items-center gap-1.5"><CheckCircle className="w-4 h-4 text-emerald-400" />Personalised roadmap</div>
                    <div className="flex items-center gap-1.5"><CheckCircle className="w-4 h-4 text-emerald-400" />No commitment</div>
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

function Briefcase({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M20 7H4a2 2 0 00-2 2v10a2 2 0 002 2h16a2 2 0 002-2V9a2 2 0 00-2-2z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M16 7V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v2" />
    </svg>
  );
}
