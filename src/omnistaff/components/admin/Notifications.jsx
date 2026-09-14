import React, { useState, useEffect } from 'react';
import { Mail, MessageSquare, Send, Radio } from 'lucide-react';
import { api } from '../../services/api';

export default function Notifications() {
  const [channel, setChannel] = useState('email');
  const [template, setTemplate] = useState('welcome');
  const [customMsg, setCustomMsg] = useState('Welcome to the ITLC HRMS portal! Please set up your login profile and secure credentials.');
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isSending, setIsSending] = useState(false);

  const templates = {
    welcome: 'Welcome to the ITLC HRMS portal! Please set up your login profile and secure credentials.',
    holiday: 'Office Announcement: Holiday scheduled. All systems offline except support.',
    payroll: 'Payslip Disbursal notification: Payroll cycle has been processed and disbursal receipts are ready in your dashboard.',
  };

  const fetchHistory = async () => {
    setLoading(true);
    try {
      const data = await api.getBroadcastHistory();
      if (Array.isArray(data)) {
        setHistory(data);
      }
    } catch (err) {
      console.error("Failed to load broadcast history:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  const handleTemplateChange = (e) => {
    setTemplate(e.target.value);
    setCustomMsg(templates[e.target.value]);
  };

  const handleBroadcast = async (e) => {
    e.preventDefault();
    if (!customMsg.trim()) return;
    setIsSending(true);
    try {
      await api.sendBroadcast({
        channel,
        template,
        customMsg
      });
      alert("Broadcast announcement successfully dispatched!");
      setCustomMsg('');
      fetchHistory();
    } catch (err) {
      alert("Failed to send broadcast: " + err.message);
    } finally {
      setIsSending(false);
    }
  };

  const getBadgeClass = (channels) => {
    const primary = channels[0];
    if (primary === 'email') return 'badge badge-success';
    if (primary === 'whatsapp') return 'badge badge-info';
    return 'badge badge-warning';
  };

  const getChannelLabel = (channels) => {
    const primary = channels[0];
    if (!primary) return 'Announcement';
    return primary.toUpperCase() + ' Sent';
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <div className="premium-card" style={{ padding: 28, display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 28 }}>
        
        {/* Templates Panel */}
        <form onSubmit={handleBroadcast} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div>
            <h3 style={{ fontSize: '0.95rem', fontWeight: 800 }}>Broadcast Systems</h3>
            <span style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)' }}>Send announcements or notifications across multiple gateways</span>
          </div>

          <div className="premium-form-group">
            <label className="premium-label">Select Gateway</label>
            <div style={{ display: 'flex', gap: 10, marginTop: 4 }}>
              {[
                { id: 'email', label: 'Email', icon: Mail },
                { id: 'sms', label: 'SMS', icon: Radio },
                { id: 'whatsapp', label: 'WhatsApp', icon: MessageSquare }
              ].map(gate => {
                const Icon = gate.icon;
                return (
                  <button
                    key={gate.id}
                    type="button"
                    onClick={() => setChannel(gate.id)}
                    className="premium-btn"
                    style={{
                      flex: 1,
                      padding: '12px 18px',
                      background: channel === gate.id ? 'var(--color-primary)' : 'rgba(0, 0, 0, 0.02)',
                      color: channel === gate.id ? '#ffffff' : 'var(--color-text-secondary)',
                      borderColor: channel === gate.id ? 'var(--color-primary)' : 'var(--color-border)',
                      transition: 'all 0.2s ease',
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px'
                    }}
                  >
                    <Icon size={14} />
                    <span>{gate.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="premium-form-group">
            <label className="premium-label">Template Preset</label>
            <select 
              value={template} 
              onChange={handleTemplateChange}
              className="premium-input"
            >
              <option value="welcome">Welcome Onboarding Message</option>
              <option value="holiday">Holiday Notice</option>
              <option value="payroll">Payroll Alert</option>
            </select>
          </div>

          <div className="premium-form-group">
            <label className="premium-label">Message Draft</label>
            <textarea 
              value={customMsg}
              onChange={(e) => setCustomMsg(e.target.value)}
              className="premium-input"
              rows={4}
              style={{ resize: 'none' }}
              placeholder="Enter message body here..."
              required
            />
          </div>

          <button type="submit" disabled={isSending} className="premium-btn premium-btn-primary" style={{ alignSelf: 'flex-start' }}>
            <Send size={14} />
            <span>{isSending ? 'Sending Announcement...' : 'Send Announcement'}</span>
          </button>
        </form>

        {/* Audit Announcement list */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <h3 style={{ fontSize: '0.95rem', fontWeight: 800 }}>Broadcast History</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12, maxHeight: '420px', overflowY: 'auto' }} className="premium-scrollbar">
            {loading && <div style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)' }}>Loading history...</div>}
            
            {!loading && history.length === 0 && (
              <div style={{ fontSize: '0.75rem', color: 'var(--color-text-tertiary)', padding: '20px 0', textAlign: 'center' }}>
                No broadcast history found.
              </div>
            )}

            {!loading && history.map(item => (
              <div key={item.id} style={{ padding: 14, borderRadius: 12, border: '1px solid #E2E8F0', background: '#F8FAFC' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span className={getBadgeClass(item.channels)}>{getChannelLabel(item.channels)}</span>
                  <span className="number-font" style={{ fontSize: '0.65rem', color: 'var(--color-text-tertiary)' }}>
                    {new Date(item.timestamp).toLocaleString()}
                  </span>
                </div>
                <p style={{ fontSize: '0.75rem', marginTop: 6, fontWeight: 500, color: 'var(--color-text-primary)', wordBreak: 'break-word', lineHeight: 1.4 }}>
                  "{item.title}"
                </p>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 8, fontSize: '0.65rem', color: 'var(--color-text-tertiary)' }}>
                  <span>Sent to: {item.target}</span>
                  <span>By: {item.senderName}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
