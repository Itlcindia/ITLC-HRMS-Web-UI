import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Receipt, Plus, Search, DollarSign, Calendar, CheckCircle2, 
  Clock, AlertTriangle, Printer, Trash2, X, Download, ShieldCheck
} from 'lucide-react';
import { useDashboard } from '../context/DashboardContext';

export const CrmInvoicesTab: React.FC = () => {
  const { addToast, addLog } = useDashboard();

  // Load invoices from localStorage
  const [invoices, setInvoices] = useState<any[]>(() => {
    try {
      const saved = localStorage.getItem('crm_invoices');
      if (saved) return JSON.parse(saved);
    } catch {}
    return [
      { id: 'INV-2026-001', client: 'Acme Global Corp', amount: 85000, tax: 15300, status: 'Paid', date: '2026-08-15', dueDate: '2026-09-15' },
      { id: 'INV-2026-002', client: 'Starlight Tech Solutions', amount: 120000, tax: 21600, status: 'Pending', date: '2026-09-01', dueDate: '2026-10-01' },
      { id: 'INV-2026-003', client: 'Vanguard Enterprise', amount: 45000, tax: 8100, status: 'Overdue', date: '2026-07-20', dueDate: '2026-08-20' }
    ];
  });

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [showModal, setShowModal] = useState(false);

  const [formData, setFormData] = useState({
    client: '',
    amount: 50000,
    status: 'Pending',
    dueDate: new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0]
  });

  const saveInvoices = (newInvs: any[]) => {
    setInvoices(newInvs);
    localStorage.setItem('crm_invoices', JSON.stringify(newInvs));
  };

  const handleCreateInvoice = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.client.trim()) return;

    const taxAmount = Math.round(Number(formData.amount) * 0.18);
    const newInv = {
      id: `INV-2026-${String(invoices.length + 1).padStart(3, '0')}`,
      client: formData.client,
      amount: Number(formData.amount),
      tax: taxAmount,
      status: formData.status,
      date: new Date().toISOString().split('T')[0],
      dueDate: formData.dueDate
    };

    saveInvoices([newInv, ...invoices]);
    setShowModal(false);
    addToast(`Invoice ${newInv.id} generated for ${formData.client}!`, 'success');
    addLog('CRM Invoice Generated', `Generated tax invoice ${newInv.id} ($${newInv.amount})`, 'payment');
  };

  const handleDelete = (id: string) => {
    if (window.confirm(`Delete invoice ${id}?`)) {
      saveInvoices(invoices.filter(i => i.id !== id));
      addToast(`Invoice ${id} removed.`, 'info');
    }
  };

  const filteredInvoices = useMemo(() => {
    return invoices.filter(i => {
      const matchSearch = i.client?.toLowerCase().includes(search.toLowerCase()) || i.id?.toLowerCase().includes(search.toLowerCase());
      const matchStatus = statusFilter === 'ALL' || i.status === statusFilter;
      return matchSearch && matchStatus;
    });
  }, [invoices, search, statusFilter]);

  const totalPaid = invoices.filter(i => i.status === 'Paid').reduce((s, i) => s + (Number(i.amount) || 0), 0);
  const totalPending = invoices.filter(i => i.status !== 'Paid').reduce((s, i) => s + (Number(i.amount) || 0), 0);

  return (
    <div className="w-full max-w-6xl mx-auto space-y-6 sm:space-y-8 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            Invoices & GST Billing Records
          </h1>
          <p className="text-slate-400 text-xs sm:text-sm mt-1">
            Tax invoices, client receipts, outstanding receivables, and automated ledger entries.
          </p>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="h-11 px-5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold text-xs sm:text-sm transition shadow-lg shadow-indigo-600/30 flex items-center justify-center gap-2 cursor-pointer self-start sm:self-auto"
        >
          <Plus className="h-4 w-4" /> Create Invoice
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="glass-card p-5 rounded-2xl border border-slate-200/80 dark:border-white/10 shadow-md">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Invoices</span>
          <div className="text-2xl font-black text-white mt-1">{invoices.length}</div>
          <span className="text-[11px] text-slate-400 mt-1 block">Active Billing Ledger</span>
        </div>

        <div className="glass-card p-5 rounded-2xl border border-slate-200/80 dark:border-white/10 shadow-md">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Collected Revenue</span>
          <div className="text-2xl font-black text-emerald-400 mt-1">${totalPaid.toLocaleString()}</div>
          <span className="text-[11px] text-emerald-400 mt-1 block">Cleared in Bank</span>
        </div>

        <div className="glass-card p-5 rounded-2xl border border-slate-200/80 dark:border-white/10 shadow-md">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Pending Receivables</span>
          <div className="text-2xl font-black text-amber-400 mt-1">${totalPending.toLocaleString()}</div>
          <span className="text-[11px] text-amber-400 mt-1 block">Awaiting Client Settlement</span>
        </div>
      </div>

      {/* Search & Filter */}
      <div className="glass-card p-4 rounded-2xl border border-slate-200/80 dark:border-white/10 shadow-md flex flex-col sm:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by invoice number or client name..."
            className="glass-input h-11 w-full pl-10 pr-4 rounded-xl text-xs sm:text-sm text-slate-100 placeholder-slate-500"
          />
        </div>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="glass-input h-11 px-3.5 rounded-xl text-xs font-semibold text-slate-300 bg-transparent cursor-pointer w-full sm:w-auto"
        >
          <option value="ALL">All Statuses</option>
          <option value="Paid">Paid</option>
          <option value="Pending">Pending</option>
          <option value="Overdue">Overdue</option>
        </select>
      </div>

      {/* Invoices Table */}
      <div className="glass-card rounded-2xl border border-slate-200/80 dark:border-white/10 shadow-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead>
              <tr className="border-b border-slate-200/60 dark:border-white/10 bg-white/2 text-slate-400 font-bold uppercase tracking-wider text-[11px]">
                <th className="py-3.5 px-4 sm:px-6">Invoice #</th>
                <th className="py-3.5 px-4">Client Company</th>
                <th className="py-3.5 px-4">Subtotal + GST (18%)</th>
                <th className="py-3.5 px-4">Issue Date</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200/60 dark:divide-white/5">
              {filteredInvoices.map((inv) => (
                <tr key={inv.id} className="hover:bg-white/3 transition">
                  <td className="py-3.5 px-4 sm:px-6 font-mono font-bold text-indigo-400">
                    {inv.id}
                  </td>
                  <td className="py-3.5 px-4 font-bold text-white">
                    {inv.client}
                  </td>
                  <td className="py-3.5 px-4 font-mono">
                    <span className="font-bold text-white">${Number(inv.amount).toLocaleString()}</span>
                    <span className="text-[11px] text-slate-400 block">+${Number(inv.tax || 0).toLocaleString()} GST</span>
                  </td>
                  <td className="py-3.5 px-4 text-slate-300 text-xs">
                    {inv.date}
                  </td>
                  <td className="py-3.5 px-4">
                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${
                      inv.status === 'Paid' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                      inv.status === 'Pending' ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' :
                      'bg-rose-500/10 text-rose-400 border-rose-500/20'
                    }`}>
                      {inv.status}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        onClick={() => {
                          addToast(`Printing invoice ${inv.id}...`, 'info');
                          window.print();
                        }}
                        className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white transition"
                        title="Print invoice"
                      >
                        <Printer className="h-3.5 w-3.5" />
                      </button>
                      <button
                        onClick={() => handleDelete(inv.id)}
                        className="p-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 transition"
                        title="Delete invoice"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      <AnimatePresence>
        {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="glass-card w-full max-w-md p-6 rounded-3xl space-y-5 border border-slate-200/80 dark:border-white/10 shadow-2xl relative"
            >
              <div className="flex items-center justify-between pb-3 border-b border-white/10">
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <Receipt className="h-5 w-5 text-indigo-400" /> Generate Invoice
                </h3>
                <button onClick={() => setShowModal(false)} className="p-1 rounded hover:bg-white/10 text-slate-400 hover:text-white">
                  <X className="h-4 w-4" />
                </button>
              </div>

              <form onSubmit={handleCreateInvoice} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-slate-300">Client / Company Name *</label>
                  <input
                    type="text"
                    required
                    value={formData.client}
                    onChange={(e) => setFormData({ ...formData, client: e.target.value })}
                    placeholder="e.g. Apex Global Tech"
                    className="glass-input h-11 w-full px-3.5 rounded-xl text-sm text-slate-100"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="block text-xs font-semibold text-slate-300">Amount ($)</label>
                    <input
                      type="number"
                      required
                      value={formData.amount}
                      onChange={(e) => setFormData({ ...formData, amount: Number(e.target.value) })}
                      className="glass-input h-11 w-full px-3.5 rounded-xl text-sm text-slate-100 font-mono"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-xs font-semibold text-slate-300">Status</label>
                    <select
                      value={formData.status}
                      onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                      className="glass-input h-11 w-full px-3 rounded-xl text-xs font-semibold text-slate-200 bg-transparent cursor-pointer"
                    >
                      <option value="Pending">Pending</option>
                      <option value="Paid">Paid</option>
                      <option value="Overdue">Overdue</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-slate-300">Payment Due Date</label>
                  <input
                    type="date"
                    value={formData.dueDate}
                    onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                    className="glass-input h-11 w-full px-3.5 rounded-xl text-sm text-slate-200"
                  />
                </div>

                <div className="flex justify-end gap-3 pt-3 border-t border-white/5">
                  <button type="button" onClick={() => setShowModal(false)} className="h-11 px-4 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 text-slate-300 text-xs font-semibold">
                    Cancel
                  </button>
                  <button type="submit" className="h-11 px-6 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs sm:text-sm shadow-lg shadow-indigo-600/30">
                    Issue Invoice
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
};

export default CrmInvoicesTab;
