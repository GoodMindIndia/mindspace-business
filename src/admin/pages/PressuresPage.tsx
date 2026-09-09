import { Lightbulb } from 'lucide-react';
import { useReport } from '@/admin/ReportContext';
import { ReportSkeleton, NotEnoughAssessmentData } from '@/admin/widgets/PageHeading';
import { PageHero } from '@/components/PageHero';
import { AlertTriangle } from 'lucide-react';
import { MagnitudeBar } from '@/admin/widgets/ProportionBar';
import { ChartCard } from '@/admin/charts/ChartCard';
import { StatTile } from '@/admin/charts/StatTile';
import { RankedBarChart } from '@/admin/charts/RankedBarChart';
import { StackedShareBar, type ShareSegment } from '@/admin/charts/StackedShareBar';
import { pctLabel } from '@/admin/charts/chart-theme';
import { SEVERITY_COLOR, SEVERITY_LABEL } from '@/lib/tier';

type Severity = 'low' | 'moderate' | 'high';
const SEVERITY_ORDER: Severity[] = ['high', 'moderate', 'low'];

export function PressuresPage() {
  const { report, loading, notEnoughData } = useReport();
  if (loading) return <ReportSkeleton />;
  if (notEnoughData || !report) return <NotEnoughAssessmentData />;

  const pressures = report.whatsWeighing;
  const top = pressures[0];

  // How the pressures split by urgency — the shape that says whether this is a
  // handful of acute problems or broad low-grade friction.
  const byUrgency = SEVERITY_ORDER.map((sev) => ({
    sev,
    count: pressures.filter((p) => p.severity === sev).length,
  }));
  const urgencySegments: ShareSegment[] = byUrgency.map((u) => ({
    key: u.sev,
    label: SEVERITY_LABEL[u.sev],
    count: u.count,
    share: pressures.length ? u.count / pressures.length : 0,
    color: SEVERITY_COLOR[u.sev],
    labelOnFill: u.sev === 'moderate' ? 'dark' : 'light',
  }));

  const urgentCount = pressures.filter((p) => p.severity === 'high').length;
  const meanReach = pressures.length
    ? pressures.reduce((s, p) => s + p.share, 0) / pressures.length
    : 0;

  return (
    <div className="flex flex-col gap-8 pb-12">
      <PageHero
        eyebrow={`What is weighing · ${report.meta.orgName}`}
        icon={AlertTriangle}
        tone="green"
        badge="Root causes"
        title="The reasons behind the mood"
        sub="Ranked by how many people raised each pressure. Reach and urgency are two different questions: a pressure can be everywhere and mild, or narrow and acute."
      />

      {/* ── Key metrics ──────────────────────────────────────────────────── */}
      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatTile label="Pressures tracked" value={String(pressures.length)} sub="Named in this cycle's report" />
        <StatTile
          label="Most widespread"
          value={top ? pctLabel(top.share) : '–'}
          sub={top ? top.title : 'No pressures reported'}
          upIsGood={false}
        />
        <StatTile
          label="Marked urgent"
          value={String(urgentCount)}
          sub={`Of ${pressures.length} pressures · needs action now`}
          upIsGood={false}
        />
        <StatTile
          label="Average reach"
          value={pctLabel(meanReach)}
          sub="Typical share of people per pressure"
          upIsGood={false}
        />
      </section>

      {/* The ranking, at a glance. Bar length is reach; colour is severity —
          two independent facts, so colour isn't restating the bar. Severity
          always ships with its label beside it, never as colour alone. */}
      <ChartCard
        title="Every pressure, ranked by reach"
        caption="How much of the workforce raised each one. Colour marks how urgent it is, which is not the same question as how widespread."
        table={{
          columns: ['Pressure', 'Affected', 'Share', 'Urgency'],
          rows: pressures.map((p) => [p.title, p.affected, pctLabel(p.share), SEVERITY_LABEL[p.severity]]),
        }}
      >
        <RankedBarChart
          maxValue={1}
          data={pressures.map((p) => ({
            label: p.title,
            value: p.share,
            display: `${Math.round(p.share * 100)}% · ~${p.affected}`,
            color: SEVERITY_COLOR[p.severity],
            status: SEVERITY_LABEL[p.severity],
            sub: p.whoMostly.length > 0 ? `Most reported in ${p.whoMostly.join(', ')}` : undefined,
          }))}
        />
      </ChartCard>

      {/* ── Urgency mix ──────────────────────────────────────────────────── */}
      <ChartCard
        title="Split by urgency"
        caption="Whether you are dealing with a few acute problems or broad low-grade friction, the two need very different responses."
        table={{
          columns: ['Urgency', 'Pressures', 'Share'],
          rows: urgencySegments.map((s) => [s.label, s.count, pctLabel(s.share)]),
        }}
      >
        {pressures.length > 0 ? (
          <StackedShareBar segments={urgencySegments} total={pressures.length} />
        ) : (
          <p className="text-[11px] text-[#9AA79C] italic py-2">No pressures reported this cycle.</p>
        )}
      </ChartCard>

      {/* ── Per-pressure detail, compact ─────────────────────────────────── */}
      <section className="grid gap-4 sm:grid-cols-2">
        {pressures.map((p, i) => {
          const pct = Math.round(p.share * 100);
          return (
            <article
              key={p.title}
              className="rounded-[24px] bg-white p-6 border border-[#EAE4D9] shadow-xs flex flex-col gap-4"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-2.5 min-w-0">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#F3EEE5] text-[11px] font-bold text-[#2D6A4F]">
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  <h2 className="font-serif text-lg font-normal text-[#233226] truncate">{p.title}</h2>
                </div>
                <span className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-[#D9D2C5] bg-[#FAF7F2] px-2.5 py-0.5 text-[10px] font-medium text-[#3E4F42]">
                  <span
                    className="h-2 w-2 rounded-full"
                    style={{ backgroundColor: SEVERITY_COLOR[p.severity] }}
                    aria-hidden
                  />
                  {SEVERITY_LABEL[p.severity]}
                </span>
              </div>

              {/* The number leads, the bar carries the proportion. */}
              <div className="flex flex-col gap-2">
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-semibold tracking-tight text-[#233226] leading-none">{pct}%</span>
                  <span className="text-[11px] text-[#78897B]">~{p.affected} people</span>
                </div>
                <MagnitudeBar share={p.share} color={SEVERITY_COLOR[p.severity]} label={`${pct}% of people`} />
              </div>

              {/* One line of cause — the only prose that earns its place, because
                  a bar cannot say what to fix. */}
              <div className="mt-auto rounded-xl bg-[#FAF7F2] p-3.5 border border-[#EAE4D9]">
                <p className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-[#78897B]">
                  <Lightbulb className="h-3 w-3 text-[#9E6B38]" aria-hidden />
                  LIKELY CAUSE
                </p>
                <p className="mt-1 text-xs font-medium text-[#233226] leading-relaxed">{p.rootCause}</p>
              </div>

              {p.whoMostly.length > 0 && (
                <div className="flex flex-wrap items-center gap-1.5">
                  <span className="text-[10px] font-medium text-[#78897B]">Most in</span>
                  {p.whoMostly.map((team) => (
                    <span
                      key={team}
                      className="rounded-full bg-[#FAF7F2] border border-[#D9D2C5] px-2 py-0.5 text-[10px] font-medium text-[#3E4F42]"
                    >
                      {team}
                    </span>
                  ))}
                </div>
              )}
            </article>
          );
        })}
      </section>
    </div>
  );
}
