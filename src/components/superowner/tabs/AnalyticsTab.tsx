import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { 
  BarChart as RechartsBarChart, Bar, XAxis, YAxis, CartesianGrid, 
  Tooltip, ResponsiveContainer, PieChart, Pie, Cell, AreaChart, Area
} from 'recharts';
import { 
  TrendingUp, Users, Calendar, Activity, Clock, ShieldCheck, 
  Sparkles, CheckCircle2, ChevronRight 
} from 'lucide-react';
import { useDashboard } from '../context/DashboardContext';

export const AnalyticsTab: React.FC = () => {
  const { companies, analyticsData } = useDashboard();

  // Compute Employee Distribution data
  const distData = useMemo(() => {
    return companies.map((c, idx) => {
      const colors = ['#6366f1', '#8b5cf6', '#06b6d4', '#10b981', '#f59e0b', '#f43f5e', '#ec4899'];
      return {
        name: c.name,
        value: c.employeesCount,
        color: colors[idx % colors.length]
      };
    });
  }, [companies]);

  // Attendance Analytics
  const attendanceData = analyticsData?.attendanceData || [
    { month: 'Jan', rate: 94.2 },
    { month: 'Feb', rate: 95.0 },
    { month: 'Mar', rate: 94.8 },
    { month: 'Apr', rate: 96.1 },
    { month: 'May', rate: 96.5 },
    { month: 'Jun', rate: 97.2 },
  ];

  // Leave Analytics
  const leaveData = analyticsData?.leaveData || [
    { type: 'Sick Leave', count: 142, fill: '#f43f5e' },
    { type: 'Casual Leave', count: 289, fill: '#6366f1' },
    { type: 'Maternity/Paternity', count: 48, fill: '#8b5cf6' },
    { type: 'Unpaid Leave', count: 64, fill: '#f59e0b' },
  ];

  // Subscription Analytics
  const subTrends = analyticsData?.subTrends || [
    { month: 'Jan', Starter: 2, Pro: 1, Business: 1, Enterprise: 0 },
    { month: 'Feb', Starter: 2, Pro: 1, Business: 1, Enterprise: 1 },
    { month: 'Mar', Starter: 2, Pro: 2, Business: 1, Enterprise: 1 },
    { month: 'Apr', Starter: 3, Pro: 2, Business: 1, Enterprise: 1 },
    { month: 'May', Starter: 3, Pro: 2, Business: 2, Enterprise: 1 },
    { month: 'Jun', Starter: 2, Pro: 3, Business: 2, Enterprise: 2 },
  ];

  const avgAttendance = attendanceData.length > 0 
    ? (attendanceData.reduce((acc: number, item: any) => acc + item.rate, 0) / attendanceData.length).toFixed(1)
    : '96.8';

  // Login Heatmap Grid (7 days x 24 hours)
  // Generating seed rates: 0 to 4
  const heatmapData = useMemo(() => {
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    return days.map(day => {
      const hours = Array.from({ length: 24 }, (_, h) => {
        // Higher activity during business hours (9 to 18)
        let weight = 0;
        if (h >= 9 && h <= 17) {
          weight = day === 'Sun' || day === 'Sat' ? 1 : Math.floor(Math.random() * 3) + 2; // 2-4
        } else if ((h >= 7 && h < 9) || (h > 17 && h <= 21)) {
          weight = Math.floor(Math.random() * 2) + 1; // 1-2
        } else {
          weight = Math.floor(Math.random() * 1.5); // 0-1
        }
        return { hour: h, val: weight };
      });
      return { day, hours };
    });
  }, []);

  const getHeatmapColor = (val: number) => {
    switch (val) {
      case 0: return 'bg-white/2 border border-white/5';
      case 1: return 'bg-indigo-950 border border-indigo-900/40 text-indigo-400';
      case 2: return 'bg-indigo-800/60 border border-indigo-700/50';
      case 3: return 'bg-indigo-600 border border-indigo-500/50 shadow-[0_0_8px_rgba(99,102,241,0.2)]';
      case 4: return 'bg-indigo-400 border border-indigo-300/50 shadow-[0_0_12px_rgba(129,140,248,0.4)]';
      default: return 'bg-white/5';
    }
  };

  return (
    <div className="space-y-6">
      {/* Title */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-white font-sans">
          Platform Analytics
        </h1>
        <p className="text-slate-400 text-sm mt-1">
          Deep telemetry audits, system-wide modular load statistics, and concurrent session tracking.
        </p>
      </div>

      {/* Analytics Summary stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="glass-card p-4 rounded-xl flex items-center gap-4">
          <div className="p-3 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <CheckCircle2 className="h-5 w-5" />
          </div>
          <div>
            <span className="text-slate-400 text-xs block uppercase">Avg Attendance Rate</span>
            <span className="text-lg font-bold text-white font-mono">{avgAttendance}%</span>
          </div>
        </div>

        <div className="glass-card p-4 rounded-xl flex items-center gap-4">
          <div className="p-3 rounded-lg bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
            <Activity className="h-5 w-5" />
          </div>
          <div>
            <span className="text-slate-400 text-xs block uppercase">Daily Active Sessions</span>
            <span className="text-lg font-bold text-white font-mono">4,812 / day</span>
          </div>
        </div>

        <div className="glass-card p-4 rounded-xl flex items-center gap-4">
          <div className="p-3 rounded-lg bg-purple-500/10 text-purple-400 border border-purple-500/20">
            <Clock className="h-5 w-5" />
          </div>
          <div>
            <span className="text-slate-400 text-xs block uppercase">Server API Load</span>
            <span className="text-lg font-bold text-white font-mono">145 ms latency</span>
          </div>
        </div>

        <div className="glass-card p-4 rounded-xl flex items-center gap-4">
          <div className="p-3 rounded-lg bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
            <Sparkles className="h-5 w-5 animate-pulse-slow" />
          </div>
          <div>
            <span className="text-slate-400 text-xs block uppercase">AI Inference Queries</span>
            <span className="text-lg font-bold text-white font-mono">18.4K queries</span>
          </div>
        </div>
      </div>

      {/* Row 1: Attendance & Leave Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Attendance Trends */}
        <div className="glass-card p-6 rounded-2xl">
          <h3 className="text-base font-semibold text-white mb-2">Average Attendance Rate</h3>
          <p className="text-xs text-slate-400 mb-6">System-wide employee clock-in percentages by month</p>
          
          <div className="h-64 w-full min-h-[256px]">
            <ResponsiveContainer width="100%" height={256} minWidth={100}>
              <AreaChart data={attendanceData} margin={{ top: 0, right: 0, left: -25, bottom: 0 }}>
                <defs>
                  <linearGradient id="attendanceGlow" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#06b6d4" stopOpacity={0.01}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" vertical={false} />
                <XAxis dataKey="month" stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} domain={[90, 100]} />
                <Tooltip
                  contentStyle={{ 
                    background: 'rgba(15, 15, 20, 0.95)', 
                    borderColor: 'rgba(255,255,255,0.1)',
                    borderRadius: '12px',
                    color: '#fff',
                    fontSize: '12px'
                  }}
                  formatter={(val) => [`${val}%`, 'Attendance Rate']}
                />
                <Area type="monotone" dataKey="rate" stroke="#06b6d4" strokeWidth={2.5} fillOpacity={1} fill="url(#attendanceGlow)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Leave Requests breakdown */}
        <div className="glass-card p-6 rounded-2xl">
          <h3 className="text-base font-semibold text-white mb-2">Leave Categories Audit</h3>
          <p className="text-xs text-slate-400 mb-6">Distribution breakdown of client company holiday approvals</p>

          <div className="h-64 w-full min-h-[256px]">
            <ResponsiveContainer width="100%" height={256} minWidth={100}>
              <RechartsBarChart data={leaveData} layout="vertical" margin={{ top: 0, right: 10, left: 15, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" horizontal={false} />
                <XAxis type="number" stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis type="category" dataKey="type" stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} />
                <Tooltip
                  contentStyle={{ 
                    background: 'rgba(15, 15, 20, 0.95)', 
                    borderColor: 'rgba(255,255,255,0.1)',
                    borderRadius: '12px',
                    color: '#fff',
                    fontSize: '12px'
                  }}
                />
                <Bar dataKey="count" radius={[0, 4, 4, 0]}>
                  {leaveData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Bar>
              </RechartsBarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Heatmap Section */}
      <div className="glass-card p-6 rounded-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 h-40 w-40 bg-gradient-to-bl from-indigo-500/10 to-transparent blur-3xl pointer-events-none"></div>
        <h3 className="text-base font-semibold text-white mb-2">Hourly Login Heatmap</h3>
        <p className="text-xs text-slate-400 mb-6">Concurrent system logins audit by day and hour of week.</p>

        {/* Heatmap Grid container */}
        <div className="space-y-2 select-none overflow-x-auto pb-2">
          {heatmapData.map((row) => (
            <div key={row.day} className="flex items-center gap-2 min-w-[700px]">
              {/* Day label */}
              <span className="w-10 text-xs font-semibold text-slate-400 uppercase tracking-wider shrink-0">{row.day}</span>
              {/* Hours Grid */}
              <div className="flex-1 grid grid-cols-24 gap-1.5">
                {row.hours.map((hr, idx) => (
                  <div
                    key={idx}
                    className={`heatmap-cell h-4 w-4 rounded-sm transition ${getHeatmapColor(hr.val)}`}
                    title={`${row.day} at ${hr.hour.toString().padStart(2, '0')}:00 - Activity Load Level ${hr.val}`}
                  />
                ))}
              </div>
            </div>
          ))}
          
          {/* Timeline labels */}
          <div className="flex items-center gap-2 border-t border-white/5 pt-3 mt-4 min-w-[700px]">
            <span className="w-10 text-[10px] shrink-0"></span>
            <div className="flex-1 flex justify-between text-[10px] text-slate-500 font-mono">
              <span>12 AM</span>
              <span>4 AM</span>
              <span>8 AM</span>
              <span>12 PM</span>
              <span>4 PM</span>
              <span>8 PM</span>
              <span>11 PM</span>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Grid: Subscription Tiers & Employee Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Subscription growth trends */}
        <div className="lg:col-span-2 glass-card p-6 rounded-2xl">
          <h3 className="text-base font-semibold text-white mb-2">Billing Plan Tier Distribution</h3>
          <p className="text-xs text-slate-400 mb-6">6-month growth history of client subscriptions by bundle packages</p>

          <div className="h-64 w-full min-h-[256px]">
            <ResponsiveContainer width="100%" height={256} minWidth={100}>
              <AreaChart data={subTrends} margin={{ top: 0, right: 0, left: -25, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" vertical={false} />
                <XAxis dataKey="month" stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} />
                <Tooltip
                  contentStyle={{ 
                    background: 'rgba(15, 15, 20, 0.95)', 
                    borderColor: 'rgba(255,255,255,0.1)',
                    borderRadius: '12px',
                    color: '#fff',
                    fontSize: '12px'
                  }}
                />
                <Area type="monotone" dataKey="Starter" stackId="1" stroke="#f59e0b" fill="#f59e0b" fillOpacity={0.2} />
                <Area type="monotone" dataKey="Pro" stackId="1" stroke="#06b6d4" fill="#06b6d4" fillOpacity={0.2} />
                <Area type="monotone" dataKey="Business" stackId="1" stroke="#8b5cf6" fill="#8b5cf6" fillOpacity={0.2} />
                <Area type="monotone" dataKey="Enterprise" stackId="1" stroke="#6366f1" fill="#6366f1" fillOpacity={0.2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Employee distribution pie chart */}
        <div className="glass-card p-6 rounded-2xl flex flex-col justify-between">
          <div>
            <h3 className="text-base font-semibold text-white mb-2">Employee Distribution</h3>
            <p className="text-xs text-slate-400 mb-6">Breakdown of employees count per tenant organization</p>
            
            <div className="h-44 w-full min-h-[180px]">
              <ResponsiveContainer width="100%" height={180} minWidth={100}>
                <PieChart>
                  <Pie
                    data={distData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={70}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {distData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ 
                      background: 'rgba(15, 15, 20, 0.95)', 
                      borderColor: 'rgba(255,255,255,0.1)',
                      borderRadius: '12px',
                      color: '#fff',
                      fontSize: '12px'
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="space-y-1.5 border-t border-white/5 pt-4 mt-2">
            {distData.map((item) => (
              <div key={item.name} className="flex justify-between items-center text-xs">
                <span className="flex items-center gap-1.5 text-slate-300">
                  <span className="h-2 w-2 rounded-full shrink-0" style={{ backgroundColor: item.color }}></span>
                  {item.name}
                </span>
                <span className="font-semibold text-white font-mono">{item.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
export default AnalyticsTab;
