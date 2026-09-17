import { Listing } from "./listing";
import { TenancyAgreement, TenantProfile } from "./agreement";
import { MoveInPass } from "./payment";

/** Snapshot of a dismissible overlay that can be restored when the user closes the one on top. */
export type RestorableModalLayer =
  | { type: "ai-search" }
  | { type: "listing-detail"; listing: Listing }
  | { type: "booking"; listing: Listing }
  | {
      type: "agreement";
      listing: Listing;
      tenant?: Partial<TenantProfile>;
    }
  | {
      type: "signature";
      agreement: TenancyAgreement;
      listing: Listing;
      role: "tenant" | "manager";
    }
  | {
      type: "checkout";
      agreement: TenancyAgreement;
      listing: Listing;
    }
  | {
      type: "move-in-pass";
      pass: MoveInPass;
      agreement: TenancyAgreement | null;
      listing: Listing | null;
    }
  | { type: "escrow-dashboard" }
  | { type: "manager-queue" };
