import React from 'react';
import { 
  Briefcase, 
  Users, 
  ArrowRight, 
  Sparkles, 
  ShieldCheck, 
  CheckCircle2, 
  LogOut, 
  TrendingUp, 
  DollarSign, 
  Clock, 
  MapPin, 
  Receipt,
  Layers,
  Crown,
  UserCheck
} from 'lucide-react';

export interface UserSessionProfile {
  name: string;
  email: string;
  role: string;
  companyName?: string;
  avatar?: string;
}

interface WorkspaceChoiceModalProps {
  isOpen: boolean;
  user: UserSessionProfile;
  onSelectCRM: () => void;
  onSelectHRMS: () => void;
  onLogout: () => void;
  lang?: 'en' | 'hi';
}

export const WorkspaceChoiceModal: React.FC<WorkspaceChoiceModalProps> = ({
  isOpen,
  user,
  onSelectCRM,
  onSelectHRMS,
  onLogout,
  lang = 'en'
}) => {
  if (!isOpen) return null;

  const isOwner = user.role.toLowerCase().includes('admin') || user.role.toLowerCase().includes('owner') || user.role.toLowerCase().includes('director');
  const isManager = user.role.toLowerCase().includes('manager') || user.role.toLowerCase().includes('lead');
  const isEmployee = !isOwner && !isManager;

  const getRoleLabel = () => {
    if (isOwner) return { label: 'Company Owner / Super Admin', icon: Crown, color: '#f59e0b' };
    if (isManager) return { label: 'Department / Sales Manager', icon: UserCheck, color: '#6366f1' };
    return { label: 'Employee / Field Sales Rep', icon: Users, color: '#10b981' };
  };

  const roleInfo = getRoleLabel();
  const RoleIcon = roleInfo.icon;

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      zIndex: 99999,
      backgroundColor: 'rgba(15, 23, 42, 0.75)',
      backdropFilter: 'blur(16px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px',
      animation: 'fadeIn 0.25s ease-out'
    }}>
      <div style={{
        background: '#ffffff',
        borderRadius: '24px',
        maxWidth: '900px',
        width: '100%',
        boxShadow: '0 25px 50px -12px rgba(15, 23, 42, 0.35)',
        border: '1px solid rgba(226, 232, 240, 0.9)',
        overflow: 'hidden',
        position: 'relative'
      }}>
        
        {/* Top Gradient Header */}
        <div style={{
          background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #312e81 100%)',
          padding: '28px 32px',
          color: '#ffffff',
          position: 'relative',
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '16px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{
              width: '56px',
              height: '56px',
              borderRadius: '16px',
              background: 'linear-gradient(135deg, #4f46e5, #06b6d4)',
              color: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '22px',
              fontWeight: 900,
              boxShadow: '0 8px 20px rgba(79, 70, 229, 0.4)',
              border: '2px solid rgba(255, 255, 255, 0.2)'
            }}>
              {user.avatar || user.name.slice(0, 2).toUpperCase()}
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <h3 style={{ fontSize: '20px', fontWeight: 900, margin: 0, color: '#ffffff' }}>
                  {`Welcome, ${user.name}`}
                </h3>
                <span style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px',
                  padding: '3px 10px',
                  borderRadius: '20px',
                  background: 'rgba(255, 255, 255, 0.12)',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  fontSize: '11px',
                  fontWeight: 700,
                  color: roleInfo.color
                }}>
                  <RoleIcon size={12} />
                  {roleInfo.label}
                </span>
              </div>
              <p style={{ fontSize: '13px', color: '#cbd5e1', margin: '4px 0 0 0' }}>
                🏢 {user.companyName || 'Enterprise Cloud Workspace'} • {user.email}
              </p>
            </div>
          </div>

          <button
            onClick={onLogout}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '8px 16px',
              borderRadius: '10px',
              background: 'rgba(239, 68, 68, 0.15)',
              border: '1px solid rgba(239, 68, 68, 0.4)',
              color: '#fca5a5',
              fontSize: '12px',
              fontWeight: 700,
              cursor: 'pointer',
              transition: 'all 0.15s ease'
            }}
            onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(239, 68, 68, 0.25)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(239, 68, 68, 0.15)'; }}
          >
            <LogOut size={14} />
            <span>{'Sign Out'}</span>
          </button>
        </div>

        {/* Modal Body: Workspace Selection Cards */}
        <div style={{ padding: '32px' }}>
          
          <div style={{ textAlign: 'center', marginBottom: '28px' }}>
            <span style={{
              fontSize: '11px',
              fontWeight: 800,
              textTransform: 'uppercase',
              letterSpacing: '1px',
              color: '#4f46e5',
              background: '#e0e7ff',
              padding: '4px 12px',
              borderRadius: '20px',
              display: 'inline-block',
              marginBottom: '8px'
            }}>
              {'SELECT DESTINATION'}
            </span>
            <h2 style={{ fontSize: '24px', fontWeight: 900, color: '#0f172a', margin: '0 0 6px 0' }}>
              {'Where would you like to work today?'}
            </h2>
            <p style={{ fontSize: '14px', color: '#64748b', margin: 0 }}>
              {'Select either Sales CRM or HRMS. You can seamlessly switch between them anytime.'}
            </p>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))',
            gap: '24px'
          }}>
            
            {/* OPTION 1: ITLC SALES CRM */}
            <div 
              style={{
                borderRadius: '20px',
                border: '2px solid #e2e8f0',
                background: '#ffffff',
                padding: '24px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                transition: 'all 0.25s ease',
                cursor: 'pointer',
                boxShadow: '0 4px 16px rgba(0, 0, 0, 0.04)',
                position: 'relative',
                overflow: 'hidden'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = '#2563eb';
                e.currentTarget.style.transform = 'translateY(-4px)';
                e.currentTarget.style.boxShadow = '0 16px 32px rgba(37, 99, 235, 0.15)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = '#e2e8f0';
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 4px 16px rgba(0, 0, 0, 0.04)';
              }}
              onClick={onSelectCRM}
            >
              <div style={{ position: 'absolute', top: 0, right: 0, width: '120px', height: '120px', background: 'radial-gradient(circle, rgba(37,99,235,0.08) 0%, transparent 70%)', pointerEvents: 'none' }} />

              <div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                  <div style={{
                    width: '48px',
                    height: '48px',
                    borderRadius: '14px',
                    background: 'linear-gradient(135deg, #2563eb, #1d4ed8)',
                    color: '#ffffff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: '0 6px 16px rgba(37, 99, 235, 0.3)'
                  }}>
                    <Briefcase size={24} />
                  </div>
                  <span style={{ fontSize: '11px', fontWeight: 800, color: '#2563eb', background: '#eff6ff', padding: '4px 10px', borderRadius: '12px', border: '1px solid #bfdbfe' }}>
                    REVENUE & SALES
                  </span>
                </div>

                <h3 style={{ fontSize: '19px', fontWeight: 900, color: '#0f172a', margin: '0 0 6px 0' }}>
                  ITLC Sales CRM Cloud
                </h3>
                <p style={{ fontSize: '13px', color: '#64748b', lineHeight: 1.5, margin: '0 0 18px 0' }}>
                  {isOwner && "Full control over leads funnel, deals Kanban, GST tax billing, sales targets & AI forecasting."}
                  {isManager && "Team pipeline supervision, lead delegation, deal approvals & sales commissions simulator."}
                  {isEmployee && "My assigned leads, quick follow-up calls, WhatsApp proposals & daily sales targets."}
                </p>

                <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: '14px', marginBottom: '20px' }}>
                  <span style={{ fontSize: '11px', fontWeight: 800, color: '#334155', textTransform: 'uppercase', letterSpacing: '0.5px', display: 'block', marginBottom: '10px' }}>
                    {'Role-Tailored Features:'}
                  </span>
                  <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <li style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', color: '#475569' }}>
                      <CheckCircle2 size={14} color="#2563eb" />
                      <span>{isOwner ? 'Executive Sales Analytics & Revenue Radar' : 'Interactive Deals Kanban Pipeline'}</span>
                    </li>
                    <li style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', color: '#475569' }}>
                      <CheckCircle2 size={14} color="#2563eb" />
                      <span>{isOwner ? '18% GST Compliant Invoices & Quotes' : 'WhatsApp & Email Broadcast Engine'}</span>
                    </li>
                    <li style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', color: '#475569' }}>
                      <CheckCircle2 size={14} color="#2563eb" />
                      <span>{isEmployee ? 'Field Rep GPS Route & Lead Calling' : 'AI Sales Assistant & Leaderboards'}</span>
                    </li>
                  </ul>
                </div>
              </div>

              <button
                type="button"
                style={{
                  width: '100%',
                  padding: '14px',
                  borderRadius: '12px',
                  border: 'none',
                  background: 'linear-gradient(135deg, #2563eb, #1d4ed8)',
                  color: '#ffffff',
                  fontWeight: 800,
                  fontSize: '14px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  cursor: 'pointer',
                  boxShadow: '0 8px 20px rgba(37, 99, 235, 0.25)'
                }}
              >
                <span>{'Launch Sales CRM'}</span>
                <ArrowRight size={16} />
              </button>
            </div>

            {/* OPTION 2: OMNISTAFF ENTERPRISE HRMS */}
            <div 
              style={{
                borderRadius: '20px',
                border: '2px solid #e2e8f0',
                background: '#ffffff',
                padding: '24px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                transition: 'all 0.25s ease',
                cursor: 'pointer',
                boxShadow: '0 4px 16px rgba(0, 0, 0, 0.04)',
                position: 'relative',
                overflow: 'hidden'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = '#4f46e5';
                e.currentTarget.style.transform = 'translateY(-4px)';
                e.currentTarget.style.boxShadow = '0 16px 32px rgba(79, 70, 229, 0.15)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = '#e2e8f0';
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 4px 16px rgba(0, 0, 0, 0.04)';
              }}
              onClick={onSelectHRMS}
            >
              <div style={{ position: 'absolute', top: 0, right: 0, width: '120px', height: '120px', background: 'radial-gradient(circle, rgba(79,70,229,0.08) 0%, transparent 70%)', pointerEvents: 'none' }} />

              <div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                  <div style={{
                    width: '48px',
                    height: '48px',
                    borderRadius: '14px',
                    background: 'linear-gradient(135deg, #4f46e5, #6366f1)',
                    color: '#ffffff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: '0 6px 16px rgba(79, 70, 229, 0.3)'
                  }}>
                    <Users size={24} />
                  </div>
                  <span style={{ fontSize: '11px', fontWeight: 800, color: '#4f46e5', background: '#e0e7ff', padding: '4px 10px', borderRadius: '12px', border: '1px solid #c7d2fe' }}>
                    WORKFORCE & HR
                  </span>
                </div>

                <h3 style={{ fontSize: '19px', fontWeight: 900, color: '#0f172a', margin: '0 0 6px 0' }}>
                  OmniStaff Enterprise HRMS
                </h3>
                <p style={{ fontSize: '13px', color: '#64748b', lineHeight: 1.5, margin: '0 0 18px 0' }}>
                  {isOwner && "Global workforce management, payroll compliance, live biometric radar, shifts & leave policies."}
                  {isManager && "Department shift rosters, attendance approvals, team leave requests & performance reviews."}
                  {isEmployee && "My 1-click biometric attendance punch, apply for leaves, download salary slips & company docs."}
                </p>

                <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: '14px', marginBottom: '20px' }}>
                  <span style={{ fontSize: '11px', fontWeight: 800, color: '#334155', textTransform: 'uppercase', letterSpacing: '0.5px', display: 'block', marginBottom: '10px' }}>
                    {'Role-Tailored Features:'}
                  </span>
                  <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <li style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', color: '#475569' }}>
                      <CheckCircle2 size={14} color="#4f46e5" />
                      <span>{isOwner ? 'Live Biometric Radar & Geofence Punch' : '1-Click Attendance & Shift Punching'}</span>
                    </li>
                    <li style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', color: '#4f46e5' }}>
                      <CheckCircle2 size={14} color="#4f46e5" />
                      <span>{isOwner ? 'Automated Payroll, EPF & Tax Slips' : 'Leave Applications & Approvals Flow'}</span>
                    </li>
                    <li style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', color: '#4f46e5' }}>
                      <CheckCircle2 size={14} color="#4f46e5" />
                      <span>{isOwner ? 'Organization Hierarchy & Permissions' : 'Document Vault & Company Handbook'}</span>
                    </li>
                  </ul>
                </div>
              </div>

              <button
                type="button"
                style={{
                  width: '100%',
                  padding: '14px',
                  borderRadius: '12px',
                  border: 'none',
                  background: 'linear-gradient(135deg, #4f46e5, #6366f1)',
                  color: '#ffffff',
                  fontWeight: 800,
                  fontSize: '14px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  cursor: 'pointer',
                  boxShadow: '0 8px 20px rgba(79, 70, 229, 0.25)'
                }}
              >
                <span>{'Launch OmniStaff HRMS'}</span>
                <ArrowRight size={16} />
              </button>
            </div>

          </div>

          {/* Footer Note */}
          <div style={{
            marginTop: '28px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            fontSize: '12px',
            color: '#64748b'
          }}>
            <ShieldCheck size={16} color="#10b981" />
            <span>256-Bit SSO Token Authentication • Secure Partitioned Session</span>
          </div>

        </div>

      </div>
    </div>
  );
};
