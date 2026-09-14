import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { CreditCard, Plus, FileText, CheckCircle, XCircle, Search, PieChart } from 'lucide-react';



import { api } from '../../services/api';
import { useEffect } from 'react';

export default function Expenses({ subTab = 'dashboard', currency = 'USD' }) {
  const currencySymbols = {
    USD: '$',
    INR: '₹',
    EUR: '€',
    GBP: '£'
  };
  const cSymbol = currencySymbols[currency] || '$';

  const [expenseList, setExpenseList] = useState([]);
  const [showCreateForm, setShowCreateForm] = useState(false);

  // Load from DB
  useEffect(() => {
    const fetchExpenses = async () => {
      try {
        const list = await api.getAdminExpenses();
        const mapped = list.map(exp => ({
          id: exp.id,
          employee: exp.employeeName,
          amount: `${cSymbol}${exp.amount.toFixed(2)}`,
          category: exp.category,
          merchant: 'Corporate Expense',
          date: exp.date,
          status: exp.status
        }));
        setExpenseList(mapped);
      } catch (err) {
        console.error(err);
      }
    };
    fetchExpenses();
  }, []);

  // Form states
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('Travel & Meals');
  const [merchant, setMerchant] = useState('');

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!amount || !merchant) return;
    try {
      const parsedAmount = parseFloat(amount);
      const result = await api.createExpenseClaim({
        date: new Date().toISOString().split('T')[0],
        category,
        amount: parsedAmount,
        reason: `Commercial log at ${merchant}`
      });

      const newExp = {
        id: result.id,
        employee: result.employeeName,
        amount: `${cSymbol}${result.amount.toFixed(2)}`,
        category: result.category,
        merchant: merchant,
        date: result.date,
        status: result.status
      };

      setExpenseList([newExp, ...expenseList]);
      setAmount('');
      setMerchant('');
      setShowCreateForm(false);
    } catch (err) {
      alert(err.message || 'Creation failed');
    }
  };

  const handleApprove = async (id, status) => {
    try {
      await api.updateAdminExpense(id, status);
      setExpenseList(expenseList.map(exp => exp.id === id ? { ...exp, status } : exp));
    } catch (err) {
      alert(err.message || 'Action failed');
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* Header section */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 800, textTransform: 'capitalize' }}>Expense Management - {subTab}</h2>
          <span style={{ fontSize: '0.75rem', color: 'var(--color-text-tertiary)' }}>Reimbursement requests, commercial billing cards, and audits</span>
        </div>
        <button 
          onClick={() => setShowCreateForm(!showCreateForm)} 
          className="premium-btn premium-btn-primary"
          style={{ padding: '8px 16px' }}
        >
          <Plus size={16} />
          <span>New Expense</span>
        </button>
      </div>

      {/* New expense form */}
      {showCreateForm && (
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="premium-card" 
          style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 16 }}
        >
          <h3 style={{ fontSize: '0.95rem', fontWeight: 700 }}>Log Commercial Transaction</h3>
          <form onSubmit={handleCreate} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16, alignItems: 'end' }}>
            <div className="premium-form-group" style={{ marginBottom: 0 }}>
              <label className="premium-label">Merchant Name</label>
              <input 
                type="text" 
                required 
                value={merchant} 
                onChange={(e) => setMerchant(e.target.value)} 
                className="premium-input" 
                placeholder="e.g. Uber, AWS"
              />
            </div>
            <div className="premium-form-group" style={{ marginBottom: 0 }}>
              <label className="premium-label">Category</label>
              <select value={category} onChange={(e) => setCategory(e.target.value)} className="premium-input">
                <option value="Travel & Meals">Travel & Meals</option>
                <option value="Software Subs">Software Subs</option>
                <option value="Office Supplies">Office Supplies</option>
                <option value="Client Meeting">Client Meeting</option>
              </select>
            </div>
            <div className="premium-form-group" style={{ marginBottom: 0 }}>
              <label className="premium-label">Amount ({currency})</label>
              <input 
                type="number" 
                required
                value={amount} 
                onChange={(e) => setAmount(e.target.value)} 
                className="premium-input" 
                placeholder="0.00"
              />
            </div>
            <div style={{ display: 'flex', gap: 10 }}>
              <button type="submit" className="premium-btn premium-btn-primary" style={{ flex: 1, height: 42, justifyContent: 'center' }}>
                Submit Claim
              </button>
              <button type="button" onClick={() => setShowCreateForm(false)} className="premium-btn premium-btn-secondary" style={{ flex: 1, height: 42, justifyContent: 'center' }}>
                Cancel
              </button>
            </div>
          </form>
        </motion.div>
      )}

      {/* Main content table list */}
      <div className="premium-card" style={{ padding: 12 }}>
        <div className="premium-table-container">
          <table className="premium-table">
            <thead>
              <tr>
                <th>Employee</th>
                <th>Category</th>
                <th>Merchant</th>
                <th>Date</th>
                <th>Amount</th>
                <th>Status</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {expenseList.map((exp) => (
                <tr key={exp.id}>
                  <td style={{ fontWeight: 600, fontSize: '0.85rem' }}>{exp.employee}</td>
                  <td>
                    <span className="badge badge-info">{exp.category}</span>
                  </td>
                  <td style={{ fontSize: '0.8rem', fontWeight: 600 }}>{exp.merchant}</td>
                  <td style={{ fontSize: '0.75rem', color: 'var(--color-text-tertiary)' }}>{exp.date}</td>
                  <td className="number-font" style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--color-primary)' }}>{exp.amount}</td>
                  <td>
                    <span className={`badge ${exp.status === 'Approved' ? 'badge-success' : exp.status === 'Pending' ? 'badge-warning' : 'badge-danger'}`}>
                      {exp.status}
                    </span>
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    {exp.status === 'Pending' && (
                      <div style={{ display: 'inline-flex', gap: 8 }}>
                        <button 
                          onClick={() => handleApprove(exp.id, 'Approved')}
                          style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--color-success)', padding: 4 }}
                        >
                          <CheckCircle size={16} />
                        </button>
                        <button 
                          onClick={() => handleApprove(exp.id, 'Rejected')}
                          style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--color-danger)', padding: 4 }}
                        >
                          <XCircle size={16} />
                        </button>
                      </div>
                    )}
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
