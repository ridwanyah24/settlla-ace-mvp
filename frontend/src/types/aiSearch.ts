import { Listing } from "./listing";

export interface AISearchCriteria {
  rawQuery: string;
  neighborhood: "Barnawa" | "Malali" | "all";
  zone?: string;
  propertyType?: string;
  bedrooms?: number;
  maxBudget?: number; // annual rent limit in NGN
  maxTotalCost?: number; // total move-in cost limit in NGN
  requiredAmenities: string[];
  commuteAnchors: string[];
  lifestyleContext?: string[]; // e.g. ["nysc", "doctor", "family", "bachelor"]
  parsedSummary: string;
}

export interface AIMatchResult {
  listing: Listing;
  relevanceScore: number; // 0 to 100
  matchHighlights: string[]; // AI explanations of why this property matched
  missedCriteria: string[]; // Any minor compromises
  isTopMatch: boolean;
}

export interface AISuggestedPrompt {
  id: string;
  emoji: string;
  label: string;
  query: string;
  tag: string;
}
