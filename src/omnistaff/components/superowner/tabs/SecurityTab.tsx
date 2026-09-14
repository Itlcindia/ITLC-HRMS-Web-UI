import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  ShieldCheck, ShieldAlert, Key, Globe, Monitor, LogOut, 
  Trash2, Plus, CheckCircle2, History, ToggleLeft, ToggleRight
} from 'lucide-react';
import { useDashboard } from '../context/DashboardContext';
import { api } from '../../../services/api';

interface ActiveSession {
  id: string;
  device: string;
  location: string;
  ip: string;
  lastActive: string;
  current: boolean;
}

export const SecurityTab: React.FC = () => {
  const { addToast, addLog, logs } = useDashboard();

  // Change Password State
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [isSubmittingPass, setIsSubmittingPass] = useState(false);

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmNewPassword) {
      alert('New password and confirm password do not match.');
      return;
    }
    if (newPassword.length < 6) {
      alert('New password must be at least 6 characters long.');
      return;
    }
    setIsSubmittingPass(true);
    try {
      await api.changePassword({ newPassword });
      addToast('Password changed successfully!', 'success');
      addLog('Password Changed', 'Super Owner password updated successfully.', 'security');
      setNewPassword('');
      setConfirmNewPassword('');
    } catch (err: any) {
      alert(err.message || 'Failed to update password');
    } finally {
      setIsSubmittingPass(false);
    }
  };

  // Create Additional Super Owner State
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regConfirmPassword, setRegConfirmPassword] = useState('');
  const [isSubmittingReg, setIsSubmittingReg] = useState(false);

  const handleCreateSuperOwnerSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (regPassword !== regConfirmPassword) {
      alert('Password and confirm password do not match.');
      return;
    }
    if (regPassword.length < 6) {
      alert('Password must be at least 6 characters long.');
      return;
    }
    setIsSubmittingReg(true);
    try {
      await api.createSuperOwner({
        name: regName,
        email: regEmail,
        phone: regPhone,
        password: regPassword
      });
      addToast('Additional Super Owner registered successfully!', 'success');
      addLog('Super Owner Created', `New Super Owner account registered: ${regEmail}`, 'security');
      setRegName('');
      setRegEmail('');
      setRegPhone('');
      setRegPassword('');
      setRegConfirmPassword('');
    } catch (err: any) {
      alert(err.message || 'Failed to register Super Owner');
    } finally {
      setIsSubmittingReg(false);
    }
  };

  // Security Toggles
  const [twoFactor, setTwoFactor] = useState(true);
  const [sessionPinning, setSessionPinning] = useState(false);

  // IP Whitelist
  const [ipList, setIpList] = useState<string[]>([]);
  const [newIp, setNewIp] = useState('');

  // Active Sessions
  const [sessions, setSessions] = useState<ActiveSession[]>([]);

  // Load data on mount
  React.useEffect(() => {
    const fetchSecurityData = async () => {
      try {
        const [settings, activeSessions] = await Promise.all([
          api.getSecuritySettings(),
          api.getSessions()
        ]);
        if (settings) {
          setTwoFactor(settings.twoFactor);
          setSessionPinning(settings.sessionPinning);
          setIpList(settings.ipList || []);
        }
        if (activeSessions) {
          setSessions(activeSessions);
        }
      } catch (err) {
        console.error("Failed to load security settings", err);
      }
    };
    fetchSecurityData();
  }, []);

  const toggleTwoFactor = async () => {
    try {
      const next = !twoFactor;
      await api.updateSecuritySettings({ twoFactor: next });
      setTwoFactor(next);
      addToast(`Two-Factor Authentication ${next ? 'Activated' : 'Deactivated'}`, next ? 'success' : 'warning');
      addLog('Security Configuration Changed', `Two-Factor Authentication policy set to ${next ? 'ENABLED' : 'DISABLED'}.`, 'security');
    } catch (e) {
      addToast('Failed to update 2FA setting', 'error');
    }
  };

  const handleAddIp = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanIp = newIp.trim();
    if (!cleanIp) return;

    // Validate IP (rough match)
    const ipPattern = /^([0-9]{1,3}\.){3}[0-9]{1,3}$/;
    if (!ipPattern.test(cleanIp)) {
      alert('Please enter a valid IPv4 Address.');
      return;
    }

    if (ipList.includes(cleanIp)) {
      alert('IP address already whitelisted.');
      return;
    }

    try {
      const newList = [...ipList, cleanIp];
      await api.updateSecuritySettings({ ipList: newList });
      setIpList(newList);
      setNewIp('');
      addToast(`IP ${cleanIp} added to whitelist`, 'success');
      addLog('IP Whitelisted', `Added IP Address "${cleanIp}" to white-list database security settings.`, 'security');
    } catch (e) {
      addToast('Failed to update IP whitelist', 'error');
    }
  };

  const handleDeleteIp = async (ipAddress: string) => {
    if (confirm(`Remove IP Whitelist block: ${ipAddress}?`)) {
      try {
        const newList = ipList.filter(ip => ip !== ipAddress);
        await api.updateSecuritySettings({ ipList: newList });
        setIpList(newList);
        addToast(`IP ${ipAddress} removed from whitelist`, 'warning');
        addLog('IP Removed', `Removed IP Address "${ipAddress}" from white-list settings.`, 'security');
      } catch (e) {
        addToast('Failed to delete IP', 'error');
      }
    }
  };

  const handleTerminateSession = async (id: string, device: string) => {
    if (confirm(`Terminate user session on ${device}?`)) {
      try {
        await api.deleteSession(id);
        setSessions(prev => prev.filter(s => s.id !== id));
        addToast(`Session terminated on ${device}`, 'success');
        addLog('Session Terminated', `Active login session terminated on ${device}.`, 'security');
      } catch (e) {
        addToast('Failed to terminate session', 'error');
      }
    }
  };

  // Filter security logs
  const securityLogs = logs.filter(l => l.category === 'security' || l.category === 'settings');

  return (
    <div className="space-y-6">
      {/* Title */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-white font-sans">
          Security & Access Settings
        </h1>
        <p className="text-slate-400 text-sm mt-1">
          Configure global platform two-factor rules, whitelist administrator IP addresses, and audit login sessions.
        </p>
      </div>

      {/* Toggles and IP Whitelist Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Security Rules Card */}
        <div className="glass-card p-6 rounded-2xl relative overflow-hidden flex flex-col justify-between">
          <div className="absolute top-0 right-0 h-40 w-40 bg-gradient-to-bl from-indigo-500/10 to-transparent blur-3xl pointer-events-none"></div>
          <div>
            <h3 className="text-base font-semibold text-white mb-2 flex items-center gap-2"><ShieldCheck className="h-5 w-5 text-indigo-400" /> Platform Access Policies</h3>
            <p className="text-xs text-slate-400 mb-6">Manage global authentication policies for Super Owners and Tenant Admins.</p>

            <div className="space-y-4">
              {/* 2FA Toggle */}
              <div 
                onClick={toggleTwoFactor}
                className="p-4 rounded-xl border border-white/5 bg-white/2 flex justify-between items-center cursor-pointer select-none hover:bg-white/4 transition"
              >
                <div className="space-y-1">
                  <span className="font-semibold text-sm text-slate-200 block">Enforce Two-Factor Auth (2FA)</span>
                  <span className="text-[10px] text-slate-500 block leading-normal">Require Google Authenticator or SMS codes on login.</span>
                </div>
                <button>
                  {twoFactor ? (
                    <ToggleRight className="h-7 w-7 text-indigo-400" />
                  ) : (
                    <ToggleLeft className="h-7 w-7 text-neutral-600" />
                  )}
                </button>
              </div>

              {/* Session IP Pinning */}
              <div 
                onClick={async () => {
                  try {
                    const next = !sessionPinning;
                    await api.updateSecuritySettings({ sessionPinning: next });
                    setSessionPinning(next);
                    addToast(`Session Pinning ${next ? 'Enabled' : 'Disabled'}`, next ? 'success' : 'warning');
                  } catch (e) {
                    addToast('Failed to update session pinning', 'error');
                  }
                }}
                className="p-4 rounded-xl border border-white/5 bg-white/2 flex justify-between items-center cursor-pointer select-none hover:bg-white/4 transition"
              >
                <div className="space-y-1">
                  <span className="font-semibold text-sm text-slate-200 block">Session IP Pinning</span>
                  <span className="text-[10px] text-slate-500 block leading-normal">Invalidate logins instantly if IP address changes mid-session.</span>
                </div>
                <button>
                  {sessionPinning ? (
                    <ToggleRight className="h-7 w-7 text-indigo-400" />
                  ) : (
                    <ToggleLeft className="h-7 w-7 text-slate-600" />
                  )}
                </button>
              </div>
            </div>
          </div>

          <div className="border-t border-white/5 pt-4 mt-6 flex justify-between items-center text-xs text-slate-500">
            <span className="flex items-center gap-1"><Key className="h-3.5 w-3.5" /> Enforcing standard SOC2 compliance</span>
          </div>
        </div>

        {/* IP Whitelist Card */}
        <div className="glass-card p-6 rounded-2xl flex flex-col justify-between">
          <div>
            <h3 className="text-base font-semibold text-white mb-2 flex items-center gap-2"><Globe className="h-5 w-5 text-indigo-400" /> Administrator IP Whitelist</h3>
            <p className="text-xs text-slate-400 mb-6">Authorize specific IPv4 ranges to bypass verification triggers.</p>

            <form onSubmit={handleAddIp} className="flex gap-2 mb-4">
              <input
                type="text"
                required
                placeholder="e.g. 192.168.1.1 or 82.165.23.1"
                value={newIp}
                onChange={(e) => setNewIp(e.target.value)}
                className="glass-input flex-1 px-3.5 py-1.5 rounded-xl text-xs text-slate-200 font-mono"
              />
              <button
                type="submit"
                className="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold flex items-center gap-1 shrink-0 transition"
              >
                <Plus className="h-4 w-4" /> Whitelist IP
              </button>
            </form>

            <div className="space-y-2">
              {ipList.map((ip) => (
                <div key={ip} className="p-3 rounded-xl bg-white/2 border border-white/5 text-xs flex justify-between items-center font-mono">
                  <span className="text-slate-300 font-medium select-all">{ip}</span>
                  <button
                    onClick={() => handleDeleteIp(ip)}
                    className="p-1 rounded bg-white/5 hover:bg-rose-600 hover:text-white border border-white/5 text-slate-400 transition"
                    title="Delete Whitelisted IP"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="border-t border-white/5 pt-4 mt-6 flex justify-between items-center text-xs text-slate-500">
            <span className="flex items-center gap-1.5"><CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" /> Firewall active and parsing</span>
          </div>
        </div>
      </div>

      {/* Change Password Card */}
      <div className="glass-card p-6 rounded-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 h-40 w-40 bg-gradient-to-bl from-violet-500/10 to-transparent blur-3xl pointer-events-none"></div>
        <h3 className="text-base font-semibold text-white mb-2 flex items-center gap-2">
          <Key className="h-5 w-5 text-indigo-400" /> Change Password
        </h3>
        <p className="text-xs text-slate-400 mb-6">Modify your Super Owner account password securely.</p>
        
        <form onSubmit={handlePasswordSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4 items-end">
          <div className="space-y-1">
            <label className="text-[10px] uppercase font-semibold text-slate-405 block">New Password</label>
            <input
              type="password"
              required
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="glass-input w-full px-3.5 py-2 rounded-xl text-xs text-slate-200"
              placeholder="••••••••"
            />
          </div>
          <div className="flex gap-2">
            <div className="space-y-1 flex-1">
              <label className="text-[10px] uppercase font-semibold text-slate-405 block">Confirm New Password</label>
              <input
                type="password"
                required
                value={confirmNewPassword}
                onChange={(e) => setConfirmNewPassword(e.target.value)}
                className="glass-input w-full px-3.5 py-2 rounded-xl text-xs text-slate-200"
                placeholder="••••••••"
              />
            </div>
            <button
              type="submit"
              disabled={isSubmittingPass}
              className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:bg-indigo-600/50 text-white text-xs font-semibold shrink-0 transition h-[36px]"
            >
              {isSubmittingPass ? 'Updating...' : 'Update Password'}
            </button>
          </div>
        </form>
      </div>

      {/* Register Additional Super Owner Card */}
      <div className="glass-card p-6 rounded-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 h-40 w-40 bg-gradient-to-bl from-indigo-500/10 to-transparent blur-3xl pointer-events-none"></div>
        <h3 className="text-base font-semibold text-white mb-2 flex items-center gap-2">
          <Plus className="h-5 w-5 text-indigo-400" /> Create Additional Super Owner
        </h3>
        <p className="text-xs text-slate-400 mb-6">Register another administrator account with global platform authority.</p>

        <form onSubmit={handleCreateSuperOwnerSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-1">
              <label className="text-[10px] uppercase font-semibold text-slate-400 block font-mono">Full Name</label>
              <input
                type="text"
                required
                value={regName}
                onChange={(e) => setRegName(e.target.value)}
                className="glass-input w-full px-3.5 py-2 rounded-xl text-xs text-slate-200"
                placeholder="e.g. John Doe"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] uppercase font-semibold text-slate-400 block font-mono">Email Address</label>
              <input
                type="email"
                required
                value={regEmail}
                onChange={(e) => setRegEmail(e.target.value)}
                className="glass-input w-full px-3.5 py-2 rounded-xl text-xs text-slate-200"
                placeholder="e.g. admin@platform.com"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] uppercase font-semibold text-slate-400 block font-mono">Phone Number</label>
              <input
                type="text"
                value={regPhone}
                onChange={(e) => setRegPhone(e.target.value)}
                className="glass-input w-full px-3.5 py-2 rounded-xl text-xs text-slate-200"
                placeholder="e.g. +91 9999999999"
              />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
            <div className="space-y-1">
              <label className="text-[10px] uppercase font-semibold text-slate-400 block font-mono">Password</label>
              <input
                type="password"
                required
                value={regPassword}
                onChange={(e) => setRegPassword(e.target.value)}
                className="glass-input w-full px-3.5 py-2 rounded-xl text-xs text-slate-200"
                placeholder="••••••••"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] uppercase font-semibold text-slate-400 block font-mono">Confirm Password</label>
              <input
                type="password"
                required
                value={regConfirmPassword}
                onChange={(e) => setRegConfirmPassword(e.target.value)}
                className="glass-input w-full px-3.5 py-2 rounded-xl text-xs text-slate-200"
                placeholder="••••••••"
              />
            </div>
            <button
              type="submit"
              disabled={isSubmittingReg}
              className="w-full px-4 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-blue-600 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 text-white text-xs font-semibold transition h-[36px]"
            >
              {isSubmittingReg ? 'Registering...' : 'Register Super Owner'}
            </button>
          </div>
        </form>
      </div>

      {/* Device Sessions Management */}
      <div className="glass-card rounded-2xl p-6">
        <h3 className="text-base font-semibold text-white mb-2 flex items-center gap-2"><Monitor className="h-5 w-5 text-indigo-400" /> Active Device Sessions</h3>
        <p className="text-xs text-slate-400 mb-6">Revoke active sessions on devices logged into your account.</p>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="border-b border-white/5 text-slate-400 text-xs font-semibold uppercase tracking-wider bg-white/2">
                <th className="py-3 px-4">Device / Browser</th>
                <th className="py-3 px-4">Location</th>
                <th className="py-3 px-4">IP Address</th>
                <th className="py-3 px-4">Last Activity</th>
                <th className="py-3 px-4 text-right">Access control</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-slate-300">
              {sessions.map(sess => (
                <tr key={sess.id} className="hover:bg-white/2 transition">
                  <td className="py-3 px-4 font-semibold text-white flex items-center gap-2">
                    {sess.device}
                    {sess.current && (
                      <span className="px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-300 text-[8px] font-bold tracking-wider uppercase font-mono border border-emerald-500/20">
                        Current Session
                      </span>
                    )}
                  </td>
                  <td className="py-3 px-4 text-xs text-slate-400">{sess.location}</td>
                  <td className="py-3 px-4 font-mono text-xs text-slate-400">{sess.ip}</td>
                  <td className="py-3 px-4 text-xs text-slate-500">{sess.lastActive}</td>
                  <td className="py-3 px-4 text-right">
                    {!sess.current && (
                      <button
                        onClick={() => handleTerminateSession(sess.id, sess.device)}
                        className="px-2.5 py-1 rounded-lg bg-rose-600/10 hover:bg-rose-600 text-rose-300 hover:text-white border border-rose-500/20 text-xs font-semibold flex items-center gap-1 transition"
                      >
                        <LogOut className="h-3 w-3" /> Terminate Session
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Security audit logs */}
      <div className="glass-card rounded-2xl p-6">
        <h3 className="text-base font-semibold text-white mb-2 flex items-center gap-2"><History className="h-5 w-5 text-indigo-400" /> Security Audit trail</h3>
        <p className="text-xs text-slate-400 mb-6">Historical ledger tracking token generation, IP modifications, and security state changes.</p>

        <div className="space-y-3">
          {securityLogs.length === 0 ? (
            <span className="text-xs text-slate-500 italic">No security events found.</span>
          ) : (
            securityLogs.map(l => (
              <div key={l.id} className="p-3 rounded-xl bg-white/2 border border-white/5 text-xs flex justify-between items-center font-mono">
                <div className="space-y-1">
                  <span className="font-semibold text-slate-200 block">{l.action}</span>
                  <span className="text-[10px] text-slate-500 block leading-normal">{l.details}</span>
                </div>
                <div className="text-right text-[10px] text-slate-500 space-y-1">
                  <span className="block font-semibold">Actor: {l.actorName}</span>
                  <span>{new Date(l.timestamp).toLocaleString()}</span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
export default SecurityTab;
