"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { Listing } from "@/types/listing";
import { TenancyAgreement, TenantProfile } from "@/types/agreement";
import { createAgreement } from "@/lib/settlla/agreements";
import { AgreementFocusReader } from "./AgreementFocusReader";
import {
  X,
  AlertTriangle,
  PenTool,
  ArrowRight,
  Check,
  BookOpen,
} from "lucide-react";

interface TenancyAgreementViewerProps {
  isOpen: boolean;
  onClose: () => void;
  listing: Listing;
  initialTenantProfile?: Partial<TenantProfile>;
  onProceedToSignature?: (agreement: TenancyAgreement) => void;
}

export const TenancyAgreementViewer: React.FC<TenancyAgreementViewerProps> = ({
  isOpen,
  onClose,
  listing,
  initialTenantProfile,
  onProceedToSignature,
}) => {
  const { currentUser } = useAuth();

  // Agreement State
  const [agreement, setAgreement] = useState<TenancyAgreement | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Tenant Profile State (Editable)
  const [tenantName, setTenantName] = useState(
    initialTenantProfile?.full_name || currentUser?.fullName || ""
  );
  const [tenantPhone, setTenantPhone] = useState(
    initialTenantProfile?.phone_number || currentUser?.phoneNumber || ""
  );
  const [tenantEmail, setTenantEmail] = useState(
    initialTenantProfile?.email_address || currentUser?.email || ""
  );
  const [tenantNIN, setTenantNIN] = useState(
    initialTenantProfile?.nin_number || currentUser?.ninNumber || ""
  );
  const [ninStatus, setNinStatus] = useState<"idle" | "verifying" | "verified">(() => {
    const initial = initialTenantProfile?.nin_number || currentUser?.ninNumber || "";
    const digits = initial.replace(/\D/g, "");
    return digits.length === 11 ? "verified" : "idle";
  });
  const verificationTimerRef = React.useRef<NodeJS.Timeout | null>(null);

  // Clean up verification timer on unmount
  useEffect(() => {
    return () => {
      if (verificationTimerRef.current) {
        clearTimeout(verificationTimerRef.current);
      }
    };
  }, []);

  const handleNINChange = (val: string) => {
    setTenantNIN(val);
    const digits = val.replace(/\D/g, "");

    if (verificationTimerRef.current) {
      clearTimeout(verificationTimerRef.current);
      verificationTimerRef.current = null;
    }

    if (digits.length === 11) {
      setNinStatus("verifying");
      verificationTimerRef.current = setTimeout(() => {
        setNinStatus("verified");
      }, 1100);
    } else {
      setNinStatus("idle");
    }
  };

  const [tenantAddress, setTenantAddress] = useState(
    initialTenantProfile?.residential_address || "Kaduna, Nigeria"
  );
  const [tenantEmployer, setTenantEmployer] = useState(
    initialTenantProfile?.employer_name || currentUser?.relocationContext || "Professional / Resident"
  );
  const [emergencyContact, setEmergencyContact] = useState(
    initialTenantProfile?.emergency_contact_name || ""
  );

  // Auto-expand editing so tenant can review profile & enter NIN
  const [isEditingTenant, setIsEditingTenant] = useState(false);
  const [focusReaderOpen, setFocusReaderOpen] = useState(false);

  // Sync initial tenant profile if prop updates
  useEffect(() => {
    if (initialTenantProfile?.full_name) setTenantName(initialTenantProfile.full_name);
    if (initialTenantProfile?.phone_number) setTenantPhone(initialTenantProfile.phone_number);
    if (initialTenantProfile?.email_address) setTenantEmail(initialTenantProfile.email_address);
    if (initialTenantProfile?.nin_number) {
      setTenantNIN(initialTenantProfile.nin_number);
      if (initialTenantProfile.nin_number.replace(/\D/g, "").length === 11) {
        setNinStatus("verified");
      }
    }
    if (currentUser?.fullName && !tenantName) setTenantName(currentUser.fullName);
    if (currentUser?.email && !tenantEmail) setTenantEmail(currentUser.email);
    if (currentUser?.phoneNumber && !tenantPhone) setTenantPhone(currentUser.phoneNumber);
    if (currentUser?.ninNumber && !tenantNIN) {
      setTenantNIN(currentUser.ninNumber);
      if (currentUser.ninNumber.replace(/\D/g, "").length === 11) {
        setNinStatus("verified");
      }
    }
  }, [initialTenantProfile, currentUser]);

  const tenantDetailsComplete = React.useMemo(() => {
    const phoneDigits = tenantPhone.replace(/\D/g, "");
    const ninDigits = tenantNIN.replace(/\D/g, "");
    const email = tenantEmail.trim();
    return (
      tenantName.trim().length >= 2 &&
      phoneDigits.length >= 10 &&
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) &&
      ninDigits.length === 11
    );
  }, [tenantName, tenantPhone, tenantEmail, tenantNIN]);

  useEffect(() => {
    if (!isOpen) {
      setFocusReaderOpen(false);
      setIsEditingTenant(false);
      setAgreement(null);
      setLoading(false);
    }
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    if (!tenantDetailsComplete) {
      setAgreement(null);
      setLoading(false);
      return;
    }

    let cancelled = false;

    async function loadAgreement() {
      setLoading(true);
      setError(null);

      const payload = {
        listing_id: listing.id,
        tenant: {
          full_name: tenantName.trim(),
          phone_number: tenantPhone.trim(),
          email_address: tenantEmail.trim(),
          nin_number: tenantNIN.replace(/\D/g, ""),
          residential_address: tenantAddress.trim() || "Kaduna, Nigeria",
          emergency_contact_name: emergencyContact.trim() || "Contact on file",
          emergency_contact_phone: "0800 000 0000",
          emergency_contact_rel: "Next of Kin",
          employer_name: tenantEmployer.trim() || "Resident",
          employment_role: "Occupant",
        },
        lease_start_date: "2026-10-01",
        lease_end_date: "2027-09-30",
      };

      try {
        const data = await createAgreement(listing, payload.tenant, {
          lease_start_date: payload.lease_start_date,
          lease_end_date: payload.lease_end_date,
        });
        if (!cancelled) setAgreement(data);
      } catch {
        if (!cancelled) setError("Could not generate agreement. Try again.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    loadAgreement();
    return () => {
      cancelled = true;
    };
  }, [
    isOpen,
    listing,
    tenantDetailsComplete,
    tenantName,
    tenantPhone,
    tenantEmail,
    tenantNIN,
    tenantAddress,
    tenantEmployer,
    emergencyContact,
  ]);

  const agreementWithFormTenant = (): TenancyAgreement | null => {
    if (!agreement) return null;
    return {
      ...agreement,
      tenant: {
        ...agreement.tenant,
        full_name: tenantName.trim() || agreement.tenant.full_name,
        phone_number: tenantPhone.trim() || agreement.tenant.phone_number,
        email_address: tenantEmail.trim() || agreement.tenant.email_address,
        nin_number: tenantNIN.trim() || agreement.tenant.nin_number,
      },
    };
  };

  const documentPreview =
    agreement && agreement.full_legal_text.length > 520
      ? `${agreement.full_legal_text.slice(0, 520).trim()}…`
      : agreement?.full_legal_text ?? "";

  if (!isOpen) return null;
  if (!isOpen) return null;

  return (
    <>
    {focusReaderOpen && agreement && (
      <AgreementFocusReader
        agreement={agreementWithFormTenant() || agreement}
        onClose={() => setFocusReaderOpen(false)}
      />
    )}
    <div className="settlla-overlay">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-950/40 backdrop-blur-xs transition-opacity animate-fade-in"
        onClick={onClose}
      />

      {/* Modal Dialog Container — Light Theme matching Landing Page */}
      <div className="settlla-dialog settlla-dialog--lg h-[min(88dvh,720px)] max-h-[100dvh] sm:h-[min(88vh,720px)]">
        <div className="flex items-start justify-between gap-3 border-b border-slate-100 px-5 py-4 sm:px-6">
          <div>
            <h2 className="text-lg font-black text-slate-900 tracking-tight">
              Standard Residential Tenancy Indenture
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              {agreement ? (
                <>
                  {agreement.agreement_id} &bull; {listing.title}
                </>
              ) : tenantDetailsComplete && loading ? (
                "Drafting indenture…"
              ) : (
                <>
                  {listing.title} &bull; Complete your details to draft the lease
                </>
              )}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-500 hover:bg-slate-200"
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="flex min-h-0 flex-1 flex-col overflow-y-auto bg-[#F8FAFC] p-5 sm:p-6 space-y-4">
          {error && (
            <p className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-xs text-rose-800">{error}</p>
          )}
          <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs">
            <h3 className="mb-3 text-sm font-bold text-slate-900">Your details on this lease</h3>
            {!tenantDetailsComplete || isEditingTenant ? (
              <>
                <p className="mb-3 text-xs text-slate-600">
                  Fill every field below. The indenture is drafted only after your details are complete.
                </p>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 text-xs">
                  <div>
                    <label className="mb-1 block font-bold text-slate-700">Full legal name</label>
                    <input
                      type="text"
                      value={tenantName}
                      onChange={(e) => setTenantName(e.target.value)}
                      className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
                      placeholder="As on NIN / ID"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block font-bold text-slate-700">Phone</label>
                    <input
                      type="tel"
                      value={tenantPhone}
                      onChange={(e) => setTenantPhone(e.target.value)}
                      className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
                      placeholder="0803 123 4567"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block font-bold text-slate-700">Email</label>
                    <input
                      type="email"
                      value={tenantEmail}
                      onChange={(e) => setTenantEmail(e.target.value)}
                      className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
                      placeholder="you@email.com"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block font-bold text-slate-700">NIN (11 digits)</label>
                    <input
                      type="text"
                      value={tenantNIN}
                      onChange={(e) => handleNINChange(e.target.value)}
                      className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
                      placeholder="28491029384"
                      maxLength={14}
                    />
                    {ninStatus === "verifying" && (
                      <p className="mt-1 text-[11px] text-blue-600">Verifying NIN…</p>
                    )}
                    {ninStatus === "verified" && (
                      <p className="mt-1 flex items-center gap-1 text-[11px] font-semibold text-emerald-700">
                        <Check className="h-3 w-3" /> NIN format OK
                      </p>
                    )}
                  </div>
                </div>
                {tenantDetailsComplete && isEditingTenant && (
                  <button
                    type="button"
                    onClick={() => setIsEditingTenant(false)}
                    className="mt-3 text-xs font-semibold text-blue-600 hover:text-blue-800"
                  >
                    Done editing
                  </button>
                )}
              </>
            ) : (
              <>
                <dl className="grid grid-cols-1 gap-2 text-xs sm:grid-cols-2">
                  <div>
                    <dt className="font-semibold text-slate-400">Tenant</dt>
                    <dd className="font-bold text-slate-900">{tenantName}</dd>
                  </div>
                  <div>
                    <dt className="font-semibold text-slate-400">Phone</dt>
                    <dd className="font-semibold text-slate-800">{tenantPhone}</dd>
                  </div>
                  <div>
                    <dt className="font-semibold text-slate-400">Email</dt>
                    <dd className="font-semibold text-slate-800">{tenantEmail}</dd>
                  </div>
                  <div>
                    <dt className="font-semibold text-slate-400">NIN</dt>
                    <dd className="font-semibold text-slate-800">
                      {tenantNIN}
                      {ninStatus === "verified" ? " ✓" : ""}
                    </dd>
                  </div>
                </dl>
                <button
                  type="button"
                  onClick={() => setIsEditingTenant(true)}
                  className="mt-3 text-xs font-semibold text-blue-600 hover:text-blue-800"
                >
                  Edit details
                </button>
              </>
            )}
          </section>

          {tenantDetailsComplete && loading && (
            <div className="py-12 text-center">
              <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
              <p className="mt-4 text-xs font-semibold text-slate-600">Drafting your indenture…</p>
            </div>
          )}

          {tenantDetailsComplete && !loading && !agreement && (
            <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-center text-xs text-amber-900">
              <AlertTriangle className="mx-auto mb-2 h-5 w-5" />
              Could not draft the indenture. Check your connection and try editing your details.
            </div>
          )}

          {agreement && !loading && (
            <section>
              <h3 className="text-overline mb-2 text-slate-500">Tenancy agreement</h3>
              <p className="mb-2 text-xs text-slate-600">
                {listing.title} · ₦{agreement.pricing.total_move_in_cost.toLocaleString("en-NG")} move-in
              </p>
              <button
                type="button"
                onClick={() => setFocusReaderOpen(true)}
                className="group w-full rounded-2xl border border-slate-200 bg-white p-4 text-left shadow-xs transition-all hover:border-blue-300 hover:shadow-md focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-bold text-slate-900 group-hover:text-blue-700">
                      Kaduna State Residential Tenancy Indenture
                    </p>
                    <p className="mt-1 font-mono text-[11px] text-slate-500">{agreement.agreement_id}</p>
                    <p className="mt-3 line-clamp-4 whitespace-pre-wrap font-serif text-[11px] leading-relaxed text-slate-600">
                      {documentPreview}
                    </p>
                  </div>
                  <span className="btn btn-soft btn-sm shrink-0 pointer-events-none">
                    <BookOpen className="h-3.5 w-3.5" />
                    Read full
                  </span>
                </div>
                <p className="mt-3 text-[11px] font-semibold text-blue-600">Tap to open read mode</p>
              </button>
            </section>
          )}
        </div>

        {/* Footer Actions */}
        <div className="border-t border-slate-100 px-4 sm:px-8 py-3.5 sm:py-4 bg-white/95 backdrop-blur-md flex flex-col sm:flex-row items-center justify-between gap-3 sticky bottom-0 z-20">
          <div className="text-xs text-slate-500 text-center sm:text-left">
            <span className="font-bold text-slate-900 block text-xs">
              {agreement ? agreement.agreement_id : tenantDetailsComplete ? "Draft pending…" : "Awaiting your details"}
            </span>
            <span>Governed by Kaduna State Tenancy Laws &bull; Move-in escrow protected</span>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full sm:w-auto">
            <button
              type="button"
              onClick={onClose}
              className="w-full sm:w-auto rounded-xl border border-slate-200 px-4 py-2.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
            >
              Close
            </button>
            <button
              type="button"
              disabled={!agreement || loading || !tenantDetailsComplete}
              onClick={() => {
                if (!tenantDetailsComplete) {
                  setError("Complete name, phone, email, and 11-digit NIN to draft the indenture.");
                  return;
                }
                setError(null);
                const merged = agreementWithFormTenant();
                if (merged && onProceedToSignature) {
                  onProceedToSignature(merged);
                }
              }}
              className="w-full sm:w-auto rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-50 px-6 py-2.5 text-xs sm:text-sm font-bold text-white transition-all shadow-md shadow-blue-500/25 cursor-pointer flex items-center justify-center gap-2"
            >
              <PenTool className="w-4 h-4" />
              <span>Proceed to Electronic Signature</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
    </>
  );
};
