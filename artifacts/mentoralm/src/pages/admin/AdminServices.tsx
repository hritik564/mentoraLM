import { useState } from "react";
import { motion } from "framer-motion";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  useListServices,
  useCreateAdminService,
  useUpdateAdminService,
  useDeleteAdminService,
  getListServicesQueryKey,
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Plus, Pencil, Trash2, X, Save } from "lucide-react";
import type { Service } from "@workspace/api-client-react";

const emptyForm = {
  title: "",
  shortDesc: "",
  fullDesc: "",
  included: "",
  category: "",
  duration: 60,
  price: 0,
  counsellorName: "",
  counsellorBio: "",
  status: "published",
  slots: 10,
};

type FormData = typeof emptyForm;

export default function AdminServices() {
  const queryClient = useQueryClient();
  const { data: services, isLoading } = useListServices();
  const createMutation = useCreateAdminService();
  const updateMutation = useUpdateAdminService();
  const deleteMutation = useDeleteAdminService();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingService, setEditingService] = useState<Service | null>(null);
  const [form, setForm] = useState<FormData>(emptyForm);

  const openCreate = () => { setEditingService(null); setForm(emptyForm); setIsModalOpen(true); };
  const openEdit = (s: Service) => {
    setEditingService(s);
    setForm({
      title: s.title,
      shortDesc: s.shortDesc,
      fullDesc: s.fullDesc || "",
      included: Array.isArray(s.included) ? (s.included as string[]).join("\n") : (s.included as string) || "",
      category: s.category,
      duration: s.duration,
      price: s.price,
      counsellorName: s.counsellorName,
      counsellorBio: s.counsellorBio || "",
      status: s.status,
      slots: s.slots,
    });
    setIsModalOpen(true);
  };

  const handleSave = () => {
    const data = { ...form, included: form.included.split("\n").filter(Boolean) };
    if (editingService) {
      updateMutation.mutate({ id: editingService.id, data }, {
        onSuccess: () => { toast.success("Service updated"); queryClient.invalidateQueries({ queryKey: getListServicesQueryKey() }); setIsModalOpen(false); },
        onError: () => toast.error("Failed to update"),
      });
    } else {
      createMutation.mutate({ data }, {
        onSuccess: () => { toast.success("Service created"); queryClient.invalidateQueries({ queryKey: getListServicesQueryKey() }); setIsModalOpen(false); },
        onError: () => toast.error("Failed to create"),
      });
    }
  };

  const handleDelete = (id: number) => {
    if (!confirm("Delete this service?")) return;
    deleteMutation.mutate({ id }, {
      onSuccess: () => { toast.success("Service deleted"); queryClient.invalidateQueries({ queryKey: getListServicesQueryKey() }); },
      onError: () => toast.error("Failed to delete"),
    });
  };

  const inputCls = "bg-[#080C1A] border-[#1E2A45] text-white text-sm";

  return (
    <AdminLayout>
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-extrabold text-white mb-1">Services</h1>
            <p className="text-muted-foreground">Manage your counselling service catalogue.</p>
          </div>
          <Button onClick={openCreate} className="bg-gradient-primary border-0" data-testid="create-service-btn">
            <Plus className="w-4 h-4 mr-2" />
            Add Service
          </Button>
        </div>

        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => <div key={i} className="bg-card border border-border rounded-xl h-16 animate-pulse" />)}
          </div>
        ) : (
          <div className="bg-card border border-border rounded-2xl overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border text-left text-xs text-muted-foreground uppercase tracking-wider">
                  <th className="px-5 py-3">Service</th>
                  <th className="px-5 py-3">Category</th>
                  <th className="px-5 py-3">Price</th>
                  <th className="px-5 py-3">Status</th>
                  <th className="px-5 py-3">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {(services || []).map((service) => (
                  <tr key={service.id} className="hover:bg-white/2 transition-colors" data-testid={`service-row-${service.id}`}>
                    <td className="px-5 py-4">
                      <p className="text-white font-medium text-sm">{service.title}</p>
                      <p className="text-muted-foreground text-xs mt-0.5 line-clamp-1">{service.shortDesc}</p>
                    </td>
                    <td className="px-5 py-4">
                      <span className="text-xs text-primary bg-primary/10 px-2.5 py-1 rounded-full">{service.category}</span>
                    </td>
                    <td className="px-5 py-4 text-white text-sm font-semibold">₹{service.price.toLocaleString("en-IN")}</td>
                    <td className="px-5 py-4">
                      <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${service.status === "published" ? "text-emerald-400 bg-emerald-400/10" : "text-amber-400 bg-amber-400/10"}`}>
                        {service.status}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2">
                        <button onClick={() => openEdit(service)} className="p-1.5 rounded-lg hover:bg-white/5 text-muted-foreground hover:text-white transition-colors" data-testid={`edit-service-${service.id}`}>
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button onClick={() => handleDelete(service.id)} className="p-1.5 rounded-lg hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors" data-testid={`delete-service-${service.id}`}>
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {(!services || services.length === 0) && (
                  <tr><td colSpan={5} className="px-5 py-10 text-center text-muted-foreground">No services yet.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* Modal */}
        {isModalOpen && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-[#0F1628] border border-[#1E2A45] rounded-2xl w-full max-w-xl max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between p-6 border-b border-[#1E2A45]">
                <h2 className="text-white font-bold text-lg">{editingService ? "Edit Service" : "Add Service"}</h2>
                <button onClick={() => setIsModalOpen(false)} className="text-muted-foreground hover:text-white"><X className="w-5 h-5" /></button>
              </div>
              <div className="p-6 space-y-4">
                {(["title", "shortDesc", "category", "counsellorName"] as const).map((field) => (
                  <div key={field}>
                    <label className="text-sm font-medium text-white mb-1.5 block capitalize">{field.replace(/([A-Z])/g, " $1")}</label>
                    <Input value={form[field]} onChange={(e) => setForm((p) => ({ ...p, [field]: e.target.value }))} className={inputCls} />
                  </div>
                ))}
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="text-sm font-medium text-white mb-1.5 block">Price (₹)</label>
                    <Input type="number" value={form.price} onChange={(e) => setForm((p) => ({ ...p, price: Number(e.target.value) }))} className={inputCls} />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-white mb-1.5 block">Duration (min)</label>
                    <Input type="number" value={form.duration} onChange={(e) => setForm((p) => ({ ...p, duration: Number(e.target.value) }))} className={inputCls} />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-white mb-1.5 block">Slots</label>
                    <Input type="number" value={form.slots} onChange={(e) => setForm((p) => ({ ...p, slots: Number(e.target.value) }))} className={inputCls} />
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-white mb-1.5 block">Status</label>
                  <select value={form.status} onChange={(e) => setForm((p) => ({ ...p, status: e.target.value }))} className={`w-full rounded-md border px-3 py-2 ${inputCls}`}>
                    <option value="published">Published</option>
                    <option value="draft">Draft</option>
                  </select>
                </div>
                <div>
                  <label className="text-sm font-medium text-white mb-1.5 block">Full Description</label>
                  <textarea value={form.fullDesc} onChange={(e) => setForm((p) => ({ ...p, fullDesc: e.target.value }))} rows={3} className={`w-full rounded-md border px-3 py-2 resize-none ${inputCls}`} />
                </div>
                <div>
                  <label className="text-sm font-medium text-white mb-1.5 block">What's Included (one per line)</label>
                  <textarea value={form.included} onChange={(e) => setForm((p) => ({ ...p, included: e.target.value }))} rows={3} className={`w-full rounded-md border px-3 py-2 resize-none ${inputCls}`} />
                </div>
              </div>
              <div className="p-6 border-t border-[#1E2A45] flex justify-end gap-3">
                <Button variant="outline" onClick={() => setIsModalOpen(false)} className="border-border">Cancel</Button>
                <Button onClick={handleSave} disabled={createMutation.isPending || updateMutation.isPending} className="bg-gradient-primary border-0" data-testid="save-service-btn">
                  <Save className="w-4 h-4 mr-2" />
                  {createMutation.isPending || updateMutation.isPending ? "Saving..." : "Save Service"}
                </Button>
              </div>
            </motion.div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
