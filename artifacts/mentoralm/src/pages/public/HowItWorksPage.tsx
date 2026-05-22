import { motion } from "framer-motion";
import { Link } from "wouter";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Users, MessageSquare, Compass, Calendar, ChevronRight, CheckCircle } from "lucide-react";
import { usePageMeta } from "@/lib/usePageMeta";

const steps = [
  {
    number: "01",
    icon: Users,
    title: "Complete your profile",
    desc: "Tell us about your education, interests, strengths, family context, and career goals. The more you share, the sharper your AI counsellor becomes.",
    color: "#00A8FF",
    details: [
      "Takes about 10 minutes",
      "Covers 6 key areas of your life",
      "Unlocks personalised AI guidance",
      "Save and come back anytime",
    ],
  },
  {
    number: "02",
    icon: MessageSquare,
    title: "Chat with your AI counsellor",
    desc: "Your AI has read every detail of your profile. Ask about streams, exams, colleges, careers — it gives advice that actually fits your situation.",
    color: "#7B3FE4",
    details: [
      "Available 24/7, no waiting",
      "Remembers your full profile",
      "Conversations build over time",
      "Switch topics freely",
    ],
  },
  {
    number: "03",
    icon: Compass,
    title: "Get your career roadmap",
    desc: "Once your profile is complete, generate a personalised 4-phase roadmap — from today to 5 years out — with concrete, actionable steps.",
    color: "#FF8C00",
    details: [
      "4 phases: immediate to long-term",
      "Built on your profile data",
      "Can be regenerated as you grow",
      "Discuss each phase with AI",
    ],
  },
  {
    number: "04",
    icon: Calendar,
    title: "Book an expert session",
    desc: "Some decisions need a real human. Our expert counsellors are available for live sessions — choose a service, pick a slot, and get 1-on-1 guidance.",
    color: "#10B981",
    details: [
      "Live 1-on-1 sessions",
      "Specialists for different areas",
      "Secure payment via Razorpay",
      "Session notes shared after",
    ],
  },
];

const faqs = [
  { q: "Is MentoraLM free to use?", a: "Signing up and using the AI counsellor is free. Expert 1-on-1 sessions with human counsellors are paid — see our Services page for pricing." },
  { q: "How is MentoraLM different from generic career advice sites?", a: "Most advice is one-size-fits-all. MentoraLM's AI reads your full profile — your stream, grades, interests, family situation, goals — and gives guidance that actually fits you." },
  { q: "Who are the human counsellors?", a: "Our counsellors are experienced career guidance professionals who have worked with hundreds of Indian students across engineering, medicine, law, commerce, and creative fields." },
  { q: "Is my data private?", a: "Yes. Your profile data is used solely to personalise your AI counsellor. It is never sold or shared with third parties." },
  { q: "What if I haven't decided my stream yet?", a: "That's exactly what MentoraLM is for. Start the chat and tell your AI counsellor where you are — it'll guide you through the decision step by step." },
];

export default function HowItWorksPage() {
  usePageMeta("How It Works", "See how MentoraLM uses AI and expert counsellors to guide Indian students step-by-step toward their dream career.");
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] rounded-full bg-[#00A8FF]/8 blur-[150px]" />
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] rounded-full bg-[#7B3FE4]/8 blur-[150px]" />
      </div>

      <main className="relative z-10 pt-32 pb-24 px-6">
        <div className="container mx-auto max-w-5xl">
          {/* Header */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-20">
            <h1 className="text-4xl md:text-5xl font-extrabold text-white mb-4">
              How MentoraLM works
            </h1>
            <p className="text-muted-foreground text-lg max-w-xl mx-auto">
              From sign-up to career clarity in four steps. No jargon, no generic advice — just guidance built around you.
            </p>
          </motion.div>

          {/* Steps */}
          <div className="space-y-12 mb-24">
            {steps.map((step, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className={`grid md:grid-cols-2 gap-8 items-center ${i % 2 === 1 ? "md:flex-row-reverse" : ""}`}
              >
                <div className={i % 2 === 1 ? "md:order-2" : ""}>
                  <div className="text-7xl font-extrabold text-gradient opacity-20 mb-2">{step.number}</div>
                  <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center mb-4"
                    style={{ backgroundColor: step.color + "22", border: `1px solid ${step.color}44` }}
                  >
                    <step.icon className="w-6 h-6" style={{ color: step.color }} />
                  </div>
                  <h2 className="text-2xl font-bold text-white mb-3">{step.title}</h2>
                  <p className="text-muted-foreground leading-relaxed mb-6">{step.desc}</p>
                  <ul className="space-y-2">
                    {step.details.map((detail, j) => (
                      <li key={j} className="flex items-center gap-2.5 text-sm text-muted-foreground">
                        <CheckCircle className="w-4 h-4 flex-shrink-0" style={{ color: step.color }} />
                        {detail}
                      </li>
                    ))}
                  </ul>
                </div>
                <div className={`${i % 2 === 1 ? "md:order-1" : ""} relative`}>
                  <div
                    className="rounded-3xl p-8 border flex items-center justify-center h-48"
                    style={{ backgroundColor: step.color + "0D", borderColor: step.color + "33" }}
                  >
                    <step.icon className="w-24 h-24 opacity-20" style={{ color: step.color }} />
                    <div
                      className="absolute inset-0 rounded-3xl opacity-50 blur-[40px] -z-10"
                      style={{ background: step.color + "22" }}
                    />
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* FAQ */}
          <div className="mb-20">
            <h2 className="text-2xl font-bold text-white mb-8 text-center">Frequently asked questions</h2>
            <div className="space-y-4 max-w-3xl mx-auto">
              {faqs.map((faq, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 12 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.06 }}
                  className="bg-card border border-border rounded-xl p-6"
                >
                  <h3 className="text-white font-semibold mb-2">{faq.q}</h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">{faq.a}</p>
                </motion.div>
              ))}
            </div>
          </div>

          {/* CTA */}
          <div className="text-center">
            <h2 className="text-2xl font-bold text-white mb-3">Ready to find your direction?</h2>
            <p className="text-muted-foreground mb-8">Join hundreds of students who've found clarity with MentoraLM.</p>
            <Link href="/auth/signup">
              <Button className="bg-gradient-primary border-0 hover:opacity-90 px-10 h-12 font-semibold">
                Get Started Free
                <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
