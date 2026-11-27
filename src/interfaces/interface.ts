export interface Booking {
  id: string;
  date: string;
  time: string;
  status: string;
  notes: string;
  created_at: string;
  ig_username:string;
  user: { full_name: string } | null;
  booking_services: {
    id: string;
    custom_image_url: string | null;
    service: { name: string } | null;
    design: { title: string; image_url: string } | null;
  }[];
}

export interface User {
  id: string;
  full_name: string;
  created_at: string
  roles: {
    name: string
  }
}

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

export interface Time {
  id: string;
  time: string;
  is_active: boolean;
}