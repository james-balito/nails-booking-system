import { useEffect, useState } from "react";
import supabase from "../../config/supabaseClient";
import { listAllBookings } from "../../api/bookings";

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

export default function AdminDashboard() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [totalUsers, setTotalUsers] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // ── HOOK 1: Fetch Bookings ───────────────────────────────────────────────
  useEffect(() => {
    listAllBookings()
      .then((data) => setBookings(data as unknown as Booking[]))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  // ── HOOK 2: Fetch Total Users ────────────────────────────────────────────
  useEffect(() => {
    const fetchStats = async () => {
      const { count } = await supabase
        .from("user_profiles")
        .select("*", { count: "exact", head: true });
      if (count) setTotalUsers(count);
    };
    fetchStats();
  }, []);

  // ── EARLY RETURNS ────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="flex h-full items-center justify-center p-8 text-gray-500">
        Loading dashboard...
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-full items-center justify-center p-8 text-red-400">
        Error: {error}
      </div>
    );
  }

  // ── RENDER ───────────────────────────────────────────────────────────────
  return (
    <div className="space-y-8 p-4 sm:p-8">
      
      {/* Header */}
      <div>
        <h1 className="text-3xl font-serif font-bold text-white">Admin Overview</h1>
        <p className="text-gray-400">Manage your studio operations.</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-[#1A1A1A] p-6 rounded-2xl border border-white/10">
          <p className="text-gray-400 text-sm font-semibold mb-1">Total Users</p>
          <h2 className="text-3xl font-bold text-white">{totalUsers}</h2>
        </div>
        <div className="bg-[#1A1A1A] p-6 rounded-2xl border border-white/10">
          <p className="text-gray-400 text-sm font-semibold mb-1">Total Bookings</p>
          <h2 className="text-3xl font-bold text-white">{bookings.length}</h2>
        </div>
      </div>

      {/* Bookings List */}
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-white">Bookings</h1>
          <p className="text-gray-400 text-sm mt-1">Manage client appointments and combos.</p>
        </div>

        <div className="space-y-4">
          {bookings.length === 0 ? (
            <div className="text-center py-20 text-gray-500 bg-[#1A1A1A]/50 rounded-2xl border border-white/5">
              No bookings found.
            </div>
          ) : (
            bookings.map((booking) => (
              <div
                key={booking.id}
                className="bg-[#1A1A1A]/50 border border-white/10 rounded-2xl p-5 sm:p-6 flex flex-col md:flex-row gap-6 hover:border-white/20 transition-colors"
              >
                {/* LEFT: Client & Date */}
                <div className="md:w-1/3 shrink-0">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-full bg-[#FF007F]/20 flex items-center justify-center text-[#FF007F] font-bold text-lg">
                      {booking.user?.full_name?.charAt(0) || "U"}
                    </div>
                    <div>
                      <p className="text-white font-bold">
                        {booking.user?.full_name || "Unknown User"}
                      </p>
                    </div>
                  </div>

                  <div className="bg-black/40 rounded-xl p-3 border border-white/5 space-y-1">
                    <p className="text-sm text-gray-300">
                      <span className="text-gray-500">Date:</span> {booking.date}
                    </p>
                    <p className="text-sm text-gray-300">
                      <span className="text-gray-500">Time:</span> {booking.time}
                    </p>
                    <div className="pt-2">
                      <span
                        className={`inline-block px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider ${
                          booking.status === "pending"
                            ? "bg-yellow-500/15 text-yellow-400"
                            : booking.status === "confirmed"
                              ? "bg-emerald-500/15 text-emerald-400"
                              : "bg-red-500/15 text-red-400"
                        }`}
                      >
                        {booking.status}
                      </span>
                    </div>
                  </div>
                </div>

                {/* RIGHT: Services Combo */}
                <div className="flex-1 border-t md:border-t-0 md:border-l border-white/10 pt-4 md:pt-0 md:pl-6">
                  <h3 className="text-white font-bold text-sm mb-3">
                    Booked Services ({booking.booking_services.length})
                  </h3>

                  <div className="space-y-3">
                    {booking.booking_services.map((item, index) => (
                      <div
                        key={item.id || index}
                        className="flex items-center gap-4 bg-white/5 p-3 rounded-lg border border-white/5"
                      >
                        {/* Service Icon / Image */}
                        {item.design?.image_url ? (
                          <img
                            src={item.design.image_url}
                            alt="Design"
                            className="w-12 h-14 object-cover rounded-md border border-white/10"
                          />
                        ) : item.custom_image_url ? (
                          <img
                            src={item.custom_image_url}
                            alt="Custom"
                            className="w-12 h-14 object-cover rounded-md border border-white/10"
                          />
                        ) : (
                          <div className="w-12 h-14 rounded-md bg-black/50 border border-white/10 flex items-center justify-center text-gray-500">
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              width="20"
                              height="20"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            >
                              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                            </svg>
                          </div>
                        )}

                        {/* Service Details */}
                        <div>
                          <p className="text-sm font-bold text-white">
                            {item.service?.name}
                          </p>
                          {item.design && (
                            <p className="text-xs text-gray-400">
                              Design: {item.design.title}
                            </p>
                          )}
                          {item.custom_image_url && (
                            <p className="text-xs text-[#FF007F]">
                              Custom Image Uploaded
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Notes */}
                  {booking.notes && (
                    <div className="mt-4 bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-3">
                      <p className="text-[10px] text-yellow-500 font-bold uppercase tracking-wider mb-1">
                        Client Notes
                      </p>
                      <p className="text-sm text-yellow-100/80">{booking.notes}</p>
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}