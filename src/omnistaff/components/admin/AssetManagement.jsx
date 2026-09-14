import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Laptop, Smartphone, CreditCard, Keyboard, X, Plus, Wrench, ShieldAlert, FileText, CheckCircle } from 'lucide-react';

const initialAssets = [];

const mockRequests = [];

const mockMaintenance = [];

import { api } from '../../services/api';
import { useEffect } from 'react';

export default function AssetManagement({ subTab = 'inventory' }) {
  const [assets, setAssets] = useState([]);
  const [requests, setRequests] = useState(mockRequests);
  const [maintenance, setMaintenance] = useState(mockMaintenance);
  const [typeFilter, setTypeFilter] = useState('All');

  useEffect(() => {
    const fetchAssets = async () => {
      try {
        const list = await api.getAdminAssets();
        const mapped = list.map(a => ({
          id: a.id,
          name: a.assetName || 'Unknown',
          type: a.assetType || 'Accessory',
          user: a.employeeName || 'None',
          date: 'N/A',
          status: a.status || 'Available'
        }));
        setAssets(mapped);

        const reqList = list.filter(a => a.status === 'Requested' || a.status === 'Return Pending').map(a => ({
          id: a.id,
          name: a.employeeName || 'Unknown Staff',
          type: a.assetType || 'Device',
          item: a.assetName,
          reason: a.requestComment || 'Accessory upgrade needed',
          status: a.status === 'Requested' ? 'Pending' : 'Return Pending'
        }));
        setRequests(reqList);
      } catch (err) {
        console.error("Failed to load assets:", err);
      }
    };
    fetchAssets();
    const interval = setInterval(fetchAssets, 5000);
    return () => clearInterval(interval);
  }, []);

  // Allocate form state
  const [selectedAssetId, setSelectedAssetId] = useState(assets[2]?.id || '');
  const [allocateUser, setAllocateUser] = useState('');

  const handleReturn = async (id) => {
    try {
      await api.updateAdminAsset(id, { status: 'Available', assignedTo: 'None', assignedName: '' });
      setAssets(assets.map(ast => 
        ast.id === id ? { ...ast, user: 'None', status: 'Available' } : ast
      ));
    } catch (err) {
      alert("Failed to deallocate asset");
    }
  };

  const handleAllocate = async (e) => {
    e.preventDefault();
    if (!selectedAssetId || !allocateUser) return;
    try {
      await api.updateAdminAsset(selectedAssetId, { status: 'Allocated', assignedTo: allocateUser, assignedName: allocateUser });
      setAssets(assets.map(ast => 
        ast.id === selectedAssetId 
          ? { ...ast, user: allocateUser, status: 'Allocated' }
          : ast
      ));
      setAllocateUser('');
      alert("Asset successfully allocated to employee!");
    } catch (err) {
      alert("Failed to allocate asset");
    }
  };

  const handleApproveRequest = async (id, action) => {
    try {
      const dbStatus = action === 'Approved' ? 'Assigned' : 'Rejected';
      await api.updateAdminAsset(id, { status: dbStatus });
      setRequests(prev => prev.map(req => req.id === id ? { ...req, status: action } : req));
      alert(`Asset request ${action.toLowerCase()} successfully!`);
    } catch (err) {
      alert("Failed to process request: " + err.message);
    }
  };

  const filteredAssets = assets.filter(ast => 
    typeFilter === 'All' || ast.type === typeFilter
  );

  const getIcon = (type) => {
    switch (type) {
      case 'Laptop': return <Laptop size={18} />;
      case 'Mobile Phone': return <Smartphone size={18} />;
      case 'ID Card': return <CreditCard size={18} />;
      default: return <Keyboard size={18} />;
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      
      <AnimatePresence mode="wait">
        
        {/* SUB-VIEW 1: Inventory */}
        {subTab === 'inventory' && (
          <motion.div
            key="inventory"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            style={{ display: 'flex', flexDirection: 'column', gap: 24 }}
          >
            {/* Filter controls */}
            <div className="premium-card" style={{ padding: '20px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <label className="premium-label" style={{ marginBottom: 4 }}>Filter Type</label>
                <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)} className="premium-input" style={{ width: 180 }}>
                  <option value="All">All Hardware Types</option>
                  <option value="Laptop">Laptops</option>
                  <option value="Mobile Phone">Mobile Phones</option>
                  <option value="ID Card">ID Cards</option>
                  <option value="Accessory">Accessories</option>
                </select>
              </div>
            </div>

            {/* Asset Table */}
            <div className="premium-card" style={{ padding: 12 }}>
              <div className="premium-table-container">
                <table className="premium-table">
                  <thead>
                    <tr>
                      <th>Asset ID</th>
                      <th>Asset Name</th>
                      <th>Category</th>
                      <th>Assigned User</th>
                      <th>Date Assigned</th>
                      <th>Status</th>
                      <th style={{ textAlign: 'right' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredAssets.map(ast => (
                      <tr key={ast.id}>
                        <td style={{ fontWeight: 700 }}>{ast.id}</td>
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                            {getIcon(ast.type)}
                            <span style={{ fontWeight: 600 }}>{ast.name}</span>
                          </div>
                        </td>
                        <td><span className="badge badge-info">{ast.type}</span></td>
                        <td style={{ fontWeight: 600 }}>{ast.user}</td>
                        <td className="number-font" style={{ fontSize: '0.8rem' }}>{ast.date}</td>
                        <td>
                          <span className={`badge ${ast.status === 'Allocated' ? 'badge-success' : 'badge-primary'}`}>
                            {ast.status}
                          </span>
                        </td>
                        <td style={{ textAlign: 'right' }}>
                          {ast.status === 'Allocated' && (
                            <button onClick={() => handleReturn(ast.id)} className="premium-btn premium-btn-secondary" style={{ padding: '4px 8px', fontSize: '0.7rem' }}>
                              Deallocate
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </motion.div>
        )}

        {/* SUB-VIEW 2: Allocate Asset */}
        {subTab === 'allocate' && (
          <motion.div
            key="allocate"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="premium-card"
            style={{ padding: 32, display: 'flex', flexDirection: 'column', gap: 24 }}
          >
            <div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 800 }}>Allocate Hardware Resources</h3>
              <span style={{ fontSize: '0.75rem', color: 'var(--color-text-tertiary)' }}>Assign available assets to company employees</span>
            </div>

            <form onSubmit={handleAllocate} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
              <div className="premium-form-group">
                <label className="premium-label">Select Available Asset</label>
                <select value={selectedAssetId} onChange={(e) => setSelectedAssetId(e.target.value)} className="premium-input">
                  {assets.filter(a => a.status === 'Available').map(ast => (
                    <option key={ast.id} value={ast.id}>{ast.name} ({ast.id})</option>
                  ))}
                  {assets.filter(a => a.status === 'Available').length === 0 && (
                    <option value="">No assets currently available</option>
                  )}
                </select>
              </div>

              <div className="premium-form-group">
                <label className="premium-label">Assign To (Employee Name)</label>
                <input 
                  type="text" 
                  required 
                  value={allocateUser} 
                  onChange={(e) => setAllocateUser(e.target.value)} 
                  className="premium-input" 
                  placeholder="e.g. Kenji Sato"
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12 }}>
                <button type="submit" className="premium-btn premium-btn-primary" style={{ padding: '12px 24px' }}>
                  <span>Confirm Allocation</span>
                </button>
              </div>
            </form>
          </motion.div>
        )}

        {/* SUB-VIEW 3: Asset Requests */}
        {subTab === 'requests' && (
          <motion.div
            key="requests"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="premium-card"
            style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 20 }}
          >
            <div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 800 }}>Asset Procurement Requests</h3>
              <span style={{ fontSize: '0.75rem', color: 'var(--color-text-tertiary)' }}>Employee requests for hardware configurations</span>
            </div>

            <div className="premium-table-container">
              <table className="premium-table">
                <thead>
                  <tr>
                    <th>Requester</th>
                    <th>Asset Type</th>
                    <th>Specifications</th>
                    <th>Reason</th>
                    <th>Status</th>
                    <th style={{ textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {requests.map(req => (
                    <tr key={req.id}>
                      <td style={{ fontWeight: 600 }}>{req.name}</td>
                      <td><span className="badge badge-info">{req.type}</span></td>
                      <td style={{ fontWeight: 600 }}>{req.item}</td>
                      <td style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)' }}>{req.reason}</td>
                      <td>
                        <span className={`badge ${req.status === 'Approved' ? 'badge-success' : req.status === 'Pending' ? 'badge-warning' : 'badge-danger'}`}>
                          {req.status}
                        </span>
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        {req.status === 'Pending' && (
                          <div style={{ display: 'inline-flex', gap: 8 }}>
                            <button onClick={() => handleApproveRequest(req.id, 'Approved')} className="premium-btn premium-btn-primary" style={{ padding: '4px 8px', fontSize: '0.7rem' }}>Approve</button>
                            <button onClick={() => handleApproveRequest(req.id, 'Rejected')} className="premium-btn premium-btn-secondary" style={{ padding: '4px 8px', fontSize: '0.7rem', color: 'var(--color-danger)' }}>Reject</button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>
        )}

        {/* SUB-VIEW 4: Maintenance */}
        {subTab === 'maintenance' && (
          <motion.div
            key="maintenance"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="premium-card"
            style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 20 }}
          >
            <div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 800 }}>Maintenance & Repair Logs</h3>
              <span style={{ fontSize: '0.75rem', color: 'var(--color-text-tertiary)' }}>Hardware diagnostics, fixes, and replacement costs</span>
            </div>

            <div className="premium-table-container">
              <table className="premium-table">
                <thead>
                  <tr>
                    <th>Repair Ticket</th>
                    <th>Asset Ref</th>
                    <th>Reported Issue</th>
                    <th>Maintenance Cost</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {maintenance.map(mnt => (
                    <tr key={mnt.id}>
                      <td style={{ fontWeight: 700 }}>{mnt.id}</td>
                      <td style={{ fontWeight: 600 }}>{mnt.asset}</td>
                      <td style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)' }}>{mnt.issue}</td>
                      <td className="number-font" style={{ fontSize: '0.8rem', fontWeight: 700 }}>{mnt.cost}</td>
                      <td>
                        <span className={`badge ${mnt.status === 'Resolved' ? 'badge-success' : 'badge-warning'}`}>
                          {mnt.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>
        )}

        {/* SUB-VIEW 5: Reports */}
        {subTab === 'reports' && (
          <motion.div
            key="reports"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="premium-card"
            style={{ padding: 32, display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: 20 }}
          >
            <div style={{ width: 56, height: 56, borderRadius: '50%', background: 'var(--color-primary-light)', color: 'var(--color-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <FileText size={28} />
            </div>
            <div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: 8 }}>Export Assets Ledger</h3>
              <p style={{ fontSize: '0.9rem', color: 'var(--color-text-tertiary)', maxWidth: 400, margin: '0 auto' }}>
                Download inventories, hardware depreciations, allocation logs, and diagnostic sheets.
              </p>
            </div>
            <button onClick={() => alert("Downloading company_hardware_depreciation.xlsx")} className="premium-btn premium-btn-primary" style={{ padding: '12px 24px' }}>
              <span>Download Assets Spreadsheet</span>
            </button>
          </motion.div>
        )}

        {/* SUB-VIEW 6: Settings */}
        {subTab === 'settings' && (
          <motion.div
            key="settings"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="premium-card"
            style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 20 }}
          >
            <div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 800 }}>Asset Classifications</h3>
              <span style={{ fontSize: '0.75rem', color: 'var(--color-text-tertiary)' }}>Adjust device depreciation formulas and tags</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div style={{ padding: 16, border: '1px solid var(--color-border)', borderRadius: 12 }}>
                <span className="premium-label" style={{ fontSize: '0.65rem' }}>Asset Tag prefix</span>
                <div style={{ fontSize: '0.95rem', fontWeight: 800, marginTop: 4 }}>AST-[ID]</div>
              </div>
            </div>
          </motion.div>
        )}

      </AnimatePresence>

    </div>
  );
}
