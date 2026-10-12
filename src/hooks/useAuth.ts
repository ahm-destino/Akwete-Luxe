// ============================================================
// Akwete Luxe — useAuth Hook
// Wraps Supabase Auth for signup, login, logout, session
// ============================================================
import { useState, useEffect, useCallback } from 'react';
import { User as SupabaseUser, Session } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';
import { ProfileRow } from '../lib/database.types';
import { User } from '../types';

// Map Supabase profile row → app User type
function mapProfileToUser(profile: ProfileRow): User {
  return {
    id: profile.id,
    name: profile.name,
    email: profile.email,
    role: profile.role,
    phone: profile.phone ?? undefined,
    address: profile.city
      ? {
          street: 'On file',
          city: profile.city,
          state: profile.city,
          country: profile.country ?? 'Nigeria',
        }
      : undefined,
    producerId: profile.producer_id ?? undefined,
    joinedDate: profile.joined_date ?? new Date().toISOString().split('T')[0],
  };
}

interface AuthState {
  user: User | null;
  supabaseUser: SupabaseUser | null;
  session: Session | null;
  loading: boolean;
  error: string | null;
}

interface SignupData {
  name: string;
  email: string;
  password: string;
  phone?: string;
  city?: string;
  country?: string;
}

interface SigninData {
  email: string;
  password: string;
}

export function useAuth() {
  const [state, setState] = useState<AuthState>({
    user: null,
    supabaseUser: null,
    session: null,
    loading: true,
    error: null,
  });

  // Fetch profile for a given Supabase user
  const fetchProfile = useCallback(async (supabaseUser: SupabaseUser): Promise<User | null> => {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', supabaseUser.id)
      .single();

    if (error || !data) return null;
    return mapProfileToUser(data as ProfileRow);
  }, []);

  // Listen for auth state changes (login, logout, token refresh)
  useEffect(() => {
    let mounted = true;

    // Get initial session
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (!mounted) return;
      if (session?.user) {
        const profile = await fetchProfile(session.user);
        setState({
          user: profile,
          supabaseUser: session.user,
          session,
          loading: false,
          error: null,
        });
      } else {
        setState(prev => ({ ...prev, loading: false }));
      }
    });

    // Subscribe to future changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        if (!mounted) return;
        if (session?.user) {
          const profile = await fetchProfile(session.user);
          setState({
            user: profile,
            supabaseUser: session.user,
            session,
            loading: false,
            error: null,
          });
        } else {
          setState({
            user: null,
            supabaseUser: null,
            session: null,
            loading: false,
            error: null,
          });
        }
      }
    );

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [fetchProfile]);

  // ── Sign Up ────────────────────────────────────────────────
  const signupBuyer = useCallback(async (data: SignupData): Promise<{ error: string | null }> => {
    setState(prev => ({ ...prev, loading: true, error: null }));

    const { error } = await supabase.auth.signUp({
      email: data.email,
      password: data.password,
      options: {
        data: {
          name: data.name,
          role: 'buyer',
        },
      },
    });

    if (error) {
      setState(prev => ({ ...prev, loading: false, error: error.message }));
      return { error: error.message };
    }

    // Profile is auto-created by DB trigger handle_new_user()
    // Update profile with phone/city/country
    const { data: { user: supabaseUser } } = await supabase.auth.getUser();
    if (supabaseUser) {
      await supabase
        .from('profiles')
        .update({
          phone: data.phone ?? null,
          city: data.city ?? null,
          country: data.country ?? 'Nigeria',
        })
        .eq('id', supabaseUser.id);
    }

    setState(prev => ({ ...prev, loading: false }));
    return { error: null };
  }, []);

  // ── Sign In ────────────────────────────────────────────────
  const signinBuyer = useCallback(async (data: SigninData): Promise<{ error: string | null }> => {
    setState(prev => ({ ...prev, loading: true, error: null }));

    const { error } = await supabase.auth.signInWithPassword({
      email: data.email,
      password: data.password,
    });

    if (error) {
      setState(prev => ({ ...prev, loading: false, error: error.message }));
      return { error: error.message };
    }

    setState(prev => ({ ...prev, loading: false }));
    return { error: null };
  }, []);

  // ── Magic Link (passwordless) ──────────────────────────────
  const sendMagicLink = useCallback(async (email: string): Promise<{ error: string | null }> => {
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { shouldCreateUser: true },
    });
    return { error: error?.message ?? null };
  }, []);

  // ── Demo Logins (dev convenience — still hit Supabase) ─────
  // These set the user state directly for demo purposes (no real auth)
  const loginAsDemoUser = useCallback((demoUser: User) => {
    setState(prev => ({ ...prev, user: demoUser }));
  }, []);

  // ── Logout ─────────────────────────────────────────────────
  const logout = useCallback(async () => {
    await supabase.auth.signOut();
    setState({
      user: null,
      supabaseUser: null,
      session: null,
      loading: false,
      error: null,
    });
  }, []);

  // ── Refresh profile ────────────────────────────────────────
  const refreshProfile = useCallback(async () => {
    if (!state.supabaseUser) return;
    const profile = await fetchProfile(state.supabaseUser);
    if (profile) {
      setState(prev => ({ ...prev, user: profile }));
    }
  }, [state.supabaseUser, fetchProfile]);

  return {
    ...state,
    signupBuyer,
    signinBuyer,
    sendMagicLink,
    loginAsDemoUser,
    logout,
    refreshProfile,
  };
}
