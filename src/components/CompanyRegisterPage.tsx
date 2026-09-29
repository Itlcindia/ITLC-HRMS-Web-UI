import React, { useState, useEffect } from 'react';
import { 
  Building2, 
  Sparkles, 
  ShieldCheck, 
  Briefcase, 
  Users, 
  ArrowRight, 
  ArrowLeft, 
  CheckCircle2, 
  Percent, 
  Zap, 
  Lock, 
  CreditCard, 
  Globe, 
  Mail, 
  Phone, 
  Check, 
  HelpCircle,
  Copy,
  QrCode,
  Tag,
  CheckCircle,
  X,
  ExternalLink,
  Smartphone
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

interface CompanyRegisterPageProps {
  initialPlanId?: string;
  onBackToHome: () => void;
  onCompleteRegistration: (newTenant: TenantCompany) => void;
  lang?: 'en' | 'hi';
}

export const CompanyRegisterPage: React.FC<CompanyRegisterPageProps> = ({
  initialPlanId,
  onBackToHome,
  onCompleteRegistration,
  lang = 'en'
}) => {
  const [plans, setPlans] = useState<SubscriptionPlanDef[]>(getLiveSubscriptionPlans());
  const [step, setStep] = useState<1 | 2 | 3 | 4 | 5>(1);
  const [selectedSuiteOption, setSelectedSuiteOption] = useState<'both' | 'crm' | 'hrms'>('both');
  const [selectedPlanId, setSelectedPlanId] = useState<string>(initialPlanId || 'growth');
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'annual'>('monthly');
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [provisioningProgress, setProvisioningProgress] = useState(0);
  const [provisioningStatusText, setProvisioningStatusText] = useState('Initializing workspace...');

  // Step 2 Form State (Company Details)
  const [companyName, setCompanyName] = useState('');
  const [gstin, setGstin] = useState('');
  const [industry, setIndustry] = useState('IT & Software Services');
  const [teamSize, setTeamSize] = useState<number>(25);
  const [city, setCity] = useState('');
  const [stateName, setStateName] = useState('');

  // Step 3 Form State (Admin Credentials)
  const [adminName, setAdminName] = useState('');
  const [adminEmail, setAdminEmail] = useState('');
  const [adminPhone, setAdminPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [designation, setDesignation] = useState('Director / Managing Head');

  // Step 4 Form State (Coupon & Payment)
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<{ code: string; discountPercent?: number; discountFlat?: number } | null>(null);
  const [couponError, setCouponError] = useState('');
  const [selectedPaymentGateway, setSelectedPaymentGateway] = useState<'razorpay' | 'upi' | 'card' | 'bank_transfer'>('razorpay');
  const [showUpiQrModal, setShowUpiQrModal] = useState(false);
  const [upiRefNumber, setUpiRefNumber] = useState('');
  const [copiedUpi, setCopiedUpi] = useState(false);

  const getPlatformUpiId = (): string => {
    try {
      const saved = localStorage.getItem('hrms_global_settings');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.realUpiId && parsed.realUpiId.trim()) return parsed.realUpiId.trim();
      }
    } catch {}
    return 'itlc@upi';
  };

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

  const currentPlan = plans.find(p => p.id === selectedPlanId) || plans[0] || defaultSubscriptionPlans[0];
  const rawBasePrice = billingCycle === 'monthly' ? currentPlan.priceMonthly : currentPlan.priceAnnual;
  const suitesSelected: ('crm' | 'hrms')[] = selectedSuiteOption === 'both' ? ['crm', 'hrms'] : [selectedSuiteOption];

  // Calculate discount
  let discountAmount = 0;
  if (appliedCoupon) {
    if (appliedCoupon.discountPercent) {
      discountAmount = Math.round((rawBasePrice * appliedCoupon.discountPercent) / 100);
    } else if (appliedCoupon.discountFlat) {
      discountAmount = Math.min(appliedCoupon.discountFlat, rawBasePrice);
    }
  }

  const basePriceAfterDiscount = Math.max(0, rawBasePrice - discountAmount);
  const gstAmount = Math.round(basePriceAfterDiscount * 0.18);
  const grandTotal = basePriceAfterDiscount + gstAmount;

  // Coupon validation
  const handleApplyCoupon = () => {
    setCouponError('');
    const cleanCode = couponCode.trim().toUpperCase();
    if (!cleanCode) return;

    try {
      const savedCoupons = localStorage.getItem('hrms_coupons_data');
      if (savedCoupons) {
        const couponList = JSON.parse(savedCoupons);
        const match = couponList.find((c: any) => c.code.toUpperCase() === cleanCode && c.status === 'active');
        if (match) {
          if (match.discountType === 'percentage') {
            setAppliedCoupon({ code: match.code, discountPercent: match.discountValue || match.value || 15 });
          } else {
            setAppliedCoupon({ code: match.code, discountFlat: match.discountValue || match.value || 500 });
          }
          return;
        }
      }
    } catch {}

    if (cleanCode === 'WELCOME50') {
      setAppliedCoupon({ code: 'WELCOME50', discountPercent: 50 });
    } else if (cleanCode === 'ENTERPRISE2026') {
      setAppliedCoupon({ code: 'ENTERPRISE2026', discountPercent: 25 });
    } else if (cleanCode === 'FLAT5000') {
      setAppliedCoupon({ code: 'FLAT5000', discountFlat: 5000 });
    } else {
      setCouponError('Invalid or expired coupon code.');
    }
  };

  const handleStep1Submit = (e: React.FormEvent) => {
    e.preventDefault();
    setStep(2);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleStep2Submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!companyName.trim()) {
      alert('Please enter your Company Name.');
      return;
    }
    setStep(3);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleStep3Submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!adminName.trim() || !adminEmail.trim() || !adminPhone.trim()) {
      alert('Please fill in all Administrator contact details.');
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(adminEmail.trim())) {
      alert('Please enter a valid email address (e.g. admin@company.com).');
      return;
    }
    const phoneClean = adminPhone.replace(/\D/g, '');
    if (phoneClean.length < 10) {
      alert('Please enter a valid 10-digit phone number.');
      return;
    }
    if (password && password.length < 6) {
      alert('Password must be at least 6 characters.');
      return;
    }
    if (password && confirmPassword && password !== confirmPassword) {
      alert('Passwords do not match.');
      return;
    }
    setStep(4);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const provisionWorkspace = (paymentRef?: string) => {
    setStep(5);
    window.scrollTo({ top: 0, behavior: 'smooth' });

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
      notes: paymentRef ? `Paid via Razorpay / Online (${paymentRef})` : 'Self-registered via Dedicated Portal.'
    };

    // Animate progress simulation
    let currentProgress = 10;
    setProvisioningProgress(currentProgress);
    setProvisioningStatusText('Provisioning database partition & schema...');

    const interval = setInterval(() => {
      currentProgress += 25;
      if (currentProgress === 35) {
        setProvisioningStatusText('Configuring CRM sales funnels & GST tax engine...');
      } else if (currentProgress === 60) {
        setProvisioningStatusText('Setting up HRMS Biometric Radar, Payroll & Shifts...');
      } else if (currentProgress === 85) {
        setProvisioningStatusText('Generating Super Admin SSO security credentials...');
      } else if (currentProgress >= 100) {
        clearInterval(interval);
        setProvisioningProgress(100);
        setProvisioningStatusText('Workspace ready! Launching your enterprise console...');

        const credPass = password || 'Admin@123';
        (newTenant as any).password = credPass;
        (newTenant as any).adminPassword = credPass;

        // 1. Sync multi-tenant registry
        syncCompanySubscriptionChange({
          companyId: newTenant.id,
          companyName: newTenant.name,
          email: newTenant.adminEmail,
          password: credPass,
          adminPassword: credPass,
          planId: newTenant.planId,
          status: 'active',
          billingCycle: newTenant.billingCycle,
          maxSeats: newTenant.userSeatLimit,
          renewalDate: newTenant.renewalDate
        });

        // 2. Save credentials to itlc_registered_users
        try {
          const savedUsers = localStorage.getItem('itlc_registered_users');
          const userList = savedUsers ? JSON.parse(savedUsers) : [];
          const userEntry = {
            id: `usr_${Date.now()}`,
            email: newTenant.adminEmail,
            password: credPass,
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

          // 2.1 Save to hrms_companies_data & dedicated store
          const companiesRaw = localStorage.getItem('hrms_companies_data');
          const compList = companiesRaw ? JSON.parse(companiesRaw) : [];
          const newCompObj = {
            id: newTenant.id,
            name: newTenant.name,
            logo: '/itlc_logo.png',
            ownerName: newTenant.adminName,
            email: newTenant.adminEmail,
            phone: newTenant.adminPhone,
            employeesCount: newTenant.userSeatLimit,
            subscriptionPlanId: newTenant.planId,
            storageUsed: 1.0,
            status: 'active',
            password: credPass,
            adminPassword: credPass,
            createdDate: newTenant.onboardDate,
            modulesEnabled: {
              attendance: true, leave: true, payroll: true, recruitment: true,
              performance: true, assets: true, training: true, aiReports: false,
              chat: true, projects: true, faceRecognition: false, gpsTracking: true,
              mobileApp: true, api: false, whiteLabel: false
            }
          };
          const updatedComps = [newCompObj, ...compList.filter((c: any) => c.id !== newTenant.id && c.email?.toLowerCase() !== newTenant.adminEmail.toLowerCase())];
          localStorage.setItem('hrms_companies_data', JSON.stringify(updatedComps));
          localStorage.setItem(`hrms_company_${newTenant.id}`, JSON.stringify(newCompObj));

          // 2.2 Save to crm_users
          const crmUsersRaw = localStorage.getItem('crm_users');
          const crmUsers = crmUsersRaw ? JSON.parse(crmUsersRaw) : [];
          const newCrmUser = {
            id: Date.now(),
            name: newTenant.adminName,
            email: newTenant.adminEmail,
            password: credPass,
            role: 'Admin',
            status: 'Active',
            avatar: (newTenant.adminName || 'AD').split(' ').map((w: string) => w[0]).join('').slice(0, 2).toUpperCase(),
            phone: newTenant.adminPhone,
            companyId: newTenant.id,
            companyName: newTenant.name
          };
          const updatedCrmUsers = [newCrmUser, ...crmUsers.filter((u: any) => u.email?.toLowerCase() !== newTenant.adminEmail.toLowerCase())];
          localStorage.setItem('crm_users', JSON.stringify(updatedCrmUsers));

          // 2.3 Create Head Admin EMP-001 in company-scoped and global employee stores
          const adminEmployee = {
            id: 1,
            employeeId: 'EMP-001',
            name: newTenant.adminName,
            email: newTenant.adminEmail,
            password: credPass,
            role: 'Company Administrator',
            department: 'Administration',
            designation: designation || 'Managing Director',
            status: 'Active',
            phone: newTenant.adminPhone,
            salary: '₹1,50,000',
            avatar: '/itlc_logo.png',
            joiningDate: newTenant.onboardDate,
            employmentType: 'Full-Time Permanent',
            companyId: newTenant.id,
            companyName: newTenant.name
          };
          localStorage.setItem(`hrms_employees_${newTenant.id}`, JSON.stringify([adminEmployee]));
          const globalEmpRaw = localStorage.getItem('hrms_employees');
          const globalEmps = globalEmpRaw ? JSON.parse(globalEmpRaw) : [];
          const updatedGlobalEmps = [adminEmployee, ...globalEmps.filter((e: any) => e.email?.toLowerCase() !== newTenant.adminEmail.toLowerCase())];
          localStorage.setItem('hrms_employees', JSON.stringify(updatedGlobalEmps));
        } catch (e) {}

        // 3. Save payment record
        try {
          const savedPayments = localStorage.getItem('hrms_payments_data');
          const payList = savedPayments ? JSON.parse(savedPayments) : [];
          const newPayRecord = {
            id: paymentRef || `pay_${Date.now()}`,
            companyId: newTenant.id,
            companyName: newTenant.name,
            amount: grandTotal,
            gateway: selectedPaymentGateway,
            status: 'successful',
            timestamp: new Date().toISOString(),
            invoiceNumber: `INV-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`,
            currency: 'INR'
          };
          payList.unshift(newPayRecord);
          localStorage.setItem('hrms_payments_data', JSON.stringify(payList));
        } catch (e) {}

        // 4. Save activity log
        try {
          const savedLogs = localStorage.getItem('hrms_activity_logs');
          const logList = savedLogs ? JSON.parse(savedLogs) : [];
          const newLog = {
            id: `log_${Date.now()}`,
            action: 'Company Registered & Subscribed',
            details: `Company "${newTenant.name}" registered and activated ${currentPlan.name} plan for ₹${grandTotal.toLocaleString()}.`,
            timestamp: new Date().toISOString(),
            category: 'subscription',
            actorName: newTenant.adminName
          };
          logList.unshift(newLog);
          localStorage.setItem('hrms_activity_logs', JSON.stringify(logList));
        } catch (e) {}

        // 5. Save SSO user profile & auth session
        try {
          const mockProfile = {
            id: `usr_${Date.now()}`,
            name: newTenant.adminName,
            fullName: newTenant.adminName,
            email: newTenant.adminEmail,
            role: 'Company Admin',
            department: 'Executive Management',
            designation,
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
        } catch (e) {}

        if (typeof window !== 'undefined') {
          window.dispatchEvent(new CustomEvent('superowner_data_updated'));
          window.dispatchEvent(new CustomEvent('subscription_plans_updated'));
          window.dispatchEvent(new CustomEvent('multi_tenant_updated'));
          window.dispatchEvent(new Event('storage'));
        }

        setTimeout(() => {
          onCompleteRegistration(newTenant);
        }, 1200);
      }
      setProvisioningProgress(Math.min(currentProgress, 100));
    }, 450);
  };

  const handleExecutePayment = async () => {
    if (selectedPaymentGateway === 'upi') {
      setShowUpiQrModal(true);
      return;
    }

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
          if (result && result.paymentId && !result.paymentId.startsWith('pay_sim_')) {
            provisionWorkspace(result.paymentId);
          } else {
            alert('Valid payment confirmation was not received. Workspace not created.');
          }
        },
        () => {
          setIsProcessingPayment(false);
        }
      );
    } catch (err: any) {
      console.warn('Razorpay checkout error:', err);
      setIsProcessingPayment(false);
      alert('Unable to complete Razorpay payment: ' + (err?.message || 'Payment was cancelled or failed.'));
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc', color: '#0f172a', fontFamily: 'system-ui, -apple-system, sans-serif' }}>
      
      {/* Top Navigation Bar */}
      <nav style={{ background: '#ffffff', borderBottom: '1px solid #e2e8f0', padding: '16px 24px', position: 'sticky', top: 0, zIndex: 40 }}>
        <div style={{ maxWidth: '1180px', margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <button 
              onClick={onBackToHome}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '8px 14px',
                borderRadius: '8px',
                border: '1px solid #e2e8f0',
                background: '#ffffff',
                color: '#475569',
                fontSize: '13px',
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
            >
              <ArrowLeft size={16} />
              {'Back to Home'}
            </button>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <img src="/itlc_logo.png" alt="ITLC Logo" style={{ height: '32px', width: 'auto' }} />
              <div>
                <strong style={{ fontSize: '16px', fontWeight: 900, color: '#0f172a', display: 'block', lineHeight: 1.1 }}>ITLC Enterprise</strong>
                <span style={{ fontSize: '11px', color: '#64748b' }}>Client Registration & Cloud Provisioning</span>
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '12px', fontWeight: 600, color: '#16a34a', background: '#f0fdf4', padding: '6px 12px', borderRadius: '20px', border: '1px solid #bbf7d0' }}>
              <ShieldCheck size={16} />
              256-Bit SSL Encrypted
            </span>
          </div>
        </div>
      </nav>

      {/* Main Container */}
      <div style={{ maxWidth: '1080px', margin: '32px auto', padding: '0 20px 80px' }}>
        
        {/* Step Progress Bar */}
        <div style={{ background: '#ffffff', borderRadius: '16px', border: '1px solid #e2e8f0', padding: '20px 24px', marginBottom: '32px', boxShadow: '0 4px 20px rgba(0,0,0,0.03)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'relative' }}>
            
            {/* Step 1 */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', zIndex: 2 }}>
              <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: step >= 1 ? '#2563eb' : '#e2e8f0', color: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '14px', marginBottom: '6px' }}>
                {step > 1 ? <Check size={18} /> : '1'}
              </div>
              <span style={{ fontSize: '12px', fontWeight: step === 1 ? 800 : 600, color: step >= 1 ? '#0f172a' : '#94a3b8' }}>
                {'1. Plan & Suites'}
              </span>
            </div>

            <div style={{ flex: 1, height: '3px', background: step >= 2 ? '#2563eb' : '#e2e8f0', margin: '0 8px', position: 'relative', top: '-10px' }} />

            {/* Step 2 */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', zIndex: 2 }}>
              <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: step >= 2 ? '#2563eb' : '#e2e8f0', color: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '14px', marginBottom: '6px' }}>
                {step > 2 ? <Check size={18} /> : '2'}
              </div>
              <span style={{ fontSize: '12px', fontWeight: step === 2 ? 800 : 600, color: step >= 2 ? '#0f172a' : '#94a3b8' }}>
                {'2. Company Details'}
              </span>
            </div>

            <div style={{ flex: 1, height: '3px', background: step >= 3 ? '#2563eb' : '#e2e8f0', margin: '0 8px', position: 'relative', top: '-10px' }} />

            {/* Step 3 */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', zIndex: 2 }}>
              <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: step >= 3 ? '#2563eb' : '#e2e8f0', color: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '14px', marginBottom: '6px' }}>
                {step > 3 ? <Check size={18} /> : '3'}
              </div>
              <span style={{ fontSize: '12px', fontWeight: step === 3 ? 800 : 600, color: step >= 3 ? '#0f172a' : '#94a3b8' }}>
                {'3. Admin Account'}
              </span>
            </div>

            <div style={{ flex: 1, height: '3px', background: step >= 4 ? '#2563eb' : '#e2e8f0', margin: '0 8px', position: 'relative', top: '-10px' }} />

            {/* Step 4 */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', zIndex: 2 }}>
              <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: step >= 4 ? '#2563eb' : '#e2e8f0', color: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '14px', marginBottom: '6px' }}>
                {step > 4 ? <Check size={18} /> : '4'}
              </div>
              <span style={{ fontSize: '12px', fontWeight: step === 4 ? 800 : 600, color: step >= 4 ? '#0f172a' : '#94a3b8' }}>
                {'4. Payment'}
              </span>
            </div>

            <div style={{ flex: 1, height: '3px', background: step >= 5 ? '#2563eb' : '#e2e8f0', margin: '0 8px', position: 'relative', top: '-10px' }} />

            {/* Step 5 */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', zIndex: 2 }}>
              <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: step === 5 ? '#16a34a' : '#e2e8f0', color: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '14px', marginBottom: '6px' }}>
                5
              </div>
              <span style={{ fontSize: '12px', fontWeight: step === 5 ? 800 : 600, color: step >= 5 ? '#16a34a' : '#94a3b8' }}>
                {'5. Launch'}
              </span>
            </div>

          </div>
        </div>

        {/* STEP 1: CHOOSE PLAN & SUITES */}
        {step === 1 && (
          <form onSubmit={handleStep1Submit} style={{ background: '#ffffff', borderRadius: '20px', border: '1px solid #e2e8f0', padding: '32px', boxShadow: '0 10px 30px rgba(0,0,0,0.04)' }}>
            <div style={{ marginBottom: '28px' }}>
              <span style={{ fontSize: '12px', fontWeight: 800, color: '#2563eb', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Step 1 of 4</span>
              <h2 style={{ fontSize: '24px', fontWeight: 900, color: '#0f172a', margin: '4px 0 8px' }}>
                {'Select Your Enterprise Solution & Plan'}
              </h2>
              <p style={{ fontSize: '14px', color: '#64748b', margin: 0 }}>
                {'Choose the pricing plan and software modules tailored to your organizational workflow.'}
              </p>
            </div>

            {/* Billing Cycle Toggle */}
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '28px' }}>
              <div style={{ background: '#f1f5f9', padding: '4px', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <button
                  type="button"
                  onClick={() => setBillingCycle('monthly')}
                  style={{
                    padding: '8px 20px',
                    borderRadius: '8px',
                    border: 'none',
                    fontWeight: 700,
                    fontSize: '13px',
                    cursor: 'pointer',
                    background: billingCycle === 'monthly' ? '#ffffff' : 'transparent',
                    color: billingCycle === 'monthly' ? '#0f172a' : '#64748b',
                    boxShadow: billingCycle === 'monthly' ? '0 2px 8px rgba(0,0,0,0.06)' : 'none'
                  }}
                >
                  {'Monthly Billing'}
                </button>
                <button
                  type="button"
                  onClick={() => setBillingCycle('annual')}
                  style={{
                    padding: '8px 20px',
                    borderRadius: '8px',
                    border: 'none',
                    fontWeight: 700,
                    fontSize: '13px',
                    cursor: 'pointer',
                    background: billingCycle === 'annual' ? '#ffffff' : 'transparent',
                    color: billingCycle === 'annual' ? '#0f172a' : '#64748b',
                    boxShadow: billingCycle === 'annual' ? '0 2px 8px rgba(0,0,0,0.06)' : 'none',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}
                >
                  {'Annual Billing'}
                  <span style={{ fontSize: '10px', fontWeight: 800, background: '#dcfce7', color: '#16a34a', padding: '2px 6px', borderRadius: '10px' }}>
                    SAVE 20%
                  </span>
                </button>
              </div>
            </div>

            {/* Software Suite Option */}
            <div style={{ marginBottom: '28px' }}>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#334155', marginBottom: '10px' }}>
                {'Choose Connected Workspace Solutions:'}
              </label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '14px' }}>
                <div 
                  onClick={() => setSelectedSuiteOption('both')}
                  style={{
                    padding: '16px',
                    borderRadius: '14px',
                    border: `2px solid ${selectedSuiteOption === 'both' ? '#2563eb' : '#e2e8f0'}`,
                    background: selectedSuiteOption === 'both' ? '#eff6ff' : '#ffffff',
                    cursor: 'pointer',
                    transition: 'all 0.2s'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                    <strong style={{ fontSize: '15px', color: '#0f172a' }}>⚡ CRM + HRMS (Combined)</strong>
                    {selectedSuiteOption === 'both' && <CheckCircle2 size={18} color="#2563eb" />}
                  </div>
                  <p style={{ fontSize: '12px', color: '#64748b', margin: 0 }}>
                    Sales pipelines, GST billing, Biometric radar, GPS attendance & payroll all-in-one.
                  </p>
                </div>

                <div 
                  onClick={() => setSelectedSuiteOption('crm')}
                  style={{
                    padding: '16px',
                    borderRadius: '14px',
                    border: `2px solid ${selectedSuiteOption === 'crm' ? '#2563eb' : '#e2e8f0'}`,
                    background: selectedSuiteOption === 'crm' ? '#eff6ff' : '#ffffff',
                    cursor: 'pointer',
                    transition: 'all 0.2s'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                    <strong style={{ fontSize: '15px', color: '#0f172a' }}>💼 CRM Suite Only</strong>
                    {selectedSuiteOption === 'crm' && <CheckCircle2 size={18} color="#2563eb" />}
                  </div>
                  <p style={{ fontSize: '12px', color: '#64748b', margin: 0 }}>
                    Leads Kanban, deals, GST invoicing, client portal & sales tracking.
                  </p>
                </div>

                <div 
                  onClick={() => setSelectedSuiteOption('hrms')}
                  style={{
                    padding: '16px',
                    borderRadius: '14px',
                    border: `2px solid ${selectedSuiteOption === 'hrms' ? '#2563eb' : '#e2e8f0'}`,
                    background: selectedSuiteOption === 'hrms' ? '#eff6ff' : '#ffffff',
                    cursor: 'pointer',
                    transition: 'all 0.2s'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                    <strong style={{ fontSize: '15px', color: '#0f172a' }}>👥 HRMS Suite Only</strong>
                    {selectedSuiteOption === 'hrms' && <CheckCircle2 size={18} color="#2563eb" />}
                  </div>
                  <p style={{ fontSize: '12px', color: '#64748b', margin: 0 }}>
                    Employee records, biometric radar, attendance, leave approval & payroll slips.
                  </p>
                </div>
              </div>
            </div>

            {/* Plans Grid */}
            <div style={{ marginBottom: '32px' }}>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#334155', marginBottom: '12px' }}>
                {'Select Subscription Plan:'}
              </label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
                {plans.map((p) => {
                  const isSelected = selectedPlanId === p.id;
                  const displayPrice = billingCycle === 'monthly' ? p.priceMonthly : p.priceAnnual;
                  return (
                    <div
                      key={p.id}
                      onClick={() => setSelectedPlanId(p.id)}
                      style={{
                        padding: '20px',
                        borderRadius: '16px',
                        border: `2px solid ${isSelected ? '#2563eb' : '#e2e8f0'}`,
                        background: isSelected ? '#ffffff' : '#f8fafc',
                        boxShadow: isSelected ? '0 8px 24px rgba(37, 99, 235, 0.12)' : 'none',
                        cursor: 'pointer',
                        transition: 'all 0.2s',
                        position: 'relative'
                      }}
                    >
                      {isSelected && (
                        <div style={{ position: 'absolute', top: '16px', right: '16px' }}>
                          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '11px', fontWeight: 800, background: '#2563eb', color: '#ffffff', padding: '3px 8px', borderRadius: '20px' }}>
                            <Check size={12} /> SELECTED
                          </span>
                        </div>
                      )}
                      <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#0f172a', margin: '0 0 6px' }}>{p.name}</h3>
                      <p style={{ fontSize: '12px', color: '#64748b', margin: '0 0 16px' }}>{p.tagline || 'Complete enterprise productivity solution'}</p>

                      <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px', marginBottom: '16px' }}>
                        <span style={{ fontSize: '28px', fontWeight: 900, color: '#0f172a' }}>₹{displayPrice.toLocaleString()}</span>
                        <span style={{ fontSize: '12px', color: '#64748b' }}>/{billingCycle === 'annual' ? 'year' : 'month'}</span>
                      </div>

                      <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: '12px', fontSize: '12px', color: '#475569' }}>
                        <div style={{ marginBottom: '6px', fontWeight: 700, color: '#0f172a' }}>👥 Up to {p.seatLimit} Employee Seats</div>
                        <div style={{ marginBottom: '6px' }}>⚡ Real-time Biometric Radar & GPS</div>
                        <div style={{ marginBottom: '6px' }}>📑 Automated GST Tax Invoicing</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Bottom Navigation Buttons */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #e2e8f0', paddingTop: '20px' }}>
              <button
                type="button"
                onClick={onBackToHome}
                style={{ padding: '12px 20px', borderRadius: '10px', border: '1px solid #cbd5e1', background: '#ffffff', color: '#475569', fontWeight: 700, fontSize: '14px', cursor: 'pointer' }}
              >
                {'Cancel'}
              </button>
              <button
                type="submit"
                style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '12px 28px', borderRadius: '10px', border: 'none', background: '#2563eb', color: '#ffffff', fontWeight: 800, fontSize: '14px', cursor: 'pointer', boxShadow: '0 4px 14px rgba(37, 99, 235, 0.3)' }}
              >
                {'Continue: Company Details'}
                <ArrowRight size={16} />
              </button>
            </div>
          </form>
        )}

        {/* STEP 2: COMPANY & WORKSPACE DETAILS */}
        {step === 2 && (
          <form onSubmit={handleStep2Submit} style={{ background: '#ffffff', borderRadius: '20px', border: '1px solid #e2e8f0', padding: '32px', boxShadow: '0 10px 30px rgba(0,0,0,0.04)' }}>
            <div style={{ marginBottom: '28px' }}>
              <span style={{ fontSize: '12px', fontWeight: 800, color: '#2563eb', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Step 2 of 4</span>
              <h2 style={{ fontSize: '24px', fontWeight: 900, color: '#0f172a', margin: '4px 0 8px' }}>
                {'Company & Workspace Setup'}
              </h2>
              <p style={{ fontSize: '14px', color: '#64748b', margin: 0 }}>
                {'Enter your organization information to establish your private multi-tenant workspace.'}
              </p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px', marginBottom: '24px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                  {'Company Legal Name *'}
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Apex Technologies Pvt Ltd"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  style={{ width: '100%', padding: '12px 14px', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '14px', outline: 'none', background: '#f8fafc' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                  {'Industry Sector'}
                </label>
                <select
                  value={industry}
                  onChange={(e) => setIndustry(e.target.value)}
                  style={{ width: '100%', padding: '12px 14px', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '14px', outline: 'none', background: '#f8fafc' }}
                >
                  <option value="IT & Software Services">IT & Software Services</option>
                  <option value="Financial & Banking Services">Financial & Banking Services</option>
                  <option value="Manufacturing & Industrial">Manufacturing & Industrial</option>
                  <option value="Healthcare & Pharmaceuticals">Healthcare & Pharmaceuticals</option>
                  <option value="Retail & E-commerce">Retail & E-commerce</option>
                  <option value="Real Estate & Construction">Real Estate & Construction</option>
                  <option value="Logistics & Supply Chain">Logistics & Supply Chain</option>
                  <option value="Education & EdTech">Education & EdTech</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                  {'Total Expected Team Size'}
                </label>
                <input
                  type="number"
                  min={1}
                  max={50000}
                  value={teamSize}
                  onChange={(e) => setTeamSize(Number(e.target.value))}
                  style={{ width: '100%', padding: '12px 14px', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '14px', outline: 'none', background: '#f8fafc' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                  {'GSTIN (Optional)'}
                </label>
                <input
                  type="text"
                  placeholder="e.g. 09AAACH7409R1ZZ"
                  value={gstin}
                  onChange={(e) => setGstin(e.target.value.toUpperCase())}
                  style={{ width: '100%', padding: '12px 14px', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '14px', outline: 'none', background: '#f8fafc' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                  {'City / Headquarters'}
                </label>
                <input
                  type="text"
                  placeholder="e.g. Lucknow / Delhi / Bangalore"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  style={{ width: '100%', padding: '12px 14px', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '14px', outline: 'none', background: '#f8fafc' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                  {'State'}
                </label>
                <input
                  type="text"
                  placeholder="e.g. Uttar Pradesh, Maharashtra"
                  value={stateName}
                  onChange={(e) => setStateName(e.target.value)}
                  style={{ width: '100%', padding: '12px 14px', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '14px', outline: 'none', background: '#f8fafc' }}
                />
              </div>
            </div>

            {/* Workspace Domain Preview Card */}
            <div style={{ background: '#f1f5f9', borderRadius: '12px', padding: '16px', marginBottom: '28px', display: 'flex', alignItems: 'center', gap: '12px' }}>
              <Globe size={24} color="#2563eb" />
              <div>
                <span style={{ fontSize: '12px', color: '#64748b', display: 'block' }}>Dedicated Workspace URL:</span>
                <strong style={{ fontSize: '14px', color: '#0f172a', fontFamily: 'monospace' }}>
                  https://{companyName.toLowerCase().replace(/[^a-z0-9]/g, '') || 'yourcompany'}.itlc.cloud
                </strong>
              </div>
            </div>

            {/* Bottom Navigation */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #e2e8f0', paddingTop: '20px' }}>
              <button
                type="button"
                onClick={() => setStep(1)}
                style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '12px 20px', borderRadius: '10px', border: '1px solid #cbd5e1', background: '#ffffff', color: '#475569', fontWeight: 700, fontSize: '14px', cursor: 'pointer' }}
              >
                <ArrowLeft size={16} />
                {'Previous Step'}
              </button>
              <button
                type="submit"
                style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '12px 28px', borderRadius: '10px', border: 'none', background: '#2563eb', color: '#ffffff', fontWeight: 800, fontSize: '14px', cursor: 'pointer', boxShadow: '0 4px 14px rgba(37, 99, 235, 0.3)' }}
              >
                {'Continue: Admin Setup'}
                <ArrowRight size={16} />
              </button>
            </div>
          </form>
        )}

        {/* STEP 3: ADMINISTRATOR ACCOUNT & CREDENTIALS */}
        {step === 3 && (
          <form onSubmit={handleStep3Submit} style={{ background: '#ffffff', borderRadius: '20px', border: '1px solid #e2e8f0', padding: '32px', boxShadow: '0 10px 30px rgba(0,0,0,0.04)' }}>
            <div style={{ marginBottom: '28px' }}>
              <span style={{ fontSize: '12px', fontWeight: 800, color: '#2563eb', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Step 3 of 4</span>
              <h2 style={{ fontSize: '24px', fontWeight: 900, color: '#0f172a', margin: '4px 0 8px' }}>
                {'Administrator & Login Credentials'}
              </h2>
              <p style={{ fontSize: '14px', color: '#64748b', margin: 0 }}>
                {'Set up the master administrator credentials for enterprise authorization and dashboard access.'}
              </p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px', marginBottom: '28px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                  {'Administrator Full Name *'}
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Priya Sharma / Rajesh Verma"
                  value={adminName}
                  onChange={(e) => setAdminName(e.target.value)}
                  style={{ width: '100%', padding: '12px 14px', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '14px', outline: 'none', background: '#f8fafc' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                  {'Work Email (Master Login ID) *'}
                </label>
                <input
                  type="email"
                  required
                  placeholder="e.g. admin@company.com"
                  value={adminEmail}
                  onChange={(e) => setAdminEmail(e.target.value)}
                  style={{ width: '100%', padding: '12px 14px', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '14px', outline: 'none', background: '#f8fafc' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                  {'Phone Number (WhatsApp Alerts) *'}
                </label>
                <input
                  type="tel"
                  required
                  placeholder="e.g. +91 98765 43210"
                  value={adminPhone}
                  onChange={(e) => setAdminPhone(e.target.value)}
                  style={{ width: '100%', padding: '12px 14px', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '14px', outline: 'none', background: '#f8fafc' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                  {'Designation / Role'}
                </label>
                <input
                  type="text"
                  value={designation}
                  onChange={(e) => setDesignation(e.target.value)}
                  style={{ width: '100%', padding: '12px 14px', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '14px', outline: 'none', background: '#f8fafc' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                  {'Master Password *'}
                </label>
                <input
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  style={{ width: '100%', padding: '12px 14px', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '14px', outline: 'none', background: '#f8fafc' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                  {'Confirm Master Password *'}
                </label>
                <input
                  type="password"
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  style={{ width: '100%', padding: '12px 14px', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '14px', outline: 'none', background: '#f8fafc' }}
                />
              </div>
            </div>

            {/* Bottom Navigation */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #e2e8f0', paddingTop: '20px' }}>
              <button
                type="button"
                onClick={() => setStep(2)}
                style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '12px 20px', borderRadius: '10px', border: '1px solid #cbd5e1', background: '#ffffff', color: '#475569', fontWeight: 700, fontSize: '14px', cursor: 'pointer' }}
              >
                <ArrowLeft size={16} />
                {'Previous Step'}
              </button>
              <button
                type="submit"
                style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '12px 28px', borderRadius: '10px', border: 'none', background: '#2563eb', color: '#ffffff', fontWeight: 800, fontSize: '14px', cursor: 'pointer', boxShadow: '0 4px 14px rgba(37, 99, 235, 0.3)' }}
              >
                {'Continue: Order & Payment'}
                <ArrowRight size={16} />
              </button>
            </div>
          </form>
        )}

        {/* STEP 4: ORDER INVOICE, COUPON & PAYMENT GATEWAY */}
        {step === 4 && (
          <div style={{ background: '#ffffff', borderRadius: '20px', border: '1px solid #e2e8f0', padding: '32px', boxShadow: '0 10px 30px rgba(0,0,0,0.04)' }}>
            <div style={{ marginBottom: '28px' }}>
              <span style={{ fontSize: '12px', fontWeight: 800, color: '#2563eb', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Step 4 of 4</span>
              <h2 style={{ fontSize: '24px', fontWeight: 900, color: '#0f172a', margin: '4px 0 8px' }}>
                {'Order Review & Live Payment Gateway'}
              </h2>
              <p style={{ fontSize: '14px', color: '#64748b', margin: 0 }}>
                {'Review your tax breakdown, apply promotional discounts, and complete payment to launch.'}
              </p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '32px', marginBottom: '32px' }}>
              
              {/* Left Column: Order Summary Card */}
              <div style={{ background: '#f8fafc', borderRadius: '16px', border: '1px solid #e2e8f0', padding: '24px' }}>
                <h3 style={{ fontSize: '16px', fontWeight: 800, color: '#0f172a', margin: '0 0 16px', borderBottom: '1px solid #e2e8f0', paddingBottom: '10px' }}>
                  📑 Tax Invoice Breakdown
                </h3>

                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px', marginBottom: '10px', color: '#475569' }}>
                  <span>Company Name:</span>
                  <strong style={{ color: '#0f172a' }}>{companyName}</strong>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px', marginBottom: '10px', color: '#475569' }}>
                  <span>Selected Plan:</span>
                  <strong style={{ color: '#2563eb' }}>{currentPlan.name} ({billingCycle.toUpperCase()})</strong>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px', marginBottom: '10px', color: '#475569' }}>
                  <span>Base Subscription Fee:</span>
                  <span>₹{rawBasePrice.toLocaleString()}</span>
                </div>

                {discountAmount > 0 && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px', marginBottom: '10px', color: '#16a34a', fontWeight: 700 }}>
                    <span>Promo Code ({appliedCoupon?.code}):</span>
                    <span>-₹{discountAmount.toLocaleString()}</span>
                  </div>
                )}

                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px', marginBottom: '10px', color: '#475569' }}>
                  <span>GST (18% CGST + SGST):</span>
                  <span>₹{gstAmount.toLocaleString()}</span>
                </div>

                <div style={{ borderTop: '2px dashed #cbd5e1', paddingTop: '14px', marginTop: '14px', display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                  <strong style={{ fontSize: '18px', color: '#0f172a' }}>Grand Total (INR):</strong>
                  <strong style={{ fontSize: '26px', color: '#2563eb', fontWeight: 900 }}>₹{grandTotal.toLocaleString()}</strong>
                </div>

                {/* Promo Code Input Box */}
                <div style={{ marginTop: '20px', paddingTop: '16px', borderTop: '1px solid #e2e8f0' }}>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                    <Tag size={13} style={{ display: 'inline', marginRight: '4px' }} />
                    {'Have a Promo / Coupon Code?'}
                  </label>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <input
                      type="text"
                      placeholder="e.g. WELCOME50"
                      value={couponCode}
                      onChange={(e) => setCouponCode(e.target.value)}
                      style={{ flex: 1, padding: '10px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px', textTransform: 'uppercase' }}
                    />
                    <button
                      type="button"
                      onClick={handleApplyCoupon}
                      style={{ padding: '10px 16px', borderRadius: '8px', border: 'none', background: '#0f172a', color: '#ffffff', fontWeight: 700, fontSize: '13px', cursor: 'pointer' }}
                    >
                      Apply
                    </button>
                  </div>
                  {couponError && <span style={{ color: '#ef4444', fontSize: '11px', marginTop: '4px', display: 'block' }}>{couponError}</span>}
                  {appliedCoupon && (
                    <span style={{ color: '#16a34a', fontSize: '12px', fontWeight: 700, marginTop: '6px', display: 'block' }}>
                      ✓ Coupon {appliedCoupon.code} applied successfully!
                    </span>
                  )}
                </div>
              </div>

              {/* Right Column: Payment Methods Selector */}
              <div>
                <h3 style={{ fontSize: '16px', fontWeight: 800, color: '#0f172a', margin: '0 0 16px' }}>
                  💳 Select Payment Gateway
                </h3>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '24px' }}>
                  
                  {/* Razorpay Option (PRIMARY DEFAULT) */}
                  <div 
                    onClick={() => setSelectedPaymentGateway('razorpay')}
                    style={{
                      padding: '18px 16px',
                      borderRadius: '12px',
                      border: `2px solid ${selectedPaymentGateway === 'razorpay' ? '#2563eb' : '#e2e8f0'}`,
                      background: selectedPaymentGateway === 'razorpay' ? '#eff6ff' : '#ffffff',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      boxShadow: selectedPaymentGateway === 'razorpay' ? '0 4px 14px rgba(37, 99, 235, 0.15)' : 'none'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div style={{ width: '42px', height: '42px', borderRadius: '10px', background: '#dbeafe', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Zap size={24} color="#2563eb" />
                      </div>
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <strong style={{ fontSize: '15px', color: '#0f172a' }}>Razorpay Official Gateway</strong>
                          <span style={{ fontSize: '10px', fontWeight: 800, background: '#dbeafe', color: '#1d4ed8', padding: '2px 8px', borderRadius: '6px' }}>⚡ Live UPI QR & Cards</span>
                        </div>
                        <span style={{ fontSize: '12px', color: '#64748b' }}>UPI QR, Google Pay, PhonePe, Paytm, Cards & NetBanking</span>
                      </div>
                    </div>
                    {selectedPaymentGateway === 'razorpay' && <CheckCircle2 size={20} color="#2563eb" />}
                  </div>

                  {/* Direct UPI QR Option (Fallback) */}
                  <div 
                    onClick={() => setSelectedPaymentGateway('upi')}
                    style={{
                      padding: '16px',
                      borderRadius: '12px',
                      border: `2px solid ${selectedPaymentGateway === 'upi' ? '#16a34a' : '#e2e8f0'}`,
                      background: selectedPaymentGateway === 'upi' ? '#f0fdf4' : '#ffffff',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: '#dcfce7', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <QrCode size={22} color="#16a34a" />
                      </div>
                      <div>
                        <strong style={{ fontSize: '14px', color: '#0f172a', display: 'block' }}>Direct Merchant UPI QR</strong>
                        <span style={{ fontSize: '11px', color: '#64748b' }}>Scan directly with any UPI App</span>
                      </div>
                    </div>
                    {selectedPaymentGateway === 'upi' && <CheckCircle2 size={18} color="#16a34a" />}
                  </div>

                  {/* Credit / Debit Card Option */}
                  <div 
                    onClick={() => setSelectedPaymentGateway('card')}
                    style={{
                      padding: '16px',
                      borderRadius: '12px',
                      border: `2px solid ${selectedPaymentGateway === 'card' ? '#2563eb' : '#e2e8f0'}`,
                      background: selectedPaymentGateway === 'card' ? '#eff6ff' : '#ffffff',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: '#f3e8ff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <CreditCard size={22} color="#8b5cf6" />
                      </div>
                      <div>
                        <strong style={{ fontSize: '14px', color: '#0f172a', display: 'block' }}>Direct Corporate Card</strong>
                        <span style={{ fontSize: '11px', color: '#64748b' }}>Visa, MasterCard, RuPay, Corporate Amex</span>
                      </div>
                    </div>
                    {selectedPaymentGateway === 'card' && <CheckCircle2 size={18} color="#2563eb" />}
                  </div>

                </div>

                {/* Launch Action Button */}
                <button
                  type="button"
                  disabled={isProcessingPayment}
                  onClick={handleExecutePayment}
                  style={{
                    width: '100%',
                    padding: '16px',
                    borderRadius: '12px',
                    border: 'none',
                    background: 'linear-gradient(135deg, #16a34a, #15803d)',
                    color: '#ffffff',
                    fontWeight: 900,
                    fontSize: '16px',
                    cursor: isProcessingPayment ? 'not-allowed' : 'pointer',
                    boxShadow: '0 8px 24px rgba(22, 163, 74, 0.35)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '10px'
                  }}
                >
                  <Lock size={18} />
                  {isProcessingPayment 
                    ? ('Verifying Payment & Launching...')
                    : (`Pay ₹${grandTotal.toLocaleString()} & Launch Workspace`)}
                </button>
              </div>

            </div>

            {/* Bottom Navigation */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #e2e8f0', paddingTop: '20px' }}>
              <button
                type="button"
                onClick={() => setStep(3)}
                style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '12px 20px', borderRadius: '10px', border: '1px solid #cbd5e1', background: '#ffffff', color: '#475569', fontWeight: 700, fontSize: '14px', cursor: 'pointer' }}
              >
                <ArrowLeft size={16} />
                {'Previous Step'}
              </button>
            </div>
          </div>
        )}

        {/* STEP 5: PROVISIONING & LAUNCH ANIMATION */}
        {step === 5 && (
          <div style={{ background: '#ffffff', borderRadius: '24px', border: '1px solid #e2e8f0', padding: '48px 32px', textAlign: 'center', boxShadow: '0 12px 40px rgba(0,0,0,0.06)' }}>
            <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: '#dcfce7', color: '#16a34a', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px' }}>
              <Sparkles size={40} />
            </div>

            <h2 style={{ fontSize: '26px', fontWeight: 900, color: '#0f172a', margin: '0 0 8px' }}>
              {provisioningProgress < 100 
                ? ('Provisioning Your Dedicated Workspace...')
                : (`🎉 Congratulations! ${companyName} is Live!`)}
            </h2>
            <p style={{ fontSize: '14px', color: '#64748b', maxWidth: '540px', margin: '0 auto 32px' }}>
              {provisioningStatusText}
            </p>

            {/* Progress Bar */}
            <div style={{ maxWidth: '480px', margin: '0 auto 32px', background: '#e2e8f0', height: '12px', borderRadius: '10px', overflow: 'hidden' }}>
              <div style={{ width: `${provisioningProgress}%`, height: '100%', background: 'linear-gradient(90deg, #2563eb, #16a34a)', transition: 'width 0.4s ease' }} />
            </div>

            <div style={{ background: '#f8fafc', borderRadius: '14px', padding: '20px', maxWidth: '480px', margin: '0 auto 24px', textAlign: 'left', fontSize: '13px', color: '#475569' }}>
              <div style={{ marginBottom: '8px' }}>🏢 <strong>Company:</strong> {companyName}</div>
              <div style={{ marginBottom: '8px' }}>👤 <strong>Super Admin:</strong> {adminName} ({adminEmail})</div>
              <div style={{ marginBottom: '8px' }}>⚡ <strong>Plan Activated:</strong> {currentPlan.name} ({billingCycle.toUpperCase()})</div>
              <div>🌐 <strong>Workspace URL:</strong> https://{companyName.toLowerCase().replace(/[^a-z0-9]/g, '') || 'company'}.itlc.cloud</div>
            </div>
          </div>
        )}

        {/* INSTANT DIRECT UPI QR CODE MODAL (CRYSTAL CLEAR, ZERO BLUR) */}
        {showUpiQrModal && (
          <div 
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: 'rgba(15, 23, 42, 0.75)',
              backdropFilter: 'blur(6px)',
              zIndex: 99999,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '20px'
            }}
          >
            <div 
              style={{
                background: '#ffffff',
                borderRadius: '24px',
                maxWidth: '440px',
                width: '100%',
                padding: '28px 24px',
                boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.35)',
                position: 'relative',
                textAlign: 'center',
                border: '1px solid #e2e8f0',
                animation: 'fadeIn 0.2s ease-out'
              }}
            >
              {/* Close Button */}
              <button
                type="button"
                onClick={() => setShowUpiQrModal(false)}
                style={{
                  position: 'absolute',
                  top: '16px',
                  right: '16px',
                  background: '#f1f5f9',
                  border: 'none',
                  borderRadius: '50%',
                  width: '32px',
                  height: '32px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  color: '#64748b'
                }}
              >
                <X size={18} />
              </button>

              {/* Title & Badge */}
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: '#f0fdf4', border: '1px solid #bbf7d0', color: '#16a34a', padding: '4px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: 700, marginBottom: '12px' }}>
                <ShieldCheck size={14} />
                <span>Verified Direct UPI Gateway</span>
              </div>

              <h3 style={{ fontSize: '18px', fontWeight: 900, color: '#0f172a', margin: '0 0 4px' }}>
                Scan to Pay ₹{grandTotal.toLocaleString()}
              </h3>
              <p style={{ fontSize: '12px', color: '#64748b', margin: '0 0 16px' }}>
                Scan this QR code with Google Pay, PhonePe, Paytm or any UPI app
              </p>

              {/* Crystal-Clear High-Resolution QR Code Container */}
              <div 
                style={{
                  background: '#ffffff',
                  padding: '12px',
                  borderRadius: '16px',
                  border: '2px solid #0f172a',
                  display: 'inline-block',
                  boxShadow: '0 8px 20px rgba(0,0,0,0.08)',
                  marginBottom: '16px'
                }}
              >
                <img 
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=240x240&margin=8&data=${encodeURIComponent(`upi://pay?pa=${getPlatformUpiId()}&pn=ITLC%20INDIA&am=${grandTotal}&cu=INR&tn=${encodeURIComponent('Plan ' + currentPlan.name + ' ' + companyName)}`)}`} 
                  alt="Crystal Clear UPI QR Code"
                  style={{
                    width: '210px',
                    height: '210px',
                    display: 'block',
                    borderRadius: '8px'
                  }}
                />
              </div>

              {/* UPI ID Copy Pill */}
              <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '10px 14px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px', gap: '8px' }}>
                <div style={{ textAlign: 'left', overflow: 'hidden' }}>
                  <span style={{ fontSize: '10px', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 700, display: 'block' }}>Merchant UPI ID</span>
                  <span style={{ fontSize: '13px', fontWeight: 800, color: '#0f172a', fontFamily: 'monospace' }}>{getPlatformUpiId()}</span>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    navigator.clipboard.writeText(getPlatformUpiId());
                    setCopiedUpi(true);
                    setTimeout(() => setCopiedUpi(false), 2000);
                  }}
                  style={{
                    padding: '6px 12px',
                    borderRadius: '8px',
                    border: '1px solid #cbd5e1',
                    background: copiedUpi ? '#16a34a' : '#ffffff',
                    color: copiedUpi ? '#ffffff' : '#0f172a',
                    fontSize: '11px',
                    fontWeight: 700,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    transition: 'all 0.15s ease'
                  }}
                >
                  {copiedUpi ? <Check size={12} /> : <Copy size={12} />}
                  <span>{copiedUpi ? 'Copied!' : 'Copy'}</span>
                </button>
              </div>

              {/* Mobile Deep Link Button */}
              <a
                href={`upi://pay?pa=${getPlatformUpiId()}&pn=ITLC%20INDIA&am=${grandTotal}&cu=INR&tn=${encodeURIComponent('Plan ' + currentPlan.name + ' ' + companyName)}`}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  padding: '10px',
                  borderRadius: '10px',
                  background: '#f1f5f9',
                  color: '#2563eb',
                  fontSize: '12px',
                  fontWeight: 700,
                  textDecoration: 'none',
                  marginBottom: '16px'
                }}
              >
                <Smartphone size={14} />
                <span>Pay directly via UPI App on Mobile</span>
                <ExternalLink size={12} />
              </a>

              {/* UTR Input & Confirmation */}
              <div style={{ textAlign: 'left', marginBottom: '16px' }}>
                <label style={{ fontSize: '11px', fontWeight: 700, color: '#475569', display: 'block', marginBottom: '6px' }}>
                  UPI Reference / UTR Number (Optional):
                </label>
                <input 
                  type="text"
                  placeholder="e.g. 423871928371 or leave blank"
                  value={upiRefNumber}
                  onChange={(e) => setUpiRefNumber(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    borderRadius: '8px',
                    border: '1px solid #cbd5e1',
                    fontSize: '13px',
                    boxSizing: 'border-box'
                  }}
                />
              </div>

              {/* Action Confirm Button */}
              <button
                type="button"
                onClick={() => {
                  setShowUpiQrModal(false);
                  const payRef = upiRefNumber.trim() ? `UPI_${upiRefNumber.trim()}` : `UPI_VERIFIED_${Date.now()}`;
                  provisionWorkspace(payRef);
                }}
                style={{
                  width: '100%',
                  padding: '14px',
                  borderRadius: '12px',
                  border: 'none',
                  background: 'linear-gradient(135deg, #16a34a, #15803d)',
                  color: '#ffffff',
                  fontWeight: 900,
                  fontSize: '15px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  boxShadow: '0 8px 20px rgba(22, 163, 74, 0.35)'
                }}
              >
                <CheckCircle size={18} />
                <span>I Have Paid — Launch My Workspace</span>
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
