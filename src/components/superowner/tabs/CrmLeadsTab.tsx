import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Users, Plus, Search, Filter, Trash2, Edit2, CheckCircle2, 
  X, Phone, Mail, DollarSign, Tag, ArrowUpDown, ChevronDown, 
  ExternalLink, Sparkles, Building2, Kanban
} from 'lucide-react';
import { useDashboard } from '../context/DashboardContext';

export const CrmLeadsTab: React.FC = () => {
  const { addToast, addLog } = useDashboard();

  // Live Leads State synced with localStorage
  const [leads, setLeads] = useState<any[]>(() => {
    try {
      const saved = localStorage.getItem('crm_leads');
      return saved ? JSON.parse(saved) : [];
    } catch { return []; }
  });

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [sourceFilter, setSourceFilter] = useState('ALL');
  const [showModal, setShowModal] = useState(false);
  const [editingLead, setEditingLead] = useState<any | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    source: 'Website',
    value: 25000,
    status: 'New',
    tag: 'Standard',
    assignedRep: 'Super Owner'
  });

  // Sync back to CRM localStorage
  const saveLeads = (newLeads: any[]) => {
    setLeads(newLeads);
    localStorage.setItem('crm_leads', JSON.stringify(newLeads));
  };

  const handleOpenAdd = () => {
    setEditingLead(null);
    setFormData({
      name: '',
      email: '',
      phone: '',
      source: 'Website',
      value: 25000,
      status: 'New',
      tag: 'Standard',
      assignedRep: 'Super Owner'
    });
    setShowModal(true);
  };

  const handleOpenEdit = (lead: any) => {
    setEditingLead(lead);
    setFormData({
      name: lead.name || '',
      email: lead.email || '',
      phone: lead.phone || '',
      source: lead.source || 'Website',
      value: Number(lead.value) || 25000,
      status: lead.status || 'New',
      tag: lead.tag || 'Standard',
      assignedRep: lead.assignedRep || 'Super Owner'
    });
    setShowModal(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) return;

    if (editingLead) {
      const updated = leads.map(l => l.id === editingLead.id ? { ...l, ...formData, value: Number(formData.value) } : l);
      saveLeads(updated);
      addToast(`Lead "${formData.name}" updated successfully!`, 'success');
      addLog('CRM Lead Updated', `Super Owner updated lead ${formData.name}`, 'company');
    } else {
      const newLead = {
        id: Date.now(),
        ...formData,
        value: Number(formData.value),
        date: new Date().toISOString().split('T')[0],
        notes: [{ id: Date.now(), text: 'Lead created in Super Owner CRM control room.', date: new Date().toISOString().split('T')[0], author: 'Super Owner' }]
      };
      saveLeads([newLead, ...leads]);
      addToast(`New lead "${formData.name}" added to CRM pipeline!`, 'success');
      addLog('CRM Lead Created', `Super Owner created lead ${formData.name}`, 'company');
    }

    setShowModal(false);
  };

  const handleDelete = (id: number, name: string) => {
    if (window.confirm(`Are you sure you want to remove lead "${name}"?`)) {
      const filtered = leads.filter(l => l.id !== id);
      saveLeads(filtered);
      addToast(`Lead "${name}" deleted.`, 'info');
      addLog('CRM Lead Deleted', `Super Owner deleted lead ${name}`, 'company');
    }
  };

  const filteredLeads = useMemo(() => {
    return leads.filter(l => {
      const matchSearch = l.name?.toLowerCase().includes(search.toLowerCase()) || 
                          l.email?.toLowerCase().includes(search.toLowerCase()) ||
                          l.phone?.includes(search);
      const matchStatus = statusFilter === 'ALL' || l.status === statusFilter;
      const matchSource = sourceFilter === 'ALL' || l.source === sourceFilter;
      return matchSearch && matchStatus && matchSource;
    });
  }, [leads, search, statusFilter, sourceFilter]);

  return (
    <div className="w-full max-w-6xl mx-auto space-y-6 sm:space-y-8 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              Leads & Deals Pipeline
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-purple-500/10 text-purple-300 border border-purple-500/20">
              {filteredLeads.length} Leads Active
            </span>
          </div>
          <p className="text-slate-400 text-xs sm:text-sm mt-1">
            Super Owner unified lead tracking, conversion stages, and multi-channel prospects.
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="h-11 px-5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold text-xs sm:text-sm transition shadow-lg shadow-indigo-600/30 flex items-center justify-center gap-2 cursor-pointer self-start sm:self-auto"
        >
          <Plus className="h-4 w-4" /> Add New Lead
        </button>
      </div>

      {/* Filter & Search Bar */}
      <div className="glass-card p-4 rounded-2xl border border-slate-200/80 dark:border-white/10 shadow-md flex flex-col md:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search leads by name, email, or phone number..."
            className="glass-input h-11 w-full pl-10 pr-4 rounded-xl text-xs sm:text-sm text-slate-100 placeholder-slate-500"
          />
        </div>

        <div className="flex items-center gap-2.5 w-full md:w-auto">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="glass-input h-11 px-3.5 rounded-xl text-xs font-semibold text-slate-300 bg-transparent cursor-pointer flex-1 md:flex-none"
          >
            <option value="ALL">All Statuses</option>
            <option value="New">New</option>
            <option value="Contacted">Contacted</option>
            <option value="Qualified">Qualified</option>
            <option value="Lost">Lost</option>
          </select>

          <select
            value={sourceFilter}
            onChange={(e) => setSourceFilter(e.target.value)}
            className="glass-input h-11 px-3.5 rounded-xl text-xs font-semibold text-slate-300 bg-transparent cursor-pointer flex-1 md:flex-none"
          >
            <option value="ALL">All Channels</option>
            <option value="Website">Website</option>
            <option value="LinkedIn">LinkedIn</option>
            <option value="Email">Email</option>
            <option value="Referrals">Referrals</option>
            <option value="Other">Other</option>
          </select>
        </div>
      </div>

      {/* Leads Table Container */}
      <div className="glass-card rounded-2xl border border-slate-200/80 dark:border-white/10 shadow-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead>
              <tr className="border-b border-slate-200/60 dark:border-white/10 bg-white/2 text-slate-400 font-bold uppercase tracking-wider text-[11px]">
                <th className="py-3.5 px-4 sm:px-6">Lead / Prospect</th>
                <th className="py-3.5 px-4">Contact Info</th>
                <th className="py-3.5 px-4">Deal Value</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4">Channel</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200/60 dark:divide-white/5">
              {filteredLeads.map((l) => (
                <tr key={l.id} className="hover:bg-white/3 transition group">
                  <td className="py-3.5 px-4 sm:px-6">
                    <div className="space-y-0.5">
                      <span className="font-bold text-white block text-sm">{l.name}</span>
                      <span className="text-[11px] text-slate-400 flex items-center gap-1.5">
                        <Tag className="h-3 w-3 text-indigo-400" /> {l.tag || 'Standard'} • Rep: {l.assignedRep || 'Admin'}
                      </span>
                    </div>
                  </td>
                  <td className="py-3.5 px-4 text-slate-300">
                    <div className="space-y-0.5 text-xs">
                      <div className="flex items-center gap-1.5"><Mail className="h-3 w-3 text-slate-400" /> {l.email || 'N/A'}</div>
                      {l.phone && <div className="flex items-center gap-1.5 text-slate-400"><Phone className="h-3 w-3 text-slate-400" /> {l.phone}</div>}
                    </div>
                  </td>
                  <td className="py-3.5 px-4 font-mono font-bold text-emerald-400">
                    ${Number(l.value || 0).toLocaleString()}
                  </td>
                  <td className="py-3.5 px-4">
                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${
                      l.status === 'Qualified' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                      l.status === 'Contacted' ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' :
                      l.status === 'Lost' ? 'bg-rose-500/10 text-rose-400 border-rose-500/20' :
                      'bg-purple-500/10 text-purple-400 border-purple-500/20'
                    }`}>
                      {l.status}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-slate-300 text-xs font-medium">
                    {l.source}
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        onClick={() => handleOpenEdit(l)}
                        className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white transition"
                        title="Edit lead"
                      >
                        <Edit2 className="h-3.5 w-3.5" />
                      </button>
                      <button
                        onClick={() => handleDelete(l.id, l.name)}
                        className="p-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 transition"
                        title="Delete lead"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}

              {filteredLeads.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400 text-xs sm:text-sm">
                    No leads matching your search criteria. Click "Add New Lead" to create one.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Lead Modal */}
      <AnimatePresence>
        {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="glass-card w-full max-w-lg p-6 rounded-3xl space-y-5 border border-slate-200/80 dark:border-white/10 shadow-2xl relative"
            >
              <div className="flex items-center justify-between pb-3 border-b border-slate-200/60 dark:border-white/10">
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <Users className="h-5 w-5 text-indigo-400" />
                  {editingLead ? 'Edit Lead Details' : 'Register New CRM Lead'}
                </h3>
                <button
                  onClick={() => setShowModal(false)}
                  className="p-1.5 rounded-lg hover:bg-white/10 text-slate-400 hover:text-white"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-slate-300">Client / Contact Name *</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g. Acme Innovations Ltd."
                    className="glass-input h-11 w-full px-3.5 rounded-xl text-sm text-slate-100"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="block text-xs font-semibold text-slate-300">Email Address *</label>
                    <input
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="client@company.com"
                      className="glass-input h-11 w-full px-3.5 rounded-xl text-sm text-slate-100"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-xs font-semibold text-slate-300">Phone Number</label>
                    <input
                      type="text"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      placeholder="+91 98765 43210"
                      className="glass-input h-11 w-full px-3.5 rounded-xl text-sm text-slate-100"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="space-y-1.5">
                    <label className="block text-xs font-semibold text-slate-300">Deal Value ($)</label>
                    <input
                      type="number"
                      required
                      value={formData.value}
                      onChange={(e) => setFormData({ ...formData, value: Number(e.target.value) })}
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
                      <option value="New">New</option>
                      <option value="Contacted">Contacted</option>
                      <option value="Qualified">Qualified</option>
                      <option value="Lost">Lost</option>
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-xs font-semibold text-slate-300">Channel</label>
                    <select
                      value={formData.source}
                      onChange={(e) => setFormData({ ...formData, source: e.target.value })}
                      className="glass-input h-11 w-full px-3 rounded-xl text-xs font-semibold text-slate-200 bg-transparent cursor-pointer"
                    >
                      <option value="Website">Website</option>
                      <option value="LinkedIn">LinkedIn</option>
                      <option value="Email">Email</option>
                      <option value="Referrals">Referrals</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-3 border-t border-white/5">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="h-11 px-4 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 text-slate-300 text-xs font-semibold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="h-11 px-6 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs sm:text-sm shadow-lg shadow-indigo-600/30"
                  >
                    {editingLead ? 'Update Lead' : 'Save Lead'}
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

export default CrmLeadsTab;
