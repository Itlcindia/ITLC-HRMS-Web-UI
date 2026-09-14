import React, { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { 
  TrendingUp, Target, Users, DollarSign, Receipt, CheckSquare, 
  ArrowUpRight, ArrowRight, Kanban, Plus, Filter, Sparkles, 
  CheckCircle2, Clock, AlertCircle, Briefcase, ExternalLink
} from 'lucide-react';
import { useDashboard } from '../context/DashboardContext';

export const CrmOverviewTab: React.FC<{ onSwitchToCRM?: () => void }> = ({ onSwitchToCRM }) => {
  const { setActiveTab } = useDashboard();

  // Load CRM data from localStorage
  const [leads, setLeads] = useState<any[]>(() => {
    try {
      const saved = localStorage.getItem('crm_leads');
      return saved ? JSON.parse(saved) : [];
    } catch { return []; }
  });

  const [deals, setDeals] = useState<any[]>(() => {
    try {
      const saved = localStorage.getItem('crm_deals');
      return saved ? JSON.parse(saved) : [];
    } catch { return []; }
  });

  const [tasks, setTasks] = useState<any[]>(() => {
    try {
      const saved = localStorage.getItem('crm_tasks');
      return saved ? JSON.parse(saved) : [];
    } catch { return []; }
  });

  const [invoices, setInvoices] = useState<any[]>(() => {
    try {
      const saved = localStorage.getItem('crm_invoices');
      return saved ? JSON.parse(saved) : [];
    } catch { return []; }
  });

  // Calculate CRM Metrics
  const stats = useMemo(() => {
    const totalLeads = leads.length;
    const qualifiedLeads = leads.filter(l => l.status?.toLowerCase() === 'qualified' || l.status?.toLowerCase() === 'contacted').length;
    const totalPipelineValue = deals.reduce((sum, d) => sum + (Number(d.value) || 0), 0);
    const wonDeals = deals.filter(d => d.stage?.toLowerCase() === 'closed' || d.stage?.toLowerCase() === 'won');
    const wonRevenue = wonDeals.reduce((sum, d) => sum + (Number(d.value) || 0), 0);
    const pendingTasks = tasks.filter(t => !t.completed).length;
    const paidInvoices = invoices.filter(i => i.status?.toLowerCase() === 'paid').reduce((sum, i) => sum + (Number(i.amount) || 0), 0);

    return {
      totalLeads,
      qualifiedLeads,
      totalPipelineValue,
      wonDealsCount: wonDeals.length,
      wonRevenue,
      pendingTasks,
      paidInvoices,
      conversionRate: totalLeads > 0 ? Math.round((wonDeals.length / totalLeads) * 100) : 0
    };
  }, [leads, deals, tasks, invoices]);

  return (
    <div className="w-full max-w-6xl mx-auto space-y-6 sm:space-y-8 pb-12">
      {/* Top Banner */}
      <div className="glass-card p-6 rounded-3xl bg-gradient-to-r from-indigo-900/30 via-purple-900/20 to-slate-900/40 border border-indigo-500/20 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-xs font-bold uppercase tracking-wider text-indigo-300">Unified Sales CRM Suite</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            Sales CRM Command Center
          </h1>
          <p className="text-slate-300 text-xs sm:text-sm max-w-2xl">
            Live telemetry for leads, deal progression, pipeline velocity, invoices, and sales team task logs.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setActiveTab('Leads & Deals Pipeline')}
            className="h-11 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition shadow-lg shadow-indigo-600/25 flex items-center gap-2 cursor-pointer"
          >
            <Plus className="h-4 w-4" /> Manage Leads
          </button>
          {onSwitchToCRM && (
            <button
              onClick={onSwitchToCRM}
              className="h-11 px-4 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-slate-200 text-xs font-bold transition flex items-center gap-2 cursor-pointer"
              title="Launch standalone CRM workspace"
            >
              <span>Full CRM Mode</span>
              <ExternalLink className="h-3.5 w-3.5 text-indigo-400" />
            </button>
          )}
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
        
        {/* Total Leads */}
        <div className="glass-card p-5 rounded-2xl border border-slate-200/80 dark:border-white/10 shadow-md flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Leads</span>
            <div className="text-2xl sm:text-3xl font-black text-white mt-1">
              {stats.totalLeads}
            </div>
            <span className="text-[11px] text-emerald-400 font-medium flex items-center gap-1 mt-1">
              <ArrowUpRight className="h-3 w-3" /> {stats.qualifiedLeads} Qualified
            </span>
          </div>
          <div className="h-12 w-12 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 shrink-0">
            <Users className="h-6 w-6" />
          </div>
        </div>

        {/* Pipeline Value */}
        <div className="glass-card p-5 rounded-2xl border border-slate-200/80 dark:border-white/10 shadow-md flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Pipeline Value</span>
            <div className="text-2xl sm:text-3xl font-black text-white mt-1">
              ${stats.totalPipelineValue.toLocaleString()}
            </div>
            <span className="text-[11px] text-indigo-400 font-medium flex items-center gap-1 mt-1">
              <TrendingUp className="h-3 w-3" /> {deals.length} Active Deals
            </span>
          </div>
          <div className="h-12 w-12 rounded-2xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400 shrink-0">
            <Kanban className="h-6 w-6" />
          </div>
        </div>

        {/* Closed Won Revenue */}
        <div className="glass-card p-5 rounded-2xl border border-slate-200/80 dark:border-white/10 shadow-md flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Won Deals Revenue</span>
            <div className="text-2xl sm:text-3xl font-black text-emerald-400 mt-1">
              ${stats.wonRevenue.toLocaleString()}
            </div>
            <span className="text-[11px] text-slate-400 font-medium flex items-center gap-1 mt-1">
              <CheckCircle2 className="h-3 w-3 text-emerald-400" /> {stats.wonDealsCount} Closed Deals
            </span>
          </div>
          <div className="h-12 w-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 shrink-0">
            <DollarSign className="h-6 w-6" />
          </div>
        </div>

        {/* Pending Tasks & Activities */}
        <div className="glass-card p-5 rounded-2xl border border-slate-200/80 dark:border-white/10 shadow-md flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Open Tasks</span>
            <div className="text-2xl sm:text-3xl font-black text-amber-400 mt-1">
              {stats.pendingTasks}
            </div>
            <span className="text-[11px] text-slate-400 font-medium flex items-center gap-1 mt-1">
              <Clock className="h-3 w-3 text-amber-400" /> {tasks.length} Total Registered
            </span>
          </div>
          <div className="h-12 w-12 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 shrink-0">
            <CheckSquare className="h-6 w-6" />
          </div>
        </div>

      </div>

      {/* Main 2-Column Split: Pipeline Stages & Recent Leads */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Deal Funnel & Stages */}
        <div className="glass-card p-6 rounded-2xl border border-slate-200/80 dark:border-white/10 shadow-lg space-y-5">
          <div className="flex items-center justify-between pb-4 border-b border-slate-200/60 dark:border-white/10">
            <div className="flex items-center gap-2.5">
              <Target className="h-5 w-5 text-indigo-400" />
              <h3 className="text-base font-bold text-white">Deal Funnel Velocity</h3>
            </div>
            <button
              onClick={() => setActiveTab('Leads & Deals Pipeline')}
              className="text-xs text-indigo-400 hover:text-indigo-300 font-semibold flex items-center gap-1 cursor-pointer"
            >
              View Pipeline <ArrowRight className="h-3 w-3" />
            </button>
          </div>

          <div className="space-y-4">
            {['Proposal', 'Negotiation', 'Closed'].map(stage => {
              const stageDeals = deals.filter(d => d.stage?.toLowerCase() === stage.toLowerCase());
              const val = stageDeals.reduce((sum, d) => sum + (Number(d.value) || 0), 0);
              const percentage = stats.totalPipelineValue > 0 ? Math.round((val / stats.totalPipelineValue) * 100) : 0;
              
              return (
                <div key={stage} className="space-y-1.5">
                  <div className="flex justify-between text-xs font-semibold">
                    <span className="text-slate-300 flex items-center gap-2">
                      <span className={`h-2 w-2 rounded-full ${
                        stage === 'Proposal' ? 'bg-blue-400' :
                        stage === 'Negotiation' ? 'bg-purple-400' : 'bg-emerald-400'
                      }`} />
                      {stage} ({stageDeals.length})
                    </span>
                    <span className="text-white font-mono">${val.toLocaleString()} ({percentage}%)</span>
                  </div>
                  <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
                    <div 
                      className={`h-full rounded-full transition-all duration-500 ${
                        stage === 'Proposal' ? 'bg-blue-500' :
                        stage === 'Negotiation' ? 'bg-purple-500' : 'bg-emerald-500'
                      }`}
                      style={{ width: `${Math.max(percentage, 5)}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>

          <div className="p-4 rounded-xl bg-white/3 border border-white/5 flex items-center justify-between text-xs">
            <span className="text-slate-400 font-medium">Conversion Win Rate</span>
            <span className="text-emerald-400 font-bold font-mono text-sm">{stats.conversionRate}%</span>
          </div>
        </div>

        {/* Recent CRM Leads Feed */}
        <div className="glass-card p-6 rounded-2xl border border-slate-200/80 dark:border-white/10 shadow-lg space-y-5">
          <div className="flex items-center justify-between pb-4 border-b border-slate-200/60 dark:border-white/10">
            <div className="flex items-center gap-2.5">
              <Users className="h-5 w-5 text-purple-400" />
              <h3 className="text-base font-bold text-white">Latest Sales Prospects</h3>
            </div>
            <button
              onClick={() => setActiveTab('Leads & Deals Pipeline')}
              className="text-xs text-purple-400 hover:text-purple-300 font-semibold flex items-center gap-1 cursor-pointer"
            >
              All Leads <ArrowRight className="h-3 w-3" />
            </button>
          </div>

          <div className="space-y-3">
            {leads.slice(0, 4).map((l, i) => (
              <div key={l.id || i} className="p-3.5 rounded-xl bg-white/2 hover:bg-white/5 border border-white/5 flex items-center justify-between transition">
                <div className="space-y-0.5 min-w-0">
                  <span className="font-bold text-xs text-white block truncate">{l.name}</span>
                  <span className="text-[11px] text-slate-400 block truncate">{l.email} • {l.source}</span>
                </div>
                <div className="text-right shrink-0">
                  <span className="text-xs font-bold text-emerald-400 font-mono block">${Number(l.value || 0).toLocaleString()}</span>
                  <span className="text-[10px] text-slate-400 uppercase font-semibold">{l.status}</span>
                </div>
              </div>
            ))}

            {leads.length === 0 && (
              <div className="py-8 text-center text-xs text-slate-400">
                No active CRM leads logged yet.
              </div>
            )}
          </div>
        </div>

      </div>

      {/* Quick Access CRM Sub-Modules Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <button
          onClick={() => setActiveTab('Invoices & Quotes')}
          className="p-5 rounded-2xl glass-card hover:border-indigo-500/40 text-left transition space-y-2 group cursor-pointer"
        >
          <div className="h-10 w-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 group-hover:bg-indigo-600 group-hover:text-white transition">
            <Receipt className="h-5 w-5" />
          </div>
          <h4 className="text-sm font-bold text-white group-hover:text-indigo-300 transition">Invoices & Billing</h4>
          <p className="text-[11px] text-slate-400">GST tax invoices, quotes, receipts and payment records.</p>
        </button>

        <button
          onClick={() => setActiveTab('Tasks & Schedules')}
          className="p-5 rounded-2xl glass-card hover:border-amber-500/40 text-left transition space-y-2 group cursor-pointer"
        >
          <div className="h-10 w-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 group-hover:bg-amber-600 group-hover:text-white transition">
            <CheckSquare className="h-5 w-5" />
          </div>
          <h4 className="text-sm font-bold text-white group-hover:text-amber-300 transition">Tasks & Schedules</h4>
          <p className="text-[11px] text-slate-400">Sales rep activities, call schedules, meetings, and reminders.</p>
        </button>

        <button
          onClick={() => setActiveTab('CRM Master Settings')}
          className="p-5 rounded-2xl glass-card hover:border-purple-500/40 text-left transition space-y-2 group cursor-pointer"
        >
          <div className="h-10 w-10 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400 group-hover:bg-purple-600 group-hover:text-white transition">
            <Briefcase className="h-5 w-5" />
          </div>
          <h4 className="text-sm font-bold text-white group-hover:text-purple-300 transition">CRM Configuration</h4>
          <p className="text-[11px] text-slate-400">Custom pipelines, lead stages, currency rates, and team rep roles.</p>
        </button>
      </div>

    </div>
  );
};

export default CrmOverviewTab;
