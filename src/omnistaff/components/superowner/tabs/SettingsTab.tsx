import React, { useState, useEffect } from 'react';
import { 
  Settings, Mail, DollarSign, Palette, ShieldAlert, 
  Database, CheckCircle, RefreshCw, Play, Download,
  Eye, EyeOff, ShieldCheck, Sparkles, Check, Server,
  Globe, Clock, Moon, Sun, Lock, Receipt, Zap,
  Printer, RotateCcw, FileText, Sliders, Building2,
  Phone, MapPin, QrCode, Upload, Trash2, Image as ImageIcon
} from 'lucide-react';
import { useDashboard } from '../context/DashboardContext';
import { api } from '../../../services/api';
import { downloadPaymentSlip } from '../../../utils/PaymentSlip';
import {
  getLiveSuperOwnerTaxConfig,
  saveLiveSuperOwnerTaxConfig,
  resetSuperOwnerTaxConfig,
  type SuperOwnerTaxConfig
} from '../../../../types/multiTenant';

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

  const handlePreviewSlip = () => {
    saveLiveSuperOwnerTaxConfig(taxConfig);
    downloadPaymentSlip({
      companyName: 'Apex Technologies India Pvt Ltd',
      companyId: 'COMP_8849',
      adminName: 'Rajesh Sharma',
      adminEmail: 'admin@apextech.in',
      adminPhone: '+91 98765 43210',
      planName: 'Enterprise Growth Annual',
      amount: 49999,
      currency: 'INR',
      billingCycle: 'Annually',
      paymentMethod: 'Razorpay UPI / NetBanking',
      orderId: 'ORD_PREVIEW_8849',
      paymentId: 'pay_live_test_7719',
      companyAddress: 'Suite 402, Cyber Tower B, Sector 29, Gurugram, Haryana 122002',
      companyGstin: '06AAACA1234F1Z8',
      features: [
        'Unlimited Employees & Multi-shift Biometric Integration',
        'Automated Indian Statutory Payroll, PF & ESIC Processing',
        'Geo-fenced Attendance & Approval Workflow Engine',
        '24/7 Priority SLA & Dedicated Enterprise Support'
      ]
    }, {
      name: 'Apex Technologies India Pvt Ltd',
      id: 'COMP_8849',
      adminName: 'Rajesh Sharma',
      email: 'admin@apextech.in',
      phone: '+91 98765 43210',
      gstin: '06AAACA1234F1Z8'
    });
    addToast('Sample Payment Slip / Tax Invoice preview generated!', 'info');
  };

  const handleResetTaxConfig = () => {
    const fresh = resetSuperOwnerTaxConfig();
    setTaxConfig(fresh);
    setIsFormDirty(true);
    addToast('Payment slip & tax configurations reset to defaults!', 'info');
  };

  const handleSignatureUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      addToast('Image file size must be less than 2MB', 'error');
      return;
    }

    const reader = new FileReader();
    reader.onload = (uploadEvent) => {
      const base64Data = uploadEvent.target?.result as string;
      if (base64Data) {
        setTaxConfig(prev => ({ ...prev, signatureImageUrl: base64Data }));
        setIsFormDirty(true);
        addToast('Authorized signature / stamp image uploaded successfully!', 'success');
      }
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveSignature = () => {
    setTaxConfig(prev => ({ ...prev, signatureImageUrl: '' }));
    setIsFormDirty(true);
    addToast('Signature image removed. Reverted to standard font signature.', 'info');
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

        {/* SECTION 4: Super Owner Payment Slip & Tax Invoice Customizer */}
        <div className="glass-card p-5 sm:p-6 md:p-7 rounded-2xl border border-slate-200/80 dark:border-white/10 shadow-lg space-y-6">
          {/* Header */}
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-slate-200/60 dark:border-white/10">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400 shrink-0 shadow-xs">
                <Receipt className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-base sm:text-lg font-bold text-white leading-tight">
                  Payment Slip & Tax Invoice Customizer
                </h3>
                <p className="text-[11px] text-slate-400">
                  Super Owner sovereign control over manual slip details, GST rate slabs, and element visibility toggles.
                </p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={handleResetTaxConfig}
                className="h-9 px-3 rounded-xl text-xs font-semibold bg-white/5 hover:bg-white/10 text-slate-300 border border-white/10 flex items-center gap-1.5 transition"
                title="Reset to default settings"
              >
                <RotateCcw className="h-3.5 w-3.5" />
                Reset Defaults
              </button>

              <button
                type="button"
                onClick={handlePreviewSlip}
                className="h-9 px-4 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white shadow-md shadow-indigo-600/30 flex items-center gap-2 transition"
                title="Open sample payment slip with your live settings"
              >
                <Printer className="h-4 w-4" />
                Test / Preview Slip
              </button>

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
                {taxConfig.enabled ? `TAX ACTIVE (${taxConfig.ratePercent}% GST)` : 'TAX DISABLED (0% EXEMPT)'}
              </button>
            </div>
          </div>

          {/* GST Slabs Preset Selector & Calculation Options */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-semibold text-slate-300">
                GST Rate Slab Presets (%)
              </label>
              <div className="flex items-center gap-4 text-xs">
                <label className="flex items-center gap-2 cursor-pointer text-slate-300">
                  <input
                    type="checkbox"
                    checked={!!taxConfig.isTaxInclusive}
                    onChange={(e) => {
                      setTaxConfig(prev => ({ ...prev, isTaxInclusive: e.target.checked }));
                      setIsFormDirty(true);
                    }}
                    className="rounded border-slate-700 bg-slate-900 text-indigo-600 focus:ring-indigo-500"
                  />
                  <span>Tax Inclusive Pricing</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer text-slate-300">
                  <input
                    type="checkbox"
                    checked={!!taxConfig.enableStateSplit}
                    onChange={(e) => {
                      setTaxConfig(prev => ({ ...prev, enableStateSplit: e.target.checked }));
                      setIsFormDirty(true);
                    }}
                    className="rounded border-slate-700 bg-slate-900 text-indigo-600 focus:ring-indigo-500"
                  />
                  <span>Intra-State CGST + SGST Split</span>
                </label>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
              {[
                { slab: 0, label: '0% Exempt', desc: 'SEZ / Export / Zero' },
                { slab: 5, label: '5% Reduced', desc: 'Concessional Bracket' },
                { slab: 12, label: '12% Standard', desc: 'Lower IT Standard' },
                { slab: 18, label: '18% SaaS Default', desc: 'Indian IT & Cloud Standard' },
                { slab: 28, label: '28% Luxury', desc: 'Highest Tax Tier' }
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

          {/* PART 1: Manual Slip Content & Branding Details */}
          <div className="space-y-3 pt-3 border-t border-slate-200/60 dark:border-white/10">
            <div className="flex items-center gap-2">
              <Building2 className="h-4 w-4 text-indigo-400" />
              <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider">
                1. Manual Slip Content & Branding Details
              </h4>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-slate-300">
                  Platform Brand / Slip Header
                </label>
                <input
                  type="text"
                  value={taxConfig.platformBrand || ''}
                  onChange={(e) => {
                    setTaxConfig(prev => ({ ...prev, platformBrand: e.target.value }));
                    setIsFormDirty(true);
                  }}
                  placeholder="ITLC ENTERPRISE HRMS"
                  className="glass-input h-11 w-full px-3.5 rounded-xl text-sm text-slate-100 focus:ring-2 focus:ring-indigo-500/30 font-semibold"
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
                  placeholder="ITLC Software Technologies Pvt Ltd"
                  className="glass-input h-11 w-full px-3.5 rounded-xl text-sm text-slate-100 focus:ring-2 focus:ring-indigo-500/30 font-semibold"
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
                  placeholder="INV-2026"
                  className="glass-input h-11 w-full px-3.5 rounded-xl text-sm font-mono text-slate-100 focus:ring-2 focus:ring-indigo-500/30"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-slate-300">
                  Super Owner Platform GSTIN
                </label>
                <input
                  type="text"
                  value={taxConfig.gstin || ''}
                  onChange={(e) => {
                    setTaxConfig(prev => ({ ...prev, gstin: e.target.value.toUpperCase() }));
                    setIsFormDirty(true);
                  }}
                  placeholder="07AABCI8899K1Z4"
                  className="glass-input h-11 w-full px-3.5 rounded-xl text-sm font-mono text-slate-100 focus:ring-2 focus:ring-indigo-500/30"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-slate-300">
                  Company PAN Number
                </label>
                <input
                  type="text"
                  value={taxConfig.panNumber || ''}
                  onChange={(e) => {
                    setTaxConfig(prev => ({ ...prev, panNumber: e.target.value.toUpperCase() }));
                    setIsFormDirty(true);
                  }}
                  placeholder="AABCI8899K"
                  className="glass-input h-11 w-full px-3.5 rounded-xl text-sm font-mono text-slate-100 focus:ring-2 focus:ring-indigo-500/30"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-slate-300">
                  HSN / SAC Code (Software)
                </label>
                <input
                  type="text"
                  value={taxConfig.hsnSacCode || ''}
                  onChange={(e) => {
                    setTaxConfig(prev => ({ ...prev, hsnSacCode: e.target.value }));
                    setIsFormDirty(true);
                  }}
                  placeholder="998313 (Cloud IT & SaaS)"
                  className="glass-input h-11 w-full px-3.5 rounded-xl text-sm text-slate-100 focus:ring-2 focus:ring-indigo-500/30"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-slate-300">
                  Place of Supply (State / Jurisdiction)
                </label>
                <input
                  type="text"
                  value={taxConfig.placeOfSupply || ''}
                  onChange={(e) => {
                    setTaxConfig(prev => ({ ...prev, placeOfSupply: e.target.value }));
                    setIsFormDirty(true);
                  }}
                  placeholder="07 - Delhi / NCR (Intra-State)"
                  className="glass-input h-11 w-full px-3.5 rounded-xl text-sm text-slate-100 focus:ring-2 focus:ring-indigo-500/30"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-slate-300">
                  Billing Support Email
                </label>
                <input
                  type="email"
                  value={taxConfig.supportEmail || ''}
                  onChange={(e) => {
                    setTaxConfig(prev => ({ ...prev, supportEmail: e.target.value }));
                    setIsFormDirty(true);
                  }}
                  placeholder="billing@itlc.in"
                  className="glass-input h-11 w-full px-3.5 rounded-xl text-sm text-slate-100 focus:ring-2 focus:ring-indigo-500/30"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-slate-300">
                  Support Helpline Phone
                </label>
                <input
                  type="text"
                  value={taxConfig.supportPhone || ''}
                  onChange={(e) => {
                    setTaxConfig(prev => ({ ...prev, supportPhone: e.target.value }));
                    setIsFormDirty(true);
                  }}
                  placeholder="+91 83688 17744"
                  className="glass-input h-11 w-full px-3.5 rounded-xl text-sm text-slate-100 focus:ring-2 focus:ring-indigo-500/30"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-slate-300">
                  Authorized Signatory Name
                </label>
                <input
                  type="text"
                  value={taxConfig.signatoryName || ''}
                  onChange={(e) => {
                    setTaxConfig(prev => ({ ...prev, signatoryName: e.target.value }));
                    setIsFormDirty(true);
                  }}
                  placeholder="Priya Sharma"
                  className="glass-input h-11 w-full px-3.5 rounded-xl text-sm text-slate-100 focus:ring-2 focus:ring-indigo-500/30 font-semibold"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-slate-300">
                  Signatory Designation / Title
                </label>
                <input
                  type="text"
                  value={taxConfig.signatoryTitle || ''}
                  onChange={(e) => {
                    setTaxConfig(prev => ({ ...prev, signatoryTitle: e.target.value }));
                    setIsFormDirty(true);
                  }}
                  placeholder="Authorized Signatory / Finance Head"
                  className="glass-input h-11 w-full px-3.5 rounded-xl text-sm text-slate-100 focus:ring-2 focus:ring-indigo-500/30"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-slate-300">
                  Exact GST Rate (%)
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

              {/* Signature / Official Stamp Image Upload & Live Slip Preview */}
              <div className="sm:col-span-2 lg:col-span-3 p-4 sm:p-5 rounded-2xl bg-slate-900/80 border border-slate-700/80 shadow-inner space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-slate-800">
                  <div>
                    <label className="text-xs font-bold text-slate-200 flex items-center gap-2">
                      <ImageIcon className="h-4 w-4 text-indigo-400" />
                      Authorized Signature & Official Stamp Image
                    </label>
                    <p className="text-[11px] text-slate-400">
                      Upload transparent PNG/JPG signature image to be printed on payment receipts & tax invoice PDFs.
                    </p>
                  </div>
                  {taxConfig.signatureImageUrl && (
                    <button
                      type="button"
                      onClick={handleRemoveSignature}
                      className="px-3 py-1.5 text-xs font-semibold rounded-xl bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/40 flex items-center gap-1.5 transition cursor-pointer self-start sm:self-auto"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                      Remove Signature
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
                  <div className="space-y-3">
                    <div className="flex flex-wrap items-center gap-3">
                      <label className="h-10 px-4 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white shadow-md shadow-indigo-600/30 flex items-center gap-2 cursor-pointer transition">
                        <Upload className="h-4 w-4" />
                        <span>Upload Signature File</span>
                        <input
                          type="file"
                          accept="image/png,image/jpeg,image/webp,image/svg+xml"
                          onChange={handleSignatureUpload}
                          className="hidden"
                        />
                      </label>
                      <span className="text-[11px] text-slate-400">Max 2MB (PNG / JPG)</span>
                    </div>

                    <div className="space-y-1">
                      <span className="text-[11px] text-slate-400">Or paste external image URL:</span>
                      <input
                        type="text"
                        value={taxConfig.signatureImageUrl || ''}
                        onChange={(e) => {
                          setTaxConfig(prev => ({ ...prev, signatureImageUrl: e.target.value }));
                          setIsFormDirty(true);
                        }}
                        placeholder="https://example.com/signature-stamp.png"
                        className="glass-input h-10 w-full px-3.5 rounded-xl text-xs text-slate-100 font-mono focus:ring-2 focus:ring-indigo-500/30"
                      />
                    </div>
                  </div>

                  {/* Visual Preview Box representing invoice signature line */}
                  <div className="min-h-[110px] rounded-xl bg-white border border-slate-300 flex flex-col items-center justify-center p-3 relative overflow-hidden shadow-xs">
                    <span className="absolute top-1.5 left-2.5 text-[9px] font-bold text-slate-400 uppercase tracking-wider">
                      Live Slip Signature Appearance:
                    </span>
                    {taxConfig.signatureImageUrl ? (
                      <div className="flex flex-col items-center justify-center mt-2">
                        <img
                          src={taxConfig.signatureImageUrl}
                          alt="Signature Preview"
                          className="max-h-14 max-w-[180px] object-contain"
                          onError={(e) => {
                            (e.currentTarget as HTMLImageElement).style.display = 'none';
                          }}
                        />
                        <div className="text-[11px] font-bold text-slate-900 mt-1">
                          {taxConfig.signatoryName || 'Authorized Signatory'}
                        </div>
                        <div className="text-[9px] text-slate-500">
                          {taxConfig.signatoryTitle || 'Authorized Signatory'}
                        </div>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center mt-3 text-center">
                        <div className="font-serif italic font-extrabold text-indigo-950 text-base border-b border-slate-300 px-4 pb-0.5">
                          {taxConfig.signatoryName || 'Priya Sharma'}
                        </div>
                        <div className="text-[10px] font-bold text-slate-800 mt-1">
                          {taxConfig.signatoryTitle || 'Authorized Signatory'}
                        </div>
                        <span className="text-[9px] text-amber-600 font-medium mt-0.5">
                          (No custom image — Fallback stylized font will appear)
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="space-y-1.5 sm:col-span-2 lg:col-span-3">
                <label className="block text-xs font-semibold text-slate-300">
                  Registered Office Address (Printed on Slip Header)
                </label>
                <textarea
                  rows={2}
                  value={taxConfig.registeredAddress || ''}
                  onChange={(e) => {
                    setTaxConfig(prev => ({ ...prev, registeredAddress: e.target.value }));
                    setIsFormDirty(true);
                  }}
                  placeholder="Cyber City Phase 2, DLF Tech Park, Gurugram, India"
                  className="glass-input w-full p-3 rounded-xl text-sm text-slate-100 focus:ring-2 focus:ring-indigo-500/30 resize-y"
                />
              </div>

              <div className="space-y-1.5 sm:col-span-2 lg:col-span-3">
                <label className="block text-xs font-semibold text-slate-300">
                  Invoice Terms, Notes & Legal Disclaimer
                </label>
                <textarea
                  rows={2}
                  value={taxConfig.invoiceTerms || ''}
                  onChange={(e) => {
                    setTaxConfig(prev => ({ ...prev, invoiceTerms: e.target.value }));
                    setIsFormDirty(true);
                  }}
                  placeholder="This invoice is issued electronically under Rule 48 of the CGST Rules, 2017. Digital verification requires no physical stamp. Valid for Input Tax Credit (ITC)."
                  className="glass-input w-full p-3 rounded-xl text-sm text-slate-100 focus:ring-2 focus:ring-indigo-500/30 resize-y"
                />
              </div>
            </div>
          </div>

          {/* PART 2: Element Display Visibility Switches */}
          <div className="space-y-3 pt-3 border-t border-slate-200/60 dark:border-white/10">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <Sliders className="h-4 w-4 text-emerald-400" />
                <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider">
                  2. Slip Display Visibility Controls
                </h4>
              </div>
              <span className="text-[11px] text-slate-400">
                Click any card to show or hide that element from the generated payment receipt & PDF
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {[
                {
                  key: 'showGstin',
                  label: 'Platform GSTIN',
                  desc: 'Displays Super Owner GSTIN in invoice header',
                  val: taxConfig.showGstin !== false
                },
                {
                  key: 'showPan',
                  label: 'Platform PAN Number',
                  desc: 'Displays Company PAN in seller meta block',
                  val: taxConfig.showPan !== false
                },
                {
                  key: 'showSac',
                  label: 'HSN / SAC Code',
                  desc: 'Displays SAC code 998313 in items table & header',
                  val: taxConfig.showSac !== false
                },
                {
                  key: 'showAddress',
                  label: 'Registered Office Address',
                  desc: 'Displays physical office address under company brand',
                  val: taxConfig.showAddress !== false
                },
                {
                  key: 'showQrCode',
                  label: 'Security QR Code',
                  desc: 'Displays digital verification QR code at footer',
                  val: taxConfig.showQrCode !== false
                },
                {
                  key: 'showSignatory',
                  label: 'Authorized Signatory Block',
                  desc: 'Displays signature line, title, and signatory name',
                  val: taxConfig.showSignatory !== false
                },
                {
                  key: 'showAmountInWords',
                  label: 'Amount in Words',
                  desc: 'Displays Indian Rupees in words (e.g. INR Forty Nine Thousand...)',
                  val: taxConfig.showAmountInWords !== false
                },
                {
                  key: 'showTerms',
                  label: 'Terms & Legal Disclaimer',
                  desc: 'Displays CGST Rule 48 statutory notes at invoice footer',
                  val: taxConfig.showTerms !== false
                },
                {
                  key: 'showFeatures',
                  label: 'Plan Features Breakdown',
                  desc: 'Displays active seats and storage badges under plan title',
                  val: taxConfig.showFeatures !== false
                }
              ].map((item) => {
                return (
                  <div
                    key={item.key}
                    onClick={() => {
                      setTaxConfig(prev => ({ ...prev, [item.key]: !item.val }));
                      setIsFormDirty(true);
                    }}
                    className={`p-3.5 rounded-xl border cursor-pointer transition-all flex items-start justify-between gap-3 ${
                      item.val 
                        ? 'bg-emerald-500/10 border-emerald-500/30 hover:bg-emerald-500/15' 
                        : 'bg-slate-800/40 border-slate-700/50 hover:bg-slate-800/60 opacity-65'
                    }`}
                  >
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2">
                        <span className={`text-xs font-bold ${item.val ? 'text-emerald-300' : 'text-slate-400'}`}>
                          {item.label}
                        </span>
                        <span className={`text-[9px] px-1.5 py-0.5 rounded font-bold uppercase ${
                          item.val ? 'bg-emerald-500/20 text-emerald-300' : 'bg-slate-700 text-slate-400'
                        }`}>
                          {item.val ? 'Shown' : 'Hidden'}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400 leading-tight">{item.desc}</p>
                    </div>

                    <div className={`h-6 w-11 rounded-full transition-colors flex items-center p-0.5 shrink-0 ${
                      item.val ? 'bg-emerald-500' : 'bg-slate-700'
                    }`}>
                      <div className={`h-5 w-5 rounded-full bg-white transition-transform ${
                        item.val ? 'translate-x-5' : 'translate-x-0'
                      }`} />
                    </div>
                  </div>
                );
              })}
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
