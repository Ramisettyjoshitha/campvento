/**
 * CAMPVENTO — Step 5: Sponsor Discovery Service
 * frontend/src/lib/sponsorDiscovery.ts
 *
 * Query service for sponsors to safely discover published campus events
 * and active sponsorship packages.
 * Strictly exposes ONLY public event & package metadata.
 * Organizer private contact and internal data are NEVER queried or exposed.
 */

import { supabase } from './supabase';

export interface DiscoverablePackage {
  id: string;
  event_id: string;
  package_name: string;
  description: string | null;
  price: number;
  benefits: string | null;
  available_slots: number;
  status: 'ACTIVE';
}

export interface DiscoverableEvent {
  id: string;
  event_name: string;
  description: string | null;
  category: string;
  event_date: string;
  start_time: string | null;
  end_time: string | null;
  venue: string | null;
  expected_attendees: number | null;
  target_audience: string | null;
  event_budget: number | null;
  status: 'PUBLISHED';
  created_at: string;
  sponsorship_packages?: DiscoverablePackage[];
}

export interface DiscoveryFilters {
  category?: string;
  date?: string;
  venue?: string;
  minBudget?: number;
  maxBudget?: number;
  searchTerm?: string;
}

export type DiscoveryResult<T> = { data: T | null; error: string | null };

/**
 * Fetches published events and their active sponsorship packages.
 * Applies safe non-AI database & clientside filtering.
 */
export const getDiscoverableOpportunities = async (
  filters?: DiscoveryFilters
): Promise<DiscoveryResult<DiscoverableEvent[]>> => {
  try {
    // 1. Build base query selecting only public event fields and related active packages
    let query = supabase
      .from('events')
      .select(
        `
        id,
        event_name,
        description,
        category,
        event_date,
        start_time,
        end_time,
        venue,
        expected_attendees,
        target_audience,
        event_budget,
        status,
        created_at,
        sponsorship_packages (
          id,
          event_id,
          package_name,
          description,
          price,
          benefits,
          available_slots,
          status
        )
      `
      )
      .eq('status', 'PUBLISHED')
      .order('event_date', { ascending: true });

    // Category filter
    if (filters?.category && filters.category !== 'ALL') {
      query = query.eq('category', filters.category);
    }

    // Specific Date filter (or on/after date)
    if (filters?.date) {
      query = query.gte('event_date', filters.date);
    }

    const { data, error } = await query;

    if (error) {
      return { data: null, error: error.message };
    }

    if (!data) {
      return { data: [], error: null };
    }

    // 2. Process results: Filter packages to ensure only ACTIVE status are included
    let results: DiscoverableEvent[] = (data as unknown as DiscoverableEvent[]).map((evt) => {
      const activePackages = (evt.sponsorship_packages || []).filter(
        (pkg) => pkg.status === 'ACTIVE'
      );
      return {
        ...evt,
        sponsorship_packages: activePackages,
      };
    });

    // 3. Apply additional non-AI filters (Venue search, Budget bounds, Search terms)
    if (filters) {
      const { venue, minBudget, maxBudget, searchTerm } = filters;

      if (venue && venue.trim()) {
        const vLower = venue.trim().toLowerCase();
        results = results.filter((evt) =>
          evt.venue ? evt.venue.toLowerCase().includes(vLower) : false
        );
      }

      if (searchTerm && searchTerm.trim()) {
        const sLower = searchTerm.trim().toLowerCase();
        results = results.filter(
          (evt) =>
            evt.event_name.toLowerCase().includes(sLower) ||
            (evt.description && evt.description.toLowerCase().includes(sLower)) ||
            evt.category.toLowerCase().includes(sLower) ||
            (evt.venue && evt.venue.toLowerCase().includes(sLower)) ||
            (evt.target_audience && evt.target_audience.toLowerCase().includes(sLower))
        );
      }

      // Budget filter: matches if either the event budget or any active package price is within range
      if (minBudget !== undefined && minBudget > 0) {
        results = results.filter((evt) => {
          const hasMatchingPackage = evt.sponsorship_packages?.some(
            (pkg) => pkg.price >= minBudget
          );
          const hasMatchingEventBudget =
            evt.event_budget !== null && evt.event_budget >= minBudget;
          return hasMatchingPackage || hasMatchingEventBudget;
        });
      }

      if (maxBudget !== undefined && maxBudget > 0) {
        results = results.filter((evt) => {
          const hasMatchingPackage = evt.sponsorship_packages?.some(
            (pkg) => pkg.price <= maxBudget
          );
          const hasMatchingEventBudget =
            evt.event_budget !== null && evt.event_budget <= maxBudget;
          return hasMatchingPackage || hasMatchingEventBudget;
        });
      }
    }

    return { data: results, error: null };
  } catch (err) {
    return {
      data: null,
      error:
        err instanceof Error
          ? err.message
          : 'Failed to load sponsorship opportunities.',
    };
  }
};
