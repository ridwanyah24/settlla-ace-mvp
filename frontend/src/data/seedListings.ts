import { Listing } from "@/types/listing";

export function calculatePricing(annualRent: number) {
  const cautionFee = Math.round(annualRent * 0.1);
  const legalFee = Math.round(annualRent * 0.05);
  const agencyFee = Math.round(annualRent * 0.1);
  const totalMoveInCost = annualRent + cautionFee + legalFee + agencyFee;

  return {
    annual_rent: annualRent,
    caution_fee: cautionFee,
    legal_fee: legalFee,
    agency_fee: agencyFee,
    total_move_in_cost: totalMoveInCost,
    inspection_fee: 0,
  };
}

export const SEED_LISTINGS: Listing[] = [
  {
    id: "prop_barnawa_01",
    title: "Executive 1-Bedroom Flat at Barnawa Terraces",
    neighborhood: "Barnawa",
    zone: "Barnawa GRA",
    full_address: "Plot 12 Coronation Crescent, Barnawa, Kaduna",
    title_reference:
      "KADGIS Certificate of Occupancy No. KDL-BNW-2018-0941 (Deed Reg. Vol. 14, Page 22, Kaduna Land Registry)",
    property_type: "1-Bedroom Flat",
    bedrooms: 1,
    bathrooms: 1,
    commute_badge: "4 mins to Barnawa Complex / GTBank",
    commute_context:
      "Direct 4-minute drive or keke ride to GTBank Barnawa and Barnawa Shopping Complex.",
    description:
      "Tastefully finished modern 1-bedroom flat in a calm, secured residential cul-de-sac. Features dedicated self-billed prepaid electricity, uninterrupted borehole water supply, POP ceilings, fully tiled floors, and perimeter security fencing.",
    amenities: [
      "Dedicated Prepaid Meter (Self-Billed)",
      "Borehole Water + 5,000L Overhead Tank",
      "24/7 Uniformed Gate Security",
      "Interlocked Compound & Ample Parking",
      "Modern POP Ceiling & Tiled Floors",
    ],
    images: [
      "/images/living_room.jpg",
      "/images/bedroom.jpg",
      "/images/exterior.jpg",
    ],
    pricing: calculatePricing(500000),
    mandate: {
      mandate_ref: "HBA-KD-BNW-2026-089",
      manager_name: "HB&A Partners & Co.",
      accreditation: "ESVARBON / NIESV Reg. #A2840",
      landlord_name: "Alhaji Shehu Garba",
      mandate_status: "Verified & Active",
    },
    visiting_windows: [
      { day: "Tuesdays & Thursdays", hours: "2:00 PM – 5:00 PM" },
      { day: "Saturdays", hours: "10:00 AM – 3:00 PM" },
    ],
  },
  {
    id: "prop_barnawa_02",
    title: "Serviced 2-Bedroom Apartment off Barnawa Close",
    neighborhood: "Barnawa",
    zone: "Barnawa Phase 1",
    full_address: "8 Barnawa Close, near GTBank Branch, Kaduna",
    title_reference:
      "KADGIS Certificate of Occupancy No. KDL-BNW-2020-1182 (Deed Reg. Vol. 21, Page 45, Kaduna Land Registry)",
    property_type: "2-Bedroom Flat",
    bedrooms: 2,
    bathrooms: 2,
    commute_badge: "2 mins walk to GTBank Barnawa Branch",
    commute_context:
      "Walking distance (approx 200m) to GTBank Barnawa branch and commercial axis.",
    description:
      "Spacious serviced 2-bedroom flat with both rooms ensuite. Complete with fitted kitchen, automated borehole water system, dedicated prepaid meter, and private security guard on site.",
    amenities: [
      "Independent Prepaid Electric Meter",
      "Automated Borehole Pumping System",
      "Dedicated Security Guardhouse",
      "Fenced & Gated Perimeter",
      "Ensuite Bedrooms with Water Heaters",
    ],
    images: [
      "/images/living_room.jpg",
      "/images/bedroom.jpg",
      "/images/exterior.jpg",
    ],
    pricing: calculatePricing(750000),
    mandate: {
      mandate_ref: "HBA-KD-BNW-2026-112",
      manager_name: "HB&A Partners & Co.",
      accreditation: "ESVARBON / NIESV Reg. #A2840",
      landlord_name: "Barrister Amina Yakubu",
      mandate_status: "Verified & Active",
    },
    visiting_windows: [
      { day: "Wednesdays & Fridays", hours: "3:00 PM – 5:30 PM" },
      { day: "Saturdays", hours: "11:00 AM – 4:00 PM" },
    ],
  },
  {
    id: "prop_malali_01",
    title: "Contemporary 2-Bedroom Flat in Malali Low Cost",
    neighborhood: "Malali",
    zone: "Malali Low Cost",
    full_address: "Block 4, Gwari Crescent, Malali Low Cost, Kaduna",
    title_reference:
      "KADGIS Statutory Right of Occupancy No. KDL-MAL-2016-0419 (Deed Reg. Vol. 09, Page 88, Kaduna Land Registry)",
    property_type: "2-Bedroom Flat",
    bedrooms: 2,
    bathrooms: 2,
    commute_badge: "6 mins to Malali Roundabout / NDA Road",
    commute_context:
      "Fast access to Malali Roundabout, NDA Road, and Kaduna metropolis transit points.",
    description:
      "Well-maintained 2-bedroom flat in a quiet residential neighborhood of Malali Low Cost. Constant water from industrial borehole, personal prepaid meter, cross-ventilation, and dedicated generator changeover switch.",
    amenities: [
      "Personal Prepaid Meter",
      "Heavy-Duty Industrial Borehole",
      "Secure Street Neighborhood Watch",
      "Spacious Kitchen with Heat Extractor",
      "Dedicated Generator Changeover Switch",
    ],
    images: [
      "/images/exterior.jpg",
      "/images/living_room.jpg",
      "/images/bedroom.jpg",
    ],
    pricing: calculatePricing(650000),
    mandate: {
      mandate_ref: "HBA-KD-MAL-2026-044",
      manager_name: "HB&A Partners & Co.",
      accreditation: "ESVARBON / NIESV Reg. #A2840",
      landlord_name: "Col. Usman Bello (Rtd)",
      mandate_status: "Verified & Active",
    },
    visiting_windows: [
      { day: "Tuesdays & Thursdays", hours: "1:00 PM – 4:00 PM" },
      { day: "Saturdays", hours: "10:00 AM – 2:00 PM" },
    ],
  },
  {
    id: "prop_malali_02",
    title: "Cozy Studio Mini-Flat along Isa Kaita Extension",
    neighborhood: "Malali",
    zone: "Malali GRA Ext.",
    full_address: "15 Isa Kaita Extension, near Golf Club, Malali, Kaduna",
    title_reference:
      "KADGIS Certificate of Occupancy No. KDL-MAL-2021-0733 (Deed Reg. Vol. 27, Page 12, Kaduna Land Registry)",
    property_type: "Mini-flat",
    bedrooms: 1,
    bathrooms: 1,
    commute_badge: "3 mins to Kaduna Golf Club / Isa Kaita Road",
    commute_context:
      "Strategic central Malali location, 3 minutes from Kaduna Golf Club and recreational hubs.",
    description:
      "Affordable, secure mini-flat suitable for NYSC corps members or single professionals. Features a private kitchenette, clean filtered borehole water, smart prepaid meter, and night security guard.",
    amenities: [
      "Dedicated Smart Prepaid Meter",
      "Clean Borehole Water with Filtration",
      "Night Watchman on Duty",
      "Private Balcony & Cross Ventilation",
      "Fully Tiled Interior",
    ],
    images: [
      "/images/bedroom.jpg",
      "/images/living_room.jpg",
      "/images/exterior.jpg",
    ],
    pricing: calculatePricing(420000),
    mandate: {
      mandate_ref: "HBA-KD-MAL-2026-077",
      manager_name: "HB&A Partners & Co.",
      accreditation: "ESVARBON / NIESV Reg. #A2840",
      landlord_name: "Dr. Fatima Suleiman",
      mandate_status: "Verified & Active",
    },
    visiting_windows: [
      { day: "Mondays & Wednesdays", hours: "2:00 PM – 5:00 PM" },
      { day: "Sundays", hours: "12:00 PM – 4:00 PM" },
    ],
  },
  {
    id: "prop_barnawa_03",
    title: "Modern 3-Bedroom Family Flat in Barnawa GRA",
    neighborhood: "Barnawa",
    zone: "Barnawa New GRA",
    full_address: "22 Queen Amina Way, Barnawa GRA, Kaduna",
    title_reference:
      "KADGIS Certificate of Occupancy No. KDL-BNW-2017-0628 (Deed Reg. Vol. 18, Page 73, Kaduna Land Registry)",
    property_type: "3-Bedroom Flat",
    bedrooms: 3,
    bathrooms: 3,
    commute_badge: "5 mins to GTBank Barnawa / Market",
    commute_context:
      "Prime Barnawa GRA address with immediate access to Queen Amina corridor and commercial stores.",
    description:
      "Generously proportioned 3-bedroom apartment with 3 ensuite bathrooms. Features continuous pressurized borehole system, dual-source prepaid electricity, electrified perimeter fence, and dedicated visitor parking bays.",
    amenities: [
      "Dual-Source Prepaid Power",
      "Continuous Borehole Pressure System",
      "Electric Fence & CCTV Perimeter",
      "Visitor Parking Bay",
      "All Bedrooms Ensuite with Wardrobes",
    ],
    images: [
      "/images/exterior.jpg",
      "/images/living_room.jpg",
      "/images/bedroom.jpg",
    ],
    pricing: calculatePricing(800000),
    mandate: {
      mandate_ref: "HBA-KD-BNW-2026-156",
      manager_name: "HB&A Partners & Co.",
      accreditation: "ESVARBON / NIESV Reg. #A2840",
      landlord_name: "Engr. Nnamdi Eze",
      mandate_status: "Verified & Active",
    },
    visiting_windows: [
      { day: "Tuesdays & Fridays", hours: "2:00 PM – 5:00 PM" },
      { day: "Saturdays", hours: "9:00 AM – 2:00 PM" },
    ],
  },
  {
    id: "prop_malali_03",
    title: "Luxury 3-Bedroom Semi-Detached Duplex off Danmarna Road",
    neighborhood: "Malali",
    zone: "Malali GRA",
    full_address: "14 Danmarna Close, Malali GRA, Kaduna",
    title_reference:
      "KADGIS Certificate of Occupancy No. KDL-MAL-2019-0824 (Deed Reg. Vol. 22, Page 15, Kaduna Land Registry)",
    property_type: "3-Bedroom Duplex",
    bedrooms: 3,
    bathrooms: 4,
    commute_badge: "4 mins to NDA Gate / Rabah Road",
    commute_context:
      "Serene Malali diplomatic enclave with fast 4-minute connection to Rabah Road and central Kaduna.",
    description:
      "Exquisite modern duplex in Malali GRA featuring personal dedicated transformer connection, solar inverter backup pre-wiring, automated gate, boys' quarters, and manicured private compound.",
    amenities: [
      "Dedicated 33kVA Transformer Connection",
      "Solar & Inverter Pre-Wired Infrastructure",
      "Motorized Security Gate & CCTV",
      "Attached Self-Contained BQ (Boys Quarters)",
      "Automated Water Treatment Plant",
    ],
    images: [
      "/images/exterior.jpg",
      "/images/living_room.jpg",
      "/images/bedroom.jpg",
    ],
    pricing: calculatePricing(1200000),
    mandate: {
      mandate_ref: "HBA-KD-MAL-2026-198",
      manager_name: "HB&A Partners & Co.",
      accreditation: "ESVARBON / NIESV Reg. #A2840",
      landlord_name: "Hajiya Maryam Lamido",
      mandate_status: "Verified & Active",
    },
    visiting_windows: [
      { day: "Wednesdays & Saturdays", hours: "11:00 AM – 4:00 PM" },
      { day: "Sundays", hours: "1:00 PM – 5:00 PM" },
    ],
  },
];

export function filterSeedListings(
  neighborhood = "all",
  maxBudget = "all",
  propertyType = "all",
  quickFilter = "all"
): Listing[] {
  return SEED_LISTINGS.filter((l) => {
    // Neighborhood filter
    if (neighborhood !== "all" && l.neighborhood.toLowerCase() !== neighborhood.toLowerCase()) {
      return false;
    }

    // Property type filter
    if (propertyType !== "all") {
      const typeLower = l.property_type.toLowerCase();
      const filterLower = propertyType.toLowerCase();
      if (!typeLower.includes(filterLower) && filterLower !== typeLower) {
        return false;
      }
    }

    // Max budget filter
    if (maxBudget !== "all") {
      const budgetNum = parseInt(maxBudget, 10);
      if (!isNaN(budgetNum) && l.pricing.annual_rent > budgetNum) {
        return false;
      }
    }

    // Quick filter chips
    if (quickFilter === "barnawa" && l.neighborhood.toLowerCase() !== "barnawa") {
      return false;
    }
    if (quickFilter === "malali" && l.neighborhood.toLowerCase() !== "malali") {
      return false;
    }
    if (quickFilter === "under_600k" && l.pricing.annual_rent > 600000) {
      return false;
    }
    if (quickFilter === "self_billed") {
      const hasSelfBilled = l.amenities.some((a) =>
        a.toLowerCase().includes("prepaid") || a.toLowerCase().includes("self-billed")
      );
      if (!hasSelfBilled) return false;
    }
    if (quickFilter === "2beds" && l.bedrooms < 2) {
      return false;
    }

    return true;
  });
}

export function getSeedListingById(id: string): Listing | undefined {
  return SEED_LISTINGS.find((l) => l.id === id);
}
