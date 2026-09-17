import { Listing } from "@/types/listing";
import { SEED_LISTINGS, getSeedListingById } from "@/data/seedListings";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { queryPublishedListings, rowToListing } from "@/lib/settlla/listingsQuery";

export async function fetchPublishedListingsFromBrowser(): Promise<Listing[]> {
  const supabase = getSupabaseBrowserClient();
  if (!supabase) return isSupabaseConfigured() ? [] : SEED_LISTINGS;
  try {
    return await queryPublishedListings(supabase);
  } catch {
    return [];
  }
}

export async function fetchListingById(id: string): Promise<Listing | null> {
  const supabase = getSupabaseBrowserClient();
  if (supabase) {
    const { data, error } = await supabase
      .from("listings")
      .select("body")
      .eq("id", id)
      .eq("is_published", true)
      .maybeSingle();

    if (!error && data?.body) {
      const listing = rowToListing(data.body);
      if (listing) return listing;
    }
  }

  if (isSupabaseConfigured()) return null;
  return getSeedListingById(id) ?? null;
}

export async function upsertListing(listing: Listing, agentId?: string | null): Promise<void> {
  const supabase = getSupabaseBrowserClient();
  if (!supabase) return;

  const { error } = await supabase.from("listings").upsert({
    id: listing.id,
    agent_id: agentId ?? null,
    neighborhood: listing.neighborhood,
    body: listing,
    is_published: true,
    updated_at: new Date().toISOString(),
  });

  if (error) console.warn("[settlla] listing upsert:", error.message);
}

export async function seedListingsIfEmpty(seed: Listing[] = SEED_LISTINGS): Promise<Listing[]> {
  const supabase = getSupabaseBrowserClient();
  if (!supabase) return [];

  const rows = seed.map((l) => ({
    id: l.id,
    neighborhood: l.neighborhood,
    body: l,
  }));

  const { error } = await supabase.rpc("seed_listings_if_empty", { rows });
  if (error) {
    console.warn("[settlla] seed listings:", error.message);
    const { count } = await supabase.from("listings").select("*", { count: "exact", head: true });
    if ((count ?? 0) === 0) {
      const { error: insertError } = await supabase.from("listings").insert(
        seed.map((l) => ({
          id: l.id,
          neighborhood: l.neighborhood,
          body: l,
          is_published: true,
        }))
      );
      if (insertError) console.warn("[settlla] seed insert:", insertError.message);
    }
  }

  return queryPublishedListings(supabase);
}
