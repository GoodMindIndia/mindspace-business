import { useEffect, useState, type FormEvent } from 'react';
import { CalendarHeart, Check, Loader2, ShieldCheck, UserRound } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useEmployeeAuth } from '@/app/EmployeeAuthContext';
import { useTenant } from '@/app/TenantContext';
import { formatRupees } from '@/admin/charts/chart-theme';
import { listMyBookings, requestBooking, type EmployeeBooking } from '@/services/booking-service';
import { SESSION_LABELS_BY_FORMAT } from '@/employee/format-labels';

export function BookSessionPage() {
  const { user } = useEmployeeAuth();
  const { organization } = useTenant();
  const [slot, setSlot] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [confirmed, setConfirmed] = useState(false);
  const [bookings, setBookings] = useState<EmployeeBooking[]>([]);

  const { individualSessionPaise, payer } = organization.pricing;

  useEffect(() => {
    if (!user) return;
    let cancelled = false;
    listMyBookings(user.id).then((rows) => {
      if (!cancelled) setBookings(rows);
    });
    return () => {
      cancelled = true;
    };
  }, [user, confirmed]);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!user || !slot) return;
    setSubmitting(true);
    setError(null);
    try {
      await requestBooking(user.id, organization.orgId, {
        sessionFormat: '1:1',
        preferredSlot: new Date(slot).toISOString(),
      });
      setConfirmed(true);
      setSlot('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not send your request. Please try again.');
    } finally {
      setSubmitting(false);
    }
  }

  const payerCopy: Record<typeof payer, string> = {
    company: `Covered by ${organization.name}, no cost to you.`,
    employee: 'Billed to you directly after your session is confirmed.',
    split: 'Split between you and your employer.',
  };

  return (
    <div className="flex flex-col gap-8 pb-12">
      <header className="flex flex-col gap-1.5">
        <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#78897B]">PRIVATE · BOOKED FROM YOUR PROFILE</p>
        <h1 className="font-serif text-3xl sm:text-4xl font-normal tracking-tight text-[#233226] mt-1">Book a session</h1>
        <p className="max-w-xl text-xs sm:text-sm text-[#56685A] leading-relaxed mt-1">
          {organization.name} sees a usage count, never your name, your reason, or which slot you booked.
        </p>
      </header>

      {confirmed && (
        <div className="rounded-2xl border border-[#B7D3BC] bg-[#EAF3EB] px-4 py-3.5 flex items-start gap-2.5">
          <Check className="mt-0.5 h-4 w-4 shrink-0 text-[#2F7F4C]" />
          <p className="text-xs sm:text-sm leading-relaxed text-[#233226]">
            Request received. MindSpace's clinical desk will confirm your slot directly with you.
          </p>
        </div>
      )}

      {/* Pricing — one-on-one sessions with a therapist, fixed price */}
      <section className="rounded-[24px] bg-white p-6 sm:p-7 border border-[#EAE4D9] shadow-xs flex flex-col sm:flex-row sm:items-center gap-5">
        <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#E8F0EA] text-[#2D6A4F]">
          <UserRound className="h-5 w-5" />
        </span>
        <div className="flex-1">
          <p className="font-serif text-lg font-normal text-[#233226]">{SESSION_LABELS_BY_FORMAT['1:1']}</p>
          <p className="mt-0.5 text-xs text-[#78897B] leading-relaxed">
            One-on-one, fully confidential, with a licensed therapist.
          </p>
        </div>
        <div className="text-left sm:text-right">
          <p className="text-2xl font-semibold text-[#233226]">
            {individualSessionPaise === 0 ? (
              <span className="text-[#2F7F4C] font-bold">100% Sponsored</span>
            ) : (
              <>
                {formatRupees(individualSessionPaise)} <span className="text-xs font-normal text-[#78897B]">/ session</span>
              </>
            )}
          </p>
          <p className="text-[11px] text-[#78897B] mt-0.5">{organization.name} Wellbeing Benefits</p>
        </div>
      </section>

      <p className="text-xs text-[#56685A]">{payerCopy[payer]}</p>

      {/* Slot picker */}
      <form onSubmit={handleSubmit} className="rounded-[28px] bg-white p-6 sm:p-7 border border-[#EAE4D9] shadow-xs flex flex-col gap-4">
        <div>
          <h2 className="font-serif text-xl font-normal text-[#233226]">Pick a time that works</h2>
          <p className="mt-1 text-xs text-[#78897B]">We'll confirm the exact slot with you directly.</p>
        </div>

        <div className="flex flex-col gap-1.5 max-w-sm">
          <label htmlFor="slot" className="text-xs font-medium text-[#233226]">Preferred date &amp; time</label>
          <input
            id="slot"
            type="datetime-local"
            required
            value={slot}
            onChange={(e) => setSlot(e.target.value)}
            min={new Date().toISOString().slice(0, 16)}
            className="rounded-xl border border-[#D9D2C5] bg-[#FAF7F2] px-4 py-2.5 text-xs sm:text-sm text-[#233226] focus:outline-none focus:ring-2 focus:ring-[#2D6A4F]/40 focus:border-[#2D6A4F]"
          />
        </div>

        {error && (
          <p role="alert" className="rounded-xl border border-red-200 bg-red-50 p-3 text-xs text-red-600">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={!slot || submitting}
          className={cn(
            'inline-flex items-center justify-center gap-2 self-start rounded-full px-7 py-3 text-xs sm:text-sm font-semibold transition-all',
            slot && !submitting
              ? 'bg-[#2D6A4F] hover:bg-[#234F3B] text-white shadow-xs hover:scale-105 cursor-pointer'
              : 'bg-[#EAE4D9] text-[#8C9B8F] cursor-not-allowed',
          )}
        >
          {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <CalendarHeart className="h-4 w-4" />}
          <span>{submitting ? 'Sending…' : 'Request this session'}</span>
        </button>
      </form>

      {/* Past requests */}
      {bookings.length > 0 && (
        <section className="rounded-[28px] bg-white p-6 sm:p-7 border border-[#EAE4D9] shadow-xs">
          <h2 className="font-serif text-xl font-normal text-[#233226]">Your requests</h2>
          <ul className="mt-4 flex flex-col gap-2.5">
            {bookings.map((b) => (
              <li key={b.id} className="flex items-center justify-between gap-4 rounded-xl bg-[#FAF7F2] p-3.5 border border-[#EAE4D9]">
                <div>
                  <p className="text-xs sm:text-sm font-medium text-[#233226]">{SESSION_LABELS_BY_FORMAT[b.sessionFormat]}</p>
                  {b.preferredSlot && (
                    <p className="text-[11px] text-[#78897B]">{new Date(b.preferredSlot).toLocaleString()}</p>
                  )}
                </div>
                <span className="rounded-full bg-[#F3EEE5] px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide text-[#56685A]">
                  {b.status}
                </span>
              </li>
            ))}
          </ul>
        </section>
      )}

      <footer className="flex items-center gap-2 text-[11px] text-[#78897B]">
        <ShieldCheck className="h-3.5 w-3.5" />
        <span>Your employer only ever sees an aggregate count of sessions booked, never who, when, or why.</span>
      </footer>
    </div>
  );
}
