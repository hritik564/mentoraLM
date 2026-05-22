import { useState } from "react";
import { useLocation } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useGetProfile, useUpdateProfile, getGetProfileQueryKey } from "@workspace/api-client-react";
import { useAuth } from "@/lib/auth";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import { ChevronRight, ChevronLeft, CheckCircle } from "lucide-react";

const steps = [
  { title: "Personal Info", desc: "Tell us about yourself" },
  { title: "Academic Background", desc: "Your education details" },
  { title: "Interests & Strengths", desc: "What drives you" },
  { title: "Career Aspirations", desc: "Where you want to go" },
  { title: "Family Context", desc: "Help us understand your situation" },
  { title: "Your Goals", desc: "The bigger picture" },
];

const INTERESTS_OPTIONS = ["Science", "Technology", "Arts", "Commerce", "Sports", "Music", "Writing", "Social Work", "Research", "Entrepreneurship", "Teaching", "Medicine"];
const STRENGTHS_OPTIONS = ["Analytical Thinking", "Communication", "Creativity", "Leadership", "Problem Solving", "Teamwork", "Time Management", "Empathy", "Technical Skills", "Critical Thinking"];

function ChipSelect({ options, value, onChange }: { options: string[]; value: string[]; onChange: (v: string[]) => void }) {
  const toggle = (opt: string) => {
    if (value.includes(opt)) onChange(value.filter((v) => v !== opt));
    else onChange([...value, opt]);
  };
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((opt) => (
        <button
          key={opt}
          type="button"
          onClick={() => toggle(opt)}
          className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
            value.includes(opt)
              ? "bg-gradient-primary text-white border-transparent"
              : "bg-card border border-border text-muted-foreground hover:text-white hover:border-primary/30"
          }`}
        >
          {opt}
        </button>
      ))}
    </div>
  );
}

export default function ProfileWizard() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { data: profile } = useGetProfile();
  const updateMutation = useUpdateProfile();
  const [, setLocation] = useLocation();
  const [currentStep, setCurrentStep] = useState(0);
  const [isSaving, setIsSaving] = useState(false);
  const [done, setDone] = useState(false);

  const [form, setForm] = useState({
    dateOfBirth: profile?.dateOfBirth || "",
    gender: profile?.gender || "",
    city: profile?.city || "",
    state: profile?.state || "",
    phone: user?.phone || "",
    educationLevel: profile?.educationLevel || "",
    board: profile?.board || "",
    schoolCollege: profile?.schoolCollege || "",
    gradePercentage: profile?.gradePercentage || "",
    stream: profile?.stream || "",
    interests: profile?.interests || [],
    strengths: profile?.strengths || [],
    hobbies: profile?.hobbies || "",
    dreamCareer: profile?.dreamCareer || "",
    targetColleges: profile?.targetColleges || "",
    openToAbroad: profile?.openToAbroad || "",
    familyIncome: profile?.familyIncome || "",
    parentsEducation: profile?.parentsEducation || "",
    familyPressure: profile?.familyPressure || "",
    educationBudget: profile?.educationBudget || "",
    fiveYearGoal: profile?.fiveYearGoal || "",
    alreadyTried: profile?.alreadyTried || "",
    stoppingYou: profile?.stoppingYou || "",
    heardFrom: profile?.heardFrom || "",
  });

  const set = (key: keyof typeof form) => (val: string | string[]) =>
    setForm((prev) => ({ ...prev, [key]: val }));

  const saveStep = async () => {
    setIsSaving(true);
    try {
      await new Promise<void>((resolve, reject) => {
        updateMutation.mutate({ data: form as Parameters<typeof updateMutation.mutate>[0]["data"] }, {
          onSuccess: () => { queryClient.invalidateQueries({ queryKey: getGetProfileQueryKey() }); resolve(); },
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
  };

  const next = async () => {
    const ok = await saveStep();
    if (!ok) return;
    if (currentStep < steps.length - 1) setCurrentStep((s) => s + 1);
    else setDone(true);
  };

  const prev = () => setCurrentStep((s) => Math.max(0, s - 1));

  const inputCls = "bg-[#080C1A] border-[#1E2A45] text-white placeholder:text-muted-foreground";

  if (done) {
    return (
      <DashboardLayout>
        <div className="max-w-lg mx-auto text-center py-16">
          <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}>
            <div className="w-20 h-20 rounded-full bg-emerald-400/10 flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-10 h-10 text-emerald-400" />
            </div>
            <h2 className="text-3xl font-extrabold text-white mb-3">Profile complete!</h2>
            <p className="text-muted-foreground mb-8">
              Your AI counsellor now has everything it needs to give you personalised, meaningful guidance.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button className="bg-gradient-primary border-0" onClick={() => setLocation("/dashboard/chat")} data-testid="go-to-chat-btn">
                Talk to AI Counsellor
                <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
              <Button variant="outline" className="border-border" onClick={() => setLocation("/dashboard/roadmap")}>
                View Roadmap
              </Button>
            </div>
          </motion.div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-extrabold text-white mb-2">Complete Your Profile</h1>
          <p className="text-muted-foreground text-sm">Step {currentStep + 1} of {steps.length}</p>
          <div className="mt-4 flex gap-1.5">
            {steps.map((_, i) => (
              <div
                key={i}
                className="h-1.5 flex-1 rounded-full transition-all duration-300"
                style={{ background: i <= currentStep ? "linear-gradient(90deg, #00A8FF, #7B3FE4)" : "#1E2A45" }}
              />
            ))}
          </div>
        </div>

        {/* Step card */}
        <div className="bg-card border border-border rounded-2xl p-8">
          <div className="mb-8">
            <h2 className="text-xl font-bold text-white mb-1">{steps[currentStep].title}</h2>
            <p className="text-muted-foreground text-sm">{steps[currentStep].desc}</p>
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-5"
            >
              {/* Step 1: Personal */}
              {currentStep === 0 && (
                <>
                  <div>
                    <label className="text-sm font-medium text-white mb-1.5 block">Full Name</label>
                    <Input value={user?.name || ""} disabled className={`${inputCls} opacity-60`} />
                    <p className="text-xs text-muted-foreground mt-1">Name from your account</p>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-white mb-1.5 block">Date of Birth</label>
                      <Input type="date" value={form.dateOfBirth} onChange={(e) => set("dateOfBirth")(e.target.value)} className={inputCls} />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-white mb-1.5 block">Gender</label>
                      <select value={form.gender} onChange={(e) => set("gender")(e.target.value)} className={`w-full rounded-md border px-3 py-2 text-sm ${inputCls}`}>
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
                      <label className="text-sm font-medium text-white mb-1.5 block">City</label>
                      <Input placeholder="e.g. Mumbai" value={form.city} onChange={(e) => set("city")(e.target.value)} className={inputCls} />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-white mb-1.5 block">State</label>
                      <Input placeholder="e.g. Maharashtra" value={form.state} onChange={(e) => set("state")(e.target.value)} className={inputCls} />
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-white mb-1.5 block">Phone Number</label>
                    <Input type="tel" placeholder="+91 9876543210" value={form.phone} onChange={(e) => set("phone")(e.target.value)} className={inputCls} />
                  </div>
                </>
              )}

              {/* Step 2: Academic */}
              {currentStep === 1 && (
                <>
                  <div>
                    <label className="text-sm font-medium text-white mb-1.5 block">Education Level</label>
                    <select value={form.educationLevel} onChange={(e) => set("educationLevel")(e.target.value)} className={`w-full rounded-md border px-3 py-2 text-sm ${inputCls}`}>
                      <option value="">Select level</option>
                      <option>Class 10</option>
                      <option>Class 11</option>
                      <option>Class 12</option>
                      <option>Graduate</option>
                      <option>Postgraduate</option>
                    </select>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-white mb-1.5 block">Board</label>
                      <select value={form.board} onChange={(e) => set("board")(e.target.value)} className={`w-full rounded-md border px-3 py-2 text-sm ${inputCls}`}>
                        <option value="">Select board</option>
                        <option>CBSE</option>
                        <option>ICSE</option>
                        <option>State Board</option>
                        <option>IB</option>
                        <option>Other</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-white mb-1.5 block">Stream</label>
                      <select value={form.stream} onChange={(e) => set("stream")(e.target.value)} className={`w-full rounded-md border px-3 py-2 text-sm ${inputCls}`}>
                        <option value="">Select stream</option>
                        <option>Science (PCM)</option>
                        <option>Science (PCB)</option>
                        <option>Commerce</option>
                        <option>Arts / Humanities</option>
                        <option>Vocational</option>
                        <option>Other</option>
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-white mb-1.5 block">School / College Name</label>
                    <Input placeholder="e.g. Delhi Public School" value={form.schoolCollege} onChange={(e) => set("schoolCollege")(e.target.value)} className={inputCls} />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-white mb-1.5 block">Grade / Percentage</label>
                    <Input placeholder="e.g. 85% or 8.5 CGPA" value={form.gradePercentage} onChange={(e) => set("gradePercentage")(e.target.value)} className={inputCls} />
                  </div>
                </>
              )}

              {/* Step 3: Interests */}
              {currentStep === 2 && (
                <>
                  <div>
                    <label className="text-sm font-medium text-white mb-3 block">Interests (select all that apply)</label>
                    <ChipSelect options={INTERESTS_OPTIONS} value={form.interests as string[]} onChange={(v) => set("interests")(v)} />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-white mb-3 block">Strengths (select all that apply)</label>
                    <ChipSelect options={STRENGTHS_OPTIONS} value={form.strengths as string[]} onChange={(v) => set("strengths")(v)} />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-white mb-1.5 block">Hobbies</label>
                    <Input placeholder="e.g. Reading, Coding, Photography" value={form.hobbies as string} onChange={(e) => set("hobbies")(e.target.value)} className={inputCls} />
                  </div>
                </>
              )}

              {/* Step 4: Career */}
              {currentStep === 3 && (
                <>
                  <div>
                    <label className="text-sm font-medium text-white mb-1.5 block">Dream Career</label>
                    <Input placeholder="e.g. Software Engineer, Doctor, Entrepreneur..." value={form.dreamCareer as string} onChange={(e) => set("dreamCareer")(e.target.value)} className={inputCls} />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-white mb-1.5 block">Target Colleges</label>
                    <Input placeholder="e.g. IIT Bombay, AIIMS, St. Xavier's..." value={form.targetColleges as string} onChange={(e) => set("targetColleges")(e.target.value)} className={inputCls} />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-white mb-2 block">Open to studying abroad?</label>
                    <div className="flex gap-3">
                      {["Yes", "No", "Maybe"].map((opt) => (
                        <button
                          key={opt}
                          type="button"
                          onClick={() => set("openToAbroad")(opt)}
                          className={`flex-1 py-2.5 rounded-xl text-sm font-medium border transition-all ${
                            form.openToAbroad === opt
                              ? "bg-gradient-primary text-white border-transparent"
                              : "border-border text-muted-foreground hover:text-white"
                          }`}
                        >
                          {opt}
                        </button>
                      ))}
                    </div>
                  </div>
                </>
              )}

              {/* Step 5: Family */}
              {currentStep === 4 && (
                <>
                  <div>
                    <label className="text-sm font-medium text-white mb-1.5 block">Annual Family Income</label>
                    <select value={form.familyIncome as string} onChange={(e) => set("familyIncome")(e.target.value)} className={`w-full rounded-md border px-3 py-2 text-sm ${inputCls}`}>
                      <option value="">Select range</option>
                      <option>Below ₹2 Lakh</option>
                      <option>₹2–5 Lakh</option>
                      <option>₹5–10 Lakh</option>
                      <option>₹10–20 Lakh</option>
                      <option>Above ₹20 Lakh</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-white mb-1.5 block">Parents' Highest Education</label>
                    <select value={form.parentsEducation as string} onChange={(e) => set("parentsEducation")(e.target.value)} className={`w-full rounded-md border px-3 py-2 text-sm ${inputCls}`}>
                      <option value="">Select</option>
                      <option>No formal education</option>
                      <option>High school</option>
                      <option>Graduation</option>
                      <option>Post-graduation</option>
                      <option>Professional degree</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-white mb-2 block">Family pressure on career choice?</label>
                    <div className="flex gap-3">
                      {["Low", "Medium", "High"].map((opt) => (
                        <button
                          key={opt}
                          type="button"
                          onClick={() => set("familyPressure")(opt)}
                          className={`flex-1 py-2.5 rounded-xl text-sm font-medium border transition-all ${
                            form.familyPressure === opt
                              ? "bg-gradient-primary text-white border-transparent"
                              : "border-border text-muted-foreground hover:text-white"
                          }`}
                        >
                          {opt}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-white mb-1.5 block">Education Budget</label>
                    <select value={form.educationBudget as string} onChange={(e) => set("educationBudget")(e.target.value)} className={`w-full rounded-md border px-3 py-2 text-sm ${inputCls}`}>
                      <option value="">Select range</option>
                      <option>Below ₹1 Lakh/year</option>
                      <option>₹1–3 Lakh/year</option>
                      <option>₹3–8 Lakh/year</option>
                      <option>Above ₹8 Lakh/year</option>
                    </select>
                  </div>
                </>
              )}

              {/* Step 6: Goals */}
              {currentStep === 5 && (
                <>
                  <div>
                    <label className="text-sm font-medium text-white mb-1.5 block">Where do you see yourself in 5 years?</label>
                    <textarea
                      placeholder="Describe your vision..."
                      value={form.fiveYearGoal as string}
                      onChange={(e) => set("fiveYearGoal")(e.target.value)}
                      rows={3}
                      className={`w-full rounded-md border px-3 py-2 text-sm resize-none ${inputCls}`}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-white mb-1.5 block">What have you already tried?</label>
                    <Input placeholder="e.g. Coaching classes, online courses..." value={form.alreadyTried as string} onChange={(e) => set("alreadyTried")(e.target.value)} className={inputCls} />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-white mb-1.5 block">What's stopping you from reaching your goal?</label>
                    <Input placeholder="e.g. Lack of guidance, financial constraints..." value={form.stoppingYou as string} onChange={(e) => set("stoppingYou")(e.target.value)} className={inputCls} />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-white mb-1.5 block">How did you hear about MentorAlm?</label>
                    <select value={form.heardFrom as string} onChange={(e) => set("heardFrom")(e.target.value)} className={`w-full rounded-md border px-3 py-2 text-sm ${inputCls}`}>
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
            className="bg-gradient-primary border-0 hover:opacity-90"
            data-testid="profile-next-btn"
          >
            {isSaving ? "Saving..." : currentStep === steps.length - 1 ? "Complete Profile" : "Save & Continue"}
            {!isSaving && <ChevronRight className="w-4 h-4 ml-1" />}
          </Button>
        </div>
      </div>
    </DashboardLayout>
  );
}
