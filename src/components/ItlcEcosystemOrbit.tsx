import React, { useState, useEffect } from 'react';
import { 
  Sparkles, 
  Briefcase, 
  Users, 
  ArrowRight, 
  Zap, 
  ShieldCheck, 
  Globe, 
  Layers, 
  Activity, 
  Kanban, 
  Receipt, 
  CheckCircle2,
  Clock,
  RotateCw,
  Cpu,
  Lock,
  Smartphone
} from 'lucide-react';
import { 
  getLiveLandingPageConfig, 
  type LandingPageConfig 
} from '../types/multiTenant';

export interface ItlcEcosystemOrbitProps {
  onLaunchCrm?: () => void;
  onLaunchHrms?: () => void;
  lang?: 'en' | 'hi';
}

interface EcosystemProduct {
  id: string;
  name: string;
  tagline: string;
  badge: string;
  color: string;
  glowColor: string;
  lightBg: string;
  gradient: string;
  icon: React.ReactNode;
  metric: string;
  features: string[];
  action: () => void;
}

export const ItlcEcosystemOrbit: React.FC<ItlcEcosystemOrbitProps> = ({
  onLaunchCrm = () => { window.location.hash = '#login'; },
  onLaunchHrms = () => { window.location.hash = '#login'; },
  lang = 'en'
}) => {
  const [isPaused, setIsPaused] = useState(false);
  const [activeHoverId, setActiveHoverId] = useState<string | null>(null);
  const [cmsConfig, setCmsConfig] = useState<LandingPageConfig>(getLiveLandingPageConfig());

  useEffect(() => {
    const handleCmsUpdate = (e: any) => {
      setCmsConfig(e.detail || getLiveLandingPageConfig());
    };
    window.addEventListener('landing_page_config_updated', handleCmsUpdate);
    return () => window.removeEventListener('landing_page_config_updated', handleCmsUpdate);
  }, []);

  // Products in Orbit (Currently the 2 active flagship applications with rich feature sets)
  const products: EcosystemProduct[] = [
    {
      id: 'crm',
      name: 'ITLC Sales CRM',
      tagline: 'Deals Pipeline, GPS Field Sales & GST Tax Invoicing',
      badge: 'COMING SOON',
      color: '#0284c7',
      glowColor: 'rgba(2, 132, 199, 0.45)',
      lightBg: 'rgba(2, 132, 199, 0.12)',
      gradient: 'linear-gradient(135deg, #0284c7 0%, #00d2ff 100%)',
      icon: <Briefcase size={26} color="#ffffff" strokeWidth={2.2} />,
      metric: 'Launching Soon',
      features: [
        'Visual Deals Kanban Board',
        'Live GPS Field Sales Tracking',
        'Automated GST Tax Invoicing',
        'AI Sales Copilot & Insights'
      ],
      action: onLaunchCrm
    },
    {
      id: 'hrms',
      name: 'OmniStaff HRMS',
      tagline: '24-Cell Biometric Radar, Attendance & 1-Click Payroll',
      badge: 'LIVE WORKSPACE',
      color: '#7c3aed',
      glowColor: 'rgba(124, 58, 237, 0.45)',
      lightBg: 'rgba(124, 58, 237, 0.12)',
      gradient: 'linear-gradient(135deg, #7c3aed 0%, #a855f7 100%)',
      icon: <Users size={26} color="#ffffff" strokeWidth={2.2} />,
      metric: '12,480 Live Punches',
      features: [
        '24-Cell Biometric Radar Sync',
        'GPS Geofenced Mobile Punch',
        '1-Click Salary Slip Generation',
        'Leave & Shift Roster Workflows'
      ],
      action: onLaunchHrms
    }
  ];

  return (
    <section 
      id="ecosystem-orbit-section"
      className="itlc-ecosystem-orbit-section" 
      style={{ 
        width: '100%',
        maxWidth: '100%',
        padding: '70px 24px 80px', 
        position: 'relative', 
        overflow: 'hidden', 
        background: 'linear-gradient(180deg, #f8fafc 0%, #f1f5f9 100%)',
        boxSizing: 'border-box'
      }}
    >
      {/* Background Ambient Radial Glows */}
      <div 
        style={{
          position: 'absolute',
          top: '45%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: '900px',
          height: '900px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(2, 132, 199, 0.1) 0%, rgba(124, 58, 237, 0.08) 35%, transparent 70%)',
          filter: 'blur(80px)',
          pointerEvents: 'none',
          zIndex: 0
        }}
      />

      <div style={{ maxWidth: '1280px', margin: '0 auto', position: 'relative', zIndex: 2 }}>
        {/* Section Header */}
        <div style={{ textAlign: 'center', marginBottom: '45px' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: 'rgba(255, 255, 255, 0.95)', border: '1px solid rgba(226, 232, 240, 0.9)', boxShadow: '0 4px 16px rgba(16, 185, 129, 0.08)', color: '#15803d', padding: '6px 20px', borderRadius: '30px', fontSize: '12px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: '14px' }}>
            <Sparkles size={14} color="#16a34a" />
            <span>Connected Cloud Architecture</span>
          </div>

          <h2 style={{ fontSize: 'clamp(30px, 4.2vw, 48px)', fontWeight: 900, color: '#0f172a', margin: '0 0 12px', letterSpacing: '-1.1px', lineHeight: 1.15 }}>
            The ITLC Ecosystem Orbit
          </h2>

          <p style={{ fontSize: 'clamp(15px, 1.8vw, 17px)', color: '#475569', maxWidth: '680px', margin: '0 auto', lineHeight: 1.6, fontWeight: 500 }}>
            All flagship enterprise suites revolve and synchronize seamlessly around the central ITLC Core Operating System in real time.
          </p>
        </div>

        {/* THE CIRCULAR ORBITAL STAGE (100% Full Visibility) */}
        <div 
          className="orbital-stage-container"
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
          style={{
            position: 'relative',
            width: '100%',
            maxWidth: '960px',
            minHeight: '660px',
            margin: '0 auto',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 2
          }}
        >
          {/* Outer Orbit Concentric Ring 1 (Dashed) */}
          <div 
            className={`orbit-ring-track ${isPaused ? 'orbit-paused' : ''}`}
            style={{
              position: 'absolute',
              width: '600px',
              height: '600px',
              borderRadius: '50%',
              border: '2px dashed rgba(2, 132, 199, 0.35)',
              boxShadow: '0 0 50px rgba(2, 132, 199, 0.12), inset 0 0 40px rgba(124, 58, 237, 0.09)'
            }}
          />

          {/* Outer Orbit Concentric Ring 2 (Solid Glow) */}
          <div 
            style={{
              position: 'absolute',
              width: '500px',
              height: '500px',
              borderRadius: '50%',
              border: '1.5px solid rgba(226, 232, 240, 0.95)',
              pointerEvents: 'none'
            }}
          />

          {/* Orbit Ring 3 (Inner Ambient Ring) */}
          <div 
            style={{
              position: 'absolute',
              width: '360px',
              height: '360px',
              borderRadius: '50%',
              border: '1.5px dashed rgba(124, 58, 237, 0.3)',
              pointerEvents: 'none'
            }}
          />

          {/* === CENTER CORE: ITLC ECOSYSTEM HUB === */}
          <div 
            className="itlc-center-ecosystem-core"
            style={{
              position: 'relative',
              width: '230px',
              height: '230px',
              borderRadius: '50%',
              background: 'linear-gradient(145deg, #0f172a 0%, #1e293b 100%)',
              border: '3.5px solid rgba(255, 255, 255, 0.9)',
              boxShadow: '0 25px 60px rgba(15, 23, 42, 0.4), 0 0 50px rgba(2, 132, 199, 0.45), inset 0 0 30px rgba(0, 210, 255, 0.35)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              textAlign: 'center',
              padding: '20px',
              zIndex: 10,
              cursor: 'default'
            }}
          >
            {/* Pulsing Core Wave */}
            <div 
              className="core-pulse-wave"
              style={{
                position: 'absolute',
                width: '100%',
                height: '100%',
                borderRadius: '50%',
                border: '2.5px solid rgba(2, 132, 199, 0.85)',
                pointerEvents: 'none'
              }}
            />

            {/* ITLC Logo Pod */}
            <div 
              style={{
                width: '50px',
                height: '50px',
                borderRadius: '50%',
                background: '#ffffff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '8px',
                boxShadow: '0 6px 20px rgba(0,0,0,0.35)',
                overflow: 'hidden',
                padding: '4px'
              }}
            >
              <img 
                src="/itlc_logo.png" 
                alt="ITLC Logo" 
                style={{ width: '100%', height: '100%', objectFit: 'contain' }}
              />
            </div>

            <span style={{ fontSize: '10px', fontWeight: 800, color: '#38bdf8', letterSpacing: '1.2px', textTransform: 'uppercase' }}>
              MASTER PLATFORM
            </span>
            <h3 style={{ margin: '2px 0 0', fontSize: '19px', fontWeight: 900, color: '#ffffff', letterSpacing: '-0.4px', lineHeight: 1.1 }}>
              {cmsConfig.orbitCenterTitle || 'ITLC Ecosystem'}
            </h3>
            <span style={{ fontSize: '11px', color: '#94a3b8', fontWeight: 600, marginTop: '3px' }}>
              {cmsConfig.orbitCenterSubtitle || 'Unified OS Engine'}
            </span>

            {/* Sync Status Dot */}
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', background: 'rgba(34, 197, 94, 0.18)', border: '1px solid rgba(34, 197, 94, 0.4)', padding: '3px 10px', borderRadius: '12px', marginTop: '8px' }}>
              <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#22c55e', boxShadow: '0 0 8px #22c55e' }} />
              <span style={{ fontSize: '9px', fontWeight: 800, color: '#86efac', letterSpacing: '0.6px' }}>{cmsConfig.orbitSyncBadge || '2 APPS SYNCED'}</span>
            </div>
          </div>

          {/* === ROTATING ORBIT CONTAINER HOLDING THE 2 PRODUCTS === */}
          <div 
            className={`orbiting-planets-carrier ${isPaused ? 'orbit-paused' : ''}`}
            style={{
              position: 'absolute',
              width: '600px',
              height: '600px',
              borderRadius: '50%',
              pointerEvents: 'none',
              zIndex: 5
            }}
          >
            {/* PRODUCT 1: ITLC SALES CRM (Top Position in Orbit) */}
            <div 
              className="orbiting-planet-wrapper"
              style={{
                position: 'absolute',
                top: '-45px',
                left: '50%',
                transform: 'translateX(-50%)',
                pointerEvents: 'auto'
              }}
            >
              <div 
                className={`product-orbit-card ${activeHoverId === 'crm' ? 'hovered' : ''} ${isPaused ? 'counter-rotate-paused' : 'counter-rotate'}`}
                onMouseEnter={() => setActiveHoverId('crm')}
                onMouseLeave={() => setActiveHoverId(null)}
                onClick={products[0].action}
                style={{
                  width: '300px',
                  background: '#ffffff',
                  border: `2px solid ${products[0].color}`,
                  borderRadius: '24px',
                  padding: '18px 20px',
                  boxShadow: `0 18px 40px ${products[0].glowColor}, 0 4px 14px rgba(15, 23, 42, 0.08)`,
                  cursor: 'pointer',
                  transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '10px'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div 
                    style={{
                      width: '46px',
                      height: '46px',
                      borderRadius: '15px',
                      background: products[0].gradient,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      boxShadow: `0 8px 18px ${products[0].glowColor}`
                    }}
                  >
                    {products[0].icon}
                  </div>

                  <span style={{ fontSize: '10.5px', fontWeight: 800, color: products[0].color, background: products[0].lightBg, padding: '4px 12px', borderRadius: '14px', border: `1px solid ${products[0].glowColor}` }}>
                    {products[0].badge}
                  </span>
                </div>

                <div>
                  <h4 style={{ margin: 0, fontSize: '17px', fontWeight: 900, color: '#0f172a', letterSpacing: '-0.3px' }}>
                    {products[0].name}
                  </h4>
                  <p style={{ margin: '3px 0 0', fontSize: '11.5px', color: '#64748b', fontWeight: 600, lineHeight: 1.4 }}>
                    {products[0].tagline}
                  </p>
                </div>

                {/* Key Features Checklist */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', padding: '6px 0', borderTop: '1px solid #f1f5f9' }}>
                  {products[0].features.map((feat, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', color: '#334155', fontWeight: 600 }}>
                      <CheckCircle2 size={13} color="#0284c7" />
                      <span>{feat}</span>
                    </div>
                  ))}
                </div>

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: '8px', borderTop: '1px solid #f1f5f9' }}>
                  <span style={{ fontSize: '12px', fontWeight: 900, color: products[0].color }}>
                    {products[0].metric}
                  </span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '12.5px', fontWeight: 800, color: products[0].color }}>
                    <span>Launch Workspace</span>
                    <ArrowRight size={14} />
                  </div>
                </div>
              </div>
            </div>

            {/* PRODUCT 2: OMNISTAFF HRMS (Bottom Position in Orbit) */}
            <div 
              className="orbiting-planet-wrapper"
              style={{
                position: 'absolute',
                bottom: '-45px',
                left: '50%',
                transform: 'translateX(-50%)',
                pointerEvents: 'auto'
              }}
            >
              <div 
                className={`product-orbit-card ${activeHoverId === 'hrms' ? 'hovered' : ''} ${isPaused ? 'counter-rotate-paused' : 'counter-rotate'}`}
                onMouseEnter={() => setActiveHoverId('hrms')}
                onMouseLeave={() => setActiveHoverId(null)}
                onClick={products[1].action}
                style={{
                  width: '300px',
                  background: '#ffffff',
                  border: `2px solid ${products[1].color}`,
                  borderRadius: '24px',
                  padding: '18px 20px',
                  boxShadow: `0 18px 40px ${products[1].glowColor}, 0 4px 14px rgba(15, 23, 42, 0.08)`,
                  cursor: 'pointer',
                  transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '10px'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div 
                    style={{
                      width: '46px',
                      height: '46px',
                      borderRadius: '15px',
                      background: products[1].gradient,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      boxShadow: `0 8px 18px ${products[1].glowColor}`
                    }}
                  >
                    {products[1].icon}
                  </div>

                  <span style={{ fontSize: '10.5px', fontWeight: 800, color: products[1].color, background: products[1].lightBg, padding: '4px 12px', borderRadius: '14px', border: `1px solid ${products[1].glowColor}` }}>
                    {products[1].badge}
                  </span>
                </div>

                <div>
                  <h4 style={{ margin: 0, fontSize: '17px', fontWeight: 900, color: '#0f172a', letterSpacing: '-0.3px' }}>
                    {products[1].name}
                  </h4>
                  <p style={{ margin: '3px 0 0', fontSize: '11.5px', color: '#64748b', fontWeight: 600, lineHeight: 1.4 }}>
                    {products[1].tagline}
                  </p>
                </div>

                {/* Key Features Checklist */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', padding: '6px 0', borderTop: '1px solid #f1f5f9' }}>
                  {products[1].features.map((feat, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', color: '#334155', fontWeight: 600 }}>
                      <CheckCircle2 size={13} color="#7c3aed" />
                      <span>{feat}</span>
                    </div>
                  ))}
                </div>

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: '8px', borderTop: '1px solid #f1f5f9' }}>
                  <span style={{ fontSize: '12px', fontWeight: 900, color: products[1].color }}>
                    {products[1].metric}
                  </span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '12.5px', fontWeight: 800, color: products[1].color }}>
                    <span>Launch Workspace</span>
                    <ArrowRight size={14} />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Orbit Interaction & Capabilities Pill Bar */}
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '14px', marginTop: '35px', flexWrap: 'wrap', position: 'relative', zIndex: 2 }}>
          <span style={{ fontSize: '12px', fontWeight: 700, color: '#475569', display: 'inline-flex', alignItems: 'center', gap: '7px', background: '#ffffff', padding: '8px 18px', borderRadius: '20px', border: '1px solid #e2e8f0', boxShadow: '0 2px 10px rgba(0,0,0,0.03)' }}>
            <RotateCw size={14} className="spin-slow" color="#0284c7" />
            <span>Hover over any product to pause orbit & explore features</span>
          </span>

          <span style={{ fontSize: '12px', fontWeight: 700, color: '#475569', display: 'inline-flex', alignItems: 'center', gap: '7px', background: '#ffffff', padding: '8px 18px', borderRadius: '20px', border: '1px solid #e2e8f0', boxShadow: '0 2px 10px rgba(0,0,0,0.03)' }}>
            <Cpu size={14} color="#7c3aed" />
            <span>Sub-millisecond data sync between CRM & HRMS</span>
          </span>

          <span style={{ fontSize: '12px', fontWeight: 700, color: '#475569', display: 'inline-flex', alignItems: 'center', gap: '7px', background: '#ffffff', padding: '8px 18px', borderRadius: '20px', border: '1px solid #e2e8f0', boxShadow: '0 2px 10px rgba(0,0,0,0.03)' }}>
            <Lock size={14} color="#16a34a" />
            <span>Multi-Tenant SOC-2 Data Isolation</span>
          </span>
        </div>
      </div>

      {/* Embedded CSS Animations for Orbit Physics & Responsive Layout */}
      <style>{`
        @keyframes rotateOrbit {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        @keyframes counterRotate {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(-360deg); }
        }
        @keyframes corePulseAnim {
          0% { transform: scale(1); opacity: 0.85; }
          50% { transform: scale(1.38); opacity: 0; }
          100% { transform: scale(1); opacity: 0; }
        }
        @keyframes spinSlow {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        .orbit-ring-track {
          animation: rotateOrbit 32s linear infinite;
        }
        .orbiting-planets-carrier {
          animation: rotateOrbit 32s linear infinite;
        }
        .counter-rotate {
          animation: counterRotate 32s linear infinite;
        }

        .orbit-paused {
          animation-play-state: paused !important;
        }
        .counter-rotate-paused {
          animation-play-state: paused !important;
        }

        .core-pulse-wave {
          animation: corePulseAnim 2.8s cubic-bezier(0.25, 1, 0.5, 1) infinite;
        }
        .spin-slow {
          animation: spinSlow 8s linear infinite;
        }

        .product-orbit-card:hover {
          transform: scale(1.06) !important;
          box-shadow: 0 24px 50px rgba(15, 23, 42, 0.18) !important;
        }

        @media (max-width: 860px) {
          .orbital-stage-container {
            min-height: auto !important;
            height: auto !important;
            flex-direction: column !important;
            gap: 28px !important;
            padding: 20px 0 !important;
          }
          .orbit-ring-track,
          .orbiting-planets-carrier {
            display: none !important;
          }
          .product-orbit-card {
            animation: none !important;
            width: 100% !important;
            max-width: 360px !important;
          }
          .orbiting-planet-wrapper {
            position: relative !important;
            top: auto !important;
            bottom: auto !important;
            left: auto !important;
            transform: none !important;
          }
        }
      `}</style>
    </section>
  );
};

export default ItlcEcosystemOrbit;
