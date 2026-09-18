"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { Listing } from "@/types/listing";
import { DaySchedule, TimeSlot, InspectionBookingResponse } from "@/types/booking";
import { fetchListingVisitSlots, createInspectionBooking } from "@/lib/settlla/bookings";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { ConfirmEmailPanel } from "@/components/ConfirmEmailPanel";
import {
  assertPassword,
  formatSupabaseAuthError,
  isEmailNotConfirmedError,
  MIN_PASSWORD_LENGTH,
} from "@/lib/settlla/authErrors";
import { savePendingAuthFlow } from "@/lib/settlla/pendingAuthFlow";
import {
  Check,
  CheckCircle2,
  X,
  Lightbulb,
  Calendar,
  Clock,
  MapPin,
  AlertCircle,
  MessageSquare,
  ShieldCheck,
  FileText,
  ArrowRight,
  ArrowLeft,
  Zap,
  UserCheck,
  Lock,
  Mail,
  Phone,
  User,
} from "lucide-react";

export type BookingDrawerCloseReason = "dismiss" | "complete";

export interface BookingDrawerProps {
  isOpen: boolean;
  onClose: (reason?: BookingDrawerCloseReason) => void;
  listing: Listing;
  onProceedToAgreement?: (
    listing: Listing,
    tenantProfile: {
      fullName: string;
      phoneNumber: string;
      emailAddress: string;
      relocationContext: string;
    }
  ) => void;
}

export const BookingDrawer: React.FC<BookingDrawerProps> = ({
  isOpen,
  onClose,
  listing,
  onProceedToAgreement,
}) => {
  // Step state: 1 = Slot Picker, 2 = Tenant Details, 3 = Confirmation Pass
  const [step, setStep] = useState<1 | 2 | 3>(1);

  // Schedule data
  const [schedules, setSchedules] = useState<DaySchedule[]>([]);
  const [loadingSchedule, setLoadingSchedule] = useState(true);

  // Selected state
  const [selectedDayIdx, setSelectedDayIdx] = useState(0);
  const [selectedSlot, setSelectedSlot] = useState<TimeSlot | null>(null);

  // Form inputs
  const [tenantName, setTenantName] = useState("");
  const [tenantPhone, setTenantPhone] = useState("");
  const [tenantEmail, setTenantEmail] = useState("");
  const [relocationContext, setRelocationContext] = useState("NYSC Corps Member (GTBank Barnawa)");
  const [agreedAntiScam, setAgreedAntiScam] = useState(true);

  // Submission state
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [confirmedBooking, setConfirmedBooking] = useState<InspectionBookingResponse | null>(null);

  // Authentication prompt state for post-booking login/signup
  const { currentUser, isAuthenticated, signIn, signUp } = useAuth();
  const router = useRouter();
  const [showAuthPrompt, setShowAuthPrompt] = useState(false);
  const [authMode, setAuthMode] = useState<"signup" | "signin">("signup");
  const [authName, setAuthName] = useState("");
  const [authPhone, setAuthPhone] = useState("");
  const [authEmail, setAuthEmail] = useState("");
  const [authPassword, setAuthPassword] = useState("");
  const [authError, setAuthError] = useState<string | null>(null);
  const [authLoading, setAuthLoading] = useState(false);
  const [pendingConfirmEmail, setPendingConfirmEmail] = useState<string | null>(null);

  // Helper to persist booking to local storage and bind with current rental state
  const saveBookingToStorage = (booking: InspectionBookingResponse) => {
    try {
      localStorage.setItem("settlla_tenant_booking", JSON.stringify(booking));
      localStorage.setItem("settlla_last_booking_listing", JSON.stringify(listing));
      const currentRentalRaw = localStorage.getItem("settlla_current_rental");
      let currentRentalObj = currentRentalRaw ? JSON.parse(currentRentalRaw) : {};
      currentRentalObj.listing = listing;
      currentRentalObj.booking = booking;
      localStorage.setItem("settlla_current_rental", JSON.stringify(currentRentalObj));
    } catch (e) {
      console.error("Failed to save booking to storage", e);
    }
  };

  // Pre-fill tenant details if already logged in
  useEffect(() => {
    if (currentUser) {
      if (!tenantName && currentUser.fullName) setTenantName(currentUser.fullName);
      if (!tenantPhone && currentUser.phoneNumber) setTenantPhone(currentUser.phoneNumber);
      if (!tenantEmail && currentUser.email) setTenantEmail(currentUser.email);
    }
  }, [currentUser]);

  // Reset or initialize when drawer opens
  useEffect(() => {
    if (!isOpen) {
      document.body.style.overflow = "auto";
      return;
    }

    document.body.style.overflow = "hidden";
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose("dismiss");
    };
    window.addEventListener("keydown", handleKeyDown);

    setStep(1);
    setSelectedSlot(null);
    setSubmitError(null);
    setConfirmedBooking(null);

    async function loadSchedule() {
      setLoadingSchedule(true);
      try {
        const days = await fetchListingVisitSlots(listing);
        setSchedules(days);
        setSelectedDayIdx(0);
      } catch {
        setSchedules([]);
      } finally {
        setLoadingSchedule(false);
      }
    }

    loadSchedule();

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "auto";
    };
  }, [isOpen, listing, onClose]);

  // Client-side fallback generator matching backend logic
  function generateClientSchedule(item: Listing): DaySchedule[] {
    const baseDate = new Date(2026, 8, 16); // Sep 16, 2026
    const dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    const results: DaySchedule[] = [];

    // Parse local storage for previously locked slots
    let lockedIds: string[] = [];
    try {
      const stored = localStorage.getItem(`settlla_locked_${item.id}`);
      if (stored) lockedIds = JSON.parse(stored);
    } catch {}

    for (let dayOffset = 1; dayOffset <= 14; dayOffset++) {
      const d = new Date(baseDate);
      d.setDate(baseDate.getDate() + dayOffset);
      const weekdayName = dayNames[d.getDay()];

      for (const w of item.visiting_windows) {
        const match = w.day.toLowerCase().includes(weekdayName.toLowerCase());
        if (match) {
          const hoursNorm = w.hours.replace(/—|-/g, "–");
          const parts = hoursNorm.split("–").map((p) => p.trim());
          if (parts.length === 2) {
            const startMins = parseTimeToMins(parts[0]);
            const endMins = parseTimeToMins(parts[1]);

            const slots: TimeSlot[] = [];
            let curr = startMins;
            while (curr + 30 <= endMins) {
              const sLabel = formatMinsToTime(curr);
              const eLabel = formatMinsToTime(curr + 30);
              const timeLabel = `${sLabel} - ${eLabel}`;
              const slotId = `${item.id}_${d.toISOString().slice(0, 10)}_${curr}`;
              const isLocked = lockedIds.includes(slotId);

              slots.push({
                slot_id: slotId,
                time_label: timeLabel,
                start_time: sLabel,
                end_time: eLabel,
                is_available: !isLocked,
                is_locked: isLocked,
              });
              curr += 30;
            }

            const dateStr = d.toISOString().slice(0, 10);
            const formatted = d.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric", year: "numeric" });

            results.push({
              date_str: dateStr,
              day_of_week: weekdayName,
              formatted_date: formatted,
              visiting_hours: w.hours,
              slots,
            });
          }
        }
      }
    }
    return results;
  }

  function parseTimeToMins(str: string): number {
    const parts = str.trim().toUpperCase().split(" ");
    if (parts.length !== 2) return 0;
    const [t, mer] = parts;
    const [h, m] = t.split(":").map(Number);
    let hrs = h;
    if (mer === "PM" && hrs !== 12) hrs += 12;
    if (mer === "AM" && hrs === 12) hrs = 0;
    return hrs * 60 + (m || 0);
  }

  function formatMinsToTime(mins: number): string {
    const h = Math.floor(mins / 60) % 24;
    const m = mins % 60;
    const mer = h < 12 ? "AM" : "PM";
    const dh = h % 12 === 0 ? 12 : h % 12;
    return `${dh}:${m.toString().padStart(2, "0")} ${mer}`;
  }

  // Handle slot booking submission
  async function handleConfirmBooking(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedSlot || !selectedDay) return;

    if (!tenantName.trim() || !tenantPhone.trim()) {
      setSubmitError("Please provide your full legal name and WhatsApp phone number.");
      return;
    }

    setSubmitting(true);
    setSubmitError(null);

    const payload = {
      listing_id: listing.id,
      date_str: selectedDay.date_str,
      slot_time: selectedSlot.time_label,
      tenant_name: tenantName.trim(),
      tenant_phone: tenantPhone.trim(),
      tenant_email: tenantEmail.trim() || "tenant@settlla.ng",
      relocation_context: relocationContext,
    };

    try {
      const data = await createInspectionBooking(
        listing,
        payload,
        selectedSlot.slot_id,
        selectedDay.formatted_date
      );
      setConfirmedBooking(data);
      saveBookingToStorage(data);
      lockSlotLocally(selectedSlot.slot_id);
      setStep(3);
    } catch {
      setSubmitError("Could not confirm this walkthrough slot. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  function lockSlotLocally(slotId: string) {
    try {
      const key = `settlla_locked_${listing.id}`;
      const existing = JSON.parse(localStorage.getItem(key) || "[]");
      if (!existing.includes(slotId)) {
        existing.push(slotId);
        localStorage.setItem(key, JSON.stringify(existing));
      }
      // Update local state
      setSchedules((prev) =>
        prev.map((day) => ({
          ...day,
          slots: day.slots.map((s) => (s.slot_id === slotId ? { ...s, is_available: false, is_locked: true } : s)),
        }))
      );
    } catch {}
  }

  function handleDone() {
    if (confirmedBooking) {
      saveBookingToStorage(confirmedBooking);
    }

    if (isAuthenticated) {
      onClose("complete");
      router.push("/dashboard/tenant");
    } else {
      setAuthName(confirmedBooking?.tenant_name || tenantName);
      setAuthPhone(confirmedBooking?.tenant_phone || tenantPhone);
      setAuthEmail(confirmedBooking?.tenant_email || tenantEmail);
      setAuthPassword("");
      setAuthError(null);
      setAuthMode("signup");
      setShowAuthPrompt(true);
    }
  }

  async function handleAuthSubmit(e: React.FormEvent) {
    e.preventDefault();
    setAuthError(null);
    setAuthLoading(true);

    const supabaseMode = isSupabaseConfigured();

    try {
      if (authMode === "signup") {
        if (!authName.trim() || !authPhone.trim() || !authEmail.trim()) {
          setAuthError("Please provide your full legal name, phone number, and email.");
          setAuthLoading(false);
          return;
        }

        try {
          assertPassword(authPassword, supabaseMode);
        } catch (err) {
          setAuthError(formatSupabaseAuthError(err));
          setAuthLoading(false);
          return;
        }

        const result = await signUp({
          role: "tenant",
          fullName: authName.trim(),
          phoneNumber: authPhone.trim(),
          email: authEmail.trim(),
          password: authPassword.trim(),
          relocationContext,
        });

        if (result.needsEmailConfirmation) {
          if (confirmedBooking) saveBookingToStorage(confirmedBooking);
          savePendingAuthFlow({
            type: "booking",
            listingId: listing.id,
            listing,
            booking: confirmedBooking,
            email: authEmail.trim(),
            returnPath: "/dashboard/tenant",
            savedAt: Date.now(),
          });
          setPendingConfirmEmail(authEmail.trim());
          setAuthLoading(false);
          return;
        }
      } else {
        if (!authEmail.trim()) {
          setAuthError("Please enter your email address.");
          setAuthLoading(false);
          return;
        }

        try {
          assertPassword(authPassword, supabaseMode);
        } catch (err) {
          setAuthError(formatSupabaseAuthError(err));
          setAuthLoading(false);
          return;
        }

        await signIn(authEmail.trim(), "tenant", authPassword.trim());
      }

      if (confirmedBooking) {
        saveBookingToStorage(confirmedBooking);
      }

      setShowAuthPrompt(false);
      onClose("complete");
      router.push("/dashboard/tenant");
    } catch (err: unknown) {
      if (isEmailNotConfirmedError(err)) {
        if (confirmedBooking) saveBookingToStorage(confirmedBooking);
        savePendingAuthFlow({
          type: "booking",
          listingId: listing.id,
          listing,
          booking: confirmedBooking,
          email: authEmail.trim(),
          returnPath: "/dashboard/tenant",
          savedAt: Date.now(),
        });
        setPendingConfirmEmail(authEmail.trim());
        setAuthError(null);
      } else {
        setAuthError(formatSupabaseAuthError(err));
      }
    } finally {
      setAuthLoading(false);
    }
  }

  function handleSkipAuth() {
    setShowAuthPrompt(false);
    onClose("complete");
  }

  if (!isOpen) return null;

  const selectedDay = schedules[selectedDayIdx];
  const totalOpenSlots = selectedDay ? selectedDay.slots.filter((s) => s.is_available).length : 0;

  return (
    <div className="settlla-overlay settlla-overlay--drawer">
      {/* Soft Backdrop matching landing theme */}
      <div
        className="fixed inset-0 bg-slate-950/40 backdrop-blur-xs transition-opacity animate-fade-in"
        onClick={() => onClose("dismiss")}
      />

      {/* Drawer Container — Crisp Landing Page Palette (White / Slate / Royal Blue) */}
      <div className="settlla-drawer text-slate-900">
        {/* Top Header */}
        <div className="flex items-center justify-between border-b border-slate-100 px-4 sm:px-6 py-3.5 sm:py-4 bg-white/95 backdrop-blur-md sticky top-0 z-20">
          <div className="min-w-0 pr-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-0.5 text-[11px] font-bold text-emerald-700 border border-emerald-200/80">
                <Check className="h-3 w-3 text-emerald-600" /> Mandate Verified
              </span>
              <span className="text-[11px] font-bold text-blue-600 bg-blue-50 px-2.5 py-0.5 rounded-full border border-blue-100">
                ₦0 Inspection Fee
              </span>
            </div>
            <h2 className="mt-1 text-base sm:text-lg font-bold text-slate-900 leading-tight">
              {step === 1 && "Select 30-Minute Walkthrough Slot"}
              {step === 2 && "Tenant Walkthrough Registration"}
              {step === 3 && "Verified Physical Inspection Pass"}
            </h2>
          </div>

          <button
            onClick={() => onClose("dismiss")}
            className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-100 text-slate-500 hover:bg-slate-200 hover:text-slate-800 transition-colors"
            title="Close Drawer"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Step Indicator Row */}
        <div className="flex border-b border-slate-100 bg-slate-50/70 px-4 sm:px-6 py-2.5 text-xs font-semibold overflow-x-auto no-scrollbar whitespace-nowrap">
          <div className={`flex items-center gap-1.5 ${step >= 1 ? "text-blue-600" : "text-slate-400"}`}>
            <span className={`flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-bold ${step >= 1 ? "bg-blue-600 text-white" : "bg-slate-200 text-slate-600"}`}>1</span>
            <span>Slot Picker</span>
          </div>
          <span className="mx-3 text-slate-300">/</span>
          <div className={`flex items-center gap-1.5 ${step >= 2 ? "text-blue-600" : "text-slate-400"}`}>
            <span className={`flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-bold ${step >= 2 ? "bg-blue-600 text-white" : "bg-slate-200 text-slate-600"}`}>2</span>
            <span>Verification</span>
          </div>
          <span className="mx-3 text-slate-300">/</span>
          <div className={`flex items-center gap-1.5 ${step === 3 ? "text-emerald-700" : "text-slate-400"}`}>
            <span className={`flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-bold ${step === 3 ? "bg-emerald-600 text-white" : "bg-slate-200 text-slate-600"}`}>3</span>
            <span>Digital Pass</span>
          </div>
        </div>

        {/* Property Summary Mini Card */}
        <div className="px-4 sm:px-6 py-3 bg-white border-b border-slate-100 flex items-center gap-3">
          <div className="relative h-12 w-12 flex-shrink-0 overflow-hidden rounded-xl border border-slate-200">
            <Image
              src={listing.images[0] || "/images/living_room.jpg"}
              alt={listing.title}
              fill
              className="object-cover"
            />
          </div>
          <div className="min-w-0 flex-1">
            <h4 className="text-xs font-bold text-slate-900 truncate">{listing.title}</h4>
            <p className="text-[11px] text-slate-500 truncate">{listing.full_address}</p>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="text-[11px] font-bold text-blue-600">
                ₦{listing.pricing.total_move_in_cost.toLocaleString("en-NG")} total
              </span>
              <span className="text-slate-300">•</span>
              <span className="text-[10px] text-slate-500 truncate">Host: {listing.mandate.manager_name}</span>
            </div>
          </div>
        </div>

        {/* Scrollable Drawer Body */}
        <div className="min-h-0 flex-1 overflow-y-auto px-4 sm:px-6 py-4 sm:py-5 space-y-6">
          {/* STEP 1: DATE SELECTION & 30-MINUTE SLOTS */}
          {step === 1 && (
            <div>
              {loadingSchedule ? (
                <div className="py-16 text-center">
                  <div className="mx-auto h-8 w-8 animate-spin rounded-full border-3 border-blue-600 border-t-transparent"></div>
                  <p className="mt-3 text-xs text-slate-500 font-medium">Checking manager visiting schedule...</p>
                </div>
              ) : schedules.length === 0 ? (
                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-6 text-center">
                  <p className="text-xs text-slate-500">No open visiting windows found for this listing.</p>
                </div>
              ) : (
                <div className="space-y-5">
                  {/* Optional Inspection Notice & Skip Button */}
                  <div className="rounded-2xl bg-blue-50/70 border border-blue-200 p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs text-slate-700">
                    <div className="flex items-start gap-2.5">
                      <Lightbulb className="h-4 w-4 text-blue-600 shrink-0 mt-0.5" />
                      <div>
                        <strong className="text-slate-900 block">Inspecting is 100% Optional:</strong>
                        <span>You can skip the walkthrough and proceed directly to your digital tenancy agreement.</span>
                      </div>
                    </div>
                    {onProceedToAgreement && (
                      <button
                        type="button"
                        onClick={() => {
                          onProceedToAgreement(listing, {
                            fullName: tenantName.trim(),
                            phoneNumber: tenantPhone.trim(),
                            emailAddress: tenantEmail.trim(),
                            relocationContext,
                          });
                        }}
                        className="flex items-center gap-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold px-3.5 py-2 text-xs transition-all shadow-xs cursor-pointer whitespace-nowrap"
                      >
                        <Zap className="h-3.5 w-3.5 text-amber-300" />
                        <span>Skip &amp; Rent Directly</span>
                      </button>
                    )}
                  </div>

                    {/* Date Selection Pills */}
                    <div>
                      <label className="text-xs font-bold text-slate-900 uppercase tracking-wider block mb-2.5">
                        1. Choose Date (Next 14 Days)
                      </label>
                      <div className="flex gap-2.5 overflow-x-auto pb-2 no-scrollbar">
                      {schedules.map((day, idx) => {
                        const isSelected = idx === selectedDayIdx;
                        const dateParts = day.formatted_date.split(",");
                        const monthDay = dateParts[1] ? dateParts[1].trim() : day.date_str;

                        return (
                          <button
                            key={idx}
                            type="button"
                            onClick={() => {
                              setSelectedDayIdx(idx);
                              setSelectedSlot(null);
                            }}
                            className={`flex flex-col items-center justify-center rounded-2xl px-4 py-2.5 border text-xs transition-all flex-shrink-0 min-w-[110px] cursor-pointer ${
                              isSelected
                                ? "border-blue-600 bg-blue-600 text-white shadow-md shadow-blue-500/25"
                                : "border-slate-200 bg-white text-slate-700 hover:border-blue-300 hover:bg-slate-50"
                            }`}
                          >
                            <span className={`text-[11px] font-bold ${isSelected ? "text-blue-100" : "text-slate-500"}`}>
                              {day.day_of_week}
                            </span>
                            <span className="text-sm font-black my-0.5">{monthDay}</span>
                            <span className={`text-[10px] ${isSelected ? "text-blue-100" : "text-slate-400"}`}>
                              {day.visiting_hours.split("–")[0].trim()}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* 30-Minute Slots Grid */}
                  <div>
                    <div className="flex items-center justify-between mb-2.5">
                      <label className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                        2. Choose 30-Min Walkthrough Slot
                      </label>
                      <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2.5 py-0.5 rounded-full border border-blue-100">
                        {totalOpenSlots} open slots
                      </span>
                    </div>

                    {selectedDay && selectedDay.slots.length > 0 ? (
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                        {selectedDay.slots.map((slot) => {
                          const isSelected = selectedSlot?.slot_id === slot.slot_id;
                          const isLocked = slot.is_locked;

                          let btnClasses = "rounded-xl border p-3 text-left transition-all relative flex flex-col justify-between ";
                          if (isLocked) {
                            btnClasses += "bg-slate-100 border-slate-200 text-slate-400 cursor-not-allowed opacity-75";
                          } else if (isSelected) {
                            btnClasses += "bg-blue-600 border-blue-600 text-white shadow-md shadow-blue-500/25 cursor-pointer ring-2 ring-blue-600";
                          } else {
                            btnClasses += "bg-white border-slate-200 hover:border-blue-400 hover:bg-blue-50/40 text-slate-800 cursor-pointer shadow-2xs";
                          }

                          return (
                            <button
                              key={slot.slot_id}
                              type="button"
                              disabled={isLocked}
                              onClick={() => setSelectedSlot(slot)}
                              className={btnClasses}
                            >
                              <div className="flex items-center justify-between">
                                <span className={`text-xs font-bold ${isSelected ? "text-white" : isLocked ? "text-slate-400 line-through" : "text-slate-900"}`}>
                                  {slot.time_label}
                                </span>
                              </div>
                              <div className="mt-2 flex items-center justify-between">
                                <span className={`text-[10px] font-semibold ${isSelected ? "text-blue-100" : isLocked ? "text-slate-400" : "text-blue-600"}`}>
                                  {isLocked ? "Taken / Locked" : isSelected ? "Selected" : "Open • ₦0"}
                                </span>
                                {isSelected && <Check className="h-3 w-3 text-white" />}
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    ) : (
                      <p className="text-xs text-slate-500">No slots available for this day.</p>
                    )}
                  </div>

                  {/* Selected Slot Recap */}
                  {selectedSlot && selectedDay && (
                    <div className="rounded-2xl border border-blue-200 bg-blue-50/70 p-4 animate-fade-in">
                      <div className="flex items-start justify-between">
                        <div>
                          <span className="text-[10px] uppercase font-bold text-blue-700 tracking-wider">
                            Selected Appointment
                          </span>
                          <h4 className="flex items-center gap-1.5 text-sm font-black text-slate-900 mt-0.5">
                            <Calendar className="h-4 w-4 text-blue-600 shrink-0" />
                            <span>{selectedDay.formatted_date} at {selectedSlot.time_label}</span>
                          </h4>
                          <p className="flex items-center gap-1 text-xs text-slate-600 mt-1">
                            <MapPin className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                            <span>{listing.full_address} (Host: {listing.mandate.manager_name})</span>
                          </p>
                        </div>
                        <span className="rounded-full bg-emerald-600 text-white text-[11px] font-bold px-2.5 py-1">
                          ₦0 Total Fee
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* STEP 2: TENANT REGISTRATION & ANTI-SCAM PLEDGE */}
          {step === 2 && (
            <form onSubmit={handleConfirmBooking} className="space-y-4">
              <div className="rounded-2xl bg-blue-50/60 border border-blue-100 p-3.5 text-xs text-slate-700">
                <div className="font-bold text-slate-900 mb-1">
                  Reserving: {selectedDay?.formatted_date} • {selectedSlot?.time_label}
                </div>
                <p className="text-slate-600">
                  Please provide your contact information to receive your digital gate pass and meeting instructions.
                </p>
              </div>

              {submitError && (
                <div className="flex items-center gap-2 rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs text-rose-800 font-semibold">
                  <AlertCircle className="h-4 w-4 text-rose-600 shrink-0" />
                  <span>{submitError}</span>
                </div>
              )}

              {/* Full Name */}
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1.5">
                  Full Legal Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Amina Bello"
                  value={tenantName}
                  onChange={(e) => setTenantName(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
                />
              </div>

              {/* WhatsApp Phone */}
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1.5">
                  WhatsApp Phone Number <span className="text-rose-500">*</span>
                </label>
                <input
                  type="tel"
                  required
                  placeholder="e.g. 0803 123 4567"
                  value={tenantPhone}
                  onChange={(e) => setTenantPhone(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
                />
                <span className="text-[10px] text-slate-500 mt-1 block">
                  Used for SMS pass delivery and meeting gate clearance.
                </span>
              </div>

              {/* Email */}
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1.5">
                  Email Address <span className="text-slate-400">(for legal copy)</span>
                </label>
                <input
                  type="email"
                  placeholder="e.g. user@example.com"
                  value={tenantEmail}
                  onChange={(e) => setTenantEmail(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
                />
              </div>

              {/* Relocation Context */}
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1.5">
                  Relocation Context / Occupation
                </label>
                <select
                  value={relocationContext}
                  onChange={(e) => setRelocationContext(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs text-slate-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
                >
                  <option value="NYSC Corps Member (GTBank Barnawa)">NYSC Corps Member (GTBank Barnawa)</option>
                  <option value="Corporate / Bank Transferee">Corporate / Bank Transferee</option>
                  <option value="Remote Tech Worker / Professional">Remote Tech Worker / Professional</option>
                  <option value="Relocating Family">Relocating Family</option>
                  <option value="Other Incoming Professional">Other Incoming Professional</option>
                </select>
              </div>

              {/* Anti-Scam Zero-Fee Pledge */}
              <div className="rounded-2xl border border-amber-200 bg-amber-50/70 p-3.5">
                <label className="flex items-start gap-2.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={agreedAntiScam}
                    onChange={(e) => setAgreedAntiScam(e.target.checked)}
                    className="mt-0.5 h-4 w-4 rounded border-amber-300 bg-white text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-xs text-amber-900 leading-snug">
                    I understand Settlla walkthroughs are <strong>100% free (₦0)</strong>. I will not pay any cash or inspection fee to roadside agents at the gate.
                  </span>
                </label>
              </div>

              {/* Action Buttons */}
              <div className="pt-2 flex items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="flex items-center gap-1.5 rounded-xl border border-slate-200 px-4 py-2.5 text-xs font-semibold text-slate-600 hover:bg-slate-50 transition-colors"
                >
                  <ArrowLeft className="h-3.5 w-3.5 text-slate-500" />
                  <span>Back to Slots</span>
                </button>
                <button
                  type="submit"
                  disabled={submitting || !agreedAntiScam}
                  className="flex-1 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-50 px-5 py-2.5 text-xs sm:text-sm font-bold text-white transition-all shadow-md shadow-blue-500/25"
                >
                  {submitting ? "Locking Slot at ₦0..." : "Confirm Inspection — ₦0"}
                </button>
              </div>
            </form>
          )}

          {/* STEP 3: DIGITAL INSPECTION PASS VOUCHER */}
          {step === 3 && confirmedBooking && (
            <div className="space-y-5 animate-fade-in">
              {/* Success Badge */}
              <div className="rounded-2xl border border-emerald-200 bg-emerald-50/80 p-5 text-center">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100 text-emerald-700 mb-2">
                  <CheckCircle2 className="h-7 w-7 text-emerald-600" />
                </div>
                <h3 className="text-lg font-bold text-slate-900">Physical Tour Slot Locked!</h3>
                <p className="text-xs text-emerald-800 mt-1">
                  Zero roadside fee charged. <strong>₦0 total cost.</strong>
                </p>
                <div className="mt-3 inline-block rounded-xl bg-white px-4 py-1.5 border border-emerald-200 shadow-xs">
                  <span className="text-[10px] text-slate-500 uppercase tracking-wider block">Booking Reference</span>
                  <span className="text-base font-black text-emerald-700 tracking-wider">
                    {confirmedBooking.booking_id}
                  </span>
                </div>
              </div>

              {/* Verified Pass Card */}
              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-md space-y-3.5 text-xs">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase font-bold">Tenant</span>
                    <p className="font-bold text-slate-900 text-sm">{confirmedBooking.tenant_name}</p>
                    <p className="text-slate-500 text-[11px]">{confirmedBooking.tenant_phone}</p>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] text-slate-400 uppercase font-bold">Walkthrough Time</span>
                    <p className="font-bold text-blue-600 text-sm">{confirmedBooking.slot_time}</p>
                    <p className="text-slate-600 text-[11px]">{confirmedBooking.formatted_date}</p>
                  </div>
                </div>

                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-bold block mb-1">Meeting &amp; Inspection Address</span>
                  <p className="font-semibold text-slate-900">{confirmedBooking.property_address}</p>
                  <p className="text-slate-500 text-[11px] mt-0.5">{confirmedBooking.directions}</p>
                </div>

                <div className="border-t border-slate-100 pt-3 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase font-bold block">Host / Property Manager</span>
                    <p className="font-bold text-slate-900">{confirmedBooking.manager_name}</p>
                    <p className="text-slate-500 text-[11px]">{confirmedBooking.manager_accreditation}</p>
                  </div>
                  <Link
                    href="/dashboard/agent"
                    onClick={() => onClose("dismiss")}
                    className="rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 px-3 py-1.5 font-bold text-xs flex items-center gap-1.5 transition-colors shadow-2xs"
                  >
                    <UserCheck className="h-3.5 w-3.5 text-blue-600" />
                    <span>View Agent Profile</span>
                  </Link>
                </div>
              </div>

              {/* Anti-Scam Security Footer Box */}
              <div className="rounded-xl border border-blue-100 bg-blue-50/50 p-3.5 text-xs text-slate-700">
                <div className="flex items-center gap-1.5 font-bold text-slate-900 mb-0.5">
                  <ShieldCheck className="h-4 w-4 text-blue-600 shrink-0" />
                  <span>Anti-Scam Scam-Free Guarantee:</span>
                </div>
                Present this digital reference at the gate. If any roadside agent demands an inspection fee, report immediately to Settlla Concierge.
              </div>

              {/* Forward Feature #3 Hand-off Button */}
              <div className="pt-2 flex flex-col sm:flex-row items-center gap-2.5">
                <button
                  type="button"
                  onClick={() => {
                    if (onProceedToAgreement) {
                      onProceedToAgreement(listing, {
                        fullName: confirmedBooking.tenant_name,
                        phoneNumber: confirmedBooking.tenant_phone,
                        emailAddress: confirmedBooking.tenant_email,
                        relocationContext,
                      });
                    }
                  }}
                  className="w-full rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 text-xs sm:text-sm transition-all shadow-md shadow-blue-500/25 flex items-center justify-center gap-2 cursor-pointer"
                >
                  <FileText className="h-4 w-4" />
                  <span>Proceed to Tenancy Agreement</span>
                  <ArrowRight className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={handleDone}
                  className="w-full sm:w-auto rounded-xl border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 font-bold px-5 py-3 text-xs transition-colors cursor-pointer shadow-xs"
                >
                  Done
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Bottom Footer Action for Step 1 */}
        {step === 1 && (
          <div className="border-t border-slate-100 p-4 bg-white/95 backdrop-blur-md flex items-center justify-between gap-3 sticky bottom-0 z-20">
            <div className="text-xs">
              <span className="text-slate-500 block text-[10px] uppercase font-bold">Inspection Fee</span>
              <span className="text-sm font-black text-blue-600">₦0 Guaranteed</span>
            </div>
            <button
              type="button"
              disabled={!selectedSlot}
              onClick={() => setStep(2)}
              className="flex items-center gap-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed px-6 py-2.5 text-xs sm:text-sm font-bold text-white transition-all shadow-md shadow-blue-500/25 cursor-pointer"
            >
              <span>Proceed to Details</span>
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        )}
      </div>

      {/* Post-Booking Auth Prompt Modal */}
      {showAuthPrompt && (
        <div className="settlla-overlay z-[70] bg-slate-950/70 backdrop-blur-sm animate-fade-in">
          <div
            className="settlla-dialog settlla-dialog--sm p-6 sm:p-7"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close / Dismiss button */}
            <button
              type="button"
              onClick={handleSkipAuth}
              className="absolute top-4 right-4 flex h-8 w-8 items-center justify-center rounded-xl bg-slate-100 text-slate-500 hover:bg-slate-200 hover:text-slate-800 transition-colors cursor-pointer"
            >
              <X className="h-4 w-4" />
            </button>

            {pendingConfirmEmail ? (
              <ConfirmEmailPanel
                email={pendingConfirmEmail}
                description={
                  <>
                    We sent a confirmation link to{" "}
                    <strong className="text-slate-900 break-all">{pendingConfirmEmail}</strong>.
                    Open it to save your inspection pass and continue your rental.
                  </>
                }
                onBack={() => setPendingConfirmEmail(null)}
              />
            ) : (
            <>
            <div className="text-center mb-5">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 border border-blue-200 text-blue-600 mb-3 shadow-xs">
                <ShieldCheck className="h-6 w-6 text-blue-600" />
              </div>
              <h3 className="text-lg font-black text-slate-900">
                Save Your Inspection Pass
              </h3>
              <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">
                Create a free account or sign in to save pass{" "}
                <strong className="text-blue-600 font-mono font-bold">
                  {confirmedBooking?.booking_id}
                </strong>
                , view walkthrough details later at the gate, and proceed with your tenancy agreement at any time.
              </p>
            </div>

            {/* Mode Switcher */}
            <div className="grid grid-cols-2 gap-1 rounded-2xl bg-slate-100 p-1 mb-4">
              <button
                type="button"
                onClick={() => {
                  setAuthMode("signup");
                  setAuthError(null);
                }}
                className={`rounded-xl py-2 text-xs font-bold transition-all cursor-pointer ${
                  authMode === "signup"
                    ? "bg-white text-slate-900 shadow-xs"
                    : "text-slate-500 hover:text-slate-900"
                }`}
              >
                Create Account
              </button>
              <button
                type="button"
                onClick={() => {
                  setAuthMode("signin");
                  setAuthError(null);
                }}
                className={`rounded-xl py-2 text-xs font-bold transition-all cursor-pointer ${
                  authMode === "signin"
                    ? "bg-white text-slate-900 shadow-xs"
                    : "text-slate-500 hover:text-slate-900"
                }`}
              >
                Sign In
              </button>
            </div>

            {authError && (
              <div className="mb-4 rounded-xl bg-rose-50 border border-rose-200 p-3 text-xs text-rose-700 flex items-center gap-2">
                <AlertCircle className="h-4 w-4 shrink-0 text-rose-600" />
                <span>{authError}</span>
              </div>
            )}

            <form onSubmit={handleAuthSubmit} className="space-y-3.5 text-left">
              {authMode === "signup" && (
                <>
                  <div>
                    <label className="text-[11px] uppercase font-bold text-slate-500 block mb-1">
                      Full Legal Name
                    </label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                      <input
                        type="text"
                        required
                        value={authName}
                        onChange={(e) => setAuthName(e.target.value)}
                        placeholder="e.g. Aminu Bello"
                        className="w-full rounded-xl border border-slate-200 bg-slate-50 pl-9 pr-3 py-2.5 text-xs font-semibold text-slate-900 focus:bg-white focus:border-blue-500 outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-[11px] uppercase font-bold text-slate-500 block mb-1">
                      WhatsApp Phone Number
                    </label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                      <input
                        type="tel"
                        required
                        value={authPhone}
                        onChange={(e) => setAuthPhone(e.target.value)}
                        placeholder="e.g. 0803 123 4567"
                        className="w-full rounded-xl border border-slate-200 bg-slate-50 pl-9 pr-3 py-2.5 text-xs font-semibold text-slate-900 focus:bg-white focus:border-blue-500 outline-none"
                      />
                    </div>
                  </div>
                </>
              )}

              <div>
                <label className="text-[11px] uppercase font-bold text-slate-500 block mb-1">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <input
                    type="email"
                    required
                    value={authEmail}
                    onChange={(e) => setAuthEmail(e.target.value)}
                    placeholder="e.g. tenant@example.com"
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 pl-9 pr-3 py-2.5 text-xs font-semibold text-slate-900 focus:bg-white focus:border-blue-500 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="text-[11px] uppercase font-bold text-slate-500 block mb-1">
                  {authMode === "signup" ? "Create Password" : "Password"}
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <input
                    type="password"
                    required={isSupabaseConfigured()}
                    minLength={isSupabaseConfigured() ? MIN_PASSWORD_LENGTH : undefined}
                    value={authPassword}
                    onChange={(e) => setAuthPassword(e.target.value)}
                    placeholder={
                      authMode === "signup"
                        ? `At least ${MIN_PASSWORD_LENGTH} characters`
                        : "Enter your password"
                    }
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 pl-9 pr-3 py-2.5 text-xs font-semibold text-slate-900 focus:bg-white focus:border-blue-500 outline-none"
                  />
                </div>
              </div>

              {/* Value prop pills */}
              <div className="rounded-2xl bg-blue-50/70 border border-blue-100 p-3 space-y-1.5 text-[11px] text-slate-700">
                <div className="flex items-center gap-1.5 font-bold text-blue-900">
                  <CheckCircle2 className="h-3.5 w-3.5 text-blue-600 shrink-0" />
                  <span>Access gate pass &amp; location anytime</span>
                </div>
                <div className="flex items-center gap-1.5 text-slate-600">
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                  <span>Start legal tenancy agreement with 1 click</span>
                </div>
              </div>

              <button
                type="submit"
                disabled={authLoading}
                className="w-full rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-bold py-3.5 text-xs sm:text-sm shadow-lg shadow-blue-600/30 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                <span>
                  {authMode === "signup"
                    ? "Save Pass & Create Tenant Account"
                    : "Sign In & Access Pass"}
                </span>
                <ArrowRight className="h-4 w-4" />
              </button>
            </form>

            <button
              type="button"
              onClick={handleSkipAuth}
              className="mt-3 w-full text-center text-[11px] font-semibold text-slate-400 hover:text-slate-600 py-1 transition-colors cursor-pointer"
            >
              Skip for now &amp; exit as guest
            </button>
            </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
