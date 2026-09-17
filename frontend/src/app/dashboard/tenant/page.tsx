"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useAuth } from "@/context/AuthContext";
import { Listing } from "@/types/listing";
import {
  Home,
  ShieldCheck,
  Key,
  FileText,
  Calendar,
  CreditCard,
  Lock,
  MapPin,
  Clock,
  AlertTriangle,
  CheckCircle2,
  ExternalLink,
  MessageSquare,
  Building2,
  ArrowRight,
  ShieldAlert,
  ChevronRight,
  UserCheck,
  Zap,
  X,
} from "lucide-react";
import {
  DashboardShell,
  DashboardStat,
  DashboardSectionHead,
  DashboardCallout,
  DashboardCountdown,
  type DashboardTabItem,
} from "@/components/dashboard/DashboardShell";
import { loadCurrentTenantRental, persistEscrowHoldUpdate } from "@/lib/settlla/rentals";
import { fetchLatestTenantBooking, cancelInspectionBooking } from "@/lib/settlla/bookings";

const TENANT_TABS: DashboardTabItem[] = [
  { id: "overview", label: "Tenancy", icon: Home },
  { id: "agreements", label: "Agreement", icon: FileText },
  { id: "escrow", label: "Escrow & keys", icon: ShieldCheck },
  { id: "bookings", label: "Walkthroughs", icon: Calendar },
  { id: "payments", label: "Payments", icon: CreditCard },
];

export default function TenantDashboardPage() {
  const { currentUser, signOut, switchRole } = useAuth();
  const [activeTab, setActiveTab] = useState<"overview" | "agreements" | "escrow" | "bookings" | "payments">("overview");

  // Dynamic Rental State from localStorage
  const [currentRental, setCurrentRental] = useState<any>(null);
  const [savedBooking, setSavedBooking] = useState<any>(null);
  const [escrowFrozen, setEscrowFrozen] = useState(false);
  const [keyConfirmed, setKeyConfirmed] = useState(false);
  const [isInspectionCancelled, setIsInspectionCancelled] = useState(false);

  // Real-Time Stay Countdown Timer State (365 days / 12 months)
  const [stayTimeRemaining, setStayTimeRemaining] = useState({
    days: 364,
    hours: 23,
    minutes: 59,
    seconds: 59,
  });

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const parsed = await loadCurrentTenantRental();
        const booking = await fetchLatestTenantBooking();
        if (!cancelled && parsed) {
          setCurrentRental(parsed);
          const hold = parsed.escrow_hold as { confirmed_by_tenant?: boolean; dispute_active?: boolean } | null;
          if (hold) {
            setKeyConfirmed(Boolean(hold.confirmed_by_tenant));
            setEscrowFrozen(Boolean(hold.dispute_active));
          }
        }
        if (!cancelled && booking) {
          setSavedBooking(booking);
        }
      } catch (e) {
        console.error("Failed to load rental or booking", e);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const tab = new URLSearchParams(window.location.search).get("tab");
    if (
      tab === "escrow" ||
      tab === "agreements" ||
      tab === "bookings" ||
      tab === "payments" ||
      tab === "overview"
    ) {
      setActiveTab(tab);
    }
  }, []);

  // Stay Countdown Live Tick
  useEffect(() => {
    if (!keyConfirmed) return;

    let confirmedAt = Date.now();
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("settlla_key_confirmed_at");
      if (stored) {
        confirmedAt = parseInt(stored, 10) || Date.now();
      } else {
        localStorage.setItem("settlla_key_confirmed_at", confirmedAt.toString());
      }
    }

    // 365 Days Tenancy Duration
    const leaseEndTimestamp = confirmedAt + 365 * 24 * 60 * 60 * 1000;

    const tick = () => {
      const now = Date.now();
      const diff = Math.max(0, leaseEndTimestamp - now);
      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
      const minutes = Math.floor((diff / (1000 * 60)) % 60);
      const seconds = Math.floor((diff / 1000) % 60);

      setStayTimeRemaining({ days, hours, minutes, seconds });
    };

    tick();
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, [keyConfirmed]);

  const handleConfirmKeyHandover = () => {
    const now = Date.now();
    setKeyConfirmed(true);
    setEscrowFrozen(false);
    if (currentRental) {
      const updatedEscrow = {
        ...(currentRental.escrow_hold || {}),
        confirmed_by_tenant: true,
        escrow_status: "released_to_landlord",
        confirmed_at: new Date(now).toISOString(),
      };
      const updated = {
        ...currentRental,
        escrow_hold: updatedEscrow,
      };
      setCurrentRental(updated);
      void persistEscrowHoldUpdate(currentRental.rental_id, updatedEscrow);
    }
  };

  const handleCancelInspection = () => {
    setIsInspectionCancelled(true);
    const bookingId = savedBooking?.booking_id || currentRental?.booking?.booking_id;
    setSavedBooking(null);
    if (bookingId) {
      void cancelInspectionBooking(bookingId);
    }
  };

  const handleFreezeEscrow = () => {
    setEscrowFrozen(true);
    if (currentRental) {
      const updatedEscrow = {
        ...(currentRental.escrow_hold || {}),
        dispute_active: true,
        escrow_status: "dispute_hold",
      };
      const updated = {
        ...currentRental,
        escrow_hold: updatedEscrow,
      };
      setCurrentRental(updated);
      void persistEscrowHoldUpdate(currentRental.rental_id, updatedEscrow);
    }
  };

  const home = (currentRental?.listing as Listing | undefined) ?? null;
  const activeBooking = !isInspectionCancelled ? (currentRental?.booking || savedBooking) : null;
  const agreement = currentRental?.agreement;
  const transaction = currentRental?.transaction;
  const moveInPass = currentRental?.move_in_pass;

  const tenantName =
    currentUser?.fullName ||
    agreement?.tenant?.full_name ||
    "Verified Tenant";
  const tenantPhone =
    currentUser?.phoneNumber ||
    agreement?.tenant?.phone_number ||
    "0803 123 4567";
  const tenantContext =
    currentUser?.relocationContext ||
    agreement?.tenant?.employer_name ||
    "Kaduna Resident";
  return (
    <DashboardShell
      accent="tenant"
      hubBadge="Tenant"
      hubSubtitle="Your tenancy & escrow"
      currentNavLabel="Tenant dashboard"
      feedLinkLabel="Browse properties"
      userTitle={tenantName}
      userSubtitle="Verified tenant"
      pageTitle={tenantName}
      pageDescription={`${tenantContext} · ${tenantPhone}`}
      pageMeta={
        <>
          <span className="settlla-chip">
            <ShieldCheck className="h-3.5 w-3.5 text-[var(--settlla-brand)]" />
            Escrow protected
          </span>
          <span className="settlla-chip">
            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
            NIN on file
          </span>
        </>
      }
      pageAction={
        <Link href="/" className="btn btn-md btn-primary w-full sm:w-auto">
          Explore homes
          <ArrowRight className="h-4 w-4" />
        </Link>
      }
      tabs={TENANT_TABS}
      activeTab={activeTab}
      onTabChange={(id) => setActiveTab(id as typeof activeTab)}
      onSwitchRole={() => switchRole("agent")}
      switchRoleLabel="Agent desk"
      onSignOut={signOut}
      mobileNavActiveLabel="Tenancy"
    >
        {/* TAB 1: OVERVIEW */}
        {activeTab === "overview" && (
          <div className="space-y-6">
            {/* Stay Countdown Widget (Active immediately after key confirmation) */}
            {keyConfirmed && home && (
              <DashboardCountdown
                subtitle={`Keys confirmed · ${home.title} · valid through Sep 2027`}
                days={stayTimeRemaining.days}
                hours={stayTimeRemaining.hours}
                minutes={stayTimeRemaining.minutes}
                seconds={stayTimeRemaining.seconds}
                footer={
                  <>
                    Caution deposit ₦{(home.pricing.caution_fee || 0).toLocaleString("en-NG")} ringfenced ·
                    renewal opens at 60 days left
                  </>
                }
              />
            )}

            {/* Active Walkthrough Pass Alert Banner */}
            {activeBooking && (
              <DashboardCallout
                variant="info"
                icon={Calendar}
                title={activeBooking.property_title || home?.title || "Walkthrough"}
                actions={
                  <>
                    <Link
                      href={`/listing/${activeBooking.listing_id}?start_agreement=true`}
                      className="btn btn-sm btn-primary"
                    >
                      Proceed to rent
                      <ArrowRight className="h-3.5 w-3.5" />
                    </Link>
                    <button type="button" onClick={handleCancelInspection} className="btn btn-sm btn-secondary text-rose-700 border-rose-200 bg-rose-50">
                      Cancel tour
                    </button>
                    <button type="button" onClick={() => setActiveTab("bookings")} className="btn btn-sm btn-ghost">
                      Details
                    </button>
                  </>
                }
              >
                {activeBooking.formatted_date || "Upcoming tour"} · {activeBooking.slot_time || "2:30 PM"} ·{" "}
                {activeBooking.property_address || home?.full_address || "Kaduna"} · Free walkthrough
              </DashboardCallout>
            )}

            {/* Cancelled Inspection Alert Banner */}
            {isInspectionCancelled && (
              <div className="rounded-3xl border border-amber-200 bg-amber-50/80 p-5 sm:p-6 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 animate-fade-in">
                <div className="flex items-start gap-3.5">
                  <div className="h-11 w-11 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center shrink-0 border border-amber-200">
                    <X className="h-5 w-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-black uppercase tracking-wider text-amber-800 bg-amber-200/80 px-2.5 py-0.5 rounded-full">
                        Inspection Cancelled
                      </span>
                      <span className="text-xs text-slate-600">Walkthrough slot released</span>
                    </div>
                    <h4 className="text-base font-bold text-slate-900 mt-1">
                      Ready to secure a home directly?
                    </h4>
                    <p className="text-xs text-slate-600 mt-0.5">
                      You don't need physical inspection to rent. You are protected with 24-hr Key-In-Door Escrow custody.
                    </p>
                  </div>
                </div>

                <Link
                  href={home ? `/listing/${home.id}?start_agreement=true` : "/"}
                  className="flex items-center gap-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 text-xs font-bold transition-all shadow-md shadow-blue-600/20 shrink-0 cursor-pointer"
                >
                  <Zap className="h-3.5 w-3.5 text-amber-300" />
                  <span>Proceed to Rent</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            )}

            {!home && !activeBooking && (
              <div className="settlla-card p-8 text-center space-y-3">
                <div className="mx-auto h-12 w-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center">
                  <Home className="h-6 w-6" />
                </div>
                <h4 className="text-base font-bold text-slate-900">No active tenancy yet</h4>
                <p className="text-xs text-slate-500 max-w-md mx-auto">
                  Browse verified Kaduna listings, book a free walkthrough, or start a lease. Your dashboard will fill in from Supabase once you rent.
                </p>
                <Link href="/" className="btn btn-md btn-primary inline-flex">
                  Explore homes
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            )}

            {home && (
            <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <DashboardStat
                label="Active lease"
                value={<span className="truncate block">{home.title}</span>}
                icon={Home}
                hint={<span className="dashboard-stat-hint">Through Sep 2027</span>}
              />
              <DashboardStat
                label="Escrow"
                value={
                  escrowFrozen ? "Dispute hold" : keyConfirmed ? "Keys confirmed" : "Awaiting keys"
                }
                icon={ShieldCheck}
                hint={
                  <span className="dashboard-stat-hint">
                    ₦{Math.round(home.pricing.annual_rent * 0.75).toLocaleString("en-NG")} held
                  </span>
                }
              />
              <DashboardStat
                label="Caution deposit"
                value={`₦${home.pricing.caution_fee.toLocaleString("en-NG")}`}
                icon={Lock}
                hint={<span className="dashboard-stat-hint">Refundable at move-out</span>}
              />
              <DashboardStat
                label="Walkthroughs"
                value="Optional · ₦0"
                icon={Clock}
                hint={<span className="dashboard-stat-hint">Rent online anytime</span>}
              />
            </div>

            <div className="settlla-card p-6 sm:p-8 space-y-6">
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 pb-6 border-b border-slate-100">
                <div className="flex flex-col sm:flex-row items-start gap-4 w-full sm:w-auto">
                  <div className="relative h-44 sm:h-24 w-full sm:w-32 flex-shrink-0 overflow-hidden rounded-2xl border border-slate-200 shadow-2xs">
                    <Image
                      src={home.images[0] || "/images/living_room.jpg"}
                      alt={home.title}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div className="min-w-0 flex-1">
                    <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 border border-blue-200 px-2.5 py-0.5 text-xs font-bold text-blue-700 mb-1">
                      <Home className="h-3 w-3" />
                      <span>{home.neighborhood} • {home.zone}</span>
                    </span>
                    <h3 className="text-lg sm:text-xl font-black text-slate-900">{home.title}</h3>
                    <p className="text-xs text-slate-500 flex items-center gap-1 mt-1">
                      <MapPin className="h-3.5 w-3.5 text-slate-400" />
                      <span>{home.full_address}</span>
                    </p>
                    <p className="text-xs font-bold text-blue-700 mt-1">
                      Mandate Ref: {home.mandate.mandate_ref} ({home.mandate.manager_name})
                    </p>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row items-stretch md:items-center gap-2 w-full md:w-auto">
                  <button
                    type="button"
                    onClick={() => setActiveTab("escrow")}
                    className="btn btn-md btn-primary w-full sm:w-auto"
                  >
                    <ShieldCheck className="h-4 w-4" />
                    Escrow & keys
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTab("agreements")}
                    className="btn btn-md btn-secondary w-full sm:w-auto"
                  >
                    <FileText className="h-4 w-4" />
                    View agreement
                  </button>
                </div>
              </div>

              {/* Host & Property Manager Information */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 flex items-start gap-3">
                  <Building2 className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">
                      Licensed Property Manager
                    </span>
                    <strong className="text-slate-900 text-sm">{home.mandate.manager_name}</strong>
                    <p className="text-slate-500 mt-0.5">{home.mandate.accreditation}</p>
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 flex items-start gap-3">
                  <UserCheck className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">
                      Registered landlord
                    </span>
                    <strong className="text-slate-900 text-sm">{home.mandate.landlord_name}</strong>
                    <Link
                      href="/dashboard/agent"
                      className="text-blue-600 hover:text-blue-700 font-semibold text-xs flex items-center gap-1 mt-0.5"
                    >
                      Contact manager
                      <ArrowRight className="h-3 w-3" />
                    </Link>
                  </div>
                </div>
              </div>
            </div>
            </>
            )}
          </div>
        )}

        {/* TAB 2: TENANCY AGREEMENTS */}
        {activeTab === "agreements" && (
          <div className="space-y-4">
            {!home ? (
              <div className="settlla-card p-8 text-center text-sm text-slate-500">
                No signed lease on file yet.{" "}
                <Link href="/" className="font-bold text-blue-600">
                  Browse homes
                </Link>
              </div>
            ) : (
            <>
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2">
                  <FileText className="h-5 w-5 text-blue-600" />
                  <span>Statutory Tenancy Agreement</span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Executed 2-party Kaduna residential lease with SHA-256 cryptographic audit seal.
                </p>
              </div>
            </div>

            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xs space-y-4">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
                <div>
                  <span className="inline-flex items-center gap-1 rounded-md bg-emerald-50 text-emerald-700 text-[10px] font-bold px-2 py-0.5 border border-emerald-200">
                    <CheckCircle2 className="h-3 w-3" />
                    <span>Fully Executed &amp; Sealed</span>
                  </span>
                  <h4 className="text-base font-bold text-slate-900 mt-1">{home.title}</h4>
                  <p className="text-xs text-slate-500">
                    Agreement ID: {agreement?.agreement_id || "SETT-AGR-2026-BNW-089"} • 12-Month Tenancy Term
                  </p>
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-slate-400 uppercase font-bold block">Annual Value</span>
                  <span className="text-base font-black text-blue-600">
                    ₦{home.pricing.total_move_in_cost.toLocaleString("en-NG")}
                  </span>
                </div>
              </div>

              {/* Audit Trail Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-100">
                  <span className="text-[10px] text-slate-400 font-bold block uppercase mb-1">
                    Tenant Signature
                  </span>
                  <strong className="text-slate-900 font-bold block">{tenantName}</strong>
                  <span className="text-[10px] text-emerald-600 font-semibold flex items-center gap-1 mt-1">
                    <CheckCircle2 className="h-3 w-3" />
                    <span>Cryptographic Digest Verified</span>
                  </span>
                </div>

                <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-100">
                  <span className="text-[10px] text-slate-400 font-bold block uppercase mb-1">
                    Manager Attestation
                  </span>
                  <strong className="text-slate-900 font-bold block">{home.mandate.manager_name}</strong>
                  <span className="text-[10px] text-blue-600 font-semibold flex items-center gap-1 mt-1">
                    <CheckCircle2 className="h-3 w-3" />
                    <span>ESVARBON Pre-Certified</span>
                  </span>
                </div>

                <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-100">
                  <span className="text-[10px] text-slate-400 font-bold block uppercase mb-1">
                    Master Seal Hash
                  </span>
                  <code className="text-[10px] font-mono text-slate-700 truncate block">
                    {agreement?.master_seal_hash || "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855"}
                  </code>
                  <span className="text-[10px] text-slate-500 block mt-1">SHA-256 Immutable Audit</span>
                </div>
              </div>

              <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
                <span className="text-slate-500">
                  Drafted pursuant to Kaduna State Tenancy Law &amp; Mandate #{home.mandate.mandate_ref}
                </span>
                <Link
                  href="/"
                  className="inline-flex items-center gap-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold px-4 py-2 shadow-xs transition-colors"
                >
                  <FileText className="h-3.5 w-3.5" />
                  <span>Download Signed Lease Copy</span>
                </Link>
              </div>
            </div>
            </>
            )}
          </div>
        )}

        {/* TAB 3: ESCROW & MOVE-IN PASS */}
        {activeTab === "escrow" && (
          <div className="space-y-6">
            {!home ? (
              <div className="settlla-card p-8 text-center text-sm text-slate-500">
                Escrow appears here after you complete move-in payment.
              </div>
            ) : (
            <>
            <DashboardSectionHead
              title="Move-in escrow"
              description={`₦${Math.round(home.pricing.annual_rent * 0.75).toLocaleString("en-NG")} rent stays held until you confirm working keys.`}
            />
            <div className="settlla-card p-6 sm:p-8 space-y-5 border-emerald-200/80 bg-[var(--settlla-success-muted)]/40">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-start gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-600 text-white shrink-0">
                    <ShieldCheck className="h-5 w-5" />
                  </div>
                  <p className="text-body text-sm max-w-lg">
                    Confirm keys when you move in to release escrow to the landlord. Report a problem
                    within 24 hours to pause release.
                  </p>
                </div>
                <div className="flex flex-col sm:flex-row gap-2 shrink-0">
                  {!keyConfirmed && !escrowFrozen && (
                    <button
                      type="button"
                      onClick={handleConfirmKeyHandover}
                      className="btn btn-md btn-primary"
                    >
                      <Key className="h-4 w-4" />
                      Confirm key handover
                    </button>
                  )}
                  {!escrowFrozen && !keyConfirmed && (
                    <button
                      type="button"
                      onClick={handleFreezeEscrow}
                      className="btn btn-md btn-secondary text-rose-700 border-rose-200 bg-rose-50 hover:bg-rose-100"
                    >
                      <ShieldAlert className="h-4 w-4" />
                      Report problem
                    </button>
                  )}
                </div>
              </div>

              {escrowFrozen && (
                <div className="rounded-2xl border border-rose-300 bg-rose-50 p-4 text-xs text-rose-900 flex items-start gap-3">
                  <AlertTriangle className="h-5 w-5 text-rose-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-sm font-bold block mb-0.5">Escrow Disbursement Frozen!</strong>
                    <span>Settlla Concierge has frozen landlord disbursement. An inspector will contact you within 2 hours.</span>
                  </div>
                </div>
              )}

              {keyConfirmed && (
                <DashboardCountdown
                  subtitle={`Escrow released · ${home.title}`}
                  days={stayTimeRemaining.days}
                  hours={stayTimeRemaining.hours}
                  minutes={stayTimeRemaining.minutes}
                  seconds={stayTimeRemaining.seconds}
                />
              )}
            </div>

            <div className="settlla-card p-5 sm:p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50 text-blue-600 border border-blue-200 flex-shrink-0">
                  <Key className="h-7 w-7" />
                </div>
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                    Digital Key Pickup Pass
                  </span>
                  <h4 className="text-base font-bold text-slate-900">
                    Pass #{moveInPass?.pass_id || "SETT-MIP-8921"} (Gate Clearance)
                  </h4>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Present at gate security for immediate key release.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto">
                <div className="rounded-xl border border-blue-200 bg-blue-50/80 px-4 py-2.5 text-center">
                  <span className="text-[10px] text-blue-600 uppercase font-bold block">QR Verification</span>
                  <span className="text-xs font-mono font-bold text-slate-800">
                    {moveInPass?.qr_token || "QR-SETT-8921-VERIFIED"}
                  </span>
                </div>
              </div>
            </div>
            </>
            )}
          </div>
        )}

        {/* TAB 4: OPTIONAL TOURS */}
        {/* TAB 4: INSPECTIONS */}
        {activeTab === "bookings" && (
          <div className="space-y-4">
            <div>
              <h3 className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2">
                <Calendar className="h-5 w-5 text-blue-600" />
                <span>Scheduled Walkthrough Pass</span>
              </h3>
              <div className="mt-1 flex items-center gap-2 text-xs text-slate-500">
                <span className="flex h-2 w-2 rounded-full bg-emerald-500" />
                <span>All listings on Settlla are pre-vetted with certified mandates. You can tour in person for free or rent online directly.</span>
              </div>
            </div>

            {activeBooking ? (
              <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xs space-y-4">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
                  <div>
                    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 text-emerald-700 text-[10px] font-bold px-2.5 py-0.5 border border-emerald-200">
                      <CheckCircle2 className="h-3 w-3" />
                      <span>Confirmed Walkthrough Pass</span>
                    </span>
                    <h4 className="text-base font-bold text-slate-900 mt-1">{activeBooking?.property_title || home?.title}</h4>
                    <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                      <MapPin className="h-3.5 w-3.5 text-slate-400" />
                      <span>{activeBooking?.property_address || home?.full_address}</span>
                    </p>
                    <span className="text-[11px] font-mono text-blue-600 font-bold block mt-1">
                      Pass Reference: {activeBooking?.booking_id || "SETT-BK-7824"} (Present at Gate)
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-sm font-bold text-blue-600 block">{activeBooking?.formatted_date || "Fri, Sep 18, 2026"}</span>
                    <span className="text-xs text-slate-500">{activeBooking?.slot_time || "2:30 PM - 3:00 PM"}</span>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-xs pt-2">
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase font-bold">Host / Property Manager</span>
                    <span className="font-bold text-slate-800">{activeBooking?.manager_name || home?.mandate.manager_name}</span>
                    <span className="text-slate-500 text-[11px] block">{activeBooking?.manager_accreditation || home?.mandate.accreditation}</span>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    <Link
                      href={`/listing/${activeBooking?.listing_id}?start_agreement=true`}
                      className="inline-flex items-center gap-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 font-bold text-xs transition-colors shadow-xs"
                    >
                      <Zap className="h-3.5 w-3.5 text-amber-300" />
                      <span>Proceed to Rent</span>
                      <ArrowRight className="h-3.5 w-3.5" />
                    </Link>

                    <button
                      type="button"
                      onClick={handleCancelInspection}
                      className="inline-flex items-center gap-1.5 rounded-xl border border-rose-200 bg-rose-50 hover:bg-rose-100 text-rose-700 px-3.5 py-2.5 font-bold text-xs transition-colors cursor-pointer"
                    >
                      <X className="h-3.5 w-3.5" />
                      <span>Cancel Inspection</span>
                    </button>

                    <Link
                      href="/dashboard/agent"
                      className="inline-flex items-center gap-1.5 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-800 border border-blue-200 px-3.5 py-2 font-bold text-xs transition-colors"
                    >
                      <UserCheck className="h-3.5 w-3.5 text-blue-600" />
                      <span>View Agent Profile</span>
                    </Link>
                  </div>
                </div>
              </div>
            ) : (
              <div className="rounded-3xl border border-slate-200 bg-white p-8 text-center space-y-3">
                <div className="mx-auto h-12 w-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center">
                  <Calendar className="h-6 w-6" />
                </div>
                <h4 className="text-base font-bold text-slate-900">
                  {isInspectionCancelled ? "Walkthrough Tour Cancelled" : "No Scheduled Walkthrough Pass"}
                </h4>
                <p className="text-xs text-slate-500 max-w-md mx-auto">
                  {isInspectionCancelled
                    ? "Your physical inspection slot was successfully cancelled. You can proceed directly to execute your tenancy agreement online with full 24-hr escrow protection."
                    : "You can book optional free walkthroughs across Kaduna properties or proceed directly to rent online with 24-hr Key-In-Door escrow protection."}
                </p>
                <div className="pt-2">
                  <Link
                    href={home ? `/listing/${home.id}?start_agreement=true` : "/"}
                    className="inline-flex items-center gap-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 text-xs font-bold transition-all shadow-md shadow-blue-600/20"
                  >
                    <Zap className="h-3.5 w-3.5 text-amber-300" />
                    <span>{home ? `Proceed to Rent (${home.title})` : "Browse homes"}</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 5: PAYMENTS */}
        {activeTab === "payments" && (
          <div className="space-y-4">
            {!home || !transaction ? (
              <div className="settlla-card p-8 text-center text-sm text-slate-500">
                Payment history appears after a successful (simulated) checkout.
              </div>
            ) : (
            <>
            <div>
              <h3 className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2">
                <CreditCard className="h-5 w-5 text-blue-600" />
                <span>4-Way Statutory Split Payment History</span>
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Statutory transparency guarantee &mdash; itemized receipts for rent, caution deposit, legal, and agency fees.
              </p>
            </div>

            <div className="rounded-3xl border border-slate-200 bg-white overflow-hidden shadow-xs">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 uppercase text-[10px] font-bold">
                  <tr>
                    <th className="py-3.5 px-4">Transaction ID</th>
                    <th className="py-3.5 px-4">Property</th>
                    <th className="py-3.5 px-4">Statutory Split Breakdown</th>
                    <th className="py-3.5 px-4 text-right">Total Paid</th>
                    <th className="py-3.5 px-4 text-right">Escrow Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  <tr>
                    <td className="py-4 px-4 font-mono font-bold text-slate-900">
                      {transaction?.transaction_id || "SETT-TX-2026-9821"}
                    </td>
                    <td className="py-4 px-4 font-semibold text-slate-800">{home.title}</td>
                    <td className="py-4 px-4 text-slate-500 text-[11px]">
                      Rent (₦{home.pricing.annual_rent.toLocaleString("en-NG")}) + Caution ({home.pricing.caution_fee > 0 ? `₦${home.pricing.caution_fee.toLocaleString("en-NG")}` : "₦0 Waived"}) + Legal &amp; Agency 15% (₦{(home.pricing.legal_and_agency_fee || (home.pricing.legal_fee + home.pricing.agency_fee)).toLocaleString("en-NG")})
                    </td>
                    <td className="py-4 px-4 text-right font-black text-blue-600 text-sm">
                      ₦{home.pricing.total_move_in_cost.toLocaleString("en-NG")}
                    </td>
                    <td className="py-4 px-4 text-right">
                      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 px-2.5 py-0.5 text-[10px] font-bold">
                        <CheckCircle2 className="h-3 w-3" />
                        <span>Escrow Protected</span>
                      </span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
            </>
            )}
          </div>
        )}
    </DashboardShell>
  );
}
