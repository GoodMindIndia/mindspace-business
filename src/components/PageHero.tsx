import type { ComponentType, ReactNode } from 'react';

/**
 * The banner every in-app page opens with.
 *
 * Before this, every screen started with plain text on the cream page ground,
 * so the Hub, Assessments, Tara and Book pages were visually indistinguishable
 * — you could not tell where you were without reading. Each area now gets its
 * own tone from the brand's own family (eucalyptus, teal, violet, rose, clay),
 * which gives the app a sense of place while keeping one palette.
 */

/**
 * Every tone is a member of the eucalyptus/oat family, so a page never fights
 * the fixed green navigation. Distinctiveness comes from *depth and warmth*
 * within one family — a sea-green, a moss, a pine, the brand's own clay —
 * rather than from unrelated hues, which read as a different application.
 */
export type HeroTone = 'green' | 'teal' | 'moss' | 'pine' | 'clay' | 'slate';

const TONES: Record<HeroTone, { from: string; via: string; to: string; glow: string; soft: string }> = {
  /** Brand anchor — same eucalyptus as the nav. */
  green: { from: '#2D6A4F', via: '#2A6149', to: '#234F3B', glow: '#E8B84B', soft: '#A9CBAE' },
  /** Sea-green: one step cooler than the anchor. */
  teal: { from: '#276660', via: '#235C57', to: '#1B4A46', glow: '#8FCFC2', soft: '#A7D5CE' },
  /** Moss: one step warmer/olive, still unmistakably the same family. */
  moss: { from: '#4F6B41', via: '#47613A', to: '#374E2E', glow: '#CBDC96', soft: '#BFD1A4' },
  /** Pine: the deepest green, for the page that should feel most decisive. */
  pine: { from: '#1F4A3D', via: '#1B4236', to: '#133329', glow: '#7FC7A4', soft: '#9CC4B0' },
  /** Clay: the brand's established second accent — the one warm counterpoint. */
  clay: { from: '#8A5E31', via: '#7C542C', to: '#5F4023', glow: '#F0C98A', soft: '#E0C4A0' },
  /** Slate-green: desaturated, for analytical pages. */
  slate: { from: '#3D5C5F', via: '#365254', to: '#294143', glow: '#A8CFC9', soft: '#B3CBC9' },
};

export function PageHero({
  eyebrow,
  title,
  sub,
  icon: Icon,
  tone = 'green',
  badge,
  aside,
  children,
}: {
  eyebrow: string;
  title: ReactNode;
  sub?: string;
  icon?: ComponentType<{ className?: string }>;
  tone?: HeroTone;
  /** Small pill in the top-right — usually the privacy promise. */
  badge?: string;
  /** Stat block, ring, or actions shown to the right of the copy. */
  aside?: ReactNode;
  /** Anything that should sit under the copy, inside the banner. */
  children?: ReactNode;
}) {
  const t = TONES[tone];

  return (
    <section
      className="ms-fade-up relative overflow-hidden rounded-3xl p-6 sm:p-8 text-white shadow-[0_20px_50px_-26px_rgba(20,30,25,0.55)]"
      style={{ background: `linear-gradient(135deg, ${t.from} 0%, ${t.via} 45%, ${t.to} 100%)` }}
    >
      {/* Ambient warmth, drifting */}
      <div
        aria-hidden
        className="ms-float pointer-events-none absolute -right-20 -top-24 h-72 w-72 rounded-full opacity-[0.22] blur-2xl"
        style={{ background: `radial-gradient(circle, ${t.glow} 0%, ${t.soft} 55%, transparent 75%)` }}
      />
      {/* Hairline arc, bottom-left — structure without another card */}
      <div
        aria-hidden
        className="pointer-events-none absolute -left-16 -bottom-24 h-56 w-56 rounded-full border opacity-[0.13]"
        style={{ borderColor: t.soft, borderWidth: 24 }}
      />

      <div className="relative flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-col gap-2.5 max-w-2xl">
          <div className="flex flex-wrap items-center gap-2.5">
            <span
              className="inline-flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider"
              style={{ color: t.soft }}
            >
              {Icon && <Icon className="h-3.5 w-3.5" />}
              {eyebrow}
            </span>
            {badge && (
              <span className="inline-flex items-center rounded-full bg-white/15 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white/90 backdrop-blur-sm">
                {badge}
              </span>
            )}
          </div>

          <h1 className="font-serif text-3xl sm:text-[2.6rem] font-normal leading-[1.1] tracking-tight text-white">
            {title}
          </h1>

          {sub && <p className="text-sm sm:text-base leading-relaxed text-white/75 max-w-xl">{sub}</p>}

          {children}
        </div>

        {aside && <div className="flex w-full justify-center lg:w-auto lg:shrink-0 lg:justify-end">{aside}</div>}
      </div>
    </section>
  );
}

/**
 * Circular progress used in the hero aside — reads as progress at a glance in
 * a way a horizontal bar in a sidebar never did.
 */
export function ProgressRing({
  value,
  total,
  label,
  size = 108,
}: {
  value: number;
  total: number;
  label: string;
  size?: number;
}) {
  const pct = total > 0 ? Math.round((value / total) * 100) : 0;
  const r = size / 2 - 8;
  const circumference = 2 * Math.PI * r;
  const dash = (pct / 100) * circumference;

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="-rotate-90" role="img" aria-label={`${pct}% complete`}>
          <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="rgba(255,255,255,0.18)" strokeWidth={8} />
          <circle
            cx={size / 2}
            cy={size / 2}
            r={r}
            fill="none"
            stroke="#FFFFFF"
            strokeWidth={8}
            strokeLinecap="round"
            strokeDasharray={`${dash} ${circumference}`}
            style={{ transition: 'stroke-dasharray 900ms cubic-bezier(0.16,1,0.3,1)' }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-2xl font-bold leading-none tabular-nums">
            {value}
            <span className="text-sm font-normal text-white/60">/{total}</span>
          </span>
        </div>
      </div>
      <p className="text-[11px] font-medium uppercase tracking-wider text-white/60">{label}</p>
    </div>
  );
}

/** Compact stat block for a hero aside. */
export function HeroStat({ label, value, hint }: { label: string; value: ReactNode; hint?: string }) {
  return (
    <div className="rounded-2xl bg-white/10 backdrop-blur-sm px-4 py-3 border border-white/10 min-w-[130px]">
      <p className="text-[10px] font-semibold uppercase tracking-wider text-white/60">{label}</p>
      <p className="mt-1 text-xl font-bold leading-none text-white">{value}</p>
      {hint && <p className="mt-1 text-[11px] text-white/55">{hint}</p>}
    </div>
  );
}
