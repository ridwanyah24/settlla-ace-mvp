"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useAuth } from "@/context/AuthContext";
import { SEED_LISTINGS } from "@/data/seedListings";
import {
  Home,
  ShieldCheck,
  Key,
  FileText,
  Calendar,
  CreditCard,
  Lock,
  MapPin,
  User,
  Clock,
  AlertTriangle,
  CheckCircle2,
  ExternalLink,
  MessageSquare,
  Building2,
  LogOut,
  ArrowRight,
  ShieldAlert,
  ChevronRight,
  UserCheck,
  Zap,
  X,
  Timer,
} from "lucide-react";

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
    if (typeof window !== "undefined") {
      try {
        const saved = localStorage.getItem("settlla_current_rental");
        const keyConfirmedLocal = localStorage.getItem("settlla_key_confirmed") === "true";
        if (saved) {
          const parsed = JSON.parse(saved);
          setCurrentRental(parsed);
          if (parsed.escrow_hold) {
            setKeyConfirmed(parsed.escrow_hold.confirmed_by_tenant || keyConfirmedLocal || false);
            setEscrowFrozen(parsed.escrow_hold.dispute_active || false);
          } else if (keyConfirmedLocal) {
            setKeyConfirmed(true);
          }
        } else if (keyConfirmedLocal) {
          setKeyConfirmed(true);
        }

        const rawBooking = localStorage.getItem("settlla_tenant_booking");
        if (rawBooking) {
          setSavedBooking(JSON.parse(rawBooking));
        }
      } catch (e) {
        console.error("Failed to load rental or booking from localStorage", e);
      }
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
    if (typeof window !== "undefined") {
      localStorage.setItem("settlla_key_confirmed", "true");
      if (!localStorage.getItem("settlla_key_confirmed_at")) {
        localStorage.setItem("settlla_key_confirmed_at", now.toString());
      }
      if (currentRental) {
        const updated = {
          ...currentRental,
          escrow_hold: {
            ...(currentRental.escrow_hold || {}),
            confirmed_by_tenant: true,
            escrow_status: "released_to_landlord",
            confirmed_at: new Date(now).toISOString(),
          },
        };
        setCurrentRental(updated);
        localStorage.setItem("settlla_current_rental", JSON.stringify(updated));
      }
    }
  };

  const handleCancelInspection = () => {
    setIsInspectionCancelled(true);
    setSavedBooking(null);
    if (typeof window !== "undefined") {
      localStorage.removeItem("settlla_tenant_booking");
      if (currentRental && currentRental.booking) {
        const updated = { ...currentRental };
        delete updated.booking;
        setCurrentRental(updated);
        localStorage.setItem("settlla_current_rental", JSON.stringify(updated));
      }
    }
  };

  const handleFreezeEscrow = () => {
    setEscrowFrozen(true);
    if (typeof window !== "undefined" && currentRental) {
      const updated = {
        ...currentRental,
        escrow_hold: {
          ...(currentRental.escrow_hold || {}),
          dispute_active: true,
          escrow_status: "dispute_hold",
        },
      };
      setCurrentRental(updated);
      localStorage.setItem("settlla_current_rental", JSON.stringify(updated));
    }
  };

  const home = currentRental?.listing || SEED_LISTINGS[0];
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
  const tenantNin =
    currentUser?.ninNumber ||
    agreement?.tenant?.nin_number ||
    "5829 4810 3921";

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col pb-16 lg:pb-0">
      {/* Top Navbar */}
      <header className="sticky top-0 z-40 bg-white border-b border-slate-200 shadow-xs">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <Link href="/" className="flex items-center gap-2.5 group">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 text-white shadow-md shadow-blue-500/25 group-hover:bg-blue-700 transition-colors">
                <Home className="h-5 w-5" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="text-xl font-black tracking-tight text-slate-900">Settlla</span>
                  <span className="rounded-md bg-blue-50 px-2 py-0.5 text-[10px] font-bold text-blue-700 border border-blue-200">
                    Tenant Hub
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 hidden sm:block">
                  Verified Kaduna Residential Portal
                </p>
              </div>
            </Link>

            <nav className="hidden md:flex items-center gap-4 text-xs font-semibold text-slate-600">
              <Link href="/" className="hover:text-blue-600 transition-colors">
                Browse Properties
              </Link>
              <span className="text-slate-300">•</span>
              <span className="text-blue-600 font-bold flex items-center gap-1">
                <User className="h-3.5 w-3.5" />
                <span>My Tenancy Dashboard</span>
              </span>
            </nav>
          </div>

          {/* Right User Actions */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 rounded-xl bg-blue-50/80 border border-blue-200/80 px-3 py-1.5">
              <User className="h-4 w-4 text-blue-600" />
              <div className="text-left hidden sm:block">
                <span className="text-xs font-bold text-slate-900 leading-tight block">
                  {tenantName}
                </span>
                <span className="text-[10px] font-semibold text-blue-700 block">
                  Verified Tenant
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => switchRole("agent")}
              className="hidden lg:flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 px-3 py-2 text-xs font-bold text-slate-700 transition-colors cursor-pointer"
              title="Switch to Agent view to inspect manager desk"
            >
              <Building2 className="h-3.5 w-3.5 text-emerald-600" />
              <span>Switch to Agent</span>
            </button>

            <Link
              href="/"
              onClick={() => signOut()}
              className="flex items-center gap-1 rounded-xl border border-slate-200 bg-white hover:bg-rose-50 text-slate-600 hover:text-rose-700 px-3 py-2 text-xs font-semibold transition-colors"
            >
              <LogOut className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Sign Out</span>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 mx-auto max-w-7xl w-full px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* Welcome Profile Banner */}
        <div className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="flex items-start gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-700 text-white font-black text-2xl shadow-lg shadow-blue-500/25 flex-shrink-0">
              <User className="h-8 w-8" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-black text-slate-900">
                  {tenantName}
                </h1>
                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 text-xs font-bold text-emerald-800">
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                  <span>NIN Verified ({tenantNin})</span>
                </span>
              </div>
              <p className="text-xs sm:text-sm text-slate-600 mt-1 flex items-center gap-2">
                <span>{tenantContext}</span>
                <span className="text-slate-300">•</span>
                <span>{tenantPhone}</span>
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                <span className="inline-flex items-center gap-1 rounded-lg bg-blue-50 border border-blue-200 px-2.5 py-1 text-xs font-semibold text-blue-800">
                  <ShieldCheck className="h-3.5 w-3.5 text-blue-600" />
                  <span>Key-In-Door Escrow Protected</span>
                </span>
                <span className="inline-flex items-center gap-1 rounded-lg bg-slate-100 border border-slate-200 px-2.5 py-1 text-xs font-semibold text-slate-700">
                  <Lock className="h-3.5 w-3.5 text-slate-500" />
                  <span>10% Caution Vault Ringfenced</span>
                </span>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch md:items-center gap-2.5 w-full md:w-auto">
            <Link
              href="/"
              className="rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold px-4 py-3 text-xs sm:text-sm shadow-md shadow-blue-500/25 transition-all text-center flex items-center justify-center gap-1.5"
            >
              <span>Explore Verified Homes</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="border-b border-slate-200 bg-white rounded-2xl p-1.5 shadow-2xs flex overflow-x-auto gap-1 no-scrollbar">
          <button
            type="button"
            onClick={() => setActiveTab("overview")}
            className={`flex items-center gap-2 py-2.5 px-4 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
              activeTab === "overview"
                ? "bg-blue-600 text-white shadow-xs"
                : "text-slate-600 hover:bg-slate-100"
            }`}
          >
            <Home className="h-4 w-4" />
            <span>My Current Tenancy</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("agreements")}
            className={`flex items-center gap-2 py-2.5 px-4 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
              activeTab === "agreements"
                ? "bg-blue-600 text-white shadow-xs"
                : "text-slate-600 hover:bg-slate-100"
            }`}
          >
            <FileText className="h-4 w-4" />
            <span>Tenancy Agreements</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("escrow")}
            className={`flex items-center gap-2 py-2.5 px-4 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
              activeTab === "escrow"
                ? "bg-emerald-600 text-white shadow-xs"
                : "text-slate-600 hover:bg-slate-100"
            }`}
          >
            <ShieldCheck className="h-4 w-4" />
            <span>Escrow &amp; Move-In Pass</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("bookings")}
            className={`flex items-center gap-2 py-2.5 px-4 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
              activeTab === "bookings"
                ? "bg-blue-600 text-white shadow-xs"
                : "text-slate-600 hover:bg-slate-100"
            }`}
          >
            <Calendar className="h-4 w-4" />
            <span>Optional Walkthroughs (1)</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("payments")}
            className={`flex items-center gap-2 py-2.5 px-4 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
              activeTab === "payments"
                ? "bg-blue-600 text-white shadow-xs"
                : "text-slate-600 hover:bg-slate-100"
            }`}
          >
            <CreditCard className="h-4 w-4" />
            <span>4-Way Payment Receipts</span>
          </button>
        </div>

        {/* TAB 1: OVERVIEW */}
        {activeTab === "overview" && (
          <div className="space-y-6">
            {/* Stay Countdown Widget (Active immediately after key confirmation) */}
            {keyConfirmed && (
              <div className="rounded-3xl border border-emerald-300 bg-gradient-to-br from-emerald-500/10 via-white to-emerald-50/50 p-6 sm:p-7 shadow-lg shadow-emerald-500/10 animate-fade-in">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5 pb-5 border-b border-emerald-100">
                  <div className="flex items-start gap-4">
                    <div className="h-12 w-12 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-md shadow-emerald-600/25">
                      <Key className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 border border-emerald-300">
                          ● Active Tenancy in Good Standing
                        </span>
                        <span className="text-[10px] font-bold text-slate-500">
                          Key Handover Confirmed ✓
                        </span>
                      </div>
                      <h3 className="text-xl font-black text-slate-900 mt-1">
                        Tenancy Stay Countdown: 12-Month Living Period
                      </h3>
                      <p className="text-xs text-slate-600 mt-0.5">
                        Your keys are verified and you are in peaceful, quiet possession of <strong className="text-slate-800">{home.title}</strong>.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-emerald-200 text-xs font-bold text-emerald-800 shadow-2xs">
                      <ShieldCheck className="h-4 w-4 text-emerald-600" />
                      <span>Caution Fee Ringfenced: ₦{(home.pricing.caution_fee || 50000).toLocaleString("en-NG")}</span>
                    </span>
                  </div>
                </div>

                {/* Countdown Number Cards */}
                <div className="pt-5">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                      <Timer className="h-3.5 w-3.5 text-emerald-600" />
                      <span>Active Lease Tenure Remaining (Real-Time Live Countdown)</span>
                    </span>
                    <span className="text-xs font-bold text-emerald-700 bg-emerald-100/70 px-2 py-0.5 rounded-md">
                      Valid through Sep 2027
                    </span>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
                    <div className="rounded-2xl bg-white border border-emerald-200/80 p-4 text-center shadow-xs">
                      <span className="text-3xl sm:text-4xl font-black text-slate-900 font-mono tracking-tight block">
                        {stayTimeRemaining.days}
                      </span>
                      <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mt-1 block">
                        Days Remaining
                      </span>
                    </div>

                    <div className="rounded-2xl bg-white border border-emerald-200/80 p-4 text-center shadow-xs">
                      <span className="text-3xl sm:text-4xl font-black text-slate-900 font-mono tracking-tight block">
                        {String(stayTimeRemaining.hours).padStart(2, "0")}
                      </span>
                      <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mt-1 block">
                        Hours
                      </span>
                    </div>

                    <div className="rounded-2xl bg-white border border-emerald-200/80 p-4 text-center shadow-xs">
                      <span className="text-3xl sm:text-4xl font-black text-slate-900 font-mono tracking-tight block">
                        {String(stayTimeRemaining.minutes).padStart(2, "0")}
                      </span>
                      <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mt-1 block">
                        Minutes
                      </span>
                    </div>

                    <div className="rounded-2xl bg-white border border-emerald-200/80 p-4 text-center shadow-xs">
                      <span className="text-3xl sm:text-4xl font-black text-emerald-600 font-mono tracking-tight block animate-pulse">
                        {String(stayTimeRemaining.seconds).padStart(2, "0")}
                      </span>
                      <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-600 mt-1 block">
                        Seconds
                      </span>
                    </div>
                  </div>

                  {/* Progress & Milestone Meta */}
                  <div className="mt-4 pt-3 border-t border-emerald-100/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs text-slate-600">
                    <div className="flex items-center gap-2">
                      <div className="h-2 w-2 rounded-full bg-emerald-500 animate-ping" />
                      <span>Statutory 12-Month Tenancy Period (Kaduna State Tenancy Law)</span>
                    </div>
                    <div className="text-[11px] font-medium text-slate-500">
                      Renewal window opens at <strong>60 days remaining</strong>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Active Walkthrough Pass Alert Banner */}
            {activeBooking && (
              <div className="rounded-3xl border border-blue-200 bg-gradient-to-r from-blue-50/90 via-indigo-50/50 to-blue-50/90 p-5 sm:p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-start gap-3.5">
                  <div className="h-11 w-11 rounded-2xl bg-blue-600 text-white flex items-center justify-center shrink-0 shadow-md shadow-blue-600/25">
                    <Calendar className="h-5 w-5" />
                  </div>
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-[10px] font-black uppercase tracking-wider text-blue-700 bg-blue-100 px-2.5 py-0.5 rounded-full">
                        Walkthrough Pass #{activeBooking.booking_id || "SETT-BK-7824"}
                      </span>
                      <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                        ₦0 Free Tour
                      </span>
                    </div>
                    <h4 className="text-base font-bold text-slate-900 mt-1">
                      {activeBooking.property_title || home.title}
                    </h4>
                    <p className="text-xs text-slate-600 mt-0.5 flex flex-wrap items-center gap-2">
                      <span>📅 {activeBooking.formatted_date || "Upcoming Tour"} at {activeBooking.slot_time || "2:30 PM"}</span>
                      <span className="text-slate-300 hidden sm:inline">•</span>
                      <span>📍 {activeBooking.property_address || home.full_address}</span>
                    </p>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2 shrink-0">
                  <Link
                    href={`/listing/${activeBooking.listing_id || home.id}?start_agreement=true`}
                    className="flex items-center gap-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 text-xs font-bold transition-all shadow-md shadow-blue-600/20"
                  >
                    <Zap className="h-3.5 w-3.5 text-amber-300" />
                    <span>Proceed to Rent</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                  <button
                    type="button"
                    onClick={handleCancelInspection}
                    className="flex items-center gap-1 rounded-xl border border-rose-200 bg-rose-50 hover:bg-rose-100 text-rose-700 px-3.5 py-2.5 text-xs font-bold transition-colors cursor-pointer"
                    title="Cancel inspection walkthrough"
                  >
                    <X className="h-3.5 w-3.5" />
                    <span>Cancel Inspection</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTab("bookings")}
                    className="flex items-center gap-1 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 px-3.5 py-2.5 text-xs font-bold transition-colors cursor-pointer"
                  >
                    <span>View Pass Details</span>
                  </button>
                </div>
              </div>
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
                      Ready to secure {home.title} directly?
                    </h4>
                    <p className="text-xs text-slate-600 mt-0.5">
                      You don't need physical inspection to rent. You are protected with 24-hr Key-In-Door Escrow custody.
                    </p>
                  </div>
                </div>

                <Link
                  href={`/listing/${home.id}?start_agreement=true`}
                  className="flex items-center gap-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 text-xs font-bold transition-all shadow-md shadow-blue-600/20 shrink-0 cursor-pointer"
                >
                  <Zap className="h-3.5 w-3.5 text-amber-300" />
                  <span>Proceed to Rent</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            )}

            {/* Stat Row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-2xs">
                <div className="flex items-center justify-between text-slate-400 mb-2">
                  <span className="text-xs font-bold uppercase tracking-wider">Active Lease</span>
                  <Home className="h-4 w-4 text-blue-600" />
                </div>
                <p className="text-lg font-black text-slate-900 truncate">{home.title}</p>
                <span className="inline-flex items-center gap-1 mt-2 text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                  <CheckCircle2 className="h-3 w-3" />
                  <span>Valid through Sep 2027</span>
                </span>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-2xs">
                <div className="flex items-center justify-between text-slate-400 mb-2">
                  <span className="text-xs font-bold uppercase tracking-wider">Escrow Status</span>
                  <ShieldCheck className="h-4 w-4 text-emerald-600" />
                </div>
                <p className="text-lg font-black text-emerald-700">
                  {escrowFrozen ? "Frozen by Tenant" : keyConfirmed ? "Keys Released" : "24h Protected"}
                </p>
                <span className="inline-flex items-center gap-1 mt-2 text-[10px] font-bold text-blue-700 bg-blue-50 border border-blue-200 px-2 py-0.5 rounded-full">
                  <Lock className="h-3 w-3" />
                  <span>₦{Math.round(home.pricing.annual_rent * 0.75).toLocaleString("en-NG")} in custody</span>
                </span>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-2xs">
                <div className="flex items-center justify-between text-slate-400 mb-2">
                  <span className="text-xs font-bold uppercase tracking-wider">Caution Ringfenced</span>
                  <Lock className="h-4 w-4 text-amber-500" />
                </div>
                <p className="text-lg font-black text-slate-900">
                  ₦{home.pricing.caution_fee.toLocaleString("en-NG")} (10%)
                </p>
                <span className="inline-flex items-center gap-1 mt-2 text-[10px] font-bold text-amber-800 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full">
                  <span>Refundable at Exit</span>
                </span>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-2xs">
                <div className="flex items-center justify-between text-slate-400 mb-2">
                  <span className="text-xs font-bold uppercase tracking-wider">Inspection Policy</span>
                  <Clock className="h-4 w-4 text-slate-500" />
                </div>
                <p className="text-lg font-black text-slate-900">100% Optional</p>
                <span className="inline-flex items-center gap-1 mt-2 text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                  <CheckCircle2 className="h-3 w-3" />
                  <span>₦0 Inspection Fees</span>
                </span>
              </div>
            </div>

            {/* Current Residence Detail Card */}
            <div className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 shadow-xs space-y-6">
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
                    className="rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-4 py-2.5 text-xs shadow-md shadow-emerald-600/20 transition-all text-center flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <ShieldCheck className="h-4 w-4" />
                    <span>Manage Escrow Protection</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setActiveTab("agreements")}
                    className="rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-bold px-4 py-2.5 text-xs transition-colors text-center flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <FileText className="h-4 w-4" />
                    <span>View Agreement</span>
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
                      Licensed Property Manager
                    </span>
                    <strong className="text-slate-900 text-sm">{home.mandate.manager_name}</strong>
                    <Link
                      href="/dashboard/agent"
                      className="text-blue-600 hover:text-blue-700 font-bold flex items-center gap-1 mt-0.5"
                    >
                      <span>View Agent Profile</span>
                      <ArrowRight className="h-3 w-3" />
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: TENANCY AGREEMENTS */}
        {activeTab === "agreements" && (
          <div className="space-y-4">
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
          </div>
        )}

        {/* TAB 3: ESCROW & MOVE-IN PASS */}
        {activeTab === "escrow" && (
          <div className="space-y-6">
            {/* Escrow Guarantee Box */}
            <div className="rounded-3xl border border-emerald-200 bg-emerald-50/70 p-6 sm:p-8 space-y-4">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-start gap-3.5">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-600 text-white shadow-md shadow-emerald-600/25 flex-shrink-0">
                    <ShieldCheck className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="text-lg font-black text-slate-900">
                      Key-In-Door Move-In Escrow Protection
                    </h3>
                    <p className="text-xs text-slate-600 mt-1 max-w-xl leading-relaxed">
                      Your annual rent (₦{Math.round(home.pricing.annual_rent * 0.75).toLocaleString("en-NG")}) is locked safely in Settlla Escrow custody until you collect keys and inspect the apartment. You hold unilateral 24-hour dispute power to freeze funds.
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {!keyConfirmed && !escrowFrozen && (
                    <button
                      type="button"
                      onClick={handleConfirmKeyHandover}
                      className="rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-4 py-2.5 text-xs shadow-md shadow-emerald-600/20 transition-all cursor-pointer flex items-center gap-1.5"
                    >
                      <Key className="h-3.5 w-3.5" />
                      <span>Confirm Key Handover</span>
                    </button>
                  )}

                  {!escrowFrozen && (
                    <button
                      type="button"
                      onClick={handleFreezeEscrow}
                      className="rounded-xl border border-rose-300 bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold px-4 py-2.5 text-xs transition-colors cursor-pointer flex items-center gap-1.5"
                    >
                      <ShieldAlert className="h-3.5 w-3.5" />
                      <span>Freeze Escrow (24h Dispute)</span>
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
                <div className="space-y-4 animate-fade-in">
                  <div className="rounded-2xl border border-emerald-300 bg-emerald-100/80 p-4 text-xs text-emerald-900 flex items-start gap-3">
                    <CheckCircle2 className="h-5 w-5 text-emerald-700 flex-shrink-0 mt-0.5" />
                    <div>
                      <strong className="text-sm font-bold block mb-0.5">Key Handover Confirmed!</strong>
                      <span>Thank you for verifying your keys! Your tenancy is active and caution fee remains ringfenced.</span>
                    </div>
                  </div>

                  {/* Real-time Tenancy Stay Countdown */}
                  <div className="rounded-2xl border border-emerald-300 bg-gradient-to-br from-emerald-500/10 via-white to-emerald-50/50 p-5 sm:p-6 shadow-sm">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-4 border-b border-emerald-100">
                      <div>
                        <span className="text-[10px] font-black uppercase tracking-wider text-emerald-800 bg-emerald-100 px-2.5 py-0.5 rounded-full">
                          ● Tenancy Active • Live Stay Countdown
                        </span>
                        <h4 className="text-base font-bold text-slate-900 mt-1">
                          12-Month Tenancy Stay Countdown
                        </h4>
                        <p className="text-xs text-slate-500">
                          {home.title} • Valid through September 2027
                        </p>
                      </div>
                      <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700 bg-white border border-emerald-200 px-3 py-1.5 rounded-xl shadow-2xs">
                        <Timer className="h-3.5 w-3.5 text-emerald-600" />
                        <span>Lease in Good Standing</span>
                      </span>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4">
                      <div className="rounded-xl bg-white border border-emerald-200/80 p-3 text-center shadow-2xs">
                        <span className="text-2xl sm:text-3xl font-black text-slate-900 font-mono block">
                          {stayTimeRemaining.days}
                        </span>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mt-0.5 block">
                          Days Left
                        </span>
                      </div>
                      <div className="rounded-xl bg-white border border-emerald-200/80 p-3 text-center shadow-2xs">
                        <span className="text-2xl sm:text-3xl font-black text-slate-900 font-mono block">
                          {String(stayTimeRemaining.hours).padStart(2, "0")}
                        </span>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mt-0.5 block">
                          Hours
                        </span>
                      </div>
                      <div className="rounded-xl bg-white border border-emerald-200/80 p-3 text-center shadow-2xs">
                        <span className="text-2xl sm:text-3xl font-black text-slate-900 font-mono block">
                          {String(stayTimeRemaining.minutes).padStart(2, "0")}
                        </span>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mt-0.5 block">
                          Minutes
                        </span>
                      </div>
                      <div className="rounded-xl bg-white border border-emerald-200/80 p-3 text-center shadow-2xs">
                        <span className="text-2xl sm:text-3xl font-black text-emerald-600 font-mono block animate-pulse">
                          {String(stayTimeRemaining.seconds).padStart(2, "0")}
                        </span>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 mt-0.5 block">
                          Seconds
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Move-In Pass Voucher */}
            <div className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-6">
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
                    <h4 className="text-base font-bold text-slate-900 mt-1">{activeBooking?.property_title || home.title}</h4>
                    <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                      <MapPin className="h-3.5 w-3.5 text-slate-400" />
                      <span>{activeBooking?.property_address || home.full_address}</span>
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
                    <span className="font-bold text-slate-800">{activeBooking?.manager_name || home.mandate.manager_name}</span>
                    <span className="text-slate-500 text-[11px] block">{activeBooking?.manager_accreditation || home.mandate.accreditation}</span>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    <Link
                      href={`/listing/${activeBooking?.listing_id || home.id}?start_agreement=true`}
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
                    href={`/listing/${home.id}?start_agreement=true`}
                    className="inline-flex items-center gap-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 text-xs font-bold transition-all shadow-md shadow-blue-600/20"
                  >
                    <Zap className="h-3.5 w-3.5 text-amber-300" />
                    <span>Proceed to Rent ({home.title})</span>
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
          </div>
        )}
      </main>

      {/* Simple Footer */}
      <footer className="border-t border-slate-200 bg-white px-4 py-4 text-center text-xs text-slate-500 mt-12 mb-8 lg:mb-0">
        Settlla Kaduna Hub • Statutory Transparency, ₦0 Inspection Fee &amp; Move-In Escrow
      </footer>

      {/* Mobile Bottom Navigation Bar */}
      <nav
        aria-label="Tenant Mobile Navigation"
        className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200 shadow-lg px-4 py-2 pb-safe"
      >
        <div className="flex items-center justify-around max-w-md mx-auto">
          <Link
            href="/"
            className="flex flex-col items-center justify-center py-1 text-slate-500 hover:text-slate-800 transition-colors"
          >
            <Home className="h-5 w-5" />
            <span className="text-[10px] font-medium mt-0.5">Explore Feed</span>
          </Link>
          <div className="flex flex-col items-center justify-center py-1 text-blue-600 font-bold">
            <User className="h-5 w-5" />
            <span className="text-[10px] font-bold mt-0.5">My Tenancy</span>
          </div>
          <button
            type="button"
            onClick={() => switchRole("agent")}
            className="flex flex-col items-center justify-center py-1 text-slate-500 hover:text-slate-800 transition-colors cursor-pointer"
          >
            <Building2 className="h-5 w-5" />
            <span className="text-[10px] font-medium mt-0.5">Agent View</span>
          </button>
          <button
            type="button"
            onClick={() => signOut()}
            className="flex flex-col items-center justify-center py-1 text-rose-500 hover:text-rose-700 transition-colors cursor-pointer"
          >
            <LogOut className="h-5 w-5" />
            <span className="text-[10px] font-medium mt-0.5">Sign Out</span>
          </button>
        </div>
      </nav>
    </div>
  );
}
