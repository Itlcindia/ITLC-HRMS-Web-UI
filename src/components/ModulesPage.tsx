import React, { useState } from 'react';
import { 
  Layers, 
  Briefcase, 
  Building2, 
  ShieldCheck, 
  Lock,
  Sparkles, 
  ArrowLeft, 
  ArrowRight, 
  Search, 
  CheckCircle2, 
  MapPin, 
  FileText, 
  MessageSquare, 
  DollarSign, 
  Users, 
  Activity, 
  KeyRound, 
  Database, 
  Cpu, 
  Mic, 
  QrCode, 
  PhoneCall, 
  FileSpreadsheet, 
  Percent, 
  Sliders
} from 'lucide-react';

interface ModulesPageProps {
  onBackToHome: () => void;
  onExploreCrm: () => void;
  onExploreHrms: () => void;
  onExploreSuperAdmin: () => void;
  onGetStarted: () => void;
  onOpenSignIn: () => void;
  onOpenSearch: () => void;
  onNavigateTo: (page: 'workspaces' | 'security' | 'modules' | 'pricing') => void;
}

interface ModuleItem {
  id: string;
  category: 'crm' | 'hrms' | 'automations' | 'governance';
  title: string;
  badge: string;
  icon: any;
  color: string;
  bgColor: string;
  description: string;
  features: string[];
}

export const ModulesPage: React.FC<ModulesPageProps> = ({
  onBackToHome,
  onExploreCrm,
  onExploreHrms,
  onExploreSuperAdmin,
  onGetStarted,
  onOpenSignIn,
  onOpenSearch,
  onNavigateTo
}) => {
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'crm' | 'hrms' | 'automations' | 'governance'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const modulesList: ModuleItem[] = [
    {
      id: 'kanban',
      category: 'crm',
      title: 'Kanban Sales Pipeline',
      badge: 'Sales Acceleration',
      icon: Briefcase,
      color: '#0284c7',
      bgColor: '#f0f9ff',
      description: 'Visual multi-stage pipeline with drag-and-drop deal tracking, customizable deal probability, and deal closing analytics.',
      features: ['Drag & drop deal stages', 'Dynamic win probability', 'Custom currency formatting', 'Rep performance podium']
    },
    {
      id: 'geofence',
      category: 'hrms',
      title: 'GPS Geofenced Punch Radar',
      badge: 'Workforce Biometrics',
      icon: MapPin,
      color: '#4f46e5',
      bgColor: '#eef2ff',
      description: 'Physical 50-meter perimeter geofence engine utilizing the mathematical Haversine distance algorithm to prevent punch spoofing.',
      features: ['50m exact boundary threshold', 'Real-time GPS coordinate lock', 'Anti-spoofing alert system', 'Field sales meeting check-in']
    },
    {
      id: 'payslip',
      category: 'automations',
      title: '1-Click Payslip & WhatsApp Dispatch',
      badge: 'Payroll Automation',
      icon: FileText,
      color: '#16a34a',
      bgColor: '#f0fdf4',
      description: 'Instantly computes Basic, HRA, Allowances, PF, ESIC, PT, and TDS, generating an official printable PDF payslip dispatched via WhatsApp.',
      features: ['Automated Indian tax rules', 'A4 PDF with digital company seal', 'Instant WhatsApp message link', 'Zero physical paperwork']
    },
    {
      id: 'whatsapp',
      category: 'automations',
      title: 'WhatsApp Cloud Business Hub',
      badge: 'Direct Messaging',
      icon: MessageSquare,
      color: '#25d366',
      bgColor: '#f0fdf4',
      description: 'Pre-configured message templates for lead onboarding, biometric punch alerts, GST payment QR codes, and broadcast campaigns.',
      features: ['Interactive chat preview', 'URL-encoded dynamic variables', 'Bulk customer broadcast', 'Direct web & mobile launching']
    },
    {
      id: 'invoicing',
      category: 'crm',
      title: 'Dynamic GST Invoice & UPI Pay',
      badge: 'Finance & Billing',
      icon: DollarSign,
      color: '#0284c7',
      bgColor: '#f0f9ff',
      description: 'Generates compliant GST invoices with automated 50-50 CGST/SGST splitting and dynamic UPI scan-to-pay QR codes for clients.',
      features: ['Custom invoice prefix & numbering', 'Embedded Bharat UPI QR Code', 'Printable A4 PDF receipt', 'Client portal instant access']
    },
    {
      id: 'eod-digest',
      category: 'automations',
      title: 'Daily Executive EOD Digest',
      badge: 'Owner Intelligence',
      icon: Activity,
      color: '#7c3aed',
      bgColor: '#f5f3ff',
      description: 'Aggregates team attendance, won deals, total cash collection, and open support tickets into a single executive evening summary.',
      features: ['Real-time cross-suite rollup', '1-Click WhatsApp Owner dispatch', 'Daily executive KPI snapshot', 'Zero manual reporting']
    },
    {
      id: 'voice-ai',
      category: 'crm',
      title: 'Voice Dictation AI Assistant',
      badge: 'AI Productivity',
      icon: Mic,
      color: '#db2777',
      bgColor: '#fdf2f8',
      description: 'Allows field sales representatives to dictate meeting notes, client objections, and deal terms using speech-to-text recognition.',
      features: ['Hands-free note capture', 'Real-time transcription', 'Pipeline recommendation bot', 'Instant lead log creation']
    },
    {
      id: 'tax-governance',
      category: 'governance',
      title: 'Super Owner Tax Governance Engine',
      badge: 'Sovereign Control',
      icon: Percent,
      color: '#d97706',
      bgColor: '#fffbeb',
      description: 'Gives the Super Owner sovereign control over platform tax slabs (0%-28%), inclusive vs exclusive billing, and platform credentials.',
      features: ['0%, 5%, 12%, 18%, 28% Slabs', 'Intra-state CGST/SGST splitting', 'Platform GSTIN & PAN config', 'Live simulator & receipt update']
    },
    {
      id: 'storage-meter',
      category: 'governance',
      title: 'Real-Time Cloud Storage & Validity',
      badge: 'Infrastructure Metering',
      icon: Database,
      color: '#0891b2',
      bgColor: '#ecfeff',
      description: 'Monitors platform cloud storage usage (GB) and plan validity countdown in real-time with visual quota gauges and top-ups.',
      features: ['Live days countdown timer', 'Precise GB cloud storage meter', 'Allocated team seats gauge', 'Instant top-up upgrade modal']
    },
    {
      id: 'vault-security',
      category: 'governance',
      title: 'Master PIN Security Vault',
      badge: 'Dual-Factor Barrier',
      icon: KeyRound,
      color: '#4f46e5',
      bgColor: '#eef2ff',
      description: 'Shields sensitive financial parameters, database exports, and tenant management actions behind a cryptographic master PIN.',
      features: ['Brute-force lockout barrier', 'Encrypted JSON backup export', '1-Click schema restoration', 'System audit trail logging']
    },
    {
      id: 'csat-radar',
      category: 'crm',
      title: 'CSAT Mood & Sentiment Radar',
      badge: 'Customer Success',
      icon: Activity,
      color: '#0284c7',
      bgColor: '#f0f9ff',
      description: 'Tracks customer sentiment (Delighted, Satisfied, Neutral, Unhappy) across every deal to predict and mitigate client churn.',
      features: ['Color-coded sentiment pills', 'Churn risk early-warning', 'Client health score tracking', 'Executive CSAT analytics']
    },
    {
      id: 'doc-locker',
      category: 'hrms',
      title: 'Digital Employee Document Locker',
      badge: 'HR Compliance',
      icon: FileSpreadsheet,
      color: '#4f46e5',
      bgColor: '#eef2ff',
      description: 'Secure cloud repository for Aadhaar, PAN, Resume, Experience, and Offer letters with dynamic verified visual ID card generation.',
      features: ['Aadhaar & PAN live previewer', 'Digital verification stamps', 'Secure employee upload portal', 'PDF & Image document locker']
    }
  ];

  const filteredModules = modulesList.filter(item => {
    const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
    const matchesQuery = item.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          item.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          item.badge.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesQuery;
  });

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
            <span style={{ fontSize: '15px', fontWeight: 800, color: '#0f172a' }}>ITLC Modules</span>
            <span style={{ fontSize: '10px', background: 'rgba(217, 119, 6, 0.08)', color: '#d97706', padding: '2px 7px', borderRadius: '12px', border: '1px solid rgba(217, 119, 6, 0.2)', fontWeight: 700 }}>
              20+ Micro-Tools
            </span>
          </div>
        </div>

        {/* Center Nav Links */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', background: 'rgba(241, 245, 249, 0.8)', padding: '3px', borderRadius: '11px', border: '1px solid rgba(226, 232, 240, 0.8)' }}>
          
          <button 
            onClick={() => onNavigateTo('security')}
            style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', fontSize: '12px', fontWeight: 600, color: '#475569', padding: '5px 12px', borderRadius: '8px', background: 'transparent', border: 'none', cursor: 'pointer' }}
          >
            <ShieldCheck size={13} style={{ color: '#4f46e5' }} />
            <span>Security</span>
          </button>
          <button 
            onClick={() => onNavigateTo('modules')}
            style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', fontSize: '12px', fontWeight: 700, color: '#d97706', padding: '5px 12px', borderRadius: '8px', background: '#ffffff', border: 'none', boxShadow: '0 2px 5px rgba(0,0,0,0.05)', cursor: 'pointer' }}
          >
            <Layers size={13} />
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
            style={{ padding: '7px 14px', fontSize: '12px', borderRadius: '9px', background: 'rgba(2, 132, 199, 0.08)', color: '#0284c7', border: '1px solid rgba(2, 132, 199, 0.3)', fontWeight: 700, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '5px' }}
          >
            <Lock size={13} />
            <span>Login</span>
          </button>

          <button 
            onClick={onGetStarted}
            style={{ padding: '7px 15px', fontSize: '12px', borderRadius: '9px', display: 'inline-flex', alignItems: 'center', gap: '6px', background: 'linear-gradient(135deg, #d97706, #f59e0b)', color: '#fff', border: 'none', fontWeight: 700, boxShadow: '0 4px 12px rgba(217, 119, 6, 0.25)', cursor: 'pointer' }}
          >
            <Sparkles size={13} />
            <span>Get Started</span>
          </button>
        </div>
      </header>

      {/* Hero Header */}
      <section style={{ maxWidth: '1100px', margin: '0 auto', padding: '60px 24px 30px', textAlign: 'center' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '6px 16px', borderRadius: '30px', background: '#fffbeb', color: '#d97706', fontSize: '12px', fontWeight: 700, marginBottom: '16px' }}>
          <Layers size={14} />
          <span>MICRO-MODULE ARCHITECTURE DIRECTORY</span>
        </div>
        <h1 style={{ fontSize: '40px', fontWeight: 900, letterSpacing: '-1px', color: '#0f172a', lineHeight: 1.15, marginBottom: '16px' }}>
          Enterprise Capabilities &<br />
          <span style={{ background: 'linear-gradient(135deg, #d97706, #0284c7, #4f46e5)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            High-Value Business Modules.
          </span>
        </h1>
        <p style={{ fontSize: '16px', color: '#64748b', maxWidth: '720px', margin: '0 auto', lineHeight: 1.6 }}>
          Explore our suite of interconnected tools designed for enterprise automation, field workforce visibility, GST financial governance, and AI-powered sales execution.
        </p>
      </section>

      {/* Filter Tabs & Search Bar */}
      <section style={{ maxWidth: '1200px', margin: '0 auto 40px', padding: '0 24px' }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '16px', background: '#ffffff', padding: '16px 20px', borderRadius: '16px', border: '1px solid #e2e8f0', boxShadow: '0 4px 15px -2px rgba(0,0,0,0.03)' }}>
          
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
            {[
              { key: 'all', label: 'All Modules' },
              { key: 'crm', label: 'Sales CRM (Coming Soon)' },
              { key: 'hrms', label: 'HRMS & Workforce' },
              { key: 'automations', label: 'Smart Automations' },
              { key: 'governance', label: 'Security & Governance' }
            ].map(tab => (
              <button 
                key={tab.key}
                onClick={() => setSelectedCategory(tab.key as any)}
                style={{
                  padding: '7px 16px',
                  borderRadius: '10px',
                  fontSize: '12px',
                  fontWeight: selectedCategory === tab.key ? 700 : 600,
                  background: selectedCategory === tab.key ? '#0f172a' : '#f1f5f9',
                  color: selectedCategory === tab.key ? '#ffffff' : '#475569',
                  border: 'none',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease'
                }}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div style={{ position: 'relative', minWidth: '260px' }}>
            <Search size={14} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
            <input 
              type="text"
              placeholder="Search module name or feature..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                width: '100%',
                padding: '8px 12px 8px 34px',
                borderRadius: '10px',
                border: '1px solid #cbd5e1',
                fontSize: '12px',
                outline: 'none'
              }}
            />
          </div>

        </div>
      </section>

      {/* Modules Cards Grid */}
      <section style={{ maxWidth: '1200px', margin: '0 auto 80px', padding: '0 24px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '24px' }}>
          {filteredModules.map((mod) => {
            const IconComp = mod.icon;
            return (
              <div 
                key={mod.id} 
                style={{ 
                  background: '#ffffff', 
                  borderRadius: '18px', 
                  border: '1px solid #e2e8f0', 
                  padding: '24px', 
                  display: 'flex', 
                  flexDirection: 'column', 
                  justifyContent: 'space-between',
                  boxShadow: '0 6px 18px -4px rgba(0,0,0,0.03)',
                  transition: 'transform 0.15s ease, box-shadow 0.15s ease'
                }}
              >
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                    <div style={{ width: '42px', height: '42px', borderRadius: '11px', background: mod.bgColor, display: 'flex', alignItems: 'center', justifyContent: 'center', color: mod.color }}>
                      <IconComp size={22} />
                    </div>
                    <span style={{ fontSize: '10px', fontWeight: 700, padding: '3px 8px', borderRadius: '12px', background: mod.bgColor, color: mod.color, border: `1px solid ${mod.color}30` }}>
                      {mod.badge}
                    </span>
                  </div>

                  <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#0f172a', marginBottom: '6px' }}>
                    {mod.title}
                  </h3>
                  <p style={{ fontSize: '13px', color: '#64748b', lineHeight: 1.5, marginBottom: '20px' }}>
                    {mod.description}
                  </p>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '20px' }}>
                    {mod.features.map((feat, fIdx) => (
                      <div key={fIdx} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', color: '#334155' }}>
                        <CheckCircle2 size={14} style={{ color: mod.color, flexShrink: 0 }} />
                        <span>{feat}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <button 
                  onClick={() => {
                    if (mod.category === 'crm') onExploreCrm();
                    else if (mod.category === 'hrms') onExploreHrms();
                    else if (mod.category === 'governance') onExploreSuperAdmin();
                    else onGetStarted();
                  }}
                  style={{
                    width: '100%',
                    padding: '9px',
                    borderRadius: '10px',
                    background: '#f8fafc',
                    color: '#0f172a',
                    border: '1px solid #e2e8f0',
                    fontWeight: 700,
                    fontSize: '12px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease'
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.background = mod.color; e.currentTarget.style.color = '#ffffff'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = '#f8fafc'; e.currentTarget.style.color = '#0f172a'; }}
                >
                  <span>{mod.category === 'crm' ? 'Coming Soon ⏳' : 'Explore Module'}</span>
                  {mod.category !== 'crm' && <ArrowRight size={13} />}
                </button>
              </div>
            );
          })}
        </div>
      </section>

    </div>
  );
};
