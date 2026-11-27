import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  listDesigns,
  setDesignActive,
  hardDeleteDesign,
} from "../../../api/designs";
import type { Design } from "../../../interfaces/interface";

export default function GalleryIndex() {
  const navigate = useNavigate();
  const [designs, setDesigns] = useState<Design[]>([]);
  const [count, setCount] = useState(0);
  const [page, setPage] = useState(0);
  const pageSize = 20;
  const [search, setSearch] = useState("");
  const [searchDraft, setSearchDraft] = useState("");
  const [includeInactive, setIncludeInactive] = useState(true);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<Design | null>(null);

  const totalPages = Math.max(1, Math.ceil(count / pageSize));

  const reload = useMemo(
    () => async () => {
      setLoading(true);
      setError(null);
      try {
        const { data, count } = await listDesigns({
          includeInactive,
          search,
          page,
          pageSize,
        });
        setDesigns(data);
        setCount(count);
      } catch (e: any) {
        setError(e.message ?? "Failed to load designs.");
      } finally {
        setLoading(false);
      }
    },
    [includeInactive, search, page, pageSize],
  );

  useEffect(() => {
    reload();
  }, [reload]);

  useEffect(() => {
    const t = setTimeout(() => {
      setPage(0);
      setSearch(searchDraft);
    }, 250);
    return () => clearTimeout(t);
  }, [searchDraft]);

  async function handleToggleActive(d: Design) {
    setBusyId(d.id);
    try {
      const updated = await setDesignActive(d.id, !d.is_active);
      setDesigns((prev) =>
        prev.map((x) => (x.id === updated.id ? updated : x)),
      );
    } catch (e: any) {
      alert(e.message ?? "Failed to update visibility.");
    } finally {
      setBusyId(null);
    }
  }

  async function handleDelete(d: Design) {
    setBusyId(d.id);
    try {
      await hardDeleteDesign(d.id);
      setConfirmDelete(null);
      if (designs.length === 1 && page > 0) setPage(page - 1);
      else reload();
    } catch (e: any) {
      alert(e.message ?? "Failed to delete design.");
    } finally {
      setBusyId(null);
    }
  }

  return (
    <div className="p-4 sm:p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold">Gallery</h1>
            <p className="text-gray-400 text-sm">
              Manage the design sets shown on the Welcome page.
            </p>
          </div>
          <button
            onClick={() => navigate("create")}
            className="px-5 py-3 rounded-xl bg-[#FF007F] text-white font-bold uppercase tracking-wider text-sm hover:bg-[#ff1a8c] transition-all"
          >
            + Add Design
          </button>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <input
            value={searchDraft}
            onChange={(e) => setSearchDraft(e.target.value)}
            placeholder="Search by title…"
            className="flex-1 bg-black border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#FF007F]"
          />
          <label className="flex items-center gap-2 px-4 py-3 rounded-xl border border-white/10 bg-black/50 text-sm text-gray-300 cursor-pointer">
            <input
              type="checkbox"
              checked={includeInactive}
              onChange={(e) => {
                setIncludeInactive(e.target.checked);
                setPage(0);
              }}
              className="accent-[#FF007F]"
            />
            Show hidden
          </label>
        </div>

        {error && (
          <div className="mb-4 px-4 py-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-sm">
            {error}
          </div>
        )}

        <div className="rounded-2xl border border-white/10 overflow-hidden">
          <div className="hidden md:grid grid-cols-[80px_1fr_120px_110px_180px] bg-[#1A1A1A] text-xs uppercase tracking-wider text-gray-500 px-4 py-3">
            <div>Image</div>
            <div>Title</div>
            <div>Shape</div>
            <div>Status</div>
            <div className="text-right">Actions</div>
          </div>

          {loading ? (
            <div className="py-20 text-center text-gray-500">
              Loading designs...
            </div>
          ) : designs.length === 0 ? (
            <div className="py-20 text-center text-gray-500">
              No designs found.
            </div>
          ) : (
            designs.map((d) => (
              <div
                key={d.id}
                className="grid grid-cols-1 md:grid-cols-[80px_1fr_120px_110px_180px] items-center gap-4 md:gap-0 px-4 py-4 md:py-3 border-t border-white/5 hover:bg-white/5 transition-colors"
              >
                <div className="w-16 h-20 md:w-14 md:h-18 rounded-lg overflow-hidden bg-black shrink-0">
                  <img
                    src={d.image_url}
                    alt={d.title}
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                </div>
                <div className="min-w-0 md:pr-4">
                  <p className="font-semibold text-white truncate">{d.title}</p>
                  <p className="text-xs text-gray-500 font-mono truncate">
                    /{d.slug}
                  </p>
                </div>
                <div className="text-sm text-gray-400 truncate">{d.shape}</div>
                <div>
                  <span
                    className={`inline-block px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider ${d.is_active ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/20" : "bg-gray-500/15 text-gray-400 border border-gray-500/20"}`}
                  >
                    {d.is_active ? "Active" : "Hidden"}
                  </span>
                </div>
                <div className="flex md:justify-end gap-2 items-center">
                  <button
                    onClick={() => navigate(`${d.id}/edit`)}
                    className="px-3 py-2 rounded-lg text-xs font-bold bg-white/5 hover:bg-white/10 text-white transition-colors"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleToggleActive(d)}
                    disabled={busyId === d.id}
                    className="px-3 py-2 rounded-lg text-xs font-bold bg-white/5 hover:bg-white/10 text-white transition-colors disabled:opacity-50"
                  >
                    {d.is_active ? "Hide" : "Show"}
                  </button>
                  <button
                    onClick={() => setConfirmDelete(d)}
                    disabled={busyId === d.id}
                    className="px-3 py-2 rounded-lg text-xs font-bold bg-red-500/10 hover:bg-red-500/20 text-red-400 transition-colors disabled:opacity-50"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {totalPages > 1 && (
          <div className="flex items-center justify-between mt-6 text-sm">
            <span className="text-gray-500">
              Page {page + 1} of {totalPages} · {count} total
            </span>
            <div className="flex gap-2">
              <button
                onClick={() => setPage((p) => Math.max(0, p - 1))}
                disabled={page === 0}
                className="px-4 py-2 rounded-lg border border-white/10 hover:bg-white/5 disabled:opacity-40 transition-colors"
              >
                Prev
              </button>
              <button
                onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
                disabled={page >= totalPages - 1}
                className="px-4 py-2 rounded-lg border border-white/10 hover:bg-white/5 disabled:opacity-40 transition-colors"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {confirmDelete && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            onClick={() => setConfirmDelete(null)}
          />
          <div className="relative w-full max-w-sm bg-[#1A1A1A] border border-white/10 rounded-2xl p-6 shadow-2xl animate-in zoom-in-95 duration-200">
            <h3 className="text-xl font-bold text-white mb-2">
              Delete this design?
            </h3>
            <p className="text-sm text-gray-400 mb-6">
              This action is permanent. Existing bookings will keep their
              record, but the design link will be removed.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setConfirmDelete(null)}
                className="flex-1 py-3 rounded-xl border border-white/10 text-white font-bold hover:bg-white/5 transition-all"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(confirmDelete)}
                disabled={busyId === confirmDelete.id}
                className="flex-1 py-3 rounded-xl bg-red-500 text-white font-bold hover:bg-red-600 transition-all disabled:opacity-50"
              >
                {busyId === confirmDelete.id ? "Deleting…" : "Yes, Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
