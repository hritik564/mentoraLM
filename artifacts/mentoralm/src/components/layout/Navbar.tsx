import { useEffect, useRef, useState } from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { AnimatePresence, motion } from "framer-motion";
import { Menu, X } from "lucide-react";

export function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const { user, signout } = useAuth();
  const [location] = useLocation();
  const mobileRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      setIsScrolled(currentScrollY > 20);

      if (currentScrollY > lastScrollY && currentScrollY > 100) {
        setIsVisible(false);
      } else {
        setIsVisible(true);
      }
      setLastScrollY(currentScrollY);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [lastScrollY]);

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

  useEffect(() => {
    setIsMobileOpen(false);
  }, [location]);

  const navLinks = [
    { href: "/", label: "Home" },
    { href: "/services", label: "Services" },
    { href: "/how-it-works", label: "How it works" },
    { href: "/about", label: "About" },
  ];

  return (
    <nav
      ref={mobileRef}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isVisible ? "translate-y-0" : "-translate-y-full"
      } ${
        isScrolled || isMobileOpen
          ? "bg-[#080C1A]/80 backdrop-blur-md border-b border-white/5"
          : "bg-transparent"
      }`}
      style={{ height: 72 }}
    >
      <div className="container mx-auto px-6 h-full flex items-center justify-between">
        <Link
          href={user ? (user.role === "ADMIN" ? "/admin/dashboard" : "/dashboard") : "/"}
          className="flex flex-row items-center"
        >
          <img
            src="/logo.png"
            alt="MentoraLM"
            className="hidden md:block"
            style={{ height: 48, width: "auto", marginRight: -4 }}
          />
          <span className="tracking-tight font-bold text-[18px] md:text-[26px]">
            <span className="text-white">Mentora</span>
            <span className="text-gradient">LM</span>
          </span>
        </Link>

        <div className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => {
            const isActive = location === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`text-base font-medium transition-colors hover:text-white relative ${
                  isActive ? "text-white" : "text-muted-foreground"
                }`}
              >
                {link.label}
                {isActive && (
                  <div className="absolute -bottom-2 left-0 right-0 h-0.5 bg-gradient-primary rounded-full" />
                )}
              </Link>
            );
          })}
        </div>

        <div className="hidden md:flex items-center gap-4">
          {user ? (
            <>
              <Link href={user.role === "ADMIN" ? "/admin/dashboard" : "/dashboard"}>
                <Button variant="ghost" className="text-muted-foreground hover:text-white">
                  Dashboard
                </Button>
              </Link>
              <Button onClick={() => signout()} variant="outline" className="border-white/10">
                Sign Out
              </Button>
            </>
          ) : (
            <>
              <Link href="/auth/signin">
                <Button variant="ghost" className="text-muted-foreground hover:text-white">
                  Sign In
                </Button>
              </Link>
              <Link href="/auth/signup">
                <Button className="bg-gradient-primary border-0 hover:opacity-90 text-white font-medium">
                  Get Started
                </Button>
              </Link>
            </>
          )}
        </div>

        {/* Mobile right side */}
        <div className="flex md:hidden items-center gap-2">
          {!user && (
            <Link href="/auth/signup">
              <Button
                size="sm"
                className="bg-gradient-primary border-0 hover:opacity-90 text-white font-medium h-9 px-3 text-sm"
              >
                Get Started
              </Button>
            </Link>
          )}
          <button
            onClick={() => setIsMobileOpen((v) => !v)}
            className="text-white p-2 -mr-2"
            aria-label="Toggle menu"
          >
            {isMobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile dropdown */}
      <AnimatePresence>
        {isMobileOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="md:hidden absolute top-full left-0 right-0 bg-[#080C1A]/95 backdrop-blur-md border-b border-white/5"
          >
            <div className="flex flex-col px-6 py-4 gap-1">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setIsMobileOpen(false)}
                  className={`text-base font-medium py-3 px-2 rounded-lg transition-colors ${
                    location === link.href
                      ? "text-white bg-white/5"
                      : "text-muted-foreground hover:text-white hover:bg-white/5"
                  }`}
                >
                  {link.label}
                </Link>
              ))}
              <div className="h-px bg-white/5 my-2" />
              {user ? (
                <>
                  <Link
                    href={user.role === "ADMIN" ? "/admin/dashboard" : "/dashboard"}
                    onClick={() => setIsMobileOpen(false)}
                    className="text-base font-medium py-3 px-2 rounded-lg text-muted-foreground hover:text-white hover:bg-white/5"
                  >
                    Dashboard
                  </Link>
                  <button
                    onClick={() => {
                      setIsMobileOpen(false);
                      signout();
                    }}
                    className="text-base font-medium py-3 px-2 rounded-lg text-left text-muted-foreground hover:text-white hover:bg-white/5"
                  >
                    Sign Out
                  </button>
                </>
              ) : (
                <>
                  <Link
                    href="/auth/signin"
                    onClick={() => setIsMobileOpen(false)}
                    className="text-base font-medium py-3 px-2 rounded-lg text-muted-foreground hover:text-white hover:bg-white/5"
                  >
                    Sign In
                  </Link>
                  <Link href="/auth/signup" onClick={() => setIsMobileOpen(false)}>
                    <Button className="w-full mt-2 bg-gradient-primary border-0 hover:opacity-90 text-white font-medium h-11">
                      Get Started
                    </Button>
                  </Link>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
