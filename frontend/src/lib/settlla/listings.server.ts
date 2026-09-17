import { SEED_LISTINGS } from "@/data/seedListings";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { queryPublishedListings } from "@/lib/settlla/listingsQuery";
import { isSupabaseConfigured } from "@/lib/supabase/config";

export async function fetchPublishedListings() {
  try {
    const supabase = await getSupabaseServerClient();
    if (supabase) return queryPublishedListings(supabase);
  } catch {
    /* fall through */
  }
  if (isSupabaseConfigured()) return [];
  return SEED_LISTINGS;
}
