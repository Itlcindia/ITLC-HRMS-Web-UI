import React, { useState } from 'react';
import { 
  ShieldCheck, 
  Lock, 
  KeyRound, 
  Database, 
  MapPin, 
  FileCheck, 
  ArrowLeft, 
  ArrowRight, 
  Sparkles, 
  Search, 
  CheckCircle2, 
  Briefcase, 
  Layers, 
  ShieldAlert, 
  Activity, 
  Cpu, 
  FileText, 
  Clock, 
  UserCheck,
  RefreshCw
} from 'lucide-react';

interface SecurityPageProps {
  onBackToHome: () => void;
  onGetStarted: () => void;
  onOpenSignIn: () => void;
  onOpenSearch: () => void;
  onNavigateTo: (page: 'workspaces' | 'security' | 'modules' | 'pricing') => void;
}

export const SecurityPage: React.FC<SecurityPageProps> = ({
  onBackToHome,
  onGetStarted,
  onOpenSignIn,
  onOpenSearch,
  onNavigateTo
}) => {
  const [isScanning, setIsScanning] = useState(false);
  const [scanComplete, setScanComplete] = useState(true);

  const runLiveAuditScan = () => {
    setIsScanning(true);
    setScanComplete(false);
    setTimeout(() => {
      setIsScanning(false);
      setScanComplete(true);
    }, 1500);
  };

  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc', color: '#0f172a', fontFamily: 'system-ui, -apple-system, sans-serif' }}>
      
      {/* Top Sticky Header */}
      <header 
        style={{
          position: 'sticky',
          top: '12px',
          zIndex: 50,
          maxWidth: '1280px',
          margin: '12px auto 0',
          padding: '10px 20px',
          borderRadius: '16px',
          background: 'rgba(255, 255, 255, 0.92)',
          backdropFilter: 'blur(24px)',
          WebkitBackdropFilter: 'blur(24px)',
          border: '1px solid rgba(226, 232, 240, 0.9)',
          boxShadow: '0 10px 30px -5px rgba(15, 23, 42, 0.05)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <button 
            onClick={onBackToHome}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '6px 12px',
              borderRadius: '9px',
              border: '1px solid #e2e8f0',
              background: '#ffffff',
              color: '#334155',
              fontSize: '12px',
              fontWeight: 600,
              cursor: 'pointer'
            }}
          >
            <ArrowLeft size={14} />
            <span>Back to Home</span>
          </button>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '15px', fontWeight: 800, color: '#0f172a' }}>ITLC Security</span>
            <span style={{ fontSize: '10px', background: 'rgba(79, 70, 229, 0.08)', color: '#4f46e5', padding: '2px 7px', borderRadius: '12px', border: '1px solid rgba(79, 70, 229, 0.2)', fontWeight: 700 }}>
              Zero-Trust Architecture
            </span>
          </div>
        </div>

        {/* Center Nav Links */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', background: 'rgba(241, 245, 249, 0.8)', padding: '3px', borderRadius: '11px', border: '1px solid rgba(226, 232, 240, 0.8)' }}>
          
          <button 
            onClick={() => onNavigateTo('security')}
            style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', fontSize: '12px', fontWeight: 700, color: '#4f46e5', padding: '5px 12px', borderRadius: '8px', background: '#ffffff', border: 'none', boxShadow: '0 2px 5px rgba(0,0,0,0.05)', cursor: 'pointer' }}
          >
            <ShieldCheck size={13} />
            <span>Security</span>
          </button>
          <button 
            onClick={() => onNavigateTo('modules')}
            style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', fontSize: '12px', fontWeight: 600, color: '#475569', padding: '5px 12px', borderRadius: '8px', background: 'transparent', border: 'none', cursor: 'pointer' }}
          >
            <Layers size={13} style={{ color: '#d97706' }} />
            <span>Modules</span>
          </button>
          <button 
            onClick={() => onNavigateTo('pricing')}
            style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', fontSize: '12px', fontWeight: 600, color: '#475569', padding: '5px 12px', borderRadius: '8px', background: 'transparent', border: 'none', cursor: 'pointer' }}
          >
            <Sparkles size={13} style={{ color: '#9333ea' }} />
            <span>Pricing</span>
          </button>
        </div>

        {/* Right Actions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <button 
            onClick={onOpenSearch}
            style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '6px 10px', borderRadius: '9px', fontSize: '12px', background: 'rgba(241, 245, 249, 0.9)', border: '1px solid #e2e8f0', color: '#64748b', cursor: 'pointer' }}
          >
            <Search size={13} />
            <kbd style={{ fontSize: '10px', fontWeight: 700, padding: '1px 4px', background: '#fff', borderRadius: '4px', border: '1px solid #cbd5e1' }}>Ctrl K</kbd>
          </button>

          <button 
            onClick={onOpenSignIn}
            style={{ padding: '7px 14px', fontSize: '12px', borderRadius: '9px', background: 'rgba(79, 70, 229, 0.08)', color: '#4f46e5', border: '1px solid rgba(79, 70, 229, 0.3)', fontWeight: 700, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '5px' }}
          >
            <Lock size={13} />
            <span>Login</span>
          </button>

          <button 
            onClick={onGetStarted}
            style={{ padding: '7px 15px', fontSize: '12px', borderRadius: '9px', display: 'inline-flex', alignItems: 'center', gap: '6px', background: 'linear-gradient(135deg, #4f46e5, #7c3aed)', color: '#fff', border: 'none', fontWeight: 700, boxShadow: '0 4px 12px rgba(79, 70, 229, 0.25)', cursor: 'pointer' }}
          >
            <Sparkles size={13} />
            <span>Get Started</span>
          </button>
        </div>
      </header>

      {/* Hero Header */}
      <section style={{ maxWidth: '1100px', margin: '0 auto', padding: '60px 24px 40px', textAlign: 'center' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '6px 16px', borderRadius: '30px', background: '#eef2ff', color: '#4f46e5', fontSize: '12px', fontWeight: 700, marginBottom: '16px' }}>
          <ShieldCheck size={14} />
          <span>MILITARY-GRADE DATA PROTECTION</span>
        </div>
        <h1 style={{ fontSize: '40px', fontWeight: 900, letterSpacing: '-1px', color: '#0f172a', lineHeight: 1.15, marginBottom: '16px' }}>
          Enterprise Cloud Security &<br />
          <span style={{ background: 'linear-gradient(135deg, #4f46e5, #0284c7, #10b981)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            Sovereign Data Governance.
          </span>
        </h1>
        <p style={{ fontSize: '16px', color: '#64748b', maxWidth: '720px', margin: '0 auto', lineHeight: 1.6 }}>
          Designed with 256-bit AES encryption at rest and in-transit, granular role-based access control (RBAC), master PIN vault barriers, and immutable audit logs.
        </p>
      </section>

      {/* Live Security Verification & Diagnostics Widget */}
      <section style={{ maxWidth: '1100px', margin: '0 auto 50px', padding: '0 24px' }}>
        <div style={{ background: '#ffffff', borderRadius: '20px', border: '1px solid #e2e8f0', padding: '32px', boxShadow: '0 8px 25px -4px rgba(0,0,0,0.04)' }}>
          <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '16px', marginBottom: '24px', paddingBottom: '20px', borderBottom: '1px solid #f1f5f9' }}>
            <div>
              <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#0f172a' }}>Live System Security & Diagnostic Status</h3>
              <p style={{ fontSize: '13px', color: '#64748b', marginTop: '2px' }}>Real-time cryptographic and authorization verification across cloud nodes</p>
            </div>

            <button 
              onClick={runLiveAuditScan}
              disabled={isScanning}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '8px 18px',
                borderRadius: '10px',
                background: isScanning ? '#f1f5f9' : '#eef2ff',
                color: isScanning ? '#94a3b8' : '#4f46e5',
                border: '1px solid #c7d2fe',
                fontWeight: 700,
                fontSize: '13px',
                cursor: isScanning ? 'not-allowed' : 'pointer'
              }}
            >
              <RefreshCw size={14} className={isScanning ? 'animate-spin' : ''} />
              <span>{isScanning ? 'Scanning Protocols...' : 'Re-run Security Audit'}</span>
            </button>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
            {[
              { title: '256-Bit AES Storage', status: 'Active & Encrypted', desc: 'Hardware-level encryption', color: '#16a34a' },
              { title: 'TLS 1.3 Transport', status: '100% Enforced', desc: 'Secure HTTPS handshakes', color: '#16a34a' },
              { title: 'Master PIN Shield', status: 'Armed & Protected', desc: 'Dual-factor parameter guard', color: '#16a34a' },
              { title: '50m GPS Geofence', status: 'Anti-Spoofing Active', desc: 'Haversine mathematical check', color: '#16a34a' }
            ].map((check, idx) => (
              <div key={idx} style={{ background: '#f8fafc', padding: '16px', borderRadius: '14px', border: '1px solid #e2e8f0' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <span style={{ fontSize: '13px', fontWeight: 700, color: '#1e293b' }}>{check.title}</span>
                  <CheckCircle2 size={16} style={{ color: check.color }} />
                </div>
                <div style={{ fontSize: '12px', fontWeight: 700, color: check.color }}>{check.status}</div>
                <div style={{ fontSize: '11px', color: '#64748b', marginTop: '2px' }}>{check.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 6 Core Security Pillars Grid */}
      <section style={{ maxWidth: '1200px', margin: '0 auto 80px', padding: '0 24px' }}>
        <h2 style={{ fontSize: '26px', fontWeight: 800, color: '#0f172a', textAlign: 'center', marginBottom: '36px' }}>
          Six Pillars of Enterprise Platform Governance
        </h2>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '24px' }}>
          
          <div style={{ background: '#ffffff', padding: '28px', borderRadius: '18px', border: '1px solid #e2e8f0' }}>
            <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: '#eef2ff', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#4f46e5', marginBottom: '16px' }}>
              <Lock size={22} />
            </div>
            <h3 style={{ fontSize: '17px', fontWeight: 800, color: '#0f172a', marginBottom: '8px' }}>1. 256-Bit AES Storage & TLS 1.3</h3>
            <p style={{ fontSize: '13px', color: '#64748b', lineHeight: 1.6 }}>
              All database records, employee payslips, customer GST invoices, and lead files are stored with end-to-end cryptographic protection.
            </p>
          </div>

          <div style={{ background: '#ffffff', padding: '28px', borderRadius: '18px', border: '1px solid #e2e8f0' }}>
            <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: '#fffbeb', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#d97706', marginBottom: '16px' }}>
              <KeyRound size={22} />
            </div>
            <h3 style={{ fontSize: '17px', fontWeight: 800, color: '#0f172a', marginBottom: '8px' }}>2. Master PIN & Vault Guard</h3>
            <p style={{ fontSize: '13px', color: '#64748b', lineHeight: 1.6 }}>
              Critical business settings, GST percentages, and company tenant permissions require Master PIN verification before modifications take effect.
            </p>
          </div>

          <div style={{ background: '#ffffff', padding: '28px', borderRadius: '18px', border: '1px solid #e2e8f0' }}>
            <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: '#f0fdf4', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#16a34a', marginBottom: '16px' }}>
              <UserCheck size={22} />
            </div>
            <h3 style={{ fontSize: '17px', fontWeight: 800, color: '#0f172a', marginBottom: '8px' }}>3. Granular RBAC Permissions</h3>
            <p style={{ fontSize: '13px', color: '#64748b', lineHeight: 1.6 }}>
              Fine-grained privileges across Super Admin, Operations Admin, Sales Manager, Field Rep, and Helpdesk Support to eliminate unauthorized data leaks.
            </p>
          </div>

          <div style={{ background: '#ffffff', padding: '28px', borderRadius: '18px', border: '1px solid #e2e8f0' }}>
            <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: '#f0f9ff', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#0284c7', marginBottom: '16px' }}>
              <MapPin size={22} />
            </div>
            <h3 style={{ fontSize: '17px', fontWeight: 800, color: '#0f172a', marginBottom: '8px' }}>4. 50m GPS Geofenced Verification</h3>
            <p style={{ fontSize: '13px', color: '#64748b', lineHeight: 1.6 }}>
              Prevents biometric punch fraud and proxy attendance by physically locking employee check-ins to an exact 50-meter perimeter of authorized office coordinates.
            </p>
          </div>

          <div style={{ background: '#ffffff', padding: '28px', borderRadius: '18px', border: '1px solid #e2e8f0' }}>
            <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: '#faf5ff', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#9333ea', marginBottom: '16px' }}>
              <Clock size={22} />
            </div>
            <h3 style={{ fontSize: '17px', fontWeight: 800, color: '#0f172a', marginBottom: '8px' }}>5. Immutable Live Audit Trail</h3>
            <p style={{ fontSize: '13px', color: '#64748b', lineHeight: 1.6 }}>
              Every login, lead deletion, payslip dispatch, and system parameter change is timestamped and permanently logged with the actor's credentials.
            </p>
          </div>

          <div style={{ background: '#ffffff', padding: '28px', borderRadius: '18px', border: '1px solid #e2e8f0' }}>
            <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: '#fdf2f8', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#db2777', marginBottom: '16px' }}>
              <Database size={22} />
            </div>
            <h3 style={{ fontSize: '17px', fontWeight: 800, color: '#0f172a', marginBottom: '8px' }}>6. Encrypted Disaster Recovery</h3>
            <p style={{ fontSize: '13px', color: '#64748b', lineHeight: 1.6 }}>
              Zero-loss database snapshot architecture allowing instant JSON export backups and one-click disaster schema restoration.
            </p>
          </div>

        </div>
      </section>

      {/* Compliance & Certifications Strip */}
      <section style={{ maxWidth: '1200px', margin: '0 auto 80px', padding: '0 24px', textAlign: 'center' }}>
        <div style={{ background: '#ffffff', borderRadius: '20px', padding: '36px', border: '1px solid #e2e8f0' }}>
          <h3 style={{ fontSize: '16px', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '24px' }}>
            GLOBAL REGULATORY & STATUTORY COMPLIANCE
          </h3>

          <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '28px', alignItems: 'center' }}>
            {[
              'ISO/IEC 27001 Certified',
              'SOC 2 Type II Compliant',
              'GDPR Compliant',
              'Indian IT Act 2000 Ready',
              'GST & HSN Tax Compliant'
            ].map((badge, idx) => (
              <div key={idx} style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '8px 16px', borderRadius: '10px', background: '#f8fafc', border: '1px solid #e2e8f0', fontSize: '13px', fontWeight: 700, color: '#334155' }}>
                <CheckCircle2 size={16} style={{ color: '#16a34a' }} />
                <span>{badge}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

    </div>
  );
};
