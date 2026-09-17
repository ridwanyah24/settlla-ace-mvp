"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import {
  Phone,
  MapPin,
  CheckCircle2,
  ShieldCheck,
  Lock,
  Home,
  Building2,
  User,
  LogIn,
  UserPlus,
  LogOut,
  Settings,
  Scale,
  Menu,
  X,
  ArrowRight,
} from "lucide-react";

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
  const { currentUser, role, isAuthenticated, switchRole, signOut } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);

  const scrollTo = (id: string) => {
    setMobileMenuOpen(false);
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  const dashboardHref = role === "agent" ? "/dashboard/agent" : "/dashboard/tenant";

  return (
    <header className="sticky top-0 z-40 w-full shadow-xs bg-white">
      {/* 1. Top Announcement Strip (Dark Navy) */}
      <div className="bg-[#0B1528] text-slate-300 text-xs py-2 px-4 sm:px-6 lg:px-8 border-b border-slate-800">
        <div className="mx-auto max-w-7xl flex flex-col sm:flex-row items-center justify-between gap-2">
          {/* Left Contact & Location */}
          <div className="flex items-center gap-4 text-[11px] sm:text-xs">
            <span className="flex items-center gap-1.5 text-slate-300">
              <Phone className="h-3.5 w-3.5 text-blue-400" />
              <span className="font-semibold text-white">+234 800 SETTLLA</span>
              <span className="text-slate-500 hidden md:inline">|</span>
              <span className="hidden md:inline text-slate-400">0800 738 8552 (Toll Free)</span>
            </span>
            <span className="hidden lg:flex items-center gap-1.5 text-slate-400">
              <MapPin className="h-3.5 w-3.5 text-blue-400" />
              <span>Kaduna Hub: Barnawa GRA &amp; Malali</span>
            </span>
          </div>

          {/* Right Trust Indicators */}
          <div className="flex items-center gap-3 text-[11px] sm:text-xs font-medium">
            <span className="flex items-center gap-1 text-emerald-400">
              <CheckCircle2 className="h-3.5 w-3.5" />
              <span>Inspection Optional (₦0)</span>
            </span>
            <span className="text-slate-600">•</span>
            <span className="flex items-center gap-1 text-blue-300">
              <ShieldCheck className="h-3.5 w-3.5" />
              <span>HB&amp;A Mandates Only</span>
            </span>
            <span className="text-slate-600">•</span>
            <span className="flex items-center gap-1 text-amber-300">
              <Lock className="h-3.5 w-3.5" />
              <span>10% Caution Escrow</span>
            </span>
          </div>
        </div>
      </div>

      {/* 2. Main Navigation Bar (Clean White) */}
      <nav className="border-b border-slate-200/80 bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
          {/* Brand Logo */}
          <Link
            href="/"
            className="flex items-center gap-2.5 select-none group"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 text-white shadow-md shadow-blue-500/25 group-hover:bg-blue-700 transition-colors">
              <Home className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-2xl font-black tracking-tight text-slate-900">Settlla</span>
                <span className="rounded-md bg-blue-50 px-2 py-0.5 text-[10px] font-bold text-blue-700 border border-blue-200">
                  Kaduna
                </span>
              </div>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <div className="hidden lg:flex items-center gap-6 text-sm font-semibold text-slate-600">
            <button
              onClick={() => scrollTo("hero")}
              className="text-blue-600 hover:text-blue-700 transition-colors py-1 relative after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-blue-600 cursor-pointer"
            >
              Home
            </button>
            <button
              onClick={() => scrollTo("featured-properties")}
              className="hover:text-blue-600 transition-colors py-1 flex items-center gap-1.5 cursor-pointer"
            >
              <span>Vetted Feed</span>
              <span className="rounded-full bg-emerald-100 text-emerald-800 text-[10px] px-2 py-0.5 font-bold">
                {verifiedCount} Homes
              </span>
            </button>
            <button
              onClick={() => scrollTo("how-it-works")}
              className="hover:text-blue-600 transition-colors py-1 cursor-pointer"
            >
              How It Works
            </button>
            <button
              onClick={() => scrollTo("pricing-plans")}
              className="hover:text-blue-600 transition-colors py-1 cursor-pointer"
            >
              Pricing Transparency
            </button>
            <button
              onClick={() => scrollTo("why-settlla")}
              className="hover:text-blue-600 transition-colors py-1 cursor-pointer"
            >
              Why Settlla
            </button>
          </div>

          {/* Right Action & Auth Navigation */}
          <div className="flex items-center gap-2.5">

            {/* Manager Desk Shortcut (if agent) */}
            {role === "agent" && (
              <Link
                href="/dashboard/agent"
                className="hidden sm:flex items-center gap-1.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 px-3 py-2 text-xs font-bold text-slate-800 transition-colors"
                title="Manager Desk"
              >
                <Scale className="h-3.5 w-3.5 text-slate-700" />
                <span className="hidden md:inline">Desk</span>
                {pendingManagerSignatures > 0 && (
                  <span className="rounded-full bg-amber-500 text-white text-[10px] px-1.5 py-0.2 font-black animate-pulse">
                    {pendingManagerSignatures}
                  </span>
                )}
              </Link>
            )}

            {/* Authenticated User Menu vs Sign In Buttons */}
            {isAuthenticated && currentUser ? (
              <div className="relative">
                <div className="flex items-center gap-1.5">
                  <Link
                    href={dashboardHref}
                    className={`flex items-center gap-2 rounded-xl px-3 py-2 text-xs font-bold transition-all shadow-xs border ${
                      role === "agent"
                        ? "bg-emerald-50 border-emerald-300 text-emerald-900 hover:bg-emerald-100"
                        : "bg-blue-50 border-blue-300 text-blue-900 hover:bg-blue-100"
                    }`}
                  >
                    {role === "agent" ? (
                      <Building2 className="h-4 w-4 text-emerald-700" />
                    ) : (
                      <User className="h-4 w-4 text-blue-700" />
                    )}
                    <div className="text-left hidden sm:block">
                      <div className="text-[11px] font-bold leading-tight truncate max-w-[120px]">
                        {currentUser.fullName}
                      </div>
                      <div
                        className={`text-[9px] uppercase font-black tracking-wider ${
                          role === "agent" ? "text-emerald-700" : "text-blue-700"
                        }`}
                      >
                        {role === "agent" ? "Agent Desk" : "Tenant Dashboard"}
                      </div>
                    </div>
                  </Link>

                  <button
                    type="button"
                    onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                    className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-600 transition-colors cursor-pointer"
                    title="User Settings & Role Switcher"
                  >
                    <Settings className="h-4 w-4" />
                  </button>
                </div>

                {/* User Dropdown */}
                {userDropdownOpen && (
                  <div
                    className="absolute right-0 mt-2 w-64 rounded-2xl border border-slate-200 bg-white p-2 shadow-xl z-50 text-xs animate-fade-in"
                    onClick={() => setUserDropdownOpen(false)}
                  >
                    <div className="p-3 border-b border-slate-100">
                      <div className="font-bold text-slate-900">{currentUser.fullName}</div>
                      <div className="text-[11px] text-slate-500 truncate">{currentUser.email}</div>
                      <span
                        className={`inline-block mt-1 text-[10px] font-bold px-2 py-0.5 rounded-md ${
                          role === "agent"
                            ? "bg-emerald-100 text-emerald-800"
                            : "bg-blue-100 text-blue-800"
                        }`}
                      >
                        Role: {role === "agent" ? "Agent / Property Manager" : "Tenant"}
                      </span>
                    </div>

                    <div className="py-1">
                      <Link
                        href={dashboardHref}
                        className="w-full text-left px-3 py-2 rounded-xl hover:bg-slate-50 font-bold text-slate-800 flex items-center justify-between"
                      >
                        <span>Open {role === "agent" ? "Agent" : "Tenant"} Dashboard</span>
                        <ArrowRight className="h-3.5 w-3.5 text-slate-400" />
                      </Link>

                      <div className="my-1 border-t border-slate-100"></div>

                      <button
                        type="button"
                        onClick={() => signOut()}
                        className="w-full text-left px-3 py-2 rounded-xl hover:bg-rose-50 text-rose-700 font-bold cursor-pointer flex items-center gap-2"
                      >
                        <LogOut className="h-3.5 w-3.5 text-rose-600" />
                        <span>Sign Out</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  href="/login"
                  className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 px-3.5 py-2 text-xs font-bold text-slate-700 transition-colors"
                >
                  <LogIn className="h-3.5 w-3.5 text-slate-600" />
                  <span>Sign In</span>
                </Link>
                <Link
                  href="/signup"
                  className="flex items-center gap-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 px-3.5 py-2 text-xs font-bold text-white shadow-md shadow-blue-600/25 transition-all"
                >
                  <UserPlus className="h-3.5 w-3.5 text-white" />
                  <span>Sign Up</span>
                </Link>
              </div>
            )}

            {/* Mobile Hamburger */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-100 cursor-pointer"
              aria-label="Toggle Navigation Menu"
            >
              {mobileMenuOpen ? (
                <X className="h-5 w-5" />
              ) : (
                <Menu className="h-5 w-5" />
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
              className="block w-full text-left font-semibold text-slate-800 py-2"
            >
              Why Settlla
            </button>

            <div className="pt-2 border-t border-slate-100 space-y-2">
              {isAuthenticated ? (
                <Link
                  href={dashboardHref}
                  className="flex items-center justify-center gap-1.5 w-full rounded-xl bg-blue-600 text-white py-2.5 font-bold text-xs"
                >
                  <User className="h-4 w-4" />
                  <span>Open {role === "agent" ? "Agent" : "Tenant"} Dashboard</span>
                </Link>
              ) : (
                <div className="grid grid-cols-2 gap-2">
                  <Link
                    href="/login"
                    className="flex items-center justify-center gap-1 rounded-xl border border-slate-200 bg-white py-2 text-xs font-bold text-slate-700"
                  >
                    <LogIn className="h-3.5 w-3.5" />
                    <span>Sign In</span>
                  </Link>
                  <Link
                    href="/signup"
                    className="flex items-center justify-center gap-1 rounded-xl bg-blue-600 py-2 text-xs font-bold text-white"
                  >
                    <UserPlus className="h-3.5 w-3.5" />
                    <span>Sign Up</span>
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}
      </nav>
    </header>
  );
};
