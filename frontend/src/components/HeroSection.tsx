"use client";

import React from "react";
import Image from "next/image";

interface HeroSectionProps {
  neighborhood: string;
  setNeighborhood: (val: string) => void;
  maxBudget: string;
  setMaxBudget: (val: string) => void;
  propertyType: string;
  setPropertyType: (val: string) => void;
  onSearch: () => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({
  neighborhood,
  setNeighborhood,
  maxBudget,
  setMaxBudget,
  propertyType,
  setPropertyType,
  onSearch,
}) => {
  return (
    <section id="hero" className="relative w-full overflow-hidden bg-slate-900 py-16 sm:py-24 lg:py-28">
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
        <div className="inline-flex items-center gap-2 rounded-full bg-blue-50/90 px-4 py-1.5 text-xs font-bold text-blue-700 border border-blue-200 shadow-xs mb-6 backdrop-blur-xs">
          <span className="flex h-2 w-2 rounded-full bg-blue-600 animate-ping"></span>
          <span>🛡️ Kaduna's Most Trusted Rental Platform</span>
          <span className="hidden sm:inline text-blue-300">•</span>
          <span className="hidden sm:inline text-blue-600 font-medium">Barnawa &amp; Malali Wedge</span>
        </div>

        {/* Main Headline */}
        <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black tracking-tight text-slate-900 leading-[1.1]">
          Rent <span className="text-blue-600">Smarter.</span> Pay{" "}
          <span className="text-blue-600">Safer.</span> <br className="hidden sm:block" />
          Live <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">Better.</span>
        </h1>

        {/* Subtitle */}
        <p className="mx-auto mt-4 max-w-2xl text-base sm:text-lg text-slate-600 font-medium leading-relaxed">
          Find vetted apartments in Kaduna with transparent pricing, zero hidden fees, and verified landlords.
        </p>

        {/* Floating Search Bar Card */}
        <div className="mx-auto mt-10 max-w-5xl rounded-3xl bg-white p-4 sm:p-6 shadow-2xl shadow-blue-950/10 border border-slate-200/80 backdrop-blur-md">
          <div className="mb-4 flex items-center justify-between border-b border-slate-100 pb-3 text-left">
            <div className="flex items-center gap-2">
              <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-blue-50 text-blue-600 text-xs font-bold">
                🔍
              </span>
              <span className="text-xs sm:text-sm font-bold text-slate-800">
                Search Vetted Kaduna Homes with 100% Upfront Pricing
              </span>
            </div>
            <span className="hidden sm:inline text-[11px] font-semibold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
              ✓ ₦0 Inspection Fee Guarantee
            </span>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4 text-left">
            {/* 1. Location */}
            <div className="rounded-2xl bg-slate-50 p-3 border border-slate-200/60 focus-within:border-blue-500 focus-within:bg-white transition-all">
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1 flex items-center gap-1">
                <span>📍</span> Location
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
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1 flex items-center gap-1">
                <span>🏠</span> Property Type
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
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1 flex items-center gap-1">
                <span>💳</span> Max Move-In Budget
              </label>
              <select
                value={maxBudget}
                onChange={(e) => setMaxBudget(e.target.value)}
                className="w-full bg-transparent text-sm font-semibold text-slate-900 outline-none cursor-pointer"
              >
                <option value="all">Any Total Cost</option>
                <option value="600000">Up to ₦600,000 Total</option>
                <option value="750000">Up to ₦750,000 Total</option>
                <option value="900000">Up to ₦900,000 Total</option>
                <option value="1200000">Up to ₦1,200,000 Total</option>
              </select>
            </div>

            {/* 4. Search CTA Button */}
            <div className="flex items-stretch">
              <button
                type="button"
                onClick={onSearch}
                className="w-full flex items-center justify-center gap-2 rounded-2xl bg-blue-600 hover:bg-blue-700 px-6 py-3.5 text-sm font-bold text-white shadow-lg shadow-blue-600/30 hover:shadow-blue-600/40 transition-all cursor-pointer"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <span>Find Home</span>
              </button>
            </div>
          </div>
        </div>

        {/* Value Prop Micro-Chips */}
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3 sm:gap-6 text-xs font-semibold text-slate-600">
          <div className="flex items-center gap-1.5 rounded-full bg-white/80 px-3.5 py-1.5 border border-slate-200 shadow-2xs backdrop-blur-xs">
            <span className="text-emerald-500 font-bold">✓</span>
            <span>Zero Roadside Inspection Fees</span>
          </div>
          <div className="flex items-center gap-1.5 rounded-full bg-white/80 px-3.5 py-1.5 border border-slate-200 shadow-2xs backdrop-blur-xs">
            <span className="text-blue-500 font-bold">✓</span>
            <span>10% Caution Kept in Escrow</span>
          </div>
          <div className="flex items-center gap-1.5 rounded-full bg-white/80 px-3.5 py-1.5 border border-slate-200 shadow-2xs backdrop-blur-xs">
            <span className="text-indigo-500 font-bold">✓</span>
            <span>Direct Landlord Mandates Only</span>
          </div>
        </div>
      </div>
    </section>
  );
};
