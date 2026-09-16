"""
End-to-End Test Suite for Feature #6:
Key-in-Door Move-In Escrow Protection & Emergency Dispute Freeze (Screen 8)

Validates:
1. Escrow hold initialization from 4-way split payment (75% net annual rent).
2. "Confirm Key Handover" instant release to verified landlord bank account with transfer code.
3. 24-hour safety timer fallback auto-release.
4. Immediate dispute freeze ("Report a Problem") across standard issue categories.
5. Invariant enforcement: Escrow payout is strictly blocked when dispute is active.
6. 100% Scam Indemnity Refund resolution.
7. Amicable on-site key delivery resolution.
8. Escrow & dispute audit endpoints.
"""

import sys
import os
from starlette.testclient import TestClient

# Ensure UTF-8 output on Windows consoles
if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8")

# Add backend directory to sys.path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from main import app, ESCROW_DB, DISPUTES_DB, TRANSACTIONS_DB, AGREEMENTS_DB, ALL_LISTINGS

client = TestClient(app)


def test_escrow_protection_engine():
    print("================================================================================")
    print("🛡️ RUNNING SETTLLA KEY-IN-DOOR MOVE-IN ESCROW PROTECTION TESTS (FEATURE #6)")
    print("================================================================================")

    # --------------------------------------------------------------------------
    # Step 1: Create a signed agreement & process payment
    # --------------------------------------------------------------------------
    print("\n--- [Test 1] Create Agreement & Execute 4-Way Split Payment ---")
    listing = ALL_LISTINGS[0]
    gen_payload = {
        "listing_id": listing.id,
        "tenant": {
            "full_name": "Amina Usman Bello",
            "phone_number": "0803 123 4567",
            "email_address": "amina.bello@example.ng",
            "nin_number": "28491029384",
            "residential_address": "Plot 12, Malali GRA, Kaduna",
            "employer_name": "Ahmadu Bello University Teaching Hospital"
        },
        "lease_start_date": "2026-10-01",
        "lease_end_date": "2027-09-30"
    }
    agr_res = client.post("/api/agreements/generate", json=gen_payload)
    assert agr_res.status_code == 200, f"Agreement generation failed: {agr_res.text}"
    agr = agr_res.json()
    agreement_id = agr["agreement_id"]

    # Sign both parties
    client.post(f"/api/agreements/{agreement_id}/sign/tenant", json={
        "signer_name": "Amina Usman Bello",
        "signature_data": "data:image/png;base64,tenant_sig",
        "consent_confirmed": True,
        "nin_confirmed": "28491029384"
    })
    client.post(f"/api/agreements/{agreement_id}/sign/manager", json={
        "signer_name": "Musa Danladi",
        "signature_data": "data:image/png;base64,manager_sig",
        "mandate_verified": True
    })

    # Process 4-way split payment
    pay_res = client.post("/api/payments/process", json={
        "agreement_id": agreement_id,
        "payment_gateway": "Paystack",
        "payment_channel": "card",
        "gateway_ref": "PSTK_ESCROW_TEST_001"
    })
    assert pay_res.status_code == 200, f"Payment failed: {pay_res.text}"
    pay_data = pay_res.json()
    escrow_1 = pay_data["escrow_hold"]
    escrow_id_1 = escrow_1["escrow_id"]

    print(f"✓ Payment processed successfully (TX: {pay_data['transaction_id']})")
    print(f"✓ Escrow Hold Record created: {escrow_id_1}")
    print(f"✓ Rent held in safety escrow: ₦{escrow_1['amount_held']:,}")
    print(f"✓ Escrow Status: {escrow_1['escrow_status']}")
    print(f"✓ Landlord Target Account: {escrow_1['landlord_bank_name']} - {escrow_1['landlord_account_num']}")
    assert escrow_1["escrow_status"] == "holding"
    assert escrow_1["amount_held"] == 500000

    # --------------------------------------------------------------------------
    # Step 2: Tenant Taps "Confirm Key Handover" -> Instant Release to Landlord
    # --------------------------------------------------------------------------
    print("\n--- [Test 2] POST /api/escrow/{escrow_id}/confirm-key-handover ---")
    confirm_res = client.post(f"/api/escrow/{escrow_id_1}/confirm-key-handover")
    assert confirm_res.status_code == 200, f"Confirm handover failed: {confirm_res.text}"
    released_escrow = confirm_res.json()

    print(f"✓ Status: {released_escrow['escrow_status']}")
    print(f"✓ Release Reason: {released_escrow['release_reason']}")
    print(f"✓ Disbursement Reference: {released_escrow['disbursement_ref']}")
    assert released_escrow["escrow_status"] == "released"
    assert released_escrow["confirmed_by_tenant"] is True
    assert released_escrow["disbursement_ref"].startswith("TRF_")

    # --------------------------------------------------------------------------
    # Step 3: 24-Hour Safety Timer Fallback Auto-Release
    # --------------------------------------------------------------------------
    print("\n--- [Test 3] POST /api/escrow/{escrow_id}/auto-release-trigger (Safety Timer Expiry) ---")
    # Generate second transaction
    agr2_res = client.post("/api/agreements/generate", json={
        "listing_id": ALL_LISTINGS[1].id,
        "tenant": {
            "full_name": "Tariq Danladi",
            "phone_number": "0802 111 2233",
            "email_address": "tariq.d@example.ng",
            "nin_number": "11928374650",
            "residential_address": "Barnawa Phase 2",
            "employer_name": "Kaduna Tech Park"
        },
        "lease_start_date": "2026-10-05",
        "lease_end_date": "2027-10-04"
    })
    agr2_id = agr2_res.json()["agreement_id"]
    client.post(f"/api/agreements/{agr2_id}/sign/tenant", json={"signer_name": "Tariq Danladi", "signature_data": "...", "consent_confirmed": True, "nin_confirmed": "11928374650"})
    client.post(f"/api/agreements/{agr2_id}/sign/manager", json={"signer_name": "Settlla Manager", "signature_data": "...", "mandate_verified": True})
    pay2 = client.post("/api/payments/process", json={"agreement_id": agr2_id, "payment_gateway": "Monnify", "payment_channel": "bank_transfer"})
    escrow_id_2 = pay2.json()["escrow_hold"]["escrow_id"]

    auto_res = client.post(f"/api/escrow/{escrow_id_2}/auto-release-trigger")
    assert auto_res.status_code == 200, f"Auto release failed: {auto_res.text}"
    auto_released = auto_res.json()
    print(f"✓ 24-hour Safety timer fallback executed!")
    print(f"✓ Status: {auto_released['escrow_status']}")
    print(f"✓ Release Reason: {auto_released['release_reason']}")
    assert auto_released["escrow_status"] == "released"
    assert auto_released["release_reason"] == "auto_timer_24h"

    # --------------------------------------------------------------------------
    # Step 4: Emergency Dispute Freeze ("Report a Problem")
    # --------------------------------------------------------------------------
    print("\n--- [Test 4] POST /api/escrow/{escrow_id}/dispute (Immediate Dispute Freeze) ---")
    agr3_res = client.post("/api/agreements/generate", json={
        "listing_id": ALL_LISTINGS[2].id,
        "tenant": {
            "full_name": "Chukwudi Eze",
            "phone_number": "0809 999 8888",
            "email_address": "c.eze@example.ng",
            "nin_number": "99887766554",
            "residential_address": "Malali Kaduna",
            "employer_name": "NNPC Kaduna"
        },
        "lease_start_date": "2026-10-10",
        "lease_end_date": "2027-10-09"
    })
    agr3_id = agr3_res.json()["agreement_id"]
    client.post(f"/api/agreements/{agr3_id}/sign/tenant", json={"signer_name": "Chukwudi Eze", "signature_data": "...", "consent_confirmed": True, "nin_confirmed": "99887766554"})
    client.post(f"/api/agreements/{agr3_id}/sign/manager", json={"signer_name": "Settlla Manager", "signature_data": "...", "mandate_verified": True})
    pay3 = client.post("/api/payments/process", json={"agreement_id": agr3_id, "payment_gateway": "Paystack", "payment_channel": "card"})
    escrow_id_3 = pay3.json()["escrow_hold"]["escrow_id"]

    # Tenant reports a problem: "fake_landlord_keys_denied"
    disp_res = client.post(f"/api/escrow/{escrow_id_3}/dispute", json={
        "issue_category": "fake_landlord_keys_denied",
        "description": "On-site caretaker claims property was let to someone else last week. Refused to surrender keys.",
        "evidence_urls": ["https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=600&q=80"],
        "reporter_phone": "0809 999 8888"
    })
    assert disp_res.status_code == 200, f"Dispute filing failed: {disp_res.text}"
    dispute_rec = disp_res.json()
    print(f"✓ Dispute Filed: {dispute_rec['dispute_id']}")
    print(f"✓ Issue Category: {dispute_rec['issue_category']}")
    print(f"✓ Dispute Status: {dispute_rec['dispute_status']}")
    print(f"✓ Indemnity Seal: {dispute_rec['indemnity_seal']}")
    assert dispute_rec["dispute_status"] == "open_frozen"

    # Check that escrow record is frozen and timer is paused
    escrow_check = client.get(f"/api/escrow/{escrow_id_3}").json()
    print(f"✓ Escrow Status: {escrow_check['escrow_status']} (FROZEN)")
    print(f"✓ Dispute Active: {escrow_check['dispute_active']}")
    print(f"✓ Safety Timer Paused: {escrow_check['timer_paused']}")
    assert escrow_check["escrow_status"] == "disputed_frozen"
    assert escrow_check["dispute_active"] is True
    assert escrow_check["timer_paused"] is True

    # --------------------------------------------------------------------------
    # Step 5: Verify Payout Invariant (Payout BLOCKED during Active Dispute)
    # --------------------------------------------------------------------------
    print("\n--- [Test 5] Verify Invariant: Payouts Strictly Blocked while Escrow is Frozen ---")
    blocked_handover = client.post(f"/api/escrow/{escrow_id_3}/confirm-key-handover")
    assert blocked_handover.status_code == 400
    print(f"✓ Confirm Handover blocked: {blocked_handover.json()['detail']}")

    blocked_auto = client.post(f"/api/escrow/{escrow_id_3}/auto-release-trigger")
    assert blocked_auto.status_code == 400
    print(f"✓ Auto-Release timer blocked: {blocked_auto.json()['detail']}")

    # --------------------------------------------------------------------------
    # Step 6: 100% Scam Indemnity Refund Trigger
    # --------------------------------------------------------------------------
    print("\n--- [Test 6] POST /api/escrow/{escrow_id}/resolve-dispute (100% Scam Indemnity Refund) ---")
    resolve_refund_res = client.post(f"/api/escrow/{escrow_id_3}/resolve-dispute", json={
        "action": "refund",
        "verdict": "fault_landlord",
        "notes": "Investigation confirmed duplicate letting attempt by caretaker. Full refund issued to tenant immediately under Settlla 100% Scam Indemnity Policy.",
        "resolved_by": "Settlla Dispute & Trust Officer"
    })
    assert resolve_refund_res.status_code == 200, f"Resolve refund failed: {resolve_refund_res.text}"
    refunded_escrow = resolve_refund_res.json()
    print(f"✓ Escrow Status: {refunded_escrow['escrow_status']}")
    print(f"✓ Refund Disbursement Reference: {refunded_escrow['disbursement_ref']}")
    print(f"✓ Release Reason: {refunded_escrow['release_reason']}")
    assert refunded_escrow["escrow_status"] == "refunded"
    assert refunded_escrow["disbursement_ref"].startswith("REF_INDEMNITY_")

    # --------------------------------------------------------------------------
    # Step 7: On-Site Key Delivery Amicable Resolution
    # --------------------------------------------------------------------------
    print("\n--- [Test 7] POST /api/escrow/{escrow_id}/resolve-dispute (Amicable On-Site Key Resolution) ---")
    # File another dispute on a new hold and resolve with resolve_clear
    agr4_res = client.post("/api/agreements/generate", json={
        "listing_id": ALL_LISTINGS[3].id,
        "tenant": {
            "full_name": "Fatima Sani",
            "phone_number": "0803 777 6655",
            "email_address": "fatima.s@example.ng",
            "nin_number": "88776655443",
            "residential_address": "Barnawa, Kaduna",
            "employer_name": "Kaduna State Judiciary"
        },
        "lease_start_date": "2026-10-15",
        "lease_end_date": "2027-10-14"
    })
    agr4_id = agr4_res.json()["agreement_id"]
    client.post(f"/api/agreements/{agr4_id}/sign/tenant", json={"signer_name": "Fatima Sani", "signature_data": "...", "consent_confirmed": True, "nin_confirmed": "88776655443"})
    client.post(f"/api/agreements/{agr4_id}/sign/manager", json={"signer_name": "Settlla Manager", "signature_data": "...", "mandate_verified": True})
    pay4 = client.post("/api/payments/process", json={"agreement_id": agr4_id, "payment_gateway": "Paystack", "payment_channel": "card"})
    escrow_id_4 = pay4.json()["escrow_hold"]["escrow_id"]

    client.post(f"/api/escrow/{escrow_id_4}/dispute", json={
        "issue_category": "faulty_locks_access_denied",
        "description": "Master bedroom lock was jammed upon arrival. Landlord locksmith was summoned.",
        "evidence_urls": [],
        "reporter_phone": "0803 777 6655"
    })

    resolve_clear_res = client.post(f"/api/escrow/{escrow_id_4}/resolve-dispute", json={
        "action": "resolve_clear",
        "verdict": "resolved_amicably",
        "notes": "Lock replaced on-site within 45 minutes by Settlla verified artisan. Tenant tested keys and accepted possession.",
        "resolved_by": "Settlla Kaduna On-Site Concierge"
    })
    assert resolve_clear_res.status_code == 200
    cleared_escrow = resolve_clear_res.json()
    print(f"✓ Escrow Status: {cleared_escrow['escrow_status']}")
    print(f"✓ Disbursement Ref: {cleared_escrow['disbursement_ref']}")
    assert cleared_escrow["escrow_status"] == "released"

    # --------------------------------------------------------------------------
    # Step 8: Escrow and Dispute Auditing Queries
    # --------------------------------------------------------------------------
    print("\n--- [Test 8] GET /api/escrow & GET /api/escrow/disputes Auditing ---")
    all_escrows_res = client.get("/api/escrow")
    assert all_escrows_res.status_code == 200
    escrow_list_data = all_escrows_res.json()
    print(f"✓ Total Escrows: {escrow_list_data['count']}")
    print(f"✓ Released Escrows: {escrow_list_data['released_count']}")
    print(f"✓ Refunded Escrows: {escrow_list_data['refunded_count']}")
    assert escrow_list_data["count"] >= 4

    all_disputes_res = client.get("/api/escrow/disputes")
    assert all_disputes_res.status_code == 200
    disputes_list = all_disputes_res.json()
    print(f"✓ Total Disputes Recorded: {len(disputes_list)}")
    assert len(disputes_list) >= 2

    print("\n================================================================================")
    print("🎉 ALL 8 TESTS FOR FEATURE #6 ESCROW PROTECTION PASSED WITH 100% SUCCESS!")
    print("================================================================================")


if __name__ == "__main__":
    test_escrow_protection_engine()
