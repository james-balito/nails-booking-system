import { useState, useEffect, useRef } from "react";
import type { Design, DesignInput } from "../../types/design";
import {
  SHAPE_OPTIONS,
  COLOR_OPTIONS,
  DESIGN_OPTIONS,
} from "../../types/design";
import { uploadDesignImage } from "../../api/designs";

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
  onSubmit: (input: DesignInput) => Promise<Design>;
}

export default function DesignForm({
  initial,
  onSaved,
  onCancel,
  onSubmit,
}: DesignFormProps) {
  const [title, setTitle] = useState(initial?.title ?? "");
  const [slug, setSlug] = useState(initial?.slug ?? "");
  const [slugTouched, setSlugTouched] = useState(!!initial);
  const [description, setDescription] = useState(initial?.description ?? "");
  const [shape, setShape] = useState(initial?.shape ?? SHAPE_OPTIONS[0]);
  const [colors, setColors] = useState<string[]>(initial?.colors ?? []);
  const [designs, setDesigns] = useState<string[]>(initial?.designs ?? []);
  const [price, setPrice] = useState(
    initial?.price_cents != null ? (initial.price_cents / 100).toFixed(2) : ""
  );
  const [isActive, setIsActive] = useState(initial?.is_active ?? true);
  const [sortOrder, setSortOrder] = useState(initial?.sort_order ?? 0);

  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState(initial?.image_url ?? "");

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // auto-derive slug from title until user edits it
  useEffect(() => {
    if (!slugTouched && title) setSlug(slugify(title));
  }, [title, slugTouched]);

  // revoke object URL when preview changes
  useEffect(() => {
    return () => {
      if (imagePreview.startsWith("blob:")) URL.revokeObjectURL(imagePreview);
    };
  }, [imagePreview]);

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
    setter(list.includes(value) ? list.filter((v) => v !== value) : [...list, value]);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!title.trim()) return setError("Title is required.");
    if (!slug.trim()) return setError("Slug is required.");
    if (!imageFile && !imagePreview) return setError("Image is required.");
    if (colors.length === 0) return setError("Pick at least one color.");
    if (designs.length === 0) return setError("Pick at least one design style.");

    setSaving(true);
    try {
      let image_url = initial?.image_url ?? "";
      if (imageFile) {
        image_url = await uploadDesignImage(imageFile);
      }

      const input: DesignInput = {
        title: title.trim(),
        slug: slug.trim(),
        description: description.trim(),
        shape,
        colors,
        designs,
        image_url,
        price_cents: price
          ? Math.round(parseFloat(price) * 100)
          : null,
        is_active: isActive,
        sort_order: Number(sortOrder) || 0,
      };

      const saved = await onSubmit(input);
      onSaved(saved);
    } catch (err: any) {
      setError(err.message ?? "Failed to save.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="px-4 py-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-sm">
          {error}
        </div>
      )}

      {/* Image */}
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
              <span className="text-xs">JPG/PNG/WebP up to 8MB</span>
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
            const on = designs.includes(d);
            return (
              <button
                key={d}
                type="button"
                onClick={() => toggle(designs, d, setDesigns)}
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

      {/* Price / order / active */}
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
            placeholder="e.g. 75.00"
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
            Visible in gallery
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