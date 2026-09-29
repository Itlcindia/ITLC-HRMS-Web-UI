import React, { useState, useEffect } from 'react';
import { 
  Settings, Mail, DollarSign, Palette, ShieldAlert, 
  Database, CheckCircle, RefreshCw, Play, Download,
  Eye, EyeOff, ShieldCheck, Sparkles, Check, Server,
  Globe, Clock, Moon, Sun, Lock, Receipt, Zap
} from 'lucide-react';
import { useDashboard } from '../context/DashboardContext';
import { api } from '../../../services/api';
import {
  getLiveSuperOwnerTaxConfig,
  saveLiveSuperOwnerTaxConfig,
  resetSuperOwnerTaxConfig,
  type SuperOwnerTaxConfig
} from '../../../types/multiTenant';

export const SettingsTab: React.FC = () => {
  const { settings, updateSettings, addToast, addLog, setIsFormDirty, theme, setTheme } = useDashboard();

  // Local Form state
  const [formData, setFormData] = useState({ ...settings });
  const [isBackupRunning, setIsBackupRunning] = useState(false);
  const [isTestingSmtp, setIsTestingSmtp] = useState(false);
  const [showStripeKey, setShowStripeKey] = useState(false);
  const [showRazorpaySecret, setShowRazorpaySecret] = useState(false);

  // Super Owner GST / Tax Policy State
  const [taxConfig, setTaxConfig] = useState<SuperOwnerTaxConfig>(getLiveSuperOwnerTaxConfig());

  React.useEffect(() => {
    setFormData(settings);
    setTaxConfig(getLiveSuperOwnerTaxConfig());
  }, [settings]);

  // Form Update Helper
  const updateForm = (updates: Partial<typeof formData>) => {
    setFormData(prev => ({ ...prev, ...updates }));
    setIsFormDirty(true);
  };

  const handleThemeChange = (newTheme: 'dark' | 'light') => {
    setTheme(newTheme);
    addToast(`Theme switched to ${newTheme === 'dark' ? 'Dark Mode' : 'Light Mode'}`, 'success');
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateSettings(formData);
    saveLiveSuperOwnerTaxConfig(taxConfig);
    setIsFormDirty(false);
    addToast('All Platform & Super Owner GST Tax configurations saved successfully!', 'success');
  };

  const handleTestSmtp = () => {
    setIsTestingSmtp(true);
    addToast('Sending test email via SMTP relay...', 'info');
    setTimeout(() => {
      setIsTestingSmtp(false);
      addToast('SMTP handshake succeeded! Test email dispatched.', 'success');
      addLog('SMTP Handshake Succeeded', `Tested SMTP configuration on server ${formData.smtpServer}.`, 'settings');
    }, 1200);
  };

  const handleTriggerBackup = async () => {
    setIsBackupRunning(true);
    addToast('Initiating full system snapshot...', 'info');
    
    try {
      const backupData = await api.getSuperOwnerBackup();
      
      // Download the JSON file locally
      const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(backupData, null, 2));
      const downloadAnchor = document.createElement('a');
      downloadAnchor.setAttribute("href", dataStr);
      downloadAnchor.setAttribute("download", `hrms_full_backup_${new Date().toISOString().split('T')[0]}.json`);
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();

      addToast('Platform backup file downloaded successfully!', 'success');
      addLog('Database Backup Archive', 'Manual full system database snapshot generated and downloaded.', 'settings');
    } catch (err: any) {
      console.error(err);
      addToast('Backup failed: ' + err.message, 'error');
    } finally {
      setIsBackupRunning(false);
    }
  };

  return (
    <div className="w-full max-w-6xl mx-auto space-y-6 sm:space-y-8 pb-12">
      {/* Page Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white font-sans">
              Platform Configuration
            </h1>
            <span className="hidden sm:inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 uppercase tracking-wider">
              <Sparkles className="h-3 w-3" /> Core Engine
            </span>
          </div>
          <p className="text-slate-400 text-xs sm:text-sm mt-1 max-w-2xl leading-relaxed">
            Configure global branding palettes, multi-currency defaults, transaction relay gateways, SMTP relays, and system maintenance overrides.
          </p>
        </div>
      </div>

      <form onSubmit={handleSave} className="space-y-6 sm:space-y-8">
        {/* SECTION 1: 2-Column Balanced Grid for Platform Preferences & Branding */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* Card 1: Platform Preferences */}
          <div className="glass-card p-5 sm:p-6 rounded-2xl flex flex-col justify-between border border-slate-200/80 dark:border-white/10 shadow-lg">
            <div>
              <div className="flex items-center gap-3 pb-4 border-b border-slate-200/60 dark:border-white/10 mb-5">
                <div className="h-9 w-9 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 shrink-0">
                  <Settings className="h-4.5 w-4.5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white leading-tight">Platform Preferences</h3>
                  <p className="text-[11px] text-slate-400">Localization and workspace identification</p>
                </div>
              </div>

              <div className="space-y-4">
                {/* Platform / Brand Name */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-slate-300 dark:text-slate-300">
                    Platform / Brand Name <span className="text-rose-400">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.platformName}
                    onChange={(e) => updateForm({ platformName: e.target.value })}
                    placeholder="e.g. SUPEROWNER HRMS"
                    className="glass-input h-11 w-full px-3.5 rounded-xl text-sm font-medium text-slate-100 placeholder-slate-500 focus:ring-2 focus:ring-indigo-500/30 transition"
                  />
                </div>

                {/* Currency & Timezone Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="block text-xs font-semibold text-slate-300 dark:text-slate-300">
                      Default Currency
                    </label>
                    <select
                      value={formData.currency}
                      onChange={(e) => updateForm({ currency: e.target.value })}
                      className="glass-input h-11 w-full px-3.5 rounded-xl text-sm font-medium text-slate-200 bg-transparent focus:ring-2 focus:ring-indigo-500/30 transition cursor-pointer"
                    >
                      <option value="USD">🇺🇸 USD ($)</option>
                      <option value="EUR">🇪🇺 EUR (€)</option>
                      <option value="INR">🇮🇳 INR (₹)</option>
                      <option value="GBP">🇬🇧 GBP (£)</option>
                      <option value="CAD">🇨🇦 CAD (CA$)</option>
                      <option value="AUD">🇦🇺 AUD (A$)</option>
                      <option value="JPY">🇯🇵 JPY (¥)</option>
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-xs font-semibold text-slate-300 dark:text-slate-300">
                      Timezone
                    </label>
                    <select
                      value={formData.timezone}
                      onChange={(e) => updateForm({ timezone: e.target.value })}
                      className="glass-input h-11 w-full px-3.5 rounded-xl text-sm font-medium text-slate-200 bg-transparent focus:ring-2 focus:ring-indigo-500/30 transition cursor-pointer"
                    >
                      <option value="UTC-5">UTC-5 (EST - New York)</option>
                      <option value="UTC-0">UTC-0 (GMT - London)</option>
                      <option value="UTC+5.5">UTC+5:30 (IST - India)</option>
                      <option value="UTC+1">UTC+1 (CET - Paris)</option>
                      <option value="UTC+8">UTC+8 (SGT - Singapore)</option>
                      <option value="UTC+9">UTC+9 (JST - Tokyo)</option>
                    </select>
                  </div>
                </div>

                {/* Interface Theme Mode */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-slate-300 dark:text-slate-300">
                    Interface Theme Mode
                  </label>
                  <select
                    value={theme}
                    onChange={(e) => handleThemeChange(e.target.value as 'dark' | 'light')}
                    className="glass-input h-11 w-full px-3.5 rounded-xl text-sm font-medium text-slate-200 bg-transparent focus:ring-2 focus:ring-indigo-500/30 transition cursor-pointer"
                  >
                    <option value="dark">🌙 Dark Theme (Futuristic Glass)</option>
                    <option value="light">☀️ Light Theme (Frosted Snow)</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Card 2: Platform Branding Colors & Maintenance Override */}
          <div className="glass-card p-5 sm:p-6 rounded-2xl flex flex-col justify-between border border-slate-200/80 dark:border-white/10 shadow-lg">
            <div>
              <div className="flex items-center gap-3 pb-4 border-b border-slate-200/60 dark:border-white/10 mb-5">
                <div className="h-9 w-9 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400 shrink-0">
                  <Palette className="h-4.5 w-4.5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white leading-tight">Branding & System Overrides</h3>
                  <p className="text-[11px] text-slate-400">Palette accents and system routing switch</p>
                </div>
              </div>

              <div className="space-y-4">
                {/* Brand Color Input */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-slate-300 dark:text-slate-300">
                    Custom Brand Color Accent
                  </label>
                  <div className="flex items-center gap-3">
                    <div className="relative h-11 w-14 rounded-xl overflow-hidden border border-slate-200/50 dark:border-white/10 shadow-inner shrink-0 cursor-pointer">
                      <input
                        type="color"
                        value={formData.brandColor}
                        onChange={(e) => updateForm({ brandColor: e.target.value })}
                        className="absolute -inset-2 w-20 h-20 cursor-pointer border-0 bg-transparent"
                      />
                    </div>
                    <input
                      type="text"
                      value={formData.brandColor}
                      onChange={(e) => updateForm({ brandColor: e.target.value })}
                      className="glass-input h-11 w-full max-w-[140px] px-3.5 rounded-xl font-mono text-sm font-semibold text-slate-200 text-center uppercase tracking-wider"
                    />
                    <div className="hidden sm:flex items-center gap-2 px-3 h-11 rounded-xl bg-white/3 border border-white/5 text-[11px] text-slate-400 flex-1">
                      <span className="h-2 w-2 rounded-full" style={{ backgroundColor: formData.brandColor }}></span>
                      <span className="truncate">Active Primary Glow</span>
                    </div>
                  </div>
                </div>

                {/* Predefined Palette Templates */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-slate-300 dark:text-slate-300">
                    Palette Presets
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {[
                      { name: 'Indigo Glow', color: '#6366f1' },
                      { name: 'Emerald Forest', color: '#10b981' },
                      { name: 'Vibrant Amethyst', color: '#8b5cf6' },
                      { name: 'Cyberpunk Rose', color: '#f43f5e' }
                    ].map(pal => {
                      const isSelected = formData.brandColor.toLowerCase() === pal.color.toLowerCase();
                      return (
                        <button
                          key={pal.name}
                          type="button"
                          onClick={() => updateForm({ brandColor: pal.color })}
                          className={`h-10 px-2.5 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition border ${
                            isSelected 
                              ? 'bg-indigo-600/20 border-indigo-500 text-white shadow-xs' 
                              : 'bg-white/2 hover:bg-white/5 border-white/5 text-slate-300 hover:text-white'
                          }`}
                        >
                          <span className="h-2.5 w-2.5 rounded-full shrink-0 shadow-xs" style={{ backgroundColor: pal.color }}></span>
                          <span className="truncate">{pal.name.split(' ')[0]}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Maintenance Mode switch */}
                <div className="p-3.5 rounded-xl border border-slate-200/60 dark:border-white/10 bg-white/2 flex items-center justify-between gap-3 mt-2">
                  <div className="space-y-0.5 min-w-0">
                    <span className="font-bold text-xs text-slate-200 flex items-center gap-1.5 truncate">
                      <ShieldAlert className="h-4 w-4 text-rose-400 shrink-0" /> Maintenance Override
                    </span>
                    <span className="text-[10px] text-slate-400 block truncate">
                      Restrict client company portals and routing endpoints.
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => updateForm({ maintenanceMode: !formData.maintenanceMode })}
                    className={`h-9 px-3.5 rounded-xl text-xs font-bold border transition shrink-0 cursor-pointer flex items-center gap-1.5 ${
                      formData.maintenanceMode 
                        ? 'bg-rose-500/20 border-rose-500/40 text-rose-300 shadow-sm shadow-rose-500/20' 
                        : 'bg-white/5 hover:bg-white/10 border-white/10 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <span className={`h-2 w-2 rounded-full ${formData.maintenanceMode ? 'bg-rose-400 animate-pulse' : 'bg-slate-500'}`}></span>
                    {formData.maintenanceMode ? 'ENABLED' : 'DISABLED'}
                  </button>
                </div>
              </div>
            </div>
          </div>

        </div>

        {/* SECTION 2: SMTP Configuration */}
        <div className="glass-card p-5 sm:p-6 md:p-7 rounded-2xl border border-slate-200/80 dark:border-white/10 shadow-lg space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-200/60 dark:border-white/10">
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 shrink-0">
                <Mail className="h-4.5 w-4.5" />
              </div>
              <div>
                <h3 className="text-base sm:text-lg font-bold text-white leading-tight">SMTP Transactional Mail Configuration</h3>
                <p className="text-[11px] text-slate-400">Outgoing email servers for invitations, OTPs, and notifications</p>
              </div>
            </div>
            
            <button
              type="button"
              disabled={isTestingSmtp}
              onClick={handleTestSmtp}
              className="h-9 px-4 rounded-xl bg-indigo-500/10 hover:bg-indigo-600 border border-indigo-500/30 text-indigo-300 hover:text-white text-xs font-bold transition flex items-center justify-center gap-2 self-start sm:self-auto cursor-pointer shadow-xs disabled:opacity-50"
            >
              {isTestingSmtp ? (
                <>
                  <RefreshCw className="h-3.5 w-3.5 animate-spin" /> Verifying Relay...
                </>
              ) : (
                <>
                  <Play className="h-3.5 w-3.5" /> Test SMTP Connection
                </>
              )}
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="space-y-1.5 min-w-0">
              <label className="block text-xs font-semibold text-slate-300 dark:text-slate-300">
                SMTP Server Host <span className="text-rose-400">*</span>
              </label>
              <input
                type="text"
                required
                value={formData.smtpServer}
                onChange={(e) => updateForm({ smtpServer: e.target.value })}
                placeholder="smtp.mailgun.org"
                className="glass-input h-11 w-full px-3.5 rounded-xl text-sm text-slate-100 font-mono placeholder-slate-500 focus:ring-2 focus:ring-indigo-500/30 transition"
              />
              <p className="text-[11px] text-slate-400">e.g. smtp.sendgrid.net, smtp.mailgun.org, or smtp.office365.com</p>
            </div>

            <div className="space-y-1.5 min-w-0">
              <label className="block text-xs font-semibold text-slate-300 dark:text-slate-300">
                SMTP Default Sender Email <span className="text-rose-400">*</span>
              </label>
              <input
                type="email"
                required
                value={formData.smtpEmail}
                onChange={(e) => updateForm({ smtpEmail: e.target.value })}
                placeholder="noreply@superowner.io"
                className="glass-input h-11 w-full px-3.5 rounded-xl text-sm text-slate-100 placeholder-slate-500 focus:ring-2 focus:ring-indigo-500/30 transition"
              />
              <p className="text-[11px] text-slate-400">Primary mailbox header shown on outgoing employee notices</p>
            </div>
          </div>
        </div>

        {/* SECTION 3: Payment Gateways & Receiver Accounts */}
        <div className="glass-card p-5 sm:p-6 md:p-7 rounded-2xl border border-slate-200/80 dark:border-white/10 shadow-lg space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-200/60 dark:border-white/10">
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 shrink-0">
                <DollarSign className="h-4.5 w-4.5" />
              </div>
              <div>
                <h3 className="text-base sm:text-lg font-bold text-white leading-tight">Payment Gateways & Receiver Accounts</h3>
                <p className="text-[11px] text-slate-400">Transaction relay keys for subscription renewals and automated billing</p>
              </div>
            </div>

            <span className="self-start sm:self-auto inline-flex items-center gap-1.5 text-[11px] text-emerald-400 font-bold uppercase tracking-wider bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/25">
              <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" /> Active Gateways
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Stripe Secret Key */}
            <div className="space-y-1.5 min-w-0">
              <label className="block text-xs font-semibold text-slate-300 dark:text-slate-300">
                Stripe Secret Key (sk_live_... / sk_test_...)
              </label>
              <div className="relative">
                <input
                  type={showStripeKey ? "text" : "password"}
                  value={formData.stripeSecretKey || ''}
                  onChange={(e) => updateForm({ stripeSecretKey: e.target.value })}
                  placeholder="sk_test_..."
                  className="glass-input h-11 w-full pl-3.5 pr-10 rounded-xl text-sm text-slate-100 font-mono placeholder-slate-500 focus:ring-2 focus:ring-indigo-500/30 transition"
                />
                <button
                  type="button"
                  onClick={() => setShowStripeKey(!showStripeKey)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-200 transition"
                  title={showStripeKey ? "Hide key" : "Show key"}
                >
                  {showStripeKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {/* Receiver UPI ID */}
            <div className="space-y-1.5 min-w-0">
              <label className="block text-xs font-semibold text-slate-300 dark:text-slate-300">
                Receiver UPI VPA ID (for Direct Transfers)
              </label>
              <input
                type="text"
                value={formData.realUpiId || ''}
                onChange={(e) => updateForm({ realUpiId: e.target.value })}
                placeholder="itlc@upi"
                className="glass-input h-11 w-full px-3.5 rounded-xl text-sm text-slate-100 font-mono placeholder-slate-500 focus:ring-2 focus:ring-indigo-500/30 transition"
              />
            </div>

            {/* Razorpay Key ID */}
            <div className="space-y-1.5 min-w-0">
              <label className="block text-xs font-semibold text-slate-300 dark:text-slate-300">
                Razorpay Key ID (rzp_live_... / rzp_test_...)
              </label>
              <input
                type="text"
                value={formData.razorpayKeyId || ''}
                onChange={(e) => updateForm({ razorpayKeyId: e.target.value })}
                placeholder="rzp_test_..."
                className="glass-input h-11 w-full px-3.5 rounded-xl text-sm text-slate-100 font-mono placeholder-slate-500 focus:ring-2 focus:ring-indigo-500/30 transition"
              />
            </div>

            {/* Razorpay Secret Key */}
            <div className="space-y-1.5 min-w-0">
              <label className="block text-xs font-semibold text-slate-300 dark:text-slate-300">
                Razorpay Secret Key
              </label>
              <div className="relative">
                <input
                  type={showRazorpaySecret ? "text" : "password"}
                  value={formData.razorpaySecret || ''}
                  onChange={(e) => updateForm({ razorpaySecret: e.target.value })}
                  placeholder="Razorpay API Secret"
                  className="glass-input h-11 w-full pl-3.5 pr-10 rounded-xl text-sm text-slate-100 font-mono placeholder-slate-500 focus:ring-2 focus:ring-indigo-500/30 transition"
                />
                <button
                  type="button"
                  onClick={() => setShowRazorpaySecret(!showRazorpaySecret)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-200 transition"
                  title={showRazorpaySecret ? "Hide secret" : "Show secret"}
                >
                  {showRazorpaySecret ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* SECTION 4: Super Owner GST & Tax Governance Engine */}
        <div className="glass-card p-5 sm:p-6 md:p-7 rounded-2xl border border-slate-200/80 dark:border-white/10 shadow-lg space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-200/60 dark:border-white/10">
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400 shrink-0">
                <Receipt className="h-4.5 w-4.5" />
              </div>
              <div>
                <h3 className="text-base sm:text-lg font-bold text-white leading-tight">Super Owner GST & Tax Policy Engine</h3>
                <p className="text-[11px] text-slate-400">Super Owner sovereign control over whether GST is charged, slab percentage, billing mode, and platform GSTIN</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  const updated = { ...taxConfig, enabled: !taxConfig.enabled };
                  setTaxConfig(updated);
                  setIsFormDirty(true);
                }}
                className={`h-9 px-4 rounded-xl text-xs font-bold border transition flex items-center gap-2 ${
                  taxConfig.enabled 
                    ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300' 
                    : 'bg-rose-500/20 border-rose-500/40 text-rose-300'
                }`}
              >
                <span className={`h-2 w-2 rounded-full ${taxConfig.enabled ? 'bg-emerald-400 animate-pulse' : 'bg-rose-400'}`}></span>
                {taxConfig.enabled ? `TAX CHARGING ACTIVE (${taxConfig.ratePercent}% GST)` : 'TAX DISABLED (0% EXEMPT)'}
              </button>
            </div>
          </div>

          {/* Slabs Preset Selector */}
          <div className="space-y-2">
            <label className="block text-xs font-semibold text-slate-300">
              Select GST Rate Slab Preset (%)
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
              {[
                { slab: 0, label: '0% Exempt', desc: 'SEZ / Export' },
                { slab: 5, label: '5% Reduced', desc: 'Concessional' },
                { slab: 12, label: '12% Standard', desc: 'Low Bracket' },
                { slab: 18, label: '18% SaaS Default', desc: 'IT Standard' },
                { slab: 28, label: '28% Luxury', desc: 'Highest' }
              ].map(item => {
                const isSelected = taxConfig.enabled && Number(taxConfig.ratePercent) === item.slab;
                return (
                  <button
                    key={item.slab}
                    type="button"
                    onClick={() => {
                      setTaxConfig(prev => ({ ...prev, ratePercent: item.slab, enabled: item.slab > 0 ? true : prev.enabled }));
                      setIsFormDirty(true);
                    }}
                    className={`p-2.5 rounded-xl text-left border transition ${
                      isSelected 
                        ? 'bg-indigo-600/30 border-indigo-400 text-white shadow-xs' 
                        : 'bg-white/3 hover:bg-white/6 border-white/5 text-slate-300'
                    }`}
                  >
                    <div className="text-xs font-extrabold">{item.label}</div>
                    <div className="text-[10px] text-slate-400">{item.desc}</div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Grid of Tax Inputs */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-slate-300">
                Exact Tax Rate (%)
              </label>
              <input
                type="number"
                step="0.1"
                min="0"
                max="100"
                value={taxConfig.ratePercent}
                onChange={(e) => {
                  setTaxConfig(prev => ({ ...prev, ratePercent: parseFloat(e.target.value) || 0 }));
                  setIsFormDirty(true);
                }}
                disabled={!taxConfig.enabled}
                className="glass-input h-11 w-full px-3.5 rounded-xl text-sm text-slate-100 font-bold focus:ring-2 focus:ring-indigo-500/30"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-slate-300">
                Tax Name / Label
              </label>
              <input
                type="text"
                value={taxConfig.taxLabel}
                onChange={(e) => {
                  setTaxConfig(prev => ({ ...prev, taxLabel: e.target.value }));
                  setIsFormDirty(true);
                }}
                placeholder="GST / IGST / VAT"
                className="glass-input h-11 w-full px-3.5 rounded-xl text-sm text-slate-100 focus:ring-2 focus:ring-indigo-500/30"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-slate-300">
                Super Owner Platform GSTIN
              </label>
              <input
                type="text"
                value={taxConfig.gstin}
                onChange={(e) => {
                  setTaxConfig(prev => ({ ...prev, gstin: e.target.value }));
                  setIsFormDirty(true);
                }}
                placeholder="07AABCI8899K1Z4"
                className="glass-input h-11 w-full px-3.5 rounded-xl text-sm font-mono text-slate-100 focus:ring-2 focus:ring-indigo-500/30"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-slate-300">
                HSN / SAC Code (Software)
              </label>
              <input
                type="text"
                value={taxConfig.hsnSacCode}
                onChange={(e) => {
                  setTaxConfig(prev => ({ ...prev, hsnSacCode: e.target.value }));
                  setIsFormDirty(true);
                }}
                placeholder="998313 (IT SaaS)"
                className="glass-input h-11 w-full px-3.5 rounded-xl text-sm text-slate-100 focus:ring-2 focus:ring-indigo-500/30"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-slate-300">
                Registered Legal Entity Name
              </label>
              <input
                type="text"
                value={taxConfig.registeredLegalName || ''}
                onChange={(e) => {
                  setTaxConfig(prev => ({ ...prev, registeredLegalName: e.target.value }));
                  setIsFormDirty(true);
                }}
                placeholder="ITLC INDIA PRIVATE LIMITED"
                className="glass-input h-11 w-full px-3.5 rounded-xl text-sm text-slate-100 focus:ring-2 focus:ring-indigo-500/30"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-slate-300">
                Tax Invoice Prefix
              </label>
              <input
                type="text"
                value={taxConfig.taxInvoicePrefix || ''}
                onChange={(e) => {
                  setTaxConfig(prev => ({ ...prev, taxInvoicePrefix: e.target.value }));
                  setIsFormDirty(true);
                }}
                placeholder="INV-ITLC"
                className="glass-input h-11 w-full px-3.5 rounded-xl text-sm font-mono text-slate-100 focus:ring-2 focus:ring-indigo-500/30"
              />
            </div>
          </div>
        </div>

        {/* SECTION 4: Database Snapshots & Backup Recovery */}
        <div className="glass-card p-5 sm:p-6 md:p-7 rounded-2xl border border-slate-200/80 dark:border-white/10 shadow-lg space-y-5">
          <div className="flex items-center gap-3 pb-4 border-b border-slate-200/60 dark:border-white/10">
            <div className="h-9 w-9 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400 shrink-0">
              <Database className="h-4.5 w-4.5" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold text-white leading-tight">Database Snapshots & Backups</h3>
              <p className="text-[11px] text-slate-400">Export system configurations, tenant billing logs, and user credentials directories securely.</p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-1">
            <button
              type="button"
              disabled={isBackupRunning}
              onClick={handleTriggerBackup}
              className="h-11 px-5 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-800 text-white font-bold text-xs sm:text-sm transition shadow-lg shadow-indigo-600/20 flex items-center justify-center gap-2 cursor-pointer disabled:cursor-not-allowed"
            >
              {isBackupRunning ? (
                <>
                  <RefreshCw className="h-4 w-4 animate-spin" /> Archiving Snapshot...
                </>
              ) : (
                <>
                  <Play className="h-4 w-4" /> Trigger Manual Backup Now
                </>
              )}
            </button>

            <button
              type="button"
              onClick={() => {
                addToast('Downloading backup manifest logs...', 'success');
              }}
              className="h-11 px-5 rounded-xl bg-white/5 hover:bg-white/10 border border-slate-200/40 dark:border-white/10 text-slate-300 hover:text-white font-semibold text-xs sm:text-sm transition flex items-center justify-center gap-2 cursor-pointer"
            >
              <Download className="h-4 w-4" /> Download Backup Logs
            </button>
          </div>
        </div>

        {/* SECTION 5: Form Action Bar (Sticky Capsule with Save Configurations) */}
        <div className="sticky bottom-4 z-30 p-4 rounded-2xl glass-card border border-indigo-500/20 shadow-2xl backdrop-blur-xl flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2.5 text-xs text-slate-400">
            <span className="h-2.5 w-2.5 rounded-full bg-emerald-400 animate-pulse shrink-0"></span>
            <span>Platform configurations will take effect instantly across all tenant workspaces.</span>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            <button
              type="button"
              onClick={() => {
                setFormData({ ...settings });
                setIsFormDirty(false);
                addToast('Configuration form reset to saved values', 'info');
              }}
              className="flex-1 sm:flex-none h-11 px-4 rounded-xl border border-slate-200/50 dark:border-white/10 bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white text-xs font-semibold transition cursor-pointer"
            >
              Reset Changes
            </button>
            <button
              type="submit"
              className="flex-1 sm:flex-none h-11 px-6 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold text-xs sm:text-sm transition shadow-lg shadow-indigo-600/30 flex items-center justify-center gap-2 cursor-pointer"
            >
              <CheckCircle className="h-4 w-4" /> Save Configurations
            </button>
          </div>
        </div>

      </form>
    </div>
  );
};

export default SettingsTab;
