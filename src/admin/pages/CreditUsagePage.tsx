import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowUpDown, Search, ShieldCheck, Sparkles } from 'lucide-react';
import { useTenant } from '@/app/TenantContext';
import { PageHero } from '@/components/PageHero';
import { ReportSkeleton } from '@/admin/widgets/PageHeading';
import { StatTile } from '@/admin/charts/StatTile';
import { formatCount } from '@/admin/charts/chart-theme';
import {
  getOrgCreditBalance,
  getOrgCreditUsageByMember,
  type OrgCreditBalance,
  type OrgCreditUsageByMember,
} from '@/services/credit-service';

type SortKey = 'credits' | 'label' | 'recent';

/**
 * Full per-employee Tara credit breakdown — split out of the Overview page
 * on purpose. A handful of rows reads fine as a dashboard card; once an org
 * has hundreds of employees, the list itself deserves its own page with
 * room to search and sort rather than a cramped widget.
 */
export function CreditUsagePage() {
  const { organization } = useTenant();
  const [credits, setCredits] = useState<OrgCreditBalance | null>(null);
  const [usage, setUsage] = useState<OrgCreditUsageByMember | null>(null);
  const [query, setQuery] = useState('');
  const [sortKey, setSortKey] = useState<SortKey>('credits');

  useEffect(() => {
    let cancelled = false;
    Promise.all([getOrgCreditBalance(organization.orgId), getOrgCreditUsageByMember(organization.orgId)]).then(
      ([balance, byMember]) => {
        if (cancelled) return;
        setCredits(balance);
        setUsage(byMember);
      },
    );
    return () => {
      cancelled = true;
    };
  }, [organization.orgId]);

  const filteredSorted = useMemo(() => {
    if (!usage) return [];
    const q = query.trim().toLowerCase();
    const filtered = q ? usage.members.filter((m) => m.memberLabel.toLowerCase().includes(q)) : usage.members;
    const sorted = [...filtered];
    if (sortKey === 'label') {
      sorted.sort((a, b) => a.memberLabel.localeCompare(b.memberLabel, undefined, { numeric: true }));
    } else if (sortKey === 'recent') {
      sorted.sort((a, b) => (b.lastUsedAt ?? '').localeCompare(a.lastUsedAt ?? ''));
    } else {
      sorted.sort((a, b) => b.creditsUsed - a.creditsUsed);
    }
    return sorted;
  }, [usage, query, sortKey]);

  if (!credits || !usage) return <ReportSkeleton />;

  const memberCreditTotal = usage.members.reduce((sum, m) => sum + m.creditsUsed, 0);

  return (
    <div className="flex flex-col gap-8 pb-12">
      <PageHero
        eyebrow={`${organization.branding.appName} · Credits`}
        icon={Sparkles}
        tone="green"
        badge={usage.live ? 'Live' : 'Not set up yet'}
        title="Tara credit usage, by employee"
        sub="Every employee gets a stable nickname the first time they use Tara, never their real name. This is how you confirm usage is spread across real people, not concentrated in one place, without anyone (including MindSpace) ever being able to tell who a nickname belongs to."
      />

      <section className="grid gap-4 sm:grid-cols-3">
        <StatTile
          label="Team members active"
          value={formatCount(usage.members.length)}
          sub="Have used Tara at least once"
        />
        <StatTile
          label="Credits tracked by member"
          value={formatCount(memberCreditTotal)}
          sub={
            memberCreditTotal < credits.creditsUsed
              ? `${formatCount(credits.creditsUsed)} used org-wide (includes pre-tracking usage)`
              : 'Matches org-wide usage'
          }
        />
        <StatTile
          label="Credits remaining"
          value={credits.live ? formatCount(credits.creditsRemaining) : '–'}
          sub={credits.live ? `of ${formatCount(credits.totalCredits)} on the ${credits.planName} plan` : 'Not set up yet'}
          upIsGood
        />
      </section>

      {!usage.live && (
        <p className="rounded-2xl border border-[#DCD5C8] bg-[#F3EEE5] px-4 py-3 text-[11px] leading-relaxed text-[#9E6B38]">
          Run <code className="rounded bg-white/70 px-1 py-0.5">supabase/schema-credit-anonymization.sql</code> in
          your Supabase project to turn this page on.
        </p>
      )}

      {usage.live && (
        <div className="rounded-3xl border border-[#EAE4D9] bg-white/80 shadow-[0_1px_0_rgba(35,50,38,0.03)]">
          <div className="flex flex-col gap-3 border-b border-[#EAE4D9]/80 p-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="relative w-full sm:max-w-xs">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[#9AA79C]" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search by nickname…"
                className="w-full rounded-xl border border-[#D9D2C5] bg-[#FAF7F2] py-2 pl-8 pr-3 text-xs text-[#233226] placeholder:text-[#9AA79C] focus:border-[#2D6A4F] focus:outline-none focus:ring-2 focus:ring-[#2D6A4F]/20"
              />
            </div>

            <div className="flex items-center gap-1.5 text-[11px] text-[#78897B]">
              <ArrowUpDown className="h-3.5 w-3.5" aria-hidden />
              <span className="hidden sm:inline">Sort</span>
              {(
                [
                  ['credits', 'Most credits'],
                  ['recent', 'Most recent'],
                  ['label', 'Name'],
                ] as [SortKey, string][]
              ).map(([key, label]) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => setSortKey(key)}
                  className={`rounded-full px-2.5 py-1 font-medium transition-colors cursor-pointer ${
                    sortKey === key ? 'bg-[#2D6A4F] text-white' : 'text-[#3E4F42] hover:bg-[#F3EFE8]'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          {filteredSorted.length === 0 ? (
            <p className="px-4 py-10 text-center text-[11px] italic text-[#9AA79C]">
              {usage.members.length === 0 ? 'No one has used Tara yet.' : 'No nicknames match your search.'}
            </p>
          ) : (
            <div className="max-h-[70vh] overflow-y-auto">
              <table className="w-full text-left text-xs">
                <thead className="sticky top-0 bg-[#FAF7F2]/95 backdrop-blur-md">
                  <tr className="text-[10px] font-bold uppercase tracking-wider text-[#78897B]">
                    <th className="px-4 py-2.5">Member</th>
                    <th className="px-4 py-2.5 text-right">Credits used</th>
                    <th className="px-4 py-2.5 text-right">Last active</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredSorted.map((m, i) => (
                    <tr
                      key={m.memberLabel}
                      className={`border-t border-[#EAE4D9]/60 ${i % 2 === 1 ? 'bg-[#FAF7F2]/50' : ''}`}
                    >
                      <td className="px-4 py-2.5 font-medium text-[#233226]">{m.memberLabel}</td>
                      <td className="px-4 py-2.5 text-right tabular-nums text-[#233226]">
                        {formatCount(m.creditsUsed)}
                      </td>
                      <td className="px-4 py-2.5 text-right text-[#78897B]">
                        {m.lastUsedAt
                          ? new Date(m.lastUsedAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })
                          : '–'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      <footer className="flex flex-wrap items-center gap-x-2 gap-y-1 pt-2 text-[11px] text-[#78897B]">
        <ShieldCheck className="h-3.5 w-3.5" aria-hidden />
        <span>
          Nicknames are one-way, not reversible by anyone, including MindSpace. See the{' '}
          <Link to="/admin/report" className="font-medium text-[#2D6A4F] hover:underline">
            Overview
          </Link>{' '}
          page for org-wide totals.
        </span>
      </footer>
    </div>
  );
}
