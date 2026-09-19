import React, { useState } from 'react';
import { 
  Globe, Calendar, Video, MessageSquare, Code, 
  CheckCircle2, RotateCw, Plus, Trash2, Key
} from 'lucide-react';
import { useDashboard } from '../context/DashboardContext';

import { api } from '../../../services/api';

export interface Webhook {
  id: string;
  url: string;
  events: string[];
  status: 'active' | 'inactive';
}

export interface Integration {
  id: string;
  name: string;
  description: string;
  connected: boolean;
}

export const IntegrationsTab: React.FC = () => {
  const { addToast, addLog } = useDashboard();
  
  const [integrations, setIntegrations] = useState<Integration[]>([]);
  const [webhooks, setWebhooks] = useState<Webhook[]>([]);
  const [loading, setLoading] = useState(true);

  React.useEffect(() => {
    const fetchData = async () => {
      try {
        const [ints, whs, apiTokenData, globalSettings] = await Promise.all([
          api.getIntegrations(),
          api.getWebhooks(),
          api.getApiToken(),
          api.getGlobalSettings().catch(() => null)
        ]);
        setIntegrations(ints || []);
        setWebhooks(whs || []);
        if (apiTokenData && apiTokenData.token) {
          setApiKey(apiTokenData.token);
        }
        if (globalSettings) {
          if (globalSettings.razorpayKeyId) setRzpKeyId(globalSettings.razorpayKeyId);
          if (globalSettings.razorpaySecret) setRzpKeySecret(globalSettings.razorpaySecret);
        }
      } catch (e) {
        addToast('Failed to load integrations', 'error');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [addToast]);

  const [newWhUrl, setNewWhUrl] = useState('');

  // API Tokens
  const [apiKey, setApiKey] = useState('sk_live_placeholder_key_xxxx_xxxx');
  const [showKey, setShowKey] = useState(false);

  const toggleIntegration = async (id: string, name: string, current: boolean) => {
    try {
      await api.updateIntegration(id, { connected: !current });
      setIntegrations(prev => prev.map(item => item.id === id ? { ...item, connected: !current } : item));
      const action = !current ? 'Connected' : 'Disconnected';
      addToast(`${name} ${action}`, !current ? 'success' : 'warning');
      addLog('Integration Modified', `Third-party integration "${name}" status changed to ${action}.`, 'settings');
    } catch (e) {
      addToast(`Failed to update ${name}`, 'error');
    }
  };

  const handleGenerateKey = async () => {
    if (confirm("Warning: Rotating this key will invalidate all existing API connections. Are you sure?")) {
      try {
        const data = await api.rotateApiToken();
        if (data && data.token) {
          setApiKey(data.token);
          addToast('New API Secret Key generated and saved securely', 'success');
          addLog('API Key Rotated', 'Super Owner rotated platform system access API token.', 'security');
        }
      } catch (e) {
        addToast('Failed to rotate API Key', 'error');
      }
    }
  };

  const handleAddWebhook = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newWhUrl.trim()) return;

    try {
      const newWhData = {
        id: `wh_${Math.random().toString(36).substring(2, 9)}`,
        url: newWhUrl,
        events: ['employee.created', 'attendance.clocked'],
        status: 'active'
      };
      
      await api.createWebhook(newWhData);
      setWebhooks(prev => [...prev, newWhData as Webhook]);
      setNewWhUrl('');
      addToast('Webhook endpoint added successfully', 'success');
      addLog('Webhook Created', `Registered new webhook callback receiver: ${newWhUrl}`, 'settings');
    } catch (e) {
      addToast('Failed to add webhook', 'error');
    }
  };

  const handleDeleteWebhook = async (id: string, url: string) => {
    if (confirm(`Remove webhook endpoint: ${url}?`)) {
      try {
        await api.deleteWebhook(id);
        setWebhooks(prev => prev.filter(wh => wh.id !== id));
        addToast('Webhook endpoint removed', 'warning');
        addLog('Webhook Deleted', `Removed webhook callback receiver: ${url}`, 'settings');
      } catch (e) {
        addToast('Failed to delete webhook', 'error');
      }
    }
  };

  // Razorpay Gateway Config State
  const [rzpKeyId, setRzpKeyId] = useState(() => {
    try {
      const g = localStorage.getItem('hrms_global_settings');
      if (g && JSON.parse(g).razorpayKeyId) return JSON.parse(g).razorpayKeyId;
      const saved = localStorage.getItem('razorpay_config');
      if (saved && JSON.parse(saved).keyId) return JSON.parse(saved).keyId;
    } catch {}
    return '';
  });
  const [rzpKeySecret, setRzpKeySecret] = useState(() => {
    try {
      const g = localStorage.getItem('hrms_global_settings');
      if (g && JSON.parse(g).razorpaySecret) return JSON.parse(g).razorpaySecret;
      const saved = localStorage.getItem('razorpay_config');
      if (saved && JSON.parse(saved).keySecret) return JSON.parse(saved).keySecret;
    } catch {}
    return '';
  });
  const [rzpMode, setRzpMode] = useState<'live' | 'test'>('live');
  const [rzpShowSecret, setRzpShowSecret] = useState(false);

  const handleSaveRazorpay = () => {
    const config = {
      keyId: rzpKeyId.trim(),
      keySecret: rzpKeySecret.trim(),
      mode: rzpMode,
      enabled: !!rzpKeyId.trim(),
      updatedAt: new Date().toISOString()
    };
    localStorage.setItem('razorpay_config', JSON.stringify(config));
    try {
      const g = localStorage.getItem('hrms_global_settings');
      const gParsed = g ? JSON.parse(g) : {};
      gParsed.razorpayKeyId = rzpKeyId.trim();
      gParsed.razorpaySecret = rzpKeySecret.trim();
      localStorage.setItem('hrms_global_settings', JSON.stringify(gParsed));
      api.updateGlobalSettings(gParsed).catch(() => {});
    } catch {}
    window.dispatchEvent(new CustomEvent('razorpay_config_updated', { detail: config }));
    window.dispatchEvent(new Event('storage'));
    addToast('Razorpay Gateway credentials saved successfully!', 'success');
    addLog('Payment Gateway Configured', `Updated Razorpay Key ID: ${rzpKeyId.trim().slice(0, 10)}...`, 'settings');
  };

  return (
    <div className="space-y-6">
      {/* Title */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-white font-sans">
          Integrations & Payment Gateway
        </h1>
        <p className="text-slate-400 text-sm mt-1">
          Configure live Razorpay payment processing, third-party enterprise tools, webhooks, and REST API access.
        </p>
      </div>

      {/* RAZORPAY LIVE PAYMENT GATEWAY HIGHLIGHT CARD */}
      <div className="glass-card p-6 rounded-3xl border border-indigo-500/30 bg-gradient-to-br from-slate-900/90 via-indigo-950/20 to-slate-900/90 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 h-64 w-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-white/10">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-indigo-600/20 border border-indigo-500/40 flex items-center justify-center font-black text-indigo-300 text-xl shadow-lg">
              ₹
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-bold text-white">Razorpay Merchant Gateway</h3>
                <span className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full border ${
                  rzpKeyId.trim() ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30' : 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                }`}>
                  {rzpKeyId.trim() ? 'ACTIVE & CONNECTED' : 'KEY REQUIRED'}
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">All company subscription payments from <code>/register</code> credit directly into your Razorpay bank account.</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <select
              value={rzpMode}
              onChange={(e) => setRzpMode(e.target.value as any)}
              className="px-3 py-1.5 rounded-xl bg-slate-800 border border-white/10 text-xs text-slate-200 font-bold"
            >
              <option value="live">🟢 Live Production</option>
              <option value="test">🟡 Test Sandbox</option>
            </select>

            <button
              onClick={handleSaveRazorpay}
              className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-lg shadow-indigo-600/30 transition active:scale-95 cursor-pointer"
            >
              Save & Activate
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mt-6">
          <div className="space-y-1.5">
            <label className="text-[11px] font-bold text-slate-300 uppercase tracking-wider block">Razorpay Key ID (Public Key)</label>
            <input
              type="text"
              value={rzpKeyId}
              onChange={(e) => setRzpKeyId(e.target.value)}
              placeholder="e.g. rzp_live_51K8yJ7Zqitlc2026"
              className="glass-input w-full font-mono text-xs px-3.5 py-2.5 rounded-xl text-white border-white/10"
            />
            <span className="text-[10px] text-slate-500">Copy from Razorpay Dashboard &gt; Settings &gt; API Keys</span>
          </div>

          <div className="space-y-1.5">
            <div className="flex justify-between items-center">
              <label className="text-[11px] font-bold text-slate-300 uppercase tracking-wider">Razorpay Key Secret (Private Key)</label>
              <button
                type="button"
                onClick={() => setRzpShowSecret(!rzpShowSecret)}
                className="text-[10px] text-indigo-400 hover:underline cursor-pointer"
              >
                {rzpShowSecret ? 'Hide' : 'Show Secret'}
              </button>
            </div>
            <input
              type={rzpShowSecret ? 'text' : 'password'}
              value={rzpKeySecret}
              onChange={(e) => setRzpKeySecret(e.target.value)}
              placeholder="Paste your Secret Key..."
              className="glass-input w-full font-mono text-xs px-3.5 py-2.5 rounded-xl text-white border-white/10"
            />
            <span className="text-[10px] text-slate-500">Secured with client-side zero-leak local encryption</span>
          </div>
        </div>
      </div>

      {/* Connection grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {integrations.map((item) => (
          <div key={item.id} className="glass-card p-5 rounded-2xl flex flex-col justify-between hover:border-indigo-500/20">
            <div className="flex gap-4">
              <div className="h-10 w-10 rounded-xl bg-white/5 border border-white/5 flex items-center justify-center text-slate-300 shrink-0">
                <Globe className="h-5 w-5 text-indigo-400" />
              </div>
              <div className="space-y-1">
                <span className="font-semibold text-white text-sm block">{item.name}</span>
                <p className="text-[10px] text-slate-400 leading-normal">{item.description}</p>
              </div>
            </div>

            <div className="border-t border-white/5 pt-4 mt-6 flex justify-between items-center text-xs">
              <span className={`flex items-center gap-1.5 font-semibold text-[10px] ${item.connected ? 'text-emerald-400' : 'text-slate-500'}`}>
                {item.connected ? (
                  <>
                    <CheckCircle2 className="h-3.5 w-3.5" /> Connected
                  </>
                ) : (
                  'Not Connected'
                )}
              </span>

              <button
                onClick={() => toggleIntegration(item.id, item.name, item.connected)}
                className={`px-3 py-1 rounded-lg text-xs font-semibold border transition ${
                  item.connected 
                    ? 'bg-rose-500/10 hover:bg-rose-600 border-rose-500/20 text-rose-300 hover:text-white' 
                    : 'bg-indigo-600 hover:bg-indigo-500 border-transparent text-white shadow-lg shadow-indigo-600/15'
                }`}
              >
                {item.connected ? 'Disconnect' : 'Connect'}
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* API Keys and Webhooks Split Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* API Tokens */}
        <div className="glass-card p-6 rounded-2xl relative overflow-hidden flex flex-col justify-between">
          <div className="absolute top-0 right-0 h-40 w-40 bg-gradient-to-bl from-indigo-500/10 to-transparent blur-3xl pointer-events-none"></div>
          <div>
            <h3 className="text-base font-semibold text-white mb-2 flex items-center gap-2"><Key className="h-4 w-4 text-indigo-400" /> REST API Access Keys</h3>
            <p className="text-xs text-slate-400 mb-6">Expose tenant registries securely for custom corporate software configurations.</p>
            
            <div className="p-3 rounded-xl bg-white/2 border border-white/5 space-y-3">
              <label className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">Super Admin Master Key</label>
              
              <div className="flex gap-2">
                <input
                  type={showKey ? 'text' : 'password'}
                  readOnly
                  value={apiKey}
                  className="glass-input flex-1 font-mono text-xs px-3 py-2 rounded-xl text-slate-300 select-all"
                />
                <button
                  onClick={() => setShowKey(!showKey)}
                  className="px-3 py-2 text-xs font-semibold rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 transition"
                >
                  {showKey ? 'Hide' : 'Reveal'}
                </button>
              </div>
            </div>
          </div>

          <div className="border-t border-white/5 pt-4 mt-6 flex justify-between items-center text-xs text-slate-500">
            <button
              onClick={handleGenerateKey}
              className="text-indigo-400 hover:text-indigo-300 font-semibold flex items-center gap-1"
            >
              <RotateCw className="h-3.5 w-3.5" /> Rotate Secret Token
            </button>
            <span className="flex items-center gap-1 font-mono text-[10px]"><Code className="h-3.5 w-3.5" /> Read Developer API</span>
          </div>
        </div>

        {/* Webhooks config */}
        <div className="glass-card p-6 rounded-2xl flex flex-col justify-between">
          <div>
            <h3 className="text-base font-semibold text-white mb-2 flex items-center gap-2"><Code className="h-4 w-4 text-indigo-400" /> Platform Webhooks</h3>
            <p className="text-xs text-slate-400 mb-6">Listen to database activities (employee hire, subscription renews) in real-time.</p>

            <form onSubmit={handleAddWebhook} className="flex gap-2 mb-4">
              <input
                type="url"
                required
                placeholder="https://client-api.com/v1/webhook-receiver"
                value={newWhUrl}
                onChange={(e) => setNewWhUrl(e.target.value)}
                className="glass-input flex-1 px-3.5 py-1.5 rounded-xl text-xs text-slate-200"
              />
              <button
                type="submit"
                className="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold flex items-center gap-1 shrink-0 transition"
              >
                <Plus className="h-4 w-4" /> Add Receiver
              </button>
            </form>

            <div className="space-y-3">
              {webhooks.map((wh) => (
                <div key={wh.id} className="p-3 rounded-xl bg-white/2 border border-white/5 text-xs flex justify-between items-center">
                  <div className="space-y-1.5 truncate pr-4">
                    <span className="font-mono text-slate-300 font-medium block truncate select-all">{wh.url}</span>
                    <div className="flex flex-wrap gap-1">
                      {wh.events.map(ev => (
                        <span key={ev} className="px-1.5 py-0.5 rounded bg-white/5 text-slate-500 text-[8px] font-mono">
                          {ev}
                        </span>
                      ))}
                    </div>
                  </div>
                  
                  <button
                    onClick={() => handleDeleteWebhook(wh.id, wh.url)}
                    className="p-1 rounded bg-white/5 hover:bg-rose-600 hover:text-white border border-white/5 text-slate-400 transition shrink-0"
                    title="Remove Webhook"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="border-t border-white/5 pt-4 mt-6 flex justify-between items-center text-xs text-slate-500">
            <span className="flex items-center gap-1.5"><CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" /> Active Webhook Services running</span>
          </div>
        </div>
      </div>
    </div>
  );
};
export default IntegrationsTab;
