import supabase from "../config/supabaseClient";

const BUCKET = "designs";

export interface Design {
  id: string;
  slug: string;
  title: string;
  description: string;
  shape: string;
  colors: string[];
  designs: string[];
  image_url: string;
  price_cents: number | null;
  is_active: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export type DesignInput = {
  slug: string;
  title: string;
  description: string;
  shape: string;
  colors: string[];
  designs: string[];
  image_url: string;
  price_cents?: number | null;
  is_active?: boolean;
  sort_order?: number;
};

// ── Read ─────────────────────────────────────────────────────────────────────
export async function listDesigns(opts: {
  includeInactive?: boolean;
  search?: string;
  page?: number;
  pageSize?: number;
} = {}) {
  const { includeInactive = false, search = "", page = 0, pageSize = 20 } = opts;

  let q = supabase
    .from("designs")
    .select("*", { count: "exact" })
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: false });

  if (!includeInactive) q = q.eq("is_active", true);
  if (search.trim()) q = q.ilike("title", `%${search.trim()}%`);

  const from = page * pageSize;
  q = q.range(from, from + pageSize - 1);

  const { data, error, count } = await q;
  if (error) throw error;
  return { data: (data ?? []) as Design[], count: count ?? 0 };
}

// ── Read one ────────────────────────────────────────────────────────────────
export async function getDesign(id: string): Promise<Design> {
  const { data, error } = await supabase
    .from("designs")
    .select("*")
    .eq("id", id)
    .single();
  if (error) throw error;
  return data as Design;
}

// ── Upload image ─────────────────────────────────────────────────────────────
export async function uploadDesignImage(file: File): Promise<string> {
  const ext = file.name.split(".").pop()?.toLowerCase() || "jpg";
  const fileName = `${crypto.randomUUID()}.${ext}`;

  console.log("[upload] bucket:", BUCKET, "file:", fileName);

  const { data, error } = await supabase.storage.from(BUCKET).upload(fileName, file, {
    cacheControl: "31536000",
    upsert: false,
    contentType: file.type,
  });

  console.log("[upload] result:", { data, error });

  if (error) throw error;

  const { data: pub } = supabase.storage.from(BUCKET).getPublicUrl(fileName);
  return pub.publicUrl;
}

// ── Delete image by public URL ───────────────────────────────────────────────
export async function deleteDesignImageByUrl(url: string): Promise<void> {
  const marker = `/object/public/${BUCKET}/`;
  const idx = url.indexOf(marker);
  if (idx === -1) return;
  const key = url.slice(idx + marker.length).split("?")[0];
  if (!key) return;
  await supabase.storage.from(BUCKET).remove([key]);
}

// ── Create ──────────────────────────────────────────────────────────────────
export async function createDesign(input: DesignInput): Promise<Design> {
  const { data, error } = await supabase
    .from("designs")
    .insert({
      slug: input.slug,
      title: input.title,
      description: input.description,
      shape: input.shape,
      colors: input.colors,
      designs: input.designs,
      image_url: input.image_url,
      price_cents: input.price_cents ?? null,
      is_active: input.is_active ?? true,
      sort_order: input.sort_order ?? 0,
    })
    .select("*")
    .single();
  if (error) throw error;
  return data as Design;
}

// ── Update ──────────────────────────────────────────────────────────────────
export async function updateDesign(
  id: string,
  patch: Partial<DesignInput>
): Promise<Design> {
  // If the image changed, clean up the old object after the row is updated.
  let oldImageUrl: string | null = null;
  if (patch.image_url !== undefined) {
    const { data: existing } = await supabase
      .from("designs")
      .select("image_url")
      .eq("id", id)
      .single();
    oldImageUrl = existing?.image_url ?? null;
  }

  const { data, error } = await supabase
    .from("designs")
    .update(patch)
    .eq("id", id)
    .select("*")
    .single();
  if (error) throw error;

  if (
    oldImageUrl &&
    patch.image_url &&
    patch.image_url !== oldImageUrl
  ) {
    // best-effort cleanup; ignore failures
    deleteDesignImageByUrl(oldImageUrl).catch(() => {});
  }

  return data as Design;
}

// ── Toggle active ───────────────────────────────────────────────────────────
export async function setDesignActive(id: string, is_active: boolean) {
  return updateDesign(id, { is_active });
}

// ── Hard delete (removes DB row + storage object) ───────────────────────────
export async function hardDeleteDesign(id: string): Promise<void> {
  const existing = await getDesign(id);
  const { error } = await supabase.from("designs").delete().eq("id", id);
  if (error) throw error;
  await deleteDesignImageByUrl(existing.image_url).catch(() => {});
}