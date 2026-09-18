import { TenancyAgreement } from "@/types/agreement";
import { InspectionBookingResponse } from "@/types/booking";
import { Listing } from "@/types/listing";

const AGREEMENTS_KEY = "settlla_agreements_store";
const AGENT_LISTINGS_KEY = "settlla_agent_listings";
const AGENT_BOOKINGS_KEY = "settlla_agent_bookings";

function readJson<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function writeJson(key: string, value: unknown): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* ignore */
  }
}

export function loadStoredAgreements(): TenancyAgreement[] {
  return readJson<TenancyAgreement[]>(AGREEMENTS_KEY, []);
}

export function upsertStoredAgreement(agreement: TenancyAgreement): void {
  const list = loadStoredAgreements().filter((a) => a.agreement_id !== agreement.agreement_id);
  list.push(agreement);
  writeJson(AGREEMENTS_KEY, list);
}

export function getStoredAgreementById(agreementId: string): TenancyAgreement | null {
  return loadStoredAgreements().find((a) => a.agreement_id === agreementId) ?? null;
}

export function loadAgentListings(): Listing[] {
  return readJson<Listing[]>(AGENT_LISTINGS_KEY, []);
}

export function upsertAgentListing(listing: Listing): void {
  const list = loadAgentListings().filter((l) => l.id !== listing.id);
  list.push(listing);
  writeJson(AGENT_LISTINGS_KEY, list);
}

export function pushAgentBooking(booking: InspectionBookingResponse): void {
  const list = readJson<InspectionBookingResponse[]>(AGENT_BOOKINGS_KEY, []);
  const next = [booking, ...list.filter((b) => b.booking_id !== booking.booking_id)].slice(0, 40);
  writeJson(AGENT_BOOKINGS_KEY, next);
}

export function loadAgentBookings(): InspectionBookingResponse[] {
  return readJson<InspectionBookingResponse[]>(AGENT_BOOKINGS_KEY, []);
}
