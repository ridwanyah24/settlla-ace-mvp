"use client";

import React, { useState } from "react";

interface NavbarProps {
  verifiedCount: number;
  pendingManagerSignatures?: number;
  onOpenManagerDesk?: () => void;
  activeEscrowStatus?: string;
  onOpenEscrowDashboard?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  verifiedCount,
  pendingManagerSignatures = 0,
  onOpenManagerDesk,
  activeEscrowStatus,
  onOpenEscrowDashboard,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const scrollTo = (id: string) => {
    setMobileMenuOpen(false);
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <header className="sticky top-0 z-40 w-full shadow-xs bg-white">
      {/* 1. Top Announcement Strip (Dark Navy) */}
      <div className="bg-[#0B1528] text-slate-300 text-xs py-2 px-4 sm:px-6 lg:px-8 border-b border-slate-800">
        <div className="mx-auto max-w-7xl flex flex-col sm:flex-row items-center justify-between gap-2">
          {/* Left Contact & Location */}
          <div className="flex items-center gap-4 text-[11px] sm:text-xs">
            <span className="flex items-center gap-1.5 text-slate-300">
              <span className="text-blue-400">📞</span>
              <span className="font-semibold text-white">+234 800 SETTLLA</span>
              <span className="text-slate-500 hidden md:inline">|</span>
              <span className="hidden md:inline text-slate-400">0800 738 8552 (Toll Free)</span>
            </span>
            <span className="hidden lg:flex items-center gap-1 text-slate-400">
              <span className="text-blue-400">📍</span>
              <span>Kaduna Hub: Barnawa GRA &amp; Malali</span>
            </span>
          </div>

          {/* Right Trust Indicators */}
          <div className="flex items-center gap-3 text-[11px] sm:text-xs font-medium">
            <span className="flex items-center gap-1 text-emerald-400">
              <span>✓</span> ₦0 Inspection Fee
            </span>
            <span className="text-slate-600">•</span>
            <span className="flex items-center gap-1 text-blue-300">
              <span>🛡️</span> HB&amp;A Mandates Only
            </span>
            <span className="text-slate-600">•</span>
            <span className="flex items-center gap-1 text-amber-300">
              <span>🔒</span> 10% Caution Escrow
            </span>
          </div>
        </div>
      </div>

      {/* 2. Main Navigation Bar (Clean White) */}
      <nav className="border-b border-slate-200/80 bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3.5 sm:px-6 lg:px-8">
          {/* Brand Logo */}
          <div
            onClick={() => scrollTo("hero")}
            className="flex items-center gap-2.5 cursor-pointer select-none group"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 text-white shadow-md shadow-blue-500/25 group-hover:bg-blue-700 transition-colors">
              <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-2xl font-black tracking-tight text-slate-900">Settlla</span>
                <span className="rounded-md bg-blue-50 px-2 py-0.5 text-[10px] font-bold text-blue-700 border border-blue-200">
                  Kaduna
                </span>
              </div>
              <p className="text-[11px] font-medium text-slate-500 hidden sm:block">
                Vetted Rentals • 100% Upfront Pricing
              </p>
            </div>
          </div>

          {/* Desktop Navigation Links */}
          <div className="hidden lg:flex items-center gap-8 text-sm font-semibold text-slate-600">
            <button
              onClick={() => scrollTo("hero")}
              className="text-blue-600 hover:text-blue-700 transition-colors py-1 relative after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-blue-600"
            >
              Home
            </button>
            <button
              onClick={() => scrollTo("featured-properties")}
              className="hover:text-blue-600 transition-colors py-1 flex items-center gap-1.5"
            >
              <span>Vetted Feed</span>
              <span className="rounded-full bg-emerald-100 text-emerald-800 text-[10px] px-2 py-0.5 font-bold">
                {verifiedCount} Homes
              </span>
            </button>
            <button
              onClick={() => scrollTo("how-it-works")}
              className="hover:text-blue-600 transition-colors py-1"
            >
              How It Works
            </button>
            <button
              onClick={() => scrollTo("pricing-plans")}
              className="hover:text-blue-600 transition-colors py-1"
            >
              Pricing Transparency
            </button>
            <button
              onClick={() => scrollTo("why-settlla")}
              className="hover:text-blue-600 transition-colors py-1"
            >
              Why Settlla
            </button>
            <button
              onClick={() => scrollTo("faq-section")}
              className="hover:text-blue-600 transition-colors py-1"
            >
              FAQs
            </button>
          </div>

          {/* Right Action Buttons */}
          <div className="flex items-center gap-2.5">
            {onOpenEscrowDashboard && (
              <button
                type="button"
                onClick={onOpenEscrowDashboard}
                className="flex items-center gap-1.5 rounded-xl border border-emerald-300 bg-emerald-50 hover:bg-emerald-100 px-3 py-2 text-xs font-bold text-emerald-900 transition-colors cursor-pointer"
                title="Open Move-In Escrow Protection & Tenancy Status Dashboard (Screen 8)"
              >
                <span>🛡️</span>
                <span className="hidden sm:inline">Move-In Escrow</span>
                {activeEscrowStatus === "holding" && (
                  <span className="rounded-full bg-emerald-600 text-white text-[9px] px-1.5 py-0.2 font-black">
                    Active
                  </span>
                )}
                {activeEscrowStatus === "disputed_frozen" && (
                  <span className="rounded-full bg-rose-600 text-white text-[9px] px-1.5 py-0.2 font-black animate-ping">
                    Frozen
                  </span>
                )}
              </button>
            )}

            {onOpenManagerDesk && (
              <button
                type="button"
                onClick={onOpenManagerDesk}
                className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 px-3 py-2 text-xs font-bold text-slate-800 transition-colors cursor-pointer"
                title="Open Property Manager Mandate Counter-Signing Desk (Screen 6)"
              >
                <span>⚖️</span>
                <span className="hidden sm:inline">Manager Desk</span>
                {pendingManagerSignatures > 0 && (
                  <span className="rounded-full bg-amber-500 text-white text-[10px] px-1.5 py-0.2 font-black animate-pulse">
                    {pendingManagerSignatures}
                  </span>
                )}
              </button>
            )}

            <button
              onClick={() => scrollTo("featured-properties")}
              className="rounded-xl bg-blue-600 hover:bg-blue-700 px-4 py-2 sm:px-5 sm:py-2.5 text-xs sm:text-sm font-bold text-white shadow-md shadow-blue-600/25 transition-all hover:shadow-lg hover:shadow-blue-600/35"
            >
              Browse Verified Feed
            </button>

            {/* Mobile Hamburger */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-100"
              aria-label="Toggle Navigation Menu"
            >
              {mobileMenuOpen ? (
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </button>
          </div>
        </div>

        {/* Mobile Dropdown Menu */}
        {mobileMenuOpen && (
          <div className="lg:hidden border-t border-slate-200 bg-white px-4 py-4 space-y-3 shadow-lg">
            <button
              onClick={() => scrollTo("hero")}
              className="block w-full text-left font-semibold text-slate-800 py-2 border-b border-slate-100"
            >
              Home
            </button>
            <button
              onClick={() => scrollTo("featured-properties")}
              className="block w-full text-left font-semibold text-blue-600 py-2 border-b border-slate-100 flex items-center justify-between"
            >
              <span>Vetted Feed</span>
              <span className="rounded-full bg-emerald-100 text-emerald-800 text-xs px-2 py-0.5 font-bold">
                {verifiedCount} Verified
              </span>
            </button>
            <button
              onClick={() => scrollTo("how-it-works")}
              className="block w-full text-left font-semibold text-slate-800 py-2 border-b border-slate-100"
            >
              How It Works
            </button>
            <button
              onClick={() => scrollTo("pricing-plans")}
              className="block w-full text-left font-semibold text-slate-800 py-2 border-b border-slate-100"
            >
              Pricing Transparency
            </button>
            <button
              onClick={() => scrollTo("why-settlla")}
              className="block w-full text-left font-semibold text-slate-800 py-2 border-b border-slate-100"
            >
              Why Settlla
            </button>
            <button
              onClick={() => scrollTo("faq-section")}
              className="block w-full text-left font-semibold text-slate-800 py-2"
            >
              FAQs
            </button>
            <div className="pt-2">
              <a
                href="tel:+2348007388552"
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-slate-100 py-2.5 text-xs font-bold text-slate-800"
              >
                <span>📞 Call Kaduna Hub: 0800 738 8552</span>
              </a>
            </div>
          </div>
        )}
      </nav>
    </header>
  );
};
