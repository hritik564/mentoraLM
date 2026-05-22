import { useState } from "react";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { Input } from "@/components/ui/input";
import { useListAdminStudents, useGetAdminStudent, getGetAdminStudentQueryKey } from "@workspace/api-client-react";
import { Search, X, User } from "lucide-react";

export default function AdminStudents() {
  const { data: students, isLoading } = useListAdminStudents();
  const [search, setSearch] = useState("");
  const [selectedId, setSelectedId] = useState<number | null>(null);

  const { data: detail, isLoading: loadingDetail } = useGetAdminStudent(selectedId!, {
    query: { enabled: !!selectedId, queryKey: getGetAdminStudentQueryKey(selectedId!) },
  });

  const filtered = (students || []).filter((s) =>
    s.name.toLowerCase().includes(search.toLowerCase()) ||
    s.email.toLowerCase().includes(search.toLowerCase())
  );

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
                      <div>
                        <p className="text-xs text-muted-foreground mb-1">Profile</p>
                        <div className="flex items-center gap-2">
                          <div className="flex-1 h-2 bg-border rounded-full">
                            <div className="h-full bg-gradient-primary rounded-full" style={{ width: `${detail.profile.completionPercent}%` }} />
                          </div>
                          <span className="text-xs text-white font-semibold">{detail.profile.completionPercent}%</span>
                        </div>
                      </div>
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
    </AdminLayout>
  );
}
