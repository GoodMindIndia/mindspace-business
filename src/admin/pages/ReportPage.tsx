import { useEffect, useState } from 'react';
import { ShieldCheck } from 'lucide-react';
import { useTenant } from '@/app/TenantContext';
import { ReportSkeleton } from '@/admin/widgets/PageHeading';
import { PageHero, HeroStat } from '@/components/PageHero';
import { LayoutDashboard } from 'lucide-react';
import { ChartCard } from '@/admin/charts/ChartCard';
import { StatTile } from '@/admin/charts/StatTile';
import { RankedBarChart } from '@/admin/charts/RankedBarChart';
import { StackedShareBar, type ShareSegment } from '@/admin/charts/StackedShareBar';
import { SmallMultiples } from '@/admin/charts/TrendChart';
import { formatCount, pctLabel } from '@/admin/charts/chart-theme';
import { bandColor } from '@/lib/viz-palette';
import { ASSESSMENT_TYPES, ASSESSMENT_METADATA, type AssessmentType } from '@/domain/assessments';
import { DEFAULT_K_ANONYMITY } from '@/domain/cohorts';
import { getOrgEmployeeStats, type OrgEmployeeStats } from '@/services/org-stats-service';
import { getOrgCreditBalance, type OrgCreditBalance } from '@/services/credit-service';
import { getOrgDailyMoodSummary, type DailyMoodSummary } from '@/services/mood-checkin-service';
import { MOOD_LABELS } from '@/domain/mood';
import {
  getOrgAssessmentBreakdown,
  getOrgBookingBreakdown,
  getOrgWeeklyTrend,
  type OrgAssessmentBreakdown,
  type OrgBookingBreakdown,
  type OrgWeeklyTrend,
  type DomainBreakdown,
  type BookingFormat,
  type WeeklyPoint,
} from '@/services/org-analytics-service';

const BOOKING_FORMATS: BookingFormat[] = ['group', '1:1'];
const FORMAT_LABEL: Record<BookingFormat, string> = { group: 'Group sessions', '1:1': '1:1 sessions' };

/** Short name for a tile value, in case a domain title ever grows an " Assessment" suffix. */
function shortDomain(type: AssessmentType): string {
  return ASSESSMENT_METADATA[type].title.replace(' Assessment', '');
}

/**
 * The HR landing screen — a key-metrics dashboard built entirely from the real
 * employee schema (profiles, assessment_records, therapy_bookings).
 *
 * Numbers lead, prose stays out of the way: every headline is a tile with its
 * own week-over-week movement, and every breakdown is a chart. Anything below
 * k people is withheld at the database, never estimated.
 */
export function ReportPage() {
  const { organization } = useTenant();
  const k = organization.policy.kAnonymity || DEFAULT_K_ANONYMITY;

  const [liveStats, setLiveStats] = useState<OrgEmployeeStats | null>(null);
  const [assessments, setAssessments] = useState<OrgAssessmentBreakdown | null>(null);
  const [bookings, setBookings] = useState<OrgBookingBreakdown | null>(null);
  const [trend, setTrend] = useState<OrgWeeklyTrend | null>(null);
  const [credits, setCredits] = useState<OrgCreditBalance | null>(null);
  const [moodToday, setMoodToday] = useState<DailyMoodSummary | null>(null);

  useEffect(() => {
    let cancelled = false;
    Promise.all([
      getOrgEmployeeStats(organization.orgId),
      getOrgAssessmentBreakdown(organization.orgId, k),
      getOrgBookingBreakdown(organization.orgId, k),
      getOrgWeeklyTrend(organization.orgId, 8),
      getOrgCreditBalance(organization.orgId),
      getOrgDailyMoodSummary(organization.orgId, k),
    ]).then(([stats, assessmentBreakdown, bookingBreakdown, weeklyTrend, creditBalance, dailyMood]) => {
      if (cancelled) return;
      setLiveStats(stats);
      setAssessments(assessmentBreakdown);
      setBookings(bookingBreakdown);
      setTrend(weeklyTrend);
      setCredits(creditBalance);
      setMoodToday(dailyMood);
    });

    const handleCreditsUpdate = (e: any) => {
      if (e.detail) setCredits(e.detail);
      else getOrgCreditBalance(organization.orgId).then(setCredits);
    };
    window.addEventListener('mindspace:credits-updated', handleCreditsUpdate);

    return () => {
      cancelled = true;
      window.removeEventListener('mindspace:credits-updated', handleCreditsUpdate);
    };
  }, [organization.orgId, k]);

  if (!liveStats || !assessments || !bookings || !trend || !credits || !moodToday) return <ReportSkeleton />;

  // ── Week-over-week movement, for the tile sparklines and deltas ────────────
  const weeks = trend.weeks;
  const last = weeks[weeks.length - 1];
  const prev = weeks[weeks.length - 2];
  const deltaOf = (key: keyof Omit<WeeklyPoint, 'label'>) =>
    last && prev ? last[key] - prev[key] : undefined;
  const sparkOf = (key: keyof Omit<WeeklyPoint, 'label'>) =>
    weeks.length > 1 ? weeks.map((w) => w[key]) : undefined;

  // ── Severity mix across every domain whose split is visible ────────────────
  const mix = { low: 0, moderate: 0, high: 0 };
  let scored = 0;
  for (const type of ASSESSMENT_TYPES) {
    const d = assessments.byDomain[type];
    if (d.levelMasked) continue;
    mix.low += d.low;
    mix.moderate += d.moderate;
    mix.high += d.high;
    scored += d.total;
  }
  const elevated = mix.moderate + mix.high;
  const elevatedShare = scored ? elevated / scored : 0;

  const mixSegments: ShareSegment[] = [
    { key: 'low', label: 'Low', count: mix.low, share: scored ? mix.low / scored : 0, color: bandColor('Low'), labelOnFill: 'light' },
    { key: 'moderate', label: 'Moderate', count: mix.moderate, share: scored ? mix.moderate / scored : 0, color: bandColor('Moderate'), labelOnFill: 'dark' },
    { key: 'high', label: 'High', count: mix.high, share: scored ? mix.high / scored : 0, color: bandColor('High'), labelOnFill: 'light' },
  ];

  // ── Ratios that turn raw counts into something a people team can act on ───
  const perPerson = liveStats.totalSignups ? liveStats.totalAssessments / liveStats.totalSignups : 0;
  const bookingRate = liveStats.totalSignups ? liveStats.totalBookings / liveStats.totalSignups : 0;

  const ranked = ASSESSMENT_TYPES.map((type) => ({ type, total: assessments.byDomain[type].total })).sort(
    (a, b) => b.total - a.total,
  );
  const topDomain = ranked[0];

  const bookingRows = BOOKING_FORMATS.map((format) => {
    const b = bookings.byFormat[format];
    return {
      label: FORMAT_LABEL[format],
      value: b.total,
      display: `${b.total} booked`,
      sub: b.statusMasked
        ? `Status withheld, fewer than ${k} bookings in this format`
        : `${b.requested} requested · ${b.confirmed} confirmed · ${b.cancelled} cancelled`,
    };
  });

  const moodRows = moodToday.byMood.map((m) => ({
    label: MOOD_LABELS[m.mood],
    value: m.n,
    display: `${m.n} people`,
  }));
  const moodMasked = moodToday.total > 0 && moodToday.byMood.length === 0;

  const weeklyData = weeks.map((w) => ({
    label: w.label,
    signups: w.signups,
    assessments: w.assessments,
    bookings: w.bookings,
  }));

  return (
    <div className="flex flex-col gap-8 pb-12">
      <PageHero
        eyebrow={`${organization.branding.appName} · Overview`}
        icon={LayoutDashboard}
        tone="green"
        badge={liveStats.live ? 'Live counts' : 'Not set up yet'}
        title="Your programme, in numbers"
        sub="Headcounts and rates only, never a name, never an individual score."
        aside={
          <div className="flex flex-row lg:flex-col gap-3">
            <HeroStat label="People signed up" value={formatCount(liveStats.totalSignups)} hint="active accounts" />
            <HeroStat label="Check-ins today" value={formatCount(moodToday.total)} hint="anonymous" />
          </div>
        }
      />

      {!liveStats.live && (
        <p className="rounded-2xl border border-[#DCD5C8] bg-[#F3EEE5] px-4 py-3 text-[11px] leading-relaxed text-[#9E6B38]">
          Run <code className="rounded bg-white/70 px-1 py-0.5">supabase/schema-employee.sql</code> and{' '}
          <code className="rounded bg-white/70 px-1 py-0.5">supabase/schema-employee-analytics.sql</code> in your
          Supabase project to turn this dashboard on.
        </p>
      )}

      {/* ── Key metrics ──────────────────────────────────────────────────── */}
      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <StatTile
          label="People signed up"
          value={formatCount(liveStats.totalSignups)}
          sub="Employee accounts created"
          delta={deltaOf('signups')}
          deltaLabel="vs last week"
          trend={sparkOf('signups')}
        />
        <StatTile
          label="Assessments taken"
          value={formatCount(liveStats.totalAssessments)}
          sub={`${perPerson.toFixed(1)} per person signed up`}
          delta={deltaOf('assessments')}
          deltaLabel="vs last week"
          trend={sparkOf('assessments')}
        />
        <StatTile
          label="Therapy sessions booked"
          value={formatCount(liveStats.totalBookings)}
          sub={`${pctLabel(bookingRate)} of people signed up`}
          delta={deltaOf('bookings')}
          deltaLabel="vs last week"
          trend={sparkOf('bookings')}
        />
        <StatTile
          label="Showing elevated signs"
          value={scored ? pctLabel(elevatedShare) : '–'}
          sub={scored ? `${elevated} of ${scored} assessments scored moderate or high` : 'Not enough responses yet'}
          upIsGood={false}
        />
        <StatTile
          label="Most-taken assessment"
          value={topDomain && topDomain.total > 0 ? shortDomain(topDomain.type) : '–'}
          sub={
            topDomain && topDomain.total > 0
              ? `${formatCount(topDomain.total)} taken of ${formatCount(liveStats.totalAssessments)} overall`
              : 'No responses yet'
          }
        />
        <StatTile
          label="Assessments this week"
          value={formatCount(last?.assessments ?? 0)}
          sub={`Across ${ranked.filter((r) => r.total > 0).length} of ${ASSESSMENT_TYPES.length} assessments`}
          delta={deltaOf('assessments')}
          deltaLabel="vs last week"
        />
        <StatTile
          label="Tara credits remaining"
          value={credits.live ? formatCount(credits.creditsRemaining) : '–'}
          sub={
            credits.live
              ? `${formatCount(credits.creditsUsed)} of ${formatCount(credits.totalCredits)} used · ${credits.planName} plan`
              : 'Not set up yet'
          }
          upIsGood
        />
      </section>

      {/* ── Today's mood pulse — how many checked in today, and how they feel ── */}
      <ChartCard
        title="Today's mood pulse"
        caption="Whoever picked a mood on their Hub today, counted once each. The breakdown is withheld until at least 5 people have checked in today; the count itself is always real."
        figure={
          <span className="text-[11px] text-[#78897B]">
            {formatCount(moodToday.total)} checked in today
          </span>
        }
        table={
          moodRows.length > 0
            ? { columns: ['Mood', 'People'], rows: moodRows.map((r) => [r.label, r.value]) }
            : undefined
        }
      >
        <NotLiveNote live={moodToday.live} schema="schema-daily-mood.sql" />
        {moodToday.live && moodToday.total === 0 && (
          <p className="text-[11px] text-[#9AA79C] italic py-2">Nobody has checked in yet today.</p>
        )}
        {moodToday.live && moodMasked && (
          <div className="flex items-center gap-1.5 h-11 rounded-lg border border-dashed border-[#D9D2C5] px-3 text-[11px] text-[#78897B]">
            <ShieldCheck className="h-3 w-3 shrink-0" aria-hidden />
            <span>Mood breakdown withheld, fewer than {k} people have checked in today.</span>
          </div>
        )}
        {moodToday.live && moodRows.length > 0 && <RankedBarChart data={moodRows} />}
      </ChartCard>

      {/* ── Overall severity mix — the one headline shape ────────────────── */}
      <ChartCard
        title="Overall severity mix"
        caption="Every completed assessment across all domains, by how it scored. Domains too small to split are left out of this bar and shown separately below."
        figure={
          <span className="text-[11px] text-[#78897B]">
            {formatCount(scored)} scored
          </span>
        }
        table={{
          columns: ['Band', 'Assessments', 'Share'],
          rows: mixSegments.map((s) => [s.label, s.count, pctLabel(s.share)]),
        }}
      >
        {scored > 0 ? (
          <StackedShareBar segments={mixSegments} total={scored} />
        ) : (
          <p className="text-[11px] text-[#9AA79C] italic py-2">
            No assessment has enough responses to show a severity split yet.
          </p>
        )}
      </ChartCard>

      {/* ── Breakdown by domain ───────────────────────────────────────────── */}
      <ChartCard
        title="Assessments, by domain"
        caption="How many people have taken each assessment. The low/moderate/high split is withheld for a domain fewer than 5 people have tried; the number taken is always shown."
        table={{
          columns: ['Assessment', 'Taken', 'Low', 'Moderate', 'High'],
          rows: ASSESSMENT_TYPES.map((type) => {
            const d = assessments.byDomain[type];
            return d.levelMasked
              ? [ASSESSMENT_METADATA[type].title, d.total, 'Withheld', 'Withheld', 'Withheld']
              : [ASSESSMENT_METADATA[type].title, d.total, d.low, d.moderate, d.high];
          }),
        }}
      >
        <div className="flex flex-col gap-5">
          <NotLiveNote live={assessments.live} />
          {ASSESSMENT_TYPES.map((type) => (
            <DomainSeverityRow key={type} type={type} breakdown={assessments.byDomain[type]} k={k} />
          ))}
        </div>
      </ChartCard>

      {/* ── Bookings ──────────────────────────────────────────────────────── */}
      <ChartCard
        title="Sessions booked, by format"
        caption="How people are choosing to get support. The requested/confirmed/cancelled split is withheld for a format fewer than 5 people have booked; the number booked is always shown."
        table={{
          columns: ['Format', 'Booked', 'Requested', 'Confirmed', 'Cancelled'],
          rows: BOOKING_FORMATS.map((format) => {
            const b = bookings.byFormat[format];
            return b.statusMasked
              ? [FORMAT_LABEL[format], b.total, 'Withheld', 'Withheld', 'Withheld']
              : [FORMAT_LABEL[format], b.total, b.requested, b.confirmed, b.cancelled];
          }),
        }}
      >
        <div className="flex flex-col gap-4">
          <NotLiveNote live={bookings.live} />
          <RankedBarChart data={bookingRows} />
        </div>
      </ChartCard>

      {/* ── Movement ──────────────────────────────────────────────────────── */}
      <ChartCard
        title="Last 8 weeks"
        caption="New sign-ups, assessments taken and sessions booked, week by week. All three panels share one scale, so they are directly comparable."
        table={{
          columns: ['Week', 'Sign-ups', 'Assessments', 'Bookings'],
          rows: weeks.map((w) => [w.label, w.signups, w.assessments, w.bookings]),
        }}
      >
        <div className="flex flex-col gap-4">
          <NotLiveNote live={trend.live} />
          {trend.live && weeklyData.length > 0 && (
            <SmallMultiples
              data={weeklyData}
              panels={[
                { key: 'signups', title: 'Sign-ups' },
                { key: 'assessments', title: 'Assessments' },
                { key: 'bookings', title: 'Bookings' },
              ]}
            />
          )}
        </div>
      </ChartCard>

      <footer className="flex flex-wrap items-center gap-x-2 gap-y-1 pt-2 text-[11px] text-[#78897B]">
        <ShieldCheck className="h-3.5 w-3.5" aria-hidden />
        <span>
          Every number here is a headcount, never a name. Groups smaller than {k} are withheld everywhere on this
          page.
        </span>
      </footer>
    </div>
  );
}

/** Distinguishes "genuinely zero" from "this RPC hasn't been deployed yet" —
 * without it the two look identical and read as a broken dashboard. */
function NotLiveNote({ live, schema = 'schema-employee-analytics.sql' }: { live: boolean; schema?: string }) {
  if (live) return null;
  return (
    <p className="flex items-center gap-1.5 text-[11px] text-[#9E6B38]">
      <ShieldCheck className="h-3 w-3 shrink-0" aria-hidden />
      <span>
        Not set up yet. Run <code className="rounded bg-[#F3EEE5] px-1 py-0.5">supabase/{schema}</code> in your
        Supabase project to turn this on.
      </span>
    </p>
  );
}

function DomainSeverityRow({ type, breakdown, k }: { type: AssessmentType; breakdown: DomainBreakdown; k: number }) {
  const meta = ASSESSMENT_METADATA[type];
  const segments: ShareSegment[] = [
    {
      key: 'low',
      label: 'Low',
      count: breakdown.low,
      share: breakdown.total ? breakdown.low / breakdown.total : 0,
      color: bandColor('Low'),
      labelOnFill: 'light',
    },
    {
      key: 'moderate',
      label: 'Moderate',
      count: breakdown.moderate,
      share: breakdown.total ? breakdown.moderate / breakdown.total : 0,
      color: bandColor('Moderate'),
      labelOnFill: 'dark',
    },
    {
      key: 'high',
      label: 'High',
      count: breakdown.high,
      share: breakdown.total ? breakdown.high / breakdown.total : 0,
      color: bandColor('High'),
      labelOnFill: 'light',
    },
  ];

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-baseline justify-between gap-2">
        <span className="text-sm font-medium text-[#233226]">{meta.title}</span>
        <span className="text-[11px] text-[#78897B] tabular-nums">{formatCount(breakdown.total)} taken</span>
      </div>
      {breakdown.levelMasked ? (
        <div className="flex items-center gap-1.5 h-11 rounded-lg border border-dashed border-[#D9D2C5] px-3 text-[11px] text-[#78897B]">
          <ShieldCheck className="h-3 w-3 shrink-0" aria-hidden />
          <span>Severity split withheld, fewer than {k} people have taken this.</span>
        </div>
      ) : breakdown.total === 0 ? (
        <p className="text-[11px] text-[#9AA79C] italic py-2">No responses yet.</p>
      ) : (
        <StackedShareBar segments={segments} total={breakdown.total} />
      )}
    </div>
  );
}
