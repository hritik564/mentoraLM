import { motion } from "framer-motion";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import {
  useGetRoadmap,
  useGenerateRoadmap,
  useGetProfile,
  useListAnthropicConversations,
  getGetRoadmapQueryKey,
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Lock, Compass, ChevronRight, CheckCircle, Sparkles, MessageSquare } from "lucide-react";
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

const MIN_CHATS = 3;
const MIN_PROFILE_PCT = 50;

export default function RoadmapPage() {
  const queryClient = useQueryClient();
  const { data: profile } = useGetProfile();
  const { data: roadmap, isLoading } = useGetRoadmap();
  const { data: conversations } = useListAnthropicConversations();
  const generateMutation = useGenerateRoadmap();

  const completionPercent = profile?.completionPercent ?? 0;
  const chatCount = conversations?.length ?? 0;

  const profileEligible = completionPercent >= MIN_PROFILE_PCT;
  const chatEligible = chatCount >= MIN_CHATS;
  const isEligible = profileEligible && chatEligible;
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

        {/* Locked state — show most restrictive unmet requirement first */}
        {!isEligible && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            {/* Requirements checklist */}
            <div className="bg-card border border-border rounded-2xl p-8 mb-6">
              <div className="w-16 h-16 rounded-full bg-card border border-border flex items-center justify-center mx-auto mb-5">
                <Lock className="w-8 h-8 text-muted-foreground" />
              </div>
              <h2 className="text-2xl font-bold text-white mb-2 text-center">Roadmap locked</h2>
              <p className="text-muted-foreground text-center mb-8 max-w-sm mx-auto">
                Complete both requirements below to unlock your personalised career roadmap.
              </p>

              <div className="space-y-4 max-w-sm mx-auto">
                {/* Profile requirement */}
                <div className={`rounded-xl p-4 border flex items-center gap-4 ${profileEligible ? "border-emerald-500/30 bg-emerald-500/5" : "border-border bg-[#080C1A]"}`}>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${profileEligible ? "bg-emerald-500/20" : "bg-muted/20"}`}>
                    {profileEligible
                      ? <CheckCircle className="w-5 h-5 text-emerald-400" />
                      : <span className="text-xs font-bold text-muted-foreground">{completionPercent}%</span>
                    }
                  </div>
                  <div>
                    <p className={`font-semibold text-sm ${profileEligible ? "text-emerald-400" : "text-white"}`}>
                      {profileEligible ? "Profile complete ✓" : `Complete 50% of your profile`}
                    </p>
                    {!profileEligible && (
                      <p className="text-muted-foreground text-xs mt-0.5">Currently at {completionPercent}%</p>
                    )}
                  </div>
                </div>

                {/* Chat requirement */}
                <div className={`rounded-xl p-4 border flex items-center gap-4 ${chatEligible ? "border-emerald-500/30 bg-emerald-500/5" : "border-border bg-[#080C1A]"}`}>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${chatEligible ? "bg-emerald-500/20" : "bg-muted/20"}`}>
                    {chatEligible
                      ? <CheckCircle className="w-5 h-5 text-emerald-400" />
                      : <MessageSquare className="w-4 h-4 text-muted-foreground" />
                    }
                  </div>
                  <div>
                    <p className={`font-semibold text-sm ${chatEligible ? "text-emerald-400" : "text-white"}`}>
                      {chatEligible ? `${chatCount} chats completed ✓` : `Have at least ${MIN_CHATS} AI chat sessions`}
                    </p>
                    {!chatEligible && (
                      <p className="text-muted-foreground text-xs mt-0.5">{chatCount} of {MIN_CHATS} sessions done</p>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              {!profileEligible && (
                <Link href="/dashboard/profile">
                  <Button className="bg-gradient-primary border-0" data-testid="complete-profile-btn">
                    Complete Profile
                    <ChevronRight className="w-4 h-4 ml-1" />
                  </Button>
                </Link>
              )}
              {!chatEligible && (
                <>
                  <Link href="/dashboard/chat">
                    <Button variant={profileEligible ? "default" : "outline"} className={profileEligible ? "bg-gradient-primary border-0" : "border-border"} data-testid="go-to-chat-btn">
                      <MessageSquare className="w-4 h-4 mr-2" />
                      Chat with AI Counsellor
                    </Button>
                  </Link>
                  <Link href="/dashboard/chat">
                    <Button
                      className="border-0 text-white font-semibold"
                      style={{ background: "linear-gradient(135deg, #00A8FF, #7B3FE4)" }}
                      data-testid="start-chatting-btn"
                    >
                      Start Chatting
                      <ChevronRight className="w-4 h-4 ml-1" />
                    </Button>
                  </Link>
                </>
              )}
            </div>
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
              Your AI counsellor will create a personalised, 4-phase career plan based on your profile and conversations.
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
