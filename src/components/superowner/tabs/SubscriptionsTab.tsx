import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Plus, Edit3, Trash2, Check, X, Shield, Users, 
  HardDrive, Cpu, AlertTriangle, ArrowRight, Zap, RefreshCw, ShieldAlert, ArrowLeft, Globe, Eye, EyeOff
} from 'lucide-react';
import { useDashboard } from '../context/DashboardContext';
import { SubscriptionPlan } from '../types';
import { api } from '../../../services/api';
import { syncHrmsPlansListToUnifiedCatalog } from '../../../types/multiTenant';

const getFeatureLabelAndStyle = (key: string, enabled: boolean) => {
  if (!enabled) {
    let label = key.replace(/([A-Z])/g, ' $1').replace(/^\w/, c => c.toUpperCase());
    if (key === 'gpsAttendance') label = 'GPS Attendance';
    if (key === 'apiAccess') label = 'API Access';
    return {
      label,
      className: 'text-slate-600 font-medium'
    };
  }

  switch (key) {
    case 'payroll':
      return { label: 'Payroll', className: 'text-amber-400 dark:text-amber-300 font-bold' };
    case 'attendance':
      return { label: 'Attendance', className: 'text-sky-400 dark:text-sky-300 font-bold' };
    case 'recruitment':
      return { label: 'Recruitment', className: 'text-indigo-400 dark:text-indigo-300 font-bold' };
    case 'faceRecognition':
      return { label: 'Face Recognition', className: 'text-purple-400 dark:text-purple-300 font-bold' };
    case 'gpsAttendance':
      return { label: 'GPS Attendance', className: 'text-rose-400 dark:text-rose-300 font-bold' };
    case 'apiAccess':
      return { label: 'API Access', className: 'text-teal-400 dark:text-teal-300 font-bold' };
    case 'whiteLabel':
      return { label: 'White Labeling', className: 'text-emerald-400 dark:text-emerald-300 font-bold' };
    default:
      return { 
        label: key.replace(/([A-Z])/g, ' $1').replace(/^\w/, c => c.toUpperCase()), 
        className: 'text-slate-200 font-bold' 
      };
  }
};

export const DEFAULT_PLAN_FEATURES = {
  payroll: true,
  attendance: true,
  recruitment: false,
  faceRecognition: false,
  gpsAttendance: false,
  apiAccess: false,
  whiteLabel: false
};

export const resolvePlanFeatures = (rawFeatures: any) => {
  if (!rawFeatures) return DEFAULT_PLAN_FEATURES;
  if (typeof rawFeatures === 'string') {
    try {
      const parsed = JSON.parse(rawFeatures);
      if (parsed && typeof parsed === 'object') return { ...DEFAULT_PLAN_FEATURES, ...parsed };
    } catch {}
    return DEFAULT_PLAN_FEATURES;
  }
  if (typeof rawFeatures === 'object') {
    return { ...DEFAULT_PLAN_FEATURES, ...rawFeatures };
  }
  return DEFAULT_PLAN_FEATURES;
};

export const SubscriptionsTab: React.FC = () => {
  const { plans, setPlans, companies, setCompanies, addToast, addLog, formatAmount, setIsFormDirty } = useDashboard();
  
  // Active selected plan (highlighted)
  const [activePlanId, setActivePlanId] = useState<string | null>('startup'); // Default to Startup plan highlight
  
  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<SubscriptionPlan | null>(null);
  const [deleteConfirmPlan, setDeleteConfirmPlan] = useState<{ id: string; name: string } | null>(null);

  // Form states
  const [formData, setFormData] = useState({
    name: '',
    price: 0,
    currency: 'USD' as 'USD' | 'INR',
    billingCycle: 'monthly' as 'monthly' | 'yearly',
    trialDays: 0,
    employeeLimit: 100,
    storageLimit: 10,
    aiCreditsLimit: 500,
    showOnLandingPage: true,
    features: {
      payroll: false,
      attendance: true,
      recruitment: false,
      faceRecognition: false,
      gpsAttendance: false,
      apiAccess: false,
      whiteLabel: false
    }
  });

  // Form Update Helper
  const updateForm = (updates: Partial<typeof formData> | ((prev: typeof formData) => typeof formData)) => {
    if (typeof updates === 'function') {
      setFormData(prev => {
        const next = updates(prev);
        setIsFormDirty(true);
        return next;
      });
    } else {
      setFormData(prev => ({ ...prev, ...updates }));
      setIsFormDirty(true);
    }
  };

  // Count companies on each plan
  const getCompanyCount = (planId: string) => {
    return companies.filter(c => c.subscriptionPlanId === planId).length;
  };

  const handleCreateClick = () => {
    setIsFormDirty(false);
    setSelectedPlan(null);
    setFormData({
      name: '',
      price: 999,
      currency: 'INR',
      billingCycle: 'monthly',
      trialDays: 14,
      employeeLimit: 100,
      storageLimit: 20,
      aiCreditsLimit: 500,
      showOnLandingPage: true,
      features: {
        payroll: true,
        attendance: true,
        recruitment: true,
        faceRecognition: false,
        gpsAttendance: false,
        apiAccess: false,
        whiteLabel: false
      }
    });
    setIsModalOpen(true);
  };

  const handleEditClick = (plan: SubscriptionPlan) => {
    setIsFormDirty(false);
    setSelectedPlan(plan);
    const initialCurrency = (plan as any).currency || 'INR';
    const displayPrice = plan.priceMonthly || plan.price || 0;

    setFormData({
      name: plan.name,
      price: displayPrice,
      currency: initialCurrency,
      billingCycle: plan.billingCycle,
      trialDays: plan.trialDays || 0,
      employeeLimit: plan.employeeLimit,
      storageLimit: plan.storageLimit,
      aiCreditsLimit: plan.aiCreditsLimit,
      showOnLandingPage: plan.showOnLandingPage !== false,
      features: resolvePlanFeatures(plan.features)
    });
    setIsModalOpen(true);
  };

  const handleToggleLandingVisibility = async (planId: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    let newShow = true;
    const updated = plans.map(p => {
      if (p.id === planId) {
        const currentShow = p.showOnLandingPage !== false;
        newShow = !currentShow;
        return { ...p, showOnLandingPage: !currentShow };
      }
      return p;
    });
    setPlans(updated);
    try {
      localStorage.setItem('hrms_subscription_plans', JSON.stringify(updated));
    } catch (err) {}
    syncHrmsPlansListToUnifiedCatalog(updated);
    try {
      await api.updatePlan(planId, { showOnLandingPage: newShow });
    } catch (err) {}
    addToast('Landing Page visibility updated!', 'info');
  };

  const handleDeleteClick = (id: string, name: string) => {
    setDeleteConfirmPlan({ id, name });
  };

  const executeDelete = async () => {
    if (!deleteConfirmPlan) return;
    const { id, name } = deleteConfirmPlan;
    try {
      try {
        await api.deletePlan(id);
      } catch (err) {
        console.warn('Backend deletePlan failed, deleting locally:', err);
      }
      try {
        const deletedIds = JSON.parse(localStorage.getItem('hrms_deleted_plan_ids') || '[]');
        if (!deletedIds.includes(id)) {
          deletedIds.push(id);
          localStorage.setItem('hrms_deleted_plan_ids', JSON.stringify(deletedIds));
        }
      } catch (e) {}
      const updated = plans.filter(p => p.id !== id);
      setPlans(updated);
      try {
        localStorage.setItem('hrms_subscription_plans', JSON.stringify(updated));
      } catch (e) {}
      syncHrmsPlansListToUnifiedCatalog(updated);
      addToast(`Plan "${name}" deleted successfully`, 'success');
      addLog('Plan Deleted', `Subscription plan "${name}" was removed from billing options.`, 'subscription');
    } catch (e: any) {
      addToast(e.message || 'Failed to delete plan', 'error');
    }
    setDeleteConfirmPlan(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      addToast('Please enter a plan name', 'error');
      return;
    }
    const rawPrice = Number(formData.price) || 0;
    const monthlyInr = formData.currency === 'USD' ? Math.round(rawPrice * 83) : rawPrice;
    const annualInr = Math.round(monthlyInr * 10);

    try {
      if (selectedPlan) {
        // Edit
        const updatedData: any = {
          id: selectedPlan.id,
          name: formData.name.trim(),
          price: monthlyInr,
          priceMonthly: monthlyInr,
          priceAnnual: annualInr,
          currency: formData.currency,
          billingCycle: formData.billingCycle,
          trialDays: Number(formData.trialDays),
          employeeLimit: Number(formData.employeeLimit),
          seatLimit: Number(formData.employeeLimit),
          storageLimit: Number(formData.storageLimit),
          storageLimitGb: Number(formData.storageLimit),
          aiCreditsLimit: Number(formData.aiCreditsLimit),
          showOnLandingPage: formData.showOnLandingPage !== false,
          features: formData.features
        };

        try {
          const deletedRaw = localStorage.getItem('hrms_deleted_plan_ids');
          if (deletedRaw) {
            const list = JSON.parse(deletedRaw);
            if (Array.isArray(list)) {
              const cleaned = list.filter((id: string) => String(id).toLowerCase() !== selectedPlan.id.toLowerCase());
              localStorage.setItem('hrms_deleted_plan_ids', JSON.stringify(cleaned));
            }
          }
        } catch (e) {}

        const updatedList = plans.map(p => p.id === selectedPlan.id ? { ...p, ...updatedData } : p);
        setPlans(updatedList);
        try {
          localStorage.setItem('hrms_subscription_plans', JSON.stringify(updatedList));
        } catch (e) {}
        syncHrmsPlansListToUnifiedCatalog(updatedList);
        addToast(`Plan "${formData.name}" updated successfully`, 'success');
        addLog('Plan Updated', `Plan details for "${formData.name}" modified.`, 'subscription');

        api.updatePlan(selectedPlan.id, updatedData).catch(err => {
          console.warn('Backend updatePlan failed:', err);
        });
      } else {
        // Create
        const baseSlug = formData.name.trim().toLowerCase().replace(/[^a-z0-9]/g, '_') || 'plan';
        const exists = plans.some(p => p.id === baseSlug);
        const newId = exists ? `${baseSlug}_${Date.now()}` : baseSlug;

        const newPlanData: any = {
          id: newId,
          name: formData.name.trim(),
          price: monthlyInr,
          priceMonthly: monthlyInr,
          priceAnnual: annualInr,
          currency: formData.currency,
          billingCycle: formData.billingCycle,
          trialDays: Number(formData.trialDays),
          employeeLimit: Number(formData.employeeLimit),
          seatLimit: Number(formData.employeeLimit),
          storageLimit: Number(formData.storageLimit),
          storageLimitGb: Number(formData.storageLimit),
          aiCreditsLimit: Number(formData.aiCreditsLimit),
          showOnLandingPage: formData.showOnLandingPage !== false,
          features: formData.features
        };

        try {
          const deletedRaw = localStorage.getItem('hrms_deleted_plan_ids');
          if (deletedRaw) {
            const list = JSON.parse(deletedRaw);
            if (Array.isArray(list)) {
              const cleaned = list.filter((id: string) => String(id).toLowerCase() !== newId.toLowerCase());
              localStorage.setItem('hrms_deleted_plan_ids', JSON.stringify(cleaned));
            }
          }
        } catch (e) {}

        const updatedList = [...plans.filter(p => p.id !== newId), newPlanData];
        setPlans(updatedList);
        try {
          localStorage.setItem('hrms_subscription_plans', JSON.stringify(updatedList));
        } catch (e) {}
        syncHrmsPlansListToUnifiedCatalog(updatedList);
        addToast(`Plan "${formData.name}" created successfully`, 'success');
        addLog('Plan Created', `New subscription plan "${formData.name}" registered.`, 'subscription');

        api.createPlan(newPlanData).catch(err => {
          console.warn('Backend createPlan failed:', err);
        });
      }
      setIsFormDirty(false);
      setIsModalOpen(false);
    } catch (err: any) {
      addToast(err.message || 'Failed to save plan', 'error');
    }
  };

  const handleFeatureToggle = (featureKey: keyof typeof formData.features) => {
    updateForm(prev => ({
      ...prev,
      features: {
        ...prev.features,
        [featureKey]: !prev.features[featureKey]
      }
    }));
  };

  // Helper to change subscription plan for a specific company
  const handleUpgradeDowngrade = async (companyId: string, newPlanId: string, companyName: string) => {
    try {
      const updated = await api.updateCompany(companyId, { subscriptionPlanId: newPlanId });
      setCompanies(prev => prev.map(c => c.id === companyId ? updated : c));
      addToast(`${companyName} subscription modified`, 'success');
      addLog('Subscription Updated', `Company "${companyName}" changed tier to "${plans.find(p => p.id === newPlanId)?.name}".`, 'subscription');
    } catch (err: any) {
      addToast(err.message || 'Failed to update subscription', 'error');
    }
  };

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white font-sans">
            Subscription Plans
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            Configure system license bundles, pricing, modules availability, and usage quotas.
          </p>
        </div>
        <button
          onClick={handleCreateClick}
          className="flex items-center gap-2 px-4 py-2 text-sm font-bold rounded-xl bg-white hover:bg-purple-50 text-purple-600 transition shadow border border-purple-200 w-fit"
        >
          <Plus className="h-4 w-4 text-purple-500" /> Create Plan
        </button>
      </div>

      {/* Plans Card Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-6">
        {plans.map((plan) => {
          const companiesCount = getCompanyCount(plan.id);
          const isSelected = activePlanId === plan.id;
          return (
            <motion.div
              key={plan.id}
              layoutId={`plan-card-${plan.id}`}
              onClick={() => setActivePlanId(plan.id)}
              className={`glass-card p-6 rounded-2xl flex flex-col justify-between relative group cursor-pointer transition-all duration-300 ${
                isSelected ? 'selected-plan-green' : 'hover:border-indigo-500/30'
              }`}
            >
              {plan.price >= 499 && (
                <div className="absolute -top-3 left-6 px-3 py-1 rounded-full bg-gradient-to-r from-purple-500 to-indigo-500 text-[10px] font-bold tracking-wider uppercase text-white shadow-md shadow-indigo-500/20">
                  Popular / enterprise
                </div>
              )}

              <div className="space-y-4">
                {/* Header */}
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-bold text-white text-lg">{plan.name}</h3>
                    <div className="flex items-center gap-2 mt-1 flex-wrap">
                      <span className="text-[10px] text-slate-500 font-mono uppercase tracking-wider">{plan.billingCycle} tier</span>
                      <button
                        type="button"
                        onClick={(e) => handleToggleLandingVisibility(plan.id, e)}
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold border transition flex items-center gap-1 ${
                          plan.showOnLandingPage !== false
                            ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/20'
                            : 'bg-slate-500/10 text-slate-400 border-slate-500/30 hover:bg-slate-500/20'
                        }`}
                        title="Click to Toggle Landing Page Visibility"
                      >
                        <Globe className="h-2.5 w-2.5" />
                        <span>{plan.showOnLandingPage !== false ? 'Landing: ON' : 'Landing: OFF'}</span>
                      </button>
                    </div>
                  </div>
                  <div className="flex gap-1.5">
                    <button
                      onClick={(e) => { e.stopPropagation(); handleEditClick(plan); }}
                      className="p-1.5 rounded-lg bg-white/10 hover:bg-amber-600 hover:text-white border border-white/10 text-slate-300 transition shadow"
                      title="Edit Plan"
                    >
                      <Edit3 className="h-3.5 w-3.5" />
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); handleDeleteClick(plan.id, plan.name); }}
                      className="p-1.5 rounded-lg bg-white/10 hover:bg-rose-600 hover:text-white border border-white/10 text-slate-300 transition shadow"
                      title="Delete Plan"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>

                {/* Pricing */}
                <div className="flex items-center gap-2 pt-2 flex-wrap">
                  <div className="flex items-baseline gap-1">
                    <span className="text-3xl font-extrabold text-white font-mono">₹{(plan.priceMonthly || plan.price || 0).toLocaleString()}</span>
                    <span className="text-slate-400 text-xs">/ month</span>
                  </div>
                  {plan.trialDays > 0 && (
                    <span className="px-2 py-0.5 rounded bg-fuchsia-500/10 text-fuchsia-400 border border-fuchsia-500/20 text-[10px] font-bold">
                      {plan.trialDays} Days Trial
                    </span>
                  )}
                </div>

                {/* Quotas */}
                <div className="space-y-2.5 text-xs border-y border-white/5 py-4">
                  <div className="flex items-center justify-between text-slate-300">
                    <span className="flex items-center gap-1.5 text-slate-400"><Users className="h-3.5 w-3.5" /> Max Employees</span>
                    <span className="font-semibold font-mono">{plan.employeeLimit === 99999 ? 'Unlimited' : plan.employeeLimit}</span>
                  </div>
                  <div className="flex items-center justify-between text-slate-300">
                    <span className="flex items-center gap-1.5 text-slate-400"><HardDrive className="h-3.5 w-3.5" /> Storage limit</span>
                    <span className="font-semibold font-mono">{plan.storageLimit} GB</span>
                  </div>
                  <div className="flex items-center justify-between text-slate-300">
                    <span className="flex items-center gap-1.5 text-slate-400"><Cpu className="h-3.5 w-3.5" /> AI Reports Credits</span>
                    <span className="font-semibold font-mono">{plan.aiCreditsLimit} / mo</span>
                  </div>
                </div>

                {/* Feature checklist */}
                <div className="space-y-2 pt-2 text-xs">
                  <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Modules Included:</span>
                  
                  {Object.entries(resolvePlanFeatures(plan.features)).map(([key, enabled]) => {
                    const styleInfo = getFeatureLabelAndStyle(key, enabled);
                    return (
                      <div key={key} className={`flex items-center justify-between`}>
                        <span className={styleInfo.className}>{styleInfo.label}</span>
                        {enabled ? (
                          <Check className="h-3.5 w-3.5 text-emerald-400" />
                        ) : (
                          <X className="h-3.5 w-3.5 text-slate-600" />
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Bottom stats / indicator */}
              <div className="border-t border-white/5 pt-4 mt-6 flex justify-between items-center text-[10px] text-slate-400">
                <span className="flex items-center gap-1"><Shield className="h-3 w-3" /> Secure License</span>
                <span className="bg-indigo-500/10 text-indigo-300 px-2 py-0.5 rounded font-semibold font-mono">
                  {companiesCount} {companiesCount === 1 ? 'company' : 'companies'}
                </span>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Tenants License Upgrading matrix */}
      <div className="glass-card rounded-2xl p-6 mt-6">
        <h3 className="text-base font-semibold text-white mb-2">Tenant License Upgrades</h3>
        <p className="text-xs text-slate-400 mb-6">Instantly transition client company billing plans.</p>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="border-b border-white/5 text-slate-400 text-xs font-semibold uppercase tracking-wider bg-white/2">
                <th className="py-3 px-4">Company</th>
                <th className="py-3 px-4">Current Plan</th>
                <th className="py-3 px-4">Usage Limits</th>
                <th className="py-3 px-4">Change Tier</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-slate-300">
              {companies.map(c => {
                const currentPlan = plans.find(p => p.id === c.subscriptionPlanId);
                return (
                  <tr key={c.id} className="hover:bg-white/2 transition">
                    <td className="py-3 px-4 font-semibold text-white">{c.name}</td>
                    <td className="py-3 px-4">
                      <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-indigo-500/10 border border-indigo-500/20 text-indigo-300">
                        {currentPlan?.name || 'Trial'}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-xs font-mono text-slate-400">
                      Employees: {c.employeesCount} / {currentPlan?.employeeLimit === 99999 ? 'Unlimited' : currentPlan?.employeeLimit || 0}
                    </td>
                    <td className="py-3 px-4">
                      <select
                        value={c.subscriptionPlanId}
                        onChange={(e) => handleUpgradeDowngrade(c.id, e.target.value, c.name)}
                        className="glass-input px-2.5 py-1 rounded-lg text-xs text-slate-300"
                      >
                        {plans.map(p => (
                          <option key={p.id} value={p.id}>{p.name}</option>
                        ))}
                      </select>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex justify-end gap-1.5">
                        <button
                          onClick={() => handleUpgradeDowngrade(c.id, 'enterprise', c.name)}
                          className="px-2.5 py-1 text-[10px] font-bold tracking-wider uppercase rounded-lg bg-purple-500/20 hover:bg-purple-600 hover:text-white border border-purple-500/30 text-purple-300 transition flex items-center gap-1"
                        >
                          <Zap className="h-3 w-3" /> Upgrade to Enterprise
                        </button>
                        <button
                          onClick={() => {
                            if (confirm(`Renew subscription for ${c.name}?`)) {
                              addToast(`Subscription for ${c.name} renewed`, 'success');
                              addLog('Subscription Renewed', `Manual license renewal executed for ${c.name}.`, 'subscription');
                            }
                          }}
                          className="p-1 rounded bg-white/5 hover:bg-emerald-600 hover:text-white border border-white/5 text-slate-400 transition"
                          title="Renew Subscription"
                        >
                          <RefreshCw className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit / Create Plan Modal */}
      {createPortal(
        <AnimatePresence>
          {isModalOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
              <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                className="glass-card w-full max-w-lg p-6 rounded-2xl space-y-6 relative max-h-[90vh] overflow-y-auto border border-white/10"
              >
                <div className="absolute top-0 right-0 h-32 w-32 bg-indigo-500/10 blur-2xl pointer-events-none"></div>

                <button
                  onClick={() => { setIsModalOpen(false); setIsFormDirty(false); }}
                  className="absolute top-4 right-4 p-1 rounded-lg hover:bg-white/5 text-slate-400 hover:text-white"
                >
                  <X className="h-4 w-4" />
                </button>

                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => { setIsModalOpen(false); setIsFormDirty(false); }}
                    className="p-1 rounded-lg hover:bg-white/5 text-slate-400 hover:text-white transition"
                    title="Go Back"
                  >
                    <ArrowLeft className="h-5 w-5" />
                  </button>
                  <div>
                    <h3 className="text-xl font-bold text-white font-sans">{selectedPlan ? 'Edit License Plan' : 'Create New License Plan'}</h3>
                    <p className="text-xs text-slate-400 mt-1">Configure pricing, quota limits, and included modules.</p>
                  </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="col-span-1 sm:col-span-2 space-y-1.5">
                      <label className="text-xs text-slate-400 font-medium">Plan Name</label>
                      <input
                        type="text"
                        required
                        value={formData.name}
                        onChange={(e) => updateForm({ name: e.target.value })}
                        placeholder="e.g. Starter, Premium"
                        className="glass-input w-full px-3.5 py-2 rounded-xl text-sm text-slate-200"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs text-slate-400 font-medium">Currency</label>
                      <select
                        value={formData.currency}
                        onChange={(e) => updateForm({ currency: e.target.value as 'USD' | 'INR' })}
                        className="glass-input w-full px-3.5 py-2 rounded-xl text-sm text-slate-300"
                      >
                        <option value="USD">USD ($)</option>
                        <option value="INR">INR (₹)</option>
                      </select>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs text-slate-400 font-medium">Price ({formData.currency})</label>
                      <input
                        type="number"
                        required
                        value={formData.price}
                        onChange={(e) => updateForm({ price: Number(e.target.value) })}
                        placeholder="99"
                        className="glass-input w-full px-3.5 py-2 rounded-xl text-sm text-slate-200"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs text-slate-400 font-medium">Billing Cycle</label>
                      <select
                        value={formData.billingCycle}
                        onChange={(e) => updateForm({ billingCycle: e.target.value as 'monthly' | 'yearly' })}
                        className="glass-input w-full px-3.5 py-2 rounded-xl text-sm text-slate-300"
                      >
                        <option value="monthly">Monthly</option>
                        <option value="yearly">Yearly</option>
                      </select>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs text-slate-400 font-medium">Employee Limit</label>
                      <input
                        type="number"
                        required
                        value={formData.employeeLimit}
                        onChange={(e) => updateForm({ employeeLimit: Number(e.target.value) })}
                        placeholder="100"
                        className="glass-input w-full px-3.5 py-2 rounded-xl text-sm text-slate-200"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs text-slate-400 font-medium">Storage Limit (GB)</label>
                      <input
                        type="number"
                        required
                        value={formData.storageLimit}
                        onChange={(e) => updateForm({ storageLimit: Number(e.target.value) })}
                        placeholder="50"
                        className="glass-input w-full px-3.5 py-2 rounded-xl text-sm text-slate-200"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs text-slate-400 font-medium">AI Report Credits</label>
                      <input
                        type="number"
                        required
                        value={formData.aiCreditsLimit}
                        onChange={(e) => updateForm({ aiCreditsLimit: Number(e.target.value) })}
                        placeholder="1000"
                        className="glass-input w-full px-3.5 py-2 rounded-xl text-sm text-slate-200"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs text-slate-400 font-medium">Free Trial Duration (Days)</label>
                      <input
                        type="number"
                        required
                        min="0"
                        value={formData.trialDays}
                        onChange={(e) => updateForm({ trialDays: Number(e.target.value) })}
                        placeholder="e.g. 14, 30 (0 for no trial)"
                        className="glass-input w-full px-3.5 py-2 rounded-xl text-sm text-slate-200"
                      />
                    </div>
                  </div>

                  {/* Modules switches */}
                  <div className="space-y-2 border-t border-white/5 pt-4">
                    <label className="text-xs text-slate-400 font-semibold uppercase tracking-wider block">Included Modules</label>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                      {Object.entries(resolvePlanFeatures(formData.features)).map(([key, enabled]) => {
                        const styleInfo = getFeatureLabelAndStyle(key, enabled);
                        return (
                          <div
                            key={key}
                            onClick={() => handleFeatureToggle(key as keyof typeof formData.features)}
                            className={`flex items-center justify-between p-2 rounded-lg border cursor-pointer select-none transition ${enabled ? 'bg-indigo-500/10 border-indigo-500/30' : 'bg-white/2 border-white/5'}`}
                          >
                            <span className={styleInfo.className}>{styleInfo.label}</span>
                            {enabled ? <Check className="h-4 w-4 text-emerald-400" /> : <X className="h-4 w-4 text-slate-500" />}
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Public Landing Page Toggle */}
                  <div className="p-3.5 rounded-xl border border-indigo-500/30 bg-indigo-500/10 flex items-center justify-between">
                    <div>
                      <span className="text-xs font-bold text-white flex items-center gap-1.5">
                        <Globe className="h-3.5 w-3.5 text-indigo-400" />
                        Show on Public Landing Page
                      </span>
                      <span className="text-[11px] text-slate-400 block mt-0.5">
                        Display this plan in website pricing cards (#pricing) & public checkout
                      </span>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input 
                        type="checkbox" 
                        checked={formData.showOnLandingPage !== false}
                        onChange={(e) => updateForm({ showOnLandingPage: e.target.checked })}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                    </label>
                  </div>

                  <div className="flex justify-end gap-2 border-t border-white/5 pt-4 mt-2">
                    <button
                      type="button"
                      onClick={() => { setIsModalOpen(false); setIsFormDirty(false); }}
                      className="px-4 py-2 text-sm font-semibold rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 border border-white/10 transition flex items-center gap-1.5"
                    >
                      <ArrowLeft className="h-4 w-4" /> Back
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 text-sm font-semibold rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white transition shadow-lg shadow-indigo-600/30"
                    >
                      Save Changes
                    </button>
                  </div>
                </form>
              </motion.div>
            </div>
          )}
        </AnimatePresence>,
        document.body
      )}

      {/* Custom Delete Confirmation Modal */}
      {createPortal(
        <AnimatePresence>
          {deleteConfirmPlan && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
              <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                className="glass-card w-full max-w-sm p-6 rounded-2xl space-y-4 relative overflow-hidden border border-white/10"
              >
                <div className="absolute top-0 right-0 h-32 w-32 bg-rose-500/10 blur-2xl pointer-events-none"></div>
                
                <div className="flex items-center gap-3 text-rose-500">
                  <ShieldAlert className="h-6 w-6 shrink-0" />
                  <h3 className="text-lg font-bold text-white font-sans">Delete License Plan</h3>
                </div>
                
                <p className="text-xs text-slate-300 leading-relaxed font-sans">
                  Are you sure you want to delete license plan <span className="font-extrabold text-white font-mono">{deleteConfirmPlan.name}</span>? This action is permanent and cannot be undone.
                </p>
                
                <div className="flex justify-end gap-3 pt-2">
                  <button
                    onClick={() => setDeleteConfirmPlan(null)}
                    className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 text-xs font-semibold border border-slate-200/20 dark:border-white/10 transition"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={executeDelete}
                    className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold transition shadow-md shadow-rose-600/20"
                  >
                    Confirm Delete
                  </button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>,
        document.body
      )}
    </div>
  );
};
export default SubscriptionsTab;
