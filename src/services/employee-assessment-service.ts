import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import type { AssessmentType, AssessmentLevel } from '@/domain/assessments';

export interface EmployeeAssessmentRecord {
  id: string;
  domain: AssessmentType;
  score: number;
  maxScore: number;
  level: AssessmentLevel;
  items: { qid: number; score: number }[];
  submittedAt: string;
}

/**
 * An employee's own assessment history — a full, unlimited-retake record tied
 * to their Supabase user id. Row-level security means this is the only
 * account, employee or otherwise, that can ever read these rows back.
 */
export async function listMyAssessments(userId: string): Promise<EmployeeAssessmentRecord[]> {
  if (!isSupabaseConfigured || !supabase) return [];

  const { data, error } = await supabase
    .from('assessment_records')
    .select('*')
    .eq('user_id', userId)
    .order('submitted_at', { ascending: false });

  if (error) {
    console.warn('[mindspace] listMyAssessments failed:', error);
    return [];
  }

  return (data ?? []).map((row: any) => ({
    id: row.id,
    domain: row.domain,
    score: row.score,
    maxScore: row.max_score,
    level: row.level,
    items: typeof row.items === 'string' ? JSON.parse(row.items) : row.items ?? [],
    submittedAt: row.submitted_at,
  }));
}

export async function saveMyAssessment(
  userId: string,
  orgId: string,
  result: {
    domain: AssessmentType;
    score: number;
    maxScore: number;
    level: AssessmentLevel;
    items: { qid: number; score: number }[];
  },
): Promise<void> {
  if (!isSupabaseConfigured || !supabase) {
    throw new Error('Assessments cannot be saved right now. Please try again in a moment.');
  }

  const { error } = await supabase.from('assessment_records').insert({
    user_id: userId,
    org_id: orgId,
    domain: result.domain,
    score: result.score,
    max_score: result.maxScore,
    level: result.level,
    items: result.items,
  });

  if (error) throw error;
}
