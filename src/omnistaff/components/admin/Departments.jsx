import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Plus, Edit3, Trash2, Users, UserCheck, X, FileText, Download, 
  Upload, Landmark, ShieldAlert, Award, ArrowRightLeft, DollarSign
} from 'lucide-react';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';
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


export default function Departments({ setActiveTab, currency = 'USD' }) {
  const currencySymbol = (() => {
    switch (currency) {
      case 'INR': return '₹';
      case 'EUR': return '€';
      case 'GBP': return '£';
      case 'JPY': return '¥';
      default: return '$';
    }
  })();
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState('list'); // 'list', 'add', 'edit', 'transfer', 'assign-head'
  
  const [editingDept, setEditingDept] = useState(null);
  const [selectedDept, setSelectedDept] = useState(null);

  // Form states
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [head, setHead] = useState('');
  const [budget, setBudget] = useState('');
  const [status, setStatus] = useState('Active');
  
  useEffect(() => {
    const fetchDeps = async () => {
      try {
        const data = await api.getAdminDepartments();
        setDepartments(data);
      } catch (err) {
        console.error('Failed to load departments', err);
      } finally {
        setLoading(false);
      }
    };
    fetchDeps();
  }, []);
  
  // Transfer state
  const [transferTarget, setTransferTarget] = useState('');
  const [transferAmount, setTransferAmount] = useState('1');

  const startEdit = (dept) => {
    setEditingDept(dept);
    setName(dept.name);
    setCode(dept.code);
    setHead(dept.head);
    setBudget(dept.budget);
    setStatus(dept.status);
    setViewMode('edit');
  };

  const handleCreateOrEdit = async (e) => {
    e.preventDefault();
    if (!name || !code || !head) return;

    try {
      if (viewMode === 'edit') {
        const updated = await api.updateAdminDepartment(editingDept.id, { name, code, head, budget: Number(budget), status });
        setDepartments(departments.map(d => d.id === editingDept.id ? updated : d));
      } else {
        const newD = await api.createAdminDepartment({ name, code, head, budget: Number(budget), status });
        setDepartments([...departments, newD]);
      }
      resetForm();
      setViewMode('list');
    } catch (err) {
      alert(err.message || 'Failed to save department');
    }
  };

  const handleDelete = async (id) => {
    if (confirm("Purge department and reallocate budget allocations?")) {
      try {
        await api.deleteAdminDepartment(id);
        setDepartments(departments.filter(d => d.id !== id));
      } catch (err) {
        alert(err.message || 'Failed to delete');
      }
    }
  };

  const handleTransfer = async (e) => {
    e.preventDefault();
    if (!selectedDept || !transferTarget) return;
    const amount = Number(transferAmount);
    if (selectedDept.employees < amount) {
      alert("Insufficient employee headcount in source department!");
      return;
    }
    try {
      await api.transferEmployees(selectedDept.id, Number(transferTarget), amount);
      const data = await api.getAdminDepartments();
      setDepartments(data);
      setViewMode('list');
      alert(`Successfully transferred ${amount} employees to target department!`);
    } catch (err) {
      alert(err.message || 'Failed to transfer employees');
    }
  };

  const resetForm = () => {
    setName('');
    setCode('');
    setHead('');
    setBudget('');
    setStatus('Active');
    setEditingDept(null);
  };

  // Pie chart stats
  const pieData = departments.map(d => ({ name: d.name, value: d.employees }));
  const COLORS = ['#4F46E5', '#06B6D4', '#22C55E', '#F59E0B', '#EF4444', '#8B5CF6'];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
      
      <AnimatePresence mode="wait">
        
        {/* VIEW 1: Main Panel */}
        {viewMode === 'list' && (
          <motion.div
            key="list"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            style={{ display: 'flex', flexDirection: 'column', gap: 18 }}
          >
            {/* KPIs Grid - Hiding Budget Card */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 14 }}>
              <div className="premium-card" style={{ padding: 18 }}>
                <span className="premium-label" style={{ fontSize: '0.65rem' }}>Total Departments</span>
                <h4 style={{ fontSize: '1.25rem', fontWeight: 800, marginTop: 4 }}>
                  <AnimatedCounter value={departments.length} />
                </h4>
              </div>
              <div className="premium-card" style={{ padding: 18 }}>
                <span className="premium-label" style={{ fontSize: '0.65rem' }}>Active Blocks</span>
                <h4 style={{ fontSize: '1.25rem', fontWeight: 800, marginTop: 4, color: 'var(--color-success)' }}>
                  <AnimatedCounter value={departments.filter(d => d.status === 'Active').length} />
                </h4>
              </div>
              <div className="premium-card" style={{ padding: 18 }}>
                <span className="premium-label" style={{ fontSize: '0.65rem' }}>Avg Headcount</span>
                <h4 style={{ fontSize: '1.25rem', fontWeight: 800, marginTop: 4, color: 'var(--color-primary)' }}>
                  <AnimatedCounter value={Math.round(departments.reduce((acc, d) => acc + d.employees, 0) / departments.length || 0)} currencySymbol={currencySymbol} />
                </h4>
              </div>
            </div>

            {/* Actions panel */}
            <div className="premium-card" style={{ padding: 12, display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 14 }}>
              <div>
                <h3 style={{ fontSize: '0.85rem', fontWeight: 700 }}>Corporate Divisions</h3>
                <span style={{ fontSize: '0.7rem', color: 'var(--color-text-tertiary)' }}>Department registries, staff transfers, and nodes</span>
              </div>
              <div style={{ display: 'flex', gap: 10 }}>
                <button onClick={() => setViewMode('add')} className="premium-btn premium-btn-primary" style={{ padding: '6px 12px', fontSize: '0.75rem' }}>
                  <Plus size={12} />
                  <span>Create Department</span>
                </button>
              </div>
            </div>

            {/* Department Table */}
            <div className="premium-card" style={{ padding: 10 }}>
              <div className="premium-table-container">
                <table className="premium-table">
                  <thead>
                    <tr style={{ fontSize: '0.75rem' }}>
                      <th>Division Code</th>
                      <th>Department Name</th>
                      <th>Department Head</th>
                      <th>Employees Count</th>
                      <th>Status</th>
                      <th style={{ textAlign: 'right' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody style={{ fontSize: '0.75rem' }}>
                    {departments.map((dept) => (
                      <tr 
                        key={dept.id} 
                        onClick={() => setSelectedDept(dept)} 
                        style={{ cursor: 'pointer', background: selectedDept?.id === dept.id ? 'rgba(79, 70, 229, 0.04)' : 'transparent' }}
                      >
                        <td style={{ fontWeight: 700 }}>{dept.code}</td>
                        <td style={{ fontWeight: 600 }}>{dept.name}</td>
                        <td style={{ fontWeight: 600 }}>{dept.head}</td>
                        <td style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.7rem', color: 'var(--color-text-secondary)', fontWeight: 500 }}>{dept.employees} employees</td>
                        <td><span className={`badge ${dept.status === 'Active' ? 'badge-success' : 'badge-danger'}`} style={{ fontSize: '0.65rem' }}>{dept.status}</span></td>
                        <td style={{ textAlign: 'right' }} onClick={(e) => e.stopPropagation()}>
                          <div style={{ display: 'inline-flex', gap: 6 }}>
                            <button onClick={() => { setSelectedDept(dept); setTransferTarget(departments.find(d => d.id !== dept.id)?.id || ''); setViewMode('transfer'); }} className="quick-action-item" style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--color-primary)', padding: 4 }}>
                              <ArrowRightLeft size={13} />
                            </button>
                            <button onClick={() => startEdit(dept)} className="quick-action-item" style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--color-text-secondary)', padding: 4 }}>
                              <Edit3 size={13} />
                            </button>
                            <button onClick={() => handleDelete(dept.id)} className="quick-action-item" style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--color-danger)', padding: 4 }}>
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

            {/* Collapsible Details Drawer Panel */}
            <AnimatePresence>
              {selectedDept && (
                <motion.div 
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="premium-card" 
                  style={{ padding: 18, border: '1px solid var(--color-primary)', overflow: 'hidden' }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--color-border)', paddingBottom: 8, marginBottom: 12 }}>
                    <div>
                      <h4 style={{ fontSize: '0.8rem', fontWeight: 800, margin: 0 }}>Division Node Details: {selectedDept.name} ({selectedDept.code})</h4>
                      <span style={{ fontSize: '0.7rem', color: 'var(--color-text-tertiary)' }}>Active Department Head: {selectedDept.head}</span>
                    </div>
                    <button onClick={() => setSelectedDept(null)} style={{ border: 'none', background: 'transparent', cursor: 'pointer', color: 'var(--color-text-secondary)' }}><X size={14} /></button>
                  </div>
                  
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                    <div style={{ fontSize: '0.75rem', lineHeight: 1.4, color: 'var(--color-text-secondary)' }}>
                      <strong>Mission Statement:</strong> Facilitating enterprise workflows, coordinating strategic objectives, and driving core product excellence.
                    </div>
                    
                    <div>
                      <strong style={{ fontSize: '0.75rem', display: 'block', marginBottom: 6 }}>Department Headcount List:</strong>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                        {selectedDept.name === 'Engineering' && (
                          <>
                            <div style={{ display: 'flex', justifyContent: 'space-between', padding: 8, background: 'rgba(0,0,0,0.01)', borderRadius: 8, fontSize: '0.75rem' }}>
                              <span>Marcus Vance</span>
                              <span style={{ color: 'var(--color-text-tertiary)' }}>Engineering Tech Lead</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', padding: 8, background: 'rgba(0,0,0,0.01)', borderRadius: 8, fontSize: '0.75rem' }}>
                              <span>Alexander Wright</span>
                              <span style={{ color: 'var(--color-text-tertiary)' }}>Senior Software Engineer</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', padding: 8, background: 'rgba(0,0,0,0.01)', borderRadius: 8, fontSize: '0.75rem' }}>
                              <span>Test Puncher</span>
                              <span style={{ color: 'var(--color-text-tertiary)' }}>Senior Node Developer</span>
                            </div>
                          </>
                        )}
                        {selectedDept.name === 'Design' && (
                          <div style={{ display: 'flex', justifyContent: 'space-between', padding: 8, background: 'rgba(0,0,0,0.01)', borderRadius: 8, fontSize: '0.75rem' }}>
                            <span>Sarah Jenkins</span>
                            <span style={{ color: 'var(--color-text-tertiary)' }}>Senior UX Designer</span>
                          </div>
                        )}
                        {selectedDept.name === 'Marketing' && (
                          <div style={{ display: 'flex', justifyContent: 'space-between', padding: 8, background: 'rgba(0,0,0,0.01)', borderRadius: 8, fontSize: '0.75rem' }}>
                            <span>Sophia Patel</span>
                            <span style={{ color: 'var(--color-text-tertiary)' }}>Growth Lead Analyst</span>
                          </div>
                        )}
                        {selectedDept.name === 'Sales' && (
                          <>
                            <div style={{ display: 'flex', justifyContent: 'space-between', padding: 8, background: 'rgba(0,0,0,0.01)', borderRadius: 8, fontSize: '0.75rem' }}>
                              <span>Harvey Specter</span>
                              <span style={{ color: 'var(--color-text-tertiary)' }}>Sales Partner</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', padding: 8, background: 'rgba(0,0,0,0.01)', borderRadius: 8, fontSize: '0.75rem' }}>
                              <span>Bruce Wayne</span>
                              <span style={{ color: 'var(--color-text-tertiary)' }}>Operations Director</span>
                            </div>
                          </>
                        )}
                        {selectedDept.name === 'HR' && (
                          <div style={{ display: 'flex', justifyContent: 'space-between', padding: 8, background: 'rgba(0,0,0,0.01)', borderRadius: 8, fontSize: '0.75rem' }}>
                            <span>Diana Prince</span>
                            <span style={{ color: 'var(--color-text-tertiary)' }}>HR Director</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Charts section - Only showing distribution */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 24 }}>
              {/* Pie Chart: Employee distribution */}
              <div className="premium-card" style={{ padding: 18, height: 260 }}>
                <h3 style={{ fontSize: '0.8rem', fontWeight: 700, marginBottom: 10 }}>Department Headcount Distribution</h3>
                <div style={{ width: '100%', height: '80%' }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie 
                        data={pieData} 
                        cx="50%" 
                        cy="50%" 
                        innerRadius={50} 
                        outerRadius={70} 
                        paddingAngle={5} 
                        dataKey="value"
                      >
                        {pieData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

          </motion.div>
        )}

        {/* VIEW 2: Create or Edit */}
        {(viewMode === 'add' || viewMode === 'edit') && (
          <motion.div
            key="add-edit"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            className="premium-card"
            style={{ padding: 32, display: 'flex', flexDirection: 'column', gap: 24 }}
          >
            <h3 style={{ fontSize: '1.25rem', fontWeight: 800 }}>{viewMode === 'edit' ? 'Modify Division Parameters' : 'Create Department'}</h3>
            <form onSubmit={handleCreateOrEdit} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
              <div className="premium-form-group">
                <label className="premium-label">Department Name</label>
                <input type="text" required value={name} onChange={(e) => setName(e.target.value)} className="premium-input" placeholder="e.g. Finance Operations" />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 18 }}>
                <div className="premium-form-group">
                  <label className="premium-label">Division Code</label>
                  <input type="text" required value={code} onChange={(e) => setCode(e.target.value)} className="premium-input" placeholder="e.g. DEPT-FIN" />
                </div>
                <div className="premium-form-group">
                  <label className="premium-label">Department Head</label>
                  <input type="text" required value={head} onChange={(e) => setHead(e.target.value)} className="premium-input" placeholder="e.g. Harvey Specter" />
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 18 }}>
                <div className="premium-form-group">
                  <label className="premium-label">Status</label>
                  <select value={status} onChange={(e) => setStatus(e.target.value)} className="premium-input">
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                </div>
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12 }}>
                <button type="button" onClick={() => { resetForm(); setViewMode('list'); }} className="premium-btn premium-btn-secondary">Cancel</button>
                <button type="submit" className="premium-btn premium-btn-primary">Save Department</button>
              </div>
            </form>
          </motion.div>
        )}

        {/* VIEW 3: Transfer Employees */}
        {viewMode === 'transfer' && selectedDept && (
          <motion.div
            key="transfer"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            className="premium-card"
            style={{ padding: 32, display: 'flex', flexDirection: 'column', gap: 24 }}
          >
            <h3 style={{ fontSize: '1.25rem', fontWeight: 800 }}>Reallocate Staff Headcount</h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--color-text-tertiary)' }}>Reassign active employees from **{selectedDept.name}** to another branch</p>
            <form onSubmit={handleTransfer} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
              <div className="premium-form-group">
                <label className="premium-label">Target Department</label>
                <select value={transferTarget} onChange={(e) => setTransferTarget(e.target.value)} className="premium-input">
                  {departments.filter(d => d.id !== selectedDept.id).map(d => (
                    <option key={d.id} value={d.id}>{d.name} ({d.employees} employees)</option>
                  ))}
                </select>
              </div>
              <div className="premium-form-group">
                <label className="premium-label">Number of Employees to Transfer</label>
                <input type="number" required min="1" max={selectedDept.employees} value={transferAmount} onChange={(e) => setTransferAmount(e.target.value)} className="premium-input" />
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12 }}>
                <button type="button" onClick={() => { setViewMode('list'); setSelectedDept(null); }} className="premium-btn premium-btn-secondary">Cancel</button>
                <button type="submit" className="premium-btn premium-btn-primary">Execute Transfer</button>
              </div>
            </form>
          </motion.div>
        )}

      </AnimatePresence>

    </div>
  );
}
