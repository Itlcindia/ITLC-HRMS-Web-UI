import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  ToggleLeft, ToggleRight, Check, X, ShieldAlert, Sparkles, 
  HelpCircle, Eye, RefreshCw, Cpu, Smartphone, Lock
} from 'lucide-react';
import { useDashboard } from '../context/DashboardContext';
import { api } from '../../../services/api';

const MODULES_LIST = [
  { key: 'attendance', label: 'Attendance', desc: 'Clock-in/out registry logs' },
  { key: 'leave', label: 'Leave', desc: 'Vacation request approvals' },
  { key: 'payroll', label: 'Payroll', desc: 'Salary slip generation' },
  { key: 'recruitment', label: 'Recruitment', desc: 'Job board applicant pipeline' },
  { key: 'performance', label: 'Performance', desc: 'Quarterly reviews & KPIs' },
  { key: 'assets', label: 'Assets', desc: 'Company hardware tracking' },
  { key: 'training', label: 'Training', desc: 'Employee online courses' },
  { key: 'aiReports', label: 'AI Reports', desc: 'Gemini-assisted analytics' },
  { key: 'chat', label: 'Chat', desc: 'Internal coworker messenger' },
  { key: 'projects', label: 'Projects', desc: 'Kanban boards and tasks' },
  { key: 'faceRecognition', label: 'Face Recognition', desc: 'AI tablet check-in system' },
  { key: 'gpsTracking', label: 'GPS Attendance', desc: 'Geofenced mobile check-in' },
  { key: 'mobileApp', label: 'Mobile App', desc: 'Android / iOS application access' },
  { key: 'api', label: 'API Access', desc: 'Sync endpoints access' },
  { key: 'whiteLabel', label: 'White Labeling', desc: 'Custom domain and branding' }
];

const getModuleStyle = (key: string, isEnabled: boolean) => {
  if (!isEnabled) {
    return {
      cardClass: 'bg-white/1 border-white/5 hover:border-white/10 text-slate-400',
      labelClass: 'text-slate-400 font-semibold',
      iconClass: 'text-slate-600',
      pillClass: 'bg-white/5 text-slate-600'
    };
  }

  switch (key) {
    case 'payroll':
      return {
        cardClass: 'bg-amber-500/5 border-amber-500/35 hover:border-amber-500/60 text-slate-200 shadow-[0_0_15px_-3px_rgba(245,158,11,0.12)]',
        labelClass: 'text-amber-400 dark:text-amber-300 font-extrabold tracking-wide',
        iconClass: 'text-amber-400',
        pillClass: 'bg-amber-500/20 text-amber-300 font-bold border border-amber-500/30'
      };
    case 'attendance':
      return {
        cardClass: 'bg-sky-500/5 border-sky-500/35 hover:border-sky-500/60 text-slate-200 shadow-[0_0_15px_-3px_rgba(14,165,233,0.12)]',
        labelClass: 'text-sky-400 dark:text-sky-300 font-extrabold tracking-wide',
        iconClass: 'text-sky-400',
        pillClass: 'bg-sky-500/20 text-sky-300 font-bold border border-sky-500/30'
      };
    case 'recruitment':
      return {
        cardClass: 'bg-indigo-500/5 border-indigo-500/35 hover:border-indigo-500/60 text-slate-200 shadow-[0_0_15px_-3px_rgba(99,102,241,0.12)]',
        labelClass: 'text-indigo-400 dark:text-indigo-300 font-extrabold tracking-wide',
        iconClass: 'text-indigo-400',
        pillClass: 'bg-indigo-500/20 text-indigo-300 font-bold border border-indigo-500/30'
      };
    case 'faceRecognition':
      return {
        cardClass: 'bg-purple-500/5 border-purple-500/35 hover:border-purple-500/60 text-slate-200 shadow-[0_0_15px_-3px_rgba(168,85,247,0.12)]',
        labelClass: 'text-purple-400 dark:text-purple-300 font-extrabold tracking-wide',
        iconClass: 'text-purple-400',
        pillClass: 'bg-purple-500/20 text-purple-300 font-bold border border-purple-500/30'
      };
    case 'gpsTracking':
      return {
        cardClass: 'bg-rose-500/5 border-rose-500/35 hover:border-rose-500/60 text-slate-200 shadow-[0_0_15px_-3px_rgba(244,63,94,0.12)]',
        labelClass: 'text-rose-400 dark:text-rose-300 font-extrabold tracking-wide',
        iconClass: 'text-rose-400',
        pillClass: 'bg-rose-500/20 text-rose-300 font-bold border border-rose-500/30'
      };
    case 'api':
      return {
        cardClass: 'bg-teal-500/5 border-teal-500/35 hover:border-teal-500/60 text-slate-200 shadow-[0_0_15px_-3px_rgba(20,184,166,0.12)]',
        labelClass: 'text-teal-400 dark:text-teal-300 font-extrabold tracking-wide',
        iconClass: 'text-teal-400',
        pillClass: 'bg-teal-500/20 text-teal-300 font-bold border border-teal-500/30'
      };
    default:
      return {
        cardClass: 'bg-indigo-500/5 border-indigo-500/20 hover:border-indigo-500/40 text-slate-200 shadow-[0_0_15px_-3px_rgba(99,102,241,0.05)]',
        labelClass: 'text-white font-semibold',
        iconClass: 'text-indigo-400',
        pillClass: 'bg-indigo-500/20 text-indigo-300'
      };
  }
};

export const FeatureManagementTab: React.FC = () => {
  const { companies, setCompanies, addToast, addLog } = useDashboard();
  const [selectedCompanyId, setSelectedCompanyId] = useState<string>(companies[0]?.id || '');

  useEffect(() => {
    if (!selectedCompanyId && companies.length > 0) {
      setSelectedCompanyId(companies[0].id);
    }
  }, [companies, selectedCompanyId]);

  const activeCompany = companies.find(c => c.id === selectedCompanyId);

  const handleToggleModule = async (companyId: string, moduleKey: string, moduleLabel: string, currentValue: boolean) => {
    const comp = companies.find(c => c.id === companyId);
    if (!comp) return;
    
    const newModulesEnabled = {
      ...comp.modulesEnabled,
      [moduleKey]: !currentValue
    };

    try {
      const updateRes = await api.updateCompany(companyId, { modulesEnabled: newModulesEnabled });
      console.log("UPDATE RESPONSE FROM BACKEND:", updateRes);
      
      setCompanies(prev => prev.map(c => {
        if (c.id === companyId) {
          return {
            ...c,
            modulesEnabled: newModulesEnabled
          };
        }
        return c;
      }));

      const status = !currentValue ? 'enabled' : 'disabled';
      addToast(`"${moduleLabel}" ${status} for company`, !currentValue ? 'success' : 'warning');
      addLog('Module Toggled', `Feature module "${moduleLabel}" set to ${status} for company ID ${companyId}.`, 'feature');
    } catch (err: any) {
      addToast(err.message || 'Failed to update feature module', 'error');
    }
  };

  const handleBulkEnable = async (companyId: string, companyName: string, enable: boolean) => {
    const comp = companies.find(c => c.id === companyId);
    if (!comp) return;

    const bulkModules: Record<string, boolean> = {};
    MODULES_LIST.forEach(m => {
      bulkModules[m.key] = enable;
    });

    try {
      await api.updateCompany(companyId, { modulesEnabled: bulkModules });

      setCompanies(prev => prev.map(c => {
        if (c.id === companyId) {
          return {
            ...c,
            modulesEnabled: bulkModules
          };
        }
        return c;
      }));

      const statusText = enable ? 'Enabled' : 'Disabled';
      addToast(`${statusText} all modules for ${companyName}`, enable ? 'success' : 'warning');
      addLog('Bulk Modules Change', `${statusText} all modular software features for ${companyName}.`, 'feature');
    } catch (err: any) {
      addToast(err.message || 'Failed to update modules', 'error');
    }
  };

  return (
    <div className="space-y-6">
      {/* Title */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-white font-sans">
          Feature Flag Management
        </h1>
        <p className="text-slate-400 text-sm mt-1">
          Enable or disable core HRMS modules and advanced features per company tier in real-time.
        </p>
      </div>

      {/* Main Feature Dashboard Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
        {/* Company Selector Sidebar */}
        <div className="glass-card p-4 rounded-2xl space-y-2 lg:col-span-1">
          <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider px-2 block mb-2">Select Company Tenant</span>
          {companies.map(c => (
            <button
              key={c.id}
              onClick={() => setSelectedCompanyId(c.id)}
              className={`w-full text-left px-3 py-2 rounded-xl flex items-center gap-2.5 transition text-sm ${
                c.id === selectedCompanyId 
                  ? 'bg-indigo-600/15 text-indigo-300 border border-indigo-500/20 font-semibold' 
                  : 'hover:bg-white/2 border border-transparent text-slate-400'
              }`}
            >
              <div className={`h-6 w-6 rounded-md ${c.logo || ''} flex items-center justify-center font-bold text-white text-[10px] shrink-0`}>
                {(c.name || '').substring(0, 2).toUpperCase()}
              </div>
              <span className="truncate">{c.name || ''}</span>
            </button>
          ))}
        </div>

        {/* Feature Switches Matrix */}
        <div className="lg:col-span-3 space-y-6">
          {activeCompany ? (
            <div className="glass-card p-6 rounded-2xl space-y-6">
              {/* Header */}
              <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 border-b border-white/5 pb-4">
                <div className="flex items-center gap-3">
                  <div className={`h-10 w-10 rounded-xl ${activeCompany.logo || ''} flex items-center justify-center font-bold text-white text-sm shadow-md`}>
                    {(activeCompany.name || '').substring(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <h3 className="font-bold text-white text-base">{activeCompany.name || ''} Modules</h3>
                    <span className="text-xs text-slate-400">License plan ID: <span className="font-semibold text-indigo-400 capitalize">{(activeCompany.subscriptionPlanId || 'starter').replace('_', ' ')}</span></span>
                  </div>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => handleBulkEnable(activeCompany.id, activeCompany.name || '', true)}
                    className="px-3 py-1.5 rounded-lg bg-indigo-600/15 hover:bg-indigo-600 text-indigo-300 hover:text-white border border-indigo-500/20 text-xs font-semibold transition"
                  >
                    Enable All Modules
                  </button>
                  <button
                    onClick={() => handleBulkEnable(activeCompany.id, activeCompany.name || '', false)}
                    className="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-rose-600 text-slate-400 hover:text-white border border-white/10 text-xs font-semibold transition"
                  >
                    Disable All
                  </button>
                </div>
              </div>

              {/* Switches Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {MODULES_LIST.map((mod) => {
                  const isEnabled = activeCompany.modulesEnabled ? !!activeCompany.modulesEnabled[mod.key] : false;
                  const style = getModuleStyle(mod.key, isEnabled);
                  return (
                    <div 
                      key={mod.key}
                      onClick={() => handleToggleModule(activeCompany.id, mod.key, mod.label, isEnabled)}
                      className={`p-4 rounded-xl border flex flex-col justify-between cursor-pointer select-none transition ${style.cardClass}`}
                    >
                      <div className="flex justify-between items-start gap-4">
                        <div>
                          <span className={`text-sm block ${style.labelClass}`}>{mod.label}</span>
                          <span className="text-[10px] text-slate-500 block leading-relaxed mt-1">{mod.desc}</span>
                        </div>
                        <button>
                          {isEnabled ? (
                            <ToggleRight className={`h-6 w-6 ${style.iconClass}`} />
                          ) : (
                            <ToggleLeft className="h-6 w-6 text-slate-600" />
                          )}
                        </button>
                      </div>

                      {/* Status indicator pill */}
                      <div className="mt-4 flex items-center justify-between text-[9px] font-mono text-slate-500 border-t border-white/2 pt-2">
                        <span>MODULE IDENTIFIER: {mod.key}</span>
                        <span className={`px-1.5 py-0.5 rounded uppercase ${style.pillClass}`}>
                          {isEnabled ? 'Active' : 'Disabled'}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="glass-card p-12 text-center text-slate-400">
              <ShieldAlert className="h-10 w-10 mx-auto text-slate-500 mb-3 opacity-40" />
              Please register a company tenant to manage features.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
export default FeatureManagementTab;
