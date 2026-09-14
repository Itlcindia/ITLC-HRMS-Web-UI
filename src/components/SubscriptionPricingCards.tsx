import React, { useState, useEffect } from 'react';
import { 
  Sparkles, 
  Check, 
  Users, 
  FileText, 
  ShieldCheck, 
  Lock,
  Zap, 
  ArrowRight,
  Clock,
  CheckCircle2
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

export const SubscriptionPricingCards: React.FC<SubscriptionPricingCardsProps> = ({
  onSelectPlan,
  onManageSubscription,
  activeSubscriptionPlanId,
  activeRenewalDate,
  lang = 'en',
  title = '💎 Transparent Enterprise Subscription Plans',
  subtitle = 'Choose the optimal tier for your organization. Seamlessly scale with full CRM, HRMS, live biometric attendance, and automated GST billing.',
  showToggle = true
}) => {
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'annual'>('monthly');
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

    const handleUpdate = () => {
      setPlans(getLiveSubscriptionPlans());
    };
    window.addEventListener('subscription_plans_updated', handleUpdate);
    window.addEventListener('storage', handleUpdate);
    return () => {
      isMounted = false;
      window.removeEventListener('subscription_plans_updated', handleUpdate);
      window.removeEventListener('storage', handleUpdate);
    };
  }, []);

  // Strictly show plans where showOnLandingPage is not false
  const displayPlans = plans.filter(p => p.showOnLandingPage !== false);

  const calculatePrice = (plan: SubscriptionPlanDef) => {
    return billingCycle === 'annual' ? Math.round(plan.priceAnnual / 12) : plan.priceMonthly;
  };

  return (
    <section 
      id="pricing"
      style={{
        maxWidth: '1280px',
        margin: '0 auto',
        padding: '60px 24px 80px',
        position: 'relative',
        zIndex: 10
      }}
    >
      {/* Background Cyber Ambient Glow */}
      <div 
        style={{
          position: 'absolute',
          top: '30%',
          left: '50%',
          transform: 'translate(-50%, -30%)',
          width: '800px',
          height: '450px',
          background: 'radial-gradient(ellipse at center, rgba(56, 189, 248, 0.12) 0%, rgba(99, 102, 241, 0.08) 50%, transparent 75%)',
          filter: 'blur(75px)',
          pointerEvents: 'none',
          zIndex: 0
        }}
      />

      {/* Header & Title */}
      <div style={{ textAlign: 'center', marginBottom: '45px', position: 'relative', zIndex: 2 }}>
        <div 
          style={{ 
            display: 'inline-flex', 
            alignItems: 'center', 
            gap: '8px', 
            background: 'rgba(56, 189, 248, 0.12)', 
            border: '1px solid rgba(56, 189, 248, 0.3)', 
            color: '#38bdf8', 
            padding: '6px 18px', 
            borderRadius: '999px', 
            fontSize: '12px', 
            fontWeight: 800, 
            textTransform: 'uppercase', 
            letterSpacing: '0.8px', 
            marginBottom: '14px' 
          }}
        >
          <Sparkles size={14} />
          <span>Subscription & Pricing Plans</span>
        </div>

        <h2 
          style={{ 
            fontSize: 'clamp(28px, 4vw, 42px)', 
            fontWeight: 900, 
            color: '#ffffff', 
            margin: '0 0 12px', 
            letterSpacing: '-0.8px',
            textShadow: '0 2px 20px rgba(0,0,0,0.5)'
          }}
        >
          {title}
        </h2>

        <p 
          style={{ 
            fontSize: '16px', 
            color: '#94a3b8', 
            margin: '0 auto 28px', 
            maxWidth: '680px', 
            lineHeight: 1.6 
          }}
        >
          {subtitle}
        </p>

        {/* Monthly vs Annual Toggle */}
        {showToggle && (
          <div 
            style={{ 
              display: 'inline-flex', 
              alignItems: 'center', 
              background: 'rgba(15, 23, 42, 0.85)', 
              padding: '5px', 
              borderRadius: '14px', 
              border: '1px solid rgba(255, 255, 255, 0.12)',
              backdropFilter: 'blur(16px)',
              boxShadow: '0 8px 30px rgba(0, 0, 0, 0.4)',
              gap: '4px'
            }}
          >
            <button 
              type="button"
              onClick={() => setBillingCycle('monthly')}
              style={{
                padding: '9px 22px',
                borderRadius: '10px',
                fontSize: '13px',
                fontWeight: 700,
                background: billingCycle === 'monthly' ? 'rgba(56, 189, 248, 0.25)' : 'transparent',
                color: billingCycle === 'monthly' ? '#38bdf8' : '#94a3b8',
                border: billingCycle === 'monthly' ? '1px solid rgba(56, 189, 248, 0.45)' : '1px solid transparent',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                boxShadow: billingCycle === 'monthly' ? '0 0 15px rgba(56, 189, 248, 0.3)' : 'none'
              }}
            >
              Monthly Billing
            </button>
            <button 
              type="button"
              onClick={() => setBillingCycle('annual')}
              style={{
                padding: '9px 22px',
                borderRadius: '10px',
                fontSize: '13px',
                fontWeight: 700,
                background: billingCycle === 'annual' ? 'rgba(168, 85, 247, 0.25)' : 'transparent',
                color: billingCycle === 'annual' ? '#c084fc' : '#94a3b8',
                border: billingCycle === 'annual' ? '1px solid rgba(168, 85, 247, 0.45)' : '1px solid transparent',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                boxShadow: billingCycle === 'annual' ? '0 0 15px rgba(168, 85, 247, 0.3)' : 'none'
              }}
            >
              <span>Annual Billing</span>
              <span 
                style={{ 
                  fontSize: '10px', 
                  padding: '2px 7px', 
                  borderRadius: '6px', 
                  background: '#10b981', 
                  color: '#ffffff', 
                  fontWeight: 800 
                }}
              >
                SAVE 20%
              </span>
            </button>
          </div>
        )}
      </div>

      {/* DYNAMIC SUBSCRIPTION CARDS GRID (100% MATCH TO USER PLANS & SCREENSHOT) */}
      {displayPlans.length === 0 ? (
        <div 
          style={{ 
            textAlign: 'center', 
            padding: '50px 24px', 
            background: 'rgba(15, 23, 42, 0.65)', 
            borderRadius: '24px', 
            border: '1px solid rgba(255, 255, 255, 0.1)', 
            maxWidth: '600px', 
            margin: '0 auto', 
            zIndex: 2, 
            position: 'relative' 
          }}
        >
          <Sparkles size={36} color="#38bdf8" style={{ margin: '0 auto 14px' }} />
          <h3 style={{ color: '#ffffff', fontSize: '22px', fontWeight: 800, margin: '0 0 10px' }}>
            Custom Plans in Preparation
          </h3>
          <p style={{ color: '#94a3b8', fontSize: '14px', margin: 0, lineHeight: 1.6 }}>
            Public subscription plans are currently being configured. Please contact our support or administration desk for customized enterprise setup.
          </p>
        </div>
      ) : (
        <div 
          style={{
            display: 'grid',
            gridTemplateColumns: displayPlans.length === 1 
              ? 'minmax(320px, 460px)' 
              : displayPlans.length === 2 
              ? 'repeat(auto-fit, minmax(320px, 420px))' 
              : 'repeat(auto-fit, minmax(310px, 1fr))',
            justifyContent: 'center',
            gap: '26px',
            alignItems: 'stretch',
            position: 'relative',
            zIndex: 2
          }}
        >
          {displayPlans.map((plan, index) => {
          const effectivePrice = calculatePrice(plan);
          const isCurrentlySubscribed = Boolean(activeSubscriptionPlanId && activeSubscriptionPlanId === plan.id && activeRenewalDate);
          
          // Highlight middle card or plan with badge
          const isFeatured = index === 1 || (displayPlans.length === 1) || (plan.badge && (plan.badge.toUpperCase().includes('POPULAR') || plan.badge.toUpperCase().includes('RECOMMENDED')));
          const isLast = index === 2 || (index === displayPlans.length - 1 && index > 1);

          const accentColor = isFeatured ? '#38bdf8' : isLast ? '#c084fc' : '#38bdf8';
          const iconColor = isFeatured ? '#38bdf8' : isLast ? '#a855f7' : '#38bdf8';

          return (
            <div 
              key={plan.id}
              style={{
                background: isFeatured 
                  ? 'linear-gradient(165deg, rgba(14, 30, 62, 0.94) 0%, rgba(8, 20, 44, 0.96) 100%)' 
                  : isLast 
                  ? 'rgba(25, 15, 42, 0.82)' 
                  : 'rgba(15, 23, 42, 0.85)',
                backdropFilter: 'blur(28px)',
                WebkitBackdropFilter: 'blur(28px)',
                borderRadius: '28px',
                border: isFeatured 
                  ? '2px solid #38bdf8' 
                  : isLast 
                  ? '1px solid rgba(168, 85, 247, 0.35)' 
                  : '1px solid rgba(255, 255, 255, 0.12)',
                padding: '36px 30px',
                position: 'relative',
                boxShadow: isFeatured 
                  ? '0 0 50px rgba(56, 189, 248, 0.35), 0 25px 60px -10px rgba(0, 0, 0, 0.7)' 
                  : '0 20px 45px -10px rgba(0, 0, 0, 0.5)',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                overflow: 'hidden',
                transform: isFeatured ? 'scale(1.02)' : 'none',
                zIndex: isFeatured ? 3 : 2,
                transition: 'transform 0.2s ease, box-shadow 0.2s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = isFeatured ? 'scale(1.04) translateY(-4px)' : 'translateY(-4px)';
                e.currentTarget.style.boxShadow = isFeatured 
                  ? '0 0 65px rgba(56, 189, 248, 0.5), 0 30px 70px -10px rgba(0, 0, 0, 0.8)' 
                  : isLast 
                  ? '0 25px 50px -10px rgba(0, 0, 0, 0.7), 0 0 25px rgba(168, 85, 247, 0.2)' 
                  : '0 25px 50px -10px rgba(0, 0, 0, 0.7), 0 0 25px rgba(56, 189, 248, 0.2)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = isFeatured ? 'scale(1.02) translateY(0)' : 'translateY(0)';
                e.currentTarget.style.boxShadow = isFeatured 
                  ? '0 0 50px rgba(56, 189, 248, 0.35), 0 25px 60px -10px rgba(0, 0, 0, 0.7)' 
                  : '0 20px 45px -10px rgba(0, 0, 0, 0.5)';
              }}
            >
              {/* Decorative Watermark Icon */}
              <div 
                style={{
                  position: 'absolute',
                  top: '20px',
                  right: '20px',
                  opacity: isFeatured ? 0.15 : 0.1,
                  pointerEvents: 'none'
                }}
              >
                {isLast ? <Lock size={90} color={iconColor} /> : isFeatured ? <FileText size={95} color={iconColor} /> : <Users size={90} color={iconColor} />}
              </div>

              <div>
                {/* Plan Badge */}
                <div style={{ 
                  fontSize: '12px', 
                  fontWeight: 700, 
                  color: accentColor, 
                  textTransform: 'uppercase', 
                  letterSpacing: '0.8px', 
                  marginBottom: '8px' 
                }}>
                  {plan.badge || (isFeatured ? '🔥 MOST POPULAR' : isLast ? '👑 ENTERPRISE & SCALE' : '🚀 STARTER TIER')}
                </div>

                {/* Plan Name */}
                <h3 style={{ 
                  fontSize: '30px', 
                  fontWeight: 900, 
                  color: '#ffffff', 
                  margin: '0 0 14px', 
                  letterSpacing: '-0.5px' 
                }}>
                  {plan.name}
                </h3>

                {/* Price Display */}
                <div style={{ marginBottom: '22px' }}>
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px' }}>
                    <span style={{ fontSize: '42px', fontWeight: 900, color: isFeatured ? '#38bdf8' : '#ffffff' }}>
                      ₹{effectivePrice.toLocaleString()}
                    </span>
                    <span style={{ fontSize: '14px', color: '#94a3b8', fontWeight: 600 }}>/mo</span>
                  </div>
                  <div style={{ fontSize: '12px', color: isFeatured ? '#38bdf8' : '#64748b', fontWeight: 600, marginTop: '4px' }}>
                    {billingCycle === 'annual' 
                      ? `(Billed annually ₹${plan.priceAnnual.toLocaleString()} / yr)` 
                      : 'Monthly Subscription • Instant Setup'}
                  </div>
                </div>

                {/* NEXT BILLING DATE (SHOWN ONLY IF USER ACTUALLY HAS AN ACTIVE SUBSCRIPTION) */}
                {isCurrentlySubscribed ? (
                  <div 
                    style={{
                      background: 'rgba(16, 185, 129, 0.12)',
                      border: '1px solid rgba(16, 185, 129, 0.35)',
                      borderRadius: '18px',
                      padding: '16px',
                      marginBottom: '24px'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: '12px', color: '#34d399', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <CheckCircle2 size={15} color="#10b981" /> Active Plan
                      </span>
                      <span style={{ fontSize: '11px', color: '#94a3b8', fontWeight: 600 }}>Next Billing Date</span>
                    </div>
                    <div style={{ textAlign: 'right', fontSize: '14px', fontWeight: 800, color: '#ffffff', marginTop: '6px' }}>
                      {activeRenewalDate}
                    </div>
                  </div>
                ) : (
                  /* FRESH SPECIFICATIONS CARD FOR NEW USERS */
                  <div 
                    style={{
                      background: 'rgba(255, 255, 255, 0.04)',
                      border: '1px solid rgba(255, 255, 255, 0.08)',
                      borderRadius: '18px',
                      padding: '16px',
                      marginBottom: '24px'
                    }}
                  >
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                      <div>
                        <div style={{ fontSize: '11px', color: '#94a3b8', fontWeight: 600 }}>Team / User Limit</div>
                        <div style={{ fontSize: '13px', color: '#ffffff', fontWeight: 800, marginTop: '2px' }}>
                          {plan.seatLimit} Staff Seats
                        </div>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: '11px', color: '#94a3b8', fontWeight: 600 }}>Cloud Storage</div>
                        <div style={{ fontSize: '13px', color: accentColor, fontWeight: 800, marginTop: '2px' }}>
                          {plan.storageLimitGb || (plan.seatLimit * 2)} GB Secure
                        </div>
                      </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', paddingTop: '10px', marginTop: '10px', borderTop: '1px solid rgba(255, 255, 255, 0.06)' }}>
                      <div>
                        <div style={{ fontSize: '11px', color: '#94a3b8', fontWeight: 600 }}>Billing Cycle</div>
                        <div style={{ fontSize: '12px', color: '#ffffff', fontWeight: 700, marginTop: '2px' }}>
                          {billingCycle === 'annual' ? 'Annual (20% Off)' : 'Monthly'}
                        </div>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: '11px', color: '#94a3b8', fontWeight: 600 }}>SLA & Uptime</div>
                        <div style={{ fontSize: '12px', color: '#10b981', fontWeight: 800, marginTop: '2px' }}>
                          99.9% Uptime
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Plan Features Checklist */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '11px', marginBottom: '28px' }}>
                  {(plan.highlightFeatures && plan.highlightFeatures.length > 0 ? plan.highlightFeatures : [
                    `Up to ${plan.seatLimit} Employee Seats`,
                    'Real-time Biometric Radar & GPS',
                    'Automated GST Tax Invoicing',
                    'Deals & Kanban Sales Pipeline',
                    'Automated Salary Slip Generation'
                  ]).map((feat, idx) => (
                    <div key={idx} style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', fontSize: '13px', color: isLast ? '#e9d5ff' : '#cbd5e1', lineHeight: 1.4 }}>
                      <Check size={16} color={accentColor} style={{ flexShrink: 0, marginTop: '2px' }} />
                      <span>{feat}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Action CTA Buttons */}
              {isCurrentlySubscribed ? (
                <div style={{ display: 'flex', gap: '10px' }}>
                  <button 
                    type="button"
                    onClick={() => onManageSubscription ? onManageSubscription() : onSelectPlan && onSelectPlan(plan.id)}
                    style={{
                      width: '100%',
                      padding: '13px',
                      borderRadius: '14px',
                      background: 'rgba(56, 189, 248, 0.2)',
                      border: '1px solid #38bdf8',
                      color: '#ffffff',
                      fontSize: '13px',
                      fontWeight: 800,
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '6px'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = '#38bdf8';
                      e.currentTarget.style.color = '#0f172a';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = 'rgba(56, 189, 248, 0.2)';
                      e.currentTarget.style.color = '#ffffff';
                    }}
                  >
                    <span>Manage Subscription</span>
                  </button>
                </div>
              ) : (
                <button 
                  type="button"
                  onClick={() => onSelectPlan && onSelectPlan(plan.id)}
                  style={{
                    width: '100%',
                    padding: '13px',
                    borderRadius: '14px',
                    background: '#ffffff',
                    color: '#0f172a',
                    border: 'none',
                    fontSize: '14px',
                    fontWeight: 800,
                    cursor: 'pointer',
                    boxShadow: isFeatured 
                      ? '0 6px 20px rgba(56, 189, 248, 0.35)' 
                      : isLast 
                      ? '0 6px 20px rgba(168, 85, 247, 0.25)' 
                      : '0 6px 20px rgba(255, 255, 255, 0.15)',
                    transition: 'all 0.2s ease',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-2px)';
                    e.currentTarget.style.boxShadow = isFeatured 
                      ? '0 8px 25px rgba(56, 189, 248, 0.5)' 
                      : isLast 
                      ? '0 8px 25px rgba(168, 85, 247, 0.4)' 
                      : '0 8px 25px rgba(255, 255, 255, 0.35)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = isFeatured 
                      ? '0 6px 20px rgba(56, 189, 248, 0.35)' 
                      : isLast 
                      ? '0 6px 20px rgba(168, 85, 247, 0.25)' 
                      : '0 6px 20px rgba(255, 255, 255, 0.15)';
                  }}
                >
                  <span>Choose {plan.name}</span>
                  <ArrowRight size={16} />
                </button>
              )}
            </div>
          );
        })}
      </div>
      )}
    </section>
  );
};
