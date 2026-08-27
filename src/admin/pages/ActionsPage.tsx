import { useEffect, useState } from 'react';
import { useReport } from '@/admin/ReportContext';
import { useTenant } from '@/app/TenantContext';
import { ReportSkeleton, NotEnoughAssessmentData } from '@/admin/widgets/PageHeading';
import { ChartCard } from '@/admin/charts/ChartCard';
import { StatTile } from '@/admin/charts/StatTile';
import { StackedShareBar, type ShareSegment } from '@/admin/charts/StackedShareBar';
import { RankedBarChart } from '@/admin/charts/RankedBarChart';
import { pctLabel, ORDINAL_RAMP } from '@/admin/charts/chart-theme';
import { EFFORT_LABEL } from '@/lib/tier';
import { getOrgWorkshopRequestSummary, type WorkshopRequestSummary } from '@/services/workshop-service';

type Effort = 'low' | 'medium' | 'high';
const EFFORT_ORDER: Effort[] = ['low', 'medium', 'high'];

/** Effort is an *ordered* scale (quick → a real project), so it gets the
 * single-hue ordinal ramp rather than three unrelated categorical colours. */
const EFFORT_COLOR: Record<Effort, string> = {
  low: ORDINAL_RAMP[0],
  medium: ORDINAL_RAMP[1],
  high: ORDINAL_RAMP[2],
};

// Workshop requests are a suggestion box, not clinical data — HR never sees
// who asked (the table is owner-only RLS; this RPC only ever returns a topic
// and a count), so unlike assessment/mood aggregates there's no identity risk
// in naming a topic that only one person has requested. Masking it as "Other"
// below the org's k-anonymity threshold just made the feature look broken for
// any team smaller than that threshold.
const WORKSHOP_TOPIC_MIN_COUNT = 1;

export function ActionsPage() {
  const { report, loading, notEnoughData } = useReport();
  const { organization } = useTenant();
  const [workshopRequests, setWorkshopRequests] = useState<WorkshopRequestSummary | null>(null);

  useEffect(() => {
    let cancelled = false;
    getOrgWorkshopRequestSummary(organization.orgId, WORKSHOP_TOPIC_MIN_COUNT).then((summary) => {
      if (!cancelled) setWorkshopRequests(summary);
    });
    return () => {
      cancelled = true;
    };
  }, [organization.orgId]);

  if (loading) return <ReportSkeleton />;

  const changes = report?.cultureChanges ?? [];
  const activities = report?.activities ?? [];

  const byEffort = EFFORT_ORDER.map((effort) => ({
    effort,
    count: changes.filter((c) => c.effort === effort).length,
  }));
  const effortSegments: ShareSegment[] = byEffort.map((e) => ({
    key: e.effort,
    label: EFFORT_LABEL[e.effort],
    count: e.count,
    share: changes.length ? e.count / changes.length : 0,
    color: EFFORT_COLOR[e.effort],
    labelOnFill: e.effort === 'low' ? 'dark' : 'light',
  }));

  const quickWins = changes.filter((c) => c.effort === 'low').length;
  const therapistLed = activities.filter((a) => a.therapistLed).length;
  const totalSteps = changes.reduce((s, c) => s + c.how.length, 0);

  return (
    <div className="flex flex-col gap-8 pb-12">
      {/* Header */}
      <header className="flex flex-col gap-1.5">
        <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#78897B]">
          ACTION ITEMS · {organization.name.toUpperCase()}
        </p>
        <h1 className="font-serif text-3xl sm:text-4xl font-normal tracking-tight text-[#233226] mt-1">
          Two kinds of fix, and you need both
        </h1>
        <p className="max-w-2xl text-xs sm:text-sm text-[#56685A] leading-relaxed mt-1">
          Changing how work happens stops the pressure being created. Running sessions helps the people already
          carrying it. Doing only the second is how wellbeing programmes get a reputation for being decoration.
        </p>
      </header>

      {notEnoughData || !report ? (
        <NotEnoughAssessmentData />
      ) : (
        <>
          {/* ── Key metrics ──────────────────────────────────────────────── */}
          <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatTile
              label="Changes recommended"
              value={String(changes.length)}
              sub={`${totalSteps} concrete steps in total`}
            />
            <StatTile
              label="Quick wins"
              value={String(quickWins)}
              sub="Doable without extra budget or coordination"
            />
            <StatTile
              label="Sessions available"
              value={String(activities.length)}
              sub="Matched to this cycle's findings"
            />
            <StatTile
              label="Therapist-led"
              value={String(therapistLed)}
              sub={`Of ${activities.length} sessions · rest are team rituals`}
            />
          </section>

          {/* ── Effort mix ─────────────────────────────────────────────────── */}
          <ChartCard
            title="How much lift each change needs"
            caption="If most of the bar sits at the light end, this cycle's fixes are mostly scheduling and habit, not headcount or budget."
            table={{
              columns: ['Effort', 'Changes', 'Share'],
              rows: effortSegments.map((s) => [s.label, s.count, pctLabel(s.share)]),
            }}
          >
            {changes.length > 0 ? (
              <StackedShareBar segments={effortSegments} total={changes.length} />
            ) : (
              <p className="text-[11px] text-[#9AA79C] italic py-2">No changes recommended this cycle.</p>
            )}
          </ChartCard>

          {/* ── Part One: policy & culture changes, compact ─────────────────── */}
          <section className="flex flex-col gap-5">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-[#78897B]">PART ONE</p>
              <h2 className="font-serif text-2xl font-normal tracking-tight text-[#233226] mt-0.5">
                Change how the work happens
              </h2>
            </div>

            <div className="grid gap-4 lg:grid-cols-2">
              {changes.map((c, i) => (
                <article
                  key={c.title}
                  className="rounded-[24px] bg-white border border-[#EAE4D9] shadow-xs p-6 flex flex-col gap-4"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3 min-w-0">
                      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#2D6A4F] text-[11px] font-bold text-white mt-0.5">
                        {i + 1}
                      </span>
                      <h3 className="font-serif text-lg font-normal text-[#233226] leading-snug">{c.title}</h3>
                    </div>
                    <span className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-[#D9D2C5] bg-[#FAF7F2] px-2.5 py-0.5 text-[10px] font-medium text-[#3E4F42]">
                      <span
                        className="h-2 w-2 rounded-full"
                        style={{ backgroundColor: EFFORT_COLOR[c.effort] }}
                        aria-hidden
                      />
                      {EFFORT_LABEL[c.effort]}
                    </span>
                  </div>

                  <ul className="flex flex-col gap-1.5 text-xs leading-relaxed text-[#3E4F42]">
                    {c.how.map((step, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[#2D6A4F]" />
                        <span>{step}</span>
                      </li>
                    ))}
                  </ul>

                  <div className="mt-auto rounded-xl bg-[#FAF7F2] p-3.5 border border-[#EAE4D9]">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-[#78897B]">EXPECTED OUTCOME</p>
                    <p className="mt-1 text-xs leading-relaxed text-[#3E4F42]">{c.expected}</p>
                  </div>
                </article>
              ))}
            </div>
          </section>

          {/* ── Part Two: sessions & rituals, compact ───────────────────────── */}
          <section className="flex flex-col gap-5">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-[#78897B]">PART TWO</p>
              <h2 className="font-serif text-2xl font-normal tracking-tight text-[#233226] mt-0.5">
                Support the people carrying the weight
              </h2>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {activities.map((s) => (
                <article
                  key={s.title}
                  className="rounded-[24px] bg-white border border-[#EAE4D9] shadow-xs p-6 flex flex-col gap-3"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="rounded-full bg-[#FAF7F2] border border-[#D9D2C5] px-2.5 py-0.5 text-[10px] font-semibold text-[#2D6A4F]">
                      {s.format}
                    </span>
                    <span className="text-[10px] text-[#78897B]">{s.cadence}</span>
                  </div>

                  <h3 className="font-serif text-lg font-normal text-[#233226] leading-snug">{s.title}</h3>
                  <p className="text-xs text-[#56685A] leading-relaxed">{s.outcome}</p>

                  <div className="mt-auto border-t border-[#EAE4D9] pt-3 flex items-center justify-between text-[10px]">
                    <span className="text-[#78897B]">
                      {s.therapistLed ? 'Therapist-led · Complimentary' : 'Team ritual · Zero budget'}
                    </span>
                    <span className="font-semibold text-[#2D6A4F]">Ready</span>
                  </div>
                </article>
              ))}
            </div>
          </section>
        </>
      )}

      {/* ── Real signal: what employees are asking for next ───────────────── */}
      <ChartCard
        title="Workshop requests from employees"
        caption="Topic counts only, HR never sees who asked. Use it to plan the next session, or bring it to MindSpace."
        figure={
          workshopRequests?.live ? (
            <span className="text-[11px] text-[#78897B]">
              {workshopRequests.byTopic.reduce((s, t) => s + t.total, 0)} requests
            </span>
          ) : undefined
        }
        table={
          workshopRequests?.live
            ? { columns: ['Topic', 'Requests'], rows: workshopRequests.byTopic.map((t) => [t.topic, t.total]) }
            : undefined
        }
      >
        {!workshopRequests?.live ? (
          <p className="text-[11px] text-[#9AA79C] italic py-2">
            Not set up yet. Run <code className="rounded bg-[#F3EEE5] px-1 py-0.5">supabase/schema-credits-workshops.sql</code>{' '}
            in your Supabase project to turn this on.
          </p>
        ) : workshopRequests.byTopic.length === 0 ? (
          <p className="text-[11px] text-[#9AA79C] italic py-2">No workshop requests yet.</p>
        ) : (
          <RankedBarChart data={workshopRequests.byTopic.map((t) => ({ label: t.topic, value: t.total, display: `${t.total} requests` }))} />
        )}
      </ChartCard>
    </div>
  );
}
