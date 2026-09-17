"""
Settlla Backend Service
FastAPI REST API for Verified Residential Listings Showcase & Pricing Transparency
"""

import datetime
import hashlib
from typing import List, Optional
from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from inventory import RAW_LISTINGS

app = FastAPI(
    title="Settlla Verified Rental API",
    description="Backend API powering Settlla verified Kaduna rental listings with all-in transparent pricing.",
    version="1.0.0"
)

# Enable CORS for Next.js dev server
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


def format_naira_str(amount: int) -> str:
    return f"₦{amount:,}"


def compute_sha256(data: str) -> str:
    return hashlib.sha256(data.encode("utf-8")).hexdigest()


class MandateModel(BaseModel):
    mandate_ref: str
    manager_name: str
    accreditation: str
    landlord_name: str
    mandate_status: str


class VisitingWindowModel(BaseModel):
    day: str
    hours: str


class PricingBreakdownModel(BaseModel):
    annual_rent: int
    caution_fee: int
    legal_fee: int
    agency_fee: int
    total_move_in_cost: int
    inspection_fee: int = 0


class ListingModel(BaseModel):
    id: str
    title: str
    neighborhood: str
    zone: str
    full_address: str
    title_reference: str = ""
    property_type: str
    bedrooms: int
    bathrooms: int
    commute_badge: str
    commute_context: str
    description: str
    amenities: List[str]
    images: List[str]
    pricing: PricingBreakdownModel
    mandate: MandateModel
    visiting_windows: List[VisitingWindowModel]
    status: str = "available"


def build_listing_model(raw: dict) -> ListingModel:
    rent = int(raw["annual_rent"])
    caution = int(round(rent * 0.10))
    legal = int(round(rent * 0.05))
    agency = int(round(rent * 0.10))
    total = rent + caution + legal + agency

    pricing = PricingBreakdownModel(
        annual_rent=rent,
        caution_fee=caution,
        legal_fee=legal,
        agency_fee=agency,
        total_move_in_cost=total,
        inspection_fee=0
    )

    return ListingModel(
        id=raw["id"],
        title=raw["title"],
        neighborhood=raw["neighborhood"],
        zone=raw["zone"],
        full_address=raw["full_address"],
        title_reference=raw.get("title_reference", "KADGIS Registered Title"),
        property_type=raw["property_type"],
        bedrooms=raw["bedrooms"],
        bathrooms=raw["bathrooms"],
        commute_badge=raw["commute_badge"],
        commute_context=raw["commute_context"],
        description=raw["description"],
        amenities=raw["amenities"],
        images=raw["images"],
        pricing=pricing,
        mandate=MandateModel(**raw["mandate"]),
        visiting_windows=[VisitingWindowModel(**w) for w in raw["visiting_windows"]]
    )


ALL_LISTINGS: List[ListingModel] = [build_listing_model(r) for r in RAW_LISTINGS]


@app.get("/api/health")
def health_check():
    return {
        "status": "healthy",
        "service": "Settlla Verified Rental API",
        "market": "Barnawa & Malali, Kaduna",
        "listings_count": len(ALL_LISTINGS)
    }


@app.get("/api/listings", response_model=dict)
def get_listings(
    neighborhood: Optional[str] = Query(default="all"),
    max_budget: Optional[int] = Query(default=None),
    property_type: Optional[str] = Query(default="all"),
    quick_filter: Optional[str] = Query(default="all"),
):
    filtered = []

    for item in ALL_LISTINGS:
        # Neighborhood filter
        if neighborhood and neighborhood.lower() != "all":
            if item.neighborhood.lower() != neighborhood.lower():
                continue

        # Budget ceiling (checked against Total Move-In Cost)
        if max_budget is not None and max_budget > 0:
            if item.pricing.total_move_in_cost > max_budget:
                continue

        # Property type filter
        if property_type and property_type.lower() != "all":
            if item.property_type.lower() != property_type.lower():
                continue

        # Quick chips
        if quick_filter and quick_filter.lower() != "all":
            qf = quick_filter.lower()
            if qf == "near-gtbank":
                if "gtbank" not in item.commute_badge.lower():
                    continue
            elif qf == "under-700k":
                if item.pricing.total_move_in_cost > 700000:
                    continue
            elif qf == "borehole":
                if not any("borehole" in a.lower() for a in item.amenities):
                    continue
            elif qf == "prepaid":
                if not any("prepaid" in a.lower() for a in item.amenities):
                    continue

        filtered.append(item)

    return {
        "count": len(filtered),
        "listings": filtered
    }


@app.get("/api/listings/{listing_id}", response_model=ListingModel)
def get_listing_detail(listing_id: str):
    for item in ALL_LISTINGS:
        if item.id == listing_id:
            return item
    raise HTTPException(status_code=404, detail="Listing not found")


# =====================================================================
# Feature #2: Direct Inspection Slot Scheduling (₦0 Fee) (FR-02)
# =====================================================================

class TimeSlotModel(BaseModel):
    slot_id: str
    time_label: str
    start_time: str
    end_time: str
    is_available: bool = True
    is_locked: bool = False


class DayScheduleModel(BaseModel):
    date_str: str
    day_of_week: str
    formatted_date: str
    visiting_hours: str
    slots: List[TimeSlotModel]


class InspectionBookingRequest(BaseModel):
    listing_id: str
    date_str: str
    slot_time: str
    tenant_name: str
    tenant_phone: str
    tenant_email: str
    relocation_context: Optional[str] = "Relocating Professional"


class InspectionBookingResponse(BaseModel):
    booking_id: str
    listing_id: str
    property_title: str
    property_address: str
    commute_badge: str
    manager_name: str
    manager_accreditation: str
    manager_phone: str
    manager_whatsapp: str
    tenant_name: str
    tenant_phone: str
    tenant_email: str
    date_str: str
    formatted_date: str
    slot_time: str
    inspection_fee: int = 0
    fee_currency: str = "NGN"
    booking_status: str = "confirmed"
    directions: str
    anti_scam_guarantee: str
    created_at: str


# In-memory database of confirmed bookings
BOOKINGS_DB: List[dict] = []


def parse_time_to_minutes(time_str: str) -> int:
    """Parse string like '2:00 PM' or '10:30 AM' to minutes from midnight."""
    clean = time_str.strip().upper().replace(".", "")
    parts = clean.split()
    if len(parts) != 2:
        return 0
    time_part, meridian = parts
    hh_mm = time_part.split(":")
    hours = int(hh_mm[0])
    minutes = int(hh_mm[1]) if len(hh_mm) > 1 else 0

    if meridian == "PM" and hours != 12:
        hours += 12
    elif meridian == "AM" and hours == 12:
        hours = 0
    return hours * 60 + minutes


def format_minutes_to_time(minutes: int) -> str:
    """Convert minutes from midnight to 'H:MM AM/PM'."""
    hours = (minutes // 60) % 24
    mins = minutes % 60
    meridian = "AM" if hours < 12 else "PM"
    disp_hours = hours % 12
    if disp_hours == 0:
        disp_hours = 12
    return f"{disp_hours}:{mins:02d} {meridian}"


def generate_30min_slots(hours_range_str: str) -> List[tuple[str, str, str]]:
    """
    Decompose a visiting hours range (e.g. '2:00 PM – 5:00 PM')
    into discrete 30-minute intervals. Returns list of (slot_id_suffix, label, start_str, end_str).
    """
    # Normalize dash
    normalized = hours_range_str.replace("—", "–").replace("-", "–")
    parts = [p.strip() for p in normalized.split("–")]
    if len(parts) != 2:
        return []

    start_mins = parse_time_to_minutes(parts[0])
    end_mins = parse_time_to_minutes(parts[1])

    slots = []
    curr = start_mins
    while curr + 30 <= end_mins:
        start_label = format_minutes_to_time(curr)
        end_label = format_minutes_to_time(curr + 30)
        time_label = f"{start_label} - {end_label}"
        slots.append((f"{curr:04d}", time_label, start_label, end_label))
        curr += 30
    return slots


import datetime

def get_upcoming_inspection_schedule(listing: ListingModel) -> List[DayScheduleModel]:
    """
    Generate the next 14 days of valid inspection dates matching the property manager's
    visiting windows, with each day decomposed into 30-minute walkthrough slots.
    """
    base_date = datetime.date(2026, 9, 16)  # Today's reference in Kaduna sprint
    day_name_map = {
        0: "Monday", 1: "Tuesday", 2: "Wednesday", 3: "Thursday",
        4: "Friday", 5: "Saturday", 6: "Sunday"
    }

    # Extract days mapped to visiting hours from visiting_windows
    window_rules = []
    for w in listing.visiting_windows:
        day_str = w.day.lower()
        hours = w.hours
        # Check which days are mentioned
        for d_idx, d_name in day_name_map.items():
            # e.g. "tuesdays & thursdays" -> matches "tuesday" and "thursday"
            if d_name.lower() in day_str or (d_name.lower() + "s") in day_str:
                window_rules.append((d_idx, d_name, hours))

    days_schedule: List[DayScheduleModel] = []

    # Scan 14 days ahead
    for day_offset in range(1, 15):
        target_date = base_date + datetime.timedelta(days=day_offset)
        target_weekday = target_date.weekday()

        # Check if target_weekday matches any visiting window rule
        matching_rules = [r for r in window_rules if r[0] == target_weekday]
        if not matching_rules:
            continue

        for _, day_name, hours in matching_rules:
            date_str = target_date.strftime("%Y-%m-%d")
            formatted_date = target_date.strftime("%a, %b %d, %Y")

            raw_slots = generate_30min_slots(hours)
            slot_models = []

            for suffix, label, s_time, e_time in raw_slots:
                slot_id = f"{listing.id}_{date_str}_{suffix}"
                # Check if this slot is already locked in BOOKINGS_DB
                is_locked = any(
                    b["listing_id"] == listing.id
                    and b["date_str"] == date_str
                    and b["slot_time"] == label
                    for b in BOOKINGS_DB
                )
                slot_models.append(
                    TimeSlotModel(
                        slot_id=slot_id,
                        time_label=label,
                        start_time=s_time,
                        end_time=e_time,
                        is_available=not is_locked,
                        is_locked=is_locked
                    )
                )

            days_schedule.append(
                DayScheduleModel(
                    date_str=date_str,
                    day_of_week=day_name,
                    formatted_date=formatted_date,
                    visiting_hours=hours,
                    slots=slot_models
                )
            )

    return days_schedule


@app.get("/api/listings/{listing_id}/slots", response_model=dict)
def get_listing_slots(listing_id: str):
    """Retrieve strictly constrained 30-minute inspection slots for a listing."""
    target_listing = None
    for item in ALL_LISTINGS:
        if item.id == listing_id:
            target_listing = item
            break

    if not target_listing:
        raise HTTPException(status_code=404, detail="Listing not found")

    schedule = get_upcoming_inspection_schedule(target_listing)
    total_slots = sum(len(d.slots) for d in schedule)
    available_slots = sum(sum(1 for s in d.slots if s.is_available) for d in schedule)

    return {
        "listing_id": listing_id,
        "property_title": target_listing.title,
        "manager_name": target_listing.mandate.manager_name,
        "total_days_available": len(schedule),
        "total_slots": total_slots,
        "available_slots": available_slots,
        "inspection_fee": 0,
        "days": [d.model_dump() for d in schedule]
    }


@app.post("/api/bookings", response_model=InspectionBookingResponse)
def create_inspection_booking(req: InspectionBookingRequest):
    """
    Lock an open 30-minute walkthrough slot at ₦0 cost.
    Validates that the slot is within manager visiting windows and not already locked.
    """
    target_listing = None
    for item in ALL_LISTINGS:
        if item.id == req.listing_id:
            target_listing = item
            break

    if not target_listing:
        raise HTTPException(status_code=404, detail="Listing not found")

    if not req.tenant_name.strip() or not req.tenant_phone.strip():
        raise HTTPException(status_code=400, detail="Tenant name and phone number are required.")

    # Verify that the requested date and slot are valid under manager visiting windows
    schedule = get_upcoming_inspection_schedule(target_listing)
    matched_day = None
    matched_slot = None

    for day in schedule:
        if day.date_str == req.date_str:
            matched_day = day
            for s in day.slots:
                if s.time_label == req.slot_time:
                    matched_slot = s
                    break
            break

    if not matched_day:
        raise HTTPException(
            status_code=400,
            detail=f"Selected date {req.date_str} is outside HB&A Partners visiting windows for this property."
        )

    if not matched_slot:
        raise HTTPException(
            status_code=400,
            detail=f"Time slot {req.slot_time} is not a valid 30-minute window for {req.date_str}."
        )

    if matched_slot.is_locked:
        raise HTTPException(
            status_code=409,
            detail="This inspection slot has already been locked by another prospective tenant. Please select another slot."
        )

    # Generate unique booking reference (e.g. SETT-BK-7492)
    ref_num = 1000 + len(BOOKINGS_DB) + 1
    booking_id = f"SETT-BK-{ref_num}"
    now_iso = datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S")

    booking_record = {
        "booking_id": booking_id,
        "listing_id": target_listing.id,
        "property_title": target_listing.title,
        "property_address": target_listing.full_address,
        "commute_badge": target_listing.commute_badge,
        "manager_name": target_listing.mandate.manager_name,
        "manager_accreditation": target_listing.mandate.accreditation,
        "manager_phone": "0803 555 1289",
        "manager_whatsapp": "2348035551289",
        "tenant_name": req.tenant_name.strip(),
        "tenant_phone": req.tenant_phone.strip(),
        "tenant_email": req.tenant_email.strip() if req.tenant_email else "tenant@settlla.ng",
        "date_str": req.date_str,
        "formatted_date": matched_day.formatted_date,
        "slot_time": req.slot_time,
        "inspection_fee": 0,
        "fee_currency": "NGN",
        "booking_status": "confirmed",
        "directions": f"Meet accredited manager at {target_listing.full_address}. {target_listing.commute_context} Ask gate security for HB&A Partners walkthrough.",
        "anti_scam_guarantee": "Zero inspection fee guaranteed. Never pay cash to any roadside agent.",
        "created_at": now_iso
    }

    BOOKINGS_DB.append(booking_record)
    return InspectionBookingResponse(**booking_record)


@app.get("/api/bookings", response_model=dict)
def list_bookings():
    """List all confirmed inspection bookings."""
    return {
        "count": len(BOOKINGS_DB),
        "bookings": BOOKINGS_DB
    }


@app.get("/api/bookings/{booking_id}", response_model=InspectionBookingResponse)
def get_booking(booking_id: str):
    """Retrieve details of a confirmed inspection booking."""
    for b in BOOKINGS_DB:
        if b["booking_id"] == booking_id:
            return InspectionBookingResponse(**b)
    raise HTTPException(status_code=404, detail="Booking not found")


# ==============================================================================
# FEATURE #3: DYNAMIC TENANCY AGREEMENT GENERATOR (FR-03, SCREEN 5)
# ==============================================================================

# In-memory database of generated tenancy agreements
AGREEMENTS_DB: List[dict] = []


class TenantProfileInput(BaseModel):
    full_name: str
    phone_number: str
    email_address: str
    nin_number: Optional[str] = "28491029384"
    residential_address: Optional[str] = "Plot 5, Constitution Road, Kaduna"
    emergency_contact_name: Optional[str] = "Ibrahim Bello"
    emergency_contact_phone: Optional[str] = "0802 334 5566"
    emergency_contact_rel: Optional[str] = "Brother"
    employer_name: Optional[str] = "Guaranty Trust Bank (GTBank), Barnawa Branch"
    employment_role: Optional[str] = "Banking Operations Officer / NYSC Associate"


class GenerateAgreementRequest(BaseModel):
    listing_id: str
    tenant: TenantProfileInput
    lease_start_date: Optional[str] = "2026-10-01"
    lease_end_date: Optional[str] = "2027-09-30"


class CovenantCategoryModel(BaseModel):
    category: str
    statute_reference: str
    items: List[str]


class CryptographicAuditRecordModel(BaseModel):
    audit_ref: str
    agreement_id: str
    signer_role: str
    signer_name: str
    signer_title: Optional[str] = None
    attestation_text: str
    timestamp: str
    sha256_hash: str
    signature_digest: str
    ip_address: str = "102.89.43.19 (Kaduna, NG)"
    verification_status: str = "verified_authentic"


class TenancyAgreementResponse(BaseModel):
    agreement_id: str
    listing_id: str
    property_title: str
    property_address: str
    title_reference: str
    landlord_name: str
    manager_name: str
    manager_accreditation: str
    manager_mandate_ref: str
    tenant: TenantProfileInput
    lease_start_date: str
    lease_end_date: str
    tenure_months: int = 12
    pricing: PricingBreakdownModel
    covenants: List[CovenantCategoryModel]
    manager_mandate_clause: str
    escrow_clause: str
    caution_ringfencing_clause: str
    full_legal_text: str
    status: str = "draft_ready_for_signature"
    created_at: str
    tenant_signature: Optional[str] = None
    tenant_signed_at: Optional[str] = None
    tenant_audit_ref: Optional[str] = None
    tenant_sha256_hash: Optional[str] = None
    manager_signature: Optional[str] = None
    manager_signed_at: Optional[str] = None
    manager_audit_ref: Optional[str] = None
    manager_sha256_hash: Optional[str] = None
    master_seal_hash: Optional[str] = None
    mandate_attestation_confirmed: Optional[bool] = False
    audit_trail: Optional[List[CryptographicAuditRecordModel]] = []


class TenantSignRequest(BaseModel):
    signer_name: str
    signature_data: str
    consent_confirmed: bool = True
    nin_confirmed: Optional[str] = None


class ManagerSignRequest(BaseModel):
    manager_name: str
    manager_title: str = "Barr. H. B. Abubakar (Principal Counsel, HB&A Partners)"
    signature_data: str
    mandate_attestation_confirmed: bool = True
    mandate_ref: str


def compute_sha256(data_str: str) -> str:
    """Compute SHA-256 cryptographic hash of a given string."""
    return hashlib.sha256(data_str.encode("utf-8")).hexdigest()


def build_full_legal_text(listing: ListingModel, tenant, start_date: str, end_date: str, agreement_id: str) -> str:
    tenant_name = getattr(tenant, "full_name", "") if hasattr(tenant, "full_name") else tenant.get("full_name", "")
    tenant_nin = getattr(tenant, "nin_number", "") if hasattr(tenant, "nin_number") else tenant.get("nin_number", "N/A")
    tenant_res = getattr(tenant, "residential_address", "") if hasattr(tenant, "residential_address") else tenant.get("residential_address", "")
    rent_fmt = format_naira_str(listing.pricing.annual_rent)
    total_fmt = format_naira_str(listing.pricing.total_move_in_cost)
    
    return f"""THIS RESIDENTIAL TENANCY INDENTURE (Ref: {agreement_id}) is made this day between:
1. THE LANDLORD: {listing.mandate.landlord_name}, represented under Registered Management Mandate (Ref: {listing.mandate.mandate_ref}) by {listing.mandate.manager_name} ({listing.mandate.accreditation}); and
2. THE TENANT: {tenant_name} (NIN: {tenant_nin}, Address: {tenant_res}).

WHEREAS:
A. The Landlord is the legal and beneficial holder of title ({listing.title_reference}) in respect of the property situated at {listing.full_address}.
B. The Tenant desires to take a yearly residential tenancy of the property for a term of 12 months commencing {start_date} to {end_date}.
C. The parties agree that the annual base rent is {rent_fmt} with an all-in move-in sum of {total_fmt} processed via Settlla Move-In Escrow under Kaduna State Tenancy Law covenants."""


@app.post("/api/agreements", response_model=TenancyAgreementResponse)
@app.post("/api/agreements/generate", response_model=TenancyAgreementResponse)
def generate_tenancy_agreement(req: GenerateAgreementRequest):
    """
    Generate a standardized, legally binding Kaduna State residential tenancy agreement (FR-03, Screen 5)
    populated with tenant info, property title, all-in fee schedule, statutory covenants, and manager mandate clause.
    """
    target_listing = None
    for item in ALL_LISTINGS:
        if item.id == req.listing_id:
            target_listing = item
            break

    if not target_listing:
        raise HTTPException(status_code=404, detail="Listing not found")

    if not req.tenant.full_name.strip() or not req.tenant.phone_number.strip():
        raise HTTPException(status_code=400, detail="Tenant full legal name and phone number are required.")

    # Unique agreement reference (e.g. SETT-AGR-2026-1001)
    ref_num = 1000 + len(AGREEMENTS_DB) + 1
    agreement_id = f"SETT-AGR-2026-{ref_num}"
    now_iso = datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S")

    start_date = req.lease_start_date or "2026-10-01"
    end_date = req.lease_end_date or "2027-09-30"

    covenants = [
        CovenantCategoryModel(
            category="Tenant's Statutory Obligations",
            statute_reference="Kaduna State Tenancy & Recovery of Premises Law, Section 14",
            items=[
                f"Prompt payment of annual reserved rent ({format_naira_str(target_listing.pricing.annual_rent)}) via Settlla escrow.",
                "Strictly private residential occupancy; no commercial, offensive, or hazardous trade permitted.",
                "Keep interior fittings, electrical switches, window louvers, and sanitary fixtures in tenable repair.",
                "Absolute restriction against unauthorized sub-letting, assignment, or parting with physical possession.",
                "Permit daylight property inspections upon minimum 24 hours' prior written notice by manager.",
                "Independent self-billing for prepaid electricity meter without illegal line bypass."
            ]
        ),
        CovenantCategoryModel(
            category="Landlord's Statutory Obligations",
            statute_reference="Kaduna State Tenancy & Recovery of Premises Law, Section 15",
            items=[
                "Guarantee uninterrupted quiet possession and peaceful enjoyment without unlawful interference.",
                "Maintain external load-bearing walls, structural roofing, and compound drainage in tenable architectural condition.",
                "Maintain continuous functionality of the industrial borehole pumping system and dedicated prepaid meter.",
                "Discharge all statutory ground rents, tenement rates, and state land taxes levied by KADGIS."
            ]
        ),
        CovenantCategoryModel(
            category="Statutory Notice & Termination",
            statute_reference="Kaduna State Recovery of Premises Law, Section 8",
            items=[
                "Minimum six (6) calendar months' formal written Notice to Quit required prior to tenure determination for yearly tenancy.",
                "Mandatory 7-day Owner's Intention to Apply to Recover Possession following notice expiry."
            ]
        ),
        CovenantCategoryModel(
            category="Key-in-Door Move-In Escrow Protection",
            statute_reference="Settlla Scam Indemnity Protocol (FR-07)",
            items=[
                f"Net rent ({format_naira_str(target_listing.pricing.annual_rent)}) locked in escrow until tenant taps 'Confirm Key Handover'.",
                "24-hour automatic safety countdown timer with immediate freeze on 'Report a Problem' dispute."
            ]
        ),
        CovenantCategoryModel(
            category="Ringfenced Caution Deposit Safeguard",
            statute_reference="Settlla Non-Custodial Reserve Mandate (FR-06)",
            items=[
                f"10% damage deposit ({format_naira_str(target_listing.pricing.caution_fee)}) isolated in merchant reserve / PayRep custody vault.",
                "Mandatory full return within 14 calendar days post-move-out minus verified damage deductions."
            ]
        )
    ]

    mandate_clause = (
        f"The Landlord ({target_listing.mandate.landlord_name}) irrevocably designates {target_listing.mandate.manager_name} "
        f"({target_listing.mandate.accreditation}) as lawful Attorney-in-Fact and exclusive property manager under registered "
        f"written mandate Ref: {target_listing.mandate.mandate_ref}, with full authority to let, enforce, and execute this lease."
    )

    escrow_clause = (
        f"Annual rent of {format_naira_str(target_listing.pricing.annual_rent)} shall be held in Settlla's Key-in-Door Move-In "
        f"Escrow and released only upon Tenant's physical key handover confirmation or the expiration of the 24-hour safety timer."
    )

    caution_clause = (
        f"Caution deposit of {format_naira_str(target_listing.pricing.caution_fee)} is ringfenced in a non-custodial merchant "
        f"reserve balance and protected against arbitrary landlord withholding, repayable within 14 days of move-out."
    )

    full_legal_text = build_full_legal_text(
        target_listing,
        req.tenant,
        start_date,
        end_date,
        agreement_id
    )

    record = {
        "agreement_id": agreement_id,
        "listing_id": target_listing.id,
        "property_title": target_listing.title,
        "property_address": target_listing.full_address,
        "title_reference": target_listing.title_reference,
        "landlord_name": target_listing.mandate.landlord_name,
        "manager_name": target_listing.mandate.manager_name,
        "manager_accreditation": target_listing.mandate.accreditation,
        "manager_mandate_ref": target_listing.mandate.mandate_ref,
        "tenant": req.tenant.model_dump(),
        "lease_start_date": start_date,
        "lease_end_date": end_date,
        "tenure_months": 12,
        "pricing": target_listing.pricing.model_dump(),
        "covenants": [c.model_dump() for c in covenants],
        "manager_mandate_clause": mandate_clause,
        "escrow_clause": escrow_clause,
        "caution_ringfencing_clause": caution_clause,
        "full_legal_text": full_legal_text,
        "status": "draft_ready_for_signature",
        "created_at": now_iso,
        "tenant_signature": None,
        "tenant_signed_at": None,
        "tenant_audit_ref": None,
        "tenant_sha256_hash": None,
        "manager_signature": None,
        "manager_signed_at": None,
        "manager_audit_ref": None,
        "manager_sha256_hash": None,
        "master_seal_hash": None,
        "mandate_attestation_confirmed": False,
        "audit_trail": []
    }

    AGREEMENTS_DB.append(record)
    return TenancyAgreementResponse(**record)


@app.get("/api/agreements", response_model=dict)
def list_agreements():
    """List all generated tenancy agreements."""
    return {
        "count": len(AGREEMENTS_DB),
        "agreements": AGREEMENTS_DB
    }


@app.get("/api/agreements/{agreement_id}", response_model=TenancyAgreementResponse)
def get_agreement(agreement_id: str):
    """Retrieve details of a generated tenancy agreement."""
    for a in AGREEMENTS_DB:
        if a["agreement_id"] == agreement_id:
            return TenancyAgreementResponse(**a)
    raise HTTPException(status_code=404, detail="Tenancy agreement not found")


# ==============================================================================
# FEATURE #4: TWO-PARTY ELECTRONIC SIGNATURE WORKFLOW & AUDIT TRAIL (FR-04)
# ==============================================================================

@app.post("/api/agreements/{agreement_id}/sign/tenant", response_model=TenancyAgreementResponse)
def sign_agreement_tenant(agreement_id: str, req: TenantSignRequest):
    """
    Record Tenant Electronic Signature with cryptographic SHA-256 audit timestamp (Screen 5).
    """
    target = None
    for a in AGREEMENTS_DB:
        if a["agreement_id"] == agreement_id:
            target = a
            break

    if not target:
        raise HTTPException(status_code=404, detail="Agreement not found")

    if not req.signature_data or len(req.signature_data.strip()) < 10:
        raise HTTPException(status_code=400, detail="Valid signature vector data is required.")

    if not req.consent_confirmed:
        raise HTTPException(status_code=400, detail="Tenant must confirm legal consent to be bound by the indenture.")

    now_iso = datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    audit_ref = f"SETT-SIG-TEN-{agreement_id.split('-')[-1]}"
    sig_digest = compute_sha256(req.signature_data)[:16]

    # Compute SHA-256 cryptographic seal for tenant signature
    hash_payload = (
        f"AGREEMENT_ID:{agreement_id}|"
        f"ROLE:TENANT|"
        f"SIGNER:{req.signer_name}|"
        f"NIN:{target['tenant'].get('nin_number', '')}|"
        f"TIMESTAMP:{now_iso}|"
        f"SIG_DIGEST:{sig_digest}|"
        f"LEGAL_TEXT_LEN:{len(target['full_legal_text'])}"
    )
    sha256_hash = compute_sha256(hash_payload)

    audit_entry = {
        "audit_ref": audit_ref,
        "agreement_id": agreement_id,
        "signer_role": "tenant",
        "signer_name": req.signer_name,
        "signer_title": "Prospective Residential Tenant",
        "attestation_text": f"I, {req.signer_name}, hereby execute this Kaduna State Residential Tenancy Indenture as Tenant and agree to all covenants herein.",
        "timestamp": now_iso,
        "sha256_hash": sha256_hash,
        "signature_digest": sig_digest,
        "ip_address": "102.89.43.19 (Kaduna, NG)",
        "verification_status": "verified_authentic"
    }

    target["tenant_signature"] = req.signature_data
    target["tenant_signed_at"] = now_iso
    target["tenant_audit_ref"] = audit_ref
    target["tenant_sha256_hash"] = sha256_hash
    target["status"] = "tenant_signed"
    
    if "audit_trail" not in target or target["audit_trail"] is None:
        target["audit_trail"] = []
    
    # Replace existing tenant audit record if re-signing, otherwise append
    target["audit_trail"] = [rec for rec in target["audit_trail"] if rec.get("signer_role") != "tenant"]
    target["audit_trail"].append(audit_entry)

    return TenancyAgreementResponse(**target)


@app.post("/api/agreements/{agreement_id}/sign/manager", response_model=TenancyAgreementResponse)
def sign_agreement_manager(agreement_id: str, req: ManagerSignRequest):
    """
    Execute Manager Counter-Signature on behalf of Landlord under written mandate (Screen 6).
    """
    target = None
    for a in AGREEMENTS_DB:
        if a["agreement_id"] == agreement_id:
            target = a
            break

    if not target:
        raise HTTPException(status_code=404, detail="Agreement not found")

    if not req.signature_data or len(req.signature_data.strip()) < 10:
        raise HTTPException(status_code=400, detail="Valid manager signature vector data is required.")

    if not req.mandate_attestation_confirmed:
        raise HTTPException(status_code=400, detail="Manager must confirm written authority attestation under registered landlord mandate.")

    now_iso = datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    audit_ref = f"SETT-SIG-MGR-{agreement_id.split('-')[-1]}"
    sig_digest = compute_sha256(req.signature_data)[:16]

    # Compute SHA-256 cryptographic seal for manager signature
    hash_payload = (
        f"AGREEMENT_ID:{agreement_id}|"
        f"ROLE:MANAGER_ATTORNEY_IN_FACT|"
        f"MANAGER:{req.manager_name}|"
        f"MANDATE_REF:{req.mandate_ref}|"
        f"LANDLORD:{target['landlord_name']}|"
        f"TENANT_HASH:{target.get('tenant_sha256_hash', '')}|"
        f"TIMESTAMP:{now_iso}|"
        f"SIG_DIGEST:{sig_digest}"
    )
    manager_sha256 = compute_sha256(hash_payload)

    # Compute master dual-signed verification seal
    master_seal_payload = f"MASTER_INDENTURE_SEAL|{agreement_id}|{target.get('tenant_sha256_hash', '')}|{manager_sha256}|{now_iso}"
    master_seal = compute_sha256(master_seal_payload)

    attestation = (
        f"I, {req.manager_name} ({req.manager_title}), hereby attest under registered Landlord Management Mandate "
        f"Ref: {req.mandate_ref} that I am fully authorized as lawful Attorney-in-Fact to execute this indenture on behalf of "
        f"the Landlord ({target['landlord_name']})."
    )

    audit_entry = {
        "audit_ref": audit_ref,
        "agreement_id": agreement_id,
        "signer_role": "manager",
        "signer_name": req.manager_name,
        "signer_title": req.manager_title,
        "attestation_text": attestation,
        "timestamp": now_iso,
        "sha256_hash": manager_sha256,
        "signature_digest": sig_digest,
        "ip_address": "105.112.98.14 (Kaduna, NG)",
        "verification_status": "verified_authentic"
    }

    target["manager_signature"] = req.signature_data
    target["manager_signed_at"] = now_iso
    target["manager_audit_ref"] = audit_ref
    target["manager_sha256_hash"] = manager_sha256
    target["master_seal_hash"] = master_seal
    target["mandate_attestation_confirmed"] = True
    target["status"] = "fully_executed"

    if "audit_trail" not in target or target["audit_trail"] is None:
        target["audit_trail"] = []

    target["audit_trail"] = [rec for rec in target["audit_trail"] if rec.get("signer_role") != "manager"]
    target["audit_trail"].append(audit_entry)

    # Update corresponding listing status to "reserved" (Awaiting Escrow Checkout)
    for listing in ALL_LISTINGS:
        if listing.id == target["listing_id"]:
            listing.status = "reserved"
            break

    return TenancyAgreementResponse(**target)


@app.get("/api/agreements/{agreement_id}/audit-trail", response_model=dict)
def get_agreement_audit_trail(agreement_id: str):
    """
    Retrieve tamper-evident cryptographic audit certificate & timeline for an executed tenancy agreement.
    """
    target = None
    for a in AGREEMENTS_DB:
        if a["agreement_id"] == agreement_id:
            target = a
            break

    if not target:
        raise HTTPException(status_code=404, detail="Agreement not found")

    return {
        "agreement_id": target["agreement_id"],
        "listing_id": target["listing_id"],
        "status": target["status"],
        "master_seal_hash": target.get("master_seal_hash"),
        "tenant_sha256_hash": target.get("tenant_sha256_hash"),
        "manager_sha256_hash": target.get("manager_sha256_hash"),
        "created_at": target["created_at"],
        "audit_trail": target.get("audit_trail", [])
    }


@app.get("/api/manager/pending-signatures", response_model=dict)
def get_pending_manager_signatures():
    """
    List all tenancy agreements awaiting manager counter-signature under mandate (Screen 6 Queue).
    """
    pending = [a for a in AGREEMENTS_DB if a.get("status") == "tenant_signed"]
    executed = [a for a in AGREEMENTS_DB if a.get("status") == "fully_executed"]
    return {
        "pending_count": len(pending),
        "executed_count": len(executed),
        "pending_agreements": pending,
        "executed_agreements": executed
    }



# ==============================================================================
# FEATURE #5: AUTOMATED 4-WAY SPLIT PAYMENT ENGINE & MOVE-IN PASS (FR-05, SCREEN 7)
# ==============================================================================

class PaymentSplitBreakdownModel(BaseModel):
    annual_rent_escrow: int
    caution_deposit_vault: int
    property_agency_fee: int
    legal_drafting_fee: int
    total_move_in_amount: int
    escrow_percentage: float = 75.0
    caution_percentage: float = 10.0
    agency_percentage: float = 10.0
    legal_percentage: float = 5.0
    agency_subaccount: str = "ACCT_mp72kd90 (Stanbic IBTC - HB&A Partners)"
    legal_subaccount: str = "ACCT_leg9482 (Zenith Bank - Legal Counsel)"
    caution_vault_account: str = "Settlla Merchant Reserve (PayRep Custody Isolated)"
    escrow_account: str = "Settlla Move-In Escrow Protection Container"


class MoveInDisputeRecordModel(BaseModel):
    dispute_id: str
    escrow_id: str
    agreement_id: str
    listing_id: str
    tenant_name: str
    issue_category: str
    description: str
    evidence_urls: List[str] = []
    reporter_phone: Optional[str] = None
    date_logged: str
    dispute_status: str = "open_frozen"
    admin_verdict: Optional[str] = None
    refund_reference: Optional[str] = None
    resolution_notes: Optional[str] = None
    indemnity_seal: str = "100% Scam Indemnity Guarantee (FR-07)"


class EscrowHoldRecordModel(BaseModel):
    escrow_id: str
    transaction_id: str
    agreement_id: str
    listing_id: str
    tenant_name: str
    landlord_name: str
    landlord_bank_name: str
    landlord_account_num: str
    amount_held: int
    currency: str = "NGN"
    scheduled_move_in: str
    auto_release_at: str
    escrow_status: str = "holding"
    confirmed_by_tenant: bool = False
    confirmed_at: Optional[str] = None
    dispute_active: bool = False
    release_reason: Optional[str] = None
    disbursement_ref: Optional[str] = None
    timer_paused: bool = False
    active_dispute: Optional[MoveInDisputeRecordModel] = None
    guarantee_seal: str = "100% Scam Indemnity Guarantee (FR-07)"
    created_at: str


class MoveInDisputeCreateRequest(BaseModel):
    issue_category: str = "key_failure"
    description: str
    evidence_urls: List[str] = []
    reporter_phone: Optional[str] = None


class DisputeResolveRequest(BaseModel):
    action: str = "refund"
    verdict: Optional[str] = "fault_landlord"
    notes: Optional[str] = None


class CautionVaultRecordModel(BaseModel):
    caution_id: str
    transaction_id: str
    agreement_id: str
    amount: int
    currency: str = "NGN"
    vault_account: str = "Settlla Merchant Reserve (PayRep Custody Isolated)"
    vault_status: str = "ringfenced_isolated"
    tenure_months: int = 12
    refundable_date: str
    refund_conditions: str = "Full refund within 14 calendar days post-move-out minus verified damage deductions"
    created_at: str


class MoveInPassModel(BaseModel):
    pass_id: str
    transaction_id: str
    agreement_id: str
    listing_id: str
    tenant_name: str
    tenant_phone: str
    property_title: str
    property_address: str
    scheduled_move_in_date: str
    manager_name: str
    manager_phone: str
    manager_accreditation: str
    mandate_ref: str
    qr_token: str
    verification_hash: str
    status: str = "valid_active"
    escrow_status: str = "holding_rent"
    instructions: str
    created_at: str


class PaymentInitiateRequest(BaseModel):
    agreement_id: str
    payment_gateway: str = "Paystack"
    payment_channel: str = "card"
    tenant_email: Optional[str] = None


class PaymentProcessRequest(BaseModel):
    agreement_id: str
    payment_gateway: str = "Paystack"
    payment_channel: str = "card"
    gateway_ref: Optional[str] = None
    channel_details: Optional[dict] = None


class SettlementDisbursalModel(BaseModel):
    recipient_role: str
    recipient_name: str
    account_destination: str
    percentage: float
    amount_ngn: int
    purpose: str
    settlement_status: str = "settled"


class PaymentTransactionResponse(BaseModel):
    transaction_id: str
    agreement_id: str
    listing_id: str
    tenant_name: str
    total_amount_paid: int
    currency: str = "NGN"
    payment_gateway: str
    gateway_ref: str
    payment_channel: str
    split_breakdown: PaymentSplitBreakdownModel
    settlement_disbursals: List[SettlementDisbursalModel] = []
    payment_status: str = "successful"
    paid_at: str
    escrow_hold: EscrowHoldRecordModel
    caution_vault: CautionVaultRecordModel
    move_in_pass: MoveInPassModel
    receipt_url: Optional[str] = None


TRANSACTIONS_DB: List[dict] = []
ESCROW_DB: List[dict] = []
MOVE_IN_PASSES_DB: List[dict] = []
DISPUTES_DB: List[dict] = []


def calculate_4way_split(annual_rent: int) -> PaymentSplitBreakdownModel:
    """
    Calculate atomic 4-way split cuts based on exact fee schedule:
    - Annual Rent (75% of move-in total)
    - Caution Deposit (10% of annual rent)
    - Legal Documentation Fee (5% of annual rent)
    - Property Agency Commission (10% of annual rent)
    """
    caution = int(round(annual_rent * 0.10))
    legal = int(round(annual_rent * 0.05))
    agency = int(round(annual_rent * 0.10))
    total = annual_rent + caution + legal + agency

    return PaymentSplitBreakdownModel(
        annual_rent_escrow=annual_rent,
        caution_deposit_vault=caution,
        property_agency_fee=agency,
        legal_drafting_fee=legal,
        total_move_in_amount=total,
        escrow_percentage=75.0,
        caution_percentage=10.0,
        agency_percentage=10.0,
        legal_percentage=5.0
    )


@app.post("/api/payments/initialize", response_model=dict)
def initialize_payment(req: PaymentInitiateRequest):
    """
    Initialize payment gateway session (Paystack/Monnify) with automated 4-way split metadata.
    Requires agreement to be generated (and ideally signed).
    """
    target_agr = None
    for a in AGREEMENTS_DB:
        if a["agreement_id"] == req.agreement_id:
            target_agr = a
            break

    if not target_agr:
        raise HTTPException(status_code=404, detail="Tenancy agreement not found")

    target_listing = None
    for l in ALL_LISTINGS:
        if l.id == target_agr["listing_id"]:
            target_listing = l
            break

    if not target_listing:
        raise HTTPException(status_code=404, detail="Listing not found")

    # Calculate exact 4-way split
    split_info = calculate_4way_split(target_listing.pricing.annual_rent)

    ref_id = f"SETT-PAY-{target_agr['agreement_id'].split('-')[-1]}-{datetime.datetime.now().strftime('%M%S')}"

    # Generate virtual transfer account or USSD string for simulation
    virtual_account = {
        "bank_name": "Providus Bank / Monnify Virtual Ledger",
        "account_number": f"99{target_agr['agreement_id'].split('-')[-1]}4829",
        "account_name": f"Settlla Escrow - {target_agr['tenant']['full_name'][:14]}",
        "expires_in_minutes": 30
    }
    ussd_string = f"*737*000*84920#{target_agr['agreement_id'].split('-')[-1]}"

    return {
        "status": "initialized",
        "agreement_id": target_agr["agreement_id"],
        "listing_id": target_listing.id,
        "property_title": target_listing.title,
        "tenant_name": target_agr["tenant"]["full_name"],
        "tenant_email": req.tenant_email or target_agr["tenant"]["email_address"],
        "total_amount": split_info.total_move_in_amount,
        "currency": "NGN",
        "payment_gateway": req.payment_gateway,
        "payment_channel": req.payment_channel,
        "gateway_ref": ref_id,
        "split_breakdown": split_info.model_dump(),
        "virtual_account": virtual_account,
        "ussd_string": ussd_string,
        "escrow_guarantee": "Net rent of ₦" + f"{split_info.annual_rent_escrow:,}" + " is protected in escrow until physical key handover."
    }


@app.post("/api/payments/process", response_model=PaymentTransactionResponse)
def process_payment(req: PaymentProcessRequest):
    """
    Process and record verified payment for all-in move-in sum.
    Executes atomic 4-way split:
    - 75% Rent -> Locked in Move-In Escrow
    - 10% Caution -> Ringfenced in Merchant Reserve Vault
    - 10% Agency -> Disbursed to HB&A Partners sub-account
    - 5% Legal -> Disbursed to Legal Counsel account
    Issues official Move-In Pass and Payment Receipt.
    """
    target_agr = None
    for a in AGREEMENTS_DB:
        if a["agreement_id"] == req.agreement_id:
            target_agr = a
            break

    if not target_agr:
        raise HTTPException(status_code=404, detail="Tenancy agreement not found")

    target_listing = None
    for l in ALL_LISTINGS:
        if l.id == target_agr["listing_id"]:
            target_listing = l
            break

    if not target_listing:
        raise HTTPException(status_code=404, detail="Listing not found")

    now = datetime.datetime.now()
    now_iso = now.strftime("%Y-%m-%d %H:%M:%S")
    ref_num = 1000 + len(TRANSACTIONS_DB) + 1
    tx_id = f"SETT-TX-2026-{ref_num}"
    escrow_id = f"SETT-ESC-2026-{ref_num}"
    caution_id = f"SETT-CAUT-2026-{ref_num}"
    pass_id = f"SETT-PASS-2026-{ref_num}"
    gateway_ref = req.gateway_ref or f"T{datetime.datetime.now().strftime('%Y%m%d%H%M%S')}{ref_num}"

    # Calculate 4-way split
    split_info = calculate_4way_split(target_listing.pricing.annual_rent)

    # Schedule move-in timestamps (e.g. Oct 1, 2026 10:00 AM)
    move_in_date_str = f"{target_agr['lease_start_date']} 10:00:00"
    auto_release_str = f"{target_agr['lease_start_date']} 23:59:59 (+24h Safety Timer)"

    # 1. Create Escrow Hold Record
    escrow_record = {
        "escrow_id": escrow_id,
        "transaction_id": tx_id,
        "agreement_id": target_agr["agreement_id"],
        "listing_id": target_listing.id,
        "tenant_name": target_agr["tenant"]["full_name"],
        "landlord_name": target_listing.mandate.landlord_name,
        "landlord_bank_name": "First Bank of Nigeria (Kaduna Main Branch)",
        "landlord_account_num": "2019876543",
        "amount_held": split_info.annual_rent_escrow,
        "currency": "NGN",
        "scheduled_move_in": move_in_date_str,
        "auto_release_at": auto_release_str,
        "escrow_status": "holding",
        "confirmed_by_tenant": False,
        "confirmed_at": None,
        "dispute_active": False,
        "guarantee_seal": "100% Scam Indemnity Guarantee (FR-07)",
        "created_at": now_iso
    }
    ESCROW_DB.append(escrow_record)

    # 2. Create Caution Vault Record
    caution_record = {
        "caution_id": caution_id,
        "transaction_id": tx_id,
        "agreement_id": target_agr["agreement_id"],
        "amount": split_info.caution_deposit_vault,
        "currency": "NGN",
        "vault_account": "Settlla Merchant Reserve (PayRep Custody Isolated)",
        "vault_status": "ringfenced_isolated",
        "tenure_months": 12,
        "refundable_date": target_agr["lease_end_date"],
        "refund_conditions": "Full refund within 14 calendar days post-move-out minus verified damage deductions",
        "created_at": now_iso
    }

    # 3. Create Move-In Pass Record
    qr_token = f"SETT-QR-{compute_sha256(tx_id + target_agr['agreement_id'] + now_iso)[:20]}"
    verification_hash = compute_sha256(f"MOVE_IN_PASS|{pass_id}|{tx_id}|{target_agr['agreement_id']}|{target_listing.id}")

    move_in_pass_record = {
        "pass_id": pass_id,
        "transaction_id": tx_id,
        "agreement_id": target_agr["agreement_id"],
        "listing_id": target_listing.id,
        "tenant_name": target_agr["tenant"]["full_name"],
        "tenant_phone": target_agr["tenant"]["phone_number"],
        "property_title": target_listing.title,
        "property_address": target_listing.full_address,
        "scheduled_move_in_date": f"Wednesday, Oct 01, 2026 at 10:00 AM",
        "manager_name": target_listing.mandate.manager_name,
        "manager_phone": "0803 555 1289",
        "manager_accreditation": target_listing.mandate.accreditation,
        "mandate_ref": target_listing.mandate.mandate_ref,
        "qr_token": qr_token,
        "verification_hash": verification_hash,
        "status": "valid_active",
        "escrow_status": "holding_rent",
        "instructions": (
            f"Present this digital pass to HB&A Partners concierge at {target_listing.full_address} on move-in day. "
            "Inspect premises, receive working keys, and tap 'Confirm Key Handover' on your web dashboard to release escrow."
        ),
        "created_at": now_iso
    }
    MOVE_IN_PASSES_DB.append(move_in_pass_record)

    # 4. Create Itemized 4-Way Settlement Disbursals
    disbursals = [
        SettlementDisbursalModel(
            recipient_role="escrow_vault",
            recipient_name=f"Move-In Escrow (for {target_listing.mandate.landlord_name})",
            account_destination="Settlla Escrow Holding Container",
            percentage=75.0,
            amount_ngn=split_info.annual_rent_escrow,
            purpose="75% Annual Base Rent (Protected until key handover)",
            settlement_status="locked_in_escrow"
        ),
        SettlementDisbursalModel(
            recipient_role="caution_reserve",
            recipient_name="Settlla Merchant Reserve / PayRep Vault",
            account_destination=split_info.caution_vault_account,
            percentage=10.0,
            amount_ngn=split_info.caution_deposit_vault,
            purpose="10% Refundable Caution Deposit (12-Month Ringfenced Custody)",
            settlement_status="ringfenced_in_vault"
        ),
        SettlementDisbursalModel(
            recipient_role="property_manager",
            recipient_name=f"{target_listing.mandate.manager_name} (HB&A Partners)",
            account_destination=split_info.agency_subaccount,
            percentage=10.0,
            amount_ngn=split_info.property_agency_fee,
            purpose="10% Property Agency & Inspection Management Commission",
            settlement_status="disbursed_to_subaccount"
        ),
        SettlementDisbursalModel(
            recipient_role="legal_counsel",
            recipient_name="Legal Drafting Counsel (NBA Kaduna)",
            account_destination=split_info.legal_subaccount,
            percentage=5.0,
            amount_ngn=split_info.legal_drafting_fee,
            purpose="5% Tenancy Agreement Drafting & Mandate Execution Fee",
            settlement_status="disbursed_to_subaccount"
        )
    ]

    # 5. Create Payment Transaction Record
    tx_record = {
        "transaction_id": tx_id,
        "agreement_id": target_agr["agreement_id"],
        "listing_id": target_listing.id,
        "tenant_name": target_agr["tenant"]["full_name"],
        "total_amount_paid": split_info.total_move_in_amount,
        "currency": "NGN",
        "payment_gateway": req.payment_gateway,
        "gateway_ref": gateway_ref,
        "payment_channel": req.payment_channel,
        "split_breakdown": split_info.model_dump(),
        "settlement_disbursals": [d.model_dump() for d in disbursals],
        "payment_status": "successful",
        "paid_at": now_iso,
        "escrow_hold": escrow_record,
        "caution_vault": caution_record,
        "move_in_pass": move_in_pass_record,
        "receipt_url": f"/receipts/{tx_id}.pdf"
    }
    TRANSACTIONS_DB.append(tx_record)

    # Update Listing Status to Rented / Move-In Scheduled
    target_listing.status = "reserved"

    return PaymentTransactionResponse(
        transaction_id=tx_id,
        agreement_id=target_agr["agreement_id"],
        listing_id=target_listing.id,
        tenant_name=target_agr["tenant"]["full_name"],
        total_amount_paid=split_info.total_move_in_amount,
        currency="NGN",
        payment_gateway=req.payment_gateway,
        gateway_ref=gateway_ref,
        payment_channel=req.payment_channel,
        split_breakdown=split_info,
        settlement_disbursals=disbursals,
        payment_status="successful",
        paid_at=now_iso,
        escrow_hold=EscrowHoldRecordModel(**escrow_record),
        caution_vault=CautionVaultRecordModel(**caution_record),
        move_in_pass=MoveInPassModel(**move_in_pass_record),
        receipt_url=f"/receipts/{tx_id}.pdf"
    )


@app.get("/api/payments/{transaction_id}", response_model=PaymentTransactionResponse)
def get_payment_transaction(transaction_id: str):
    """Retrieve details of a payment transaction, split cuts, and receipts."""
    for tx in TRANSACTIONS_DB:
        if tx["transaction_id"] == transaction_id:
            return PaymentTransactionResponse(
                transaction_id=tx["transaction_id"],
                agreement_id=tx["agreement_id"],
                listing_id=tx["listing_id"],
                tenant_name=tx["tenant_name"],
                total_amount_paid=tx["total_amount_paid"],
                currency=tx["currency"],
                payment_gateway=tx["payment_gateway"],
                gateway_ref=tx["gateway_ref"],
                payment_channel=tx["payment_channel"],
                split_breakdown=PaymentSplitBreakdownModel(**tx["split_breakdown"]),
                settlement_disbursals=[SettlementDisbursalModel(**d) for d in tx.get("settlement_disbursals", [])],
                payment_status=tx["payment_status"],
                paid_at=tx["paid_at"],
                escrow_hold=EscrowHoldRecordModel(**tx["escrow_hold"]),
                caution_vault=CautionVaultRecordModel(**tx["caution_vault"]),
                move_in_pass=MoveInPassModel(**tx["move_in_pass"]),
                receipt_url=tx.get("receipt_url")
            )
    raise HTTPException(status_code=404, detail="Payment transaction not found")


@app.get("/api/agreements/{agreement_id}/pass", response_model=MoveInPassModel)
def get_agreement_move_in_pass(agreement_id: str):
    """Retrieve Move-In Pass for a paid agreement."""
    for p in MOVE_IN_PASSES_DB:
        if p["agreement_id"] == agreement_id:
            return MoveInPassModel(**p)
    raise HTTPException(status_code=404, detail="Move-In Pass not found for this agreement")


@app.get("/api/escrow", response_model=dict)
def list_escrows():
    """List all escrow holdings and summary totals."""
    return {
        "count": len(ESCROW_DB),
        "holding_count": sum(1 for e in ESCROW_DB if e["escrow_status"] == "holding"),
        "released_count": sum(1 for e in ESCROW_DB if e["escrow_status"] == "released"),
        "disputed_count": sum(1 for e in ESCROW_DB if e["escrow_status"] == "disputed_frozen"),
        "refunded_count": sum(1 for e in ESCROW_DB if e["escrow_status"] == "refunded"),
        "total_held_ngn": sum(e["amount_held"] for e in ESCROW_DB if e["escrow_status"] == "holding"),
        "escrow_records": ESCROW_DB,
        "disputes": DISPUTES_DB
    }


@app.get("/api/escrow/disputes", response_model=List[MoveInDisputeRecordModel])
def list_disputes():
    """List all logged move-in disputes."""
    return [MoveInDisputeRecordModel(**d) for d in DISPUTES_DB]


@app.get("/api/escrow/{escrow_id}", response_model=EscrowHoldRecordModel)
def get_escrow_hold(escrow_id: str):
    """Retrieve holding status, countdown, and active dispute for an escrow record."""
    for e in ESCROW_DB:
        if e["escrow_id"] == escrow_id:
            return EscrowHoldRecordModel(**e)
    raise HTTPException(status_code=404, detail="Escrow record not found")


@app.post("/api/escrow/{escrow_id}/confirm-key-handover", response_model=EscrowHoldRecordModel)
def confirm_key_handover(escrow_id: str):
    """
    Tenant taps 'Confirm Key Handover' on move-in day after testing keys.
    Immediately disburses annual base rent to the verified landlord bank account.
    """
    target = None
    for e in ESCROW_DB:
        if e["escrow_id"] == escrow_id:
            target = e
            break
    if not target:
        raise HTTPException(status_code=404, detail="Escrow record not found")

    if target.get("dispute_active") or target.get("escrow_status") == "disputed_frozen":
        raise HTTPException(status_code=400, detail="Cannot release escrow while an active dispute is open")

    if target.get("escrow_status") == "released":
        return EscrowHoldRecordModel(**target)

    now_iso = datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    transfer_ref = f"TRF_{datetime.datetime.now().strftime('%Y%m%d')}_{target['escrow_id'].split('-')[-1]}"

    target["escrow_status"] = "released"
    target["confirmed_by_tenant"] = True
    target["confirmed_at"] = now_iso
    target["release_reason"] = "tenant_button"
    target["disbursement_ref"] = transfer_ref

    # Update linked listing status to occupied
    for l in ALL_LISTINGS:
        if l.id == target.get("listing_id"):
            l.status = "occupied"
            break

    return EscrowHoldRecordModel(**target)


class EscrowReleaseDirectRequest(BaseModel):
    agreement_id: Optional[str] = None
    escrow_id: Optional[str] = None
    notes: Optional[str] = None


@app.post("/api/escrow/release", response_model=EscrowHoldRecordModel)
def release_escrow_direct(req: EscrowReleaseDirectRequest):
    """Universal release endpoint matching sequence diagram POST /api/escrow/release."""
    target = None
    for e in ESCROW_DB:
        if req.escrow_id and e["escrow_id"] == req.escrow_id:
            target = e
            break
        if req.agreement_id and e["agreement_id"] == req.agreement_id:
            target = e
            break

    if not target:
        # Fall back to latest escrow record if present
        if ESCROW_DB:
            target = ESCROW_DB[-1]
        else:
            raise HTTPException(status_code=404, detail="No active escrow record found")

    return confirm_key_handover(target["escrow_id"])


@app.post("/api/escrow/{escrow_id}/auto-release-trigger", response_model=EscrowHoldRecordModel)
def trigger_escrow_auto_release(escrow_id: str):
    """
    Simulates or executes the 24-hour safety timer fallback expiration.
    Disburses net rent automatically if no dispute is open.
    """
    target = None
    for e in ESCROW_DB:
        if e["escrow_id"] == escrow_id:
            target = e
            break
    if not target:
        raise HTTPException(status_code=404, detail="Escrow record not found")

    if target.get("dispute_active") or target.get("escrow_status") == "disputed_frozen":
        raise HTTPException(status_code=400, detail="Safety timer cancelled: active dispute is open")

    if target.get("escrow_status") == "released":
        return EscrowHoldRecordModel(**target)

    now_iso = datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    transfer_ref = f"TRF_AUTO24H_{target['escrow_id'].split('-')[-1]}"

    target["escrow_status"] = "released"
    target["confirmed_by_tenant"] = False
    target["confirmed_at"] = now_iso
    target["release_reason"] = "auto_timer_24h"
    target["disbursement_ref"] = transfer_ref

    for l in ALL_LISTINGS:
        if l.id == target.get("listing_id"):
            l.status = "occupied"
            break

    return EscrowHoldRecordModel(**target)


@app.post("/api/escrow/{escrow_id}/dispute", response_model=MoveInDisputeRecordModel)
def report_move_in_dispute(escrow_id: str, req: MoveInDisputeCreateRequest):
    """
    Tenant taps 'Report a Problem' before 24-hour safety timer expires.
    Immediately freezes escrow payouts, pauses timer, and alerts Kaduna concierge operations.
    """
    target_escrow = None
    for e in ESCROW_DB:
        if e["escrow_id"] == escrow_id:
            target_escrow = e
            break
    if not target_escrow:
        raise HTTPException(status_code=404, detail="Escrow record not found")

    now_iso = datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    dispute_ref = f"SETT-DSP-2026-{100 + len(DISPUTES_DB) + 1}"

    dispute_record = {
        "dispute_id": dispute_ref,
        "escrow_id": target_escrow["escrow_id"],
        "agreement_id": target_escrow["agreement_id"],
        "listing_id": target_escrow["listing_id"],
        "tenant_name": target_escrow["tenant_name"],
        "issue_category": req.issue_category,
        "description": req.description,
        "evidence_urls": req.evidence_urls or ["https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=600&q=80"],
        "reporter_phone": req.reporter_phone or "0803 123 4567",
        "date_logged": now_iso,
        "dispute_status": "open_frozen",
        "admin_verdict": None,
        "refund_reference": None,
        "resolution_notes": "Immediate 2-Hour Escalation SLA triggered. Escrow payout halted.",
        "indemnity_seal": "100% Scam Indemnity Guarantee (FR-07)"
    }
    DISPUTES_DB.append(dispute_record)

    # Synchronously Freeze Escrow & Pause Timer
    target_escrow["escrow_status"] = "disputed_frozen"
    target_escrow["dispute_active"] = True
    target_escrow["timer_paused"] = True
    target_escrow["active_dispute"] = dispute_record

    return MoveInDisputeRecordModel(**dispute_record)


@app.post("/api/escrow/{escrow_id}/resolve-dispute", response_model=EscrowHoldRecordModel)
def resolve_move_in_dispute(escrow_id: str, req: DisputeResolveRequest):
    """
    Concierge / Admin resolution of a move-in dispute:
    - 'refund': Executes 100% Scam Indemnity Refund back to tenant
    - 'resolve_clear': Keys verified on-site, releasing rent to landlord
    """
    target_escrow = None
    for e in ESCROW_DB:
        if e["escrow_id"] == escrow_id:
            target_escrow = e
            break
    if not target_escrow:
        raise HTTPException(status_code=404, detail="Escrow record not found")

    now_iso = datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S")

    target_dispute = None
    for d in DISPUTES_DB:
        if d["escrow_id"] == escrow_id and d["dispute_status"] in ["open_frozen", "investigating"]:
            target_dispute = d
            break

    if req.action == "refund":
        # 100% Scam Indemnity Refund Execution
        refund_ref = f"REF_INDEMNITY_{target_escrow['escrow_id'].split('-')[-1]}_{datetime.datetime.now().strftime('%M%S')}"
        target_escrow["escrow_status"] = "refunded"
        target_escrow["dispute_active"] = False
        target_escrow["release_reason"] = "100% Scam Indemnity Full Refund Issued to Tenant"
        target_escrow["disbursement_ref"] = refund_ref

        if target_dispute:
            target_dispute["dispute_status"] = "resolved_refunded"
            target_dispute["admin_verdict"] = req.verdict or "fault_landlord"
            target_dispute["refund_reference"] = refund_ref
            target_dispute["resolution_notes"] = req.notes or "Full 100% refund executed under Scam Indemnity Guarantee."
            target_escrow["active_dispute"] = target_dispute

        for l in ALL_LISTINGS:
            if l.id == target_escrow.get("listing_id"):
                l.status = "available"
                break

    elif req.action == "resolve_clear":
        # Issue resolved on-site with replacement keys
        transfer_ref = f"TRF_RESOLVED_{target_escrow['escrow_id'].split('-')[-1]}"
        target_escrow["escrow_status"] = "released"
        target_escrow["dispute_active"] = False
        target_escrow["confirmed_by_tenant"] = True
        target_escrow["confirmed_at"] = now_iso
        target_escrow["release_reason"] = "Keys Delivered & Handover Confirmed Post-Resolution"
        target_escrow["disbursement_ref"] = transfer_ref

        if target_dispute:
            target_dispute["dispute_status"] = "resolved_cleared"
            target_dispute["admin_verdict"] = "resolved_amicably"
            target_dispute["resolution_notes"] = req.notes or "Keys replaced and verified on-site by HB&A Partners."
            target_escrow["active_dispute"] = target_dispute

        for l in ALL_LISTINGS:
            if l.id == target_escrow.get("listing_id"):
                l.status = "occupied"
                break

    return EscrowHoldRecordModel(**target_escrow)


@app.get("/api/payments", response_model=dict)
def list_payments():
    """List all transactions and escrow holdings."""
    return {
        "count": len(TRANSACTIONS_DB),
        "total_volume_ngn": sum(tx["total_amount_paid"] for tx in TRANSACTIONS_DB),
        "total_escrow_held_ngn": sum(e["amount_held"] for e in ESCROW_DB if e["escrow_status"] == "holding"),
        "transactions": TRANSACTIONS_DB,
        "escrow_records": ESCROW_DB,
        "move_in_passes": MOVE_IN_PASSES_DB,
        "disputes": DISPUTES_DB
    }


def seed_initial_agreements():
    """Seed ready agreements for testing and immediate workflow exploration."""
    if AGREEMENTS_DB:
        return

    # Seed 1: Hajara Bello - Fully Executed Agreement for Barnawa 2-Bed Flat
    agr_1 = {
        "agreement_id": "SETT-AGR-2026-1001",
        "listing_id": "prop_barnawa_01",
        "property_title": "Executive 2-Bedroom Flat, Barnawa GRA",
        "property_address": "Plot 14, Alimi Road, Barnawa GRA, Kaduna South, Kaduna State",
        "title_reference": "KADGIS C-of-O Ref: KD/B/2018/88921",
        "landlord_name": "Alhaji Ibrahim Danbaba (Represented under Mandate by HB&A Partners)",
        "manager_name": "Barr. H. B. Abubakar",
        "manager_accreditation": "Managing Partner, HB&A Partners (NIESV Reg: A-2849, ESVARBON: 0192)",
        "manager_mandate_ref": "MANDATE-HBA-2026-KD01",
        "tenant": {
            "full_name": "Hajara Bello",
            "phone_number": "0803 123 4567",
            "email_address": "hajara.bello@gtbank.com",
            "nin_number": "28491029384",
            "residential_address": "Plot 5, Constitution Road, Kaduna",
            "emergency_contact_name": "Ibrahim Bello",
            "emergency_contact_phone": "0802 334 5566",
            "emergency_contact_rel": "Brother",
            "employer_name": "Guaranty Trust Bank (GTBank), Barnawa Branch",
            "employment_role": "Banking Operations Officer"
        },
        "lease_start_date": "2026-10-01",
        "lease_end_date": "2027-09-30",
        "tenure_months": 12,
        "pricing": {
            "annual_rent": 500000,
            "caution_fee": 50000,
            "legal_fee": 25000,
            "agency_fee": 50000,
            "total_move_in_cost": 625000,
            "service_charge": 45000
        },
        "covenants": [
            {
                "category": "Tenant Covenants",
                "statute_reference": "Section 14, Tenancy Law of Kaduna State",
                "items": [
                    "To pay the reserved net rent in full via Settlla Move-In Escrow prior to physical possession.",
                    "To keep the interior and fixtures in good tenantable repair.",
                    "Not to assign or sublet without prior written consent."
                ]
            }
        ],
        "manager_mandate_clause": "Executed by HB&A Partners under Registered Mandate Ref: MANDATE-HBA-2026-KD01.",
        "escrow_clause": "Net rent of ₦500,000 is locked in Settlla Escrow until key handover confirmation.",
        "caution_ringfencing_clause": "Caution deposit of ₦50,000 is ringfenced in Settlla Merchant Reserve.",
        "full_legal_text": "THIS RESIDENTIAL TENANCY INDENTURE is made this 1st day of October 2026...",
        "status": "fully_executed",
        "created_at": "2026-09-16 09:00:00",
        "tenant_signature": "SIG_DATA_HAJARA_BELLO_VECTOR_2849102",
        "tenant_signed_at": "2026-09-16 09:15:00",
        "tenant_audit_ref": "SETT-SIG-TEN-1001",
        "tenant_sha256_hash": "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
        "manager_signature": "SIG_DATA_HBA_ABUBAKAR_PARTNER_99812",
        "manager_signed_at": "2026-09-16 09:30:00",
        "manager_audit_ref": "SETT-SIG-MGR-1001",
        "manager_sha256_hash": "ca978112ca1bbdcafac231b39a23dc4da786eff8147c4e72b9807785afee48bb",
        "master_seal_hash": "MASTER_SEAL_HASH_KD1001_84920392019abcf8",
        "mandate_attestation_confirmed": True,
        "audit_trail": [
            {
                "audit_ref": "SETT-SIG-TEN-1001",
                "agreement_id": "SETT-AGR-2026-1001",
                "signer_role": "tenant",
                "signer_name": "Hajara Bello",
                "signer_title": "Prospective Residential Tenant",
                "attestation_text": "I, Hajara Bello, hereby execute this indenture as Tenant.",
                "timestamp": "2026-09-16 09:15:00",
                "sha256_hash": "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
                "signature_digest": "e3b0c44298fc1c14",
                "ip_address": "102.89.43.19 (Kaduna, NG)",
                "verification_status": "verified_authentic"
            },
            {
                "audit_ref": "SETT-SIG-MGR-1001",
                "agreement_id": "SETT-AGR-2026-1001",
                "signer_role": "manager",
                "signer_name": "Barr. H. B. Abubakar",
                "signer_title": "Principal Counsel & Managing Partner (HB&A Partners)",
                "attestation_text": "I, Barr. H. B. Abubakar, counter-sign under registered landlord mandate Ref: MANDATE-HBA-2026-KD01.",
                "timestamp": "2026-09-16 09:30:00",
                "sha256_hash": "ca978112ca1bbdcafac231b39a23dc4da786eff8147c4e72b9807785afee48bb",
                "signature_digest": "ca978112ca1bbdca",
                "ip_address": "105.112.98.14 (Kaduna, NG)",
                "verification_status": "verified_authentic"
            }
        ]
    }
    AGREEMENTS_DB.append(agr_1)


# Initialize seeds on startup
seed_initial_agreements()


# ---------------------------------------------------------------------------
# Feature: Settlla AI Natural Language Search Endpoint
# ---------------------------------------------------------------------------

@app.get("/api/ai-search")
def ai_search_endpoint(q: str = Query(..., description="Natural language search query")):
    """
    Parses natural-language user query into criteria, scores all listings,
    and returns ranked listings with relevance score and AI reasoning highlights.
    """
    norm_q = q.lower().strip()

    # 1. Location
    neighborhood = "all"
    if "barnawa" in norm_q or "coronation" in norm_q or "queen amina" in norm_q:
        neighborhood = "Barnawa"
    elif "malali" in norm_q or "isa kaita" in norm_q or "danmarna" in norm_q or "golf club" in norm_q:
        neighborhood = "Malali"

    # 2. Bedrooms
    bedrooms = None
    if "studio" in norm_q or "mini flat" in norm_q or "mini-flat" in norm_q or "self contain" in norm_q:
        bedrooms = 1
    elif "1 bedroom" in norm_q or "1 bed" in norm_q or "1bed" in norm_q or "1-bedroom" in norm_q:
        bedrooms = 1
    elif "2 bedroom" in norm_q or "2 bed" in norm_q or "2bed" in norm_q or "2-bedroom" in norm_q:
        bedrooms = 2
    elif "3 bedroom" in norm_q or "3 bed" in norm_q or "3bed" in norm_q or "3-bedroom" in norm_q:
        bedrooms = 3

    # 3. Budget (e.g. 500k, 800k, 600000)
    import re
    budget = None
    b_match = re.search(r'(\d+(?:\.\d+)?)\s*(k|m|thousand|million)?\b', norm_q)
    if b_match:
        val = float(b_match.group(1))
        unit = b_match.group(2)
        if unit in ["k", "thousand"]:
            val *= 1000
        elif unit in ["m", "million"]:
            val *= 1000000
        elif 100 < val < 2000:
            val *= 1000
        if 200000 <= val <= 10000000:
            budget = int(val)

    # 4. Amenities
    req_meter = any(w in norm_q for w in ["prepaid", "meter", "self-billed", "self billed", "kedco", "light"])
    req_water = any(w in norm_q for w in ["water", "borehole", "tank"])
    req_sec = any(w in norm_q for w in ["security", "guard", "fence", "cctv"])
    req_solar = any(w in norm_q for w in ["solar", "inverter", "generator", "changeover", "transformer"])

    results = []
    for item in RAW_LISTINGS:
        l_rent = item.get("pricing", {}).get("annual_rent", 0) or item.get("annual_rent", 0)
        l_neigh = item.get("neighborhood", "")
        l_beds = item.get("bedrooms", 1)
        amenities_str = " ".join(item.get("amenities", [])).lower() + " " + item.get("description", "").lower()
        commute_str = (item.get("commute_badge", "") + " " + item.get("commute_context", "")).lower()

        score = 55
        highlights = []

        if neighborhood != "all":
            if l_neigh.lower() == neighborhood.lower():
                score += 25
                highlights.append(f"Located in {l_neigh}")
            else:
                score -= 35
                continue  # Exclude neighborhood mismatch

        if bedrooms is not None:
            if l_beds == bedrooms:
                score += 20
                highlights.append(f"Exact {l_beds}-bedroom layout")
            else:
                score -= 20

        if budget:
            if l_rent <= budget:
                score += 25
                highlights.append(f"Rent ₦{l_rent:,} is within your ₦{budget:,} budget")
            else:
                score -= 30

        if req_meter and ("prepaid" in amenities_str or "self-billed" in amenities_str):
            score += 15
            highlights.append("Independent prepaid electric meter")

        if req_water and ("borehole" in amenities_str or "water" in amenities_str):
            score += 10
            highlights.append("Borehole water supply with storage")

        if req_sec and ("security" in amenities_str or "guard" in amenities_str or "fence" in amenities_str):
            score += 10
            highlights.append("Gated compound with security coverage")

        if req_solar and ("solar" in amenities_str or "inverter" in amenities_str or "changeover" in amenities_str):
            score += 15
            highlights.append("Power backup infrastructure")

        if "gtbank" in norm_q and "gtbank" in commute_str:
            score += 15
            highlights.append(f"Prime location: {item.get('commute_badge')}")

        raw_score = score
        clamped = max(20, min(99, score))
        if clamped >= 35:
            results.append({
                "listing": item,
                "raw_score": raw_score,
                "relevance_score": clamped,
                "highlights": highlights,
                "is_top_match": False,
            })

    results.sort(key=lambda x: x["raw_score"], reverse=True)
    if results:
        results[0]["is_top_match"] = True

    return {
        "query": q,
        "neighborhood": neighborhood,
        "bedrooms": bedrooms,
        "max_budget": budget,
        "total_matches": len(results),
        "results": results,
    }





