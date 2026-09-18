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
  suites: ('crm' | 'hrms')[];
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
}

export interface SubscriptionPlanDef {
  id: 'starter' | 'growth' | 'enterprise' | string;
  name: string;
  tagline: string;
  priceMonthly: number;
  priceAnnual: number;
  defaultSuites: ('crm' | 'hrms')[];
  seatLimit: number;
  storageLimitGb?: number;
  badge?: string;
  highlightFeatures: string[];
  showOnLandingPage?: boolean;
  trialDays?: number;
}

export const defaultSubscriptionPlans: SubscriptionPlanDef[] = [
  {
    id: 'demo',
    name: 'demo',
    tagline: 'Enterprise plan',
    priceMonthly: 1,
    priceAnnual: 10,
    defaultSuites: ['crm', 'hrms'],
    seatLimit: 5,
    storageLimitGb: 2,
    badge: 'ACTIVE PLAN',
    showOnLandingPage: true,
    highlightFeatures: [
      'Up to 5 Employee Seats',
      'Real-time Biometric Radar & GPS',
      'Automated GST Tax Invoicing',
      'Automated 1-Click Payroll Engine'
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
  platformBrand?: string;
  registeredAddress?: string;
  supportEmail?: string;
  supportPhone?: string;
  signatoryName?: string;
  signatoryTitle?: string;
  taxInvoicePrefix?: string;
  placeOfSupply?: string;
  invoiceTerms?: string;
  signatureImageUrl?: string; // Base64 data URL or HTTP image URL of signature / stamp
  // Visibility toggles (what to show/hide on slip)
  showGstin?: boolean;
  showPan?: boolean;
  showSac?: boolean;
  showAddress?: boolean;
  showQrCode?: boolean;
  showSignatory?: boolean;
  showAmountInWords?: boolean;
  showTerms?: boolean;
  showFeatures?: boolean;
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
  registeredLegalName: 'ITLC Software Technologies Pvt Ltd',
  platformBrand: 'ITLC ENTERPRISE HRMS',
  registeredAddress: 'Sector G1/0049, Olive Wood Villa, Sushant Golf City, Lucknow, 226030, India',
  supportEmail: 'support@itlcindia.com',
  supportPhone: '+91 9532341000',
  signatoryName: 'Priya Sharma',
  signatoryTitle: 'Authorized Signatory',
  taxInvoicePrefix: 'INV-2026',
  placeOfSupply: '07 - Delhi / NCR (Intra-State)',
  invoiceTerms: 'This invoice is issued electronically under Rule 48 of the CGST Rules, 2017. Digital verification requires no physical stamp. Valid for Input Tax Credit (ITC).',
  signatureImageUrl: '',
  showGstin: true,
  showPan: true,
  showSac: true,
  showAddress: true,
  showQrCode: true,
  showSignatory: true,
  showAmountInWords: true,
  showTerms: true,
  showFeatures: true
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

  const planKey = (tenant.planId || '').toLowerCase();
  const storageLimit = tenant.storageLimitGb || planDef?.storageLimitGb || (planKey.includes('demo') ? 10 : planKey.includes('premium') || planKey.includes('enterprise') ? 100 : 50);
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
  heroSubtitleEn: 'People • Process • Growth — Streamline employee onboarding, live biometric attendance, 1-click automated payroll, and visual Sales CRM in one living 3D ecosystem.',
  heroSubtitleHi: 'People • Process • Growth — Streamline employee onboarding, live biometric attendance, 1-click automated payroll, and visual Sales CRM in one living 3D ecosystem.',
  whatsappSalesNumber: '9532341000',
  supportEmail: 'support@itlcindia.com',
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
    description: 'Dynamic rotating orbit showcasing ITLC Sales CRM & OmniStaff HRMS with live metrics',
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
    description: 'Interactive live browser simulator exploring HRMS, Sales CRM and Super Admin screens',
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
      window.dispatchEvent(new CustomEvent('landing_sections_updated', { detail: sections }));
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
      window.dispatchEvent(new CustomEvent('landing_sections_updated', { detail: DEFAULT_LANDING_SECTIONS }));
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
        return !deletedPlanIds.has(idLower) && 
               !deletedPlanIds.has(idLower.replace(/[^a-z0-9]/g, ''));
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
  const seats = Number(plan.seatLimit || plan.employeeLimit || 50);
  const storageGb = Number(plan.storageLimitGb || plan.storageLimit || (seats ? seats : 20));
  
  const feats: string[] = [];
  if (Array.isArray(plan.highlightFeatures) && plan.highlightFeatures.length > 0) {
    feats.push(...plan.highlightFeatures);
  } else {
    feats.push(`Up to ${seats === 99999 ? 'Unlimited' : seats} Employee Seats`);
    feats.push(`${storageGb} GB Cloud Storage`);
    if (plan.features) {
      if (plan.features.attendance) feats.push('Live Biometric & Shift Attendance');
      if (plan.features.payroll) feats.push('Automated 1-Click Salary Slips & Payroll');
      if (plan.features.gpsAttendance) feats.push('GPS Geofenced Field Meetings');
      if (plan.features.faceRecognition) feats.push('Face Recognition AI Radar');
      if (plan.features.recruitment) feats.push('Recruitment & Talent Pipeline');
      if (plan.features.apiAccess) feats.push('REST Webhook APIs & Integrations');
      if (plan.features.whiteLabel) feats.push('White Labeling & Custom Brand Portal');
    }
    feats.push('Automated GST Tax Invoicing');
  }

  return {
    id: plan.id,
    name: plan.name,
    tagline: plan.tagline || `${plan.name} tier for seamless organization growth.`,
    priceMonthly: monthlyInr,
    priceAnnual: annualInr,
    defaultSuites: ['crm', 'hrms'],
    seatLimit: seats,
    storageLimitGb: storageGb,
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
    const storage = (typeof window !== 'undefined' && window.localStorage) 
      ? window.localStorage 
      : (typeof localStorage !== 'undefined' ? localStorage : null);

    if (storage) {
      const hrmsStr = JSON.stringify(hrmsPlans);
      const unifiedStr = JSON.stringify(updatedUnified);
      const prevHrms = storage.getItem('hrms_subscription_plans');
      const prevUnified = storage.getItem(STORAGE_KEY_PLANS);

      // Prevent redundant storage writes and infinite re-render loops
      if (prevHrms === hrmsStr && prevUnified === unifiedStr) {
        return;
      }

      storage.setItem('hrms_subscription_plans', hrmsStr);
      storage.setItem(STORAGE_KEY_PLANS, unifiedStr);
      if (typeof window !== 'undefined' && window.dispatchEvent) {
        try {
          window.dispatchEvent(new CustomEvent('subscription_plans_updated', { detail: updatedUnified }));
        } catch {}
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
}): void => {
  try {
    if (typeof window === 'undefined' || !window.localStorage) return;

    // Check deletion blacklist
    let deletedIds = new Set<string>();
    try {
      const deletedIdsRaw = localStorage.getItem('hrms_deleted_company_ids');
      if (deletedIdsRaw) {
        const parsed = JSON.parse(deletedIdsRaw);
        if (Array.isArray(parsed)) {
          parsed.forEach((x: any) => {
            if (typeof x === 'string') deletedIds.add(x.toLowerCase().trim());
            else if (x?.id) deletedIds.add(String(x.id).toLowerCase().trim());
            if (x?.email) deletedIds.add(String(x.email).toLowerCase().trim());
          });
        }
      }
    } catch {}

    const targetCompId = String(updateData.companyId || '').toLowerCase().trim();
    const targetUpdateEmail = String(updateData.email || '').toLowerCase().trim();
    if ((targetCompId && deletedIds.has(targetCompId)) || (targetUpdateEmail && deletedIds.has(targetUpdateEmail))) {
      return; // STRICT SECURITY: Do not resurrect or update deleted company
    }

    // 1. Update in itlc_multi_tenants
    const savedTenants = localStorage.getItem('itlc_multi_tenants');
    let tenantsList: TenantCompany[] = [];
    if (savedTenants !== null) {
      try {
        const parsed = JSON.parse(savedTenants);
        if (Array.isArray(parsed)) tenantsList = parsed.filter(t => t && t.id && !deletedIds.has(t.id));
      } catch {}
    } else {
      tenantsList = [...initialSeedTenants];
    }

    const normalizedPlanId = (updateData.planId === 'professional' ? 'growth' : updateData.planId) as any;
    const credPass = updateData.password || updateData.adminPassword;

    let activeTenantObj: any = null;
    try {
      const atRaw = localStorage.getItem('itlc_active_tenant');
      if (atRaw) activeTenantObj = JSON.parse(atRaw);
    } catch {}

    let userProfObj: any = null;
    try {
      const upRaw = localStorage.getItem('hrms_user_profile');
      if (upRaw) userProfObj = JSON.parse(upRaw);
    } catch {}

    const targetCompanyId = updateData.companyId || activeTenantObj?.id || userProfObj?.companyId || userProfObj?.companyDetails?.id;
    const targetEmail = updateData.email || activeTenantObj?.adminEmail || userProfObj?.email;
    const targetCompanyName = updateData.companyName || activeTenantObj?.name || userProfObj?.companyName || userProfObj?.companyDetails?.name;

    // Resolve plan definition to get real quota metrics (e.g. 10GB, 50GB, 100GB)
    let planDef: SubscriptionPlanDef | undefined;
    try {
      const allPlans = getLiveSubscriptionPlans();
      planDef = allPlans.find(p => p.id === normalizedPlanId || p.name.toLowerCase() === String(normalizedPlanId).toLowerCase());
    } catch {}

    const planKeyLower = String(normalizedPlanId || '').toLowerCase();
    const resolvedStorageLimit = updateData.storageLimitGb || planDef?.storageLimitGb || (planKeyLower.includes('demo') || planKeyLower.includes('trial') ? 10 : planKeyLower.includes('premium') || planKeyLower.includes('enterprise') || planKeyLower.includes('pro') ? 100 : 50);
    const resolvedSeats = updateData.maxSeats || planDef?.seatLimit || (planKeyLower.includes('demo') || planKeyLower.includes('trial') ? 10 : planKeyLower.includes('premium') || planKeyLower.includes('enterprise') || planKeyLower.includes('pro') ? 100 : 50);

    let matched = false;
    tenantsList = tenantsList.map(t => {
      if (
        (targetCompanyId && t.id === targetCompanyId) ||
        (targetEmail && (t.adminEmail?.toLowerCase() === targetEmail.toLowerCase() || (t as any).email?.toLowerCase() === targetEmail.toLowerCase())) ||
        (!targetCompanyId && targetCompanyName && t.name?.toLowerCase() === targetCompanyName.toLowerCase())
      ) {
        matched = true;
        return {
          ...t,
          password: credPass || (t as any).password || 'Admin@123',
          adminPassword: credPass || (t as any).adminPassword || 'Admin@123',
          planId: normalizedPlanId || t.planId,
          status: updateData.status || t.status,
          billingCycle: updateData.billingCycle || t.billingCycle,
          userSeatLimit: resolvedSeats,
          renewalDate: updateData.renewalDate || t.renewalDate,
          storageLimitGb: resolvedStorageLimit,
          notes: updateData.notes || t.notes
        };
      }
      return t;
    });

    if (!matched && (updateData.companyName || targetCompanyName)) {
      // Create new tenant entry if not found
      const cName = updateData.companyName || targetCompanyName;
      const newTenant: TenantCompany = {
        id: targetCompanyId || `TEN-${Date.now()}`,
        name: cName,
        domain: cName.toLowerCase().replace(/[^a-z0-9]/g, ''),
        industry: 'General Enterprise',
        adminName: updateData.companyName + ' Admin',
        adminEmail: updateData.email || 'admin@' + updateData.companyName.toLowerCase().replace(/[^a-z0-9]/g, '') + '.com',
        adminPhone: '+91 98765 43210',
        planId: normalizedPlanId || 'growth',
        suites: normalizedPlanId === 'starter' ? ['crm'] : ['crm', 'hrms'],
        status: updateData.status || 'active',
        onboardDate: new Date().toISOString().split('T')[0],
        renewalDate: updateData.renewalDate || new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0],
        billingCycle: updateData.billingCycle || 'monthly',
        mrrAmount: planDef?.priceMonthly || (normalizedPlanId === 'premium' ? 999 : 499),
        userSeatLimit: resolvedSeats,
        storageLimitGb: resolvedStorageLimit,
        activeUsersCount: 1,
        features: {
          crmKanban: true,
          crmGstInvoicing: true,
          crmGpsFieldTracking: true,
          crmAiCopilot: normalizedPlanId === 'enterprise' || normalizedPlanId === 'premium',
          crmWhatsAppBroadcast: true,
          crmReports: true,
          hrmsBiometricRadar: true,
          hrmsGeofenceAttendance: true,
          hrmsPayrollPayslips: true,
          hrmsShiftLeaveManagement: true,
          hrmsAssetTraining: true,
          apiWebhooks: normalizedPlanId === 'enterprise' || normalizedPlanId === 'premium',
          customDomain: normalizedPlanId === 'enterprise' || normalizedPlanId === 'premium',
          prioritySlaSupport: normalizedPlanId !== 'starter' && normalizedPlanId !== 'demo'
        }
      };
      (newTenant as any).password = credPass || 'Admin@123';
      (newTenant as any).adminPassword = credPass || 'Admin@123';
      tenantsList.unshift(newTenant);
    }

    localStorage.setItem('itlc_multi_tenants', JSON.stringify(tenantsList));

    // Also sync to itlc_registered_users
    try {
      const savedUsers = localStorage.getItem('itlc_registered_users');
      const userList = savedUsers ? JSON.parse(savedUsers) : [];
      if (updateData.email) {
        const uIdx = userList.findIndex((u: any) => 
          u.email?.toLowerCase() === updateData.email?.toLowerCase()
        );
        const userEntry = {
          email: updateData.email.toLowerCase().trim(),
          password: credPass || (uIdx >= 0 ? userList[uIdx].password : 'Admin@123'),
          adminPassword: credPass || (uIdx >= 0 ? userList[uIdx].adminPassword : 'Admin@123'),
          name: updateData.companyName ? `${updateData.companyName} Admin` : 'Admin User',
          companyId: updateData.companyId,
          companyName: updateData.companyName,
          role: 'Company Admin',
          planId: normalizedPlanId,
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
          (targetCompanyId && activeT.id === targetCompanyId) ||
          (targetEmail && activeT.adminEmail?.toLowerCase() === targetEmail.toLowerCase()) ||
          (targetCompanyName && activeT.name?.toLowerCase() === targetCompanyName.toLowerCase())
        ) {
          const updatedActive = {
            ...activeT,
            password: credPass || activeT.password || 'Admin@123',
            adminPassword: credPass || activeT.adminPassword || 'Admin@123',
            planId: normalizedPlanId || activeT.planId,
            status: updateData.status || activeT.status,
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

    // 3. Update hrms_user_profile ONLY if it is NOT Super Owner and matches the targeted company
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
            status: updateData.status || hp.subscriptionStatus || 'active'
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
              (targetCompanyId && c.id === targetCompanyId) ||
              (targetEmail && c.email?.toLowerCase() === targetEmail.toLowerCase()) ||
              (targetCompanyName && c.name?.toLowerCase() === targetCompanyName.toLowerCase())
            ) {
              compMatched = true;
              return {
                ...c,
                subscriptionPlanId: normalizedPlanId || c.subscriptionPlanId,
                status: updateData.status || c.status,
                employeesCount: resolvedSeats,
                maxEmployees: resolvedSeats,
                seatLimit: resolvedSeats,
                storageLimit: resolvedStorageLimit,
                storageLimitGb: resolvedStorageLimit,
                ...(credPass ? { password: credPass, adminPassword: credPass, customPassword: credPass } : {})
              };
            }
            return c;
          });

          if (!compMatched && targetCompanyName) {
            updatedCompList.unshift({
              id: targetCompanyId || `comp_${Date.now()}`,
              name: targetCompanyName,
              logo: '/itlc_logo.png',
              ownerName: targetCompanyName + ' Admin',
              email: targetEmail || 'admin@' + targetCompanyName.toLowerCase().replace(/[^a-z0-9]/g, '') + '.com',
              phone: '+91 98765 43210',
              employeesCount: resolvedSeats,
              maxEmployees: resolvedSeats,
              seatLimit: resolvedSeats,
              subscriptionPlanId: normalizedPlanId,
              storageLimit: resolvedStorageLimit,
              storageLimitGb: resolvedStorageLimit,
              storageUsed: 0.85,
              status: updateData.status || 'active',
              createdDate: new Date().toISOString().split('T')[0],
              password: credPass || 'Admin@123',
              adminPassword: credPass || 'Admin@123',
              customPassword: credPass || 'Admin@123',
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

    // 5. Update company-scoped storage hrms_company_${compId}
    const finalCompId = targetCompanyId || (activeTenantObj && activeTenantObj.id);
    if (finalCompId) {
      try {
        const compKey = `hrms_company_${finalCompId}`;
        const rawComp = localStorage.getItem(compKey);
        const compObj = rawComp ? JSON.parse(rawComp) : {};
        const updatedCompObj = {
          ...compObj,
          id: finalCompId,
          name: targetCompanyName || compObj.name,
          subscriptionPlanId: normalizedPlanId,
          storageLimit: resolvedStorageLimit,
          storageLimitGb: resolvedStorageLimit,
          maxEmployees: resolvedSeats,
          seatLimit: resolvedSeats,
          userSeatLimit: resolvedSeats,
          employeesCount: resolvedSeats,
          status: updateData.status || compObj.status || 'active',
          ...(credPass ? { password: credPass, adminPassword: credPass, customPassword: credPass } : {})
        };
        localStorage.setItem(compKey, JSON.stringify(updatedCompObj));
      } catch (e) {}
    }

    // 6. Record activity log
    try {
      const logsRaw = localStorage.getItem('hrms_activity_logs');
      const logs = logsRaw ? JSON.parse(logsRaw) : [];
      logs.unshift({
        id: `act_${Date.now()}`,
        action: 'Subscription Plan Synchronized',
        category: 'Billing',
        details: `Company "${updateData.companyName || updateData.companyId}" quota updated: Plan=${normalizedPlanId}, Storage=${resolvedStorageLimit}GB, Seats=${resolvedSeats}`,
        timestamp: new Date().toISOString(),
        actorName: updateData.email || 'Super Owner'
      });
      localStorage.setItem('hrms_activity_logs', JSON.stringify(logs.slice(0, 100)));
    } catch (e) {}

    // 6.1 Sync directly with backend server database (/api/tenants)
    try {
      if (typeof window !== 'undefined' && window.fetch) {
        const getSafeBase = () => {
          if (typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')) {
            return '/api';
          }
          let url = (typeof import.meta !== 'undefined' && (import.meta as any).env && (import.meta as any).env.VITE_API_URL) || 'https://lemonchiffon-mink-999414.hostingersite.com/api';
          url = url.trim().replace(/\/+$/, '');
          return url.endsWith('/api') ? url : `${url}/api`;
        };
        const backendApiBase = getSafeBase();
        fetch(`${backendApiBase}/tenants`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            id: targetCompanyId || finalCompId,
            name: targetCompanyName || updateData.companyName,
            companyName: targetCompanyName || updateData.companyName,
            email: targetEmail,
            adminEmail: targetEmail,
            planId: normalizedPlanId,
            plan: normalizedPlanId,
            status: updateData.status || 'active',
            billingCycle: updateData.billingCycle || 'monthly',
            seatLimit: resolvedSeats,
            maxEmployees: resolvedSeats,
            staffCapacity: resolvedSeats,
            userSeatLimit: resolvedSeats,
            employeesCount: resolvedSeats,
            storageLimit: resolvedStorageLimit,
            storageLimitGb: resolvedStorageLimit,
            password: credPass,
            adminPassword: credPass
          })
        }).catch(() => {});
      }
    } catch {}

    // 7. Dispatch global events across all panels
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('subscription_plans_updated'));
      window.dispatchEvent(new CustomEvent('superowner_data_updated'));
      window.dispatchEvent(new CustomEvent('company_updated', { detail: { id: updateData.companyId, planId: normalizedPlanId, storageLimit: resolvedStorageLimit, maxEmployees: resolvedSeats } }));
      window.dispatchEvent(new CustomEvent('companies_updated'));
      window.dispatchEvent(new CustomEvent('subscription_updated'));
      window.dispatchEvent(new CustomEvent('multi_tenant_updated'));
    }
  } catch (error) {
    console.error('Failed to sync company subscription changes:', error);
  }
};

export const initialSeedTenants: TenantCompany[] = [];
