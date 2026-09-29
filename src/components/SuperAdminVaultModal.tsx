import React, { useState } from 'react';
import { ShieldCheck, Lock, KeyRound, ArrowRight, X } from 'lucide-react';

interface SuperAdminVaultModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  triggerToast: (msg: string) => void;
}

export const SuperAdminVaultModal: React.FC<SuperAdminVaultModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  triggerToast
}) => {
  const [pin, setPin] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (pin === '1234') {
      setErrorMsg('');
      setPin('');
      triggerToast("👑 Master Super Admin Vault Unlocked!");
      onSuccess();
    } else {
      setErrorMsg('Incorrect Master Security PIN. Access Denied.');
      triggerToast("❌ Incorrect Master Security PIN.");
    }
  };

  return (
    <div className="itlc-modal-overlay" style={{ zIndex: 999999 }}>
      <div className="super-vault-modal-card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div className="super-vault-icon-badge">
              <Lock size={20} color="#f59e0b" />
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 900, color: '#f8fafc' }}>
                Master Governance Vault
              </h3>
              <span style={{ fontSize: '11px', color: '#94a3b8' }}>
                Restricted Super Admin Stealth Gateway
              </span>
            </div>
          </div>

          <button className="modal-close-btn" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <p style={{ fontSize: '13px', color: '#94a3b8', lineHeight: 1.5, marginBottom: '20px' }}>
          Please enter the Master Security PIN to access cross-tenant subscription management, client feature flags, and multi-company operations.
        </p>

        <form onSubmit={handleSubmit}>
          <div className="form-group" style={{ marginBottom: '16px' }}>
            <label style={{ fontSize: '12px', fontWeight: 700, color: '#cbd5e1' }}>
              Master Security PIN
            </label>
            <div style={{ position: 'relative', marginTop: '6px' }}>
              <input 
                type="password"
                className="super-vault-input"
                placeholder="Enter 4-digit PIN (Default: 1234)"
                autoFocus
                maxLength={8}
                value={pin}
                onChange={(e) => {
                  setPin(e.target.value);
                  setErrorMsg('');
                }}
              />
              <KeyRound size={18} color="#64748b" style={{ position: 'absolute', right: '12px', top: '12px' }} />
            </div>
            {errorMsg && (
              <span style={{ fontSize: '12px', color: '#ef4444', marginTop: '6px', display: 'block', fontWeight: 600 }}>
                {errorMsg}
              </span>
            )}
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '24px' }}>
            <span style={{ fontSize: '11px', color: '#64748b' }}>
              Default PIN: <code style={{ color: '#f59e0b' }}>1234</code>
            </span>

            <button 
              type="submit" 
              className="btn btn-primary super-btn-confirm"
              style={{ padding: '10px 24px', fontSize: '13px', gap: '8px' }}
            >
              <span>Unlock Master Panel</span>
              <ArrowRight size={15} />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
