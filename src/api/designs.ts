import supabase from "../config/supabaseClient";
import type { Design, DesignInput } from "../types/design";

const BUCKET = "designs";

export async function listDesigns(opts: {
  includeInactive?: boolean;
  search?: string;
  page?: number;
  pageSize?: number;
} = {}): Promise<{ data: Design[]; count: number }> {
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

export async function getDesign(id: string): Promise<Design> {
  const { data, error } = await supabase
    .from("designs")
    .select("*")
    .eq("id", id)
    .single();
  if (error) throw error;
  return data as Design;
}

export async function uploadDesignImage(file: File): Promise<string> {
  const ext = file.name.split(".").pop()?.toLowerCase() || "jpg";
  const safeExt = ["jpg", "jpeg", "png", "webp", "gif"].includes(ext) ? ext : "jpg";
  const fileName = `${crypto.randomUUID()}.${safeExt}`;

  const { error } = await supabase.storage.from(BUCKET).upload(fileName, file, {
    cacheControl: "31536000",
    upsert: false,
    contentType: file.type,
  });
  if (error) throw error;

  const { data } = supabase.storage.from(BUCKET).getPublicUrl(fileName);
  return data.publicUrl;
}

export async function deleteDesignImageByUrl(url: string): Promise<void> {
  // extract the object key from the public URL
  const marker = `/object/public/${BUCKET}/`;
  const idx = url.indexOf(marker);
  if (idx === -1) return;
  const key = url.slice(idx + marker.length).split("?")[0];
  if (!key) return;
  await supabase.storage.from(BUCKET).remove([key]);
}

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

export async function updateDesign(
  id: string,
  patch: Partial<DesignInput>
): Promise<Design> {
  const { data, error } = await supabase
    .from("designs")
    .update(patch)
    .eq("id", id)
    .select("*")
    .single();
  if (error) throw error;
  return data as Design;
}

export async function setDesignActive(id: string, is_active: boolean) {
  return updateDesign(id, { is_active });
}

export async function hardDeleteDesign(id: string): Promise<void> {
  // Fetch first so we can delete the image object
  const existing = await getDesign(id);
  const { error } = await supabase.from("designs").delete().eq("id", id);
  if (error) throw error;
  await deleteDesignImageByUrl(existing.image_url).catch(() => {});
}