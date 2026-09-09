import { ArrowDownRight, ArrowUpRight, Minus } from 'lucide-react';
import { MAGNITUDE_HUE, MAGNITUDE_MUTED } from './chart-theme';

/**
 * A stat tile, not a one-bar bar chart. When the data is a single current
 * value the number *is* the chart; a tile with a delta and a sparkline says
 * more in less space than any plot of one point could.
 *
 * Values use the font's default proportional figures — `tabular-nums` gives
 * every digit the width of a zero, which makes a number like 121 look loose at
 * display sizes. Tabular figures are reserved for columns that align.
 */
export function StatTile({
  label,
  value,
  sub,
  delta,
  deltaLabel,
  upIsGood = true,
  trend,
}: {
  label: string;
  value: string;
  sub?: string;
  /** Signed change vs the previous period. Omit when there's no comparison. */
  delta?: number;
  deltaLabel?: string;
  upIsGood?: boolean;
  /** Sparkline series. Last point is drawn in the accent, the rest recede. */
  trend?: number[];
}) {
  const hasDelta = typeof delta === 'number' && Number.isFinite(delta);
  const direction = !hasDelta || delta === 0 ? 'flat' : delta! > 0 ? 'up' : 'down';
  const isGood = direction === 'flat' ? null : (direction === 'up') === upIsGood;
  const deltaColor = isGood === null ? '#78897B' : isGood ? '#2F7F4C' : '#9E6B38';
  const DeltaIcon = direction === 'flat' ? Minus : direction === 'up' ? ArrowUpRight : ArrowDownRight;

  return (
    <div className="group rounded-[22px] bg-white border border-[#EAE4D9] shadow-xs p-5 flex flex-col gap-2 transition-all duration-300 hover:-translate-y-0.5 hover:border-[#2D6A4F]/30 hover:shadow-[0_16px_36px_-18px_rgba(35,50,38,0.28)]">
      <p className="text-[11px] font-medium text-[#78897B] leading-snug">{label}</p>

      <div className="flex items-end justify-between gap-3">
        <p className="text-3xl font-semibold tracking-tight text-[#233226] leading-none">{value}</p>
        {trend && trend.length > 1 && <Sparkline values={trend} />}
      </div>

      {(sub || hasDelta) && (
        <div className="flex flex-wrap items-center gap-x-2 gap-y-1 mt-0.5">
          {hasDelta && (
            <span className="inline-flex items-center gap-0.5 text-[11px] font-semibold" style={{ color: deltaColor }}>
              <DeltaIcon className="h-3 w-3" aria-hidden />
              <span>
                {delta! > 0 ? '+' : ''}
                {delta}
              </span>
              {deltaLabel && <span className="font-normal text-[#78897B] ml-0.5">{deltaLabel}</span>}
            </span>
          )}
          {sub && <span className="text-[11px] text-[#78897B]">{sub}</span>}
        </div>
      )}
    </div>
  );
}

/** 12-point sparkline: the run in the de-emphasis hue, the current point accented. */
function Sparkline({ values }: { values: number[] }) {
  const pts = values.slice(-12);
  const w = 68;
  const h = 24;
  const min = Math.min(...pts);
  const max = Math.max(...pts);
  const span = max - min || 1;
  const step = pts.length > 1 ? w / (pts.length - 1) : w;
  const coords = pts.map((v, i) => [i * step, h - ((v - min) / span) * (h - 4) - 2] as const);
  const d = coords.map(([x, y], i) => `${i === 0 ? 'M' : 'L'}${x.toFixed(1)},${y.toFixed(1)}`).join(' ');
  const [lastX, lastY] = coords[coords.length - 1];

  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} className="shrink-0 overflow-visible" role="img" aria-hidden>
      <path d={d} fill="none" stroke={MAGNITUDE_MUTED} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
      {/* 2px surface ring keeps the end dot legible where it crosses the line. */}
      <circle cx={lastX} cy={lastY} r={4} fill={MAGNITUDE_HUE} stroke="#FFFFFF" strokeWidth={2} />
    </svg>
  );
}

/** The one number a view leads with. Exactly one per page, same sans as everything else. */
export function HeroFigure({ value, label, sub }: { value: string; label: string; sub?: string }) {
  return (
    <div className="flex flex-col gap-1">
      <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-[#78897B]">{label}</p>
      <p className="text-5xl sm:text-6xl font-semibold tracking-tight text-[#233226] leading-none">{value}</p>
      {sub && <p className="text-xs text-[#56685A] mt-1">{sub}</p>}
    </div>
  );
}
