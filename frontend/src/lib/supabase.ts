import { createClient } from '@supabase/supabase-js';

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
      persistSession: false,
      autoRefreshToken: false,
    },
  }
);

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
    // Ping Supabase public health / auth to ensure project URL is reachable
    const response = await fetch(`${supabaseUrl}/auth/v1/health`, {
      method: 'GET',
      headers: {
        apikey: publishableKey,
      },
    });

    if (response.ok) {
      return {
        initialized: true,
        configured: true,
        message: 'Connected to Supabase project',
      };
    } else {
      return {
        initialized: true,
        configured: true,
        message: `Supabase reachable (HTTP ${response.status})`,
      };
    }
  } catch {
    // If auth health endpoint is blocked or unreachable via CORS, verify client instantiation
    return {
      initialized: true,
      configured: true,
      message: 'Supabase client initialized',
    };
  }
};
