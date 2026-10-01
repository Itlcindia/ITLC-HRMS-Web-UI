import { useState, useEffect } from 'react';
import LoginForm from './components/LoginForm';
import SuperownerLogin from './components/SuperownerLogin';
import EmployeeApp from './components/employee/EmployeeApp';
import AdminApp from './components/admin/AdminApp';
import ManagerApp from './components/manager/ManagerApp';
import { App as SuperownerApp } from './components/superowner/SuperownerApp';
import { DashboardProvider } from './components/superowner/context/DashboardContext';
import { api } from './services/api';
import Subscription from './components/admin/Subscription';
import { CompanyRegisterPage } from '../components/CompanyRegisterPage';
import { Briefcase, Globe, Users } from 'lucide-react';
import './index.css';
import './App.css';

export interface OmniStaffAppProps {
  onOpenIntroHub?: () => void;
  onChooseWorkspace?: (profile: any) => void;
  onLogout?: () => void;
  onSwitchToCRM?: () => void;
}

export default function App({ onOpenIntroHub, onChooseWorkspace, onLogout, onSwitchToCRM }: OmniStaffAppProps) {
  const [isRegisteringCompany, setIsRegisteringCompany] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    return window.location.hash === '#register' || window.location.hash.includes('register');
  });

  const [profile, setProfile] = useState<any>(() => {
    try {
      const saved = localStorage.getItem('hrms_user_profile');
      if (saved) return JSON.parse(saved);
    } catch {}
    return null;
  });

  const [loggedInEmail, setLoggedInEmail] = useState<string>(() => {
    try {
      const saved = localStorage.getItem('hrms_user_profile');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && parsed.email) return parsed.email;
      }
    } catch {}
    return '';
  });

  const [view, setView] = useState<'login' | 'superowner-login' | 'employee' | 'admin' | 'superowner' | 'manager'>(() => {
    if (typeof window === 'undefined') return 'login';
    const path = window.location.pathname.toLowerCase();
    const search = window.location.search.toLowerCase();
    const hash = window.location.hash.toLowerCase();
    const isSuperownerRoute = path === '/superowner' || path.includes('superowner') || search.includes('superowner') || hash.includes('superowner');

    const token = localStorage.getItem('hrms_jwt_token');
    const saved = localStorage.getItem('hrms_user_profile');
    let userRole = '';
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed && parsed.role) userRole = parsed.role;
      } catch {}
    }

    if (token || userRole) {
      if (userRole === 'Super Owner') return 'superowner';
      if (userRole === 'Company Admin' || userRole === 'HR' || userRole === 'Admin') return 'admin';
      if (userRole === 'Manager') return 'manager';
      if (userRole === 'Employee' || userRole === 'Sales Rep') return 'employee';
      if (isSuperownerRoute) return 'superowner';
      return 'admin';
    }

    if (isSuperownerRoute) return 'superowner-login';
    return 'login';
  });

  const [isLoading, setIsLoading] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    const token = localStorage.getItem('hrms_jwt_token');
    const saved = localStorage.getItem('hrms_user_profile');
    // If user has cached profile or token, don't show blocking spinner
    return Boolean(!token && !saved && window.location.hash.includes('loading'));
  });

  const loadProfile = async () => {
    try {
      const token = localStorage.getItem('hrms_jwt_token');
      const cachedRaw = localStorage.getItem('hrms_user_profile');
      let cachedProfile: any = null;
      if (cachedRaw) {
        try { cachedProfile = JSON.parse(cachedRaw); } catch {}
      }

      if (token || cachedProfile) {
        let profileData = cachedProfile;
        try {
          const remoteData = await api.getProfile();
          if (remoteData && (remoteData.email || remoteData.name)) {
            profileData = remoteData;
          }
        } catch (fetchErr) {
          console.warn("Using verified local / cached profile session:", fetchErr);
        }

        if (profileData) {
          setProfile(profileData);
          setLoggedInEmail(profileData.email || '');

          const path = window.location.pathname.toLowerCase();
          const search = window.location.search.toLowerCase();
          const hash = window.location.hash.toLowerCase();
          const isSuperownerRoute = path === '/superowner' || path.includes('superowner') || search.includes('superowner') || hash.includes('superowner');

          if (isSuperownerRoute) {
            if (profileData.role === 'Super Owner') {
              setView('superowner');
            } else if (profileData.role === 'Company Admin' || profileData.role === 'HR' || profileData.role === 'Admin') {
              window.location.hash = '';
              setView('admin');
            } else if (profileData.role === 'Manager') {
              window.location.hash = '';
              setView('manager');
            } else {
              window.location.hash = '';
              setView('employee');
            }
          } else {
            if (profileData.role === 'Super Owner') {
              setView('superowner');
            } else if (profileData.role === 'Company Admin' || profileData.role === 'HR' || profileData.role === 'Admin') {
              setView('admin');
            } else if (profileData.role === 'Manager') {
              setView('manager');
            } else {
              setView('employee');
            }
          }
        } else {
          setView('login');
        }
      } else {
        const path = window.location.pathname.toLowerCase();
        const search = window.location.search.toLowerCase();
        const hash = window.location.hash.toLowerCase();
        const isSuperownerRoute = path === '/superowner' || path.includes('superowner') || search.includes('superowner') || hash.includes('superowner');
        if (isSuperownerRoute) {
          setView('superowner-login');
        } else {
          setView('login');
        }
      }
    } catch (e: any) {
      console.error("Failed to load profile:", e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadProfile();

    const handleHash = () => {
      if (typeof window !== 'undefined') {
        const hash = window.location.hash.toLowerCase();
        if (hash === '#register' || hash.includes('register')) {
          setIsRegisteringCompany(true);
        } else {
          setIsRegisteringCompany(false);
        }
      }
    };
    window.addEventListener('hashchange', handleHash);
    return () => window.removeEventListener('hashchange', handleHash);
  }, []);

  const handleSuccessLogin = async () => {
    await loadProfile();
  };

  const handleLogout = async () => {
    await api.logout();
    setLoggedInEmail('');
    setProfile(null);
    if (typeof window !== 'undefined') {
      window.location.hash = '';
    }
    setView('login');
    if (onLogout) {
      onLogout();
    } else if (onOpenIntroHub) {
      onOpenIntroHub();
    }
  };

  const renderLoginNavbar = () => (
    <header className="w-full bg-slate-900/95 backdrop-blur-md border-b border-slate-800 text-white px-4 sm:px-8 py-3 flex items-center justify-between z-50 sticky top-0 shadow-lg">
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-indigo-500 to-purple-600 p-0.5 shadow-md flex items-center justify-center">
          <div className="w-full h-full bg-slate-900 rounded-[10px] flex items-center justify-center overflow-hidden">
            <img 
              src="/itlc_logo.png" 
              alt="ITLC" 
              className="w-6 h-6 object-contain"
            />
          </div>
        </div>
        <div>
          <div className="flex items-center gap-2">
            <span className="font-extrabold text-sm tracking-tight text-white">ITLC OmniStaff</span>
            <span className="text-[10px] font-bold px-2 py-0.5 bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 rounded-full">HRMS Enterprise</span>
          </div>
          <p className="text-[10px] text-slate-400 hidden sm:block">Human Capital Management & Workforce Intelligence</p>
        </div>
      </div>

      <div className="flex items-center gap-2.5">
        {onOpenIntroHub && (
          <button
            onClick={onOpenIntroHub}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white border border-white/10 text-xs font-semibold transition-all cursor-pointer"
            title="Open ITLC Main Landing & Portfolio"
          >
            <Globe size={13} className="text-slate-400" />
            <span className="hidden sm:inline">Main</span> Home
          </button>
        )}
      </div>
    </header>
  );

  if (isLoading) {
    return (
      <div className="h-screen w-full flex flex-col items-center justify-between bg-slate-950 text-white font-sans py-12 relative overflow-hidden select-none">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-indigo-500/10 blur-[120px] pointer-events-none" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-purple-500/10 blur-[120px] pointer-events-none" />
        <div className="h-8" />
        <div className="flex flex-col items-center gap-6 z-10">
          <div className="relative w-40 h-40 rounded-3xl overflow-hidden border border-indigo-500/20 bg-slate-900/50 shadow-2xl flex items-center justify-center">
            <video 
              src="/splash.mp4" 
              autoPlay 
              loop 
              muted 
              playsInline 
              className="w-full h-full object-cover"
            />
          </div>
          <div className="flex flex-col items-center gap-2">
            <div className="h-1 w-24 bg-slate-800 rounded-full overflow-hidden relative">
              <div className="h-full bg-gradient-to-r from-indigo-500 to-violet-600 rounded-full animate-[loading_1.5s_infinite]" style={{ width: '100%', position: 'absolute' }} />
            </div>
            <span className="text-[10px] text-slate-400 font-extrabold tracking-widest uppercase mt-1">
              Loading OmniStaff Workspace...
            </span>
          </div>
        </div>
        <div className="flex flex-col items-center gap-1.5 z-10">
          <span className="text-xs font-semibold text-slate-400 tracking-wider">
            Powered by <strong className="text-white font-bold">ITLC Lucknow</strong>
          </span>
          <span className="text-[8px] text-slate-500 tracking-widest uppercase font-extrabold">
            Secure Enterprise Environment
          </span>
        </div>
        <style dangerouslySetInnerHTML={{__html: `
          @keyframes loading {
            0% { left: -100%; }
            100% { left: 100%; }
          }
        `}} />
      </div>
    );
  }

  if (view !== 'superowner' && view !== 'superowner-login' && profile?.companyDetails?.status === 'expired') {
    return (
      <div className="min-h-screen w-full flex flex-col items-center bg-slate-900 text-white font-sans overflow-y-auto">
        {renderLoginNavbar()}
        <div className="w-full max-w-6xl p-6 relative">
          <div className="bg-rose-500/10 text-rose-400 p-4 rounded-xl border border-rose-500/20 mb-6 flex items-start gap-4 shadow-lg shadow-rose-900/20">
            <div className="h-10 w-10 shrink-0 bg-rose-500/20 rounded-full flex items-center justify-center font-bold text-xl">!</div>
            <div>
              <h3 className="font-bold text-lg">Subscription Expired</h3>
              <p className="text-sm opacity-80 mt-1">Your company's trial or subscription tier has expired. Please select a plan below to continue using the platform.</p>
            </div>
            <button onClick={handleLogout} className="ml-auto px-5 py-2.5 bg-slate-800 hover:bg-slate-700 rounded-lg text-xs font-bold transition-all shadow-md cursor-pointer">
              Logout
            </button>
          </div>
          <div className="bg-slate-800 rounded-2xl p-2 sm:p-6 border border-slate-700 shadow-2xl">
             <Subscription onSubscriptionUpdate={loadProfile} /> 
          </div>
        </div>
      </div>
    );
  }

  if (view !== 'superowner' && view !== 'superowner-login' && profile?.companyDetails?.status === 'suspended') {
    return (
      <div className="h-screen w-full flex flex-col items-center justify-center bg-slate-900 text-white font-sans text-center">
        {renderLoginNavbar()}
        <div className="max-w-md space-y-6 p-6">
          <div className="h-16 w-16 mx-auto bg-amber-500/10 text-amber-500 rounded-full flex items-center justify-center border border-amber-500/20">
            <span className="text-2xl font-bold">!</span>
          </div>
          <div className="space-y-2">
            <h2 className="text-xl font-extrabold tracking-tight">Account Suspended</h2>
            <p className="text-sm text-slate-400">
              Your company account has been temporarily suspended. Please contact platform support.
            </p>
          </div>
          <button
            onClick={handleLogout}
            className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold transition-all shadow-md cursor-pointer"
          >
            Logout / Switch Account
          </button>
        </div>
      </div>
    );
  }

  if (view === 'employee') {
    return (
      <div className="dashboard-theme flex-grow min-h-screen flex flex-col">
        <EmployeeApp loggedInEmail={loggedInEmail} onLogout={handleLogout} />
      </div>
    );
  }

  if (view === 'admin') {
    return (
      <div className="dashboard-theme flex-grow min-h-screen flex flex-col">
        <AdminApp loggedInEmail={loggedInEmail} onLogout={handleLogout} />
      </div>
    );
  }

  if (view === 'manager') {
    return (
      <div className="dashboard-theme flex-grow min-h-screen flex flex-col">
        <ManagerApp onLogout={handleLogout} />
      </div>
    );
  }

  if (view === 'superowner') {
    return (
      <DashboardProvider>
        <div className="dashboard-theme flex-grow min-h-screen flex flex-col">
          <SuperownerApp 
            onLogout={handleLogout}
            onOpenIntroHub={onOpenIntroHub}
          />
        </div>
      </DashboardProvider>
    );
  }

  if (isRegisteringCompany) {
    return (
      <CompanyRegisterPage 
        initialPlanId="growth"
        onBackToHome={() => {
          setIsRegisteringCompany(false);
          window.location.hash = '';
        }}
        onCompleteRegistration={async (newTenant) => {
          setIsRegisteringCompany(false);
          window.location.hash = '';
          await loadProfile();
        }}
      />
    );
  }

  return (
    <div className="min-h-screen w-full flex flex-col bg-[#fafbfc] relative overflow-hidden">
      {/* Top Floating Subtle Controls */}
      <div className="absolute top-4 right-4 z-50 flex items-center gap-2">
      </div>

      <main className="flex-1 w-full flex items-center justify-center p-3 sm:p-6 md:p-8 bg-[#fafbfc] text-slate-800 relative font-sans overflow-hidden">
        <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
          <div className="absolute inset-0 bg-grid-pattern" />
          <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-indigo-400/8 blur-[120px]" />
          <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-purple-400/8 blur-[120px]" />
          <div className="hidden md:block absolute top-1/4 left-[5%] w-72 h-72 rounded-full bg-gradient-to-tr from-indigo-300/12 to-purple-300/8 blur-[90px] animate-blob-1" />
          <div className="hidden md:block absolute bottom-1/4 right-[5%] w-80 h-80 rounded-full bg-gradient-to-tr from-purple-300/10 to-pink-300/8 blur-[100px] animate-blob-2" />
          <div className="hidden md:block absolute top-1/3 right-1/3 w-64 h-64 rounded-full bg-gradient-to-tr from-violet-300/8 to-indigo-300/10 blur-[80px] animate-blob-3" />
        </div>

        <div className="w-full max-w-[500px] sm:max-w-[560px] md:max-w-3xl lg:max-w-[1020px] h-auto relative z-10 flex items-center justify-center mx-auto">
          {view === 'superowner-login' ? (
            <SuperownerLogin onSuccessLogin={handleSuccessLogin} />
          ) : (
            <LoginForm 
              onSuccessLogin={handleSuccessLogin} 
              isSuperownerMode={false} 
            />
          )}
        </div>
      </main>
    </div>
  );
}
