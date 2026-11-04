import { useAuth } from "../context/authContext";

export default function UserDashboard() {
  const { profile, user } = useAuth();

  const displayName = profile?.full_name || user?.user_metadata?.name || "Valued Client";

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-serif font-bold text-white">My Dashboard</h1>
          <p className="text-gray-400">Welcome back, {displayName}!</p>
        </div>
        <button className="bg-[#FF007F] text-white font-bold px-6 py-3 rounded-xl hover:bg-[#FF007F]/80 transition-colors shadow-lg">
          + Book New Set
        </button>
      </div>

      {/* Grid Content */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Profile Card */}
        <div className="bg-[#1A1A1A] p-6 rounded-2xl border border-white/10 md:col-span-1">
          <h2 className="text-lg font-bold text-white mb-4 border-b border-white/10 pb-2">My Profile</h2>
          <div className="space-y-4 text-sm">
            <div>
              <span className="text-gray-500 block text-xs uppercase font-bold">Name</span>
              <span className="text-white">{displayName}</span>
            </div>
            <div>
              <span className="text-gray-500 block text-xs uppercase font-bold">Email</span>
              <span className="text-white">{user?.email}</span>
            </div>
            <div>
              <span className="text-gray-500 block text-xs uppercase font-bold">Account Type</span>
              <span className="text-[#FF007F] font-bold uppercase text-xs">Client</span>
            </div>
          </div>
        </div>

        {/* Upcoming Bookings */}
        <div className="bg-[#1A1A1A] p-6 rounded-2xl border border-white/10 md:col-span-2">
          <h2 className="text-lg font-bold text-white mb-4 border-b border-white/10 pb-2">Upcoming Bookings</h2>
          <div className="text-center py-12">
            <p className="text-gray-500">You don't have any upcoming appointments.</p>
          </div>
        </div>
      </div>
    </div>
  );
}