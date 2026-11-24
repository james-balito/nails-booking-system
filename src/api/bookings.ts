import supabase from "../config/supabaseClient";

export async function listAllBookings() {
  const { data, error } = await supabase
    .from("bookings")
    .select(`
      id,
      date,
      time,
      status,
      notes,
      created_at,
      user:user_profiles!bookings_user_profile_fkey ( id, full_name ),
      booking_services (
        id,
        custom_image_url,
        service:services ( name ),
        design:designs ( title, image_url )
      )
    `)
    .order("created_at", { ascending: false }); // 👈 Newest first

  if (error) throw error;
  return data;
}

export async function listUserBookings(userId: string) {
  const { data, error } = await supabase
    .from("bookings")
    .select(`
      id,
      date,
      time,
      status,
      notes,
      created_at,
      booking_services (
        id,
        custom_image_url,
        service:services ( name ),
        design:designs ( title, image_url )
      )
    `)
    .eq("user_id", userId)
    .order("date", { ascending: false }); // Newest appointments first

  if (error) throw error;
  return data;
}

export async function updateBookingStatus(id: string, status: string) {
  const { data, error } = await supabase
    .from("bookings")
    .update({ status })
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function updateBookingDetails(id: string, updates: { date?: string; time?: string; notes?: string }) {
  const { data, error } = await supabase
    .from("bookings")
    .update(updates)
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function deleteBooking(id: string) {
  // 1. Delete related services first (due to foreign key constraints)
  const { error: servicesError } = await supabase
    .from("booking_services")
    .delete()
    .eq("booking_id", id);

  if (servicesError) throw servicesError;

  // 2. Delete the main booking
  const { error: bookingError } = await supabase
    .from("bookings")
    .delete()
    .eq("id", id);

  if (bookingError) throw bookingError;
}