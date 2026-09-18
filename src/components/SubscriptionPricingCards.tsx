import React, { useEffect, useMemo, useState } from 'react';
import {
  ArrowRight,
  Check,
  CheckCircle2,
  ChevronDown,
  Download,
  Minus,
  ShieldCheck
} from 'lucide-react';
import {
  getLiveSubscriptionPlans,
  getLiveSuperOwnerTaxConfig,
  type SubscriptionPlanDef
} from '../types/multiTenant';
import { api } from '../services/api';

export interface SubscriptionPricingCardsProps {
  onSelectPlan?: (planId: string) => void;
  onManageSubscription?: () => void;
  activeSubscriptionPlanId?: string;
  activeRenewalDate?: string;
  lang?: 'en' | 'hi';
  title?: string;
  subtitle?: string;
  showToggle?: boolean;
}

type BillingCycle = 'monthly' | 'annual';

const comparisonGroups = [
  {
    label: 'Employee Database Management',
    rows: ['Employee database', 'Employee self-service', 'Multi-entity management', 'ITLC Vault integration']
  },
  {
    label: 'Document Management',
    rows: ['KYC document storage', 'Policy acknowledgements', 'Offer and joining letters']
  },
  {
    label: 'Onboarding',
    rows: ['Candidate to employee flow', 'Automated onboarding tasks', 'Digital approval routing']
  },
  {
    label: 'Time-off Management',
    rows: ['Leave requests', 'Holiday calendar', 'Approval workflows']
  },
  {
    label: 'Attendance',
    rows: ['Biometric attendance', 'GPS/geofence tracking', 'Shift and roster management']
  },
  {
    label: 'Reports and Analytics',
    rows: ['HR reports', 'Payroll insights', 'Admin audit logs']
  }
];

const includedKeywords = [
  'employee',
  'seat',
  'database',
  'document',
  'kyc',
  'attendance',
  'biometric',
  'gps',
  'leave',
  'payroll',
  'report',
  'analytics',
  'support',
  'onboarding',
  'workflow',
  'tax',
  'gst',
  'invoice',
  'storage',
  'admin',
  'multi',
  'priority',
  'governance'
];

const getPlanTier = (plan: SubscriptionPlanDef, index: number) => {
  const name = `${plan.id} ${plan.name} ${plan.badge || ''}`.toLowerCase();
  if (name.includes('enterprise') || name.includes('premium')) return 4;
  if (name.includes('starter') || name.includes('professional') || name.includes('growth')) return 3;
  if (name.includes('demo') || name.includes('essential')) return 2;
  return Math.min(4, index + 2);
};

export const SubscriptionPricingCards: React.FC<SubscriptionPricingCardsProps> = ({
  onSelectPlan,
  onManageSubscription,
  activeSubscriptionPlanId,
  activeRenewalDate,
  title = 'Smart HR solution, tailored for every business',
  subtitle = 'Choose an ITLC HRMS plan that fits your organization. Plans and prices stay synced with your ITLC subscription settings.',
  showToggle = true
}) => {
  const [billingCycle, setBillingCycle] = useState<BillingCycle>('monthly');
  const [plans, setPlans] = useState<SubscriptionPlanDef[]>(() => getLiveSubscriptionPlans());
  const taxConfig = getLiveSuperOwnerTaxConfig();

  useEffect(() => {
    let isMounted = true;

    const fetchPlans = async () => {
      try {
        const fetched = await api.getPlans();
        if (isMounted && Array.isArray(fetched)) {
          setPlans(getLiveSubscriptionPlans());
        }
      } catch {
        if (isMounted) setPlans(getLiveSubscriptionPlans());
      }
    };

    fetchPlans();

    const handleUpdate = () => setPlans(getLiveSubscriptionPlans());
    window.addEventListener('subscription_plans_updated', handleUpdate);
    window.addEventListener('storage', handleUpdate);

    return () => {
      isMounted = false;
      window.removeEventListener('subscription_plans_updated', handleUpdate);
      window.removeEventListener('storage', handleUpdate);
    };
  }, []);

  const displayPlans = useMemo(() => plans.filter(plan => plan.showOnLandingPage !== false), [plans]);

  const calculatePrice = (plan: SubscriptionPlanDef) => (
    billingCycle === 'annual' ? Math.round(plan.priceAnnual / 12) : plan.priceMonthly
  );

  const hasFeature = (plan: SubscriptionPlanDef, row: string, index: number) => {
    const tier = getPlanTier(plan, index);
    const haystack = `${plan.name} ${plan.tagline || ''} ${(plan.highlightFeatures || []).join(' ')}`.toLowerCase();
    const rowLower = row.toLowerCase();

    if (haystack.includes(rowLower)) return true;
    if (rowLower.includes('priority') || rowLower.includes('governance')) return tier >= 4;
    if (rowLower.includes('payroll') || rowLower.includes('biometric') || rowLower.includes('gps')) return tier >= 3;
    if (includedKeywords.some(keyword => rowLower.includes(keyword))) return tier >= 2;
    return tier >= 3;
  };

  const activePlanLabel = activeSubscriptionPlanId
    ? displayPlans.find(plan => plan.id === activeSubscriptionPlanId)?.name
    : null;

  return (
    <section id="pricing" className="itlc-zoho-pricing">
      <div className="itlc-zoho-pricing-inner">
        <header className="itlc-zoho-price-hero">
          <h2>{title}</h2>
          <p>{subtitle}</p>
          <div className="itlc-zoho-trust-row" aria-label="Plan highlights">
            <span><Check size={14} /> {displayPlans[0]?.trialDays || 30}-day free trial</span>
            <span><Check size={14} /> No forced contracts</span>
            <span><Check size={14} /> Enterprise-grade security</span>
            <span><Check size={14} /> Hassle-free setup</span>
          </div>
        </header>

        <div className="itlc-zoho-free-strip">
          <div>
            <strong>Explore ITLC HRMS trial</strong>
            <span>Start with your selected plan and test core HR workflows before scaling.</span>
          </div>
          <ul>
            <li><Check size={13} /> Employee database management</li>
            <li><Check size={13} /> Time-off management</li>
            <li><Check size={13} /> Document management</li>
          </ul>
          <button type="button" onClick={() => onSelectPlan && onSelectPlan(displayPlans[0]?.id || 'starter')}>
            Get Started
          </button>
        </div>

        <div className="itlc-zoho-plan-panel">
          <div className="itlc-zoho-panel-actions">
            {showToggle && (
              <div className="itlc-zoho-toggle" aria-label="Billing cycle">
                <button
                  type="button"
                  className={billingCycle === 'monthly' ? 'active' : ''}
                  onClick={() => setBillingCycle('monthly')}
                >
                  Monthly
                </button>
                <button
                  type="button"
                  className={billingCycle === 'annual' ? 'active' : ''}
                  onClick={() => setBillingCycle('annual')}
                >
                  Yearly
                </button>
                <span>Save more than 20%</span>
              </div>
            )}
          </div>

          {displayPlans.length === 0 ? (
            <div className="itlc-zoho-empty">
              <ShieldCheck size={34} />
              <strong>Custom ITLC plans are being prepared</strong>
              <p>Please contact ITLC sales for a tailored HRMS subscription.</p>
            </div>
          ) : (
            <>
              <div className="itlc-zoho-card-grid">
                {displayPlans.map((plan, index) => {
                  const price = calculatePrice(plan);
                  const featured = index === 1 || /popular|recommended/i.test(plan.badge || '');
                  const isActive = Boolean(activeSubscriptionPlanId === plan.id && activeRenewalDate);
                  const featureList = plan.highlightFeatures?.length
                    ? plan.highlightFeatures.slice(0, 5)
                    : [
                        `Up to ${plan.seatLimit} employee seats`,
                        `${plan.storageLimitGb || plan.seatLimit * 2} GB cloud storage`,
                        'Employee database management',
                        'Attendance and reports'
                      ];

                  return (
                    <article className={`itlc-zoho-plan-card ${featured ? 'featured' : ''}`} key={plan.id}>
                      {featured && <span className="itlc-zoho-popular">Most Popular</span>}
                      <div className="itlc-zoho-card-head">
                        <strong>{plan.name}</strong>
                        <div>
                          <span>₹{price.toLocaleString('en-IN')}</span>
                          <em>/user/month</em>
                        </div>
                        <small>
                          {billingCycle === 'annual'
                            ? `Billed annually ₹${plan.priceAnnual.toLocaleString('en-IN')}`
                            : plan.tagline || 'Monthly billing'}
                        </small>
                      </div>

                      <button
                        type="button"
                        onClick={() => isActive && onManageSubscription ? onManageSubscription() : onSelectPlan && onSelectPlan(plan.id)}
                      >
                        {isActive ? 'Manage Plan' : `Try ${plan.name}`}
                      </button>

                      <div className="itlc-zoho-quota">
                        <span>{plan.seatLimit} staff seats</span>
                        <span>{plan.storageLimitGb || plan.seatLimit * 2} GB secure storage</span>
                      </div>

                      <ul>
                        {featureList.map((feature) => (
                          <li key={feature}>
                            <Check size={13} />
                            {feature}
                          </li>
                        ))}
                      </ul>
                    </article>
                  );
                })}

                <aside className="itlc-zoho-plus-card">
                  <img src="/itlc_logo.png" alt="" onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = 'none'; }} />
                  <strong>ITLC People Plus</strong>
                  <p>Unified HR software for your chosen ITLC modules.</p>
                  <button type="button" onClick={() => onSelectPlan && onSelectPlan(displayPlans[displayPlans.length - 1]?.id || 'starter')}>
                    Explore Now <ArrowRight size={13} />
                  </button>
                  <ul>
                    <li>Recruitment</li>
                    <li>Core HRMS</li>
                    <li>Payroll & Tax</li>
                    <li>Expense Management</li>
                    <li>Collaboration</li>
                    <li>Communication</li>
                  </ul>
                </aside>
              </div>

              <div className="itlc-zoho-enterprise-cta">
                <strong>Have more than 500 users?</strong>
                <button type="button" onClick={() => onManageSubscription ? onManageSubscription() : onSelectPlan && onSelectPlan(displayPlans[displayPlans.length - 1]?.id || 'starter')}>
                  Ask for a price quote <ArrowRight size={13} />
                </button>
              </div>

              <div className="itlc-zoho-compare-card">
                <header>
                  <h3>Comprehensive plans to suit the needs of every industry</h3>
                  <button type="button" onClick={() => window.print()}>
                    <Download size={14} /> Download PDF
                  </button>
                </header>

                <div className="itlc-zoho-table-scroll">
                  <table className="itlc-zoho-compare-table">
                    <thead>
                      <tr>
                        <th>
                          {showToggle && (
                            <div className="itlc-zoho-toggle compact">
                              <button
                                type="button"
                                className={billingCycle === 'monthly' ? 'active' : ''}
                                onClick={() => setBillingCycle('monthly')}
                              >
                                Monthly
                              </button>
                              <button
                                type="button"
                                className={billingCycle === 'annual' ? 'active' : ''}
                                onClick={() => setBillingCycle('annual')}
                              >
                                Yearly
                              </button>
                            </div>
                          )}
                        </th>
                        {displayPlans.map((plan) => (
                          <th key={plan.id}>
                            <strong>{plan.name}</strong>
                            <span>₹{calculatePrice(plan).toLocaleString('en-IN')}</span>
                            <small>/user/month</small>
                            <button type="button" onClick={() => onSelectPlan && onSelectPlan(plan.id)}>
                              Try for free
                            </button>
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td>Administrators</td>
                        {displayPlans.map((plan, index) => (
                          <td key={`${plan.id}-admin`}>{index === 0 ? '1' : 'Unlimited'}</td>
                        ))}
                      </tr>
                      <tr>
                        <td>Minimum users</td>
                        {displayPlans.map((plan) => (
                          <td key={`${plan.id}-users`}>{Math.min(5, plan.seatLimit)}</td>
                        ))}
                      </tr>
                      {comparisonGroups.map((group) => (
                        <React.Fragment key={group.label}>
                          <tr className="group-row">
                            <td colSpan={displayPlans.length + 1}>
                              <ChevronDown size={14} /> {group.label}
                            </td>
                          </tr>
                          {group.rows.map((row) => (
                            <tr key={row}>
                              <td>{row}</td>
                              {displayPlans.map((plan, index) => (
                                <td key={`${plan.id}-${row}`}>
                                  {hasFeature(plan, row, index) ? (
                                    <CheckCircle2 size={15} className="included" />
                                  ) : (
                                    <Minus size={14} className="missing" />
                                  )}
                                </td>
                              ))}
                            </tr>
                          ))}
                        </React.Fragment>
                      ))}
                    </tbody>
                  </table>
                </div>

                <p>
                  Local taxes ({taxConfig.taxLabel || 'GST'} {taxConfig.ratePercent}%) will be charged in addition to the prices mentioned.
                  {activePlanLabel && activeRenewalDate ? ` Current plan: ${activePlanLabel}, renewal ${activeRenewalDate}.` : ''}
                </p>
              </div>
            </>
          )}
        </div>
      </div>
    </section>
  );
};
