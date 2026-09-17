"use client";

import React, { useState, useEffect } from "react";
import { TenancyAgreement } from "@/types/agreement";
import { Listing } from "@/types/listing";
import { X, Sparkles, Check, Scale, ArrowRight } from "lucide-react";
import { fetchPendingAgreements } from "@/lib/settlla/manager";

interface ManagerQueueModalProps {
  isOpen: boolean;
  onClose: () => void;
  listings: Listing[];
  onOpenSigningWorkflow: (agreement: TenancyAgreement, listing: Listing, role: "tenant" | "manager") => void;
}

export const ManagerQueueModal: React.FC<ManagerQueueModalProps> = ({
  isOpen,
  onClose,
  listings,
  onOpenSigningWorkflow,
}) => {
  const [agreements, setAgreements] = useState<TenancyAgreement[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isOpen) return;

    async function loadAgreements() {
      setLoading(true);
      try {
        const pending = await fetchPendingAgreements();
        setAgreements((pending as TenancyAgreement[]) || []);
      } finally {
        setLoading(false);
      }
    }

    loadAgreements();
  }, [isOpen, listings]);

  if (!isOpen) return null;

  const pendingList = agreements.filter((a) => a.status === "tenant_signed");
  const executedList = agreements.filter((a) => a.status === "fully_executed");

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-950/40 backdrop-blur-xs transition-opacity animate-fade-in"
        onClick={onClose}
      />

      {/* Modal Container */}
      <div className="relative z-10 w-full max-w-4xl max-h-[90vh] bg-white rounded-3xl border border-slate-200 shadow-2xl flex flex-col overflow-hidden text-slate-900 animate-scale-up">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 px-6 sm:px-8 py-5 bg-slate-900 text-white">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="rounded-full bg-blue-500/30 text-blue-300 border border-blue-400/30 px-2.5 py-0.5 text-xs font-bold">
                HB&amp;A Partners &bull; Kaduna Hub
              </span>
              <span className="rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 px-2.5 py-0.5 text-xs font-bold">
                Mandate Attorney-in-Fact Portal
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white">
              Manager Mandate &amp; Lease Desk
            </h2>
            <p className="text-xs text-slate-300 mt-0.5">
              Review tenant credentials, verify registered landlord mandates, and oversee pre-certified indentures.
            </p>
          </div>

          <button
            onClick={onClose}
            className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/10 text-white hover:bg-white/20 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-6 sm:p-8 bg-[#F8FAFC] space-y-6">
          {/* Quick Metrics */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs">
              <span className="text-slate-400 uppercase font-bold block text-[10px]">Active Pre-Certified Leases</span>
              <strong className="text-2xl font-black text-emerald-600 block mt-1">{pendingList.length}</strong>
              <span className="text-slate-500 text-[11px]">Tenant Signed &bull; Pre-Certified Mandate</span>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs">
              <span className="text-slate-400 uppercase font-bold block text-[10px]">Fully Executed Leases</span>
              <strong className="text-2xl font-black text-emerald-600 block mt-1">{executedList.length}</strong>
              <span className="text-slate-500 text-[11px]">Dual-Signed &bull; Reserved for Checkout</span>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs">
              <span className="text-slate-400 uppercase font-bold block text-[10px]">Active Landlord Mandates</span>
              <strong className="text-2xl font-black text-blue-600 block mt-1">{listings.length}</strong>
              <span className="text-slate-500 text-[11px]">HB&amp;A Partners &bull; NBA Kaduna Verified</span>
            </div>
          </div>

          {/* Pending Agreements Section */}
          <div className="space-y-4">
            <h4 className="text-sm font-black text-slate-900 flex items-center gap-2">
              <span className="flex h-2 w-2 rounded-full bg-emerald-500" />
              <span>Executed Leases Under Written Mandate</span>
            </h4>

            {loading ? (
              <div className="py-10 text-center text-xs text-slate-500">
                <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-blue-600 border-t-transparent" />
                <p className="mt-2 font-bold">Loading pending lease queue...</p>
              </div>
            ) : pendingList.length === 0 ? (
              <div className="rounded-2xl border border-slate-200 bg-white p-6 text-center text-xs text-slate-500">
                <Sparkles className="w-8 h-8 text-emerald-500 mx-auto mb-1" />
                <p className="font-bold text-slate-700">All lease agreements have been counter-signed!</p>
                <p className="mt-1 text-slate-400">
                  New leases will appear here when tenants execute their electronic signature.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {pendingList.map((agr) => {
                  const matchingListing = listings.find((l) => l.id === agr.listing_id) || listings[0];
                  return (
                    <div
                      key={agr.agreement_id}
                      className="rounded-2xl border border-amber-200 bg-white p-5 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="rounded-md bg-amber-100 text-amber-800 text-[10px] font-bold px-2 py-0.5 font-mono">
                            {agr.agreement_id}
                          </span>
                          <span className="rounded-md bg-blue-50 text-blue-700 text-[10px] font-bold px-2 py-0.5">
                            Mandate: {agr.manager_mandate_ref}
                          </span>
                        </div>
                        <h5 className="font-black text-slate-900 text-sm">{agr.property_title}</h5>
                        <p className="text-xs text-slate-500">
                          Tenant: <strong>{agr.tenant.full_name}</strong> ({agr.tenant.employer_name}) &bull; Landlord:{" "}
                          <strong>{agr.landlord_name}</strong>
                        </p>
                        <p className="text-[11px] text-emerald-700 font-medium flex items-center gap-1">
                          <Check className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
                          <span>Tenant signed on {agr.tenant_signed_at || "Recently"} (Audit Ref: {agr.tenant_audit_ref})</span>
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={() => {
                          onClose();
                          onOpenSigningWorkflow(agr, matchingListing, "manager");
                        }}
                        className="rounded-xl bg-blue-700 hover:bg-blue-800 text-white font-bold px-5 py-2.5 text-xs transition-all shadow-sm cursor-pointer whitespace-nowrap flex items-center gap-1.5"
                      >
                        <Scale className="w-3.5 h-3.5" />
                        <span>Review Mandate &amp; Lease</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Fully Executed History */}
          {executedList.length > 0 && (
            <div className="space-y-3 pt-2">
              <h4 className="text-sm font-black text-slate-900 flex items-center gap-2">
                <span className="flex h-2 w-2 rounded-full bg-emerald-500" />
                <span>Fully Executed &amp; Sealed Indentures</span>
              </h4>

              <div className="space-y-2">
                {executedList.map((agr) => {
                  const matchingListing = listings.find((l) => l.id === agr.listing_id) || listings[0];
                  return (
                    <div
                      key={agr.agreement_id}
                      className="rounded-2xl border border-emerald-200 bg-emerald-50/40 p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs"
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-900">{agr.property_title}</span>
                          <span className="font-mono text-emerald-700 text-[11px]">({agr.agreement_id})</span>
                        </div>
                        <p className="text-slate-500 text-[11px] mt-0.5">
                          Dual-Signed: {agr.tenant.full_name} &amp; {agr.manager_name} &bull; Total: ₦{agr.pricing.total_move_in_cost.toLocaleString("en-NG")}
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={() => {
                          onClose();
                          onOpenSigningWorkflow(agr, matchingListing, "manager");
                        }}
                        className="rounded-xl border border-emerald-300 bg-white text-emerald-800 hover:bg-emerald-50 px-3.5 py-1.5 font-bold transition-colors"
                      >
                        View Sealed Certificate
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-slate-100 px-6 sm:px-8 py-4 bg-white flex items-center justify-between text-xs">
          <span className="text-slate-500">HB&amp;A Partners Legal &amp; Property Management Portal</span>
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
