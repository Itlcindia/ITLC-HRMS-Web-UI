import React, { useState, useEffect } from 'react';
import { Settings, Save, Globe, Key, Clock, ShieldCheck, Phone, MapPin, Percent } from 'lucide-react';
import { api } from '../../services/api';
import { extractDominantColor } from '../../utils/theme';

const compressImage = (base64Str, maxWidth = 800, maxHeight = 800) => {
  return new Promise((resolve) => {
    if (!base64Str.startsWith('data:image/')) {
      resolve(base64Str);
      return;
    }
    const img = new Image();
    img.src = base64Str;
    img.onload = () => {
      const canvas = document.createElement('canvas');
      let width = img.width;
      let height = img.height;

      if (width > height) {
        if (width > maxWidth) {
          height = Math.round((height * maxWidth) / width);
          width = maxWidth;
        }
      } else {
        if (height > maxHeight) {
          width = Math.round((width * maxHeight) / height);
          height = maxHeight;
        }
      }

      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL('image/jpeg', 0.6));
      } else {
        resolve(base64Str);
      }
    };
    img.onerror = () => {
      resolve(base64Str);
    };
  });
};

export default function CompanySettings() {
  const [compName, setCompName] = useState('');
  const [compEmail, setCompEmail] = useState('');
  const [compLogo, setCompLogo] = useState('');
  const [themeColor, setThemeColor] = useState('#4F46E5');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [gst, setGst] = useState('');
  const [currency, setCurrency] = useState('USD ($)');
  const [smtpServer, setSmtpServer] = useState('smtp.sendgrid.net');
  const [smsGateway, setSmsGateway] = useState('https://api.twilio.com/2010-04-01');
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [profileSuccess, setProfileSuccess] = useState(false);
  const [lat, setLat] = useState('');
  const [lng, setLng] = useState('');
  const [radius, setRadius] = useState(500);
  const [workdayStart, setWorkdayStart] = useState('09:00');
  const [workdayEnd, setWorkdayEnd] = useState('17:00');
  const [branchHQCoordinates, setBranchHQCoordinates] = useState('San Francisco, CA');
  const [razorpayKeyId, setRazorpayKeyId] = useState('');
  const [razorpaySecret, setRazorpaySecret] = useState('');
  const [stripeSecretKey, setStripeSecretKey] = useState('');

  const [appModules, setAppModules] = useState({
    dashboard: true,
    attendance: true,
    leave: true,
    payroll: true,
    helpdesk: true,
    documents: true,
    assets: true,
    training: true
  });

  // Admin Profile states
  const [adminName, setAdminName] = useState('');
  const [adminPhone, setAdminPhone] = useState('');
  const [adminAvatar, setAdminAvatar] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordSaving, setPasswordSaving] = useState(false);

  useEffect(() => {
    const fetchDetails = async () => {
      try {
        const details = await api.getAdminCompany();
        if (details) {
          setCompName(details.name || '');
          setCompEmail(details.email || '');
          setCompLogo(details.logo || '');
          setThemeColor(details.themeColor || '#4F46E5');
          setPhone(details.phone || '');
          setAddress(details.address || '');
          setGst(details.gst || '');
          setCurrency(details.currency || 'USD');
          setLat(details.lat !== undefined && details.lat !== null ? details.lat.toString() : '');
          setLng(details.lng !== undefined && details.lng !== null ? details.lng.toString() : '');
          setRadius(details.radius !== undefined && details.radius !== null ? details.radius : 500);
          setWorkdayStart(details.workdayStart || '09:00');
          setWorkdayEnd(details.workdayEnd || '17:00');
          setBranchHQCoordinates(details.branchHQCoordinates || 'San Francisco, CA');
          setRazorpayKeyId(details.razorpayKeyId || '');
          setRazorpaySecret(details.razorpaySecret || '');
          setStripeSecretKey(details.stripeSecretKey || '');

          if (details.modulesEnabled) {
            try {
              const parsed = typeof details.modulesEnabled === 'string' ? JSON.parse(details.modulesEnabled) : details.modulesEnabled;
              setAppModules({
                dashboard: parsed.dashboard !== undefined ? parsed.dashboard : true,
                attendance: parsed.attendance !== undefined ? parsed.attendance : true,
                leave: parsed.leave !== undefined ? parsed.leave : true,
                payroll: parsed.payroll !== undefined ? parsed.payroll : true,
                helpdesk: parsed.helpdesk !== undefined ? parsed.helpdesk : true,
                documents: parsed.documents !== undefined ? parsed.documents : true,
                assets: parsed.assets !== undefined ? parsed.assets : true,
                training: parsed.training !== undefined ? parsed.training : true
              });
            } catch (e) {
              console.error("Failed to parse modulesEnabled:", e);
            }
          }
        }
      } catch (err) {
        console.error('Failed to load company details:', err);
      }

      try {
        const profile = await api.getProfile();
        if (profile) {
          setAdminName(profile.name || '');
          setAdminPhone(profile.phone || '');
          setAdminAvatar(profile.avatar || '');
        }
      } catch (err) {
        console.error('Failed to load admin profile:', err);
      }
    };
    fetchDetails();
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setSuccess(false);
    try {
      await api.updateAdminCompany({
        name: compName,
        email: compEmail,
        logo: compLogo,
        themeColor,
        phone,
        address,
        gst,
        currency,
        lat: lat === '' ? null : Number(lat),
        lng: lng === '' ? null : Number(lng),
        radius: radius === '' ? 500 : Number(radius),
        workdayStart,
        workdayEnd,
        branchHQCoordinates,
        razorpayKeyId,
        razorpaySecret,
        stripeSecretKey,
        modulesEnabled: JSON.stringify(appModules)
      });
      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        window.location.reload();
      }, 1000);
    } catch (err) {
      alert(err.message || 'Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  const handleSaveAdminProfile = async (e) => {
    e.preventDefault();
    setSaving(true);
    setProfileSuccess(false);
    try {
      await api.updateProfile({
        name: adminName,
        phone: adminPhone,
        avatar: adminAvatar
      });
      setProfileSuccess(true);
      setTimeout(() => {
        setProfileSuccess(false);
        window.location.reload();
      }, 1000);
    } catch (err) {
      alert(err.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const handleSavePassword = async (e) => {
    e.preventDefault();
    if (!newPassword) {
      alert('Please enter a new password');
      return;
    }
    if (newPassword !== confirmPassword) {
      alert('New passwords do not match');
      return;
    }
    setPasswordSaving(true);
    try {
      await api.changePassword({
        currentPassword,
        newPassword
      });
      alert('Password updated successfully!');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      alert(err.message || 'Failed to update password');
    } finally {
      setPasswordSaving(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {success && (
        <div style={{
          padding: '16px 20px',
          background: '#ECFDF5',
          border: '1px solid #A7F3D0',
          color: '#065F46',
          borderRadius: 16,
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          fontSize: '0.85rem',
          fontWeight: 650,
          boxShadow: '0 4px 12px rgba(16, 185, 129, 0.08)'
        }}>
          <ShieldCheck size={18} style={{ color: '#10B981', flexShrink: 0 }} />
          <span>Branding & Configuration parameters updated successfully! Syncing sidebars...</span>
        </div>
      )}
      <form onSubmit={handleSave} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: 24 }}>
        
        {/* Core Company Profile Settings */}
        <div className="premium-card" style={{ padding: 28, display: 'flex', flexDirection: 'column', gap: 16 }}>
          <h3 style={{ fontSize: '0.95rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: 8 }}>
            <Globe size={18} style={{ color: 'var(--color-primary)' }} />
            <span>Company Profile & Branding</span>
          </h3>

          <div className="premium-form-group">
            <label className="premium-label">Legal Entity / Workspace Name</label>
            <input 
              type="text" 
              required
              value={compName} 
              onChange={(e) => setCompName(e.target.value)} 
              className="premium-input" 
              placeholder="e.g. ITLC HRMS"
            />
          </div>

          <div className="premium-form-group">
            <label className="premium-label">Company Brand Logo</label>
            <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginTop: 4 }}>
              <div style={{
                width: 60,
                height: 60,
                borderRadius: 12,
                border: '1px dashed var(--color-border)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                overflow: 'hidden',
                backgroundColor: 'rgba(0,0,0,0.02)'
              }}>
                {compLogo && (compLogo.startsWith('data:image/') || compLogo.startsWith('http://') || compLogo.startsWith('https://')) ? (
                  <img src={compLogo} alt="Logo" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                ) : (
                  <span style={{ fontSize: '0.65rem', color: 'var(--color-text-secondary)' }}>No Logo</span>
                )}
              </div>
              <div style={{ flex: 1 }}>
                <input 
                  type="file" 
                  accept="image/*"
                  onChange={async (e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      const reader = new FileReader();
                      reader.onload = async (event) => {
                        const compressed = await compressImage(event.target.result, 240, 240);
                        setCompLogo(compressed);
                        try {
                          const extracted = await extractDominantColor(compressed);
                          setThemeColor(extracted);
                        } catch (err) {
                          console.error("Failed to extract theme color:", err);
                        }
                      };
                      reader.readAsDataURL(file);
                    }
                  }}
                  style={{ display: 'none' }}
                  id="company-logo-file"
                />
                <label 
                  htmlFor="company-logo-file"
                  style={{
                    display: 'inline-block',
                    padding: '6px 12px',
                    fontSize: '0.75rem',
                    fontWeight: 650,
                    borderRadius: 8,
                    border: '1px solid var(--color-border)',
                    backgroundColor: 'white',
                    cursor: 'pointer',
                    color: 'var(--color-text-secondary)'
                  }}
                  className="hover:bg-slate-50 transition-colors"
                >
                  Upload Logo
                </label>
                {compLogo && (
                  <button
                    type="button"
                    onClick={() => setCompLogo('')}
                    style={{
                      marginLeft: 8,
                      fontSize: '0.72rem',
                      color: '#EF4444',
                      fontWeight: 650,
                      cursor: 'pointer',
                      background: 'none',
                      border: 'none'
                    }}
                  >
                    Remove Logo
                  </button>
                )}
              </div>
            </div>
          </div>

          <div className="premium-form-group">
            <label className="premium-label">Workspace Primary Theme Color</label>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 4 }}>
              <input 
                type="color" 
                value={themeColor} 
                onChange={(e) => setThemeColor(e.target.value)} 
                style={{
                  width: 44,
                  height: 38,
                  padding: 2,
                  border: '1px solid var(--color-border)',
                  borderRadius: 8,
                  cursor: 'pointer',
                  backgroundColor: 'white'
                }}
              />
              <input 
                type="text" 
                value={themeColor} 
                onChange={(e) => setThemeColor(e.target.value)} 
                className="premium-input"
                style={{ width: 100, height: 38, fontSize: '0.82rem', textAlign: 'center' }}
                placeholder="#4F46E5"
              />
              <span style={{ fontSize: '0.72rem', color: 'var(--color-text-secondary)' }}>
                Auto-extracted from your logo or customized manually.
              </span>
            </div>
          </div>

          <div className="premium-form-group">
            <label className="premium-label">Contact Email (Linked Account)</label>
            <input 
              type="email" 
              disabled
              readOnly
              value={compEmail} 
              className="premium-input bg-slate-100/50 cursor-not-allowed" 
            />
          </div>

          <div className="premium-form-group">
            <label className="premium-label">Contact Phone</label>
            <input 
              type="text" 
              value={phone} 
              onChange={(e) => setPhone(e.target.value)} 
              className="premium-input" 
              placeholder="Company phone number"
            />
          </div>

          <div className="premium-form-group">
            <label className="premium-label">Tax ID / GST Details</label>
            <input 
              type="text" 
              value={gst} 
              onChange={(e) => setGst(e.target.value)} 
              className="premium-input" 
              placeholder="GSTIN Number"
            />
          </div>

          <div className="premium-form-group">
            <label className="premium-label">Office Address</label>
            <textarea 
              value={address} 
              onChange={(e) => setAddress(e.target.value)} 
              className="premium-input resize-none" 
              rows={2}
              placeholder="Entity address details"
            />
          </div>

          <div className="premium-form-group">
            <label className="premium-label">System Currency</label>
            <select
              value={currency}
              onChange={(e) => setCurrency(e.target.value)}
              className="premium-input"
            >
              <option value="USD">USD ($)</option>
              <option value="INR">INR (₹)</option>
              <option value="EUR">EUR (€)</option>
              <option value="GBP">GBP (£)</option>
              <option value="JPY">JPY (¥)</option>
            </select>
          </div>

          <h3 style={{ fontSize: '0.85rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: 8, marginTop: 12, borderTop: '1px solid rgba(226, 232, 240, 0.2)', paddingTop: 16 }}>
            <MapPin size={16} style={{ color: 'var(--color-primary)' }} />
            <span>Geofencing Attendance Restriction</span>
          </h3>

          <div style={{ display: 'flex', gap: 12 }}>
            <div className="premium-form-group" style={{ flex: 1 }}>
              <label className="premium-label">Office Latitude</label>
              <input 
                type="number" 
                step="any"
                value={lat} 
                onChange={(e) => setLat(e.target.value)} 
                className="premium-input" 
                placeholder="e.g. 28.6139"
              />
            </div>
            <div className="premium-form-group" style={{ flex: 1 }}>
              <label className="premium-label">Office Longitude</label>
              <input 
                type="number" 
                step="any"
                value={lng} 
                onChange={(e) => setLng(e.target.value)} 
                className="premium-input" 
                placeholder="e.g. 77.2090"
              />
            </div>
          </div>

          <div className="premium-form-group">
            <label className="premium-label">Permitted Radius (in meters)</label>
            <input 
              type="number" 
              value={radius} 
              onChange={(e) => setRadius(e.target.value === '' ? '' : Number(e.target.value))} 
              className="premium-input" 
              placeholder="e.g. 500"
            />
          </div>

          <button
            type="button"
            onClick={() => {
              if (navigator.geolocation) {
                navigator.geolocation.getCurrentPosition(
                  (pos) => {
                    setLat(pos.coords.latitude.toString());
                    setLng(pos.coords.longitude.toString());
                    alert("Location captured successfully!");
                  },
                  (err) => {
                    alert("Failed to capture location: " + err.message);
                  }
                );
              } else {
                alert("Geolocation is not supported by your browser.");
              }
            }}
            className="btn btn-secondary cursor-pointer"
            style={{ padding: '8px 12px', fontSize: '0.75rem', alignSelf: 'flex-start', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', borderRadius: 8 }}
          >
            📍 Use My Current Location
          </button>
        </div>

        {/* Admin Profile Settings */}
        <div className="premium-card" style={{ padding: 28, display: 'flex', flexDirection: 'column', gap: 16 }}>
          <h3 style={{ fontSize: '0.95rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: 8 }}>
            <Globe size={18} style={{ color: 'var(--color-primary)' }} />
            <span>My Profile Settings</span>
          </h3>

          {profileSuccess && (
            <div style={{
              padding: '12px 16px',
              background: '#ECFDF5',
              border: '1px solid #A7F3D0',
              color: '#065F46',
              borderRadius: 12,
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              fontSize: '0.82rem',
              fontWeight: 650
            }}>
              <ShieldCheck size={16} style={{ color: '#10B981', flexShrink: 0 }} />
              <span>Your profile photo and information have been updated successfully!</span>
            </div>
          )}

          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12, marginBottom: 12 }}>
            <div style={{
              width: 80,
              height: 80,
              borderRadius: '50%',
              background: '#f1f5f9',
              border: '1px solid #cbd5e1',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              overflow: 'hidden'
            }}>
              {adminAvatar ? (
                <img src={adminAvatar} alt="Admin avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              ) : (
                <span style={{ fontSize: '2rem', fontWeight: 'bold', color: '#64748b' }}>A</span>
              )}
            </div>
            <input 
              type="file" 
              accept="image/*" 
              id="admin-avatar-file" 
              style={{ display: 'none' }} 
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) {
                  const reader = new FileReader();
                  reader.onloadend = async () => {
                    if (typeof reader.result === 'string') {
                      const compressed = await compressImage(reader.result);
                      setAdminAvatar(compressed);
                    }
                  };
                  reader.readAsDataURL(file);
                }
              }}
            />
            <label htmlFor="admin-avatar-file" style={{ fontSize: '0.75rem', fontWeight: 'bold', color: 'var(--color-primary)', cursor: 'pointer' }}>
              📷 Upload Photo
            </label>
          </div>

          <div className="premium-form-group">
            <label className="premium-label">Admin Name</label>
            <input 
              type="text" 
              required
              value={adminName} 
              onChange={(e) => setAdminName(e.target.value)} 
              className="premium-input" 
              placeholder="e.g. Administrator"
            />
          </div>

          <div className="premium-form-group">
            <label className="premium-label">Admin Phone</label>
            <input 
              type="text" 
              value={adminPhone} 
              onChange={(e) => setAdminPhone(e.target.value)} 
              className="premium-input" 
              placeholder="Admin phone number"
            />
          </div>

          <div style={{ marginTop: 12, borderTop: '1px solid rgba(226, 232, 240, 0.4)', paddingTop: 16 }}>
            <h4 style={{ fontSize: '0.8rem', fontWeight: 800, marginBottom: 12, color: 'var(--color-text-secondary)' }}>Update Profile Password</h4>
            
            <div className="premium-form-group">
              <label className="premium-label">Current Password</label>
              <input 
                type="password" 
                value={currentPassword} 
                onChange={(e) => setCurrentPassword(e.target.value)} 
                className="premium-input" 
                placeholder="Enter current password"
              />
            </div>

            <div className="premium-form-group">
              <label className="premium-label">New Password</label>
              <input 
                type="password" 
                value={newPassword} 
                onChange={(e) => setNewPassword(e.target.value)} 
                className="premium-input" 
                placeholder="Enter new password"
              />
            </div>

            <div className="premium-form-group">
              <label className="premium-label">Confirm New Password</label>
              <input 
                type="password" 
                value={confirmPassword} 
                onChange={(e) => setConfirmPassword(e.target.value)} 
                className="premium-input" 
                placeholder="Re-type new password"
              />
            </div>
            
            <button 
              type="button" 
              onClick={handleSavePassword} 
              disabled={passwordSaving}
              className="premium-btn premium-btn-secondary" 
              style={{ padding: '8px 16px', width: '100%', justifyContent: 'center', marginTop: 8 }}
            >
              <span>{passwordSaving ? 'Updating Password...' : 'Update Password'}</span>
            </button>
          </div>

          <button type="button" onClick={handleSaveAdminProfile} className="premium-btn premium-btn-primary" style={{ padding: '10px 20px', width: '100%', justifyContent: 'center', marginTop: 10 }}>
            <span>Save My Profile</span>
          </button>
        </div>

        {/* Gateways & Integrations Config */}
        <div className="premium-card" style={{ padding: 28, display: 'flex', flexDirection: 'column', gap: 16 }}>
          <h3 style={{ fontSize: '0.95rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: 8 }}>
            <Key size={18} style={{ color: 'var(--color-accent)' }} />
            <span>Gateways & API Credentials</span>
          </h3>

          <div className="premium-form-group">
            <label className="premium-label">SMTP Server Host</label>
            <input 
              type="text" 
              required
              value={smtpServer} 
              onChange={(e) => setSmtpServer(e.target.value)} 
              className="premium-input" 
            />
          </div>

          <div className="premium-form-group">
            <label className="premium-label">SMS Gateway API Root</label>
            <input 
              type="text" 
              required
              value={smsGateway} 
              onChange={(e) => setSmsGateway(e.target.value)} 
              className="premium-input" 
            />
          </div>

          <div className="premium-form-group">
            <label className="premium-label">WhatsApp Cloud Business API Key</label>
            <input 
              type="password" 
              defaultValue="••••••••••••••••••••••••••••••••" 
              disabled
              className="premium-input" 
            />
          </div>

          <div style={{ marginTop: 8, borderTop: '1px solid var(--color-border)', paddingTop: 16 }}>
            <h4 style={{ fontSize: '0.8rem', fontWeight: 800, marginBottom: 12, color: 'var(--color-text-secondary)' }}>Tenant Custom Payment Gateway Settings</h4>
            
            <div className="premium-form-group">
              <label className="premium-label">Razorpay Key ID</label>
              <input 
                type="text" 
                value={razorpayKeyId} 
                onChange={(e) => setRazorpayKeyId(e.target.value)} 
                className="premium-input" 
                placeholder="rzp_live_..."
              />
            </div>

            <div className="premium-form-group">
              <label className="premium-label">Razorpay Key Secret</label>
              <input 
                type="password" 
                value={razorpaySecret} 
                onChange={(e) => setRazorpaySecret(e.target.value)} 
                className="premium-input" 
                placeholder="Key Secret (if overriding default)"
              />
            </div>

            <div className="premium-form-group">
              <label className="premium-label">Stripe Secret Key</label>
              <input 
                type="password" 
                value={stripeSecretKey} 
                onChange={(e) => setStripeSecretKey(e.target.value)} 
                className="premium-input" 
                placeholder="sk_live_..."
              />
            </div>
          </div>
        </div>

        {/* Mobile App & Employee Portal Sections Configuration */}
        <div className="premium-card" style={{ padding: 28, display: 'flex', flexDirection: 'column', gap: 16 }}>
          <h3 style={{ fontSize: '0.95rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: 8 }}>
            <Settings size={18} style={{ color: 'var(--color-primary)' }} />
            <span>Mobile App & Employee Portal Sections</span>
          </h3>
          <p style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)' }}>Toggle which tabs are visible inside the Employee Mobile App & Portal.</p>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginTop: 8 }}>
            {[
              { key: 'dashboard', label: '📊 Dashboard Overview' },
              { key: 'attendance', label: '⏰ Attendance & Clock In/Out' },
              { key: 'leave', label: '📅 Leave & Holidays' },
              { key: 'payroll', label: '💵 Payroll & Payslips' },
              { key: 'helpdesk', label: '🎫 Helpdesk & Tickets' },
              { key: 'documents', label: '📁 Documents Vault' },
              { key: 'assets', label: '💻 Hardware Assets' },
              { key: 'training', label: '🎓 Training & Courses' }
            ].map(mod => (
              <label 
                key={mod.key} 
                style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: 10, 
                  fontSize: '0.8rem', 
                  fontWeight: 600, 
                  cursor: 'pointer',
                  padding: '8px 12px',
                  borderRadius: 8,
                  backgroundColor: 'rgba(255,255,255,0.02)',
                  border: '1px solid var(--color-border)',
                  userSelect: 'none'
                }}
              >
                <input 
                  type="checkbox" 
                  checked={appModules[mod.key]} 
                  onChange={(e) => setAppModules({ ...appModules, [mod.key]: e.target.checked })} 
                  style={{ width: 15, height: 15, accentColor: 'var(--color-primary)' }}
                />
                <span>{mod.label}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Working Hours settings */}
        <div className="premium-card" style={{ padding: 28, display: 'flex', flexDirection: 'column', gap: 20, gridColumn: '1 / -1' }}>
          <div style={{ display: 'flex', gap: 16, flexDirection: 'row' }}>
            <div style={{ flex: 1 }}>
              <h3 style={{ fontSize: '0.95rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: 8 }}>
                <Clock size={18} style={{ color: 'var(--color-warning)' }} />
                <span>Working Hours & Branches</span>
              </h3>
              <p style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)', marginTop: 4 }}>Set standard work durations and branch operating parameters.</p>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16, flex: 2 }}>
              <div className="premium-form-group">
                <label className="premium-label">Standard Workday Start</label>
                <input type="time" value={workdayStart} onChange={(e) => setWorkdayStart(e.target.value)} className="premium-input" />
              </div>
              <div className="premium-form-group">
                <label className="premium-label">Standard Workday End</label>
                <input type="time" value={workdayEnd} onChange={(e) => setWorkdayEnd(e.target.value)} className="premium-input" />
              </div>
              <div className="premium-form-group">
                <label className="premium-label">Branch HQ Coordinates</label>
                <input type="text" value={branchHQCoordinates} onChange={(e) => setBranchHQCoordinates(e.target.value)} className="premium-input" />
              </div>
              <div style={{ gridColumn: 'span 3', padding: '10px 14px', background: 'rgba(16, 185, 129, 0.08)', borderRadius: 8, border: '1px solid rgba(16, 185, 129, 0.2)', fontSize: '0.8rem', color: '#059669', display: 'flex', alignItems: 'center', gap: 8 }}>
                <span>🔔</span>
                <span><strong>Automated Shift Attendance Reminders Active:</strong> Employees receive check-in reminders at Start time and punch-out reminders at End time.</span>
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', borderTop: '1px solid rgba(226,232,240,0.6)', paddingTop: 16 }}>
            <button type="submit" disabled={saving} className="premium-btn premium-btn-primary" style={{ padding: '10px 24px', display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
              {saving ? (
                <div style={{ width: 14, height: 14, border: '2px solid white', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
              ) : (
                <Save size={16} />
              )}
              <span>{saving ? 'Saving...' : 'Save System Settings'}</span>
            </button>
          </div>
        </div>

      </form>
    </div>
  );
}
