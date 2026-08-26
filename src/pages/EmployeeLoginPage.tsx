import { useState } from 'react';
import { Link, Navigate, useLocation } from 'react-router-dom';
import { Loader2, ShieldCheck, Sparkles, Lock } from 'lucide-react';
import { useEmployeeAuth } from '@/app/EmployeeAuthContext';

export function EmployeeLoginPage() {
  const { user, signInWithGoogle, ready, isConfigured } = useEmployeeAuth();
  const location = useLocation();

  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const from = (location.state as { from?: string } | null)?.from ?? '/app';

  if (ready && user) return <Navigate to={from} replace />;

  async function handleGoogleSignIn() {
    setError(null);
    setBusy(true);
    try {
      await signInWithGoogle();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not start Google sign-in.');
      setBusy(false);
    }
  }

  return (
    <div className="relative min-h-screen w-full bg-[#FAF7F2] text-[#243327] flex flex-col justify-between p-6 sm:p-10 lg:px-16 lg:py-12 selection:bg-[#E5ECE6] overflow-x-hidden font-sans">
      {/* Soft Ambient Glows */}
      <div
        aria-hidden
        className="pointer-events-none absolute -right-20 -top-20 h-[500px] w-[500px] opacity-25 blur-3xl rounded-full"
        style={{ background: 'radial-gradient(circle, #8EA994 0%, #C2D4C5 50%, transparent 70%)' }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -left-20 top-[400px] h-[450px] w-[450px] opacity-20 blur-3xl rounded-full"
        style={{ background: 'radial-gradient(circle, #C2D4C5 0%, #E8EFE9 50%, transparent 70%)' }}
      />

      <header className="relative w-full max-w-7xl mx-auto flex items-center justify-between">
        <Link to="/" className="flex items-center gap-3 hover:opacity-90 transition-opacity">
          <img src="/mindspace-wordmark.png" alt="MindSpace" className="h-8 w-auto object-contain" />
        </Link>

        <span className="hidden sm:inline-flex items-center gap-1.5 rounded-full bg-[#E8F0EA] px-3.5 py-1 text-xs font-semibold text-[#2D6A4F]">
          <Sparkles className="h-3.5 w-3.5" />
          Employee Portal
        </span>
      </header>

      <main className="relative w-full max-w-7xl mx-auto my-auto grid grid-cols-1 gap-12 lg:grid-cols-12 lg:items-center py-8 sm:py-12">
        {/* Left Column: Hero Narrative */}
        <div className="flex flex-col gap-6 lg:col-span-7 max-w-2xl">
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#78897B]">WELLBEING HUB</span>
            <span className="rounded-full bg-[#E8F0EA] text-[#2D6A4F] px-2 py-0.5 text-[10px] font-bold">100% PRIVATE</span>
          </div>

          <h1 className="font-serif text-4xl sm:text-5xl lg:text-[3.65rem] font-normal leading-[1.12] tracking-tight text-[#233226]">
            A space that's <span className="text-[#2D6A4F] italic">just yours</span>.
          </h1>

          <p className="text-sm sm:text-base leading-relaxed text-[#56685A] max-w-xl">
            Talk to Tara anytime, take unlimited assessments, and book licensed therapists, fully covered by your employer.
          </p>

          <div className="border-l-2 border-[#2D6A4F]/40 pl-4 py-1 max-w-lg">
            <p className="font-serif italic text-sm sm:text-base text-[#233226] leading-snug">
              "Your wellbeing data is strictly confidential."
            </p>
            <p className="text-xs text-[#78897B] mt-1">
              Leadership sees anonymized, aggregated insights only, never your name, answers, or sessions.
            </p>
          </div>

          <div className="flex items-center gap-2 pt-2 text-xs text-[#56685A]">
            <ShieldCheck className="h-4 w-4 shrink-0 text-[#2D6A4F]" />
            <span>Single Sign-On with Google Workspace. Protected by end-to-end k-anonymity.</span>
          </div>
        </div>

        {/* Right Column: Floating White Sign-in Card */}
        <div className="flex flex-col items-center lg:items-end lg:col-span-5">
          <div className="w-full max-w-[440px]">
            <div className="rounded-[32px] bg-white p-8 sm:p-10 border border-[#EAE4D9] shadow-[0_30px_60px_-15px_rgba(35,50,38,0.14)] text-slate-900">
              <div className="flex items-center justify-between mb-4">
                <img src="/mindspace-wordmark.png" alt="MindSpace" className="h-6 w-auto object-contain" />
                <span className="text-[11px] font-medium text-neutral-500">SSO Portal</span>
              </div>

              <h2 className="font-serif text-2xl sm:text-3xl font-normal tracking-tight text-slate-900">
                Sign in to your account
              </h2>
              <p className="mt-1.5 text-xs sm:text-sm text-slate-500">One tap with your Google or enterprise account.</p>

              <div className="mt-7 flex flex-col gap-4">
                {error && (
                  <p role="alert" className="rounded-xl bg-red-50 border border-red-200/80 p-3 text-xs text-red-600">
                    {error}
                  </p>
                )}

                {!isConfigured && (
                  <p className="rounded-xl bg-amber-50 border border-amber-200/80 p-3 text-xs text-amber-700">
                    Sign-in preview mode. Click below to enter with demo employee session.
                  </p>
                )}

                <button
                  type="button"
                  onClick={() => void handleGoogleSignIn()}
                  disabled={busy}
                  className="w-full inline-flex items-center justify-center gap-3 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-800 py-3.5 px-4 text-xs sm:text-sm font-semibold shadow-xs transition-colors disabled:opacity-60 cursor-pointer"
                >
                  {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <GoogleG />}
                  <span>Continue with Google</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>

      <footer className="relative w-full max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-4 pt-6 text-xs text-[#78897B]">
        <p>© 2026 MindSpace. All rights reserved.</p>
        <Link to="/login" className="hover:text-[#233226] transition-colors flex items-center gap-1">
          <Lock className="h-3 w-3" />
          <span>People & HR Team Portal</span>
        </Link>
      </footer>
    </div>
  );
}

function GoogleG() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" aria-hidden>
      <path fill="#4285F4" d="M23.52 12.27c0-.82-.07-1.6-.2-2.36H12v4.47h6.47c-.28 1.5-1.13 2.77-2.42 3.62v3.01h3.53c2.08-1.92 3.24-4.74 3.24-8.74z" />
      <path fill="#34A853" d="M12 24c3.24 0 5.95-1.07 7.93-2.9l-3.53-3.01c-1 .67-2.31 1.07-4.4 1.07-3.4 0-6.28-2.29-7.31-5.38H.99v3.10C2.95 21.3 7.13 24 12 24z" />
      <path fill="#FBBC05" d="M4.69 13.78A7.15 7.15 0 0 1 4.31 12c0-.62.11-1.22.31-1.78V7.12H.99A11.98 11.98 0 0 0 0 12c0 1.93.46 3.76.99 4.88l3.7-3.10z" />
      <path fill="#EA4335" d="M12 4.75c1.76 0 3.34.6 4.58 1.78l3.14-3.13C17.94 1.19 15.24 0 12 0 7.13 0 2.95 2.7.99 7.12l3.7 2.9C5.72 7.03 8.6 4.75 12 4.75z" />
    </svg>
  );
}

export default EmployeeLoginPage;
