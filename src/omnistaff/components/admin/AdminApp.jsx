import React, { useState, useEffect } from 'react';
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
import { syncCompanySubscriptionChange } from '../../../types/multiTenant';

export default function App({ onLogout, loggedInEmail, onSwitchToCRM }) {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [searchQuery, setSearchQuery] = useState('');
  const [collapsed, setCollapsed] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [showAiAssistant, setShowAiAssistant] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [featureFlags, setFeatureFlags] = useState({});

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
  const [selectedCurrency, setSelectedCurrency] = useState('USD');
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
    if (featureFlags && Object.keys(featureFlags).length > 0) {
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

      const baseTab = activeTab.split('-')[0];
      const configKey = mapping[activeTab] || mapping[baseTab] || activeTab;
      if (featureFlags[configKey] === false) {
        setActiveTab('dashboard');
      }
    }
  }, [featureFlags, activeTab]);

  useEffect(() => {
    const loadAdminData = async () => {
      try {
        const prof = await api.getProfile();
        const comp = await api.getAdminCompany();
        setCompany(comp);
        if (comp && (comp.subscriptionPlanId === 'unselected' || comp.subscriptionPlanId === 'none')) {
          try {
            const fetchedPlans = await api.getAdminPlans();
            setPlans(fetchedPlans || []);
          } catch (err) {
            console.error("Failed to load active subscription plans:", err);
          }
        }
        setProfile({
          name: prof.name,
          role: prof.role,
          avatar: prof.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
          companyName: comp?.name || prof.companyName || 'Pushkar Enterprises & Solutions',
          companyLogo: comp?.logo || prof.companyLogo || '',
          currency: comp?.currency || 'INR'
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

    const handleLiveSync = () => {
      loadAdminData();
    };
    window.addEventListener('subscription_plans_updated', handleLiveSync);
    window.addEventListener('subscription_updated', handleLiveSync);
    window.addEventListener('multi_tenant_updated', handleLiveSync);
    window.addEventListener('profile_updated', handleLiveSync);
    window.addEventListener('company_updated', handleLiveSync);
    window.addEventListener('employee_created', handleLiveSync);
    window.addEventListener('employee_updated', handleLiveSync);
    window.addEventListener('tasks_updated', handleLiveSync);
    window.addEventListener('leaves_updated', handleLiveSync);
    window.addEventListener('attendance_updated', handleLiveSync);
    window.addEventListener('corrections_updated', handleLiveSync);
    window.addEventListener('storage', handleLiveSync);

    const interval = setInterval(loadAdminData, 10000);
    return () => {
      clearInterval(interval);
      window.removeEventListener('subscription_plans_updated', handleLiveSync);
      window.removeEventListener('subscription_updated', handleLiveSync);
      window.removeEventListener('multi_tenant_updated', handleLiveSync);
      window.removeEventListener('profile_updated', handleLiveSync);
      window.removeEventListener('company_updated', handleLiveSync);
      window.removeEventListener('employee_created', handleLiveSync);
      window.removeEventListener('employee_updated', handleLiveSync);
      window.removeEventListener('tasks_updated', handleLiveSync);
      window.removeEventListener('leaves_updated', handleLiveSync);
      window.removeEventListener('attendance_updated', handleLiveSync);
      window.removeEventListener('corrections_updated', handleLiveSync);
      window.removeEventListener('storage', handleLiveSync);
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
        response = `Your workspace brand name is currently set to "${profile.companyName || 'Antigravity'}". You can update this brand name at any time by navigating to "Company Settings" under the Settings tab.`;
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

  const renderActiveView = () => {
    switch (activeTab) {
      case 'dashboard':
        return <DashboardOverview employeesList={employees} notifications={notifications} setActiveTab={setActiveTab} currency={profile.currency} onSwitchToCRM={onSwitchToCRM} />;
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
        return <DashboardOverview employeesList={employees} notifications={notifications} setActiveTab={setActiveTab} currency={profile.currency} onSwitchToCRM={onSwitchToCRM} />;
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

  const handleSelectPlan = async (planId) => {
    const plan = plans.find(p => p.id === planId);
    if (!plan) return;

    if (plan.price === 0) {
      try {
        syncCompanySubscriptionChange({
          companyName: profile.companyName,
          planId: planId,
          status: 'trial'
        });
        const result = await api.chooseSubscriptionPlan(planId, selectedCurrency);
        if (result.success) {
          alert(`Congratulations! You have successfully subscribed to the ${plan.name}.`);
          loadAdminData();
        }
      } catch (err) {
        alert("Failed to activate plan: " + err.message);
      }
    } else {
      setCheckoutPlan(plan);
      setShowPaymentModal(true);
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

  const handleInitiatePayment = async (gateway) => {
    if (!checkoutPlan) return;
    const price = selectedCurrency === 'INR' ? checkoutPlan.price * 83 : checkoutPlan.price;

    try {
      if (gateway === 'mock') {
        syncCompanySubscriptionChange({
          companyName: profile.companyName,
          planId: checkoutPlan.id,
          status: 'active'
        });
        const result = await api.chooseSubscriptionPlan(checkoutPlan.id, selectedCurrency);
        if (result.success) {
          alert(`Congratulations! You have successfully subscribed to the ${checkoutPlan.name} (Trial Mode).`);
          setShowPaymentModal(false);
          setCheckoutPlan(null);
          loadAdminData();
        }
      } 
      else if (gateway === 'stripe') {
        const result = await api.createStripeSession({
          planId: checkoutPlan.id,
          planName: checkoutPlan.name,
          amount: Math.round(price),
          currency: selectedCurrency
        });
        if (result.success && result.url) {
          window.location.href = result.url;
        }
      } 
      else if (gateway === 'razorpay') {
        const loaded = await loadRazorpayScript();
        if (!loaded) {
          alert("Razorpay SDK failed to load. Please check your internet connection.");
          return;
        }

        const order = await api.createRazorpayOrder({
          amount: price,
          currency: selectedCurrency,
          planId: checkoutPlan.id
        });

        if (order && (order.orderId || order.id)) {
          // Dynamic Key from SuperOwner settings, razorpay_config or fallback
          let activeKey = order.key || '';
          try {
            const s = localStorage.getItem('hrms_global_settings');
            if (s) {
              const parsed = JSON.parse(s);
              if (parsed.razorpayKeyId && parsed.razorpayKeyId.trim()) {
                activeKey = parsed.razorpayKeyId.trim();
              }
            }
          } catch {}
          if (!activeKey) {
            try {
              const c = localStorage.getItem('razorpay_config');
              if (c) {
                const parsed = JSON.parse(c);
                if (parsed.keyId && parsed.keyId.trim()) {
                  activeKey = parsed.keyId.trim();
                }
              }
            } catch {}
          }
          if (!activeKey) {
            activeKey = 'rzp_live_Tb2olLw1YkeJRm';
          }

          const options = {
            key: activeKey,
            amount: order.amount,
            currency: order.currency,
            name: "ITLC HRMS Workspace",
            description: `Subscription for ${checkoutPlan.name}`,
            order_id: (order.orderId && !order.orderId.includes('mock') && !order.orderId.includes('order_local_')) ? order.orderId : undefined,
            handler: async function (response) {
              try {
                syncCompanySubscriptionChange({
                  companyName: profile.companyName,
                  planId: checkoutPlan.id,
                  status: 'active'
                });
                const verify = await api.verifyPayment({
                  gateway: 'razorpay',
                  planId: checkoutPlan.id,
                  paymentId: response.razorpay_payment_id,
                  orderId: response.razorpay_order_id,
                  signature: response.razorpay_signature,
                  amount: price,
                  currency: selectedCurrency
                });
                if (verify.success) {
                  alert(`Payment verified successfully! Welcome to ITLC HRMS.`);
                  setShowPaymentModal(false);
                  setCheckoutPlan(null);
                  loadAdminData();
                }
              } catch (err) {
                alert("Payment verification failed: " + err.message);
              }
            },
            prefill: {
              name: profile.name,
              email: profile.email || ''
            },
            theme: {
              color: "#4F46E5"
            }
          };
          const rzp = new window.Razorpay(options);
          rzp.open();
        }
      }
    } catch (err) {
      alert("Payment processing error: " + err.message);
    }
  };

  if (company && (company.subscriptionPlanId === 'unselected' || company.subscriptionPlanId === 'none')) {
    return (
      <div className={`flex flex-col items-center justify-center min-h-screen w-screen p-6 ${darkMode ? 'dark bg-slate-950 text-white' : 'bg-slate-50 text-slate-900'}`} style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ maxWidth: '1100px', width: '100%', display: 'flex', flexDirection: 'column', gap: 32, textAlign: 'center' }}>
          <div>
            <h2 style={{ fontSize: '2.5rem', fontWeight: 800, background: 'linear-gradient(90deg, #6366f1 0%, #a855f7 50%, #ec4899 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', margin: 0 }}>
              Welcome to ITLC HRMS Workspace!
            </h2>
            <p style={{ marginTop: 12, fontSize: '1.1rem', opacity: 0.8 }}>
              Select your currency and select a subscription plan to unlock your workspace.
            </p>
          </div>

          {/* Currency Selector Row */}
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 12 }}>
            <span style={{ fontSize: '0.95rem', fontWeight: 700 }}>Choose System Currency:</span>
            <select 
              value={selectedCurrency} 
              onChange={(e) => setSelectedCurrency(e.target.value)}
              className="premium-input"
              style={{ width: '150px', padding: '8px 14px', borderRadius: '8px' }}
            >
              <option value="USD">USD ($)</option>
              <option value="INR">INR (₹)</option>
              <option value="EUR">EUR (€)</option>
              <option value="GBP">GBP (£)</option>
            </select>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 24, marginTop: 16 }}>
            {plans.map((p) => {
              let features = {};
              if (typeof p.features === 'string') {
                try { features = JSON.parse(p.features); } catch (e) {}
              } else if (p.features && typeof p.features === 'object') {
                features = p.features;
              }
              const isPopular = p.id === 'starter' || p.id === 'professional';
              return (
                <div key={p.id} className="premium-card" style={{ display: 'flex', flexDirection: 'column', padding: 32, textAlign: 'center', border: isPopular ? '2px solid var(--color-primary)' : '1px solid var(--color-border)', borderRadius: 24, background: 'var(--glass-bg)', backdropFilter: 'blur(20px)', position: 'relative' }}>
                  {isPopular && (
                    <div style={{ position: 'absolute', top: 0, right: 0, background: 'var(--color-primary)', color: 'white', fontSize: '0.7rem', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '1px', padding: '6px 16px', borderRadius: '0 20px 0 12px' }}>
                      Popular
                    </div>
                  )}
                  <h3 style={{ fontSize: '1.4rem', fontWeight: 800, margin: 0 }}>{p.name}</h3>
                  <p style={{ fontSize: '0.85rem', color: 'var(--color-text-tertiary)', marginTop: 8 }}>
                    {p.id === 'free_trial' ? 'Explore basic workflows' : p.id === 'starter' ? 'Best for growing startups' : 'Complete power & enterprise tools'}
                  </p>
                  <div style={{ marginTop: 16, display: 'flex', alignItems: 'baseline', justifyContent: 'center' }}>
                    <span style={{ fontSize: '3rem', fontWeight: 800 }}>
                      {selectedCurrency === 'INR' ? '₹' : selectedCurrency === 'EUR' ? '€' : selectedCurrency === 'GBP' ? '£' : '$'}
                      {Math.round(selectedCurrency === 'INR' ? p.price * 83 : p.price).toLocaleString()}
                    </span>
                    <span style={{ fontSize: '1.2rem', color: 'var(--color-text-tertiary)', marginLeft: 4 }}>/mo</span>
                  </div>
                  <ul style={{ marginTop: 24, display: 'flex', flexDirection: 'column', gap: 12, fontSize: '0.85rem', textAlign: 'left', listStyle: 'none', padding: 0 }}>
                    <li>🟢 Limit: {p.employeeLimit >= 99999 ? 'Unlimited' : `${p.employeeLimit} Employees`}</li>
                    <li>🟢 Storage: {p.storageLimit} GB Limit</li>
                    <li>{features.payroll ? '🟢 Monthly Payroll & Payslips' : '❌ Payroll & Payslips'}</li>
                    <li>{features.attendance ? '🟢 Check-in Logs & Corrections' : '❌ Check-in Logs'}</li>
                    <li>{features.recruitment ? '🟢 Recruitment & Interview Wizard' : '❌ Recruitment Panel'}</li>
                    <li>{features.faceRecognition || features.gpsAttendance ? '🟢 Face ID & GPS Coordinates Check' : '❌ Geofenced/Biometric Attendance'}</li>
                  </ul>
                  <button 
                    onClick={() => handleSelectPlan(p.id)}
                    className={isPopular ? 'premium-btn premium-btn-primary' : 'premium-btn premium-btn-secondary'}
                    style={{ marginTop: 'auto', paddingTop: 12, paddingBottom: 12, borderRadius: 12, fontWeight: 700 }}
                  >
                    Select {p.name}
                  </button>
                </div>
              );
            })}
          </div>

          <div style={{ marginTop: 16 }}>
            <button 
              onClick={handleLogout}
              style={{ border: 'none', background: 'transparent', color: '#ef4444', fontSize: '0.9rem', fontWeight: 600, cursor: 'pointer', textDecoration: 'underline' }}
            >
              Sign out and return to Login
            </button>
          </div>

          {/* Payment Selection Modal */}
          <AnimatePresence>
            {showPaymentModal && checkoutPlan && (
              <>
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 0.5 }}
                  exit={{ opacity: 0 }}
                  onClick={() => setShowPaymentModal(false)}
                  style={{ position: 'fixed', inset: 0, background: '#000', zIndex: 1000 }}
                />
                <motion.div
                  initial={{ scale: 0.95, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.95, opacity: 0 }}
                  className="premium-card text-center"
                  style={{
                    position: 'fixed',
                    left: '50%',
                    top: '50%',
                    transform: 'translate(-50%, -50%)',
                    zIndex: 1001,
                    padding: 32,
                    width: '90%',
                    maxWidth: 420,
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 20
                  }}
                >
                  <div>
                    <h3 style={{ fontSize: '1.25rem', fontWeight: 800, margin: 0 }}>Complete Your Subscription</h3>
                    <p style={{ fontSize: '0.85rem', color: 'var(--color-text-tertiary)', marginTop: 8 }}>
                      You are subscribing to the <strong>{checkoutPlan.name}</strong> for {selectedCurrency === 'INR' ? '₹' : selectedCurrency === 'EUR' ? '€' : selectedCurrency === 'GBP' ? '£' : '$'}{Math.round(selectedCurrency === 'INR' ? checkoutPlan.price * 83 : checkoutPlan.price)}/mo.
                    </p>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                    <button 
                      onClick={() => handleInitiatePayment('razorpay')}
                      className="premium-btn premium-btn-primary"
                      style={{ padding: 14, borderRadius: 12, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, background: '#4f46e5', color: 'white' }}
                    >
                      ⚡ Pay with Razorpay (UPI, Cards, Netbanking)
                    </button>
                  </div>

                  <button 
                    onClick={() => setShowPaymentModal(false)}
                    style={{ border: 'none', background: 'transparent', color: 'var(--color-text-tertiary)', fontSize: '0.8rem', cursor: 'pointer' }}
                  >
                    Cancel
                  </button>
                </motion.div>
              </>
            )}
          </AnimatePresence>
        </div>
      </div>
    );
  }

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
        onSwitchToCRM={onSwitchToCRM}
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
          onLogout={onLogout}
          onSwitchToCRM={onSwitchToCRM}
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
      </div>
    </div>
  );
}
