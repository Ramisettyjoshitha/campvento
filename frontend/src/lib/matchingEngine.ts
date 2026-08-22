/**
 * CAMPVENTO — Step 6: Explainable AI Sponsor Matching Engine
 * frontend/src/lib/matchingEngine.ts
 *
 * Core deterministic multi-factor matching engine.
 * Computes explainable compatibility scores between Sponsor Profiles,
 * Events, and Sponsorship Packages without external AI/LLM API dependencies.
 */

import type { SponsorProfile } from './sponsorProfile';
import type { DiscoverableEvent, DiscoverablePackage } from './sponsorDiscovery';

export type MatchQuality =
  | 'Excellent Match'
  | 'Strong Match'
  | 'Good Match'
  | 'Moderate Match'
  | 'Low Match';

export interface MatchFactor {
  name: string;
  score: number; // 0 - 100
  weight: number; // Percentage (e.g., 25 for 25%)
  weightedScore: number; // score * (weight / 100)
  explanation: string;
}

export interface MatchReason {
  type: 'positive' | 'caution' | 'neutral';
  text: string;
  factorName: string;
}

export interface MatchScore {
  totalScore: number; // 0 - 100 (rounded)
  quality: MatchQuality;
  factors: MatchFactor[];
  reasons: string[];
  strengths: string[];
  weaknesses: string[];
}

export interface SponsorMatch {
  sponsorId: string;
  eventId: string;
  packageId: string;
  event: DiscoverableEvent;
  package: DiscoverablePackage;
  sponsor?: SponsorProfile;
  score: number;
  quality: MatchQuality;
  factors: MatchFactor[];
  reasons: string[];
  strengths: string[];
  weaknesses: string[];
}

export interface MatchingWeights {
  industry: number; // 25%
  category: number; // 20%
  budget: number; // 20%
  audience: number; // 15%
  location: number; // 10%
  reach: number; // 10%
}

export const DEFAULT_WEIGHTS: MatchingWeights = {
  industry: 0.25,
  category: 0.2,
  budget: 0.2,
  audience: 0.15,
  location: 0.1,
  reach: 0.1,
};

// ---------------------------------------------------------------------------
// 1. Industry Matching (25%)
// ---------------------------------------------------------------------------

const INDUSTRY_CATEGORY_AFFINITY: Record<string, string[]> = {
  tech: ['hackathon', 'technical fest', 'conference & summit', 'gaming & esports', 'workshop & bootcamp'],
  software: ['hackathon', 'technical fest', 'conference & summit', 'gaming & esports', 'workshop & bootcamp'],
  ai: ['hackathon', 'technical fest', 'conference & summit', 'workshop & bootcamp'],
  cloud: ['hackathon', 'technical fest', 'conference & summit', 'workshop & bootcamp'],
  crypto: ['hackathon', 'conference & summit', 'networking meetup'],
  fintech: ['hackathon', 'conference & summit', 'networking meetup', 'technical fest'],
  finance: ['conference & summit', 'networking meetup', 'hackathon'],
  sports: ['sports tournament', 'cultural fest'],
  fitness: ['sports tournament', 'cultural fest'],
  beverage: ['cultural fest', 'sports tournament', 'hackathon', 'networking meetup'],
  food: ['cultural fest', 'sports tournament', 'hackathon'],
  education: ['workshop & bootcamp', 'conference & summit', 'hackathon', 'technical fest'],
  edtech: ['workshop & bootcamp', 'conference & summit', 'hackathon', 'technical fest'],
  gaming: ['gaming & esports', 'technical fest', 'cultural fest', 'hackathon'],
  media: ['cultural fest', 'gaming & esports', 'networking meetup'],
  entertainment: ['cultural fest', 'gaming & esports'],
};

export const calculateIndustryMatch = (
  sponsorIndustry?: string | null,
  eventCategory?: string | null,
  eventDescription?: string | null
): MatchFactor => {
  const weight = 25;

  if (!sponsorIndustry || !sponsorIndustry.trim()) {
    return {
      name: 'Industry Alignment',
      score: 50,
      weight,
      weightedScore: 50 * (weight / 100),
      explanation: 'Sponsor industry is not specified; baseline moderate alignment assigned.',
    };
  }

  const indClean = sponsorIndustry.toLowerCase().trim();
  const catClean = (eventCategory || '').toLowerCase().trim();
  const descClean = (eventDescription || '').toLowerCase();

  // Direct word match between industry and category
  if (catClean.includes(indClean) || indClean.includes(catClean)) {
    return {
      name: 'Industry Alignment',
      score: 100,
      weight,
      weightedScore: 100 * (weight / 100),
      explanation: `Direct industry affinity: ${sponsorIndustry} aligns directly with ${eventCategory}.`,
    };
  }

  // Check affinity mapping
  let bestAffinityScore = 35;

  for (const [key, matchingCategories] of Object.entries(INDUSTRY_CATEGORY_AFFINITY)) {
    if (indClean.includes(key)) {
      if (matchingCategories.some((mc) => catClean.includes(mc))) {
        bestAffinityScore = 95;
        break;
      }
      if (matchingCategories.some((mc) => descClean.includes(mc))) {
        bestAffinityScore = 80;
        break;
      }
      bestAffinityScore = Math.max(bestAffinityScore, 50);
    }
  }

  // Check if event description mentions the industry
  if (descClean.includes(indClean)) {
    bestAffinityScore = Math.max(bestAffinityScore, 85);
  }

  const explanation =
    bestAffinityScore >= 80
      ? `Strong synergy: ${sponsorIndustry} brand aligns closely with ${eventCategory || 'event theme'}.`
      : bestAffinityScore >= 50
      ? `Moderate alignment between ${sponsorIndustry} and ${eventCategory || 'this event category'}.`
      : `Lower domain overlap between ${sponsorIndustry} and ${eventCategory || 'this event'}.`;

  return {
    name: 'Industry Alignment',
    score: bestAffinityScore,
    weight,
    weightedScore: (bestAffinityScore * weight) / 100,
    explanation,
  };
};

// ---------------------------------------------------------------------------
// 2. Event Category Matching (20%)
// ---------------------------------------------------------------------------

export const calculateCategoryMatch = (
  preferredCategories?: string | null,
  eventCategory?: string | null
): MatchFactor => {
  const weight = 20;

  if (!preferredCategories || !preferredCategories.trim()) {
    return {
      name: 'Event Category',
      score: 55,
      weight,
      weightedScore: 55 * (weight / 100),
      explanation: 'No category preferences specified; open to all campus event formats.',
    };
  }

  if (!eventCategory || !eventCategory.trim()) {
    return {
      name: 'Event Category',
      score: 50,
      weight,
      weightedScore: 50 * (weight / 100),
      explanation: 'Event category pending definition.',
    };
  }

  const prefList = preferredCategories
    .toLowerCase()
    .split(/[,;/]+/)
    .map((s) => s.trim())
    .filter(Boolean);

  const eventCatLower = eventCategory.toLowerCase().trim();

  // Check exact or substring overlap
  const exactMatch = prefList.some((pref) => pref === eventCatLower);
  if (exactMatch) {
    return {
      name: 'Event Category',
      score: 100,
      weight,
      weightedScore: 100 * (weight / 100),
      explanation: `Exact category match: "${eventCategory}" is listed in sponsor preferred categories.`,
    };
  }

  const partialMatch = prefList.some(
    (pref) => eventCatLower.includes(pref) || pref.includes(eventCatLower)
  );

  if (partialMatch) {
    return {
      name: 'Event Category',
      score: 80,
      weight,
      weightedScore: 80 * (weight / 100),
      explanation: `Related category match: "${eventCategory}" matches sponsor interest in ${preferredCategories}.`,
    };
  }

  return {
    name: 'Event Category',
    score: 30,
    weight,
    weightedScore: 30 * (weight / 100),
    explanation: `"${eventCategory}" is not in sponsor's preferred list (${preferredCategories}).`,
  };
};

// ---------------------------------------------------------------------------
// 3. Budget Compatibility (20%)
// ---------------------------------------------------------------------------

export const calculateBudgetMatch = (
  budgetMin: number = 0,
  budgetMax: number = 0,
  packagePrice: number = 0
): MatchFactor => {
  const weight = 20;

  // Unconfigured sponsor budget
  if (budgetMin === 0 && budgetMax === 0) {
    return {
      name: 'Budget Compatibility',
      score: 60,
      weight,
      weightedScore: 60 * (weight / 100),
      explanation: `Package price ($${packagePrice.toLocaleString()}) evaluated against default open budget allocation.`,
    };
  }

  const effectiveMin = Math.max(0, budgetMin);
  const effectiveMax = Math.max(effectiveMin, budgetMax);

  // Exact fit inside budget window
  if (packagePrice >= effectiveMin && packagePrice <= effectiveMax) {
    return {
      name: 'Budget Compatibility',
      score: 100,
      weight,
      weightedScore: 100 * (weight / 100),
      explanation: `Package price ($${packagePrice.toLocaleString()}) fits comfortably within preferred budget ($${effectiveMin.toLocaleString()} - $${effectiveMax.toLocaleString()}).`,
    };
  }

  // Slightly below minimum budget (still accessible, but lower investment tier)
  if (packagePrice < effectiveMin) {
    const ratio = effectiveMin > 0 ? packagePrice / effectiveMin : 0.8;
    const score = Math.max(40, Math.round(50 + ratio * 40));
    return {
      name: 'Budget Compatibility',
      score,
      weight,
      weightedScore: (score * weight) / 100,
      explanation: `Package price ($${packagePrice.toLocaleString()}) is below minimum target budget ($${effectiveMin.toLocaleString()}), offering high cost efficiency.`,
    };
  }

  // Above maximum budget
  if (packagePrice > effectiveMax) {
    const excessRatio = effectiveMax > 0 ? (packagePrice - effectiveMax) / effectiveMax : 1;
    let score = 20;
    let desc = `Package price ($${packagePrice.toLocaleString()}) substantially exceeds max budget ($${effectiveMax.toLocaleString()}).`;

    if (excessRatio <= 0.25) {
      score = 75;
      desc = `Package price ($${packagePrice.toLocaleString()}) is slightly above max budget ($${effectiveMax.toLocaleString()}) by ${Math.round(excessRatio * 100)}%.`;
    } else if (excessRatio <= 0.5) {
      score = 50;
      desc = `Package price ($${packagePrice.toLocaleString()}) is moderately above max budget ($${effectiveMax.toLocaleString()}) by ${Math.round(excessRatio * 100)}%.`;
    }

    return {
      name: 'Budget Compatibility',
      score,
      weight,
      weightedScore: (score * weight) / 100,
      explanation: desc,
    };
  }

  return {
    name: 'Budget Compatibility',
    score: 50,
    weight,
    weightedScore: 50 * (weight / 100),
    explanation: `Package price: $${packagePrice.toLocaleString()}.`,
  };
};

// ---------------------------------------------------------------------------
// 4. Target Audience (15%)
// ---------------------------------------------------------------------------

export const calculateAudienceMatch = (
  preferredAudience?: string | null,
  targetAudience?: string | null
): MatchFactor => {
  const weight = 15;

  if (!preferredAudience || !preferredAudience.trim()) {
    return {
      name: 'Target Audience',
      score: 55,
      weight,
      weightedScore: 55 * (weight / 100),
      explanation: 'Sponsor has broad demographic targeting; general student reach applies.',
    };
  }

  if (!targetAudience || !targetAudience.trim()) {
    return {
      name: 'Target Audience',
      score: 50,
      weight,
      weightedScore: 50 * (weight / 100),
      explanation: 'Event target audience details pending.',
    };
  }

  const prefTokens = preferredAudience
    .toLowerCase()
    .split(/[,;\s]+/)
    .filter((w) => w.length > 2);

  const targetTokens = targetAudience
    .toLowerCase()
    .split(/[,;\s]+/)
    .filter((w) => w.length > 2);

  const matchingTokens = prefTokens.filter((token) =>
    targetTokens.some((tt) => tt.includes(token) || token.includes(tt))
  );

  const matchRatio = prefTokens.length > 0 ? matchingTokens.length / prefTokens.length : 0;

  let score = 30;
  let explanation = `Limited audience overlap between "${preferredAudience}" and "${targetAudience}".`;

  if (matchRatio >= 0.6 || matchingTokens.length >= 2) {
    score = 95;
    explanation = `High demographic alignment: event reaches ${targetAudience}, matching preferred audience (${preferredAudience}).`;
  } else if (matchRatio > 0 || matchingTokens.length >= 1) {
    score = 75;
    explanation = `Partial audience overlap: reaches relevant segments of ${preferredAudience}.`;
  }

  return {
    name: 'Target Audience',
    score,
    weight,
    weightedScore: (score * weight) / 100,
    explanation,
  };
};

// ---------------------------------------------------------------------------
// 5. Location Compatibility (10%)
// ---------------------------------------------------------------------------

export const calculateLocationMatch = (
  preferredLocations?: string | null,
  eventVenue?: string | null
): MatchFactor => {
  const weight = 10;

  if (!preferredLocations || !preferredLocations.trim()) {
    return {
      name: 'Location Compatibility',
      score: 60,
      weight,
      weightedScore: 60 * (weight / 100),
      explanation: 'No geographic restrictions specified by sponsor; open to all locations.',
    };
  }

  const prefLower = preferredLocations.toLowerCase();
  const venueLower = (eventVenue || '').toLowerCase();

  // Universal / Remote locations
  const isUniversal =
    prefLower.includes('remote') ||
    prefLower.includes('virtual') ||
    prefLower.includes('online') ||
    prefLower.includes('all') ||
    prefLower.includes('nationwide') ||
    prefLower.includes('global') ||
    venueLower.includes('virtual') ||
    venueLower.includes('online') ||
    venueLower.includes('remote');

  if (isUniversal) {
    return {
      name: 'Location Compatibility',
      score: 100,
      weight,
      weightedScore: 100 * (weight / 100),
      explanation: 'Location matches virtual, remote, or nationwide geographic scope.',
    };
  }

  if (!eventVenue || !eventVenue.trim()) {
    return {
      name: 'Location Compatibility',
      score: 50,
      weight,
      weightedScore: 50 * (weight / 100),
      explanation: 'Venue details pending specification.',
    };
  }

  const locations = prefLower
    .split(/[,;/]+/)
    .map((l) => l.trim())
    .filter(Boolean);

  const directMatch = locations.some(
    (loc) => venueLower.includes(loc) || loc.includes(venueLower)
  );

  if (directMatch) {
    return {
      name: 'Location Compatibility',
      score: 100,
      weight,
      weightedScore: 100 * (weight / 100),
      explanation: `Direct location match: event venue (${eventVenue}) matches target location (${preferredLocations}).`,
    };
  }

  return {
    name: 'Location Compatibility',
    score: 35,
    weight,
    weightedScore: 35 * (weight / 100),
    explanation: `Event location (${eventVenue}) is outside primary preferred regions (${preferredLocations}).`,
  };
};

// ---------------------------------------------------------------------------
// 6. Expected Reach (10%)
// ---------------------------------------------------------------------------

export const calculateReachMatch = (
  expectedAttendees?: number | null
): MatchFactor => {
  const weight = 10;
  const count = expectedAttendees !== null && expectedAttendees !== undefined ? expectedAttendees : 0;

  let score = 30;
  let explanation = 'Audience size is not specified or pending estimation.';

  if (count >= 1000) {
    score = 100;
    explanation = `High campus reach with ${count.toLocaleString()}+ prospective attendees.`;
  } else if (count >= 500) {
    score = 80;
    explanation = `Strong campus visibility with ${count.toLocaleString()} expected attendees.`;
  } else if (count >= 150) {
    score = 65;
    explanation = `Moderate, focused audience of ${count.toLocaleString()} attendees.`;
  } else if (count > 0) {
    score = 45;
    explanation = `Intimate target group of ${count} attendees.`;
  }

  return {
    name: 'Expected Reach',
    score,
    weight,
    weightedScore: (score * weight) / 100,
    explanation,
  };
};

// ---------------------------------------------------------------------------
// 7. Composite Match Calculation & Reason Generation
// ---------------------------------------------------------------------------

export const getMatchQuality = (score: number): MatchQuality => {
  if (score >= 90) return 'Excellent Match';
  if (score >= 75) return 'Strong Match';
  if (score >= 60) return 'Good Match';
  if (score >= 40) return 'Moderate Match';
  return 'Low Match';
};

export const generateMatchReasons = (factors: MatchFactor[]): {
  reasons: string[];
  strengths: string[];
  weaknesses: string[];
} => {
  const strengths: string[] = [];
  const weaknesses: string[] = [];
  const reasons: string[] = [];

  factors.forEach((f) => {
    if (f.score >= 75) {
      strengths.push(f.explanation);
      reasons.push(`✓ ${f.name}: ${f.explanation}`);
    } else if (f.score < 50) {
      weaknesses.push(f.explanation);
      reasons.push(`⚠ ${f.name}: ${f.explanation}`);
    } else {
      reasons.push(`• ${f.name}: ${f.explanation}`);
    }
  });

  return { reasons, strengths, weaknesses };
};

/**
 * Calculates complete explainable match score between a sponsor, event, and package.
 */
export const calculateMatchScore = (
  sponsor: SponsorProfile,
  event: DiscoverableEvent,
  pkg: DiscoverablePackage
): MatchScore => {
  const fIndustry = calculateIndustryMatch(sponsor.industry, event.category, event.description);
  const fCategory = calculateCategoryMatch(sponsor.preferred_categories, event.category);
  const fBudget = calculateBudgetMatch(
    sponsor.sponsorship_budget_min,
    sponsor.sponsorship_budget_max,
    pkg.price
  );
  const fAudience = calculateAudienceMatch(sponsor.preferred_audience, event.target_audience);
  const fLocation = calculateLocationMatch(sponsor.preferred_locations, event.venue);
  const fReach = calculateReachMatch(event.expected_attendees);

  const factors: MatchFactor[] = [fIndustry, fCategory, fBudget, fAudience, fLocation, fReach];

  const totalWeighted = factors.reduce((sum, f) => sum + f.weightedScore, 0);
  const totalScore = Math.min(100, Math.max(0, Math.round(totalWeighted)));
  const quality = getMatchQuality(totalScore);

  const { reasons, strengths, weaknesses } = generateMatchReasons(factors);

  return {
    totalScore,
    quality,
    factors,
    reasons,
    strengths,
    weaknesses,
  };
};
