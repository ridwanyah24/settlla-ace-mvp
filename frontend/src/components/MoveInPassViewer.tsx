"use client";

import React from "react";
import { MoveInPass, PaymentTransaction } from "@/types/payment";
import {
  Check,
  CheckCircle2,
  X,
  Key,
  ShieldCheck,
  Printer,
  ArrowRight,
} from "lucide-react";

interface MoveInPassViewerProps {
  isOpen: boolean;
  onClose: () => void;
  pass: MoveInPass;
  transaction?: PaymentTransaction;
  onOpenDashboard?: () => void;
}

export const MoveInPassViewer: React.FC<MoveInPassViewerProps> = ({
  isOpen,
  onClose,
  pass,
  transaction,
  onOpenDashboard,
}) => {
  if (!isOpen) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="settlla-overlay">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs transition-opacity animate-fade-in"
        onClick={onClose}
      />

      {/* Modal Dialog Container */}
      <div className="settlla-dialog settlla-dialog--lg">
        {/* Header Bar */}
        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4 bg-slate-900 text-white">
          <div className="flex items-center gap-2">
            <span className="rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 px-2.5 py-0.5 text-xs font-bold flex items-center gap-1.5">
              <Check className="w-3.5 h-3.5 text-emerald-300" />
              <span>Move-In Pass Verified</span>
            </span>
            <span className="font-mono text-xs text-slate-400 font-bold">
              {pass.pass_id}
            </span>
          </div>
          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-xl bg-white/10 text-white hover:bg-white/20 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Printable Pass Body */}
        <div className="min-h-0 flex-1 overflow-y-auto p-4 sm:p-8 bg-[#F8FAFC] space-y-6">
          {/* Official Pass Card (Boarding Pass / Digital Voucher Aesthetic) */}
          <div className="rounded-3xl border-2 border-slate-200 bg-white shadow-md overflow-hidden relative print:border-none print:shadow-none">
            {/* Top Pass Header */}
            <div className="bg-gradient-to-r from-blue-900 via-slate-900 to-emerald-950 p-6 text-white relative">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-[10px] uppercase font-bold tracking-widest text-emerald-400 block">
                    Settlla Kaduna Hub &bull; Move-In Escrow Pass
                  </span>
                  <h3 className="text-xl sm:text-2xl font-black mt-0.5 tracking-tight">
                    Official Move-In Authorization
                  </h3>
                  <p className="text-xs text-slate-300 mt-1">
                    Present this pass on key-handover day to gain authorized physical possession.
                  </p>
                </div>
                <div className="h-12 w-12 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/20">
                  <Key className="w-6 h-6 text-amber-300" />
                </div>
              </div>
            </div>

            {/* Middle Pass Body */}
            <div className="p-6 sm:p-7 space-y-5">
              {/* Tenant & Schedule Row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 border-b border-slate-100 pb-5 text-xs">
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-bold block">Authorized Tenant</span>
                  <strong className="text-slate-900 text-sm block mt-0.5">{pass.tenant_name}</strong>
                  <span className="text-slate-500 text-[11px] block">{pass.tenant_phone}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-bold block">Scheduled Move-In Date</span>
                  <strong className="text-emerald-700 text-sm block mt-0.5 font-bold">
                    {pass.scheduled_move_in_date}
                  </strong>
                  <span className="text-slate-500 text-[11px] block">24-hour safety timer commences upon entry</span>
                </div>
              </div>

              {/* Property Details */}
              <div className="rounded-2xl bg-slate-50 p-4 border border-slate-200 text-xs space-y-1">
                <span className="text-[10px] text-slate-400 uppercase font-bold block">Demised Residence</span>
                <strong className="text-slate-900 text-sm block">{pass.property_title}</strong>
                <p className="text-slate-600 text-[11px]">{pass.property_address}</p>
                <div className="pt-2 flex flex-wrap items-center gap-2 text-[11px]">
                  <span className="font-semibold text-blue-700">Manager Concierge:</span>
                  <span className="text-slate-700">{pass.manager_name} ({pass.manager_phone})</span>
                  <span className="text-slate-400">&bull;</span>
                  <span className="text-slate-500 font-mono">Mandate: {pass.mandate_ref}</span>
                </div>
              </div>

              {/* Escrow Status & 4-Way Split Seal */}
              <div className="rounded-2xl bg-emerald-50 border border-emerald-200 p-4 text-xs space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 font-bold text-emerald-900">
                    <ShieldCheck className="w-4 h-4 text-emerald-600" />
                    <span>100% Move-In Escrow Scam Indemnity Guarantee</span>
                  </div>
                  <span className="font-mono text-[10px] text-emerald-700 font-bold bg-white px-2 py-0.5 rounded border border-emerald-200">
                    ESCROW HOLDING
                  </span>
                </div>
                <p className="text-emerald-800 text-[11px] leading-relaxed">
                  The net annual rent is locked in Settlla Move-In Escrow. The funds will <strong>not</strong> clear to the
                  landlord until you inspect the property, receive working keys, and tap <strong>&ldquo;Confirm Key Handover&rdquo;</strong> in your web dashboard.
                </p>
              </div>

              {/* QR Verification Mock Token */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2 border-t border-slate-100">
                <div className="flex items-center gap-3">
                  {/* Styled QR placeholder graphic */}
                  <div className="h-16 w-16 rounded-xl bg-slate-900 p-1.5 flex flex-col justify-between text-white text-[7px] font-mono select-none">
                    <div className="flex justify-between">
                      <span className="bg-white text-black p-0.5 font-bold">QR</span>
                      <span className="bg-emerald-400 text-black px-0.5">SETT</span>
                    </div>
                    <div className="text-center text-[6px] text-slate-300 truncate">
                      {pass.qr_token.substring(0, 12)}
                    </div>
                    <div className="flex justify-between text-[6px] text-emerald-400">
                      <span>PASS</span>
                      <span>KAD</span>
                    </div>
                  </div>
                  <div className="text-xs">
                    <span className="font-bold text-slate-900 block">Digital Verification Hash</span>
                    <span className="font-mono text-[10px] text-slate-500 block truncate max-w-xs">
                      {pass.verification_hash}
                    </span>
                    <span className="text-[10px] text-emerald-600 font-bold flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                      <span>Verified by Kaduna Closing Engine</span>
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handlePrint}
                  className="rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-bold px-4 py-2 text-xs transition-colors cursor-pointer flex items-center gap-1.5 shadow-2xs"
                >
                  <Printer className="w-3.5 h-3.5 text-slate-700" />
                  <span>Print Pass</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="border-t border-slate-100 px-6 py-4 bg-white flex flex-col sm:flex-row items-center justify-between gap-3">
          <span className="text-xs text-slate-500 text-center sm:text-left">
            Pass Reference: {pass.pass_id} &bull; Agreement: {pass.agreement_id}
          </span>
          <div className="flex items-center gap-2.5 w-full sm:w-auto">
            <button
              type="button"
              onClick={onClose}
              className="w-full sm:w-auto rounded-xl border border-slate-200 px-5 py-2.5 text-xs font-semibold text-slate-700 hover:bg-slate-50"
            >
              Close
            </button>
            {onOpenDashboard && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenDashboard();
                }}
                className="w-full sm:w-auto rounded-xl bg-blue-600 hover:bg-blue-700 px-6 py-2.5 text-xs sm:text-sm font-bold text-white shadow-md shadow-blue-500/25 transition-all cursor-pointer flex items-center justify-center gap-1.5"
              >
                <span>Confirm key in dashboard</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
