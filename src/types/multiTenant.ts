export interface TenantFeatureFlags {
  // CRM Features
  crmKanban: boolean;
  crmGstInvoicing: boolean;
  crmGpsFieldTracking: boolean;
  crmAiCopilot: boolean;
  crmWhatsAppBroadcast: boolean;
  crmReports: boolean;

  // HRMS Features
  hrmsBiometricRadar: boolean;
  hrmsGeofenceAttendance: boolean;
  hrmsPayrollPayslips: boolean;
  hrmsShiftLeaveManagement: boolean;
  hrmsAssetTraining: boolean;

  // Platform & Infrastructure
  apiWebhooks: boolean;
  customDomain: boolean;
  prioritySlaSupport: boolean;
}

export interface PaymentReceiptRecord {
  id: string; // e.g. "RCPT-8492"
  planId: string;
  planName: string;
  baseAmount: number;
  gstAmount: number;
  totalAmount: number;
  date: string; // ISO date
  renewalDate: string;
  billingCycle: 'monthly' | 'annual';
  paymentId: string;
  transactionId?: string;
  paymentMethod: string;
  status: 'paid' | 'pending' | 'failed';
  invoiceNumber: string;
}

export interface TenantCompany {
  id: string; // e.g. "TEN-101"
  name: string; // e.g. "TechNova Solutions Pvt Ltd"
  domain: string; // e.g. "technova"
  gstin?: string;
  industry: string;
  adminName: string;
  adminEmail: string;
  adminPhone: string;
  planId: 'starter' | 'growth' | 'enterprise';
  suites: ('hrms')[];
  status: 'active' | 'expiring_soon' | 'expired' | 'suspended' | 'trial';
  onboardDate: string;
  renewalDate: string;
  billingCycle: 'monthly' | 'annual';
  mrrAmount: number;
  userSeatLimit: number;
  activeUsersCount: number;
  storageLimitGb?: number;
  storageUsedGb?: number;
  lastPayment?: PaymentReceiptRecord;
  paymentHistory?: PaymentReceiptRecord[];
  features: TenantFeatureFlags;
  notes?: string;
  bypassSubscription?: boolean;
  subscriptionStatus?: string;
}

export interface SubscriptionPlanDef {
  id: 'starter' | 'growth' | 'enterprise' | string;
  name: string;
  tagline: string;
  priceMonthly: number;
  priceAnnual: number;
  defaultSuites: ('hrms')[];
  seatLimit: number;
  storageLimitGb?: number;
  badge?: string;
  highlightFeatures: string[];
  showOnLandingPage?: boolean;
}

export const defaultSubscriptionPlans: SubscriptionPlanDef[] = [
  {
    id: 'demo',
    name: 'DEMO',
    tagline: 'Ideal for small businesses and agile teams.',
    priceMonthly: 199,
    priceAnnual: 1990,
    defaultSuites: ['hrms'],
    seatLimit: 10,
    storageLimitGb: 10,
    badge: 'STARTER TIER',
    showOnLandingPage: true,
    highlightFeatures: [
      'Up to 10 Employee Seats',
      'Real-time Biometric Radar & GPS',
      'Automated GST Tax Invoicing',
      'Deals & Kanban Sales Pipeline',
      'Automated Salary Slip Generation'
    ]
  },
  {
    id: 'starter',
    name: 'STARTER',
    tagline: 'Ideal for small businesses and agile teams.',
    priceMonthly: 499,
    priceAnnual: 4990,
    defaultSuites: ['hrms'],
    seatLimit: 50,
    storageLimitGb: 50,
    badge: 'MOST POPULAR',
    showOnLandingPage: true,
    highlightFeatures: [
      'Up to 50 Employee Seats',
      'Real-time Biometric Radar & GPS',
      'Automated GST Tax Invoicing',
      'Multi-Branch Attendance Geofencing',
      'Automated 1-Click Payroll Engine'
    ]
  },
  {
    id: 'premium',
    name: 'Premium',
    tagline: 'Ideal for small businesses and agile teams.',
    priceMonthly: 999,
    priceAnnual: 9990,
    defaultSuites: ['hrms'],
    seatLimit: 100,
    storageLimitGb: 100,
    badge: 'PREMIUM & SCALING',
    showOnLandingPage: true,
    highlightFeatures: [
      'Up to 100 Employee Seats',
      'Real-time Biometric Radar & GPS',
      'Automated GST Tax Invoicing',
      'Super Owner Multi-Tenant Governance',
      'Dedicated 24/7 Priority Support'
    ]
  }
];

export const STORAGE_KEY_TAX_CONFIG = 'superowner_tax_policy_config';

export interface SuperOwnerTaxConfig {
  enabled: boolean;
  ratePercent: number; // e.g. 0, 5, 12, 18, 28
  taxLabel: string; // e.g. 'GST', 'IGST', 'VAT', 'Sales Tax'
  gstin: string; // Master Superowner / Platform GSTIN (e.g. '07AABCI8899K1Z4')
  hsnSacCode: string; // e.g. '998313'
  isTaxInclusive: boolean; // true: price already includes tax, false: tax added on top
  enableStateSplit: boolean; // split into CGST (rate/2) + SGST (rate/2)
  panNumber?: string;
  registeredLegalName?: string;
  taxInvoicePrefix?: string;
  invoiceTerms?: string;
}

export const defaultSuperOwnerTaxConfig: SuperOwnerTaxConfig = {
  enabled: true,
  ratePercent: 18,
  taxLabel: 'GST',
  gstin: '07AABCI8899K1Z4',
  hsnSacCode: '998313 (Cloud SaaS IT Services)',
  isTaxInclusive: false,
  enableStateSplit: true,
  panNumber: 'AABCI8899K',
  registeredLegalName: 'ITLC INDIA PRIVATE LIMITED',
  taxInvoicePrefix: 'INV-ITLC',
  invoiceTerms: 'Tax invoice issued under Section 31 of CGST Act, 2017. Computer generated receipt.'
};

export const getLiveSuperOwnerTaxConfig = (): SuperOwnerTaxConfig => {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      const saved = localStorage.getItem(STORAGE_KEY_TAX_CONFIG);
      if (saved) {
        return { ...defaultSuperOwnerTaxConfig, ...JSON.parse(saved) };
      }
    }
  } catch (e) {
    console.warn('Error reading tax config from storage:', e);
  }
  return defaultSuperOwnerTaxConfig;
};

export const saveLiveSuperOwnerTaxConfig = (config: SuperOwnerTaxConfig): void => {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      localStorage.setItem(STORAGE_KEY_TAX_CONFIG, JSON.stringify(config));
      window.dispatchEvent(new CustomEvent('superowner_tax_config_updated', { detail: config }));
    }
  } catch (e) {
    console.error('Error saving tax config:', e);
  }
};

export const resetSuperOwnerTaxConfig = (): SuperOwnerTaxConfig => {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      localStorage.setItem(STORAGE_KEY_TAX_CONFIG, JSON.stringify(defaultSuperOwnerTaxConfig));
      window.dispatchEvent(new CustomEvent('superowner_tax_config_updated', { detail: defaultSuperOwnerTaxConfig }));
    }
  } catch (e) {
    console.error('Error resetting tax config:', e);
  }
  return defaultSuperOwnerTaxConfig;
};

export const calculateSubscriptionMetrics = (
  tenant?: TenantCompany | null, 
  planDef?: SubscriptionPlanDef | null,
  overrideTaxConfig?: SuperOwnerTaxConfig | null
) => {
  const taxConfig = overrideTaxConfig || getLiveSuperOwnerTaxConfig();
  const taxRate = taxConfig.enabled ? (Number(taxConfig.ratePercent) || 0) : 0;

  if (!tenant) {
    const baseAmount = planDef?.priceMonthly || 1999;
    const planName = planDef?.name || 'Growth Suite';
    const storageLimitGb = planDef?.storageLimitGb || 25;
    const seatsLimit = planDef?.seatLimit || 50;

    let gstAmount = 0;
    let totalPaid = baseAmount;
    if (taxConfig.enabled && taxRate > 0) {
      if (taxConfig.isTaxInclusive) {
        gstAmount = Math.round(baseAmount - (baseAmount / (1 + taxRate / 100)));
        totalPaid = baseAmount;
      } else {
        gstAmount = Math.round(baseAmount * (taxRate / 100));
        totalPaid = baseAmount + gstAmount;
      }
    }
    const cgstAmount = taxConfig.enableStateSplit ? Math.round(gstAmount / 2) : 0;
    const sgstAmount = taxConfig.enableStateSplit ? (gstAmount - cgstAmount) : 0;
    const igstAmount = !taxConfig.enableStateSplit ? gstAmount : 0;

    return {
      daysRemaining: 24,
      totalDays: 30,
      daysElapsed: 6,
      percentageElapsed: 20,
      storageUsedGb: 3.42,
      storageLimitGb,
      storagePercent: Number(((3.42 / storageLimitGb) * 100).toFixed(1)),
      seatsUsed: 12,
      seatsLimit,
      seatsPercent: Math.round((12 / seatsLimit) * 100),
      status: 'active' as const,
      isExpired: false,
      isExpiringSoon: false,
      renewalDateFormatted: '08 Oct 2026',
      totalPaid,
      baseAmount,
      gstAmount,
      cgstAmount,
      sgstAmount,
      igstAmount,
      taxRatePercent: taxRate,
      taxLabel: taxConfig.taxLabel || 'GST',
      taxEnabled: taxConfig.enabled,
      isTaxInclusive: taxConfig.isTaxInclusive,
      taxGstin: taxConfig.gstin,
      hsnSacCode: taxConfig.hsnSacCode,
      registeredLegalName: taxConfig.registeredLegalName || 'ITLC INDIA PRIVATE LIMITED',
      taxInvoicePrefix: taxConfig.taxInvoicePrefix || 'INV-ITLC',
      invoiceTerms: taxConfig.invoiceTerms,
      planName,
      billingCycle: 'monthly' as const,
      transactionId: 'TXN-ITLC-2026-9821',
      invoiceNumber: 'INV-ITLC-2026-0042',
      paymentMethod: 'UPI / Razorpay'
    };
  }

  const now = new Date();
  const renewal = new Date(tenant.renewalDate || new Date(Date.now() + 24 * 86400000));
  const onboard = new Date(tenant.onboardDate || new Date(Date.now() - 6 * 86400000));

  const totalDurationMs = Math.max(1, renewal.getTime() - onboard.getTime());
  const elapsedMs = Math.max(0, now.getTime() - onboard.getTime());
  const remainingMs = renewal.getTime() - now.getTime();

  const totalDays = Math.round(totalDurationMs / (1000 * 60 * 60 * 24)) || (tenant.billingCycle === 'annual' ? 365 : 30);
  const daysRemaining = Math.max(0, Math.ceil(remainingMs / (1000 * 60 * 60 * 24)));
  const daysElapsed = Math.max(0, totalDays - daysRemaining);
  const percentageElapsed = Math.min(100, Math.round((daysElapsed / totalDays) * 100));

  const storageLimit = tenant.storageLimitGb || planDef?.storageLimitGb || (tenant.planId === 'starter' ? 5 : tenant.planId === 'enterprise' ? 250 : 25);
  const storageUsed = Number((tenant.storageUsedGb || 3.42).toFixed(2));
  const storagePercent = Math.min(100, Number(((storageUsed / storageLimit) * 100).toFixed(1)));

  const seatsLimit = tenant.userSeatLimit || planDef?.seatLimit || 50;
  const seatsUsed = tenant.activeUsersCount || 12;
  const seatsPercent = Math.min(100, Math.round((seatsUsed / seatsLimit) * 100));

  const isExpired = daysRemaining <= 0;
  const isExpiringSoon = daysRemaining > 0 && daysRemaining <= 5;
  const status = isExpired ? 'expired' : isExpiringSoon ? 'expiring_soon' : 'active';

  const basePrice = tenant.mrrAmount || (tenant.billingCycle === 'annual' ? planDef?.priceAnnual || 19990 : planDef?.priceMonthly || 1999);
  
  let gstAmount = 0;
  let totalPaid = basePrice;
  if (taxConfig.enabled && taxRate > 0) {
    if (taxConfig.isTaxInclusive) {
      gstAmount = Math.round(basePrice - (basePrice / (1 + taxRate / 100)));
      totalPaid = basePrice;
    } else {
      gstAmount = Math.round(basePrice * (taxRate / 100));
      totalPaid = basePrice + gstAmount;
    }
  }

  const cgstAmount = taxConfig.enableStateSplit ? Math.round(gstAmount / 2) : 0;
  const sgstAmount = taxConfig.enableStateSplit ? (gstAmount - cgstAmount) : 0;
  const igstAmount = !taxConfig.enableStateSplit ? gstAmount : 0;

  return {
    daysRemaining,
    totalDays,
    daysElapsed,
    percentageElapsed,
    storageUsedGb: storageUsed,
    storageLimitGb: storageLimit,
    storagePercent,
    seatsUsed,
    seatsLimit,
    seatsPercent,
    status,
    isExpired,
    isExpiringSoon,
    renewalDateFormatted: renewal.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }),
    totalPaid,
    baseAmount: basePrice,
    gstAmount,
    cgstAmount,
    sgstAmount,
    igstAmount,
    taxRatePercent: taxRate,
    taxLabel: taxConfig.taxLabel || 'GST',
    taxEnabled: taxConfig.enabled,
    isTaxInclusive: taxConfig.isTaxInclusive,
    taxGstin: taxConfig.gstin,
    hsnSacCode: taxConfig.hsnSacCode,
    registeredLegalName: taxConfig.registeredLegalName || 'ITLC INDIA PRIVATE LIMITED',
    taxInvoicePrefix: taxConfig.taxInvoicePrefix || 'INV-ITLC',
    invoiceTerms: taxConfig.invoiceTerms,
    planName: planDef?.name || (tenant.planId === 'starter' ? 'Starter Cloud' : tenant.planId === 'enterprise' ? 'Enterprise Master' : 'Growth Suite'),
    billingCycle: tenant.billingCycle || 'monthly',
    transactionId: tenant.lastPayment?.transactionId || `TXN-ITLC-2026-${tenant.id.replace(/\D/g, '') || '9821'}`,
    invoiceNumber: tenant.lastPayment?.invoiceNumber || `INV-ITLC-2026-${tenant.id.replace(/\D/g, '') || '0042'}`,
    paymentMethod: tenant.lastPayment?.paymentMethod || 'Razorpay / UPI'
  };
};

export const STORAGE_KEY_PLANS = 'multi_tenant_subscription_plans';
export const STORAGE_KEY_LANDING_CONFIG = 'itlc_landing_page_cms_config';

export interface LandingPageConfig {
  companyName: string;
  companyTagline: string;
  heroHeadlineEn: string;
  heroHeadlineHi: string;
  heroSubtitleEn: string;
  heroSubtitleHi: string;
  whatsappSalesNumber: string;
  supportEmail: string;
  customDomain?: string;
  primaryColor?: string;
  accentColor?: string;
  fontFamily?: string;
  logoUrl?: string;
  faviconUrl?: string;
  orbitCenterTitle: string;
  orbitCenterSubtitle: string;
  orbitSyncBadge: string;
  telemetry: {
    activePipelines: number;
    biometricPunches: number;
    invoicesCleared: number;
  };
}

export const defaultLandingPageConfig: LandingPageConfig = {
  companyName: 'ITLC INDIA PVT LTD',
  companyTagline: 'Unified Business & Workforce Operating System',
  heroHeadlineEn: 'Build a Better Workplace with Unified HRMS & Intelligent Sales Cloud',
  heroHeadlineHi: 'Build a Better Workplace with Unified HRMS & Intelligent Sales Cloud',
  heroSubtitleEn: 'People • Process • Growth — Streamline employee onboarding, live biometric attendance, 1-click automated payroll in one living 3D ecosystem.',
  heroSubtitleHi: 'People • Process • Growth — Streamline employee onboarding, live biometric attendance, 1-click automated payroll in one living 3D ecosystem.',
  whatsappSalesNumber: '9532341000',
  supportEmail: 'support@itlc.in',
  customDomain: 'https://yourdomain.com',
  primaryColor: '#2563eb',
  accentColor: '#0284c7',
  fontFamily: 'Inter, sans-serif',
  logoUrl: '/itlc_logo.png',
  faviconUrl: '/favicon.ico',
  orbitCenterTitle: 'ITLC Ecosystem',
  orbitCenterSubtitle: 'Unified OS Engine',
  orbitSyncBadge: '2 APPS SYNCED',
  telemetry: {
    activePipelines: 1420,
    biometricPunches: 12480,
    invoicesCleared: 8930
  }
};

export const getLiveLandingPageConfig = (): LandingPageConfig => {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      const saved = localStorage.getItem(STORAGE_KEY_LANDING_CONFIG);
      if (saved) {
        return { ...defaultLandingPageConfig, ...JSON.parse(saved) };
      }
    }
  } catch (e) {
    console.warn('Error reading landing page config from storage:', e);
  }
  return defaultLandingPageConfig;
};

export const saveLiveLandingPageConfig = (config: LandingPageConfig): void => {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      localStorage.setItem(STORAGE_KEY_LANDING_CONFIG, JSON.stringify(config));
      window.dispatchEvent(new CustomEvent('landing_page_config_updated', { detail: config }));
    }
  } catch (e) {
    console.error('Error saving landing page config:', e);
  }
};

export const resetLandingPageConfig = (): LandingPageConfig => {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      localStorage.setItem(STORAGE_KEY_LANDING_CONFIG, JSON.stringify(defaultLandingPageConfig));
      window.dispatchEvent(new CustomEvent('landing_page_config_updated', { detail: defaultLandingPageConfig }));
    }
  } catch (e) {
    console.error('Error resetting landing page config:', e);
  }
  return defaultLandingPageConfig;
};

export const STORAGE_KEY_SECTIONS = 'itlc_landing_sections_order';

export interface CustomLandingSection {
  id: string;
  name: string;
  nameHi?: string;
  description: string;
  descriptionHi?: string;
  icon?: string;
  color: string;
  previewNote: string;
  enabled: boolean;
  isSystem?: boolean;
  type: 'system_navbar' | 'system_hero' | 'system_orbit' | 'system_showcase' | 'system_pricing' | 'system_footer' | 'cta_banner' | 'video_embed' | 'feature_grid' | 'how_it_works' | 'testimonials' | 'faq_accordion' | 'custom_html';
  badgeText?: string;
  buttonText?: string;
  buttonUrl?: string;
  secondaryButtonText?: string;
  secondaryButtonUrl?: string;
  mediaUrl?: string;
  customHtml?: string;
  customFeatures?: Array<{ title: string; desc: string; icon?: string }>;
}

export const DEFAULT_LANDING_SECTIONS: CustomLandingSection[] = [
  {
    id: 'navbar',
    name: 'Navbar',
    description: 'Logo, navigation menu and CTA buttons',
    icon: 'Layout',
    color: '#3b82f6',
    previewNote: 'Top header with brand logo, interactive page links and Sign Up CTA',
    enabled: true,
    isSystem: true,
    type: 'system_navbar'
  },
  {
    id: 'hero_3d',
    name: 'Hero Section',
    description: 'Main heading, subheading and 3D visual preview',
    icon: 'Tv',
    color: '#2563eb',
    previewNote: 'Main hero presentation with dynamic headlines and 3D preview',
    enabled: true,
    isSystem: true,
    type: 'system_hero',
    badgeText: '✨ NEXT GEN CLOUD',
    buttonText: 'Get Started Free',
    buttonUrl: '#register',
    secondaryButtonText: 'Watch Demo',
    secondaryButtonUrl: '#workspaces'
  },
  {
    id: 'ecosystem_orbit',
    name: 'Ecosystem Orbit',
    description: 'Dynamic rotating orbit showcasing OmniStaff Enterprise HRMS with live metrics',
    icon: 'Sparkles',
    color: '#7c3aed',
    previewNote: 'Interactive 360-degree orbital view of connected flagship apps with live feature checklists',
    enabled: true,
    isSystem: true,
    type: 'system_orbit',
    badgeText: '🌌 CONNECTED ECOSYSTEM'
  },
  {
    id: 'product_showcase',
    name: 'Product Screen Showcase',
    description: 'Interactive live browser simulator exploring HRMS and Super Admin screens',
    icon: 'LayoutTemplate',
    color: '#0284c7',
    previewNote: 'Realistic interactive browser simulator with live telemetry metrics and animated gradient cards',
    enabled: true,
    isSystem: true,
    type: 'system_showcase',
    badgeText: '💻 LIVE PRODUCT SCREENS'
  },
  {
    id: 'pricing_plans',
    name: 'Pricing Section',
    description: 'Transparent plans, pricing tiers and billing cycles',
    icon: 'CreditCard',
    color: '#059669',
    previewNote: 'Transparent pricing tiers (Starter, Growth, Enterprise) with instant onboarding',
    enabled: true,
    isSystem: true,
    type: 'system_pricing',
    badgeText: '💎 TRANSPARENT PRICING'
  },
  {
    id: 'footer',
    name: 'Footer',
    description: 'Links, contact information, social media and copyright',
    icon: 'Layers',
    color: '#475569',
    previewNote: '4-column comprehensive footer with SSL badges and WhatsApp desk link',
    enabled: true,
    isSystem: true,
    type: 'system_footer'
  }
];

export const getLiveLandingSections = (): CustomLandingSection[] => {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      const saved = localStorage.getItem(STORAGE_KEY_SECTIONS);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          const validSystemIds = new Set(DEFAULT_LANDING_SECTIONS.map(d => d.id));
          const filtered = parsed.filter((item: any) => item && (validSystemIds.has(item.id) || (typeof item.id === 'string' && item.id.startsWith('custom_'))));

          const merged = filtered.map((item: any) => {
            const def = DEFAULT_LANDING_SECTIONS.find(d => d.id === item.id) || item;
            return {
              ...def,
              ...item
            };
          });

          // Guarantee that all default system sections exist
          DEFAULT_LANDING_SECTIONS.forEach(defSec => {
            const exists = merged.some(m => m.id === defSec.id);
            if (!exists) {
              merged.push(defSec);
            }
          });

          return merged;
        }
      }
    }
  } catch (e) {
    console.warn('Error reading landing sections from storage:', e);
  }
  return DEFAULT_LANDING_SECTIONS;
};

export const saveLiveLandingSections = (sections: CustomLandingSection[]): void => {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      localStorage.setItem(STORAGE_KEY_SECTIONS, JSON.stringify(sections));
      window.dispatchEvent(new CustomEvent('landing_page_config_updated', { detail: sections }));
    }
  } catch (e) {
    console.error('Error saving landing sections:', e);
  }
};

export const resetLandingSections = (): CustomLandingSection[] => {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      localStorage.setItem(STORAGE_KEY_SECTIONS, JSON.stringify(DEFAULT_LANDING_SECTIONS));
      window.dispatchEvent(new CustomEvent('landing_page_config_updated', { detail: DEFAULT_LANDING_SECTIONS }));
    }
  } catch (e) {
    console.error('Error resetting landing sections:', e);
  }
  return DEFAULT_LANDING_SECTIONS;
};

export const getLiveSubscriptionPlans = (): SubscriptionPlanDef[] => {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      let deletedPlanIds = new Set<string>();
      try {
        const deletedRaw = localStorage.getItem('hrms_deleted_plan_ids');
        if (deletedRaw) {
          const parsed = JSON.parse(deletedRaw);
          if (Array.isArray(parsed)) {
            parsed.forEach(id => {
              if (id) {
                deletedPlanIds.add(String(id).toLowerCase());
                deletedPlanIds.add(String(id).toLowerCase().replace(/[^a-z0-9]/g, ''));
              }
            });
          }
        }
      } catch {}

      const isNotDeleted = (p: any) => {
        if (!p || !p.id) return false;
        const idLower = String(p.id).toLowerCase();
        const nameLower = String(p.name || '').toLowerCase();
        return !deletedPlanIds.has(idLower) && 
               !deletedPlanIds.has(idLower.replace(/[^a-z0-9]/g, '')) &&
               !deletedPlanIds.has(nameLower);
      };

      const hrmsRaw = localStorage.getItem('hrms_subscription_plans');
      if (hrmsRaw) {
        try {
          const parsed = JSON.parse(hrmsRaw);
          if (Array.isArray(parsed) && parsed.length > 0) {
            return parsed
              .filter((p: any) => isNotDeleted(p) && p.id !== 'free_trial')
              .map((hp: any) => convertHrmsPlanToDef(hp));
          }
        } catch {}
      }

      const unifiedRaw = localStorage.getItem(STORAGE_KEY_PLANS);
      if (unifiedRaw) {
        try {
          const parsed = JSON.parse(unifiedRaw);
          if (Array.isArray(parsed) && parsed.length > 0) {
            return parsed.filter(isNotDeleted);
          }
        } catch {}
      }

      return defaultSubscriptionPlans.filter(isNotDeleted);
    }
  } catch (e) {
    console.warn('Error reading subscription plans from storage:', e);
  }
  return defaultSubscriptionPlans;
};

export const saveLiveSubscriptionPlans = (plans: SubscriptionPlanDef[]): void => {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      const unifiedStr = JSON.stringify(plans);
      const prevUnified = localStorage.getItem(STORAGE_KEY_PLANS);

      // Also sync back to hrms_subscription_plans format
      const hrmsPlans = plans.map(p => ({
        id: p.id,
        name: p.name,
        price: p.priceMonthly,
        priceMonthly: p.priceMonthly,
        priceAnnual: p.priceAnnual,
        employeeLimit: p.seatLimit,
        storageLimit: p.storageLimitGb || (p.seatLimit ? p.seatLimit : 20),
        aiCreditsLimit: 500,
        showOnLandingPage: p.showOnLandingPage !== false,
        tagline: p.tagline,
        badge: p.badge,
        highlightFeatures: p.highlightFeatures,
        features: {
          payroll: true,
          attendance: true,
          gpsAttendance: true,
          faceRecognition: true,
          recruitment: true,
          apiAccess: true,
          whiteLabel: true
        }
      }));
      const hrmsStr = JSON.stringify(hrmsPlans);
      const prevHrms = localStorage.getItem('hrms_subscription_plans');

      if (prevUnified !== unifiedStr || prevHrms !== hrmsStr) {
        localStorage.setItem(STORAGE_KEY_PLANS, unifiedStr);
        localStorage.setItem('hrms_subscription_plans', hrmsStr);
        window.dispatchEvent(new CustomEvent('subscription_plans_updated', { detail: plans }));
        window.dispatchEvent(new Event('storage'));
      }
    }
  } catch (e) {
    console.error('Error saving subscription plans:', e);
  }
};

export const resetSubscriptionPlans = (): SubscriptionPlanDef[] => {
  saveLiveSubscriptionPlans(defaultSubscriptionPlans);
  return defaultSubscriptionPlans;
};

export const convertHrmsPlanToDef = (plan: any): SubscriptionPlanDef => {
  const monthlyInr = Number(plan.priceMonthly) || Number(plan.price) || 0;
  const annualInr = Number(plan.priceAnnual) || Math.round(monthlyInr * 10);
  
  const feats: string[] = [];
  if (Array.isArray(plan.highlightFeatures) && plan.highlightFeatures.length > 0) {
    feats.push(...plan.highlightFeatures);
  } else if (plan.features) {
    if (plan.features.payroll) feats.push('Automated 1-Click Salary Slips & Payroll');
    if (plan.features.attendance) feats.push('Live Biometric & Shift Attendance');
    if (plan.features.gpsAttendance) feats.push('GPS Geofenced Field Meetings');
    if (plan.features.faceRecognition) feats.push('Face Recognition AI Radar');
    if (plan.features.recruitment) feats.push('Recruitment & Talent Pipeline');
    if (plan.features.apiAccess) feats.push('REST Webhook APIs & Integrations');
    if (plan.features.whiteLabel) feats.push('White Labeling & Custom Brand Portal');
  }
  if (feats.length === 0) {
    feats.push(`Up to ${plan.employeeLimit || plan.seatLimit || 50} Employee Seats`, 'Real-time Biometric Radar & GPS', 'Automated GST Tax Invoicing');
  }

  return {
    id: plan.id,
    name: plan.name,
    tagline: plan.tagline || `${plan.name} plan for seamless organization growth.`,
    priceMonthly: monthlyInr,
    priceAnnual: annualInr,
    defaultSuites: ['hrms'],
    seatLimit: plan.employeeLimit || plan.seatLimit || 50,
    storageLimitGb: plan.storageLimit || plan.storageLimitGb || (plan.employeeLimit ? plan.employeeLimit : 20),
    badge: plan.badge,
    showOnLandingPage: plan.showOnLandingPage !== false,
    highlightFeatures: feats
  };
};

export const syncHrmsPlansListToUnifiedCatalog = (hrmsPlans: any[]): void => {
  try {
    if (!Array.isArray(hrmsPlans)) return;
    
    // Directly and strictly map the active plans from HRMS (no resurrecting deleted default plans)
    const updatedUnified: SubscriptionPlanDef[] = hrmsPlans
      .filter(hp => hp && hp.id !== 'free_trial')
      .map(hp => convertHrmsPlanToDef(hp));

    // Save strictly to both keys without extra fallback merging
    if (typeof window !== 'undefined' && window.localStorage) {
      const hrmsStr = JSON.stringify(hrmsPlans);
      const unifiedStr = JSON.stringify(updatedUnified);
      const prevHrms = localStorage.getItem('hrms_subscription_plans');
      const prevUnified = localStorage.getItem(STORAGE_KEY_PLANS);

      if (prevHrms !== hrmsStr || prevUnified !== unifiedStr) {
        localStorage.setItem('hrms_subscription_plans', hrmsStr);
        localStorage.setItem(STORAGE_KEY_PLANS, unifiedStr);
        window.dispatchEvent(new CustomEvent('subscription_plans_updated', { detail: updatedUnified }));
        window.dispatchEvent(new Event('storage'));
      }
    }
  } catch (e) {
    console.error('Error syncing HRMS plans to unified catalog:', e);
  }
};

export const syncCompanySubscriptionChange = (updateData: {
  companyId?: string;
  companyName?: string;
  email?: string;
  planId: string;
  password?: string;
  adminPassword?: string;
  status?: 'active' | 'expiring_soon' | 'expired' | 'suspended' | 'trial';
  billingCycle?: 'monthly' | 'annual';
  maxSeats?: number;
  renewalDate?: string;
  storageLimitGb?: number;
  notes?: string;
  bypassSubscription?: boolean;
}): void => {
  try {
    if (typeof window === 'undefined' || !window.localStorage) return;

    // Check deletion blacklist
    let deletedIds = new Set<string>();
    try {
      const deletedIdsRaw = localStorage.getItem('hrms_deleted_company_ids');
      if (deletedIdsRaw) {
        const parsed = JSON.parse(deletedIdsRaw);
        if (Array.isArray(parsed)) deletedIds = new Set(parsed);
      }
    } catch {}

    if (updateData.companyId && deletedIds.has(updateData.companyId)) {
      return; // Do not resurrect or update deleted company
    }

    // 1. Update in itlc_multi_tenants
    const savedTenants = localStorage.getItem('itlc_multi_tenants');
    let tenantsList: TenantCompany[] = [];
    if (savedTenants !== null) {
      try {
        const parsed = JSON.parse(savedTenants);
        if (Array.isArray(parsed)) tenantsList = parsed.filter(t => t && t.id && !deletedIds.has(t.id));
      } catch {}
    } else if (deletedIds.size === 0) {
      tenantsList = [...initialSeedTenants];
    }

    const normalizedPlanId = (updateData.planId === 'professional' ? 'growth' : updateData.planId) as any;
    const credPass = updateData.password || updateData.adminPassword;

    let matched = false;
    tenantsList = tenantsList.map(t => {
      if (
        (updateData.companyId && t.id === updateData.companyId) ||
        (updateData.email && t.adminEmail.toLowerCase() === updateData.email.toLowerCase()) ||
        (updateData.companyName && t.name.toLowerCase() === updateData.companyName.toLowerCase())
      ) {
        matched = true;
        return {
          ...t,
          password: credPass || (t as any).password,
          adminPassword: credPass || (t as any).adminPassword,
          planId: normalizedPlanId || t.planId,
          status: updateData.status || (updateData.bypassSubscription ? 'active' : t.status),
          bypassSubscription: updateData.bypassSubscription !== undefined ? updateData.bypassSubscription : t.bypassSubscription,
          subscriptionStatus: updateData.bypassSubscription ? 'active' : (t.subscriptionStatus || 'active'),
          billingCycle: updateData.billingCycle || t.billingCycle,
          userSeatLimit: updateData.maxSeats || t.userSeatLimit,
          renewalDate: updateData.renewalDate || t.renewalDate,
          storageLimitGb: updateData.storageLimitGb || t.storageLimitGb,
          notes: updateData.notes || t.notes
        };
      }
      return t;
    });

    if (!matched && updateData.companyName) {
      // Create new tenant entry if not found
      const newTenant: TenantCompany = {
        id: updateData.companyId || `TEN-${Date.now()}`,
        name: updateData.companyName,
        domain: updateData.companyName.toLowerCase().replace(/[^a-z0-9]/g, ''),
        industry: 'General Enterprise',
        adminName: updateData.companyName + ' Admin',
        adminEmail: updateData.email || 'admin@' + updateData.companyName.toLowerCase().replace(/[^a-z0-9]/g, '') + '.com',
        adminPhone: '+91 98765 43210',
        planId: normalizedPlanId || 'growth',
        suites: ['hrms'],
        status: updateData.status || 'active',
        onboardDate: new Date().toISOString().split('T')[0],
        renewalDate: updateData.renewalDate || new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0],
        billingCycle: updateData.billingCycle || 'monthly',
        mrrAmount: normalizedPlanId === 'enterprise' ? 4999 : normalizedPlanId === 'starter' ? 999 : 1999,
        userSeatLimit: updateData.maxSeats || 50,
        activeUsersCount: 1,
        features: {
          crmKanban: true,
          crmGstInvoicing: true,
          crmGpsFieldTracking: true,
          crmAiCopilot: normalizedPlanId === 'enterprise',
          crmWhatsAppBroadcast: true,
          crmReports: true,
          hrmsBiometricRadar: true,
          hrmsGeofenceAttendance: true,
          hrmsPayrollPayslips: true,
          hrmsShiftLeaveManagement: true,
          hrmsAssetTraining: true,
          apiWebhooks: normalizedPlanId === 'enterprise',
          customDomain: normalizedPlanId === 'enterprise',
          prioritySlaSupport: normalizedPlanId !== 'starter'
        }
      };
      if (credPass) {
        (newTenant as any).password = credPass;
        (newTenant as any).adminPassword = credPass;
      }
      tenantsList.unshift(newTenant);
    }

    localStorage.setItem('itlc_multi_tenants', JSON.stringify(tenantsList));

    // Also sync to itlc_registered_users
    try {
      const savedUsers = localStorage.getItem('itlc_registered_users');
      const userList = savedUsers ? JSON.parse(savedUsers) : [];
      if (updateData.email) {
        const uIdx = userList.findIndex((u: any) => u.email?.toLowerCase() === updateData.email?.toLowerCase() || (updateData.companyId && u.companyId === updateData.companyId));
        const userEntry = {
          email: updateData.email,
          password: credPass || (uIdx >= 0 ? userList[uIdx].password : 'Admin@123'),
          name: updateData.companyName ? `${updateData.companyName} Admin` : 'Admin User',
          companyId: updateData.companyId,
          companyName: updateData.companyName,
          role: 'Company Admin',
          planId: updateData.planId,
          status: updateData.status || 'active'
        };
        if (uIdx >= 0) {
          userList[uIdx] = { ...userList[uIdx], ...userEntry };
        } else {
          userList.unshift(userEntry);
        }
        localStorage.setItem('itlc_registered_users', JSON.stringify(userList));
      }
    } catch (e) {}

    // 2. Update active tenant if matching
    const activeTenantSaved = localStorage.getItem('itlc_active_tenant');
    if (activeTenantSaved) {
      try {
        const activeT = JSON.parse(activeTenantSaved);
        if (
          (updateData.companyId && activeT.id === updateData.companyId) ||
          (updateData.email && activeT.adminEmail?.toLowerCase() === updateData.email.toLowerCase()) ||
          (updateData.companyName && activeT.name?.toLowerCase() === updateData.companyName.toLowerCase())
        ) {
          const updatedActive = {
            ...activeT,
            planId: normalizedPlanId || activeT.planId,
            status: updateData.status || (updateData.bypassSubscription ? 'active' : activeT.status),
            bypassSubscription: updateData.bypassSubscription !== undefined ? updateData.bypassSubscription : activeT.bypassSubscription,
            subscriptionStatus: updateData.bypassSubscription ? 'active' : (activeT.subscriptionStatus || 'active'),
            userSeatLimit: resolvedSeats,
            maxEmployees: resolvedSeats,
            seatLimit: resolvedSeats,
            storageLimitGb: resolvedStorageLimit,
            storageLimit: resolvedStorageLimit
          };
          localStorage.setItem('itlc_active_tenant', JSON.stringify(updatedActive));
        }
      } catch (e) {}
    }

    // 3. Update hrms_user_profile if matching
    const hrmsProfile = localStorage.getItem('hrms_user_profile');
    if (hrmsProfile) {
      try {
        const hp = JSON.parse(hrmsProfile);
        const isTargetCompany = 
          hp.role !== 'Super Owner' && (
            (targetCompanyId && (hp.companyId === targetCompanyId || hp.companyDetails?.id === targetCompanyId)) ||
            (targetEmail && hp.email?.toLowerCase() === targetEmail.toLowerCase()) ||
            (targetCompanyName && (hp.companyName?.toLowerCase() === targetCompanyName.toLowerCase() || hp.companyDetails?.name?.toLowerCase() === targetCompanyName.toLowerCase()))
          );
        if (isTargetCompany) {
          hp.subscriptionPlanId = normalizedPlanId;
          hp.subscriptionPlan = normalizedPlanId;
          if (targetCompanyId) hp.companyId = targetCompanyId;
          if (targetCompanyName) hp.companyName = targetCompanyName;
          if (updateData.status) hp.subscriptionStatus = updateData.status;
          if (updateData.bypassSubscription !== undefined) {
            hp.bypassSubscription = updateData.bypassSubscription;
            if (updateData.bypassSubscription) {
              hp.subscriptionStatus = 'active';
            }
          }
          hp.companyDetails = {
            ...(hp.companyDetails || {}),
            id: targetCompanyId || hp.companyId || hp.companyDetails?.id,
            name: targetCompanyName || hp.companyName || hp.companyDetails?.name,
            subscriptionPlanId: normalizedPlanId,
            storageLimit: resolvedStorageLimit,
            storageLimitGb: resolvedStorageLimit,
            maxEmployees: resolvedSeats,
            seatLimit: resolvedSeats,
            userSeatLimit: resolvedSeats,
            bypassSubscription: updateData.bypassSubscription !== undefined ? updateData.bypassSubscription : hp.companyDetails?.bypassSubscription,
            status: updateData.bypassSubscription ? 'active' : (updateData.status || hp.companyDetails?.status || 'active')
          };
          localStorage.setItem('hrms_user_profile', JSON.stringify(hp));
        }
      } catch (e) {}
    }

    // 4. Update hrms_companies_data for Super Owner registry
    try {
      const savedCompanies = localStorage.getItem('hrms_companies_data');
      if (savedCompanies) {
        const compList = JSON.parse(savedCompanies);
        if (Array.isArray(compList)) {
          let compMatched = false;
          const updatedCompList = compList.map((c: any) => {
            if (
              (updateData.companyId && c.id === updateData.companyId) ||
              (updateData.email && c.email?.toLowerCase() === updateData.email.toLowerCase()) ||
              (updateData.companyName && c.name?.toLowerCase() === updateData.companyName.toLowerCase())
            ) {
              compMatched = true;
              return {
                ...c,
                subscriptionPlanId: updateData.planId || c.subscriptionPlanId,
                status: updateData.status || c.status,
                employeesCount: updateData.maxSeats || c.employeesCount
              };
            }
            return c;
          });

          if (!compMatched && updateData.companyName) {
            updatedCompList.unshift({
              id: updateData.companyId || `comp_${Date.now()}`,
              name: updateData.companyName,
              logo: 'https://images.unsplash.com/photo-1560179707-f14e90ef3623?w=100&auto=format&fit=crop&q=80',
              ownerName: updateData.companyName + ' Admin',
              email: updateData.email || 'admin@' + updateData.companyName.toLowerCase().replace(/[^a-z0-9]/g, '') + '.com',
              phone: '+91 98765 43210',
              employeesCount: updateData.maxSeats || 50,
              subscriptionPlanId: updateData.planId,
              storageUsed: 0.5,
              status: updateData.status || 'active',
              createdDate: new Date().toISOString().split('T')[0],
              modulesEnabled: {
                attendance: true, leave: true, payroll: true, recruitment: true,
                performance: true, assets: true, training: true, aiReports: true,
                chat: true, projects: true, faceRecognition: true, gpsTracking: true,
                mobileApp: true, api: true, whiteLabel: false
              }
            });
          }

          localStorage.setItem('hrms_companies_data', JSON.stringify(updatedCompList));
        }
      }
    } catch (e) {}

    // Dispatch global event
    window.dispatchEvent(new CustomEvent('subscription_plans_updated'));
    window.dispatchEvent(new CustomEvent('superowner_data_updated'));
  } catch (error) {
    console.error('Failed to sync company subscription changes:', error);
  }
};

export const initialSeedTenants: TenantCompany[] = [
  {
    id: 'TEN-485',
    name: 'Pushkar Enterprises & Solutions',
    domain: 'pushkarsolutions',
    gstin: '09AABCP2630P1Z1',
    industry: 'IT & Enterprise Services',
    adminName: 'Priyanshu Pushkar',
    adminEmail: 'priyanshupushkar263@gmail.com',
    adminPhone: '+91 95323 41000',
    planId: 'growth',
    suites: ['hrms'],
    status: 'active',
    onboardDate: '2026-09-01',
    renewalDate: '2026-10-01',
    billingCycle: 'monthly',
    mrrAmount: 1999,
    userSeatLimit: 50,
    activeUsersCount: 1,
    features: {
      crmKanban: true,
      crmGstInvoicing: true,
      crmGpsFieldTracking: true,
      crmAiCopilot: true,
      crmWhatsAppBroadcast: true,
      crmReports: true,
      hrmsBiometricRadar: true,
      hrmsGeofenceAttendance: true,
      hrmsPayrollPayslips: true,
      hrmsShiftLeaveManagement: true,
      hrmsAssetTraining: true,
      apiWebhooks: true,
      customDomain: true,
      prioritySlaSupport: true
    },
    notes: 'Registered corporate company workspace.'
  }
];
