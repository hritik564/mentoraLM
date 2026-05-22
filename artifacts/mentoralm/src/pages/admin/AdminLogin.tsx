import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Link, useLocation } from "wouter";
import { useSignin } from "@workspace/api-client-react";
import { useAuth } from "@/lib/auth";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Shield } from "lucide-react";

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export default function AdminLogin() {
  const [, setLocation] = useLocation();
  const { signin } = useAuth();
  const signinMutation = useSignin();

  const form = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
    defaultValues: { email: "admin@mentoralm.com", password: "Admin@123" },
  });

  const onSubmit = (values: z.infer<typeof schema>) => {
    signinMutation.mutate({ data: values }, {
      onSuccess: (res) => {
        if (res.user.role !== "ADMIN") {
          toast.error("Access denied. Admin credentials required.");
          return;
        }
        signin(res.accessToken, res.user);
        toast.success("Welcome, Admin");
        setLocation("/admin/dashboard");
      },
      onError: () => toast.error("Invalid credentials"),
    });
  };

  return (
    <div className="min-h-screen bg-[#080C1A] flex flex-col justify-center py-12 px-6 relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none z-0">
        <div className="absolute top-[-20%] right-[-10%] w-[500px] h-[500px] rounded-full bg-[#FF4D6D]/8 blur-[120px]" />
        <div className="absolute bottom-[-20%] left-[-10%] w-[500px] h-[500px] rounded-full bg-[#7B3FE4]/8 blur-[120px]" />
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        <Link href="/" className="text-3xl font-bold tracking-tight text-center block mb-8">
          <span className="text-white">Mentora</span>
          <span className="text-gradient">LM</span>
          <span className="ml-2 text-xs bg-destructive text-white px-2 py-0.5 rounded uppercase tracking-wider font-bold align-middle">Admin</span>
        </Link>

        <div className="bg-[#0F1628] py-8 px-8 shadow-xl border border-[#1E2A45] rounded-xl">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-destructive/10 flex items-center justify-center">
              <Shield className="w-5 h-5 text-destructive" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">Admin Access</h2>
              <p className="text-muted-foreground text-sm">Restricted area</p>
            </div>
          </div>

          {/* Demo credentials banner */}
          <div className="bg-[#080C1A] border border-[#1E2A45] rounded-lg p-3 mb-6">
            <p className="text-xs text-muted-foreground mb-1 font-medium">Demo credentials (pre-filled):</p>
            <p className="text-xs font-mono text-white/70">admin@mentoralm.com / Admin@123</p>
          </div>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input type="email" {...field} className="bg-[#080C1A] border-[#1E2A45]" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                      <Input type="password" {...field} className="bg-[#080C1A] border-[#1E2A45]" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button
                type="submit"
                className="w-full bg-destructive hover:bg-destructive/90 border-0"
                disabled={signinMutation.isPending}
                data-testid="admin-login-btn"
              >
                {signinMutation.isPending ? "Signing in..." : "Sign In as Admin"}
              </Button>
            </form>
          </Form>

          <div className="mt-5 text-center">
            <Link href="/" className="text-sm text-muted-foreground hover:text-white transition-colors">
              Back to site
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
