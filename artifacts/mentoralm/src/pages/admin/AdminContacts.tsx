import { AdminLayout } from "@/components/layout/AdminLayout";
import { useListAdminContacts } from "@workspace/api-client-react";
import { Mail, Clock } from "lucide-react";

export default function AdminContacts() {
  const { data: contacts, isLoading } = useListAdminContacts();

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
            {contacts.map((contact) => (
              <div key={contact.id} className="bg-card border border-border rounded-xl p-5" data-testid={`contact-message-${contact.id}`}>
                <div className="flex items-start justify-between gap-4 mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold flex-shrink-0 text-sm">
                      {contact.name.charAt(0)}
                    </div>
                    <div>
                      <p className="text-white font-semibold text-sm">{contact.name}</p>
                      <p className="text-muted-foreground text-xs">{contact.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground flex-shrink-0">
                    <Clock className="w-3 h-3" />
                    {new Date(contact.createdAt).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" })}
                  </div>
                </div>
                <p className="text-white/80 text-sm leading-relaxed pl-12">{contact.message}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
