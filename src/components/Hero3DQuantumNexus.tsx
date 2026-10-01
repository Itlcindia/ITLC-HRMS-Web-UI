import React, { useEffect, useRef } from 'react';
import { InteractiveIsometricEcosystem } from './InteractiveIsometricEcosystem';

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

    </div>
  );
};
