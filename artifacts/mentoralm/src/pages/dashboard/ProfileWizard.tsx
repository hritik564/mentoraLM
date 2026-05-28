import { useState, useEffect, useRef, useCallback } from "react";
import { useLocation } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import confetti from "canvas-confetti";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  useGetProfile,
  useUpdateProfile,
  getGetProfileQueryKey,
} from "@workspace/api-client-react";
import type { StudentProfile } from "@workspace/api-client-react";
import { useAuth } from "@/lib/auth";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import { ChevronLeft, Camera, Upload } from "lucide-react";

// ─── Steps config ────────────────────────────────────────────────────────────

const steps = [
  { title: "First, the basics", desc: "Tell me a little about yourself" },
  { title: "Your academic journey", desc: "Tell me where you are right now" },
  { title: "What makes you stand out", desc: "Your achievements and how you work best" },
  { title: "What lights you up", desc: "Pick everything that genuinely resonates" },
  { title: "Your big dreams", desc: "Where do you want to go?" },
  { title: "Your real-world situation", desc: "Help me understand your context" },
  { title: "The bigger picture", desc: "Let's understand what you really want" },
];

const STEP_BUBBLES = [
  "Hi! I'm Menti 👋 I'm your personal career counsellor and I can't wait to help you. Let's start with the basics — this'll only take 2 minutes!",
  "Now let's talk academics. Don't stress — there are no right or wrong answers here. I just want to understand where you are right now! 📚",
  "This is where it gets interesting! 🌟 Tell me what makes you stand out — and how you naturally like to work. This is the heart of my philosophy!",
  "My favourite step! Pick what genuinely excites you — not what sounds impressive. The more honest you are, the better I can help you! 🎯",
  "Dream big — there are absolutely no wrong answers here. ✨ Even 'I have no idea' is a perfectly valid answer. That's what I'm here for!",
  "Almost there! 🏁 This helps me give you advice that's actually realistic — not just textbook perfect. Everything you share stays completely private. I promise. 🤝",
  "Last step, I promise! 🎉 These questions help me understand what's really going on for you. Be as honest as you can — the more real you are, the more I can actually help.",
];

// ─── Options ─────────────────────────────────────────────────────────────────

const SUBJECT_OPTIONS = ["Mathematics", "Physics", "Chemistry", "Biology", "Economics", "Accountancy", "Business Studies", "History", "Geography", "English", "Computer Science", "Physical Education", "Fine Arts", "Other"];
const EXAM_OPTIONS = ["JEE", "NEET", "CUET", "CLAT", "CAT", "GMAT", "SAT", "NDA", "NIFT", "CEED", "None yet", "Other"];
const INTERESTS_OPTIONS = ["Science", "Technology", "Arts", "Commerce", "Sports", "Music", "Writing", "Social Work", "Research", "Entrepreneurship", "Teaching", "Medicine", "Design", "Finance", "Law", "Gaming", "Travel", "Food & Cooking", "Environment", "Psychology", "Other"];
const STRENGTHS_OPTIONS = ["Analytical Thinking", "Communication", "Creativity", "Leadership", "Problem Solving", "Teamwork", "Time Management", "Empathy", "Critical Thinking", "Technical Skills", "Public Speaking", "Negotiation", "Writing", "Research", "Organisation", "Other"];
const FREE_TIME_OPTIONS = ["Build/create something", "Learn something new", "Socialise with friends", "Play sports", "Consume content", "Help others", "Other"];
const OBSTACLE_OPTIONS = ["Not sure which path to take", "Family pressure", "Financial constraints", "Low grades/scores", "Lack of guidance", "Too many options, can't decide", "Fear of making the wrong choice", "Don't know the right people/network", "Other"];
const TIMELINE_OPTIONS = ["In 3 months", "In 6 months", "In 1 year", "In 2 years", "Already overdue 😅"];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function parseChips(val: unknown): string[] {
  if (!val) return [];
  if (Array.isArray(val)) return val as string[];
  if (typeof val === "string") return val.split(",").map((s) => s.trim()).filter(Boolean);
  return [];
}

function buildForm(profile: StudentProfile | undefined, userPhone?: string | null) {
  return {
    dateOfBirth: profile?.dateOfBirth ?? "",
    gender: profile?.gender ?? "",
    city: profile?.city ?? "",
    state: profile?.state ?? "",
    phone: userPhone ?? "",
    educationLevel: profile?.educationLevel ?? "",
    board: profile?.board ?? "",
    schoolCollege: profile?.schoolCollege ?? "",
    gradePercentage: profile?.gradePercentage ?? "",
    stream: profile?.stream ?? "",
    subjectStrengths: parseChips(profile?.subjectStrengths),
    entranceExams: parseChips(profile?.entranceExams),
    entranceScores: profile?.entranceScores ?? "",
    achievements: profile?.achievements ?? "",
    workStyle: profile?.workStyle ?? "",
    thinkingStyle: profile?.thinkingStyle ?? "",
    energyType: profile?.energyType ?? "",
    interests: parseChips(profile?.interests),
    strengths: parseChips(profile?.strengths),
    hobbies: profile?.hobbies ?? "",
    freeTimeActivity: profile?.freeTimeActivity ?? "",
    dreamCareer: profile?.dreamCareer ?? "",
    targetColleges: profile?.targetColleges ?? "",
    openToAbroad: profile?.openToAbroad ?? "",
    careerClarity: profile?.careerClarity ?? "",
    decisionTimeline: profile?.decisionTimeline ?? "",
    familyIncome: profile?.familyIncome ?? "",
    parentsEducation: profile?.parentsEducation ?? "",
    familyPressure: profile?.familyPressure ?? "",
    educationBudget: profile?.educationBudget ?? "",
    familyCareerExpectation: profile?.familyCareerExpectation ?? "",
    fiveYearGoal: profile?.fiveYearGoal ?? "",
    alreadyTried: profile?.alreadyTried ?? "",
    obstacles: parseChips(profile?.obstacles),
    stressLevel: profile?.stressLevel ?? 0,
    heardFrom: profile?.heardFrom ?? "",
  };
}

// ─── Typewriter hook ──────────────────────────────────────────────────────────

function useTypewriter(text: string, speed = 28) {
  const [displayed, setDisplayed] = useState("");
  useEffect(() => {
    setDisplayed("");
    let i = 0;
    const id = setInterval(() => {
      i++;
      setDisplayed(text.slice(0, i));
      if (i >= text.length) clearInterval(id);
    }, speed);
    return () => clearInterval(id);
  }, [text, speed]);
  return displayed;
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function MentiAvatar({ animate = false }: { animate?: boolean }) {
  return (
    <motion.div
      initial={animate ? { y: -20, opacity: 0, scale: 0.8 } : false}
      animate={{ y: 0, opacity: 1, scale: 1 }}
      transition={{ type: "spring", stiffness: 260, damping: 18, duration: 0.4 }}
      className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 font-extrabold text-white text-base select-none shadow-lg"
      style={{ background: "linear-gradient(135deg, #00A8FF, #7B3FE4)" }}
    >
      M
    </motion.div>
  );
}

function MentiChatBubble({ text, stepKey }: { text: string; stepKey: number }) {
  const displayed = useTypewriter(text, 28);
  return (
    <div className="flex items-start gap-3 mb-7">
      <MentiAvatar animate key={`avatar-${stepKey}`} />
      <motion.div
        initial={{ opacity: 0, scale: 0.97 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.15, duration: 0.3 }}
        className="relative bg-[#0D1526] border border-[#1E2A45] rounded-2xl rounded-tl-sm px-4 py-3 text-sm text-white/90 leading-relaxed max-w-prose min-h-[44px]"
      >
        {displayed}
        {displayed.length < text.length && (
          <span className="inline-block w-0.5 h-3.5 bg-blue-400 ml-0.5 align-middle animate-pulse" />
        )}
      </motion.div>
    </div>
  );
}

function AnimatedChip({
  label,
  selected,
  onToggle,
}: {
  label: string;
  selected: boolean;
  onToggle: () => void;
}) {
  return (
    <motion.button
      type="button"
      onClick={onToggle}
      whileTap={{ scale: 0.93 }}
      animate={selected ? { scale: [1, 0.95, 1.05, 1] } : { scale: 1 }}
      transition={{ type: "spring", stiffness: 400, damping: 17, duration: 0.3 }}
      className={`relative px-4 py-2 rounded-full text-sm font-medium transition-colors duration-200 ${
        selected
          ? "text-white border-transparent"
          : "bg-card border border-border text-muted-foreground hover:text-white hover:border-primary/30"
      }`}
      style={selected ? { background: "linear-gradient(135deg, #00A8FF, #7B3FE4)" } : {}}
    >
      {selected && (
        <motion.span
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          className="mr-1"
        >
          ✓{" "}
        </motion.span>
      )}
      {label}
    </motion.button>
  );
}

function ChipSelect({
  options,
  value,
  onChange,
}: {
  options: string[];
  value: string[];
  onChange: (v: string[]) => void;
}) {
  const toggle = (opt: string) => {
    if (value.includes(opt)) onChange(value.filter((v) => v !== opt));
    else onChange([...value, opt]);
  };
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((opt) => (
        <AnimatedChip
          key={opt}
          label={opt}
          selected={value.includes(opt)}
          onToggle={() => toggle(opt)}
        />
      ))}
    </div>
  );
}

function SingleChipSelect({
  options,
  value,
  onChange,
}: {
  options: string[];
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((opt) => (
        <AnimatedChip
          key={opt}
          label={opt}
          selected={value === opt}
          onToggle={() => onChange(opt)}
        />
      ))}
    </div>
  );
}

function CardSelect({
  options,
  value,
  onChange,
  cols,
}: {
  options: { emoji: string; label: string; value: string }[];
  value: string;
  onChange: (v: string) => void;
  cols?: 2 | 3;
}) {
  const gridCls = cols === 2 ? "grid-cols-2" : "grid-cols-1 sm:grid-cols-3";
  return (
    <div className={`grid ${gridCls} gap-3`}>
      {options.map((opt) => {
        const selected = value === opt.value;
        return (
          <motion.button
            key={opt.value}
            type="button"
            onClick={() => onChange(opt.value)}
            whileTap={{ scale: 0.95 }}
            animate={selected ? { scale: [1, 0.96, 1.03, 1] } : { scale: 1 }}
            transition={{ type: "spring", stiffness: 400, damping: 17 }}
            className={`flex flex-col items-center gap-2 p-4 rounded-xl border text-sm font-medium transition-colors duration-200 w-full ${
              selected
                ? "border-transparent text-white"
                : "border-border text-muted-foreground hover:text-white hover:border-primary/30 bg-card"
            }`}
            style={selected ? { background: "linear-gradient(135deg, #00A8FF44, #7B3FE444)", borderColor: "#7B3FE4" } : {}}
          >
            <span className="text-2xl">{opt.emoji}</span>
            <span>{opt.label}</span>
          </motion.button>
        );
      })}
    </div>
  );
}

// ─── Slide variants ────────────────────────────────────────────────────────────

const slideVariants = {
  enter: (dir: number) => ({
    x: dir > 0 ? 60 : -60,
    opacity: 0,
  }),
  center: { x: 0, opacity: 1 },
  exit: (dir: number) => ({
    x: dir > 0 ? -60 : 60,
    opacity: 0,
  }),
};

// ─── Main Component ───────────────────────────────────────────────────────────

export default function ProfileWizard() {
  const { user, token } = useAuth();
  const queryClient = useQueryClient();
  const { data: profile } = useGetProfile();
  const updateMutation = useUpdateProfile();
  const [, setLocation] = useLocation();
  const [currentStep, setCurrentStep] = useState(0);
  const [direction, setDirection] = useState(1);
  const [isSaving, setIsSaving] = useState(false);
  const [done, setDone] = useState(false);
  const [hydrated, setHydrated] = useState(false);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const tokenRef = useRef(token);
  useEffect(() => { tokenRef.current = token; }, [token]);

  const [form, setForm] = useState(() => buildForm(undefined, user?.phone));

  useEffect(() => {
    if (profile && !hydrated) {
      setForm(buildForm(profile, user?.phone));
      setHydrated(true);
    }
  }, [profile, hydrated, user?.phone]);

  // Confetti on completion
  useEffect(() => {
    if (!done) return;
    const colors = ["#00A8FF", "#7B3FE4", "#FF8C00", "#ffffff"];
    const end = Date.now() + 3000;
    const frame = () => {
      confetti({ particleCount: 6, angle: 60, spread: 55, origin: { x: 0 }, colors });
      confetti({ particleCount: 6, angle: 120, spread: 55, origin: { x: 1 }, colors });
      if (Date.now() < end) requestAnimationFrame(frame);
    };
    frame();
  }, [done]);

  const set = (key: keyof typeof form) => (val: string | string[] | number) =>
    setForm((prev) => ({ ...prev, [key]: val }));

  const handlePhotoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) { toast.error("Photo must be under 5 MB"); return; }
    const objectUrl = URL.createObjectURL(file);
    setPhotoPreview(objectUrl);
    setIsUploadingPhoto(true);
    try {
      const formData = new FormData();
      formData.append("photo", file);
      const res = await fetch("/api/profile/photo", {
        method: "POST",
        headers: tokenRef.current ? { Authorization: `Bearer ${tokenRef.current}` } : {},
        body: formData,
      });
      if (!res.ok) throw new Error("Upload failed");
      toast.success("Photo uploaded!");
      queryClient.invalidateQueries({ queryKey: getGetProfileQueryKey() });
    } catch {
      toast.error("Failed to upload photo. Please try again.");
      setPhotoPreview(null);
    } finally {
      setIsUploadingPhoto(false);
    }
  };

  const saveStep = useCallback(async () => {
    setIsSaving(true);
    const payload = {
      ...form,
      subjectStrengths: (form.subjectStrengths as string[]).join(", "),
      entranceExams: (form.entranceExams as string[]).join(", "),
      interests: (form.interests as string[]).join(", "),
      strengths: (form.strengths as string[]).join(", "),
      obstacles: (form.obstacles as string[]).join(", "),
    };
    try {
      await new Promise<void>((resolve, reject) => {
        updateMutation.mutate({ data: payload }, {
          onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: getGetProfileQueryKey() });
            resolve();
          },
          onError: reject,
        });
      });
    } catch {
      toast.error("Failed to save. Please try again.");
      setIsSaving(false);
      return false;
    }
    setIsSaving(false);
    return true;
  }, [form, updateMutation, queryClient]);

  const next = async () => {
    const ok = await saveStep();
    if (!ok) return;
    if (currentStep < steps.length - 1) {
      setDirection(1);
      setCurrentStep((s) => s + 1);
    } else {
      setDone(true);
    }
  };

  const prev = () => {
    setDirection(-1);
    setCurrentStep((s) => Math.max(0, s - 1));
  };

  const inputCls = "bg-[#080C1A] border-[#1E2A45] text-white placeholder:text-muted-foreground";
  const selectCls = `w-full rounded-md border px-3 py-2 text-sm ${inputCls}`;
  const labelCls = "text-sm font-medium text-white mb-1.5 block";
  const helperCls = "text-muted-foreground text-xs mt-1.5";

  const stepNum = currentStep + 1;
  const encouragements: Record<number, string> = {
    4: "Step 4 of 7 — you're doing great! 🌟",
    5: "Step 5 of 7 — halfway there! 💪",
    6: "Step 6 of 7 — almost done! 🔥",
    7: "Step 7 of 7 — last one, promise! 😊",
  };
  const stepLabel = encouragements[stepNum] ?? `Step ${stepNum} of ${steps.length}`;

  const nextBtnLabel = isSaving
    ? "Saving..."
    : currentStep === steps.length - 1
    ? "Complete Profile 🎉"
    : "Next →";

  // ─── Completion screen ──────────────────────────────────────────────────────
  if (done) {
    return (
      <DashboardLayout>
        <div className="max-w-lg mx-auto text-center py-16 px-4">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", stiffness: 200, damping: 18 }}
          >
            <div className="text-7xl mb-6 select-none">🎉</div>
            <h2 className="text-3xl font-extrabold text-white mb-3">
              You're all set, {user?.name?.split(" ")[0]}!
            </h2>
            <p className="text-muted-foreground mb-8 text-base leading-relaxed">
              Menti has everything she needs to give you advice that's actually built for you.
              Ready to start your journey?
            </p>
            <Button
              className="bg-gradient-primary border-0 w-full text-base py-6 rounded-xl hover:opacity-90 mb-4"
              onClick={() => setLocation("/dashboard/chat")}
              data-testid="go-to-chat-btn"
            >
              Chat with Menti →
            </Button>
            <button
              onClick={() => setLocation("/dashboard")}
              className="text-muted-foreground text-sm hover:text-white transition-colors"
            >
              Go to Dashboard
            </button>
          </motion.div>
        </div>
      </DashboardLayout>
    );
  }

  // ─── Main wizard ────────────────────────────────────────────────────────────
  return (
    <DashboardLayout>
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-extrabold text-white mb-2">Let's get to know you</h1>
          <p className="text-muted-foreground text-sm">{stepLabel}</p>
          <div className="mt-4 flex gap-1.5">
            {steps.map((_, i) => (
              <motion.div
                key={i}
                className="h-1.5 flex-1 rounded-full"
                animate={{
                  background: i <= currentStep
                    ? "linear-gradient(90deg, #00A8FF, #7B3FE4)"
                    : "#1E2A45",
                  scaleY: i === currentStep ? [1, 1.05, 1] : 1,
                }}
                transition={{ duration: 0.4, ease: "easeInOut" }}
                style={{ willChange: "transform" }}
              />
            ))}
          </div>
        </div>

        {/* Step card */}
        <div className="bg-card border border-border rounded-2xl p-6 md:p-8">
          <MentiChatBubble text={STEP_BUBBLES[currentStep]} stepKey={currentStep} />

          <div className="mb-6">
            <h2 className="text-xl font-bold text-white mb-1">{steps[currentStep].title}</h2>
            <p className="text-muted-foreground text-sm">{steps[currentStep].desc}</p>
          </div>

          <AnimatePresence mode="wait" custom={direction}>
            <motion.div
              key={currentStep}
              custom={direction}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.3, ease: direction > 0 ? "easeOut" : "easeIn" }}
              className="space-y-5"
              style={{ willChange: "transform" }}
            >
              {/* ── Step 1: Personal Info ─────────────────────────────────── */}
              {currentStep === 0 && (
                <>
                  <div className="flex items-center gap-5 pb-2">
                    <div
                      className="relative w-20 h-20 rounded-full border-2 border-dashed border-border flex items-center justify-center cursor-pointer overflow-hidden bg-[#080C1A] flex-shrink-0 hover:border-primary/50 transition-colors"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      {photoPreview || profile?.photoUrl ? (
                        <img src={photoPreview ?? String(profile?.photoUrl)} alt="Profile" className="w-full h-full object-cover" />
                      ) : (
                        <Camera className="w-7 h-7 text-muted-foreground" />
                      )}
                      {isUploadingPhoto && (
                        <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                          <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        </div>
                      )}
                    </div>
                    <div>
                      <p className="text-white text-sm font-medium mb-1">Profile photo</p>
                      <p className="text-muted-foreground text-xs mb-2">JPG, PNG or WebP · max 5 MB</p>
                      <Button type="button" variant="outline" size="sm" className="border-border text-muted-foreground hover:text-white text-xs h-8" onClick={() => fileInputRef.current?.click()} disabled={isUploadingPhoto}>
                        <Upload className="w-3.5 h-3.5 mr-1.5" />
                        {isUploadingPhoto ? "Uploading…" : "Upload photo"}
                      </Button>
                      <input ref={fileInputRef} type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={handlePhotoChange} />
                    </div>
                  </div>
                  <div>
                    <label className={labelCls}>What's your name?</label>
                    <Input value={user?.name || ""} disabled className={`${inputCls} opacity-60`} />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className={labelCls}>When's your birthday? 🎂</label>
                      <Input type="date" value={form.dateOfBirth} onChange={(e) => set("dateOfBirth")(e.target.value)} className={inputCls} />
                    </div>
                    <div>
                      <label className={labelCls}>How do you identify?</label>
                      <select value={form.gender} onChange={(e) => set("gender")(e.target.value)} className={selectCls}>
                        <option value="">Select</option>
                        <option>Male</option>
                        <option>Female</option>
                        <option>Non-binary</option>
                        <option>Prefer not to say</option>
                      </select>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className={labelCls}>Which city are you in?</label>
                      <Input placeholder="e.g. Mumbai" value={form.city} onChange={(e) => set("city")(e.target.value)} className={inputCls} />
                    </div>
                    <div>
                      <label className={labelCls}>And the state?</label>
                      <Input placeholder="e.g. Maharashtra" value={form.state} onChange={(e) => set("state")(e.target.value)} className={inputCls} />
                    </div>
                  </div>
                  <div>
                    <label className={labelCls}>Best number to reach you?</label>
                    <Input type="tel" placeholder="+91 9876543210" value={form.phone} onChange={(e) => set("phone")(e.target.value)} className={inputCls} />
                  </div>
                </>
              )}

              {/* ── Step 2: Academic Background ───────────────────────────── */}
              {currentStep === 1 && (
                <>
                  <div>
                    <label className={labelCls}>What stage are you at?</label>
                    <select value={form.educationLevel} onChange={(e) => set("educationLevel")(e.target.value)} className={selectCls}>
                      <option value="">Select level</option>
                      <option>Class 9</option>
                      <option>Class 10</option>
                      <option>Class 11</option>
                      <option>Class 12</option>
                      <option>Undergraduate</option>
                      <option>Graduate</option>
                      <option>Gap Year</option>
                    </select>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className={labelCls}>Which board are you from?</label>
                      <select value={form.board} onChange={(e) => set("board")(e.target.value)} className={selectCls}>
                        <option value="">Select board</option>
                        <option>CBSE</option>
                        <option>ICSE</option>
                        <option>IB</option>
                        <option>State Board</option>
                        <option>Other</option>
                      </select>
                    </div>
                    <div>
                      <label className={labelCls}>What stream are you in?</label>
                      <select value={form.stream} onChange={(e) => set("stream")(e.target.value)} className={selectCls}>
                        <option value="">Select stream</option>
                        <option>Science (PCM)</option>
                        <option>Science (PCB)</option>
                        <option>Commerce</option>
                        <option>Arts / Humanities</option>
                        <option>Undecided</option>
                        <option>Not applicable</option>
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className={labelCls}>Name of your school or college?</label>
                    <Input placeholder="e.g. DPS, Christ College, IIT Bombay..." value={form.schoolCollege} onChange={(e) => set("schoolCollege")(e.target.value)} className={inputCls} />
                  </div>
                  <div>
                    <label className={labelCls}>How are your grades? (be honest, no judgment! 😄)</label>
                    <Input placeholder="e.g. 85%, 9.2 CGPA, First Class..." value={form.gradePercentage} onChange={(e) => set("gradePercentage")(e.target.value)} className={inputCls} />
                  </div>
                  <div>
                    <label className={labelCls}>Which subjects are you strongest in?</label>
                    <ChipSelect options={SUBJECT_OPTIONS} value={form.subjectStrengths as string[]} onChange={(v) => set("subjectStrengths")(v)} />
                  </div>
                </>
              )}

              {/* ── Step 3: Achievements & Personality ───────────────────── */}
              {currentStep === 2 && (
                <>
                  <div>
                    <label className={labelCls}>Any competitions, awards, or leadership roles?</label>
                    <textarea
                      placeholder={"e.g. State chess champion, School Head Boy/Girl, Science Olympiad rank, NSS volunteer, startup intern... Don't be shy! 🏆"}
                      value={form.achievements}
                      onChange={(e) => set("achievements")(e.target.value)}
                      rows={3}
                      className={`w-full rounded-md border px-3 py-2 text-sm resize-none ${inputCls}`}
                    />
                    <p className={helperCls}>Even small wins count — mention everything</p>
                  </div>
                  <div>
                    <label className={labelCls}>I prefer working...</label>
                    <CardSelect
                      value={form.workStyle}
                      onChange={(v) => set("workStyle")(v)}
                      options={[
                        { emoji: "🧍", label: "On my own", value: "On my own" },
                        { emoji: "👥", label: "In a team", value: "In a team" },
                        { emoji: "🤝", label: "Both equally", value: "Both equally" },
                      ]}
                    />
                  </div>
                  <div>
                    <label className={labelCls}>I'm more naturally...</label>
                    <CardSelect
                      value={form.thinkingStyle}
                      onChange={(v) => set("thinkingStyle")(v)}
                      options={[
                        { emoji: "🎨", label: "Creative", value: "Creative" },
                        { emoji: "🧠", label: "Analytical", value: "Analytical" },
                        { emoji: "⚡", label: "Both equally", value: "Both equally" },
                      ]}
                    />
                  </div>
                  <div>
                    <label className={labelCls}>My energy is higher when I'm...</label>
                    <CardSelect
                      value={form.energyType}
                      onChange={(v) => set("energyType")(v)}
                      options={[
                        { emoji: "💻", label: "Indoors, focused", value: "Indoors, focused" },
                        { emoji: "🌍", label: "Outdoors, active", value: "Outdoors, active" },
                        { emoji: "🔄", label: "Depends on the day", value: "Depends on the day" },
                      ]}
                    />
                  </div>
                  <div>
                    <label className={labelCls}>Appeared for any entrance exams?</label>
                    <ChipSelect options={EXAM_OPTIONS} value={form.entranceExams as string[]} onChange={(v) => set("entranceExams")(v)} />
                  </div>
                  <div>
                    <label className={labelCls}>If yes — approximate score or percentile?</label>
                    <Input placeholder="e.g. JEE 85 percentile, NEET 520 marks..." value={form.entranceScores} onChange={(e) => set("entranceScores")(e.target.value)} className={inputCls} />
                    <p className={helperCls}>Skip this if you haven't appeared yet</p>
                  </div>
                </>
              )}

              {/* ── Step 4: Interests & Strengths ────────────────────────── */}
              {currentStep === 3 && (
                <>
                  <div>
                    <label className={labelCls}>What do you genuinely enjoy? Pick all that fit 👇</label>
                    <ChipSelect options={INTERESTS_OPTIONS} value={form.interests as string[]} onChange={(v) => set("interests")(v)} />
                  </div>
                  <div>
                    <label className={labelCls}>What are you naturally good at? 💪</label>
                    <ChipSelect options={STRENGTHS_OPTIONS} value={form.strengths as string[]} onChange={(v) => set("strengths")(v)} />
                  </div>
                  <div>
                    <label className={labelCls}>Any hobbies you do just for fun?</label>
                    <Input placeholder="e.g. cricket, sketching, gaming, cooking, reading, YouTube..." value={form.hobbies as string} onChange={(e) => set("hobbies")(e.target.value)} className={inputCls} />
                  </div>
                  <div>
                    <label className={labelCls}>When you have free time, you usually...</label>
                    <SingleChipSelect options={FREE_TIME_OPTIONS} value={form.freeTimeActivity} onChange={(v) => set("freeTimeActivity")(v)} />
                  </div>
                </>
              )}

              {/* ── Step 5: Career Aspirations ────────────────────────────── */}
              {currentStep === 4 && (
                <>
                  <div>
                    <label className={labelCls}>If nothing could stop you, what would you want to become?</label>
                    <Input placeholder="e.g. Entrepreneur, Doctor, Filmmaker, CA, Game Developer..." value={form.dreamCareer as string} onChange={(e) => set("dreamCareer")(e.target.value)} className={inputCls} />
                  </div>
                  <div>
                    <label className={labelCls}>Any colleges on your wishlist? 🎓</label>
                    <Input placeholder="e.g. IIM, SRCC, NIT, NLU, Parsons, MIT — even dream ones!" value={form.targetColleges as string} onChange={(e) => set("targetColleges")(e.target.value)} className={inputCls} />
                  </div>
                  <div>
                    <label className={labelCls}>Would you consider studying abroad? 🌍</label>
                    <CardSelect
                      value={form.openToAbroad as string}
                      onChange={(v) => set("openToAbroad")(v)}
                      options={[
                        { emoji: "✈️", label: "Yes, absolutely!", value: "Yes, absolutely!" },
                        { emoji: "🤔", label: "Maybe, if possible", value: "Maybe, if possible" },
                        { emoji: "🏠", label: "No, prefer India", value: "No, prefer India" },
                      ]}
                    />
                  </div>
                  <div>
                    <label className={labelCls}>How clear are you about your career direction?</label>
                    <CardSelect
                      value={form.careerClarity}
                      onChange={(v) => set("careerClarity")(v)}
                      cols={2}
                      options={[
                        { emoji: "😅", label: "Totally lost", value: "Totally lost" },
                        { emoji: "🤷", label: "Have some ideas", value: "Have some ideas" },
                        { emoji: "🙂", label: "Pretty clear", value: "Pretty clear" },
                        { emoji: "✅", label: "Very sure", value: "Very sure" },
                      ]}
                    />
                  </div>
                  <div>
                    <label className={labelCls}>When do you need to make your next big career decision?</label>
                    <SingleChipSelect options={TIMELINE_OPTIONS} value={form.decisionTimeline} onChange={(v) => set("decisionTimeline")(v)} />
                  </div>
                </>
              )}

              {/* ── Step 6: Family Context ────────────────────────────────── */}
              {currentStep === 5 && (
                <>
                  <div>
                    <label className={labelCls}>Roughly what's your family's annual income?</label>
                    <select value={form.familyIncome as string} onChange={(e) => set("familyIncome")(e.target.value)} className={selectCls}>
                      <option value="">Select range</option>
                      <option>Below ₹2 Lakh</option>
                      <option>₹2–5 Lakh</option>
                      <option>₹5–10 Lakh</option>
                      <option>₹10–20 Lakh</option>
                      <option>Above ₹20 Lakh</option>
                    </select>
                    <p className={helperCls}>This helps me suggest options that are genuinely achievable for you</p>
                  </div>
                  <div>
                    <label className={labelCls}>Highest education level in your family?</label>
                    <select value={form.parentsEducation as string} onChange={(e) => set("parentsEducation")(e.target.value)} className={selectCls}>
                      <option value="">Select</option>
                      <option>No formal education</option>
                      <option>High school</option>
                      <option>Graduation</option>
                      <option>Post-graduation</option>
                      <option>Professional degree</option>
                    </select>
                  </div>
                  <div>
                    <label className={labelCls}>How much say does your family have in your career choice?</label>
                    <CardSelect
                      value={form.familyPressure as string}
                      onChange={(v) => set("familyPressure")(v)}
                      options={[
                        { emoji: "🙋", label: "I decide", value: "I decide" },
                        { emoji: "💬", label: "We discuss together", value: "We discuss together" },
                        { emoji: "👨‍👩‍👦", label: "They mostly decide", value: "They mostly decide" },
                      ]}
                    />
                  </div>
                  <div>
                    <label className={labelCls}>What's your budget for higher education per year?</label>
                    <select value={form.educationBudget as string} onChange={(e) => set("educationBudget")(e.target.value)} className={selectCls}>
                      <option value="">Select range</option>
                      <option>Below ₹1 Lakh/year</option>
                      <option>₹1–3 Lakh/year</option>
                      <option>₹3–8 Lakh/year</option>
                      <option>Above ₹8 Lakh/year</option>
                    </select>
                  </div>
                  <div>
                    <label className={labelCls}>Is there a specific career your family wants you to pursue?</label>
                    <Input placeholder="e.g. Doctor, Engineer, CA, Government job... or leave blank" value={form.familyCareerExpectation} onChange={(e) => set("familyCareerExpectation")(e.target.value)} className={inputCls} />
                    <p className={helperCls}>Completely optional — only share if you're comfortable 🤝</p>
                  </div>
                </>
              )}

              {/* ── Step 7: Goals & Blockers ──────────────────────────────── */}
              {currentStep === 6 && (
                <>
                  <div>
                    <label className={labelCls}>Picture yourself 5 years from now — what does your life look like? 🚀</label>
                    <textarea
                      placeholder="e.g. Running my own startup, working at a top MNC, studying abroad, serving in the army..."
                      value={form.fiveYearGoal as string}
                      onChange={(e) => set("fiveYearGoal")(e.target.value)}
                      rows={3}
                      className={`w-full rounded-md border px-3 py-2 text-sm resize-none ${inputCls}`}
                    />
                  </div>
                  <div>
                    <label className={labelCls}>What steps have you already taken toward your goal?</label>
                    <Input placeholder="e.g. Coaching classes, online courses, JEE attempt, internship..." value={form.alreadyTried as string} onChange={(e) => set("alreadyTried")(e.target.value)} className={inputCls} />
                  </div>
                  <div>
                    <label className={labelCls}>What feels like your biggest obstacle right now?</label>
                    <ChipSelect options={OBSTACLE_OPTIONS} value={form.obstacles as string[]} onChange={(v) => set("obstacles")(v)} />
                  </div>
                  <div>
                    <label className={labelCls}>How stressed are you about your future right now?</label>
                    <div className="flex gap-2 mt-2">
                      {[
                        { n: 1, emoji: "😌" },
                        { n: 2, emoji: "🙂" },
                        { n: 3, emoji: "😐" },
                        { n: 4, emoji: "😟" },
                        { n: 5, emoji: "😰" },
                      ].map(({ n, emoji }) => (
                        <motion.button
                          key={n}
                          type="button"
                          onClick={() => set("stressLevel")(n)}
                          whileTap={{ scale: 0.9 }}
                          animate={form.stressLevel === n ? { scale: [1, 0.9, 1.15, 1] } : { scale: 1 }}
                          transition={{ type: "spring", stiffness: 400, damping: 17 }}
                          className={`flex-1 flex flex-col items-center gap-1 py-3 rounded-xl border text-sm transition-colors duration-200 ${
                            form.stressLevel === n
                              ? "border-transparent text-white"
                              : "border-border text-muted-foreground hover:border-primary/30"
                          }`}
                          style={
                            form.stressLevel === n
                              ? { background: "linear-gradient(135deg, #00A8FF44, #7B3FE444)", borderColor: "#7B3FE4" }
                              : {}
                          }
                        >
                          <span className="text-2xl">{emoji}</span>
                          <span>{n}</span>
                        </motion.button>
                      ))}
                    </div>
                    <div className="flex justify-between text-xs text-muted-foreground mt-1.5">
                      <span>Not stressed at all</span>
                      <span>Very stressed</span>
                    </div>
                  </div>
                  <div>
                    <label className={labelCls}>How did you find MentoraLM? 😊</label>
                    <select value={form.heardFrom as string} onChange={(e) => set("heardFrom")(e.target.value)} className={selectCls}>
                      <option value="">Select</option>
                      <option>Social Media</option>
                      <option>Friend / Family</option>
                      <option>School / College</option>
                      <option>Google Search</option>
                      <option>Other</option>
                    </select>
                  </div>
                </>
              )}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Navigation */}
        <div className="flex items-center justify-between mt-6">
          <Button
            variant="outline"
            onClick={prev}
            disabled={currentStep === 0}
            className="border-border text-muted-foreground hover:text-white disabled:opacity-30"
          >
            <ChevronLeft className="w-4 h-4 mr-1" />
            Previous
          </Button>
          <Button
            onClick={next}
            disabled={isSaving}
            className="bg-gradient-primary border-0 hover:opacity-90 min-w-[120px]"
            data-testid="profile-next-btn"
          >
            {nextBtnLabel}
          </Button>
        </div>
      </div>
    </DashboardLayout>
  );
}
