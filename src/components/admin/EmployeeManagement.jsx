import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { api } from '../../services/api';
import { 
  Plus, Search, Edit3, Trash2, ShieldCheck, ShieldAlert, Download, 
  Upload, X, Check, FileText, Image, Mail, Phone, MapPin, ArrowLeft,
  Key, User, Users, Calendar, Briefcase, DollarSign, Award, Star, Clock, Laptop, Eye, EyeOff, Camera
} from 'lucide-react';
import { compressImage } from '../../utils/imageCompressor';

const AdminDocumentPreviewer = ({ doc, profile }) => {
  if (!doc) return null;

  // 1. User uploaded custom Image
  if (doc.fileData && doc.fileData.startsWith("data:image")) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.02)', padding: 16, borderRadius: 12, border: '1px solid var(--color-border)', width: '100%', height: '100%' }}>
        <img src={doc.fileData} alt={doc.name} style={{ maxHeight: '100%', maxWidth: '100%', objectFit: 'contain', borderRadius: 8, boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }} />
      </div>
    );
  }

  // 2. User uploaded custom PDF
  if (doc.fileData && doc.fileData.startsWith("data:application/pdf")) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 48, border: '2px dashed var(--color-border)', borderRadius: 12, backgroundColor: 'rgba(0,0,0,0.01)', gap: 16, width: '100%', height: '100%', boxSizing: 'border-box' }}>
        <FileText size={48} style={{ color: 'var(--color-primary)' }} />
        <div style={{ textAlign: 'center' }}>
          <h4 style={{ fontWeight: 'bold', margin: '0 0 4px 0' }}>{doc.fileName || "uploaded_document.pdf"}</h4>
          <p style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)', margin: 0 }}>PDF Document Size: ~{(doc.fileData.length * 0.75 / 1024).toFixed(1)} KB</p>
        </div>
        <span style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)', textAlign: 'center', maxWidth: 380, display: 'block' }}>
          For security and compatibility, please click the <strong>Download Copy</strong> option to review the full PDF.
        </span>
      </div>
    );
  }

  // 3. Fallback: Simulated Document templates if we have type / ID matching
  const docType = doc.type || (doc.id ? String(doc.id).replace('profile-photo', 'photo').replace('bank-cheque', 'bank-cheque') : '');
  
  // Map fileName/name to docType if type is not present
  let resolvedType = docType;
  if (!resolvedType && doc.name) {
    const n = doc.name.toLowerCase();
    if (n.includes('photo')) resolvedType = 'photo';
    else if (n.includes('aadhaar')) resolvedType = 'aadhaar';
    else if (n.includes('pan')) resolvedType = 'pan';
    else if (n.includes('experience')) resolvedType = 'exp-letter';
    else if (n.includes('cheque') || n.includes('passbook')) resolvedType = 'bank-cheque';
    else if (n.includes('offer')) resolvedType = 'offer-letter';
    else if (n.includes('appointment')) resolvedType = 'appointment-letter';
  }

  switch (resolvedType) {
    case "photo":
      return (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.02)', padding: 32, borderRadius: 12, border: '1px solid var(--color-border)', width: '100%', height: '100%', boxSizing: 'border-box' }}>
          <div style={{ height: 160, width: 160, borderRadius: '50%', overflow: 'hidden', border: '4px solid rgba(79, 70, 229, 0.2)', backgroundColor: 'white', boxShadow: '0 10px 15px rgba(0,0,0,0.1)' }}>
            {profile.photo || profile.avatar ? (
              <img src={profile.photo || profile.avatar} alt={profile.name} style={{ height: '100%', width: '100%', objectFit: 'cover' }} />
            ) : (
              <div style={{ height: '100%', width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '3.5rem', fontWeight: 900, color: 'var(--color-primary)' }}>
                {(profile.name || '').split(" ").map((n) => n[0]).join("")}
              </div>
            )}
          </div>
        </div>
      );
      
    case "aadhaar":
      return (
        <div style={{ width: '100%', border: '2px solid #0284c7', backgroundColor: '#f0f9ff', padding: 16, borderRadius: 12, boxShadow: '0 4px 6px rgba(0,0,0,0.05)', position: 'relative', color: '#1e293b', boxSizing: 'border-box', textAlign: 'left' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '1px solid #38bdf8', paddingBottom: 8, marginBottom: 12 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <div style={{ height: 24, width: 24, backgroundColor: '#f59e0b', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 8, color: 'white', fontWeight: 'bold' }}>印</div>
              <div>
                <h4 style={{ fontSize: 10, fontWeight: 900, color: '#0369a1', lineHeight: '1.2', margin: 0 }}>GOVERNMENT OF INDIA</h4>
                <span style={{ fontSize: 7, color: '#64748b', display: 'block' }}>Unique Identification Authority of India</span>
              </div>
            </div>
            <span style={{ fontSize: 9, fontWeight: 900, color: '#0369a1' }}>Aadhaar Card</span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: 12 }}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', border: '1px solid #bae6fd', backgroundColor: 'white', padding: 4, borderRadius: 8 }}>
              <div style={{ height: 80, width: 64, backgroundColor: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', borderRadius: 4 }}>
                {profile.photo || profile.avatar ? (
                  <img src={profile.photo || profile.avatar} alt="Aadhaar photo" style={{ height: '100%', width: '100%', objectFit: 'cover' }} />
                ) : (
                  <User size={30} style={{ color: '#94a3b8' }} />
                )}
              </div>
              <span style={{ fontSize: 6, color: '#64748b', marginTop: 4, fontWeight: 'bold' }}>Verified Photo</span>
            </div>

            <div style={{ fontSize: 11, display: 'flex', flexDirection: 'column', gap: 4, lineHeight: 1.2 }}>
              <div>Name: <strong style={{ fontWeight: 'bold' }}>{profile.name}</strong></div>
              <div>DOB: <strong>{profile.dob || '1992-08-24'}</strong></div>
              <div>Gender: <strong>{profile.gender || 'Male'}</strong></div>
              <div style={{ fontSize: 9, color: '#64748b', paddingTop: 2, borderTop: '1px solid #e2e8f0' }}>
                Address: <span style={{ display: 'block', marginTop: 2, color: '#334155', height: 32, overflow: 'hidden', textOverflow: 'ellipsis' }}>{profile.address || 'Not Provided'}</span>
              </div>
            </div>
          </div>

          <div style={{ borderTop: '1px solid #38bdf8', marginTop: 12, paddingTop: 8, textAlign: 'center' }}>
            <div style={{ fontSize: 12, fontWeight: 800, letterSpacing: 2, color: '#0c4a6e', fontFamily: 'monospace' }}>
              3892 4829 8293
            </div>
            <div style={{ fontSize: 7, color: '#0369a1', fontWeight: 500, marginTop: 2 }}>
              Aadhaar is a proof of identity, not of citizenship.
            </div>
          </div>
        </div>
      );

    case "pan":
      return (
        <div style={{ width: '100%', border: '2px solid #059669', backgroundColor: '#f0fdf4', padding: 16, borderRadius: 12, boxShadow: '0 4px 6px rgba(0,0,0,0.05)', color: '#1e293b', boxSizing: 'border-box', textAlign: 'left' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #34d399', paddingBottom: 8, marginBottom: 12 }}>
            <div>
              <h4 style={{ fontSize: 9, fontWeight: 900, color: '#047857', lineHeight: '1.2', margin: 0 }}>INCOME TAX DEPARTMENT</h4>
              <span style={{ fontSize: 7, color: '#64748b', display: 'block' }}>GOVERNMENT OF INDIA</span>
            </div>
            <span style={{ fontSize: 10, fontWeight: 900, color: '#047857' }}>PAN CARD</span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 12 }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, fontSize: 11, lineHeight: 1.2 }}>
              <div>
                <span style={{ fontSize: 7, color: '#64748b', fontWeight: 'bold', display: 'block' }}>PERMANENT ACCOUNT NUMBER (PAN)</span>
                <span style={{ fontFamily: 'monospace', fontWeight: 'bold', fontSize: 12 }}>AAKPT8293D</span>
              </div>
              <div>
                <span style={{ fontSize: 7, color: '#64748b', fontWeight: 'bold', display: 'block' }}>NAME</span>
                <span style={{ fontWeight: 'bold' }}>{(profile.name || '').toUpperCase()}</span>
              </div>
              <div>
                <span style={{ fontSize: 7, color: '#64748b', fontWeight: 'bold', display: 'block' }}>DATE OF BIRTH</span>
                <span style={{ fontWeight: 'bold' }}>{profile.dob || '1992-08-24'}</span>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ height: 64, width: 50, backgroundColor: 'white', border: '1px solid #a7f3d0', padding: 2, borderRadius: 4, display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                {profile.photo || profile.avatar ? (
                  <img src={profile.photo || profile.avatar} alt="PAN photo" style={{ height: '100%', width: '100%', objectFit: 'cover' }} />
                ) : (
                  <User size={24} style={{ color: '#cbd5e1' }} />
                )}
              </div>
              <div style={{ border: '1px solid var(--color-border)', padding: 2, backgroundColor: 'white', width: '100%', borderRadius: 4, textAlign: 'center', fontSize: 6, fontStyle: 'italic', marginTop: 4, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {(profile.name || '').split(" ")[0]}
              </div>
            </div>
          </div>
        </div>
      );

    case "resume":
      return (
        <div style={{ width: '100%', height: '100%', backgroundColor: 'white', border: '1px solid var(--color-border)', padding: 24, borderRadius: 12, boxShadow: '0 4px 6px rgba(0,0,0,0.05)', fontSize: 10, color: '#334155', lineHeight: '1.4', maxHeight: 330, overflowY: 'auto', boxSizing: 'border-box', textAlign: 'left' }}>
          <div style={{ textAlign: 'center', paddingBottom: 12, borderBottom: '1px solid var(--color-border)', marginBottom: 12 }}>
            <h2 style={{ fontSize: 14, fontWeight: 900, margin: 0, color: 'var(--color-text-primary)' }}>{profile.name}</h2>
            <p style={{ fontSize: 10, fontWeight: 'semibold', color: 'var(--color-primary)', margin: '2px 0 0 0' }}>{profile.designation || 'Software Engineer'}</p>
            <p style={{ color: 'var(--color-text-secondary)', fontSize: 8, margin: '2px 0 0 0' }}>{profile.email} | {profile.phone} | {profile.address || 'USA'}</p>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <div>
              <h4 style={{ fontWeight: 'extrabold', textTransform: 'uppercase', fontSize: 8, color: 'var(--color-primary)', borderBottom: '1px solid var(--color-border)', paddingBottom: 2, margin: '0 0 6px 0' }}>Professional Experience</h4>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold' }}>
                <span>Software Engineer | ITLC Technologies</span>
                <span>{profile.joiningDate || '2026-06-01'} - Present</span>
              </div>
              <p style={{ fontSize: 9, color: 'var(--color-text-secondary)', marginTop: 2, margin: 0 }}>
                Responsible for coding, maintaining, and shipping features for Enterprise HRMS ESS dashboards. Specialized in React and Tailwind.
              </p>
            </div>
            <div>
              <h4 style={{ fontWeight: 'extrabold', textTransform: 'uppercase', fontSize: 8, color: 'var(--color-primary)', borderBottom: '1px solid var(--color-border)', paddingBottom: 2, margin: '0 0 6px 0' }}>Technical Skills</h4>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                {["React", "TypeScript", "Tailwind CSS", "Node.js", "Git"].map((skill, i) => (
                  <span key={i} style={{ padding: '1px 4px', backgroundColor: 'rgba(0,0,0,0.03)', borderRadius: 4, fontSize: 8, border: '1px solid var(--color-border)' }}>
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      );

    case "exp-letter":
      return (
        <div style={{ width: '100%', backgroundColor: 'white', border: '1px solid var(--color-border)', padding: 24, borderRadius: 12, boxShadow: '0 4px 6px rgba(0,0,0,0.05)', fontSize: 10, color: '#334155', lineHeight: '1.4', boxSizing: 'border-box', textAlign: 'left' }}>
          <div style={{ textAlign: 'center', paddingBottom: 12, borderBottom: '1px solid var(--color-border)', marginBottom: 12 }}>
            <h3 style={{ fontWeight: 'black', color: 'var(--color-primary)', fontSize: 12, margin: 0 }}>PREVCORP ENTERPRISES INC.</h3>
            <p style={{ fontSize: 7, color: '#64748b', margin: '2px 0 0 0' }}>102 Business District, Techno Park, Phase 1</p>
          </div>
          <div style={{ textAlign: 'right', fontSize: 8, color: '#64748b' }}>Date: May 20, 2026</div>
          <div style={{ textAlign: 'center', fontWeight: 'bold', textTransform: 'uppercase', fontSize: 10, margin: '8px 0' }}>
            TO WHOMSOEVER IT MAY CONCERN
          </div>
          <p style={{ margin: '0 0 8px 0' }}>
            This is to certify that <strong>{profile.name}</strong> was employed with PrevCorp Enterprises Inc. as an Associate Software Engineer from <strong>January 15, 2024</strong> to <strong>May 10, 2026</strong>.
          </p>
          <p style={{ margin: '0 0 8px 0' }}>
            Their conduct was excellent, and we wish them the absolute best in all their future endeavors.
          </p>
          <div style={{ marginTop: 16 }}>
            <div style={{ fontWeight: 'bold' }}>Rajesh K. Mehta</div>
            <div style={{ fontSize: 8, color: '#64748b' }}>Head of HR Operations, PrevCorp Enterprises</div>
          </div>
        </div>
      );

    case "bank-cheque":
      return (
        <div style={{ width: '100%', border: '2px dashed #10b981', backgroundColor: '#f0fdf4', padding: 16, borderRadius: 12, boxShadow: '0 4px 6px rgba(0,0,0,0.05)', color: '#064e3b', position: 'relative', boxSizing: 'border-box', textAlign: 'left' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #a7f3d0', paddingBottom: 8 }}>
            <div>
              <h4 style={{ fontWeight: 'extrabold', margin: 0, fontSize: 10 }}>GLOBAL ENTERPRISE BANK</h4>
              <span style={{ fontSize: 7, color: '#047857', fontFamily: 'monospace' }}>IFSC: GEB0000382</span>
            </div>
            <span style={{ fontSize: 8, color: '#047857', fontFamily: 'monospace' }}>DATE: DD / MM / YYYY</span>
          </div>

          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', fontSize: 14, fontWeight: '900', border: '1px solid #a7f3d0', borderRadius: 8, padding: 12, margin: '16px 0', position: 'relative', backgroundColor: 'rgba(255,255,255,0.6)' }}>
            <div style={{ color: 'rgba(239,68,68,0.2)', fontSize: 24, fontWeight: 'bold', position: 'absolute', transform: 'rotate(12deg)', letterSpacing: 4 }}>
              CANCELLED
            </div>
            <div style={{ tracking: 'wider', color: '#047857', fontSize: 12 }}>
              A/C NO: 982930293023
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 7, color: '#047857', borderTop: '1px solid #a7f3d0', paddingTop: 8, fontFamily: 'monospace' }}>
            <span>⑈ 9829382 ⑈ 982938293 ⑈ 003829 ⑈ 10</span>
            <span style={{ fontStyle: 'italic' }}>Signature Not Required</span>
          </div>
        </div>
      );

    case "offer-letter":
      return (
        <div style={{ width: '100%', height: '100%', backgroundColor: 'white', border: '1px solid var(--color-border)', padding: 24, borderRadius: 12, boxShadow: '0 4px 6px rgba(0,0,0,0.05)', fontSize: 10, color: '#334155', maxHeight: 330, overflowY: 'auto', boxSizing: 'border-box', textAlign: 'left' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: 8, borderBottom: '2px solid var(--color-border)', marginBottom: 12 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <div style={{ height: 20, width: 20, backgroundColor: 'var(--color-primary)', borderRadius: 4, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 'bold', fontSize: 8 }}>ITLC</div>
              <h4 style={{ fontWeight: 'bold', margin: 0, fontSize: 10 }}>ITLC TECHNOLOGIES</h4>
            </div>
            <span style={{ fontSize: 7, color: '#64748b' }}>Ref: ITLC/OFF/2026/082</span>
          </div>
          <div style={{ textAlign: 'right', fontSize: 7, color: '#64748b' }}>Date: May 15, 2026</div>
          <p style={{ margin: '0 0 6px 0' }}>Dear {profile.name},</p>
          <div style={{ textAlign: 'center', fontWeight: 'bold', textTransform: 'uppercase', borderBottom: '1px solid var(--color-border)', paddingBottom: 2, margin: '8px 0' }}>Offer of Employment</div>
          <p style={{ margin: '0 0 8px 0' }}>We are pleased to offer you employment with <strong>ITLC Technologies, Inc.</strong> in the position of <strong>{profile.designation || 'Software Engineer'}</strong>. Your employment is scheduled to commence on <strong>{profile.joiningDate || '2026-06-01'}</strong>.</p>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 16 }}>
            <div>
              <div style={{ fontWeight: 'bold' }}>Sheela Nair</div>
              <div style={{ fontSize: 8, color: '#64748b' }}>VP, HR Operations</div>
            </div>
            <div style={{ padding: '2px 6px', border: '1px dashed #10b981', backgroundColor: '#ecfdf5', color: '#10b981', borderRadius: 4, fontSize: 7, fontWeight: 'bold' }}>Digitally Accepted</div>
          </div>
        </div>
      );

    case "appointment-letter":
      return (
        <div style={{ width: '100%', height: '100%', backgroundColor: 'white', border: '1px solid var(--color-border)', padding: 24, borderRadius: 12, boxShadow: '0 4px 6px rgba(0,0,0,0.05)', fontSize: 10, color: '#334155', maxHeight: 330, overflowY: 'auto', boxSizing: 'border-box', textAlign: 'left' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: 8, borderBottom: '2px solid var(--color-border)', marginBottom: 12 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <div style={{ height: 20, width: 20, backgroundColor: 'var(--color-primary)', borderRadius: 4, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 'bold', fontSize: 8 }}>ITLC</div>
              <h4 style={{ fontWeight: 'bold', margin: 0, fontSize: 10 }}>ITLC TECHNOLOGIES</h4>
            </div>
            <span style={{ fontSize: 7, color: '#64748b' }}>Ref: ITLC/APT/2026/082</span>
          </div>
          <p style={{ margin: '0 0 6px 0' }}>To, {profile.name},</p>
          <div style={{ textAlign: 'center', fontWeight: 'bold', textTransform: 'uppercase', borderBottom: '1px solid var(--color-border)', paddingBottom: 2, margin: '8px 0' }}>Letter of Appointment</div>
          <p style={{ margin: '0 0 6px 0' }}>We are pleased to issue this Letter of Appointment detailing the terms and conditions of your service:</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 2, paddingLeft: 8, margin: '8px 0' }}>
            <div>1. <strong>Probation:</strong> 6 months.</div>
            <div>2. <strong>Working Hours:</strong> 9:30 AM to 6:30 PM.</div>
            <div>3. <strong>Termination:</strong> 30 days notice.</div>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 16 }}>
            <div>
              <div style={{ fontWeight: 'bold' }}>Sheela Nair</div>
              <div style={{ fontSize: 8, color: '#64748b' }}>VP, HR Operations</div>
            </div>
            <div style={{ padding: '2px 6px', border: '1px dashed #10b981', backgroundColor: '#ecfdf5', color: '#10b981', borderRadius: 4, fontSize: 7, fontWeight: 'bold' }}>Digitally Signed</div>
          </div>
        </div>
      );

    default:
      // Show default certificate / locked placeholder if no specific type is resolved
      return (
        <div style={{ position: 'relative', width: '100%', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', boxSizing: 'border-box' }}>
          <div style={{
            position: 'absolute',
            fontSize: '2.5rem',
            fontWeight: 900,
            color: 'rgba(16, 185, 129, 0.08)',
            transform: 'rotate(-25deg)',
            pointerEvents: 'none',
            textTransform: 'uppercase',
            letterSpacing: 4
          }}>
            Verified HR Admin
          </div>
          <div style={{ zIndex: 2 }}>
            <ShieldCheck size={48} style={{ color: 'var(--color-success)', marginBottom: 12, marginLeft: 'auto', marginRight: 'auto' }} />
            <h4 style={{ fontSize: '1.1rem', fontWeight: 800, margin: '0 0 6px 0' }}>{(doc.name || 'Document').replace(/_/g, ' ').replace(/\.[^/.]+$/, "")}</h4>
            <p style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)', marginTop: 6, maxWidth: 300, lineHeight: 1.4, marginLeft: 'auto', marginRight: 'auto' }}>
              This official certificate is scanned, encrypted, and locked in the secure database. Audit verification completed by HR Super Admin.
            </p>
            <span style={{ fontSize: '0.7rem', color: 'var(--color-text-tertiary)', display: 'block', marginTop: 10 }}>
              SHA-256 Hash: e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855
            </span>
          </div>
        </div>
      );
  }
};

export default function EmployeeManagement({ employees = [], setEmployees, searchQuery, initialSelectedEmpId, subTab, setActiveTab, currency = 'USD' }) {
  const currencySymbols = {
    USD: '$',
    INR: '₹',
    EUR: '€',
    GBP: '£'
  };
  const cSymbol = currencySymbols[currency] || '$';

  const [deptFilter, setDeptFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [desgFilter, setDesgFilter] = useState('All');
  const [branchFilter, setBranchFilter] = useState('All');
  const [typeFilter, setTypeFilter] = useState('All');
  
  // Navigation & Sub-views mode state
  const [viewMode, setViewMode] = useState(initialSelectedEmpId ? 'profile' : 'list'); // 'list', 'add', 'edit', 'profile', 'delete'
  const [editingEmployee, setEditingEmployee] = useState(null);
  const [selectedProfile, setSelectedProfile] = useState(
    initialSelectedEmpId && Array.isArray(employees)
      ? employees.find(e => e && e.id === initialSelectedEmpId) 
      : null
  );

  // Keep selected profile in sync with updated employee details and documents
  useEffect(() => {
    if (Array.isArray(employees) && employees.length > 0) {
      if (selectedProfile) {
        const fresh = employees.find(e => e && (e.id === selectedProfile.id || e.email?.toLowerCase() === selectedProfile.email?.toLowerCase()));
        if (fresh && JSON.stringify(fresh) !== JSON.stringify(selectedProfile)) {
          setSelectedProfile(fresh);
        }
      } else if (subTab === 'profile') {
        setSelectedProfile(employees[0]);
      }
    }
  }, [employees, subTab, selectedProfile]);

  // Update view mode only when subTab changes
  useEffect(() => {
    if (subTab === 'profile') {
      setViewMode('profile');
    } else if (subTab === 'directory') {
      setViewMode('list');
    }
  }, [subTab]);
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);
  const [profileNotes, setProfileNotes] = useState([
    { text: 'Completed advanced UI patterns certification course.', date: 'June 20, 2026' },
    { text: 'Shipped MacBook Pro 16" device to residence.', date: 'Jan 10, 2026' }
  ]);
  const [noteInput, setNoteInput] = useState('');
  
  const [departments, setDepartments] = useState([]);
  const [autoGenerateId, setAutoGenerateId] = useState(true);
  const [customId, setCustomId] = useState('');
  const [portalPassword, setPortalPassword] = useState('');
  const [seatLimit, setSeatLimit] = useState(50);
  const [storageLimit, setStorageLimit] = useState(50);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);

  useEffect(() => {
    const loadDepartments = async () => {
      try {
        const depts = await api.getAdminDepartments();
        if (depts && Array.isArray(depts)) {
          setDepartments(depts);
        }
      } catch (err) {
        console.error("Failed to load departments:", err);
      }
    };
    loadDepartments();

    const fetchCompanyData = async () => {
      try {
        const comp = await api.getAdminCompany();
        if (comp) {
          setCompanyName(comp.name || 'ITLC HRMS');
          const maxSeats = Number(comp.seatLimit || comp.maxEmployees || comp.userSeatLimit || 50);
          const maxStorage = Number(comp.storageLimitGb || comp.storageLimit || 50);
          setSeatLimit(maxSeats);
          setStorageLimit(maxStorage);
        }
      } catch (err) {
        console.error("Failed to load company profile:", err);
      }
    };
    fetchCompanyData();

    const handleSync = () => {
      fetchCompanyData();
    };
    window.addEventListener('subscription_updated', handleSync);
    window.addEventListener('company_updated', handleSync);
    window.addEventListener('storage', handleSync);
    return () => {
      window.removeEventListener('subscription_updated', handleSync);
      window.removeEventListener('company_updated', handleSync);
      window.removeEventListener('storage', handleSync);
    };
  }, []);

  const currentEmpCount = Array.isArray(employees) ? employees.length : 0;
  const isSeatLimitReached = currentEmpCount >= seatLimit;

  const [companyName, setCompanyName] = useState('ITLC HRMS');

  const fileInputRef = React.useRef(null);

  // Form variables
  const [newName, setNewName] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [generatedEmpCredentials, setGeneratedEmpCredentials] = useState(null);
  const [importedCredentials, setImportedCredentials] = useState([]);
  const [selectedEmployeeIds, setSelectedEmployeeIds] = useState([]);
  const [unmaskedEmpIds, setUnmaskedEmpIds] = useState([]);
  const [newRole, setNewRole] = useState('');
  const [newSystemRole, setNewSystemRole] = useState('Employee');
  const [newDept, setNewDept] = useState('Engineering');
  const [newStatus, setNewStatus] = useState('Active');
  const [newPhone, setNewPhone] = useState('');
  const [newSalary, setNewSalary] = useState('');
  const [localSearch, setLocalSearch] = useState('');
  const [activeProfileTab, setActiveProfileTab] = useState('Personal Info');

  const [selectedEmpAttendance, setSelectedEmpAttendance] = useState([]);
  const [loadingAttendance, setLoadingAttendance] = useState(false);

  useEffect(() => {
    if (activeProfileTab === 'Attendance Logs' && selectedProfile) {
      const loadAttendance = async () => {
        setLoadingAttendance(true);
        try {
          const data = await api.getAdminAttendance(selectedProfile.id);
          setSelectedEmpAttendance(data || []);
        } catch (err) {
          console.error("Failed to load employee attendance logs:", err);
        } finally {
          setLoadingAttendance(false);
        }
      };
      loadAttendance();
    }
  }, [activeProfileTab, selectedProfile]);

  const [newAvatar, setNewAvatar] = useState('');
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);

  const handlePhotoUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      setIsUploadingPhoto(true);
      const compressed = await compressImage(file, 400, 400, 0.75);
      setNewAvatar(compressed);
    } catch (err) {
      console.error("Photo compression failed:", err);
      alert("Failed to process photo. Please try a different image.");
    } finally {
      setIsUploadingPhoto(false);
    }
  };

  const [newDob, setNewDob] = useState('');
  const [newJoiningDate, setNewJoiningDate] = useState(new Date().toISOString().split('T')[0]);
  const [newGender, setNewGender] = useState('Male');
  const [newAddress, setNewAddress] = useState('');
  const [newPrimaryContact, setNewPrimaryContact] = useState('');
  const [newSecondaryContact, setNewSecondaryContact] = useState('');
  const [newBankName, setNewBankName] = useState('');
  const [newAccountNumber, setNewAccountNumber] = useState('');
  const [newIfsc, setNewIfsc] = useState('');
  const [activeDocPreview, setActiveDocPreview] = useState(null);
  const [showIdCardModal, setShowIdCardModal] = useState(false);
  const [isAcctUnmasked, setIsAcctUnmasked] = useState(false);
  const [dirSubTab, setDirSubTab] = useState('directory'); // 'directory', 'credentials'
  const [newManager, setNewManager] = useState('None');
  const [newCustomDept, setNewCustomDept] = useState('');
  const [showCustomDeptInput, setShowCustomDeptInput] = useState(false);
  const [newPermissions, setNewPermissions] = useState({
    viewDirectory: true,
    editProfile: true,
    viewPayroll: false,
    manageDocs: true
  });
  
  const filteredEmployees = (employees || []).filter(emp => {
    if (!emp) return false;
    const query = localSearch || searchQuery || '';
    
    const nameVal = emp.name || '';
    const emailVal = emp.email || '';
    const descVal = emp.designation || emp.role || '';
    
    const matchesSearch = nameVal.toLowerCase().includes(query.toLowerCase()) || 
                          emailVal.toLowerCase().includes(query.toLowerCase()) ||
                          descVal.toLowerCase().includes(query.toLowerCase());
                          
    const matchesDept = deptFilter === 'All' || emp.department === deptFilter;
    const matchesStatus = statusFilter === 'All' || emp.status === statusFilter;
    
    // Fallback branch / type mappings based on numeric ID
    const empIdNum = parseInt(String(emp.id || '').replace(/\D/g, '') || '0') || 0;
    const empBranch = emp.branch || (empIdNum % 2 === 0 ? 'New York HQ' : 'London Tech Hub');
    const empType = emp.employmentType || (empIdNum % 3 === 0 ? 'Contract' : empIdNum % 4 === 0 ? 'Intern' : 'Full-time');
    
    const matchesDesg = desgFilter === 'All' || descVal === desgFilter;
    const matchesBranch = branchFilter === 'All' || empBranch === branchFilter;
    const matchesType = typeFilter === 'All' || empType === typeFilter;
    
    return matchesSearch && matchesDept && matchesStatus && matchesDesg && matchesBranch && matchesType;
  });

  const handleAddEmployee = async (e) => {
    e.preventDefault();
    if (!newName || !newEmail || !newRole) return;

    if (isSeatLimitReached) {
      setShowUpgradeModal(true);
      return;
    }
    
    try {
      const generatedPass = (newPassword || `Emp@${Math.floor(1000 + Math.random() * 9000)}`).trim();
      const result = await api.createEmployee({
        id: autoGenerateId ? undefined : customId,
        name: newName,
        email: newEmail,
        role: newRole,
        systemRole: newSystemRole,
        department: showCustomDeptInput ? newCustomDept : newDept,
        salary: `${cSymbol}${newSalary || '75,000'}`,
        phone: newPhone || '+1 (555) 019-2834',
        joiningDate: newJoiningDate || new Date().toISOString().split('T')[0],
        reportingManager: newManager,
        avatar: newAvatar || `https://images.unsplash.com/photo-${1500000000000 + Math.floor(Math.random() * 900000)}?w=150&auto=format&fit=crop&q=80`,
        password: generatedPass
      });

      const empToSave = result?.employee || result || {
        id: customId || `EMP-${Date.now()}`,
        name: newName,
        email: newEmail,
        role: newRole,
        designation: newRole,
        department: showCustomDeptInput ? newCustomDept : newDept,
        avatar: newAvatar || result?.avatar
      };
      const finalPass = result?.generatedPassword || generatedPass;

      setEmployees(prev => [empToSave, ...(Array.isArray(prev) ? prev.filter(e => e.id !== empToSave.id && (empToSave.email ? e.email?.toLowerCase() !== empToSave.email.toLowerCase() : true)) : [])]);
      
      setGeneratedEmpCredentials({
        id: empToSave.employeeId || empToSave.id,
        email: empToSave.email || newEmail,
        pass: finalPass,
        employeeName: empToSave.name || newName
      });

      resetForm();
      setViewMode('list');
    } catch (err) {
      alert(err.message || 'Failed to create employee');
    }
  };

  const handleStartEdit = (emp) => {
    setEditingEmployee(emp);
    setNewName(emp.name || '');
    setNewAvatar(emp.avatar || emp.photo || '');
    setNewEmail(emp.email || '');
    setNewRole(emp.designation || emp.role || '');
    setNewSystemRole(emp.role || 'Employee');
    setNewDept(emp.department || 'Engineering');
    setNewStatus(emp.status || 'Active');
    setNewPhone(emp.phone || '');
    setNewSalary(emp.salary ? String(emp.salary).replace('$', '').replace('₹', '').replace(/,/g, '') : '');
    setNewDob(emp.dob || '1992-08-24');
    setNewJoiningDate(emp.joiningDate || new Date().toISOString().split('T')[0]);
    setNewGender(emp.gender || 'Male');
    setNewAddress(emp.address || '482 Silver Lake Blvd, Los Angeles, CA 90026');
    setNewPrimaryContact(emp.primaryContact || 'Jane Wright (Spouse) - +1 (555) 382-9029');
    setNewSecondaryContact(emp.secondaryContact || 'Robert Wright (Father) - +1 (555) 492-0210');
    setNewBankName(emp.bankName || 'ITLC Silicon Bank, NA');
    setNewAccountNumber(emp.accountNumber || '30234928430');
    setNewIfsc(emp.ifsc || 'ISB000492');
    setNewManager(emp.reportingManager || 'None');
    setNewPermissions(emp.permissions || {
      viewDirectory: true,
      editProfile: true,
      viewPayroll: false,
      manageDocs: true
    });
    setViewMode('edit');
  };

  const handleSaveEdit = async (e) => {
    e.preventDefault();
    try {
      const updated = await api.updateEmployee(editingEmployee.id, {
        name: newName, 
        email: newEmail, 
        role: newSystemRole, 
        designation: newRole,
        department: showCustomDeptInput ? newCustomDept : newDept, 
        status: newStatus, 
        phone: newPhone, 
        salary: `${cSymbol}${Number(newSalary).toLocaleString()}`,
        dob: newDob,
        joiningDate: newJoiningDate,
        gender: newGender,
        address: newAddress,
        primaryContact: newPrimaryContact,
        secondaryContact: newSecondaryContact,
        bankName: newBankName,
        accountNumber: newAccountNumber,
        ifsc: newIfsc,
        reportingManager: newManager,
        avatar: newAvatar || editingEmployee.avatar,
        permissions: newPermissions,
        password: newPassword || undefined
      });

      setEmployees(employees.map(emp => emp.id === editingEmployee.id ? updated : emp));
      if (selectedProfile && selectedProfile.id === editingEmployee.id) {
        setSelectedProfile(updated);
      }
      resetForm();
      setEditingEmployee(null);
      setViewMode('list');
    } catch (err) {
      alert(err.message || 'Failed to save changes');
    }
  };

  const handleDeleteEmployee = (id) => {
    setConfirmDeleteId(id);
    setViewMode('delete');
  };

  const handleConfirmDelete = async () => {
    try {
      await api.deleteEmployee(confirmDeleteId);
      setEmployees(employees.filter(emp => emp.id !== confirmDeleteId));
      setConfirmDeleteId(null);
      setViewMode('list');
    } catch (err) {
      alert(err.message || 'Failed to delete employee');
    }
  };

  const resetForm = () => {
    setNewName('');
    setNewAvatar('');
    setNewEmail('');
    setNewRole('');
    setNewSystemRole('Employee');
    setNewDept('Engineering');
    setNewStatus('Active');
    setNewPhone('');
    setNewSalary('');
    setNewDob('');
    setNewJoiningDate(new Date().toISOString().split('T')[0]);
    setNewGender('Male');
    setNewAddress('');
    setNewPrimaryContact('');
    setNewSecondaryContact('');
    setNewBankName('');
    setNewAccountNumber('');
    setNewIfsc('');
    setNewManager('None');
    setNewCustomDept('');
    setNewPassword('');
    setShowCustomDeptInput(false);
    setNewPermissions({
      viewDirectory: true,
      editProfile: true,
      viewPayroll: false,
      manageDocs: true
    });
  };

  const handleExport = () => {
    if (employees.length === 0) return alert("No employees to export.");
    const headers = ["ID", "Name", "Email", "Role", "Department", "Salary", "Phone", "Joining Date", "Status", "Reporting Manager"];
    const rows = employees.map(emp => [
      emp.id || '',
      emp.name || '',
      emp.email || '',
      emp.designation || emp.role || '',
      emp.department || '',
      emp.salary || '',
      emp.phone || '',
      emp.joiningDate || '',
      emp.status || '',
      emp.reportingManager || ''
    ]);
    
    const csvContent = [headers.join(","), ...rows.map(e => e.map(val => `"${val.toString().replace(/"/g, '""')}"`).join(","))].join("\n");
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `employee_directory_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleImport = () => {
    fileInputRef.current?.click();
  };

  const handleImportCSV = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      const text = event.target?.result;
      if (typeof text !== 'string') return;

      const lines = text.split('\n').map(line => line.trim()).filter(line => line.length > 0);
      if (lines.length <= 1) return alert("Empty or invalid CSV file.");

      // Parse headers
      const rawHeaders = lines[0].split(',').map(h => h.replace(/^["']|["']$/g, '').trim().toLowerCase());
      
      let createdCount = 0;
      let updatedCount = 0;
      let errors = [];

      for (let i = 1; i < lines.length; i++) {
        const row = [];
        let inQuotes = false;
        let currentValue = '';
        const lineText = lines[i];

        for (let j = 0; j < lineText.length; j++) {
          const char = lineText[j];
          if (char === '"') {
            inQuotes = !inQuotes;
          } else if (char === ',' && !inQuotes) {
            row.push(currentValue.replace(/^["']|["']$/g, '').trim());
            currentValue = '';
          } else {
            currentValue += char;
          }
        }
        row.push(currentValue.replace(/^["']|["']$/g, '').trim());

        const data = {};
        rawHeaders.forEach((header, index) => {
          data[header] = row[index] || '';
        });

        const email = data.email;
        const name = data.name;
        if (!email || !name) continue;

        const existing = employees.find(emp => 
          (data.id && emp.id.toString() === data.id.toString()) || 
          (emp.email.toLowerCase() === email.toLowerCase())
        );

        try {
          if (existing) {
            const updated = await api.updateEmployee(existing.id, {
              name: data.name || existing.name,
              role: data.role || existing.role,
              designation: data.designation || data.role || existing.designation,
              department: data.department || existing.department,
              salary: data.salary || existing.salary,
              phone: data.phone || existing.phone,
              joiningDate: data.joiningdate || data["joining date"] || existing.joiningDate,
              status: data.status || existing.status,
              reportingManager: data.reportingmanager || data["reporting manager"] || existing.reportingManager
            });
            updatedCount++;
          } else {
            const passStr = 'Pass_' + Math.floor(1000 + Math.random() * 9000);
            const created = await api.createEmployee({
              id: data.id || undefined,
              name: data.name,
              email: data.email,
              role: data.designation || data.role || 'Staff Member',
              systemRole: data.role || 'Employee',
              department: data.department || 'Engineering',
              salary: data.salary || '$60,000',
              phone: data.phone || '',
              joiningDate: data.joiningdate || data["joining date"] || new Date().toISOString().split('T')[0],
              reportingManager: data.reportingmanager || data["reporting manager"] || 'None',
              password: passStr
            });
            
            const finalId = created?.employee?.id || data.id || 'Generated';
            const finalPass = created?.generatedPassword || passStr;

            newCredentials.push({
              name: data.name,
              email: data.email,
              id: finalId,
              password: finalPass,
              phone: data.phone || ''
            });

            createdCount++;
          }
        } catch (err) {
          errors.push(`Row ${i + 1} (${name}): ${err.message}`);
        }
      }

      try {
        const list = await api.getEmployees();
        setEmployees(list);
      } catch (err) {}

      if (newCredentials.length > 0) {
        setImportedCredentials(newCredentials);
      }

      let statusMsg = `CSV Import Done:\n- Onboarded ${createdCount} new employees.\n- Corrected/updated ${updatedCount} existing employee records.`;
      if (errors.length > 0) {
        statusMsg += `\n\nErrors encountered:\n` + errors.slice(0, 5).join('\n');
      }
      alert(statusMsg);
    };

    reader.readAsText(file);
    e.target.value = '';
  };

  const handleCopyAllLogins = () => {
    const text = importedCredentials.map(c => `Name: ${c.name}\nEmail: ${c.email}\nEmployee ID: ${c.id}\nPassword: ${c.password}\n-------------------`).join('\n');
    navigator.clipboard.writeText(text);
    alert("All generated logins copied to clipboard!");
  };

  const handleDownloadLoginsCSV = () => {
    const headers = ["Name", "Email", "Employee ID", "Password", "Phone"];
    const rows = importedCredentials.map(c => [c.name || '', c.email || '', c.id || '', c.password || '', c.phone || '']);
    const csvContent = [headers.join(","), ...rows.map(r => r.map(val => `"${String(val ?? '').replace(/"/g, '""')}"`).join(","))].join("\n");
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `onboarded_employee_logins.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleExportCredentialsCSV = () => {
    if (!employees || employees.length === 0) return alert("No employees to export.");
    const headers = ["Name", "Email", "Employee ID", "Password", "Phone"];
    const rows = (employees || []).map(emp => [
      emp.name || '',
      emp.email || '',
      emp.id || '',
      emp.tempPassword || '',
      emp.phone || ''
    ]);
    const csvContent = [headers.join(","), ...rows.map(e => e.map(val => `"${String(val ?? '').replace(/"/g, '""')}"`).join(","))].join("\n");
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `onboarded_employee_logins.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedEmployeeIds(filteredEmployees.map(emp => emp.id));
    } else {
      setSelectedEmployeeIds([]);
    }
  };

  const handleSelectEmployee = (id, checked) => {
    if (checked) {
      setSelectedEmployeeIds([...selectedEmployeeIds, id]);
    } else {
      setSelectedEmployeeIds(selectedEmployeeIds.filter(x => x !== id));
    }
  };

  const handleBulkDelete = async () => {
    if (selectedEmployeeIds.length === 0) return;
    if (!window.confirm(`Kya aap sach me in ${selectedEmployeeIds.length} employees ko ek sath delete karna chahte hain? Ye action permanent hai.`)) {
      return;
    }
    try {
      await Promise.all(selectedEmployeeIds.map(id => api.deleteEmployee(id)));
      setEmployees(employees.filter(emp => !selectedEmployeeIds.includes(emp.id)));
      setSelectedEmployeeIds([]);
      alert("Chune hue employees successfully delete ho gaye!");
    } catch (err) {
      alert("Kuch employees delete karne me error aayi: " + err.message);
    }
  };

  const togglePasswordMask = (id) => {
    if (unmaskedEmpIds.includes(id)) {
      setUnmaskedEmpIds(unmaskedEmpIds.filter(x => x !== id));
    } else {
      setUnmaskedEmpIds([...unmaskedEmpIds, id]);
    }
  };

  const handleCopyCredentials = async (emp) => {
    let password = emp.tempPassword;
    if (!password) {
      password = 'Pass_' + Math.floor(1000 + Math.random() * 9000);
      try {
        await api.updateEmployee(emp.id, { password });
        setEmployees(prev => prev.map(e => e.id === emp.id ? { ...e, tempPassword: password } : e));
      } catch (err) {
        console.error("Auto-password set failed:", err);
      }
    }
    navigator.clipboard.writeText(`Employee ID: ${emp.id}\nEmail: ${emp.email}\nPassword: ${password}`);
    alert('Credentials copied to clipboard!');
  };

  const handleWhatsAppShare = async (emp) => {
    let password = emp.tempPassword;
    if (!password) {
      password = 'Pass_' + Math.floor(1000 + Math.random() * 9000);
      try {
        await api.updateEmployee(emp.id, { password });
        setEmployees(prev => prev.map(e => e.id === emp.id ? { ...e, tempPassword: password } : e));
      } catch (err) {
        console.error("Auto-password set failed:", err);
      }
    }
    const text = `Hi ${emp.name}!\nWelcome to the team. Here are your HRMS Portal Login Credentials:\n\n*Portal URL:* https://gold-stork-993357.hostingersite.com\n*Employee ID:* ${emp.id}\n*Password:* ${password}\n\nPlease change your password after logging in.`;
    const phoneNum = emp.phone ? String(emp.phone).replace(/[^0-9]/g, '') : '';
    const formattedPhone = phoneNum.length === 10 ? `91${phoneNum}` : phoneNum;
    window.open(`https://api.whatsapp.com/send?phone=${formattedPhone}&text=${encodeURIComponent(text)}`, '_blank');
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <AnimatePresence mode="wait">
        
        {/* VIEW 1: Directory List View */}
        {viewMode === 'list' && (
          <motion.div
            key="list"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.2 }}
            style={{ display: 'flex', flexDirection: 'column', gap: 24 }}
          >
            {/* KPI Cards Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 16 }}>
              <div className="premium-card" style={{ padding: 20 }}>
                <span className="premium-label" style={{ fontSize: '0.65rem' }}>Total Employees</span>
                <h4 style={{ fontSize: '1.5rem', fontWeight: 800, marginTop: 6 }} className="number-font">
                  {(employees || []).length}
                </h4>
              </div>
              <div className="premium-card" style={{ padding: 20 }}>
                <span className="premium-label" style={{ fontSize: '0.65rem' }}>Active Employees</span>
                <h4 style={{ fontSize: '1.5rem', fontWeight: 800, marginTop: 6, color: 'var(--color-success)' }} className="number-font">
                  {(employees || []).filter(e => e && e.status === 'Active').length}
                </h4>
              </div>
              <div className="premium-card" style={{ padding: 20 }}>
                <span className="premium-label" style={{ fontSize: '0.65rem' }}>New Joiners (30d)</span>
                <h4 style={{ fontSize: '1.5rem', fontWeight: 800, marginTop: 6, color: 'var(--color-primary)' }} className="number-font">
                  4
                </h4>
              </div>
              <div className="premium-card" style={{ padding: 20 }}>
                <span className="premium-label" style={{ fontSize: '0.65rem' }}>On Notice Period</span>
                <h4 style={{ fontSize: '1.5rem', fontWeight: 800, marginTop: 6, color: 'var(--color-warning)' }} className="number-font">
                  1
                </h4>
              </div>
              <div className="premium-card" style={{ padding: 20 }}>
                <span className="premium-label" style={{ fontSize: '0.65rem' }}>Interns & Trainees</span>
                <h4 style={{ fontSize: '1.5rem', fontWeight: 800, marginTop: 6, color: 'var(--color-accent)' }} className="number-font">
                  2
                </h4>
              </div>
            </div>

            {/* Subscription Seat Quota Banner */}
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '12px 18px',
              borderRadius: '12px',
              background: isSeatLimitReached ? 'rgba(239, 68, 68, 0.08)' : 'rgba(99, 102, 241, 0.05)',
              border: isSeatLimitReached ? '1px solid rgba(239, 68, 68, 0.3)' : '1px solid rgba(99, 102, 241, 0.2)',
              marginBottom: 12,
              flexWrap: 'wrap',
              gap: 10
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span style={{ fontSize: '1.25rem' }}>{isSeatLimitReached ? '⚠️' : '👥'}</span>
                <div>
                  <div style={{ fontWeight: 700, fontSize: '0.85rem', color: isSeatLimitReached ? '#ef4444' : 'var(--color-text-primary)' }}>
                    Subscription Seat Limit: {currentEmpCount} / {seatLimit} Seats Allocated
                  </div>
                  <div style={{ fontSize: '0.75rem', color: isSeatLimitReached ? '#dc2626' : 'var(--color-text-secondary)' }}>
                    {isSeatLimitReached 
                      ? 'Seat quota reached! Cannot create additional employee or manager credentials until upgraded.' 
                      : `${seatLimit - currentEmpCount} seat(s) remaining for new team members.`}
                  </div>
                </div>
              </div>
              {isSeatLimitReached && (
                <button
                  onClick={() => setShowUpgradeModal(true)}
                  style={{
                    padding: '6px 14px',
                    fontSize: '0.78rem',
                    fontWeight: 700,
                    background: '#ef4444',
                    color: '#fff',
                    borderRadius: '8px',
                    border: 'none',
                    cursor: 'pointer'
                  }}
                >
                  Upgrade Plan 🚀
                </button>
              )}
            </div>

            {/* Directory Sub-tab Switcher */}
            <div style={{ display: 'flex', gap: 12, borderBottom: '1px solid var(--color-border)', paddingBottom: 2, marginBottom: 8 }}>
              <button
                onClick={() => setDirSubTab('directory')}
                className={`premium-btn ${dirSubTab === 'directory' ? 'premium-btn-primary' : 'premium-btn-secondary'}`}
                style={{ padding: '8px 18px', fontSize: '0.8rem', borderRadius: '10px 10px 0 0', borderBottom: 'none' }}
              >
                <Users size={14} style={{ marginRight: 6 }} />
                <span>Workforce Directory</span>
              </button>
              <button
                onClick={() => setDirSubTab('credentials')}
                className={`premium-btn ${dirSubTab === 'credentials' ? 'premium-btn-primary' : 'premium-btn-secondary'}`}
                style={{ padding: '8px 18px', fontSize: '0.8rem', borderRadius: '10px 10px 0 0', borderBottom: 'none' }}
              >
                <Key size={14} style={{ marginRight: 6 }} />
                <span>Credentials Hub 🔒</span>
              </button>
            </div>

            {/* Search Bar & Filters Block */}
            <div className="premium-card" style={{ padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: 16 }}>
              
              {/* Search input */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, background: 'rgba(0,0,0,0.01)', border: '1px solid var(--color-border)', borderRadius: 12, padding: '4px 14px' }}>
                <Search size={16} style={{ color: 'var(--color-text-tertiary)' }} />
                <input 
                  type="text" 
                  value={localSearch}
                  onChange={(e) => setLocalSearch(e.target.value)}
                  className="premium-input"
                  style={{ border: 'none', background: 'transparent', padding: '8px 0', width: '100%', outline: 'none', boxShadow: 'none' }}
                  placeholder="Search by employee name, email, or designation..."
                />
                {localSearch && (
                  <button onClick={() => setLocalSearch('')} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--color-text-tertiary)' }}>
                    <X size={16} />
                  </button>
                )}
              </div>

              {/* Filters & Actions Sub-row */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 12 }}>
                  <div>
                    <label className="premium-label" style={{ marginBottom: 4 }}>Department</label>
                    <select 
                      value={deptFilter} 
                      onChange={(e) => setDeptFilter(e.target.value)}
                      className="premium-input"
                    >
                      <option value="All">All Departments</option>
                      <option value="Engineering">Engineering</option>
                      <option value="Design">Design</option>
                      <option value="Marketing">Marketing</option>
                      <option value="Sales">Sales</option>
                      <option value="HR">HR</option>
                    </select>
                  </div>
                  <div>
                    <label className="premium-label" style={{ marginBottom: 4 }}>Status</label>
                    <select 
                      value={statusFilter} 
                      onChange={(e) => setStatusFilter(e.target.value)}
                      className="premium-input"
                    >
                      <option value="All">All Statuses</option>
                      <option value="Active">Active</option>
                      <option value="On Leave">On Leave</option>
                      <option value="Suspended">Suspended</option>
                    </select>
                  </div>
                  <div>
                    <label className="premium-label" style={{ marginBottom: 4 }}>Designation</label>
                    <select 
                      value={desgFilter} 
                      onChange={(e) => setDesgFilter(e.target.value)}
                      className="premium-input"
                    >
                      <option value="All">All Designations</option>
                      <option value="Senior UX Designer">Senior UX Designer</option>
                      <option value="Engineering Tech Lead">Engineering Tech Lead</option>
                      <option value="Growth Lead Analyst">Growth Analyst</option>
                      <option value="Sales Partner">Sales Partner</option>
                      <option value="HR Director">HR Director</option>
                      <option value="Operations Director">Ops Director</option>
                    </select>
                  </div>
                  <div>
                    <label className="premium-label" style={{ marginBottom: 4 }}>Branch Location</label>
                    <select 
                      value={branchFilter} 
                      onChange={(e) => setBranchFilter(e.target.value)}
                      className="premium-input"
                    >
                      <option value="All">All Branches</option>
                      <option value="New York HQ">New York HQ</option>
                      <option value="London Tech Hub">London Tech Hub</option>
                    </select>
                  </div>
                  <div>
                    <label className="premium-label" style={{ marginBottom: 4 }}>Employment Type</label>
                    <select 
                      value={typeFilter} 
                      onChange={(e) => setTypeFilter(e.target.value)}
                      className="premium-input"
                    >
                      <option value="All">All Types</option>
                      <option value="Full-time">Full-time</option>
                      <option value="Contract">Contract</option>
                      <option value="Intern">Intern</option>
                    </select>
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
                  <input 
                    type="file" 
                    ref={fileInputRef} 
                    onChange={handleImportCSV} 
                    accept=".csv" 
                    style={{ display: 'none' }} 
                  />
                  <button onClick={() => isSeatLimitReached ? setShowUpgradeModal(true) : handleImport()} className="premium-btn premium-btn-secondary" style={{ padding: '8px 14px' }}>
                    <Upload size={14} />
                    <span>Import</span>
                  </button>
                  <button onClick={dirSubTab === 'credentials' ? handleExportCredentialsCSV : handleExport} className="premium-btn premium-btn-secondary" style={{ padding: '8px 14px' }}>
                    <Download size={14} />
                    <span>Export</span>
                  </button>
                  <button onClick={() => isSeatLimitReached ? setShowUpgradeModal(true) : setViewMode('add')} className="premium-btn premium-btn-primary" style={{ padding: '8px 16px', background: isSeatLimitReached ? '#ef4444' : undefined }}>
                    <Plus size={16} />
                    <span>{isSeatLimitReached ? 'Seat Limit Reached' : 'Add Employee'}</span>
                  </button>
                </div>
              </div>
            </div>

             {/* Bulk Actions Panel */}
             {selectedEmployeeIds.length > 0 && (
              <motion.div 
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'center', 
                  background: 'rgba(239, 68, 68, 0.08)', 
                  border: '1px solid rgba(239, 68, 68, 0.25)', 
                  borderRadius: '12px', 
                  padding: '12px 20px',
                  marginBottom: '16px' 
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#f87171' }}>
                    ⚡ Bulk Actions: {selectedEmployeeIds.length} Employee(s) Selected
                  </span>
                </div>
                <div style={{ display: 'flex', gap: 10 }}>
                  <button 
                    onClick={() => setSelectedEmployeeIds([])}
                    className="premium-btn premium-btn-secondary"
                    style={{ padding: '6px 14px', fontSize: '0.75rem' }}
                  >
                    Clear Selection
                  </button>
                  <button 
                    onClick={handleBulkDelete}
                    className="premium-btn"
                    style={{ padding: '6px 16px', fontSize: '0.75rem', background: '#ef4444', border: '1px solid #dc2626', color: '#fff' }}
                  >
                    <Trash2 size={13} style={{ marginRight: 4 }} />
                    Delete Selected
                  </button>
                </div>
              </motion.div>
            )}

            {/* Employee Table matching user upload design */}
            {dirSubTab === 'directory' && (
              <div style={{ maxHeight: '650px', overflowY: 'auto', paddingBottom: '16px', background: 'var(--glass-bg)', borderRadius: '16px', border: '1px solid var(--color-border)' }} className="premium-scrollbar">
                <div className="premium-table-container" style={{ margin: 0 }}>
                  <table className="premium-table">
                    <thead>
                      <tr style={{ background: '#F8FAFC', borderBottom: '1px solid var(--color-border)' }}>
                        <th style={{ padding: '14px 16px', width: '40px', textAlign: 'center' }}>
                          <input 
                            type="checkbox" 
                            checked={filteredEmployees.length > 0 && selectedEmployeeIds.length === filteredEmployees.length}
                            onChange={handleSelectAll}
                            style={{ cursor: 'pointer' }}
                          />
                        </th>
                        <th style={{ padding: '14px 16px', fontSize: '0.8rem', fontWeight: 700, color: 'var(--color-text-secondary)' }}># ID</th>
                        <th style={{ padding: '14px 16px', fontSize: '0.8rem', fontWeight: 700, color: 'var(--color-text-secondary)' }}>
                          <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}><User size={13} /> Name</span>
                        </th>
                        <th style={{ padding: '14px 16px', fontSize: '0.8rem', fontWeight: 700, color: 'var(--color-text-secondary)' }}>
                          <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}><Briefcase size={13} /> Role</span>
                        </th>
                        <th style={{ padding: '14px 16px', fontSize: '0.8rem', fontWeight: 700, color: 'var(--color-text-secondary)' }}>
                          <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}><Award size={13} /> Department</span>
                        </th>
                        <th style={{ padding: '14px 16px', fontSize: '0.8rem', fontWeight: 700, color: 'var(--color-text-secondary)' }}>
                          <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}><ShieldCheck size={13} /> Status</span>
                        </th>
                        <th style={{ padding: '14px 16px', fontSize: '0.8rem', fontWeight: 700, color: 'var(--color-text-secondary)' }}>
                          <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}><FileText size={13} /> KYC Docs</span>
                        </th>
                        <th style={{ padding: '14px 16px', fontSize: '0.8rem', fontWeight: 700, color: 'var(--color-text-secondary)' }}>
                          <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}><Mail size={13} /> Contact</span>
                        </th>
                        <th style={{ padding: '14px 16px', fontSize: '0.8rem', fontWeight: 700, color: 'var(--color-text-secondary)' }}>
                          <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}><Calendar size={13} /> Joined</span>
                        </th>
                        <th style={{ padding: '14px 16px', fontSize: '0.8rem', fontWeight: 700, color: 'var(--color-text-secondary)', textAlign: 'right' }}>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredEmployees.map((emp) => {
                        if (!emp) return null;
                        return (
                          <tr 
                            key={emp.id} 
                            onClick={() => { setSelectedProfile(emp); setViewMode('profile'); }}
                            style={{ cursor: 'pointer', background: selectedEmployeeIds.includes(emp.id) ? 'rgba(239, 68, 68, 0.03)' : 'transparent' }}
                          >
                            {/* Selection Checkbox */}
                            <td style={{ textAlign: 'center' }} onClick={(e) => e.stopPropagation()}>
                              <input 
                                type="checkbox" 
                                checked={selectedEmployeeIds.includes(emp.id)}
                                onChange={(e) => handleSelectEmployee(emp.id, e.target.checked)}
                                style={{ cursor: 'pointer' }}
                              />
                            </td>

                            {/* ID */}
                            <td style={{ fontWeight: 700 }} className="number-font">
                              #{emp.id}
                            </td>

                            {/* Name (Avatar + Name) */}
                            <td>
                              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                <div style={{ width: 32, height: 32, borderRadius: '8px', border: '1px solid var(--color-border)', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(0,0,0,0.03)' }}>
                                  {emp.avatar ? (
                                    <img 
                                      src={emp.avatar} 
                                      alt={emp.name} 
                                      style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                                    />
                                  ) : (
                                    <span style={{ fontSize: '0.9rem', fontWeight: 800, color: 'var(--color-text-secondary)', textTransform: 'uppercase' }}>
                                      {emp.name ? emp.name[0] : 'E'}
                                    </span>
                                  )}
                                </div>
                                <span style={{ fontWeight: 700 }}>{emp.name}</span>
                              </div>
                            </td>

                            {/* Role */}
                            <td style={{ fontWeight: 600, color: 'var(--color-text-secondary)' }}>
                              {emp.designation || emp.role}
                            </td>

                            {/* Department */}
                            <td>
                              {emp.department}
                            </td>

                            {/* Status Pill */}
                            <td>
                              <span style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: 6,
                                padding: '4px 10px',
                                borderRadius: '999px',
                                fontSize: '0.75rem',
                                fontWeight: 600,
                                background: emp.status === 'Active' ? 'rgba(34, 197, 94, 0.12)' : emp.status === 'On Leave' ? 'rgba(234, 179, 8, 0.12)' : 'rgba(100, 116, 139, 0.12)',
                                color: emp.status === 'Active' ? '#22c55e' : emp.status === 'On Leave' ? '#eab308' : '#64748b'
                              }}>
                                <span style={{ width: 6, height: 6, borderRadius: '50%', backgroundColor: emp.status === 'Active' ? '#22c55e' : emp.status === 'On Leave' ? '#eab308' : '#64748b' }} />
                                <span>{emp.status}</span>
                              </span>
                            </td>

                            {/* KYC Documents Status */}
                            <td>
                              {(() => {
                                const uploadedDocs = (emp.documents || []).filter(d => d && (d.fileData ? !d.fileData.startsWith('DEFAULT_') : d.status === 'Uploaded'));
                                const count = uploadedDocs.length;
                                if (count > 0) {
                                  return (
                                    <span 
                                      onClick={(e) => { e.stopPropagation(); setSelectedProfile(emp); setViewMode('profile'); setActiveProfileTab('Documents Vault'); }}
                                      style={{
                                        display: 'inline-flex',
                                        alignItems: 'center',
                                        gap: 4,
                                        padding: '3px 9px',
                                        borderRadius: '999px',
                                        fontSize: '0.75rem',
                                        fontWeight: 700,
                                        background: 'rgba(16, 185, 129, 0.12)',
                                        color: '#10b981',
                                        cursor: 'pointer'
                                      }}
                                      title="Click to view KYC documents"
                                    >
                                      <Check size={11} /> {count} Uploaded
                                    </span>
                                  );
                                }
                                return (
                                  <span style={{
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: 4,
                                    padding: '3px 9px',
                                    borderRadius: '999px',
                                    fontSize: '0.72rem',
                                    fontWeight: 600,
                                    background: 'rgba(148, 163, 184, 0.1)',
                                    color: '#64748b'
                                  }}>
                                    Pending
                                  </span>
                                );
                              })()}
                            </td>

                            {/* Contact */}
                            <td>
                              <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }} onClick={(e) => e.stopPropagation()}>
                                <span style={{
                                  padding: '3px 10px',
                                  borderRadius: '999px',
                                  border: '1px solid rgba(79, 70, 229, 0.15)',
                                  background: 'rgba(79, 70, 229, 0.03)',
                                  color: 'var(--color-primary)',
                                  fontSize: '0.75rem',
                                  fontWeight: 500
                                }}>{emp.email}</span>
                                {emp.phone && (
                                  <span style={{
                                    padding: '3px 10px',
                                    borderRadius: '999px',
                                    border: '1px solid rgba(79, 70, 229, 0.15)',
                                    background: 'rgba(79, 70, 229, 0.03)',
                                    color: 'var(--color-primary)',
                                    fontSize: '0.75rem',
                                    fontWeight: 500
                                  }}>{emp.phone}</span>
                                )}
                              </div>
                            </td>

                            {/* Joined */}
                            <td style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)' }}>
                              {emp.joiningDate || '-'}
                            </td>

                            {/* Actions */}
                            <td style={{ textAlign: 'right' }}>
                              <div 
                                style={{ display: 'inline-flex', gap: 8, justifyContent: 'flex-end', width: '100%' }}
                                onClick={(e) => e.stopPropagation()}
                              >
                                <button 
                                  onClick={() => { setSelectedProfile(emp); setViewMode('profile'); }}
                                  style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--color-primary)', padding: 4 }}
                                  title="View Profile"
                                >
                                  <User size={15} />
                                </button>
                                <button 
                                  onClick={() => handleStartEdit(emp)}
                                  style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--color-text-secondary)', padding: 4 }}
                                  title="Edit"
                                >
                                  <Edit3 size={15} />
                                </button>
                                <button 
                                  onClick={() => handleDeleteEmployee(emp.id)}
                                  style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--color-danger)', padding: 4 }}
                                  title="Delete"
                                >
                                  <Trash2 size={15} />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
                  
                {filteredEmployees.length === 0 && (
                  <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--color-text-tertiary)' }}>
                    No employees matching filters or search queries.
                  </div>
                )}
              </div>
            )}

            {/* Credentials Hub Table */}
            {dirSubTab === 'credentials' && (
              <div style={{ maxHeight: '650px', overflowY: 'auto', paddingBottom: '16px', background: 'var(--glass-bg)', borderRadius: '16px', border: '1px solid var(--color-border)', width: '100%' }} className="premium-scrollbar">
                <div className="premium-table-container" style={{ margin: 0 }}>
                  <table className="premium-table">
                    <thead>
                      <tr style={{ background: '#F8FAFC', borderBottom: '1px solid var(--color-border)' }}>
                        <th style={{ padding: '14px 16px', width: '40px', textAlign: 'center' }}>
                          <input 
                            type="checkbox" 
                            checked={filteredEmployees.length > 0 && selectedEmployeeIds.length === filteredEmployees.length}
                            onChange={handleSelectAll}
                            style={{ cursor: 'pointer' }}
                          />
                        </th>
                        <th style={{ padding: '14px 16px', fontSize: '0.8rem', fontWeight: 700, color: 'var(--color-text-secondary)' }}>Employee ID</th>
                        <th style={{ padding: '14px 16px', fontSize: '0.8rem', fontWeight: 700, color: 'var(--color-text-secondary)' }}>Name</th>
                        <th style={{ padding: '14px 16px', fontSize: '0.8rem', fontWeight: 700, color: 'var(--color-text-secondary)' }}>Email</th>
                        <th style={{ padding: '14px 16px', fontSize: '0.8rem', fontWeight: 700, color: 'var(--color-text-secondary)' }}>Password</th>
                        <th style={{ padding: '14px 16px', fontSize: '0.8rem', fontWeight: 700, color: 'var(--color-text-secondary)', textAlign: 'right' }}>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredEmployees.map((emp) => {
                        if (!emp) return null;
                        const isUnmasked = unmaskedEmpIds.includes(emp.id);
                        return (
                          <tr 
                            key={emp.id} 
                            style={{ background: selectedEmployeeIds.includes(emp.id) ? 'rgba(239, 68, 68, 0.03)' : 'transparent' }}
                          >
                            {/* Checkbox */}
                            <td style={{ textAlign: 'center' }}>
                              <input 
                                type="checkbox" 
                                checked={selectedEmployeeIds.includes(emp.id)}
                                onChange={(e) => handleSelectEmployee(emp.id, e.target.checked)}
                                style={{ cursor: 'pointer' }}
                              />
                            </td>
                            {/* Employee ID */}
                            <td style={{ fontWeight: 700 }} className="number-font">
                              #{emp.id}
                            </td>
                            {/* Name */}
                            <td style={{ fontWeight: 700 }}>
                              {emp.name}
                            </td>
                            {/* Email */}
                            <td style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)' }}>
                              {emp.email}
                            </td>
                            {/* Password with mask toggle */}
                            <td>
                              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                <span style={{ 
                                  fontFamily: 'monospace', 
                                  fontSize: '0.85rem', 
                                  color: isUnmasked ? '#059669' : 'var(--color-text-secondary)', 
                                  fontWeight: 'bold',
                                  letterSpacing: isUnmasked ? '0px' : '3px'
                                }}>
                                  {isUnmasked ? (emp.tempPassword || '••••••••') : '••••••••'}
                                </span>
                                <button
                                  type="button"
                                  onClick={() => togglePasswordMask(emp.id)}
                                  style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--color-text-tertiary)', padding: 0, display: 'flex', alignItems: 'center' }}
                                  title={isUnmasked ? "Hide Password" : "Show Password"}
                                >
                                  {isUnmasked ? <EyeOff size={14} /> : <Eye size={14} />}
                                </button>
                              </div>
                            </td>
                            {/* Actions */}
                            <td style={{ textAlign: 'right' }}>
                              <div style={{ display: 'inline-flex', gap: 10, justifyContent: 'flex-end', width: '100%' }}>
                                {/* Copy Credentials */}
                                <button
                                  onClick={() => handleCopyCredentials(emp)}
                                  className="premium-btn premium-btn-secondary"
                                  style={{ padding: '4px 10px', fontSize: '0.7rem' }}
                                  title="Copy Login Details"
                                >
                                  Copy
                                </button>
                                {/* Share via WhatsApp */}
                                <button
                                  onClick={() => handleWhatsAppShare(emp)}
                                  className="premium-btn premium-btn-secondary"
                                  style={{ padding: '4px 10px', fontSize: '0.7rem', color: '#25D366', borderColor: 'rgba(37, 211, 102, 0.3)' }}
                                  title="Share to WhatsApp"
                                >
                                  WhatsApp
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
                {filteredEmployees.length === 0 && (
                  <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--color-text-tertiary)' }}>
                    No employees matching filters or search queries.
                  </div>
                )}
              </div>
            )}
          </motion.div>
        )}

        {/* VIEW 2: Add Employee View */}
        {viewMode === 'add' && (
          <motion.div
            key="add"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            className="premium-card"
            style={{ padding: 32, display: 'flex', flexDirection: 'column', gap: 24 }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
              <button 
                onClick={() => { setViewMode('list'); resetForm(); }}
                className="premium-btn premium-btn-secondary"
                style={{ padding: 8, borderRadius: 10 }}
              >
                <ArrowLeft size={16} />
              </button>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 800, margin: 0 }}>Add New Employee</h3>
            </div>

            <form onSubmit={handleAddEmployee} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
              {/* Profile Photo / Avatar Upload */}
              <div className="premium-form-group" style={{ display: 'flex', alignItems: 'center', gap: 16, padding: 12, borderRadius: 12, border: '1px solid var(--color-border)', background: 'rgba(0,0,0,0.01)' }}>
                <div style={{
                  position: 'relative',
                  width: 68,
                  height: 68,
                  borderRadius: '50%',
                  overflow: 'hidden',
                  background: 'var(--color-bg-secondary, #f1f5f9)',
                  border: '2px solid var(--color-border, #e2e8f0)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0
                }}>
                  {newAvatar ? (
                    <img src={newAvatar} alt="Employee Avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  ) : (
                    <User size={30} style={{ color: 'var(--color-text-tertiary, #94a3b8)' }} />
                  )}
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  <label className="premium-label" style={{ margin: 0, fontWeight: 700 }}>Employee Profile Photo</label>
                  <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                    <label style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 6,
                      padding: '6px 14px',
                      background: 'var(--color-primary)',
                      color: 'white',
                      borderRadius: 8,
                      fontSize: '0.75rem',
                      fontWeight: 600,
                      cursor: 'pointer'
                    }}>
                      <Camera size={14} />
                      <span>{isUploadingPhoto ? 'Compressing...' : newAvatar ? 'Change Photo' : 'Upload Photo'}</span>
                      <input 
                        type="file" 
                        accept="image/*" 
                        onChange={handlePhotoUpload} 
                        style={{ display: 'none' }} 
                      />
                    </label>
                    {newAvatar && (
                      <button 
                        type="button" 
                        onClick={() => setNewAvatar('')}
                        style={{
                          background: 'none',
                          border: 'none',
                          color: '#ef4444',
                          fontSize: '0.75rem',
                          cursor: 'pointer',
                          padding: '4px 8px'
                        }}
                      >
                        Remove
                      </button>
                    )}
                  </div>
                  <span style={{ fontSize: '0.65rem', color: 'var(--color-text-tertiary)' }}>Supports JPG, PNG, WebP (auto compressed)</span>
                </div>
              </div>

              <div className="premium-form-group">
                <label className="premium-label">Full Name</label>
                <input 
                  type="text" 
                  required 
                  value={newName} 
                  onChange={(e) => setNewName(e.target.value)} 
                  className="premium-input" 
                  placeholder="e.g. John Doe"
                />
              </div>

              <div className="premium-form-group" style={{ border: '1px dashed rgba(255, 255, 255, 0.1)', padding: 12, borderRadius: 8, background: 'rgba(255, 255, 255, 0.02)' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: autoGenerateId ? 0 : 8 }}>
                  <label className="premium-label" style={{ margin: 0, display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
                    <input 
                      type="checkbox" 
                      checked={autoGenerateId} 
                      onChange={(e) => setAutoGenerateId(e.target.checked)} 
                    />
                    <span>Auto-Generate Employee ID</span>
                  </label>
                  {autoGenerateId && (
                    <span style={{ fontSize: '0.75rem', color: 'var(--color-text-tertiary)', fontStyle: 'italic' }}>
                      Auto-generated on submission (e.g. EMP829302)
                    </span>
                  )}
                </div>
                {!autoGenerateId && (
                  <div>
                    <label className="premium-label" style={{ fontSize: '0.75rem', marginBottom: 4 }}>Custom Employee ID</label>
                    <input 
                      type="text" 
                      required 
                      value={customId} 
                      onChange={(e) => setCustomId(e.target.value)} 
                      className="premium-input" 
                      placeholder="e.g. EMP-998"
                    />
                  </div>
                )}
              </div>
              <div className="premium-form-group">
                <label className="premium-label">Email Address</label>
                <input 
                  type="email" 
                  required 
                  value={newEmail} 
                  onChange={(e) => setNewEmail(e.target.value)} 
                  className="premium-input" 
                  placeholder="e.g. john@company.com"
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 18 }}>
                <div className="premium-form-group">
                  <label className="premium-label">Role</label>
                  <input 
                    type="text" 
                    required 
                    value={newRole} 
                    onChange={(e) => setNewRole(e.target.value)} 
                    className="premium-input" 
                    placeholder="e.g. Tech Lead"
                  />
                </div>
                <div className="premium-form-group">
                  <label className="premium-label" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span>Department</span>
                    <button 
                      type="button" 
                      onClick={() => setShowCustomDeptInput(!showCustomDeptInput)} 
                      style={{ border: 'none', background: 'transparent', color: 'var(--color-primary)', cursor: 'pointer', fontSize: '0.7rem', padding: 0 }}
                    >
                      {showCustomDeptInput ? "Use List" : "Add Custom"}
                    </button>
                  </label>
                  {showCustomDeptInput ? (
                    <input 
                      type="text" 
                      required 
                      value={newCustomDept} 
                      onChange={(e) => setNewCustomDept(e.target.value)} 
                      className="premium-input" 
                      placeholder="Type custom department..." 
                    />
                  ) : (
                    <select 
                      value={newDept} 
                      onChange={(e) => setNewDept(e.target.value)} 
                      className="premium-input"
                    >
                      {departments.map((d) => (
                        <option key={d.id} value={d.name}>{d.name}</option>
                      ))}
                      {departments.length === 0 && (
                        <>
                          <option value="Engineering">Engineering</option>
                          <option value="Product Engineering">Product Engineering</option>
                          <option value="Design">Design</option>
                          <option value="Marketing">Marketing</option>
                          <option value="Sales">Sales</option>
                          <option value="HR">HR</option>
                        </>
                      )}
                    </select>
                  )}
                </div>
              </div>

               <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 18 }}>
                 <div className="premium-form-group">
                   <label className="premium-label">Base Salary ({currency}/yr)</label>
                   <input 
                     type="number" 
                     value={newSalary} 
                     onChange={(e) => setNewSalary(e.target.value)} 
                     className="premium-input" 
                     placeholder="75000"
                   />
                 </div>
                 <div className="premium-form-group">
                   <label className="premium-label">Joining Date</label>
                   <input 
                     type="date" 
                     required
                     value={newJoiningDate} 
                     onChange={(e) => setNewJoiningDate(e.target.value)} 
                     className="premium-input" 
                   />
                 </div>
                 <div className="premium-form-group">
                   <label className="premium-label">Status</label>
                   <select 
                     value={newStatus} 
                     onChange={(e) => setNewStatus(e.target.value)} 
                     className="premium-input"
                   >
                     <option value="Active">Active</option>
                     <option value="On Leave">On Leave</option>
                     <option value="Suspended">Suspended</option>
                   </select>
                 </div>
               </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 18 }}>
                <div className="premium-form-group">
                  <label className="premium-label">Reporting Manager</label>
                  <select 
                    value={newManager} 
                    onChange={(e) => setNewManager(e.target.value)} 
                    className="premium-input"
                  >
                    <option value="None">None</option>
                    {employees.map(emp => (
                      <option key={emp.id} value={emp.name}>{emp.name} ({emp.designation || emp.role})</option>
                    ))}
                  </select>
                </div>
                <div className="premium-form-group">
                  <label className="premium-label">System Access Role</label>
                  <select 
                    value={newSystemRole} 
                    onChange={(e) => setNewSystemRole(e.target.value)} 
                    className="premium-input"
                  >
                    <option value="Employee">Employee (Staff)</option>
                    <option value="Manager">Manager</option>
                    <option value="HR">HR Officer</option>
                    <option value="Company Admin">Company Admin</option>
                  </select>
                </div>
              </div>

              <div className="premium-form-group">
                <label className="premium-label">Custom Password (Optional)</label>
                <input 
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="premium-input"
                  placeholder="Leave blank to auto-generate temporary password"
                />
              </div>

              {/* System Role Access Permissions Matrix */}
              <div style={{ borderTop: '1px solid var(--color-border)', paddingTop: 18, display: 'flex', flexDirection: 'column', gap: 10 }}>
                <span className="premium-label" style={{ fontSize: '0.8rem', fontWeight: 800 }}>Role Access & Permissions Configuration</span>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.75rem', cursor: 'pointer' }}>
                    <input 
                      type="checkbox" 
                      checked={newPermissions.viewDirectory} 
                      onChange={(e) => setNewPermissions({ ...newPermissions, viewDirectory: e.target.checked })} 
                    />
                    <span>Read Directory (Full Access)</span>
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.75rem', cursor: 'pointer' }}>
                    <input 
                      type="checkbox" 
                      checked={newPermissions.editProfile} 
                      onChange={(e) => setNewPermissions({ ...newPermissions, editProfile: e.target.checked })} 
                    />
                    <span>Edit Profile Settings</span>
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.75rem', cursor: 'pointer' }}>
                    <input 
                      type="checkbox" 
                      checked={newPermissions.viewPayroll} 
                      onChange={(e) => setNewPermissions({ ...newPermissions, viewPayroll: e.target.checked })} 
                    />
                    <span>Access Payroll & Bank Details</span>
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.75rem', cursor: 'pointer' }}>
                    <input 
                      type="checkbox" 
                      checked={newPermissions.manageDocs} 
                      onChange={(e) => setNewPermissions({ ...newPermissions, manageDocs: e.target.checked })} 
                    />
                    <span>Manage Document Vault</span>
                  </label>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12, borderTop: '1px solid var(--color-border)', paddingTop: 20 }}>
                <button type="button" onClick={() => { setViewMode('list'); resetForm(); }} className="premium-btn premium-btn-secondary">
                  Cancel
                </button>
                <button type="submit" className="premium-btn premium-btn-primary">
                  Create Record
                </button>
              </div>
            </form>
          </motion.div>
        )}

        {/* VIEW 3: Edit Employee View */}
        {viewMode === 'edit' && (
          <motion.div
            key="edit"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            className="premium-card"
            style={{ padding: 32, display: 'flex', flexDirection: 'column', gap: 24 }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
              <button 
                onClick={() => { setViewMode('list'); resetForm(); }}
                className="premium-btn premium-btn-secondary"
                style={{ padding: 8, borderRadius: 10 }}
              >
                <ArrowLeft size={16} />
              </button>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 800, margin: 0 }}>Edit Employee Profile</h3>
            </div>

            <form onSubmit={handleSaveEdit} style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
              {/* Profile Photo / Avatar Upload */}
              <div className="premium-form-group" style={{ display: 'flex', alignItems: 'center', gap: 16, padding: 14, borderRadius: 12, border: '1px solid var(--color-border)', background: 'rgba(0,0,0,0.01)' }}>
                <div style={{
                  position: 'relative',
                  width: 68,
                  height: 68,
                  borderRadius: '50%',
                  overflow: 'hidden',
                  background: 'var(--color-bg-secondary, #f1f5f9)',
                  border: '2px solid var(--color-border, #e2e8f0)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0
                }}>
                  {newAvatar ? (
                    <img src={newAvatar} alt="Employee Avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  ) : (
                    <User size={30} style={{ color: 'var(--color-text-tertiary, #94a3b8)' }} />
                  )}
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  <label className="premium-label" style={{ margin: 0, fontWeight: 700 }}>Employee Profile Photo</label>
                  <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                    <label style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 6,
                      padding: '6px 14px',
                      background: 'var(--color-primary)',
                      color: 'white',
                      borderRadius: 8,
                      fontSize: '0.75rem',
                      fontWeight: 600,
                      cursor: 'pointer'
                    }}>
                      <Camera size={14} />
                      <span>{isUploadingPhoto ? 'Compressing...' : newAvatar ? 'Change Photo' : 'Upload Photo'}</span>
                      <input 
                        type="file" 
                        accept="image/*" 
                        onChange={handlePhotoUpload} 
                        style={{ display: 'none' }} 
                      />
                    </label>
                    {newAvatar && (
                      <button 
                        type="button" 
                        onClick={() => setNewAvatar('')}
                        style={{
                          background: 'none',
                          border: 'none',
                          color: '#ef4444',
                          fontSize: '0.75rem',
                          cursor: 'pointer',
                          padding: '4px 8px'
                        }}
                      >
                        Remove
                      </button>
                    )}
                  </div>
                  <span style={{ fontSize: '0.65rem', color: 'var(--color-text-tertiary)' }}>Supports JPG, PNG, WebP (auto compressed)</span>
                </div>
              </div>
              
              {/* SECTION A: Personal & Contact */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                <h4 style={{ fontSize: '0.9rem', fontWeight: 700, borderBottom: '1px solid var(--color-border)', paddingBottom: 6 }}>Personal & Contact Details</h4>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                  <div className="premium-form-group">
                    <label className="premium-label">Full Name</label>
                    <input type="text" required value={newName} onChange={(e) => setNewName(e.target.value)} className="premium-input" />
                  </div>
                  <div className="premium-form-group">
                    <label className="premium-label">Email Address</label>
                    <input type="email" required value={newEmail} onChange={(e) => setNewEmail(e.target.value)} className="premium-input" />
                  </div>
                  <div className="premium-form-group">
                    <label className="premium-label">Mobile Number</label>
                    <input type="text" value={newPhone} onChange={(e) => setNewPhone(e.target.value)} className="premium-input" />
                  </div>
                  <div className="premium-form-group">
                    <label className="premium-label">Date of Birth</label>
                    <input type="text" value={newDob} onChange={(e) => setNewDob(e.target.value)} className="premium-input" placeholder="e.g. 1992-08-24" />
                  </div>
                  <div className="premium-form-group">
                    <label className="premium-label">Date of Joining</label>
                    <input type="text" value={newJoiningDate} onChange={(e) => setNewJoiningDate(e.target.value)} className="premium-input" placeholder="e.g. 2026-06-01" />
                  </div>
                  <div className="premium-form-group">
                    <label className="premium-label">Gender</label>
                    <input type="text" value={newGender} onChange={(e) => setNewGender(e.target.value)} className="premium-input" />
                  </div>
                  <div className="premium-form-group">
                    <label className="premium-label">Residential Address</label>
                    <input type="text" value={newAddress} onChange={(e) => setNewAddress(e.target.value)} className="premium-input" />
                  </div>
                </div>
              </div>

              {/* SECTION B: Emergency Contact */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                <h4 style={{ fontSize: '0.9rem', fontWeight: 700, borderBottom: '1px solid var(--color-border)', paddingBottom: 6 }}>Emergency Contacts</h4>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                  <div className="premium-form-group">
                    <label className="premium-label">Primary Contact</label>
                    <input type="text" value={newPrimaryContact} onChange={(e) => setNewPrimaryContact(e.target.value)} className="premium-input" />
                  </div>
                  <div className="premium-form-group">
                    <label className="premium-label">Secondary Contact</label>
                    <input type="text" value={newSecondaryContact} onChange={(e) => setNewSecondaryContact(e.target.value)} className="premium-input" />
                  </div>
                </div>
              </div>

              {/* SECTION C: Work & Compensation */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                <h4 style={{ fontSize: '0.9rem', fontWeight: 700, borderBottom: '1px solid var(--color-border)', paddingBottom: 6 }}>Work & Compensation</h4>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                  <div className="premium-form-group">
                    <label className="premium-label">Designation / Role</label>
                    <input type="text" required value={newRole} onChange={(e) => setNewRole(e.target.value)} className="premium-input" />
                  </div>
                  <div className="premium-form-group">
                    <label className="premium-label" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span>Department</span>
                      <button 
                        type="button" 
                        onClick={() => setShowCustomDeptInput(!showCustomDeptInput)} 
                        style={{ border: 'none', background: 'transparent', color: 'var(--color-primary)', cursor: 'pointer', fontSize: '0.7rem', padding: 0 }}
                      >
                        {showCustomDeptInput ? "Use List" : "Add Custom"}
                      </button>
                    </label>
                    {showCustomDeptInput ? (
                      <input 
                        type="text" 
                        required 
                        value={newCustomDept} 
                        onChange={(e) => setNewCustomDept(e.target.value)} 
                        className="premium-input" 
                        placeholder="Type custom department..." 
                      />
                    ) : (
                      <select value={newDept} onChange={(e) => setNewDept(e.target.value)} className="premium-input">
                        {departments.map((d) => (
                          <option key={d.id} value={d.name}>{d.name}</option>
                        ))}
                        {departments.length === 0 && (
                          <>
                            <option value="Engineering">Engineering</option>
                            <option value="Product Engineering">Product Engineering</option>
                            <option value="Design">Design</option>
                            <option value="Marketing">Marketing</option>
                            <option value="Sales">Sales</option>
                            <option value="HR">HR</option>
                          </>
                        )}
                      </select>
                    )}
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 18 }}>
                 <div className="premium-form-group">
                   <label className="premium-label">Base Salary ({currency}/yr)</label>
                   <input 
                     type="number" 
                     value={newSalary} 
                     onChange={(e) => setNewSalary(e.target.value)} 
                     className="premium-input" 
                     placeholder="75000"
                   />
                 </div>
                 <div className="premium-form-group">
                   <label className="premium-label">Joining Date</label>
                   <input 
                     type="date" 
                     required
                     value={newJoiningDate} 
                     onChange={(e) => setNewJoiningDate(e.target.value)} 
                     className="premium-input" 
                   />
                 </div>
                 <div className="premium-form-group">
                   <label className="premium-label">Status</label>
                   <select 
                     value={newStatus} 
                     onChange={(e) => setNewStatus(e.target.value)} 
                     className="premium-input"
                   >
                     <option value="Active">Active</option>
                     <option value="On Leave">On Leave</option>
                     <option value="Suspended">Suspended</option>
                   </select>
                 </div>
               </div>
                  <div className="premium-form-group">
                    <label className="premium-label">Reporting Manager</label>
                    <select value={newManager} onChange={(e) => setNewManager(e.target.value)} className="premium-input">
                      <option value="None">None</option>
                      {employees.map(emp => (
                        <option key={emp.id} value={emp.name}>{emp.name} ({emp.designation || emp.role})</option>
                      ))}
                    </select>
                  </div>
                  <div className="premium-form-group">
                    <label className="premium-label">System Access Role</label>
                    <select value={newSystemRole} onChange={(e) => setNewSystemRole(e.target.value)} className="premium-input">
                      <option value="Employee">Employee (Staff)</option>
                      <option value="Manager">Manager</option>
                      <option value="HR">HR Officer</option>
                      <option value="Company Admin">Company Admin</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* SECTION D: Bank Details */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                <h4 style={{ fontSize: '0.9rem', fontWeight: 700, borderBottom: '1px solid var(--color-border)', paddingBottom: 6 }}>Bank Details</h4>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                  <div className="premium-form-group">
                    <label className="premium-label">Bank Name</label>
                    <input type="text" value={newBankName} onChange={(e) => setNewBankName(e.target.value)} className="premium-input" />
                  </div>
                  <div className="premium-form-group">
                    <label className="premium-label">Account Number</label>
                    <input type="text" value={newAccountNumber} onChange={(e) => setNewAccountNumber(e.target.value)} className="premium-input" />
                  </div>
                  <div className="premium-form-group">
                    <label className="premium-label">IFSC / Routing Code</label>
                    <input type="text" value={newIfsc} onChange={(e) => setNewIfsc(e.target.value)} className="premium-input" />
                  </div>
                </div>
              </div>

              {/* SECTION E: System Role Access Permissions Matrix */}
              <div style={{ borderTop: '1px solid var(--color-border)', paddingTop: 18, display: 'flex', flexDirection: 'column', gap: 10 }}>
                <span className="premium-label" style={{ fontSize: '0.8rem', fontWeight: 800 }}>Role Access & Permissions Configuration</span>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.75rem', cursor: 'pointer' }}>
                    <input 
                      type="checkbox" 
                      checked={newPermissions.viewDirectory} 
                      onChange={(e) => setNewPermissions({ ...newPermissions, viewDirectory: e.target.checked })} 
                    />
                    <span>Read Directory (Full Access)</span>
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.75rem', cursor: 'pointer' }}>
                    <input 
                      type="checkbox" 
                      checked={newPermissions.editProfile} 
                      onChange={(e) => setNewPermissions({ ...newPermissions, editProfile: e.target.checked })} 
                    />
                    <span>Edit Profile Settings</span>
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.75rem', cursor: 'pointer' }}>
                    <input 
                      type="checkbox" 
                      checked={newPermissions.viewPayroll} 
                      onChange={(e) => setNewPermissions({ ...newPermissions, viewPayroll: e.target.checked })} 
                    />
                    <span>Access Payroll & Bank Details</span>
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.75rem', cursor: 'pointer' }}>
                    <input 
                      type="checkbox" 
                      checked={newPermissions.manageDocs} 
                      onChange={(e) => setNewPermissions({ ...newPermissions, manageDocs: e.target.checked })} 
                    />
                    <span>Manage Document Vault</span>
                  </label>
                </div>
              </div>

              {/* SECTION F: Account Security */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                <h4 style={{ fontSize: '0.9rem', fontWeight: 700, borderBottom: '1px solid var(--color-border)', paddingBottom: 6 }}>Account Security</h4>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 16 }}>
                  <div className="premium-form-group">
                    <label className="premium-label">Change Password (Leave blank to keep current password)</label>
                    <input 
                      type="password" 
                      value={newPassword} 
                      onChange={(e) => setNewPassword(e.target.value)} 
                      className="premium-input" 
                      placeholder="Type a new password..." 
                    />
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12, borderTop: '1px solid var(--color-border)', paddingTop: 20 }}>
                <button type="button" onClick={() => { setViewMode('list'); resetForm(); }} className="premium-btn premium-btn-secondary">
                  Cancel
                </button>
                <button type="submit" className="premium-btn premium-btn-primary">
                  Save Settings
                </button>
              </div>
            </form>
          </motion.div>
        )}        {/* VIEW 4: Profile Detail View */}
        {viewMode === 'profile' && selectedProfile && (
          <motion.div
            key="profile"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            style={{ display: 'flex', flexDirection: 'column', gap: 24 }}
          >
            {/* Header row */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
              <button 
                onClick={() => { setViewMode('list'); setSelectedProfile(null); }}
                className="premium-btn premium-btn-secondary"
                style={{ padding: 8, borderRadius: 10 }}
              >
                <ArrowLeft size={16} />
              </button>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 800, margin: 0 }}>Employee Profile Dossier</h3>
            </div>

            {/* Layout Grid */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: '300px 1fr',
              gap: 24,
              alignItems: 'start'
            }}>
              
              {/* LEFT COLUMN: Identity, Actions, & Sidebar Sub-Navigation */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                
                {/* Profile Identity Card */}
                <div className="premium-card" style={{ padding: 24, display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: 16 }}>
                  <div style={{
                    width: 72,
                    height: 72,
                    borderRadius: '50%',
                    overflow: 'hidden',
                    background: 'linear-gradient(135deg, #4F46E5 0%, #06B6D4 100%)',
                    color: 'white',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '1.5rem',
                    fontWeight: 800,
                    boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                  }}>
                    {selectedProfile.avatar || selectedProfile.photo ? (
                      <img src={selectedProfile.avatar || selectedProfile.photo} alt={selectedProfile.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    ) : (
                      selectedProfile.name.split(' ').map(n => n[0]).join('')
                    )}
                  </div>
                  <div>
                    <h4 style={{ fontSize: '1.1rem', fontWeight: 800, margin: 0 }}>{selectedProfile.name}</h4>
                    <span style={{ fontSize: '0.75rem', color: 'var(--color-text-tertiary)', display: 'block', marginTop: 4 }}>
                      Employee ID: {selectedProfile.id}
                    </span>
                    <span className="badge badge-info" style={{ marginTop: 8, fontSize: '0.65rem' }}>
                      {selectedProfile.department || 'Product Engineering'}
                    </span>
                  </div>
                </div>

                {/* Quick Actions Console */}
                <div className="premium-card" style={{ padding: 18, display: 'flex', flexDirection: 'column', gap: 10 }}>
                  <button onClick={() => handleStartEdit(selectedProfile)} className="premium-btn premium-btn-primary" style={{ justifyContent: 'center', width: '100%', fontSize: '0.8rem' }}>
                    <span>Edit Profile</span>
                  </button>
                  <button onClick={() => alert("Password reset trigger email sent to employee.")} className="premium-btn premium-btn-secondary" style={{ justifyContent: 'center', width: '100%', fontSize: '0.8rem' }}>
                    <span>Change Password</span>
                  </button>
                  <button onClick={() => setShowIdCardModal(true)} className="premium-btn premium-btn-secondary" style={{ justifyContent: 'center', width: '100%', fontSize: '0.8rem' }}>
                    <span>Generate ID Pass</span>
                  </button>
                </div>

                {/* Sidebar Navigation Options */}
                <div className="premium-card" style={{ padding: '10px 8px', display: 'flex', flexDirection: 'column', gap: 6 }}>
                  {[
                    'Personal Info', 'Employment Details', 'Portal Credentials', 'Documents Vault', 'Bank Details', 'Attendance Logs'
                  ].map(tab => (
                    <button
                      key={tab}
                      onClick={() => setActiveProfileTab(tab)}
                      className={`premium-btn ${activeProfileTab === tab ? 'chrome-box-active' : 'chrome-box-inactive'}`}
                      style={{
                        padding: '10px 14px',
                        fontSize: '0.8rem',
                        borderRadius: 10,
                        justifyContent: 'flex-start',
                        width: '100%',
                        border: 'none',
                        textAlign: 'left'
                      }}
                    >
                      {tab}
                    </button>
                  ))}
                </div>

              </div>

              {/* RIGHT COLUMN: Tab content rendering */}
              <div style={{ minHeight: 400 }}>
                <AnimatePresence mode="wait">
                  
                  {/* TAB 1: Personal Info */}
                  {activeProfileTab === 'Personal Info' && (
                    <motion.div
                      key="personal-info"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      style={{ display: 'flex', flexDirection: 'column', gap: 20 }}
                    >
                      {/* Personal Information Card */}
                      <div className="premium-card" style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 16 }}>
                        <h3 style={{ fontSize: '0.95rem', fontWeight: 800, borderBottom: '1px solid var(--color-border)', paddingBottom: 10 }}>Personal Information</h3>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, fontSize: '0.85rem' }}>
                          <div>
                            <span className="premium-label" style={{ fontSize: '0.65rem' }}>Full Name</span>
                            <div style={{ fontWeight: 600, marginTop: 4 }}>{selectedProfile.name}</div>
                          </div>
                          <div>
                            <span className="premium-label" style={{ fontSize: '0.65rem' }}>Email Address</span>
                            <div style={{ fontWeight: 600, marginTop: 4 }}>
                              <a href={`mailto:${selectedProfile.email}`} style={{ color: 'var(--color-primary)', textDecoration: 'underline' }}>
                                {selectedProfile.email}
                              </a>
                            </div>
                          </div>
                          <div>
                            <span className="premium-label" style={{ fontSize: '0.65rem' }}>Mobile Number</span>
                            <div style={{ fontWeight: 600, marginTop: 4 }}>
                              <a href={`tel:${selectedProfile.phone || '+1 (555) 382-9021'}`} style={{ color: 'var(--color-primary)', textDecoration: 'underline' }}>
                                {selectedProfile.phone || '+1 (555) 382-9021'}
                              </a>
                            </div>
                          </div>
                          <div>
                            <span className="premium-label" style={{ fontSize: '0.65rem' }}>Date of Birth</span>
                            <div style={{ fontWeight: 600, marginTop: 4 }}>{selectedProfile.dob || '1992-08-24'}</div>
                          </div>
                          <div>
                            <span className="premium-label" style={{ fontSize: '0.65rem' }}>Gender</span>
                            <div style={{ fontWeight: 600, marginTop: 4 }}>{selectedProfile.gender || 'Male'}</div>
                          </div>
                          <div style={{ gridColumn: 'span 2' }}>
                            <span className="premium-label" style={{ fontSize: '0.65rem' }}>Residential Address</span>
                            <div style={{ fontWeight: 600, marginTop: 4, lineHeight: 1.4 }}>
                              {selectedProfile.address || '482 Silver Lake Blvd, Los Angeles, CA 90026'}
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Emergency Contacts Card */}
                      <div className="premium-card" style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 16 }}>
                        <h3 style={{ fontSize: '0.95rem', fontWeight: 800, borderBottom: '1px solid var(--color-border)', paddingBottom: 10 }}>Emergency Contacts</h3>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, fontSize: '0.85rem' }}>
                          <div>
                            <span className="premium-label" style={{ fontSize: '0.65rem' }}>Primary Contact Details</span>
                            <div style={{ fontWeight: 600, marginTop: 4, lineHeight: 1.4 }}>{selectedProfile.primaryContact || 'Jane Wright (Spouse) - +1 (555) 382-9029'}</div>
                          </div>
                          <div>
                            <span className="premium-label" style={{ fontSize: '0.65rem' }}>Secondary Contact Details</span>
                            <div style={{ fontWeight: 600, marginTop: 4, lineHeight: 1.4 }}>{selectedProfile.secondaryContact || 'Robert Wright (Father) - +1 (555) 492-0210'}</div>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {/* TAB 2: Employment Details */}
                  {activeProfileTab === 'Employment Details' && (
                    <motion.div
                      key="employment-details"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="premium-card"
                      style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 16 }}
                    >
                      <h3 style={{ fontSize: '0.95rem', fontWeight: 800, borderBottom: '1px solid var(--color-border)', paddingBottom: 10 }}>Employment Details</h3>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, fontSize: '0.85rem' }}>
                        <div>
                          <span className="premium-label" style={{ fontSize: '0.65rem' }}>Employee ID</span>
                          <div style={{ fontWeight: 600, marginTop: 4 }}>{selectedProfile.id}</div>
                        </div>
                        <div>
                          <span className="premium-label" style={{ fontSize: '0.65rem' }}>Department</span>
                          <div style={{ fontWeight: 600, marginTop: 4 }}>{selectedProfile.department || 'Product Engineering'}</div>
                        </div>
                        <div>
                          <span className="premium-label" style={{ fontSize: '0.65rem' }}>Designation</span>
                          <div style={{ fontWeight: 600, marginTop: 4 }}>{selectedProfile.designation || selectedProfile.role || 'Senior Software Engineer'}</div>
                        </div>
                        <div>
                          <span className="premium-label" style={{ fontSize: '0.65rem' }}>Employment Type</span>
                          <div style={{ fontWeight: 600, marginTop: 4 }}>Full-Time Permanent</div>
                        </div>
                        <div>
                          <span className="premium-label" style={{ fontSize: '0.65rem' }}>Joining Date</span>
                          <div style={{ fontWeight: 600, marginTop: 4 }}>{selectedProfile.joiningDate || selectedProfile.joining_date || '2023-03-15'}</div>
                        </div>
                        <div>
                          <span className="premium-label" style={{ fontSize: '0.65rem' }}>Reporting Manager</span>
                          <div style={{ fontWeight: 600, marginTop: 4 }}>{selectedProfile.reportingManager || 'None'}</div>
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {/* TAB 3: Documents Vault */}
                  {activeProfileTab === 'Documents Vault' && (
                    <motion.div
                      key="documents-vault"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="premium-card"
                      style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 16 }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--color-border)', paddingBottom: 10 }}>
                        <h3 style={{ fontSize: '0.95rem', fontWeight: 800, margin: 0 }}>Document Verification Center</h3>
                        <div style={{ display: 'flex', gap: 10 }}>
                          <input 
                            type="file" 
                            id="doc-upload" 
                            style={{ display: 'none' }} 
                            onChange={(e) => {
                              const file = e.target.files[0];
                              if (!file) return;
                              
                              const reader = new FileReader();
                              reader.onloadend = async () => {
                                const base64Data = reader.result;
                                const docId = file.name.toLowerCase().replace(/[^a-z0-9]+/g, "-");
                                const docName = file.name.replace(/\.[^/.]+$/, "").replace(/_/g, " ");
                                const newDoc = {
                                  id: docId,
                                  name: docName,
                                  type: file.type.startsWith("image/") ? "photo" : (file.name.endsWith(".pdf") ? "resume" : "other"),
                                  status: "Uploaded",
                                  uploadedDate: new Date().toISOString().split('T')[0],
                                  fileType: file.type,
                                  fileData: base64Data,
                                  fileName: file.name
                                };

                                // Ensure current documents are parsed correctly if they are strings or objects
                                const currentDocs = Array.isArray(selectedProfile.documents) 
                                  ? selectedProfile.documents.map(d => typeof d === 'string' ? { id: d.toLowerCase().replace(/[^a-z0-9]+/g, "-"), name: d.replace(/_/g, ' '), fileName: d, fileData: '' } : d) 
                                  : [];
                                
                                const updatedDocs = [...currentDocs];
                                const existingIdx = updatedDocs.findIndex(d => d && (d.fileName === file.name || d.id === docId));
                                if (existingIdx > -1) {
                                  updatedDocs[existingIdx] = newDoc;
                                } else {
                                  updatedDocs.push(newDoc);
                                }

                                try {
                                  await api.updateEmployee(selectedProfile.id, { documents: updatedDocs });
                                  setSelectedProfile({ ...selectedProfile, documents: updatedDocs });
                                  setEmployees(employees.map(emp => 
                                    emp.id === selectedProfile.id 
                                      ? { ...emp, documents: updatedDocs }
                                      : emp
                                  ));
                                  alert(`Document "${file.name}" uploaded successfully!`);
                                } catch (err) {
                                  alert("Failed to save uploaded document: " + err.message);
                                }
                              };
                              reader.readAsDataURL(file);
                            }} 
                          />
                          <label htmlFor="doc-upload" className="premium-btn premium-btn-primary" style={{ padding: '6px 12px', fontSize: '0.75rem', cursor: 'pointer' }}>
                            Upload Document
                          </label>
                        </div>
                      </div>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginTop: 10 }}>
                        {(selectedProfile.documents && selectedProfile.documents.length > 0 
                          ? selectedProfile.documents.map(d => typeof d === 'string' ? { id: d.toLowerCase().replace(/[^a-z0-9]+/g, "-"), name: d.replace(/_/g, ' '), fileName: d, fileData: '' } : d)
                          : [
                            { id: 'profile-photo', name: 'Profile Photo', fileData: '', fileName: 'Profile_Photo.jpg', type: 'photo' },
                            { id: 'aadhaar', name: 'Aadhaar Card', fileData: '', fileName: 'Aadhaar_Card.pdf', type: 'aadhaar' },
                            { id: 'pan', name: 'PAN Card', fileData: '', fileName: 'PAN_Card.pdf', type: 'pan' },
                            { id: 'experience', name: 'Experience Letter', fileData: '', fileName: 'Experience_Letter.pdf', type: 'exp-letter' },
                            { id: 'bank-passbook', name: 'Bank Passbook', fileData: '', fileName: 'Bank_Passbook.pdf', type: 'bank-cheque' },
                            { id: 'cancelled-cheque', name: 'Cancelled Cheque', fileData: '', fileName: 'Cancelled_Cheque.pdf', type: 'bank-cheque' },
                            { id: 'offer-letter', name: 'Offer Letter', fileData: '', fileName: 'Offer_Letter.pdf', type: 'offer-letter' },
                            { id: 'appointment-letter', name: 'Appointment Letter', fileData: '', fileName: 'Appointment_Letter.pdf', type: 'appointment-letter' }
                          ]
                        ).map((doc, idx) => {
                          const docName = doc.name || (typeof doc === 'string' ? doc.replace(/_/g, ' ') : 'KYC Document');
                          const isUploaded = doc.status === 'Uploaded' || (doc.fileData && !doc.fileData.startsWith('DEFAULT_') && doc.fileData.startsWith('data:'));
                          return (
                            <div key={idx} style={{ display: 'flex', flexDirection: 'column', gap: 10, padding: 14, borderRadius: 14, border: `1px solid ${isUploaded ? 'rgba(16, 185, 129, 0.3)' : 'var(--color-border)'}`, background: isUploaded ? 'rgba(16, 185, 129, 0.02)' : 'rgba(0,0,0,0.01)' }}>
                              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                  <FileText size={16} style={{ color: isUploaded ? '#10b981' : 'var(--color-text-secondary)' }} />
                                  <span style={{ fontSize: '0.85rem', fontWeight: 700 }}>{docName}</span>
                                </div>
                                <span style={{
                                  padding: '2px 8px',
                                  borderRadius: '6px',
                                  fontSize: '0.65rem',
                                  fontWeight: 700,
                                  background: isUploaded ? 'rgba(16, 185, 129, 0.12)' : 'rgba(245, 158, 11, 0.12)',
                                  color: isUploaded ? '#10b981' : '#f59e0b',
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: 4
                                }}>
                                  {isUploaded ? <><Check size={10} /> Uploaded</> : 'Pending'}
                                </span>
                              </div>

                              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.72rem', color: 'var(--color-text-secondary)' }}>
                                <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '180px' }} title={doc.fileName || 'document_file'}>
                                  📁 {doc.fileName || (isUploaded ? 'uploaded_file' : 'Not submitted')}
                                </span>
                                {doc.uploadedDate && (
                                  <span>{doc.uploadedDate}</span>
                                )}
                              </div>

                              <div style={{ display: 'flex', gap: 8, marginTop: 4, borderTop: '1px dashed var(--color-border)', paddingTop: 8 }}>
                                <button 
                                  onClick={() => setActiveDocPreview(doc)} 
                                  className="premium-btn premium-btn-secondary"
                                  style={{ padding: '4px 10px', fontSize: '0.72rem', display: 'flex', alignItems: 'center', gap: 4 }}
                                >
                                  <Eye size={12} /> View
                                </button>
                                {isUploaded && doc.fileData && doc.fileData.startsWith('data:') && (
                                  <button 
                                    onClick={() => {
                                      const link = document.createElement("a");
                                      link.href = doc.fileData;
                                      link.download = doc.fileName || `${docName.toLowerCase().replace(/\s+/g, '_')}.png`;
                                      document.body.appendChild(link);
                                      link.click();
                                      document.body.removeChild(link);
                                    }}
                                    className="premium-btn premium-btn-secondary"
                                    style={{ padding: '4px 10px', fontSize: '0.72rem', display: 'flex', alignItems: 'center', gap: 4 }}
                                  >
                                    <Download size={12} /> Download
                                  </button>
                                )}
                                <button 
                                  onClick={async () => {
                                    if (!window.confirm(`Are you sure you want to delete "${docName}"?`)) return;
                                    const updatedDocs = (selectedProfile.documents || []).filter(d => {
                                      const compareDoc = typeof d === 'string' ? { id: d.toLowerCase().replace(/[^a-z0-9]+/g, "-"), fileName: d } : d;
                                      return compareDoc.id ? compareDoc.id !== doc.id : compareDoc.fileName !== doc.fileName;
                                    });
                                    try {
                                      await api.updateEmployee(selectedProfile.id, { documents: updatedDocs });
                                      setSelectedProfile({ ...selectedProfile, documents: updatedDocs });
                                      setEmployees(employees.map(emp => 
                                        emp.id === selectedProfile.id 
                                          ? { ...emp, documents: updatedDocs }
                                          : emp
                                      ));
                                      alert(`Document "${docName}" removed successfully!`);
                                    } catch (err) {
                                      alert("Failed to delete document: " + err.message);
                                    }
                                  }} 
                                  style={{ border: 'none', background: 'transparent', cursor: 'pointer', color: 'var(--color-danger)', fontSize: '0.72rem', fontWeight: 600, marginLeft: 'auto' }}
                                >
                                  Delete
                                </button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </motion.div>
                  )}

                  {/* TAB 4: Bank Details */}
                  {activeProfileTab === 'Bank Details' && (
                    <motion.div
                      key="bank-details"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      style={{ display: 'flex', flexDirection: 'column', gap: 20 }}
                    >
                      {/* Bank Details block */}
                      <div className="premium-card" style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 16 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--color-border)', paddingBottom: 10 }}>
                          <h3 style={{ fontSize: '0.95rem', fontWeight: 800, margin: 0 }}>Bank Details</h3>
                          <button onClick={() => handleStartEdit(selectedProfile)} className="premium-btn premium-btn-primary" style={{ padding: '6px 12px', fontSize: '0.75rem' }}>
                            Edit Bank Details
                          </button>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, fontSize: '0.85rem', marginTop: 10 }}>
                          <div>
                            <span className="premium-label" style={{ fontSize: '0.65rem' }}>Bank Name</span>
                            <div style={{ fontWeight: 600, marginTop: 4 }}>{selectedProfile.bankName || 'ITLC Silicon Bank, NA'}</div>
                          </div>
                          <div>
                            <span className="premium-label" style={{ fontSize: '0.65rem' }}>Account Number</span>
                            <div className="number-font" style={{ fontWeight: 600, marginTop: 4 }}>
                              {selectedProfile.accountNumber && !selectedProfile.accountNumber.includes('*') 
                                ? selectedProfile.accountNumber 
                                : '30234928430'}
                            </div>
                          </div>
                          <div>
                            <span className="premium-label" style={{ fontSize: '0.65rem' }}>IFSC / Routing Code</span>
                            <div className="number-font" style={{ fontWeight: 600, marginTop: 4 }}>{selectedProfile.ifsc || 'ISB000492'}</div>
                          </div>
                          <div>
                            <span className="premium-label" style={{ fontSize: '0.65rem' }}>Account Type</span>
                            <div style={{ fontWeight: 600, marginTop: 4 }}>Corporate Salary Account</div>
                          </div>
                          <div>
                            <span className="premium-label" style={{ fontSize: '0.65rem' }}>Branch Location</span>
                            <div style={{ fontWeight: 600, marginTop: 4 }}>Silicon Valley Corporate Hub, CA</div>
                          </div>
                          <div>
                            <span className="premium-label" style={{ fontSize: '0.65rem' }}>Payment Method</span>
                            <div style={{ fontWeight: 600, marginTop: 4 }}>Direct Bank Wire (ACH)</div>
                          </div>
                        </div>
                      </div>

                      {/* Payroll Lock Compliance Notice */}
                      <div className="badge badge-warning" style={{
                        padding: 16,
                        borderRadius: 12,
                        fontSize: '0.75rem',
                        lineHeight: 1.5,
                        textAlign: 'left',
                        whiteSpace: 'normal',
                        color: '#d97706',
                        background: 'rgba(217, 119, 6, 0.08)',
                        border: '1px solid rgba(217, 119, 6, 0.2)'
                      }}>
                        * Payroll Compliance Lock: Bank details are verified and cannot be deleted or cleared. Please use the change request form to update account information.
                      </div>
                    </motion.div>
                  )}

                  {/* TAB: Portal Credentials */}
                  {activeProfileTab === 'Portal Credentials' && (
                    <motion.div
                      key="portal-credentials"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      style={{ display: 'flex', flexDirection: 'column', gap: 20 }}
                    >
                      <div className="premium-card" style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 16 }}>
                        <h3 style={{ fontSize: '0.95rem', fontWeight: 800, borderBottom: '1px solid var(--color-border)', paddingBottom: 10 }}>Portal Login Credentials</h3>
                        
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 16, fontSize: '0.85rem' }}>
                          <div>
                            <span className="premium-label" style={{ fontSize: '0.65rem' }}>Login User ID (Email)</span>
                            <div style={{ fontWeight: 600, marginTop: 4 }}>{selectedProfile.email}</div>
                          </div>

                          <div style={{ borderTop: '1px solid var(--color-border)', paddingTop: 16 }}>
                            <span className="premium-label" style={{ fontSize: '0.65rem', marginBottom: 6, display: 'block' }}>Update Account Password</span>
                            <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                              <input 
                                type="password" 
                                value={portalPassword} 
                                onChange={(e) => setPortalPassword(e.target.value)} 
                                className="premium-input" 
                                style={{ maxWidth: 300 }}
                                placeholder="Enter new password..." 
                              />
                              <button 
                                onClick={async () => {
                                  if (!portalPassword) {
                                    alert("Please type a new password.");
                                    return;
                                  }
                                  try {
                                    await api.updateEmployee(selectedProfile.id, { password: portalPassword });
                                    setPortalPassword('');
                                    alert("Employee portal login password updated successfully!");
                                  } catch (err) {
                                    alert("Failed to update password: " + err.message);
                                  }
                                }} 
                                className="premium-btn premium-btn-primary"
                                style={{ padding: '10px 18px', fontSize: '0.8rem' }}
                              >
                                Save Password
                              </button>
                            </div>
                          </div>

                        </div>
                      </div>
                    </motion.div>
                  )}

                  {activeProfileTab === 'Attendance Logs' && (
                    <motion.div
                      key="attendance-logs"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      style={{ display: 'flex', flexDirection: 'column', gap: 20 }}
                    >
                      {/* Attendance summary metrics */}
                      {(() => {
                        const totalDays = selectedEmpAttendance.length;
                        const presentDays = selectedEmpAttendance.filter(a => a.status === 'Present' || a.status === 'On Time' || a.status === 'Late' || a.status === 'Half-day').length;
                        const lateDays = selectedEmpAttendance.filter(a => a.status === 'Late').length;
                        const absentDays = selectedEmpAttendance.filter(a => a.status === 'Absent').length;
                        const attendancePercent = totalDays > 0 ? ((presentDays / totalDays) * 100).toFixed(1) : '0';

                        return (
                          <>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: 16 }}>
                              <div className="premium-card" style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 4 }}>
                                <span className="premium-label" style={{ fontSize: '0.65rem' }}>Total Logs</span>
                                <h4 className="number-font" style={{ fontSize: '1.25rem', fontWeight: 800, margin: 0 }}>{totalDays} days</h4>
                              </div>
                              <div className="premium-card" style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 4 }}>
                                <span className="premium-label" style={{ fontSize: '0.65rem', color: 'var(--color-success)' }}>Present</span>
                                <h4 className="number-font" style={{ fontSize: '1.25rem', fontWeight: 800, margin: 0, color: 'var(--color-success)' }}>{presentDays} days</h4>
                              </div>
                              <div className="premium-card" style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 4 }}>
                                <span className="premium-label" style={{ fontSize: '0.65rem', color: 'var(--color-warning)' }}>Late Markers</span>
                                <h4 className="number-font" style={{ fontSize: '1.25rem', fontWeight: 800, margin: 0, color: 'var(--color-warning)' }}>{lateDays} days</h4>
                              </div>
                              <div className="premium-card" style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 4 }}>
                                <span className="premium-label" style={{ fontSize: '0.65rem', color: 'var(--color-danger)' }}>Absent</span>
                                <h4 className="number-font" style={{ fontSize: '1.25rem', fontWeight: 800, margin: 0, color: 'var(--color-danger)' }}>{absentDays} days</h4>
                              </div>
                              <div className="premium-card" style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 4 }}>
                                <span className="premium-label" style={{ fontSize: '0.65rem', color: 'var(--color-primary)' }}>Rate (%)</span>
                                <h4 className="number-font" style={{ fontSize: '1.25rem', fontWeight: 800, margin: 0, color: 'var(--color-primary)' }}>{attendancePercent}%</h4>
                              </div>
                            </div>

                            {/* Logs list card */}
                            <div className="premium-card" style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 16 }}>
                              <h3 style={{ fontSize: '0.95rem', fontWeight: 800, borderBottom: '1px solid var(--color-border)', paddingBottom: 10 }}>Attendance History</h3>
                              
                              {loadingAttendance ? (
                                <div style={{ padding: '40px 0', textAlign: 'center', color: 'var(--color-text-tertiary)', fontSize: '0.85rem' }}>
                                  Loading attendance records...
                                </div>
                              ) : selectedEmpAttendance.length === 0 ? (
                                <div style={{ padding: '40px 0', textAlign: 'center', color: 'var(--color-text-tertiary)', fontSize: '0.85rem' }}>
                                  No attendance logs found for this employee.
                                </div>
                              ) : (
                                <div className="premium-table-container" style={{ maxHeight: 350, overflowY: 'auto' }}>
                                  <table className="premium-table">
                                    <thead>
                                      <tr>
                                        <th>Date</th>
                                        <th>Clock In</th>
                                        <th>Clock Out</th>
                                        <th>Work Duration</th>
                                        <th>Status</th>
                                      </tr>
                                    </thead>
                                    <tbody>
                                      {selectedEmpAttendance.map((log) => {
                                        let statusBadgeClass = 'badge badge-success';
                                        if (log.status === 'Late') statusBadgeClass = 'badge badge-warning';
                                        else if (log.status === 'Absent') statusBadgeClass = 'badge badge-danger';
                                        else if (log.status === 'Half-day') statusBadgeClass = 'badge badge-info';

                                        return (
                                          <tr key={log.id}>
                                            <td style={{ fontWeight: 600 }}>{log.date}</td>
                                            <td style={{ fontFamily: 'monospace' }}>{log.checkIn || '--:--'}</td>
                                            <td style={{ fontFamily: 'monospace' }}>{log.checkOut || '--:--'}</td>
                                            <td style={{ fontFamily: 'monospace' }}>{log.workHours || '--:--'}</td>
                                            <td>
                                              <span className={statusBadgeClass} style={{ fontSize: '0.7rem' }}>
                                                {log.status}
                                              </span>
                                            </td>
                                          </tr>
                                        );
                                      })}
                                    </tbody>
                                  </table>
                                </div>
                              )}
                            </div>
                          </>
                        );
                      })()}
                    </motion.div>
                  )}

                </AnimatePresence>
              </div>

            </div>
          </motion.div>
        )}

        {/* VIEW 5: Delete Warning Confirm Screen */}
        {viewMode === 'delete' && (
          <motion.div
            key="delete"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            className="premium-card"
            style={{
              padding: 40,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              textAlign: 'center',
              gap: 24,
              maxWidth: 500,
              margin: '40px auto'
            }}
          >
            <div style={{
              width: 64,
              height: 64,
              borderRadius: '50%',
              background: 'rgba(239, 68, 68, 0.1)',
              color: 'var(--color-danger)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <ShieldAlert size={32} />
            </div>

            <div>
              <h3 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: 10 }}>Terminate Record?</h3>
              <p style={{ fontSize: '0.95rem', color: 'var(--color-text-secondary)', lineHeight: 1.5 }}>
                Are you sure you want to delete <strong>{employees.find(e => e.id === confirmDeleteId)?.name}</strong>? This will purge all associated metadata, credentials, logs, and billing files.
              </p>
            </div>

            <div style={{ display: 'flex', gap: 14, width: '100%' }}>
              <button 
                onClick={() => { setViewMode('list'); setConfirmDeleteId(null); }} 
                className="premium-btn premium-btn-secondary" 
                style={{ flex: 1, justifyContent: 'center' }}
              >
                Cancel
              </button>
              <button 
                onClick={handleConfirmDelete} 
                className="premium-btn premium-btn-primary" 
                style={{ flex: 1, justifyContent: 'center', backgroundColor: 'var(--color-danger)', boxShadow: '0 4px 14px rgba(239, 68, 68, 0.25)' }}
              >
                Yes, Purge Record
              </button>
            </div>
          </motion.div>
        )}

      </AnimatePresence>

      <AnimatePresence>
        {activeDocPreview && (
          <div style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0, 0, 0, 0.4)',
            backdropFilter: 'blur(8px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
            padding: 20
          }} onClick={() => setActiveDocPreview(null)}>
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              style={{
                background: 'white',
                padding: 32,
                borderRadius: 20,
                width: '100%',
                maxWidth: 600,
                position: 'relative',
                boxShadow: 'var(--glass-shadow)',
                border: '1px solid var(--color-border)',
                display: 'flex',
                flexDirection: 'column',
                gap: 20
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <button 
                onClick={() => setActiveDocPreview(null)}
                style={{ position: 'absolute', top: 20, right: 20, background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--color-text-secondary)' }}
              >
                <X size={20} />
              </button>

              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <FileText size={28} style={{ color: 'var(--color-primary)' }} />
                <div>
                  <h3 style={{ fontSize: '1.2rem', fontWeight: 800, margin: 0 }}>Document Preview Console</h3>
                  <span style={{ fontSize: '0.75rem', color: 'var(--color-text-tertiary)' }}>File: {activeDocPreview.fileName || (typeof activeDocPreview === 'string' ? activeDocPreview : 'KYC Document')}</span>
                </div>
              </div>

              {/* Scanned Certificate Canvas mockup / Real base64 preview */}
              <div style={{
                height: 360,
                border: '2px dashed var(--color-border)',
                borderRadius: 14,
                background: 'rgba(0,0,0,0.01)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                position: 'relative',
                padding: 12,
                textAlign: 'center',
                overflow: 'hidden'
              }}>
                <AdminDocumentPreviewer doc={activeDocPreview} profile={selectedProfile} />
              </div>

              <div style={{ display: 'flex', gap: 14 }}>
                <button 
                  onClick={() => {
                    const doc = activeDocPreview;
                    if (!doc) return;
                    if (doc.fileData && !doc.fileData.startsWith("DEFAULT_") && doc.fileData.startsWith("data:")) {
                      const link = document.createElement("a");
                      link.href = doc.fileData;
                      link.download = doc.fileName || `${(doc.name || 'document').toLowerCase().replace(/\s+/g, "_")}.png`;
                      document.body.appendChild(link);
                      link.click();
                      document.body.removeChild(link);
                    } else {
                      const simulatedText = `ITLC HRMS - SECURE DOCUMENT VAULT\n\nDocument Name: ${doc.name || 'Document'}\nEmployee Name: ${selectedProfile.name}\nEmployee ID: ${selectedProfile.id}\nVerification Date: ${doc.uploadedDate || '2026-06-01'}\nStatus: Verified by HR Operations\n\n* This is a simulated certificate validating the secure document presence in your profile sandbox.`;
                      const blob = new Blob([simulatedText], { type: "text/plain" });
                      const url = URL.createObjectURL(blob);
                      const link = document.createElement("a");
                      link.href = url;
                      link.download = `${(doc.name || 'document').toLowerCase().replace(/[^a-z0-9]+/g, "_")}_validated.txt`;
                      document.body.appendChild(link);
                      link.click();
                      document.body.removeChild(link);
                      URL.revokeObjectURL(url);
                    }
                  }} 
                  className="premium-btn premium-btn-secondary" 
                  style={{ flex: 1, justifyContent: 'center' }}
                >
                  Download Copy
                </button>
                <button onClick={() => setActiveDocPreview(null)} className="premium-btn premium-btn-primary" style={{ flex: 1, justifyContent: 'center' }}>
                  Close Preview
                </button>
              </div>
            </motion.div>
          </div>
        )}

        {showIdCardModal && selectedProfile && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="premium-card relative overflow-hidden"
              style={{
                width: '100%',
                maxWidth: 400,
                padding: 24,
                display: 'flex',
                flexDirection: 'column',
                gap: 20,
                background: 'var(--color-bg-primary, #ffffff)',
                border: '1px solid var(--color-border)',
                boxShadow: '0 25px 50px -12px rgba(0,0,0,0.15)',
                borderRadius: 24
              }}
            >
              {/* Brand glow overlay */}
              <div style={{ position: 'absolute', top: 0, right: 0, height: 120, width: 120, background: 'linear-gradient(135deg, rgba(79, 70, 229, 0.1), rgba(6, 182, 212, 0.1))', filter: 'blur(30px)', pointerEvents: 'none' }}></div>

              <button 
                onClick={() => setShowIdCardModal(false)}
                className="absolute top-4 right-4 p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition"
                style={{ border: 'none', background: 'none', cursor: 'pointer' }}
              >
                <X size={18} />
              </button>

              <div style={{ textAlign: 'center' }}>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--color-text-primary, #0f172a)', margin: 0 }}>Corporate Security ID Badge</h3>
                <span style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary, #475569)', display: 'block', marginTop: 2 }}>Official Identification Pass Card</span>
              </div>

              {/* ID Card Wrapper (The printed badge itself) */}
              <div 
                id="employee-security-pass"
                style={{
                  border: '1px solid var(--color-border, #e2e8f0)',
                  borderRadius: 20,
                  background: 'var(--color-bg-secondary, #f8fafc)',
                  overflow: 'hidden',
                  boxShadow: '0 8px 16px -4px rgba(0,0,0,0.05)',
                  display: 'flex',
                  flexDirection: 'column',
                  position: 'relative'
                }}
              >
                {/* ID Card Top Banner */}
                <div style={{
                  background: 'linear-gradient(135deg, #4f46e5 0%, #06b6d4 100%)',
                  padding: '16px 20px',
                  color: 'white',
                  textAlign: 'center',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: 4
                }}>
                  <div style={{ fontSize: '0.8rem', fontWeight: 900, letterSpacing: 2, textTransform: 'uppercase' }}>ACME ENTERPRISES</div>
                  <div style={{ fontSize: '0.6rem', opacity: 0.8, fontWeight: 700, letterSpacing: 1 }}>SECURE ACCESS PASS</div>
                </div>

                {/* ID Card Content */}
                <div style={{ padding: '24px 20px 20px 20px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16, textAlign: 'center' }}>
                  {/* Photo Container */}
                  <div style={{ position: 'relative' }}>
                    <div style={{
                      width: 90,
                      height: 90,
                      borderRadius: '50%',
                      overflow: 'hidden',
                      border: '4px solid white',
                      boxShadow: '0 4px 10px rgba(0,0,0,0.1)',
                      background: '#e2e8f0'
                    }}>
                      <img 
                        src={selectedProfile.avatar || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80'} 
                        alt={selectedProfile.name}
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      />
                    </div>
                    {/* Status Badge Ring */}
                    <div style={{
                      position: 'absolute',
                      bottom: 2,
                      right: 2,
                      width: 18,
                      height: 18,
                      borderRadius: '50%',
                      background: '#10b981',
                      border: '3px solid white',
                      boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                    }} title="Status: Active Verified" />
                  </div>

                  {/* Profile Name & Title */}
                  <div>
                    <h4 style={{ fontSize: '1.2rem', fontWeight: 850, color: 'var(--color-text-primary, #0f172a)', margin: 0 }}>{selectedProfile.name}</h4>
                    <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#4f46e5', textTransform: 'uppercase', display: 'block', marginTop: 4 }}>
                      {selectedProfile.role || 'Senior Software Engineer'}
                    </span>
                  </div>

                  {/* Details Table */}
                  <div style={{
                    width: '100%',
                    background: 'var(--color-bg-primary, #ffffff)',
                    borderRadius: 12,
                    padding: 12,
                    border: '1px solid var(--color-border, #edf2f7)',
                    display: 'grid',
                    gridTemplateColumns: '1fr 1fr',
                    gap: '12px 8px',
                    textAlign: 'left',
                    fontSize: '0.75rem'
                  }}>
                    <div>
                      <span style={{ fontSize: '0.55rem', fontWeight: 800, color: 'var(--color-text-tertiary, #94a3b8)', textTransform: 'uppercase', display: 'block' }}>Employee ID</span>
                      <span style={{ fontWeight: 700, color: 'var(--color-text-secondary, #334155)', fontFamily: 'monospace' }}>{selectedProfile.id}</span>
                    </div>
                    <div>
                      <span style={{ fontSize: '0.55rem', fontWeight: 800, color: 'var(--color-text-tertiary, #94a3b8)', textTransform: 'uppercase', display: 'block' }}>Department</span>
                      <span style={{ fontWeight: 700, color: 'var(--color-text-secondary, #334155)' }}>{selectedProfile.department || 'Product Engineering'}</span>
                    </div>
                    <div>
                      <span style={{ fontSize: '0.55rem', fontWeight: 800, color: 'var(--color-text-tertiary, #94a3b8)', textTransform: 'uppercase', display: 'block' }}>Date of Joining</span>
                      <span style={{ fontWeight: 700, color: 'var(--color-text-secondary, #334155)' }}>{selectedProfile.joiningDate || '2023-03-15'}</span>
                    </div>
                    <div>
                      <span style={{ fontSize: '0.55rem', fontWeight: 800, color: 'var(--color-text-tertiary, #94a3b8)', textTransform: 'uppercase', display: 'block' }}>Access Level</span>
                      <span style={{ fontWeight: 800, color: '#06b6d4', textTransform: 'uppercase' }}>LEVEL 3 (STD)</span>
                    </div>
                  </div>

                  {/* Mock Barcode / Access Strips */}
                  <div style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
                    <div style={{ height: 32, display: 'flex', gap: 2, alignItems: 'stretch', width: '80%', opacity: 0.8 }}>
                      {Array.from({ length: 38 }).map((_, i) => (
                        <div 
                          key={i} 
                          style={{ 
                            flexGrow: (i % 3 === 0 ? 3 : i % 5 === 0 ? 1 : 2), 
                            background: '#0f172a' 
                          }} 
                        />
                      ))}
                    </div>
                    <span style={{ fontSize: '0.55rem', color: 'var(--color-text-tertiary, #94a3b8)', fontFamily: 'monospace', letterSpacing: 3 }}>
                      *{selectedProfile.id}*
                    </span>
                  </div>
                </div>

                {/* ID Card Footer */}
                <div style={{
                  borderTop: '1px dashed var(--color-border, #e2e8f0)',
                  padding: 10,
                  fontSize: '0.6rem',
                  color: 'var(--color-text-tertiary, #64748b)',
                  textAlign: 'center',
                  background: 'rgba(0,0,0,0.01)'
                }}>
                  Security System Badge &bull; Property of Corporate HRMS
                </div>
              </div>

              {/* Action Buttons */}
              <div style={{ display: 'flex', gap: 10 }}>
                <button 
                  onClick={() => alert(`Access pass for ${selectedProfile.name} download initiated!`)}
                  className="premium-btn premium-btn-primary" 
                  style={{ flex: 1, justifyContent: 'center' }}
                >
                  <Download size={14} /> <span>Download Pass</span>
                </button>
                <button 
                  onClick={() => window.print()}
                  className="premium-btn premium-btn-secondary" 
                  style={{ flex: 1, justifyContent: 'center' }}
                >
                  <span>Print Pass</span>
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Generated Employee Credentials Popup Modal */}
      <AnimatePresence>
        {generatedEmpCredentials && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="glass-card w-full max-w-sm p-6 rounded-2xl space-y-5 relative overflow-hidden"
              style={{ background: 'var(--header-bg, #0f172a)', color: '#fff', border: '1px solid var(--color-border, #334155)', borderRadius: '24px' }}
            >
              <div className="absolute top-0 right-0 h-32 w-32 bg-emerald-500/10 blur-2xl pointer-events-none"></div>

              <div className="flex items-center gap-3 text-emerald-400">
                <Check className="h-6 w-6 shrink-0 bg-emerald-500/10 p-1 rounded-full border border-emerald-500/20 shadow-md animate-bounce" />
                <h3 className="text-lg font-bold text-white font-sans" style={{ margin: 0 }}>Employee Credentials Created</h3>
              </div>

              <p className="text-xs text-slate-300 leading-relaxed font-sans" style={{ margin: 0 }}>
                A new database employee workspace has been registered for <span className="font-extrabold text-white font-mono">{generatedEmpCredentials.employeeName}</span>. Use the following credentials to log in:
              </p>

              <div className="space-y-3 bg-white/2 p-3.5 rounded-xl border border-white/5 font-sans" style={{ background: 'rgba(255,255,255,0.02)', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div className="space-y-1">
                  <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block" style={{ fontSize: '10px', color: '#64748b' }}>Employee ID (Username)</span>
                  <div className="flex justify-between items-center bg-white/5 px-2.5 py-1.5 rounded-lg border border-white/5 mt-1" style={{ background: 'rgba(255,255,255,0.05)', display: 'flex', justifyContent: 'space-between', padding: '6px 10px', borderRadius: '8px' }}>
                    <span className="text-xs font-semibold text-slate-200 block font-mono" style={{ fontSize: '12px' }}>{generatedEmpCredentials.id}</span>
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(generatedEmpCredentials.id);
                        alert('Employee ID copied to clipboard!');
                      }}
                      className="text-[10px] text-indigo-400 hover:text-indigo-300 font-semibold uppercase"
                      style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#818cf8', fontWeight: 600 }}
                    >
                      Copy
                    </button>
                  </div>
                </div>

                <div className="space-y-1">
                  <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block" style={{ fontSize: '10px', color: '#64748b' }}>Employee Email Address</span>
                  <div className="flex justify-between items-center bg-white/5 px-2.5 py-1.5 rounded-lg border border-white/5 mt-1" style={{ background: 'rgba(255,255,255,0.05)', display: 'flex', justifyContent: 'space-between', padding: '6px 10px', borderRadius: '8px' }}>
                    <span className="text-xs font-semibold text-slate-200 block font-mono" style={{ fontSize: '12px' }}>{generatedEmpCredentials.email}</span>
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(generatedEmpCredentials.email);
                        alert('Email address copied to clipboard!');
                      }}
                      className="text-[10px] text-indigo-400 hover:text-indigo-300 font-semibold uppercase"
                      style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#818cf8', fontWeight: 600 }}
                    >
                      Copy
                    </button>
                  </div>
                </div>

                <div className="space-y-1">
                  <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block" style={{ fontSize: '10px', color: '#64748b' }}>Password</span>
                  <div className="flex justify-between items-center bg-white/5 px-2.5 py-1.5 rounded-lg border border-white/5 mt-1" style={{ background: 'rgba(255,255,255,0.05)', display: 'flex', justifyContent: 'space-between', padding: '6px 10px', borderRadius: '8px' }}>
                    <span className="text-xs font-bold text-emerald-400 font-mono tracking-wide" style={{ fontSize: '12px', color: '#34d399' }}>{generatedEmpCredentials.pass}</span>
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(generatedEmpCredentials.pass);
                        alert('Password copied to clipboard!');
                      }}
                      className="text-[10px] text-indigo-400 hover:text-indigo-300 font-semibold uppercase"
                      style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#818cf8', fontWeight: 600 }}
                    >
                      Copy
                    </button>
                  </div>
                </div>
              </div>

              <div className="flex justify-end pt-2" style={{ display: 'flex', justifyContent: 'flex-end' }}>
                <button
                  onClick={() => setGeneratedEmpCredentials(null)}
                  className="px-4 py-1.5 text-xs font-bold rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white transition shadow border border-indigo-700 cursor-pointer"
                  style={{ cursor: 'pointer', background: '#4f46e5', border: 'none', color: '#fff', padding: '6px 14px', borderRadius: '8px', fontWeight: 700 }}
                >
                  Dismiss / Close
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* CSV Imported Employee Credentials Popup Modal */}
      <AnimatePresence>
        {importedCredentials && importedCredentials.length > 0 && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="glass-card w-full max-w-2xl p-6 rounded-2xl space-y-5 relative overflow-hidden"
              style={{ background: 'var(--header-bg, #0f172a)', color: '#fff', border: '1px solid var(--color-border, #334155)', borderRadius: '24px', maxHeight: '90vh', display: 'flex', flexDirection: 'column', gap: '16px' }}
            >
              <div className="absolute top-0 right-0 h-32 w-32 bg-emerald-500/10 blur-2xl pointer-events-none"></div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div className="flex items-center gap-3 text-emerald-400">
                  <h3 className="text-lg font-bold text-white font-sans" style={{ margin: 0 }}>Onboarded Employee Logins ({importedCredentials.length})</h3>
                </div>
              </div>

              <p className="text-xs text-slate-300 leading-relaxed font-sans" style={{ margin: 0 }}>
                Unique IDs and passwords have been automatically generated for all newly imported employees. Use the controls below to copy or export them.
              </p>

              <div style={{ flex: 1, overflowY: 'auto', border: '1px solid var(--color-border)', borderRadius: '12px', background: 'rgba(255,255,255,0.01)' }} className="premium-scrollbar">
                <table className="premium-table" style={{ width: '100%' }}>
                  <thead>
                    <tr>
                      <th style={{ color: 'var(--color-text-secondary)', fontSize: '0.75rem' }}>Name</th>
                      <th style={{ color: 'var(--color-text-secondary)', fontSize: '0.75rem' }}>Email</th>
                      <th style={{ color: 'var(--color-text-secondary)', fontSize: '0.75rem' }}>Employee ID</th>
                      <th style={{ color: 'var(--color-text-secondary)', fontSize: '0.75rem' }}>Password</th>
                      <th style={{ textAlign: 'right', color: 'var(--color-text-secondary)', fontSize: '0.75rem' }}>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {importedCredentials.map((c, index) => (
                      <tr key={index}>
                        <td style={{ fontWeight: 600, fontSize: '0.8rem' }}>{c.name}</td>
                        <td style={{ fontSize: '0.8rem' }}>{c.email}</td>
                        <td className="number-font" style={{ fontSize: '0.8rem', color: 'var(--color-accent)' }}>{c.id}</td>
                        <td className="number-font" style={{ fontSize: '0.8rem', color: '#34d399', fontWeight: 'bold' }}>{c.password}</td>
                        <td style={{ textAlign: 'right' }}>
                          <button
                            onClick={() => {
                              navigator.clipboard.writeText(`ID: ${c.id}\nPassword: ${c.password}`);
                              alert(`${c.name}'s login credentials copied to clipboard!`);
                            }}
                            className="premium-btn premium-btn-secondary"
                            style={{ padding: '4px 10px', fontSize: '0.7rem' }}
                          >
                            Copy
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
                <div style={{ display: 'flex', gap: '10px' }}>
                  <button
                    onClick={handleCopyAllLogins}
                    className="premium-btn premium-btn-secondary"
                    style={{ padding: '8px 14px', fontSize: '0.75rem' }}
                  >
                    Copy All Logins
                  </button>
                  <button
                    onClick={handleDownloadLoginsCSV}
                    className="premium-btn premium-btn-secondary"
                    style={{ padding: '8px 14px', fontSize: '0.75rem' }}
                  >
                    Download Logins CSV
                  </button>
                </div>
                <button
                  onClick={() => setImportedCredentials([])}
                  className="premium-btn premium-btn-primary"
                  style={{ padding: '8px 18px', fontSize: '0.75rem' }}
                >
                  Dismiss / Close
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Seat Limit Exceeded Upgrade Notification Modal */}
      {showUpgradeModal && (
        <div style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: 'rgba(15, 23, 42, 0.75)',
          backdropFilter: 'blur(8px)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 9999,
          padding: 16
        }}>
          <div style={{
            background: 'var(--color-surface, #ffffff)',
            borderRadius: '20px',
            maxWidth: '500px',
            width: '100%',
            padding: '28px',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
            border: '1px solid rgba(239, 68, 68, 0.3)',
            display: 'flex',
            flexDirection: 'column',
            gap: 18,
            textAlign: 'center'
          }}>
            <div style={{
              width: 56,
              height: 56,
              borderRadius: '50%',
              backgroundColor: 'rgba(239, 68, 68, 0.1)',
              color: '#ef4444',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '1.8rem',
              margin: '0 auto'
            }}>
              ⚠️
            </div>

            <div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--color-text-primary, #0f172a)', margin: '0 0 8px 0' }}>
                Employee Seat Limit Reached!
              </h3>
              <p style={{ fontSize: '0.875rem', color: 'var(--color-text-secondary, #64748b)', margin: 0, lineHeight: 1.5 }}>
                Your current subscription allows a maximum of <strong>{seatLimit} employee seat{seatLimit > 1 ? 's' : ''}</strong> ({currentEmpCount} / {seatLimit} used). You cannot create a 3rd or additional employee credential under your current plan.
              </p>
            </div>

            <div style={{
              background: 'rgba(239, 68, 68, 0.05)',
              border: '1px dashed rgba(239, 68, 68, 0.3)',
              borderRadius: '12px',
              padding: '12px 16px',
              fontSize: '0.8rem',
              color: '#b91c1c',
              textAlign: 'left',
              lineHeight: 1.4
            }}>
              <strong>🔒 ID & Password Creation Locked:</strong> To register more team members and generate official login credentials, please upgrade your subscription plan.
            </div>

            <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
              <button
                type="button"
                onClick={() => setShowUpgradeModal(false)}
                className="premium-btn premium-btn-secondary"
                style={{ flex: 1, padding: '10px 16px', borderRadius: '10px' }}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowUpgradeModal(false);
                  if (setActiveTab) setActiveTab('subscription');
                }}
                className="premium-btn premium-btn-primary"
                style={{
                  flex: 1.6,
                  padding: '10px 18px',
                  borderRadius: '10px',
                  background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)',
                  color: '#fff',
                  fontWeight: 700,
                  border: 'none',
                  cursor: 'pointer'
                }}
              >
                Upgrade Subscription Plan 🚀
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
