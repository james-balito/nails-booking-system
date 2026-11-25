import { useEffect, useState, useMemo } from "react";
import { listAllBookings } from "../../../api/bookings";
import { DataTable, type Column } from "../../../components/data-table";
// import { Calendar, Clock, User, Scissors } from "lucide-react";

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

export default function Schedule() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>("all");

  useEffect(() => {
    listAllBookings()
      .then((data) => setBookings(data as unknown as Booking[]))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  // Filter logic
  const filteredBookings = useMemo(() => {
    let result = bookings;
    if (statusFilter !== "all") {
      result = result.filter((b) => b.status === statusFilter);
    }
    // Sort by date (closest first)
    return result.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }, [bookings, statusFilter]);

  if (error) return <div className="p-8 text-red-400">Error: {error}</div>;

  // ── Define the Schedule Columns ─────────────────────────────────────────
  const columns: Column<Booking>[] = [
    {
      header: "Date",
      cell: (booking) => {
        const dateObj = new Date(booking.date);
        const isToday = new Date().toDateString() === dateObj.toDateString();
        
        return (
          <div className="flex items-center gap-3">
            <div className={`w-12 h-12 rounded-xl flex flex-col items-center justify-center border ${isToday ? 'bg-[#FF007F]/20 border-[#FF007F]/50 text-[#FF007F]' : 'bg-white/5 border-white/10 text-white'}`}>
              <span className="text-[10px] font-bold uppercase leading-none">
                {dateObj.toLocaleString('default', { month: 'short' })}
              </span>
              <span className="text-lg font-bold leading-none mt-0.5">
                {dateObj.getDate()}
              </span>
            </div>
            {isToday && <span className="text-xs font-bold text-[#FF007F]">Today</span>}
          </div>
        );
      },
    },
    {
      header: "Time",
      cell: (booking) => (
        <div className="flex items-center gap-2 text-sm font-bold text-white">
         <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" className="lucide lucide-clock preview-icon text-gray-500"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>
          {booking.time}
        </div>
      ),
    },
    {
      header: "Client",
      cell: (booking) => (
        <div className="flex items-center gap-2 text-sm text-gray-300">
          <svg xmlns="http://www.w3.org/2000/svg"  width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" className="lucide lucide-clock preview-icon text-gray-500"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>
          {booking.user?.full_name || "Unknown"}
        </div>
      ),
    },
    {
      header: "Services",
      cell: (booking) => (
        <div className="flex flex-col gap-1">
          {booking.booking_services.map((item, i) => (
            <div key={i} className="flex items-center gap-2 text-xs text-gray-400">
             <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" className="lucide lucide-scissors preview-icon text-gray-500"><circle cx="6" cy="6" r="3"/><path d="M8.12 8.12 12 12"/><path d="M20 4 8.12 15.88"/><circle cx="6" cy="18" r="3"/><path d="M14.8 14.8 20 20"/></svg>
              <span className="font-semibold text-white">{item.service?.name}</span>
              {item.design && <span className="text-gray-500">({item.design.title})</span>}
              {item.custom_image_url && <span className="text-[#FF007F]">(Custom Upload)</span>}
            </div>
          ))}
        </div>
      ),
    },
    {
      header: "Status",
      className: "md:text-right",
      cell: (booking) => (
        <span className={`inline-block px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider border ${
          booking.status === "pending" ? "bg-yellow-500/10 border-yellow-500/20 text-yellow-400" :
          booking.status === "confirmed" ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400" :
          booking.status === "completed" ? "bg-blue-500/10 border-blue-500/20 text-blue-400" :
          "bg-red-500/10 border-red-500/20 text-red-400"
        }`}>
          {booking.status}
        </span>
      ),
    },
  ];

  return (
    <div className="p-4 sm:p-8 max-w-7xl mx-auto space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" className="lucide lucide-calendar preview-icon text-[#FF007F]"><path d="M8 2v3"/><path d="M16 2v3"/><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18"/></svg> Schedule
          </h1>
          <p className="text-gray-400 text-sm mt-1">View upcoming appointments and custom booking times.</p>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-3">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-black border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-[#FF007F]"
          >
            <option value="all">All Appointments</option>
            <option value="pending">Pending</option>
            <option value="confirmed">Confirmed</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <DataTable
        data={filteredBookings}
        columns={columns}
        keyExtractor={(b) => b.id}
        isLoading={loading}
        emptyMessage="No appointments scheduled yet."
      />
    </div>
  );
}