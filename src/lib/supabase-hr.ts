import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { isSupabaseConfigured } from '@/lib/supabase';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

/**
 * A second Supabase client, same project as `src/lib/supabase.ts`, but with
 * its own localStorage key. Employees and HR admins are different Supabase
 * Auth users signing in through different flows (Google OAuth vs
 * email/password) — without a separate storage key they'd share one
 * session slot in the browser, so signing in as HR in a tab where an
 * employee is already signed in would silently sign the employee out (and
 * vice versa). This keeps the two sessions independent.
 */
export const supabaseHr: SupabaseClient | null = isSupabaseConfigured
  ? createClient(supabaseUrl!, supabaseAnonKey!, {
      auth: { storageKey: 'mindspace-hr-auth' },
    })
  : null;
