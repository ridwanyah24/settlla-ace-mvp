import { Listing } from "@/types/listing";
import { TenancyAgreement, TenantProfile } from "@/types/agreement";
import { generateClientAgreement } from "./generateClientAgreement";
import {
  getStoredAgreementById,
  upsertStoredAgreement,
} from "./localStore";

export async function createAgreement(
  listing: Listing,
  tenant: TenantProfile,
  opts?: { lease_start_date?: string; lease_end_date?: string }
): Promise<TenancyAgreement> {
  const agreement = generateClientAgreement(listing, tenant);
  if (opts?.lease_start_date) agreement.lease_start_date = opts.lease_start_date;
  if (opts?.lease_end_date) agreement.lease_end_date = opts.lease_end_date;
  upsertStoredAgreement(agreement);
  return agreement;
}

export async function saveAgreementDocument(agreement: TenancyAgreement): Promise<TenancyAgreement> {
  upsertStoredAgreement(agreement);
  return agreement;
}

export async function fetchAgreementById(agreementId: string): Promise<TenancyAgreement | null> {
  return getStoredAgreementById(agreementId);
}
