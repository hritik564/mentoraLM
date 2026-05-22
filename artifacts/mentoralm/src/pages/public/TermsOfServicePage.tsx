import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { usePageMeta } from "@/lib/usePageMeta";
import { motion } from "framer-motion";

const sections = [
  {
    title: "1. Acceptance of Terms",
    body: `By accessing or using MentoraLM ("the Platform"), you agree to be bound by these Terms of Service ("Terms"). If you do not agree to these Terms, please do not use the Platform. These Terms apply to all users, including students, visitors, and any other persons who access or use the Platform.`,
  },
  {
    title: "2. Description of Service",
    body: `MentoraLM provides AI-powered career counselling services for Indian students, including:\n\n• An AI career counsellor that provides personalised guidance based on your profile\n• Personalised career roadmaps\n• A marketplace to book sessions with human expert counsellors\n• Career resources and tools\n\nThe AI counsellor is intended to supplement, not replace, professional human advice. For important life decisions, we always recommend consulting a qualified human professional.`,
  },
  {
    title: "3. User Accounts",
    body: `To access certain features, you must create an account. You are responsible for:\n\n• Maintaining the confidentiality of your account credentials\n• All activities that occur under your account\n• Providing accurate and complete information when creating your profile\n• Notifying us immediately of any unauthorised use of your account\n\nWe reserve the right to suspend or terminate accounts that violate these Terms.`,
  },
  {
    title: "4. Booking and Payments",
    body: `When you book an expert session through our platform:\n\n• Payment is due at the time of booking\n• All prices are listed in Indian Rupees (INR) and are inclusive of applicable taxes\n• Cancellations made more than 24 hours before a session are eligible for a full refund\n• Cancellations within 24 hours of the session may be subject to a cancellation fee\n• Payments are processed securely through Razorpay\n\nMentoraLM reserves the right to modify pricing at any time with reasonable notice.`,
  },
  {
    title: "5. Intellectual Property",
    body: `All content on MentoraLM, including but not limited to text, graphics, logos, icons, images, and software, is the property of MentoraLM or its content suppliers and is protected by Indian and international copyright laws.\n\nYour profile data and conversation history remain your property. By using the Platform, you grant MentoraLM a non-exclusive licence to use this data to provide and improve our services.`,
  },
  {
    title: "6. Prohibited Conduct",
    body: `You agree not to:\n\n• Use the Platform for any unlawful purpose\n• Attempt to gain unauthorised access to any part of the Platform\n• Submit false or misleading information\n• Harass, abuse, or harm other users or counsellors\n• Use the AI counsellor to generate harmful, abusive, or illegal content\n• Scrape, crawl, or otherwise extract data from the Platform without permission\n• Attempt to reverse-engineer any part of the Platform`,
  },
  {
    title: "7. Disclaimer of Warranties",
    body: `MentoraLM is provided on an "as is" and "as available" basis without any warranties of any kind, either express or implied. We do not warrant that the Platform will be uninterrupted, error-free, or free of viruses.\n\nThe AI career counsellor provides guidance based on the information you provide and general career data. It is not a substitute for professional career counselling, psychological advice, or academic guidance from qualified professionals.`,
  },
  {
    title: "8. Limitation of Liability",
    body: `To the maximum extent permitted by applicable law, MentoraLM shall not be liable for any indirect, incidental, special, consequential, or punitive damages arising from your use of, or inability to use, the Platform or its services.\n\nOur total liability to you for any claims arising from these Terms or your use of the Platform shall not exceed the amount you paid to MentoraLM in the six months prior to the claim.`,
  },
  {
    title: "9. Governing Law",
    body: `These Terms shall be governed by and construed in accordance with the laws of India. Any disputes arising under these Terms shall be subject to the exclusive jurisdiction of the courts of India.`,
  },
  {
    title: "10. Changes to Terms",
    body: `We reserve the right to modify these Terms at any time. We will provide notice of significant changes by posting the updated Terms on the Platform with a new effective date. Your continued use of the Platform after such changes constitutes your acceptance of the new Terms.`,
  },
  {
    title: "11. Contact",
    body: `For questions about these Terms, please contact us at:\n\nMentoraLM\nEmail: legal@mentoralm.com`,
  },
];

export default function TermsOfServicePage() {
  usePageMeta("Terms of Service", "MentoraLM's terms of service — the rules and guidelines for using our platform.");

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <Navbar />
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] rounded-full bg-[#7B3FE4]/6 blur-[150px]" />
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] rounded-full bg-[#00A8FF]/6 blur-[150px]" />
      </div>

      <main className="flex-1 relative z-10 pt-32 pb-24 px-6">
        <div className="container mx-auto max-w-3xl">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-12">
            <div className="inline-flex items-center gap-2 bg-primary/10 border border-primary/20 rounded-full px-4 py-1.5 mb-5">
              <span className="text-primary text-sm font-medium">Legal</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-extrabold text-white mb-4">Terms of Service</h1>
            <p className="text-muted-foreground text-lg">Last updated: May 2026</p>
          </motion.div>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="text-white/70 leading-relaxed mb-12 text-base"
          >
            Please read these Terms of Service carefully before using MentoraLM. These terms govern your access to and use of our platform, services, and AI career counsellor. Using MentoraLM means you agree to these terms.
          </motion.p>

          <div className="space-y-10">
            {sections.map((s, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.04 }}
                className="bg-card border border-border rounded-2xl p-8"
              >
                <h2 className="text-white font-bold text-lg mb-4">{s.title}</h2>
                <div className="text-muted-foreground text-sm leading-relaxed whitespace-pre-line">{s.body}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
