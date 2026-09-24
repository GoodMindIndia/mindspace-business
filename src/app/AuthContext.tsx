import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { isSupabaseConfigured } from '@/lib/supabase';
import { supabaseHr } from '@/lib/supabase-hr';

export interface HrUser {
  email: string;
  name: string;
  title: string;
  orgId: string;
}

interface AuthContextValue {
  user: HrUser | null;
  /** False until the stored session has been checked, so guards don't bounce
   * an authenticated user to the login screen on refresh. */
  ready: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  isDemoAuth: boolean;
}

const SESSION_KEY = 'mindspace.business.hr-session.v1';

/** Local-dev fallback only, used when no Supabase project is configured at
 * all (no VITE_SUPABASE_URL/ANON_KEY). Any real deployment authenticates
 * against Supabase Auth + the hr_admins allowlist below — see
 * supabase/schema-hr-auth.sql and scripts/seed-hr-admin.mjs. */
const DEMO_ACCOUNTS: (HrUser & { password: string })[] = [
  { email: 'hr@mindspace.example', password: 'wellbeing2026', name: 'Priya Raghavan', title: 'Head of People, MindSpace', orgId: 'demo-acme' },
  { email: 'people@mindspace.example', password: 'wellbeing2026', name: 'Daniel Okafor', title: 'People Operations Lead', orgId: 'demo-acme' },
];

export const DEMO_LOGIN_HINT = { email: 'hr@mindspace.example', password: 'wellbeing2026' };

const AuthContext = createContext<AuthContextValue | null>(null);

/** Confirms the signed-in Supabase Auth user is in hr_admins and fetches
 * their display profile. Returns null for anyone not on the allowlist —
 * having a valid Supabase Auth login is not, on its own, enough to reach
 * the HR console. */
async function loadHrProfile(email: string): Promise<HrUser | null> {
  if (!supabaseHr) return null;
  const { data, error } = await supabaseHr.rpc('hr_admin_profile');
  if (error || !data) return null;
  const row = Array.isArray(data) ? data[0] : data;
  if (!row) return null;
  return { email, name: row.name, title: row.title ?? '', orgId: row.org_id };
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<HrUser | null>(null);
  const [ready, setReady] = useState(false);
  const isDemoAuth = !isSupabaseConfigured;

  useEffect(() => {
    if (isDemoAuth) {
      try {
        const raw = localStorage.getItem(SESSION_KEY);
        if (raw) setUser(JSON.parse(raw) as HrUser);
      } catch {
        // Corrupt session — treat as signed out.
      }
      setReady(true);
      return;
    }

    let cancelled = false;
    (async () => {
      const { data } = await supabaseHr!.auth.getSession();
      const email = data.session?.user?.email;
      const profile = email ? await loadHrProfile(email) : null;
      if (!cancelled) {
        setUser(profile);
        setReady(true);
      }
    })();

    const { data: subscription } = supabaseHr!.auth.onAuthStateChange(async (_event, session) => {
      const email = session?.user?.email;
      setUser(email ? await loadHrProfile(email) : null);
    });

    return () => {
      cancelled = true;
      subscription.subscription.unsubscribe();
    };
  }, [isDemoAuth]);

  const signIn = useCallback(
    async (email: string, password: string) => {
      const normalized = email.trim().toLowerCase();

      if (isDemoAuth) {
        const match = DEMO_ACCOUNTS.find((a) => a.email === normalized && a.password === password);
        if (!match) throw new Error('That email and password combination is not recognised.');
        const { password: _password, ...profile } = match;
        localStorage.setItem(SESSION_KEY, JSON.stringify(profile));
        setUser(profile);
        return;
      }

      const { data, error } = await supabaseHr!.auth.signInWithPassword({ email: normalized, password });
      if (error || !data.session) throw new Error(error?.message ?? 'Could not sign you in.');

      const profile = await loadHrProfile(normalized);
      if (!profile) {
        await supabaseHr!.auth.signOut();
        throw new Error('This account is not authorised for HR access.');
      }
      setUser(profile);
    },
    [isDemoAuth],
  );

  const signOut = useCallback(async () => {
    if (isDemoAuth) {
      localStorage.removeItem(SESSION_KEY);
      setUser(null);
      return;
    }
    await supabaseHr!.auth.signOut();
    setUser(null);
  }, [isDemoAuth]);

  const value = useMemo(
    () => ({ user, ready, signIn, signOut, isDemoAuth }),
    [user, ready, signIn, signOut, isDemoAuth],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
  return ctx;
}
