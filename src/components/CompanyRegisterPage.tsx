import React, { useState, useEffect } from 'react';
import { 
  Building2, 
  Sparkles, 
  ShieldCheck, 
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
  Copy, 
  QrCode, 
  Tag, 
  CheckCircle, 
  X, 
  ExternalLink, 
  Smartphone,
  Eye,
  EyeOff,
  FileText,
  Clock,
  Award,
  ChevronDown,
  Download
} from 'lucide-react';
import { 
  getLiveSubscriptionPlans, 
  defaultSubscriptionPlans, 
  syncCompanySubscriptionChange,
  type TenantCompany, 
  type TenantFeatureFlags, 
  type SubscriptionPlanDef,
  getLiveSuperOwnerTaxConfig 
} from '../types/multiTenant';
import { paymentService } from '../services/paymentService';
import { downloadPaymentSlip } from '../utils/PaymentSlip';
import { API_URL } from '../services/api';

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
  const [step, setStep] = useState<1 | 2 | 3>(1); // 1: Organization & Admin Setup, 2: Payment & Order, 3: Provisioning & Success
  const [selectedPlanId, setSelectedPlanId] = useState<string>(initialPlanId || 'starter');
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'annual'>('monthly');
  const [showPlanSwitcher, setShowPlanSwitcher] = useState(false);

  // Form State: Company Details
  const [companyName, setCompanyName] = useState('');
  const [gstin, setGstin] = useState('');
  const [industry, setIndustry] = useState('IT & Software Services');
  const [teamSize, setTeamSize] = useState<number>(25);
  const [city, setCity] = useState('');
  const [stateName, setStateName] = useState('');

  // Form State: Admin Credentials
  const [adminName, setAdminName] = useState('');
  const [adminEmail, setAdminEmail] = useState('');
  const [adminPhone, setAdminPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [designation, setDesignation] = useState('Director / Founder');

  // Form State: Coupon & Payment
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<{ code: string; discountPercent?: number; discountFlat?: number } | null>(null);
  const [couponError, setCouponError] = useState('');
  const [selectedPaymentGateway, setSelectedPaymentGateway] = useState<'razorpay' | 'trial'>('razorpay');
  const [showUpiQrModal, setShowUpiQrModal] = useState(false);
  const [upiRefNumber, setUpiRefNumber] = useState('');
  const [copiedUpi, setCopiedUpi] = useState(false);
  const [copiedCreds, setCopiedCreds] = useState(false);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);

  // Provisioning & Completion State
  const [provisioningProgress, setProvisioningProgress] = useState(0);
  const [provisioningStatusText, setProvisioningStatusText] = useState('Initializing workspace...');
  const [createdTenant, setCreatedTenant] = useState<TenantCompany | null>(null);
  const [lastPaymentRecord, setLastPaymentRecord] = useState<any>(null);

  const taxConfig = getLiveSuperOwnerTaxConfig();

  const [platformUpi, setPlatformUpi] = useState<string>(() => {
    try {
      const saved = localStorage.getItem('hrms_global_settings');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.realUpiId && parsed.realUpiId.trim()) return parsed.realUpiId.trim();
      }
    } catch {}
    return 'itlc@upi';
  });

  const getPlatformUpiId = (): string => {
    return platformUpi;
  };

  useEffect(() => {
    api.getGlobalSettings().then((gs: any) => {
      if (gs && gs.realUpiId && gs.realUpiId.trim()) {
        setPlatformUpi(gs.realUpiId.trim());
      }
    }).catch(() => {});
  }, []);

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

  const currentPlan = plans.find(p => p.id === selectedPlanId || (selectedPlanId === 'growth' && (p.id === 'starter' || p.id === 'growth'))) || plans.find(p => p.id === 'starter') || plans[0] || defaultSubscriptionPlans[0];
  const rawBasePrice = billingCycle === 'monthly' ? currentPlan.priceMonthly : currentPlan.priceAnnual;

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
  const gstRate = taxConfig.ratePercent || 18;
  const gstAmount = Math.round((basePriceAfterDiscount * gstRate) / 100);
  const grandTotal = basePriceAfterDiscount + gstAmount;

  // Handle Coupon Code
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

    if (cleanCode === 'WELCOME50' || cleanCode === 'SAVE50') {
      setAppliedCoupon({ code: cleanCode, discountPercent: 50 });
    } else if (cleanCode === 'SAVE20' || cleanCode === 'ANNUAL20') {
      setAppliedCoupon({ code: cleanCode, discountPercent: 20 });
    } else if (cleanCode === 'FLAT2000') {
      setAppliedCoupon({ code: 'FLAT2000', discountFlat: 2000 });
    } else {
      setCouponError('Invalid or expired coupon code.');
    }
  };

  // Step 1 Submission: Validate Company & Admin fields
  const handleStep1Submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!companyName.trim()) {
      alert('Please enter your Company / Organization Name.');
      return;
    }
    if (!adminName.trim()) {
      alert('Please enter Administrator Full Name.');
      return;
    }
    if (!adminEmail.trim()) {
      alert('Please enter Work Email Address.');
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(adminEmail.trim())) {
      alert('Please enter a valid work email address (e.g. admin@company.com).');
      return;
    }
    const phoneClean = adminPhone.replace(/\D/g, '');
    if (phoneClean.length < 10) {
      alert('Please enter a valid 10-digit mobile number.');
      return;
    }
    if (!password || password.length < 6) {
      alert('Please enter a secure password (at least 6 characters).');
      return;
    }
    if (password !== confirmPassword) {
      alert('Password and Confirm Password do not match.');
      return;
    }

    setStep(2);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Provision Workspace
  const provisionWorkspace = (paymentRef?: string, isTrial: boolean = false) => {
    setStep(3);
    window.scrollTo({ top: 0, behavior: 'smooth' });

    const isEnterprise = selectedPlanId === 'enterprise';
    const isGrowth = selectedPlanId === 'growth';

    const defaultFeatures: TenantFeatureFlags = {
      crmKanban: false,
      crmGstInvoicing: false,
      crmGpsFieldTracking: false,
      crmAiCopilot: false,
      crmWhatsAppBroadcast: false,
      crmReports: false,
      hrmsBiometricRadar: true,
      hrmsGeofenceAttendance: isGrowth || isEnterprise,
      hrmsPayrollPayslips: true,
      hrmsShiftLeaveManagement: true,
      hrmsAssetTraining: isEnterprise,
      apiWebhooks: isEnterprise,
      customDomain: isEnterprise,
      prioritySlaSupport: isGrowth || isEnterprise
    };

    const cleanDomain = companyName.toLowerCase().replace(/[^a-z0-9]/g, '') || 'workspace';
    const randomId = `TEN-${Math.floor(100 + Math.random() * 900)}`;

    const effectiveTotal = isTrial ? 0 : grandTotal;

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
      suites: ['hrms'],
      status: 'active',
      onboardDate: new Date().toISOString().split('T')[0],
      renewalDate: new Date(Date.now() + (isTrial ? 14 : billingCycle === 'annual' ? 365 : 30) * 86400000).toISOString().split('T')[0],
      billingCycle: isTrial ? 'monthly' : billingCycle,
      mrrAmount: currentPlan.priceMonthly,
      userSeatLimit: currentPlan.seatLimit,
      storageLimitGb: (currentPlan as any).storageLimitGb || (currentPlan as any).storageLimit || 50,
      activeUsersCount: Math.min(teamSize, currentPlan.seatLimit),
      features: defaultFeatures,
      notes: isTrial 
        ? 'Activated 14-Day Free Enterprise Trial' 
        : paymentRef 
        ? `Paid via Online Gateway (${paymentRef})` 
        : 'Subscribed via Checkout Portal.'
    };

    setCreatedTenant(newTenant);

    // Animate progress simulation
    let currentProgress = 15;
    setProvisioningProgress(currentProgress);
    setProvisioningStatusText('Creating isolated tenant schema & cloud database partition...');

    const interval = setInterval(() => {
      currentProgress += 25;
      if (currentProgress === 40) {
        setProvisioningStatusText('Configuring Biometric Radar, GPS Attendance & Shift policies...');
      } else if (currentProgress === 65) {
        setProvisioningStatusText('Generating Indian GST tax invoice & billing ledger...');
      } else if (currentProgress === 90) {
        setProvisioningStatusText('Creating Master Super Admin SSO credentials...');
      } else if (currentProgress >= 100) {
        clearInterval(interval);
        setProvisioningProgress(100);
        setProvisioningStatusText('✨ Workspace successfully deployed and ready!');

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
          storageLimitGb: (currentPlan as any).storageLimitGb || (currentPlan as any).storageLimit || 50,
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

          // 2.1 Save to hrms_companies_data
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
            maxEmployees: newTenant.userSeatLimit,
            seatLimit: newTenant.userSeatLimit,
            subscriptionPlanId: newTenant.planId,
            storageLimit: (currentPlan as any).storageLimitGb || (currentPlan as any).storageLimit || 50,
            storageLimitGb: (currentPlan as any).storageLimitGb || (currentPlan as any).storageLimit || 50,
            storageUsed: 0.85,
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
        } catch (e) {}

        // 3. Save payment record
        const payRecord = {
          id: paymentRef || (isTrial ? `trial_${Date.now()}` : `pay_${Date.now()}`),
          companyId: newTenant.id,
          companyName: newTenant.name,
          amount: effectiveTotal,
          gateway: isTrial ? 'free_trial' : selectedPaymentGateway,
          status: 'successful',
          timestamp: new Date().toISOString(),
          invoiceNumber: `INV-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`,
          currency: 'INR'
        };
        setLastPaymentRecord(payRecord);

        try {
          const savedPayments = localStorage.getItem('hrms_payments_data');
          const payList = savedPayments ? JSON.parse(savedPayments) : [];
          payList.unshift(payRecord);
          localStorage.setItem('hrms_payments_data', JSON.stringify(payList));

          fetch(`${API_URL}/superowner/payments`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              id: payRecord.id,
              invoiceNumber: payRecord.invoiceNumber,
              companyId: newTenant.id,
              companyName: newTenant.name,
              amount: payRecord.amount,
              currency: payRecord.currency || 'INR',
              gateway: payRecord.gateway,
              status: payRecord.status,
              date: new Date().toISOString().split('T')[0],
              planId: newTenant.planId,
              planName: currentPlan.name,
              transactionId: paymentRef || payRecord.id
            })
          }).catch(() => {});
        } catch (e) {}

        // 4. Save activity log
        try {
          const savedLogs = localStorage.getItem('hrms_activity_logs');
          const logList = savedLogs ? JSON.parse(savedLogs) : [];
          const newLog = {
            id: `log_${Date.now()}`,
            action: isTrial ? 'Company Started Free Trial' : 'Company Registered & Subscribed',
            details: `Company "${newTenant.name}" registered with ${currentPlan.name} plan (${(currentPlan as any).storageLimitGb || 50} GB, ${currentPlan.seatLimit || 50} seats).`,
            timestamp: new Date().toISOString(),
            category: 'subscription',
            actorName: newTenant.adminName
          };
          logList.unshift(newLog);
          localStorage.setItem('hrms_activity_logs', JSON.stringify(logList));
        } catch (e) {}

        // 5. Save user profile session for auto-login
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
              logo: '/itlc_logo.png',
              subscriptionPlanId: newTenant.planId,
              storageLimit: (currentPlan as any).storageLimitGb || (currentPlan as any).storageLimit || 50,
              storageLimitGb: (currentPlan as any).storageLimitGb || (currentPlan as any).storageLimit || 50,
              storageUsed: 0.85,
              maxEmployees: newTenant.userSeatLimit || 50,
              themeColor: '#4f46e5',
              modulesEnabled: {
                dashboard: true, attendance: true, leave: true, payroll: true,
                documents: true, assets: true, helpdesk: true, training: true, recruitment: true
              }
            }
          };
          localStorage.setItem('hrms_user_profile', JSON.stringify(mockProfile));
          localStorage.setItem('hrms_jwt_token', 'token_auth_' + Date.now());
          localStorage.setItem('crm_auth_session', 'true');
          sessionStorage.setItem('crm_auth_session', 'true');
        } catch (e) {}

        // 6. Backend Persistence Sync (${API_URL}/tenants)
        try {
          fetch(`${API_URL}/tenants`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              ...newTenant,
              password: credPass,
              adminPassword: credPass,
              customPassword: credPass,
              name: newTenant.name,
              companyName: newTenant.name,
              email: newTenant.adminEmail,
              adminEmail: newTenant.adminEmail,
              ownerName: newTenant.adminName,
              adminName: newTenant.adminName,
              phone: newTenant.adminPhone,
              adminPhone: newTenant.adminPhone,
              userSeatLimit: newTenant.userSeatLimit,
              maxEmployees: newTenant.userSeatLimit,
              seatLimit: newTenant.userSeatLimit,
              staffCapacity: newTenant.userSeatLimit,
              employeesCount: newTenant.userSeatLimit,
              storageLimit: newTenant.storageLimitGb,
              storageLimitGb: newTenant.storageLimitGb,
              subscriptionPlanId: newTenant.planId,
              plan: newTenant.planId
            })
          }).catch(() => {});
        } catch {}

        if (typeof window !== 'undefined') {
          window.dispatchEvent(new CustomEvent('companies_updated'));
          window.dispatchEvent(new CustomEvent('company_created', { detail: newTenant }));
          window.dispatchEvent(new CustomEvent('company_updated'));
          window.dispatchEvent(new CustomEvent('subscription_updated'));
          window.dispatchEvent(new CustomEvent('profile_updated'));
          window.dispatchEvent(new CustomEvent('superowner_data_updated'));
          window.dispatchEvent(new CustomEvent('subscription_plans_updated'));
          window.dispatchEvent(new CustomEvent('multi_tenant_updated'));
          window.dispatchEvent(new Event('storage'));
        }
      }
      setProvisioningProgress(Math.min(currentProgress, 100));
    }, 400);
  };

  const handleExecutePayment = async () => {
    if (selectedPaymentGateway === 'trial') {
      provisionWorkspace(undefined, true);
      return;
    }

    // Razorpay Exclusive Payment Flow
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
            provisionWorkspace(result.paymentId);
          } else {
            alert('Payment was not completed. Workspace can only be provisioned after verified payment.');
          }
        },
        () => {
          setIsProcessingPayment(false);
        }
      );
    } catch (err: any) {
      console.warn('Razorpay checkout error:', err);
      setIsProcessingPayment(false);
      alert('Payment could not be completed. Please retry checkout.');
    }
  };

  const handleDownloadInvoice = () => {
    if (lastPaymentRecord && createdTenant) {
      downloadPaymentSlip(lastPaymentRecord, createdTenant);
    } else {
      const mockPay = {
        invoiceNumber: `INV-${new Date().getFullYear()}-0912`,
        amount: grandTotal,
        currency: 'INR',
        gateway: selectedPaymentGateway,
        timestamp: new Date().toISOString()
      };
      downloadPaymentSlip(mockPay, {
        name: companyName || 'OmniStaff Client',
        adminName: adminName || 'Administrator',
        adminEmail: adminEmail || 'admin@workspace.com',
        gstin: gstin || 'Unregistered'
      });
    }
  };

  return (
    <div 
      style={{ 
        minHeight: '100vh', 
        background: 'radial-gradient(ellipse at 50% 0%, #0d1b38 0%, #080d1a 50%, #030712 100%)', 
        color: '#f8fafc', 
        fontFamily: 'system-ui, -apple-system, sans-serif',
        position: 'relative',
        overflowX: 'hidden',
        paddingBottom: '80px'
      }}
    >
      {/* Background Ambient Cyber Glows */}
      <div 
        style={{
          position: 'absolute',
          top: '10%',
          left: '20%',
          width: '550px',
          height: '550px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(56, 189, 248, 0.12) 0%, rgba(2, 132, 199, 0) 70%)',
          filter: 'blur(90px)',
          pointerEvents: 'none'
        }}
      />
      <div 
        style={{
          position: 'absolute',
          top: '30%',
          right: '15%',
          width: '600px',
          height: '600px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(99, 102, 241, 0.12) 0%, rgba(168, 85, 247, 0) 70%)',
          filter: 'blur(100px)',
          pointerEvents: 'none'
        }}
      />

      {/* Top Header Navigation */}
      <header 
        style={{
          maxWidth: '1280px',
          margin: '0 auto',
          padding: '20px 24px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          position: 'relative',
          zIndex: 30
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <button 
            onClick={onBackToHome}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '8px 16px',
              borderRadius: '12px',
              background: 'rgba(255, 255, 255, 0.08)',
              backdropFilter: 'blur(12px)',
              border: '1px solid rgba(255, 255, 255, 0.15)',
              color: '#cbd5e1',
              fontSize: '13px',
              fontWeight: 700,
              cursor: 'pointer',
              transition: 'all 0.15s ease'
            }}
            onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.14)'; e.currentTarget.style.color = '#ffffff'; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.08)'; e.currentTarget.style.color = '#cbd5e1'; }}
          >
            <ArrowLeft size={16} />
            <span>Back to Plans</span>
          </button>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div 
              style={{ 
                width: '38px', 
                height: '38px', 
                borderRadius: '12px', 
                background: 'linear-gradient(135deg, #38bdf8, #6366f1)', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                boxShadow: '0 0 20px rgba(56, 189, 248, 0.4)'
              }}
            >
              <Zap size={20} color="#ffffff" />
            </div>
            <div>
              <div style={{ fontSize: '18px', fontWeight: 900, color: '#ffffff', letterSpacing: '-0.3px', lineHeight: 1.1 }}>
                OmniStaff HRMS
              </div>
              <div style={{ fontSize: '11px', color: '#94a3b8', fontWeight: 600 }}>
                Enterprise Checkout & Onboarding
              </div>
            </div>
          </div>
        </div>

        {/* Security Trust Badges */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <span 
            style={{ 
              display: 'inline-flex', 
              alignItems: 'center', 
              gap: '6px', 
              fontSize: '12px', 
              fontWeight: 700, 
              color: '#38bdf8', 
              background: 'rgba(56, 189, 248, 0.1)', 
              padding: '6px 14px', 
              borderRadius: '999px', 
              border: '1px solid rgba(56, 189, 248, 0.25)' 
            }}
          >
            <ShieldCheck size={15} />
            256-Bit SSL Encrypted
          </span>
          <span 
            style={{ 
              display: 'inline-flex', 
              alignItems: 'center', 
              gap: '6px', 
              fontSize: '12px', 
              fontWeight: 700, 
              color: '#10b981', 
              background: 'rgba(16, 185, 129, 0.1)', 
              padding: '6px 14px', 
              borderRadius: '999px', 
              border: '1px solid rgba(16, 185, 129, 0.25)' 
            }}
          >
            <Zap size={14} />
            Instant Activation
          </span>
        </div>
      </header>

      {/* Main Container */}
      <div style={{ maxWidth: '1180px', margin: '20px auto 0', padding: '0 20px', position: 'relative', zIndex: 10 }}>
        
        {/* Step Stepper Header (Clean 2-Step Modern Look) */}
        {step !== 3 && (
          <div 
            style={{ 
              background: 'rgba(255, 255, 255, 0.04)', 
              backdropFilter: 'blur(20px)',
              borderRadius: '20px', 
              border: '1px solid rgba(255, 255, 255, 0.1)', 
              padding: '16px 28px', 
              marginBottom: '28px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              boxShadow: '0 10px 30px rgba(0,0,0,0.3)'
            }}
          >
            {/* Step 1 Pill */}
            <div 
              onClick={() => setStep(1)}
              style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '12px', 
                cursor: 'pointer',
                opacity: step === 1 ? 1 : 0.7
              }}
            >
              <div 
                style={{ 
                  width: '32px', 
                  height: '32px', 
                  borderRadius: '10px', 
                  background: step >= 1 ? 'linear-gradient(135deg, #38bdf8, #2563eb)' : 'rgba(255,255,255,0.1)', 
                  color: '#ffffff', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center', 
                  fontWeight: 800, 
                  fontSize: '13px',
                  boxShadow: step === 1 ? '0 0 15px rgba(56, 189, 248, 0.4)' : 'none'
                }}
              >
                {step > 1 ? <Check size={16} /> : '1'}
              </div>
              <div>
                <div style={{ fontSize: '13px', fontWeight: 800, color: step === 1 ? '#ffffff' : '#94a3b8' }}>
                  1. Organization & Admin
                </div>
                <div style={{ fontSize: '11px', color: '#64748b' }}>
                  Company details & secure credentials
                </div>
              </div>
            </div>

            <div style={{ flex: 1, height: '2px', background: step >= 2 ? '#38bdf8' : 'rgba(255, 255, 255, 0.1)', margin: '0 24px', transition: 'background 0.3s' }} />

            {/* Step 2 Pill */}
            <div 
              style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '12px',
                opacity: step === 2 ? 1 : 0.7
              }}
            >
              <div 
                style={{ 
                  width: '32px', 
                  height: '32px', 
                  borderRadius: '10px', 
                  background: step >= 2 ? 'linear-gradient(135deg, #10b981, #059669)' : 'rgba(255,255,255,0.1)', 
                  color: '#ffffff', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center', 
                  fontWeight: 800, 
                  fontSize: '13px',
                  boxShadow: step === 2 ? '0 0 15px rgba(16, 185, 129, 0.4)' : 'none'
                }}
              >
                {step > 2 ? <Check size={16} /> : '2'}
              </div>
              <div>
                <div style={{ fontSize: '13px', fontWeight: 800, color: step === 2 ? '#ffffff' : '#94a3b8' }}>
                  2. Review & Instant Payment
                </div>
                <div style={{ fontSize: '11px', color: '#64748b' }}>
                  GST invoice, UPI QR & Launch
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ACTIVE PLAN HIGHLIGHT CARD & QUICK SWITCHER */}
        {step !== 3 && (
          <div 
            style={{
              background: 'linear-gradient(135deg, rgba(14, 30, 62, 0.85) 0%, rgba(8, 20, 44, 0.9) 100%)',
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(56, 189, 248, 0.3)',
              borderRadius: '20px',
              padding: '20px 26px',
              marginBottom: '28px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '16px',
              boxShadow: '0 10px 35px rgba(0, 0, 0, 0.4)'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <div 
                style={{ 
                  width: '50px', 
                  height: '50px', 
                  borderRadius: '14px', 
                  background: 'linear-gradient(135deg, #38bdf8, #2563eb)', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  boxShadow: '0 0 20px rgba(56, 189, 248, 0.4)',
                  flexShrink: 0
                }}
              >
                <Sparkles size={24} color="#ffffff" />
              </div>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span style={{ fontSize: '18px', fontWeight: 900, color: '#ffffff' }}>
                    {currentPlan.name}
                  </span>
                  <span style={{ fontSize: '11px', fontWeight: 800, background: 'rgba(56, 189, 248, 0.15)', color: '#38bdf8', padding: '3px 10px', borderRadius: '999px', border: '1px solid rgba(56, 189, 248, 0.3)' }}>
                    SELECTED PLAN
                  </span>
                </div>
                <div style={{ fontSize: '13px', color: '#94a3b8', marginTop: '4px', display: 'flex', alignItems: 'center', gap: '14px', flexWrap: 'wrap' }}>
                  <span>👥 Up to {currentPlan.seatLimit} Staff Seats</span>
                  <span>•</span>
                  <span>☁️ {currentPlan.storageLimitGb || (currentPlan.seatLimit * 2)} GB Cloud Storage</span>
                  <span>•</span>
                  <span>⚡ Real-Time Biometric Radar & GPS</span>
                  <span>•</span>
                  <span>📑 Automated GST Invoices</span>
                </div>
              </div>
            </div>

            {/* Price & Plan Switcher Controls */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flexWrap: 'wrap' }}>
              {/* Monthly vs Annual Toggle */}
              <div style={{ background: 'rgba(255, 255, 255, 0.08)', padding: '4px', borderRadius: '12px', display: 'flex', alignItems: 'center', border: '1px solid rgba(255, 255, 255, 0.1)' }}>
                <button
                  type="button"
                  onClick={() => setBillingCycle('monthly')}
                  style={{
                    padding: '6px 14px',
                    borderRadius: '8px',
                    border: 'none',
                    fontWeight: 700,
                    fontSize: '12px',
                    cursor: 'pointer',
                    background: billingCycle === 'monthly' ? '#38bdf8' : 'transparent',
                    color: billingCycle === 'monthly' ? '#0f172a' : '#94a3b8',
                    transition: 'all 0.15s ease'
                  }}
                >
                  Monthly
                </button>
                <button
                  type="button"
                  onClick={() => setBillingCycle('annual')}
                  style={{
                    padding: '6px 14px',
                    borderRadius: '8px',
                    border: 'none',
                    fontWeight: 700,
                    fontSize: '12px',
                    cursor: 'pointer',
                    background: billingCycle === 'annual' ? '#38bdf8' : 'transparent',
                    color: billingCycle === 'annual' ? '#0f172a' : '#94a3b8',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    transition: 'all 0.15s ease'
                  }}
                >
                  <span>Annual</span>
                  <span style={{ fontSize: '9px', fontWeight: 900, background: '#10b981', color: '#ffffff', padding: '1px 5px', borderRadius: '6px' }}>
                    SAVE 20%
                  </span>
                </button>
              </div>

              {/* Price Display */}
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '22px', fontWeight: 900, color: '#38bdf8', lineHeight: 1 }}>
                  ₹{rawBasePrice.toLocaleString()}
                </div>
                <div style={{ fontSize: '11px', color: '#64748b', marginTop: '2px' }}>
                  /{billingCycle === 'annual' ? 'year' : 'month'}
                </div>
              </div>

              {/* Change Plan Button */}
              <button
                type="button"
                onClick={() => setShowPlanSwitcher(!showPlanSwitcher)}
                style={{
                  padding: '8px 14px',
                  borderRadius: '10px',
                  background: 'rgba(255, 255, 255, 0.08)',
                  border: '1px solid rgba(255, 255, 255, 0.15)',
                  color: '#ffffff',
                  fontSize: '12px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  transition: 'all 0.15s'
                }}
                onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.15)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.08)'; }}
              >
                <span>Change Plan</span>
                <ChevronDown size={14} />
              </button>
            </div>
          </div>
        )}

        {/* PLAN SWITCHER QUICK MODAL / DROPDOWN */}
        {showPlanSwitcher && (
          <div 
            style={{
              background: 'rgba(15, 23, 42, 0.95)',
              backdropFilter: 'blur(24px)',
              border: '1px solid rgba(56, 189, 248, 0.3)',
              borderRadius: '20px',
              padding: '24px',
              marginBottom: '28px',
              boxShadow: '0 20px 50px rgba(0,0,0,0.6)'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
              <strong style={{ fontSize: '16px', color: '#ffffff' }}>Choose Your Desired Subscription Tier:</strong>
              <button 
                type="button" 
                onClick={() => setShowPlanSwitcher(false)}
                style={{ background: 'transparent', border: 'none', color: '#94a3b8', cursor: 'pointer' }}
              >
                <X size={18} />
              </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '16px' }}>
              {plans.filter(p => p.showOnLandingPage !== false).map(p => {
                const isSelected = selectedPlanId === p.id;
                const price = billingCycle === 'annual' ? p.priceAnnual : p.priceMonthly;
                return (
                  <div
                    key={p.id}
                    onClick={() => {
                      setSelectedPlanId(p.id);
                      setShowPlanSwitcher(false);
                    }}
                    style={{
                      padding: '18px',
                      borderRadius: '16px',
                      border: `2px solid ${isSelected ? '#38bdf8' : 'rgba(255,255,255,0.1)'}`,
                      background: isSelected ? 'rgba(56, 189, 248, 0.12)' : 'rgba(255, 255, 255, 0.04)',
                      cursor: 'pointer',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                      <span style={{ fontSize: '15px', fontWeight: 800, color: '#ffffff' }}>{p.name}</span>
                      {isSelected && <CheckCircle2 size={18} color="#38bdf8" />}
                    </div>
                    <div style={{ fontSize: '20px', fontWeight: 900, color: '#38bdf8', marginBottom: '6px' }}>
                      ₹{price.toLocaleString()} <span style={{ fontSize: '12px', color: '#94a3b8' }}>/{billingCycle === 'annual' ? 'yr' : 'mo'}</span>
                    </div>
                    <div style={{ fontSize: '12px', color: '#94a3b8' }}>
                      👥 Up to {p.seatLimit} Seats • ☁️ {p.storageLimitGb || p.seatLimit * 2} GB
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* STEP 1: ORGANIZATION & ADMINISTRATOR SETUP */}
        {step === 1 && (
          <form 
            onSubmit={handleStep1Submit}
            style={{
              background: 'rgba(255, 255, 255, 0.04)',
              backdropFilter: 'blur(24px)',
              borderRadius: '24px',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              padding: '36px',
              boxShadow: '0 20px 50px rgba(0, 0, 0, 0.4)'
            }}
          >
            <div style={{ marginBottom: '28px' }}>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: '#38bdf8', fontSize: '12px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: '6px' }}>
                <Building2 size={14} />
                <span>Organization & Security Setup</span>
              </div>
              <h2 style={{ fontSize: '26px', fontWeight: 900, color: '#ffffff', margin: '0 0 6px', letterSpacing: '-0.5px' }}>
                Set Up Your Company Workspace
              </h2>
              <p style={{ fontSize: '14px', color: '#94a3b8', margin: 0 }}>
                Enter your company profile and master administrator credentials to initiate your private cloud partition.
              </p>
            </div>

            {/* Grid of Inputs */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '22px', marginBottom: '28px' }}>
              
              {/* Company Legal Name */}
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#cbd5e1', marginBottom: '8px' }}>
                  Company / Organization Legal Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Apex Global Technologies Pvt Ltd"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '13px 16px',
                    borderRadius: '12px',
                    border: '1px solid rgba(255, 255, 255, 0.15)',
                    background: 'rgba(15, 23, 42, 0.7)',
                    color: '#ffffff',
                    fontSize: '14px',
                    outline: 'none',
                    boxSizing: 'border-box'
                  }}
                />
              </div>

              {/* Administrator Full Name */}
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#cbd5e1', marginBottom: '8px' }}>
                  Master Administrator Full Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Priya Sharma / Rajesh Verma"
                  value={adminName}
                  onChange={(e) => setAdminName(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '13px 16px',
                    borderRadius: '12px',
                    border: '1px solid rgba(255, 255, 255, 0.15)',
                    background: 'rgba(15, 23, 42, 0.7)',
                    color: '#ffffff',
                    fontSize: '14px',
                    outline: 'none',
                    boxSizing: 'border-box'
                  }}
                />
              </div>

              {/* Work Email Address */}
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#cbd5e1', marginBottom: '8px' }}>
                  Official Work Email (Master Login ID) *
                </label>
                <input
                  type="email"
                  required
                  placeholder="e.g. admin@yourcompany.com"
                  value={adminEmail}
                  onChange={(e) => setAdminEmail(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '13px 16px',
                    borderRadius: '12px',
                    border: '1px solid rgba(255, 255, 255, 0.15)',
                    background: 'rgba(15, 23, 42, 0.7)',
                    color: '#ffffff',
                    fontSize: '14px',
                    outline: 'none',
                    boxSizing: 'border-box'
                  }}
                />
              </div>

              {/* Contact Mobile Number */}
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#cbd5e1', marginBottom: '8px' }}>
                  Mobile / Phone Number (WhatsApp Alerts) *
                </label>
                <input
                  type="tel"
                  required
                  placeholder="e.g. +91 98765 43210"
                  value={adminPhone}
                  onChange={(e) => setAdminPhone(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '13px 16px',
                    borderRadius: '12px',
                    border: '1px solid rgba(255, 255, 255, 0.15)',
                    background: 'rgba(15, 23, 42, 0.7)',
                    color: '#ffffff',
                    fontSize: '14px',
                    outline: 'none',
                    boxSizing: 'border-box'
                  }}
                />
              </div>

              {/* Master Password */}
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#cbd5e1', marginBottom: '8px' }}>
                  Master Account Password *
                </label>
                <div style={{ position: 'relative' }}>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    placeholder="••••••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '13px 44px 13px 16px',
                      borderRadius: '12px',
                      border: '1px solid rgba(255, 255, 255, 0.15)',
                      background: 'rgba(15, 23, 42, 0.7)',
                      color: '#ffffff',
                      fontSize: '14px',
                      outline: 'none',
                      boxSizing: 'border-box'
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    style={{
                      position: 'absolute',
                      right: '14px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      background: 'transparent',
                      border: 'none',
                      color: '#94a3b8',
                      cursor: 'pointer'
                    }}
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              {/* Confirm Password */}
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#cbd5e1', marginBottom: '8px' }}>
                  Confirm Master Password *
                </label>
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder="••••••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '13px 16px',
                    borderRadius: '12px',
                    border: '1px solid rgba(255, 255, 255, 0.15)',
                    background: 'rgba(15, 23, 42, 0.7)',
                    color: '#ffffff',
                    fontSize: '14px',
                    outline: 'none',
                    boxSizing: 'border-box'
                  }}
                />
              </div>

              {/* Industry Sector */}
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#cbd5e1', marginBottom: '8px' }}>
                  Industry Sector
                </label>
                <select
                  value={industry}
                  onChange={(e) => setIndustry(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '13px 16px',
                    borderRadius: '12px',
                    border: '1px solid rgba(255, 255, 255, 0.15)',
                    background: 'rgba(15, 23, 42, 0.7)',
                    color: '#ffffff',
                    fontSize: '14px',
                    outline: 'none',
                    boxSizing: 'border-box'
                  }}
                >
                  <option value="IT & Software Services" style={{ background: '#0f172a', color: '#fff' }}>IT & Software Services</option>
                  <option value="Financial & Banking Services" style={{ background: '#0f172a', color: '#fff' }}>Financial & Banking Services</option>
                  <option value="Manufacturing & Industrial" style={{ background: '#0f172a', color: '#fff' }}>Manufacturing & Industrial</option>
                  <option value="Healthcare & Pharmaceuticals" style={{ background: '#0f172a', color: '#fff' }}>Healthcare & Pharmaceuticals</option>
                  <option value="Retail & E-commerce" style={{ background: '#0f172a', color: '#fff' }}>Retail & E-commerce</option>
                  <option value="Real Estate & Construction" style={{ background: '#0f172a', color: '#fff' }}>Real Estate & Construction</option>
                  <option value="Logistics & Supply Chain" style={{ background: '#0f172a', color: '#fff' }}>Logistics & Supply Chain</option>
                  <option value="Education & EdTech" style={{ background: '#0f172a', color: '#fff' }}>Education & EdTech</option>
                </select>
              </div>

              {/* Total Expected Team Size */}
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#cbd5e1', marginBottom: '8px' }}>
                  Total Expected Team Size
                </label>
                <input
                  type="number"
                  min={1}
                  max={50000}
                  value={teamSize}
                  onChange={(e) => setTeamSize(Number(e.target.value))}
                  style={{
                    width: '100%',
                    padding: '13px 16px',
                    borderRadius: '12px',
                    border: '1px solid rgba(255, 255, 255, 0.15)',
                    background: 'rgba(15, 23, 42, 0.7)',
                    color: '#ffffff',
                    fontSize: '14px',
                    outline: 'none',
                    boxSizing: 'border-box'
                  }}
                />
              </div>

              {/* City / HQ */}
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#cbd5e1', marginBottom: '8px' }}>
                  Headquarters City
                </label>
                <input
                  type="text"
                  placeholder="e.g. Lucknow / Bengaluru / Mumbai / Delhi"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '13px 16px',
                    borderRadius: '12px',
                    border: '1px solid rgba(255, 255, 255, 0.15)',
                    background: 'rgba(15, 23, 42, 0.7)',
                    color: '#ffffff',
                    fontSize: '14px',
                    outline: 'none',
                    boxSizing: 'border-box'
                  }}
                />
              </div>

              {/* State */}
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#cbd5e1', marginBottom: '8px' }}>
                  State
                </label>
                <input
                  type="text"
                  placeholder="e.g. Uttar Pradesh, Karnataka, Maharashtra"
                  value={stateName}
                  onChange={(e) => setStateName(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '13px 16px',
                    borderRadius: '12px',
                    border: '1px solid rgba(255, 255, 255, 0.15)',
                    background: 'rgba(15, 23, 42, 0.7)',
                    color: '#ffffff',
                    fontSize: '14px',
                    outline: 'none',
                    boxSizing: 'border-box'
                  }}
                />
              </div>

              {/* GSTIN (Optional) */}
              <div style={{ gridColumn: 'span 2' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <label style={{ fontSize: '13px', fontWeight: 700, color: '#cbd5e1' }}>
                    GSTIN Number (Optional for Tax Credit)
                  </label>
                  <span style={{ fontSize: '11px', color: '#10b981', fontWeight: 700, background: 'rgba(16, 185, 129, 0.1)', padding: '2px 8px', borderRadius: '6px', border: '1px solid rgba(16, 185, 129, 0.25)' }}>
                    ✓ 18% Input Tax Credit (ITC) Available
                  </span>
                </div>
                <input
                  type="text"
                  placeholder="e.g. 09AAACH7409R1ZZ"
                  value={gstin}
                  onChange={(e) => setGstin(e.target.value.toUpperCase())}
                  style={{
                    width: '100%',
                    padding: '13px 16px',
                    borderRadius: '12px',
                    border: '1px solid rgba(255, 255, 255, 0.15)',
                    background: 'rgba(15, 23, 42, 0.7)',
                    color: '#ffffff',
                    fontSize: '14px',
                    outline: 'none',
                    boxSizing: 'border-box',
                    fontFamily: 'monospace'
                  }}
                />
              </div>

            </div>

            {/* Live Workspace Domain Preview Box */}
            <div 
              style={{ 
                background: 'rgba(56, 189, 248, 0.08)', 
                borderRadius: '16px', 
                padding: '16px 20px', 
                border: '1px solid rgba(56, 189, 248, 0.25)', 
                display: 'flex', 
                alignItems: 'center', 
                gap: '14px',
                marginBottom: '32px'
              }}
            >
              <Globe size={26} color="#38bdf8" />
              <div>
                <span style={{ fontSize: '12px', color: '#94a3b8', display: 'block', fontWeight: 600 }}>
                  Dedicated Tenant URL (Auto-Generated):
                </span>
                <strong style={{ fontSize: '15px', color: '#38bdf8', fontFamily: 'monospace' }}>
                  https://{companyName ? companyName.toLowerCase().replace(/[^a-z0-9]/g, '') : 'yourcompany'}.itlc.cloud
                </strong>
              </div>
            </div>

            {/* Action Buttons */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid rgba(255, 255, 255, 0.1)', paddingTop: '24px' }}>
              <button
                type="button"
                onClick={onBackToHome}
                style={{
                  padding: '13px 22px',
                  borderRadius: '12px',
                  background: 'rgba(255, 255, 255, 0.08)',
                  border: '1px solid rgba(255, 255, 255, 0.15)',
                  color: '#cbd5e1',
                  fontWeight: 700,
                  fontSize: '14px',
                  cursor: 'pointer'
                }}
              >
                Cancel
              </button>

              <button
                type="submit"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '10px',
                  padding: '14px 34px',
                  borderRadius: '12px',
                  border: 'none',
                  background: 'linear-gradient(135deg, #38bdf8 0%, #2563eb 100%)',
                  color: '#ffffff',
                  fontWeight: 900,
                  fontSize: '15px',
                  cursor: 'pointer',
                  boxShadow: '0 8px 25px rgba(56, 189, 248, 0.4)',
                  transition: 'all 0.15s ease'
                }}
                onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-1px)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; }}
              >
                <span>Continue to Order & Payment</span>
                <ArrowRight size={18} />
              </button>
            </div>
          </form>
        )}

        {/* STEP 2: REVIEW & INSTANT PAYMENT */}
        {step === 2 && (
          <div 
            style={{
              background: 'rgba(255, 255, 255, 0.04)',
              backdropFilter: 'blur(24px)',
              borderRadius: '24px',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              padding: '36px',
              boxShadow: '0 20px 50px rgba(0, 0, 0, 0.4)'
            }}
          >
            <div style={{ marginBottom: '28px' }}>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: '#10b981', fontSize: '12px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: '6px' }}>
                <CreditCard size={14} />
                <span>Step 2 of 2: Instant Payment & Activation</span>
              </div>
              <h2 style={{ fontSize: '26px', fontWeight: 900, color: '#ffffff', margin: '0 0 6px', letterSpacing: '-0.5px' }}>
                Review Tax Invoice & Complete Payment
              </h2>
              <p style={{ fontSize: '14px', color: '#94a3b8', margin: 0 }}>
                Choose your preferred payment gateway. Workspace provisioning activates instantly upon confirmation.
              </p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '32px', marginBottom: '32px' }}>
              
              {/* Left Column: Payment Methods */}
              <div>
                <h3 style={{ fontSize: '16px', fontWeight: 800, color: '#ffffff', margin: '0 0 16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span>💳 Select Payment Method</span>
                </h3>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginBottom: '24px' }}>
                  
                  {/* Option 1: Razorpay Online Checkout (EXCLUSIVE ACTIVE GATEWAY) */}
                  <div 
                    onClick={() => setSelectedPaymentGateway('razorpay')}
                    style={{
                      padding: '20px 22px',
                      borderRadius: '16px',
                      border: `2px solid ${selectedPaymentGateway === 'razorpay' ? '#38bdf8' : 'rgba(255, 255, 255, 0.1)'}`,
                      background: selectedPaymentGateway === 'razorpay' ? 'rgba(56, 189, 248, 0.15)' : 'rgba(255, 255, 255, 0.03)',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      transition: 'all 0.15s ease',
                      boxShadow: selectedPaymentGateway === 'razorpay' ? '0 0 25px rgba(56, 189, 248, 0.25)' : 'none'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                      <div style={{ width: '48px', height: '48px', borderRadius: '14px', background: 'rgba(56, 189, 248, 0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#38bdf8' }}>
                        <Zap size={26} />
                      </div>
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                          <strong style={{ fontSize: '16px', color: '#ffffff' }}>Razorpay Official Gateway</strong>
                          <span style={{ fontSize: '10px', fontWeight: 800, background: '#10b981', color: '#ffffff', padding: '2px 8px', borderRadius: '6px' }}>
                            ⚡ ACTIVE GATEWAY
                          </span>
                        </div>
                        <span style={{ fontSize: '12px', color: '#94a3b8' }}>
                          UPI (GPay / PhonePe / Paytm), Debit/Credit Cards, NetBanking, Corporate Wallets
                        </span>
                      </div>
                    </div>
                    {selectedPaymentGateway === 'razorpay' && <CheckCircle2 size={24} color="#38bdf8" />}
                  </div>

                  {/* Option 2: 14-Day Free Enterprise Trial (Always Available for All Plans) */}
                  <div 
                    onClick={() => setSelectedPaymentGateway('trial')}
                    style={{
                      padding: '18px 20px',
                      borderRadius: '16px',
                      border: `2px solid ${selectedPaymentGateway === 'trial' ? '#10b981' : 'rgba(255, 255, 255, 0.1)'}`,
                      background: selectedPaymentGateway === 'trial' ? 'rgba(16, 185, 129, 0.12)' : 'rgba(255, 255, 255, 0.03)',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                      <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: 'rgba(16, 185, 129, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#10b981' }}>
                        <Sparkles size={24} />
                      </div>
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <strong style={{ fontSize: '15px', color: '#ffffff' }}>14-Day Free Enterprise Trial</strong>
                          <span style={{ fontSize: '10px', fontWeight: 800, background: 'rgba(16, 185, 129, 0.2)', color: '#10b981', padding: '2px 8px', borderRadius: '6px' }}>
                            NO CARD NEEDED
                          </span>
                        </div>
                        <span style={{ fontSize: '12px', color: '#94a3b8' }}>Full unlimited access for 14 days • Instant workspace activation</span>
                      </div>
                    </div>
                    {selectedPaymentGateway === 'trial' && <CheckCircle2 size={22} color="#10b981" />}
                  </div>

                </div>

                {/* Primary Action Button */}
                <button
                  type="button"
                  disabled={isProcessingPayment}
                  onClick={handleExecutePayment}
                  style={{
                    width: '100%',
                    padding: '18px',
                    borderRadius: '14px',
                    border: 'none',
                    background: selectedPaymentGateway === 'trial' 
                      ? 'linear-gradient(135deg, #10b981 0%, #059669 100%)'
                      : 'linear-gradient(135deg, #38bdf8 0%, #2563eb 100%)',
                    color: '#ffffff',
                    fontWeight: 900,
                    fontSize: '16px',
                    cursor: isProcessingPayment ? 'not-allowed' : 'pointer',
                    boxShadow: selectedPaymentGateway === 'trial'
                      ? '0 10px 30px rgba(16, 185, 129, 0.4)'
                      : '0 10px 30px rgba(56, 189, 248, 0.4)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '10px',
                    transition: 'all 0.15s ease'
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-2px)'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; }}
                >
                  <Lock size={18} />
                  {isProcessingPayment ? (
                    <span>Opening Razorpay Secure Gateway...</span>
                  ) : selectedPaymentGateway === 'trial' ? (
                    <span>🚀 Launch 14-Day Free Enterprise Trial</span>
                  ) : (
                    <span>🔒 Pay ₹{grandTotal.toLocaleString()} via Razorpay Secure</span>
                  )}
                </button>
              </div>

              {/* Right Column: Order Summary & Tax Invoice Breakdown */}
              <div 
                style={{ 
                  background: 'rgba(15, 23, 42, 0.8)', 
                  borderRadius: '20px', 
                  border: '1px solid rgba(255, 255, 255, 0.12)', 
                  padding: '28px',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  boxShadow: '0 15px 40px rgba(0,0,0,0.5)'
                }}
              >
                <div>
                  <h3 style={{ fontSize: '17px', fontWeight: 800, color: '#ffffff', margin: '0 0 16px', borderBottom: '1px solid rgba(255, 255, 255, 0.1)', paddingBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <FileText size={18} color="#38bdf8" />
                    <span>Official Tax Invoice Breakdown</span>
                  </h3>

                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', marginBottom: '10px', color: '#94a3b8' }}>
                    <span>Company Legal Name:</span>
                    <strong style={{ color: '#ffffff' }}>{companyName || 'Your Workspace'}</strong>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', marginBottom: '10px', color: '#94a3b8' }}>
                    <span>Master Admin:</span>
                    <strong style={{ color: '#ffffff' }}>{adminName} ({adminEmail})</strong>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', marginBottom: '10px', color: '#94a3b8' }}>
                    <span>Selected Plan:</span>
                    <strong style={{ color: '#38bdf8' }}>{currentPlan.name} ({billingCycle.toUpperCase()})</strong>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', marginBottom: '10px', color: '#94a3b8' }}>
                    <span>Base Subscription Fee:</span>
                    <span style={{ color: '#ffffff', fontWeight: 600 }}>₹{rawBasePrice.toLocaleString()}</span>
                  </div>

                  {discountAmount > 0 && (
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', marginBottom: '10px', color: '#10b981', fontWeight: 700 }}>
                      <span>Promo Coupon ({appliedCoupon?.code}):</span>
                      <span>-₹{discountAmount.toLocaleString()}</span>
                    </div>
                  )}

                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', marginBottom: '10px', color: '#94a3b8' }}>
                    <span>Indian GST ({gstRate}% SAC 998313):</span>
                    <span style={{ color: '#ffffff', fontWeight: 600 }}>₹{gstAmount.toLocaleString()}</span>
                  </div>

                  <div style={{ fontSize: '11px', color: '#64748b', marginBottom: '16px' }}>
                    CGST ({(gstRate / 2).toFixed(1)}%) + SGST ({(gstRate / 2).toFixed(1)}%) • Platform GSTIN: {taxConfig.gstin || '07AABCI8899K1Z4'}
                  </div>

                  {/* Grand Total Row */}
                  <div 
                    style={{ 
                      borderTop: '2px dashed rgba(255, 255, 255, 0.15)', 
                      paddingTop: '16px', 
                      marginTop: '16px', 
                      display: 'flex', 
                      justifyContent: 'space-between', 
                      alignItems: 'baseline' 
                    }}
                  >
                    <div>
                      <strong style={{ fontSize: '16px', color: '#ffffff' }}>Grand Total (INR):</strong>
                      <div style={{ fontSize: '11px', color: '#94a3b8' }}>
                        {selectedPaymentGateway === 'trial' ? '14 Days Free, then billed' : 'All taxes & platform fees included'}
                      </div>
                    </div>
                    <strong style={{ fontSize: '28px', color: '#38bdf8', fontWeight: 900 }}>
                      {selectedPaymentGateway === 'trial' ? '₹0' : `₹${grandTotal.toLocaleString()}`}
                    </strong>
                  </div>

                  {/* Promo Code Input Box */}
                  <div style={{ marginTop: '22px', paddingTop: '16px', borderTop: '1px solid rgba(255, 255, 255, 0.1)' }}>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#cbd5e1', marginBottom: '8px' }}>
                      <Tag size={13} style={{ display: 'inline', marginRight: '6px' }} />
                      Have a Coupon / Promo Code?
                    </label>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <input
                        type="text"
                        placeholder="e.g. WELCOME50, SAVE20"
                        value={couponCode}
                        onChange={(e) => setCouponCode(e.target.value)}
                        style={{
                          flex: 1,
                          padding: '10px 14px',
                          borderRadius: '10px',
                          border: '1px solid rgba(255, 255, 255, 0.15)',
                          background: 'rgba(255, 255, 255, 0.05)',
                          color: '#ffffff',
                          fontSize: '13px',
                          textTransform: 'uppercase'
                        }}
                      />
                      <button
                        type="button"
                        onClick={handleApplyCoupon}
                        style={{
                          padding: '10px 18px',
                          borderRadius: '10px',
                          border: 'none',
                          background: '#38bdf8',
                          color: '#0f172a',
                          fontWeight: 800,
                          fontSize: '13px',
                          cursor: 'pointer'
                        }}
                      >
                        Apply
                      </button>
                    </div>
                    {couponError && (
                      <span style={{ color: '#ef4444', fontSize: '11px', marginTop: '6px', display: 'block', fontWeight: 600 }}>
                        {couponError}
                      </span>
                    )}
                    {appliedCoupon && (
                      <span style={{ color: '#10b981', fontSize: '12px', fontWeight: 700, marginTop: '6px', display: 'block' }}>
                        ✓ Coupon "{appliedCoupon.code}" applied!
                      </span>
                    )}
                  </div>
                </div>

                {/* Trust Footer Badges */}
                <div 
                  style={{ 
                    marginTop: '24px', 
                    paddingTop: '16px', 
                    borderTop: '1px solid rgba(255, 255, 255, 0.1)', 
                    display: 'flex', 
                    flexDirection: 'column', 
                    gap: '8px', 
                    fontSize: '11px', 
                    color: '#94a3b8' 
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <ShieldCheck size={14} color="#38bdf8" />
                    <span>256-Bit Bank-Grade AES Encryption</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Award size={14} color="#10b981" />
                    <span>14-Day 100% Satisfaction & Money-Back Guarantee</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Mail size={14} color="#818cf8" />
                    <span>Official GST Tax Invoice emailed immediately</span>
                  </div>
                </div>

              </div>

            </div>

            {/* Bottom Back Button */}
            <div style={{ borderTop: '1px solid rgba(255, 255, 255, 0.1)', paddingTop: '20px' }}>
              <button
                type="button"
                onClick={() => setStep(1)}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '12px 20px',
                  borderRadius: '12px',
                  background: 'rgba(255, 255, 255, 0.08)',
                  border: '1px solid rgba(255, 255, 255, 0.15)',
                  color: '#cbd5e1',
                  fontWeight: 700,
                  fontSize: '13px',
                  cursor: 'pointer'
                }}
              >
                <ArrowLeft size={16} />
                <span>Previous: Edit Organization Details</span>
              </button>
            </div>
          </div>
        )}

        {/* STEP 3: PROVISIONING & WORKSPACE LAUNCH SUCCESS */}
        {step === 3 && (
          <div 
            style={{
              background: 'rgba(255, 255, 255, 0.04)',
              backdropFilter: 'blur(28px)',
              borderRadius: '28px',
              border: '1px solid rgba(255, 255, 255, 0.12)',
              padding: '50px 36px',
              textAlign: 'center',
              boxShadow: '0 25px 60px rgba(0,0,0,0.6)',
              maxWidth: '680px',
              margin: '20px auto'
            }}
          >
            <div 
              style={{ 
                width: '80px', 
                height: '80px', 
                borderRadius: '50%', 
                background: provisioningProgress >= 100 ? 'rgba(16, 185, 129, 0.15)' : 'rgba(56, 189, 248, 0.15)', 
                color: provisioningProgress >= 100 ? '#10b981' : '#38bdf8', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center', 
                margin: '0 auto 24px',
                boxShadow: provisioningProgress >= 100 ? '0 0 35px rgba(16, 185, 129, 0.4)' : '0 0 35px rgba(56, 189, 248, 0.4)'
              }}
            >
              {provisioningProgress >= 100 ? <CheckCircle size={44} /> : <Sparkles size={40} />}
            </div>

            <h2 style={{ fontSize: '28px', fontWeight: 900, color: '#ffffff', margin: '0 0 8px', letterSpacing: '-0.5px' }}>
              {provisioningProgress < 100 
                ? 'Provisioning Dedicated Cloud Workspace...' 
                : `🎉 Congratulations! ${companyName} is Live!`}
            </h2>

            <p style={{ fontSize: '14px', color: '#94a3b8', maxWidth: '520px', margin: '0 auto 28px', lineHeight: 1.6 }}>
              {provisioningStatusText}
            </p>

            {/* Progress Bar */}
            <div style={{ maxWidth: '500px', margin: '0 auto 32px', background: 'rgba(255, 255, 255, 0.1)', height: '12px', borderRadius: '999px', overflow: 'hidden' }}>
              <div 
                style={{ 
                  width: `${provisioningProgress}%`, 
                  height: '100%', 
                  background: 'linear-gradient(90deg, #38bdf8, #10b981)', 
                  transition: 'width 0.4s ease' 
                }} 
              />
            </div>

            {/* Workspace Credentials Summary Card */}
            {provisioningProgress >= 100 && (
              <div 
                style={{
                  background: 'rgba(15, 23, 42, 0.85)',
                  borderRadius: '20px',
                  border: '1px solid rgba(56, 189, 248, 0.3)',
                  padding: '24px',
                  textAlign: 'left',
                  marginBottom: '28px',
                  boxShadow: '0 15px 35px rgba(0,0,0,0.4)'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '12px' }}>
                  <strong style={{ fontSize: '15px', color: '#ffffff' }}>🔑 Your Master Workspace Credentials</strong>
                  <button
                    type="button"
                    onClick={() => {
                      const text = `Workspace URL: https://${companyName.toLowerCase().replace(/[^a-z0-9]/g, '')}.itlc.cloud\nLogin ID: ${adminEmail}\nPassword: ${password || 'Admin@123'}`;
                      navigator.clipboard.writeText(text);
                      setCopiedCreds(true);
                      setTimeout(() => setCopiedCreds(false), 2000);
                    }}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px',
                      padding: '5px 10px',
                      borderRadius: '8px',
                      background: copiedCreds ? '#10b981' : 'rgba(255,255,255,0.08)',
                      border: '1px solid rgba(255,255,255,0.15)',
                      color: '#ffffff',
                      fontSize: '11px',
                      fontWeight: 700,
                      cursor: 'pointer'
                    }}
                  >
                    {copiedCreds ? <Check size={12} /> : <Copy size={12} />}
                    <span>{copiedCreds ? 'Copied!' : 'Copy Credentials'}</span>
                  </button>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '13px', color: '#cbd5e1' }}>
                  <div>
                    <span style={{ color: '#94a3b8' }}>Dedicated URL: </span>
                    <strong style={{ color: '#38bdf8', fontFamily: 'monospace' }}>
                      https://{companyName.toLowerCase().replace(/[^a-z0-9]/g, '')}.itlc.cloud
                    </strong>
                  </div>
                  <div>
                    <span style={{ color: '#94a3b8' }}>Master Admin Email: </span>
                    <strong style={{ color: '#ffffff' }}>{adminEmail}</strong>
                  </div>
                  <div>
                    <span style={{ color: '#94a3b8' }}>Password: </span>
                    <strong style={{ color: '#ffffff', fontFamily: 'monospace' }}>{password || 'Admin@123'}</strong>
                  </div>
                  <div>
                    <span style={{ color: '#94a3b8' }}>Active Tier: </span>
                    <strong style={{ color: '#10b981' }}>{currentPlan.name} ({currentPlan.seatLimit} Staff Seats)</strong>
                  </div>
                </div>
              </div>
            )}

            {/* Launch Workspace & Invoice Actions */}
            {provisioningProgress >= 100 && (
              <div style={{ display: 'flex', gap: '14px', justifyContent: 'center', flexWrap: 'wrap' }}>
                <button
                  type="button"
                  onClick={() => {
                    if (createdTenant) onCompleteRegistration(createdTenant);
                    else onBackToHome();
                  }}
                  style={{
                    padding: '16px 36px',
                    borderRadius: '14px',
                    border: 'none',
                    background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                    color: '#ffffff',
                    fontWeight: 900,
                    fontSize: '16px',
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '10px',
                    boxShadow: '0 10px 30px rgba(16, 185, 129, 0.4)'
                  }}
                >
                  <span>Launch Admin Dashboard 🚀</span>
                  <ArrowRight size={18} />
                </button>

                <button
                  type="button"
                  onClick={handleDownloadInvoice}
                  style={{
                    padding: '16px 24px',
                    borderRadius: '14px',
                    border: '1px solid rgba(255, 255, 255, 0.15)',
                    background: 'rgba(255, 255, 255, 0.08)',
                    color: '#ffffff',
                    fontWeight: 700,
                    fontSize: '14px',
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}
                >
                  <Download size={16} />
                  <span>Download GST Receipt</span>
                </button>
              </div>
            )}
          </div>
        )}

      </div>

      {/* DIRECT UPI QR CODE MODAL (HIGH RESOLUTION & ZERO DISTORTION) */}
      {showUpiQrModal && (
        <div 
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(3, 7, 18, 0.85)',
            backdropFilter: 'blur(12px)',
            zIndex: 99999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px'
          }}
        >
          <div 
            style={{
              background: '#0f172a',
              borderRadius: '24px',
              maxWidth: '440px',
              width: '100%',
              padding: '28px 24px',
              boxShadow: '0 25px 60px rgba(0, 0, 0, 0.8)',
              position: 'relative',
              textAlign: 'center',
              border: '1px solid rgba(56, 189, 248, 0.3)'
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
                background: 'rgba(255, 255, 255, 0.08)',
                border: 'none',
                borderRadius: '50%',
                width: '32px',
                height: '32px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                color: '#cbd5e1'
              }}
            >
              <X size={18} />
            </button>

            {/* Badge */}
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: 'rgba(16, 185, 129, 0.15)', border: '1px solid rgba(16, 185, 129, 0.3)', color: '#10b981', padding: '4px 14px', borderRadius: '999px', fontSize: '12px', fontWeight: 800, marginBottom: '12px' }}>
              <ShieldCheck size={14} />
              <span>Verified Direct UPI Gateway</span>
            </div>

            <h3 style={{ fontSize: '20px', fontWeight: 900, color: '#ffffff', margin: '0 0 4px' }}>
              Scan to Pay ₹{grandTotal.toLocaleString()}
            </h3>
            <p style={{ fontSize: '12px', color: '#94a3b8', margin: '0 0 16px' }}>
              Scan with Google Pay, PhonePe, Paytm, BHIM or any UPI app
            </p>

            {/* High-Resolution QR Code */}
            <div 
              style={{
                background: '#ffffff',
                padding: '14px',
                borderRadius: '18px',
                display: 'inline-block',
                boxShadow: '0 0 35px rgba(56, 189, 248, 0.25)',
                marginBottom: '16px'
              }}
            >
              <img 
                src={`https://api.qrserver.com/v1/create-qr-code/?size=600x600&margin=4&format=svg&data=${encodeURIComponent(`upi://pay?pa=${getPlatformUpiId()}&pn=ITLC%20INDIA&am=${grandTotal}&cu=INR&tn=${encodeURIComponent('Plan ' + currentPlan.name + ' ' + companyName)}`)}`} 
                alt="UPI QR Code"
                style={{
                  width: '220px',
                  height: '220px',
                  display: 'block',
                  imageRendering: 'pixelated',
                  background: '#ffffff'
                }}
              />
            </div>

            {/* Copy UPI ID */}
            <div style={{ background: 'rgba(255, 255, 255, 0.05)', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '12px', padding: '10px 14px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px', gap: '8px' }}>
              <div style={{ textAlign: 'left' }}>
                <span style={{ fontSize: '10px', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 700, display: 'block' }}>Merchant UPI ID</span>
                <span style={{ fontSize: '14px', fontWeight: 800, color: '#38bdf8', fontFamily: 'monospace' }}>{getPlatformUpiId()}</span>
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
                  border: 'none',
                  background: copiedUpi ? '#10b981' : '#38bdf8',
                  color: '#0f172a',
                  fontSize: '11px',
                  fontWeight: 800,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px'
                }}
              >
                {copiedUpi ? <Check size={12} /> : <Copy size={12} />}
                <span>{copiedUpi ? 'Copied!' : 'Copy'}</span>
              </button>
            </div>

            {/* Mobile Deep Link */}
            <a
              href={`upi://pay?pa=${getPlatformUpiId()}&pn=ITLC%20INDIA&am=${grandTotal}&cu=INR&tn=${encodeURIComponent('Plan ' + currentPlan.name + ' ' + companyName)}`}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                padding: '10px',
                borderRadius: '10px',
                background: 'rgba(56, 189, 248, 0.1)',
                border: '1px solid rgba(56, 189, 248, 0.25)',
                color: '#38bdf8',
                fontSize: '12px',
                fontWeight: 700,
                textDecoration: 'none',
                marginBottom: '14px'
              }}
            >
              <Smartphone size={14} />
              <span>Pay directly via UPI App on Mobile</span>
              <ExternalLink size={12} />
            </a>

            {/* UTR Input */}
            <div style={{ textAlign: 'left', marginBottom: '16px' }}>
              <label style={{ fontSize: '11px', fontWeight: 700, color: '#94a3b8', display: 'block', marginBottom: '6px' }}>
                UPI Reference / UTR Number (Optional):
              </label>
              <input 
                type="text"
                placeholder="e.g. 423871928371 or leave blank"
                value={upiRefNumber}
                onChange={(e) => setUpiRefNumber(e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px 14px',
                  borderRadius: '10px',
                  border: '1px solid rgba(255, 255, 255, 0.15)',
                  background: 'rgba(255, 255, 255, 0.05)',
                  color: '#ffffff',
                  fontSize: '13px',
                  boxSizing: 'border-box'
                }}
              />
            </div>

            {/* Confirm Payment Button */}
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
                background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                color: '#ffffff',
                fontWeight: 900,
                fontSize: '15px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                boxShadow: '0 8px 25px rgba(16, 185, 129, 0.4)'
              }}
            >
              <CheckCircle size={18} />
              <span>I Have Paid — Launch My Workspace 🚀</span>
            </button>
          </div>
        </div>
      )}

    </div>
  );
};
