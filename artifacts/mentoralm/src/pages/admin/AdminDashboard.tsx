import { motion } from "framer-motion";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { useGetAdminStats, useListAdminBookings, useListAdminStudents } from "@workspace/api-client-react";
import { Users, TrendingUp, Calendar, DollarSign } from "lucide-react";

export default function AdminDashboard() {
  const { data: stats, isLoading: loadingStats } = useGetAdminStats();
  const { data: bookings } = useListAdminBookings();
  const { data: students } = useListAdminStudents();

  const statCards = [
    {
      label: "Total Students",
      value: stats?.totalStudents ?? "—",
      icon: Users,
      color: "#00A8FF",
      desc: "Registered users",
    },
    {
      label: "Active This Week",
      value: stats?.activeThisWeek ?? "—",
      icon: TrendingUp,
      color: "#7B3FE4",
      desc: "Recent activity",
    },
    {
      label: "Bookings This Month",
      value: stats?.bookingsThisMonth ?? "—",
      icon: Calendar,
      color: "#FF8C00",
      desc: "Confirmed sessions",
    },
    {
      label: "Total Revenue",
      value: stats?.totalRevenue != null ? `₹${Number(stats.totalRevenue).toLocaleString("en-IN")}` : "—",
      icon: DollarSign,
      color: "#10B981",
      desc: "All time",
    },
  ];

  return (
    <AdminLayout>
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-2xl font-extrabold text-white mb-1">Overview</h1>
          <p className="text-muted-foreground">Platform health at a glance.</p>
        </div>

        {/* Stat cards */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-10">
          {statCards.map((card, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08 }}
              className="bg-card border border-border rounded-2xl p-6 relative overflow-hidden"
              data-testid={`stat-card-${card.label.toLowerCase().replace(/\s+/g, "-")}`}
            >
              <div
                className="absolute top-0 right-0 w-24 h-24 rounded-full opacity-10 -translate-y-4 translate-x-4"
                style={{ background: card.color }}
              />
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center mb-4"
                style={{ backgroundColor: card.color + "22", border: `1px solid ${card.color}44` }}
              >
                <card.icon className="w-5 h-5" style={{ color: card.color }} />
              </div>
              {loadingStats ? (
                <div className="h-8 bg-border/30 rounded animate-pulse mb-1 w-20" />
              ) : (
                <div className="text-3xl font-extrabold text-white mb-1">{card.value}</div>
              )}
              <p className="text-muted-foreground text-sm">{card.label}</p>
              <p className="text-xs text-muted-foreground/60 mt-0.5">{card.desc}</p>
            </motion.div>
          ))}
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Recent Students */}
          <div className="bg-card border border-border rounded-2xl p-6">
            <h2 className="text-white font-bold mb-5">Recent Students</h2>
            <div className="space-y-3">
              {(students || []).slice(0, 5).map((student) => (
                <div key={student.id} className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary text-sm font-bold flex-shrink-0">
                    {student.name.charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-white text-sm font-medium truncate">{student.name}</p>
                    <p className="text-muted-foreground text-xs truncate">{student.email}</p>
                  </div>
                  <span className="text-xs text-primary bg-primary/10 px-2 py-0.5 rounded-full flex-shrink-0">
                    {student.completionPercent}%
                  </span>
                </div>
              ))}
              {(!students || students.length === 0) && (
                <p className="text-muted-foreground text-sm">No students yet.</p>
              )}
            </div>
          </div>

          {/* Recent Bookings */}
          <div className="bg-card border border-border rounded-2xl p-6">
            <h2 className="text-white font-bold mb-5">Recent Bookings</h2>
            <div className="space-y-3">
              {(bookings || []).slice(0, 5).map((booking) => (
                <div key={booking.id} className="flex items-center gap-3">
                  <div className="flex-1 min-w-0">
                    <p className="text-white text-sm font-medium truncate">{booking.studentName}</p>
                    <p className="text-muted-foreground text-xs truncate">{booking.serviceTitle}</p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-white text-sm font-semibold">₹{booking.amount.toLocaleString("en-IN")}</p>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${
                      booking.status === "CONFIRMED"
                        ? "text-emerald-400 bg-emerald-400/10"
                        : "text-amber-400 bg-amber-400/10"
                    }`}>
                      {booking.status}
                    </span>
                  </div>
                </div>
              ))}
              {(!bookings || bookings.length === 0) && (
                <p className="text-muted-foreground text-sm">No bookings yet.</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
