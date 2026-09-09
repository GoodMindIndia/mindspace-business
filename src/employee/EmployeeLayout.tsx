import type { ComponentType } from 'react';
import { NavLink, Link, Outlet, useLocation } from 'react-router-dom';
import {
  CalendarHeart,
  ClipboardList,
  LayoutGrid,
  MessageCircleHeart,
  User,
  Sparkles,
  HeartHandshake,
} from 'lucide-react';
import { useEmployeeAuth } from '@/app/EmployeeAuthContext';
import { cn } from '@/lib/utils';
import { AppBackdrop } from '@/components/AppBackdrop';

interface NavEntry {
  to: string;
  label: string;
  icon: ComponentType<{ className?: string }>;
}

const NAV: NavEntry[] = [
  { to: '/app/home', label: 'Hub', icon: LayoutGrid },
  { to: '/app/tara', label: 'Tara', icon: MessageCircleHeart },
  { to: '/app/self-help', label: 'Self-Help', icon: HeartHandshake },
  { to: '/app/assessments', label: 'Assessments', icon: ClipboardList },
  { to: '/app/book', label: 'Book', icon: CalendarHeart },
  { to: '/app/profile', label: 'Profile', icon: User },
];

export function EmployeeLayout() {
  const { user } = useEmployeeAuth();
  const location = useLocation();

  return (
    <div className="relative min-h-screen bg-[#FAF7F2] text-[#243327] selection:bg-[#E5ECE6] font-sans">
      <AppBackdrop />
      <header className="sticky top-0 z-30 border-b border-[#EAE4D9]/80 bg-[#FAF7F2]/95 backdrop-blur-md">
        <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between px-4 sm:px-6">
          <Link to="/app/home" className="flex items-center gap-3 hover:opacity-95 transition-opacity">
            <img src="/mindspace-wordmark.png" alt="MindSpace" className="h-7 w-auto object-contain" />
          </Link>

          {/* Right side profile / badge */}
          <div className="flex items-center gap-3">
            <span className="hidden md:inline-flex items-center gap-1.5 rounded-full bg-[#E8F0EA] px-3 py-1 text-[11px] font-semibold text-[#2D6A4F]">
              <Sparkles className="h-3 w-3" />
              Wellbeing Hub
            </span>

            <Link to="/app/profile" aria-label="Your profile" className="flex items-center gap-2">
              {user?.avatarUrl ? (
                <img src={user.avatarUrl} alt="" className="h-8 w-8 rounded-full object-cover border border-[#D9D2C5]" />
              ) : (
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#2D6A4F] text-xs font-semibold text-white shadow-xs">
                  {user?.name ? user.name.slice(0, 1) : 'A'}
                </span>
              )}
            </Link>
          </div>
        </div>
      </header>

      {/* Page content — bottom padding clears the floating/fixed nav */}
      <main className="mx-auto w-full max-w-6xl px-4 sm:px-6 pt-6 pb-28 sm:pb-32">
        <div key={location.pathname} className="ms-fade-up">
          <Outlet />
        </div>
      </main>

      {/* Scrim: fades scrolling content to the page ground *before* it reaches
          the opaque nav, so a toolbar or card never looks like it's crashing
          into the dock — it visually recedes first. Sits above content,
          below the nav; ignores clicks so it never blocks the page under it. */}
      <div
        aria-hidden
        className="pointer-events-none fixed inset-x-0 bottom-0 z-30 h-24 sm:h-28 bg-gradient-to-t from-[#FAF7F2] via-[#FAF7F2]/70 to-transparent"
      />

      {/* Bottom nav — solid, opaque dark dock on purpose: a translucent/blurred
          bar lets busy page content behind it compete for attention, so this
          is the one element on the page that's never see-through and always
          reads first. Full-width tab bar on mobile, floating pill dock on
          larger screens. */}
      <nav
        aria-label="Employee navigation"
        className="fixed inset-x-0 bottom-0 z-40 flex h-[70px] items-center justify-around bg-[#2D6A4F] px-1 pb-[env(safe-area-inset-bottom)] shadow-[0_-8px_24px_-8px_rgba(20,35,25,0.35)] sm:inset-x-0 sm:bottom-6 sm:mx-auto sm:h-auto sm:w-fit sm:justify-center sm:gap-1 sm:rounded-full sm:border sm:border-[#234F3B] sm:bg-[#2D6A4F] sm:px-3 sm:py-2.5 sm:pb-2.5 sm:shadow-[0_24px_48px_-12px_rgba(15,25,20,0.55)]"
      >
        {NAV.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              cn(
                'flex flex-1 flex-col items-center justify-center gap-1 rounded-2xl py-2 text-[10px] font-semibold transition-colors sm:flex-none sm:flex-row sm:gap-2 sm:px-4 sm:py-2.5 sm:text-xs',
                isActive
                  ? 'text-white bg-white/15 sm:bg-white sm:text-[#2D6A4F]'
                  : 'text-white/55 hover:text-white/85 sm:hover:bg-white/10',
              )
            }
          >
            <item.icon className="h-5 w-5 sm:h-4 sm:w-4" />
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>
    </div>
  );
}

export default EmployeeLayout;
