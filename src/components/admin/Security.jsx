import React, { useState, useEffect } from 'react';
import { Shield, Eye, Trash2, Key, ToggleLeft, ToggleRight, ShieldAlert } from 'lucide-react';
import { api } from '../../services/api';

const mockAuditLogs = [
  { id: 1, action: 'Workspace Admin Access Enabled', user: 'System Initializer', ip: '127.0.0.1', date: 'Just now', status: 'Success' }
];

export default function Security() {
  const [twoFactor, setTwoFactor] = useState(true);
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        const data = await api.getAdminAuditLogs();
        if (data && data.length > 0) {
          setLogs(data.map((l) => ({
            id: l.id,
            action: l.action,
            user: l.actorName || 'System',
            ip: l.details?.match(/\b(?:\d{1,3}\.){3}\d{1,3}\b/) ? l.details.match(/\b(?:\d{1,3}\.){3}\d{1,3}\b/)[0] : '127.0.0.1',
            date: new Date(l.timestamp).toLocaleString(),
            status: l.category === 'Security' || l.category === 'Billing' ? 'Warning' : 'Success'
          })));
        } else {
          setLogs([]);
        }
      } catch (err) {
        console.error("Failed to load audit logs:", err);
        setLogs([]);
      } finally {
        setLoading(false);
      }
    };
    fetchLogs();
  }, []);

  const revokeSession = (ip) => {
    alert(`Active session on device IP: ${ip} was revoked.`);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      
      {/* Roles & 2FA control cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: 24 }}>
        
        {/* Roles and permissions config */}
        <div className="premium-card" style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 16 }}>
          <h3 style={{ fontSize: '0.95rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: 8 }}>
            <Shield size={18} style={{ color: 'var(--color-primary)' }} />
            <span>Roles & Portal Permissions</span>
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, fontSize: '0.8rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid #F1F5F9' }}>
              <span>Company Admin permissions (All access)</span>
              <input type="checkbox" defaultChecked style={{ accentColor: 'var(--color-primary)' }} />
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid #F1F5F9' }}>
              <span>HR Manager permissions (Edit details, View Payroll)</span>
              <input type="checkbox" defaultChecked style={{ accentColor: 'var(--color-primary)' }} />
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0' }}>
              <span>Employee permissions (Clock-in, Request Leaves only)</span>
              <input type="checkbox" defaultChecked style={{ accentColor: 'var(--color-primary)' }} />
            </div>
          </div>
        </div>

        {/* 2FA & Password policy */}
        <div className="premium-card" style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 16 }}>
          <h3 style={{ fontSize: '0.95rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: 8 }}>
            <Key size={18} style={{ color: 'var(--color-accent)' }} />
            <span>2FA & Auth Security Policy</span>
          </h3>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: '1px solid #F1F5F9' }}>
            <div>
              <div style={{ fontSize: '0.85rem', fontWeight: 700 }}>Mandatory Multi-Factor (MFA)</div>
              <span style={{ fontSize: '0.7rem', color: 'var(--color-text-secondary)' }}>Enforce SMS or Authenticator app codes for all staff logins.</span>
            </div>
            <button 
              onClick={() => setTwoFactor(!twoFactor)}
              style={{ border: 'none', background: 'transparent', cursor: 'pointer', color: twoFactor ? 'var(--color-success)' : 'var(--color-text-tertiary)' }}
            >
              {twoFactor ? <ToggleRight size={38} /> : <ToggleLeft size={38} />}
            </button>
          </div>

          <div className="premium-form-group" style={{ marginBottom: 0 }}>
            <label className="premium-label">Minimum password character length</label>
            <select className="premium-input" style={{ padding: 8, marginTop: 4 }}>
              <option value="8">8 characters</option>
              <option value="12">12 characters (Recommended)</option>
              <option value="16">16 characters</option>
            </select>
          </div>
        </div>
      </div>

      {/* Audit Log Table */}
      <div className="premium-card" style={{ padding: 24 }}>
        <h3 style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
          <ShieldAlert size={18} style={{ color: 'var(--color-danger)' }} />
          <span>Security Audit Trail Logs</span>
        </h3>
        <div className="premium-table-container">
          <table className="premium-table">
            <thead>
              <tr>
                <th>Operation / Log</th>
                <th>Author</th>
                <th>IP address</th>
                <th>Timestamp</th>
                <th>Severity</th>
              </tr>
            </thead>
            <tbody>
              {logs.map((log) => (
                <tr key={log.id}>
                  <td style={{ fontWeight: 600, fontSize: '0.8rem' }}>{log.action}</td>
                  <td>{log.user}</td>
                  <td className="number-font">{log.ip}</td>
                  <td className="number-font" style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)' }}>{log.date}</td>
                  <td>
                    <span className={`badge ${log.status === 'Success' ? 'badge-success' : 'badge-warning'}`}>
                      {log.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
