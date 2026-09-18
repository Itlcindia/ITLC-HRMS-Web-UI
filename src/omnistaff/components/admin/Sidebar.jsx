import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  LayoutDashboard, Users, Building2, Briefcase, 
  CalendarCheck, CalendarX, CreditCard, FileUser, 
  TrendingUp, GraduationCap, Laptop, BarChart3, 
  BellRing, BadgePercent, Settings, ShieldAlert, Wallet,
  HeartHandshake, LogOut, ChevronLeft, ChevronRight, ChevronDown
} from 'lucide-react';

const menuItems = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { 
    id: 'people', 
    label: 'People', 
    icon: Users,
    subItems: [
      { id: 'employees', label: 'Employee Directory' },
      { id: 'employee-profile', label: 'Employee' },
      { id: 'departments', label: 'Departments' },
      { id: 'designations', label: 'Designations' },
      { id: 'organization', label: 'Organization' },
    ]
  },
  {
    id: 'attendance',
    label: 'Attendance',
    icon: CalendarCheck,
    subItems: [
      { id: 'attendance-dashboard', label: 'Dashboard' },
      { id: 'attendance-logs', label: 'Daily Logs' },
      { id: 'attendance-corrections', label: 'Correction Requests' },
      { id: 'attendance-grid', label: 'Monthly Grid' },
      { id: 'attendance-my', label: 'My Attendance' },
      { id: 'attendance-shift', label: 'Shift Setup' },
      { id: 'attendance-reports', label: 'Reports' },
    ]
  },
  {
    id: 'leave',
    label: 'Leave Management',
    icon: CalendarX,
    subItems: [
      { id: 'leave-dashboard', label: 'Dashboard' },
      { id: 'leave-request', label: 'Leave Request' },
      { id: 'leave-my', label: 'My Leave' },
      { id: 'leave-policies', label: 'Policies Setup' },
      { id: 'leave-calendar', label: 'Leave Calendar' },
      { id: 'leave-reports', label: 'Reports' },
    ]
  },
  {
    id: 'payroll',
    label: 'Payroll',
    icon: CreditCard,
    subItems: [
      { id: 'payroll-dashboard', label: 'Dashboard' },
      { id: 'payroll-structures', label: 'Salary Structures' },
      { id: 'payroll-run', label: 'Run Payroll' },
      { id: 'payroll-payslips', label: 'Payslips Console' },
      { id: 'payroll-compliance', label: 'Statutory Compliance' },
      { id: 'payroll-reimbursements', label: 'Reimbursements' },
      { id: 'payroll-reports', label: 'Reports & Export' },
    ]
  },
  {
    id: 'recruitment',
    label: 'Recruitment',
    icon: FileUser,
    subItems: [
      { id: 'recruitment-dashboard', label: 'Dashboard' },
      { id: 'recruitment-openings', label: 'Job Openings' },
      { id: 'recruitment-candidates', label: 'Candidates' },
      { id: 'recruitment-interview', label: 'Interview' },
      { id: 'recruitment-offers', label: 'Offer Letters' },
      { id: 'recruitment-onboarding', label: 'Onboarding Wizard' },
    ]
  },
  {
    id: 'expenses',
    label: 'Expenses',
    icon: Wallet, // Wallet icon mapped for Expenses
    subItems: [
      { id: 'expenses-dashboard', label: 'Dashboard' },
      { id: 'expenses-my', label: 'My Expenses' },
      { id: 'expenses-create', label: 'Create Expense' },
      { id: 'expenses-approvals', label: 'Approvals' },
      { id: 'expenses-categories', label: 'Categories' },
      { id: 'expenses-reports', label: 'Reports' },
      { id: 'expenses-settings', label: 'Settings' },
    ]
  },
  {
    id: 'performance',
    label: 'Performance',
    icon: TrendingUp,
    subItems: [
      { id: 'performance-dashboard', label: 'Dashboard' },
      { id: 'performance-goals', label: 'Goals' },
      { id: 'performance-kpis', label: 'KPIs Target' },
      { id: 'performance-cycles', label: 'Review Cycles' },
      { id: 'performance-appraisals', label: 'Appraisals' },
      { id: 'performance-feedback', label: '360 Feedback' },
      { id: 'performance-reports', label: 'Reports' },
    ]
  },
  {
    id: 'assets',
    label: 'Assets',
    icon: Laptop,
    subItems: [
      { id: 'assets-inventory', label: 'Inventory' },
      { id: 'assets-allocate', label: 'Allocate Asset' },
      { id: 'assets-requests', label: 'Asset Requests' },
      { id: 'assets-maintenance', label: 'Maintenance' },
      { id: 'assets-reports', label: 'Reports' },
      { id: 'assets-settings', label: 'Settings' },
    ]
  },
  { id: 'training', label: 'Training', icon: GraduationCap },
  { id: 'reports', label: 'Reports', icon: BarChart3 },
  { id: 'notifications', label: 'Notifications', icon: BellRing },
  { id: 'settings', label: 'Company Settings', icon: Settings },
  { id: 'security', label: 'Security', icon: ShieldAlert },
  { id: 'subscription', label: 'Subscription & Billing', icon: CreditCard },
  { id: 'support', label: 'Support', icon: HeartHandshake },
];

export default function Sidebar({ 
  activeTab, 
  setActiveTab, 
  collapsed, 
  setCollapsed, 
  handleLogout, 
  mobileOpen, 
  setMobileOpen, 
  companyName, 
  companyLogo, 
  featureFlags = {}, 
  subscriptionPlanId, 
  onSwitchToCRM,
  isSubscriptionActive = true,
  onOpenSubscriptionModal
}) {
  const [expandedMenus, setExpandedMenus] = useState({});
  const [isMobile, setIsMobile] = useState(false);

  const isLocked = (itemId) => {
    if (itemId === 'dashboard' || itemId === 'subscription') return false;
    if (isSubscriptionActive === false) return true;
    if (!subscriptionPlanId) return false;
    const plan = subscriptionPlanId.toLowerCase();
    if (plan === 'enterprise' || plan === 'business') return false;

    if (plan === 'free_trial' || plan === 'trial' || plan === 'starter' || plan === 'none' || plan === 'unselected') {
      if (['recruitment', 'performance', 'training'].includes(itemId)) return true;
    }
    if (plan === 'free_trial' || plan === 'trial' || plan === 'none' || plan === 'unselected') {
      if (['payroll', 'expenses'].includes(itemId)) return true;
    }
    return false;
  };

  const isSubItemLocked = (itemId, subItemId) => {
    if (isSubscriptionActive === false) return true;
    if (!subscriptionPlanId) return false;
    const plan = subscriptionPlanId.toLowerCase();
    if (plan === 'enterprise' || plan === 'business') return false;

    if (itemId === 'payroll') {
      if (plan === 'starter' || plan === 'free_trial' || plan === 'trial' || plan === 'unselected') {
        return ['payroll-structures', 'payroll-compliance'].includes(subItemId);
      }
    }
    return false;
  };

  useEffect(() => {
    const media = window.matchMedia('(max-width: 768px)');
    setIsMobile(media.matches);
    const listener = (e) => setIsMobile(e.matches);
    media.addEventListener('change', listener);
    return () => media.removeEventListener('change', listener);
  }, []);

  const rawVisibleMenuItems = menuItems.filter(item => {
    const mapping = {
      dashboard: 'dashboard',
      attendance: 'attendance',
      leave: 'leave',
      payroll: 'payroll',
      expenses: 'expenses',
      assets: 'assets',
      training: 'training',
      recruitment: 'recruitment',
      performance: 'performance'
    };

    const configKey = mapping[item.id] || item.id;
    if (featureFlags && featureFlags[configKey] === false) {
      return false;
    }

    return true;
  });

  const visibleMenuItems = isMobile
    ? rawVisibleMenuItems.filter(item => ['attendance', 'settings', 'payroll'].includes(item.id))
    : rawVisibleMenuItems;

  useEffect(() => {
    console.log("=== SIDEBAR DIAGNOSTICS ===");
    console.log("RECEIVED FEATURE FLAGS:", featureFlags);
    console.log("VISIBLE MENU ITEMS:", visibleMenuItems.map(m => m.id));
  }, [featureFlags]);

  // Auto expand when active tab falls under a collapsible menu parent
  useEffect(() => {
    const parentMenu = visibleMenuItems.find(item => 
      item.subItems && item.subItems.some(sub => sub.id === activeTab)
    );
    if (parentMenu) {
      setExpandedMenus(prev => ({
        ...prev,
        [parentMenu.id]: true
      }));
    }
  }, [activeTab]);

  const handleItemClick = (id) => {
    setActiveTab(id);
    if (isMobile && setMobileOpen) {
      setMobileOpen(false);
    }
  };

  const toggleMenu = (menuId) => {
    if (collapsed) {
      setCollapsed(false);
      setExpandedMenus(prev => ({ ...prev, [menuId]: true }));
    } else {
      setExpandedMenus(prev => ({
        ...prev,
        [menuId]: !prev[menuId]
      }));
    }
    if (menuId === 'people') {
      setActiveTab('employees');
    } else {
      setActiveTab(menuId + '-dashboard');
    }
  };

  const hasValidLogo = companyLogo && (companyLogo.startsWith('data:image/') || companyLogo.startsWith('http://') || companyLogo.startsWith('https://'));

  return (
    <aside
      className={`fixed md:sticky z-50 md:z-30 flex flex-col overflow-hidden transition-all duration-300 bg-[var(--sidebar-bg)] border-r border-slate-200/80 h-screen inset-y-0 left-0 w-[260px] ${mobileOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0 ${collapsed ? 'md:w-20' : 'md:w-[280px]'} shrink-0`}
    >
      {/* Sidebar Header */}
      <div style={{ 
        padding: '24px 20px', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: collapsed ? 'center' : 'space-between',
        borderBottom: '1px solid rgba(226, 232, 240, 0.6)',
        flexShrink: 0
      }}>
        {!collapsed && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{ display: 'flex', alignItems: 'center', gap: 10 }}
          >
            <div style={{
              width: 36,
              height: 36,
              borderRadius: 10,
              background: hasValidLogo ? 'rgba(0,0,0,0.02)' : 'linear-gradient(135deg, #4F46E5 0%, #06B6D4 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              fontWeight: 800,
              fontSize: 18,
              boxShadow: hasValidLogo ? 'none' : '0 4px 10px rgba(79, 70, 229, 0.3)',
              overflow: 'hidden'
            }}>
              {hasValidLogo ? (
                <img src={companyLogo} alt="Logo" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
              ) : (
                companyName ? companyName[0].toUpperCase() : 'A'
              )}
            </div>
            <div>
              <span style={{ fontWeight: 800, fontSize: '1.1rem', letterSpacing: '-0.02em', background: 'linear-gradient(90deg, #0F172A 0%, #475569 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>{companyName || 'Antigravity'}</span>
              <div style={{ fontSize: 9, color: 'var(--color-accent)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', marginTop: -2 }}>HRMS Enterprise</div>
            </div>
          </motion.div>
        )}
        {collapsed && (
          <div style={{
            width: 36,
            height: 36,
            borderRadius: 10,
            background: hasValidLogo ? 'rgba(0,0,0,0.02)' : 'linear-gradient(135deg, #4F46E5 0%, #06B6D4 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
            fontWeight: 800,
            fontSize: 18,
            overflow: 'hidden'
          }}>
            {hasValidLogo ? (
              <img src={companyLogo} alt="Logo" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
            ) : (
              companyName ? companyName[0].toUpperCase() : 'A'
            )}
          </div>
        )}
        
        <button 
          onClick={() => setCollapsed(!collapsed)}
          style={{
            background: 'transparent',
            border: 'none',
            color: 'var(--color-text-secondary)',
            cursor: 'pointer',
            padding: 4,
            borderRadius: 6,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
        </button>
      </div>

      {/* Switch to Sales CRM Button */}
      {onSwitchToCRM && (
        <div style={{ padding: '12px 12px 0' }}>
          <button
            onClick={onSwitchToCRM}
            style={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: collapsed ? 'center' : 'space-between',
              padding: '10px 14px',
              borderRadius: 12,
              background: 'linear-gradient(135deg, #0284c7 0%, #2563eb 100%)',
              color: '#ffffff',
              border: 'none',
              fontWeight: 800,
              fontSize: '13px',
              cursor: 'pointer',
              boxShadow: '0 4px 14px rgba(2, 132, 199, 0.35)',
              transition: 'all 0.2s ease'
            }}
            title="Switch to ITLC Sales CRM Workspace"
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <Briefcase size={18} />
              {!collapsed && <span>Sales CRM</span>}
            </div>
            {!collapsed && (
              <span style={{ fontSize: '10px', background: 'rgba(255, 255, 255, 0.25)', padding: '2px 6px', borderRadius: '6px', fontWeight: 700 }}>
                WORKSPACE
              </span>
            )}
          </button>
        </div>
      )}

      {/* Navigation Menu */}
      <div style={{ 
        flex: 1, 
        overflowY: 'auto', 
        padding: '16px 12px',
        display: 'flex',
        flexDirection: 'column',
        gap: 4
      }}>
        {visibleMenuItems.map((item) => {
          // Render sub-items accordion
          if (item.subItems) {
            const isParentActive = item.subItems.some(sub => sub.id === activeTab);
            const isExpanded = expandedMenus[item.id];
            
            return (
              <div key={item.id} style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <button
                  onClick={() => {
                    if (isLocked(item.id)) {
                      if (onOpenSubscriptionModal) {
                        onOpenSubscriptionModal();
                      } else {
                        alert(`🔒 FEATURE LOCKED\nThe "${item.label}" module is not included in your current subscription plan (${subscriptionPlanId || 'Free Preview'}). Please choose a plan under "Subscription & Billing" to unlock this feature.`);
                      }
                      return;
                    }
                    toggleMenu(item.id);
                  }}
                  style={{
                    position: 'relative',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '12px 14px',
                    borderRadius: 12,
                    border: 'none',
                    background: 'transparent',
                    cursor: 'pointer',
                    textAlign: 'left',
                    width: '100%',
                    color: isParentActive ? 'var(--color-primary)' : 'var(--color-text-secondary)',
                    fontWeight: 600,
                    fontSize: '16px',
                    outline: 'none'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <item.icon size={18} style={{ color: isParentActive ? 'var(--color-primary)' : 'var(--color-text-secondary)', flexShrink: 0 }} />
                    {!collapsed && (
                      <motion.span
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        style={{ display: 'flex', alignItems: 'center', gap: 6 }}
                      >
                        <span>{item.label}</span>
                        {isLocked(item.id) && <span style={{ fontSize: '0.7rem' }}>🔒</span>}
                      </motion.span>
                    )}
                  </div>
                  {!collapsed && (
                    <motion.div animate={{ rotate: isExpanded ? 180 : 0 }} style={{ display: 'flex', alignItems: 'center' }}>
                      <ChevronDown size={14} style={{ color: 'var(--color-text-tertiary)' }} />
                    </motion.div>
                  )}
                </button>

                {/* Sub items collapsible list */}
                <AnimatePresence initial={false}>
                  {!collapsed && isExpanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      style={{
                        paddingLeft: 12,
                        marginLeft: 22,
                        borderLeft: '1px solid var(--color-border)',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 2,
                        overflow: 'hidden'
                      }}
                    >
                      {item.subItems.map((sub) => {
                        const isSubActive = activeTab === sub.id;
                        const subLocked = isSubItemLocked(item.id, sub.id);
                        return (
                          <button
                            key={sub.id}
                            onClick={() => {
                              if (subLocked) {
                                if (onOpenSubscriptionModal) {
                                  onOpenSubscriptionModal();
                                } else {
                                  alert(`🔒 FEATURE LOCKED\nThe "${sub.label}" feature is locked under your current subscription plan (${subscriptionPlanId || 'Free Preview'}). Please choose a plan to unlock.`);
                                }
                                return;
                              }
                              handleItemClick(sub.id);
                            }}
                            style={{
                              padding: '8px 12px',
                              borderRadius: 8,
                              border: 'none',
                              background: isSubActive ? 'var(--color-primary-light)' : 'transparent',
                              cursor: 'pointer',
                              textAlign: 'left',
                              width: '100%',
                              color: isSubActive ? 'var(--color-primary)' : 'var(--color-text-secondary)',
                              fontWeight: isSubActive ? 700 : 500,
                              fontSize: '14px',
                              outline: 'none',
                              transition: 'all 0.15s ease',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'space-between',
                              opacity: subLocked ? 0.65 : 1
                            }}
                          >
                            <span>{sub.label}</span>
                            {subLocked && <span style={{ fontSize: '0.7rem' }}>🔒</span>}
                          </button>
                        );
                      })}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          }

          // Render normal root items
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          const locked = isLocked(item.id);
          return (
            <button
              key={item.id}
              onClick={() => {
                if (locked) {
                  if (onOpenSubscriptionModal) {
                    onOpenSubscriptionModal();
                  } else {
                    alert(`🔒 FEATURE LOCKED\nThe "${item.label}" module is not included in your current subscription plan (${subscriptionPlanId || 'Free Preview'}). Please upgrade your plan under "Subscription & Billing" to unlock this feature.`);
                  }
                  return;
                }
                handleItemClick(item.id);
              }}
              style={{
                position: 'relative',
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                padding: '12px 14px',
                borderRadius: 12,
                border: 'none',
                background: 'transparent',
                cursor: 'pointer',
                textAlign: 'left',
                width: '100%',
                color: isActive ? 'var(--color-primary)' : 'var(--color-text-secondary)',
                fontWeight: 600,
                fontSize: '16px',
                transition: 'color 0.2s ease',
                outline: 'none',
                opacity: locked ? 0.65 : 1
              }}
            >
              {/* Active Tab Glow / Pill Indicator */}
              {isActive && (
                <motion.div
                  layoutId="activeTabPill"
                  style={{
                    position: 'absolute',
                    inset: 0,
                    borderRadius: 12,
                    background: 'linear-gradient(90deg, rgba(79, 70, 229, 0.08) 0%, rgba(6, 182, 212, 0.04) 100%)',
                    borderLeft: '3px solid var(--color-primary)',
                    zIndex: -1
                  }}
                  transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                />
              )}
              
              <Icon size={18} style={{ 
                color: isActive ? 'var(--color-primary)' : 'var(--color-text-secondary)',
                flexShrink: 0
              }} />
              
              {!collapsed && (
                <motion.span
                  initial={{ opacity: 0, x: -5 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.15 }}
                  style={{ display: 'flex', alignItems: 'center', gap: 6 }}
                >
                  <span>{item.label}</span>
                  {locked && <span style={{ fontSize: '0.7rem' }}>🔒</span>}
                </motion.span>
              )}
            </button>
          );
        })}
      </div>

      {/* Logout Footer Button */}
      <div style={{ 
        padding: '16px 12px', 
        borderTop: '1px solid rgba(226, 232, 240, 0.6)',
        flexShrink: 0
      }}>
        <button
          onClick={handleLogout}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            padding: '12px 14px',
            borderRadius: 12,
            border: 'none',
            background: 'transparent',
            cursor: 'pointer',
            textAlign: 'left',
            width: '100%',
            color: 'var(--color-danger)',
            fontWeight: 600,
            fontSize: '0.875rem',
            outline: 'none'
          }}
        >
          <LogOut size={18} style={{ flexShrink: 0 }} />
          {!collapsed && (
            <motion.span
              initial={{ opacity: 0, x: -5 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0 }}
            >
              Logout
            </motion.span>
          )}
        </button>
      </div>
    </aside>
  );
}
