# Settlla — End-to-End User Flow
## The Digital Rental Closing Engine (MVP Build)

- **Target User**: Primary Demand ICP — The Relocating Professional ("Hajara")
- **Primary Goal**: Secure a verified apartment in Kaduna, execute a legally binding lease, and move in safely without extortion or scam risks.
- **Reference Spec**: [requirements.md](file:///c:/Users/User/OneDrive/Desktop/SETTLLA-STARTUP/requirements.md)
- **Date**: 2026-09-15

---

## Overview of the Core Journey

The Settlla closing engine orchestrates a seamless handoff between an incoming tenant, an accredited property manager, and an absentee landlord across four distinct phases:

1. **Discovery & Zero-Fee Booking** (Steps 1–4)
2. **Legal Lease Execution** (Steps 5–8)
3. **Checkout & 4-Way Automated Payment Split** (Step 9)
4. **Key Handover & Escrow Clearance** (Steps 10–12)

```
[ Step 1: Browse Listings ] ──> [ Step 2: Select 30-Min Window ] ──> [ Step 3: Confirm Booking (₦0) ]
                                                                                │
[ Step 6: Auto-Generate Lease ] <── [ Step 5: Start Application & ID ] <── [ Step 4: Physical Tour ]
       │
       └──> [ Step 7: Tenant E-Signs ] ──> [ Step 8: Manager Counter-Signs under Mandate ]
                                                          │
[ Step 11: Escrow Release (Button or 24h) ] <── [ Step 10: Key Handover ] <── [ Step 9: 4-Way Split Pay ]
       │
       └──> [ Step 12: Tenancy Active & Caution Safe ]
```

---

## Primary User Flow: The Tenant's Journey to Move-In

### Phase 1: Search & Free Inspection Scheduling

#### Step 1: Browse Verified Listings
- **Actor**: Tenant ("Hajara")
- **User Action**: Hajara lands on the Settlla web application on her mobile phone or browser.
- **System Presentation**: The home feed displays vetted residential properties in target Kaduna neighborhoods (Barnawa and Malali). Each listing card clearly displays:
  - Total annual rent
  - Caution deposit (10% standard)
  - Agency/management fee
  - Legal agreement fee
  - **All-in move-in total** (zero hidden fees)
  - High-resolution verified photos, amenities, and commute context (e.g., "5 mins to GTBank Barnawa").
- **Goal**: Identify an apartment that fits her budget (₦400,000–₦800,000) and commute constraints.

#### Step 2: Select Inspection Visiting Window
- **Actor**: Tenant ("Hajara")
- **User Action**: Hajara taps on a verified 1-bedroom apartment in Barnawa and clicks **"Book Free Inspection"**.
- **System Presentation**: An interactive booking drawer displays only the recurring visiting windows pre-set by the property manager (e.g., Tuesdays/Thursdays 2:00 PM – 5:00 PM, Saturdays 10:00 AM – 3:00 PM).
- **User Action**: Hajara selects an open 30-minute interval (e.g., Saturday at 11:30 AM).

#### Step 3: Register & Confirm Inspection
- **Actor**: Tenant ("Hajara") & Settlla Engine
- **User Action**: Hajara enters her full name, mobile number, and email address, then clicks **"Confirm Inspection"**.
- **System Action**:
  - The system locks the 30-minute interval to prevent double-booking.
  - Sends an instant SMS and WhatsApp confirmation to Hajara with the property address, directions, and the property manager's contact details.
  - Dispatches an automated SMS alert to HB&A Partners notifying them of the booked walkthrough.
  - **Fee Charged**: **₦0** (Eliminates the standard ₦3,000–₦5,000 roadside agent inspection fee).

#### Step 4: Attend Physical Walkthrough
- **Actors**: Tenant ("Hajara") & Property Manager ("HB&A Partners")
- **Real-World Interaction**: On Saturday morning, Hajara arrives at the Barnawa property. The property manager welcomes her and conducts a full in-person walkthrough of the flat, inspecting water running pressure, electricity meter, and security gates.
- **Outcome**: Hajara verifies that the physical apartment matches the online photos and chooses to take the property.

---

### Phase 2: Identity Verification & Lease Generation

#### Step 5: Initiate Rental Application & Upload Credentials
- **Actor**: Tenant ("Hajara")
- **User Action**: In her Settlla web dashboard, Hajara clicks **"Proceed to Rent This Property"**.
- **User Action**: She completes her tenant profile by providing:
  - Current residential address and emergency contact
  - Uploads a photo of her National Identity Number (NIN) slip or valid government ID
  - Uploads proof of employment / NYSC deployment letter to GTBank Barnawa.
- **System Action**: Marks her tenant verification status as complete and feeds her data into the agreement engine.

#### Step 6: Dynamic Tenancy Agreement Auto-Generation
- **Actor**: Settlla Engine
- **System Action**: Settlla's agreement generator automatically creates a standardized, legally binding Nigerian residential tenancy agreement governed by Kaduna State tenancy statutes.
- **Content Auto-Populated**:
  - Tenant legal name, ID details, and contact information
  - Landlord legal name and property title reference
  - 12-month lease tenure (commencement and expiration dates)
  - Detailed fee schedule: Rent, Caution fee, Legal fee, Management fee
  - Standard statutory covenants (maintenance responsibilities, quiet enjoyment, no unauthorized sub-letting)
  - Designated Signatory Clause: Formally designates HB&A Partners as the legal attorney-in-fact authorized to execute the lease under their written landlord mandate.
- **User Action**: Hajara reviews the complete agreement text directly on her mobile screen.

#### Step 7: Tenant Digital Signature
- **Actor**: Tenant ("Hajara")
- **User Action**: Hajara types her legal name and draws her signature in the digital signature pad, then taps **"Sign & Accept Agreement"**.
- **System Action**:
  - Cryptographically timestamps and hashes the signature into the agreement audit log.
  - Automatically notifies the property manager that the agreement is signed and ready for counter-signature.

#### Step 8: Manager Counter-Signature Under Mandate
- **Actor**: Property Manager ("HB&A Partners")
- **Manager Action**: The property manager receives an instant SMS/email notification with a direct access link.
- **Manager Action**: The manager opens their portal, inspects Hajara's verified ID/employment documents, and digitally counter-signs the lease agreement on behalf of the landlord under their existing written mandate.
- **System Action**:
  - Generates the final, dual-signed PDF contract and stores it in both users' dashboards.
  - Updates the apartment status to **"Reserved — Awaiting Checkout"**.

---

### Phase 3: Checkout & Automated 4-Way Payment Split

#### Step 9: Make All-in-One Payment via Secure Split Gateway
- **Actor**: Tenant ("Hajara") & Payment Gateway (Paystack/Monnify)
- **User Action**: Hajara views her final checkout summary showing the complete move-in cost breakdown. She clicks **"Pay Securely via Escrow"**.
- **System Presentation**: The Paystack/Monnify payment gateway opens, offering instant debit card payment, bank transfer, or USSD.
- **User Action**: Hajara executes the payment from her bank account (e.g., ₦650,000 total).
- **System Action (Real-Time 4-Way Split)**: Upon payment gateway confirmation, the payment engine automatically splits and routes the funds:
  1. **Legal Drafting Fee (5%)**: Disbursed directly into the legal drafter's bank account.
  2. **Agency/Management Commission (10%)**: Disbursed directly into HB&A Partners' bank account.
  3. **Caution Deposit (10%)**: Directed into a ringfenced merchant reserve / PayRep custody balance, isolated from landlord access for the 12-month tenure.
  4. **Annual Rent (75%)**: Locked into Settlla's Key-in-Door Move-In Escrow Protection.
- **Notifications**:
  - Hajara receives a digital payment receipt and a verifiable **Move-In Pass**.
  - Landlord receives an automated SMS: *"₦487,500 rent has been secured by corporate tenant Hajara for your Barnawa apartment. Funds will clear upon move-in key handover."*
  - Property manager receives confirmation to proceed with key handover.

---

### Phase 4: Move-In, Key Handover & Escrow Release

#### Step 10: Move-In Day & Physical Key Collection
- **Actors**: Tenant ("Hajara") & Property Manager ("HB&A Partners")
- **Real-World Interaction**: On her official move-in date, Hajara arrives at the property with her belongings. The property manager meets her at the doorstep, performs a final check, and hands over the apartment keys.

#### Step 11: Escrow Payout Trigger & Settlement
- **Actors**: Tenant ("Hajara") & Settlla Escrow Engine
- **User Action (Primary Path)**: Hajara checks the keys, confirms they unlock the apartment door, and taps **"Confirm Key Handover"** in her Settlla dashboard.
- **System Action**:
  - The escrow hold on the annual rent is immediately released.
  - The system triggers an instant bank transfer of the net annual rent directly to the landlord's verified bank account.
  - The landlord receives an instant bank credit alert.
  - The transaction status transitions to **"Completed & Settled"**.
- **Safety Timer Fallback (Secondary Path)**: If Hajara receives her keys but forgets to tap the confirmation button, a 24-hour safety timer automatically begins from her scheduled move-in time. If no dispute is filed via **"Report a Problem"**, the funds automatically release to the landlord after 24 hours.

#### Step 12: Tenancy Active & Caution Ringfenced
- **Outcome**:
  - Hajara is safely settled in her home on schedule.
  - She saved ₦5,000+ in arbitrary inspection fees and avoided roadside scams.
  - Her caution deposit remains securely locked in the ringfenced vault until move-out reconciliation at the end of the 12-month lease.

---

## Complementary Workflow: Property Manager Operational Flow

To facilitate Hajara's journey, the property manager (HB&A Partners) executes this streamlined parallel sequence:

| Step | Action | Description | Spec Mapping |
| :--- | :--- | :--- | :--- |
| **M-01** | **Manager Onboarding** | Property manager registers on Settlla and submits firm accreditation documents. | Founder Decision |
| **M-02** | **Upload Mandated Listing** | Manager enters property details, uploads photos, and **must upload a copy of the signed landlord management mandate**. | **FR-01** |
| **M-03** | **Set Fixed Visiting Windows** | Manager configures recurring weekly visiting hours (e.g., Tuesdays/Thursdays 2–5 PM, Saturdays 10 AM–3 PM). | **FR-02** |
| **M-04** | **Receive Inspection Notification** | Manager receives an instant SMS alert whenever a tenant books an open 30-minute slot. | **FR-02** |
| **M-05** | **Conduct Zero-Fee Walkthrough** | Manager hosts the in-person inspection at the apartment without charging fees. | **FR-02** |
| **M-06** | **Counter-Sign Lease under Mandate** | Manager reviews tenant ID and digitally signs the auto-generated lease on behalf of the landlord. | **FR-03, FR-04** |
| **M-07** | **Receive Instant Agency Fee** | Manager receives agency commission directly to their bank account immediately upon tenant checkout. | **FR-05** |
| **M-08** | **Hand Over Keys at Apartment** | Manager gives physical keys to tenant on move-in day; landlord rent clears upon tenant confirmation or 24-hour timer. | **FR-07** |

---

## Exception Flow: What Happens if There Is an Issue? ("Report a Problem")

If Hajara arrives on move-in day and discovers a serious failure (e.g., keys do not work, apartment has been occupied by someone else, or major plumbing/electrical damage):

1. **Tap "Report a Problem"**: In her Settlla dashboard, Hajara clicks **"Report a Problem"** before the 24-hour timer expires.
2. **Instant Escrow Freeze**: The platform instantly halts the escrow release; zero rent funds disburse to the landlord.
3. **Evidence Submission**: Hajara uploads photos and a brief description of the issue.
4. **Resolution or 100% Refund**: Settlla operations contacts HB&A Partners within 2 hours. If the issue cannot be resolved immediately, Hajara receives a 100% refund of her annual rent and caution deposit under Settlla's Scam Indemnity Guarantee.
