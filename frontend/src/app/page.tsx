import { SettllaApp } from "@/components/SettllaApp";
import { Listing } from "@/types/listing";
import { SEED_LISTINGS } from "@/data/seedListings";

async function getInitialListings(): Promise<Listing[]> {
  try {
    // If backend URL is provided or locally reachable, try fetching
    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "http://127.0.0.1:8000";
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 1200);

    const res = await fetch(`${backendUrl}/api/listings`, {
      cache: "no-store",
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    if (res.ok) {
      const data = await res.json();
      if (data.listings && data.listings.length > 0) {
        return data.listings;
      }
    }
    return SEED_LISTINGS;
  } catch {
    // Default seed listings for standalone frontend deployment
    return SEED_LISTINGS;
  }
}

export default async function Home() {
  const initialListings = await getInitialListings();
  return <SettllaApp initialListings={initialListings} />;
}

