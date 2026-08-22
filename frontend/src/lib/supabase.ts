import { createClient } from '@supabase/supabase-js';
import type { User } from '@supabase/supabase-js';

const rawUrl = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const publishableKey = (import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY ||
  import.meta.env.VITE_SUPABASE_ANON_KEY) as string | undefined;

// Normalize Supabase URL (strip trailing /rest/v1 or trailing slashes)
const normalizeUrl = (url?: string): string => {
  if (!url) return '';
  return url.trim().replace(/\/rest\/v1\/?$/, '').replace(/\/+$/, '');
};

const supabaseUrl = normalizeUrl(rawUrl);

if (!supabaseUrl || !publishableKey) {
  console.warn(
    '[Supabase] Warning: VITE_SUPABASE_URL or VITE_SUPABASE_PUBLISHABLE_KEY is missing in environment.'
  );
}

export const supabase = createClient(
  supabaseUrl || 'https://placeholder.supabase.co',
  publishableKey || 'placeholder-key',
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
    },
  }
);

export type UserRole = 'ORGANIZER' | 'SPONSOR' | 'ADMIN';
export type PublicUserRole = 'ORGANIZER' | 'SPONSOR';

export interface UserProfile {
  id: string;
  email: string;
  fullName: string;
  role: UserRole;
  createdAt?: string;
}

/**
 * Safely extracts and validates the user role from authenticated Supabase user metadata.
 * Prioritizes app_metadata, falls back to user_metadata, and defaults to 'ORGANIZER'.
 */
export const extractUserRole = (user: User | null): UserRole => {
  if (!user) return 'ORGANIZER';

  // Check app_metadata first (server/admin managed), then user_metadata
  const rawRole =
    (user.app_metadata?.role as string) ||
    (user.user_metadata?.role as string) ||
    'ORGANIZER';

  const normalized = rawRole.toUpperCase();
  if (normalized === 'ADMIN') return 'ADMIN';
  if (normalized === 'SPONSOR') return 'SPONSOR';
  return 'ORGANIZER';
};

/**
 * Extracts the user's full name from metadata.
 */
export const extractFullName = (user: User | null): string => {
  if (!user) return '';
  return (
    (user.user_metadata?.full_name as string) ||
    (user.user_metadata?.name as string) ||
    user.email?.split('@')[0] ||
    'User'
  );
};

export interface SupabaseStatus {
  initialized: boolean;
  configured: boolean;
  message: string;
}

/**
 * Validates that the Supabase client has been initialized with valid credentials.
 * Does not expose or print any API keys.
 */
export const checkSupabaseConnection = async (): Promise<SupabaseStatus> => {
  if (!supabaseUrl || !publishableKey) {
    return {
      initialized: false,
      configured: false,
      message: 'Missing environment variables',
    };
  }

  try {
    const { error } = await supabase.auth.getSession();
    if (error) {
      return {
        initialized: true,
        configured: true,
        message: `Client ready (${error.message})`,
      };
    }
    return {
      initialized: true,
      configured: true,
      message: 'Connected to Supabase Auth',
    };
  } catch {
    return {
      initialized: true,
      configured: true,
      message: 'Supabase client initialized',
    };
  }
};
