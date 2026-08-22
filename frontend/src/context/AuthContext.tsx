import React, { createContext, useContext, useEffect, useState } from 'react';
import type { User, Session } from '@supabase/supabase-js';
import {
  supabase,
  extractUserRole,
  extractFullName,
} from '../lib/supabase';
import type { UserRole, PublicUserRole } from '../lib/supabase';

export interface AuthContextType {
  user: User | null;
  session: Session | null;
  role: UserRole | null;
  fullName: string;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: string | null }>;
  signUp: (params: {
    email: string;
    password: string;
    fullName: string;
    role: PublicUserRole;
  }) => Promise<{ error: string | null; requiresEmailConfirmation?: boolean }>;
  signOut: () => Promise<void>;
  getDashboardPath: (targetRole?: UserRole | null) => string;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const getDashboardPathForRole = (role?: UserRole | null): string => {
  switch (role) {
    case 'ORGANIZER':
      return '/dashboard/organizer';
    case 'SPONSOR':
      return '/dashboard/sponsor';
    case 'ADMIN':
      return '/dashboard/admin';
    default:
      return '/login';
  }
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [role, setRole] = useState<UserRole | null>(null);
  const [fullName, setFullName] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    // 1. Get initial active session
    const initializeAuth = async () => {
      try {
        const { data, error } = await supabase.auth.getSession();
        if (error) {
          console.error('[AuthContext] Error getting initial session:', error.message);
        }
        if (data?.session?.user) {
          setSession(data.session);
          setUser(data.session.user);
          setRole(extractUserRole(data.session.user));
          setFullName(extractFullName(data.session.user));
        }
      } catch (err) {
        console.error('[AuthContext] Session init exception:', err);
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();

    // 2. Subscribe to auth state changes (SIGN_IN, SIGN_OUT, TOKEN_REFRESHED, etc.)
    const { data: authListener } = supabase.auth.onAuthStateChange(
      (_event, newSession) => {
        setSession(newSession);
        const currentUser = newSession?.user ?? null;
        setUser(currentUser);
        if (currentUser) {
          setRole(extractUserRole(currentUser));
          setFullName(extractFullName(currentUser));
        } else {
          setRole(null);
          setFullName('');
        }
        setLoading(false);
      }
    );

    return () => {
      authListener?.subscription.unsubscribe();
    };
  }, []);

  const signIn = async (email: string, password: string): Promise<{ error: string | null }> => {
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      if (error) {
        return { error: error.message };
      }
      return { error: null };
    } catch (err) {
      return { error: err instanceof Error ? err.message : 'An unexpected error occurred during sign in.' };
    }
  };

  const signUp = async ({
    email,
    password,
    fullName: nameInput,
    role: roleInput,
  }: {
    email: string;
    password: string;
    fullName: string;
    role: PublicUserRole;
  }): Promise<{ error: string | null; requiresEmailConfirmation?: boolean }> => {
    // Security check: ensure public registration role is strictly ORGANIZER or SPONSOR
    const safeRole: PublicUserRole = roleInput === 'SPONSOR' ? 'SPONSOR' : 'ORGANIZER';

    try {
      const { data, error } = await supabase.auth.signUp({
        email: email.trim(),
        password,
        options: {
          data: {
            full_name: nameInput.trim(),
            role: safeRole,
          },
        },
      });

      if (error) {
        return { error: error.message };
      }

      // Check if user session was created immediately or requires email confirmation
      const requiresEmailConfirmation = !data.session;

      return {
        error: null,
        requiresEmailConfirmation,
      };
    } catch (err) {
      return {
        error: err instanceof Error ? err.message : 'An unexpected error occurred during registration.',
      };
    }
  };

  const signOut = async (): Promise<void> => {
    try {
      await supabase.auth.signOut();
    } catch (err) {
      console.error('[AuthContext] Error signing out:', err);
    } finally {
      setSession(null);
      setUser(null);
      setRole(null);
      setFullName('');
    }
  };

  const getDashboardPath = (targetRole?: UserRole | null): string => {
    return getDashboardPathForRole(targetRole ?? role);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        role,
        fullName,
        loading,
        signIn,
        signUp,
        signOut,
        getDashboardPath,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
