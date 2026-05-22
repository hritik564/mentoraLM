import { useState } from "react";
import { Link } from "wouter";
import { motion } from "framer-motion";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { useListServices } from "@workspace/api-client-react";
import { Clock, Users, ChevronRight } from "lucide-react";
import { usePageMeta } from "@/lib/usePageMeta";
import { getCategoryVisual } from "@/pages/home/HomePage";

export default function ServicesPage() {
  usePageMeta("Counselling Services", "Browse MentoraLM's expert career counselling sessions — stream selection, college choice, JEE/NEET prep and more.");
  const { data: services, isLoading } = useListServices();
  const [activeCategory, setActiveCategory] = useState<string>("All");

  const categories = ["All", ...Array.from(new Set((services || []).map((s) => s.category)))];
  const filtered = activeCategory === "All" ? (services || []) : (services || []).filter((s) => s.category === activeCategory);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] rounded-full bg-[#7B3FE4]/8 blur-[120px]" />
      </div>

      <main className="relative z-10 pt-32 pb-24 px-6">
        <div className="container mx-auto max-w-6xl">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-14">
            <h1 className="text-4xl md:text-5xl font-extrabold text-white mb-4">
              Expert Career Services
            </h1>
            <p className="text-muted-foreground text-lg max-w-xl mx-auto">
              Personalised sessions with experienced counsellors to help you navigate every stage of your career journey.
            </p>
          </motion.div>

          {/* Category filters */}
          <div className="flex flex-wrap gap-3 justify-center mb-12">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                data-testid={`category-filter-${cat}`}
                className={`px-5 py-2 rounded-full text-sm font-medium transition-all ${
                  activeCategory === cat
                    ? "bg-gradient-primary text-white shadow-lg"
                    : "bg-card border border-border text-muted-foreground hover:text-white hover:border-primary/40"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {isLoading ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <div key={i} className="bg-card border border-border rounded-2xl h-80 animate-pulse" />
              ))}
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filtered.map((service, i) => (
                <motion.div
                  key={service.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.08 }}
                  whileHover={{ y: -4, scale: 1.02 }}
                  className="bg-card border border-border rounded-2xl overflow-hidden flex flex-col"
                  data-testid={`service-card-${service.id}`}
                >
                  {(() => {
                    const { gradient, emoji } = getCategoryVisual(service.category);
                    return (
                      <div
                        className="h-36 relative flex items-center justify-center overflow-hidden"
                        style={{ background: gradient }}
                      >
                        <span className="text-6xl drop-shadow-lg">{emoji}</span>
                        <div className="absolute top-3 left-3">
                          <span className="bg-black/40 text-white text-xs font-semibold px-3 py-1 rounded-full backdrop-blur-sm">
                            {service.category}
                          </span>
                        </div>
                        {service.duration && (
                          <div className="absolute top-3 right-3 flex items-center gap-1 bg-black/60 backdrop-blur-sm border border-white/10 rounded-full px-2.5 py-1">
                            <Clock className="w-3 h-3 text-white/70" />
                            <span className="text-white text-xs font-medium">{service.duration} min</span>
                          </div>
                        )}
                      </div>
                    );
                  })()}
                  <div className="p-6 flex flex-col flex-1">
                    <h3 className="text-white font-bold text-xl mb-2">{service.title}</h3>
                    <p className="text-muted-foreground text-sm mb-4 flex-1 leading-relaxed">{service.shortDesc}</p>

                    <div className="flex items-center gap-4 text-xs text-muted-foreground mb-5">
                      <div className="flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5" />
                        {service.duration} min
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Users className="w-3.5 h-3.5" />
                        {service.counsellorName}
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-white font-bold text-2xl">
                        ₹{service.price.toLocaleString("en-IN")}
                      </span>
                      <Link href={`/services/${service.id}`}>
                        <Button size="sm" className="bg-gradient-primary border-0 hover:opacity-90" data-testid={`book-service-${service.id}`}>
                          View Details
                          <ChevronRight className="w-4 h-4 ml-1" />
                        </Button>
                      </Link>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}

          {filtered.length === 0 && !isLoading && (
            <div className="text-center py-24">
              <p className="text-muted-foreground text-lg">No services found in this category.</p>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}
