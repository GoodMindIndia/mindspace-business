import type { ReactNode } from 'react';
import { ClipboardList } from 'lucide-react';

export function PageHeading({
  eyebrow,
  title,
  sub,
  action,
}: {
  eyebrow: string;
  title: string;
  sub: string;
  action?: ReactNode;
}) {
  return (
    <header className="flex flex-col gap-4 border-b border-border/60 pb-6 sm:flex-row sm:items-end sm:justify-between">
      <div className="max-w-2xl">
        <p className="flex items-center gap-2 text-xs font-medium uppercase tracking-[0.18em] text-ds-mid">
          <span aria-hidden className="h-3 w-[3px] rounded-full bg-[#2D6A4F]" />
          {eyebrow}
        </p>
        <h1 className="mt-2.5 font-serif text-[2rem] font-normal leading-tight tracking-tight text-ds-base">{title}</h1>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{sub}</p>
      </div>
      {action}
    </header>
  );
}

/** Skeleton shown while the model writes the report. Deliberately shaped like
 * prose, not like a spinner over a chart — what's loading is writing. */
export function ReportSkeleton() {
  return (
    <div className="flex animate-pulse flex-col gap-6" aria-busy>
      <div className="h-8 w-2/3 rounded-lg bg-ds-tint" />
      <div className="flex flex-col gap-2.5">
        <div className="h-4 w-full rounded bg-ds-tint" />
        <div className="h-4 w-11/12 rounded bg-ds-tint" />
        <div className="h-4 w-9/12 rounded bg-ds-tint" />
      </div>
      <div className="h-40 w-full rounded-2xl bg-ds-tint" />
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="h-32 rounded-2xl bg-ds-tint" />
        <div className="h-32 rounded-2xl bg-ds-tint" />
      </div>
    </div>
  );
}

/** Shown once loading has finished and nobody has completed a real
 * assessment yet. An honest empty state, not a report written from zero
 * responses — same principle as the Overview page's "Not set up yet" tiles. */
export function NotEnoughAssessmentData() {
  return (
    <div className="flex flex-col items-center gap-4 rounded-[28px] border border-dashed border-[#D9D2C5] bg-[#FAF7F2] px-6 py-16 text-center">
      <span className="flex h-12 w-12 items-center justify-center rounded-full bg-white border border-[#EAE4D9] text-[#2D6A4F]">
        <ClipboardList className="h-5 w-5" />
      </span>
      <div className="flex flex-col gap-1.5 max-w-sm">
        <p className="font-serif text-lg text-[#233226]">No assessment results yet</p>
        <p className="text-xs sm:text-sm text-[#78897B] leading-relaxed">
          This page fills in once employees start taking the workplace assessments at{' '}
          <code className="rounded bg-white px-1 py-0.5 border border-[#EAE4D9]">/app/assessments</code>. The Overview
          page's counts already update live; this narrative view needs enough responses to say something real.
        </p>
      </div>
    </div>
  );
}
