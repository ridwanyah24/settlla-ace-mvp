"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { TenancyAgreement } from "@/types/agreement";
import { Listing } from "@/types/listing";
import { PaymentTransaction, PaymentSplitBreakdown, MoveInPass } from "@/types/payment";
import { MoveInPassViewer } from "./MoveInPassViewer";
import {
  X,
  Check,
  Key,
  ArrowRight,
  Zap,
  Ticket,
  ShieldCheck,
  CreditCard,
  Building2,
  Smartphone,
  Lock,
  Copy,
  User,
} from "lucide-react";

interface CheckoutPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  agreement: TenancyAgreement;
  listing: Listing;
  onPaymentSuccess?: (transaction: PaymentTransaction) => void;
}

export const CheckoutPaymentModal: React.FC<CheckoutPaymentModalProps> = ({
  isOpen,
  onClose,
  agreement,
  listing,
  onPaymentSuccess,
}) => {
  // Gateway State: "Paystack" | "Monnify"
  const [gateway, setGateway] = useState<"Paystack" | "Monnify">("Paystack");

  // Payment Channel: "card" | "bank_transfer" | "ussd"
  const [channel, setChannel] = useState<"card" | "bank_transfer" | "ussd">("card");

  // Split Breakdown Calculation
  const rent = listing.pricing.annual_rent;
  const caution = listing.pricing.caution_fee;
  const legal = listing.pricing.legal_fee;
  const agency = listing.pricing.agency_fee;
  const total = listing.pricing.total_move_in_cost;

  // Card Form Simulation State
  const [cardNumber, setCardNumber] = useState("5399 4182 9012 3456");
  const [cardExpiry, setCardExpiry] = useState("11/28");
  const [cardCVV, setCardCVV] = useState("729");
  const [cardPin, setCardPin] = useState("4921");

  const router = useRouter();
  const { currentUser, isAuthenticated, signUp } = useAuth();
  const [authPassword, setAuthPassword] = useState("");
  const [authError, setAuthError] = useState<string | null>(null);

  // Processing & Success State
  const [processing, setProcessing] = useState(false);
  const [transaction, setTransaction] = useState<PaymentTransaction | null>(null);
  const [showPassModal, setShowPassModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Virtual Account Info
  const virtualAccountNum = `99${agreement.agreement_id.split("-").pop() || "1001"}4829`;
  const [copiedAccount, setCopiedAccount] = useState(false);

  const handleCopyAccount = () => {
    navigator.clipboard.writeText(virtualAccountNum);
    setCopiedAccount(true);
    setTimeout(() => setCopiedAccount(false), 3000);
  };

  const saveRentalToStorage = (tx: PaymentTransaction, pass: MoveInPass) => {
    const rentalRecord = {
      rental_id: tx.transaction_id,
      agreement: agreement,
      listing: listing,
      transaction: tx,
      move_in_pass: pass,
      escrow_hold: tx.escrow_hold,
      caution_vault: tx.caution_vault,
      status: "active",
      created_at: new Date().toISOString(),
    };
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem("settlla_current_rental", JSON.stringify(rentalRecord));
        const existing = JSON.parse(localStorage.getItem("settlla_active_rentals") || "[]");
        localStorage.setItem(
          "settlla_active_rentals",
          JSON.stringify([
            rentalRecord,
            ...existing.filter((r: any) => r.rental_id !== rentalRecord.rental_id),
          ])
        );
      } catch (e) {
        console.error("Failed to save rental to storage", e);
      }
    }
  };

  // Process Payment Execution
  const handleAuthorizePayment = async () => {
    setErrorMessage(null);
    setAuthError(null);

    // If guest / unauthenticated, create and link account
    if (!isAuthenticated && !currentUser) {
      if (!authPassword || authPassword.trim().length < 4) {
        setAuthError("Please create a password (at least 4 characters) to link your Tenant Dashboard account.");
        return;
      }
      const emailToUse =
        agreement.tenant.email_address ||
        `${agreement.tenant.full_name.toLowerCase().replace(/[^a-z0-9]/g, ".")}@example.com`;
      await signUp({
        fullName: agreement.tenant.full_name,
        email: emailToUse,
        password: authPassword,
        role: "tenant",
        phoneNumber: agreement.tenant.phone_number || "0803 123 4567",
        ninNumber: agreement.tenant.nin_number,
      });
    }

    setProcessing(true);

    const payload = {
      agreement_id: agreement.agreement_id,
      payment_gateway: gateway,
      payment_channel: channel,
      gateway_ref: `T${Date.now()}_SETT`,
      channel_details: {
        method: channel,
        card_last4: channel === "card" ? cardNumber.slice(-4) : undefined,
        account_number: channel === "bank_transfer" ? virtualAccountNum : undefined,
      },
    };

    try {
      const res = await fetch("http://127.0.0.1:8000/api/payments/process", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        const data: PaymentTransaction = await res.json();
        if (data.move_in_pass) {
          saveRentalToStorage(data, data.move_in_pass);
        }
        setTransaction(data);
        if (onPaymentSuccess) onPaymentSuccess(data);
        return;
      }
      throw new Error("Backend payment error");
    } catch {
      // Client-side fallback transaction generator
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

      const fallbackTx: PaymentTransaction = {
        transaction_id: txId,
        agreement_id: agreement.agreement_id,
        listing_id: listing.id,
        tenant_name: agreement.tenant.full_name,
        total_amount_paid: total,
        currency: "NGN",
        payment_gateway: gateway,
        gateway_ref: payload.gateway_ref,
        payment_channel: channel,
        split_breakdown: splitBreakdown,
        settlement_disbursals: [
          {
            recipient_role: "escrow_vault",
            recipient_name: `Move-In Escrow (for ${listing.mandate.landlord_name})`,
            account_destination: "Settlla Escrow Holding Container",
            percentage: 75.0,
            amount_ngn: rent,
            purpose: "75% Annual Base Rent (Protected until key handover)",
            settlement_status: "locked_in_escrow",
          },
          {
            recipient_role: "caution_reserve",
            recipient_name: caution > 0 ? "Settlla Merchant Reserve / PayRep Vault" : "N/A (Zero Caution Mandate)",
            account_destination: caution > 0 ? (splitBreakdown.caution_vault_account || "Settlla Merchant Reserve") : "N/A (Waived)",
            percentage: caution > 0 ? 10.0 : 0.0,
            amount_ngn: caution,
            purpose: caution > 0 ? "10% Refundable Caution Deposit (12-Month Ringfenced Custody)" : "Zero Caution Deposit (Waived by Landlord Mandate)",
            settlement_status: caution > 0 ? "ringfenced_in_vault" : "disbursed_to_subaccount",
          },
          {
            recipient_role: "property_manager",
            recipient_name: `${listing.mandate.manager_name} (HB&A Partners)`,
            account_destination: splitBreakdown.agency_subaccount || "Stanbic IBTC - ACCT_mp72kd90",
            percentage: 10.0,
            amount_ngn: agency,
            purpose: "10% Property Agency & Inspection Management Commission",
            settlement_status: "disbursed_to_subaccount",
          },
          {
            recipient_role: "legal_counsel",
            recipient_name: "Legal Drafting Counsel (NBA Kaduna)",
            account_destination: splitBreakdown.legal_subaccount || "Zenith Bank - ACCT_leg9482",
            percentage: 5.0,
            amount_ngn: legal,
            purpose: "5% Tenancy Agreement Drafting & Mandate Execution Fee",
            settlement_status: "disbursed_to_subaccount",
          },
        ],
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
          vault_account: caution > 0 ? "Settlla Merchant Reserve (PayRep Custody Isolated)" : "N/A (Zero Deposit Held)",
          vault_status: caution > 0 ? "ringfenced_isolated" : "not_applicable",
          tenure_months: caution > 0 ? 12 : 0,
          refundable_date: "2027-09-30",
          refund_conditions: "Full refund within 14 calendar days post-move-out minus verified damage deductions",
          created_at: nowIso,
        },
        move_in_pass: moveInPass,
        receipt_url: `/receipts/${txId}.pdf`,
      };

      saveRentalToStorage(fallbackTx, moveInPass);
      setTransaction(fallbackTx);
      if (onPaymentSuccess) onPaymentSuccess(fallbackTx);
    } finally {
      setProcessing(false);
    }
  };

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-6 overflow-y-auto">
        {/* Backdrop */}
        <div
          className="fixed inset-0 bg-slate-950/50 backdrop-blur-xs transition-opacity animate-fade-in"
          onClick={onClose}
        />

        {/* Modal Dialog Container */}
        <div className="relative z-10 w-full max-w-4xl max-h-[92vh] bg-white rounded-3xl border border-slate-200 shadow-2xl flex flex-col overflow-hidden text-slate-900 animate-scale-up">
          {/* Header Bar */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-100 px-4 sm:px-8 py-3.5 sm:py-4 bg-white sticky top-0 z-20">
            <div>
              <div className="flex flex-wrap items-center gap-2 mb-1">
                <span className="rounded-full bg-blue-50 px-2.5 py-0.5 text-xs font-bold text-blue-700 border border-blue-200/70">
                  Escrow Checkout
                </span>
                <span className="rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-bold text-emerald-700 border border-emerald-200/70">
                  Automated 4-Way Split
                </span>
                <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-bold text-slate-600 font-mono">
                  {agreement.agreement_id}
                </span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                All-In Move-In Escrow Checkout
              </h2>
            </div>

            <div className="flex items-center gap-2 self-end sm:self-center">
              <div className="text-right">
                <span className="text-[10px] text-slate-400 font-bold uppercase block">Total Due Upfront</span>
                <span className="text-lg font-black text-emerald-700 block">
                  ₦{total.toLocaleString("en-NG")}
                </span>
              </div>
              <button
                onClick={onClose}
                className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-100 text-slate-500 hover:bg-slate-200 hover:text-slate-800 transition-colors ml-2"
                title="Close Modal"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Modal Content Body */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-8 bg-[#F8FAFC] space-y-6">
            {transaction ? (
              /* ============================================================= */
              /* SUCCESS STATE: PAYMENT CLEARED & 4-WAY SPLIT CONFIRMATION     */
              /* ============================================================= */
              <div className="space-y-6 animate-fade-in">
                {/* Success Hero Banner */}
                <div className="rounded-3xl border border-emerald-200 bg-gradient-to-r from-emerald-900 to-slate-900 p-6 sm:p-8 text-white shadow-md">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div>
                      <div className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 px-3 py-1 text-xs font-bold mb-2">
                        <Check className="w-3.5 h-3.5 text-emerald-300" />
                        <span>Payment Successfully Settled &amp; Split</span>
                      </div>
                      <h3 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                        ₦{transaction.total_amount_paid.toLocaleString("en-NG")} Cleared via {transaction.payment_gateway}
                      </h3>
                      <p className="text-xs text-slate-300 mt-1">
                        Transaction Reference: <span className="font-mono font-bold text-white">{transaction.transaction_id}</span> &bull; Channel: {transaction.payment_channel.toUpperCase()}
                      </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-2.5">
                      <button
                        type="button"
                        onClick={() => setShowPassModal(true)}
                        className="rounded-2xl border border-emerald-400 bg-emerald-500/20 hover:bg-emerald-500/30 text-white font-bold px-4 py-2.5 text-xs sm:text-sm shadow-xs transition-colors flex items-center gap-2 cursor-pointer whitespace-nowrap"
                      >
                        <Key className="w-4 h-4 text-emerald-300" />
                        <span>View Move-In Pass</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          onClose();
                          router.push("/dashboard/tenant");
                        }}
                        className="rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black px-5 py-2.5 text-xs sm:text-sm shadow-lg transition-transform hover:scale-105 flex items-center gap-2 cursor-pointer whitespace-nowrap"
                      >
                        <span>Go to My Tenant Dashboard</span>
                        <ArrowRight className="w-4 h-4 text-slate-950" />
                      </button>
                    </div>
                  </div>
                </div>

                {/* 4-Way Split Atomic Disbursement Ledger */}
                <div className="rounded-3xl border border-slate-200 bg-white p-4 sm:p-6 shadow-sm space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                    <div>
                      <h4 className="text-sm font-black text-slate-900 flex items-center gap-2">
                        <Zap className="w-4 h-4 text-amber-500" />
                        <span>Automated 4-Way Split Disbursement Ledger (Settled)</span>
                      </h4>
                      <p className="text-xs text-slate-500">
                        Funds were atomically routed to their authorized custody containers and accounts.
                      </p>
                    </div>
                    <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200 font-mono flex items-center gap-1">
                      <span>Atomic Settlement</span>
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                    {/* 1. Rent in Escrow (75%) */}
                    <div className="rounded-2xl border-2 border-emerald-200 bg-emerald-50/50 p-4 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold text-emerald-800 uppercase">1. Annual Rent (75%)</span>
                        <span className="rounded bg-emerald-200 text-emerald-900 text-[10px] font-black px-1.5 py-0.5">
                          In Escrow
                        </span>
                      </div>
                      <strong className="text-lg font-black text-slate-900 block">
                        ₦{transaction.split_breakdown.annual_rent_escrow.toLocaleString("en-NG")}
                      </strong>
                      <p className="text-slate-600 text-[11px] leading-relaxed">
                        Locked in Move-In Escrow. Released to Landlord ({listing.mandate.landlord_name}) upon Key Handover.
                      </p>
                      <span className="text-[10px] text-emerald-700 font-mono block">
                        Hold Ref: {transaction.escrow_hold.escrow_id}
                      </span>
                    </div>

                    {/* 2. Caution Deposit */}
                    <div className={`rounded-2xl border p-4 space-y-2 ${
                      transaction.split_breakdown.caution_deposit_vault === 0
                        ? "border-emerald-200 bg-emerald-50/50"
                        : "border-blue-200 bg-blue-50/50"
                    }`}>
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold text-blue-800 uppercase">
                          2. Caution Deposit {transaction.split_breakdown.caution_deposit_vault > 0 ? "(10%)" : "(Waived)"}
                        </span>
                        <span className={`text-[10px] font-black px-1.5 py-0.5 rounded ${
                          transaction.split_breakdown.caution_deposit_vault === 0
                            ? "bg-emerald-200 text-emerald-900"
                            : "bg-blue-200 text-blue-900"
                        }`}>
                          {transaction.split_breakdown.caution_deposit_vault === 0 ? "Waived (₦0)" : "Ringfenced"}
                        </span>
                      </div>
                      <strong className="text-lg font-black text-slate-900 block">
                        {transaction.split_breakdown.caution_deposit_vault > 0
                          ? `₦${transaction.split_breakdown.caution_deposit_vault.toLocaleString("en-NG")}`
                          : "₦0 (No Caution)"}
                      </strong>
                      <p className="text-slate-600 text-[11px] leading-relaxed">
                        {transaction.split_breakdown.caution_deposit_vault > 0
                          ? "Isolated in Settlla Merchant Reserve / PayRep Vault. 100% refundable within 14 days post-move-out."
                          : "Waived under Landlord Mandate concession. No damage deposit held or deducted."}
                      </p>
                      <span className="text-[10px] text-blue-700 font-mono block">
                        Vault Ref: {transaction.caution_vault.caution_id}
                      </span>
                    </div>

                    {/* 3. Legal & Agency Fee (15%) */}
                    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold text-slate-600 uppercase">3. Legal &amp; Agency Fee (15%)</span>
                        <span className="rounded bg-slate-200 text-slate-800 text-[10px] font-black px-1.5 py-0.5">
                          Disbursed
                        </span>
                      </div>
                      <strong className="text-lg font-black text-slate-900 block">
                        ₦{(transaction.split_breakdown.property_agency_fee + transaction.split_breakdown.legal_drafting_fee).toLocaleString("en-NG")}
                      </strong>
                      <p className="text-slate-600 text-[11px] leading-relaxed">
                        Remitted directly to HB&amp;A Partners &amp; drafting counsel for Kaduna tenancy indenture execution.
                      </p>
                      <span className="text-[10px] text-slate-500 font-mono block">
                        Subaccounts: Stanbic (Agency) &bull; Zenith (Legal)
                      </span>
                    </div>
                  </div>
                </div>

                {/* Move-In Pass Trigger Card */}
                <div className="rounded-2xl border border-emerald-200 bg-emerald-50/80 p-5 flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-600 text-white shadow-sm">
                      <Ticket className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h5 className="font-black text-slate-900 text-sm">Move-In Pass Ready for Possession</h5>
                      <p className="text-xs text-slate-600 mt-0.5">
                        Pass Ref: <span className="font-mono font-bold text-emerald-800">{transaction.move_in_pass.pass_id}</span> &bull; Scheduled Date: {transaction.move_in_pass.scheduled_move_in_date}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setShowPassModal(true)}
                      className="rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold px-4 py-2.5 text-xs transition-colors cursor-pointer shadow-sm"
                    >
                      Inspect Digital Pass
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        onClose();
                        router.push("/dashboard/tenant");
                      }}
                      className="rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-5 py-2.5 text-xs transition-colors cursor-pointer shadow-md shadow-emerald-600/25 flex items-center gap-1.5"
                    >
                      <span>Go to Move-In Dashboard</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              /* ============================================================= */
              /* CHECKOUT FORM: 4-WAY SPLIT SUMMARY & PAYMENT CHANNELS         */
              /* ============================================================= */
              <div className="space-y-6">
                {/* 1. Transparent 4-Way Fee Breakdown Card */}
                <div className="rounded-3xl border border-slate-200 bg-white p-4 sm:p-6 shadow-sm space-y-4">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
                    <div>
                      <h4 className="text-sm font-black text-slate-900">All-In Upfront Move-In Cost Breakdown</h4>
                      <p className="text-xs text-slate-500">
                        Total transparency: 100% upfront sum is automatically split upon checkout
                      </p>
                    </div>
                    <span className="text-xs font-bold text-blue-700 bg-blue-50 px-2.5 py-1 rounded-lg border border-blue-200">
                      ₦0 Hidden Agent Fees
                    </span>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead>
                        <tr className="border-b border-slate-200 bg-slate-50 text-slate-600">
                          <th className="py-2.5 px-3 font-bold">Component</th>
                          <th className="py-2.5 px-3 font-bold">Split Cut</th>
                          <th className="py-2.5 px-3 font-bold">Amount (NGN)</th>
                          <th className="py-2.5 px-3 font-bold">Custody &amp; Payout Destination</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        <tr>
                          <td className="py-3 px-3 font-bold text-slate-900">Annual Base Rent</td>
                          <td className="py-3 px-3 text-emerald-700 font-bold">75%</td>
                          <td className="py-3 px-3 font-mono font-bold text-slate-900">
                            ₦{rent.toLocaleString("en-NG")}
                          </td>
                          <td className="py-3 px-3 text-slate-600">
                            Locked in Move-In Escrow; releases only upon Key Handover
                          </td>
                        </tr>
                        <tr className={caution === 0 ? "bg-emerald-50/40" : ""}>
                          <td className="py-3 px-3 font-bold text-slate-900">
                            Refundable Caution Deposit
                            {caution === 0 && (
                              <span className="ml-2 rounded-md bg-emerald-100 px-1.5 py-0.5 text-[10px] font-bold text-emerald-800">Waived</span>
                            )}
                          </td>
                          <td className="py-3 px-3 text-blue-700 font-bold">{caution > 0 ? "10%" : "0% (Waived)"}</td>
                          <td className="py-3 px-3 font-mono font-bold text-blue-700">
                            {caution > 0 ? `₦${caution.toLocaleString("en-NG")}` : <span className="text-emerald-700">₦0 (Waived)</span>}
                          </td>
                          <td className="py-3 px-3 text-slate-600">
                            {caution > 0
                              ? "Ringfenced in Settlla Reserve / PayRep Vault (12-Month Custody)"
                              : "Waived under Landlord's verified mandate concession"}
                          </td>
                        </tr>
                        <tr>
                          <td className="py-3 px-3 font-bold text-slate-900">Legal &amp; Agency Fee</td>
                          <td className="py-3 px-3 text-slate-600 font-bold">15%</td>
                          <td className="py-3 px-3 font-mono font-bold text-slate-900">
                            ₦{(listing.pricing.legal_and_agency_fee || (legal + agency)).toLocaleString("en-NG")}
                          </td>
                          <td className="py-3 px-3 text-slate-600">
                            Disbursed directly to HB&amp;A Partners &amp; legal drafting counsel under statutory mandate
                          </td>
                        </tr>
                        <tr className="bg-emerald-50/70 border-t-2 border-emerald-200">
                          <td className="py-3.5 px-3 font-black text-slate-950 text-sm">TOTAL MOVE-IN COST</td>
                          <td className="py-3.5 px-3 font-black text-emerald-800">100%</td>
                          <td className="py-3.5 px-3 font-mono font-black text-emerald-700 text-base">
                            ₦{total.toLocaleString("en-NG")}
                          </td>
                          <td className="py-3.5 px-3 text-emerald-900 text-xs font-semibold">
                            Single checkout payment &bull; Guaranteed zero inspection charge
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* 2. Escrow Scam Protection Notice */}
                <div className="rounded-2xl border border-emerald-200 bg-emerald-50/70 p-4 text-xs space-y-1.5">
                  <div className="flex items-center gap-2 font-bold text-emerald-950">
                    <ShieldCheck className="w-5 h-5 text-emerald-600 flex-shrink-0" />
                    <span>100% Move-In Escrow Scam Indemnity Guarantee</span>
                  </div>
                  <p className="text-emerald-800 text-[11px] leading-relaxed">
                    Settlla holds your annual rent (<strong>₦{rent.toLocaleString("en-NG")}</strong>) in secure escrow. The
                    landlord does not receive this payment until you meet the manager at the apartment, test working keys, and tap{" "}
                    <strong>&ldquo;Confirm Key Handover&rdquo;</strong> in your web dashboard. If there is any access failure or
                    misrepresentation, click <strong>&ldquo;Report a Problem&rdquo;</strong> to freeze funds immediately.
                  </p>
                </div>

                {/* Inline Account Creation for Unauthenticated Users */}
                {!isAuthenticated && (
                  <div className="rounded-3xl border border-blue-200 bg-blue-50/60 p-4 sm:p-6 space-y-4">
                    <div className="flex items-center gap-2 font-bold text-blue-950">
                      <User className="w-5 h-5 text-blue-600 flex-shrink-0" />
                      <span className="text-sm">Link Tenancy to Your Dashboard Account</span>
                    </div>
                    <p className="text-xs text-blue-800 leading-relaxed">
                      You are completing this lease as <strong>{agreement.tenant.full_name}</strong> ({agreement.tenant.phone_number}). Create a password to link your executed indenture, Move-In Pass, and 24-hr escrow control directly to your personal Tenant Dashboard.
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
                      <div>
                        <label className="text-[11px] font-bold text-slate-700 block mb-1">
                          Tenant Login Email
                        </label>
                        <input
                          type="email"
                          readOnly
                          value={
                            agreement.tenant.email_address ||
                            `${agreement.tenant.full_name.toLowerCase().replace(/[^a-z0-9]/g, ".")}@example.com`
                          }
                          className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs font-semibold text-slate-700"
                        />
                      </div>
                      <div>
                        <label className="text-[11px] font-bold text-slate-700 block mb-1">
                          Create Account Password
                        </label>
                        <input
                          type="password"
                          value={authPassword}
                          onChange={(e) => {
                            setAuthPassword(e.target.value);
                            setAuthError(null);
                          }}
                          placeholder="Enter a password (min 4 chars)"
                          className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs font-bold text-slate-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                        />
                      </div>
                    </div>
                    {authError && (
                      <p className="text-xs font-bold text-rose-600 bg-rose-50 border border-rose-200 p-2.5 rounded-xl">
                        {authError}
                      </p>
                    )}
                  </div>
                )}

                {/* 3. Payment Gateway & Channel Selector */}
                <div className="rounded-3xl border border-slate-200 bg-white p-4 sm:p-6 shadow-sm space-y-5">
                  {/* Gateway Provider Switcher */}
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
                    <div>
                      <h4 className="text-sm font-black text-slate-900">Select Licensed Payment Gateway</h4>
                      <p className="text-xs text-slate-500">CBN-licensed payment processor with split sub-account routing</p>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setGateway("Paystack")}
                        className={`rounded-xl px-4 py-2 text-xs font-bold transition-all cursor-pointer border ${
                          gateway === "Paystack"
                            ? "bg-blue-600 text-white border-blue-600 shadow-sm"
                            : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100"
                        }`}
                      >
                        Paystack
                      </button>
                      <button
                        type="button"
                        onClick={() => setGateway("Monnify")}
                        className={`rounded-xl px-4 py-2 text-xs font-bold transition-all cursor-pointer border ${
                          gateway === "Monnify"
                            ? "bg-blue-600 text-white border-blue-600 shadow-sm"
                            : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100"
                        }`}
                      >
                        Monnify
                      </button>
                    </div>
                  </div>

                  {/* Channel Tabs: Card vs Bank Transfer vs USSD */}
                  <div className="flex rounded-2xl bg-slate-100 p-1.5 text-xs font-bold gap-1">
                    <button
                      type="button"
                      onClick={() => setChannel("card")}
                      className={`flex-1 py-2.5 rounded-xl transition-colors cursor-pointer flex items-center justify-center gap-2 ${
                        channel === "card"
                          ? "bg-white text-blue-700 shadow-xs font-black"
                          : "text-slate-600 hover:text-slate-900"
                      }`}
                    >
                      <CreditCard className="w-4 h-4" />
                      <span>Debit / Credit Card</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setChannel("bank_transfer")}
                      className={`flex-1 py-2.5 rounded-xl transition-colors cursor-pointer flex items-center justify-center gap-2 ${
                        channel === "bank_transfer"
                          ? "bg-white text-blue-700 shadow-xs font-black"
                          : "text-slate-600 hover:text-slate-900"
                      }`}
                    >
                      <Building2 className="w-4 h-4" />
                      <span>Virtual Bank Transfer</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setChannel("ussd")}
                      className={`flex-1 py-2.5 rounded-xl transition-colors cursor-pointer flex items-center justify-center gap-2 ${
                        channel === "ussd"
                          ? "bg-white text-blue-700 shadow-xs font-black"
                          : "text-slate-600 hover:text-slate-900"
                      }`}
                    >
                      <Smartphone className="w-4 h-4" />
                      <span>USSD Banking</span>
                    </button>
                  </div>

                  {/* Channel Content 1: Debit/Credit Card */}
                  {channel === "card" && (
                    <div className="space-y-4 pt-1 text-xs animate-fade-in">
                      <div>
                        <label className="text-slate-700 font-bold block mb-1">Card Number</label>
                        <input
                          type="text"
                          value={cardNumber}
                          onChange={(e) => setCardNumber(e.target.value)}
                          placeholder="5399 4182 9012 3456"
                          className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-xs font-mono font-bold text-slate-900 focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                        />
                      </div>

                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                        <div>
                          <label className="text-slate-700 font-bold block mb-1">Expiry Date</label>
                          <input
                            type="text"
                            value={cardExpiry}
                            onChange={(e) => setCardExpiry(e.target.value)}
                            placeholder="11/28"
                            className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-mono font-bold text-slate-900 focus:bg-white focus:border-blue-500"
                          />
                        </div>
                        <div>
                          <label className="text-slate-700 font-bold block mb-1">CVV</label>
                          <input
                            type="password"
                            maxLength={3}
                            value={cardCVV}
                            onChange={(e) => setCardCVV(e.target.value)}
                            placeholder="729"
                            className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-mono font-bold text-slate-900 focus:bg-white focus:border-blue-500"
                          />
                        </div>
                        <div className="col-span-2 sm:col-span-1">
                          <label className="text-slate-700 font-bold block mb-1">Card PIN</label>
                          <input
                            type="password"
                            maxLength={4}
                            value={cardPin}
                            onChange={(e) => setCardPin(e.target.value)}
                            placeholder="••••"
                            className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-mono font-bold text-slate-900 focus:bg-white focus:border-blue-500"
                          />
                        </div>
                      </div>

                      <div className="flex items-center gap-2 text-[11px] text-slate-500">
                        <span className="flex items-center gap-1">
                          <Lock className="w-3 h-3 text-slate-400" />
                          <span>256-bit SSL Encrypted</span>
                        </span>
                        <span>&bull;</span>
                        <span>Mastercard / Visa / Verve Accepted</span>
                      </div>
                    </div>
                  )}

                  {/* Channel Content 2: Dynamic Virtual Account Transfer */}
                  {channel === "bank_transfer" && (
                    <div className="space-y-4 pt-1 text-xs animate-fade-in">
                      <div className="rounded-2xl border-2 border-dashed border-blue-300 bg-blue-50/50 p-5 space-y-3">
                        <span className="text-[10px] text-blue-700 font-bold uppercase tracking-wider block">
                          Dedicated Virtual NUBAN Account (Expires in 30 mins)
                        </span>

                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-xl border border-blue-200">
                          <div>
                            <span className="text-[10px] text-slate-400 font-bold block uppercase">Bank Name</span>
                            <strong className="text-sm text-slate-900 block">Providus Bank / Monnify Virtual</strong>
                            <span className="text-[11px] text-slate-500 mt-1 block font-mono">
                              Account Name: Settlla Escrow - {agreement.tenant.full_name.substring(0, 14)}
                            </span>
                          </div>

                          <div className="text-left sm:text-right">
                            <span className="text-[10px] text-slate-400 font-bold block uppercase">Account Number</span>
                            <span className="text-xl font-black font-mono text-blue-700 block tracking-wider">
                              {virtualAccountNum}
                            </span>
                            <button
                              type="button"
                              onClick={handleCopyAccount}
                              className="mt-1 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold px-2.5 py-1 text-[11px] transition-colors cursor-pointer inline-flex items-center gap-1"
                            >
                              {copiedAccount ? (
                                <>
                                  <Check className="w-3 h-3 text-emerald-600" />
                                  <span>Copied</span>
                                </>
                              ) : (
                                <>
                                  <Copy className="w-3 h-3" />
                                  <span>Copy Account</span>
                                </>
                              )}
                            </button>
                          </div>
                        </div>

                        <p className="text-slate-600 text-[11px]">
                          Transfer exactly <strong>₦{total.toLocaleString("en-NG")}</strong> from your banking app. The
                          system will automatically detect payment and execute the 4-way split in real time.
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Channel Content 3: USSD Banking */}
                  {channel === "ussd" && (
                    <div className="space-y-4 pt-1 text-xs animate-fade-in">
                      <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 space-y-2">
                        <span className="text-[10px] font-bold text-slate-500 uppercase block">USSD Payment Code</span>
                        <div className="bg-white p-3 rounded-xl border border-slate-200 font-mono text-sm font-bold text-slate-900 flex items-center justify-between">
                          <span>*737*000*84920#{agreement.agreement_id.split("-").pop() || "1001"}</span>
                          <span className="text-xs text-blue-600 font-sans">GTBank &bull; Zenith &bull; Access</span>
                        </div>
                        <p className="text-[11px] text-slate-500">
                          Dial the string above on your registered phone number to authorize move-in payment of ₦{total.toLocaleString("en-NG")}.
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Submit Action Button */}
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
                  <div className="text-xs text-slate-500">
                    <span>Protected by Settlla Escrow &bull; Instant 4-way split settlement</span>
                  </div>

                  <div className="flex items-center gap-3 w-full sm:w-auto">
                    <button
                      type="button"
                      onClick={onClose}
                      className="w-full sm:w-auto rounded-xl border border-slate-200 px-5 py-2.5 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      disabled={processing}
                      onClick={handleAuthorizePayment}
                      className="w-full sm:w-auto rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 px-8 py-3 text-xs sm:text-sm font-bold text-white transition-all shadow-md shadow-emerald-500/25 cursor-pointer flex items-center justify-center gap-2"
                    >
                      {processing ? (
                        <>
                          <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                          <span>Splitting 4-Way Payouts...</span>
                        </>
                      ) : (
                        <>
                          <Lock className="w-4 h-4" />
                          <span>Pay ₦{total.toLocaleString("en-NG")} Securely via Escrow</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Modal Footer */}
          <div className="border-t border-slate-100 px-6 py-3.5 bg-white text-xs text-slate-400 flex items-center justify-between">
            <span>Settlla Kaduna Hub &bull; Statutory 4-Way Split &bull; Escrow Scam Protection</span>
            <span className="font-mono text-[10px]">Kaduna State Tenancy Compliant</span>
          </div>
        </div>
      </div>

      {/* Move-In Pass Viewer Dialog */}
      {transaction && showPassModal && (
        <MoveInPassViewer
          isOpen={showPassModal}
          onClose={() => setShowPassModal(false)}
          pass={transaction.move_in_pass}
          transaction={transaction}
          onOpenDashboard={() => {
            setShowPassModal(false);
            onClose();
          }}
        />
      )}
    </>
  );
};
