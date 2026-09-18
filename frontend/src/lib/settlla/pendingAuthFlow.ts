import type { Listing } from "@/types/listing";
import type { TenancyAgreement } from "@/types/agreement";
import type { InspectionBookingResponse } from "@/types/booking";

const STORAGE_KEY = "settlla_pending_auth_flow";
const MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000;

export type PendingAuthFlow =
  | {
      type: "checkout";
      listingId: string;
      listing: Listing;
      agreement: TenancyAgreement;
      email: string;
      returnPath: string;
      savedAt: number;
    }
  | {
      type: "booking";
      listingId: string;
      listing: Listing;
      booking: InspectionBookingResponse | null;
      email: string;
      returnPath: string;
      savedAt: number;
    };

export function savePendingAuthFlow(flow: PendingAuthFlow) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(flow));
  } catch {
    /* ignore quota / private mode */
  }
}

export function loadPendingAuthFlow(): PendingAuthFlow | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as PendingAuthFlow;
    if (!parsed?.type || !parsed.savedAt) return null;
    if (Date.now() - parsed.savedAt > MAX_AGE_MS) {
      clearPendingAuthFlow();
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}

export function clearPendingAuthFlow() {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    /* ignore */
  }
}

export function resumeHref(flow: PendingAuthFlow): string {
  if (flow.returnPath) return flow.returnPath;
  if (flow.type === "checkout") return "/?resume=checkout&confirmed=1";
  return "/dashboard/tenant";
}
