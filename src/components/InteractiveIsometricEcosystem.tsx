import React, { useState } from 'react';
import { 
  Users, 
  Clock, 
  DollarSign, 
  BarChart3, 
  Laptop, 
  ShieldCheck, 
  ChevronRight, 
  Sparkles, 
  Zap
} from 'lucide-react';

interface InteractiveIsometricEcosystemProps {
  onExploreCrm?: () => void;
  onExploreHrms?: () => void;
  onOpenSuperAdmin?: () => void;
  onOpenOnboarding?: () => void;
}

export const InteractiveIsometricEcosystem: React.FC<InteractiveIsometricEcosystemProps> = ({
  onExploreCrm,
  onExploreHrms,
  onOpenSuperAdmin,
  onOpenOnboarding
}) => {
  const [activeNode, setActiveNode] = useState<string | null>(null);

  const nodes = [
    {
      id: 'employees',
      title: 'Employee Management',
      subtitle: 'Onboard • Manage • Grow',
      metric: '1-click onboarding',
      status: 'Live',
      position: 'top-left',
      color: '#0284c7',
      glowColor: 'rgba(2, 132, 199, 0.45)',
      gradient: 'linear-gradient(135deg, #0284c7, #38bdf8)',
      icon: Users,
      boxX: 30,
      boxY: 35,
      boxWidth: 260,
      boxHeight: 74,
      // Starts from Center (550,255) -> traces the exact outer border of this box (30,35,260,74) -> returns to Center
      circuitPath: 'M 550 255 C 440 255, 360 130, 290 109 L 50 109 A 20 20 0 0 1 30 89 L 30 55 A 20 20 0 0 1 50 35 L 270 35 A 20 20 0 0 1 290 55 L 290 89 A 20 20 0 0 1 270 109 C 340 140, 430 260, 550 260',
      action: onExploreHrms
    },
    {
      id: 'attendance',
      title: 'Attendance & Leave',
      subtitle: 'Track • Approve • Stay Compliant',
      metric: 'Geo attendance',
      status: 'Auto sync',
      position: 'mid-left',
      color: '#8b5cf6',
      glowColor: 'rgba(139, 92, 246, 0.45)',
      gradient: 'linear-gradient(135deg, #7c3aed, #a855f7)',
      icon: Clock,
      boxX: 10,
      boxY: 223,
      boxWidth: 260,
      boxHeight: 74,
      // Starts from Center (550,260) -> traces exact outer border of mid-left box (10,223,260,74) -> returns to Center
      circuitPath: 'M 550 260 C 430 260, 350 297, 270 297 L 30 297 A 20 20 0 0 1 10 277 L 10 243 A 20 20 0 0 1 30 223 L 250 223 A 20 20 0 0 1 270 243 L 270 277 A 20 20 0 0 1 250 297 C 340 305, 440 265, 550 265',
      action: onExploreHrms
    },
    {
      id: 'payroll',
      title: 'Payroll & Tax',
      subtitle: 'Accurate • Secure • Automated',
      metric: 'PF/ESI ready',
      status: 'Secure',
      position: 'bottom-left',
      color: '#10b981',
      glowColor: 'rgba(16, 185, 129, 0.45)',
      gradient: 'linear-gradient(135deg, #059669, #34d399)',
      icon: DollarSign,
      boxX: 30,
      boxY: 411,
      boxWidth: 260,
      boxHeight: 74,
      // Starts from Center (550,265) -> traces exact outer border of bottom-left box (30,411,260,74) -> returns to Center
      circuitPath: 'M 550 265 C 440 265, 360 390, 290 411 L 290 465 A 20 20 0 0 1 270 485 L 50 485 A 20 20 0 0 1 30 465 L 30 431 A 20 20 0 0 1 50 411 L 270 411 C 340 380, 430 270, 550 270',
      action: onExploreHrms
    },
    {
      id: 'performance',
      title: 'Performance Management',
      subtitle: 'Set Goals • Track • Appraisals',
      metric: 'KPI radar',
      status: 'Smart',
      position: 'top-right',
      color: '#3b82f6',
      glowColor: 'rgba(59, 130, 246, 0.45)',
      gradient: 'linear-gradient(135deg, #2563eb, #60a5fa)',
      icon: BarChart3,
      boxX: 810,
      boxY: 35,
      boxWidth: 260,
      boxHeight: 74,
      // Starts from Center (550,255) -> traces exact outer border of top-right box (810,35,260,74) -> returns to Center
      circuitPath: 'M 550 255 C 660 255, 740 130, 810 109 L 1050 109 A 20 20 0 0 0 1070 89 L 1070 55 A 20 20 0 0 0 1050 35 L 830 35 A 20 20 0 0 0 810 55 L 810 89 A 20 20 0 0 0 830 109 C 760 140, 670 260, 550 260',
      action: onExploreCrm
    },
    {
      id: 'reports',
      title: 'Reports & Analytics',
      subtitle: 'Deposit • Audit • Insights',
      metric: 'Live dashboards',
      status: 'Realtime',
      position: 'mid-right',
      color: '#06b6d4',
      glowColor: 'rgba(6, 182, 212, 0.45)',
      gradient: 'linear-gradient(135deg, #0891b2, #38bdf8)',
      icon: Laptop,
      boxX: 830,
      boxY: 223,
      boxWidth: 260,
      boxHeight: 74,
      // Starts from Center (550,260) -> traces exact outer border of mid-right box (830,223,260,74) -> returns to Center
      circuitPath: 'M 550 260 C 670 260, 750 297, 830 297 L 1070 297 A 20 20 0 0 0 1090 277 L 1090 243 A 20 20 0 0 0 1070 223 L 850 223 A 20 20 0 0 0 830 243 L 830 277 A 20 20 0 0 0 850 297 C 760 305, 660 265, 550 265',
      action: onExploreCrm
    },
    {
      id: 'security',
      title: 'Settings & Security',
      subtitle: 'Rules • Policies • Compliance',
      metric: 'SOC-2 aligned',
      status: 'Protected',
      position: 'bottom-right',
      color: '#f59e0b',
      glowColor: 'rgba(245, 158, 11, 0.45)',
      gradient: 'linear-gradient(135deg, #d97706, #fbbf24)',
      icon: ShieldCheck,
      boxX: 810,
      boxY: 411,
      boxWidth: 260,
      boxHeight: 74,
      // Starts from Center (550,265) -> traces exact outer border of bottom-right box (810,411,260,74) -> returns to Center
      circuitPath: 'M 550 265 C 660 265, 740 390, 810 411 L 810 465 A 20 20 0 0 0 830 485 L 1050 485 A 20 20 0 0 0 1070 465 L 1070 431 A 20 20 0 0 0 1050 411 L 830 411 C 760 380, 670 270, 550 270',
      action: onExploreHrms || onOpenSuperAdmin
    }
  ];

  return (
    <div 
      style={{
        width: '100%',
        maxWidth: '1360px',
        margin: '0 auto',
        position: 'relative',
        padding: '10px 10px 25px',
        userSelect: 'none',
        overflow: 'visible'
      }}
    >
      <style>{`
        @keyframes pulseConcentricRings {
          0% { transform: translate(-50%, -46%) scaleY(0.48) rotate(0deg); }
          100% { transform: translate(-50%, -46%) scaleY(0.48) rotate(360deg); }
        }

        /* Smooth slow animated fiber dash */
        @keyframes laserEnergyFlow {
          0% { stroke-dashoffset: 800; }
          100% { stroke-dashoffset: 0; }
        }

        /* Gentle Floating Upward Animation for Central HRMS Monolith */
        @keyframes hrmsEmergeAndHover {
          0%, 100% {
            transform: translate(-50%, -46%) translateY(4px);
            filter: drop-shadow(0 20px 40px rgba(2, 132, 199, 0.45));
          }
          50% {
            transform: translate(-50%, -52%) translateY(-8px);
            filter: drop-shadow(0 28px 55px rgba(2, 132, 199, 0.6)) drop-shadow(0 0 20px rgba(56, 189, 248, 0.7));
          }
        }

        @keyframes beamGlowPulse {
          0%, 100% { opacity: 0.4; transform: scaleY(0.95); }
          50% { opacity: 0.85; transform: scaleY(1.08); }
        }

        @keyframes portalAuraGlow {
          0%, 100% { opacity: 0.7; transform: translate(-50%, -50%) scale(0.95); }
          50% { opacity: 1; transform: translate(-50%, -50%) scale(1.08); }
        }

        @keyframes sparkleTwinkle {
          0%, 100% { opacity: 0.3; transform: scale(0.8) translateY(0); }
          50% { opacity: 1; transform: scale(1.2) translateY(-6px); }
        }

        @keyframes meshDrift {
          0% { transform: translate3d(-10px, -8px, 0); }
          50% { transform: translate3d(10px, 8px, 0); }
          100% { transform: translate3d(-10px, -8px, 0); }
        }

        @keyframes cardScan {
          0% { transform: translateX(-120%); opacity: 0; }
          35% { opacity: 0.68; }
          100% { transform: translateX(180%); opacity: 0; }
        }

        @keyframes haloBreathe {
          0%, 100% { opacity: 0.44; transform: translate(-50%, -46%) scaleY(0.48) scale(0.97); }
          50% { opacity: 0.9; transform: translate(-50%, -46%) scaleY(0.48) scale(1.05); }
        }

        .iso-module-card {
          position: relative;
          overflow: hidden;
          transition: border-color 0.2s ease, box-shadow 0.2s ease, transform 0.2s ease;
          box-shadow: 0 18px 38px -10px rgba(15, 23, 42, 0.14), 0 5px 16px rgba(2, 132, 199, 0.06);
        }

        .iso-module-card:hover {
          transform: translateY(-3px);
          box-shadow: 0 26px 50px -10px rgba(15, 23, 42, 0.22), 0 0 24px rgba(2, 132, 199, 0.28) !important;
        }

        .iso-module-card::before {
          content: "";
          position: absolute;
          inset: 0;
          width: 45%;
          background: linear-gradient(105deg, transparent 0%, rgba(255,255,255,0.8) 45%, transparent 70%);
          animation: cardScan 5.8s ease-in-out infinite;
          pointer-events: none;
        }

        .iso-module-card::after {
          content: "";
          position: absolute;
          left: 14px;
          right: 14px;
          bottom: 7px;
          height: 3px;
          border-radius: 999px;
          background: var(--node-gradient);
          opacity: 0.62;
        }

        .hrms-monolith-card {
          transition: filter 0.3s ease;
        }
      `}</style>

      {/* Main Completely Stable Perspective Canvas (Zero Mouse Shaking / Zero Jitter) */}
      <div 
        style={{
          position: 'relative',
          width: '100%',
          minHeight: '600px',
          height: '600px'
        }}
      >
        {/* Subtle enterprise mesh background for depth */}
        <div
          style={{
            position: 'absolute',
            inset: '-20px -40px',
            backgroundImage: 'linear-gradient(rgba(2,132,199,0.08) 1px, transparent 1px), linear-gradient(90deg, rgba(2,132,199,0.08) 1px, transparent 1px)',
            backgroundSize: '64px 64px',
            maskImage: 'radial-gradient(circle at center, black 0%, black 38%, transparent 78%)',
            WebkitMaskImage: 'radial-gradient(circle at center, black 0%, black 38%, transparent 78%)',
            opacity: 0.55,
            animation: 'meshDrift 14s ease-in-out infinite',
            pointerEvents: 'none',
            zIndex: 0
          }}
        />

        <div
          style={{
            position: 'absolute',
            top: '28px',
            left: '50%',
            transform: 'translateX(-50%)',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            padding: '8px 16px',
            borderRadius: '999px',
            background: 'rgba(255,255,255,0.78)',
            border: '1px solid rgba(14,165,233,0.22)',
            boxShadow: '0 12px 30px rgba(14, 165, 233, 0.08)',
            backdropFilter: 'blur(16px)',
            zIndex: 9
          }}
        >
          <span style={{ width: 8, height: 8, borderRadius: 999, background: '#10b981', boxShadow: '0 0 12px #10b981' }} />
          <span style={{ color: '#0f3c6d', fontSize: 12, fontWeight: 900, letterSpacing: '0.7px', textTransform: 'uppercase' }}>
            Live HRMS Intelligence Mesh
          </span>
        </div>

        
        {/* ============================================================ */}
        {/* LAYER 1: 3D ISOMETRIC CYBER PEDESTAL BASE & EMITTING RINGS */}
        {/* ============================================================ */}
        <div 
          style={{
            position: 'absolute',
            top: '52%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: '760px',
            height: '430px',
            borderRadius: '50%',
            background: 'radial-gradient(ellipse at center, rgba(14, 165, 233, 0.25) 0%, rgba(99, 102, 241, 0.14) 36%, rgba(16, 185, 129, 0.08) 58%, rgba(241, 245, 249, 0) 75%)',
            filter: 'blur(38px)',
            pointerEvents: 'none',
            zIndex: 1
          }}
        />

        {/* Multi-layered Neon Concentric Platform Rings */}
        <div 
          style={{
            position: 'absolute',
            top: '52%',
            left: '50%',
            width: '490px',
            height: '490px',
            borderRadius: '50%',
            border: '2px dashed rgba(2, 132, 199, 0.4)',
            boxShadow: '0 0 35px rgba(2, 132, 199, 0.25), inset 0 0 30px rgba(56, 189, 248, 0.2)',
            animation: 'pulseConcentricRings 26s linear infinite',
            pointerEvents: 'none',
            zIndex: 2
          }}
        />

        <div
          style={{
            position: 'absolute',
            top: '52%',
            left: '50%',
            width: '610px',
            height: '610px',
            borderRadius: '50%',
            border: '1px solid rgba(125, 211, 252, 0.28)',
            boxShadow: 'inset 0 0 45px rgba(14, 165, 233, 0.08)',
            animation: 'haloBreathe 4.8s ease-in-out infinite',
            pointerEvents: 'none',
            zIndex: 2
          }}
        />

        {/* 3D Isometric Cyber Platform Disc */}
        <div 
          style={{
            position: 'absolute',
            top: '52%',
            left: '50%',
            transform: 'translate(-50%, -46%) scaleY(0.48)',
            width: '340px',
            height: '340px',
            borderRadius: '50%',
            border: '3px solid rgba(56, 189, 248, 0.7)',
            background: 'radial-gradient(circle, #0f172a 0%, #1e293b 50%, #0284c7 90%, #38bdf8 100%)',
            boxShadow: '0 0 50px rgba(2, 132, 199, 0.5), inset 0 0 40px rgba(56, 189, 248, 0.6)',
            pointerEvents: 'none',
            zIndex: 2
          }}
        />

        {/* Glowing Cyber Emerge Slot (The portal aperture from which HRMS rises) */}
        <div 
          style={{
            position: 'absolute',
            top: '52%',
            left: '50%',
            transform: 'translate(-50%, -46%) scaleY(0.48)',
            width: '210px',
            height: '210px',
            borderRadius: '50%',
            background: 'radial-gradient(circle, #020617 35%, #0369a1 85%, #38bdf8 100%)',
            border: '3.5px solid #38bdf8',
            boxShadow: '0 0 45px rgba(56, 189, 248, 0.9), inset 0 0 35px rgba(2, 132, 199, 0.9)',
            animation: 'portalAuraGlow 3s ease-in-out infinite',
            pointerEvents: 'none',
            zIndex: 3
          }}
        />

        {/* Upward Holographic Light Pillar */}
        <div 
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -100%)',
            width: '220px',
            height: '280px',
            background: 'linear-gradient(to top, rgba(56, 189, 248, 0.45) 0%, rgba(99, 102, 241, 0.2) 50%, rgba(255, 255, 255, 0) 100%)',
            clipPath: 'polygon(15% 0%, 85% 0%, 100% 100%, 0% 100%)',
            animation: 'beamGlowPulse 4s ease-in-out infinite',
            pointerEvents: 'none',
            zIndex: 3
          }}
        />

        {/* Floating Twinkle Sparkles */}
        {[
          { top: '32%', left: '45%', delay: '0s', size: 16, color: '#38bdf8' },
          { top: '28%', left: '55%', delay: '1.2s', size: 20, color: '#818cf8' },
          { top: '44%', left: '42%', delay: '0.6s', size: 14, color: '#34d399' },
          { top: '40%', left: '58%', delay: '1.8s', size: 18, color: '#fbbf24' }
        ].map((sp, idx) => (
          <div 
            key={idx}
            style={{
              position: 'absolute',
              top: sp.top,
              left: sp.left,
              transform: 'translate(-50%, -50%)',
              animation: `sparkleTwinkle 2.8s ease-in-out infinite ${sp.delay}`,
              pointerEvents: 'none',
              zIndex: 6
            }}
          >
            <Sparkles size={sp.size} style={{ color: sp.color, filter: 'drop-shadow(0 0 8px rgba(255,255,255,0.95))' }} />
          </div>
        ))}

        {/* ============================================================ */}
        {/* LAYER 2: 100% PERFECTLY SYNCHRONIZED SVG WITH BOXES INSIDE */}
        {/* ============================================================ */}
        <svg 
          viewBox="0 0 1100 520" 
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            zIndex: 4,
            overflow: 'visible'
          }}
        >
          <defs>
            {/* Gradients for each conduit line */}
            <linearGradient id="grad-top-left" x1="100%" y1="100%" x2="0%" y2="0%">
              <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.95" />
              <stop offset="50%" stopColor="#0284c7" stopOpacity="0.9" />
              <stop offset="100%" stopColor="#38bdf8" stopOpacity="0.95" />
            </linearGradient>
            <linearGradient id="grad-mid-left" x1="100%" y1="50%" x2="0%" y2="50%">
              <stop offset="0%" stopColor="#c084fc" stopOpacity="0.95" />
              <stop offset="50%" stopColor="#7c3aed" stopOpacity="0.9" />
              <stop offset="100%" stopColor="#c084fc" stopOpacity="0.95" />
            </linearGradient>
            <linearGradient id="grad-bottom-left" x1="100%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#34d399" stopOpacity="0.95" />
              <stop offset="50%" stopColor="#059669" stopOpacity="0.9" />
              <stop offset="100%" stopColor="#34d399" stopOpacity="0.95" />
            </linearGradient>
            <linearGradient id="grad-top-right" x1="0%" y1="100%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#60a5fa" stopOpacity="0.95" />
              <stop offset="50%" stopColor="#2563eb" stopOpacity="0.9" />
              <stop offset="100%" stopColor="#60a5fa" stopOpacity="0.95" />
            </linearGradient>
            <linearGradient id="grad-mid-right" x1="0%" y1="50%" x2="100%" y2="50%">
              <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.95" />
              <stop offset="50%" stopColor="#0891b2" stopOpacity="0.9" />
              <stop offset="100%" stopColor="#38bdf8" stopOpacity="0.95" />
            </linearGradient>
            <linearGradient id="grad-bottom-right" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#fbbf24" stopOpacity="0.95" />
              <stop offset="50%" stopColor="#d97706" stopOpacity="0.9" />
              <stop offset="100%" stopColor="#fbbf24" stopOpacity="0.95" />
            </linearGradient>

            {/* Glowing filter for neon laser conduit */}
            <filter id="laser-glow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="4" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {/* Render 6 Fluent Curved Energy Conduits that Trace All 4 Sides Around Each Box */}
          {nodes.map((node) => {
            const isHovered = activeNode === node.id;
            const IconComponent = node.icon;
            return (
              <g key={node.id}>
                {/* 1. Outer Ambient Glow Tube */}
                <path 
                  d={node.circuitPath} 
                  fill="none" 
                  stroke={node.color} 
                  strokeWidth={isHovered ? '10' : '6'}
                  strokeOpacity={isHovered ? '0.55' : '0.25'}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  filter="url(#laser-glow)"
                  style={{ transition: 'all 0.3s ease', mixBlendMode: 'multiply' }}
                />

                {/* 2. Inner Sharp Neon Fiber Line with Smooth Slow Flow */}
                <path 
                  d={node.circuitPath} 
                  fill="none" 
                  stroke={`url(#grad-${node.position})`}
                  strokeWidth={isHovered ? '3.5' : '2.4'}
                  strokeDasharray={isHovered ? '18 8' : '12 10'}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  style={{
                    animation: isHovered ? 'laserEnergyFlow 4s linear infinite' : 'laserEnergyFlow 8s linear infinite',
                    transition: 'all 0.3s ease'
                  }}
                />

                {/* 2b. Fine white data pulse riding inside each conduit */}
                <path 
                  d={node.circuitPath} 
                  fill="none" 
                  stroke="#ffffff"
                  strokeOpacity="0.58"
                  strokeWidth="1"
                  strokeDasharray="2 14"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />

                {/* 3. Primary Slower, Smoother Traveling Energy Orb */}
                <circle r={isHovered ? '6.5' : '5.5'} fill="#ffffff" filter="url(#laser-glow)">
                  <animateMotion 
                    path={node.circuitPath} 
                    dur={isHovered ? '4s' : '6.5s'} 
                    repeatCount="indefinite" 
                  />
                </circle>

                {/* 4. Secondary Color Particle Following Behind */}
                <circle r="4" fill={node.color}>
                  <animateMotion 
                    path={node.circuitPath} 
                    dur={isHovered ? '4s' : '6.5s'} 
                    begin="1.5s"
                    repeatCount="indefinite" 
                  />
                </circle>

                {/* 5. Third Glowing Tail Particle */}
                <circle r="3" fill="#ffffff">
                  <animateMotion 
                    path={node.circuitPath} 
                    dur={isHovered ? '4s' : '6.5s'} 
                    begin="3.0s"
                    repeatCount="indefinite" 
                  />
                </circle>

                {/* 6. THE CARD ITSELF PLACED 100% PERFECTLY INSIDE THE GLOWING CIRCUIT LOOP */}
                <foreignObject 
                  x={node.boxX} 
                  y={node.boxY} 
                  width={node.boxWidth} 
                  height={node.boxHeight}
                  style={{ overflow: 'visible' }}
                >
                  <div 
                    className="iso-module-card"
                    style={{
                      width: `${node.boxWidth}px`,
                      height: `${node.boxHeight}px`,
                      background: 'rgba(255, 255, 255, 0.97)',
                      backdropFilter: 'blur(16px)',
                      borderRadius: '20px',
                      border: isHovered ? `2px solid ${node.color}` : '1.5px solid rgba(226, 232, 240, 0.95)',
                      padding: '10px 14px 13px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                      cursor: 'pointer',
                      boxSizing: 'border-box',
                      ['--node-gradient' as any]: node.gradient
                    }}
                    onClick={node.action}
                    onMouseEnter={() => setActiveNode(node.id)}
                    onMouseLeave={() => setActiveNode(null)}
                  >
                    {/* Icon Pod */}
                    <div 
                      style={{
                        width: '44px',
                        height: '44px',
                        borderRadius: '13px',
                        background: node.gradient,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#ffffff',
                        boxShadow: `0 6px 14px ${node.glowColor}`,
                        flexShrink: 0
                      }}
                    >
                      <IconComponent size={21} />
                    </div>

                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: '13px', fontWeight: 800, color: '#0f172a', whiteSpace: 'nowrap', lineHeight: 1.2 }}>
                        {node.title}
                      </div>
                      <div style={{ fontSize: '10.5px', color: '#64748b', fontWeight: 600, marginTop: '2px', whiteSpace: 'nowrap' }}>
                        {node.subtitle}
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '5px' }}>
                        <span style={{ width: 6, height: 6, borderRadius: 999, background: node.color, boxShadow: `0 0 8px ${node.color}` }} />
                        <span style={{ fontSize: '9.5px', color: node.color, fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.3px' }}>
                          {node.metric}
                        </span>
                      </div>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '7px', flexShrink: 0 }}>
                      <span style={{ fontSize: 8.5, fontWeight: 900, color: '#64748b', background: '#f1f5f9', borderRadius: 999, padding: '3px 6px', whiteSpace: 'nowrap' }}>
                        {node.status}
                      </span>
                      <ChevronRight size={17} style={{ color: node.color }} />
                    </div>
                  </div>
                </foreignObject>
              </g>
            );
          })}
        </svg>

        {/* ============================================================ */}
        {/* LAYER 3: CENTRAL 3D HOLOGRAPHIC HRMS MONOLITH (RISING FROM INSIDE) */}
        {/* ============================================================ */}
        <div 
          className="hrms-monolith-card"
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            animation: 'hrmsEmergeAndHover 6s ease-in-out infinite',
            zIndex: 10,
            cursor: 'pointer'
          }}
          onClick={onExploreHrms}
          onMouseEnter={() => setActiveNode('center')}
          onMouseLeave={() => setActiveNode(null)}
        >
          {/* Glass Monolith Tablet Container */}
          <div 
            style={{
              position: 'relative',
              width: '190px',
              padding: '24px 18px 18px',
              borderRadius: '26px',
              background: 'linear-gradient(155deg, rgba(15, 23, 42, 0.94) 0%, rgba(30, 58, 138, 0.92) 50%, rgba(2, 132, 199, 0.9) 100%)',
              backdropFilter: 'blur(24px)',
              WebkitBackdropFilter: 'blur(24px)',
              border: '2.5px solid rgba(56, 189, 248, 0.85)',
              boxShadow: '0 25px 60px -10px rgba(2, 132, 199, 0.55), 0 0 35px rgba(56, 189, 248, 0.4), inset 0 2px 4px rgba(255, 255, 255, 0.4), inset 0 -2px 10px rgba(0,0,0,0.5)',
              textAlign: 'center'
            }}
          >
            <div
              style={{
                position: 'absolute',
                top: 10,
                right: 12,
                display: 'inline-flex',
                alignItems: 'center',
                gap: 4,
                padding: '3px 7px',
                borderRadius: 999,
                background: 'rgba(16,185,129,0.16)',
                border: '1px solid rgba(16,185,129,0.35)',
                color: '#bbf7d0',
                fontSize: 8,
                fontWeight: 900,
                letterSpacing: 0.4
              }}
            >
              <span style={{ width: 5, height: 5, borderRadius: 999, background: '#22c55e', boxShadow: '0 0 8px #22c55e' }} />
              LIVE
            </div>

            {/* Top Glossy Reflection Sheen */}
            <div 
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                height: '45%',
                borderRadius: '24px 24px 100px 100px',
                background: 'linear-gradient(to bottom, rgba(255, 255, 255, 0.28) 0%, rgba(255, 255, 255, 0) 100%)',
                pointerEvents: 'none'
              }}
            />

            {/* Glowing 3D App Icon with ITLC Logo */}
            <div 
              style={{
                width: '64px',
                height: '64px',
                margin: '0 auto 10px',
                borderRadius: '18px',
                background: 'linear-gradient(135deg, #0284c7 0%, #2563eb 50%, #4f46e5 100%)',
                padding: '2.5px',
                boxShadow: '0 12px 28px -4px rgba(2, 132, 199, 0.6), 0 0 20px rgba(56, 189, 248, 0.5)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                position: 'relative'
              }}
            >
              <div 
                style={{
                  width: '100%',
                  height: '100%',
                  borderRadius: '15px',
                  background: '#ffffff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: '4px'
                }}
              >
                <img 
                  src="/itlc_logo.png" 
                  alt="ITLC Logo" 
                  style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                />
              </div>

              {/* Status Live Indicator Dot */}
              <span 
                style={{
                  position: 'absolute',
                  top: '-3px',
                  right: '-3px',
                  width: '13px',
                  height: '13px',
                  borderRadius: '50%',
                  background: '#10b981',
                  border: '2.5px solid #ffffff',
                  boxShadow: '0 0 12px #10b981'
                }}
              />
            </div>

            {/* Title: ITLC INDIA in Large, Ultra-Crisp Glowing Typography */}
            <div 
              style={{ 
                fontSize: '22px', 
                fontWeight: 900, 
                letterSpacing: '1px', 
                color: '#ffffff', 
                lineHeight: 1.1,
                whiteSpace: 'nowrap',
                textShadow: '0 0 20px rgba(56, 189, 248, 0.95), 0 2px 4px rgba(0,0,0,0.6)'
              }}
            >
              ITLC INDIA
            </div>

            {/* Subtitle: Unified Enterprise OS */}
            <div 
              style={{ 
                fontSize: '10.5px', 
                color: '#bae6fd', 
                fontWeight: 700, 
                letterSpacing: '0.6px', 
                marginTop: '4px', 
                textTransform: 'uppercase',
                whiteSpace: 'nowrap',
                textShadow: '0 0 10px rgba(56, 189, 248, 0.5)'
              }}
            >
              Unified Enterprise OS
            </div>

            {/* Pulse Indicator Pill */}
            <div 
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '5px',
                marginTop: '10px',
                padding: '4px 10px',
                borderRadius: '999px',
                background: 'rgba(56, 189, 248, 0.2)',
                border: '1px solid rgba(56, 189, 248, 0.5)',
                fontSize: '10px',
                fontWeight: 800,
                color: '#e0f2fe',
                boxShadow: '0 0 12px rgba(56, 189, 248, 0.3)'
              }}
            >
              <Zap size={11} style={{ color: '#38bdf8' }} />
              <span>Unified Cloud 3.0</span>
            </div>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: 7,
                marginTop: 13
              }}
            >
              <span style={{ padding: '6px 4px', borderRadius: 10, background: 'rgba(255,255,255,0.12)', color: '#e0f2fe', fontSize: 8.5, fontWeight: 900, border: '1px solid rgba(255,255,255,0.14)' }}>
                6 Modules
              </span>
              <span style={{ padding: '6px 4px', borderRadius: 10, background: 'rgba(255,255,255,0.12)', color: '#e0f2fe', fontSize: 8.5, fontWeight: 900, border: '1px solid rgba(255,255,255,0.14)' }}>
                99.9 SLA
              </span>
            </div>
          </div>
        </div>

      </div>

      {/* ============================================================ */}
      {/* LAYER 5: BOTTOM ELEGANT TYPOGRAPHY BANNER */}
      {/* ============================================================ */}
      <div 
        style={{
          textAlign: 'center',
          marginTop: '-10px',
          position: 'relative',
          zIndex: 8
        }}
      >
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 12,
            padding: '12px 22px',
            borderRadius: 999,
            background: 'rgba(255,255,255,0.86)',
            border: '1px solid rgba(226,232,240,0.92)',
            boxShadow: '0 14px 34px rgba(15,23,42,0.07)',
            backdropFilter: 'blur(18px)'
          }}
        >
          <Sparkles size={18} style={{ color: '#0284c7' }} />
          <span 
            style={{
              fontFamily: 'Georgia, serif, cursive',
              fontStyle: 'italic',
              fontSize: '25px',
              fontWeight: 700,
              color: '#334155',
              letterSpacing: '0.2px',
              textShadow: '0 2px 10px rgba(15, 23, 42, 0.06)'
            }}
          >
            Build a Better Workplace
          </span>
          <Zap size={17} style={{ color: '#10b981' }} />
        </div>
      </div>
    </div>
  );
};
