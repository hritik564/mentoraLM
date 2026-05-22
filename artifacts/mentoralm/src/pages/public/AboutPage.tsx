import { motion } from "framer-motion";
import { Link } from "wouter";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { ChevronRight, Target, Heart, Zap } from "lucide-react";
import { usePageMeta } from "@/lib/usePageMeta";

const values = [
  {
    icon: Target,
    title: "Personalised, not generic",
    desc: "Every student has a unique story — different strengths, family context, and dreams. We believe career advice should be as unique as the student receiving it.",
    color: "#00A8FF",
  },
  {
    icon: Heart,
    title: "Rooted in India",
    desc: "We understand the Indian education system, the pressure of board exams, JEE, NEET, and the complexity of navigating streams, colleges, and family expectations.",
    color: "#FF4D6D",
  },
  {
    icon: Zap,
    title: "Always available",
    desc: "Career anxiety doesn't wait for office hours. Our AI counsellor is available 24/7 — at midnight before boards, during weekends, whenever you need it most.",
    color: "#FF8C00",
  },
];

const team = [
  {
    name: "Priya Sharma",
    role: "Career Counsellor",
    bio: "15 years guiding students through stream selection, college admissions, and career transitions across India.",
    initial: "P",
  },
  {
    name: "Arjun Mehta",
    role: "Career Counsellor",
    bio: "Former IIT alumni with deep expertise in engineering careers, MBA preparation, and entrepreneurship pathways.",
    initial: "A",
  },
];

export default function AboutPage() {
  usePageMeta("About Us", "Learn about MentorAlm's mission to democratise career counselling for every Indian student.");
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-0 left-0 w-[500px] h-[500px] rounded-full bg-[#00A8FF]/8 blur-[150px]" />
        <div className="absolute bottom-0 right-0 w-[500px] h-[500px] rounded-full bg-[#7B3FE4]/8 blur-[150px]" />
      </div>

      <main className="relative z-10 pt-32 pb-24 px-6">
        <div className="container mx-auto max-w-5xl">
          {/* Mission */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-20">
            <h1 className="text-4xl md:text-5xl font-extrabold text-white mb-6">
              We believe every Indian student<br />
              deserves a <span className="text-gradient">brilliant mentor</span>
            </h1>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto leading-relaxed">
              MentorAlm was built because most career advice in India is either too expensive, too generic, or too late. 
              We use AI to give every student access to the kind of personalised guidance that used to be reserved for those who could afford a premium counsellor.
            </p>
          </motion.div>

          {/* Values */}
          <div className="grid md:grid-cols-3 gap-6 mb-20">
            {values.map((value, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="bg-card border border-border rounded-2xl p-8"
              >
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center mb-5"
                  style={{ backgroundColor: value.color + "22", border: `1px solid ${value.color}44` }}
                >
                  <value.icon className="w-6 h-6" style={{ color: value.color }} />
                </div>
                <h3 className="text-white font-bold text-lg mb-3">{value.title}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">{value.desc}</p>
              </motion.div>
            ))}
          </div>

          {/* Story */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="bg-card border border-border rounded-3xl p-10 mb-20"
          >
            <h2 className="text-2xl font-bold text-white mb-6">Our story</h2>
            <div className="space-y-4 text-muted-foreground leading-relaxed">
              <p>
                MentorAlm started with a simple observation: the students who succeed in India's competitive education landscape often have one thing in common — a trusted adult who helped them navigate the noise. Whether a parent, teacher, or counsellor, that mentor made the difference.
              </p>
              <p>
                Most students don't have that. They rely on Google, YouTube, and well-meaning relatives who repeat the same advice: "Study hard, get into engineering or medicine." Meanwhile, the landscape of careers has exploded — design, law, product management, data science, research, policy — and students are more lost than ever.
              </p>
              <p>
                We built MentorAlm to change that. By combining AI that deeply understands each student's profile with real human counsellors for complex decisions, we give every student access to the kind of guidance that helps them make confident, informed choices about their futures.
              </p>
            </div>
          </motion.div>

          {/* Team */}
          <div className="mb-20">
            <h2 className="text-2xl font-bold text-white mb-8 text-center">Our counsellors</h2>
            <div className="grid md:grid-cols-2 gap-6 max-w-3xl mx-auto">
              {team.map((member, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="bg-card border border-border rounded-2xl p-7 flex items-start gap-5"
                >
                  <div className="w-14 h-14 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold text-xl flex-shrink-0">
                    {member.initial}
                  </div>
                  <div>
                    <h3 className="text-white font-bold">{member.name}</h3>
                    <p className="text-primary text-sm mb-2">{member.role}</p>
                    <p className="text-muted-foreground text-sm leading-relaxed">{member.bio}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* CTA */}
          <div className="text-center">
            <h2 className="text-2xl font-bold text-white mb-3">Meet your AI counsellor</h2>
            <p className="text-muted-foreground mb-8">
              Sign up free and start getting the guidance you deserve.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/auth/signup">
                <Button className="bg-gradient-primary border-0 hover:opacity-90 px-10 h-12 font-semibold">
                  Get Started Free
                  <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
              </Link>
              <Link href="/services">
                <Button variant="outline" className="border-border h-12 px-8">
                  View Services
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
