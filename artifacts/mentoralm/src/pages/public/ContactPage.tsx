import { motion } from "framer-motion";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useSubmitContact } from "@workspace/api-client-react";
import { toast } from "sonner";
import { useState } from "react";
import { Mail, CheckCircle } from "lucide-react";

const schema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Enter a valid email"),
  message: z.string().min(10, "Message must be at least 10 characters"),
});

export default function ContactPage() {
  const [sent, setSent] = useState(false);
  const submitMutation = useSubmitContact();

  const form = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
    defaultValues: { name: "", email: "", message: "" },
  });

  const onSubmit = (values: z.infer<typeof schema>) => {
    submitMutation.mutate({ data: values }, {
      onSuccess: () => { setSent(true); toast.success("Message sent!"); },
      onError: () => toast.error("Failed to send message. Please try again."),
    });
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-[#7B3FE4]/8 blur-[150px]" />
      </div>

      <main className="relative z-10 pt-32 pb-24 px-6">
        <div className="container mx-auto max-w-2xl">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-extrabold text-white mb-4">Get in touch</h1>
            <p className="text-muted-foreground text-lg">
              Have a question or want to know more? We'd love to hear from you.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-card border border-border rounded-2xl p-8"
          >
            {sent ? (
              <div className="text-center py-8">
                <div className="w-16 h-16 rounded-full bg-emerald-400/10 flex items-center justify-center mx-auto mb-4">
                  <CheckCircle className="w-8 h-8 text-emerald-400" />
                </div>
                <h2 className="text-xl font-bold text-white mb-2">Message received!</h2>
                <p className="text-muted-foreground">
                  We'll get back to you within 24 hours.
                </p>
              </div>
            ) : (
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                      <Mail className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <h2 className="text-white font-bold">Send us a message</h2>
                      <p className="text-muted-foreground text-sm">We read every message</p>
                    </div>
                  </div>

                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Your Name</FormLabel>
                        <FormControl>
                          <Input placeholder="Priya Sharma" {...field} className="bg-[#080C1A] border-[#1E2A45]" data-testid="contact-name" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email Address</FormLabel>
                        <FormControl>
                          <Input type="email" placeholder="you@example.com" {...field} className="bg-[#080C1A] border-[#1E2A45]" data-testid="contact-email" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="message"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Message</FormLabel>
                        <FormControl>
                          <textarea
                            placeholder="Tell us how we can help..."
                            rows={5}
                            {...field}
                            className="w-full rounded-md border border-[#1E2A45] bg-[#080C1A] px-3 py-2 text-sm text-white placeholder:text-muted-foreground resize-none focus:outline-none focus:border-primary/50"
                            data-testid="contact-message"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <Button
                    type="submit"
                    className="w-full bg-gradient-primary border-0 hover:opacity-90 h-12 font-semibold"
                    disabled={submitMutation.isPending}
                    data-testid="contact-submit-btn"
                  >
                    {submitMutation.isPending ? "Sending..." : "Send Message"}
                  </Button>
                </form>
              </Form>
            )}
          </motion.div>

          <div className="mt-8 text-center text-muted-foreground text-sm">
            Or email us directly at{" "}
            <a href="mailto:hello@mentoralm.com" className="text-primary hover:text-primary/80">
              hello@mentoralm.com
            </a>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
