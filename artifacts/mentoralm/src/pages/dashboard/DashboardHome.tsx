import { motion } from "framer-motion";
import { Link } from "wouter";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth";
import { useGetProfile, useGetMyBookings } from "@workspace/api-client-react";
import { MessageSquare, Map, ShoppingBag, UserCircle, ChevronRight, Calendar, Clock } from "lucide-react";

const cardVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: (i: number) => ({ opacity: 1, y: 0, transition: { delay: i * 0.08 } }),
};

export default function DashboardHome() {
  const { user } = useAuth();
  const { data: profile } = useGetProfile();
  const { data: bookings } = useGetMyBookings();

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

        {/* AI nudge — only show when profile is meaningful (>= 50% complete) */}
        {completionPercent >= 50 && (
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
            className="mt-8 relative rounded-2xl overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-primary opacity-10" />
            <div className="relative border border-primary/20 rounded-2xl p-8 flex items-center justify-between gap-6">
              <div>
                <h3 className="text-white font-bold text-lg mb-1">Your AI counsellor knows your profile</h3>
                <p className="text-muted-foreground text-sm max-w-sm">
                  Get personalised guidance based on your background, interests, and goals. Available 24/7.
                </p>
              </div>
              <Link href="/dashboard/chat">
                <Button className="bg-gradient-primary border-0 hover:opacity-90 flex-shrink-0" data-testid="start-chat-btn">
                  <MessageSquare className="w-4 h-4 mr-2" />
                  Start Chat
                </Button>
              </Link>
            </div>
          </motion.div>
        )}
      </div>
    </DashboardLayout>
  );
}
