import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Target, TrendingUp, Award, Star, Settings, FileText, CheckCircle, Heart, Pencil, Trash, X } from 'lucide-react';

const mockGoals = [];

const mockFeedback = [];

import { api } from '../../services/api';
import { useEffect } from 'react';

export default function Performance({ employees, subTab = 'dashboard' }) {
  const [goals, setGoals] = useState(mockGoals);
  const [reviews, setReviews] = useState([]);
  const [selectedEmpId, setSelectedEmpId] = useState(employees[0]?.id || '');
  const [designScore, setDesignScore] = useState(4.2);
  const [deliveryScore, setDeliveryScore] = useState(4.5);
  const [teamworkScore, setTeamworkScore] = useState(4.0);
  const [appreciation, setAppreciation] = useState('');
  const [warningText, setWarningText] = useState('');
  const [promotionRec, setPromotionRec] = useState('');

  // Edit Appraisal States
  const [editingReview, setEditingReview] = useState(null);
  const [editDesignScore, setEditDesignScore] = useState(5.0);
  const [editDeliveryScore, setEditDeliveryScore] = useState(5.0);
  const [editTeamworkScore, setEditTeamworkScore] = useState(5.0);
  const [editAppreciation, setEditAppreciation] = useState('');
  const [editWarning, setEditWarning] = useState('');
  const [editPromotion, setEditPromotion] = useState('');

  const handleDeleteReview = async (id) => {
    if (!window.confirm("Are you sure you want to delete this appraisal review?")) return;
    try {
      await api.deleteAdminPerformance(id);
      alert("Appraisal review deleted successfully!");
      const list = await api.getAdminPerformance();
      setReviews(list);
    } catch (err) {
      alert("Failed to delete review: " + err.message);
    }
  };

  const handleSaveEditReview = async (e) => {
    e.preventDefault();
    if (!editingReview) return;
    try {
      const avg = ((Number(editDesignScore) + Number(editDeliveryScore) + Number(editTeamworkScore)) / 3).toFixed(1);
      await api.updateAdminPerformance(editingReview.id, {
        rating: avg,
        appreciation: editAppreciation,
        warning: editWarning,
        promotionRecommendation: editPromotion,
        kpis: [
          { label: 'Productivity', score: editDesignScore },
          { label: 'Delivery', score: editDeliveryScore },
          { label: 'Teamwork', score: editTeamworkScore }
        ]
      });
      alert("Appraisal review updated successfully!");
      setEditingReview(null);
      const list = await api.getAdminPerformance();
      setReviews(list);
    } catch (err) {
      alert("Failed to update appraisal review: " + err.message);
    }
  };

  useEffect(() => {
    const fetchPerformance = async () => {
      try {
        const list = await api.getAdminPerformance();
        setReviews(list);

        // Extract corporate goals from performance reviews in database
        const corporateGoals = list.flatMap(r => {
          if (Array.isArray(r.goals)) return r.goals;
          if (typeof r.goals === 'string') {
            try { return JSON.parse(r.goals); } catch (e) {}
          }
          return [];
        });
        
        if (corporateGoals.length > 0) {
          setGoals(corporateGoals);
        } else {
          setGoals([
            { id: 1, title: 'Migrate legacy data layers to RDS clusters', target: 'Q3 Target', progress: 85, status: 'On Track' },
            { id: 2, title: 'Achieve SOC2 Type II compliance audit clearance', target: 'Q4 Target', progress: 95, status: 'Exceeding' },
            { id: 3, title: 'Deploy Flutter app build to Play Store', target: 'End of Month', progress: 40, status: 'Behind' }
          ]);
        }
      } catch (err) {
        console.error("Failed to load performance data:", err);
      }
    };
    fetchPerformance();
  }, []);

  const selectedEmp = employees.find(emp => String(emp.id) === String(selectedEmpId)) || employees[0];
  const overallRating = ((Number(designScore) + Number(deliveryScore) + Number(teamworkScore)) / 3).toFixed(1);

  const getPerformanceClass = (rating) => {
    if (rating >= 4.5) return { text: 'Outstanding', color: 'var(--color-success)' };
    if (rating >= 3.8) return { text: 'Exceeds Expectations', color: 'var(--color-primary)' };
    if (rating >= 3.0) return { text: 'Meets Expectations', color: 'var(--color-warning)' };
    return { text: 'Needs Improvement', color: 'var(--color-danger)' };
  };

  const performanceClass = getPerformanceClass(overallRating);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      
      <AnimatePresence mode="wait">
        
        {/* SUB-VIEW 1: Dashboard / Appraisals */}
        {subTab === 'dashboard' && (
          <motion.div
            key="dashboard"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 24 }}
          >
            {/* Goals panel */}
            <div className="premium-card" style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 16 }}>
              <h3 style={{ fontSize: '0.95rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 8 }}>
                <Target size={18} style={{ color: 'var(--color-primary)' }} />
                <span>Strategic Corporate Goals</span>
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {goals.map(goal => (
                  <div key={goal.id}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', marginBottom: 4 }}>
                      <span style={{ fontWeight: 600 }}>{goal.title}</span>
                      <span className="number-font" style={{ color: 'var(--color-text-secondary)' }}>{goal.progress}%</span>
                    </div>
                    <div style={{ width: '100%', height: 6, background: 'var(--color-border)', borderRadius: 3, overflow: 'hidden' }}>
                      <div style={{ width: `${goal.progress}%`, height: '100%', background: 'linear-gradient(90deg, var(--color-primary), var(--color-accent))' }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Appraisal panel */}
            <div className="premium-card" style={{ padding: 24 }}>
              <h3 style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: 18, display: 'flex', alignItems: 'center', gap: 8 }}>
                <Award size={18} style={{ color: 'var(--color-primary)' }} />
                <span>Appraise Employee Performance</span>
              </h3>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                <div className="premium-form-group">
                  <label className="premium-label">Select Employee</label>
                  <select 
                    value={selectedEmpId} 
                    onChange={(e) => setSelectedEmpId(e.target.value)}
                    className="premium-input"
                  >
                    {employees.map(emp => (
                      <option key={emp.id} value={emp.id}>{emp.name}</option>
                    ))}
                  </select>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10 }}>
                  <div className="premium-form-group">
                    <label className="premium-label">Product</label>
                    <input type="number" step="0.1" max="5" value={designScore} onChange={(e) => setDesignScore(e.target.value)} className="premium-input" />
                  </div>
                  <div className="premium-form-group">
                    <label className="premium-label">Delivery</label>
                    <input type="number" step="0.1" max="5" value={deliveryScore} onChange={(e) => setDeliveryScore(e.target.value)} className="premium-input" />
                  </div>
                  <div className="premium-form-group">
                    <label className="premium-label">Teamwork</label>
                    <input type="number" step="0.1" max="5" value={teamworkScore} onChange={(e) => setTeamworkScore(e.target.value)} className="premium-input" />
                  </div>
                </div>

                <div className="premium-form-group">
                  <label className="premium-label">Appreciation & Achievements</label>
                  <input type="text" value={appreciation} onChange={(e) => setAppreciation(e.target.value)} className="premium-input" placeholder="e.g. Great code quality and sprint deliveries" />
                </div>
                <div className="premium-form-group">
                  <label className="premium-label">Area of Improvement</label>
                  <input type="text" value={warningText} onChange={(e) => setWarningText(e.target.value)} className="premium-input" placeholder="e.g. Needs to focus on test coverage" />
                </div>
                <div className="premium-form-group">
                  <label className="premium-label">Promotion Recommendation</label>
                  <input type="text" value={promotionRec} onChange={(e) => setPromotionRec(e.target.value)} className="premium-input" placeholder="e.g. Recommended for Senior Role next cycle" />
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--color-border)', paddingTop: 16 }}>
                  <div>
                    <span className="premium-label" style={{ fontSize: '0.65rem' }}>Rating & Appraisal</span>
                    <p style={{ fontSize: '0.75rem', color: performanceClass.color, fontWeight: 700 }}>{performanceClass.text}</p>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                    <Star size={16} fill="var(--color-warning)" style={{ color: 'var(--color-warning)' }} />
                    <span className="number-font" style={{ fontSize: '1.5rem', fontWeight: 800 }}>{overallRating}</span>
                  </div>
                </div>

                <button 
                  onClick={async () => {
                    if (!selectedEmp) return;
                    try {
                      await api.createAdminPerformance({
                        id: `REV-${Math.floor(1000 + Math.random() * 9000)}`,
                        employeeId: selectedEmp.id,
                        employeeName: selectedEmp.name,
                        managerId: 'Admin',
                        rating: overallRating,
                        reviewPeriod: 'Monthly',
                        appreciation,
                        warning: warningText,
                        promotionRecommendation: promotionRec,
                        kpis: [
                          { label: 'Productivity', score: designScore },
                          { label: 'Delivery', score: deliveryScore },
                          { label: 'Teamwork', score: teamworkScore }
                        ]
                      });
                      alert("Appraisal submitted successfully!");
                      setAppreciation('');
                      setWarningText('');
                      setPromotionRec('');
                      const list = await api.getAdminPerformance();
                      setReviews(list);
                    } catch (err) {
                      alert("Failed to submit appraisal: " + err.message);
                    }
                  }}
                  className="premium-btn premium-btn-primary" 
                  style={{ width: '100%', padding: '12px 24px', justifyContent: 'center' }}
                >
                  Submit Appraisal Rating
                </button>
              </div>
            </div>
          </motion.div>
        )}

        {/* SUB-VIEW 2: Goals */}
        {subTab === 'goals' && (
          <motion.div
            key="goals"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="premium-card"
            style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 20 }}
          >
            <div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 800 }}>Company Strategic Goals</h3>
              <span style={{ fontSize: '0.75rem', color: 'var(--color-text-tertiary)' }}>Strategic company-wide operational goals</span>
            </div>

            <div className="premium-table-container">
              <table className="premium-table">
                <thead>
                  <tr>
                    <th>Goal Description</th>
                    <th>Timeline Target</th>
                    <th>Progress Rate</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {goals.map(g => (
                    <tr key={g.id}>
                      <td style={{ fontWeight: 700 }}>{g.title}</td>
                      <td><span className="badge badge-info">{g.target}</span></td>
                      <td className="number-font" style={{ fontSize: '0.85rem' }}>{g.progress}%</td>
                      <td>
                        <span className={`badge ${g.status === 'Exceeding' ? 'badge-success' : g.status === 'On Track' ? 'badge-primary' : 'badge-danger'}`}>
                          {g.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>
        )}

        {/* SUB-VIEW 3: KPIs Target */}
        {subTab === 'kpis' && (
          <motion.div
            key="kpis"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="premium-card"
            style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 20 }}
          >
            <div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 800 }}>KPIs Target Targets</h3>
              <span style={{ fontSize: '0.75rem', color: 'var(--color-text-tertiary)' }}>Review quantitative indicators</span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div style={{ padding: 16, border: '1px solid var(--color-border)', borderRadius: 12 }}>
                <span className="premium-label" style={{ fontSize: '0.65rem' }}>Customer CSAT Goal</span>
                <div style={{ fontSize: '1.25rem', fontWeight: 800, marginTop: 4 }}>94.2% (Currently: 93.8%)</div>
              </div>
              <div style={{ padding: 16, border: '1px solid var(--color-border)', borderRadius: 12 }}>
                <span className="premium-label" style={{ fontSize: '0.65rem' }}>Sprint Velocity Target</span>
                <div style={{ fontSize: '1.25rem', fontWeight: 800, marginTop: 4 }}>45 Points / Sprint</div>
              </div>
            </div>
          </motion.div>
        )}

        {/* SUB-VIEW 4: Review Cycles */}
        {subTab === 'cycles' && (
          <motion.div
            key="cycles"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="premium-card"
            style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 20 }}
          >
            <div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 800 }}>Performance Review Cycles</h3>
              <span style={{ fontSize: '0.75rem', color: 'var(--color-text-tertiary)' }}>Annual, mid-year, or custom review cycle templates</span>
            </div>

            <div className="premium-table-container">
              <table className="premium-table">
                <thead>
                  <tr>
                    <th>Review Cycle Name</th>
                    <th>Timeline</th>
                    <th>Audit Status</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td style={{ fontWeight: 700 }}>2026 Mid-Year Appraisal</td>
                    <td>June 01 - July 15, 2026</td>
                    <td><span className="badge badge-success">Completed</span></td>
                  </tr>
                  <tr>
                    <td style={{ fontWeight: 700 }}>2026 Annual Performance Review</td>
                    <td>Dec 01 - Dec 31, 2026</td>
                    <td><span className="badge badge-warning">Draft</span></td>
                  </tr>
                </tbody>
              </table>
            </div>
          </motion.div>
        )}

        {/* SUB-VIEW 5: Appraisals */}
        {subTab === 'appraisals' && (
          <motion.div
            key="appraisals"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="premium-card"
            style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 20 }}
          >
            <div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 800 }}>Employee Appraisal Ledger</h3>
              <span style={{ fontSize: '0.75rem', color: 'var(--color-text-tertiary)' }}>Summary ratings of all employees</span>
            </div>

            <div className="premium-table-container">
              <table className="premium-table">
                <thead>
                  <tr>
                    <th>Employee Name</th>
                    <th>Productivity</th>
                    <th>Delivery Speed</th>
                    <th>Teamwork</th>
                    <th>Cumulative Score</th>
                    <th style={{ textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {reviews.map(rev => {
                    const prodKpi = rev.kpis?.find(k => k.label === 'Productivity')?.score || '-';
                    const delKpi = rev.kpis?.find(k => k.label === 'Delivery')?.score || '-';
                    const teamKpi = rev.kpis?.find(k => k.label === 'Teamwork')?.score || '-';
                    return (
                      <tr key={rev.id}>
                        <td style={{ fontWeight: 600 }}>{rev.employeeName}</td>
                        <td className="number-font">{prodKpi}</td>
                        <td className="number-font">{delKpi}</td>
                        <td className="number-font">{teamKpi}</td>
                        <td className="number-font" style={{ fontWeight: 700, color: 'var(--color-primary)' }}>{rev.rating} / 5.0</td>
                        <td style={{ textAlign: 'right' }}>
                          <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
                            <button 
                              onClick={() => {
                                setEditingReview(rev);
                                const p = rev.kpis?.find(k => k.label === 'Productivity')?.score || 5;
                                const d = rev.kpis?.find(k => k.label === 'Delivery')?.score || 5;
                                const t = rev.kpis?.find(k => k.label === 'Teamwork')?.score || 5;
                                setEditDesignScore(p);
                                setEditDeliveryScore(d);
                                setEditTeamworkScore(t);
                                setEditAppreciation(rev.appreciation || '');
                                setEditWarning(rev.warning || '');
                                setEditPromotion(rev.promotionRecommendation || '');
                              }}
                              style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--color-primary)', padding: 4 }}
                              title="Edit Appraisal"
                            >
                              <Pencil size={14} />
                            </button>
                            <button 
                              onClick={() => handleDeleteReview(rev.id)}
                              style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#ef4444', padding: 4 }}
                              title="Delete Appraisal"
                            >
                              <Trash size={14} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                  {reviews.length === 0 && (
                    <tr><td colSpan="6" style={{ textAlign: 'center' }}>No appraisals recorded yet.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </motion.div>
        )}

        {/* SUB-VIEW 6: 360 Feedback */}
        {subTab === 'feedback' && (
          <motion.div
            key="feedback"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="premium-card"
            style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 20 }}
          >
            <div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 800 }}>360 Peer Feedback Logs</h3>
              <span style={{ fontSize: '0.75rem', color: 'var(--color-text-tertiary)' }}>Anonymous or manager-led feedback collections</span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {mockFeedback.map(fb => (
                <div key={fb.id} style={{ padding: 18, border: '1px solid var(--color-border)', borderRadius: 14 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                    <h4 style={{ fontSize: '0.85rem', fontWeight: 700 }}>Feedback for {fb.employee}</h4>
                    <span className="badge badge-info">{fb.type}</span>
                  </div>
                  <p style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)', marginTop: 8, fontStyle: 'italic' }}>
                    "{fb.text}"
                  </p>
                  <div style={{ fontSize: '0.75rem', color: 'var(--color-text-tertiary)', marginTop: 10, textAlign: 'right' }}>
                    Submitted by {fb.reviewer}
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* SUB-VIEW 7: Reports */}
        {subTab === 'reports' && (
          <motion.div
            key="reports"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="premium-card"
            style={{ padding: 32, display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: 20 }}
          >
            <div style={{ width: 56, height: 56, borderRadius: '50%', background: 'var(--color-primary-light)', color: 'var(--color-primary)', display: 'flex', alignItems: 'center', justify: 'center', justifyContent: 'center' }}>
              <FileText size={28} />
            </div>
            <div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: 8 }}>Export Appraisals Summary</h3>
              <p style={{ fontSize: '0.9rem', color: 'var(--color-text-tertiary)', maxWidth: 400, margin: '0 auto' }}>
                Download comprehensive performance indicators, strategic goal reports, and 360 feedback ledgers.
              </p>
            </div>
            <button onClick={() => alert("Downloading performance_summary_report.xlsx")} className="premium-btn premium-btn-primary" style={{ padding: '12px 24px' }}>
              <span>Export Performance Reports</span>
            </button>
          </motion.div>
        )}

      </AnimatePresence>

      {/* Edit Appraisal Modal */}
      {editingReview && (
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
              <h3 style={{ fontSize: '1rem', fontWeight: 800 }}>Edit Appraisal Review</h3>
              <button 
                onClick={() => setEditingReview(null)} 
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text-tertiary)' }}
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveEditReview} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10 }}>
                <div className="premium-form-group" style={{ marginBottom: 0 }}>
                  <label className="premium-label" style={{ fontSize: '0.65rem' }}>Productivity</label>
                  <input type="number" step="0.1" max="5" value={editDesignScore} onChange={(e) => setEditDesignScore(e.target.value)} className="premium-input" />
                </div>
                <div className="premium-form-group" style={{ marginBottom: 0 }}>
                  <label className="premium-label" style={{ fontSize: '0.65rem' }}>Delivery</label>
                  <input type="number" step="0.1" max="5" value={editDeliveryScore} onChange={(e) => setEditDeliveryScore(e.target.value)} className="premium-input" />
                </div>
                <div className="premium-form-group" style={{ marginBottom: 0 }}>
                  <label className="premium-label" style={{ fontSize: '0.65rem' }}>Teamwork</label>
                  <input type="number" step="0.1" max="5" value={editTeamworkScore} onChange={(e) => setEditTeamworkScore(e.target.value)} className="premium-input" />
                </div>
              </div>

              <div className="premium-form-group" style={{ marginBottom: 0 }}>
                <label className="premium-label" style={{ fontSize: '0.65rem' }}>Appreciation & Achievements</label>
                <input type="text" value={editAppreciation} onChange={(e) => setEditAppreciation(e.target.value)} className="premium-input" />
              </div>

              <div className="premium-form-group" style={{ marginBottom: 0 }}>
                <label className="premium-label" style={{ fontSize: '0.65rem' }}>Area of Improvement</label>
                <input type="text" value={editWarning} onChange={(e) => setEditWarning(e.target.value)} className="premium-input" />
              </div>

              <div className="premium-form-group" style={{ marginBottom: 0 }}>
                <label className="premium-label" style={{ fontSize: '0.65rem' }}>Promotion Recommendation</label>
                <input type="text" value={editPromotion} onChange={(e) => setEditPromotion(e.target.value)} className="premium-input" />
              </div>

              <div style={{ display: 'flex', gap: 12, marginTop: 10 }}>
                <button type="submit" className="premium-btn premium-btn-primary" style={{ flex: 1, height: 42, justifyContent: 'center' }}>Save Changes</button>
                <button type="button" onClick={() => setEditingReview(null)} className="premium-btn premium-btn-secondary" style={{ flex: 1, height: 42, justifyContent: 'center' }}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
