import { Link, useLocation } from "wouter";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import {
  LayoutDashboard,
  UserCircle,
  MessageSquare,
  ShoppingBag,
  Map,
  LogOut,
  Menu,
  X,
  Settings,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user, signout } = useAuth();
  const [location] = useLocation();
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const mobileRef = useRef<HTMLDivElement | null>(null);

  const desktopNavItems = [
    { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { href: "/dashboard/profile", label: "Profile", icon: UserCircle },
    { href: "/dashboard/chat", label: "Menti", icon: MessageSquare },
    { href: "/dashboard/roadmap", label: "Career Roadmap", icon: Map },
    { href: "/dashboard/marketplace", label: "Services", icon: ShoppingBag },
    { href: "/dashboard/settings", label: "Settings", icon: Settings },
  ];

  const mobileNavItems = [
    { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { href: "/dashboard/chat", label: "Menti", icon: MessageSquare },
    { href: "/dashboard/roadmap", label: "Career Roadmap", icon: Map },
    { href: "/dashboard/marketplace", label: "Services", icon: ShoppingBag },
    { href: "/dashboard/profile", label: "Profile", icon: UserCircle },
  ];

  useEffect(() => {
    setIsMobileOpen(false);
  }, [location]);

  useEffect(() => {
    if (!isMobileOpen) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (mobileRef.current && !mobileRef.current.contains(e.target as Node)) {
        setIsMobileOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isMobileOpen]);

  return (
    <div className="min-h-screen flex bg-[#080C1A]">
      {/* Desktop Sidebar */}
      <div className="hidden md:block w-72 h-screen sticky top-0">
        <div className="flex flex-col h-full bg-[#0F1628] border-r border-[#1E2A45]">
          <div className="p-6 border-b border-[#1E2A45]">
            <Link href="/dashboard" className="flex flex-row items-center">
              <img src="/logo.png" alt="MentoraLM" style={{ height: 48, width: "auto", marginRight: -4 }} />
              <span style={{ fontSize: 26, fontWeight: 700 }} className="tracking-tight">
                <span className="text-white">Mentora</span>
                <span className="text-gradient">LM</span>
              </span>
            </Link>
          </div>
          <div className="flex-1 py-6 px-4 space-y-2">
            {desktopNavItems.map((item) => {
              const isActive = location === item.href;
              return (
                <Link key={item.href} href={item.href}>
                  <div
                    className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors cursor-pointer ${
                      isActive
                        ? "bg-primary/10 text-primary border border-primary/20"
                        : "text-muted-foreground hover:text-white hover:bg-white/5"
                    }`}
                  >
                    <item.icon className="w-5 h-5 flex-shrink-0" />
                    <span className="font-medium">{item.label}</span>
                    {item.label === "Menti" && (
                      <span className="relative flex items-center justify-center flex-shrink-0" style={{ width: 8, height: 8 }}>
                        <span className="absolute rounded-full bg-[#22C55E]/40 animate-ping" style={{ width: 8, height: 8 }} />
                        <motion.span
                          className="relative rounded-full bg-[#22C55E]"
                          style={{ width: 8, height: 8 }}
                          animate={{ scale: [1, 1.2, 1] }}
                          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                        />
                      </span>
                    )}
                  </div>
                </Link>
              );
            })}
          </div>
          <div className="p-6 border-t border-[#1E2A45]">
            <div className="flex items-center gap-3 mb-6 px-2">
              <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold">
                {user?.name?.charAt(0) || "U"}
              </div>
              <div className="overflow-hidden">
                <p className="text-sm font-medium text-white truncate">{user?.name}</p>
                <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
              </div>
            </div>
            <Button
              variant="outline"
              className="w-full justify-start text-muted-foreground hover:text-white border-[#1E2A45]"
              onClick={() => signout()}
            >
              <LogOut className="w-4 h-4 mr-2" />
              Sign Out
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile Header + Slide-down menu */}
      <div
        ref={mobileRef}
        className="md:hidden fixed top-0 left-0 right-0 bg-[#0F1628] border-b border-[#1E2A45] z-50"
      >
        <div className="h-16 flex items-center justify-between px-4">
          <Link href="/dashboard" className="flex flex-row items-center">
            <img
              src="/logo.png"
              alt="MentoraLM"
              style={{
                width: 44,
                height: 44,
                borderRadius: 8,
                objectFit: "contain",
                transform: "scale(1.25)",
                transformOrigin: "center",
                marginRight: 4,
              }}
            />
            <span style={{ fontSize: 18, fontWeight: 700 }} className="tracking-tight">
              <span className="text-white">Mentora</span>
              <span className="text-gradient">LM</span>
            </span>
          </Link>
          <button
            onClick={() => setIsMobileOpen((v) => !v)}
            className="text-white p-2 -mr-2"
            aria-label="Toggle menu"
          >
            {isMobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        <AnimatePresence>
          {isMobileOpen && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="absolute top-full left-0 right-0 bg-[#0F1628] border-b border-[#1E2A45]"
            >
              <div className="flex flex-col px-4 py-3 gap-1">
                {mobileNavItems.map((item) => {
                  const isActive = location === item.href;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setIsMobileOpen(false)}
                    >
                      <div
                        className={`flex items-center gap-3 px-3 py-3 rounded-lg transition-colors cursor-pointer ${
                          isActive
                            ? "bg-primary/10 text-primary"
                            : "text-muted-foreground hover:text-white hover:bg-white/5"
                        }`}
                      >
                        <item.icon className="w-5 h-5 flex-shrink-0" />
                        <span className="font-medium">{item.label}</span>
                        {item.label === "Menti" && (
                          <span className="relative flex items-center justify-center flex-shrink-0" style={{ width: 8, height: 8 }}>
                            <span className="absolute rounded-full bg-[#22C55E]/40 animate-ping" style={{ width: 8, height: 8 }} />
                            <motion.span
                              className="relative rounded-full bg-[#22C55E]"
                              style={{ width: 8, height: 8 }}
                              animate={{ scale: [1, 1.2, 1] }}
                              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                            />
                          </span>
                        )}
                      </div>
                    </Link>
                  );
                })}
                <div className="h-px bg-white/5 my-1" />
                <button
                  onClick={() => {
                    setIsMobileOpen(false);
                    signout();
                  }}
                  className="flex items-center gap-3 px-3 py-3 rounded-lg text-left text-muted-foreground hover:text-white hover:bg-white/5 transition-colors"
                >
                  <LogOut className="w-5 h-5" />
                  <span className="font-medium">Sign Out</span>
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Main Content */}
      <div className="flex-1 md:pt-0 pt-16">
        <main className="h-full p-6 md:p-8">{children}</main>
      </div>
    </div>
  );
}
