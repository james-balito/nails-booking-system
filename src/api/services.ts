import supabase from "../config/supabaseClient";

export interface Service {
  id: string;
  name: string;
  slug: string;
  description: string;
  parent_id: string | null;
  is_active: boolean;
  requires_design: boolean;
  allows_custom_upload: boolean;
}

export async function listServices(): Promise<Service[]> {
  const { data, error } = await supabase
    .from("services")
    .select("*")
    .eq("is_active", true)
    .order("name");

  if (error) throw error;
  return data as Service[];
}