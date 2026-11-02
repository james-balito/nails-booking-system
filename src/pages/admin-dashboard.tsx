import { useEffect, useState } from "react";
import { useAuth } from "../context/authContext";
import supabase from "../config/supabaseClient";

interface UserProfile {
  id: string;
  full_name: string;
  role_id: number;
  role_name: string;
  created_at: string;
}

export default function AdminDashboard() {
  const { profile } = useAuth();
  
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);

  // Editing states
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");

  const fetchAllUsers = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("user_profiles")
      .select("*, roles ( name )")
      .order("created_at", { ascending: false });

    if (!error && data) {
      const formattedUsers = data.map((u: any) => ({
        ...u,
        role_name: u.roles?.name || "user",
      }));
      setUsers(formattedUsers);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchAllUsers();
  }, []);

  const handleUpdateName = async (userId: string) => {
    if (!editName.trim()) return;

    const { error } = await supabase
      .from("user_profiles")
      .update({ full_name: editName })
      .eq("id", userId);

    if (error) {
      alert("Error updating name: " + error.message);
    } else {
      setEditingId(null);
      setEditName("");
      fetchAllUsers();
    }
  };

  // Quick Stats calculations
  const totalUsers = users.length;
  const totalAdmins = users.filter(u => u.role_name === "admin").length;
  const totalClients = users.filter(u => u.role_name === "user").length;

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white">

      {/* 👇 Main Content Area */}
      <main className="md:pl-64 transition-all duration-300 ease-in-out pt-20 md:pt-0">
        <div className="p-6 md:p-10 max-w-6xl mx-auto">
          
          {/* Header */}
          <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4 border-b border-white/10 pb-6">
            <div>
              <h1 className="text-2xl md:text-3xl font-serif font-bold text-[#FF007F]">
                Admin Overview
              </h1>
              <p className="text-gray-400 text-sm md:text-base">
                Welcome back, Admin {profile?.full_name}!
              </p>
            </div>
          </header>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
            <div className="bg-[#1A1A1A] p-6 rounded-2xl border border-white/10 flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm font-semibold mb-1">Total Users</p>
                <h2 className="text-3xl font-bold text-white">{totalUsers}</h2>
              </div>
              <div className="w-12 h-12 rounded-full bg-blue-500/10 text-blue-400 flex items-center justify-center text-2xl">👥</div>
            </div>

            <div className="bg-[#1A1A1A] p-6 rounded-2xl border border-white/10 flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm font-semibold mb-1">Admins</p>
                <h2 className="text-3xl font-bold text-white">{totalAdmins}</h2>
              </div>
              <div className="w-12 h-12 rounded-full bg-[#FF007F]/10 text-[#FF007F] flex items-center justify-center text-2xl">👑</div>
            </div>

            <div className="bg-[#1A1A1A] p-6 rounded-2xl border border-white/10 flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm font-semibold mb-1">Clients</p>
                <h2 className="text-3xl font-bold text-white">{totalClients}</h2>
              </div>
              <div className="w-12 h-12 rounded-full bg-green-500/10 text-green-400 flex items-center justify-center text-2xl">💅</div>
            </div>
          </div>

          {/* User Management Table */}
          <div className="bg-[#1A1A1A] rounded-2xl border border-white/10 overflow-hidden">
            <div className="p-6 border-b border-white/10 flex justify-between items-center">
              <h2 className="text-xl font-bold">User Management</h2>
              <span className="bg-[#FF007F]/20 text-[#FF007F] px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
                {totalUsers} Total
              </span>
            </div>

            {loading ? (
              <div className="p-10 text-center text-gray-400">Loading database...</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm whitespace-nowrap">
                  <thead className="bg-black/50 text-gray-400 uppercase tracking-wider">
                    <tr>
                      <th className="px-6 py-4 font-semibold">Name</th>
                      <th className="px-6 py-4 font-semibold">Role</th>
                      <th className="px-6 py-4 font-semibold">Joined</th>
                      <th className="px-6 py-4 font-semibold text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {users.map((u) => (
                      <tr key={u.id} className="hover:bg-white/5 transition-colors">
                        
                        {/* Name (Editable) */}
                        <td className="px-6 py-4 font-medium text-white">
                          {editingId === u.id ? (
                            <div className="flex items-center gap-2">
                              <input
                                type="text"
                                value={editName}
                                onChange={(e) => setEditName(e.target.value)}
                                className="bg-black border border-[#FF007F] rounded-md px-3 py-1.5 text-sm text-white focus:outline-none w-full max-w-[200px]"
                                autoFocus
                              />
                              <button
                                onClick={() => handleUpdateName(u.id)}
                                className="text-green-400 hover:text-green-300 text-xs font-bold uppercase"
                              >
                                Save
                              </button>
                              <button
                                onClick={() => setEditingId(null)}
                                className="text-gray-400 hover:text-white text-xs font-bold uppercase"
                              >
                                Cancel
                              </button>
                            </div>
                          ) : (
                            u.full_name || "No Name"
                          )}
                        </td>

                        {/* Role Badge */}
                        <td className="px-6 py-4">
                          <span
                            className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${
                              u.role_name === "admin"
                                ? "bg-[#FF007F]/10 text-[#FF007F] border-[#FF007F]/30"
                                : "bg-gray-500/10 text-gray-400 border-gray-500/30"
                            }`}
                          >
                            {u.role_name}
                          </span>
                        </td>

                        {/* Joined Date */}
                        <td className="px-6 py-4 text-gray-400">
                          {new Date(u.created_at).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          })}
                        </td>

                        {/* Actions */}
                        <td className="px-6 py-4 text-right">
                          {editingId !== u.id && (
                            <button
                              onClick={() => {
                                setEditingId(u.id);
                                setEditName(u.full_name || "");
                              }}
                              className="text-gray-400 hover:text-white text-sm font-semibold transition-colors"
                            >
                              Edit Name
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}

                    {users.length === 0 && (
                      <tr>
                        <td colSpan={4} className="px-6 py-12 text-center text-gray-500">
                          No users found in the database.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}