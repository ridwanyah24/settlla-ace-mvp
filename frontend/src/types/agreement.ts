import { PricingBreakdown } from "./listing";

export interface TenantProfile {
  full_name: string;
  phone_number: string;
  email_address: string;
  nin_number?: string;
  residential_address?: string;
  emergency_contact_name?: string;
  emergency_contact_phone?: string;
  emergency_contact_rel?: string;
  employer_name?: string;
  employment_role?: string;
}

export interface CovenantCategory {
  category: string;
  statute_reference: string;
  items: string[];
}

export interface CryptographicAuditRecord {
  audit_ref: string;
  agreement_id: string;
  signer_role: "tenant" | "manager";
  signer_name: string;
  signer_title?: string;
  attestation_text: string;
  timestamp: string;
  sha256_hash: string;
  signature_digest: string;
  ip_address: string;
  verification_status: string;
}

export interface TenancyAgreement {
  agreement_id: string;
  listing_id: string;
  property_title: string;
  property_address: string;
  title_reference: string;
  landlord_name: string;
  manager_name: string;
  manager_accreditation: string;
  manager_mandate_ref: string;
  tenant: TenantProfile;
  lease_start_date: string;
  lease_end_date: string;
  tenure_months: number;
  pricing: PricingBreakdown;
  covenants: CovenantCategory[];
  manager_mandate_clause: string;
  escrow_clause: string;
  caution_ringfencing_clause: string;
  full_legal_text: string;
  status: "draft_ready_for_signature" | "tenant_signed" | "fully_executed";
  created_at: string;
  tenant_signature?: string | null;
  tenant_signed_at?: string | null;
  tenant_audit_ref?: string | null;
  tenant_sha256_hash?: string | null;
  manager_signature?: string | null;
  manager_signed_at?: string | null;
  manager_audit_ref?: string | null;
  manager_sha256_hash?: string | null;
  master_seal_hash?: string | null;
  mandate_attestation_confirmed?: boolean;
  audit_trail?: CryptographicAuditRecord[];
}

export interface GenerateAgreementPayload {
  listing_id: string;
  tenant: TenantProfile;
  lease_start_date?: string;
  lease_end_date?: string;
}

export interface TenantSignPayload {
  signer_name: string;
  signature_data: string;
  consent_confirmed: boolean;
  nin_confirmed?: string;
}

export interface ManagerSignPayload {
  manager_name: string;
  manager_title: string;
  signature_data: string;
  mandate_attestation_confirmed: boolean;
  mandate_ref: string;
}

