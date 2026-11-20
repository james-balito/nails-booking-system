import { useEffect, useRef, useState, useMemo } from "react";
import {
  type Design,
  type DesignInput,
  createDesign,
  updateDesign,
  uploadDesignImage,
  fetchDesignCategories,
} from "../../../../api/designs";

// ── Default fallbacks ────────────────────────────────────────────────────────
const DEFAULT_SHAPES = [
  "Almond",
  "Square",
  "Coffin",
  "Stiletto",
  "Oval",
  "Round",
  "Squoval",
];
const DEFAULT_COLORS = [
  "Pink",
  "White",
  "Black",
  "Red",
  "Nude",
  "Gold",
  "Chrome",
  "Blue",
  "Green",
  "Purple",
];
const DEFAULT_DESIGNS = [
  "French",
  "Ombre",
  "Chrome",
  "3D Art",
  "Floral",
  "Abstract",
  "Minimal",
  "Glitter",
  "Marble",
];

const LENGTH_OPTIONS = ["Short", "Medium", "Long", "Extra Long"] as const;

function slugify(s: string) {
  return s
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

interface DesignFormProps {
  initial?: Design | null;
  onSaved: (design: Design) => void;
  onCancel: () => void;
}

export default function DesignForm({
  initial,
  onSaved,
  onCancel,
}: DesignFormProps) {
  // ── Dynamic Categories ────────────────────────────────────────────────────
  const [activeShapes, setActiveShapes] = useState<string[]>(DEFAULT_SHAPES);
  const [activeColors, setActiveColors] = useState<string[]>(DEFAULT_COLORS);
  const [activeDesigns, setActiveDesigns] = useState<string[]>(DEFAULT_DESIGNS);

  // ── Form Fields ───────────────────────────────────────────────────────────
  const [title, setTitle] = useState(initial?.title ?? "");
  const [slug, setSlug] = useState(initial?.slug ?? "");
  const [slugTouched, setSlugTouched] = useState(!!initial);
  const [description, setDescription] = useState(initial?.description ?? "");

  const initialLength =
    LENGTH_OPTIONS.find((l) => initial?.shape.startsWith(l)) ?? "Medium";
  const initialShape =
    initial?.shape.replace(`${initialLength} `, "") ?? DEFAULT_SHAPES[0];

  const [length, setLength] = useState<string>(initialLength);
  const [shape, setShape] = useState<string>(initialShape);

  const [colors, setColors] = useState<string[]>(initial?.colors ?? []);
  const [designStyles, setDesignStyles] = useState<string[]>(
    initial?.designs ?? [],
  );

  const [price, setPrice] = useState(
    initial?.price_cents != null ? (initial.price_cents / 100).toFixed(2) : "",
  );
  const [isActive, setIsActive] = useState(initial?.is_active ?? true);
  const [sortOrder, setSortOrder] = useState(initial?.sort_order ?? 0);

  // ── Image State ───────────────────────────────────────────────────────────
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState(initial?.image_url ?? "");

  // ── UI State ──────────────────────────────────────────────────────────────
  const [saving, setSaving] = useState(false);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Search/Expand state for the categories
  const [colorSearch, setColorSearch] = useState("");
  const [showAllColors, setShowAllColors] = useState(false);

  const [designSearch, setDesignSearch] = useState("");
  const [showAllDesigns, setShowAllDesigns] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Fetch Categories from DB
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const dbCategories = await fetchDesignCategories();
        if (cancelled) return;
        setActiveShapes(
          Array.from(
            new Set([...DEFAULT_SHAPES, ...dbCategories.shapes]),
          ).sort(),
        );
        setActiveColors(
          Array.from(
            new Set([...DEFAULT_COLORS, ...dbCategories.colors]),
          ).sort(),
        );
        setActiveDesigns(
          Array.from(
            new Set([...DEFAULT_DESIGNS, ...dbCategories.designs]),
          ).sort(),
        );
      } catch (err) {
        console.error("Failed to load categories from DB, using defaults.");
      } finally {
        if (!cancelled) setLoadingCategories(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!slugTouched && title) setSlug(slugify(title));
  }, [title, slugTouched]);

  useEffect(() => {
    return () => {
      if (imagePreview.startsWith("blob:")) URL.revokeObjectURL(imagePreview);
    };
  }, [imagePreview]);

  function handleFile(file: File | null) {
    if (!file) return;
    if (!file.type.startsWith("image/"))
      return setError("Please choose an image file.");
    if (file.size > 8 * 1024 * 1024)
      return setError("Image must be under 8MB.");
    setError(null);
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  }

  function toggle(
    list: string[],
    value: string,
    setter: (v: string[]) => void,
  ) {
    setter(
      list.includes(value) ? list.filter((v) => v !== value) : [...list, value],
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!title.trim()) return setError("Title is required.");
    if (!slug.trim()) return setError("Slug is required.");
    if (!imageFile && !imagePreview) return setError("Image is required.");
    if (colors.length === 0) return setError("Pick at least one color.");
    if (designStyles.length === 0)
      return setError("Pick at least one design style.");

    setSaving(true);
    try {
      let image_url = initial?.image_url ?? "";
      if (imageFile) image_url = await uploadDesignImage(imageFile);

      const combinedShape = `${length} ${shape}`;

      const input: DesignInput = {
        title: title.trim(),
        slug: slug.trim(),
        description: description.trim(),
        shape: combinedShape,
        colors,
        designs: designStyles,
        image_url,
        price_cents: price ? Math.round(parseFloat(price) * 100) : null,
        is_active: isActive,
        sort_order: Number(sortOrder) || 0,
      };

      const saved = initial
        ? await updateDesign(initial.id, input)
        : await createDesign(input);
      onSaved(saved);
    } catch (err: any) {
      const msg = err?.message?.includes("designs_slug_key")
        ? "That slug is already in use. Pick a different one."
        : (err?.message ?? "Failed to save.");
      setError(msg);
    } finally {
      setSaving(false);
    }
  }

  // Filter logic for the multi-select groups
  const filteredColors = useMemo(() => {
    let list = activeColors.filter((c) =>
      c.toLowerCase().includes(colorSearch.toLowerCase()),
    );

    // 1. Sort selected colors to the front
    list.sort((a, b) => {
      const aSelected = colors.includes(a) ? 1 : 0;
      const bSelected = colors.includes(b) ? 1 : 0;
      return bSelected - aSelected;
    });

    // 2. If not searching and not showing all, only slice the first 6
    if (!showAllColors && !colorSearch) list = list.slice(0, 6);

    return list;
  }, [activeColors, colorSearch, showAllColors, colors]);

  const filteredDesigns = useMemo(() => {
    let list = activeDesigns.filter((d) =>
      d.toLowerCase().includes(designSearch.toLowerCase()),
    );

    // 1. Sort selected designs to the front
    list.sort((a, b) => {
      const aSelected = designStyles.includes(a) ? 1 : 0;
      const bSelected = designStyles.includes(b) ? 1 : 0;
      return bSelected - aSelected;
    });

    // 2. If not searching and not showing all, only slice the first 6
    if (!showAllDesigns && !designSearch) list = list.slice(0, 6);

    return list;
  }, [activeDesigns, designSearch, showAllDesigns, designStyles]);

  return (
    <form onSubmit={handleSubmit} className="space-y-8 max-w-2xl mx-auto">
      {error && (
        <div className="px-4 py-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-sm">
          {error}
        </div>
      )}

      {/* --- 1. IMAGE & BASIC INFO --- */}
      <div className="bg-[#1A1A1A]/50 border border-white/5 rounded-2xl p-5 sm:p-6 space-y-6">
        <h3 className="text-white font-bold text-lg border-b border-white/10 pb-2">
          Basic Info
        </h3>

        <div className="flex flex-col sm:flex-row gap-6">
          {/* Image */}
          <div className="shrink-0">
            <label className="block text-gray-400 text-sm font-semibold mb-2">
              Image
            </label>
            <div
              onClick={() => fileInputRef.current?.click()}
              className="relative w-32 h-40 rounded-xl border-2 border-dashed border-white/15 hover:border-[#FF007F]/50 cursor-pointer overflow-hidden bg-black/40 flex items-center justify-center transition-colors"
            >
              {imagePreview ? (
                <img
                  src={imagePreview}
                  alt="preview"
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="text-center text-gray-500 text-[10px] px-2 leading-tight">
                  Click to upload
                </div>
              )}
              {imagePreview && (
                <div className="absolute bottom-0 inset-x-0 py-1 bg-black/70 text-white text-[10px] text-center">
                  Change
                </div>
              )}
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => handleFile(e.target.files?.[0] ?? null)}
            />
          </div>

          {/* Title & Slug & Desc */}
          <div className="flex-1 space-y-4">
            <div>
              <label className="block text-gray-400 text-sm font-semibold mb-1">
                Title
              </label>
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full bg-black/50 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-[#FF007F]"
                placeholder="Chrome French Tips"
                required
              />
            </div>
            <div>
              <label className="block text-gray-400 text-sm font-semibold mb-1">
                Slug
              </label>
              <input
                value={slug}
                onChange={(e) => {
                  setSlugTouched(true);
                  setSlug(slugify(e.target.value));
                }}
                className="w-full bg-black/50 border border-white/10 rounded-lg px-3 py-2 text-sm text-gray-400 font-mono focus:outline-none focus:border-[#FF007F]"
                placeholder="chrome-french-tips"
                required
              />
            </div>
          </div>
        </div>

        <div>
          <label className="block text-gray-400 text-sm font-semibold mb-1">
            Description
          </label>
          <textarea
            rows={2}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full bg-black/50 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-[#FF007F] resize-none"
            placeholder="A minimal chrome French set..."
          />
        </div>
      </div>

      {/* --- 2. CATEGORIES --- */}
      <div className="bg-[#1A1A1A]/50 border border-white/5 rounded-2xl p-5 sm:p-6 space-y-8">
        <h3 className="text-white font-bold text-lg border-b border-white/10 pb-2">
          Categories
        </h3>

        {loadingCategories ? (
          <div> loading... </div>
        ) : (
          <>
            {/* Shape & Length (Grid) */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-gray-400 text-sm font-semibold mb-2">
                  Nail Shape
                </label>
                <select
                  value={shape}
                  onChange={(e) => setShape(e.target.value)}
                  className="w-full bg-black/50 border border-white/10 rounded-lg px-3 py-2.5 text-sm text-white focus:outline-none focus:border-[#FF007F]"
                >
                  {activeShapes.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-gray-400 text-sm font-semibold mb-2">
                  Nail Length
                </label>
                <select
                  value={length}
                  onChange={(e) => setLength(e.target.value)}
                  className="w-full bg-black/50 border border-white/10 rounded-lg px-3 py-2.5 text-sm text-white focus:outline-none focus:border-[#FF007F]"
                >
                  {LENGTH_OPTIONS.map((l) => (
                    <option key={l} value={l}>
                      {l}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Colors Multi-Select */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-gray-400 text-sm font-semibold">
                  Colors
                </label>
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search colors..."
                    value={colorSearch}
                    onChange={(e) => setColorSearch(e.target.value)}
                    className="bg-transparent border-b border-white/20 text-xs text-white placeholder-gray-600 px-1 py-0.5 focus:outline-none focus:border-[#FF007F] w-32"
                  />
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                {filteredColors.map((c) => {
                  const on = colors.includes(c);
                  return (
                    <button
                      key={c}
                      type="button"
                      onClick={() => toggle(colors, c, setColors)}
                      className={`px-3 py-1.5 rounded-md text-xs font-semibold border transition-all ${on ? "bg-[#FF007F] border-[#FF007F] text-white" : "bg-white/5 border-white/10 text-gray-400 hover:text-white"}`}
                    >
                      {c}
                    </button>
                  );
                })}
                {activeColors.length > 6 && !colorSearch && (
                  <button
                    type="button"
                    onClick={() => setShowAllColors(!showAllColors)}
                    className="px-3 py-1.5 rounded-md text-xs font-semibold text-[#FF007F] hover:bg-[#FF007F]/10 transition-colors"
                  >
                    {showAllColors ? "- Show Less" : "+ More"}
                  </button>
                )}
              </div>
            </div>

            {/* Designs Multi-Select */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-gray-400 text-sm font-semibold">
                  Design Styles
                </label>
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search styles..."
                    value={designSearch}
                    onChange={(e) => setDesignSearch(e.target.value)}
                    className="bg-transparent border-b border-white/20 text-xs text-white placeholder-gray-600 px-1 py-0.5 focus:outline-none focus:border-[#FF007F] w-32"
                  />
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                {filteredDesigns.map((d) => {
                  const on = designStyles.includes(d);
                  return (
                    <button
                      key={d}
                      type="button"
                      onClick={() => toggle(designStyles, d, setDesignStyles)}
                      className={`px-3 py-1.5 rounded-md text-xs font-semibold border transition-all ${on ? "bg-[#FF007F] border-[#FF007F] text-white" : "bg-white/5 border-white/10 text-gray-400 hover:text-white"}`}
                    >
                      {d}
                    </button>
                  );
                })}
                {activeDesigns.length > 6 && !designSearch && (
                  <button
                    type="button"
                    onClick={() => setShowAllDesigns(!showAllDesigns)}
                    className="px-3 py-1.5 rounded-md text-xs font-semibold text-[#FF007F] hover:bg-[#FF007F]/10 transition-colors"
                  >
                    {showAllDesigns ? "- Show Less" : "+ More"}
                  </button>
                )}
              </div>
            </div>
          </>
        )}
      </div>

      {/* --- 3. SETTINGS --- */}
      <div className="bg-[#1A1A1A]/50 border border-white/5 rounded-2xl p-5 sm:p-6 grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div>
          <label className="block text-gray-400 text-sm font-semibold mb-1">
            Price (optional)
          </label>
          <input
            type="number"
            min="0"
            step="0.01"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            className="w-full bg-black/50 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-[#FF007F]"
            placeholder="75.00"
          />
        </div>
        <div>
          <label className="block text-gray-400 text-sm font-semibold mb-1">
            Sort Order
          </label>
          <input
            type="number"
            value={sortOrder}
            onChange={(e) => setSortOrder(Number(e.target.value) || 0)}
            className="w-full bg-black/50 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-[#FF007F]"
          />
        </div>
        <div>
          <label className="block text-gray-400 text-sm font-semibold mb-1">
            Visibility
          </label>
          <button
            type="button"
            onClick={() => setIsActive((v) => !v)}
            className={`w-full py-2 rounded-lg text-sm font-bold border transition-all ${isActive ? "bg-emerald-500/15 border-emerald-500/40 text-emerald-400" : "bg-red-500/10 border-red-500/30 text-red-400"}`}
          >
            {isActive ? "Active (Visible)" : "Hidden"}
          </button>
        </div>
      </div>

      {/* --- 4. ACTIONS --- */}
      <div className="flex gap-3 pt-2">
        <button
          type="button"
          onClick={onCancel}
          disabled={saving}
          className="flex-1 py-3 rounded-xl border border-white/10 text-white font-bold hover:bg-white/5 transition-all disabled:opacity-50"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={saving}
          className="flex-1 py-3 rounded-xl bg-[#FF007F] text-white font-bold uppercase tracking-wider hover:bg-[#ff1a8c] transition-all disabled:opacity-50 shadow-[0_0_20px_rgba(255,0,127,0.2)]"
        >
          {saving ? "Saving…" : initial ? "Save Changes" : "Create Design"}
        </button>
      </div>
    </form>
  );
}
