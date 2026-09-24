import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';
import {
  MessageCircleHeart,
  ClipboardList,
  CalendarHeart,
  ShieldCheck,
  ArrowRight,
  Smile,
  Meh,
  Frown,
  Flame,
  SunMedium,
  PhoneCall,
  CheckCircle2,
  Lock,
  HeartHandshake,
  Palette,
} from 'lucide-react';
import { useEmployeeAuth } from '@/app/EmployeeAuthContext';
import { useTenant } from '@/app/TenantContext';
import { cn } from '@/lib/utils';
import { listMyAssessments, type EmployeeAssessmentRecord } from '@/services/employee-assessment-service';
import { ASSESSMENT_TYPES } from '@/domain/assessments';
import { WorkshopRequestCard } from '@/employee/WorkshopRequestCard';
import { saveMoodCheckIn, getMyMoodToday } from '@/services/mood-checkin-service';
import { MOOD_LABELS, type Mood } from '@/domain/mood';

const MOODS: { id: Mood; label: string; icon: typeof Flame }[] = [
  { id: 'energized', label: MOOD_LABELS.energized, icon: Flame },
  { id: 'calm', label: MOOD_LABELS.calm, icon: SunMedium },
  { id: 'okay', label: MOOD_LABELS.okay, icon: Smile },
  { id: 'stressed', label: MOOD_LABELS.stressed, icon: Meh },
  { id: 'overwhelmed', label: MOOD_LABELS.overwhelmed, icon: Frown },
];

export function EmployeeDashboardPage() {
  const { user } = useEmployeeAuth();
  const { organization } = useTenant();
  const [selectedMood, setSelectedMood] = useState<Mood | null>(null);
  const [savingMood, setSavingMood] = useState(false);
  const [completedAssessments, setCompletedAssessments] = useState<number>(0);
  // True when today's check-in was already recorded in an earlier session —
  // shows a locked "recorded" summary instead of the picker. Clicking
  // "Change" unlocks it for the rest of this session; reloading re-locks it
  // if a mood is still on file for today.
  const [moodLocked, setMoodLocked] = useState(false);

  useEffect(() => {
    if (!user) return;
    listMyAssessments(user.id).then((records) => {
      // Records saved under a retired domain name (from before an assessment
      // redesign) shouldn't count toward "X of 6 done" for the current set.
      const currentDomains: Set<string> = new Set(ASSESSMENT_TYPES);
      const uniqueTypes = new Set(records.filter((r) => currentDomains.has(r.domain)).map((r) => r.domain));
      setCompletedAssessments(uniqueTypes.size);
    });
    getMyMoodToday(user.id).then((mood) => {
      setSelectedMood(mood);
      setMoodLocked(mood !== null);
    });
  }, [user]);

  async function pickMood(mood: Mood) {
    if (!user) return;
    setSelectedMood(mood);
    setSavingMood(true);
    try {
      await saveMoodCheckIn(user.id, organization.orgId, mood);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Could not save your check-in.');
    } finally {
      setSavingMood(false);
    }
  }

  const firstName = user?.name ? user.name.split(' ')[0] : 'there';

  return (
    <div className="flex flex-col gap-8 pb-12 font-sans">
      {/* Top Welcome Hero Banner */}
      <section className="ms-fade-up relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#2D6A4F] via-[#2A6149] to-[#234F3B] p-6 sm:p-10 text-white border border-[#234F3B] shadow-[0_20px_50px_-24px_rgba(35,50,38,0.5)]">
        <div
          aria-hidden
          className="ms-float pointer-events-none absolute -right-16 -top-20 h-64 w-64 rounded-full opacity-20 blur-2xl"
          style={{ background: 'radial-gradient(circle, #E8B84B 0%, #A9CBAE 60%, transparent 75%)' }}
        />
        <div className="relative flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div className="flex flex-col gap-3 max-w-2xl">
            <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-[#A9CBAE]">
              <HeartHandshake className="h-3.5 w-3.5" />
              Employee Wellbeing Hub
            </span>

            <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight text-white mt-1">
              Welcome back, <span className="font-serif italic font-normal text-[#C5DBC8]">{firstName}</span>.
            </h1>

            <p className="text-sm sm:text-base text-white/75 leading-relaxed max-w-xl">
              Check in, talk to Tara, or book a session, all in one private space.
            </p>

            <div className="flex items-center gap-2 pt-2 text-xs text-white/70">
              <ShieldCheck className="h-4 w-4 text-[#A9CBAE] shrink-0" />
              <span>100% Confidential · Covered under {organization.name}'s Wellbeing Program</span>
            </div>
          </div>

          {/* Quick Stats Widget */}
          <div className="flex flex-row lg:flex-col gap-3 shrink-0">
            <div className="flex-1 rounded-2xl bg-white/10 p-4 border border-white/10 flex flex-col justify-center">
              <p className="text-[11px] font-medium uppercase tracking-wider text-white/60">Check-ins</p>
              <p className="text-2xl font-bold text-white mt-0.5">
                {completedAssessments} <span className="text-xs font-normal text-white/60">/ {ASSESSMENT_TYPES.length} done</span>
              </p>
            </div>
            <div className="flex-1 rounded-2xl bg-white/10 p-4 border border-white/10 flex flex-col justify-center">
              <p className="text-[11px] font-medium uppercase tracking-wider text-white/60">1:1 Therapy</p>
              <p className="text-sm font-semibold text-[#A9CBAE] mt-0.5 flex items-center gap-1">
                <CheckCircle2 className="h-4 w-4 text-[#A9CBAE]" /> Sponsored
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Mood Pulse Check-in */}
      <section className="rounded-2xl bg-white p-6 sm:p-7 border border-[#EAE4D9] flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl sm:text-2xl font-semibold text-[#233226]">How are you feeling right now?</h2>
            <p className="text-xs text-[#78897B] mt-0.5">{organization.name} sees today's anonymous count, never your name.</p>
          </div>
          <span className="text-xs font-medium text-[#2D6A4F] bg-[#E8F0EA] px-3 py-1 rounded-full">Anonymous</span>
        </div>

        {moodLocked && selectedMood ? (
          (() => {
            const recorded = MOODS.find((m) => m.id === selectedMood)!;
            const RecordedIcon = recorded.icon;
            return (
              <div className="flex items-center justify-between gap-3 rounded-2xl border border-[#D5E5D8] bg-[#F4F8F5] p-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#2D6A4F] text-white shrink-0">
                    <RecordedIcon className="h-5 w-5" />
                  </div>
                  <p className="text-sm text-[#233226]">
                    You checked in as <strong>{recorded.label}</strong> today.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setMoodLocked(false)}
                  className="text-xs font-semibold text-[#2D6A4F] hover:text-[#234F3B] underline underline-offset-2 shrink-0"
                >
                  Change
                </button>
              </div>
            );
          })()
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 pt-2">
            {MOODS.map((mood) => {
              const Icon = mood.icon;
              const isSelected = selectedMood === mood.id;
              return (
                <button
                  key={mood.id}
                  type="button"
                  disabled={savingMood}
                  onClick={() => pickMood(mood.id)}
                  className={cn(
                    'flex flex-col items-center gap-2.5 rounded-2xl p-4 border transition-all duration-200 cursor-pointer text-center disabled:cursor-wait disabled:opacity-70 hover:-translate-y-0.5',
                    isSelected
                      ? 'border-[#2D6A4F] bg-[#F4F8F5] text-[#233226] shadow-[0_10px_24px_-14px_rgba(45,106,79,0.7)]'
                      : 'border-[#EAE4D9] bg-white hover:bg-[#FAF7F2] hover:border-[#C3D0C6] text-[#233226]'
                  )}
                >
                  <div className={cn('flex h-10 w-10 items-center justify-center rounded-full transition-colors', isSelected ? 'bg-[#2D6A4F] text-white' : 'bg-[#F3EFE8] text-[#4A5B4E]')}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <span className="text-xs font-semibold">{mood.label}</span>
                </button>
              );
            })}
          </div>
        )}

        {selectedMood && (
          <div className="mt-2 rounded-2xl bg-[#F4F8F5] border border-[#D5E5D8] p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 animate-fade-in">
            <p className="text-xs sm:text-sm text-[#233226]">
              Want to talk it through with <strong>Tara</strong>, or try a <strong>self-help</strong> exercise?
            </p>
            <div className="flex items-center gap-2 flex-wrap shrink-0">
              <Link
                to="/app/self-help"
                className="inline-flex items-center gap-1 rounded-xl bg-[#2D6A4F] hover:bg-[#234F3B] text-white px-3 py-1.5 text-xs font-semibold shadow-xs transition-colors"
              >
                <Palette className="h-3.5 w-3.5" />
                <span>Self-Help & Doodling</span>
              </Link>
              <Link
                to="/app/tara"
                className="inline-flex items-center gap-1 rounded-xl bg-white hover:bg-[#F3EFE8] text-[#243327] border border-[#D9D2C5] px-3 py-1.5 text-xs font-semibold transition-colors"
              >
                <span>Talk to Tara</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          </div>
        )}
      </section>

      {/* Main Core Features Hub */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Feature 1: Self-Help & Zen Doodling Sanctuary */}
        <div className="rounded-2xl bg-white p-6 sm:p-7 border border-[#EAE4D9] flex flex-col justify-between transition-all duration-300 hover:border-[#2D6A4F]/40 hover:-translate-y-1 hover:shadow-[0_18px_40px_-20px_rgba(35,50,38,0.28)]">
          <div className="flex flex-col gap-4">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#F1EAFB] text-[#7C5FA6]">
              <Palette className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-semibold text-[#233226]">Self-Help Sanctuary</h3>
                <span className="rounded-full bg-[#F1EAFB] px-2 py-0.5 text-[10px] font-bold text-[#7C5FA6]">ZEN DOODLE</span>
              </div>
              <p className="mt-2 text-xs sm:text-sm leading-relaxed text-[#56685A]">
                Grounding, breathing, and a doodle pad for quick relief.
              </p>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-[#EAE4D9]">
            <Link
              to="/app/self-help"
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#FAF7F2] hover:bg-[#F3EFE8] text-[#233226] border border-[#D9D2C5] py-3 text-xs font-semibold transition-colors"
            >
              <span>Explore Self-Help Tools</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>

        {/* Feature 2: Tara Voice Companion */}
        <div className="rounded-2xl bg-white p-6 sm:p-7 border border-[#EAE4D9] flex flex-col justify-between transition-all duration-300 hover:border-[#2D6A4F]/40 hover:-translate-y-1 hover:shadow-[0_18px_40px_-20px_rgba(35,50,38,0.28)]">
          <div className="flex flex-col gap-4">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#2D6A4F] text-white">
              <MessageCircleHeart className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-semibold text-[#233226]">Tara Voice AI</h3>
                <span className="rounded-full bg-[#E8F0EA] px-2 py-0.5 text-[10px] font-bold text-[#2D6A4F]">24/7 LIVE</span>
              </div>
              <p className="mt-2 text-xs sm:text-sm leading-relaxed text-[#56685A]">
                A judgment-free space to talk things through.
              </p>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-[#EAE4D9]">
            <Link
              to="/app/tara"
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#2D6A4F] hover:bg-[#234F3B] text-white py-3 text-xs font-semibold transition-colors"
            >
              <span>Talk to Tara now</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>

        {/* Feature 3: Clinical Self-Assessments */}
        <div className="rounded-2xl bg-white p-6 sm:p-7 border border-[#EAE4D9] flex flex-col justify-between transition-all duration-300 hover:border-[#2D6A4F]/40 hover:-translate-y-1 hover:shadow-[0_18px_40px_-20px_rgba(35,50,38,0.28)]">
          <div className="flex flex-col gap-4">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#E6F3F1] text-[#2C8C82]">
              <ClipboardList className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-semibold text-[#233226]">Private Check-ins</h3>
                <span className="rounded-full bg-[#E6F3F1] px-2 py-0.5 text-[10px] font-bold text-[#2C8C82]">WORKPLACE</span>
              </div>
              <p className="mt-2 text-xs sm:text-sm leading-relaxed text-[#56685A]">
                6 assessments on workload, mood, your manager, and more.
              </p>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-[#EAE4D9]">
            <Link
              to="/app/assessments"
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#FAF7F2] hover:bg-[#F3EFE8] text-[#233226] border border-[#D9D2C5] py-3 text-xs font-semibold transition-colors"
            >
              <span>View assessments ({completedAssessments}/{ASSESSMENT_TYPES.length})</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>

        {/* Feature 4: 1:1 Confidential Therapy */}
        <div className="rounded-2xl bg-white p-6 sm:p-7 border border-[#EAE4D9] flex flex-col justify-between transition-all duration-300 hover:border-[#2D6A4F]/40 hover:-translate-y-1 hover:shadow-[0_18px_40px_-20px_rgba(35,50,38,0.28)]">
          <div className="flex flex-col gap-4">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#FBEAF0] text-[#B5507B]">
              <CalendarHeart className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-semibold text-[#233226]">1:1 Licensed Therapy</h3>
                <span className="rounded-full bg-[#E8F5EA] px-2 py-0.5 text-[10px] font-bold text-[#2F7F4C]">100% COVERED</span>
              </div>
              <p className="mt-2 text-xs sm:text-sm leading-relaxed text-[#56685A]">
                Licensed therapists and coaches, fully sponsored.
              </p>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-[#EAE4D9]">
            <Link
              to="/app/book"
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#FAF7F2] hover:bg-[#F3EFE8] text-[#233226] border border-[#D9D2C5] py-3 text-xs font-semibold transition-colors"
            >
              <span>Book a session</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </div>

      {/* Workshop Request */}
      <WorkshopRequestCard />

      {/* Support & Privacy Assurance */}
      <div className="rounded-2xl bg-white p-6 sm:p-7 border border-[#EAE4D9] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#78897B]">
            <Lock className="h-3.5 w-3.5 text-[#2D6A4F]" />
            Privacy Guarantee
          </div>
          <p className="text-xs sm:text-sm text-[#56685A] leading-relaxed max-w-xl">
            {organization.name} only ever sees anonymized group data, never your personal responses or sessions.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0 pt-3 sm:pt-0 border-t sm:border-t-0 border-[#EAE4D9] text-xs">
          <span className="text-[#78897B]">Need urgent support?</span>
          <a
            href={`mailto:${organization.branding.supportEmail}`}
            className="font-medium text-[#2D6A4F] hover:underline flex items-center gap-1"
          >
            <PhoneCall className="h-3.5 w-3.5" />
            <span>EAP Desk</span>
          </a>
        </div>
      </div>
    </div>
  );
}

export default EmployeeDashboardPage;
