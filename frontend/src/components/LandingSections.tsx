"use client";

import React, { useState } from "react";
import Image from "next/image";
import {
  Zap,
  Check,
  Sparkles,
  ShieldCheck,
  CreditCard,
  Lock,
  FileText,
  Handshake,
  Scale,
  X,
  MessageSquare,
  Star,
  HelpCircle,
  Plus,
  Minus,
  Phone,
  MapPin,
  Heart,
} from "lucide-react";

interface LandingSectionsProps {
  onExploreFeed: () => void;
}

export const LandingSections: React.FC<LandingSectionsProps> = ({ onExploreFeed }) => {
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const [landlordEmail, setLandlordEmail] = useState("");
  const [landlordSubmitted, setLandlordSubmitted] = useState(false);

  const faqs = [
    {
      q: "What is included in the Total Move-In Cost on Settlla?",
      a: "The Total Move-In Cost is the exact, comprehensive amount required to occupy an apartment. It strictly comprises: (1) Annual Net Rent, (2) 10% Refundable Caution Deposit held in escrow, (3) 5% Legal Documentation Fee for the statutory tenancy agreement, and (4) 10% Agency/Management Fee under the accredited HB&A Partners mandate. Unlike roadside agents, there are NO registration fees, NO inspection fees, and NO surprise charges.",
    },
    {
      q: "Why is physical inspection ₦0 on Settlla?",
      a: "Roadside agents typically charge ₦3,000 to ₦5,000 every time you inspect a property. On Settlla, inspection fees are completely eliminated (₦0). Because all homes are under exclusive direct landlord mandates with HB&A Partners & Co., you can schedule a free 30-minute viewing window and inspect with an accredited manager at zero cost.",
    },
    {
      q: "What happens to my 10% Caution Deposit?",
      a: "Your 10% caution deposit is kept safely in a dedicated escrow reserve, not pocketed by agents or landlords. When your 12-month lease ends, an inspection report is filed. If the premises are in good order (barring normal wear and tear), your deposit is promptly refunded back to your bank account.",
    },
    {
      q: "Who manages and inspects these properties?",
      a: "Every apartment listed on Settlla is physically vetted and under a direct written mandate with HB&A Partners & Co. (ESVARBON / NIESV Reg. #A2840). You deal directly with verified managers, eliminating ghost agents and double-letting scams.",
    },
    {
      q: "How does the digital tenancy agreement work?",
      a: "Once your rental application is verified, a legally binding residential tenancy agreement is automatically generated with statutory covenants. You can review all terms, sign digitally from your phone or laptop, and receive a stamped digital copy.",
    },
    {
      q: "Can I inspect multiple apartments before deciding?",
      a: "Yes! You can book free ₦0 inspection slots across any available properties in Barnawa and Malali during their scheduled visiting windows.",
    },
  ];

  const handleLandlordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!landlordEmail) return;
    setLandlordSubmitted(true);
  };

  return (
    <div className="w-full space-y-20">
      {/* 1. Process Strip: "Finding Your Next Home Is Simple" (Deep Navy) */}
      <section id="how-it-works" className="w-full bg-[#0B1528] py-16 sm:py-20 text-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 rounded-full bg-blue-500/10 px-3.5 py-1 text-xs font-bold text-blue-400 border border-blue-500/20 mb-3">
            <Zap className="h-3.5 w-3.5 text-blue-400" />
            <span>Simple 3-Step Process</span>
          </div>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight text-white">
            Finding Your Next Home Is Simple: Search, Inspect, And Settle In
          </h2>
          <p className="mx-auto mt-3 max-w-2xl text-xs sm:text-sm text-slate-300">
            We removed roadside agent extortion, surprise fees, and scam risks from the Kaduna rental market.
          </p>

          <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-8 text-left">
            {/* Step 1 */}
            <div className="rounded-3xl border border-slate-800 bg-slate-900/60 p-6 sm:p-8 relative overflow-hidden group hover:border-blue-500/40 transition-all">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-600/20 text-blue-400 font-black text-xl mb-6 border border-blue-500/30">
                1
              </div>
              <h3 className="text-lg font-bold text-white mb-2">Choose your Apartment</h3>
              <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
                Browse verified listings in Barnawa and Malali with authentic photos, verified commute distances, and the exact upfront move-in total.
              </p>
            </div>

            {/* Step 2 */}
            <div className="rounded-3xl border border-slate-800 bg-slate-900/60 p-6 sm:p-8 relative overflow-hidden group hover:border-blue-500/40 transition-all">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-600/20 text-blue-400 font-black text-xl mb-6 border border-blue-500/30">
                2
              </div>
              <h3 className="text-lg font-bold text-white mb-2">Schedule ₦0 Inspection</h3>
              <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
                Select an official 30-minute visiting window. Walk through the apartment with an accredited HB&amp;A manager. Zero agent fees.
              </p>
            </div>

            {/* Step 3 */}
            <div className="rounded-3xl border border-slate-800 bg-slate-900/60 p-6 sm:p-8 relative overflow-hidden group hover:border-blue-500/40 transition-all">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-600/20 text-blue-400 font-black text-xl mb-6 border border-blue-500/30">
                3
              </div>
              <h3 className="text-lg font-bold text-white mb-2">Move In Securely</h3>
              <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
                Sign your statutory digital tenancy agreement, fund your escrow move-in package, and collect your keys within 72 hours.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 2. "Why People Choose Settlla" with Visual Estate Photo */}
      <section id="why-settlla" className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left: Estate Image with Badge */}
          <div className="relative">
            <div className="relative aspect-[4/3] w-full overflow-hidden rounded-3xl shadow-2xl border border-slate-200">
              <Image
                src="/images/kaduna_estate.jpg"
                alt="Vetted Kaduna Residential Estate"
                fill
                className="object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent"></div>
            </div>

            {/* Floating Trust Badge */}
            <div className="absolute -bottom-6 -right-4 sm:right-6 rounded-2xl bg-white p-4 shadow-xl border border-slate-150 flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-600 text-white shadow-sm">
                <Check className="h-6 w-6 text-white" />
              </div>
              <div>
                <span className="block text-xs font-bold uppercase text-blue-600">Verified Mandates</span>
                <span className="text-sm font-black text-slate-900">HB&amp;A Partners &amp; Co.</span>
                <span className="block text-[10px] text-slate-500">ESVARBON / NIESV Reg. #A2840</span>
              </div>
            </div>
          </div>

          {/* Right: Value Pillars */}
          <div>
            <div className="inline-flex items-center gap-2 rounded-full bg-blue-50 px-3 py-1 text-xs font-bold text-blue-700 border border-blue-200 mb-3">
              <Sparkles className="h-3.5 w-3.5 text-blue-600" />
              <span>WHY PEOPLE CHOOSE SETTLLA</span>
            </div>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight text-slate-900 leading-tight">
              The Reliable, Secure Rental Standard for Kaduna
            </h2>
            <p className="mt-3 text-sm text-slate-600 leading-relaxed">
              We built Settlla to protect tenants from extortionate roadside fees and to give landlords pre-screened, dependable occupants.
            </p>

            <div className="mt-8 space-y-4">
              {/* Feature 1 */}
              <div className="flex items-start gap-4 p-3.5 rounded-2xl bg-white border border-slate-200/80 shadow-2xs">
                <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600 font-bold">
                  <ShieldCheck className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-900">Verified Listings Only</h4>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Physical inspection completed for every single home. No stock photos, no ghost apartments.
                  </p>
                </div>
              </div>

              {/* Feature 2 */}
              <div className="flex items-start gap-4 p-3.5 rounded-2xl bg-white border border-slate-200/80 shadow-2xs">
                <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 font-bold">
                  <CreditCard className="h-5 w-5 text-emerald-600" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-900">100% Upfront Pricing Transparency</h4>
                  <p className="text-xs text-slate-500 mt-0.5">
                    See Annual Rent, 10% Caution, 5% Legal, and 10% Agency before you visit. Zero unexpected markups.
                  </p>
                </div>
              </div>

              {/* Feature 3 */}
              <div className="flex items-start gap-4 p-3.5 rounded-2xl bg-white border border-slate-200/80 shadow-2xs">
                <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-purple-50 text-purple-600 font-bold">
                  <Lock className="h-5 w-5 text-purple-600" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-900">Escrow Caution Deposit Protection</h4>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Your 10% caution fee is parked in an independent escrow account and refunded promptly upon lease completion.
                  </p>
                </div>
              </div>

              {/* Feature 4 */}
              <div className="flex items-start gap-4 p-3.5 rounded-2xl bg-white border border-slate-200/80 shadow-2xs">
                <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-amber-50 text-amber-600 font-bold">
                  <FileText className="h-5 w-5 text-amber-600" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-900">Legally Binding Digital Lease</h4>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Auto-generated statutory tenancy agreements vetted by legal partners and signed digitally with full audit trail.
                  </p>
                </div>
              </div>
            </div>

            <button
              onClick={onExploreFeed}
              className="mt-8 rounded-xl bg-blue-600 hover:bg-blue-700 px-6 py-3 text-xs sm:text-sm font-bold text-white shadow-md shadow-blue-600/25 transition-all cursor-pointer"
            >
              Explore Verified Listings
            </button>
          </div>
        </div>
      </section>

      {/* 3. "Join Our Verified Agent & Landlord Network" */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="rounded-3xl bg-slate-900 text-white p-8 sm:p-12 lg:p-16 overflow-hidden relative shadow-2xl">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center relative z-10">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full bg-blue-500/20 px-3 py-1 text-xs font-bold text-blue-300 border border-blue-500/30 mb-3">
                <Handshake className="h-3.5 w-3.5 text-blue-300" />
                <span>PARTNER WITH SETTLLA</span>
              </div>
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight text-white leading-tight">
                Join Our Verified Landlord &amp; Manager Network
              </h2>
              <p className="mt-3 text-sm text-slate-300 leading-relaxed">
                Fill your vacancies in 72 hours with corporate, banking, healthcare, and verified NYSC tenants.
              </p>

              <div className="mt-6 space-y-3 text-xs sm:text-sm text-slate-200">
                <div className="flex items-center gap-2.5">
                  <Check className="h-4 w-4 text-emerald-400 shrink-0" />
                  <span>Pre-screened tenants with NIN &amp; employment verification</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <Check className="h-4 w-4 text-emerald-400 shrink-0" />
                  <span>Zero roadside inspection hassle — scheduled viewing windows only</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <Check className="h-4 w-4 text-emerald-400 shrink-0" />
                  <span>Automated statutory lease agreements &amp; digital signatures</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <Check className="h-4 w-4 text-emerald-400 shrink-0" />
                  <span>Direct rent disbursement with escrow protection</span>
                </div>
              </div>

              <div className="mt-8 flex flex-wrap items-center gap-4">
                <a
                  href="tel:+2348007388552"
                  className="rounded-xl bg-blue-600 hover:bg-blue-500 px-6 py-3 text-xs sm:text-sm font-bold text-white shadow-lg shadow-blue-600/30 transition-all text-center cursor-pointer"
                >
                  List Your Property (Free)
                </a>
                <span className="text-xs text-slate-400">
                  Or call our Kaduna team at <strong>(0800) 738-8552</strong>
                </span>
              </div>
            </div>

            {/* Right: Partner image */}
            <div className="relative aspect-[4/3] w-full overflow-hidden rounded-2xl border border-slate-700 shadow-xl">
              <Image
                src="/images/landlord_partner.jpg"
                alt="HB&A Partners property manager inspecting Kaduna residence"
                fill
                className="object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      {/* 4. "Simple, Transparent Plans" Comparison */}
      <section id="pricing-plans" className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
        <div className="inline-flex items-center gap-2 rounded-full bg-blue-50 px-3 py-1 text-xs font-bold text-blue-700 border border-blue-200 mb-3">
          <Scale className="h-3.5 w-3.5 text-blue-700" />
          <span>NO HIDDEN FEES</span>
        </div>
        <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight text-slate-900">
          Simple, Transparent Plans
        </h2>
        <p className="mx-auto mt-2 max-w-2xl text-xs sm:text-sm text-slate-500">
          Compare the traditional roadside agent experience in Kaduna with Settlla's statutory all-in standard.
        </p>

        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-8 text-left">
          {/* Card 1: Traditional Roadside Agent (The Old Way) */}
          <div className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 shadow-sm relative flex flex-col justify-between">
            <div>
              <div className="text-xs font-bold uppercase tracking-wider text-rose-600 mb-1">
                The Old Way
              </div>
              <h3 className="text-xl font-black text-slate-900">Roadside Agents</h3>
              <div className="mt-4 text-3xl font-black text-slate-900">
                ₦5,000+ <span className="text-xs font-normal text-slate-500">per inspection</span>
              </div>
              <p className="mt-2 text-xs text-slate-500">
                Unregulated street agents charging fees for every single door opened.
              </p>

              <div className="mt-6 space-y-3 text-xs text-slate-600 border-t border-slate-100 pt-6">
                <div className="flex items-center gap-2 text-rose-600">
                  <X className="h-3.5 w-3.5 text-rose-500 shrink-0" />
                  <span>₦3,000 – ₦5,000 per inspection trip</span>
                </div>
                <div className="flex items-center gap-2 text-rose-600">
                  <X className="h-3.5 w-3.5 text-rose-500 shrink-0" />
                  <span>Arbitrary 15% – 20% agency markups</span>
                </div>
                <div className="flex items-center gap-2 text-rose-600">
                  <X className="h-3.5 w-3.5 text-rose-500 shrink-0" />
                  <span>Non-refundable caution deposits</span>
                </div>
                <div className="flex items-center gap-2 text-rose-600">
                  <X className="h-3.5 w-3.5 text-rose-500 shrink-0" />
                  <span>High risk of double-letting scams</span>
                </div>
                <div className="flex items-center gap-2 text-rose-600">
                  <X className="h-3.5 w-3.5 text-rose-500 shrink-0" />
                  <span>Handwritten, questionable receipts</span>
                </div>
              </div>
            </div>

            <div className="mt-8 pt-4 border-t border-slate-100 text-center">
              <span className="text-xs font-semibold text-rose-600">Average waste: ₦30,000+ before securing a flat</span>
            </div>
          </div>

          {/* Card 2: Settlla Verified Move-In (Recommended) */}
          <div className="rounded-3xl border-2 border-blue-600 bg-white p-6 sm:p-8 shadow-xl relative flex flex-col justify-between scale-105 z-10">
            {/* Recommended Pill */}
            <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 rounded-full bg-blue-600 px-4 py-1 text-[11px] font-black uppercase tracking-wider text-white shadow-md">
              Most Popular • Verified
            </div>

            <div>
              <div className="text-xs font-bold uppercase tracking-wider text-blue-600 mb-1">
                Settlla Standard
              </div>
              <h3 className="text-xl font-black text-slate-900">Verified Move-In</h3>
              <div className="mt-4 text-3xl font-black text-blue-700">
                ₦0 <span className="text-xs font-normal text-slate-500">Inspection Fee</span>
              </div>
              <p className="mt-2 text-xs text-slate-500">
                Full statutory price clarity upfront with escrow caution protection.
              </p>

              <div className="mt-6 space-y-3 text-xs text-slate-700 border-t border-slate-100 pt-6">
                <div className="flex items-center gap-2 text-emerald-600 font-bold">
                  <Check className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                  <span>₦0 Physical Inspection Fee</span>
                </div>
                <div className="flex items-center gap-2 text-emerald-600 font-bold">
                  <Check className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                  <span>10% Caution held safe in Escrow</span>
                </div>
                <div className="flex items-center gap-2 text-emerald-600 font-bold">
                  <Check className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                  <span>5% Statutory Legal Agreement</span>
                </div>
                <div className="flex items-center gap-2 text-emerald-600 font-bold">
                  <Check className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                  <span>10% Professional HB&amp;A Mandate</span>
                </div>
                <div className="flex items-center gap-2 text-emerald-600 font-bold">
                  <Check className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                  <span>100% Vetted Landlord Direct Mandates</span>
                </div>
              </div>
            </div>

            <div className="mt-8 pt-4 border-t border-slate-100">
              <button
                onClick={onExploreFeed}
                className="w-full rounded-xl bg-blue-600 hover:bg-blue-700 py-3 text-xs font-bold text-white shadow-md shadow-blue-500/25 transition-all cursor-pointer"
              >
                Browse Vetted Listings
              </button>
            </div>
          </div>

          {/* Card 3: Landlord Mandate Service */}
          <div className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 shadow-sm relative flex flex-col justify-between">
            <div>
              <div className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">
                For Property Owners
              </div>
              <h3 className="text-xl font-black text-slate-900">Landlord Mandate</h3>
              <div className="mt-4 text-3xl font-black text-slate-900">
                0% <span className="text-xs font-normal text-slate-500">Listing Cost</span>
              </div>
              <p className="mt-2 text-xs text-slate-500">
                Accredited property management and screened tenants in 72 hours.
              </p>

              <div className="mt-6 space-y-3 text-xs text-slate-600 border-t border-slate-100 pt-6">
                <div className="flex items-center gap-2 text-blue-600">
                  <Check className="h-3.5 w-3.5 text-blue-600 shrink-0" />
                  <span>Zero listing or setup fees</span>
                </div>
                <div className="flex items-center gap-2 text-blue-600">
                  <Check className="h-3.5 w-3.5 text-blue-600 shrink-0" />
                  <span>Professional photography &amp; verification</span>
                </div>
                <div className="flex items-center gap-2 text-blue-600">
                  <Check className="h-3.5 w-3.5 text-blue-600 shrink-0" />
                  <span>Screened tenants (NIN &amp; salary verified)</span>
                </div>
                <div className="flex items-center gap-2 text-blue-600">
                  <Check className="h-3.5 w-3.5 text-blue-600 shrink-0" />
                  <span>Digital legal tenancy drafting</span>
                </div>
                <div className="flex items-center gap-2 text-blue-600">
                  <Check className="h-3.5 w-3.5 text-blue-600 shrink-0" />
                  <span>Guaranteed 72-hour placement target</span>
                </div>
              </div>
            </div>

            <div className="mt-8 pt-4 border-t border-slate-100">
              <a
                href="tel:+2348007388552"
                className="block w-full text-center rounded-xl bg-slate-100 hover:bg-slate-200 py-3 text-xs font-bold text-slate-800 transition-colors"
              >
                Contact Mandate Team
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* 5. "Trusted by People Like You" Testimonials */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
        <div className="inline-flex items-center gap-2 rounded-full bg-blue-50 px-3 py-1 text-xs font-bold text-blue-700 border border-blue-200 mb-3">
          <MessageSquare className="h-3.5 w-3.5 text-blue-600" />
          <span>TENANT REVIEWS</span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900">
          Trusted by People Like You
        </h2>
        <p className="mx-auto mt-2 max-w-xl text-xs sm:text-sm text-slate-500">
          Real professionals, healthcare workers, and NYSC corps members renting in Kaduna with Settlla.
        </p>

        <div className="mt-10 grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
          {/* Review 1 */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-center gap-1 text-amber-400 mb-3">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
              ))}
            </div>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed italic">
              "Settlla saved me from paying ₦45k in fake agent inspection fees. I saw the exact total move-in cost before stepping out of Barau Dikko Hospital, inspected at 2 PM on Saturday for free, and signed my lease digitally."
            </p>
            <div className="mt-6 flex items-center gap-3 border-t border-slate-100 pt-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 text-blue-700 font-bold text-xs">
                AB
              </div>
              <div>
                <div className="text-xs font-bold text-slate-900">Dr. Amina Bello</div>
                <div className="text-[11px] text-slate-500">Medical Doctor • Barnawa GRA</div>
              </div>
            </div>
          </div>

          {/* Review 2 */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-center gap-1 text-amber-400 mb-3">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
              ))}
            </div>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed italic">
              "As an NYSC corps member posted to Kaduna, finding an apartment without getting scammed felt impossible. Settlla gave me the exact breakdown down to the last Naira and held my caution deposit safely."
            </p>
            <div className="mt-6 flex items-center gap-3 border-t border-slate-100 pt-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-100 text-emerald-700 font-bold text-xs">
                CO
              </div>
              <div>
                <div className="text-xs font-bold text-slate-900">Chinedu Okafor</div>
                <div className="text-[11px] text-slate-500">NYSC Corps Member • Malali Low Cost</div>
              </div>
            </div>
          </div>

          {/* Review 3 */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-center gap-1 text-amber-400 mb-3">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
              ))}
            </div>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed italic">
              "The ₦0 inspection and direct HB&amp;A mandate gave me total confidence. No roadside agent drama or hidden fees when paying the rent. Clean, transparent, and prompt."
            </p>
            <div className="mt-6 flex items-center gap-3 border-t border-slate-100 pt-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-purple-100 text-purple-700 font-bold text-xs">
                ID
              </div>
              <div>
                <div className="text-xs font-bold text-slate-900">Ibrahim Danladi</div>
                <div className="text-[11px] text-slate-500">Tech Consultant • Barnawa Phase 1</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 6. "Ready To Start Using Settlla" App Callout Banner */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="rounded-3xl bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-800 text-white p-8 sm:p-12 shadow-xl relative overflow-hidden">
          <div className="max-w-2xl relative z-10">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight leading-tight">
              Ready To Find Your Next Home In Kaduna?
            </h2>
            <p className="mt-3 text-xs sm:text-sm text-blue-100 leading-relaxed">
              Explore vetted apartments in Barnawa and Malali with guaranteed ₦0 inspection fees and 100% transparent statutory pricing.
            </p>
            <div className="mt-6 flex flex-wrap items-center gap-3">
              <button
                onClick={onExploreFeed}
                className="rounded-xl bg-white hover:bg-slate-50 px-6 py-3 text-xs sm:text-sm font-bold text-blue-700 shadow-md transition-all cursor-pointer"
              >
                Browse Verified Feed
              </button>
              <span className="text-xs text-blue-100 font-medium">
                Over ₦500,000 in roadside inspection fees saved for Kaduna tenants!
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* 7. "Are you a Landlord?" Bar */}
      <section className="w-full bg-[#0B1528] py-12 text-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-6">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-blue-400">
                Landlord Partnership
              </span>
              <h3 className="text-xl sm:text-2xl font-black text-white mt-0.5">
                Are you a Landlord or Property Owner in Kaduna?
              </h3>
              <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-xl">
                List your residential property with Settlla under our accredited HB&amp;A mandate and get vetted corporate tenants within 72 hours.
              </p>
            </div>

            <form onSubmit={handleLandlordSubmit} className="w-full lg:w-auto flex flex-col sm:flex-row gap-2.5">
              {landlordSubmitted ? (
                <div className="flex items-center gap-1.5 rounded-xl bg-emerald-950 border border-emerald-500/40 px-5 py-3 text-xs font-bold text-emerald-300">
                  <Check className="h-4 w-4 text-emerald-300 shrink-0" />
                  <span>Thank you! Our Kaduna mandate team will call you within 2 business hours.</span>
                </div>
              ) : (
                <>
                  <input
                    type="text"
                    required
                    value={landlordEmail}
                    onChange={(e) => setLandlordEmail(e.target.value)}
                    placeholder="Enter phone number or email..."
                    className="rounded-xl bg-slate-900 border border-slate-700 px-4 py-3 text-xs sm:text-sm text-white placeholder-slate-400 outline-none focus:border-blue-500 w-full sm:w-72"
                  />
                  <button
                    type="submit"
                    className="rounded-xl bg-blue-600 hover:bg-blue-500 px-6 py-3 text-xs sm:text-sm font-bold text-white transition-all shadow-md shadow-blue-600/30 cursor-pointer whitespace-nowrap"
                  >
                    Get Free Valuation
                  </button>
                </>
              )}
            </form>
          </div>
        </div>
      </section>

      {/* 8. Frequently Asked Questions */}
      <section id="faq-section" className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 rounded-full bg-blue-50 px-3 py-1 text-xs font-bold text-blue-700 border border-blue-200 mb-2">
            <HelpCircle className="h-3.5 w-3.5 text-blue-600" />
            <span>GOT QUESTIONS?</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900">
            Frequently Asked Questions
          </h2>
          <p className="mt-1 text-xs sm:text-sm text-slate-500">
            Everything you need to know about pricing, inspections, and verified leases on Settlla.
          </p>
        </div>

        <div className="space-y-3">
          {faqs.map((faq, idx) => {
            const isOpen = openFaq === idx;
            return (
              <div
                key={idx}
                className="rounded-2xl border border-slate-200 bg-white overflow-hidden transition-all shadow-2xs"
              >
                <button
                  type="button"
                  onClick={() => setOpenFaq(isOpen ? null : idx)}
                  className="w-full p-4 sm:p-5 text-left flex items-center justify-between gap-4 font-bold text-sm sm:text-base text-slate-900 hover:text-blue-600 transition-colors cursor-pointer"
                >
                  <span>{faq.q}</span>
                  <span className="text-slate-400">
                    {isOpen ? <Minus className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
                  </span>
                </button>
                {isOpen && (
                  <div className="px-4 pb-5 sm:px-5 sm:pb-6 text-xs sm:text-sm text-slate-600 leading-relaxed border-t border-slate-100 pt-3">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* 9. Global Navy Footer */}
      <footer className="w-full bg-[#0B1528] text-slate-400 py-16 border-t border-slate-800">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
            {/* Col 1: Brand */}
            <div className="md:col-span-1">
              <div className="flex items-center gap-2 text-white font-black text-2xl">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-600 text-white text-base">
                  S
                </div>
                <span>Settlla</span>
              </div>
              <p className="mt-3 text-xs text-slate-400 leading-relaxed">
                Kaduna's first verified residential rental platform with 100% upfront pricing transparency and zero inspection fees.
              </p>
              <div className="mt-4 text-xs text-slate-300 space-y-1.5">
                <p className="flex items-center gap-1.5">
                  <Phone className="h-3.5 w-3.5 text-blue-400 shrink-0" />
                  <strong>+234 800 SETTLLA</strong>
                </p>
                <p className="flex items-center gap-1.5">
                  <MapPin className="h-3.5 w-3.5 text-blue-400 shrink-0" />
                  <span>Barnawa GRA, Kaduna, Nigeria</span>
                </p>
              </div>
            </div>

            {/* Col 2: Locations */}
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-white mb-3">
                Kaduna Coverage
              </h4>
              <ul className="space-y-2 text-xs">
                <li><a href="#featured-properties" className="hover:text-white transition-colors">Barnawa GRA</a></li>
                <li><a href="#featured-properties" className="hover:text-white transition-colors">Barnawa Phase 1</a></li>
                <li><a href="#featured-properties" className="hover:text-white transition-colors">Malali Low Cost</a></li>
                <li><a href="#featured-properties" className="hover:text-white transition-colors">Malali GRA Extension</a></li>
                <li><span className="text-slate-600">Ungwan Rimi (Coming Soon)</span></li>
              </ul>
            </div>

            {/* Col 3: Transparency */}
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-white mb-3">
                Transparency &amp; Legal
              </h4>
              <ul className="space-y-2 text-xs">
                <li><span className="text-slate-300">Annual Net Rent (Base)</span></li>
                <li><span className="text-slate-300">10% Caution (Escrow Protected)</span></li>
                <li><span className="text-slate-300">5% Statutory Legal Agreement</span></li>
                <li><span className="text-slate-300">10% Professional Mandate</span></li>
                <li><span className="text-emerald-400 font-semibold">₦0 Inspection Guarantee</span></li>
              </ul>
            </div>

            {/* Col 4: Accreditation */}
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-white mb-3">
                Accredited Management
              </h4>
              <div className="rounded-xl bg-slate-900/80 p-3.5 border border-slate-800 text-xs">
                <p className="font-bold text-white">HB&amp;A Partners &amp; Co.</p>
                <p className="text-slate-400 mt-1">
                  Estate Surveyors &amp; Valuers
                </p>
                <p className="text-[11px] text-blue-400 mt-0.5">
                  ESVARBON / NIESV Reg. #A2840
                </p>
                <p className="mt-2 text-[10px] text-slate-500">
                  Strict adherence to statutory tenancy practices under Kaduna State tenancy regulations.
                </p>
              </div>
            </div>
          </div>

          <div className="mt-12 pt-8 border-t border-slate-800 text-center text-xs text-slate-500 flex flex-col sm:flex-row items-center justify-between gap-4">
            <p>© 2026 Settlla Technologies Ltd. All rights reserved.</p>
            <p className="flex items-center justify-center gap-1">
              <span>Built for Kaduna tenants and landlords with</span>
              <Heart className="h-3.5 w-3.5 text-rose-500 fill-rose-500 inline" />
              <span>and complete transparency.</span>
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};
