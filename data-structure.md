# Settlla — Data Structure (Information Model)
## Everything the Platform Must Remember (MVP Build)

- **Product Name**: Settlla
- **Core Model**: The Digital Rental Closing Engine
- **Reference Spec**: [requirements.md](file:///c:/Users/User/OneDrive/Desktop/SETTLLA-STARTUP/requirements.md)
- **User Flow Reference**: [user-flow.md](file:///c:/Users/User/OneDrive/Desktop/SETTLLA-STARTUP/user-flow.md)
- **Sequence Diagram Reference**: [sequence-diagram.md](file:///c:/Users/User/OneDrive/Desktop/SETTLLA-STARTUP/sequence-diagram.md)
- **Date**: 2026-09-15

---

## Overview: The 10 "Things" Settlla Remembers

To deliver zero-fee inspections, dynamic legal agreements, 4-way split payments, and key-in-door escrow protection without running an unlicensed bank, Settlla needs to store and track 10 core things:

```
[1. User Account]
       │
       ├──> [2. Property Manager Profile] ──> [3. Property Listing]
       │                                             │
       │                                             ├──> [4. Visiting Window]
       │                                             │           │
       │                                             │           └──> [5. Inspection Booking]
       │                                             │
       └──> [6. Tenancy Agreement] <─────────────────┘
                   │
                   └──> [7. Payment Transaction]
                               │
                               ├──> [8. Escrow Hold] <──> [9. Move-In Dispute]
                               │
                               └──> [10. Caution Deposit Ledger]
```

---

## 1. User Account
**What it represents in plain English:** A person registered on Settlla (the tenant looking for a home, the property manager listing apartments, or a Settlla administrator). Note: Landlords do not have accounts; their information is stored directly on the property listing.

| Field / Fact | What It Stores | Format / Example | Why the System Needs It |
| :--- | :--- | :--- | :--- |
| `user_id` | Unique ID number | Number / Code (`usr_101`) | Uniquely identifies the person across all transactions. |
| `full_name` | First and last name | Text (`"Hajara Bello"`) | Used on legal tenancy contracts and official receipts. |
| `phone_number` | Nigerian mobile phone number | Text (`"08031234567"`) | For sending SMS inspection alerts, move-in reminders, and payment receipts. |
| `email_address` | Contact email address | Text (`"hajara@example.com"`) | For sending executed lease PDF copies and login links. |
| `user_role` | Type of user | Option: `tenant`, `manager`, `admin` | Controls what screens and actions the user is allowed to access. |
| `nin_number` | National Identity Number | 11 digits (`"12345678901"`) | Verifies tenant identity to protect landlords from fraud. |
| `nin_verified` | Whether identity is confirmed | Yes / No (`true` / `false`) | Blocks lease generation until tenant ID is validated. |
| `employer_name` | Company or NYSC deployment | Text (`"GTBank Barnawa"`) | Proves financial stability and relocation legitimacy. |
| `employment_proof_url` | Photo of job letter or posting letter | Link / File path | Verifies that the tenant has income or corporate backing. |
| `date_created` | Exact date & time joined | Timestamp (`2026-09-15 08:30:00`) | Tracks account age and onboarding history. |

---

## 2. Property Manager Profile
**What it represents in plain English:** The accredited real estate firm or legal practitioner (such as HB&A Partners) authorized to manage properties and sign leases under written landlord mandates.

| Field / Fact | What It Stores | Format / Example | Why the System Needs It |
| :--- | :--- | :--- | :--- |
| `manager_id` | Unique manager profile ID | Number / Code (`mgr_201`) | Distinguishes this firm from others. |
| `user_id` | Linked User Account | Number / Code (`usr_102`) | Connects this management profile to their login account. |
| `firm_name` | Registered business or law firm name | Text (`"HB&A Partners & Co."`) | Appears on the tenancy agreement as the legal attorney-in-fact. |
| `accreditation_type` | Professional body registration | Text (`"NBA Kaduna Branch"`, `"ESVARBON"`) | Proves the manager is a licensed professional, not a roadside street agent. |
| `office_address` | Physical business address in Kaduna | Text (`"Plot 14, Barnawa Road, Kaduna"`) | Legal notice address on contracts; builds trust with tenants. |
| `bank_name` | Bank name for commission payouts | Text (`"Stanbic IBTC"`) | Destination bank for their 10% agency management fee. |
| `bank_account_number`| 10-digit NUBAN account number | 10 digits (`"0123456789"`) | Used by the payment gateway to automatically send their fee. |
| `bank_account_name` | Verified account name at the bank | Text (`"HB&A Partners Legal"`) | Validated to ensure fees don't get routed to the wrong person. |
| `subaccount_code` | Payment gateway sub-account ID | Code (`"ACCT_mp72kd90"`) | The exact routing code used by Paystack/Monnify for automated splits. |
| `verification_status`| Vetting status by Settlla team | Option: `pending`, `verified`, `suspended` | Only `verified` managers can publish properties on the site. |

---

## 3. Property Listing
**What it represents in plain English:** A residential rental apartment in Kaduna (e.g. Barnawa or Malali) that has been inspected and vetted.

| Field / Fact | What It Stores | Format / Example | Why the System Needs It |
| :--- | :--- | :--- | :--- |
| `listing_id` | Unique listing ID | Number / Code (`prop_301`) | Identifies this specific apartment. |
| `manager_id` | The manager handling this property | Number / Code (`mgr_201`) | Connects the apartment to the manager who will conduct tours and sign leases. |
| `title` | Public listing headline | Text (`"Spacious 1-Bedroom Flat"`) | Shown at the top of the apartment page. |
| `neighborhood` | Neighborhood / District | Text (`"Barnawa"`, `"Malali"`) | Enables tenants to filter apartments near their workplace. |
| `full_address` | Exact physical street address | Text (`"12 Coronation Crescent, Barnawa"`) | Sent in SMS to confirmed tenants for inspection; used in legal lease. |
| `landlord_name` | Full legal name of property owner | Text (`"Alhaji Sani Bello"`) | Written into the tenancy contract as the Property Owner / Landlord. |
| `landlord_phone` | Landlord's phone number | Text (`"08023456789"`) | For sending automated SMS payout notifications when rent is secured. |
| `landlord_bank_name`| Landlord's bank | Text (`"First Bank of Nigeria"`) | Destination bank for the annual rent payout. |
| `landlord_account_num`| Landlord's 10-digit account number | 10 digits (`"2019876543"`) | The bank account where the rent will be transferred upon move-in. |
| `mandate_doc_url` | Scan of signed landlord management mandate | Link / File path | Proves the manager has legal authority to list and lease this unit. |
| `mandate_verified` | Whether Settlla verified the mandate | Yes / No (`true` / `false`) | **CRITICAL:** The apartment CANNOT be published if this is false. |
| `annual_rent_amount` | Yearly base rent in Naira | Currency (`₦500,000`) | The primary rental fee due to the landlord. |
| `caution_fee_amount` | Refundable damage deposit (10%) | Currency (`₦50,000`) | Held safely for 12 months in the caution vault. |
| `legal_fee_amount` | Legal lease drafting fee (5%) | Currency (`₦25,000`) | Paid directly to the lawyer drafting the agreement. |
| `agency_fee_amount` | Property management commission (10%) | Currency (`₦50,000`) | Paid directly to HB&A Partners upon checkout. |
| `total_move_in_cost` | Complete sum needed to move in | Currency (`₦625,000`) | **Total transparency:** Sum of all 4 fees shown upfront (no hidden costs). |
| `bedrooms` | Number of bedrooms | Number (`1`) | For search filtering. |
| `bathrooms` | Number of bathrooms | Number (`1`) | For search filtering. |
| `amenities_list` | Special features of the apartment | List (`"Borehole Water"`, `"Prepaid Meter"`, `"Security Gate"`) | Informs the tenant what facilities exist. |
| `photo_urls` | Verified apartment photos | List of links | Displays accurate visual proof of the actual unit. |
| `listing_status` | Current availability | Option: `draft`, `published`, `reserved`, `rented` | Ensures rented or pending apartments don't accept new bookings. |

---

## 4. Visiting Window
**What it represents in plain English:** The recurring days and hours when a property manager is physically available to show apartments (e.g. Saturdays 10 AM – 3 PM).

| Field / Fact | What It Stores | Format / Example | Why the System Needs It |
| :--- | :--- | :--- | :--- |
| `window_id` | Unique visiting window ID | Number / Code (`win_401`) | Identifies this availability schedule. |
| `manager_id` | Manager who owns this schedule | Number / Code (`mgr_201`) | Connects availability to the specific property manager. |
| `day_of_week` | Day of the week | Text (`"Saturday"`, `"Tuesday"`, `"Thursday"`) | Restricts tenant bookings to days the manager is on-site. |
| `start_time` | Opening visiting hour | Time (`"10:00:00"`) | The earliest inspection time allowed. |
| `end_time` | Closing visiting hour | Time (`"15:00:00"`) | The latest inspection time allowed. |
| `slot_minutes` | Length of each inspection | Number (`30`) | Fixed 30-minute intervals per tenant to prevent overlap. |
| `is_active` | Whether this window is currently active | Yes / No (`true` / `false`) | Allows managers to pause viewings during holidays or repairs. |

---

## 5. Inspection Booking
**What it represents in plain English:** A confirmed 30-minute appointment made by a tenant to tour an apartment in person at zero cost.

| Field / Fact | What It Stores | Format / Example | Why the System Needs It |
| :--- | :--- | :--- | :--- |
| `booking_id` | Unique booking ID | Number / Code (`bk_501`) | Tracks this specific viewing appointment. |
| `listing_id` | Apartment being inspected | Number / Code (`prop_301`) | Links the appointment to the property. |
| `tenant_name` | Name of prospective tenant | Text (`"Hajara Bello"`) | Gives the property manager the visitor's name for gate access. |
| `tenant_phone` | Mobile number of tenant | Text (`"08031234567"`) | For sending appointment reminders and meeting directions. |
| `slot_timestamp` | Scheduled date and time | Date & Time (`2026-09-19 11:30:00`) | Reserves this exact 30-minute window and blocks others from taking it. |
| `inspection_fee` | Cost charged for the tour | Currency (`₦0`) | Explicit record proving Settlla inspections are completely free. |
| `booking_status` | Status of appointment | Option: `confirmed`, `completed`, `cancelled`, `no_show` | Tracks manager attendance and tenant follow-through. |

---

## 6. Tenancy Agreement
**What it represents in plain English:** The legally binding lease agreement generated automatically by Settlla, signed digitally by the tenant and counter-signed by the manager under mandate.

| Field / Fact | What It Stores | Format / Example | Why the System Needs It |
| :--- | :--- | :--- | :--- |
| `agreement_id` | Unique agreement ID | Number / Code (`agr_601`) | Identifies this formal legal contract. |
| `listing_id` | Leased property | Number / Code (`prop_301`) | Links contract to property specifications and address. |
| `tenant_id` | Tenant leasing the property | Number / Code (`usr_101`) | Links contract to the verified tenant profile. |
| `manager_id` | Manager signing as attorney-in-fact | Number / Code (`mgr_201`) | Links to the legal representative executing the lease. |
| `lease_start_date`| Official commencement date | Date (`2026-10-01`) | Date the tenant takes possession and lease starts. |
| `lease_end_date` | Official expiration date (12 months) | Date (`2027-09-30`) | Date the 1-year lease concludes. |
| `contract_text` | Full legal contract wording | Markdown / HTML text | Complete legal agreement text incorporating Kaduna tenancy laws. |
| `tenant_signature`| Digital signature of tenant | Image / Vector string | Proof of tenant's informed consent and legal agreement. |
| `tenant_signed_at`| Exact timestamp tenant signed | Timestamp (`2026-09-20 14:15:22`) | Cryptographic audit trail for legal enforceability. |
| `manager_signature`| Digital signature of manager | Image / Vector string | Proof of property manager's execution on landlord's behalf. |
| `manager_signed_at`| Exact timestamp manager signed | Timestamp (`2026-09-20 16:30:10`) | Legal counter-signature timestamp. |
| `signed_pdf_url` | Downloadable final PDF contract | Link / File path | Secure PDF copy sent to tenant, manager, and landlord records. |
| `agreement_status`| Status of lease execution | Option: `draft`, `tenant_signed`, `fully_executed`, `terminated` | Prevents payment checkout until both parties have signed. |

---

## 7. Payment Transaction
**What it represents in plain English:** The record of the single move-in checkout payment made by the tenant through Paystack or Monnify, and how it was divided.

| Field / Fact | What It Stores | Format / Example | Why the System Needs It |
| :--- | :--- | :--- | :--- |
| `transaction_id` | Unique transaction ID | Number / Code (`tx_701`) | Identifies this financial event. |
| `agreement_id` | Tenancy agreement being paid for | Number / Code (`agr_601`) | Links payment to the signed legal lease. |
| `total_amount_paid`| Total money debited from tenant | Currency (`₦625,000`) | Total move-in payment collected at checkout. |
| `payment_gateway` | Processor handling the charge | Text (`"Paystack"`, `"Monnify"`) | Specifies the payment infrastructure provider used. |
| `gateway_ref` | Processor's reference code | Code (`"T89234812398"`) | Unique lookup code to verify transaction on the payment gateway. |
| `payment_channel` | How the tenant paid | Option: `card`, `bank_transfer`, `ussd` | Helpful for troubleshooting payment issues. |
| `legal_fee_cut` | Legal drafting share (5%) | Currency (`₦25,000`) | Automatically routed to the lawyer's bank account. |
| `agency_fee_cut` | Agency commission share (10%) | Currency (`₦50,000`) | Automatically routed to HB&A Partners' bank account. |
| `caution_fee_cut`| Caution deposit share (10%) | Currency (`₦50,000`) | Routed to the ringfenced merchant reserve / PayRep holding vault. |
| `rent_escrow_cut` | Annual rent share (75%) | Currency (`₦500,000`) | Held in escrow until the tenant confirms key handover. |
| `payment_status` | Status of payment | Option: `pending`, `successful`, `failed`, `refunded` | Guarantees funds are 100% cleared before key handover is scheduled. |
| `paid_at` | Timestamp payment cleared | Timestamp (`2026-09-21 10:05:40`) | Exact time funds settled. |

---

## 8. Escrow Hold
**What it represents in plain English:** The temporary safe-deposit container that holds the annual rent payment until move-in day, backed by the 100% scam indemnity guarantee.

| Field / Fact | What It Stores | Format / Example | Why the System Needs It |
| :--- | :--- | :--- | :--- |
| `escrow_id` | Unique escrow record ID | Number / Code (`esc_801`) | Tracks this specific rent holding account. |
| `transaction_id` | Linked payment transaction | Number / Code (`tx_701`) | Connects the escrow hold to the original checkout payment. |
| `landlord_bank_name`| Landlord bank name | Text (`"First Bank of Nigeria"`) | Destination bank where rent will disburse upon release. |
| `landlord_account_num`| Landlord NUBAN account number | 10 digits (`"2019876543"`) | Account number for rent transfer. |
| `amount_held` | Exact rent amount in escrow | Currency (`₦500,000`) | The amount protected until key handover. |
| `scheduled_move_in`| Promised move-in date & time | Date & Time (`2026-10-01 10:00:00`) | The date the tenant is scheduled to receive keys. |
| `auto_release_at` | Automatic safety release deadline | Date & Time (`2026-10-02 10:00:00`) | **Scheduled Move-in + 24 hours:** Automatically releases rent if tenant forgets to confirm and no dispute is filed. |
| `confirmed_by_tenant`| Did tenant confirm key handover | Yes / No (`true` / `false`) | Records whether the tenant clicked "Confirm Key Handover". |
| `confirmed_at` | Exact time tenant tapped confirm | Timestamp (`2026-10-01 11:20:15`) | Audit timestamp for the release trigger. |
| `escrow_status` | Current state of held rent | Option: `holding`, `released`, `disputed_frozen`, `refunded` | Controls whether funds can disburse or are blocked. |
| `release_reason` | How payout was approved | Option: `tenant_button`, `auto_timer_24h`, `admin_override` | Explains why the money was released to the landlord. |
| `disbursement_ref` | Gateway transfer reference code | Code (`"TRF_78291038"`) | Proof of successful electronic bank transfer to landlord. |

---

## 9. Move-In Dispute
**What it represents in plain English:** An emergency incident report filed by the tenant before the 24-hour timer expires if keys fail, access is denied, or the apartment is occupied by someone else.

| Field / Fact | What It Stores | Format / Example | Why the System Needs It |
| :--- | :--- | :--- | :--- |
| `dispute_id` | Unique dispute case ID | Number / Code (`dsp_901`) | Tracks this emergency investigation. |
| `escrow_id` | Linked escrow hold | Number / Code (`esc_801`) | Identifies which rent payment must be frozen immediately. |
| `tenant_id` | Tenant reporting the issue | Number / Code (`usr_101`) | The tenant requesting emergency intervention. |
| `issue_category` | Nature of the failure | Option: `key_failure`, `access_denied`, `property_misrepresentation`, `unauthorized_occupants` | Classifies the problem for rapid triage. |
| `description` | Tenant's written explanation | Text (`"Keys did not open the front door deadbolt, landlord out of reach."`) | Explains what happened on-site. |
| `evidence_urls` | Photos or video proof | List of image/video links | Visual proof of the lock failure or access obstruction. |
| `date_logged` | Exact time dispute was submitted | Timestamp (`2026-10-01 12:45:00`) | **CRITICAL:** Instantly pauses the 24-hour auto-release countdown. |
| `dispute_status` | State of the case | Option: `open_frozen`, `investigating`, `resolved_refunded`, `resolved_cleared` | Tracks case progress. |
| `admin_verdict` | Final determination by Settlla | Option: `fault_landlord`, `fault_manager`, `false_alarm` | Records outcome of the 2-hour concierge investigation. |
| `refund_reference`| Payment refund reference code | Code (`"REF_91823719"`) | Proof of 100% money-back refund under Scam Indemnity Guarantee. |

---

## 10. Caution Deposit Ledger
**What it represents in plain English:** The long-term record that tracks the tenant's damage deposit parked safely in the merchant reserve or PayRep holding vault for the full 12-month lease.

| Field / Fact | What It Stores | Format / Example | Why the System Needs It |
| :--- | :--- | :--- | :--- |
| `caution_id` | Unique caution record ID | Number / Code (`ctn_1001`) | Tracks this specific tenancy's damage deposit. |
| `agreement_id` | Linked tenancy agreement | Number / Code (`agr_601`) | Connects caution fee to the exact lease contract. |
| `tenant_id` | Tenant who paid the caution | Number / Code (`usr_101`) | The owner of the deposit who is entitled to refund upon move-out. |
| `amount_held` | Amount of caution held in vault | Currency (`₦50,000`) | The exact sum locked in non-custodial holding. |
| `vault_platform` | Where money is safely stored | Option: `merchant_reserve`, `payrep` | The licensed infrastructure holding the funds away from the landlord. |
| `vault_account_ref`| Account or ledger reference ID | Code (`"PR_VAULT_5521"`) | Lookup ID for the held balance. |
| `lease_end_date` | Date caution becomes eligible for refund | Date (`2027-09-30`) | When the 12-month lease expires and exit inspection can take place. |
| `ledger_status` | Status of deposit | Option: `ringfenced_active`, `reconciled_refunded`, `deducted_for_damages` | Guarantees the landlord cannot spend this money during the lease. |
| `refunded_amount` | Amount returned to tenant at exit | Currency (`₦50,000`) | How much the tenant received back at move-out. |

---

## Summary of How the 10 Things Relate

```
1. USER (Tenant: Hajara) 
   ──> Books [5. INSPECTION BOOKING] for [3. PROPERTY LISTING]
   ──> Signs [6. TENANCY AGREEMENT] with [2. PROPERTY MANAGER] (under Mandate)
   ──> Pays [7. PAYMENT TRANSACTION] via Split Gateway
         ├──> Routes rent to [8. ESCROW HOLD] 
         │        └──> If keys fail: triggers [9. MOVE-IN DISPUTE] & 100% refund
         │        └──> If keys work: disburses directly to Landlord bank
         └──> Routes caution to [10. CAUTION DEPOSIT LEDGER] for 12 months
```
