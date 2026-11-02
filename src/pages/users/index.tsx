import { useEffect, useState } from "react";

import supabase from "../../config/supabaseClient"; // Adjust path if needed

interface UserProfile {
  id: string;
  full_name: string;
  role_id: number;
  role_name: string;
  created_at: string;
}

export default function Index() {
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-white">Manage Users</h1>
          <p className="text-gray-400 text-sm">View, edit, and manage all registered accounts.</p>
        </div>
      </div>

      {/* Table Container */}
      <div className="bg-[#1A1A1A] rounded-2xl border border-white/10 overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-black/50 text-gray-400 uppercase tracking-wider border-b border-white/10">
              <tr>
                <th className="px-6 py-4 font-semibold">Name</th>
                <th className="px-6 py-4 font-semibold">Role</th>
                <th className="px-6 py-4 font-semibold">Joined</th>
                <th className="px-6 py-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {loading ? (
                <tr>
                  <td colSpan={4} className="px-6 py-10 text-center text-gray-400">
                    Loading users...
                  </td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-10 text-center text-gray-500">
                    No users found.
                  </td>
                </tr>
              ) : (
                users.map((u) => (
                  <tr key={u.id} className="hover:bg-white/5 transition-colors">
                    
                    {/* Editable Name */}
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
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}