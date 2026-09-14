import React, { useState, useEffect } from 'react';
import { 
  X, 
  Check, 
  Sparkles, 
  ShieldCheck, 
  Briefcase, 
  Users, 
  Building2, 
  ArrowRight, 
  ArrowLeft, 
  CheckCircle2, 
  Percent, 
  HelpCircle,
  Zap,
  Lock,
  CreditCard
} from 'lucide-react';
import { 
  getLiveSubscriptionPlans, 
  defaultSubscriptionPlans, 
  syncCompanySubscriptionChange,
  type TenantCompany, 
  type TenantFeatureFlags, 
  type SubscriptionPlanDef 
} from '../types/multiTenant';
import { paymentService } from '../services/paymentService';
import { API_URL } from '../services/api';

interface ClientOnboardingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: (newTenant: TenantCompany) => void;
  lang?: 'en' | 'hi';
  initialPlanId?: string;
}

export const ClientOnboardingModal: React.FC<ClientOnboardingModalProps> = ({
  isOpen,
  onClose,
  onComplete,
  lang = 'en',
  initialPlanId
}) => {
  const [plans, setPlans] = useState<SubscriptionPlanDef[]>(getLiveSubscriptionPlans());
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [selectedSuiteOption, setSelectedSuiteOption] = useState<'both' | 'crm' | 'hrms'>('hrms');
  const [selectedPlanId, setSelectedPlanId] = useState<string>(initialPlanId || 'growth');
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'annual'>('monthly');
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);

  useEffect(() => {
    if (initialPlanId) {
      setSelectedPlanId(initialPlanId);
    }
  }, [initialPlanId]);

  useEffect(() => {
    const handleUpdate = (e?: Event) => {
      const customEv = e as CustomEvent;
      const updated = (customEv && customEv.detail && Array.isArray(customEv.detail))
        ? customEv.detail
        : getLiveSubscriptionPlans();
      setPlans(updated);
      const visible = updated.filter((p: any) => p.showOnLandingPage !== false);
      if (visible.length > 0 && !visible.some((p: any) => p.id === selectedPlanId)) {
        setSelectedPlanId(visible[0].id);
      }
    };
    window.addEventListener('subscription_plans_updated', handleUpdate);
    window.addEventListener('storage', handleUpdate);
    return () => {
      window.removeEventListener('subscription_plans_updated', handleUpdate);
      window.removeEventListener('storage', handleUpdate);
    };
  }, [selectedPlanId]);

  useEffect(() => {
    const visible = plans.filter(p => p.showOnLandingPage !== false);
    if (visible.length > 0 && !visible.some(p => p.id === selectedPlanId)) {
      setSelectedPlanId(visible[0].id);
    }
  }, [plans, selectedPlanId]);

  // Step 2 Form State
  const [companyName, setCompanyName] = useState('');
  const [gstin, setGstin] = useState('');
  const [industry, setIndustry] = useState('IT & Software Services');
  const [adminName, setAdminName] = useState('');
  const [adminEmail, setAdminEmail] = useState('');
  const [adminPhone, setAdminPhone] = useState('');
  const [teamSize, setTeamSize] = useState<number>(25);

  if (!isOpen) return null;

  const currentPlan = plans.find(p => p.id === selectedPlanId) || plans[0] || defaultSubscriptionPlans[0];
  const basePrice = billingCycle === 'monthly' ? currentPlan.priceMonthly : currentPlan.priceAnnual;
  const suitesSelected: ('crm' | 'hrms')[] = selectedSuiteOption === 'both' ? ['crm', 'hrms'] : [selectedSuiteOption];
  
  // Tax & Total calculation
  const gstAmount = Math.round(basePrice * 0.18);
  const grandTotal = basePrice + gstAmount;

  const handleNextStep1 = () => {
    setStep(2);
  };

  const handleNextStep2 = (e: React.FormEvent) => {
    e.preventDefault();
    if (!companyName.trim() || !adminName.trim() || !adminEmail.trim() || !adminPhone.trim()) {
      alert("Please fill in all required company and admin contact details.");
      return;
    }
    setStep(3);
  };

  const provisionTenant = (paymentRef?: string) => {
    // Generate feature flags based on plan and selected suites
    const isEnterprise = selectedPlanId === 'enterprise';
    const isGrowth = selectedPlanId === 'growth';
    const hasCrm = suitesSelected.includes('crm');
    const hasHrms = suitesSelected.includes('hrms');

    const defaultFeatures: TenantFeatureFlags = {
      crmKanban: hasCrm,
      crmGstInvoicing: hasCrm,
      crmGpsFieldTracking: hasCrm && (isGrowth || isEnterprise),
      crmAiCopilot: hasCrm && isEnterprise,
      crmWhatsAppBroadcast: hasCrm && (isGrowth || isEnterprise),
      crmReports: hasCrm,
      hrmsBiometricRadar: hasHrms,
      hrmsGeofenceAttendance: hasHrms && (isGrowth || isEnterprise),
      hrmsPayrollPayslips: hasHrms,
      hrmsShiftLeaveManagement: hasHrms,
      hrmsAssetTraining: hasHrms && isEnterprise,
      apiWebhooks: isEnterprise,
      customDomain: isEnterprise,
      prioritySlaSupport: isGrowth || isEnterprise
    };

    const cleanDomain = companyName.toLowerCase().replace(/[^a-z0-9]/g, '') || 'company';
    const randomId = `TEN-${Math.floor(100 + Math.random() * 900)}`;

    const newTenant: TenantCompany = {
      id: randomId,
      name: companyName.trim(),
      domain: cleanDomain,
      gstin: gstin.trim() || undefined,
      industry,
      adminName: adminName.trim(),
      adminEmail: adminEmail.trim(),
      adminPhone: adminPhone.trim(),
      planId: selectedPlanId as any,
      suites: suitesSelected,
      status: 'active',
      onboardDate: new Date().toISOString().split('T')[0],
      renewalDate: new Date(Date.now() + (billingCycle === 'annual' ? 365 : 30) * 86400000).toISOString().split('T')[0],
      billingCycle,
      mrrAmount: currentPlan.priceMonthly,
      userSeatLimit: currentPlan.seatLimit,
      activeUsersCount: Math.min(teamSize, currentPlan.seatLimit),
      features: defaultFeatures,
      notes: paymentRef ? `Paid via Razorpay (${paymentRef})` : 'Self-onboarded via public portal.'
    };

    const planStorageGb = currentPlan.storageLimitGb || (currentPlan as any).storageLimit || 50;
    const planSeatLimit = newTenant.userSeatLimit || currentPlan.seatLimit || 50;

    syncCompanySubscriptionChange({
      companyId: newTenant.id,
      companyName: newTenant.name,
      email: newTenant.adminEmail,
      password: 'Admin123',
      adminPassword: 'Admin123',
      planId: newTenant.planId,
      status: 'active',
      billingCycle: newTenant.billingCycle,
      maxSeats: planSeatLimit,
      storageLimitGb: planStorageGb,
      renewalDate: newTenant.renewalDate
    });

    // Save to hrms_companies_data and individual company key
    try {
      const savedComps = localStorage.getItem('hrms_companies_data');
      const compList = savedComps ? JSON.parse(savedComps) : [];
      const newCompObj = {
        id: newTenant.id,
        name: newTenant.name,
        logo: '/itlc_logo.png',
        ownerName: newTenant.adminName,
        email: newTenant.adminEmail,
        phone: newTenant.adminPhone,
        employeesCount: planSeatLimit,
        maxEmployees: planSeatLimit,
        seatLimit: planSeatLimit,
        subscriptionPlanId: newTenant.planId,
        storageLimit: planStorageGb,
        storageLimitGb: planStorageGb,
        storageUsed: 0.85,
        status: 'active',
        password: 'Admin123',
        adminPassword: 'Admin123',
        createdDate: newTenant.onboardDate,
        modulesEnabled: {
          attendance: true, leave: true, payroll: true, recruitment: true,
          performance: true, assets: true, training: true, aiReports: true,
          chat: true, projects: true, faceRecognition: true, gpsTracking: true,
          mobileApp: true, api: true, whiteLabel: false
        }
      };
      const updatedComps = [newCompObj, ...compList.filter((c: any) => c.id !== newTenant.id && c.email?.toLowerCase() !== newTenant.adminEmail.toLowerCase())];
      localStorage.setItem('hrms_companies_data', JSON.stringify(updatedComps));
      localStorage.setItem(`hrms_company_${newTenant.id}`, JSON.stringify(newCompObj));
    } catch (e) {}

    // Save credentials to itlc_registered_users
    try {
      const savedUsers = localStorage.getItem('itlc_registered_users');
      const userList = savedUsers ? JSON.parse(savedUsers) : [];
      const userEntry = {
        id: `usr_${Date.now()}`,
        email: newTenant.adminEmail,
        password: 'Admin123',
        name: newTenant.adminName,
        phone: newTenant.adminPhone,
        companyId: newTenant.id,
        companyName: newTenant.name,
        role: 'Company Admin',
        planId: newTenant.planId,
        status: 'active'
      };
      const existingIdx = userList.findIndex((u: any) => u.email?.toLowerCase() === newTenant.adminEmail.toLowerCase() || u.companyId === newTenant.id);
      if (existingIdx >= 0) {
        userList[existingIdx] = { ...userList[existingIdx], ...userEntry };
      } else {
        userList.unshift(userEntry);
      }
      localStorage.setItem('itlc_registered_users', JSON.stringify(userList));
      localStorage.setItem('itlc_active_tenant', JSON.stringify(newTenant));
    } catch (e) {}

    // Save payment transaction record
    try {
      const savedPayments = localStorage.getItem('hrms_payments_data');
      const payList = savedPayments ? JSON.parse(savedPayments) : [];
      const newPayRecord = {
        id: paymentRef || `pay_${Date.now()}`,
        companyId: newTenant.id,
        companyName: newTenant.name,
        amount: grandTotal,
        gateway: 'razorpay',
        status: 'successful',
        timestamp: new Date().toISOString(),
        invoiceNumber: `INV-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`,
        currency: 'INR'
      };
      payList.unshift(newPayRecord);
      localStorage.setItem('hrms_payments_data', JSON.stringify(payList));
    } catch (e) {}

    // Save audit log
    try {
      const savedLogs = localStorage.getItem('hrms_activity_logs');
      const logList = savedLogs ? JSON.parse(savedLogs) : [];
      const newLog = {
        id: `log_${Date.now()}`,
        action: 'New Subscription Purchased',
        details: `Client "${newTenant.name}" activated ${currentPlan.name} plan for ₹${grandTotal.toLocaleString()} (${billingCycle}).`,
        timestamp: new Date().toISOString(),
        category: 'subscription',
        actorName: newTenant.adminName
      };
      logList.unshift(newLog);
      localStorage.setItem('hrms_activity_logs', JSON.stringify(logList));
    } catch (e) {}

    // Set unified SSO session profile
    try {
      const mockProfile = {
        id: `usr_${Date.now()}`,
        name: newTenant.adminName,
        fullName: newTenant.adminName,
        email: newTenant.adminEmail,
        role: 'Company Admin',
        department: 'Executive Management',
        designation: 'Managing Director / Admin',
        companyId: newTenant.id,
        companyName: newTenant.name,
        companyLogo: '/itlc_logo.png',
        subscriptionPlanId: newTenant.planId,
        subscriptionStatus: 'active',
        subscriptionPlan: newTenant.planId,
        companyDetails: {
          id: newTenant.id,
          name: newTenant.name,
          status: 'active',
          themeColor: '#4f46e5',
          storageLimit: planStorageGb,
          storageLimitGb: planStorageGb,
          maxEmployees: planSeatLimit,
          seatLimit: planSeatLimit,
          storageUsed: 0.85,
          subscriptionPlanId: newTenant.planId,
          modulesEnabled: {
            dashboard: true,
            attendance: true,
            leave: true,
            payroll: true,
            documents: true,
            assets: true,
            helpdesk: true,
            training: true,
            recruitment: true
          }
        }
      };
      
      const currentProfRaw = localStorage.getItem('hrms_user_profile');
      const currentProf = currentProfRaw ? JSON.parse(currentProfRaw) : null;
      const isSuperOwner = currentProf?.role === 'Super Owner' || currentProf?.email?.includes('superowner') || currentProf?.email === 'owner@itlc.com';
      if (!isSuperOwner) {
        localStorage.setItem('hrms_user_profile', JSON.stringify(mockProfile));
        localStorage.setItem('hrms_jwt_token', 'token_auth_' + Date.now());
        localStorage.setItem('crm_auth_session', 'true');
        sessionStorage.setItem('crm_auth_session', 'true');

        const crmUser = {
          id: mockProfile.id,
          name: mockProfile.name,
          email: mockProfile.email,
          role: 'Admin',
          companyId: newTenant.id,
          companyName: newTenant.name,
          status: 'Active',
          avatar: mockProfile.name.split(' ').map((w: string) => w[0]).join('').slice(0, 2).toUpperCase()
        };
        localStorage.setItem('crm_current_user', JSON.stringify(crmUser));
      }
    } catch (e) {}

    // Backend sync
    try {
      if (typeof window !== 'undefined' && window.fetch) {
        fetch(`${API_URL}/tenants`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            id: newTenant.id,
            name: newTenant.name,
            companyName: newTenant.name,
            email: newTenant.adminEmail,
            adminEmail: newTenant.adminEmail,
            ownerName: newTenant.adminName,
            adminName: newTenant.adminName,
            phone: newTenant.adminPhone,
            adminPhone: newTenant.adminPhone,
            userSeatLimit: planSeatLimit,
            maxEmployees: planSeatLimit,
            seatLimit: planSeatLimit,
            staffCapacity: planSeatLimit,
            employeesCount: planSeatLimit,
            storageLimit: planStorageGb,
            storageLimitGb: planStorageGb,
            subscriptionPlanId: newTenant.planId,
            plan: newTenant.planId,
            password: 'Admin123',
            adminPassword: 'Admin123'
          })
        }).catch(() => {});
      }
    } catch {}

    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('superowner_data_updated'));
      window.dispatchEvent(new CustomEvent('subscription_plans_updated'));
    }

    onComplete(newTenant);
  };

  const handlePaymentAndLaunch = async () => {
    setIsProcessingPayment(true);
    try {
      await paymentService.openCheckout(
        {
          planId: currentPlan.id,
          amount: grandTotal,
          companyName: companyName.trim(),
          customerName: adminName.trim(),
          customerEmail: adminEmail.trim(),
          customerPhone: adminPhone.trim()
        },
        (result) => {
          setIsProcessingPayment(false);
          if (result && result.paymentId) {
            provisionTenant(result.paymentId);
          } else {
            const fallback = window.confirm('Payment checkout was not completed. Would you like to provision this client workspace in Free Trial mode?');
            if (fallback) {
              provisionTenant('trial_' + Date.now());
            }
          }
        },
        () => {
          setIsProcessingPayment(false);
        }
      );
    } catch (err: any) {
      console.warn('Payment failed or cancelled:', err);
      setIsProcessingPayment(false);
      const fallback = window.confirm('Payment gateway was unavailable. Would you like to provision this client workspace in Free Trial mode?');
      if (fallback) {
        provisionTenant('trial_' + Date.now());
      }
    }
  };

  return (
    <div className="itlc-modal-overlay" style={{ zIndex: 99999 }}>
      <div className="itlc-onboarding-modal-card">
        {/* Modal Header */}
        <div className="itlc-onboarding-modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div className="itlc-badge-step-icon">
              <Sparkles size={20} />
            </div>
            <div>
              <h2 style={{ fontSize: '20px', fontWeight: 900, color: '#0f172a', margin: 0, letterSpacing: '-0.3px' }}>
                Start Your ITLC Cloud Subscription
              </h2>
              <p style={{ fontSize: '12px', color: '#64748b', margin: '2px 0 0' }}>
                Instantly provision your connected CRM & HRMS operating workspace in 3 simple steps
              </p>
            </div>
          </div>
          <button className="modal-close-btn" onClick={onClose} title="Close Modal">
            <X size={20} />
          </button>
        </div>

        {/* Wizard Steps Progress Bar */}
        <div className="itlc-onboarding-stepper">
          <div className={`itlc-step-node ${step >= 1 ? 'active' : ''}`}>
            <span className="itlc-step-number">1</span>
            <span className="itlc-step-label">Choose Plan & Suites</span>
          </div>
          <div className={`itlc-step-line ${step >= 2 ? 'active' : ''}`} />
          <div className={`itlc-step-node ${step >= 2 ? 'active' : ''}`}>
            <span className="itlc-step-number">2</span>
            <span className="itlc-step-label">Company Details</span>
          </div>
          <div className={`itlc-step-line ${step >= 3 ? 'active' : ''}`} />
          <div className={`itlc-step-node ${step >= 3 ? 'active' : ''}`}>
            <span className="itlc-step-number">3</span>
            <span className="itlc-step-label">Review & Provision</span>
          </div>
        </div>

        {/* STEP 1: CHOOSE PLAN & SUITES */}
        {step === 1 && (
          <div className="itlc-onboarding-step-body">
            {/* Suite Focus */}
            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#0f172a', marginBottom: '8px' }}>
                1. Software Suite:
              </label>
              <div className="itlc-suite-select-grid" style={{ gridTemplateColumns: '1fr 1fr' }}>
                <button 
                  type="button"
                  className="itlc-suite-card-btn active-suite"
                  style={{ border: '2px solid #0284c7', background: '#f0f9ff' }}
                  onClick={() => setSelectedSuiteOption('hrms')}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                    <div style={{ display: 'flex', gap: '4px' }}>
                      <Users size={20} color="#0284c7" />
                    </div>
                    <span className="itlc-popular-badge">ACTIVE SUITE</span>
                  </div>
                  <strong style={{ fontSize: '14px', color: '#0f172a' }}>OmniStaff HRMS Enterprise</strong>
                  <span style={{ fontSize: '12px', color: '#64748b', marginTop: '2px' }}>
                    Biometric Radar, GPS Attendance, Payroll & GST Billing
                  </span>
                </button>

                <button 
                  type="button"
                  className="itlc-suite-card-btn opacity-60 cursor-not-allowed"
                  onClick={() => alert('🚀 ITLC Sales CRM is Coming Soon! OmniStaff HRMS is currently active.')}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                    <Briefcase size={20} color="#64748b" />
                    <span style={{ fontSize: '10px', fontWeight: 700, padding: '2px 6px', borderRadius: '10px', background: '#fef3c7', color: '#b45309' }}>⏳ Coming Soon</span>
                  </div>
                  <strong style={{ fontSize: '14px', color: '#64748b' }}>ITLC Sales CRM</strong>
                  <span style={{ fontSize: '12px', color: '#94a3b8', marginTop: '2px' }}>
                    Deals Kanban, Pipelines & Invoicing (In Active Development)
                  </span>
                </button>
              </div>
            </div>

            {/* Billing Cycle Switcher */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#f8fafc', padding: '10px 16px', borderRadius: '12px', border: '1px solid #e2e8f0', marginBottom: '20px' }}>
              <div>
                <span style={{ fontSize: '13px', fontWeight: 700, color: '#0f172a' }}>
                  Billing Cycle:
                </span>
                <span style={{ fontSize: '12px', color: '#16a34a', fontWeight: 600, marginLeft: '8px' }}>
                  ⚡ Annual Plan saves 20% + 2 Months Free
                </span>
              </div>
              <div className="itlc-billing-cycle-pills">
                <button 
                  type="button" 
                  className={billingCycle === 'monthly' ? 'active' : ''}
                  onClick={() => setBillingCycle('monthly')}
                >
                  Monthly
                </button>
                <button 
                  type="button" 
                  className={billingCycle === 'annual' ? 'active' : ''}
                  onClick={() => setBillingCycle('annual')}
                >
                  Annual (Save 20%)
                </button>
              </div>
            </div>

            {/* Subscription Tier Cards Grid */}
            <div style={{ marginBottom: '10px' }}>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#0f172a', marginBottom: '10px' }}>
                2. Select Your Subscription Plan Tier:
              </label>
              <div className="itlc-plans-selection-grid">
                {plans.filter(p => p.showOnLandingPage !== false).length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '20px', gridColumn: '1 / -1', color: '#64748b', fontSize: '13px' }}>
                    No active subscription plans available.
                  </div>
                ) : (
                  plans.filter(p => p.showOnLandingPage !== false).map(plan => {
                    const isSelected = selectedPlanId === plan.id;
                    const price = billingCycle === 'monthly' ? plan.priceMonthly : plan.priceAnnual;
                    return (
                      <div 
                        key={plan.id}
                        className={`itlc-plan-card-option ${isSelected ? 'selected-plan' : ''}`}
                        onClick={() => setSelectedPlanId(plan.id)}
                      >
                      {plan.badge && (
                        <div className="itlc-plan-floating-badge">{plan.badge}</div>
                      )}
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                        <h4 style={{ margin: 0, fontSize: '16px', fontWeight: 800, color: '#0f172a' }}>{plan.name}</h4>
                        <div className={`itlc-radio-check ${isSelected ? 'checked' : ''}`}>
                          {isSelected && <Check size={12} color="#ffffff" />}
                        </div>
                      </div>
                      <p style={{ fontSize: '11px', color: '#64748b', minHeight: '30px', margin: '0 0 10px' }}>{plan.tagline}</p>
                      
                      <div className="itlc-plan-price-display">
                        <span style={{ fontSize: '22px', fontWeight: 900, color: '#0f172a' }}>₹{price.toLocaleString()}</span>
                        <span style={{ fontSize: '11px', color: '#64748b' }}> / {billingCycle === 'monthly' ? 'month' : 'year'}</span>
                      </div>

                      <div style={{ fontSize: '11px', color: '#0284c7', fontWeight: 700, marginBottom: '10px' }}>
                        👥 Includes up to {plan.seatLimit} user seats
                      </div>

                      <ul className="itlc-plan-features-mini-list">
                        {plan.highlightFeatures.slice(0, 3).map((f, i) => (
                          <li key={i}>
                            <CheckCircle2 size={13} color="#10b981" />
                            <span>{f}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  );
                }))}
              </div>
            </div>

            {/* Step 1 Footer */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '24px', paddingTop: '16px', borderTop: '1px solid #e2e8f0' }}>
              <button 
                type="button" 
                className="btn btn-primary itlc-btn-cyan"
                style={{ padding: '10px 28px', fontSize: '14px', borderRadius: '10px', gap: '8px' }}
                onClick={handleNextStep1}
              >
                <span>Continue to Company Details</span>
                <ArrowRight size={16} />
              </button>
            </div>
          </div>
        )}

        {/* STEP 2: COMPANY & ADMIN DETAILS */}
        {step === 2 && (
          <form onSubmit={handleNextStep2} className="itlc-onboarding-step-body">
            <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', padding: '12px 16px', borderRadius: '10px', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Zap size={18} color="#16a34a" />
              <span style={{ fontSize: '12px', color: '#15803d', fontWeight: 600 }}>
                Selected Plan: <strong>{currentPlan.name}</strong> ({selectedSuiteOption === 'both' ? 'Unified CRM + HRMS' : selectedSuiteOption.toUpperCase()}) • ₹{basePrice.toLocaleString()} / {billingCycle}
              </span>
            </div>

            <div className="form-grid-2col">
              <div className="form-group">
                <label style={{ fontSize: '13px', fontWeight: 700, color: '#0f172a' }}>
                  Registered Company Name *
                </label>
                <input 
                  type="text" 
                  className="form-control" 
                  placeholder="e.g. Acme Enterprises Pvt Ltd"
                  required
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label style={{ fontSize: '13px', fontWeight: 700, color: '#0f172a' }}>
                  Industry / Business Domain
                </label>
                <select 
                  className="form-control"
                  value={industry}
                  onChange={(e) => setIndustry(e.target.value)}
                >
                  <option value="IT & Software Services">IT & Software Services</option>
                  <option value="Manufacturing & Industrial">Manufacturing & Industrial</option>
                  <option value="Retail & E-commerce">Retail & E-commerce</option>
                  <option value="Logistics & Supply Chain">Logistics & Supply Chain</option>
                  <option value="Healthcare & Pharma">Healthcare & Pharma</option>
                  <option value="Real Estate & Construction">Real Estate & Construction</option>
                  <option value="Financial Services & Fintech">Financial Services & Fintech</option>
                  <option value="Education & EdTech">Education & EdTech</option>
                  <option value="Other">Other Enterprise Sector</option>
                </select>
              </div>
            </div>

            <div className="form-grid-2col">
              <div className="form-group">
                <label style={{ fontSize: '13px', fontWeight: 700, color: '#0f172a' }}>
                  Company GSTIN (Optional for Tax Invoice)
                </label>
                <input 
                  type="text" 
                  className="form-control" 
                  placeholder="07AABCT1234F1Z8"
                  value={gstin}
                  onChange={(e) => setGstin(e.target.value.toUpperCase())}
                />
              </div>

              <div className="form-group">
                <label style={{ fontSize: '13px', fontWeight: 700, color: '#0f172a' }}>
                  Expected Team / Staff Seats
                </label>
                <input 
                  type="number" 
                  className="form-control" 
                  min={1}
                  max={currentPlan.seatLimit}
                  value={teamSize}
                  onChange={(e) => setTeamSize(Number(e.target.value))}
                />
              </div>
            </div>

            <div style={{ height: '1px', background: '#e2e8f0', margin: '14px 0' }} />

            <div style={{ marginBottom: '14px' }}>
              <span style={{ fontSize: '13px', fontWeight: 800, color: '#0f172a' }}>
                Primary Administrator / Account Owner
              </span>
            </div>

            <div className="form-grid-3col">
              <div className="form-group">
                <label style={{ fontSize: '12px', fontWeight: 700, color: '#475569' }}>
                  Admin Full Name *
                </label>
                <input 
                  type="text" 
                  className="form-control" 
                  placeholder="e.g. Rahul Sharma"
                  required
                  value={adminName}
                  onChange={(e) => setAdminName(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label style={{ fontSize: '12px', fontWeight: 700, color: '#475569' }}>
                  Official Business Email *
                </label>
                <input 
                  type="email" 
                  className="form-control" 
                  placeholder="admin@yourcompany.com"
                  required
                  value={adminEmail}
                  onChange={(e) => setAdminEmail(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label style={{ fontSize: '12px', fontWeight: 700, color: '#475569' }}>
                  Mobile / WhatsApp Number *
                </label>
                <input 
                  type="tel" 
                  className="form-control" 
                  placeholder="+91 98765 43210"
                  required
                  value={adminPhone}
                  onChange={(e) => setAdminPhone(e.target.value)}
                />
              </div>
            </div>

            {/* Step 2 Footer */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '24px', paddingTop: '16px', borderTop: '1px solid #e2e8f0' }}>
              <button 
                type="button" 
                className="btn btn-secondary"
                onClick={() => setStep(1)}
              >
                <ArrowLeft size={16} />
                <span>Back</span>
              </button>

              <button 
                type="submit" 
                className="btn btn-primary itlc-btn-cyan"
                style={{ padding: '10px 28px', fontSize: '14px', borderRadius: '10px', gap: '8px' }}
              >
                <span>Review & Activate</span>
                <ArrowRight size={16} />
              </button>
            </div>
          </form>
        )}

        {/* STEP 3: REVIEW & PROVISION */}
        {step === 3 && (
          <div className="itlc-onboarding-step-body">
            <div className="itlc-review-order-box">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '1px solid #e2e8f0', paddingBottom: '14px', marginBottom: '14px' }}>
                <div>
                  <h3 style={{ margin: '0 0 4px', fontSize: '18px', fontWeight: 900, color: '#0f172a' }}>{companyName}</h3>
                  <span style={{ fontSize: '12px', color: '#64748b' }}>
                    {industry} {gstin ? `• GSTIN: ${gstin}` : ''}
                  </span>
                </div>
                <span className="itlc-badge-active-green">READY TO PROVISION</span>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '14px', marginBottom: '16px' }}>
                <div>
                  <span style={{ display: 'block', fontSize: '11px', color: '#64748b', textTransform: 'uppercase', fontWeight: 700 }}>Administrator</span>
                  <strong style={{ fontSize: '13px', color: '#0f172a' }}>{adminName}</strong>
                  <span style={{ display: 'block', fontSize: '12px', color: '#475569' }}>{adminEmail} • {adminPhone}</span>
                </div>

                <div>
                  <span style={{ display: 'block', fontSize: '11px', color: '#64748b', textTransform: 'uppercase', fontWeight: 700 }}>Suite & Seats</span>
                  <strong style={{ fontSize: '13px', color: '#0f172a' }}>
                    {selectedSuiteOption === 'both' ? 'Unified CRM + HRMS' : selectedSuiteOption === 'crm' ? 'ITLC Sales CRM' : 'OmniStaff HRMS'}
                  </strong>
                  <span style={{ display: 'block', fontSize: '12px', color: '#0284c7', fontWeight: 600 }}>
                    {teamSize} Allocated Seats (Limit: {currentPlan.seatLimit})
                  </span>
                </div>
              </div>

              {/* Price Breakdown */}
              <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '14px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', color: '#475569', marginBottom: '6px' }}>
                  <span>{currentPlan.name} ({billingCycle.toUpperCase()})</span>
                  <span>₹{basePrice.toLocaleString()}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', color: '#475569', marginBottom: '6px' }}>
                  <span>Applicable GST (18%)</span>
                  <span>₹{gstAmount.toLocaleString()}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '16px', fontWeight: 900, color: '#0f172a', borderTop: '1px dashed #cbd5e1', paddingTop: '8px', marginTop: '8px' }}>
                  <span>Total Payable Amount</span>
                  <span style={{ color: '#0284c7' }}>₹{grandTotal.toLocaleString()}</span>
                </div>
              </div>
            </div>

            {/* Super Admin Notice */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: '10px', padding: '12px 16px', marginTop: '16px' }}>
              <ShieldCheck size={20} color="#0284c7" />
              <span style={{ fontSize: '12px', color: '#1e40af' }}>
                <strong>Enterprise Provisioning Engine:</strong> Your tenant workspace will be instantly provisioned. Master Super Admin governance will monitor renewal and feature entitlements automatically.
              </span>
            </div>

            {/* Step 3 Footer */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '24px', paddingTop: '16px', borderTop: '1px solid #e2e8f0', flexWrap: 'wrap', gap: '10px' }}>
              <button 
                type="button" 
                className="btn btn-secondary"
                onClick={() => setStep(2)}
              >
                <ArrowLeft size={16} />
                <span>Back</span>
              </button>

              <div style={{ display: 'flex', gap: '10px' }}>
                <button 
                  type="button" 
                  className="btn btn-secondary"
                  style={{ background: '#f1f5f9', color: '#334155' }}
                  onClick={() => provisionTenant()}
                  title="Direct Sandbox Provisioning"
                >
                  <span>⚡ Instant Launch (Trial)</span>
                </button>

                <button 
                  type="button" 
                  className="btn btn-primary itlc-btn-cyan"
                  style={{ padding: '12px 28px', fontSize: '14px', borderRadius: '10px', gap: '8px', opacity: isProcessingPayment ? 0.7 : 1 }}
                  onClick={handlePaymentAndLaunch}
                  disabled={isProcessingPayment}
                >
                  <CreditCard size={18} />
                  <span>
                    {isProcessingPayment 
                      ? 'Processing Payment...'
                      : `💳 Pay ₹${grandTotal.toLocaleString()} & Launch Workspace`}
                  </span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
