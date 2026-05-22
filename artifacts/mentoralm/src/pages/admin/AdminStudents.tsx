import { useState } from "react";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useListAdminStudents, useGetAdminStudent, getGetAdminStudentQueryKey } from "@workspace/api-client-react";
import { Search, X, User, MessageSquare, Bot } from "lucide-react";
import { useAuth } from "@/lib/auth";
import { motion, AnimatePresence } from "framer-motion";

type ChatMsg = { id: number; role: string; content: string; createdAt: string };

export default function AdminStudents() {
  const { data: students, isLoading } = useListAdminStudents();
  const [search, setSearch] = useState("");
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [chatStudentId, setChatStudentId] = useState<number | null>(null);
  const [chatMessages, setChatMessages] = useState<ChatMsg[]>([]);
  const [chatLoading, setChatLoading] = useState(false);
  const { token } = useAuth();

  const { data: detail, isLoading: loadingDetail } = useGetAdminStudent(selectedId!, {
    query: { enabled: !!selectedId, queryKey: getGetAdminStudentQueryKey(selectedId!) },
  });

  const filtered = (students || []).filter((s) =>
    s.name.toLowerCase().includes(search.toLowerCase()) ||
    s.email.toLowerCase().includes(search.toLowerCase())
  );

  const openChatHistory = async (id: number) => {
    setChatStudentId(id);
    setChatMessages([]);
    setChatLoading(true);
    try {
      const res = await fetch(`/api/admin/students/${id}/chat`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      if (!res.ok) throw new Error();
      const data = await res.json();
      setChatMessages(data);
    } catch {
      setChatMessages([]);
    } finally {
      setChatLoading(false);
    }
  };

  const chatStudentName = selectedId
    ? students?.find((s) => s.id === selectedId)?.name ?? "Student"
    : "";

  return (
    <AdminLayout>
      <div className="max-w-5xl mx-auto">
        <div className="mb-8">
          <h1 className="text-2xl font-extrabold text-white mb-1">Students</h1>
          <p className="text-muted-foreground">View and manage registered students.</p>
        </div>

        {/* Search */}
        <div className="relative mb-6 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search by name or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 bg-[#080C1A] border-[#1E2A45]"
            data-testid="student-search"
          />
        </div>

        <div className="flex gap-6 relative">
          {/* Table */}
          <div className="flex-1 bg-card border border-border rounded-2xl overflow-hidden">
            {isLoading ? (
              <div className="p-6 space-y-3">
                {[1, 2, 3, 4, 5].map((i) => <div key={i} className="h-12 bg-border/20 rounded animate-pulse" />)}
              </div>
            ) : (
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border text-left text-xs text-muted-foreground uppercase tracking-wider">
                    <th className="px-5 py-3">Student</th>
                    <th className="px-5 py-3">Profile</th>
                    <th className="px-5 py-3">Joined</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {filtered.map((student) => (
                    <tr
                      key={student.id}
                      onClick={() => setSelectedId(student.id === selectedId ? null : student.id)}
                      className={`cursor-pointer hover:bg-white/2 transition-colors ${selectedId === student.id ? "bg-primary/5" : ""}`}
                      data-testid={`student-row-${student.id}`}
                    >
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary text-sm font-bold flex-shrink-0">
                            {student.name.charAt(0)}
                          </div>
                          <div className="min-w-0">
                            <p className="text-white text-sm font-medium truncate">{student.name}</p>
                            <p className="text-muted-foreground text-xs truncate">{student.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-2">
                          <div className="flex-1 h-1.5 bg-border rounded-full overflow-hidden max-w-20">
                            <div
                              className="h-full bg-gradient-primary rounded-full"
                              style={{ width: `${student.completionPercent}%` }}
                            />
                          </div>
                          <span className="text-xs text-muted-foreground">{student.completionPercent}%</span>
                        </div>
                      </td>
                      <td className="px-5 py-4 text-muted-foreground text-xs">
                        {new Date(student.createdAt).toLocaleDateString("en-IN")}
                      </td>
                    </tr>
                  ))}
                  {filtered.length === 0 && (
                    <tr><td colSpan={3} className="px-5 py-10 text-center text-muted-foreground">No students found.</td></tr>
                  )}
                </tbody>
              </table>
            )}
          </div>

          {/* Detail slide-over */}
          {selectedId && (
            <div className="w-72 flex-shrink-0 bg-card border border-border rounded-2xl p-5 relative overflow-y-auto max-h-[70vh]">
              <button
                onClick={() => setSelectedId(null)}
                className="absolute top-3 right-3 text-muted-foreground hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
              {loadingDetail ? (
                <div className="space-y-3 pt-6">
                  {[1, 2, 3].map((i) => <div key={i} className="h-4 bg-border/20 rounded animate-pulse" />)}
                </div>
              ) : detail ? (
                <div className="pt-2">
                  <div className="flex flex-col items-center text-center mb-5">
                    <div className="w-14 h-14 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold text-xl mb-2">
                      {detail.user.name.charAt(0)}
                    </div>
                    <h3 className="text-white font-bold">{detail.user.name}</h3>
                    <p className="text-muted-foreground text-xs">{detail.user.email}</p>
                    {detail.user.phone && <p className="text-muted-foreground text-xs">{detail.user.phone}</p>}
                  </div>

                  {/* Profile completion bar */}
                  {detail.profile && (
                    <div className="mb-4">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs text-muted-foreground">Profile</span>
                        <span className="text-xs text-white font-semibold ml-auto">{detail.profile.completionPercent}%</span>
                      </div>
                      <div className="h-2 bg-border rounded-full">
                        <div className="h-full bg-gradient-primary rounded-full" style={{ width: `${detail.profile.completionPercent}%` }} />
                      </div>
                    </div>
                  )}

                  {/* View Chat History button */}
                  <button
                    onClick={() => openChatHistory(selectedId)}
                    className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-xl border border-[#1E2A45] text-sm text-[#00A8FF] hover:bg-[#00A8FF]/10 transition-colors mb-4"
                  >
                    <MessageSquare className="w-4 h-4" />
                    View Chat History
                  </button>

                  {detail.profile ? (
                    <div className="space-y-3 text-sm">
                      {detail.profile.educationLevel && (
                        <div>
                          <p className="text-xs text-muted-foreground mb-0.5">Education</p>
                          <p className="text-white">{detail.profile.educationLevel}</p>
                        </div>
                      )}
                      {detail.profile.stream && (
                        <div>
                          <p className="text-xs text-muted-foreground mb-0.5">Stream</p>
                          <p className="text-white">{detail.profile.stream}</p>
                        </div>
                      )}
                      {detail.profile.dreamCareer && (
                        <div>
                          <p className="text-xs text-muted-foreground mb-0.5">Dream Career</p>
                          <p className="text-white">{detail.profile.dreamCareer}</p>
                        </div>
                      )}
                      {detail.profile.city && (
                        <div>
                          <p className="text-xs text-muted-foreground mb-0.5">Location</p>
                          <p className="text-white">{detail.profile.city}, {detail.profile.state}</p>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="text-center py-4 text-muted-foreground text-sm flex flex-col items-center gap-2">
                      <User className="w-6 h-6 opacity-40" />
                      Profile not completed
                    </div>
                  )}
                </div>
              ) : null}
            </div>
          )}
        </div>
      </div>

      {/* Chat History Modal */}
      <AnimatePresence>
        {chatStudentId !== null && (
          <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 16 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 16 }}
              className="bg-[#0F1628] border border-[#1E2A45] rounded-2xl w-full max-w-lg flex flex-col"
              style={{ maxHeight: "80vh" }}
            >
              <div className="flex items-center justify-between p-5 border-b border-[#1E2A45] flex-shrink-0">
                <div>
                  <h2 className="text-white font-bold">Chat History</h2>
                  <p className="text-muted-foreground text-xs">{chatStudentName} — last 20 messages</p>
                </div>
                <button onClick={() => setChatStudentId(null)} className="text-muted-foreground hover:text-white">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {chatLoading ? (
                  <div className="flex items-center justify-center py-12">
                    <div className="w-7 h-7 rounded-full border-2 border-primary border-t-transparent animate-spin" />
                  </div>
                ) : chatMessages.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12 gap-3">
                    <MessageSquare className="w-10 h-10 text-muted-foreground opacity-30" />
                    <p className="text-muted-foreground text-sm">No conversations yet</p>
                  </div>
                ) : (
                  chatMessages.map((msg) => (
                    <div
                      key={msg.id}
                      className={`flex gap-2 ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                    >
                      {msg.role === "assistant" && (
                        <div className="w-7 h-7 rounded-full bg-[#00A8FF]/20 flex items-center justify-center flex-shrink-0 mt-1">
                          <Bot className="w-3.5 h-3.5 text-[#00A8FF]" />
                        </div>
                      )}
                      <div className={`max-w-[75%] ${msg.role === "user" ? "items-end" : "items-start"} flex flex-col gap-1`}>
                        <div className={`px-3 py-2 rounded-xl text-sm leading-relaxed ${
                          msg.role === "user"
                            ? "bg-[#00A8FF]/20 text-white rounded-tr-sm"
                            : "bg-[#1E2A45] text-white/90 rounded-tl-sm"
                        }`}>
                          {msg.content}
                        </div>
                        <span className="text-[10px] text-muted-foreground px-1">
                          {new Date(msg.createdAt).toLocaleString("en-IN", { dateStyle: "short", timeStyle: "short" })}
                        </span>
                      </div>
                      {msg.role === "user" && (
                        <div className="w-7 h-7 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0 mt-1 text-primary text-xs font-bold">
                          {chatStudentName.charAt(0)}
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </AdminLayout>
  );
}
