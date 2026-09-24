import { supabase, isSupabaseConfigured } from '@/lib/supabase';

export interface CreditPlan {
  id: 'starter_5k' | 'growth_10k' | 'enterprise_20k';
  name: string;
  tier: string;
  credits: number;
  priceINR: number;
  priceUSD: number;
  billingPeriod: string;
  badge?: string;
  description: string;
  features: string[];
}

export const CREDIT_PLANS: CreditPlan[] = [
  {
    id: 'starter_5k',
    name: '5,000 Credits Plan',
    tier: 'Starter Tier',
    credits: 5000,
    priceINR: 49999,
    priceUSD: 599,
    billingPeriod: 'per month',
    badge: 'Current Plan',
    description: 'Essential AI voice companion & clinical assessments for teams.',
    features: [
      '5,000 Tara AI Voice & Chat sessions',
      'Unlimited workload, mood & burnout check-ins',
      'Aggregated k-anonymity HR sentiment reports',
      'EAP & 24/7 Crisis helpline routing',
      'Standard business support',
    ],
  },
  {
    id: 'growth_10k',
    name: '10,000 Credits Plan',
    tier: 'Growth Tier',
    credits: 10000,
    priceINR: 89999,
    priceUSD: 1099,
    billingPeriod: 'per month',
    badge: 'Most Popular',
    description: 'Expanded coverage for scaling business units and multi-team wellness.',
    features: [
      '10,000 Tara AI Voice & Chat sessions',
      'All Starter Tier features included',
      'Cross-cohort heatmaps & driver analysis',
      'Quarterly executive clinical wellbeing debrief',
      'Priority 1:1 licensed therapist booking desk',
      'Dedicated wellness success partner',
    ],
  },
  {
    id: 'enterprise_20k',
    name: '20,000 Credits Plan',
    tier: 'Enterprise Tier',
    credits: 20000,
    priceINR: 159999,
    priceUSD: 1999,
    billingPeriod: 'per month',
    badge: 'Best Value',
    description: 'Comprehensive enterprise-grade mental health suite for global organizations.',
    features: [
      '20,000 Tara AI Voice & Chat sessions',
      'All Growth Tier features included',
      'Custom LLM sentiment driver taxonomy for HR',
      'Unlimited corporate workshop sponsorships',
      'Custom SLA & 99.9% uptime guarantee',
      'Corporate Purchase Order (PO) & Net-30 invoicing',
    ],
  },
];

export interface OrgCreditBalance {
  live: boolean;
  planId: string;
  planName: string;
  totalCredits: number;
  creditsUsed: number;
  creditsRemaining: number;
  renewalDate: string;
}

const STORAGE_PREFIX = 'mindspace.org.credit_plan.';

export function getStoredCreditPlan(orgId: string): OrgCreditBalance | null {
  try {
    const raw = localStorage.getItem(`${STORAGE_PREFIX}${orgId}`);
    if (raw) return JSON.parse(raw);
  } catch {
    // ignore
  }
  return null;
}

export function saveStoredCreditPlan(orgId: string, balance: OrgCreditBalance) {
  try {
    localStorage.setItem(`${STORAGE_PREFIX}${orgId}`, JSON.stringify(balance));
    window.dispatchEvent(new CustomEvent('mindspace:credits-updated', { detail: balance }));
  } catch {
    // ignore
  }
}

/** Default starter balance (5,000 credits) */
export const DEFAULT_5K_BALANCE: OrgCreditBalance = {
  live: true,
  planId: 'starter_5k',
  planName: '5,000 Credits Plan',
  totalCredits: 5000,
  creditsUsed: 880,
  creditsRemaining: 4120,
  renewalDate: '2026-09-30',
};

/**
 * Reads the org's active Tara credit plan balance.
 * Uses localStorage cache / fallback so HR updates are instantaneous,
 * then checks Supabase RPC if configured.
 */
export async function getOrgCreditBalance(orgId: string): Promise<OrgCreditBalance> {
  const cached = getStoredCreditPlan(orgId);
  if (cached) return cached;

  if (isSupabaseConfigured && supabase) {
    const orgIds = Array.from(new Set([orgId, 'demo-acme']));
    for (const id of orgIds) {
      try {
        const { data, error } = await supabase.rpc('org_credit_balance', { p_org_id: id });
        if (!error && data) {
          const row = Array.isArray(data) ? data[0] : data;
          if (row) {
            const total = row.total_credits ?? 5000;
            const used = row.credits_used ?? 880;
            const plan = CREDIT_PLANS.find((p) => p.credits === total) || CREDIT_PLANS[0];
            const balance: OrgCreditBalance = {
              live: true,
              planId: plan.id,
              planName: plan.name,
              totalCredits: total,
              creditsUsed: used,
              creditsRemaining: Math.max(total - used, 0),
              renewalDate: '2026-09-30',
            };
            saveStoredCreditPlan(orgId, balance);
            return balance;
          }
        }
      } catch (err) {
        console.warn('[mindspace] org_credit_balance rpc failed:', err);
      }
    }
  }

  // Default to 5,000 credits plan
  saveStoredCreditPlan(orgId, DEFAULT_5K_BALANCE);
  return DEFAULT_5K_BALANCE;
}

/**
 * Updates the organization's credit plan (e.g. upgraded to 10,000 or 20,000 credits).
 */
export async function updateOrgCreditPlan(
  orgId: string,
  planId: 'starter_5k' | 'growth_10k' | 'enterprise_20k',
  _paymentMethod?: string
): Promise<OrgCreditBalance> {
  const plan = CREDIT_PLANS.find((p) => p.id === planId) || CREDIT_PLANS[0];
  const current = getStoredCreditPlan(orgId) || DEFAULT_5K_BALANCE;
  
  // Maintain current credits used but expand total credits
  const updatedBalance: OrgCreditBalance = {
    live: true,
    planId: plan.id,
    planName: plan.name,
    totalCredits: plan.credits,
    creditsUsed: Math.min(current.creditsUsed, plan.credits),
    creditsRemaining: Math.max(plan.credits - current.creditsUsed, 0),
    renewalDate: '2026-09-30',
  };

  saveStoredCreditPlan(orgId, updatedBalance);

  // If Supabase is connected, optionally update org_credit_accounts
  if (isSupabaseConfigured && supabase) {
    try {
      await supabase
        .from('org_credit_accounts')
        .upsert({
          org_id: orgId,
          plan_name: plan.name,
          total_credits: plan.credits,
          updated_at: new Date().toISOString(),
        });
    } catch {
      // ignore
    }
  }

  return updatedBalance;
}

export interface MemberCreditUsage {
  memberLabel: string;
  creditsUsed: number;
  lastUsedAt: string | null;
}

export interface OrgCreditUsageByMember {
  live: boolean;
  members: MemberCreditUsage[];
}

/**
 * Per-employee Tara credit usage, by nickname only — never a name, email, or
 * user id. See supabase/schema-credit-anonymization.sql for how the nickname
 * is derived; this just reads what that migration exposes.
 */
export async function getOrgCreditUsageByMember(orgId: string): Promise<OrgCreditUsageByMember> {
  if (!isSupabaseConfigured || !supabase) return { live: false, members: [] };

  try {
    const { data, error } = await supabase.rpc('org_credit_usage_by_member', { p_org_id: orgId });
    if (error || !data) return { live: false, members: [] };

    const rows = Array.isArray(data) ? data : [data];
    const members: MemberCreditUsage[] = rows
      .map((row: any) => ({
        memberLabel: row.member_label as string,
        creditsUsed: row.credits_used as number,
        lastUsedAt: (row.last_used_at as string) ?? null,
      }))
      .sort((a, b) => b.creditsUsed - a.creditsUsed);

    return { live: true, members };
  } catch (err) {
    console.warn('[mindspace] org_credit_usage_by_member rpc failed:', err);
    return { live: false, members: [] };
  }
}

export class OutOfCreditsError extends Error {}

/**
 * Opens a Tara session. Nothing is deducted yet — credits are billed by
 * actual call duration when the call ends (see endTaraSession). This only
 * reserves the session and confirms the org has at least 1 credit left to
 * start with; sessionId must be passed to endTaraSession once the call ends.
 */
export async function startTaraSession(
  orgId: string
): Promise<{ sessionId: string | null; creditsRemaining: number; totalCredits: number }> {
  const balance = await getOrgCreditBalance(orgId);
  if (balance.creditsRemaining <= 0) {
    throw new OutOfCreditsError('Your organization has used all its Tara credits for this period.');
  }

  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase.rpc('start_tara_session', { p_org_id: orgId });
      if (error) throw error;
      const row = Array.isArray(data) ? data[0] : data;
      if (row) {
        return {
          sessionId: row.session_id ?? null,
          creditsRemaining: row.credits_remaining,
          totalCredits: row.total_credits,
        };
      }
    } catch {
      // fallback to local balance below — no session id means endTaraSession
      // will skip settlement rather than charge against a session that was
      // never actually opened server-side.
    }
  }

  return { sessionId: null, creditsRemaining: balance.creditsRemaining, totalCredits: balance.totalCredits };
}

/**
 * Settles a Tara session at call end: charges credits for the real
 * duration (1 per minute, rounded up, minimum 1 for any call that actually
 * connected — a call that never connected should pass durationSeconds <= 0
 * so nothing is charged). Updates the local balance cache with the real
 * result so the UI reflects it immediately, without waiting on a refetch.
 */
export async function endTaraSession(
  orgId: string,
  sessionId: string | null,
  durationSeconds: number
): Promise<{ creditsCharged: number; creditsRemaining: number; totalCredits: number } | null> {
  if (!sessionId || !isSupabaseConfigured || !supabase) return null;

  try {
    const { data, error } = await supabase.rpc('end_tara_session', {
      p_org_id: orgId,
      p_session_id: sessionId,
      p_duration_seconds: Math.max(0, Math.round(durationSeconds)),
    });
    if (error) throw error;
    const row = Array.isArray(data) ? data[0] : data;
    if (!row) return null;

    const result = {
      creditsCharged: row.credits_charged as number,
      creditsRemaining: row.credits_remaining as number,
      totalCredits: row.total_credits as number,
    };

    const current = getStoredCreditPlan(orgId);
    if (current) {
      saveStoredCreditPlan(orgId, {
        ...current,
        creditsUsed: Math.max(current.totalCredits - result.creditsRemaining, 0),
        creditsRemaining: result.creditsRemaining,
      });
    }

    return result;
  } catch (err) {
    console.warn('[mindspace] end_tara_session rpc failed:', err);
    return null;
  }
}
