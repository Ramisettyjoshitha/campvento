/**
 * CAMPVENTO — Step 7: Sponsorship Interest & Request Flow Service
 * frontend/src/lib/sponsorshipRequests.ts
 *
 * Supabase client operations for public.sponsorship_requests table.
 * All operations enforce authenticated user session context.
 * Never uses service-role keys or trusts unauthenticated user IDs.
 */

import { supabase } from './supabase';

export type SponsorshipRequestStatus = 'PENDING' | 'ACCEPTED' | 'REJECTED' | 'CANCELLED';

export interface SponsorshipRequest {
  id: string;
  sponsor_id: string;
  organizer_id: string;
  event_id: string;
  package_id: string;
  message: string | null;
  status: SponsorshipRequestStatus;
  created_at: string;
  updated_at: string;
  // Joined relational data
  events?: {
    id: string;
    event_name: string;
    category: string;
    event_date: string;
    venue: string | null;
    status: string;
  } | null;
  sponsorship_packages?: {
    id: string;
    package_name: string;
    price: number;
    available_slots: number;
    benefits: string | null;
    status: string;
  } | null;
  sponsor_company_name?: string | null;
}

export interface CreateSponsorshipRequestInput {
  package_id: string;
  message?: string;
}

export interface RequestSummaryStats {
  total: number;
  pending: number;
  accepted: number;
  rejected: number;
  cancelled: number;
}

export type ServiceResult<T> = { data: T | null; error: string | null };

/**
 * Checks if the current authenticated sponsor already has an active PENDING request for a given package.
 */
export const checkExistingPendingRequest = async (
  packageId: string
): Promise<{ hasPending: boolean; requestId?: string; error: string | null }> => {
  try {
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return { hasPending: false, error: 'User is not authenticated.' };
    }

    const { data, error } = await supabase
      .from('sponsorship_requests')
      .select('id, status')
      .eq('sponsor_id', user.id)
      .eq('package_id', packageId)
      .eq('status', 'PENDING')
      .maybeSingle();

    if (error) {
      return { hasPending: false, error: error.message };
    }

    return { hasPending: Boolean(data), requestId: data?.id, error: null };
  } catch (err) {
    return {
      hasPending: false,
      error: err instanceof Error ? err.message : 'Failed to verify request status.',
    };
  }
};

/**
 * Creates a new sponsorship request expressing interest in an active package.
 * Automatically derives sponsor_id and organizer_id from database records & auth session.
 */
export const createSponsorshipRequest = async (
  input: CreateSponsorshipRequestInput
): Promise<ServiceResult<SponsorshipRequest>> => {
  try {
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return { data: null, error: 'User is not authenticated.' };
    }

    // 1. Fetch package details to securely retrieve organizer_id and event_id
    const { data: pkg, error: pkgError } = await supabase
      .from('sponsorship_packages')
      .select('id, event_id, organizer_id, status')
      .eq('id', input.package_id)
      .single();

    if (pkgError || !pkg) {
      return { data: null, error: 'Sponsorship package not found or inaccessible.' };
    }

    if (pkg.status !== 'ACTIVE') {
      return { data: null, error: 'This sponsorship package is no longer active.' };
    }

    // 2. Fetch event to confirm it is published and not owned by the sponsor
    const { data: evt, error: evtError } = await supabase
      .from('events')
      .select('id, organizer_id, status')
      .eq('id', pkg.event_id)
      .single();

    if (evtError || !evt) {
      return { data: null, error: 'Associated event not found.' };
    }

    if (evt.status !== 'PUBLISHED') {
      return { data: null, error: 'Requests can only be submitted for published events.' };
    }

    if (evt.organizer_id === user.id) {
      return { data: null, error: 'You cannot submit a sponsorship request for your own event.' };
    }

    // 3. Check for existing pending request
    const { hasPending } = await checkExistingPendingRequest(input.package_id);
    if (hasPending) {
      return {
        data: null,
        error: 'You already have a pending request for this sponsorship package.',
      };
    }

    // 4. Insert request record
    const payload = {
      sponsor_id: user.id,
      organizer_id: evt.organizer_id,
      event_id: pkg.event_id,
      package_id: pkg.id,
      message: input.message?.trim() || null,
      status: 'PENDING',
    };

    const { data, error } = await supabase
      .from('sponsorship_requests')
      .insert([payload])
      .select()
      .single();

    if (error) {
      // Catch duplicate constraint violation gracefully
      if (error.code === '23505') {
        return {
          data: null,
          error: 'You already have a pending request for this sponsorship package.',
        };
      }
      return { data: null, error: error.message };
    }

    return { data: data as SponsorshipRequest, error: null };
  } catch (err) {
    return {
      data: null,
      error: err instanceof Error ? err.message : 'Failed to submit sponsorship request.',
    };
  }
};

/**
 * Retrieves all sponsorship requests created by the authenticated sponsor.
 */
export const getMySponsorRequests = async (): Promise<ServiceResult<SponsorshipRequest[]>> => {
  try {
    const { data, error } = await supabase
      .from('sponsorship_requests')
      .select(
        `
        id,
        sponsor_id,
        organizer_id,
        event_id,
        package_id,
        message,
        status,
        created_at,
        updated_at,
        events (
          id,
          event_name,
          category,
          event_date,
          venue,
          status
        ),
        sponsorship_packages (
          id,
          package_name,
          price,
          available_slots,
          benefits,
          status
        )
      `
      )
      .order('created_at', { ascending: false });

    if (error) {
      return { data: null, error: error.message };
    }

    return { data: (data as unknown as SponsorshipRequest[]) || [], error: null };
  } catch (err) {
    return {
      data: null,
      error: err instanceof Error ? err.message : 'Failed to fetch sponsor requests.',
    };
  }
};

/**
 * Retrieves all incoming sponsorship requests received for events owned by the authenticated organizer.
 */
export const getOrganizerRequests = async (): Promise<ServiceResult<SponsorshipRequest[]>> => {
  try {
    const { data, error } = await supabase
      .from('sponsorship_requests')
      .select(
        `
        id,
        sponsor_id,
        organizer_id,
        event_id,
        package_id,
        message,
        status,
        created_at,
        updated_at,
        events (
          id,
          event_name,
          category,
          event_date,
          venue,
          status
        ),
        sponsorship_packages (
          id,
          package_name,
          price,
          available_slots,
          benefits,
          status
        )
      `
      )
      .order('created_at', { ascending: false });

    if (error) {
      return { data: null, error: error.message };
    }

    return { data: (data as unknown as SponsorshipRequest[]) || [], error: null };
  } catch (err) {
    return {
      data: null,
      error: err instanceof Error ? err.message : 'Failed to fetch incoming requests.',
    };
  }
};

/**
 * Sponsor action: Cancels a PENDING request.
 */
export const cancelSponsorshipRequest = async (
  requestId: string
): Promise<ServiceResult<SponsorshipRequest>> => {
  try {
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return { data: null, error: 'User is not authenticated.' };
    }

    const { data, error } = await supabase
      .from('sponsorship_requests')
      .update({
        status: 'CANCELLED',
        updated_at: new Date().toISOString(),
      })
      .eq('id', requestId)
      .eq('sponsor_id', user.id)
      .eq('status', 'PENDING')
      .select()
      .single();

    if (error) {
      return { data: null, error: error.message };
    }

    return { data: data as SponsorshipRequest, error: null };
  } catch (err) {
    return {
      data: null,
      error: err instanceof Error ? err.message : 'Failed to cancel sponsorship request.',
    };
  }
};

/**
 * Organizer action: Accepts or rejects a PENDING request for their event.
 */
export const updateRequestStatus = async (
  requestId: string,
  targetStatus: 'ACCEPTED' | 'REJECTED'
): Promise<ServiceResult<SponsorshipRequest>> => {
  try {
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return { data: null, error: 'User is not authenticated.' };
    }

    const { data, error } = await supabase
      .from('sponsorship_requests')
      .update({
        status: targetStatus,
        updated_at: new Date().toISOString(),
      })
      .eq('id', requestId)
      .eq('organizer_id', user.id)
      .eq('status', 'PENDING')
      .select()
      .single();

    if (error) {
      return { data: null, error: error.message };
    }

    return { data: data as SponsorshipRequest, error: null };
  } catch (err) {
    return {
      data: null,
      error: err instanceof Error ? err.message : `Failed to ${targetStatus.toLowerCase()} request.`,
    };
  }
};

/**
 * Computes summary count statistics for a list of requests.
 */
export const calculateRequestSummary = (
  requests: SponsorshipRequest[]
): RequestSummaryStats => {
  return {
    total: requests.length,
    pending: requests.filter((r) => r.status === 'PENDING').length,
    accepted: requests.filter((r) => r.status === 'ACCEPTED').length,
    rejected: requests.filter((r) => r.status === 'REJECTED').length,
    cancelled: requests.filter((r) => r.status === 'CANCELLED').length,
  };
};
