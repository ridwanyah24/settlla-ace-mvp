export type TenantRentalRecord = {
  rental_id: string;
  agreement: unknown;
  listing: unknown;
  transaction: unknown;
  move_in_pass: unknown;
  escrow_hold: unknown;
  caution_vault?: unknown;
  status: string;
  created_at: string;
};

export async function saveTenantRental(record: TenantRentalRecord): Promise<void> {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem("settlla_current_rental", JSON.stringify(record));
    const existing = JSON.parse(localStorage.getItem("settlla_active_rentals") || "[]");
    localStorage.setItem(
      "settlla_active_rentals",
      JSON.stringify([
        record,
        ...existing.filter((r: TenantRentalRecord) => r.rental_id !== record.rental_id),
      ])
    );
  } catch (e) {
    console.error("local rental save failed", e);
  }
}

export async function loadCurrentTenantRental(): Promise<TenantRentalRecord | null> {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem("settlla_current_rental");
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export async function fetchAgentRentals(): Promise<TenantRentalRecord[]> {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem("settlla_active_rentals");
    const list: TenantRentalRecord[] = raw ? JSON.parse(raw) : [];
    return list.filter((r) => r.status === "active");
  } catch {
    return [];
  }
}

export async function persistEscrowHoldUpdate(
  rentalId: string,
  updatedEscrow: Record<string, unknown>
): Promise<void> {
  if (typeof window === "undefined") return;
  try {
    const raw = localStorage.getItem("settlla_current_rental");
    if (raw) {
      const record = JSON.parse(raw) as TenantRentalRecord;
      if (record.rental_id === rentalId) {
        record.escrow_hold = {
          ...((record.escrow_hold as object) || {}),
          ...updatedEscrow,
        };
        localStorage.setItem("settlla_current_rental", JSON.stringify(record));
        const existing = JSON.parse(localStorage.getItem("settlla_active_rentals") || "[]") as TenantRentalRecord[];
        localStorage.setItem(
          "settlla_active_rentals",
          JSON.stringify(existing.map((r) => (r.rental_id === rentalId ? record : r)))
        );
      }
    }
  } catch (e) {
    console.warn("[settlla] local escrow update", e);
  }
}

export async function patchTenantRentalEscrow(
  _rentalId: string,
  _patch: Record<string, unknown>
): Promise<void> {
  /* client-side demo — persistEscrowHoldUpdate handles storage */
}
