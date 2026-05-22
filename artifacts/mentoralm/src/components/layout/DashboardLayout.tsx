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
  Settings
} from "lucide-react";
import { useState } from "react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user, signout } = useAuth();
  const [location] = useLocation();
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const navItems = [
    { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { href: "/dashboard/profile", label: "Profile", icon: UserCircle },
    { href: "/dashboard/chat", label: "AI Counsellor", icon: MessageSquare },
    { href: "/dashboard/roadmap", label: "Career Roadmap", icon: Map },
    { href: "/dashboard/marketplace", label: "Services", icon: ShoppingBag },
    { href: "/dashboard/settings", label: "Settings", icon: Settings },
  ];

  const SidebarContent = () => (
    <div className="flex flex-col h-full bg-[#0F1628] border-r border-[#1E2A45]">
      <div className="p-6 border-b border-[#1E2A45]">
        <Link href="/dashboard">
          <img src="/logo.png" alt="MentoraLM" className="h-14 w-auto" />
        </Link>
      </div>
      <div className="flex-1 py-6 px-4 space-y-2">
        {navItems.map((item) => {
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
                <item.icon className="w-5 h-5" />
                <span className="font-medium">{item.label}</span>
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
  );

  return (
    <div className="min-h-screen flex bg-[#080C1A]">
      {/* Desktop Sidebar */}
      <div className="hidden md:block w-72 h-screen sticky top-0">
        <SidebarContent />
      </div>

      {/* Mobile Sidebar & Header */}
      <div className="md:hidden fixed top-0 left-0 right-0 h-16 bg-[#0F1628] border-b border-[#1E2A45] z-50 flex items-center justify-between px-4">
        <Link href="/dashboard">
          <img src="/logo.png" alt="MentoraLM" className="h-12 w-auto" />
        </Link>
        <Sheet open={isMobileOpen} onOpenChange={setIsMobileOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="text-white">
              <Menu className="w-6 h-6" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="p-0 w-72 border-r-[#1E2A45]">
            <SidebarContent />
          </SheetContent>
        </Sheet>
      </div>

      {/* Main Content */}
      <div className="flex-1 md:pt-0 pt-16">
        <main className="h-full p-6 md:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
