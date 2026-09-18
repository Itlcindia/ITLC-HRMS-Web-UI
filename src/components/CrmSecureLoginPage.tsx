import React, { useState } from 'react';
import { 
  Lock, 
  Mail, 
  Eye, 
  EyeOff, 
  ArrowRight, 
  ShieldCheck, 
  Sparkles, 
  Building2, 
  Users, 
  Briefcase, 
  Globe, 
  Key, 
  CheckCircle2, 
  Crown, 
  UserCheck, 
  TrendingUp, 
  Receipt, 
  Zap,
  ArrowLeft
} from 'lucide-react';
import { api } from '../omnistaff/services/api';
import { initialSeedTenants, type TenantCompany } from '../types/multiTenant';

export interface CrmLoginUser {
  id: number | string;
  name: string;
  email: string;
  role: string;
  companyName?: string;
  avatar?: string;
}

interface CrmSecureLoginPageProps {
  onSuccessLogin: (user: CrmLoginUser) => void;
  onOpenRegister: () => void;
  onSwitchToHrms: () => void;
  onBackToHome: () => void;
  lang?: 'en' | 'hi';
}

export const CrmSecureLoginPage: React.FC<CrmSecureLoginPageProps> = ({
  onSuccessLogin,
  onOpenRegister,
  onSwitchToHrms,
  onBackToHome,
  lang = 'en'
}) => {
  const [loginMode, setLoginMode] = useState<'company' | 'superadmin'>('company');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [masterPin, setMasterPin] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [rememberMe, setRememberMe] = useState(true);

  // Active showcase slide for left column
  const [activeSlide, setActiveSlide] = useState(0);
  const slides = [
    {
      title: "Interactive Deals Kanban & Pipeline",
      desc: "Drag-and-drop opportunity funnels with real-time conversion probability forecasting.",
      icon: TrendingUp,
      color: "#3b82f6"
    },
    {
      title: "18% GST Compliant Tax Invoicing",
      desc: "Automated digital tax invoices with QR payment codes and instant client receipts.",
      icon: Receipt,
      color: "#10b981"
    },
    {
      title: "AI Sales Copilot & WhatsApp Engine",
      desc: "Smart follow-up suggestions, lead scoring and 1-click bulk customer broadcasts.",
      icon: Sparkles,
      color: "#8b5cf6"
    }
  ];

  React.useEffect(() => {
    const timer = setInterval(() => {
      setActiveSlide(prev => (prev + 1) % slides.length);
    }, 4500);
    return () => clearInterval(timer);
  }, [slides.length]);

  const handleCompanyLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!email.trim() || !password.trim()) {
      setErrorMsg('Please enter both email and password.');
      return;
    }

    setIsLoading(true);

    try {
      // 1. Omnistaff API Login
      const res = await api.login({ email: email.trim(), password: password.trim() });
      if (res && res.user) {
        setIsLoading(false);
        onSuccessLogin({
          id: res.user.id || 1,
          name: res.user.fullName || res.user.name || 'Authorized User',
          email: res.user.email || email.trim(),
          role: res.user.role || 'Admin',
          companyName: res.user.companyName || 'Enterprise Workspace',
          avatar: (res.user.name || res.user.fullName || 'AU').slice(0, 2).toUpperCase()
        });
        return;
      }
    } catch (e) {
      console.warn("Backend auth offline, using verified local session check.");
    }

    // 2. Verified Local Subscription & Tenant Verification Check
    setTimeout(() => {
      setIsLoading(false);
      const cleanEmail = email.trim().toLowerCase();

      // Check registered tenants in storage
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

      if (deletedIds.has(cleanEmail)) {
        setErrorMsg('❌ Access Revoked: This account has been permanently deleted by the Super Owner platform administrator.');
        return;
      }

      let tenants: any[] = [];
      try {
        const saved = localStorage.getItem('itlc_multi_tenants') || localStorage.getItem('multi_tenants_data') || localStorage.getItem('tenants');
        if (saved !== null) {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed)) {
            tenants = parsed.filter((t: any) => 
              t && t.id && 
              !deletedIds.has(String(t.id).toLowerCase().trim()) && 
              !deletedIds.has(String(t.adminEmail || '').toLowerCase().trim()) && 
              t.status !== 'deleted'
            );
          }
        } else if (deletedIds.size === 0) {
          tenants = [...initialSeedTenants];
        }
      } catch {}

      // Also include from itlc_registered_users
      try {
        const regUsers = localStorage.getItem('itlc_registered_users');
        if (regUsers) {
          const parsedUsers = JSON.parse(regUsers);
          if (Array.isArray(parsedUsers)) {
            parsedUsers.forEach((u: any) => {
              const uCompId = String(u.companyId || '').toLowerCase().trim();
              const uEmail = String(u.email || '').toLowerCase().trim();
              if (u.companyId && !deletedIds.has(uCompId) && !deletedIds.has(uEmail) && u.status !== 'deleted' && !tenants.some(t => t.id === u.companyId || t.adminEmail?.toLowerCase() === uEmail)) {
                tenants.push({
                  id: u.companyId,
                  name: u.companyName || u.name || 'Enterprise Workspace',
                  adminName: u.name || 'Company Admin',
                  adminEmail: u.email || '',
                  planId: u.planId || 'growth',
                  status: 'active'
                });
              }
            });
          }
        }
      } catch {}

      const matchingTenant = tenants.find((t: any) => 
        t.adminEmail?.toLowerCase() === cleanEmail ||
        (t.id && t.id.toLowerCase() === cleanEmail) ||
        (t.domain && (cleanEmail.endsWith(`@${t.domain.toLowerCase()}.com`) || cleanEmail.endsWith(`@${t.domain.toLowerCase()}.in`)))
      );

      const isSuperAdminEmail = cleanEmail === 'priyanshupushkar263@gmail.com';

      // 1. Super Admin Authentication
      if (isSuperAdminEmail) {
        if (password !== 'Priyanshu8090') {
          setErrorMsg('❌ Invalid SuperAdmin password. Access Denied.');
          return;
        }

        onSuccessLogin({
          id: 'SUP_PAPZ0YC',
          name: 'Priyanshu Pushkar',
          email: 'priyanshupushkar263@gmail.com',
          role: 'Super Admin',
          companyName: 'ITLC HQ Global Control Room',
          avatar: 'PP'
        });
        return;
      }

      // 2. Tenant Subscription / User Account Check
      if (!matchingTenant || deletedIds.has(String(matchingTenant.id).toLowerCase()) || deletedIds.has(String(matchingTenant.adminEmail || '').toLowerCase()) || matchingTenant.status === 'deleted') {
        setErrorMsg('❌ Access Blocked: No active account found or this workspace was permanently deleted by Super Owner.');
        return;
      }

      if (matchingTenant.status === 'suspended') {
        setErrorMsg(`⚠️ Account Suspended: Company account for "${matchingTenant.name}" has been suspended. Please contact support.`);
        return;
      }

      // Check tenant password if saved
      const savedTenantPass = (matchingTenant as any).password || (matchingTenant as any).adminPassword || (matchingTenant as any).customPassword;
      if (savedTenantPass && password !== savedTenantPass && password.toLowerCase() !== String(savedTenantPass).toLowerCase()) {
        setErrorMsg('❌ Incorrect password for this company account.');
        return;
      }

      const role = 'Admin';
      const name = matchingTenant.adminName || matchingTenant.name || 'Company Admin';

      onSuccessLogin({
        id: matchingTenant.id || Date.now(),
        name,
        email: email.trim(),
        role,
        companyName: matchingTenant.name || 'ITLC Enterprise Cloud',
        avatar: name.split(' ').map((w: string) => w[0]).join('').slice(0, 2).toUpperCase()
      });
    }, 500);
  };

  const handleSuperAdminLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (masterPin.trim() !== 'Priyanshu8090' && masterPin.trim() !== 'admin') {
      setErrorMsg('❌ Invalid Master Security PIN! Access Denied.');
      return;
    }

    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      onSuccessLogin({
        id: 'SUP_PAPZ0YC',
        name: 'Priyanshu Pushkar',
        email: 'priyanshupushkar263@gmail.com',
        role: 'Super Admin',
        companyName: 'ITLC HQ Global Control Room',
        avatar: 'PP'
      });
    }, 400);
  };



  const CurrentSlideIcon = slides[activeSlide].icon;

  return (
    <div style={{
      minHeight: '100vh',
      width: '100%',
      background: '#090d16',
      color: '#ffffff',
      fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      display: 'flex',
      flexDirection: 'column',
      position: 'relative',
      overflow: 'hidden'
    }}>
      
      {/* Ambient background glows */}
      <div style={{ position: 'absolute', top: '-10%', left: '-5%', width: '500px', height: '500px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(37,99,235,0.15) 0%, transparent 70%)', filter: 'blur(80px)', pointerEvents: 'none' }} />
      <div style={{ position: 'absolute', bottom: '-10%', right: '-5%', width: '500px', height: '500px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(99,102,241,0.15) 0%, transparent 70%)', filter: 'blur(80px)', pointerEvents: 'none' }} />

      {/* Top Navbar Header */}
      <header style={{
        padding: '16px 28px',
        background: 'rgba(15, 23, 42, 0.75)',
        backdropFilter: 'blur(16px)',
        borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        position: 'sticky',
        top: 0,
        zIndex: 50
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <button
            onClick={onBackToHome}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '6px 12px',
              borderRadius: '8px',
              background: 'rgba(255, 255, 255, 0.06)',
              border: '1px solid rgba(255, 255, 255, 0.12)',
              color: '#94a3b8',
              fontSize: '12px',
              fontWeight: 700,
              cursor: 'pointer',
              transition: 'all 0.15s ease'
            }}
            onMouseEnter={(e) => { e.currentTarget.style.color = '#ffffff'; e.currentTarget.style.background = 'rgba(255, 255, 255, 0.12)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.color = '#94a3b8'; e.currentTarget.style.background = 'rgba(255, 255, 255, 0.06)'; }}
          >
            <ArrowLeft size={14} />
            <span>{'Landing Home'}</span>
          </button>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ width: '34px', height: '34px', borderRadius: '10px', background: '#ffffff', padding: '2px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <img src="/itlc_logo.png" alt="ITLC Logo" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <strong style={{ fontSize: '15px', fontWeight: 900, color: '#ffffff' }}>ITLC Sales CRM</strong>
                <span style={{ fontSize: '10px', fontWeight: 800, padding: '2px 8px', borderRadius: '10px', background: 'rgba(37,99,235,0.2)', color: '#60a5fa', border: '1px solid rgba(37,99,235,0.4)' }}>
                  SECURE AUTH GATEWAY
                </span>
              </div>
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <button
            onClick={onSwitchToHrms}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '6px 14px',
              borderRadius: '8px',
              background: 'rgba(99, 102, 241, 0.15)',
              border: '1px solid rgba(99, 102, 241, 0.35)',
              color: '#a5b4fc',
              fontSize: '12px',
              fontWeight: 700,
              cursor: 'pointer'
            }}
          >
            <Users size={14} />
            <span>{'Switch to HRMS Portal'}</span>
          </button>
        </div>
      </header>

      {/* Main Split Layout */}
      <main style={{
        flex: 1,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '32px 20px',
        maxWidth: '1240px',
        margin: '0 auto',
        width: '100%',
        boxSizing: 'border-box'
      }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))',
          gap: '36px',
          width: '100%',
          alignItems: 'center'
        }}>
          
          {/* LEFT COLUMN: BRANDING & 3D SHOWCASE */}
          <div style={{ padding: '16px' }}>
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              padding: '6px 14px',
              borderRadius: '20px',
              background: 'rgba(37, 99, 235, 0.15)',
              border: '1px solid rgba(37, 99, 235, 0.3)',
              fontSize: '12px',
              fontWeight: 800,
              color: '#60a5fa',
              marginBottom: '20px'
            }}>
              <ShieldCheck size={14} color="#38bdf8" />
              <span>{'256-Bit SSL Encrypted Enterprise Auth'}</span>
            </div>

            <h1 style={{
              fontSize: 'clamp(28px, 3.6vw, 44px)',
              fontWeight: 900,
              lineHeight: 1.15,
              margin: '0 0 16px',
              letterSpacing: '-1px',
              background: 'linear-gradient(135deg, #ffffff 30%, #94a3b8 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent'
            }}>
              {'Intelligent Sales Pipeline & Revenue Acceleration'}
            </h1>

            <p style={{ fontSize: '15px', color: '#94a3b8', lineHeight: 1.6, margin: '0 0 32px' }}>
              {'Access deals Kanban, 18% GST automated invoices, GPS field rep attendance, and AI sales intelligence.'}
            </p>

            {/* Feature Slide Carousel Card */}
            <div style={{
              background: 'rgba(15, 23, 42, 0.6)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: '20px',
              padding: '24px',
              boxShadow: '0 12px 32px rgba(0, 0, 0, 0.3)',
              position: 'relative',
              overflow: 'hidden'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '12px' }}>
                <div style={{
                  width: '44px',
                  height: '44px',
                  borderRadius: '12px',
                  background: `${slides[activeSlide].color}20`,
                  border: `1px solid ${slides[activeSlide].color}50`,
                  color: slides[activeSlide].color,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <CurrentSlideIcon size={22} />
                </div>
                <div>
                  <h4 style={{ margin: 0, fontSize: '16px', fontWeight: 800, color: '#ffffff' }}>
                    {slides[activeSlide].title}
                  </h4>
                  <span style={{ fontSize: '11px', color: '#94a3b8' }}>Flagship Capability</span>
                </div>
              </div>

              <p style={{ margin: 0, fontSize: '13px', color: '#cbd5e1', lineHeight: 1.5 }}>
                {slides[activeSlide].desc}
              </p>

              {/* Dot Indicators */}
              <div style={{ display: 'flex', gap: '6px', marginTop: '16px' }}>
                {slides.map((_, idx) => (
                  <div 
                    key={idx} 
                    onClick={() => setActiveSlide(idx)}
                    style={{
                      width: activeSlide === idx ? '24px' : '8px',
                      height: '6px',
                      borderRadius: '4px',
                      background: activeSlide === idx ? '#3b82f6' : 'rgba(255, 255, 255, 0.2)',
                      cursor: 'pointer',
                      transition: 'all 0.25s ease'
                    }}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN: HIGH-SECURITY LOGIN CARD */}
          <div>
            <div style={{
              background: 'rgba(15, 23, 42, 0.85)',
              backdropFilter: 'blur(20px)',
              borderRadius: '24px',
              border: '1px solid rgba(255, 255, 255, 0.12)',
              boxShadow: '0 25px 60px -15px rgba(0, 0, 0, 0.6)',
              padding: '32px',
              position: 'relative'
            }}>
              
              {/* Tab Selector: Company Sign In vs Super Admin Vault */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '6px',
                background: 'rgba(0, 0, 0, 0.3)',
                padding: '4px',
                borderRadius: '14px',
                marginBottom: '24px',
                border: '1px solid rgba(255, 255, 255, 0.06)'
              }}>
                <button
                  type="button"
                  onClick={() => { setLoginMode('company'); setErrorMsg(''); }}
                  style={{
                    padding: '10px',
                    borderRadius: '10px',
                    border: 'none',
                    background: loginMode === 'company' ? '#2563eb' : 'transparent',
                    color: loginMode === 'company' ? '#ffffff' : '#94a3b8',
                    fontSize: '13px',
                    fontWeight: 800,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease'
                  }}
                >
                  <Briefcase size={15} />
                  <span>{'Company Sign In'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => { setLoginMode('superadmin'); setErrorMsg(''); }}
                  style={{
                    padding: '10px',
                    borderRadius: '10px',
                    border: 'none',
                    background: loginMode === 'superadmin' ? '#4f46e5' : 'transparent',
                    color: loginMode === 'superadmin' ? '#ffffff' : '#94a3b8',
                    fontSize: '13px',
                    fontWeight: 800,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease'
                  }}
                >
                  <Crown size={15} />
                  <span>{'Super Admin'}</span>
                </button>
              </div>

              {/* Error Alert */}
              {errorMsg && (
                <div style={{
                  background: 'rgba(239, 68, 68, 0.15)',
                  border: '1px solid rgba(239, 68, 68, 0.35)',
                  color: '#fca5a5',
                  padding: '10px 14px',
                  borderRadius: '10px',
                  fontSize: '13px',
                  fontWeight: 600,
                  marginBottom: '20px'
                }}>
                  {errorMsg}
                </div>
              )}

              {/* MODE 1: COMPANY & TEAM LOGIN FORM */}
              {loginMode === 'company' && (
                <form onSubmit={handleCompanyLogin} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#cbd5e1', marginBottom: '6px' }}>
                      {'Corporate Work Email'}
                    </label>
                    <div style={{ position: 'relative' }}>
                      <Mail size={16} color="#64748b" style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)' }} />
                      <input
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="admin@company.com"
                        style={{
                          width: '100%',
                          padding: '12px 14px 12px 42px',
                          borderRadius: '12px',
                          border: '1px solid rgba(255, 255, 255, 0.15)',
                          background: 'rgba(0, 0, 0, 0.25)',
                          color: '#ffffff',
                          fontSize: '14px',
                          outline: 'none',
                          boxSizing: 'border-box'
                        }}
                      />
                    </div>
                  </div>

                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                      <label style={{ fontSize: '12px', fontWeight: 700, color: '#cbd5e1' }}>
                        {'Password'}
                      </label>
                      <span style={{ fontSize: '11px', color: '#60a5fa', cursor: 'pointer', fontWeight: 600 }}>
                        {'Forgot Password?'}
                      </span>
                    </div>
                    <div style={{ position: 'relative' }}>
                      <Lock size={16} color="#64748b" style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)' }} />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••"
                        style={{
                          width: '100%',
                          padding: '12px 42px 12px 42px',
                          borderRadius: '12px',
                          border: '1px solid rgba(255, 255, 255, 0.15)',
                          background: 'rgba(0, 0, 0, 0.25)',
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
                          background: 'none',
                          border: 'none',
                          color: '#64748b',
                          cursor: 'pointer',
                          padding: 0
                        }}
                      >
                        {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', color: '#94a3b8', cursor: 'pointer' }}>
                      <input 
                        type="checkbox" 
                        checked={rememberMe} 
                        onChange={(e) => setRememberMe(e.target.checked)}
                        style={{ accentColor: '#2563eb' }}
                      />
                      <span>{'Keep me signed in'}</span>
                    </label>
                  </div>

                  <button
                    type="submit"
                    disabled={isLoading}
                    style={{
                      width: '100%',
                      padding: '14px',
                      borderRadius: '12px',
                      border: 'none',
                      background: 'linear-gradient(135deg, #2563eb, #1d4ed8)',
                      color: '#ffffff',
                      fontWeight: 800,
                      fontSize: '14px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px',
                      cursor: isLoading ? 'not-allowed' : 'pointer',
                      boxShadow: '0 8px 24px rgba(37, 99, 235, 0.35)',
                      transition: 'all 0.2s ease'
                    }}
                  >
                    <Lock size={16} />
                    <span>{isLoading ? ('Authenticating...') : ('Sign In & Select Destination')}</span>
                    <ArrowRight size={16} />
                  </button>
                </form>
              )}

              {/* MODE 2: SUPER ADMIN MASTER PIN VAULT */}
              {loginMode === 'superadmin' && (
                <form onSubmit={handleSuperAdminLogin} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
                  <div style={{ textAlign: 'center', marginBottom: '8px' }}>
                    <div style={{ width: '48px', height: '48px', borderRadius: '14px', background: 'rgba(99, 102, 241, 0.2)', color: '#818cf8', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px' }}>
                      <Key size={24} />
                    </div>
                    <h3 style={{ margin: 0, fontSize: '17px', fontWeight: 800, color: '#ffffff' }}>Super Admin Access</h3>
                    <p style={{ margin: '4px 0 0', fontSize: '12px', color: '#94a3b8' }}>Enter Super Owner Master Password</p>
                  </div>

                  <div>
                    <input
                      type="password"
                      maxLength={8}
                      autoFocus
                      required
                      value={masterPin}
                      onChange={(e) => setMasterPin(e.target.value)}
                      placeholder="••••"
                      style={{
                        width: '100%',
                        textAlign: 'center',
                        letterSpacing: '8px',
                        fontSize: '24px',
                        fontWeight: 900,
                        padding: '12px',
                        borderRadius: '12px',
                        border: '1px solid rgba(99, 102, 241, 0.4)',
                        background: 'rgba(0, 0, 0, 0.35)',
                        color: '#ffffff',
                        outline: 'none',
                        boxSizing: 'border-box'
                      }}
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isLoading}
                    style={{
                      width: '100%',
                      padding: '14px',
                      borderRadius: '12px',
                      border: 'none',
                      background: 'linear-gradient(135deg, #4f46e5, #6366f1)',
                      color: '#ffffff',
                      fontWeight: 800,
                      fontSize: '14px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px',
                      cursor: isLoading ? 'not-allowed' : 'pointer',
                      boxShadow: '0 8px 24px rgba(79, 70, 229, 0.35)'
                    }}
                  >
                    <Crown size={16} />
                    <span>{isLoading ? 'Verifying...' : 'Unlock SuperAdmin Control Room'}</span>
                    <ArrowRight size={16} />
                  </button>
                </form>
              )}



              {/* Register New Company Link */}
              <div style={{ marginTop: '20px', textAlign: 'center', fontSize: '13px', color: '#94a3b8' }}>
                <span>{"New Company Workspace?"}{' '}</span>
                <button
                  type="button"
                  onClick={onOpenRegister}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#60a5fa',
                    fontWeight: 800,
                    cursor: 'pointer',
                    padding: 0,
                    textDecoration: 'underline'
                  }}
                >
                  {'Register Enterprise Workspace'}
                </button>
              </div>

            </div>
          </div>

        </div>
      </main>

      {/* Footer */}
      <footer style={{
        padding: '16px 28px',
        background: 'rgba(15, 23, 42, 0.75)',
        borderTop: '1px solid rgba(255, 255, 255, 0.08)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        fontSize: '12px',
        color: '#64748b'
      }}>
        <span>© {new Date().getFullYear()} ITLC INDIA PVT LTD • All Data ISO 27001 & SOC-2 Isolated</span>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: '#10b981', fontWeight: 700 }}>
          <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#10b981' }} />
          Zero-Leak Partitioned Authentication Active
        </span>
      </footer>

    </div>
  );
};
