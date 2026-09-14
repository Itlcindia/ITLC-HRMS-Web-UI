"use client";

import React, { useState } from "react";
import { useHRMS } from "./context/HRMSContext";
import { motion } from "framer-motion";
import {
  LayoutDashboard,
  User,
  Clock,
  CalendarDays,
  CreditCard,
  FolderOpen,
  Receipt,
  Laptop,
  LifeBuoy,
  GraduationCap,
  Bell,
  Settings as SettingsIcon,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  ChevronDown,
  ClipboardList,
} from "lucide-react";
import { cn } from "./UI";

interface SidebarProps {
  collapsed: boolean;
  setCollapsed: (c: boolean) => void;
  mobileOpen: boolean;
  setMobileOpen: (open: boolean) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ collapsed, setCollapsed, mobileOpen, setMobileOpen }) => {
  const { activeTab, setActiveTab, activeSubTab, setActiveSubTab, notifications, leaveRequests, tickets, profile } = useHRMS();

  const [isMobile, setIsMobile] = useState(false);
  React.useEffect(() => {
    const checkScreen = () => setIsMobile(window.innerWidth < 768);
    checkScreen();
    window.addEventListener('resize', checkScreen);
    return () => window.removeEventListener('resize', checkScreen);
  }, []);

  // Badge counters
  const unreadNotificationsCount = notifications.filter((n) => !n.read).length;
  const pendingLeavesCount = leaveRequests.filter((r) => r.status === "Pending").length;
  const activeTicketsCount = tickets.filter((t) => t.status === "Open" || t.status === "Assigned" || t.status === "In Progress").length;

  // Collapsible Sub-menus state
  const [expandedMenus, setExpandedMenus] = useState<Record<string, boolean>>({
    profile: activeTab === "profile",
    attendance: activeTab === "attendance",
    leaves: activeTab === "leaves",
    payroll: activeTab === "payroll",
    training: activeTab === "training",
    helpdesk: activeTab === "helpdesk",
    settings: activeTab === "settings",
  });

  const toggleSubMenu = (menuId: string) => {
    setExpandedMenus((prev) => ({
      ...prev,
      [menuId]: !prev[menuId],
    }));
  };

  const handleNavClick = (tabId: string, subTabId?: string) => {
    setActiveTab(tabId);
    if (subTabId) {
      setActiveSubTab(subTabId);
    }
    if (mobileOpen) {
      setMobileOpen(false);
    }
  };

  const menuItems: Array<{ id: string; label: string; icon: any; subItems?: Array<{ id: string; label: string }>; badge?: number }> = [
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
    {
      id: "profile",
      label: "My Profile",
      icon: User,
      subItems: [
        { id: "profile-personal", label: "Personal Info" },
        { id: "profile-experience", label: "Work & Experience" },
        { id: "profile-documents", label: "KYC Documents" },
      ],
    },
    {
      id: "attendance",
      label: "Attendance & Logs",
      icon: Clock,
      subItems: [
        { id: "att-tracker", label: "Attendance Sheet" },
        { id: "att-regularize", label: "Regularization requests" },
        { id: "att-overtime", label: "Overtime logging" },
      ],
    },
    {
      id: "leaves",
      label: "Leave Management",
      icon: CalendarDays,
      subItems: [
        { id: "leave-dashboard", label: "Balances overview" },
        { id: "leave-apply", label: "Apply for leaves" },
        { id: "leave-history", label: "Applications ledger" },
      ],
    },
    { id: "tasks", label: "My Tasks", icon: ClipboardList },
    {
      id: "payroll",
      label: "Payroll & payslip",
      icon: CreditCard,
      subItems: [
        { id: "pay-payslips", label: "Monthly Payslips" },
        { id: "pay-structures", label: "Salary structure" },
        { id: "pay-tax", label: "Tax Declarations" },
      ],
    },
    { id: "documents", label: "Document Center", icon: FolderOpen },
    { id: "expenses", label: "Expense Claim", icon: Receipt },
    { id: "assets", label: "Assets Allocated", icon: Laptop },
    {
      id: "helpdesk",
      label: "Helpdesk Tickets",
      icon: LifeBuoy,
      subItems: [
        { id: "help-new", label: "Log New Ticket" },
        { id: "help-my", label: "My Tickets logs" },
      ],
      badge: activeTicketsCount,
    },
    {
      id: "training",
      label: "Training & LMS",
      icon: GraduationCap,
      subItems: [
        { id: "lms-courses", label: "Online Courses" },
        { id: "lms-certifications", label: "My Certificates" },
      ],
    },
    { id: "notifications", label: "Alerts Inbox", icon: Bell, badge: unreadNotificationsCount },
    { id: "settings", label: "Settings", icon: SettingsIcon },
  ];

  const modulesEnabled = React.useMemo(() => {
    if (profile?.companyDetails?.modulesEnabled) {
      try {
        const parsed = typeof profile.companyDetails.modulesEnabled === 'string'
          ? JSON.parse(profile.companyDetails.modulesEnabled)
          : profile.companyDetails.modulesEnabled;
        return parsed;
      } catch (e) {
        console.error("Failed to parse company modulesEnabled:", e);
      }
    }
    return null;
  }, [profile?.companyDetails]);

  const filteredMenuItems = React.useMemo(() => {
    const baseItems = isMobile
      ? menuItems.filter((item) => ["attendance", "profile", "documents", "payroll", "notifications", "leaves", "tasks", "expenses", "helpdesk", "training", "settings", "assets", "dashboard"].includes(item.id))
      : menuItems;

    if (!modulesEnabled) return baseItems;

    const mapping: Record<string, string> = {
      dashboard: 'dashboard',
      attendance: 'attendance',
      leaves: 'leave',
      payroll: 'payroll',
      documents: 'documents',
      expenses: 'payroll',
      assets: 'assets',
      helpdesk: 'helpdesk',
      training: 'training'
    };

    return baseItems.filter(item => {
      const configKey = mapping[item.id];
      if (configKey !== undefined && modulesEnabled[configKey] === false) {
        return false;
      }
      return true;
    });
  }, [isMobile, menuItems, modulesEnabled]);

  return (
    <aside
      className={cn(
        "h-screen bg-card border-r border-border flex flex-col transition-all duration-300 shrink-0",
        "fixed md:sticky inset-y-0 left-0 z-50 md:z-30 w-64 md:translate-x-0",
        collapsed ? "md:w-16" : "md:w-64",
        mobileOpen ? "flex translate-x-0" : "hidden md:flex -translate-x-full"
      )}
    >
      {/* Brand Header */}
      <div className="h-16 flex items-center gap-3 px-4 border-b border-border select-none">
        <div className="p-1 rounded-lg bg-primary/5 text-primary flex items-center justify-center shrink-0 w-9 h-9 overflow-hidden">
          {profile?.companyLogo && (profile.companyLogo.startsWith('data:image/') || profile.companyLogo.startsWith('http://') || profile.companyLogo.startsWith('https://')) ? (
            <img src={profile.companyLogo} alt="Logo" className="w-full h-full object-contain" />
          ) : (
            <ShieldCheck className="h-5 w-5" />
          )}
        </div>
        {!collapsed && (
          <motion.div
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex flex-col"
          >
            <span className="font-bold text-foreground leading-none text-sm tracking-wide">{profile?.companyName || "ITLC HRMS"}</span>
            <span className="text-[10px] text-muted-foreground mt-0.5">ESS Portal Enterprise</span>
          </motion.div>
        )}
      </div>

      {/* Navigation Menu */}
      <nav className="flex-1 py-4 overflow-y-auto px-2 space-y-1 scrollbar-none">
        {filteredMenuItems.map((item) => {
          const isActive = activeTab === item.id;
          const isExpanded = expandedMenus[item.id];
          const Icon = item.icon;

          return (
            <div key={item.id} className="space-y-0.5">
              <button
                onClick={() => {
                  setActiveTab(item.id);
                  if (item.subItems) {
                    toggleSubMenu(item.id);
                    // Also activate the first sub-item by default if none is set
                    const hasActiveSub = item.subItems.some((s) => s.id === activeSubTab);
                    if (!hasActiveSub) {
                      setActiveSubTab(item.subItems[0].id);
                    }
                  } else {
                    setActiveSubTab("");
                    setMobileOpen(false);
                  }
                }}
                className={cn(
                  "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all duration-150 relative group cursor-pointer focus:outline-none",
                  isActive
                    ? "text-primary font-medium"
                    : "text-muted-foreground hover:text-foreground hover:bg-secondary/40"
                )}
              >
                {/* Active Highlight Pill */}
                {isActive && (
                  <motion.div
                    layoutId="active-nav-bg"
                    className="absolute inset-0 bg-primary/10 rounded-lg -z-10 border-l-2 border-primary"
                    transition={{ type: "spring", stiffness: 380, damping: 30 }}
                  />
                )}

                <Icon className={cn("h-4 w-4 shrink-0 transition-transform duration-200 group-hover:scale-105", isActive && "text-primary")} />

                {!collapsed && (
                  <span className="flex-1 text-left truncate">{item.label}</span>
                )}

                {/* Dropdown Chevron */}
                {!collapsed && item.subItems && (
                  <ChevronDown className={cn("h-3 w-3 transition-transform duration-200 text-muted-foreground", isExpanded && "rotate-180")} />
                )}

                {/* Badges */}
                {item.badge !== undefined && item.badge > 0 && (
                  <span
                    className={cn(
                      "flex items-center justify-center rounded-full text-[10px] font-bold shrink-0 min-w-5 h-5 px-1.5",
                      isActive ? "bg-primary text-primary-foreground" : "bg-primary/20 text-primary"
                    )}
                  >
                    {item.badge}
                  </span>
                )}

                {/* Tooltip for collapsed mode */}
                {collapsed && (
                  <div className="absolute left-14 scale-0 group-hover:scale-100 transition-all duration-200 origin-left bg-popover text-popover-foreground border border-border text-xs px-2.5 py-1.5 rounded-md shadow-lg pointer-events-none whitespace-nowrap z-50">
                    {item.label}
                    {item.badge !== undefined && item.badge > 0 && ` (${item.badge})`}
                  </div>
                )}
              </button>

              {/* Sub-items rendering */}
              {!collapsed && item.subItems && isExpanded && (
                <div className="pl-6 mt-0.5 space-y-0.5 border-l border-border/60 ml-5">
                  {item.subItems.map((sub) => {
                    const isSubActive = activeTab === item.id && activeSubTab === sub.id;
                    return (
                      <button
                        key={sub.id}
                        onClick={() => {
                          setActiveTab(item.id);
                          setActiveSubTab(sub.id);
                          setMobileOpen(false);
                        }}
                        className={cn(
                          "w-full flex items-center text-left py-1.5 px-3 rounded-md text-xs transition-colors cursor-pointer",
                          isSubActive
                            ? "text-primary font-bold bg-primary/5"
                            : "text-muted-foreground hover:text-foreground hover:bg-secondary/20"
                        )}
                      >
                        {sub.label}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </nav>

      {/* Collapse Toggle Footer */}
      <div className="p-2 border-t border-border flex justify-end">
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="p-1.5 rounded-lg hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors cursor-pointer w-full flex items-center justify-center"
        >
          {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </button>
      </div>
    </aside>
  );
};
