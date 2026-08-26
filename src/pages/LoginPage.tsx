import { useState, type FormEvent } from 'react';
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { ArrowRight, Eye, EyeOff, Loader2, Lock, ShieldCheck, Sparkles } from 'lucide-react';
import { useAuth, DEMO_LOGIN_HINT } from '@/app/AuthContext';
import { useTenant } from '@/app/TenantContext';

export function LoginPage() {
  const { user, signIn, isDemoAuth } = useAuth();
  const { organization } = useTenant();
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const from = (location.state as { from?: string } | null)?.from ?? '/admin';

  if (user) return <Navigate to={from} replace />;

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setBusy(true);
    try {
      await signIn(email, password);
      navigate(from, { replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not sign you in.');
    } finally {
      setBusy(false);
    }
  }

  function useDemoAccount() {
    setEmail(DEMO_LOGIN_HINT.email);
    setPassword(DEMO_LOGIN_HINT.password);
  }

  return (
    <div className="relative min-h-screen w-full bg-[#FAF7F2] text-[#243327] flex flex-col justify-between p-6 sm:p-10 lg:px-16 lg:py-12 selection:bg-[#E5ECE6] overflow-x-hidden font-sans">
      {/* Soft Ambient Botanical Glows — same treatment as the landing page */}
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

      {/* Top Header Logo */}
      <header className="relative w-full max-w-7xl mx-auto flex items-center justify-between">
        <Link to="/" className="flex items-center gap-3 hover:opacity-90 transition-opacity">
          <img src="/mindspace-wordmark.png" alt="MindSpace" className="h-8 w-auto object-contain" />
        </Link>

        <span className="hidden sm:inline-flex items-center gap-1.5 rounded-full bg-[#E8F0EA] px-3.5 py-1 text-xs font-semibold text-[#2D6A4F]">
          <Sparkles className="h-3.5 w-3.5" />
          People Console
        </span>
      </header>

      {/* Main Grid: Well-balanced Layout */}
      <main className="relative w-full max-w-7xl mx-auto my-auto grid grid-cols-1 gap-12 lg:grid-cols-12 lg:items-center py-8 sm:py-12">
        {/* Left Column: Hero Narrative */}
        <div className="flex flex-col gap-6 lg:col-span-7 max-w-2xl">
          <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#78897B]">
            FOR THE PEOPLE TEAM
          </p>

          <h1 className="font-serif text-4xl sm:text-5xl lg:text-[3.65rem] font-normal leading-[1.12] tracking-tight text-[#233226]">
            You don't need another chart.
            <br />
            You need to know how your people actually feel.
          </h1>

          <p className="text-sm sm:text-base leading-relaxed text-[#56685A] max-w-xl">
            Anonymous monthly check-ins, turned into a plain-English report: what's weighing on people, why, and what to change.
          </p>

          {/* Quote Callout with Left Border Accent */}
          <div className="border-l-2 border-[#2D6A4F]/40 pl-4 py-1 max-w-lg">
            <p className="font-serif italic text-sm sm:text-base text-[#233226] leading-snug">
              “Operations is running late three nights a week and it's showing up as sleep loss.”
            </p>
            <p className="text-xs text-[#78897B] mt-1">
              The kind of sentence this report gives you, instead of a score of 58.
            </p>
          </div>

          <div className="flex items-center gap-2 pt-2 text-xs text-[#56685A]">
            <ShieldCheck className="h-4 w-4 shrink-0 text-[#2D6A4F]" />
            <span>Aggregate-only by default. You will never see who said what. That's the point.</span>
          </div>
        </div>

        {/* Right Column: Floating White Sign-in Card */}
        <div className="flex flex-col items-center lg:items-end lg:col-span-5">
          <div className="w-full max-w-[440px]">
            <div className="rounded-[32px] bg-white p-8 sm:p-10 border border-[#EAE4D9] shadow-[0_30px_60px_-15px_rgba(35,50,38,0.14)] text-slate-900">
              <div className="flex items-center justify-between mb-4">
                <img src="/mindspace-wordmark.png" alt="MindSpace" className="h-6 w-auto object-contain" />
                <span className="text-[11px] font-medium text-neutral-500">People Leadership</span>
              </div>
              <h2 className="font-serif text-2xl sm:text-3xl font-normal tracking-tight text-slate-900">
                Sign in to your report
              </h2>
              <p className="mt-1.5 text-xs sm:text-sm text-slate-500">
                For {organization.name} HR and people leaders.
              </p>

              <form onSubmit={handleSubmit} className="mt-7 flex flex-col gap-4">
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="email" className="text-xs font-medium text-slate-700">
                    Work email
                  </label>
                  <input
                    id="email"
                    type="email"
                    autoComplete="username"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="hr@mindspace.example"
                    className="w-full rounded-xl bg-[#FAF7F2] border border-[#D9D2C5] px-4 py-3.5 text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-[#2D6A4F] focus:outline-none focus:ring-2 focus:ring-[#2D6A4F]/30 transition-all"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label htmlFor="password" className="text-xs font-medium text-slate-700">
                    Password
                  </label>
                  <div className="relative">
                    <input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      autoComplete="current-password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••••••"
                      className="w-full rounded-xl bg-[#FAF7F2] border border-[#D9D2C5] px-4 py-3.5 text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-[#2D6A4F] focus:outline-none focus:ring-2 focus:ring-[#2D6A4F]/30 pr-10 transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((s) => !s)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                {error && (
                  <p role="alert" className="rounded-xl bg-red-50 border border-red-200/80 p-3 text-xs text-red-600">
                    {error}
                  </p>
                )}

                <button
                  type="submit"
                  disabled={busy}
                  className="mt-2 w-full rounded-xl bg-[#2D6A4F] hover:bg-[#234F3B] text-white py-3.5 px-4 text-xs sm:text-sm font-semibold flex items-center justify-center gap-2 shadow-xs transition-colors disabled:opacity-60 cursor-pointer"
                >
                  {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Lock className="h-4 w-4" />}
                  <span>Sign in</span>
                </button>

                {isDemoAuth && (
                  <div className="mt-2 rounded-2xl bg-[#FAF7F2] border border-[#EAE4D9] p-4 text-xs text-slate-600 flex flex-col gap-1">
                    <p className="font-semibold text-slate-800 text-xs">Demo tenant</p>
                    <p className="text-[11px] leading-relaxed text-slate-500">
                      Pre-filled with seeded demo data.
                    </p>
                    <button
                      type="button"
                      onClick={useDemoAccount}
                      className="text-xs text-left font-medium text-slate-700 hover:text-slate-900 mt-1 underline underline-offset-2 cursor-pointer transition-colors"
                    >
                      Fill in demo credentials
                    </button>
                  </div>
                )}
              </form>
            </div>

            {/* Link outside card */}
            <div className="mt-6 flex flex-col items-start px-2">
              <p className="text-xs text-[#78897B]">Not from the people team?</p>
              <Link
                to="/app/login"
                className="mt-1 inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-[#233226] hover:underline transition-all"
              >
                <span>Sign in as an employee instead</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      </main>

      {/* Subtle Footer */}
      <footer className="relative w-full max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-4 pt-6 text-xs text-[#78897B]">
        <p>© 2026 MindSpace. All rights reserved.</p>
        <div className="flex items-center gap-6">
          <a href="#" className="hover:text-[#233226] transition-colors">Privacy Policy</a>
          <a href="#" className="hover:text-[#233226] transition-colors">Terms of Service</a>
          <a href="#" className="hover:text-[#233226] transition-colors">Security</a>
          <a href="#" className="hover:text-[#233226] transition-colors">Help Center</a>
        </div>
      </footer>
    </div>
  );
}
