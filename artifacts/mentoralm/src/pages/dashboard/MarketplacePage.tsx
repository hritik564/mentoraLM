import { useState } from "react";
import { Link } from "wouter";
import { motion } from "framer-motion";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { useListServices, useGetMyBookings } from "@workspace/api-client-react";
import { Clock, User, Calendar, CheckCircle, ChevronRight } from "lucide-react";

export default function MarketplacePage() {
  const [tab, setTab] = useState<"browse" | "purchases">("browse");
  const { data: services, isLoading: loadingServices } = useListServices();
  const { data: bookings, isLoading: loadingBookings } = useGetMyBookings();

  const statusColor: Record<string, string> = {
    CONFIRMED: "text-emerald-400 bg-emerald-400/10",
    PENDING: "text-amber-400 bg-amber-400/10",
    CANCELLED: "text-red-400 bg-red-400/10",
  };

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-2xl font-extrabold text-white mb-1">Services Marketplace</h1>
          <p className="text-muted-foreground">Book expert sessions and manage your purchases.</p>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 bg-card border border-border rounded-xl p-1 mb-8 w-fit">
          {(["browse", "purchases"] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              data-testid={`tab-${t}`}
              className={`px-6 py-2.5 rounded-lg text-sm font-medium transition-all ${
                tab === t ? "bg-gradient-primary text-white" : "text-muted-foreground hover:text-white"
              }`}
            >
              {t === "browse" ? "Browse Services" : "My Purchases"}
            </button>
          ))}
        </div>

        {tab === "browse" && (
          <>
            {loadingServices ? (
              <div className="grid md:grid-cols-2 gap-5">
                {[1, 2, 3, 4].map((i) => <div key={i} className="bg-card border border-border rounded-2xl h-64 animate-pulse" />)}
              </div>
            ) : (
              <div className="grid md:grid-cols-2 gap-5">
                {(services || []).map((service, i) => (
                  <motion.div
                    key={service.id}
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.08 }}
                    whileHover={{ y: -4 }}
                    className="bg-card border border-border rounded-2xl overflow-hidden"
                    data-testid={`marketplace-service-${service.id}`}
                  >
                    <div className="h-20 bg-gradient-primary opacity-60" />
                    <div className="p-5">
                      <div className="inline-block text-xs font-semibold text-primary bg-primary/10 rounded-full px-2.5 py-0.5 mb-2">
                        {service.category}
                      </div>
                      <h3 className="text-white font-bold mb-1">{service.title}</h3>
                      <p className="text-muted-foreground text-xs mb-4 line-clamp-2">{service.shortDesc}</p>
                      <div className="flex items-center gap-4 text-xs text-muted-foreground mb-4">
                        <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{service.duration} min</span>
                        <span className="flex items-center gap-1"><User className="w-3 h-3" />{service.counsellorName}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-white font-bold text-lg">₹{service.price.toLocaleString("en-IN")}</span>
                        <Link href={`/services/${service.id}`}>
                          <Button size="sm" className="bg-gradient-primary border-0 hover:opacity-90">
                            Book Now
                            <ChevronRight className="w-3.5 h-3.5 ml-1" />
                          </Button>
                        </Link>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </>
        )}

        {tab === "purchases" && (
          <>
            {loadingBookings ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => <div key={i} className="bg-card border border-border rounded-xl h-20 animate-pulse" />)}
              </div>
            ) : !bookings || bookings.length === 0 ? (
              <div className="text-center py-20">
                <div className="w-14 h-14 rounded-full bg-card border border-border flex items-center justify-center mx-auto mb-4">
                  <Calendar className="w-6 h-6 text-muted-foreground" />
                </div>
                <p className="text-muted-foreground mb-4">No bookings yet.</p>
                <button onClick={() => setTab("browse")} className="text-primary hover:text-primary/80 text-sm font-medium">
                  Browse services
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {bookings.map((booking) => (
                  <div key={booking.id} className="bg-card border border-border rounded-xl p-5 flex items-center gap-4" data-testid={`booking-${booking.id}`}>
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <CheckCircle className="w-5 h-5 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-white font-semibold text-sm">
                        {(booking as { service?: { title: string } }).service?.title || `Session #${booking.id}`}
                      </p>
                      <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {new Date(booking.slotDateTime).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" })}
                        </span>
                        <span>₹{booking.amount.toLocaleString("en-IN")}</span>
                      </div>
                    </div>
                    <span className={`text-xs font-semibold px-2.5 py-1 rounded-full flex-shrink-0 ${statusColor[booking.status] || "text-muted-foreground bg-muted/20"}`}>
                      {booking.status}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </DashboardLayout>
  );
}
