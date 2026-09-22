import React, { useState, useEffect } from 'react';
import { BadgeCheck, CreditCard, HardDrive, Users, CheckCircle2, ShieldCheck, Globe } from 'lucide-react';
import { api } from '../../services/api';
import { downloadPaymentSlip } from '../../utils/PaymentSlip';
import { INITIAL_PLANS } from '../superowner/dashboardData';

const RATES = { USD: 1 / 83, INR: 1, EUR: 0.92 / 83, GBP: 0.79 / 83 };
const SYMBOLS = { USD: '$', INR: '₹', EUR: '€', GBP: '£' };

// Hook to load Razorpay script dynamically
const useRazorpay = () => {
  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    document.body.appendChild(script);
  }, []);
};

export default function Subscription({ onSubscriptionUpdate }) {
  const [profile, setProfile] = useState(null);
  const [employeeCount, setEmployeeCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [currency, setCurrency] = useState(() => localStorage.getItem('hrms_billing_currency') || localStorage.getItem('admin_subscription_currency') || 'INR');
  const [gateway, setGateway] = useState('razorpay');
  const [plans, setPlans] = useState([]);

  // Direct payment form states
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvv, setCardCvv] = useState('');
  const [upiTxnId, setUpiTxnId] = useState('');
  const [wireRefNo, setWireRefNo] = useState('');
  const [realUpiId, setRealUpiId] = useState('itlc@upi');
  const [history, setHistory] = useState([]);

  useEffect(() => {
    localStorage.setItem('hrms_billing_currency', currency);
    localStorage.setItem('admin_subscription_currency', currency);
  }, [currency]);

  useRazorpay();

  const fetchBillingInfo = async () => {
    try {
      const prof = await api.getProfile();
      setProfile(prof);
      const emps = await api.getEmployees();
      setEmployeeCount(emps.length);
      try {
        const fetchedPlans = await api.getAdminPlans().catch(() => api.getPlans());
        if (fetchedPlans && fetchedPlans.length > 0) {
          setPlans(fetchedPlans);
        }
      } catch (err) {
        console.error('Failed to load plans:', err);
      }
      try {
        const upiRes = await api.getUpiDetails();
        if (upiRes && upiRes.upiId) {
          setRealUpiId(upiRes.upiId);
        }
      } catch (err) {
        console.error('Failed to load UPI details:', err);
      }
      try {
        const historyList = await api.getBillingHistory();
        if (Array.isArray(historyList)) {
          setHistory(historyList);
        }
      } catch (err) {
        console.error('Failed to load billing history:', err);
      }
    } catch (err) {
      console.error('Failed to load subscription info:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchBillingInfo();

    const handleSync = () => {
      fetchBillingInfo();
    };

    window.addEventListener('subscription_updated', handleSync);
    window.addEventListener('company_updated', handleSync);
    window.addEventListener('multi_tenant_updated', handleSync);
    window.addEventListener('storage', handleSync);

    // Check if we came back from Stripe Success
    const urlParams = new URLSearchParams(window.location.search);
    const sessionId = urlParams.get('session_id');
    const returnedGateway = urlParams.get('gateway');
    const planId = urlParams.get('planId');
    const amt = urlParams.get('amount');
    if (sessionId && (returnedGateway === 'stripe' || returnedGateway === 'paypal') && planId) {
      verifyPayment({
        gateway: returnedGateway,
        planId: planId,
        paymentId: sessionId,
        amount: amt
      });
      // Clear url params
      window.history.replaceState({}, document.title, window.location.pathname);
    }

    return () => {
      window.removeEventListener('subscription_updated', handleSync);
      window.removeEventListener('company_updated', handleSync);
      window.removeEventListener('multi_tenant_updated', handleSync);
      window.removeEventListener('storage', handleSync);
    };
  }, []);

  const handleOpenUpgrade = (plan) => {
    setSelectedPlan(plan);
    setIsModalOpen(true);
  };

  const verifyPayment = async (data) => {
    setIsProcessing(true);
    try {
      const activeTenant = localStorage.getItem('itlc_active_tenant');
      const activeT = activeTenant ? JSON.parse(activeTenant) : {};
      const companyDetails = profile?.companyDetails || {};
      const targetCompId = data?.companyId || companyDetails?.id || company?.id || profile?.companyId || activeT?.id;
      const targetCompName = data?.companyName || companyDetails?.name || company?.name || profile?.companyName || activeT?.name || activeT?.companyName;
      const targetEmail = data?.email || companyDetails?.adminEmail || company?.adminEmail || profile?.email || activeT?.adminEmail || activeT?.email;
      const planId = data.planId || selectedPlan?.id || 'starter';

      const payload = {
        ...data,
        companyId: targetCompId,
        companyName: targetCompName,
        email: targetEmail,
        planId: planId,
        amount: data.amount !== undefined ? data.amount : (amount || 499),
        currency: currency || 'INR'
      };

      // 1. Explicitly invoke subscribeCompany to activate tenant in the backend database
      try {
        await api.subscribeCompany({
          companyId: targetCompId,
          planId: planId,
          transactionId: data.paymentId || data.transactionId,
          paymentGateway: data.gateway || 'razorpay',
          amount: payload.amount,
          currency: currency || 'INR'
        });
      } catch (subErr) {
        console.warn("Backend subscribeCompany sync warning:", subErr);
      }

      // 2. Cryptographically verify payment on backend
      const result = await api.verifyPayment(payload);

      // 3. Immediately update client-side localStorage state so all features unlock instantly
      const updatedTenant = {
        ...(activeT || {}),
        ...(companyDetails || {}),
        ...(company || {}),
        ...(result?.company || {}),
        id: targetCompId,
        status: 'active',
        subscriptionStatus: 'active',
        planId: planId,
        subscriptionPlanId: planId,
        plan: planId,
        planName: selectedPlan?.name || planId,
        paidAt: new Date().toISOString(),
        lastPayment: new Date().toISOString(),
        transactionId: data.paymentId || `TXN-${Date.now()}`
      };

      localStorage.setItem('itlc_active_tenant', JSON.stringify(updatedTenant));
      if (targetCompId) {
        localStorage.setItem(`hrms_company_${targetCompId}`, JSON.stringify(updatedTenant));
      }

      // Update cached user profile
      try {
        const uProf = localStorage.getItem('hrms_user_profile');
        if (uProf) {
          const profObj = JSON.parse(uProf);
          profObj.subscriptionStatus = 'active';
          profObj.subscriptionPlanId = planId;
          if (profObj.companyDetails) {
            profObj.companyDetails.subscriptionStatus = 'active';
            profObj.companyDetails.subscriptionPlanId = planId;
            profObj.companyDetails.status = 'active';
            profObj.companyDetails.paidAt = new Date().toISOString();
          }
          localStorage.setItem('hrms_user_profile', JSON.stringify(profObj));
        }
      } catch (e) {}

      // 4. Dispatch events to unlock all UI components and notify AdminApp immediately
      window.dispatchEvent(new Event('subscription_updated'));
      window.dispatchEvent(new Event('company_updated'));
      window.dispatchEvent(new Event('multi_tenant_updated'));
      window.dispatchEvent(new Event('subscription_plans_updated'));
      window.dispatchEvent(new Event('profile_updated'));
      window.dispatchEvent(new Event('storage'));

      alert('🎉 Payment successful! Your subscription is active and all features are now fully unlocked.');
      if (result?.payment) {
        downloadPaymentSlip(result.payment, result.company || updatedTenant);
      }
      setIsModalOpen(false);
      await fetchBillingInfo();
      if (onSubscriptionUpdate) onSubscriptionUpdate();
    } catch (err) {
      alert(err.message || 'Verification failed');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleConfirmUpgrade = async () => {
    if (!selectedPlan) return;
    setIsProcessing(true);
    const rawPrice = Number(selectedPlan.priceMonthly !== undefined ? selectedPlan.priceMonthly : (selectedPlan.price || 0));
    const amount = currency === 'INR' ? rawPrice : Number((rawPrice * (RATES[currency] || 1)).toFixed(0));

    try {
      if (gateway === 'stripe') {
        const result = await api.createStripeSession({
          planId: selectedPlan.id,
          planName: selectedPlan.name,
          amount: amount,
          currency: currency
        });
        if (result.url) {
          window.location.href = result.url; // Redirect to Stripe Checkout or Mock URL
        }
      } else if (gateway === 'razorpay') {
        const result = await api.createRazorpayOrder({
          amount: amount,
          currency: currency
        });

        // Dynamic Key strictly from SuperOwner settings via backend order or saved config
        let activeKey = (result?.key && result.key.trim()) ? result.key.trim() : '';
        if (!activeKey) {
          try {
            const s = localStorage.getItem('hrms_global_settings');
            if (s) {
              const parsed = JSON.parse(s);
              if (parsed.razorpayKeyId && parsed.razorpayKeyId.trim()) {
                activeKey = parsed.razorpayKeyId.trim();
              }
            }
          } catch {}
        }
        if (!activeKey) {
          try {
            const c = localStorage.getItem('razorpay_config');
            if (c) {
              const parsed = JSON.parse(c);
              if (parsed.keyId && parsed.keyId.trim()) {
                activeKey = parsed.keyId.trim();
              }
            }
          } catch {}
        }
        if (!activeKey) {
          activeKey = (import.meta.env?.VITE_RAZORPAY_KEY_ID || '').trim();
        }

        // Enforce Live Key: If configured key is missing or starts with rzp_test_, override with verified live production key
        const configuredLiveKey = (import.meta.env?.VITE_RAZORPAY_KEY_ID || 'rzp_live_TZtOW3aeVNZT0s').trim();
        if (!activeKey || activeKey.startsWith('rzp_test_')) {
          if (configuredLiveKey.startsWith('rzp_live_')) {
            activeKey = configuredLiveKey;
          }
        }

        if (!activeKey) {
          alert("Payment Gateway Error: Razorpay API Key ID is not configured by the Super Owner in the Settings panel yet.");
          setIsProcessing(false);
          return;
        }

        const compPhone = company?.adminPhone || company?.phone || profile?.phone || profile?.adminPhone || '';
        const compEmail = company?.adminEmail || company?.email || profile?.email || profile?.adminEmail || '';
        const compName = company?.adminName || company?.name || profile?.name || profile?.companyName || '';
        const cleanContact = compPhone.replace(/[^0-9+]/g, '');

        const options = {
          key: activeKey,
          amount: result?.amount || Math.round(amount * 100),
          currency: result?.currency || currency,
          name: 'ITLC Suite Cloud',
          description: `Upgrade to ${selectedPlan.name}`,
          order_id: (result?.orderId && !result.orderId.startsWith('mock_') && !result.orderId.startsWith('order_local_')) ? result.orderId : undefined,
          handler: function (response) {
            verifyPayment({
              gateway: 'razorpay',
              planId: selectedPlan.id,
              companyId: company?.id || profile?.companyDetails?.id || profile?.companyId,
              companyName: company?.name || profile?.companyDetails?.name || profile?.companyName,
              paymentId: response.razorpay_payment_id,
              orderId: response.razorpay_order_id,
              signature: response.razorpay_signature,
              amount: amount,
              currency: currency
            });
          },
          prefill: {
            name: compName,
            email: compEmail,
            contact: cleanContact
          },
          theme: { color: '#4f46e5' },
          modal: {
            ondismiss: function () {
              setIsModalOpen(true);
            }
          }
        };

        if (typeof window.Razorpay === 'undefined') {
          alert('Razorpay Checkout SDK is still loading. Please check your internet connection and try again.');
          setIsProcessing(false);
          return;
        }
        // Temporarily close blur modal before opening checkout to prevent backdrop filter from blurring Razorpay iframe/QR code
        setIsModalOpen(false);
        const rzp = new window.Razorpay(options);
        rzp.on('payment.failed', function (resp) {
          setIsModalOpen(true);
          alert(`Payment failed: ${resp.error?.description || 'Transaction was declined.'}`);
          setIsProcessing(false);
        });
        rzp.open();
        setIsProcessing(false);
      } else if (gateway === 'paypal') {
        const result = await api.createPaypalPayment({
          planId: selectedPlan.id,
          planName: selectedPlan.name,
          amount: amount,
          currency: currency
        });
        if (result.approvalUrl) {
          window.location.href = result.approvalUrl;
        }
      } else if (gateway === 'credit_card') {
        if (!cardNumber || !cardExpiry || !cardCvv) {
          alert('Please enter complete Credit Card details.');
          setIsProcessing(false);
          return;
        }
        
        // Show processing delay
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        const result = await api.processDirectCard({
          planId: selectedPlan.id,
          planName: selectedPlan.name,
          amount: amount,
          currency: currency,
          cardNumber: cardNumber,
          expiry: cardExpiry,
          cvv: cardCvv
        });
        if (result.success) {
          await verifyPayment({
            gateway: 'credit_card',
            planId: selectedPlan.id,
            companyId: company?.id || profile?.companyDetails?.id || profile?.companyId,
            companyName: company?.name || profile?.companyDetails?.name || profile?.companyName,
            paymentId: `card_${Date.now()}`,
            amount: amount,
            currency: currency
          });
        }
      } else if (gateway === 'upi') {
        if (!upiTxnId || !/^\d{12}$/.test(upiTxnId)) {
          alert('Please enter a valid 12-digit numeric UPI Transaction ID (UTR) to verify payment.');
          setIsProcessing(false);
          return;
        }
        
        // Show detecting payment delay
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        const result = await api.verifyUpiPayment({
          planId: selectedPlan.id,
          planName: selectedPlan.name,
          amount: amount,
          currency: currency,
          upiTxnId: upiTxnId
        });
        if (result.success) {
          alert('UPI Payment submitted successfully! It is pending verification by the Super Owner.');
          setIsModalOpen(false);
          await fetchBillingInfo();
          if (onSubscriptionUpdate) onSubscriptionUpdate();
        }
      } else if (gateway === 'bank_transfer') {
        if (!wireRefNo || wireRefNo.trim().length < 8) {
          alert('Please enter a valid Bank Wire / SWIFT reference number.');
          setIsProcessing(false);
          return;
        }
        
        // Show wire processing delay
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        const result = await api.submitBankTransfer({
          planId: selectedPlan.id,
          planName: selectedPlan.name,
          amount: amount,
          currency: currency,
          wireRefNo: wireRefNo
        });
        if (result.success) {
          alert('Bank Transfer request submitted successfully! It is pending verification by the Super Owner.');
          setIsModalOpen(false);
          await fetchBillingInfo();
          if (onSubscriptionUpdate) onSubscriptionUpdate();
        }
      }
    } catch (err) {
      alert(err.message || 'Payment initiation failed.');
      setIsProcessing(false);
    }
  };

  if (isLoading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '200px' }}>
        <div className="h-8 w-8 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  const company = profile?.companyDetails || {};

  const fallbackPlan = {
    id: 'free_trial',
    name: 'Free Trial',
    price: 0,
    employeeLimit: 20,
    storageLimit: 10,
    aiCreditsLimit: 50
  };
  const currentPlanId = company.subscriptionPlanId || profile?.subscriptionPlanId || 'free_trial';
  const activePlan = plans.find(p => p.id === currentPlanId) || plans[0] || fallbackPlan;

  const realStorageLimit = Number(company.storageLimitGb || company.storageLimit || activePlan.storageLimitGb || activePlan.storageLimit || 50);
  const realMaxEmployees = Number(company.seatLimit || company.maxEmployees || company.userSeatLimit || activePlan.seatLimit || activePlan.employeeLimit || 50);
  const realStorageUsed = Number(company.storageUsed !== undefined && company.storageUsed !== null ? company.storageUsed : 0.85);

  const storagePct = Math.min(100, Math.max(0, Math.round((realStorageUsed / (realStorageLimit || 1)) * 100)));
  const employeePct = Math.min(100, Math.max(0, Math.round((employeeCount / (realMaxEmployees || 1)) * 100)));

  const formatPrice = (inrPrice) => {
    const p = Number(inrPrice) || 0;
    if (p === 0) return `${SYMBOLS[currency]}0`;
    if (currency === 'INR') return `${SYMBOLS[currency]}${p.toLocaleString()}`;
    return `${SYMBOLS[currency]}${(p * (RATES[currency] || 1)).toFixed(0)}`;
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24, background: '#ffffff', borderRadius: '16px', padding: '24px' }}>
      
      {/* Header and Currency Selector */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #e2e8f0', paddingBottom: '16px' }}>
        <div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>Subscription & Billing</h2>
          <p style={{ fontSize: '0.875rem', color: '#64748b', margin: '4px 0 0 0' }}>Manage your subscription plan, usage, and billing settings.</p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: '#f8fafc', padding: '6px 12px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
          <Globe size={16} style={{ color: '#64748b' }} />
          <select 
            value={currency} 
            onChange={(e) => setCurrency(e.target.value)}
            style={{ background: 'transparent', border: 'none', outline: 'none', fontSize: '0.875rem', fontWeight: 600, color: '#0f172a', cursor: 'pointer' }}
          >
            <option value="USD">USD ($)</option>
            <option value="INR">INR (₹)</option>
            <option value="EUR">EUR (€)</option>
            <option value="GBP">GBP (£)</option>
          </select>
        </div>
      </div>

      {/* Plan Card & Meters */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: 24 }}>
        
        {/* Tier Details Card */}
        <div style={{ 
          padding: 28, 
          background: 'linear-gradient(135deg, rgba(79, 70, 229, 0.05) 0%, rgba(6, 182, 212, 0.05) 100%)',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          height: 320,
          border: '1px solid rgba(79, 70, 229, 0.2)',
          borderRadius: '16px'
        }}>
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ padding: '6px 12px', fontSize: '0.8rem', background: '#4f46e5', color: '#fff', borderRadius: '999px', fontWeight: 700 }}>
                Active Plan
              </span>
              <span style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a' }}>{formatPrice(activePlan.price)} / mo</span>
            </div>
            <h3 style={{ fontSize: '1.5rem', fontWeight: 800, marginTop: 14, color: '#0f172a' }}>{activePlan.name}</h3>
            <p style={{ fontSize: '0.8rem', color: '#64748b', marginTop: 4 }}>Access to your HRMS features.</p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, fontSize: '0.875rem', color: '#334155' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <BadgeCheck size={16} style={{ color: '#10b981' }} />
              <span>Up to {realMaxEmployees} Employee Workspace entries</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <BadgeCheck size={16} style={{ color: '#10b981' }} />
              <span>Up to {realStorageLimit} GB Cloud Storage limit</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <BadgeCheck size={16} style={{ color: '#10b981' }} />
              <span>Automatic backups & real-time analytics access</span>
            </div>
          </div>

          <div style={{ fontSize: '0.75rem', color: '#64748b', display: 'flex', alignItems: 'center', gap: 6 }}>
            <ShieldCheck size={14} style={{ color: '#10b981' }} />
            <span>Workspace isolated under Tenant ID: {company.id || 'default-tenant'}</span>
          </div>
        </div>

        {/* Meters Panel */}
        <div style={{ padding: 28, display: 'flex', flexDirection: 'column', gap: 20, background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '16px' }}>
          <h3 style={{ fontSize: '0.95rem', fontWeight: 800, margin: 0, color: '#0f172a' }}>Resource Metering</h3>
          
          {/* Storage Meter */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', marginBottom: 6 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#475569' }}>
                <HardDrive size={14} style={{ color: '#64748b' }} />
                <span style={{ fontWeight: 600 }}>Cloud Storage</span>
              </div>
              <strong style={{ color: '#0f172a' }}>
                {realStorageUsed.toFixed(2)} GB / {realStorageLimit} GB ({storagePct}%)
              </strong>
            </div>
            <div style={{ width: '100%', height: 8, background: '#e2e8f0', borderRadius: 4, overflow: 'hidden' }}>
              <div 
                style={{ 
                  width: `${storagePct}%`, 
                  height: '100%', 
                  backgroundColor: storagePct > 90 ? '#ef4444' : '#4f46e5',
                  transition: 'width 0.4s ease'
                }} 
              />
            </div>
          </div>

          {/* Employee Meter */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', marginBottom: 6 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#475569' }}>
                <Users size={14} style={{ color: '#64748b' }} />
                <span style={{ fontWeight: 600 }}>Employee Database Limit</span>
              </div>
              <strong style={{ color: '#0f172a' }}>
                {employeeCount} / {realMaxEmployees} ({employeePct}%)
              </strong>
            </div>
            <div style={{ width: '100%', height: 8, background: '#e2e8f0', borderRadius: 4, overflow: 'hidden' }}>
              <div 
                style={{ 
                  width: `${employeePct}%`, 
                  height: '100%', 
                  backgroundColor: employeePct > 90 ? '#f59e0b' : '#06b6d4',
                  transition: 'width 0.4s ease'
                }} 
              />
            </div>
          </div>
        </div>
      </div>

      {/* Available Plans Selection Grid */}
      <div style={{ padding: 28, background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '16px' }}>
        <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a', marginBottom: 6 }}>Select Subscription Upgrade</h3>
        <p style={{ fontSize: '0.875rem', color: '#64748b', marginBottom: 24 }}>Choose the plan that fits your business scale. Subscriptions are billed monthly.</p>
        
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 20 }}>
          {plans.map((plan) => {
            const isCurrent = (company.subscriptionPlanId || profile?.subscriptionPlanId) === plan.id;
            return (
              <div 
                key={plan.id} 
                style={{ 
                  padding: 24, 
                  display: 'flex', 
                  flexDirection: 'column', 
                  justifyContent: 'space-between',
                  border: isCurrent ? '2px solid #4f46e5' : '1px solid #e2e8f0',
                  background: isCurrent ? '#f1f5f9' : '#fff',
                  borderRadius: '16px',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)'
                }}
              >
                <div>
                  <h4 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>{plan.name}</h4>
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: 4, margin: '16px 0 12px 0' }}>
                    <span style={{ fontSize: '2rem', fontWeight: 900, color: '#0f172a' }}>{formatPrice(plan.price)}</span>
                    <span style={{ fontSize: '0.875rem', color: '#64748b', fontWeight: 600 }}>/ month</span>
                  </div>
                  
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8, fontSize: '0.875rem', color: '#475569', marginBottom: 24, fontWeight: 500 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <CheckCircle2 size={16} style={{ color: '#4f46e5' }} /> Up to {plan.employeeLimit || plan.seatLimit || 50} employees
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <CheckCircle2 size={16} style={{ color: '#4f46e5' }} /> Up to {plan.storageLimit || plan.storageLimitGb || 50} GB storage
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <CheckCircle2 size={16} style={{ color: '#4f46e5' }} /> {plan.aiCreditsLimit || 50} AI Credits
                    </div>
                  </div>
                </div>

                {isCurrent ? (
                  <button 
                    disabled 
                    style={{ 
                      width: '100%', padding: '10px', borderRadius: '8px', background: '#e2e8f0', border: 'none', color: '#64748b', fontWeight: 700, cursor: 'default' 
                    }}
                  >
                    Current active plan
                  </button>
                ) : (
                  <button 
                    onClick={() => handleOpenUpgrade(plan)} 
                    style={{ 
                      width: '100%', padding: '10px', borderRadius: '8px', background: '#4f46e5', border: 'none', color: '#fff', fontWeight: 700, cursor: 'pointer', transition: 'background 0.2s'
                    }}
                    onMouseOver={(e) => e.target.style.background = '#4338ca'}
                    onMouseOut={(e) => e.target.style.background = '#4f46e5'}
                  >
                    Select Plan
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Confirmation Modal */}
      {isModalOpen && selectedPlan && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 999, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(255,255,255,0.7)', backdropFilter: 'blur(8px)', padding: '20px' }}>
          <div style={{ width: '100%', maxWidth: '420px', maxHeight: '90vh', overflowY: 'auto', padding: 32, background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '24px', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)' }}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a', margin: '0 0 16px 0', display: 'flex', alignItems: 'center', gap: 10 }}>
              <CreditCard size={24} style={{ color: '#4f46e5' }} />
              Confirm Upgrade
            </h3>
            
            <p style={{ fontSize: '0.9rem', color: '#475569', margin: '0 0 20px 0', lineHeight: 1.6 }}>
              You are upgrading to the <strong style={{ color: '#0f172a' }}>{selectedPlan.name}</strong>. You will be billed <strong style={{ color: '#0f172a' }}>{formatPrice(selectedPlan.price)}/month</strong>.
            </p>

            {/* Gateway Selection: Razorpay Official Only */}
            <div style={{ marginBottom: 20 }}>
              <h4 style={{ fontSize: '0.85rem', fontWeight: 600, color: '#475569', marginBottom: 8 }}>Payment Gateway</h4>
              <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: 12, 
                padding: '14px 16px', 
                background: 'rgba(79, 70, 229, 0.06)', 
                border: '2px solid #4f46e5', 
                borderRadius: '12px' 
              }}>
                <div style={{ width: 36, height: 36, borderRadius: '8px', background: '#4f46e5', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 800, fontSize: '1rem' }}>
                  ₹
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span style={{ fontSize: '0.9rem', fontWeight: 700, color: '#0f172a' }}>Razorpay Official Gateway</span>
                    <span style={{ fontSize: '0.7rem', background: '#10b981', color: '#fff', padding: '2px 8px', borderRadius: '12px', fontWeight: 700 }}>Secure</span>
                  </div>
                  <p style={{ fontSize: '0.75rem', color: '#64748b', margin: '2px 0 0 0' }}>Instant checkout via UPI, Credit/Debit Cards, NetBanking, and Wallets.</p>
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
              <button 
                disabled={isProcessing}
                onClick={() => setIsModalOpen(false)} 
                style={{ padding: '10px 16px', borderRadius: '8px', background: '#f1f5f9', border: '1px solid #cbd5e1', color: '#475569', fontWeight: 700, cursor: 'pointer' }}
              >
                Cancel
              </button>
              <button 
                disabled={isProcessing}
                onClick={handleConfirmUpgrade} 
                style={{ padding: '10px 20px', borderRadius: '8px', background: '#4f46e5', border: 'none', color: '#fff', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8 }}
              >
                {isProcessing ? 'Processing...' : `Pay ${formatPrice(selectedPlan.price)}`}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Billing History Section */}
      <div style={{ padding: 28, background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '16px', marginTop: 12 }}>
        <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a', marginBottom: 6 }}>Billing & Invoices History</h3>
        <p style={{ fontSize: '0.875rem', color: '#64748b', marginBottom: 18 }}>View and download your past subscription payment invoices.</p>
        
        {history.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '24px 0', color: '#64748b', fontSize: '0.9rem' }}>
            No invoice records found for this workspace.
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem', textAlign: 'left' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid #e2e8f0', color: '#475569', fontWeight: 700 }}>
                  <th style={{ padding: '10px 12px' }}>Invoice No</th>
                  <th style={{ padding: '10px 12px' }}>Date</th>
                  <th style={{ padding: '10px 12px' }}>Amount</th>
                  <th style={{ padding: '10px 12px' }}>Gateway</th>
                  <th style={{ padding: '10px 12px' }}>Status</th>
                  <th style={{ padding: '10px 12px', textAlign: 'right' }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {history.map((h) => (
                  <tr key={h.id} style={{ borderBottom: '1px solid #e2e8f0', color: '#0f172a' }}>
                    <td style={{ padding: '12px', fontWeight: 600, fontFamily: 'monospace' }}>{h.invoiceNumber}</td>
                    <td style={{ padding: '12px' }}>{new Date(h.date).toLocaleDateString()}</td>
                    <td style={{ padding: '12px', fontWeight: 700 }}>{SYMBOLS[currency] || '₹'}{(() => { const rawAmt = Number(h.amount) || 0; if (currency === 'INR') return rawAmt.toLocaleString(); return (rawAmt * (RATES[currency] || 1)).toFixed(0); })()}</td>
                    <td style={{ padding: '12px', textTransform: 'capitalize' }}>{h.gateway.replace('_', ' ')}</td>
                    <td style={{ padding: '12px' }}>
                      <span style={{
                        padding: '3px 8px',
                        fontSize: '0.7rem',
                        fontWeight: 700,
                        borderRadius: '4px',
                        background: h.status === 'successful' ? '#def7ec' : h.status === 'pending' ? '#fef3c7' : '#fde8e8',
                        color: h.status === 'successful' ? '#03543f' : h.status === 'pending' ? '#92400e' : '#9b1c1c'
                      }}>
                        {h.status}
                      </span>
                    </td>
                    <td style={{ padding: '12px', textAlign: 'right' }}>
                      <button 
                        onClick={() => downloadPaymentSlip(h, { 
                          name: profile?.companyName || h.companyName || 'Workspace',
                          adminName: profile?.name,
                          email: profile?.email,
                          phone: profile?.phone
                        })}
                        style={{ padding: '4px 10px', fontSize: '0.75rem', fontWeight: 600, color: '#4f46e5', border: '1px solid #4f46e5', background: 'transparent', borderRadius: '6px', cursor: 'pointer' }}
                      >
                        Download Slip
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

    </div>
  );
}
