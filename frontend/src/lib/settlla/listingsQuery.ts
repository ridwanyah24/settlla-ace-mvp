import { Listing } from "@/types/listing";
import type { SupabaseClient } from "@supabase/supabase-js";

export function rowToListing(body: unknown): Listing | null {
  if (!body || typeof body !== "object") return null;
  return body as Listing;
}

export async function queryPublishedListings(supabase: SupabaseClient): Promise<Listing[]> {
  const { data, error } = await supabase
    .from("listings")
    .select("body")
    .eq("is_published", true)
    .order("updated_at", { ascending: false });

  if (error || !data) return [];
  return data.map((r: { body: unknown }) => rowToListing(r.body)).filter(Boolean) as Listing[];
}
