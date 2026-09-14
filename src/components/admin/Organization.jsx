import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  MapPin, Plus, Users, Globe, Building, ShieldCheck, Download, 
  Upload, FileText, Landmark, Clock, Cpu, Heart, CheckCircle2, ChevronRight, ChevronDown,
  Edit3, Trash2, X
} from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, Cell, Tooltip, XAxis, YAxis, CartesianGrid } from 'recharts';
import { api } from '../../services/api';

// --- Helper: Animated Number Counter ---
function AnimatedCounter({ value, duration = 1000, currencySymbol = '$' }) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    let start = 0;
    const end = parseFloat(value.toString().replace(/,/g, ''));
    if (isNaN(end)) {
      setCount(value);
      return;
    }
    if (start === end) return;
    let totalMiliseconds = duration;
    let incrementTime = Math.abs(Math.floor(totalMiliseconds / end));
    incrementTime = Math.max(incrementTime, 12);
    
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
  return <span className="number-font">{isCurrency && currencySymbol}{count.toLocaleString()}{isPercent && '%'}</span>;
}

const initialBranches = [
  { id: 1, name: 'New York HQ', country: 'United States', address: '120 Broadway, Manhattan, NY', manager: 'Marcus Vance', count: 420, phone: '+1 (555) 019-2834', type: 'Headquarters', status: 'Active' },
  { id: 2, name: 'London Tech Hub', country: 'United Kingdom', address: '80 Old St, London EC1V', manager: 'Clara Oswald', count: 280, phone: '+44 (20) 7946 0958', type: 'Tech Centre', status: 'Active' },
  { id: 3, name: 'Tokyo Office', country: 'Japan', address: 'Chiyoda City, Tokyo 100-0005', manager: 'Kenji Sato', count: 120, phone: '+81 (3) 5555-0142', type: 'Regional Hub', status: 'Active' },
  { id: 4, name: 'Mumbai Ops Hub', country: 'India', address: 'Bandra Kurla Complex, Mumbai', manager: 'Priya Sharma', count: 428, phone: '+91 (22) 5557-9812', type: 'Operations', status: 'Active' },
];

// --- Recursive Org Node Component ---
function OrgNode({ member, onEdit, onDelete }) {
  const [expanded, setExpanded] = useState(true);
  const hasChildren = member.children && member.children.length > 0;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', position: 'relative' }}>
      
      {/* Node Box */}
      <div 
        style={{
          padding: '14px 20px',
          borderRadius: 16,
          background: 'var(--glass-bg)',
          backdropFilter: 'blur(20px)',
          border: 'var(--sidebar-border)',
          boxShadow: 'var(--glass-shadow)',
          textAlign: 'center',
          minWidth: 180,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 4,
          position: 'relative',
          zIndex: 2
        }}
      >
        <div 
          onClick={() => setExpanded(!expanded)}
          style={{ cursor: hasChildren ? 'pointer' : 'default', width: '100%' }}
        >
          <span style={{ fontSize: '0.75rem', fontWeight: 800, display: 'block' }}>{member.name}</span>
          <span className="badge badge-info" style={{ fontSize: '0.6rem', padding: '2px 8px', marginTop: 2, display: 'inline-block' }}>{member.role}</span>
        </div>

        {member.id && (
          <div style={{ display: 'flex', gap: 12, marginTop: 8, borderTop: '1px solid var(--color-border)', paddingTop: 6, width: '100%', justifyContent: 'center' }}>
            <button 
              onClick={(e) => { e.stopPropagation(); onEdit(member); }} 
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-primary)', display: 'flex', alignItems: 'center' }}
              title="Edit Node Manager"
            >
              <Edit3 size={11} />
            </button>
            <button 
              onClick={(e) => { e.stopPropagation(); onDelete(member); }} 
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#ef4444', display: 'flex', alignItems: 'center' }}
              title="Delete Employee Record"
            >
              <Trash2 size={11} />
            </button>
          </div>
        )}

        {hasChildren && (
          <div onClick={() => setExpanded(!expanded)} style={{ marginTop: 4, color: 'var(--color-text-tertiary)', cursor: 'pointer' }}>
            {expanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
          </div>
        )}
      </div>

      {/* Children connector lines */}
      {hasChildren && expanded && (
        <div style={{
          display: 'flex',
          gap: 24,
          paddingTop: 30,
          position: 'relative'
        }}>
          {/* Vertical line connecting parent to branch */}
          <div style={{
            position: 'absolute',
            top: 0,
            left: '50%',
            transform: 'translateX(-50%)',
            height: 30,
            width: 2,
            background: 'var(--color-border)'
          }} />
          
          {member.children.map((child, idx) => (
            <OrgNode key={idx} member={child} onEdit={onEdit} onDelete={onDelete} />
          ))}
        </div>
      )}

    </div>
  );
}

export default function Organization({ employees = [], setEmployees, setActiveTab, currency = 'USD' }) {
  const currencySymbol = (() => {
    switch (currency) {
      case 'INR': return '₹';
      case 'EUR': return '€';
      case 'GBP': return '£';
      case 'JPY': return '¥';
      default: return '$';
    }
  })();
  const [branches, setBranches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [viewMode, setViewMode] = useState('overview'); // 'overview', 'chart', 'working-info'

  // Editing state variables
  const [editingBranch, setEditingBranch] = useState(null);
  const [editingEmployeeNode, setEditingEmployeeNode] = useState(null);
  const [nodeName, setNodeName] = useState('');
  const [nodeDesignation, setNodeDesignation] = useState('');
  const [nodeManager, setNodeManager] = useState('');

  useEffect(() => {
    const fetchBranches = async () => {
      try {
        const data = await api.getAdminBranches();
        setBranches(data);
      } catch (err) {
        console.error('Failed to load branches', err);
      } finally {
        setLoading(false);
      }
    };
    fetchBranches();
  }, []);

  // Form states
  const [newName, setNewName] = useState('');
  const [newCountry, setNewCountry] = useState('United States');
  const [newManager, setNewManager] = useState('');
  const [newType, setNewType] = useState('Branch Office');

  const handleStartEditBranch = (br) => {
    setEditingBranch(br);
    setNewName(br.name);
    setNewCountry(br.country || 'United States');
    setNewManager(br.manager);
    setNewType(br.type || 'Branch Office');
    setShowAddForm(true);
  };

  const handleDeleteBranch = async (id) => {
    if (confirm("Are you sure you want to delete this branch?")) {
      try {
        await api.deleteAdminBranch(id);
        setBranches(branches.filter(b => b.id !== id));
      } catch (err) {
        alert(err.message || 'Failed to delete branch');
      }
    }
  };

  const handleAddBranch = async (e) => {
    e.preventDefault();
    if (!newName || !newManager) return;
    try {
      if (editingBranch) {
        const updated = await api.updateAdminBranch(editingBranch.id, {
          name: newName,
          country: newCountry,
          address: editingBranch.address || 'Main Commercial Ring Road',
          manager: newManager,
          count: editingBranch.count || 0,
          phone: editingBranch.phone || '+1 (555) 000-1122',
          type: newType,
          status: editingBranch.status || 'Active'
        });
        setBranches(branches.map(b => b.id === editingBranch.id ? updated : b));
        setEditingBranch(null);
      } else {
        const newBr = await api.createAdminBranch({
          name: newName,
          country: newCountry,
          address: 'Main Commercial Ring Road',
          manager: newManager,
          count: 0,
          phone: '+1 (555) 000-1122',
          type: newType,
          status: 'Active'
        });
        setBranches([...branches, newBr]);
      }
      setNewName('');
      setNewManager('');
      setShowAddForm(false);
    } catch (err) {
      alert(err.message || 'Failed to save branch');
    }
  };

  // Employee Node editing and deletion handlers
  const handleStartEditEmployee = (member) => {
    setEditingEmployeeNode(member);
    setNodeName(member.name);
    setNodeDesignation(member.role);
    setNodeManager(member.reportingManager || 'None');
  };

  const handleDeleteEmployeeNode = async (member) => {
    if (confirm(`Are you sure you want to permanently delete the employee record for ${member.name}?`)) {
      try {
        await api.deleteEmployee(member.id);
        setEmployees(employees.filter(emp => emp.id !== member.id));
      } catch (err) {
        alert(err.message || 'Failed to delete employee');
      }
    }
  };

  const handleSaveEditEmployee = async (e) => {
    e.preventDefault();
    try {
      const targetEmp = employees.find(emp => emp.id === editingEmployeeNode.id);
      if (!targetEmp) return;
      
      const updated = await api.updateEmployee(editingEmployeeNode.id, {
        ...targetEmp,
        name: nodeName,
        designation: nodeDesignation,
        reportingManager: nodeManager
      });

      setEmployees(employees.map(emp => emp.id === editingEmployeeNode.id ? updated : emp));
      setEditingEmployeeNode(null);
      alert('Employee node successfully updated in the database!');
    } catch (err) {
      alert(err.message || 'Failed to save employee changes');
    }
  };

  // Hierarchy Data
  const buildHierarchy = () => {
    if (!employees || employees.length === 0) {
      return { name: 'No Employees', role: 'N/A', children: [] };
    }
    const roots = employees.filter(emp => !emp.reportingManager || emp.reportingManager === 'None' || emp.reportingManager === '');
    const buildNode = (emp) => {
      const children = employees.filter(child => child.reportingManager === emp.name);
      return {
        id: emp.id,
        name: emp.name,
        role: emp.designation || emp.role || 'Associate',
        reportingManager: emp.reportingManager,
        children: children.map(buildNode)
      };
    };
    if (roots.length > 0) {
      if (roots.length === 1) {
        return buildNode(roots[0]);
      } else {
        return {
          name: 'Corporate Workspace',
          role: 'Organization Hub',
          children: roots.map(buildNode)
        };
      }
    }
    return buildNode(employees[0]);
  };

  const ceoNode = buildHierarchy();

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      
      {/* Navigation sub-tabs inside Organization */}
      <div className="premium-card" style={{ padding: '8px 12px', display: 'flex', gap: 8, alignSelf: 'flex-start' }}>
        {[
          { id: 'overview', label: 'Company Overview' },
          { id: 'chart', label: 'Organization Chart' },
          { id: 'working-info', label: 'Working Information' }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setViewMode(tab.id)}
            className={`premium-btn ${viewMode === tab.id ? 'chrome-box-active' : 'chrome-box-inactive'}`}
            style={{ padding: '8px 16px', fontSize: '0.8rem', borderRadius: 10 }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        
        {/* SUB-VIEW 1: Company Overview */}
        {viewMode === 'overview' && (
          <motion.div
            key="overview"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            style={{ display: 'flex', flexDirection: 'column', gap: 24 }}
          >
            {/* Company Metadata & Cards Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: 24, alignItems: 'start' }}>
              
              {/* Left Card: Company Profile */}
              <div className="premium-card" style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 16 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                  <div style={{
                    width: 48,
                    height: 48,
                    borderRadius: 12,
                    background: 'linear-gradient(135deg, #4F46E5 0%, #06B6D4 100%)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'white',
                    fontWeight: 800
                  }}>A</div>
                  <div>
                    <h3 style={{ fontSize: '0.85rem', fontWeight: 800 }}>Antigravity Solutions</h3>
                    <span style={{ fontSize: '0.65rem', color: 'var(--color-text-tertiary)' }}>Software & HR Solutions</span>
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 10, fontSize: '0.7rem', borderTop: '1px solid var(--color-border)', paddingTop: 16 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: 'var(--color-text-tertiary)' }}>Reg Number:</span>
                    <span className="number-font" style={{ fontWeight: 600 }}>REG-2026-8924</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: 'var(--color-text-tertiary)' }}>GST Number:</span>
                    <span className="number-font" style={{ fontWeight: 600 }}>27AAACA1248Q1Z1</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: 'var(--color-text-tertiary)' }}>PAN Number:</span>
                    <span className="number-font" style={{ fontWeight: 600 }}>AAACA1248Q</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: 'var(--color-text-tertiary)' }}>Founded:</span>
                    <span className="number-font" style={{ fontWeight: 600 }}>Jan 12, 2024</span>
                  </div>
                </div>
              </div>

              {/* Right Card: Branches and Quick Actions */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
                
                {/* Branches List */}
                <div className="premium-card" style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 16 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h3 style={{ fontSize: '0.8rem', fontWeight: 800 }}>Active International Branches</h3>
                    <button onClick={() => setShowAddForm(!showAddForm)} className="premium-btn premium-btn-primary" style={{ padding: '6px 12px', fontSize: '0.75rem' }}>
                      <Plus size={14} />
                      <span>Add Branch</span>
                    </button>
                  </div>

                  {showAddForm && (
                    <motion.div 
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="premium-card" 
                      style={{ padding: 20, border: '1px solid var(--color-border)' }}
                    >
                      <form onSubmit={handleAddBranch} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 12, alignItems: 'end' }}>
                        <div className="premium-form-group" style={{ marginBottom: 0 }}>
                          <label className="premium-label" style={{ fontSize: '0.65rem' }}>Branch Name</label>
                          <input type="text" required value={newName} onChange={(e) => setNewName(e.target.value)} className="premium-input" placeholder="e.g. Paris Hub" />
                        </div>
                        <div className="premium-form-group" style={{ marginBottom: 0 }}>
                          <label className="premium-label" style={{ fontSize: '0.65rem' }}>Manager</label>
                          <input type="text" required value={newManager} onChange={(e) => setNewManager(e.target.value)} className="premium-input" placeholder="e.g. Clara" />
                        </div>
                        <div style={{ display: 'flex', gap: 10 }}>
                          <button type="submit" className="premium-btn premium-btn-primary" style={{ flex: 1, height: 42, justifyContent: 'center' }}>Save</button>
                          <button type="button" onClick={() => setShowAddForm(false)} className="premium-btn premium-btn-secondary" style={{ flex: 1, height: 42, justifyContent: 'center' }}>Cancel</button>
                        </div>
                      </form>
                    </motion.div>
                  )}

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16 }}>
                    {branches.map(br => (
                      <div key={br.id} style={{ padding: 16, border: '1px solid var(--color-border)', borderRadius: 14, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                        <div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                            <span style={{ fontSize: '0.75rem', fontWeight: 800 }}>{br.name}</span>
                            <span className="badge badge-success" style={{ fontSize: '0.6rem' }}>{br.status}</span>
                          </div>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: 6, fontSize: '0.7rem', marginTop: 10, color: 'var(--color-text-secondary)' }}>
                            <span>Manager: {br.manager}</span>
                            <span className="number-font" style={{ fontWeight: 600, color: 'var(--color-primary)' }}>{br.count} employees</span>
                          </div>
                        </div>
                        <div style={{ display: 'flex', gap: 10, marginTop: 12, borderTop: '1px solid var(--color-border)', paddingTop: 8, justifyContent: 'flex-end' }}>
                          <button 
                            onClick={() => handleStartEditBranch(br)} 
                            className="premium-btn" 
                            style={{ padding: '4px 8px', fontSize: '0.65rem', minWidth: 'auto', display: 'flex', alignItems: 'center', gap: 4 }}
                          >
                            <Edit3 size={10} />
                            <span>Edit</span>
                          </button>
                          <button 
                            onClick={() => handleDeleteBranch(br.id)} 
                            className="premium-btn" 
                            style={{ padding: '4px 8px', fontSize: '0.65rem', minWidth: 'auto', color: '#ef4444', display: 'flex', alignItems: 'center', gap: 4 }}
                          >
                            <Trash2 size={10} />
                            <span>Delete</span>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Quick Actions & Health Card */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 20 }}>
                  
                  {/* Health Score */}
                  <div className="premium-card" style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 10 }}>
                    <span className="premium-label" style={{ fontSize: '0.6rem' }}>Company Health Score</span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <Heart size={14} style={{ color: 'var(--color-danger)' }} fill="var(--color-danger)" />
                      <span className="number-font" style={{ fontSize: '1.1rem', fontWeight: 800 }}>98.2 / 100</span>
                    </div>
                  </div>

                  {/* Quick Actions Console */}
                  <div className="premium-card" style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 12 }}>
                    <span className="premium-label" style={{ fontSize: '0.6rem' }}>Reports console</span>
                    <button onClick={() => alert("Organization Report generated successfully!")} className="premium-btn premium-btn-primary" style={{ padding: '6px 12px', fontSize: '0.7rem', justifyContent: 'center' }}>
                      <FileText size={12} />
                      <span>Download Company Report</span>
                    </button>
                  </div>
                </div>

              </div>

            </div>
          </motion.div>
        )}

        {/* SUB-VIEW 2: Org Chart */}
        {viewMode === 'chart' && (
          <motion.div
            key="chart"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="premium-card"
            style={{ 
              padding: 40, 
              display: 'flex', 
              flexDirection: 'column', 
              alignItems: 'center',
              overflowX: 'auto',
              background: 'var(--glass-bg)',
              backdropFilter: 'blur(20px)'
            }}
          >
            <div style={{ alignSelf: 'flex-start', marginBottom: 30 }}>
              <h3 style={{ fontSize: '0.9rem', fontWeight: 800 }}>Interactive Corporate Tree</h3>
              <span style={{ fontSize: '0.65rem', color: 'var(--color-text-tertiary)' }}>Click nodes to expand or collapse child branches</span>
            </div>

            {/* Tree root node */}
            <OrgNode member={ceoNode} onEdit={handleStartEditEmployee} onDelete={handleDeleteEmployeeNode} />
          </motion.div>
        )}

        {/* SUB-VIEW 3: Working Info */}
        {viewMode === 'working-info' && (
          <motion.div
            key="working-info"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="premium-card"
            style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 20 }}
          >
            <div>
              <h3 style={{ fontSize: '0.9rem', fontWeight: 800 }}>Working Setup & Policies</h3>
              <span style={{ fontSize: '0.65rem', color: 'var(--color-text-tertiary)' }}>Standard operational constraints across branches</span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 20 }}>
              
              <div style={{ padding: 18, border: '1px solid var(--color-border)', borderRadius: 14 }}>
                <span className="premium-label" style={{ fontSize: '0.6rem' }}>Office Timing Hours</span>
                <div style={{ fontSize: '0.8rem', fontWeight: 800, marginTop: 6, display: 'flex', alignItems: 'center', gap: 6 }}>
                  <Clock size={12} style={{ color: 'var(--color-primary)' }} />
                  <span>09:00 AM - 05:00 PM</span>
                </div>
              </div>

              <div style={{ padding: 18, border: '1px solid var(--color-border)', borderRadius: 14 }}>
                <span className="premium-label" style={{ fontSize: '0.6rem' }}>Weekly Off Days</span>
                <div style={{ fontSize: '0.8rem', fontWeight: 800, marginTop: 6 }}>Saturday & Sunday</div>
              </div>

              <div style={{ padding: 18, border: '1px solid var(--color-border)', borderRadius: 14 }}>
                <span className="premium-label" style={{ fontSize: '0.6rem' }}>Payroll Wire Cycle</span>
                <div style={{ fontSize: '0.8rem', fontWeight: 800, marginTop: 6 }}>Monthly (End of Month)</div>
              </div>

            </div>
          </motion.div>
        )}

      </AnimatePresence>

      {/* Edit Employee Node Modal */}
      {editingEmployeeNode && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          backgroundColor: 'rgba(0,0,0,0.5)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 9999
        }}>
          <div className="premium-card" style={{ padding: 24, width: 400, background: 'var(--color-bg)', display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ fontSize: '1rem', fontWeight: 800 }}>Edit Employee Node</h3>
              <button 
                onClick={() => setEditingEmployeeNode(null)} 
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text-tertiary)' }}
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveEditEmployee} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div className="premium-form-group">
                <label className="premium-label">Full Name</label>
                <input type="text" required value={nodeName} onChange={(e) => setNodeName(e.target.value)} className="premium-input" />
              </div>
              <div className="premium-form-group">
                <label className="premium-label">Designation / Role</label>
                <input type="text" required value={nodeDesignation} onChange={(e) => setNodeDesignation(e.target.value)} className="premium-input" />
              </div>
              <div className="premium-form-group">
                <label className="premium-label">Reporting Manager</label>
                <select 
                  value={nodeManager} 
                  onChange={(e) => setNodeManager(e.target.value)} 
                  className="premium-input"
                  style={{ background: 'var(--color-bg-subtle)' }}
                >
                  <option value="None">None (Root/CEO)</option>
                  {employees.filter(emp => emp.id !== editingEmployeeNode.id).map(emp => (
                    <option key={emp.id} value={emp.name}>{emp.name}</option>
                  ))}
                </select>
              </div>
              <div style={{ display: 'flex', gap: 12, marginTop: 10 }}>
                <button type="submit" className="premium-btn premium-btn-primary" style={{ flex: 1, height: 42, justifyContent: 'center' }}>Save Changes</button>
                <button type="button" onClick={() => setEditingEmployeeNode(null)} className="premium-btn premium-btn-secondary" style={{ flex: 1, height: 42, justifyContent: 'center' }}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
