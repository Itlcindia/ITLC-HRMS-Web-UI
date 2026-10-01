import React from 'react';
import { Sparkles, ArrowRight, ArrowDown } from 'lucide-react';

export interface HeroHeadlineSectionProps {
  badgeText?: string;
  headline?: string;
  subtitle?: string;
  primaryButtonText?: string;
  onOpenOnboarding?: () => void;
  whatsAppNumber?: string;
  whatsAppMessage?: string;
  onScrollToEcosystem?: () => void;
}

export const HeroHeadlineSection: React.FC<HeroHeadlineSectionProps> = ({
  badgeText = '✨ Unified Enterprise OS • 100% Real-Time Cloud Sync',
  headline = 'Build a Better Workplace with Unified OmniStaff HRMS Cloud',
  subtitle = 'People • Process • Growth — Streamline employee onboarding, live biometric attendance, 1-click automated payroll, and workforce intelligence in one living 3D ecosystem (Sales CRM Coming Soon).',
  primaryButtonText = 'Start Free Enterprise Trial',
  onOpenOnboarding,
  whatsAppNumber = '9532341000',
  whatsAppMessage = 'Hello ITLC Team, I want to connect with sales for OmniStaff HRMS.',
  onScrollToEcosystem
}) => {
  return (
    <div 
      style={{ 
        maxWidth: '1280px', 
        minHeight: 'calc(100vh - 120px)', 
        margin: '0 auto', 
        padding: '24px 24px 28px', 
        position: 'relative', 
        zIndex: 6, 
        textAlign: 'center',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center'
      }}
    >
      <style>{`
        @keyframes subtleBounce {
          0%, 20%, 50%, 80%, 100% { transform: translateY(0); }
          40% { transform: translateY(6px); }
          60% { transform: translateY(3px); }
        }
      `}</style>

      <div style={{ maxWidth: '1080px', margin: 'auto 0' }}>
        {/* Top Floating Pill Badge */}
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: 'rgba(255, 255, 255, 0.95)', border: '1px solid rgba(226, 232, 240, 0.9)', boxShadow: '0 4px 20px rgba(99, 102, 241, 0.08), 0 1px 3px rgba(0, 0, 0, 0.02)', padding: '7px 20px', borderRadius: '999px', fontSize: '12px', fontWeight: 800, color: '#334155', textTransform: 'uppercase', letterSpacing: '0.6px', marginBottom: '22px' }}>
          <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#10b981', boxShadow: '0 0 10px #10b981', display: 'inline-block' }} />
          <span>{badgeText}</span>
        </div>

        {/* Main Headline */}
        <h1 
          style={{
            fontSize: 'clamp(34px, 5.2vw, 58px)',
            fontWeight: 900,
            color: '#0f172a',
            letterSpacing: '-1.5px',
            lineHeight: 1.12,
            margin: '0 auto 16px',
            maxWidth: '1050px'
          }}
        >
          <span style={{ 
            background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 40%, #2563eb 80%, #0284c7 100%)', 
            WebkitBackgroundClip: 'text', 
            WebkitTextFillColor: 'transparent',
            display: 'inline-block'
          }}>
            {headline}
          </span>
        </h1>

        {/* Subtitle */}
        <p style={{ fontSize: 'clamp(15px, 1.85vw, 18px)', color: '#475569', maxWidth: '840px', margin: '0 auto 28px', lineHeight: 1.62, fontWeight: 500 }}>
          {subtitle}
        </p>

        {/* Primary & Secondary Action CTAs */}
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
          <button 
            type="button" 
            className="btn btn-primary"
            style={{
              background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
              color: '#ffffff',
              borderRadius: '14px',
              padding: '14px 32px',
              fontSize: '15px',
              fontWeight: 800,
              boxShadow: '0 10px 25px rgba(15, 23, 42, 0.22)',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '10px',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}
            onClick={onOpenOnboarding}
            onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
            onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
          >
            <Sparkles size={17} color="#38bdf8" />
            <span>{primaryButtonText}</span>
            <ArrowRight size={16} />
          </button>

          <a 
            href={`https://wa.me/${whatsAppNumber}?text=${encodeURIComponent(whatsAppMessage)}`}
            target="_blank"
            rel="noreferrer"
            className="btn btn-secondary"
            style={{
              background: '#ffffff',
              color: '#0f172a',
              borderRadius: '14px',
              padding: '14px 26px',
              fontSize: '15px',
              fontWeight: 700,
              border: '1px solid #cbd5e1',
              boxShadow: '0 4px 16px rgba(0, 0, 0, 0.04)',
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '9px',
              textDecoration: 'none',
              transition: 'all 0.2s ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.borderColor = '#94a3b8';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.borderColor = '#cbd5e1';
            }}
          >
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#22c55e', display: 'inline-block' }} />
            <span>Talk on WhatsApp</span>
          </a>
        </div>
      </div>

      {/* Scroll Down Indicator */}
      <div 
        style={{ 
          marginTop: 'auto', 
          paddingTop: '20px',
          display: 'flex', 
          flexDirection: 'column', 
          alignItems: 'center', 
          gap: '6px',
          cursor: 'pointer',
          userSelect: 'none'
        }}
        onClick={() => {
          if (onScrollToEcosystem) {
            onScrollToEcosystem();
          } else {
            const el = document.getElementById('interactive-ecosystem-stage');
            if (el) el.scrollIntoView({ behavior: 'smooth' });
          }
        }}
      >
        <span style={{ fontSize: '11px', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.8px' }}>
          Scroll to explore 3D Ecosystem
        </span>
        <div style={{ animation: 'subtleBounce 2s ease-in-out infinite', color: '#0284c7' }}>
          <ArrowDown size={18} strokeWidth={2.4} />
        </div>
      </div>
    </div>
  );
};

export default HeroHeadlineSection;
