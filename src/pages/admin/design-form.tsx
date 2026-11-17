import { useEffect, useRef, useState } from "react";
import {
  type Design,
  type DesignInput,
  createDesign,
  updateDesign,
  uploadDesignImage,
} from "../../api/designs";

const SHAPE_OPTIONS = [
  "Almond", "Square", "Coffin", "Stiletto", "Oval", "Round", "Squoval",
] as const;

const COLOR_OPTIONS = [
  "Pink", "White", "Black", "Red", "Nude", "Gold", "Chrome", "Blue",
  "Green", "Purple", "Orange", "Yellow", "Brown",
] as const;

const DESIGN_OPTIONS = [
  "French", "Ombre", "Chrome", "3D Art", "Floral", "Abstract", "Minimal",
  "Glitter", "Marble", "Animal Print",
] as const;

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

export default function DesignForm({ initial, onSaved, onCancel }: DesignFormProps) {
  // ── fields ────────────────────────────────────────────────────────────────
  const [title, setTitle] = useState(initial?.title ?? "");
  const [slug, setSlug] = useState(initial?.slug ?? "");
  const [slugTouched, setSlugTouched] = useState(!!initial);
  const [description, setDescription] = useState(initial?.description ?? "");
  const [shape, setShape] = useState<string>(initial?.shape ?? SHAPE_OPTIONS[0]);
  const [colors, setColors] = useState<string[]>(initial?.colors ?? []);
  const [designStyles, setDesignStyles] = useState<string[]>(initial?.designs ?? []);
  const [price, setPrice] = useState(
    initial?.price_cents != null ? (initial.price_cents / 100).toFixed(2) : ""
  );
  const [isActive, setIsActive] = useState(initial?.is_active ?? true);
  const [sortOrder, setSortOrder] = useState(initial?.sort_order ?? 0);

  // ── image state ───────────────────────────────────────────────────────────
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState(initial?.image_url ?? "");

  // ── ui state ──────────────────────────────────────────────────────────────
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Auto-derive slug from title until user edits it
  useEffect(() => {
    if (!slugTouched && title) setSlug(slugify(title));
  }, [title, slugTouched]);

  // Revoke blob preview on unmount / change
  useEffect(() => {
    return () => {
      if (imagePreview.startsWith("blob:")) URL.revokeObjectURL(imagePreview);
    };
  }, [imagePreview]);

  // ── helpers ───────────────────────────────────────────────────────────────
  function handleFile(file: File | null) {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setError("Please choose an image file.");
      return;
    }
    if (file.size > 8 * 1024 * 1024) {
      setError("Image must be under 8MB.");
      return;
    }
    setError(null);
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  }

  function toggle(list: string[], value: string, setter: (v: string[]) => void) {
    setter(
      list.includes(value) ? list.filter((v) => v !== value) : [...list, value]
    );
  }

  // ── submit ────────────────────────────────────────────────────────────────
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    // client-side validation
    if (!title.trim()) return setError("Title is required.");
    if (!slug.trim()) return setError("Slug is required.");
    if (!imageFile && !imagePreview) return setError("Image is required.");
    if (colors.length === 0) return setError("Pick at least one color.");
    if (designStyles.length === 0) return setError("Pick at least one design style.");

    setSaving(true);
    try {
      // 1. Upload new image if the admin picked one
      let image_url = initial?.image_url ?? "";
      if (imageFile) {
        image_url = await uploadDesignImage(imageFile);
      }

      // 2. Build payload
      const input: DesignInput = {
        title: title.trim(),
        slug: slug.trim(),
        description: description.trim(),
        shape,
        colors,
        designs: designStyles,
        image_url,
        price_cents: price ? Math.round(parseFloat(price) * 100) : null,
        is_active: isActive,
        sort_order: Number(sortOrder) || 0,
      };

      // 3. Create or update
      const saved = initial
        ? await updateDesign(initial.id, input)
        : await createDesign(input);

      onSaved(saved);
    } catch (err: any) {
      // Common causes surfaced by RLS:
      //  - "new row violates row-level security policy" → user is not admin
      //  - "duplicate key value violates unique constraint designs_slug_key" → slug taken
      const msg =
        err?.message?.includes("designs_slug_key")
          ? "That slug is already in use. Pick a different one."
          : err?.message ?? "Failed to save.";
      setError(msg);
    } finally {
      setSaving(false);
    }
  }

  // ── render ────────────────────────────────────────────────────────────────
  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="px-4 py-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-sm">
          {error}
        </div>
      )}

      {/* Image picker */}
      <div>
        <label className="block text-gray-400 text-sm font-semibold mb-2">
          Image
        </label>
        <div
          onClick={() => fileInputRef.current?.click()}
          className="relative w-full aspect-[3/4] max-w-xs rounded-2xl border-2 border-dashed border-white/15 hover:border-[#FF007F]/50 cursor-pointer overflow-hidden bg-black/40 flex items-center justify-center transition-colors"
        >
          {imagePreview ? (
            <img
              src={imagePreview}
              alt="preview"
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="text-center text-gray-500 text-sm px-4">
              Click to upload
              <br />
              <span className="text-xs">JPG / PNG / WebP · up to 8 MB</span>
            </div>
          )}
          {imagePreview && (
            <div className="absolute bottom-2 right-2 px-2 py-1 rounded bg-black/70 text-white text-xs">
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

      {/* Title + slug */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-gray-400 text-sm font-semibold mb-2">
            Title
          </label>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full bg-black border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#FF007F]"
            placeholder="Chrome French Tips"
            required
          />
        </div>
        <div>
          <label className="block text-gray-400 text-sm font-semibold mb-2">
            Slug
          </label>
          <input
            value={slug}
            onChange={(e) => {
              setSlugTouched(true);
              setSlug(slugify(e.target.value));
            }}
            className="w-full bg-black border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#FF007F] font-mono text-sm"
            placeholder="chrome-french-tips"
            required
          />
        </div>
      </div>

      {/* Description */}
      <div>
        <label className="block text-gray-400 text-sm font-semibold mb-2">
          Description
        </label>
        <textarea
          rows={3}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="w-full bg-black border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#FF007F] resize-none"
          placeholder="A minimal chrome French set on an almond shape…"
        />
      </div>

      {/* Shape */}
      <div>
        <label className="block text-gray-400 text-sm font-semibold mb-2">
          Shape
        </label>
        <select
          value={shape}
          onChange={(e) => setShape(e.target.value)}
          className="w-full bg-black border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#FF007F]"
        >
          {SHAPE_OPTIONS.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
      </div>

      {/* Colors */}
      <div>
        <label className="block text-gray-400 text-sm font-semibold mb-2">
          Colors
        </label>
        <div className="flex flex-wrap gap-2">
          {COLOR_OPTIONS.map((c) => {
            const on = colors.includes(c);
            return (
              <button
                key={c}
                type="button"
                onClick={() => toggle(colors, c, setColors)}
                className={`px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider border transition-all ${
                  on
                    ? "bg-[#FF007F]/20 border-[#FF007F] text-[#FF007F]"
                    : "bg-white/5 border-white/10 text-gray-400 hover:text-white"
                }`}
              >
                {c}
              </button>
            );
          })}
        </div>
      </div>

      {/* Design styles */}
      <div>
        <label className="block text-gray-400 text-sm font-semibold mb-2">
          Design Styles
        </label>
        <div className="flex flex-wrap gap-2">
          {DESIGN_OPTIONS.map((d) => {
            const on = designStyles.includes(d);
            return (
              <button
                key={d}
                type="button"
                onClick={() => toggle(designStyles, d, setDesignStyles)}
                className={`px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider border transition-all ${
                  on
                    ? "bg-[#FF007F]/20 border-[#FF007F] text-[#FF007F]"
                    : "bg-white/5 border-white/10 text-gray-400 hover:text-white"
                }`}
              >
                {d}
              </button>
            );
          })}
        </div>
      </div>

      {/* Price / sort / visibility */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div>
          <label className="block text-gray-400 text-sm font-semibold mb-2">
            Price (optional)
          </label>
          <input
            type="number"
            min="0"
            step="0.01"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            className="w-full bg-black border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#FF007F]"
            placeholder="75.00"
          />
        </div>
        <div>
          <label className="block text-gray-400 text-sm font-semibold mb-2">
            Sort order
          </label>
          <input
            type="number"
            value={sortOrder}
            onChange={(e) => setSortOrder(Number(e.target.value) || 0)}
            className="w-full bg-black border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#FF007F]"
          />
        </div>
        <div>
          <label className="block text-gray-400 text-sm font-semibold mb-2">
            Visible
          </label>
          <button
            type="button"
            onClick={() => setIsActive((v) => !v)}
            className={`w-full py-3 rounded-xl font-bold border transition-all ${
              isActive
                ? "bg-emerald-500/15 border-emerald-500/40 text-emerald-400"
                : "bg-red-500/10 border-red-500/30 text-red-400"
            }`}
          >
            {isActive ? "Active" : "Hidden"}
          </button>
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-3 pt-4 border-t border-white/10">
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
          className="flex-1 py-3 rounded-xl bg-[#FF007F] text-white font-bold uppercase tracking-wider hover:bg-[#ff1a8c] transition-all disabled:opacity-50"
        >
          {saving ? "Saving…" : initial ? "Save Changes" : "Create Design"}
        </button>
      </div>
    </form>
  );
}