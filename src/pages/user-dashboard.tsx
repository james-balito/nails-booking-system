import { useAuth } from "../context/authContext";
import Sidebar from "../components/ui/sidebar";

export default function UserDashboard() {
  const { profile, user } = useAuth();
  
  // Fallbacks for Google/Email auth
  const displayName =
    profile?.full_name ||
    user?.user_metadata?.full_name ||
    user?.user_metadata?.name ||
    "Valued Client";

  const avatarUrl =
    user?.user_metadata?.avatar_url || user?.user_metadata?.picture;

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white">
      {/* 👇 The Sidebar Component */}
      <Sidebar />

      {/* 👇 Main Content Area (Padded to account for the sidebar) */}
      <main className="md:pl-64 transition-all duration-300 ease-in-out pt-20 md:pt-0">
        <div className="p-6 md:p-10 max-w-5xl mx-auto">
          
          {/* Header Section */}
          <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4">
            <div className="flex items-center gap-4">
              {avatarUrl ? (
                <img
                  src={avatarUrl}
                  alt="Profile"
                  className="w-16 h-16 rounded-full border-2 border-[#FF007F] object-cover"
                />
              ) : (
                <div className="w-16 h-16 rounded-full bg-[#FF007F]/20 flex items-center justify-center text-[#FF007F] text-2xl font-bold">
                  {displayName.charAt(0)}
                </div>
              )}
              <div>
                <h1 className="text-2xl md:text-3xl font-serif font-bold text-white">
                  Welcome back, {displayName.split(" ")[0]}!
                </h1>
                <p className="text-gray-400 text-sm md:text-base">
                  Ready for your next set?
                </p>
              </div>
            </div>
            
            <button 
              onClick={() => alert("Book New Set")}
              className="w-full md:w-auto bg-[#FF007F] text-white font-bold px-6 py-3 rounded-xl hover:bg-[#FF007F]/80 transition-colors shadow-[0_0_15px_rgba(255,0,127,0.3)]"
            >
              + Book New Set
            </button>
          </header>

          {/* Dashboard Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* Left Column: Profile & Quick Stats */}
            <div className="md:col-span-1 space-y-6">
              
              {/* Profile Card */}
              <div className="bg-[#1A1A1A] p-6 rounded-2xl border border-white/10">
                <h2 className="text-lg font-bold text-white mb-4 border-b border-white/10 pb-2">
                  My Profile
                </h2>
                <div className="space-y-3 text-sm">
                  <div>
                    <span className="text-gray-500 block">Name</span>
                    <span className="text-white font-medium">{profile?.full_name || "Not set"}</span>
                  </div>
                  <div>
                    <span className="text-gray-500 block">Email</span>
                    <span className="text-white font-medium">{user?.email}</span>
                  </div>
                  <div>
                    <span className="text-gray-500 block">Account Type</span>
                    <span className="text-[#FF007F] font-bold uppercase tracking-wider text-xs">
                      {profile?.role_name || "User"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Loyalty/Stats Card */}
              <div className="bg-gradient-to-br from-[#FF007F]/20 to-black p-6 rounded-2xl border border-[#FF007F]/30 relative overflow-hidden">
                <div className="relative z-10">
                  <h2 className="text-lg font-bold text-white mb-2">GlossX Perks</h2>
                  <p className="text-gray-300 text-sm mb-4">You are 2 bookings away from a free set!</p>
                  <div className="w-full bg-black/50 rounded-full h-2">
                    <div className="bg-[#FF007F] h-2 rounded-full" style={{ width: "60%" }}></div>
                  </div>
                </div>
              </div>

            </div>

            {/* Right Column: Upcoming Bookings */}
            <div className="md:col-span-2">
              <div className="bg-[#1A1A1A] p-6 rounded-2xl border border-white/10 h-full">
                <div className="flex justify-between items-center mb-6 border-b border-white/10 pb-4">
                  <h2 className="text-xl font-bold text-white">Upcoming Bookings</h2>
                  <span className="bg-white/10 text-xs px-3 py-1 rounded-full text-gray-300">
                    1 Confirmed
                  </span>
                </div>

                {/* Example Booking Card */}
                <div className="bg-black/50 border border-white/5 rounded-xl p-4 md:p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-xl bg-[#FF007F]/10 flex flex-col items-center justify-center text-[#FF007F] border border-[#FF007F]/20">
                      <span className="text-xs font-bold uppercase">Nov</span>
                      <span className="text-xl font-black leading-none">12</span>
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-white">Custom Chrome Set</h3>
                      <p className="text-gray-400 text-sm">2:00 PM • Almond Shape, Long</p>
                      <p className="text-[#FF007F] text-xs font-bold mt-1">Confirmed</p>
                    </div>
                  </div>
                  
                  <div className="flex gap-2 w-full md:w-auto mt-2 md:mt-0">
                    <button className="flex-1 md:flex-none px-4 py-2 border border-white/10 rounded-lg text-sm font-semibold hover:bg-white/5 transition">
                      Reschedule
                    </button>
                  </div>
                </div>

                {/* Empty State for Future Bookings */}
                <div className="mt-6 text-center py-8 border-2 border-dashed border-white/5 rounded-xl">
                  <p className="text-gray-500 text-sm">No other upcoming appointments.</p>
                </div>
              </div>
            </div>

          </div>
        </div>
      </main>
    </div>
  );
}