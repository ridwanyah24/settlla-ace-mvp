"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { TenancyAgreement } from "@/types/agreement";
import { Listing } from "@/types/listing";
import { PaymentTransaction } from "@/types/payment";
import { processMoveInPayment } from "@/lib/settlla/payments";
import { EmailCodeVerify } from "./EmailCodeVerify";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import {
  assertPassword,
  formatSupabaseAuthError,
  MIN_PASSWORD_LENGTH,
} from "@/lib/settlla/authErrors";
import { MoveInPassViewer } from "./MoveInPassViewer";
import {
  X,
  Check,
  Key,
  ArrowRight,
  CreditCard,
  Building2,
  Smartphone,
  Lock,
  Copy,
  Info,
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
  const [pendingCodeEmail, setPendingCodeEmail] = useState<string | null>(null);

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

  const completePayment = async () => {
    setProcessing(true);
    setErrorMessage(null);
    try {
      const data = await processMoveInPayment({
        agreement,
        listing,
        gateway,
        channel,
        gateway_ref: `T${Date.now()}_SETT`,
      });
      setTransaction(data);
      if (onPaymentSuccess) onPaymentSuccess(data);
    } catch {
      setErrorMessage("Payment could not be completed. Please try again.");
    } finally {
      setProcessing(false);
    }
  };

  // Process Payment Execution
  const handleAuthorizePayment = async () => {
    setErrorMessage(null);
    setAuthError(null);

    // If guest / unauthenticated, create and link account
    if (!isAuthenticated && !currentUser) {
      const supabaseMode = isSupabaseConfigured();
      try {
        assertPassword(authPassword, supabaseMode);
      } catch (err) {
        setAuthError(
          supabaseMode
            ? formatSupabaseAuthError(err)
            : `Please create a password (at least ${MIN_PASSWORD_LENGTH} characters) to link your Tenant Dashboard account.`
        );
        return;
      }
      if (!supabaseMode && (!authPassword || authPassword.trim().length < MIN_PASSWORD_LENGTH)) {
        setAuthError(
          `Please create a password (at least ${MIN_PASSWORD_LENGTH} characters) to link your Tenant Dashboard account.`
        );
        return;
      }
      const emailToUse =
        agreement.tenant.email_address ||
        `${agreement.tenant.full_name.toLowerCase().replace(/[^a-z0-9]/g, ".")}@example.com`;
      try {
        const result = await signUp({
          fullName: agreement.tenant.full_name,
          email: emailToUse,
          password: authPassword,
          role: "tenant",
          phoneNumber: agreement.tenant.phone_number || "0803 123 4567",
          ninNumber: agreement.tenant.nin_number,
        });
        if (result.needsEmailConfirmation) {
          setPendingCodeEmail(emailToUse);
          return;
        }
      } catch (err) {
        setAuthError(formatSupabaseAuthError(err));
        return;
      }
    }

    await completePayment();
  };

  const goToTenantDashboard = () => {
    onClose();
    router.push("/dashboard/tenant?tab=escrow");
  };

  if (!isOpen) return null;

  if (transaction) {
    return (
      <>
        <div className="settlla-overlay">
          <div className="fixed inset-0 bg-slate-950/55 backdrop-blur-xs" aria-hidden />
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="payment-success-title"
            className="settlla-dialog settlla-dialog--sm p-6"
          >
            <div className="text-center">
              <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100">
                <Check className="h-7 w-7 text-emerald-600" aria-hidden />
              </div>
              <h2 id="payment-success-title" className="text-lg font-black text-slate-900">
                Payment successful
              </h2>
              <p className="mt-1 text-2xl font-black text-emerald-700">
                ₦{transaction.total_amount_paid.toLocaleString("en-NG")}
              </p>
              <p className="mt-2 text-[11px] text-slate-500 font-mono">{transaction.transaction_id}</p>
            </div>

            <div className="mt-5 rounded-xl border border-amber-200 bg-amber-50/90 p-3.5 flex gap-2.5 text-left">
              <Info className="h-4 w-4 text-amber-700 shrink-0 mt-0.5" aria-hidden />
              <p className="text-xs text-amber-950 leading-relaxed">
                <strong className="font-bold">Next step:</strong> Confirm key handover in your
                dashboard when you receive working keys. Escrow rent is only released to the
                landlord after you confirm.
              </p>
            </div>

            <div className="mt-5 flex flex-col gap-2">
              <div className="relative">
                <div
                  role="tooltip"
                  id="keys-dashboard-tooltip"
                  className="relative mb-2 rounded-xl bg-slate-900 px-3.5 py-2.5 text-[12px] font-medium leading-snug text-white shadow-lg"
                >
                  Confirm keys in your Dashboard after you move in — then continue. Rent stays in
                  escrow until you tap <span className="font-bold">Confirm key</span>.
                  <span
                    className="absolute left-1/2 top-full -translate-x-1/2 border-8 border-transparent border-t-slate-900"
                    aria-hidden
                  />
                </div>
                <button
                  type="button"
                  aria-describedby="keys-dashboard-tooltip"
                  onClick={goToTenantDashboard}
                  className="w-full rounded-xl bg-emerald-600 py-3 text-sm font-bold text-white hover:bg-emerald-700 flex items-center justify-center gap-2"
                >
                  Continue to dashboard
                  <ArrowRight className="h-4 w-4" />
                </button>
              </div>
              <button
                type="button"
                onClick={() => setShowPassModal(true)}
                className="w-full rounded-xl border border-slate-200 py-2.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 flex items-center justify-center gap-2"
              >
                <Key className="h-4 w-4" />
                View move-in pass
              </button>
            </div>
          </div>
        </div>

        {showPassModal && (
          <MoveInPassViewer
            isOpen={showPassModal}
            onClose={() => setShowPassModal(false)}
            pass={transaction.move_in_pass}
            transaction={transaction}
            onOpenDashboard={() => {
              setShowPassModal(false);
              goToTenantDashboard();
            }}
          />
        )}
      </>
    );
  }

  return (
    <>
      <div className="settlla-overlay">
        {/* Backdrop */}
        <div
          className="fixed inset-0 bg-slate-950/50 backdrop-blur-xs transition-opacity animate-fade-in"
          onClick={onClose}
        />

        {/* Modal Dialog Container */}
        <div className="settlla-dialog settlla-dialog--md">
          {/* Header Bar */}
          <div className="flex items-start justify-between gap-3 border-b border-slate-100 px-5 py-4 bg-white sticky top-0 z-20">
            <div className="min-w-0">
              <h2 className="text-lg font-black text-slate-900 tracking-tight">Move-in payment</h2>
              <p className="text-xs text-slate-500 truncate mt-0.5">{listing.title}</p>
            </div>
            <button
              onClick={onClose}
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-500 hover:bg-slate-200"
              aria-label="Close"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Modal Content Body */}
          <div className="flex-1 overflow-y-auto px-5 py-5 bg-slate-50/80 space-y-5">
              <div className="space-y-5">
                {/* Cost breakdown — primary focus */}
                <section className="rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-sm">
                  <div className="px-4 py-3 border-b border-slate-100">
                    <h3 className="text-sm font-black text-slate-900">Cost breakdown</h3>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      Rent stays in escrow until you confirm keys in your dashboard.
                    </p>
                  </div>
                  <ul className="divide-y divide-slate-100 text-sm">
                    <li className="flex items-start justify-between gap-3 px-4 py-3">
                      <div>
                        <span className="font-semibold text-slate-900">Annual rent</span>
                        <span className="block text-[11px] text-emerald-700">Held in escrow</span>
                      </div>
                      <span className="font-bold text-slate-900 shrink-0">₦{rent.toLocaleString("en-NG")}</span>
                    </li>
                    <li className="flex items-center justify-between gap-3 px-4 py-3">
                      <span className="font-semibold text-slate-900">
                        Caution deposit
                        {caution === 0 && (
                          <span className="ml-1.5 text-[10px] font-bold text-emerald-700">(waived)</span>
                        )}
                      </span>
                      <span className="font-bold text-slate-900 shrink-0">
                        {caution > 0 ? `₦${caution.toLocaleString("en-NG")}` : "₦0"}
                      </span>
                    </li>
                    <li className="flex items-center justify-between gap-3 px-4 py-3">
                      <span className="font-semibold text-slate-900">Legal &amp; agency (15%)</span>
                      <span className="font-bold text-slate-900 shrink-0">
                        ₦{(listing.pricing.legal_and_agency_fee || legal + agency).toLocaleString("en-NG")}
                      </span>
                    </li>
                    <li className="flex items-center justify-between gap-3 px-4 py-3.5 bg-emerald-50/80">
                      <span className="font-black text-slate-900">Total due today</span>
                      <span className="text-lg font-black text-emerald-700 shrink-0">
                        ₦{total.toLocaleString("en-NG")}
                      </span>
                    </li>
                  </ul>
                </section>

                {errorMessage && (
                  <p className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-xs text-rose-800">
                    {errorMessage}
                  </p>
                )}

                {!isAuthenticated && pendingCodeEmail && (
                  <section className="rounded-2xl border border-slate-200 bg-white p-4">
                    <EmailCodeVerify
                      email={pendingCodeEmail}
                      onVerified={() => {
                        setPendingCodeEmail(null);
                        void completePayment();
                      }}
                      onBack={() => setPendingCodeEmail(null)}
                    />
                  </section>
                )}

                {/* Account — required for guests */}
                {!isAuthenticated && !pendingCodeEmail && (
                  <section className="rounded-2xl border border-slate-200 bg-white p-4 space-y-3">
                    <p className="text-xs font-bold text-slate-900">
                      <span className="text-slate-400 font-semibold mr-1">1.</span>
                      Dashboard account
                    </p>
                    <div>
                      <label className="text-[11px] font-semibold text-slate-600 block mb-1">Email</label>
                      <input
                        type="email"
                        readOnly
                        value={
                          agreement.tenant.email_address ||
                          `${agreement.tenant.full_name.toLowerCase().replace(/[^a-z0-9]/g, ".")}@example.com`
                        }
                        className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-xs text-slate-700"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] font-semibold text-slate-600 block mb-1">
                        Password <span className="text-rose-600">*</span>
                      </label>
                      <input
                        type="password"
                        value={authPassword}
                        onChange={(e) => {
                          setAuthPassword(e.target.value);
                          setAuthError(null);
                        }}
                        placeholder={`Min. ${MIN_PASSWORD_LENGTH} characters`}
                        minLength={MIN_PASSWORD_LENGTH}
                        className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-xs font-semibold text-slate-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                      />
                    </div>
                    {authError && (
                      <p className="text-xs text-rose-600">{authError}</p>
                    )}
                  </section>
                )}

                {/* Payment */}
                {!pendingCodeEmail && (
                <section className="rounded-2xl border border-slate-200 bg-white p-4 space-y-4">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-xs font-bold text-slate-900">
                      <span className="text-slate-400 font-semibold mr-1">{isAuthenticated ? "1" : "2"}.</span>
                      Payment
                    </p>
                    <div className="flex gap-1">
                      <button
                        type="button"
                        onClick={() => setGateway("Paystack")}
                        className={`rounded-lg px-2.5 py-1 text-[10px] font-bold border ${
                          gateway === "Paystack"
                            ? "bg-slate-900 text-white border-slate-900"
                            : "bg-white text-slate-600 border-slate-200"
                        }`}
                      >
                        Paystack
                      </button>
                      <button
                        type="button"
                        onClick={() => setGateway("Monnify")}
                        className={`rounded-lg px-2.5 py-1 text-[10px] font-bold border ${
                          gateway === "Monnify"
                            ? "bg-slate-900 text-white border-slate-900"
                            : "bg-white text-slate-600 border-slate-200"
                        }`}
                      >
                        Monnify
                      </button>
                    </div>
                  </div>

                  <div className="flex rounded-xl bg-slate-100 p-1 text-[11px] font-bold gap-0.5">
                    <button
                      type="button"
                      onClick={() => setChannel("card")}
                      className={`flex-1 py-2.5 rounded-xl transition-colors cursor-pointer flex items-center justify-center gap-2 ${
                        channel === "card"
                          ? "bg-white text-blue-700 shadow-xs font-black"
                          : "text-slate-600 hover:text-slate-900"
                      }`}
                    >
                      <CreditCard className="w-3.5 h-3.5 hidden sm:block" />
                      <span>Card</span>
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
                      <Building2 className="w-3.5 h-3.5 hidden sm:block" />
                      <span>Transfer</span>
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
                      <Smartphone className="w-3.5 h-3.5 hidden sm:block" />
                      <span>USSD</span>
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

                    </div>
                  )}

                  {channel === "bank_transfer" && (
                    <div className="space-y-3 text-xs animate-fade-in">
                      <p className="text-[11px] text-slate-600">
                        Transfer exactly <strong>₦{total.toLocaleString("en-NG")}</strong> to this account:
                      </p>
                      <div className="rounded-xl border border-blue-200 bg-blue-50/50 p-3 space-y-2">
                        <p className="text-[11px] text-slate-600">Providus / Monnify virtual</p>
                        <p className="text-lg font-black font-mono text-blue-800 tracking-wide">{virtualAccountNum}</p>
                        <button
                          type="button"
                          onClick={handleCopyAccount}
                          className="rounded-lg bg-white border border-blue-200 text-blue-700 font-bold px-2.5 py-1 text-[11px] inline-flex items-center gap-1"
                        >
                          {copiedAccount ? (
                            <>
                              <Check className="w-3 h-3" />
                              Copied
                            </>
                          ) : (
                            <>
                              <Copy className="w-3 h-3" />
                              Copy number
                            </>
                          )}
                        </button>
                      </div>
                      <p className="text-[11px] text-slate-500">
                        Then tap Pay below — we&apos;ll match your transfer.
                      </p>
                    </div>
                  )}

                  {channel === "ussd" && (
                    <div className="space-y-2 text-xs animate-fade-in">
                      <label className="text-[11px] font-semibold text-slate-600">Dial on your phone</label>
                      <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 font-mono text-sm font-bold text-slate-900">
                        *737*000*84920#{agreement.agreement_id.split("-").pop() || "1001"}
                      </div>
                      <p className="text-[11px] text-slate-500">Amount: ₦{total.toLocaleString("en-NG")}</p>
                    </div>
                  )}
                </section>
                )}
              </div>
          </div>

          <div className="border-t border-slate-100 px-5 py-4 bg-white flex flex-col gap-2 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={onClose}
                className="rounded-xl border border-slate-200 px-4 py-2.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 order-2 sm:order-1"
              >
                Cancel
              </button>
              {!pendingCodeEmail && (
              <button
                type="button"
                disabled={processing}
                onClick={handleAuthorizePayment}
                className="rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 px-5 py-2.5 text-xs font-bold text-white flex items-center justify-center gap-2 order-1 sm:order-2"
              >
                {processing ? (
                  <>
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    Processing…
                  </>
                ) : (
                  <>
                    <Lock className="w-4 h-4" />
                    Pay ₦{total.toLocaleString("en-NG")}
                  </>
                )}
              </button>
              )}
            </div>
        </div>
      </div>
    </>
  );
};
