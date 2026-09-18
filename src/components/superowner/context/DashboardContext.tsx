import React, { createContext, useContext, useState, useEffect } from 'react';
import { Company, SubscriptionPlan, Payment, User, Coupon, SupportTicket, ActivityLog } from '../types';
import {
  INITIAL_COMPANIES,
  INITIAL_PLANS,
  INITIAL_PAYMENTS,
  INITIAL_USERS,
  INITIAL_COUPONS,
  INITIAL_TICKETS,
  INITIAL_LOGS
} from '../dashboardData';
import { syncHrmsPlansListToUnifiedCatalog } from '../../../types/multiTenant';

interface Settings {
  platformName: string;
  currency: string;
  timezone: string;
  maintenanceMode: boolean;
  smtpServer: string;
  smtpEmail: string;
  brandColor: string;
  stripeEnabled: boolean;
  razorpayEnabled: boolean;
  paypalEnabled: boolean;
  stripeSecretKey?: string;
  razorpayKeyId?: string;
  razorpaySecret?: string;
  realUpiId?: string;
}

interface Toast {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info' | 'warning';
}

interface DashboardContextType {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  companies: Company[];
  setCompanies: React.Dispatch<React.SetStateAction<Company[]>>;
  plans: SubscriptionPlan[];
  setPlans: React.Dispatch<React.SetStateAction<SubscriptionPlan[]>>;
  payments: Payment[];
  setPayments: React.Dispatch<React.SetStateAction<Payment[]>>;
  users: User[];
  setUsers: React.Dispatch<React.SetStateAction<User[]>>;
  coupons: Coupon[];
  setCoupons: React.Dispatch<React.SetStateAction<Coupon[]>>;
  tickets: SupportTicket[];
  setTickets: React.Dispatch<React.SetStateAction<SupportTicket[]>>;
  logs: ActivityLog[];
  setLogs: React.Dispatch<React.SetStateAction<ActivityLog[]>>;
  settings: Settings;
  updateSettings: (newSettings: Partial<Settings>) => void;
  toasts: Toast[];
  addToast: (message: string, type?: 'success' | 'error' | 'info' | 'warning') => void;
  removeToast: (id: string) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  showCommandPalette: boolean;
  setShowCommandPalette: (show: boolean) => void;
  impersonatedCompany: Company | null;
  setImpersonatedCompany: (company: Company | null) => void;
  addLog: (action: string, details: string, category: ActivityLog['category'], actor?: string) => void;
  selectedCurrency: string;
  setSelectedCurrency: (currency: string) => void;
  formatAmount: (amountInUSD: number, paymentCurrency?: string) => string;
  isFormDirty: boolean;
  setIsFormDirty: (dirty: boolean) => void;
  analyticsData: any;
  setAnalyticsData: React.Dispatch<React.SetStateAction<any>>;
  theme: 'dark' | 'light';
  setTheme: (theme: 'dark' | 'light') => void;
  toggleTheme: () => void;
}

export const CURRENCY_DETAILS: Record<string, { symbol: string; rate: number }> = {
  USD: { symbol: '$', rate: 1.0 },
  EUR: { symbol: '€', rate: 0.92 },
  INR: { symbol: '₹', rate: 83.0 },
  GBP: { symbol: '£', rate: 0.79 },
  CAD: { symbol: 'CA$', rate: 1.36 },
  AUD: { symbol: 'A$', rate: 1.50 },
  JPY: { symbol: '¥', rate: 155.0 }
};

const DashboardContext = createContext<DashboardContextType | undefined>(undefined);

import { api } from '../../../services/api';

export const filterActivePlans = (planList: any[]) => {
  if (!Array.isArray(planList)) return [];
  let deletedPlanIds = new Set<string>();
  try {
    const deletedRaw = localStorage.getItem('hrms_deleted_plan_ids');
    if (deletedRaw) {
      const parsed = JSON.parse(deletedRaw);
      if (Array.isArray(parsed)) {
        parsed.forEach(id => {
          if (id) {
            deletedPlanIds.add(String(id).toLowerCase());
            deletedPlanIds.add(String(id).toLowerCase().replace(/[^a-z0-9]/g, ''));
          }
        });
      }
    }
  } catch {}

  return planList.filter((p: any) => {
    if (!p || !p.id) return false;
    const idLower = String(p.id).toLowerCase();
    return !deletedPlanIds.has(idLower) && 
           !deletedPlanIds.has(idLower.replace(/[^a-z0-9]/g, ''));
  });
};

export const DashboardProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const defaultSettings: Settings = {
    platformName: 'SUPEROWNER HRMS',
    currency: 'INR',
    timezone: 'UTC+5:30',
    maintenanceMode: false,
    smtpServer: 'smtp.mailgun.org',
    smtpEmail: 'noreply@superowner.io',
    brandColor: '#6366f1',
    stripeEnabled: true,
    razorpayEnabled: true,
    paypalEnabled: true,
    stripeSecretKey: '',
    razorpayKeyId: 'rzp_live_Tb2olLw1YkeJRm',
    razorpaySecret: 'giWCJ9bxC3NcUSfvQvr5dp2i',
    realUpiId: 'itlc@upi'
  };

  const [activeTab, setActiveTab] = useState<string>('Dashboard');
  const [companies, setCompanies] = useState<Company[]>(() => {
    try {
      const saved = localStorage.getItem('hrms_companies_data');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {}
    return INITIAL_COMPANIES;
  });

  const [plans, setPlans] = useState<SubscriptionPlan[]>(() => {
    try {
      const saved = localStorage.getItem('hrms_subscription_plans');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return filterActivePlans(parsed);
      }
      const savedUnified = localStorage.getItem('multi_tenant_subscription_plans');
      if (savedUnified) {
        const parsedUnified = JSON.parse(savedUnified);
        if (Array.isArray(parsedUnified) && parsedUnified.length > 0) {
          return filterActivePlans(parsedUnified).map((p: any) => ({
            id: p.id,
            name: p.name,
            price: p.priceMonthly || 999,
            priceMonthly: p.priceMonthly || 999,
            priceAnnual: p.priceAnnual || Math.round((p.priceMonthly || 999) * 10),
            employeeLimit: p.seatLimit || 50,
            storageLimit: p.storageLimitGb || 20,
            aiCreditsLimit: 500,
            showOnLandingPage: p.showOnLandingPage !== false,
            tagline: p.tagline,
            badge: p.badge,
            highlightFeatures: p.highlightFeatures,
            features: {
              payroll: true,
              attendance: true,
              gpsAttendance: true,
              faceRecognition: true,
              recruitment: true,
              apiAccess: true,
              whiteLabel: true
            }
          }));
        }
      }
    } catch {}
    return filterActivePlans(INITIAL_PLANS);
  });

  const [payments, setPayments] = useState<Payment[]>(() => {
    try {
      const saved = localStorage.getItem('hrms_payments_data');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {}
    return INITIAL_PAYMENTS;
  });

  const [users, setUsers] = useState<User[]>(() => {
    try {
      const saved = localStorage.getItem('hrms_superowner_users');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {}
    return INITIAL_USERS;
  });

  const [coupons, setCoupons] = useState<Coupon[]>(() => {
    try {
      const saved = localStorage.getItem('hrms_coupons_data');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {}
    return INITIAL_COUPONS;
  });

  const [tickets, setTickets] = useState<SupportTicket[]>(() => {
    try {
      const saved = localStorage.getItem('hrms_support_tickets');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {}
    return INITIAL_TICKETS;
  });

  const [logs, setLogs] = useState<ActivityLog[]>(() => {
    try {
      const saved = localStorage.getItem('hrms_activity_logs');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {}
    return INITIAL_LOGS;
  });

  const [settings, setSettings] = useState<Settings>(() => {
    try {
      const saved = localStorage.getItem('hrms_global_settings');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && typeof parsed === 'object') return { ...defaultSettings, ...parsed };
      }
    } catch {}
    return defaultSettings;
  });

  const [analyticsData, setAnalyticsData] = useState<any>(null);

  // Unbreakable Permanent Local Storage Synchronization Triggers
  useEffect(() => {
    if (Array.isArray(companies)) {
      try {
        const saved = localStorage.getItem('hrms_companies_data');
        const next = JSON.stringify(companies);
        if (saved !== next) {
          localStorage.setItem('hrms_companies_data', next);
        }
      } catch {}
    }
  }, [companies]);

  useEffect(() => {
    if (plans && plans.length > 0) {
      try {
        const saved = localStorage.getItem('hrms_subscription_plans');
        const next = JSON.stringify(plans);
        if (saved !== next) {
          syncHrmsPlansListToUnifiedCatalog(plans);
        }
      } catch {}
    }
  }, [plans]);

  useEffect(() => {
    if (coupons && coupons.length > 0) {
      try {
        const saved = localStorage.getItem('hrms_coupons_data');
        const next = JSON.stringify(coupons);
        if (saved !== next) {
          localStorage.setItem('hrms_coupons_data', next);
        }
      } catch {}
    }
  }, [coupons]);

  useEffect(() => {
    if (payments && payments.length > 0) {
      try {
        const saved = localStorage.getItem('hrms_payments_data');
        const next = JSON.stringify(payments);
        if (saved !== next) {
          localStorage.setItem('hrms_payments_data', next);
        }
      } catch {}
    }
  }, [payments]);

  useEffect(() => {
    if (users && users.length > 0) {
      try {
        const saved = localStorage.getItem('hrms_superowner_users');
        const next = JSON.stringify(users);
        if (saved !== next) {
          localStorage.setItem('hrms_superowner_users', next);
        }
      } catch {}
    }
  }, [users]);

  useEffect(() => {
    if (tickets && tickets.length > 0) {
      try {
        const saved = localStorage.getItem('hrms_support_tickets');
        const next = JSON.stringify(tickets);
        if (saved !== next) {
          localStorage.setItem('hrms_support_tickets', next);
        }
      } catch {}
    }
  }, [tickets]);

  useEffect(() => {
    if (logs && logs.length > 0) {
      try {
        const saved = localStorage.getItem('hrms_activity_logs');
        const next = JSON.stringify(logs);
        if (saved !== next) {
          localStorage.setItem('hrms_activity_logs', next);
        }
      } catch {}
    }
  }, [logs]);

  useEffect(() => {
    if (settings) {
      try {
        const saved = localStorage.getItem('hrms_global_settings');
        const next = JSON.stringify(settings);
        if (saved !== next) {
          localStorage.setItem('hrms_global_settings', next);
        }
      } catch {}
    }
  }, [settings]);

  // Real-time synchronization listeners for Companies, Plans, Settings & Users
  useEffect(() => {
    const handleCompaniesEvent = async (e?: Event) => {
      const customEv = e as CustomEvent;
      if (customEv && customEv.detail && Array.isArray(customEv.detail)) {
        setCompanies(prev => JSON.stringify(prev) === JSON.stringify(customEv.detail) ? prev : customEv.detail);
      } else {
        try {
          const fresh = await api.getCompanies();
          if (Array.isArray(fresh)) {
            setCompanies(prev => JSON.stringify(prev) === JSON.stringify(fresh) ? prev : fresh);
          }
        } catch {}
      }
    };

    const handleSingleCompanyUpdated = (e: Event) => {
      const customEv = e as CustomEvent;
      if (customEv && customEv.detail && customEv.detail.id) {
        const updatedComp = customEv.detail;
        setCompanies(prev => {
          const exists = prev.some(c => c.id === updatedComp.id);
          if (exists) {
            return prev.map(c => c.id === updatedComp.id ? { ...c, ...updatedComp } : c);
          }
          return [updatedComp, ...prev];
        });
      }
    };

    const handleCompanyDeleted = (e: Event) => {
      const customEv = e as CustomEvent;
      if (customEv && customEv.detail && customEv.detail.id) {
        const delId = customEv.detail.id;
        setCompanies(prev => prev.filter(c => c.id !== delId));
      }
    };

    const handlePlansEvent = (e?: Event) => {
      try {
        const saved = localStorage.getItem('hrms_subscription_plans');
        if (saved) {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed)) {
            const filtered = filterActivePlans(parsed);
            setPlans(prev => JSON.stringify(prev) === JSON.stringify(filtered) ? prev : filtered);
          }
        }
      } catch {}
    };

    const handlePaymentsEvent = async () => {
      try {
        const freshPayments = await api.getSuperOwnerPayments();
        if (freshPayments && Array.isArray(freshPayments)) {
          setPayments(prev => JSON.stringify(prev) === JSON.stringify(freshPayments) ? prev : freshPayments);
        }
      } catch {}
    };

    window.addEventListener('subscription_plans_updated', handlePlansEvent);
    window.addEventListener('companies_updated', handleCompaniesEvent);
    window.addEventListener('company_updated', handleSingleCompanyUpdated);
    window.addEventListener('company_created', handleSingleCompanyUpdated);
    window.addEventListener('company_deleted', handleCompanyDeleted);
    window.addEventListener('multi_tenant_updated', handleCompaniesEvent);
    window.addEventListener('superowner_data_updated', handleCompaniesEvent);
    window.addEventListener('superowner_data_updated', handlePaymentsEvent);
    window.addEventListener('payment_received', handlePaymentsEvent);

    return () => {
      window.removeEventListener('subscription_plans_updated', handlePlansEvent);
      window.removeEventListener('companies_updated', handleCompaniesEvent);
      window.removeEventListener('company_updated', handleSingleCompanyUpdated);
      window.removeEventListener('company_created', handleSingleCompanyUpdated);
      window.removeEventListener('company_deleted', handleCompanyDeleted);
      window.removeEventListener('multi_tenant_updated', handleCompaniesEvent);
      window.removeEventListener('superowner_data_updated', handleCompaniesEvent);
      window.removeEventListener('superowner_data_updated', handlePaymentsEvent);
      window.removeEventListener('payment_received', handlePaymentsEvent);
    };
  }, []);
  
  useEffect(() => {
    const loadData = async () => {
      try {
        const companyList = await api.getCompanies();
        if (companyList && Array.isArray(companyList)) {
          // FOOLPROOF PARSING FOR modulesEnabled
          const fixedCompanies = companyList.map((c: any) => {
            let mods = c.modulesEnabled;
            if (typeof mods === 'string') {
              try { mods = JSON.parse(mods); } catch (e) {}
            }
            if (typeof mods === 'string') {
              try { mods = JSON.parse(mods); } catch (e) {}
            }
            if (!mods || typeof mods !== 'object') {
              mods = {};
            }
            return { ...c, modulesEnabled: mods };
          });
          setCompanies(prev => JSON.stringify(prev) === JSON.stringify(fixedCompanies) ? prev : fixedCompanies);
        }
      } catch (e) {
        console.error("Failed to load companies", e);
      }

      try {
        const ticketList = await api.getSuperOwnerTickets();
        if (ticketList && Array.isArray(ticketList)) {
          setTickets(prev => JSON.stringify(prev) === JSON.stringify(ticketList) ? prev : ticketList);
        }
      } catch (e) {
        console.error("Failed to load tickets", e);
      }

      try {
        const userList = await api.getSuperOwnerUsers();
        if (userList && Array.isArray(userList)) {
          setUsers(prev => JSON.stringify(prev) === JSON.stringify(userList) ? prev : userList);
        }
      } catch (e) {
        console.error("Failed to load users", e);
      }

      try {
        const paymentList = await api.getSuperOwnerPayments();
        if (paymentList && Array.isArray(paymentList)) {
          setPayments(prev => JSON.stringify(prev) === JSON.stringify(paymentList) ? prev : paymentList);
        }
      } catch (e) {
        console.error("Failed to load payments", e);
      }

      try {
        const fetchedPlans = await api.getPlans();
        if (fetchedPlans && Array.isArray(fetchedPlans)) {
          const safePlans = fetchedPlans.map((p: any) => ({
            ...p,
            price: p.price || p.priceMonthly || 499,
            priceMonthly: p.priceMonthly || p.price || 499,
            employeeLimit: p.employeeLimit || p.seatLimit || 50,
            storageLimit: p.storageLimit || p.storageLimitGb || 20,
            aiCreditsLimit: p.aiCreditsLimit || 500,
            features: {
              payroll: true,
              attendance: true,
              recruitment: false,
              faceRecognition: false,
              gpsAttendance: false,
              apiAccess: false,
              whiteLabel: false,
              ...(typeof p.features === 'object' && p.features !== null ? p.features : {})
            }
          }));
          setPlans(prev => JSON.stringify(prev) === JSON.stringify(safePlans) ? prev : safePlans);
        }
      } catch (e) {
        console.error("Failed to load plans", e);
      }

      try {
        const fetchedCoupons = await api.getCoupons();
        if (fetchedCoupons && Array.isArray(fetchedCoupons)) {
          const mappedCoupons = fetchedCoupons.map((c: any) => ({
            id: c.id,
            code: c.code,
            discountType: c.discountType,
            value: c.discountValue !== undefined ? c.discountValue : (c.value || 0),
            discountValue: c.discountValue !== undefined ? c.discountValue : (c.value || 0),
            expiryDate: c.validUntil || c.expiryDate || '',
            validUntil: c.validUntil || c.expiryDate || '',
            usageLimit: c.usageLimit || 0,
            usageCount: c.usedCount !== undefined ? c.usedCount : (c.usageCount || 0),
            usedCount: c.usedCount !== undefined ? c.usedCount : (c.usageCount || 0),
            status: c.status || 'inactive'
          }));
          setCoupons(prev => JSON.stringify(prev) === JSON.stringify(mappedCoupons) ? prev : mappedCoupons);
        }
      } catch (e) {
        console.error("Failed to load coupons", e);
      }

      try {
        const analytics = await api.getSuperOwnerAnalytics();
        if (analytics) {
          setAnalyticsData(prev => JSON.stringify(prev) === JSON.stringify(analytics) ? prev : analytics);
        }
      } catch (e) {
        console.error("Failed to load analytics", e);
      }

      try {
        const fetchedLogs = await api.getLogs();
        if (fetchedLogs && Array.isArray(fetchedLogs)) {
          setLogs(prev => JSON.stringify(prev) === JSON.stringify(fetchedLogs) ? prev : fetchedLogs);
        }
      } catch (e) {
        console.error("Failed to load logs", e);
      }

      try {
        const globalSettings = await api.getGlobalSettings();
        if (globalSettings) {
          setSettings(prev => JSON.stringify(prev) === JSON.stringify(globalSettings) ? prev : { ...prev, ...globalSettings });
        }
      } catch (e) {
        console.error("Failed to load settings", e);
      }
    };

    loadData();

    let syncTimer: any = null;
    const handleSyncEvent = () => {
      if (syncTimer) clearTimeout(syncTimer);
      syncTimer = setTimeout(() => {
        loadData();
      }, 400);
    };

    window.addEventListener('subscription_updated', handleSyncEvent);
    window.addEventListener('multi_tenant_updated', handleSyncEvent);
    window.addEventListener('superowner_data_updated', handleSyncEvent);

    return () => {
      if (syncTimer) clearTimeout(syncTimer);
      window.removeEventListener('subscription_updated', handleSyncEvent);
      window.removeEventListener('multi_tenant_updated', handleSyncEvent);
      window.removeEventListener('superowner_data_updated', handleSyncEvent);
    };
  }, []);

  const [impersonatedCompany, setImpersonatedCompany] = useState<Company | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [showCommandPalette, setShowCommandPalette] = useState<boolean>(false);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [isFormDirty, setIsFormDirty] = useState<boolean>(false);

  const [theme, setThemeState] = useState<'dark' | 'light'>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('superowner_theme');
      if (saved === 'light' || saved === 'dark') return saved;
      if (document.documentElement.classList.contains('light')) return 'light';
    }
    return 'light';
  });

  const setTheme = (newTheme: 'dark' | 'light') => {
    setThemeState(newTheme);
    if (typeof window !== 'undefined') {
      localStorage.setItem('superowner_theme', newTheme);
      if (newTheme === 'dark') {
        document.documentElement.classList.add('dark');
        document.documentElement.classList.remove('light');
      } else {
        document.documentElement.classList.add('light');
        document.documentElement.classList.remove('dark');
      }
    }
  };

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  useEffect(() => {
    if (typeof window !== 'undefined') {
      if (theme === 'dark') {
        document.documentElement.classList.add('dark');
        document.documentElement.classList.remove('light');
      } else {
        document.documentElement.classList.add('light');
        document.documentElement.classList.remove('dark');
      }
    }
  }, [theme]);

  const [selectedCurrency, setSelectedCurrency] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('superowner_currency') || 'USD';
    }
    return 'USD';
  });

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('superowner_currency', selectedCurrency);
    }
  }, [selectedCurrency]);

  const formatAmount = (amount: number, paymentCurrency?: string) => {
    const sourceCurrency = paymentCurrency || 'INR';
    let amountInINR = Number(amount) || 0;
    if (sourceCurrency === 'USD') {
      amountInINR = amount * 83.0;
    } else if (sourceCurrency === 'EUR') {
      amountInINR = (amount / 0.92) * 83.0;
    } else if (sourceCurrency === 'GBP') {
      amountInINR = (amount / 0.79) * 83.0;
    }

    const target = selectedCurrency || 'INR';
    let targetAmount = amountInINR;
    if (target === 'USD') {
      targetAmount = amountInINR / 83.0;
    } else if (target === 'EUR') {
      targetAmount = (amountInINR / 83.0) * 0.92;
    } else if (target === 'GBP') {
      targetAmount = (amountInINR / 83.0) * 0.79;
    } else if (target === 'INR') {
      targetAmount = amountInINR;
    }

    const details = CURRENCY_DETAILS[target] || CURRENCY_DETAILS.INR || { symbol: '₹' };
    if (target === 'INR') {
      return `${details.symbol}${Math.round(targetAmount).toLocaleString()}`;
    }
    return `${details.symbol}${targetAmount.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`;
  };

  const addToast = (message: string, type: Toast['type'] = 'success') => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => removeToast(id), 4000);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const updateSettings = async (newSettings: Partial<Settings>) => {
    try {
      const updated = { ...settings, ...newSettings };
      localStorage.setItem('hrms_global_settings', JSON.stringify(updated));
      if (updated.razorpayKeyId) {
        localStorage.setItem('razorpay_config', JSON.stringify({
          keyId: updated.razorpayKeyId,
          keySecret: updated.razorpaySecret || '',
          enabled: true
        }));
      }
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new Event('storage'));
      }
      await api.updateGlobalSettings(updated);
      setSettings(updated);
      addToast('System settings updated successfully', 'success');
      addLog('Settings Updated', 'Platform global settings modified.', 'settings', 'Priya Sharma');
    } catch (e) {
      addToast('Failed to update system settings', 'error');
    }
  };

  const addLog = (
    action: string,
    details: string,
    category: ActivityLog['category'],
    actor = 'Priya Sharma'
  ) => {
    const newLogData = {
      id: `log_${Math.random().toString(36).substring(2, 9)}`,
      action,
      details,
      category,
      actorName: actor
    };
    
    // Optimistic update
    setLogs((prev) => [{ ...newLogData, timestamp: new Date().toISOString() } as ActivityLog, ...prev]);
    
    // Background sync to backend
    api.createLog(newLogData).catch(e => console.error("Failed to sync log", e));
  };

  // Keyboard shortcut Ctrl+K for command palette
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setShowCommandPalette(true);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <DashboardContext.Provider
      value={{
        activeTab,
        setActiveTab,
        companies,
        setCompanies,
        plans,
        setPlans,
        payments,
        setPayments,
        users,
        setUsers,
        coupons,
        setCoupons,
        tickets,
        setTickets,
        logs,
        setLogs,
        settings,
        updateSettings,
        toasts,
        addToast,
        removeToast,
        searchQuery,
        setSearchQuery,
        showCommandPalette,
        setShowCommandPalette,
        impersonatedCompany,
        setImpersonatedCompany,
        addLog,
        selectedCurrency,
        setSelectedCurrency,
        formatAmount,
        isFormDirty,
        setIsFormDirty,
        analyticsData,
        setAnalyticsData,
        theme,
        setTheme,
        toggleTheme
      }}
    >
      {children}
    </DashboardContext.Provider>
  );
};

export const useDashboard = () => {
  const context = useContext(DashboardContext);
  if (!context) {
    throw new Error('useDashboard must be used within a DashboardProvider');
  }
  return context;
};
