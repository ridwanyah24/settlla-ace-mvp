import { Listing } from "@/types/listing";
import { DaySchedule, InspectionBookingResponse } from "@/types/booking";
import { generateClientSchedule } from "./bookingSchedule";
import { loadAgentBookings, pushAgentBooking } from "./localStore";

export { generateClientSchedule };

export async function fetchListingVisitSlots(listing: Listing): Promise<DaySchedule[]> {
  if (typeof window !== "undefined") {
    try {
      const stored = localStorage.getItem(`settlla_locked_${listing.id}`);
      if (stored) JSON.parse(stored);
    } catch {
      /* ignore */
    }
  }
  return generateClientSchedule(listing);
}

export type CreateBookingPayload = {
  listing_id: string;
  date_str: string;
  slot_time: string;
  tenant_name: string;
  tenant_phone: string;
  tenant_email: string;
  relocation_context?: string;
  slot_id?: string;
};

export async function createInspectionBooking(
  listing: Listing,
  payload: CreateBookingPayload,
  slotId: string,
  formattedDate: string
): Promise<InspectionBookingResponse> {
  const fakeRef = `SETT-BK-${Math.floor(1000 + Math.random() * 9000)}`;
  const response: InspectionBookingResponse = {
    booking_id: fakeRef,
    listing_id: listing.id,
    property_title: listing.title,
    property_address: listing.full_address,
    commute_badge: listing.commute_badge,
    manager_name: listing.mandate.manager_name,
    manager_accreditation: listing.mandate.accreditation,
    manager_phone: "0803 555 1289",
    manager_whatsapp: "2348035551289",
    tenant_name: payload.tenant_name,
    tenant_phone: payload.tenant_phone,
    tenant_email: payload.tenant_email,
    date_str: payload.date_str,
    formatted_date: formattedDate,
    slot_time: payload.slot_time,
    inspection_fee: 0,
    fee_currency: "NGN",
    booking_status: "confirmed",
    directions: `Meet manager at ${listing.full_address}. ${listing.commute_context}`,
    anti_scam_guarantee: "100% Free Walkthrough. Zero roadside fee.",
    created_at: new Date().toISOString(),
  };

  if (typeof window !== "undefined") {
    localStorage.setItem("settlla_tenant_booking", JSON.stringify(response));
    pushAgentBooking(response);
  }

  return response;
}

function payloadToBooking(payload: unknown): InspectionBookingResponse | null {
  if (!payload || typeof payload !== "object") return null;
  return payload as InspectionBookingResponse;
}

export async function fetchLatestTenantBooking(): Promise<InspectionBookingResponse | null> {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem("settlla_tenant_booking");
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export async function fetchAgentBookings(): Promise<InspectionBookingResponse[]> {
  return loadAgentBookings();
}

export async function cancelInspectionBooking(bookingId: string): Promise<void> {
  if (typeof window === "undefined") return;
  try {
    const raw = localStorage.getItem("settlla_tenant_booking");
    if (raw) {
      const current = JSON.parse(raw) as InspectionBookingResponse;
      if (current.booking_id === bookingId) {
        localStorage.removeItem("settlla_tenant_booking");
      }
    }
  } catch {
    /* ignore */
  }
}
