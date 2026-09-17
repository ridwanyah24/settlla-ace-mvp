import { getSupabaseBrowserClient } from "@/lib/supabase/client";

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
  if (typeof window !== "undefined") {
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

  const supabase = getSupabaseBrowserClient();
  if (!supabase) return;

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;

  await supabase.from("tenant_rentals").upsert({
    rental_id: record.rental_id,
    tenant_user_id: user.id,
    agreement_id: (record.agreement as { agreement_id?: string })?.agreement_id ?? null,
    listing_id: (record.listing as { id?: string })?.id ?? null,
    payload: record,
    status: record.status,
    updated_at: new Date().toISOString(),
  });
}

export async function loadCurrentTenantRental(): Promise<TenantRentalRecord | null> {
  const supabase = getSupabaseBrowserClient();
  if (supabase) {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (user) {
      const { data } = await supabase
        .from("tenant_rentals")
        .select("payload")
        .eq("tenant_user_id", user.id)
        .eq("status", "active")
        .order("updated_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (data?.payload) {
        const record = data.payload as TenantRentalRecord;
        if (typeof window !== "undefined") {
          localStorage.setItem("settlla_current_rental", JSON.stringify(record));
        }
        return record;
      }
      return null;
    }
  }

  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem("settlla_current_rental");
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export async function fetchAgentRentals(): Promise<TenantRentalRecord[]> {
  const supabase = getSupabaseBrowserClient();
  if (!supabase) return [];

  const { data, error } = await supabase
    .from("tenant_rentals")
    .select("payload")
    .eq("status", "active")
    .order("updated_at", { ascending: false })
    .limit(20);

  if (error || !data) {
    if (error) console.warn("[settlla] agent rentals:", error.message);
    return [];
  }
  return data.map((r: { payload: unknown }) => r.payload as TenantRentalRecord);
}

export async function persistEscrowHoldUpdate(
  rentalId: string,
  updatedEscrow: Record<string, unknown>
): Promise<void> {
  if (typeof window !== "undefined") {
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
            JSON.stringify(
              existing.map((r) => (r.rental_id === rentalId ? record : r))
            )
          );
        }
      }
    } catch (e) {
      console.warn("[settlla] local escrow update", e);
    }
  }
  await patchTenantRentalEscrow(rentalId, updatedEscrow);
}

export async function patchTenantRentalEscrow(
  rentalId: string,
  patch: Record<string, unknown>
): Promise<void> {
  const supabase = getSupabaseBrowserClient();
  if (!supabase) return;

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;

  const { data } = await supabase
    .from("tenant_rentals")
    .select("payload")
    .eq("rental_id", rentalId)
    .eq("tenant_user_id", user.id)
    .maybeSingle();

  if (!data?.payload) return;

  const payload = {
    ...(data.payload as TenantRentalRecord),
    escrow_hold: {
      ...((data.payload as TenantRentalRecord).escrow_hold as object),
      ...patch,
    },
  };

  await supabase
    .from("tenant_rentals")
    .update({ payload, updated_at: new Date().toISOString() })
    .eq("rental_id", rentalId)
    .eq("tenant_user_id", user.id);
}
