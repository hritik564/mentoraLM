import { motion } from "framer-motion";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { useGetRoadmap, useGenerateRoadmap, useGetProfile, getGetRoadmapQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Lock, Compass, ChevronRight, CheckCircle, Sparkles } from "lucide-react";
import { Link } from "wouter";

interface RoadmapPhase {
  title: string;
  timeframe: string;
  actions: string[];
}

interface RoadmapData {
  phases: RoadmapPhase[];
}

const phaseColors = ["#00A8FF", "#7B3FE4", "#FF8C00", "#10B981"];

export default function RoadmapPage() {
  const queryClient = useQueryClient();
  const { data: profile } = useGetProfile();
  const { data: roadmap, isLoading, error } = useGetRoadmap();
  const generateMutation = useGenerateRoadmap();

  const completionPercent = profile?.completionPercent ?? 0;
  const isEligible = completionPercent >= 50;
  const hasRoadmap = !!roadmap;

  const handleGenerate = () => {
    generateMutation.mutate(undefined, {
      onSuccess: () => {
        toast.success("Roadmap generated!");
        queryClient.invalidateQueries({ queryKey: getGetRoadmapQueryKey() });
      },
      onError: () => toast.error("Failed to generate roadmap. Please try again."),
    });
  };

  let roadmapData: RoadmapData | null = null;
  if (roadmap?.content) {
    try {
      roadmapData = JSON.parse(roadmap.content) as RoadmapData;
    } catch {
      roadmapData = null;
    }
  }

  return (
    <DashboardLayout>
      <div className="max-w-3xl mx-auto">
        <div className="mb-8">
          <h1 className="text-2xl font-extrabold text-white mb-1">Career Roadmap</h1>
          <p className="text-muted-foreground">Your personalised, phase-by-phase career plan.</p>
        </div>

        {/* Locked state */}
        {!isEligible && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center py-16">
            <div className="w-20 h-20 rounded-full bg-card border border-border flex items-center justify-center mx-auto mb-6">
              <Lock className="w-10 h-10 text-muted-foreground" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-3">Roadmap locked</h2>
            <p className="text-muted-foreground max-w-sm mx-auto mb-2">
              Complete at least 50% of your profile to unlock your personalised career roadmap.
            </p>
            <p className="text-sm text-muted-foreground mb-8">
              Your profile is currently <span className="text-white font-semibold">{completionPercent}%</span> complete.
            </p>
            <Link href="/dashboard/profile">
              <Button className="bg-gradient-primary border-0" data-testid="complete-profile-btn">
                Complete Profile
                <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            </Link>
          </motion.div>
        )}

        {/* Generate state */}
        {isEligible && !hasRoadmap && !isLoading && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center py-16">
            <div className="w-20 h-20 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center mx-auto mb-6">
              <Compass className="w-10 h-10 text-primary" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-3">Ready to generate your roadmap</h2>
            <p className="text-muted-foreground max-w-sm mx-auto mb-8">
              Your AI counsellor will create a personalised, 4-phase career plan based on your profile.
            </p>
            <Button
              onClick={handleGenerate}
              disabled={generateMutation.isPending}
              className="bg-gradient-primary border-0 px-10"
              data-testid="generate-roadmap-btn"
            >
              {generateMutation.isPending ? (
                <span className="flex items-center gap-2">
                  <span className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full" />
                  Generating your roadmap...
                </span>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 mr-2" />
                  Generate My Roadmap
                </>
              )}
            </Button>
          </motion.div>
        )}

        {/* Loading */}
        {isLoading && (
          <div className="flex items-center justify-center py-24">
            <div className="animate-spin w-10 h-10 border-4 border-primary border-t-transparent rounded-full" />
          </div>
        )}

        {/* Roadmap display */}
        {roadmapData && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <div className="mb-6 flex items-center justify-between">
              <p className="text-muted-foreground text-sm">
                Generated {roadmap?.generatedAt ? new Date(roadmap.generatedAt).toLocaleDateString("en-IN", { dateStyle: "medium" }) : ""}
              </p>
              <Button
                variant="outline"
                size="sm"
                onClick={handleGenerate}
                disabled={generateMutation.isPending}
                className="border-border text-muted-foreground hover:text-white text-xs"
              >
                Regenerate
              </Button>
            </div>

            <div className="relative">
              {/* Vertical line */}
              <div className="absolute left-6 top-8 bottom-8 w-px bg-border hidden sm:block" />

              <div className="space-y-6">
                {roadmapData.phases.map((phase, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.15 }}
                    className="relative sm:pl-16"
                    data-testid={`roadmap-phase-${i}`}
                  >
                    {/* Phase dot */}
                    <div
                      className="hidden sm:flex absolute left-0 top-5 w-12 h-12 rounded-full items-center justify-center text-white font-bold text-sm border-4 border-[#080C1A]"
                      style={{ background: `linear-gradient(135deg, ${phaseColors[i]}, ${phaseColors[(i + 1) % phaseColors.length]})` }}
                    >
                      {i + 1}
                    </div>

                    <div className="bg-card border border-border rounded-2xl p-6" style={{ borderLeftColor: phaseColors[i], borderLeftWidth: 3 }}>
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <h3 className="text-white font-bold text-lg">{phase.title}</h3>
                          <span
                            className="text-xs font-semibold px-2.5 py-0.5 rounded-full mt-1 inline-block"
                            style={{ color: phaseColors[i], backgroundColor: phaseColors[i] + "22" }}
                          >
                            {phase.timeframe}
                          </span>
                        </div>
                      </div>
                      <ul className="space-y-2.5">
                        {phase.actions.map((action, j) => (
                          <li key={j} className="flex items-start gap-3">
                            <CheckCircle className="w-4 h-4 flex-shrink-0 mt-0.5" style={{ color: phaseColors[i] }} />
                            <span className="text-muted-foreground text-sm leading-relaxed">{action}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* CTA */}
            <div className="mt-10 bg-card border border-border rounded-2xl p-8 text-center">
              <h3 className="text-white font-bold text-lg mb-2">Want to dive deeper?</h3>
              <p className="text-muted-foreground text-sm mb-6">
                Chat with your AI counsellor to get detailed guidance on any phase of your roadmap.
              </p>
              <Link href="/dashboard/chat">
                <Button className="bg-gradient-primary border-0" data-testid="roadmap-chat-cta">
                  Discuss with AI Counsellor
                  <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
              </Link>
            </div>
          </motion.div>
        )}
      </div>
    </DashboardLayout>
  );
}
