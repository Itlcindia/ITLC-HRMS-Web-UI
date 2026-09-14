import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, Check, X, ShieldAlert, FileText, ChevronRight, PlusCircle, AlertCircle, Pencil, Trash } from 'lucide-react';

const initialLeaveBalances = [
  { type: 'Annual Leave', allocated: 24, taken: 10, remaining: 14, color: '#4F46E5' },
  { type: 'Sick Leave', allocated: 12, taken: 3, remaining: 9, color: '#EF4444' },
  { type: 'Casual Leave', allocated: 8, taken: 2, remaining: 6, color: '#06B6D4' },
  { type: 'Maternity/Paternity', allocated: 90, taken: 45, remaining: 45, color: '#22C55E' },
];

const initialRequests = [
  { id: 1, name: 'Alice Smith', type: 'Annual Leave', range: 'July 10 - July 15', days: 5, reason: 'Family vacation', status: 'Pending' },
  { id: 2, name: 'Bob Johnson', type: 'Sick Leave', range: 'July 05 - July 06', days: 2, reason: 'Dental surgery', status: 'Pending' },
];

const initialHolidays = [];
const initialLeavePolicies = [];

import { api } from '../../services/api';
import { useEffect } from 'react';

export default function LeaveManagement({ subTab = 'dashboard', setActiveTab }) {
  const [balances, setBalances] = useState(initialLeaveBalances);
  const [requests, setRequests] = useState([]);
  const [myRequests, setMyRequests] = useState([]);
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [holidays, setHolidays] = useState(initialHolidays);
  const [policies, setPolicies] = useState(initialLeavePolicies);
  const [selectedLeaveDetails, setSelectedLeaveDetails] = useState(null);

  // Edit Leave Request states
  const [editingLeave, setEditingLeave] = useState(null);
  const [editLeaveType, setEditLeaveType] = useState('Annual Leave');
  const [editLeaveFrom, setEditLeaveFrom] = useState('');
  const [editLeaveTo, setEditLeaveTo] = useState('');
  const [editLeaveDays, setEditLeaveDays] = useState(1);
  const [editLeaveReason, setEditLeaveReason] = useState('');
  const [editLeaveStatus, setEditLeaveStatus] = useState('Pending');

  const [newHolidayName, setNewHolidayName] = useState('');
  const [newHolidayDate, setNewHolidayDate] = useState('');

  const [newPolicyName, setNewPolicyName] = useState('');
  const [newPolicyAlloc, setNewPolicyAlloc] = useState('0');
  const [newPolicyCarry, setNewPolicyCarry] = useState('0');
  const [newPolicyPayout, setNewPolicyPayout] = useState('Paid');

  const tabs = [
    { id: 'dashboard', label: 'Dashboard' },
    { id: 'request', label: 'Leave Request' },
    { id: 'my', label: 'My Leave' },
    { id: 'policies', label: 'Policies Setup' },
    { id: 'calendar', label: 'Leave Calendar' },
    { id: 'reports', label: 'Reports' },
  ];

  // Load from DB & Poll every 5s for real-time updates
  useEffect(() => {
    const fetchLeaves = async () => {
      try {
        const list = await api.getAdminLeaves();
        const mapped = list.map(req => ({
          id: req.id,
          name: req.employeeName,
          type: req.type,
          range: `${req.fromDate} - ${req.toDate}`,
          days: req.totalDays,
          reason: req.reason,
          status: req.status,
          managerStatus: req.managerStatus || 'Pending',
          managerComment: req.managerComment || '',
          attachment: req.attachment || ''
        }));
        setRequests(mapped);

        // Fetch user's own leave requests
        try {
          const myList = await api.getEmployeeLeaves();
          setMyRequests(myList || []);
        } catch (myErr) {
          console.error("Failed to load own leaves:", myErr);
        }

        const hols = await api.getAdminHolidays();
        setHolidays(hols);

        const pols = await api.getAdminLeavePolicies();
        setPolicies(pols);
      } catch (err) {
        console.error(err);
      }
    };
    fetchLeaves();
    const interval = setInterval(fetchLeaves, 5000);
    return () => clearInterval(interval);
  }, []);

  // Form states
  const [leaveType, setLeaveType] = useState('Annual Leave');
  const [duration, setDuration] = useState('3');
  const [dates, setDates] = useState('July 15 - July 18');
  const [reason, setReason] = useState('');

  const handleAction = async (id, newStatus) => {
    try {
      await api.updateAdminLeave(id, newStatus);

      setRequests(requests.map(req => {
        if (req.id === id) {
          if (newStatus === 'Approved' && req.status === 'Pending') {
            setBalances(prevBalances => prevBalances.map(bal => {
              if (bal.type === req.type) {
                return {
                  ...bal,
                  taken: bal.taken + req.days,
                  remaining: Math.max(0, bal.remaining - req.days)
                };
              }
              return bal;
            }));
          }
          return { ...req, status: newStatus };
        }
        return req;
      }));
    } catch (err) {
      alert(err.message || 'Action failed');
    }
  };

  const handleApply = async (e) => {
    e.preventDefault();
    if (!reason || !dates) return;
    
    let fromVal = '';
    let toVal = '';
    if (dates.includes(' - ')) {
      const parts = dates.split(' - ');
      fromVal = parts[0] || '';
      toVal = parts[1] || '';
    } else {
      fromVal = dates;
      toVal = dates;
    }

    try {
      await api.createLeaveRequest({
        type: leaveType,
        fromDate: fromVal,
        toDate: toVal,
        totalDays: Number(duration),
        reason
      });
      alert("Leave request submitted successfully. Awaiting review.");
      setReason('');
      setDates('');
      setShowApplyModal(false);
      
      // Reload both lists
      const [list, myList] = await Promise.all([
        api.getAdminLeaves(),
        api.getEmployeeLeaves().catch(() => [])
      ]);
      const mapped = list.map(req => ({
        id: req.id,
        name: req.employeeName,
        type: req.type,
        range: `${req.fromDate} - ${req.toDate}`,
        days: req.totalDays,
        reason: req.reason,
        status: req.status,
        managerStatus: req.managerStatus || 'Pending',
        managerComment: req.managerComment || '',
        attachment: req.attachment || ''
      }));
      setRequests(mapped);
      setMyRequests(myList || []);
    } catch (err) {
      alert("Failed to submit leave request: " + err.message);
    }
  };

  const handleStartEditLeave = (req) => {
    let fromVal = '';
    let toVal = '';
    if (req.range && req.range.includes(' - ')) {
      const parts = req.range.split(' - ');
      fromVal = parts[0] || '';
      toVal = parts[1] || '';
    } else {
      fromVal = req.range;
      toVal = req.range;
    }
    setEditingLeave(req);
    setEditLeaveType(req.type || 'Annual Leave');
    setEditLeaveFrom(fromVal);
    setEditLeaveTo(toVal);
    setEditLeaveDays(req.days || 1);
    setEditLeaveReason(req.reason || '');
    setEditLeaveStatus(req.status || 'Pending');
  };

  const handleSaveEditLeave = async (e) => {
    e.preventDefault();
    if (!editingLeave) return;
    try {
      await api.updateAdminLeaveDetails(editingLeave.id, {
        type: editLeaveType,
        fromDate: editLeaveFrom,
        toDate: editLeaveTo,
        totalDays: editLeaveDays,
        reason: editLeaveReason,
        status: editLeaveStatus
      });
      alert("Leave request updated successfully!");
      setEditingLeave(null);
      
      // Reload leave requests
      const [list, myList] = await Promise.all([
        api.getAdminLeaves(),
        api.getEmployeeLeaves().catch(() => [])
      ]);
      const mapped = list.map(req => ({
        id: req.id,
        name: req.employeeName,
        type: req.type,
        range: `${req.fromDate} - ${req.toDate}`,
        days: req.totalDays,
        reason: req.reason,
        status: req.status,
        managerStatus: req.managerStatus || 'Pending',
        managerComment: req.managerComment || '',
        attachment: req.attachment || ''
      }));
      setRequests(mapped);
      setMyRequests(myList || []);
    } catch (err) {
      alert("Failed to update leave request: " + err.message);
    }
  };

  const handleDeleteLeave = async (id) => {
    if (!window.confirm("Are you sure you want to delete this leave request?")) return;
    try {
      await api.deleteAdminLeave(id);
      alert("Leave request deleted successfully!");
      setRequests(requests.filter(req => req.id !== id));
      setMyRequests(myRequests.filter(req => req.id !== id));
      if (selectedLeaveDetails && selectedLeaveDetails.id === id) {
        setSelectedLeaveDetails(null);
      }
    } catch (err) {
      alert("Failed to delete leave request: " + err.message);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      
      {/* Sub tabs navigation */}
      <div style={{
        display: 'flex',
        gap: 8,
        borderBottom: '1px solid var(--color-border)',
        paddingBottom: 8,
        overflowX: 'auto',
        scrollbarWidth: 'none'
      }} className="no-scrollbar">
        {tabs.map(tab => {
          const isActive = subTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => {
                if (setActiveTab) {
                  setActiveTab(`leave-${tab.id}`);
                }
              }}
              style={{
                padding: '8px 16px',
                borderRadius: 8,
                border: 'none',
                background: isActive ? 'var(--color-primary-light)' : 'transparent',
                color: isActive ? 'var(--color-primary)' : 'var(--color-text-secondary)',
                fontWeight: isActive ? 700 : 500,
                cursor: 'pointer',
                fontSize: '0.85rem',
                whiteSpace: 'nowrap',
                transition: 'all 0.15s ease',
                outline: 'none'
              }}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      <AnimatePresence mode="wait">
        
        {/* SUB-VIEW 1: Dashboard */}
        {subTab === 'dashboard' && (
          <motion.div
            key="dashboard"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            style={{ display: 'flex', flexDirection: 'column', gap: 24 }}
          >
            {/* Balance cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 20 }}>
              {balances.map((bal, idx) => (
                <div key={idx} className="premium-card" style={{ padding: 24, borderLeft: `5px solid ${bal.color}` }}>
                  <span className="premium-label" style={{ fontSize: '0.65rem' }}>{bal.type}</span>
                  <h4 style={{ fontSize: '1.75rem', fontWeight: 800, marginTop: 8 }} className="number-font">
                    {bal.remaining} <span style={{ fontSize: '0.8rem', color: 'var(--color-text-tertiary)' }}>/ {bal.allocated} days</span>
                  </h4>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', marginTop: 12, color: 'var(--color-text-tertiary)' }}>
                    <span>Taken: {bal.taken}d</span>
                    <span>Remaining</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Pending approvals */}
            <div className="premium-card" style={{ padding: 24 }}>
              <h3 style={{ fontSize: '0.95rem', fontWeight: 800, marginBottom: 16 }}>Pending Leave Requests</h3>
              <div className="premium-table-container">
                <table className="premium-table">
                  <thead>
                    <tr>
                      <th>Employee</th>
                      <th>Leave Type</th>
                      <th>Duration</th>
                      <th>Requested Dates</th>
                      <th>Reason</th>
                      <th>Manager Rec.</th>
                      <th>Status</th>
                      <th style={{ textAlign: 'right' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {requests.filter(r => r.status.toLowerCase() === 'pending').length === 0 ? (
                      <tr>
                        <td colSpan="8" style={{ textAlign: 'center', padding: 20, color: 'var(--color-text-tertiary)', fontSize: '0.85rem' }}>
                          No pending leave requests at the moment.
                        </td>
                      </tr>
                    ) : (
                      requests.filter(r => r.status.toLowerCase() === 'pending').map(req => (
                        <tr key={req.id} onClick={() => setSelectedLeaveDetails(req)} style={{ cursor: 'pointer' }}>
                          <td style={{ fontWeight: 600 }}>{req.name}</td>
                          <td><span className="badge badge-info">{req.type}</span></td>
                          <td className="number-font" style={{ fontSize: '0.85rem' }}>{req.days} days</td>
                          <td style={{ fontSize: '0.8rem' }}>{req.range}</td>
                          <td style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)' }}>{req.reason}</td>
                          <td>
                            <span 
                              className={`badge ${req.managerStatus === 'Approved' ? 'badge-success' : req.managerStatus === 'Pending' ? 'badge-warning' : 'badge-danger'}`}
                              title={req.managerComment || 'No comment submitted'}
                              style={{ cursor: req.managerComment ? 'help' : 'default' }}
                            >
                              {req.managerStatus || 'Pending'}
                            </span>
                          </td>
                          <td>
                            <span className={`badge ${req.status === 'Approved' ? 'badge-success' : req.status === 'Pending' ? 'badge-warning' : 'badge-danger'}`}>
                              {req.status}
                            </span>
                          </td>
                          <td style={{ textAlign: 'right' }}>
                            <div style={{ display: 'inline-flex', gap: 10 }} onClick={(e) => e.stopPropagation()}>
                              {req.status === 'Pending' && (
                                <>
                                  <button 
                                    onClick={(e) => { e.stopPropagation(); handleAction(req.id, 'Approved'); }}
                                    style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--color-success)', padding: 4 }}
                                    title="Approve"
                                  >
                                    <Check size={16} />
                                  </button>
                                  <button 
                                    onClick={(e) => { e.stopPropagation(); handleAction(req.id, 'Rejected'); }}
                                    style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--color-danger)', padding: 4 }}
                                    title="Reject"
                                  >
                                    <X size={16} />
                                  </button>
                                </>
                              )}
                              <button 
                                onClick={(e) => { e.stopPropagation(); handleStartEditLeave(req); }}
                                style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--color-primary)', padding: 4 }}
                                title="Edit Request"
                              >
                                <Pencil size={14} />
                              </button>
                              <button 
                                onClick={(e) => { e.stopPropagation(); handleDeleteLeave(req.id); }}
                                style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#ef4444', padding: 4 }}
                                title="Delete Request"
                              >
                                <Trash size={14} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </motion.div>
        )}

        {/* SUB-VIEW 2: Leave Requests List */}
        {subTab === 'request' && (
          <motion.div
            key="request"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="premium-card"
            style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 20 }}
          >
            <div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 800 }}>Employee Leave Requests</h3>
              <span style={{ fontSize: '0.75rem', color: 'var(--color-text-tertiary)' }}>A complete record of all employee leave applications</span>
            </div>

            <div className="premium-table-container">
              <table className="premium-table">
                <thead>
                  <tr>
                    <th>Employee</th>
                    <th>Leave Type</th>
                    <th>Duration</th>
                    <th>Requested Dates</th>
                    <th>Reason</th>
                    <th>Manager Rec.</th>
                    <th>Status</th>
                    <th style={{ textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {requests.length === 0 ? (
                    <tr>
                      <td colSpan="8" style={{ textAlign: 'center', padding: 20, color: 'var(--color-text-tertiary)', fontSize: '0.85rem' }}>
                        No leave requests found.
                      </td>
                    </tr>
                  ) : (
                    requests.map(req => (
                      <tr key={req.id} onClick={() => setSelectedLeaveDetails(req)} style={{ cursor: 'pointer' }}>
                        <td style={{ fontWeight: 600 }}>{req.name}</td>
                        <td><span className="badge badge-info">{req.type}</span></td>
                        <td className="number-font" style={{ fontSize: '0.85rem' }}>{req.days} days</td>
                        <td style={{ fontSize: '0.8rem' }}>{req.range}</td>
                        <td style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)' }}>{req.reason}</td>
                        <td>
                          <span 
                            className={`badge ${req.managerStatus === 'Approved' ? 'badge-success' : req.managerStatus === 'Pending' ? 'badge-warning' : 'badge-danger'}`}
                            title={req.managerComment || 'No comment submitted'}
                            style={{ cursor: req.managerComment ? 'help' : 'default' }}
                          >
                            {req.managerStatus || 'Pending'}
                          </span>
                        </td>
                        <td>
                          <span className={`badge ${req.status === 'Approved' ? 'badge-success' : req.status === 'Pending' ? 'badge-warning' : 'badge-danger'}`}>
                            {req.status}
                          </span>
                        </td>
                        <td style={{ textAlign: 'right' }}>
                          <div style={{ display: 'inline-flex', gap: 10 }} onClick={(e) => e.stopPropagation()}>
                            {req.status === 'Pending' && (
                              <>
                                <button 
                                  onClick={(e) => { e.stopPropagation(); handleAction(req.id, 'Approved'); }}
                                  style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--color-success)', padding: 4 }}
                                  title="Approve"
                                >
                                  <Check size={16} />
                                </button>
                                <button 
                                  onClick={(e) => { e.stopPropagation(); handleAction(req.id, 'Rejected'); }}
                                  style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--color-danger)', padding: 4 }}
                                  title="Reject"
                                >
                                  <X size={16} />
                                </button>
                              </>
                            )}
                            <button 
                              onClick={(e) => { e.stopPropagation(); handleStartEditLeave(req); }}
                              style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--color-primary)', padding: 4 }}
                              title="Edit Request"
                            >
                              <Pencil size={14} />
                            </button>
                            <button 
                              onClick={(e) => { e.stopPropagation(); handleDeleteLeave(req.id); }}
                              style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#ef4444', padding: 4 }}
                              title="Delete Request"
                            >
                              <Trash size={14} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </motion.div>
        )}

        {/* SUB-VIEW 3: My Leave */}
        {subTab === 'my' && (
          <motion.div
            key="my"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="premium-card"
            style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 20 }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 800 }}>My Balance Progress</h3>
                <span style={{ fontSize: '0.75rem', color: 'var(--color-text-tertiary)' }}>A visual breakdown of your current leave limits</span>
              </div>
              <button 
                onClick={() => {
                  setLeaveType('Annual Leave');
                  setDuration('1');
                  setDates(new Date().toISOString().split('T')[0]);
                  setReason('');
                  setShowApplyModal(true);
                }} 
                className="premium-btn premium-btn-primary" 
                style={{ padding: '8px 16px', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: 6 }}
              >
                <PlusCircle size={14} />
                <span>Apply Leave</span>
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              {balances.map((bal, idx) => {
                const percent = (bal.taken / bal.allocated) * 100;
                return (
                  <div key={idx} style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', fontWeight: 600 }}>
                      <span>{bal.type}</span>
                      <span className="number-font">{bal.taken} / {bal.allocated} days taken</span>
                    </div>
                    <div style={{ width: '100%', height: 8, background: 'var(--color-border)', borderRadius: 99 }}>
                      <div style={{ width: `${percent}%`, height: '100%', background: bal.color, borderRadius: 99 }} />
                    </div>
                  </div>
                );
              })}
            </div>

            <div style={{ marginTop: 24, borderTop: '1px solid var(--color-border)', paddingTop: 20 }}>
              <h4 style={{ fontSize: '0.9rem', fontWeight: 800, marginBottom: 12 }}>My Leave Request History</h4>
              <div className="premium-table-container">
                <table className="premium-table">
                  <thead>
                    <tr>
                      <th>Leave Type</th>
                      <th>Duration</th>
                      <th>Dates</th>
                      <th>Reason</th>
                      <th>Status</th>
                      <th style={{ textAlign: 'right' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {myRequests.length === 0 ? (
                      <tr>
                        <td colSpan="6" style={{ textAlign: 'center', padding: 20, color: 'var(--color-text-tertiary)', fontSize: '0.85rem' }}>
                          No personal leave requests found.
                        </td>
                      </tr>
                    ) : (
                      myRequests.map((req, idx) => (
                        <tr key={req.id || idx}>
                          <td style={{ fontWeight: 600 }}>{req.type}</td>
                          <td className="number-font" style={{ fontSize: '0.85rem' }}>{req.totalDays} Days</td>
                          <td className="number-font" style={{ fontSize: '0.8rem' }}>{req.fromDate} - {req.toDate}</td>
                          <td style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)' }}>{req.reason}</td>
                          <td>
                            <span className={`badge ${req.status === 'Approved' ? 'badge-success' : req.status === 'Pending' ? 'badge-warning' : 'badge-danger'}`}>
                              {req.status}
                            </span>
                          </td>
                          <td style={{ textAlign: 'right' }}>
                            {req.status === 'Pending' && (
                              <button 
                                onClick={() => handleDeleteLeave(req.id)}
                                style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#ef4444', padding: 4 }}
                                title="Delete Leave Request"
                              >
                                <Trash size={14} />
                              </button>
                            )}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

          </motion.div>
        )}

        {/* SUB-VIEW 4: Policies Setup */}
        {subTab === 'policies' && (
          <motion.div
            key="policies"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="premium-card"
            style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 20 }}
          >
            <div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 800 }}>Company Leave Policies</h3>
              <span style={{ fontSize: '0.75rem', color: 'var(--color-text-tertiary)' }}>Allocated limits, carryovers, and constraints</span>
            </div>

            <div style={{ padding: 16, background: '#f8fafc', borderRadius: 12, border: '1px solid #e2e8f0', display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
              <input 
                type="text" 
                placeholder="Leave Class (e.g. Annual Leave)" 
                value={newPolicyName} 
                onChange={e => setNewPolicyName(e.target.value)}
                className="premium-input"
                style={{ flex: 1, minWidth: 200 }}
              />
              <input 
                type="number" 
                placeholder="Annual Allocation (Days)" 
                value={newPolicyAlloc} 
                onChange={e => setNewPolicyAlloc(e.target.value)}
                className="premium-input"
                style={{ width: 120 }}
              />
              <input 
                type="number" 
                placeholder="Carry Forward" 
                value={newPolicyCarry} 
                onChange={e => setNewPolicyCarry(e.target.value)}
                className="premium-input"
                style={{ width: 120 }}
              />
              <select 
                value={newPolicyPayout} 
                onChange={e => setNewPolicyPayout(e.target.value)}
                className="premium-input"
                style={{ width: 120 }}
              >
                <option value="Paid">Paid</option>
                <option value="Unpaid">Unpaid</option>
              </select>
              <button 
                onClick={async () => {
                  if(!newPolicyName) return;
                  await api.createAdminLeavePolicy({ 
                    leaveClass: newPolicyName, 
                    annualAllocation: Number(newPolicyAlloc), 
                    carryForwardLimit: Number(newPolicyCarry), 
                    payoutMode: newPolicyPayout 
                  });
                  setNewPolicyName('');
                  setNewPolicyAlloc('0');
                  setNewPolicyCarry('0');
                  setNewPolicyPayout('Paid');
                  const pols = await api.getAdminLeavePolicies();
                  setPolicies(pols);
                }}
                className="premium-btn premium-btn-primary" 
                style={{ padding: '8px 16px' }}
              >
                Add Policy
              </button>
            </div>

            <div className="premium-table-container">
              <table className="premium-table">
                <thead>
                  <tr>
                    <th>Leave Class</th>
                    <th>Annual Allocation</th>
                    <th>Carry-forward Limit</th>
                    <th>Payout Mode</th>
                    <th style={{ textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {policies.map(pol => (
                    <tr key={pol.id}>
                      <td style={{ fontWeight: 700 }}>{pol.leaveClass}</td>
                      <td className="number-font">{pol.annualAllocation} Days</td>
                      <td className="number-font">{pol.carryForwardLimit} Days</td>
                      <td>{pol.payoutMode}</td>
                      <td style={{ textAlign: 'right' }}>
                        <button 
                          onClick={async () => {
                            await api.deleteAdminLeavePolicy(pol.id);
                            const pols = await api.getAdminLeavePolicies();
                            setPolicies(pols);
                          }}
                          style={{ background: 'transparent', border: 'none', color: 'var(--color-danger)', cursor: 'pointer' }}
                          title="Delete Policy"
                        >
                          <X size={16} />
                        </button>
                      </td>
                    </tr>
                  ))}
                  {policies.length === 0 && (
                    <tr>
                      <td colSpan="5" style={{ textAlign: 'center', padding: 20, color: 'var(--color-text-tertiary)' }}>No leave policies defined.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </motion.div>
        )}

        {/* SUB-VIEW 5: Leave Calendar */}
        {subTab === 'calendar' && (
          <motion.div
            key="calendar"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="premium-card"
            style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 20 }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 800 }}>Holiday & Leave Calendar</h3>
                <span style={{ fontSize: '0.75rem', color: 'var(--color-text-tertiary)' }}>Listed public holidays and bookings</span>
              </div>
            </div>

            <div style={{ padding: 16, background: '#f8fafc', borderRadius: 12, border: '1px solid #e2e8f0', display: 'flex', gap: 12, alignItems: 'center' }}>
              <input 
                type="text" 
                placeholder="Holiday/Festival Name" 
                value={newHolidayName} 
                onChange={e => setNewHolidayName(e.target.value)}
                className="premium-input"
                style={{ flex: 1 }}
              />
              <input 
                type="date" 
                value={newHolidayDate} 
                onChange={e => setNewHolidayDate(e.target.value)}
                className="premium-input"
              />
              <button 
                onClick={async () => {
                  if(!newHolidayName || !newHolidayDate) return;
                  await api.createAdminHoliday({ name: newHolidayName, date: newHolidayDate, type: 'Public Holiday' });
                  setNewHolidayName('');
                  setNewHolidayDate('');
                  const hols = await api.getAdminHolidays();
                  setHolidays(hols);
                }}
                className="premium-btn premium-btn-primary" 
                style={{ padding: '8px 16px' }}
              >
                Add Holiday
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {holidays.map((h, i) => (
                <div 
                  key={i} 
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: 16,
                    borderRadius: 14,
                    border: '1px solid var(--color-border)',
                    background: 'rgba(0,0,0,0.01)'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                    <Calendar size={18} style={{ color: 'var(--color-primary)' }} />
                    <div>
                      <h4 style={{ fontSize: '0.85rem', fontWeight: 700 }}>{h.name}</h4>
                      <span className="number-font" style={{ fontSize: '0.75rem', color: 'var(--color-text-tertiary)' }}>{h.date}</span>
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <span className="badge badge-info">{h.type}</span>
                    <button 
                      onClick={async () => {
                        await api.deleteAdminHoliday(h.id);
                        const hols = await api.getAdminHolidays();
                        setHolidays(hols);
                      }}
                      style={{ background: 'transparent', border: 'none', color: 'var(--color-danger)', cursor: 'pointer' }}
                      title="Delete Holiday"
                    >
                      <X size={16} />
                    </button>
                  </div>
                </div>
              ))}
              {holidays.length === 0 && (
                <div style={{ textAlign: 'center', padding: 20, color: 'var(--color-text-tertiary)' }}>No holidays added yet.</div>
              )}
            </div>
          </motion.div>
        )}

        {/* SUB-VIEW 6: Reports */}
        {subTab === 'reports' && (
          <motion.div
            key="reports"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="premium-card"
            style={{ padding: 32, display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: 20 }}
          >
            <div style={{
              width: 56,
              height: 56,
              borderRadius: '50%',
              background: 'var(--color-primary-light)',
              color: 'var(--color-primary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <FileText size={28} />
            </div>

            <div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: 8 }}>Export Leave Audits</h3>
              <p style={{ fontSize: '0.9rem', color: 'var(--color-text-tertiary)', maxWidth: 400, margin: '0 auto' }}>
                Download comprehensive leave balances, booking histories, and duration audits in Excel/CSV sheets.
              </p>
            </div>

            <button onClick={() => alert("Downloading leaves_reports_summary.xlsx")} className="premium-btn premium-btn-primary" style={{ padding: '12px 24px' }}>
              <FileText size={16} />
              <span>Download Excel Summary</span>
            </button>
          </motion.div>
        )}

      </AnimatePresence>

      <AnimatePresence>
        {selectedLeaveDetails && (
          <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            background: 'rgba(0,0,0,0.5)',
            backdropFilter: 'blur(8px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000
          }}>
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              style={{
                width: 500,
                background: 'white',
                borderRadius: 24,
                padding: 30,
                boxShadow: '0 20px 40px rgba(0,0,0,0.2)',
                border: '1px solid rgba(226, 232, 240, 0.8)',
                display: 'flex',
                flexDirection: 'column',
                gap: 20
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h3 style={{ fontSize: '1.2rem', fontWeight: 800 }}>Leave Request Details</h3>
                <button 
                  onClick={() => setSelectedLeaveDetails(null)}
                  style={{
                    background: 'none',
                    border: 'none',
                    fontSize: '1.25rem',
                    fontWeight: 'bold',
                    cursor: 'pointer',
                    color: 'var(--color-text-secondary)'
                  }}
                >
                  ✕
                </button>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, fontSize: '0.85rem' }}>
                <div>
                  <span style={{ color: 'var(--color-text-secondary)', display: 'block' }}>Employee Name</span>
                  <strong style={{ fontSize: '0.9rem' }}>{selectedLeaveDetails.name}</strong>
                </div>
                <div>
                  <span style={{ color: 'var(--color-text-secondary)', display: 'block' }}>Leave Type</span>
                  <strong>{selectedLeaveDetails.type}</strong>
                </div>
                <div>
                  <span style={{ color: 'var(--color-text-secondary)', display: 'block' }}>Requested Duration</span>
                  <strong>{selectedLeaveDetails.days} Days ({selectedLeaveDetails.range})</strong>
                </div>
                <div>
                  <span style={{ color: 'var(--color-text-secondary)', display: 'block' }}>Manager Rec.</span>
                  <span className={`badge ${selectedLeaveDetails.managerStatus === 'Approved' ? 'badge-success' : selectedLeaveDetails.managerStatus === 'Pending' ? 'badge-warning' : 'badge-danger'}`}>
                    {selectedLeaveDetails.managerStatus || 'Pending'}
                  </span>
                </div>
              </div>

              <div style={{ padding: 16, borderRadius: 16, background: '#f8fafc', border: '1px solid #e2e8f0' }}>
                <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--color-text-secondary)', textTransform: 'uppercase', display: 'block', marginBottom: 6 }}>Reason for Leave</span>
                <p style={{ fontSize: '0.85rem', lineHeight: '1.5', margin: 0 }}>{selectedLeaveDetails.reason}</p>
              </div>

              {selectedLeaveDetails.attachment && (
                <div>
                  <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--color-text-secondary)', textTransform: 'uppercase', display: 'block', marginBottom: 6 }}>Receipt Attachment</span>
                  {selectedLeaveDetails.attachment.startsWith('data:image/') ? (
                    <div style={{ display: 'flex', justifyContent: 'center', background: '#f1f5f9', padding: 8, borderRadius: 12, border: '1px solid #e2e8f0' }}>
                      <img src={selectedLeaveDetails.attachment} alt="Receipt" style={{ maxHeight: 200, maxWidth: '100%', objectFit: 'contain', borderRadius: 8 }} />
                    </div>
                  ) : (
                    <div style={{ padding: 12, border: '1px solid #e2e8f0', borderRadius: 12, display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.8rem' }}>
                      <span>Supporting Document</span>
                      <a href={selectedLeaveDetails.attachment} download="receipt.pdf" style={{ color: 'var(--color-primary)', fontWeight: 'bold' }}>Download</a>
                    </div>
                  )}
                </div>
              )}

              {selectedLeaveDetails.status.toLowerCase() === 'pending' && (
                <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end', marginTop: 10 }}>
                  <button 
                    onClick={() => {
                      handleAction(selectedLeaveDetails.id, 'Rejected');
                      setSelectedLeaveDetails(null);
                    }}
                    className="btn-punch-out" 
                    style={{ padding: '10px 20px', borderRadius: 10 }}
                  >
                    Reject
                  </button>
                  <button 
                    onClick={() => {
                      handleAction(selectedLeaveDetails.id, 'Approved');
                      setSelectedLeaveDetails(null);
                    }}
                    className="btn-punch-in" 
                    style={{ padding: '10px 20px', borderRadius: 10 }}
                  >
                    Approve
                  </button>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Apply Leave Modal */}
      {showApplyModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          backgroundColor: 'rgba(0,0,0,0.5)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 9999
        }}>
          <div className="premium-card" style={{ padding: 24, width: 420, background: 'var(--color-bg)', display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ fontSize: '1rem', fontWeight: 800 }}>Apply for Leave</h3>
              <button 
                onClick={() => setShowApplyModal(false)} 
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text-tertiary)' }}
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleApply} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div className="premium-form-group" style={{ marginBottom: 0 }}>
                <label className="premium-label" style={{ fontSize: '0.65rem' }}>Leave Type</label>
                <select 
                  value={leaveType} 
                  onChange={(e) => setLeaveType(e.target.value)} 
                  className="premium-input"
                  style={{ background: 'var(--color-bg-subtle)' }}
                >
                  <option value="Annual Leave">Annual Leave</option>
                  <option value="Sick Leave">Sick Leave</option>
                  <option value="Casual Leave">Casual Leave</option>
                  <option value="Maternity/Paternity">Maternity/Paternity</option>
                </select>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div className="premium-form-group" style={{ marginBottom: 0 }}>
                  <label className="premium-label" style={{ fontSize: '0.65rem' }}>Start Date</label>
                  <input 
                    type="date" 
                    required 
                    onChange={(e) => {
                      const fromDateStr = e.target.value;
                      setDates(prev => prev.includes(' - ') ? `${fromDateStr} - ${prev.split(' - ')[1]}` : fromDateStr);
                    }} 
                    className="premium-input" 
                  />
                </div>
                <div className="premium-form-group" style={{ marginBottom: 0 }}>
                  <label className="premium-label" style={{ fontSize: '0.65rem' }}>End Date</label>
                  <input 
                    type="date" 
                    required 
                    onChange={(e) => {
                      const toDateStr = e.target.value;
                      setDates(prev => prev.includes(' - ') ? `${prev.split(' - ')[0]} - ${toDateStr}` : `${prev} - ${toDateStr}`);
                    }} 
                    className="premium-input" 
                  />
                </div>
              </div>
              <div className="premium-form-group" style={{ marginBottom: 0 }}>
                <label className="premium-label" style={{ fontSize: '0.65rem' }}>Total Days</label>
                <input type="number" required value={duration} onChange={(e) => setDuration(e.target.value)} className="premium-input" />
              </div>
              <div className="premium-form-group" style={{ marginBottom: 0 }}>
                <label className="premium-label" style={{ fontSize: '0.65rem' }}>Reason</label>
                <textarea required value={reason} onChange={(e) => setReason(e.target.value)} className="premium-input" style={{ minHeight: 80 }} placeholder="e.g. Health checkup or vacation" />
              </div>
              <div style={{ display: 'flex', gap: 12, marginTop: 10 }}>
                <button type="submit" className="premium-btn premium-btn-primary" style={{ flex: 1, height: 42, justifyContent: 'center' }}>Submit Request</button>
                <button type="button" onClick={() => setShowApplyModal(false)} className="premium-btn premium-btn-secondary" style={{ flex: 1, height: 42, justifyContent: 'center' }}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Leave Request Modal */}
      {editingLeave && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          backgroundColor: 'rgba(0,0,0,0.5)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 9999
        }}>
          <div className="premium-card" style={{ padding: 24, width: 420, background: 'var(--color-bg)', display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ fontSize: '1rem', fontWeight: 800 }}>Edit Leave Request</h3>
              <button 
                onClick={() => setEditingLeave(null)} 
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text-tertiary)' }}
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveEditLeave} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div className="premium-form-group" style={{ marginBottom: 0 }}>
                <label className="premium-label" style={{ fontSize: '0.65rem' }}>Leave Type</label>
                <select 
                  value={editLeaveType} 
                  onChange={(e) => setEditLeaveType(e.target.value)} 
                  className="premium-input"
                  style={{ background: 'var(--color-bg-subtle)' }}
                >
                  <option value="Annual Leave">Annual Leave</option>
                  <option value="Sick Leave">Sick Leave</option>
                  <option value="Casual Leave">Casual Leave</option>
                  <option value="Maternity/Paternity">Maternity/Paternity</option>
                </select>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div className="premium-form-group" style={{ marginBottom: 0 }}>
                  <label className="premium-label" style={{ fontSize: '0.65rem' }}>Start Date</label>
                  <input type="date" required value={editLeaveFrom} onChange={(e) => setEditLeaveFrom(e.target.value)} className="premium-input" />
                </div>
                <div className="premium-form-group" style={{ marginBottom: 0 }}>
                  <label className="premium-label" style={{ fontSize: '0.65rem' }}>End Date</label>
                  <input type="date" required value={editLeaveTo} onChange={(e) => setEditLeaveTo(e.target.value)} className="premium-input" />
                </div>
              </div>
              <div className="premium-form-group" style={{ marginBottom: 0 }}>
                <label className="premium-label" style={{ fontSize: '0.65rem' }}>Total Days</label>
                <input type="number" required value={editLeaveDays} onChange={(e) => setEditLeaveDays(Number(e.target.value))} className="premium-input" />
              </div>
              <div className="premium-form-group" style={{ marginBottom: 0 }}>
                <label className="premium-label" style={{ fontSize: '0.65rem' }}>Reason</label>
                <textarea required value={editLeaveReason} onChange={(e) => setEditLeaveReason(e.target.value)} className="premium-input" style={{ minHeight: 80 }} />
              </div>
              <div className="premium-form-group" style={{ marginBottom: 0 }}>
                <label className="premium-label" style={{ fontSize: '0.65rem' }}>Status</label>
                <select 
                  value={editLeaveStatus} 
                  onChange={(e) => setEditLeaveStatus(e.target.value)} 
                  className="premium-input"
                  style={{ background: 'var(--color-bg-subtle)' }}
                >
                  <option value="Pending">Pending</option>
                  <option value="Approved">Approved</option>
                  <option value="Rejected">Rejected</option>
                </select>
              </div>
              <div style={{ display: 'flex', gap: 12, marginTop: 10 }}>
                <button type="submit" className="premium-btn premium-btn-primary" style={{ flex: 1, height: 42, justifyContent: 'center' }}>Save Changes</button>
                <button type="button" onClick={() => setEditingLeave(null)} className="premium-btn premium-btn-secondary" style={{ flex: 1, height: 42, justifyContent: 'center' }}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
