import React, { useState } from 'react';
import { 
  Lock, 
  Mail, 
  Eye, 
  EyeOff, 
  ArrowRight, 
  ShieldCheck, 
  ShieldAlert,
  Sparkles, 
  Building2, 
  Users, 
  Briefcase,
  X,
  Crown,
  UserCheck,
  CreditCard,
  AlertTriangle
} from 'lucide-react';
import { api } from '../services/api';
import { initialSeedTenants, getLiveSubscriptionPlans, type TenantCompany } from '../types/multiTenant';

interface SecureAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (userProfile: {
    id: number | string;
    name: string;
    email: string;
    role: string;
    companyName?: string;
    avatar?: string;
  }) => void;
  onOpenRegister: () => void;
  lang?: 'en' | 'hi';
}

export const SecureAuthModal: React.FC<SecureAuthModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  onOpenRegister,
  lang = 'en'
}) => {
  if (!isOpen) return null;

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [subscriptionBlocked, setSubscriptionBlocked] = useState(false);

  // Helper to get all live tenant companies with active subscriptions
  const getRegisteredTenants = (): TenantCompany[] => {
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

    let list: TenantCompany[] = [];
    try {
      const saved = localStorage.getItem('itlc_multi_tenants') || localStorage.getItem('multi_tenants_data') || localStorage.getItem('tenants');
      if (saved !== null) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          list = parsed.filter((t: any) => 
            t && t.id && 
            !deletedIds.has(String(t.id).toLowerCase().trim()) && 
            !deletedIds.has(String(t.adminEmail || '').toLowerCase().trim()) && 
            !deletedIds.has(String(t.email || '').toLowerCase().trim()) && 
            t.status !== 'deleted'
          );
        }
      }
    } catch {}

    if (list.length === 0 && Array.isArray(initialSeedTenants)) {
      list = initialSeedTenants.filter((t: any) => 
        t && t.id && 
        !deletedIds.has(String(t.id).toLowerCase().trim()) && 
        !deletedIds.has(String(t.adminEmail || '').toLowerCase().trim()) && 
        !deletedIds.has(String(t.email || '').toLowerCase().trim()) && 
        t.status !== 'deleted'
      );
    }

    // Also include from itlc_registered_users
    try {
      const regUsers = localStorage.getItem('itlc_registered_users');
      if (regUsers) {
        const parsedUsers = JSON.parse(regUsers);
        if (Array.isArray(parsedUsers)) {
          parsedUsers.forEach((u: any) => {
            const uCompId = String(u.companyId || '').toLowerCase().trim();
            const uEmail = String(u.email || '').toLowerCase().trim();
            if (u.companyId && !deletedIds.has(uCompId) && !deletedIds.has(uEmail) && u.status !== 'deleted' && !list.some(t => t.id === u.companyId || t.adminEmail?.toLowerCase() === uEmail)) {
              list.push({
                id: u.companyId,
                name: u.companyName || u.name || 'Enterprise Workspace',
                domain: (u.companyName || 'workspace').toLowerCase().replace(/[^a-z0-9]/g, ''),
                industry: 'IT & Enterprise Services',
                adminName: u.name || 'Company Admin',
                adminEmail: u.email || 'admin@workspace.com',
                adminPhone: u.phone || '+91 95323 41000',
                password: u.password || u.adminPassword || 'Admin@123',
                adminPassword: u.password || u.adminPassword || 'Admin@123',
                planId: u.planId || 'growth',
                suites: ['crm', 'hrms'],
                status: 'active',
                onboardDate: '2026-09-01',
                renewalDate: '2026-10-01',
                billingCycle: 'monthly',
                mrrAmount: 1999,
                userSeatLimit: 50,
                activeUsersCount: 10,
                features: {
                  crmKanban: true, crmGstInvoicing: true, crmGpsFieldTracking: true,
                  crmAiCopilot: true, crmWhatsAppBroadcast: true, crmReports: true,
                  hrmsBiometricRadar: true, hrmsGeofenceAttendance: true, hrmsPayrollPayslips: true,
                  hrmsShiftLeaveManagement: true, hrmsAssetTraining: true, apiWebhooks: true,
                  customDomain: true, prioritySlaSupport: true
                }
              } as any);
            }
          });
        }
      }
    } catch {}

    // Also include from hrms_companies_data
    try {
      const compsRaw = localStorage.getItem('hrms_companies_data');
      if (compsRaw) {
        const parsedComps = JSON.parse(compsRaw);
        if (Array.isArray(parsedComps)) {
          parsedComps.forEach((c: any) => {
            if (c.id && (!deletedIds.has(c.id) || c.status === 'active' || c.status === 'trial') && !list.some(t => t.id === c.id || t.adminEmail?.toLowerCase() === c.email?.toLowerCase())) {
              list.push({
                id: c.id,
                name: c.name,
                domain: (c.name || 'company').toLowerCase().replace(/[^a-z0-9]/g, ''),
                industry: 'General Enterprise',
                adminName: c.ownerName || c.name,
                adminEmail: c.email || c.adminEmail,
                adminPhone: c.phone || '+91 98765 43210',
                password: c.password || c.adminPassword || 'Admin@123',
                adminPassword: c.password || c.adminPassword || 'Admin@123',
                planId: c.subscriptionPlanId || 'growth',
                suites: ['crm', 'hrms'],
                status: c.status || 'active',
                onboardDate: c.createdDate || new Date().toISOString().split('T')[0],
                renewalDate: new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0],
                billingCycle: 'monthly',
                mrrAmount: 999,
                userSeatLimit: c.maxEmployees || c.employeesCount || 50,
                activeUsersCount: 1,
                storageLimitGb: c.storageLimit || 50,
                features: {
                  crmKanban: true, crmGstInvoicing: true, crmGpsFieldTracking: true,
                  crmAiCopilot: true, crmWhatsAppBroadcast: true, crmReports: true,
                  hrmsBiometricRadar: true, hrmsGeofenceAttendance: true, hrmsPayrollPayslips: true,
                  hrmsShiftLeaveManagement: true, hrmsAssetTraining: true, apiWebhooks: true,
                  customDomain: true, prioritySlaSupport: true
                }
              } as any);
            }
          });
        }
      }
    } catch {}

    return list;
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setSubscriptionBlocked(false);

    if (!email.trim() || !password.trim()) {
      setErrorMessage('Please enter both email and password.');
      return;
    }

    setIsLoading(true);
    const cleanEmail = email.trim().toLowerCase();

    // 1. Check SuperAdmin Master Access (STRICT VERIFICATION)
    const isSuperAdminEmail = cleanEmail === 'priyanshupushkar263@gmail.com';

    if (isSuperAdminEmail) {
      try {
        const result = await api.login({ email: cleanEmail, password: password.trim() });
        const userObj = (result as any)?.user || result;
        const token = (result as any)?.token || userObj?.token;
        if (token) {
          localStorage.setItem('hrms_jwt_token', token);
        }
        const profileObj = {
          id: 'SUP_PAPZ0YC',
          name: 'Priyanshu Pushkar',
          fullName: 'Priyanshu Pushkar',
          email: 'priyanshupushkar263@gmail.com',
          role: 'Super Owner',
          status: 'Active',
          companyName: 'SUPEROWNER Platform HQ',
          companyId: null,
          avatar: 'PP'
        };
        localStorage.setItem('hrms_user_profile', JSON.stringify(profileObj));
        localStorage.setItem('crm_auth_session', 'true');
        sessionStorage.setItem('crm_auth_session', 'true');
        localStorage.removeItem('itlc_active_tenant');

        setIsLoading(false);
        onSuccess(profileObj);
        return;
      } catch (err: any) {
        setIsLoading(false);
        setErrorMessage(err.message || '❌ Invalid Super Owner credentials. Access Denied.');
        return;
      }
    }

    // 2. Strict Subscription Verification Engine
    const allTenants = getRegisteredTenants();
    
    // Check if user is registered in itlc_registered_users
    let registeredUser: any = null;
    try {
      const regUsers = localStorage.getItem('itlc_registered_users');
      if (regUsers) {
        const parsedUsers = JSON.parse(regUsers);
        if (Array.isArray(parsedUsers)) {
          registeredUser = parsedUsers.find((u: any) => u.email?.toLowerCase().trim() === cleanEmail);
        }
      }
    } catch {}

    // Check if email matches any tenant admin or employee domain
    const cleanDomainSlug = cleanEmail.includes('@') ? cleanEmail.split('@')[1].split('.')[0] : cleanEmail;
    const matchingTenant = allTenants.find(t => 
      t.adminEmail?.toLowerCase().trim() === cleanEmail ||
      (t as any).email?.toLowerCase().trim() === cleanEmail ||
      (t as any).ownerEmail?.toLowerCase().trim() === cleanEmail ||
      (t as any).companyEmail?.toLowerCase().trim() === cleanEmail ||
      (registeredUser && registeredUser.companyId && t.id === registeredUser.companyId) ||
      (t.id && t.id.toLowerCase() === cleanEmail) ||
      (t.name && t.name.toLowerCase().trim() === cleanEmail) ||
      (t.domain && (
        cleanEmail === t.domain.toLowerCase() ||
        cleanDomainSlug === t.domain.toLowerCase() ||
        cleanEmail.endsWith(`@${t.domain.toLowerCase()}.com`) || 
        cleanEmail.endsWith(`@${t.domain.toLowerCase()}.in`) || 
        cleanEmail.endsWith(`@${t.domain.toLowerCase()}`)
      ))
    );

    // Check crm registered users
    let isRegisteredCrmUser = false;
    try {
      const savedUsers = localStorage.getItem('crm_users');
      if (savedUsers) {
        const parsedUsers = JSON.parse(savedUsers);
        if (Array.isArray(parsedUsers)) {
          isRegisteredCrmUser = parsedUsers.some((u: any) => u.email?.toLowerCase() === cleanEmail);
        }
      }
    } catch {}

    // IF NOT A SUBSCRIBED COMPANY / USER -> BLOCK LOGIN!
    if (!matchingTenant && !registeredUser && !isRegisteredCrmUser) {
      setTimeout(() => {
        setIsLoading(false);
        setSubscriptionBlocked(true);
        setErrorMessage('Access Restricted: No active corporate subscription found for this account. Please subscribe to a plan to activate and access your workspace.');
      }, 500);
      return;
    }

    // Verify Password if registered user has specific password
    if (registeredUser && registeredUser.password) {
      const uPass = String(registeredUser.password).trim();
      const isPassOk = password === uPass || password.toLowerCase() === uPass.toLowerCase();
      if (!isPassOk) {
        setTimeout(() => {
          setIsLoading(false);
          setErrorMessage('❌ Invalid email or password. Access Denied.');
        }, 400);
        return;
      }
    }

    // If company exists, check if subscription is active
    if (matchingTenant && (matchingTenant.status === 'expired' || matchingTenant.status === 'suspended')) {
      setTimeout(() => {
        setIsLoading(false);
        setSubscriptionBlocked(true);
        setErrorMessage(`Subscription Expired: The corporate subscription for "${matchingTenant.name}" has expired. Please renew your plan to log in.`);
      }, 500);
      return;
    }

    // 3. Login through api.login
    try {
      const result = await api.login({ email: email.trim(), password: password.trim() });
      const userObj = (result as any)?.user || result;
      if (userObj && (userObj.token || userObj.email)) {
        const token = userObj.token || `token-${Date.now()}`;
        localStorage.setItem('hrms_jwt_token', token);

        const isSuper = cleanEmail === 'priyanshupushkar263@gmail.com';

        if (isSuper) {
          const profileObj = {
            id: 'SUP_PAPZ0YC',
            name: 'Priyanshu Pushkar',
            fullName: 'Priyanshu Pushkar',
            email: 'priyanshupushkar263@gmail.com',
            role: 'Super Owner',
            status: 'Active',
            companyName: 'SUPEROWNER Platform HQ',
            companyId: null,
            avatar: 'PP'
          };
          localStorage.setItem('hrms_user_profile', JSON.stringify(profileObj));
          localStorage.setItem('crm_auth_session', 'true');
          sessionStorage.setItem('crm_auth_session', 'true');
          localStorage.removeItem('itlc_active_tenant');

          setIsLoading(false);
          onSuccess(profileObj);
          return;
        }

        localStorage.setItem('hrms_user_profile', JSON.stringify(userObj));
        localStorage.setItem('crm_auth_session', 'true');
        sessionStorage.setItem('crm_auth_session', 'true');

        setIsLoading(false);
        onSuccess({
          id: userObj.id || 1,
          name: userObj.fullName || userObj.name || (matchingTenant?.adminName || registeredUser?.name || 'Authorized User'),
          email: userObj.email || email.trim(),
          role: userObj.role || 'Company Admin',
          companyName: userObj.companyName || userObj.companyDetails?.name || matchingTenant?.name || registeredUser?.companyName || 'Enterprise Workspace',
          avatar: (userObj.name || userObj.fullName || 'AU').slice(0, 2).toUpperCase()
        });
        return;
      }

      setIsLoading(false);
      setErrorMessage('❌ Invalid email or password. Access Denied.');
    } catch (err: any) {
      setIsLoading(false);
      if (err.message && (err.message.includes('Subscription') || err.message.includes('Restricted'))) {
        setSubscriptionBlocked(true);
      }
      setErrorMessage(err.message || '❌ Invalid email or password. Access Denied.');
      return;
    }
  };



  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      zIndex: 99999,
      backgroundColor: 'rgba(15, 23, 42, 0.78)',
      backdropFilter: 'blur(16px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '16px',
      animation: 'fadeIn 0.2s ease-out'
    }}>
      <div style={{
        background: '#ffffff',
        borderRadius: '24px',
        maxWidth: '490px',
        width: '100%',
        boxShadow: '0 25px 50px -12px rgba(15, 23, 42, 0.45)',
        border: '1px solid #e2e8f0',
        overflow: 'hidden',
        position: 'relative'
      }}>
        
        {/* Header */}
        <div style={{
          background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
          padding: '24px 28px',
          color: '#ffffff',
          position: 'relative'
        }}>
          <button
            onClick={onClose}
            style={{
              position: 'absolute',
              top: '20px',
              right: '20px',
              background: 'rgba(255, 255, 255, 0.1)',
              border: 'none',
              borderRadius: '50%',
              width: '32px',
              height: '32px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#ffffff',
              cursor: 'pointer'
            }}
          >
            <X size={16} />
          </button>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
            <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: '#0284c7', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ffffff', boxShadow: '0 0 15px rgba(2, 132, 199, 0.4)' }}>
              <Lock size={18} />
            </div>
            <div>
              <h3 style={{ fontSize: '18px', fontWeight: 900, margin: 0, color: '#ffffff' }}>
                {'Secure Enterprise Login'}
              </h3>
              <span style={{ fontSize: '11px', color: '#38bdf8', fontWeight: 600 }}>Active Subscription Verification Enabled</span>
            </div>
          </div>
          <p style={{ fontSize: '13px', color: '#cbd5e1', margin: 0, lineHeight: 1.4 }}>
            {'Sign in with your subscribed company account to access CRM & HRMS workspaces.'}
          </p>
        </div>

        {/* Form Body */}
        <div style={{ padding: '28px' }}>
          
          {/* SUBSCRIPTION BLOCKED ALERT BANNER */}
          {subscriptionBlocked ? (
            <div style={{
              background: 'linear-gradient(135deg, #fff1f2 0%, #fef2f2 100%)',
              border: '2px solid #f87171',
              borderRadius: '16px',
              padding: '18px 20px',
              marginBottom: '20px',
              boxShadow: '0 8px 25px rgba(239, 68, 68, 0.12)'
            }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                <div style={{ background: '#ef4444', color: '#fff', borderRadius: '8px', padding: '6px', flexShrink: 0 }}>
                  <ShieldAlert size={20} />
                </div>
                <div>
                  <h4 style={{ margin: '0 0 6px', fontSize: '14px', fontWeight: 800, color: '#991b1b' }}>
                    Subscription Required for Login
                  </h4>
                  <p style={{ margin: '0 0 14px', fontSize: '13px', color: '#b91c1c', lineHeight: 1.5 }}>
                    {errorMessage}
                  </p>
                  
                  {/* DIRECT CTA TO CHOOSE SUBSCRIPTION PLAN */}
                  <button
                    type="button"
                    onClick={() => {
                      onClose();
                      onOpenRegister();
                    }}
                    style={{
                      width: '100%',
                      padding: '12px 16px',
                      borderRadius: '10px',
                      background: 'linear-gradient(135deg, #0284c7 0%, #2563eb 50%, #4f46e5 100%)',
                      color: '#ffffff',
                      border: 'none',
                      fontSize: '13px',
                      fontWeight: 800,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px',
                      boxShadow: '0 4px 14px rgba(2, 132, 199, 0.35)'
                    }}
                  >
                    <Sparkles size={15} />
                    <span>Choose Subscription Plan & Register</span>
                    <ArrowRight size={14} />
                  </button>
                </div>
              </div>
            </div>
          ) : errorMessage ? (
            <div style={{
              background: '#fef2f2',
              border: '1px solid #fecaca',
              color: '#b91c1c',
              padding: '10px 14px',
              borderRadius: '10px',
              fontSize: '13px',
              marginBottom: '18px',
              fontWeight: 600
            }}>
              ⚠️ {errorMessage}
            </div>
          ) : null}

          <form onSubmit={handleLoginSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                {'Corporate Email Address'}
              </label>
              <div style={{ position: 'relative' }}>
                <Mail size={16} color="#94a3b8" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@yourcompany.com"
                  style={{
                    width: '100%',
                    padding: '12px 14px 12px 38px',
                    borderRadius: '10px',
                    border: '1px solid #cbd5e1',
                    fontSize: '14px',
                    outline: 'none',
                    boxSizing: 'border-box'
                  }}
                />
              </div>
            </div>

            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                <label style={{ fontSize: '12px', fontWeight: 700, color: '#334155' }}>
                  {'Password'}
                </label>
                <span style={{ fontSize: '11px', color: '#0284c7', cursor: 'pointer', fontWeight: 600 }}>
                  {'Forgot?'}
                </span>
              </div>
              <div style={{ position: 'relative' }}>
                <Lock size={16} color="#94a3b8" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  style={{
                    width: '100%',
                    padding: '12px 40px 12px 38px',
                    borderRadius: '10px',
                    border: '1px solid #cbd5e1',
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
                    right: '12px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    color: '#94a3b8',
                    cursor: 'pointer',
                    padding: 0
                  }}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              style={{
                marginTop: '6px',
                padding: '14px',
                borderRadius: '12px',
                border: 'none',
                background: 'linear-gradient(135deg, #0f172a, #1e293b)',
                color: '#ffffff',
                fontWeight: 800,
                fontSize: '14px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                cursor: isLoading ? 'not-allowed' : 'pointer',
                boxShadow: '0 8px 20px rgba(15, 23, 42, 0.2)',
                transition: 'all 0.15s ease'
              }}
            >
              <Lock size={16} />
              <span>{isLoading ? 'Verifying Subscription...' : 'Verify Subscription & Log In'}</span>
              <ArrowRight size={16} />
            </button>
          </form>



          {/* New Company Registration CTA */}
          <div style={{ marginTop: '20px', textAlign: 'center', fontSize: '13px', color: '#64748b' }}>
            <span>{"Need a subscription for your team?"}{' '}</span>
            <button
              type="button"
              onClick={() => {
                onClose();
                onOpenRegister();
              }}
              style={{
                background: 'none',
                border: 'none',
                color: '#0284c7',
                fontWeight: 800,
                cursor: 'pointer',
                padding: 0,
                textDecoration: 'underline'
              }}
            >
              {'Choose Plan & Register'}
            </button>
          </div>

        </div>

      </div>
    </div>
  );
};
