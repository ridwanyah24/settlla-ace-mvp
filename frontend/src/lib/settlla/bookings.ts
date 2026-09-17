import { Listing } from "@/types/listing";
import { DaySchedule, InspectionBookingResponse } from "@/types/booking";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { generateClientSchedule } from "./bookingSchedule";

export { generateClientSchedule };

export async function fetchListingVisitSlots(listing: Listing): Promise<DaySchedule[]> {
  const supabase = getSupabaseBrowserClient();
  if (supabase) {
    const { data, error } = await supabase
      .from("bookings")
      .select("slot_id")
      .eq("listing_id", listing.id);

    if (!error && data) {
      const locked = data
        .map((r: { slot_id: string | null }) => r.slot_id)
        .filter(Boolean) as string[];
      if (typeof window !== "undefined" && locked.length) {
        localStorage.setItem(`settlla_locked_${listing.id}`, JSON.stringify(locked));
      }
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

  const supabase = getSupabaseBrowserClient();
  if (supabase) {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    const { error } = await supabase.from("bookings").insert({
      booking_id: fakeRef,
      listing_id: listing.id,
      tenant_user_id: user?.id ?? null,
      slot_id: slotId,
      payload: response,
    });

    if (error?.code === "23505") {
      throw new Error("SLOT_TAKEN");
    }
    if (error) console.warn("[settlla] booking insert:", error.message);
  }

  return response;
}

function payloadToBooking(payload: unknown): InspectionBookingResponse | null {
  if (!payload || typeof payload !== "object") return null;
  return payload as InspectionBookingResponse;
}

export async function fetchLatestTenantBooking(): Promise<InspectionBookingResponse | null> {
  const supabase = getSupabaseBrowserClient();
  if (supabase) {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (user) {
      const { data, error } = await supabase
        .from("bookings")
        .select("payload")
        .eq("tenant_user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();
      if (!error && data?.payload) return payloadToBooking(data.payload);
      return null;
    }
  }

  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem("settlla_tenant_booking");
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export async function fetchAgentBookings(): Promise<InspectionBookingResponse[]> {
  const supabase = getSupabaseBrowserClient();
  if (!supabase) return [];

  const { data, error } = await supabase
    .from("bookings")
    .select("payload")
    .order("created_at", { ascending: false })
    .limit(30);

  if (error || !data) {
    if (error) console.warn("[settlla] agent bookings:", error.message);
    return [];
  }
  return data
    .map((r: { payload: unknown }) => payloadToBooking(r.payload))
    .filter(Boolean) as InspectionBookingResponse[];
}

export async function cancelInspectionBooking(bookingId: string): Promise<void> {
  const supabase = getSupabaseBrowserClient();
  if (supabase) {
    const { error } = await supabase.from("bookings").delete().eq("booking_id", bookingId);
    if (error) console.warn("[settlla] cancel booking:", error.message);
  }
  if (typeof window !== "undefined") {
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
}
