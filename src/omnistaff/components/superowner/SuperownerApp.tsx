import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  LayoutDashboard, Building2, CreditCard, ListChecks, DollarSign, 
  BarChart3, Users, ShieldAlert, ToggleLeft, LifeBuoy, Activity, 
  Bell, Ticket, GitMerge, Lock, History, Settings, User, LogOut,
  Search, Keyboard, Zap, ChevronDown, ChevronRight, ChevronUp, Sparkles, CheckCircle2, 
  ArrowRight, X, AlertTriangle, Play, HelpCircle, Database, Sun, Moon,
  TrendingUp, Target, Receipt, CheckSquare, Briefcase, GripVertical, 
  RotateCcw, Layers, ArrowUpDown, Globe, LayoutTemplate, Image as ImageIcon,
  Phone, Palette
} from 'lucide-react';
import { useDashboard } from './context/DashboardContext';
import { api } from '../../services/api';

// Import HRMS Tab Components
import OverviewTab from './tabs/OverviewTab';
import CompaniesTab from './tabs/CompaniesTab';
import SubscriptionsTab from './tabs/SubscriptionsTab';
import PaymentsTab from './tabs/PaymentsTab';
import RevenueTab from './tabs/RevenueTab';
import FeatureManagementTab from './tabs/FeatureManagementTab';
import AnalyticsTab from './tabs/AnalyticsTab';
import NotificationsTab from './tabs/NotificationsTab';
import CouponsTab from './tabs/CouponsTab';
import SupportCenterTab from './tabs/SupportCenterTab';
import IntegrationsTab from './tabs/IntegrationsTab';
import SecurityTab from './tabs/SecurityTab';
import ActivityLogsTab from './tabs/ActivityLogsTab';
import SettingsTab from './tabs/SettingsTab';

// Import Landing Page CMS Component
import LandingSettingsTab from './tabs/LandingSettingsTab';

export interface SidebarItemDef {
  id: string;
  name: string;
  suite: 'hrms' | 'landing';
  icon: any;
}

export const HRMS_SIDEBAR_ITEMS: SidebarItemDef[] = [
  { id: 'hrms_dash', name: 'Dashboard', suite: 'hrms', icon: LayoutDashboard },
  { id: 'hrms_companies', name: 'Companies', suite: 'hrms', icon: Building2 },
  { id: 'hrms_subs', name: 'Subscriptions', suite: 'hrms', icon: CreditCard },
  { id: 'hrms_payments', name: 'Payments', suite: 'hrms', icon: DollarSign },
  { id: 'hrms_revenue', name: 'Revenue', suite: 'hrms', icon: BarChart3 },
  { id: 'hrms_features', name: 'Feature Management', suite: 'hrms', icon: ToggleLeft },
  { id: 'hrms_support', name: 'Support Center', suite: 'hrms', icon: LifeBuoy },
  { id: 'hrms_analytics', name: 'Analytics', suite: 'hrms', icon: Activity },
  { id: 'hrms_notifications', name: 'Notifications', suite: 'hrms', icon: Bell },
  { id: 'hrms_coupons', name: 'Coupons', suite: 'hrms', icon: Ticket },
  { id: 'hrms_integrations', name: 'Integrations', suite: 'hrms', icon: GitMerge },
  { id: 'hrms_security', name: 'Security', suite: 'hrms', icon: Lock },
];

export const LANDING_SIDEBAR_ITEMS: SidebarItemDef[] = [
  { id: 'landing_settings', name: 'Landing Page Settings', suite: 'landing', icon: Globe },
  { id: 'landing_showcase_images', name: 'Showcase Images & Sliders', suite: 'landing', icon: LayoutTemplate },
  { id: 'landing_reorder', name: 'Section Reorder & Layout', suite: 'landing', icon: GripVertical },
  { id: 'landing_contact', name: 'Contact & Touchpoints', suite: 'landing', icon: Phone },
  { id: 'landing_branding', name: 'Brand Styling & Theme', suite: 'landing', icon: Palette },
  { id: 'landing_hero', name: 'Hero Headline & Badges', suite: 'landing', icon: Sparkles }
];

const DEFAULT_SIDEBAR_ITEMS: SidebarItemDef[] = [
  ...HRMS_SIDEBAR_ITEMS,
  ...LANDING_SIDEBAR_ITEMS
];

export const App: React.FC<{ 
  onLogout?: () => void;
  onSwitchToCRM?: () => void;
  onOpenIntroHub?: () => void;
}> = ({ onLogout, onSwitchToCRM, onOpenIntroHub }) => {
  const {
    activeTab, setActiveTab,
    toasts, removeToast,
    showCommandPalette, setShowCommandPalette,
    impersonatedCompany, setImpersonatedCompany,
    addToast, addLog, companies, tickets,
    selectedCurrency, setSelectedCurrency,
    isFormDirty, setIsFormDirty, settings,
    theme, toggleTheme
  } = useDashboard();

  const [pendingTab, setPendingTab] = useState<string | null>(null);

  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [suiteFilter, setSuiteFilter] = useState<'all' | 'hrms' | 'landing'>('all');

  // Accordion Expand/Collapse States (with localStorage persistence)
  const [hrmsExpanded, setHrmsExpanded] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem('superowner_hrms_expanded');
      return saved !== null ? saved === 'true' : true;
    } catch {
      return true;
    }
  });

  const [landingExpanded, setLandingExpanded] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem('superowner_landing_expanded');
      return saved !== null ? saved === 'true' : true;
    } catch {
      return true;
    }
  });

  const toggleHrms = () => {
    setHrmsExpanded(prev => {
      const next = !prev;
      localStorage.setItem('superowner_hrms_expanded', String(next));
      return next;
    });
  };

  const toggleLanding = () => {
    setLandingExpanded(prev => {
      const next = !prev;
      localStorage.setItem('superowner_landing_expanded', String(next));
      return next;
    });
  };

  const handleExpandAll = () => {
    setHrmsExpanded(true);
    setLandingExpanded(true);
    localStorage.setItem('superowner_hrms_expanded', 'true');
    localStorage.setItem('superowner_landing_expanded', 'true');
    addToast('All suite modules expanded.', 'info');
  };

  const handleCollapseAll = () => {
    setHrmsExpanded(false);
    setLandingExpanded(false);
    localStorage.setItem('superowner_hrms_expanded', 'false');
    localStorage.setItem('superowner_landing_expanded', 'false');
    addToast('All suite modules collapsed.', 'info');
  };

  // Drag and Drop Sidebar State
  const [sidebarItems, setSidebarItems] = useState<SidebarItemDef[]>(() => {
    try {
      const saved = localStorage.getItem('superowner_sidebar_order_v2');
      if (saved) {
        const savedIds: string[] = JSON.parse(saved);
        const ordered = savedIds.map(id => DEFAULT_SIDEBAR_ITEMS.find(i => i.id === id)).filter(Boolean) as SidebarItemDef[];
        DEFAULT_SIDEBAR_ITEMS.forEach(d => {
          if (!ordered.find(o => o.id === d.id)) ordered.push(d);
        });
        return ordered;
      }
    } catch {}
    return DEFAULT_SIDEBAR_ITEMS;
  });

  const [draggedId, setDraggedId] = useState<string | null>(null);
  const [dragOverId, setDragOverId] = useState<string | null>(null);

  const handleDragStart = (e: React.DragEvent, id: string) => {
    setDraggedId(id);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent, id: string) => {
    e.preventDefault();
    if (draggedId === null || draggedId === id) return;
    setDragOverId(id);
  };

  const handleDrop = (e: React.DragEvent, targetId: string) => {
    e.preventDefault();
    if (!draggedId || draggedId === targetId) {
      setDraggedId(null);
      setDragOverId(null);
      return;
    }

    const fromIndex = sidebarItems.findIndex(i => i.id === draggedId);
    const toIndex = sidebarItems.findIndex(i => i.id === targetId);
    if (fromIndex === -1 || toIndex === -1) return;

    const updated = [...sidebarItems];
    const [moved] = updated.splice(fromIndex, 1);
    updated.splice(toIndex, 0, moved);

    setSidebarItems(updated);
    setDraggedId(null);
    setDragOverId(null);
    localStorage.setItem('superowner_sidebar_order_v2', JSON.stringify(updated.map(i => i.id)));
    addToast(`Sidebar reordered: "${moved.name}" moved.`, 'info');
  };

  const handleResetSidebar = () => {
    setSidebarItems(DEFAULT_SIDEBAR_ITEMS);
    localStorage.removeItem('superowner_sidebar_order_v2');
    addToast('Sidebar layout reset to default order.', 'info');
  };

  useEffect(() => {
    const media = window.matchMedia('(max-width: 768px)');
    setIsMobile(media.matches);
    const listener = (e) => setIsMobile(e.matches);
    media.addEventListener('change', listener);
    return () => media.removeEventListener('change', listener);
  }, []);

  const handleSetActiveTab = (tabName: string) => {
    if (isFormDirty) {
      setPendingTab(tabName);
    } else {
      setActiveTab(tabName);
    }
    setMobileSidebarOpen(false);
  };

  // Collapsed states
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [quickActionsOpen, setQuickActionsOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  // Command Palette states
  const [cpSearch, setCpSearch] = useState('');

  // Lockscreen simulation state
  const [isLocked, setIsLocked] = useState(false);
  const [passwordInput, setPasswordInput] = useState('');
  const [profile, setProfile] = useState<any>(null);

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const prof = await api.getProfile();
        setProfile(prof);
      } catch (err) {
        console.error("Failed to load Super Owner profile:", err);
      }
    };
    loadProfile();
  }, []);

  // Filtered Suite Items for Accordion
  const hrmsItems = useMemo(() => {
    return sidebarItems.filter(item => item.suite === 'hrms');
  }, [sidebarItems]);

  const landingItems = useMemo(() => {
    return sidebarItems.filter(item => item.suite === 'landing');
  }, [sidebarItems]);

  const displayedSidebarItems = useMemo(() => {
    if (suiteFilter === 'all') return sidebarItems;
    return sidebarItems.filter(item => item.suite === suiteFilter);
  }, [sidebarItems, suiteFilter]);

  // Render tab helper
  const renderTabContent = () => {
    switch (activeTab) {
      // 🏢 HRMS Suite Tabs
      case 'Dashboard': return <OverviewTab />;
      case 'Companies': return <CompaniesTab />;
      case 'Subscriptions': return <SubscriptionsTab />;
      case 'Payments': return <PaymentsTab />;
      case 'Revenue': return <RevenueTab />;
      case 'Feature Management': return <FeatureManagementTab />;
      case 'Support Center': return <SupportCenterTab />;
      case 'Analytics': return <AnalyticsTab />;
      case 'Notifications': return <NotificationsTab />;
      case 'Coupons': return <CouponsTab />;
      case 'Integrations': return <IntegrationsTab />;
      case 'Security': return <SecurityTab />;
      case 'Activity Logs': return <ActivityLogsTab />;
      case 'Settings': case 'HRMS Settings': return <SettingsTab />;

      // 🌐 Landing Page & Website CMS Tabs
      case 'Showcase Images & Sliders':
      case 'landing_showcase_images':
        return <LandingSettingsTab onOpenIntroHub={onOpenIntroHub} initialSubTab="showcase_images" />;

      case 'Section Reorder & Layout':
      case 'landing_reorder':
        return <LandingSettingsTab onOpenIntroHub={onOpenIntroHub} initialSubTab="sections" />;

      case 'Contact & Touchpoints':
      case 'landing_contact':
        return <LandingSettingsTab onOpenIntroHub={onOpenIntroHub} initialSubTab="contact" />;

      case 'Brand Styling & Theme':
      case 'Branding & Theme':
      case 'landing_branding':
        return <LandingSettingsTab onOpenIntroHub={onOpenIntroHub} initialSubTab="branding" />;

      case 'Hero Headline & Badges':
      case 'landing_hero':
        return <LandingSettingsTab onOpenIntroHub={onOpenIntroHub} initialSubTab="hero" />;

      case 'Landing Page Settings':
      case 'Landing Page CMS':
      case 'Landing Settings':
      case 'landing_settings':
        return <LandingSettingsTab onOpenIntroHub={onOpenIntroHub} initialSubTab="sections" />;

      default: return <OverviewTab />;
    }
  };

  // Command palette search results
  const cpResults = useMemo(() => {
    if (!cpSearch.trim()) return [];
    const searchLower = cpSearch.toLowerCase();
    
    const results: Array<{ type: 'nav' | 'action' | 'company', title: string, sub: string, payload?: any }> = [];

    // Match Navigation
    sidebarItems.forEach(item => {
      if (item.name.toLowerCase().includes(searchLower)) {
        results.push({ type: 'nav', title: `Go to ${item.name}`, sub: 'Navigate to section' });
      }
    });

    // Match Actions
    const actions = [
      { title: 'Trigger Database Backup', sub: 'Runs full snapshot backup', payload: 'backup' },
      { title: 'Create Promo Coupon', sub: 'Opens coupons creation modal', payload: 'coupon' },
      { title: 'Add New Company Tenant', sub: 'Opens company onboarding modal', payload: 'company' },
      { title: 'Send System Broadcast Notice', sub: 'Dispatches Email/SMS alerts', payload: 'notify' }
    ];
    actions.forEach(act => {
      if (act.title.toLowerCase().includes(searchLower)) {
        results.push({ type: 'action', title: act.title, sub: act.sub, payload: act.payload });
      }
    });

    // Match Companies
    companies.forEach(c => {
      if (c.name.toLowerCase().includes(searchLower)) {
        results.push({ type: 'company', title: `Login as ${c.name}`, sub: 'Impersonate client admin workspace', payload: c });
      }
    });

    return results.slice(0, 5);
  }, [cpSearch, companies]);

  // Execute Command Palette click
  const handleCpExecute = (res: any) => {
    setShowCommandPalette(false);
    setCpSearch('');

    if (res.type === 'nav') {
      const tabName = res.title.replace('Go to ', '');
      handleSetActiveTab(tabName);
      addToast(`Navigated to ${tabName}`, 'info');
    } else if (res.type === 'action') {
      if (res.payload === 'backup') {
        handleSetActiveTab('Settings');
        addToast('Settings tab opened. Click "Trigger Manual Backup" to run.', 'info');
      } else if (res.payload === 'coupon') {
        handleSetActiveTab('Coupons');
        addToast('Coupon Management opened. Click "Create Coupon" to start.', 'info');
      } else if (res.payload === 'company') {
        handleSetActiveTab('Companies');
        addToast('Companies tab opened. Click "Add Company" to start.', 'info');
      } else if (res.payload === 'notify') {
        handleSetActiveTab('Notifications');
        addToast('Notifications center opened. Write message in dispatcher.', 'info');
      }
    } else if (res.type === 'company') {
      setImpersonatedCompany(res.payload);
      addToast(`Logged in as Admin for ${res.payload.name}`, 'info');
      addLog('Impersonated Login', `Logged in as Company Admin for ${res.payload.name} via Command Palette.`, 'security');
    }
  };

  const handleUnlock = (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordInput === 'admin' || passwordInput === '') {
      setIsLocked(false);
      setPasswordInput('');
      addToast('Welcome back, Priya!', 'success');
      addLog('Admin Unlocked Screen', 'Super admin unlocked control screen.', 'security');
    } else {
      addToast('Invalid credential token. (Tip: leave blank or use "admin")', 'error');
    }
  };

  if (isLocked) {
    return (
      <div className="fixed inset-0 z-50 bg-dark flex flex-col items-center justify-center p-4">
        {/* Glowing Background Grid */}
        <div className="absolute inset-0 bg-radial-glow from-indigo-500/5 via-transparent to-transparent blur-3xl pointer-events-none"></div>
        
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="glass-card w-full max-w-sm p-8 rounded-3xl space-y-6 text-center"
        >
          <div className="h-14 w-14 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center mx-auto text-indigo-400 animate-pulse-slow">
            <Lock className="h-6 w-6" />
          </div>

          <div>
            <h2 className="text-xl font-bold text-white">System Screen Locked</h2>
            <p className="text-xs text-slate-400 mt-1">Super Owner session locked for {profile?.name || 'Super Owner'}</p>
          </div>

          <form onSubmit={handleUnlock} className="space-y-4">
            <input
              type="password"
              placeholder="Enter password credential (or hit Enter)..."
              value={passwordInput}
              onChange={(e) => setPasswordInput(e.target.value)}
              className="glass-input w-full px-4 py-2 rounded-xl text-xs text-center text-slate-200 placeholder-slate-500"
            />
            <button
              type="submit"
              className="w-full py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-xs font-semibold text-white transition shadow-lg shadow-indigo-600/30"
            >
              Unlock Terminal Screen
            </button>
          </form>
        </motion.div>
      </div>
    );
  }

  return (
    <div className={`superowner-root ${theme} h-screen w-screen ${theme === 'dark' ? 'dark bg-slate-950 text-slate-100' : 'light bg-slate-50 text-slate-900'} flex relative overflow-hidden transition-colors duration-300`}>
      {/* Noise tactile texture overlay */}
      <div className="noise-overlay"></div>

      {/* Moving gradient mesh & floating blurred glow lights */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[10%] left-[20%] w-[35rem] h-[35rem] rounded-full bg-indigo-500/10 blur-[120px] animate-mesh-float-1"></div>
        <div className="absolute bottom-[20%] right-[10%] w-[40rem] h-[40rem] rounded-full bg-purple-500/8 blur-[150px] animate-mesh-float-2"></div>
        <div className="absolute top-[40%] right-[30%] w-[30rem] h-[30rem] rounded-full bg-cyan-500/8 blur-[100px] animate-mesh-float-3"></div>
      </div>
      
      {/* Impersonation top notification banner */}
      <AnimatePresence>
        {impersonatedCompany && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="fixed top-0 inset-x-0 z-50 bg-gradient-to-r from-purple-600 to-indigo-600 border-b border-indigo-500/30 text-white py-2 px-4 text-xs font-semibold flex items-center justify-between shadow-lg"
          >
            <span className="flex items-center gap-1.5"><AlertTriangle className="h-4 w-4 animate-bounce" /> Impersonating Client Workspace Admin for: <span className="underline">{impersonatedCompany.name}</span></span>
            <button
              onClick={() => {
                setImpersonatedCompany(null);
                addToast('Returned to Super Owner workspace', 'info');
              }}
              className="px-2.5 py-0.5 rounded bg-white/10 hover:bg-white/20 border border-white/20 text-[10px] font-bold tracking-wider uppercase transition"
            >
              Exit Impersonation
            </button>
          </motion.div>
        )}
      </AnimatePresence>
 
       {/* Backdrop overlay for mobile drawer */}
       {isMobile && mobileSidebarOpen && (
         <div
           className="fixed inset-0 z-30 bg-black/60 backdrop-blur-xs md:hidden"
           onClick={() => setMobileSidebarOpen(false)}
         />
       )}

       {/* Sidebar Navigation */}
       <aside 
         className={`fixed md:relative top-0 bottom-0 md:h-screen left-0 z-40 md:z-auto transition-all duration-300 border-r border-slate-200/80 bg-white ${mobileSidebarOpen ? 'flex' : 'hidden md:flex'} flex-col justify-between ${impersonatedCompany ? 'pt-8' : ''} ${mobileSidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'} ${sidebarOpen ? 'w-64' : 'w-64 md:w-20'}`}
       >
         <div className="flex-1 flex flex-col min-h-0">
           {/* Logo Brand */}
           <div className="p-5 flex items-center gap-3 border-b border-slate-200/80">
             <div className="h-10 w-10 rounded-xl bg-indigo-600 flex items-center justify-center font-medium text-white shadow-xs shrink-0 text-lg">
               S
             </div>
             {(isMobile || sidebarOpen) && (
               <div>
                 <span className="font-semibold text-slate-800 tracking-wide block leading-tight text-sm">SUPEROWNER</span>
                 <span className="font-semibold text-slate-800 tracking-wide block leading-tight text-sm">HRMS</span>
                 <span className="text-[9px] font-normal text-slate-400 mt-0.5 block tracking-widest uppercase">ADMIN OPERATIONS</span>
               </div>
             )}
           </div>

           {/* Navigation Links list */}
           <nav className="flex-1 px-3 py-3 space-y-4 overflow-y-auto">
             {/* 🏢 HRMS Operations Section */}
             <div className="space-y-1">
               {HRMS_SIDEBAR_ITEMS.map((item) => {
                 const isActive = activeTab === item.name || (item.name === 'Dashboard' && activeTab === 'hrms_dash');
                 return (
                   <button
                     key={item.id}
                     onClick={() => handleSetActiveTab(item.name)}
                     className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl transition text-xs cursor-pointer ${
                       isActive 
                         ? 'bg-indigo-50 text-indigo-600 font-medium shadow-2xs' 
                         : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50 font-normal'
                     }`}
                   >
                     <item.icon className={`h-4.5 w-4.5 shrink-0 ${
                       isActive ? 'text-indigo-600' : 'text-slate-500'
                     }`} />
                     {(isMobile || sidebarOpen) && (
                       <span className="truncate">{item.name}</span>
                     )}
                   </button>
                 );
               })}
             </div>

              {/* 🌐 LANDING PAGE SETTINGS SECTION (Directly under Security) */}
              <div className="pt-3 border-t border-slate-100 space-y-1">
                {(isMobile || sidebarOpen) && (
                  <div className="px-3.5 py-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                    <Globe className="h-3.5 w-3.5 text-indigo-600" />
                    <span>Landing Page Settings</span>
                  </div>
                )}
                {LANDING_SIDEBAR_ITEMS.map((item) => {
                  const isActive = 
                    activeTab === item.name || 
                    (item.name === 'Landing Page Settings' && (activeTab === 'Landing Settings' || activeTab === 'landing_settings' || activeTab === 'Landing Page CMS'));
                  return (
                    <button
                      key={item.id}
                      onClick={() => handleSetActiveTab(item.name)}
                      className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl transition text-xs cursor-pointer ${
                        isActive 
                          ? 'bg-indigo-50 text-indigo-600 font-medium shadow-2xs' 
                          : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50 font-normal'
                      }`}
                    >
                      <item.icon className={`h-4.5 w-4.5 shrink-0 ${
                        isActive ? 'text-indigo-600' : 'text-slate-500'
                      }`} />
                      {(isMobile || sidebarOpen) && (
                        <span className="truncate">{item.name}</span>
                      )}
                    </button>
                  );
                })}
              </div>
            </nav>
          </div>

          {/* Footer profile / logout */}
          <div className="p-3 border-t border-slate-200/80 space-y-1">
            <button
              onClick={() => handleSetActiveTab('Dashboard')}
              className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-slate-700 hover:text-slate-900 hover:bg-slate-50 transition text-xs font-normal cursor-pointer"
            >
              <User className="h-4.5 w-4.5 shrink-0 text-slate-500" />
              {(isMobile || sidebarOpen) && <span className="truncate">ITLC HRMS</span>}
            </button>

            <button
              onClick={() => onLogout ? onLogout() : setIsLocked(true)}
              className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-slate-700 hover:text-rose-600 hover:bg-rose-50 transition text-xs font-normal cursor-pointer"
            >
              <LogOut className="h-4.5 w-4.5 shrink-0 text-slate-500" />
              {(isMobile || sidebarOpen) && <span>Log Out</span>}
            </button>
         </div>
       </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0 bg-[#f8fafc]">
        
        <header className={`h-16 shrink-0 border-b border-slate-200/80 bg-white px-6 flex justify-between items-center z-30 ${impersonatedCompany ? 'mt-8' : ''}`}>
          
          {/* Collapsible toggle & Search */}
          <div className="flex items-center gap-4 flex-1">
            <button 
              onClick={() => isMobile ? setMobileSidebarOpen(!mobileSidebarOpen) : setSidebarOpen(!sidebarOpen)}
              className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-700 transition cursor-pointer"
            >
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>

            {/* Global Search / Command palette activator */}
            <div 
              onClick={() => setShowCommandPalette(true)}
              className="relative max-w-sm w-full cursor-pointer hidden sm:block group"
            >
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400 group-hover:text-slate-600 transition" />
              <div className="pl-9 pr-12 py-1.5 rounded-xl text-xs text-slate-400 select-none flex justify-between items-center w-full border border-slate-200/80 bg-slate-50/50 hover:bg-white hover:border-slate-300 transition shadow-2xs font-normal">
                <span>Search settings, actions...</span>
                <span className="flex items-center gap-0.5 border border-slate-200 px-1.5 py-0.5 rounded text-[9px] font-medium font-mono bg-white text-slate-500 uppercase shadow-2xs">
                  ⌘ CTRL K
                </span>
              </div>
            </div>
          </div>

          {/* Quick Actions & notifications & profile menu */}
          <div className="flex items-center gap-3">
            {/* Country Currency Selector */}
            <div className="relative">
              <select
                value={selectedCurrency}
                onChange={(e) => {
                  setSelectedCurrency(e.target.value);
                  addToast(`Payment currency set to ${e.target.value}`, 'success');
                }}
                className="px-3 py-1.5 rounded-xl text-xs text-slate-700 font-medium bg-white cursor-pointer border border-slate-200 hover:border-slate-300 transition shadow-2xs focus:outline-none"
              >
                <option value="INR">🇮🇳 INR (₹)</option>
                <option value="USD">🇺🇸 USD ($)</option>
                <option value="EUR">🇪🇺 EUR (€)</option>
                <option value="GBP">🇬🇧 GBP (£)</option>
                <option value="CAD">🇨🇦 CAD (CA$)</option>
                <option value="AUD">🇦🇺 AUD (A$)</option>
                <option value="JPY">🇯🇵 JPY (¥)</option>
              </select>
            </div>

            {/* Quick Actions menu */}
            <div className="relative">
              <button
                onClick={() => setQuickActionsOpen(!quickActionsOpen)}
                className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-medium rounded-xl bg-purple-50/40 hover:bg-purple-50 text-purple-600 transition shadow-2xs border border-purple-200 cursor-pointer"
              >
                <Zap className="h-3.5 w-3.5 text-purple-600 fill-purple-600" /> Quick Actions <ChevronDown className="h-3 w-3 text-purple-400" />
              </button>
              
              <AnimatePresence>
                {quickActionsOpen && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setQuickActionsOpen(false)}></div>
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      className="absolute right-0 mt-2 w-64 bg-white border border-slate-200 rounded-2xl p-2 z-50 shadow-2xl text-sm"
                    >
                      <button 
                        onClick={() => { setQuickActionsOpen(false); handleSetActiveTab('Companies'); }}
                        className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-slate-50 text-slate-700 hover:text-indigo-600 transition font-medium text-left text-xs cursor-pointer"
                      >
                        <Building2 className="h-4.5 w-4.5 text-indigo-500 shrink-0" />
                        <span>Register New Tenant Company</span>
                      </button>
                      <button 
                        onClick={() => { setQuickActionsOpen(false); handleSetActiveTab('Notifications'); }}
                        className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-slate-50 text-slate-700 hover:text-indigo-600 transition font-medium text-left text-xs cursor-pointer"
                      >
                        <Bell className="h-4.5 w-4.5 text-indigo-500 shrink-0" />
                        <span>Broadcast SMTP Notice Alert</span>
                      </button>
                      <button 
                        onClick={() => { setQuickActionsOpen(false); handleSetActiveTab('Coupons'); }}
                        className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-slate-50 text-slate-700 hover:text-indigo-600 transition font-medium text-left text-xs cursor-pointer"
                      >
                        <Ticket className="h-4.5 w-4.5 text-indigo-500 shrink-0" />
                        <span>Add Promotion Discount Code</span>
                      </button>
                      <button 
                        onClick={() => { setQuickActionsOpen(false); handleSetActiveTab('Settings'); }}
                        className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-slate-50 text-slate-700 hover:text-indigo-600 transition font-medium text-left text-xs cursor-pointer"
                      >
                        <Database className="h-4.5 w-4.5 text-indigo-500 shrink-0" />
                        <span>Trigger Database S3 Backup</span>
                      </button>
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
            </div>

            {/* Notification Drawer activator */}
            <div className="relative">
              <button
                onClick={() => setNotificationsOpen(!notificationsOpen)}
                className="p-2 rounded-xl hover:bg-slate-100 text-slate-600 hover:text-slate-900 transition relative cursor-pointer"
              >
                <Bell className="h-4.5 w-4.5" />
                <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-indigo-500"></span>
              </button>
              
              <AnimatePresence>
                {notificationsOpen && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setNotificationsOpen(false)}></div>
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      className="absolute right-0 mt-2 w-64 bg-white border border-slate-200 rounded-xl p-4 z-50 text-xs shadow-xl space-y-3"
                    >
                      <span className="font-bold text-slate-900 block">Recent Platform Events</span>
                      <div className="space-y-2.5">
                        {(() => {
                          const platformEvents = [];
                          companies.slice(0, 2).forEach(c => {
                            platformEvents.push({
                              id: `company-${c.id}`,
                              title: "New tenant registered",
                              message: `${c.name} (Owner: ${c.ownerName})`,
                              color: "bg-emerald-500"
                            });
                          });
                          tickets.filter(t => t.status === 'open').slice(0, 2).forEach(t => {
                            platformEvents.push({
                              id: `ticket-${t.id}`,
                              title: "Support ticket opened",
                              message: `"${t.subject}"`,
                              color: "bg-amber-500"
                            });
                          });
                          if (platformEvents.length === 0) {
                            return <div className="text-[10px] text-slate-500 text-center py-2">No recent platform events</div>;
                          }
                          return platformEvents.map((evt, idx) => (
                            <div key={idx} className="flex gap-2">
                              <div className={`h-1.5 w-1.5 rounded-full ${evt.color} mt-1.5 shrink-0`}></div>
                              <div>
                                <span className="font-semibold text-slate-800 block">{evt.title}</span>
                                <span className="text-[10px] text-slate-500">{evt.message}</span>
                              </div>
                            </div>
                          ));
                        })()}
                      </div>
                      <button 
                        onClick={() => { setNotificationsOpen(false); handleSetActiveTab('Activity Logs'); }}
                        className="w-full text-center py-1 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded text-[10px] font-semibold text-slate-600 hover:text-slate-900 transition block"
                      >
                        Open Telemetry Logs
                      </button>
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
            </div>
          </div>
        </header>

        {/* Dynamic active view panel */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 md:p-8 pb-16 md:pb-24 z-10 relative">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.2 }}
            className="w-full"
          >
            {renderTabContent()}
          </motion.div>
        </div>
      </main>

      {/* Global Toast Alert Box */}
      <div className="fixed bottom-6 right-6 z-50 space-y-3 pointer-events-none">
        <AnimatePresence>
          {toasts.map((toast) => (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.95 }}
              className={`p-4 rounded-xl border shadow-xl flex items-center gap-3 text-xs font-bold pointer-events-auto min-w-[280px] ${
                toast.type === 'success' ? 'bg-emerald-600 border-emerald-500 text-white shadow-lg shadow-emerald-600/20' :
                toast.type === 'error' ? 'bg-rose-600 border-rose-500 text-white shadow-lg shadow-rose-600/20' :
                toast.type === 'warning' ? 'bg-amber-600 border-amber-500 text-white shadow-lg shadow-amber-600/20' :
                toast.type === 'info' ? 'bg-indigo-600 border-indigo-500 text-white shadow-lg shadow-indigo-600/20' :
                'bg-slate-950 border-white/10 text-white shadow-lg'
              }`}
            >
              {toast.type === 'success' && <CheckCircle2 className="h-4.5 w-4.5 text-white shrink-0" />}
              {toast.type === 'error' && <AlertTriangle className="h-4.5 w-4.5 text-white shrink-0" />}
              {toast.type === 'warning' && <AlertTriangle className="h-4.5 w-4.5 text-white shrink-0" />}
              {toast.type === 'info' && <Sparkles className="h-4.5 w-4.5 text-white shrink-0" />}
              
              <span className="flex-1 leading-normal">{toast.message}</span>
              <button 
                onClick={() => removeToast(toast.id)}
                className="opacity-60 hover:opacity-100 transition p-0.5 rounded hover:bg-white/5"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Global Command Palette dialog (Ctrl + K) */}
      <AnimatePresence>
        {showCommandPalette && (
          <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/60 backdrop-blur-sm p-4 pt-[15vh]">
            <div className="fixed inset-0" onClick={() => setShowCommandPalette(false)}></div>
            <motion.div
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -20, opacity: 0 }}
              className="glass-card w-full max-w-lg rounded-2xl overflow-hidden shadow-2xl relative z-10"
            >
              {/* Input */}
              <div className="relative border-b border-white/5 p-4">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input
                  type="text"
                  autoFocus
                  placeholder="Type a command, navigate sections, or login to a client..."
                  value={cpSearch}
                  onChange={(e) => setCpSearch(e.target.value)}
                  className="w-full bg-transparent border-0 pl-8 pr-12 text-sm text-slate-200 focus:outline-none placeholder-slate-500"
                />
                <button 
                  onClick={() => setShowCommandPalette(false)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] text-slate-500 border border-white/10 px-1.5 py-0.5 rounded font-mono uppercase bg-white/2"
                >
                  Esc
                </button>
              </div>

              {/* Search Results list */}
              <div className="max-h-[300px] overflow-y-auto p-2">
                {cpResults.length === 0 ? (
                  <div className="py-8 text-center text-xs text-slate-500">
                    {cpSearch.trim() ? 'No commands or companies matched.' : 'Type to search platform settings or tenants...'}
                  </div>
                ) : (
                  <div className="space-y-1">
                    <span className="text-[9px] text-slate-500 font-bold uppercase tracking-wider px-2 block mb-1">Matching Controls</span>
                    {cpResults.map((res: any, idx: number) => (
                      <div
                        key={idx}
                        onClick={() => handleCpExecute(res)}
                        className="p-3.5 rounded-xl hover:bg-white/5 cursor-pointer flex justify-between items-center text-xs text-slate-200 transition"
                      >
                        <div className="space-y-0.5">
                          <span className="font-semibold block text-slate-200">{res.title}</span>
                          <span className="text-[10px] text-slate-500 block leading-normal">{res.sub}</span>
                        </div>
                        <span className="text-[10px] font-semibold text-indigo-400 capitalize font-mono">{res.type}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Footer hotkeys */}
              <div className="p-3.5 bg-white/1 border-t border-white/5 flex justify-between items-center text-[10px] text-slate-500 font-mono">
                <span>↑↓ navigate</span>
                <span>⏎ select</span>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Admin Profile Details modal */}
      <AnimatePresence>
        {profileOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <div className="fixed inset-0" onClick={() => setProfileOpen(false)}></div>
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="glass-card w-full max-w-sm p-6 rounded-2xl relative z-10 space-y-6 overflow-hidden"
            >
              <div className="absolute top-0 right-0 h-32 w-32 bg-indigo-500/10 blur-2xl pointer-events-none"></div>
              
              <button 
                onClick={() => setProfileOpen(false)}
                className="absolute top-4 right-4 p-1 rounded hover:bg-white/5 text-slate-400 hover:text-white"
              >
                <X className="h-4 w-4" />
              </button>

              <div className="text-center space-y-3">
                <div className="h-16 w-16 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-600 flex items-center justify-center font-bold text-white text-xl mx-auto shadow-md">
                  {profile?.name ? profile.name.split(' ').map((n: any) => n[0]).join('').toUpperCase() : 'SO'}
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white leading-none">{profile?.name || 'Super Owner'}</h3>
                  <span className="text-xs text-indigo-400 font-semibold mt-1.5 inline-block">Platform Super Owner</span>
                </div>
              </div>

              <div className="space-y-3.5 border-t border-white/5 pt-4 text-xs font-bold">
                <div className="flex justify-between text-slate-400">
                  <span>Profile Status</span>
                  <span className="font-extrabold text-emerald-400 flex items-center gap-1"><CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" /> Active Verified</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Registered Email</span>
                  <span className="font-bold text-slate-200 font-mono">{profile?.email || 'admin@superowner.io'}</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Active Workspaces</span>
                  <span className="font-bold text-slate-200">SUPEROWNER Core</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>MFA Token Authorization</span>
                  <span className="font-bold text-slate-200 font-mono">Authy OTP Active</span>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Leave Page Confirmation Modal */}
      <AnimatePresence>
        {pendingTab && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="glass-card w-full max-w-sm p-6 rounded-2xl space-y-4 relative overflow-hidden border border-white/10"
            >
              <div className="absolute top-0 right-0 h-32 w-32 bg-indigo-500/10 blur-2xl pointer-events-none"></div>
              
              <div className="flex items-center gap-3 text-amber-400">
                <AlertTriangle className="h-6 w-6 shrink-0" />
                <h3 className="text-lg font-bold text-white">Unsaved Changes</h3>
              </div>
              
              <p className="text-xs text-slate-300 leading-relaxed">
                You have unsaved changes in your form. Are you sure you want to discard them and leave this page?
              </p>
              
              <div className="flex justify-end gap-3 pt-2">
                <button
                  onClick={() => setPendingTab(null)}
                  className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 text-xs font-semibold border border-slate-200/20 dark:border-white/10 transition"
                >
                  Stay & Complete
                </button>
                <button
                  onClick={() => {
                    setIsFormDirty(false);
                    setActiveTab(pendingTab);
                    setPendingTab(null);
                  }}
                  className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold transition shadow-md shadow-rose-600/20"
                >
                  Discard & Leave
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
};
export default App;
