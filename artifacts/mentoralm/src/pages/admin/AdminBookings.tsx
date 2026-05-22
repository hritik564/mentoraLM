import { useState } from "react";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { useListAdminBookings, useUpdateAdminBooking, getListAdminBookingsQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Calendar } from "lucide-react";

const STATUS_OPTIONS = ["All", "CONFIRMED", "PENDING", "CANCELLED"];

export default function AdminBookings() {
  const queryClient = useQueryClient();
  const { data: bookings, isLoading } = useListAdminBookings();
  const updateMutation = useUpdateAdminBooking();
  const [statusFilter, setStatusFilter] = useState("All");

  const filtered = statusFilter === "All"
    ? (bookings || [])
    : (bookings || []).filter((b) => b.status === statusFilter);

  const handleStatusUpdate = (id: number, status: string) => {
    updateMutation.mutate({ id, data: { status } }, {
      onSuccess: () => {
        toast.success("Status updated");
        queryClient.invalidateQueries({ queryKey: getListAdminBookingsQueryKey() });
      },
      onError: () => toast.error("Failed to update"),
    });
  };

  const statusColor: Record<string, string> = {
    CONFIRMED: "text-emerald-400 bg-emerald-400/10",
    PENDING: "text-amber-400 bg-amber-400/10",
    CANCELLED: "text-red-400 bg-red-400/10",
  };

  return (
    <AdminLayout>
      <div className="max-w-5xl mx-auto">
        <div className="mb-8">
          <h1 className="text-2xl font-extrabold text-white mb-1">Bookings</h1>
          <p className="text-muted-foreground">Manage all session bookings.</p>
        </div>

        {/* Filter */}
        <div className="flex flex-wrap gap-2 mb-6">
          {STATUS_OPTIONS.map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              data-testid={`filter-${s}`}
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all ${
                statusFilter === s
                  ? "bg-gradient-primary text-white"
                  : "bg-card border border-border text-muted-foreground hover:text-white"
              }`}
            >
              {s}
            </button>
          ))}
        </div>

        <div className="bg-card border border-border rounded-2xl overflow-hidden">
          {isLoading ? (
            <div className="p-6 space-y-3">
              {[1, 2, 3].map((i) => <div key={i} className="h-14 bg-border/20 rounded animate-pulse" />)}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[700px]">
                <thead>
                  <tr className="border-b border-border text-left text-xs text-muted-foreground uppercase tracking-wider">
                    <th className="px-5 py-3">Student</th>
                    <th className="px-5 py-3">Service</th>
                    <th className="px-5 py-3">Date/Time</th>
                    <th className="px-5 py-3">Amount</th>
                    <th className="px-5 py-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {filtered.map((booking) => (
                    <tr key={booking.id} className="hover:bg-white/2 transition-colors" data-testid={`booking-row-${booking.id}`}>
                      <td className="px-5 py-4">
                        <p className="text-white text-sm font-medium">{booking.studentName}</p>
                        <p className="text-muted-foreground text-xs">{booking.studentEmail}</p>
                      </td>
                      <td className="px-5 py-4 min-w-[220px]">
                        <p className="text-white text-sm">{booking.serviceTitle}</p>
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-1.5 text-muted-foreground text-xs">
                          <Calendar className="w-3 h-3" />
                          {new Date(booking.slotDateTime).toLocaleString("en-IN", { dateStyle: "short", timeStyle: "short" })}
                        </div>
                      </td>
                      <td className="px-5 py-4 text-white font-semibold text-sm">
                        ₹{booking.amount.toLocaleString("en-IN")}
                      </td>
                      <td className="px-5 py-4">
                        <select
                          value={booking.status}
                          onChange={(e) => handleStatusUpdate(booking.id, e.target.value)}
                          data-testid={`status-select-${booking.id}`}
                          className={`text-xs font-semibold px-2.5 py-1.5 rounded-lg border-0 cursor-pointer bg-transparent ${statusColor[booking.status] || "text-muted-foreground"}`}
                        >
                          <option value="PENDING">PENDING</option>
                          <option value="CONFIRMED">CONFIRMED</option>
                          <option value="CANCELLED">CANCELLED</option>
                          <option value="COMPLETED">COMPLETED</option>
                        </select>
                      </td>
                    </tr>
                  ))}
                  {filtered.length === 0 && (
                    <tr><td colSpan={5} className="px-5 py-10 text-center text-muted-foreground">No bookings found.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}
