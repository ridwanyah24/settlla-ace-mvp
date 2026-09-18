"use client";

import React from "react";
import Image from "next/image";
import { Button } from "./ui/Button";
import {
  HeroFiltersModal,
  countActiveHeroFilters,
  type HeroFiltersState,
} from "./HeroFiltersModal";
import {
  ShieldCheck,
  Search,
  CheckCircle2,
  Sparkles,
  Zap,
  SlidersHorizontal,
  ChevronDown,
} from "lucide-react";
import { cn } from "@/lib/cn";

interface HeroSectionProps extends HeroFiltersState {
  setNeighborhood: (val: string) => void;
  setMaxBudget: (val: string) => void;
  setPropertyType: (val: string) => void;
  setMinBedrooms: (val: string) => void;
  setMaxMoveInCost: (val: string) => void;
  setQuickFilter: (val: string) => void;
  onResetFilters: () => void;
  onSearch: () => void;
  onOpenAISearch?: (initialQuery?: string) => void;
}

const TRY_PROMPTS = [
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
] as const;

function countExtraFilters(state: HeroFiltersState): number {
  let n = countActiveHeroFilters(state);
  if (state.neighborhood !== "all") n--;
  if (state.propertyType !== "all") n--;
  if (state.maxBudget !== "all") n--;
  return n;
}

function HeroBrowseSelect({
  id,
  value,
  onChange,
  "aria-label": ariaLabel,
  className,
  children,
}: {
  id: string;
  value: string;
  onChange: (val: string) => void;
  "aria-label": string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div
      className={cn(
        "settlla-panel-muted relative min-w-[9.5rem] shrink-0 focus-within:border-blue-500 focus-within:bg-white",
        className
      )}
    >
      <select
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        aria-label={ariaLabel}
        className="w-full cursor-pointer appearance-none bg-transparent py-2.5 pl-3 pr-8 text-xs font-semibold text-slate-900 outline-none sm:py-3 sm:text-sm"
      >
        {children}
      </select>
      <ChevronDown
        className="pointer-events-none absolute right-2 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
        aria-hidden
      />
    </div>
  );
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
  const [searchMode, setSearchMode] = React.useState<"ai" | "browse">("ai");
  const [aiPromptInput, setAiPromptInput] = React.useState("");
  const [filtersModalOpen, setFiltersModalOpen] = React.useState(false);

  const filterState: HeroFiltersState = {
    neighborhood,
    maxBudget,
    propertyType,
    minBedrooms,
    maxMoveInCost,
    quickFilter,
  };

  const extraFilterCount = countExtraFilters(filterState);

  const resolveQuery = (prompt: string) => {
    const trimmed = prompt.trim();
    return trimmed || "verified Kaduna apartments";
  };

  const handleAISubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    onOpenAISearch?.(resolveQuery(aiPromptInput));
  };

  const handleBrowseSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    onSearch();
  };

  const filterButton = (
    <button
      type="button"
      onClick={() => setFiltersModalOpen(true)}
      aria-label={`More filters${extraFilterCount ? `, ${extraFilterCount} active` : ""}`}
      className={cn(
        "btn btn-md relative h-auto shrink-0 self-stretch border py-2.5 sm:py-3",
        extraFilterCount > 0 ? "btn-soft border-blue-300" : "btn-secondary"
      )}
    >
      <SlidersHorizontal className="h-4 w-4" />
      <span className="hidden sm:inline">Filters</span>
      {extraFilterCount > 0 && (
        <span className="absolute -right-1.5 -top-1.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-blue-600 px-1 text-[10px] font-bold text-white ring-2 ring-white">
          {extraFilterCount}
        </span>
      )}
    </button>
  );

  return (
    <section id="hero" className="relative w-full overflow-hidden scroll-mt-24 py-10 sm:py-20 lg:py-24">
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

        <h1 className="mx-auto max-w-4xl px-1 text-[1.75rem] font-black leading-[1.15] tracking-tight text-slate-900 sm:text-5xl sm:leading-[1.1] md:text-6xl lg:text-7xl">
          Rent <span className="text-blue-600">Smarter.</span> Pay{" "}
          <span className="text-blue-600">Safer.</span> <br className="hidden sm:block" />
          Live{" "}
          <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
            Better.
          </span>
        </h1>

        <p className="mx-auto mb-8 mt-4 max-w-2xl px-1 text-base font-medium leading-relaxed text-slate-600 sm:mb-10 sm:mt-5 sm:px-6 sm:text-lg">
          Find vetted apartments in Kaduna with transparent pricing, zero hidden fees, and verified
          landlords.
        </p>

        <div className="settlla-card mx-auto max-w-5xl p-4 text-left shadow-[var(--shadow-lg)] sm:p-6 lg:p-8">
          <div className="mb-5 flex flex-col justify-between gap-4 border-b border-slate-100 pb-4 sm:flex-row sm:items-center">
            <div className="inline-flex max-w-full flex-wrap items-center rounded-xl border border-slate-200 bg-slate-100 p-1">
              <button
                type="button"
                onClick={() => setSearchMode("ai")}
                className={cn(
                  "relative flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-semibold transition-colors sm:gap-2 sm:px-4 sm:text-sm",
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
                onClick={() => setSearchMode("browse")}
                className={cn(
                  "relative flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-semibold transition-colors sm:gap-2 sm:px-4 sm:text-sm",
                  searchMode === "browse"
                    ? "bg-white text-slate-900 shadow-sm"
                    : "text-slate-600 hover:text-slate-900"
                )}
              >
                <Search className="h-4 w-4 text-slate-500" />
                Browse
              </button>
            </div>

            <span className="settlla-chip border-emerald-200 bg-emerald-50 text-emerald-800 shrink-0">
              <CheckCircle2 className="h-3.5 w-3.5" />
              ₦0 inspection
            </span>
          </div>

          {searchMode === "ai" ? (
            <div className="space-y-3.5 text-left">
              <p className="text-xs text-slate-500 sm:text-sm">
                Describe what you want — area, budget, beds, amenities. Settlla AI handles the rest.
              </p>
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
                    placeholder="Ask Settlla AI: e.g. '2-bed in Barnawa under 300k'"
                    className="settlla-input !pl-11"
                  />
                </div>
                <Button type="submit" variant="primary" size="lg" className="min-w-[100px] shrink-0">
                  <Sparkles className="h-4 w-4" />
                  Search
                </Button>
              </form>

              <div className="flex flex-wrap items-center gap-2 text-xs">
                <span className="text-overline shrink-0 text-slate-500">
                  <Zap className="mr-1 inline h-3 w-3" />
                  Try
                </span>
                {TRY_PROMPTS.map((item) => (
                  <button
                    key={item.label}
                    type="button"
                    onClick={() => {
                      setAiPromptInput(item.query);
                      onOpenAISearch?.(item.query);
                    }}
                    className="settlla-chip hover:border-blue-300 hover:bg-blue-50 hover:text-blue-800"
                  >
                    <span>{item.emoji}</span>
                    <span>{item.label}</span>
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="space-y-3 text-left">
              <p className="text-xs text-slate-500 sm:text-sm">
                Set location, type, and budget inline — use{" "}
                <span className="font-semibold text-slate-700">Filters</span> for bedrooms, move-in total,
                and amenities.
              </p>

              <form
                onSubmit={handleBrowseSubmit}
                className="flex flex-nowrap items-stretch gap-2 overflow-x-auto pb-0.5 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
              >
                <HeroBrowseSelect
                  id="hero-main-location"
                  value={neighborhood}
                  onChange={setNeighborhood}
                  aria-label="Location"
                  className="min-w-[11rem] flex-[1.2] sm:min-w-[12rem]"
                >
                  <option value="all">All Kaduna (Barnawa &amp; Malali)</option>
                  <option value="Barnawa">Barnawa (GRA &amp; Phase 1)</option>
                  <option value="Malali">Malali (Low Cost &amp; GRA Ext)</option>
                </HeroBrowseSelect>

                <HeroBrowseSelect
                  id="hero-property-type"
                  value={propertyType}
                  onChange={setPropertyType}
                  aria-label="Property type"
                  className="min-w-[9rem] flex-1"
                >
                  <option value="all">All types</option>
                  <option value="Mini-flat">Studio / Mini-flat</option>
                  <option value="1-Bedroom Flat">1-Bedroom</option>
                  <option value="2-Bedroom Flat">2-Bedroom</option>
                  <option value="3-Bedroom Flat">3-Bedroom</option>
                </HeroBrowseSelect>

                <HeroBrowseSelect
                  id="hero-max-rent"
                  value={maxBudget}
                  onChange={setMaxBudget}
                  aria-label="Max annual rent"
                  className="min-w-[9rem] flex-1"
                >
                  <option value="all">Any rent</option>
                  <option value="200000">≤ ₦200k / yr</option>
                  <option value="250000">≤ ₦250k / yr</option>
                  <option value="300000">≤ ₦300k / yr</option>
                  <option value="350000">≤ ₦350k / yr</option>
                  <option value="450000">≤ ₦450k / yr</option>
                </HeroBrowseSelect>

                {filterButton}
                <Button
                  type="submit"
                  variant="primary"
                  size="lg"
                  className="h-auto shrink-0 px-4 sm:min-w-[7.5rem]"
                >
                  <Search className="h-4 w-4" />
                  Search
                </Button>
              </form>
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
