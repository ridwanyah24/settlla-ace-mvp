"use client";

import React from "react";
import Image from "next/image";
import {
  ShieldCheck,
  Search,
  MapPin,
  Home,
  CreditCard,
  CheckCircle2,
  Sparkles,
  Zap,
} from "lucide-react";

interface HeroSectionProps {
  neighborhood: string;
  setNeighborhood: (val: string) => void;
  maxBudget: string;
  setMaxBudget: (val: string) => void;
  propertyType: string;
  setPropertyType: (val: string) => void;
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
  onSearch,
  onOpenAISearch,
}) => {
  const [searchMode, setSearchMode] = React.useState<"ai" | "manual">("ai");
  const [aiPromptInput, setAiPromptInput] = React.useState("");

  const handleAISubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (onOpenAISearch) {
      onOpenAISearch(aiPromptInput);
    }
  };
  return (
    <section id="hero" className="relative w-full overflow-hidden bg-slate-900 py-12 sm:py-24 lg:py-28 scroll-mt-24">
      {/* Background Image with Crisp Overlay */}
      <div className="absolute inset-0 z-0">
        <Image
          src="/images/hero.jpg"
          alt="Modern Kaduna Apartment Interior"
          fill
          priority
          className="object-cover object-center brightness-90"
        />
        {/* Soft gradient wash to ensure text readability */}
        <div className="absolute inset-0 bg-gradient-to-b from-white/95 via-white/85 to-slate-50/95"></div>
      </div>

      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
        {/* Top Trust Pill */}
        <div className="inline-flex items-center gap-2 rounded-full bg-blue-50/90 px-3.5 sm:px-4 py-1.5 text-xs font-bold text-blue-700 border border-blue-200 shadow-xs mb-5 sm:mb-6 backdrop-blur-xs max-w-full">
          <span className="flex h-2 w-2 rounded-full bg-blue-600 animate-ping shrink-0"></span>
          <ShieldCheck className="h-3.5 w-3.5 text-blue-600 shrink-0" />
          <span className="truncate">Kaduna's Trusted Platform</span>
          <span className="hidden sm:inline text-blue-300">•</span>
          <span className="hidden sm:inline text-blue-600 font-medium">Barnawa &amp; Malali Wedge</span>
        </div>

        {/* Main Headline */}
        <h1 className="text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-black tracking-tight text-slate-900 leading-[1.15] sm:leading-[1.1]">
          Rent <span className="text-blue-600">Smarter.</span> Pay{" "}
          <span className="text-blue-600">Safer.</span> <br className="hidden sm:block" />
          Live <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">Better.</span>
        </h1>

        {/* Subtitle */}
        <p className="mx-auto mt-4 sm:mt-5 mb-8 sm:mb-10 max-w-2xl px-4 sm:px-6 py-2 text-base sm:text-lg text-slate-600 font-medium leading-relaxed">
          Find vetted apartments in Kaduna with transparent pricing, zero hidden fees, and verified landlords.
        </p>

        {/* Floating Search Bar Card with Dual Modes (AI Search & Standard Filters) */}
        <div className="mx-auto max-w-5xl rounded-3xl bg-white p-5 sm:p-7 lg:p-8 shadow-2xl shadow-blue-950/10 border border-slate-200/80 backdrop-blur-md">
          {/* Top Mode Switcher Bar */}
          <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3.5 border-b border-slate-100 pb-4 text-left">
            {/* Mode Switcher Tabs */}
            <div className="inline-flex items-center rounded-2xl bg-slate-100 p-1.5 border border-slate-200/80 max-w-fit">
              <button
                type="button"
                onClick={() => setSearchMode("ai")}
                className={`flex items-center gap-2 rounded-xl px-4 sm:px-5 py-2.5 text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                  searchMode === "ai"
                    ? "bg-blue-600 text-white shadow-md shadow-blue-600/30"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                <Sparkles className="h-4 w-4 text-amber-300 animate-pulse" />
                <span className="tracking-tight">Settlla AI Natural Search</span>
                <span className="rounded-full bg-white/20 px-2 py-0.5 text-[10px] font-black uppercase tracking-wider">
                  Smart
                </span>
              </button>
              <button
                type="button"
                onClick={() => setSearchMode("manual")}
                className={`flex items-center gap-2 rounded-xl px-4 sm:px-5 py-2.5 text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                  searchMode === "manual"
                    ? "bg-white text-slate-900 shadow-xs border border-slate-200"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                <Search className="h-4 w-4 text-slate-500" />
                <span className="tracking-tight">Standard Filters</span>
              </button>
            </div>

            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-full border border-emerald-200">
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                <span>₦0 Inspection Fee Guarantee</span>
              </span>
            </div>
          </div>

          {/* Mode 1: AI Natural Search Interface */}
          {searchMode === "ai" ? (
            <div className="space-y-3.5 text-left">
              <form onSubmit={handleAISubmit} className="flex flex-col sm:flex-row items-stretch gap-2.5">
                <div className="relative flex-1">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 flex items-center pointer-events-none">
                    <Sparkles className="h-5 w-5 text-blue-600" />
                  </div>
                  <input
                    type="text"
                    value={aiPromptInput}
                    onChange={(e) => setAiPromptInput(e.target.value)}
                    placeholder="Ask Settlla AI: e.g. 'Student 2-bed in Barnawa under 300k' or 'Malali studio 200k for NYSC'..."
                    className="w-full rounded-2xl bg-slate-50 border border-slate-300/80 pl-13 sm:pl-14 pr-4 py-4 sm:py-4.5 text-sm font-semibold text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-blue-600 focus:ring-4 focus:ring-blue-100 outline-none transition-all shadow-xs"
                  />
                </div>
                <button
                  type="submit"
                  className="flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 px-6 sm:px-8 py-4 text-sm font-bold text-white shadow-lg shadow-blue-600/25 hover:shadow-blue-600/35 transition-all cursor-pointer shrink-0"
                >
                  <Sparkles className="h-4 w-4 text-amber-300" />
                  <span>Search with AI</span>
                </button>
              </form>

              {/* Quick Prompt Badges */}
              <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none text-xs">
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider shrink-0 flex items-center gap-1">
                  <Zap className="h-3 w-3 text-amber-500" />
                  Try prompt:
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
                      if (onOpenAISearch) {
                        onOpenAISearch(item.query);
                      }
                    }}
                    className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 hover:bg-blue-50 border border-slate-200/80 hover:border-blue-300 px-3 py-1 font-semibold text-slate-700 hover:text-blue-700 transition-all shrink-0 cursor-pointer text-xs"
                  >
                    <span>{item.emoji}</span>
                    <span>{item.label}</span>
                  </button>
                ))}
              </div>
            </div>
          ) : (
            /* Mode 2: Standard Select Dropdowns */
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4 text-left">
              {/* 1. Location */}
              <div className="rounded-2xl bg-slate-50 p-3 border border-slate-200/60 focus-within:border-blue-500 focus-within:bg-white transition-all">
                <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1 flex items-center gap-1.5">
                  <MapPin className="h-3.5 w-3.5 text-blue-600" />
                  <span>Location</span>
                </label>
                <select
                  value={neighborhood}
                  onChange={(e) => setNeighborhood(e.target.value)}
                  className="w-full bg-transparent text-sm font-semibold text-slate-900 outline-none cursor-pointer"
                >
                  <option value="all">All Kaduna (Barnawa &amp; Malali)</option>
                  <option value="Barnawa">Barnawa (GRA &amp; Phase 1)</option>
                  <option value="Malali">Malali (Low Cost &amp; GRA Ext)</option>
                </select>
              </div>

              {/* 2. Property Type */}
              <div className="rounded-2xl bg-slate-50 p-3 border border-slate-200/60 focus-within:border-blue-500 focus-within:bg-white transition-all">
                <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1 flex items-center gap-1.5">
                  <Home className="h-3.5 w-3.5 text-blue-600" />
                  <span>Property Type</span>
                </label>
                <select
                  value={propertyType}
                  onChange={(e) => setPropertyType(e.target.value)}
                  className="w-full bg-transparent text-sm font-semibold text-slate-900 outline-none cursor-pointer"
                >
                  <option value="all">All Apartment Types</option>
                  <option value="Mini-flat">Studio / Mini-flat</option>
                  <option value="1-Bedroom Flat">1-Bedroom Flat</option>
                  <option value="2-Bedroom Flat">2-Bedroom Flat</option>
                  <option value="3-Bedroom Flat">3-Bedroom Flat</option>
                </select>
              </div>

              {/* 3. Max Move-In Budget */}
              <div className="rounded-2xl bg-slate-50 p-3 border border-slate-200/60 focus-within:border-blue-500 focus-within:bg-white transition-all">
                <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1 flex items-center gap-1.5">
                  <CreditCard className="h-3.5 w-3.5 text-blue-600" />
                  <span>Max Move-In Budget</span>
                </label>
                <select
                  value={maxBudget}
                  onChange={(e) => setMaxBudget(e.target.value)}
                  className="w-full bg-transparent text-sm font-semibold text-slate-900 outline-none cursor-pointer"
                >
                  <option value="all">Any Total Cost</option>
                  <option value="250000">Up to ₦250,000</option>
                  <option value="300000">Up to ₦300,000</option>
                  <option value="350000">Up to ₦350,000</option>
                  <option value="450000">Up to ₦450,000</option>
                </select>
              </div>

              {/* 4. Search CTA Button */}
              <div className="flex items-stretch">
                <button
                  type="button"
                  onClick={onSearch}
                  className="w-full flex items-center justify-center gap-2 rounded-2xl bg-blue-600 hover:bg-blue-700 px-6 py-3.5 text-sm font-bold text-white shadow-lg shadow-blue-600/30 hover:shadow-blue-600/40 transition-all cursor-pointer"
                >
                  <Search className="h-4 w-4" />
                  <span>Find Home</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Value Prop Micro-Chips */}
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3 sm:gap-6 text-xs font-semibold text-slate-600">
          <div className="flex items-center gap-1.5 rounded-full bg-white/80 px-3.5 py-1.5 border border-slate-200 shadow-2xs backdrop-blur-xs">
            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
            <span>Zero Roadside Inspection Fees</span>
          </div>
          <div className="flex items-center gap-1.5 rounded-full bg-white/80 px-3.5 py-1.5 border border-slate-200 shadow-2xs backdrop-blur-xs">
            <CheckCircle2 className="h-3.5 w-3.5 text-blue-600" />
            <span>10% Caution Kept in Escrow</span>
          </div>
          <div className="flex items-center gap-1.5 rounded-full bg-white/80 px-3.5 py-1.5 border border-slate-200 shadow-2xs backdrop-blur-xs">
            <CheckCircle2 className="h-3.5 w-3.5 text-indigo-600" />
            <span>Direct Landlord Mandates Only</span>
          </div>
        </div>
      </div>
    </section>
  );
};
