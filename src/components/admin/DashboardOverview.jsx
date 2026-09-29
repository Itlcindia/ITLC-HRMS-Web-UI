import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { api } from '../../services/api';
import { 
  Users, UserCheck, UserX, CalendarDays, Building2, MapPin, 
  Briefcase, Wallet, ArrowUpRight, ArrowDownRight, Gift, UserPlus, 
  CheckCircle2, FileText, Plus, Landmark, PlusCircle, BarChart3, 
  BellRing, HardDrive, Cpu, CalendarDays as CalendarIcon, ChevronRight
} from 'lucide-react';
import { 
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, 
  CartesianGrid, ReferenceLine, BarChart, Bar, Cell
} from 'recharts';

// --- Helper: Animated Number Counter ---
function CountUp({ value, duration = 1000, currencySymbol = '$' }) {
  const [count, setCount] = useState(0);
  
  useEffect(() => {
    let start = 0;
    const end = parseFloat(value.toString().replace(/[^0-9.]/g, ''));
    if (isNaN(end)) {
      setCount(value);
      return;
    }
    if (start === end) return;
    
    let totalMiliseconds = duration;
    let incrementTime = Math.abs(Math.floor(totalMiliseconds / end));
    incrementTime = Math.max(incrementTime, 12); // safe minimum delay
    
    let startTime = Date.now();
    let timer = setInterval(() => {
      let timePassed = Date.now() - startTime;
      let progress = Math.min(timePassed / totalMiliseconds, 1);
      let current = Math.floor(progress * end);
      setCount(current);
      if (progress === 1) {
        clearInterval(timer);
      }
    }, incrementTime);
    
    return () => clearInterval(timer);
  }, [value, duration]);

  const isPercent = value.toString().includes('%');
  const isCurrency = value.toString().includes('$') || value.toString().includes('₹') || value.toString().includes('€') || value.toString().includes('£') || value.toString().includes('¥');
  const formatted = count.toLocaleString();
  
  return (
    <span className="number-font">
      {isCurrency && currencySymbol}{formatted}{isPercent && '%'}
    </span>
  );
}

// --- Mock Data ---
const sparklineData = {
  employees: [{ v: 1200 }, { v: 1210 }, { v: 1205 }, { v: 1230 }, { v: 1222 }, { v: 1248 }],
  present: [{ v: 1100 }, { v: 1130 }, { v: 1120 }, { v: 1150 }, { v: 1142 }, { v: 1180 }],
  absent: [{ v: 55 }, { v: 50 }, { v: 52 }, { v: 48 }, { v: 46 }, { v: 42 }],
  leave: [{ v: 22 }, { v: 24 }, { v: 25 }, { v: 23 }, { v: 28 }, { v: 26 }],
  depts: [{ v: 6 }, { v: 7 }, { v: 7 }, { v: 7 }, { v: 8 }, { v: 8 }],
  branches: [{ v: 4 }, { v: 4 }, { v: 4 }, { v: 4 }, { v: 4 }, { v: 4 }],
  positions: [{ v: 12 }, { v: 14 }, { v: 16 }, { v: 15 }, { v: 19 }, { v: 18 }],
  payroll: [{ v: 210 }, { v: 220 }, { v: 215 }, { v: 230 }, { v: 235 }, { v: 240 }],
};

const attendanceData = [
  { day: 'Mon', attendance: 92 },
  { day: 'Tue', attendance: 95 },
  { day: 'Wed', attendance: 94 },
  { day: 'Thu', attendance: 96 },
  { day: 'Fri', attendance: 91 },
  { day: 'Sat', attendance: 88 },
  { day: 'Sun', attendance: 85 },
];

const payrollTrendData = [
  { month: 'Jan', Gross: 210, Bonus: 15, Deductions: 10, Net: 215 },
  { month: 'Feb', Gross: 220, Bonus: 18, Deductions: 12, Net: 226 },
  { month: 'Mar', Gross: 225, Bonus: 22, Deductions: 11, Net: 236 },
  { month: 'Apr', Gross: 230, Bonus: 20, Deductions: 15, Net: 235 },
  { month: 'May', Gross: 235, Bonus: 25, Deductions: 14, Net: 246 },
  { month: 'Jun', Gross: 240, Bonus: 30, Deductions: 16, Net: 254 },
  { month: 'Jul', Gross: 245, Bonus: 28, Deductions: 15, Net: 258 },
  { month: 'Aug', Gross: 250, Bonus: 32, Deductions: 18, Net: 264 },
  { month: 'Sep', Gross: 255, Bonus: 35, Deductions: 19, Net: 271 },
  { month: 'Oct', Gross: 260, Bonus: 30, Deductions: 17, Net: 273 },
  { month: 'Nov', Gross: 270, Bonus: 40, Deductions: 20, Net: 290 },
  { month: 'Dec', Gross: 300, Bonus: 50, Deductions: 25, Net: 325 },
];

const recentActivities = [
  { type: 'joined', title: 'Clara Oswald joined Engineering', time: '10 mins ago', desc: 'Onboarded as Senior Frontend Engineer.', color: '#10B981' },
  { type: 'leave', title: 'Sarah Jenkins leave approved', time: '2 hours ago', desc: 'Casual leave approved for July 10-15.', color: '#2563EB' },
  { type: 'payroll', title: 'Payroll cycle generated', time: '1 day ago', desc: 'Disbursals for June 2026 are finalized.', color: '#8B5CF6' },
  { type: 'dept', title: 'Legal Operations department established', time: '2 days ago', desc: 'New operational structure configured.', color: '#F59E0B' },
  { type: 'job', title: 'Senior Product Designer vacancy published', time: '3 days ago', desc: 'Active hiring post listed on LinkedIn.', color: '#EC4899' },
];

export default function DashboardOverview({ employeesList = [], notifications = [], setActiveTab, currency = 'USD' }) {
  const [loading, setLoading] = useState(true);
  const [company, setCompany] = useState(null);
  const [activities, setActivities] = useState([]);
  const [attendanceTrends, setAttendanceTrends] = useState([]);
  const [payrollTrends, setPayrollTrends] = useState([]);
  const [presentToday, setPresentToday] = useState(0);
  const [branchesCount, setBranchesCount] = useState(1);
  const [jobsCount, setJobsCount] = useState(0);

  const currencySymbol = (() => {
    switch (currency) {
      case 'INR': return '₹';
      case 'EUR': return '€';
      case 'GBP': return '£';
      case 'JPY': return '¥';
      default: return '$';
    }
  })();

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [companyData, actData, attTrends, payTrends, attendanceLogs, branchesData, jobsData] = await Promise.all([
          api.getAdminCompany(),
          api.getAdminAuditLogs().catch(() => []),
          api.getAttendanceTrends().catch(() => []),
          api.getPayrollTrends().catch(() => []),
          api.getAdminAttendanceLogs().catch(() => []),
          api.getAdminBranches().catch(() => []),
          api.getAdminJobs().catch(() => [])
        ]);

        if (companyData) setCompany(companyData);
        
        if (actData && actData.length > 0) {
          setActivities(actData.slice(0, 5).map((a) => {
            let color = '#4F46E5';
            if (a.category === 'HR') color = '#10B981';
            if (a.category === 'Payroll') color = '#EC4899';
            if (a.category === 'Billing') color = '#8B5CF6';
            return {
              type: a.category?.toLowerCase() || 'joined',
              title: a.action,
              time: new Date(a.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
              desc: a.details,
              color
            };
          }));
        } else {
          setActivities([]);
        }

        if (attTrends && attTrends.length > 0) {
          setAttendanceTrends(attTrends);
        } else {
          setAttendanceTrends([]);
        }
        if (payTrends && payTrends.length > 0) {
          setPayrollTrends(payTrends);
        } else {
          setPayrollTrends([]);
        }

        // Calculate dynamic counts
        const todayStr = new Date().toISOString().split('T')[0];
        const presentCount = new Set((attendanceLogs || []).filter(log => log.date === todayStr).map(log => log.employeeId)).size;
        setPresentToday(presentCount);

        setBranchesCount(branchesData && branchesData.length > 0 ? branchesData.length : 1);

        const openJobsCount = (jobsData || []).filter(j => j.status === 'Active' || j.status === 'open' || j.status === 'Open').length;
        setJobsCount(openJobsCount);
      } catch (err) {
        console.error("Failed to load company details on dashboard:", err);
        setActivities([]);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboardData();
  }, []);

  const handleActionClick = (tabName) => {
    setActiveTab(tabName);
  };

  // --- Render Skeletons ---
  if (loading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {Array(8).fill(0).map((_, i) => (
            <div key={i} className="premium-card skeleton-loading" style={{ height: 160, padding: 24 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
                <div style={{ width: '40%', height: 12, background: 'rgba(255,255,255,0.08)', borderRadius: 4 }} />
                <div style={{ width: 32, height: 32, borderRadius: 8, background: 'rgba(255,255,255,0.08)' }} />
              </div>
              <div style={{ width: '70%', height: 28, background: 'rgba(255,255,255,0.08)', borderRadius: 4, marginBottom: 12 }} />
              <div style={{ width: '50%', height: 10, background: 'rgba(255,255,255,0.08)', borderRadius: 4 }} />
            </div>
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="premium-card skeleton-loading" style={{ height: 350 }} />
          <div className="premium-card skeleton-loading" style={{ height: 350 }} />
        </div>
      </div>
    );
  }

  // Calculate stats dynamically
  const totalEmployees = employeesList.length;
  const activeEmployees = employeesList.filter(e => e.status?.toLowerCase() === 'active').length;
  const onLeaveEmployees = employeesList.filter(e => e.status?.toLowerCase() === 'on leave').length;
  const suspendedEmployees = employeesList.filter(e => e.status?.toLowerCase() === 'suspended').length;
  const uniqueDepts = Array.from(new Set(employeesList.map(e => e.department).filter(Boolean))).length;

  const totalSalary = employeesList.reduce((acc, emp) => {
    if (!emp.salary) return acc;
    const cleanSalary = parseFloat(emp.salary.toString().replace(/[^0-9.]/g, ''));
    return acc + (isNaN(cleanSalary) ? 0 : cleanSalary);
  }, 0);
  const monthlyPayroll = totalSalary ? Math.round(totalSalary / 12) : 0;

  // --- Real Content Grid Setup ---
  const kpiStatsData = [
    { label: 'Total Employees', value: totalEmployees, desc: 'Active records', change: `+${totalEmployees}`, positive: true, sparkline: sparklineData.employees, color: '#4F46E5', icon: Users },
    { label: 'Present Today', value: presentToday, desc: 'Checked in today', change: `+${presentToday}`, positive: true, sparkline: sparklineData.present, color: '#10B981', icon: UserCheck },
    { label: 'Absent Today', value: Math.max(0, totalEmployees - presentToday - onLeaveEmployees), desc: 'Not check-in logged', change: `-${Math.max(0, totalEmployees - presentToday - onLeaveEmployees)}`, positive: true, sparkline: sparklineData.absent, color: '#EF4444', icon: UserX },
    { label: 'On Leave Today', value: onLeaveEmployees, desc: 'Approved absence', change: `+${onLeaveEmployees}`, positive: true, sparkline: sparklineData.leave, color: '#06B6D4', icon: CalendarDays },
    { label: 'Departments', value: uniqueDepts, desc: 'Operational blocks', change: `${uniqueDepts} total`, positive: true, sparkline: sparklineData.depts, color: '#8B5CF6', icon: Building2 },
    { label: 'Branches', value: branchesCount, desc: 'Global sites', change: 'Active', positive: true, sparkline: sparklineData.branches, color: '#2563EB', icon: MapPin },
    { label: 'Open Positions', value: jobsCount, desc: 'Recruiting postings', change: 'Active', positive: true, sparkline: sparklineData.positions, color: '#F59E0B', icon: Briefcase },
    { label: 'Monthly Payroll', value: `${currencySymbol}${monthlyPayroll.toLocaleString()}`, desc: 'Compensation disbursals', change: 'Active', positive: true, sparkline: sparklineData.payroll, color: '#EC4899', icon: Wallet },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      
      {/* Subscription Limit Warning Alert Banner */}
      {company && totalEmployees >= company.maxEmployees && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          style={{
            background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.1) 0%, rgba(245, 158, 11, 0.1) 100%)',
            border: '1px solid rgba(239, 68, 68, 0.25)',
            borderRadius: '16px',
            padding: '16px 20px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            boxShadow: '0 4px 20px -2px rgba(0,0,0,0.05)',
            gap: 16,
            flexWrap: 'wrap'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <span style={{ fontSize: '1.5rem' }}>⚠️</span>
            <div>
              <h4 style={{ fontSize: '0.95rem', fontWeight: 800, color: '#ef4444', margin: 0 }}>
                Subscription Plan Employee Limit Reached ({totalEmployees} / {company.maxEmployees})
              </h4>
              <p style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)', margin: '4px 0 0 0' }}>
                Your workspace employee database is full. Please upgrade to a higher tier plan to register additional employees.
              </p>
            </div>
          </div>
          <button
            onClick={() => setActiveTab && setActiveTab('subscription')}
            className="premium-button"
            style={{
              padding: '8px 16px',
              fontSize: '0.8rem',
              fontWeight: 700,
              background: '#ef4444',
              color: '#fff',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              boxShadow: '0 4px 12px rgba(239, 68, 68, 0.2)'
            }}
          >
            Upgrade Subscription Plan
          </button>
        </motion.div>
      )}

      {/* 1. KPI Statistics Grid */}
      <motion.div 
        initial="hidden"
        animate="show"
        variants={{
          hidden: { opacity: 0 },
          show: {
            opacity: 1,
            transition: { staggerChildren: 0.05 }
          }
        }}
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5"
      >
        {kpiStatsData.map((kpi, idx) => {
          const Icon = kpi.icon;
          return (
            <motion.div
              key={idx}
              variants={{
                hidden: { opacity: 0, y: 20 },
                show: { opacity: 1, y: 0 }
              }}
              className="premium-card"
              style={{
                padding: '24px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                height: 175,
                position: 'relative',
                borderTop: `4px solid ${kpi.color}`,
                borderRadius: '20px',
                background: 'var(--glass-bg)',
                backdropFilter: 'blur(20px)'
              }}
            >
              {/* Header inside card */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <span className="premium-label" style={{ fontSize: '0.75rem', fontWeight: 600 }}>{kpi.label}</span>
                  <p style={{ fontSize: '0.75rem', color: 'var(--color-text-tertiary)', marginTop: 2 }}>{kpi.desc}</p>
                </div>
                <div style={{
                  width: 38,
                  height: 38,
                  borderRadius: 10,
                  background: `${kpi.color}15`,
                  color: kpi.color,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <Icon size={18} />
                </div>
              </div>

              {/* Number and Sparkline row */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginTop: 14 }}>
                <div>
                  <h4 style={{ fontSize: '2rem', fontWeight: 700, letterSpacing: '-0.02em', color: 'var(--color-text-primary)' }}>
                    <CountUp value={kpi.value} currencySymbol={currencySymbol} />
                  </h4>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginTop: 4 }}>
                    <span className="badge badge-success" style={{ fontSize: '0.7rem', padding: '2px 6px', background: `${kpi.color}10`, color: kpi.color }}>
                      {kpi.change}
                    </span>
                    <span style={{ fontSize: '0.65rem', color: 'var(--color-text-tertiary)' }}>vs last month</span>
                  </div>
                </div>

                {/* Mini Sparkline Chart */}
                <div style={{ width: 70, height: 30 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={kpi.sparkline} margin={{ top: 2, left: 2, right: 2, bottom: 2 }}>
                      <defs>
                        <linearGradient id={`gradient-${idx}`} x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor={kpi.color} stopOpacity={0.2}/>
                          <stop offset="95%" stopColor={kpi.color} stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <Area type="monotone" dataKey="v" stroke={kpi.color} strokeWidth={1.5} fillOpacity={1} fill={`url(#gradient-${idx})`} dot={false} />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </motion.div>
          );
        })}
      </motion.div>

      {/* 2. Interactive Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Daily Attendance Rate (Line Chart) */}
        <motion.div 
          className="premium-card" 
          initial={{ opacity: 0, scale: 0.98 }} 
          animate={{ opacity: 1, scale: 1 }}
          style={{ padding: 24, height: 360, background: 'var(--glass-bg)', backdropFilter: 'blur(20px)' }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
            <div>
              <h3 style={{ fontSize: '1rem', fontWeight: 700, margin: 0 }}>Daily Attendance Rate</h3>
              <span style={{ fontSize: '0.75rem', color: 'var(--color-text-tertiary)' }}>Weekly average metric review</span>
            </div>
            <div style={{ display: 'flex', gap: 14, fontSize: '0.75rem', fontWeight: 600 }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                <span style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: 'var(--color-primary)' }} />
                <span>Attendance</span>
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                <span style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: 'var(--color-success)' }} />
                <span>Goal (95%)</span>
              </span>
            </div>
          </div>

          <div style={{ width: '100%', height: '75%' }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={attendanceTrends} margin={{ top: 10, right: 10, left: -24, bottom: 0 }}>
                <defs>
                  <linearGradient id="attendanceGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--color-primary)" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="var(--color-primary)" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--color-border)" />
                <XAxis dataKey="day" tick={{ fontSize: 12, fill: 'var(--color-text-tertiary)' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 12, fill: 'var(--color-text-tertiary)' }} axisLine={false} tickLine={false} domain={[0, 100]} />
                <Tooltip contentStyle={{ background: 'var(--glass-bg)', border: '1px solid var(--color-border)', borderRadius: 12, fontSize: 12 }} />
                
                {/* Goal Reference line */}
                <ReferenceLine y={95} stroke="var(--color-success)" strokeWidth={1.5} strokeDasharray="3 3" />
                
                <Area type="monotone" dataKey="attendance" stroke="var(--color-primary)" strokeWidth={2.5} fillOpacity={1} fill="url(#attendanceGrad)" dot={{ r: 4, strokeWidth: 1 }} activeDot={{ r: 6 }} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Monthly Payroll Trend (Bar Chart) */}
        <motion.div 
          className="premium-card" 
          initial={{ opacity: 0, scale: 0.98 }} 
          animate={{ opacity: 1, scale: 1 }}
          style={{ padding: 24, height: 360, background: 'var(--glass-bg)', backdropFilter: 'blur(20px)' }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
            <div>
              <h3 style={{ fontSize: '1rem', fontWeight: 700, margin: 0 }}>Monthly Payroll Trend</h3>
              <span style={{ fontSize: '0.75rem', color: 'var(--color-text-tertiary)' }}>Gross & net compensation structures</span>
            </div>
          </div>

          <div style={{ width: '100%', height: '75%' }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={payrollTrends} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--color-border)" />
                <XAxis dataKey="month" tick={{ fontSize: 12, fill: 'var(--color-text-tertiary)' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 12, fill: 'var(--color-text-tertiary)' }} axisLine={false} tickLine={false} />
                <Tooltip 
                  contentStyle={{ background: 'var(--glass-bg)', border: '1px solid var(--color-border)', borderRadius: 12, fontSize: 12 }}
                  formatter={(value, name) => [`${currencySymbol}${value}`, name]}
                />
                <Bar dataKey="Net" fill="var(--color-primary)" radius={[4, 4, 0, 0]} name="Net Payroll">
                  {payrollTrends.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill="var(--color-primary)"  
                      opacity={entry.month === 'Jun' ? 1 : 0.8}
                    />
                  ))}
                </Bar>
                <defs>
                  <linearGradient id="activePayrollGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#8B5CF6" />
                    <stop offset="100%" stopColor="#EC4899" />
                  </linearGradient>
                </defs>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      </div>

      {/* 3. Quick Admin Actions */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        <h3 style={{ fontSize: '0.95rem', fontWeight: 700, margin: 0 }}>Quick Admin Console Actions</h3>
        <div style={{
          display: 'flex',
          gap: 16,
          overflowX: 'auto',
          paddingBottom: 8,
          scrollbarWidth: 'none',
          WebkitOverflowScrolling: 'touch'
        }}>
          {[
            { label: 'Add Employee', action: 'employees', icon: UserPlus, gradient: 'linear-gradient(135deg, #4F46E5 0%, #3B82F6 100%)' },
            { label: 'Create Department', action: 'departments', icon: Landmark, gradient: 'linear-gradient(135deg, #8B5CF6 0%, #EC4899 100%)' },
            { label: 'Create Branch', action: 'settings', icon: MapPin, gradient: 'linear-gradient(135deg, #06B6D4 0%, #3B82F6 100%)' },
            { label: 'Post Job Opening', action: 'recruitment', icon: PlusCircle, gradient: 'linear-gradient(135deg, #F59E0B 0%, #EF4444 100%)' },
            { label: 'Run Payroll', action: 'payroll', icon: Wallet, gradient: 'linear-gradient(135deg, #10B981 0%, #059669 100%)' },
            { label: 'Generate Reports', action: 'reports', icon: BarChart3, gradient: 'linear-gradient(135deg, #4F46E5 0%, #8B5CF6 100%)' }
          ].map((act, i) => {
            const ActIcon = act.icon;
            return (
              <motion.button
                key={i}
                whileHover={{ scale: 1.03, y: -2 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => handleActionClick(act.action)}
                className="premium-btn"
                style={{
                  flexShrink: 0,
                  padding: '16px 24px',
                  background: 'var(--glass-bg)',
                  border: 'var(--glass-border)',
                  boxShadow: 'var(--glass-shadow)',
                  borderRadius: 16,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                  minWidth: 190,
                  cursor: 'pointer',
                  color: 'var(--color-text-primary)'
                }}
              >
                <div style={{
                  padding: 8,
                  borderRadius: 10,
                  background: act.gradient,
                  color: 'white',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <ActIcon size={16} />
                </div>
                <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>{act.label}</span>
              </motion.button>
            );
          })}
        </div>
      </div>

      {/* 4 & 5. Recent Activity & Combined Alerts widget row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Recent Activities Timeline */}
        <div className="premium-card" style={{ padding: 24, background: 'var(--glass-bg)', backdropFilter: 'blur(20px)' }}>
          <h3 style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: 20 }}>Workforce Activities Timeline</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20, position: 'relative' }}>
            {/* Center Timeline Connector Bar */}
            <div style={{
              position: 'absolute',
              left: 17,
              top: 8,
              bottom: 8,
              width: 2,
              background: 'var(--color-border)',
              zIndex: 1
            }} />

            {activities.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--color-text-tertiary)', fontSize: '0.85rem' }}>
                No recent activity logs recorded yet.
              </div>
            ) : (
              activities.map((act, i) => (
                <div key={i} style={{ display: 'flex', gap: 16, position: 'relative', zIndex: 2 }}>
                  <div style={{
                    width: 36,
                    height: 36,
                    borderRadius: '50%',
                    background: 'var(--color-bg)',
                    border: `3px solid ${act.color}`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0
                  }}>
                    <div style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: act.color }} />
                  </div>
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: 20 }}>
                      <h4 style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--color-text-primary)' }}>{act.title}</h4>
                      <span className="number-font" style={{ fontSize: '0.65rem', color: 'var(--color-text-tertiary)' }}>{act.time}</span>
                    </div>
                    <p style={{ fontSize: '0.75rem', color: 'var(--color-text-tertiary)', marginTop: 4 }}>{act.desc}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Notifications & Warning Alerts Widget */}
        <div className="premium-card" style={{ padding: 24, background: 'var(--glass-bg)', backdropFilter: 'blur(20px)', display: 'flex', flexDirection: 'column', justifyBetween: 'space-between', justifyContent: 'space-between', gap: 20 }}>
          <div>
            <h3 style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: 14 }}>Actionable Warnings & Tasks</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {notifications.length === 0 ? (
                <div style={{ fontSize: '0.75rem', color: 'var(--color-text-tertiary)', textAlign: 'center', padding: '20px 0' }}>
                  No pending actionable tasks
                </div>
              ) : (
                notifications.map((notif, idx) => (
                  <div 
                    key={idx} 
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: 12,
                      borderRadius: 14,
                      border: '1px solid var(--color-border)',
                      background: 'rgba(0,0,0,0.01)',
                      opacity: notif.read ? 0.6 : 1
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <div style={{ width: 10, height: 10, borderRadius: '50%', backgroundColor: notif.badgeColor, flexShrink: 0 }} />
                      <div>
                        <h4 style={{ fontSize: '0.8rem', fontWeight: 700 }}>{notif.title}</h4>
                        <p style={{ fontSize: '0.7rem', color: 'var(--color-text-tertiary)', marginTop: 2 }}>{notif.message}</p>
                      </div>
                    </div>
                    <button 
                      onClick={() => alert(`Reviewing: ${notif.title}`)} 
                      style={{ border: 'none', background: 'transparent', cursor: 'pointer', color: 'var(--color-primary)', display: 'flex', alignItems: 'center' }}
                    >
                      <ChevronRight size={16} />
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {/* 6. Company Summary Dashboard */}
      <div className="premium-card" style={{ padding: 24, background: 'var(--glass-bg)', backdropFilter: 'blur(20px)' }}>
        <h3 style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: 20 }}>Company Workspace Summary</h3>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: 20
        }}>
          <div>
            <span className="premium-label" style={{ fontSize: '0.65rem' }}>Enterprise name</span>
            <div style={{ fontSize: '0.9rem', fontWeight: 700, marginTop: 4 }}>{company?.name || 'ITLC HRMS'}</div>
          </div>
          <div>
            <span className="premium-label" style={{ fontSize: '0.65rem' }}>Active Plan</span>
            <div style={{ fontSize: '0.9rem', fontWeight: 700, marginTop: 4, color: 'var(--color-primary)', textTransform: 'capitalize' }}>
              {company?.subscriptionPlanId || 'Starter'}
            </div>
          </div>
          <div>
            <span className="premium-label" style={{ fontSize: '0.65rem' }}>Max Employees Limit</span>
            <div style={{ fontSize: '0.9rem', fontWeight: 700, marginTop: 4, display: 'flex', alignItems: 'center', gap: 6 }}>
              <Users size={14} style={{ color: 'var(--color-text-tertiary)' }} />
              <span className="number-font" style={{ fontSize: '0.85rem' }}>{employeesList.length} / {company?.maxEmployees || 100}</span>
            </div>
          </div>
          <div>
            <span className="premium-label" style={{ fontSize: '0.65rem' }}>Cloud storage limit</span>
            <div style={{ fontSize: '0.9rem', fontWeight: 700, marginTop: 4, display: 'flex', alignItems: 'center', gap: 6 }}>
              <HardDrive size={14} style={{ color: 'var(--color-text-tertiary)' }} />
              <span className="number-font" style={{ fontSize: '0.85rem' }}>{company?.storageLimit || 50} GB</span>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}
