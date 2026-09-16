import { SettllaApp } from "@/components/SettllaApp";
import { Listing } from "@/types/listing";

async function getInitialListings(): Promise<Listing[]> {
  try {
    const res = await fetch("http://127.0.0.1:8000/api/listings", {
      cache: "no-store",
    });
    if (!res.ok) {
      console.error(`HTTP error: ${res.status}`);
      return [];
    }
    const data = await res.json();
    return data.listings || [];
  } catch (err) {
    console.error("Failed to fetch initial listings:", err);
    return [];
  }
}

export default async function Home() {
  const initialListings = await getInitialListings();
  return <SettllaApp initialListings={initialListings} />;
}
