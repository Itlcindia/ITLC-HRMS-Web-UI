"use client";

import React, { useState, useEffect } from "react";
import { HRMSProvider, useHRMS } from "./context/HRMSContext";
import { Sidebar } from "./Sidebar";
import { Navbar } from "./Navbar";
import { motion, AnimatePresence } from "framer-motion";
import { Skeleton } from "./UI";

// Module Components
import { DashboardOverview } from "./modules/DashboardOverview";
import { MyProfile } from "./modules/MyProfile";
import { AttendanceManagement } from "./modules/AttendanceManagement";
import { LeaveManagement } from "./modules/LeaveManagement";
import { TaskManagement } from "./modules/TaskManagement";
import { PayrollPayslips } from "./modules/PayrollPayslips";
import { DocumentCenter } from "./modules/DocumentCenter";
import { ExpenseManagement } from "./modules/ExpenseManagement";
import { AssetManagement } from "./modules/AssetManagement";
import { Helpdesk } from "./modules/Helpdesk";
import { TrainingLMS } from "./modules/TrainingLMS";
import { NotificationsCenter } from "./modules/NotificationsCenter";
import { Settings } from "./modules/Settings";

function DashboardContent({ onLogout }: { onLogout?: () => void }) {
  const { activeTab, setActiveTab, profile } = useHRMS();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  // Guard active tab on mobile viewports
  useEffect(() => {
    const handleResize = () => {
      const isMob = window.innerWidth < 768;
      if (isMob && !["attendance", "profile", "documents", "payroll", "notifications", "leaves", "tasks", "expenses", "helpdesk", "training", "settings", "assets", "dashboard"].includes(activeTab)) {
        setActiveTab("attendance");
      }
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [activeTab, setActiveTab]);

  // Guard active tab if disabled by admin configuration
  useEffect(() => {
    if (profile?.companyDetails?.modulesEnabled) {
      try {
        const parsed = typeof profile.companyDetails.modulesEnabled === 'string'
          ? JSON.parse(profile.companyDetails.modulesEnabled)
          : profile.companyDetails.modulesEnabled;

        const mapping: Record<string, string> = {
          dashboard: 'dashboard',
          attendance: 'attendance',
          leaves: 'leave',
          payroll: 'payroll',
          expenses: 'payroll',
          documents: 'documents',
          assets: 'assets',
          helpdesk: 'helpdesk',
          training: 'training'
        };

        const configKey = mapping[activeTab];
        if (configKey !== undefined && parsed[configKey] === false) {
          const order = ["dashboard", "attendance", "leaves", "payroll", "documents", "assets", "helpdesk", "training", "profile", "settings"];
          const fallback = order.find(tab => {
            const key = mapping[tab];
            return key === undefined || parsed[key] !== false;
          });
          if (fallback) {
            setActiveTab(fallback);
          }
        }
      } catch (e) {
        console.error("Failed to parse modulesEnabled in App Shell:", e);
      }
    }
  }, [profile?.companyDetails, activeTab, setActiveTab]);

  // Render the appropriate panel based on active state tab
  const renderActiveModule = () => {
    switch (activeTab) {
      case "dashboard":
        return <DashboardOverview />;
      case "profile":
        return <MyProfile />;
      case "attendance":
        return <AttendanceManagement />;
      case "leaves":
        return <LeaveManagement />;
      case "tasks":
        return <TaskManagement />;
      case "payroll":
        return <PayrollPayslips />;
      case "documents":
        return <DocumentCenter />;
      case "expenses":
        return <ExpenseManagement />;
      case "assets":
        return <AssetManagement />;
      case "helpdesk":
        return <Helpdesk />;
      case "training":
        return <TrainingLMS />;
      case "notifications":
        return <NotificationsCenter />;
      case "settings":
        return <Settings />;
      default:
        return <DashboardOverview />;
    }
  };

  const getModuleTitle = () => {
    switch (activeTab) {
      case "dashboard":
        return "Dashboard Overview";
      case "profile":
        return "Employee Profile";
      case "attendance":
        return "Attendance & Work logs";
      case "leaves":
        return "Leave Balances & Requests";
      case "tasks":
        return "My Assigned Tasks";
      case "payroll":
        return "Salary & Payout Payslips";
      case "documents":
        return "Document Verification Center";
      case "expenses":
        return "Expense Claims & Reimbursement";
      case "assets":
        return "My Allocated Devices";
      case "helpdesk":
        return "Support Tickets Helpdesk";
      case "training":
        return "LMS Training Portal";
      case "notifications":
        return "Alerts Inbox";
      case "settings":
        return "Portal Preferences & Settings";
      default:
        return "Employee Portal";
    }
  };

  return (
    <div className="flex h-screen overflow-hidden bg-background text-foreground relative">
      
      {/* Backdrop overlay for mobile drawer */}
      {mobileSidebarOpen && (
        <div
          className="fixed inset-0 z-40 md:hidden"
          onClick={() => setMobileSidebarOpen(false)}
        />
      )}

      {/* Collapsible Sidebar */}
      <Sidebar
        collapsed={sidebarCollapsed}
        setCollapsed={setSidebarCollapsed}
        mobileOpen={mobileSidebarOpen}
        setMobileOpen={setMobileSidebarOpen}
      />

      {/* Main Container */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        
        {/* Top Navbar */}
        <Navbar onToggleMobileSidebar={() => setMobileSidebarOpen(!mobileSidebarOpen)} />

        {/* Content Wrapper */}
        <main className="flex-1 overflow-y-auto px-6 py-6 space-y-6">
          
          {/* Header Title Section */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 print:hidden">
            <div>
              <h1 className="text-xl md:text-2xl font-black text-foreground tracking-tight">
                {activeTab === "dashboard" ? profile?.fullName : getModuleTitle()}
              </h1>
              <p className="text-xs text-muted-foreground mt-0.5">
                {activeTab === "dashboard" ? `Employee ID: ${profile?.id}` : "ITLC HRMS Self Service Portal"}
              </p>
            </div>
            
            {/* Direct Clock status in header */}
            <div className="flex items-center gap-2 self-start sm:self-center">
              <div className="text-[10px] font-bold bg-sky-500/10 text-sky-700 dark:text-sky-400 border border-sky-500/25 px-3 py-1.5 rounded-xl uppercase tracking-wider select-none">
                Role: <strong className="font-extrabold text-sky-800 dark:text-sky-300">{profile?.designation}</strong>
              </div>
              {onLogout && (
                <button
                  onClick={onLogout}
                  className="text-[10px] font-bold bg-rose-500/10 hover:bg-rose-500/20 text-rose-700 dark:text-rose-400 border border-rose-500/25 px-3 py-1.5 rounded-xl uppercase tracking-wider select-none cursor-pointer transition-colors"
                >
                  Log Out
                </button>
              )}
            </div>
          </div>

          {/* Module view with animated mount transitions */}
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.18, ease: "easeInOut" }}
              className="w-full"
            >
              {renderActiveModule()}
            </motion.div>
          </AnimatePresence>

        </main>
      </div>
    </div>
  );
}

// Hydration fallback skeleton to avoid Next.js server-client rendering mismatches
function HydrationLoadingSkeleton() {
  return (
    <div className="flex h-screen overflow-hidden bg-background text-foreground">
      {/* Sidebar Mock */}
      <div className="w-64 border-r border-border p-4 flex flex-col justify-between hidden md:flex">
        <div className="space-y-6">
          <Skeleton className="h-10 w-4/5" />
          <div className="space-y-3">
            {Array.from({ length: 8 }).map((_, i) => (
              <Skeleton key={i} className="h-8 w-full" />
            ))}
          </div>
        </div>
        <Skeleton className="h-8 w-full" />
      </div>

      {/* Main body Mock */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden p-6 space-y-6">
        <div className="flex justify-between items-center">
          <Skeleton className="h-12 w-48" />
          <Skeleton className="h-8 w-32" />
        </div>
        
        {/* Welcome banner mock */}
        <Skeleton className="h-24 w-full rounded-2xl" />

        {/* Stats Grid mock */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-20 w-full" />
          ))}
        </div>

        {/* Charts mock */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1">
          <Skeleton className="lg:col-span-2 h-full min-h-[220px]" />
          <Skeleton className="h-full min-h-[220px]" />
        </div>
      </div>
    </div>
  );
}

function AppShell({ onLogout }: { onLogout?: () => void }) {
  return <DashboardContent onLogout={onLogout} />;
}

export default function Home({ loggedInEmail, onLogout }: { loggedInEmail?: string; onLogout?: () => void }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <HydrationLoadingSkeleton />;
  }

  return (
    <HRMSProvider loggedInEmail={loggedInEmail}>
      <AppShell onLogout={onLogout} />
    </HRMSProvider>
  );
}
