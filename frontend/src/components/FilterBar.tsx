"use client";

import React from "react";
import { Button } from "./ui/Button";
import { ShieldCheck, RotateCcw } from "lucide-react";

interface FilterBarProps {
  neighborhood: string;
  maxBudget: string;
  propertyType: string;
  minBedrooms: string;
  maxMoveInCost: string;
  quickFilter: string;
  onReset: () => void;
  totalFound: number;
}

export const FilterBar: React.FC<FilterBarProps> = ({
  neighborhood,
  maxBudget,
  propertyType,
  minBedrooms,
  maxMoveInCost,
  quickFilter,
  onReset,
  totalFound,
}) => {
  const hasActiveFilters =
    neighborhood !== "all" ||
    maxBudget !== "all" ||
    propertyType !== "all" ||
    minBedrooms !== "all" ||
    maxMoveInCost !== "all" ||
    quickFilter !== "all";

  const activeLabels: string[] = [];
  if (neighborhood !== "all") activeLabels.push(neighborhood);
  if (propertyType !== "all") activeLabels.push(propertyType);
  if (minBedrooms !== "all") activeLabels.push(`${minBedrooms}+ beds`);
  if (maxBudget !== "all") {
    activeLabels.push(`Rent ≤ ₦${Number(maxBudget).toLocaleString("en-NG")}`);
  }
  if (maxMoveInCost !== "all") {
    activeLabels.push(`Move-in ≤ ₦${Number(maxMoveInCost).toLocaleString("en-NG")}`);
  }
  if (quickFilter === "no-caution") activeLabels.push("₦0 caution");
  if (quickFilter === "under-300k") activeLabels.push("Rent < ₦300k");
  if (quickFilter === "near-gtbank") activeLabels.push("Near GTBank");
  if (quickFilter === "borehole") activeLabels.push("Borehole");
  if (quickFilter === "prepaid") activeLabels.push("Prepaid meter");
  if (quickFilter === "2beds") activeLabels.push("2+ beds");

  return (
    <header id="featured-properties" className="scroll-mt-24 pb-8 pt-6">
      <div className="settlla-section-header flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <div className="max-w-2xl space-y-2">
          <p className="text-overline">
            <ShieldCheck className="mr-1 inline h-4 w-4 align-[-2px]" />
            Vetted feed
          </p>
          <h2 className="text-h2">Featured properties in Kaduna</h2>
          <p className="text-body">
            Direct landlord mandates with transparent move-in pricing and ₦0 inspection on every listing.
          </p>
        </div>

        <div className="flex shrink-0 items-center gap-3">
          <span className="settlla-chip border-blue-200 bg-blue-50 text-blue-800">
            {totalFound} {totalFound === 1 ? "home" : "homes"}
          </span>
          {hasActiveFilters && (
            <Button variant="secondary" size="sm" onClick={onReset}>
              <RotateCcw className="h-3.5 w-3.5" />
              Reset
            </Button>
          )}
        </div>
      </div>

      {hasActiveFilters && (
        <div className="mt-4 flex flex-wrap items-center gap-2">
          <span className="text-caption font-medium text-slate-500">Active filters:</span>
          {activeLabels.map((label) => (
            <span
              key={label}
              className="settlla-chip border-blue-200 bg-blue-50/80 text-blue-900"
            >
              {label}
            </span>
          ))}
          <a
            href="#hero"
            className="text-caption font-semibold text-blue-600 hover:text-blue-800"
          >
            Edit filters ↑
          </a>
        </div>
      )}
    </header>
  );
};
