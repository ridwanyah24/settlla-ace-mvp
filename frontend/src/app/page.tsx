import { SettllaApp } from "@/components/SettllaApp";
import { fetchPublishedListings } from "@/lib/settlla/listings.server";

export default async function Home() {
  const initialListings = await fetchPublishedListings();
  return <SettllaApp initialListings={initialListings} />;
}

