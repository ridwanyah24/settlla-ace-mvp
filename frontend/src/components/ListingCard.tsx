"use client";

import React, { useState } from "react";
import Image from "next/image";
import { Listing } from "../types/listing";
import {
  BadgeCheck,
  Check,
  CheckCircle2,
  Bed,
  Bath,
  Zap,
  Droplets,
  Camera,
  ChevronLeft,
  ChevronRight,
  MapPin,
  Calendar,
  ArrowRight,
  ShieldCheck,
  Sparkles,
} from "lucide-react";

interface ListingCardProps {
  listing: Listing;
  onSelect: (listing: Listing) => void;
  onBookInspection?: (listing: Listing) => void;
  onDirectApply?: (listing: Listing) => void;
  aiMatchScore?: number;
  aiHighlightReason?: string;
}

export const ListingCard: React.FC<ListingCardProps> = ({
  listing,
  onSelect,
  onBookInspection,
  onDirectApply,
  aiMatchScore,
  aiHighlightReason,
}) => {
  const [activeImageIdx, setActiveImageIdx] = useState(0);

  const formatNaira = (amount: number) => {
    return "₦" + amount.toLocaleString("en-NG");
  };

  const handleNextImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    setActiveImageIdx((prev) => (prev + 1) % listing.images.length);
  };

  const handlePrevImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    setActiveImageIdx((prev) => (prev - 1 + listing.images.length) % listing.images.length);
  };

  return (
    <div className="group flex flex-col justify-between overflow-hidden rounded-3xl border border-slate-200/90 bg-white shadow-sm hover:shadow-xl hover:border-blue-500/40 transition-all duration-300">
      {/* 1. Media Wrap */}
      <div>
        <div className="relative aspect-[16/10] w-full overflow-hidden bg-slate-100">
          <Image
            src={listing.images[activeImageIdx] || listing.images[0]}
            alt={listing.title}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-105"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-transparent to-black/20"></div>

          {/* Top Badges */}
          <div className="absolute top-3 left-3 flex items-center gap-1.5 flex-wrap">
            <span className="flex items-center gap-1.5 rounded-full bg-blue-600/95 px-3 py-1 text-[11px] font-bold text-white shadow-md backdrop-blur-xs">
              <BadgeCheck className="h-3.5 w-3.5 text-white" />
              <span>Verified Mandate</span>
            </span>
            {listing.pricing.caution_fee === 0 && (
              <span className="flex items-center gap-1 rounded-full bg-emerald-600/95 px-2.5 py-1 text-[11px] font-bold text-white shadow-md backdrop-blur-xs">
                <span>₦0 Caution</span>
              </span>
            )}
            {aiMatchScore !== undefined && (
              <span className="flex items-center gap-1 rounded-full bg-slate-900/90 text-amber-300 border border-amber-400/40 px-2.5 py-1 text-[11px] font-black shadow-md backdrop-blur-xs">
                <Sparkles className="h-3 w-3 text-amber-400 animate-pulse" />
                <span className="text-emerald-400">{aiMatchScore}% Match</span>
              </span>
            )}
          </div>

          <div className="absolute top-3 right-3 flex items-center gap-1.5">
            <span className="inline-flex items-center gap-1 rounded-full bg-white/95 px-2.5 py-1 text-[11px] font-bold text-blue-700 shadow-sm backdrop-blur-xs border border-blue-100">
              <CheckCircle2 className="h-3 w-3 text-emerald-600" />
              <span>Inspection Optional</span>
            </span>
          </div>

          {/* Image Navigation Arrows */}
          {listing.images.length > 1 && (
            <div className="absolute inset-y-0 inset-x-2 flex items-center justify-between opacity-0 group-hover:opacity-100 transition-opacity">
              <button
                type="button"
                onClick={handlePrevImage}
                className="flex h-7 w-7 items-center justify-center rounded-full bg-white/90 text-slate-800 shadow-md hover:bg-white hover:scale-110 transition-all cursor-pointer"
                aria-label="Previous image"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={handleNextImage}
                className="flex h-7 w-7 items-center justify-center rounded-full bg-white/90 text-slate-800 shadow-md hover:bg-white hover:scale-110 transition-all cursor-pointer"
                aria-label="Next image"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          )}

          {/* Bottom Floating Price & Photo Counter */}
          <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between">
            <div className="rounded-xl bg-slate-900/90 px-3 py-1 text-white shadow-md backdrop-blur-xs border border-slate-700/50">
              <span className="text-xs text-slate-300 mr-1">Annual Rent:</span>
              <span className="text-sm font-black text-white">{formatNaira(listing.pricing.annual_rent)}</span>
              <span className="text-[10px] text-slate-300">/yr</span>
            </div>

            <span className="inline-flex items-center gap-1 rounded-lg bg-black/60 px-2 py-0.5 text-[10px] font-medium text-white backdrop-blur-xs">
              <Camera className="h-3 w-3" />
              <span>{activeImageIdx + 1}/{listing.images.length}</span>
            </span>
          </div>
        </div>

        {/* 2. Content Body */}
        <div className="p-5">
          {/* Commute Badge & AI Match Reason */}
          <div className="mb-2 space-y-1.5">
            {aiHighlightReason && (
              <div className="flex items-center gap-1.5 rounded-lg bg-amber-50/90 border border-amber-200/80 px-2.5 py-1 text-[11px] font-semibold text-amber-900">
                <Sparkles className="h-3 w-3 text-amber-600 shrink-0" />
                <span className="truncate">{aiHighlightReason}</span>
              </div>
            )}
            <span className="inline-flex items-center gap-1.5 rounded-lg bg-blue-50 px-2.5 py-1 text-xs font-semibold text-blue-800 border border-blue-100">
              <MapPin className="h-3.5 w-3.5 text-blue-600 flex-shrink-0" />
              <span className="truncate">{listing.commute_badge}</span>
            </span>
          </div>

          {/* Neighborhood & Title */}
          <div className="mb-3">
            <div className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
              {listing.neighborhood} • {listing.zone}
            </div>
            <h3
              onClick={() => onSelect(listing)}
              className="mt-0.5 text-base font-bold text-slate-900 group-hover:text-blue-600 cursor-pointer transition-colors line-clamp-1"
            >
              {listing.title}
            </h3>
            <p className="text-xs text-slate-500 line-clamp-1 mt-0.5">{listing.full_address}</p>
          </div>

          {/* Specs Row with Lucide Icons */}
          <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1 py-2.5 border-y border-slate-100 text-xs font-semibold text-slate-700">
            <span className="flex items-center gap-1.5">
              <Bed className="h-4 w-4 text-blue-600" />
              <span>{listing.bedrooms} Bed</span>
            </span>
            <span className="text-slate-300">•</span>
            <span className="flex items-center gap-1.5">
              <Bath className="h-4 w-4 text-blue-600" />
              <span>{listing.bathrooms} Bath</span>
            </span>
            <span className="text-slate-300">•</span>
            <span className="flex items-center gap-1 text-emerald-600">
              <Zap className="h-3.5 w-3.5" />
              <span>Prepaid</span>
            </span>
            <span className="text-slate-300">•</span>
            <span className="flex items-center gap-1 text-blue-600">
              <Droplets className="h-3.5 w-3.5" />
              <span>Borehole</span>
            </span>
          </div>

          {/* Amenities Pills */}
          <div className="my-3 flex flex-wrap gap-1.5">
            {listing.amenities.slice(0, 3).map((amenity, idx) => (
              <span
                key={idx}
                className="rounded-md bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-700 border border-slate-200/60"
              >
                {amenity}
              </span>
            ))}
            {listing.amenities.length > 3 && (
              <span className="rounded-md bg-slate-50 px-1.5 py-0.5 text-[11px] font-medium text-slate-500 border border-slate-200/40">
                +{listing.amenities.length - 3} more
              </span>
            )}
          </div>
        </div>
      </div>

      {/* 3. Footer / Itemized Upfront Pricing Box */}
      <div className="p-5 pt-0">
        <div className="rounded-2xl border border-blue-100 bg-gradient-to-b from-blue-50/50 to-slate-50/90 p-3.5">
          <div className="flex items-baseline justify-between mb-2">
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-600">
              Total Move-In Cost
            </span>
            <span className="text-lg font-black tracking-tight text-blue-700">
              {formatNaira(listing.pricing.total_move_in_cost)}
            </span>
          </div>

          {/* Statutory Breakdown */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-1.5 text-[11px]">
            <div className="rounded-lg bg-white px-2 py-1 border border-slate-200/80 flex justify-between sm:flex-col sm:justify-start">
              <span className="text-slate-500 text-[10px]">Rent:</span>
              <strong className="text-slate-800 font-bold">{formatNaira(listing.pricing.annual_rent)}</strong>
            </div>
            <div className={`rounded-lg px-2 py-1 border flex justify-between sm:flex-col sm:justify-start ${
              listing.pricing.caution_fee === 0
                ? "bg-emerald-50/70 border-emerald-200 text-emerald-800"
                : "bg-white border-slate-200/80"
            }`}>
              <span className={`text-[10px] ${listing.pricing.caution_fee === 0 ? "text-emerald-700 font-medium" : "text-slate-500"}`}>Caution:</span>
              <strong className={listing.pricing.caution_fee === 0 ? "text-emerald-700 font-bold" : "text-slate-800"}>
                {listing.pricing.caution_fee > 0 ? formatNaira(listing.pricing.caution_fee) : "₦0 (Waived)"}
              </strong>
            </div>
            <div className="rounded-lg bg-white px-2 py-1 border border-slate-200/80 flex justify-between sm:flex-col sm:justify-start">
              <span className="text-slate-500 text-[10px]">Legal &amp; Agency (15%):</span>
              <strong className="text-slate-800 font-bold">
                {formatNaira(listing.pricing.legal_and_agency_fee || (listing.pricing.legal_fee + listing.pricing.agency_fee))}
              </strong>
            </div>
          </div>

          {/* Zero Hidden Fee Tag */}
          <div className="mt-2 text-center text-[10px] font-semibold text-emerald-700 bg-emerald-50 rounded-md py-0.5 border border-emerald-200/60 flex items-center justify-center gap-1">
            <CheckCircle2 className="h-3 w-3" />
            <span>Statutory transparency guarantee • Zero roadside agent markups</span>
          </div>
        </div>

        {/* Action Buttons: Direct Rent & Optional Inspection */}
        <div className="mt-3.5 grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => onDirectApply ? onDirectApply(listing) : onSelect(listing)}
            className="flex items-center justify-center gap-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 px-3 py-2.5 text-xs font-bold text-white transition-all shadow-md shadow-blue-500/20 hover:shadow-blue-500/30 cursor-pointer"
            title="Apply & draft tenancy agreement directly without inspection"
          >
            <Zap className="h-3.5 w-3.5" />
            <span>Instant Rent</span>
          </button>

          <button
            type="button"
            onClick={() => onBookInspection ? onBookInspection(listing) : onSelect(listing)}
            className="flex items-center justify-center gap-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 px-2.5 py-2.5 text-xs font-bold text-slate-800 transition-colors shadow-2xs cursor-pointer"
            title="Book an optional free tour"
          >
            <Calendar className="h-3.5 w-3.5 text-slate-500" />
            <span>Book Free Tour</span>
          </button>
        </div>
      </div>
    </div>
  );
};
