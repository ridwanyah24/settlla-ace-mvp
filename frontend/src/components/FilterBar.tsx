"use client";

import React from "react";
import {
  ShieldCheck,
  RotateCcw,
  Home,
  MapPin,
  Tag,
  Droplets,
  Zap,
} from "lucide-react";

interface FilterBarProps {
  neighborhood: string;
  setNeighborhood: (val: string) => void;
  maxBudget: string;
  setMaxBudget: (val: string) => void;
  propertyType: string;
  setPropertyType: (val: string) => void;
  quickFilter: string;
  setQuickFilter: (val: string) => void;
  onReset: () => void;
  totalFound: number;
}

export const FilterBar: React.FC<FilterBarProps> = ({
  neighborhood,
  setNeighborhood,
  maxBudget,
  setMaxBudget,
  propertyType,
  setPropertyType,
  quickFilter,
  setQuickFilter,
  onReset,
  totalFound,
}) => {
  const chips = [
    { id: "all", label: "All Properties", icon: Home },
    { id: "near-gtbank", label: "Near GTBank Barnawa", icon: MapPin },
    { id: "under-700k", label: "Under ₦700k Total", icon: Tag },
    { id: "borehole", label: "Borehole Water", icon: Droplets },
    { id: "prepaid", label: "Prepaid Meter", icon: Zap },
  ];

  const hasActiveFilters =
    neighborhood !== "all" || maxBudget !== "all" || propertyType !== "all" || quickFilter !== "all";

  return (
    <div id="featured-properties" className="mb-8 pt-8 scroll-mt-24">
      {/* Section Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-6 border-b border-slate-200/80 pb-4">
        <div>
          <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-blue-600 mb-1">
            <ShieldCheck className="h-4 w-4" />
            <span>Vetted Residential Feed</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900">
            Featured Properties in Kaduna
          </h2>
          <p className="mt-1 text-xs sm:text-sm text-slate-500 max-w-2xl">
            Direct landlord mandates with HB&amp;A Partners &amp; Co. Every property includes guaranteed ₦0 physical inspection and transparent move-in pricing.
          </p>
        </div>

        {/* Counter and Reset */}
        <div className="flex items-center gap-2.5 sm:gap-3 self-start md:self-end">
          <div className="rounded-xl bg-blue-50 px-3.5 py-1.5 border border-blue-100 text-xs font-bold text-blue-700">
            {totalFound} {totalFound === 1 ? "Property" : "Properties"} Available
          </div>
          {hasActiveFilters && (
            <button
              onClick={onReset}
              className="flex items-center gap-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 px-3.5 py-1.5 text-xs font-bold text-slate-700 transition-colors cursor-pointer"
            >
              <RotateCcw className="h-3.5 w-3.5 text-slate-500" />
              <span>Reset</span>
            </button>
          )}
        </div>
      </div>

      {/* Quick Filter Chips */}
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1 sm:flex-wrap">
        <span className="text-xs font-bold text-slate-400 mr-1 hidden sm:inline">Quick Filter:</span>
        {chips.map((chip) => {
          const isActive = quickFilter === chip.id;
          const IconComponent = chip.icon;
          return (
            <button
              key={chip.id}
              onClick={() => setQuickFilter(isActive ? "all" : chip.id)}
              className={`flex items-center gap-1.5 rounded-full px-3.5 sm:px-4 py-2 text-xs font-bold transition-all cursor-pointer whitespace-nowrap shrink-0 ${
                isActive
                  ? "bg-blue-600 text-white shadow-md shadow-blue-500/20"
                  : "bg-white text-slate-600 hover:bg-slate-50 hover:text-slate-900 border border-slate-200 shadow-2xs"
              }`}
            >
              <IconComponent className={`h-3.5 w-3.5 ${isActive ? "text-white" : "text-slate-500"}`} />
              <span>{chip.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
