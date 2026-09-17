import { Listing } from "@/types/listing";
import { AISearchCriteria, AIMatchResult, AISuggestedPrompt } from "@/types/aiSearch";

export const AI_PROMPT_SUGGESTIONS: AISuggestedPrompt[] = [
  {
    id: "barnawa-prepaid-2bed",
    emoji: "⚡",
    label: "Barnawa 2-Bed with Prepaid Meter",
    query: "quiet 2-bedroom in Barnawa near GTBank under 800k with prepaid meter",
    tag: "Barnawa • 2-Bed",
  },
  {
    id: "malali-nysc-studio",
    emoji: "🎓",
    label: "Malali Studio ₦200k (NYSC & Student)",
    query: "affordable studio or mini-flat in Malali under 200k for NYSC or student",
    tag: "Malali • ₦200k",
  },
  {
    id: "malali-3bed-modern",
    emoji: "🏰",
    label: "Modern 3-Bedroom in Malali",
    query: "spacious 3-bedroom apartment in Malali with borehole and solar",
    tag: "Malali • 3-Bed",
  },
  {
    id: "barnawa-family-3bed",
    emoji: "👨‍👩‍👧",
    label: "Barnawa 3-Bed Executive Flat",
    query: "executive 3-bedroom flat in Barnawa GRA under 400k",
    tag: "Barnawa • 3-Bed",
  },
  {
    id: "budget-under-300k",
    emoji: "💰",
    label: "Verified Home Under ₦300,000",
    query: "verified flat under 300k in Kaduna with personal meter and borehole",
    tag: "Kaduna • Under 300k",
  },
  {
    id: "zero-caution-barnawa",
    emoji: "🎉",
    label: "Barnawa Flat with ₦0 Caution Fee",
    query: "2-bedroom in Barnawa near GTBank under 300k with zero caution deposit",
    tag: "₦0 Caution • Barnawa",
  },
];

/**
 * Parses natural-language user query into structured search criteria
 */
export function parseNaturalLanguageQuery(rawQuery: string): AISearchCriteria {
  const normalized = rawQuery.toLowerCase().trim();

  // 1. Neighborhood Detection
  let neighborhood: "Barnawa" | "Malali" | "all" = "all";
  let zone: string | undefined = undefined;

  if (
    normalized.includes("barnawa") ||
    normalized.includes("coronation") ||
    normalized.includes("queen amina")
  ) {
    neighborhood = "Barnawa";
    if (normalized.includes("gra")) zone = "Barnawa GRA";
    else if (normalized.includes("phase 1")) zone = "Barnawa Phase 1";
  } else if (
    normalized.includes("malali") ||
    normalized.includes("isa kaita") ||
    normalized.includes("danmarna") ||
    normalized.includes("golf club") ||
    normalized.includes("nda road")
  ) {
    neighborhood = "Malali";
    if (normalized.includes("low cost")) zone = "Malali Low Cost";
    else if (normalized.includes("gra")) zone = "Malali GRA";
  }

  // 2. Bedroom & Property Type Extraction
  let bedrooms: number | undefined = undefined;
  let propertyType: string | undefined = undefined;

  if (
    normalized.includes("studio") ||
    normalized.includes("mini flat") ||
    normalized.includes("mini-flat") ||
    normalized.includes("self contain") ||
    normalized.includes("self-contain") ||
    normalized.includes("single room")
  ) {
    bedrooms = 1;
    propertyType = "Mini-flat";
  } else if (
    normalized.includes("1 bedroom") ||
    normalized.includes("1 bed") ||
    normalized.includes("1bed") ||
    normalized.includes("one bedroom") ||
    normalized.includes("1-bedroom")
  ) {
    bedrooms = 1;
    propertyType = "1-Bedroom Flat";
  } else if (
    normalized.includes("2 bedroom") ||
    normalized.includes("2 bed") ||
    normalized.includes("2bed") ||
    normalized.includes("two bedroom") ||
    normalized.includes("2-bedroom")
  ) {
    bedrooms = 2;
    propertyType = "2-Bedroom Flat";
  } else if (
    normalized.includes("3 bedroom") ||
    normalized.includes("3 bed") ||
    normalized.includes("3bed") ||
    normalized.includes("three bedroom") ||
    normalized.includes("3-bedroom")
  ) {
    bedrooms = 3;
    if (normalized.includes("duplex")) {
      propertyType = "3-Bedroom Duplex";
    } else {
      propertyType = "3-Bedroom Flat";
    }
  } else if (normalized.includes("duplex")) {
    propertyType = "Duplex";
  }

  // 3. Budget Extraction (Naira amounts: 500k, 800,000, 1.2m, etc.)
  let maxBudget: number | undefined = undefined;
  let maxTotalCost: number | undefined = undefined;
  const isTotalMoveInCost =
    normalized.includes("total") ||
    normalized.includes("move in") ||
    normalized.includes("move-in") ||
    normalized.includes("package") ||
    normalized.includes("all in") ||
    normalized.includes("all-in");

  // Regex for numbers with k / m / thousand / million / commas
  const budgetMatch =
    /(?:(?:under|less than|below|max|up to|budget(?: of)?|around|cheap|within)\s*(?:₦|naira)?\s*|(?:\b))(\d+(?:\.\d+)?)\s*(k|m|million|thousand)?\b/gi;

  let match;
  while ((match = budgetMatch.exec(normalized)) !== null) {
    const rawVal = parseFloat(match[1]);
    const multiplier = match[2]?.toLowerCase();
    let calculated = rawVal;

    if (multiplier === "k" || multiplier === "thousand") {
      calculated = rawVal * 1000;
    } else if (multiplier === "m" || multiplier === "million") {
      calculated = rawVal * 1000000;
    } else if (rawVal < 2000 && rawVal > 100) {
      // e.g. "800" meaning 800k in colloquial Nigerian context
      calculated = rawVal * 1000;
    }

    // Typical Nigerian rental amounts in range 100,000 to 10,000,000
    if (calculated >= 100000 && calculated <= 10000000) {
      if (isTotalMoveInCost) {
        maxTotalCost = calculated;
      } else {
        maxBudget = calculated;
      }
      break;
    }
  }

  // Also check explicit standard numbers like "300000" or "200,000"
  if (!maxBudget && !maxTotalCost) {
    const directNumberMatch = normalized.match(/(?:₦|naira\s*)?(\d{1,3}(?:,\d{3})+|\d{6,7})/i);
    if (directNumberMatch) {
      const cleanNum = parseInt(directNumberMatch[1].replace(/,/g, ""), 10);
      if (cleanNum >= 100000 && cleanNum <= 10000000) {
        if (isTotalMoveInCost) {
          maxTotalCost = cleanNum;
        } else {
          maxBudget = cleanNum;
        }
      }
    }
  }

  // 4. Amenities Extraction
  const requiredAmenities: string[] = [];
  if (
    normalized.includes("prepaid") ||
    normalized.includes("meter") ||
    normalized.includes("self billed") ||
    normalized.includes("self-billed") ||
    normalized.includes("kedco") ||
    normalized.includes("constant light") ||
    normalized.includes("steady light") ||
    normalized.includes("personal meter")
  ) {
    requiredAmenities.push("prepaid_meter");
  }

  if (
    normalized.includes("borehole") ||
    normalized.includes("water") ||
    normalized.includes("running water") ||
    normalized.includes("tank") ||
    normalized.includes("constant water")
  ) {
    requiredAmenities.push("borehole_water");
  }

  if (
    normalized.includes("security") ||
    normalized.includes("guard") ||
    normalized.includes("gated") ||
    normalized.includes("safe") ||
    normalized.includes("cctv") ||
    normalized.includes("electric fence") ||
    normalized.includes("neighborhood watch")
  ) {
    requiredAmenities.push("security");
  }

  if (
    normalized.includes("solar") ||
    normalized.includes("inverter") ||
    normalized.includes("generator") ||
    normalized.includes("changeover") ||
    normalized.includes("transformer")
  ) {
    requiredAmenities.push("power_backup");
  }

  if (
    normalized.includes("parking") ||
    normalized.includes("car park") ||
    normalized.includes("compound")
  ) {
    requiredAmenities.push("parking");
  }

  if (
    normalized.includes("ensuite") ||
    normalized.includes("water heater") ||
    normalized.includes("pop") ||
    normalized.includes("tiled") ||
    normalized.includes("fitted kitchen")
  ) {
    requiredAmenities.push("modern_finishing");
  }

  if (normalized.includes("bq") || normalized.includes("boys quarters")) {
    requiredAmenities.push("boys_quarters");
  }

  // 5. Commute & Landmarks
  const commuteAnchors: string[] = [];
  if (normalized.includes("gtbank") || normalized.includes("gt bank")) {
    commuteAnchors.push("GTBank Barnawa");
  }
  if (normalized.includes("golf club") || normalized.includes("golf")) {
    commuteAnchors.push("Kaduna Golf Club");
  }
  if (normalized.includes("nda") || normalized.includes("nda road")) {
    commuteAnchors.push("NDA Road / Gate");
  }
  if (normalized.includes("rabah") || normalized.includes("rabah road")) {
    commuteAnchors.push("Rabah Road");
  }
  if (normalized.includes("complex") || normalized.includes("shopping complex")) {
    commuteAnchors.push("Barnawa Shopping Complex");
  }
  if (normalized.includes("roundabout")) {
    commuteAnchors.push("Malali Roundabout");
  }

  // 6. Tenant Lifestyle Context
  const lifestyleContext: string[] = [];
  if (normalized.includes("nysc") || normalized.includes("corper")) {
    lifestyleContext.push("nysc");
  }
  if (
    normalized.includes("student") ||
    normalized.includes("campus") ||
    normalized.includes("poly") ||
    normalized.includes("kasu") ||
    normalized.includes("university") ||
    normalized.includes("school")
  ) {
    lifestyleContext.push("student");
  }
  if (
    normalized.includes("doctor") ||
    normalized.includes("nurse") ||
    normalized.includes("medical") ||
    normalized.includes("hospital") ||
    normalized.includes("barau dikko")
  ) {
    lifestyleContext.push("medical_doctor");
  }
  if (normalized.includes("family") || normalized.includes("kids") || normalized.includes("children")) {
    lifestyleContext.push("family");
  }
  if (
    normalized.includes("bachelor") ||
    normalized.includes("single") ||
    normalized.includes("solo")
  ) {
    lifestyleContext.push("single_professional");
  }
  if (
    normalized.includes("executive") ||
    normalized.includes("luxury") ||
    normalized.includes("diplomat")
  ) {
    lifestyleContext.push("executive");
  }

  // 7. Caution Fee Preferences
  const noCautionFee =
    normalized.includes("no caution") ||
    normalized.includes("zero caution") ||
    normalized.includes("without caution") ||
    normalized.includes("no-caution") ||
    normalized.includes("0 caution");

  // Build summary
  const summaryParts: string[] = [];
  if (neighborhood !== "all") summaryParts.push(`Location: ${neighborhood}`);
  if (bedrooms) summaryParts.push(`${bedrooms}-Bedroom`);
  if (propertyType && propertyType !== `${bedrooms}-Bedroom Flat`) summaryParts.push(propertyType);
  if (maxBudget) summaryParts.push(`Max Rent: ₦${maxBudget.toLocaleString()}`);
  if (maxTotalCost) summaryParts.push(`Max Move-In: ₦${maxTotalCost.toLocaleString()}`);
  if (noCautionFee) summaryParts.push("₦0 Caution Fee");
  if (requiredAmenities.length > 0) summaryParts.push(`Amenities: ${requiredAmenities.join(", ")}`);
  if (commuteAnchors.length > 0) summaryParts.push(`Near: ${commuteAnchors.join(", ")}`);

  return {
    rawQuery,
    neighborhood,
    zone,
    propertyType,
    bedrooms,
    maxBudget,
    maxTotalCost,
    requiredAmenities,
    commuteAnchors,
    lifestyleContext,
    noCautionFee,
    parsedSummary: summaryParts.length > 0 ? summaryParts.join(" • ") : "Broad search across verified listings",
  };
}

/**
 * Scores a single listing against parsed AI search criteria and produces reasoning highlights
 */
export function scoreListing(listing: Listing, criteria: AISearchCriteria): AIMatchResult {
  let score = 55; // Base confidence
  const matchHighlights: string[] = [];
  const missedCriteria: string[] = [];

  const listingTitleLower = listing.title.toLowerCase();
  const listingDescLower = listing.description.toLowerCase();
  const listingAmenities = listing.amenities.map((a) => a.toLowerCase()).join(" ");
  const listingCommute = (listing.commute_badge + " " + listing.commute_context).toLowerCase();

  // 1. Neighborhood Matching
  if (criteria.neighborhood !== "all") {
    if (listing.neighborhood.toLowerCase() === criteria.neighborhood.toLowerCase()) {
      score += 25;
      matchHighlights.push(`📍 Located in ${listing.neighborhood} (${listing.zone})`);
    } else {
      score -= 35;
      missedCriteria.push(`In ${listing.neighborhood}, not ${criteria.neighborhood}`);
    }
  }

  // 2. Bedrooms & Unit Type Matching
  if (criteria.bedrooms !== undefined) {
    if (listing.bedrooms === criteria.bedrooms) {
      score += 20;
      matchHighlights.push(`🛏️ Exact layout: ${listing.bedrooms}-Bedroom (${listing.property_type})`);
    } else if (Math.abs(listing.bedrooms - criteria.bedrooms) === 1) {
      score -= 10;
      missedCriteria.push(`${listing.bedrooms}-Bedroom instead of ${criteria.bedrooms}-Bed`);
    } else {
      score -= 25;
      missedCriteria.push(`${listing.bedrooms}-Bedroom unit`);
    }
  }

  if (criteria.propertyType) {
    const filterType = criteria.propertyType.toLowerCase();
    if (listing.property_type.toLowerCase().includes(filterType)) {
      score += 10;
    }
  }

  // 3. Budget Matching
  if (criteria.maxBudget) {
    const rent = listing.pricing.annual_rent;
    if (rent <= criteria.maxBudget) {
      score += 25;
      const diff = criteria.maxBudget - rent;
      if (diff > 0) {
        matchHighlights.push(
          `💰 ₦${rent.toLocaleString()} rent is ₦${diff.toLocaleString()} below your ₦${criteria.maxBudget.toLocaleString()} limit`
        );
      } else {
        matchHighlights.push(`💰 Exactly matches your ₦${criteria.maxBudget.toLocaleString()} budget ceiling`);
      }
    } else {
      const over = rent - criteria.maxBudget;
      const percentOver = (over / criteria.maxBudget) * 100;
      if (percentOver <= 15) {
        score -= 10;
        missedCriteria.push(`Rent (₦${rent.toLocaleString()}) slightly exceeds budget by ₦${over.toLocaleString()}`);
      } else {
        score -= 35;
        missedCriteria.push(`Rent (₦${rent.toLocaleString()}) exceeds budget limit`);
      }
    }
  }

  if (criteria.maxTotalCost) {
    const totalCost = listing.pricing.total_move_in_cost;
    if (totalCost <= criteria.maxTotalCost) {
      score += 25;
      matchHighlights.push(
        `💳 Total upfront move-in (₦${totalCost.toLocaleString()}) fits your ₦${criteria.maxTotalCost.toLocaleString()} budget`
      );
    } else {
      score -= 30;
      missedCriteria.push(`Total cost (₦${totalCost.toLocaleString()}) exceeds move-in budget`);
    }
  }

  // 4. Amenities Matching
  for (const amenity of criteria.requiredAmenities) {
    if (amenity === "prepaid_meter") {
      const hasMeter =
        listingAmenities.includes("prepaid") ||
        listingDescLower.includes("prepaid") ||
        listingAmenities.includes("self-billed");
      if (hasMeter) {
        score += 12;
        matchHighlights.push(`⚡ Independent prepaid meter installed (self-billed power)`);
      } else {
        missedCriteria.push(`Prepaid meter not explicitly indicated`);
      }
    }

    if (amenity === "borehole_water") {
      const hasWater =
        listingAmenities.includes("borehole") ||
        listingDescLower.includes("borehole") ||
        listingAmenities.includes("water");
      if (hasWater) {
        score += 10;
        matchHighlights.push(`💧 Automated borehole water system with overhead storage`);
      }
    }

    if (amenity === "security") {
      const hasSec =
        listingAmenities.includes("security") ||
        listingAmenities.includes("fence") ||
        listingAmenities.includes("guard") ||
        listingAmenities.includes("cctv") ||
        listingDescLower.includes("security");
      if (hasSec) {
        score += 10;
        matchHighlights.push(`🛡️ Perimeter security with gated perimeter & guard coverage`);
      }
    }

    if (amenity === "power_backup") {
      const hasPower =
        listingAmenities.includes("solar") ||
        listingAmenities.includes("inverter") ||
        listingAmenities.includes("changeover") ||
        listingAmenities.includes("transformer");
      if (hasPower) {
        score += 12;
        matchHighlights.push(`🔋 Dedicated power infrastructure (transformer / generator changeover / solar ready)`);
      }
    }

    if (amenity === "parking") {
      const hasParking =
        listingAmenities.includes("parking") ||
        listingAmenities.includes("compound") ||
        listingDescLower.includes("compound");
      if (hasParking) {
        score += 8;
        matchHighlights.push(`🚗 Ample interlocked compound & secure car parking`);
      }
    }

    if (amenity === "boys_quarters") {
      const hasBQ = listingAmenities.includes("bq") || listingDescLower.includes("quarters");
      if (hasBQ) {
        score += 15;
        matchHighlights.push(`🏡 Includes attached self-contained Boys Quarters (BQ)`);
      }
    }
  }

  // 5. Commute & Proximity Anchors
  for (const anchor of criteria.commuteAnchors) {
    const anchorLower = anchor.toLowerCase();
    if (listingCommute.includes(anchorLower) || listingTitleLower.includes(anchorLower)) {
      score += 15;
      matchHighlights.push(`📍 Prime commute perk: ${listing.commute_badge}`);
    }
  }

  // 6. Lifestyle Context Matching
  if (criteria.lifestyleContext && criteria.lifestyleContext.length > 0) {
    if (
      criteria.lifestyleContext.includes("nysc") ||
      criteria.lifestyleContext.includes("student") ||
      criteria.lifestyleContext.includes("single_professional")
    ) {
      if (listing.property_type === "Mini-flat" || listing.bedrooms === 1) {
        score += 15;
        matchHighlights.push(`🎓 Ideal layout for students, NYSC corps members & young professionals`);
      }
      if (listing.pricing.annual_rent <= 300000) {
        score += 20;
        matchHighlights.push(`💰 Student/NYSC budget friendly: ₦${listing.pricing.annual_rent.toLocaleString("en-NG")}/year`);
      }
    }

    if (criteria.lifestyleContext.includes("family")) {
      if (listing.bedrooms >= 2) {
        score += 12;
        matchHighlights.push(`👨‍👩‍👧 Family-friendly layout with ${listing.bedrooms} spacious ensuite bedrooms`);
      }
    }

    if (criteria.lifestyleContext.includes("executive")) {
      if (listing.pricing.annual_rent >= 800000 || listing.property_type.includes("Duplex")) {
        score += 15;
        matchHighlights.push(`👑 Executive standard with premium finishes and private compound`);
      }
    }
  }

  // 7. Caution Fee Matching
  if (criteria.noCautionFee) {
    if (listing.pricing.caution_fee === 0) {
      score += 25;
      matchHighlights.push(`🎉 Zero Caution Deposit Mandate (waived by landlord)`);
    } else {
      score -= 20;
      missedCriteria.push("Requires 10% refundable caution deposit");
    }
  } else if (listing.pricing.caution_fee === 0) {
    score += 5;
    matchHighlights.push(`🎉 Zero Caution Deposit Concession (₦0 upfront caution)`);
  }

  // Fallback highlight if matchHighlights is sparse but score is decent
  if (matchHighlights.length === 0) {
    matchHighlights.push(`✅ Verified landlord mandate (#${listing.mandate.mandate_ref}) with ESVARBON accreditation`);
    if (listing.pricing.caution_fee === 0) {
      matchHighlights.push(`🎉 Zero Caution Deposit (waived under landlord mandate)`);
    } else {
      matchHighlights.push(`🛡️ 10% caution fee protected in Key-in-Door Escrow`);
    }
  }

  // Clamp score between 15 and 99
  const clampedScore = Math.max(15, Math.min(99, Math.round(score)));

  return {
    listing,
    relevanceScore: clampedScore,
    matchHighlights: matchHighlights.slice(0, 4),
    missedCriteria,
    isTopMatch: false,
  };
}

/**
 * Executes full natural-language AI Search over an array of listings
 */
export function runAISearch(rawQuery: string, listings: Listing[]): {
  criteria: AISearchCriteria;
  results: AIMatchResult[];
} {
  const criteria = parseNaturalLanguageQuery(rawQuery);

  const scoredResults = listings
    .map((l) => scoreListing(l, criteria))
    // Filter out severe mismatches if query had specific hard constraints
    .filter((res) => {
      // If user strictly requested Barnawa, do not show Malali with low score
      if (criteria.neighborhood !== "all") {
        if (res.listing.neighborhood.toLowerCase() !== criteria.neighborhood.toLowerCase()) {
          return false;
        }
      }
      return res.relevanceScore >= 35;
    })
    .sort((a, b) => b.relevanceScore - a.relevanceScore);

  if (scoredResults.length > 0) {
    scoredResults[0].isTopMatch = true;
  }

  return {
    criteria,
    results: scoredResults,
  };
}
