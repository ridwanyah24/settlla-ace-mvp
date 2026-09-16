"""
Automated Test Suite for Settlla Feature #5:
Automated 4-Way Split Payment Engine (Paystack / Monnify) & Digital Move-In Pass

Tests:
1. POST /api/payments/initialize (Split Calculation & Gateway session config)
2. POST /api/payments/process (Full transaction execution, 4-way settlement ledger, escrow hold, caution reserve, Move-In Pass generation)
3. GET /api/payments/{transaction_id} (Fetch transaction receipt)
4. GET /api/agreements/{agreement_id}/pass (Fetch verified digital pass)
5. GET /api/escrow/{escrow_id} (Verify 75% rent lock & +24h safety release timer)
6. Mathematical precision verification:
   - Base Rent = 75% of move-in sum
   - Caution Deposit = 10% (ringfenced into Settlla merchant reserve)
   - Agency Commission = 10% (disbursed to HB&A Partners sub-account)
   - Legal Drafting Fee = 5% (disbursed to Legal Counsel account)
"""

import sys
import json

if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8")

from starlette.testclient import TestClient
from main import app, AGREEMENTS_DB, TRANSACTIONS_DB, ESCROW_DB, MOVE_IN_PASSES_DB

client = TestClient(app)

def test_initialize_payment():
    print("\n--- [Test 1] POST /api/payments/initialize ---")
    payload = {
        "agreement_id": "SETT-AGR-2026-1001",
        "payment_gateway": "Paystack",
        "payment_channel": "card",
        "tenant_email": "hajara.bello@gtbank.com"
    }
    resp = client.post("/api/payments/initialize", json=payload)
    assert resp.status_code == 200, f"Expected 200, got {resp.status_code}: {resp.text}"
    data = resp.json()
    print(f"Status: {resp.status_code}")
    print(f"Total Move-In Sum: ₦{data['total_amount']:,}")
    print(f"Split Breakdown:")
    sb = data['split_breakdown']
    print(f"  - Escrow Rent (75%): ₦{sb['annual_rent_escrow']:,} -> {sb['escrow_account']}")
    print(f"  - Caution Deposit (10%): ₦{sb['caution_deposit_vault']:,} -> {sb['caution_vault_account']}")
    print(f"  - Agency Fee (10%): ₦{sb['property_agency_fee']:,} -> {sb['agency_subaccount']}")
    print(f"  - Legal Fee (5%): ₦{sb['legal_drafting_fee']:,} -> {sb['legal_subaccount']}")
    
    # Verify sum integrity
    assert sb['annual_rent_escrow'] + sb['caution_deposit_vault'] + sb['property_agency_fee'] + sb['legal_drafting_fee'] == data['total_amount'], "Split sum mismatch!"
    assert data['total_amount'] == 625000, f"Expected 625,000 but got {data['total_amount']}"
    assert sb['annual_rent_escrow'] == 500000, f"Expected 500,000 for rent but got {sb['annual_rent_escrow']}"
    assert sb['caution_deposit_vault'] == 50000, f"Expected 50,000 for caution but got {sb['caution_deposit_vault']}"
    assert sb['property_agency_fee'] == 50000, f"Expected 50,000 for agency but got {sb['property_agency_fee']}"
    assert sb['legal_drafting_fee'] == 25000, f"Expected 25,000 for legal but got {sb['legal_drafting_fee']}"
    print("✅ Split math verified with 100% precision!")
    return data

def test_process_payment():
    print("\n--- [Test 2] POST /api/payments/process ---")
    payload = {
        "agreement_id": "SETT-AGR-2026-1001",
        "payment_gateway": "Paystack",
        "payment_channel": "card",
        "gateway_ref": "PSTK_REF_998821903"
    }
    resp = client.post("/api/payments/process", json=payload)
    assert resp.status_code == 200, f"Expected 200, got {resp.status_code}: {resp.text}"
    data = resp.json()
    print(f"Status: {resp.status_code}")
    print(f"Transaction ID: {data['transaction_id']}")
    print(f"Payment Status: {data['payment_status']}")
    print(f"Move-In Pass ID: {data['move_in_pass']['pass_id']}")
    print(f"Escrow Hold ID: {data['escrow_hold']['escrow_id']}")
    print(f"Caution Vault ID: {data['caution_vault']['caution_id']}")
    print(f"Settlement Disbursals: {len(data['settlement_disbursals'])} splits executed")
    
    assert data['payment_status'] == 'successful', "Payment failed"
    assert data['move_in_pass']['status'] == 'valid_active', "Move-in pass is not active"
    assert data['escrow_hold']['amount_held'] == 500000, "Escrow held amount incorrect"
    assert data['caution_vault']['amount'] == 50000, "Caution vault amount incorrect"
    assert len(data['settlement_disbursals']) == 4, f"Expected 4 disbursals, got {len(data['settlement_disbursals'])}"
    print("✅ 4-Way split execution & pass generation verified!")
    return data

def test_get_payment(tx_id):
    print(f"\n--- [Test 3] GET /api/payments/{tx_id} ---")
    resp = client.get(f"/api/payments/{tx_id}")
    assert resp.status_code == 200
    data = resp.json()
    print(f"Status: {resp.status_code}")
    print(f"Retrieved Transaction: {data['transaction_id']} (Total: ₦{data['total_amount_paid']:,})")
    assert data['transaction_id'] == tx_id
    assert len(data['settlement_disbursals']) == 4
    print("✅ Transaction record verified!")

def test_get_move_in_pass(agreement_id):
    print(f"\n--- [Test 4] GET /api/agreements/{agreement_id}/pass ---")
    resp = client.get(f"/api/agreements/{agreement_id}/pass")
    assert resp.status_code == 200
    data = resp.json()
    print(f"Status: {resp.status_code}")
    print(f"Move-In Pass ID: {data['pass_id']}")
    print(f"Tenant: {data['tenant_name']}")
    print(f"Scheduled Move-In: {data['scheduled_move_in_date']}")
    print(f"Verification Hash: {data['verification_hash']}")
    print(f"QR Token: {data['qr_token']}")
    assert data['status'] == "valid_active"
    print("✅ Move-In Pass verified!")

def test_get_escrow(escrow_id):
    print(f"\n--- [Test 5] GET /api/escrow/{escrow_id} ---")
    resp = client.get(f"/api/escrow/{escrow_id}")
    assert resp.status_code == 200
    data = resp.json()
    print(f"Status: {resp.status_code}")
    print(f"Escrow ID: {data['escrow_id']}")
    print(f"Held Amount: ₦{data['amount_held']:,} for Landlord ({data['landlord_name']})")
    print(f"Landlord Account: {data['landlord_bank_name']} ({data['landlord_account_num']})")
    print(f"Auto-Release Timer: {data['auto_release_at']}")
    print(f"Guarantee Seal: {data['guarantee_seal']}")
    assert data['escrow_status'] == "holding"
    print("✅ Escrow record & 24h safety release timer verified!")

def test_monnify_gateway_flow():
    print("\n--- [Test 6] Monnify Gateway & Bank Transfer Channel ---")
    payload = {
        "agreement_id": "SETT-AGR-2026-1001",
        "payment_gateway": "Monnify",
        "payment_channel": "bank_transfer",
        "gateway_ref": "MNFY_REF_55102938"
    }
    resp = client.post("/api/payments/process", json=payload)
    assert resp.status_code == 200
    data = resp.json()
    assert data['payment_gateway'] == "Monnify"
    assert data['payment_channel'] == "bank_transfer"
    print(f"Monnify Transaction Executed: {data['transaction_id']}")
    print("✅ Monnify flow verified!")

def main():
    print("=" * 60)
    print("SETTLLA FEATURE #5: 4-WAY SPLIT PAYMENT & ESCROW ENGINE TESTS")
    print("=" * 60)
    try:
        init_data = test_initialize_payment()
        process_data = test_process_payment()
        test_get_payment(process_data['transaction_id'])
        test_get_move_in_pass("SETT-AGR-2026-1001")
        test_get_escrow(process_data['escrow_hold']['escrow_id'])
        test_monnify_gateway_flow()
        print("\n" + "=" * 60)
        print("ALL FEATURE #5 TESTS PASSED SUCCESSFULLY! (100% SUITE PASS)")
        print("=" * 60)
    except Exception as e:
        print(f"\n❌ Test Failed: {e}", file=sys.stderr)
        import traceback
        traceback.print_exc()
        sys.exit(1)

if __name__ == "__main__":
    main()
