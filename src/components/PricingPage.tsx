import React, { useState } from 'react';
import { 
  Sparkles, 
  ArrowLeft, 
  Search, 
  Mail, 
  Bell, 
  Zap, 
  Lock,
  Percent, 
  ChevronDown, 
  ChevronUp 
} from 'lucide-react';
import { 
  getLiveSuperOwnerTaxConfig 
} from '../types/multiTenant';
import { SubscriptionPricingCards } from './SubscriptionPricingCards';

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
  const [activeTab, setActiveTab] = useState<'description' | 'markets' | 'companies'>('description');
  const taxConfig = getLiveSuperOwnerTaxConfig();

  const faqs = [
    {
      q: 'How does the 14-day free trial work?',
      a: 'You receive full enterprise access to both Sales CRM and OmniStaff HRMS for 14 days without entering credit card details.'
    },
    {
      q: 'Can I change my plan or add extra cloud storage (GB) later?',
      a: 'Yes! You can upgrade your plan or top-up extra cloud storage anytime in 1-click with automated pro-rated billing.'
    },
    {
      q: 'Do you provide official GST Tax Invoices with Input Tax Credit (ITC)?',
      a: 'Yes, every payment generates an official Indian GST-compliant Tax Invoice featuring platform legal GSTIN, HSN Code 998313, and intra-state CGST/SGST breakdowns.'
    },
    {
      q: 'Is my company data securely isolated?',
      a: 'Absolutely. Our multi-tenant architecture uses isolated tenant schema partitions with 256-bit AES encryption at rest and in transit.'
    }
  ];

  return (
    <div 
      style={{ 
        minHeight: '100vh', 
        background: 'radial-gradient(ellipse at 50% 10%, #0d1b38 0%, #080d1a 55%, #05070e 100%)', 
        color: '#f8fafc', 
        fontFamily: 'system-ui, -apple-system, sans-serif',
        position: 'relative',
        overflowX: 'hidden',
        paddingBottom: '80px'
      }}
    >
      {/* Background Cyber Ambient Glows */}
      <div 
        style={{
          position: 'absolute',
          top: '15%',
          left: '20%',
          width: '500px',
          height: '500px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(56, 189, 248, 0.12) 0%, rgba(2, 132, 199, 0) 70%)',
          filter: 'blur(80px)',
          pointerEvents: 'none'
        }}
      />
      <div 
        style={{
          position: 'absolute',
          top: '25%',
          right: '15%',
          width: '600px',
          height: '600px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(168, 85, 247, 0.14) 0%, rgba(99, 102, 241, 0) 70%)',
          filter: 'blur(90px)',
          pointerEvents: 'none'
        }}
      />

      {/* TOP NAVIGATION HEADER (Matching Reference Screenshot) */}
      <header 
        style={{
          maxWidth: '1360px',
          margin: '0 auto',
          padding: '18px 24px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          position: 'relative',
          zIndex: 30
        }}
      >
        {/* Brand Logo & Back to Home */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '18px' }}>
          <button 
            onClick={onBackToHome}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '7px 14px',
              borderRadius: '10px',
              background: 'rgba(255, 255, 255, 0.08)',
              backdropFilter: 'blur(12px)',
              border: '1px solid rgba(255, 255, 255, 0.15)',
              color: '#cbd5e1',
              fontSize: '12px',
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'all 0.15s ease'
            }}
            onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.14)'; e.currentTarget.style.color = '#fff'; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.08)'; e.currentTarget.style.color = '#cbd5e1'; }}
          >
            <ArrowLeft size={14} />
            <span>Home</span>
          </button>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div 
              style={{ 
                width: '34px', 
                height: '34px', 
                borderRadius: '10px', 
                background: 'linear-gradient(135deg, #38bdf8, #6366f1)', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                boxShadow: '0 0 15px rgba(56, 189, 248, 0.4)'
              }}
            >
              <Zap size={18} color="#ffffff" />
            </div>
            <span style={{ fontSize: '18px', fontWeight: 900, letterSpacing: '0.5px', color: '#ffffff' }}>
              HRMS
            </span>
          </div>
        </div>

        {/* Center Nav Links (Exact Match: Home, Description, Markets, Companies) */}
        <nav 
          style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '28px',
            fontSize: '14px',
            fontWeight: 600
          }}
        >
          <button 
            onClick={onBackToHome}
            style={{ 
              background: 'transparent', 
              border: 'none', 
              color: '#94a3b8', 
              cursor: 'pointer',
              transition: 'color 0.15s ease'
            }}
            onMouseEnter={(e) => e.currentTarget.style.color = '#ffffff'}
            onMouseLeave={(e) => e.currentTarget.style.color = '#94a3b8'}
          >
            Home
          </button>

          <button 
            onClick={() => setActiveTab('description')}
            style={{ 
              background: 'transparent', 
              border: 'none', 
              color: activeTab === 'description' ? '#ffffff' : '#94a3b8', 
              cursor: 'pointer',
              position: 'relative',
              paddingBottom: '4px',
              fontWeight: 700
            }}
          >
            <span>Description</span>
            {activeTab === 'description' && (
              <span 
                style={{ 
                  position: 'absolute', 
                  bottom: 0, 
                  left: 0, 
                  right: 0, 
                  height: '2px', 
                  background: 'linear-gradient(90deg, #38bdf8, #818cf8)',
                  boxShadow: '0 0 8px #38bdf8' 
                }} 
              />
            )}
          </button>

          <button 
            onClick={() => onNavigateTo('modules')}
            style={{ 
              background: 'transparent', 
              border: 'none', 
              color: '#94a3b8', 
              cursor: 'pointer',
              transition: 'color 0.15s ease'
            }}
            onMouseEnter={(e) => e.currentTarget.style.color = '#ffffff'}
            onMouseLeave={(e) => e.currentTarget.style.color = '#94a3b8'}
          >
            Markets
          </button>

          <button 
            onClick={onOpenSignIn}
            style={{ 
              background: 'rgba(56, 189, 248, 0.12)', 
              border: '1px solid rgba(56, 189, 248, 0.3)', 
              color: '#38bdf8', 
              borderRadius: '8px',
              padding: '5px 14px',
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              fontWeight: 700,
              fontSize: '13px',
              transition: 'all 0.15s ease'
            }}
            onMouseEnter={(e) => { e.currentTarget.style.background = '#38bdf8'; e.currentTarget.style.color = '#0f172a'; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(56, 189, 248, 0.12)'; e.currentTarget.style.color = '#38bdf8'; }}
          >
            <Lock size={13} />
            <span>Login</span>
          </button>
        </nav>

        {/* Right Icon Cluster & CTA */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <button 
            onClick={onOpenSearch}
            title="Search (Ctrl + K)"
            style={{ 
              background: 'transparent', 
              border: 'none', 
              color: '#cbd5e1', 
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              padding: '6px'
            }}
          >
            <Search size={18} />
          </button>

          <button 
            onClick={onOpenSignIn}
            title="Messages"
            style={{ 
              background: 'transparent', 
              border: 'none', 
              color: '#cbd5e1', 
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              padding: '6px'
            }}
          >
            <Mail size={18} />
          </button>

          <button 
            onClick={onOpenSignIn}
            title="Notifications"
            style={{ 
              background: 'transparent', 
              border: 'none', 
              color: '#cbd5e1', 
              cursor: 'pointer',
              position: 'relative',
              display: 'flex',
              alignItems: 'center',
              padding: '6px'
            }}
          >
            <Bell size={18} />
            <span 
              style={{ 
                position: 'absolute', 
                top: '4px', 
                right: '4px', 
                width: '7px', 
                height: '7px', 
                borderRadius: '50%', 
                background: '#ef4444',
                boxShadow: '0 0 6px #ef4444' 
              }} 
            />
          </button>

          <button 
            onClick={() => onSelectPlanAndRegister('starter')}
            style={{
              padding: '8px 20px',
              borderRadius: '10px',
              background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 50%, #ec4899 100%)',
              color: '#ffffff',
              border: 'none',
              fontSize: '13px',
              fontWeight: 700,
              boxShadow: '0 4px 18px rgba(99, 102, 241, 0.4)',
              cursor: 'pointer',
              transition: 'all 0.15s ease'
            }}
            onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.boxShadow = '0 6px 22px rgba(99, 102, 241, 0.6)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 4px 18px rgba(99, 102, 241, 0.4)'; }}
          >
            Set Up Profile
          </button>
        </div>
      </header>

      {/* DYNAMIC SUBSCRIPTION PRICING CARDS (100% CONNECTED TO USER CREATED PLANS) */}
      <SubscriptionPricingCards 
        onSelectPlan={onSelectPlanAndRegister}
        onManageSubscription={onOpenSignIn}
        showToggle={true}
      />

      {/* DYNAMIC GST TAX BREAKDOWN & FAQ SECTION */}
      <div style={{ maxWidth: '1100px', margin: '40px auto 0', padding: '0 20px', position: 'relative', zIndex: 10 }}>
        {/* GST Slab Engine Notice */}
        <div 
          style={{
            background: 'rgba(255, 255, 255, 0.04)',
            backdropFilter: 'blur(16px)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: '20px',
            padding: '20px 24px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '16px',
            marginBottom: '40px'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <div style={{ width: '42px', height: '42px', borderRadius: '12px', background: 'rgba(56, 189, 248, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#38bdf8' }}>
              <Percent size={22} />
            </div>
            <div>
              <div style={{ fontSize: '14px', fontWeight: 800, color: '#ffffff' }}>
                Indian GST Compliance & Input Tax Credit (ITC)
              </div>
              <div style={{ fontSize: '12px', color: '#94a3b8', marginTop: '2px' }}>
                Platform GSTIN: {taxConfig.gstin || '07AABCI8899K1Z4'} • HSN SAC: {taxConfig.hsnSacCode || '998313'} • Active Rate: {taxConfig.ratePercent}% GST
              </div>
            </div>
          </div>

          <div style={{ fontSize: '13px', color: '#38bdf8', fontWeight: 700 }}>
            {taxConfig.isTaxInclusive ? 'Inclusive of Taxes' : `+${taxConfig.ratePercent}% GST Applicable at Checkout`}
          </div>
        </div>

        {/* FAQ Accordion */}
        <div>
          <h3 style={{ fontSize: '22px', fontWeight: 800, color: '#ffffff', textAlign: 'center', marginBottom: '24px' }}>
            Frequently Asked Questions
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {faqs.map((faq, idx) => {
              const isOpen = openFaq === idx;
              return (
                <div 
                  key={idx}
                  style={{
                    background: 'rgba(255, 255, 255, 0.04)',
                    border: '1px solid rgba(255, 255, 255, 0.08)',
                    borderRadius: '16px',
                    overflow: 'hidden',
                    transition: 'all 0.2s ease'
                  }}
                >
                  <button 
                    onClick={() => setOpenFaq(isOpen ? null : idx)}
                    style={{
                      width: '100%',
                      padding: '16px 20px',
                      background: 'transparent',
                      border: 'none',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      color: '#ffffff',
                      fontSize: '14px',
                      fontWeight: 700,
                      cursor: 'pointer',
                      textAlign: 'left'
                    }}
                  >
                    <span>{faq.q}</span>
                    {isOpen ? <ChevronUp size={18} color="#38bdf8" /> : <ChevronDown size={18} color="#94a3b8" />}
                  </button>

                  {isOpen && (
                    <div style={{ padding: '0 20px 18px', fontSize: '13px', color: '#94a3b8', lineHeight: 1.6 }}>
                      {faq.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
