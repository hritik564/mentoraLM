import { useEffect, useState } from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";

export function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const { user, signout } = useAuth();
  const [location] = useLocation();

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

  const navLinks = [
    { href: "/", label: "Home" },
    { href: "/services", label: "Services" },
    { href: "/how-it-works", label: "How it works" },
    { href: "/about", label: "About" },
  ];

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isVisible ? "translate-y-0" : "-translate-y-full"
      } ${
        isScrolled
          ? "bg-[#080C1A]/80 backdrop-blur-md border-b border-white/5"
          : "bg-transparent"
      }`}
      style={{ height: 72 }}
    >
      <div className="container mx-auto px-6 h-full flex items-center justify-between">
        <Link
          href={user ? (user.role === "ADMIN" ? "/admin/dashboard" : "/dashboard") : "/"}
          className="flex flex-row items-center gap-1"
        >
          <img src="/logo.png" alt="MentoraLM" style={{ height: 48, width: "auto" }} />
          <span style={{ fontSize: 20, fontWeight: 700 }} className="tracking-tight">
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

        <div className="flex items-center gap-4">
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
      </div>
    </nav>
  );
}
