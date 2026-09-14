import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Plus, Edit2, Trash2, Check, X, Ticket, Calendar, 
  Users, ToggleLeft, ToggleRight, Info, AlertTriangle, ShieldAlert
} from 'lucide-react';
import { api } from '../../../services/api';
import { useDashboard } from '../context/DashboardContext';
import { Coupon } from '../types';

export const CouponsTab: React.FC = () => {
  const { coupons, setCoupons, addToast, addLog, isFormDirty, setIsFormDirty } = useDashboard();

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCoupon, setSelectedCoupon] = useState<Coupon | null>(null);
  const [deleteConfirmCoupon, setDeleteConfirmCoupon] = useState<{ id: string; code: string } | null>(null);

  // Form states
  const [formData, setFormData] = useState({
    code: '',
    discountType: 'percentage' as 'percentage' | 'fixed',
    value: 10,
    expiryDate: '',
    usageLimit: 100,
    status: 'active' as 'active' | 'inactive'
  });

  // Form Update Helper
  const updateForm = (updates: Partial<typeof formData>) => {
    setFormData(prev => ({ ...prev, ...updates }));
    setIsFormDirty(true);
  };

  const handleCreateClick = () => {
    setIsFormDirty(false);
    setSelectedCoupon(null);
    setFormData({
      code: '',
      discountType: 'percentage',
      value: 15,
      expiryDate: '2026-12-31',
      usageLimit: 200,
      status: 'active'
    });
    setIsModalOpen(true);
  };

  const handleEditClick = (coupon: Coupon) => {
    setIsFormDirty(false);
    setSelectedCoupon(coupon);
    setFormData({
      code: coupon.code,
      discountType: coupon.discountType,
      value: coupon.value,
      expiryDate: coupon.expiryDate,
      usageLimit: coupon.usageLimit,
      status: coupon.status
    });
    setIsModalOpen(true);
  };

  const executeDelete = async () => {
    if (!deleteConfirmCoupon) return;
    const { id, code } = deleteConfirmCoupon;
    try {
      await api.deleteCoupon(id);
      setCoupons(prev => prev.filter(c => c.id !== id));
      addToast(`Promo code "${code}" deleted`, 'success');
      addLog('Coupon Deleted', `Promo discount code "${code}" was deleted from registry.`, 'settings');
    } catch (err) {
      addToast('Failed to delete coupon', 'error');
    } finally {
      setDeleteConfirmCoupon(null);
    }
  };

  const handleToggleStatus = async (id: string, code: string, currentStatus: 'active' | 'inactive') => {
    const nextStatus = currentStatus === 'active' ? 'inactive' : 'active';
    try {
      await api.updateCoupon(id, { status: nextStatus });
      setCoupons(prev => prev.map(c => c.id === id ? { ...c, status: nextStatus } : c));
      addToast(`Promo code "${code}" set to ${nextStatus}`, nextStatus === 'active' ? 'success' : 'warning');
      addLog('Coupon Status Changed', `Coupon "${code}" status updated to ${nextStatus}.`, 'settings');
    } catch (err) {
      addToast('Failed to update coupon status', 'error');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const uppercaseCode = formData.code.toUpperCase().replace(/\s+/g, '');
    
    try {
      if (selectedCoupon) {
        // Edit
        const updatedData = {
          code: uppercaseCode,
          discountType: formData.discountType,
          discountValue: Number(formData.value),
          validUntil: formData.expiryDate,
          usageLimit: Number(formData.usageLimit),
          status: formData.status
        };
        await api.updateCoupon(selectedCoupon.id, updatedData);
        setCoupons(prev => prev.map(c => c.id === selectedCoupon.id ? {
          ...c,
          code: uppercaseCode,
          discountType: formData.discountType,
          value: Number(formData.value),
          expiryDate: formData.expiryDate,
          usageLimit: Number(formData.usageLimit),
          status: formData.status
        } : c));
        addToast(`Coupon "${uppercaseCode}" updated`, 'success');
        addLog('Coupon Updated', `Promo code details for "${uppercaseCode}" modified.`, 'settings');
      } else {
        // Create
        const id = `cp_${Math.random().toString(36).substring(2, 9)}`;
        const newData = {
          id,
          code: uppercaseCode,
          discountType: formData.discountType,
          discountValue: Number(formData.value),
          validUntil: formData.expiryDate,
          usageLimit: Number(formData.usageLimit),
          usedCount: 0,
          status: formData.status
        };
        await api.createCoupon(newData);
        
        const newCoupon: Coupon = {
          id,
          code: uppercaseCode,
          discountType: formData.discountType,
          value: Number(formData.value),
          expiryDate: formData.expiryDate,
          usageLimit: Number(formData.usageLimit),
          usageCount: 0,
          status: formData.status
        };
        setCoupons(prev => [...prev, newCoupon]);
        addToast(`Coupon "${uppercaseCode}" created`, 'success');
        addLog('Coupon Created', `New promo code "${uppercaseCode}" added.`, 'settings');
      }
      setIsFormDirty(false);
      setIsModalOpen(false);
    } catch (err: any) {
      addToast(err.message || 'Failed to save coupon', 'error');
    }
  };

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white font-sans">
            Promo Coupons Management
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            Create subscription promo codes, configure value percentages, and track client campaign redemptions.
          </p>
        </div>
        <button
          onClick={handleCreateClick}
          className="flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white transition shadow-lg shadow-indigo-600/30 w-fit"
        >
          <Plus className="h-4 w-4" /> Create Coupon
        </button>
      </div>

      {/* Coupons Table Grid */}
      <div className="glass-card rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="border-b border-white/5 text-slate-400 text-xs font-semibold uppercase tracking-wider bg-white/2">
                <th className="py-4 px-5">Voucher Code</th>
                <th className="py-4 px-4">Discount Value</th>
                <th className="py-4 px-4">Expiry Date</th>
                <th className="py-4 px-4 text-center">Usage Statistics</th>
                <th className="py-4 px-4 text-center">Activation</th>
                <th className="py-4 px-5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-slate-300">
              {coupons.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400">
                    <Ticket className="h-10 w-10 mx-auto text-slate-500 mb-3 opacity-40" />
                    No promotional codes registered.
                  </td>
                </tr>
              ) : (
                coupons.map(cp => (
                  <tr key={cp.id} className="hover:bg-white/2 transition">
                    <td className="py-4 px-5">
                      <span className="px-3 py-1.5 rounded-lg coupon-badge-orange font-mono font-extrabold text-sm tracking-wider uppercase inline-block shadow-md">
                        {cp.code}
                      </span>
                    </td>

                    {/* Value */}
                    <td className="py-4 px-4">
                      <span className="font-bold text-white text-base font-mono">
                        {cp.discountType === 'percentage' ? `${cp.value}% Off` : `$${cp.value} Off`}
                      </span>
                      <span className="text-[10px] text-slate-500 block capitalize">Applied on checkout</span>
                    </td>

                    {/* Expiry */}
                    <td className="py-4 px-4 font-mono text-xs text-slate-400">
                      <div className="flex items-center gap-1.5">
                        <Calendar className="h-3.5 w-3.5 text-slate-500" /> {cp.expiryDate}
                      </div>
                    </td>

                    {/* Usage count */}
                    <td className="py-4 px-4 text-center">
                      <div className="flex flex-col items-center">
                        <span className="font-mono font-bold text-white text-xs">{cp.usageCount} / {cp.usageLimit}</span>
                        {/* usage bar */}
                        <div className="h-1 w-20 bg-white/5 rounded-full mt-1.5 overflow-hidden">
                          <div className="h-full bg-indigo-500" style={{ width: `${(cp.usageCount / cp.usageLimit) * 100}%` }}></div>
                        </div>
                      </div>
                    </td>

                    {/* Switch status */}
                    <td className="py-4 px-4">
                      <div className="flex justify-center">
                        <button onClick={() => handleToggleStatus(cp.id, cp.code, cp.status)}>
                          {cp.status === 'active' ? (
                            <ToggleRight className="h-6 w-6 text-indigo-400" />
                          ) : (
                            <ToggleLeft className="h-6 w-6 text-slate-600" />
                          )}
                        </button>
                      </div>
                    </td>

                    {/* Actions */}
                    <td className="py-4 px-5 text-right">
                      <div className="flex justify-end gap-1.5">
                        <button
                          onClick={() => handleEditClick(cp)}
                          title="Edit Coupon Details"
                          className="p-1.5 rounded-lg bg-white/5 hover:bg-amber-600 hover:text-white border border-white/10 text-slate-300 transition"
                        >
                          <Edit2 className="h-3.5 w-3.5" />
                        </button>
                        <button
                          onClick={() => setDeleteConfirmCoupon({ id: cp.id, code: cp.code })}
                          title="Delete Coupon"
                          className="p-1.5 rounded-lg bg-white/5 hover:bg-rose-600 hover:text-white border border-white/10 text-rose-400 hover:text-white transition"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create / Edit Coupon Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="glass-card w-full max-w-md p-6 rounded-2xl space-y-6 relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 h-32 w-32 bg-indigo-500/10 blur-2xl pointer-events-none"></div>

              <button
                onClick={() => { setIsModalOpen(false); setIsFormDirty(false); }}
                className="absolute top-4 right-4 p-1 rounded-lg hover:bg-white/5 text-slate-400 hover:text-white"
              >
                <X className="h-4 w-4" />
              </button>

              <div>
                <h3 className="text-xl font-bold text-white">{selectedCoupon ? 'Edit Discount Voucher' : 'Create Promo Voucher'}</h3>
                <p className="text-xs text-slate-400 mt-1">Configure checkout redemption thresholds.</p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-3">
                  <div className="space-y-1.5">
                    <label className="text-xs text-slate-400 font-medium">Coupon Code (Uppercase)</label>
                    <input
                      type="text"
                      required
                      value={formData.code}
                      onChange={(e) => updateForm({ code: e.target.value })}
                      placeholder="e.g. SUMMERLAUNCH25"
                      className="glass-input w-full px-3.5 py-2 rounded-xl text-sm text-slate-200 font-mono"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-xs text-slate-400 font-medium">Voucher Type</label>
                      <select
                        value={formData.discountType}
                        onChange={(e) => updateForm({ discountType: e.target.value as 'percentage' | 'fixed' })}
                        className="glass-input w-full px-3.5 py-2 rounded-xl text-sm text-slate-300"
                      >
                        <option value="percentage">Percentage (%)</option>
                        <option value="fixed">Flat Amount ($)</option>
                      </select>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs text-slate-400 font-medium">Discount Value</label>
                      <input
                        type="number"
                        required
                        value={formData.value}
                        onChange={(e) => updateForm({ value: Number(e.target.value) })}
                        placeholder="15"
                        className="glass-input w-full px-3.5 py-2 rounded-xl text-sm text-slate-200"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs text-slate-400 font-medium">Expiration Date</label>
                    <input
                      type="date"
                      required
                      value={formData.expiryDate}
                      onChange={(e) => updateForm({ expiryDate: e.target.value })}
                      className="glass-input w-full px-3.5 py-2 rounded-xl text-sm text-slate-300"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs text-slate-400 font-medium">Total Usage Limit</label>
                    <input
                      type="number"
                      required
                      value={formData.usageLimit}
                      onChange={(e) => updateForm({ usageLimit: Number(e.target.value) })}
                      placeholder="100"
                      className="glass-input w-full px-3.5 py-2 rounded-xl text-sm text-slate-200"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs text-slate-400 font-medium">Initial Status</label>
                    <select
                      value={formData.status}
                      onChange={(e) => updateForm({ status: e.target.value as 'active' | 'inactive' })}
                      className="glass-input w-full px-3.5 py-2 rounded-xl text-sm text-slate-300"
                    >
                      <option value="active">Active (Redeemable)</option>
                      <option value="inactive">Inactive</option>
                    </select>
                  </div>
                </div>

                <div className="flex justify-end gap-2 border-t border-white/5 pt-4 mt-2">
                  <button
                    type="button"
                    onClick={() => { setIsModalOpen(false); setIsFormDirty(false); }}
                    className="px-4 py-2 text-sm font-semibold rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 border border-white/10 transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 text-sm font-semibold rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white transition shadow-lg shadow-indigo-600/30"
                  >
                    Save Voucher
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Custom Delete Confirmation Modal */}
      <AnimatePresence>
        {deleteConfirmCoupon && (
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
                <h3 className="text-lg font-bold text-white font-sans">Delete Promo Code</h3>
              </div>
              
              <p className="text-xs text-slate-300 leading-relaxed font-sans">
                Are you sure you want to delete promo code <span className="font-extrabold text-white font-mono">{deleteConfirmCoupon.code}</span>? This action is permanent and cannot be undone.
              </p>
              
              <div className="flex justify-end gap-3 pt-2">
                <button
                  onClick={() => setDeleteConfirmCoupon(null)}
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
      </AnimatePresence>
    </div>
  );
};
export default CouponsTab;
