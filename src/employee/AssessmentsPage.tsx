import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Flower2, Smile, Layers, Scale, Users, TrendingUp, ClipboardList, Check, type LucideIcon } from 'lucide-react';
import { ASSESSMENT_METADATA, ASSESSMENT_TYPES, type AssessmentType } from '@/domain/assessments';
import { useEmployeeAuth } from '@/app/EmployeeAuthContext';
import { listMyAssessments, type EmployeeAssessmentRecord } from '@/services/employee-assessment-service';
import { PageHero, ProgressRing } from '@/components/PageHero';

const TYPE_ICON: Record<AssessmentType, LucideIcon> = {
  workload: Layers,
  work_anxiety: Flower2,
  work_mood: Smile,
  manager_relationship: Users,
  work_life_balance: Scale,
  career_growth: TrendingUp,
};

export function AssessmentsPage() {
  const { user } = useEmployeeAuth();
  const [history, setHistory] = useState<EmployeeAssessmentRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    let cancelled = false;
    listMyAssessments(user.id).then((records) => {
      if (!cancelled) {
        setHistory(records);
        setLoading(false);
      }
    });
    return () => {
      cancelled = true;
    };
  }, [user]);

  const latestByType = useMemo(() => {
    // Ignore records saved under a domain name that's since been retired
    // (e.g. from before an assessment redesign) — they'd otherwise inflate
    // "completed" past the current 6 domains.
    const currentDomains: Set<string> = new Set(ASSESSMENT_TYPES);
    const map = new Map<AssessmentType, EmployeeAssessmentRecord>();
    for (const record of history) {
      if (!currentDomains.has(record.domain)) continue;
      if (!map.has(record.domain)) map.set(record.domain, record);
    }
    return map;
  }, [history]);

  const completedCount = latestByType.size;
  const totalCount = ASSESSMENT_TYPES.length;

  return (
    <div className="flex flex-col gap-8 pb-12">
      <PageHero
        eyebrow="Private check-ins"
        icon={ClipboardList}
        tone="green"
        badge="Results stay yours"
        title="Check in with yourself"
        sub="Six short check-ins, about five minutes each. Answer for how things have felt over the last two weeks, not just today. There are no right answers, and none of this is a diagnosis."
        aside={<ProgressRing value={completedCount} total={totalCount} label="Completed" />}
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-5">
        {ASSESSMENT_TYPES.map((type, i) => {
          const meta = ASSESSMENT_METADATA[type];
          const latest = latestByType.get(type);
          const completed = !loading && !!latest;
          const Icon = TYPE_ICON[type];

          return (
            <div
              key={type}
              className="ms-fade-up group relative overflow-hidden rounded-[24px] bg-white p-6 border border-[#EAE4D9] shadow-[0_1px_3px_rgba(35,50,38,0.06)] flex flex-col gap-4 transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_20px_44px_-22px_rgba(35,50,38,0.3)] hover:border-[#2C6E6A]/35"
              style={{ animationDelay: `${i * 70}ms` }}
            >
              {/* Completed cards carry a green edge, so done vs not-done reads
                  from across the room rather than from a 0% progress bar. */}
              <span
                aria-hidden
                className="absolute left-0 top-0 h-full w-1 transition-colors"
                style={{ background: completed ? '#2F7F4C' : '#EAE4D9' }}
              />

              <div className="flex items-start justify-between gap-4 pl-2">
                <div className="flex items-start gap-3.5">
                  <div
                    className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl transition-colors"
                    style={
                      completed
                        ? { background: '#E8F0EA', color: '#2F7F4C' }
                        : { background: '#E9F1F0', color: '#2C6E6A' }
                    }
                  >
                    <Icon className="h-5 w-5" />
                  </div>
                  <div className="min-w-0">
                    <h2 className="text-base font-semibold text-[#233226] leading-tight">{meta.title}</h2>
                    <p className="mt-1 text-xs text-[#78897B]">{meta.questions.length} questions · 5–7 min</p>
                  </div>
                </div>

                {completed && (
                  <span className="shrink-0 inline-flex items-center gap-1 rounded-full bg-[#E8F0EA] px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-[#2F7F4C]">
                    <Check className="h-3 w-3" />
                    Done
                  </span>
                )}
              </div>

              <p className="pl-2 text-sm text-[#56685A] leading-relaxed flex-1">{meta.description}</p>

              <Link
                to={`/app/assessments/${type}`}
                className={`ml-2 inline-flex items-center justify-center rounded-xl py-2.5 text-xs font-semibold transition-colors ${
                  completed
                    ? 'border border-[#D9D2C5] bg-[#FAF7F2] text-[#3E4F42] hover:bg-[#F3EFE8]'
                    : 'bg-[#2C6E6A] text-white hover:bg-[#1E4E4B] shadow-xs'
                }`}
              >
                {completed ? 'Retake this check-in' : 'Start check-in'}
              </Link>
            </div>
          );
        })}
      </div>
    </div>
  );
}
