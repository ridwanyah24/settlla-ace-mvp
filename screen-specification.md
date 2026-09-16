# Settlla Screen Specification

This MVP specification consolidates the end-to-end tenant journey and the essential manager action into eight screens.

## 1. Verified Listings

**Purpose:** Lets a tenant find a vetted apartment that matches her budget, location, and commute needs.

**Elements (top to bottom, left to right):**

1. Settlla logo and navigation/account entry.
2. Location, budget, and property-type filters.
3. Neighborhood and commute-context chips (for example, Barnawa, Malali, and “5 mins to GTBank Barnawa”).
4. Verified listing feed; each card contains a verified badge, property photo, apartment type/location, amenities, annual rent, caution deposit, management fee, legal fee, all-in move-in total, and availability status.

**Interactions:**

- Selecting a filter updates the listing feed.
- Tapping a listing card opens **Listing Detail & Inspection Booking**.
- Tapping account opens the tenant dashboard/sign-in entry point.

## 2. Listing Detail & Inspection Booking

**Purpose:** Lets a tenant inspect a verified apartment and reserve a free 30-minute physical-tour slot.

**Elements (top to bottom, left to right):**

1. Back control, verified badge, listing title, location, and image gallery.
2. Amenities, property details, commute context, and full fee breakdown including all-in move-in total.
3. “Book Free Inspection” button.
4. Booking drawer (after opening): selected property summary, recurring manager visiting windows, date selector, available 30-minute time slots, and selected-slot summary.
5. “Continue” button.

**Interactions:**

- Gallery controls browse verified photos.
- “Book Free Inspection” opens the booking drawer.
- Selecting a date/window reveals valid available slots; selecting a slot enables “Continue.”
- “Continue” opens **Inspection Registration & Confirmation** with the slot held temporarily.

## 3. Inspection Registration & Confirmation

**Purpose:** Lets a tenant provide contact details and confirm a ₦0 inspection booking.

**Elements (top to bottom, left to right):**

1. Back control and booking progress indicator.
2. Property, address/directions, manager contact, and chosen date/time summary.
3. Full-name, mobile-number, and email input fields.
4. “Confirm Inspection — ₦0” button.
5. Confirmation state: booking reference, tour details, directions, manager contact, notification note, and “View My Booking” button.

**Interactions:**

- Input validation keeps the confirmation button disabled until valid details are entered.
- “Confirm Inspection — ₦0” locks the selected slot, sends SMS/WhatsApp confirmation to the tenant and an alert to the manager, then shows the confirmation state.
- “View My Booking” opens the tenant dashboard; after the physical tour, its property action becomes “Proceed to Rent This Property,” leading to **Rental Application & Verification**.

## 4. Rental Application & Verification

**Purpose:** Lets a tenant submit the identity and supporting information required to prepare a lease.

**Elements (top to bottom, left to right):**

1. Back control, property summary, and application progress indicator.
2. Current residential-address fields.
3. Emergency-contact name, relationship, and phone-number fields.
4. Government-ID/NIN-slip upload field with upload status.
5. Employment-proof/NYSC-deployment-letter upload field with upload status.
6. Consent/accuracy checkbox.
7. “Submit & Generate Agreement” button.

**Interactions:**

- Upload controls accept and preview the required documents.
- The submit button validates required fields, marks tenant verification complete, and generates the lease.
- On success, it opens **Lease Review & Tenant Signature**.

## 5. Lease Review & Tenant Signature

**Purpose:** Lets a tenant read the auto-generated tenancy agreement and sign it digitally.

**Elements (top to bottom, left to right):**

1. Back control, agreement title, property summary, and status badge.
2. Scrollable agreement viewer containing tenant and landlord details, title reference, 12-month dates, fee schedule, statutory covenants, and manager mandate/signatory clause.
3. Download/expand agreement control.
4. Legal-name text field and signature pad with clear control.
5. Acceptance checkbox.
6. “Sign & Accept Agreement” button.
7. Signed-pending-manager state with audit timestamp and next-step explanation.

**Interactions:**

- Agreement controls let the tenant read and download the draft.
- The signature pad records the tenant signature; clear removes it.
- “Sign & Accept Agreement” timestamps and hashes the signature, updates the audit log, notifies the manager, and shows the pending-counter-sign state.
- When the manager signs, the tenant is notified and the dashboard action opens **Secure Checkout & Move-In Pass**.

## 6. Manager Lease Counter-Signature

**Purpose:** Lets an accredited property manager verify the tenant documents and execute the lease under the landlord mandate.

**Elements (top to bottom, left to right):**

1. Manager portal header and notification/task indicator.
2. Tenant, property, and agreement-status summary.
3. Tenant ID and employment-document viewers with verification status.
4. Landlord mandate reference/document viewer.
5. Agreement viewer and signing audit trail.
6. Manager legal-name/signature control and authority attestation checkbox.
7. “Counter-Sign Under Mandate” button.
8. Completion state with final-contract download and reserved status.

**Interactions:**

- Document viewers open the tenant credentials and landlord mandate for review.
- “Counter-Sign Under Mandate” requires the authority attestation, applies the digital signature, creates the dual-signed PDF for both dashboards, and changes the apartment to “Reserved — Awaiting Checkout.”
- The action notifies the tenant and enables checkout.

## 7. Secure Checkout & Move-In Pass

**Purpose:** Lets a tenant pay the all-in move-in amount through escrow and receive proof that key handover can proceed.

**Elements (top to bottom, left to right):**

1. Header with reserved-property summary and signed-lease download.
2. Move-in cost breakdown: annual rent, caution deposit, legal fee, management fee, and total due.
3. Escrow-protection explainer showing rent release only after key handover and caution held for the tenancy.
4. “Pay Securely via Escrow” button.
5. Gateway panel/modal: debit-card, bank-transfer, and USSD payment options.
6. Payment-success state: receipt, Move-In Pass, scheduled move-in date, key-handover instructions, and “Go to Move-In Dashboard” button.

**Interactions:**

- “Pay Securely via Escrow” opens the payment gateway.
- Choosing a payment method starts the selected Paystack/Monnify payment flow.
- A successful payment routes legal and management fees, ringfences caution, locks rent in move-in escrow, sends receipts/notifications, and displays the Move-In Pass.
- “Go to Move-In Dashboard” opens **Move-In, Escrow & Tenancy Status**.

## 8. Move-In, Escrow & Tenancy Status

**Purpose:** Lets a tenant confirm successful key handover or report a move-in problem before escrow is released.

**Elements (top to bottom, left to right):**

1. Header with property summary, Move-In Pass, lease download, and tenancy/escrow status badge.
2. Move-in-day instructions, manager contact, scheduled time, and 24-hour safety-timer status.
3. Escrow summary: rent held/released state, caution-deposit vault state, and payment receipt.
4. Primary “Confirm Key Handover” button.
5. Secondary “Report a Problem” button.
6. Problem-report panel (after opening): issue category, description field, photo upload, refund/escrow-freeze notice, and “Submit Report” button.
7. Completion state: “Completed & Settled,” landlord-rent release confirmation, active-tenancy dates, and caution-deposit ringfenced notice.

**Interactions:**

- “Confirm Key Handover” immediately releases rent escrow to the verified landlord account and updates the status to completed and settled.
- If no report is submitted, the safety timer automatically releases rent 24 hours after the scheduled move-in time.
- “Report a Problem” opens the evidence form and pauses the safety timer.
- “Submit Report” freezes escrow, submits evidence to Settlla operations and the manager, and begins resolution or eligible rent-and-caution refund handling.
