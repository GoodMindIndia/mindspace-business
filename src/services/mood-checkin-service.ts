import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { MOOD_ORDER, type Mood } from '@/domain/mood';

function todayDateString(): string {
  return new Date().toLocaleDateString('en-CA'); // YYYY-MM-DD, local date
}

/**
 * Saves (or updates) the employee's mood for today. One row per person per
 * day — picking a different mood later the same day overwrites it rather
 * than adding a second entry, via the unique(user_id, checkin_date)
 * constraint on daily_mood_checkins.
 */
export async function saveMoodCheckIn(userId: string, orgId: string, mood: Mood): Promise<void> {
  if (!isSupabaseConfigured || !supabase) {
    throw new Error('Check-ins cannot be saved right now. Please try again in a moment.');
  }

  const { error } = await supabase.from('daily_mood_checkins').upsert(
    {
      user_id: userId,
      org_id: orgId,
      mood,
      checkin_date: todayDateString(),
      updated_at: new Date().toISOString(),
    },
    { onConflict: 'user_id,checkin_date' },
  );

  if (error) throw error;
}

/** The employee's own mood for today, if they've already checked in. */
export async function getMyMoodToday(userId: string): Promise<Mood | null> {
  if (!isSupabaseConfigured || !supabase) return null;

  const { data, error } = await supabase
    .from('daily_mood_checkins')
    .select('mood')
    .eq('user_id', userId)
    .eq('checkin_date', todayDateString())
    .maybeSingle();

  if (error || !data) return null;
  return data.mood as Mood;
}

export interface DailyMoodSummary {
  live: boolean;
  /** Always a real count, even when the mood split below is withheld. */
  total: number;
  /** Empty when fewer than k people have checked in today — withheld at
   * the database, not just hidden in this UI. */
  byMood: { mood: Mood; n: number }[];
}

/**
 * What HR's Overview page reads: today's check-in count (always real) and
 * the mood breakdown (withheld below k). Checks both the tenant's own org_id
 * and the demo account, same pattern as org-stats-service.
 */
export async function getOrgDailyMoodSummary(orgId: string, k = 5): Promise<DailyMoodSummary> {
  if (!isSupabaseConfigured || !supabase) return { live: false, total: 0, byMood: [] };

  const orgIds = Array.from(new Set([orgId, 'demo-acme']));
  let total = 0;
  const byMoodMap = new Map<Mood, number>();
  let anyLive = false;

  // Pass today's date explicitly, computed client-side (the employee's own
  // local date, same as saveMoodCheckIn writes) — the database's own
  // current_date runs in UTC, which reads as "yesterday" for anyone ahead of
  // UTC until midnight UTC actually passes, and would otherwise miss every
  // check-in stored under today's real local date.
  const today = todayDateString();

  for (const id of orgIds) {
    try {
      const { data: statsData, error: statsError } = await supabase.rpc('org_daily_checkin_stats', {
        p_org_id: id,
        p_date: today,
      });
      if (!statsError && statsData) {
        const row = Array.isArray(statsData) ? statsData[0] : statsData;
        if (row) {
          anyLive = true;
          total += row.total ?? 0;
        }
      }

      const { data: moodData, error: moodError } = await supabase.rpc('org_daily_mood_summary', {
        p_org_id: id,
        p_date: today,
        p_k: k,
      });
      if (!moodError && moodData) {
        for (const row of moodData as { mood: Mood; n: number }[]) {
          byMoodMap.set(row.mood, (byMoodMap.get(row.mood) ?? 0) + (row.n ?? 0));
        }
      }
    } catch (err) {
      console.warn('[mindspace] daily mood summary failed for id:', id, err);
    }
  }

  if (!anyLive) return { live: false, total: 0, byMood: [] };

  const byMood = MOOD_ORDER.filter((m) => byMoodMap.has(m)).map((mood) => ({ mood, n: byMoodMap.get(mood)! }));
  return { live: true, total, byMood };
}
