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
import { Plus, Pencil, Trash2, X, Save, CalendarPlus } from "lucide-react";
import type { Service } from "@workspace/api-client-react";

const emptyForm = {
  title: "",
  shortDesc: "",
  fullDesc: "",
  included: "",
  category: "",
  duration: "60",
  price: 0,
  counsellorName: "",
  counsellorBio: "",
  thumbnailUrl: "",
  status: "published",
  slotsArr: [] as string[],
};

type FormData = typeof emptyForm;

function parseSlots(raw: unknown): string[] {
  if (Array.isArray(raw)) return raw as string[];
  if (typeof raw === "string") {
    try { const p = JSON.parse(raw); return Array.isArray(p) ? p : []; } catch { return []; }
  }
  return [];
}

function formatSlotChip(iso: string) {
  try {
    return new Date(iso).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" });
  } catch {
    return iso;
  }
}

export default function AdminServices() {
  const queryClient = useQueryClient();
  const { data: services, isLoading } = useListServices();
  const createMutation = useCreateAdminService();
  const updateMutation = useUpdateAdminService();
  const deleteMutation = useDeleteAdminService();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingService, setEditingService] = useState<Service | null>(null);
  const [form, setForm] = useState<FormData>(emptyForm);

  // Slot picker state (local to modal)
  const [slotDate, setSlotDate] = useState("");
  const [slotTime, setSlotTime] = useState("10:00");

  const openCreate = () => {
    setEditingService(null);
    setForm(emptyForm);
    setSlotDate("");
    setSlotTime("10:00");
    setIsModalOpen(true);
  };

  const openEdit = (s: Service) => {
    setEditingService(s);
    setForm({
      title: s.title,
      shortDesc: s.shortDesc,
      fullDesc: s.fullDesc || "",
      included: Array.isArray(s.included)
        ? (s.included as string[]).join("\n")
        : typeof s.included === "string" ? s.included : "",
      category: s.category,
      duration: String(s.duration),
      price: s.price,
      counsellorName: s.counsellorName,
      counsellorBio: s.counsellorBio || "",
      thumbnailUrl: s.thumbnailUrl || "",
      status: s.status,
      slotsArr: parseSlots(s.slots),
    });
    setSlotDate("");
    setSlotTime("10:00");
    setIsModalOpen(true);
  };

  const addSlot = () => {
    if (!slotDate) { toast.error("Please select a date"); return; }
    const iso = `${slotDate}T${slotTime}:00`;
    if (form.slotsArr.includes(iso)) { toast.error("Slot already added"); return; }
    setForm((p) => ({ ...p, slotsArr: [...p.slotsArr, iso].sort() }));
    setSlotDate("");
    setSlotTime("10:00");
  };

  const removeSlot = (iso: string) => {
    setForm((p) => ({ ...p, slotsArr: p.slotsArr.filter((s) => s !== iso) }));
  };

  const handleSave = () => {
    if (!form.counsellorName.trim()) {
      toast.error("Counsellor name is required");
      return;
    }
    const data = {
      title: form.title,
      shortDesc: form.shortDesc,
      fullDesc: form.fullDesc,
      included: form.included,
      category: form.category,
      duration: form.duration,
      price: Number(form.price),
      counsellorName: form.counsellorName,
      counsellorBio: form.counsellorBio,
      thumbnailUrl: form.thumbnailUrl || undefined,
      status: form.status,
      slots: form.slotsArr,
    };
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
  const minDate = new Date(Date.now() + 86400000).toISOString().split("T")[0];

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
                  <th className="px-5 py-3">Slots</th>
                  <th className="px-5 py-3">Status</th>
                  <th className="px-5 py-3">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {(services || []).map((service) => {
                  const slots = parseSlots(service.slots);
                  return (
                    <tr key={service.id} className="hover:bg-white/2 transition-colors" data-testid={`service-row-${service.id}`}>
                      <td className="px-5 py-4">
                        <p className="text-white font-medium text-sm">{service.title}</p>
                        <p className="text-muted-foreground text-xs mt-0.5 line-clamp-1">{service.shortDesc}</p>
                      </td>
                      <td className="px-5 py-4">
                        <span className="text-xs text-primary bg-primary/10 px-2.5 py-1 rounded-full">{service.category}</span>
                      </td>
                      <td className="px-5 py-4 text-white text-sm font-semibold">₹{service.price.toLocaleString("en-IN")}</td>
                      <td className="px-5 py-4 text-muted-foreground text-xs">{slots.length} slot{slots.length !== 1 ? "s" : ""}</td>
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
                  );
                })}
                {(!services || services.length === 0) && (
                  <tr><td colSpan={6} className="px-5 py-10 text-center text-muted-foreground">No services yet.</td></tr>
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
                {(["title", "shortDesc", "category"] as const).map((field) => (
                  <div key={field}>
                    <label className="text-sm font-medium text-white mb-1.5 block capitalize">{field.replace(/([A-Z])/g, " $1")}</label>
                    <Input value={form[field]} onChange={(e) => setForm((p) => ({ ...p, [field]: e.target.value }))} className={inputCls} />
                  </div>
                ))}
                <div>
                  <label className="text-sm font-medium text-white mb-1.5 flex items-center gap-1">
                    Counsellor Name
                    <span className="text-red-400 text-sm">*</span>
                  </label>
                  <Input
                    value={form.counsellorName}
                    onChange={(e) => setForm((p) => ({ ...p, counsellorName: e.target.value }))}
                    placeholder="e.g. Munish LP"
                    className={inputCls}
                  />
                  <p className="text-xs text-muted-foreground mt-1.5">This name will be shown to students.</p>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-sm font-medium text-white mb-1.5 block">Price (₹)</label>
                    <Input type="number" value={form.price} onChange={(e) => setForm((p) => ({ ...p, price: Number(e.target.value) }))} className={inputCls} />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-white mb-1.5 block">Duration (min)</label>
                    <Input value={form.duration} onChange={(e) => setForm((p) => ({ ...p, duration: e.target.value }))} className={inputCls} />
                  </div>
                </div>

                {/* Time Slots */}
                <div>
                  <label className="text-sm font-medium text-white mb-2 block">Time Slots</label>
                  {/* Picker row */}
                  <div className="flex gap-2 mb-2">
                    <input
                      type="date"
                      value={slotDate}
                      min={minDate}
                      onChange={(e) => setSlotDate(e.target.value)}
                      className="flex-1 rounded-md border border-[#1E2A45] bg-[#080C1A] px-3 py-2 text-white text-sm focus:outline-none focus:border-primary/50"
                    />
                    <input
                      type="time"
                      value={slotTime}
                      onChange={(e) => setSlotTime(e.target.value)}
                      className="w-28 rounded-md border border-[#1E2A45] bg-[#080C1A] px-3 py-2 text-white text-sm focus:outline-none focus:border-primary/50"
                    />
                    <Button
                      type="button"
                      onClick={addSlot}
                      size="sm"
                      className="bg-gradient-primary border-0 flex-shrink-0"
                    >
                      <CalendarPlus className="w-4 h-4 mr-1" />
                      Add
                    </Button>
                  </div>
                  {/* Chips */}
                  {form.slotsArr.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {form.slotsArr.map((iso) => (
                        <span
                          key={iso}
                          className="inline-flex items-center gap-1.5 bg-[#00A8FF]/10 border border-[#00A8FF]/20 text-[#00A8FF] text-xs rounded-full px-2.5 py-1"
                        >
                          {formatSlotChip(iso)}
                          <button
                            type="button"
                            onClick={() => removeSlot(iso)}
                            className="text-[#00A8FF]/60 hover:text-[#00A8FF] transition-colors"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </span>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-muted-foreground">No slots added yet. Add date + time above.</p>
                  )}
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
                <div>
                  <label className="text-sm font-medium text-white mb-1.5 block">Counsellor Bio</label>
                  <textarea value={form.counsellorBio} onChange={(e) => setForm((p) => ({ ...p, counsellorBio: e.target.value }))} rows={2} className={`w-full rounded-md border px-3 py-2 resize-none ${inputCls}`} />
                </div>
                <div>
                  <label className="text-sm font-medium text-white mb-1.5 block">Thumbnail URL</label>
                  <Input
                    type="url"
                    placeholder="https://example.com/image.jpg"
                    value={form.thumbnailUrl}
                    onChange={(e) => setForm((p) => ({ ...p, thumbnailUrl: e.target.value }))}
                    className={inputCls}
                  />
                  {form.thumbnailUrl && (
                    <div className="mt-2 rounded-lg overflow-hidden border border-[#1E2A45] h-24">
                      <img
                        src={form.thumbnailUrl}
                        alt="Thumbnail preview"
                        className="w-full h-full object-cover"
                        onError={(e) => { e.currentTarget.style.display = "none"; }}
                      />
                    </div>
                  )}
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
