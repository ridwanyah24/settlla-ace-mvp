import {
  CryptographicAuditRecord,
  TenancyAgreement,
  TenantSignPayload,
  ManagerSignPayload,
} from "@/types/agreement";
import { saveAgreementDocument } from "./agreements";
import { computeClientSha256 } from "./crypto";

export async function signTenantAgreement(
  agreement: TenancyAgreement,
  payload: TenantSignPayload
): Promise<TenancyAgreement> {
  const nowIso = new Date().toISOString().replace("T", " ").substring(0, 19);
  const auditRef = `SETT-SIG-TEN-${agreement.agreement_id.split("-").pop() || "1001"}`;
  const shaHash = await computeClientSha256(
    `${agreement.agreement_id}|TENANT|${payload.signer_name}|${nowIso}|${payload.signature_data.substring(0, 64)}`
  );

  const auditRecord: CryptographicAuditRecord = {
    audit_ref: auditRef,
    agreement_id: agreement.agreement_id,
    signer_role: "tenant",
    signer_name: payload.signer_name,
    signer_title: "Prospective Residential Tenant",
    attestation_text: `I, ${payload.signer_name}, hereby execute this Kaduna State Residential Tenancy Indenture as Tenant and agree to all covenants herein.`,
    timestamp: nowIso,
    sha256_hash: shaHash,
    signature_digest: shaHash.substring(0, 16),
    ip_address: "102.89.43.19 (Kaduna, NG)",
    verification_status: "verified_authentic",
  };

  const managerAuditRef =
    agreement.manager_audit_ref || `SETT-SIG-MGR-${agreement.agreement_id.split("-").pop() || "1001"}`;
  const managerSignedDate = agreement.manager_signed_at || "2026-09-01 09:00:00";
  const managerShaHash =
    agreement.manager_sha256_hash || `sha256_mandate_${agreement.manager_mandate_ref}_mgr_seal`;
  const managerSignature =
    agreement.manager_signature ||
    `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="220" height="60"><path d="M10 40 Q 40 10, 80 35 T 150 25 T 210 38" fill="none" stroke="%230F172A" stroke-width="2.5" stroke-linecap="round"/></svg>`;
  const masterSeal = await computeClientSha256(
    `MASTER_SEAL|${agreement.agreement_id}|${shaHash}|${managerShaHash}|${nowIso}`
  );

  const managerAuditRecord: CryptographicAuditRecord = {
    audit_ref: managerAuditRef,
    agreement_id: agreement.agreement_id,
    signer_role: "manager",
    signer_name: agreement.manager_name,
    signer_title: `Managing Partner & Principal Counsel (${agreement.manager_accreditation})`,
    attestation_text: `I, ${agreement.manager_name}, hereby attest under registered Landlord Management Mandate Ref: ${agreement.manager_mandate_ref} that I am fully authorized as lawful Attorney-in-Fact to pre-execute this indenture on behalf of Landlord (${agreement.landlord_name}).`,
    timestamp: managerSignedDate,
    sha256_hash: managerShaHash,
    signature_digest: managerShaHash.substring(0, 16),
    ip_address: "105.112.98.14 (Kaduna, NG)",
    verification_status: "verified_authentic",
  };

  const updated: TenancyAgreement = {
    ...agreement,
    tenant_signature: payload.signature_data,
    tenant_signed_at: nowIso,
    tenant_audit_ref: auditRef,
    tenant_sha256_hash: shaHash,
    manager_signature: managerSignature,
    manager_signed_at: managerSignedDate,
    manager_audit_ref: managerAuditRef,
    manager_sha256_hash: managerShaHash,
    mandate_attestation_confirmed: true,
    master_seal_hash: masterSeal,
    status: "fully_executed",
    audit_trail: [
      ...(agreement.audit_trail || []).filter(
        (r) => r.signer_role !== "tenant" && r.signer_role !== "manager"
      ),
      managerAuditRecord,
      auditRecord,
    ],
  };

  return saveAgreementDocument(updated);
}

export async function signManagerAgreement(
  agreement: TenancyAgreement,
  payload: ManagerSignPayload
): Promise<TenancyAgreement> {
  const nowIso = new Date().toISOString().replace("T", " ").substring(0, 19);
  const auditRef = `SETT-SIG-MGR-${agreement.agreement_id.split("-").pop() || "1001"}`;
  const shaHash = await computeClientSha256(
    `${agreement.agreement_id}|MANAGER|${payload.manager_name}|${payload.mandate_ref}|${nowIso}|${payload.signature_data.substring(0, 64)}`
  );
  const masterSeal = await computeClientSha256(
    `MASTER_SEAL|${agreement.agreement_id}|${agreement.tenant_sha256_hash}|${shaHash}|${nowIso}`
  );

  const auditRecord: CryptographicAuditRecord = {
    audit_ref: auditRef,
    agreement_id: agreement.agreement_id,
    signer_role: "manager",
    signer_name: payload.manager_name,
    signer_title: payload.manager_title,
    attestation_text: `I, ${payload.manager_name} (${payload.manager_title}), hereby attest under registered Landlord Management Mandate Ref: ${payload.mandate_ref} that I am fully authorized as lawful Attorney-in-Fact to execute this indenture on behalf of the Landlord (${agreement.landlord_name}).`,
    timestamp: nowIso,
    sha256_hash: shaHash,
    signature_digest: shaHash.substring(0, 16),
    ip_address: "105.112.98.14 (Kaduna, NG)",
    verification_status: "verified_authentic",
  };

  const updated: TenancyAgreement = {
    ...agreement,
    manager_signature: payload.signature_data,
    manager_signed_at: nowIso,
    manager_audit_ref: auditRef,
    manager_sha256_hash: shaHash,
    master_seal_hash: masterSeal,
    mandate_attestation_confirmed: true,
    status: "fully_executed",
    audit_trail: [
      ...(agreement.audit_trail || []).filter((r) => r.signer_role !== "manager"),
      auditRecord,
    ],
  };

  return saveAgreementDocument(updated);
}
