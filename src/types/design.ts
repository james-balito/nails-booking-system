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

// Shape/color/design options — keep in sync with your gallery filters
export const SHAPE_OPTIONS = [
  "Almond", "Square", "Coffin", "Stiletto", "Oval", "Round", "Squoval",
] as const;

export const COLOR_OPTIONS = [
  "Pink", "White", "Black", "Red", "Nude", "Gold", "Chrome", "Blue",
  "Green", "Purple", "Orange", "Yellow", "Brown",
] as const;

export const DESIGN_OPTIONS = [
  "French", "Ombre", "Chrome", "3D Art", "Floral", "Abstract", "Minimal",
  "Glitter", "Marble", "Animal Print",
] as const;