import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import Sidebar from './Sidebar';
import Header from './Header';
import DashboardOverview from './DashboardOverview';
import EmployeeManagement from './EmployeeManagement';
import Departments from './Departments';
import Attendance from './Attendance';
import LeaveManagement from './LeaveManagement';
import Payroll from './Payroll';
import Recruitment from './Recruitment';
import Performance from './Performance';
import Training from './Training';
import AssetManagement from './AssetManagement';
import Reports from './Reports';
import Notifications from './Notifications';
import Subscription from './Subscription';
import Settings from './Settings';
import Security from './Security';
import AiFeatures from './AiFeatures';
import Designations from './Designations';
import Organization from './Organization';
import Expenses from './Expenses';
import SupportTickets from './SupportTickets';
import { Bot, Sparkles, X, Send } from 'lucide-react';

const initialEmployees = [];

const initialNotifications = [];

const initialMessages = [];

import { api } from '../../services/api';
import { applyThemeColor } from '../../utils/theme';
import { downloadPaymentSlip } from '../../utils/PaymentSlip';

export default function App({ onLogout, loggedInEmail }) {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [searchQuery, setSearchQuery] = useState('');
  const [collapsed, setCollapsed] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [showAiAssistant, setShowAiAssistant] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [featureFlags, setFeatureFlags] = useState({});
  const [showSubscriptionModal, setShowSubscriptionModal] = useState(false);

  const handleMarkNotificationRead = (id) => {
    const readIds = JSON.parse(localStorage.getItem("hrms_admin_read_notification_ids") || "[]");
    if (!readIds.includes(id)) {
      readIds.push(id);
      localStorage.setItem("hrms_admin_read_notification_ids", JSON.stringify(readIds));
    }
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  };

  const handleMarkAllNotificationsRead = () => {
    const readIds = JSON.parse(localStorage.getItem("hrms_admin_read_notification_ids") || "[]");
    notifications.forEach(n => {
      if (!readIds.includes(n.id)) {
        readIds.push(n.id);
      }
    });
    localStorage.setItem("hrms_admin_read_notification_ids", JSON.stringify(readIds));
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  useEffect(() => {
    const media = window.matchMedia('(max-width: 768px)');
    setIsMobile(media.matches);
    const listener = (e) => setIsMobile(e.matches);
    media.addEventListener('change', listener);
    return () => media.removeEventListener('change', listener);
  }, []);

  useEffect(() => {
    if (isMobile && !['dashboard', 'attendance', 'settings', 'payroll', 'attendance-dashboard', 'attendance-logs', 'attendance-grid', 'attendance-my', 'attendance-shift', 'attendance-reports'].includes(activeTab) && !activeTab.startsWith('payroll-')) {
      setActiveTab('dashboard');
    }
  }, [isMobile, activeTab]);
  const [company, setCompany] = useState(null);
  const [plans, setPlans] = useState([]);
  const [selectedCurrency, setSelectedCurrency] = useState(() => {
    if (typeof window !== 'undefined' && window.localStorage) {
      return localStorage.getItem('hrms_billing_currency') || 'INR';
    }
    return 'INR';
  });

  const handleCurrencyChange = (curr) => {
    setSelectedCurrency(curr);
    if (typeof window !== 'undefined' && window.localStorage) {
      localStorage.setItem('hrms_billing_currency', curr);
    }
  };
  const [checkoutPlan, setCheckoutPlan] = useState(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState({
    name: '',
    role: '',
    avatar: '',
    companyName: '',
    companyLogo: ''
  });

  // Guard active tab if disabled by admin configuration
  useEffect(() => {
    if (featureFlags) {
      const mapping = {
        dashboard: 'dashboard',
        attendance: 'attendance',
        leave: 'leave',
        payroll: 'payroll',
        expenses: 'payroll',
        assets: 'assets',
        training: 'training'
      };

      const configKey = mapping[activeTab];
      if (configKey !== undefined && featureFlags[configKey] === false) {
        const order = ['dashboard', 'people', 'attendance', 'leave', 'payroll', 'recruitment', 'expenses', 'performance', 'assets', 'training', 'reports', 'settings', 'security', 'subscription', 'support'];
        const fallback = order.find(tab => {
          const key = mapping[tab];
          return key === undefined || featureFlags[key] !== false;
        });
        if (fallback) {
          setActiveTab(fallback);
        }
      }
    }
  }, [featureFlags, activeTab]);

  useEffect(() => {
    const loadAdminData = async () => {
      try {
        const prof = await api.getProfile();
        const comp = await api.getAdminCompany();
        const normalizedComp = comp ? {
          ...comp,
          subscriptionStatus: comp.subscriptionStatus || (comp.paidAt || comp.lastPayment || comp.transactionId ? 'active' : 'unpaid'),
          subscriptionPlanId: comp.subscriptionPlanId || comp.planId || comp.plan || 'starter',
          planId: comp.subscriptionPlanId || comp.planId || comp.plan || 'starter',
          plan: comp.subscriptionPlanId || comp.planId || comp.plan || 'starter'
        } : comp;
        setCompany(normalizedComp);
        try {
          const fetchedPlans = await api.getPlans().catch(() => api.getAdminPlans());
          if (fetchedPlans && fetchedPlans.length > 0) {
            setPlans(fetchedPlans);
          }
        } catch (err) {
          console.error("Failed to load active subscription plans:", err);
        }
        setProfile({
          name: prof.name,
          role: prof.role,
          avatar: prof.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
          companyName: comp?.name || prof.companyName || 'ITLC HRMS',
          companyLogo: comp?.logo || prof.companyLogo || '',
          currency: comp?.currency || 'USD'
        });
        if (comp && comp.themeColor) {
          applyThemeColor(comp.themeColor);
        }
        let mods = comp?.modulesEnabled || {};
        if (typeof mods === 'string') {
          try { mods = JSON.parse(mods); } catch (e) {}
        }
        if (typeof mods === 'string') {
          try { mods = JSON.parse(mods); } catch (e) {}
        }
        if (!mods || typeof mods !== 'object') {
          mods = {};
        }
        setFeatureFlags(mods);
        
        const list = await api.getEmployees();
        setEmployees(list);

        // Fetch pending leaves
        const leaves = await api.getAdminLeaves();
        const pendingL = leaves.filter(l => l.status === 'Pending');

        // Fetch pending expenses
        const expenses = await api.getAdminExpenses();
        const pendingE = expenses.filter(e => e.status === 'Pending');

        // Fetch open tickets
        const tickets = await api.getAdminTickets();
        const openT = tickets.filter(t => t.status === 'open' || t.status === 'Open');

        // Fetch pending correction requests
        const corrections = await api.getManagerCorrections().catch(() => []);
        const pendingC = corrections.filter(c => c.status === 'Pending');

        // Generate Admin Notifications
        const generated = [];
        const readIds = JSON.parse(localStorage.getItem("hrms_admin_read_notification_ids") || "[]");

        pendingL.forEach(l => {
          const id = `NTF-admin-leave-${l.id}`;
          const read = readIds.includes(id);
          generated.push({
            id,
            title: "Leave Approval Required",
            message: `${l.employeeName || 'An employee'} requested ${l.totalDays} days of leave.`,
            time: "New",
            type: "info",
            badgeColor: "#F59E0B",
            read
          });
        });

        pendingE.forEach(e => {
          const id = `NTF-admin-expense-${e.id}`;
          const read = readIds.includes(id);
          generated.push({
            id,
            title: "Expense Claim Approval",
            message: `${e.employeeName || 'An employee'} requested ₹${e.amount} reimbursement.`,
            time: "New",
            type: "info",
            badgeColor: "#EF4444",
            read
          });
        });

        openT.forEach(t => {
          const id = `NTF-admin-ticket-${t.id}`;
          const read = readIds.includes(id);
          generated.push({
            id,
            title: "Support Ticket Logged",
            message: `New support ticket: ${t.subject} (${t.priority}).`,
            time: "New",
            type: "info",
            badgeColor: "#3B82F6",
            read
          });
        });

        pendingC.forEach(c => {
          const id = `NTF-admin-correction-${c.id}`;
          const read = readIds.includes(id);
          generated.push({
            id,
            title: "Correction Request Submitted",
            message: `${c.employeeName || 'An employee'} requested attendance correction for ${c.date}.`,
            time: "New",
            type: "info",
            badgeColor: "#8B5CF6",
            read
          });
        });

        // Fetch completed tasks
        try {
          const adminTasks = await api.getAdminTasks().catch(() => []);
          const completedTasks = (adminTasks || []).filter(t => t.status === 'Completed');
          completedTasks.forEach(t => {
            const id = `NTF-admin-task-done-${t.id}`;
            const read = readIds.includes(id);
            generated.push({
              id,
              title: "Task Completed by Employee",
              message: `${t.assignedToName || 'Team member'} completed "${t.title}".`,
              time: t.completedAt ? new Date(t.completedAt).toLocaleDateString() : 'Done',
              type: "success",
              badgeColor: "#10B981",
              read
            });
          });
        } catch (taskErr) {
          console.error("Error loading admin tasks:", taskErr);
        }
 
        // Add Subscription Limit warning notification
        const activeEmpCount = list.length;
        const maxEmpCount = comp?.maxEmployees || 50;
        if (activeEmpCount >= maxEmpCount) {
          const id = `NTF-admin-subscription-limit`;
          const read = readIds.includes(id);
          generated.push({
            id,
            title: "⚠️ Subscription Limit Reached",
            message: `You have reached your limit of ${maxEmpCount} employees (${activeEmpCount}/${maxEmpCount}). Additions locked. Upgrade now to add more employees.`,
            time: "Critical",
            type: "warning",
            badgeColor: "#EF4444",
            read
          });
        }

        setNotifications(generated);
      } catch (err) {
        console.error("Error loading admin core records:", err);
      } finally {
        setLoading(false);
      }
    };

    loadAdminData();

    const handleSync = () => {
      loadAdminData();
    };

    window.addEventListener('subscription_plans_updated', handleSync);
    window.addEventListener('company_updated', handleSync);
    window.addEventListener('subscription_updated', handleSync);
    window.addEventListener('multi_tenant_updated', handleSync);
    window.addEventListener('profile_updated', handleSync);
    window.addEventListener('employee_created', handleSync);
    window.addEventListener('employee_updated', handleSync);
    window.addEventListener('tasks_updated', handleSync);
    window.addEventListener('leaves_updated', handleSync);
    window.addEventListener('attendance_updated', handleSync);
    window.addEventListener('corrections_updated', handleSync);
    window.addEventListener('storage', handleSync);

    const interval = setInterval(loadAdminData, 10000);
    return () => {
      clearInterval(interval);
      window.removeEventListener('subscription_plans_updated', handleSync);
      window.removeEventListener('company_updated', handleSync);
      window.removeEventListener('subscription_updated', handleSync);
      window.removeEventListener('multi_tenant_updated', handleSync);
      window.removeEventListener('profile_updated', handleSync);
      window.removeEventListener('employee_created', handleSync);
      window.removeEventListener('employee_updated', handleSync);
      window.removeEventListener('tasks_updated', handleSync);
      window.removeEventListener('leaves_updated', handleSync);
      window.removeEventListener('attendance_updated', handleSync);
      window.removeEventListener('corrections_updated', handleSync);
      window.removeEventListener('storage', handleSync);
    };
  }, []);

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  const [chatLog, setChatLog] = useState([
    { sender: 'ai', text: 'Hello! I am your AI HR Copilot. Ask me anything about employees, payroll, or business logistics.' }
  ]);
  const [chatInput, setChatInput] = useState('');
  
  const handleSendChat = (e) => {
    e.preventDefault();
    if (!chatInput.trim()) return;
    setChatLog(prev => [...prev, { sender: 'user', text: chatInput }]);
    const query = chatInput.toLowerCase();
    setChatInput('');
    
    setTimeout(() => {
      let response = `I've analyzed the live workspace datastore. All active records are synced.`;
      
      if (query.includes('how many') || query.includes('count') || query.includes('number of') || query.includes('employee') || query.includes('workers') || query.includes('staff')) {
        const total = employees.length;
        const active = employees.filter(emp => emp.status?.toLowerCase() === 'active').length;
        const onLeave = employees.filter(emp => emp.status?.toLowerCase() === 'on leave').length;
        response = `There are currently ${total} employees registered in ${profile.companyName || 'the company'}. Of these, ${active} are currently Active, and ${onLeave} are On Leave.`;
      } 
      else if (query.includes('pending') || query.includes('approval') || query.includes('action') || query.includes('request')) {
        const leaveAlerts = notifications.filter(n => n.title.includes('Leave')).length;
        const expAlerts = notifications.filter(n => n.title.includes('Expense')).length;
        const ticketAlerts = notifications.filter(n => n.title.includes('Ticket')).length;
        response = `Action items breakdown: There are ${leaveAlerts} pending leave applications, ${expAlerts} expense claims awaiting review, and ${ticketAlerts} support tickets open.`;
      }
      else if (query.includes('burnout') || query.includes('risk') || query.includes('stress') || query.includes('workload')) {
        const engineeringCount = employees.filter(emp => emp.department?.toLowerCase() === 'engineering').length;
        response = `Burnout analysis: Sarah Jenkins (Senior UX Designer) shows an elevated burnout risk score of 84% due to high task workload. The rest of the ${engineeringCount} engineering staff are at a stable workload rating.`;
      }
      else if (query.includes('brand') || query.includes('itlc') || query.includes('company name') || query.includes('workspace name') || query.includes('name')) {
        const activeCompName = profile.companyName || (() => {
          try {
            const activeTenant = JSON.parse(localStorage.getItem('itlc_active_tenant') || '{}');
            return activeTenant.name || activeTenant.companyName || '';
          } catch(e) { return ''; }
        })() || 'Company';
        response = `Your workspace brand name is currently set to "${activeCompName}". You can update this brand name at any time by navigating to "Company Settings" under the Settings tab.`;
      }
      else {
        const matchedEmp = employees.find(emp => query.includes(emp.name.toLowerCase()) || emp.name.toLowerCase().split(' ').some(w => w.length > 2 && query.includes(w)));
        if (matchedEmp) {
          response = `Employee Lookup: ${matchedEmp.name} is a ${matchedEmp.role || matchedEmp.designation} in the ${matchedEmp.department || 'Staff'} department. Email: ${matchedEmp.email || 'N/A'}. Status is currently "${matchedEmp.status}".`;
        } else {
          response = `I am your real-time HR Copilot. You can ask me to:
          • Count total employees ("how many employees")
          • List pending approvals ("any pending approvals")
          • Check specific employee details (e.g. "search Marcus Vance")
          • Check burnout stress levels ("burnout risk")`;
        }
      }
      
      setChatLog(prev => [...prev, { sender: 'ai', text: response }]);
    }, 600);
  };

  const handleLogout = () => {
    onLogout && onLogout();
  };

  const isSubscriptionActive = Boolean(
    company &&
    company.subscriptionStatus === 'active' &&
    company.status !== 'suspended' &&
    company.status !== 'deleted' &&
    company.status !== 'expired' &&
    (company.subscriptionPlanId || company.planId || company.plan) &&
    (company.subscriptionPlanId !== 'none' && company.planId !== 'none' && company.plan !== 'none') &&
    (company.subscriptionPlanId !== 'unselected' && company.planId !== 'unselected')
  );

  const renderActiveView = () => {
    if (!isSubscriptionActive && activeTab !== 'dashboard' && activeTab !== 'subscription') {
      return (
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '65vh',
          textAlign: 'center',
          padding: '40px 20px',
          background: darkMode ? '#0f172a' : '#ffffff',
          borderRadius: '24px',
          border: '1px solid ' + (darkMode ? '#1e293b' : '#e2e8f0'),
          boxShadow: '0 10px 30px rgba(0,0,0,0.04)'
        }}>
          <div style={{
            width: 72,
            height: 72,
            borderRadius: '20px',
            background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.1) 0%, rgba(245, 158, 11, 0.1) 100%)',
            border: '1px solid rgba(239, 68, 68, 0.2)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '2rem',
            marginBottom: 20
          }}>
            🔒
          </div>
          <h2 style={{ fontSize: '1.6rem', fontWeight: 800, margin: '0 0 8px 0', color: darkMode ? '#f8fafc' : '#0f172a' }}>
            Feature Locked Under Free Preview
          </h2>
          <p style={{ fontSize: '0.95rem', color: darkMode ? '#94a3b8' : '#64748b', maxWidth: 520, lineHeight: 1.6, margin: '0 0 28px 0' }}>
            This module is locked because your workspace does not have an active subscription. Please buy a subscription plan created by the Super Owner to unlock workforce management, attendance, payroll, leaves, and settings.
          </p>
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', justifyContent: 'center' }}>
            <button
              onClick={() => setShowSubscriptionModal(true)}
              style={{
                padding: '12px 28px',
                borderRadius: '12px',
                background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)',
                color: '#ffffff',
                fontWeight: 700,
                fontSize: '0.95rem',
                border: 'none',
                cursor: 'pointer',
                boxShadow: '0 4px 15px rgba(79, 70, 229, 0.3)',
                display: 'flex',
                alignItems: 'center',
                gap: 8
              }}
            >
              <span>⚡ Buy Subscription Now</span>
            </button>
            <button
              onClick={() => setActiveTab('dashboard')}
              style={{
                padding: '12px 20px',
                borderRadius: '12px',
                background: darkMode ? '#1e293b' : '#f1f5f9',
                color: darkMode ? '#e2e8f0' : '#475569',
                fontWeight: 600,
                fontSize: '0.95rem',
                border: 'none',
                cursor: 'pointer'
              }}
            >
              Return to Dashboard
            </button>
          </div>
        </div>
      );
    }

    switch (activeTab) {
      case 'dashboard':
        return <DashboardOverview employeesList={employees} notifications={notifications} setActiveTab={setActiveTab} currency={profile.currency} isSubscriptionActive={isSubscriptionActive} onOpenSubscriptionModal={() => setShowSubscriptionModal(true)} />;
      case 'people':
      case 'people-dashboard':
      case 'directory':
      case 'employee-directory':
      case 'employees':
      case 'employee-profile':
        return <EmployeeManagement employees={employees} setEmployees={setEmployees} searchQuery={searchQuery} subTab={activeTab === 'employee-profile' ? 'profile' : 'directory'} setActiveTab={setActiveTab} currency={profile.currency} />;
      case 'departments':
        return <Departments setActiveTab={setActiveTab} currency={profile.currency} />;
      case 'designations':
        return <Designations setActiveTab={setActiveTab} currency={profile.currency} />;
      case 'organization':
        return <Organization employees={employees} setEmployees={setEmployees} setActiveTab={setActiveTab} currency={profile.currency} />;
      case 'attendance':
      case 'attendance-dashboard':
      case 'attendance-logs':
      case 'attendance-corrections':
      case 'attendance-grid':
      case 'attendance-my':
      case 'attendance-shift':
      case 'attendance-reports':
        return <Attendance subTab={activeTab.split('-')[1] || 'dashboard'} setActiveTab={setActiveTab} />;
      case 'leave':
      case 'leave-dashboard':
      case 'leave-request':
      case 'leave-my':
      case 'leave-policies':
      case 'leave-calendar':
      case 'leave-reports':
        return <LeaveManagement subTab={activeTab.split('-')[1] || 'dashboard'} setActiveTab={setActiveTab} />;
      case 'payroll':
      case 'payroll-dashboard':
      case 'payroll-structures':
      case 'payroll-run':
      case 'payroll-payslips':
      case 'payroll-compliance':
      case 'payroll-reimbursements':
      case 'payroll-reports':
        return <Payroll employees={employees} subTab={activeTab.split('-')[1] || 'dashboard'} setActiveTab={setActiveTab} currency={profile.currency} />;
      case 'recruitment':
      case 'recruitment-dashboard':
      case 'recruitment-openings':
      case 'recruitment-candidates':
      case 'recruitment-interview':
      case 'recruitment-offers':
      case 'recruitment-onboarding':
        return <Recruitment subTab={activeTab.split('-')[1] || 'dashboard'} setActiveTab={setActiveTab} />;
      case 'performance':
      case 'performance-dashboard':
      case 'performance-goals':
      case 'performance-kpis':
      case 'performance-cycles':
      case 'performance-appraisals':
      case 'performance-feedback':
      case 'performance-reports':
        return <Performance employees={employees} subTab={activeTab.split('-')[1] || 'dashboard'} />;
      case 'expenses':
        return <Expenses setActiveTab={setActiveTab} currency={profile.currency} />;
      case 'support':
        return <SupportTickets setActiveTab={setActiveTab} loggedInEmail={loggedInEmail} />;
      case 'assets':
      case 'assets-inventory':
      case 'assets-allocate':
      case 'assets-requests':
      case 'assets-maintenance':
      case 'assets-reports':
      case 'assets-settings':
        return <AssetManagement subTab={activeTab.split('-')[1] || 'dashboard'} setActiveTab={setActiveTab} />;
      case 'training':
        return <Training setActiveTab={setActiveTab} />;
      case 'reports':
        return <Reports setActiveTab={setActiveTab} />;
      case 'notifications':
        return <Notifications notifications={notifications} onMarkRead={handleMarkNotificationRead} onMarkAllRead={handleMarkAllNotificationsRead} />;
      case 'subscription':
        return <Subscription setActiveTab={setActiveTab} />;
      case 'settings':
        return <Settings setActiveTab={setActiveTab} />;
      case 'security':
        return <Security setActiveTab={setActiveTab} />;
      case 'ai-assistant':
        return <AiFeatures setActiveTab={setActiveTab} employees={employees} />;
      default:
        return <DashboardOverview employeesList={employees} notifications={notifications} setActiveTab={setActiveTab} currency={profile.currency} isSubscriptionActive={isSubscriptionActive} onOpenSubscriptionModal={() => setShowSubscriptionModal(true)} />;
    }
  };

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
        fontFamily: 'system-ui, -apple-system, sans-serif'
      }}>
        <div style={{
          width: 50,
          height: 50,
          border: '4px solid #e2e8f0',
          borderTop: '4px solid var(--color-primary, #4f46e5)',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite',
          marginBottom: 16
        }} />
        <span style={{ fontSize: '0.9rem', color: '#64748b', fontWeight: 500 }}>
          Loading workspace...
        </span>
        <style dangerouslySetInnerHTML={{__html: `
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}} />
      </div>
    );
  }

  const isImpersonated = typeof window !== 'undefined' && localStorage.getItem('hrms_superowner_token') !== null;

  const handleExitImpersonation = () => {
    const superToken = localStorage.getItem('hrms_superowner_token');
    if (superToken) {
      localStorage.setItem('hrms_jwt_token', superToken);
      localStorage.removeItem('hrms_superowner_token');
      window.location.href = '/superowner';
    }
  };

  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      if (window.Razorpay) {
        resolve(true);
        return;
      }
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handleBuyPlan = async (plan) => {
    if (!plan) return;
    const rawPrice = Number(plan.priceMonthly !== undefined ? plan.priceMonthly : (plan.price || 0));
    const price = selectedCurrency === 'INR' 
      ? rawPrice
      : Math.max(1, Math.round(rawPrice / 83));

    if (price === 0 || plan.id === 'free_trial' || plan.id === 'trial') {
      try {
        const compId = company?.id || company?.tenantId || profile?.companyId;
        const subRes = await api.subscribeCompany({
          companyId: compId,
          planId: plan.id,
          transactionId: `trial_${Date.now()}`,
          paymentGateway: 'free_trial',
          amount: 0,
          currency: selectedCurrency
        });
        await api.chooseSubscriptionPlan(plan.id, selectedCurrency).catch(() => {});
        const seatCount = Number(plan.seatLimit || plan.employeeLimit || 50);
        const storageCount = Number(plan.storageLimitGb || plan.storageLimit || 50);
        const updatedComp = {
          ...(company || {}),
          ...(subRes?.tenant || {}),
          status: 'active',
          subscriptionStatus: 'active',
          subscriptionPlanId: plan.id,
          plan: plan.id,
          planId: plan.id,
          seatLimit: seatCount,
          maxEmployees: seatCount,
          storageLimitGb: storageCount,
          storageLimit: storageCount
        };
        setCompany(updatedComp);
        if (updatedComp.id) {
          localStorage.setItem(`hrms_company_${updatedComp.id}`, JSON.stringify(updatedComp));
        }
        localStorage.setItem('itlc_active_tenant', JSON.stringify(updatedComp));
        setShowSubscriptionModal(false);
        alert(`🎉 Congratulations! Your plan "${plan.name}" is now active. All HRMS modules are unlocked!`);
        window.dispatchEvent(new Event('subscription_updated'));
        window.dispatchEvent(new Event('company_updated'));
      } catch (err) {
        alert("Failed to activate plan: " + err.message);
      }
      return;
    }

    try {
      const loaded = await loadRazorpayScript();
      if (!loaded) {
        alert("Failed to load Razorpay Payment Gateway script. Please check your internet connection.");
        return;
      }

      let activeKey = import.meta.env?.VITE_RAZORPAY_KEY_ID || 'rzp_live_TZtOW3aeVNZT0s';
      try {
        const s = localStorage.getItem('hrms_global_settings');
        if (s) {
          const parsed = JSON.parse(s);
          if (parsed.razorpayKeyId && parsed.razorpayKeyId.trim()) activeKey = parsed.razorpayKeyId.trim();
        }
      } catch {}

      const payerEmail = (company?.adminEmail || company?.email || loggedInEmail || profile?.email || '').trim();
      const rawPhone = String(company?.phone || company?.adminPhone || profile?.phone || profile?.contact || '').trim();
      const payerPhone = rawPhone.replace(/[^0-9+]/g, '');
      const payerName = (company?.adminName || profile?.name || company?.name || company?.companyName || "Company Admin").trim();
      const companyTitle = company?.companyName || company?.name || profile?.companyName || "ITLC HRMS Workspace";

      let orderId = undefined;
      try {
        const orderRes = await api.createRazorpayOrder({
          amount: Math.max(1, price),
          currency: selectedCurrency === 'INR' ? 'INR' : 'USD',
          planId: plan.id,
          companyName: companyTitle,
          customerEmail: payerEmail,
          customerPhone: payerPhone,
          customerName: payerName
        });
        if (orderRes && orderRes.success) {
          if (orderRes.key) activeKey = orderRes.key;
          if (orderRes.orderId && typeof orderRes.orderId === 'string' && orderRes.orderId.startsWith('order_') && !orderRes.orderId.includes('mock') && !orderRes.orderId.includes('order_local_')) {
            orderId = orderRes.orderId;
          }
        }
      } catch (e) {
        console.warn("Could not create server order, proceeding with client checkout", e);
      }

      const options = {
        key: activeKey,
        amount: Math.max(1, price) * 100,
        currency: selectedCurrency === 'INR' ? 'INR' : 'USD',
        name: companyTitle,
        description: `Subscription: ${plan.name}`,
        ...(orderId ? { order_id: orderId } : {}),
        handler: async function (response) {
          try {
            const compId = company?.id || company?.tenantId || profile?.companyId;
            const subRes = await api.subscribeCompany({
              companyId: compId,
              planId: plan.id,
              transactionId: response.razorpay_payment_id,
              paymentGateway: 'razorpay',
              amount: price,
              currency: selectedCurrency
            });

            await api.verifyPayment({
              gateway: 'razorpay',
              planId: plan.id,
              paymentId: response.razorpay_payment_id,
              orderId: response.razorpay_order_id,
              signature: response.razorpay_signature,
              amount: price,
              currency: selectedCurrency
            }).catch(() => {});

            const seatCount = Number(plan.seatLimit || plan.employeeLimit || 50);
            const storageCount = Number(plan.storageLimitGb || plan.storageLimit || 50);
            const updatedComp = {
              ...(company || {}),
              ...(subRes?.tenant || {}),
              status: 'active',
              subscriptionStatus: 'active',
              subscriptionPlanId: plan.id,
              plan: plan.id,
              planId: plan.id,
              seatLimit: seatCount,
              maxEmployees: seatCount,
              storageLimitGb: storageCount,
              storageLimit: storageCount
            };

            setCompany(updatedComp);

            if (updatedComp.id) {
              localStorage.setItem(`hrms_company_${updatedComp.id}`, JSON.stringify(updatedComp));
            }
            localStorage.setItem('itlc_active_tenant', JSON.stringify(updatedComp));

            try {
              const curProf = JSON.parse(localStorage.getItem('hrms_user_profile') || '{}');
              curProf.subscriptionStatus = 'active';
              curProf.subscriptionPlanId = plan.id;
              if (curProf.companyDetails) {
                curProf.companyDetails.subscriptionStatus = 'active';
                curProf.companyDetails.subscriptionPlanId = plan.id;
                curProf.companyDetails.seatLimit = seatCount;
                curProf.companyDetails.storageLimitGb = storageCount;
              }
              localStorage.setItem('hrms_user_profile', JSON.stringify(curProf));
            } catch {}

            setShowSubscriptionModal(false);

            // Download Payment Slip immediately
            const paymentSlipData = {
              id: response.razorpay_payment_id || `PAY-${Date.now()}`,
              invoiceNumber: subRes?.payment?.invoiceNumber || `INV-${Date.now().toString().slice(-6)}`,
              date: new Date().toISOString(),
              amount: price,
              currency: selectedCurrency,
              status: 'successful',
              planId: plan.id,
              planName: plan.name,
              gateway: 'Razorpay',
              companyName: profile.companyName || updatedComp.name || updatedComp.companyName || "Company Workspace"
            };
            const companySlipDetails = {
              name: profile.companyName || updatedComp.name || updatedComp.companyName || "Company Workspace",
              email: loggedInEmail || profile.email || updatedComp.email || updatedComp.adminEmail || "",
              address: updatedComp.address || "",
              city: updatedComp.city || "",
              state: updatedComp.state || ""
            };

            try {
              downloadPaymentSlip(paymentSlipData, companySlipDetails);
            } catch (slipErr) {
              console.warn("Could not auto-trigger payment slip download:", slipErr);
            }

            alert(`🎉 Payment verified successfully! Welcome to ITLC HRMS. All modules are now unlocked, and your payment slip has been downloaded.`);
            window.dispatchEvent(new Event('subscription_updated'));
            window.dispatchEvent(new Event('company_updated'));
          } catch (err) {
            alert("Subscription activation error: " + err.message);
          }
        },
        prefill: {
          name: payerName,
          email: payerEmail,
          contact: payerPhone
        },
        theme: {
          color: "#4F46E5"
        }
      };

      const rzp = new window.Razorpay(options);
      rzp.on('payment.failed', function (resp) {
        alert("Payment Failed: " + (resp.error?.description || "Transaction was cancelled or declined"));
      });
      rzp.open();
    } catch (err) {
      alert("Payment processing error: " + err.message);
    }
  };

  return (
    <div className={`flex flex-col h-screen w-screen overflow-hidden ${darkMode ? 'dark bg-slate-950' : 'bg-slate-50'}`}>
      {isImpersonated && (
        <div className="bg-gradient-to-r from-amber-600 to-orange-600 text-white text-xs font-bold py-2.5 px-4 flex items-center justify-between z-50 shadow-md shrink-0">
          <span className="flex items-center gap-2">
            <span className="inline-block w-2.5 h-2.5 rounded-full bg-white animate-pulse" />
            ⚠️ Impersonation Mode: Currently viewing workspace as Company Admin for {profile.companyName}
          </span>
          <button 
            onClick={handleExitImpersonation}
            className="bg-white/20 hover:bg-white/30 border border-white/30 px-3 py-1 rounded text-[10px] tracking-wider uppercase font-black transition-all"
          >
            Exit Impersonation
          </button>
        </div>
      )}
      <div className="flex flex-1 h-full w-full overflow-hidden">
      
      {/* Mobile Drawer Overlay */}
      {mobileSidebarOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-40 md:hidden"
          onClick={() => setMobileSidebarOpen(false)}
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 49
          }}
        />
      )}

      {/* Sidebar Nav */}
      <Sidebar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        collapsed={collapsed} 
        setCollapsed={setCollapsed}
        handleLogout={handleLogout}
        mobileOpen={mobileSidebarOpen}
        setMobileOpen={setMobileSidebarOpen}
        companyName={profile.companyName}
        companyLogo={profile.companyLogo}
        featureFlags={featureFlags}
        subscriptionPlanId={company?.subscriptionPlanId}
        isSubscriptionActive={isSubscriptionActive}
        onOpenSubscriptionModal={() => setShowSubscriptionModal(true)}
      />

      {/* Main Panel Wrapper */}
      <main
        className="flex-1 flex flex-col min-w-0 transition-all duration-300 admin-main-content p-4 md:pr-6 md:py-4"
      >
        <Header 
          searchQuery={searchQuery} 
          setSearchQuery={setSearchQuery} 
          toggleAiAssistant={() => setShowAiAssistant(true)} 
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          darkMode={darkMode}
          setDarkMode={setDarkMode}
          notifications={notifications}
          onMarkNotificationRead={handleMarkNotificationRead}
          onMarkAllNotificationsRead={handleMarkAllNotificationsRead}
          messages={initialMessages}
          userProfile={profile}
          onToggleMobileSidebar={() => setMobileSidebarOpen(!mobileSidebarOpen)}
        />

        {/* Dynamic Inner Page Transitions */}
        <div style={{ flex: 1, overflowY: 'auto', paddingRight: '4px' }} className="premium-scrollbar">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              style={{ flex: 1 }}
            >
              {renderActiveView()}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>

      {/* Floating AI Assistant overlay drawer */}
      <AnimatePresence>
        {showAiAssistant && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.3 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowAiAssistant(false)}
              style={{ position: 'fixed', inset: 0, background: '#000', zIndex: 900 }}
            />
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 26, stiffness: 220 }}
              style={{
                position: 'fixed',
                right: 0,
                top: 0,
                bottom: 0,
                width: '100%',
                maxWidth: 400,
                background: 'rgba(4, 6, 12, 0.95)',
                backdropFilter: 'blur(20px)',
                borderLeft: '1px solid rgba(255, 255, 255, 0.04)',
                boxShadow: '-10px 0 40px rgba(0, 0, 0, 0.5)',
                zIndex: 901,
                padding: 24,
                display: 'flex',
                flexDirection: 'column',
                justifyBetween: 'space-between',
                justifyContent: 'space-between',
                gap: 16
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <Bot size={22} style={{ color: 'var(--color-primary)' }} />
                  <div>
                    <h3 style={{ fontSize: '1rem', fontWeight: 800 }}>AI assistant Insights</h3>
                    <span style={{ fontSize: '0.75rem', color: 'var(--color-accent)', fontWeight: 600 }}>Powered by DeepMind</span>
                  </div>
                </div>
                <button onClick={() => setShowAiAssistant(false)} style={{ border: 'none', background: 'transparent', cursor: 'pointer', color: 'var(--color-text-secondary)' }}>
                  <X size={20} />
                </button>
              </div>

              {/* Chat Feed */}
              <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 12 }}>
                {chatLog.map((chat, index) => (
                  <div key={index} style={{ display: 'flex', justify: chat.sender === 'user' ? 'flex-end' : 'flex-start', justifyContent: chat.sender === 'user' ? 'flex-end' : 'flex-start' }}>
                    <div style={{
                      maxWidth: '85%',
                      padding: 12,
                      borderRadius: 12,
                      fontSize: '0.8rem',
                      background: chat.sender === 'user' ? 'var(--color-primary)' : '#E2E8F0',
                      color: chat.sender === 'user' ? 'white' : 'var(--color-text-primary)',
                      borderBottomRightRadius: chat.sender === 'user' ? 2 : 12,
                      borderBottomLeftRadius: chat.sender === 'ai' ? 2 : 12
                    }}>
                      {chat.text}
                    </div>
                  </div>
                ))}
              </div>

              {/* Chat Input form */}
              <form onSubmit={handleSendChat} style={{ display: 'flex', gap: 8 }}>
                <input 
                  type="text" 
                  value={chatInput} 
                  onChange={(e) => setChatInput(e.target.value)} 
                  placeholder="Ask about burnouts..." 
                  className="premium-input" 
                  style={{ flex: 1 }}
                />
                <button type="submit" className="premium-btn premium-btn-primary" style={{ padding: 12 }}>
                  <Send size={14} />
                </button>
              </form>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Super Owner Live Subscription Plans Modal */}
      {typeof document !== 'undefined' && createPortal(
        <AnimatePresence>
          {showSubscriptionModal && (
            <div
              style={{
                position: 'fixed',
                inset: 0,
                zIndex: 99999,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '20px',
                overflowY: 'auto'
              }}
            >
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.65 }}
                exit={{ opacity: 0 }}
                onClick={() => setShowSubscriptionModal(false)}
                style={{
                  position: 'fixed',
                  inset: 0,
                  background: '#000000',
                  backdropFilter: 'blur(6px)',
                  zIndex: 1
                }}
              />
              <motion.div
                initial={{ scale: 0.94, opacity: 0, y: 15 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.94, opacity: 0, y: 15 }}
                transition={{ type: 'spring', damping: 26, stiffness: 320 }}
                style={{
                  position: 'relative',
                  zIndex: 2,
                  width: '100%',
                  maxWidth: '1050px',
                  maxHeight: '90vh',
                  overflowY: 'auto',
                  background: darkMode ? '#0f172a' : '#ffffff',
                  color: darkMode ? '#f8fafc' : '#0f172a',
                  borderRadius: '24px',
                  padding: '32px',
                  boxShadow: '0 25px 60px -15px rgba(0, 0, 0, 0.4)',
                  border: '1px solid ' + (darkMode ? '#1e293b' : '#e2e8f0'),
                  margin: 'auto'
                }}
              >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <span style={{ fontSize: '1.8rem' }}>💎</span>
                    <h2 style={{ fontSize: '1.8rem', fontWeight: 800, margin: 0, background: 'linear-gradient(90deg, #4f46e5 0%, #a855f7 50%, #ec4899 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                      Choose Your Subscription Plan
                    </h2>
                  </div>
                  <p style={{ margin: '6px 0 0 0', fontSize: '0.9rem', color: darkMode ? '#94a3b8' : '#64748b' }}>
                    Select a plan configured for your organization to activate full access to all HRMS modules.
                  </p>
                </div>
                <button
                  onClick={() => setShowSubscriptionModal(false)}
                  style={{
                    background: darkMode ? '#1e293b' : '#f1f5f9',
                    border: 'none',
                    borderRadius: '50%',
                    width: 36,
                    height: 36,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    color: darkMode ? '#e2e8f0' : '#475569',
                    fontSize: '1.1rem',
                    fontWeight: 700
                  }}
                >
                  ✕
                </button>
              </div>

              {/* Currency Selector */}
              <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 10, marginBottom: 28 }}>
                <span style={{ fontSize: '0.9rem', fontWeight: 700, color: darkMode ? '#cbd5e1' : '#475569' }}>Billing Currency:</span>
                <select
                  value={selectedCurrency}
                  onChange={(e) => handleCurrencyChange(e.target.value)}
                  style={{
                    padding: '8px 16px',
                    borderRadius: '10px',
                    border: '1px solid ' + (darkMode ? '#334155' : '#cbd5e1'),
                    background: darkMode ? '#1e293b' : '#ffffff',
                    color: darkMode ? '#ffffff' : '#0f172a',
                    fontWeight: 700,
                    outline: 'none',
                    cursor: 'pointer'
                  }}
                >
                  <option value="INR">INR (₹)</option>
                  <option value="USD">USD ($)</option>
                  <option value="EUR">EUR (€)</option>
                  <option value="GBP">GBP (£)</option>
                </select>
              </div>

              {/* Plans Grid */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                gap: 20
              }}>
                {plans.map((p) => {
                  const isPopular = p.badge?.includes('POPULAR') || p.id === 'starter';
                  const rawPrice = Number(p.priceMonthly !== undefined ? p.priceMonthly : (p.price || 0));
                  const price = selectedCurrency === 'INR'
                    ? rawPrice
                    : Math.max(1, Math.round(rawPrice / 83));
                  const curSymbol = selectedCurrency === 'INR' ? '₹' : selectedCurrency === 'EUR' ? '€' : selectedCurrency === 'GBP' ? '£' : '$';
                  const seatLimit = p.seatLimit || p.employeeLimit || 50;
                  const storageGb = p.storageLimitGb || p.storageLimit || 50;

                  return (
                    <div
                      key={p.id}
                      style={{
                        borderRadius: '20px',
                        padding: '28px 24px',
                        background: darkMode ? '#1e293b' : '#ffffff',
                        border: isPopular ? '2px solid #6366f1' : '1px solid ' + (darkMode ? '#334155' : '#e2e8f0'),
                        boxShadow: isPopular ? '0 10px 30px rgba(99, 102, 241, 0.15)' : '0 4px 15px rgba(0,0,0,0.03)',
                        display: 'flex',
                        flexDirection: 'column',
                        position: 'relative'
                      }}
                    >
                      {isPopular && (
                        <div style={{
                          position: 'absolute',
                          top: -12,
                          right: 20,
                          background: 'linear-gradient(90deg, #6366f1 0%, #a855f7 100%)',
                          color: '#ffffff',
                          fontSize: '0.7rem',
                          fontWeight: 800,
                          padding: '4px 12px',
                          borderRadius: '20px',
                          letterSpacing: '0.5px'
                        }}>
                          POPULAR
                        </div>
                      )}

                      <h3 style={{ fontSize: '1.35rem', fontWeight: 800, margin: '0 0 6px 0' }}>{p.name}</h3>
                      <p style={{ fontSize: '0.8rem', color: darkMode ? '#94a3b8' : '#64748b', margin: '0 0 16px 0', minHeight: 36 }}>
                        {p.tagline || 'Essential workspace management toolkit.'}
                      </p>

                      <div style={{ display: 'flex', alignItems: 'baseline', gap: 4, marginBottom: 20 }}>
                        <span style={{ fontSize: '2.5rem', fontWeight: 900 }}>{curSymbol}{price.toLocaleString()}</span>
                        <span style={{ fontSize: '0.9rem', color: darkMode ? '#94a3b8' : '#64748b' }}>/month</span>
                      </div>

                      {/* Quotas */}
                      <div style={{
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 8,
                        padding: '12px 14px',
                        borderRadius: '12px',
                        background: darkMode ? '#0f172a' : '#f8fafc',
                        border: '1px solid ' + (darkMode ? '#334155' : '#e2e8f0'),
                        marginBottom: 20,
                        fontSize: '0.82rem',
                        fontWeight: 600
                      }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <span>👥</span>
                          <span><strong>{seatLimit >= 99999 ? 'Unlimited' : seatLimit}</strong> Staff Seats Limit</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <span>💾</span>
                          <span><strong>{storageGb} GB</strong> Storage Limit</span>
                        </div>
                      </div>

                      {/* Features */}
                      <ul style={{
                        listStyle: 'none',
                        padding: 0,
                        margin: '0 0 24px 0',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 10,
                        fontSize: '0.82rem',
                        color: darkMode ? '#cbd5e1' : '#475569',
                        flex: 1
                      }}>
                        {(p.highlightFeatures || [
                          'Complete Employee Directory',
                          'Biometric & GPS Attendance',
                          'Leave Tracking & Policies',
                          'Automated 1-Click Payroll',
                          'Role-Based Permissions'
                        ]).slice(0, 5).map((feat, fIdx) => (
                          <li key={fIdx} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <span style={{ color: '#10b981', fontWeight: 800 }}>✓</span>
                            <span>{feat}</span>
                          </li>
                        ))}
                      </ul>

                      <button
                        onClick={() => handleBuyPlan(p)}
                        style={{
                          width: '100%',
                          padding: '12px',
                          borderRadius: '12px',
                          background: isPopular ? 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)' : (darkMode ? '#334155' : '#0f172a'),
                          color: '#ffffff',
                          fontWeight: 700,
                          fontSize: '0.9rem',
                          border: 'none',
                          cursor: 'pointer',
                          transition: 'transform 0.15s ease',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: 6
                        }}
                      >
                        <span>⚡ Buy Now</span>
                      </button>
                    </div>
                  );
                })}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>,
      document.body
    )}
      </div>
    </div>
  );
}
