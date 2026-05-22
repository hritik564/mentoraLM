import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Link } from "wouter";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth";
import { useGetProfile, useGetMyBookings, useGetService } from "@workspace/api-client-react";
import { MessageSquare, Map, ShoppingBag, UserCircle, ChevronRight, Calendar, Clock, Eye, BookOpen, Target } from "lucide-react";

const RECENT_KEY = "mentoralm_recent_services";

function getRecentServiceIds(): number[] {
  try {
    const raw = localStorage.getItem(RECENT_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as number[];
  } catch {
    return [];
  }
}

function RecentServiceCard({ id }: { id: number }) {
  const { data: service } = useGetService(id);
  if (!service) return null;
  return (
    <Link href={`/services/${service.id}`}>
      <motion.div
        whileHover={{ y: -2 }}
        className="bg-card border border-border rounded-xl p-4 cursor-pointer flex items-center gap-4"
        data-testid={`recent-service-${service.id}`}
      >
        <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
          <Eye className="w-5 h-5 text-primary" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-white font-medium text-sm truncate">{service.title}</p>
          <p className="text-muted-foreground text-xs mt-0.5">₹{service.price.toLocaleString("en-IN")} · {service.duration} min</p>
        </div>
        <ChevronRight className="w-4 h-4 text-muted-foreground flex-shrink-0" />
      </motion.div>
    </Link>
  );
}

const cardVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: (i: number) => ({ opacity: 1, y: 0, transition: { delay: i * 0.08 } }),
};

export default function DashboardHome() {
  const { user } = useAuth();
  const { data: profile } = useGetProfile();
  const { data: bookings } = useGetMyBookings();
  const [recentIds, setRecentIds] = useState<number[]>([]);

  useEffect(() => {
    setRecentIds(getRecentServiceIds());
  }, []);

  const completionPercent = profile?.completionPercent ?? 0;
  const firstName = user?.name?.split(" ")[0] || "there";
  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";

  const quickActions = [
    { icon: MessageSquare, label: "Chat with AI", desc: "Ask anything about your career", href: "/dashboard/chat", color: "#00A8FF" },
    { icon: Map, label: "Career Roadmap", desc: "View your personalised plan", href: "/dashboard/roadmap", color: "#7B3FE4" },
    { icon: ShoppingBag, label: "Book a Session", desc: "Connect with expert counsellors", href: "/dashboard/marketplace", color: "#FF8C00" },
    { icon: UserCircle, label: "Complete Profile", desc: "Unlock full AI counselling", href: "/dashboard/profile", color: "#10B981" },
  ];

  const upcomingBookings = (bookings || []).filter((b) => b.status === "CONFIRMED").slice(0, 3);

  // Derive profile summary from filled fields
  const interests = profile?.interests
    ? String(profile.interests).split(",").map((s) => s.trim()).filter(Boolean).slice(0, 3)
    : [];
  const dreamCareer = profile?.dreamCareer as string | undefined;
  const stream = profile?.stream as string | undefined;

  return (
    <DashboardLayout>
      <div className="max-w-5xl mx-auto">
        {/* Greeting */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="mb-10">
          <h1 className="text-3xl font-extrabold text-white mb-1">
            {greeting}, {firstName}
          </h1>
          <p className="text-muted-foreground">
            {completionPercent < 50
              ? "Complete your profile to unlock personalised AI counselling."
              : "Your AI counsellor is ready. What would you like to explore today?"}
          </p>
        </motion.div>

        {/* Profile completion */}
        {completionPercent < 100 && (
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}
            className="bg-card border border-border rounded-2xl p-6 mb-8 relative overflow-hidden"
          >
            <div className="absolute top-0 left-0 right-0 h-1 bg-border">
              <div
                className="h-full bg-gradient-primary transition-all duration-700"
                style={{ width: `${completionPercent}%` }}
              />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white font-semibold mb-1">Profile {completionPercent}% complete</p>
                <p className="text-muted-foreground text-sm">
                  {completionPercent < 50
                    ? "Add more info to unlock your career roadmap and personalised AI."
                    : "Almost there — fill in remaining details for the best guidance."}
                </p>
              </div>
              <Link href="/dashboard/profile">
                <Button size="sm" className="bg-gradient-primary border-0 hover:opacity-90 ml-4 flex-shrink-0">
                  Complete Profile
                  <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
              </Link>
            </div>
          </motion.div>
        )}

        {/* AI profile summary card — shown when profile has meaningful data */}
        {completionPercent >= 50 && (interests.length > 0 || dreamCareer || stream) && (
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
            className="bg-card border border-border rounded-2xl p-6 mb-8"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center">
                <BookOpen className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h3 className="text-white font-bold text-sm">Your profile summary</h3>
                <p className="text-muted-foreground text-xs">What your AI counsellor knows about you</p>
              </div>
            </div>
            <div className="flex flex-wrap gap-3 text-sm">
              {stream && (
                <div className="flex items-center gap-2 bg-[#080C1A] border border-border rounded-lg px-3 py-2">
                  <Target className="w-4 h-4 text-[#00A8FF]" />
                  <span className="text-muted-foreground">Stream:</span>
                  <span className="text-white font-medium">{stream}</span>
                </div>
              )}
              {dreamCareer && (
                <div className="flex items-center gap-2 bg-[#080C1A] border border-border rounded-lg px-3 py-2">
                  <Map className="w-4 h-4 text-[#7B3FE4]" />
                  <span className="text-muted-foreground">Goal:</span>
                  <span className="text-white font-medium">{dreamCareer}</span>
                </div>
              )}
              {interests.map((interest) => (
                <div key={interest} className="flex items-center gap-2 bg-[#080C1A] border border-border rounded-lg px-3 py-2">
                  <span className="text-white text-sm">{interest}</span>
                </div>
              ))}
            </div>
            <div className="mt-4">
              <Link href="/dashboard/chat">
                <Button size="sm" className="bg-gradient-primary border-0 text-xs" data-testid="start-chat-btn">
                  <MessageSquare className="w-3.5 h-3.5 mr-1.5" />
                  Chat with AI based on this profile
                </Button>
              </Link>
            </div>
          </motion.div>
        )}

        {/* Quick actions */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
          {quickActions.map((action, i) => (
            <motion.div key={i} custom={i} variants={cardVariants} initial="hidden" animate="visible">
              <Link href={action.href}>
                <motion.div
                  whileHover={{ y: -4, scale: 1.02 }}
                  className="bg-card border border-border rounded-2xl p-5 cursor-pointer h-full"
                  data-testid={`quick-action-${action.label.toLowerCase().replace(/\s+/g, "-")}`}
                >
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center mb-4"
                    style={{ backgroundColor: action.color + "22", border: `1px solid ${action.color}44` }}
                  >
                    <action.icon className="w-5 h-5" style={{ color: action.color }} />
                  </div>
                  <h3 className="text-white font-semibold text-sm mb-1">{action.label}</h3>
                  <p className="text-muted-foreground text-xs">{action.desc}</p>
                </motion.div>
              </Link>
            </motion.div>
          ))}
        </div>

        {/* Recently viewed services */}
        {recentIds.length > 0 && (
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }} className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-white font-bold text-lg">Recently viewed</h2>
              <Link href="/services">
                <span className="text-primary text-sm hover:text-primary/80 cursor-pointer">Browse all</span>
              </Link>
            </div>
            <div className="space-y-3">
              {recentIds.slice(0, 3).map((id) => (
                <RecentServiceCard key={id} id={id} />
              ))}
            </div>
          </motion.div>
        )}

        {/* Upcoming bookings */}
        {upcomingBookings.length > 0 && (
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
            <h2 className="text-white font-bold text-lg mb-4">Upcoming Sessions</h2>
            <div className="space-y-3">
              {upcomingBookings.map((booking) => (
                <div key={booking.id} className="bg-card border border-border rounded-xl p-4 flex items-center gap-4">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <Calendar className="w-5 h-5 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-white font-medium text-sm truncate">
                      {(booking as { service?: { title: string } }).service?.title || `Session #${booking.id}`}
                    </p>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground mt-0.5">
                      <Clock className="w-3 h-3" />
                      {new Date(booking.slotDateTime).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" })}
                    </div>
                  </div>
                  <span className="text-xs font-semibold text-emerald-400 bg-emerald-400/10 px-2.5 py-1 rounded-full flex-shrink-0">
                    Confirmed
                  </span>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </div>
    </DashboardLayout>
  );
}
