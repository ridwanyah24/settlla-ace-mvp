"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useAuth } from "@/context/AuthContext";
import { SEED_LISTINGS, calculatePricing } from "@/data/seedListings";
import { Listing } from "@/types/listing";
import {
  Building2,
  PlusCircle,
  FileSignature,
  CalendarCheck,
  Wallet,
  MapPin,
  BadgeCheck,
  CheckCircle2,
  Clock,
  ShieldCheck,
  Home,
  ArrowRight,
  User,
  LogOut,
  ExternalLink,
  MessageSquare,
  Scale,
  Sparkles,
  UserCheck,
} from "lucide-react";

export default function AgentDashboardPage() {
  const { currentUser, signOut, switchRole } = useAuth();
  const [activeTab, setActiveTab] = useState<"listings" | "add_property" | "counter_sign" | "tours" | "payouts">("listings");

  const [listings, setListings] = useState<Listing[]>(SEED_LISTINGS);
  const [activeRental, setActiveRental] = useState<any>(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        const saved = localStorage.getItem("settlla_current_rental");
        if (saved) {
          setActiveRental(JSON.parse(saved));
        }
      } catch (e) {
        console.error("Failed to load rental in agent dashboard", e);
      }
    }
  }, []);

  // New Property Form State
  const [title, setTitle] = useState("");
  const [neighborhood, setNeighborhood] = useState("Barnawa");
  const [zone, setZone] = useState("Barnawa GRA");
  const [fullAddress, setFullAddress] = useState("");
  const [titleReference, setTitleReference] = useState("KADGIS Certificate of Occupancy No. KDL-BNW-2026-099");
  const [propertyType, setPropertyType] = useState("2-Bedroom Flat");
  const [bedrooms, setBedrooms] = useState(2);
  const [bathrooms, setBathrooms] = useState(2);
  const [annualRent, setAnnualRent] = useState(600000);
  const [landlordName, setLandlordName] = useState("Alhaji Shehu Garba");
  const [commuteBadge, setCommuteBadge] = useState("3 mins to Barnawa Commercial Complex");
  const [description, setDescription] = useState("");
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>([
    "Dedicated Prepaid Meter (Self-Billed)",
    "Borehole Water + 5,000L Overhead Tank",
    "24/7 Uniformed Gate Security",
  ]);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const calculatedPricing = calculatePricing(annualRent);

  const handleAmenityToggle = (item: string) => {
    if (selectedAmenities.includes(item)) {
      setSelectedAmenities(selectedAmenities.filter((a) => a !== item));
    } else {
      setSelectedAmenities([...selectedAmenities, item]);
    }
  };

  const handleAddPropertySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newId = `prop_${neighborhood.toLowerCase()}_${Date.now()}`;
    const newListing: Listing = {
      id: newId,
      title: title || `${propertyType} in ${zone}`,
      neighborhood: neighborhood as "Barnawa" | "Malali",
      zone,
      full_address: fullAddress || `${zone}, Kaduna`,
      title_reference: titleReference,
      property_type: propertyType,
      bedrooms,
      bathrooms,
      commute_badge: commuteBadge,
      commute_context: `Located in ${zone} with fast road connection in Kaduna.`,
      description: description || `Newly vetted modern ${propertyType} in ${zone}, Kaduna. Verified landlord mandate on file.`,
      amenities: selectedAmenities,
      images: [
        "/images/living_room.jpg",
        "/images/bedroom.jpg",
        "/images/exterior.jpg",
      ],
      pricing: calculatedPricing,
      mandate: {
        mandate_ref: `HBA-KD-${neighborhood.substring(0, 3).toUpperCase()}-2026-${Math.floor(100 + Math.random() * 900)}`,
        manager_name: currentUser?.agencyName || "HB&A Partners & Co.",
        accreditation: currentUser?.accreditation || "ESVARBON / NIESV Reg. #A2840",
        landlord_name: landlordName,
        mandate_status: "Verified & Active",
      },
      visiting_windows: [
        { day: "Tuesdays & Thursdays", hours: "2:00 PM – 5:00 PM" },
        { day: "Saturdays", hours: "10:00 AM – 3:00 PM" },
      ],
    };

    setListings([newListing, ...listings]);
    setSuccessMessage(`Successfully listed ${newListing.title} under mandate ${newListing.mandate.mandate_ref}!`);
    setTimeout(() => {
      setSuccessMessage(null);
      setActiveTab("listings");
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col pb-16 lg:pb-0">
      {/* Top Navbar */}
      <header className="sticky top-0 z-40 bg-white border-b border-slate-200 shadow-xs">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <Link href="/" className="flex items-center gap-2.5 group">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-600 text-white shadow-md shadow-emerald-600/25 group-hover:bg-emerald-700 transition-colors">
                <Building2 className="h-5 w-5" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="text-xl font-black tracking-tight text-slate-900">Settlla</span>
                  <span className="rounded-md bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-800 border border-emerald-200">
                    Manager Desk
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 hidden sm:block">
                  HB&amp;A Authorized Property Management Portal
                </p>
              </div>
            </Link>

            <nav className="hidden md:flex items-center gap-4 text-xs font-semibold text-slate-600">
              <Link href="/" className="hover:text-emerald-700 transition-colors">
                View Public Feed
              </Link>
              <span className="text-slate-300">•</span>
              <span className="text-emerald-700 font-bold flex items-center gap-1">
                <Building2 className="h-3.5 w-3.5" />
                <span>Agent Operations Desk</span>
              </span>
            </nav>
          </div>

          {/* Right User Actions */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 rounded-xl bg-emerald-50/80 border border-emerald-200/80 px-3 py-1.5">
              <Building2 className="h-4 w-4 text-emerald-700" />
              <div className="text-left hidden sm:block">
                <span className="text-xs font-bold text-slate-900 leading-tight block">
                  {currentUser?.agencyName || "HB&A Partners & Co."}
                </span>
                <span className="text-[10px] font-semibold text-emerald-800 block">
                  ESVARBON Accredited
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => switchRole("tenant")}
              className="hidden lg:flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 px-3 py-2 text-xs font-bold text-slate-700 transition-colors cursor-pointer"
              title="Switch to Tenant view to test tenant dashboard"
            >
              <User className="h-3.5 w-3.5 text-blue-600" />
              <span>Switch to Tenant</span>
            </button>

            <Link
              href="/"
              onClick={() => signOut()}
              className="flex items-center gap-1 rounded-xl border border-slate-200 bg-white hover:bg-rose-50 text-slate-600 hover:text-rose-700 px-3 py-2 text-xs font-semibold transition-colors"
            >
              <LogOut className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Sign Out</span>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 mx-auto max-w-7xl w-full px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* Welcome Agency Banner */}
        <div className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="flex items-start gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-600 to-teal-700 text-white font-black text-2xl shadow-lg shadow-emerald-600/25 flex-shrink-0">
              <Building2 className="h-8 w-8" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-black text-slate-900">
                  {currentUser?.agencyName || "HB&A Partners & Co."}
                </h1>
                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 text-xs font-bold text-emerald-800">
                  <BadgeCheck className="h-3.5 w-3.5 text-emerald-600" />
                  <span>{currentUser?.accreditation || "ESVARBON / NIESV Reg. #A2840"}</span>
                </span>
              </div>
              <p className="text-xs sm:text-sm text-slate-600 mt-1 flex items-center gap-2">
                <span>Managing Officer: {currentUser?.fullName || "Barrister Amina Yakubu"}</span>
                <span className="text-slate-300">•</span>
                <span>{currentUser?.phoneNumber || "0803 555 1289"}</span>
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                <span className="inline-flex items-center gap-1 rounded-lg bg-emerald-50 border border-emerald-200 px-2.5 py-1 text-xs font-semibold text-emerald-800">
                  <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
                  <span>Direct Landlord Mandates Verified</span>
                </span>
                <span className="inline-flex items-center gap-1 rounded-lg bg-slate-100 border border-slate-200 px-2.5 py-1 text-xs font-semibold text-slate-700">
                  <Scale className="h-3.5 w-3.5 text-slate-500" />
                  <span>10% Agency &amp; 5% Legal Statutory Custody</span>
                </span>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch md:items-center gap-2.5 w-full md:w-auto">
            <button
              type="button"
              onClick={() => setActiveTab("add_property")}
              className="rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-4 py-3 text-xs sm:text-sm shadow-md shadow-emerald-600/25 transition-all text-center flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <PlusCircle className="h-4 w-4" />
              <span>List New Kaduna Property</span>
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="border-b border-slate-200 bg-white rounded-2xl p-1.5 shadow-2xs flex overflow-x-auto gap-1 no-scrollbar">
          <button
            type="button"
            onClick={() => setActiveTab("listings")}
            className={`flex items-center gap-2 py-2.5 px-4 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
              activeTab === "listings"
                ? "bg-emerald-600 text-white shadow-xs"
                : "text-slate-600 hover:bg-slate-100"
            }`}
          >
            <Home className="h-4 w-4" />
            <span>Managed Properties ({listings.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("add_property")}
            className={`flex items-center gap-2 py-2.5 px-4 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
              activeTab === "add_property"
                ? "bg-emerald-600 text-white shadow-xs"
                : "text-slate-600 hover:bg-slate-100"
            }`}
          >
            <PlusCircle className="h-4 w-4" />
            <span>List New Property</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("counter_sign")}
            className={`flex items-center gap-2 py-2.5 px-4 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
              activeTab === "counter_sign"
                ? "bg-emerald-600 text-white shadow-xs"
                : "text-slate-600 hover:bg-slate-100"
            }`}
          >
            <BadgeCheck className="h-4 w-4" />
            <span>Mandates &amp; Executed Leases</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("tours")}
            className={`flex items-center gap-2 py-2.5 px-4 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
              activeTab === "tours"
                ? "bg-emerald-600 text-white shadow-xs"
                : "text-slate-600 hover:bg-slate-100"
            }`}
          >
            <CalendarCheck className="h-4 w-4" />
            <span>Walkthrough Bookings (1)</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("payouts")}
            className={`flex items-center gap-2 py-2.5 px-4 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
              activeTab === "payouts"
                ? "bg-emerald-600 text-white shadow-xs"
                : "text-slate-600 hover:bg-slate-100"
            }`}
          >
            <Wallet className="h-4 w-4" />
            <span>Commission &amp; Escrow Payouts</span>
          </button>
        </div>

        {/* TAB 1: MANAGED PROPERTIES */}
        {activeTab === "listings" && (
          <div className="space-y-6">
            {/* Stat Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-2xs">
                <div className="flex items-center justify-between text-slate-400 mb-2">
                  <span className="text-xs font-bold uppercase tracking-wider">Active Inventory</span>
                  <Home className="h-4 w-4 text-emerald-600" />
                </div>
                <p className="text-2xl font-black text-slate-900">{listings.length} Homes</p>
                <span className="inline-flex items-center gap-1 mt-2 text-[10px] font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                  <CheckCircle2 className="h-3 w-3" />
                  <span>100% Vetted Mandates</span>
                </span>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-2xs">
                <div className="flex items-center justify-between text-slate-400 mb-2">
                  <span className="text-xs font-bold uppercase tracking-wider">Executed Leases</span>
                  <BadgeCheck className="h-4 w-4 text-emerald-600" />
                </div>
                <p className="text-2xl font-black text-slate-900">{activeRental ? 1 : 0} Leases</p>
                <span className="inline-flex items-center gap-1 mt-2 text-[10px] font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                  <CheckCircle2 className="h-3 w-3" />
                  <span>Pre-Certified Mandates</span>
                </span>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-2xs">
                <div className="flex items-center justify-between text-slate-400 mb-2">
                  <span className="text-xs font-bold uppercase tracking-wider">Agency Fees Accrued</span>
                  <Wallet className="h-4 w-4 text-blue-600" />
                </div>
                <p className="text-2xl font-black text-blue-700">₦432,000</p>
                <span className="inline-flex items-center gap-1 mt-2 text-[10px] font-bold text-blue-800 bg-blue-50 border border-blue-200 px-2 py-0.5 rounded-full">
                  <span>10% Statutory Rate</span>
                </span>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-2xs">
                <div className="flex items-center justify-between text-slate-400 mb-2">
                  <span className="text-xs font-bold uppercase tracking-wider">Tour Policy</span>
                  <ShieldCheck className="h-4 w-4 text-emerald-600" />
                </div>
                <p className="text-2xl font-black text-emerald-700">₦0 Free Tour</p>
                <span className="inline-flex items-center gap-1 mt-2 text-[10px] font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                  <span>Optional for Tenants</span>
                </span>
              </div>
            </div>

            {/* Properties List */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {listings.map((item) => (
                <div key={item.id} className="rounded-3xl border border-slate-200 bg-white p-4 sm:p-5 shadow-xs flex flex-col sm:flex-row gap-3 sm:gap-4">
                  <div className="relative h-40 sm:h-28 w-full sm:w-32 flex-shrink-0 overflow-hidden rounded-2xl border border-slate-200">
                    <Image
                      src={item.images[0] || "/images/living_room.jpg"}
                      alt={item.title}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div className="flex-1 min-w-0 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold text-slate-500 uppercase">
                          {item.neighborhood} • {item.zone}
                        </span>
                        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 text-emerald-700 text-[10px] font-bold px-2 py-0.2 border border-emerald-200">
                          <CheckCircle2 className="h-2.5 w-2.5" />
                          <span>Active</span>
                        </span>
                      </div>
                      <h4 className="text-sm font-bold text-slate-900 truncate mt-1">{item.title}</h4>
                      <p className="text-xs text-slate-500 truncate flex items-center gap-1 mt-0.5">
                        <MapPin className="h-3 w-3 text-slate-400" />
                        <span>{item.full_address}</span>
                      </p>
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs">
                      <span className="font-black text-emerald-800">
                        ₦{item.pricing.annual_rent.toLocaleString("en-NG")}/yr
                      </span>
                      <span className="text-[10px] text-slate-400 font-mono">
                        {item.mandate.mandate_ref}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 2: ADD PROPERTY */}
        {activeTab === "add_property" && (
          <div className="space-y-6">
            <div className="rounded-3xl bg-emerald-50/70 border border-emerald-200 p-6 flex items-start gap-4">
              <Sparkles className="h-6 w-6 text-emerald-600 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="text-base font-bold text-slate-900">List a Verified Property</h3>
                <p className="text-xs text-emerald-900 mt-1 leading-relaxed">
                  Settlla automatically computes statutory 4-way upfront pricing (10% Caution, 5% Legal, 10% Agency) and binds to your agency mandate for transparent tenant leasing.
                </p>
              </div>
            </div>

            {successMessage && (
              <div className="rounded-2xl bg-emerald-600 text-white p-4 text-center font-bold text-sm flex items-center justify-center gap-2 animate-fade-in">
                <CheckCircle2 className="h-5 w-5" />
                <span>{successMessage}</span>
              </div>
            )}

            <form onSubmit={handleAddPropertySubmit} className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 shadow-xs space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1.5">
                    Property Title <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Modern 2-Bedroom Flat in Malali Palms"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-xs text-slate-900 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1.5">
                    Neighborhood
                  </label>
                  <select
                    value={neighborhood}
                    onChange={(e) => {
                      setNeighborhood(e.target.value);
                      setZone(e.target.value === "Barnawa" ? "Barnawa GRA" : "Malali GRA");
                    }}
                    className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-xs text-slate-900 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
                  >
                    <option value="Barnawa">Barnawa</option>
                    <option value="Malali">Malali</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1.5">
                    Zone / Sub-district
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Barnawa GRA / Phase 1"
                    value={zone}
                    onChange={(e) => setZone(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-xs text-slate-900 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1.5">
                    Full Physical Address
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Plot 18 Coronation Crescent, Barnawa, Kaduna"
                    value={fullAddress}
                    onChange={(e) => setFullAddress(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-xs text-slate-900 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1.5">
                    Property Type
                  </label>
                  <select
                    value={propertyType}
                    onChange={(e) => setPropertyType(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-xs text-slate-900 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
                  >
                    <option value="1-Bedroom Flat">1-Bedroom Flat</option>
                    <option value="2-Bedroom Flat">2-Bedroom Flat</option>
                    <option value="3-Bedroom Flat">3-Bedroom Flat</option>
                    <option value="Mini-flat">Mini-flat</option>
                    <option value="3-Bedroom Duplex">3-Bedroom Duplex</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1.5">
                    Bedrooms
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={8}
                    value={bedrooms}
                    onChange={(e) => setBedrooms(Number(e.target.value))}
                    className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-xs text-slate-900 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1.5">
                    Annual Net Rent (₦) <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="number"
                    required
                    step={10000}
                    value={annualRent}
                    onChange={(e) => setAnnualRent(Number(e.target.value))}
                    className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-xs font-bold text-slate-900 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
                  />
                </div>
              </div>

              {/* Automated Pricing Preview */}
              <div className="rounded-2xl border border-blue-200 bg-blue-50/70 p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-blue-900 uppercase">
                    Automated 4-Way Statutory Pricing Breakdown
                  </span>
                  <span className="text-sm font-black text-blue-700">
                    Total Move-In: ₦{calculatedPricing.total_move_in_cost.toLocaleString("en-NG")}
                  </span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
                  <div className="bg-white p-2.5 rounded-xl border border-slate-200">
                    <span className="text-slate-500 block text-[10px]">Net Rent:</span>
                    <strong>₦{calculatedPricing.annual_rent.toLocaleString("en-NG")}</strong>
                  </div>
                  <div className="bg-white p-2.5 rounded-xl border border-slate-200">
                    <span className="text-slate-500 block text-[10px]">Caution ({calculatedPricing.caution_fee > 0 ? "10%" : "₦0 Waived"}):</span>
                    <strong>{calculatedPricing.caution_fee > 0 ? `₦${calculatedPricing.caution_fee.toLocaleString("en-NG")}` : "₦0 (Waived)"}</strong>
                  </div>
                  <div className="bg-white p-2.5 rounded-xl border border-slate-200">
                    <span className="text-slate-500 block text-[10px]">Legal &amp; Agency Fee (15%):</span>
                    <strong>₦{(calculatedPricing.legal_and_agency_fee || (calculatedPricing.legal_fee + calculatedPricing.agency_fee)).toLocaleString("en-NG")}</strong>
                  </div>
                </div>
              </div>

              {/* Landlord & Title Mandate */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1.5">
                    Landlord / Property Owner Name
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Alhaji Shehu Garba"
                    value={landlordName}
                    onChange={(e) => setLandlordName(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-xs text-slate-900 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1.5">
                    KADGIS Title Document Reference
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. KADGIS C of O No. KDL-BNW-2026-099"
                    value={titleReference}
                    onChange={(e) => setTitleReference(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-xs text-slate-900 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
                  />
                </div>
              </div>

              {/* Verified Amenities */}
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-2">
                  Select Verified Amenities
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {[
                    "Dedicated Prepaid Meter (Self-Billed)",
                    "Borehole Water + 5,000L Overhead Tank",
                    "24/7 Uniformed Gate Security",
                    "Interlocked Compound & Ample Parking",
                    "Modern POP Ceiling & Tiled Floors",
                    "Attached Self-Contained BQ (Boys Quarters)",
                    "Dedicated Generator Changeover Switch",
                  ].map((amenity) => (
                    <label
                      key={amenity}
                      className={`flex items-center gap-2.5 rounded-xl border p-3 text-xs transition-colors cursor-pointer ${
                        selectedAmenities.includes(amenity)
                          ? "border-emerald-500 bg-emerald-50/60 text-emerald-900 font-semibold"
                          : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={selectedAmenities.includes(amenity)}
                        onChange={() => handleAmenityToggle(amenity)}
                        className="h-4 w-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                      />
                      <span>{amenity}</span>
                    </label>
                  ))}
                </div>
              </div>

              <button
                type="submit"
                className="w-full rounded-xl bg-emerald-600 hover:bg-emerald-700 py-3.5 text-xs sm:text-sm font-bold text-white transition-all shadow-md shadow-emerald-600/25 cursor-pointer flex items-center justify-center gap-2"
              >
                <PlusCircle className="h-4 w-4" />
                <span>Publish Verified Property to Settlla Feed</span>
              </button>
            </form>
          </div>
        )}

        {/* TAB 3: PRE-CERTIFIED MANDATES & EXECUTED LEASES */}
        {activeTab === "counter_sign" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2">
                  <BadgeCheck className="h-5 w-5 text-emerald-600" />
                  <span>Mandate Attestation &amp; Executed Leases</span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  All listings carry pre-certified manager counter-signatures under registered landlord mandates for instant zero-delay execution.
                </p>
              </div>
            </div>

            <div className="rounded-2xl bg-emerald-50/70 border border-emerald-200 p-4 text-xs text-emerald-900 flex items-start gap-3">
              <ShieldCheck className="h-5 w-5 text-emerald-600 flex-shrink-0 mt-0.5" />
              <div>
                <strong className="text-slate-900 block mb-0.5">Pre-Certified Listing Mandate Enforced:</strong>
                <span>All listings are pre-endorsed with ESVARBON accreditation. Tenants execute their digital signature and proceed directly to escrow payment without waiting for counter-signing.</span>
              </div>
            </div>

            {activeRental ? (
              <div className="rounded-3xl border border-emerald-200 bg-white p-6 shadow-xs space-y-4">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
                  <div>
                    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 text-emerald-700 text-[10px] font-bold px-2.5 py-0.5 border border-emerald-200">
                      <CheckCircle2 className="h-3 w-3" />
                      <span>Live Executed Tenancy &bull; Pre-Certified Mandate</span>
                    </span>
                    <h4 className="text-base font-bold text-slate-900 mt-1">
                      {activeRental.listing?.title || "Barnawa Terraces Flat 1"}
                    </h4>
                    <p className="text-xs text-slate-600 mt-0.5">
                      Tenant: <strong>{activeRental.agreement?.tenant?.full_name || "Active Tenant"}</strong> ({activeRental.agreement?.tenant?.phone_number || "0803 123 4567"})
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] text-slate-400 uppercase font-bold block">All-In Move-In</span>
                    <span className="text-base font-black text-emerald-700">
                      ₦{activeRental.transaction?.total_amount_paid?.toLocaleString("en-NG") || "625,000"}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">Mandate Seal</span>
                    <span className="font-mono text-xs font-bold text-slate-800">
                      {activeRental.listing?.mandate?.mandate_ref || "HBA-KD-BNW-2026-089"}
                    </span>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">Move-In Pass</span>
                    <span className="font-mono text-xs font-bold text-blue-700">
                      {activeRental.move_in_pass?.pass_id || "SETT-MIP-8921"}
                    </span>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">Agency Commission (10%)</span>
                    <span className="font-mono text-xs font-bold text-emerald-700">
                      ₦{activeRental.listing?.pricing?.agency_fee?.toLocaleString("en-NG") || "50,000"}
                    </span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xs space-y-4">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
                  <div>
                    <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 text-blue-700 text-[10px] font-bold px-2.5 py-0.5 border border-blue-200">
                      <ShieldCheck className="h-3 w-3" />
                      <span>Pre-Certified Mandate Active</span>
                    </span>
                    <h4 className="text-base font-bold text-slate-900 mt-1">
                      Barnawa Terraces Flat 1 (1-Bedroom)
                    </h4>
                    <p className="text-xs text-slate-600 mt-0.5">
                      Mandate Ref: <strong>HBA-KD-BNW-2026-089</strong> &bull; ESVARBON/NIESV Registered
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] text-slate-400 uppercase font-bold block">Lease Value</span>
                    <span className="text-base font-black text-blue-700">₦625,000</span>
                  </div>
                </div>

                <div className="text-xs text-slate-600 flex items-center justify-between">
                  <span>Pre-signed with digital certificate. Dual execution activates instantly upon tenant signing.</span>
                  <span className="font-mono text-[10px] text-emerald-700 font-bold bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200">
                    Pre-Certified Ready
                  </span>
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 4: TOUR APPOINTMENTS */}
        {activeTab === "tours" && (
          <div className="space-y-4">
            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xs space-y-4">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
                <div>
                  <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 text-emerald-700 text-[10px] font-bold px-2.5 py-0.5 border border-emerald-200">
                    <CheckCircle2 className="h-3 w-3" />
                    <span>Confirmed Walkthrough Tour</span>
                  </span>
                  <h4 className="text-base font-bold text-slate-900 mt-1">Aminu Mohammed (NYSC Corps Member)</h4>
                  <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                    <MapPin className="h-3.5 w-3.5 text-slate-400" />
                    <span>Plot 12 Coronation Crescent, Barnawa, Kaduna</span>
                  </p>
                </div>
                <div className="text-right">
                  <span className="text-sm font-bold text-blue-600 block">Fri, Sep 18, 2026</span>
                  <span className="text-xs text-slate-500">2:30 PM - 3:00 PM</span>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-xs pt-2">
                <span className="text-slate-500">
                  Meeting at gate. Remember: 100% Free Walkthrough (₦0). Zero roadside fee allowed.
                </span>

                <Link
                  href="/dashboard/tenant"
                  className="inline-flex items-center gap-1.5 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-800 border border-blue-200 px-3.5 py-2 font-bold text-xs transition-colors"
                >
                  <UserCheck className="h-3.5 w-3.5 text-blue-600" />
                  <span>View Tenant Profile</span>
                </Link>
              </div>
            </div>
          </div>
        )}

        {/* TAB 5: COMMISSION & PAYOUTS */}
        {activeTab === "payouts" && (
          <div className="space-y-4">
            <div>
              <h3 className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2">
                <Wallet className="h-5 w-5 text-emerald-600" />
                <span>Statutory Commission &amp; Legal Fee Payouts</span>
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Automatic disbursements settled upon 24-hour key handover verification.
              </p>
            </div>

            <div className="rounded-3xl border border-slate-200 bg-white overflow-hidden shadow-xs">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 uppercase text-[10px] font-bold">
                  <tr>
                    <th className="py-3.5 px-4">Listing Title</th>
                    <th className="py-3.5 px-4">Mandate Ref</th>
                    <th className="py-3.5 px-4">Agency Fee (10%)</th>
                    <th className="py-3.5 px-4">Legal Fee (5%)</th>
                    <th className="py-3.5 px-4 text-right">Escrow Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  <tr>
                    <td className="py-4 px-4 font-bold text-slate-900">Barnawa Terraces Flat 1</td>
                    <td className="py-4 px-4 font-mono text-slate-500">HBA-KD-BNW-2026-089</td>
                    <td className="py-4 px-4 font-black text-emerald-700 text-sm">₦50,000</td>
                    <td className="py-4 px-4 font-black text-blue-700 text-sm">₦25,000</td>
                    <td className="py-4 px-4 text-right">
                      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 px-2.5 py-0.5 text-[10px] font-bold">
                        <CheckCircle2 className="h-3 w-3" />
                        <span>Ready for Disbursal</span>
                      </span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>

      {/* Simple Footer */}
      <footer className="border-t border-slate-200 bg-white px-4 py-4 text-center text-xs text-slate-500 mt-12 mb-8 lg:mb-0">
        Settlla Kaduna Hub • Authorized Real Estate Partner &amp; Escrow Infrastructure
      </footer>

      {/* Mobile Bottom Navigation Bar */}
      <nav
        aria-label="Agent Mobile Navigation"
        className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200 shadow-lg px-4 py-2 pb-safe"
      >
        <div className="flex items-center justify-around max-w-md mx-auto">
          <Link
            href="/"
            className="flex flex-col items-center justify-center py-1 text-slate-500 hover:text-slate-800 transition-colors"
          >
            <Home className="h-5 w-5" />
            <span className="text-[10px] font-medium mt-0.5">Explore Feed</span>
          </Link>
          <div className="flex flex-col items-center justify-center py-1 text-emerald-700 font-bold">
            <Building2 className="h-5 w-5" />
            <span className="text-[10px] font-bold mt-0.5">Manager Desk</span>
          </div>
          <button
            type="button"
            onClick={() => switchRole("tenant")}
            className="flex flex-col items-center justify-center py-1 text-slate-500 hover:text-slate-800 transition-colors cursor-pointer"
          >
            <User className="h-5 w-5" />
            <span className="text-[10px] font-medium mt-0.5">Tenant View</span>
          </button>
          <button
            type="button"
            onClick={() => signOut()}
            className="flex flex-col items-center justify-center py-1 text-rose-500 hover:text-rose-700 transition-colors cursor-pointer"
          >
            <LogOut className="h-5 w-5" />
            <span className="text-[10px] font-medium mt-0.5">Sign Out</span>
          </button>
        </div>
      </nav>
    </div>
  );
}
