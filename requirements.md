# Settlla — Product Requirements Document (PRD)
## The Digital Rental Closing Engine (MVP Build)

- **Date**: 2026-09-15
- **Product Name**: Settlla
- **Version**: 1.1 (Updated with Founder Decisions)
- **Target Market**: Kaduna, Nigeria (Initial Wedge: Barnawa & Malali)
- **Source Reference**: `raw-notes.md` (YC Office Hours Discovery)

---

## 1. Problem Statement

In Kaduna, incoming professional relocatees (such as NYSC corps members, remote tech workers, and corporate bank transferees) face urgent 14-day housing deadlines. They are forced to navigate fragmented, unregulated street agents, routinely lose money to arbitrary inspection fees (₦2,000–₦5,000 per visit), endure discriminatory bias, and risk losing 100% of their annual savings to ghost agents and unrecovered caution deposits. Concurrently, reputable property managers and landlords struggle with delayed rent remittances from agents holding the cash float, chaotic paper agreements, and an inability to efficiently pre-qualify solvent, trustworthy tenants.

---

## 2. Target User (Specific Dual ICPs)

### Primary Demand ICP: The Relocating Professional ("Hajara")
- **Profile**: A 22–29 year-old female professional (e.g., NYSC corps member posted to GTBank in Barnawa, remote software engineer, or corporate transferee).
- **Financial Profile**: Annual rental budget of ₦400,000–₦800,000; ready to pay upfront.
- **Pain & Context**: Relocating to Kaduna without an established local network; on a strict 14-day move-in deadline before facing homelessness or unsafe squatting; zero tolerance for street-agent inspection scams or bait-and-switch listings.
- **Core Need**: Verified properties, transparent zero-fee inspection booking, move-in escrow protection, and a legally sound digital lease.

### Primary Supply ICP: The Property Lawyer / Professional Manager ("HB&A Partners")
- **Profile**: A licensed legal practitioner or established real estate manager in Kaduna managing 10–30 residential properties for private landlords.
- **Pain & Context**: Wastes days sorting through unserious window-shoppers from WhatsApp; risks reputation with property owners due to delayed payment channels; bogged down by manual drafting, printing, and physical signing of paper tenancy agreements.
- **Core Need**: High-caliber corporate tenants, instant automated split-disbursement of rent directly to landlords (eliminating remittance friction), legal fee collection, and digital lease execution.

---

## 3. Functional Requirements (FR) Table

Priority Scheme (MoSCoW):
- **Must**: Mission-critical core for the V1 Digital Closing Engine.
- **Should**: High-value feature to be delivered in MVP or fast follow-up.
- **Could**: Desirable enhancement if time and resources permit.
- **Won't**: Explicitly deferred out-of-scope for this build.

| ID | Feature | Description | Priority |
| :--- | :--- | :--- | :--- |
| **FR-01** | **Verified Listing Showcase** | Web interface displaying vetted properties submitted via property manager self-serve portal with structured metadata (rent, caution fee, legal fee, location, amenities, verified photos), strictly requiring an uploaded copy of the signed landlord management mandate before publication. [Founder decision] | **Must** |
| **FR-02** | **Direct Inspection Slot Scheduling** | Allows tenants to book zero-fee 30-minute inspection slots strictly constrained to recurring visiting windows pre-set by the property manager (e.g., Tuesdays/Thursdays 2:00 PM – 5:00 PM, Saturdays 10:00 AM – 3:00 PM), eliminating inspection fees. [Founder decision] | **Must** |
| **FR-03** | **Dynamic Tenancy Agreement Generator** | Automatically generates a standardized, legally binding Nigerian residential lease agreement populated with tenant, landlord, property, and fee details, designating the property manager as authorized signatory under written mandate. [Founder decision] | **Must** |
| **FR-04** | **Electronic Signature Workflow** | Enables digital two-party lease execution between the tenant and the legal property manager (e.g., HB&A Partners), who signs digitally on behalf of the landlord under their existing written property management mandate, accompanied by audit timestamps. [Founder decision] | **Must** |
| **FR-05** | **Automated 4-Way Split Payment Engine** | Integrates payment gateway (Paystack/Monnify) to accept total move-in cost in one payment and automatically split: (1) Rent $\rightarrow$ Landlord bank account; (2) Management/Agency Fee $\rightarrow$ Manager; (3) Legal Fee $\rightarrow$ Drafter; (4) Caution Fee $\rightarrow$ Ringfenced merchant reserve balance or third-party holding platform (PayRep). [Founder decision] | **Must** |
| **FR-06** | **Ringfenced Caution Deposit Vault** | Directs caution deposits into dedicated virtual sub-accounts / merchant reserve balances via Paystack/Monnify or a third-party holding platform (PayRep) tagged per tenancy, preventing personal landlord misappropriation while remaining non-custodial. [Founder decision] | **Must** |
| **FR-07** | **Key-in-Door Move-In Escrow Protection** | Holds the payout clearance until the tenant taps "Confirm Key Handover" in their web dashboard; if unconfirmed after 24 hours post-scheduled move-in and no dispute is filed via "Report a Problem", funds automatically release to the landlord, backed by a 100% scam indemnity guarantee. [Founder decision] | **Must** |
| **FR-08** | **Tenant Search Status & Preference Broadcast** | Tenants submit an active search profile (budget, target area, move-in date) that matches against manager portfolios. | **Should** |
| **FR-09** | **Property Manager Lead Matching Dashboard** | Portal for managers (like HB&A) to view pre-qualified tenant requests and directly invite them to inspect matching listings. | **Should** |
| **FR-10** | **Automated Landlord Remittance Receipts** | Triggers instant SMS/email payment notifications and formal transaction receipts directly to the landlord's registered contact upon payment clearance. | **Should** |
| **FR-11** | **Basic Identity & Employment Verification** | Collects and validates tenant government ID (NIN) and proof of employment/NYSC deployment letter prior to lease generation. | **Should** |
| **FR-12** | **Post-Move-Out Caution Reconciliation Flow** | Digital protocol at tenancy conclusion allowing manager to log verified damages with photos or initiate full caution return to tenant. | **Could** |
| **FR-13** | **Virtual Video Tour Attachments** | Supports compressed, pre-recorded video walkthroughs on listing pages to reduce redundant physical inspections. | **Could** |
| **FR-14** | **In-App Inspection Rescheduling** | Allows tenants or managers to reschedule inspection appointments with automated SMS alerts up to 4 hours prior. | **Could** |
| **FR-15** | **Unlicensed Custodial Banking** | Settlla directly holding user deposits in its own checking account without licensed fintech sub-account infrastructure. | **Won't** |
| **FR-16** | **Rent Now Pay Later (RNPL) / Credit Underwriting** | Financing tenant rents or issuing monthly installment loans. | **Won't** |
| **FR-17** | **Open Unregulated Street Agent Marketplace** | Public, unvetted listing submissions from roadside freelance agents. | **Won't** |
| **FR-18** | **Full Maintenance & Repair Work-Order Ticketing** | In-app post-move-in plumbing, electrical, and maintenance coordination. | **Won't** |
| **FR-19** | **Multi-City Geographies** | Expansion into Abuja, Lagos, or other Nigerian states during V1. | **Won't** |

---

## 4. User Stories

### Tenant (Relocating Professional — "Hajara")
1. **Zero-Fee Inspection**: *As an incoming relocatee, I want to view verified apartment details and book an inspection slot online, so that I don't waste ₦3,000–₦5,000 on arbitrary inspection fees or get ghosted by roadside agents.*
2. **Move-In Protection Guarantee**: *As a tenant paying annual rent upfront, I want my funds protected under an escrow guarantee until I physically receive the working keys, so that I never lose my money to ghost listings or fake agents.*
3. **Instant Legal Lease**: *As a tenant, I want to review and electronically sign a formal tenancy agreement, so that I have enforceable legal protection against arbitrary eviction or rent inflation.*
4. **Caution Fee Ringfencing**: *As a tenant, I want my caution deposit kept in a dedicated, ringfenced vault rather than the landlord's personal pocket, so that I can reliably recover my money when I move out.*

### Property Manager / Lawyer ("HB&A Partners")
5. **Qualified Inbound Tenant Demand**: *As a property manager, I want to access pre-vetted tenant profiles with confirmed budgets and move-in dates, so that I don't waste time on window-shoppers and WhatsApp tire-kickers.*
6. **Automated Paperwork**: *As a property lawyer, I want standardized tenancy agreements auto-populated and signed digitally, so that I eliminate the friction of drafting, printing, and chasing paper signatures.*
7. **Direct Landlord Remittance**: *As a property manager, I want rental payments to split automatically with the landlord's share going directly to their bank account, so that property owners never accuse me of delaying their money.*
8. **Agency & Legal Fee Certainty**: *As a property manager, I want my agency and legal drafting fees deducted and remitted directly to my account at checkout, so that I don't have to chase landlords or tenants for commissions.*

### Property Owner / Landlord
9. **Immediate Payout Notification**: *As an offsite landlord, I want to receive instant SMS/bank alerts when rent is paid by a corporate tenant, so that I have total visibility into my rental income.*
10. **Pre-Screened Tenant Quality**: *As a landlord, I want tenants pre-verified for identity and employment, so that I protect my residential property from destructive or defaulting occupants.*

---

## 5. Explicit Out-of-Scope List (Non-Goals for V1)

The following capabilities are deliberately excluded from this build to preserve operational focus, avoid the platform trap, and maintain legal compliance:

1. **No Custodial Escrow Banking**: Settlla will **not** operate an unlicensed escrow bank. All fund holding and splits must execute via licensed payment processor sub-accounts (Paystack/Monnify/Providus virtual accounts) or designated third-party holding platforms (PayRep).
2. **No Rent Now Pay Later (RNPL) or Lending**: Settlla will **not** underwrite credit, issue monthly micro-loans, or pay landlords upfront on behalf of tenants. All leases require 100% upfront annual rent from the tenant.
3. **No Open Marketplace for Street Agents**: Settlla will **not** allow open, unverified listing postings. Only vetted legal practitioners and accredited property managers with proven landlord mandates may list properties.
4. **No Post-Move-In Property Management & Maintenance**: Settlla will **not** handle ongoing maintenance ticketing, generator fueling logs, facility repairs, or waste disposal management in this build.
5. **No Multi-City Deployment**: Settlla will **not** deploy in Abuja, Lagos, Port Harcourt, or other states during V1. All operational, physical concierge, and marketing focus is restricted strictly to Kaduna (Barnawa/Malali wedge).
6. **No In-App Legal Dispute Arbitration Court**: Settlla will **not** act as a judicial body or provide binding dispute arbitration. Agreements will rely on standard Kaduna State tenancy laws and Nigerian judicial enforceability.
7. **No Direct Landlord In-App Accounts or Onboarding**: Landlords will **not** be required to register, download an app, or log into a portal to sign leases; property managers sign digitally as authorized legal representatives under existing written mandates. [Founder decision]
8. **No Live Two-Way External Calendar Sync**: Settlla will **not** integrate third-party calendar engines (e.g., Google Calendar, Outlook) for inspection scheduling; inspection availability is strictly governed by pre-set, recurring visiting windows defined by property managers. [Founder decision]
9. **No Listings Without Proof of Mandate**: Settlla will **not** publish unmandated properties; every listing submission requires an uploaded, verifiable signed landlord management mandate. [Founder decision]

---

## 6. Founder Decisions Log

| # | Question | Decision | Applies to |
| :--- | :--- | :--- | :--- |
| **1** | What exact signal triggers the release of held rent payout to the landlord on move-in day? | The tenant taps a "Confirm Key Handover" button in their web dashboard. If they do not tap it within 24 hours after their scheduled move-in time and have not clicked "Report a Problem", the system automatically releases the funds to the landlord. *(Decided: 2026-09-15)* | **FR-07** |
| **2** | Where is the caution fee held during the 12-month tenancy, and how is the 4-way split executed legally? | Use an established Nigerian payment processor (such as Paystack or Monnify). When the tenant pays, the system automatically routes the rent, agency, and legal fees directly to their respective bank accounts, while parking the caution deposit in a dedicated merchant reserve balance until move-out. We also plan to use a third-party platform like PayRep to hold the caution fee. *(Decided: 2026-09-15)* | **FR-05, FR-06** |
| **3** | Who executes the digital lease agreement if offsite or older landlords do not use software? | The legal property manager (e.g., HB&A Partners) signs the contract digitally on behalf of the landlord under their existing written property management mandate. *(Decided: 2026-09-15)* | **FR-03, FR-04** |
| **4** | How are inspection slots scheduled with property managers without calendar synchronization errors? | The manager chooses standard visiting windows once (e.g., "Tuesdays & Thursdays 2:00 PM – 5:00 PM, Saturdays 10:00 AM – 3:00 PM"), and tenants can only book 30-minute intervals within those times. *(Decided: 2026-09-15)* | **FR-02** |
| **5** | What is the listing onboarding and verification workflow to prevent fake or expired properties? | Property managers log into their own web portal, fill out property details, and must upload a copy of their signed landlord mandate before the listing can be published. *(Decided: 2026-09-15)* | **FR-01** |

---

## 7. Unclear or Missing Information (Deferred Non-Functional & Future Scope)

The 5 critical blocking items for Must-have functional requirements have been resolved above (see Section 6: Founder Decisions Log). The remaining open questions are non-blocking and deferred to subsequent iterations:

1. **Move-Out Damage Dispute Protocol (FR-12 — Could)**: If a manager claims damages against the caution deposit at move-out and the tenant disputes the claim, what is the exact timeline and evidence threshold before PayRep/Settlla arbitrates or releases funds?
2. **Tenant ID Verification API Provider (FR-11 — Should)**: Which identity verification vendor (e.g., Prembly/Identitypass, Dojah, or Smile ID) provides the most cost-effective NIN and phone lookup for incoming NYSC/corporate tenants in northern Nigeria?
3. **SMS Gateway Provider (FR-02, FR-07, FR-10 — Must/Should)**: Which SMS delivery service (Termii vs. Twilio) has the highest delivery rate across Kaduna telecom networks (MTN, Airtel, Glo) for time-sensitive move-in alerts and 24-hour countdown reminders?
