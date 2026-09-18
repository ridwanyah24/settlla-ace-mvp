"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { AuthProvider, useAuth } from "@/context/AuthContext";
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
import { AISearchModal } from "./AISearchModal";
import { LandingSections } from "./LandingSections";
import { Listing } from "@/types/listing";
import { filterSeedListings, SEED_LISTINGS } from "@/data/seedListings";
import { TenantProfile, TenancyAgreement } from "@/types/agreement";
import { MoveInPass, PaymentTransaction, EscrowHoldRecord } from "@/types/payment";
import { AIMatchResult } from "@/types/aiSearch";
import { runAISearch } from "@/utils/aiSearch";
import { fetchPendingSignatureCount } from "@/lib/settlla/manager";
import { seedListingsIfEmpty, fetchPublishedListingsFromBrowser } from "@/lib/settlla/listings";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { RestorableModalLayer } from "@/types/modalStack";
import { useRestorableModalStack } from "@/hooks/useRestorableModalStack";
import { AlertCircle, Search, ShieldCheck, Ticket, Sparkles } from "lucide-react";

interface SettllaAppProps {
  initialListings?: Listing[];
}

const TENANT_ESCROW_DASHBOARD_PATH = "/dashboard/tenant?tab=escrow";

const SettllaAppInner: React.FC<SettllaAppProps> = ({ initialListings = SEED_LISTINGS }) => {
  const { currentUser, role } = useAuth();
  const router = useRouter();

  const [listings, setListings] = useState<Listing[]>(initialListings ?? []);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Filter States
  const [neighborhood, setNeighborhood] = useState("all");
  const [maxBudget, setMaxBudget] = useState("all");
  const [propertyType, setPropertyType] = useState("all");
  const [quickFilter, setQuickFilter] = useState("all");
  const [minBedrooms, setMinBedrooms] = useState("all");
  const [maxMoveInCost, setMaxMoveInCost] = useState("all");

  // Settlla AI Search States
  const [aiSearchOpen, setAiSearchOpen] = useState(false);
  const [aiSearchInitialQuery, setAiSearchInitialQuery] = useState("");
  const [activeAIQuery, setActiveAIQuery] = useState<string | null>(null);
  const [aiMatchesMap, setAiMatchesMap] = useState<Record<string, AIMatchResult>>({});

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

  const restoreModalLayer = useCallback((layer: RestorableModalLayer) => {
    switch (layer.type) {
      case "ai-search":
        setAiSearchOpen(true);
        break;
      case "listing-detail":
        setListingForDetail(layer.listing);
        break;
      case "booking":
        setListingForBooking(layer.listing);
        break;
      case "agreement":
        setAgreementTenant(layer.tenant);
        setListingForAgreement(layer.listing);
        break;
      case "signature":
        setSigningAgreement(layer.agreement);
        setSigningListing(layer.listing);
        setSigningRole(layer.role);
        break;
      case "checkout":
        setCheckoutAgreement(layer.agreement);
        setCheckoutListing(layer.listing);
        break;
      case "move-in-pass":
        setActivePass(layer.pass);
        setActivePassAgreement(layer.agreement);
        setActivePassListing(layer.listing);
        break;
      case "escrow-dashboard":
        router.push(TENANT_ESCROW_DASHBOARD_PATH);
        break;
      case "manager-queue":
        setManagerQueueOpen(true);
        break;
    }
  }, [router]);

  const { pushModalLayer, clearModalStack, dismissWithRestore } =
    useRestorableModalStack(restoreModalLayer);

  // Fetch pending signature count for manager badge
  const refreshPendingCount = async () => {
    try {
      setPendingCount(await fetchPendingSignatureCount());
    } catch {
      setPendingCount(0);
    }
  };

  useEffect(() => {
    refreshPendingCount();

    // Expired confirmation links used to dump users here and break signup.
    const params = new URLSearchParams(window.location.search);
    const errorCode = (params.get("error_code") || "").toLowerCase();
    const description = (params.get("error_description") || "").toLowerCase();
    if (
      errorCode === "otp_expired" ||
      description.includes("email link is invalid") ||
      description.includes("email link is expired")
    ) {
      router.replace(
        `/login?error=confirm&message=${encodeURIComponent(
          "That email link is expired. Sign in and enter the verification code from your email instead."
        )}`
      );
    }

    // Cross-page or direct hash scrolling handler
    const handleHashScroll = () => {
      if (typeof window !== "undefined" && window.location.hash) {
        const targetId = window.location.hash.replace("#", "");
        setTimeout(() => {
          const el = document.getElementById(targetId);
          if (el) {
            el.scrollIntoView({ behavior: "smooth" });
          }
        }, 150);
      }
    };

    handleHashScroll();
    window.addEventListener("hashchange", handleHashScroll);
    return () => window.removeEventListener("hashchange", handleHashScroll);
  }, [router]);

  useEffect(() => {
    async function loadFiltered() {
      // If an active AI search query is present, prioritize AI match ranking
      if (activeAIQuery) {
        const { results } = runAISearch(activeAIQuery, initialListings);
        const map: Record<string, AIMatchResult> = {};
        results.forEach((r) => {
          map[r.listing.id] = r;
        });
        setAiMatchesMap(map);
        setListings(results.map((r) => r.listing));
        setError(null);
        return;
      }

      setAiMatchesMap({});
      let inventory = initialListings ?? [];
      if (isSupabaseConfigured()) {
        try {
          await seedListingsIfEmpty();
          inventory = await fetchPublishedListingsFromBrowser();
        } catch {
          /* use initialListings */
        }
      } else if (!inventory.length) {
        inventory = SEED_LISTINGS;
      }
      const clientFiltered = filterSeedListings(
        neighborhood,
        maxBudget,
        propertyType,
        quickFilter,
        minBedrooms,
        maxMoveInCost,
        inventory
      );
      setListings(clientFiltered);
      setError(null);
    }

    loadFiltered();
  }, [
    neighborhood,
    maxBudget,
    propertyType,
    quickFilter,
    minBedrooms,
    maxMoveInCost,
    activeAIQuery,
    initialListings,
  ]);

  const handleResetFilters = () => {
    setNeighborhood("all");
    setMaxBudget("all");
    setPropertyType("all");
    setQuickFilter("all");
    setMinBedrooms("all");
    setMaxMoveInCost("all");
    setActiveAIQuery(null);
    setAiMatchesMap({});
  };

  const handleOpenAISearch = (queryPrompt?: string) => {
    clearModalStack();
    if (queryPrompt !== undefined) {
      setAiSearchInitialQuery(queryPrompt);
    }
    setAiSearchOpen(true);
  };

  const handleApplyAIToFeed = (query: string, filtered: Listing[]) => {
    setActiveAIQuery(query);
    const { results } = runAISearch(query, initialListings);
    const map: Record<string, AIMatchResult> = {};
    results.forEach((r) => {
      map[r.listing.id] = r;
    });
    setAiMatchesMap(map);
    setListings(filtered);
    scrollToFeed();
  };

  const handleClearAISearch = () => {
    setActiveAIQuery(null);
    setAiMatchesMap({});
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
    if (aiSearchOpen) {
      pushModalLayer({ type: "ai-search" });
      setAiSearchOpen(false);
    } else {
      clearModalStack();
    }
    setListingForDetail(item);
  };

  const handleOpenBooking = (item: Listing) => {
    setListingForAgreement(null);
    if (listingForDetail?.id === item.id) {
      pushModalLayer({ type: "listing-detail", listing: listingForDetail });
    } else if (aiSearchOpen) {
      pushModalLayer({ type: "ai-search" });
      setAiSearchOpen(false);
    }
    setListingForDetail(null);
    setListingForBooking(item);
  };

  const handleCloseBooking = (reason?: "dismiss" | "complete") => {
    if (reason === "complete") {
      setListingForBooking(null);
      clearModalStack();
      return;
    }
    dismissWithRestore(() => setListingForBooking(null));
  };

  const handleOpenAgreement = (item: Listing, tenantData?: Partial<TenantProfile>) => {
    if (listingForBooking) {
      pushModalLayer({ type: "booking", listing: listingForBooking });
    } else if (listingForDetail) {
      pushModalLayer({ type: "listing-detail", listing: listingForDetail });
    } else if (aiSearchOpen) {
      pushModalLayer({ type: "ai-search" });
      setAiSearchOpen(false);
    }
    setListingForDetail(null);
    setListingForBooking(null);
    const profileToUse: Partial<TenantProfile> = tenantData || {
      full_name: currentUser?.fullName || "",
      phone_number: currentUser?.phoneNumber || "",
      email_address: currentUser?.email || "",
      nin_number: currentUser?.ninNumber || "",
      employer_name: currentUser?.relocationContext || "",
    };
    setAgreementTenant(profileToUse);
    setListingForAgreement(item);
  };

  const handleProceedToSignature = (agreement: TenancyAgreement) => {
    const targetListing = listings.find((l) => l.id === agreement.listing_id) || listingForAgreement || listings[0];
    if (listingForAgreement) {
      pushModalLayer({
        type: "agreement",
        listing: listingForAgreement,
        tenant: agreementTenant,
      });
    }
    setListingForAgreement(null);
    setSigningListing(targetListing);
    setSigningAgreement(agreement);
    setSigningRole("tenant");
  };

  const handleOpenSigningWorkflowFromQueue = (agreement: TenancyAgreement, listing: Listing, roleToSign: "tenant" | "manager") => {
    if (managerQueueOpen) {
      pushModalLayer({ type: "manager-queue" });
      setManagerQueueOpen(false);
    }
    setSigningAgreement(agreement);
    setSigningListing(listing);
    setSigningRole(roleToSign);
  };

  const handleOpenEscrowDashboard = () => {
    setActivePass(null);
    setActivePassAgreement(null);
    setActivePassListing(null);
    router.push(TENANT_ESCROW_DASHBOARD_PATH);
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

  const handleAddNewListing = (newListing: Listing) => {
    setListings((prev) => [newListing, ...prev]);
  };

  return (
    <div className="min-h-screen bg-[var(--background)] text-slate-900 font-sans selection:bg-blue-600 selection:text-white has-mobile-nav">
      {/* 1. Header Navigation */}
      <Navbar
        verifiedCount={listings.length}
        pendingManagerSignatures={pendingCount}
        activeEscrowStatus={activeEscrow?.escrow_status || "holding"}
        onOpenEscrowDashboard={handleOpenEscrowDashboard}
        onOpenAISearch={handleOpenAISearch}
      />

      {/* 2. Hero Section */}
      <HeroSection
        neighborhood={neighborhood}
        setNeighborhood={setNeighborhood}
        maxBudget={maxBudget}
        setMaxBudget={setMaxBudget}
        propertyType={propertyType}
        setPropertyType={setPropertyType}
        minBedrooms={minBedrooms}
        setMinBedrooms={setMinBedrooms}
        maxMoveInCost={maxMoveInCost}
        setMaxMoveInCost={setMaxMoveInCost}
        quickFilter={quickFilter}
        setQuickFilter={setQuickFilter}
        onResetFilters={handleResetFilters}
        onSearch={scrollToFeed}
        onOpenAISearch={handleOpenAISearch}
      />

      {/* 3. Main Web Feed: Featured Vetted Apartments */}
      <main className="settlla-container py-8 sm:py-10">
        {/* Filter Bar with Quick Chips */}
        <FilterBar
          neighborhood={neighborhood}
          maxBudget={maxBudget}
          propertyType={propertyType}
          minBedrooms={minBedrooms}
          maxMoveInCost={maxMoveInCost}
          quickFilter={quickFilter}
          onReset={handleResetFilters}
          totalFound={listings.length}
        />

        {/* Active AI Query Banner (if filtered by AI) */}
        {activeAIQuery && (
          <div className="mb-8 flex flex-col justify-between gap-3 rounded-[var(--radius-card)] border border-blue-200 bg-blue-50 p-4 sm:flex-row sm:items-center">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-600 text-white shadow-xs shrink-0">
                <Sparkles className="h-4 w-4 text-amber-300 animate-pulse" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-black uppercase tracking-wider text-blue-800">
                    Active Settlla AI Search
                  </span>
                  <span className="rounded-full bg-blue-200/80 px-2 py-0.2 text-[10px] font-bold text-blue-900">
                    {listings.length} Match{listings.length !== 1 ? "es" : ""}
                  </span>
                </div>
                <p className="text-xs font-bold text-slate-900 mt-0.5">
                  &ldquo;{activeAIQuery}&rdquo;
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  setAiSearchInitialQuery(activeAIQuery);
                  setAiSearchOpen(true);
                }}
                className="rounded-xl border border-blue-300 bg-white hover:bg-blue-50 px-3 py-1.5 text-xs font-bold text-blue-700 transition-colors cursor-pointer"
              >
                Refine AI Query
              </button>
              <button
                type="button"
                onClick={handleClearAISearch}
                className="rounded-xl bg-slate-200 hover:bg-slate-300 px-3 py-1.5 text-xs font-bold text-slate-700 transition-colors cursor-pointer"
              >
                Clear AI Filter
              </button>
            </div>
          </div>
        )}

        {error && (
          <div className="mb-8 flex items-center gap-2 rounded-2xl border border-rose-200 bg-rose-50 p-4 text-rose-800 text-sm font-medium">
            <AlertCircle className="h-5 w-5 text-rose-600 shrink-0" />
            <span>{error}</span>
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
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50 text-blue-600 mb-3">
                <Search className="h-7 w-7" />
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
                  aiMatchScore={aiMatchesMap[listing.id]?.relevanceScore}
                  aiHighlightReason={aiMatchesMap[listing.id]?.matchHighlights[0]}
                />
              ))}
            </div>
          )}
        </section>
      </main>

      {/* 4. Complete Landing Sections from Reference Design */}
      <LandingSections onExploreFeed={scrollToFeed} />

      {/* 5. Listing Detail Modal */}
      <ListingDetailModal
        listing={listingForDetail}
        onClose={() => dismissWithRestore(() => setListingForDetail(null))}
        onBookInspection={handleOpenBooking}
        onDraftAgreement={(item) => handleOpenAgreement(item)}
      />

      {/* 6. Direct Booking Drawer (Optional Walkthrough) */}
      {listingForBooking && (
        <BookingDrawer
          isOpen={Boolean(listingForBooking)}
          onClose={handleCloseBooking}
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

      {/* 7. Dynamic Tenancy Agreement Generator */}
      {listingForAgreement && (
        <TenancyAgreementViewer
          isOpen={Boolean(listingForAgreement)}
          onClose={() => dismissWithRestore(() => setListingForAgreement(null))}
          listing={listingForAgreement}
          initialTenantProfile={agreementTenant}
          onProceedToSignature={handleProceedToSignature}
        />
      )}

      {/* 8. Feature #4: Two-Party Electronic Signature Workflow Modal */}
      {signingAgreement && signingListing && (
        <SignatureWorkflowModal
          isOpen={Boolean(signingAgreement)}
          onClose={() =>
            dismissWithRestore(() => {
              setSigningAgreement(null);
              setSigningListing(null);
            })
          }
          agreement={signingAgreement}
          listing={signingListing}
          initialRole={signingRole}
          onAgreementUpdated={handleAgreementUpdated}
          onProceedToPayment={(agr) => {
            const targetListing =
              listings.find((l) => l.id === agr.listing_id) || signingListing || listings[0];
            if (signingAgreement && signingListing) {
              pushModalLayer({
                type: "signature",
                agreement: signingAgreement,
                listing: signingListing,
                role: signingRole,
              });
            }
            setSigningAgreement(null);
            setSigningListing(null);
            setCheckoutAgreement(agr);
            setCheckoutListing(targetListing);
          }}
        />
      )}

      {/* 9. Feature #5: 4-Way Automated Split Payment Checkout Modal */}
      {checkoutAgreement && checkoutListing && (
        <CheckoutPaymentModal
          isOpen={Boolean(checkoutAgreement && checkoutListing)}
          onClose={() =>
            dismissWithRestore(() => {
              setCheckoutAgreement(null);
              setCheckoutListing(null);
            })
          }
          agreement={checkoutAgreement}
          listing={checkoutListing}
          onPaymentSuccess={(tx) => {
            setRecentTransaction(tx);
            if (tx.escrow_hold) {
              setActiveEscrow(tx.escrow_hold);
            }
            setListings((prev) =>
              prev.map((l) => (l.id === checkoutListing.id ? { ...l, status: "occupied" } : l))
            );
          }}
        />
      )}

      {/* 10. Standalone Move-In Pass Modal */}
      {activePass && (
        <MoveInPassViewer
          isOpen={Boolean(activePass)}
          onClose={() =>
            dismissWithRestore(() => {
              setActivePass(null);
              setActivePassAgreement(null);
              setActivePassListing(null);
            })
          }
          pass={activePass}
          transaction={recentTransaction || undefined}
          onOpenDashboard={handleOpenEscrowDashboard}
        />
      )}

      {/* 11. Manager Lease Counter-Signing Desk Modal (Screen 6 Queue) */}
      <ManagerQueueModal
        isOpen={managerQueueOpen}
        onClose={() => dismissWithRestore(() => setManagerQueueOpen(false))}
        listings={listings}
        onOpenSigningWorkflow={handleOpenSigningWorkflowFromQueue}
      />

      {/* 13. Settlla AI Natural Language Search Modal */}
      <AISearchModal
        isOpen={aiSearchOpen}
        onClose={() => setAiSearchOpen(false)}
        listings={initialListings}
        initialQuery={aiSearchInitialQuery}
        onSelectListing={handleOpenDetail}
        onBookInspection={handleOpenBooking}
        onDirectApply={(item) => handleOpenAgreement(item)}
        onApplyToFeed={handleApplyAIToFeed}
      />

      {/* Floating Active Pass / Escrow Quick-Access Notification */}
      {activePass && !activePassListing && (
        <div className="fixed bottom-20 sm:bottom-6 right-4 sm:right-6 z-40 flex flex-col gap-2 items-end">
          <button
            type="button"
            onClick={handleOpenEscrowDashboard}
            className="flex items-center gap-2 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white px-5 py-3 shadow-xl shadow-blue-600/30 text-xs sm:text-sm font-bold transition-all cursor-pointer"
          >
            <ShieldCheck className="h-4 w-4" />
            <span>Escrow &amp; confirm key</span>
          </button>
          <button
            type="button"
            onClick={() => setActivePassListing(listings[0])}
            className="flex items-center gap-2 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2.5 shadow-xl shadow-emerald-600/30 text-xs font-bold transition-all cursor-pointer"
          >
            <Ticket className="h-4 w-4" />
            <span>View Pass ({activePass.pass_id})</span>
          </button>
        </div>
      )}
    </div>
  );
};

export const SettllaApp: React.FC<SettllaAppProps> = (props) => {
  return (
    <AuthProvider>
      <SettllaAppInner {...props} />
    </AuthProvider>
  );
};
