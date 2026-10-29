import { useAuth } from "../context/authContext";
import { useNavigate } from "react-router-dom";
import supabase from "../config/supabaseClient";

export default function UserDashboard() {
  const { profile, user } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white p-8">
      <div className="max-w-4xl mx-auto">
        <header className="flex justify-between items-center mb-12 border-b border-white/10 pb-6">
          <div>
            <h1 className="text-3xl font-serif font-bold text-[#FF007F]">My Dashboard</h1>
            <p className="text-gray-400">Welcome back, {profile?.full_name || "Client"}!</p>
          </div>
          <button 
            onClick={handleLogout}
            className="px-6 py-2 border border-white/20 rounded-full hover:bg-white/10 transition"
          >
            Log Out
          </button>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-[#1A1A1A] p-6 rounded-2xl border border-white/10">
            <h2 className="text-xl font-bold mb-4">Your Profile</h2>
            <p className="text-gray-400 mb-2"><strong className="text-white">Name:</strong> {profile?.full_name}</p>
            <p className="text-gray-400 mb-2"><strong className="text-white">Email:</strong> {user?.email}</p>
            <p className="text-gray-400"><strong className="text-white">Role:</strong> {profile?.roles?.name}</p>
          </div>

          <div className="bg-[#1A1A1A] p-6 rounded-2xl border border-white/10">
            <h2 className="text-xl font-bold mb-4">Upcoming Bookings</h2>
            <p className="text-gray-400 text-sm">You have no upcoming appointments.</p>
            <button className="mt-4 w-full bg-[#FF007F] py-2 rounded-lg font-bold hover:bg-[#FF007F]/80 transition">
              Book a Nail Set
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}