import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { usePageMeta } from "@/lib/usePageMeta";
import { motion } from "framer-motion";

const sections = [
  {
    title: "1. Information We Collect",
    body: `We collect information you provide directly to us when you create an account, complete your profile, or use our services. This includes your name, email address, educational background, career interests, and any other information you choose to provide.\n\nWe also automatically collect certain information when you use MentoraLM, including your IP address, browser type, pages visited, and usage patterns through standard server logs and analytics tools.`,
  },
  {
    title: "2. How We Use Your Information",
    body: `We use the information we collect to:\n• Provide, maintain, and improve our AI career counselling services\n• Personalise your career roadmap and AI counsellor responses\n• Process bookings and payments for expert sessions\n• Send you service updates, booking confirmations, and relevant notifications\n• Respond to your comments and questions\n• Monitor and analyse usage patterns to improve our platform`,
  },
  {
    title: "3. Sharing of Information",
    body: `We do not sell, trade, or rent your personal information to third parties. We may share your information with:\n\n• Expert counsellors you book sessions with, solely to facilitate those sessions\n• Service providers who assist in our operations (payment processors, email providers) under strict confidentiality agreements\n• Law enforcement or government authorities when required by applicable law\n\nWe will never share your profile data or conversation history with third parties for advertising purposes.`,
  },
  {
    title: "4. Data Security",
    body: `We implement industry-standard security measures to protect your personal information against unauthorised access, alteration, disclosure, or destruction. Your data is stored on secure servers, and all communication between your browser and our platform is encrypted using TLS.\n\nHowever, no method of transmission over the internet is 100% secure. While we strive to protect your data, we cannot guarantee absolute security.`,
  },
  {
    title: "5. Data Retention",
    body: `We retain your personal information for as long as your account is active or as needed to provide you with our services. You may request deletion of your account and associated data at any time by contacting us at privacy@mentoralm.com. We will respond within 30 days.`,
  },
  {
    title: "6. Cookies",
    body: `MentoraLM uses cookies and similar tracking technologies to maintain your session, remember your preferences, and analyse how our platform is used. You can control cookie settings through your browser; however, disabling cookies may affect certain features of the platform.`,
  },
  {
    title: "7. Children's Privacy",
    body: `MentoraLM is designed for students, including those under 18. We take extra care to protect the privacy of younger users. We do not knowingly collect personally identifiable information from children under 13 without verifiable parental consent. If you believe we have collected such information, please contact us immediately.`,
  },
  {
    title: "8. Changes to This Policy",
    body: `We may update this Privacy Policy from time to time. We will notify you of any material changes by posting the new policy on this page with an updated date. Your continued use of MentoraLM after such changes constitutes your acceptance of the revised policy.`,
  },
  {
    title: "9. Contact Us",
    body: `If you have questions or concerns about this Privacy Policy, please contact us at:\n\nMentoraLM\nEmail: privacy@mentoralm.com`,
  },
];

export default function PrivacyPolicyPage() {
  usePageMeta("Privacy Policy", "MentoraLM's privacy policy — how we collect, use, and protect your personal information.");

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <Navbar />
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] rounded-full bg-[#00A8FF]/6 blur-[150px]" />
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] rounded-full bg-[#7B3FE4]/6 blur-[150px]" />
      </div>

      <main className="flex-1 relative z-10 pt-32 pb-24 px-6">
        <div className="container mx-auto max-w-3xl">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-12">
            <div className="inline-flex items-center gap-2 bg-primary/10 border border-primary/20 rounded-full px-4 py-1.5 mb-5">
              <span className="text-primary text-sm font-medium">Legal</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-extrabold text-white mb-4">Privacy Policy</h1>
            <p className="text-muted-foreground text-lg">Last updated: May 2026</p>
          </motion.div>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="text-white/70 leading-relaxed mb-12 text-base"
          >
            At MentoraLM, we take your privacy seriously. This policy explains what information we collect, how we use it, and the choices you have. By using MentoraLM, you agree to the collection and use of information in accordance with this policy.
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
