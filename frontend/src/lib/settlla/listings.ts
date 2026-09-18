import { Listing } from "@/types/listing";
import { SEED_LISTINGS, getSeedListingById } from "@/data/seedListings";
import { loadAgentListings, upsertAgentListing } from "./localStore";

function mergePublishedListings(): Listing[] {
  const agent = loadAgentListings();
  const byId = new Map<string, Listing>();
  for (const item of SEED_LISTINGS) byId.set(item.id, item);
  for (const item of agent) byId.set(item.id, item);
  return Array.from(byId.values());
}

export async function fetchPublishedListingsFromBrowser(): Promise<Listing[]> {
  return mergePublishedListings();
}

export async function fetchListingById(id: string): Promise<Listing | null> {
  const merged = mergePublishedListings();
  return merged.find((l) => l.id === id) ?? getSeedListingById(id) ?? null;
}

export async function upsertListing(listing: Listing, _agentId?: string | null): Promise<void> {
  upsertAgentListing(listing);
}

export async function seedListingsIfEmpty(_seed: Listing[] = SEED_LISTINGS): Promise<Listing[]> {
  return mergePublishedListings();
}
