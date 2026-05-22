import { useParams, useLocation } from "wouter";
import { motion } from "framer-motion";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { useGetService, getGetServiceQueryKey } from "@workspace/api-client-react";
import { Clock, User, CheckCircle, ArrowLeft, Calendar } from "lucide-react";
import { Link } from "wouter";
import { useAuth } from "@/lib/auth";

export default function ServiceDetailPage() {
  const params = useParams<{ id: string }>();
  const id = Number(params.id);
  const { user } = useAuth();
  const [, setLocation] = useLocation();

  const { data: service, isLoading, error } = useGetService(id, {
    query: { enabled: !!id, queryKey: getGetServiceQueryKey(id) },
  });

  const handleBook = () => {
    if (!user) {
      setLocation(`/auth/signin`);
    } else {
      setLocation(`/dashboard/marketplace`);
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
                  className="w-full bg-gradient-primary border-0 hover:opacity-90 h-12 font-semibold"
                  data-testid="book-now-btn"
                >
                  {user ? "Book This Session" : "Sign In to Book"}
                </Button>

                <p className="text-xs text-muted-foreground text-center mt-4">
                  Secure payment via Razorpay
                </p>
              </motion.div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
