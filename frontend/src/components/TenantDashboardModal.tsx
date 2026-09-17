"use client";

import React, { useState } from "react";
import Image from "next/image";
import { useAuth } from "@/context/AuthContext";
import { Listing } from "@/types/listing";
import { TenancyAgreement } from "@/types/agreement";
import { MoveInPass, EscrowHoldRecord, PaymentTransaction } from "@/types/payment";
import { InspectionBookingResponse } from "@/types/booking";
import {
  User,
  X,
  Home,
  FileText,
  ShieldCheck,
  CalendarCheck,
  CreditCard,
  Check,
  MapPin,
  Ticket,
  MessageSquare,
  ArrowRight,
  Info,
} from "lucide-react";

interface TenantDashboardModalProps {
  isOpen: boolean;
  onClose: () => void;
  listings: Listing[];
  activeAgreement?: TenancyAgreement | null;
  activePass?: MoveInPass | null;
  activeEscrow?: EscrowHoldRecord | null;
  recentTransaction?: PaymentTransaction | null;
  onOpenAgreementViewer?: (listing: Listing) => void;
  onOpenEscrowModal?: () => void;
  onOpenPassViewer?: () => void;
  onExploreProperties?: () => void;
}

export const TenantDashboardModal: React.FC<TenantDashboardModalProps> = ({
  isOpen,
  onClose,
  listings,
  activeAgreement,
  activePass,
  activeEscrow,
  recentTransaction,
  onOpenAgreementViewer,
  onOpenEscrowModal,
  onOpenPassViewer,
  onExploreProperties,
}) => {
  const { currentUser, signOut } = useAuth();
  const [activeTab, setActiveTab] = useState<"overview" | "agreements" | "escrow" | "bookings" | "payments">("overview");

  // Local state for mock inspections if any created
  const [mockBookings] = useState<InspectionBookingResponse[]>([
    {
      booking_id: "SETT-BK-7824",
      listing_id: listings[0]?.id || "prop_barnawa_01",
      property_title: listings[0]?.title || "Executive 1-Bedroom Flat at Barnawa Terraces",
      property_address: listings[0]?.full_address || "Plot 12 Coronation Crescent, Barnawa, Kaduna",
      commute_badge: listings[0]?.commute_badge || "4 mins to Barnawa Complex",
      manager_name: "HB&A Partners & Co.",
      manager_accreditation: "ESVARBON Reg. #A2840",
      manager_phone: "0803 555 1289",
      manager_whatsapp: "2348035551289",
      tenant_name: currentUser?.fullName || activeAgreement?.tenant?.full_name || "Verified Tenant",
      tenant_phone: currentUser?.phoneNumber || activeAgreement?.tenant?.phone_number || "0803 123 4567",
      tenant_email: currentUser?.email || activeAgreement?.tenant?.email_address || "tenant@settlla.ng",
      date_str: "2026-09-18",
      formatted_date: "Fri, Sep 18, 2026",
      slot_time: "2:30 PM - 3:00 PM",
      inspection_fee: 0,
      fee_currency: "NGN",
      booking_status: "confirmed",
      directions: "Meet host at compound gate. Present digital pass reference SETT-BK-7824.",
      anti_scam_guarantee: "100% Free Walkthrough. Zero roadside fee.",
      created_at: new Date().toISOString(),
    },
  ]);

  if (!isOpen) return null;

  const currentHome = listings[0];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 overflow-y-auto bg-slate-900/60 backdrop-blur-sm animate-fade-in">
      <div
        className="relative w-full max-w-5xl max-h-[92vh] overflow-y-auto rounded-3xl border border-slate-200 bg-white shadow-2xl text-slate-900 flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Sticky Header */}
        <div className="sticky top-0 z-20 flex items-center justify-between border-b border-slate-200 bg-white/95 px-6 py-4 backdrop-blur-md">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-600 text-white shadow-md shadow-blue-500/25">
              <User className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-black text-slate-900">Tenant Dashboard</h2>
                <span className="rounded-full bg-blue-50 text-blue-700 text-[10px] font-bold px-2 py-0.5 border border-blue-200">
                  Verified Tenant
                </span>
              </div>
              <p className="text-xs text-slate-500 font-medium">
                Welcome back, {currentUser?.fullName || activeAgreement?.tenant?.full_name || "Resident"} • {currentUser?.relocationContext || "Verified Tenant"}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                signOut();
                onClose();
              }}
              className="rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 px-3 py-1.5 text-xs font-semibold transition-colors cursor-pointer"
            >
              Sign Out
            </button>
            <button
              type="button"
              onClick={onClose}
              className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-100 text-slate-500 hover:bg-slate-200 hover:text-slate-800 transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-slate-200 bg-slate-50/70 px-6 overflow-x-auto gap-1 text-xs font-bold">
          <button
            type="button"
            onClick={() => setActiveTab("overview")}
            className={`py-3 px-3.5 border-b-2 transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === "overview"
                ? "border-blue-600 text-blue-600"
                : "border-transparent text-slate-500 hover:text-slate-800"
            }`}
          >
            <Home className="w-3.5 h-3.5" />
            <span>My Tenancy Overview</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("agreements")}
            className={`py-3 px-3.5 border-b-2 transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === "agreements"
                ? "border-blue-600 text-blue-600"
                : "border-transparent text-slate-500 hover:text-slate-800"
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Tenancy Agreements</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("escrow")}
            className={`py-3 px-3.5 border-b-2 transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === "escrow"
                ? "border-emerald-600 text-emerald-700"
                : "border-transparent text-slate-500 hover:text-slate-800"
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Escrow &amp; Move-In Pass</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("bookings")}
            className={`py-3 px-3.5 border-b-2 transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === "bookings"
                ? "border-blue-600 text-blue-600"
                : "border-transparent text-slate-500 hover:text-slate-800"
            }`}
          >
            <CalendarCheck className="w-3.5 h-3.5" />
            <span>Optional Tours ({mockBookings.length})</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("payments")}
            className={`py-3 px-3.5 border-b-2 transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === "payments"
                ? "border-blue-600 text-blue-600"
                : "border-transparent text-slate-500 hover:text-slate-800"
            }`}
          >
            <CreditCard className="w-3.5 h-3.5" />
            <span>4-Way Payment Receipts</span>
          </button>
        </div>

        {/* Dashboard Body */}
        <div className="p-6 space-y-6 flex-1 overflow-y-auto">
          {/* TAB 1: OVERVIEW */}
          {activeTab === "overview" && (
            <div className="space-y-6">
              {/* Quick Stat Highlights */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-2xs">
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                    Current Home
                  </span>
                  <p className="text-base font-black text-slate-900 mt-1 truncate">
                    Barnawa Terraces
                  </p>
                  <span className="inline-block mt-2 text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                    Active Residential Lease
                  </span>
                </div>

                <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-2xs">
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                    Escrow Protection
                  </span>
                  <p className="text-base font-black text-emerald-700 mt-1 flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4" />
                    <span>{activeEscrow ? "24h Holding" : "Protected (₦0 Risk)"}</span>
                  </p>
                  <span className="inline-block mt-2 text-[10px] font-bold text-blue-700 bg-blue-50 border border-blue-200 px-2 py-0.5 rounded-full">
                    Key-In-Door Guaranteed
                  </span>
                </div>

                <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-2xs">
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                    Caution Ringfencing
                  </span>
                  <p className="text-base font-black text-slate-900 mt-1">
                    ₦50,000 (10%)
                  </p>
                  <span className="inline-block mt-2 text-[10px] font-bold text-slate-600 bg-slate-100 border border-slate-200 px-2 py-0.5 rounded-full">
                    Escrow Custody
                  </span>
                </div>

                <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-2xs">
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                    Verified Identity
                  </span>
                  <p className="text-base font-black text-slate-900 mt-1">
                    NIN: {currentUser?.ninNumber || "5829 •••• 3921"}
                  </p>
                  <span className="inline-flex items-center gap-1 mt-2 text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                    <Check className="w-3 h-3 text-emerald-700" />
                    <span>Verified Tenant</span>
                  </span>
                </div>
              </div>

              {/* Active Home Card */}
              <div className="rounded-3xl border border-blue-200 bg-gradient-to-br from-blue-50/70 via-white to-slate-50 p-6 shadow-sm">
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                  <div className="flex items-start gap-4">
                    <div className="relative h-20 w-24 flex-shrink-0 overflow-hidden rounded-2xl border border-slate-200 shadow-2xs">
                      <Image
                        src={currentHome?.images[0] || "/images/living_room.jpg"}
                        alt="Home"
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="rounded-full bg-blue-600 text-white text-[10px] font-black px-2.5 py-0.5">
                          My Current Residence
                        </span>
                        <span className="text-xs text-slate-500 font-semibold">
                          Mandate #{currentHome?.mandate.mandate_ref}
                        </span>
                      </div>
                      <h3 className="text-lg font-black text-slate-900 mt-1">
                        {currentHome?.title}
                      </h3>
                      <p className="text-xs text-slate-600 mt-0.5 flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-blue-600" />
                        <span>{currentHome?.full_address} ({currentHome?.commute_badge})</span>
                      </p>
                      <p className="text-xs font-bold text-blue-700 mt-2">
                        Annual Rent: ₦{currentHome?.pricing.annual_rent.toLocaleString("en-NG")} • Next Renewal: Oct 2027
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row items-stretch md:items-center gap-2 w-full md:w-auto">
                    {onOpenEscrowModal && (
                      <button
                        type="button"
                        onClick={onOpenEscrowModal}
                        className="rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2.5 text-xs font-bold transition-all shadow-md shadow-emerald-600/20 cursor-pointer text-center flex items-center justify-center gap-1.5"
                      >
                        <ShieldCheck className="w-3.5 h-3.5" />
                        <span>Escrow Dashboard</span>
                      </button>
                    )}
                    {onOpenAgreementViewer && (
                      <button
                        type="button"
                        onClick={() => onOpenAgreementViewer(currentHome)}
                        className="rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-800 px-4 py-2.5 text-xs font-bold transition-colors cursor-pointer text-center flex items-center justify-center gap-1.5"
                      >
                        <FileText className="w-3.5 h-3.5" />
                        <span>View Lease Document</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Quick Actions & Explore */}
              <div className="rounded-2xl border border-slate-200 bg-white p-5 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div>
                  <h4 className="text-sm font-bold text-slate-900">Looking for another Kaduna property?</h4>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Remember: Inspecting a property is 100% free and optional. You can also lease instantly with direct statutory agreement.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    if (onExploreProperties) onExploreProperties();
                  }}
                  className="rounded-xl bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 text-xs font-bold transition-all shadow-md shadow-blue-500/25 cursor-pointer whitespace-nowrap"
                >
                  Browse Verified Feed &rarr;
                </button>
              </div>
            </div>
          )}

          {/* TAB 2: AGREEMENTS */}
          {activeTab === "agreements" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-bold text-slate-900">Digital Tenancy Agreements</h3>
                  <p className="text-xs text-slate-500">
                    Statutory Kaduna leases with 2-party electronic signatures and SHA-256 cryptographic audit seal.
                  </p>
                </div>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
                  <div>
                    <span className="rounded-md bg-emerald-50 text-emerald-700 text-[10px] font-bold px-2 py-0.5 border border-emerald-200">
                      Fully Executed Lease
                    </span>
                    <h4 className="text-sm font-bold text-slate-900 mt-1">
                      {activeAgreement?.property_title || currentHome?.title}
                    </h4>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Agreement Ref: {activeAgreement?.agreement_id || "SETT-AGR-2026-BNW-089"} • Statutory 12-Month Lease
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-bold text-slate-400 block uppercase">Total Statutory Fees</span>
                    <span className="text-base font-black text-blue-600">
                      ₦{currentHome?.pricing.total_move_in_cost.toLocaleString("en-NG")}
                    </span>
                  </div>
                </div>

                <div className="py-3.5 grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs text-slate-600">
                  <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                    <span className="text-[10px] text-slate-400 font-bold block uppercase">Tenant Signature</span>
                    <strong className="text-slate-900 font-semibold">{currentUser?.fullName || activeAgreement?.tenant?.full_name || "Verified Tenant"}</strong>
                    <span className="text-[10px] text-emerald-600 block mt-0.5 flex items-center gap-1">
                      <Check className="w-3 h-3 text-emerald-600" />
                      <span>Cryptographically Signed</span>
                    </span>
                  </div>
                  <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                    <span className="text-[10px] text-slate-400 font-bold block uppercase">Manager Attestation</span>
                    <strong className="text-slate-900 font-semibold">HB&amp;A Partners &amp; Co.</strong>
                    <span className="text-[10px] text-blue-600 block mt-0.5 flex items-center gap-1">
                      <Check className="w-3 h-3 text-blue-600" />
                      <span>Pre-Certified Mandate</span>
                    </span>
                  </div>
                  <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                    <span className="text-[10px] text-slate-400 font-bold block uppercase">Master Seal Hash</span>
                    <code className="text-[10px] text-slate-700 font-mono block truncate">
                      {activeAgreement?.master_seal_hash || "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855"}
                    </code>
                    <span className="text-[10px] text-slate-500 block mt-0.5">SHA-256 Immutable</span>
                  </div>
                </div>

                <div className="pt-3 flex items-center justify-end gap-2 border-t border-slate-100">
                  {onOpenAgreementViewer && (
                    <button
                      type="button"
                      onClick={() => onOpenAgreementViewer(currentHome)}
                      className="rounded-xl bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 text-xs font-bold transition-all shadow-md shadow-blue-500/25 cursor-pointer flex items-center gap-1.5"
                    >
                      <FileText className="w-3.5 h-3.5" />
                      <span>View Full Agreement &amp; Signature Seal</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: ESCROW & PASS */}
          {activeTab === "escrow" && (
            <div className="space-y-4">
              <div className="rounded-2xl border border-emerald-200 bg-emerald-50/60 p-5">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <ShieldCheck className="w-6 h-6 text-emerald-600" />
                      <h3 className="text-base font-bold text-slate-900">Key-In-Door Move-In Escrow Protection</h3>
                    </div>
                    <p className="text-xs text-slate-600 mt-1 leading-relaxed max-w-2xl">
                      Your annual rent is held in secure trust until you pick up keys and inspect the premises. You hold the <strong>24-Hour Dispute Power</strong> to freeze funds if the property fails physical representation.
                    </p>
                  </div>
                  {onOpenEscrowModal && (
                    <button
                      type="button"
                      onClick={onOpenEscrowModal}
                      className="rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 text-xs font-bold transition-all shadow-md shadow-emerald-600/20 cursor-pointer whitespace-nowrap"
                    >
                      Open Escrow Panel &rarr;
                    </button>
                  )}
                </div>
              </div>

              {/* Move-In Pass Voucher Banner */}
              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-3.5">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 text-blue-700 border border-blue-200">
                    <Ticket className="w-6 h-6" />
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Digital Key Pickup Pass</span>
                    <h4 className="text-sm font-bold text-slate-900">
                      Pass #{activePass?.pass_id || "SETT-MIP-8921"} (Ready for Gate Clearance)
                    </h4>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Present at gate security for immediate key handover.
                    </p>
                  </div>
                </div>
                {onOpenPassViewer && (
                  <button
                    type="button"
                    onClick={onOpenPassViewer}
                    className="rounded-xl border border-blue-200 bg-blue-50 hover:bg-blue-100 text-blue-700 px-4 py-2 text-xs font-bold transition-colors cursor-pointer"
                  >
                    View Digital Pass &amp; QR
                  </button>
                )}
              </div>
            </div>
          )}

          {/* TAB 4: INSPECTION BOOKINGS (OPTIONAL) */}
          {activeTab === "bookings" && (
            <div className="space-y-4">
              <div className="rounded-2xl bg-blue-50/70 border border-blue-100 p-4 text-xs text-slate-700">
                <strong className="text-slate-900 mb-1 flex items-center gap-1.5 font-bold">
                  <Info className="w-4 h-4 text-blue-600" />
                  <span>Physical Inspections Are 100% Free &amp; Optional:</span>
                </strong>
                All Settlla properties are verified with HB&amp;A Landlord mandates and photographic proof. You may take a free walkthrough tour or proceed directly to instant online leasing.
              </div>

              {mockBookings.map((b) => (
                <div key={b.booking_id} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs space-y-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="rounded-full bg-emerald-50 text-emerald-700 text-[10px] font-bold px-2.5 py-0.5 border border-emerald-200 flex items-center gap-1 w-fit">
                        <Check className="w-3 h-3 text-emerald-700" />
                        <span>Confirmed Walkthrough</span>
                      </span>
                      <h4 className="text-sm font-bold text-slate-900 mt-1">{b.property_title}</h4>
                      <p className="text-xs text-slate-500">{b.property_address}</p>
                    </div>
                    <div className="text-right">
                      <span className="text-xs font-bold text-blue-600 block">{b.slot_time}</span>
                      <span className="text-[11px] text-slate-500">{b.formatted_date}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-3 border-t border-slate-100 text-xs">
                    <div>
                      <span className="text-slate-400 block text-[10px] uppercase font-bold">Host / Manager</span>
                      <span className="font-bold text-slate-800">{b.manager_name}</span>
                    </div>
                    <a
                      href={`https://wa.me/${b.manager_whatsapp}?text=Hello%20${encodeURIComponent(b.manager_name)},%20I%20have%20an%20inspection%20pass%20(${b.booking_id})%20for%20${encodeURIComponent(b.property_title)}.`}
                      target="_blank"
                      rel="noreferrer"
                      className="rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 px-3 py-1.5 font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <MessageSquare className="w-3.5 h-3.5" />
                      <span>WhatsApp Host</span>
                    </a>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* TAB 5: PAYMENTS */}
          {activeTab === "payments" && (
            <div className="space-y-4">
              <div>
                <h3 className="text-base font-bold text-slate-900">4-Way Statutory Split Payment History</h3>
                <p className="text-xs text-slate-500">
                  Every naira paid is itemized with statutory transparency (Rent, Caution, Legal, Agency).
                </p>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-xs">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 uppercase text-[10px] font-bold">
                    <tr>
                      <th className="py-3 px-4">Transaction Ref</th>
                      <th className="py-3 px-4">Property</th>
                      <th className="py-3 px-4">Breakdown</th>
                      <th className="py-3 px-4 text-right">Total Amount</th>
                      <th className="py-3 px-4 text-right">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-700">
                    <tr>
                      <td className="py-3.5 px-4 font-mono font-bold text-slate-900">
                        {recentTransaction?.transaction_id || "SETT-TX-2026-9821"}
                      </td>
                      <td className="py-3.5 px-4 font-semibold text-slate-800">
                        {currentHome?.title}
                      </td>
                      <td className="py-3.5 px-4 text-[11px] text-slate-500">
                        Rent (₦500k) + Caution (₦50k) + Legal (₦25k) + Agency (₦50k)
                      </td>
                      <td className="py-3.5 px-4 text-right font-black text-blue-600">
                        ₦625,000
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <span className="rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 text-[10px] font-bold">
                          Settled / In Escrow
                        </span>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
