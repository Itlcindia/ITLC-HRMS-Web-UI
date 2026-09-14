import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Settings, Briefcase, DollarSign, Target, CheckCircle2, 
  Sparkles, RefreshCw, ShieldCheck, Database, Layers
} from 'lucide-react';
import { useDashboard } from '../context/DashboardContext';

export const CrmSettingsTab: React.FC = () => {
  const { addToast, addLog } = useDashboard();

  // CRM settings loaded from localStorage
  const [crmSettings, setCrmSettings] = useState<any>(() => {
    try {
      const saved = localStorage.getItem('crm_settings');
      if (saved) return JSON.parse(saved);
    } catch {}
    return {
      companyName: 'ITLC INDIA PVT LTD',
      crmCurrency: 'USD',
      gstRate: 18,
      defaultCommission: 10,
      monthlyTarget: 1000000,
      autoAssignLeads: true,
      leadExpiryDays: 30
    };
  });

  const [formData, setFormData] = useState({ ...crmSettings });

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setCrmSettings(formData);
    localStorage.setItem('crm_settings', JSON.stringify(formData));
    addToast('CRM Configuration saved successfully!', 'success');
    addLog('CRM Settings Updated', 'Modified CRM global pipeline and commission rules.', 'settings');
  };

  return (
    <div className="w-full max-w-6xl mx-auto space-y-6 sm:space-y-8 pb-12">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2.5">
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            Sales CRM Configuration
          </h1>
          <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-indigo-500/10 text-indigo-300 border border-indigo-500/20">
            Suite Settings
          </span>
        </div>
        <p className="text-slate-400 text-xs sm:text-sm mt-1">
          Configure default pipelines, GST tax calculations, sales target thresholds, and automated lead routing rules.
        </p>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* Card 1: Pipeline & Sales Targets */}
          <div className="glass-card p-6 rounded-2xl border border-slate-200/80 dark:border-white/10 shadow-lg space-y-4">
            <div className="flex items-center gap-3 pb-3 border-b border-white/10">
              <div className="h-9 w-9 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 shrink-0">
                <Target className="h-4.5 w-4.5" />
              </div>
              <h3 className="text-base font-bold text-white">Sales Pipeline Rules</h3>
            </div>

            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-slate-300">CRM Entity / Brand Name</label>
                <input
                  type="text"
                  required
                  value={formData.companyName}
                  onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                  className="glass-input h-11 w-full px-3.5 rounded-xl text-sm text-slate-100"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-slate-300">Monthly Target ($)</label>
                  <input
                    type="number"
                    value={formData.monthlyTarget}
                    onChange={(e) => setFormData({ ...formData, monthlyTarget: Number(e.target.value) })}
                    className="glass-input h-11 w-full px-3.5 rounded-xl text-sm text-slate-100 font-mono"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-slate-300">Rep Commission (%)</label>
                  <input
                    type="number"
                    value={formData.defaultCommission}
                    onChange={(e) => setFormData({ ...formData, defaultCommission: Number(e.target.value) })}
                    className="glass-input h-11 w-full px-3.5 rounded-xl text-sm text-slate-100 font-mono"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-slate-300">Lead Expiry SLA (Days)</label>
                <input
                  type="number"
                  value={formData.leadExpiryDays}
                  onChange={(e) => setFormData({ ...formData, leadExpiryDays: Number(e.target.value) })}
                  className="glass-input h-11 w-full px-3.5 rounded-xl text-sm text-slate-100 font-mono"
                />
              </div>
            </div>
          </div>

          {/* Card 2: Invoicing & Automation */}
          <div className="glass-card p-6 rounded-2xl border border-slate-200/80 dark:border-white/10 shadow-lg space-y-4">
            <div className="flex items-center gap-3 pb-3 border-b border-white/10">
              <div className="h-9 w-9 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400 shrink-0">
                <DollarSign className="h-4.5 w-4.5" />
              </div>
              <h3 className="text-base font-bold text-white">Invoicing & Tax Rules</h3>
            </div>

            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-slate-300">Default GST / Tax Rate (%)</label>
                <input
                  type="number"
                  value={formData.gstRate}
                  onChange={(e) => setFormData({ ...formData, gstRate: Number(e.target.value) })}
                  className="glass-input h-11 w-full px-3.5 rounded-xl text-sm text-slate-100 font-mono"
                />
              </div>

              <div className="p-4 rounded-xl border border-white/10 bg-white/2 flex items-center justify-between mt-6">
                <div className="space-y-0.5">
                  <span className="font-bold text-xs text-white block">Auto-Assign Incoming Leads</span>
                  <span className="text-[11px] text-slate-400 block">Round-robin lead allocation among sales representatives.</span>
                </div>
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, autoAssignLeads: !formData.autoAssignLeads })}
                  className={`h-9 px-3.5 rounded-xl text-xs font-bold border transition ${
                    formData.autoAssignLeads 
                      ? 'bg-emerald-500/20 border-emerald-500/30 text-emerald-400' 
                      : 'bg-white/5 border-white/10 text-slate-400'
                  }`}
                >
                  {formData.autoAssignLeads ? 'ACTIVE' : 'OFF'}
                </button>
              </div>
            </div>
          </div>

        </div>

        {/* Save Bar */}
        <div className="flex justify-end gap-3 pt-4 border-t border-white/10">
          <button
            type="submit"
            className="h-11 px-6 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold text-xs sm:text-sm shadow-lg shadow-indigo-600/30 flex items-center gap-2"
          >
            <CheckCircle2 className="h-4 w-4" /> Save CRM Settings
          </button>
        </div>
      </form>
    </div>
  );
};

export default CrmSettingsTab;
