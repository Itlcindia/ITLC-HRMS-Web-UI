import React, { useEffect, useState } from 'react';
import {
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Percent
} from 'lucide-react';
import { getLiveSuperOwnerTaxConfig } from '../types/multiTenant';
import { SubscriptionPricingCards } from './SubscriptionPricingCards';
import { LandingHeader } from './LandingHeader';
import { LandingFooter } from './LandingFooter';

interface PricingPageProps {
  onBackToHome: () => void;
  onSelectPlanAndRegister: (planId: string) => void;
  onOpenSignIn: () => void;
  onOpenSearch: () => void;
  onNavigateTo: (page: 'workspaces' | 'security' | 'modules' | 'pricing') => void;
}

export const PricingPage: React.FC<PricingPageProps> = ({
  onBackToHome,
  onSelectPlanAndRegister,
  onOpenSignIn,
  onOpenSearch,
  onNavigateTo
}) => {
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const taxConfig = getLiveSuperOwnerTaxConfig();

  useEffect(() => {
    const previousScrollRestoration = window.history.scrollRestoration;
    const resetScroll = () => window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
    const timeoutIds: number[] = [];

    if ('scrollRestoration' in window.history) {
      window.history.scrollRestoration = 'manual';
    }

    resetScroll();
    const frameId = window.requestAnimationFrame(resetScroll);
    [80, 250, 500].forEach(delay => {
      timeoutIds.push(window.setTimeout(resetScroll, delay));
    });

    return () => {
      window.cancelAnimationFrame(frameId);
      timeoutIds.forEach(timeoutId => window.clearTimeout(timeoutId));
      if ('scrollRestoration' in window.history) {
        window.history.scrollRestoration = previousScrollRestoration;
      }
    };
  }, []);

  const faqs = [
    {
      q: 'How does the free trial work?',
      a: 'You can start with the selected ITLC plan, test HRMS workflows, and continue with paid billing once your team is ready.'
    },
    {
      q: 'Can I change my plan later?',
      a: 'Yes. ITLC plans can be upgraded as your employee count, storage needs, and HR modules grow.'
    },
    {
      q: 'Do you provide GST invoices?',
      a: 'Yes. ITLC can generate GST-compliant invoices with configured tax rate, GSTIN, SAC/HSN details, and tax split rules.'
    },
    {
      q: 'Is my HR data secure?',
      a: 'Yes. ITLC uses role-based access, tenant isolation, audit logs, and secure cloud storage for HRMS records.'
    }
  ];

  return (
    <div className="itlc-pricing-page">
      <LandingHeader
        onHome={onBackToHome}
        onFeatures={() => onNavigateTo('modules')}
        onPricing={() => onNavigateTo('pricing')}
        onSolutions={() => onNavigateTo('workspaces')}
        onSecurity={() => onNavigateTo('security')}
        onLogin={onOpenSignIn}
        onGetStarted={() => onSelectPlanAndRegister('starter')}
      />

      <SubscriptionPricingCards
        onSelectPlan={onSelectPlanAndRegister}
        onManageSubscription={onOpenSignIn}
        showToggle={true}
      />

      <section className="itlc-pricing-info">
        <div className="itlc-pricing-tax-card">
          <div>
            <Percent size={24} />
          </div>
          <article>
            <strong>Indian GST Compliance & Input Tax Credit</strong>
            <span>
              Platform GSTIN: {taxConfig.gstin || '07AABCI8899K1Z4'} · HSN/SAC: {taxConfig.hsnSacCode || '998313'} · Active rate: {taxConfig.ratePercent}% {taxConfig.taxLabel || 'GST'}
            </span>
          </article>
          <em>{taxConfig.isTaxInclusive ? 'Inclusive of taxes' : `+${taxConfig.ratePercent}% GST at checkout`}</em>
        </div>

        <div className="itlc-pricing-faq">
          <h3>Frequently Asked Questions</h3>
          {faqs.map((faq, index) => {
            const isOpen = openFaq === index;
            return (
              <div className="itlc-pricing-faq-item" key={faq.q}>
                <button type="button" onClick={() => setOpenFaq(isOpen ? null : index)}>
                  <span>{faq.q}</span>
                  {isOpen ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                </button>
                {isOpen && <p>{faq.a}</p>}
              </div>
            );
          })}
        </div>

        <div className="itlc-pricing-security-note">
          <CheckCircle2 size={18} />
          Your ITLC pricing and public checkout stay connected to the subscription plans configured by your Superowner panel.
        </div>
      </section>

      <LandingFooter onNavigate={(p) => p === 'home' ? onBackToHome() : onNavigateTo(p)} />
    </div>
  );
};
