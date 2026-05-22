import { useState } from "react";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { useListAdminContacts } from "@workspace/api-client-react";
import { Mail, Clock, Reply, Check, Circle } from "lucide-react";
import { useAuth } from "@/lib/auth";
import { toast } from "sonner";

type ContactWithRead = {
  id: number;
  name: string;
  email: string;
  message: string;
  isRead?: boolean;
  createdAt: string;
};

export default function AdminContacts() {
  const { data: contacts, isLoading, refetch } = useListAdminContacts();
  const { token } = useAuth();
  const [localRead, setLocalRead] = useState<Record<number, boolean>>({});
  const [toggling, setToggling] = useState<number | null>(null);

  const isRead = (c: ContactWithRead) => localRead[c.id] ?? Boolean(c.isRead);

  const toggleRead = async (id: number, currentRead: boolean) => {
    setToggling(id);
    try {
      const res = await fetch(`/api/admin/contacts/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ isRead: !currentRead }),
      });
      if (!res.ok) throw new Error();
      setLocalRead((prev) => ({ ...prev, [id]: !currentRead }));
    } catch {
      toast.error("Failed to update read status");
    } finally {
      setToggling(null);
    }
  };

  return (
    <AdminLayout>
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-2xl font-extrabold text-white mb-1">Contact Messages</h1>
          <p className="text-muted-foreground">Messages sent through the contact form.</p>
        </div>

        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => <div key={i} className="bg-card border border-border rounded-xl h-28 animate-pulse" />)}
          </div>
        ) : !contacts || contacts.length === 0 ? (
          <div className="text-center py-20 bg-card border border-border rounded-2xl">
            <Mail className="w-10 h-10 text-muted-foreground mx-auto mb-3 opacity-40" />
            <p className="text-muted-foreground">No messages yet.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {(contacts as ContactWithRead[]).map((contact) => {
              const read = isRead(contact);
              return (
                <div
                  key={contact.id}
                  className={`bg-card border border-border rounded-xl p-5 transition-opacity ${read ? "opacity-70" : "opacity-100"}`}
                  data-testid={`contact-message-${contact.id}`}
                >
                  <div className="flex items-start justify-between gap-4 mb-3">
                    <div className="flex items-center gap-3">
                      {/* Unread blue dot */}
                      <div className="relative flex-shrink-0">
                        <div className="w-9 h-9 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold text-sm">
                          {contact.name.charAt(0)}
                        </div>
                        {!read && (
                          <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-[#00A8FF] border-2 border-[#0F1628]" />
                        )}
                      </div>
                      <div>
                        <p className="text-white font-semibold text-sm">{contact.name}</p>
                        <p className="text-muted-foreground text-xs">{contact.email}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                        <Clock className="w-3 h-3" />
                        {new Date(contact.createdAt).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" })}
                      </div>
                    </div>
                  </div>

                  <p className="text-white/80 text-sm leading-relaxed pl-12 mb-4">{contact.message}</p>

                  {/* Action buttons */}
                  <div className="pl-12 flex items-center gap-2">
                    <a
                      href={`mailto:${contact.email}?subject=Re: Your MentoraLM Enquiry`}
                      className="inline-flex items-center gap-1.5 text-xs font-medium text-[#00A8FF] hover:text-[#00A8FF]/80 bg-[#00A8FF]/10 hover:bg-[#00A8FF]/15 px-3 py-1.5 rounded-lg transition-colors"
                    >
                      <Reply className="w-3.5 h-3.5" />
                      Reply via Email
                    </a>

                    <button
                      onClick={() => toggleRead(contact.id, read)}
                      disabled={toggling === contact.id}
                      className={`inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg transition-colors ${
                        read
                          ? "text-muted-foreground bg-white/5 hover:bg-white/10"
                          : "text-emerald-400 bg-emerald-400/10 hover:bg-emerald-400/15"
                      }`}
                    >
                      {read ? (
                        <><Circle className="w-3.5 h-3.5" />Mark as Unread</>
                      ) : (
                        <><Check className="w-3.5 h-3.5" />Mark as Read</>
                      )}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
