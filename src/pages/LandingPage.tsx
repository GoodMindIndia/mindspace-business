import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  ArrowUpRight,
  ShieldCheck,
  Sparkles,
  HeartHandshake,
  BarChart3,
  CheckCircle2,
  Lock,
  Building2,
  Clock,
  ChevronRight,
  UserCircle2,
  Menu,
  X,
  Bot,
  MessageCircle,
  TrendingUp,
  Fingerprint,
  LayoutDashboard,
  Quote,
  Timer,
  Users2,
  Star,
  Video,
} from 'lucide-react';

const NAV_LINKS = [
  { href: '#platform', label: 'Platform' },
  { href: '#therapy', label: 'Therapy' },
  { href: '#pricing', label: 'Pricing' },
];

const SPECS = [
  { value: '5 min', label: 'Weekly check-in time' },
  { value: '₹500', label: 'Per 45-min therapy session' },
  { value: 'k ≥ 5', label: 'Group size before HR sees data' },
  { value: '24/7', label: 'Tara AI companion availability' },
];

const BENTO_SMALL = [
  {
    icon: HeartHandshake,
    iconBg: '#F4EBE2',
    iconColor: '#9E6B38',
    title: '1:1 Private Therapy',
    body: '₹500, 45-minute video sessions with licensed clinical psychologists. No retainer.',
  },
  {
    icon: BarChart3,
    iconBg: '#E8EFF0',
    iconColor: '#3D5C5F',
    title: 'Executive AI Reports',
    body: 'Plain-English monthly briefings with root causes, not raw sentiment scores.',
  },
  {
    icon: ShieldCheck,
    iconBg: '#E2EAF8',
    iconColor: '#2C3E30',
    title: 'Aggregate-Only Privacy',
    body: 'Individual responses never reach HR. Nothing is shown below a group of five.',
  },
  {
    icon: LayoutDashboard,
    iconBg: '#F3EEE5',
    iconColor: '#526355',
    title: 'Admin Console',
    body: 'Track participation, manage employees, and generate reports from one dashboard.',
  },
];

const STEPS = [
  {
    n: '01',
    title: 'Employee checks in weekly',
    body: 'A 5-minute assessment covering workload, anxiety, and burnout, answered from their own account.',
  },
  {
    n: '02',
    title: 'Tara and therapy stay on tap',
    body: 'Employees get an always-on AI companion and can book a ₹500 licensed therapy session anytime.',
  },
  {
    n: '03',
    title: 'Responses aggregate anonymously',
    body: 'Scores are pooled by team. Nothing surfaces until at least 5 people have answered.',
  },
  {
    n: '04',
    title: 'HR gets an executive report',
    body: 'A plain-English monthly briefing: what’s driving strain, where, and what to do about it.',
  },
];

const HERO_TABS = [
  { id: 'overview', label: 'Overview', icon: LayoutDashboard, path: 'admin/reports' },
  { id: 'analytics', label: 'Analytics', icon: BarChart3, path: 'admin/analytics' },
  { id: 'teams', label: 'Teams', icon: Users2, path: 'admin/teams' },
  { id: 'therapy', label: 'Therapy', icon: HeartHandshake, path: 'admin/therapy' },
  { id: 'privacy', label: 'Privacy', icon: ShieldCheck, path: 'admin/privacy' },
] as const;

type HeroTabId = (typeof HERO_TABS)[number]['id'];

function HeroOverviewPanel() {
  return (
    <>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-wider text-[#78897B]">Monthly Wellbeing Report</p>
          <p className="font-sans text-base sm:text-lg font-semibold text-[#233226] mt-0.5">October Overview</p>
        </div>
        <span className="inline-flex items-center gap-1.5 rounded-full bg-[#E8F0EA] px-3 py-1 text-[10px] font-semibold text-[#2D6A4F]">
          <span className="h-1.5 w-1.5 rounded-full bg-[#2F7F4C] animate-pulse" />
          Live · Aggregate-only
        </span>
      </div>

      <div className="mt-5 grid grid-cols-3 gap-3">
        <div className="rounded-xl border border-[#EAE4D9] bg-[#FAF7F2] p-3">
          <p className="text-[10px] text-[#78897B]">Participation</p>
          <p className="mt-1 text-sm sm:text-base font-bold text-[#233226]">High engagement</p>
        </div>
        <div className="rounded-xl border border-[#EAE4D9] bg-[#FAF7F2] p-3">
          <p className="text-[10px] text-[#78897B]">Trend vs. last month</p>
          <p className="mt-1 text-sm sm:text-base font-bold text-[#2F7F4C] flex items-center gap-1">
            <TrendingUp className="h-3.5 w-3.5" /> Improving
          </p>
        </div>
        <div className="rounded-xl border border-[#EAE4D9] bg-[#FAF7F2] p-3">
          <p className="text-[10px] text-[#78897B]">Flagged teams</p>
          <p className="mt-1 text-sm sm:text-base font-bold text-[#9E6B38]">Operations</p>
        </div>
      </div>

      <div className="mt-4 flex items-end gap-2 sm:gap-3 h-20 sm:h-24 rounded-xl border border-[#EAE4D9] bg-[#FAF7F2] px-4 py-3">
        {[38, 62, 48, 74, 55, 84, 40, 66, 52, 30].map((h, i) => (
          <span
            key={i}
            className="flex-1 rounded-t-sm"
            style={{ height: `${h}%`, background: i === 5 ? '#2D6A4F' : '#C3D0C6' }}
          />
        ))}
      </div>

      <div className="mt-4 rounded-xl bg-[#2D6A4F] p-4 flex items-start gap-3">
        <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-white/10 text-white">
          <Sparkles className="h-3.5 w-3.5" />
        </span>
        <div>
          <p className="text-[10px] font-bold uppercase tracking-wider text-white/50">Executive Verdict</p>
          <p className="text-xs sm:text-sm text-white/90 leading-relaxed mt-1">
            Overall engagement is high this month, but Operations is carrying visible strain from workload, worth a targeted check-in.
          </p>
        </div>
      </div>
    </>
  );
}

function HeroAnalyticsPanel() {
  const rows = [
    { label: 'Team Cohesion', value: 84, color: '#2D6A4F' },
    { label: 'Workload', value: 72, color: '#2D6A4F' },
    { label: 'Work Anxiety', value: 58, color: '#9E6B38' },
    { label: 'Burnout Risk', value: 41, color: '#9E6B38' },
  ];
  return (
    <>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-wider text-[#78897B]">Sentiment Analytics</p>
          <p className="font-sans text-base sm:text-lg font-semibold text-[#233226] mt-0.5">Category Breakdown</p>
        </div>
        <span className="inline-flex items-center gap-1.5 rounded-full bg-[#E8F0EA] px-3 py-1 text-[10px] font-semibold text-[#2D6A4F]">
          Org-wide
        </span>
      </div>

      <div className="mt-5 flex flex-col gap-3.5 rounded-xl border border-[#EAE4D9] bg-[#FAF7F2] p-4">
        {rows.map((row) => (
          <div key={row.label}>
            <div className="flex items-center justify-between text-[11px] mb-1">
              <span className="font-medium text-[#3E4F42]">{row.label}</span>
              <span className="font-bold text-[#233226]">{row.value}%</span>
            </div>
            <div className="h-2 w-full rounded-full bg-[#EAE4D9] overflow-hidden">
              <div className="h-full rounded-full" style={{ width: `${row.value}%`, background: row.color }} />
            </div>
          </div>
        ))}
      </div>

      <div className="mt-4 rounded-xl bg-[#2D6A4F] p-4 flex items-start gap-3">
        <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-white/10 text-white">
          <BarChart3 className="h-3.5 w-3.5" />
        </span>
        <div>
          <p className="text-[10px] font-bold uppercase tracking-wider text-white/50">Analyst Note</p>
          <p className="text-xs sm:text-sm text-white/90 leading-relaxed mt-1">
            Work anxiety has risen since last quarter, concentrated in Operations and Engineering.
          </p>
        </div>
      </div>
    </>
  );
}

function HeroTeamsPanel() {
  const teams = [
    { name: 'Engineering', responses: 42, status: 'Healthy' },
    { name: 'Operations', responses: 38, status: 'Needs attention' },
    { name: 'Design', responses: 19, status: 'Healthy' },
    { name: 'Sales', responses: 55, status: 'Healthy' },
  ];
  return (
    <>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-wider text-[#78897B]">Team Participation</p>
          <p className="font-sans text-base sm:text-lg font-semibold text-[#233226] mt-0.5">This Month</p>
        </div>
        <span className="inline-flex items-center gap-1.5 rounded-full bg-[#E8F0EA] px-3 py-1 text-[10px] font-semibold text-[#2D6A4F]">
          4 teams
        </span>
      </div>

      <div className="mt-5 flex flex-col gap-2 rounded-xl border border-[#EAE4D9] bg-[#FAF7F2] p-2">
        {teams.map((team) => (
          <div key={team.name} className="flex items-center justify-between rounded-lg bg-white border border-[#EAE4D9] px-3.5 py-2.5">
            <div>
              <p className="text-xs font-semibold text-[#233226]">{team.name}</p>
              <p className="text-[10px] text-[#78897B] mt-0.5">{team.responses} responses this month</p>
            </div>
            <span
              className="rounded-full px-2.5 py-1 text-[10px] font-semibold"
              style={
                team.status === 'Healthy'
                  ? { background: '#E8F0EA', color: '#2D6A4F' }
                  : { background: '#F4EBE2', color: '#9E6B38' }
              }
            >
              {team.status}
            </span>
          </div>
        ))}
      </div>

      <div className="mt-4 rounded-xl bg-[#2D6A4F] p-4 flex items-start gap-3">
        <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-white/10 text-white">
          <Fingerprint className="h-3.5 w-3.5" />
        </span>
        <div>
          <p className="text-[10px] font-bold uppercase tracking-wider text-white/50">Anonymity Check</p>
          <p className="text-xs sm:text-sm text-white/90 leading-relaxed mt-1">
            All 4 teams have crossed the k ≥ 5 threshold, every score below is safe to report.
          </p>
        </div>
      </div>
    </>
  );
}

function HeroTherapyPanel() {
  return (
    <>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-wider text-[#78897B]">Therapy Utilization</p>
          <p className="font-sans text-base sm:text-lg font-semibold text-[#233226] mt-0.5">This Month</p>
        </div>
        <span className="inline-flex items-center gap-1.5 rounded-full bg-[#E8F0EA] px-3 py-1 text-[10px] font-semibold text-[#2D6A4F]">
          Pay-as-you-use
        </span>
      </div>

      <div className="mt-5 grid grid-cols-3 gap-3">
        <div className="rounded-xl border border-[#EAE4D9] bg-[#FAF7F2] p-3">
          <p className="text-[10px] text-[#78897B] flex items-center gap-1"><Video className="h-3 w-3" /> Sessions booked</p>
          <p className="mt-1 text-sm sm:text-base font-bold text-[#233226]">126</p>
        </div>
        <div className="rounded-xl border border-[#EAE4D9] bg-[#FAF7F2] p-3">
          <p className="text-[10px] text-[#78897B] flex items-center gap-1"><Star className="h-3 w-3" /> Avg. rating</p>
          <p className="mt-1 text-sm sm:text-base font-bold text-[#233226]">4.8 / 5</p>
        </div>
        <div className="rounded-xl border border-[#EAE4D9] bg-[#FAF7F2] p-3">
          <p className="text-[10px] text-[#78897B]">Repeat bookings</p>
          <p className="mt-1 text-sm sm:text-base font-bold text-[#2F7F4C]">38%</p>
        </div>
      </div>

      <div className="mt-4 flex items-end gap-2 sm:gap-3 h-20 sm:h-24 rounded-xl border border-[#EAE4D9] bg-[#FAF7F2] px-4 py-3">
        {[20, 35, 30, 48, 60, 55, 70].map((h, i) => (
          <span key={i} className="flex-1 rounded-t-sm" style={{ height: `${h}%`, background: '#C3D0C6' }} />
        ))}
      </div>

      <div className="mt-4 rounded-xl bg-[#2D6A4F] p-4 flex items-start gap-3">
        <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-white/10 text-white">
          <HeartHandshake className="h-3.5 w-3.5" />
        </span>
        <div>
          <p className="text-[10px] font-bold uppercase tracking-wider text-white/50">What this means</p>
          <p className="text-xs sm:text-sm text-white/90 leading-relaxed mt-1">
            Employees are booking sessions steadily without a crisis trigger. Usage is proactive, not reactive.
          </p>
        </div>
      </div>
    </>
  );
}

function HeroPrivacyPanel() {
  const points = [
    'Individual scores are never shown to HR',
    'Nothing surfaces below a group of 5 (k-anonymity)',
    'Data is encrypted in transit and at rest',
    'Therapy session content stays between employee and psychologist',
  ];
  return (
    <>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-wider text-[#78897B]">Privacy by Design</p>
          <p className="font-sans text-base sm:text-lg font-semibold text-[#233226] mt-0.5">How Data Is Protected</p>
        </div>
        <span className="inline-flex items-center gap-1.5 rounded-full bg-[#E8F0EA] px-3 py-1 text-[10px] font-semibold text-[#2D6A4F]">
          Aggregate-only
        </span>
      </div>

      <div className="mt-5 flex flex-col gap-2.5 rounded-xl border border-[#EAE4D9] bg-[#FAF7F2] p-4">
        {points.map((point) => (
          <div key={point} className="flex items-start gap-2.5">
            <CheckCircle2 className="h-4 w-4 text-[#2D6A4F] shrink-0 mt-0.5" />
            <span className="text-xs text-[#3E4F42] leading-relaxed">{point}</span>
          </div>
        ))}
      </div>

      <div className="mt-4 rounded-xl bg-[#2D6A4F] p-4 flex items-start gap-3">
        <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-white/10 text-white">
          <ShieldCheck className="h-3.5 w-3.5" />
        </span>
        <div>
          <p className="text-[10px] font-bold uppercase tracking-wider text-white/50">Why it matters</p>
          <p className="text-xs sm:text-sm text-white/90 leading-relaxed mt-1">
            Aggregate-only isn’t a setting you can turn off. It’s how the platform is built.
          </p>
        </div>
      </div>
    </>
  );
}

const HERO_PANELS: Record<HeroTabId, () => JSX.Element> = {
  overview: HeroOverviewPanel,
  analytics: HeroAnalyticsPanel,
  teams: HeroTeamsPanel,
  therapy: HeroTherapyPanel,
  privacy: HeroPrivacyPanel,
};

export function LandingPage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeHeroTab, setActiveHeroTab] = useState<HeroTabId>('overview');
  const ActiveHeroPanel = HERO_PANELS[activeHeroTab];

  return (
    <div className="min-h-screen bg-[#FAF7F2] text-[#243327] selection:bg-[#E5ECE6] relative overflow-x-hidden font-sans">
      {/* Top Navbar */}
      <header className="sticky top-0 z-40 w-full border-b border-[#EAE4D9] bg-[#FAF7F2]/90 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link to="/" className="flex items-center gap-3 hover:opacity-90 transition-opacity">
            <img src="/mindspace-wordmark.png" alt="MindSpace" className="h-6 sm:h-7 w-auto object-contain" />
          </Link>

          <nav className="hidden md:flex items-center gap-8 text-xs font-semibold text-[#56685A]">
            {NAV_LINKS.map((link) => (
              <a key={link.href} href={link.href} className="hover:text-[#233226] transition-colors">
                {link.label}
              </a>
            ))}
          </nav>

          <div className="hidden sm:flex items-center gap-3">
            <Link
              to="/app/login"
              className="inline-flex items-center gap-1.5 rounded-lg border border-[#D9D2C5] bg-white px-3.5 py-2 text-xs font-semibold text-[#3E4F42] shadow-xs hover:bg-[#F3EFE8] transition-colors"
            >
              <UserCircle2 className="h-3.5 w-3.5 text-[#5A6D5E]" />
              <span>Employee Sign In</span>
            </Link>

            <Link
              to="/login"
              className="inline-flex items-center gap-1.5 rounded-lg bg-[#2D6A4F] hover:bg-[#234F3B] text-white px-4 py-2 text-xs font-semibold shadow-sm transition-colors"
            >
              <Lock className="h-3.5 w-3.5" />
              <span>HR Login</span>
            </Link>
          </div>

          <div className="flex sm:hidden items-center gap-2">
            <Link
              to="/login"
              className="inline-flex items-center gap-1 rounded-lg bg-[#2D6A4F] text-white px-3 py-2 text-xs font-semibold shadow-xs"
            >
              <Lock className="h-3.5 w-3.5" />
              <span>HR Login</span>
            </Link>

            <button
              type="button"
              onClick={() => setMobileMenuOpen((o) => !o)}
              className="flex h-9 w-9 items-center justify-center rounded-lg bg-white border border-[#D9D2C5] text-[#233226] hover:bg-[#F3EFE8] transition-colors cursor-pointer"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
            </button>
          </div>
        </div>

        {mobileMenuOpen && (
          <div className="sm:hidden border-t border-[#EAE4D9] bg-white px-4 py-4 shadow-lg animate-in slide-in-from-top duration-200">
            <nav className="flex flex-col gap-2">
              {NAV_LINKS.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className="rounded-lg px-3.5 py-2.5 text-xs font-semibold text-[#233226] hover:bg-[#F3EFE8]"
                >
                  {link.label}
                </a>
              ))}
            </nav>

            <div className="mt-4 pt-3 border-t border-[#EAE4D9] flex flex-col gap-2">
              <Link
                to="/app/login"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full inline-flex items-center justify-center gap-2 rounded-lg bg-[#2D6A4F] text-white py-2.5 text-xs font-semibold shadow-xs"
              >
                <UserCircle2 className="h-3.5 w-3.5" />
                <span>Employee Sign In</span>
              </Link>
            </div>
          </div>
        )}
      </header>

      {/* Hero */}
      <section className="relative pt-14 pb-0 sm:pt-20">
        {/* Ambient glow, subdued */}
        <div
          aria-hidden
          className="pointer-events-none absolute right-[-10%] top-[-10%] h-[420px] w-[420px] opacity-[0.14] blur-3xl rounded-full"
          style={{ background: 'radial-gradient(circle, #A100FF 0%, #2D6A4F 55%, transparent 70%)' }}
        />

        <div className="relative mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-[#D9D2C5] bg-[#F3EFE8] px-3.5 py-1.5 text-[11px] font-semibold text-[#3E4F42]">
            <span className="h-1.5 w-1.5 rounded-full bg-[#2D6A4F]" />
            WORKPLACE MENTAL HEALTH INTELLIGENCE
          </div>

          <h1 className="mt-6 font-sans text-4xl sm:text-6xl lg:text-[4.2rem] font-semibold tracking-tight text-[#233226] leading-[1.05]">
            Know how your people
            <br className="hidden sm:block" /> actually feel.
          </h1>

          <p className="mt-5 sm:mt-6 text-sm sm:text-lg leading-relaxed text-[#56685A] max-w-2xl mx-auto">
            MindSpace turns anonymous weekly check-ins into a plain-English executive report,
            while employees get unlimited assessments, an AI companion, and ₹500 therapy sessions.
          </p>

          <div className="mt-8 flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-3 w-full sm:w-auto mx-auto">
            <Link
              to="/app/login"
              className="inline-flex items-center justify-center gap-2.5 rounded-xl bg-[#2D6A4F] hover:bg-[#234F3B] text-white px-7 py-3.5 text-sm font-semibold shadow-md transition-all hover:scale-[1.02]"
            >
              <span>Sign In as an Employee</span>
              <ArrowRight className="h-4 w-4" />
            </Link>

            <Link
              to="/login"
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-[#D9D2C5] bg-white hover:bg-[#F3EFE8] px-6 py-3.5 text-sm font-semibold text-[#3E4F42] shadow-xs transition-colors"
            >
              <Building2 className="h-4 w-4 text-[#5A6D5E]" />
              <span>HR Analytics Dashboard</span>
            </Link>
          </div>

          {/* Spec strip */}
          <div className="mt-10 sm:mt-12 grid grid-cols-2 sm:grid-cols-4 gap-px rounded-2xl border border-[#EAE4D9] bg-[#EAE4D9] overflow-hidden max-w-3xl mx-auto">
            {SPECS.map((spec) => (
              <div key={spec.label} className="bg-white px-4 py-4 sm:py-5 text-center">
                <p className="font-sans text-lg sm:text-2xl font-bold text-[#233226]">{spec.value}</p>
                <p className="mt-1 text-[10px] sm:text-[11px] text-[#78897B] leading-snug">{spec.label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Product screenshot mock */}
        <div className="relative mt-12 sm:mt-16 mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <div className="rounded-2xl border border-[#EAE4D9] bg-white shadow-[0_40px_100px_-30px_rgba(20,30,20,0.28)] overflow-hidden">
            <div className="flex items-center gap-3 border-b border-[#EAE4D9] bg-[#FAF7F2] px-4 py-3">
              <div className="flex gap-1.5">
                <span className="h-2.5 w-2.5 rounded-full bg-[#E4635A]" />
                <span className="h-2.5 w-2.5 rounded-full bg-[#E8B84B]" />
                <span className="h-2.5 w-2.5 rounded-full bg-[#5FAE6E]" />
              </div>
              <div className="mx-auto hidden sm:flex items-center gap-1.5 rounded-full bg-white border border-[#EAE4D9] px-3 py-1 text-[10px] text-[#78897B]">
                <Lock className="h-2.5 w-2.5" />
                app.mindspace.ai/{HERO_TABS.find((t) => t.id === activeHeroTab)?.path}
              </div>
            </div>

            <div className="flex">
              <div className="flex sm:flex-col items-center gap-2 sm:gap-4 justify-center sm:justify-start border-r-0 sm:border-r border-b sm:border-b-0 border-[#EAE4D9] bg-[#FAF7F2] w-full sm:w-14 shrink-0 py-3 sm:py-6 px-2 sm:px-0">
                {HERO_TABS.map((tab) => (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setActiveHeroTab(tab.id)}
                    aria-label={tab.label}
                    aria-pressed={activeHeroTab === tab.id}
                    title={tab.label}
                    className={`flex h-8 w-8 items-center justify-center rounded-lg transition-colors cursor-pointer ${
                      activeHeroTab === tab.id
                        ? 'bg-[#2D6A4F] text-white'
                        : 'text-[#9AA79C] hover:bg-white hover:text-[#56685A]'
                    }`}
                  >
                    <tab.icon className="h-4 w-4" />
                  </button>
                ))}
              </div>

              <div key={activeHeroTab} className="flex-1 p-5 sm:p-7 min-h-[360px] sm:min-h-[340px] animate-in fade-in duration-300">
                <ActiveHeroPanel />
              </div>
            </div>
          </div>

          {/* Mobile tab labels */}
          <div className="sm:hidden mt-3 flex items-center justify-center gap-1.5 text-[11px] font-medium text-[#78897B]">
            {HERO_TABS.map((tab) => (
              <span key={tab.id} className={activeHeroTab === tab.id ? 'text-[#2D6A4F] font-semibold' : ''}>
                {tab.label}
                {tab.id !== HERO_TABS[HERO_TABS.length - 1].id && <span className="mx-1.5 text-[#D9D2C5]">·</span>}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* Trust strip */}
      <section className="border-y border-[#EAE4D9] bg-white py-6 sm:py-7 mt-14 sm:mt-20">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs sm:text-sm font-semibold text-[#3E4F42] text-center sm:text-left">
            Purpose-built for modern people teams
          </p>
          <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3">
            {[
              { icon: ShieldCheck, label: 'Aggregate-only reporting' },
              { icon: HeartHandshake, label: 'Licensed clinical psychologists' },
              { icon: Fingerprint, label: 'k ≥ 5 anonymity threshold' },
            ].map((item) => (
              <span
                key={item.label}
                className="inline-flex items-center gap-1.5 rounded-full border border-[#EAE4D9] bg-white px-3 py-1.5 text-[11px] font-medium text-[#56685A]"
              >
                <item.icon className="h-3.5 w-3.5 text-[#2D6A4F]" />
                {item.label}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* Bento Features */}
      <section id="platform" className="py-16 sm:py-24">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <div className="max-w-xl mb-10 sm:mb-12">
            <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#78897B]">The platform</p>
            <h2 className="font-sans text-2xl sm:text-4xl font-semibold tracking-tight text-[#233226] mt-2">
              Everything wellbeing needs, in one console
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 lg:grid-rows-2 gap-4 sm:gap-5">
            {/* Large tile */}
            <div className="lg:col-span-2 lg:row-span-2 rounded-2xl border border-[#EAE4D9] bg-white p-6 sm:p-8 flex flex-col justify-between hover:border-[#2D6A4F]/40 transition-colors">
              <div>
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#2D6A4F] text-white mb-5">
                  <Bot className="h-5 w-5" />
                </div>
                <h3 className="font-sans text-xl sm:text-2xl font-semibold text-[#233226]">Always-on employee support</h3>
                <p className="mt-2.5 text-xs sm:text-sm leading-relaxed text-[#56685A] max-w-sm">
                  Unlimited 5-minute assessments for workload, anxiety, and burnout, plus Tara, an AI companion
                  employees can talk to anytime. Individual answers are never shared with HR.
                </p>
              </div>

              <div className="mt-6 rounded-xl border border-[#EAE4D9] bg-[#FAF7F2] p-4 flex items-start gap-3">
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#E8F0EA] text-[#2D6A4F]">
                  <MessageCircle className="h-3.5 w-3.5" />
                </span>
                <div className="flex-1">
                  <p className="text-[11px] font-semibold text-[#233226]">Tara · AI Companion</p>
                  <p className="text-[11px] text-[#78897B] mt-0.5 leading-relaxed">
                    “It sounds like this week has been heavier than usual. Want to walk through what’s on your plate?”
                  </p>
                </div>
              </div>
            </div>

            {BENTO_SMALL.map((tile) => (
              <div
                key={tile.title}
                className="rounded-2xl border border-[#EAE4D9] bg-white p-5 sm:p-6 flex flex-col justify-between hover:border-[#2D6A4F]/40 transition-colors"
              >
                <div>
                  <div
                    className="flex h-9 w-9 items-center justify-center rounded-xl mb-4"
                    style={{ background: tile.iconBg, color: tile.iconColor }}
                  >
                    <tile.icon className="h-[18px] w-[18px]" />
                  </div>
                  <h3 className="font-sans text-base font-semibold text-[#233226]">{tile.title}</h3>
                  <p className="mt-1.5 text-xs leading-relaxed text-[#56685A]">{tile.body}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-16 sm:py-24 border-t border-[#EAE4D9] bg-white">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <div className="max-w-xl mb-10 sm:mb-14">
            <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#78897B]">How it works</p>
            <h2 className="font-sans text-2xl sm:text-4xl font-semibold tracking-tight text-[#233226] mt-2">
              From a 5-minute check-in to an executive briefing
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 lg:gap-4 relative">
            {STEPS.map((step, i) => (
              <div key={step.n} className="relative flex flex-col gap-3">
                <div className="flex items-center gap-3">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#2D6A4F] text-white text-xs font-bold">
                    {step.n}
                  </span>
                  {i < STEPS.length - 1 && (
                    <span className="hidden lg:block flex-1 h-px bg-[#EAE4D9]" />
                  )}
                  {i < STEPS.length - 1 && (
                    <ChevronRight className="hidden lg:block h-3.5 w-3.5 text-[#D9D2C5] -ml-2" />
                  )}
                </div>
                <h3 className="font-sans text-sm sm:text-base font-semibold text-[#233226]">{step.title}</h3>
                <p className="text-xs leading-relaxed text-[#56685A]">{step.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Therapy Section */}
      <section id="therapy" className="py-16 sm:py-24">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <div className="rounded-2xl border border-[#EAE4D9] bg-white p-7 sm:p-10 grid lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-7 flex flex-col gap-4">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-[#F4EBE2] px-3 py-1 text-xs font-semibold text-[#9E6B38] self-start">
                <HeartHandshake className="h-3.5 w-3.5 text-[#9E6B38]" />
                CONFIDENTIAL THERAPY NETWORK
              </span>

              <h2 className="font-sans text-2xl sm:text-4xl font-semibold tracking-tight text-[#233226] leading-tight">
                Direct access to licensed psychologists at ₹500/session
              </h2>

              <p className="text-xs sm:text-sm text-[#56685A] leading-relaxed max-w-lg">
                Employees book private sessions from their own account. You only pay for what’s used, no
                retainer, no minimum commitment.
              </p>

              <div className="grid grid-cols-2 gap-3 mt-2">
                <div className="rounded-xl bg-[#FAF7F2] p-4 border border-[#EAE4D9]">
                  <p className="font-sans text-lg sm:text-xl font-bold text-[#233226]">₹500</p>
                  <p className="text-[11px] text-[#78897B] mt-0.5">Pay-as-you-use per employee</p>
                </div>

                <div className="rounded-xl bg-[#FAF7F2] p-4 border border-[#EAE4D9]">
                  <p className="font-sans text-lg sm:text-xl font-bold text-[#233226]">100% Privacy</p>
                  <p className="text-[11px] text-[#78897B] mt-0.5">Zero session logs shared with HR</p>
                </div>
              </div>
            </div>

            <div className="lg:col-span-5 rounded-2xl bg-[#2D6A4F] p-7 text-white flex flex-col justify-between min-h-[220px] relative overflow-hidden">
              <div
                aria-hidden
                className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full opacity-20 blur-2xl"
                style={{ background: 'radial-gradient(circle, #A100FF, transparent 70%)' }}
              />
              <div className="relative">
                <Quote className="h-5 w-5 text-white/40" />
                <p className="font-sans text-lg sm:text-xl font-medium mt-3 leading-snug">
                  Support is not a dramatic crisis measure. It is a practical habit that protects performance.
                </p>
              </div>

              <div className="relative pt-4 border-t border-white/15 flex items-center justify-between text-xs text-white/70">
                <span>Certified clinical counselors</span>
                <span className="font-semibold text-white flex items-center gap-1">
                  <Timer className="h-3.5 w-3.5" /> 45 min video
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-16 sm:py-24 border-t border-[#EAE4D9] bg-white">
        <div className="mx-auto max-w-4xl px-4 sm:px-6">
          <div className="text-center max-w-xl mx-auto mb-10 sm:mb-14">
            <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#78897B]">Simple pricing</p>
            <h2 className="font-sans text-2xl sm:text-4xl font-semibold tracking-tight text-[#233226] mt-2">
              Transparent enterprise pricing
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 sm:gap-6 items-stretch">
            {/* Platform Plan */}
            <div className="rounded-2xl bg-white p-7 sm:p-8 border-2 border-[#2D6A4F] shadow-sm flex flex-col justify-between relative">
              <span className="absolute -top-3 left-6 rounded-full bg-[#2D6A4F] px-3 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white">
                Annual Platform
              </span>

              <div>
                <h3 className="font-sans text-xl sm:text-2xl font-semibold text-[#233226]">White-Label Platform</h3>
                <p className="text-xs text-[#78897B] mt-0.5">Enterprise dashboard for up to 500 active employees.</p>

                <div className="mt-4 flex items-baseline gap-1.5">
                  <span className="font-sans text-3xl sm:text-4xl font-bold text-[#233226]">₹1,20,000</span>
                  <span className="text-xs text-[#78897B]">/ year</span>
                </div>
                <p className="text-[11px] text-[#78897B] mt-0.5">Just ₹20 / employee / month</p>

                <ul className="mt-5 flex flex-col gap-2.5 text-xs text-[#3E4F42] border-t border-[#EAE4D9] pt-4">
                  {[
                    'Unlimited employee assessments',
                    'AI executive sentiment briefings',
                    'Complimentary curated wellness rituals',
                    'Dedicated HR admin console & shareable link',
                  ].map((f) => (
                    <li key={f} className="flex items-center gap-2">
                      <CheckCircle2 className="h-3.5 w-3.5 text-[#2D6A4F] shrink-0" />
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="mt-6 pt-4 border-t border-[#EAE4D9]">
                <Link
                  to="/login"
                  className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-[#2D6A4F] hover:bg-[#234F3B] text-white py-3 text-xs font-semibold shadow-xs transition-colors"
                >
                  <span>Sign In to HR Console</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            </div>

            {/* Therapy Plan */}
            <div className="rounded-2xl bg-white p-7 sm:p-8 border border-[#EAE4D9] shadow-xs flex flex-col justify-between">
              <div>
                <h3 className="font-sans text-xl sm:text-2xl font-semibold text-[#233226]">1:1 Private Therapy</h3>
                <p className="text-xs text-[#78897B] mt-0.5">On-demand licensed clinical psychologist support.</p>

                <div className="mt-4 flex items-baseline gap-1.5">
                  <span className="font-sans text-3xl sm:text-4xl font-bold text-[#233226]">₹500</span>
                  <span className="text-xs text-[#78897B]">/ session / employee</span>
                </div>
                <p className="text-[11px] text-[#78897B] mt-0.5">Pay-as-you-use (zero retainer commitment)</p>

                <ul className="mt-5 flex flex-col gap-2.5 text-xs text-[#3E4F42] border-t border-[#EAE4D9] pt-4">
                  {[
                    '45-minute confidential video session',
                    'Pay only when employees book sessions',
                    'Complete employee confidentiality guaranteed',
                    'Bookable right from an employee’s own account',
                  ].map((f) => (
                    <li key={f} className="flex items-center gap-2">
                      <CheckCircle2 className="h-3.5 w-3.5 text-[#2D6A4F] shrink-0" />
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="mt-6 pt-4 border-t border-[#EAE4D9]">
                <Link
                  to="/app/login"
                  className="w-full inline-flex items-center justify-center gap-1.5 rounded-xl border border-[#D9D2C5] bg-white hover:bg-[#F3EFE8] text-[#3E4F42] py-3 text-xs font-semibold transition-colors"
                >
                  <span>Try the Employee App</span>
                  <ChevronRight className="h-3.5 w-3.5 text-[#5A6D5E]" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Closing CTA band */}
      <section className="relative py-16 sm:py-24">
        <div className="relative mx-auto max-w-3xl px-4 sm:px-6">
          <div className="relative overflow-hidden rounded-2xl border border-[#EAE4D9] bg-white px-6 py-12 sm:px-14 sm:py-16 text-center shadow-sm">
            <div
              aria-hidden
              className="pointer-events-none absolute left-1/2 top-0 h-[300px] w-[600px] -translate-x-1/2 opacity-[0.1] blur-3xl"
              style={{ background: 'radial-gradient(ellipse, #A100FF 0%, #2D6A4F 55%, transparent 75%)' }}
            />
            <h2 className="relative font-sans text-2xl sm:text-4xl font-semibold tracking-tight text-[#233226]">
              Ready to see what your people are really telling you?
            </h2>
            <p className="relative mt-3 text-sm text-[#56685A] max-w-lg mx-auto">
              Sign in to the HR console for a live walkthrough, or try the employee experience yourself.
            </p>
            <div className="relative mt-7 flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-3">
              <Link
                to="/login"
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#2D6A4F] hover:bg-[#234F3B] text-white px-6 py-3.5 text-sm font-semibold shadow-md transition-all hover:scale-[1.02]"
              >
                <span>HR Analytics Dashboard</span>
                <ArrowUpRight className="h-4 w-4" />
              </Link>
              <Link
                to="/app/login"
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-[#D9D2C5] bg-white text-[#3E4F42] hover:bg-[#F3EFE8] px-6 py-3.5 text-sm font-semibold transition-colors"
              >
                <span>Sign In as an Employee</span>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="w-full bg-transparent py-10 sm:py-12">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <img src="/mindspace-wordmark.png" alt="MindSpace" className="h-5 w-auto object-contain" />
          </div>

          <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-xs text-[#78897B]">
            <a href="#" className="hover:text-[#233226] transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-[#233226] transition-colors">Terms of Service</a>
            <a href="#" className="hover:text-[#233226] transition-colors">Support</a>
          </div>
        </div>
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 mt-6 pt-6 border-t border-[#EAE4D9]">
          <p className="text-xs text-[#78897B]">© 2026 MindSpace. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
