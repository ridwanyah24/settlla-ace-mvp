"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
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
  Compass,
  MessageSquare,
  ChevronRight,
  Shield,
  CreditCard,
  HelpCircle,
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
  const pathname = usePathname();
  const router = useRouter();

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false);
    setUserDropdownOpen(false);
  }, [pathname]);

  // Lock body scroll when mobile menu drawer is open
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileMenuOpen]);

  const scrollTo = (id: string) => {
    setMobileMenuOpen(false);
    document.body.style.overflow = "";

    if (pathname === "/") {
      setTimeout(() => {
        const element = document.getElementById(id);
        if (element) {
          element.scrollIntoView({ behavior: "smooth" });
        }
      }, 50);
      return;
    }
    // Cross-page navigation back to homepage section
    router.push(`/#${id}`);
  };

  const dashboardHref = role === "agent" ? "/dashboard/agent" : "/dashboard/tenant";

  return (
    <>
      <header className="sticky top-0 z-40 w-full shadow-xs bg-white">
        {/* 1. Top Announcement Strip */}
        <div className="bg-[#0B1528] text-slate-300 text-xs py-1.5 sm:py-2 px-3 sm:px-6 lg:px-8 border-b border-slate-800">
          <div className="mx-auto max-w-7xl flex items-center justify-between gap-2">
            {/* Left Contact & Location */}
            <div className="flex items-center gap-2 sm:gap-3 text-[11px] sm:text-xs">
              <a
                href="tel:08007388552"
                className="flex items-center gap-1.5 text-slate-300 hover:text-white transition-colors"
                title="Call Settlla Kaduna Toll Free"
              >
                <Phone className="h-3.5 w-3.5 text-blue-400 shrink-0" />
                <span className="font-semibold text-white whitespace-nowrap">+234 800 SETTLLA</span>
                <span className="text-slate-600 hidden md:inline">|</span>
                <span className="hidden md:inline text-slate-400">0800 738 8552</span>
              </a>
              <span className="hidden lg:flex items-center gap-1.5 text-slate-400">
                <MapPin className="h-3.5 w-3.5 text-blue-400 shrink-0" />
                <span>Kaduna: Barnawa GRA &amp; Malali</span>
              </span>
            </div>

            {/* Right Trust Indicators (Responsive, non-overflowing) */}
            <div className="flex items-center gap-2 sm:gap-3 text-[10px] sm:text-xs font-medium shrink-0">
              <span className="flex items-center gap-1 text-emerald-400 whitespace-nowrap font-bold">
                <CheckCircle2 className="h-3 w-3 sm:h-3.5 sm:w-3.5 shrink-0" />
                <span>₦0 Inspection</span>
              </span>
              <span className="text-slate-600 hidden sm:inline">•</span>
              <span className="hidden sm:flex items-center gap-1 text-blue-300 whitespace-nowrap">
                <ShieldCheck className="h-3 w-3 sm:h-3.5 sm:w-3.5 shrink-0" />
                <span>HB&amp;A Mandates</span>
              </span>
              <span className="text-slate-600 hidden sm:inline">•</span>
              <span className="hidden sm:flex items-center gap-1 text-amber-300 whitespace-nowrap">
                <Lock className="h-3 w-3 sm:h-3.5 sm:w-3.5 shrink-0" />
                <span>10% Escrow</span>
              </span>
            </div>
          </div>
        </div>

        {/* 2. Main Navigation Bar */}
        <nav className="border-b border-slate-200/80 bg-white">
          <div className="mx-auto flex max-w-7xl items-center justify-between px-3 sm:px-6 lg:px-8 py-2.5 sm:py-3">
            {/* Brand Logo */}
            <Link
              href="/"
              className="flex items-center gap-2 sm:gap-2.5 select-none group shrink-0"
            >
              <div className="flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-xl bg-blue-600 text-white shadow-md shadow-blue-500/25 group-hover:bg-blue-700 transition-colors">
                <Home className="h-4 w-4 sm:h-5 sm:w-5" />
              </div>
              <div>
                <div className="flex items-center gap-1 sm:gap-1.5">
                  <span className="text-xl sm:text-2xl font-black tracking-tight text-slate-900">
                    Settlla
                  </span>
                  <span className="rounded-md bg-blue-50 px-1.5 sm:px-2 py-0.5 text-[9px] sm:text-[10px] font-bold text-blue-700 border border-blue-200">
                    Kaduna
                  </span>
                </div>
              </div>
            </Link>

            {/* Desktop Navigation Links */}
            <div className="hidden lg:flex items-center gap-6 text-sm font-semibold text-slate-600">
              <button
                onClick={() => scrollTo("hero")}
                className={`hover:text-blue-600 transition-colors py-1 cursor-pointer ${
                  pathname === "/" ? "text-blue-600 font-bold" : ""
                }`}
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
            <div className="flex items-center gap-1.5 sm:gap-2.5">
              {/* Manager Desk Shortcut (if agent) */}
              {role === "agent" && (
                <Link
                  href="/dashboard/agent"
                  className="hidden md:flex items-center gap-1.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 px-3 py-2 text-xs font-bold text-slate-800 transition-colors"
                  title="Manager Desk"
                >
                  <Scale className="h-3.5 w-3.5 text-slate-700" />
                  <span>Desk</span>
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
                      className={`flex items-center gap-1.5 sm:gap-2 rounded-xl px-2.5 sm:px-3 py-1.5 sm:py-2 text-xs font-bold transition-all shadow-xs border ${
                        role === "agent"
                          ? "bg-emerald-50 border-emerald-300 text-emerald-900 hover:bg-emerald-100"
                          : "bg-blue-50 border-blue-300 text-blue-900 hover:bg-blue-100"
                      }`}
                    >
                      {role === "agent" ? (
                        <Building2 className="h-4 w-4 text-emerald-700 shrink-0" />
                      ) : (
                        <User className="h-4 w-4 text-blue-700 shrink-0" />
                      )}
                      <div className="text-left hidden sm:block">
                        <div className="text-[11px] font-bold leading-tight truncate max-w-[110px]">
                          {currentUser.fullName}
                        </div>
                        <div
                          className={`text-[9px] uppercase font-black tracking-wider ${
                            role === "agent" ? "text-emerald-700" : "text-blue-700"
                          }`}
                        >
                          {role === "agent" ? "Agent Desk" : "Tenant Hub"}
                        </div>
                      </div>
                      <span className="sm:hidden text-xs font-bold">Dashboard</span>
                    </Link>

                    <button
                      type="button"
                      onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                      className="hidden sm:flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-600 transition-colors cursor-pointer"
                      title="User Settings & Role Switcher"
                    >
                      <Settings className="h-4 w-4" />
                    </button>
                  </div>

                  {/* Desktop User Dropdown */}
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

                        <button
                          type="button"
                          onClick={() => switchRole(role === "agent" ? "tenant" : "agent")}
                          className="w-full text-left px-3 py-2 rounded-xl hover:bg-slate-50 text-slate-700 font-semibold cursor-pointer flex items-center justify-between"
                        >
                          <span>Switch to {role === "agent" ? "Tenant" : "Agent"} View</span>
                          <span className="text-[10px] bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded">Toggle</span>
                        </button>

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
                <div className="flex items-center gap-1 sm:gap-2">
                  <Link
                    href="/login"
                    className="flex items-center gap-1 sm:gap-1.5 rounded-lg sm:rounded-xl border border-slate-200 bg-white hover:bg-slate-50 px-2.5 sm:px-3.5 py-1.5 sm:py-2 text-xs font-bold text-slate-700 transition-colors"
                  >
                    <LogIn className="h-3.5 w-3.5 text-slate-600 shrink-0" />
                    <span>Sign In</span>
                  </Link>
                  <Link
                    href="/signup"
                    className="hidden sm:flex items-center gap-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 px-3.5 py-2 text-xs font-bold text-white shadow-md shadow-blue-600/25 transition-all"
                  >
                    <UserPlus className="h-3.5 w-3.5 text-white shrink-0" />
                    <span>Sign Up</span>
                  </Link>
                </div>
              )}

              {/* Mobile Hamburger Button */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="lg:hidden flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-xl border border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100 active:scale-95 transition-all cursor-pointer shrink-0"
                aria-label="Toggle Navigation Menu"
              >
                {mobileMenuOpen ? (
                  <X className="h-5 w-5 text-slate-900" />
                ) : (
                  <Menu className="h-5 w-5 text-slate-900" />
                )}
              </button>
            </div>
          </div>
        </nav>
      </header>

      {/* 3. Slide-Over Mobile Navigation Drawer (Overlay & Sheet) */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          {/* Backdrop Blur Overlay */}
          <div
            className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs transition-opacity animate-fade-in"
            onClick={() => setMobileMenuOpen(false)}
          />

          {/* Drawer Container */}
          <div className="fixed top-0 right-0 bottom-0 w-[86%] max-w-sm bg-white shadow-2xl z-50 flex flex-col justify-between overflow-y-auto transform transition-transform animate-slide-in-right">
            {/* Drawer Header */}
            <div>
              <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 bg-slate-50">
                <Link
                  href="/"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-2 select-none"
                >
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-600 text-white shadow-md">
                    <Home className="h-4 w-4" />
                  </div>
                  <div>
                    <span className="text-xl font-black text-slate-900">Settlla</span>
                    <span className="ml-1 text-[10px] font-bold text-blue-700 bg-blue-100/70 px-1.5 py-0.5 rounded">
                      Kaduna
                    </span>
                  </div>
                </Link>

                <button
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 hover:bg-slate-100 active:scale-95 transition-all cursor-pointer"
                  aria-label="Close menu"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              {/* User Profile Card (if authenticated) */}
              {isAuthenticated && currentUser ? (
                <div className="m-4 p-4 rounded-2xl bg-gradient-to-br from-blue-50 via-indigo-50 to-slate-50 border border-blue-200/80 shadow-2xs space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-600 text-white font-bold text-base shadow-sm">
                      {currentUser.fullName.charAt(0)}
                    </div>
                    <div className="min-w-0 flex-1">
                      <h4 className="text-sm font-bold text-slate-900 truncate">
                        {currentUser.fullName}
                      </h4>
                      <p className="text-[11px] text-slate-500 truncate">{currentUser.email}</p>
                      <span
                        className={`inline-block mt-1 text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full ${
                          role === "agent"
                            ? "bg-emerald-100 text-emerald-800 border border-emerald-200"
                            : "bg-blue-100 text-blue-800 border border-blue-200"
                        }`}
                      >
                        {role === "agent" ? "Manager Mandate Desk" : "Verified Tenant"}
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 pt-1">
                    <Link
                      href={dashboardHref}
                      onClick={() => setMobileMenuOpen(false)}
                      className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-blue-600 text-white font-bold text-xs shadow-xs"
                    >
                      <User className="h-3.5 w-3.5" />
                      <span>Dashboard</span>
                    </Link>
                    <button
                      type="button"
                      onClick={() => {
                        switchRole(role === "agent" ? "tenant" : "agent");
                        setMobileMenuOpen(false);
                      }}
                      className="flex items-center justify-center gap-1 py-2 px-2.5 rounded-xl border border-slate-200 bg-white text-slate-700 font-bold text-xs"
                    >
                      <span>Role: {role === "agent" ? "Tenant" : "Agent"}</span>
                    </button>
                  </div>
                </div>
              ) : (
                <div className="p-4 bg-slate-50/80 border-b border-slate-100 space-y-2">
                  <p className="text-xs text-slate-500 font-medium">
                    Rent verified Kaduna apartments with zero roadside fees and escrow protection.
                  </p>
                  <div className="grid grid-cols-2 gap-2">
                    <Link
                      href="/login"
                      onClick={() => setMobileMenuOpen(false)}
                      className="flex items-center justify-center gap-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 py-2.5 text-xs font-bold text-slate-700 shadow-2xs"
                    >
                      <LogIn className="h-3.5 w-3.5" />
                      <span>Sign In</span>
                    </Link>
                    <Link
                      href="/signup"
                      onClick={() => setMobileMenuOpen(false)}
                      className="flex items-center justify-center gap-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 py-2.5 text-xs font-bold text-white shadow-md shadow-blue-600/25"
                    >
                      <UserPlus className="h-3.5 w-3.5" />
                      <span>Sign Up</span>
                    </Link>
                  </div>
                </div>
              )}

              {/* Navigation Links with Icons */}
              <div className="px-4 py-2 space-y-1">
                <button
                  onClick={() => scrollTo("hero")}
                  className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-slate-50 text-slate-800 font-semibold text-xs transition-colors cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <Home className="h-4 w-4 text-blue-600" />
                    <span>Home Overview</span>
                  </div>
                  <ChevronRight className="h-3.5 w-3.5 text-slate-400" />
                </button>

                <button
                  onClick={() => scrollTo("featured-properties")}
                  className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-slate-50 text-slate-800 font-semibold text-xs transition-colors cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <Compass className="h-4 w-4 text-emerald-600" />
                    <span>Vetted Kaduna Feed</span>
                  </div>
                  <span className="rounded-full bg-emerald-100 text-emerald-800 text-[10px] px-2 py-0.5 font-bold">
                    {verifiedCount} Verified
                  </span>
                </button>

                <button
                  onClick={() => scrollTo("how-it-works")}
                  className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-slate-50 text-slate-800 font-semibold text-xs transition-colors cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <CheckCircle2 className="h-4 w-4 text-blue-600" />
                    <span>How Settlla Works</span>
                  </div>
                  <span className="text-[10px] text-emerald-600 font-bold bg-emerald-50 px-1.5 py-0.5 rounded">
                    ₦0 Fees
                  </span>
                </button>

                <button
                  onClick={() => scrollTo("pricing-plans")}
                  className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-slate-50 text-slate-800 font-semibold text-xs transition-colors cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <CreditCard className="h-4 w-4 text-blue-600" />
                    <span>Pricing Transparency</span>
                  </div>
                  <ChevronRight className="h-3.5 w-3.5 text-slate-400" />
                </button>

                <button
                  onClick={() => scrollTo("why-settlla")}
                  className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-slate-50 text-slate-800 font-semibold text-xs transition-colors cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <ShieldCheck className="h-4 w-4 text-amber-600" />
                    <span>Why Settlla (Anti-Scam Escrow)</span>
                  </div>
                  <ChevronRight className="h-3.5 w-3.5 text-slate-400" />
                </button>

                <button
                  onClick={() => scrollTo("faq-section")}
                  className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-slate-50 text-slate-800 font-semibold text-xs transition-colors cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <HelpCircle className="h-4 w-4 text-indigo-600" />
                    <span>Frequently Asked Questions</span>
                  </div>
                  <ChevronRight className="h-3.5 w-3.5 text-slate-400" />
                </button>

                {onOpenEscrowDashboard && (
                  <button
                    onClick={() => {
                      setMobileMenuOpen(false);
                      onOpenEscrowDashboard();
                    }}
                    className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-blue-50 text-blue-900 font-bold text-xs transition-colors cursor-pointer border border-blue-100 bg-blue-50/50"
                  >
                    <div className="flex items-center gap-3">
                      <Shield className="h-4 w-4 text-blue-600" />
                      <span>Key-In-Door Escrow Hub</span>
                    </div>
                    <span className="text-[9px] font-black uppercase text-blue-700 bg-blue-100 px-2 py-0.5 rounded-full">
                      Protected
                    </span>
                  </button>
                )}

                {role === "agent" && (
                  <Link
                    href="/dashboard/agent"
                    onClick={() => setMobileMenuOpen(false)}
                    className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-emerald-50 text-emerald-950 font-bold text-xs transition-colors border border-emerald-100 bg-emerald-50/50"
                  >
                    <div className="flex items-center gap-3">
                      <Scale className="h-4 w-4 text-emerald-700" />
                      <span>Manager Attestation Desk</span>
                    </div>
                    <span className="text-[9px] font-black uppercase text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full">
                      ESVARBON
                    </span>
                  </Link>
                )}
              </div>
            </div>

            {/* Drawer Footer / Kaduna Assistance Contact */}
            <div className="p-4 border-t border-slate-100 bg-slate-50 space-y-3">
              <div className="rounded-xl border border-slate-200 bg-white p-3 shadow-2xs space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    Kaduna Resident Help Desk
                  </span>
                  <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                </div>
                <div className="flex items-center justify-between gap-2">
                  <a
                    href="tel:08007388552"
                    className="flex-1 flex items-center justify-center gap-1.5 py-2 px-2.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold transition-colors"
                  >
                    <Phone className="h-3 w-3 text-blue-600" />
                    <span>Call Desk</span>
                  </a>
                  <a
                    href="https://wa.me/2348031234567"
                    target="_blank"
                    rel="noreferrer"
                    className="flex-1 flex items-center justify-center gap-1.5 py-2 px-2.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 text-xs font-bold transition-colors"
                  >
                    <MessageSquare className="h-3 w-3 text-emerald-600" />
                    <span>WhatsApp</span>
                  </a>
                </div>
              </div>

              {isAuthenticated && (
                <button
                  type="button"
                  onClick={() => {
                    signOut();
                    setMobileMenuOpen(false);
                  }}
                  className="w-full flex items-center justify-center gap-2 py-2 rounded-xl text-rose-600 hover:bg-rose-50 font-bold text-xs transition-colors cursor-pointer"
                >
                  <LogOut className="h-3.5 w-3.5" />
                  <span>Sign Out of Settlla</span>
                </button>
              )}

              <p className="text-[10px] text-center text-slate-400">
                Settlla Kaduna &bull; Coronation Crescent, Barnawa GRA &bull; 100% Escrow Protected
              </p>
            </div>
          </div>
        </div>
      )}

      {/* 4. Sticky Bottom Mobile Navigation Bar (Always reachable by thumb on phones) */}
      <nav
        aria-label="Mobile Bottom Navigation"
        className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200/90 shadow-lg px-2 py-1.5 pb-safe"
      >
        <div className="grid grid-cols-4 items-center justify-around gap-1 max-w-md mx-auto">
          {/* Tab 1: Feed / Home */}
          <button
            type="button"
            onClick={() => scrollTo("hero")}
            className={`flex flex-col items-center justify-center py-1 px-1 rounded-xl transition-colors cursor-pointer ${
              pathname === "/" ? "text-blue-600 font-bold" : "text-slate-500 hover:text-slate-800"
            }`}
          >
            <Home className="h-5 w-5 shrink-0" />
            <span className="text-[10px] tracking-tight mt-0.5">Explore</span>
          </button>

          {/* Tab 2: Vetted Properties */}
          <button
            type="button"
            onClick={() => scrollTo("featured-properties")}
            className="flex flex-col items-center justify-center py-1 px-1 rounded-xl text-slate-500 hover:text-slate-800 transition-colors cursor-pointer relative"
          >
            <Compass className="h-5 w-5 shrink-0" />
            <span className="text-[10px] tracking-tight mt-0.5">Vetted</span>
            {verifiedCount > 0 && (
              <span className="absolute top-0.5 right-3 bg-emerald-500 text-white rounded-full text-[8px] font-black h-3.5 w-3.5 flex items-center justify-center">
                {verifiedCount}
              </span>
            )}
          </button>

          {/* Tab 3: Dashboard */}
          {isAuthenticated ? (
            <Link
              href={dashboardHref}
              className={`flex flex-col items-center justify-center py-1 px-1 rounded-xl transition-colors cursor-pointer ${
                pathname.startsWith("/dashboard")
                  ? "text-blue-600 font-bold"
                  : "text-slate-500 hover:text-slate-800"
              }`}
            >
              {role === "agent" ? (
                <Building2 className="h-5 w-5 shrink-0" />
              ) : (
                <User className="h-5 w-5 shrink-0" />
              )}
              <span className="text-[10px] tracking-tight mt-0.5">
                {role === "agent" ? "Desk" : "Dashboard"}
              </span>
            </Link>
          ) : (
            <Link
              href="/login"
              className={`flex flex-col items-center justify-center py-1 px-1 rounded-xl transition-colors cursor-pointer ${
                pathname === "/login"
                  ? "text-blue-600 font-bold"
                  : "text-slate-500 hover:text-slate-800"
              }`}
            >
              <LogIn className="h-5 w-5 shrink-0" />
              <span className="text-[10px] tracking-tight mt-0.5">Sign In</span>
            </Link>
          )}

          {/* Tab 4: Mobile Drawer / More */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen(true)}
            className="flex flex-col items-center justify-center py-1 px-1 rounded-xl text-slate-500 hover:text-slate-800 transition-colors cursor-pointer"
          >
            <Menu className="h-5 w-5 shrink-0" />
            <span className="text-[10px] tracking-tight mt-0.5">Menu</span>
          </button>
        </div>
      </nav>
    </>
  );
};
