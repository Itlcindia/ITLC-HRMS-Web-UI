import React, { useState, useEffect, useMemo, useRef } from 'react';
import OmniStaffApp from './omnistaff/App.tsx';
import { api } from './omnistaff/services/api';
import { secureStorage } from './utils/cryptoStorage';
import { 
  getLiveSubscriptionPlans, 
  defaultSubscriptionPlans, 
  initialSeedTenants, 
  getLiveLandingSections,
  getLiveLandingPageConfig,
  calculateSubscriptionMetrics,
  type TenantCompany, 
  type TenantFeatureFlags, 
  type SubscriptionPlanDef,
  type CustomLandingSection,
  type LandingPageConfig
} from './types/multiTenant';
import { ClientOnboardingModal } from './components/ClientOnboardingModal';
import { CompanyRegisterPage } from './components/CompanyRegisterPage';
import { SuperAdminMasterPanel } from './components/SuperAdminMasterPanel';
import { HeroHeadlineSection } from './components/HeroHeadlineSection';
import { Hero3DQuantumNexus } from './components/Hero3DQuantumNexus';
import { ItlcEcosystemOrbit } from './components/ItlcEcosystemOrbit';
import { ItlcProductShowcase } from './components/ItlcProductShowcase';
import { CustomLandingSectionRenderer } from './components/CustomLandingSectionRenderer';
import { WorkspaceChoiceModal } from './components/WorkspaceChoiceModal';
import { SecureAuthModal } from './components/SecureAuthModal';
import { SubscriptionQuotaMeterModal } from './components/SubscriptionQuotaMeterModal';
import { SmartAutomationsHubModal } from './components/SmartAutomationsHubModal';
import { WorkspacesPage } from './components/WorkspacesPage';
import { SecurityPage } from './components/SecurityPage';
import { ModulesPage } from './components/ModulesPage';
import { PricingPage } from './components/PricingPage';
import { SubscriptionPricingCards } from './components/SubscriptionPricingCards';
import LandingPage from './components/LandingPage';
import { 
  LayoutDashboard, 
  Users, 
  ShieldCheck, 
  Settings, 
  BarChart3, 
  DollarSign, 
  Target, 
  UserCheck, 
  Briefcase, 
  Plus, 
  Download, 
  Bell, 
  Edit2, 
  Trash2, 
  Lock, 
  Moon, 
  Sun, 
  CheckCircle, 
  TrendingUp, 
  Sparkles, 
  Search, 
  X, 
  Mail, 
  Eye, 
  Kanban, 
  CheckSquare, 
  Receipt, 
  MessageCircle, 
  MessageSquare,
  Clock, 
  Printer, 
  LogOut, 
  ArrowRight, 
  UploadCloud, 
  Bot, 
  Send, 
  Globe, 
  FileText, 
  Inbox, 
  Zap, 
  Smartphone, 
  PhoneCall, 
  Activity, 
  Award, 
  Megaphone, 
  Coins, 
  Radio, 
  Database, 
  RefreshCw, 
  Layers, 
  Paperclip, 
  History, 
  AlertTriangle, 
  Cloud, 
  Calendar as CalendarIcon,
  Calculator,
  Command,
  Mic,
  MicOff,
  MapPin,
  Camera,
  QrCode,
  Keyboard,
  Ticket,
  Headphones
} from 'lucide-react';




import { 
  Chart as ChartJS, 
  CategoryScale, 
  LinearScale, 
  PointElement, 
  LineElement, 
  Title, 
  Tooltip, 
  Legend, 
  ArcElement, 
  Filler 
} from 'chart.js';
import { Line, Pie } from 'react-chartjs-2';

// Register ChartJS elements
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  ArcElement,
  Filler,
  Title,
  Tooltip,
  Legend
);

// TypeScript Models
export interface LeadNote {
  id: number;
  text: string;
  date: string;
  author: string;
}

export interface CallLog {
  id: number;
  duration: string;
  outcome: 'Connected' | 'Interested' | 'Call Back Later' | 'Busy / No Answer' | 'Wrong Number';
  notes: string;
  date: string;
  time: string;
  caller: string;
}

export interface LeadAttachment {
  id: number;
  name: string;
  size: string;
  date: string;
  type: string;
}

export interface CustomFieldDefinition {
  id: number;
  label: string;
  type: 'text' | 'number' | 'date';
}

export interface Lead {
  id: number;
  name: string;
  email: string;
  phone?: string;
  source: 'Website' | 'LinkedIn' | 'Email' | 'Referrals' | 'Other';
  value: number;
  status: string;
  date: string;
  assignedRep?: string;
  tag?: 'VIP Client' | 'Urgent' | 'Enterprise' | 'Hot Deal' | 'Standard';
  rating?: number;
  csatMood?: 'Delighted' | 'Satisfied' | 'Neutral' | 'Unhappy';
  customValues?: Record<string, string>;
  notes?: LeadNote[];
  callLogs?: CallLog[];
  attachments?: LeadAttachment[];
}

export interface User {
  id: number;
  name: string;
  email: string;
  role: 'Super Admin' | 'Admin' | 'Sales Manager' | 'Sales Rep' | 'Support Agent' | 'Client';
  status: 'Active' | 'Inactive';
  avatar: string;
  photoUrl?: string;
  password?: string;
}

export interface SupportTicket {
  id: number;
  ticketNo: string;
  clientName: string;
  subject: string;
  category: 'Billing' | 'Technical' | 'Feature Request' | 'General';
  priority: 'High' | 'Medium' | 'Low';
  status: 'Open' | 'In-Progress' | 'Resolved';
  assignedTo: string;
  createdDate: string;
  csatRating?: number;
  notes?: string;
}



export interface Deal {
  id: number;
  name: string;
  value: number;
  stage: 'Proposal' | 'Negotiation' | 'Closed';
  probability: number;
  closeDate?: string;
  assignedRep?: string;
  tag?: 'VIP Client' | 'Urgent' | 'Enterprise' | 'Hot Deal' | 'Standard';
}

export interface Task {
  id: number;
  title: string;
  dueDate: string;
  priority: 'High' | 'Medium' | 'Low';
  completed: boolean;
  assignedTo: string;
}

export interface SystemSettings {
  companyName: string;
  revenueGoal: number;
  currency: 'USD' | 'EUR' | 'INR';
  emailAlerts: boolean;
  systemUpdates: boolean;
  commissionRate: number;
  masterPin: string;
  customFields: CustomFieldDefinition[];
}

export interface ChatMessage {
  id: number;
  sender: 'ai' | 'user';
  text: string;
}

export interface CampaignRecord {
  id: number;
  title: string;
  channel: 'WhatsApp' | 'Email';
  audience: string;
  recipientsCount: number;
  date: string;
  status: 'Sent' | 'Draft';
}

export interface AuditLog {
  id: number;
  action: string;
  detail: string;
  actor: string;
  category: 'lead' | 'deal' | 'invoice' | 'system' | 'campaign';
  timestamp: string;
}

// Translations Dictionary
const translations = {
  en: {
    dashboard: "Dashboard",
    kanban: "Kanban Pipeline",
    calendar: "Calendar & Tasks",
    invoices: "Invoices & Quotes",
    campaigns: "Broadcast & Campaigns",
    users: "User Management",
    roles: "Role Management",
    settings: "System Settings",
    reports: "Reports",
    adminPanel: "Admin Panel",
    totalRevenue: "Total Revenue",
    activeLeads: "Active Leads",
    teamPerformance: "Team Performance",
    activeDeals: "Active Deals",
    overview: "Overview",
    team: "Team",
    leadsTab: "Leads",
    dealsTab: "Deals",
    addLead: "Add Lead",
    exportData: "Export Data",
    importCSV: "Import CSV",
    salesView: "Switch to Sales View",
    revenueTrend: "Revenue Trend",
    leadSources: "Lead Sources Breakdown",
    pipelineVal: "pipeline",
    targetScore: "Average reps closing score",
    registered: "Registered",
    aiAssistant: "AI Sales Assistant",
    aiHelp: "Ask AI anything about your pipeline, leads, or revenue forecast...",
    ask: "Send",
    installApp: "Install App",
    funnel: "Sales Conversion Funnel",
    auditTrail: "System Audit Trail & Live Logs",
    leaderboard: "Sales Champions Leaderboard",
    spotlight: "Quick Command Palette (Ctrl + K)",
    simulator: "Sales Incentive Payout Simulator"
  },
  hi: {
    dashboard: "Dashboard",
    kanban: "Kanban Pipeline",
    calendar: "Calendar & Tasks",
    invoices: "Invoices & Quotes",
    campaigns: "Broadcast & Campaigns",
    users: "User Management",
    roles: "Role Management",
    settings: "System Settings",
    reports: "Reports",
    adminPanel: "Admin Panel",
    totalRevenue: "Total Revenue",
    activeLeads: "Active Leads",
    teamPerformance: "Team Performance",
    activeDeals: "Active Deals",
    overview: "Overview",
    team: "Team",
    leadsTab: "Leads",
    dealsTab: "Deals",
    addLead: "Add Lead",
    exportData: "Export Data",
    importCSV: "Import CSV",
    salesView: "Switch to Sales View",
    revenueTrend: "Revenue Trend",
    leadSources: "Lead Sources Breakdown",
    pipelineVal: "pipeline",
    targetScore: "Average reps closing score",
    registered: "Registered",
    aiAssistant: "AI Sales Assistant",
    aiHelp: "Ask AI anything about your pipeline, leads, or revenue forecast...",
    ask: "Send",
    installApp: "Install App",
    funnel: "Sales Conversion Funnel",
    auditTrail: "System Audit Trail & Live Logs",
    leaderboard: "Sales Champions Leaderboard",
    spotlight: "Quick Command Palette (Ctrl + K)",
    simulator: "Sales Incentive Payout Simulator"
  }
};

const initialUsers: User[] = [
  { id: 1, name: "Master SuperAdmin", email: "superadmin@itlccrm.com", role: "Super Admin", status: "Active", avatar: "SA", password: "admin" }
];

const initialTickets: SupportTicket[] = [];

const initialSettings: SystemSettings = {
  companyName: "ITLC CRM",
  revenueGoal: 500000,
  currency: "INR",
  emailAlerts: true,
  systemUpdates: false,
  commissionRate: 5,
  masterPin: "1234",
  customFields: [
    { id: 1, label: "GSTIN / Tax Number", type: "text" },
    { id: 2, label: "Client City", type: "text" }
  ]
};

const initialPermissions: Record<string, string[]> = {
  "Super Admin": ["view_dashboard", "manage_users", "manage_roles", "manage_settings", "view_reports", "create_leads", "edit_leads", "delete_leads", "manage_deals", "manage_tasks", "manage_campaigns", "manage_tickets", "system_recovery"],
  "Admin": ["view_dashboard", "manage_users", "manage_roles", "manage_settings", "view_reports", "create_leads", "edit_leads", "delete_leads", "manage_deals", "manage_tasks", "manage_campaigns", "manage_tickets"],
  "Manager": ["view_dashboard", "manage_users", "view_reports", "create_leads", "edit_leads", "manage_deals", "manage_tasks", "manage_campaigns"],
  "Rep": ["view_dashboard", "create_leads", "edit_leads", "manage_deals", "manage_tasks"],
  "Support": ["view_dashboard", "manage_tickets", "view_reports"],
  "Client": ["view_dashboard", "view_invoices", "create_tickets"]
};

// Helper: Get Portal and Default View for User Role
export const getPortalAndDefaultViewForRole = (role?: User['role']): {
  portal: 'super_admin' | 'admin' | 'manager' | 'rep' | 'support' | 'client';
  view: 'dashboard' | 'kanban' | 'calendar' | 'invoices' | 'campaigns' | 'users' | 'roles' | 'settings' | 'reports' | 'tickets' | 'client_portal';
} => {
  switch (role) {
    case 'Super Admin':
      return { portal: 'super_admin', view: 'dashboard' };
    case 'Admin':
      return { portal: 'admin', view: 'dashboard' };
    case 'Sales Manager':
      return { portal: 'manager', view: 'dashboard' };
    case 'Sales Rep':
      return { portal: 'rep', view: 'dashboard' };
    case 'Support Agent':
      return { portal: 'support', view: 'tickets' };
    case 'Client':
      return { portal: 'client', view: 'client_portal' };
    default:
      return { portal: 'super_admin', view: 'dashboard' };
  }
};


function App() {
  // Global State with LocalStorage Persistence
  const [leads, setLeads] = useState<Lead[]>(() => {
    const saved = localStorage.getItem('crm_leads');
    if (saved) { try { return JSON.parse(saved); } catch (e) { return []; } }
    return [];
  });

  const [users, setUsers] = useState<User[]>(() => {
    const saved = localStorage.getItem('crm_users');
    if (saved) { 
      try { 
        const parsed = JSON.parse(saved); 
        if (Array.isArray(parsed) && parsed.length > 0) {
          const cleanUsers = parsed.filter((u: any) => 
            u && !['rajesh@itlccrm.com', 'amit@itlccrm.com', 'support@itlccrm.com', 'client@acme.com', 'admin@itlccrm.com'].includes(u.email)
          );
          if (cleanUsers.length > 0) return cleanUsers;
        }
      } catch (e) { return initialUsers; } 
    }
    return initialUsers;
  });

  const [deals, setDeals] = useState<Deal[]>(() => {
    const saved = localStorage.getItem('crm_deals');
    if (saved) { try { return JSON.parse(saved); } catch (e) { return []; } }
    return [];
  });

  const [tasks, setTasks] = useState<Task[]>(() => {
    const saved = localStorage.getItem('crm_tasks');
    if (saved) { try { return JSON.parse(saved); } catch (e) { return []; } }
    return [];
  });

  const [settings, setSettings] = useState<SystemSettings>(() => {
    const saved = localStorage.getItem('crm_settings');
    if (saved) { 
      try { 
        const parsed = JSON.parse(saved); 
        return { ...initialSettings, ...parsed };
      } catch (e) { return initialSettings; } 
    }
    return initialSettings;
  });

  const [permissions, setPermissions] = useState<Record<string, string[]>>(() => {
    const saved = localStorage.getItem('crm_permissions');
    if (saved) { try { return JSON.parse(saved); } catch (e) { return initialPermissions; } }
    return initialPermissions;
  });

  const [auditLogs, setAuditLogs] = useState<AuditLog[]>(() => {
    const saved = localStorage.getItem('crm_audit_logs');
    if (saved) { try { return JSON.parse(saved); } catch (e) { return []; } }
    return [
      { id: 1, action: "System Initialized", detail: "ITLC CRM database active and ready", actor: "System", category: "system", timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }
    ];
  });

  const [tickets, setTickets] = useState<SupportTicket[]>(() => {
    const saved = localStorage.getItem('crm_tickets');
    if (saved) { try { return JSON.parse(saved); } catch (e) { return initialTickets; } }
    return initialTickets;
  });

  const [currentUserContext, setCurrentUserContext] = useState<User>(() => {
    const saved = localStorage.getItem('crm_current_user');
    if (saved) {
      try { 
        const u = JSON.parse(saved);
        if (u && u.name && u.role) return u;
      } catch (e) {}
    }

    // Single Sign-On fallback: read shared HRMS logged-in profile
    const hrmsSaved = localStorage.getItem('hrms_user_profile');
    if (hrmsSaved) {
      try {
        const hp = JSON.parse(hrmsSaved);
        if (hp) {
          let crmRole: User['role'] = 'Sales Rep';
          if (hp.role === 'Super Owner') crmRole = 'Super Admin';
          else if (hp.role === 'Company Admin' || hp.role === 'Admin' || hp.role === 'HR') crmRole = 'Admin';
          else if (hp.role === 'Manager') crmRole = 'Sales Manager';

          return {
            id: hp.id || 1,
            name: hp.name || hp.fullName || 'Authorized User',
            email: hp.email || 'user@itlc.com',
            role: crmRole,
            status: 'Active',
            avatar: (hp.name || 'U').split(' ').map((w: string) => w[0]).join('').slice(0, 2).toUpperCase()
          };
        }
      } catch (e) {}
    }
    return initialUsers[0];
  });

  const [activePortal, setActivePortal] = useState<'super_admin' | 'admin' | 'manager' | 'rep' | 'support' | 'client'>(() => {
    const savedUser = localStorage.getItem('crm_current_user');
    if (savedUser) {
      try {
        const u = JSON.parse(savedUser);
        if (u && u.role) {
          return getPortalAndDefaultViewForRole(u.role).portal;
        }
      } catch (e) {}
    }

    const hrmsSaved = localStorage.getItem('hrms_user_profile');
    if (hrmsSaved) {
      try {
        const hp = JSON.parse(hrmsSaved);
        if (hp) {
          if (hp.role === 'Super Owner') return 'super_admin';
          if (hp.role === 'Company Admin' || hp.role === 'Admin' || hp.role === 'HR') return 'admin';
          if (hp.role === 'Manager') return 'manager';
          return 'rep';
        }
      } catch (e) {}
    }

    return 'super_admin';
  });

  const [activeView, setActiveView] = useState<'dashboard' | 'kanban' | 'calendar' | 'invoices' | 'campaigns' | 'users' | 'roles' | 'settings' | 'reports' | 'tickets' | 'client_portal'>(() => {
    const savedUser = localStorage.getItem('crm_current_user');
    if (savedUser) {
      try { 
        const u = JSON.parse(savedUser);
        if (u && u.role) {
          return getPortalAndDefaultViewForRole(u.role).view;
        }
      } catch (e) {}
    }
    return 'dashboard';
  });

  const [showTicketModal, setShowTicketModal] = useState<boolean>(false);
  const [ticketSubject, setTicketSubject] = useState<string>('');
  const [ticketClient, setTicketClient] = useState<string>('');
  const [ticketCategory, setTicketCategory] = useState<'Billing' | 'Technical' | 'Feature Request' | 'General'>('Billing');
  const [ticketPriority, setTicketPriority] = useState<'High' | 'Medium' | 'Low'>('Medium');
  const [ticketNotes, setTicketNotes] = useState<string>('');

  const [darkMode, setDarkMode] = useState<boolean>(() => {
    const saved = localStorage.getItem('crm_dark_mode');
    return saved === 'true';
  });

  // Spotlight Command Palette (Ctrl + K) State

  const [showSpotlight, setShowSpotlight] = useState<boolean>(false);
  const [spotlightQuery, setSpotlightQuery] = useState<string>('');

  // Incentive Simulator State
  const [simulatedSales, setSimulatedSales] = useState<number>(500000);

  // Custom Field Creator Form in Settings
  const [newFieldLabel, setNewFieldLabel] = useState<string>('');
  const [newFieldType, setNewFieldType] = useState<'text' | 'number' | 'date'>('text');

  // Cloud Backend Sync State
  const [cloudStatus, setCloudStatus] = useState<'connected' | 'syncing' | 'offline'>('offline');
  const [cloudPort] = useState<number>(5000);
  const [activeSuite, setActiveSuite] = useState<'crm' | 'hrms'>('hrms');

  useEffect(() => {
    localStorage.setItem('itlc_active_suite', activeSuite);
  }, [activeSuite]);

  const [showIntroLaunchpad, setShowIntroLaunchpad] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    const hash = window.location.hash.toLowerCase();
    // Show landing page by default unless explicitly accessing #login or #register
    if (hash === '#login' || hash.startsWith('#login') || hash === '#register') {
      return false;
    }
    return true;
  });
  const [introActiveTab, setIntroActiveTab] = useState<'crm' | 'hrms'>('crm');
  const [heroFeatureTab, setHeroFeatureTab] = useState<'crm' | 'hrms' | 'billing'>('crm');

  // Multi-Tenant Companies & Subscriptions State
  const [tenants, setTenants] = useState<TenantCompany[]>(() => {
    let deletedIds = new Set<string>(['TEN-101', 'TEN-102', 'TEN-103', 'TEN-104']);
    try {
      const deletedIdsRaw = localStorage.getItem('hrms_deleted_company_ids');
      if (deletedIdsRaw) {
        const parsed = JSON.parse(deletedIdsRaw);
        if (Array.isArray(parsed)) {
          parsed.forEach((id: string) => deletedIds.add(id));
        }
      }
    } catch {}

    const saved = localStorage.getItem('itlc_multi_tenants');
    if (saved !== null) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed.filter((t: any) => t && t.id && !deletedIds.has(t.id));
      } catch (e) {}
    }
    return initialSeedTenants.filter(t => !deletedIds.has(t.id));
  });

  const [activeTenant, setActiveTenant] = useState<TenantCompany | null>(() => {
    const saved = localStorage.getItem('itlc_active_tenant');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) {}
    }
    return tenants[0] || null;
  });

  useEffect(() => {
    if (Array.isArray(tenants)) {
      localStorage.setItem('itlc_multi_tenants', JSON.stringify(tenants));
    }
  }, [tenants]);

  useEffect(() => {
    if (activeTenant) {
      localStorage.setItem('itlc_active_tenant', JSON.stringify(activeTenant));
    }
  }, [activeTenant]);

  useEffect(() => {
    const handleCompanyDel = (e: Event) => {
      const customEv = e as CustomEvent;
      if (customEv && customEv.detail && customEv.detail.id) {
        const delId = customEv.detail.id;
        setTenants(prev => prev.filter(t => t.id !== delId));
        setActiveTenant(prev => prev && prev.id === delId ? null : prev);
      }
    };
    window.addEventListener('company_deleted', handleCompanyDel);
    return () => window.removeEventListener('company_deleted', handleCompanyDel);
  }, []);

  useEffect(() => {
    localStorage.setItem('crm_leads', JSON.stringify(leads));
  }, [leads]);

  useEffect(() => {
    localStorage.setItem('crm_deals', JSON.stringify(deals));
  }, [deals]);

  useEffect(() => {
    localStorage.setItem('crm_tasks', JSON.stringify(tasks));
  }, [tasks]);

  useEffect(() => {
    localStorage.setItem('crm_users', JSON.stringify(users));
  }, [users]);

  useEffect(() => {
    localStorage.setItem('crm_settings', JSON.stringify(settings));
  }, [settings]);

  useEffect(() => {
    localStorage.setItem('crm_permissions', JSON.stringify(permissions));
  }, [permissions]);

  useEffect(() => {
    localStorage.setItem('crm_audit_logs', JSON.stringify(auditLogs));
  }, [auditLogs]);

  useEffect(() => {
    localStorage.setItem('crm_tickets', JSON.stringify(tickets));
  }, [tickets]);

  useEffect(() => {
    localStorage.setItem('crm_current_user', JSON.stringify(currentUserContext));
  }, [currentUserContext]);

  useEffect(() => {
    localStorage.setItem('crm_dark_mode', String(darkMode));
  }, [darkMode]);

  // Automatic Demo Data Clean-up Routine
  useEffect(() => {
    try {
      const delIdsRaw = localStorage.getItem('hrms_deleted_company_ids');
      const delSet = new Set<string>(['TEN-101', 'TEN-102', 'TEN-103', 'TEN-104']);
      if (delIdsRaw) {
        try {
          const parsed = JSON.parse(delIdsRaw);
          if (Array.isArray(parsed)) parsed.forEach((id: string) => delSet.add(id));
        } catch {}
      }
      localStorage.setItem('hrms_deleted_company_ids', JSON.stringify(Array.from(delSet)));

      const tenantsRaw = localStorage.getItem('itlc_multi_tenants');
      if (tenantsRaw) {
        try {
          const parsed = JSON.parse(tenantsRaw);
          if (Array.isArray(parsed)) {
            const filtered = parsed.filter((t: any) => t && !delSet.has(t.id));
            localStorage.setItem('itlc_multi_tenants', JSON.stringify(filtered));
          }
        } catch {}
      }

      const tckRaw = localStorage.getItem('crm_tickets');
      if (tckRaw) {
        try {
          const parsed = JSON.parse(tckRaw);
          if (Array.isArray(parsed) && parsed.some((t: any) => t.ticketNo === 'TCK-1001' || t.ticketNo === 'TCK-1002')) {
            const filtered = parsed.filter((t: any) => t.ticketNo !== 'TCK-1001' && t.ticketNo !== 'TCK-1002');
            setTickets(filtered);
            localStorage.setItem('crm_tickets', JSON.stringify(filtered));
          }
        } catch {}
      }
    } catch (e) {}
  }, []);

  const [showOnboardingModal, setShowOnboardingModal] = useState<boolean>(false);
  const [activeLandingView, setActiveLandingView] = useState<'home' | 'workspaces' | 'security' | 'modules' | 'pricing'>(() => {
    if (typeof window !== 'undefined') {
      const hash = window.location.hash.toLowerCase();
      if (hash === '#workspaces') return 'workspaces';
      if (hash === '#security' || hash === '#highlights') return 'security';
      if (hash === '#modules') return 'modules';
      if (hash === '#pricing') return 'pricing';
    }
    return 'home';
  });

  const [isRegisteringCompany, setIsRegisteringCompany] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      const hash = window.location.hash.toLowerCase();
      const pathname = window.location.pathname.toLowerCase();
      const search = window.location.search.toLowerCase();
      return hash === '#register' || hash.startsWith('#register') || pathname === '/register' || pathname.startsWith('/register') || search.includes('register');
    }
    return false;
  });
  const [selectedOnboardingPlanId, setSelectedOnboardingPlanId] = useState<string>('growth');
  const [livePlans, setLivePlans] = useState<SubscriptionPlanDef[]>(getLiveSubscriptionPlans());
  const [isSuperAdminMasterActive, setIsSuperAdminMasterActive] = useState<boolean>(false);

  // Dynamic Landing Page Config & Contact Settings
  const [cmsConfig, setCmsConfig] = useState<LandingPageConfig>(() => {
    return getLiveLandingPageConfig();
  });

  // Dynamic Landing Page Sections Order & Visibility
  const [landingSectionsOrder, setLandingSectionsOrder] = useState<CustomLandingSection[]>(() => {
    return getLiveLandingSections();
  });

  const [pricingBillingCycle, setPricingBillingCycle] = useState<'monthly' | 'annual'>('annual');

  useEffect(() => {
    const handlePlanUpdate = (e?: Event) => {
      const customEv = e as CustomEvent;
      if (customEv && customEv.detail && Array.isArray(customEv.detail)) {
        setLivePlans(customEv.detail);
      } else {
        setLivePlans(getLiveSubscriptionPlans());
      }
    };
    const handleLandingConfigUpdate = (e?: Event) => {
      setLandingSectionsOrder(getLiveLandingSections());
      const customEv = e as CustomEvent;
      if (customEv && customEv.detail && !Array.isArray(customEv.detail)) {
        setCmsConfig(customEv.detail);
      } else {
        setCmsConfig(getLiveLandingPageConfig());
      }
    };
    window.addEventListener('subscription_plans_updated', handlePlanUpdate);
    window.addEventListener('landing_page_config_updated', handleLandingConfigUpdate);
    window.addEventListener('storage', handlePlanUpdate);
    window.addEventListener('storage', handleLandingConfigUpdate);
    return () => {
      window.removeEventListener('subscription_plans_updated', handlePlanUpdate);
      window.removeEventListener('landing_page_config_updated', handleLandingConfigUpdate);
      window.removeEventListener('storage', handlePlanUpdate);
      window.removeEventListener('storage', handleLandingConfigUpdate);
    };
  }, []);

  // Fetch fresh subscription plans from server API on mount
  useEffect(() => {
    api.getPlans().then((serverPlans) => {
      if (serverPlans && Array.isArray(serverPlans) && serverPlans.length > 0) {
        setLivePlans(getLiveSubscriptionPlans());
      }
    }).catch(() => {});
  }, []);

  // Reload live plans and CMS config whenever returning to the landing page
  useEffect(() => {
    setLivePlans(getLiveSubscriptionPlans());
    setCmsConfig(getLiveLandingPageConfig());
    setLandingSectionsOrder(getLiveLandingSections());
  }, [activeSuite, showIntroLaunchpad, isSuperAdminMasterActive, isRegisteringCompany, activeLandingView]);

  // Browser URL & Hash Route Listener (e.g. /admin, /superadmin, /superowner, /hrms, #admin, #superadmin, #superowner, #workspaces, #security, #modules, #pricing)
  useEffect(() => {
    const checkAdminRoute = () => {
      const pathname = window.location.pathname.toLowerCase();
      const hash = window.location.hash.toLowerCase();

      // Direct routing for #vault or #master
      if (hash === '#vault' || hash === '#master') {
        setActiveSuite('hrms');
        setShowIntroLaunchpad(false);
        setIsRegisteringCompany(false);
        setIsSuperAdminMasterActive(false);
        return;
      }

      // Dedicated Company Registration & Onboarding Page Route
      const isRegisterRoute = 
        pathname === '/register' || 
        pathname.startsWith('/register/') ||
        hash === '#register' ||
        hash.startsWith('#register');

      if (isRegisterRoute) {
        setShowIntroLaunchpad(false);
        setIsRegisteringCompany(true);
        setIsSuperAdminMasterActive(false);
        return;
      }

      // Dedicated Navigation Pages
      if (hash === '#workspaces' || pathname === '/workspaces' || pathname.startsWith('/workspaces/')) {
        setShowIntroLaunchpad(true);
        setActiveLandingView('workspaces');
        setIsRegisteringCompany(false);
        setIsSuperAdminMasterActive(false);
        return;
      }

      if (hash === '#security' || hash === '#highlights' || pathname === '/security' || pathname.startsWith('/security/')) {
        setShowIntroLaunchpad(true);
        setActiveLandingView('security');
        setIsRegisteringCompany(false);
        setIsSuperAdminMasterActive(false);
        return;
      }

      if (hash === '#modules' || pathname === '/modules' || pathname.startsWith('/modules/')) {
        setShowIntroLaunchpad(true);
        setActiveLandingView('modules');
        setIsRegisteringCompany(false);
        setIsSuperAdminMasterActive(false);
        return;
      }

      if (hash === '#pricing' || pathname === '/pricing' || pathname.startsWith('/pricing/')) {
        setShowIntroLaunchpad(true);
        setActiveLandingView('pricing');
        setIsRegisteringCompany(false);
        setIsSuperAdminMasterActive(false);
        return;
      }

      const isCrmRoute = 
        pathname === '/crm' || 
        pathname.startsWith('/crm/') || 
        hash === '#crm' || 
        hash.startsWith('#crm');

      if (isCrmRoute) {
        setActiveSuite('crm');
        setShowIntroLaunchpad(false);
        setIsRegisteringCompany(false);
        setIsSuperAdminMasterActive(false);
        return;
      }

      const isSuperownerRoute = 
        pathname === '/superowner' || 
        pathname.startsWith('/superowner/') ||
        hash === '#superowner' ||
        hash.startsWith('#superowner');

      if (isSuperownerRoute) {
        setActiveSuite('hrms');
        setShowIntroLaunchpad(false);
        setIsRegisteringCompany(false);
        setIsSuperAdminMasterActive(false);
        return;
      }

      // Specific admin / hrms / login routes
      const isAdminOrHrmsRoute = 
        pathname === '/admin' || 
        pathname.startsWith('/admin/') ||
        pathname === '/superadmin' || 
        pathname.startsWith('/superadmin/') ||
        pathname === '/hrms' ||
        pathname.startsWith('/hrms/') ||
        pathname === '/login' ||
        pathname.startsWith('/login/') ||
        hash === '#admin' || 
        hash.startsWith('#admin') ||
        hash === '#superadmin' || 
        hash.startsWith('#superadmin') ||
        hash === '#hrms' ||
        hash.startsWith('#hrms') ||
        hash === '#login' ||
        hash.startsWith('#login');

      if (isAdminOrHrmsRoute) {
        setActiveSuite('hrms');
        setShowIntroLaunchpad(false);
        setIsRegisteringCompany(false);
        setIsSuperAdminMasterActive(false);
        return;
      }

      if (hash === '#crm' || hash.startsWith('#crm')) {
        setActiveSuite('crm');
        setShowIntroLaunchpad(false);
        setIsRegisteringCompany(false);
        setIsSuperAdminMasterActive(false);
        return;
      }

      // Check if user is already logged in
      const hrmsToken = secureStorage.getItem<string>('hrms_jwt_token') || localStorage.getItem('hrms_jwt_token');
      const crmSession = secureStorage.getItem<string>('crm_auth_session') || localStorage.getItem('crm_auth_session') || sessionStorage.getItem('crm_auth_session');
      const hrmsProfile = secureStorage.getItem('hrms_user_profile') || localStorage.getItem('hrms_user_profile');
      const isUserLoggedIn = Boolean(hrmsToken || crmSession === 'true' || hrmsProfile);

      // Default route navigation: keep directly on Login / Workspace dashboard
      if (isUserLoggedIn) {
        setShowIntroLaunchpad(false);
        const savedSuite = localStorage.getItem('itlc_active_suite');
        if (savedSuite === 'hrms' || savedSuite === 'crm') {
          setActiveSuite(savedSuite);
        }
      } else {
        setShowIntroLaunchpad(true);
        setActiveLandingView('home');
      }
      setIsRegisteringCompany(false);
      setIsSuperAdminMasterActive(false);
    };

    checkAdminRoute();
    window.addEventListener('hashchange', checkAdminRoute);
    window.addEventListener('popstate', checkAdminRoute);
    return () => {
      window.removeEventListener('hashchange', checkAdminRoute);
      window.removeEventListener('popstate', checkAdminRoute);
    };
  }, []);

  // Language state
  const [lang, setLang] = useState<'en' | 'hi'>('en');
  const t = translations[lang];

  // Helper to add audit log
  const addAuditLog = (action: string, detail: string, category: 'lead' | 'deal' | 'invoice' | 'system' | 'campaign') => {
    const newLog: AuditLog = {
      id: Date.now(),
      action,
      detail,
      actor: currentUserContext.name || 'Admin',
      category,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    setAuditLogs(prev => [newLog, ...prev.slice(0, 49)]);
  };

  // Global Keyboard shortcut listener (Ctrl+K, ?, Alt+N, Alt+D, Alt+T, Ctrl+Shift+A, Escape)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      const isInput = target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable);

      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key.toLowerCase() === 'a') {
        e.preventDefault();
        setActiveSuite('hrms');
        setShowIntroLaunchpad(false);
        window.location.hash = '#superowner';
        return;
      }

      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setShowSpotlight(prev => !prev);
        return;
      }

      if (e.key === '?' && !isInput) {
        e.preventDefault();
        setShowShortcutsModal(prev => !prev);
        return;
      }

      if (e.altKey && e.key.toLowerCase() === 'n' && !isInput) {
        e.preventDefault();
        openAddLeadModal();
        return;
      }

      if (e.altKey && e.key.toLowerCase() === 'd' && !isInput) {
        e.preventDefault();
        openAddDealModal();
        return;
      }

      if (e.altKey && e.key.toLowerCase() === 't' && !isInput) {
        e.preventDefault();
        setDarkMode(prev => !prev);
        return;
      }

      if (e.key === 'Escape') {
        setShowSpotlight(false);
        setShowShortcutsModal(false);
        setShowLeadModal(false);
        setShowDealModal(false);
        setShowTaskModal(false);
        setShowUserModal(false);
        setShowProfileModal(false);
        setSelectedLeadForDrawer(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);


  // Check Cloud Backend Server Health
  const checkCloudServer = async () => {
    try {
      const res = await fetch(`http://localhost:${cloudPort}/api/health`);
      if (res.ok) {
        setCloudStatus('connected');
      } else {
        setCloudStatus('offline');
      }
    } catch (e) {
      setCloudStatus('offline');
    }
  };

  // Sync Data to Cloud Server
  const syncToCloudServer = async () => {
    setCloudStatus('syncing');
    try {
      const payload = {
        system: settings.companyName,
        leads,
        deals,
        tasks,
        users,
        settings,
        permissions,
        auditLogs,
        campaignHistory
      };
      const res = await fetch(`http://localhost:${cloudPort}/api/sync`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        setCloudStatus('connected');
        triggerToast("⚡ Cloud Database Synced on Port 5000!");
      } else {
        setCloudStatus('offline');
      }
    } catch (err) {
      setCloudStatus('offline');
    }
  };

  // Periodic Cloud Server Health Check
  useEffect(() => {
    checkCloudServer();
    const interval = setInterval(() => {
      checkCloudServer();
    }, 10000);
    return () => clearInterval(interval);
  }, []);

  // PWA Install Prompt State
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);

  useEffect(() => {
    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
    });
  }, []);

  const handleInstallPWA = () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      deferredPrompt.userChoice.then((choiceResult: any) => {
        if (choiceResult.outcome === 'accepted') {
          triggerToast("🎉 ITLC CRM Installed Successfully!");
        }
        setDeferredPrompt(null);
      });
    } else {
      triggerToast("📱 Use browser menu -> 'Install App' or 'Add to Home Screen'");
    }
  };

  // Authentication State
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    const hrmsToken = secureStorage.getItem<string>('hrms_jwt_token') || localStorage.getItem('hrms_jwt_token');
    const crmSession = secureStorage.getItem<string>('crm_auth_session') || localStorage.getItem('crm_auth_session') || sessionStorage.getItem('crm_auth_session');
    const hrmsProfile = secureStorage.getItem('hrms_user_profile') || localStorage.getItem('hrms_user_profile');
    return Boolean(hrmsToken || crmSession === 'true' || hrmsProfile);
  });
  const [showSecureAuthModal, setShowSecureAuthModal] = useState<boolean>(false);
  const [showWorkspaceChoiceModal, setShowWorkspaceChoiceModal] = useState<boolean>(false);
  const [showSubscriptionMeterModal, setShowSubscriptionMeterModal] = useState<boolean>(false);
  const [showAutomationsModal, setShowAutomationsModal] = useState<boolean>(false);
  const [automationInitialTab, setAutomationInitialTab] = useState<'payslip' | 'whatsapp' | 'geofence' | 'eod'>('payslip');
  const [authViewMode, setAuthViewMode] = useState<'login' | 'signup' | 'forgot'>('login');
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [signupName, setSignupName] = useState('');
  const [signupEmail, setSignupEmail] = useState('');
  const [signupPassword, setSignupPassword] = useState('');

  // Profile Modal State
  const [showProfileModal, setShowProfileModal] = useState<boolean>(false);
  const [profileName, setProfileName] = useState('');
  const [profileEmail, setProfileEmail] = useState('');
  const [profilePhotoUrl, setProfilePhotoUrl] = useState('');
  const [profileNewPassword, setProfileNewPassword] = useState('');
  const profilePhotoInputRef = useRef<HTMLInputElement | null>(null);
  const userPhotoInputRef = useRef<HTMLInputElement | null>(null);

  const handleUploadProfilePhoto = (file: File) => {
    if (!file.type.startsWith('image/')) {
      triggerToast("Please select a valid image file (PNG / JPG / WEBP).");
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => {
      const res = e.target?.result as string;
      if (res) {
        setProfilePhotoUrl(res);
        triggerToast("Profile photo selected! Click 'Save Profile Changes' to apply.");
      }
    };
    reader.readAsDataURL(file);
  };

  const handleUploadUserPhoto = (file: File) => {
    if (!file.type.startsWith('image/')) {
      triggerToast("Please select a valid image file (PNG / JPG / WEBP).");
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => {
      const res = e.target?.result as string;
      if (res) {
        setNewUserPhotoUrl(res);
        triggerToast("Team member photo selected!");
      }
    };
    reader.readAsDataURL(file);
  };


  // Bulk CSV Import Modal State
  const [showImportModal, setShowImportModal] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const backupFileInputRef = useRef<HTMLInputElement | null>(null);
  const attachmentFileInputRef = useRef<HTMLInputElement | null>(null);

  // AI Sales Assistant State
  const [showAiChat, setShowAiChat] = useState<boolean>(false);
  const [aiInput, setAiInput] = useState<string>('');
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    { id: 1, sender: 'ai', text: "Hello! I am your ITLC AI Sales Copilot. Add leads or deals to receive real-time intelligence and pipeline recommendations!" }
  ]);

  // Message Template Selector State in Drawer
  const [selectedTemplate, setSelectedTemplate] = useState<'demo' | 'quote' | 'sla'>('quote');

  // Drawer Sub-tab (Notes vs Call Logs vs Attachments)
  const [drawerActiveTab, setDrawerActiveTab] = useState<'notes' | 'calls' | 'docs'>('notes');
  const [callDurationInput, setCallDurationInput] = useState('3 mins');
  const [callOutcomeInput, setCallOutcomeInput] = useState<'Connected' | 'Interested' | 'Call Back Later' | 'Busy / No Answer' | 'Wrong Number'>('Connected');
  const [callNotesInput, setCallNotesInput] = useState('');

  // Broadcast & Campaigns State
  const [campaignAudience, setCampaignAudience] = useState<'ALL' | 'QUALIFIED' | 'VIP' | 'NEW'>('ALL');
  const [campaignChannel, setCampaignChannel] = useState<'WhatsApp' | 'Email'>('WhatsApp');
  const [campaignSubject, setCampaignSubject] = useState('Exclusive Corporate Upgrade Proposal');
  const [campaignBody, setCampaignBody] = useState('Hello {name},\nWe are pleased to offer a special upgrade package for {company}. Let us schedule a 10-min consultation call this week!\n\nBest regards,\n{rep}\n{company_name}');
  const [campaignHistory, setCampaignHistory] = useState<CampaignRecord[]>([
    { id: 1, title: 'Quarterly Kickoff Announcement', channel: 'Email', audience: 'All Leads', recipientsCount: 0, date: '2026-09-01', status: 'Sent' }
  ]);

  // Invoice generator state
  const [invoiceClientName, setInvoiceClientName] = useState('New Client');
  const [invoiceItemName, setInvoiceItemName] = useState('CRM Software License & Implementation');
  const [invoiceItemAmount, setInvoiceItemAmount] = useState<number>(50000);
  const [invoiceTaxRate, setInvoiceTaxRate] = useState<number>(18);
  const [invoiceDiscount, setInvoiceDiscount] = useState<number>(0);
  const [invoiceSignatoryName, setInvoiceSignatoryName] = useState('Admin (Managing Director)');
  const [includeStamp, setIncludeStamp] = useState<boolean>(true);
  const [includeMilestones, setIncludeMilestones] = useState<boolean>(false);
  const [includeUpiQr, setIncludeUpiQr] = useState<boolean>(true);
  const [invoiceUpiId, setInvoiceUpiId] = useState<string>('itlc.billing@okaxis');
  const [showShortcutsModal, setShowShortcutsModal] = useState<boolean>(false);
  const [customStampImage, setCustomStampImage] = useState<string | null>(() => {
    return localStorage.getItem('crm_custom_stamp_img');
  });
  const [invoiceTerms, setInvoiceTerms] = useState('Payment is due within 15 business days. This is a computer-generated tax invoice verified by digital seal.');


  // Voice Dictation (Speech-to-Text) State
  const [isRecordingNote, setIsRecordingNote] = useState<boolean>(false);
  const [isRecordingCall, setIsRecordingCall] = useState<boolean>(false);
  const speechRecognitionRef = useRef<any>(null);

  const startVoiceDictation = (target: 'note' | 'call') => {
    const SpeechRec = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRec) {
      triggerToast("Speech recognition is not supported in this browser. Try Chrome/Edge!");
      return;
    }

    try {
      const recognition = new SpeechRec();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = 'en-US';

      if (target === 'note') setIsRecordingNote(true);
      if (target === 'call') setIsRecordingCall(true);

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        if (target === 'note') {
          setNewNoteInput(prev => prev ? `${prev} ${transcript}` : transcript);
          setIsRecordingNote(false);
        } else {
          setCallNotesInput(prev => prev ? `${prev} ${transcript}` : transcript);
          setIsRecordingCall(false);
        }
        triggerToast("🎙️ Voice transcription added!");
      };

      recognition.onerror = () => {
        setIsRecordingNote(false);
        setIsRecordingCall(false);
        triggerToast("Voice recording stopped.");
      };

      recognition.onend = () => {
        setIsRecordingNote(false);
        setIsRecordingCall(false);
      };

      speechRecognitionRef.current = recognition;
      recognition.start();
      triggerToast("🎙️ Listening... Speak now!");
    } catch (err) {
      setIsRecordingNote(false);
      setIsRecordingCall(false);
      triggerToast("Could not access microphone.");
    }
  };

  const stopVoiceDictation = () => {
    if (speechRecognitionRef.current) {
      speechRecognitionRef.current.stop();
    }
    setIsRecordingNote(false);
    setIsRecordingCall(false);
  };

  // AI Smart Lead Temperature & Score Calculation
  const getLeadTemperature = (lead: Lead): { score: number; label: 'Hot' | 'Warm' | 'Cold'; icon: string } => {
    let score = 20;
    if (lead.status === 'Qualified') score += 35;
    else if (lead.status === 'Contacted') score += 20;
    else if (lead.status === 'New') score += 10;
    else if (lead.status === 'Lost') score -= 20;

    if (lead.value >= 100000) score += 25;
    else if (lead.value >= 50000) score += 15;

    if (lead.callLogs && lead.callLogs.length > 0) score += Math.min(25, lead.callLogs.length * 10);
    if (lead.notes && lead.notes.length > 0) score += Math.min(15, lead.notes.length * 5);
    if (lead.rating) score += (lead.rating - 3) * 5;

    score = Math.max(5, Math.min(100, score));

    if (score >= 75) return { score, label: 'Hot', icon: '🔥' };
    if (score >= 40) return { score, label: 'Warm', icon: '☀️' };
    return { score, label: 'Cold', icon: '❄️' };
  };

  // GPS Location Checkin for Field Sales
  const handleGpsCheckIn = (leadId: number) => {
    if (!navigator.geolocation) {
      triggerToast("Geolocation is not supported by your browser.");
      return;
    }
    triggerToast("📍 Fetching GPS location coordinates...");
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const lat = pos.coords.latitude.toFixed(5);
        const lng = pos.coords.longitude.toFixed(5);
        const gmapsLink = `https://www.google.com/maps?q=${lat},${lng}`;
        const newNote: LeadNote = {
          id: Date.now(),
          text: `📍 Field Meeting Check-in verified at GPS (${lat}, ${lng}). View Map: ${gmapsLink}`,
          date: new Date().toISOString().split('T')[0],
          author: currentUserContext.name
        };
        setLeads(leads.map(l => l.id === leadId ? { ...l, notes: [newNote, ...(l.notes || [])] } : l));
        if (selectedLeadForDrawer && selectedLeadForDrawer.id === leadId) {
          setSelectedLeadForDrawer({ ...selectedLeadForDrawer, notes: [newNote, ...(selectedLeadForDrawer.notes || [])] });
        }
        addAuditLog("GPS Check-in", `Logged physical site check-in at (${lat}, ${lng})`, 'lead');
        triggerToast("📍 Verified GPS Location Checked In!");
      },
      () => {
        triggerToast("Could not retrieve GPS location. Please allow location access.");
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  const stampFileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (customStampImage) {
      localStorage.setItem('crm_custom_stamp_img', customStampImage);
    } else {
      localStorage.removeItem('crm_custom_stamp_img');
    }
  }, [customStampImage]);

  const handleUploadStamp = (file: File) => {
    if (!file.type.startsWith('image/')) {
      triggerToast("Please select a valid image file (PNG / JPG / WEBP).");
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => {
      const res = e.target?.result as string;
      if (res) {
        setCustomStampImage(res);
        addAuditLog("Stamp Uploaded", `Uploaded custom corporate stamp image (${file.name})`, 'invoice');
        triggerToast("Official Custom Stamp Image Uploaded!");
      }
    };
    reader.readAsDataURL(file);
  };



  // Sync to LocalStorage
  useEffect(() => { localStorage.setItem('crm_leads', JSON.stringify(leads)); }, [leads]);
  useEffect(() => { localStorage.setItem('crm_users', JSON.stringify(users)); }, [users]);
  useEffect(() => { localStorage.setItem('crm_deals', JSON.stringify(deals)); }, [deals]);
  useEffect(() => { localStorage.setItem('crm_tasks', JSON.stringify(tasks)); }, [tasks]);
  useEffect(() => { localStorage.setItem('crm_tickets', JSON.stringify(tickets)); }, [tickets]);
  useEffect(() => { localStorage.setItem('crm_settings', JSON.stringify(settings)); }, [settings]);
  useEffect(() => { localStorage.setItem('crm_permissions', JSON.stringify(permissions)); }, [permissions]);
  useEffect(() => { 
    if (isAuthenticated) {
      sessionStorage.setItem('crm_auth_session', 'true');
    } else {
      sessionStorage.removeItem('crm_auth_session');
    }
  }, [isAuthenticated]);
  useEffect(() => { localStorage.setItem('crm_current_user', JSON.stringify(currentUserContext)); }, [currentUserContext]);
  useEffect(() => {
    localStorage.setItem('crm_dark_mode', darkMode.toString());
    const root = window.document.documentElement;
    if (darkMode) { root.classList.add('dark'); } else { root.classList.remove('dark'); }
  }, [darkMode]);

  // Navigation State
  const [dashboardTab, setDashboardTab] = useState<'overview' | 'team' | 'leads' | 'deals'>('overview');
  const [showNotifDropdown, setShowNotifDropdown] = useState<boolean>(false);

  // Date Presets Filter for Dashboard
  const [datePreset, setDatePreset] = useState<'ALL' | 'TODAY' | 'WEEK' | 'MONTH'>('ALL');

  // Search & Filters
  const [leadSearch, setLeadSearch] = useState<string>('');
  const [leadStatusFilter, setLeadStatusFilter] = useState<string>('ALL');
  const [leadSourceFilter, setLeadSourceFilter] = useState<string>('ALL');
  const [leadTagFilter, setLeadTagFilter] = useState<string>('ALL');
  const [selectedLeadIds, setSelectedLeadIds] = useState<number[]>([]);
  
  const [dealSearch, setDealSearch] = useState<string>('');
  const [dealStageFilter, setDealStageFilter] = useState<string>('ALL');
  
  const [userSearch, setUserSearch] = useState<string>('');
  const [userRoleFilter, setUserRoleFilter] = useState<string>('ALL');

  // Modals & Drawers
  const [showLeadModal, setShowLeadModal] = useState<boolean>(false);
  const [editingLead, setEditingLead] = useState<Lead | null>(null);
  const [selectedLeadForDrawer, setSelectedLeadForDrawer] = useState<Lead | null>(null);
  const [newNoteInput, setNewNoteInput] = useState<string>('');

  const [showDealModal, setShowDealModal] = useState<boolean>(false);
  const [editingDeal, setEditingDeal] = useState<Deal | null>(null);

  const [showTaskModal, setShowTaskModal] = useState<boolean>(false);
  const [taskFormTitle, setTaskFormTitle] = useState('');
  const [taskFormDate, setTaskFormDate] = useState(new Date().toISOString().split('T')[0]);
  const [taskFormPriority, setTaskFormPriority] = useState<'High' | 'Medium' | 'Low'>('Medium');
  const [taskFormAssignee, setTaskFormAssignee] = useState('Admin');

  const [showUserModal, setShowUserModal] = useState<boolean>(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);

  const [showExportModal, setShowExportModal] = useState<boolean>(false);

  // Lead Form
  const [leadFormName, setLeadFormName] = useState('');
  const [leadFormEmail, setLeadFormEmail] = useState('');
  const [leadFormPhone, setLeadFormPhone] = useState('');
  const [leadFormSource, setLeadFormSource] = useState<'Website' | 'LinkedIn' | 'Email' | 'Referrals' | 'Other'>('Website');
  const [leadFormValue, setLeadFormValue] = useState<number>(25000);
  const [leadFormStatus, setLeadFormStatus] = useState<string>('New');
  const [leadFormRep, setLeadFormRep] = useState('Admin');
  const [leadFormTag, setLeadFormTag] = useState<'VIP Client' | 'Urgent' | 'Enterprise' | 'Hot Deal' | 'Standard'>('Standard');
  const [leadFormCustomVals, setLeadFormCustomVals] = useState<Record<string, string>>({});

  // Deal Form
  const [dealFormName, setDealFormName] = useState('');
  const [dealFormValue, setDealFormValue] = useState<number>(50000);
  const [dealFormStage, setDealFormStage] = useState<'Proposal' | 'Negotiation' | 'Closed'>('Proposal');
  const [dealFormProb, setDealFormProb] = useState<number>(50);
  const [dealFormDate, setDealFormDate] = useState(new Date().toISOString().split('T')[0]);
  const [dealFormRep, setDealFormRep] = useState('Admin');
  const [dealFormTag, setDealFormTag] = useState<'VIP Client' | 'Urgent' | 'Enterprise' | 'Hot Deal' | 'Standard'>('Standard');

  // User Form
  const [newUserName, setNewUserName] = useState('');
  const [newUserEmail, setNewUserEmail] = useState('');
  const [newUserRole, setNewUserRole] = useState<'Super Admin' | 'Admin' | 'Sales Manager' | 'Sales Rep' | 'Support Agent' | 'Client'>('Sales Rep');
  const [newUserStatus, setNewUserStatus] = useState<'Active' | 'Inactive'>('Active');
  const [newUserPhotoUrl, setNewUserPhotoUrl] = useState<string>('');

  // Reports
  const [reportType, setReportType] = useState<'revenue' | 'conversion' | 'reps'>('revenue');
  const [reportTimeframe, setReportTimeframe] = useState<'q1' | 'q2' | 'ytd'>('ytd');
  const [generatedReport, setGeneratedReport] = useState<any[] | null>(null);

  // Drag and Drop state
  const [draggedLeadId, setDraggedLeadId] = useState<number | null>(null);
  const [dragOverCol, setDragOverCol] = useState<string | null>(null);

  // Toast Alerts
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3200);
  };

  // Notifications
  const [notifications, setNotifications] = useState<{ id: number; text: string; time: string }[]>([]);

  // Currency
  const currencySymbol = useMemo(() => {
    switch (settings.currency) {
      case 'EUR': return '€';
      case 'INR': return '₹';
      default: return '$';
    }
  }, [settings.currency]);

  // Permissions Check
  const hasPermission = (perm: string) => {
    const role = currentUserContext.role;
    if (role === 'Super Admin' || role === 'Admin') return true;
    const roleKey = role === 'Sales Manager' ? 'Manager' : role === 'Sales Rep' ? 'Rep' : role === 'Support Agent' ? 'Support' : role === 'Client' ? 'Client' : role;
    const rolePerms = permissions[roleKey] || permissions[role] || [];
    return rolePerms.includes(perm);
  };

  // Date Filtered Leads for Dashboard KPIs
  const dateFilteredLeads = useMemo(() => {
    if (datePreset === 'ALL') return leads;
    const now = new Date();
    const todayStr = now.toISOString().split('T')[0];
    if (datePreset === 'TODAY') { return leads.filter(l => l.date === todayStr); }
    if (datePreset === 'WEEK') {
      const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
      return leads.filter(l => l.date >= oneWeekAgo);
    }
    if (datePreset === 'MONTH') {
      const oneMonthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
      return leads.filter(l => l.date >= oneMonthAgo);
    }
    return leads;
  }, [leads, datePreset]);

  // Live Calculations (Based 100% on real data)
  const closedDealsSum = useMemo(() => deals.filter(d => d.stage === 'Closed').reduce((sum, d) => sum + d.value, 0), [deals]);
  const qualifiedLeadsSum = useMemo(() => dateFilteredLeads.filter(l => l.status === 'Qualified').reduce((sum, l) => sum + l.value, 0), [dateFilteredLeads]);
  
  const currentTotalRevenue = useMemo(() => {
    return closedDealsSum + qualifiedLeadsSum;
  }, [closedDealsSum, qualifiedLeadsSum]);

  const rawPercentOfTarget = useMemo(() => {
    if (!settings.revenueGoal || settings.revenueGoal === 0) return 0;
    return (currentTotalRevenue / settings.revenueGoal) * 100;
  }, [currentTotalRevenue, settings.revenueGoal]);

  const revenuePercentOfTarget = useMemo(() => {
    return rawPercentOfTarget.toFixed(1);
  }, [rawPercentOfTarget]);

  const activeLeadsCount = useMemo(() => dateFilteredLeads.filter(l => l.status !== 'Lost').length, [dateFilteredLeads]);
  const activeDealsCount = useMemo(() => deals.filter(d => d.stage !== 'Closed').length, [deals]);
  const pipelineValue = useMemo(() => {
    const activeLeadsVal = dateFilteredLeads.filter(l => l.status === 'Contacted' || l.status === 'Qualified').reduce((sum, l) => sum + l.value, 0);
    const activeDealsVal = deals.filter(d => d.stage !== 'Closed').reduce((sum, d) => sum + d.value, 0);
    return activeLeadsVal + activeDealsVal;
  }, [dateFilteredLeads, deals]);

  // Overdue SLA & Alerts
  const todayStr = useMemo(() => new Date().toISOString().split('T')[0], []);
  const overdueTasks = useMemo(() => tasks.filter(t => !t.completed && t.dueDate <= todayStr), [tasks, todayStr]);
  const attentionLeads = useMemo(() => leads.filter(l => l.status === 'New' && (!l.callLogs || l.callLogs.length === 0)), [leads]);

  // Ranked Reps for Leaderboard
  const rankedReps = useMemo(() => {
    return users.map(u => {
      const uDeals = deals.filter(d => d.assignedRep === u.name);
      const closedDeals = uDeals.filter(d => d.stage === 'Closed');
      const totalClosedVal = closedDeals.reduce((sum, d) => sum + d.value, 0);
      const commission = Math.round(totalClosedVal * (settings.commissionRate / 100));
      const winRate = uDeals.length > 0 ? Math.round((closedDeals.length / uDeals.length) * 100) : 0;
      return {
        ...u,
        closedDealsCount: closedDeals.length,
        totalClosedVal,
        commission,
        winRate
      };
    }).sort((a, b) => b.totalClosedVal - a.totalClosedVal);
  }, [users, deals, settings.commissionRate]);

  // Incentive Simulator Computations
  const simBaseCommission = useMemo(() => {
    return Math.round(simulatedSales * (settings.commissionRate / 100));
  }, [simulatedSales, settings.commissionRate]);

  const simTierBonus = useMemo(() => {
    if (simulatedSales >= 2000000) return 100000;
    if (simulatedSales >= 1000000) return 40000;
    if (simulatedSales >= 500000) return 15000;
    return 0;
  }, [simulatedSales]);

  const simTotalPayout = useMemo(() => {
    return simBaseCommission + simTierBonus;
  }, [simBaseCommission, simTierBonus]);

  // Audience calculation for Campaign Broadcast
  const targetAudienceLeads = useMemo(() => {
    if (campaignAudience === 'QUALIFIED') return leads.filter(l => l.status === 'Qualified');
    if (campaignAudience === 'VIP') return leads.filter(l => l.tag === 'VIP Client');
    if (campaignAudience === 'NEW') return leads.filter(l => l.status === 'New');
    return leads;
  }, [leads, campaignAudience]);

  // Sales Funnel Data Calculations
  const funnelStats = useMemo(() => {
    const totalLeads = leads.length;
    const contactedLeads = leads.filter(l => l.status === 'Contacted' || l.status === 'Qualified').length;
    const qualifiedLeads = leads.filter(l => l.status === 'Qualified').length;
    const closedDeals = deals.filter(d => d.stage === 'Closed').length;

    const contactedPct = totalLeads > 0 ? Math.round((contactedLeads / totalLeads) * 100) : 0;
    const qualifiedPct = totalLeads > 0 ? Math.round((qualifiedLeads / totalLeads) * 100) : 0;
    const closedPct = totalLeads > 0 ? Math.round((closedDeals / totalLeads) * 100) : (closedDeals > 0 ? 100 : 0);

    return {
      totalLeads,
      contactedLeads,
      qualifiedLeads,
      closedDeals,
      contactedPct,
      qualifiedPct,
      closedPct
    };
  }, [leads, deals]);

  // Dynamic Pie Chart
  const pieChartData = useMemo(() => {
    const sources = ['Website', 'LinkedIn', 'Email', 'Referrals', 'Other'] as const;
    const counts = sources.map(src => dateFilteredLeads.filter(l => l.source === src).length);
    const total = dateFilteredLeads.length;
    const percentages = total > 0 ? counts.map(c => Math.round((c / total) * 100)) : [0, 0, 0, 0, 0];

    return {
      labels: ['Website', 'LinkedIn', 'Email', 'Referrals', 'Other'],
      datasets: [
        {
          data: percentages,
          backgroundColor: ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'],
          borderWidth: darkMode ? 2 : 1,
          borderColor: darkMode ? '#0f1629' : '#ffffff'
        }
      ]
    };
  }, [dateFilteredLeads, darkMode]);

  // Dynamic Line Chart
  const lineChartData = useMemo(() => {
    const dataPoints = currentTotalRevenue > 0
      ? [
          Math.round(currentTotalRevenue * 0.1),
          Math.round(currentTotalRevenue * 0.25),
          Math.round(currentTotalRevenue * 0.45),
          Math.round(currentTotalRevenue * 0.7),
          Math.round(currentTotalRevenue * 0.85),
          currentTotalRevenue
        ]
      : [0, 0, 0, 0, 0, 0];

    return {
      labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
      datasets: [
        {
          label: 'Actual Revenue',
          data: dataPoints,
          borderColor: darkMode ? '#38bdf8' : '#3b82f6',
          backgroundColor: 'rgba(59, 130, 246, 0.08)',
          tension: 0.35,
          fill: true,
          borderWidth: 2.5,
          pointBackgroundColor: darkMode ? '#38bdf8' : '#3b82f6',
          pointRadius: 4,
          pointHoverRadius: 6
        },
        {
          label: 'Target Revenue Goal',
          data: [
            Math.round(settings.revenueGoal * 0.2),
            Math.round(settings.revenueGoal * 0.35),
            Math.round(settings.revenueGoal * 0.5),
            Math.round(settings.revenueGoal * 0.65),
            Math.round(settings.revenueGoal * 0.8),
            settings.revenueGoal
          ],
          borderColor: '#10b981',
          borderDash: [5, 5],
          fill: false,
          tension: 0.1,
          borderWidth: 1.5,
          pointRadius: 0
        }
      ]
    };
  }, [currentTotalRevenue, settings.revenueGoal, darkMode]);

  const lineChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: true,
        position: 'top' as const,
        labels: { color: darkMode ? '#94a3b8' : '#64748b', font: { family: 'Outfit', size: 12 } }
      }
    },
    scales: {
      y: {
        grid: { color: darkMode ? 'rgba(30, 41, 59, 0.5)' : 'rgba(241, 245, 249, 0.9)' },
        ticks: {
          color: darkMode ? '#94a3b8' : '#64748b',
          callback: (val: any) => `${currencySymbol}${(val / 1000).toFixed(0)}k`,
          font: { family: 'Outfit' }
        }
      },
      x: {
        grid: { display: false },
        ticks: { color: darkMode ? '#94a3b8' : '#64748b', font: { family: 'Outfit' } }
      }
    }
  };

  const pieChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'right' as const,
        labels: { color: darkMode ? '#94a3b8' : '#64748b', font: { family: 'Outfit', size: 12 }, boxWidth: 12, padding: 16 }
      }
    }
  };

  // Helper for tag style
  const getTagClass = (tag?: string) => {
    switch(tag) {
      case 'VIP Client': return 'tag-vip';
      case 'Urgent': return 'tag-urgent';
      case 'Enterprise': return 'tag-enterprise';
      case 'Hot Deal': return 'tag-hot';
      default: return '';
    }
  };

  const getCallOutcomeClass = (outcome: string) => {
    switch(outcome) {
      case 'Connected': return 'call-outcome-connected';
      case 'Interested': return 'call-outcome-interested';
      case 'Call Back Later': return 'call-outcome-callback';
      case 'Busy / No Answer':
      case 'Wrong Number': return 'call-outcome-busy';
      default: return 'call-outcome-connected';
    }
  };

  // Filtered Leads
  const filteredLeads = useMemo(() => {
    return leads.filter(l => {
      const matchSearch = l.name.toLowerCase().includes(leadSearch.toLowerCase()) || 
                          l.email.toLowerCase().includes(leadSearch.toLowerCase()) ||
                          (l.phone && l.phone.includes(leadSearch));
      const matchStatus = leadStatusFilter === 'ALL' || l.status === leadStatusFilter;
      const matchSource = leadSourceFilter === 'ALL' || l.source === leadSourceFilter;
      const matchTag = leadTagFilter === 'ALL' || l.tag === leadTagFilter;
      return matchSearch && matchStatus && matchSource && matchTag;
    });
  }, [leads, leadSearch, leadStatusFilter, leadSourceFilter, leadTagFilter]);

  // Filtered Deals
  const filteredDeals = useMemo(() => {
    return deals.filter(d => {
      const matchSearch = d.name.toLowerCase().includes(dealSearch.toLowerCase());
      const matchStage = dealStageFilter === 'ALL' || d.stage === dealStageFilter;
      return matchSearch && matchStage;
    });
  }, [deals, dealSearch, dealStageFilter]);

  // Filtered Users
  const filteredUsers = useMemo(() => {
    return users.filter(u => {
      const matchSearch = u.name.toLowerCase().includes(userSearch.toLowerCase()) || u.email.toLowerCase().includes(userSearch.toLowerCase());
      const matchRole = userRoleFilter === 'ALL' || u.role === userRoleFilter;
      return matchSearch && matchRole;
    });
  }, [users, userSearch, userRoleFilter]);

  // Universal Spotlight Multi-Suite Command & Search Engine
  const spotlightResults = useMemo(() => {
    const allUniversalActions: { 
      label: string; 
      sublabel: string; 
      category: 'HRMS' | 'CRM' | 'Super Admin' | 'System'; 
      keywords: string[]; 
      icon: string;
      action: () => void; 
    }[] = [
      // HRMS ACTIONS
      {
        label: "👑 OmniStaff HRMS Super Owner SaaS Control Room",
        sublabel: "Manage multi-tenant HRMS company accounts, SaaS plans, revenue & security",
        category: "HRMS",
        keywords: ["superowner", "super owner", "hrms superowner", "hrms admin", "control room", "omnistaff superowner"],
        icon: "👑",
        action: () => {
          setShowSpotlight(false);
          setActiveSuite('hrms');
          setShowIntroLaunchpad(false);
          window.location.hash = 'superowner';
          triggerToast("👑 Opening OmniStaff HRMS Super Owner Portal");
        }
      },
      {
        label: "+ Add New Employee to HRMS",
        sublabel: "Register new staff member with department, shift & salary tier",
        category: "HRMS",
        keywords: ["hrms", "employee", "staff", "add employee", "add staff", "worker", "joining", "hr", "omnistaff"],
        icon: "👥",
        action: () => {
          setShowSpotlight(false);
          setActiveSuite('hrms');
          setShowIntroLaunchpad(false);
          triggerToast("Switched to OmniStaff HRMS — Opening Employee Management");
        }
      },
      {
        label: "Live 24-Cell Biometric Attendance Radar",
        sublabel: "View real-time punch clock-in matrix & biometric shift compliance",
        category: "HRMS",
        keywords: ["biometric", "attendance", "radar", "punch", "checkin", "timesheet"],
        icon: "📡",
        action: () => {
          setShowSpotlight(false);
          setActiveSuite('hrms');
          setShowIntroLaunchpad(false);
          triggerToast("Viewing Live Biometric Attendance Radar");
        }
      },
      {
        label: "Generate 1-Click Salary Slips & Payroll (PDF + WhatsApp)",
        sublabel: "Automate PF/ESI, allowances, deductions & direct WhatsApp dispatch",
        category: "HRMS",
        keywords: ["payroll", "salary", "payslip", "salary slip", "pf", "esi", "whatsapp payslip"],
        icon: "💵",
        action: () => {
          setShowSpotlight(false);
          setAutomationInitialTab('payslip');
          setShowAutomationsModal(true);
        }
      },
      {
        label: "WhatsApp Cloud Business Automation & Broadcast",
        sublabel: "Dispatch welcome leads, GST invoice payment links & shift reminders",
        category: "CRM",
        keywords: ["whatsapp", "broadcast", "wa", "message", "lead welcome"],
        icon: "💬",
        action: () => {
          setShowSpotlight(false);
          setAutomationInitialTab('whatsapp');
          setShowAutomationsModal(true);
        }
      },
      {
        label: "Manage Leave Requests & Shift Scheduling",
        sublabel: "Approve sick/casual leaves, assign rotational duty shifts",
        category: "HRMS",
        keywords: ["leave", "vacation", "holiday", "shift", "approval"],
        icon: "🌴",
        action: () => {
          setShowSpotlight(false);
          setActiveSuite('hrms');
          setShowIntroLaunchpad(false);
          triggerToast("Viewing Shifts & Leave Management");
        }
      },
      {
        label: "GPS Geofenced Mobile Attendance & Field Radar",
        sublabel: "50m perimeter check-in enforcement & field sales meeting logger",
        category: "HRMS",
        keywords: ["gps", "geofence", "mobile checkin", "location", "radius", "field radar"],
        icon: "🗺️",
        action: () => {
          setShowSpotlight(false);
          setAutomationInitialTab('geofence');
          setShowAutomationsModal(true);
        }
      },
      {
        label: "Send Daily Owner Executive Evening (EOD) Report",
        sublabel: "Dispatch daily attendance, CRM conversions & revenue summary to Owner",
        category: "CRM",
        keywords: ["eod", "daily report", "executive digest", "owner report", "summary"],
        icon: "📊",
        action: () => {
          setShowSpotlight(false);
          setAutomationInitialTab('eod');
          setShowAutomationsModal(true);
        }
      },

      // CRM ACTIONS
      {
        label: "+ Add New Sales Lead",
        sublabel: "Create new incoming business inquiry with value & contact details",
        category: "CRM",
        keywords: ["lead", "add lead", "new lead", "inquiry", "client lead"],
        icon: "💼",
        action: () => {
          setShowSpotlight(false);
          if (!isAuthenticated) {
            setShowSecureAuthModal(true);
            triggerToast("🔒 Please sign in to access Sales CRM");
            return;
          }
          setActiveSuite('crm');
          setShowIntroLaunchpad(false);
          openAddLeadModal();
        }
      },
      {
        label: "+ Create New High-Value Deal",
        sublabel: "Add high-probability sales proposal into Kanban revenue pipeline",
        category: "CRM",
        keywords: ["deal", "add deal", "new deal", "pipeline deal", "revenue"],
        icon: "📈",
        action: () => {
          setShowSpotlight(false);
          if (!isAuthenticated) {
            setShowSecureAuthModal(true);
            triggerToast("🔒 Please sign in to access Sales CRM");
            return;
          }
          setActiveSuite('crm');
          setShowIntroLaunchpad(false);
          openAddDealModal();
        }
      },
      {
        label: "Switch to Visual Deals Kanban Board",
        sublabel: "Drag and drop deals across Proposal, Negotiation & Closed stages",
        category: "CRM",
        keywords: ["kanban", "board", "pipeline", "stages", "deals board"],
        icon: "📋",
        action: () => {
          setShowSpotlight(false);
          if (!isAuthenticated) {
            setShowSecureAuthModal(true);
            triggerToast("🔒 Please sign in to access Sales CRM");
            return;
          }
          setActiveSuite('crm');
          setActiveView('kanban');
          setShowIntroLaunchpad(false);
        }
      },
      {
        label: "Create GST Tax Invoice with UPI QR Embed",
        sublabel: "Issue GST-compliant invoices with instant payment QR & PDF export",
        category: "CRM",
        keywords: ["invoice", "tax", "gst", "bill", "billing", "upi", "qr"],
        icon: "🧾",
        action: () => {
          setShowSpotlight(false);
          if (!isAuthenticated) {
            setShowSecureAuthModal(true);
            triggerToast("🔒 Please sign in to access Invoicing");
            return;
          }
          setActiveSuite('crm');
          setActiveView('invoices');
          setShowIntroLaunchpad(false);
        }
      },
      {
        label: "Broadcast WhatsApp / Email Campaign",
        sublabel: "Send personalized broadcast blasts to Qualified or VIP leads",
        category: "CRM",
        keywords: ["campaign", "broadcast", "whatsapp", "email", "marketing"],
        icon: "📢",
        action: () => {
          setShowSpotlight(false);
          if (!isAuthenticated) {
            setShowSecureAuthModal(true);
            triggerToast("🔒 Please sign in to access Campaigns");
            return;
          }
          setActiveSuite('crm');
          setActiveView('campaigns');
          setShowIntroLaunchpad(false);
        }
      },
      {
        label: "💎 Live Cloud Storage & Subscription Quota Meter",
        sublabel: "View live GB usage, days left, purchase receipt & instant upgrades",
        category: "CRM",
        keywords: ["subscription", "storage", "quota", "gb", "validity", "meter", "billing", "renew", "upgrade"],
        icon: "💾",
        action: () => {
          setShowSpotlight(false);
          setShowSubscriptionMeterModal(true);
        }
      },
      {
        label: "Log GPS Field Meeting Check-in",
        sublabel: "Verify on-ground physical client meeting with GPS coordinates",
        category: "CRM",
        keywords: ["gps checkin", "field sales", "meeting", "site visit", "location checkin"],
        icon: "📍",
        action: () => {
          setShowSpotlight(false);
          if (!isAuthenticated) {
            setShowSecureAuthModal(true);
            triggerToast("🔒 Please sign in to access GPS Field Tracker");
            return;
          }
          setActiveSuite('crm');
          setActivePortal('rep');
          setActiveView('dashboard');
          setShowIntroLaunchpad(false);
          triggerToast("Switched to Field Sales Rep view");
        }
      },
      {
        label: "Raise Client Support Ticket / SLA Helpdesk",
        sublabel: "Log billing, technical or general enterprise inquiry ticket",
        category: "CRM",
        keywords: ["ticket", "support", "helpdesk", "issue", "sla"],
        icon: "🎧",
        action: () => {
          setShowSpotlight(false);
          if (!isAuthenticated) {
            setShowSecureAuthModal(true);
            triggerToast("🔒 Please sign in to access Support Desk");
            return;
          }
          setShowTicketModal(true);
        }
      },

      // HRMS & ADMIN LOGIN ACTIONS
      {
        label: "🔐 OmniStaff HRMS & Admin Login Portal",
        sublabel: "Login to HRMS Admin, Manager, Employee or Superowner workspace",
        category: "HRMS",
        keywords: ["admin", "super admin", "superadmin", "open admin", "login admin", "login", "hrms login", "hrms admin", "master", "super", "governance", "security"],
        icon: "🔐",
        action: () => {
          setShowSpotlight(false);
          setActiveSuite('hrms');
          setShowIntroLaunchpad(false);
          setIsSuperAdminMasterActive(false);
          triggerToast("🔐 Opening OmniStaff HRMS Login Portal");
        }
      },
      {
        label: "RBAC Roles & Permissions Governance",
        sublabel: "Configure granular permissions matrix per user role",
        category: "Super Admin",
        keywords: ["role", "roles", "permission", "rbac", "access control", "super admin"],
        icon: "🛡️",
        action: () => {
          setShowSpotlight(false);
          if (!isAuthenticated) {
            setShowSecureAuthModal(true);
            triggerToast("🔒 Please sign in as Super Admin");
            return;
          }
          setActiveSuite('crm');
          setActiveView('roles');
          setShowIntroLaunchpad(false);
        }
      },
      {
        label: "Manage Team Users & Staff Accounts",
        sublabel: "Invite, edit, activate or remove company staff members",
        category: "Super Admin",
        keywords: ["users", "team", "members", "accounts", "passwords"],
        icon: "👥",
        action: () => {
          setShowSpotlight(false);
          if (!isAuthenticated) {
            setShowSecureAuthModal(true);
            triggerToast("🔒 Please sign in as Super Admin");
            return;
          }
          setActiveSuite('crm');
          setActiveView('users');
          setShowIntroLaunchpad(false);
        }
      },
      {
        label: "System Settings, Currency & Custom Tax Fields",
        sublabel: "Edit company details, default currency, commission % & custom fields",
        category: "Super Admin",
        keywords: ["settings", "company", "currency", "commission", "custom fields", "gstin"],
        icon: "⚙️",
        action: () => {
          setShowSpotlight(false);
          if (!isAuthenticated) {
            setShowSecureAuthModal(true);
            triggerToast("🔒 Please sign in as Super Admin");
            return;
          }
          setActiveSuite('crm');
          setActiveView('settings');
          setShowIntroLaunchpad(false);
        }
      },
      {
        label: "Download Full JSON Disaster Recovery Backup",
        sublabel: "Export complete database state (Leads, Deals, Staff, Invoices, Logs)",
        category: "Super Admin",
        keywords: ["backup", "export", "json", "disaster recovery", "database download"],
        icon: "💾",
        action: () => {
          setShowSpotlight(false);
          if (!isAuthenticated) {
            setShowSecureAuthModal(true);
            triggerToast("🔒 Please sign in to download backup");
            return;
          }
          handleDownloadFullBackup();
        }
      },
      {
        label: "Restore System from JSON Backup File",
        sublabel: "Import and restore complete enterprise workspace state",
        category: "Super Admin",
        keywords: ["restore", "import backup", "recover"],
        icon: "📂",
        action: () => {
          setShowSpotlight(false);
          if (!isAuthenticated) {
            setShowSecureAuthModal(true);
            triggerToast("🔒 Please sign in to restore backup");
            return;
          }
          backupFileInputRef.current?.click();
        }
      },
      {
        label: "Upload Custom Corporate Stamp / Seal",
        sublabel: "Upload official digital seal image to print on GST tax invoices",
        category: "Super Admin",
        keywords: ["stamp", "seal", "logo", "official seal"],
        icon: "🖼️",
        action: () => {
          setShowSpotlight(false);
          stampFileInputRef.current?.click();
        }
      },
      {
        label: "Sync Cloud Database to Backend (Port 5000)",
        sublabel: "Synchronize local offline cache with live cloud server",
        category: "System",
        keywords: ["sync", "cloud", "database", "backend", "port 5000"],
        icon: "⚡",
        action: () => {
          setShowSpotlight(false);
          syncToCloudServer();
        }
      },
      {
        label: "Toggle Dark / Light Theme Mode",
        sublabel: "Switch interface appearance between Dark Obsidian and Bright White",
        category: "System",
        keywords: ["dark", "light", "theme", "mode", "color"],
        icon: darkMode ? "☀️" : "🌙",
        action: () => {
          setShowSpotlight(false);
          setDarkMode(!darkMode);
          triggerToast(darkMode ? "Light Theme Activated" : "Dark Obsidian Theme Activated");
        }
      },
      {
        label: "Switch Interface Language",
        sublabel: "Change entire UI language between Hindi and English",
        category: "System",
        keywords: ["language", "hindi", "english", "lang"],
        icon: "🌐",
        action: () => {
          setShowSpotlight(false);
          const next = lang === 'en' ? 'hi' : 'en';
          setLang(next);
          triggerToast("Language set to English");
        }
      }
    ];

    if (!spotlightQuery.trim()) {
      return {
        actions: allUniversalActions.slice(0, 7),
        leads: leads.slice(0, 3),
        deals: deals.slice(0, 3),
        users: users.slice(0, 3),
        tasks: tasks.slice(0, 3),
        tickets: tickets.slice(0, 3)
      };
    }

    const q = spotlightQuery.toLowerCase();
    const filteredActions = allUniversalActions.filter(act => 
      act.label.toLowerCase().includes(q) || 
      act.sublabel.toLowerCase().includes(q) || 
      act.category.toLowerCase().includes(q) || 
      act.keywords.some(k => k.toLowerCase().includes(q))
    );

    const matchingLeads = leads.filter(l => 
      l.name.toLowerCase().includes(q) || 
      l.email.toLowerCase().includes(q) || 
      (l.phone && l.phone.includes(q)) || 
      l.status.toLowerCase().includes(q) ||
      (l.tag && l.tag.toLowerCase().includes(q))
    ).slice(0, 5);

    const matchingDeals = deals.filter(d => 
      d.name.toLowerCase().includes(q) || 
      d.stage.toLowerCase().includes(q) || 
      (d.assignedRep && d.assignedRep.toLowerCase().includes(q))
    ).slice(0, 5);

    const matchingUsers = users.filter(u => 
      u.name.toLowerCase().includes(q) || 
      u.email.toLowerCase().includes(q) || 
      u.role.toLowerCase().includes(q)
    ).slice(0, 5);

    const matchingTasks = tasks.filter(t => 
      t.title.toLowerCase().includes(q) || 
      t.assignedTo.toLowerCase().includes(q) || 
      t.priority.toLowerCase().includes(q)
    ).slice(0, 4);

    const matchingTickets = tickets.filter(t => 
      t.subject.toLowerCase().includes(q) || 
      t.clientName.toLowerCase().includes(q) || 
      t.ticketNo.toLowerCase().includes(q) ||
      t.status.toLowerCase().includes(q)
    ).slice(0, 4);

    return {
      actions: filteredActions,
      leads: matchingLeads,
      deals: matchingDeals,
      users: matchingUsers,
      tasks: matchingTasks,
      tickets: matchingTickets
    };
  }, [spotlightQuery, leads, deals, users, tasks, tickets, darkMode, lang, activePortal, currentUserContext]);

  // Google Calendar URL Generator
  const getGoogleCalendarUrl = (task: Task) => {
    const title = encodeURIComponent(`${settings.companyName}: ${task.title}`);
    const details = encodeURIComponent(`CRM Task assigned to ${task.assignedTo}. Priority: ${task.priority}`);
    const dateFormatted = task.dueDate.replace(/-/g, '');
    const dates = `${dateFormatted}T090000Z/${dateFormatted}T100000Z`;
    return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&details=${details}&dates=${dates}`;
  };

  // Download .ICS Calendar Invite File
  const downloadICSFile = (task: Task) => {
    const dateFormatted = task.dueDate.replace(/-/g, '');
    const icsContent = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//ITLC CRM//Meeting Scheduler//EN',
      'BEGIN:VEVENT',
      `UID:${Date.now()}@itlccrm.com`,
      `DTSTAMP:${dateFormatted}T090000Z`,
      `DTSTART:${dateFormatted}T090000Z`,
      `DTEND:${dateFormatted}T100000Z`,
      `SUMMARY:${task.title}`,
      `DESCRIPTION:Assigned to ${task.assignedTo}. Priority: ${task.priority}`,
      'STATUS:CONFIRMED',
      'END:VEVENT',
      'END:VCALENDAR'
    ].join('\r\n');

    const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
    const link = document.createElement('a');
    link.href = window.URL.createObjectURL(blob);
    link.setAttribute('download', `${task.title.replace(/\s+/g, '_')}_Invite.ics`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    triggerToast("📥 .ICS Calendar invite downloaded!");
  };

  // WhatsApp & Email Message Template Customizer
  const getTemplateText = (template: 'demo' | 'quote' | 'sla', name: string, val: number) => {
    if (template === 'demo') {
      return `Hi ${name}, thank you for exploring ${settings.companyName}. We would love to arrange a personalized walkthrough demo of our enterprise platform for your team. What time works best this week?`;
    }
    if (template === 'sla') {
      return `Hello ${name}, regarding our Enterprise SLA and contract terms for ${currencySymbol}${val.toLocaleString()}. We have attached the revised agreement for final review and signature.`;
    }
    return `Hello ${name}, thank you for your interest in ${settings.companyName}. We have prepared a customized proposal worth ${currencySymbol}${val.toLocaleString()} tailored to your operations. Let us know when you'd like to review!`;
  };

  const getWhatsAppUrl = (phone?: string, name?: string, val?: number) => {
    const cleanNumber = phone ? phone.replace(/[^0-9]/g, '') : '919876543210';
    const text = encodeURIComponent(getTemplateText(selectedTemplate, name || 'Client', val || 50000));
    return `https://wa.me/${cleanNumber}?text=${text}`;
  };

  const getEmailUrl = (email: string, name: string, val?: number) => {
    const subject = encodeURIComponent(`${settings.companyName} - Proposal & Consultation`);
    const body = encodeURIComponent(getTemplateText(selectedTemplate, name, val || 50000) + `\n\nBest regards,\n${currentUserContext.name}\n${settings.companyName}`);
    return `mailto:${email}?subject=${subject}&body=${body}`;
  };

  // Real File Downloader (CSV Blob Generator)
  const downloadRealCSV = (type: 'leads' | 'deals') => {
    let csvContent = "data:text/csv;charset=utf-8,";
    if (type === 'leads') {
      csvContent += "ID,Name,Email,Phone,Source,Value,Status,Tag,Date,AssignedRep\n";
      leads.forEach(l => {
        csvContent += `"${l.id}","${l.name}","${l.email}","${l.phone || ''}","${l.source}","${l.value}","${l.status}","${l.tag || 'Standard'}","${l.date}","${l.assignedRep || ''}"\n`;
      });
    } else {
      csvContent += "ID,DealName,Value,Stage,Probability,Tag,CloseDate,AssignedRep\n";
      deals.forEach(d => {
        csvContent += `"${d.id}","${d.name}","${d.value}","${d.stage}","${d.probability}%","${d.tag || 'Standard'}","${d.closeDate || ''}","${d.assignedRep || ''}"\n`;
      });
    }
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `${settings.companyName}_${type}_export_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    addAuditLog("Exported CSV", `Exported ${leads.length} leads and deals as .CSV`, 'system');
    triggerToast(`Actual ${type.toUpperCase()} .csv file downloaded!`);
  };

  // Full System Backup Exporter
  const handleDownloadFullBackup = () => {
    const backupData = {
      system: settings.companyName,
      version: '2.0-PRO',
      exportDate: new Date().toISOString(),
      leads,
      deals,
      tasks,
      users,
      tickets,
      settings,
      permissions,
      campaignHistory,
      auditLogs
    };

    const jsonString = `data:text/json;charset=utf-8,${encodeURIComponent(JSON.stringify(backupData, null, 2))}`;
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", jsonString);
    downloadAnchor.setAttribute("download", `${settings.companyName.replace(/\s+/g, '_')}_Backup_${new Date().toISOString().split('T')[0]}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    addAuditLog("System Backup", "Downloaded full JSON database snapshot", 'system');
    triggerToast("💾 Full System JSON Backup Downloaded!");
  };

  // Full System Backup Restorer
  const handleRestoreFullBackup = (file: File) => {
    const userPin = prompt("Enter Master Security PIN to confirm database overwrite (Default: 1234):");
    if (userPin !== settings.masterPin) {
      triggerToast("❌ Incorrect Master Security PIN! Restore aborted.");
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const text = e.target?.result as string;
        const parsed = JSON.parse(text);

        if (parsed.leads && Array.isArray(parsed.leads)) setLeads(parsed.leads);
        if (parsed.deals && Array.isArray(parsed.deals)) setDeals(parsed.deals);
        if (parsed.tasks && Array.isArray(parsed.tasks)) setTasks(parsed.tasks);
        if (parsed.users && Array.isArray(parsed.users)) setUsers(parsed.users);
        if (parsed.tickets && Array.isArray(parsed.tickets)) setTickets(parsed.tickets);
        if (parsed.settings && typeof parsed.settings === 'object') setSettings(parsed.settings);
        if (parsed.permissions) setPermissions(parsed.permissions);
        if (parsed.campaignHistory) setCampaignHistory(parsed.campaignHistory);
        if (parsed.auditLogs) setAuditLogs(parsed.auditLogs);

        addAuditLog("System Restored", `Restored database from ${file.name}`, 'system');
        triggerToast("🎉 System Database Restored Successfully!");
      } catch (err) {
        triggerToast("Failed to parse backup JSON file.");
      }
    };
    reader.readAsText(file);
  };

  // Bulk CSV File Upload & Parser
  const handleCsvFileUpload = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      if (!text) return;
      const lines = text.split('\n').filter(line => line.trim().length > 0);
      if (lines.length <= 1) {
        triggerToast("CSV file appears to be empty or missing rows.");
        return;
      }
      
      const newImportedLeads: Lead[] = [];
      for (let i = 1; i < lines.length; i++) {
        const parts = lines[i].split(',').map(p => p.replace(/(^"|"$)/g, '').trim());
        if (parts.length >= 2) {
          const leadName = parts[1] || parts[0] || `Lead ${i}`;
          const leadEmail = parts[2] || `lead${i}@client.com`;
          const leadPhone = parts[3] || '';
          const leadSource = (['Website', 'LinkedIn', 'Email', 'Referrals', 'Other'].includes(parts[4]) ? parts[4] : 'Website') as any;
          const leadValue = Number(parts[5]) || 25000;
          const leadStatus = (['New', 'Contacted', 'Qualified', 'Lost'].includes(parts[6]) ? parts[6] : 'New') as any;
          
          newImportedLeads.push({
            id: Date.now() + i,
            name: leadName,
            email: leadEmail,
            phone: leadPhone,
            source: leadSource,
            value: leadValue,
            status: leadStatus,
            date: new Date().toISOString().split('T')[0],
            assignedRep: currentUserContext.name,
            tag: 'Standard',
            rating: 5,
            csatMood: 'Satisfied',
            customValues: {},
            notes: [{ id: Date.now() + i, text: "Imported via CSV file.", date: new Date().toISOString().split('T')[0], author: currentUserContext.name }],
            callLogs: [],
            attachments: []
          });
        }
      }

      if (newImportedLeads.length > 0) {
        setLeads([...newImportedLeads, ...leads]);
        setShowImportModal(false);
        addAuditLog("CSV Ingestion", `Imported ${newImportedLeads.length} leads from CSV`, 'lead');
        triggerToast(`🎉 Successfully imported ${newImportedLeads.length} leads!`);
      } else {
        triggerToast("Could not parse valid lead records from CSV.");
      }
    };
    reader.readAsText(file);
  };

  // Custom Field Creator Handler
  const handleAddCustomField = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFieldLabel.trim()) return;
    const newField: CustomFieldDefinition = {
      id: Date.now(),
      label: newFieldLabel.trim(),
      type: newFieldType
    };
    setSettings({
      ...settings,
      customFields: [...(settings.customFields || []), newField]
    });
    setNewFieldLabel('');
    addAuditLog("Custom Field Created", `Added field "${newField.label}"`, 'system');
    triggerToast(`Added custom field "${newField.label}"!`);
  };

  const handleDeleteCustomField = (id: number) => {
    setSettings({
      ...settings,
      customFields: (settings.customFields || []).filter(f => f.id !== id)
    });
    triggerToast("Custom field removed.");
  };

  // Lead Attachment Handler
  const handleAddAttachment = (leadId: number, file: File) => {
    const sizeStr = file.size > 1024 * 1024 ? `${(file.size / (1024 * 1024)).toFixed(1)} MB` : `${Math.round(file.size / 1024)} KB`;
    const newDoc: LeadAttachment = {
      id: Date.now(),
      name: file.name,
      size: sizeStr,
      date: new Date().toISOString().split('T')[0],
      type: file.name.split('.').pop()?.toUpperCase() || 'FILE'
    };

    setLeads(leads.map(l => l.id === leadId ? { ...l, attachments: [newDoc, ...(l.attachments || [])] } : l));
    if (selectedLeadForDrawer && selectedLeadForDrawer.id === leadId) {
      setSelectedLeadForDrawer({ ...selectedLeadForDrawer, attachments: [newDoc, ...(selectedLeadForDrawer.attachments || [])] });
    }
    addAuditLog("Document Attached", `Attached file "${file.name}" to lead`, 'lead');
    triggerToast(`📎 File "${file.name}" attached to lead!`);
  };

  const handleDeleteAttachment = (leadId: number, docId: number) => {
    setLeads(leads.map(l => l.id === leadId ? { ...l, attachments: (l.attachments || []).filter(a => a.id !== docId) } : l));
    if (selectedLeadForDrawer && selectedLeadForDrawer.id === leadId) {
      setSelectedLeadForDrawer({ ...selectedLeadForDrawer, attachments: (selectedLeadForDrawer.attachments || []).filter(a => a.id !== docId) });
    }
    triggerToast("Attachment removed.");
  };

  // CSAT Rating Update Handler
  const handleSetLeadRating = (leadId: number, rating: number) => {
    setLeads(leads.map(l => l.id === leadId ? { ...l, rating } : l));
    if (selectedLeadForDrawer && selectedLeadForDrawer.id === leadId) {
      setSelectedLeadForDrawer({ ...selectedLeadForDrawer, rating });
    }
    addAuditLog("CSAT Updated", `Updated rating to ${rating} stars for lead`, 'lead');
    triggerToast(`⭐ Rated ${rating} Stars!`);
  };

  const handleSetLeadMood = (leadId: number, csatMood: 'Delighted' | 'Satisfied' | 'Neutral' | 'Unhappy') => {
    setLeads(leads.map(l => l.id === leadId ? { ...l, csatMood } : l));
    if (selectedLeadForDrawer && selectedLeadForDrawer.id === leadId) {
      setSelectedLeadForDrawer({ ...selectedLeadForDrawer, csatMood });
    }
    triggerToast(`Customer mood marked as ${csatMood}!`);
  };

  // AI Chat Handler
  const handleSendAiPrompt = (customText?: string) => {
    const promptToSend = customText || aiInput;
    if (!promptToSend.trim()) return;

    const newMsg: ChatMessage = { id: Date.now(), sender: 'user', text: promptToSend };
    setChatMessages(prev => [...prev, newMsg]);
    setAiInput('');

    setTimeout(() => {
      let botResponse = "";
      const lower = promptToSend.toLowerCase();

      if (lower.includes("pipeline") || lower.includes("analyze") || lower.includes("deal")) {
        if (deals.length === 0) {
          botResponse = `📊 Pipeline Status:\nYou currently have 0 active deals. Click "+ Add Deal" or move a Lead to Qualified to start tracking revenue pipelines!`;
        } else {
          const topDeal = deals.reduce((max, d) => d.value > max.value ? d : max, deals[0]);
          botResponse = `📊 Pipeline Analysis:\n• Total Pipeline Value: ${currencySymbol}${pipelineValue.toLocaleString()}\n• Highest Value Opportunity: "${topDeal?.name}" (${currencySymbol}${topDeal?.value.toLocaleString()})\n• Closed Revenue: ${currencySymbol}${closedDealsSum.toLocaleString()}`;
        }
      } else if (lower.includes("lead") || lower.includes("follow") || lower.includes("message")) {
        if (leads.length === 0) {
          botResponse = `💡 No leads in the pipeline yet! Click "+ Add Lead" or use "Import CSV" to add your contacts.`;
        } else {
          const qLeads = leads.filter(l => l.status === 'Qualified');
          botResponse = `💡 Follow-up Advice:\nYou have ${qLeads.length} Qualified leads. Here is a recommended message:\n\n"Hi [Client], we prepared your proposal for ${currencySymbol}${leads[0]?.value?.toLocaleString() || '50,000'}. Let's schedule a quick 10-min confirmation call!"`;
        }
      } else if (lower.includes("revenue") || lower.includes("forecast") || lower.includes("target")) {
        botResponse = `📈 Revenue Forecast:\n• Current: ${currencySymbol}${currentTotalRevenue.toLocaleString()} (${revenuePercentOfTarget}% of ${currencySymbol}${settings.revenueGoal.toLocaleString()} target goal)\n• Target Gap: ${currencySymbol}${Math.max(0, settings.revenueGoal - currentTotalRevenue).toLocaleString()}`;
      } else {
        botResponse = `🤖 AI Insight for "${promptToSend}":\nCurrently tracking ${leads.length} leads and ${deals.length} deals. Would you like me to draft an email template or analyze lead channels?`;
      }

      setChatMessages(prev => [...prev, { id: Date.now() + 1, sender: 'ai', text: botResponse }]);
    }, 500);
  };

  // Drag and Drop Handler for Kanban
  const handleDragStart = (leadId: number) => { setDraggedLeadId(leadId); };
  const handleDragOver = (e: React.DragEvent, colStatus: string) => { e.preventDefault(); setDragOverCol(colStatus); };
  const handleDrop = (e: React.DragEvent, newStatus: string) => {
    e.preventDefault();
    setDragOverCol(null);
    if (!draggedLeadId) return;

    const leadObj = leads.find(l => l.id === draggedLeadId);
    if (leadObj && leadObj.status !== newStatus) {
      setLeads(leads.map(l => l.id === draggedLeadId ? { ...l, status: newStatus } : l));
      addAuditLog("Pipeline Stage Moved", `Moved "${leadObj.name}" to ${newStatus}`, 'lead');
      triggerToast(`Moved "${leadObj.name}" to ${newStatus}!`);
    }
    setDraggedLeadId(null);
  };

  // Auth Handlers
  const handleLogin = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const matched = users.find(u => u.email.toLowerCase() === loginEmail.toLowerCase());
    const targetUser = matched || users[0] || initialUsers[0];
    const { portal, view } = getPortalAndDefaultViewForRole(targetUser.role);

    setCurrentUserContext(targetUser);
    setActivePortal(portal);
    setActiveView(view);
    setIsAuthenticated(true);
    addAuditLog("User Login", `${targetUser.name} logged into CRM (${targetUser.role})`, 'system');
    triggerToast(`Welcome, ${targetUser.name}! (${targetUser.role} Workspace)`);
  };

  const handleQuickRoleLogin = (userRole: User['role']) => {
    const targetUser = users.find(u => u.role === userRole) || initialUsers.find(u => u.role === userRole) || users[0];
    const { portal, view } = getPortalAndDefaultViewForRole(targetUser.role);

    setLoginEmail(targetUser.email);
    setLoginPassword(targetUser.password || 'admin');
    setCurrentUserContext(targetUser);
    setActivePortal(portal);
    setActiveView(view);
    setIsAuthenticated(true);
    addAuditLog("User Login", `${targetUser.name} logged in via 1-Click Demo Login (${targetUser.role})`, 'system');
    triggerToast(`Welcome to ${targetUser.role} Workspace! (${targetUser.name})`);
  };

  const handleSignup = (e: React.FormEvent) => {
    e.preventDefault();
    if (!signupName || !signupEmail) return;
    const newUser: User = {
      id: Date.now(),
      name: signupName,
      email: signupEmail,
      role: 'Admin',
      status: 'Active',
      avatar: signupName.split(' ').map(w => w[0]).join('').toUpperCase() || 'U',
      password: signupPassword || 'password'
    };
    const { portal, view } = getPortalAndDefaultViewForRole(newUser.role);
    setUsers([...users, newUser]);
    setCurrentUserContext(newUser);
    setActivePortal(portal);
    setActiveView(view);
    setIsAuthenticated(true);
    addAuditLog("Account Registered", `Created new admin account for ${newUser.name}`, 'system');
    setShowOnboardingModal(true);
    triggerToast(`Account created! Welcome, ${newUser.name}. Please select your company subscription.`);
  };

  const handleLogout = () => {
    addAuditLog("User Logout", `${currentUserContext.name} signed out`, 'system');
    setIsAuthenticated(false);
    sessionStorage.removeItem('crm_auth_session');
    secureStorage.removeItem('crm_auth_session');
    secureStorage.removeItem('crm_current_user');
    secureStorage.removeItem('hrms_jwt_token');
    secureStorage.removeItem('hrms_user_profile');
    localStorage.removeItem('crm_auth_session');
    localStorage.removeItem('crm_current_user');
    localStorage.removeItem('hrms_jwt_token');
    localStorage.removeItem('hrms_user_profile');
    localStorage.removeItem('itlc_active_suite');
    setShowWorkspaceChoiceModal(false);
    setShowSecureAuthModal(false);
    setShowIntroLaunchpad(true);
    setActiveLandingView('home');
    window.location.hash = '';
    setLoginEmail('');
    setLoginPassword('');
    triggerToast("Logged out successfully.");
  };

  const handleSuccessfulLogin = (profile: any) => {
    let crmRole: User['role'] = 'Sales Rep';
    const roleLower = (profile.role || '').toLowerCase();
    if (roleLower.includes('superadmin') || roleLower.includes('owner') || roleLower.includes('super owner')) {
      crmRole = 'Super Admin';
    } else if (roleLower.includes('admin') || roleLower.includes('hr')) {
      crmRole = 'Admin';
    } else if (roleLower.includes('manager') || roleLower.includes('lead')) {
      crmRole = 'Sales Manager';
    }

    const { portal, view } = getPortalAndDefaultViewForRole(crmRole);
    const updatedUser: User = {
      id: profile.id || Date.now(),
      name: profile.name || profile.fullName || 'Authorized User',
      email: profile.email || 'admin@itlc.com',
      role: crmRole,
      status: 'Active',
      avatar: (profile.name || 'AU').split(' ').map((w: string) => w[0]).join('').slice(0, 2).toUpperCase()
    };

    setCurrentUserContext(updatedUser);
    setActivePortal(portal);
    setActiveView(view);
    setIsAuthenticated(true);
    sessionStorage.setItem('crm_auth_session', 'true');
    secureStorage.setItem('crm_auth_session', 'true');
    secureStorage.setItem('crm_current_user', updatedUser);
    localStorage.setItem('crm_auth_session', 'true');
    localStorage.setItem('crm_current_user', JSON.stringify(updatedUser));
    
    // Sync to hrms_user_profile for seamless SSO
    try {
      const hrmsProfile = {
        id: updatedUser.id,
        name: updatedUser.name,
        fullName: updatedUser.name,
        email: updatedUser.email,
        role: profile.role || (crmRole === 'Super Admin' ? 'Super Owner' : crmRole === 'Admin' ? 'Company Admin' : crmRole === 'Sales Manager' ? 'Manager' : 'Employee'),
        companyName: profile.companyName || 'ITLC Enterprise Cloud',
        companyLogo: '/itlc_logo.png',
        subscriptionPlanId: 'growth',
        subscriptionStatus: 'active',
        companyDetails: { status: 'active', themeColor: '#4f46e5' }
      };
      secureStorage.setItem('hrms_user_profile', hrmsProfile);
      secureStorage.setItem('hrms_jwt_token', `demo_jwt_token_${Date.now()}`);
      localStorage.setItem('hrms_user_profile', JSON.stringify(hrmsProfile));
      localStorage.setItem('hrms_jwt_token', `demo_jwt_token_${Date.now()}`);
    } catch {}

    setShowSecureAuthModal(false);
    setShowWorkspaceChoiceModal(false);
    setActiveSuite('hrms');
    setShowIntroLaunchpad(false);
    addAuditLog("User Login", `${updatedUser.name} authenticated successfully (${updatedUser.role})`, 'system');
    triggerToast(`Welcome, ${updatedUser.name}! Please choose your workspace.`);
  };

  const handleUpdateProfile = (e: React.FormEvent) => {
    e.preventDefault();
    if (!profileName) return;
    const updated: User = {
      ...currentUserContext,
      name: profileName,
      email: profileEmail || currentUserContext.email,
      avatar: profileName.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase(),
      photoUrl: profilePhotoUrl
    };
    const updatedUsers = users.map(u => u.id === currentUserContext.id ? updated : u);
    setUsers(updatedUsers);
    setCurrentUserContext(updated);
    try {
      localStorage.setItem('crm_users', JSON.stringify(updatedUsers));
      localStorage.setItem('crm_current_user', JSON.stringify(updated));
      const savedHrms = localStorage.getItem('hrms_user_profile');
      if (savedHrms) {
        const parsedHrms = JSON.parse(savedHrms);
        parsedHrms.name = profileName;
        parsedHrms.fullName = profileName;
        parsedHrms.email = profileEmail || parsedHrms.email;
        if (profilePhotoUrl) {
          parsedHrms.avatar = profilePhotoUrl;
          parsedHrms.photo = profilePhotoUrl;
        } else {
          delete parsedHrms.avatar;
          delete parsedHrms.photo;
        }
        localStorage.setItem('hrms_user_profile', JSON.stringify(parsedHrms));
      }
    } catch {}

    setShowProfileModal(false);
    addAuditLog("Profile Updated", `${profileName} updated personal credentials & photo`, 'system');
    triggerToast("Profile & Photo updated successfully!");
  };

  // Support Tickets CRUD Handlers
  const handleCreateTicket = (e: React.FormEvent) => {
    e.preventDefault();
    if (!ticketSubject.trim()) return;
    const newTck: SupportTicket = {
      id: Date.now(),
      ticketNo: `TCK-${Math.floor(1000 + Math.random() * 9000)}`,
      clientName: ticketClient.trim() || currentUserContext.name,
      subject: ticketSubject.trim(),
      category: ticketCategory,
      priority: ticketPriority,
      status: 'Open',
      assignedTo: 'Pooja Verma (Helpdesk)',
      createdDate: new Date().toISOString().split('T')[0],
      notes: ticketNotes.trim()
    };
    setTickets([newTck, ...tickets]);
    setShowTicketModal(false);
    setTicketSubject('');
    setTicketClient('');
    setTicketNotes('');
    addAuditLog("Ticket Created", `New support ticket ${newTck.ticketNo} submitted`, 'lead');
    triggerToast(`🎫 Ticket ${newTck.ticketNo} created successfully!`);
  };

  const handleUpdateTicketStatus = (ticketId: number, status: 'Open' | 'In-Progress' | 'Resolved') => {
    setTickets(tickets.map(t => t.id === ticketId ? { ...t, status } : t));
    addAuditLog("Ticket Updated", `Ticket #${ticketId} status changed to ${status}`, 'lead');
    triggerToast(`Ticket status updated to ${status}!`);
  };



  // Leads CRUD
  const openAddLeadModal = () => {
    setEditingLead(null);
    setLeadFormName('');
    setLeadFormEmail('');
    setLeadFormPhone('');
    setLeadFormSource('Website');
    setLeadFormValue(25000);
    setLeadFormStatus('New');
    setLeadFormRep(currentUserContext.name);
    setLeadFormTag('Standard');
    setLeadFormCustomVals({});
    setShowLeadModal(true);
  };

  const openEditLeadModal = (lead: Lead) => {
    setEditingLead(lead);
    setLeadFormName(lead.name);
    setLeadFormEmail(lead.email);
    setLeadFormPhone(lead.phone || '');
    setLeadFormSource(lead.source);
    setLeadFormValue(lead.value);
    setLeadFormStatus(lead.status);
    setLeadFormRep(lead.assignedRep || currentUserContext.name);
    setLeadFormTag(lead.tag || 'Standard');
    setLeadFormCustomVals(lead.customValues || {});
    setShowLeadModal(true);
  };

  const handleSaveLead = (e: React.FormEvent) => {
    e.preventDefault();
    if (!leadFormName) return;

    if (editingLead) {
      setLeads(leads.map(l => l.id === editingLead.id ? {
        ...l,
        name: leadFormName,
        email: leadFormEmail,
        phone: leadFormPhone,
        source: leadFormSource,
        value: Number(leadFormValue),
        status: leadFormStatus,
        assignedRep: leadFormRep,
        tag: leadFormTag,
        customValues: leadFormCustomVals
      } : l));
      if (selectedLeadForDrawer && selectedLeadForDrawer.id === editingLead.id) {
        setSelectedLeadForDrawer({
          ...selectedLeadForDrawer,
          name: leadFormName,
          email: leadFormEmail,
          phone: leadFormPhone,
          source: leadFormSource,
          value: Number(leadFormValue),
          status: leadFormStatus,
          assignedRep: leadFormRep,
          tag: leadFormTag,
          customValues: leadFormCustomVals
        });
      }
      addAuditLog("Lead Updated", `Updated details for lead "${leadFormName}"`, 'lead');
      triggerToast(`Lead "${leadFormName}" updated!`);
    } else {
      const newLead: Lead = {
        id: Date.now(),
        name: leadFormName,
        email: leadFormEmail || 'contact@client.com',
        phone: leadFormPhone || '',
        source: leadFormSource,
        value: Number(leadFormValue),
        status: leadFormStatus,
        date: new Date().toISOString().split('T')[0],
        assignedRep: leadFormRep,
        tag: leadFormTag,
        rating: 5,
        csatMood: 'Satisfied',
        customValues: leadFormCustomVals,
        notes: [{ id: Date.now(), text: "Lead registered in pipeline.", date: new Date().toISOString().split('T')[0], author: currentUserContext.name }],
        callLogs: [],
        attachments: []
      };
      setLeads([newLead, ...leads]);
      addAuditLog("Lead Created", `Added new lead "${newLead.name}" (${currencySymbol}${newLead.value.toLocaleString()})`, 'lead');
      triggerToast(`Lead "${newLead.name}" added!`);
    }
    setShowLeadModal(false);
  };

  const handleDeleteLead = (id: number) => {
    const leadToDelete = leads.find(l => l.id === id);
    setLeads(leads.filter(l => l.id !== id));
    setSelectedLeadIds(prev => prev.filter(item => item !== id));
    if (selectedLeadForDrawer && selectedLeadForDrawer.id === id) { setSelectedLeadForDrawer(null); }
    addAuditLog("Lead Deleted", `Removed lead "${leadToDelete?.name || id}"`, 'lead');
    triggerToast("Lead deleted.");
  };

  const handleToggleSelectLead = (id: number) => {
    setSelectedLeadIds(prev => 
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  const handleSelectAllLeads = () => {
    if (selectedLeadIds.length === filteredLeads.length) {
      setSelectedLeadIds([]);
    } else {
      setSelectedLeadIds(filteredLeads.map(l => l.id));
    }
  };

  const handleBulkDeleteLeads = () => {
    if (selectedLeadIds.length === 0) return;
    if (!window.confirm(`Are you sure you want to permanently delete ${selectedLeadIds.length} selected lead(s)?`)) return;
    
    setLeads(prev => prev.filter(l => !selectedLeadIds.includes(l.id)));
    addAuditLog("Bulk Deleted Leads", `Deleted ${selectedLeadIds.length} leads in bulk`, 'lead');
    setSelectedLeadIds([]);
    if (selectedLeadForDrawer && selectedLeadIds.includes(selectedLeadForDrawer.id)) {
      setSelectedLeadForDrawer(null);
    }
    triggerToast(`🗑️ ${selectedLeadIds.length} lead(s) deleted successfully.`);
  };

  const handleDeleteNote = (leadId: number, noteId: number) => {
    setLeads(prev => prev.map(l => {
      if (l.id === leadId) {
        return {
          ...l,
          notes: (l.notes || []).filter(n => n.id !== noteId)
        };
      }
      return l;
    }));
    if (selectedLeadForDrawer && selectedLeadForDrawer.id === leadId) {
      setSelectedLeadForDrawer(prev => prev ? {
        ...prev,
        notes: (prev.notes || []).filter(n => n.id !== noteId)
      } : null);
    }
    triggerToast("Note deleted.");
  };

  const handleDeleteCallLog = (leadId: number, callId: number) => {
    setLeads(prev => prev.map(l => {
      if (l.id === leadId) {
        return {
          ...l,
          callLogs: (l.callLogs || []).filter(c => c.id !== callId)
        };
      }
      return l;
    }));
    if (selectedLeadForDrawer && selectedLeadForDrawer.id === leadId) {
      setSelectedLeadForDrawer(prev => prev ? {
        ...prev,
        callLogs: (prev.callLogs || []).filter(c => c.id !== callId)
      } : null);
    }
    triggerToast("Call record deleted.");
  };

  const handleDeleteCampaign = (id: number) => {
    if (!window.confirm("Remove this campaign from history?")) return;
    setCampaignHistory(prev => prev.filter(c => c.id !== id));
    triggerToast("Campaign history record removed.");
  };

  const handleClearCompletedTasks = () => {
    const completedCount = tasks.filter(t => t.completed).length;
    if (completedCount === 0) {
      triggerToast("No completed tasks to clear.");
      return;
    }
    if (!window.confirm(`Clear all ${completedCount} completed task(s)?`)) return;
    setTasks(prev => prev.filter(t => !t.completed));
    addAuditLog("Cleared Completed Tasks", `Removed ${completedCount} completed tasks`, 'system');
    triggerToast(`🗑️ Cleared ${completedCount} completed task(s).`);
  };

  const handleClearAuditLogs = () => {
    const pin = prompt("Enter Master Security PIN to clear audit logs (Default: 1234):");
    if (pin !== settings.masterPin) {
      triggerToast("❌ Incorrect Master Security PIN!");
      return;
    }
    setAuditLogs([
      { id: Date.now(), action: "Audit Logs Cleared", detail: "Admin cleared previous audit trail history", actor: currentUserContext.name, category: "system", timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }
    ]);
    triggerToast("🗑️ Audit trail history cleared.");
  };

  const handleUpdateLeadStatus = (id: number, status: string) => {
    const leadObj = leads.find(l => l.id === id);
    setLeads(leads.map(l => l.id === id ? { ...l, status } : l));
    if (selectedLeadForDrawer && selectedLeadForDrawer.id === id) {
      setSelectedLeadForDrawer({ ...selectedLeadForDrawer, status });
    }
    addAuditLog("Lead Status Changed", `Moved "${leadObj?.name}" to ${status}`, 'lead');
    triggerToast(`Status moved to ${status}!`);
  };

  const handleAddNoteToLead = (leadId: number) => {
    if (!newNoteInput.trim()) return;
    const newNote: LeadNote = {
      id: Date.now(),
      text: newNoteInput.trim(),
      date: new Date().toISOString().split('T')[0],
      author: currentUserContext.name
    };
    setLeads(leads.map(l => l.id === leadId ? { ...l, notes: [newNote, ...(l.notes || [])] } : l));
    if (selectedLeadForDrawer && selectedLeadForDrawer.id === leadId) {
      setSelectedLeadForDrawer({ ...selectedLeadForDrawer, notes: [newNote, ...(selectedLeadForDrawer.notes || [])] });
    }
    setNewNoteInput('');
    triggerToast("Note added to timeline!");
  };

  const handleAddCallLog = (leadId: number) => {
    if (!callNotesInput.trim()) return;
    const newCall: CallLog = {
      id: Date.now(),
      duration: callDurationInput || '3 mins',
      outcome: callOutcomeInput,
      notes: callNotesInput.trim(),
      date: new Date().toISOString().split('T')[0],
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      caller: currentUserContext.name
    };

    setLeads(leads.map(l => l.id === leadId ? { ...l, callLogs: [newCall, ...(l.callLogs || [])] } : l));
    if (selectedLeadForDrawer && selectedLeadForDrawer.id === leadId) {
      setSelectedLeadForDrawer({ ...selectedLeadForDrawer, callLogs: [newCall, ...(selectedLeadForDrawer.callLogs || [])] });
    }
    addAuditLog("Call Logged", `Logged call (${callOutcomeInput}) for lead`, 'lead');
    setCallNotesInput('');
    triggerToast(`📞 Call logged as ${callOutcomeInput}!`);
  };

  // Broadcast Launch Handler
  const handleLaunchBroadcast = () => {
    if (targetAudienceLeads.length === 0) {
      triggerToast("No leads match this audience filter.");
      return;
    }
    const newRecord: CampaignRecord = {
      id: Date.now(),
      title: campaignSubject,
      channel: campaignChannel,
      audience: campaignAudience === 'ALL' ? 'All Active Leads' : campaignAudience === 'QUALIFIED' ? 'Qualified Leads' : campaignAudience === 'VIP' ? 'VIP Clients' : 'New Leads',
      recipientsCount: targetAudienceLeads.length,
      date: new Date().toISOString().split('T')[0],
      status: 'Sent'
    };
    setCampaignHistory([newRecord, ...campaignHistory]);
    addAuditLog("Broadcast Dispatched", `Sent ${campaignChannel} broadcast to ${targetAudienceLeads.length} leads`, 'campaign');
    triggerToast(`🚀 Broadcast dispatched to ${targetAudienceLeads.length} leads via ${campaignChannel}!`);
  };

  // Deals CRUD
  const openAddDealModal = () => {
    setEditingDeal(null);
    setDealFormName('');
    setDealFormValue(50000);
    setDealFormStage('Proposal');
    setDealFormProb(50);
    setDealFormDate(new Date().toISOString().split('T')[0]);
    setDealFormRep(currentUserContext.name);
    setDealFormTag('Standard');
    setShowDealModal(true);
  };

  const openEditDealModal = (deal: Deal) => {
    setEditingDeal(deal);
    setDealFormName(deal.name);
    setDealFormValue(deal.value);
    setDealFormStage(deal.stage);
    setDealFormProb(deal.probability);
    setDealFormDate(deal.closeDate || new Date().toISOString().split('T')[0]);
    setDealFormRep(deal.assignedRep || currentUserContext.name);
    setDealFormTag(deal.tag || 'Standard');
    setShowDealModal(true);
  };

  const handleSaveDeal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!dealFormName) return;

    if (editingDeal) {
      setDeals(deals.map(d => d.id === editingDeal.id ? {
        ...d,
        name: dealFormName,
        value: Number(dealFormValue),
        stage: dealFormStage,
        probability: Number(dealFormProb),
        closeDate: dealFormDate,
        assignedRep: dealFormRep,
        tag: dealFormTag
      } : d));
      addAuditLog("Deal Updated", `Updated deal "${dealFormName}"`, 'deal');
      triggerToast(`Deal "${dealFormName}" updated!`);
    } else {
      const newDeal: Deal = {
        id: Date.now(),
        name: dealFormName,
        value: Number(dealFormValue),
        stage: dealFormStage,
        probability: Number(dealFormProb),
        closeDate: dealFormDate,
        assignedRep: dealFormRep,
        tag: dealFormTag
      };
      setDeals([...deals, newDeal]);
      addAuditLog("Deal Created", `Created deal "${newDeal.name}" (${currencySymbol}${newDeal.value.toLocaleString()})`, 'deal');
      triggerToast(`Deal "${newDeal.name}" created!`);
    }
    setShowDealModal(false);
  };

  const handleDeleteDeal = (id: number) => {
    const dealObj = deals.find(d => d.id === id);
    setDeals(deals.filter(d => d.id !== id));
    addAuditLog("Deal Removed", `Deleted deal "${dealObj?.name || id}"`, 'deal');
    triggerToast("Deal removed.");
  };

  const handleToggleDealClosed = (id: number) => {
    setDeals(deals.map(d => {
      if (d.id === id) {
        const nextStage = d.stage === 'Closed' ? 'Negotiation' : 'Closed';
        const nextProb = nextStage === 'Closed' ? 100 : 75;
        addAuditLog("Deal Stage Changed", `Changed "${d.name}" status to ${nextStage}`, 'deal');
        return { ...d, stage: nextStage, probability: nextProb };
      }
      return d;
    }));
    triggerToast("Deal state updated!");
  };

  // Tasks CRUD
  const handleSaveTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!taskFormTitle) return;
    const newTask: Task = {
      id: Date.now(),
      title: taskFormTitle,
      dueDate: taskFormDate,
      priority: taskFormPriority,
      completed: false,
      assignedTo: taskFormAssignee
    };
    setTasks([newTask, ...tasks]);
    setTaskFormTitle('');
    setShowTaskModal(false);
    addAuditLog("Task Scheduled", `Scheduled task "${newTask.title}" for ${newTask.dueDate}`, 'system');
    triggerToast("Task scheduled!");
  };

  const handleToggleTask = (id: number) => {
    setTasks(tasks.map(t => t.id === id ? { ...t, completed: !t.completed } : t));
    triggerToast("Task toggled.");
  };

  const handleDeleteTask = (id: number) => {
    setTasks(tasks.filter(t => t.id !== id));
    triggerToast("Task deleted.");
  };

  // Users CRUD
  const handleAddOrEditUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUserName || !newUserEmail) return;

    if (editingUser) {
      const updatedList = users.map(u => u.id === editingUser.id ? { 
        ...u, 
        name: newUserName, 
        email: newUserEmail, 
        role: newUserRole, 
        status: newUserStatus,
        avatar: newUserName.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase(),
        photoUrl: newUserPhotoUrl
      } : u);
      setUsers(updatedList);
      try { localStorage.setItem('crm_users', JSON.stringify(updatedList)); } catch {}

      if (editingUser.id === currentUserContext.id) {
        const updatedSelf: User = {
          ...currentUserContext,
          name: newUserName,
          email: newUserEmail,
          role: newUserRole,
          status: newUserStatus,
          avatar: newUserName.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase(),
          photoUrl: newUserPhotoUrl
        };
        setCurrentUserContext(updatedSelf);
        try { localStorage.setItem('crm_current_user', JSON.stringify(updatedSelf)); } catch {}
      }

      addAuditLog("User Edited", `Updated credentials and photo for ${newUserName}`, 'system');
      triggerToast(`User "${newUserName}" updated!`);
    } else {
      const newUser: User = {
        id: Date.now(),
        name: newUserName,
        email: newUserEmail,
        role: newUserRole,
        status: newUserStatus,
        avatar: newUserName.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase(),
        photoUrl: newUserPhotoUrl
      };
      const updatedList = [...users, newUser];
      setUsers(updatedList);
      try { localStorage.setItem('crm_users', JSON.stringify(updatedList)); } catch {}
      addAuditLog("User Created", `Added new team member ${newUser.name} (${newUser.role})`, 'system');
      triggerToast(`User "${newUser.name}" created!`);
    }
    setEditingUser(null);
    setNewUserPhotoUrl('');
    setShowUserModal(false);
  };

  const handleDeleteUser = (id: number) => {
    if (id === currentUserContext.id) {
      triggerToast("⚠️ Cannot delete the active logged in user account!");
      return;
    }
    const uObj = users.find(u => u.id === id);
    if (!window.confirm(`Are you sure you want to permanently delete user "${uObj?.name || id}"?`)) return;
    const updatedList = users.filter(u => u.id !== id);
    setUsers(updatedList);
    try { localStorage.setItem('crm_users', JSON.stringify(updatedList)); } catch {}
    addAuditLog("User Deleted", `Removed user account ${uObj?.name || id}`, 'system');
    triggerToast(`User "${uObj?.name || id}" removed.`);
  };

  const toggleUserStatus = (id: number) => {
    const updatedList = users.map(u => u.id === id ? { ...u, status: (u.status === 'Active' ? 'Inactive' : 'Active') as 'Active' | 'Inactive' } : u);
    setUsers(updatedList);
    try { localStorage.setItem('crm_users', JSON.stringify(updatedList)); } catch {}
    triggerToast("User status updated.");
  };

  const handlePermissionChange = (roleKey: string, perm: string) => {
    const list = permissions[roleKey] || [];
    const updated = list.includes(perm) ? list.filter(p => p !== perm) : [...list, perm];
    setPermissions({ ...permissions, [roleKey]: updated });
    triggerToast(`Permissions for ${roleKey} updated.`);
  };

  const handleDeleteTicket = (id: number) => {
    if (!window.confirm("Are you sure you want to delete this ticket?")) return;
    setTickets(tickets.filter(t => t.id !== id));
    addAuditLog("Deleted Ticket", `Deleted support ticket ID #${id}`, 'system');
    triggerToast("Support ticket deleted.");
  };

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    addAuditLog("Settings Changed", `Updated company settings, custom fields and commission rate`, 'system');
    triggerToast("Settings saved!");
  };

  const handleGenerateReport = () => {
    if (reportType === 'revenue') {
      const closedMonthDeals = deals.filter(d => d.stage === 'Closed').reduce((s, d) => s + d.value, 0);
      const target = settings.revenueGoal || 500000;
      const pct = Math.round((currentTotalRevenue / target) * 100);
      setGeneratedReport([
        { period: 'Q1 (Jan - Mar)', target: `${currencySymbol}${(target * 0.9).toLocaleString()}`, actual: `${currencySymbol}${(closedMonthDeals * 0.85).toLocaleString()}`, achievement: `${Math.round(pct * 0.9)}%` },
        { period: 'Q2 (Apr - Jun)', target: `${currencySymbol}${target.toLocaleString()}`, actual: `${currencySymbol}${closedMonthDeals.toLocaleString()}`, achievement: `${pct}%` },
        { period: 'Year to Date (YTD)', target: `${currencySymbol}${(target * 2).toLocaleString()}`, actual: `${currencySymbol}${(closedMonthDeals * 1.85).toLocaleString()}`, achievement: `${Math.round(pct * 0.92)}%` }
      ]);
    } else if (reportType === 'conversion') {
      const channels: ('Website' | 'LinkedIn' | 'Email' | 'Referrals' | 'Other')[] = ['Website', 'LinkedIn', 'Email', 'Referrals', 'Other'];
      const repData = channels.map(channel => {
        const total = leads.filter(l => l.source === channel).length;
        const converted = leads.filter(l => l.source === channel && (l.status === 'Qualified' || l.status === 'Contacted')).length;
        const rate = total > 0 ? `${Math.round((converted / total) * 100)}%` : '0%';
        return { channel, leads: total, converted, rate };
      });
      setGeneratedReport(repData);
    } else {
      const salesUsers = users.filter(u => u.role === 'Sales Rep' || u.role === 'Sales Manager' || u.role === 'Admin' || u.role === 'Super Admin');
      setGeneratedReport(
        salesUsers.map(u => {
          const userLeads = leads.filter(l => l.assignedRep === u.name);
          const closedSum = deals.filter(d => d.assignedRep === u.name && d.stage === 'Closed').reduce((s, d) => s + d.value, 0);
          const convertedCount = userLeads.filter(l => l.status === 'Qualified').length;
          const convRate = userLeads.length > 0 ? `${Math.round((convertedCount / userLeads.length) * 100)}%` : '0%';
          return {
            rep: u.name,
            activeLeads: userLeads.length,
            closedValue: `${currencySymbol}${closedSum.toLocaleString()}`,
            conversion: convRate
          };
        })
      );
    }
    triggerToast("Live Report Preview Generated!");
  };

  // Invoice calculations
  const invoiceSubtotal = invoiceItemAmount - invoiceDiscount;
  const invoiceTaxAmount = Math.round(invoiceSubtotal * (invoiceTaxRate / 100));
  const invoiceGrandTotal = invoiceSubtotal + invoiceTaxAmount;

  // ----------------------------------------------------
  // UNIFIED MULTI-TENANT SUPER ADMIN MASTER SUITE (STEALTH ACCESS)
  // ----------------------------------------------------
  if (isSuperAdminMasterActive) {
    return (
      <SuperAdminMasterPanel 
        tenants={tenants}
        onUpdateTenants={(updated) => setTenants(updated)}
        onLaunchTenantWorkspace={(targetTenant, suite) => {
          setActiveTenant(targetTenant);
          setActiveSuite(suite);
          setIsSuperAdminMasterActive(false);
          setShowIntroLaunchpad(false);
          setIsAuthenticated(true);
          triggerToast(`Switched to ${targetTenant.name} workspace (${suite.toUpperCase()})`);
        }}
        onExitSuperAdmin={() => {
          setIsSuperAdminMasterActive(false);
          setShowIntroLaunchpad(true);
          window.location.hash = '';
          triggerToast("Exited Super Admin Master Console");
        }}
        triggerToast={triggerToast}
        lang={lang}
      />
    );
  }

  // ----------------------------------------------------
  // FULL-PAGE DEDICATED COMPANY REGISTRATION & ONBOARDING WIZARD
  // ----------------------------------------------------
  if (isRegisteringCompany) {
    return (
      <CompanyRegisterPage 
        initialPlanId={selectedOnboardingPlanId}
        onBackToHome={() => {
          setIsRegisteringCompany(false);
          window.location.hash = '';
        }}
        onCompleteRegistration={(newTenant) => {
          setTenants(prev => [newTenant, ...prev.filter(t => t.id !== newTenant.id)]);
          setActiveTenant(newTenant);
          setIsRegisteringCompany(false);
          window.location.hash = '';
          setActiveSuite(newTenant.suites[0] || 'crm');
          setShowIntroLaunchpad(false);
          setIsAuthenticated(true);
          triggerToast(`🎉 Workspace for "${newTenant.name}" created successfully!`);
        }}
        lang={lang}
      />
    );
  }

  // ----------------------------------------------------
  // ITLC ENTERPRISE SOFTWARE SUITE LANDING PAGE & SUB-PAGES
  // ----------------------------------------------------
  if (showIntroLaunchpad) {
    return (
      <LandingPage 
        onOpenLogin={() => {
          window.location.hash = '#login';
          setActiveSuite('hrms');
          setShowIntroLaunchpad(false);
        }}
        onOpenSuperowner={() => {
          if (isAuthenticated && (currentUserContext.role === 'Super Admin' || (currentUserContext.role as any) === 'Super Owner')) {
            setIsSuperAdminMasterActive(true);
          } else {
            window.location.hash = '#login';
            setActiveSuite('hrms');
            setShowIntroLaunchpad(false);
          }
        }}
        loggedInUser={isAuthenticated ? currentUserContext : undefined}
        onGoToDashboard={() => {
          setShowIntroLaunchpad(false);
        }}
        onSuccessLogin={() => {
          setIsAuthenticated(true);
          setShowIntroLaunchpad(false);
        }}
      />
    );
  }

  // ----------------------------------------------------
  // UNAUTHENTICATED GATED LOGIN SCREEN (EXACT UNIFIED HRMS LOGIN)
  // ----------------------------------------------------
  if (!isAuthenticated) {
    return (
      <>
        <OmniStaffApp 
          onLogout={handleLogout}
          onSwitchToCRM={() => {
            setActiveSuite('crm');
            setShowIntroLaunchpad(false);
          }}
          onOpenIntroHub={() => setShowIntroLaunchpad(true)}
          onChooseWorkspace={(profile) => {
            handleSuccessfulLogin(profile);
          }}
        />

        {/* Global Workspace Choice Destination Modal */}
        <WorkspaceChoiceModal 
          isOpen={showWorkspaceChoiceModal}
          user={{
            name: currentUserContext.name,
            email: currentUserContext.email,
            role: currentUserContext.role,
            companyName: activeTenant?.name || 'Enterprise Cloud Workspace',
            avatar: currentUserContext.avatar
          }}
          onSelectCRM={() => {
            setActiveSuite('crm');
            setShowIntroLaunchpad(false);
            setShowWorkspaceChoiceModal(false);
            triggerToast("Welcome to ITLC Sales CRM!");
          }}
          onSelectHRMS={() => {
            setActiveSuite('hrms');
            setShowIntroLaunchpad(false);
            setShowWorkspaceChoiceModal(false);
            triggerToast("Welcome to OmniStaff HRMS!");
          }}
          onLogout={handleLogout}
          lang={lang}
        />
      </>
    );
  }

  // ----------------------------------------------------
  // AUTHENTICATED OMNISTAFF HRMS SUITE INTEGRATION
  // ----------------------------------------------------
  if (activeSuite === 'hrms') {
    return (
      <OmniStaffApp 
        onLogout={handleLogout}
        onOpenIntroHub={() => setShowIntroLaunchpad(true)}
        onChooseWorkspace={(profile) => {
          handleSuccessfulLogin(profile);
        }}
      />
    );
  }

  // ----------------------------------------------------
  // MAIN DASHBOARD APPLICATION
  // ----------------------------------------------------
  return (
    <div className="app-container">
      {/* Toast Alert */}
      {toastMessage && (
        <div style={{
          position: 'fixed',
          bottom: '24px',
          right: '24px',
          backgroundColor: '#0f172a',
          color: '#ffffff',
          padding: '12px 20px',
          borderRadius: '12px',
          boxShadow: '0 20px 25px -5px rgba(0,0,0,0.3)',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          zIndex: 9999,
          fontSize: '14px',
          animation: 'slideUp 0.2s ease-out'
        }}>
          <CheckCircle size={16} style={{ color: '#10b981' }} />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Hidden File Input for Full System Backup Restore */}
      <input 
        type="file" 
        ref={backupFileInputRef} 
        accept=".json" 
        style={{ display: 'none' }}
        onChange={(e) => {
          if (e.target.files && e.target.files[0]) {
            handleRestoreFullBackup(e.target.files[0]);
          }
        }}
      />

      {/* Hidden File Input for Custom Official Stamp Upload */}
      <input 
        type="file" 
        ref={stampFileInputRef} 
        accept="image/*" 
        style={{ display: 'none' }}
        onChange={(e) => {
          if (e.target.files && e.target.files[0]) {
            handleUploadStamp(e.target.files[0]);
          }
        }}
      />

      {/* Hidden File Input for User Profile Photo Upload */}
      <input 
        type="file" 
        ref={profilePhotoInputRef} 
        accept="image/*" 
        style={{ display: 'none' }}
        onChange={(e) => {
          if (e.target.files && e.target.files[0]) {
            handleUploadProfilePhoto(e.target.files[0]);
          }
        }}
      />



      {/* Floating AI Assistant Trigger FAB */}
      {activePortal !== 'client' && (
        <button 
          className="ai-assistant-fab"
          onClick={() => setShowAiChat(!showAiChat)}
          title="Open AI Sales Assistant"
        >
          <Sparkles size={18} />
          <span>{t.aiAssistant}</span>
        </button>
      )}

      {/* Universal Multi-Suite Spotlight Command Palette (Ctrl + K) */}
      {showSpotlight && (
        <div className="spotlight-backdrop" onClick={() => setShowSpotlight(false)}>
          <div className="spotlight-container" onClick={(e) => e.stopPropagation()}>
            <div className="spotlight-search-header">
              <Command size={20} style={{ color: '#0284c7' }} />
              <input 
                type="text" 
                className="spotlight-search-input" 
                placeholder={"Type any command or search (e.g. 'Add employee to HRMS', 'New lead', 'GST invoice', 'Backup')..."}
                autoFocus
                value={spotlightQuery}
                onChange={(e) => setSpotlightQuery(e.target.value)}
              />
              <span className="spotlight-shortcut-badge">ESC</span>
            </div>

            <div className="spotlight-results">
              {/* Universal Actions & Commands */}
              {spotlightResults.actions && spotlightResults.actions.length > 0 && (
                <div>
                  <div className="spotlight-section-title">
                    ⚡ {'Instant Actions & Commands'} ({spotlightResults.actions.length})
                  </div>
                  {spotlightResults.actions.map((act: any, idx: number) => (
                    <div key={idx} className="spotlight-item" onClick={act.action}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <span style={{ fontSize: '20px' }}>{act.icon}</span>
                        <div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <strong style={{ fontSize: '13.5px', color: 'var(--text-primary)' }}>{act.label}</strong>
                            <span className={`spotlight-category-tag ${
                              act.category === 'HRMS' ? 'hrms-tag' :
                              act.category === 'CRM' ? 'crm-tag' :
                              act.category === 'Super Admin' ? 'super-admin-tag' : 'system-tag'
                            }`}>
                              {act.category}
                            </span>
                          </div>
                          <span style={{ fontSize: '11.5px', color: 'var(--text-secondary)' }}>{act.sublabel}</span>
                        </div>
                      </div>
                      <ArrowRight size={15} style={{ color: 'var(--text-secondary)', flexShrink: 0 }} />
                    </div>
                  ))}
                </div>
              )}

              {/* Matching Staff / Users */}
              {spotlightResults.users && spotlightResults.users.length > 0 && (
                <div>
                  <div className="spotlight-section-title">
                    👥 {'Team Members & Staff'} ({spotlightResults.users.length})
                  </div>
                  {spotlightResults.users.map((u: any) => (
                    <div 
                      key={u.id} 
                      className="spotlight-item"
                      onClick={() => {
                        setShowSpotlight(false);
                        setActiveSuite('crm');
                        setActiveView('users');
                        setShowIntroLaunchpad(false);
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: 'var(--accent-light)', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', fontWeight: 800 }}>
                          {u.avatar}
                        </div>
                        <div>
                          <strong style={{ fontSize: '13px' }}>{u.name}</strong>
                          <span style={{ fontSize: '11px', color: 'var(--text-secondary)', marginLeft: '8px' }}>{u.email}</span>
                        </div>
                      </div>
                      <span style={{ fontSize: '11px', fontWeight: 700, padding: '2px 8px', borderRadius: '10px', background: 'var(--bg-base)', border: '1px solid var(--border-color)' }}>
                        {u.role}
                      </span>
                    </div>
                  ))}
                </div>
              )}

              {/* Matching Leads */}
              {spotlightResults.leads && spotlightResults.leads.length > 0 && (
                <div>
                  <div className="spotlight-section-title">
                    💼 {'Matching CRM Leads'} ({spotlightResults.leads.length})
                  </div>
                  {spotlightResults.leads.map((l: any) => (
                    <div 
                      key={l.id} 
                      className="spotlight-item"
                      onClick={() => {
                        setShowSpotlight(false);
                        setActiveSuite('crm');
                        setShowIntroLaunchpad(false);
                        setSelectedLeadForDrawer(l);
                      }}
                    >
                      <div>
                        <strong style={{ fontSize: '13px' }}>{l.name}</strong>
                        <span style={{ fontSize: '11px', color: 'var(--text-secondary)', marginLeft: '8px' }}>{l.email} • {l.status}</span>
                      </div>
                      <span style={{ fontWeight: 800, color: '#0284c7' }}>{currencySymbol}{l.value.toLocaleString()}</span>
                    </div>
                  ))}
                </div>
              )}

              {/* Matching Deals */}
              {spotlightResults.deals && spotlightResults.deals.length > 0 && (
                <div>
                  <div className="spotlight-section-title">
                    📈 {'Matching Pipeline Deals'} ({spotlightResults.deals.length})
                  </div>
                  {spotlightResults.deals.map((d: any) => (
                    <div 
                      key={d.id} 
                      className="spotlight-item"
                      onClick={() => {
                        setShowSpotlight(false);
                        setActiveSuite('crm');
                        setActiveView('dashboard');
                        setDashboardTab('deals');
                        setShowIntroLaunchpad(false);
                      }}
                    >
                      <div>
                        <strong style={{ fontSize: '13px' }}>{d.name}</strong>
                        <span style={{ fontSize: '11px', color: 'var(--text-secondary)', marginLeft: '8px' }}>Stage: {d.stage} • Rep: {d.assignedRep}</span>
                      </div>
                      <span style={{ fontWeight: 800, color: '#10b981' }}>{currencySymbol}{d.value.toLocaleString()}</span>
                    </div>
                  ))}
                </div>
              )}

              {/* Matching Support Tickets */}
              {spotlightResults.tickets && spotlightResults.tickets.length > 0 && (
                <div>
                  <div className="spotlight-section-title">
                    🎧 {'Matching Support Tickets'} ({spotlightResults.tickets.length})
                  </div>
                  {spotlightResults.tickets.map((t: any) => (
                    <div 
                      key={t.id} 
                      className="spotlight-item"
                      onClick={() => {
                        setShowSpotlight(false);
                        setActiveSuite('crm');
                        setActiveView('tickets');
                        setShowIntroLaunchpad(false);
                      }}
                    >
                      <div>
                        <strong style={{ fontSize: '13px' }}>[{t.ticketNo}] {t.subject}</strong>
                        <span style={{ fontSize: '11px', color: 'var(--text-secondary)', marginLeft: '8px' }}>Client: {t.clientName}</span>
                      </div>
                      <span style={{ fontSize: '10px', fontWeight: 800, padding: '2px 6px', borderRadius: '4px', background: t.status === 'Open' ? 'rgba(239, 68, 68, 0.1)' : 'rgba(16, 185, 129, 0.1)', color: t.status === 'Open' ? '#ef4444' : '#10b981' }}>
                        {t.status}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* AI Assistant Chat Panel */}
      {showAiChat && (
        <div className="ai-chat-panel">
          <div className="ai-chat-header">
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Bot size={18} />
              <span style={{ fontWeight: 700, fontSize: '14px' }}>ITLC Sales AI Copilot</span>
            </div>
            <button 
              style={{ background: 'none', border: 'none', color: '#ffffff', cursor: 'pointer' }}
              onClick={() => setShowAiChat(false)}
            >
              <X size={18} />
            </button>
          </div>

          <div className="ai-chat-messages">
            {chatMessages.map(m => (
              <div key={m.id} className={`ai-msg-bubble ${m.sender === 'ai' ? 'ai-msg-bot' : 'ai-msg-user'}`}>
                {m.text}
              </div>
            ))}
            
            {/* Quick Action Prompt Chips */}
            <div className="ai-quick-prompts">
              <span style={{ fontSize: '10.5px', color: 'var(--text-secondary)', fontWeight: 700 }}>QUICK PROMPTS:</span>
              <button className="ai-prompt-btn" onClick={() => handleSendAiPrompt("Analyze my sales pipeline and highest deals")}>
                📊 Analyze live pipeline
              </button>
              <button className="ai-prompt-btn" onClick={() => handleSendAiPrompt("Draft a high-conversion follow-up message")}>
                ✍️ Draft follow-up message template
              </button>
              <button className="ai-prompt-btn" onClick={() => handleSendAiPrompt("Give me a revenue forecast and target gap")}>
                📈 Forecast revenue attainment
              </button>
            </div>
          </div>

          <div className="ai-chat-input-bar">
            <input 
              type="text" 
              className="form-control" 
              placeholder={t.aiHelp}
              style={{ fontSize: '12px' }}
              value={aiInput}
              onChange={(e) => setAiInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') handleSendAiPrompt(); }}
            />
            <button className="btn btn-primary" style={{ padding: '8px 12px' }} onClick={() => handleSendAiPrompt()}>
              <Send size={14} />
            </button>
          </div>
        </div>
      )}

      {/* Sidebar navigation */}
      <aside className="sidebar">
        <div className="logo-section" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{
            width: '38px',
            height: '38px',
            borderRadius: '50%',
            backgroundColor: '#ffffff',
            border: '2px solid #0284c7',
            boxShadow: '0 2px 8px rgba(2, 132, 199, 0.25)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            overflow: 'hidden',
            flexShrink: 0,
            padding: '2px'
          }}>
            <img 
              src="/itlc_logo.png" 
              alt="ITLC INDIA PVT LTD" 
              style={{ width: '100%', height: '100%', objectFit: 'contain' }} 
            />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span className="logo-text" style={{ fontSize: '13px', fontWeight: 800 }}>ITLC INDIA PVT LTD</span>
            <span style={{ fontSize: '10px', color: 'var(--text-secondary)', fontWeight: 600, textTransform: 'uppercase' }}>
              {activePortal.replace('_', ' ')} PORTAL
            </span>
          </div>
        </div>
        
        <div className="sidebar-title">
          {activePortal === 'super_admin' && "👑 Super Admin Suite"}
          {activePortal === 'admin' && "🏢 Admin Operations"}
          {activePortal === 'manager' && "👔 Sales Leadership"}
          {activePortal === 'rep' && "💼 Sales Pipeline"}
          {activePortal === 'support' && "🎧 Support & Helpdesk"}
          {activePortal === 'client' && "🤝 Customer Portal"}
        </div>
        
        <ul className="nav-list">
          {/* 1. Dashboard (All except Client Portal) */}
          {activePortal !== 'client' && (
            <li 
              className={`nav-item ${activeView === 'dashboard' ? 'active' : ''}`}
              onClick={() => setActiveView('dashboard')}
            >
              <LayoutDashboard size={18} />
              <span>{t.dashboard}</span>
            </li>
          )}

          {/* Client Portal Main Dashboard */}
          {activePortal === 'client' && (
            <li 
              className={`nav-item ${activeView === 'client_portal' ? 'active' : ''}`}
              onClick={() => setActiveView('client_portal')}
            >
              <Award size={18} />
              <span>Client Dashboard</span>
            </li>
          )}

          {/* Kanban Pipeline (Admin, Manager, Rep, SuperAdmin) */}
          {(activePortal === 'admin' || activePortal === 'manager' || activePortal === 'rep' || activePortal === 'super_admin') && (
            <li 
              className={`nav-item ${activeView === 'kanban' ? 'active' : ''}`}
              onClick={() => setActiveView('kanban')}
            >
              <Kanban size={18} />
              <span>{t.kanban}</span>
            </li>
          )}

          {/* Calendar & Tasks (Admin, Manager, Rep) */}
          {(activePortal === 'admin' || activePortal === 'manager' || activePortal === 'rep') && (
            <li 
              className={`nav-item ${activeView === 'calendar' ? 'active' : ''}`}
              onClick={() => setActiveView('calendar')}
            >
              <CheckSquare size={18} />
              <span>{t.calendar}</span>
            </li>
          )}

          {/* Invoices & Billing (Admin, SuperAdmin, Manager, Client) */}
          {(activePortal === 'admin' || activePortal === 'super_admin' || activePortal === 'manager' || activePortal === 'client') && (
            <li 
              className={`nav-item ${activeView === 'invoices' ? 'active' : ''}`}
              onClick={() => setActiveView('invoices')}
            >
              <Receipt size={18} />
              <span>{activePortal === 'client' ? 'My Invoices' : t.invoices}</span>
            </li>
          )}

          {/* Support Tickets Queue (SuperAdmin, Admin, Support, Client) */}
          {(activePortal === 'super_admin' || activePortal === 'admin' || activePortal === 'support' || activePortal === 'client') && (
            <li 
              className={`nav-item ${activeView === 'tickets' ? 'active' : ''}`}
              onClick={() => setActiveView('tickets')}
            >
              <Ticket size={18} />
              <span>{activePortal === 'client' ? 'Support Tickets' : 'Helpdesk Tickets'}</span>
              {tickets.filter(t => t.status === 'Open').length > 0 && (
                <span className="badge" style={{ marginLeft: 'auto', background: '#ef4444' }}>
                  {tickets.filter(t => t.status === 'Open').length}
                </span>
              )}
            </li>
          )}

          {/* Broadcast Campaigns (Admin, SuperAdmin) */}
          {(activePortal === 'admin' || activePortal === 'super_admin') && (
            <li 
              className={`nav-item ${activeView === 'campaigns' ? 'active' : ''}`}
              onClick={() => setActiveView('campaigns')}
            >
              <Megaphone size={18} />
              <span>{t.campaigns}</span>
            </li>
          )}
          
          {/* Users & Staff (Admin, SuperAdmin, Manager) */}
          {(activePortal === 'admin' || activePortal === 'super_admin' || activePortal === 'manager') && (
            <li 
              className={`nav-item ${activeView === 'users' ? 'active' : ''}`}
              onClick={() => setActiveView('users')}
            >
              <Users size={18} />
              <span>{activePortal === 'super_admin' ? 'All Tenants & Users' : t.users}</span>
            </li>
          )}

          {/* Roles & Permissions (Super Admin only) */}
          {activePortal === 'super_admin' && (
            <li 
              className={`nav-item ${activeView === 'roles' ? 'active' : ''}`}
              onClick={() => setActiveView('roles')}
            >
              <ShieldCheck size={18} />
              <span>{t.roles}</span>
            </li>
          )}
          
          {/* System Settings & Backup (Super Admin, Admin) */}
          {(activePortal === 'super_admin' || activePortal === 'admin') && (
            <li 
              className={`nav-item ${activeView === 'settings' ? 'active' : ''}`}
              onClick={() => setActiveView('settings')}
            >
              <Settings size={18} />
              <span>{activePortal === 'super_admin' ? 'Master Config & PIN' : t.settings}</span>
            </li>
          )}
          
          {/* Reports & Audit Logs (Super Admin, Admin, Manager, Support) */}
          {activePortal !== 'client' && activePortal !== 'rep' && (
            <li 
              className={`nav-item ${activeView === 'reports' ? 'active' : ''}`}
              onClick={() => setActiveView('reports')}
            >
              <BarChart3 size={18} />
              <span>{activePortal === 'super_admin' ? 'Audit Logs & Health' : t.reports}</span>
            </li>
          )}
        </ul>


        <div className="sidebar-footer">
          <div 
            className="user-profile-circle" 
            style={{ backgroundColor: 'var(--accent-light)', color: 'var(--text-primary)', border: '1px solid var(--border-color)', cursor: 'pointer' }}
            onClick={() => {
              setProfileName(currentUserContext.name);
              setProfileEmail(currentUserContext.email);
              setProfilePhotoUrl(currentUserContext.photoUrl || '');
              setShowProfileModal(true);
            }}
            title="Edit My Profile"
          >
            {currentUserContext.photoUrl ? (
              <img src={currentUserContext.photoUrl} alt={currentUserContext.name} className="user-profile-img" />
            ) : (
              currentUserContext.avatar
            )}
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', flex: 1, minWidth: 0 }}>
            <span style={{ fontSize: '13px', fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{currentUserContext.name}</span>
            <span style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>{currentUserContext.role}</span>
          </div>
          <button 
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)', padding: '4px' }}
            onClick={handleLogout}
            title="Log out"
          >
            <LogOut size={16} />
          </button>
        </div>
      </aside>

      {/* Main wrapper */}
      <main className="main-wrapper">
        
        {/* Top Navbar */}
        <header className="navbar">
          <div className="navbar-left">
            {/* Spotlight Command Bar Trigger Button */}
            <button 
              className="btn btn-secondary" 
              style={{ padding: '6px 12px', fontSize: '12px', gap: '8px' }}
              onClick={() => setShowSpotlight(true)}
              title="Open Spotlight Search (Ctrl + K)"
            >
              <Search size={14} />
              <span>Search...</span>
              <span className="spotlight-shortcut-badge">Ctrl K</span>
            </button>

            {/* Active Role Workspace Badge (Clean Indicator, No manual switcher) */}
            <div 
              className={`portal-badge ${activePortal}`}
              style={{ 
                display: 'inline-flex', 
                alignItems: 'center', 
                gap: '8px', 
                padding: '6px 14px',
                fontSize: '12px',
                borderRadius: '20px',
                fontWeight: 600
              }}
            >
              <span style={{ fontSize: '14px' }}>
                {activePortal === 'super_admin' ? '👑' : 
                 activePortal === 'admin' ? '🏢' : 
                 activePortal === 'manager' ? '👔' : 
                 activePortal === 'rep' ? '💼' : 
                 activePortal === 'support' ? '🎧' : '🤝'}
              </span>
              <span>
                {activePortal === 'super_admin' && "Super Admin Workspace"}
                {activePortal === 'admin' && "Operations Admin Workspace"}
                {activePortal === 'manager' && "Sales Manager Workspace"}
                {activePortal === 'rep' && "Sales Rep Workspace"}
                {activePortal === 'support' && "Support & Helpdesk"}
                {activePortal === 'client' && "Customer Portal"}
              </span>
            </div>
          </div>

          <div className="navbar-right">
            {/* Live Subscription, Storage & Validity Meter Pill */}
            <button 
              className="btn btn-secondary"
              onClick={() => setShowSubscriptionMeterModal(true)}
              style={{ 
                padding: '5px 12px', 
                fontSize: '11px', 
                gap: '6px', 
                borderRadius: '20px', 
                background: 'rgba(2, 132, 199, 0.08)', 
                color: '#0284c7', 
                borderColor: 'rgba(2, 132, 199, 0.3)',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center'
              }}
              title="Open Live Cloud Quota, Storage & Subscription Meter"
            >
              <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: calculateSubscriptionMetrics(activeTenant).isExpiringSoon ? '#f59e0b' : '#10b981', display: 'inline-block' }} />
              <span>💎 {calculateSubscriptionMetrics(activeTenant).planName}</span>
              <span style={{ color: '#94a3b8' }}>•</span>
              <span>{calculateSubscriptionMetrics(activeTenant).daysRemaining}d Left</span>
              <span style={{ color: '#94a3b8' }}>•</span>
              <span>💾 {calculateSubscriptionMetrics(activeTenant).storageUsedGb}/{calculateSubscriptionMetrics(activeTenant).storageLimitGb} GB</span>
            </button>

            {/* Smart Automations & Growth Hub Button */}
            <button 
              className="btn btn-secondary"
              onClick={() => {
                setAutomationInitialTab('payslip');
                setShowAutomationsModal(true);
              }}
              style={{ 
                padding: '5px 12px', 
                fontSize: '11px', 
                gap: '6px', 
                borderRadius: '20px', 
                background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.12), rgba(6, 95, 70, 0.15))', 
                color: '#10b981', 
                borderColor: 'rgba(16, 185, 129, 0.35)',
                fontWeight: 800,
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center'
              }}
              title="Open Smart Automations (Salary Slips, WhatsApp Dispatch, GPS Geofence & EOD Reports)"
            >
              <Zap size={13} style={{ color: '#10b981' }} />
              <span>⚡ {'Smart Automations'}</span>
            </button>

            {/* Choose Destination / Switch Workspace Button */}
            

            {/* Dark mode button */}
            <button 
              className="icon-badge-btn"
              onClick={() => setDarkMode(!darkMode)}
              title="Toggle Dark/Light Mode"
            >
              {darkMode ? <Sun size={18} /> : <Moon size={18} />}
            </button>

            {/* Keyboard Shortcuts button */}
            <button 
              className="icon-badge-btn"
              onClick={() => setShowShortcutsModal(true)}
              title="Keyboard Shortcuts (?)"
            >
              <Keyboard size={18} />
            </button>

            {/* Notification Drawer */}
            <button 
              className="icon-badge-btn"
              onClick={() => setShowNotifDropdown(!showNotifDropdown)}
            >
              <Bell size={18} />
              {notifications.length > 0 && <span className="badge">{notifications.length}</span>}
            </button>


            {showNotifDropdown && (
              <div className="notifications-dropdown">
                <div className="notif-header">
                  <span className="notif-title">Activity Alerts</span>
                  <button 
                    className="notif-clear"
                    onClick={() => {
                      setNotifications([]);
                      triggerToast("All alerts cleared.");
                    }}
                  >
                    Clear all
                  </button>
                </div>
                <div className="notif-list">
                  {notifications.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '16px', color: 'var(--text-secondary)', fontSize: '12px' }}>No new notifications</div>
                  ) : (
                    notifications.map(n => (
                      <div key={n.id} className="notif-item">
                        <div>
                          <p style={{ fontWeight: 500 }}>{n.text}</p>
                          <span style={{ fontSize: '10px', color: 'var(--text-secondary)' }}>{n.time}</span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}

            <div 
              className="user-profile-circle"
              onClick={() => {
                setProfileName(currentUserContext.name);
                setProfileEmail(currentUserContext.email);
                setProfilePhotoUrl(currentUserContext.photoUrl || '');
                setShowProfileModal(true);
              }}
              title={`Account Settings: ${currentUserContext.name} (${currentUserContext.role})`}
            >
              {currentUserContext.photoUrl ? (
                <img src={currentUserContext.photoUrl} alt={currentUserContext.name} className="user-profile-img" />
              ) : (
                currentUserContext.avatar
              )}
            </div>

            {/* Topbar Logout Button */}
            <button 
              className="icon-badge-btn"
              onClick={handleLogout}
              title="Sign Out"
              style={{ color: 'var(--danger)' }}
            >
              <LogOut size={18} />
            </button>
          </div>
        </header>

        {/* View container */}
        <div className="view-container">

          {/* Access Control Guard */}
          {activeView !== 'dashboard' && activeView !== 'kanban' && activeView !== 'calendar' && activeView !== 'invoices' && activeView !== 'campaigns' && activeView !== 'reports' && activeView !== 'tickets' && activeView !== 'client_portal' && !hasPermission('manage_users') && (
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '60px 40px',
              backgroundColor: 'var(--bg-card)',
              border: '1px solid var(--border-color)',
              borderRadius: '16px',
              textAlign: 'center',
              boxShadow: 'var(--shadow-sm)'
            }}>
              <Lock size={48} style={{ color: 'var(--danger)', marginBottom: '16px' }} />
              <h2 style={{ fontSize: '20px', fontWeight: 600, marginBottom: '8px' }}>Access Denied</h2>
              <p style={{ color: 'var(--text-secondary)', fontSize: '14px', maxWidth: '400px', lineHeight: 1.5 }}>
                Your current context role (<strong>{currentUserContext.role}</strong>) does not have permission to view or edit {activeView}.
              </p>
              <button 
                className="btn btn-primary" 
                style={{ marginTop: '20px' }}
                onClick={() => {
                  const { view } = getPortalAndDefaultViewForRole(currentUserContext.role);
                  setActiveView(view);
                }}
              >
                Go to My Workspace
              </button>
            </div>
          )}

          {/* VIEW 1: DASHBOARD */}
          {activeView === 'dashboard' && (
            <div>
              <div className="view-header-row">
                <div>
                  <h1 className="view-title">{t.dashboard}</h1>
                  <p className="view-subtitle">Live overview of your pipeline and operations</p>
                </div>
                
                <div className="view-actions" style={{ alignItems: 'center' }}>
                  {/* Live Date Presets */}
                  <div className="date-preset-pills">
                    <button className={`preset-pill ${datePreset === 'ALL' ? 'active' : ''}`} onClick={() => setDatePreset('ALL')}>All Time</button>
                    <button className={`preset-pill ${datePreset === 'TODAY' ? 'active' : ''}`} onClick={() => setDatePreset('TODAY')}>Today</button>
                    <button className={`preset-pill ${datePreset === 'WEEK' ? 'active' : ''}`} onClick={() => setDatePreset('WEEK')}>This Week</button>
                    <button className={`preset-pill ${datePreset === 'MONTH' ? 'active' : ''}`} onClick={() => setDatePreset('MONTH')}>This Month</button>
                  </div>

                  {(activePortal === 'super_admin' || activePortal === 'admin') && (
                    <button 
                      className="btn btn-secondary"
                      onClick={() => setShowImportModal(true)}
                      title="Bulk upload CSV file"
                    >
                      <UploadCloud size={16} />
                      <span>{t.importCSV}</span>
                    </button>
                  )}

                  {(activePortal === 'super_admin' || activePortal === 'admin' || activePortal === 'manager') && (
                    <button 
                      className="btn btn-secondary"
                      onClick={() => setShowExportModal(true)}
                    >
                      <Download size={16} />
                      <span>{t.exportData}</span>
                    </button>
                  )}
                  
                  {activePortal !== 'support' && activePortal !== 'client' && (
                    <button 
                      className="btn btn-primary"
                      onClick={openAddLeadModal}
                    >
                      <Plus size={16} />
                      <span>{t.addLead}</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Smart SLA Follow-Up & Overdue Warning Ribbon */}
              {(overdueTasks.length > 0 || attentionLeads.length > 0) && (
                <div className="sla-alert-ribbon">
                  <div className="sla-alert-content">
                    <AlertTriangle size={18} style={{ color: 'var(--danger)' }} />
                    <span>
                      <strong>Attention Needed:</strong> {overdueTasks.length} task(s) overdue and {attentionLeads.length} new lead(s) awaiting contact!
                    </span>
                    <span className="sla-badge-count">{overdueTasks.length + attentionLeads.length} Urgent</span>
                  </div>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button className="btn btn-secondary" style={{ fontSize: '11px', padding: '4px 10px' }} onClick={() => setActiveView('calendar')}>
                      View Tasks
                    </button>
                    <button className="btn btn-primary" style={{ fontSize: '11px', padding: '4px 10px' }} onClick={() => setDashboardTab('leads')}>
                      Review Leads
                    </button>
                  </div>
                </div>
              )}

              {/* Metric Cards Grid */}
              <div className="metrics-grid">
                <div className="metric-card">
                  <div className="metric-card-header">
                    <span>{t.totalRevenue}</span>
                    <div className="metric-icon-box"><DollarSign size={16} /></div>
                  </div>
                  <div className="metric-val">{currencySymbol}{currentTotalRevenue.toLocaleString()}</div>
                  <div className="metric-sub">
                    <span className="trend-pill dark"><TrendingUp size={12} /> {revenuePercentOfTarget}% of target</span>
                  </div>
                </div>

                <div className="metric-card">
                  <div className="metric-card-header">
                    <span>{t.activeLeads}</span>
                    <div className="metric-icon-box"><Target size={16} /></div>
                  </div>
                  <div className="metric-val">{activeLeadsCount}</div>
                  <div className="metric-sub">
                    <span className="trend-pill dark">+{dateFilteredLeads.length} {t.registered}</span>
                  </div>
                </div>

                <div className="metric-card">
                  <div className="metric-card-header">
                    <span>{t.teamPerformance}</span>
                    <div className="metric-icon-box"><UserCheck size={16} /></div>
                  </div>
                  <div className="metric-val">100%</div>
                  <div style={{ width: '100%' }}>
                    <div className="progress-bar-container">
                      <div className="progress-bar-fill" style={{ width: '100%' }}></div>
                    </div>
                    <span style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>{t.targetScore}</span>
                  </div>
                </div>

                <div className="metric-card">
                  <div className="metric-card-header">
                    <span>{t.activeDeals}</span>
                    <div className="metric-icon-box"><Briefcase size={16} /></div>
                  </div>
                  <div className="metric-val">{activeDealsCount}</div>
                  <div className="metric-sub">
                    <span className="trend-pill dark">{currencySymbol}{pipelineValue.toLocaleString()} {t.pipelineVal}</span>
                  </div>
                </div>
              </div>

              {/* Sub-tabs */}
              <div className="dashboard-subtabs">
                <span className={`subtab ${dashboardTab === 'overview' ? 'active' : ''}`} onClick={() => setDashboardTab('overview')}>{t.overview}</span>
                <span className={`subtab ${dashboardTab === 'team' ? 'active' : ''}`} onClick={() => setDashboardTab('team')}>{t.team}</span>
                <span className={`subtab ${dashboardTab === 'leads' ? 'active' : ''}`} onClick={() => setDashboardTab('leads')}>{t.leadsTab} ({leads.length})</span>
                <span className={`subtab ${dashboardTab === 'deals' ? 'active' : ''}`} onClick={() => setDashboardTab('deals')}>{t.dealsTab} ({deals.length})</span>
              </div>

              {/* Subtab: Overview */}
              {dashboardTab === 'overview' && (
                <div>
                  {/* Top Analytics Row: Revenue Trend + Lead Sources + Target Speedometer Gauge */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr 0.9fr', gap: '24px', marginBottom: '24px' }}>
                    
                    {/* 1. Line Chart */}
                    <div className="chart-card">
                      <h3 className="chart-card-title">{t.revenueTrend}</h3>
                      <div className="chart-container" style={{ height: '220px' }}>
                        <Line data={lineChartData} options={lineChartOptions} />
                      </div>
                    </div>

                    {/* 2. Pie Chart */}
                    <div className="chart-card">
                      <h3 className="chart-card-title">{t.leadSources}</h3>
                      <div className="chart-container" style={{ height: '220px' }}>
                        {dateFilteredLeads.length === 0 ? (
                          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--text-secondary)', gap: '8px' }}>
                            <Inbox size={32} />
                            <span style={{ fontSize: '13px' }}>No lead sources recorded yet</span>
                          </div>
                        ) : (
                          <Pie data={pieChartData} options={pieChartOptions} />
                        )}
                      </div>
                    </div>

                    {/* 3. Goal Attainment Speedometer Gauge */}
                    <div className="gauge-card">
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontWeight: 700, fontSize: '14px' }}>Target Attainment</span>
                        <Award size={16} style={{ color: 'var(--accent-color)' }} />
                      </div>

                      <div className="gauge-meter-wrapper">
                        <div 
                          className="circular-gauge-circle"
                          style={{
                            background: `conic-gradient(#3b82f6 ${Math.min(100, Math.max(0, rawPercentOfTarget))}%, ${darkMode ? '#1e293b' : '#e2e8f0'} 0%)`
                          }}
                        >
                          <div className="circular-gauge-inner">
                            <span style={{ fontSize: '20px', fontWeight: 800, color: 'var(--text-primary)' }}>{revenuePercentOfTarget}%</span>
                            <span style={{ fontSize: '10px', color: 'var(--text-secondary)', fontWeight: 600 }}>ATTAINED</span>
                          </div>
                        </div>
                      </div>

                      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', textAlign: 'center', fontSize: '12px' }}>
                        <div style={{ color: 'var(--text-secondary)' }}>
                          Target: <strong>{currencySymbol}{settings.revenueGoal.toLocaleString()}</strong>
                        </div>
                        <div style={{ color: rawPercentOfTarget >= 100 ? 'var(--success)' : 'var(--accent-color)', fontWeight: 600 }}>
                          {rawPercentOfTarget >= 100 ? '🎯 Target Smashed!' : `Gap: ${currencySymbol}${Math.max(0, settings.revenueGoal - currentTotalRevenue).toLocaleString()}`}
                        </div>
                      </div>
                    </div>

                  </div>

                  {/* Visual Sales Pipeline Conversion Funnel */}
                  <div className="funnel-container-card">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <h3 className="chart-card-title" style={{ marginBottom: '4px' }}>{t.funnel}</h3>
                        <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Step-down progression efficiency through sales cycle</span>
                      </div>
                      <Layers size={18} style={{ color: 'var(--accent-color)' }} />
                    </div>

                    <div className="funnel-steps-wrapper">
                      {/* Step 1: Ingested Leads */}
                      <div className="funnel-step-row">
                        <span className="funnel-step-label">1. Total Inquiries / Leads</span>
                        <div className="funnel-bar-track">
                          <div className="funnel-bar-fill" style={{ width: '100%', background: 'linear-gradient(90deg, #3b82f6, #60a5fa)' }}>
                            100%
                          </div>
                        </div>
                        <span className="funnel-count-pill">{funnelStats.totalLeads} Leads</span>
                      </div>

                      {/* Step 2: Contacted */}
                      <div className="funnel-step-row">
                        <span className="funnel-step-label">2. Contacted & Engaged</span>
                        <div className="funnel-bar-track">
                          <div className="funnel-bar-fill" style={{ width: `${Math.max(8, funnelStats.contactedPct)}%`, background: 'linear-gradient(90deg, #f59e0b, #fbbf24)' }}>
                            {funnelStats.contactedPct}%
                          </div>
                        </div>
                        <span className="funnel-count-pill">{funnelStats.contactedLeads} Leads</span>
                      </div>

                      {/* Step 3: Qualified Opportunities */}
                      <div className="funnel-step-row">
                        <span className="funnel-step-label">3. Qualified Proposals</span>
                        <div className="funnel-bar-track">
                          <div className="funnel-bar-fill" style={{ width: `${Math.max(8, funnelStats.qualifiedPct)}%`, background: 'linear-gradient(90deg, #8b5cf6, #a78bfa)' }}>
                            {funnelStats.qualifiedPct}%
                          </div>
                        </div>
                        <span className="funnel-count-pill">{funnelStats.qualifiedLeads} Leads</span>
                      </div>

                      {/* Step 4: Closed Won Deals */}
                      <div className="funnel-step-row">
                        <span className="funnel-step-label">4. Closed Won Deals</span>
                        <div className="funnel-bar-track">
                          <div className="funnel-bar-fill" style={{ width: `${Math.max(8, funnelStats.closedPct)}%`, background: 'linear-gradient(90deg, #10b981, #34d399)' }}>
                            {funnelStats.closedPct}% Conversion
                          </div>
                        </div>
                        <span className="funnel-count-pill">{funnelStats.closedDeals} Deals</span>
                      </div>
                    </div>
                  </div>

                  {/* System Audit Trail & Live Activity Log Card (Admin & Manager Only) */}
                  {activePortal !== 'rep' && activePortal !== 'support' && (
                    <div className="audit-logs-card" style={{ marginBottom: '32px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                          <h3 className="chart-card-title" style={{ marginBottom: '4px' }}>{t.auditTrail}</h3>
                          <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Automated compliance log of system operations & user actions</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          {(currentUserContext.role === 'Super Admin' || currentUserContext.role === 'Admin') && auditLogs.length > 1 && (
                            <button 
                              className="btn btn-secondary" 
                              style={{ padding: '4px 10px', fontSize: '11px', color: '#ef4444', borderColor: 'rgba(239, 68, 68, 0.3)' }}
                              onClick={handleClearAuditLogs}
                              title="Purge audit trail logs (Requires Master PIN)"
                            >
                              <Trash2 size={12} /> Clear Logs
                            </button>
                          )}
                          <History size={18} style={{ color: 'var(--accent-color)' }} />
                        </div>
                      </div>

                      <div className="audit-logs-list">
                        {auditLogs.map(log => (
                          <div key={log.id} className="audit-log-item">
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                              <span className={`audit-badge audit-${log.category}`}>
                                {log.category}
                              </span>
                              <span style={{ fontWeight: 600 }}>{log.action}</span>
                              <span style={{ color: 'var(--text-secondary)' }}>— {log.detail}</span>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-secondary)' }}>
                              <span>By: <strong>{log.actor}</strong></span>
                              <span>•</span>
                              <span>{log.timestamp}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Action Cards */}
                  <div className="actions-grid">
                    <div className="action-card" onClick={() => setActiveView('kanban')}>
                      <div className="action-card-icon" style={{ backgroundColor: 'var(--info-light)', color: 'var(--info)' }}>
                        <Kanban size={20} />
                      </div>
                      <div className="action-card-content">
                        <h4 className="action-card-title">{t.kanban}</h4>
                        <p className="action-card-desc">Drag & drop leads across stages</p>
                      </div>
                    </div>

                    {(activePortal === 'super_admin' || activePortal === 'admin') && (
                      <div className="action-card" onClick={() => setActiveView('campaigns')}>
                        <div className="action-card-icon" style={{ backgroundColor: 'var(--warning-light)', color: '#d97706' }}>
                          <Megaphone size={20} />
                        </div>
                        <div className="action-card-content">
                          <h4 className="action-card-title">{t.campaigns}</h4>
                          <p className="action-card-desc">Broadcast WhatsApp & Email</p>
                        </div>
                      </div>
                    )}

                    {(activePortal === 'super_admin' || activePortal === 'admin' || activePortal === 'manager') && (
                      <div className="action-card" onClick={() => setActiveView('invoices')}>
                        <div className="action-card-icon" style={{ backgroundColor: 'var(--purple-light)', color: 'var(--purple)' }}>
                          <Receipt size={20} />
                        </div>
                        <div className="action-card-content">
                          <h4 className="action-card-title">{t.invoices}</h4>
                          <p className="action-card-desc">Generate client bills and PDF</p>
                        </div>
                      </div>
                    )}

                    {activePortal === 'rep' && (
                      <div className="action-card" onClick={() => setActiveView('calendar')}>
                        <div className="action-card-icon" style={{ backgroundColor: 'var(--success-light)', color: 'var(--success)' }}>
                          <CheckSquare size={20} />
                        </div>
                        <div className="action-card-content">
                          <h4 className="action-card-title">{t.calendar}</h4>
                          <p className="action-card-desc">Schedule follow-ups & meetings</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Subtab: Team (With Leaderboard & Incentive Simulator) */}
              {dashboardTab === 'team' && (
                <div>
                  {/* Sales Leaderboard Podium */}
                  <div className="leaderboard-podium-grid">
                    {rankedReps.slice(0, 3).map((rep, idx) => (
                      <div key={rep.id} className={`podium-card podium-rank-${idx + 1}`}>
                        <span className="podium-crown-badge">
                          {idx === 0 ? '🥇' : idx === 1 ? '🥈' : '🥉'}
                        </span>
                        
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          {rep.photoUrl ? (
                            <img src={rep.photoUrl} alt={rep.name} style={{ width: '42px', height: '42px', borderRadius: '50%', objectFit: 'cover' }} />
                          ) : (
                            <div className="auth-logo-box" style={{ width: '42px', height: '42px', fontSize: '15px' }}>
                              {rep.avatar}
                            </div>
                          )}
                          <div>

                            <strong style={{ fontSize: '15px', display: 'block' }}>{rep.name}</strong>
                            <span style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>
                              Rank #{idx + 1} {idx === 0 ? 'Top Closer' : idx === 1 ? 'Runner Up' : 'Bronze Performer'}
                            </span>
                          </div>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', background: 'var(--bg-base)', padding: '10px', borderRadius: '8px', fontSize: '12px' }}>
                          <div>
                            <span style={{ color: 'var(--text-secondary)', display: 'block', fontSize: '10px' }}>CLOSED SALES</span>
                            <strong>{currencySymbol}{rep.totalClosedVal.toLocaleString()}</strong>
                          </div>
                          <div>
                            <span style={{ color: 'var(--text-secondary)', display: 'block', fontSize: '10px' }}>COMMISSION</span>
                            <strong style={{ color: 'var(--success)' }}>+{currencySymbol}{rep.commission.toLocaleString()}</strong>
                          </div>
                        </div>

                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '11px', color: 'var(--text-secondary)' }}>
                          <span>Deals Won: <strong>{rep.closedDealsCount}</strong></span>
                          <span>Win Rate: <strong>{rep.winRate}%</strong></span>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Team Performance Table */}
                  <div className="table-card">
                    <div className="table-header-bar">
                      <div>
                        <h3 className="table-title">Sales Performance & Commission Matrix</h3>
                        <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                          Active Commission Rate: <strong>{settings.commissionRate}%</strong> on closed deals
                        </span>
                      </div>
                      {(activePortal === 'super_admin' || activePortal === 'admin') && (
                        <button 
                          className="btn btn-secondary"
                          style={{ fontSize: '12px', padding: '6px 12px' }}
                          onClick={() => setActiveView('settings')}
                        >
                          <Coins size={14} /> Adjust Commission %
                        </button>
                      )}
                    </div>
                    <div className="table-wrapper">
                      <table className="data-table">
                        <thead>
                          <tr>
                            <th>Representative</th>
                            <th>Role</th>
                            <th>Deals Closed</th>
                            <th>Total Sales Value</th>
                            <th>Commission Earned ({settings.commissionRate}%)</th>
                            <th>Incentive Status</th>
                          </tr>
                        </thead>
                        <tbody>
                          {users.map(u => {
                            const userDeals = deals.filter(d => d.assignedRep === u.name);
                            const closedUserDeals = userDeals.filter(d => d.stage === 'Closed');
                            const userSales = closedUserDeals.reduce((sum, d) => sum + d.value, 0);
                            const commissionEarned = Math.round(userSales * (settings.commissionRate / 100));

                            return (
                              <tr key={u.id}>
                                <td>
                                  <div className="avatar-cell">
                                    {u.photoUrl ? (
                                      <img src={u.photoUrl} alt={u.name} style={{ width: '32px', height: '32px', borderRadius: '50%', objectFit: 'cover' }} />
                                    ) : (
                                      <div className="avatar-badge">{u.avatar}</div>
                                    )}
                                    <span style={{ fontWeight: 600 }}>{u.name}</span>
                                  </div>

                                </td>
                                <td>{u.role}</td>
                                <td>{closedUserDeals.length}</td>
                                <td style={{ fontWeight: 600 }}>{currencySymbol}{userSales.toLocaleString()}</td>
                                <td>
                                  <span className="commission-badge">
                                    +{currencySymbol}{commissionEarned.toLocaleString()}
                                  </span>
                                </td>
                                <td>
                                  <span className={`status-pill ${u.status === 'Active' ? 'active' : 'inactive'}`}>
                                    {userSales > 100000 ? '⭐ Top Achiever' : u.status}
                                  </span>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* 💰 Live Sales Incentive Payout Simulator */}
                  <div className="incentive-simulator-card">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <Calculator size={20} style={{ color: 'var(--accent-color)' }} />
                        <div>
                          <h3 style={{ fontSize: '15px', fontWeight: 700 }}>Sales Incentive & Bonus Simulator</h3>
                          <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Project your take-home payouts based on closed revenue</span>
                        </div>
                      </div>
                      <span className="trend-pill dark">Active Rate: {settings.commissionRate}%</span>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
                        <span>Projected Sales Closing:</span>
                        <strong style={{ fontSize: '16px', color: 'var(--accent-color)' }}>{currencySymbol}{simulatedSales.toLocaleString()}</strong>
                      </div>
                      <input 
                        type="range"
                        min={0}
                        max={5000000}
                        step={50000}
                        value={simulatedSales}
                        onChange={(e) => setSimulatedSales(Number(e.target.value))}
                        style={{ width: '100%', cursor: 'pointer' }}
                      />
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px', color: 'var(--text-secondary)' }}>
                        <span>{currencySymbol}0</span>
                        <span>{currencySymbol}25,00,000</span>
                        <span>{currencySymbol}50,00,000</span>
                      </div>
                    </div>

                    <div className="simulator-result-grid">
                      <div className="simulator-result-box">
                        <span style={{ fontSize: '11px', color: 'var(--text-secondary)', display: 'block' }}>BASE COMMISSION ({settings.commissionRate}%)</span>
                        <strong style={{ fontSize: '18px', color: 'var(--text-primary)' }}>{currencySymbol}{simBaseCommission.toLocaleString()}</strong>
                      </div>

                      <div className="simulator-result-box">
                        <span style={{ fontSize: '11px', color: 'var(--text-secondary)', display: 'block' }}>TIER ACHIEVER BONUS</span>
                        <strong style={{ fontSize: '18px', color: '#f59e0b' }}>+{currencySymbol}{simTierBonus.toLocaleString()}</strong>
                      </div>

                      <div className="simulator-result-box" style={{ background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.12), rgba(59, 130, 246, 0.12))', borderColor: 'var(--success)' }}>
                        <span style={{ fontSize: '11px', color: 'var(--text-secondary)', display: 'block' }}>TOTAL TAKE-HOME PAYOUT</span>
                        <strong style={{ fontSize: '20px', color: 'var(--success)' }}>{currencySymbol}{simTotalPayout.toLocaleString()}</strong>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Subtab: Leads */}
              {dashboardTab === 'leads' && (
                <div className="table-card">
                  <div className="table-header-bar">
                    <div>
                      <h3 className="table-title">Active Lead Directory</h3>
                      <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Click lead name to open Drawer, log calls & timeline</span>
                    </div>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button 
                        className="btn btn-secondary" 
                        style={{ padding: '6px 12px', fontSize: '12px' }}
                        onClick={() => setShowImportModal(true)}
                      >
                        <UploadCloud size={13} /> {t.importCSV}
                      </button>
                      <button 
                        className="btn btn-secondary" 
                        style={{ padding: '6px 12px', fontSize: '12px' }}
                        onClick={() => downloadRealCSV('leads')}
                      >
                        <Download size={13} /> Export CSV
                      </button>
                      <button 
                        className="btn btn-primary" 
                        style={{ padding: '6px 14px', fontSize: '13px' }}
                        onClick={openAddLeadModal}
                      >
                        <Plus size={14} /> {t.addLead}
                      </button>
                    </div>
                  </div>

                  <div style={{ padding: '16px 24px 0 24px' }}>
                    <div className="toolbar-row">
                      <div className="search-box-wrapper">
                        <Search size={15} className="search-icon-inside" />
                        <input 
                          type="text" 
                          className="search-input-field" 
                          placeholder="Search lead by name, email, or phone..."
                          value={leadSearch}
                          onChange={(e) => setLeadSearch(e.target.value)}
                        />
                      </div>
                      
                      <div className="filter-actions-group">
                        <select className="filter-dropdown" value={leadTagFilter} onChange={(e) => setLeadTagFilter(e.target.value)}>
                          <option value="ALL">All Tags</option>
                          <option value="VIP Client">VIP Client</option>
                          <option value="Urgent">Urgent</option>
                          <option value="Enterprise">Enterprise</option>
                          <option value="Hot Deal">Hot Deal</option>
                          <option value="Standard">Standard</option>
                        </select>

                        <select className="filter-dropdown" value={leadStatusFilter} onChange={(e) => setLeadStatusFilter(e.target.value)}>
                          <option value="ALL">All Statuses</option>
                          <option value="New">New</option>
                          <option value="Contacted">Contacted</option>
                          <option value="Qualified">Qualified</option>
                          <option value="Lost">Lost</option>
                        </select>

                        <select className="filter-dropdown" value={leadSourceFilter} onChange={(e) => setLeadSourceFilter(e.target.value)}>
                          <option value="ALL">All Channels</option>
                          <option value="Website">Website</option>
                          <option value="LinkedIn">LinkedIn</option>
                          <option value="Email">Email</option>
                          <option value="Referrals">Referrals</option>
                          <option value="Other">Other</option>
                        </select>

                        {selectedLeadIds.length > 0 && (
                          <button 
                            className="btn btn-secondary" 
                            style={{ backgroundColor: 'rgba(239, 68, 68, 0.1)', borderColor: '#ef4444', color: '#ef4444', fontSize: '12px', padding: '6px 12px' }}
                            onClick={handleBulkDeleteLeads}
                          >
                            <Trash2 size={13} /> Delete Selected ({selectedLeadIds.length})
                          </button>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="table-wrapper">
                    <table className="data-table">
                      <thead>
                        <tr>
                          <th style={{ width: '36px', textAlign: 'center' }}>
                            <input 
                              type="checkbox" 
                              checked={filteredLeads.length > 0 && selectedLeadIds.length === filteredLeads.length} 
                              onChange={handleSelectAllLeads}
                              title="Select All Leads"
                            />
                          </th>
                          <th>Lead Company / Contact</th>
                          <th>Smart Score</th>
                          <th>Tag / Priority</th>
                          <th>CSAT</th>
                          <th>Direct Actions</th>
                          <th>Assigned Rep</th>
                          <th>Deal Value</th>
                          <th>Live Status</th>
                          <th>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredLeads.length === 0 ? (
                          <tr>
                            <td colSpan={10} style={{ textAlign: 'center', padding: '40px', color: 'var(--text-secondary)' }}>
                              <Inbox size={32} style={{ marginBottom: '8px', opacity: 0.6 }} />
                              <div>No leads in database. Click <strong>"+ Add Lead"</strong> or <strong>"Import CSV"</strong> to create leads.</div>
                            </td>
                          </tr>
                        ) : (
                          filteredLeads.map(l => {
                            const temp = getLeadTemperature(l);
                            return (
                              <tr key={l.id}>
                                <td style={{ textAlign: 'center' }}>
                                  <input 
                                    type="checkbox" 
                                    checked={selectedLeadIds.includes(l.id)} 
                                    onChange={() => handleToggleSelectLead(l.id)} 
                                  />
                                </td>
                                <td>
                                  <div 
                                    style={{ display: 'flex', flexDirection: 'column', cursor: 'pointer' }}
                                    onClick={() => setSelectedLeadForDrawer(l)}
                                  >
                                    <span style={{ fontWeight: 600, color: 'var(--accent-color)' }}>{l.name}</span>
                                    <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>{l.email}</span>
                                  </div>
                                </td>
                                <td>
                                  <span className={`lead-temp-badge ${temp.label.toLowerCase()}`} title={`Calculated Score: ${temp.score}/100`}>
                                    {temp.icon} {temp.label} ({temp.score})
                                  </span>
                                </td>
                                <td>
                                  <span className={`tag-badge ${getTagClass(l.tag)}`}>
                                    {l.tag || 'Standard'}
                                  </span>
                                </td>
                                <td>
                                  <div style={{ display: 'flex', alignItems: 'center', gap: '2px', color: '#f59e0b', fontSize: '13px' }}>
                                    {'★'.repeat(l.rating || 5)}{'☆'.repeat(5 - (l.rating || 5))}
                                  </div>
                                </td>
                                <td>
                                  <div style={{ display: 'flex', gap: '6px' }}>
                                    <a 
                                      href={getWhatsAppUrl(l.phone, l.name, l.value)} 
                                      target="_blank" 
                                      rel="noreferrer"
                                      className="action-btn-pill whatsapp-pill"
                                      title="Open WhatsApp Chat"
                                    >
                                      <MessageCircle size={12} /> WhatsApp
                                    </a>
                                    <a 
                                      href={getEmailUrl(l.email, l.name, l.value)} 
                                      className="action-btn-pill email-pill"
                                      title="Draft Email"
                                    >
                                      <Mail size={12} /> Email
                                    </a>
                                  </div>
                                </td>
                                <td><span style={{ fontSize: '13px', fontWeight: 500 }}>{l.assignedRep || 'Admin'}</span></td>
                                <td style={{ fontWeight: 600 }}>{currencySymbol}{l.value.toLocaleString()}</td>
                                <td>
                                  <select 
                                    className="form-control"
                                    style={{ padding: '4px 8px', fontSize: '12px', width: '125px' }}
                                    value={l.status}
                                    onChange={(e) => handleUpdateLeadStatus(l.id, e.target.value as any)}
                                  >
                                    <option value="New">New</option>
                                    <option value="Contacted">Contacted</option>
                                    <option value="Qualified">Qualified</option>
                                    <option value="Lost">Lost</option>
                                  </select>
                                </td>
                                <td>
                                  <div className="table-actions-cell">
                                    <button className="table-action-btn" onClick={() => setSelectedLeadForDrawer(l)} title="View Drawer"><Eye size={14} /></button>
                                    <button className="table-action-btn" onClick={() => openEditLeadModal(l)} title="Edit Lead"><Edit2 size={14} /></button>
                                    <button className="table-action-btn danger-hover" onClick={() => handleDeleteLead(l.id)} title="Delete Lead"><Trash2 size={14} /></button>
                                  </div>
                                </td>
                              </tr>
                            );
                          })
                        )}
                      </tbody>
                    </table>
                  </div>

                </div>
              )}

              {/* Subtab: Deals */}
              {dashboardTab === 'deals' && (
                <div className="table-card">
                  <div className="table-header-bar">
                    <div>
                      <h3 className="table-title">Active Deals Pipeline</h3>
                      <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Manage contract values and stages</span>
                    </div>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button 
                        className="btn btn-secondary" 
                        style={{ padding: '6px 12px', fontSize: '12px' }}
                        onClick={() => downloadRealCSV('deals')}
                      >
                        <Download size={13} /> Export Deals CSV
                      </button>
                      <button 
                        className="btn btn-primary" 
                        style={{ padding: '6px 14px', fontSize: '13px' }}
                        onClick={openAddDealModal}
                      >
                        <Plus size={14} /> Add Deal
                      </button>
                    </div>
                  </div>

                  <div style={{ padding: '16px 24px 0 24px' }}>
                    <div className="toolbar-row">
                      <div className="search-box-wrapper">
                        <Search size={15} className="search-icon-inside" />
                        <input 
                          type="text" 
                          className="search-input-field" 
                          placeholder="Search deals..."
                          value={dealSearch}
                          onChange={(e) => setDealSearch(e.target.value)}
                        />
                      </div>
                      
                      <div className="filter-actions-group">
                        <select className="filter-dropdown" value={dealStageFilter} onChange={(e) => setDealStageFilter(e.target.value)}>
                          <option value="ALL">All Deal Stages</option>
                          <option value="Proposal">Proposal</option>
                          <option value="Negotiation">Negotiation</option>
                          <option value="Closed">Closed</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  <div className="table-wrapper">
                    <table className="data-table">
                      <thead>
                        <tr>
                          <th>Deal Reference</th>
                          <th>Tag</th>
                          <th>Contract Value</th>
                          <th>Pipeline Stage</th>
                          <th>Probability</th>
                          <th>Target Date</th>
                          <th>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredDeals.length === 0 ? (
                          <tr>
                            <td colSpan={7} style={{ textAlign: 'center', padding: '40px', color: 'var(--text-secondary)' }}>
                              <Inbox size={32} style={{ marginBottom: '8px', opacity: 0.6 }} />
                              <div>No deals created yet. Click <strong>"+ Add Deal"</strong> to create a deal.</div>
                            </td>
                          </tr>
                        ) : (
                          filteredDeals.map(d => (
                            <tr key={d.id}>
                              <td style={{ fontWeight: 600 }}>{d.name}</td>
                              <td><span className={`tag-badge ${getTagClass(d.tag)}`}>{d.tag || 'Standard'}</span></td>
                              <td style={{ fontWeight: 600 }}>{currencySymbol}{d.value.toLocaleString()}</td>
                              <td><span className={`status-pill ${d.stage.toLowerCase()}`}>{d.stage}</span></td>
                              <td>{d.probability}%</td>
                              <td>{d.closeDate || '2026-09-30'}</td>
                              <td>
                                <div className="table-actions-cell">
                                  <button 
                                    className="btn btn-secondary" 
                                    style={{ padding: '4px 8px', fontSize: '11px' }}
                                    onClick={() => handleToggleDealClosed(d.id)}
                                  >
                                    {d.stage === 'Closed' ? 'Re-open' : 'Mark Closed'}
                                  </button>
                                  <button className="table-action-btn" onClick={() => openEditDealModal(d)} title="Edit Deal"><Edit2 size={14} /></button>
                                  <button className="table-action-btn danger-hover" onClick={() => handleDeleteDeal(d.id)} title="Delete Deal"><Trash2 size={14} /></button>
                                </div>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* VIEW 2: KANBAN PIPELINE BOARD */}
          {activeView === 'kanban' && (
            <div>
              <div className="view-header-row">
                <div>
                  <h1 className="view-title">{t.kanban}</h1>
                  <p className="view-subtitle">Drag and drop leads & opportunities between progression stages</p>
                </div>
                <button className="btn btn-primary" onClick={openAddLeadModal}>
                  <Plus size={16} />
                  <span>{t.addLead}</span>
                </button>
              </div>

              <div className="kanban-board">
                {(['New', 'Contacted', 'Qualified', 'Lost'] as const).map(stage => {
                  const stageLeads = leads.filter(l => l.status === stage);
                  const stageTotalVal = stageLeads.reduce((s, l) => s + l.value, 0);

                  return (
                    <div 
                      key={stage} 
                      className={`kanban-column ${dragOverCol === stage ? 'drag-over' : ''}`}
                      onDragOver={(e) => handleDragOver(e, stage)}
                      onDrop={(e) => handleDrop(e, stage)}
                    >
                      <div className="kanban-col-header">
                        <div className="kanban-col-title">
                          <span>{stage}</span>
                          <span className="kanban-col-count">{stageLeads.length}</span>
                        </div>
                        <span className="kanban-col-total">{currencySymbol}{stageTotalVal.toLocaleString()}</span>
                      </div>

                      <div className="kanban-card-list">
                        {stageLeads.length === 0 ? (
                          <div style={{ textAlign: 'center', padding: '32px 16px', color: 'var(--text-secondary)', fontSize: '12px' }}>
                            Drag leads here
                          </div>
                        ) : (
                          stageLeads.map(l => (
                            <div 
                              key={l.id} 
                              className="kanban-card"
                              draggable
                              onDragStart={() => handleDragStart(l.id)}
                            >
                              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                <span className="kanban-card-title">{l.name}</span>
                                <span className={`tag-badge ${getTagClass(l.tag)}`}>{l.tag || l.source}</span>
                              </div>

                              <span className="kanban-card-val">{currencySymbol}{l.value.toLocaleString()}</span>

                              <div style={{ display: 'flex', gap: '6px', margin: '4px 0' }}>
                                <a href={getWhatsAppUrl(l.phone, l.name, l.value)} target="_blank" rel="noreferrer" className="action-btn-pill whatsapp-pill">
                                  <MessageCircle size={11} /> WhatsApp
                                </a>
                                <a href={getEmailUrl(l.email, l.name, l.value)} className="action-btn-pill email-pill">
                                  <Mail size={11} /> Email
                                </a>
                              </div>

                              <div className="kanban-card-footer">
                                <span>{l.assignedRep || 'Admin'}</span>
                                <div style={{ display: 'flex', gap: '6px' }}>
                                  <button style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)' }} onClick={() => setSelectedLeadForDrawer(l)}><Eye size={13} /></button>
                                  <button style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)' }} onClick={() => openEditLeadModal(l)}><Edit2 size={13} /></button>
                                </div>
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* VIEW 3: CALENDAR & TASKS (With Google Calendar & .ICS Sync) */}
          {activeView === 'calendar' && (
            <div>
              <div className="view-header-row">
                <div>
                  <h1 className="view-title">{t.calendar}</h1>
                  <p className="view-subtitle">Organize client discovery calls, demo tasks, and sync with Google / Apple Calendar</p>
                </div>
                <div style={{ display: 'flex', gap: '8px' }}>
                  {tasks.some(t => t.completed) && (
                    <button 
                      className="btn btn-secondary" 
                      style={{ color: '#ef4444', borderColor: 'rgba(239, 68, 68, 0.4)' }}
                      onClick={handleClearCompletedTasks}
                      title="Remove all completed tasks"
                    >
                      <Trash2 size={15} />
                      <span>Clear Completed ({tasks.filter(t => t.completed).length})</span>
                    </button>
                  )}
                  <button className="btn btn-primary" onClick={() => setShowTaskModal(true)}>
                    <Plus size={16} />
                    <span>Schedule Task</span>
                  </button>
                </div>
              </div>

              <div className="tasks-container-grid">
                {/* Task List */}
                <div className="table-card" style={{ padding: '24px' }}>
                  <h3 className="settings-title" style={{ marginBottom: '16px' }}>Pending Tasks & Follow-ups ({tasks.filter(t => !t.completed).length})</h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    {tasks.length === 0 ? (
                      <div style={{ textAlign: 'center', padding: '32px', color: 'var(--text-secondary)' }}>
                        <Inbox size={32} style={{ marginBottom: '8px', opacity: 0.6 }} />
                        <div>No tasks scheduled. Click "+ Schedule Task" to add your first reminder.</div>
                      </div>
                    ) : (
                      tasks.map(t => (
                        <div key={t.id} className={`task-item-card ${t.completed ? 'completed' : ''}`}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <input 
                              type="checkbox" 
                              checked={t.completed} 
                              onChange={() => handleToggleTask(t.id)}
                              style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                            />
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                              <span className="task-title-text" style={{ fontWeight: 600, fontSize: '14px' }}>{t.title}</span>
                              <div style={{ display: 'flex', gap: '10px', fontSize: '12px', color: 'var(--text-secondary)' }}>
                                <span>Due: {t.dueDate}</span>
                                <span>•</span>
                                <span>Assignee: {t.assignedTo}</span>
                              </div>
                            </div>
                          </div>

                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            {/* 1-Click Google Calendar Sync */}
                            <a 
                              href={getGoogleCalendarUrl(t)} 
                              target="_blank" 
                              rel="noreferrer" 
                              className="cal-sync-pill"
                              title="Add event to Google Calendar"
                            >
                              <CalendarIcon size={12} /> Google Cal
                            </a>

                            {/* 1-Click .ICS Download */}
                            <button 
                              className="cal-sync-pill"
                              onClick={() => downloadICSFile(t)}
                              title="Download .ICS invite for Outlook/Apple Calendar"
                            >
                              <Download size={12} /> .ICS
                            </button>

                            <span className={`priority-badge priority-${t.priority.toLowerCase()}`}>
                              {t.priority}
                            </span>
                            <button 
                              className="table-action-btn danger-hover" 
                              onClick={() => handleDeleteTask(t.id)}
                              title="Delete Task"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                {/* Calendar Schedule Card */}
                <div className="settings-card">
                  <h3 className="settings-title">Upcoming Schedule</h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                    {tasks.filter(t => !t.completed).slice(0, 3).map(task => (
                      <div key={task.id} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px', background: 'var(--bg-base)', borderRadius: '8px' }}>
                        <Clock size={20} style={{ color: 'var(--info)' }} />
                        <div>
                          <div style={{ fontWeight: 600, fontSize: '13px' }}>{task.title}</div>
                          <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>Due: {task.dueDate} ({task.assignedTo})</div>
                        </div>
                      </div>
                    ))}
                    {tasks.filter(t => !t.completed).length === 0 && (
                      <div style={{ textAlign: 'center', padding: '24px', color: 'var(--text-secondary)', fontSize: '13px' }}>
                        No upcoming meetings or events scheduled.
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* VIEW 4: INVOICES & QUOTES (With E-Signature & Stamp) */}
          {activeView === 'invoices' && (
            <div>
              <div className="view-header-row">
                <div>
                  <h1 className="view-title">{activePortal === 'client' ? 'My Invoices & Payment Slip' : t.invoices}</h1>
                  <p className="view-subtitle">{activePortal === 'client' ? 'View verified corporate bills, check milestone deliverables, and scan UPI QR to pay' : 'Generate client bills, verify with digital signature stamp, and print invoice'}</p>
                </div>
                <button className="btn btn-primary" onClick={() => {
                  addAuditLog("Invoice Printed", `Generated signed invoice for ${invoiceClientName} (${currencySymbol}${invoiceGrandTotal.toLocaleString()})`, 'invoice');
                  window.print();
                }}>
                  <Printer size={16} />
                  <span>Print Signed PDF</span>
                </button>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: activePortal === 'client' ? '1fr' : '1fr 1.6fr', gap: '24px' }}>
                {/* Configuration form (Admin & Manager Only) */}
                {activePortal !== 'client' && (
                  <div className="settings-card">
                    <h3 className="settings-title">Configure Invoice Items & Stamp</h3>
                    <div className="form-group">
                      <label>Client / Lead Company</label>
                      <input 
                        type="text" 
                        className="form-control"
                        value={invoiceClientName}
                        onChange={(e) => setInvoiceClientName(e.target.value)}
                      />
                    </div>

                    <div className="form-group">
                      <label>Product / Service Line Item</label>
                      <input 
                        type="text" 
                        className="form-control"
                        value={invoiceItemName}
                        onChange={(e) => setInvoiceItemName(e.target.value)}
                      />
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                      <div className="form-group">
                        <label>Base Price ({currencySymbol})</label>
                        <input 
                          type="number" 
                          className="form-control"
                          value={invoiceItemAmount}
                          onChange={(e) => setInvoiceItemAmount(Number(e.target.value))}
                        />
                      </div>
                      <div className="form-group">
                        <label>Discount ({currencySymbol})</label>
                        <input 
                          type="number" 
                          className="form-control"
                          value={invoiceDiscount}
                          onChange={(e) => setInvoiceDiscount(Number(e.target.value))}
                        />
                      </div>
                    </div>

                    <div className="form-group">
                      <label>Tax Rate (% GST / VAT)</label>
                      <input 
                        type="number" 
                        className="form-control"
                        value={invoiceTaxRate}
                        onChange={(e) => setInvoiceTaxRate(Number(e.target.value))}
                      />
                    </div>

                    <div className="form-group">
                      <label>Authorized Signatory Name</label>
                      <input 
                        type="text" 
                        className="form-control"
                        value={invoiceSignatoryName}
                        onChange={(e) => setInvoiceSignatoryName(e.target.value)}
                      />
                    </div>

                    <div className="settings-checkbox-group" style={{ marginBottom: '14px' }}>
                      <div className="settings-checkbox-info">
                        <span className="settings-checkbox-title">Include Official Company Stamp</span>
                        <span className="settings-checkbox-desc">Render verified corporate seal or uploaded custom stamp</span>
                      </div>
                      <label className="switch">
                        <input 
                          type="checkbox" 
                          checked={includeStamp}
                          onChange={(e) => setIncludeStamp(e.target.checked)}
                        />
                        <span className="slider"></span>
                      </label>
                    </div>

                    {/* Custom Stamp Upload Control */}
                    <div className="form-group" style={{ marginBottom: '16px' }}>
                      <label>Official Stamp Image (Custom Seal / Logo)</label>
                      <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                        <button 
                          type="button" 
                          className="btn btn-secondary"
                          style={{ fontSize: '12px', padding: '6px 12px' }}
                          onClick={() => stampFileInputRef.current?.click()}
                        >
                          <UploadCloud size={14} /> Upload Custom Stamp (PNG / JPG)
                        </button>
                        {customStampImage && (
                          <button 
                            type="button" 
                            className="btn btn-secondary"
                            style={{ fontSize: '12px', padding: '6px 10px', color: 'var(--danger)' }}
                            onClick={() => {
                              setCustomStampImage(null);
                              triggerToast("Reset to default seal.");
                            }}
                          >
                            <Trash2 size={13} /> Reset
                          </button>
                        )}
                      </div>

                      {customStampImage && (
                        <div className="stamp-preview-thumb-box">
                          <img src={customStampImage} alt="Custom Stamp Preview" style={{ width: '45px', height: '45px', objectFit: 'contain' }} />
                          <span style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>Custom official seal active and visible on invoices</span>
                        </div>
                      )}
                    </div>

                    {/* Milestone Payment Splitter Toggle */}
                    <div className="settings-checkbox-group" style={{ marginBottom: '14px' }}>
                      <div className="settings-checkbox-info">
                        <span className="settings-checkbox-title">Milestone Payment Splitter</span>
                        <span className="settings-checkbox-desc">50% Advance / 30% WIP / 20% Sign-off terms</span>
                      </div>
                      <label className="switch">
                        <input 
                          type="checkbox" 
                          checked={includeMilestones}
                          onChange={(e) => setIncludeMilestones(e.target.checked)}
                        />
                        <span className="slider"></span>
                      </label>
                    </div>

                    {/* Dynamic UPI Payment QR Code Toggle */}
                    <div className="settings-checkbox-group" style={{ marginBottom: '14px' }}>
                      <div className="settings-checkbox-info">
                        <span className="settings-checkbox-title">Include Dynamic UPI QR Code</span>
                        <span className="settings-checkbox-desc">Instant scan & pay via PhonePe / GPay / Paytm</span>
                      </div>
                      <label className="switch">
                        <input 
                          type="checkbox" 
                          checked={includeUpiQr}
                          onChange={(e) => setIncludeUpiQr(e.target.checked)}
                        />
                        <span className="slider"></span>
                      </label>
                    </div>

                    {includeUpiQr && (
                      <div className="form-group" style={{ marginBottom: '14px' }}>
                        <label>Receiving UPI ID (VPA)</label>
                        <input 
                          type="text" 
                          className="form-control"
                          placeholder="e.g. yourcompany@okaxis or 9876543210@paytm"
                          value={invoiceUpiId}
                          onChange={(e) => setInvoiceUpiId(e.target.value)}
                        />
                      </div>
                    )}

                    <div className="form-group" style={{ marginBottom: 0 }}>
                      <label>Terms & Conditions Disclaimer</label>
                      <textarea 
                        className="form-control"
                        rows={2}
                        value={invoiceTerms}
                        onChange={(e) => setInvoiceTerms(e.target.value)}
                      />
                    </div>
                  </div>
                )}

                {/* Live Invoice Preview Sheet */}
                <div className="invoice-container">
                  <div className="invoice-header-row">
                    <div>
                      <h2 style={{ fontSize: '22px', fontWeight: 800 }}>{settings.companyName}</h2>
                      <p style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Enterprise Sales & CRM Solutions</p>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <span style={{ fontSize: '18px', fontWeight: 700, color: 'var(--accent-color)' }}>INVOICE</span>
                      <p style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>INV-{Date.now().toString().slice(-6)}</p>
                      <p style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Date: {new Date().toISOString().split('T')[0]}</p>
                    </div>
                  </div>

                  <div style={{ marginBottom: '20px' }}>
                    <span style={{ fontSize: '12px', color: 'var(--text-secondary)', textTransform: 'uppercase', fontWeight: 600 }}>Billed To:</span>
                    <h3 style={{ fontSize: '16px', fontWeight: 700 }}>{invoiceClientName}</h3>
                    <p style={{ fontSize: '13px' }}>Verified Corporate Account</p>
                  </div>

                  <table className="invoice-table">
                    <thead>
                      <tr>
                        <th>Item Description</th>
                        <th>Qty</th>
                        <th>Rate</th>
                        <th style={{ textAlign: 'right' }}>Amount</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td style={{ fontWeight: 600 }}>{invoiceItemName}</td>
                        <td>1</td>
                        <td>{currencySymbol}{invoiceItemAmount.toLocaleString()}</td>
                        <td style={{ textAlign: 'right', fontWeight: 600 }}>{currencySymbol}{invoiceItemAmount.toLocaleString()}</td>
                      </tr>
                    </tbody>
                  </table>

                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '6px', fontSize: '13px' }}>
                    <div><span>Subtotal: </span><strong>{currencySymbol}{invoiceSubtotal.toLocaleString()}</strong></div>
                    <div><span>Discount Applied: </span><strong style={{ color: 'var(--danger)' }}>-{currencySymbol}{invoiceDiscount.toLocaleString()}</strong></div>
                    <div><span>Tax / GST ({invoiceTaxRate}%): </span><strong>+{currencySymbol}{invoiceTaxAmount.toLocaleString()}</strong></div>
                    <div className="invoice-total-row">
                      <span>Total Amount Payable:</span>
                      <span style={{ color: 'var(--accent-color)', fontSize: '18px' }}>{currencySymbol}{invoiceGrandTotal.toLocaleString()}</span>
                    </div>
                  </div>

                  {/* Multi-Stage Milestone Schedule Breakdown */}
                  {includeMilestones && (
                    <div className="milestone-schedule-card">
                      <strong style={{ fontSize: '12px', display: 'block', marginBottom: '6px', color: 'var(--accent-color)' }}>
                        📑 Contract Milestone Payment Schedule:
                      </strong>
                      <div className="milestone-item-row">
                        <span>1. Stage 1: Advance Booking / Project Kickoff (50%)</span>
                        <strong>{currencySymbol}{Math.round(invoiceGrandTotal * 0.50).toLocaleString()}</strong>
                      </div>
                      <div className="milestone-item-row">
                        <span>2. Stage 2: Milestone Review & Alpha Deployment (30%)</span>
                        <strong>{currencySymbol}{Math.round(invoiceGrandTotal * 0.30).toLocaleString()}</strong>
                      </div>
                      <div className="milestone-item-row">
                        <span>3. Stage 3: Final Acceptance & Handover Sign-off (20%)</span>
                        <strong>{currencySymbol}{Math.round(invoiceGrandTotal * 0.20).toLocaleString()}</strong>
                      </div>
                    </div>
                  )}

                  {/* Instant UPI Scan & Pay QR Code Card */}
                  {includeUpiQr && (
                    <div className="invoice-upi-qr-card">
                      <img 
                        src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(`upi://pay?pa=${invoiceUpiId || 'billing@upi'}&pn=${encodeURIComponent(settings.companyName)}&am=${invoiceGrandTotal}&cu=INR&tn=Invoice-${Date.now().toString().slice(-6)}`)}`} 
                        alt="UPI Payment QR Code" 
                        className="invoice-upi-qr-img" 
                      />
                      <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <QrCode size={16} style={{ color: '#10b981' }} />
                          <strong style={{ fontSize: '13px' }}>Instant UPI Scan & Pay</strong>
                        </div>
                        <p style={{ fontSize: '11px', color: 'var(--text-secondary)', margin: '4px 0' }}>
                          Scan via PhonePe, Google Pay, Paytm, or BHIM to pay <strong>{currencySymbol}{invoiceGrandTotal.toLocaleString()}</strong> instantly.
                        </p>
                        <span style={{ fontSize: '11px', background: 'var(--bg-card)', padding: '2px 6px', borderRadius: '4px', border: '1px solid var(--border-color)', fontFamily: 'monospace' }}>
                          UPI ID: {invoiceUpiId || 'billing@upi'}
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Terms & Conditions */}
                  <div style={{ marginTop: '20px', fontSize: '11px', color: 'var(--text-secondary)', borderTop: '1px solid var(--border-color)', paddingTop: '10px' }}>
                    <strong>Terms & Conditions:</strong>
                    <p style={{ margin: '4px 0 0 0' }}>{invoiceTerms}</p>
                  </div>



                  {/* Digital Signature & Stamp Box */}
                  <div className="invoice-signature-box">
                    <div>
                      {includeStamp && (
                        customStampImage ? (
                          <img src={customStampImage} alt="Official Company Stamp" className="invoice-custom-stamp-img" />
                        ) : (
                          <div className="invoice-stamp-seal">
                            <span>★ {settings.companyName} ★</span>
                            <span style={{ fontSize: '8px' }}>VERIFIED SEAL</span>
                          </div>
                        )
                      )}
                    </div>

                    <div className="invoice-signatory-line">
                      <div className="signature-cursive">{invoiceSignatoryName}</div>
                      <div style={{ width: '180px', height: '1px', backgroundColor: 'var(--text-primary)', marginBottom: '4px' }}></div>
                      <span style={{ fontSize: '11px', fontWeight: 600 }}>{invoiceSignatoryName}</span>
                      <span style={{ fontSize: '10px', color: 'var(--text-secondary)' }}>Authorized Signature</span>
                    </div>
                  </div>

                </div>
              </div>
            </div>
          )}

          {/* VIEW 9: CAMPAIGNS & BROADCAST MANAGER */}
          {activeView === 'campaigns' && hasPermission('manage_campaigns') && (
            <div>
              <div className="view-header-row">
                <div>
                  <h1 className="view-title">{t.campaigns}</h1>
                  <p className="view-subtitle">Send bulk WhatsApp & Email announcements with smart variable tags</p>
                </div>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button 
                    className="btn btn-secondary"
                    onClick={() => downloadRealCSV('leads')}
                  >
                    <Download size={15} /> Export Audience CSV
                  </button>
                  <button 
                    className="btn btn-primary"
                    onClick={handleLaunchBroadcast}
                  >
                    <Radio size={15} /> Launch Broadcast
                  </button>
                </div>
              </div>

              <div className="campaign-layout-grid">
                {/* Broadcast Composer */}
                <div className="settings-card">
                  <h3 className="settings-title">Compose Batch Broadcast</h3>
                  
                  {/* Channel Selector */}
                  <div className="form-group">
                    <label>Broadcast Channel</label>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                      <button 
                        type="button"
                        className={`btn ${campaignChannel === 'WhatsApp' ? 'btn-primary' : 'btn-secondary'}`}
                        style={{ justifyContent: 'center', fontSize: '13px' }}
                        onClick={() => setCampaignChannel('WhatsApp')}
                      >
                        <MessageCircle size={14} /> WhatsApp Broadcast
                      </button>
                      <button 
                        type="button"
                        className={`btn ${campaignChannel === 'Email' ? 'btn-primary' : 'btn-secondary'}`}
                        style={{ justifyContent: 'center', fontSize: '13px' }}
                        onClick={() => setCampaignChannel('Email')}
                      >
                        <Mail size={14} /> Email Newsletter
                      </button>
                    </div>
                  </div>

                  {/* Target Audience Selector */}
                  <div className="form-group">
                    <label>Target Audience Segment ({targetAudienceLeads.length} recipients selected)</label>
                    <div className="audience-pill-selector">
                      <button className={`audience-chip ${campaignAudience === 'ALL' ? 'active' : ''}`} onClick={() => setCampaignAudience('ALL')}>
                        All Leads ({leads.length})
                      </button>
                      <button className={`audience-chip ${campaignAudience === 'QUALIFIED' ? 'active' : ''}`} onClick={() => setCampaignAudience('QUALIFIED')}>
                        Qualified ({leads.filter(l => l.status === 'Qualified').length})
                      </button>
                      <button className={`audience-chip ${campaignAudience === 'VIP' ? 'active' : ''}`} onClick={() => setCampaignAudience('VIP')}>
                        VIP Clients ({leads.filter(l => l.tag === 'VIP Client').length})
                      </button>
                      <button className={`audience-chip ${campaignAudience === 'NEW' ? 'active' : ''}`} onClick={() => setCampaignAudience('NEW')}>
                        New Prospects ({leads.filter(l => l.status === 'New').length})
                      </button>
                    </div>
                  </div>

                  {/* Subject Line */}
                  <div className="form-group">
                    <label>Broadcast Subject / Campaign Title</label>
                    <input 
                      type="text" 
                      className="form-control" 
                      value={campaignSubject}
                      onChange={(e) => setCampaignSubject(e.target.value)}
                    />
                  </div>

                  {/* Message Body */}
                  <div className="form-group">
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                      <label style={{ marginBottom: 0 }}>Message Template Body</label>
                      <span style={{ fontSize: '11px', color: 'var(--accent-color)' }}>Smart tags supported: {'{name}, {company}, {rep}, {company_name}'}</span>
                    </div>
                    <textarea 
                      className="form-control"
                      rows={5}
                      value={campaignBody}
                      onChange={(e) => setCampaignBody(e.target.value)}
                      style={{ resize: 'vertical' }}
                    />
                  </div>
                </div>

                {/* Broadcast Live Preview Box */}
                <div className="broadcast-preview-box">
                  <h3 className="settings-title">Live Message Preview</h3>
                  
                  <div className="broadcast-meta-header">
                    <div>
                      <span style={{ fontSize: '11px', color: 'var(--text-secondary)', display: 'block' }}>AUDIENCE</span>
                      <strong style={{ fontSize: '13px' }}>{campaignAudience} Segment ({targetAudienceLeads.length} Leads)</strong>
                    </div>
                    <span className="status-pill active">{campaignChannel} Delivery</span>
                  </div>

                  <div className="broadcast-content-render">
                    <div style={{ fontWeight: 700, marginBottom: '8px', color: 'var(--accent-color)' }}>
                      Subject: {campaignSubject}
                    </div>
                    <div>
                      {campaignBody
                        .replace('{name}', targetAudienceLeads[0]?.name || 'John Doe')
                        .replace('{company}', targetAudienceLeads[0]?.name || 'Acme Corp')
                        .replace('{rep}', currentUserContext.name)
                        .replace('{company_name}', settings.companyName)}
                    </div>
                  </div>

                  {/* Recent Broadcast History */}
                  <div style={{ marginTop: '10px' }}>
                    <span style={{ fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-secondary)' }}>Recent Broadcasts</span>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '8px' }}>
                      {campaignHistory.map(item => (
                        <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 12px', background: 'var(--bg-base)', borderRadius: '6px', fontSize: '12px' }}>
                          <div>
                            <span style={{ fontWeight: 600 }}>{item.title}</span>
                            <span style={{ fontSize: '11px', color: 'var(--text-secondary)', display: 'block' }}>{item.channel} • {item.audience} ({item.recipientsCount} leads)</span>
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <span className="status-pill active">{item.status}</span>
                            <button 
                              className="table-action-btn danger-hover" 
                              onClick={() => handleDeleteCampaign(item.id)}
                              title="Delete Campaign History"
                            >
                              <Trash2 size={13} />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* VIEW 5: USER MANAGEMENT */}
          {activeView === 'users' && hasPermission('manage_users') && (
            <div>
              <div className="view-header-row">
                <div>
                  <h1 className="view-title">{t.users}</h1>
                  <p className="view-subtitle">Add team members, customize roles, and edit credentials in real-time</p>
                </div>
                <button 
                  className="btn btn-primary"
                  onClick={() => {
                    setEditingUser(null);
                    setNewUserName('');
                    setNewUserEmail('');
                    setNewUserRole('Sales Rep');
                    setNewUserStatus('Active');
                    setNewUserPhotoUrl('');
                    setShowUserModal(true);
                  }}
                >
                  <Plus size={16} />
                  <span>Add Team Member</span>
                </button>
              </div>

              <div className="table-card">
                <div style={{ padding: '16px 24px 0 24px' }}>
                  <div className="toolbar-row">
                    <div className="search-box-wrapper">
                      <Search size={15} className="search-icon-inside" />
                      <input 
                        type="text" 
                        className="search-input-field" 
                        placeholder="Search users by name or email..."
                        value={userSearch}
                        onChange={(e) => setUserSearch(e.target.value)}
                      />
                    </div>
                    
                    <div className="filter-actions-group">
                      <select className="filter-dropdown" value={userRoleFilter} onChange={(e) => setUserRoleFilter(e.target.value)}>
                        <option value="ALL">All Roles</option>
                        <option value="Super Admin">Super Admin</option>
                        <option value="Admin">Admin</option>
                        <option value="Sales Manager">Sales Manager</option>
                        <option value="Sales Rep">Sales Rep</option>
                        <option value="Support Agent">Support Agent</option>
                        <option value="Client">Client</option>
                      </select>
                    </div>
                  </div>
                </div>

                <div className="table-wrapper">
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>Team Member</th>
                        <th>Email Address</th>
                        <th>Role Permission</th>
                        <th>Status</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredUsers.map(u => (
                        <tr key={u.id}>
                          <td>
                            <div className="avatar-cell">
                              {u.photoUrl ? (
                                <img src={u.photoUrl} alt={u.name} style={{ width: '32px', height: '32px', borderRadius: '50%', objectFit: 'cover' }} />
                              ) : (
                                <div className="avatar-badge">{u.avatar}</div>
                              )}
                              <span style={{ fontWeight: 600 }}>{u.name}</span>
                            </div>

                          </td>
                          <td>{u.email}</td>
                          <td><span className="trend-pill" style={{ background: 'var(--bg-base)', border: '1px solid var(--border-color)' }}>{u.role}</span></td>
                          <td>
                            <button 
                              className={`status-pill ${u.status.toLowerCase()}`}
                              style={{ border: 'none', cursor: 'pointer' }}
                              onClick={() => toggleUserStatus(u.id)}
                            >
                              {u.status}
                            </button>
                          </td>
                          <td>
                            <div className="table-actions-cell">
                              {(activePortal === 'super_admin' || activePortal === 'admin' || (activePortal === 'manager' && u.role === 'Sales Rep')) ? (
                                <>
                                  <button className="table-action-btn" title="Edit User" onClick={() => {
                                    setEditingUser(u);
                                    setNewUserName(u.name);
                                    setNewUserEmail(u.email);
                                    setNewUserRole(u.role);
                                    setNewUserStatus(u.status);
                                    setNewUserPhotoUrl(u.photoUrl || '');
                                    setShowUserModal(true);
                                  }}><Edit2 size={14} /></button>
                                  {u.role !== 'Super Admin' && (
                                    <button className="table-action-btn danger-hover" title="Delete User" onClick={() => handleDeleteUser(u.id)}><Trash2 size={14} /></button>
                                  )}
                                </>
                              ) : (
                                <span style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>Protected</span>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* VIEW 6: ROLE MANAGEMENT */}
          {activeView === 'roles' && hasPermission('manage_users') && (
            <div>
              <div className="view-header-row">
                <div>
                  <h1 className="view-title">{t.roles}</h1>
                  <p className="view-subtitle">Toggle checkable permissions live across CRM roles</p>
                </div>
              </div>

              <div className="role-grid">
                {[
                  { key: 'Super Admin', name: '👑 Super Administrator', desc: 'Master architecture, disaster DB recovery & security PIN' },
                  { key: 'Admin', name: '🏢 Operations Admin', desc: 'Staff accounts, custom fields & marketing campaigns' },
                  { key: 'Manager', name: '👔 Sales Manager', desc: 'Team targets, podium rankings & conversion reports' },
                  { key: 'Rep', name: '💼 Sales Representative', desc: 'Kanban pipeline, voice dictation & GPS geo-stamp' },
                  { key: 'Support', name: '🎧 Support Agent', desc: 'Ticket queues, SLA timers & issue resolution' },
                  { key: 'Client', name: '🤝 Customer / Client', desc: 'Milestone tracking, UPI scan-to-pay & ticket creation' }
                ].map(r => (
                  <div key={r.key} className="role-card">
                    <div className="role-header">
                      <h3 className="role-name">{r.name}</h3>
                      <p className="role-desc">{r.desc}</p>
                    </div>
                    <div className="permission-list">
                      {['view_dashboard', 'manage_users', 'manage_roles', 'manage_settings', 'view_reports', 'create_leads', 'edit_leads', 'delete_leads', 'manage_deals', 'manage_tasks', 'manage_campaigns', 'manage_tickets', 'system_recovery'].map(perm => (
                        <div className="permission-item" key={perm}>
                          <input 
                            type="checkbox" 
                            checked={permissions[r.key]?.includes(perm)} 
                            onChange={() => handlePermissionChange(r.key, perm)}
                          />
                          <span style={{ textTransform: 'capitalize' }}>{perm.replace('_', ' ')}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* VIEW 7: SYSTEM SETTINGS (With Custom Fields, Master PIN & Backup) */}
          {activeView === 'settings' && hasPermission('manage_users') && (
            <div>
              <div className="view-header-row">
                <div>
                  <h1 className="view-title">{t.settings}</h1>
                  <p className="view-subtitle">Edit company parameters, custom fields, security PIN, and disaster backups</p>
                </div>
              </div>

              <div className="settings-grid">
                {/* Parameters Card */}
                <div className="settings-card">
                  <h3 className="settings-title">General & Security Parameters</h3>
                  <form onSubmit={handleSaveSettings}>
                    <div className="form-group">
                      <label>Company Display Name</label>
                      <input 
                        type="text" 
                        className="form-control" 
                        value={settings.companyName}
                        onChange={(e) => setSettings({ ...settings, companyName: e.target.value })}
                      />
                    </div>

                    <div className="form-group">
                      <label>Revenue Target Goal ({currencySymbol})</label>
                      <input 
                        type="number" 
                        className="form-control" 
                        value={settings.revenueGoal}
                        onChange={(e) => setSettings({ ...settings, revenueGoal: Number(e.target.value) })}
                      />
                    </div>

                    <div className="form-group">
                      <label>Sales Commission & Bonus Rate (%)</label>
                      <input 
                        type="number" 
                        className="form-control" 
                        min={0}
                        max={50}
                        value={settings.commissionRate}
                        onChange={(e) => setSettings({ ...settings, commissionRate: Number(e.target.value) })}
                      />
                    </div>

                    {activePortal === 'super_admin' && (
                      <div className="form-group">
                        <label>Master Security PIN (4 Digits)</label>
                        <input 
                          type="password" 
                          maxLength={4}
                          className="form-control" 
                          value={settings.masterPin}
                          onChange={(e) => setSettings({ ...settings, masterPin: e.target.value })}
                        />
                      </div>
                    )}

                    <div className="form-group">
                      <label>Active Currency</label>
                      <select 
                        className="form-control"
                        value={settings.currency}
                        onChange={(e) => setSettings({ ...settings, currency: e.target.value as any })}
                      >
                        <option value="INR">INR (₹ - Indian Rupee)</option>
                        <option value="USD">USD ($ - US Dollar)</option>
                        <option value="EUR">EUR (€ - Euro)</option>
                      </select>
                    </div>

                    <button type="submit" className="btn btn-primary" style={{ marginTop: '12px' }}>
                      Save Parameters
                    </button>
                  </form>

                  {/* Custom Fields Builder Form */}
                  <div style={{ marginTop: '24px', paddingTop: '16px', borderTop: '1px solid var(--border-color)' }}>
                    <span style={{ fontSize: '13px', fontWeight: 700, display: 'block', marginBottom: '8px' }}>Custom Lead Fields</span>
                    <form onSubmit={handleAddCustomField} style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
                      <input 
                        type="text"
                        className="form-control"
                        placeholder="e.g. GST Number / City"
                        value={newFieldLabel}
                        onChange={(e) => setNewFieldLabel(e.target.value)}
                        style={{ flex: 2 }}
                      />
                      <select 
                        className="form-control"
                        value={newFieldType}
                        onChange={(e) => setNewFieldType(e.target.value as any)}
                        style={{ flex: 1 }}
                      >
                        <option value="text">Text</option>
                        <option value="number">Number</option>
                        <option value="date">Date</option>
                      </select>
                      <button type="submit" className="btn btn-secondary" style={{ whiteSpace: 'nowrap' }}>
                        <Plus size={14} /> Add
                      </button>
                    </form>

                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                      {(settings.customFields || []).map(f => (
                        <div key={f.id} style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: 'var(--bg-base)', border: '1px solid var(--border-color)', padding: '4px 10px', borderRadius: '6px', fontSize: '12px' }}>
                          <span><strong>{f.label}</strong> ({f.type})</span>
                          <button type="button" style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--danger)' }} onClick={() => handleDeleteCustomField(f.id)}>
                            <X size={12} />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Backup & Disaster Recovery Card (Super Admin Only) */}
                {activePortal === 'super_admin' ? (
                  <div className="settings-card">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                      <h3 className="settings-title" style={{ marginBottom: 0 }}>System Backup & Cloud Sync</h3>
                      <Database size={18} style={{ color: 'var(--accent-color)' }} />
                    </div>

                    <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: '16px' }}>
                      Download full JSON database snapshots, sync with Node.js backend, and install PWA application.
                    </p>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                      <div className="backup-card">
                        <span style={{ fontWeight: 600, fontSize: '13px' }}>1. Export Full System Backup</span>
                        <span style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>Save current dataset to a portable .JSON file</span>
                        <button 
                          type="button"
                          className="btn btn-primary"
                          style={{ marginTop: '4px', justifyContent: 'center' }}
                          onClick={handleDownloadFullBackup}
                        >
                          <Download size={14} /> Download System Snapshot (.JSON)
                        </button>
                      </div>

                      <div className="backup-card">
                        <span style={{ fontWeight: 600, fontSize: '13px' }}>2. Restore Database Snapshot</span>
                        <span style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>Upload an existing .JSON backup file to restore records (Requires Master PIN)</span>
                        <button 
                          type="button"
                          className="btn btn-secondary"
                          style={{ marginTop: '4px', justifyContent: 'center' }}
                          onClick={() => backupFileInputRef.current?.click()}
                        >
                          <RefreshCw size={14} /> Upload & Restore Backup (.JSON)
                        </button>
                      </div>

                      <div className="backup-card">
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span style={{ fontWeight: 600, fontSize: '13px' }}>3. Cloud Database Sync (Port {cloudPort})</span>
                          <span className={`status-pill ${cloudStatus === 'connected' ? 'active' : 'inactive'}`}>
                            {cloudStatus === 'connected' ? '🟢 Online' : cloudStatus === 'syncing' ? '🟡 Syncing' : '🔴 Local'}
                          </span>
                        </div>
                        <span style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>Synchronize data with Node.js backend API</span>
                        <button 
                          type="button"
                          className="btn btn-secondary"
                          style={{ marginTop: '4px', justifyContent: 'center' }}
                          onClick={syncToCloudServer}
                        >
                          <Cloud size={14} /> Synchronize Cloud DB
                        </button>
                      </div>

                      <div className="backup-card">
                        <span style={{ fontWeight: 600, fontSize: '13px' }}>4. Offline PWA Desktop App</span>
                        <span style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>Install this CRM as a standalone application on your device</span>
                        <button 
                          type="button"
                          className="btn btn-secondary"
                          style={{ marginTop: '4px', justifyContent: 'center' }}
                          onClick={handleInstallPWA}
                        >
                          <Smartphone size={14} /> Install CRM App
                        </button>
                      </div>
                    </div>

                    <div className="settings-checkbox-group" style={{ marginTop: '20px' }}>
                      <div className="settings-checkbox-info">
                        <span className="settings-checkbox-title">Dark Theme Mode</span>
                        <span className="settings-checkbox-desc">Enable dark visual theme styling</span>
                      </div>
                      <label className="switch">
                        <input 
                          type="checkbox" 
                          checked={darkMode}
                          onChange={(e) => setDarkMode(e.target.checked)}
                        />
                        <span className="slider"></span>
                      </label>
                    </div>
                  </div>
                ) : (
                  <div className="settings-card">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                      <h3 className="settings-title" style={{ marginBottom: 0 }}>Appearance & Preferences</h3>
                      <Sun size={18} style={{ color: 'var(--accent-color)' }} />
                    </div>
                    <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: '16px' }}>
                      Customize your workspace visual experience and install PWA application.
                    </p>
                    <div className="backup-card" style={{ marginBottom: '16px' }}>
                      <span style={{ fontWeight: 600, fontSize: '13px' }}>Offline CRM App</span>
                      <span style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>Install this CRM on your desktop or mobile device</span>
                      <button 
                        type="button"
                        className="btn btn-secondary"
                        style={{ marginTop: '4px', justifyContent: 'center' }}
                        onClick={handleInstallPWA}
                      >
                        <Smartphone size={14} /> Install CRM App
                      </button>
                    </div>
                    <div className="settings-checkbox-group">
                      <div className="settings-checkbox-info">
                        <span className="settings-checkbox-title">Dark Theme Mode</span>
                        <span className="settings-checkbox-desc">Enable dark visual theme styling for this session</span>
                      </div>
                      <label className="switch">
                        <input 
                          type="checkbox" 
                          checked={darkMode}
                          onChange={(e) => setDarkMode(e.target.checked)}
                        />
                        <span className="slider"></span>
                      </label>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* VIEW 8: REPORTS */}
          {activeView === 'reports' && (
            <div>
              <div className="view-header-row">
                <div>
                  <h1 className="view-title">{t.reports}</h1>
                  <p className="view-subtitle">Generate live CRM analytics reports and export</p>
                </div>
              </div>

              <div className="settings-card" style={{ marginBottom: '32px' }}>
                <h3 className="settings-title">Configure Report Engine</h3>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '20px', alignItems: 'flex-end' }}>
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label>Report Type</label>
                    <select className="form-control" value={reportType} onChange={(e) => setReportType(e.target.value as any)}>
                      <option value="revenue">Revenue Trend Analysis</option>
                      <option value="conversion">Lead Channel Conversion Rate</option>
                      <option value="reps">Representative Performance</option>
                    </select>
                  </div>

                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label>Timeframe</label>
                    <select className="form-control" value={reportTimeframe} onChange={(e) => setReportTimeframe(e.target.value as any)}>
                      <option value="q1">Q1 (Jan - Mar)</option>
                      <option value="q2">Q2 (Apr - Jun)</option>
                      <option value="ytd">Year to Date (Jan - Jun)</option>
                    </select>
                  </div>

                  <button className="btn btn-primary" style={{ height: '42px', justifyContent: 'center' }} onClick={handleGenerateReport}>
                    Generate Report Preview
                  </button>
                </div>
              </div>

              {generatedReport && (
                <div className="table-card" style={{ animation: 'fadeIn 0.25s ease-out' }}>
                  <div className="table-header-bar">
                    <h3 className="table-title">Live Report Data Preview</h3>
                    <div style={{ display: 'flex', gap: '10px' }}>
                      <button className="btn btn-secondary" style={{ padding: '6px 12px', fontSize: '12px' }} onClick={() => window.print()}>
                        Print Data
                      </button>
                      <button className="btn btn-secondary" style={{ padding: '6px 12px', fontSize: '12px' }} onClick={() => downloadRealCSV('leads')}>
                        Download CSV
                      </button>
                    </div>
                  </div>

                  <div className="table-wrapper">
                    <table className="data-table">
                      {reportType === 'revenue' && (
                        <>
                          <thead>
                            <tr>
                              <th>Reporting Period</th>
                              <th>Target Limit</th>
                              <th>Actual Earnings</th>
                              <th>Target Attainment</th>
                            </tr>
                          </thead>
                          <tbody>
                            {generatedReport.map((row, idx) => (
                              <tr key={idx}>
                                <td style={{ fontWeight: 600 }}>{row.period}</td>
                                <td>{row.target}</td>
                                <td>{row.actual}</td>
                                <td><span className="status-pill active">{row.achievement}</span></td>
                              </tr>
                            ))}
                          </tbody>
                        </>
                      )}

                      {reportType === 'conversion' && (
                        <>
                          <thead>
                            <tr>
                              <th>Channel</th>
                              <th>Total Leads Acquired</th>
                              <th>Leads Converted</th>
                              <th>Conversion Efficiency</th>
                            </tr>
                          </thead>
                          <tbody>
                            {generatedReport.map((row, idx) => (
                              <tr key={idx}>
                                <td style={{ fontWeight: 600 }}>{row.channel}</td>
                                <td>{row.leads}</td>
                                <td>{row.converted}</td>
                                <td><span className="status-pill active">{row.rate}</span></td>
                              </tr>
                            ))}
                          </tbody>
                        </>
                      )}

                      {reportType === 'reps' && (
                        <>
                          <thead>
                            <tr>
                              <th>Representative</th>
                              <th>Active Leads Managed</th>
                              <th>Total Closed Sales</th>
                              <th>Close Ratio</th>
                            </tr>
                          </thead>
                          <tbody>
                            {generatedReport.map((row, idx) => (
                              <tr key={idx}>
                                <td style={{ fontWeight: 600 }}>{row.rep}</td>
                                <td>{row.activeLeads}</td>
                                <td>{row.closedValue}</td>
                                <td><span className="status-pill active">{row.conversion}</span></td>
                              </tr>
                            ))}
                          </tbody>
                        </>
                      )}
                    </table>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* VIEW: SUPPORT & HELPDESK TICKETS QUEUE */}
          {activeView === 'tickets' && (
                <div>
                  <div className="view-header-row">
                    <div>
                      <h1 className="view-title">Support & Helpdesk Tickets</h1>
                      <p className="view-subtitle">Track client complaints, SLA resolution timers, and post-sales service tickets</p>
                    </div>
                    <button 
                      className="btn btn-primary"
                      onClick={() => setShowTicketModal(true)}
                    >
                      <Plus size={16} />
                      <span>Raise Support Ticket</span>
                    </button>
                  </div>

                  <div className="metrics-grid" style={{ gridTemplateColumns: 'repeat(4, 1fr)', marginBottom: '24px' }}>
                    <div className="metric-card">
                      <div className="metric-header">
                        <span className="metric-label">Total Tickets</span>
                        <div className="metric-icon" style={{ background: 'var(--accent-light)', color: 'var(--accent-color)' }}><Ticket size={18} /></div>
                      </div>
                      <span className="metric-value">{tickets.length}</span>
                      <span className="metric-subtext">Logged in system</span>
                    </div>

                    <div className="metric-card">
                      <div className="metric-header">
                        <span className="metric-label">Open / Urgent</span>
                        <div className="metric-icon" style={{ background: 'rgba(239, 68, 68, 0.12)', color: '#ef4444' }}><AlertTriangle size={18} /></div>
                      </div>
                      <span className="metric-value">{tickets.filter(t => t.status === 'Open').length}</span>
                      <span className="metric-subtext" style={{ color: '#ef4444' }}>Requires Immediate Action</span>
                    </div>

                    <div className="metric-card">
                      <div className="metric-header">
                        <span className="metric-label">In-Progress</span>
                        <div className="metric-icon" style={{ background: 'rgba(245, 158, 11, 0.12)', color: '#f59e0b' }}><RefreshCw size={18} /></div>
                      </div>
                      <span className="metric-value">{tickets.filter(t => t.status === 'In-Progress').length}</span>
                      <span className="metric-subtext">Assigned to engineers</span>
                    </div>

                    <div className="metric-card">
                      <div className="metric-header">
                        <span className="metric-label">Resolved / Closed</span>
                        <div className="metric-icon" style={{ background: 'rgba(16, 185, 129, 0.12)', color: '#10b981' }}><CheckCircle size={18} /></div>
                      </div>
                      <span className="metric-value">{tickets.filter(t => t.status === 'Resolved').length}</span>
                      <span className="metric-subtext" style={{ color: '#10b981' }}>100% SLA Satisfied</span>
                    </div>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {tickets.length === 0 ? (
                      <div style={{ textAlign: 'center', padding: '40px', background: 'var(--bg-card)', borderRadius: '12px', border: '1px dashed var(--border-color)', color: 'var(--text-secondary)' }}>
                        <Ticket size={36} style={{ opacity: 0.5, marginBottom: '8px' }} />
                        <h4>No tickets logged yet</h4>
                        <p style={{ fontSize: '13px' }}>Click "Raise Support Ticket" to report any client issues.</p>
                      </div>
                    ) : (
                      tickets.map(tck => (
                        <div key={tck.id} className="ticket-card">
                          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
                              <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--accent-color)', fontFamily: 'monospace' }}>{tck.ticketNo}</span>
                              <span className={`ticket-priority-pill ${tck.priority.toLowerCase()}`}>{tck.priority}</span>
                            </div>

                            <div>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <h4 style={{ fontSize: '14px', fontWeight: 600, margin: 0 }}>{tck.subject}</h4>
                                <span style={{ fontSize: '10px', background: 'var(--bg-base)', border: '1px solid var(--border-color)', padding: '2px 6px', borderRadius: '4px' }}>{tck.category}</span>
                              </div>
                              <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '4px' }}>
                                Client: <strong>{tck.clientName}</strong> • Assigned: <strong>{tck.assignedTo}</strong> • Created: {tck.createdDate}
                              </div>
                              {tck.notes && <p style={{ fontSize: '12px', color: 'var(--text-primary)', margin: '4px 0 0 0' }}>{tck.notes}</p>}
                            </div>
                          </div>

                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            {activePortal === 'client' ? (
                              <span className={`status-pill ${tck.status === 'Resolved' ? 'active' : tck.status === 'In-Progress' ? 'warning' : 'inactive'}`}>
                                {tck.status}
                              </span>
                            ) : (
                              <>
                                <select 
                                  className="form-control" 
                                  style={{ width: '130px', fontSize: '12px', padding: '6px' }}
                                  value={tck.status}
                                  onChange={(e) => handleUpdateTicketStatus(tck.id, e.target.value as any)}
                                >
                                  <option value="Open">🔴 Open</option>
                                  <option value="In-Progress">🟡 In-Progress</option>
                                  <option value="Resolved">🟢 Resolved</option>
                                </select>
                                {(activePortal === 'super_admin' || activePortal === 'admin') && (
                                  <button 
                                    className="table-action-btn danger-hover" 
                                    title="Delete Ticket"
                                    onClick={() => handleDeleteTicket(tck.id)}
                                  >
                                    <Trash2 size={14} />
                                  </button>
                                )}
                              </>
                            )}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}

              {/* VIEW: CLIENT SELF-SERVICE PORTAL */}
              {activeView === 'client_portal' && (
                <div>
                  <div className="view-header-row">
                    <div>
                      <h1 className="view-title">Customer Self-Service Portal</h1>
                      <p className="view-subtitle">Track your project milestones, pay bills via UPI, and review contract deliverables</p>
                    </div>
                    <button 
                      className="btn btn-primary"
                      onClick={() => setShowTicketModal(true)}
                    >
                      <Ticket size={16} />
                      <span>Raise Helpdesk Ticket</span>
                    </button>
                  </div>

                  {/* Project Milestone Delivery Timeline */}
                  <div className="client-progress-container">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <h3 style={{ fontSize: '16px', fontWeight: 700 }}>Contract Milestone Delivery Progress</h3>
                        <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Live progress of your enterprise CRM implementation project</span>
                      </div>
                      <span className="portal-badge client">Stage 2 Active (65% Overall Delivery)</span>
                    </div>

                    <div className="milestone-steps-row">
                      <div className="milestone-step-item">
                        <div className="milestone-circle completed">✓</div>
                        <strong style={{ fontSize: '12px' }}>Stage 1 (50%)</strong>
                        <span style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>Advance & Kickoff [Done]</span>
                      </div>

                      <div style={{ flex: 1, height: '3px', backgroundColor: '#10b981', margin: '0 8px', transform: 'translateY(-12px)' }}></div>

                      <div className="milestone-step-item">
                        <div className="milestone-circle active">2</div>
                        <strong style={{ fontSize: '12px', color: 'var(--accent-color)' }}>Stage 2 (30%)</strong>
                        <span style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>Alpha Deployment [In-Progress]</span>
                      </div>

                      <div style={{ flex: 1, height: '3px', backgroundColor: 'var(--border-color)', margin: '0 8px', transform: 'translateY(-12px)' }}></div>

                      <div className="milestone-step-item">
                        <div className="milestone-circle">3</div>
                        <strong style={{ fontSize: '12px' }}>Stage 3 (20%)</strong>
                        <span style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>Final Handover [Upcoming]</span>
                      </div>
                    </div>
                  </div>

                  {/* Client Portal Quick Action Cards */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '24px' }}>
                    
                    {/* Invoices & UPI Payment Card */}
                    <div className="settings-card">
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                        <h3 className="settings-title" style={{ marginBottom: 0 }}>Latest Invoice & Scan-to-Pay</h3>
                        <span className="status-pill active">Verified Bill</span>
                      </div>

                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 16px', background: 'var(--bg-base)', borderRadius: '8px', marginBottom: '14px' }}>
                        <div>
                          <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Active Bill:</span>
                          <h4 style={{ fontSize: '15px', fontWeight: 700 }}>INV-982341 ({invoiceItemName})</h4>
                        </div>
                        <span style={{ fontSize: '18px', fontWeight: 800, color: 'var(--accent-color)' }}>{currencySymbol}{invoiceGrandTotal.toLocaleString()}</span>
                      </div>

                      {/* UPI QR Code Preview in Client Portal */}
                      <div className="invoice-upi-qr-card">
                        <img 
                          src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(`upi://pay?pa=${invoiceUpiId || 'billing@upi'}&pn=${encodeURIComponent(settings.companyName)}&am=${invoiceGrandTotal}&cu=INR&tn=ClientPayment`)}`} 
                          alt="UPI Payment QR Code" 
                          className="invoice-upi-qr-img" 
                        />
                        <div style={{ flex: 1 }}>
                          <strong style={{ fontSize: '13px', display: 'block' }}>Instant UPI Mobile Payment</strong>
                          <p style={{ fontSize: '11px', color: 'var(--text-secondary)', margin: '4px 0' }}>
                            Scan with PhonePe, Google Pay or Paytm to pay <strong>{currencySymbol}{invoiceGrandTotal.toLocaleString()}</strong>.
                          </p>
                          <span style={{ fontSize: '11px', background: 'var(--bg-card)', padding: '2px 6px', borderRadius: '4px', border: '1px solid var(--border-color)', fontFamily: 'monospace' }}>
                            UPI: {invoiceUpiId}
                          </span>
                        </div>
                      </div>

                      <button 
                        className="btn btn-secondary" 
                        style={{ width: '100%', justifyContent: 'center', marginTop: '14px' }}
                        onClick={() => setActiveView('invoices')}
                      >
                        <Receipt size={14} /> View Full Printable Invoice PDF
                      </button>
                    </div>

                    {/* Support Tickets Overview Card */}
                    <div className="settings-card">
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                        <h3 className="settings-title" style={{ marginBottom: 0 }}>My Support Requests</h3>
                        <Ticket size={18} style={{ color: 'var(--accent-color)' }} />
                      </div>

                      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        {tickets.slice(0, 3).map(t => (
                          <div key={t.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 12px', background: 'var(--bg-base)', borderRadius: '6px', fontSize: '12px' }}>
                            <div>
                              <strong style={{ display: 'block' }}>{t.subject}</strong>
                              <span style={{ fontSize: '10px', color: 'var(--text-secondary)' }}>{t.ticketNo} • {t.createdDate}</span>
                            </div>
                            <span className={`status-pill ${t.status === 'Resolved' ? 'active' : 'inactive'}`}>{t.status}</span>
                          </div>
                        ))}
                      </div>

                      <button 
                        className="btn btn-primary" 
                        style={{ width: '100%', justifyContent: 'center', marginTop: '16px' }}
                        onClick={() => setShowTicketModal(true)}
                      >
                        <Plus size={14} /> Submit New Complaint / Ticket
                      </button>
                    </div>

                  </div>
                </div>
              )}

        </div>
      </main>


      {/* Hidden File Input for Lead Attachments */}
      <input 
        type="file" 
        ref={attachmentFileInputRef} 
        style={{ display: 'none' }}
        onChange={(e) => {
          if (e.target.files && e.target.files[0] && selectedLeadForDrawer) {
            handleAddAttachment(selectedLeadForDrawer.id, e.target.files[0]);
          }
        }}
      />

      {/* LEAD DETAILS & ACTIVITY / CALL LOGS / DOCS DRAWER */}
      {selectedLeadForDrawer && (
        <div className="drawer-backdrop" onClick={() => setSelectedLeadForDrawer(null)}>
          <div className="drawer-panel" onClick={(e) => e.stopPropagation()}>
            <div className="drawer-header">
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <h3 style={{ fontSize: '18px', fontWeight: 700, margin: 0 }}>{selectedLeadForDrawer.name}</h3>
                  {(() => {
                    const temp = getLeadTemperature(selectedLeadForDrawer);
                    return (
                      <span className={`lead-temp-badge ${temp.label.toLowerCase()}`} title={`Calculated Score: ${temp.score}/100`}>
                        {temp.icon} {temp.label} ({temp.score})
                      </span>
                    );
                  })()}
                </div>
                <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Lead Profile, Calls & Activity Timeline</span>
              </div>
              <button className="modal-close-btn" onClick={() => setSelectedLeadForDrawer(null)}>
                <X size={20} />
              </button>
            </div>

            <div className="drawer-body">
              <div className="detail-section">
                <div className="detail-grid-2col">
                  <div className="detail-item-box">
                    <span className="detail-item-label">Deal Value</span>
                    <span className="detail-item-val">{currencySymbol}{selectedLeadForDrawer.value.toLocaleString()}</span>
                  </div>
                  <div className="detail-item-box">
                    <span className="detail-item-label">Status</span>
                    <span className="detail-item-val">
                      <span className={`status-pill ${selectedLeadForDrawer.status.toLowerCase()}`}>
                        {selectedLeadForDrawer.status}
                      </span>
                    </span>
                  </div>
                  <div className="detail-item-box">
                    <span className="detail-item-label">Tag / Priority</span>
                    <span className="detail-item-val">
                      <span className={`tag-badge ${getTagClass(selectedLeadForDrawer.tag)}`}>
                        {selectedLeadForDrawer.tag || 'Standard'}
                      </span>
                    </span>
                  </div>
                  <div className="detail-item-box">
                    <span className="detail-item-label">Assigned Rep</span>
                    <span className="detail-item-val">{selectedLeadForDrawer.assignedRep || 'Admin'}</span>
                  </div>
                </div>

                {/* Custom Fields in Drawer */}
                {settings.customFields && settings.customFields.length > 0 && selectedLeadForDrawer.customValues && (
                  <div style={{ marginTop: '12px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    {settings.customFields.map(f => {
                      const val = selectedLeadForDrawer.customValues?.[f.id.toString()];
                      if (!val) return null;
                      return (
                        <div key={f.id} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', padding: '4px 0', borderBottom: '1px dashed var(--border-color)' }}>
                          <span style={{ color: 'var(--text-secondary)' }}>{f.label}:</span>
                          <strong>{val}</strong>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Client CSAT Rating & Feedback Mood */}
              <div className="detail-section">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span className="detail-item-label" style={{ marginBottom: 0 }}>Client CSAT Rating:</span>
                  <div className="star-rating-row">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button 
                        key={star}
                        type="button"
                        className={`star-btn ${(selectedLeadForDrawer.rating || 5) >= star ? 'active' : ''}`}
                        onClick={() => handleSetLeadRating(selectedLeadForDrawer.id, star)}
                        title={`Rate ${star} Star(s)`}
                      >
                        ★
                      </button>
                    ))}
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '6px', marginTop: '8px' }}>
                  {(['Delighted', 'Satisfied', 'Neutral', 'Unhappy'] as const).map(mood => (
                    <button
                      key={mood}
                      type="button"
                      className={`audience-chip ${(selectedLeadForDrawer.csatMood || 'Satisfied') === mood ? 'active' : ''}`}
                      style={{ fontSize: '11px', padding: '4px 10px' }}
                      onClick={() => handleSetLeadMood(selectedLeadForDrawer.id, mood)}
                    >
                      {mood === 'Delighted' ? '😍 Delighted' : mood === 'Satisfied' ? '😊 Satisfied' : mood === 'Neutral' ? '😐 Neutral' : '😞 Unhappy'}
                    </button>
                  ))}
                </div>
              </div>

              {/* Template Selector for WhatsApp / Email */}
              <div className="detail-section">
                <span className="detail-item-label">Choose Message Template:</span>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '6px' }}>
                  <button 
                    className={`btn ${selectedTemplate === 'demo' ? 'btn-primary' : 'btn-secondary'}`}
                    style={{ fontSize: '11px', padding: '6px 8px' }}
                    onClick={() => setSelectedTemplate('demo')}
                  >
                    Demo Walkthrough
                  </button>
                  <button 
                    className={`btn ${selectedTemplate === 'quote' ? 'btn-primary' : 'btn-secondary'}`}
                    style={{ fontSize: '11px', padding: '6px 8px' }}
                    onClick={() => setSelectedTemplate('quote')}
                  >
                    Price Proposal
                  </button>
                  <button 
                    className={`btn ${selectedTemplate === 'sla' ? 'btn-primary' : 'btn-secondary'}`}
                    style={{ fontSize: '11px', padding: '6px 8px' }}
                    onClick={() => setSelectedTemplate('sla')}
                  >
                    SLA & Contract
                  </button>
                </div>
              </div>

              {/* Direct WhatsApp & Email Buttons */}
              <div style={{ display: 'flex', gap: '10px' }}>
                <a 
                  href={getWhatsAppUrl(selectedLeadForDrawer.phone, selectedLeadForDrawer.name, selectedLeadForDrawer.value)} 
                  target="_blank" 
                  rel="noreferrer"
                  className="btn btn-primary"
                  style={{ flex: 1, justifyContent: 'center', backgroundColor: '#25d366', borderColor: '#25d366', color: '#fff' }}
                >
                  <MessageCircle size={14} /> WhatsApp Template
                </a>
                <a 
                  href={getEmailUrl(selectedLeadForDrawer.email, selectedLeadForDrawer.name, selectedLeadForDrawer.value)} 
                  className="btn btn-secondary"
                  style={{ flex: 1, justifyContent: 'center' }}
                >
                  <Mail size={14} /> Send Email
                </a>
              </div>

              {/* Quick Actions & Field Sales GPS Checkin */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <div style={{ display: 'flex', gap: '10px' }}>
                  <button 
                    className="btn btn-secondary"
                    style={{ flex: 1, fontSize: '12px', justifyContent: 'center' }}
                    onClick={() => openEditLeadModal(selectedLeadForDrawer)}
                  >
                    <Edit2 size={13} /> Edit Full Info
                  </button>
                  <button 
                    className="btn btn-secondary"
                    style={{ flex: 1, fontSize: '12px', justifyContent: 'center' }}
                    onClick={() => handleUpdateLeadStatus(selectedLeadForDrawer.id, selectedLeadForDrawer.status === 'Qualified' ? 'Contacted' : 'Qualified')}
                  >
                    {selectedLeadForDrawer.status === 'Qualified' ? 'Move to Contacted' : 'Mark as Qualified'}
                  </button>
                </div>

                {/* 📍 Field Sales GPS Check-in Button */}
                <button 
                  type="button"
                  className="gps-checkin-btn"
                  style={{ justifyContent: 'center' }}
                  onClick={() => handleGpsCheckIn(selectedLeadForDrawer.id)}
                  title="Verify physical meeting location on Google Maps"
                >
                  <MapPin size={14} style={{ color: '#10b981' }} />
                  <span>📍 Field Sales GPS Check-In (Verified Map Location)</span>
                </button>
              </div>

              {/* Drawer Tab Switcher: Notes vs Call Logs vs Documents */}
              <div className="detail-section">
                <div className="drawer-subtab-bar">
                  <button 
                    className={`drawer-subtab-btn ${drawerActiveTab === 'notes' ? 'active' : ''}`}
                    onClick={() => setDrawerActiveTab('notes')}
                  >
                    <Activity size={14} style={{ display: 'inline', marginRight: '4px' }} />
                    Notes ({selectedLeadForDrawer.notes?.length || 0})
                  </button>
                  <button 
                    className={`drawer-subtab-btn ${drawerActiveTab === 'calls' ? 'active' : ''}`}
                    onClick={() => setDrawerActiveTab('calls')}
                  >
                    <PhoneCall size={14} style={{ display: 'inline', marginRight: '4px' }} />
                    Calls ({selectedLeadForDrawer.callLogs?.length || 0})
                  </button>
                  <button 
                    className={`drawer-subtab-btn ${drawerActiveTab === 'docs' ? 'active' : ''}`}
                    onClick={() => setDrawerActiveTab('docs')}
                  >
                    <Paperclip size={14} style={{ display: 'inline', marginRight: '4px' }} />
                    Docs ({selectedLeadForDrawer.attachments?.length || 0})
                  </button>
                </div>

                {/* SUBTAB 1: NOTES TIMELINE (With Voice Dictation Mic) */}
                {drawerActiveTab === 'notes' && (
                  <div>
                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                      <input 
                        type="text"
                        className="form-control"
                        placeholder="Add follow-up note (or speak with mic)..."
                        value={newNoteInput}
                        onChange={(e) => setNewNoteInput(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            handleAddNoteToLead(selectedLeadForDrawer.id);
                          }
                        }}
                        style={{ flex: 1 }}
                      />
                      
                      {/* Voice Dictation Speech-to-Text Button */}
                      <button 
                        type="button" 
                        className={`mic-dictation-btn ${isRecordingNote ? 'recording' : ''}`}
                        onClick={() => isRecordingNote ? stopVoiceDictation() : startVoiceDictation('note')}
                        title={isRecordingNote ? "Stop Voice Recording" : "Speak to Dictate Note"}
                      >
                        {isRecordingNote ? <MicOff size={16} /> : <Mic size={16} />}
                      </button>

                      <button 
                        className="btn btn-primary"
                        style={{ whiteSpace: 'nowrap', padding: '8px 14px' }}
                        onClick={() => handleAddNoteToLead(selectedLeadForDrawer.id)}
                      >
                        Add Note
                      </button>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '12px' }}>
                      {(!selectedLeadForDrawer.notes || selectedLeadForDrawer.notes.length === 0) ? (
                        <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>No notes added yet.</span>
                      ) : (
                        selectedLeadForDrawer.notes.map(note => (
                          <div key={note.id} className="note-card">
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                              <span style={{ fontWeight: 600 }}>{note.author}</span>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <span className="note-date">{note.date}</span>
                                <button 
                                  className="table-action-btn danger-hover" 
                                  style={{ padding: '2px 4px', width: '22px', height: '22px' }}
                                  onClick={() => handleDeleteNote(selectedLeadForDrawer.id, note.id)}
                                  title="Delete Note"
                                >
                                  <Trash2 size={12} />
                                </button>
                              </div>
                            </div>
                            <p style={{ color: 'var(--text-primary)', margin: '6px 0 0 0' }}>{note.text}</p>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}

                {/* SUBTAB 2: CALL LOGS TRACKER (With Voice Dictation Mic) */}
                {drawerActiveTab === 'calls' && (
                  <div>
                    <div style={{ background: 'var(--bg-base)', padding: '14px', borderRadius: '8px', border: '1px solid var(--border-color)', marginBottom: '14px' }}>
                      <span style={{ fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-secondary)' }}>Log New Call</span>
                      
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginTop: '8px' }}>
                        <div className="form-group" style={{ marginBottom: 0 }}>
                          <label style={{ fontSize: '11px' }}>Call Duration</label>
                          <input 
                            type="text" 
                            className="form-control" 
                            value={callDurationInput}
                            onChange={(e) => setCallDurationInput(e.target.value)}
                            placeholder="e.g. 5 mins"
                          />
                        </div>

                        <div className="form-group" style={{ marginBottom: 0 }}>
                          <label style={{ fontSize: '11px' }}>Call Outcome</label>
                          <select 
                            className="form-control"
                            value={callOutcomeInput}
                            onChange={(e) => setCallOutcomeInput(e.target.value as any)}
                          >
                            <option value="Connected">Connected</option>
                            <option value="Interested">Interested</option>
                            <option value="Call Back Later">Call Back Later</option>
                            <option value="Busy / No Answer">Busy / No Answer</option>
                            <option value="Wrong Number">Wrong Number</option>
                          </select>
                        </div>
                      </div>

                      <div className="form-group" style={{ marginTop: '10px', marginBottom: '10px' }}>
                        <label style={{ fontSize: '11px' }}>Call Notes / Discussion Summary</label>
                        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                          <input 
                            type="text" 
                            className="form-control" 
                            placeholder="Client discussed budget & timeline (or click mic)..."
                            value={callNotesInput}
                            onChange={(e) => setCallNotesInput(e.target.value)}
                            style={{ flex: 1 }}
                          />
                          <button 
                            type="button" 
                            className={`mic-dictation-btn ${isRecordingCall ? 'recording' : ''}`}
                            onClick={() => isRecordingCall ? stopVoiceDictation() : startVoiceDictation('call')}
                            title={isRecordingCall ? "Stop Recording" : "Speak Call Discussion"}
                          >
                            {isRecordingCall ? <MicOff size={16} /> : <Mic size={16} />}
                          </button>
                        </div>
                      </div>

                      <button 
                        className="btn btn-primary" 
                        style={{ width: '100%', justifyContent: 'center', fontSize: '12px' }}
                        onClick={() => handleAddCallLog(selectedLeadForDrawer.id)}
                      >
                        <PhoneCall size={13} /> Save Call Record
                      </button>
                    </div>


                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                      {(!selectedLeadForDrawer.callLogs || selectedLeadForDrawer.callLogs.length === 0) ? (
                        <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>No calls logged for this lead yet.</span>
                      ) : (
                        selectedLeadForDrawer.callLogs.map(c => (
                          <div key={c.id} className="call-log-card">
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                              <span className={`call-outcome-badge ${getCallOutcomeClass(c.outcome)}`}>
                                <PhoneCall size={11} /> {c.outcome} ({c.duration})
                              </span>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <span style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>{c.date} • {c.time}</span>
                                <button 
                                  className="table-action-btn danger-hover" 
                                  style={{ padding: '2px 4px', width: '22px', height: '22px' }}
                                  onClick={() => handleDeleteCallLog(selectedLeadForDrawer.id, c.id)}
                                  title="Delete Call Record"
                                >
                                  <Trash2 size={12} />
                                </button>
                              </div>
                            </div>
                            <p style={{ fontSize: '13px', color: 'var(--text-primary)', margin: '4px 0' }}>{c.notes}</p>
                            <span style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>Caller: <strong>{c.caller}</strong></span>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}

                {/* SUBTAB 3: DOCUMENTS & ATTACHMENTS */}
                {drawerActiveTab === 'docs' && (
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                      <span style={{ fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-secondary)' }}>Attached Files & Agreements</span>
                      <button 
                        className="btn btn-primary" 
                        style={{ fontSize: '11px', padding: '5px 10px' }}
                        onClick={() => attachmentFileInputRef.current?.click()}
                      >
                        <Paperclip size={12} /> Attach Document
                      </button>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      {(!selectedLeadForDrawer.attachments || selectedLeadForDrawer.attachments.length === 0) ? (
                        <div style={{ textAlign: 'center', padding: '24px', color: 'var(--text-secondary)', background: 'var(--bg-base)', borderRadius: '8px', border: '1px dashed var(--border-color)', fontSize: '12px' }}>
                          <Paperclip size={24} style={{ opacity: 0.5, marginBottom: '6px' }} />
                          <div>No documents attached yet. Click <strong>"Attach Document"</strong> to upload PDF or quotation briefs.</div>
                        </div>
                      ) : (
                        selectedLeadForDrawer.attachments.map(doc => (
                          <div key={doc.id} className="attachment-card">
                            <div className="attachment-info">
                              <FileText size={16} style={{ color: 'var(--accent-color)' }} />
                              <div>
                                <strong style={{ fontSize: '12px', display: 'block' }}>{doc.name}</strong>
                                <span style={{ fontSize: '10px', color: 'var(--text-secondary)' }}>{doc.size} • {doc.date}</span>
                              </div>
                            </div>

                            <div style={{ display: 'flex', gap: '4px' }}>
                              <button 
                                className="table-action-btn danger-hover" 
                                onClick={() => handleDeleteAttachment(selectedLeadForDrawer.id, doc.id)}
                                title="Remove File"
                              >
                                <Trash2 size={13} />
                              </button>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}

              </div>

              {/* Delete Lead Action */}
              <div style={{ marginTop: '24px', paddingTop: '16px', borderTop: '1px solid var(--border-color)' }}>
                <button 
                  type="button"
                  className="btn btn-secondary" 
                  style={{ width: '100%', justifyContent: 'center', backgroundColor: 'rgba(239, 68, 68, 0.08)', borderColor: '#ef4444', color: '#ef4444' }}
                  onClick={() => {
                    if (window.confirm(`Are you sure you want to permanently delete lead "${selectedLeadForDrawer.name}"?`)) {
                      handleDeleteLead(selectedLeadForDrawer.id);
                    }
                  }}
                >
                  <Trash2 size={14} /> Delete Lead Permanently
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: USER PROFILE & PASSWORD SETTINGS */}
      {showProfileModal && (
        <div className="modal-overlay" onClick={() => setShowProfileModal(false)}>
          <div className="modal-window" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <span className="modal-title">My Account Profile</span>
              <button className="modal-close-btn" onClick={() => setShowProfileModal(false)}><X size={18} /></button>
            </div>
            
            <form onSubmit={handleUpdateProfile}>
              <div className="modal-body">
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '20px' }}>
                  <div 
                    className="profile-photo-upload-container"
                    onClick={() => profilePhotoInputRef.current?.click()}
                    title="Click to choose a profile photo"
                  >
                    {profilePhotoUrl ? (
                      <img src={profilePhotoUrl} alt="Profile" className="user-profile-img" />
                    ) : (
                      <div className="auth-logo-box" style={{ width: '68px', height: '68px', fontSize: '24px', borderRadius: '50%' }}>
                        {currentUserContext.avatar}
                      </div>
                    )}
                    <div className="profile-camera-badge">
                      <Camera size={13} />
                    </div>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <h4 style={{ fontWeight: 700, margin: 0 }}>{currentUserContext.name}</h4>
                    <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Role: {currentUserContext.role}</span>
                    <div style={{ display: 'flex', gap: '6px', marginTop: '6px' }}>
                      <button 
                        type="button" 
                        className="btn btn-secondary" 
                        style={{ fontSize: '11px', padding: '4px 8px' }}
                        onClick={() => profilePhotoInputRef.current?.click()}
                      >
                        <Camera size={12} /> Upload Photo
                      </button>
                      {profilePhotoUrl && (
                        <button 
                          type="button" 
                          className="btn btn-secondary" 
                          style={{ fontSize: '11px', padding: '4px 8px', color: 'var(--danger)' }}
                          onClick={() => setProfilePhotoUrl('')}
                        >
                          <Trash2 size={12} /> Remove
                        </button>
                      )}
                    </div>
                  </div>
                </div>


                <div className="form-group">
                  <label>Display Name</label>
                  <input 
                    type="text" 
                    className="form-control" 
                    required 
                    value={profileName} 
                    onChange={(e) => setProfileName(e.target.value)} 
                  />
                </div>

                <div className="form-group">
                  <label>Corporate Email</label>
                  <input 
                    type="email" 
                    className="form-control" 
                    required 
                    value={profileEmail} 
                    onChange={(e) => setProfileEmail(e.target.value)} 
                  />
                </div>

                <div className="form-group">
                  <label>Update Password</label>
                  <input 
                    type="password" 
                    className="form-control" 
                    placeholder="New password (optional)"
                    value={profileNewPassword}
                    onChange={(e) => setProfileNewPassword(e.target.value)}
                  />
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowProfileModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Save Profile Changes</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: BULK CSV IMPORT */}
      {showImportModal && (
        <div className="modal-overlay" onClick={() => setShowImportModal(false)}>
          <div className="modal-window" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <span className="modal-title">Bulk Import Leads via CSV</span>
              <button className="modal-close-btn" onClick={() => setShowImportModal(false)}><X size={18} /></button>
            </div>
            
            <div className="modal-body">
              <input 
                type="file" 
                ref={fileInputRef} 
                accept=".csv" 
                style={{ display: 'none' }}
                onChange={(e) => {
                  if (e.target.files && e.target.files[0]) {
                    handleCsvFileUpload(e.target.files[0]);
                  }
                }}
              />

              <div 
                className="file-drop-zone"
                onClick={() => fileInputRef.current?.click()}
              >
                <UploadCloud size={44} style={{ color: 'var(--accent-color)' }} />
                <h4 style={{ fontWeight: 700, fontSize: '15px' }}>Click to select a CSV spreadsheet</h4>
                <p style={{ fontSize: '12px', color: 'var(--text-secondary)', maxWidth: '300px' }}>
                  Supports headers: Name, Email, Phone, Source, Value, Status
                </p>
              </div>

              <div style={{ marginTop: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Need a sample format?</span>
                <button 
                  className="btn btn-secondary"
                  style={{ fontSize: '11px', padding: '5px 10px' }}
                  onClick={() => downloadRealCSV('leads')}
                >
                  <FileText size={12} /> Download Sample Template
                </button>
              </div>
            </div>

            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setShowImportModal(false)}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: ADD / EDIT LEAD (With Custom Dynamic Fields) */}
      {showLeadModal && (
        <div className="modal-overlay" onClick={() => setShowLeadModal(false)}>
          <div className="modal-window" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <span className="modal-title">{editingLead ? 'Edit Lead Entry' : 'Create New Lead Entry'}</span>
              <button className="modal-close-btn" onClick={() => setShowLeadModal(false)}><X size={18} /></button>
            </div>
            
            <form onSubmit={handleSaveLead}>
              <div className="modal-body">
                <div className="form-group">
                  <label>Lead Company / Contact Name</label>
                  <input type="text" className="form-control" required value={leadFormName} onChange={(e) => setLeadFormName(e.target.value)} />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <div className="form-group">
                    <label>Email Address</label>
                    <input type="email" className="form-control" value={leadFormEmail} onChange={(e) => setLeadFormEmail(e.target.value)} />
                  </div>
                  <div className="form-group">
                    <label>WhatsApp / Phone Number</label>
                    <input type="text" className="form-control" placeholder="919876543210" value={leadFormPhone} onChange={(e) => setLeadFormPhone(e.target.value)} />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <div className="form-group">
                    <label>Priority / Tag</label>
                    <select className="form-control" value={leadFormTag} onChange={(e) => setLeadFormTag(e.target.value as any)}>
                      <option value="Standard">Standard</option>
                      <option value="VIP Client">VIP Client</option>
                      <option value="Urgent">Urgent</option>
                      <option value="Enterprise">Enterprise</option>
                      <option value="Hot Deal">Hot Deal</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Deal Value ({currencySymbol})</label>
                    <input type="number" className="form-control" min={0} value={leadFormValue} onChange={(e) => setLeadFormValue(Number(e.target.value))} />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <div className="form-group">
                    <label>Status Stage</label>
                    <select className="form-control" value={leadFormStatus} onChange={(e) => setLeadFormStatus(e.target.value)}>
                      <option value="New">New</option>
                      <option value="Contacted">Contacted</option>
                      <option value="Qualified">Qualified</option>
                      <option value="Lost">Lost</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Assigned Representative</label>
                    <select className="form-control" value={leadFormRep} onChange={(e) => setLeadFormRep(e.target.value)}>
                      {users.map(u => (<option key={u.id} value={u.name}>{u.name} ({u.role})</option>))}
                    </select>
                  </div>
                </div>

                {/* Custom Fields in Lead Form */}
                {settings.customFields && settings.customFields.length > 0 && (
                  <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '14px', marginTop: '14px' }}>
                    <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-secondary)', display: 'block', marginBottom: '8px' }}>CUSTOM CORPORATE FIELDS</span>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                      {settings.customFields.map(field => (
                        <div key={field.id} className="form-group" style={{ marginBottom: 0 }}>
                          <label>{field.label}</label>
                          <input 
                            type={field.type}
                            className="form-control"
                            value={leadFormCustomVals[field.id.toString()] || ''}
                            onChange={(e) => setLeadFormCustomVals({
                              ...leadFormCustomVals,
                              [field.id.toString()]: e.target.value
                            })}
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowLeadModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">{editingLead ? 'Save Changes' : 'Create Lead'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: ADD / EDIT DEAL */}
      {showDealModal && (
        <div className="modal-overlay" onClick={() => setShowDealModal(false)}>
          <div className="modal-window" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <span className="modal-title">{editingDeal ? 'Edit Deal Opportunity' : 'Add Deal Opportunity'}</span>
              <button className="modal-close-btn" onClick={() => setShowDealModal(false)}><X size={18} /></button>
            </div>
            
            <form onSubmit={handleSaveDeal}>
              <div className="modal-body">
                <div className="form-group">
                  <label>Deal Reference / Contract Title</label>
                  <input type="text" className="form-control" required value={dealFormName} onChange={(e) => setDealFormName(e.target.value)} />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <div className="form-group">
                    <label>Contract Value ({currencySymbol})</label>
                    <input type="number" className="form-control" min={0} value={dealFormValue} onChange={(e) => setDealFormValue(Number(e.target.value))} />
                  </div>
                  <div className="form-group">
                    <label>Probability (%)</label>
                    <input type="number" className="form-control" min={0} max={100} value={dealFormProb} onChange={(e) => setDealFormProb(Number(e.target.value))} />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <div className="form-group">
                    <label>Pipeline Stage</label>
                    <select className="form-control" value={dealFormStage} onChange={(e) => setDealFormStage(e.target.value as any)}>
                      <option value="Proposal">Proposal</option>
                      <option value="Negotiation">Negotiation</option>
                      <option value="Closed">Closed</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Tag</label>
                    <select className="form-control" value={dealFormTag} onChange={(e) => setDealFormTag(e.target.value as any)}>
                      <option value="Standard">Standard</option>
                      <option value="VIP Client">VIP Client</option>
                      <option value="Urgent">Urgent</option>
                      <option value="Enterprise">Enterprise</option>
                      <option value="Hot Deal">Hot Deal</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowDealModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">{editingDeal ? 'Save Changes' : 'Add Deal'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: SCHEDULE TASK */}
      {showTaskModal && (
        <div className="modal-overlay" onClick={() => setShowTaskModal(false)}>
          <div className="modal-window" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <span className="modal-title">Schedule New Follow-up Task</span>
              <button className="modal-close-btn" onClick={() => setShowTaskModal(false)}><X size={18} /></button>
            </div>
            
            <form onSubmit={handleSaveTask}>
              <div className="modal-body">
                <div className="form-group">
                  <label>Task Description</label>
                  <input 
                    type="text" 
                    className="form-control" 
                    placeholder="e.g. Call client regarding proposal discussion"
                    required
                    value={taskFormTitle}
                    onChange={(e) => setTaskFormTitle(e.target.value)}
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <div className="form-group">
                    <label>Due Date</label>
                    <input type="date" className="form-control" value={taskFormDate} onChange={(e) => setTaskFormDate(e.target.value)} />
                  </div>
                  <div className="form-group">
                    <label>Priority Level</label>
                    <select className="form-control" value={taskFormPriority} onChange={(e) => setTaskFormPriority(e.target.value as any)}>
                      <option value="High">High Priority</option>
                      <option value="Medium">Medium Priority</option>
                      <option value="Low">Low Priority</option>
                    </select>
                  </div>
                </div>

                <div className="form-group">
                  <label>Assign To</label>
                  <select className="form-control" value={taskFormAssignee} onChange={(e) => setTaskFormAssignee(e.target.value)}>
                    {users.map(u => (<option key={u.id} value={u.name}>{u.name} ({u.role})</option>))}
                  </select>
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowTaskModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Schedule Task</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: ADD / EDIT TEAM MEMBER */}
      {showUserModal && (
        <div className="modal-overlay" onClick={() => setShowUserModal(false)}>
          <div className="modal-window" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <span className="modal-title">{editingUser ? 'Edit User Credentials' : 'Add Team Member'}</span>
              <button className="modal-close-btn" onClick={() => setShowUserModal(false)}><X size={18} /></button>
            </div>
            
            <form onSubmit={handleAddOrEditUser}>
              <div className="modal-body">
                {/* Photo Upload & Preview */}
                <input 
                  type="file" 
                  ref={userPhotoInputRef} 
                  accept="image/*" 
                  style={{ display: 'none' }}
                  onChange={(e) => {
                    if (e.target.files && e.target.files[0]) {
                      handleUploadUserPhoto(e.target.files[0]);
                    }
                  }}
                />

                <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '20px', padding: '12px', background: 'var(--bg-base)', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                  <div 
                    className="profile-photo-upload-container"
                    onClick={() => userPhotoInputRef.current?.click()}
                    title="Click to select team member photo"
                    style={{ position: 'relative', width: '56px', height: '56px', borderRadius: '50%', cursor: 'pointer', overflow: 'hidden', border: '2px solid var(--border-color)', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-surface)' }}
                  >
                    {newUserPhotoUrl ? (
                      <img src={newUserPhotoUrl} alt="User Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    ) : (
                      <div style={{ fontSize: '18px', fontWeight: 700, color: 'var(--accent-primary)' }}>
                        {newUserName ? newUserName.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase() : '👤'}
                      </div>
                    )}
                    <div style={{ position: 'absolute', bottom: 0, right: 0, left: 0, height: '20px', background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}>
                      <Camera size={11} />
                    </div>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <span style={{ fontSize: '12px', fontWeight: 600 }}>Member Profile Photo</span>
                    <span style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>JPG, PNG or WEBP avatar image</span>
                    <div style={{ display: 'flex', gap: '6px', marginTop: '4px' }}>
                      <button 
                        type="button" 
                        className="btn btn-secondary" 
                        style={{ fontSize: '11px', padding: '3px 8px' }}
                        onClick={() => userPhotoInputRef.current?.click()}
                      >
                        <Camera size={12} /> {newUserPhotoUrl ? 'Change Photo' : 'Upload Photo'}
                      </button>
                      {newUserPhotoUrl && (
                        <button 
                          type="button" 
                          className="btn btn-secondary" 
                          style={{ fontSize: '11px', padding: '3px 8px', color: 'var(--danger)' }}
                          onClick={() => setNewUserPhotoUrl('')}
                        >
                          <Trash2 size={12} /> Remove
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                <div className="form-group">
                  <label>Full Employee Name</label>
                  <input type="text" className="form-control" required value={newUserName} onChange={(e) => setNewUserName(e.target.value)} />
                </div>
                <div className="form-group">
                  <label>Corporate Email</label>
                  <input type="email" className="form-control" required value={newUserEmail} onChange={(e) => setNewUserEmail(e.target.value)} />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <div className="form-group">
                    <label>Assigned Role</label>
                    <select className="form-control" value={newUserRole} onChange={(e) => setNewUserRole(e.target.value as any)}>
                      <option value="Super Admin">👑 Super Admin</option>
                      <option value="Admin">🏢 Operations Admin</option>
                      <option value="Sales Manager">👔 Sales Manager</option>
                      <option value="Sales Rep">💼 Sales Rep</option>
                      <option value="Support Agent">🎧 Support Agent</option>
                      <option value="Client">🤝 Client</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Employee Status</label>
                    <select className="form-control" value={newUserStatus} onChange={(e) => setNewUserStatus(e.target.value as any)}>
                      <option value="Active">Active</option>
                      <option value="Inactive">Inactive</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowUserModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">{editingUser ? 'Save Changes' : 'Create Account'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: EXPORT DATA */}
      {showExportModal && (
        <div className="modal-overlay" onClick={() => setShowExportModal(false)}>
          <div className="modal-window" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <span className="modal-title">Export CRM Dataset</span>
              <button className="modal-close-btn" onClick={() => setShowExportModal(false)}><X size={18} /></button>
            </div>
            <div className="modal-body" style={{ textAlign: 'center', padding: '32px 24px' }}>
              <Sparkles size={40} style={{ color: 'var(--success)', marginBottom: '16px' }} />
              <h4 style={{ fontWeight: 600, fontSize: '16px', marginBottom: '8px' }}>Real Data Export Available</h4>
              <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: '24px' }}>
                Download your live dataset ({leads.length} leads, {deals.length} deals) directly to your computer.
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <button 
                  className="btn btn-primary"
                  style={{ justifyContent: 'center' }}
                  onClick={() => {
                    setShowExportModal(false);
                    downloadRealCSV('leads');
                  }}
                >
                  <Download size={14} /> Download Leads CSV File
                </button>
                <button 
                  className="btn btn-secondary"
                  style={{ justifyContent: 'center' }}
                  onClick={() => {
                    setShowExportModal(false);
                    downloadRealCSV('deals');
                  }}
                >
                  <Download size={14} /> Download Deals CSV File
                </button>
                <button 
                  className="btn btn-secondary"
                  style={{ justifyContent: 'center', borderColor: 'var(--accent-color)', color: 'var(--accent-color)' }}
                  onClick={() => {
                    setShowExportModal(false);
                    handleDownloadFullBackup();
                  }}
                >
                  <Database size={14} /> Download Full System JSON Backup
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: KEYBOARD SHORTCUTS CHEAT SHEET */}
      {showShortcutsModal && (
        <div className="modal-overlay" onClick={() => setShowShortcutsModal(false)}>
          <div className="modal-window" style={{ maxWidth: '520px' }} onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Keyboard size={18} style={{ color: 'var(--accent-color)' }} />
                <span className="modal-title">Keyboard Shortcuts Guide</span>
              </div>
              <button className="modal-close-btn" onClick={() => setShowShortcutsModal(false)}><X size={18} /></button>
            </div>

            <div className="modal-body">
              <p style={{ fontSize: '12.5px', color: 'var(--text-secondary)', marginBottom: '14px' }}>
                Boost your daily sales productivity with these instant global shortcuts:
              </p>

              <div className="shortcuts-grid">
                <div className="shortcut-row">
                  <span style={{ fontSize: '12px', fontWeight: 500 }}>Spotlight Search</span>
                  <span className="shortcut-badge">Ctrl + K</span>
                </div>
                <div className="shortcut-row">
                  <span style={{ fontSize: '12px', fontWeight: 500 }}>Shortcuts Guide</span>
                  <span className="shortcut-badge">?</span>
                </div>
                <div className="shortcut-row">
                  <span style={{ fontSize: '12px', fontWeight: 500 }}>Add New Lead</span>
                  <span className="shortcut-badge">Alt + N</span>
                </div>
                <div className="shortcut-row">
                  <span style={{ fontSize: '12px', fontWeight: 500 }}>Add New Deal</span>
                  <span className="shortcut-badge">Alt + D</span>
                </div>
                <div className="shortcut-row">
                  <span style={{ fontSize: '12px', fontWeight: 500 }}>Toggle Dark Theme</span>
                  <span className="shortcut-badge">Alt + T</span>
                </div>
                <div className="shortcut-row">
                  <span style={{ fontSize: '12px', fontWeight: 500 }}>Close Modal / Drawer</span>
                  <span className="shortcut-badge">Esc</span>
                </div>
              </div>
            </div>

            <div className="modal-footer">
              <button className="btn btn-primary" style={{ width: '100%', justifyContent: 'center' }} onClick={() => setShowShortcutsModal(false)}>
                Got it, Close Guide
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: RAISE SUPPORT TICKET */}
      {showTicketModal && (
        <div className="modal-overlay" onClick={() => setShowTicketModal(false)}>
          <div className="modal-window" style={{ maxWidth: '480px' }} onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Headphones size={18} style={{ color: 'var(--accent-color)' }} />
                <span className="modal-title">Raise Support Ticket</span>
              </div>
              <button className="modal-close-btn" onClick={() => setShowTicketModal(false)}><X size={18} /></button>
            </div>
            <form onSubmit={handleCreateTicket}>
              <div className="modal-body">
                <div className="form-group">
                  <label>Client / Account Name</label>
                  <input
                    type="text"
                    className="form-control"
                    required
                    placeholder="e.g. Acme Corp / Your Name"
                    value={ticketClient}
                    onChange={(e) => setTicketClient(e.target.value)}
                  />
                </div>
                <div className="form-group">
                  <label>Ticket Subject / Issue Summary</label>
                  <input
                    type="text"
                    className="form-control"
                    required
                    placeholder="e.g. Invoice correction or feature query"
                    value={ticketSubject}
                    onChange={(e) => setTicketSubject(e.target.value)}
                  />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                  <div className="form-group">
                    <label>Category</label>
                    <select
                      className="form-control"
                      value={ticketCategory}
                      onChange={(e) => setTicketCategory(e.target.value as any)}
                    >
                      <option value="Billing">Billing & Invoice</option>
                      <option value="Technical">Technical / Bug</option>
                      <option value="Feature Request">Feature Request</option>
                      <option value="General">General Query</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Priority</label>
                    <select
                      className="form-control"
                      value={ticketPriority}
                      onChange={(e) => setTicketPriority(e.target.value as any)}
                    >
                      <option value="High">🔴 High</option>
                      <option value="Medium">🟡 Medium</option>
                      <option value="Low">🟢 Low</option>
                    </select>
                  </div>
                </div>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label>Issue Details / Discussion Notes</label>
                  <textarea
                    className="form-control"
                    rows={3}
                    placeholder="Describe the issue in detail..."
                    value={ticketNotes}
                    onChange={(e) => setTicketNotes(e.target.value)}
                  />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowTicketModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Submit Ticket
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Mobile App Bottom Navigation Bar */}
      <nav className="mobile-bottom-nav">
        {activePortal === 'client' ? (
          <>
            <button 
              className={`mobile-nav-item ${activeView === 'client_portal' ? 'active' : ''}`}
              onClick={() => setActiveView('client_portal')}
            >
              <Award size={20} />
              <span>Portal</span>
            </button>
            <button 
              className={`mobile-nav-item ${activeView === 'invoices' ? 'active' : ''}`}
              onClick={() => setActiveView('invoices')}
            >
              <Receipt size={20} />
              <span>Invoices</span>
            </button>
            <button 
              className={`mobile-nav-item ${activeView === 'tickets' ? 'active' : ''}`}
              onClick={() => setActiveView('tickets')}
            >
              <Ticket size={20} />
              <span>Tickets</span>
            </button>
          </>
        ) : activePortal === 'support' ? (
          <>
            <button 
              className={`mobile-nav-item ${activeView === 'tickets' ? 'active' : ''}`}
              onClick={() => setActiveView('tickets')}
            >
              <Ticket size={20} />
              <span>Tickets</span>
              {tickets.filter(t => t.status === 'Open').length > 0 && (
                <span className="mobile-nav-badge">{tickets.filter(t => t.status === 'Open').length}</span>
              )}
            </button>
            <button 
              className={`mobile-nav-item ${activeView === 'dashboard' ? 'active' : ''}`}
              onClick={() => setActiveView('dashboard')}
            >
              <LayoutDashboard size={20} />
              <span>Dashboard</span>
            </button>
            <button 
              className={`mobile-nav-item ${activeView === 'reports' ? 'active' : ''}`}
              onClick={() => setActiveView('reports')}
            >
              <BarChart3 size={20} />
              <span>Reports</span>
            </button>
          </>
        ) : (
          <>
            <button 
              className={`mobile-nav-item ${activeView === 'dashboard' ? 'active' : ''}`}
              onClick={() => setActiveView('dashboard')}
            >
              <LayoutDashboard size={20} />
              <span>Dashboard</span>
            </button>

            <button 
              className={`mobile-nav-item ${activeView === 'kanban' ? 'active' : ''}`}
              onClick={() => setActiveView('kanban')}
            >
              <Kanban size={20} />
              <span>Pipeline</span>
            </button>

            <button 
              className={`mobile-nav-item ${activeView === 'calendar' ? 'active' : ''}`}
              onClick={() => setActiveView('calendar')}
            >
              <CheckSquare size={20} />
              <span>Tasks</span>
              {overdueTasks.length > 0 && (
                <span className="mobile-nav-badge">{overdueTasks.length}</span>
              )}
            </button>

            <button 
              className={`mobile-nav-item ${activeView === 'invoices' ? 'active' : ''}`}
              onClick={() => setActiveView('invoices')}
            >
              <Receipt size={20} />
              <span>Billing</span>
            </button>

            <button 
              className={`mobile-nav-item ${activeView === 'settings' ? 'active' : ''}`}
              onClick={() => setActiveView('settings')}
            >
              <Settings size={20} />
              <span>Settings</span>
            </button>
          </>
        )}
      </nav>

      {/* Universal Workspace Destination Choice Modal */}
      <WorkspaceChoiceModal 
        isOpen={showWorkspaceChoiceModal}
        user={{
          name: currentUserContext.name,
          email: currentUserContext.email,
          role: currentUserContext.role,
          companyName: activeTenant?.name || 'Enterprise Cloud Workspace',
          avatar: currentUserContext.avatar
        }}
        onSelectCRM={() => {
          setActiveSuite('crm');
          setShowIntroLaunchpad(false);
          setShowWorkspaceChoiceModal(false);
          triggerToast("Welcome to ITLC Sales CRM!");
        }}
        onSelectHRMS={() => {
          setActiveSuite('hrms');
          setShowIntroLaunchpad(false);
          setShowWorkspaceChoiceModal(false);
          triggerToast("Welcome to OmniStaff HRMS!");
        }}
        onLogout={handleLogout}
        lang={lang}
      />

      {/* Real-Time Live Subscription, Storage Quota & Validity Modal */}
      <SubscriptionQuotaMeterModal 
        isOpen={showSubscriptionMeterModal}
        onClose={() => setShowSubscriptionMeterModal(false)}
        tenant={activeTenant}
        plans={livePlans}
        onUpgradeSuccess={(updatedTenant) => {
          setActiveTenant(updatedTenant);
          setTenants(tenants.map(t => t.id === updatedTenant.id ? updatedTenant : t));
          triggerToast(`Subscription updated to ${updatedTenant.planId.toUpperCase()}!`);
        }}
        lang={lang}
      />

      {/* Smart Automations & Growth Hub Modal (Salary Slips, WhatsApp Dispatch, GPS Geofence & EOD) */}
      <SmartAutomationsHubModal
        isOpen={showAutomationsModal}
        onClose={() => setShowAutomationsModal(false)}
        tenant={activeTenant}
        initialTab={automationInitialTab}
        lang={lang}
      />

    </div>
  );
}

export default App;
