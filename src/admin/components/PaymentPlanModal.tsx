import { useState } from 'react';
import {
  X,
  Check,
  CreditCard,
  Building2,
  FileText,
  ShieldCheck,
  Sparkles,
  ArrowRight,
  Loader2,
  Lock,
  ChevronRight,
  Zap,
} from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import {
  CREDIT_PLANS,
  updateOrgCreditPlan,
  type CreditPlan,
  type OrgCreditBalance,
} from '@/services/credit-service';

interface PaymentPlanModalProps {
  isOpen: boolean;
  onClose: () => void;
  orgId: string;
  currentPlanId?: string;
  onPlanUpdated?: (newBalance: OrgCreditBalance) => void;
}

type PaymentMethod = 'card' | 'upi' | 'po';

export function PaymentPlanModal({
  isOpen,
  onClose,
  orgId,
  currentPlanId = 'starter_5k',
  onPlanUpdated,
}: PaymentPlanModalProps) {
  const [selectedPlanId, setSelectedPlanId] = useState<string>(currentPlanId);
  const [currency, setCurrency] = useState<'INR' | 'USD'>('INR');
  const [step, setStep] = useState<'select' | 'checkout'>('select');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('card');
  const [isProcessing, setIsProcessing] = useState(false);

  // Form states
  const [cardDetails, setCardDetails] = useState({
    name: 'Priya Raghavan',
    number: '•••• •••• •••• 4242',
    expiry: '08/29',
    cvv: '•••',
  });
  const [poNumber, setPoNumber] = useState('PO-ACC-2026-091');

  if (!isOpen) return null;

  const selectedPlan = CREDIT_PLANS.find((p) => p.id === selectedPlanId) || CREDIT_PLANS[0];
  const isCurrentPlan = selectedPlan.id === currentPlanId;

  const handleProceedToCheckout = () => {
    if (isCurrentPlan) {
      toast.info(`You are already subscribed to the ${selectedPlan.name}.`);
      return;
    }
    setStep('checkout');
  };

  const handleConfirmPayment = async () => {
    setIsProcessing(true);
    try {
      await new Promise((r) => setTimeout(r, 1200));
      const newBalance = await updateOrgCreditPlan(
        orgId,
        selectedPlan.id as 'starter_5k' | 'growth_10k' | 'enterprise_20k',
        paymentMethod
      );

      toast.success('Plan updated successfully!', {
        description: `Your organization has been upgraded to ${selectedPlan.name} with ${selectedPlan.credits.toLocaleString()} total credits.`,
      });

      if (onPlanUpdated) {
        onPlanUpdated(newBalance);
      }
      onClose();
    } catch {
      toast.error('Payment processing failed. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in overflow-y-auto"
      onClick={onClose}
    >
      <div
        className="relative max-w-4xl w-full rounded-[32px] bg-white border border-[#EAE4D9] shadow-2xl flex flex-col max-h-[92vh] overflow-hidden my-auto animate-scale-up"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 sm:px-8 py-5 border-b border-[#EAE4D9] bg-[#FAF7F2]/80">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#2D6A4F] text-white shadow-xs">
              <Zap className="h-5 w-5 text-amber-300" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-serif text-xl sm:text-2xl font-normal text-[#233226]">
                  {step === 'select' ? 'Choose Your Credit Plan' : 'Confirm & Complete Payment'}
                </h2>
                <span className="rounded-full bg-[#E8F0EA] px-2.5 py-0.5 text-[10px] font-bold text-[#2D6A4F]">
                  HR BILLING
                </span>
              </div>
              <p className="text-xs text-[#78897B] mt-0.5">
                {step === 'select'
                  ? 'Select the right Tara AI & wellbeing capacity for your organization.'
                  : `Upgrading to ${selectedPlan.name}`}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close modal"
            className="flex h-8 w-8 items-center justify-center rounded-full bg-white border border-[#D9D2C5] text-[#243327] hover:bg-[#EAE4D9] transition-colors cursor-pointer"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 sm:p-8 overflow-y-auto flex-1 flex flex-col gap-6">
          {step === 'select' ? (
            /* STEP 1: Plan Comparison Cards */
            <div className="flex flex-col gap-6">
              {/* Currency Toggle */}
              <div className="flex items-center justify-between pb-1">
                <p className="text-xs text-[#56685A]">
                  All plans include full k-anonymity reports, clinical assessments, and 24/7 EAP desk routing.
                </p>
                <div className="flex items-center rounded-xl bg-[#FAF7F2] border border-[#D9D2C5] p-1 text-xs">
                  <button
                    type="button"
                    onClick={() => setCurrency('INR')}
                    className={cn(
                      'px-2.5 py-1 rounded-lg font-semibold transition-colors cursor-pointer',
                      currency === 'INR' ? 'bg-[#2D6A4F] text-white shadow-2xs' : 'text-[#78897B] hover:text-[#233226]'
                    )}
                  >
                    ₹ INR
                  </button>
                  <button
                    type="button"
                    onClick={() => setCurrency('USD')}
                    className={cn(
                      'px-2.5 py-1 rounded-lg font-semibold transition-colors cursor-pointer',
                      currency === 'USD' ? 'bg-[#2D6A4F] text-white shadow-2xs' : 'text-[#78897B] hover:text-[#233226]'
                    )}
                  >
                    $ USD
                  </button>
                </div>
              </div>

              {/* 3 Plans Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                {CREDIT_PLANS.map((plan) => {
                  const isSelected = selectedPlanId === plan.id;
                  const isCurrent = currentPlanId === plan.id;
                  const priceFormatted =
                    currency === 'INR'
                      ? `₹${plan.priceINR.toLocaleString('en-IN')}`
                      : `$${plan.priceUSD.toLocaleString('en-US')}`;

                  return (
                    <div
                      key={plan.id}
                      onClick={() => setSelectedPlanId(plan.id)}
                      className={cn(
                        'relative rounded-[24px] p-5 sm:p-6 border flex flex-col justify-between transition-all cursor-pointer shadow-xs hover:shadow-md',
                        isSelected
                          ? 'border-[#2D6A4F] bg-[#F4F8F5] ring-2 ring-[#2D6A4F]/40 scale-[1.02]'
                          : 'border-[#EAE4D9] bg-white hover:bg-[#FAF7F2]'
                      )}
                    >
                      {/* Top Badges */}
                      <div className="flex items-center justify-between gap-2 mb-3">
                        <span className="text-[11px] font-bold uppercase tracking-wider text-[#2D6A4F]">
                          {plan.tier}
                        </span>
                        {isCurrent ? (
                          <span className="rounded-full bg-[#243327] text-white px-2.5 py-0.5 text-[10px] font-bold">
                            Current Plan
                          </span>
                        ) : plan.badge ? (
                          <span className="rounded-full bg-purple-100 text-purple-800 border border-purple-200 px-2 py-0.5 text-[10px] font-bold">
                            {plan.badge}
                          </span>
                        ) : null}
                      </div>

                      <div className="flex flex-col gap-2">
                        <h3 className="font-serif text-2xl font-normal text-[#233226]">
                          {plan.credits.toLocaleString()} Credits
                        </h3>
                        <p className="text-xs text-[#56685A] leading-snug">{plan.description}</p>

                        <div className="pt-2 pb-3 border-b border-[#EAE4D9]">
                          <div className="flex items-baseline gap-1">
                            <span className="font-serif text-2xl sm:text-3xl font-medium text-[#233226]">
                              {priceFormatted}
                            </span>
                            <span className="text-xs text-[#78897B]">/ {plan.billingPeriod}</span>
                          </div>
                        </div>

                        {/* Feature List */}
                        <div className="flex flex-col gap-2 pt-2">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-[#78897B]">
                            What's Included:
                          </span>
                          <ul className="flex flex-col gap-1.5 text-xs text-[#243327]">
                            {plan.features.map((feat, idx) => (
                              <li key={idx} className="flex items-start gap-2">
                                <Check className="h-3.5 w-3.5 text-[#2D6A4F] shrink-0 mt-0.5" />
                                <span className="leading-tight text-[11px] sm:text-xs">{feat}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>

                      <div className="mt-6 pt-3">
                        <button
                          type="button"
                          className={cn(
                            'w-full py-2.5 rounded-xl text-xs font-semibold shadow-xs transition-colors flex items-center justify-center gap-1.5',
                            isSelected
                              ? 'bg-[#2D6A4F] text-white'
                              : 'bg-white border border-[#D9D2C5] text-[#243327] hover:bg-[#EAE4D9]'
                          )}
                        >
                          {isCurrent ? (
                            <span>Active Plan</span>
                          ) : (
                            <>
                              <span>Select {plan.credits.toLocaleString()} Credits</span>
                              <ArrowRight className="h-3.5 w-3.5" />
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            /* STEP 2: Checkout & Payment */
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              {/* Left Column: Payment Methods (7 cols) */}
              <div className="lg:col-span-7 flex flex-col gap-5">
                <div>
                  <h3 className="font-serif text-lg font-normal text-[#233226]">
                    Select Payment Method
                  </h3>
                  <p className="text-xs text-[#78897B] mt-0.5">
                    Secure corporate checkout with instant credit provisioning.
                  </p>
                </div>

                {/* Method Tabs */}
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'card' as PaymentMethod, label: 'Credit Card', icon: CreditCard },
                    { id: 'upi' as PaymentMethod, label: 'NetBanking / UPI', icon: Building2 },
                    { id: 'po' as PaymentMethod, label: 'Corporate PO', icon: FileText },
                  ].map((m) => {
                    const Icon = m.icon;
                    const isCurrentMethod = paymentMethod === m.id;
                    return (
                      <button
                        key={m.id}
                        type="button"
                        onClick={() => setPaymentMethod(m.id)}
                        className={cn(
                          'flex flex-col items-center gap-1.5 p-3 rounded-2xl border text-center transition-all cursor-pointer',
                          isCurrentMethod
                            ? 'border-[#2D6A4F] bg-[#F4F8F5] ring-2 ring-[#2D6A4F]/30 shadow-xs'
                            : 'border-[#EAE4D9] bg-white hover:bg-[#FAF7F2]'
                        )}
                      >
                        <Icon className={cn('h-5 w-5', isCurrentMethod ? 'text-[#2D6A4F]' : 'text-[#78897B]')} />
                        <span className="text-xs font-semibold text-[#243327]">{m.label}</span>
                      </button>
                    );
                  })}
                </div>

                {/* Card Fields Form */}
                {paymentMethod === 'card' && (
                  <div className="rounded-2xl bg-[#FAF7F2] border border-[#EAE4D9] p-4 flex flex-col gap-3">
                    <div className="flex flex-col gap-1">
                      <label className="text-[11px] font-semibold text-[#56685A]">Cardholder Name</label>
                      <input
                        type="text"
                        value={cardDetails.name}
                        onChange={(e) => setCardDetails({ ...cardDetails, name: e.target.value })}
                        className="rounded-xl border border-[#D9D2C5] bg-white px-3 py-2 text-xs text-[#243327] focus:border-[#2D6A4F] focus:outline-none"
                      />
                    </div>
                    <div className="flex flex-col gap-1">
                      <label className="text-[11px] font-semibold text-[#56685A]">Card Number</label>
                      <div className="relative">
                        <input
                          type="text"
                          value={cardDetails.number}
                          onChange={(e) => setCardDetails({ ...cardDetails, number: e.target.value })}
                          className="w-full rounded-xl border border-[#D9D2C5] bg-white px-3 py-2 text-xs text-[#243327] focus:border-[#2D6A4F] focus:outline-none pr-10"
                        />
                        <Lock className="absolute right-3 top-2.5 h-3.5 w-3.5 text-[#78897B]" />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="flex flex-col gap-1">
                        <label className="text-[11px] font-semibold text-[#56685A]">Expiry (MM/YY)</label>
                        <input
                          type="text"
                          value={cardDetails.expiry}
                          onChange={(e) => setCardDetails({ ...cardDetails, expiry: e.target.value })}
                          className="rounded-xl border border-[#D9D2C5] bg-white px-3 py-2 text-xs text-[#243327] focus:border-[#2D6A4F] focus:outline-none"
                        />
                      </div>
                      <div className="flex flex-col gap-1">
                        <label className="text-[11px] font-semibold text-[#56685A]">CVV</label>
                        <input
                          type="password"
                          value={cardDetails.cvv}
                          onChange={(e) => setCardDetails({ ...cardDetails, cvv: e.target.value })}
                          className="rounded-xl border border-[#D9D2C5] bg-white px-3 py-2 text-xs text-[#243327] focus:border-[#2D6A4F] focus:outline-none"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* UPI Fields */}
                {paymentMethod === 'upi' && (
                  <div className="rounded-2xl bg-[#FAF7F2] border border-[#EAE4D9] p-4 flex flex-col gap-3">
                    <div className="flex flex-col gap-1">
                      <label className="text-[11px] font-semibold text-[#56685A]">Corporate UPI ID / VPA</label>
                      <input
                        type="text"
                        placeholder="e.g. orgname@okhdfcbank"
                        className="rounded-xl border border-[#D9D2C5] bg-white px-3 py-2 text-xs text-[#243327] focus:border-[#2D6A4F] focus:outline-none"
                      />
                    </div>
                    <p className="text-[11px] text-[#78897B]">
                      A payment request will be sent to your authorized finance UPI app.
                    </p>
                  </div>
                )}

                {/* Purchase Order (PO) */}
                {paymentMethod === 'po' && (
                  <div className="rounded-2xl bg-[#FAF7F2] border border-[#EAE4D9] p-4 flex flex-col gap-3">
                    <div className="flex flex-col gap-1">
                      <label className="text-[11px] font-semibold text-[#56685A]">Purchase Order (PO) Number</label>
                      <input
                        type="text"
                        value={poNumber}
                        onChange={(e) => setPoNumber(e.target.value)}
                        className="rounded-xl border border-[#D9D2C5] bg-white px-3 py-2 text-xs text-[#243327] focus:border-[#2D6A4F] focus:outline-none"
                      />
                    </div>
                    <p className="text-[11px] text-[#78897B]">
                      Net-30 invoice will be dispatched to billing contact <strong>hr@mindspace.example</strong>.
                    </p>
                  </div>
                )}

                <div className="flex items-center gap-2 text-xs text-[#78897B] pt-1">
                  <ShieldCheck className="h-4 w-4 text-[#2D6A4F]" />
                  <span>256-Bit SSL Encrypted Corporate Checkout · Instant Activation</span>
                </div>
              </div>

              {/* Right Column: Order Summary (5 cols) */}
              <div className="lg:col-span-5 rounded-[24px] bg-[#FAF7F2] border border-[#EAE4D9] p-5 sm:p-6 flex flex-col gap-4">
                <h4 className="font-serif text-lg font-normal text-[#233226] border-b border-[#EAE4D9] pb-3">
                  Order Summary
                </h4>

                <div className="flex flex-col gap-2.5 text-xs text-[#56685A]">
                  <div className="flex items-center justify-between">
                    <span>Selected Plan:</span>
                    <strong className="text-[#233226]">{selectedPlan.name}</strong>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Total Allocated Credits:</span>
                    <strong className="text-[#2D6A4F]">{selectedPlan.credits.toLocaleString()}</strong>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Billing Interval:</span>
                    <span>Monthly Subscription</span>
                  </div>
                  <div className="flex items-center justify-between border-t border-[#EAE4D9] pt-2.5 font-medium">
                    <span>Plan Subtotal:</span>
                    <span>
                      {currency === 'INR'
                        ? `₹${selectedPlan.priceINR.toLocaleString('en-IN')}`
                        : `$${selectedPlan.priceUSD.toLocaleString('en-US')}`}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-[#78897B]">
                    <span>Estimated Taxes (GST 18%):</span>
                    <span>Included</span>
                  </div>
                </div>

                <div className="pt-3 border-t border-[#EAE4D9] flex items-center justify-between">
                  <span className="font-semibold text-sm text-[#233226]">Total Amount:</span>
                  <span className="font-serif text-xl sm:text-2xl font-bold text-[#233226]">
                    {currency === 'INR'
                      ? `₹${selectedPlan.priceINR.toLocaleString('en-IN')}`
                      : `$${selectedPlan.priceUSD.toLocaleString('en-US')}`}
                  </span>
                </div>

                <div className="flex flex-col gap-2 pt-2">
                  <button
                    type="button"
                    onClick={handleConfirmPayment}
                    disabled={isProcessing}
                    className="w-full py-3 rounded-xl bg-[#2D6A4F] hover:bg-[#234F3B] disabled:opacity-50 text-white font-semibold text-xs sm:text-sm shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer"
                  >
                    {isProcessing ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        <span>Processing Activation...</span>
                      </>
                    ) : (
                      <>
                        <span>Confirm & Activate Plan</span>
                        <Check className="h-4 w-4" />
                      </>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={() => setStep('select')}
                    className="text-xs text-[#78897B] hover:text-[#233226] text-center py-1 cursor-pointer"
                  >
                    ← Back to Plan Selection
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer (for Select step) */}
        {step === 'select' && (
          <div className="px-6 sm:px-8 py-4 border-t border-[#EAE4D9] bg-[#FAF7F2]/80 flex items-center justify-between">
            <div className="text-xs text-[#78897B] hidden sm:block">
              Selected: <strong className="text-[#233226]">{selectedPlan.name}</strong> ({selectedPlan.credits.toLocaleString()} credits)
            </div>

            <div className="flex items-center gap-3 ml-auto">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-[#56685A] hover:bg-[#EAE4D9] transition-colors cursor-pointer"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleProceedToCheckout}
                disabled={isCurrentPlan}
                className="px-5 py-2.5 rounded-xl bg-[#2D6A4F] hover:bg-[#234F3B] disabled:opacity-40 disabled:cursor-not-allowed text-white text-xs font-semibold shadow-xs transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <span>Continue to Checkout</span>
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default PaymentPlanModal;
