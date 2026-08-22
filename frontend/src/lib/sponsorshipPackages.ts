/**
 * CAMPVENTO — Step 4.3
 * frontend/src/lib/sponsorshipPackages.ts
 *
 * Supabase client operations for the public.sponsorship_packages table.
 * All operations use the authenticated user session.
 * Never uses a service-role key.
 */

import { supabase } from './supabase';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type SponsorshipPackageStatus = 'ACTIVE' | 'INACTIVE';

export interface SponsorshipPackage {
  id: string;
  event_id: string;
  organizer_id: string;
  package_name: string;
  description: string | null;
  price: number;
  benefits: string | null;
  available_slots: number;
  status: SponsorshipPackageStatus;
  created_at: string;
  updated_at: string;
}

export interface CreateSponsorshipPackageInput {
  event_id: string;
  package_name: string;
  description?: string;
  price: number;
  benefits?: string;
  available_slots: number;
  status: SponsorshipPackageStatus;
}

export interface UpdateSponsorshipPackageInput {
  package_name?: string;
  description?: string;
  price?: number;
  benefits?: string;
  available_slots?: number;
  status?: SponsorshipPackageStatus;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

type ServiceResult<T> = { data: T | null; error: string | null };

// ---------------------------------------------------------------------------
// getMyPackages
// Returns all sponsorship packages owned by the authenticated organizer.
// ---------------------------------------------------------------------------
export async function getMyPackages(): Promise<ServiceResult<SponsorshipPackage[]>> {
  const { data, error } = await supabase
    .from('sponsorship_packages')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) return { data: null, error: error.message };
  return { data: data as SponsorshipPackage[], error: null };
}

// ---------------------------------------------------------------------------
// getPackagesForEvent
// Returns packages for a specific event (must belong to the authenticated organizer).
// ---------------------------------------------------------------------------
export async function getPackagesForEvent(
  eventId: string
): Promise<ServiceResult<SponsorshipPackage[]>> {
  const { data, error } = await supabase
    .from('sponsorship_packages')
    .select('*')
    .eq('event_id', eventId)
    .order('created_at', { ascending: false });

  if (error) return { data: null, error: error.message };
  return { data: data as SponsorshipPackage[], error: null };
}

// ---------------------------------------------------------------------------
// getPackageById
// ---------------------------------------------------------------------------
export async function getPackageById(
  id: string
): Promise<ServiceResult<SponsorshipPackage>> {
  const { data, error } = await supabase
    .from('sponsorship_packages')
    .select('*')
    .eq('id', id)
    .single();

  if (error) return { data: null, error: error.message };
  return { data: data as SponsorshipPackage, error: null };
}

// ---------------------------------------------------------------------------
// createSponsorshipPackage
// organizer_id is derived from the authenticated session on the server side
// via RLS — we never blindly trust the frontend for this field.
// We DO need to pass organizer_id because the RLS INSERT policy checks:
//   auth.uid() = organizer_id  AND  the event belongs to auth.uid()
// So we pull it from the current session here.
// ---------------------------------------------------------------------------
export async function createSponsorshipPackage(
  input: CreateSponsorshipPackageInput
): Promise<ServiceResult<SponsorshipPackage>> {
  // Resolve the current authenticated user's ID from the session.
  const {
    data: { user },
    error: sessionError,
  } = await supabase.auth.getUser();

  if (sessionError || !user) {
    return { data: null, error: 'Not authenticated. Please sign in.' };
  }

  const payload = {
    event_id: input.event_id,
    organizer_id: user.id, // always from session, never from UI input
    package_name: input.package_name,
    description: input.description ?? null,
    price: input.price,
    benefits: input.benefits ?? null,
    available_slots: input.available_slots,
    status: input.status,
  };

  const { data, error } = await supabase
    .from('sponsorship_packages')
    .insert(payload)
    .select()
    .single();

  if (error) return { data: null, error: error.message };
  return { data: data as SponsorshipPackage, error: null };
}

// ---------------------------------------------------------------------------
// updateSponsorshipPackage
// Only allowed fields; id, event_id, organizer_id, created_at cannot change.
// ---------------------------------------------------------------------------
export async function updateSponsorshipPackage(
  id: string,
  input: UpdateSponsorshipPackageInput
): Promise<ServiceResult<SponsorshipPackage>> {
  const { data, error } = await supabase
    .from('sponsorship_packages')
    .update(input)
    .eq('id', id)
    .select()
    .single();

  if (error) return { data: null, error: error.message };
  return { data: data as SponsorshipPackage, error: null };
}

// ---------------------------------------------------------------------------
// deleteSponsorshipPackage
// ---------------------------------------------------------------------------
export async function deleteSponsorshipPackage(
  id: string
): Promise<{ success: boolean; error: string | null }> {
  const { error } = await supabase
    .from('sponsorship_packages')
    .delete()
    .eq('id', id);

  if (error) return { success: false, error: error.message };
  return { success: true, error: null };
}
