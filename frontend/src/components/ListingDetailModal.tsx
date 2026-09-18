"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { Listing } from "../types/listing";
import { Button } from "./ui/Button";
import {
  X,
  MapPin,
  ShieldCheck,
  CreditCard,
  Check,
  Bed,
  Bath,
  Zap,
  Droplets,
  Calendar,
  ArrowRight,
} from "lucide-react";

interface ListingDetailModalProps {
  listing: Listing | null;
  onClose: () => void;
  onBookInspection: (listing: Listing) => void;
  onDraftAgreement?: (listing: Listing) => void;
}

export const ListingDetailModal: React.FC<ListingDetailModalProps> = ({
  listing,
  onClose,
  onBookInspection,
  onDraftAgreement,
}) => {
  const [selectedImgIdx, setSelectedImgIdx] = useState(0);

  useEffect(() => {
    if (listing) {
      setSelectedImgIdx(0);
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "auto";
    };
  }, [listing, onClose]);

  if (!listing) return null;

  const formatNaira = (amount: number) => {
    return "₦" + amount.toLocaleString("en-NG");
  };

  return (
    <div
      className="settlla-overlay bg-slate-900/60 backdrop-blur-sm animate-fade-in"
      onClick={onClose}
    >
      <div
        className="settlla-dialog settlla-dialog--xl settlla-dialog--scroll"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Sticky Modal Header */}
        <div className="sticky top-0 z-20 flex items-center justify-between border-b border-slate-200/90 bg-white/95 px-4 sm:px-6 py-3.5 sm:py-4 backdrop-blur-md">
          <div className="flex items-center gap-2.5">
            <span className="flex h-3 w-3 rounded-full bg-blue-600"></span>
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-blue-700 sm:hidden">
                Verified apartment
              </span>
              <span className="hidden sm:inline text-xs font-bold uppercase tracking-wider text-blue-700">
                Verified Kaduna Apartment Detail View
              </span>
              <span className="hidden sm:inline text-xs text-slate-400 ml-2">
                Mandate #{listing.mandate.mandate_ref}
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-900 transition-colors cursor-pointer"
            aria-label="Close modal"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Modal Content Body */}
        <div className="p-4 sm:p-8 space-y-6 sm:space-y-8">
          {/* Title & Address Header */}
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-bold text-blue-700 border border-blue-200">
                {listing.neighborhood} • {listing.zone}
              </span>
              <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700 border border-slate-200">
                {listing.property_type}
              </span>
              <span className="flex items-center gap-1 rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700 border border-emerald-200">
                <Check className="h-3.5 w-3.5 text-emerald-600" />
                <span>Inspection Optional (₦0 Fee)</span>
              </span>
              {listing.pricing.caution_fee === 0 && (
                <span className="flex items-center gap-1 rounded-full bg-emerald-600 px-3 py-1 text-xs font-bold text-white shadow-xs">
                  <Check className="h-3.5 w-3.5 text-white" />
                  <span>₦0 Caution Deposit</span>
                </span>
              )}
            </div>
            <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900">
              {listing.title}
            </h2>
            <p className="mt-1.5 text-sm text-slate-600 flex items-center gap-1.5">
              <MapPin className="h-4 w-4 text-blue-600 shrink-0" />
              <span className="font-medium">{listing.full_address}</span>
              <span className="text-slate-400">({listing.commute_context})</span>
            </p>
          </div>

          {/* Photo Gallery */}
          <div>
            <div className="relative aspect-[16/9] w-full overflow-hidden rounded-2xl bg-slate-100 border border-slate-200">
              <Image
                src={listing.images[selectedImgIdx]}
                alt={`${listing.title} view ${selectedImgIdx + 1}`}
                fill
                className="object-cover transition-all duration-300"
                priority
              />
              <div className="absolute top-4 left-4">
                <span className="flex items-center gap-1.5 rounded-full bg-blue-600/95 px-3 py-1 text-xs font-bold text-white shadow-md backdrop-blur-xs">
                  <ShieldCheck className="h-3.5 w-3.5 text-white" />
                  <span>HB&amp;A Mandate Verified</span>
                </span>
              </div>
              <div className="absolute bottom-4 right-4 rounded-lg bg-black/65 px-2.5 py-1 text-xs font-semibold text-white backdrop-blur-xs">
                Photo {selectedImgIdx + 1} of {listing.images.length}
              </div>
            </div>

            {/* Thumbnails */}
            <div className="mt-3 flex gap-3 overflow-x-auto pb-1">
              {listing.images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedImgIdx(idx)}
                  className={`relative h-16 w-24 flex-shrink-0 overflow-hidden rounded-xl border-2 transition-all cursor-pointer ${
                    selectedImgIdx === idx
                      ? "border-blue-600 shadow-md shadow-blue-500/20 scale-105"
                      : "border-slate-200 hover:border-slate-400 opacity-75 hover:opacity-100"
                  }`}
                >
                  <Image src={img} alt={`Thumb ${idx + 1}`} fill className="object-cover" />
                </button>
              ))}
            </div>
          </div>

          {/* HB&A Mandate Trust Card */}
          <div className="rounded-2xl border border-blue-200 bg-blue-50/60 p-5">
            <div className="flex items-start gap-3.5">
              <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl bg-blue-600 text-white shadow-sm">
                <ShieldCheck className="h-6 w-6 text-white" />
              </div>
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <h4 className="text-sm font-bold text-slate-900">
                    Direct Landlord Mandate Verified ({listing.mandate.mandate_ref})
                  </h4>
                  <span className="rounded bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-800">
                    {listing.mandate.mandate_status}
                  </span>
                </div>
                <p className="mt-1 text-xs text-slate-600 leading-relaxed">
                  Exclusively managed by <strong>{listing.mandate.manager_name}</strong> ({listing.mandate.accreditation}) on behalf of verified owner <strong>{listing.mandate.landlord_name}</strong>. Legally authorized to schedule physical inspections and sign statutory tenancy agreements.
                </p>
              </div>
            </div>
          </div>

          {/* Description */}
          <div>
            <h3 className="text-base font-bold text-slate-900 mb-2">About this Property</h3>
            <p className="text-sm text-slate-600 leading-relaxed bg-slate-50 p-4 rounded-2xl border border-slate-200/70">
              {listing.description}
            </p>
          </div>

          {/* 4-Way Statutory Pricing Table */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <CreditCard className="h-5 w-5 text-blue-600" />
                <span>Full Upfront Price Breakdown (Statutory Transparency)</span>
              </h3>
              <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                Zero Hidden Charges
              </span>
            </div>

          <div className="settlla-table-wrap overflow-x-auto no-scrollbar rounded-2xl border border-slate-200 bg-white shadow-xs">
              <table className="w-full min-w-[480px] sm:min-w-0 text-left text-xs sm:text-sm">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50 text-slate-600 uppercase text-[11px] font-bold">
                    <th className="py-3 px-4">Cost Component</th>
                    <th className="py-3 px-4">Statutory Basis / Rate</th>
                    <th className="py-3 px-4 text-right">Amount (₦)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  <tr>
                    <td className="py-3.5 px-4 font-bold text-slate-900">Annual Net Rent</td>
                    <td className="py-3.5 px-4 text-slate-500">12 Months Residential Lease (Base Rent)</td>
                    <td className="py-3.5 px-4 text-right font-black text-slate-900">
                      {formatNaira(listing.pricing.annual_rent)}
                    </td>
                  </tr>
                  <tr className={listing.pricing.caution_fee === 0 ? "bg-emerald-50/40" : ""}>
                    <td className="py-3.5 px-4 font-semibold text-slate-800">
                      <div className="flex items-center gap-1.5">
                        <span>Caution Deposit</span>
                        {listing.pricing.caution_fee === 0 && (
                          <span className="rounded-md bg-emerald-100 px-1.5 py-0.5 text-[10px] font-bold text-emerald-800">Waived</span>
                        )}
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-slate-500">
                      {listing.pricing.caution_fee > 0
                        ? "10% Refundable (Held in escrow reserve until end of tenancy)"
                        : "₦0 Caution Deposit — Waived under Landlord's approved mandate concession"}
                    </td>
                    <td className="py-3.5 px-4 text-right font-bold text-slate-800">
                      {listing.pricing.caution_fee > 0 ? (
                        formatNaira(listing.pricing.caution_fee)
                      ) : (
                        <span className="text-emerald-700 font-bold">₦0 (Waived)</span>
                      )}
                    </td>
                  </tr>
                  <tr>
                    <td className="py-3.5 px-4 font-semibold text-slate-800">Legal &amp; Agency Fee</td>
                    <td className="py-3.5 px-4 text-slate-500">
                      15% Statutory tenancy drafting, stamp duty &amp; professional management under HB&amp;A mandate
                    </td>
                    <td className="py-3.5 px-4 text-right font-bold text-slate-800">
                      {formatNaira(listing.pricing.legal_and_agency_fee || (listing.pricing.legal_fee + listing.pricing.agency_fee))}
                    </td>
                  </tr>
                  <tr className="bg-emerald-50 text-emerald-900">
                    <td className="py-3.5 px-4 font-bold flex items-center gap-1.5">
                      <Check className="h-4 w-4 text-emerald-600" />
                      <span>Physical Inspection Fee</span>
                    </td>
                    <td className="py-3.5 px-4 text-slate-500">
                      <span className="line-through text-rose-500">₦3,000 – ₦5,000 roadside agent fee</span> (100% Free &amp; Optional on Settlla)
                    </td>
                    <td className="py-3.5 px-4 text-right font-black text-emerald-700">₦0 (FREE / OPTIONAL)</td>
                  </tr>
                  <tr className="border-t-2 border-blue-500 bg-blue-50/70 text-slate-900">
                    <td className="py-4 px-4 text-sm sm:text-base font-black uppercase text-blue-800">
                      Total Move-In Cost
                    </td>
                    <td className="py-4 px-4 text-xs text-slate-600 font-medium">
                      Exact total required at lease signing. Absolutely no extra charges.
                    </td>
                    <td className="py-4 px-4 text-right text-base sm:text-2xl font-black text-blue-700">
                      {formatNaira(listing.pricing.total_move_in_cost)}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Specs & Utilities Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="text-sm font-bold text-slate-900 mb-2.5">Key Specifications</h4>
              <ul className="space-y-2 text-xs text-slate-700">
                <li className="flex items-center gap-2 rounded-xl bg-slate-50 p-3 border border-slate-200/70">
                  <Bed className="h-4 w-4 text-blue-600 shrink-0" />
                  <span><strong>{listing.bedrooms}</strong> Bedroom(s) ({listing.property_type})</span>
                </li>
                <li className="flex items-center gap-2 rounded-xl bg-slate-50 p-3 border border-slate-200/70">
                  <Bath className="h-4 w-4 text-blue-600 shrink-0" />
                  <span><strong>{listing.bathrooms}</strong> Modern Bathroom(s)</span>
                </li>
                <li className="flex items-center gap-2 rounded-xl bg-slate-50 p-3 border border-slate-200/70">
                  <Zap className="h-4 w-4 text-emerald-600 shrink-0" />
                  <span>Dedicated Prepaid Meter (Self-Billed via KEDCO portal)</span>
                </li>
                <li className="flex items-center gap-2 rounded-xl bg-slate-50 p-3 border border-slate-200/70">
                  <Droplets className="h-4 w-4 text-blue-600 shrink-0" />
                  <span>Constant Potable Borehole Water System</span>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="text-sm font-bold text-slate-900 mb-2.5">Verified Amenities</h4>
              <div className="space-y-2 text-xs text-slate-700">
                {listing.amenities.map((amenity, idx) => (
                  <div key={idx} className="flex items-center gap-2 rounded-xl bg-slate-50 p-3 border border-slate-200/70">
                    <Check className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                    <span className="font-medium">{amenity}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Bottom Banner: Direct Rent & Optional Inspection */}
          <div className="rounded-3xl border border-blue-200 bg-gradient-to-br from-blue-50/70 via-slate-50 to-white p-6 shadow-xs">
            <div className="flex flex-col gap-4">
              <div className="w-full">
                <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                  <span className="text-xs font-bold text-blue-700 uppercase tracking-wider">
                    Flexible Move-In Options
                  </span>
                  <span className="rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2.5 py-0.5">
                    Inspection Not Compulsory
                  </span>
                </div>
                <h4 className="text-base sm:text-lg font-bold text-slate-900">
                  Ready to Rent? Apply Directly or Book an Optional Tour
                </h4>
                <p className="text-xs sm:text-sm text-slate-600 mt-1 leading-relaxed">
                  You can lease online right now with full 24-hr Key-In-Door Escrow protection. Or, if you prefer an in-person walkthrough, book an official ₦0 visiting window.
                </p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {listing.visiting_windows.map((win, idx) => (
                    <span
                      key={idx}
                      className="flex items-center gap-1.5 rounded-lg bg-white px-3 py-1.5 text-xs text-slate-700 border border-slate-200 font-medium shadow-2xs"
                    >
                      <Calendar className="h-3.5 w-3.5 text-slate-500" />
                      <span><strong>{win.day}:</strong> {win.hours}</span>
                    </span>
                  ))}
                </div>
              </div>

              {/* Action buttons placed underneath */}
              <div className="flex w-full flex-col gap-3 pt-2 sm:flex-row sm:items-center">
                {onDraftAgreement && (
                  <Button
                    type="button"
                    variant="primary"
                    size="lg"
                    className="flex-1"
                    onClick={() => onDraftAgreement(listing)}
                  >
                    <Zap className="h-4 w-4" />
                    Instant rent
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                )}
                <Button
                  type="button"
                  variant="secondary"
                  size="lg"
                  className="flex-1 sm:flex-initial"
                  onClick={() => onBookInspection(listing)}
                >
                  <Calendar className="h-4 w-4 text-slate-500" />
                  Book free tour
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
