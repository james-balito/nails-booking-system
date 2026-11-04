import { useEffect, useState } from "react";
import supabase from "../../config/supabaseClient";

export default function UsersIndex() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUsers = async () => {
      const { data } = await supabase.from("user_profiles").select("*, roles(name)");
      if (data) setUsers(data);
      setLoading(false);
    };
    fetchUsers();
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">User Management</h1>
        <p className="text-gray-400 text-sm">View and manage registered clients.</p>
      </div>

      <div className="bg-[#1A1A1A] rounded-2xl border border-white/10 overflow-hidden">
        <table className="w-full text-left text-sm whitespace-nowrap">
          <thead className="bg-black/50 text-gray-400 uppercase tracking-wider border-b border-white/10">
            <tr>
              <th className="px-6 py-4 font-semibold">Name</th>
              <th className="px-6 py-4 font-semibold">Role</th>
              <th className="px-6 py-4 font-semibold">Joined</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {loading ? (
              <tr><td colSpan={3} className="px-6 py-8 text-center text-gray-400">Loading...</td></tr>
            ) : (
              users.map((u) => (
                <tr key={u.id} className="hover:bg-white/5">
                  <td className="px-6 py-4 font-medium text-white">{u.full_name || "No Name"}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase border ${
                      u.roles?.name === "admin" ? "bg-[#FF007F]/10 text-[#FF007F] border-[#FF007F]/30" : "bg-gray-500/10 text-gray-400 border-gray-500/30"
                    }`}>
                      {u.roles?.name}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-gray-400">{new Date(u.created_at).toLocaleDateString()}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}