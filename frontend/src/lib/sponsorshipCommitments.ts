/**
 * CAMPVENTO — Step 8: Sponsorship Commitment Management Service
 * frontend/src/lib/sponsorshipCommitments.ts
 *
 * Security model:
 *   - Never trusts UI-supplied sponsor_id / organizer_id / event_id / package_id.
 *   - Ownership IDs resolved from authenticated session + DB query.
 *   - Sponsors are read-only; organizers create/update.
 *   - No service-role key.
 */

import { supabase } from './supabase';

export type SponsorshipCommitmentStatus = 'ACTIVE' | 'COMPLETED' | 'CANCELLED';

export interface SponsorshipCommitment {
  id: string;
  request_id: string;
  sponsor_id: string;
  organizer_id: string;
  event_id: string;
  package_id: string;
  agreed_amount: number;
  commitment_start_date: string | null;
  commitment_end_date: string | null;
  notes: string | null;
  status: SponsorshipCommitmentStatus;
  created_at: string;
  updated_at: string;
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
    benefits: string | null;
    status: string;
  } | null;
  sponsorship_requests?: {
    id: string;
    message: string | null;
    status: string;
  } | null;
}

export interface CreateCommitmentInput {
  agreed_amount: number;
  commitment_start_date?: string | null;
  commitment_end_date?: string | null;
  notes?: string | null;
}

export interface UpdateCommitmentInput {
  agreed_amount?: number;
  commitment_start_date?: string | null;
  commitment_end_date?: string | null;
  notes?: string | null;
}

export type CommitmentServiceResult<T> = { data: T | null; error: string | null };

export interface CommitmentSummaryStats {
  total: number;
  active: number;
  completed: number;
  cancelled: number;
  totalValue: number;
}

const COMMITMENT_SELECT = `
  id,
  request_id,
  sponsor_id,
  organizer_id,
  event_id,
  package_id,
  agreed_amount,
  commitment_start_date,
  commitment_end_date,
  notes,
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
    benefits,
    status
  ),
  sponsorship_requests (
    id,
    message,
    status
  )
`;

/**
 * Check whether a commitment already exists for the given request_id.
 * RLS scopes result to the caller's own commitments (sponsor or organizer).
 */
export const checkExistingCommitment = async (
  requestId: string
): Promise<{ commitment: SponsorshipCommitment | null; error: string | null }> => {
  try {
    const { data, error } = await supabase
      .from('sponsorship_commitments')
      .select(COMMITMENT_SELECT)
      .eq('request_id', requestId)
      .maybeSingle();
    if (error) return { commitment: null, error: error.message };
    return { commitment: (data as unknown as SponsorshipCommitment) ?? null, error: null };
  } catch (err) {
    return { commitment: null, error: err instanceof Error ? err.message : 'Failed to check commitment.' };
  }
};

/**
 * ORGANIZER ONLY — Create a commitment from an ACCEPTED request.
 * Resolves sponsor_id, organizer_id, event_id, package_id from the DB
 * record; never accepts these from the UI.
 * The DB INSERT trigger is the final authoritative check.
 */
export const createCommitmentFromRequest = async (
  requestId: string,
  input: CreateCommitmentInput
): Promise<CommitmentServiceResult<SponsorshipCommitment>> => {
  try {
    const { data: { user }, error: userErr } = await supabase.auth.getUser();
    if (userErr || !user) return { data: null, error: 'User is not authenticated.' };

    // Load the request — RLS ensures organizer_id = auth.uid()
    const { data: req, error: reqErr } = await supabase
      .from('sponsorship_requests')
      .select('id, sponsor_id, organizer_id, event_id, package_id, status')
      .eq('id', requestId)
      .eq('organizer_id', user.id)
      .single();

    if (reqErr || !req) {
      return { data: null, error: 'Request not found or you are not authorized.' };
    }
    if (req.status !== 'ACCEPTED') {
      return { data: null, error: `Only ACCEPTED requests can become commitments. Status: ${req.status}.` };
    }
    if (input.agreed_amount < 0) {
      return { data: null, error: 'Agreed amount cannot be negative.' };
    }
    if (input.commitment_start_date && input.commitment_end_date &&
        input.commitment_start_date > input.commitment_end_date) {
      return { data: null, error: 'Start date must be on or before the end date.' };
    }

    // All IDs come from the verified DB record, not the UI
    const { data, error } = await supabase
      .from('sponsorship_commitments')
      .insert([{
        request_id:            req.id,
        sponsor_id:            req.sponsor_id,
        organizer_id:          req.organizer_id,
        event_id:              req.event_id,
        package_id:            req.package_id,
        agreed_amount:         input.agreed_amount,
        commitment_start_date: input.commitment_start_date ?? null,
        commitment_end_date:   input.commitment_end_date ?? null,
        notes:                 input.notes?.trim() || null,
        status:                'ACTIVE',
      }])
      .select(COMMITMENT_SELECT)
      .single();

    if (error) {
      if (error.code === '23505') {
        return { data: null, error: 'A commitment already exists for this request.' };
      }
      return { data: null, error: error.message };
    }
    return { data: data as unknown as SponsorshipCommitment, error: null };
  } catch (err) {
    return { data: null, error: err instanceof Error ? err.message : 'Failed to create commitment.' };
  }
};

/** SPONSOR — read their own commitments (RLS: sponsor_id = auth.uid()) */
export const getMySponsorCommitments = async (): Promise<CommitmentServiceResult<SponsorshipCommitment[]>> => {
  try {
    const { data, error } = await supabase
      .from('sponsorship_commitments')
      .select(COMMITMENT_SELECT)
      .order('created_at', { ascending: false });
    if (error) return { data: null, error: error.message };
    return { data: (data as unknown as SponsorshipCommitment[]) || [], error: null };
  } catch (err) {
    return { data: null, error: err instanceof Error ? err.message : 'Failed to load commitments.' };
  }
};

/** ORGANIZER — read their own commitments (RLS: organizer_id = auth.uid()) */
export const getOrganizerCommitments = async (): Promise<CommitmentServiceResult<SponsorshipCommitment[]>> => {
  try {
    const { data, error } = await supabase
      .from('sponsorship_commitments')
      .select(COMMITMENT_SELECT)
      .order('created_at', { ascending: false });
    if (error) return { data: null, error: error.message };
    return { data: (data as unknown as SponsorshipCommitment[]) || [], error: null };
  } catch (err) {
    return { data: null, error: err instanceof Error ? err.message : 'Failed to load commitments.' };
  }
};

/** Both roles — RLS restricts to sponsor_id or organizer_id = auth.uid() */
export const getCommitmentById = async (
  id: string
): Promise<CommitmentServiceResult<SponsorshipCommitment>> => {
  try {
    const { data, error } = await supabase
      .from('sponsorship_commitments')
      .select(COMMITMENT_SELECT)
      .eq('id', id)
      .single();
    if (error) return { data: null, error: error.message };
    return { data: data as unknown as SponsorshipCommitment, error: null };
  } catch (err) {
    return { data: null, error: err instanceof Error ? err.message : 'Failed to load commitment.' };
  }
};

/**
 * ORGANIZER ONLY — Update the 4 mutable fields only.
 * Ownership fields are never sent. DB trigger rejects any attempt to
 * modify immutable fields even via direct PostgREST.
 */
export const updateCommitment = async (
  id: string,
  input: UpdateCommitmentInput
): Promise<CommitmentServiceResult<SponsorshipCommitment>> => {
  try {
    const { data: { user }, error: userErr } = await supabase.auth.getUser();
    if (userErr || !user) return { data: null, error: 'User is not authenticated.' };

    if (input.agreed_amount !== undefined && input.agreed_amount < 0) {
      return { data: null, error: 'Agreed amount cannot be negative.' };
    }
    if (input.commitment_start_date && input.commitment_end_date &&
        input.commitment_start_date > input.commitment_end_date) {
      return { data: null, error: 'Start date must be on or before the end date.' };
    }

    // Build patch with only allowed mutable fields
    const patch: Record<string, unknown> = {};
    if (input.agreed_amount !== undefined) patch.agreed_amount = input.agreed_amount;
    if ('commitment_start_date' in input) patch.commitment_start_date = input.commitment_start_date ?? null;
    if ('commitment_end_date' in input) patch.commitment_end_date = input.commitment_end_date ?? null;
    if ('notes' in input) patch.notes = input.notes?.trim() || null;

    const { data, error } = await supabase
      .from('sponsorship_commitments')
      .update(patch)
      .eq('id', id)
      .eq('organizer_id', user.id)
      .select(COMMITMENT_SELECT)
      .single();

    if (error) return { data: null, error: error.message };
    return { data: data as unknown as SponsorshipCommitment, error: null };
  } catch (err) {
    return { data: null, error: err instanceof Error ? err.message : 'Failed to update commitment.' };
  }
};

/**
 * ORGANIZER ONLY — Transition status.
 * ACTIVE -> COMPLETED | CANCELLED (DB trigger enforces this server-side).
 */
export const updateCommitmentStatus = async (
  id: string,
  newStatus: 'COMPLETED' | 'CANCELLED'
): Promise<CommitmentServiceResult<SponsorshipCommitment>> => {
  try {
    const { data: { user }, error: userErr } = await supabase.auth.getUser();
    if (userErr || !user) return { data: null, error: 'User is not authenticated.' };

    const { data, error } = await supabase
      .from('sponsorship_commitments')
      .update({ status: newStatus })
      .eq('id', id)
      .eq('organizer_id', user.id)
      .eq('status', 'ACTIVE')
      .select(COMMITMENT_SELECT)
      .single();

    if (error) return { data: null, error: error.message };
    return { data: data as unknown as SponsorshipCommitment, error: null };
  } catch (err) {
    return { data: null, error: err instanceof Error ? err.message : `Failed to ${newStatus.toLowerCase()} commitment.` };
  }
};

/** Compute summary statistics from a list of commitments */
export const calculateCommitmentSummary = (
  commitments: SponsorshipCommitment[]
): CommitmentSummaryStats => ({
  total:      commitments.length,
  active:     commitments.filter((c) => c.status === 'ACTIVE').length,
  completed:  commitments.filter((c) => c.status === 'COMPLETED').length,
  cancelled:  commitments.filter((c) => c.status === 'CANCELLED').length,
  totalValue: commitments
    .filter((c) => c.status !== 'CANCELLED')
    .reduce((sum, c) => sum + (Number(c.agreed_amount) || 0), 0),
});

