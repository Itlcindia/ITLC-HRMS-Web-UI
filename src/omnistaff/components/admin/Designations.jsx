import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Briefcase, Plus, Users, DollarSign, Search, Award, ShieldAlert, Edit3, Trash2, Download } from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, Cell, Tooltip, XAxis, YAxis, CartesianGrid, AreaChart, Area } from 'recharts';
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


export default function Designations({ setActiveTab, currency = 'USD' }) {
  const currencySymbol = (() => {
    switch (currency) {
      case 'INR': return '₹';
      case 'EUR': return '€';
      case 'GBP': return '£';
      case 'JPY': return '¥';
      default: return '$';
    }
  })();
  const [designations, setDesignations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState('list'); // 'list', 'add', 'edit'
  
  const [editingDesg, setEditingDesg] = useState(null);

  // Form states
  const [title, setTitle] = useState('');
  const [dept, setDept] = useState('Engineering');
  const [level, setLevel] = useState('L4 - Senior');
  const [salaryBand, setSalaryBand] = useState('₹80K - ₹100K');
  const [avgSalary, setAvgSalary] = useState('90000');
  const [status, setStatus] = useState('Active');

  useEffect(() => {
    const fetchDesgs = async () => {
      try {
        const data = await api.getAdminDesignations();
        setDesignations(data);
      } catch (err) {
        console.error('Failed to load designations', err);
      } finally {
        setLoading(false);
      }
    };
    fetchDesgs();
  }, []);

  const startEdit = (desg) => {
    setEditingDesg(desg);
    setTitle(desg.title);
    setDept(desg.department);
    setLevel(desg.level);
    setSalaryBand(desg.salaryBand);
    setAvgSalary(desg.avgSalary.toString());
    setStatus(desg.status);
    setViewMode('edit');
  };

  const handleCreateOrEdit = async (e) => {
    e.preventDefault();
    if (!title || !salaryBand) return;

    try {
      if (viewMode === 'edit') {
        const updated = await api.updateAdminDesignation(editingDesg.id, { title, department: dept, level, salaryBand, avgSalary: Number(avgSalary), status });
        setDesignations(designations.map(d => d.id === editingDesg.id ? updated : d));
      } else {
        const newD = await api.createAdminDesignation({ title, department: dept, level, salaryBand, avgSalary: Number(avgSalary), status });
        setDesignations([...designations, newD]);
      }
      resetForm();
      setViewMode('list');
    } catch (err) {
      alert(err.message || 'Failed to save designation');
    }
  };

  const handleDelete = async (id) => {
    if (confirm("Delete designation? All active associated employee profiles must be re-categorized.")) {
      try {
        await api.deleteAdminDesignation(id);
        setDesignations(designations.filter(d => d.id !== id));
      } catch (err) {
        alert(err.message || 'Failed to delete');
      }
    }
  };

  const resetForm = () => {
    setTitle('');
    setDept('Engineering');
    setLevel('L4 - Senior');
    setSalaryBand('₹80K - ₹100K');
    setAvgSalary('90000');
    setStatus('Active');
    setEditingDesg(null);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      
      <AnimatePresence mode="wait">
        
        {/* VIEW 1: Main List */}
        {viewMode === 'list' && (
          <motion.div
            key="list"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            style={{ display: 'flex', flexDirection: 'column', gap: 24 }}
          >
            {/* KPIs Grid - Hiding Salary */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 14 }}>
              <div className="premium-card" style={{ padding: 18 }}>
                <span className="premium-label" style={{ fontSize: '0.65rem' }}>Total Designations</span>
                <h4 style={{ fontSize: '1.25rem', fontWeight: 800, marginTop: 4 }}>
                  <AnimatedCounter value={designations.length} currencySymbol={currencySymbol} />
                </h4>
              </div>
              <div className="premium-card" style={{ padding: 18 }}>
                <span className="premium-label" style={{ fontSize: '0.65rem' }}>Vacant Positions</span>
                <h4 style={{ fontSize: '1.25rem', fontWeight: 800, marginTop: 4, color: 'var(--color-warning)' }}>
                  <AnimatedCounter value={designations.reduce((acc, d) => acc + d.vacant, 0)} />
                </h4>
              </div>
              <div className="premium-card" style={{ padding: 18 }}>
                <span className="premium-label" style={{ fontSize: '0.65rem' }}>Filled Positions</span>
                <h4 style={{ fontSize: '1.25rem', fontWeight: 800, marginTop: 4, color: 'var(--color-success)' }}>
                  <AnimatedCounter value={designations.reduce((acc, d) => acc + d.count, 0)} />
                </h4>
              </div>
            </div>

            {/* Actions panel */}
            <div className="premium-card" style={{ padding: 12, display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 14 }}>
              <div>
                <h3 style={{ fontSize: '0.85rem', fontWeight: 700 }}>Corporate Designations</h3>
                <span style={{ fontSize: '0.7rem', color: 'var(--color-text-tertiary)' }}>Adjust corporate hierarchy levels and staff metrics</span>
              </div>
              <button onClick={() => setViewMode('add')} className="premium-btn premium-btn-primary" style={{ padding: '6px 12px', fontSize: '0.75rem' }}>
                <Plus size={12} />
                <span>Add Designation</span>
              </button>
            </div>

            {/* Designations Table */}
            <div className="premium-card" style={{ padding: 10 }}>
              <div className="premium-table-container">
                <table className="premium-table">
                  <thead>
                    <tr style={{ fontSize: '0.75rem' }}>
                      <th>Designation Name</th>
                      <th>Department</th>
                      <th>Grade Level</th>
                      <th>Employee Count</th>
                      <th>Status</th>
                      <th style={{ textAlign: 'right' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody style={{ fontSize: '0.75rem' }}>
                    {designations.map((desg) => (
                      <tr key={desg.id}>
                        <td style={{ fontWeight: 700 }}>{desg.title}</td>
                        <td><span className="badge badge-info" style={{ fontSize: '0.65rem' }}>{desg.department}</span></td>
                        <td style={{ fontWeight: 600 }}>{desg.level}</td>
                        <td style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.7rem', color: 'var(--color-text-secondary)', fontWeight: 500 }}>{desg.count} employees</td>
                        <td><span className={`badge ${desg.status === 'Active' ? 'badge-success' : 'badge-danger'}`} style={{ fontSize: '0.65rem' }}>{desg.status}</span></td>
                        <td style={{ textAlign: 'right' }}>
                          <div style={{ display: 'inline-flex', gap: 6 }}>
                            <button onClick={() => startEdit(desg)} className="quick-action-item" style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--color-text-secondary)', padding: 4 }}>
                              <Edit3 size={13} />
                            </button>
                            <button onClick={() => handleDelete(desg.id)} className="quick-action-item" style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--color-danger)', padding: 4 }}>
                              <Trash2 size={13} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Analytics - Only showing Headcount */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 24 }}>
              {/* Headcount Distribution */}
              <div className="premium-card" style={{ padding: 18, height: 260 }}>
                <h3 style={{ fontSize: '0.8rem', fontWeight: 700, marginBottom: 10 }}>Role Headcount Distribution</h3>
                <div style={{ width: '100%', height: '80%' }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={designations} margin={{ top: 10, right: 10, left: -24, bottom: 0 }}>
                      <defs>
                        <linearGradient id="desgGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="var(--color-primary)" stopOpacity={0.2}/>
                          <stop offset="95%" stopColor="var(--color-primary)" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} />
                      <XAxis dataKey="title" tick={{ fontSize: 10 }} />
                      <YAxis tick={{ fontSize: 12 }} />
                      <Tooltip />
                      <Area type="monotone" dataKey="count" stroke="var(--color-primary)" strokeWidth={2} fillOpacity={1} fill="url(#desgGrad)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

          </motion.div>
        )}

        {/* VIEW 2: Add or Edit */}
        {(viewMode === 'add' || viewMode === 'edit') && (
          <motion.div
            key="add-edit"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            className="premium-card"
            style={{ padding: 32, display: 'flex', flexDirection: 'column', gap: 24 }}
          >
            <h3 style={{ fontSize: '1.25rem', fontWeight: 800 }}>{viewMode === 'edit' ? 'Modify Title Settings' : 'Create Corporate Designation'}</h3>
            <form onSubmit={handleCreateOrEdit} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
              <div className="premium-form-group">
                <label className="premium-label">Designation Title</label>
                <input type="text" required value={title} onChange={(e) => setTitle(e.target.value)} className="premium-input" placeholder="e.g. Principal Architect" />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 18 }}>
                <div className="premium-form-group">
                  <label className="premium-label">Department Mapping</label>
                  <select value={dept} onChange={(e) => setDept(e.target.value)} className="premium-input">
                    <option value="Engineering">Engineering</option>
                    <option value="Design">Design</option>
                    <option value="Marketing">Marketing</option>
                    <option value="Sales">Sales</option>
                    <option value="HR">HR</option>
                  </select>
                </div>
                <div className="premium-form-group">
                  <label className="premium-label">Grade / Hierarchy Level</label>
                  <input type="text" required value={level} onChange={(e) => setLevel(e.target.value)} className="premium-input" placeholder="e.g. L5 - Principal" />
                </div>
              </div>
              <div className="premium-form-group">
                <label className="premium-label">Status</label>
                <select value={status} onChange={(e) => setStatus(e.target.value)} className="premium-input">
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                </select>
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12 }}>
                <button type="button" onClick={() => { resetForm(); setViewMode('list'); }} className="premium-btn premium-btn-secondary">Cancel</button>
                <button type="submit" className="premium-btn premium-btn-primary">Save Changes</button>
              </div>
            </form>
          </motion.div>
        )}

      </AnimatePresence>

    </div>
  );
}
