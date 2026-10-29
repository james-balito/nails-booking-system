import { useEffect, useState } from "react";
import { useAuth } from "../context/authContext";
import { useNavigate } from "react-router-dom";
import supabase from "../config/supabaseClient";

export default function AdminDashboard() {
  const { profile } = useAuth();
  const navigate = useNavigate();
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch all users from the database (RLS allows admins to do this)
  useEffect(() => {
    const fetchUsers = async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select(`*, roles ( name )`)
        .order("created_at", { ascending: false });

      if (!error && data) {
        setUsers(data);
      }
      setLoading(false);
    };

    fetchUsers();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white p-8">
      <div className="max-w-5xl mx-auto">
        <header className="flex justify-between items-center mb-12 border-b border-white/10 pb-6">
          <div>
            <h1 className="text-3xl font-serif font-bold text-[#FF007F]">Admin Dashboard</h1>
            <p className="text-gray-400">Welcome, Admin {profile?.full_name}.</p>
          </div>
          <button 
            onClick={handleLogout}
            className="px-6 py-2 border border-white/20 rounded-full hover:bg-white/10 transition"
          >
            Log Out
          </button>
        </header>

        <div className="bg-[#1A1A1A] rounded-2xl border border-white/10 overflow-hidden">
          <div className="p-6 border-b border-white/10">
            <h2 className="text-xl font-bold">Registered Users</h2>
          </div>
          
          {loading ? (
            <div className="p-6 text-center text-gray-400">Loading users...</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-black/50 text-gray-400 uppercase tracking-wider">
                  <tr>
                    <th className="px-6 py-4">Name</th>
                    <th className="px-6 py-4">Role</th>
                    <th className="px-6 py-4">Joined</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/10">
                  {users.map((u) => (
                    <tr key={u.id} className="hover:bg-white/5">
                      <td className="px-6 py-4">{u.full_name || "No Name"}</td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 rounded text-xs font-bold ${u.roles?.name === 'admin' ? 'bg-[#FF007F]/20 text-[#FF007F]' : 'bg-gray-500/20 text-gray-300'}`}>
                          {u.roles?.name || "user"}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-gray-400">
                        {new Date(u.created_at).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}