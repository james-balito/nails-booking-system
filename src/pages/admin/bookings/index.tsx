import { useEffect, useState, useMemo } from "react";
import {
  listAllBookings,
  updateBookingDetails,
  deleteBooking,
} from "../../../api/bookings";
import { DataTable, type Column } from "../../../components/data-table";
import ToastContainer, { type ToastItem } from "../../../components/toast";

interface Booking {
  id: string;
  date: string;
  time: string;
  status: string;
  notes: string;
  created_at: string;
  user: { full_name: string } | null;
  booking_services: {
    id: string;
    custom_image_url: string | null;
    service: { name: string } | null;
    design: { title: string; image_url: string } | null;
  }[];
}

export default function BookingsAdmin() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Action loading states
  const [actionLoading, setActionLoading] = useState<{
    type: "view" | "edit" | "delete";
    id: string;
  } | null>(null);

  // Filter State
  const [statusFilter, setStatusFilter] = useState<string>("all");

  // Modal States
  const [viewBooking, setViewBooking] = useState<Booking | null>(null);
  const [editBooking, setEditBooking] = useState<Booking | null>(null);
  const [deleteBookingTarget, setDeleteBookingTarget] = useState<Booking | null>(null);

  const [isSaving, setIsSaving] = useState(false);
  const [editForm, setEditForm] = useState({
    date: "",
    time: "",
    notes: "",
    status: "",
  });

  // Toast State (Stacked Array)
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  useEffect(() => {
    listAllBookings()
      .then((data) => setBookings(data as unknown as Booking[]))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  // ── Toast Helpers ────────────────────────────────────────────────────────
  const closeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const showToast = (
    variant: "success" | "error" | "info" | "warning",
    header: string,
    description: string,
  ) => {
    const id = crypto.randomUUID();

    let icon;
    switch (variant) {
      case "success":
        icon = <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5"/></svg>;
        break;
      case "error":
        icon = <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>;
        break;
      case "warning":
        icon = <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#eab308" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/></svg>;
        break;
      default:
        icon = <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#FF007F" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/></svg>;
    }

    setToasts((prev) => [...prev, { id, variant, header, description, icon }]);
    setTimeout(() => closeToast(id), 3000);
  };

  // ── View Booking ──────────────────────────────────────────────────────────
  const handleViewBooking = (booking: Booking) => {
    setActionLoading({ type: "view", id: booking.id });
    setTimeout(() => {
      setViewBooking(booking);
      setActionLoading(null);
    }, 400);
  };

  // ── Edit Booking ──────────────────────────────────────────────────────────
  const handleOpenEditModal = (booking: Booking) => {
    setActionLoading({ type: "edit", id: booking.id });
    setTimeout(() => {
      setEditBooking(booking);
      setEditForm({
        date: booking.date,
        time: booking.time,
        notes: booking.notes,
        status: booking.status,
      });
      setActionLoading(null);
    }, 400);
  };

  const handleSaveEdit = async () => {
    if (!editBooking) return;
    setIsSaving(true);
    try {
      await updateBookingDetails(editBooking.id, {
        date: editForm.date,
        time: editForm.time,
        notes: editForm.notes,
        status: editForm.status,
      });

      setBookings((prev) =>
        prev.map((b) => (b.id === editBooking.id ? { ...b, ...editForm } : b)),
      );
      setEditBooking(null);
      showToast("success", "Saved", "Booking details updated.");
    } catch (err: any) {
      showToast("error", "Save Failed", err.message);
    } finally {
      setIsSaving(false);
    }
  };

  // ── Delete Booking ────────────────────────────────────────────────────────
  const handleOpenDeleteModal = (booking: Booking) => {
    setActionLoading({ type: "delete", id: booking.id });
    setTimeout(() => {
      setDeleteBookingTarget(booking);
      setActionLoading(null);
    }, 400);
  };

  const handleDelete = async () => {
    if (!deleteBookingTarget) return;
    setIsSaving(true);
    try {
      await deleteBooking(deleteBookingTarget.id);
      setBookings((prev) =>
        prev.filter((b) => b.id !== deleteBookingTarget.id),
      );
      setDeleteBookingTarget(null);
      showToast("success", "Deleted", "Booking removed permanently.");
    } catch (err: any) {
      showToast("error", "Delete Failed", err.message);
    } finally {
      setIsSaving(false);
    }
  };

  // ── Filter Logic ──────────────────────────────────────────────────────────
  const filteredBookings = useMemo(() => {
    if (statusFilter === "all") return bookings;
    return bookings.filter((b) => b.status === statusFilter);
  }, [bookings, statusFilter]);

  if (error) return <div className="p-8 text-red-400">Error: {error}</div>;

  // ── Table Columns ─────────────────────────────────────────────────────────
  const columns: Column<Booking>[] = [
    {
      header: "Client",
      cell: (booking) => (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-[#FF007F]/20 flex items-center justify-center text-[#FF007F] font-bold text-lg shrink-0">
            {booking.user?.full_name?.charAt(0) || "U"}
          </div>
          <div className="min-w-0">
            <p className="text-white font-bold truncate">
              {booking.user?.full_name || "Unknown User"}
            </p>
          </div>
        </div>
      ),
    },
    {
      header: "Booked On",
      cell: (booking) => (
        <p className="text-xs text-gray-500 font-medium">
          {new Date(booking.created_at).toLocaleDateString("en-US", {
            month: "short", day: "numeric", year: "numeric",
          })}{" "}
          {new Date(booking.created_at).toLocaleTimeString("en-US", {
            hour: "numeric", minute: "2-digit",
          })}
        </p>
      ),
    },
    {
      header: "Date",
      cell: (b) => <p className="text-sm text-gray-300 font-medium">{b.date}</p>,
    },
    {
      header: "Time",
      cell: (b) => <p className="text-sm text-gray-300 font-medium">{b.time}</p>,
    },
    {
      header: "Services",
      cell: (booking) => (
        <div className="flex flex-wrap gap-2">
          {booking.booking_services.map((item, i) => (
            <div key={i} className="flex items-center gap-2 bg-white/5 p-1.5 pr-3 rounded-md border border-white/5">
              {item.design?.image_url ? (
                <img src={item.design.image_url} alt="Design" className="w-8 h-10 object-cover rounded" />
              ) : item.custom_image_url ? (
                <img src={item.custom_image_url} alt="Custom" className="w-8 h-10 object-cover rounded" />
              ) : (
                <div className="w-8 h-10 rounded bg-black/50 border border-white/10 flex items-center justify-center text-gray-500">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" /></svg>
                </div>
              )}
              <div>
                <p className="text-xs font-bold text-white">{item.service?.name}</p>
                {item.design && <p className="text-[10px] text-gray-400">{item.design.title}</p>}
                {item.custom_image_url && <p className="text-[10px] text-[#FF007F]">Custom</p>}
              </div>
            </div>
          ))}
        </div>
      ),
    },
    {
      header: "Status",
      cell: (booking) => {
        const getStatusBadge = (status: string) => {
          switch (status) {
            case "pending": return "bg-yellow-500/10 text-yellow-400 border-yellow-500/20";
            case "approved": return "bg-emerald-500/10 text-emerald-400 border-emerald-500/20";
            case "completed": return "bg-blue-500/10 text-blue-400 border-blue-500/20";
            case "cancelled": return "bg-red-500/10 text-red-400 border-red-500/20";
            default: return "bg-gray-500/10 text-gray-400 border-gray-500/20";
          }
        };

        return (
          <span className={`inline-block px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider border ${getStatusBadge(booking.status)}`}>
            {booking.status}
          </span>
        );
      },
    },
    {
      header: "Actions",
      className: "md:text-right",
      cell: (booking) => {
        const isViewLoading = actionLoading?.type === "view" && actionLoading.id === booking.id;
        const isEditLoading = actionLoading?.type === "edit" && actionLoading.id === booking.id;
        const isDeleteLoading = actionLoading?.type === "delete" && actionLoading.id === booking.id;

        return (
          <div className="flex justify-start md:justify-end gap-2">
            <button onClick={() => handleViewBooking(booking)} disabled={isViewLoading} className="px-3 py-2 rounded-lg text-xs font-bold bg-white/5 hover:bg-white/10 text-white transition-colors disabled:opacity-50 flex items-center gap-1.5 min-w-[60px] justify-center">
              {isViewLoading ? <svg className="animate-spin h-3 w-3 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg> : "View"}
            </button>
            <button onClick={() => handleOpenEditModal(booking)} disabled={isEditLoading} className="px-3 py-2 rounded-lg text-xs font-bold bg-[#FF007F]/10 hover:bg-[#FF007F]/20 text-[#FF007F] transition-colors disabled:opacity-50 flex items-center gap-1.5 min-w-[60px] justify-center">
              {isEditLoading ? <svg className="animate-spin h-3 w-3 text-[#FF007F]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg> : "Edit"}
            </button>
            <button onClick={() => handleOpenDeleteModal(booking)} disabled={isDeleteLoading} className="px-3 py-2 rounded-lg text-xs font-bold bg-red-500/10 hover:bg-red-500/20 text-red-400 transition-colors disabled:opacity-50 flex items-center gap-1.5 min-w-[60px] justify-center">
              {isDeleteLoading ? <svg className="animate-spin h-3 w-3 text-red-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg> : "Delete"}
            </button>
          </div>
        );
      },
    },
  ];

  return (
    <div className="p-4 sm:p-8 mx-auto space-y-6">
      {/* Header & Filter */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white">Latest Bookings</h1>
          <p className="text-gray-400 text-sm mt-1">Manage client appointments and combos.</p>
        </div>
        <div className="flex items-center gap-3">
          <label className="text-sm font-semibold text-gray-400">Filter by Status:</label>
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="bg-black border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-[#FF007F]">
            <option value="all">All Bookings</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
      </div>

      <DataTable data={filteredBookings} columns={columns} keyExtractor={(b) => b.id} isLoading={loading} emptyMessage={`No bookings found ${statusFilter !== "all" ? `with status "${statusFilter}"` : ""}.`} />

      {/* ── VIEW MODAL ───────────────────────────────────────────────────── */}
      {viewBooking && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setViewBooking(null)} />
          <div className="relative w-full max-w-2xl bg-[#1A1A1A] border border-white/10 rounded-2xl p-6 shadow-2xl flex flex-col max-h-[90vh]">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-white">Booking Details</h2>
              <button onClick={() => setViewBooking(null)} className="text-gray-400 hover:text-white">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" x2="6" y1="6" y2="18"/><line x1="6" x2="18" y1="6" y2="18"/></svg>
              </button>
            </div>
            <div className="overflow-y-auto space-y-4 pr-2">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-black/40 p-3 rounded-lg border border-white/5">
                  <p className="text-xs text-gray-500 mb-1">Client</p>
                  <p className="text-sm font-bold text-white">{viewBooking.user?.full_name || "Unknown"}</p>
                </div>
                <div className="bg-black/40 p-3 rounded-lg border border-white/5">
                  <p className="text-xs text-gray-500 mb-1">Date & Time</p>
                  <p className="text-sm font-bold text-white">{viewBooking.date} at {viewBooking.time}</p>
                </div>
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-2">Booked Services</p>
                <div className="space-y-2">
                  {viewBooking.booking_services.map((item, i) => (
                    <div key={i} className="flex items-center gap-4 bg-white/5 p-3 rounded-lg border border-white/5">
                      {item.design?.image_url ? (
                        <img src={item.design.image_url} alt="Design" className="w-16 h-20 object-cover rounded-md" />
                      ) : item.custom_image_url ? (
                        <img src={item.custom_image_url} alt="Custom" className="w-16 h-20 object-cover rounded-md" />
                      ) : (
                        <div className="w-16 h-20 rounded-md bg-black/50 border border-white/10 flex items-center justify-center text-gray-500">
                          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
                        </div>
                      )}
                      <div>
                        <p className="text-base font-bold text-white">{item.service?.name}</p>
                        {item.design && <p className="text-sm text-gray-400">Design: {item.design.title}</p>}
                        {item.custom_image_url && <p className="text-sm text-[#FF007F]">Custom Image Uploaded</p>}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              {viewBooking.notes && (
                <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-3">
                  <p className="text-xs text-yellow-500 font-bold uppercase tracking-wider mb-1">Notes</p>
                  <p className="text-sm text-yellow-100/80">{viewBooking.notes}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── EDIT MODAL ───────────────────────────────────────────────────── */}
      {editBooking && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setEditBooking(null)} />
          <div className="relative w-full max-w-md bg-[#1A1A1A] border border-white/10 rounded-2xl p-6 shadow-2xl">
            <h2 className="text-xl font-bold text-white mb-6">Edit Booking</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Date</label>
                <input type="date" value={editForm.date} onChange={(e) => setEditForm({ ...editForm, date: e.target.value })} className="w-full bg-black border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#FF007F]" />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Time</label>
                <input type="text" value={editForm.time} onChange={(e) => setEditForm({ ...editForm, time: e.target.value })} className="w-full bg-black border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#FF007F]" />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Notes</label>
                <textarea rows={3} value={editForm.notes} onChange={(e) => setEditForm({ ...editForm, notes: e.target.value })} className="w-full bg-black border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#FF007F] resize-none" />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Status</label>
                <select value={editForm.status} onChange={(e) => setEditForm({ ...editForm, status: e.target.value })} className={`w-full bg-black border rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#FF007F] ${
                  editForm.status === "pending" ? "border-yellow-500/50 text-yellow-400" :
                  editForm.status === "approved" ? "border-emerald-500/50 text-emerald-400" :
                  editForm.status === "completed" ? "border-blue-500/50 text-blue-400" :
                  "border-red-500/50 text-red-400"
                }`}>
                  <option value="pending">Pending</option>
                  <option value="approved">Approved</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={() => setEditBooking(null)} className="flex-1 py-3 rounded-xl border border-white/10 text-white font-bold hover:bg-white/5 transition-all">Cancel</button>
              <button onClick={handleSaveEdit} disabled={isSaving} className="flex-1 py-3 rounded-xl bg-[#FF007F] text-white font-bold hover:bg-[#ff1a8c] transition-all disabled:opacity-50 flex items-center justify-center gap-2">
                {isSaving ? (
                  <>
                    <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                    Saving...
                  </>
                ) : "Save Changes"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── DELETE MODAL ─────────────────────────────────────────────────── */}
      {deleteBookingTarget && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setDeleteBookingTarget(null)} />
          <div className="relative w-full max-w-sm bg-[#1A1A1A] border border-white/10 rounded-2xl p-6 shadow-2xl">
            <div className="w-12 h-12 rounded-full bg-red-500/10 flex items-center justify-center text-red-500 mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>
            </div>
            <h3 className="text-xl font-bold text-white mb-2">Delete Booking?</h3>
            <p className="text-sm text-gray-400 mb-6">
              Are you sure you want to permanently delete this booking for{" "}
              <strong className="text-white">{deleteBookingTarget.user?.full_name || "Unknown User"}</strong>? This action cannot be undone.
            </p>
            <div className="flex gap-3">
              <button onClick={() => setDeleteBookingTarget(null)} className="flex-1 py-3 rounded-xl border border-white/10 text-white font-bold hover:bg-white/5 transition-all">Cancel</button>
              <button onClick={handleDelete} disabled={isSaving} className="flex-1 py-3 rounded-xl bg-red-500 text-white font-bold hover:bg-red-600 transition-all disabled:opacity-50 flex items-center justify-center gap-2">
                {isSaving ? (
                  <>
                    <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                    Deleting...
                  </>
                ) : "Yes, Delete"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── STACKED TOAST CONTAINER ─────────────────────────────────────── */}
      <ToastContainer toasts={toasts} onClose={closeToast} />
    </div>
  );
}