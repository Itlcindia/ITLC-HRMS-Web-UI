import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Sparkles, 
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
  Clock, 
  ShieldCheck, 
  Search, 
  Plus, 
  Eye, 
  Download, 
  FileText, 
  Calendar, 
  QrCode, 
  CheckCircle, 
  Layers, 
  Bot, 
  Globe, 
  Award, 
  ChevronRight, 
  ChevronLeft, 
  ExternalLink, 
  Laptop, 
  Play, 
  Pause, 
  Maximize2, 
  Image as ImageIcon, 
  X 
} from 'lucide-react';

export interface ItlcProductShowcaseProps {
  onLaunchCrm?: () => void;
  onLaunchHrms?: () => void;
  onOpenSuperAdmin?: () => void;
  onOpenOnboarding?: () => void;
  lang?: 'en' | 'hi';
}

interface ShowcaseScreen {
  id: string;
  tabLabel: string;
  suite: 'crm' | 'hrms' | 'superadmin' | 'auth';
  badge: string;
  title: string;
  description: string;
  images: string[];
  pathUrl: string;
  color: string;
  gradient: string;
  glowColor: string;
  actionText: string;
  onLaunch: () => void;
  metricBadge: string;
  keyFeatures: string[];
}

const DEFAULT_SCREENS_IMAGES: Record<string, string[]> = {
  hrms_dashboard: [
    '/dashboards/hrms_employee.png',
    '/mockup1.jpg',
    '/dashboards/team_collaboration.png',
    '/mockup2.jpg',
    '/dashboards/project_management.png',
    '/dashboards/ai_insights.png'
  ],
  crm_kanban: [
    '/dashboards/crm_analytics.png',
    '/dashboards/sales_revenue.png',
    '/mockup3.jpg',
    '/dashboards/project_management.png',
    '/dashboards/ai_insights.png'
  ],
  payroll_engine: [
    '/dashboards/sales_revenue.png',
    '/dashboards/ai_insights.png',
    '/mockup1.jpg',
    '/dashboards/hrms_employee.png',
    '/dashboards/crm_analytics.png'
  ],
  gst_invoicing: [
    '/dashboards/ai_insights.png',
    '/dashboards/sales_revenue.png',
    '/dashboards/crm_analytics.png',
    '/mockup3.jpg',
    '/dashboards/team_collaboration.png'
  ],
  employee_directory: [
    '/dashboards/project_management.png',
    '/dashboards/team_collaboration.png',
    '/mockup2.jpg',
    '/dashboards/hrms_employee.png',
    '/mockup1.jpg'
  ]
};

export const ItlcProductShowcase: React.FC<ItlcProductShowcaseProps> = ({
  onLaunchCrm = () => { window.history.pushState({}, '', '/login'); },
  onLaunchHrms = () => { window.history.pushState({}, '', '/login'); },
  onOpenSuperAdmin = () => { window.history.pushState({}, '', '/login'); },
  onOpenOnboarding = () => { window.history.pushState({}, '', '/register'); }
}) => {
  const [activeTabId, setActiveTabId] = useState<string>('hrms_dashboard');
  const [customImages, setCustomImages] = useState<Record<string, string[]>>(() => {
    try {
      const saved = localStorage.getItem('itlc_showcase_custom_images');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.warn('Failed to parse custom images from localStorage:', e);
    }
    return DEFAULT_SCREENS_IMAGES;
  });

  const [currentImageIndex, setCurrentImageIndex] = useState<number>(0);
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [previewZoomImage, setPreviewZoomImage] = useState<string | null>(null);

  // Sync when Superowner updates images
  useEffect(() => {
    const handleUpdate = () => {
      try {
        const saved = localStorage.getItem('itlc_showcase_custom_images');
        if (saved) {
          setCustomImages(JSON.parse(saved));
        }
      } catch (e) {}
    };
    window.addEventListener('showcase_images_updated', handleUpdate);
    window.addEventListener('storage', handleUpdate);
    return () => {
      window.removeEventListener('showcase_images_updated', handleUpdate);
      window.removeEventListener('storage', handleUpdate);
    };
  }, []);

  const screens: ShowcaseScreen[] = [
    {
      id: 'hrms_dashboard',
      tabLabel: '👥 HRMS Dashboard',
      suite: 'hrms',
      badge: 'LIVE WORKFORCE METRICS',
      title: 'OmniStaff HRMS Executive Command Center',
      description: 'Real-time overview of total staff headcount, live 24-cell biometric shift compliance, overtime allowance, and leave calendar.',
      images: customImages.hrms_dashboard || DEFAULT_SCREENS_IMAGES.hrms_dashboard,
      pathUrl: 'https://cloud.itlc.in/hrms/dashboard',
      color: '#7c3aed',
      gradient: 'linear-gradient(135deg, #7c3aed 0%, #a855f7 50%, #ec4899 100%)',
      glowColor: 'rgba(124, 58, 237, 0.45)',
      actionText: 'Launch HRMS Dashboard',
      onLaunch: onLaunchHrms,
      metricBadge: '12,480 Live Biometric Punches',
      keyFeatures: [
        'Live 24-cell biometric punch radar with GPS geofence',
        'Automated late-in & overtime shift compliance formulas',
        'Department-wise workforce attendance & leave breakdown',
        '1-Click automated salary slips & PF/ESI deductions'
      ]
    },
    {
      id: 'crm_kanban',
      tabLabel: '📊 Sales CRM (Coming Soon)',
      suite: 'crm',
      badge: 'COMING SOON',
      title: 'Visual Deals Kanban Pipeline & GPS Field Sales',
      description: 'Drag-and-drop sales deals across Proposal, Negotiation and Won stages with AI win probability and on-ground GPS meeting check-ins.',
      images: customImages.crm_kanban || DEFAULT_SCREENS_IMAGES.crm_kanban,
      pathUrl: 'https://cloud.itlc.in/crm/pipeline',
      color: '#0284c7',
      gradient: 'linear-gradient(135deg, #0284c7 0%, #00d2ff 50%, #2563eb 100%)',
      glowColor: 'rgba(2, 132, 199, 0.45)',
      actionText: 'Sales CRM (Coming Soon)',
      onLaunch: onLaunchCrm,
      metricBadge: 'Launching Soon',
      keyFeatures: [
        'Visual drag-and-drop Kanban revenue pipeline stages',
        'GPS geolocated client meeting check-in verification',
        'Automated WhatsApp lead alert broadcasts',
        'AI Sales Copilot with win-probability forecasting'
      ]
    },
    {
      id: 'payroll_engine',
      tabLabel: '💸 Payroll & Tax',
      suite: 'hrms',
      badge: 'INDIAN TAX COMPLIANCE',
      title: '1-Click Automated Salary Payroll & Tax Slips',
      description: 'Instant PF, ESI, TDS and Professional Tax calculations with branded PDF payslip downloads and direct bank transfer payout files.',
      images: customImages.payroll_engine || DEFAULT_SCREENS_IMAGES.payroll_engine,
      pathUrl: 'https://cloud.itlc.in/hrms/payroll',
      color: '#059669',
      gradient: 'linear-gradient(135deg, #059669 0%, #10b981 50%, #34d399 100%)',
      glowColor: 'rgba(16, 185, 129, 0.45)',
      actionText: 'Open Payroll Engine',
      onLaunch: onLaunchHrms,
      metricBadge: '100% Tax Compliant (PF/ESI)',
      keyFeatures: [
        'Statutory PF, ESI, PT & TDS automated formulas',
        'Direct bank NEFT/RTGS batch disbursal file export',
        'Custom allowances & performance bonus breakdowns',
        'Branded digital salary slips with QR verification'
      ]
    },
    {
      id: 'gst_invoicing',
      tabLabel: '🧾 GST Invoicing (Coming Soon)',
      suite: 'crm',
      badge: 'COMING SOON',
      title: 'Smart GST Tax Invoices & QR Payment Collect',
      description: 'Create GST-compliant invoices with automatic CGST, SGST, IGST tax split, embedded dynamic UPI payment QR, and one-click PDF billing.',
      images: customImages.gst_invoicing || DEFAULT_SCREENS_IMAGES.gst_invoicing,
      pathUrl: 'https://cloud.itlc.in/crm/invoices',
      color: '#0ea5e9',
      gradient: 'linear-gradient(135deg, #0ea5e9 0%, #38bdf8 50%, #6366f1 100%)',
      glowColor: 'rgba(14, 165, 233, 0.45)',
      actionText: 'GST Invoicing (Coming Soon)',
      onLaunch: onLaunchCrm,
      metricBadge: 'Launching Soon',
      keyFeatures: [
        '100% Indian GST rule compliance with HSN/SAC codes',
        'Instant UPI QR code generated directly on PDF invoice',
        'Real-time payment status reconciliation & alerts',
        'Automated monthly sales tax ledger exports'
      ]
    },
    {
      id: 'employee_directory',
      tabLabel: '📇 Staff & Teams',
      suite: 'hrms',
      badge: '100% PAPERLESS KYC',
      title: 'Digital Employee KYC & Profile Management',
      description: 'Complete digital employee records, asset allocation history, Aadhaar/PAN compliance documents, and shift assignment tiers.',
      images: customImages.employee_directory || DEFAULT_SCREENS_IMAGES.employee_directory,
      pathUrl: 'https://cloud.itlc.in/hrms/employees',
      color: '#3b82f6',
      gradient: 'linear-gradient(135deg, #2563eb 0%, #4f46e5 50%, #7c3aed 100%)',
      glowColor: 'rgba(59, 130, 246, 0.45)',
      actionText: 'View Staff Directory',
      onLaunch: onLaunchHrms,
      metricBadge: '99.9% KYC Completion',
      keyFeatures: [
        'Complete digital documentation & verified KYC vault',
        'Multi-department hierarchy & reporting manager matrix',
        'Asset inventory tagging (Laptops, SIMs, Vehicles)',
        'Automated birthday & work anniversary broadcast alerts'
      ]
    }
  ];

  const currentScreen = screens.find((s) => s.id === activeTabId) || screens[0];
  const activeImages = currentScreen.images && currentScreen.images.length > 0 
    ? currentScreen.images 
    : ['/dashboards/hrms_employee.png'];

  useEffect(() => {
    setCurrentImageIndex(0);
  }, [activeTabId]);

  useEffect(() => {
    if (isPaused || activeImages.length <= 1) return;
    const intervalSpeed = (() => {
      try {
        const saved = localStorage.getItem('itlc_showcase_slider_interval');
        if (saved) return Number(saved);
      } catch (e) {}
      return 3500;
    })();

    const interval = setInterval(() => {
      setCurrentImageIndex((prev) => (prev + 1) % activeImages.length);
    }, intervalSpeed);
    return () => clearInterval(interval);
  }, [activeTabId, isPaused, activeImages.length]);

  const handleNextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % activeImages.length);
  };

  const handlePrevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + activeImages.length) % activeImages.length);
  };

  return (
    <section 
      id="product-showcase" 
      style={{ 
        maxWidth: '1320px', 
        margin: '30px auto 80px', 
        width: '100%', 
        padding: '0 24px', 
        position: 'relative', 
        zIndex: 10,
        boxSizing: 'border-box'
      }}
    >
      <style>{`
        @keyframes auroraShimmer {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        .gradient-headline-text {
          background: linear-gradient(135deg, #0f172a 0%, #2563eb 50%, #7c3aed 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }
        .animated-gradient-border-card {
          position: relative;
          border-radius: 28px;
          padding: 2px;
          background: linear-gradient(135deg, rgba(37, 99, 235, 0.4) 0%, rgba(124, 58, 237, 0.3) 50%, rgba(2, 132, 199, 0.4) 100%);
          box-shadow: 0 20px 60px -15px rgba(2, 132, 199, 0.2);
        }
        .card-inner-surface {
          background: linear-gradient(180deg, #ffffff 0%, #f8fafc 100%);
          border-radius: 26px;
          padding: 28px;
        }
        .gradient-action-btn {
          background-size: 200% 200%;
          animation: auroraShimmer 5s ease infinite;
          transition: all 0.25s ease;
        }
        .gradient-action-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 12px 30px rgba(15, 23, 42, 0.25);
        }
      `}</style>

      {/* Backdrop Ambient Glow */}
      <div 
        style={{
          position: 'absolute',
          top: '20%',
          left: '50%',
          transform: 'translateX(-50%)',
          width: '800px',
          height: '500px',
          background: 'radial-gradient(ellipse at center, rgba(56, 189, 248, 0.12) 0%, rgba(124, 58, 237, 0.1) 45%, transparent 75%)',
          filter: 'blur(70px)',
          pointerEvents: 'none',
          zIndex: 0
        }}
      />

      {/* Section Header */}
      <div style={{ textAlign: 'center', marginBottom: '36px', position: 'relative', zIndex: 2 }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: 'rgba(255, 255, 255, 0.95)', border: '1px solid rgba(226, 232, 240, 0.95)', color: '#0284c7', padding: '7px 22px', borderRadius: '30px', fontSize: '12px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: '14px', boxShadow: '0 4px 16px rgba(2, 132, 199, 0.08)' }}>
          <Sparkles size={14} color="#0284c7" />
          <span>Interactive Product Simulator</span>
        </div>

        <h2 className="gradient-headline-text" style={{ fontSize: 'clamp(30px, 4.2vw, 48px)', fontWeight: 900, margin: '0 0 12px', letterSpacing: '-1.2px', lineHeight: 1.15 }}>
          Explore Real Live Product Screens
        </h2>

        <p style={{ fontSize: 'clamp(14.5px, 1.7vw, 17px)', color: '#475569', maxWidth: '740px', margin: '0 auto', lineHeight: 1.6, fontWeight: 500 }}>
          High-definition auto-playing screen walkthroughs for HRMS, Sales CRM, Payroll Tax, GST Invoicing & Staff Management.
        </p>
      </div>

      {/* TOP TAB NAVIGATION BAR */}
      <div 
        style={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center', 
          gap: '10px', 
          flexWrap: 'wrap', 
          marginBottom: '28px',
          position: 'relative',
          zIndex: 2
        }}
      >
        {screens.map((screen) => {
          const isActive = screen.id === activeTabId;
          const imgCount = screen.images?.length || 1;

          return (
            <button
              key={screen.id}
              type="button"
              onClick={() => setActiveTabId(screen.id)}
              style={{
                background: isActive ? '#0f172a' : '#ffffff',
                color: isActive ? '#ffffff' : '#334155',
                border: isActive ? '1px solid #1e293b' : '1px solid #e2e8f0',
                padding: '10px 18px',
                borderRadius: '16px',
                fontSize: '13px',
                fontWeight: 800,
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                transition: 'all 0.2s ease',
                boxShadow: isActive ? '0 8px 25px rgba(15, 23, 42, 0.2)' : '0 2px 8px rgba(0,0,0,0.03)'
              }}
            >
              <span>{screen.tabLabel}</span>
              <span 
                style={{ 
                  fontSize: '10px', 
                  padding: '1px 6px', 
                  borderRadius: '10px', 
                  background: isActive ? 'rgba(56, 189, 248, 0.25)' : 'rgba(0,0,0,0.06)', 
                  color: isActive ? '#38bdf8' : '#64748b',
                  fontWeight: 900
                }}
              >
                {imgCount} Screens
              </span>
              {isActive && (
                <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#38bdf8', boxShadow: '0 0 8px #38bdf8' }} />
              )}
            </button>
          );
        })}
      </div>

      {/* MAIN SCREEN SHOWCASE WORKSPACE */}
      <div className="animated-gradient-border-card" style={{ position: 'relative', zIndex: 2 }}>
        <div className="card-inner-surface">
          <div 
            style={{
              display: 'grid',
              gridTemplateColumns: 'minmax(0, 1.55fr) minmax(320px, 1fr)',
              gap: '32px',
              alignItems: 'center'
            }}
          >
            {/* LEFT COLUMN: AUTO-SLIDING IMAGES BROWSER FRAME */}
            <div 
              onMouseEnter={() => setIsPaused(true)}
              onMouseLeave={() => setIsPaused(false)}
              style={{
                background: '#0f172a',
                borderRadius: '22px',
                border: '1.5px solid #334155',
                overflow: 'hidden',
                boxShadow: '0 20px 50px rgba(15, 23, 42, 0.25)',
                display: 'flex',
                flexDirection: 'column',
                position: 'relative'
              }}
            >
              {/* macOS Browser Header */}
              <div 
                style={{
                  background: 'linear-gradient(180deg, #1e293b 0%, #0f172a 100%)',
                  borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
                  padding: '10px 16px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '12px'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#ef4444' }} />
                  <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#f59e0b' }} />
                  <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#10b981' }} />
                </div>

                <div 
                  style={{
                    flex: 1,
                    maxWidth: '340px',
                    background: 'rgba(255, 255, 255, 0.06)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    borderRadius: '8px',
                    padding: '4px 10px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    fontSize: '11px',
                    color: '#38bdf8',
                    fontFamily: 'monospace',
                    fontWeight: 700
                  }}
                >
                  <Lock size={11} color="#38bdf8" />
                  <span style={{ color: '#e2e8f0', fontWeight: 600 }}>{currentScreen.pathUrl}</span>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span 
                    style={{ 
                      fontSize: '10px', 
                      fontWeight: 800, 
                      color: '#38bdf8', 
                      background: 'rgba(56, 189, 248, 0.15)',
                      border: '1px solid rgba(56, 189, 248, 0.3)',
                      padding: '2px 8px',
                      borderRadius: '8px',
                      fontFamily: 'monospace'
                    }}
                  >
                    SLIDE {currentImageIndex + 1}/{activeImages.length}
                  </span>
                </div>
              </div>

              {/* Viewport Image Frame */}
              <div 
                style={{
                  position: 'relative',
                  width: '100%',
                  aspectRatio: '16/10',
                  background: '#090d16',
                  overflow: 'hidden'
                }}
              >
                <AnimatePresence mode="wait">
                  <motion.div
                    key={`${activeTabId}_${currentImageIndex}`}
                    initial={{ opacity: 0, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 1.02 }}
                    transition={{ duration: 0.35, ease: 'easeInOut' }}
                    style={{ width: '100%', height: '100%', position: 'relative' }}
                  >
                    <img 
                      src={activeImages[currentImageIndex]} 
                      alt={`${currentScreen.title} - Slide ${currentImageIndex + 1}`}
                      style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                        objectPosition: 'top center',
                        display: 'block'
                      }}
                      onError={(e) => {
                        (e.target as HTMLElement).style.display = 'none';
                      }}
                    />
                  </motion.div>
                </AnimatePresence>

                {/* Left/Right Chevron Navigation */}
                {activeImages.length > 1 && (
                  <>
                    <button
                      type="button"
                      onClick={handlePrevImage}
                      style={{
                        position: 'absolute',
                        left: '12px',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        width: '38px',
                        height: '38px',
                        borderRadius: '50%',
                        background: 'rgba(15, 23, 42, 0.85)',
                        backdropFilter: 'blur(8px)',
                        border: '1px solid rgba(255, 255, 255, 0.2)',
                        color: '#ffffff',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer',
                        boxShadow: '0 4px 14px rgba(0,0,0,0.4)',
                        transition: 'all 0.2s ease',
                        zIndex: 10
                      }}
                      title="Previous Slide"
                    >
                      <ChevronLeft size={18} />
                    </button>

                    <button
                      type="button"
                      onClick={handleNextImage}
                      style={{
                        position: 'absolute',
                        right: '12px',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        width: '38px',
                        height: '38px',
                        borderRadius: '50%',
                        background: 'rgba(15, 23, 42, 0.85)',
                        backdropFilter: 'blur(8px)',
                        border: '1px solid rgba(255, 255, 255, 0.2)',
                        color: '#ffffff',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer',
                        boxShadow: '0 4px 14px rgba(0,0,0,0.4)',
                        transition: 'all 0.2s ease',
                        zIndex: 10
                      }}
                      title="Next Slide"
                    >
                      <ChevronRight size={18} />
                    </button>
                  </>
                )}
              </div>

              {/* Bottom Control Bar */}
              <div 
                style={{
                  background: 'rgba(15, 23, 42, 0.95)',
                  borderTop: '1px solid rgba(255, 255, 255, 0.08)',
                  padding: '10px 16px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '12px'
                }}
              >
                {/* Play / Pause indicator */}
                <button
                  type="button"
                  onClick={() => setIsPaused(!isPaused)}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    color: isPaused ? '#f59e0b' : '#10b981',
                    fontSize: '11px',
                    fontWeight: 700,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    cursor: 'pointer'
                  }}
                  title={isPaused ? 'Resume Auto-Play' : 'Pause Slideshow'}
                >
                  {isPaused ? <Play size={12} fill="#f59e0b" /> : <Pause size={12} fill="#10b981" />}
                  <span>{isPaused ? 'Paused' : 'Auto-Playing'}</span>
                </button>

                {/* Dot Indicators */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  {activeImages.map((_, dotIdx) => {
                    const isActive = dotIdx === currentImageIndex;
                    return (
                      <button
                        key={dotIdx}
                        type="button"
                        onClick={() => setCurrentImageIndex(dotIdx)}
                        style={{
                          width: isActive ? '22px' : '7px',
                          height: '7px',
                          borderRadius: '10px',
                          background: isActive ? '#38bdf8' : 'rgba(255, 255, 255, 0.3)',
                          border: 'none',
                          cursor: 'pointer',
                          transition: 'all 0.25s ease',
                          padding: 0,
                          boxShadow: isActive ? '0 0 10px #38bdf8' : 'none'
                        }}
                        title={`Go to Slide ${dotIdx + 1}`}
                      />
                    );
                  })}
                </div>

                {/* Actions */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <button
                    type="button"
                    onClick={() => setPreviewZoomImage(activeImages[currentImageIndex])}
                    style={{
                      padding: '5px 10px',
                      background: 'rgba(0,0,0,0.6)',
                      backdropFilter: 'blur(8px)',
                      border: '1px solid rgba(255,255,255,0.2)',
                      borderRadius: '8px',
                      color: '#ffffff',
                      fontSize: '10.5px',
                      fontWeight: 700,
                      display: 'flex',
                      alignItems: 'center',
                      gap: '5px',
                      cursor: 'pointer'
                    }}
                    title="Zoom / View Fullscreen"
                  >
                    <Maximize2 size={11} />
                    <span>Zoom</span>
                  </button>

                  {/* Image Slide Counter Badge */}
                  <div
                    style={{
                      padding: '5px 10px',
                      background: 'rgba(0,0,0,0.6)',
                      backdropFilter: 'blur(8px)',
                      border: '1px solid rgba(255,255,255,0.2)',
                      borderRadius: '8px',
                      color: '#94a3b8',
                      fontSize: '10.5px',
                      fontWeight: 700,
                      display: 'flex',
                      alignItems: 'center',
                      gap: '5px'
                    }}
                  >
                    <ImageIcon size={11} color="#38bdf8" />
                    <span>{currentImageIndex + 1} / {activeImages.length}</span>
                  </div>
                </div>
              </div>

              {/* Thumbnails */}
              {activeImages.length > 1 && (
                <div 
                  style={{
                    background: 'rgba(15, 23, 42, 0.95)',
                    borderTop: '1px solid rgba(255, 255, 255, 0.08)',
                    padding: '8px 12px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    overflowX: 'auto',
                    scrollbarWidth: 'none'
                  }}
                >
                  {activeImages.map((imgUrl, thumbIdx) => {
                    const isSelected = thumbIdx === currentImageIndex;
                    return (
                      <div
                        key={thumbIdx}
                        onClick={() => setCurrentImageIndex(thumbIdx)}
                        style={{
                          width: '54px',
                          height: '32px',
                          borderRadius: '6px',
                          overflow: 'hidden',
                          border: isSelected ? '2px solid #38bdf8' : '1px solid rgba(255, 255, 255, 0.15)',
                          opacity: isSelected ? 1 : 0.55,
                          cursor: 'pointer',
                          flexShrink: 0,
                          transition: 'all 0.2s ease',
                          transform: isSelected ? 'scale(1.05)' : 'scale(1)'
                        }}
                      >
                        <img 
                          src={imgUrl} 
                          alt="thumb" 
                          style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                        />
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* RIGHT COLUMN: SCREEN DETAILS */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
              <div>
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: 'rgba(2, 132, 199, 0.08)', border: '1px solid rgba(2, 132, 199, 0.25)', padding: '4px 12px', borderRadius: '20px', fontSize: '11px', fontWeight: 800, color: '#0284c7', textTransform: 'uppercase', marginBottom: '10px' }}>
                  <Sparkles size={13} />
                  <span>{currentScreen.badge}</span>
                </div>

                <h3 style={{ margin: '0 0 10px', fontSize: '24px', fontWeight: 900, color: '#0f172a', letterSpacing: '-0.6px', lineHeight: 1.25 }}>
                  {currentScreen.title}
                </h3>

                <p style={{ margin: 0, fontSize: '14px', color: '#64748b', lineHeight: 1.6, fontWeight: 500 }}>
                  {currentScreen.description}
                </p>
              </div>

              {/* Key Features */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', padding: '14px 0', borderTop: '1px solid #f1f5f9', borderBottom: '1px solid #f1f5f9' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: '11px', fontWeight: 800, color: '#0f172a', textTransform: 'uppercase', letterSpacing: '0.6px' }}>
                    Key Capabilities
                  </span>
                  <span style={{ fontSize: '11px', fontWeight: 700, color: '#0284c7' }}>
                    Auto-Sliding Active ({activeImages.length} Slides)
                  </span>
                </div>

                {currentScreen.keyFeatures.map((feat, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12.5px', color: '#334155' }}>
                    <CheckCircle2 size={15} color={currentScreen.color} style={{ flexShrink: 0 }} />
                    <span>{feat}</span>
                  </div>
                ))}
              </div>

              {/* Action Buttons */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
                <button
                  type="button"
                  onClick={currentScreen.onLaunch}
                  className="gradient-action-btn"
                  style={{
                    background: currentScreen.gradient,
                    color: '#ffffff',
                    border: 'none',
                    borderRadius: '14px',
                    padding: '13px 26px',
                    fontSize: '14px',
                    fontWeight: 800,
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '8px',
                    boxShadow: `0 10px 25px ${currentScreen.glowColor}`
                  }}
                >
                  <span>{currentScreen.actionText}</span>
                  <ArrowRight size={16} />
                </button>

                <button
                  type="button"
                  onClick={onOpenOnboarding}
                  style={{
                    background: '#ffffff',
                    color: '#0f172a',
                    border: '1.5px solid #cbd5e1',
                    borderRadius: '14px',
                    padding: '12px 20px',
                    fontSize: '13.5px',
                    fontWeight: 700,
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '7px',
                    transition: 'all 0.2s ease'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.borderColor = '#94a3b8'}
                  onMouseLeave={(e) => e.currentTarget.style.borderColor = '#cbd5e1'}
                >
                  <Zap size={15} color="#2563eb" />
                  <span>Start Free Trial</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* FULLSCREEN IMAGE LIGHTBOX ONLY */}
      <AnimatePresence>
        {previewZoomImage && (
          <div 
            style={{
              position: 'fixed',
              inset: 0,
              background: 'rgba(0, 0, 0, 0.88)',
              backdropFilter: 'blur(12px)',
              zIndex: 10000,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '24px'
            }}
            onClick={() => setPreviewZoomImage(null)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              style={{
                position: 'relative',
                maxWidth: '1100px',
                width: '100%',
                maxHeight: '90vh',
                borderRadius: '18px',
                overflow: 'hidden',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                boxShadow: '0 25px 60px rgba(0,0,0,0.8)',
                background: '#0f172a'
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <div style={{ position: 'absolute', top: '12px', right: '12px', zIndex: 10 }}>
                <button
                  onClick={() => setPreviewZoomImage(null)}
                  style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: '50%',
                    background: 'rgba(0,0,0,0.7)',
                    color: '#ffffff',
                    border: '1px solid rgba(255,255,255,0.3)',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  <X size={18} />
                </button>
              </div>
              <img 
                src={previewZoomImage} 
                alt="Full Preview" 
                style={{ width: '100%', height: 'auto', maxHeight: '88vh', objectFit: 'contain', display: 'block' }}
              />
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </section>
  );
};

export default ItlcProductShowcase;
