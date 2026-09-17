import { Listing } from "@/types/listing";
import { TenancyAgreement, TenantProfile } from "@/types/agreement";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { generateClientAgreement } from "./generateClientAgreement";

export async function createAgreement(
  listing: Listing,
  tenant: TenantProfile,
  opts?: { lease_start_date?: string; lease_end_date?: string }
): Promise<TenancyAgreement> {
  const agreement = generateClientAgreement(listing, tenant);
  if (opts?.lease_start_date) agreement.lease_start_date = opts.lease_start_date;
  if (opts?.lease_end_date) agreement.lease_end_date = opts.lease_end_date;

  const supabase = getSupabaseBrowserClient();
  if (!supabase) return agreement;

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { error } = await supabase.from("agreements").upsert({
    agreement_id: agreement.agreement_id,
    listing_id: listing.id,
    tenant_user_id: user?.id ?? null,
    document: agreement,
    status: agreement.status,
    updated_at: new Date().toISOString(),
  });

  if (error) {
    console.warn("[settlla] agreements upsert:", error.message);
  }

  return agreement;
}

export async function saveAgreementDocument(agreement: TenancyAgreement): Promise<TenancyAgreement> {
  const supabase = getSupabaseBrowserClient();
  if (!supabase) return agreement;

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { error } = await supabase.from("agreements").upsert({
    agreement_id: agreement.agreement_id,
    listing_id: agreement.listing_id,
    tenant_user_id: user?.id ?? null,
    document: agreement,
    status: agreement.status,
    updated_at: new Date().toISOString(),
  });

  if (error) console.warn("[settlla] agreement save:", error.message);
  return agreement;
}

export async function fetchAgreementById(agreementId: string): Promise<TenancyAgreement | null> {
  const supabase = getSupabaseBrowserClient();
  if (!supabase) return null;

  const { data, error } = await supabase
    .from("agreements")
    .select("document")
    .eq("agreement_id", agreementId)
    .maybeSingle();

  if (error || !data?.document) return null;
  return data.document as TenancyAgreement;
}
