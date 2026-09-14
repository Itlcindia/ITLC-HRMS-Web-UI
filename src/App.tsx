import { useState, useEffect } from 'react';
import LandingPage from './components/LandingPage';
import LoginForm from './components/LoginForm';
import SuperownerLogin from './components/SuperownerLogin';
import EmployeeApp from './components/employee/EmployeeApp';
import AdminApp from './components/admin/AdminApp';
import ManagerApp from './components/manager/ManagerApp';
import { App as SuperownerApp } from './components/superowner/SuperownerApp';
import { DashboardProvider } from './components/superowner/context/DashboardContext';
import { api } from './services/api';
import Subscription from './components/admin/Subscription';

export const resolveUserRole = (profileData: any): 'superowner' | 'admin' | 'manager' | 'employee' => {
  if (!profileData) return 'employee';
  const role = (profileData.role || profileData.systemRole || '').toLowerCase().trim();
  const email = (profileData.email || '').toLowerCase().trim();
  const designation = (profileData.designation || '').toLowerCase().trim();

  let isCustomSuper = false;
  try {
    const soUsersRaw = localStorage.getItem('hrms_superowner_users');
    if (soUsersRaw) {
      const soUsers = JSON.parse(soUsersRaw);
      if (Array.isArray(soUsers) && soUsers.some((u: any) => u && u.email && u.email.toLowerCase().trim() === email && String(u.role).toLowerCase().includes('super'))) {
        isCustomSuper = true;
      }
    }
    if (!isCustomSuper) {
      const addRaw = localStorage.getItem('hrms_additional_superowners');
      if (addRaw) {
        const addList = JSON.parse(addRaw);
        if (Array.isArray(addList) && addList.some((so: any) => so && so.email && so.email.toLowerCase().trim() === email)) {
          isCustomSuper = true;
        }
      }
    }
  } catch {}

  if (
    isCustomSuper ||
    role.includes('superowner') || 
    role.includes('super owner') || 
    role.includes('superadmin') || 
    role.includes('super admin') || 
    role.includes('super_admin') || 
    role.includes('super-admin') || 
    role === 'super owner' ||
    role === 'super admin' ||
    email === 'superowner@itlc.com' || 
    email === 'superowner@itlc.cloud' || 
    email === 'owner@itlc.cloud' || 
    email === 'superadmin@itlc.cloud' || 
    email === 'superadmin@itlccrm.com' || 
    email === 'priyanshupushkar263@gmail.com' ||
    email.includes('superowner') ||
    email.includes('superadmin')
  ) {
    return 'superowner';
  }

  if (
    role.includes('admin') || 
    role.includes('hr') || 
    role.includes('owner') || 
    role.includes('director') || 
    role.includes('administrator') ||
    designation.includes('hr') ||
    designation.includes('director') ||
    designation.includes('administrator')
  ) {
    return 'admin';
  }

  if (role.includes('manager') || role.includes('lead') || designation.includes('manager') || designation.includes('lead')) {
    return 'manager';
  }

  return 'employee';
};

export default function App() {
  const [view, setView] = useState<'landing' | 'login' | 'superowner-login' | 'employee' | 'admin' | 'superowner' | 'manager'>('landing');
  const [loggedInEmail, setLoggedInEmail] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [profile, setProfile] = useState<any>(null);

  const loadProfile = async (forceDashboard = false) => {
    try {
      // Auto-purge any stale test company tokens or cached active tenants (e.g. Quota Limited Corp)
      try {
        const cachedActive = localStorage.getItem('itlc_active_tenant');
        if (cachedActive && (cachedActive.includes('Quota Limited') || cachedActive.includes('comp_limit_') || cachedActive.includes('admin_comp_limit_'))) {
          localStorage.removeItem('itlc_active_tenant');
        }
        const cachedProfile = localStorage.getItem('hrms_user_profile');
        if (cachedProfile && (cachedProfile.includes('Quota Limited') || cachedProfile.includes('comp_limit_') || cachedProfile.includes('admin_comp_limit_'))) {
          localStorage.removeItem('hrms_user_profile');
          localStorage.removeItem('hrms_jwt_token');
        }
      } catch {}

      const token = localStorage.getItem('hrms_jwt_token');
      const path = window.location.pathname;
      const search = window.location.search;
      const hash = window.location.hash;
      const isSuperownerRoute = path === '/superowner' || search.includes('superowner') || hash === '#superowner' || hash.includes('superowner');

      if (token) {
        const profileData = await api.getProfile();
        setProfile(profileData);
        setLoggedInEmail(profileData.email);

        const targetRole = resolveUserRole(profileData);
        console.log('App.tsx loadProfile JSON:', JSON.stringify({ targetRole, profileData }));

        if (targetRole === 'superowner') {
          localStorage.removeItem('itlc_active_tenant');
          setView('superowner');
          return;
        }

        if (isSuperownerRoute) {
          if (window.location.pathname === '/superowner' || search.includes('superowner') || hash.includes('superowner')) {
            window.history.replaceState({}, '', '/');
          }
          setView(targetRole);
        } else if (!forceDashboard && (hash === '#landing' || search.includes('landing'))) {
          setView('landing');
        } else {
          setView(targetRole);
        }
      } else {
        if (isSuperownerRoute) {
          setView('superowner-login');
        } else if (path === '/login' || search.includes('login') || hash === '#login') {
          setView('login');
        } else {
          setView('landing');
        }
      }
    } catch (e: any) {
      console.error("Failed to load profile:", e);
      const isAuthError = e.message && (e.message.includes('401') || e.message.includes('Unauthorized') || e.message.includes('status: 401'));
      if (isAuthError) {
        localStorage.removeItem('hrms_jwt_token');
        setView('landing');
      } else {
        console.warn("Temporary network or server reboot issue. Retrying silently.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadProfile();
    const handleHashChange = () => {
      loadProfile();
    };
    window.addEventListener('hashchange', handleHashChange);
    return () => {
      window.removeEventListener('hashchange', handleHashChange);
    };
  }, []);

  const handleSuccessLogin = () => {
    if (window.location.hash || window.location.search) {
      window.history.replaceState({}, '', '/');
    }
    loadProfile(true);
  };

  const handleLogout = async () => {
    try { await api.logout(); } catch {}
    localStorage.removeItem('hrms_jwt_token');
    localStorage.removeItem('hrms_user_profile');
    localStorage.removeItem('itlc_active_tenant');
    localStorage.removeItem('crm_auth_session');
    localStorage.removeItem('crm_current_user');
    localStorage.removeItem('hrms_mock_profile');
    sessionStorage.removeItem('crm_auth_session');
    if (window.location.hash || window.location.search || window.location.pathname === '/superowner') {
      window.history.replaceState({}, '', '/');
    }
    setLoggedInEmail('');
    setProfile(null);
    setView('landing');
  };

  if (isLoading) {
    return (
      <div className="h-screen w-full flex flex-col items-center justify-between bg-slate-950 text-white font-sans py-12 relative overflow-hidden select-none">
        {/* Decorative ambient background glows */}
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-indigo-500/10 blur-[120px] pointer-events-none" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-purple-500/10 blur-[120px] pointer-events-none" />
        
        {/* Empty top spacing for centering */}
        <div className="h-8" />

        {/* Center: Video/Logo and Loading Text */}
        <div className="flex flex-col items-center gap-6 z-10">
          <div className="relative w-40 h-40 rounded-3xl overflow-hidden border border-indigo-500/20 bg-slate-900/50 shadow-2xl flex items-center justify-center">
            {/* If video exists, play it, otherwise fallback to standard spinner */}
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
              Loading OmniStaff...
            </span>
          </div>
        </div>

        {/* Bottom branding: Powered by ITLC Lucknow */}
        <div className="flex flex-col items-center gap-1.5 z-10">
          <span className="text-xs font-semibold text-slate-400 tracking-wider">
            Powered by <strong className="text-white font-bold">ITLC Lucknow</strong>
          </span>
          <span className="text-[8px] text-slate-500 tracking-widest uppercase font-extrabold">
            Secure Workspace Environment
          </span>
        </div>

        {/* Custom CSS for loading slide animation */}
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
      <div className="min-h-screen w-full flex flex-col items-center bg-slate-900 text-white font-sans overflow-y-auto py-10">
        <div className="w-full max-w-6xl p-6 relative">
          <div className="bg-rose-500/10 text-rose-400 p-4 rounded-xl border border-rose-500/20 mb-6 flex items-start gap-4 shadow-lg shadow-rose-900/20">
            <div className="h-10 w-10 shrink-0 bg-rose-500/20 rounded-full flex items-center justify-center font-bold text-xl">!</div>
            <div>
              <h3 className="font-bold text-lg">Subscription Expired</h3>
              <p className="text-sm opacity-80 mt-1">Your company's trial or subscription tier has expired. Please select a plan below to continue using the platform.</p>
            </div>
            <button onClick={handleLogout} className="ml-auto px-5 py-2.5 bg-slate-800 hover:bg-slate-700 rounded-lg text-xs font-bold transition-all shadow-md">
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
      <div className="h-screen w-full flex flex-col items-center justify-center bg-slate-900 text-white font-sans p-6 text-center">
        <div className="max-w-md space-y-6">
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
          <SuperownerApp onLogout={handleLogout} />
        </div>
      </DashboardProvider>
    );
  }

  if (view === 'landing') {
    return (
      <LandingPage 
        onOpenLogin={() => setView('login')}
        onOpenSuperowner={() => setView('superowner-login')}
        loggedInUser={profile}
        onGoToDashboard={() => {
          if (profile) {
            setView(resolveUserRole(profile));
          } else {
            setView('login');
          }
        }}
        onSuccessLogin={handleSuccessLogin}
      />
    );
  }

  return (
    <main className="h-screen w-full flex items-center justify-center p-2 sm:p-4 md:p-6 bg-[#fafbfc] text-slate-800 relative font-sans overflow-hidden">
      {/* Back to Website Button */}
      <button
        onClick={() => {
          window.location.hash = '';
          setView('landing');
        }}
        className="absolute top-4 left-4 z-20 flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-white/90 backdrop-blur border border-slate-200 text-xs font-bold text-slate-700 hover:text-sky-600 hover:bg-white shadow-sm transition cursor-pointer"
      >
        <span>← Back to Website</span>
      </button>

      {/* Bounded background visual elements container to prevent unwanted scroll extensions */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
        {/* Subtle global grid pattern overlay */}
        <div className="absolute inset-0 bg-grid-pattern" />

        {/* Ambient background glow & floating abstract blobs */}
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-indigo-400/8 blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-purple-400/8 blur-[120px]" />
        
        {/* Floating abstract blobs */}
        <div className="hidden md:block absolute top-1/4 left-[5%] w-72 h-72 rounded-full bg-gradient-to-tr from-indigo-300/12 to-purple-300/8 blur-[90px] animate-blob-1" />
        <div className="hidden md:block absolute bottom-1/4 right-[5%] w-80 h-80 rounded-full bg-gradient-to-tr from-purple-300/10 to-pink-300/8 blur-[100px] animate-blob-2" />
        <div className="hidden md:block absolute top-1/3 right-1/3 w-64 h-64 rounded-full bg-gradient-to-tr from-violet-300/8 to-indigo-300/10 blur-[80px] animate-blob-3" />
      </div>

      {/* Main card centered on screen */}
      <div className="w-full max-w-[480px] sm:max-w-[540px] md:max-w-3xl lg:max-w-[960px] h-auto relative z-10 flex items-center justify-center mx-auto">
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
  );
}
