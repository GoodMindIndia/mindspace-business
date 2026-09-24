import { useEffect, useState, type FormEvent } from 'react';
import { ArrowRight, Building2, CheckCircle2, Loader2, Mail, MessageSquare, Users2, X } from 'lucide-react';
import { submitDemoRequest } from '@/services/demo-request-service';

const SIZE_OPTIONS = ['1–50', '51–200', '201–1,000', '1,000+'];

export function DemoRequestModal({
  open,
  onClose,
  source,
}: {
  open: boolean;
  onClose: () => void;
  /** Which CTA opened this — recorded with the lead so sales knows what worked. */
  source: string;
}) {
  const [companyName, setCompanyName] = useState('');
  const [workEmail, setWorkEmail] = useState('');
  const [companySize, setCompanySize] = useState(SIZE_OPTIONS[1]);
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState<'idle' | 'sent' | 'unavailable'>('idle');

  // Escape to close, and don't let the page scroll behind the modal.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    document.addEventListener('keydown', onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [open, onClose]);

  if (!open) return null;

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    try {
      await submitDemoRequest({ companyName, workEmail, companySize, message, sourcePage: source });
      setStatus('sent');
    } catch {
      // Either not configured, or a transient failure — either way, give
      // the visitor a real way to reach us rather than a dead end.
      setStatus('unavailable');
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6" role="dialog" aria-modal="true">
      <button
        aria-label="Close"
        onClick={onClose}
        className="absolute inset-0 bg-[#1C241E]/45 backdrop-blur-[2px] cursor-pointer animate-in fade-in duration-200"
      />

      <div className="relative w-full max-w-lg rounded-[28px] bg-white border border-[#EAE4D9] shadow-[0_40px_100px_-30px_rgba(20,30,20,0.35)] animate-in fade-in zoom-in-95 duration-200">
        <button
          type="button"
          onClick={onClose}
          aria-label="Close dialog"
          className="absolute right-4 top-4 sm:right-5 sm:top-5 flex h-8 w-8 items-center justify-center rounded-full text-[#78897B] hover:bg-[#F3EFE8] hover:text-[#233226] transition-colors cursor-pointer"
        >
          <X className="h-4 w-4" />
        </button>

        {status === 'sent' ? (
          <div className="p-8 sm:p-10 flex flex-col items-center text-center gap-3">
            <span className="flex h-12 w-12 items-center justify-center rounded-full bg-[#E8F0EA] text-[#2D6A4F]">
              <CheckCircle2 className="h-6 w-6" />
            </span>
            <h2 className="font-serif text-xl sm:text-2xl font-normal text-[#233226]">Request received</h2>
            <p className="text-sm text-[#56685A] max-w-xs">
              We'll be in touch at <strong className="text-[#233226]">{workEmail}</strong> within one business day to
              set up a walkthrough with your own org's data.
            </p>
            <button
              type="button"
              onClick={onClose}
              className="mt-3 inline-flex items-center gap-2 rounded-xl bg-[#2D6A4F] hover:bg-[#234F3B] text-white px-5 py-2.5 text-xs font-semibold transition-colors cursor-pointer"
            >
              Done
            </button>
          </div>
        ) : status === 'unavailable' ? (
          <div className="p-8 sm:p-10 flex flex-col items-center text-center gap-3">
            <span className="flex h-12 w-12 items-center justify-center rounded-full bg-[#F4EBE2] text-[#9E6B38]">
              <Mail className="h-6 w-6" />
            </span>
            <h2 className="font-serif text-xl sm:text-2xl font-normal text-[#233226]">Reach us directly</h2>
            <p className="text-sm text-[#56685A] max-w-xs">
              Our request form is between deploys right now: email us and we'll get back to you within one business
              day.
            </p>
            <a
              href="mailto:hello@mindspace.example?subject=Demo request"
              className="mt-3 inline-flex items-center gap-2 rounded-xl bg-[#2D6A4F] hover:bg-[#234F3B] text-white px-5 py-2.5 text-xs font-semibold transition-colors"
            >
              <span>hello@mindspace.example</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </a>
          </div>
        ) : (
          <div className="p-7 sm:p-9">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-[#F4EBE2] px-3 py-1 text-[11px] font-semibold text-[#9E6B38]">
              REQUEST A DEMO
            </span>
            <h2 className="mt-3 font-serif text-2xl sm:text-[1.7rem] font-normal tracking-tight text-[#233226] leading-tight">
              See MindSpace with your own org's data
            </h2>
            <p className="mt-1.5 text-xs sm:text-sm text-[#56685A]">
              Tell us a little about your team and we'll set up a walkthrough.
            </p>

            <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="dr-company" className="text-xs font-medium text-slate-700 flex items-center gap-1.5">
                    <Building2 className="h-3.5 w-3.5 text-[#78897B]" />
                    Company name
                  </label>
                  <input
                    id="dr-company"
                    required
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    placeholder="Acme Corp"
                    className="w-full rounded-xl bg-[#FAF7F2] border border-[#D9D2C5] px-4 py-3 text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-[#2D6A4F] focus:outline-none focus:ring-2 focus:ring-[#2D6A4F]/30 transition-all"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label htmlFor="dr-size" className="text-xs font-medium text-slate-700 flex items-center gap-1.5">
                    <Users2 className="h-3.5 w-3.5 text-[#78897B]" />
                    Company size
                  </label>
                  <select
                    id="dr-size"
                    value={companySize}
                    onChange={(e) => setCompanySize(e.target.value)}
                    className="w-full rounded-xl bg-[#FAF7F2] border border-[#D9D2C5] px-4 py-3 text-xs sm:text-sm text-slate-900 focus:bg-white focus:border-[#2D6A4F] focus:outline-none focus:ring-2 focus:ring-[#2D6A4F]/30 transition-all cursor-pointer"
                  >
                    {SIZE_OPTIONS.map((s) => (
                      <option key={s} value={s}>
                        {s} employees
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label htmlFor="dr-email" className="text-xs font-medium text-slate-700 flex items-center gap-1.5">
                  <Mail className="h-3.5 w-3.5 text-[#78897B]" />
                  Work email
                </label>
                <input
                  id="dr-email"
                  type="email"
                  required
                  value={workEmail}
                  onChange={(e) => setWorkEmail(e.target.value)}
                  placeholder="you@company.com"
                  className="w-full rounded-xl bg-[#FAF7F2] border border-[#D9D2C5] px-4 py-3 text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-[#2D6A4F] focus:outline-none focus:ring-2 focus:ring-[#2D6A4F]/30 transition-all"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label htmlFor="dr-message" className="text-xs font-medium text-slate-700 flex items-center gap-1.5">
                  <MessageSquare className="h-3.5 w-3.5 text-[#78897B]" />
                  What are you hoping to solve? <span className="text-slate-400 font-normal">(optional)</span>
                </label>
                <textarea
                  id="dr-message"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  rows={2}
                  placeholder="e.g. we need visibility into burnout before it shows up as attrition"
                  className="w-full resize-none rounded-xl bg-[#FAF7F2] border border-[#D9D2C5] px-4 py-3 text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-[#2D6A4F] focus:outline-none focus:ring-2 focus:ring-[#2D6A4F]/30 transition-all"
                />
              </div>

              <button
                type="submit"
                disabled={busy}
                className="mt-1 w-full inline-flex items-center justify-center gap-2 rounded-xl bg-[#9E6B38] hover:bg-[#835A2E] text-white py-3.5 text-xs sm:text-sm font-semibold shadow-sm transition-colors disabled:opacity-60 cursor-pointer"
              >
                {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <ArrowRight className="h-4 w-4" />}
                <span>Request a demo</span>
              </button>
              <p className="text-center text-[11px] text-[#78897B]">We'll reply within one business day. No spam.</p>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
