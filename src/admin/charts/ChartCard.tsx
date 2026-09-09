import { useState, type ReactNode } from 'react';
import { ShieldCheck, Table2, BarChart3 } from 'lucide-react';
import { CHART_INK } from './chart-theme';

export interface ChartTable {
  columns: string[];
  rows: (string | number)[][];
}

/**
 * The frame every chart on this console sits in.
 *
 * Beyond the visual shell it carries the two things that are easy to forget
 * and non-negotiable: a **table view** of the same numbers (so no value is
 * reachable only by hovering a coloured mark), and the **k-anonymity note**
 * wherever a cut could otherwise be read as being about a person.
 */
export function ChartCard({
  title,
  caption,
  figure,
  legend,
  table,
  masked,
  children,
}: {
  title: string;
  /** One short line under the title. This is where narrative goes now — not paragraphs. */
  caption?: string;
  /** Optional headline number, shown top-right. */
  figure?: ReactNode;
  legend?: ReactNode;
  table?: ChartTable;
  /** Set when the chart hides small groups, to explain the gap. */
  masked?: { k: number; hiddenCount: number };
  children: ReactNode;
}) {
  const [showTable, setShowTable] = useState(false);

  return (
    <section className="rounded-[28px] bg-white p-6 sm:p-7 border border-[#EAE4D9] shadow-xs flex flex-col gap-5 transition-shadow duration-300 hover:shadow-[0_18px_44px_-22px_rgba(35,50,38,0.25)]">
      <header className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="font-serif text-lg sm:text-xl font-normal text-[#233226]">{title}</h3>
          {caption && <p className="mt-1 text-xs text-[#78897B] leading-relaxed max-w-xl">{caption}</p>}
        </div>
        <div className="flex items-center gap-3 shrink-0">
          {figure}
          {table && (
            <button
              type="button"
              onClick={() => setShowTable((v) => !v)}
              aria-pressed={showTable}
              title={showTable ? 'Show the chart' : 'Show the numbers as a table'}
              className="inline-flex items-center gap-1.5 rounded-full border border-[#D9D2C5] bg-[#FAF7F2] px-2.5 py-1 text-[11px] font-medium text-[#3E4F42] hover:bg-[#F3EEE5] transition-colors cursor-pointer"
            >
              {showTable ? <BarChart3 className="h-3 w-3" /> : <Table2 className="h-3 w-3" />}
              <span>{showTable ? 'Chart' : 'Table'}</span>
            </button>
          )}
        </div>
      </header>

      {legend && !showTable && <div className="flex flex-wrap items-center gap-x-4 gap-y-2">{legend}</div>}

      {showTable && table ? (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-[#EAE4D9]">
                {table.columns.map((c, i) => (
                  <th
                    key={c}
                    className={`py-2 pr-4 font-semibold text-[#56685A] ${i > 0 ? 'text-right tabular-nums' : ''}`}
                  >
                    {c}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {table.rows.map((row, ri) => (
                <tr key={ri} className="border-b border-[#EAE4D9]/60 last:border-0">
                  {row.map((cell, ci) => (
                    <td
                      key={ci}
                      className={`py-2 pr-4 ${
                        ci > 0 ? 'text-right tabular-nums text-[#233226] font-medium' : 'text-[#56685A]'
                      }`}
                    >
                      {cell}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        children
      )}

      {masked && masked.hiddenCount > 0 && (
        <p className="flex items-center gap-1.5 text-[11px] text-[#78897B] border-t border-[#EAE4D9]/70 pt-3">
          <ShieldCheck className="h-3 w-3 shrink-0" aria-hidden />
          <span>
            {masked.hiddenCount} group{masked.hiddenCount === 1 ? '' : 's'} hidden, fewer than {masked.k} people
            answered, so showing a number could identify someone.
          </span>
        </p>
      )}
    </section>
  );
}

/** Legend key. Identity comes from the swatch beside the text, never from
 * colouring the text itself — a light hue is illegible as type. */
export function LegendKey({ color, label, shape = 'square' }: { color: string; label: string; shape?: 'square' | 'line' }) {
  return (
    <span className="inline-flex items-center gap-1.5 text-[11px] text-[#56685A]">
      <span
        aria-hidden
        className={shape === 'line' ? 'h-[2px] w-4 rounded-full' : 'h-2.5 w-2.5 rounded-[3px]'}
        style={{ backgroundColor: color }}
      />
      <span>{label}</span>
    </span>
  );
}

/** Shared tooltip body. Tooltips enhance — they never gate a value, which is
 * why the table toggle above exists on every chart. */
export function TooltipShell({ title, rows }: { title: string; rows: { label: string; value: string; color?: string }[] }) {
  return (
    <div className="rounded-xl border border-[#EAE4D9] bg-white px-3 py-2 shadow-lg">
      <p className="text-[11px] font-semibold text-[#233226]">{title}</p>
      <div className="mt-1 flex flex-col gap-0.5">
        {rows.map((r) => (
          <p key={r.label} className="flex items-center gap-2 text-[11px] text-[#56685A]">
            {r.color && (
              <span aria-hidden className="h-2 w-2 rounded-[2px] shrink-0" style={{ backgroundColor: r.color }} />
            )}
            <span>{r.label}</span>
            <span className="ml-auto font-medium text-[#233226] tabular-nums">{r.value}</span>
          </p>
        ))}
      </div>
    </div>
  );
}

export { CHART_INK };
