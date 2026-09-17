"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useParams } from "next/navigation";
import { Navbar } from "@/components/Navbar";
import { Listing } from "@/types/listing";
import { getSeedListingById } from "@/data/seedListings";
import { BookingDrawer } from "@/components/BookingDrawer";
import { TenancyAgreementViewer } from "@/components/TenancyAgreementViewer";
import {
  ArrowLeft,
  MapPin,
  Check,
  ShieldCheck,
  CreditCard,
  Bed,
  Bath,
  Zap,
  Droplets,
  Calendar,
  FileText,
} from "lucide-react";

export default function ListingDetailPage() {
  const params = useParams();
  const id = params?.id as string;

  const [listing, setListing] = useState<Listing | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [selectedImgIdx, setSelectedImgIdx] = useState(0);
  const [isBookingOpen, setIsBookingOpen] = useState(false);
  const [isAgreementOpen, setIsAgreementOpen] = useState(false);

  useEffect(() => {
    async function fetchDetail() {
      if (!id) return;

      // Check seed data first
      const seedItem = getSeedListingById(id);

      try {
        const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;
        if (backendUrl) {
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 1200);
          const res = await fetch(`${backendUrl}/api/listings/${id}`, {
            signal: controller.signal,
          });
          clearTimeout(timeoutId);
          if (res.ok) {
            const data: Listing = await res.json();
            setListing(data);
            setLoading(false);
            return;
          }
        }
        
        if (seedItem) {
          setListing(seedItem);
        } else {
          setError("Listing not found");
        }
      } catch {
        if (seedItem) {
          setListing(seedItem);
        } else {
          setError("Listing not found in verified registry");
        }
      } finally {
        setLoading(false);
      }
    }
    fetchDetail();
  }, [id]);

  const formatNaira = (amount: number) => {
    return "₦" + amount.toLocaleString("en-NG");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-emerald-500 border-t-transparent"></div>
        <p className="mt-4 text-xs font-semibold text-slate-400">Loading verified property details...</p>
      </div>
    );
  }

  if (error || !listing) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center justify-center p-6 text-center">
        <h2 className="text-xl font-bold text-white mb-2">Property Not Found</h2>
        <p className="text-sm text-slate-400 mb-6">{error || "Unable to locate this verified listing."}</p>
        <Link
          href="/"
          className="rounded-xl bg-emerald-600 px-5 py-2.5 text-xs font-bold text-slate-950 hover:bg-emerald-500"
        >
          Back to Verified Listings
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans pb-16 lg:pb-0">
      <Navbar verifiedCount={5} />

      <main className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Navigation Breadcrumb */}
        <div className="mb-6 flex items-center justify-between">
          <Link
            href="/"
            className="flex items-center gap-2 text-xs font-bold text-slate-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to All Verified Listings</span>
          </Link>
          <span className="rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-bold text-emerald-400 border border-emerald-500/20">
            Verified Listing &amp; ₦0 Inspection
          </span>
        </div>

        {/* Title & Location Header */}
        <div className="mb-8">
          <div className="flex flex-wrap items-center gap-2 mb-2">
            <span className="rounded-full bg-emerald-500/10 px-3 py-0.5 text-xs font-bold text-emerald-400 border border-emerald-500/20">
              {listing.neighborhood} • {listing.zone}
            </span>
            <span className="rounded-full bg-slate-800 px-3 py-0.5 text-xs font-semibold text-slate-300 border border-slate-700">
              {listing.property_type}
            </span>
            <span className="rounded-full bg-teal-500/10 px-3 py-0.5 text-xs font-bold text-teal-400 border border-teal-500/20">
              ₦0 Inspection
            </span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-white">
            {listing.title}
          </h1>
          <p className="mt-2 text-sm text-slate-400 flex items-center gap-1.5">
            <MapPin className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{listing.full_address} ({listing.commute_context})</span>
          </p>
        </div>

        {/* Photo Gallery */}
        <div className="mb-8">
          <div className="relative aspect-[16/9] w-full overflow-hidden rounded-3xl bg-slate-950 border border-slate-800 shadow-2xl">
            <Image
              src={listing.images[selectedImgIdx]}
              alt={`${listing.title} photo`}
              fill
              className="object-cover"
              priority
            />
            <div className="absolute top-4 left-4">
              <span className="flex items-center gap-1.5 rounded-full bg-emerald-950/90 px-3.5 py-1 text-xs font-bold text-emerald-300 border border-emerald-600/40 backdrop-blur-md">
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span>Mandate Verified</span>
              </span>
            </div>
          </div>

          {/* Thumbnails */}
          <div className="mt-4 flex gap-3 overflow-x-auto pb-1">
            {listing.images.map((img, idx) => (
              <button
                key={idx}
                onClick={() => setSelectedImgIdx(idx)}
                className={`relative h-20 w-32 flex-shrink-0 overflow-hidden rounded-2xl border-2 transition-all ${
                  selectedImgIdx === idx
                    ? "border-emerald-500 shadow-lg shadow-emerald-500/20 scale-105"
                    : "border-slate-800 hover:border-slate-600 opacity-70 hover:opacity-100"
                }`}
              >
                <Image src={img} alt={`Thumb ${idx + 1}`} fill className="object-cover" />
              </button>
            ))}
          </div>
        </div>

        {/* Mandate Verification Card */}
        <div className="mb-8 rounded-3xl border border-emerald-800/40 bg-gradient-to-r from-emerald-950/40 via-slate-900 to-slate-900 p-6 shadow-xl">
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-2xl bg-emerald-500/20 border border-emerald-500/30 text-emerald-400">
              <ShieldCheck className="w-6 h-6 text-emerald-400" />
            </div>
            <div>
              <div className="flex items-center gap-2.5">
                <h3 className="text-base font-bold text-white">
                  Direct Landlord Mandate Verified ({listing.mandate.mandate_ref})
                </h3>
                <span className="rounded bg-emerald-500/10 px-2 py-0.5 text-[10px] font-bold text-emerald-400 border border-emerald-500/20">
                  {listing.mandate.mandate_status}
                </span>
              </div>
              <p className="mt-1 text-xs sm:text-sm text-slate-300 leading-relaxed">
                Exclusively managed by <strong>{listing.mandate.manager_name}</strong> ({listing.mandate.accreditation}) on behalf of property owner <strong>{listing.mandate.landlord_name}</strong>. Legally authorized to schedule physical tours, receive rental payments in escrow, and execute tenancy agreements.
              </p>
            </div>
          </div>
        </div>

        {/* 4-Way Statutory Pricing Table */}
        <div className="mb-8">
          <h2 className="text-xl font-bold text-white mb-3 flex items-center gap-2">
            <CreditCard className="w-5 h-5 text-emerald-400" />
            <span>All-In Upfront Pricing Breakdown (Zero Hidden Fees)</span>
          </h2>
          <div className="overflow-x-auto rounded-3xl border border-slate-800 bg-slate-900/60 shadow-xl no-scrollbar">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead>
                <tr className="border-b border-slate-800 bg-slate-900/90 text-slate-400 uppercase text-[11px] font-bold">
                  <th className="py-3.5 px-5">Cost Component</th>
                  <th className="py-3.5 px-5">Statutory Basis / Rate</th>
                  <th className="py-3.5 px-5 text-right">Amount (₦)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-slate-200">
                <tr>
                  <td className="py-3.5 px-5 font-semibold text-white">Annual Net Rent</td>
                  <td className="py-3.5 px-5 text-slate-400">12 Months Residential Lease (75% base)</td>
                  <td className="py-3.5 px-5 text-right font-bold text-white">{formatNaira(listing.pricing.annual_rent)}</td>
                </tr>
                <tr>
                  <td className="py-3.5 px-5 font-semibold">Caution Deposit</td>
                  <td className="py-3.5 px-5 text-slate-400">10% Refundable (Parked in escrow reserve until move-out)</td>
                  <td className="py-3.5 px-5 text-right font-bold">{formatNaira(listing.pricing.caution_fee)}</td>
                </tr>
                <tr>
                  <td className="py-3.5 px-5 font-semibold">Legal Documentation Fee</td>
                  <td className="py-3.5 px-5 text-slate-400">5% Statutory Tenancy Agreement drafting &amp; stamp duty</td>
                  <td className="py-3.5 px-5 text-right font-bold">{formatNaira(listing.pricing.legal_fee)}</td>
                </tr>
                <tr>
                  <td className="py-3.5 px-5 font-semibold">Property Management / Agency</td>
                  <td className="py-3.5 px-5 text-slate-400">10% Professional management under HB&amp;A mandate</td>
                  <td className="py-3.5 px-5 text-right font-bold">{formatNaira(listing.pricing.agency_fee)}</td>
                </tr>
                <tr className="bg-emerald-950/20 text-emerald-300">
                  <td className="py-3.5 px-5 font-bold flex items-center gap-1.5">
                    <Check className="w-4 h-4 text-emerald-400" />
                    <span>Physical Inspection Fee</span>
                  </td>
                  <td className="py-3.5 px-5 text-slate-400">
                    <span className="line-through text-rose-400">₦3,000 – ₦5,000 roadside agent fee</span> (Eliminated on Settlla)
                  </td>
                  <td className="py-3.5 px-5 text-right font-bold text-emerald-400">₦0 (FREE)</td>
                </tr>
                <tr className="border-t-2 border-emerald-500/40 bg-emerald-950/30 text-white">
                  <td className="py-4 px-5 text-base sm:text-lg font-black uppercase text-emerald-400">
                    Total Move-In Cost
                  </td>
                  <td className="py-4 px-5 text-xs text-slate-300">
                    Exact total required at lease signing. Absolutely no extra charges.
                  </td>
                  <td className="py-4 px-5 text-right text-lg sm:text-2xl font-black text-emerald-400">
                    {formatNaira(listing.pricing.total_move_in_cost)}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Specs & Amenities Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
          <div>
            <h3 className="text-base font-bold text-white mb-3">Key Specifications</h3>
            <ul className="space-y-2.5 text-xs sm:text-sm text-slate-300">
              <li className="flex items-center gap-2.5 rounded-xl bg-slate-900/60 p-3 border border-slate-800">
                <Bed className="w-4 h-4 text-emerald-400" />
                <span>{listing.bedrooms} Bedroom(s) ({listing.property_type})</span>
              </li>
              <li className="flex items-center gap-2.5 rounded-xl bg-slate-900/60 p-3 border border-slate-800">
                <Bath className="w-4 h-4 text-emerald-400" />
                <span>{listing.bathrooms} Modern Bathroom(s)</span>
              </li>
              <li className="flex items-center gap-2.5 rounded-xl bg-slate-900/60 p-3 border border-slate-800">
                <Zap className="w-4 h-4 text-emerald-400" />
                <span>Dedicated Prepaid Meter (Self-Billed via Disco portal)</span>
              </li>
              <li className="flex items-center gap-2.5 rounded-xl bg-slate-900/60 p-3 border border-slate-800">
                <Droplets className="w-4 h-4 text-emerald-400" />
                <span>Constant Potable Borehole Water System</span>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-base font-bold text-white mb-3">Verified Amenities</h3>
            <div className="space-y-2.5 text-xs sm:text-sm text-slate-300">
              {listing.amenities.map((amenity, idx) => (
                <div key={idx} className="flex items-center gap-2.5 rounded-xl bg-slate-900/60 p-3 border border-slate-800">
                  <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>{amenity}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Visiting Windows & Free Inspection Booking */}
        <div className="rounded-3xl border border-slate-800 bg-slate-900/80 p-6 sm:p-8 shadow-2xl">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-base font-bold text-white">Manager Recurring Visiting Windows</h3>
              <p className="text-xs text-slate-400 mt-1">
                Walkthroughs are conducted strictly during official visiting windows by HB&amp;A Partners staff. Physical inspection is 100% optional.
              </p>
              <div className="mt-3 flex flex-wrap gap-2.5">
                {listing.visiting_windows.map((win, idx) => (
                  <span
                    key={idx}
                    className="flex items-center gap-1.5 rounded-xl bg-slate-950 px-3.5 py-2 text-xs text-slate-200 border border-slate-800 font-medium"
                  >
                    <Calendar className="w-3.5 h-3.5 text-emerald-400" />
                    <span><strong>{win.day}:</strong> {win.hours}</span>
                  </span>
                ))}
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 flex-shrink-0">
              <button
                onClick={() => setIsAgreementOpen(true)}
                className="rounded-2xl border border-emerald-500/30 bg-emerald-500/10 hover:bg-emerald-500/20 px-5 py-3.5 text-xs sm:text-sm font-bold text-emerald-400 transition-all flex items-center justify-center gap-2"
              >
                <FileText className="w-4 h-4 text-emerald-400" />
                <span>Instant Lease Preview (₦0)</span>
              </button>
              <button
                onClick={() => setIsBookingOpen(true)}
                className="rounded-2xl bg-emerald-600 hover:bg-emerald-500 px-6 py-3.5 text-xs sm:text-sm font-bold text-slate-950 transition-all shadow-xl shadow-emerald-600/30 hover:shadow-emerald-500/50"
              >
                Book Inspection (Optional)
              </button>
            </div>
          </div>
        </div>
      </main>

      {/* Booking Drawer (Screen 2 & 3 Flow) */}
      <BookingDrawer
        isOpen={isBookingOpen}
        onClose={() => setIsBookingOpen(false)}
        listing={listing}
        onProceedToAgreement={() => {
          setIsBookingOpen(false);
          setIsAgreementOpen(true);
        }}
      />

      {/* Tenancy Agreement Viewer (Screen 5) */}
      <TenancyAgreementViewer
        isOpen={isAgreementOpen}
        onClose={() => setIsAgreementOpen(false)}
        listing={listing}
      />
    </div>
  );
}
