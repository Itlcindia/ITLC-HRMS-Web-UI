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
import { Hero3DQuantumNexus } from './Hero3DQuantumNexus';
import { ItlcEcosystemOrbit } from './ItlcEcosystemOrbit';
import { ItlcProductShowcase } from './ItlcProductShowcase';
import { CustomLandingSectionRenderer } from './CustomLandingSectionRenderer';
import { SubscriptionPricingCards } from './SubscriptionPricingCards';
import { WorkspacesPage } from './WorkspacesPage';
import { SecurityPage } from './SecurityPage';
import { ModulesPage } from './ModulesPage';
import { PricingPage } from './PricingPage';
import { LegalPoliciesPage, type PolicyType } from './LegalPoliciesPage';
import { LandingHeader } from './LandingHeader';
import { LandingFooter } from './LandingFooter';
import { ClientOnboardingModal } from './ClientOnboardingModal';
import { SecureAuthModal } from './SecureAuthModal';
import Carousel from './Carousel';
import { 
  ShieldCheck, 
  Sparkles, 
  Search, 
  X, 
  Lock, 
  ArrowRight, 
  Layers, 
  CheckCircle,
  Briefcase,
  ChevronRight,
  Zap,
  Cpu,
  UsersRound,
  BarChart3,
  Shield,
  FileText
} from 'lucide-react';

export interface LandingPageProps {
  onOpenLogin: (initialPlanId?: string, isSignUp?: boolean) => void;
  onOpenSuperowner?: () => void;
  loggedInUser?: any;
  onGoToDashboard?: () => void;
  onSuccessLogin?: () => void;
}

type LandingView = 
  | 'home' 
  | 'workspaces' 
  | 'security' 
  | 'modules' 
  | 'pricing' 
  | 'terms' 
  | 'privacy' 
  | 'refund' 
  | 'shipping' 
  | 'pricing-policy';

const landingPathByView: Record<LandingView, string> = {
  home: '/',
  workspaces: '/workspaces',
  security: '/security',
  modules: '/modules',
  pricing: '/pricing',
  terms: '/terms',
  privacy: '/privacy',
  refund: '/cancellation-refund',
  shipping: '/shipping-policy',
  'pricing-policy': '/pricing-policy'
};

const getLandingRouteState = (): { view: LandingView; registering: boolean } => {
  if (typeof window === 'undefined') return { view: 'home', registering: false };

  const path = window.location.pathname.toLowerCase().replace(/\/+$/, '') || '/';
  const hash = window.location.hash.toLowerCase();

  if (path === '/workspaces' || hash === '#workspaces') return { view: 'workspaces', registering: false };
  if (path === '/security' || path === '/highlights' || hash === '#security' || hash === '#highlights') return { view: 'security', registering: false };
  if (path === '/modules' || hash === '#modules') return { view: 'modules', registering: false };
  if (path === '/pricing' || hash === '#pricing') return { view: 'pricing', registering: false };
  if (path === '/terms' || hash === '#terms') return { view: 'terms', registering: false };
  if (path === '/privacy' || hash === '#privacy') return { view: 'privacy', registering: false };
  if (path === '/cancellation-refund' || path === '/refund' || hash === '#cancellation-refund' || hash === '#refund') return { view: 'refund', registering: false };
  if (path === '/shipping-policy' || path === '/shipping' || path === '/delivery-policy' || hash === '#shipping-policy' || hash === '#shipping') return { view: 'shipping', registering: false };
  if (path === '/pricing-policy' || hash === '#pricing-policy') return { view: 'pricing-policy', registering: false };
  if (path === '/register' || hash === '#register' || hash.startsWith('#register')) return { view: 'home', registering: false };

  return { view: 'home', registering: false };
};

function HiringOnboardingSection({
  onStart,
  whatsappNumber
}: {
  onStart: () => void;
  whatsappNumber?: string;
}) {
  const candidates = [
    { name: 'Rahul Sharma', role: 'Software Developer', exp: '5+ Years Experience', score: 92, color: '#22c55e' },
    { name: 'Priya Singh', role: 'UI/UX Designer', exp: '4+ Years Experience', score: 87, color: '#22c55e' },
    { name: 'Amit Verma', role: 'Full Stack Developer', exp: '6+ Years Experience', score: 76, color: '#f59e0b' },
    { name: 'Neha Gupta', role: 'Digital Marketer', exp: '3+ Years Experience', score: 68, color: '#f59e0b' }
  ];

  const waNumber = whatsappNumber || '918368817744';

  return (
    <section className="itlc-hiring-section" aria-labelledby="itlc-hiring-title">
      <div className="itlc-hiring-content">
        <div className="itlc-hiring-copy">
          <div className="itlc-hiring-badge">
            <UsersRound size={19} />
            <span>Recruitment & Onboarding</span>
          </div>

          <h2 id="itlc-hiring-title">
            Hiring and
            <span>Onboarding</span>
          </h2>

          <p>
            Find the right talent, streamline your hiring process, and deliver a seamless onboarding experience with ITLC India's smart HR solution.
          </p>

          <div className="itlc-hiring-actions">
            <button type="button" className="itlc-hiring-primary" onClick={onStart}>
              Start Free Trial <ArrowRight size={18} />
            </button>
            <a
              className="itlc-hiring-secondary"
              href={`https://wa.me/${waNumber}?text=Hello%20ITLC%20Team%2C%20I%20want%20a%20demo%20of%20ITLC%20Recruitment%20and%20Onboarding`}
              target="_blank"
              rel="noreferrer"
            >
              Request Demo
            </a>
          </div>

          <div className="itlc-hiring-features" aria-label="Hiring features">
            <span><Zap size={20} /> Automated Hiring</span>
            <span><Shield size={20} /> Custom Onboarding Workflows</span>
            <span><UsersRound size={20} /> Offer Letter with E-sign</span>
            <span><BarChart3 size={20} /> Track Progress & Reports</span>
          </div>
        </div>

        <div className="itlc-hiring-visual" aria-hidden="true">
          <div className="itlc-hiring-photo">
            <div className="itlc-hiring-photo-note">Better<br />Teams,<br />Brighter<br />Future</div>
          </div>

          <div className="itlc-candidate-panel">
            <div className="itlc-candidate-head">
              <div>
                <strong>Candidate Matches</strong>
                <p>Zia helps you automatically screen and identify the best candidates from your database.</p>
              </div>
              <X size={16} />
            </div>
            <span className="itlc-match-meta">4 Matches · Refine Match</span>

            <div className="itlc-candidate-list">
              {candidates.map((candidate, index) => (
                <div className="itlc-candidate-row" key={candidate.name}>
                  <div className="itlc-score-ring" style={{ ['--score-color' as any]: candidate.color }}>
                    <strong>{candidate.score}%</strong>
                    <span>Match</span>
                  </div>
                  <div className="itlc-avatar">{candidate.name.split(' ').map(part => part[0]).join('')}</div>
                  <div>
                    <strong>{candidate.name}</strong>
                    <span>{candidate.role}</span>
                    <em>{candidate.exp}</em>
                  </div>
                  {index === 0 && (
                    <div className="itlc-status-pop">
                      <strong>Rahul Sharma</strong>
                      <span>03.01.2025 · 10:33 AM</span>
                      <div><CheckCircle size={13} /> Candidate</div>
                      <div><CheckCircle size={13} /> Employee</div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="itlc-hiring-stack">
            <span><UsersRound size={18} /> Smart Screening</span>
            <span><Cpu size={18} /> Automated Workflows</span>
            <span><CheckCircle size={18} /> Seamless Onboarding</span>
          </div>
        </div>
      </div>
    </section>
  );
}

function CoreHrManagementSection({
  onExplore
}: {
  onExplore: () => void;
}) {
  const people = [
    { name: 'Christine Spalding', role: 'HR Manager', active: true },
    { name: 'Davis Rosemary', role: 'Marketing Manager' },
    { name: 'Wilson Carla', role: 'Software Engineer' }
  ];

  const directory = [
    { name: 'Anitha Joshi', role: 'HR Manager', active: true },
    { name: 'Rodriguez Sue', role: 'Payroll Associate' },
    { name: 'Rebecca Biaggio', role: 'HR Manager' },
    { name: 'Keb Lisa', role: 'HR Manager' },
    { name: 'Sandra Marks', role: 'HR Analyst' },
    { name: 'John Broadnax', role: 'HR Associate' },
    { name: 'Randall Gladstone', role: 'HR Manager' },
    { name: 'Mary Hansley', role: 'Recruitment Associate' },
    { name: 'Frank Ocean', role: 'HR Analyst' }
  ];

  const features = ['Employee management', 'Time and attendance', 'Document management', 'HR helpdesk'];

  return (
    <section className="itlc-core-hr-section" aria-labelledby="itlc-core-hr-title">
      <div className="itlc-core-hr-shell">
        <div className="itlc-core-hr-copy">
          <h2 id="itlc-core-hr-title">Core HR management</h2>
          <p>
            Boost workplace efficiency with a robust HR system that is highly customizable. Simplify your routine HR processes and effectively manage all your employee information from a single, centralized database.
          </p>

          <button type="button" className="itlc-core-hr-button" onClick={onExplore}>
            Explore Core HR <ArrowRight size={18} />
          </button>

          <div className="itlc-core-hr-features" aria-label="Core HR features">
            {features.map((feature) => (
              <span key={feature}>
                <CheckCircle size={16} />
                {feature}
              </span>
            ))}
          </div>
        </div>

        <div className="itlc-core-hr-visual" aria-hidden="true">
          <div className="itlc-core-hr-art-bg" />
          <div className="itlc-org-panel">
            <div className="itlc-org-tabs">
              <span className="active">Employee Tree</span>
              <span>Department Tree</span>
              <span>Department Directory</span>
              <span>...</span>
            </div>

            <div className="itlc-org-board">
              <div className="itlc-org-avatar-rail">
                {['CS', 'DR', 'WC', 'JA', 'MJ', 'KB'].map((initials, index) => (
                  <span key={initials} className={index === 0 ? 'active' : ''}>{initials}</span>
                ))}
              </div>

              <div className="itlc-org-branch">
                <span className="itlc-org-count first">133</span>
                {people.map((person) => (
                  <div className={`itlc-org-person ${person.active ? 'active' : ''}`} key={person.name}>
                    <span>{person.name.split(' ').map(part => part[0]).join('')}</span>
                    <strong>{person.name}</strong>
                    <em>{person.role}</em>
                  </div>
                ))}
              </div>

              <div className="itlc-org-directory">
                <span className="itlc-org-count">38</span>
                {directory.map((person) => (
                  <div className={`itlc-org-person compact ${person.active ? 'active' : ''}`} key={person.name}>
                    <span>{person.name.split(' ').map(part => part[0]).join('')}</span>
                    <strong>{person.name}</strong>
                    <em>{person.role}</em>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="itlc-leave-card">
            <div className="itlc-leave-avatar">JA</div>
            <div>
              <strong>6097 · Jonessa Alisa</strong>
              <p>has requested for <span>Sick leave</span></p>
              <div>
                <button type="button">Approve</button>
                <button type="button">Reject</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function HrmsFeatureFaqSection() {
  const questions = [
    {
      q: 'Is ITLC HRMS useful for my company?',
      a: 'Yes. ITLC HRMS helps teams manage employee records, attendance, leave, payroll-ready data, documents, onboarding, and HR approvals from one cloud workspace.'
    },
    {
      q: 'Can I manage attendance and leave in one place?',
      a: 'Track biometric punches, mobile attendance, shift rosters, holiday calendars, and approval workflows without switching tools.'
    },
    {
      q: 'Which HRMS features are included with ITLC?',
      a: 'Core HR, employee database, document locker, recruitment, onboarding, leave, attendance, reports, and admin controls can be configured as per your plan.'
    },
    {
      q: 'Can payroll and compliance reports be prepared?',
      a: 'ITLC keeps HR data organized for payroll workflows, salary processing, statutory reports, and audit-ready records.'
    },
    {
      q: 'How do employees use ITLC HRMS?',
      a: 'Employees can access self-service tools for profile updates, leave requests, attendance visibility, documents, and notifications.'
    }
  ];

  return (
    <section className="itlc-hrms-faq-section" aria-labelledby="itlc-hrms-faq-title">
      <div className="itlc-hrms-faq-shell">
        <div className="itlc-hrms-faq-left">
          <h2 id="itlc-hrms-faq-title">
            Control all your HRMS features with ITLC
          </h2>

          <div className="itlc-hrms-faq-photo-card" aria-hidden="true">
            <img src="/mockup2.jpg" alt="" />
            <div className="itlc-hrms-mini-card">
              <strong>1,096.30</strong>
              <span>Monthly HR activities</span>
              <i />
            </div>
          </div>
        </div>

        <div className="itlc-hrms-faq-list">
          <button type="button" className="itlc-hrms-see-more">
            See More FAQs <ArrowRight size={14} />
          </button>

          {questions.map((item, index) => (
            <article className={`itlc-hrms-faq-item ${index === 0 ? 'active' : ''}`} key={item.q}>
              <span>{String(index + 1).padStart(2, '0')}.</span>
              <div>
                <h3>{item.q}</h3>
                {index === 0 && <p>{item.a}</p>}
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

function ReadyStartedSection({
  onStart,
  whatsappNumber
}: {
  onStart: () => void;
  whatsappNumber?: string;
}) {
  const waNumber = whatsappNumber || '918368817744';
  const avatars = [
    { className: 'avatar-a', src: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=180&q=80' },
    { className: 'avatar-b', src: 'https://images.unsplash.com/photo-1607746882042-944635dfe10e?auto=format&fit=crop&w=180&q=80' },
    { className: 'avatar-c', src: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=180&q=80' },
    { className: 'avatar-d', src: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=180&q=80' },
    { className: 'avatar-e', src: 'https://images.unsplash.com/photo-1531123897727-8f129e1688ce?auto=format&fit=crop&w=180&q=80' },
    { className: 'avatar-f', src: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=180&q=80' }
  ];

  return (
    <section className="itlc-ready-section" aria-labelledby="itlc-ready-title">
      {avatars.map((avatar) => (
        <img
          key={avatar.className}
          className={`itlc-ready-avatar ${avatar.className}`}
          src={avatar.src}
          alt=""
          loading="lazy"
          aria-hidden="true"
        />
      ))}

      <div className="itlc-ready-content">
        <h2 id="itlc-ready-title">Ready to get Started?</h2>
        <p>
          Start your ITLC HRMS journey with a smarter way to manage people, attendance, onboarding, payroll-ready records, and employee experiences.
        </p>
        <div className="itlc-ready-actions">
          <button type="button" onClick={onStart}>Get Started</button>
          <a
            href={`https://wa.me/${waNumber}?text=Hello%20ITLC%20Team%2C%20I%20want%20to%20learn%20more%20about%20ITLC%20HRMS`}
            target="_blank"
            rel="noreferrer"
          >
            Learn More
          </a>
        </div>
      </div>
    </section>
  );
}

export default function LandingPage({
  onOpenLogin,
  onOpenSuperowner,
  loggedInUser,
  onGoToDashboard,
  onSuccessLogin
}: LandingPageProps) {
  const [activeLandingView, setActiveLandingView] = useState<LandingView>(() => getLandingRouteState().view);


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

  // Sync clean path navigation, while keeping old hash links compatible.
  useEffect(() => {
    const syncRoute = () => {
      const path = window.location.pathname.toLowerCase().replace(/\/+$/, '') || '/';
      const hash = window.location.hash.toLowerCase();
      if (path === '/register' || hash === '#register' || hash.startsWith('#register')) {
        window.history.replaceState({}, '', '/');
        if (onOpenLogin) {
          onOpenLogin('starter', false);
        }
        return;
      }

      const routeState = getLandingRouteState();
      setActiveLandingView(routeState.view);

      if (window.location.hash) {
        const cleanPath = landingPathByView[routeState.view] || '/';
        window.history.replaceState({}, '', cleanPath);
      }
    };

    syncRoute();
    window.addEventListener('hashchange', syncRoute);
    window.addEventListener('popstate', syncRoute);
    return () => {
      window.removeEventListener('hashchange', syncRoute);
      window.removeEventListener('popstate', syncRoute);
    };
  }, [onOpenLogin]);

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

  const navigateTo = (view: LandingView) => {
    setActiveLandingView(view);
    window.history.pushState({}, '', landingPathByView[view]);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const openRegister = (planId: string = 'starter') => {
    setSelectedOnboardingPlanId(planId);
    if (onOpenLogin) {
      onOpenLogin(planId, false);
    } else {
      setShowSecureAuthModal(true);
    }
  };

  const handleAuthTrigger = () => {
    if (loggedInUser && onGoToDashboard) {
      onGoToDashboard();
    } else if (onOpenLogin) {
      onOpenLogin();
    } else {
      setShowSecureAuthModal(true);
    }
  };

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

  // 6. SUB-PAGE: LEGAL POLICIES (Terms, Privacy, Refund, Shipping, Pricing Policy)
  if (
    activeLandingView === 'terms' || 
    activeLandingView === 'privacy' || 
    activeLandingView === 'refund' || 
    activeLandingView === 'shipping' || 
    activeLandingView === 'pricing-policy'
  ) {
    return (
      <LegalPoliciesPage 
        initialPolicy={activeLandingView as PolicyType}
        onBackToHome={() => navigateTo('home')}
        onGetStarted={() => openRegister('starter')}
        onOpenSignIn={handleAuthTrigger}
        onOpenSearch={() => setShowSpotlight(true)}
        onNavigateTo={(page) => navigateTo(page as LandingView)}
        onPolicyChange={(policy) => {
          setActiveLandingView(policy);
          const path = landingPathByView[policy];
          if (path) window.history.pushState({}, '', path);
        }}
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

      <LandingHeader
        logoUrl={cmsConfig.logoUrl || '/itlc_logo.png'}
        loggedIn={Boolean(loggedInUser)}
        onHome={() => navigateTo('home')}
        onFeatures={() => navigateTo('modules')}
        onPricing={() => navigateTo('pricing')}
        onSolutions={() => navigateTo('workspaces')}
        onSecurity={() => navigateTo('security')}
        onLogin={() => onOpenLogin ? onOpenLogin() : setShowSecureAuthModal(true)}
        onGetStarted={() => openRegister('starter')}
        onDashboard={onGoToDashboard}
      />

      {/* Minimal Zoho-style hero section */}
      <section className="itlc-reference-hero" aria-labelledby="itlc-reference-hero-title">
        <div className="itlc-reference-hero-bg" />
        <div className="itlc-reference-hero-content">
          <div className="itlc-reference-copy">
            <h1 id="itlc-reference-hero-title">
              AI-first HR software
              <span>for every business</span>
            </h1>

            <p>
              Streamline all your HR processes and deliver exceptional employee experiences with ITLC India, cloud-based AI HR software that's intuitive, agile, mobile-friendly.
            </p>

            <div className="itlc-reference-cta-row">
              <button className="itlc-reference-primary" onClick={() => openRegister('starter')}>
                Sign up for free trial <ArrowRight size={30} />
              </button>
              <a
                className="itlc-reference-secondary"
                href={`https://wa.me/${cmsConfig.whatsappSalesNumber || '918368817744'}?text=Hello%20ITLC%20Team%2C%20I%20want%20a%20demo%20of%20ITLC%20HRMS`}
                target="_blank"
                rel="noreferrer"
              >
                Request Demo <ArrowRight size={30} />
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* DYNAMIC LANDING SECTIONS */}
      {landingSectionsOrder
        .filter(sec => (
          sec.enabled &&
          sec.id !== 'navbar' &&
          sec.id !== 'footer' &&
          sec.id !== 'product_showcase' &&
          sec.id !== 'pricing_plans' &&
          sec.id !== 'system_pricing' &&
          sec.type !== 'system_navbar' &&
          sec.type !== 'system_footer'
        ))
        .map((sec) => {
          switch (sec.id) {
            case 'hero_3d':
              return (
                <React.Fragment key="hero_3d">
                  <Hero3DQuantumNexus 
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
                  <HiringOnboardingSection
                    onStart={() => openRegister('starter')}
                    whatsappNumber={cmsConfig.whatsappSalesNumber}
                  />
                  <CoreHrManagementSection
                    onExplore={() => {
                      if (onOpenLogin) onOpenLogin();
                      else setShowSecureAuthModal(true);
                    }}
                  />
                  {/* Interactive Workspaces 3D Carousel Showcase */}
                  <section className="py-14 bg-gradient-to-b from-white via-slate-50 to-white border-y border-slate-200/70 relative overflow-hidden">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center mb-8">
                      <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sky-100/90 text-sky-700 text-xs font-extrabold uppercase tracking-wider mb-3">
                        <Sparkles size={14} className="text-sky-600" /> Enterprise Workspace Suite
                      </div>
                      <h2 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
                        Experience Next-Gen HRMS & Business Intelligence
                      </h2>
                      <p className="mt-2 text-slate-600 text-sm sm:text-base max-w-2xl mx-auto">
                        Explore unified employee records, live biometric attendance, Kanban pipelines, and automated payroll in an interactive 3D tour.
                      </p>
                    </div>
                    <Carousel />
                  </section>
                  <HrmsFeatureFaqSection />
                  <ReadyStartedSection
                    onStart={() => openRegister('starter')}
                    whatsappNumber={cmsConfig.whatsappSalesNumber}
                  />
                </React.Fragment>
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

      <LandingFooter 
        supportEmail={cmsConfig.supportEmail || 'support@itlc.in'} 
        companyName="ITLC India"
        onOpenSuperowner={onOpenSuperowner}
        onNavigate={navigateTo}
      />

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
                onClick={() => { setShowSpotlight(false); navigateTo('terms'); }}
                className="p-2.5 rounded-xl hover:bg-slate-50 cursor-pointer flex items-center justify-between text-slate-700 font-semibold"
              >
                <div className="flex items-center gap-2">
                  <FileText size={14} className="text-sky-600" />
                  <span>Terms & Conditions (SaaS Agreement)</span>
                </div>
                <ChevronRight size={14} className="text-slate-400" />
              </div>

              <div 
                onClick={() => { setShowSpotlight(false); navigateTo('privacy'); }}
                className="p-2.5 rounded-xl hover:bg-slate-50 cursor-pointer flex items-center justify-between text-slate-700 font-semibold"
              >
                <div className="flex items-center gap-2">
                  <ShieldCheck size={14} className="text-emerald-600" />
                  <span>Privacy Policy (DPDPA 2023 Compliant)</span>
                </div>
                <ChevronRight size={14} className="text-slate-400" />
              </div>

              <div 
                onClick={() => { setShowSpotlight(false); navigateTo('refund'); }}
                className="p-2.5 rounded-xl hover:bg-slate-50 cursor-pointer flex items-center justify-between text-slate-700 font-semibold"
              >
                <div className="flex items-center gap-2">
                  <FileText size={14} className="text-amber-600" />
                  <span>Cancellation & Refund Policy</span>
                </div>
                <ChevronRight size={14} className="text-slate-400" />
              </div>

              <div 
                onClick={() => { setShowSpotlight(false); navigateTo('shipping'); }}
                className="p-2.5 rounded-xl hover:bg-slate-50 cursor-pointer flex items-center justify-between text-slate-700 font-semibold"
              >
                <div className="flex items-center gap-2">
                  <FileText size={14} className="text-indigo-600" />
                  <span>Shipping & Delivery Policy (Digital SaaS Provisioning)</span>
                </div>
                <ChevronRight size={14} className="text-slate-400" />
              </div>

              <div 
                onClick={() => { setShowSpotlight(false); navigateTo('pricing-policy'); }}
                className="p-2.5 rounded-xl hover:bg-slate-50 cursor-pointer flex items-center justify-between text-slate-700 font-semibold"
              >
                <div className="flex items-center gap-2">
                  <FileText size={14} className="text-blue-600" />
                  <span>Pricing & Tax Invoicing Policy</span>
                </div>
                <ChevronRight size={14} className="text-slate-400" />
              </div>

              <div 
                onClick={() => { setShowSpotlight(false); openRegister('starter'); }}
                className="p-2.5 rounded-xl bg-sky-50 text-sky-700 cursor-pointer flex items-center justify-between font-bold"
              >
                <div className="flex items-center gap-2">
                  <Zap size={14} className="text-sky-600" />
                  <span>Access HRMS / Login</span>
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
