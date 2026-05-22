import { useState, useEffect } from "react";
import { useParams, useLocation } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { useGetService, useCreateBooking, useVerifyBooking, getGetMyBookingsQueryKey, getGetServiceQueryKey } from "@workspace/api-client-react";
import { Clock, User, CheckCircle, ArrowLeft, Calendar, X, Loader2 } from "lucide-react";
import { Link } from "wouter";
import { useAuth } from "@/lib/auth";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

declare global {
  interface Window {
    Razorpay: new (opts: Record<string, unknown>) => { open: () => void };
  }
}

function loadRazorpay(): Promise<boolean> {
  return new Promise((resolve) => {
    if (window.Razorpay) { resolve(true); return; }
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

function parseSlots(raw: unknown): string[] {
  if (Array.isArray(raw)) return raw as string[];
  if (typeof raw === "string") {
    try { const p = JSON.parse(raw); return Array.isArray(p) ? p : []; } catch { return []; }
  }
  return [];
}

function SlotModal({
  service,
  onClose,
  onConfirm,
  isPending,
}: {
  service: { title: string; price: number; duration: number | string; slots?: unknown };
  onClose: () => void;
  onConfirm: (slot: string) => void;
  isPending: boolean;
}) {
  const availableSlots = parseSlots(service.slots).filter(
    (s) => new Date(s) > new Date()
  );
  const [selectedSlot, setSelectedSlot] = useState(availableSlots[0] ?? "");

  const handleConfirm = () => {
    if (!selectedSlot) return;
    onConfirm(selectedSlot);
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="bg-[#0F1628] border border-[#1E2A45] rounded-2xl w-full max-w-md"
      >
        <div className="flex items-center justify-between p-6 border-b border-[#1E2A45]">
          <div>
            <h2 className="text-white font-bold text-lg">Choose a slot</h2>
            <p className="text-muted-foreground text-sm truncate max-w-[250px]">{service.title}</p>
          </div>
          <button onClick={onClose} className="text-muted-foreground hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          {availableSlots.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 gap-3 text-center">
              <Calendar className="w-10 h-10 text-muted-foreground opacity-30" />
              <p className="text-muted-foreground text-sm">No slots available yet.</p>
              <p className="text-xs text-muted-foreground/60">Check back soon — the counsellor will add available times.</p>
            </div>
          ) : (
            <div>
              <label className="text-sm font-medium text-white mb-3 block">Select an available slot</label>
              <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                {availableSlots.map((slot) => {
                  const dt = new Date(slot);
                  const isSelected = selectedSlot === slot;
                  return (
                    <button
                      key={slot}
                      onClick={() => setSelectedSlot(slot)}
                      data-testid={`slot-option-${slot}`}
                      className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl border text-left transition-all ${
                        isSelected
                          ? "border-[#00A8FF]/50 bg-[#00A8FF]/10"
                          : "border-[#1E2A45] bg-[#080C1A] hover:border-[#1E2A45]/80 hover:bg-[#080C1A]/60"
                      }`}
                    >
                      <div className={`w-4 h-4 rounded-full border-2 flex-shrink-0 flex items-center justify-center ${
                        isSelected ? "border-[#00A8FF] bg-[#00A8FF]" : "border-[#1E2A45]"
                      }`}>
                        {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                      </div>
                      <div>
                        <p className="text-white text-sm font-medium">
                          {dt.toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "long", year: "numeric" })}
                        </p>
                        <p className="text-muted-foreground text-xs">
                          {dt.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", hour12: true })}
                        </p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          <div className="bg-[#080C1A] rounded-xl p-4 border border-[#1E2A45]">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Session duration</span>
              <span className="text-white">{service.duration} min</span>
            </div>
            <div className="flex justify-between text-sm mt-2">
              <span className="text-muted-foreground">Total</span>
              <span className="text-white font-bold">₹{service.price.toLocaleString("en-IN")}</span>
            </div>
          </div>
        </div>

        <div className="p-6 border-t border-[#1E2A45] flex gap-3">
          <Button variant="outline" onClick={onClose} className="flex-1 border-border" disabled={isPending}>
            Cancel
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={isPending || !selectedSlot || availableSlots.length === 0}
            className="flex-1 bg-gradient-primary border-0"
            data-testid="confirm-slot-btn"
          >
            {isPending ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Processing...</> : "Pay ₹" + service.price.toLocaleString("en-IN")}
          </Button>
        </div>
      </motion.div>
    </div>
  );
}

export default function ServiceDetailPage() {
  const params = useParams<{ id: string }>();
  const id = Number(params.id);
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();
  const [showModal, setShowModal] = useState(false);
  const [isCheckoutPending, setIsCheckoutPending] = useState(false);

  const { data: service, isLoading, error } = useGetService(id, {
    query: { enabled: !!id, queryKey: getGetServiceQueryKey(id) },
  });

  // Track recently viewed services in localStorage
  useEffect(() => {
    if (!service) return;
    try {
      const key = "mentoralm_recent_services";
      const existing: number[] = JSON.parse(localStorage.getItem(key) ?? "[]");
      const updated = [service.id, ...existing.filter((i) => i !== service.id)].slice(0, 5);
      localStorage.setItem(key, JSON.stringify(updated));
    } catch {
      // ignore storage errors
    }
  }, [service]);

  const createBookingMutation = useCreateBooking();
  const verifyBookingMutation = useVerifyBooking();

  const handleBook = () => {
    if (!user) {
      setLocation(`/auth/signin`);
    } else {
      setShowModal(true);
    }
  };

  const handleConfirmSlot = async (slotDateTime: string) => {
    setIsCheckoutPending(true);
    try {
      const loaded = await loadRazorpay();
      if (!loaded) {
        toast.error("Failed to load payment gateway. Please try again.");
        setIsCheckoutPending(false);
        return;
      }

      createBookingMutation.mutate(
        { data: { serviceId: id, slotDateTime } },
        {
          onSuccess: (order) => {
            setShowModal(false);
            const rzp = new window.Razorpay({
              key: order.razorpayKeyId,
              amount: order.amount,
              currency: order.currency,
              name: "MentoraLM",
              description: service?.title || "Counselling Session",
              order_id: order.razorpayOrderId,
              prefill: {
                name: user?.name,
                email: user?.email,
              },
              theme: { color: "#00A8FF" },
              handler: (response: {
                razorpay_order_id: string;
                razorpay_payment_id: string;
                razorpay_signature: string;
              }) => {
                verifyBookingMutation.mutate(
                  {
                    data: {
                      bookingId: order.bookingId,
                      razorpayOrderId: response.razorpay_order_id,
                      razorpayPaymentId: response.razorpay_payment_id,
                      razorpaySignature: response.razorpay_signature,
                    },
                  },
                  {
                    onSuccess: () => {
                      toast.success("Payment successful! Your session is confirmed.");
                      queryClient.invalidateQueries({ queryKey: getGetMyBookingsQueryKey() });
                      setIsCheckoutPending(false);
                      setLocation("/dashboard/marketplace");
                    },
                    onError: () => {
                      toast.error("Payment verification failed. Please contact support.");
                      setIsCheckoutPending(false);
                    },
                  }
                );
              },
              modal: {
                ondismiss: () => {
                  setIsCheckoutPending(false);
                  toast.info("Payment cancelled.");
                },
              },
            });
            rzp.open();
          },
          onError: () => {
            toast.error("Failed to create booking. Please try again.");
            setIsCheckoutPending(false);
          },
        }
      );
    } catch {
      toast.error("An unexpected error occurred.");
      setIsCheckoutPending(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin w-10 h-10 border-4 border-primary border-t-transparent rounded-full" />
        </div>
      </div>
    );
  }

  if (error || !service) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="flex flex-col items-center justify-center min-h-screen gap-4">
          <p className="text-muted-foreground text-lg">Service not found.</p>
          <Link href="/services"><Button variant="outline">Back to Services</Button></Link>
        </div>
      </div>
    );
  }

  const includedItems = Array.isArray(service.included)
    ? service.included
    : typeof service.included === "string"
    ? (service.included as string).split("\n").filter(Boolean)
    : [];

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-0 left-0 w-[500px] h-[500px] rounded-full bg-[#00A8FF]/8 blur-[150px]" />
      </div>

      <main className="relative z-10 pt-32 pb-24 px-6">
        <div className="container mx-auto max-w-5xl">
          <Link href="/services">
            <Button variant="ghost" className="text-muted-foreground hover:text-white mb-8 -ml-2">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Services
            </Button>
          </Link>

          <div className="grid lg:grid-cols-3 gap-10">
            {/* Main content */}
            <div className="lg:col-span-2">
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                <div className="inline-block text-xs font-semibold text-primary bg-primary/10 rounded-full px-3 py-1 mb-4">
                  {service.category}
                </div>
                <h1 className="text-3xl md:text-4xl font-extrabold text-white mb-4">{service.title}</h1>
                <p className="text-muted-foreground text-lg leading-relaxed mb-8">{service.shortDesc}</p>

                {service.fullDesc && (
                  <div className="bg-card border border-border rounded-2xl p-8 mb-8">
                    <h2 className="text-lg font-bold text-white mb-4">About this session</h2>
                    <p className="text-muted-foreground leading-relaxed whitespace-pre-wrap">{service.fullDesc}</p>
                  </div>
                )}

                {includedItems.length > 0 && (
                  <div className="bg-card border border-border rounded-2xl p-8 mb-8">
                    <h2 className="text-lg font-bold text-white mb-6">What's included</h2>
                    <ul className="space-y-3">
                      {includedItems.map((item, i) => (
                        <li key={i} className="flex items-start gap-3">
                          <CheckCircle className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
                          <span className="text-muted-foreground">{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Counsellor */}
                <div className="bg-card border border-border rounded-2xl p-8">
                  <h2 className="text-lg font-bold text-white mb-6">Your counsellor</h2>
                  <div className="flex items-start gap-4">
                    <div className="w-14 h-14 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold text-xl flex-shrink-0">
                      {service.counsellorName.charAt(0)}
                    </div>
                    <div>
                      <h3 className="text-white font-semibold text-lg">{service.counsellorName}</h3>
                      {service.counsellorBio && (
                        <p className="text-muted-foreground text-sm mt-2 leading-relaxed">{service.counsellorBio}</p>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>

            {/* Sidebar */}
            <div className="lg:col-span-1">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="sticky top-28 bg-card border border-border rounded-2xl p-8"
              >
                <div className="text-4xl font-extrabold text-white mb-2">
                  ₹{service.price.toLocaleString("en-IN")}
                </div>
                <p className="text-muted-foreground text-sm mb-8">One-time payment</p>

                <div className="space-y-4 mb-8">
                  <div className="flex items-center gap-3 text-sm">
                    <Clock className="w-4 h-4 text-primary" />
                    <span className="text-muted-foreground">{service.duration} minutes</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm">
                    <User className="w-4 h-4 text-primary" />
                    <span className="text-muted-foreground">{service.counsellorName}</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm">
                    <Calendar className="w-4 h-4 text-primary" />
                    <span className="text-muted-foreground">{service.slots} slots available</span>
                  </div>
                </div>

                <Button
                  onClick={handleBook}
                  disabled={isCheckoutPending}
                  className="w-full bg-gradient-primary border-0 hover:opacity-90 h-12 font-semibold"
                  data-testid="book-now-btn"
                >
                  {isCheckoutPending
                    ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Processing...</>
                    : user ? "Book This Session" : "Sign In to Book"
                  }
                </Button>

                <p className="text-xs text-muted-foreground text-center mt-4">
                  Secure payment via Razorpay
                </p>
              </motion.div>
            </div>
          </div>
        </div>
      </main>

      <AnimatePresence>
        {showModal && (
          <SlotModal
            service={service}
            onClose={() => { setShowModal(false); setIsCheckoutPending(false); }}
            onConfirm={handleConfirmSlot}
            isPending={isCheckoutPending || createBookingMutation.isPending}
          />
        )}
      </AnimatePresence>

      <Footer />
    </div>
  );
}
