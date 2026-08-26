import { useState, useEffect } from 'react';
import {
  User,
  ShieldCheck,
  Zap,
  CreditCard,
  Building2,
  Download,
  CheckCircle2,
  ArrowRight,
  Sparkles,
  Lock,
  Mail,
  Calendar,
  Layers,
  FileText,
} from 'lucide-react';
import { useAuth } from '@/app/AuthContext';
import { useTenant } from '@/app/TenantContext';
import { cn } from '@/lib/utils';
import {
  CREDIT_PLANS,
  getOrgCreditBalance,
  type OrgCreditBalance,
} from '@/services/credit-service';
import { PaymentPlanModal } from '../components/PaymentPlanModal';

export function AdminProfilePage() {
  const { user } = useAuth();
  const { organization } = useTenant();
  const [balance, setBalance] = useState<OrgCreditBalance | null>(null);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);

  // Load balance and listen for updates
  useEffect(() => {
    getOrgCreditBalance(organization.orgId).then(setBalance);

    const handleUpdate = (e: any) => {
      if (e.detail) setBalance(e.detail);
      else getOrgCreditBalance(organization.orgId).then(setBalance);
    };

    window.addEventListener('mindspace:credits-updated', handleUpdate);
    return () => window.removeEventListener('mindspace:credits-updated', handleUpdate);
  }, [organization.orgId]);

  const currentPlan =
    CREDIT_PLANS.find((p) => p.id === balance?.planId || p.name === balance?.planName) ||
    CREDIT_PLANS[0];

  const totalCredits = balance?.totalCredits || 5000;
  const creditsUsed = balance?.creditsUsed ?? 0;
  const creditsRemaining = balance?.creditsRemaining ?? Math.max(totalCredits - creditsUsed, 0);

  const remainingPercent = totalCredits > 0 ? (creditsRemaining / totalCredits) * 100 : 100;
  const usedPercent = totalCredits > 0 ? (creditsUsed / totalCredits) * 100 : 0;

  const remainingLabel =
    remainingPercent % 1 === 0 ? `${remainingPercent}%` : `${remainingPercent.toFixed(1)}%`;

  return (
    <div className="flex flex-col gap-8 pb-16 font-sans">
      {/* Page Header */}
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex flex-col gap-1.5">
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#78897B]">
            ORGANIZATION & BILLING SETTINGS
          </p>
          <h1 className="font-serif text-3xl sm:text-4xl font-normal tracking-tight text-[#233226] mt-1">
            HR Profile & Credit Plans
          </h1>
          <p className="text-xs sm:text-sm text-[#56685A] leading-relaxed max-w-2xl mt-0.5">
            Manage your organization’s Tara AI credit plan, subscription tier, billing methods, and privacy controls.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setIsPaymentModalOpen(true)}
          className="inline-flex items-center gap-2 rounded-xl bg-[#2D6A4F] hover:bg-[#234F3B] text-white px-4 py-2.5 text-xs font-semibold shadow-xs transition-all cursor-pointer"
        >
          <Zap className="h-4 w-4 text-amber-300" />
          <span>Change Plan / Purchase Credits</span>
        </button>
      </header>

      {/* SECTION 1: Current Plan & Credit Capacity Card */}
      <section className="rounded-[28px] bg-white p-6 sm:p-8 border border-[#EAE4D9] shadow-xs flex flex-col gap-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-[#EAE4D9]">
          <div className="flex items-center gap-3.5">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#2D6A4F] text-white shadow-xs">
              <Zap className="h-6 w-6 text-amber-300" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#2D6A4F]">
                  Active Subscription
                </span>
                <span className="rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 px-2.5 py-0.5 text-[10px] font-bold">
                  ACTIVE
                </span>
              </div>
              <h2 className="font-serif text-2xl font-normal text-[#233226] mt-0.5">
                {currentPlan.name} ({currentPlan.tier})
              </h2>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setIsPaymentModalOpen(true)}
            className="inline-flex items-center gap-1.5 self-start md:self-center rounded-xl bg-[#FAF7F2] hover:bg-[#F3EFE8] text-[#243327] border border-[#D9D2C5] px-4 py-2 text-xs font-semibold shadow-2xs transition-colors cursor-pointer"
          >
            <CreditCard className="h-3.5 w-3.5 text-[#2D6A4F]" />
            <span>Manage Plan & Billing</span>
          </button>
        </div>

        {/* Progress Bar & Credit Breakdown Stats */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
          {/* Progress gauge (7 cols) */}
          <div className="lg:col-span-7 flex flex-col gap-3">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-[#243327]">
                Credits: <strong>{creditsRemaining.toLocaleString()}</strong> remaining of{' '}
                <strong>{totalCredits.toLocaleString()}</strong> ({creditsUsed.toLocaleString()} used)
              </span>
              <span className="font-bold text-[#2D6A4F]">{remainingLabel} Available</span>
            </div>

            {/* Custom Remaining Capacity Bar */}
            <div className="h-3.5 w-full rounded-full bg-[#EAE4D9] overflow-hidden p-0.5">
              <div
                className="h-full rounded-full bg-gradient-to-r from-[#2D6A4F] to-[#5E7A67] transition-all duration-500"
                style={{ width: `${Math.min(100, Math.max(2, remainingPercent))}%` }}
              />
            </div>

            <p className="text-xs text-[#78897B]">
              One credit = one complete Tara voice session. Credits automatically renew on{' '}
              <strong>{balance?.renewalDate || '2026-09-30'}</strong>.
            </p>
          </div>

          {/* Quick metric cards (5 cols) */}
          <div className="lg:col-span-5 grid grid-cols-2 gap-3">
            <div className="rounded-2xl bg-[#FAF7F2] border border-[#EAE4D9] p-4 flex flex-col justify-center">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#78897B]">
                Credits Remaining
              </span>
              <span className="font-serif text-2xl sm:text-3xl font-medium text-[#243327] mt-0.5">
                {creditsRemaining.toLocaleString()}
              </span>
            </div>

            <div className="rounded-2xl bg-[#FAF7F2] border border-[#EAE4D9] p-4 flex flex-col justify-center">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#78897B]">
                Total Plan Allocation
              </span>
              <span className="font-serif text-2xl sm:text-3xl font-medium text-[#243327] mt-0.5">
                {totalCredits.toLocaleString()}
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 2: Available Credit Plans Comparison */}
      <section className="flex flex-col gap-4">
        <div>
          <h3 className="font-serif text-2xl font-normal text-[#233226]">
            Available Plans & Capacities
          </h3>
          <p className="text-xs sm:text-sm text-[#78897B] mt-0.5">
            Switch anytime. Upgrades apply immediately and unused credits roll forward.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {CREDIT_PLANS.map((plan) => {
            const isCurrent = (balance?.planId || 'starter_5k') === plan.id;
            return (
              <div
                key={plan.id}
                className={cn(
                  'relative rounded-[28px] p-6 border flex flex-col justify-between transition-all shadow-xs',
                  isCurrent
                    ? 'border-[#2D6A4F] bg-[#F4F8F5] ring-2 ring-[#2D6A4F]/30'
                    : 'border-[#EAE4D9] bg-white hover:shadow-md'
                )}
              >
                <div className="flex flex-col gap-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-[#2D6A4F]">
                      {plan.tier}
                    </span>
                    {isCurrent ? (
                      <span className="rounded-full bg-[#243327] text-white px-2.5 py-0.5 text-[10px] font-bold">
                        Current Plan
                      </span>
                    ) : plan.badge ? (
                      <span className="rounded-full bg-purple-100 text-purple-800 px-2.5 py-0.5 text-[10px] font-bold">
                        {plan.badge}
                      </span>
                    ) : null}
                  </div>

                  <h4 className="font-serif text-2xl font-normal text-[#233226]">
                    {plan.credits.toLocaleString()} Credits
                  </h4>
                  <p className="text-xs text-[#56685A] leading-relaxed">{plan.description}</p>

                  <div className="pt-2 pb-3 border-b border-[#EAE4D9]">
                    <span className="font-serif text-2xl font-medium text-[#233226]">
                      ₹{plan.priceINR.toLocaleString('en-IN')}
                    </span>
                    <span className="text-xs text-[#78897B]"> / month</span>
                  </div>

                  <ul className="flex flex-col gap-1.5 text-xs text-[#243327] pt-1">
                    {plan.features.map((feat, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <CheckCircle2 className="h-3.5 w-3.5 text-[#2D6A4F] shrink-0 mt-0.5" />
                        <span className="text-[11px] sm:text-xs leading-snug">{feat}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="mt-6 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsPaymentModalOpen(true)}
                    className={cn(
                      'w-full py-2.5 rounded-xl text-xs font-semibold shadow-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer',
                      isCurrent
                        ? 'bg-[#2D6A4F] text-white'
                        : 'bg-[#FAF7F2] hover:bg-[#F3EFE8] text-[#243327] border border-[#D9D2C5]'
                    )}
                  >
                    {isCurrent ? (
                      <span>Active Plan</span>
                    ) : (
                      <>
                        <span>Upgrade to {plan.credits.toLocaleString()} Credits</span>
                        <ArrowRight className="h-3.5 w-3.5" />
                      </>
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* SECTION 3: Organization Admin Profile & Privacy Info */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Admin Account Details (7 cols) */}
        <div className="lg:col-span-7 rounded-[28px] bg-white p-6 sm:p-7 border border-[#EAE4D9] shadow-xs flex flex-col gap-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#2D6A4F] text-white text-sm font-semibold shadow-xs">
              {user?.name ? user.name.slice(0, 1) : 'P'}
            </div>
            <div>
              <h4 className="font-serif text-lg font-normal text-[#233226]">
                {user?.name ?? 'Priya Raghavan'}
              </h4>
              <p className="text-xs text-[#78897B]">{user?.email ?? 'hr@mindspace.example'}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
            <div className="rounded-xl bg-[#FAF7F2] p-3 border border-[#EAE4D9] flex flex-col gap-0.5">
              <span className="text-[10px] font-bold uppercase text-[#78897B]">Organization</span>
              <span className="text-xs font-semibold text-[#243327]">{organization.name}</span>
            </div>
            <div className="rounded-xl bg-[#FAF7F2] p-3 border border-[#EAE4D9] flex flex-col gap-0.5">
              <span className="text-[10px] font-bold uppercase text-[#78897B]">Role</span>
              <span className="text-xs font-semibold text-[#243327]">Lead Wellbeing Administrator</span>
            </div>
          </div>
        </div>

        {/* Privacy Policy Guarantee (5 cols) */}
        <div className="lg:col-span-5 rounded-[28px] bg-[#FAF7F2] p-6 sm:p-7 border border-[#EAE4D9] shadow-xs flex flex-col justify-between gap-4">
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#2D6A4F]">
              <ShieldCheck className="h-4 w-4" />
              <span>Strict k-Anonymity (k=5)</span>
            </div>
            <p className="text-xs text-[#56685A] leading-relaxed">
              HR administrators cannot view individual sessions, employee voice recordings, or identifiable answers. All reports strictly enforce a 5-person minimum cohort threshold.
            </p>
          </div>

          <div className="pt-3 border-t border-[#EAE4D9] text-xs text-[#78897B]">
            Data encryption at rest (AES-256) & in transit (TLS 1.3).
          </div>
        </div>
      </section>

      {/* SECTION 4: Simulated Invoices & Billing History */}
      <section className="rounded-[28px] bg-white p-6 sm:p-8 border border-[#EAE4D9] shadow-xs flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-serif text-lg font-normal text-[#233226]">
              Invoice & Billing History
            </h3>
            <p className="text-xs text-[#78897B]">Download receipts and GST tax invoices.</p>
          </div>
          <span className="text-xs font-medium text-[#2D6A4F] bg-[#E8F0EA] px-3 py-1 rounded-full">
            Paid in Full
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-[#243327]">
            <thead>
              <tr className="border-b border-[#EAE4D9] text-[#78897B] text-[11px] font-semibold uppercase tracking-wider">
                <th className="pb-3">Invoice ID</th>
                <th className="pb-3">Date</th>
                <th className="pb-3">Plan / Description</th>
                <th className="pb-3">Amount</th>
                <th className="pb-3">Status</th>
                <th className="pb-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#EAE4D9]">
              <tr>
                <td className="py-3 font-mono text-[#243327]">INV-2026-0801</td>
                <td className="py-3 text-[#56685A]">Aug 01, 2026</td>
                <td className="py-3 font-medium">5,000 Credits Plan (Monthly)</td>
                <td className="py-3 font-semibold">₹49,999</td>
                <td className="py-3">
                  <span className="rounded-full bg-emerald-50 text-emerald-700 px-2 py-0.5 text-[10px] font-bold">
                    PAID
                  </span>
                </td>
                <td className="py-3 text-right">
                  <button
                    type="button"
                    onClick={() => alert('Downloading invoice INV-2026-0801.pdf')}
                    className="inline-flex items-center gap-1 text-[#2D6A4F] hover:underline cursor-pointer"
                  >
                    <Download className="h-3 w-3" />
                    <span>PDF</span>
                  </button>
                </td>
              </tr>
              <tr>
                <td className="py-3 font-mono text-[#243327]">INV-2026-0701</td>
                <td className="py-3 text-[#56685A]">Jul 01, 2026</td>
                <td className="py-3 font-medium">5,000 Credits Plan (Monthly)</td>
                <td className="py-3 font-semibold">₹49,999</td>
                <td className="py-3">
                  <span className="rounded-full bg-emerald-50 text-emerald-700 px-2 py-0.5 text-[10px] font-bold">
                    PAID
                  </span>
                </td>
                <td className="py-3 text-right">
                  <button
                    type="button"
                    onClick={() => alert('Downloading invoice INV-2026-0701.pdf')}
                    className="inline-flex items-center gap-1 text-[#2D6A4F] hover:underline cursor-pointer"
                  >
                    <Download className="h-3 w-3" />
                    <span>PDF</span>
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      {/* Payment & Plan Modal */}
      <PaymentPlanModal
        isOpen={isPaymentModalOpen}
        onClose={() => setIsPaymentModalOpen(false)}
        orgId={organization.orgId}
        currentPlanId={balance?.planId || 'starter_5k'}
        onPlanUpdated={(newBal) => setBalance(newBal)}
      />
    </div>
  );
}

export default AdminProfilePage;
