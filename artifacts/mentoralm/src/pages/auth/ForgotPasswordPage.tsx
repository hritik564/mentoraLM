import { useState } from "react";
import { Link } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useForgotPassword, useResetPassword } from "@workspace/api-client-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { ArrowLeft, Mail, KeyRound } from "lucide-react";

const emailSchema = z.object({ email: z.string().email("Enter a valid email address") });
const resetSchema = z.object({
  otp: z.string().min(4, "OTP is required"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  confirmPassword: z.string(),
}).refine((d) => d.password === d.confirmPassword, { message: "Passwords do not match", path: ["confirmPassword"] });

export default function ForgotPasswordPage() {
  const [step, setStep] = useState<"email" | "reset" | "done">("email");
  const [email, setEmail] = useState("");

  const forgotMutation = useForgotPassword();
  const resetMutation = useResetPassword();

  const emailForm = useForm<z.infer<typeof emailSchema>>({
    resolver: zodResolver(emailSchema),
    defaultValues: { email: "" },
  });

  const resetForm = useForm<z.infer<typeof resetSchema>>({
    resolver: zodResolver(resetSchema),
    defaultValues: { otp: "", password: "", confirmPassword: "" },
  });

  const onEmailSubmit = (values: z.infer<typeof emailSchema>) => {
    forgotMutation.mutate({ data: { email: values.email } }, {
      onSuccess: () => {
        setEmail(values.email);
        setStep("reset");
        toast.success("OTP sent to your email");
      },
      onError: () => toast.error("Could not send OTP. Please try again."),
    });
  };

  const onResetSubmit = (values: z.infer<typeof resetSchema>) => {
    resetMutation.mutate({ data: { email, otp: values.otp, newPassword: values.password } }, {
      onSuccess: () => setStep("done"),
      onError: () => toast.error("Invalid OTP or expired. Please try again."),
    });
  };

  return (
    <div className="min-h-screen bg-[#080C1A] flex flex-col justify-center py-12 px-6 relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none z-0">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-[#7B3FE4]/8 blur-[120px]" />
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        <Link href="/" className="text-3xl font-bold tracking-tight text-center block mb-6">
          <span className="text-white">Mentora</span>
          <span className="text-gradient">LM</span>
        </Link>

        <div className="bg-[#0F1628] py-8 px-8 shadow-xl border border-[#1E2A45] rounded-xl">
          {step === "email" && (
            <>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                  <Mail className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white">Forgot password?</h2>
                  <p className="text-muted-foreground text-sm">We'll send you a reset OTP</p>
                </div>
              </div>
              <Form {...emailForm}>
                <form onSubmit={emailForm.handleSubmit(onEmailSubmit)} className="space-y-5">
                  <FormField
                    control={emailForm.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email address</FormLabel>
                        <FormControl>
                          <Input type="email" placeholder="you@example.com" {...field} className="bg-[#080C1A] border-[#1E2A45]" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button type="submit" className="w-full bg-gradient-primary border-0" disabled={forgotMutation.isPending}>
                    {forgotMutation.isPending ? "Sending OTP..." : "Send OTP"}
                  </Button>
                </form>
              </Form>
            </>
          )}

          {step === "reset" && (
            <>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                  <KeyRound className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white">Enter OTP</h2>
                  <p className="text-muted-foreground text-sm">Check your email at {email}</p>
                </div>
              </div>
              <Form {...resetForm}>
                <form onSubmit={resetForm.handleSubmit(onResetSubmit)} className="space-y-5">
                  <FormField
                    control={resetForm.control}
                    name="otp"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>OTP</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter OTP from email" {...field} className="bg-[#080C1A] border-[#1E2A45] text-lg tracking-widest" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={resetForm.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>New Password</FormLabel>
                        <FormControl>
                          <Input type="password" placeholder="Min 6 characters" {...field} className="bg-[#080C1A] border-[#1E2A45]" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={resetForm.control}
                    name="confirmPassword"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Confirm Password</FormLabel>
                        <FormControl>
                          <Input type="password" placeholder="Repeat password" {...field} className="bg-[#080C1A] border-[#1E2A45]" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button type="submit" className="w-full bg-gradient-primary border-0" disabled={resetMutation.isPending}>
                    {resetMutation.isPending ? "Resetting..." : "Reset Password"}
                  </Button>
                </form>
              </Form>
            </>
          )}

          {step === "done" && (
            <div className="text-center py-4">
              <div className="w-16 h-16 rounded-full bg-emerald-400/10 flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h2 className="text-xl font-bold text-white mb-2">Password reset!</h2>
              <p className="text-muted-foreground text-sm mb-6">Your password has been updated. You can now sign in.</p>
              <Link href="/auth/signin">
                <Button className="w-full bg-gradient-primary border-0">Go to Sign In</Button>
              </Link>
            </div>
          )}

          <div className="mt-6 text-center">
            <Link href="/auth/signin" className="text-sm text-muted-foreground hover:text-white flex items-center justify-center gap-1">
              <ArrowLeft className="w-3 h-3" />
              Back to sign in
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
