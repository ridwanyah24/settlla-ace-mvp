"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { useAuth } from "@/context/AuthContext";
import { Listing } from "@/types/listing";
import { TenancyAgreement } from "@/types/agreement";
import { calculatePricing } from "@/data/seedListings";
import {
  Building2,
  X,
  Home,
  PlusCircle,
  Scale,
  CalendarCheck,
  Wallet,
  Check,
  ClipboardList,
  Zap,
  MessageSquare,
  ArrowRight,
  Info,
  BadgeCheck,
  ShieldCheck,
  CheckCircle2,
} from "lucide-react";

interface AgentDashboardModalProps {
  isOpen: boolean;
  onClose: () => void;
  listings: Listing[];
  onAddNewListing: (newListing: Listing) => void;
  onOpenSigningWorkflow?: (agreement: TenancyAgreement, listing: Listing, role: "tenant" | "manager") => void;
}

export const AgentDashboardModal: React.FC<AgentDashboardModalProps> = ({
  isOpen,
  onClose,
  listings,
  onAddNewListing,
  onOpenSigningWorkflow,
}) => {
  const { currentUser, signOut } = useAuth();
  const [activeTab, setActiveTab] = useState<"listings" | "add_property" | "counter_sign" | "tours" | "payouts">("listings");
  const [activeRental, setActiveRental] = useState<any>(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        const saved = localStorage.getItem("settlla_current_rental");
        if (saved) {
          setActiveRental(JSON.parse(saved));
        }
      } catch (e) {
        console.error("Failed to load rental in agent modal", e);
      }
    }
  }, []);

  // New Listing Form State
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
  const [formSuccess, setFormSuccess] = useState(false);

  // Pre-certified leases under management
  const [pendingAgreements] = useState<TenancyAgreement[]>([
    {
      agreement_id: "SETT-AGR-2026-BNW-089",
      listing_id: listings[0]?.id || "prop_barnawa_01",
      property_title: listings[0]?.title || "Executive 1-Bedroom Flat at Barnawa Terraces",
      property_address: listings[0]?.full_address || "Plot 12 Coronation Crescent, Barnawa, Kaduna",
      title_reference: listings[0]?.title_reference || "KADGIS C of O No. KDL-BNW-2018-0941",
      landlord_name: "Alhaji Shehu Garba",
      manager_name: "HB&A Partners & Co.",
      manager_accreditation: "ESVARBON / NIESV Reg. #A2840",
      manager_mandate_ref: "HBA-KD-BNW-2026-089",
      tenant: {
        full_name: "Aminu Mohammed",
        phone_number: "0803 123 4567",
        email_address: "aminu.mohammed@example.com",
        nin_number: "5829 4810 3921",
        employer_name: "GTBank Barnawa (NYSC)",
      },
      lease_start_date: "2026-10-01",
      lease_end_date: "2027-09-30",
      tenure_months: 12,
      pricing: listings[0]?.pricing || calculatePricing(500000),
      covenants: [],
      manager_mandate_clause: "Legally authorized under Mandate #HBA-KD-BNW-2026-089.",
      escrow_clause: "Key-In-Door Escrow Protection Active.",
      caution_ringfencing_clause: "10% Caution deposit ringfenced in escrow custody.",
      full_legal_text: "STANDARD RESIDENTIAL TENANCY AGREEMENT...",
      status: "fully_executed",
      created_at: new Date().toISOString(),
      tenant_signature: "data:image/svg+xml;base64,PHN2Zz48L3N2Zz4=",
      tenant_signed_at: "2026-09-17T06:30:00.000Z",
      tenant_audit_ref: "AUD-TEN-98214",
    },
  ]);

  if (!isOpen) return null;

  const handleAmenityToggle = (item: string) => {
    if (selectedAmenities.includes(item)) {
      setSelectedAmenities(selectedAmenities.filter((a) => a !== item));
    } else {
      setSelectedAmenities([...selectedAmenities, item]);
    }
  };

  const calculatedPricing = calculatePricing(annualRent);

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
      commute_context: `Located in ${zone} with fast road access in Kaduna.`,
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

    onAddNewListing(newListing);
    setFormSuccess(true);
    setTimeout(() => {
      setFormSuccess(false);
      setActiveTab("listings");
    }, 1500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 overflow-y-auto bg-slate-900/60 backdrop-blur-sm animate-fade-in">
      <div
        className="relative w-full max-w-5xl max-h-[92vh] overflow-y-auto rounded-3xl border border-slate-200 bg-white shadow-2xl text-slate-900 flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Sticky Header */}
        <div className="sticky top-0 z-20 flex items-center justify-between border-b border-slate-200 bg-white/95 px-6 py-4 backdrop-blur-md">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-600 text-white shadow-md shadow-emerald-600/25">
              <Building2 className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-black text-slate-900">Agent &amp; Property Manager Desk</h2>
                <span className="rounded-full bg-emerald-50 text-emerald-800 text-[10px] font-bold px-2 py-0.5 border border-emerald-200">
                  ESVARBON Accredited
                </span>
              </div>
              <p className="text-xs text-slate-500 font-medium">
                {currentUser?.agencyName || "HB&A Partners & Co."} • Authorized Kaduna Mandate Partner
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                signOut();
                onClose();
              }}
              className="rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 px-3 py-1.5 text-xs font-semibold transition-colors cursor-pointer"
            >
              Sign Out
            </button>
            <button
              type="button"
              onClick={onClose}
              className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-100 text-slate-500 hover:bg-slate-200 hover:text-slate-800 transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-slate-200 bg-slate-50/70 px-6 overflow-x-auto gap-1 text-xs font-bold">
          <button
            type="button"
            onClick={() => setActiveTab("listings")}
            className={`py-3 px-3.5 border-b-2 transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === "listings"
                ? "border-emerald-600 text-emerald-700"
                : "border-transparent text-slate-500 hover:text-slate-800"
            }`}
          >
            <Home className="w-3.5 h-3.5" />
            <span>Managed Properties ({listings.length})</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("add_property")}
            className={`py-3 px-3.5 border-b-2 transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === "add_property"
                ? "border-emerald-600 text-emerald-700"
                : "border-transparent text-slate-500 hover:text-slate-800"
            }`}
          >
            <PlusCircle className="w-3.5 h-3.5" />
            <span>List New Property</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("counter_sign")}
            className={`py-3 px-3.5 border-b-2 transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === "counter_sign"
                ? "border-emerald-600 text-emerald-700"
                : "border-transparent text-slate-500 hover:text-slate-800"
            }`}
          >
            <BadgeCheck className="w-3.5 h-3.5" />
            <span>Mandates &amp; Executed Leases</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("tours")}
            className={`py-3 px-3.5 border-b-2 transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === "tours"
                ? "border-emerald-600 text-emerald-700"
                : "border-transparent text-slate-500 hover:text-slate-800"
            }`}
          >
            <CalendarCheck className="w-3.5 h-3.5" />
            <span>Walkthrough Appointments</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("payouts")}
            className={`py-3 px-3.5 border-b-2 transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === "payouts"
                ? "border-emerald-600 text-emerald-700"
                : "border-transparent text-slate-500 hover:text-slate-800"
            }`}
          >
            <Wallet className="w-3.5 h-3.5" />
            <span>Commission &amp; Escrow Payouts</span>
          </button>
        </div>

        {/* Dashboard Body */}
        <div className="p-6 space-y-6 flex-1 overflow-y-auto">
          {/* TAB 1: MANAGED PROPERTIES */}
          {activeTab === "listings" && (
            <div className="space-y-6">
              {/* Stat Highlights */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-2xs">
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                    Active Mandates
                  </span>
                  <p className="text-xl font-black text-slate-900 mt-1">{listings.length} Properties</p>
                  <span className="inline-block mt-2 text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                    100% Vetted Mandates
                  </span>
                </div>

                <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-2xs">
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                    Executed Mandates
                  </span>
                  <p className="text-xl font-black text-slate-900 mt-1">{activeRental ? 1 : pendingAgreements.length} Leases</p>
                  <span className="inline-block mt-2 text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                    Pre-Certified Mandates
                  </span>
                </div>

                <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-2xs">
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                    Accrued Agency Fees
                  </span>
                  <p className="text-xl font-black text-blue-600 mt-1">₦432,000</p>
                  <span className="inline-block mt-2 text-[10px] font-bold text-blue-700 bg-blue-50 border border-blue-200 px-2 py-0.5 rounded-full">
                    10% Statutory Rate
                  </span>
                </div>

                <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-2xs">
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                    Tour Policy
                  </span>
                  <p className="text-xl font-black text-emerald-700 mt-1">₦0 Free Tour</p>
                  <span className="inline-block mt-2 text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                    Optional for Tenants
                  </span>
                </div>
              </div>

              {/* Action Bar */}
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-bold text-slate-900">Vetted Kaduna Properties Under Management</h3>
                  <p className="text-xs text-slate-500">
                    Properties verified under HB&amp;A Landlord mandates. Tenants may book optional free tours or apply directly.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setActiveTab("add_property")}
                  className="rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 text-xs font-bold transition-all shadow-md shadow-emerald-600/20 cursor-pointer flex items-center gap-1.5"
                >
                  <PlusCircle className="w-3.5 h-3.5" />
                  <span>List New Property</span>
                </button>
              </div>

              {/* Listings Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {listings.map((item) => (
                  <div key={item.id} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs flex gap-3.5">
                    <div className="relative h-24 w-28 flex-shrink-0 overflow-hidden rounded-xl border border-slate-200">
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
                          <span className="rounded-full bg-emerald-50 text-emerald-700 text-[10px] font-bold px-2 py-0.2 border border-emerald-200">
                            Active
                          </span>
                        </div>
                        <h4 className="text-xs font-bold text-slate-900 truncate mt-0.5">{item.title}</h4>
                        <p className="text-[11px] text-slate-500 truncate">{item.full_address}</p>
                      </div>

                      <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs">
                        <span className="font-black text-blue-700">
                          ₦{item.pricing.annual_rent.toLocaleString("en-NG")}/yr
                        </span>
                        <span className="text-[10px] text-slate-400 font-mono">
                          Mandate: {item.mandate.mandate_ref}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 2: ADD NEW PROPERTY FORM */}
          {activeTab === "add_property" && (
            <div className="space-y-5">
              <div className="rounded-2xl bg-emerald-50/70 border border-emerald-200 p-4 text-xs text-emerald-900">
                <strong className="block mb-1 text-sm font-bold text-emerald-950 flex items-center gap-1.5">
                  <ClipboardList className="w-4 h-4 text-emerald-800" />
                  <span>Official Kaduna Property Onboarding</span>
                </strong>
                Every property listed on Settlla automatically calculates statutory 4-way upfront pricing (Rent, 10% Caution, 5% Legal, 10% Agency) and binds to your agency mandate.
              </div>

              {formSuccess && (
                <div className="rounded-2xl bg-emerald-600 text-white p-4 text-center font-bold text-sm animate-fade-in flex items-center justify-center gap-2">
                  <Check className="w-4 h-4" />
                  <span>Property listed successfully with verified statutory mandate! Redirecting to inventory...</span>
                </div>
              )}

              <form onSubmit={handleAddPropertySubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">
                      Property Title <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Luxury 2-Bedroom Apartment at Malali Palms"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-xs text-slate-900 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">
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
                    <label className="text-xs font-bold text-slate-700 block mb-1">
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
                    <label className="text-xs font-bold text-slate-700 block mb-1">
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
                    <label className="text-xs font-bold text-slate-700 block mb-1">
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
                    <label className="text-xs font-bold text-slate-700 block mb-1">
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
                    <label className="text-xs font-bold text-slate-700 block mb-1">
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

                {/* Auto-calculated Statutory 4-Way Breakdown Preview */}
                <div className="rounded-2xl border border-blue-200 bg-blue-50/60 p-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-blue-900 uppercase">
                      Automated 4-Way Statutory Pricing Breakdown
                    </span>
                    <span className="text-sm font-black text-blue-700">
                      Total Move-In: ₦{calculatedPricing.total_move_in_cost.toLocaleString("en-NG")}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                    <div className="bg-white p-2 rounded-xl border border-slate-200">
                      <span className="text-slate-500 block text-[10px]">Net Rent:</span>
                      <strong>₦{calculatedPricing.annual_rent.toLocaleString("en-NG")}</strong>
                    </div>
                    <div className="bg-white p-2 rounded-xl border border-slate-200">
                      <span className="text-slate-500 block text-[10px]">Caution (10%):</span>
                      <strong>₦{calculatedPricing.caution_fee.toLocaleString("en-NG")}</strong>
                    </div>
                    <div className="bg-white p-2 rounded-xl border border-slate-200">
                      <span className="text-slate-500 block text-[10px]">Legal (5%):</span>
                      <strong>₦{calculatedPricing.legal_fee.toLocaleString("en-NG")}</strong>
                    </div>
                    <div className="bg-white p-2 rounded-xl border border-slate-200">
                      <span className="text-slate-500 block text-[10px]">Agency (10%):</span>
                      <strong>₦{calculatedPricing.agency_fee.toLocaleString("en-NG")}</strong>
                    </div>
                  </div>
                </div>

                {/* Landlord & Title Mandate */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">
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
                    <label className="text-xs font-bold text-slate-700 block mb-1">
                      KADGIS Title Document Reference
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. KADGIS Certificate of Occupancy No. KDL-BNW-2026-099"
                      value={titleReference}
                      onChange={(e) => setTitleReference(e.target.value)}
                      className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-xs text-slate-900 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
                    />
                  </div>
                </div>

                {/* Verified Amenities Multi-Select */}
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1.5">
                    Select Verified Amenities
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
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
                        className={`flex items-center gap-2 rounded-xl border p-2.5 text-xs transition-colors cursor-pointer ${
                          selectedAmenities.includes(amenity)
                            ? "border-emerald-500 bg-emerald-50/60 text-emerald-900"
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

                <div className="pt-2">
                  <button
                    type="submit"
                    className="w-full rounded-xl bg-emerald-600 hover:bg-emerald-700 py-3 text-xs sm:text-sm font-bold text-white transition-all shadow-md shadow-emerald-600/25 cursor-pointer"
                  >
                    Publish Verified Property with HB&amp;A Mandate
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* TAB 3: PRE-CERTIFIED MANDATES & EXECUTED LEASES */}
          {activeTab === "counter_sign" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                    <BadgeCheck className="w-5 h-5 text-emerald-600" />
                    <span>Mandate Attestation &amp; Executed Leases</span>
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    All listings carry pre-certified manager counter-signatures under registered landlord mandates for instant zero-delay execution.
                  </p>
                </div>
              </div>

              <div className="rounded-2xl bg-emerald-50/70 border border-emerald-200 p-4 text-xs text-emerald-900 flex items-start gap-3">
                <ShieldCheck className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
                <div>
                  <strong className="text-slate-900 block mb-0.5">Pre-Certified Listing Mandate Enforced:</strong>
                  <span>All listings are pre-endorsed with ESVARBON accreditation. Tenants execute their digital signature and proceed directly to escrow payment without waiting for counter-signing.</span>
                </div>
              </div>

              {activeRental ? (
                <div className="rounded-2xl border border-emerald-200 bg-white p-5 shadow-xs space-y-3">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                    <div>
                      <span className="rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2.5 py-0.5 border border-emerald-300 flex items-center gap-1 w-fit">
                        <CheckCircle2 className="w-3 h-3 text-emerald-700" />
                        <span>Live Executed Tenancy &bull; Pre-Certified Mandate</span>
                      </span>
                      <h4 className="text-sm font-bold text-slate-900 mt-1">{activeRental.listing?.title || "Barnawa Terraces Flat 1"}</h4>
                      <p className="text-xs text-slate-600">
                        Tenant: <strong>{activeRental.agreement?.tenant?.full_name || "Active Tenant"}</strong> ({activeRental.agreement?.tenant?.phone_number || "0803 123 4567"})
                      </p>
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] text-slate-500 block uppercase font-bold">Total Move-In Paid</span>
                      <span className="text-base font-black text-emerald-700">
                        ₦{activeRental.transaction?.total_amount_paid?.toLocaleString("en-NG") || "625,000"}
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-3 border-t border-slate-100 text-xs">
                    <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                      <span className="text-slate-400 block text-[10px] uppercase font-bold">Mandate Ref</span>
                      <span className="font-mono text-xs font-bold text-slate-800">{activeRental.listing?.mandate?.mandate_ref || "HBA-KD-BNW-2026-089"}</span>
                    </div>
                    <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                      <span className="text-slate-400 block text-[10px] uppercase font-bold">Move-In Pass</span>
                      <span className="font-mono text-xs font-bold text-blue-700">{activeRental.move_in_pass?.pass_id || "SETT-MIP-8921"}</span>
                    </div>
                    <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                      <span className="text-slate-400 block text-[10px] uppercase font-bold">Agency Payout (10%)</span>
                      <span className="font-mono text-xs font-bold text-emerald-700">₦{activeRental.listing?.pricing?.agency_fee?.toLocaleString("en-NG") || "50,000"}</span>
                    </div>
                  </div>
                </div>
              ) : (
                pendingAgreements.map((agr) => {
                  return (
                    <div key={agr.agreement_id} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs space-y-3">
                      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                        <div>
                          <span className="rounded-full bg-blue-50 text-blue-800 text-[10px] font-bold px-2.5 py-0.5 border border-blue-200 flex items-center gap-1 w-fit">
                            <ShieldCheck className="w-3 h-3 text-blue-700" />
                            <span>Pre-Certified Mandate Active</span>
                          </span>
                          <h4 className="text-sm font-bold text-slate-900 mt-1">{agr.property_title}</h4>
                          <p className="text-xs text-slate-600">
                            Mandate Ref: <strong>{agr.manager_mandate_ref}</strong> &bull; {agr.manager_accreditation}
                          </p>
                        </div>
                        <div className="text-right">
                          <span className="text-[10px] text-slate-500 block uppercase font-bold">Lease Value</span>
                          <span className="text-base font-black text-blue-700">
                            ₦{agr.pricing.total_move_in_cost.toLocaleString("en-NG")}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-3 border-t border-slate-100 text-xs text-slate-500">
                        <span>Pre-signed with digital certificate. Dual execution activates instantly upon tenant signing.</span>
                        <span className="font-mono text-[10px] text-emerald-700 font-bold bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200">
                          Pre-Certified Ready
                        </span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          )}

          {/* TAB 4: TOURS APPOINTMENTS */}
          {activeTab === "tours" && (
            <div className="space-y-4">
              <div className="rounded-2xl bg-blue-50/70 border border-blue-100 p-4 text-xs text-slate-700">
                <strong className="text-slate-900 mb-1 flex items-center gap-1.5 font-bold">
                  <Info className="w-4 h-4 text-blue-600" />
                  <span>Free Walkthrough Visiting Windows</span>
                </strong>
                Tenants can book 30-minute walkthroughs during your scheduled visiting windows. You will never charge any cash or roadside fee at the gate.
              </div>

              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
                <div>
                  <span className="rounded-full bg-emerald-50 text-emerald-700 text-[10px] font-bold px-2 py-0.5 border border-emerald-200">
                    Confirmed Appointment
                  </span>
                  <h4 className="text-sm font-bold text-slate-900 mt-1">Aminu Mohammed (NYSC Corps Member)</h4>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Plot 12 Coronation Crescent, Barnawa • Fri, Sep 18, 2026 at 2:30 PM
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <a
                    href="https://wa.me/2348031234567"
                    target="_blank"
                    rel="noreferrer"
                    className="rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 px-3 py-1.5 font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <MessageSquare className="w-3.5 h-3.5" />
                    <span>WhatsApp Tenant</span>
                  </a>
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: COMMISSION & ESCROW PAYOUTS */}
          {activeTab === "payouts" && (
            <div className="space-y-4">
              <div>
                <h3 className="text-base font-bold text-slate-900">Agency Commission &amp; Legal Fee Payouts</h3>
                <p className="text-xs text-slate-500">
                  Direct statutory payouts generated upon 24-hr key handover confirmation.
                </p>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-xs">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 uppercase text-[10px] font-bold">
                    <tr>
                      <th className="py-3 px-4">Listing</th>
                      <th className="py-3 px-4">Mandate Ref</th>
                      <th className="py-3 px-4">Agency Fee (10%)</th>
                      <th className="py-3 px-4">Legal Fee (5%)</th>
                      <th className="py-3 px-4 text-right">Escrow Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-700">
                    <tr>
                      <td className="py-3.5 px-4 font-bold text-slate-900">
                        Barnawa Terraces Flat 1
                      </td>
                      <td className="py-3.5 px-4 text-slate-500 font-mono">
                        HBA-KD-BNW-2026-089
                      </td>
                      <td className="py-3.5 px-4 font-black text-emerald-700">
                        ₦50,000
                      </td>
                      <td className="py-3.5 px-4 font-black text-blue-700">
                        ₦25,000
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <span className="rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 text-[10px] font-bold">
                          Ready for Release
                        </span>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
