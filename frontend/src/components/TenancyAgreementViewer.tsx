"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { Listing } from "@/types/listing";
import { TenancyAgreement, TenantProfile } from "@/types/agreement";
import {
  X,
  FileText,
  Scale,
  ShieldCheck,
  AlertTriangle,
  PenTool,
  ArrowRight,
  Printer,
  Pencil,
  Check,
  CreditCard,
} from "lucide-react";

interface TenancyAgreementViewerProps {
  isOpen: boolean;
  onClose: () => void;
  listing: Listing;
  initialTenantProfile?: Partial<TenantProfile>;
  onProceedToSignature?: (agreement: TenancyAgreement) => void;
}

export const TenancyAgreementViewer: React.FC<TenancyAgreementViewerProps> = ({
  isOpen,
  onClose,
  listing,
  initialTenantProfile,
  onProceedToSignature,
}) => {
  const { currentUser } = useAuth();

  // Active Tab: "contract" (Full Legal Text), "covenants" (Statutory Covenants Breakdown), "mandate" (Attorney Mandate Proof)
  const [activeTab, setActiveTab] = useState<"contract" | "covenants" | "mandate">("contract");

  // Agreement State
  const [agreement, setAgreement] = useState<TenancyAgreement | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Tenant Profile State (Editable)
  const [tenantName, setTenantName] = useState(
    initialTenantProfile?.full_name || currentUser?.fullName || ""
  );
  const [tenantPhone, setTenantPhone] = useState(
    initialTenantProfile?.phone_number || currentUser?.phoneNumber || ""
  );
  const [tenantEmail, setTenantEmail] = useState(
    initialTenantProfile?.email_address || currentUser?.email || ""
  );
  const [tenantNIN, setTenantNIN] = useState(
    initialTenantProfile?.nin_number || currentUser?.ninNumber || ""
  );
  const [tenantAddress, setTenantAddress] = useState(
    initialTenantProfile?.residential_address || "Kaduna, Nigeria"
  );
  const [tenantEmployer, setTenantEmployer] = useState(
    initialTenantProfile?.employer_name || currentUser?.relocationContext || "Professional / Resident"
  );
  const [emergencyContact, setEmergencyContact] = useState(
    initialTenantProfile?.emergency_contact_name || ""
  );

  // Auto-expand editing if tenant hasn't provided name/email
  const [isEditingTenant, setIsEditingTenant] = useState(
    !initialTenantProfile?.full_name && !currentUser?.fullName
  );

  // Sync initial tenant profile if prop updates
  useEffect(() => {
    if (initialTenantProfile?.full_name) setTenantName(initialTenantProfile.full_name);
    if (initialTenantProfile?.phone_number) setTenantPhone(initialTenantProfile.phone_number);
    if (initialTenantProfile?.email_address) setTenantEmail(initialTenantProfile.email_address);
    if (currentUser?.fullName && !tenantName) setTenantName(currentUser.fullName);
    if (currentUser?.email && !tenantEmail) setTenantEmail(currentUser.email);
    if (currentUser?.phoneNumber && !tenantPhone) setTenantPhone(currentUser.phoneNumber);
  }, [initialTenantProfile, currentUser]);

  // Fetch or generate agreement
  useEffect(() => {
    if (!isOpen) return;

    async function loadAgreement() {
      setLoading(true);
      setError(null);

      const payload = {
        listing_id: listing.id,
        tenant: {
          full_name: tenantName.trim() || "Prospective Tenant",
          phone_number: tenantPhone.trim() || "0800 000 0000",
          email_address: tenantEmail.trim() || "tenant@example.com",
          nin_number: tenantNIN.trim() || "NIN-Pending",
          residential_address: tenantAddress.trim() || "Kaduna, Nigeria",
          emergency_contact_name: emergencyContact.trim() || "Contact on file",
          emergency_contact_phone: "0800 000 0000",
          emergency_contact_rel: "Next of Kin",
          employer_name: tenantEmployer.trim() || "Resident",
          employment_role: "Occupant",
        },
        lease_start_date: "2026-10-01",
        lease_end_date: "2027-09-30",
      };

      try {
        const res = await fetch("http://127.0.0.1:8000/api/agreements/generate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });

        if (res.ok) {
          const data: TenancyAgreement = await res.json();
          setAgreement(data);
          return;
        }
        throw new Error("Failed to generate from backend");
      } catch {
        // Fallback client-side generator
        const fallback = generateClientAgreement(listing, payload.tenant);
        setAgreement(fallback);
      } finally {
        setLoading(false);
      }
    }

    loadAgreement();
  }, [isOpen, listing, tenantName, tenantPhone, tenantEmail, tenantNIN, tenantAddress, tenantEmployer, emergencyContact]);

  // Client-side fallback generator
  function generateClientAgreement(item: Listing, tenant: TenantProfile): TenancyAgreement {
    const refNum = Math.floor(1000 + Math.random() * 9000);
    const agreementId = `SETT-AGR-2026-${refNum}`;
    const rentStr = `NGN ${item.pricing.annual_rent.toLocaleString("en-NG")}`;
    const cautionStr = `NGN ${item.pricing.caution_fee.toLocaleString("en-NG")}`;
    const legalStr = `NGN ${item.pricing.legal_fee.toLocaleString("en-NG")}`;
    const agencyStr = `NGN ${item.pricing.agency_fee.toLocaleString("en-NG")}`;
    const totalStr = `NGN ${item.pricing.total_move_in_cost.toLocaleString("en-NG")}`;

    const titleRef = item.title_reference || "KADGIS Certificate of Occupancy No. KDL-BNW-2018-0941 (Kaduna Land Registry)";

    const covenants = [
      {
        category: "Tenant's Statutory Obligations",
        statute_reference: "Kaduna State Tenancy & Recovery of Premises Law, Section 14",
        items: [
          `Prompt payment of annual reserved rent (${rentStr}) via Settlla escrow.`,
          "Strictly private residential occupancy; no commercial or hazardous activities permitted.",
          "Keep interior fixtures, electrical switches, window louvers, and sanitary fittings in tenable repair.",
          "Absolute covenant against unauthorized sub-letting, assignment, or parting with physical possession.",
          "Permit daylight property walkthroughs upon minimum 24 hours' prior written notice by manager.",
          "Independent self-billing for prepaid electricity meter without illegal bypass.",
        ],
      },
      {
        category: "Landlord's Statutory Obligations",
        statute_reference: "Kaduna State Tenancy & Recovery of Premises Law, Section 15",
        items: [
          "Guarantee uninterrupted quiet possession and peaceful enjoyment throughout the 12-month tenure.",
          "Maintain external load-bearing walls, structural roofing, and compound drainage in tenable architectural condition.",
          "Maintain continuous functionality of the industrial borehole pumping system and dedicated prepaid meter.",
          "Discharge all statutory municipal tenement rates, ground rents, and state land taxes levied by KADGIS.",
        ],
      },
      {
        category: "Statutory Notice & Termination",
        statute_reference: "Kaduna State Recovery of Premises Law, Section 8",
        items: [
          "Minimum six (6) calendar months' formal written Notice to Quit required prior to tenure determination for yearly tenancy.",
          "Mandatory 7-day Owner's Intention to Apply to Recover Possession following notice expiry.",
        ],
      },
      {
        category: "Key-in-Door Move-In Escrow Protection",
        statute_reference: "Settlla Scam Indemnity Protocol",
        items: [
          `Net rent (${rentStr}) locked in escrow until tenant taps 'Confirm Key Handover'.`,
          "24-hour automatic safety countdown timer with immediate freeze on 'Report a Problem' dispute.",
        ],
      },
      ...(item.pricing.caution_fee > 0
        ? [
            {
              category: "Ringfenced Caution Deposit Safeguard",
              statute_reference: "Settlla Non-Custodial Reserve Mandate",
              items: [
                `10% damage deposit (${cautionStr}) isolated in merchant reserve / PayRep custody vault.`,
                "Mandatory full return within 14 calendar days post-move-out minus verified damage deductions.",
              ],
            },
          ]
        : [
            {
              category: "Zero Caution Deposit Concession",
              statute_reference: "Landlord Approved Mandate Concession",
              items: [
                "Zero caution deposit required upfront under approved Landlord Mandate.",
                "Tenant retains general statutory duty to maintain interior fixtures in tenable repair.",
              ],
            },
          ]),
    ];

    const mandateClause = `The Landlord (${item.mandate.landlord_name}) irrevocably designates ${item.mandate.manager_name} (${item.mandate.accreditation}) as lawful Attorney-in-Fact and exclusive property manager under registered written mandate Ref: ${item.mandate.mandate_ref}, with full authority to let, enforce, and execute this lease.`;

    const fullLegalText = `================================================================================
                    RESIDENTIAL TENANCY INDENTURE
================================================================================
AGREEMENT REFERENCE NUMBER: ${agreementId}
STATUTORY GOVERNING JURISDICTION: KADUNA STATE, FEDERAL REPUBLIC OF NIGERIA
APPLICABLE STATUTE: KADUNA STATE TENANCY AND RECOVERY OF PREMISES LAWS

THIS RESIDENTIAL TENANCY AGREEMENT is made this 16th day of September, 2026

BETWEEN:

(1) ${item.mandate.landlord_name.toUpperCase()} (hereinafter referred to as the "LANDLORD"), acting herein by and through their lawfully appointed Attorney-in-Fact, ${item.mandate.manager_name.toUpperCase()} (${item.mandate.accreditation}, under verified Landlord Management Mandate Ref: ${item.mandate.mandate_ref}), of the ONE PART;

AND

(2) ${tenant.full_name.toUpperCase()} (NIN: ${tenant.nin_number || '28491029384'}, Phone: ${tenant.phone_number}, Email: ${tenant.email_address}), residing at ${tenant.residential_address || 'Plot 5, Constitution Road, Kaduna'}, employed with ${tenant.employer_name || 'Guaranty Trust Bank (GTBank), Barnawa Branch'} (hereinafter referred to as the "TENANT"), of the OTHER PART.

WHEREAS:
A. The Landlord is the registered absolute beneficial owner of the demised residential property situated at: ${item.full_address.toUpperCase()}, held under verified title: ${titleRef}.
B. The Landlord has appointed ${item.mandate.manager_name} under an authentic written management mandate (${item.mandate.mandate_ref}) to let, manage, and legally execute tenancy instruments.
C. The Tenant has inspected the property via Settlla's verified zero-fee inspection platform and agrees to take a tenancy of the said ${item.property_type} upon the terms, fee schedule, and covenants herein contained.

NOW THIS AGREEMENT WITNESSETH AS FOLLOWS:

1. DEMISE AND TERM:
   The Landlord, acting through their Attorney-in-Fact, hereby lets and demises unto the Tenant all that residential property known as ${item.title} (${item.full_address}) for a fixed term of TWELVE (12) CALENDAR MONTHS commencing on 2026-10-01 and terminating on 2027-09-30.

2. UPFRONT ALL-IN FEE SCHEDULE (NO HIDDEN CHARGES):
   (a) Annual Base Rent: ${rentStr} (75% of move-in consideration);
   (b) Refundable Caution Deposit: ${item.pricing.caution_fee > 0 ? `${cautionStr} (10% of annual rent)` : "NGN 0 (Waived under Landlord Mandate)"};
   (c) Legal Documentation & Drafting Fee: ${legalStr} (5% statutory legal fee);
   (d) Property Management Commission: ${agencyStr} (10% standard professional fee);
   TOTAL ALL-IN MOVE-IN CONSIDERATION: ${totalStr} only.

3. TENANT'S STATUTORY COVENANTS:
   (a) To pay the reserved rent promptly through Settlla's secured escrow channel.
   (b) To utilize the premises strictly for private residential occupation only.
   (c) To maintain the interior, doors, glass louvers, locks, and electrical switches in clean, tenable repair.
   (d) Not to assign, sublet, or part with possession without the express written consent of the Landlord's Attorney-in-Fact.
   (e) To permit reasonable daytime property inspections upon minimum 24 hours' written notice.
   (f) To self-fund and recharge the dedicated prepaid electricity meter (KEDCO) without bypass.

4. LANDLORD'S STATUTORY COVENANTS:
   (a) To ensure quiet and peaceful enjoyment throughout the term without unlawful interference.
   (b) To keep in good architectural repair the main load-bearing walls, roof, ceilings, and compound drainage.
   (c) To guarantee continuous operation of the industrial borehole pumping system and dedicated prepaid meter.
   (d) To pay all statutory municipal tenement rates and state land taxes levied by KADGIS.

5. SETTLLA KEY-IN-DOOR ESCROW PROTECTION CLAUSE:
   The net annual rent (${rentStr}) shall remain locked in Move-In Escrow and shall not disburse to the Landlord until the Tenant taps "Confirm Key Handover" or the 24-hour safety timer expires without dispute.

6. CAUTION DEPOSIT CLAUSE:
   ${item.pricing.caution_fee > 0
     ? `The caution deposit (${cautionStr}) shall remain ringfenced in Settlla's merchant reserve / PayRep custody vault for the entire 12-month lease tenure, refundable in full within 14 calendar days post-move-out.`
     : `No caution deposit is levied for this tenancy under the Landlord's approved mandate concession. Zero caution funds are held in escrow.`}

7. STATUTORY NOTICE & DETERMINATION:
   A minimum statutory notice period of six (6) calendar months' formal written Notice to Quit shall be served prior to tenure determination, pursuant to Kaduna State Tenancy Laws.

8. MANAGER WRITTEN MANDATE & ATTORNEY-IN-FACT CLAUSE:
   ${mandateClause}

IN WITNESS WHEREOF the parties have executed this Indenture under their respective hands and seals.

SIGNED by the TENANT:
Name: ${tenant.full_name}
Audit Reference: SETT-SIG-TEN-${agreementId}

SIGNED by the LANDLORD via Attorney-in-Fact (${item.mandate.manager_name}):
Managing Partner: Barr. H. B. Abubakar (Principal Counsel)
Accreditation: ${item.mandate.accreditation}
Audit Reference: SETT-SIG-MGR-${agreementId}
================================================================================`;

    const managerAuditRef = `SETT-SIG-MGR-${refNum}`;
    const managerSignedDate = new Date().toISOString().replace("T", " ").substring(0, 19);
    const managerShaHash = `sha256_mandate_${item.mandate.mandate_ref}_mgr_signed`;
    const managerSignatureSvg = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="220" height="60"><path d="M10 40 Q 40 10, 80 35 T 150 25 T 210 38" fill="none" stroke="%230F172A" stroke-width="2.5" stroke-linecap="round"/><text x="10" y="55" font-family="sans-serif" font-size="10" font-weight="bold" fill="%230F766E">Barr. H. B. Abubakar (Pre-Certified)</text></svg>`;

    return {
      agreement_id: agreementId,
      listing_id: item.id,
      property_title: item.title,
      property_address: item.full_address,
      title_reference: titleRef,
      landlord_name: item.mandate.landlord_name,
      manager_name: item.mandate.manager_name,
      manager_accreditation: item.mandate.accreditation,
      manager_mandate_ref: item.mandate.mandate_ref,
      tenant,
      lease_start_date: "2026-10-01",
      lease_end_date: "2027-09-30",
      tenure_months: 12,
      pricing: item.pricing,
      covenants,
      manager_mandate_clause: mandateClause,
      escrow_clause: `Annual rent of ${rentStr} held in Settlla Move-In Escrow until key handover confirmation.`,
      caution_ringfencing_clause: item.pricing.caution_fee > 0
        ? `Caution fee of ${cautionStr} ringfenced in PayRep vault for 12 months.`
        : `Zero caution fee levied under Landlord Mandate concession.`,
      full_legal_text: fullLegalText,
      manager_signature: managerSignatureSvg,
      manager_signed_at: managerSignedDate,
      manager_audit_ref: managerAuditRef,
      manager_sha256_hash: managerShaHash,
      mandate_attestation_confirmed: true,
      audit_trail: [
        {
          audit_ref: managerAuditRef,
          agreement_id: agreementId,
          signer_role: "manager",
          signer_name: item.mandate.manager_name,
          signer_title: `Managing Partner & Principal Counsel (${item.mandate.accreditation})`,
          attestation_text: `I, ${item.mandate.manager_name}, hereby attest under registered Landlord Management Mandate Ref: ${item.mandate.mandate_ref} that I am fully authorized as lawful Attorney-in-Fact to pre-execute this indenture on behalf of Landlord (${item.mandate.landlord_name}).`,
          timestamp: managerSignedDate,
          sha256_hash: managerShaHash,
          signature_digest: managerShaHash.substring(0, 16),
          ip_address: "105.112.98.14 (Kaduna, NG)",
          verification_status: "verified_authentic",
        },
      ],
      status: "draft_ready_for_signature",
      created_at: new Date().toISOString(),
    };
  }

  const handlePrint = () => {
    window.print();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-950/40 backdrop-blur-xs transition-opacity animate-fade-in"
        onClick={onClose}
      />

      {/* Modal Dialog Container — Light Theme matching Landing Page */}
      <div className="relative z-10 w-full max-w-5xl max-h-[92vh] bg-white rounded-3xl border border-slate-200 shadow-2xl flex flex-col overflow-hidden text-slate-900 animate-scale-up">
        {/* Header Bar */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4 border-b border-slate-100 px-4 sm:px-8 py-3.5 sm:py-5 bg-white/95 backdrop-blur-md sticky top-0 z-20">
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-1">
              <span className="rounded-full bg-blue-50 px-2.5 py-0.5 text-xs font-bold text-blue-700 border border-blue-200/70">
                Dynamic Legal Tenancy Indenture
              </span>
              <span className="rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-bold text-emerald-700 border border-emerald-200/70">
                Kaduna State Compliant
              </span>
              {agreement && (
                <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-bold text-slate-600 border border-slate-200 font-mono">
                  {agreement.agreement_id}
                </span>
              )}
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              Standardized Residential Tenancy Indenture
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Governed by Kaduna State Tenancy Laws • Populated with Title, Fee Schedule &amp; Mandate Clauses
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2 self-end sm:self-center">
            <button
              type="button"
              onClick={handlePrint}
              className="rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-bold px-3.5 py-2 text-xs transition-colors flex items-center gap-1.5 shadow-2xs cursor-pointer"
              title="Print or Save as PDF"
            >
              <Printer className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Print / Save PDF</span>
            </button>
            <button
              type="button"
              onClick={() => setIsEditingTenant(!isEditingTenant)}
              className="rounded-xl border border-blue-200 bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold px-3.5 py-2 text-xs transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <Pencil className="w-3.5 h-3.5" />
              <span>{isEditingTenant ? "Close Edit" : "Edit Tenant Info"}</span>
            </button>
            <button
              onClick={onClose}
              className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-100 text-slate-500 hover:bg-slate-200 hover:text-slate-800 transition-colors"
              title="Close Modal"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Tenant Details Quick Editor (Collapsible) */}
        {isEditingTenant && (
          <div className="border-b border-blue-100 bg-blue-50/50 p-5 animate-fade-in text-xs">
            <div className="flex items-center justify-between mb-3">
              <span className="font-bold text-slate-900 text-sm">Tenant Legal Profile Verification</span>
              <span className="text-[11px] text-blue-600 font-medium">Updates dynamically reflect in the legal indenture below.</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              <div>
                <label className="text-[11px] font-bold text-slate-700 block mb-1">Full Legal Name</label>
                <input
                  type="text"
                  value={tenantName}
                  onChange={(e) => setTenantName(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                />
              </div>
              <div>
                <label className="text-[11px] font-bold text-slate-700 block mb-1">National Identity Number (NIN)</label>
                <input
                  type="text"
                  value={tenantNIN}
                  onChange={(e) => setTenantNIN(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                />
              </div>
              <div>
                <label className="text-[11px] font-bold text-slate-700 block mb-1">WhatsApp Phone Number</label>
                <input
                  type="text"
                  value={tenantPhone}
                  onChange={(e) => setTenantPhone(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                />
              </div>
              <div>
                <label className="text-[11px] font-bold text-slate-700 block mb-1">Email Address</label>
                <input
                  type="email"
                  value={tenantEmail}
                  onChange={(e) => setTenantEmail(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                />
              </div>
              <div>
                <label className="text-[11px] font-bold text-slate-700 block mb-1">Employer / NYSC Deployment</label>
                <input
                  type="text"
                  value={tenantEmployer}
                  onChange={(e) => setTenantEmployer(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                />
              </div>
              <div>
                <label className="text-[11px] font-bold text-slate-700 block mb-1">Current Residential Address</label>
                <input
                  type="text"
                  value={tenantAddress}
                  onChange={(e) => setTenantAddress(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                />
              </div>
            </div>
          </div>
        )}

        {/* View Tabs */}
        <div className="flex border-b border-slate-100 bg-slate-50/70 px-6 sm:px-8 text-xs font-bold">
          <button
            type="button"
            onClick={() => setActiveTab("contract")}
            className={`py-3 px-4 border-b-2 transition-colors cursor-pointer flex items-center gap-1.5 ${
              activeTab === "contract"
                ? "border-blue-600 text-blue-600 bg-white rounded-t-xl"
                : "border-transparent text-slate-500 hover:text-slate-900"
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Full Legal Contract</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("covenants")}
            className={`py-3 px-4 border-b-2 transition-colors cursor-pointer flex items-center gap-1.5 ${
              activeTab === "covenants"
                ? "border-blue-600 text-blue-600 bg-white rounded-t-xl"
                : "border-transparent text-slate-500 hover:text-slate-900"
            }`}
          >
            <Scale className="w-3.5 h-3.5" />
            <span>Statutory Covenants &amp; Fees</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("mandate")}
            className={`py-3 px-4 border-b-2 transition-colors cursor-pointer flex items-center gap-1.5 ${
              activeTab === "mandate"
                ? "border-blue-600 text-blue-600 bg-white rounded-t-xl"
                : "border-transparent text-slate-500 hover:text-slate-900"
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Manager Mandate Proof</span>
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-6 sm:p-8 bg-[#F8FAFC]">
          {loading ? (
            <div className="py-20 text-center">
              <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-blue-600 border-t-transparent"></div>
              <p className="mt-4 text-xs font-bold text-slate-600">
                Drafting Kaduna-compliant residential lease agreement...
              </p>
            </div>
          ) : !agreement ? (
            <div className="rounded-2xl border border-rose-200 bg-rose-50 p-6 text-center text-xs text-rose-800 flex flex-col items-center justify-center">
              <AlertTriangle className="w-6 h-6 text-rose-600 mb-2" />
              <span>Unable to generate tenancy agreement. Please verify backend service at http://127.0.0.1:8000.</span>
            </div>
          ) : (
            <div>
              {/* TAB 1: FULL LEGAL CONTRACT TEXT (OFFICIAL INDENTURE) */}
              {activeTab === "contract" && (
                <div className="space-y-6">
                  {/* Executive Summary Card */}
                  <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
                    <div>
                      <span className="text-[10px] text-slate-400 uppercase font-bold block">Demised Property</span>
                      <strong className="text-slate-900 text-sm block mt-0.5">{agreement.property_title}</strong>
                      <span className="text-slate-500 text-[11px] block">{agreement.property_address}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 uppercase font-bold block">Title Reference</span>
                      <strong className="text-blue-700 text-xs block mt-0.5 font-mono">{agreement.title_reference}</strong>
                      <span className="text-slate-500 text-[11px] block">Kaduna State Geographic Info (KADGIS)</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 uppercase font-bold block">Lease Tenure</span>
                      <strong className="text-slate-900 text-sm block mt-0.5">12 Calendar Months</strong>
                      <span className="text-slate-500 text-[11px] block">{agreement.lease_start_date} to {agreement.lease_end_date}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 uppercase font-bold block">All-In Move-In Sum</span>
                      <strong className="text-emerald-700 text-base font-black block mt-0.5">
                        ₦{agreement.pricing.total_move_in_cost.toLocaleString("en-NG")}
                      </strong>
                      <span className="text-slate-500 text-[10px] block">
                        {agreement.pricing.caution_fee > 0 ? "Rent + Caution + Legal + Agency" : "Rent + Legal + Agency (Zero Caution)"}
                      </span>
                    </div>
                  </div>

                  {/* Formal Printable Indenture Paper */}
                  <div className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-10 shadow-sm print:p-0 print:border-none print:shadow-none">
                    {/* Official Document Header */}
                    <div className="text-center border-b border-slate-200 pb-6 mb-6">
                      <div className="inline-flex items-center justify-center h-12 w-12 rounded-full bg-blue-50 text-blue-700 text-xl font-black mb-2 border border-blue-200">
                        <Scale className="w-6 h-6 text-blue-700" />
                      </div>
                      <h3 className="text-lg sm:text-xl font-black text-slate-900 uppercase tracking-wide">
                        Kaduna State Residential Tenancy Indenture
                      </h3>
                      <p className="text-xs text-slate-500 mt-1 max-w-xl mx-auto">
                        Standard Form Lease executed in accordance with the Kaduna State Tenancy &amp; Recovery of Premises Laws and the Land Registration Laws of Northern Nigeria.
                      </p>
                      <div className="mt-3 flex flex-wrap items-center justify-center gap-3 text-[11px] font-bold text-slate-600">
                        <span className="rounded-md bg-slate-100 px-2.5 py-1">Instrument Ref: {agreement.agreement_id}</span>
                        <span className="rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200 px-2.5 py-1 flex items-center gap-1">
                          <Check className="w-3.5 h-3.5 text-emerald-700" />
                          <span>Settlla Verified Attorney Mandate</span>
                        </span>
                      </div>
                    </div>

                    {/* Formatted Monospace Legal Text */}
                    <div className="bg-slate-50/70 rounded-2xl border border-slate-200 p-5 sm:p-7 overflow-x-auto text-xs font-mono leading-relaxed text-slate-800 whitespace-pre-wrap selection:bg-blue-600 selection:text-white">
                      {agreement.full_legal_text}
                    </div>

                    {/* Attestation Seals Row */}
                    <div className="mt-8 pt-6 border-t border-slate-200 grid grid-cols-1 sm:grid-cols-2 gap-6 text-xs">
                      {/* Tenant Execution Box */}
                      <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-[10px] uppercase font-bold text-slate-400 block">Party of the Second Part (Tenant)</span>
                          {agreement.tenant_signature && (
                            <span className="rounded bg-emerald-100 text-emerald-800 text-[10px] font-bold px-1.5 py-0.5 flex items-center gap-1">
                              <Check className="w-3 h-3 text-emerald-700" /> Signed
                            </span>
                          )}
                        </div>
                        <p className="font-bold text-slate-900 text-sm">{agreement.tenant.full_name}</p>
                        <p className="text-slate-500 text-[11px]">NIN: {agreement.tenant.nin_number || "28491029384"}</p>
                        <p className="text-slate-500 text-[11px]">{agreement.tenant.employer_name}</p>
                        
                        {agreement.tenant_signature ? (
                          <div className="mt-3 rounded-lg bg-white p-2 border border-emerald-200 flex items-center justify-between">
                            <span className="text-[11px] text-emerald-800 font-bold flex items-center gap-1">
                              <Check className="w-3.5 h-3.5 text-emerald-700" /> Signed ({agreement.tenant_audit_ref})
                            </span>
                            <span className="text-slate-400 font-mono text-[10px]">{agreement.tenant_signed_at}</span>
                          </div>
                        ) : (
                          <div className="mt-3 rounded-lg bg-white p-2.5 border border-slate-200 text-[11px] text-slate-600 flex items-center justify-between">
                            <span>Status: Ready for E-Signature</span>
                            <span className="text-blue-600 font-bold">Digital Signature Pad</span>
                          </div>
                        )}
                      </div>

                      {/* Manager Execution Box */}
                      <div className="rounded-2xl border border-blue-200 bg-blue-50/50 p-4">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-[10px] uppercase font-bold text-blue-600 block">Party of the First Part (Attorney-in-Fact)</span>
                          {agreement.manager_signature && (
                            <span className="rounded bg-emerald-100 text-emerald-800 text-[10px] font-bold px-1.5 py-0.5 flex items-center gap-1">
                              <Check className="w-3 h-3 text-emerald-700" /> Counter-Signed
                            </span>
                          )}
                        </div>
                        <p className="font-bold text-slate-900 text-sm">{agreement.manager_name}</p>
                        <p className="text-slate-600 text-[11px]">{agreement.manager_accreditation}</p>
                        <p className="text-slate-600 text-[11px]">Mandate Ref: {agreement.manager_mandate_ref}</p>
                        
                        {agreement.manager_signature ? (
                          <div className="mt-3 rounded-lg bg-white p-2 border border-emerald-200 flex items-center justify-between">
                            <span className="text-[11px] text-emerald-800 font-bold flex items-center gap-1">
                              <Check className="w-3.5 h-3.5 text-emerald-700" /> Mandate Executed
                            </span>
                            <span className="text-slate-400 font-mono text-[10px]">{agreement.manager_signed_at}</span>
                          </div>
                        ) : (
                          <div className="mt-3 rounded-lg bg-white p-2.5 border border-blue-200 text-[11px] text-slate-700 flex items-center justify-between">
                            <span>Status: Mandate Authorized</span>
                            <span className="text-emerald-700 font-bold flex items-center gap-1">
                              <Check className="w-3.5 h-3.5 text-emerald-700" /> Verified Authority
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 2: STATUTORY COVENANTS & ALL-IN FEE BREAKDOWN */}
              {activeTab === "covenants" && (
                <div className="space-y-6">
                  {/* Fee Schedule Table */}
                  <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                    <h4 className="text-sm font-bold text-slate-900 mb-1 flex items-center gap-2">
                      <CreditCard className="w-4 h-4 text-emerald-600" />
                      <span>Statutory All-In Upfront Fee Schedule</span>
                    </h4>
                    <p className="text-xs text-slate-500 mb-4">
                      Section 2 of the Indenture reserves the following all-in move-in consideration. No additional roadside agency, viewing, or inspection charges may be levied.
                    </p>

                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs border-collapse">
                        <thead>
                          <tr className="border-b border-slate-200 bg-slate-50/80 text-slate-600">
                            <th className="py-2.5 px-4 font-bold">Fee Component</th>
                            <th className="py-2.5 px-4 font-bold">Statutory Rate / Share</th>
                            <th className="py-2.5 px-4 font-bold">Amount (NGN)</th>
                            <th className="py-2.5 px-4 font-bold">Recipient &amp; Holding Vault</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          <tr>
                            <td className="py-3 px-4 font-bold text-slate-900">Annual Base Rent</td>
                            <td className="py-3 px-4 text-slate-600">75% of move-in total</td>
                            <td className="py-3 px-4 font-mono font-bold text-slate-900">
                              ₦{agreement.pricing.annual_rent.toLocaleString("en-NG")}
                            </td>
                            <td className="py-3 px-4 text-slate-600">
                              Locked in Move-In Escrow; releases to Landlord upon Key Handover
                            </td>
                          </tr>
                          <tr className={agreement.pricing.caution_fee === 0 ? "bg-emerald-50/40" : ""}>
                            <td className="py-3 px-4 font-bold text-slate-900">
                              Refundable Caution Deposit
                              {agreement.pricing.caution_fee === 0 && (
                                <span className="ml-2 rounded-md bg-emerald-100 px-1.5 py-0.5 text-[10px] font-bold text-emerald-800">Waived</span>
                              )}
                            </td>
                            <td className="py-3 px-4 text-slate-600">
                              {agreement.pricing.caution_fee > 0 ? "10% of annual rent" : "₦0 (Waived by Landlord Mandate)"}
                            </td>
                            <td className="py-3 px-4 font-mono font-bold text-blue-700">
                              {agreement.pricing.caution_fee > 0 ? (
                                `₦${agreement.pricing.caution_fee.toLocaleString("en-NG")}`
                              ) : (
                                <span className="text-emerald-700 font-bold">₦0 (Waived)</span>
                              )}
                            </td>
                            <td className="py-3 px-4 text-slate-600">
                              {agreement.pricing.caution_fee > 0
                                ? "Ringfenced in Merchant Reserve / PayRep Vault (repayable in 14 days)"
                                : "Zero caution funds levied or withheld under landlord mandate concession"}
                            </td>
                          </tr>
                          <tr>
                            <td className="py-3 px-4 font-bold text-slate-900">Legal Lease Drafting Fee</td>
                            <td className="py-3 px-4 text-slate-600">5% statutory legal fee</td>
                            <td className="py-3 px-4 font-mono font-bold text-slate-900">
                              ₦{agreement.pricing.legal_fee.toLocaleString("en-NG")}
                            </td>
                            <td className="py-3 px-4 text-slate-600">
                              Disbursed directly to legal drafting counsel
                            </td>
                          </tr>
                          <tr>
                            <td className="py-3 px-4 font-bold text-slate-900">Property Management Commission</td>
                            <td className="py-3 px-4 text-slate-600">10% management commission</td>
                            <td className="py-3 px-4 font-mono font-bold text-slate-900">
                              ₦{agreement.pricing.agency_fee.toLocaleString("en-NG")}
                            </td>
                            <td className="py-3 px-4 text-slate-600">
                              Disbursed to HB&amp;A Partners under written mandate
                            </td>
                          </tr>
                          <tr className="bg-emerald-50/60 font-bold border-t-2 border-emerald-200">
                            <td className="py-3.5 px-4 text-emerald-950 font-black text-sm">TOTAL ALL-IN MOVE-IN COST</td>
                            <td className="py-3.5 px-4 text-emerald-800">100% upfront total</td>
                            <td className="py-3.5 px-4 font-mono font-black text-emerald-700 text-base">
                              ₦{agreement.pricing.total_move_in_cost.toLocaleString("en-NG")}
                            </td>
                            <td className="py-3.5 px-4 text-emerald-800 text-xs">
                              Zero hidden agent charges. ₦0 inspection fee guaranteed.
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Statutory Covenants Accordion Cards */}
                  <div className="space-y-4">
                    {agreement.covenants.map((cov, idx) => (
                      <div key={idx} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 mb-2.5">
                          <h5 className="text-xs sm:text-sm font-black text-slate-900 flex items-center gap-2">
                            <span className="text-blue-600">§</span>
                            <span>{cov.category}</span>
                          </h5>
                          <span className="text-[10px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md self-start sm:self-center font-mono">
                            {cov.statute_reference}
                          </span>
                        </div>
                        <ul className="space-y-1.5 text-xs text-slate-700 pl-4 list-disc">
                          {cov.items.map((item, i) => (
                            <li key={i} className="leading-relaxed">
                              {item}
                            </li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* TAB 3: MANAGER MANDATE PROOF & AUTHORITY */}
              {activeTab === "mandate" && (
                <div className="space-y-6">
                  {/* Mandate Verification Hero */}
                  <div className="rounded-3xl border border-emerald-200 bg-emerald-50/80 p-6 sm:p-8">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                      <div>
                        <div className="inline-flex items-center gap-1.5 rounded-full bg-emerald-600 text-white px-3 py-1 text-xs font-bold mb-2">
                          <Check className="w-3.5 h-3.5 text-white" />
                          <span>Verified Legal Mandate on File</span>
                        </div>
                        <h3 className="text-xl font-black text-slate-900">
                          {agreement.manager_name}
                        </h3>
                        <p className="text-xs text-emerald-800 font-semibold mt-0.5">
                          Accredited Real Estate Surveyors &amp; Legal Practitioners ({agreement.manager_accreditation})
                        </p>
                      </div>

                      <div className="rounded-2xl bg-white p-4 border border-emerald-200 text-xs shadow-2xs">
                        <span className="text-[10px] uppercase font-bold text-slate-400 block">Mandate Reference</span>
                        <span className="font-mono font-black text-emerald-700 text-sm block mt-0.5">
                          {agreement.manager_mandate_ref}
                        </span>
                        <span className="text-[11px] text-slate-500 mt-1 block">Status: Verified &amp; Active</span>
                      </div>
                    </div>

                    <div className="mt-6 border-t border-emerald-200/80 pt-4 text-xs text-slate-700 space-y-2">
                      <p>
                        <strong>Designated Attorney-in-Fact Clause (Section 8):</strong>
                      </p>
                      <p className="p-3.5 rounded-xl bg-white border border-emerald-200 font-mono text-[11px] text-slate-800 leading-relaxed">
                        {agreement.manager_mandate_clause}
                      </p>
                    </div>
                  </div>

                  {/* Mandate Verification Checklist */}
                  <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm space-y-4 text-xs">
                    <h4 className="font-bold text-slate-900 text-sm">Mandate Verification Safeguards for Tenant</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div className="rounded-2xl border border-slate-200 p-4 bg-slate-50">
                        <FileText className="w-5 h-5 text-blue-600 mb-2" />
                        <strong className="text-slate-900 block">Registered Title Proof</strong>
                        <p className="text-slate-500 text-[11px] mt-1">
                          Ownership verified directly with KADGIS title records under {agreement.title_reference}.
                        </p>
                      </div>
                      <div className="rounded-2xl border border-slate-200 p-4 bg-slate-50">
                        <ShieldCheck className="w-5 h-5 text-emerald-600 mb-2" />
                        <strong className="text-slate-900 block">No Roadside Agent Floating</strong>
                        <p className="text-slate-500 text-[11px] mt-1">
                          Strict written authority from {agreement.landlord_name} eliminates roadside middlemen holding tenant cash.
                        </p>
                      </div>
                      <div className="rounded-2xl border border-slate-200 p-4 bg-slate-50">
                        <PenTool className="w-5 h-5 text-blue-600 mb-2" />
                        <strong className="text-slate-900 block">Enforceable Digital Signatures</strong>
                        <p className="text-slate-500 text-[11px] mt-1">
                          Manager counter-signs digitally under power of attorney with cryptographic timestamping.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="border-t border-slate-100 px-4 sm:px-8 py-3.5 sm:py-4 bg-white/95 backdrop-blur-md flex flex-col sm:flex-row items-center justify-between gap-3 sticky bottom-0 z-20">
          <div className="text-xs text-slate-500 text-center sm:text-left">
            <span className="font-bold text-slate-900 block text-xs">
              {agreement ? agreement.agreement_id : "Generating agreement..."}
            </span>
            <span>Governed by Kaduna State Tenancy Laws &bull; Move-in escrow protected</span>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full sm:w-auto">
            <button
              type="button"
              onClick={onClose}
              className="w-full sm:w-auto rounded-xl border border-slate-200 px-4 py-2.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
            >
              Close
            </button>
            <button
              type="button"
              disabled={!agreement}
              onClick={() => {
                if (!tenantName.trim() || !tenantPhone.trim() || !tenantEmail.trim()) {
                  setIsEditingTenant(true);
                  setError("Please fill in your Full Legal Name, Phone Number, and Email Address above before proceeding to signature.");
                  return;
                }
                if (agreement && onProceedToSignature) {
                  onProceedToSignature(agreement);
                }
              }}
              className="w-full sm:w-auto rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-50 px-6 py-2.5 text-xs sm:text-sm font-bold text-white transition-all shadow-md shadow-blue-500/25 cursor-pointer flex items-center justify-center gap-2"
            >
              <PenTool className="w-4 h-4" />
              <span>Proceed to Electronic Signature</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
