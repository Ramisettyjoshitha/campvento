import { supabase } from './supabase';

export type VerificationStatus = 'PENDING' | 'VERIFIED' | 'REJECTED';

export interface OrganizerProfile {
  id?: string;
  user_id: string;
  full_name: string;
  college_name: string;
  organization_name: string;
  description: string;
  contact_email: string;
  contact_phone: string;
  verification_status: VerificationStatus;
  created_at?: string;
  updated_at?: string;
}

export interface OrganizerProfileInput {
  full_name: string;
  college_name: string;
  organization_name: string;
  description: string;
  contact_email: string;
  contact_phone: string;
}

/**
 * Retrieves the organizer profile for the specified user from Supabase.
 */
export const getOrganizerProfile = async (
  userId: string
): Promise<{ data: OrganizerProfile | null; error: string | null }> => {
  try {
    const { data, error } = await supabase
      .from('organizer_profiles')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle();

    if (error) {
      return { data: null, error: error.message };
    }

    return { data: (data as OrganizerProfile) || null, error: null };
  } catch (err) {
    return {
      data: null,
      error: err instanceof Error ? err.message : 'Failed to fetch organizer profile',
    };
  }
};

/**
 * Saves (inserts or updates) the organizer profile for the authenticated user.
 * Verification status is locked to PENDING for new profiles and cannot be altered by organizers.
 */
export const saveOrganizerProfile = async (
  userId: string,
  input: OrganizerProfileInput
): Promise<{ data: OrganizerProfile | null; error: string | null }> => {
  try {
    // Check if an existing profile exists for this user
    const { data: existingProfile, error: fetchError } = await supabase
      .from('organizer_profiles')
      .select('id, verification_status')
      .eq('user_id', userId)
      .maybeSingle();

    if (fetchError && fetchError.code !== 'PGRST116') {
      return { data: null, error: fetchError.message };
    }

    if (existingProfile) {
      // UPDATE existing profile: Exclude verification_status to prevent privilege escalation
      const { data, error } = await supabase
        .from('organizer_profiles')
        .update({
          full_name: input.full_name.trim(),
          college_name: input.college_name.trim(),
          organization_name: input.organization_name.trim(),
          description: input.description.trim(),
          contact_email: input.contact_email.trim(),
          contact_phone: input.contact_phone.trim(),
          updated_at: new Date().toISOString(),
        })
        .eq('user_id', userId)
        .select()
        .single();

      if (error) {
        return { data: null, error: error.message };
      }

      return { data: data as OrganizerProfile, error: null };
    } else {
      // INSERT new profile: default verification_status is PENDING
      const { data, error } = await supabase
        .from('organizer_profiles')
        .insert([
          {
            user_id: userId,
            full_name: input.full_name.trim(),
            college_name: input.college_name.trim(),
            organization_name: input.organization_name.trim(),
            description: input.description.trim(),
            contact_email: input.contact_email.trim(),
            contact_phone: input.contact_phone.trim(),
            verification_status: 'PENDING',
          },
        ])
        .select()
        .single();

      if (error) {
        return { data: null, error: error.message };
      }

      return { data: data as OrganizerProfile, error: null };
    }
  } catch (err) {
    return {
      data: null,
      error: err instanceof Error ? err.message : 'Failed to save organizer profile',
    };
  }
};
