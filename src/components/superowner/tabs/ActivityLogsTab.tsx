import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { 
  Search, Filter, History, AlertTriangle, Calendar, 
  Trash2, ShieldCheck, CreditCard, Building2, UserMinus
} from 'lucide-react';
import { useDashboard } from '../context/DashboardContext';
import { ActivityLog } from '../types';
import { api } from '../../../services/api';

export const ActivityLogsTab: React.FC = () => {
  const { logs, setLogs, addToast } = useDashboard();
  
  // Search & Category Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');

  const filteredLogs = useMemo(() => {
    return logs.filter(log => {
      const matchesSearch = 
        log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.details.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.actorName.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesCat = categoryFilter === 'all' || log.category === categoryFilter;

      return matchesSearch && matchesCat;
    });
  }, [logs, searchTerm, categoryFilter]);

  const handleClearLogs = async () => {
    if (confirm('Clear audit trail? (Warning: This action is irreversible and violates compliance standards in production)')) {
      try {
        await api.clearLogs();
        setLogs([]);
        addToast('Audit trail logs cleared permanently', 'warning');
      } catch (e) {
        addToast('Failed to clear logs', 'error');
      }
    }
  };

  const getCategoryColor = (cat: ActivityLog['category']) => {
    const styles = {
      company: 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20',
      subscription: 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20',
      payment: 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20',
      user: 'bg-purple-500/10 text-purple-400 border border-purple-500/20',
      feature: 'bg-amber-500/10 text-amber-400 border border-amber-500/20',
      security: 'bg-rose-500/10 text-rose-400 border border-rose-500/20 shadow-[0_0_8px_rgba(244,63,94,0.15)]',
      settings: 'bg-slate-500/10 text-slate-400 border border-slate-500/20'
    };
    return styles[cat] || 'bg-slate-500/10 text-slate-400 border border-slate-500/20';
  };

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white font-sans">
            Platform Activity Logs
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            Browse systemic logging telemetry, track administrator adjustments, and audit checkout security alerts.
          </p>
        </div>
        <button
          onClick={handleClearLogs}
          className="flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-xl bg-white/5 hover:bg-rose-600 border border-white/10 text-rose-400 hover:text-white transition w-fit"
        >
          <Trash2 className="h-4 w-4" /> Clear Audit Trail
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="glass-card p-4 rounded-2xl flex flex-col md:flex-row gap-4 justify-between items-center">
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search by action, actor, or details..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="glass-input pl-10 pr-4 py-2 rounded-xl text-sm text-slate-200 placeholder-slate-400 w-full"
          />
        </div>

        <div className="flex flex-wrap gap-3 w-full md:w-auto items-center justify-end">
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <Filter className="h-3.5 w-3.5" /> Filters:
          </div>

          {/* Category Filter */}
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="glass-input px-3 py-1.5 rounded-lg text-xs text-slate-300"
          >
            <option value="all">All Categories</option>
            <option value="company">Company Tenants</option>
            <option value="subscription">Subscriptions</option>
            <option value="payment">Settlements / Payments</option>
            <option value="user">Users Registry</option>
            <option value="feature">Feature Flags</option>
            <option value="security">Security / 2FA</option>
            <option value="settings">Global Settings</option>
          </select>
        </div>
      </div>

      {/* Logs Registry Feed */}
      <div className="glass-card p-6 rounded-2xl space-y-4">
        <div className="flex items-center gap-2 mb-2">
          <History className="h-4.5 w-4.5 text-slate-400" />
          <h3 className="text-base font-semibold text-white">Systemic Telemetry Logs</h3>
        </div>

        <div className="space-y-3 max-h-[500px] overflow-y-auto pr-1">
          {filteredLogs.length === 0 ? (
            <div className="py-12 text-center text-slate-500 italic">
              No activity logs match your search.
            </div>
          ) : (
            filteredLogs.map(log => (
              <div 
                key={log.id} 
                className="p-3.5 rounded-xl bg-white/2 border border-white/5 text-xs flex flex-col md:flex-row justify-between items-start md:items-center gap-4 hover:border-white/10 transition"
              >
                <div className="flex items-start gap-3">
                  {/* Category Badge Icon */}
                  <span className={`px-2 py-1.5 rounded-lg shrink-0 font-mono font-bold tracking-wider uppercase ${getCategoryColor(log.category)}`}>
                    {log.category.substring(0, 3)}
                  </span>
                  
                  <div className="space-y-1">
                    <span className="font-extrabold text-white block">{log.action}</span>
                    <p className="text-slate-400 leading-relaxed font-bold">{log.details}</p>
                  </div>
                </div>

                <div className="text-left md:text-right shrink-0 text-[10px] text-slate-500 font-mono space-y-1">
                  <span className="block font-semibold text-slate-400">Actor: {log.actorName}</span>
                  <span className="block">{new Date(log.timestamp).toLocaleString()}</span>
                  <span className="block text-[8px] opacity-50">LOG ID: {log.id}</span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
export default ActivityLogsTab;
