/// <reference types="node" />
import "dotenv/config";
import fs from "node:fs";
import path from "node:path";
import dotenv from "dotenv";
dotenv.config({ override: true });
import { createClient } from "@supabase/supabase-js";
import { nailsData } from "../assets/nailsData.js"; // <-- adjust path if needed

const TABLE = "designs";
const BUCKET = "designs";

const SUPABASE_URL = process.env.SUPABASE_URL ?? process.env.VITE_SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.VITE_SUPABASE_SERVICE_ROLE_KEY;

const IMAGES_DIR = path.resolve(process.cwd(), process.env.IMAGES_DIR ?? "src/assets");
const DEFAULT_PRICE_CENTS = Number(process.env.DEFAULT_PRICE_CENTS ?? 0);

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error("Missing Supabase URL or SUPABASE_SERVICE_ROLE_KEY in .env");
  process.exit(1);
}

const parts = SUPABASE_SERVICE_ROLE_KEY.split(".");
const role = parts.length === 3
  ? JSON.parse(Buffer.from(parts[1], "base64url").toString()).role
  : SUPABASE_SERVICE_ROLE_KEY.startsWith("sb_secret_") ? "service_role" : "unknown";
if (role !== "service_role") {
  console.error(`SUPABASE_SERVICE_ROLE_KEY is a "${role}" key. Use the service_role/secret key.`);
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false },
});

const CONTENT_TYPES: Record<string, string> = {
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".webp": "image/webp",
  ".avif": "image/avif",
  ".gif": "image/gif",
};

const stripCite = (t: string) => t.replace(/\s*\[cite:\s*[\d,\s]+\]/g, "").trim();

/** Recursively map "nails1" -> full path of the image file. */
function indexImages(dir: string, map = new Map<string, string>()) {
  if (!fs.existsSync(dir)) return map;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.name === "node_modules" || entry.name.startsWith(".")) continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      indexImages(full, map);
    } else {
      const ext = path.extname(entry.name).toLowerCase();
      if (CONTENT_TYPES[ext]) {
        map.set(path.basename(entry.name, path.extname(entry.name)).toLowerCase(), full);
      }
    }
  }
  return map;
}

async function ensurePublicBucket() {
  const { data: buckets, error } = await supabase.storage.listBuckets();
  if (error) throw error;
  const existing = buckets.find((b) => b.name === BUCKET);
  if (!existing) {
    const { error: createErr } = await supabase.storage.createBucket(BUCKET, { public: true });
    if (createErr) throw createErr;
    console.log(`Created public bucket "${BUCKET}"`);
  } else if (!existing.public) {
    const { error: updErr } = await supabase.storage.updateBucket(BUCKET, { public: true });
    if (updErr) throw updErr;
    console.log(`Made bucket "${BUCKET}" public`);
  }
}

async function seed() {
  console.log(`Looking for images in ${IMAGES_DIR}`);
  const images = indexImages(IMAGES_DIR);
  console.log(`Found ${images.size} image files`);

  await ensurePublicBucket();

  const rows: Record<string, unknown>[] = [];
  const skipped: string[] = [];

  for (let i = 0; i < nailsData.length; i++) {
    const n = nailsData[i];
    const localPath = images.get(n.filename.toLowerCase());
    if (!localPath) {
      skipped.push(n.filename);
      continue;
    }

    const ext = path.extname(localPath).toLowerCase();
    const storagePath = `${n.filename}${ext}`;

    const { error } = await supabase.storage
      .from(BUCKET)
      .upload(storagePath, fs.readFileSync(localPath), {
        upsert: true,
        contentType: CONTENT_TYPES[ext],
        cacheControl: "31536000",
      });
    if (error) {
      console.warn(`  upload failed ${storagePath}: ${error.message}`);
      skipped.push(n.filename);
      continue;
    }

    rows.push({
      slug: n.filename,
      title: n.title.trim(),
      description: stripCite(n.description),
      shape: n.shape.trim(),
      colors: n.colors,
      designs: n.designs,
      image_url: supabase.storage.from(BUCKET).getPublicUrl(storagePath).data.publicUrl,
      sort_order: i + 1,
      is_active: true,
    });
    console.log(`  uploaded ${storagePath}`);
  }

  if (rows.length === 0) {
    console.error("No rows to insert. Check IMAGES_DIR and the image file names.");
    process.exit(1);
  }

  // Keep prices of rows that already exist; only give new rows the default price.
  const { data: existing, error: selErr } = await supabase
    .from(TABLE)
    .select("slug")
    .in("slug", rows.map((r) => r.slug as string));
  if (selErr) throw selErr;
  const existingSlugs = new Set((existing ?? []).map((r) => r.slug));

  const existingRows = rows.filter((r) => existingSlugs.has(r.slug as string));
  const newRows = rows
    .filter((r) => !existingSlugs.has(r.slug as string))
    .map((r) => ({ ...r, price_cents: DEFAULT_PRICE_CENTS }));

  for (const batch of [existingRows, newRows]) {
    if (batch.length === 0) continue;
    const { error } = await supabase.from(TABLE).upsert(batch, { onConflict: "slug" });
    if (error) {
      console.error("Seed failed:", error.message);
      process.exit(1);
    }
  }

  const { count } = await supabase.from(TABLE).select("*", { count: "exact", head: true });
  console.log(`\nDone. ${rows.length} designs seeded (${newRows.length} new, ${existingRows.length} updated).`);
  console.log(`Table "${TABLE}" now has ${count} rows.`);
  if (skipped.length) {
    console.warn(`\nSkipped ${skipped.length} with no image found/uploaded: ${skipped.join(", ")}`);
  }
}

seed().catch((e) => {
  console.error(e);
  process.exit(1);
});