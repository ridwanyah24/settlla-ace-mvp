import { TenancyAgreement } from "@/types/agreement";
import { Listing } from "@/types/listing";
import {
  MoveInPass,
  PaymentSplitBreakdown,
  PaymentTransaction,
} from "@/types/payment";
import { saveTenantRental } from "./rentals";

export type ProcessPaymentInput = {
  agreement: TenancyAgreement;
  listing: Listing;
  gateway: "Paystack" | "Monnify";
  channel: "card" | "bank_transfer" | "ussd";
  gateway_ref: string;
};

function buildFallbackTransaction(input: ProcessPaymentInput): PaymentTransaction {
  const { agreement, listing, gateway, channel } = input;
  const rent = listing.pricing.annual_rent;
  const caution = listing.pricing.caution_fee;
  const legal = listing.pricing.legal_fee;
  const agency = listing.pricing.agency_fee;
  const total = listing.pricing.total_move_in_cost;

  const nowIso = new Date().toISOString().replace("T", " ").substring(0, 19);
  const txId = `SETT-TX-2026-${Math.floor(1000 + Math.random() * 9000)}`;
  const passId = `SETT-PASS-2026-${Math.floor(1000 + Math.random() * 9000)}`;
  const escrowId = `SETT-ESC-2026-${Math.floor(1000 + Math.random() * 9000)}`;
  const cautionId = `SETT-CAUT-2026-${Math.floor(1000 + Math.random() * 9000)}`;

  const splitBreakdown: PaymentSplitBreakdown = {
    annual_rent_escrow: rent,
    caution_deposit_vault: caution,
    property_agency_fee: agency,
    legal_drafting_fee: legal,
    total_move_in_amount: total,
    escrow_percentage: 75.0,
    caution_percentage: caution > 0 ? 10.0 : 0.0,
    agency_percentage: 10.0,
    legal_percentage: 5.0,
    agency_subaccount: "ACCT_mp72kd90 (Stanbic IBTC - HB&A Partners)",
    legal_subaccount: "ACCT_leg9482 (Zenith Bank - Legal Counsel)",
    caution_vault_account: "Settlla Merchant Reserve (PayRep Custody Isolated)",
    escrow_account: "Settlla Move-In Escrow Container",
  };

  const moveInPass: MoveInPass = {
    pass_id: passId,
    transaction_id: txId,
    agreement_id: agreement.agreement_id,
    listing_id: listing.id,
    tenant_name: agreement.tenant.full_name,
    tenant_phone: agreement.tenant.phone_number,
    property_title: listing.title,
    property_address: listing.full_address,
    scheduled_move_in_date: "Wednesday, Oct 01, 2026 at 10:00 AM",
    manager_name: listing.mandate.manager_name,
    manager_phone: "0803 555 1289",
    manager_accreditation: listing.mandate.accreditation,
    mandate_ref: listing.mandate.mandate_ref,
    qr_token: `SETT-QR-TOKEN-${Date.now()}`,
    verification_hash: `SHA256_SEAL_PASS_${txId}`,
    status: "valid_active",
    escrow_status: "holding_rent",
    instructions: `Present this pass at ${listing.full_address} on move-in day. Confirm key handover to release rent from escrow.`,
    created_at: nowIso,
  };

  return {
    transaction_id: txId,
    agreement_id: agreement.agreement_id,
    listing_id: listing.id,
    tenant_name: agreement.tenant.full_name,
    total_amount_paid: total,
    currency: "NGN",
    payment_gateway: gateway,
    gateway_ref: input.gateway_ref,
    payment_channel: channel,
    split_breakdown: splitBreakdown,
    settlement_disbursals: [],
    payment_status: "successful",
    paid_at: nowIso,
    escrow_hold: {
      escrow_id: escrowId,
      transaction_id: txId,
      agreement_id: agreement.agreement_id,
      listing_id: listing.id,
      tenant_name: agreement.tenant.full_name,
      landlord_name: listing.mandate.landlord_name,
      landlord_bank_name: "First Bank of Nigeria (Kaduna Branch)",
      landlord_account_num: "2019876543",
      amount_held: rent,
      currency: "NGN",
      scheduled_move_in: "2026-10-01 10:00:00",
      auto_release_at: "2026-10-02 10:00:00 (+24h Safety Timer)",
      escrow_status: "holding",
      confirmed_by_tenant: false,
      dispute_active: false,
      guarantee_seal: "100% Scam Indemnity Guarantee",
      created_at: nowIso,
    },
    caution_vault: {
      caution_id: caution > 0 ? cautionId : "SETT-CAUT-WAIVED",
      transaction_id: txId,
      agreement_id: agreement.agreement_id,
      amount: caution,
      currency: "NGN",
      vault_account:
        caution > 0 ? "Settlla Merchant Reserve (PayRep Custody Isolated)" : "N/A (Zero Deposit Held)",
      vault_status: caution > 0 ? "ringfenced_isolated" : "not_applicable",
      tenure_months: caution > 0 ? 12 : 0,
      refundable_date: "2027-09-30",
      refund_conditions:
        "Full refund within 14 calendar days post-move-out minus verified damage deductions",
      created_at: nowIso,
    },
    move_in_pass: moveInPass,
    receipt_url: `/receipts/${txId}.pdf`,
  };
}

export async function processMoveInPayment(input: ProcessPaymentInput): Promise<PaymentTransaction> {
  const tx = buildFallbackTransaction(input);

  if (tx.move_in_pass) {
    await saveTenantRental({
      rental_id: tx.transaction_id,
      agreement: input.agreement,
      listing: input.listing,
      transaction: tx,
      move_in_pass: tx.move_in_pass,
      escrow_hold: tx.escrow_hold,
      caution_vault: tx.caution_vault,
      status: "active",
      created_at: new Date().toISOString(),
    });
  }

  return tx;
}
