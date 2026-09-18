import React, { useState } from 'react';
import { LandingHeader } from './LandingHeader';
import { LandingFooter } from './LandingFooter';
import { 
  Layers, 
  Briefcase, 
  Building2, 
  ShieldCheck, 
  Lock,
  Sparkles, 
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
  Sliders,
  Star,
  Share2,
  Bookmark,
  TrendingUp
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
      title: 'Super Owner Sovereign Shield',
      badge: 'Zero-Trust Barrier',
      icon: KeyRound,
      color: '#4f46e5',
      bgColor: '#eef2ff',
      description: 'Shields sensitive financial parameters, database exports, and tenant management actions behind Super Owner cryptographic access.',
      features: ['Role-based authorization', 'Encrypted JSON backup export', '1-Click schema restoration', 'System audit trail logging']
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

  const getActionLabel = (category: ModuleItem['category']) => {
    if (category === 'crm') return 'Coming soon';
    if (category === 'governance') return 'Open hub';
    if (category === 'automations') return 'Start workflow';
    return 'Explore module';
  };

  return (
    <div className="itlc-modules-page">
      
      <LandingHeader
        onHome={onBackToHome}
        onFeatures={() => onNavigateTo('modules')}
        onPricing={() => onNavigateTo('pricing')}
        onSolutions={() => onNavigateTo('workspaces')}
        onSecurity={() => onNavigateTo('security')}
        onLogin={onOpenSignIn}
        onGetStarted={onGetStarted}
      />

      {/* Hero Header */}
      <section className="itlc-modules-hero">
        <div className="itlc-modules-kicker">
          <Layers size={14} />
          <span>MICRO-MODULE ARCHITECTURE DIRECTORY</span>
        </div>
        <h1>
          Enterprise Capabilities &<br />
          <span>
            High-Value Business Modules.
          </span>
        </h1>
        <p>
          Explore our suite of interconnected tools designed for enterprise automation, field workforce visibility, GST financial governance, and AI-powered sales execution.
        </p>
      </section>

      {/* Filter Tabs & Search Bar */}
      <section className="itlc-modules-filter-section">
        <div className="itlc-modules-filter-panel">
          
          <div className="itlc-modules-tabs">
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
                className={selectedCategory === tab.key ? 'active' : ''}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="itlc-modules-search">
            <Search size={21} />
            <input 
              type="text"
              placeholder="Search module name or feature..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

        </div>
      </section>

      {/* Modules Cards Grid */}
      <section className="itlc-module-card-section">
        <div className="itlc-module-glass-grid">
          {filteredModules.map((mod, index) => {
            const IconComp = mod.icon;
            return (
              <article className="itlc-module-glass-card" key={mod.id}>
                <div className="itlc-module-card-top">
                  <div className="itlc-module-icon-tile" style={{ ['--module-accent' as any]: mod.color }}>
                    <IconComp size={52} />
                  </div>
                </div>

                <h3>{mod.title}</h3>
                <p>{mod.description}</p>

                <div className="itlc-module-chip-row">
                  <span><Users size={19} /> {mod.category.toUpperCase()}</span>
                  <span><Briefcase size={19} /> {mod.badge}</span>
                </div>

                <div className="itlc-module-feature-pills" aria-label={`${mod.title} features`}>
                  {mod.features.slice(0, 3).map((feature) => (
                    <span key={feature}>
                      <CheckCircle2 size={15} />
                      {feature}
                    </span>
                  ))}
                </div>
              </article>
            );
          })}
        </div>
      </section>

      <LandingFooter onNavigate={(p) => p === 'home' ? onBackToHome() : onNavigateTo(p)} />
    </div>
  );
};
