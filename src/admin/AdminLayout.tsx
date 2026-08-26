import { useEffect, useState, type ComponentType } from 'react';
import { NavLink, Link, Outlet, useLocation } from 'react-router-dom';
import {
  AlertTriangle,
  HeartHandshake,
  LayoutDashboard,
  LineChart,
  LogOut,
  Smile,
  Menu,
  X,
  CreditCard,
} from 'lucide-react';
import { useAuth } from '@/app/AuthContext';
import { ReportProvider } from '@/admin/ReportContext';
import { cn } from '@/lib/utils';

interface NavEntry {
  to: string;
  label: string;
  icon: ComponentType<{ className?: string }>;
}

const IMPACT_NAV: NavEntry[] = [{ to: '/admin/impact', label: 'Business Impact', icon: LineChart }];

const REPORT_NAV: NavEntry[] = [
  { to: '/admin/report', label: 'Overview', icon: LayoutDashboard },
  { to: '/admin/feelings', label: 'Feelings', icon: Smile },
  { to: '/admin/pressures', label: 'Pressures', icon: AlertTriangle },
  { to: '/admin/actions', label: 'Actions', icon: HeartHandshake },
];

const SETTING_NAV: NavEntry[] = [
  { to: '/admin/profile', label: 'HR Profile & Plans', icon: CreditCard },
];

export function AdminLayout() {
  return (
    <ReportProvider>
      <AdminLayoutContent />
    </ReportProvider>
  );
}

function AdminLayoutContent() {
  const { user, signOut } = useAuth();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Close mobile drawer on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  const sidebarContent = (
    <>
      {/* Brand */}
      <div className="flex flex-col gap-2.5 px-5 pt-6 pb-5 border-b border-[#EAE4D9]/60">
        <Link to="/" className="flex items-center gap-2">
          <img src="/mindspace-wordmark.png" alt="MindSpace" className="h-6 w-auto object-contain" />
        </Link>
      </div>

      {/* Nav groups */}
      <nav className="flex-1 overflow-y-auto px-3 flex flex-col gap-6 pt-4">
        <NavGroup title="Business Impact" items={IMPACT_NAV} />
        <NavGroup title="Reports" items={REPORT_NAV} />
        <NavGroup title="Administration" items={SETTING_NAV} />
      </nav>

      {/* Footer: profile */}
      <div className="border-t border-[#EAE4D9] px-3 py-3 flex flex-col gap-1">
        {/* Profile Card */}
        <div className="flex items-center gap-2.5 rounded-xl px-2 py-2 hover:bg-[#FAF7F2] transition-colors">
          <Link to="/admin/profile" className="flex items-center gap-2.5 min-w-0 flex-1">
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#2D6A4F] text-xs font-semibold text-white shadow-xs">
              {user?.name ? user.name.slice(0, 1) : 'P'}
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-semibold text-[#233226] truncate">{user?.name ?? 'Priya Raghavan'}</p>
              <p className="text-[11px] text-[#78897B] truncate">{user?.email ?? 'hr@mindspace.example'}</p>
            </div>
          </Link>
          <button
            onClick={() => signOut()}
            title="Sign out"
            aria-label="Sign out"
            className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[#78897B] hover:bg-red-50 hover:text-red-600 transition-colors cursor-pointer"
          >
            <LogOut className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </>
  );

  return (
    <div className="min-h-screen bg-[#FAF7F2] text-[#243327] selection:bg-[#E5ECE6] font-sans">
      {/* Mobile top bar */}
      <div className="md:hidden sticky top-0 z-40 flex h-14 items-center justify-between border-b border-[#EAE4D9]/80 bg-[#FAF7F2]/95 backdrop-blur-md px-4">
        <Link to="/" className="flex items-center gap-2 hover:opacity-90 transition-opacity">
          <img src="/mindspace-wordmark.png" alt="MindSpace" className="h-5 w-auto object-contain" />
        </Link>
        <button
          type="button"
          onClick={() => setMobileMenuOpen((o) => !o)}
          className="flex h-9 w-9 items-center justify-center rounded-xl bg-white border border-[#D9D2C5] text-[#233226] hover:bg-[#F3EFE8] transition-colors cursor-pointer"
          aria-label="Toggle navigation menu"
        >
          {mobileMenuOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
        </button>
      </div>

      <div className="flex">
        {/* Desktop sidebar */}
        <aside className="hidden md:fixed md:inset-y-0 md:left-0 md:z-30 md:flex md:w-64 md:flex-col border-r border-[#EAE4D9] bg-white">
          {sidebarContent}
        </aside>

        {/* Mobile drawer */}
        {mobileMenuOpen && (
          <div className="md:hidden fixed inset-0 z-50 flex">
            <div className="w-72 max-w-[85vw] h-full bg-white border-r border-[#EAE4D9] flex flex-col animate-in slide-in-from-left duration-200">
              {sidebarContent}
            </div>
            <button
              aria-label="Close navigation menu"
              className="flex-1 bg-black/30 cursor-pointer"
              onClick={() => setMobileMenuOpen(false)}
            />
          </div>
        )}

        {/* Main content */}
        <div className="flex-1 md:pl-64 flex flex-col min-h-screen">
          <main className="mx-auto w-full max-w-5xl px-4 sm:px-6 lg:px-8 py-8 sm:py-10 flex-1">
            <Outlet />
          </main>

          <footer className="w-full border-t border-[#EAE4D9]/80 bg-transparent py-8">
            <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-4 px-4 sm:px-6 lg:px-8 text-xs text-[#78897B]">
              <p>© 2026 MindSpace. Empathetic Intelligence</p>
              <div className="flex items-center gap-6">
                <a href="#" className="hover:text-[#233226] transition-colors">Privacy Policy</a>
                <a href="#" className="hover:text-[#233226] transition-colors">Terms of Service</a>
                <a href="#" className="hover:text-[#233226] transition-colors">Contact Support</a>
              </div>
            </div>
          </footer>
        </div>
      </div>
    </div>
  );
}

function NavGroup({ title, items }: { title: string; items: NavEntry[] }) {
  return (
    <div className="flex flex-col gap-0.5">
      <p className="px-3 pb-1.5 text-[10px] font-bold uppercase tracking-wider text-[#78897B]">{title}</p>
      {items.map((item) => (
        <NavLink
          key={item.to}
          to={item.to}
          className={({ isActive }) =>
            cn(
              'flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-xs font-medium transition-colors',
              isActive ? 'bg-[#2D6A4F] text-white font-semibold' : 'text-[#3E4F42] hover:bg-[#F3EFE8]',
            )
          }
        >
          {({ isActive }) => (
            <>
              <item.icon className={cn('h-3.5 w-3.5', isActive ? 'text-white' : 'text-[#5A6D5E]')} />
              <span>{item.label}</span>
            </>
          )}
        </NavLink>
      ))}
    </div>
  );
}
