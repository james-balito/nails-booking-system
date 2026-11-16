import { useEffect, useMemo, useState } from "react";
import type { Design, DesignInput } from "../../types/design";
import {
  listDesigns,
  createDesign,
  updateDesign,
  setDesignActive,
  hardDeleteDesign,
} from "../../api/designs";
import DesignForm from "./design-form";

type Mode = "list" | "create" | "edit";

export default function GalleryAdmin() {
  const [mode, setMode] = useState<Mode>("list");
  const [editing, setEditing] = useState<Design | null>(null);

  const [designs, setDesigns] = useState<Design[]>([]);
  const [count, setCount] = useState(0);
  const [page, setPage] = useState(0);
  const [pageSize] = useState(20);
  const [search, setSearch] = useState("");
  const [includeInactive, setIncludeInactive] = useState(true);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);

  const [confirmDelete, setConfirmDelete] = useState<Design | null>(null);

  const totalPages = Math.max(1, Math.ceil(count / pageSize));

  const reload = useMemo(
    () =>
      async () => {
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
    [includeInactive, search, page, pageSize]
  );

  useEffect(() => {
    reload();
  }, [reload]);

  // debounce search a touch
  const [searchDraft, setSearchDraft] = useState("");
  useEffect(() => {
    const t = setTimeout(() => {
      setPage(0);
      setSearch(searchDraft);
    }, 250);
    return () => clearTimeout(t);
  }, [searchDraft]);

  function startCreate() {
    setEditing(null);
    setMode("create");
  }
  function startEdit(d: Design) {
    setEditing(d);
    setMode("edit");
  }
  function backToList() {
    setEditing(null);
    setMode("list");
    reload();
  }

  async function handleToggleActive(d: Design) {
    setBusyId(d.id);
    try {
      const updated = await setDesignActive(d.id, !d.is_active);
      setDesigns((prev) => prev.map((x) => (x.id === updated.id ? updated : x)));
    } catch (e: any) {
      alert(e.message ?? "Failed to update.");
    } finally {
      setBusyId(null);
    }
  }

  async function handleDelete(d: Design) {
    setBusyId(d.id);
    try {
      await hardDeleteDesign(d.id);
      setConfirmDelete(null);
      reload();
    } catch (e: any) {
      alert(e.message ?? "Failed to delete.");
    } finally {
      setBusyId(null);
    }
  }

  if (mode !== "list") {
    return (
      <div className="min-h-screen bg-transparent text-white p-4 sm:p-8">
        <div>
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-2xl sm:text-3xl font-bold">
              {mode === "create" ? "New Design" : "Edit Design"}
            </h1>
            <button
              onClick={backToList}
              className="text-sm text-gray-400 hover:text-white transition-colors"
            >
              ← Back to list
            </button>
          </div>

          <DesignForm
            initial={editing}
            onCancel={backToList}
            onSaved={backToList}
            onSubmit={async (input: DesignInput) => {
              if (mode === "edit" && editing) {
                return updateDesign(editing.id, input);
              }
              return createDesign(input);
            }}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-transparent text-white">
      <div>
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold">Gallery</h1>
            <p className="text-gray-400 text-sm">
              Manage the design sets shown on the Welcome page.
            </p>
          </div>
          <button
            onClick={startCreate}
            className="px-5 py-3 rounded-xl bg-[#FF007F] text-white font-bold uppercase tracking-wider text-sm hover:bg-[#ff1a8c] transition-all"
          >
            + Add Design
          </button>
        </div>

        {/* Filters */}
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
              onChange={(e) => setIncludeInactive(e.target.checked)}
              className="accent-[#FF007F]"
            />
            Show hidden
          </label>
        </div>

        {/* Error */}
        {error && (
          <div className="mb-4 px-4 py-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-sm">
            {error}
          </div>
        )}

        {/* Table */}
        <div className="rounded-2xl border border-white/10 overflow-hidden">
          <div className="grid grid-cols-[80px_1fr_120px_110px_180px] bg-[#1A1A1A] text-xs uppercase tracking-wider text-gray-500 px-4 py-3">
            <div>Image</div>
            <div>Title</div>
            <div>Shape</div>
            <div>Status</div>
            <div className="text-right">Actions</div>
          </div>

          {loading ? (
            <div className="py-16 text-center text-gray-500">Loading…</div>
          ) : designs.length === 0 ? (
            <div className="py-16 text-center text-gray-500">
              No designs yet. Click <b>Add Design</b> to create one.
            </div>
          ) : (
            designs.map((d) => (
              <div
                key={d.id}
                className="grid grid-cols-[80px_1fr_120px_110px_180px] items-center px-4 py-3 border-t border-white/5 hover:bg-white/5"
              >
                <div className="w-14 h-18 rounded-lg overflow-hidden bg-black">
                  <img
                    src={d.image_url}
                    alt={d.title}
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                </div>
                <div className="min-w-0">
                  <p className="font-semibold truncate">{d.title}</p>
                  <p className="text-xs text-gray-500 font-mono truncate">
                    /{d.slug}
                  </p>
                </div>
                <div className="text-sm text-gray-400">{d.shape}</div>
                <div>
                  <span
                    className={`inline-block px-2 py-1 rounded text-[10px] font-bold uppercase ${
                      d.is_active
                        ? "bg-emerald-500/15 text-emerald-400"
                        : "bg-gray-500/15 text-gray-400"
                    }`}
                  >
                    {d.is_active ? "Active" : "Hidden"}
                  </span>
                </div>
                <div className="flex justify-end gap-2">
                  <button
                    onClick={() => startEdit(d)}
                    className="px-3 py-1.5 rounded-lg text-xs font-bold bg-white/5 hover:bg-white/10 transition-colors"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleToggleActive(d)}
                    disabled={busyId === d.id}
                    className="px-3 py-1.5 rounded-lg text-xs font-bold bg-white/5 hover:bg-white/10 transition-colors disabled:opacity-50"
                  >
                    {d.is_active ? "Hide" : "Show"}
                  </button>
                  <button
                    onClick={() => setConfirmDelete(d)}
                    disabled={busyId === d.id}
                    className="px-3 py-1.5 rounded-lg text-xs font-bold bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-colors disabled:opacity-50"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between mt-6 text-sm">
            <span className="text-gray-500">
              Page {page + 1} of {totalPages} · {count} total
            </span>
            <div className="flex gap-2">
              <button
                onClick={() => setPage((p) => Math.max(0, p - 1))}
                disabled={page === 0}
                className="px-4 py-2 rounded-lg border border-white/10 hover:bg-white/5 disabled:opacity-40"
              >
                Prev
              </button>
              <button
                onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
                disabled={page >= totalPages - 1}
                className="px-4 py-2 rounded-lg border border-white/10 hover:bg-white/5 disabled:opacity-40"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Delete confirmation */}
      {confirmDelete && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            onClick={() => setConfirmDelete(null)}
          />
          <div className="relative w-full max-w-sm bg-[#1A1A1A] border border-white/10 rounded-2xl p-6">
            <h3 className="text-lg font-bold mb-2">Delete this design?</h3>
            <p className="text-sm text-gray-400 mb-6">
              This is permanent. Existing bookings that reference this design
              will keep their design_id set to NULL.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setConfirmDelete(null)}
                className="flex-1 py-3 rounded-xl border border-white/10 font-bold hover:bg-white/5"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(confirmDelete)}
                disabled={busyId === confirmDelete.id}
                className="flex-1 py-3 rounded-xl bg-red-500 text-white font-bold hover:bg-red-600 disabled:opacity-50"
              >
                {busyId === confirmDelete.id ? "Deleting…" : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )};