/**
 * CAMPVENTO — Step 6: Matching Service Layer
 * frontend/src/lib/matchingService.ts
 *
 * Coordinates sponsor profile retrieval, discoverable event querying,
 * score calculation, and result filtering/sorting.
 * Strictly adheres to Supabase RLS and never exposes private user data.
 */

import { supabase } from './supabase';
import { getSponsorProfile } from './sponsorProfile';
import type { SponsorProfile } from './sponsorProfile';
import { getDiscoverableOpportunities } from './sponsorDiscovery';
import type { DiscoverableEvent, DiscoverablePackage } from './sponsorDiscovery';
import { calculateMatchScore } from './matchingEngine';
import type { SponsorMatch } from './matchingEngine';

export type { SponsorMatch };

export interface SponsorMatchFilters {
  minScore?: number;
  category?: string;
  maxBudget?: number;
  location?: string;
  searchTerm?: string;
  sortBy?: 'score' | 'price' | 'reach' | 'date';
}

export interface MatchSummaryStats {
  totalOpportunities: number;
  excellentMatches: number;
  strongMatches: number;
  goodMatches: number;
  topScore: number;
}

export interface SponsorMatchResult {
  matches: SponsorMatch[];
  sponsor: SponsorProfile | null;
  summary: MatchSummaryStats;
  error: string | null;
}

/**
 * Evaluates all discoverable published campus opportunities against the authenticated sponsor's profile.
 */
export const getSponsorMatches = async (
  filters?: SponsorMatchFilters
): Promise<SponsorMatchResult> => {
  try {
    // 1. Get authenticated user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return {
        matches: [],
        sponsor: null,
        summary: { totalOpportunities: 0, excellentMatches: 0, strongMatches: 0, goodMatches: 0, topScore: 0 },
        error: 'User is not authenticated.',
      };
    }

    // 2. Load sponsor profile
    const { data: sponsor, error: profileError } = await getSponsorProfile(user.id);
    if (profileError) {
      return {
        matches: [],
        sponsor: null,
        summary: { totalOpportunities: 0, excellentMatches: 0, strongMatches: 0, goodMatches: 0, topScore: 0 },
        error: profileError,
      };
    }

    if (!sponsor) {
      return {
        matches: [],
        sponsor: null,
        summary: { totalOpportunities: 0, excellentMatches: 0, strongMatches: 0, goodMatches: 0, topScore: 0 },
        error: 'Sponsor profile not found. Please complete your sponsor profile to generate AI matches.',
      };
    }

    // 3. Load discoverable published events and active packages
    const { data: events, error: discoveryError } = await getDiscoverableOpportunities();
    if (discoveryError) {
      return {
        matches: [],
        sponsor,
        summary: { totalOpportunities: 0, excellentMatches: 0, strongMatches: 0, goodMatches: 0, topScore: 0 },
        error: discoveryError,
      };
    }

    if (!events || events.length === 0) {
      return {
        matches: [],
        sponsor,
        summary: { totalOpportunities: 0, excellentMatches: 0, strongMatches: 0, goodMatches: 0, topScore: 0 },
        error: null,
      };
    }

    // 4. Calculate matches across all published events and their active packages
    let matchPool: SponsorMatch[] = [];

    events.forEach((evt) => {
      const activePackages = evt.sponsorship_packages || [];

      if (activePackages.length === 0) {
        // If event has no packages yet, create a generic package placeholder for matching
        const placeholderPkg: DiscoverablePackage = {
          id: `placeholder-${evt.id}`,
          event_id: evt.id,
          package_name: 'General Campus Sponsorship Tier',
          description: evt.description || 'Open sponsorship tier',
          price: evt.event_budget || 0,
          benefits: 'Brand visibility, Campus banner, Mentorship opportunity',
          available_slots: 1,
          status: 'ACTIVE',
        };

        const scoreObj = calculateMatchScore(sponsor, evt, placeholderPkg);
        matchPool.push({
          sponsorId: user.id,
          eventId: evt.id,
          packageId: placeholderPkg.id,
          event: evt,
          package: placeholderPkg,
          sponsor,
          score: scoreObj.totalScore,
          quality: scoreObj.quality,
          factors: scoreObj.factors,
          reasons: scoreObj.reasons,
          strengths: scoreObj.strengths,
          weaknesses: scoreObj.weaknesses,
        });
      } else {
        activePackages.forEach((pkg) => {
          const scoreObj = calculateMatchScore(sponsor, evt, pkg);
          matchPool.push({
            sponsorId: user.id,
            eventId: evt.id,
            packageId: pkg.id,
            event: evt,
            package: pkg,
            sponsor,
            score: scoreObj.totalScore,
            quality: scoreObj.quality,
            factors: scoreObj.factors,
            reasons: scoreObj.reasons,
            strengths: scoreObj.strengths,
            weaknesses: scoreObj.weaknesses,
          });
        });
      }
    });

    // 5. Apply filters
    if (filters) {
      const { minScore, category, maxBudget, location, searchTerm } = filters;

      if (minScore !== undefined && minScore > 0) {
        matchPool = matchPool.filter((m) => m.score >= minScore);
      }

      if (category && category !== 'ALL') {
        matchPool = matchPool.filter((m) => m.event.category === category);
      }

      if (maxBudget !== undefined && maxBudget > 0) {
        matchPool = matchPool.filter((m) => m.package.price <= maxBudget);
      }

      if (location && location.trim()) {
        const lLower = location.toLowerCase().trim();
        matchPool = matchPool.filter((m) =>
          m.event.venue ? m.event.venue.toLowerCase().includes(lLower) : false
        );
      }

      if (searchTerm && searchTerm.trim()) {
        const sLower = searchTerm.toLowerCase().trim();
        matchPool = matchPool.filter(
          (m) =>
            m.event.event_name.toLowerCase().includes(sLower) ||
            m.package.package_name.toLowerCase().includes(sLower) ||
            m.event.category.toLowerCase().includes(sLower)
        );
      }
    }

    // 6. Sort matches
    const sortBy = filters?.sortBy || 'score';
    matchPool.sort((a, b) => {
      switch (sortBy) {
        case 'price':
          return a.package.price - b.package.price;
        case 'reach':
          return (b.event.expected_attendees || 0) - (a.event.expected_attendees || 0);
        case 'date':
          return new Date(a.event.event_date).getTime() - new Date(b.event.event_date).getTime();
        case 'score':
        default:
          return b.score - a.score;
      }
    });

    // 7. Calculate summary stats
    const totalOpportunities = matchPool.length;
    const excellentMatches = matchPool.filter((m) => m.score >= 90).length;
    const strongMatches = matchPool.filter((m) => m.score >= 75 && m.score < 90).length;
    const goodMatches = matchPool.filter((m) => m.score >= 60 && m.score < 75).length;
    const topScore = matchPool.length > 0 ? Math.max(...matchPool.map((m) => m.score)) : 0;

    return {
      matches: matchPool,
      sponsor,
      summary: {
        totalOpportunities,
        excellentMatches,
        strongMatches,
        goodMatches,
        topScore,
      },
      error: null,
    };
  } catch (err) {
    return {
      matches: [],
      sponsor: null,
      summary: { totalOpportunities: 0, excellentMatches: 0, strongMatches: 0, goodMatches: 0, topScore: 0 },
      error: err instanceof Error ? err.message : 'An error occurred while calculating matches.',
    };
  }
};

/**
 * Retrieves a single opportunity match for a given sponsor, event, and package.
 */
export const getMatchForOpportunity = (
  sponsor: SponsorProfile,
  event: DiscoverableEvent,
  pkg: DiscoverablePackage
): SponsorMatch => {
  const scoreObj = calculateMatchScore(sponsor, event, pkg);
  return {
    sponsorId: sponsor.user_id,
    eventId: event.id,
    packageId: pkg.id,
    event,
    package: pkg,
    sponsor,
    score: scoreObj.totalScore,
    quality: scoreObj.quality,
    factors: scoreObj.factors,
    reasons: scoreObj.reasons,
    strengths: scoreObj.strengths,
    weaknesses: scoreObj.weaknesses,
  };
};
