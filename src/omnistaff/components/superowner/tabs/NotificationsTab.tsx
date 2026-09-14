import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Send, Mail, MessageSquare, Bell, Compass, 
  Users, CheckCircle2, History, AlertTriangle
} from 'lucide-react';
import { useDashboard } from '../context/DashboardContext';

import { api } from '../../../services/api';

interface SentNotification {
  id: string;
  title: string;
  target: string;
  channels: string[];
  timestamp: string;
  senderName: string;
}

const getChannelBadgeClass = (channel: string) => {
  switch (channel.toLowerCase()) {
    case 'email':
      return 'bg-[#1557b0] text-[#e8f0fe] border border-[#1a73e8]';
    case 'sms':
      return 'bg-[#FBBC05] text-black border border-[#FBBC05]';
    case 'push':
      return 'bg-[#a51d24] text-[#fce8e6] border border-[#d93025]';
    case 'whatsapp':
      return 'bg-[#137333] text-[#e6f4ea] border border-[#1e8e3e]';
    default:
      return 'bg-indigo-500/10 text-indigo-300 border border-indigo-500/20';
  }
};

export const NotificationsTab: React.FC = () => {
  const { companies, addToast, addLog, setIsFormDirty } = useDashboard();

  // Broadcast settings form state
  const [formData, setFormData] = useState({
    title: '',
    message: '',
    targetGroup: 'all',
    selectedCompanyId: '',
    channels: {
      email: true,
      sms: false,
      push: false,
      whatsapp: false
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

  // Sent notifications list
  const [history, setHistory] = useState<SentNotification[]>([]);

  React.useEffect(() => {
    const fetchHistory = async () => {
      try {
        const data = await api.getNotifications();
        if (data && Array.isArray(data)) {
          setHistory(data);
        }
      } catch (e) {
        console.error('Failed to fetch notification history', e);
      }
    };
    fetchHistory();
  }, []);

  const handleChannelToggle = (channelKey: keyof typeof formData.channels) => {
    updateForm(prev => ({
      ...prev,
      channels: {
        ...prev.channels,
        [channelKey]: !prev.channels[channelKey]
      }
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const selectedChannels = Object.entries(formData.channels)
      .filter(([_, enabled]) => enabled)
      .map(([key]) => key.toUpperCase());

    if (selectedChannels.length === 0) {
      alert('Please select at least one transmission channel.');
      return;
    }

    let targetText = 'All Companies';
    if (formData.targetGroup === 'specific') {
      const comp = companies.find(c => c.id === formData.selectedCompanyId);
      targetText = comp ? `Company: ${comp.name}` : 'Specific Company';
    } else if (formData.targetGroup === 'trial') {
      targetText = 'Trial Companies';
    } else if (formData.targetGroup === 'expired') {
      targetText = 'Expired Companies';
    }

    const newNotificationData = {
      id: `not_${Math.random().toString(36).substring(2, 9)}`,
      title: formData.title,
      target: targetText,
      channels: selectedChannels,
      senderName: 'Priya Sharma'
    };

    try {
      const savedNotif = await api.sendNotification(newNotificationData);
      setHistory(prev => [savedNotif, ...prev]);
      addToast('Notification broadcast dispatched', 'success');
      addLog('Notification Dispatched', `Broadcast "${formData.title}" sent to ${targetText} via ${selectedChannels.join(', ')}.`, 'settings');
      
      // Reset form
      setFormData({
        title: '',
        message: '',
        targetGroup: 'all',
        selectedCompanyId: '',
        channels: {
          email: true,
          sms: false,
          push: false,
          whatsapp: false
        }
      });
      setIsFormDirty(false);
    } catch (err) {
      addToast('Failed to dispatch broadcast', 'error');
    }
  };

  return (
    <div className="space-y-6">
      {/* Title */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-white font-sans">
          Notifications Center
        </h1>
        <p className="text-slate-400 text-sm mt-1">
          Broadcast global notices, trigger urgent SMTP emails, or dispatch transactional alerts to specific segments.
        </p>
      </div>

      {/* Broadcast Form and History side-by-side */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 items-start">
        {/* Dispatcher Form */}
        <div className="lg:col-span-3 glass-card p-6 rounded-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 h-40 w-40 bg-gradient-to-bl from-indigo-500/10 to-transparent blur-3xl pointer-events-none"></div>
          
          <h3 className="text-base font-semibold text-white mb-4">Draft Notification Broadcast</h3>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs text-slate-400 font-medium">Broadcast Title</label>
              <input
                type="text"
                required
                value={formData.title}
                onChange={(e) => updateForm({ title: e.target.value })}
                placeholder="e.g. Schedule Maintenance, Subscription Renewal Reminder..."
                className="glass-input w-full px-3.5 py-2 rounded-xl text-sm text-slate-200"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs text-slate-400 font-medium">Message Body</label>
              <textarea
                required
                rows={4}
                value={formData.message}
                onChange={(e) => updateForm({ message: e.target.value })}
                placeholder="Write your email body or SMS text message contents here..."
                className="glass-input w-full px-3.5 py-2 rounded-xl text-sm text-slate-200"
              />
            </div>

            {/* Target Audience Group */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 border-t border-white/5 pt-4">
              <div className="space-y-1.5">
                <label className="text-xs text-slate-400 font-medium">Target Audience Segment</label>
                <select
                  value={formData.targetGroup}
                  onChange={(e) => updateForm({ targetGroup: e.target.value })}
                  className="glass-input w-full px-3.5 py-2 rounded-xl text-sm text-slate-300"
                >
                  <option value="all">All Registered Companies</option>
                  <option value="specific">Specific Company</option>
                  <option value="trial">Active Trial Users</option>
                  <option value="expired">Expired License Tiers</option>
                </select>
              </div>

              {formData.targetGroup === 'specific' && (
                <div className="space-y-1.5 animate-fadeIn">
                  <label className="text-xs text-slate-400 font-medium">Select Tenant Company</label>
                  <select
                    required
                    value={formData.selectedCompanyId}
                    onChange={(e) => updateForm({ selectedCompanyId: e.target.value })}
                    className="glass-input w-full px-3.5 py-2 rounded-xl text-sm text-slate-300"
                  >
                    <option value="">-- Choose Company --</option>
                    {companies.map(c => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>
              )}
            </div>

            {/* Dispatch transmission channels */}
            <div className="space-y-2 border-t border-white/5 pt-4">
              <label className="text-xs text-slate-400 font-semibold uppercase tracking-wider block">Transmission Channels</label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                {/* Email */}
                <div
                  onClick={() => handleChannelToggle('email')}
                  className={`p-3 rounded-xl border flex items-center justify-between cursor-pointer select-none transition duration-200 ${
                    formData.channels.email 
                      ? 'bg-[#1557b0] border-[#1a73e8] text-[#e8f0fe]' 
                      : 'bg-white/1 border-white/5 text-slate-500 hover:border-white/10 hover:bg-white/2 hover:text-slate-400'
                  }`}
                >
                  <span className="text-xs font-semibold flex items-center gap-1.5"><Mail className="h-4 w-4" /> Email</span>
                  {formData.channels.email ? <CheckCircle2 className="h-4 w-4 text-[#e8f0fe]" /> : <div className="h-4 w-4 rounded-full border border-slate-600"></div>}
                </div>

                {/* SMS */}
                <div
                  onClick={() => handleChannelToggle('sms')}
                  className={`p-3 rounded-xl border flex items-center justify-between cursor-pointer select-none transition duration-200 ${
                    formData.channels.sms 
                      ? 'bg-[#FBBC05] border-[#FBBC05] text-black font-semibold' 
                      : 'bg-white/1 border-white/5 text-slate-500 hover:border-white/10 hover:bg-white/2 hover:text-slate-400'
                  }`}
                >
                  <span className="text-xs font-semibold flex items-center gap-1.5"><MessageSquare className="h-4 w-4" /> SMS</span>
                  {formData.channels.sms ? <CheckCircle2 className="h-4 w-4 text-black" /> : <div className="h-4 w-4 rounded-full border border-slate-600"></div>}
                </div>

                {/* Push */}
                <div
                  onClick={() => handleChannelToggle('push')}
                  className={`p-3 rounded-xl border flex items-center justify-between cursor-pointer select-none transition duration-200 ${
                    formData.channels.push 
                      ? 'bg-[#a51d24] border-[#d93025] text-[#fce8e6]' 
                      : 'bg-white/1 border-white/5 text-slate-500 hover:border-white/10 hover:bg-white/2 hover:text-slate-400'
                  }`}
                >
                  <span className="text-xs font-semibold flex items-center gap-1.5"><Bell className="h-4 w-4" /> Push</span>
                  {formData.channels.push ? <CheckCircle2 className="h-4 w-4 text-[#fce8e6]" /> : <div className="h-4 w-4 rounded-full border border-slate-600"></div>}
                </div>

                {/* WhatsApp */}
                <div
                  onClick={() => handleChannelToggle('whatsapp')}
                  className={`p-3 rounded-xl border flex items-center justify-between cursor-pointer select-none transition duration-200 ${
                    formData.channels.whatsapp 
                      ? 'bg-[#137333] border-[#1e8e3e] text-[#e6f4ea]' 
                      : 'bg-white/1 border-white/5 text-slate-500 hover:border-white/10 hover:bg-white/2 hover:text-slate-400'
                  }`}
                >
                  <span className="text-xs font-semibold flex items-center gap-1.5"><Compass className="h-4 w-4" /> WhatsApp</span>
                  {formData.channels.whatsapp ? <CheckCircle2 className="h-4 w-4 text-[#e6f4ea]" /> : <div className="h-4 w-4 rounded-full border border-slate-600"></div>}
                </div>
              </div>
            </div>

            <button
              type="submit"
              className="w-full flex items-center justify-center gap-2 py-2 text-sm font-semibold rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white transition shadow-lg shadow-indigo-600/30"
            >
              <Send className="h-4 w-4" /> Dispatch Broadcast Notice
            </button>
          </form>
        </div>

        {/* History Ledger */}
        <div className="lg:col-span-2 glass-card p-6 rounded-2xl flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-4 border-b border-white/5 pb-4">
              <History className="h-4 w-4 text-slate-400" />
              <h3 className="text-base font-semibold text-white">Broadcast History Logs</h3>
            </div>

            <div className="space-y-4 max-h-[350px] overflow-y-auto pr-1">
              {history.map((h) => (
                <div key={h.id} className="p-3 rounded-xl bg-white/2 border border-white/5 text-xs space-y-2">
                  <div className="flex justify-between items-start">
                    <span className="font-semibold text-white block truncate pr-2">{h.title}</span>
                    <span className="text-[10px] text-slate-500 font-mono shrink-0">{new Date(h.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  </div>

                  <div className="flex justify-between items-center text-[10px] text-slate-400">
                    <span>Target: <span className="text-slate-300 font-medium">{h.target}</span></span>
                    <span className="text-slate-500 font-mono">By {h.senderName}</span>
                  </div>

                  <div className="flex flex-wrap gap-1 pt-1.5 border-t border-white/2">
                    {h.channels.map(chan => (
                      <span key={chan} className={`px-1.5 py-0.5 rounded text-[8px] font-semibold tracking-wider font-mono ${getChannelBadgeClass(chan)}`}>
                        {chan}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="border-t border-white/5 pt-4 mt-6 flex items-center gap-2 text-xs text-slate-500">
            <AlertTriangle className="h-3.5 w-3.5 text-amber-500" /> Messages conform to compliance spam controls.
          </div>
        </div>
      </div>
    </div>
  );
};
export default NotificationsTab;
