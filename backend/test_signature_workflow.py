import json
import sys

if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8")

from starlette.testclient import TestClient
from main import app

client = TestClient(app)

print("=== STARTING COMPLETE SETTLLA CLOSING ENGINE TEST (FR-01 to FR-04) ===")

# Step 1: Verified Listings
res = client.get("/api/listings")
assert res.status_code == 200
listings_data = res.json()
assert listings_data["count"] > 0
listing = listings_data["listings"][0]
print(f"1. Verified Listing: {listing['title']} ({listing['neighborhood']}) - All-In: NGN {listing['pricing']['total_move_in_cost']:,}")

# Step 2: Inspection Slots (FR-02)
res = client.get(f"/api/listings/{listing['id']}/slots")
assert res.status_code == 200
slots_data = res.json()
assert slots_data["available_slots"] > 0
print(f"2. Inspection Booking: {slots_data['total_slots']} slots across {slots_data['total_days_available']} days (Inspection Fee: NGN {slots_data['inspection_fee']})")

# Step 3: Dynamic Tenancy Agreement Generator (FR-03, Screen 5)
gen_payload = {
    "listing_id": listing["id"],
    "tenant": {
        "full_name": "Hajara Bello",
        "phone_number": "0803 123 4567",
        "email_address": "hajara.bello@example.com",
        "nin_number": "28491029384",
        "residential_address": "Plot 5, Constitution Road, Kaduna",
        "employer_name": "Guaranty Trust Bank (GTBank), Barnawa Branch"
    },
    "lease_start_date": "2026-10-01",
    "lease_end_date": "2027-09-30"
}
res = client.post("/api/agreements/generate", json=gen_payload)
assert res.status_code == 200
agr = res.json()
agreement_id = agr["agreement_id"]
print(f"3. Tenancy Agreement Generated: {agreement_id} (Status: {agr['status']})")
assert agr["status"] == "draft_ready_for_signature"
assert "KADGIS" in agr["title_reference"] or "Registered" in agr["title_reference"]
assert agr["manager_mandate_ref"] is not None

# Step 4: Tenant Digital Signature (FR-04, Screen 5)
tenant_sig_payload = {
    "signer_name": "Hajara Bello",
    "signature_data": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAK8AAABkCAYAAACiFq6AAAA5489fjdkfjlks...",
    "consent_confirmed": True,
    "nin_confirmed": "28491029384"
}
res = client.post(f"/api/agreements/{agreement_id}/sign/tenant", json=tenant_sig_payload)
assert res.status_code == 200
signed_agr = res.json()
print("4. Tenant Electronic Signature Executed:")
print(f"   - Signer: {signed_agr['tenant']['full_name']}")
print(f"   - Audit Ref: {signed_agr['tenant_audit_ref']}")
print(f"   - Cryptographic SHA-256: {signed_agr['tenant_sha256_hash']}")
print(f"   - Timestamp: {signed_agr['tenant_signed_at']}")
print(f"   - New Status: {signed_agr['status']}")
assert signed_agr["status"] == "tenant_signed"

# Step 5: Manager Queue Verification (Screen 6 Queue)
res = client.get("/api/manager/pending-signatures")
assert res.status_code == 200
queue = res.json()
assert any(a["agreement_id"] == agreement_id for a in queue["pending_agreements"])
print(f"5. Manager Counter-Signing Queue: {queue['pending_count']} lease(s) pending review")

# Step 6: Manager Mandate Counter-Signature (FR-04, Screen 6)
manager_sig_payload = {
    "manager_name": "Barr. H. B. Abubakar",
    "manager_title": "Principal Counsel & Managing Partner (HB&A Partners)",
    "signature_data": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAK8AAABkCAYAAACiFq6AAAA12398jfkld...",
    "mandate_attestation_confirmed": True,
    "mandate_ref": signed_agr["manager_mandate_ref"]
}
res = client.post(f"/api/agreements/{agreement_id}/sign/manager", json=manager_sig_payload)
assert res.status_code == 200
executed_agr = res.json()
print("6. Manager Mandate Counter-Signature Executed:")
print(f"   - Attorney-in-Fact: {executed_agr['manager_name']}")
print(f"   - Mandate Ref: {executed_agr['manager_mandate_ref']}")
print(f"   - Audit Ref: {executed_agr['manager_audit_ref']}")
print(f"   - Manager SHA-256: {executed_agr['manager_sha256_hash']}")
print(f"   - Master Indenture Seal: {executed_agr['master_seal_hash']}")
print(f"   - Final Execution Status: {executed_agr['status']}")
assert executed_agr["status"] == "fully_executed"
assert executed_agr["mandate_attestation_confirmed"] is True

# Step 7: Cryptographic Audit Trail Verification
res = client.get(f"/api/agreements/{agreement_id}/audit-trail")
assert res.status_code == 200
audit_log = res.json()
print(f"7. Non-Repudiation Audit Trail ({len(audit_log['audit_trail'])} Stamped Events):")
for entry in audit_log["audit_trail"]:
    print(f"   • [{entry['signer_role'].upper()}] {entry['signer_name']} ({entry['audit_ref']}) at {entry['timestamp']}")
    print(f"     SHA-256 Digest: {entry['sha256_hash'][:32]}... [Status: {entry['verification_status']}]")
assert len(audit_log["audit_trail"]) == 2

print("\n************************************************************")
print("SUCCESS: Two-Party Digital Signature Workflow is 100% Verified!")
print("Ready for next Must-have: Automated 4-Way Split Payment Engine (FR-05)!")
print("************************************************************")
