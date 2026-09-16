"use client";

import React, { useState, useEffect } from "react";
import { Navbar } from "./Navbar";
import { HeroSection } from "./HeroSection";
import { FilterBar } from "./FilterBar";
import { ListingCard } from "./ListingCard";
import { ListingDetailModal } from "./ListingDetailModal";
import { BookingDrawer } from "./BookingDrawer";
import { TenancyAgreementViewer } from "./TenancyAgreementViewer";
import { SignatureWorkflowModal } from "./SignatureWorkflowModal";
import { ManagerQueueModal } from "./ManagerQueueModal";
import { CheckoutPaymentModal } from "./CheckoutPaymentModal";
import { MoveInPassViewer } from "./MoveInPassViewer";
import { MoveInEscrowDashboardModal } from "./MoveInEscrowDashboardModal";
import { LandingSections } from "./LandingSections";
import { Listing } from "@/types/listing";
import { TenantProfile, TenancyAgreement } from "@/types/agreement";
import { MoveInPass, PaymentTransaction, EscrowHoldRecord } from "@/types/payment";

interface SettllaAppProps {
  initialListings: Listing[];
}

export const SettllaApp: React.FC<SettllaAppProps> = ({ initialListings }) => {
  const [listings, setListings] = useState<Listing[]>(initialListings);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Filter States
  const [neighborhood, setNeighborhood] = useState("all");
  const [maxBudget, setMaxBudget] = useState("all");
  const [propertyType, setPropertyType] = useState("all");
  const [quickFilter, setQuickFilter] = useState("all");

  // Separate Modal, Drawer, and Agreement States
  const [listingForDetail, setListingForDetail] = useState<Listing | null>(null);
  const [listingForBooking, setListingForBooking] = useState<Listing | null>(null);
  const [listingForAgreement, setListingForAgreement] = useState<Listing | null>(null);
  const [agreementTenant, setAgreementTenant] = useState<Partial<TenantProfile> | undefined>(undefined);

  // Signature Workflow States (Feature #4)
  const [signingAgreement, setSigningAgreement] = useState<TenancyAgreement | null>(null);
  const [signingListing, setSigningListing] = useState<Listing | null>(null);
  const [signingRole, setSigningRole] = useState<"tenant" | "manager">("tenant");
  const [managerQueueOpen, setManagerQueueOpen] = useState(false);
  const [pendingCount, setPendingCount] = useState(0);

  // 4-Way Split Payment Engine & Move-In Pass States (Feature #5)
  const [checkoutAgreement, setCheckoutAgreement] = useState<TenancyAgreement | null>(null);
  const [checkoutListing, setCheckoutListing] = useState<Listing | null>(null);
  const [activePass, setActivePass] = useState<MoveInPass | null>(null);
  const [activePassAgreement, setActivePassAgreement] = useState<TenancyAgreement | null>(null);
  const [activePassListing, setActivePassListing] = useState<Listing | null>(null);
  const [recentTransaction, setRecentTransaction] = useState<PaymentTransaction | null>(null);

  // Key-in-Door Move-In Escrow Protection States (Feature #6)
  const [activeEscrow, setActiveEscrow] = useState<EscrowHoldRecord | null>(null);
  const [escrowDashboardOpen, setEscrowDashboardOpen] = useState(false);

  // Fetch pending signature count for manager badge
  const refreshPendingCount = async () => {
    try {
      const res = await fetch("http://127.0.0.1:8000/api/manager/pending-signatures");
      if (res.ok) {
        const data = await res.json();
        setPendingCount(data.pending_count || 0);
      }
    } catch {
      // ignore
    }
  };

  useEffect(() => {
    refreshPendingCount();
  }, []);

  useEffect(() => {
    async function loadFiltered() {
      // If default filters and initialListings already populated, use initialListings
      if (
        neighborhood === "all" &&
        maxBudget === "all" &&
        propertyType === "all" &&
        quickFilter === "all" &&
        initialListings.length > 0
      ) {
        setListings(initialListings);
        setError(null);
        return;
      }

      setLoading(true);
      try {
        const params = new URLSearchParams();
        if (neighborhood !== "all") params.append("neighborhood", neighborhood);
        if (maxBudget !== "all") params.append("max_budget", maxBudget);
        if (propertyType !== "all") params.append("property_type", propertyType);
        if (quickFilter !== "all") params.append("quick_filter", quickFilter);

        const url = `http://127.0.0.1:8000/api/listings?${params.toString()}`;
        const res = await fetch(url);
        if (!res.ok) throw new Error("Failed to fetch filtered listings");
        const data = await res.json();
        setListings(data.listings || []);
        setError(null);
      } catch {
        setError("Unable to connect to FastAPI backend at http://127.0.0.1:8000");
      } finally {
        setLoading(false);
      }
    }

    loadFiltered();
  }, [neighborhood, maxBudget, propertyType, quickFilter, initialListings]);

  const handleResetFilters = () => {
    setNeighborhood("all");
    setMaxBudget("all");
    setPropertyType("all");
    setQuickFilter("all");
  };

  const scrollToFeed = () => {
    const el = document.getElementById("featured-properties");
    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
    }
  };

  const handleOpenDetail = (item: Listing) => {
    setListingForBooking(null);
    setListingForAgreement(null);
    setListingForDetail(item);
  };

  const handleOpenBooking = (item: Listing) => {
    setListingForDetail(null);
    setListingForAgreement(null);
    setListingForBooking(item);
  };

  const handleOpenAgreement = (item: Listing, tenantData?: Partial<TenantProfile>) => {
    setListingForDetail(null);
    setListingForBooking(null);
    if (tenantData) setAgreementTenant(tenantData);
    setListingForAgreement(item);
  };

  const handleProceedToSignature = (agreement: TenancyAgreement) => {
    const targetListing = listings.find((l) => l.id === agreement.listing_id) || listingForAgreement || listings[0];
    setListingForAgreement(null);
    setSigningListing(targetListing);
    setSigningAgreement(agreement);
    setSigningRole("tenant");
  };

  const handleOpenSigningWorkflowFromQueue = (agreement: TenancyAgreement, listing: Listing, role: "tenant" | "manager") => {
    setSigningAgreement(agreement);
    setSigningListing(listing);
    setSigningRole(role);
  };

  const handleAgreementUpdated = (updated: TenancyAgreement) => {
    setSigningAgreement(updated);
    refreshPendingCount();

    if (updated.status === "fully_executed") {
      // Mark listing as reserved
      setListings((prev) =>
        prev.map((l) => (l.id === updated.listing_id ? { ...l, status: "reserved" } : l))
      );
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 font-sans selection:bg-blue-600 selection:text-white">
      {/* 1. Header & Announcement */}
      <Navbar
        verifiedCount={listings.length}
        pendingManagerSignatures={pendingCount}
        onOpenManagerDesk={() => setManagerQueueOpen(true)}
        activeEscrowStatus={activeEscrow?.escrow_status || "holding"}
        onOpenEscrowDashboard={() => setEscrowDashboardOpen(true)}
      />

      {/* 2. Hero Section matching reference image */}
      <HeroSection
        neighborhood={neighborhood}
        setNeighborhood={setNeighborhood}
        maxBudget={maxBudget}
        setMaxBudget={setMaxBudget}
        propertyType={propertyType}
        setPropertyType={setPropertyType}
        onSearch={scrollToFeed}
      />

      {/* 3. Main Web Feed: Featured Vetted Apartments */}
      <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        {/* Filter Bar with Quick Chips */}
        <FilterBar
          neighborhood={neighborhood}
          setNeighborhood={setNeighborhood}
          maxBudget={maxBudget}
          setMaxBudget={setMaxBudget}
          propertyType={propertyType}
          setPropertyType={setPropertyType}
          quickFilter={quickFilter}
          setQuickFilter={setQuickFilter}
          onReset={handleResetFilters}
          totalFound={listings.length}
        />

        {error && (
          <div className="mb-8 rounded-2xl border border-rose-200 bg-rose-50 p-4 text-rose-800 text-sm font-medium">
            ⚠️ {error}
          </div>
        )}

        {/* Listings Grid */}
        <section className="mb-20">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20">
              <div className="h-10 w-10 animate-spin rounded-full border-4 border-blue-600 border-t-transparent"></div>
              <p className="mt-4 text-xs font-semibold text-slate-500">
                Filtering verified Kaduna properties...
              </p>
            </div>
          ) : listings.length === 0 ? (
            <div className="rounded-3xl border border-slate-200 bg-white py-16 px-6 text-center shadow-xs">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50 text-2xl text-blue-600 mb-3">
                🔍
              </div>
              <h3 className="text-lg font-bold text-slate-900">No matching verified apartments found</h3>
              <p className="mt-1 text-xs text-slate-500 max-w-md mx-auto">
                Try loosening your budget ceiling or switching between Barnawa and Malali to see available verified properties.
              </p>
              <button
                onClick={handleResetFilters}
                className="mt-4 rounded-xl bg-blue-600 px-5 py-2.5 text-xs font-bold text-white hover:bg-blue-700 transition-colors cursor-pointer shadow-md shadow-blue-500/20"
              >
                Reset All Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {listings.map((listing) => (
                <ListingCard
                  key={listing.id}
                  listing={listing}
                  onSelect={handleOpenDetail}
                  onBookInspection={handleOpenBooking}
                />
              ))}
            </div>
          )}
        </section>
      </main>

      {/* 4. Complete Landing Sections from Reference Design */}
      <LandingSections onExploreFeed={scrollToFeed} />

      {/* 5. Listing Detail Modal (Screen 1 Detail View) */}
      <ListingDetailModal
        listing={listingForDetail}
        onClose={() => setListingForDetail(null)}
        onBookInspection={(item) => {
          setListingForDetail(null);
          setListingForBooking(item);
        }}
        onDraftAgreement={(item) => handleOpenAgreement(item)}
      />

      {/* 6. Direct Booking Drawer (Screen 2 & 3 Flow) */}
      {listingForBooking && (
        <BookingDrawer
          isOpen={Boolean(listingForBooking)}
          onClose={() => setListingForBooking(null)}
          listing={listingForBooking}
          onProceedToAgreement={(item, tenant) => {
            handleOpenAgreement(item, {
              full_name: tenant.fullName,
              phone_number: tenant.phoneNumber,
              email_address: tenant.emailAddress,
              employer_name: tenant.relocationContext,
            });
          }}
        />
      )}

      {/* 7. Dynamic Tenancy Agreement Generator (Screen 5) */}
      {listingForAgreement && (
        <TenancyAgreementViewer
          isOpen={Boolean(listingForAgreement)}
          onClose={() => setListingForAgreement(null)}
          listing={listingForAgreement}
          initialTenantProfile={agreementTenant}
          onProceedToSignature={handleProceedToSignature}
        />
      )}

      {/* 8. Feature #4: Two-Party Electronic Signature Workflow Modal (Screens 5 & 6) */}
      {signingAgreement && signingListing && (
        <SignatureWorkflowModal
          isOpen={Boolean(signingAgreement)}
          onClose={() => setSigningAgreement(null)}
          agreement={signingAgreement}
          listing={signingListing}
          initialRole={signingRole}
          onAgreementUpdated={handleAgreementUpdated}
          onProceedToPayment={(agr) => {
            const targetListing =
              listings.find((l) => l.id === agr.listing_id) || signingListing || listings[0];
            setSigningAgreement(null);
            setCheckoutAgreement(agr);
            setCheckoutListing(targetListing);
          }}
        />
      )}

      {/* 9. Feature #5: 4-Way Automated Split Payment Checkout Modal (Screen 7) */}
      {checkoutAgreement && checkoutListing && (
        <CheckoutPaymentModal
          isOpen={Boolean(checkoutAgreement && checkoutListing)}
          onClose={() => setCheckoutAgreement(null)}
          agreement={checkoutAgreement}
          listing={checkoutListing}
          onPaymentSuccess={(tx) => {
            setRecentTransaction(tx);
            if (tx.escrow_hold) {
              setActiveEscrow(tx.escrow_hold);
            }
            if (tx.move_in_pass) {
              setActivePass(tx.move_in_pass);
              setActivePassAgreement(checkoutAgreement);
              setActivePassListing(checkoutListing);
            }
            // Mark property as reserved/occupied
            setListings((prev) =>
              prev.map((l) => (l.id === checkoutListing.id ? { ...l, status: "occupied" } : l))
            );
          }}
        />
      )}

      {/* 10. Standalone Move-In Pass Modal (Screen 7 Pass & Escrow Verification) */}
      {activePass && (
        <MoveInPassViewer
          isOpen={Boolean(activePass)}
          onClose={() => setActivePass(null)}
          pass={activePass}
          transaction={recentTransaction || undefined}
          onOpenDashboard={() => setEscrowDashboardOpen(true)}
        />
      )}

      {/* 11. Feature #6: Screen 8 Move-In Escrow Protection & Key Handover Dashboard Modal */}
      <MoveInEscrowDashboardModal
        isOpen={escrowDashboardOpen}
        onClose={() => setEscrowDashboardOpen(false)}
        escrowRecord={activeEscrow}
        listing={activePassListing || listings[0]}
        onEscrowUpdated={(updated) => setActiveEscrow(updated)}
      />

      {/* 12. Manager Lease Counter-Signing Desk Modal (Screen 6 Queue) */}
      <ManagerQueueModal
        isOpen={managerQueueOpen}
        onClose={() => setManagerQueueOpen(false)}
        listings={listings}
        onOpenSigningWorkflow={handleOpenSigningWorkflowFromQueue}
      />

      {/* Floating Active Pass / Escrow Quick-Access Notification */}
      {activePass && !activePassListing && (
        <div className="fixed bottom-6 right-6 z-40 flex flex-col gap-2 items-end">
          <button
            type="button"
            onClick={() => setEscrowDashboardOpen(true)}
            className="flex items-center gap-2 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white px-5 py-3 shadow-xl shadow-blue-600/30 text-xs sm:text-sm font-bold transition-all cursor-pointer"
          >
            <span>🛡️</span>
            <span>Move-In Escrow Dashboard</span>
          </button>
          <button
            type="button"
            onClick={() => setActivePassListing(listings[0])}
            className="flex items-center gap-2 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2.5 shadow-xl shadow-emerald-600/30 text-xs font-bold transition-all cursor-pointer"
          >
            <span>🎫</span>
            <span>View Pass ({activePass.pass_id})</span>
          </button>
        </div>
      )}
    </div>
  );
};

