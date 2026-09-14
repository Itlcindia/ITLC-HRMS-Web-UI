import React, { useState, useEffect } from 'react';
import { 
  getLiveSubscriptionPlans, 
  getLiveLandingSections,
  getLiveLandingPageConfig,
  type SubscriptionPlanDef,
  type CustomLandingSection,
  type LandingPageConfig
} from '../types/multiTenant';
import { api } from '../services/api';
import { HeroHeadlineSection } from './HeroHeadlineSection';
import { Hero3DQuantumNexus } from './Hero3DQuantumNexus';
import { ItlcEcosystemOrbit } from './ItlcEcosystemOrbit';
import { ItlcProductShowcase } from './ItlcProductShowcase';
import { CustomLandingSectionRenderer } from './CustomLandingSectionRenderer';
import { SubscriptionPricingCards } from './SubscriptionPricingCards';
import { WorkspacesPage } from './WorkspacesPage';
import { SecurityPage } from './SecurityPage';
import { ModulesPage } from './ModulesPage';
import { PricingPage } from './PricingPage';
import { CompanyRegisterPage } from './CompanyRegisterPage';
import { ClientOnboardingModal } from './ClientOnboardingModal';
import { SecureAuthModal } from './SecureAuthModal';
import { 
  ShieldCheck, 
  Sparkles, 
  Search, 
  X, 
  Mail, 
  MessageCircle, 
  Lock, 
  ArrowRight, 
  Layers, 
  CheckCircle,
  Briefcase,
  ChevronRight,
  Zap,
  LayoutDashboard
} from 'lucide-react';

export interface LandingPageProps {
  onOpenLogin: () => void;
  onOpenSuperowner?: () => void;
  loggedInUser?: any;
  onGoToDashboard?: () => void;
  onSuccessLogin?: () => void;
}

export default function LandingPage({
  onOpenLogin,
  onOpenSuperowner,
  loggedInUser,
  onGoToDashboard,
  onSuccessLogin
}: LandingPageProps) {
  const [activeLandingView, setActiveLandingView] = useState<'home' | 'workspaces' | 'security' | 'modules' | 'pricing'>(() => {
    if (typeof window !== 'undefined') {
      const hash = window.location.hash.toLowerCase();
      if (hash === '#workspaces') return 'workspaces';
      if (hash === '#security' || hash === '#highlights') return 'security';
      if (hash === '#modules') return 'modules';
      if (hash === '#pricing') return 'pricing';
    }
    return 'home';
  });

  const [isRegisteringCompany, setIsRegisteringCompany] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      const hash = window.location.hash.toLowerCase();
      return hash === '#register' || hash.startsWith('#register');
    }
    return false;
  });

  const [selectedOnboardingPlanId, setSelectedOnboardingPlanId] = useState<string>('starter');
  const [showOnboardingModal, setShowOnboardingModal] = useState<boolean>(false);
  const [showSecureAuthModal, setShowSecureAuthModal] = useState<boolean>(false);
  const [showSpotlight, setShowSpotlight] = useState<boolean>(false);
  const [spotlightQuery, setSpotlightQuery] = useState<string>('');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const [cmsConfig, setCmsConfig] = useState<LandingPageConfig>(() => getLiveLandingPageConfig());
  const [landingSectionsOrder, setLandingSectionsOrder] = useState<CustomLandingSection[]>(() => getLiveLandingSections());
  const [lang, setLang] = useState<'en' | 'hi'>('en');

  // Real-time synchronization listeners for live Landing Page CMS settings
  useEffect(() => {
    const handleCmsUpdate = (e?: any) => {
      if (e?.detail && typeof e.detail === 'object' && !Array.isArray(e.detail)) {
        setCmsConfig({ ...getLiveLandingPageConfig(), ...e.detail });
      } else {
        setCmsConfig(getLiveLandingPageConfig());
      }
    };

    const handleSectionsUpdate = (e?: any) => {
      if (e?.detail && Array.isArray(e.detail)) {
        setLandingSectionsOrder(e.detail);
      } else {
        setLandingSectionsOrder(getLiveLandingSections());
      }
    };

    const handleStorageUpdate = (e?: StorageEvent) => {
      if (!e || e.key === 'itlc_live_landing_page_config' || e.key === 'itlc_landing_sections_order' || !e.key) {
        setCmsConfig(getLiveLandingPageConfig());
        setLandingSectionsOrder(getLiveLandingSections());
      }
    };

    window.addEventListener('landing_page_config_updated', handleCmsUpdate);
    window.addEventListener('landing_sections_updated', handleSectionsUpdate);
    window.addEventListener('showcase_images_updated', handleCmsUpdate);
    window.addEventListener('storage', handleStorageUpdate);

    return () => {
      window.removeEventListener('landing_page_config_updated', handleCmsUpdate);
      window.removeEventListener('landing_sections_updated', handleSectionsUpdate);
      window.removeEventListener('showcase_images_updated', handleCmsUpdate);
      window.removeEventListener('storage', handleStorageUpdate);
    };
  }, []);

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  // Sync hash changes
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.toLowerCase();
      if (hash === '#workspaces') {
        setActiveLandingView('workspaces');
        setIsRegisteringCompany(false);
      } else if (hash === '#security' || hash === '#highlights') {
        setActiveLandingView('security');
        setIsRegisteringCompany(false);
      } else if (hash === '#modules') {
        setActiveLandingView('modules');
        setIsRegisteringCompany(false);
      } else if (hash === '#pricing') {
        setActiveLandingView('pricing');
        setIsRegisteringCompany(false);
      } else if (hash === '#register' || hash.startsWith('#register')) {
        setIsRegisteringCompany(true);
      } else {
        setActiveLandingView('home');
        setIsRegisteringCompany(false);
      }
    };

    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  // Spotlight Keyboard Shortcut (Ctrl+K / Cmd+K)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setShowSpotlight(prev => !prev);
      }
      if (e.key === 'Escape') {
        setShowSpotlight(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const navigateTo = (view: 'home' | 'workspaces' | 'security' | 'modules' | 'pricing') => {
    setActiveLandingView(view);
    setIsRegisteringCompany(false);
    window.location.hash = view === 'home' ? '' : `#${view}`;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const openRegister = (planId: string = 'starter') => {
    setSelectedOnboardingPlanId(planId);
    setIsRegisteringCompany(true);
    window.location.hash = '#register';
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleAuthTrigger = () => {
    if (loggedInUser && onGoToDashboard) {
      onGoToDashboard();
    } else {
      setShowSecureAuthModal(true);
    }
  };

  // 1. SUB-PAGE: COMPANY REGISTRATION & CHECKOUT
  if (isRegisteringCompany) {
    return (
      <div className="min-h-screen bg-slate-950 text-white">
        <CompanyRegisterPage 
          initialPlanId={selectedOnboardingPlanId}
          onBackToHome={() => {
            setIsRegisteringCompany(false);
            window.location.hash = '';
          }}
          onCompleteRegistration={async (newTenant) => {
            setIsRegisteringCompany(false);
            window.location.hash = '';
            triggerToast(`Workspace "${newTenant.name}" created successfully! Launching workspace...`);
            try {
              const pass = (newTenant as any).password || (newTenant as any).adminPassword || 'Admin@123';
              await api.login({ email: newTenant.adminEmail, password: pass });
              if (onSuccessLogin) onSuccessLogin();
              else if (onGoToDashboard) onGoToDashboard();
              else window.location.href = '/';
            } catch {
              if (onOpenLogin) onOpenLogin();
              else setShowSecureAuthModal(true);
            }
          }}
          lang={lang}
        />
        {toastMessage && (
          <div className="fixed bottom-6 right-6 z-50 bg-slate-900 border border-emerald-500/40 text-white px-5 py-3 rounded-2xl shadow-2xl flex items-center gap-3">
            <CheckCircle className="h-5 w-5 text-emerald-400" />
            <span className="text-sm font-semibold">{toastMessage}</span>
          </div>
        )}
      </div>
    );
  }

  // 2. SUB-PAGE: WORKSPACES
  if (activeLandingView === 'workspaces') {
    return (
      <WorkspacesPage 
        onBackToHome={() => navigateTo('home')}
        onExploreCrm={() => {
          triggerToast('🚀 ITLC Sales CRM is Coming Soon! Stay tuned.');
        }}
        onExploreHrms={() => {
          if (onOpenLogin) onOpenLogin();
          else setShowSecureAuthModal(true);
        }}
        onExploreSuperAdmin={() => {
          if (onOpenSuperowner) onOpenSuperowner();
          else setShowSecureAuthModal(true);
        }}
        onGetStarted={() => openRegister('starter')}
        onOpenSignIn={() => onOpenLogin ? onOpenLogin() : setShowSecureAuthModal(true)}
        onOpenSearch={() => setShowSpotlight(true)}
        onNavigateTo={(page) => navigateTo(page)}
      />
    );
  }

  // 3. SUB-PAGE: SECURITY
  if (activeLandingView === 'security') {
    return (
      <SecurityPage 
        onBackToHome={() => navigateTo('home')}
        onGetStarted={() => openRegister('starter')}
        onOpenSignIn={() => onOpenLogin ? onOpenLogin() : setShowSecureAuthModal(true)}
        onOpenSearch={() => setShowSpotlight(true)}
        onNavigateTo={(page) => navigateTo(page)}
      />
    );
  }

  // 4. SUB-PAGE: MODULES
  if (activeLandingView === 'modules') {
    return (
      <ModulesPage 
        onBackToHome={() => navigateTo('home')}
        onExploreCrm={() => triggerToast('🚀 ITLC Sales CRM is Coming Soon! Stay tuned.')}
        onExploreHrms={() => {
          if (onOpenLogin) onOpenLogin();
          else setShowSecureAuthModal(true);
        }}
        onExploreSuperAdmin={() => {
          if (onOpenSuperowner) onOpenSuperowner();
          else setShowSecureAuthModal(true);
        }}
        onGetStarted={() => openRegister('starter')}
        onOpenSignIn={handleAuthTrigger}
        onOpenSearch={() => setShowSpotlight(true)}
        onNavigateTo={(page) => navigateTo(page)}
      />
    );
  }

  // 5. SUB-PAGE: PRICING
  if (activeLandingView === 'pricing') {
    return (
      <PricingPage 
        onBackToHome={() => navigateTo('home')}
        onSelectPlanAndRegister={(planId) => openRegister(planId)}
        onOpenSignIn={handleAuthTrigger}
        onOpenSearch={() => setShowSpotlight(true)}
        onNavigateTo={(page) => navigateTo(page)}
      />
    );
  }

  // MAIN HOMEPAGE LANDING VIEW
  return (
    <div className="itlc-glass-page min-h-screen bg-slate-50 text-slate-900 font-sans selection:bg-sky-500 selection:text-white">
      {/* Background Watermark */}
      <div className="itlc-bg-watermark pointer-events-none fixed inset-0 flex items-center justify-center overflow-hidden" style={{ opacity: 0.025, zIndex: 0 }}>
        <img 
          src="/itlc_logo.png" 
          alt="ITLC Watermark" 
          style={{ width: '360px', maxWidth: '50vw', maxHeight: '45vh', objectFit: 'contain' }}
          className="object-contain" 
          onError={(e) => { (e.target as any).style.display = 'none'; }}
        />
      </div>

      {/* Top Sticky Navigation Bar */}
      <header 
        className="itlc-glass-nav sticky top-3 z-50 max-w-7xl mx-auto px-5 py-2.5 rounded-2xl flex items-center justify-between transition-all duration-200"
        style={{
          background: 'rgba(255, 255, 255, 0.9)',
          backdropFilter: 'blur(24px)',
          WebkitBackdropFilter: 'blur(24px)',
          border: '1px solid rgba(226, 232, 240, 0.85)',
          boxShadow: '0 10px 30px -5px rgba(15, 23, 42, 0.05)'
        }}
      >
        {/* Brand Logo & Title */}
        <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigateTo('home')}>
          <div 
            className="w-10 h-10 rounded-xl bg-gradient-to-br from-sky-500 to-blue-600 p-0.5 shadow-md shadow-sky-500/20 flex items-center justify-center flex-shrink-0"
            style={{ width: '40px', height: '40px', minWidth: '40px', minHeight: '40px', maxWidth: '40px', maxHeight: '40px' }}
          >
            <div className="w-full h-full bg-white rounded-[10px] flex items-center justify-center p-0.5" style={{ width: '100%', height: '100%' }}>
              <img 
                src={cmsConfig.logoUrl || '/itlc_logo.png'} 
                alt="ITLC Logo" 
                className="w-full h-full object-contain" 
                style={{ width: '32px', height: '32px', maxWidth: '32px', maxHeight: '32px', objectFit: 'contain', display: 'block' }}
                onError={(e) => { (e.target as any).src = '/itlc_logo.png'; }}
              />
            </div>
          </div>

          <div>
            <div className="flex items-center gap-2">
              <span className="text-[15px] font-extrabold tracking-tight text-slate-900 leading-tight">
                {cmsConfig.companyName || 'ITLC INDIA PVT LTD'}
              </span>
              <span className="inline-flex items-center gap-1 text-[10px] font-bold bg-sky-50 text-sky-600 px-2 py-0.5 rounded-full border border-sky-200/60">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Cloud 3.0
              </span>
            </div>
            <span className="block text-[11px] text-slate-500 font-medium">
              {cmsConfig.companyTagline || 'Unified Business & Workforce OS'}
            </span>
          </div>
        </div>

        {/* Center Nav Links */}
        <div className="hidden md:flex items-center gap-1 bg-slate-100/80 p-1 rounded-xl border border-slate-200/70">
          <button 
            onClick={() => navigateTo('workspaces')}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 px-3 py-1.5 rounded-lg hover:text-sky-600 hover:bg-white hover:shadow-xs transition cursor-pointer"
          >
            <Briefcase size={13} className="text-sky-600" />
            <span>Workspaces</span>
          </button>

          <button 
            onClick={() => navigateTo('security')}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 px-3 py-1.5 rounded-lg hover:text-sky-600 hover:bg-white hover:shadow-xs transition cursor-pointer"
          >
            <ShieldCheck size={13} className="text-indigo-600" />
            <span>Security</span>
          </button>

          <button 
            onClick={() => navigateTo('modules')}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 px-3 py-1.5 rounded-lg hover:text-sky-600 hover:bg-white hover:shadow-xs transition cursor-pointer"
          >
            <Layers size={13} className="text-amber-600" />
            <span>Modules</span>
          </button>

          <button 
            onClick={() => navigateTo('pricing')}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 px-3 py-1.5 rounded-lg hover:text-sky-600 hover:bg-white hover:shadow-xs transition cursor-pointer"
          >
            <Sparkles size={13} className="text-purple-600" />
            <span>Pricing</span>
          </button>
        </div>

        {/* Right Action Cluster */}
        <div className="flex items-center gap-2">
          {/* Spotlight Search Trigger */}
          <button 
            onClick={() => setShowSpotlight(true)}
            title="Quick Search (Ctrl + K)"
            className="inline-flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs bg-slate-100 border border-slate-200 text-slate-500 hover:bg-slate-200/70 hover:text-slate-800 transition cursor-pointer"
          >
            <Search size={13} />
            <span className="hidden sm:inline font-medium">Search...</span>
            <kbd className="text-[10px] font-bold px-1.5 py-0.5 bg-white rounded border border-slate-300 text-slate-600">Ctrl K</kbd>
          </button>

          {/* Conditional: Go to Dashboard or Login */}
          {loggedInUser ? (
            <button 
              onClick={onGoToDashboard}
              className="px-3.5 py-1.5 text-xs font-bold rounded-lg bg-emerald-600 text-white shadow-md shadow-emerald-600/20 hover:bg-emerald-500 transition inline-flex items-center gap-1.5 cursor-pointer"
            >
              <LayoutDashboard size={12} />
              <span>Dashboard ({loggedInUser.role})</span>
            </button>
          ) : (
            <button 
              onClick={() => onOpenLogin ? onOpenLogin() : setShowSecureAuthModal(true)}
              className="px-3.5 py-1.5 text-xs font-bold rounded-lg bg-sky-50 text-sky-600 border border-sky-200 hover:bg-sky-600 hover:text-white transition inline-flex items-center gap-1.5 cursor-pointer"
            >
              <Lock size={12} />
              <span>Portal Login</span>
            </button>
          )}

          {/* Primary CTA */}
          <button 
            onClick={() => openRegister('starter')}
            className="px-3.5 py-1.5 text-xs font-bold rounded-lg bg-gradient-to-r from-sky-500 via-blue-600 to-indigo-600 text-white shadow-md shadow-sky-500/20 hover:shadow-lg transition inline-flex items-center gap-1.5 cursor-pointer"
          >
            <Sparkles size={12} />
            <span>Get Started</span>
            <ArrowRight size={12} />
          </button>
        </div>
      </header>

      {/* SECTION 1: HERO HEADLINE SECTION */}
      <HeroHeadlineSection 
        badgeText={cmsConfig.orbitSyncBadge ? `✨ ${cmsConfig.orbitSyncBadge} • 100% Real-Time Cloud Sync` : undefined}
        headline={lang === 'hi' ? (cmsConfig.heroHeadlineHi || cmsConfig.heroHeadlineEn) : (cmsConfig.heroHeadlineEn || cmsConfig.heroHeadlineHi)}
        subtitle={lang === 'hi' ? (cmsConfig.heroSubtitleHi || cmsConfig.heroSubtitleEn) : (cmsConfig.heroSubtitleEn || cmsConfig.heroSubtitleHi)}
        primaryButtonText="Start Free Enterprise Trial"
        whatsAppNumber={cmsConfig.whatsappSalesNumber || '9532341000'}
        whatsAppMessage={`Hello, I want more information about ${cmsConfig.companyName || 'ITLC OmniStaff HRMS'}`}
        onOpenOnboarding={() => openRegister('starter')}
        onScrollToEcosystem={() => {
          const el = document.getElementById('hero_3d_stage');
          if (el) el.scrollIntoView({ behavior: 'smooth' });
        }}
      />

      {/* DYNAMIC LANDING SECTIONS */}
      {landingSectionsOrder
        .filter(sec => sec.enabled && sec.id !== 'navbar' && sec.id !== 'footer' && sec.type !== 'system_navbar' && sec.type !== 'system_footer')
        .map((sec) => {
          switch (sec.id) {
            case 'hero_3d':
              return (
                <Hero3DQuantumNexus 
                  key="hero_3d"
                  onExploreCrm={() => {
                    triggerToast('🚀 ITLC Sales CRM is Coming Soon! Stay tuned.');
                  }}
                  onExploreHrms={() => {
                    if (onOpenLogin) onOpenLogin();
                    else setShowSecureAuthModal(true);
                  }}
                  onOpenSuperAdmin={() => {
                    if (onOpenSuperowner) onOpenSuperowner();
                    else setShowSecureAuthModal(true);
                  }}
                  onOpenOnboarding={() => openRegister('starter')}
                  lang={lang}
                />
              );

            case 'ecosystem_orbit':
              return (
                <div id="workspaces" key="ecosystem_orbit">
                  <ItlcEcosystemOrbit 
                    onLaunchCrm={() => {
                      triggerToast('🚀 ITLC Sales CRM is Coming Soon! Stay tuned.');
                    }}
                    onLaunchHrms={() => {
                      if (onOpenLogin) onOpenLogin();
                      else setShowSecureAuthModal(true);
                    }}
                    lang={lang}
                  />
                </div>
              );

            case 'product_showcase':
              return (
                <ItlcProductShowcase 
                  key="product_showcase"
                  onLaunchCrm={() => {
                    triggerToast('🚀 ITLC Sales CRM is Coming Soon! Stay tuned.');
                  }}
                  onLaunchHrms={() => {
                    if (onOpenLogin) onOpenLogin();
                    else setShowSecureAuthModal(true);
                  }}
                  onOpenSuperAdmin={() => {
                    if (onOpenSuperowner) onOpenSuperowner();
                    else setShowSecureAuthModal(true);
                  }}
                  onOpenOnboarding={() => openRegister('starter')}
                  lang={lang}
                />
              );

            case 'pricing_plans':
            case 'system_pricing':
              return (
                <SubscriptionPricingCards 
                  key="pricing_plans"
                  onSelectPlan={(planId) => openRegister(planId)}
                  onManageSubscription={() => setShowSecureAuthModal(true)}
                  lang={lang}
                />
              );

            default:
              return (
                <CustomLandingSectionRenderer 
                  key={sec.id}
                  section={sec}
                  lang={lang}
                  onOpenOnboarding={() => openRegister('starter')}
                  onExploreCrm={() => triggerToast('🚀 ITLC Sales CRM is Coming Soon! Stay tuned.')}
                  onExploreHrms={() => {
                    if (onOpenLogin) onOpenLogin();
                    else setShowSecureAuthModal(true);
                  }}
                />
              );
          }
        })}

      {/* 4-COLUMN ENTERPRISE FOOTER */}
      <footer id="contact" className="bg-white border-t border-slate-200 pt-14 pb-8 px-6 relative z-10">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-9 pb-10 border-b border-slate-200">
          {/* Brand Info */}
          <div>
            <div className="flex items-center gap-2.5 mb-3.5">
              <div 
                className="w-10 h-10 rounded-xl border border-sky-500 bg-white p-1 flex items-center justify-center flex-shrink-0"
                style={{ width: '40px', height: '40px', minWidth: '40px', minHeight: '40px', maxWidth: '40px', maxHeight: '40px' }}
              >
                <img 
                  src={cmsConfig.logoUrl || '/itlc_logo.png'} 
                  alt="Logo" 
                  className="w-full h-full object-contain" 
                  style={{ width: '32px', height: '32px', maxWidth: '32px', maxHeight: '32px', objectFit: 'contain', display: 'block' }}
                  onError={(e) => { (e.target as any).src = '/itlc_logo.png'; }}
                />
              </div>
              <div>
                <h4 className="m-0 text-base font-black text-slate-900">
                  {cmsConfig.companyName || 'ITLC INDIA PVT LTD'}
                </h4>
                <span className="text-xs text-sky-600 font-bold">
                  {cmsConfig.companyTagline || 'Unified Business Cloud Operating System'}
                </span>
              </div>
            </div>
            <p className="text-xs text-slate-500 leading-relaxed mb-4">
              Next-generation enterprise platform connecting intelligent Sales CRM, live biometric HRMS radar, 1-click payroll, and GST tax invoicing.
            </p>

            <div className="inline-flex items-center gap-1.5 bg-emerald-50 border border-emerald-200 text-emerald-700 px-3 py-1 rounded-full text-xs font-bold">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
              <span>All Systems Operational • 99.99% SLA</span>
            </div>
          </div>

          {/* Cloud Apps */}
          <div>
            <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-900 mb-4">Cloud Apps</h4>
            <ul className="space-y-2 text-xs text-slate-600">
              <li>
                <button 
                  onClick={() => triggerToast('🚀 ITLC Sales CRM is Coming Soon! Stay tuned.')} 
                  className="hover:text-sky-600 transition cursor-pointer flex items-center gap-1.5"
                >
                  <span>💼 ITLC Sales CRM</span>
                  <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-300/60">Coming Soon</span>
                </button>
              </li>
              <li>
                <button 
                  onClick={() => onOpenLogin ? onOpenLogin() : setShowSecureAuthModal(true)} 
                  className="hover:text-sky-600 transition cursor-pointer"
                >
                  👥 OmniStaff Enterprise HRMS
                </button>
              </li>
              <li><button onClick={() => navigateTo('workspaces')} className="hover:text-sky-600 transition cursor-pointer">📍 GPS Field Rep Tracker</button></li>
              <li><button onClick={() => navigateTo('modules')} className="hover:text-sky-600 transition cursor-pointer">🕒 Live Biometric Radar</button></li>
            </ul>
          </div>

          {/* Enterprise Tools */}
          <div>
            <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-900 mb-4">Enterprise Tools</h4>
            <ul className="space-y-2 text-xs text-slate-600">
              <li><button onClick={() => navigateTo('modules')} className="hover:text-sky-600 transition cursor-pointer">🧾 Automated GST Invoicing</button></li>
              <li><button onClick={() => navigateTo('modules')} className="hover:text-sky-600 transition cursor-pointer">📢 WhatsApp Broadcast Engine</button></li>
              <li><button onClick={() => openRegister('starter')} className="hover:text-sky-600 transition cursor-pointer">🏢 Instant Company Onboarding</button></li>
              <li><button onClick={() => setShowSecureAuthModal(true)} className="hover:text-sky-600 transition cursor-pointer">🎧 24/7 Priority Desk</button></li>
            </ul>
          </div>

          {/* Live Support & Contact */}
          <div>
            <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-900 mb-4">Live Support & Demo</h4>
            <p className="text-xs text-slate-500 mb-3">Reach out for live assistance or enterprise walkthrough:</p>
            <div className="space-y-2.5">
              <a 
                href={`https://wa.me/${cmsConfig.whatsappSalesNumber || '918368817744'}?text=Hello%20ITLC%20Team%2C%20I%20want%20a%20demo%20of%20ITLC%20Enterprise%20Suite`} 
                target="_blank" 
                rel="noreferrer"
                className="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-300/60 text-xs font-bold hover:bg-emerald-100 transition cursor-pointer"
              >
                <MessageCircle size={14} />
                <span>+{cmsConfig.whatsappSalesNumber || '918368817744'} (WhatsApp)</span>
              </a>

              <a 
                href={`mailto:${cmsConfig.supportEmail || 'support@itlc.in'}`}
                className="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg bg-sky-50 text-sky-700 border border-sky-300/60 text-xs font-bold hover:bg-sky-100 transition cursor-pointer"
              >
                <Mail size={14} />
                <span>{cmsConfig.supportEmail || 'support@itlc.in'}</span>
              </a>

              <div className="text-[11px] text-slate-400">
                🕒 Mon – Sat: 9:00 AM – 7:00 PM IST
              </div>
            </div>
          </div>
        </div>

        {/* Compliance Badges */}
        <div className="max-w-7xl mx-auto mt-6 flex flex-col sm:flex-row justify-between items-center gap-4 text-[11px] text-slate-500 font-medium">
          <div className="flex flex-wrap items-center gap-3">
            <span>🔒 256-Bit SSL Encryption</span>
            <span>•</span>
            <span>🛡️ SOC-2 Multi-Tenant Isolation</span>
            <span>•</span>
            <span>📜 ISO 27001 Certified</span>
            <span>•</span>
            <span>🇮🇳 GST 100% Tax Compliant</span>
          </div>

          <div>
            © {new Date().getFullYear()} {cmsConfig.companyName || 'ITLC INDIA PVT LTD'}. All Rights Reserved.
          </div>
        </div>
      </footer>

      {/* Floating 24/7 WhatsApp Live Desk Capsule */}
      <a 
        href={`https://wa.me/${cmsConfig.whatsappSalesNumber || '918368817744'}?text=Hello%20ITLC%20Team%2C%20I%20have%20an%20inquiry%20regarding%20ITLC%20Enterprise%20Platform`}
        target="_blank"
        rel="noreferrer"
        className="fixed bottom-6 right-6 z-40 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs px-4 py-2.5 rounded-full shadow-xl shadow-emerald-600/30 flex items-center gap-2 transition hover:scale-105 cursor-pointer"
      >
        <span className="w-2 h-2 rounded-full bg-white animate-ping" />
        <span>24/7 Live Desk</span>
        <ArrowRight size={13} />
      </a>

      {/* Spotlight Command Modal (Ctrl + K) */}
      {showSpotlight && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-start justify-center pt-24 p-4 animate-in fade-in">
          <div className="bg-white rounded-2xl max-w-xl w-full shadow-2xl border border-slate-200 overflow-hidden">
            <div className="p-4 border-b border-slate-100 flex items-center gap-3">
              <Search className="h-5 w-5 text-slate-400" />
              <input 
                type="text" 
                autoFocus
                placeholder="Search modules, workspaces, security, pricing..." 
                value={spotlightQuery}
                onChange={(e) => setSpotlightQuery(e.target.value)}
                className="w-full bg-transparent outline-none text-slate-900 text-sm placeholder-slate-400"
              />
              <button onClick={() => setShowSpotlight(false)} className="p-1 text-slate-400 hover:text-slate-600 rounded-lg cursor-pointer">
                <X size={16} />
              </button>
            </div>

            <div className="p-3 max-h-80 overflow-y-auto space-y-1 text-xs">
              <div 
                onClick={() => { setShowSpotlight(false); navigateTo('workspaces'); }}
                className="p-2.5 rounded-xl hover:bg-slate-50 cursor-pointer flex items-center justify-between text-slate-700 font-semibold"
              >
                <div className="flex items-center gap-2">
                  <Briefcase size={14} className="text-sky-600" />
                  <span>Workspaces (Sales CRM, HRMS, Admin)</span>
                </div>
                <ChevronRight size={14} className="text-slate-400" />
              </div>

              <div 
                onClick={() => { setShowSpotlight(false); navigateTo('security'); }}
                className="p-2.5 rounded-xl hover:bg-slate-50 cursor-pointer flex items-center justify-between text-slate-700 font-semibold"
              >
                <div className="flex items-center gap-2">
                  <ShieldCheck size={14} className="text-indigo-600" />
                  <span>Security & Compliance Protocols</span>
                </div>
                <ChevronRight size={14} className="text-slate-400" />
              </div>

              <div 
                onClick={() => { setShowSpotlight(false); navigateTo('modules'); }}
                className="p-2.5 rounded-xl hover:bg-slate-50 cursor-pointer flex items-center justify-between text-slate-700 font-semibold"
              >
                <div className="flex items-center gap-2">
                  <Layers size={14} className="text-amber-600" />
                  <span>Enterprise Modules Directory</span>
                </div>
                <ChevronRight size={14} className="text-slate-400" />
              </div>

              <div 
                onClick={() => { setShowSpotlight(false); navigateTo('pricing'); }}
                className="p-2.5 rounded-xl hover:bg-slate-50 cursor-pointer flex items-center justify-between text-slate-700 font-semibold"
              >
                <div className="flex items-center gap-2">
                  <Sparkles size={14} className="text-purple-600" />
                  <span>Subscription Plans & Pricing Calculator</span>
                </div>
                <ChevronRight size={14} className="text-slate-400" />
              </div>

              <div 
                onClick={() => { setShowSpotlight(false); openRegister('starter'); }}
                className="p-2.5 rounded-xl bg-sky-50 text-sky-700 cursor-pointer flex items-center justify-between font-bold"
              >
                <div className="flex items-center gap-2">
                  <Zap size={14} className="text-sky-600" />
                  <span>Create Workspace & Instant Onboard</span>
                </div>
                <ArrowRight size={14} className="text-sky-600" />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Client Onboarding Modal */}
      <ClientOnboardingModal 
        isOpen={showOnboardingModal}
        initialPlanId={selectedOnboardingPlanId}
        onClose={() => setShowOnboardingModal(false)}
        onComplete={(newTenant) => {
          setShowOnboardingModal(false);
          triggerToast(`Workspace "${newTenant.name}" initialized successfully!`);
        }}
        lang={lang}
      />

      {/* Universal Secure Auth Sign-In Modal */}
      <SecureAuthModal 
        isOpen={showSecureAuthModal}
        onClose={() => setShowSecureAuthModal(false)}
        onSuccess={(profile) => {
          setShowSecureAuthModal(false);
          triggerToast(`Logged in as ${profile.name || profile.email}`);
          if (onSuccessLogin) onSuccessLogin();
          else if (onGoToDashboard) onGoToDashboard();
        }}
        onOpenRegister={() => {
          setShowSecureAuthModal(false);
          openRegister('growth');
        }}
        lang={lang}
      />

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-5 py-3 rounded-2xl shadow-2xl flex items-center gap-3 border border-slate-700">
          <CheckCircle className="h-5 w-5 text-emerald-400" />
          <span className="text-xs font-semibold">{toastMessage}</span>
        </div>
      )}
    </div>
  );
}
