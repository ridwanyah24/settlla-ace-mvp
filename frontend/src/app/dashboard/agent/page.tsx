"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useAuth } from "@/context/AuthContext";
import { SEED_LISTINGS, calculatePricing } from "@/data/seedListings";
import { Listing } from "@/types/listing";
import { InspectionBookingResponse } from "@/types/booking";
import { TenancyAgreement } from "@/types/agreement";
import {
  Building2,
  PlusCircle,
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
  ExternalLink,
  MessageSquare,
  Sparkles,
  UserCheck,
} from "lucide-react";
import {
  DashboardShell,
  DashboardStat,
  DashboardSectionHead,
  DashboardCallout,
  type DashboardTabItem,
} from "@/components/dashboard/DashboardShell";
import { upsertListing, fetchPublishedListingsFromBrowser, seedListingsIfEmpty } from "@/lib/settlla/listings";
import { loadCurrentTenantRental, fetchAgentRentals } from "@/lib/settlla/rentals";
import { fetchAgentBookings } from "@/lib/settlla/bookings";
import { fetchPendingAgreements } from "@/lib/settlla/manager";
import { isSupabaseConfigured } from "@/lib/supabase/config";

const AGENT_TABS: DashboardTabItem[] = [
  { id: "listings", label: "Properties", icon: Home },
  { id: "add_property", label: "Add listing", icon: PlusCircle },
  { id: "counter_sign", label: "Leases", icon: BadgeCheck },
  { id: "tours", label: "Tours", icon: CalendarCheck },
  { id: "payouts", label: "Payouts", icon: Wallet },
];

export default function AgentDashboardPage() {
  const { currentUser, signOut, switchRole } = useAuth();
  const [activeTab, setActiveTab] = useState<"listings" | "add_property" | "counter_sign" | "tours" | "payouts">("listings");

  const [listings, setListings] = useState<Listing[]>([]);
  const [activeRental, setActiveRental] = useState<any>(null);
  const [tours, setTours] = useState<InspectionBookingResponse[]>([]);
  const [pendingLeases, setPendingLeases] = useState<TenancyAgreement[]>([]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        if (isSupabaseConfigured()) {
          await seedListingsIfEmpty();
          const [liveListings, rentals, agentTours, leases] = await Promise.all([
            fetchPublishedListingsFromBrowser(),
            fetchAgentRentals(),
            fetchAgentBookings(),
            fetchPendingAgreements(),
          ]);
          if (!cancelled) {
            setListings(liveListings);
            if (rentals[0]) setActiveRental(rentals[0]);
            setTours(agentTours);
            setPendingLeases(leases as TenancyAgreement[]);
          }
        } else {
          const rental = await loadCurrentTenantRental();
          if (!cancelled) {
            setListings(SEED_LISTINGS);
            if (rental) setActiveRental(rental);
          }
        }
      } catch (e) {
        console.error("Failed to load agent dashboard", e);
      }
    })();
    return () => {
      cancelled = true;
    };
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
    void upsertListing(newListing, currentUser?.id ?? null);
    setSuccessMessage(`Successfully listed ${newListing.title} under mandate ${newListing.mandate.mandate_ref}!`);
    setTimeout(() => {
      setSuccessMessage(null);
      setActiveTab("listings");
    }, 1500);
  };

  const agencyName = currentUser?.agencyName || "HB&A Partners & Co.";

  return (
    <DashboardShell
      accent="agent"
      hubBadge="Agent"
      hubSubtitle="Property & mandate desk"
      currentNavLabel="Agent dashboard"
      feedLinkLabel="Public listings"
      userTitle={agencyName}
      userSubtitle={currentUser?.accreditation || "ESVARBON accredited"}
      pageTitle={agencyName}
      pageDescription={`Officer: ${currentUser?.fullName || "Barrister Amina Yakubu"} · ${currentUser?.phoneNumber || "0803 555 1289"}`}
      pageMeta={
        <>
          <span className="settlla-chip">
            <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
            Mandates verified
          </span>
          <span className="settlla-chip">{listings.length} active listings</span>
        </>
      }
      pageAction={
        <button
          type="button"
          onClick={() => setActiveTab("add_property")}
          className="btn btn-md btn-primary w-full sm:w-auto"
        >
          <PlusCircle className="h-4 w-4" />
          Add property
        </button>
      }
      tabs={AGENT_TABS}
      activeTab={activeTab}
      onTabChange={(id) => setActiveTab(id as typeof activeTab)}
      onSwitchRole={() => switchRole("tenant")}
      switchRoleLabel="Tenant view"
      onSignOut={signOut}
      mobileNavActiveLabel="Desk"
    >
        {/* TAB 1: MANAGED PROPERTIES */}
        {activeTab === "listings" && (
          <div className="space-y-6">
            <DashboardSectionHead
              title="Portfolio"
              description="Managed listings on the Settlla feed."
            />
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <DashboardStat
                label="Listings"
                value={`${listings.length}`}
                icon={Home}
                hint={<span className="dashboard-stat-hint">Vetted mandates</span>}
              />
              <DashboardStat
                label="Executed leases"
                value={activeRental ? 1 : 0}
                icon={BadgeCheck}
                hint={<span className="dashboard-stat-hint">Live tenancies</span>}
              />
              <DashboardStat
                label="Agency fees"
                value={`₦${listings.reduce((sum, l) => sum + (l.pricing.agency_fee || 0), 0).toLocaleString("en-NG")}`}
                icon={Wallet}
                hint={<span className="dashboard-stat-hint">10% statutory</span>}
              />
              <DashboardStat
                label="Walkthroughs"
                value={`${tours.length}`}
                icon={ShieldCheck}
                hint={<span className="dashboard-stat-hint">Booked tours</span>}
              />
            </div>

            {/* Properties List */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {listings.length === 0 ? (
                <div className="settlla-card p-8 text-center text-sm text-slate-500 md:col-span-2">
                  No listings in Supabase yet. Use <strong>Add listing</strong> to publish one.
                </div>
              ) : (
              listings.map((item) => (
                <div key={item.id} className="settlla-card settlla-card-interactive p-4 sm:p-5 flex flex-col sm:flex-row gap-3 sm:gap-4">
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
              ))
              )}
            </div>
          </div>
        )}

        {/* TAB 2: ADD PROPERTY */}
        {activeTab === "add_property" && (
          <div className="space-y-6">
            <DashboardSectionHead
              title="New listing"
              description="Move-in pricing (rent, caution, legal & agency) is calculated automatically from annual rent."
            />
            <DashboardCallout variant="success" icon={Sparkles} title="Publish to the Settlla feed">
              Listings must have a verified landlord mandate. Tenants see full upfront cost before they sign or pay.
            </DashboardCallout>

            {successMessage && (
              <div className="rounded-2xl bg-emerald-600 text-white p-4 text-center font-bold text-sm flex items-center justify-center gap-2 animate-fade-in">
                <CheckCircle2 className="h-5 w-5" />
                <span>{successMessage}</span>
              </div>
            )}

            <form onSubmit={handleAddPropertySubmit} className="settlla-card p-6 sm:p-8 space-y-5">
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

              <button type="submit" className="btn btn-lg btn-primary w-full">
                <PlusCircle className="h-4 w-4" />
                Publish listing
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
            ) : pendingLeases.length > 0 ? (
              <div className="space-y-3">
                {pendingLeases.map((agr) => (
                  <div
                    key={agr.agreement_id}
                    className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xs space-y-2"
                  >
                    <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 text-amber-800 text-[10px] font-bold px-2.5 py-0.5 border border-amber-200">
                      {agr.status}
                    </span>
                    <h4 className="text-base font-bold text-slate-900">{agr.property_title}</h4>
                    <p className="text-xs text-slate-600">
                      Tenant: <strong>{agr.tenant?.full_name}</strong> · Mandate {agr.manager_mandate_ref}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="rounded-3xl border border-slate-200 bg-white p-8 text-center text-sm text-slate-500">
                No leases waiting for counter-signature. They appear here when a tenant signs.
              </div>
            )}
          </div>
        )}

        {/* TAB 4: TOUR APPOINTMENTS */}
        {activeTab === "tours" && (
          <div className="space-y-4">
            {tours.length === 0 ? (
              <div className="settlla-card p-8 text-center text-sm text-slate-500">
                No walkthrough bookings yet. They appear here when a tenant books a tour.
              </div>
            ) : (
              tours.map((tour) => (
                <div key={tour.booking_id} className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xs space-y-4">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
                    <div>
                      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 text-emerald-700 text-[10px] font-bold px-2.5 py-0.5 border border-emerald-200">
                        <CheckCircle2 className="h-3 w-3" />
                        <span>{tour.booking_status || "Confirmed"}</span>
                      </span>
                      <h4 className="text-base font-bold text-slate-900 mt-1">{tour.tenant_name}</h4>
                      <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                        <MapPin className="h-3.5 w-3.5 text-slate-400" />
                        <span>{tour.property_address}</span>
                      </p>
                    </div>
                    <div className="text-right">
                      <span className="text-sm font-bold text-blue-600 block">{tour.formatted_date}</span>
                      <span className="text-xs text-slate-500">{tour.slot_time}</span>
                    </div>
                  </div>
                  <p className="text-xs text-slate-500">{tour.directions}</p>
                </div>
              ))
            )}
          </div>
        )}

        {/* TAB 5: COMMISSION & PAYOUTS */}
        {activeTab === "payouts" && (
          <div className="space-y-4">
            <DashboardSectionHead
              title="Commission & payouts"
              description="Disbursed after tenant confirms key handover."
            />
            <div className="settlla-card overflow-hidden">
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
                  {activeRental ? (
                  <tr>
                    <td className="py-4 px-4 font-bold text-slate-900">{activeRental.listing?.title}</td>
                    <td className="py-4 px-4 font-mono text-slate-500">{activeRental.listing?.mandate?.mandate_ref}</td>
                    <td className="py-4 px-4 font-black text-emerald-700 text-sm">
                      ₦{(activeRental.listing?.pricing?.agency_fee || 0).toLocaleString("en-NG")}
                    </td>
                    <td className="py-4 px-4 font-black text-blue-700 text-sm">
                      ₦{(activeRental.listing?.pricing?.legal_fee || 0).toLocaleString("en-NG")}
                    </td>
                    <td className="py-4 px-4 text-right">
                      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 px-2.5 py-0.5 text-[10px] font-bold">
                        <CheckCircle2 className="h-3 w-3" />
                        <span>{activeRental.escrow_hold?.escrow_status || "holding"}</span>
                      </span>
                    </td>
                  </tr>
                  ) : (
                  <tr>
                    <td className="py-8 px-4 text-center text-slate-500" colSpan={5}>
                      Payouts appear after a tenant completes checkout (payment is still simulated).
                    </td>
                  </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
    </DashboardShell>
  );
}
