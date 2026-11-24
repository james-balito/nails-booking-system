import { useEffect, useState, useMemo } from "react";
import { useAuth } from "../context/authContext";
import { listUserBookings } from "../api/bookings";

interface UserBooking {
  id: string;
  date: string;
  time: string;
  status: string;
  notes: string;
  created_at: string;
  booking_services: {
    id: string;
    custom_image_url: string | null;
    service: { name: string } | null;
    design: { title: string; image_url: string } | null;
  }[];
}

export default function UserDashboard() {
  const { user } = useAuth();
  const [bookings, setBookings] = useState<UserBooking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;
    
    listUserBookings(user.id)
      .then((data) => setBookings(data as unknown as UserBooking[]))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [user]);

  // Separate bookings into Upcoming and Past based on date
  const { upcoming, past } = useMemo(() => {
    const today = new Date().toISOString().split("T")[0];
    return {
      upcoming: bookings.filter((b) => b.date >= today && b.status !== "cancelled"),
      past: bookings.filter((b) => b.date < today || b.status === "cancelled"),
    };
  }, [bookings]);

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center text-gray-500">
        Loading your appointments...
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8 text-center text-red-400">
        Error loading your bookings: {error}
      </div>
    );
  }

  return (
    <div className="space-y-10 max-w-4xl mx-auto py-8 px-4">
      
      {/* Header */}
      <div>
        <h1 className="text-3xl font-serif font-bold text-white">
          Welcome back, {user?.user_metadata?.full_name?.split(" ")[0] || "Beautiful"}
        </h1>
        <p className="text-gray-400 mt-1">
          Here you can view and manage your upcoming appointments.
        </p>
      </div>

      {/* Upcoming Appointments */}
      <div>
        <h2 className="text-xl font-bold text-white mb-4">Upcoming Appointments</h2>
        
        {upcoming.length === 0 ? (
          <div className="text-center py-12 bg-[#1A1A1A]/50 rounded-2xl border border-white/5">
            <p className="text-gray-400">You have no upcoming appointments.</p>
            <a href="/" className="inline-block mt-4 text-[#FF007F] font-bold hover:underline">
              Book a new set →
            </a>
          </div>
        ) : (
          <div className="space-y-4">
            {upcoming.map((booking) => (
              <UserBookingCard key={booking.id} booking={booking} />
            ))}
          </div>
        )}
      </div>

      {/* Past Appointments */}
      {past.length > 0 && (
        <div>
          <h2 className="text-xl font-bold text-white mb-4">Past Appointments</h2>
          <div className="space-y-4">
            {past.map((booking) => (
              <UserBookingCard key={booking.id} booking={booking} isPast />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ── Sub-Component: The Booking Card ────────────────────────────────────────
function UserBookingCard({ booking, isPast = false }: { booking: UserBooking; isPast?: boolean }) {
  return (
    <div className={`bg-[#1A1A1A]/50 border border-white/10 rounded-2xl p-5 flex flex-col md:flex-row gap-6 ${isPast ? "opacity-60" : ""}`}>
      
      {/* Left: Date & Status */}
      <div className="md:w-1/3 shrink-0 flex flex-col justify-center">
        <div className="bg-black/40 rounded-xl p-4 border border-white/5">
          <p className="text-lg font-bold text-white">{booking.date}</p>
          <p className="text-sm text-gray-400 mb-3">{booking.time}</p>
          
          <span className={`inline-block px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider ${
            booking.status === "pending" ? "bg-yellow-500/15 text-yellow-400" :
            booking.status === "confirmed" ? "bg-emerald-500/15 text-emerald-400" :
            booking.status === "completed" ? "bg-blue-500/15 text-blue-400" :
            "bg-red-500/15 text-red-400"
          }`}>
            {booking.status}
          </span>
        </div>
      </div>

      {/* Right: Services & Notes */}
      <div className="flex-1 border-t md:border-t-0 md:border-l border-white/10 pt-4 md:pt-0 md:pl-6">
        <h3 className="text-white font-bold text-sm mb-3">Booked Services</h3>
        
        <div className="space-y-3">
          {booking.booking_services.map((item, i) => (
            <div key={i} className="flex items-center gap-4 bg-white/5 p-3 rounded-lg border border-white/5">
              {item.design?.image_url ? (
                <img src={item.design.image_url} alt="Design" className="w-12 h-14 object-cover rounded-md" />
              ) : item.custom_image_url ? (
                <img src={item.custom_image_url} alt="Custom" className="w-12 h-14 object-cover rounded-md" />
              ) : (
                <div className="w-12 h-14 rounded-md bg-black/50 border border-white/10 flex items-center justify-center text-gray-500">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
                </div>
              )}
              <div>
                <p className="text-sm font-bold text-white">{item.service?.name}</p>
                {item.design && <p className="text-xs text-gray-400">Design: {item.design.title}</p>}
                {item.custom_image_url && <p className="text-xs text-[#FF007F]">Custom Image Uploaded</p>}
              </div>
            </div>
          ))}
        </div>

        {booking.notes && (
          <div className="mt-4 bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-3">
            <p className="text-[10px] text-yellow-500 font-bold uppercase tracking-wider mb-1">Your Notes</p>
            <p className="text-sm text-yellow-100/80">{booking.notes}</p>
          </div>
        )}
      </div>
    </div>
  );
}