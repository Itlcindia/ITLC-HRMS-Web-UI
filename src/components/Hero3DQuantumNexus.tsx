import React, { useState, useEffect, useRef } from 'react';
import { 
  Sparkles, 
  ShieldCheck, 
  Users, 
  Briefcase, 
  ArrowRight, 
  CheckCircle2, 
  Zap, 
  Activity, 
  Kanban, 
  Receipt, 
  Lock, 
  DollarSign, 
  TrendingUp, 
  Clock
} from 'lucide-react';
import { 
  getLiveLandingPageConfig, 
  type LandingPageConfig 
} from '../types/multiTenant';
import { InteractiveIsometricEcosystem } from './InteractiveIsometricEcosystem';
import { ItlcEcosystemOrbit } from './ItlcEcosystemOrbit';
import { HeroHeadlineSection } from './HeroHeadlineSection';

interface Hero3DQuantumNexusProps {
  onExploreCrm: () => void;
  onExploreHrms: () => void;
  onOpenSuperAdmin: () => void;
  onOpenOnboarding: () => void;
  lang?: 'en' | 'hi';
}

export const Hero3DQuantumNexus: React.FC<Hero3DQuantumNexusProps> = ({
  onExploreCrm,
  onExploreHrms,
  onOpenSuperAdmin,
  onOpenOnboarding,
  lang = 'en'
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [cmsConfig, setCmsConfig] = useState<LandingPageConfig>(getLiveLandingPageConfig());
  const [activeTelemetry, setActiveTelemetry] = useState({
    activePipelines: cmsConfig.telemetry.activePipelines,
    biometricPunches: cmsConfig.telemetry.biometricPunches,
    invoicesCleared: cmsConfig.telemetry.invoicesCleared,
    syncLatency: '3.8ms'
  });

  // Listen for live CMS changes made by Super Admin
  useEffect(() => {
    const handleCmsUpdate = (e: any) => {
      const updated = e.detail || getLiveLandingPageConfig();
      setCmsConfig(updated);
      setActiveTelemetry(prev => ({
        ...prev,
        activePipelines: updated.telemetry.activePipelines,
        biometricPunches: updated.telemetry.biometricPunches,
        invoicesCleared: updated.telemetry.invoicesCleared
      }));
    };
    window.addEventListener('landing_page_config_updated', handleCmsUpdate);
    return () => window.removeEventListener('landing_page_config_updated', handleCmsUpdate);
  }, []);

  // Live telemetry pulse simulation
  useEffect(() => {
    const pulseTimer = setInterval(() => {
      setActiveTelemetry(prev => ({
        activePipelines: prev.activePipelines + Math.floor(Math.random() * 3),
        biometricPunches: prev.biometricPunches + Math.floor(Math.random() * 5),
        invoicesCleared: prev.invoicesCleared + Math.floor(Math.random() * 2),
        syncLatency: `${(3.4 + Math.random() * 0.7).toFixed(1)}ms`
      }));
    }, 2800);
    return () => clearInterval(pulseTimer);
  }, []);

  // Real 60FPS Ambient Particle Nebula Canvas (Spans full 100vw width)
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = canvas.offsetHeight || 650);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = canvas.offsetHeight || 650;
    };
    window.addEventListener('resize', handleResize);

    // Generate floating 3D dust particles
    const particles = Array.from({ length: 50 }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      size: Math.random() * 2.6 + 1,
      speedX: (Math.random() - 0.5) * 0.4,
      speedY: (Math.random() - 0.5) * 0.4,
      opacity: Math.random() * 0.5 + 0.2,
      color: Math.random() > 0.6 ? '#38bdf8' : Math.random() > 0.3 ? '#818cf8' : '#34d399'
    }));

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      // Render & update particles with soft glow
      particles.forEach(p => {
        p.x += p.speedX;
        p.y += p.speedY;
        if (p.x < 0) p.x = width;
        if (p.x > width) p.x = 0;
        if (p.y < 0) p.y = height;
        if (p.y > height) p.y = 0;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.globalAlpha = p.opacity;
        ctx.shadowBlur = 10;
        ctx.shadowColor = p.color;
        ctx.fill();
      });

      ctx.globalAlpha = 1;
      ctx.shadowBlur = 0;
      animationId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationId);
    };
  }, []);

  return (
    <div 
      className="quantum-nexus-root"
      style={{ 
        width: '100vw', 
        position: 'relative', 
        left: '50%',
        right: '50%',
        marginLeft: '-50vw',
        marginRight: '-50vw',
        overflowX: 'hidden', 
        background: '#f8fafc',
        padding: '10px 0 35px'
      }}
    >
      
      {/* 1. REAL 60FPS AMBIENT CANVAS DUST OVER FULL 100VW */}
      <canvas 
        ref={canvasRef} 
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          pointerEvents: 'none',
          zIndex: 4
        }}
      />

      {/* 2. AMBIENT MULTI-COLOR NEON BACKDROP GLOW */}
      <div 
        style={{
          position: 'absolute',
          top: '-100px',
          left: '50%',
          transform: 'translateX(-50%)',
          width: '100vw',
          height: '620px',
          background: 'radial-gradient(ellipse at 50% 30%, rgba(99, 102, 241, 0.16) 0%, rgba(2, 132, 199, 0.14) 35%, rgba(16, 185, 129, 0.09) 65%, transparent 80%)',
          filter: 'blur(85px)',
          pointerEvents: 'none',
          zIndex: 0
        }}
      />

      {/* 4. NATIVE INTERACTIVE 3D ISOMETRIC ECOSYSTEM (100% PURE CODE ANIMATION REPLACING VIDEO) */}
      <div 
        id="hero_3d_stage"
        className="nexus-3d-fullwidth-stage"
        style={{
          position: 'relative',
          width: '100%',
          maxWidth: '100%',
          margin: '10px 0 0',
          padding: '20px 0',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 3,
          overflow: 'visible'
        }}
      >
        <InteractiveIsometricEcosystem 
          onExploreCrm={onExploreCrm}
          onExploreHrms={onExploreHrms}
          onOpenSuperAdmin={onOpenSuperAdmin}
          onOpenOnboarding={onOpenOnboarding}
        />
      </div>

      {/* 5. LIVE REALTIME TICKER / TRUST BADGE */}
      <div style={{ maxWidth: '1200px', margin: '32px auto 0', padding: '0 24px', position: 'relative', zIndex: 6 }}>
        <div 
          style={{ 
            background: 'rgba(255, 255, 255, 0.9)', 
            backdropFilter: 'blur(16px)', 
            border: '1px solid rgba(226, 232, 240, 0.8)', 
            borderRadius: '20px', 
            padding: '14px 24px', 
            boxShadow: '0 10px 30px rgba(0, 0, 0, 0.04)', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'space-between', 
            flexWrap: 'wrap', 
            gap: '16px' 
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#10b981', boxShadow: '0 0 12px #10b981' }} />
            <span style={{ fontSize: '13px', fontWeight: 800, color: '#0f172a' }}>
              Next-Gen Enterprise Engine Active
            </span>
            <span style={{ fontSize: '12px', color: '#64748b', fontWeight: 600, borderLeft: '1px solid #cbd5e1', paddingLeft: '12px' }}>
              v5.8 Quantum Sync • 99.99% Uptime
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <button 
              type="button" 
              className="btn btn-primary"
              style={{ 
                padding: '10px 22px', 
                fontSize: '13px', 
                borderRadius: '12px', 
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px', 
                background: 'linear-gradient(135deg, #0284c7, #2563eb)', 
                color: '#ffffff',
                border: 'none', 
                fontWeight: 700,
                cursor: 'pointer',
                boxShadow: '0 4px 15px rgba(2, 132, 199, 0.3)'
              }}
              onClick={onOpenOnboarding}
            >
              <Zap size={15} />
              <span>Start Cloud Setup</span>
            </button>
          </div>
        </div>
      </div>

      {/* 6. TELEMETRY & CTAS BAR */}
      <div style={{ maxWidth: '1280px', margin: '20px auto 0', padding: '0 24px', position: 'relative', zIndex: 10 }}>
        <div 
          style={{
            width: '100%',
            background: 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(20px)',
            borderRadius: '20px',
            border: '1px solid rgba(226, 232, 240, 0.9)',
            padding: '18px 28px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '20px',
            boxShadow: '0 12px 35px rgba(15, 23, 42, 0.05)'
          }}
        >
          {/* Live Synchronized Telemetry Cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '20px', flex: 1 }}>
            
            <div 
              style={{ cursor: 'pointer', padding: '6px 12px', borderRadius: '10px', transition: 'all 0.15s ease' }} 
              onClick={onExploreHrms}
              onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(37, 99, 235, 0.05)'}
              onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '2px' }}>
                <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#2563eb', display: 'inline-block' }} />
                <span style={{ fontSize: '11px', color: '#64748b', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Staff & KYC</span>
              </div>
              <strong style={{ fontSize: '14px', color: '#0f172a', fontWeight: 800 }}>100% Digital Onboarding</strong>
            </div>

            <div 
              style={{ cursor: 'pointer', padding: '6px 12px', borderRadius: '10px', transition: 'all 0.15s ease' }} 
              onClick={onExploreHrms}
              onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(124, 58, 237, 0.05)'}
              onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '2px' }}>
                <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#7c3aed', display: 'inline-block' }} />
                <span style={{ fontSize: '11px', color: '#64748b', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Biometric Radar</span>
              </div>
              <strong style={{ fontSize: '14px', color: '#7c3aed', fontWeight: 800 }}>{activeTelemetry.biometricPunches.toLocaleString()} Live Punches</strong>
            </div>

            <div 
              style={{ cursor: 'pointer', padding: '6px 12px', borderRadius: '10px', transition: 'all 0.15s ease' }} 
              onClick={onExploreHrms}
              onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(16, 185, 129, 0.05)'}
              onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '2px' }}>
                <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#10b981', display: 'inline-block' }} />
                <span style={{ fontSize: '11px', color: '#64748b', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Automated Payroll</span>
              </div>
              <strong style={{ fontSize: '14px', color: '#059669', fontWeight: 800 }}>₹ Live PF/ESI Calculation</strong>
            </div>

            <div 
              style={{ cursor: 'pointer', padding: '6px 12px', borderRadius: '10px', transition: 'all 0.15s ease' }} 
              onClick={onExploreCrm}
              onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(217, 119, 6, 0.05)'}
              onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '2px' }}>
                <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#d97706', display: 'inline-block' }} />
                <span style={{ fontSize: '11px', color: '#64748b', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Sales CRM</span>
              </div>
              <strong style={{ fontSize: '13px', color: '#d97706', fontWeight: 800 }}>Coming Soon ⏳</strong>
            </div>

          </div>

          {/* Quick Action CTAs */}
          <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
            <button 
              type="button" 
              className="btn btn-primary"
              style={{ 
                padding: '10px 22px', 
                fontSize: '13px', 
                borderRadius: '12px', 
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px', 
                background: 'linear-gradient(135deg, #0284c7, #2563eb)', 
                color: '#ffffff',
                border: 'none', 
                fontWeight: 700,
                cursor: 'pointer',
                boxShadow: '0 4px 15px rgba(2, 132, 199, 0.3)'
              }}
              onClick={onOpenOnboarding}
            >
              <Zap size={15} />
              <span>Start Cloud Setup</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
