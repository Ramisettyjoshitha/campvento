/**
 * CAMPVENTO — Step 5: Sponsor Profile Service
 * frontend/src/lib/sponsorProfile.ts
 *
 * Supabase client operations for public.sponsor_profiles table.
 * All operations enforce authenticated user session context.
 * Never uses service-role keys or trusts unauthenticated user_id payloads.
 */

import { supabase } from './supabase';

export type SponsorVerificationStatus = 'PENDING' | 'VERIFIED' | 'REJECTED';

export interface SponsorProfile {
  id?: string;
  user_id: string;
  company_name: string;
  contact_person: string;
  industry: string | null;
  company_description: string | null;
  website: string | null;
  contact_email: string | null;
  contact_phone: string | null;
  company_size: string | null;
  sponsorship_budget_min: number;
  sponsorship_budget_max: number;
  preferred_categories: string | null;
  preferred_audience: string | null;
  preferred_locations: string | null;
  verification_status: SponsorVerificationStatus;
  created_at?: string;
  updated_at?: string;
}

export interface SponsorProfileInput {
  company_name: string;
  contact_person: string;
  industry?: string;
  company_description?: string;
  website?: string;
  contact_email?: string;
  contact_phone?: string;
  company_size?: string;
  sponsorship_budget_min?: number;
  sponsorship_budget_max?: number;
  preferred_categories?: string;
  preferred_audience?: string;
  preferred_locations?: string;
}

export type SponsorProfileResult<T> = { data: T | null; error: string | null };

/**
 * Retrieves the sponsor profile for the specified user from Supabase.
 */
export const getSponsorProfile = async (
  userId: string
): Promise<SponsorProfileResult<SponsorProfile>> => {
  try {
    const { data, error } = await supabase
      .from('sponsor_profiles')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle();

    if (error) {
      return { data: null, error: error.message };
    }

    return { data: (data as SponsorProfile) || null, error: null };
  } catch (err) {
    return {
      data: null,
      error: err instanceof Error ? err.message : 'Failed to fetch sponsor profile.',
    };
  }
};

/**
 * Creates a new sponsor profile for the currently authenticated user.
 * Verification status is always set to PENDING upon creation.
 */
export const createSponsorProfile = async (
  profile: SponsorProfileInput
): Promise<SponsorProfileResult<SponsorProfile>> => {
  try {
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return { data: null, error: 'User is not authenticated.' };
    }

    const minBudget = Number(profile.sponsorship_budget_min) || 0;
    const maxBudget = Math.max(minBudget, Number(profile.sponsorship_budget_max) || 0);

    const payload = {
      user_id: user.id,
      company_name: profile.company_name.trim(),
      contact_person: profile.contact_person.trim(),
      industry: profile.industry?.trim() || null,
      company_description: profile.company_description?.trim() || null,
      website: profile.website?.trim() || null,
      contact_email: profile.contact_email?.trim() || null,
      contact_phone: profile.contact_phone?.trim() || null,
      company_size: profile.company_size?.trim() || null,
      sponsorship_budget_min: minBudget,
      sponsorship_budget_max: maxBudget,
      preferred_categories: profile.preferred_categories?.trim() || null,
      preferred_audience: profile.preferred_audience?.trim() || null,
      preferred_locations: profile.preferred_locations?.trim() || null,
      verification_status: 'PENDING',
    };

    const { data, error } = await supabase
      .from('sponsor_profiles')
      .insert([payload])
      .select()
      .single();

    if (error) {
      return { data: null, error: error.message };
    }

    return { data: data as SponsorProfile, error: null };
  } catch (err) {
    return {
      data: null,
      error: err instanceof Error ? err.message : 'Failed to create sponsor profile.',
    };
  }
};

/**
 * Updates an existing sponsor profile for the currently authenticated user.
 * Verification status cannot be altered by sponsor clients (protected by DB trigger & excluded payload).
 */
export const updateSponsorProfile = async (
  profile: Partial<SponsorProfileInput>
): Promise<SponsorProfileResult<SponsorProfile>> => {
  try {
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return { data: null, error: 'User is not authenticated.' };
    }

    const updatePayload: Record<string, unknown> = {
      updated_at: new Date().toISOString(),
    };

    if (profile.company_name !== undefined) updatePayload.company_name = profile.company_name.trim();
    if (profile.contact_person !== undefined) updatePayload.contact_person = profile.contact_person.trim();
    if (profile.industry !== undefined) updatePayload.industry = profile.industry?.trim() || null;
    if (profile.company_description !== undefined) updatePayload.company_description = profile.company_description?.trim() || null;
    if (profile.website !== undefined) updatePayload.website = profile.website?.trim() || null;
    if (profile.contact_email !== undefined) updatePayload.contact_email = profile.contact_email?.trim() || null;
    if (profile.contact_phone !== undefined) updatePayload.contact_phone = profile.contact_phone?.trim() || null;
    if (profile.company_size !== undefined) updatePayload.company_size = profile.company_size?.trim() || null;
    if (profile.sponsorship_budget_min !== undefined) {
      updatePayload.sponsorship_budget_min = Math.max(0, Number(profile.sponsorship_budget_min) || 0);
    }
    if (profile.sponsorship_budget_max !== undefined) {
      const min = profile.sponsorship_budget_min !== undefined
        ? Math.max(0, Number(profile.sponsorship_budget_min) || 0)
        : 0;
      updatePayload.sponsorship_budget_max = Math.max(min, Number(profile.sponsorship_budget_max) || 0);
    }
    if (profile.preferred_categories !== undefined) updatePayload.preferred_categories = profile.preferred_categories?.trim() || null;
    if (profile.preferred_audience !== undefined) updatePayload.preferred_audience = profile.preferred_audience?.trim() || null;
    if (profile.preferred_locations !== undefined) updatePayload.preferred_locations = profile.preferred_locations?.trim() || null;

    const { data, error } = await supabase
      .from('sponsor_profiles')
      .update(updatePayload)
      .eq('user_id', user.id)
      .select()
      .single();

    if (error) {
      return { data: null, error: error.message };
    }

    return { data: data as SponsorProfile, error: null };
  } catch (err) {
    return {
      data: null,
      error: err instanceof Error ? err.message : 'Failed to update sponsor profile.',
    };
  }
};

/**
 * Saves (inserts or updates) the sponsor profile for the authenticated user.
 */
export const saveSponsorProfile = async (
  userId: string,
  input: SponsorProfileInput
): Promise<SponsorProfileResult<SponsorProfile>> => {
  try {
    const { data: existingProfile, error: fetchError } = await supabase
      .from('sponsor_profiles')
      .select('id, verification_status')
      .eq('user_id', userId)
      .maybeSingle();

    if (fetchError && fetchError.code !== 'PGRST116') {
      return { data: null, error: fetchError.message };
    }

    if (existingProfile) {
      return await updateSponsorProfile(input);
    } else {
      return await createSponsorProfile(input);
    }
  } catch (err) {
    return {
      data: null,
      error: err instanceof Error ? err.message : 'Failed to save sponsor profile.',
    };
  }
};
