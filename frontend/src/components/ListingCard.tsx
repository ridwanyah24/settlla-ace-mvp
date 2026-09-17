"use client";

import React, { useState } from "react";
import Image from "next/image";
import { Listing } from "../types/listing";
import { Button } from "./ui/Button";
import {
  BadgeCheck,
  Bed,
  Bath,
  Camera,
  ChevronLeft,
  ChevronRight,
  MapPin,
  Calendar,
  Eye,
  Sparkles,
} from "lucide-react";

interface ListingCardProps {
  listing: Listing;
  onSelect: (listing: Listing) => void;
  onBookInspection?: (listing: Listing) => void;
  aiMatchScore?: number;
  aiHighlightReason?: string;
}

export const ListingCard: React.FC<ListingCardProps> = ({
  listing,
  onSelect,
  onBookInspection,
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
    <article className="group flex flex-col overflow-hidden settlla-card settlla-card-interactive">
      <div className="relative aspect-[16/10] w-full overflow-hidden bg-slate-100">
        <Image
          src={listing.images[activeImageIdx] || listing.images[0]}
          alt={listing.title}
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/50 via-transparent to-transparent" />

        <div className="absolute top-3 left-3 flex flex-wrap items-center gap-2">
          <span className="settlla-badge">
            <BadgeCheck className="h-3 w-3" />
            Verified
          </span>
          {aiMatchScore !== undefined && (
            <span className="settlla-badge bg-slate-900/85">
              <Sparkles className="h-3 w-3 text-amber-300" />
              {aiMatchScore}% match
            </span>
          )}
        </div>

        {listing.images.length > 1 && (
          <div className="absolute inset-y-0 inset-x-2 flex items-center justify-between opacity-0 transition-opacity group-hover:opacity-100">
            <button
              type="button"
              onClick={handlePrevImage}
              className="flex h-8 w-8 items-center justify-center rounded-full bg-white/95 text-slate-800 shadow-md hover:bg-white"
              aria-label="Previous image"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={handleNextImage}
              className="flex h-8 w-8 items-center justify-center rounded-full bg-white/95 text-slate-800 shadow-md hover:bg-white"
              aria-label="Next image"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        )}

        <div className="absolute bottom-3 left-3 right-3 flex items-end justify-between gap-2">
          <div className="rounded-lg bg-slate-900/85 px-3 py-1.5 text-white backdrop-blur-sm">
            <p className="text-[11px] text-slate-300">Annual rent</p>
            <p className="text-sm font-semibold tabular-nums">
              {formatNaira(listing.pricing.annual_rent)}
              <span className="text-xs font-normal text-slate-400"> /yr</span>
            </p>
          </div>
          <span className="settlla-badge bg-black/50">
            <Camera className="h-3 w-3" />
            {activeImageIdx + 1}/{listing.images.length}
          </span>
        </div>
      </div>

      <div className="flex flex-1 flex-col gap-3 p-4">
        <div className="space-y-1.5">
          {aiHighlightReason && (
            <p className="text-caption line-clamp-1 text-amber-800">
              <Sparkles className="mr-1 inline h-3.5 w-3.5 text-amber-600" />
              {aiHighlightReason}
            </p>
          )}
          <p className="text-overline text-slate-500">
            {listing.neighborhood} · {listing.zone}
          </p>
          <h3
            onClick={() => onSelect(listing)}
            className="text-h3 cursor-pointer line-clamp-2 transition-colors group-hover:text-blue-600"
          >
            {listing.title}
          </h3>
          <p className="flex items-center gap-3 text-caption text-slate-600">
            <span className="inline-flex items-center gap-1">
              <Bed className="h-3.5 w-3.5 text-slate-400" aria-hidden />
              {listing.bedrooms} bed
            </span>
            <span className="inline-flex items-center gap-1">
              <Bath className="h-3.5 w-3.5 text-slate-400" aria-hidden />
              {listing.bathrooms} bath
            </span>
          </p>
          <p className="flex items-center gap-1.5 text-caption text-slate-500">
            <MapPin className="h-3.5 w-3.5 shrink-0 text-blue-600" />
            <span className="line-clamp-1">{listing.commute_badge}</span>
          </p>
        </div>

        <div className="mt-auto space-y-3 border-t border-slate-100 pt-3">
          <div className="flex items-baseline justify-between gap-2">
            <span className="text-caption font-medium text-slate-500">Total move-in</span>
            <span className="text-base font-semibold tabular-nums text-blue-700">
              {formatNaira(listing.pricing.total_move_in_cost)}
            </span>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <Button variant="primary" size="md" fullWidth onClick={() => onSelect(listing)}>
              <Eye className="h-4 w-4" />
              View Details
            </Button>
            <Button
              variant="secondary"
              size="md"
              fullWidth
              onClick={() => (onBookInspection ? onBookInspection(listing) : onSelect(listing))}
            >
              <Calendar className="h-4 w-4 text-slate-500" />
              Book Tour
            </Button>
          </div>
        </div>
      </div>
    </article>
  );
};
