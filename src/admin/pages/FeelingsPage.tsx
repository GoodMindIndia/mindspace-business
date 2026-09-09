import { useMemo } from 'react';
import { useReport } from '@/admin/ReportContext';
import { ReportSkeleton, NotEnoughAssessmentData } from '@/admin/widgets/PageHeading';
import { PageHero } from '@/components/PageHero';
import { Smile } from 'lucide-react';
import { PeopleGrid } from '@/admin/widgets/PeopleGrid';
import { ChartCard } from '@/admin/charts/ChartCard';
import { StatTile } from '@/admin/charts/StatTile';
import { StackedShareBar } from '@/admin/charts/StackedShareBar';
import { RankedBarChart } from '@/admin/charts/RankedBarChart';
import { SmallMultiples } from '@/admin/charts/TrendChart';
import { TIER_VAR, pctLabel } from '@/admin/charts/chart-theme';
import { getWellbeingTrend } from '@/services/trend-service';
import { CHECK_IN_DOMAINS } from '@/domain/check-in';
import { ASSESSMENT_METADATA } from '@/domain/assessments';
import type { MoodTier } from '@/domain/snapshot';

const TIER_LABEL_INK: Record<MoodTier, 'light' | 'dark'> = {
  thriving: 'light',
  steady: 'dark',
  strained: 'dark',
  struggling: 'light',
};

export function FeelingsPage() {
  const { report, snapshot, loading, notEnoughData } = useReport();
  const trend = useMemo(() => getWellbeingTrend(), []);

  if (loading) return <ReportSkeleton />;
  if (notEnoughData || !report || !snapshot) return <NotEnoughAssessmentData />;

  const responses = report.meta.responses;
  const underStrain = report.howPeopleFeel
    .filter((t) => t.tier === 'strained' || t.tier === 'struggling')
    .reduce((n, t) => n + t.peopleCount, 0);
  const struggling = report.howPeopleFeel.find((t) => t.tier === 'struggling')?.peopleCount ?? 0;
  const thriving = report.howPeopleFeel.find((t) => t.tier === 'thriving')?.peopleCount ?? 0;

  const segments = report.howPeopleFeel.map((t) => ({
    key: t.tier,
    label: t.label,
    count: t.peopleCount,
    share: t.share,
    color: TIER_VAR[t.tier as MoodTier],
    labelOnFill: TIER_LABEL_INK[t.tier as MoodTier],
  }));

  const visibleTeams = snapshot.teams.filter((t) => !t.masked);
  const avgStrain =
    visibleTeams.reduce((s, t) => s + t.strainShare, 0) / Math.max(1, visibleTeams.length);
  const maskedTeams = snapshot.teams.length - visibleTeams.length;
  const teamsAboveAvg = visibleTeams.filter((t) => t.strainShare > avgStrain).length;
  const hardest = snapshot.toughestSignals[0];

  // Per-domain severity over the quarter, faceted rather than drawn as three
  // converging lines on one axis.
  const domainPanels = CHECK_IN_DOMAINS.map((domain) => ({
    key: domain,
    title: ASSESSMENT_METADATA[domain].title.replace(' Assessment', ''),
  }));
  const domainSeries = trend.map((p) => ({
    label: p.label,
    ...Object.fromEntries(CHECK_IN_DOMAINS.map((d) => [d, Math.round(p.domainMeans[d] ?? 0)])),
  }));

  return (
    <div className="flex flex-col gap-8 pb-12">
      <PageHero
        eyebrow={`How people feel · ${report.meta.orgName}`}
        icon={Smile}
        tone="green"
        badge="Aggregate only"
        title="Four groups, not one average"
        sub="An average hides the people at the edges. These are the four groups behind it, and each one needs a different response from you."
      />

      {/* ── Key metrics ──────────────────────────────────────────────────── */}
      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatTile
          label="Stretched or worse"
          value={pctLabel(underStrain / Math.max(1, responses))}
          sub={`${underStrain} of ${responses} people who answered`}
          upIsGood={false}
        />
        <StatTile
          label="Needing real support"
          value={String(struggling)}
          sub="In the hardest-hit group"
          upIsGood={false}
        />
        <StatTile
          label="Teams above average strain"
          value={String(teamsAboveAvg)}
          sub={`Of ${visibleTeams.length} teams · average ${pctLabel(avgStrain)}`}
          upIsGood={false}
        />
        <StatTile
          label="Coping well"
          value={pctLabel(thriving / Math.max(1, responses))}
          sub={`${thriving} people in the healthiest group`}
        />
      </section>

      {/* Distribution */}
      <ChartCard
        title="Where everyone sits"
        caption="Left to right: coping, then under strain. Each group needs a different response from you."
        table={{
          columns: ['Group', 'People', 'Share'],
          rows: report.howPeopleFeel.map((t) => [t.label, t.peopleCount, `${Math.round(t.share * 100)}%`]),
        }}
      >
        <div className="flex flex-col gap-7">
          <StackedShareBar segments={segments} total={responses} />
          <div className="border-t border-[#EAE4D9] pt-6">
            <PeopleGrid segments={report.howPeopleFeel} />
            <p className="mt-3 text-[11px] text-[#78897B]">Each figure is one percent of everyone who answered.</p>
          </div>
        </div>
      </ChartCard>

      {/* Tier tiles — the number leads, the swatch ties each one back to the
          bar above. No paragraphs: the split is the point. */}
      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {report.howPeopleFeel.map((t) => (
          <div
            key={t.tier}
            className="rounded-[22px] bg-white p-5 border border-[#EAE4D9] shadow-xs flex flex-col gap-2"
          >
            <div className="flex items-center gap-2">
              <span
                className="h-2.5 w-2.5 rounded-full shrink-0"
                style={{ backgroundColor: TIER_VAR[t.tier as MoodTier] }}
                aria-hidden
              />
              <p className="text-[11px] font-medium text-[#78897B] leading-snug">{t.label}</p>
            </div>
            <p className="text-3xl font-semibold tracking-tight text-[#233226] leading-none">
              {Math.round(t.share * 100)}%
            </p>
            <p className="text-[11px] text-[#78897B]">
              ~{t.peopleCount} {t.peopleCount === 1 ? 'person' : 'people'} of {responses}
            </p>
          </div>
        ))}
      </section>

      {/* Team strain */}
      <ChartCard
        title="Strain by team"
        caption="Share of each team stretched or worse. The dashed line is the company average; teams to the right of it are carrying more than their share."
        masked={{ k: 5, hiddenCount: maskedTeams }}
        table={{
          columns: ['Team', 'Responses', 'Under strain'],
          rows: snapshot.teams.map((t) =>
            t.masked ? [t.team, 'Withheld', 'Withheld'] : [t.team, t.responses, pctLabel(t.strainShare)],
          ),
        }}
      >
        <RankedBarChart
          maxValue={1}
          reference={{ value: avgStrain, label: `Company average, ${Math.round(avgStrain * 100)}%` }}
          data={snapshot.teams.map((t) => ({
            label: t.team,
            value: t.strainShare,
            display: pctLabel(t.strainShare),
            masked: t.masked,
            sub: t.masked
              ? undefined
              : `${t.responses} responses${t.topFeeling ? ` · mostly ${t.topFeeling.toLowerCase()}` : ''}`,
          }))}
        />
      </ChartCard>

      {/* Domain trends */}
      <ChartCard
        title="Each domain over the quarter"
        caption="Mean severity out of 100 for the three modules the check-in runs. Higher is worse."
        table={{
          columns: ['Week', ...domainPanels.map((p) => p.title)],
          rows: domainSeries.map((row) => [
            String(row.label),
            ...domainPanels.map((p) => Number(row[p.key as keyof typeof row] ?? 0)),
          ]),
        }}
      >
        <SmallMultiples
          panels={domainPanels}
          data={domainSeries}
          note="All three panels share one scale, so they are directly comparable."
        />
      </ChartCard>

      {/* Hardest items */}
      {snapshot.toughestSignals.length > 0 && (
        <ChartCard
          title="The questions people answer worst"
          caption="Share answering “often” or “almost everyday”. This is the layer that turns “morale is down” into “people aren't sleeping”."
          figure={
            hardest ? (
              <span className="text-[11px] text-[#78897B]">
                Worst · <span className="font-semibold text-[#233226]">{pctLabel(hardest.share)}</span>
              </span>
            ) : undefined
          }
          table={{
            columns: ['Question', 'Struggling'],
            rows: snapshot.toughestSignals.map((s) => [s.question, pctLabel(s.share)]),
          }}
        >
          <RankedBarChart
            maxValue={1}
            emphasiseFirst
            data={snapshot.toughestSignals.map((s) => ({
              label: s.question,
              value: s.share,
              display: pctLabel(s.share),
              sub: ASSESSMENT_METADATA[s.domain]?.title.replace(' Assessment', ''),
            }))}
          />
        </ChartCard>
      )}
    </div>
  );
}
