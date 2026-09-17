"use client";

import React from "react";
import Image from "next/image";
import { Button } from "./ui/Button";
import {
  HeroFiltersModal,
  AMENITY_QUICK_FILTERS,
  countActiveHeroFilters,
} from "./HeroFiltersModal";
import {
  ShieldCheck,
  Search,
  CheckCircle2,
  Sparkles,
  Zap,
  SlidersHorizontal,
} from "lucide-react";
import { cn } from "@/lib/cn";

/** Shown on the hero — one-tap toggles; everything else lives in the filters modal. */
const SURFACE_QUICK_FILTERS = [
  {
    id: "barnawa",
    label: "Barnawa",
    isActive: (s: SurfaceFilterState) => s.neighborhood === "Barnawa",
    toggle: (s: SurfaceFilterState, setters: SurfaceFilterSetters) => {
      setters.setNeighborhood(s.neighborhood === "Barnawa" ? "all" : "Barnawa");
    },
  },
  {
    id: "under-300k",
    label: "≤ ₦300k / yr",
    isActive: (s: SurfaceFilterState) => s.maxBudget === "300000",
    toggle: (s: SurfaceFilterState, setters: SurfaceFilterSetters) => {
      setters.setMaxBudget(s.maxBudget === "300000" ? "all" : "300000");
    },
  },
  {
    id: "no-caution",
    label: "₦0 caution",
    isActive: (s: SurfaceFilterState) => s.quickFilter === "no-caution",
    toggle: (s: SurfaceFilterState, setters: SurfaceFilterSetters) => {
      setters.setQuickFilter(s.quickFilter === "no-caution" ? "all" : "no-caution");
    },
  },
] as const;

type SurfaceFilterState = {
  neighborhood: string;
  maxBudget: string;
  quickFilter: string;
};

type SurfaceFilterSetters = {
  setNeighborhood: (val: string) => void;
  setMaxBudget: (val: string) => void;
  setQuickFilter: (val: string) => void;
};

interface HeroSectionProps {
  neighborhood: string;
  setNeighborhood: (val: string) => void;
  maxBudget: string;
  setMaxBudget: (val: string) => void;
  propertyType: string;
  setPropertyType: (val: string) => void;
  minBedrooms: string;
  setMinBedrooms: (val: string) => void;
  maxMoveInCost: string;
  setMaxMoveInCost: (val: string) => void;
  quickFilter: string;
  setQuickFilter: (val: string) => void;
  onResetFilters: () => void;
  onSearch: () => void;
  onOpenAISearch?: (initialQuery?: string) => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({
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
  onSearch,
  onOpenAISearch,
}) => {
  const [searchMode, setSearchMode] = React.useState<"ai" | "manual">("ai");
  const [aiPromptInput, setAiPromptInput] = React.useState("");
  const [filtersModalOpen, setFiltersModalOpen] = React.useState(false);

  const filterState = {
    neighborhood,
    maxBudget,
    propertyType,
    minBedrooms,
    maxMoveInCost,
    quickFilter,
  };

  const activeFilterCount = countActiveHeroFilters(filterState);

  const surfaceState: SurfaceFilterState = { neighborhood, maxBudget, quickFilter };
  const surfaceSetters: SurfaceFilterSetters = {
    setNeighborhood,
    setMaxBudget,
    setQuickFilter,
  };

  const buildEnrichedAIQuery = (prompt: string) => {
    const parts: string[] = [];
    if (prompt.trim()) parts.push(prompt.trim());
    if (neighborhood !== "all") parts.push(`in ${neighborhood}`);
    if (propertyType !== "all") parts.push(propertyType);
    if (minBedrooms !== "all") parts.push(`${minBedrooms}+ bedrooms`);
    if (maxBudget !== "all") {
      parts.push(`annual rent up to ₦${Number(maxBudget).toLocaleString("en-NG")}`);
    }
    if (maxMoveInCost !== "all") {
      parts.push(
        `total move-in up to ₦${Number(maxMoveInCost).toLocaleString("en-NG")}`
      );
    }
    if (quickFilter !== "all") {
      const chip = AMENITY_QUICK_FILTERS.find((c) => c.id === quickFilter);
      if (chip) parts.push(chip.label);
    }
    return parts.length > 0 ? parts.join(", ") : "verified Kaduna apartments";
  };

  const handleAISubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    onOpenAISearch?.(buildEnrichedAIQuery(aiPromptInput));
  };

  const filterIconButton = (
    <button
      type="button"
      onClick={() => setFiltersModalOpen(true)}
      aria-label={`All filters${activeFilterCount ? `, ${activeFilterCount} active` : ""}`}
      className={cn(
        "btn btn-md relative shrink-0 border",
        activeFilterCount > 0 ? "btn-soft border-blue-300" : "btn-secondary"
      )}
    >
      <SlidersHorizontal className="h-4 w-4" />
      <span className="hidden sm:inline">Filters</span>
      {activeFilterCount > 0 && (
        <span className="absolute -right-1.5 -top-1.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-blue-600 px-1 text-[10px] font-bold text-white ring-2 ring-white">
          {activeFilterCount}
        </span>
      )}
    </button>
  );

  const surfaceQuickChips = (
    <div className="flex flex-wrap items-center gap-2">
      {SURFACE_QUICK_FILTERS.map((chip) => {
        const active = chip.isActive(surfaceState);
        return (
          <button
            key={chip.id}
            type="button"
            onClick={() => chip.toggle(surfaceState, surfaceSetters)}
            className={cn("settlla-chip whitespace-nowrap", active && "settlla-chip-active")}
          >
            {chip.label}
          </button>
        );
      })}
    </div>
  );

  const browseFiltersRow = (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex flex-wrap items-center gap-2">
        {filterIconButton}
        {surfaceQuickChips}
      </div>
      <Button type="button" variant="primary" size="lg" onClick={onSearch} className="shrink-0">
        <Search className="h-4 w-4" />
        Find homes
      </Button>
    </div>
  );

  return (
    <section id="hero" className="relative w-full overflow-hidden scroll-mt-24 py-16 sm:py-20 lg:py-24">
      <div className="absolute inset-0 z-0">
        <Image
          src="/images/hero.jpg"
          alt="Modern Kaduna Apartment Interior"
          fill
          priority
          className="object-cover object-center brightness-90"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-white/96 via-white/90 to-[var(--background)]" />
      </div>

      <div className="settlla-container relative z-10 text-center">
        <div className="mb-5 inline-flex max-w-full items-center gap-2 rounded-full border border-blue-200 bg-blue-50/90 px-3.5 py-1.5 text-xs font-bold text-blue-700 shadow-xs backdrop-blur-xs sm:mb-6 sm:px-4">
          <span className="h-2 w-2 shrink-0 animate-ping rounded-full bg-blue-600" />
          <ShieldCheck className="h-3.5 w-3.5 shrink-0 text-blue-600" />
          <span className="truncate">Kaduna&apos;s Trusted Platform</span>
          <span className="hidden text-blue-300 sm:inline">•</span>
          <span className="hidden font-medium text-blue-600 sm:inline">Barnawa &amp; Malali Wedge</span>
        </div>

        <h1 className="mx-auto max-w-4xl text-3xl font-black leading-[1.15] tracking-tight text-slate-900 sm:text-5xl sm:leading-[1.1] md:text-6xl lg:text-7xl">
          Rent <span className="text-blue-600">Smarter.</span> Pay{" "}
          <span className="text-blue-600">Safer.</span> <br className="hidden sm:block" />
          Live{" "}
          <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
            Better.
          </span>
        </h1>

        <p className="mx-auto mb-8 mt-4 max-w-2xl px-4 py-2 text-base font-medium leading-relaxed text-slate-600 sm:mb-10 sm:mt-5 sm:px-6 sm:text-lg">
          Find vetted apartments in Kaduna with transparent pricing, zero hidden fees, and verified
          landlords.
        </p>

        <div className="settlla-card mx-auto max-w-5xl p-5 text-left shadow-[var(--shadow-lg)] sm:p-6 lg:p-8">
          <div className="mb-5 flex flex-col justify-between gap-4 border-b border-slate-100 pb-4 sm:flex-row sm:items-center">
            <div className="inline-flex max-w-fit items-center rounded-xl border border-slate-200 bg-slate-100 p-1">
              <button
                type="button"
                onClick={() => setSearchMode("ai")}
                className={cn(
                  "relative flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold transition-colors",
                  searchMode === "ai"
                    ? "bg-blue-600 text-white shadow-sm"
                    : "text-slate-600 hover:text-slate-900"
                )}
              >
                <Sparkles className="h-4 w-4" />
                AI search
              </button>
              <button
                type="button"
                onClick={() => setSearchMode("manual")}
                className={cn(
                  "relative flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold transition-colors",
                  searchMode === "manual"
                    ? "bg-white text-slate-900 shadow-sm"
                    : "text-slate-600 hover:text-slate-900"
                )}
              >
                <Search className="h-4 w-4 text-slate-500" />
                Browse
              </button>
            </div>

            <span className="settlla-chip border-emerald-200 bg-emerald-50 text-emerald-800">
              <CheckCircle2 className="h-3.5 w-3.5" />
              ₦0 inspection
            </span>
          </div>

          {searchMode === "ai" ? (
            <div className="space-y-3.5 text-left">
              <form onSubmit={handleAISubmit} className="flex flex-col items-stretch gap-2.5 sm:flex-row">
                <div className="relative min-w-0 flex-1">
                  <div
                    className="pointer-events-none absolute inset-y-0 left-0 flex w-11 items-center justify-center"
                    aria-hidden
                  >
                    <Sparkles className="h-5 w-5 text-blue-600" />
                  </div>
                  <input
                    type="text"
                    value={aiPromptInput}
                    onChange={(e) => setAiPromptInput(e.target.value)}
                    placeholder="Ask Settlla AI: e.g. 'Student 2-bed in Barnawa under 300k'..."
                    className="settlla-input !pl-11"
                  />
                </div>
                <div className="flex shrink-0 gap-2">
                  {filterIconButton}
                  <Button type="submit" variant="primary" size="lg" className="min-w-[100px]">
                    <Sparkles className="h-4 w-4" />
                    Search
                  </Button>
                </div>
              </form>

              <div className="flex flex-wrap items-center gap-2">{surfaceQuickChips}</div>

              <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none text-xs">
                <span className="text-overline shrink-0 text-slate-500">
                  <Zap className="mr-1 inline h-3 w-3" />
                  Try
                </span>
                {[
                  {
                    emoji: "🎓",
                    label: "Malali Studio ₦200k (NYSC)",
                    query: "affordable studio mini-flat in Malali under 200k for NYSC corper",
                  },
                  {
                    emoji: "⚡",
                    label: "Barnawa 2-bed under ₦300k",
                    query: "2-bedroom in Barnawa near GTBank under 300k with prepaid meter",
                  },
                  {
                    emoji: "🎉",
                    label: "Zero Caution Deposit",
                    query: "verified flat with zero caution deposit for students",
                  },
                  {
                    emoji: "💰",
                    label: "Student Flat under ₦250k",
                    query: "verified flat under 250k in Kaduna with personal meter",
                  },
                ].map((item, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => {
                      setAiPromptInput(item.query);
                      onOpenAISearch?.(buildEnrichedAIQuery(item.query));
                    }}
                    className="settlla-chip shrink-0 hover:border-blue-300 hover:bg-blue-50 hover:text-blue-800"
                  >
                    <span>{item.emoji}</span>
                    <span>{item.label}</span>
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="space-y-4 text-left">
              <p className="text-body text-slate-600">
                Tap quick filters or open{" "}
                <button
                  type="button"
                  onClick={() => setFiltersModalOpen(true)}
                  className="font-semibold text-blue-600 hover:text-blue-800"
                >
                  all filters
                </button>{" "}
                for bedrooms, move-in budget, amenities, and more.
              </p>
              {browseFiltersRow}
            </div>
          )}
        </div>

        <ul className="mt-10 flex flex-wrap items-center justify-center gap-3 text-caption">
          {[
            "₦0 roadside inspection fees",
            "10% caution held in escrow",
            "Direct landlord mandates",
          ].map((item) => (
            <li key={item} className="settlla-chip bg-white/90">
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
              {item}
            </li>
          ))}
        </ul>
      </div>

      <HeroFiltersModal
        isOpen={filtersModalOpen}
        onClose={() => setFiltersModalOpen(false)}
        neighborhood={neighborhood}
        setNeighborhood={setNeighborhood}
        maxBudget={maxBudget}
        setMaxBudget={setMaxBudget}
        propertyType={propertyType}
        setPropertyType={setPropertyType}
        minBedrooms={minBedrooms}
        setMinBedrooms={setMinBedrooms}
        maxMoveInCost={maxMoveInCost}
        setMaxMoveInCost={setMaxMoveInCost}
        quickFilter={quickFilter}
        setQuickFilter={setQuickFilter}
        onResetFilters={onResetFilters}
        onApply={onSearch}
      />
    </section>
  );
};
