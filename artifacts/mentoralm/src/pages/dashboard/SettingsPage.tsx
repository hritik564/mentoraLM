import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useAuth } from "@/lib/auth";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { Lock, Phone, CheckCircle } from "lucide-react";
import { usePageMeta } from "@/lib/usePageMeta";

const phoneSchema = z.object({
  phone: z.string().min(10, "Phone number must be at least 10 digits"),
});

const passwordSchema = z
  .object({
    currentPassword: z.string().min(1, "Current password is required"),
    newPassword: z.string().min(6, "New password must be at least 6 characters"),
    confirmPassword: z.string(),
  })
  .refine((d) => d.newPassword === d.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

const inputCls = "bg-[#080C1A] border-[#1E2A45] focus-visible:ring-primary/30";

export default function SettingsPage() {
  usePageMeta("Settings");
  const { token, user, signin } = useAuth();
  const [phoneSaving, setPhoneSaving] = useState(false);
  const [pwSaving, setPwSaving] = useState(false);

  const phoneForm = useForm<z.infer<typeof phoneSchema>>({
    resolver: zodResolver(phoneSchema),
    defaultValues: { phone: user?.phone ?? "" },
  });

  const pwForm = useForm<z.infer<typeof passwordSchema>>({
    resolver: zodResolver(passwordSchema),
    defaultValues: { currentPassword: "", newPassword: "", confirmPassword: "" },
  });

  const onSavePhone = async (values: z.infer<typeof phoneSchema>) => {
    setPhoneSaving(true);
    try {
      const res = await fetch("/api/auth/me", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ phone: values.phone }),
      });
      if (!res.ok) throw new Error();
      const updated = await res.json();
      if (user) signin(token!, { ...user, ...updated });
      toast.success("Phone number updated");
    } catch {
      toast.error("Failed to update phone number");
    } finally {
      setPhoneSaving(false);
    }
  };

  const onChangePassword = async (values: z.infer<typeof passwordSchema>) => {
    setPwSaving(true);
    try {
      const res = await fetch("/api/auth/change-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          currentPassword: values.currentPassword,
          newPassword: values.newPassword,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed");
      toast.success("Password changed successfully");
      pwForm.reset();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed to change password");
    } finally {
      setPwSaving(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="max-w-2xl mx-auto">
        <div className="mb-8">
          <h1 className="text-2xl font-extrabold text-white">Settings</h1>
          <p className="text-muted-foreground text-sm mt-1">Manage your account details and security.</p>
        </div>

        <div className="space-y-6">
          {/* Account info card */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-card border border-border rounded-2xl p-6"
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-[#00A8FF]/10 border border-[#00A8FF]/20 flex items-center justify-center">
                <Phone className="w-5 h-5 text-[#00A8FF]" />
              </div>
              <div>
                <h2 className="text-white font-bold">Contact Details</h2>
                <p className="text-muted-foreground text-xs">Update your phone number</p>
              </div>
            </div>

            <div className="mb-4 p-3 rounded-xl bg-white/3 border border-white/5 text-sm">
              <span className="text-muted-foreground">Email: </span>
              <span className="text-white font-medium">{user?.email}</span>
              <span className="ml-3 text-xs text-muted-foreground">(cannot be changed)</span>
            </div>

            <Form {...phoneForm}>
              <form onSubmit={phoneForm.handleSubmit(onSavePhone)} className="space-y-4">
                <FormField
                  control={phoneForm.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Phone Number <span className="text-red-400">*</span></FormLabel>
                      <FormControl>
                        <Input type="tel" placeholder="+91 9876543210" {...field} className={inputCls} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button
                  type="submit"
                  disabled={phoneSaving}
                  className="bg-gradient-primary border-0 hover:opacity-90"
                >
                  {phoneSaving ? "Saving..." : (
                    <><CheckCircle className="w-4 h-4 mr-2" />Save Phone Number</>
                  )}
                </Button>
              </form>
            </Form>
          </motion.div>

          {/* Change password card */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.08 }}
            className="bg-card border border-border rounded-2xl p-6"
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-[#7B3FE4]/10 border border-[#7B3FE4]/20 flex items-center justify-center">
                <Lock className="w-5 h-5 text-[#7B3FE4]" />
              </div>
              <div>
                <h2 className="text-white font-bold">Change Password</h2>
                <p className="text-muted-foreground text-xs">Must be at least 6 characters</p>
              </div>
            </div>

            <Form {...pwForm}>
              <form onSubmit={pwForm.handleSubmit(onChangePassword)} className="space-y-4">
                <FormField
                  control={pwForm.control}
                  name="currentPassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Current Password <span className="text-red-400">*</span></FormLabel>
                      <FormControl>
                        <Input type="password" placeholder="••••••••" {...field} className={inputCls} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={pwForm.control}
                  name="newPassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>New Password <span className="text-red-400">*</span></FormLabel>
                      <FormControl>
                        <Input type="password" placeholder="••••••••" {...field} className={inputCls} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={pwForm.control}
                  name="confirmPassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Confirm New Password <span className="text-red-400">*</span></FormLabel>
                      <FormControl>
                        <Input type="password" placeholder="••••••••" {...field} className={inputCls} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button
                  type="submit"
                  disabled={pwSaving}
                  className="bg-gradient-primary border-0 hover:opacity-90"
                >
                  {pwSaving ? "Changing..." : (
                    <><Lock className="w-4 h-4 mr-2" />Change Password</>
                  )}
                </Button>
              </form>
            </Form>
          </motion.div>
        </div>
      </div>
    </DashboardLayout>
  );
}
