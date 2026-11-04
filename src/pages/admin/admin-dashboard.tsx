import { useEffect, useState } from "react";
import supabase from "../../config/supabaseClient";

export default function AdminDashboard() {
  const [totalUsers, setTotalUsers] = useState(0);

  useEffect(() => {
    const fetchStats = async () => {
      const { count } = await supabase
        .from("user_profiles")
        .select("*", { count: "exact", head: true });
      if (count) setTotalUsers(count);
    };
    fetchStats();
  }, []);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-serif font-bold text-white">Admin Overview</h1>
        <p className="text-gray-400">Manage your studio operations.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-[#1A1A1A] p-6 rounded-2xl border border-white/10">
          <p className="text-gray-400 text-sm font-semibold mb-1">Total Users</p>
          <h2 className="text-3xl font-bold text-white">{totalUsers}</h2>
        </div>
        <div className="bg-[#1A1A1A] p-6 rounded-2xl border border-white/10">
          <p className="text-gray-400 text-sm font-semibold mb-1">Total Bookings</p>
          <h2 className="text-3xl font-bold text-white">0</h2>
        </div>
      </div>
    </div>
  );
}