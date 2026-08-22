/**
 * CAMPVENTO — STEP 9: Sponsorship ROI & Impact Analytics Service
 * frontend/src/lib/analytics.ts
 *
 * Security & Design Principles:
 *   - Strictly uses authenticated Supabase session (`supabase.auth.getUser()`).
 *   - Never trusts arbitrary user IDs from the frontend.
 *   - Aggregates ONLY existing database records (events, packages, requests, commitments).
 *   - Respects existing Row Level Security (RLS).
 *   - Does NOT invent fake metrics (impressions, clicks, conversions, marketing ROI).
 *   - "Committed Sponsorship Value" = SUM(agreed_amount) of visible commitments.
 */

import { supabase } from './supabase';

export interface RequestAnalytics {
  total: number;
  pending: number;
  accepted: number;
  rejected: number;
  cancelled: number;
}

export interface CommitmentAnalytics {
  total: number;
  active: number;
  completed: number;
  cancelled: number;
  totalCommittedValue: number;
}

export interface SponsorshipValueSummary {
  totalCommittedValue: number;
  activeCommitmentsCount: number;
  completedCommitmentsCount: number;
  cancelledCommitmentsCount: number;
}

export interface EventAnalyticsItem {
  id: string;
  event_name: string;
  category: string;
  status: string;
  event_date: string;
  venue: string | null;
  expected_attendees: number | null;
  totalPackages: number;
  activePackages: number;
  totalRequests: number;
  pendingRequests: number;
  acceptedRequests: number;
  rejectedRequests: number;
  activeCommitments: number;
  completedCommitments: number;
  cancelledCommitments: number;
  committedValue: number;
}

export interface OrganizerAnalytics {
  totalEvents: number;
  publishedEvents: number;
  completedEvents: number;
  draftEvents: number;
  totalPackages: number;
  activePackages: number;
  requests: RequestAnalytics;
  commitments: CommitmentAnalytics;
  committedSponsorshipValue: number;
  eventsPerformance: EventAnalyticsItem[];
  pipeline: {
    packages: number;
    requests: number;
    acceptedRequests: number;
    commitments: number;
  };
}

export interface SponsorCategoryAnalyticsItem {
  category: string;
  commitmentsCount: number;
  committedValue: number;
  eventsCount: number;
}

export interface SponsorCommitmentHistoryItem {
  id: string;
  eventName: string;
  category: string;
  packageName: string;
  agreedAmount: number;
  status: string;
  startDate: string | null;
  endDate: string | null;
  createdAt: string;
}

export interface SponsorAnalytics {
  requests: RequestAnalytics;
  commitments: CommitmentAnalytics;
  committedSponsorshipValue: number;
  eventsSponsored: number;
  history: SponsorCommitmentHistoryItem[];
  categoryDistribution: SponsorCategoryAnalyticsItem[];
}

export interface EventAnalytics {
  event: {
    id: string;
    event_name: string;
    category: string;
    event_date: string;
    venue: string | null;
    expected_attendees: number | null;
    status: string;
  };
  totalPackages: number;
  activePackages: number;
  requests: RequestAnalytics;
  commitments: CommitmentAnalytics;
  committedSponsorshipValue: number;
  pipeline: {
    packages: number;
    requests: number;
    acceptedRequests: number;
    commitments: number;
  };
}

export type AnalyticsResult<T> = { data: T | null; error: string | null };

/**
 * Helper to compute RequestAnalytics from an array of requests
 */
function aggregateRequests(requests: { status: string }[]): RequestAnalytics {
  return {
    total: requests.length,
    pending: requests.filter((r) => r.status === 'PENDING').length,
    accepted: requests.filter((r) => r.status === 'ACCEPTED').length,
    rejected: requests.filter((r) => r.status === 'REJECTED').length,
    cancelled: requests.filter((r) => r.status === 'CANCELLED').length,
  };
}

/**
 * Helper to compute CommitmentAnalytics from an array of commitments
 */
function aggregateCommitments(commitments: { status: string; agreed_amount: number | string }[]): CommitmentAnalytics {
  const active = commitments.filter((c) => c.status === 'ACTIVE');
  const completed = commitments.filter((c) => c.status === 'COMPLETED');
  const cancelled = commitments.filter((c) => c.status === 'CANCELLED');
  const totalCommittedValue = commitments
    .filter((c) => c.status !== 'CANCELLED')
    .reduce((sum, c) => sum + (Number(c.agreed_amount) || 0), 0);

  return {
    total: commitments.length,
    active: active.length,
    completed: completed.length,
    cancelled: cancelled.length,
    totalCommittedValue,
  };
}

/**
 * Fetches full analytics for the authenticated organizer across all their events, packages, requests, and commitments.
 */
export async function getOrganizerAnalytics(): Promise<AnalyticsResult<OrganizerAnalytics>> {
  try {
    const { data: { user }, error: authErr } = await supabase.auth.getUser();
    if (authErr || !user) {
      return { data: null, error: 'User is not authenticated.' };
    }

    // 1. Fetch organizer's events
    const { data: events, error: eventsErr } = await supabase
      .from('events')
      .select('id, event_name, category, status, event_date, venue, expected_attendees')
      .eq('organizer_id', user.id)
      .order('created_at', { ascending: false });

    if (eventsErr) return { data: null, error: eventsErr.message };

    const eventList = events || [];
    const eventIds = eventList.map((e) => e.id);

    // 2. Fetch packages for organizer's events
    let packageList: { id: string; event_id: string; status: string }[] = [];
    if (eventIds.length > 0) {
      const { data: packages, error: pkgErr } = await supabase
        .from('sponsorship_packages')
        .select('id, event_id, status')
        .in('event_id', eventIds);

      if (pkgErr) return { data: null, error: pkgErr.message };
      packageList = packages || [];
    }

    // 3. Fetch requests for organizer's events
    const { data: requests, error: reqErr } = await supabase
      .from('sponsorship_requests')
      .select('id, event_id, package_id, status')
      .eq('organizer_id', user.id);

    if (reqErr) return { data: null, error: reqErr.message };
    const requestList = requests || [];

    // 4. Fetch commitments for organizer
    const { data: commitments, error: commitErr } = await supabase
      .from('sponsorship_commitments')
      .select('id, event_id, package_id, status, agreed_amount')
      .eq('organizer_id', user.id);

    if (commitErr) return { data: null, error: commitErr.message };
    const commitmentList = commitments || [];

    // Calculate aggregated metrics
    const totalEvents = eventList.length;
    const publishedEvents = eventList.filter((e) => e.status === 'PUBLISHED').length;
    const completedEvents = eventList.filter((e) => e.status === 'COMPLETED').length;
    const draftEvents = eventList.filter((e) => e.status === 'DRAFT').length;

    const totalPackages = packageList.length;
    const activePackages = packageList.filter((p) => p.status === 'ACTIVE').length;

    const reqStats = aggregateRequests(requestList);
    const commitStats = aggregateCommitments(commitmentList);

    // Per-event performance breakdown
    const eventsPerformance: EventAnalyticsItem[] = eventList.map((ev) => {
      const evPkgs = packageList.filter((p) => p.event_id === ev.id);
      const evReqs = requestList.filter((r) => r.event_id === ev.id);
      const evCommits = commitmentList.filter((c) => c.event_id === ev.id);

      const evActiveCommits = evCommits.filter((c) => c.status === 'ACTIVE').length;
      const evCompCommits = evCommits.filter((c) => c.status === 'COMPLETED').length;
      const evCancCommits = evCommits.filter((c) => c.status === 'CANCELLED').length;
      const evValue = evCommits
        .filter((c) => c.status !== 'CANCELLED')
        .reduce((sum, c) => sum + (Number(c.agreed_amount) || 0), 0);

      return {
        id: ev.id,
        event_name: ev.event_name,
        category: ev.category,
        status: ev.status,
        event_date: ev.event_date,
        venue: ev.venue,
        expected_attendees: ev.expected_attendees,
        totalPackages: evPkgs.length,
        activePackages: evPkgs.filter((p) => p.status === 'ACTIVE').length,
        totalRequests: evReqs.length,
        pendingRequests: evReqs.filter((r) => r.status === 'PENDING').length,
        acceptedRequests: evReqs.filter((r) => r.status === 'ACCEPTED').length,
        rejectedRequests: evReqs.filter((r) => r.status === 'REJECTED').length,
        activeCommitments: evActiveCommits,
        completedCommitments: evCompCommits,
        cancelledCommitments: evCancCommits,
        committedValue: evValue,
      };
    });

    return {
      data: {
        totalEvents,
        publishedEvents,
        completedEvents,
        draftEvents,
        totalPackages,
        activePackages,
        requests: reqStats,
        commitments: commitStats,
        committedSponsorshipValue: commitStats.totalCommittedValue,
        eventsPerformance,
        pipeline: {
          packages: totalPackages,
          requests: reqStats.total,
          acceptedRequests: reqStats.accepted,
          commitments: commitStats.total,
        },
      },
      error: null,
    };
  } catch (err) {
    return { data: null, error: err instanceof Error ? err.message : 'Failed to load organizer analytics.' };
  }
}

/**
 * Fetches analytics for a specific event owned by the authenticated organizer.
 */
export async function getEventAnalytics(eventId: string): Promise<AnalyticsResult<EventAnalytics>> {
  try {
    const { data: { user }, error: authErr } = await supabase.auth.getUser();
    if (authErr || !user) {
      return { data: null, error: 'User is not authenticated.' };
    }

    // 1. Fetch event (RLS + organizer_id check)
    const { data: event, error: eventErr } = await supabase
      .from('events')
      .select('id, event_name, category, event_date, venue, expected_attendees, status')
      .eq('id', eventId)
      .eq('organizer_id', user.id)
      .single();

    if (eventErr || !event) {
      return { data: null, error: 'Event not found or you do not have permission to view its analytics.' };
    }

    // 2. Fetch packages for this event
    const { data: packages, error: pkgErr } = await supabase
      .from('sponsorship_packages')
      .select('id, status')
      .eq('event_id', eventId);

    if (pkgErr) return { data: null, error: pkgErr.message };
    const pkgList = packages || [];

    // 3. Fetch requests for this event
    const { data: requests, error: reqErr } = await supabase
      .from('sponsorship_requests')
      .select('id, status')
      .eq('event_id', eventId)
      .eq('organizer_id', user.id);

    if (reqErr) return { data: null, error: reqErr.message };
    const reqList = requests || [];

    // 4. Fetch commitments for this event
    const { data: commitments, error: commitErr } = await supabase
      .from('sponsorship_commitments')
      .select('id, status, agreed_amount')
      .eq('event_id', eventId)
      .eq('organizer_id', user.id);

    if (commitErr) return { data: null, error: commitErr.message };
    const commitList = commitments || [];

    const reqStats = aggregateRequests(reqList);
    const commitStats = aggregateCommitments(commitList);

    return {
      data: {
        event,
        totalPackages: pkgList.length,
        activePackages: pkgList.filter((p) => p.status === 'ACTIVE').length,
        requests: reqStats,
        commitments: commitStats,
        committedSponsorshipValue: commitStats.totalCommittedValue,
        pipeline: {
          packages: pkgList.length,
          requests: reqStats.total,
          acceptedRequests: reqStats.accepted,
          commitments: commitStats.total,
        },
      },
      error: null,
    };
  } catch (err) {
    return { data: null, error: err instanceof Error ? err.message : 'Failed to load event analytics.' };
  }
}

/**
 * Fetches event performance list for the authenticated organizer.
 */
export async function getOrganizerEventAnalytics(): Promise<AnalyticsResult<EventAnalyticsItem[]>> {
  const res = await getOrganizerAnalytics();
  if (res.error || !res.data) return { data: null, error: res.error };
  return { data: res.data.eventsPerformance, error: null };
}

/**
 * Fetches full analytics for the authenticated sponsor.
 */
export async function getSponsorAnalytics(): Promise<AnalyticsResult<SponsorAnalytics>> {
  try {
    const { data: { user }, error: authErr } = await supabase.auth.getUser();
    if (authErr || !user) {
      return { data: null, error: 'User is not authenticated.' };
    }

    // 1. Fetch sponsor requests
    const { data: requests, error: reqErr } = await supabase
      .from('sponsorship_requests')
      .select('id, status')
      .eq('sponsor_id', user.id);

    if (reqErr) return { data: null, error: reqErr.message };
    const reqList = requests || [];

    // 2. Fetch sponsor commitments with event and package details
    const { data: commitments, error: commitErr } = await supabase
      .from('sponsorship_commitments')
      .select(`
        id,
        event_id,
        agreed_amount,
        commitment_start_date,
        commitment_end_date,
        status,
        created_at,
        events (
          id,
          event_name,
          category
        ),
        sponsorship_packages (
          id,
          package_name
        )
      `)
      .eq('sponsor_id', user.id)
      .order('created_at', { ascending: false });

    if (commitErr) return { data: null, error: commitErr.message };
    const commitList = commitments || [];

    const reqStats = aggregateRequests(reqList);
    const commitStats = aggregateCommitments(commitList);

    // Track unique events sponsored (commitments)
    const uniqueEventIds = new Set<string>();
    const categoryMap: Record<string, { count: number; value: number; eventIds: Set<string> }> = {};

    const history: SponsorCommitmentHistoryItem[] = commitList.map((c: any) => {
      const eventName = c.events?.event_name || 'Campus Event';
      const category = c.events?.category || 'General';
      const packageName = c.sponsorship_packages?.package_name || 'Sponsorship Package';
      const amount = Number(c.agreed_amount) || 0;

      if (c.event_id) {
        uniqueEventIds.add(c.event_id);
      }

      // Aggregate category distribution for commitments
      if (!categoryMap[category]) {
        categoryMap[category] = { count: 0, value: 0, eventIds: new Set<string>() };
      }
      categoryMap[category].count += 1;
      if (c.status !== 'CANCELLED') {
        categoryMap[category].value += amount;
      }
      if (c.event_id) {
        categoryMap[category].eventIds.add(c.event_id);
      }

      return {
        id: c.id,
        eventName,
        category,
        packageName,
        agreedAmount: amount,
        status: c.status,
        startDate: c.commitment_start_date,
        endDate: c.commitment_end_date,
        createdAt: c.created_at,
      };
    });

    const categoryDistribution: SponsorCategoryAnalyticsItem[] = Object.entries(categoryMap).map(
      ([cat, data]) => ({
        category: cat,
        commitmentsCount: data.count,
        committedValue: data.value,
        eventsCount: data.eventIds.size,
      })
    );

    return {
      data: {
        requests: reqStats,
        commitments: commitStats,
        committedSponsorshipValue: commitStats.totalCommittedValue,
        eventsSponsored: uniqueEventIds.size,
        history,
        categoryDistribution,
      },
      error: null,
    };
  } catch (err) {
    return { data: null, error: err instanceof Error ? err.message : 'Failed to load sponsor analytics.' };
  }
}

/**
 * Fetches category distribution for the authenticated sponsor.
 */
export async function getSponsorCategoryAnalytics(): Promise<AnalyticsResult<SponsorCategoryAnalyticsItem[]>> {
  const res = await getSponsorAnalytics();
  if (res.error || !res.data) return { data: null, error: res.error };
  return { data: res.data.categoryDistribution, error: null };
}
