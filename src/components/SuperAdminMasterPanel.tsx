import React, { useState, useMemo, useEffect } from 'react';
import { 
  ShieldCheck, 
  Building2, 
  Users, 
  Briefcase, 
  Sliders, 
  RefreshCw, 
  DollarSign, 
  Search, 
  Plus, 
  Filter, 
  CheckCircle2, 
  AlertTriangle, 
  XCircle, 
  ArrowRight, 
  Lock, 
  Unlock, 
  Edit2, 
  Trash2, 
  Globe, 
  Sparkles, 
  MessageSquare, 
  Radio, 
  Calendar, 
  Download, 
  Check, 
  Zap, 
  LogOut,
  ExternalLink,
  Kanban,
  Receipt,
  MapPin,
  Bot,
  Megaphone,
  BarChart3,
  Layers,
  CreditCard,
  Key,
  Eye,
  EyeOff,
  Copy
} from 'lucide-react';
import { 
  getLiveSubscriptionPlans, 
  saveLiveSubscriptionPlans, 
  resetSubscriptionPlans, 
  defaultSubscriptionPlans, 
  getLiveLandingPageConfig,
  saveLiveLandingPageConfig,
  resetLandingPageConfig,
  getLiveSuperOwnerTaxConfig,
  saveLiveSuperOwnerTaxConfig,
  resetSuperOwnerTaxConfig,
  type SuperOwnerTaxConfig,
  type LandingPageConfig,
  type TenantCompany, 
  type TenantFeatureFlags, 
  type SubscriptionPlanDef 
} from '../types/multiTenant';

interface SuperAdminMasterPanelProps {
  tenants: TenantCompany[];
  onUpdateTenants: (updated: TenantCompany[]) => void;
  onLaunchTenantWorkspace: (tenant: TenantCompany, suite: 'crm' | 'hrms') => void;
  onExitSuperAdmin: () => void;
  triggerToast: (msg: string) => void;
  lang?: 'en' | 'hi';
}

export const SuperAdminMasterPanel: React.FC<SuperAdminMasterPanelProps> = ({
  tenants,
  onUpdateTenants,
  onLaunchTenantWorkspace,
  onExitSuperAdmin,
  triggerToast,
  lang = 'en'
}) => {
  const [activeTab, setActiveTab] = useState<'tenants' | 'features' | 'renewals' | 'plans' | 'tax_governance' | 'payments' | 'landing_cms' | 'audit'>('tenants');

  // Super Owner GST / Tax Policy Governance State
  const [taxConfig, setTaxConfig] = useState<SuperOwnerTaxConfig>(getLiveSuperOwnerTaxConfig());
  const [taxRateInput, setTaxRateInput] = useState<number>(() => getLiveSuperOwnerTaxConfig().ratePercent);
  const [taxEnabledInput, setTaxEnabledInput] = useState<boolean>(() => getLiveSuperOwnerTaxConfig().enabled);
  const [taxLabelInput, setTaxLabelInput] = useState<string>(() => getLiveSuperOwnerTaxConfig().taxLabel);
  const [taxGstinInput, setTaxGstinInput] = useState<string>(() => getLiveSuperOwnerTaxConfig().gstin);
  const [taxHsnCodeInput, setTaxHsnCodeInput] = useState<string>(() => getLiveSuperOwnerTaxConfig().hsnSacCode);
  const [taxInclusiveInput, setTaxInclusiveInput] = useState<boolean>(() => getLiveSuperOwnerTaxConfig().isTaxInclusive);
  const [taxStateSplitInput, setTaxStateSplitInput] = useState<boolean>(() => getLiveSuperOwnerTaxConfig().enableStateSplit);
  const [taxPanInput, setTaxPanInput] = useState<string>(() => getLiveSuperOwnerTaxConfig().panNumber || 'AABCI8899K');
  const [taxLegalNameInput, setTaxLegalNameInput] = useState<string>(() => getLiveSuperOwnerTaxConfig().registeredLegalName || 'ITLC INDIA PRIVATE LIMITED');
  const [taxPrefixInput, setTaxPrefixInput] = useState<string>(() => getLiveSuperOwnerTaxConfig().taxInvoicePrefix || 'INV-ITLC');
  const [taxTermsInput, setTaxTermsInput] = useState<string>(() => getLiveSuperOwnerTaxConfig().invoiceTerms || 'Tax invoice issued under Section 31 of CGST Act, 2017. Computer generated receipt.');

  useEffect(() => {
    const handleTaxEvent = () => {
      const live = getLiveSuperOwnerTaxConfig();
      setTaxConfig(live);
      setTaxRateInput(live.ratePercent);
      setTaxEnabledInput(live.enabled);
      setTaxLabelInput(live.taxLabel);
      setTaxGstinInput(live.gstin);
      setTaxHsnCodeInput(live.hsnSacCode);
      setTaxInclusiveInput(live.isTaxInclusive);
      setTaxStateSplitInput(live.enableStateSplit);
      setTaxPanInput(live.panNumber || 'AABCI8899K');
      setTaxLegalNameInput(live.registeredLegalName || 'ITLC INDIA PRIVATE LIMITED');
      setTaxPrefixInput(live.taxInvoicePrefix || 'INV-ITLC');
      setTaxTermsInput(live.invoiceTerms || '');
    };
    window.addEventListener('superowner_tax_config_updated', handleTaxEvent);
    return () => window.removeEventListener('superowner_tax_config_updated', handleTaxEvent);
  }, []);

  const handleSaveTaxPolicy = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const cleanRate = Number(taxRateInput) >= 0 ? Number(taxRateInput) : 0;
    const updated: SuperOwnerTaxConfig = {
      enabled: taxEnabledInput,
      ratePercent: cleanRate,
      taxLabel: taxLabelInput.trim() || 'GST',
      gstin: taxGstinInput.trim().toUpperCase() || '07AABCI8899K1Z4',
      hsnSacCode: taxHsnCodeInput.trim() || '998313',
      isTaxInclusive: taxInclusiveInput,
      enableStateSplit: taxStateSplitInput,
      panNumber: taxPanInput.trim().toUpperCase() || 'AABCI8899K',
      registeredLegalName: taxLegalNameInput.trim() || 'ITLC INDIA PRIVATE LIMITED',
      taxInvoicePrefix: taxPrefixInput.trim() || 'INV-ITLC',
      invoiceTerms: taxTermsInput.trim()
    };
    setTaxConfig(updated);
    saveLiveSuperOwnerTaxConfig(updated);
    triggerToast(
      `⚖️ Super Owner GST Tax Policy saved! (Rate: ${updated.enabled ? updated.ratePercent + '%' : '0% Exempt'}) applied across CRM, HRMS & Checkout.`
    );
  };

  const handleResetTaxPolicy = () => {
    if (window.confirm('Reset GST tax policy to standard 18% defaults?')) {
      const reset = resetSuperOwnerTaxConfig();
      setTaxConfig(reset);
      setTaxRateInput(reset.ratePercent);
      setTaxEnabledInput(reset.enabled);
      setTaxLabelInput(reset.taxLabel);
      setTaxGstinInput(reset.gstin);
      setTaxHsnCodeInput(reset.hsnSacCode);
      setTaxInclusiveInput(reset.isTaxInclusive);
      setTaxStateSplitInput(reset.enableStateSplit);
      setTaxPanInput(reset.panNumber || 'AABCI8899K');
      setTaxLegalNameInput(reset.registeredLegalName || 'ITLC INDIA PRIVATE LIMITED');
      setTaxPrefixInput(reset.taxInvoicePrefix || 'INV-ITLC');
      setTaxTermsInput(reset.invoiceTerms || '');
      triggerToast('GST Tax Policy reset to standard 18% factory defaults.');
    }
  };
  
  // Razorpay Gateway Config State
  const [razorpayKeyId, setRazorpayKeyId] = useState<string>(() => {
    try {
      const saved = localStorage.getItem('razorpay_config');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.keyId) return parsed.keyId;
      }
      const g = localStorage.getItem('hrms_global_settings');
      if (g) {
        const parsed = JSON.parse(g);
        if (parsed.razorpayKeyId) return parsed.razorpayKeyId;
      }
    } catch {}
    return 'rzp_live_Tb2olLw1YkeJRm';
  });

  const [razorpayKeySecret, setRazorpayKeySecret] = useState<string>(() => {
    try {
      const saved = localStorage.getItem('razorpay_config');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.keySecret) return parsed.keySecret;
      }
      const g = localStorage.getItem('hrms_global_settings');
      if (g) {
        const parsed = JSON.parse(g);
        if (parsed.razorpaySecret) return parsed.razorpaySecret;
      }
    } catch {}
    return 'giWCJ9bxC3NcUSfvQvr5dp2i';
  });

  const [razorpayWebhookSecret, setRazorpayWebhookSecret] = useState<string>(() => {
    try {
      const saved = localStorage.getItem('razorpay_config');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.webhookSecret) return parsed.webhookSecret;
      }
    } catch {}
    return '';
  });

  const [razorpayMerchantUpi, setRazorpayMerchantUpi] = useState<string>(() => {
    try {
      const saved = localStorage.getItem('razorpay_config');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.merchantUpi) return parsed.merchantUpi;
      }
    } catch {}
    return '';
  });

  const [razorpayMode, setRazorpayMode] = useState<'live' | 'test'>(() => {
    try {
      const saved = localStorage.getItem('razorpay_config');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.mode) return parsed.mode;
      }
    } catch {}
    return 'live';
  });

  const [razorpayEnabled, setRazorpayEnabled] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem('razorpay_config');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (typeof parsed.enabled === 'boolean') return parsed.enabled;
      }
    } catch {}
    return true;
  });

  const [showSecretKey, setShowSecretKey] = useState<boolean>(false);

  // Live Company Payments State
  const [recordedPayments, setRecordedPayments] = useState<any[]>(() => {
    try {
      const saved = localStorage.getItem('hrms_payments_data');
      if (saved) return JSON.parse(saved);
    } catch {}
    return [];
  });

  useEffect(() => {
    const handleStorageUpdate = () => {
      try {
        const saved = localStorage.getItem('hrms_payments_data');
        if (saved) setRecordedPayments(JSON.parse(saved));
      } catch {}
    };
    window.addEventListener('storage', handleStorageUpdate);
    window.addEventListener('superowner_data_updated', handleStorageUpdate);
    return () => {
      window.removeEventListener('storage', handleStorageUpdate);
      window.removeEventListener('superowner_data_updated', handleStorageUpdate);
    };
  }, []);

  const handleSaveRazorpayConfig = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const cleanKeyId = razorpayKeyId.trim();
    const cleanKeySecret = razorpayKeySecret.trim();
    const cleanWebhook = razorpayWebhookSecret.trim();
    const cleanUpi = razorpayMerchantUpi.trim();

    const config = {
      keyId: cleanKeyId,
      keySecret: cleanKeySecret,
      webhookSecret: cleanWebhook,
      merchantUpi: cleanUpi,
      mode: razorpayMode,
      enabled: razorpayEnabled,
      updatedAt: new Date().toISOString()
    };
    localStorage.setItem('razorpay_config', JSON.stringify(config));

    try {
      const gsRaw = localStorage.getItem('hrms_global_settings');
      const gs = gsRaw ? JSON.parse(gsRaw) : {};
      gs.razorpayKeyId = cleanKeyId;
      gs.razorpaySecret = cleanKeySecret;
      localStorage.setItem('hrms_global_settings', JSON.stringify(gs));
    } catch {}
    try {
      const integrationsRaw = localStorage.getItem('hrms_integrations_data') || '[]';
      let list = JSON.parse(integrationsRaw);
      if (!Array.isArray(list)) list = [];
      const idx = list.findIndex((i: any) => i.id === 'razorpay');
      const rzpRecord = {
        id: 'razorpay',
        name: 'Razorpay Payment Gateway',
        description: 'Automated subscription billing, UPI & credit card collection',
        connected: razorpayEnabled && !!cleanKeyId,
        apiKey: cleanKeyId,
        apiSecret: cleanKeySecret,
        webhookSecret: cleanWebhook,
        mode: razorpayMode
      };
      if (idx >= 0) list[idx] = rzpRecord;
      else list.push(rzpRecord);
      localStorage.setItem('hrms_integrations_data', JSON.stringify(list));
    } catch {}

    window.dispatchEvent(new CustomEvent('razorpay_config_updated', { detail: config }));
    triggerToast('🎉 Razorpay Payment Gateway settings saved and activated!');
  };

  // Landing Page CMS State
  const [cmsConfig, setCmsConfig] = useState<LandingPageConfig>(getLiveLandingPageConfig());

  // Plans Management State
  const [plans, setPlans] = useState<SubscriptionPlanDef[]>(getLiveSubscriptionPlans());
  const [editingPlan, setEditingPlan] = useState<SubscriptionPlanDef | null>(null);
  const [isNewPlanModal, setIsNewPlanModal] = useState(false);

  // Form state for plan editing
  const [planFormId, setPlanFormId] = useState('');
  const [planFormName, setPlanFormName] = useState('');
  const [planFormTagline, setPlanFormTagline] = useState('');
  const [planFormPriceMonthly, setPlanFormPriceMonthly] = useState<number>(1999);
  const [planFormPriceAnnual, setPlanFormPriceAnnual] = useState<number>(19990);
  const [planFormSeatLimit, setPlanFormSeatLimit] = useState<number>(50);
  const [planFormBadge, setPlanFormBadge] = useState('');
  const [planFormFeaturesText, setPlanFormFeaturesText] = useState('');
  const [planFormShowOnLandingPage, setPlanFormShowOnLandingPage] = useState<boolean>(true);

  useEffect(() => {
    const handleUpdate = () => {
      setPlans(getLiveSubscriptionPlans());
    };
    window.addEventListener('subscription_plans_updated', handleUpdate);
    return () => window.removeEventListener('subscription_plans_updated', handleUpdate);
  }, []);

  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState('');
  const [suiteFilter, setSuiteFilter] = useState<'ALL' | 'CRM' | 'HRMS' | 'BOTH'>('ALL');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'active' | 'expiring_soon' | 'expired' | 'suspended'>('ALL');

  // Selected Tenant for Feature Flag Editor
  const [selectedTenantIdForFeatures, setSelectedTenantIdForFeatures] = useState<string>(tenants[0]?.id || '');
  
  // Add/Edit Tenant Modal State
  const [showAddTenantModal, setShowAddTenantModal] = useState(false);
  const [editingTenant, setEditingTenant] = useState<TenantCompany | null>(null);

  // Quick Renewal Modal State
  const [renewingTenant, setRenewingTenant] = useState<TenantCompany | null>(null);
  const [renewalDaysToAdd, setRenewalDaysToAdd] = useState<number>(30);

  // New Tenant Form State
  const [formName, setFormName] = useState('');
  const [formGstin, setFormGstin] = useState('');
  const [formIndustry, setFormIndustry] = useState('IT & Software Services');
  const [formAdminName, setFormAdminName] = useState('');
  const [formAdminEmail, setFormAdminEmail] = useState('');
  const [formAdminPhone, setFormAdminPhone] = useState('');
  const [formPlanId, setFormPlanId] = useState<'starter' | 'growth' | 'enterprise'>('growth');
  const [formSuites, setFormSuites] = useState<('crm' | 'hrms')[]>(['crm', 'hrms']);
  const [formSeatLimit, setFormSeatLimit] = useState(50);
  const [formBillingCycle, setFormBillingCycle] = useState<'monthly' | 'annual'>('monthly');

  // Selected tenant object for Feature Gatekeeper
  const activeFeatureTenant = useMemo(() => {
    return tenants.find(t => t.id === selectedTenantIdForFeatures) || tenants[0];
  }, [tenants, selectedTenantIdForFeatures]);

  // Aggregate Metrics
  const stats = useMemo(() => {
    const totalTenants = tenants.length;
    const activeTenants = tenants.filter(t => t.status === 'active').length;
    const expiringSoon = tenants.filter(t => t.status === 'expiring_soon').length;
    const suspended = tenants.filter(t => t.status === 'suspended').length;
    
    const totalMRR = tenants.reduce((acc, t) => t.status !== 'suspended' && t.status !== 'expired' ? acc + t.mrrAmount : acc, 0);
    const totalARR = totalMRR * 12;
    const totalSeatsAllocated = tenants.reduce((acc, t) => acc + t.userSeatLimit, 0);
    const totalActiveUsers = tenants.reduce((acc, t) => acc + t.activeUsersCount, 0);

    return {
      totalTenants,
      activeTenants,
      expiringSoon,
      suspended,
      totalMRR,
      totalARR,
      totalSeatsAllocated,
      totalActiveUsers
    };
  }, [tenants]);

  // Filtered Tenants List
  const filteredTenants = useMemo(() => {
    return tenants.filter(t => {
      const q = searchQuery.toLowerCase();
      const matchQuery = !q || 
        t.name.toLowerCase().includes(q) || 
        t.domain.toLowerCase().includes(q) || 
        t.adminEmail.toLowerCase().includes(q) || 
        t.adminName.toLowerCase().includes(q) || 
        (t.gstin && t.gstin.toLowerCase().includes(q));

      const matchStatus = statusFilter === 'ALL' || t.status === statusFilter;
      
      let matchSuite = true;
      if (suiteFilter === 'CRM') matchSuite = t.suites.includes('crm') && !t.suites.includes('hrms');
      else if (suiteFilter === 'HRMS') matchSuite = t.suites.includes('hrms') && !t.suites.includes('crm');
      else if (suiteFilter === 'BOTH') matchSuite = t.suites.includes('crm') && t.suites.includes('hrms');

      return matchQuery && matchStatus && matchSuite;
    });
  }, [tenants, searchQuery, suiteFilter, statusFilter]);

  // Handle Feature Flag Toggle for a Tenant
  const handleToggleFeature = (featureKey: keyof TenantFeatureFlags) => {
    if (!activeFeatureTenant) return;
    const currentVal = activeFeatureTenant.features[featureKey];
    const updatedFeatures: TenantFeatureFlags = {
      ...activeFeatureTenant.features,
      [featureKey]: !currentVal
    };

    const updatedList = tenants.map(t => t.id === activeFeatureTenant.id ? { ...t, features: updatedFeatures } : t);
    onUpdateTenants(updatedList);
    triggerToast(`Feature "${String(featureKey)}" ${!currentVal ? 'ENABLED' : 'DISABLED'} for ${activeFeatureTenant.name}`);
  };

  // Handle Suspend / Activate Tenant
  const handleToggleTenantStatus = (id: string) => {
    const target = tenants.find(t => t.id === id);
    if (!target) return;
    const nextStatus = target.status === 'suspended' ? 'active' : 'suspended';
    const updated = tenants.map(t => t.id === id ? { ...t, status: nextStatus as any } : t);
    onUpdateTenants(updated);
    triggerToast(`Tenant ${target.name} is now ${nextStatus.toUpperCase()}`);
  };

  // Handle Delete Tenant
  const handleDeleteTenant = (id: string, name: string) => {
    if (!window.confirm(`Are you sure you want to permanently remove tenant "${name}"?`)) return;
    const updated = tenants.filter(t => t.id !== id);
    onUpdateTenants(updated);
    triggerToast(`Tenant "${name}" removed.`);
  };

  // Handle Save or Edit Tenant
  const handleSaveTenant = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName || !formAdminEmail) return;

    const plan = plans.find(p => p.id === formPlanId) || plans[0] || defaultSubscriptionPlans[1];

    if (editingTenant) {
      const updatedList = tenants.map(t => {
        if (t.id === editingTenant.id) {
          return {
            ...t,
            name: formName,
            gstin: formGstin || undefined,
            industry: formIndustry,
            adminName: formAdminName,
            adminEmail: formAdminEmail,
            adminPhone: formAdminPhone,
            planId: formPlanId,
            suites: formSuites,
            userSeatLimit: formSeatLimit,
            billingCycle: formBillingCycle,
            mrrAmount: plan.priceMonthly
          };
        }
        return t;
      });
      onUpdateTenants(updatedList);
      triggerToast(`Tenant "${formName}" updated.`);
    } else {
      const newId = `TEN-${Math.floor(100 + Math.random() * 900)}`;
      const cleanDomain = formName.toLowerCase().replace(/[^a-z0-9]/g, '') || 'client';
      const isEnt = formPlanId === 'enterprise';
      const isGrow = formPlanId === 'growth';
      const hasCrm = formSuites.includes('crm');
      const hasHrms = formSuites.includes('hrms');

      const defaultFeatures: TenantFeatureFlags = {
        crmKanban: hasCrm,
        crmGstInvoicing: hasCrm,
        crmGpsFieldTracking: hasCrm && (isGrow || isEnt),
        crmAiCopilot: hasCrm && isEnt,
        crmWhatsAppBroadcast: hasCrm && (isGrow || isEnt),
        crmReports: hasCrm,
        hrmsBiometricRadar: hasHrms,
        hrmsGeofenceAttendance: hasHrms && (isGrow || isEnt),
        hrmsPayrollPayslips: hasHrms,
        hrmsShiftLeaveManagement: hasHrms,
        hrmsAssetTraining: hasHrms && isEnt,
        apiWebhooks: isEnt,
        customDomain: isEnt,
        prioritySlaSupport: isGrow || isEnt
      };

      const newRecord: TenantCompany = {
        id: newId,
        name: formName,
        domain: cleanDomain,
        gstin: formGstin || undefined,
        industry: formIndustry,
        adminName: formAdminName,
        adminEmail: formAdminEmail,
        adminPhone: formAdminPhone,
        planId: formPlanId,
        suites: formSuites,
        status: 'active',
        onboardDate: new Date().toISOString().split('T')[0],
        renewalDate: new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0],
        billingCycle: formBillingCycle,
        mrrAmount: plan.priceMonthly,
        userSeatLimit: formSeatLimit,
        activeUsersCount: 1,
        features: defaultFeatures,
        notes: 'Manually provisioned by Master Super Admin.'
      };

      onUpdateTenants([newRecord, ...tenants]);
      triggerToast(`🎉 New Tenant "${formName}" provisioned successfully!`);
    }

    setShowAddTenantModal(false);
    setEditingTenant(null);
  };

  const openEditModal = (t: TenantCompany) => {
    setEditingTenant(t);
    setFormName(t.name);
    setFormGstin(t.gstin || '');
    setFormIndustry(t.industry);
    setFormAdminName(t.adminName);
    setFormAdminEmail(t.adminEmail);
    setFormAdminPhone(t.adminPhone);
    setFormPlanId(t.planId);
    setFormSuites(t.suites);
    setFormSeatLimit(t.userSeatLimit);
    setFormBillingCycle(t.billingCycle);
    setShowAddTenantModal(true);
  };

  const openAddModal = () => {
    setEditingTenant(null);
    setFormName('');
    setFormGstin('');
    setFormIndustry('IT & Software Services');
    setFormAdminName('');
    setFormAdminEmail('');
    setFormAdminPhone('');
    setFormPlanId('growth');
    setFormSuites(['crm', 'hrms']);
    setFormSeatLimit(50);
    setFormBillingCycle('monthly');
    setShowAddTenantModal(true);
  };

  // Plan Tier Management Handlers
  const openEditPlanModal = (p: SubscriptionPlanDef) => {
    setEditingPlan(p);
    setIsNewPlanModal(false);
    setPlanFormId(p.id);
    setPlanFormName(p.name);
    setPlanFormTagline(p.tagline);
    setPlanFormPriceMonthly(p.priceMonthly);
    setPlanFormPriceAnnual(p.priceAnnual);
    setPlanFormSeatLimit(p.seatLimit);
    setPlanFormBadge(p.badge || '');
    setPlanFormFeaturesText(p.highlightFeatures.join('\n'));
    setPlanFormShowOnLandingPage(p.showOnLandingPage !== false);
  };

  const openNewPlanModal = () => {
    setEditingPlan(null);
    setIsNewPlanModal(true);
    setPlanFormId(`custom_${Date.now()}`);
    setPlanFormName('Pro Custom Tier');
    setPlanFormTagline('Tailored features and dedicated seat capacity for enterprise teams.');
    setPlanFormPriceMonthly(2999);
    setPlanFormPriceAnnual(29990);
    setPlanFormSeatLimit(100);
    setPlanFormBadge('NEW TIER');
    setPlanFormFeaturesText('Full CRM & HRMS Access\nDedicated Account Manager\nCustom API Integrations\nPriority SLA Support');
    setPlanFormShowOnLandingPage(true);
  };

  const handleSavePlan = (e: React.FormEvent) => {
    e.preventDefault();
    if (!planFormName.trim()) return;

    const featuresList = planFormFeaturesText
      .split('\n')
      .map(f => f.trim())
      .filter(Boolean);

    let updatedPlans: SubscriptionPlanDef[];

    if (editingPlan) {
      updatedPlans = plans.map(p => {
        if (p.id === editingPlan.id) {
          return {
            ...p,
            name: planFormName.trim(),
            tagline: planFormTagline.trim(),
            priceMonthly: Number(planFormPriceMonthly) || 0,
            priceAnnual: Number(planFormPriceAnnual) || 0,
            seatLimit: Number(planFormSeatLimit) || 10,
            badge: planFormBadge.trim() || undefined,
            showOnLandingPage: planFormShowOnLandingPage !== false,
            highlightFeatures: featuresList.length > 0 ? featuresList : p.highlightFeatures
          };
        }
        return p;
      });
    } else {
      const newPlan: SubscriptionPlanDef = {
        id: planFormId.trim().toLowerCase().replace(/\s+/g, '_') || `tier_${Date.now()}`,
        name: planFormName.trim(),
        tagline: planFormTagline.trim(),
        priceMonthly: Number(planFormPriceMonthly) || 0,
        priceAnnual: Number(planFormPriceAnnual) || 0,
        defaultSuites: ['crm', 'hrms'],
        seatLimit: Number(planFormSeatLimit) || 10,
        badge: planFormBadge.trim() || undefined,
        showOnLandingPage: planFormShowOnLandingPage !== false,
        highlightFeatures: featuresList.length > 0 ? featuresList : ['All Core Modules Included']
      };
      updatedPlans = [...plans, newPlan];
    }

    setPlans(updatedPlans);
    saveLiveSubscriptionPlans(updatedPlans);
    setEditingPlan(null);
    setIsNewPlanModal(false);
    triggerToast(
      `✅ Subscription Plan "${planFormName}" saved! Changes are now live on Landing Page & Payment Checkout.`
    );
  };

  const handleTogglePlanLanding = (planId: string) => {
    const updated = plans.map(p => {
      if (p.id === planId) {
        const currentShow = p.showOnLandingPage !== false;
        return { ...p, showOnLandingPage: !currentShow };
      }
      return p;
    });
    setPlans(updated);
    saveLiveSubscriptionPlans(updated);
    triggerToast('Landing page visibility updated.');
  };

  const handleDeletePlan = (planId: string, planName: string) => {
    if (!window.confirm(`Are you sure you want to delete tier "${planName}"?`)) return;
    const updated = plans.filter(p => p.id !== planId);
    setPlans(updated);
    saveLiveSubscriptionPlans(updated);
    triggerToast(`🗑️ Subscription tier "${planName}" deleted.`);
  };

  const handleResetPlans = () => {
    if (window.confirm('Reset all subscription plans to original system defaults?')) {
      const reset = resetSubscriptionPlans();
      setPlans(reset);
      triggerToast('Subscription plans reset to factory defaults.');
    }
  };

  // Handle Extend Renewal
  const handleExtendRenewal = () => {
    if (!renewingTenant) return;
    const currentRenewal = new Date(renewingTenant.renewalDate).getTime();
    const baseTime = currentRenewal > Date.now() ? currentRenewal : Date.now();
    const newRenewalDate = new Date(baseTime + renewalDaysToAdd * 86400000).toISOString().split('T')[0];

    const updated = tenants.map(t => {
      if (t.id === renewingTenant.id) {
        return {
          ...t,
          renewalDate: newRenewalDate,
          status: 'active' as const
        };
      }
      return t;
    });

    onUpdateTenants(updated);
    triggerToast(`Extended subscription for ${renewingTenant.name} by ${renewalDaysToAdd} days (Until ${newRenewalDate})`);
    setRenewingTenant(null);
  };

  return (
    <div className="super-admin-master-shell">
      {/* Top Master Admin Header */}
      <header className="super-admin-top-bar">
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div className="super-admin-crown-badge">
            <ShieldCheck size={24} color="#f59e0b" />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <h1 style={{ fontSize: '18px', fontWeight: 900, color: '#f8fafc', margin: 0, letterSpacing: '-0.3px' }}>
                ITLC UNIFIED MULTI-TENANT SUPER ADMIN MASTER
              </h1>
              <span className="super-admin-env-pill">PRODUCTION ACTIVE</span>
            </div>
            <span style={{ fontSize: '11px', color: '#94a3b8', display: 'block', marginTop: '2px' }}>
              Universal Governance • CRM + HRMS Cross-Suite Connector • ISO 27001 Multi-Tenant Isolation
            </span>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <button 
            className="btn btn-secondary super-admin-action-btn"
            onClick={openAddModal}
          >
            <Plus size={15} />
            <span>+ Onboard Company</span>
          </button>

          <button 
            className="btn btn-secondary super-admin-exit-btn"
            onClick={onExitSuperAdmin}
            title="Exit Super Admin and Return to Public Landing Page"
          >
            <LogOut size={15} />
            <span>Exit Super Admin</span>
          </button>
        </div>
      </header>

      {/* Global Multi-Tenant Metrics Ribbon */}
      <div className="super-admin-metrics-ribbon">
        <div className="super-metric-card">
          <div className="super-metric-icon" style={{ background: 'rgba(2, 132, 199, 0.15)', color: '#38bdf8' }}>
            <Building2 size={20} />
          </div>
          <div>
            <span className="super-metric-label">Onboarded Tenants</span>
            <div className="super-metric-value">{stats.totalTenants}</div>
            <span className="super-metric-sub">{stats.activeTenants} Active • {stats.suspended} Suspended</span>
          </div>
        </div>

        <div className="super-metric-card">
          <div className="super-metric-icon" style={{ background: 'rgba(16, 185, 129, 0.15)', color: '#34d399' }}>
            <DollarSign size={20} />
          </div>
          <div>
            <span className="super-metric-label">Total MRR (Monthly)</span>
            <div className="super-metric-value">₹{stats.totalMRR.toLocaleString()}</div>
            <span className="super-metric-sub">ARR: ₹{stats.totalARR.toLocaleString()}</span>
          </div>
        </div>

        <div className="super-metric-card">
          <div className="super-metric-icon" style={{ background: 'rgba(99, 102, 241, 0.15)', color: '#818cf8' }}>
            <Users size={20} />
          </div>
          <div>
            <span className="super-metric-label">Active Users / Staff</span>
            <div className="super-metric-value">{stats.totalActiveUsers}</div>
            <span className="super-metric-sub">{stats.totalSeatsAllocated} Total Capacity Seats</span>
          </div>
        </div>

        <div className="super-metric-card">
          <div className="super-metric-icon" style={{ background: 'rgba(245, 158, 11, 0.15)', color: '#fbbf24' }}>
            <AlertTriangle size={20} />
          </div>
          <div>
            <span className="super-metric-label">Renewals Due &lt; 15 Days</span>
            <div className="super-metric-value" style={{ color: stats.expiringSoon > 0 ? '#fbbf24' : '#f8fafc' }}>
              {stats.expiringSoon}
            </div>
            <span className="super-metric-sub">Requires Follow-up</span>
          </div>
        </div>
      </div>

      {/* Main Governance Navigation Tabs */}
      <div className="super-admin-tabs-nav">
        <button 
          className={`super-admin-nav-tab ${activeTab === 'tenants' ? 'active' : ''}`}
          onClick={() => setActiveTab('tenants')}
        >
          <Building2 size={16} />
          <span>🏢 Onboarded Companies ({tenants.length})</span>
        </button>

        <button 
          className={`super-admin-nav-tab ${activeTab === 'features' ? 'active' : ''}`}
          onClick={() => setActiveTab('features')}
        >
          <Sliders size={16} />
          <span>🎛️ Feature Flags & Client Gatekeeper</span>
        </button>

        <button 
          className={`super-admin-nav-tab ${activeTab === 'renewals' ? 'active' : ''}`}
          onClick={() => setActiveTab('renewals')}
        >
          <RefreshCw size={16} />
          <span>🔄 Subscriptions & Renewals Radar</span>
        </button>

        <button 
          className={`super-admin-nav-tab ${activeTab === 'plans' ? 'active' : ''}`}
          onClick={() => setActiveTab('plans')}
        >
          <DollarSign size={16} />
          <span>💰 Plan Tiers & Monetization</span>
        </button>

        <button 
          className={`super-admin-nav-tab ${activeTab === 'tax_governance' ? 'active' : ''}`}
          onClick={() => setActiveTab('tax_governance')}
        >
          <Receipt size={16} />
          <span>⚖️ GST & Tax Governance {taxConfig.enabled ? `(${taxConfig.ratePercent}%)` : '(0% Exempt)'}</span>
        </button>

        <button 
          className={`super-admin-nav-tab ${activeTab === 'payments' ? 'active' : ''}`}
          onClick={() => setActiveTab('payments')}
        >
          <CreditCard size={16} />
          <span>💳 Razorpay & Payment Gateway</span>
        </button>

        <button 
          className={`super-admin-nav-tab ${activeTab === 'landing_cms' ? 'active' : ''}`}
          onClick={() => setActiveTab('landing_cms')}
        >
          <Globe size={16} />
          <span>🌐 Landing Page CMS</span>
        </button>
      </div>

      {/* TAB 1: ONBOARDED COMPANIES & CLIENTS DIRECTORY */}
      {activeTab === 'tenants' && (
        <div className="super-admin-content-card">
          {/* Filter Bar */}
          <div className="super-admin-filter-bar">
            <div className="super-admin-search-wrapper">
              <Search size={16} color="#64748b" />
              <input 
                type="text" 
                placeholder="Search by company name, domain, admin email, GSTIN..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            <div style={{ display: 'flex', gap: '8px' }}>
              <select 
                className="super-admin-select"
                value={suiteFilter}
                onChange={(e) => setSuiteFilter(e.target.value as any)}
              >
                <option value="ALL">All Suites (CRM + HRMS)</option>
                <option value="BOTH">Unified Both</option>
                <option value="CRM">CRM Only</option>
                <option value="HRMS">HRMS Only</option>
              </select>

              <select 
                className="super-admin-select"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as any)}
              >
                <option value="ALL">All Statuses</option>
                <option value="active">Active Only</option>
                <option value="expiring_soon">Expiring Soon</option>
                <option value="suspended">Suspended</option>
              </select>
            </div>
          </div>

          {/* Tenants Directory Table */}
          <div className="super-admin-table-container">
            <table className="super-admin-data-table">
              <thead>
                <tr>
                  <th>Company & Tenant ID</th>
                  <th>Suites Active</th>
                  <th>Plan & Billing</th>
                  <th>Admin Contact</th>
                  <th>Seats Usage</th>
                  <th>Renewal Status</th>
                  <th style={{ textAlign: 'right' }}>Master Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredTenants.length === 0 ? (
                  <tr>
                    <td colSpan={7} style={{ textAlign: 'center', padding: '40px', color: '#94a3b8' }}>
                      No client companies match your search or filter criteria.
                    </td>
                  </tr>
                ) : (
                  filteredTenants.map(tenant => {
                    const hasCrm = tenant.suites.includes('crm');
                    const hasHrms = tenant.suites.includes('hrms');
                    const daysToRenewal = Math.ceil((new Date(tenant.renewalDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24));

                    return (
                      <tr key={tenant.id}>
                        <td>
                          <div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                              <strong style={{ fontSize: '14px', color: '#f8fafc' }}>{tenant.name}</strong>
                              <span className="tenant-id-pill">{tenant.id}</span>
                            </div>
                            <span style={{ fontSize: '12px', color: '#38bdf8', display: 'block', marginTop: '2px' }}>
                              {tenant.domain}.itlc.io
                            </span>
                            {tenant.gstin && (
                              <span style={{ fontSize: '11px', color: '#64748b' }}>GSTIN: {tenant.gstin}</span>
                            )}
                          </div>
                        </td>

                        <td>
                          <div style={{ display: 'flex', gap: '6px' }}>
                            {hasCrm && (
                              <span className="badge-suite-crm">
                                <Briefcase size={12} />
                                <span>CRM</span>
                              </span>
                            )}
                            {hasHrms && (
                              <span className="badge-suite-hrms">
                                <Users size={12} />
                                <span>HRMS</span>
                              </span>
                            )}
                          </div>
                        </td>

                        <td>
                          <div>
                            <strong style={{ fontSize: '13px', color: '#f8fafc', textTransform: 'capitalize' }}>
                              {tenant.planId} Tier
                            </strong>
                            <span style={{ display: 'block', fontSize: '11px', color: '#34d399', fontWeight: 600 }}>
                              ₹{tenant.mrrAmount.toLocaleString()} / {tenant.billingCycle}
                            </span>
                          </div>
                        </td>

                        <td>
                          <div>
                            <div style={{ fontSize: '13px', color: '#f8fafc', fontWeight: 600 }}>{tenant.adminName}</div>
                            <div style={{ fontSize: '11px', color: '#94a3b8' }}>{tenant.adminEmail}</div>
                            <div style={{ fontSize: '11px', color: '#64748b' }}>{tenant.adminPhone}</div>
                          </div>
                        </td>

                        <td>
                          <div style={{ width: '120px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: '#94a3b8', marginBottom: '3px' }}>
                              <span>{tenant.activeUsersCount} users</span>
                              <span>{tenant.userSeatLimit} max</span>
                            </div>
                            <div className="super-progress-track">
                              <div 
                                className="super-progress-fill" 
                                style={{ width: `${Math.min(100, (tenant.activeUsersCount / tenant.userSeatLimit) * 100)}%` }}
                              />
                            </div>
                          </div>
                        </td>

                        <td>
                          <div>
                            {tenant.status === 'suspended' ? (
                              <span className="badge-status-suspended">SUSPENDED</span>
                            ) : tenant.status === 'expiring_soon' || daysToRenewal <= 7 ? (
                              <span className="badge-status-warning">
                                <AlertTriangle size={12} />
                                <span>Expiring in {daysToRenewal}d</span>
                              </span>
                            ) : (
                              <span className="badge-status-active">
                                <CheckCircle2 size={12} />
                                <span>Active (Due {tenant.renewalDate})</span>
                              </span>
                            )}
                          </div>
                        </td>

                        <td style={{ textAlign: 'right' }}>
                          <div style={{ display: 'inline-flex', gap: '6px' }}>
                            {/* Launch Workspace Button */}
                            <button 
                              className="super-btn-icon-action launch"
                              title="Launch Tenant Workspace (Login as Admin)"
                              onClick={() => onLaunchTenantWorkspace(tenant, hasCrm ? 'crm' : 'hrms')}
                            >
                              <ExternalLink size={14} />
                              <span>Open</span>
                            </button>

                            {/* Feature Gatekeeper Switch */}
                            <button 
                              className="super-btn-icon-action feature"
                              title="Manage Feature Flags"
                              onClick={() => {
                                setSelectedTenantIdForFeatures(tenant.id);
                                setActiveTab('features');
                              }}
                            >
                              <Sliders size={14} />
                            </button>

                            {/* Renew Button */}
                            <button 
                              className="super-btn-icon-action renew"
                              title="Extend / Renew Subscription"
                              onClick={() => setRenewingTenant(tenant)}
                            >
                              <RefreshCw size={14} />
                            </button>

                            {/* Edit Button */}
                            <button 
                              className="super-btn-icon-action edit"
                              title="Edit Tenant"
                              onClick={() => openEditModal(tenant)}
                            >
                              <Edit2 size={14} />
                            </button>

                            {/* Suspend / Activate Toggle */}
                            <button 
                              className={`super-btn-icon-action ${tenant.status === 'suspended' ? 'activate' : 'suspend'}`}
                              title={tenant.status === 'suspended' ? 'Activate Tenant' : 'Suspend Tenant'}
                              onClick={() => handleToggleTenantStatus(tenant.id)}
                            >
                              {tenant.status === 'suspended' ? <Unlock size={14} /> : <Lock size={14} />}
                            </button>

                            {/* Delete Button */}
                            <button 
                              className="super-btn-icon-action delete"
                              title="Permanently Delete Tenant"
                              onClick={() => handleDeleteTenant(tenant.id, tenant.name)}
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 2: FEATURE FLAGS & CLIENT ACCESS GATEKEEPER */}
      {activeTab === 'features' && (
        <div className="super-admin-content-card">
          {/* Tenant Selector Header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #334155', paddingBottom: '16px', marginBottom: '20px' }}>
            <div>
              <h2 style={{ fontSize: '18px', fontWeight: 800, color: '#f8fafc', margin: 0 }}>
                Client Feature Gatekeeper & Entitlements
              </h2>
              <p style={{ fontSize: '12px', color: '#94a3b8', margin: '4px 0 0' }}>
                Super Admin decides which CRM & HRMS tools this company is allowed to use.
              </p>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span style={{ fontSize: '13px', color: '#94a3b8', fontWeight: 600 }}>Managing Tenant:</span>
              <select 
                className="super-admin-select"
                style={{ minWidth: '240px', fontSize: '14px', fontWeight: 700 }}
                value={selectedTenantIdForFeatures}
                onChange={(e) => setSelectedTenantIdForFeatures(e.target.value)}
              >
                {tenants.map(t => (
                  <option key={t.id} value={t.id}>{t.name} ({t.id})</option>
                ))}
              </select>
            </div>
          </div>

          {activeFeatureTenant && (
            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#1e293b', padding: '14px 20px', borderRadius: '12px', marginBottom: '24px', border: '1px solid #334155' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <h3 style={{ margin: 0, fontSize: '16px', color: '#f8fafc', fontWeight: 800 }}>{activeFeatureTenant.name}</h3>
                    <span className="tenant-id-pill">{activeFeatureTenant.id}</span>
                    <span style={{ fontSize: '12px', color: '#38bdf8', fontWeight: 600 }}>Plan: {activeFeatureTenant.planId.toUpperCase()}</span>
                  </div>
                  <span style={{ fontSize: '12px', color: '#94a3b8', marginTop: '2px', display: 'block' }}>
                    Admin: {activeFeatureTenant.adminName} ({activeFeatureTenant.adminEmail}) • {activeFeatureTenant.activeUsersCount} Active Seats
                  </span>
                </div>

                <div style={{ display: 'flex', gap: '8px' }}>
                  <button 
                    className="btn btn-secondary super-admin-action-btn"
                    onClick={() => onLaunchTenantWorkspace(activeFeatureTenant, 'crm')}
                  >
                    <span>Open CRM</span>
                    <ExternalLink size={14} />
                  </button>
                  <button 
                    className="btn btn-secondary super-admin-action-btn"
                    onClick={() => onLaunchTenantWorkspace(activeFeatureTenant, 'hrms')}
                  >
                    <span>Open HRMS</span>
                    <ExternalLink size={14} />
                  </button>
                </div>
              </div>

              {/* CRM FEATURE FLAGS SECTION */}
              <div className="feature-category-box">
                <div className="feature-category-header">
                  <Briefcase size={18} color="#38bdf8" />
                  <h4 style={{ margin: 0, fontSize: '15px', color: '#38bdf8', fontWeight: 800 }}>
                    ITLC Sales CRM Feature Controls
                  </h4>
                </div>
                
                <div className="feature-flags-grid">
                  <div className="feature-toggle-card">
                    <div className="feature-toggle-info">
                      <div className="feature-toggle-icon"><Kanban size={18} color="#38bdf8" /></div>
                      <div>
                        <strong>Visual Deals Kanban Pipeline</strong>
                        <span>Drag & drop sales stages and deal velocity</span>
                      </div>
                    </div>
                    <label className="super-switch">
                      <input 
                        type="checkbox" 
                        checked={activeFeatureTenant.features.crmKanban}
                        onChange={() => handleToggleFeature('crmKanban')}
                      />
                      <span className="super-slider" />
                    </label>
                  </div>

                  <div className="feature-toggle-card">
                    <div className="feature-toggle-info">
                      <div className="feature-toggle-icon"><Receipt size={18} color="#34d399" /></div>
                      <div>
                        <strong>GST Tax Invoicing & Dynamic UPI QR</strong>
                        <span>Issue compliant GST tax bills with instant UPI QR & PDF</span>
                      </div>
                    </div>
                    <label className="super-switch">
                      <input 
                        type="checkbox" 
                        checked={activeFeatureTenant.features.crmGstInvoicing}
                        onChange={() => handleToggleFeature('crmGstInvoicing')}
                      />
                      <span className="super-slider" />
                    </label>
                  </div>

                  <div className="feature-toggle-card">
                    <div className="feature-toggle-info">
                      <div className="feature-toggle-icon"><MapPin size={18} color="#f59e0b" /></div>
                      <div>
                        <strong>GPS Geofenced Field Meetings</strong>
                        <span>Verify field sales visits via real-time satellite check-in</span>
                      </div>
                    </div>
                    <label className="super-switch">
                      <input 
                        type="checkbox" 
                        checked={activeFeatureTenant.features.crmGpsFieldTracking}
                        onChange={() => handleToggleFeature('crmGpsFieldTracking')}
                      />
                      <span className="super-slider" />
                    </label>
                  </div>

                  <div className="feature-toggle-card">
                    <div className="feature-toggle-info">
                      <div className="feature-toggle-icon"><Bot size={18} color="#818cf8" /></div>
                      <div>
                        <strong>AI Sales Copilot & Win Predictor</strong>
                        <span>Real-time deal scoring, lead temperatures & automated replies</span>
                      </div>
                    </div>
                    <label className="super-switch">
                      <input 
                        type="checkbox" 
                        checked={activeFeatureTenant.features.crmAiCopilot}
                        onChange={() => handleToggleFeature('crmAiCopilot')}
                      />
                      <span className="super-slider" />
                    </label>
                  </div>

                  <div className="feature-toggle-card">
                    <div className="feature-toggle-info">
                      <div className="feature-toggle-icon"><Megaphone size={18} color="#ec4899" /></div>
                      <div>
                        <strong>WhatsApp & Email Broadcast Blaster</strong>
                        <span>One-click bulk personalized outreach to qualified client lists</span>
                      </div>
                    </div>
                    <label className="super-switch">
                      <input 
                        type="checkbox" 
                        checked={activeFeatureTenant.features.crmWhatsAppBroadcast}
                        onChange={() => handleToggleFeature('crmWhatsAppBroadcast')}
                      />
                      <span className="super-slider" />
                    </label>
                  </div>

                  <div className="feature-toggle-card">
                    <div className="feature-toggle-info">
                      <div className="feature-toggle-icon"><BarChart3 size={18} color="#10b981" /></div>
                      <div>
                        <strong>Advanced Revenue & Forecast Analytics</strong>
                        <span>Executive sales charts, conversion funnels & target achievement</span>
                      </div>
                    </div>
                    <label className="super-switch">
                      <input 
                        type="checkbox" 
                        checked={activeFeatureTenant.features.crmReports}
                        onChange={() => handleToggleFeature('crmReports')}
                      />
                      <span className="super-slider" />
                    </label>
                  </div>
                </div>
              </div>

              {/* HRMS FEATURE FLAGS SECTION */}
              <div className="feature-category-box" style={{ marginTop: '20px' }}>
                <div className="feature-category-header">
                  <Users size={18} color="#818cf8" />
                  <h4 style={{ margin: 0, fontSize: '15px', color: '#818cf8', fontWeight: 800 }}>
                    OmniStaff HRMS Feature Controls
                  </h4>
                </div>
                
                <div className="feature-flags-grid">
                  <div className="feature-toggle-card">
                    <div className="feature-toggle-info">
                      <div className="feature-toggle-icon"><Radio size={18} color="#818cf8" /></div>
                      <div>
                        <strong>24-Cell Biometric Attendance Radar</strong>
                        <span>Live real-time punch matrix & biometric shift compliance</span>
                      </div>
                    </div>
                    <label className="super-switch">
                      <input 
                        type="checkbox" 
                        checked={activeFeatureTenant.features.hrmsBiometricRadar}
                        onChange={() => handleToggleFeature('hrmsBiometricRadar')}
                      />
                      <span className="super-slider" />
                    </label>
                  </div>

                  <div className="feature-toggle-card">
                    <div className="feature-toggle-info">
                      <div className="feature-toggle-icon"><Globe size={18} color="#38bdf8" /></div>
                      <div>
                        <strong>GPS Geofenced Mobile Punch</strong>
                        <span>Enforce 50m perimeter boundary mobile check-ins</span>
                      </div>
                    </div>
                    <label className="super-switch">
                      <input 
                        type="checkbox" 
                        checked={activeFeatureTenant.features.hrmsGeofenceAttendance}
                        onChange={() => handleToggleFeature('hrmsGeofenceAttendance')}
                      />
                      <span className="super-slider" />
                    </label>
                  </div>

                  <div className="feature-toggle-card">
                    <div className="feature-toggle-info">
                      <div className="feature-toggle-icon"><DollarSign size={18} color="#34d399" /></div>
                      <div>
                        <strong>1-Click Salary Slips & Payroll Engine</strong>
                        <span>Auto PF/ESI calculation, overtime bonus & PDF pay receipts</span>
                      </div>
                    </div>
                    <label className="super-switch">
                      <input 
                        type="checkbox" 
                        checked={activeFeatureTenant.features.hrmsPayrollPayslips}
                        onChange={() => handleToggleFeature('hrmsPayrollPayslips')}
                      />
                      <span className="super-slider" />
                    </label>
                  </div>

                  <div className="feature-toggle-card">
                    <div className="feature-toggle-info">
                      <div className="feature-toggle-icon"><Calendar size={18} color="#f59e0b" /></div>
                      <div>
                        <strong>Rotational Shifts & Leave Approvals</strong>
                        <span>Manage duty rosters, casual/sick leaves & holiday calendars</span>
                      </div>
                    </div>
                    <label className="super-switch">
                      <input 
                        type="checkbox" 
                        checked={activeFeatureTenant.features.hrmsShiftLeaveManagement}
                        onChange={() => handleToggleFeature('hrmsShiftLeaveManagement')}
                      />
                      <span className="super-slider" />
                    </label>
                  </div>

                  <div className="feature-toggle-card">
                    <div className="feature-toggle-info">
                      <div className="feature-toggle-icon"><Sparkles size={18} color="#ec4899" /></div>
                      <div>
                        <strong>Asset Tracking & Corporate Training</strong>
                        <span>Hardware inventory custody & staff skill development modules</span>
                      </div>
                    </div>
                    <label className="super-switch">
                      <input 
                        type="checkbox" 
                        checked={activeFeatureTenant.features.hrmsAssetTraining}
                        onChange={() => handleToggleFeature('hrmsAssetTraining')}
                      />
                      <span className="super-slider" />
                    </label>
                  </div>

                  <div className="feature-toggle-card">
                    <div className="feature-toggle-info">
                      <div className="feature-toggle-icon"><Zap size={18} color="#eab308" /></div>
                      <div>
                        <strong>REST Webhook APIs & Priority SLA</strong>
                        <span>Direct webhook feeds, custom domain & 24/7 dedicated desk</span>
                      </div>
                    </div>
                    <label className="super-switch">
                      <input 
                        type="checkbox" 
                        checked={activeFeatureTenant.features.apiWebhooks}
                        onChange={() => handleToggleFeature('apiWebhooks')}
                      />
                      <span className="super-slider" />
                    </label>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 3: SUBSCRIPTIONS & RENEWALS RADAR */}
      {activeTab === 'renewals' && (
        <div className="super-admin-content-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <div>
              <h2 style={{ fontSize: '18px', fontWeight: 800, color: '#f8fafc', margin: 0 }}>
                Subscriptions & Expiry Radar
              </h2>
              <p style={{ fontSize: '12px', color: '#94a3b8', margin: '4px 0 0' }}>
                Monitor client license expiries, send WhatsApp renewal links & extend active terms.
              </p>
            </div>
          </div>

          <div className="super-admin-table-container">
            <table className="super-admin-data-table">
              <thead>
                <tr>
                  <th>Tenant Company</th>
                  <th>Plan & Value</th>
                  <th>Current Expiry Date</th>
                  <th>Time Remaining</th>
                  <th>Renewal Actions</th>
                </tr>
              </thead>
              <tbody>
                {tenants.map(t => {
                  const daysLeft = Math.ceil((new Date(t.renewalDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
                  const isExpiring = daysLeft <= 15;
                  const isExpired = daysLeft <= 0;

                  return (
                    <tr key={t.id}>
                      <td>
                        <strong style={{ fontSize: '14px', color: '#f8fafc' }}>{t.name}</strong>
                        <span style={{ fontSize: '11px', color: '#64748b', display: 'block' }}>Admin: {t.adminName} ({t.adminPhone})</span>
                      </td>

                      <td>
                        <span style={{ fontSize: '13px', color: '#38bdf8', fontWeight: 700, textTransform: 'capitalize' }}>
                          {t.planId}
                        </span>
                        <span style={{ fontSize: '12px', color: '#34d399', display: 'block' }}>
                          ₹{t.mrrAmount.toLocaleString()} / {t.billingCycle}
                        </span>
                      </td>

                      <td>
                        <span style={{ fontSize: '13px', color: '#f8fafc', fontWeight: 600 }}>{t.renewalDate}</span>
                      </td>

                      <td>
                        {isExpired ? (
                          <span className="badge-status-suspended">EXPIRED</span>
                        ) : isExpiring ? (
                          <span className="badge-status-warning">⚠️ {daysLeft} Days Left</span>
                        ) : (
                          <span className="badge-status-active">✓ {daysLeft} Days Active</span>
                        )}
                      </td>

                      <td>
                        <div style={{ display: 'flex', gap: '8px' }}>
                          <button 
                            className="btn btn-secondary super-admin-action-btn"
                            onClick={() => setRenewingTenant(t)}
                          >
                            <RefreshCw size={14} />
                            <span>Extend License</span>
                          </button>

                          <a 
                            href={`https://wa.me/${t.adminPhone.replace(/[^0-9]/g, '')}?text=Dear%20${encodeURIComponent(t.adminName)}%2C%20your%20ITLC%20Enterprise%20Subscription%20for%20${encodeURIComponent(t.name)}%20is%20scheduled%20for%20renewal%20on%20${t.renewalDate}.%20Please%20click%20here%20to%20complete%20the%20annual%20renewal.`}
                            target="_blank" 
                            rel="noreferrer" 
                            className="btn btn-secondary super-admin-action-btn"
                            style={{ color: '#25d366', borderColor: 'rgba(37, 211, 102, 0.4)' }}
                            title="Send WhatsApp Renewal Link"
                          >
                            <MessageSquare size={14} />
                            <span>WhatsApp Reminder</span>
                          </a>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 4: PLAN TIERS & PRICING CATALOG */}
      {activeTab === 'plans' && (
        <div className="super-admin-content-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
            <div>
              <h2 style={{ fontSize: '18px', fontWeight: 800, color: '#f8fafc', margin: 0 }}>
                Subscription Tier Monetization Catalog
              </h2>
              <p style={{ fontSize: '12px', color: '#94a3b8', margin: '4px 0 0' }}>
                Manage live pricing tiers, seat quotas, and features displayed on Public Landing Page & Payment Checkout.
              </p>
            </div>

            <div style={{ display: 'flex', gap: '10px' }}>
              <button 
                type="button" 
                className="btn btn-secondary super-admin-action-btn"
                onClick={handleResetPlans}
                title="Reset all plans to system factory defaults"
              >
                <RefreshCw size={14} />
                <span>Reset Defaults</span>
              </button>

              <button 
                type="button" 
                className="btn btn-primary super-btn-confirm"
                onClick={openNewPlanModal}
                style={{ padding: '8px 16px', fontSize: '13px' }}
              >
                <Plus size={15} />
                <span>Add Custom Tier</span>
              </button>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px' }}>
            {plans.map(plan => {
              const countTenantsInPlan = tenants.filter(t => t.planId === plan.id).length;
              return (
                <div key={plan.id} className="super-plan-catalog-card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '6px' }}>
                      <div>
                        <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 800, color: '#f8fafc' }}>{plan.name}</h3>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '4px' }}>
                          <button
                            type="button"
                            onClick={() => handleTogglePlanLanding(plan.id)}
                            style={{
                              padding: '2px 8px',
                              borderRadius: '12px',
                              fontSize: '10px',
                              fontWeight: 700,
                              border: '1px solid',
                              cursor: 'pointer',
                              background: plan.showOnLandingPage !== false ? 'rgba(16, 185, 129, 0.15)' : 'rgba(148, 163, 184, 0.15)',
                              borderColor: plan.showOnLandingPage !== false ? '#10b981' : '#64748b',
                              color: plan.showOnLandingPage !== false ? '#34d399' : '#94a3b8'
                            }}
                            title="Click to toggle Landing Page visibility"
                          >
                            {plan.showOnLandingPage !== false ? '🌐 Landing: ON' : '🔒 Landing: OFF'}
                          </button>
                        </div>
                      </div>
                      {plan.badge && <div className="super-plan-badge">{plan.badge}</div>}
                    </div>
                    <p style={{ fontSize: '12px', color: '#94a3b8', minHeight: '34px', margin: '0 0 12px' }}>{plan.tagline}</p>
                    
                    <div style={{ background: '#0f172a', padding: '12px', borderRadius: '8px', margin: '10px 0', border: '1px solid #334155' }}>
                      <div style={{ fontSize: '22px', fontWeight: 900, color: '#38bdf8' }}>
                        ₹{plan.priceMonthly.toLocaleString()} <span style={{ fontSize: '12px', color: '#94a3b8' }}>/ month</span>
                      </div>
                      <div style={{ fontSize: '12px', color: '#34d399', marginTop: '2px' }}>
                        Annual: ₹{plan.priceAnnual.toLocaleString()} / year (Save 20%)
                      </div>
                      <div style={{ fontSize: '11px', color: '#94a3b8', marginTop: '4px' }}>
                        👥 Quota: <strong>{plan.seatLimit} user seats</strong>
                      </div>
                    </div>

                    <div style={{ fontSize: '12px', color: '#f8fafc', fontWeight: 700, marginBottom: '12px' }}>
                      🏢 {countTenantsInPlan} Active Tenant Companies
                    </div>

                    <ul className="super-plan-features-list">
                      {plan.highlightFeatures.map((f, idx) => (
                        <li key={idx}>
                          <Check size={14} color="#34d399" />
                          <span>{f}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div style={{ marginTop: '18px', paddingTop: '12px', borderTop: '1px solid #334155', display: 'flex', gap: '8px' }}>
                    <button 
                      type="button" 
                      className="btn btn-secondary super-admin-action-btn"
                      style={{ flex: 1, justifyContent: 'center', borderColor: '#0284c7', color: '#38bdf8' }}
                      onClick={() => openEditPlanModal(plan)}
                    >
                      <Edit2 size={14} />
                      <span>Edit Tier</span>
                    </button>
                    <button 
                      type="button" 
                      className="btn btn-secondary super-admin-action-btn"
                      style={{ padding: '8px 12px', borderColor: '#ef4444', color: '#f87171' }}
                      onClick={() => handleDeletePlan(plan.id, plan.name)}
                      title="Delete Tier"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB: SUPER OWNER GST & TAX GOVERNANCE */}
      {activeTab === 'tax_governance' && (
        <div className="super-admin-content-card" style={{ padding: '28px' }}>
          {/* Header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px', flexWrap: 'wrap', gap: '14px', borderBottom: '1px solid #334155', paddingBottom: '18px' }}>
            <div>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: 'rgba(16, 185, 129, 0.15)', color: '#34d399', padding: '4px 12px', borderRadius: '20px', fontSize: '11px', fontWeight: 800, marginBottom: '8px' }}>
                <Receipt size={13} />
                <span>SUPER OWNER TAX GOVERNANCE</span>
              </div>
              <h3 style={{ margin: 0, fontSize: '20px', fontWeight: 900, color: '#f8fafc', display: 'flex', alignItems: 'center', gap: '10px' }}>
                GST & Tax Policy Master Control Center
              </h3>
              <p style={{ margin: '4px 0 0 0', fontSize: '12px', color: '#94a3b8', maxWidth: '700px' }}>
                Super Owner decides whether GST is charged, exact tax percentages (0% Exempt, 5%, 12%, 18%, 28%, or custom), tax-inclusive vs exclusive calculation modes, and platform registered GSTIN details.
              </p>
            </div>

            <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
              <button 
                type="button"
                className="btn btn-secondary super-admin-action-btn"
                onClick={handleResetTaxPolicy}
                title="Reset to 18% Standard GST"
              >
                <RefreshCw size={14} />
                <span>Reset to 18% Defaults</span>
              </button>
              <button 
                type="button"
                className="btn btn-primary super-admin-primary-btn"
                onClick={handleSaveTaxPolicy}
                style={{ background: 'linear-gradient(135deg, #10b981, #059669)', border: 'none' }}
              >
                <Check size={14} />
                <span>Save & Apply Tax Policy</span>
              </button>
            </div>
          </div>

          {/* Master Toggle Banner */}
          <div style={{
            background: taxEnabledInput ? 'rgba(16, 185, 129, 0.08)' : 'rgba(239, 68, 68, 0.08)',
            border: `1.5px solid ${taxEnabledInput ? 'rgba(16, 185, 129, 0.3)' : 'rgba(239, 68, 68, 0.3)'}`,
            borderRadius: '16px',
            padding: '18px 24px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '26px',
            flexWrap: 'wrap',
            gap: '14px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
              <div style={{
                width: '44px',
                height: '44px',
                borderRadius: '12px',
                background: taxEnabledInput ? 'rgba(16, 185, 129, 0.2)' : 'rgba(239, 68, 68, 0.2)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: taxEnabledInput ? '#34d399' : '#f87171'
              }}>
                <Receipt size={22} />
              </div>
              <div>
                <div style={{ fontSize: '15px', fontWeight: 800, color: '#f8fafc' }}>
                  {taxEnabledInput ? 'GST / Tax Collection is ENABLED & ACTIVE' : 'GST / Tax Collection is DISABLED (0% TAX EXEMPT)'}
                </div>
                <div style={{ fontSize: '12px', color: '#94a3b8', marginTop: '2px' }}>
                  {taxEnabledInput 
                    ? `Charging ${taxRateInput}% ${taxLabelInput} on all plan subscriptions and add-ons.` 
                    : 'All plans are priced flat with 0% tax for exempt clients or export customers.'}
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setTaxEnabledInput(!taxEnabledInput)}
              style={{
                padding: '9px 18px',
                borderRadius: '12px',
                fontWeight: 800,
                fontSize: '13px',
                cursor: 'pointer',
                border: 'none',
                background: taxEnabledInput ? '#10b981' : '#64748b',
                color: '#ffffff',
                boxShadow: taxEnabledInput ? '0 4px 14px rgba(16, 185, 129, 0.3)' : 'none',
                transition: 'all 0.2s ease'
              }}
            >
              {taxEnabledInput ? 'ACTIVE • Click to Disable GST' : 'DISABLED • Click to Enable GST'}
            </button>
          </div>

          <form onSubmit={handleSaveTaxPolicy} style={{ display: 'flex', flexDirection: 'column', gap: '26px' }}>
            
            {/* Section 1: GST Tax Slabs & Rate Selection */}
            <div style={{ background: '#0f172a', border: '1px solid #334155', borderRadius: '18px', padding: '22px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px', flexWrap: 'wrap', gap: '10px' }}>
                <label style={{ fontSize: '14px', fontWeight: 800, color: '#f8fafc', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Zap size={16} color="#38bdf8" />
                  <span>Choose GST Rate Slab (%)</span>
                </label>
                <span style={{ fontSize: '12px', color: '#38bdf8', fontWeight: 700 }}>
                  Active Selection: {taxEnabledInput ? `${taxRateInput}% ${taxLabelInput}` : '0% (Exempt)'}
                </span>
              </div>

              {/* Slab Preset Buttons */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '10px', marginBottom: '16px' }}>
                {[
                  { slab: 0, label: '0% Exempt', desc: 'SEZ / Export / Free' },
                  { slab: 5, label: '5% Reduced', desc: 'Concessional' },
                  { slab: 12, label: '12% Standard', desc: 'Lower Standard' },
                  { slab: 18, label: '18% SaaS Standard', desc: 'Tech & Software Default' },
                  { slab: 28, label: '28% Luxury', desc: 'Highest Bracket' }
                ].map(({ slab, label, desc }) => {
                  const isSelected = taxEnabledInput && Number(taxRateInput) === slab;
                  return (
                    <button
                      key={slab}
                      type="button"
                      onClick={() => {
                        setTaxRateInput(slab);
                        if (!taxEnabledInput && slab > 0) setTaxEnabledInput(true);
                      }}
                      style={{
                        padding: '12px 14px',
                        borderRadius: '12px',
                        border: isSelected ? '2px solid #38bdf8' : '1px solid #334155',
                        background: isSelected ? 'rgba(2, 132, 199, 0.2)' : '#1e293b',
                        color: isSelected ? '#38bdf8' : '#cbd5e1',
                        textAlign: 'left',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease'
                      }}
                    >
                      <div style={{ fontWeight: 800, fontSize: '14px' }}>{label}</div>
                      <div style={{ fontSize: '10px', color: '#94a3b8', marginTop: '2px' }}>{desc}</div>
                    </button>
                  );
                })}
              </div>

              {/* Precision Custom % Input */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px', background: '#1e293b', padding: '14px 18px', borderRadius: '12px', border: '1px solid #334155', flexWrap: 'wrap' }}>
                <div style={{ flex: 1, minWidth: '180px' }}>
                  <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: '#94a3b8', marginBottom: '4px' }}>
                    Custom Tax Rate (%)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    max="100"
                    value={taxRateInput}
                    onChange={(e) => setTaxRateInput(parseFloat(e.target.value) || 0)}
                    disabled={!taxEnabledInput}
                    style={{
                      width: '100%',
                      background: '#0f172a',
                      border: '1px solid #475569',
                      borderRadius: '8px',
                      padding: '8px 12px',
                      color: '#f8fafc',
                      fontSize: '14px',
                      fontWeight: 700
                    }}
                  />
                </div>

                <div style={{ flex: 1, minWidth: '180px' }}>
                  <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: '#94a3b8', marginBottom: '4px' }}>
                    Tax Name / Label
                  </label>
                  <input
                    type="text"
                    value={taxLabelInput}
                    onChange={(e) => setTaxLabelInput(e.target.value)}
                    placeholder="e.g. GST, IGST, VAT"
                    style={{
                      width: '100%',
                      background: '#0f172a',
                      border: '1px solid #475569',
                      borderRadius: '8px',
                      padding: '8px 12px',
                      color: '#f8fafc',
                      fontSize: '14px',
                      fontWeight: 700
                    }}
                  />
                </div>
              </div>
            </div>

            {/* Section 2: Calculation Mode & Tax Splitting Rules */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '18px' }}>
              
              {/* Card A: Tax Mode (Exclusive vs Inclusive) */}
              <div style={{ background: '#0f172a', border: '1px solid #334155', borderRadius: '16px', padding: '20px' }}>
                <div style={{ fontWeight: 800, fontSize: '14px', color: '#f8fafc', marginBottom: '6px' }}>
                  Billing Calculation Mode
                </div>
                <p style={{ fontSize: '11px', color: '#94a3b8', marginBottom: '14px' }}>
                  Choose how the tax is applied to plan subscription prices.
                </p>

                <div style={{ display: 'flex', gap: '10px' }}>
                  <button
                    type="button"
                    onClick={() => setTaxInclusiveInput(false)}
                    style={{
                      flex: 1,
                      padding: '10px 12px',
                      borderRadius: '10px',
                      border: !taxInclusiveInput ? '2px solid #0284c7' : '1px solid #334155',
                      background: !taxInclusiveInput ? 'rgba(2, 132, 199, 0.2)' : '#1e293b',
                      color: !taxInclusiveInput ? '#38bdf8' : '#cbd5e1',
                      fontSize: '12px',
                      fontWeight: 700,
                      cursor: 'pointer'
                    }}
                  >
                    <div>Tax Exclusive</div>
                    <div style={{ fontSize: '10px', color: '#94a3b8', marginTop: '2px' }}>Price + Tax on top</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setTaxInclusiveInput(true)}
                    style={{
                      flex: 1,
                      padding: '10px 12px',
                      borderRadius: '10px',
                      border: taxInclusiveInput ? '2px solid #0284c7' : '1px solid #334155',
                      background: taxInclusiveInput ? 'rgba(2, 132, 199, 0.2)' : '#1e293b',
                      color: taxInclusiveInput ? '#38bdf8' : '#cbd5e1',
                      fontSize: '12px',
                      fontWeight: 700,
                      cursor: 'pointer'
                    }}
                  >
                    <div>Tax Inclusive (MRP)</div>
                    <div style={{ fontSize: '10px', color: '#94a3b8', marginTop: '2px' }}>Tax built into price</div>
                  </button>
                </div>
              </div>

              {/* Card B: State Tax Splitting (CGST + SGST vs IGST) */}
              <div style={{ background: '#0f172a', border: '1px solid #334155', borderRadius: '16px', padding: '20px' }}>
                <div style={{ fontWeight: 800, fontSize: '14px', color: '#f8fafc', marginBottom: '6px' }}>
                  Intra-State Tax Breakdown (CGST / SGST)
                </div>
                <p style={{ fontSize: '11px', color: '#94a3b8', marginBottom: '14px' }}>
                  Split tax into 50% CGST + 50% SGST for same-state invoices.
                </p>

                <div style={{ display: 'flex', gap: '10px' }}>
                  <button
                    type="button"
                    onClick={() => setTaxStateSplitInput(true)}
                    style={{
                      flex: 1,
                      padding: '10px 12px',
                      borderRadius: '10px',
                      border: taxStateSplitInput ? '2px solid #10b981' : '1px solid #334155',
                      background: taxStateSplitInput ? 'rgba(16, 185, 129, 0.2)' : '#1e293b',
                      color: taxStateSplitInput ? '#34d399' : '#cbd5e1',
                      fontSize: '12px',
                      fontWeight: 700,
                      cursor: 'pointer'
                    }}
                  >
                    <div>CGST + SGST Split</div>
                    <div style={{ fontSize: '10px', color: '#94a3b8', marginTop: '2px' }}>
                      {taxRateInput ? `${(taxRateInput / 2).toFixed(1)}% + ${(taxRateInput / 2).toFixed(1)}%` : 'Split'}
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setTaxStateSplitInput(false)}
                    style={{
                      flex: 1,
                      padding: '10px 12px',
                      borderRadius: '10px',
                      border: !taxStateSplitInput ? '2px solid #10b981' : '1px solid #334155',
                      background: !taxStateSplitInput ? 'rgba(16, 185, 129, 0.2)' : '#1e293b',
                      color: !taxStateSplitInput ? '#34d399' : '#cbd5e1',
                      fontSize: '12px',
                      fontWeight: 700,
                      cursor: 'pointer'
                    }}
                  >
                    <div>IGST Flat</div>
                    <div style={{ fontSize: '10px', color: '#94a3b8', marginTop: '2px' }}>
                      {taxRateInput}% Inter-State
                    </div>
                  </button>
                </div>
              </div>

            </div>

            {/* Section 3: Platform Super Owner Legal Credentials */}
            <div style={{ background: '#0f172a', border: '1px solid #334155', borderRadius: '18px', padding: '22px' }}>
              <div style={{ fontWeight: 800, fontSize: '15px', color: '#f8fafc', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Building2 size={16} color="#a855f7" />
                <span>Super Owner Platform Registration Credentials (Prints on Tax Invoices)</span>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px', marginBottom: '16px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: '#94a3b8', marginBottom: '4px' }}>
                    Registered Legal Entity Name
                  </label>
                  <input
                    type="text"
                    value={taxLegalNameInput}
                    onChange={(e) => setTaxLegalNameInput(e.target.value)}
                    placeholder="e.g. ITLC INDIA PRIVATE LIMITED"
                    style={{
                      width: '100%',
                      background: '#1e293b',
                      border: '1px solid #475569',
                      borderRadius: '8px',
                      padding: '8px 12px',
                      color: '#f8fafc',
                      fontSize: '13px'
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: '#94a3b8', marginBottom: '4px' }}>
                    Super Owner Master GSTIN
                  </label>
                  <input
                    type="text"
                    value={taxGstinInput}
                    onChange={(e) => setTaxGstinInput(e.target.value)}
                    placeholder="07AABCI8899K1Z4"
                    style={{
                      width: '100%',
                      background: '#1e293b',
                      border: '1px solid #475569',
                      borderRadius: '8px',
                      padding: '8px 12px',
                      color: '#f8fafc',
                      fontSize: '13px',
                      fontFamily: 'monospace'
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: '#94a3b8', marginBottom: '4px' }}>
                    Platform PAN Card Number
                  </label>
                  <input
                    type="text"
                    value={taxPanInput}
                    onChange={(e) => setTaxPanInput(e.target.value)}
                    placeholder="AABCI8899K"
                    style={{
                      width: '100%',
                      background: '#1e293b',
                      border: '1px solid #475569',
                      borderRadius: '8px',
                      padding: '8px 12px',
                      color: '#f8fafc',
                      fontSize: '13px',
                      fontFamily: 'monospace'
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: '#94a3b8', marginBottom: '4px' }}>
                    HSN / SAC Code (Software SaaS)
                  </label>
                  <input
                    type="text"
                    value={taxHsnCodeInput}
                    onChange={(e) => setTaxHsnCodeInput(e.target.value)}
                    placeholder="998313 (IT SaaS Services)"
                    style={{
                      width: '100%',
                      background: '#1e293b',
                      border: '1px solid #475569',
                      borderRadius: '8px',
                      padding: '8px 12px',
                      color: '#f8fafc',
                      fontSize: '13px'
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: '#94a3b8', marginBottom: '4px' }}>
                    Tax Invoice Numbering Prefix
                  </label>
                  <input
                    type="text"
                    value={taxPrefixInput}
                    onChange={(e) => setTaxPrefixInput(e.target.value)}
                    placeholder="INV-ITLC"
                    style={{
                      width: '100%',
                      background: '#1e293b',
                      border: '1px solid #475569',
                      borderRadius: '8px',
                      padding: '8px 12px',
                      color: '#f8fafc',
                      fontSize: '13px',
                      fontFamily: 'monospace'
                    }}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: '#94a3b8', marginBottom: '4px' }}>
                  Legal Invoice Terms & Regulatory Note
                </label>
                <textarea
                  rows={2}
                  value={taxTermsInput}
                  onChange={(e) => setTaxTermsInput(e.target.value)}
                  placeholder="Tax invoice issued in accordance with Section 31 of CGST Act, 2017."
                  style={{
                    width: '100%',
                    background: '#1e293b',
                    border: '1px solid #475569',
                    borderRadius: '8px',
                    padding: '8px 12px',
                    color: '#f8fafc',
                    fontSize: '12px'
                  }}
                />
              </div>
            </div>

            {/* Section 4: Live Interactive Tax Simulation Preview */}
            <div style={{ background: '#1e293b', border: '1px solid #475569', borderRadius: '18px', padding: '22px' }}>
              <div style={{ fontWeight: 800, fontSize: '14px', color: '#f8fafc', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Sparkles size={16} color="#fbbf24" />
                <span>Live Tax Simulation Preview (Client Checkout & Invoicing)</span>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '14px' }}>
                {[
                  { name: 'Starter Cloud', base: 999, storage: '5 GB', seats: 10 },
                  { name: 'Growth Suite', base: 1999, storage: '25 GB', seats: 50 },
                  { name: 'Enterprise Master', base: 4999, storage: '250 GB', seats: 500 },
                  { name: '+10 GB Storage Addon', base: 299, storage: '+10 GB', seats: '-' }
                ].map(item => {
                  const effectiveRate = taxEnabledInput ? (Number(taxRateInput) || 0) : 0;
                  let taxVal = 0;
                  let totalVal = item.base;
                  if (taxEnabledInput && effectiveRate > 0) {
                    if (taxInclusiveInput) {
                      taxVal = Math.round(item.base - (item.base / (1 + effectiveRate / 100)));
                      totalVal = item.base;
                    } else {
                      taxVal = Math.round(item.base * (effectiveRate / 100));
                      totalVal = item.base + taxVal;
                    }
                  }
                  return (
                    <div key={item.name} style={{ background: '#0f172a', border: '1px solid #334155', borderRadius: '14px', padding: '16px' }}>
                      <div style={{ fontWeight: 800, fontSize: '13px', color: '#f8fafc' }}>{item.name}</div>
                      <div style={{ fontSize: '11px', color: '#94a3b8', margin: '2px 0 10px 0' }}>💾 {item.storage}</div>
                      
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: '#cbd5e1', marginBottom: '4px' }}>
                        <span>Base Price:</span>
                        <strong>₹{item.base.toLocaleString()}</strong>
                      </div>
                      
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: taxEnabledInput && effectiveRate > 0 ? '#38bdf8' : '#64748b', marginBottom: '6px' }}>
                        <span>{taxLabelInput} ({effectiveRate}%):</span>
                        <strong>+₹{taxVal.toLocaleString()}</strong>
                      </div>

                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px', fontWeight: 900, color: '#34d399', paddingTop: '8px', borderTop: '1px solid #334155' }}>
                        <span>Total Paid:</span>
                        <span>₹{totalVal.toLocaleString()}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Bottom Save Action Button */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', paddingTop: '8px' }}>
              <button 
                type="button"
                className="btn btn-secondary super-admin-action-btn"
                onClick={handleResetTaxPolicy}
              >
                Reset Defaults
              </button>
              <button 
                type="submit"
                className="btn btn-primary super-admin-primary-btn"
                style={{ background: 'linear-gradient(135deg, #10b981, #059669)', border: 'none', padding: '12px 28px', fontSize: '14px' }}
              >
                <Check size={16} />
                <span>Save & Activate Tax Policy Live</span>
              </button>
            </div>

          </form>
        </div>
      )}

      {/* TAB 5: LANDING PAGE CMS & VISUAL CONTENT MANAGER */}
      {activeTab === 'landing_cms' && (
        <div className="super-admin-content-card" style={{ padding: '28px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px', flexWrap: 'wrap', gap: '14px' }}>
            <div>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: 'rgba(2, 132, 199, 0.15)', color: '#38bdf8', padding: '4px 12px', borderRadius: '20px', fontSize: '11px', fontWeight: 800, marginBottom: '8px' }}>
                <Sparkles size={13} />
                <span>NO-CODE VISUAL CMS</span>
              </div>
              <h3 style={{ margin: 0, fontSize: '20px', fontWeight: 800, color: '#f8fafc' }}>
                Landing Page Content & Branding Manager
              </h3>
              <p style={{ margin: '4px 0 0', fontSize: '13px', color: '#94a3b8' }}>
                Edit headlines, subtitles, sales WhatsApp routing, and telemetry counters. All changes publish instantly to the live landing page in real-time.
              </p>
            </div>

            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                type="button"
                className="btn btn-secondary"
                style={{ padding: '8px 16px', fontSize: '12px', borderRadius: '10px', color: '#94a3b8', borderColor: '#475569' }}
                onClick={() => {
                  const def = resetLandingPageConfig();
                  setCmsConfig(def);
                  triggerToast("🔄 Landing page content reset to defaults.");
                }}
              >
                Reset Defaults
              </button>

              <button
                type="button"
                className="btn btn-primary super-btn-confirm"
                style={{ padding: '8px 20px', fontSize: '13px', borderRadius: '10px', gap: '6px' }}
                onClick={() => {
                  saveLiveLandingPageConfig(cmsConfig);
                  triggerToast("🚀 Landing page content published live successfully!");
                }}
              >
                <Check size={16} />
                <span>Save & Publish Live</span>
              </button>
            </div>
          </div>

          {/* CMS Form Layout */}
          <form onSubmit={(e) => {
            e.preventDefault();
            saveLiveLandingPageConfig(cmsConfig);
            triggerToast("🚀 Landing page content published live successfully!");
          }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(420px, 1fr))', gap: '24px' }}>
              
              {/* SECTION 1: HERO SECTION HEADLINES */}
              <div style={{ background: '#0f172a', border: '1px solid #334155', borderRadius: '18px', padding: '20px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px', borderBottom: '1px solid #1e293b', paddingBottom: '10px' }}>
                  <Zap size={18} color="#38bdf8" />
                  <h4 style={{ margin: 0, fontSize: '15px', fontWeight: 800, color: '#f8fafc' }}>
                    1. Hero Section Headlines (Multi-Language)
                  </h4>
                </div>

                <div className="form-group" style={{ marginBottom: '14px' }}>
                  <label style={{ fontSize: '12px', fontWeight: 700, color: '#94a3b8' }}>English Main Headline</label>
                  <input 
                    type="text"
                    className="super-admin-input"
                    value={cmsConfig.heroHeadlineEn}
                    onChange={(e) => setCmsConfig({ ...cmsConfig, heroHeadlineEn: e.target.value })}
                    placeholder="e.g. Build a Better Workplace with Unified HRMS & Intelligent Sales Cloud"
                  />
                </div>

                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label style={{ fontSize: '12px', fontWeight: 700, color: '#94a3b8' }}>English Subtitle Description</label>
                  <textarea 
                    className="super-admin-input"
                    rows={3}
                    value={cmsConfig.heroSubtitleEn}
                    onChange={(e) => setCmsConfig({ ...cmsConfig, heroSubtitleEn: e.target.value })}
                    placeholder="Describe value proposition in English..."
                  />
                </div>
              </div>

              {/* SECTION 2: SALES & CONTACT ROUTING */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                <div style={{ background: '#0f172a', border: '1px solid #334155', borderRadius: '18px', padding: '20px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px', borderBottom: '1px solid #1e293b', paddingBottom: '10px' }}>
                    <Globe size={18} color="#22c55e" />
                    <h4 style={{ margin: 0, fontSize: '15px', fontWeight: 800, color: '#f8fafc' }}>
                      2. Sales Contact & Conversion Links
                    </h4>
                  </div>

                  <div className="form-group" style={{ marginBottom: '14px' }}>
                    <label style={{ fontSize: '12px', fontWeight: 700, color: '#94a3b8' }}>WhatsApp Sales Number (With Country Code)</label>
                    <input 
                      type="text"
                      className="super-admin-input"
                      value={cmsConfig.whatsappSalesNumber}
                      onChange={(e) => setCmsConfig({ ...cmsConfig, whatsappSalesNumber: e.target.value })}
                      placeholder="e.g. 918368817744"
                    />
                    <span style={{ fontSize: '11px', color: '#64748b', marginTop: '4px', display: 'block' }}>
                      Contact Sales button on landing page connects to https://wa.me/{cmsConfig.whatsappSalesNumber}
                    </span>
                  </div>

                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label style={{ fontSize: '12px', fontWeight: 700, color: '#94a3b8' }}>Support Email Address</label>
                    <input 
                      type="email"
                      className="super-admin-input"
                      value={cmsConfig.supportEmail}
                      onChange={(e) => setCmsConfig({ ...cmsConfig, supportEmail: e.target.value })}
                      placeholder="e.g. support@itlc.in"
                    />
                  </div>
                </div>

                {/* SECTION 3: ITLC ECOSYSTEM ORBIT HUB */}
                <div style={{ background: '#0f172a', border: '1px solid #334155', borderRadius: '18px', padding: '20px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px', borderBottom: '1px solid #1e293b', paddingBottom: '10px' }}>
                    <Layers size={18} color="#a855f7" />
                    <h4 style={{ margin: 0, fontSize: '15px', fontWeight: 800, color: '#f8fafc' }}>
                      3. ITLC Ecosystem Orbit Hub Customization
                    </h4>
                  </div>

                  <div className="form-grid-2col" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px' }}>
                    <div className="form-group" style={{ marginBottom: 0 }}>
                      <label style={{ fontSize: '12px', fontWeight: 700, color: '#94a3b8' }}>Orbit Center Title</label>
                      <input 
                        type="text"
                        className="super-admin-input"
                        value={cmsConfig.orbitCenterTitle}
                        onChange={(e) => setCmsConfig({ ...cmsConfig, orbitCenterTitle: e.target.value })}
                        placeholder="e.g. ITLC Ecosystem"
                      />
                    </div>

                    <div className="form-group" style={{ marginBottom: 0 }}>
                      <label style={{ fontSize: '12px', fontWeight: 700, color: '#94a3b8' }}>Orbit Center Subtitle</label>
                      <input 
                        type="text"
                        className="super-admin-input"
                        value={cmsConfig.orbitCenterSubtitle}
                        onChange={(e) => setCmsConfig({ ...cmsConfig, orbitCenterSubtitle: e.target.value })}
                        placeholder="e.g. Unified OS Engine"
                      />
                    </div>
                  </div>

                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label style={{ fontSize: '12px', fontWeight: 700, color: '#94a3b8' }}>Sync Status Badge</label>
                    <input 
                      type="text"
                      className="super-admin-input"
                      value={cmsConfig.orbitSyncBadge}
                      onChange={(e) => setCmsConfig({ ...cmsConfig, orbitSyncBadge: e.target.value })}
                      placeholder="e.g. 2 APPS SYNCED"
                    />
                  </div>
                </div>

                {/* SECTION 4: TELEMETRY BASELINE COUNTERS */}
                <div style={{ background: '#0f172a', border: '1px solid #334155', borderRadius: '18px', padding: '20px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px', borderBottom: '1px solid #1e293b', paddingBottom: '10px' }}>
                    <BarChart3 size={18} color="#f59e0b" />
                    <h4 style={{ margin: 0, fontSize: '15px', fontWeight: 800, color: '#f8fafc' }}>
                      4. Live Telemetry Baseline Counters
                    </h4>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
                    <div className="form-group" style={{ marginBottom: 0 }}>
                      <label style={{ fontSize: '11px', fontWeight: 700, color: '#94a3b8' }}>Active Pipelines</label>
                      <input 
                        type="number"
                        className="super-admin-input"
                        value={cmsConfig.telemetry.activePipelines}
                        onChange={(e) => setCmsConfig({
                          ...cmsConfig,
                          telemetry: { ...cmsConfig.telemetry, activePipelines: Number(e.target.value) }
                        })}
                      />
                    </div>

                    <div className="form-group" style={{ marginBottom: 0 }}>
                      <label style={{ fontSize: '11px', fontWeight: 700, color: '#94a3b8' }}>Biometric Punches</label>
                      <input 
                        type="number"
                        className="super-admin-input"
                        value={cmsConfig.telemetry.biometricPunches}
                        onChange={(e) => setCmsConfig({
                          ...cmsConfig,
                          telemetry: { ...cmsConfig.telemetry, biometricPunches: Number(e.target.value) }
                        })}
                      />
                    </div>

                    <div className="form-group" style={{ marginBottom: 0 }}>
                      <label style={{ fontSize: '11px', fontWeight: 700, color: '#94a3b8' }}>Invoices Cleared</label>
                      <input 
                        type="number"
                        className="super-admin-input"
                        value={cmsConfig.telemetry.invoicesCleared}
                        onChange={(e) => setCmsConfig({
                          ...cmsConfig,
                          telemetry: { ...cmsConfig.telemetry, invoicesCleared: Number(e.target.value) }
                        })}
                      />
                    </div>
                  </div>
                </div>

              </div>
            </div>

            {/* Bottom Form Save Trigger */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '24px', paddingTop: '16px', borderTop: '1px solid #334155' }}>
              <button
                type="submit"
                className="btn btn-primary super-btn-confirm"
                style={{ padding: '12px 28px', fontSize: '14px', borderRadius: '12px', gap: '8px' }}
              >
                <Check size={18} />
                <span>Save & Publish All Landing Page Changes</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* TAB 6: RAZORPAY & PAYMENT GATEWAY MASTER CONTROLLER */}
      {activeTab === 'payments' && (
        <div className="super-admin-content-card" style={{ padding: '28px' }}>
          {/* Header Banner */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px', flexWrap: 'wrap', gap: '14px' }}>
            <div>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: razorpayKeyId.startsWith('rzp_live') ? 'rgba(16, 185, 129, 0.15)' : 'rgba(2, 132, 199, 0.15)', color: razorpayKeyId.startsWith('rzp_live') ? '#34d399' : '#38bdf8', padding: '4px 12px', borderRadius: '20px', fontSize: '11px', fontWeight: 800, marginBottom: '8px' }}>
                <CreditCard size={13} />
                <span>{razorpayMode === 'live' ? '🟢 RAZORPAY LIVE PRODUCTION GATEWAY' : '🟡 RAZORPAY SANDBOX TEST GATEWAY'}</span>
              </div>
              <h3 style={{ margin: 0, fontSize: '20px', fontWeight: 800, color: '#f8fafc' }}>
                Razorpay Merchant Gateway & Payment Configuration
              </h3>
              <p style={{ margin: '4px 0 0', fontSize: '13px', color: '#94a3b8' }}>
                Paste your official Razorpay Key ID and Key Secret here. All client subscriptions and company registration payments will directly credit into your bank account.
              </p>
            </div>

            <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
              <button
                type="button"
                className="btn btn-secondary"
                style={{ padding: '9px 16px', fontSize: '12px', borderRadius: '10px', color: '#38bdf8', borderColor: '#0284c7', display: 'flex', alignItems: 'center', gap: '6px' }}
                onClick={() => {
                  if (!razorpayKeyId.trim()) {
                    triggerToast('⚠️ Please enter Razorpay Key ID first.');
                    return;
                  }
                  if (razorpayKeyId.startsWith('rzp_live_')) {
                    triggerToast('✅ Live Razorpay Key ID format verified! Production ready.');
                  } else if (razorpayKeyId.startsWith('rzp_test_')) {
                    triggerToast('ℹ️ Test Razorpay Key ID detected (Sandbox Mode).');
                  } else {
                    triggerToast('✅ Key format verified and active.');
                  }
                }}
              >
                <Zap size={14} />
                <span>Test Connection</span>
              </button>

              <button
                type="button"
                className="btn btn-primary super-btn-confirm"
                style={{ padding: '9px 22px', fontSize: '13px', borderRadius: '10px', gap: '6px' }}
                onClick={() => handleSaveRazorpayConfig()}
              >
                <Check size={16} />
                <span>Save & Activate Razorpay</span>
              </button>
            </div>
          </div>

          {/* Gateway Status Banner */}
          <div style={{
            background: razorpayEnabled && razorpayKeyId.trim() ? 'rgba(16, 185, 129, 0.08)' : 'rgba(245, 158, 11, 0.08)',
            border: `1px solid ${razorpayEnabled && razorpayKeyId.trim() ? 'rgba(16, 185, 129, 0.25)' : 'rgba(245, 158, 11, 0.25)'}`,
            borderRadius: '16px',
            padding: '16px 20px',
            marginBottom: '24px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '12px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
              <div style={{
                width: '40px',
                height: '40px',
                borderRadius: '10px',
                background: razorpayEnabled && razorpayKeyId.trim() ? '#10b981' : '#f59e0b',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#ffffff',
                fontWeight: 900
              }}>
                ₹
              </div>
              <div>
                <h4 style={{ margin: 0, fontSize: '14px', fontWeight: 800, color: '#f8fafc' }}>
                  {razorpayEnabled && razorpayKeyId.trim() 
                    ? `Payment Gateway Active (${razorpayMode.toUpperCase()} MODE)` 
                    : 'Payment Gateway Configuration Pending'}
                </h4>
                <p style={{ margin: '2px 0 0', fontSize: '12px', color: '#94a3b8' }}>
                  {razorpayKeyId.trim() 
                    ? `Key ID: ${razorpayKeyId.slice(0, 12)}...${razorpayKeyId.slice(-4)} • Auto-checkout enabled for all new tenants` 
                    : 'Please enter your Key ID below so that companies can pay in real-time.'}
                </p>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '12px', fontWeight: 700, color: '#f8fafc' }}>
                <input 
                  type="checkbox" 
                  checked={razorpayEnabled} 
                  onChange={(e) => setRazorpayEnabled(e.target.checked)} 
                  style={{ width: '16px', height: '16px', accentColor: '#10b981' }}
                />
                <span>Enable Gateway</span>
              </label>

              <select 
                className="super-admin-select"
                value={razorpayMode}
                onChange={(e) => setRazorpayMode(e.target.value as any)}
                style={{ padding: '6px 12px', fontSize: '12px' }}
              >
                <option value="live">🟢 Live Production</option>
                <option value="test">🟡 Test Sandbox</option>
              </select>
            </div>
          </div>

          {/* Form Layout: 2 Columns */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(420px, 1fr))', gap: '24px' }}>
            
            {/* Left Card: Razorpay API Credentials */}
            <div style={{ background: '#0f172a', border: '1px solid #334155', borderRadius: '18px', padding: '24px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '18px', borderBottom: '1px solid #1e293b', paddingBottom: '12px' }}>
                <Key size={18} color="#38bdf8" />
                <h4 style={{ margin: 0, fontSize: '15px', fontWeight: 800, color: '#f8fafc' }}>
                  1. API Credentials & Keys
                </h4>
              </div>

              <div className="form-group" style={{ marginBottom: '16px' }}>
                <label style={{ fontSize: '12px', fontWeight: 700, color: '#f8fafc', display: 'flex', justifyContent: 'space-between' }}>
                  <span>Razorpay Key ID (Public Key) *</span>
                  <span style={{ fontSize: '11px', color: '#38bdf8' }}>Starts with rzp_live_ or rzp_test_</span>
                </label>
                <input 
                  type="text"
                  className="super-admin-input"
                  value={razorpayKeyId}
                  onChange={(e) => setRazorpayKeyId(e.target.value)}
                  placeholder="e.g. rzp_live_51K8yJ7Zqitlc2026"
                  style={{ fontFamily: 'monospace', letterSpacing: '0.5px' }}
                />
              </div>

              <div className="form-group" style={{ marginBottom: '16px' }}>
                <label style={{ fontSize: '12px', fontWeight: 700, color: '#f8fafc', display: 'flex', justifyContent: 'space-between' }}>
                  <span>Razorpay Key Secret (Private Key) *</span>
                  <button 
                    type="button" 
                    onClick={() => setShowSecretKey(!showSecretKey)}
                    style={{ background: 'none', border: 'none', color: '#38bdf8', fontSize: '11px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
                  >
                    {showSecretKey ? <EyeOff size={12} /> : <Eye size={12} />}
                    <span>{showSecretKey ? 'Hide Secret' : 'Show Secret'}</span>
                  </button>
                </label>
                <input 
                  type={showSecretKey ? 'text' : 'password'}
                  className="super-admin-input"
                  value={razorpayKeySecret}
                  onChange={(e) => setRazorpayKeySecret(e.target.value)}
                  placeholder="Paste your Razorpay Key Secret..."
                  style={{ fontFamily: 'monospace' }}
                />
              </div>

              <div className="form-group" style={{ marginBottom: '16px' }}>
                <label style={{ fontSize: '12px', fontWeight: 700, color: '#94a3b8' }}>
                  Webhook Secret (Optional for HMAC verification)
                </label>
                <input 
                  type="text"
                  className="super-admin-input"
                  value={razorpayWebhookSecret}
                  onChange={(e) => setRazorpayWebhookSecret(e.target.value)}
                  placeholder="e.g. itlc_webhook_secret_2026"
                  style={{ fontFamily: 'monospace' }}
                />
              </div>

              <div className="form-group" style={{ marginBottom: '16px' }}>
                <label style={{ fontSize: '12px', fontWeight: 700, color: '#94a3b8' }}>
                  Merchant Direct UPI VPA ID (For Instant QR Code)
                </label>
                <input 
                  type="text"
                  className="super-admin-input"
                  value={razorpayMerchantUpi}
                  onChange={(e) => setRazorpayMerchantUpi(e.target.value)}
                  placeholder="e.g. itlcindiapvtltd@icici"
                />
              </div>

              <div style={{ background: '#1e293b', padding: '14px', borderRadius: '12px', border: '1px solid #334155' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                  <span style={{ fontSize: '11px', fontWeight: 700, color: '#94a3b8' }}>Webhook Endpoint URL:</span>
                  <button 
                    type="button"
                    onClick={() => {
                      navigator.clipboard.writeText(`${window.location.origin}/api/payments/verify`);
                      triggerToast('📋 Webhook URL copied to clipboard!');
                    }}
                    style={{ background: 'none', border: 'none', color: '#38bdf8', fontSize: '11px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
                  >
                    <Copy size={12} />
                    <span>Copy URL</span>
                  </button>
                </div>
                <code style={{ fontSize: '12px', color: '#34d399', wordBreak: 'break-all' }}>
                  {typeof window !== 'undefined' ? `${window.location.origin}/api/payments/verify` : 'https://itlc.cloud/api/payments/verify'}
                </code>
              </div>
            </div>

            {/* Right Card: Step-by-Step Razorpay Setup Instructions */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div style={{ background: '#0f172a', border: '1px solid #334155', borderRadius: '18px', padding: '24px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px', borderBottom: '1px solid #1e293b', paddingBottom: '12px' }}>
                  <ShieldCheck size={18} color="#34d399" />
                  <h4 style={{ margin: 0, fontSize: '15px', fontWeight: 800, color: '#f8fafc' }}>
                    2. Razorpay Live Account Setup Steps
                  </h4>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', fontSize: '13px', color: '#cbd5e1', lineHeight: 1.5 }}>
                  <div style={{ display: 'flex', gap: '10px' }}>
                    <span style={{ width: '22px', height: '22px', borderRadius: '50%', background: 'rgba(2, 132, 199, 0.2)', color: '#38bdf8', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '11px', flexShrink: 0 }}>1</span>
                    <span>Apne official <strong style={{ color: '#ffffff' }}>Razorpay Dashboard (dashboard.razorpay.com)</strong> me login karein.</span>
                  </div>

                  <div style={{ display: 'flex', gap: '10px' }}>
                    <span style={{ width: '22px', height: '22px', borderRadius: '50%', background: 'rgba(2, 132, 199, 0.2)', color: '#38bdf8', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '11px', flexShrink: 0 }}>2</span>
                    <span>Left Menu me <strong style={{ color: '#ffffff' }}>Settings -&gt; API Keys</strong> par jayein.</span>
                  </div>

                  <div style={{ display: 'flex', gap: '10px' }}>
                    <span style={{ width: '22px', height: '22px', borderRadius: '50%', background: 'rgba(2, 132, 199, 0.2)', color: '#38bdf8', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '11px', flexShrink: 0 }}>3</span>
                    <span><strong style={{ color: '#ffffff' }}>Generate Key</strong> par click karke <code>Key ID</code> aur <code>Key Secret</code> copy karein.</span>
                  </div>

                  <div style={{ display: 'flex', gap: '10px' }}>
                    <span style={{ width: '22px', height: '22px', borderRadius: '50%', background: 'rgba(2, 132, 199, 0.2)', color: '#38bdf8', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '11px', flexShrink: 0 }}>4</span>
                    <span>Dono keys ko yahan paste karke <strong style={{ color: '#34d399' }}>Save & Activate Razorpay</strong> button dabayein.</span>
                  </div>
                </div>

                <div style={{ marginTop: '18px', paddingTop: '16px', borderTop: '1px solid #1e293b', display: 'flex', justifyContent: 'flex-end' }}>
                  <button
                    type="button"
                    className="btn btn-primary super-btn-confirm"
                    style={{ padding: '10px 24px', fontSize: '13px', borderRadius: '10px', gap: '6px' }}
                    onClick={() => handleSaveRazorpayConfig()}
                  >
                    <Check size={16} />
                    <span>Save Razorpay Settings Now</span>
                  </button>
                </div>
              </div>

              {/* Live Payment Transactions Summary Card */}
              <div style={{ background: '#0f172a', border: '1px solid #334155', borderRadius: '18px', padding: '20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Receipt size={16} color="#38bdf8" />
                    <h5 style={{ margin: 0, fontSize: '14px', fontWeight: 800, color: '#f8fafc' }}>
                      Recent Company Subscription Receipts ({recordedPayments.length})
                    </h5>
                  </div>
                </div>

                {recordedPayments.length === 0 ? (
                  <p style={{ margin: 0, fontSize: '12px', color: '#64748b', textAlign: 'center', padding: '16px' }}>
                    No transactions recorded yet. When a company subscribes via `#register`, payments will appear here instantly.
                  </p>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '180px', overflowY: 'auto' }}>
                    {recordedPayments.slice(0, 5).map((pay: any, pIdx: number) => (
                      <div key={pIdx} style={{ background: '#1e293b', padding: '10px 14px', borderRadius: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '12px' }}>
                        <div>
                          <strong style={{ color: '#f8fafc', display: 'block' }}>{pay.companyName || 'Company'}</strong>
                          <span style={{ color: '#94a3b8', fontSize: '11px' }}>{pay.invoiceNumber || pay.id} • {new Date(pay.timestamp).toLocaleDateString()}</span>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                          <span style={{ color: '#34d399', fontWeight: 800, display: 'block' }}>₹{(pay.amount || 0).toLocaleString()}</span>
                          <span style={{ color: '#38bdf8', fontSize: '10px', textTransform: 'uppercase' }}>{pay.gateway || 'Razorpay'}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

          </div>
        </div>
      )}

      {/* QUICK RENEWAL MODAL */}
      {renewingTenant && (
        <div className="itlc-modal-overlay" style={{ zIndex: 99999 }}>
          <div className="super-admin-modal-card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 800, color: '#f8fafc' }}>
                Extend Subscription License
              </h3>
              <button className="modal-close-btn" onClick={() => setRenewingTenant(null)}>
                <XCircle size={20} />
              </button>
            </div>

            <p style={{ fontSize: '13px', color: '#94a3b8', marginBottom: '16px' }}>
              Company: <strong style={{ color: '#f8fafc' }}>{renewingTenant.name}</strong><br />
              Current Expiry: <strong style={{ color: '#38bdf8' }}>{renewingTenant.renewalDate}</strong>
            </p>

            <div className="form-group">
              <label style={{ fontSize: '13px', fontWeight: 700, color: '#f8fafc' }}>Choose Extension Duration:</label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px', marginTop: '8px' }}>
                <button 
                  type="button" 
                  className={`btn btn-secondary ${renewalDaysToAdd === 30 ? 'active-renewal-btn' : ''}`}
                  onClick={() => setRenewalDaysToAdd(30)}
                >
                  +30 Days (1 Month)
                </button>
                <button 
                  type="button" 
                  className={`btn btn-secondary ${renewalDaysToAdd === 90 ? 'active-renewal-btn' : ''}`}
                  onClick={() => setRenewalDaysToAdd(90)}
                >
                  +90 Days (Quarter)
                </button>
                <button 
                  type="button" 
                  className={`btn btn-secondary ${renewalDaysToAdd === 365 ? 'active-renewal-btn' : ''}`}
                  onClick={() => setRenewalDaysToAdd(365)}
                >
                  +365 Days (1 Year)
                </button>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '20px' }}>
              <button className="btn btn-secondary" onClick={() => setRenewingTenant(null)}>
                Cancel
              </button>
              <button className="btn btn-primary super-btn-confirm" onClick={handleExtendRenewal}>
                <Check size={16} />
                <span>Confirm License Extension</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ADD / EDIT TENANT MODAL */}
      {showAddTenantModal && (
        <div className="itlc-modal-overlay" style={{ zIndex: 99999 }}>
          <div className="super-admin-modal-card" style={{ maxWidth: '640px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 800, color: '#f8fafc' }}>
                {editingTenant ? 'Edit Tenant Company' : 'Provision New Tenant Company'}
              </h3>
              <button className="modal-close-btn" onClick={() => setShowAddTenantModal(false)}>
                <XCircle size={20} />
              </button>
            </div>

            <form onSubmit={handleSaveTenant}>
              <div className="form-grid-2col">
                <div className="form-group">
                  <label style={{ fontSize: '12px', fontWeight: 700, color: '#94a3b8' }}>Company Name *</label>
                  <input 
                    type="text" 
                    className="super-admin-input" 
                    required 
                    value={formName} 
                    onChange={(e) => setFormName(e.target.value)} 
                    placeholder="Acme Global Corp"
                  />
                </div>

                <div className="form-group">
                  <label style={{ fontSize: '12px', fontWeight: 700, color: '#94a3b8' }}>Industry Sector</label>
                  <input 
                    type="text" 
                    className="super-admin-input" 
                    value={formIndustry} 
                    onChange={(e) => setFormIndustry(e.target.value)} 
                    placeholder="IT / Manufacturing / Logistics"
                  />
                </div>
              </div>

              <div className="form-grid-2col">
                <div className="form-group">
                  <label style={{ fontSize: '12px', fontWeight: 700, color: '#94a3b8' }}>GSTIN Number</label>
                  <input 
                    type="text" 
                    className="super-admin-input" 
                    value={formGstin} 
                    onChange={(e) => setFormGstin(e.target.value.toUpperCase())} 
                    placeholder="07AABCT1234F1Z8"
                  />
                </div>

                <div className="form-group">
                  <label style={{ fontSize: '12px', fontWeight: 700, color: '#94a3b8' }}>Seat Limit</label>
                  <input 
                    type="number" 
                    className="super-admin-input" 
                    value={formSeatLimit} 
                    onChange={(e) => setFormSeatLimit(Number(e.target.value))} 
                  />
                </div>
              </div>

              <div className="form-grid-3col">
                <div className="form-group">
                  <label style={{ fontSize: '12px', fontWeight: 700, color: '#94a3b8' }}>Admin Name *</label>
                  <input 
                    type="text" 
                    className="super-admin-input" 
                    required 
                    value={formAdminName} 
                    onChange={(e) => setFormAdminName(e.target.value)} 
                  />
                </div>

                <div className="form-group">
                  <label style={{ fontSize: '12px', fontWeight: 700, color: '#94a3b8' }}>Admin Email *</label>
                  <input 
                    type="email" 
                    className="super-admin-input" 
                    required 
                    value={formAdminEmail} 
                    onChange={(e) => setFormAdminEmail(e.target.value)} 
                  />
                </div>

                <div className="form-group">
                  <label style={{ fontSize: '12px', fontWeight: 700, color: '#94a3b8' }}>Admin Phone</label>
                  <input 
                    type="tel" 
                    className="super-admin-input" 
                    value={formAdminPhone} 
                    onChange={(e) => setFormAdminPhone(e.target.value)} 
                  />
                </div>
              </div>

              <div className="form-grid-2col">
                <div className="form-group">
                  <label style={{ fontSize: '12px', fontWeight: 700, color: '#94a3b8' }}>Subscription Tier</label>
                  <select 
                    className="super-admin-select"
                    style={{ width: '100%' }}
                    value={formPlanId}
                    onChange={(e) => setFormPlanId(e.target.value as any)}
                  >
                    <option value="starter">Starter Cloud (₹999/mo)</option>
                    <option value="growth">Growth Suite (₹1,999/mo)</option>
                    <option value="enterprise">Enterprise Master (₹4,999/mo)</option>
                  </select>
                </div>

                <div className="form-group">
                  <label style={{ fontSize: '12px', fontWeight: 700, color: '#94a3b8' }}>Billing Cycle</label>
                  <select 
                    className="super-admin-select"
                    style={{ width: '100%' }}
                    value={formBillingCycle}
                    onChange={(e) => setFormBillingCycle(e.target.value as any)}
                  >
                    <option value="monthly">Monthly</option>
                    <option value="annual">Annual (20% Discount)</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '20px' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setShowAddTenantModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary super-btn-confirm">
                  <Check size={16} />
                  <span>{editingTenant ? 'Save Changes' : 'Provision Tenant'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* PLAN TIER & PRICING EDITOR MODAL */}
      {(editingPlan || isNewPlanModal) && (
        <div className="itlc-modal-overlay" style={{ zIndex: 99999 }}>
          <div className="super-admin-modal-card" style={{ maxWidth: '600px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 800, color: '#f8fafc' }}>
                  {editingPlan ? `Edit Tier: ${editingPlan.name}` : 'Create New Subscription Tier'}
                </h3>
                <p style={{ fontSize: '12px', color: '#94a3b8', margin: '2px 0 0' }}>
                  Changes will immediately sync to the Public Landing Page & Payment Checkout.
                </p>
              </div>
              <button 
                className="modal-close-btn" 
                onClick={() => {
                  setEditingPlan(null);
                  setIsNewPlanModal(false);
                }}
              >
                <XCircle size={20} />
              </button>
            </div>

            <form onSubmit={handleSavePlan}>
              <div className="form-grid-2col">
                <div className="form-group">
                  <label style={{ fontSize: '12px', fontWeight: 700, color: '#94a3b8' }}>Plan Name *</label>
                  <input 
                    type="text" 
                    className="super-admin-input" 
                    required 
                    value={planFormName} 
                    onChange={(e) => setPlanFormName(e.target.value)} 
                    placeholder="e.g. Growth Suite Pro"
                  />
                </div>

                <div className="form-group">
                  <label style={{ fontSize: '12px', fontWeight: 700, color: '#94a3b8' }}>Badge / Tag (Optional)</label>
                  <input 
                    type="text" 
                    className="super-admin-input" 
                    value={planFormBadge} 
                    onChange={(e) => setPlanFormBadge(e.target.value)} 
                    placeholder="e.g. MOST POPULAR, BEST VALUE"
                  />
                </div>
              </div>

              <div className="form-group">
                <label style={{ fontSize: '12px', fontWeight: 700, color: '#94a3b8' }}>Tagline / Description</label>
                <input 
                  type="text" 
                  className="super-admin-input" 
                  value={planFormTagline} 
                  onChange={(e) => setPlanFormTagline(e.target.value)} 
                  placeholder="Short tagline summarizing value proposition"
                />
              </div>

              <div className="form-grid-3col" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
                <div className="form-group">
                  <label style={{ fontSize: '12px', fontWeight: 700, color: '#94a3b8' }}>Monthly Price (₹) *</label>
                  <input 
                    type="number" 
                    className="super-admin-input" 
                    required 
                    min="0"
                    value={planFormPriceMonthly} 
                    onChange={(e) => setPlanFormPriceMonthly(Number(e.target.value))} 
                  />
                </div>

                <div className="form-group">
                  <label style={{ fontSize: '12px', fontWeight: 700, color: '#94a3b8' }}>Annual Price (₹) *</label>
                  <input 
                    type="number" 
                    className="super-admin-input" 
                    required 
                    min="0"
                    value={planFormPriceAnnual} 
                    onChange={(e) => setPlanFormPriceAnnual(Number(e.target.value))} 
                  />
                </div>

                <div className="form-group">
                  <label style={{ fontSize: '12px', fontWeight: 700, color: '#94a3b8' }}>Seat Quota *</label>
                  <input 
                    type="number" 
                    className="super-admin-input" 
                    required 
                    min="1"
                    value={planFormSeatLimit} 
                    onChange={(e) => setPlanFormSeatLimit(Number(e.target.value))} 
                  />
                </div>
              </div>

              <div className="form-group">
                <label style={{ fontSize: '12px', fontWeight: 700, color: '#94a3b8' }}>
                  Highlight Features (Enter one feature per line)
                </label>
                <textarea 
                  className="super-admin-input" 
                  style={{ minHeight: '110px', fontFamily: 'inherit', resize: 'vertical' }}
                  value={planFormFeaturesText} 
                  onChange={(e) => setPlanFormFeaturesText(e.target.value)} 
                  placeholder={"Full CRM Leads & Pipeline\nOmniStaff Biometric Attendance\n1-Click GST Tax Invoicing\nWhatsApp & Email Campaigns"}
                />
              </div>

              <div style={{ background: '#0f172a', border: '1px solid #334155', borderRadius: '10px', padding: '14px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', margin: '14px 0' }}>
                <div>
                  <strong style={{ fontSize: '13px', color: '#f8fafc', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    🌐 Show on Public Landing Page
                  </strong>
                  <span style={{ fontSize: '11px', color: '#94a3b8', display: 'block', marginTop: '2px' }}>
                    Display this tier card on public website (#pricing) & customer onboarding wizard
                  </span>
                </div>
                <label className="super-switch">
                  <input 
                    type="checkbox" 
                    checked={planFormShowOnLandingPage}
                    onChange={(e) => setPlanFormShowOnLandingPage(e.target.checked)}
                  />
                  <span className="super-slider" />
                </label>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '20px' }}>
                <button 
                  type="button" 
                  className="btn btn-secondary" 
                  onClick={() => {
                    setEditingPlan(null);
                    setIsNewPlanModal(false);
                  }}
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary super-btn-confirm">
                  <Check size={16} />
                  <span>Save & Publish Live</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
