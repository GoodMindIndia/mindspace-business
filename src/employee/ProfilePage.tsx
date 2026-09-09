import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { LogOut, ShieldCheck, ClipboardList, Smile, ArrowRight } from 'lucide-react';
import { useEmployeeAuth } from '@/app/EmployeeAuthContext';
import { useTenant } from '@/app/TenantContext';
import { listMyAssessments } from '@/services/employee-assessment-service';
import { getMyMoodToday } from '@/services/mood-checkin-service';
import { ASSESSMENT_TYPES } from '@/domain/assessments';
import { MOOD_LABELS, type Mood } from '@/domain/mood';
import { PageHero } from '@/components/PageHero';

export function ProfilePage() {
  const { user, signOut } = useEmployeeAuth();
  const { organization } = useTenant();
  const [completedAssessments, setCompletedAssessments] = useState<number>(0);
  const [todaysMood, setTodaysMood] = useState<Mood | null | undefined>(undefined);

  useEffect(() => {
    if (!user) return;
    listMyAssessments(user.id).then((records) => {
      const currentDomains: Set<string> = new Set(ASSESSMENT_TYPES);
      const uniqueTypes = new Set(records.filter((r) => currentDomains.has(r.domain)).map((r) => r.domain));
      setCompletedAssessments(uniqueTypes.size);
    });
    getMyMoodToday(user.id).then(setTodaysMood);
  }, [user]);

  return (
    <div className="flex flex-col gap-6 sm:gap-8 pb-12">
      <PageHero
        eyebrow="Your account"
        icon={ShieldCheck}
        tone="green"
        badge="Private to you"
        title={user?.name ? `Hello, ${user.name.split(' ')[0]}` : 'Your profile'}
        sub="Your activity, your history, and the privacy guarantees that cover all of it."
      />

      <div className="grid grid-cols-1 md:grid-cols-[320px_1fr] gap-6 md:gap-10 items-start">
        {/* Left: account summary, sticky on desktop */}
        <div className="flex flex-col gap-6 md:sticky md:top-8">
          <section className="rounded-2xl bg-white p-5 sm:p-7 border border-[#EAE4D9] flex flex-col items-center text-center gap-3">
            {user?.avatarUrl ? (
              <img src={user.avatarUrl} alt="" className="h-16 w-16 shrink-0 rounded-full object-cover" />
            ) : (
              <span className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-[#2D6A4F] text-xl font-semibold text-white">
                {user?.name ? user.name.slice(0, 1) : 'Y'}
              </span>
            )}
            <div className="min-w-0 w-full">
              <p className="text-sm font-semibold text-[#233226] truncate">{user?.name ?? 'You'}</p>
              <p className="text-xs text-[#78897B] truncate">{user?.email}</p>
              <p className="mt-1 text-[11px] text-[#9AA79C]">Signed in with Google</p>
            </div>

            <button
              type="button"
              onClick={() => void signOut()}
              className="mt-2 inline-flex w-full items-center justify-center gap-2 rounded-full border border-[#D9D2C5] bg-white hover:bg-[#F3EFE8] text-[#233226] px-6 py-2.5 text-xs sm:text-sm font-semibold transition-colors cursor-pointer"
            >
              <LogOut className="h-4 w-4" />
              <span>Sign out</span>
            </button>
          </section>
        </div>

        {/* Right: activity + privacy */}
        <div className="flex flex-col gap-6">
          <section className="rounded-2xl bg-white p-5 sm:p-7 border border-[#EAE4D9] flex flex-col gap-4">
            <h2 className="text-lg sm:text-xl font-semibold text-[#233226]">Your Activity</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Link
                to="/app/assessments"
                className="flex items-center gap-3 rounded-xl bg-[#FAF7F2] border border-[#EAE4D9] hover:border-[#2D6A4F]/40 p-4 transition-colors"
              >
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#E8F0EA] text-[#2D6A4F]">
                  <ClipboardList className="h-4.5 w-4.5" />
                </span>
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-[#233226]">
                    {completedAssessments} / {ASSESSMENT_TYPES.length} check-ins
                  </p>
                  <p className="text-[11px] text-[#78897B]">Private assessments completed</p>
                </div>
              </Link>

              <div className="flex items-center gap-3 rounded-xl bg-[#FAF7F2] border border-[#EAE4D9] p-4">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#E8F0EA] text-[#2D6A4F]">
                  <Smile className="h-4.5 w-4.5" />
                </span>
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-[#233226]">
                    {todaysMood ? MOOD_LABELS[todaysMood] : 'Not checked in yet'}
                  </p>
                  <p className="text-[11px] text-[#78897B]">Today's mood</p>
                </div>
              </div>
            </div>

            {!todaysMood && todaysMood !== undefined && (
              <Link
                to="/app/home"
                className="inline-flex items-center gap-1.5 self-start text-xs font-semibold text-[#2D6A4F] hover:underline"
              >
                <span>Check in for today</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            )}
          </section>

          <section className="rounded-2xl bg-white p-5 sm:p-7 border border-[#EAE4D9] flex flex-col gap-3">
            <h2 className="text-lg sm:text-xl font-semibold text-[#233226] flex items-center gap-2">
              <ShieldCheck className="h-4.5 w-4.5 text-[#2D6A4F] shrink-0" />
              What {organization.name} can and can't see
            </h2>
            <ul className="flex flex-col gap-2 text-xs sm:text-sm leading-relaxed text-[#56685A]">
              <li>✓ That you're an active member of the platform, counted only in aggregate.</li>
              <li>✓ How many assessments and sessions were used across the whole company.</li>
              <li>✕ Never your name against a specific assessment, score, or conversation.</li>
              <li>✕ Never what you said to Tara, and never a transcript of it.</li>
              <li>✕ Never which sessions you booked, or why.</li>
            </ul>
          </section>
        </div>
      </div>
    </div>
  );
}
