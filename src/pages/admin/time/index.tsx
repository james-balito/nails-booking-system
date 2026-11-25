import { useEffect, useState } from "react";
import supabase from "../../../config/supabaseClient";

interface CustomTime {
  id: string;
  time: string;
  is_active: boolean;
}

export default function CustomTimesAdmin() {
  const [times, setTimes] = useState<CustomTime[]>([]);
  const [loading, setLoading] = useState(true);
  const [newTime, setNewTime] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchTimes();
  }, []);

  const fetchTimes = async () => {
    setLoading(true);
    const { data } = await supabase
      .from("custom_times")
      .select("*")
      .order("time", { ascending: false });

    if (data) setTimes(data);
    setLoading(false);
  };

  const handleAddTime = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTime.trim()) return;
    setIsSubmitting(true);

    const { error } = await supabase.from("custom_times").insert({
      time: newTime.trim(),
      is_active: true,
    });

    if (!error) {
      setNewTime("");
      fetchTimes();
    } else {
      alert("Error adding time: " + error.message);
    }
    setIsSubmitting(false);
  };

  const handleToggleActive = async (id: string, currentStatus: boolean) => {
    const { error } = await supabase
      .from("custom_times")
      .update({ is_active: !currentStatus })
      .eq("id", id);

    if (!error) {
      setTimes((prev) =>
        prev.map((t) => (t.id === id ? { ...t, is_active: !currentStatus } : t))
      );
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this time slot?")) return;
    const { error } = await supabase.from("custom_times").delete().eq("id", id);
    if (!error) {
      setTimes((prev) => prev.filter((t) => t.id !== id));
    }
  };

  return (
    <div className="p-4 sm:p-8 max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-white">Custom Times</h1>
        <p className="text-gray-400 text-sm mt-1">
          Manage the time slots available for client bookings.
        </p>
      </div>

      {/* Add Form */}
      <form onSubmit={handleAddTime} className="flex gap-3">
        <input
          type="text"
          placeholder="e.g., 10:00 AM"
          value={newTime}
          onChange={(e) => setNewTime(e.target.value)}
          className="flex-1 bg-black border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#FF007F]"
        />
        <button
          type="submit"
          disabled={isSubmitting}
          className="px-6 py-3 rounded-xl bg-[#FF007F] text-white font-bold hover:bg-[#ff1a8c] transition-all disabled:opacity-50"
        >
          {isSubmitting ? "Adding..." : "Add Time"}
        </button>
      </form>

      {/* List */}
      <div className="bg-[#1A1A1A] border border-white/10 rounded-2xl overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-gray-500">Loading...</div>
        ) : times.length === 0 ? (
          <div className="p-8 text-center text-gray-500">No times added yet.</div>
        ) : (
          times.map((t) => (
            <div
              key={t.id}
              className="flex items-center justify-between p-4 border-b border-white/5 hover:bg-white/5"
            >
              <div className="flex items-center gap-4">
                <span className="text-white font-bold">{t.time}</span>
                <span
                  className={`px-2 py-1 rounded text-[10px] font-bold uppercase ${
                    t.is_active
                      ? "bg-emerald-500/20 text-emerald-400"
                      : "bg-gray-500/20 text-gray-400"
                  }`}
                >
                  {t.is_active ? "Active" : "Hidden"}
                </span>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => handleToggleActive(t.id, t.is_active)}
                  className="px-3 py-1.5 rounded-lg text-xs font-bold bg-white/5 hover:bg-white/10 text-white"
                >
                  {t.is_active ? "Hide" : "Show"}
                </button>
                <button
                  onClick={() => handleDelete(t.id)}
                  className="px-3 py-1.5 rounded-lg text-xs font-bold bg-red-500/10 hover:bg-red-500/20 text-red-400"
                >
                  Delete
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}