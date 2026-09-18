"use client";

import React, { useEffect } from "react";
import { Button } from "./ui/Button";
import {
  X,
  MapPin,
  Home,
  BedDouble,
  Wallet,
  ShieldCheck,
  Tag,
  Droplets,
  Zap,
  RotateCcw,
} from "lucide-react";
import { cn } from "@/lib/cn";

export const AMENITY_QUICK_FILTERS = [
  { id: "all", label: "No extra filter", icon: Home },
  { id: "no-caution", label: "₦0 caution deposit", icon: ShieldCheck },
  { id: "under-300k", label: "Rent under ₦300k/yr", icon: Tag },
  { id: "near-gtbank", label: "Near GTBank", icon: MapPin },
  { id: "borehole", label: "Borehole water", icon: Droplets },
  { id: "prepaid", label: "Prepaid / self-billed meter", icon: Zap },
  { id: "2beds", label: "2+ bedrooms", icon: BedDouble },
] as const;

export interface HeroFiltersState {
  neighborhood: string;
  maxBudget: string;
  propertyType: string;
  minBedrooms: string;
  maxMoveInCost: string;
  quickFilter: string;
}

interface HeroFiltersModalProps extends HeroFiltersState {
  isOpen: boolean;
  onClose: () => void;
  setNeighborhood: (val: string) => void;
  setMaxBudget: (val: string) => void;
  setPropertyType: (val: string) => void;
  setMinBedrooms: (val: string) => void;
  setMaxMoveInCost: (val: string) => void;
  setQuickFilter: (val: string) => void;
  onResetFilters: () => void;
  onApply: () => void;
}

export function countActiveHeroFilters(state: HeroFiltersState): number {
  let n = 0;
  if (state.neighborhood !== "all") n++;
  if (state.maxBudget !== "all") n++;
  if (state.propertyType !== "all") n++;
  if (state.minBedrooms !== "all") n++;
  if (state.maxMoveInCost !== "all") n++;
  if (state.quickFilter !== "all") n++;
  return n;
}

export const HeroFiltersModal: React.FC<HeroFiltersModalProps> = ({
  isOpen,
  onClose,
  neighborhood,
  setNeighborhood,
  maxBudget,
  setMaxBudget,
  propertyType,
  setPropertyType,
  minBedrooms,
  setMinBedrooms,
  maxMoveInCost,
  setMaxMoveInCost,
  quickFilter,
  setQuickFilter,
  onResetFilters,
  onApply,
}) => {
  useEffect(() => {
    if (!isOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const hasActive = countActiveHeroFilters({
    neighborhood,
    maxBudget,
    propertyType,
    minBedrooms,
    maxMoveInCost,
    quickFilter,
  }) > 0;

  return (
    <div className="settlla-overlay">
      <div
        className="fixed inset-0 bg-slate-950/50 backdrop-blur-xs animate-fade-in"
        onClick={onClose}
        aria-hidden
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="hero-filters-title"
        className="settlla-dialog settlla-dialog--md"
      >
        <div className="flex shrink-0 items-center justify-between border-b border-slate-100 px-5 py-4">
          <div>
            <h2 id="hero-filters-title" className="text-lg font-bold text-slate-900">
              All filters
            </h2>
            <p className="text-caption text-slate-500">
              Bedrooms, move-in budget, and amenities. Location, type, and rent are on Browse.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-100 text-slate-600 hover:bg-slate-200"
            aria-label="Close filters"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="min-h-0 flex-1 space-y-5 overflow-y-auto px-5 py-5">
          <div>
            <p className="text-overline mb-3 text-slate-500">Bedrooms</p>
            <div className="settlla-panel-muted p-3 focus-within:border-blue-500 focus-within:bg-white">
              <label className="settlla-label">
                <BedDouble className="h-3.5 w-3.5 text-blue-600" />
                <span>Minimum bedrooms</span>
              </label>
              <select
                value={minBedrooms}
                onChange={(e) => setMinBedrooms(e.target.value)}
                className="w-full cursor-pointer bg-transparent text-sm font-semibold text-slate-900 outline-none"
              >
                <option value="all">Any bedroom count</option>
                <option value="1">1+ bedroom</option>
                <option value="2">2+ bedrooms</option>
                <option value="3">3+ bedrooms</option>
              </select>
            </div>
          </div>

          <div>
            <p className="text-overline mb-3 text-slate-500">Move-in budget</p>
            <div className="settlla-panel-muted p-3 focus-within:border-blue-500 focus-within:bg-white">
              <label className="settlla-label">
                <Wallet className="h-3.5 w-3.5 text-blue-600" />
                <span>Max total move-in (all-in)</span>
              </label>
              <select
                value={maxMoveInCost}
                onChange={(e) => setMaxMoveInCost(e.target.value)}
                className="w-full cursor-pointer bg-transparent text-sm font-semibold text-slate-900 outline-none"
              >
                <option value="all">Any move-in total</option>
                <option value="300000">Up to ₦300,000 move-in</option>
                <option value="350000">Up to ₦350,000 move-in</option>
                <option value="450000">Up to ₦450,000 move-in</option>
                <option value="700000">Up to ₦700,000 move-in</option>
              </select>
              <p className="mt-1.5 text-[11px] text-slate-500">
                Includes rent, legal/agency (15%), and caution where applicable.
              </p>
            </div>
          </div>

          <div>
            <p className="text-overline mb-3 text-slate-500">Amenities &amp; concessions</p>
            <div className="flex flex-wrap gap-2">
              {AMENITY_QUICK_FILTERS.map((chip) => {
                const isActive = quickFilter === chip.id;
                const Icon = chip.icon;
                return (
                  <button
                    key={chip.id}
                    type="button"
                    onClick={() =>
                      setQuickFilter(isActive && chip.id !== "all" ? "all" : chip.id)
                    }
                    className={cn(
                      "settlla-chip whitespace-nowrap",
                      isActive && chip.id !== "all" && "settlla-chip-active"
                    )}
                  >
                    <Icon className={cn("h-3.5 w-3.5", !isActive && "text-slate-400")} />
                    {chip.label}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        <div className="flex shrink-0 flex-col gap-2 border-t border-slate-100 bg-white px-5 py-4 sm:flex-row sm:items-center">
          {hasActive && (
            <Button type="button" variant="secondary" size="md" onClick={onResetFilters}>
              <RotateCcw className="h-4 w-4" />
              Reset
            </Button>
          )}
          <Button
            type="button"
            variant="primary"
            size="md"
            fullWidth
            className="sm:flex-1"
            onClick={() => {
              onApply();
              onClose();
            }}
          >
            Show results
          </Button>
        </div>
      </div>
    </div>
  );
};
