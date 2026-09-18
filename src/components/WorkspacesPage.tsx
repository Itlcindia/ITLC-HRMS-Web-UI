import React from 'react';
import { LandingHeader } from './LandingHeader';
import { LandingFooter } from './LandingFooter';
import { 
  Briefcase, 
  Building2, 
  ShieldCheck, 
  Sparkles, 
  ArrowRight, 
  CheckCircle2, 
  Layers, 
  Activity, 
  Users, 
  BarChart3, 
  FileText, 
  MapPin, 
  MessageSquare,
  Lock,
  Database,
  Cpu
} from 'lucide-react';

interface WorkspacesPageProps {
  onBackToHome: () => void;
  onExploreCrm: () => void;
  onExploreHrms: () => void;
  onExploreSuperAdmin: () => void;
  onGetStarted: () => void;
  onOpenSignIn: () => void;
  onOpenSearch: () => void;
  onNavigateTo: (page: 'workspaces' | 'security' | 'modules' | 'pricing') => void;
}

export const WorkspacesPage: React.FC<WorkspacesPageProps> = ({
  onBackToHome,
  onExploreCrm,
  onExploreHrms,
  onExploreSuperAdmin,
  onGetStarted,
  onOpenSignIn,
  onOpenSearch,
  onNavigateTo
}) => {
  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc', color: '#0f172a', fontFamily: 'system-ui, -apple-system, sans-serif' }}>
      
      <LandingHeader
        onHome={onBackToHome}
        onFeatures={() => onNavigateTo('modules')}
        onPricing={() => onNavigateTo('pricing')}
        onSolutions={() => onNavigateTo('workspaces')}
        onSecurity={() => onNavigateTo('security')}
        onLogin={onOpenSignIn}
        onGetStarted={onGetStarted}
      />

      {/* Hero Header Section */}
      <section style={{ maxWidth: '1100px', margin: '0 auto', padding: '60px 24px 40px', textAlign: 'center' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '6px 16px', borderRadius: '30px', background: '#e0f2fe', color: '#0369a1', fontSize: '12px', fontWeight: 700, marginBottom: '16px' }}>
          <Briefcase size={14} />
          <span>UNIFIED MULTI-SUITE ARCHITECTURE</span>
        </div>
        <h1 style={{ fontSize: '40px', fontWeight: 900, letterSpacing: '-1px', color: '#0f172a', lineHeight: 1.15, marginBottom: '16px' }}>
          Three Powerful Workspaces.<br />
          <span style={{ background: 'linear-gradient(135deg, #0284c7, #2563eb, #7c3aed)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            One Single Intelligent Operating System.
          </span>
        </h1>
        <p style={{ fontSize: '16px', color: '#64748b', maxWidth: '720px', margin: '0 auto', lineHeight: 1.6 }}>
          Experience seamless single sign-on synchronization across Sales Pipeline Acceleration, Geofenced Workforce HRMS, and Sovereign Super Owner Multi-Tenant Control.
        </p>
      </section>

      {/* Workspaces 3-Column Showcase */}
      <section style={{ maxWidth: '1200px', margin: '0 auto 60px', padding: '0 24px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '24px' }}>
          
          {/* Workspace 1: Sales CRM */}
          <div style={{ background: '#ffffff', borderRadius: '20px', border: '1px solid #e2e8f0', padding: '32px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.04)', position: 'relative', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '4px', background: 'linear-gradient(90deg, #0284c7, #38bdf8)' }} />
            
            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
                <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: '#f0f9ff', border: '1px solid #bae6fd', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#0284c7' }}>
                  <Briefcase size={24} />
                </div>
                <span style={{ fontSize: '11px', fontWeight: 700, padding: '4px 10px', borderRadius: '20px', background: '#fef3c7', color: '#b45309', border: '1px solid #fde68a' }}>
                  ⏳ Coming Soon
                </span>
              </div>

              <h2 style={{ fontSize: '22px', fontWeight: 800, color: '#0f172a', marginBottom: '8px' }}>
                ITLC Sales CRM
              </h2>
              <p style={{ fontSize: '14px', color: '#64748b', lineHeight: 1.5, marginBottom: '24px' }}>
                High-velocity deal pipeline, CSAT mood radar, automated GST invoicing with UPI scan-to-pay, and voice dictation AI for sales representatives.
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '28px' }}>
                {[
                  'Drag & Drop Visual Kanban Pipeline',
                  'Dynamic GST Invoice PDF + QR Code Pay',
                  '1-Click WhatsApp Broadcasts & Follow-ups',
                  'AI Sales Assistant & Deal Forecasting',
                  'CSAT Client Mood & Churn Risk Radar'
                ].map((feature, idx) => (
                  <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '13px', color: '#334155' }}>
                    <CheckCircle2 size={16} style={{ color: '#0284c7', flexShrink: 0 }} />
                    <span>{feature}</span>
                  </div>
                ))}
              </div>
            </div>

            <button 
              onClick={onExploreCrm}
              style={{
                width: '100%',
                padding: '12px',
                borderRadius: '12px',
                background: '#f1f5f9',
                color: '#475569',
                border: '1px solid #cbd5e1',
                fontWeight: 700,
                fontSize: '14px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                cursor: 'pointer',
                transition: 'all 0.15s ease'
              }}
            >
              <span>Sales CRM (Coming Soon)</span>
              <Sparkles size={16} />
            </button>
          </div>

          {/* Workspace 2: OmniStaff HRMS */}
          <div style={{ background: '#ffffff', borderRadius: '20px', border: '1px solid #e2e8f0', padding: '32px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.04)', position: 'relative', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '4px', background: 'linear-gradient(90deg, #4f46e5, #818cf8)' }} />
            
            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
                <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: '#eef2ff', border: '1px solid #c7d2fe', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#4f46e5' }}>
                  <Building2 size={24} />
                </div>
                <span style={{ fontSize: '11px', fontWeight: 700, padding: '4px 10px', borderRadius: '20px', background: '#f0fdf4', color: '#16a34a', border: '1px solid #bbf7d0' }}>
                  ● Active Suite
                </span>
              </div>

              <h2 style={{ fontSize: '22px', fontWeight: 800, color: '#0f172a', marginBottom: '8px' }}>
                OmniStaff HRMS
              </h2>
              <p style={{ fontSize: '14px', color: '#64748b', lineHeight: 1.5, marginBottom: '24px' }}>
                Complete workforce operating system featuring 50m GPS Geofenced Attendance radar, 1-click payslip PDFs with WhatsApp delivery, and statutory PF/ESIC compliance.
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '28px' }}>
                {[
                  '50m GPS Geofenced Punch Radar',
                  '1-Click Automated Salary Slip (Payslip) PDF',
                  'Statutory PF, ESIC, PT, TDS Deductions',
                  'Digital Employee Document Locker',
                  'Daily Executive Evening (EOD) Digest'
                ].map((feature, idx) => (
                  <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '13px', color: '#334155' }}>
                    <CheckCircle2 size={16} style={{ color: '#4f46e5', flexShrink: 0 }} />
                    <span>{feature}</span>
                  </div>
                ))}
              </div>
            </div>

            <button 
              onClick={onExploreHrms}
              style={{
                width: '100%',
                padding: '12px',
                borderRadius: '12px',
                background: '#4f46e5',
                color: '#ffffff',
                border: 'none',
                fontWeight: 700,
                fontSize: '14px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                cursor: 'pointer',
                transition: 'all 0.15s ease'
              }}
            >
              <span>Launch OmniStaff HRMS</span>
              <ArrowRight size={16} />
            </button>
          </div>

          {/* Workspace 3: Super Owner Platform */}
          <div style={{ background: '#ffffff', borderRadius: '20px', border: '1px solid #e2e8f0', padding: '32px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.04)', position: 'relative', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '4px', background: 'linear-gradient(90deg, #d97706, #fbbf24)' }} />
            
            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
                <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: '#fffbeb', border: '1px solid #fde68a', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#d97706' }}>
                  <ShieldCheck size={24} />
                </div>
                <span style={{ fontSize: '11px', fontWeight: 700, padding: '4px 10px', borderRadius: '20px', background: '#fef3c7', color: '#b45309', border: '1px solid #fde68a' }}>
                  👑 Sovereign Hub
                </span>
              </div>

              <h2 style={{ fontSize: '22px', fontWeight: 800, color: '#0f172a', marginBottom: '8px' }}>
                Super Owner Governance
              </h2>
              <p style={{ fontSize: '14px', color: '#64748b', lineHeight: 1.5, marginBottom: '24px' }}>
                Master administrative hub offering 100% sovereign control over GST tax slabs (0%-28%), inclusive/exclusive modes, multi-tenant company provisioning, and live storage metering.
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '28px' }}>
                {[
                  'Sovereign GST Slabs (0%, 5%, 12%, 18%, 28%)',
                  'Inclusive vs Exclusive Tax Switcher',
                  'Multi-Tenant Tenant Isolation & Provisioning',
                  'Real-Time Cloud Storage (GB) Usage Meter',
                  '1-Click Disaster Database Recovery & Vault'
                ].map((feature, idx) => (
                  <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '13px', color: '#334155' }}>
                    <CheckCircle2 size={16} style={{ color: '#d97706', flexShrink: 0 }} />
                    <span>{feature}</span>
                  </div>
                ))}
              </div>
            </div>

            <button 
              onClick={onExploreSuperAdmin}
              style={{
                width: '100%',
                padding: '12px',
                borderRadius: '12px',
                background: '#d97706',
                color: '#ffffff',
                border: 'none',
                fontWeight: 700,
                fontSize: '14px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                cursor: 'pointer',
                transition: 'all 0.15s ease'
              }}
            >
              <span>Launch Super Owner Hub</span>
              <ArrowRight size={16} />
            </button>
          </div>

        </div>
      </section>

      {/* Cross-Workspace Architecture Feature Banner */}
      <section style={{ maxWidth: '1200px', margin: '0 auto 80px', padding: '0 24px' }}>
        <div style={{ background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)', borderRadius: '24px', padding: '48px', color: '#ffffff', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '40px', alignItems: 'center' }}>
          <div>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '4px 12px', borderRadius: '20px', background: 'rgba(56, 189, 248, 0.15)', color: '#38bdf8', fontSize: '12px', fontWeight: 700, marginBottom: '16px' }}>
              <Cpu size={14} />
              <span>SINGLE SIGN-ON & LIVE CROSS-SYNC</span>
            </div>
            <h3 style={{ fontSize: '28px', fontWeight: 800, lineHeight: 1.25, marginBottom: '16px' }}>
              Switch Between Suites in 1-Click Without Re-authenticating
            </h3>
            <p style={{ color: '#94a3b8', fontSize: '14px', lineHeight: 1.6, marginBottom: '24px' }}>
              Profile credentials, uploaded photos, company parameters, and audit trails automatically sync across the ecosystem with zero friction.
            </p>
            <button 
              onClick={onGetStarted}
              style={{ padding: '10px 24px', borderRadius: '10px', background: 'linear-gradient(135deg, #0284c7, #2563eb)', color: '#fff', border: 'none', fontWeight: 700, fontSize: '13px', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '8px' }}
            >
              <Sparkles size={14} />
              <span>Create Your Company Workspace</span>
            </button>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div style={{ background: 'rgba(255, 255, 255, 0.05)', padding: '20px', borderRadius: '16px', border: '1px solid rgba(255, 255, 255, 0.1)' }}>
              <Users size={24} style={{ color: '#38bdf8', marginBottom: '8px' }} />
              <div style={{ fontSize: '20px', fontWeight: 800 }}>100% SSO</div>
              <div style={{ fontSize: '12px', color: '#94a3b8', marginTop: '4px' }}>Shared session tokens</div>
            </div>
            <div style={{ background: 'rgba(255, 255, 255, 0.05)', padding: '20px', borderRadius: '16px', border: '1px solid rgba(255, 255, 255, 0.1)' }}>
              <Database size={24} style={{ color: '#818cf8', marginBottom: '8px' }} />
              <div style={{ fontSize: '20px', fontWeight: 800 }}>Encrypted</div>
              <div style={{ fontSize: '12px', color: '#94a3b8', marginTop: '4px' }}>Isolated tenant schemas</div>
            </div>
            <div style={{ background: 'rgba(255, 255, 255, 0.05)', padding: '20px', borderRadius: '16px', border: '1px solid rgba(255, 255, 255, 0.1)' }}>
              <Activity size={24} style={{ color: '#34d399', marginBottom: '8px' }} />
              <div style={{ fontSize: '20px', fontWeight: 800 }}>Real-Time</div>
              <div style={{ fontSize: '12px', color: '#94a3b8', marginTop: '4px' }}>Live storage & quota meter</div>
            </div>
            <div style={{ background: 'rgba(255, 255, 255, 0.05)', padding: '20px', borderRadius: '16px', border: '1px solid rgba(255, 255, 255, 0.1)' }}>
              <Lock size={24} style={{ color: '#fbbf24', marginBottom: '8px' }} />
              <div style={{ fontSize: '20px', fontWeight: 800 }}>RBAC Shield</div>
              <div style={{ fontSize: '12px', color: '#94a3b8', marginTop: '4px' }}>Role-based access protection</div>
            </div>
          </div>
        </div>
      </section>

      <LandingFooter onNavigate={(p) => p === 'home' ? onBackToHome() : onNavigateTo(p)} />
    </div>
  );
};
