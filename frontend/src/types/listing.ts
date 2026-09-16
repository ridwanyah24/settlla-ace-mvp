export interface Mandate {
  mandate_ref: string;
  manager_name: string;
  accreditation: string;
  landlord_name: string;
  mandate_status: string;
}

export interface VisitingWindow {
  day: string;
  hours: string;
}

export interface PricingBreakdown {
  annual_rent: number;
  caution_fee: number;
  legal_fee: number;
  agency_fee: number;
  total_move_in_cost: number;
  inspection_fee: number;
}

export interface Listing {
  id: string;
  title: string;
  neighborhood: string;
  zone: string;
  full_address: string;
  title_reference?: string;
  property_type: string;
  bedrooms: number;
  bathrooms: number;
  commute_badge: string;
  commute_context: string;
  description: string;
  amenities: string[];
  images: string[];
  pricing: PricingBreakdown;
  mandate: Mandate;
  visiting_windows: VisitingWindow[];
}
