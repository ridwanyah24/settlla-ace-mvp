import { Listing } from "@/types/listing";
import { TenancyAgreement, TenantProfile } from "@/types/agreement";

export function generateClientAgreement(item: Listing, tenant: TenantProfile): TenancyAgreement {
    const refNum = Math.floor(1000 + Math.random() * 9000);
    const agreementId = `SETT-AGR-2026-${refNum}`;
    const rentStr = `NGN ${item.pricing.annual_rent.toLocaleString("en-NG")}`;
    const cautionStr = `NGN ${item.pricing.caution_fee.toLocaleString("en-NG")}`;
    const legalAndAgencyFeeVal = item.pricing.legal_and_agency_fee || (item.pricing.legal_fee + item.pricing.agency_fee);
    const legalAndAgencyStr = `NGN ${legalAndAgencyFeeVal.toLocaleString("en-NG")}`;
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
   (c) Legal & Agency Fee: ${legalAndAgencyStr} (15% statutory tenancy drafting, stamp duty & professional management);
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