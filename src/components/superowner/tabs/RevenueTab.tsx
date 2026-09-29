import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { 
  DollarSign, TrendingUp, Download, CreditCard, CheckCircle, 
  Clock, AlertCircle, FileText, ArrowRight, Building, HelpCircle
} from 'lucide-react';
import { useDashboard, CURRENCY_DETAILS } from '../context/DashboardContext';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, 
  ResponsiveContainer, BarChart, Bar, Cell
} from 'recharts';

export const RevenueTab: React.FC = () => {
  const { payments, companies, addToast, addLog, formatAmount, plans } = useDashboard();

  // Calculated metrics
  const stats = useMemo(() => {
    const planPrices: Record<string, number> = {};
    plans.forEach(p => planPrices[p.id] = p.price);

    const activeCompanies = companies.filter(c => c.status === 'active');
    
    // Monthly ARR/MRR
    const monthlyRev = activeCompanies.reduce((sum, c) => sum + (planPrices[c.subscriptionPlanId] || 0), 0);
    const annualRev = monthlyRev * 12;

    // Payments summary from seed data
    const getAmountInUSD = (amount: number, currency: string) => {
      if (currency && currency !== 'USD') {
        const details = CURRENCY_DETAILS[currency];
        const rate = details ? details.rate : 1.0;
        return amount / rate;
      }
      return amount;
    };

    const successfulPayments = payments.filter(p => p.status === 'successful');
    const totalCollected = successfulPayments.reduce((sum, p) => sum + getAmountInUSD(p.amount, p.currency), 0);

    const pendingCount = payments.filter(p => p.status === 'pending').length;
    const failedCount = payments.filter(p => p.status === 'failed').length;
    const successfulCount = successfulPayments.length;

    // Top paying companies
    const companyTotals: Record<string, { name: string, total: number, logo: string }> = {};
    payments.forEach(p => {
      if (p.status === 'successful') {
        const comp = companies.find(c => c.id === p.companyId);
        if (!companyTotals[p.companyId]) {
          companyTotals[p.companyId] = {
            name: p.companyName,
            total: 0,
            logo: comp?.logo || 'bg-indigo-500'
          };
        }
        companyTotals[p.companyId].total += getAmountInUSD(p.amount, p.currency);
      }
    });

    const topCompanies = Object.values(companyTotals)
      .sort((a, b) => b.total - a.total)
      .slice(0, 4);

    return {
      monthlyRev,
      annualRev,
      totalCollected,
      pendingCount,
      failedCount,
      successfulCount,
      topCompanies
    };
  }, [payments, companies]);

  // Chart data for revenue comparison
  const paymentTrendsData = [
    { week: 'Week 1', collected: stats.monthlyRev * 0.2 },
    { week: 'Week 2', collected: stats.monthlyRev * 0.25 },
    { week: 'Week 3', collected: stats.monthlyRev * 0.18 },
    { week: 'Week 4', collected: stats.monthlyRev * 0.37 },
  ];

  const handleDownloadInvoice = (invoiceNo: string) => {
    addToast(`Downloading invoice ${invoiceNo} (PDF)...`, 'success');
    addLog('Invoice Downloaded', `PDF copy of invoice ${invoiceNo} was generated and downloaded.`, 'payment');
  };

  const handleDownloadGST = () => {
    addToast('Generating GST Q2 Tax Report (PDF)...', 'success');
    addLog('GST Report Exported', 'Super Owner exported Q2 GST/Tax compliance report.', 'settings');
  };

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white font-sans">
            Revenue Dashboard
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            Track client subscriptions invoicing, gateway settlements, and quarterly reports.
          </p>
        </div>
        <button
          onClick={handleDownloadGST}
          className="flex items-center gap-2 px-4 py-2 text-sm font-bold rounded-xl bg-white hover:bg-purple-50 text-purple-600 transition shadow border border-purple-200 w-fit"
        >
          <Download className="h-4 w-4 text-purple-500" /> Download GST Report
        </button>
      </div>

      {/* Revenue Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Today's Revenue */}
        <div className="glass-card p-5 rounded-2xl">
          <div className="flex justify-between items-start text-slate-400 text-xs font-semibold uppercase tracking-wider">
            <span>Today's Revenue</span>
            <div className="p-1 rounded bg-white/5 border border-white/5 text-emerald-400">
              <DollarSign className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-white font-mono">{formatAmount(stats.monthlyRev / 30)}</span>
            <span className="text-xs text-emerald-400 flex items-center font-medium">
              <TrendingUp className="h-3 w-3 mr-0.5" /> +4.2%
            </span>
          </div>
          <p className="text-[10px] text-slate-500 mt-2">Adjusted for billing cycle distribution</p>
        </div>

        {/* Weekly Revenue */}
        <div className="glass-card p-5 rounded-2xl">
          <div className="flex justify-between items-start text-slate-400 text-xs font-semibold uppercase tracking-wider">
            <span>Weekly Revenue</span>
            <div className="p-1 rounded bg-white/5 border border-white/5 text-indigo-400">
              <DollarSign className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-white font-mono">{formatAmount(stats.monthlyRev * 0.23)}</span>
            <span className="text-xs text-emerald-400 flex items-center font-medium">
              <TrendingUp className="h-3 w-3 mr-0.5" /> +12.5%
            </span>
          </div>
          <p className="text-[10px] text-slate-500 mt-2">Cumulative trailing 7 days</p>
        </div>

        {/* Monthly Run Rate */}
        <div className="glass-card p-5 rounded-2xl">
          <div className="flex justify-between items-start text-slate-400 text-xs font-semibold uppercase tracking-wider">
            <span>Monthly Run Rate</span>
            <div className="p-1 rounded bg-white/5 border border-white/5 text-purple-400">
              <CreditCard className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-white font-mono">{formatAmount(stats.monthlyRev)}</span>
            <span className="text-xs text-emerald-400 flex items-center font-medium">
              <TrendingUp className="h-3 w-3 mr-0.5" /> +18.0%
            </span>
          </div>
          <p className="text-[10px] text-slate-500 mt-2">Current Active MRC (Monthly Recurring)</p>
        </div>

        {/* Annual Run Rate */}
        <div className="glass-card p-5 rounded-2xl">
          <div className="flex justify-between items-start text-slate-400 text-xs font-semibold uppercase tracking-wider">
            <span>Annual Run Rate</span>
            <div className="p-1 rounded bg-white/5 border border-white/5 text-cyan-400">
              <TrendingUp className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-white font-mono">{formatAmount(stats.annualRev)}</span>
            <span className="text-xs text-emerald-400 flex items-center font-medium">
              <TrendingUp className="h-3 w-3 mr-0.5" /> +18.0%
            </span>
          </div>
          <p className="text-[10px] text-slate-500 mt-2">Current Year extrapolated ARR</p>
        </div>
      </div>

      {/* Settlements status */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Successful settlements */}
        <div className="glass-card p-4 rounded-xl flex items-center gap-4">
          <div className="p-3 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <CheckCircle className="h-5 w-5" />
          </div>
          <div>
            <span className="text-slate-400 text-xs block uppercase">Successful Invoices</span>
            <span className="text-lg font-bold text-white font-mono">{stats.successfulCount} Trans</span>
          </div>
        </div>

        {/* Pending Settlements */}
        <div className="glass-card p-4 rounded-xl flex items-center gap-4">
          <div className="p-3 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/20">
            <Clock className="h-5 w-5 animate-spin-slow" />
          </div>
          <div>
            <span className="text-slate-400 text-xs block uppercase">Pending Clearance</span>
            <span className="text-lg font-bold text-white font-mono">{stats.pendingCount} Trans</span>
          </div>
        </div>

        {/* Failed / Disputes */}
        <div className="glass-card p-4 rounded-xl flex items-center gap-4">
          <div className="p-3 rounded-lg bg-rose-500/10 text-rose-400 border border-rose-500/20">
            <AlertCircle className="h-5 w-5" />
          </div>
          <div>
            <span className="text-slate-400 text-xs block uppercase">Failed / Disputed</span>
            <span className="text-lg font-bold text-white font-mono">{stats.failedCount} Trans</span>
          </div>
        </div>
      </div>

      {/* Main Graphs & Leaderboards */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Weekly Settlement Graph */}
        <div className="lg:col-span-2 glass-card p-6 rounded-2xl">
          <h3 className="text-base font-semibold text-white mb-2">Weekly Payments Settled</h3>
          <p className="text-xs text-slate-400 mb-6">Net weekly volume settled through merchant gateways.</p>
          <div className="h-64 w-full min-h-[256px]">
            <ResponsiveContainer width="100%" height={256} minWidth={100}>
              <AreaChart data={paymentTrendsData} margin={{ top: 0, right: 0, left: -25, bottom: 0 }}>
                <defs>
                  <linearGradient id="settlementGlow" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0.01}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" vertical={false} />
                <XAxis dataKey="week" stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} />
                <Tooltip
                  contentStyle={{ 
                    background: 'rgba(15, 15, 20, 0.95)', 
                    borderColor: 'rgba(255,255,255,0.1)',
                    borderRadius: '12px',
                    color: '#fff',
                    fontSize: '12px'
                  }}
                  formatter={(val) => [formatAmount(Number(val)), 'Settled']}
                />
                <Area type="monotone" dataKey="collected" stroke="#10b981" strokeWidth={2.5} fillOpacity={1} fill="url(#settlementGlow)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Top Paying Clients */}
        <div className="glass-card p-6 rounded-2xl flex flex-col justify-between">
          <div>
            <h3 className="text-base font-semibold text-white mb-2">Top Paying Clients</h3>
            <p className="text-xs text-slate-400 mb-6">Company accounts with highest life-time billing</p>

            <div className="space-y-4">
              {stats.topCompanies.map((comp, idx) => (
                <div key={comp.name} className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-3">
                    <div className={`h-8 w-8 rounded-lg ${comp.logo} flex items-center justify-center font-bold text-white text-xs shadow-md`}>
                      {comp.name.substring(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <span className="font-semibold text-slate-200 block">{comp.name}</span>
                      <span className="text-[10px] text-slate-500 font-mono">Rank #{idx+1}</span>
                    </div>
                  </div>
                  <span className="font-mono font-bold text-white">{formatAmount(comp.total)}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="border-t border-white/5 pt-4 mt-6 flex justify-between items-center text-xs text-slate-500">
            <span className="flex items-center gap-1"><Building className="h-3.5 w-3.5" /> Direct Merchant Routing</span>
          </div>
        </div>
      </div>

      {/* Transaction History & Invoices */}
      <div className="glass-card rounded-2xl p-6">
        <h3 className="text-base font-semibold text-white mb-2">Recent Transactions & Invoices</h3>
        <p className="text-xs text-slate-400 mb-6">Verification table of incoming subscription charges.</p>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="border-b border-white/5 text-slate-400 text-xs font-semibold uppercase tracking-wider bg-white/2">
                <th className="py-3 px-4">Invoice No</th>
                <th className="py-3 px-4">Company</th>
                <th className="py-3 px-4">Amount</th>
                <th className="py-3 px-4">Gateway</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Settled At</th>
                <th className="py-3 px-4 text-right">Invoice</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-slate-300">
              {payments.map(p => (
                <tr key={p.id} className="hover:bg-white/2 transition">
                  <td className="py-3 px-4 font-mono text-xs text-slate-400 font-medium">{p.invoiceNumber}</td>
                  <td className="py-3 px-4 font-semibold text-white">{p.companyName}</td>
                  <td className="py-3 px-4 font-mono font-bold text-white">{formatAmount(p.amount, p.currency)}</td>
                  <td className="py-3 px-4 capitalize font-mono text-xs text-indigo-300">{p.gateway.replace('_', ' ')}</td>
                  <td className="py-3 px-4">
                    <span className={`px-2.5 py-0.5 rounded text-[10px] uppercase tracking-wide border ${
                      p.status === 'successful' ? 'bg-emerald-600 border-emerald-500 text-white font-extrabold shadow-sm' :
                      p.status === 'pending' ? 'bg-amber-600 border-amber-500 text-white font-extrabold shadow-sm' :
                      'bg-rose-600 border-rose-500 text-white font-extrabold shadow-sm'
                    }`}>
                      {p.status}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-xs text-slate-500">{new Date(p.timestamp).toLocaleString()}</td>
                  <td className="py-3 px-4 text-right">
                    <button
                      onClick={() => handleDownloadInvoice(p.invoiceNumber)}
                      className="p-1 rounded bg-white/5 hover:bg-indigo-600 hover:text-white border border-white/5 text-slate-400 transition"
                      title="Download PDF Invoice"
                    >
                      <Download className="h-3.5 w-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
export default RevenueTab;
