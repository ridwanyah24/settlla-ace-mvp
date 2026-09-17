"use client";

import React, { useState, useEffect } from "react";
import { EscrowHoldRecord, MoveInPass, MoveInDisputeRecord, PaymentTransaction } from "@/types/payment";
import { Listing } from "@/types/listing";
import { TenancyAgreement } from "@/types/agreement";
import {
  ShieldCheck,
  Check,
  CheckCircle2,
  X,
  RotateCcw,
  AlertTriangle,
  AlertCircle,
  Lock,
  ArrowRight,
  Phone,
  Key,
  Clock,
  Ticket,
  FileText,
  Ban,
  Users,
  BarChart3,
} from "lucide-react";

interface MoveInEscrowDashboardModalProps {
  isOpen: boolean;
  onClose: () => void;
  escrowRecord?: EscrowHoldRecord | null;
  listing: Listing;
  agreement?: TenancyAgreement | null;
  pass?: MoveInPass | null;
  transaction?: PaymentTransaction | null;
  onViewPass?: () => void;
  onViewAgreement?: () => void;
  onEscrowUpdated?: (updated: EscrowHoldRecord) => void;
}

export const MoveInEscrowDashboardModal: React.FC<MoveInEscrowDashboardModalProps> = ({
  isOpen,
  onClose,
  escrowRecord: initialEscrow,
  listing,
  agreement,
  pass,
  transaction,
  onViewPass,
  onViewAgreement,
  onEscrowUpdated,
}) => {
  const defaultEscrow: EscrowHoldRecord = {
    escrow_id: "SETT-ESC-2026-1001",
    transaction_id: "SETT-TX-2026-1001",
    agreement_id: agreement?.agreement_id || "SETT-AGR-2026-1001",
    listing_id: listing?.id || "listing-malali-01",
    tenant_name: agreement?.tenant?.full_name || "Verified Tenant",
    landlord_name: listing?.mandate?.landlord_name || "Alhaji Shehu Garba",
    landlord_bank_name: "First Bank of Nigeria (Kaduna Main Branch)",
    landlord_account_num: "2019876543",
    amount_held: listing ? Math.round(listing.pricing.annual_rent * 0.75) : 500000,
    currency: "NGN",
    scheduled_move_in: "Wednesday, Oct 01, 2026",
    auto_release_at: "2026-10-01 23:59:59 (+24h Safety Timer)",
    escrow_status: "holding",
    confirmed_by_tenant: false,
    confirmed_at: null,
    dispute_active: false,
    release_reason: null,
    disbursement_ref: null,
    timer_paused: false,
    active_dispute: null,
    guarantee_seal: "100% Scam Indemnity Guarantee",
    created_at: new Date().toISOString(),
  };

  const resolvedInitialEscrow = initialEscrow || defaultEscrow;
  const [escrow, setEscrow] = useState<EscrowHoldRecord>(resolvedInitialEscrow);
  const [activeTab, setActiveTab] = useState<"overview" | "dispute_form" | "audit_log">("overview");

  // Key Handover Action States
  const [confirmingHandover, setConfirmingHandover] = useState(false);
  const [handoverSuccess, setHandoverSuccess] = useState(false);

  // Dispute / Report Problem States
  const [issueCategory, setIssueCategory] = useState<
    "key_failure" | "access_denied" | "property_misrepresentation" | "unauthorized_occupants"
  >("key_failure");
  const [disputeDescription, setDisputeDescription] = useState("");
  const [submittingDispute, setSubmittingDispute] = useState(false);
  const [disputeRecord, setDisputeRecord] = useState<MoveInDisputeRecord | null>(
    resolvedInitialEscrow.active_dispute || null
  );

  // Admin / Resolution Action States
  const [resolvingAction, setResolvingAction] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // 24-Hour Safety Timer Simulation
  const [timerSecondsLeft, setTimerSecondsLeft] = useState<number>(24 * 3600 - 120); // ~23h 58m
  const [timerPaused, setTimerPaused] = useState<boolean>(
    Boolean(resolvedInitialEscrow.timer_paused || resolvedInitialEscrow.dispute_active)
  );

  useEffect(() => {
    if (initialEscrow) {
      setEscrow(initialEscrow);
      if (initialEscrow.active_dispute) {
        setDisputeRecord(initialEscrow.active_dispute);
      }
      setTimerPaused(
        Boolean(
          initialEscrow.timer_paused ||
            initialEscrow.dispute_active ||
            initialEscrow.escrow_status !== "holding"
        )
      );
    }
  }, [initialEscrow]);

  // Live countdown tick
  useEffect(() => {
    if (timerPaused || escrow.escrow_status !== "holding") return;
    const interval = setInterval(() => {
      setTimerSecondsLeft((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, [timerPaused, escrow.escrow_status]);

  if (!isOpen) return null;

  const formatTimer = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return `${h.toString().padStart(2, "0")}h ${m.toString().padStart(2, "0")}m ${s.toString().padStart(2, "0")}s`;
  };

  // 1. Confirm Key Handover Handler
  const handleConfirmHandover = async () => {
    setConfirmingHandover(true);
    setErrorMessage(null);
    try {
      const res = await fetch(`http://127.0.0.1:8000/api/escrow/${escrow.escrow_id}/confirm-key-handover`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });
      if (res.ok) {
        const updated: EscrowHoldRecord = await res.json();
        setEscrow(updated);
        setHandoverSuccess(true);
        setTimerPaused(true);
        if (onEscrowUpdated) onEscrowUpdated(updated);
        return;
      }
      throw new Error("Failed to confirm key handover with backend");
    } catch {
      // Local fallback for demo simulation
      const nowIso = new Date().toISOString().replace("T", " ").substring(0, 19);
      const updated: EscrowHoldRecord = {
        ...escrow,
        escrow_status: "released",
        confirmed_by_tenant: true,
        confirmed_at: nowIso,
        release_reason: "tenant_button",
        disbursement_ref: `TRF_${new Date().getFullYear()}${String(new Date().getMonth() + 1).padStart(2, "0")}${String(
          new Date().getDate()
        ).padStart(2, "0")}_${escrow.escrow_id.split("-").pop() || "1001"}`,
      };
      setEscrow(updated);
      setHandoverSuccess(true);
      setTimerPaused(true);
      if (onEscrowUpdated) onEscrowUpdated(updated);
    } finally {
      setConfirmingHandover(false);
    }
  };

  // 2. Trigger 24h Safety Timer Fallback Handler
  const handleSimulateAutoRelease = async () => {
    setConfirmingHandover(true);
    setErrorMessage(null);
    try {
      const res = await fetch(`http://127.0.0.1:8000/api/escrow/${escrow.escrow_id}/auto-release-trigger`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });
      if (res.ok) {
        const updated: EscrowHoldRecord = await res.json();
        setEscrow(updated);
        setTimerSecondsLeft(0);
        setTimerPaused(true);
        if (onEscrowUpdated) onEscrowUpdated(updated);
        return;
      }
      throw new Error("Failed to trigger safety timer with backend");
    } catch {
      const nowIso = new Date().toISOString().replace("T", " ").substring(0, 19);
      const updated: EscrowHoldRecord = {
        ...escrow,
        escrow_status: "released",
        confirmed_by_tenant: false,
        confirmed_at: nowIso,
        release_reason: "auto_timer_24h",
        disbursement_ref: `TRF_AUTO24H_${escrow.escrow_id.split("-").pop() || "1001"}`,
      };
      setEscrow(updated);
      setTimerSecondsLeft(0);
      setTimerPaused(true);
      if (onEscrowUpdated) onEscrowUpdated(updated);
    } finally {
      setConfirmingHandover(false);
    }
  };

  // 3. Submit Dispute / Report a Problem Handler
  const handleSubmitDispute = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!disputeDescription.trim()) {
      setErrorMessage("Please describe the issue encountered on-site before submitting.");
      return;
    }

    setSubmittingDispute(true);
    setErrorMessage(null);

    const payload = {
      issue_category: issueCategory,
      description: disputeDescription,
      evidence_urls: [
        "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=600&q=80",
      ],
      reporter_phone: pass?.tenant_phone || "0803 123 4567",
    };

    try {
      const res = await fetch(`http://127.0.0.1:8000/api/escrow/${escrow.escrow_id}/dispute`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        const dispute: MoveInDisputeRecord = await res.json();
        setDisputeRecord(dispute);
        setEscrow((prev) => ({
          ...prev,
          escrow_status: "disputed_frozen",
          dispute_active: true,
          timer_paused: true,
          active_dispute: dispute,
        }));
        setTimerPaused(true);
        setActiveTab("overview");
        if (onEscrowUpdated) {
          onEscrowUpdated({
            ...escrow,
            escrow_status: "disputed_frozen",
            dispute_active: true,
            timer_paused: true,
            active_dispute: dispute,
          });
        }
        return;
      }
      throw new Error("Failed to register dispute with backend");
    } catch {
      const nowIso = new Date().toISOString().replace("T", " ").substring(0, 19);
      const fallbackDispute: MoveInDisputeRecord = {
        dispute_id: `SETT-DSP-2026-${Math.floor(100 + Math.random() * 900)}`,
        escrow_id: escrow.escrow_id,
        agreement_id: escrow.agreement_id,
        listing_id: escrow.listing_id,
        tenant_name: escrow.tenant_name,
        issue_category: issueCategory,
        description: disputeDescription,
        evidence_urls: payload.evidence_urls,
        reporter_phone: payload.reporter_phone,
        date_logged: nowIso,
        dispute_status: "open_frozen",
        admin_verdict: null,
        refund_reference: null,
        resolution_notes: "Immediate 2-Hour Escalation SLA triggered. Escrow payout halted.",
        indemnity_seal: "100% Scam Indemnity Guarantee",
      };

      setDisputeRecord(fallbackDispute);
      const updated: EscrowHoldRecord = {
        ...escrow,
        escrow_status: "disputed_frozen",
        dispute_active: true,
        timer_paused: true,
        active_dispute: fallbackDispute,
      };
      setEscrow(updated);
      setTimerPaused(true);
      setActiveTab("overview");
      if (onEscrowUpdated) onEscrowUpdated(updated);
    } finally {
      setSubmittingDispute(false);
    }
  };

  // 4. Resolve Dispute (Refund vs On-Site Clear)
  const handleResolveDispute = async (action: "refund" | "resolve_clear") => {
    setResolvingAction(true);
    setErrorMessage(null);

    const payload = {
      action: action,
      verdict: action === "refund" ? "fault_landlord" : "resolved_amicably",
      notes:
        action === "refund"
          ? "Full 100% refund executed under Scam Indemnity Guarantee."
          : "Replacement keys tested and confirmed on-site by HB&A Partners.",
    };

    try {
      const res = await fetch(`http://127.0.0.1:8000/api/escrow/${escrow.escrow_id}/resolve-dispute`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        const updated: EscrowHoldRecord = await res.json();
        setEscrow(updated);
        if (updated.active_dispute) setDisputeRecord(updated.active_dispute);
        if (onEscrowUpdated) onEscrowUpdated(updated);
        return;
      }
      throw new Error("Failed to resolve dispute on backend");
    } catch {
      const refundRef = `REF_INDEMNITY_${escrow.escrow_id.split("-").pop() || "1001"}_9921`;
      const transferRef = `TRF_RESOLVED_${escrow.escrow_id.split("-").pop() || "1001"}`;
      const nowIso = new Date().toISOString().replace("T", " ").substring(0, 19);

      if (action === "refund") {
        const updatedDispute: MoveInDisputeRecord | null = disputeRecord
          ? {
              ...disputeRecord,
              dispute_status: "resolved_refunded",
              admin_verdict: "fault_landlord",
              refund_reference: refundRef,
              resolution_notes: "Full 100% refund executed under Scam Indemnity Guarantee.",
            }
          : null;

        const updated: EscrowHoldRecord = {
          ...escrow,
          escrow_status: "refunded",
          dispute_active: false,
          release_reason: "100% Scam Indemnity Full Refund Issued to Tenant",
          disbursement_ref: refundRef,
          active_dispute: updatedDispute,
        };
        setEscrow(updated);
        setDisputeRecord(updatedDispute);
        if (onEscrowUpdated) onEscrowUpdated(updated);
      } else {
        const updatedDispute: MoveInDisputeRecord | null = disputeRecord
          ? {
              ...disputeRecord,
              dispute_status: "resolved_cleared",
              admin_verdict: "resolved_amicably",
              resolution_notes: "Replacement keys tested and confirmed on-site by HB&A Partners.",
            }
          : null;

        const updated: EscrowHoldRecord = {
          ...escrow,
          escrow_status: "released",
          dispute_active: false,
          confirmed_by_tenant: true,
          confirmed_at: nowIso,
          release_reason: "Keys Delivered & Handover Confirmed Post-Resolution",
          disbursement_ref: transferRef,
          active_dispute: updatedDispute,
        };
        setEscrow(updated);
        setDisputeRecord(updatedDispute);
        if (onEscrowUpdated) onEscrowUpdated(updated);
      }
    } finally {
      setResolvingAction(false);
    }
  };

  const getStatusBadge = () => {
    switch (escrow.escrow_status) {
      case "holding":
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-400/40 px-3 py-1 text-xs font-black">
            <span className="h-2 w-2 rounded-full bg-blue-400 animate-pulse" />
            <span>Active Move-In Escrow Protection</span>
          </span>
        );
      case "released":
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/40 px-3 py-1 text-xs font-black">
            <Check className="h-3.5 w-3.5" />
            <span>Completed &amp; Settled (Keys Delivered)</span>
          </span>
        );
      case "disputed_frozen":
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-400/40 px-3 py-1 text-xs font-black">
            <span className="h-2 w-2 rounded-full bg-amber-400 animate-ping" />
            <span>Escrow Frozen (Dispute Under Investigation)</span>
          </span>
        );
      case "refunded":
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-400/40 px-3 py-1 text-xs font-black">
            <RotateCcw className="h-3.5 w-3.5" />
            <span>100% Scam Indemnity Refund Settled</span>
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs transition-opacity animate-fade-in" onClick={onClose} />

      {/* Main Dialog */}
      <div className="relative z-10 w-full max-w-4xl max-h-[92vh] bg-white rounded-3xl border border-slate-200 shadow-2xl flex flex-col overflow-hidden text-slate-900 animate-scale-up">
        {/* Header Bar */}
        <div className="bg-gradient-to-r from-[#0B1528] via-slate-900 to-emerald-950 px-6 sm:px-8 py-5 text-white flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-800">
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-1.5">
              <span className="rounded-full bg-white/10 px-2.5 py-0.5 text-[10px] font-bold text-slate-300 border border-white/10 uppercase tracking-wider">
                Move-In Escrow &amp; Tenancy Status
              </span>
              <span className="rounded-full bg-emerald-400/20 px-2.5 py-0.5 text-[10px] font-mono font-bold text-emerald-300 border border-emerald-400/30">
                {escrow.escrow_id}
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white flex items-center gap-2">
              <ShieldCheck className="h-6 w-6 text-emerald-400" />
              <span>Key-in-Door Escrow Protection Hub</span>
            </h2>
            <p className="text-xs text-slate-300 mt-0.5">
              {listing.title} &bull; {listing.full_address}
            </p>
          </div>

          <div className="flex items-center gap-2 self-end sm:self-center">
            {getStatusBadge()}
            <button
              type="button"
              onClick={onClose}
              className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/10 text-white hover:bg-white/20 transition-colors ml-2 cursor-pointer"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Navigation Tab Bar */}
        <div className="flex border-b border-slate-200 bg-slate-50 px-6 sm:px-8 py-2 text-xs font-bold gap-2">
          <button
            type="button"
            onClick={() => setActiveTab("overview")}
            className={`px-4 py-2 rounded-xl transition-colors cursor-pointer flex items-center gap-1.5 ${
              activeTab === "overview" ? "bg-white text-blue-700 shadow-xs border border-slate-200" : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <BarChart3 className="w-3.5 h-3.5 text-blue-600" />
            <span>Escrow &amp; Move-In Overview</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("dispute_form")}
            className={`px-4 py-2 rounded-xl transition-colors cursor-pointer flex items-center gap-1.5 ${
              activeTab === "dispute_form" ? "bg-white text-rose-700 shadow-xs border border-slate-200" : "text-slate-600 hover:text-rose-700"
            }`}
          >
            <AlertTriangle className="w-3.5 h-3.5 text-rose-500" />
            <span>Report a Problem (Freeze Escrow)</span>
            {escrow.dispute_active && (
              <span className="h-2 w-2 rounded-full bg-rose-500 animate-ping" />
            )}
          </button>
        </div>

        {/* Modal Body Content */}
        <div className="flex-1 overflow-y-auto p-6 sm:p-8 bg-[#F8FAFC] space-y-6">
          {errorMessage && (
            <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-xs font-semibold text-rose-800 flex items-center gap-2 animate-shake">
              <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {activeTab === "overview" && (
            <div className="space-y-6 animate-fade-in">
              {/* 1. STATE-DEPENDENT HERO BANNER */}

              {/* State A: DISPUTED FROZEN */}
              {escrow.escrow_status === "disputed_frozen" && (
                <div className="rounded-3xl border-2 border-amber-300 bg-gradient-to-r from-amber-950 via-slate-900 to-rose-950 p-6 sm:p-8 text-white shadow-lg space-y-4">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-white/10 pb-4">
                    <div>
                      <div className="inline-flex items-center gap-2 rounded-full bg-amber-500/20 text-amber-300 border border-amber-400/40 px-3 py-1 text-xs font-bold mb-2">
                        <ShieldCheck className="w-4 h-4 text-amber-300" />
                        <span>Emergency Payout Freeze Activated</span>
                      </div>
                      <h3 className="text-2xl font-black text-white">
                        Escrow Frozen: Our Kaduna Team Is Intervening
                      </h3>
                      <p className="text-xs text-slate-300 mt-1">
                        Dispute Ref: <span className="font-mono font-bold text-amber-300">{disputeRecord?.dispute_id || "SETT-DSP-901"}</span> &bull; Logged: {disputeRecord?.date_logged || "Today"}
                      </p>
                    </div>

                    <div className="text-right">
                      <span className="text-[10px] uppercase font-bold text-slate-400 block">Protected Rent Amount</span>
                      <strong className="text-2xl font-black text-amber-300">
                        ₦{escrow.amount_held.toLocaleString("en-NG")}
                      </strong>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                    <div className="rounded-2xl bg-white/10 p-4 border border-white/10 space-y-1">
                      <span className="text-[10px] uppercase font-bold text-amber-400">Nature of Issue</span>
                      <strong className="block text-white capitalize text-sm">
                        {disputeRecord?.issue_category.replace("_", " ") || "Key Failure / Access Denied"}
                      </strong>
                      <p className="text-slate-300 text-[11px] mt-1">
                        &ldquo;{disputeRecord?.description || "Access failure reported by tenant at residence."}&rdquo;
                      </p>
                    </div>

                    <div className="rounded-2xl bg-white/10 p-4 border border-white/10 space-y-1">
                      <span className="text-[10px] uppercase font-bold text-emerald-400">2-Hour Escalation Guarantee</span>
                      <p className="text-slate-200 text-[11px] leading-relaxed">
                        Settlla Concierge has contacted HB&amp;A Partners and placed a hold on landlord disbursements. If access is not remediated, you will receive a 100% refund.
                      </p>
                      <span className="text-[10px] font-mono text-emerald-300 block pt-1">
                        Emergency Contact: +234 800 SETTLLA (0800 738 8552)
                      </span>
                    </div>
                  </div>

                  {/* Concierge Action Controls (Dispute Resolution & Scam Indemnity) */}
                  <div className="pt-2 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-3">
                    <span className="text-[11px] text-slate-400">
                      Concierge Operations Controls:
                    </span>

                    <div className="flex items-center gap-2 w-full sm:w-auto">
                      <button
                        type="button"
                        disabled={resolvingAction}
                        onClick={() => handleResolveDispute("refund")}
                        className="flex-1 sm:flex-none rounded-xl bg-rose-600 hover:bg-rose-500 disabled:opacity-50 text-white font-bold px-4 py-2 text-xs transition-colors cursor-pointer shadow-sm flex items-center justify-center gap-1.5"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                        <span>{resolvingAction ? "Processing..." : "Issue 100% Scam Indemnity Refund"}</span>
                      </button>
                      <button
                        type="button"
                        disabled={resolvingAction}
                        onClick={() => handleResolveDispute("resolve_clear")}
                        className="flex-1 sm:flex-none rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-bold px-4 py-2 text-xs transition-colors cursor-pointer shadow-sm flex items-center justify-center gap-1.5"
                      >
                        <Check className="w-3.5 h-3.5" />
                        <span>{resolvingAction ? "Processing..." : "Keys Delivered & Clear Escrow"}</span>
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* State B: RELEASED / COMPLETED & SETTLED */}
              {escrow.escrow_status === "released" && (
                <div className="rounded-3xl border-2 border-emerald-300 bg-gradient-to-r from-emerald-950 via-slate-900 to-slate-950 p-6 sm:p-8 text-white shadow-lg space-y-4">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-white/10 pb-4">
                    <div>
                      <div className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/40 px-3 py-1 text-xs font-bold mb-2">
                        <Check className="w-3.5 h-3.5 text-emerald-300" />
                        <span>Rent Disbursed to Landlord</span>
                      </div>
                      <h3 className="text-2xl font-black text-white tracking-tight">
                        Welcome to Your New Home in Kaduna!
                      </h3>
                      <p className="text-xs text-slate-300 mt-1">
                        Disbursement Ref: <span className="font-mono font-bold text-emerald-300">{escrow.disbursement_ref || "TRF_78291038"}</span> &bull; Confirmed: {escrow.confirmed_at || "Today"}
                      </p>
                    </div>

                    <div className="text-right">
                      <span className="text-[10px] uppercase font-bold text-slate-400 block">Cleared to Landlord</span>
                      <strong className="text-2xl font-black text-emerald-300">
                        ₦{escrow.amount_held.toLocaleString("en-NG")}
                      </strong>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                    <div className="rounded-2xl bg-white/10 p-4 border border-white/10 space-y-1">
                      <span className="text-[10px] uppercase font-bold text-slate-400">Landlord Payout Destination</span>
                      <strong className="block text-white text-sm">{escrow.landlord_name}</strong>
                      <span className="text-slate-300 text-[11px] block">
                        {escrow.landlord_bank_name} &bull; {escrow.landlord_account_num}
                      </span>
                      <span className="text-[10px] text-emerald-400 block font-mono mt-1">
                        Release Method: {escrow.release_reason === "tenant_button" ? "Tenant Button Confirmation" : "24h Auto Safety Timer"}
                      </span>
                    </div>

                    <div className="rounded-2xl bg-white/10 p-4 border border-white/10 space-y-1">
                      <span className="text-[10px] uppercase font-bold text-blue-400">12-Month Caution Vault Status</span>
                      <strong className="block text-white text-sm">
                        ₦{(escrow.amount_held * 0.1).toLocaleString("en-NG")} Ringfenced
                      </strong>
                      <p className="text-slate-300 text-[11px]">
                        Protected in Settlla Merchant Reserve / PayRep Vault. 100% refundable at tenancy end.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* State C: REFUNDED */}
              {escrow.escrow_status === "refunded" && (
                <div className="rounded-3xl border-2 border-purple-300 bg-gradient-to-r from-purple-950 via-slate-900 to-slate-950 p-6 sm:p-8 text-white shadow-lg space-y-3">
                  <div className="inline-flex items-center gap-1.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-400/40 px-3 py-1 text-xs font-bold">
                    <RotateCcw className="w-3.5 h-3.5 text-purple-300" />
                    <span>100% Scam Indemnity Refund Settled</span>
                  </div>
                  <h3 className="text-2xl font-black text-white tracking-tight">
                    Full Move-In Refund Issued Directly to Your Bank
                  </h3>
                  <p className="text-xs text-slate-300">
                    Refund Ref: <span className="font-mono font-bold text-purple-300">{escrow.disbursement_ref || "REF_INDEMNITY_9921"}</span> &bull; Under our 100% Scam Indemnity Guarantee, all funds (Base Rent + Caution) have been returned with zero deductions.
                  </p>
                </div>
              )}

              {/* State D: HOLDING IN ESCROW (DEFAULT PRE-HANDOVER) */}
              {escrow.escrow_status === "holding" && (
                <div className="rounded-3xl border-2 border-blue-200 bg-gradient-to-r from-[#0B1528] to-slate-900 p-6 sm:p-8 text-white shadow-md space-y-4">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-white/10 pb-4">
                    <div>
                      <div className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 px-3 py-1 text-xs font-bold mb-2">
                        <Lock className="w-3.5 h-3.5 text-emerald-400" />
                        <span>Protected by Move-In Escrow</span>
                      </div>
                      <h3 className="text-2xl font-black text-white tracking-tight">
                        ₦{escrow.amount_held.toLocaleString("en-NG")} Locked Safely in Escrow
                      </h3>
                      <p className="text-xs text-slate-300 mt-1">
                        Funds will <span className="font-bold text-white">not</span> clear to the landlord until you meet at the apartment, inspect the premises, and test working keys.
                      </p>
                    </div>

                    {/* 24-Hour Countdown Timer Card */}
                    <div className="rounded-2xl bg-white/10 border border-white/15 p-4 text-center min-w-[200px]">
                      <span className="text-[10px] uppercase font-bold text-slate-400 block">
                        24h Safety Release Timer
                      </span>
                      <strong className="text-xl font-mono font-black text-emerald-400 block mt-1 tracking-wider">
                        {formatTimer(timerSecondsLeft)}
                      </strong>
                      <span className="text-[10px] text-slate-400 block mt-0.5">
                        {timerPaused ? "Timer Paused" : "Auto-releases if no dispute filed"}
                      </span>
                    </div>
                  </div>

                  {/* Move-In Day Action Buttons */}
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
                    <div className="flex items-center gap-2 text-xs text-slate-300">
                      <Key className="w-4 h-4 text-amber-400" />
                      <span>Tested keys and ready to move in?</span>
                    </div>

                    <div className="flex items-center gap-3 w-full sm:w-auto">
                      <button
                        type="button"
                        onClick={() => setActiveTab("dispute_form")}
                        className="w-full sm:w-auto rounded-xl border border-rose-400/50 bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 font-bold px-4 py-2.5 text-xs transition-colors cursor-pointer flex items-center justify-center gap-1.5"
                      >
                        <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />
                        <span>Report a Problem</span>
                      </button>
                      <button
                        type="button"
                        disabled={confirmingHandover}
                        onClick={handleConfirmHandover}
                        className="w-full sm:w-auto rounded-xl bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-slate-950 font-black px-6 py-2.5 text-xs sm:text-sm transition-all hover:scale-105 shadow-md shadow-emerald-500/25 cursor-pointer flex items-center justify-center gap-2"
                      >
                        {confirmingHandover ? (
                          <>
                            <div className="h-4 w-4 animate-spin rounded-full border-2 border-slate-950 border-t-transparent" />
                            <span>Releasing Payout...</span>
                          </>
                        ) : (
                          <>
                            <Check className="w-4 h-4 text-slate-950 stroke-[3]" />
                            <span>Confirm Key Handover</span>
                            <ArrowRight className="w-4 h-4 text-slate-950 stroke-[3]" />
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* 2. THREE SUMMARY CARDS: ESCROW VAULT, CAUTION VAULT & CONCIERGE INFO */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5 text-xs">
                {/* Card 1: Rent in Escrow Details */}
                <div className="rounded-2xl border border-slate-200 bg-white p-5 space-y-3 shadow-xs">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                    <span className="font-bold text-slate-700 uppercase text-[10px]">1. Base Rent Escrow</span>
                    <span className="rounded bg-emerald-50 text-emerald-700 text-[10px] font-bold px-2 py-0.5 border border-emerald-200">
                      75% Sum
                    </span>
                  </div>
                  <strong className="text-xl font-black text-slate-900 block font-mono">
                    ₦{escrow.amount_held.toLocaleString("en-NG")}
                  </strong>
                  <div className="text-slate-600 text-[11px] space-y-1">
                    <p>
                      <strong>Landlord:</strong> {escrow.landlord_name}
                    </p>
                    <p>
                      <strong>Bank:</strong> {escrow.landlord_bank_name}
                    </p>
                    <p className="font-mono text-slate-500 text-[10px]">
                      NUBAN: {escrow.landlord_account_num}
                    </p>
                  </div>
                  <span className="text-[10px] text-emerald-700 font-bold flex items-center gap-1 pt-1">
                    {escrow.escrow_status === "released" ? (
                      <>
                        <Check className="w-3 h-3 text-emerald-600" />
                        <span>Payout Cleared to Landlord</span>
                      </>
                    ) : (
                      <>
                        <Lock className="w-3 h-3 text-emerald-600" />
                        <span>Held in Settlla Container</span>
                      </>
                    )}
                  </span>
                </div>

                {/* Card 2: 12-Month Caution Vault */}
                <div className="rounded-2xl border border-slate-200 bg-white p-5 space-y-3 shadow-xs">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                    <span className="font-bold text-slate-700 uppercase text-[10px]">2. Caution Deposit Vault</span>
                    <span className="rounded bg-blue-50 text-blue-700 text-[10px] font-bold px-2 py-0.5 border border-blue-200">
                      10% Sum
                    </span>
                  </div>
                  <strong className="text-xl font-black text-blue-700 block font-mono">
                    ₦{(escrow.amount_held * 0.1).toLocaleString("en-NG")}
                  </strong>
                  <div className="text-slate-600 text-[11px] space-y-1">
                    <p>
                      <strong>Storage:</strong> Settlla Merchant Reserve
                    </p>
                    <p>
                      <strong>Custody:</strong> PayRep Isolated Balance
                    </p>
                    <p>
                      <strong>Tenure:</strong> 12 Months (Full Lease)
                    </p>
                  </div>
                  <span className="text-[10px] text-blue-600 font-bold flex items-center gap-1 pt-1">
                    <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
                    <span>100% Refundable Post-Move-Out</span>
                  </span>
                </div>

                {/* Card 3: Manager Concierge Contact */}
                <div className="rounded-2xl border border-slate-200 bg-white p-5 space-y-3 shadow-xs">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                    <span className="font-bold text-slate-700 uppercase text-[10px]">3. Manager Concierge</span>
                    <span className="rounded bg-slate-100 text-slate-700 text-[10px] font-bold px-2 py-0.5">
                      HB&amp;A Partners
                    </span>
                  </div>
                  <div className="text-slate-800 text-xs font-bold">
                    {listing.mandate.manager_name}
                  </div>
                  <div className="text-slate-600 text-[11px] space-y-1">
                    <p>
                      <strong>Accreditation:</strong> {listing.mandate.accreditation}
                    </p>
                    <p>
                      <strong>Mandate Ref:</strong> {listing.mandate.mandate_ref}
                    </p>
                    <p className="font-bold text-blue-700 flex items-center gap-1">
                      <Phone className="w-3.5 h-3.5" />
                      <span>0803 555 1289 (Manager Phone)</span>
                    </p>
                  </div>
                  <span className="text-[10px] text-slate-400 font-mono block pt-1">
                    On-Site Meeting Ready
                  </span>
                </div>
              </div>

              {/* 3. QUICK LINKS & SIMULATION TOOLS */}
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-2">
                  <span className="text-slate-500 font-bold">Documents &amp; Proofs:</span>
                  {onViewPass && (
                    <button
                      type="button"
                      onClick={onViewPass}
                      className="rounded-lg bg-white border border-slate-200 px-3 py-1.5 font-bold text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer flex items-center gap-1.5"
                    >
                      <Ticket className="w-3.5 h-3.5 text-slate-600" />
                      <span>View Move-In Pass</span>
                    </button>
                  )}
                  {onViewAgreement && (
                    <button
                      type="button"
                      onClick={onViewAgreement}
                      className="rounded-lg bg-white border border-slate-200 px-3 py-1.5 font-bold text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer flex items-center gap-1.5"
                    >
                      <FileText className="w-3.5 h-3.5 text-slate-600" />
                      <span>View Signed Lease</span>
                    </button>
                  )}
                </div>

                {escrow.escrow_status === "holding" && (
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={handleSimulateAutoRelease}
                      className="rounded-lg bg-slate-200 hover:bg-slate-300 text-slate-700 px-3 py-1.5 text-[11px] font-bold transition-colors cursor-pointer flex items-center gap-1.5"
                      title="Trigger 24-hour timer expiration for automated landlord payout"
                    >
                      <span>Simulate 24h Timer Expiry</span>
                      <Clock className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 2: DISPUTE & PROBLEM REPORT FORM */}
          {activeTab === "dispute_form" && (
            <div className="space-y-6 animate-fade-in">
              <div className="rounded-3xl border border-rose-200 bg-rose-50/70 p-6 space-y-2">
                <div className="flex items-center gap-2 font-black text-rose-950 text-base">
                  <AlertTriangle className="w-5 h-5 text-rose-600 flex-shrink-0" />
                  <span>Emergency Move-In Problem Report &amp; Escrow Freeze</span>
                </div>
                <p className="text-xs text-rose-800 leading-relaxed">
                  Submitting this form <strong>immediately halts the 24-hour auto-release timer</strong> and freezes the
                  landlord&rsquo;s rent payout in Settlla escrow. Our Kaduna emergency concierge will be dispatched within 2 hours.
                  If the listing cannot be delivered as promised, you are protected by the <strong>100% Scam Indemnity Guarantee</strong> with full refund.
                </p>
              </div>

              <form onSubmit={handleSubmitDispute} className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 space-y-5 shadow-xs">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                    Select Issue Category *
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <label
                      className={`flex items-start gap-3 p-3.5 rounded-2xl border cursor-pointer transition-all ${
                        issueCategory === "key_failure"
                          ? "border-rose-500 bg-rose-50/50 shadow-xs"
                          : "border-slate-200 hover:border-slate-300 bg-slate-50"
                      }`}
                    >
                      <input
                        type="radio"
                        name="issueCategory"
                        value="key_failure"
                        checked={issueCategory === "key_failure"}
                        onChange={() => setIssueCategory("key_failure")}
                        className="mt-0.5 text-rose-600 focus:ring-rose-500"
                      />
                      <div>
                        <strong className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                          <Key className="w-3.5 h-3.5 text-amber-500" />
                          <span>Key Failure</span>
                        </strong>
                        <p className="text-[11px] text-slate-500">Keys provided do not open front door / deadbolt jammed</p>
                      </div>
                    </label>

                    <label
                      className={`flex items-start gap-3 p-3.5 rounded-2xl border cursor-pointer transition-all ${
                        issueCategory === "access_denied"
                          ? "border-rose-500 bg-rose-50/50 shadow-xs"
                          : "border-slate-200 hover:border-slate-300 bg-slate-50"
                      }`}
                    >
                      <input
                        type="radio"
                        name="issueCategory"
                        value="access_denied"
                        checked={issueCategory === "access_denied"}
                        onChange={() => setIssueCategory("access_denied")}
                        className="mt-0.5 text-rose-600 focus:ring-rose-500"
                      />
                      <div>
                        <strong className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                          <Ban className="w-3.5 h-3.5 text-rose-500" />
                          <span>Access Denied</span>
                        </strong>
                        <p className="text-[11px] text-slate-500">Compound gate padlocked / Manager or caretaker no-show</p>
                      </div>
                    </label>

                    <label
                      className={`flex items-start gap-3 p-3.5 rounded-2xl border cursor-pointer transition-all ${
                        issueCategory === "property_misrepresentation"
                          ? "border-rose-500 bg-rose-50/50 shadow-xs"
                          : "border-slate-200 hover:border-slate-300 bg-slate-50"
                      }`}
                    >
                      <input
                        type="radio"
                        name="issueCategory"
                        value="property_misrepresentation"
                        checked={issueCategory === "property_misrepresentation"}
                        onChange={() => setIssueCategory("property_misrepresentation")}
                        className="mt-0.5 text-rose-600 focus:ring-rose-500"
                      />
                      <div>
                        <strong className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                          <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
                          <span>Severe Misrepresentation</span>
                        </strong>
                        <p className="text-[11px] text-slate-500">Uninhabitable condition / Fake amenities / Broken roof</p>
                      </div>
                    </label>

                    <label
                      className={`flex items-start gap-3 p-3.5 rounded-2xl border cursor-pointer transition-all ${
                        issueCategory === "unauthorized_occupants"
                          ? "border-rose-500 bg-rose-50/50 shadow-xs"
                          : "border-slate-200 hover:border-slate-300 bg-slate-50"
                      }`}
                    >
                      <input
                        type="radio"
                        name="issueCategory"
                        value="unauthorized_occupants"
                        checked={issueCategory === "unauthorized_occupants"}
                        onChange={() => setIssueCategory("unauthorized_occupants")}
                        className="mt-0.5 text-rose-600 focus:ring-rose-500"
                      />
                      <div>
                        <strong className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                          <Users className="w-3.5 h-3.5 text-purple-500" />
                          <span>Unauthorized Occupants</span>
                        </strong>
                        <p className="text-[11px] text-slate-500">Apartment already occupied by another tenant or squatter</p>
                      </div>
                    </label>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Describe What Happened on Move-In Day *
                  </label>
                  <textarea
                    rows={4}
                    value={disputeDescription}
                    onChange={(e) => setDisputeDescription(e.target.value)}
                    placeholder="e.g. Arrived at Plot 14 Alimi Road at 10:00 AM. Caretaker provided two keys but neither turns the main deadbolt. Manager not picking calls."
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50 p-3.5 text-xs text-slate-900 focus:bg-white focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20"
                    required
                  />
                </div>

                <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-4 text-xs flex items-center justify-between">
                  <div>
                    <span className="font-bold text-slate-800 block">Attach Photo / Video Proof (Simulated)</span>
                    <span className="text-[11px] text-slate-500">Attach photo of key, lock, or obstructed gate</span>
                  </div>
                  <span className="rounded-lg bg-white border border-slate-200 px-3 py-1.5 text-[11px] font-bold text-slate-700 font-mono flex items-center gap-1.5">
                    <span>door_lock_jammed.jpg</span>
                    <Check className="w-3 h-3 text-emerald-600" />
                  </span>
                </div>

                <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-4">
                  <button
                    type="button"
                    onClick={() => setActiveTab("overview")}
                    className="w-full sm:w-auto rounded-xl border border-slate-200 px-5 py-2.5 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                  >
                    Cancel &amp; Return
                  </button>

                  <button
                    type="submit"
                    disabled={submittingDispute}
                    className="w-full sm:w-auto rounded-xl bg-rose-600 hover:bg-rose-700 disabled:opacity-50 text-white font-black px-8 py-3 text-xs sm:text-sm shadow-md shadow-rose-600/25 transition-all cursor-pointer flex items-center justify-center gap-2"
                  >
                    {submittingDispute ? (
                      <>
                        <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                        <span>Freezing Escrow...</span>
                      </>
                    ) : (
                      <>
                        <AlertTriangle className="w-4 h-4" />
                        <span>Submit Emergency Dispute &amp; Freeze Payout</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="border-t border-slate-100 px-6 py-4 bg-white text-xs text-slate-500 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-slate-400">
            <ShieldCheck className="w-4 h-4 text-emerald-600 flex-shrink-0" />
            <span>Settlla 100% Scam Indemnity Guarantee &bull; Kaduna State Tenancy Compliant</span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-full sm:w-auto rounded-xl bg-slate-900 hover:bg-slate-800 text-white px-6 py-2 text-xs font-bold transition-colors cursor-pointer"
          >
            Close Dashboard
          </button>
        </div>
      </div>
    </div>
  );
};
