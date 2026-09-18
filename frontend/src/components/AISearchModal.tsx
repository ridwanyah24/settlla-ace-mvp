"use client";

import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";
import {
  Sparkles,
  Search,
  X,
  MapPin,
  CheckCircle2,
  ArrowRight,
  TrendingUp,
  ShieldCheck,
  Zap,
  Tag,
  Clock,
  Home,
  ChevronRight,
} from "lucide-react";
import { Button } from "./ui/Button";
import { Listing } from "@/types/listing";
import { AIMatchResult, AISearchCriteria } from "@/types/aiSearch";
import { runAISearch, AI_PROMPT_SUGGESTIONS } from "@/utils/aiSearch";

interface AISearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  listings: Listing[];
  initialQuery?: string;
  onSelectListing: (listing: Listing) => void;
  onBookInspection: (listing: Listing) => void;
  onDirectApply: (listing: Listing) => void;
  onApplyToFeed?: (query: string, filteredListings: Listing[]) => void;
}

export const AISearchModal: React.FC<AISearchModalProps> = ({
  isOpen,
  onClose,
  listings,
  initialQuery = "",
  onSelectListing,
  onBookInspection,
  onDirectApply,
  onApplyToFeed,
}) => {
  const [query, setQuery] = useState(initialQuery);
  const [isSearching, setIsSearching] = useState(false);
  const [parsedCriteria, setParsedCriteria] = useState<AISearchCriteria | null>(null);
  const [results, setResults] = useState<AIMatchResult[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  // Sync initial query when modal opens
  useEffect(() => {
    if (isOpen) {
      if (initialQuery) {
        setQuery(initialQuery);
        executeSearch(initialQuery);
      } else {
        // Run initial empty or default search to show high-rated listings
        executeSearch("");
      }
      setTimeout(() => inputRef.current?.focus(), 80);
    }
  }, [isOpen, initialQuery]);

  // Keyboard shortcut: ESC to close
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  // Lock body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  const executeSearch = (searchQuery: string) => {
    setIsSearching(true);
    // Micro-delay gives a realistic AI reasoning feel
    setTimeout(() => {
      const q = searchQuery.trim();
      const searchData = runAISearch(q || "Kaduna verified flats", listings);
      setParsedCriteria(searchData.criteria);
      setResults(searchData.results);
      setIsSearching(false);
    }, 120);
  };

  const handleQueryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setQuery(val);
    executeSearch(val);
  };

  const handleSelectPrompt = (promptQuery: string) => {
    setQuery(promptQuery);
    executeSearch(promptQuery);
  };

  const handleApplyToFeed = () => {
    if (onApplyToFeed) {
      const filtered = results.map((r) => r.listing);
      onApplyToFeed(query, filtered);
    }
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="settlla-overlay">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-950/70 backdrop-blur-md transition-opacity"
        onClick={onClose}
      />

      {/* Modal Card */}
      <div className="settlla-dialog settlla-dialog--xl">
        <div className="flex min-w-0 items-center justify-between gap-2 border-b border-slate-200 bg-[var(--settlla-navy)] px-4 py-3.5 text-white sm:px-6 sm:py-4">
          <div className="flex min-w-0 items-center gap-3">
            <div className="flex h-9 w-9 sm:h-10 sm:w-10 shrink-0 items-center justify-center rounded-xl bg-blue-600 text-white">
              <Sparkles className="h-5 w-5" />
            </div>
            <div className="min-w-0 text-left">
              <h2 className="text-h3 !text-white truncate">Settlla AI search</h2>
              <p className="text-caption text-slate-300 hidden sm:block">
                Describe budget, area, or amenities in plain English.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/10 hover:bg-white/20 text-white/80 hover:text-white transition-colors cursor-pointer"
            aria-label="Close AI Search"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Search Input Bar */}
        <div className="p-4 sm:p-6 bg-slate-50 border-b border-slate-200">
          <div className="relative flex items-center">
            <div className="absolute left-4 flex items-center pointer-events-none">
              {isSearching ? (
                <div className="h-5 w-5 animate-spin rounded-full border-2 border-blue-600 border-t-transparent" />
              ) : (
                <Sparkles className="h-5 w-5 text-blue-600" />
              )}
            </div>
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={handleQueryChange}
              placeholder="e.g. Quiet 2-bed in Barnawa near GTBank under 800k with prepaid meter..."
              className="w-full rounded-2xl bg-white border border-slate-300 pl-12 pr-12 py-3.5 text-sm sm:text-base font-semibold text-slate-900 placeholder:text-slate-400 focus:border-blue-600 focus:ring-4 focus:ring-blue-100 outline-none shadow-xs transition-all"
            />
            {query && (
              <button
                type="button"
                onClick={() => {
                  setQuery("");
                  executeSearch("");
                }}
                className="absolute right-4 text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
                title="Clear query"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>

          {/* Prompt Recommendations Chips */}
          <div className="mt-3 flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none text-xs">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider shrink-0 flex items-center gap-1">
              <Zap className="h-3 w-3 text-amber-500" />
              Try:
            </span>
            {AI_PROMPT_SUGGESTIONS.map((s) => (
              <button
                key={s.id}
                type="button"
                onClick={() => handleSelectPrompt(s.query)}
                className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 font-semibold text-xs transition-all shrink-0 cursor-pointer ${
                  query === s.query
                    ? "bg-blue-600 text-white shadow-xs"
                    : "bg-white border border-slate-200 text-slate-700 hover:border-blue-300 hover:bg-blue-50/50"
                }`}
              >
                <span>{s.emoji}</span>
                <span>{s.label}</span>
              </button>
            ))}
          </div>

          {/* AI Extracted Criteria Pills */}
          {parsedCriteria && query.trim().length > 0 && (
            <div className="mt-3 pt-3 border-t border-slate-200/80 flex flex-wrap items-center gap-1.5 text-xs">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mr-1">
                AI Extracted:
              </span>
              {parsedCriteria.neighborhood !== "all" && (
                <span className="inline-flex items-center gap-1 rounded-md bg-blue-100 text-blue-800 px-2 py-0.5 font-bold">
                  <MapPin className="h-3 w-3" />
                  {parsedCriteria.neighborhood}
                </span>
              )}
              {parsedCriteria.bedrooms && (
                <span className="inline-flex items-center gap-1 rounded-md bg-indigo-100 text-indigo-800 px-2 py-0.5 font-bold">
                  <Home className="h-3 w-3" />
                  {parsedCriteria.bedrooms} Bedroom{parsedCriteria.bedrooms > 1 ? "s" : ""}
                </span>
              )}
              {parsedCriteria.maxBudget && (
                <span className="inline-flex items-center gap-1 rounded-md bg-emerald-100 text-emerald-800 px-2 py-0.5 font-bold">
                  ≤ ₦{parsedCriteria.maxBudget.toLocaleString()} Rent
                </span>
              )}
              {parsedCriteria.maxTotalCost && (
                <span className="inline-flex items-center gap-1 rounded-md bg-emerald-100 text-emerald-800 px-2 py-0.5 font-bold">
                  ≤ ₦{parsedCriteria.maxTotalCost.toLocaleString()} Move-In
                </span>
              )}
              {parsedCriteria.requiredAmenities.map((amenity) => (
                <span
                  key={amenity}
                  className="inline-flex items-center gap-1 rounded-md bg-slate-200 text-slate-800 px-2 py-0.5 font-bold"
                >
                  <CheckCircle2 className="h-3 w-3 text-emerald-600" />
                  {amenity.replace(/_/g, " ")}
                </span>
              ))}
              {parsedCriteria.commuteAnchors.map((anchor) => (
                <span
                  key={anchor}
                  className="inline-flex items-center gap-1 rounded-md bg-purple-100 text-purple-800 px-2 py-0.5 font-bold"
                >
                  📍 Near {anchor}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Results Body */}
        <div className="min-h-0 flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
          <div className="flex items-center justify-between text-xs font-bold text-slate-500 px-1">
            <span>
              {results.length} Verified Home{results.length !== 1 ? "s" : ""} Found
            </span>
            {results.length > 0 && onApplyToFeed && (
              <button
                type="button"
                onClick={handleApplyToFeed}
                className="text-blue-600 hover:text-blue-700 flex items-center gap-1 cursor-pointer font-bold"
              >
                <span>Apply to Homepage Feed</span>
                <ChevronRight className="h-3.5 w-3.5" />
              </button>
            )}
          </div>

          {results.length === 0 ? (
            <div className="py-12 text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-400 mb-3">
                <Search className="h-6 w-6" />
              </div>
              <h3 className="text-base font-bold text-slate-800">
                No matching verified listings
              </h3>
              <p className="mt-1 text-xs text-slate-500 max-w-sm mx-auto">
                Try broadening your prompt (e.g. increase budget, check all Kaduna, or relax specific amenities).
              </p>
              <button
                type="button"
                onClick={() => {
                  setQuery("");
                  executeSearch("");
                }}
                className="mt-4 rounded-xl bg-blue-600 px-4 py-2 text-xs font-bold text-white hover:bg-blue-700 transition-colors cursor-pointer"
              >
                Reset Search
              </button>
            </div>
          ) : (
            results.map((match) => {
              const { listing, relevanceScore, matchHighlights, isTopMatch } = match;
              return (
                <div
                  key={listing.id}
                  className={`rounded-2xl border transition-all p-4 sm:p-5 ${
                    isTopMatch
                      ? "border-blue-400 bg-gradient-to-r from-blue-50/70 via-indigo-50/40 to-white shadow-md shadow-blue-500/10"
                      : "border-slate-200 bg-white hover:border-slate-300 shadow-xs"
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-start gap-4">
                    {/* Thumbnail */}
                    <div className="relative h-44 sm:h-36 sm:w-48 w-full shrink-0 overflow-hidden rounded-xl bg-slate-100">
                      <Image
                        src={listing.images[0] || "/images/hero.jpg"}
                        alt={listing.title}
                        fill
                        className="object-cover"
                      />
                      {/* Match Badge */}
                      <div className="absolute top-2.5 left-2.5 flex items-center gap-1 rounded-full bg-slate-900/90 backdrop-blur-xs px-2.5 py-1 text-[11px] font-black text-white shadow-xs">
                        <Sparkles className="h-3 w-3 text-amber-400" />
                        <span className="text-emerald-400">{relevanceScore}% Match</span>
                      </div>
                      {isTopMatch && (
                        <div className="absolute bottom-2.5 left-2.5 rounded-md bg-blue-600 px-2 py-0.5 text-[9px] font-black uppercase tracking-wider text-white shadow-xs">
                          Top AI Recommendation
                        </div>
                      )}
                    </div>

                    {/* Listing Content & AI Highlights */}
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div className="flex items-center gap-1.5 text-xs font-bold text-blue-700">
                          <MapPin className="h-3.5 w-3.5" />
                          <span>
                            {listing.neighborhood} • {listing.zone}
                          </span>
                        </div>
                        <div className="text-right">
                          <div className="text-base sm:text-lg font-black text-slate-900">
                            ₦{listing.pricing.annual_rent.toLocaleString()}
                            <span className="text-xs font-medium text-slate-500">/year</span>
                          </div>
                          <div className="text-[10px] font-bold text-slate-500">
                            Total move-in: ₦{listing.pricing.total_move_in_cost.toLocaleString()}
                          </div>
                        </div>
                      </div>

                      <h3 className="mt-1 text-sm sm:text-base font-bold text-slate-900 leading-snug">
                        {listing.title}
                      </h3>

                      <p className="mt-1 text-xs text-slate-500 line-clamp-2">
                        {listing.description}
                      </p>

                      {/* AI Reasoning Box */}
                      <div className="mt-3 rounded-xl bg-slate-50 border border-slate-200/80 p-3">
                        <div className="text-[11px] font-black uppercase tracking-wider text-slate-600 flex items-center gap-1.5 mb-1.5">
                          <Sparkles className="h-3 w-3 text-blue-600" />
                          <span>Why Settlla AI recommends this:</span>
                        </div>
                        <ul className="space-y-1">
                          {matchHighlights.map((highlight, idx) => (
                            <li
                              key={idx}
                              className="text-xs font-medium text-slate-700 flex items-start gap-1.5"
                            >
                              <span className="text-blue-600 font-bold">•</span>
                              <span>{highlight}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      {/* Card Action Buttons */}
                      <div className="mt-4 flex flex-wrap gap-2 border-t border-slate-100 pt-3">
                        <Button
                          type="button"
                          variant="primary"
                          size="sm"
                          className="flex-1 sm:flex-initial"
                          onClick={() => onSelectListing(listing)}
                        >
                          View details
                        </Button>
                        <Button
                          type="button"
                          variant="secondary"
                          size="sm"
                          className="flex-1 sm:flex-initial"
                          onClick={() => onBookInspection(listing)}
                        >
                          Book tour
                        </Button>
                        <Button
                          type="button"
                          variant="soft"
                          size="sm"
                          className="flex-1 sm:flex-initial"
                          onClick={() => onDirectApply(listing)}
                        >
                          Instant rent
                          <ArrowRight className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 text-slate-500 font-medium text-center sm:text-left">
            <ShieldCheck className="h-4 w-4 text-emerald-600 shrink-0" />
            <span>
              All listings vetted by HB&amp;A Partners &amp; Co. (ESVARBON Reg #A2840). ₦0 roadside inspection fees.
            </span>
          </div>
          {results.length > 0 && onApplyToFeed && (
            <button
              type="button"
              onClick={handleApplyToFeed}
              className="w-full sm:w-auto rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold px-4 py-2.5 transition-colors cursor-pointer shrink-0"
            >
              Show matches on homepage
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
