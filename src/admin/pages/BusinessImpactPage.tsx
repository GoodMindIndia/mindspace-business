import { Sparkles } from 'lucide-react';
import { useTenant } from '@/app/TenantContext';
import { ChartCard } from '@/admin/charts/ChartCard';
import { StatTile } from '@/admin/charts/StatTile';
import { PageHero } from '@/components/PageHero';
import { LineChart } from 'lucide-react';
import { TrendChart } from '@/admin/charts/TrendChart';
import { RankedBarChart, type RankedBarDatum } from '@/admin/charts/RankedBarChart';
import { MAGNITUDE_HUE, TREND_HUE } from '@/admin/charts/chart-theme';

/**
 * Illustrative business-outcome data — absenteeism, productivity, attrition,
 * overtime. None of this reads from Supabase: the org's leave/HRIS/productivity
 * systems aren't connected yet, so there is nothing live to show. The shape
 * mirrors what the connected version will look like once that data exists,
 * so the sample is honest about being a preview, not a live counter.
 */
const MONTHS = ['Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug'];

const ABSENTEEISM_RATE = [6.8, 6.3, 5.7, 5.1, 4.6, 4.1]; // % of workdays lost to unplanned leave
const PRODUCTIVITY_INDEX = [7.1, 7.3, 7.5, 7.7, 7.9, 8.2]; // manager-rated output score, 0–10
const SICK_LEAVE_DAYS = [1.8, 1.6, 1.5, 1.3, 1.1, 0.9]; // avg sick days per employee per month
const ATTRITION_RATE = [14.2, 13.5, 12.8, 11.9, 11.2, 10.4]; // voluntary attrition, trailing 12mo %
const OVERTIME_HOURS = [5.4, 5.0, 4.6, 4.1, 3.6, 3.2]; // avg overtime hours per employee per week

const trendSeries = (values: number[]) => MONTHS.map((label, i) => ({ label, value: values[i] }));

const BEFORE_AFTER: { label: string; before: number; after: number; unit: string; upIsGood: boolean }[] = [
  { label: 'Absenteeism rate', before: 7.4, after: 4.1, unit: '%', upIsGood: false },
  { label: 'Productivity index', before: 6.6, after: 8.2, unit: '/10', upIsGood: true },
  { label: 'Voluntary attrition', before: 16.8, after: 10.4, unit: '%', upIsGood: false },
  { label: 'Avg sick leave days', before: 2.4, after: 0.9, unit: '/mo', upIsGood: false },
];

const PRODUCTIVITY_BY_DEPT: RankedBarDatum[] = [
  { label: 'Operations', value: 31, display: '+31%' },
  { label: 'Customer Support', value: 27, display: '+27%' },
  { label: 'Engineering', value: 22, display: '+22%' },
  { label: 'Sales', value: 18, display: '+18%' },
  { label: 'Finance', value: 15, display: '+15%' },
];

/**
 * The page HR actually opens this console for: not "how is the wellbeing
 * programme being used", but "is it moving the business" — fewer sick days,
 * higher output, people staying. Sample data throughout, clearly labelled,
 * until the org's leave and productivity systems are connected.
 */
export function BusinessImpactPage() {
  const { organization } = useTenant();

  const latestAbsenteeism = ABSENTEEISM_RATE[ABSENTEEISM_RATE.length - 1];
  const prevAbsenteeism = ABSENTEEISM_RATE[ABSENTEEISM_RATE.length - 2];
  const latestProductivity = PRODUCTIVITY_INDEX[PRODUCTIVITY_INDEX.length - 1];
  const prevProductivity = PRODUCTIVITY_INDEX[PRODUCTIVITY_INDEX.length - 2];
  const latestSickDays = SICK_LEAVE_DAYS[SICK_LEAVE_DAYS.length - 1];
  const prevSickDays = SICK_LEAVE_DAYS[SICK_LEAVE_DAYS.length - 2];
  const latestAttrition = ATTRITION_RATE[ATTRITION_RATE.length - 1];
  const prevAttrition = ATTRITION_RATE[ATTRITION_RATE.length - 2];

  return (
    <div className="flex flex-col gap-8 pb-12">
      <PageHero
        eyebrow={`${organization.branding.appName} · Business impact`}
        icon={LineChart}
        tone="green"
        badge="Sample data"
        title="What this is doing for the business"
        sub="Absenteeism, productivity, and retention, set against where things stood before the programme."
      />

      <p className="rounded-2xl border border-[#DCD5C8] bg-[#F3EEE5] px-4 py-3 text-[11px] leading-relaxed text-[#78897B]">
        Illustrative. Connect your leave and performance systems to replace these with real numbers.
      </p>

      {/* ── Key metrics ──────────────────────────────────────────────────── */}
      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatTile
          label="Absenteeism rate"
          value={`${latestAbsenteeism}%`}
          sub="of scheduled workdays"
          delta={Math.round((latestAbsenteeism - prevAbsenteeism) * 10) / 10}
          deltaLabel="vs last month"
          upIsGood={false}
          trend={ABSENTEEISM_RATE}
        />
        <StatTile
          label="Productivity index"
          value={`${latestProductivity.toFixed(1)}/10`}
          sub="manager-rated output score"
          delta={Math.round((latestProductivity - prevProductivity) * 10) / 10}
          deltaLabel="vs last month"
          upIsGood
          trend={PRODUCTIVITY_INDEX}
        />
        <StatTile
          label="Sick leave, per employee"
          value={`${latestSickDays.toFixed(1)} days`}
          sub="average this month"
          delta={Math.round((latestSickDays - prevSickDays) * 10) / 10}
          deltaLabel="vs last month"
          upIsGood={false}
          trend={SICK_LEAVE_DAYS}
        />
        <StatTile
          label="Voluntary attrition"
          value={`${latestAttrition}%`}
          sub="trailing 12 months"
          delta={Math.round((latestAttrition - prevAttrition) * 10) / 10}
          deltaLabel="vs last month"
          upIsGood={false}
          trend={ATTRITION_RATE}
        />
      </section>

      {/* ── Since adopting the programme ────────────────────────────────── */}
      <ChartCard
        title="Since adopting the programme"
        caption="Where these numbers stood the quarter before rollout, against where they stand now."
        table={{
          columns: ['Metric', 'Before', 'Now', 'Change'],
          rows: BEFORE_AFTER.map((m) => {
            const change = m.after - m.before;
            const pct = Math.round((change / m.before) * 100);
            return [m.label, `${m.before}${m.unit}`, `${m.after}${m.unit}`, `${pct > 0 ? '+' : ''}${pct}%`];
          }),
        }}
      >
        <div className="grid gap-5 sm:grid-cols-2">
          {BEFORE_AFTER.map((m) => {
            const change = m.after - m.before;
            const pct = Math.round((change / m.before) * 100);
            const good = (change > 0) === m.upIsGood;
            return (
              <div key={m.label} className="flex flex-col gap-2 rounded-2xl border border-[#EAE4D9] p-4">
                <span className="text-xs font-medium text-[#233226]">{m.label}</span>
                <div className="flex items-baseline gap-2">
                  <span className="text-sm text-[#9AA79C] line-through decoration-1">
                    {m.before}
                    {m.unit}
                  </span>
                  <span className="text-2xl font-semibold tracking-tight text-[#233226]">
                    {m.after}
                    {m.unit}
                  </span>
                  <span
                    className="text-xs font-semibold"
                    style={{ color: good ? '#2F7F4C' : '#9E6B38' }}
                  >
                    {pct > 0 ? '+' : ''}
                    {pct}%
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </ChartCard>

      {/* ── Trends ───────────────────────────────────────────────────────── */}
      <div className="grid gap-6 lg:grid-cols-2">
        <ChartCard
          title="Absenteeism rate"
          caption="Share of scheduled workdays lost to unplanned leave, last 6 months."
          table={{ columns: ['Month', 'Rate'], rows: MONTHS.map((m, i) => [m, `${ABSENTEEISM_RATE[i]}%`]) }}
        >
          <TrendChart
            data={trendSeries(ABSENTEEISM_RATE)}
            valueKey="value"
            format={(v) => `${v}%`}
            hue={TREND_HUE}
            tooltipLabel="Absenteeism"
          />
        </ChartCard>

        <ChartCard
          title="Productivity index"
          caption="Manager-rated output score, last 6 months."
          table={{ columns: ['Month', 'Score'], rows: MONTHS.map((m, i) => [m, PRODUCTIVITY_INDEX[i].toFixed(1)]) }}
        >
          <TrendChart
            data={trendSeries(PRODUCTIVITY_INDEX)}
            valueKey="value"
            format={(v) => v.toFixed(1)}
            hue={MAGNITUDE_HUE}
            tooltipLabel="Productivity"
          />
        </ChartCard>

        <ChartCard
          title="Sick leave, per employee"
          caption="Average sick days taken per employee, last 6 months."
          table={{ columns: ['Month', 'Days'], rows: MONTHS.map((m, i) => [m, SICK_LEAVE_DAYS[i].toFixed(1)]) }}
        >
          <TrendChart
            data={trendSeries(SICK_LEAVE_DAYS)}
            valueKey="value"
            format={(v) => v.toFixed(1)}
            hue={TREND_HUE}
            tooltipLabel="Sick days"
          />
        </ChartCard>

        <ChartCard
          title="Overtime, per employee"
          caption="Average overtime hours per employee per week, last 6 months."
          table={{ columns: ['Month', 'Hours'], rows: MONTHS.map((m, i) => [m, OVERTIME_HOURS[i].toFixed(1)]) }}
        >
          <TrendChart
            data={trendSeries(OVERTIME_HOURS)}
            valueKey="value"
            format={(v) => `${v.toFixed(1)}h`}
            hue={MAGNITUDE_HUE}
            tooltipLabel="Overtime"
          />
        </ChartCard>
      </div>

      {/* ── Department breakdown ────────────────────────────────────────── */}
      <ChartCard
        title="Productivity uplift, by department"
        caption="Change in the productivity index since rollout, by department."
        table={{ columns: ['Department', 'Uplift'], rows: PRODUCTIVITY_BY_DEPT.map((d) => [d.label, d.display ?? d.value]) }}
      >
        <RankedBarChart data={PRODUCTIVITY_BY_DEPT} />
      </ChartCard>
    </div>
  );
}
