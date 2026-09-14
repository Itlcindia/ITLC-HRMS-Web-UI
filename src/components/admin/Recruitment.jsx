import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Briefcase, UserCheck, Calendar, ArrowRight, UserPlus, FileText, Plus, Star, Edit2, Trash2, X, Clock } from 'lucide-react';
import { api } from '../../services/api';

export default function Recruitment({ subTab = 'dashboard' }) {
  const [openings, setOpenings] = useState([]);
  const [candidates, setCandidates] = useState([]);
  const [interviews, setInterviews] = useState([]);
  const [loading, setLoading] = useState(false);

  const [showAddOpening, setShowAddOpening] = useState(false);
  const [showAddCandidate, setShowAddCandidate] = useState(false);
  const [showScheduleModal, setShowScheduleModal] = useState(false);

  // Form states for Add Job
  const [newTitle, setNewTitle] = useState('');
  const [newDept, setNewDept] = useState('Engineering');
  const [newType, setNewType] = useState('Full-time');
  const [newLocation, setNewLocation] = useState('Remote');
  const [newVacancies, setNewVacancies] = useState(1);

  // States for Edit Job Mode
  const [editingJob, setEditingJob] = useState(null);
  const [editTitle, setEditTitle] = useState('');
  const [editDept, setEditDept] = useState('Engineering');
  const [editType, setEditType] = useState('Full-time');
  const [editLocation, setEditLocation] = useState('Remote');
  const [editVacancies, setEditVacancies] = useState(1);
  const [editStatus, setEditStatus] = useState('Active');

  // Form states for Add Candidate
  const [newCandName, setNewCandName] = useState('');
  const [newCandEmail, setNewCandEmail] = useState('');
  const [newCandPhone, setNewCandPhone] = useState('');
  const [newCandJobId, setNewCandJobId] = useState('');
  const [newCandRating, setNewCandRating] = useState(4.0);
  const [newCandStage, setNewCandStage] = useState('Applied');

  // Form states for Schedule Interview
  const [selectedCandId, setSelectedCandId] = useState('');
  const [interviewerName, setInterviewerName] = useState('');
  const [interviewDate, setInterviewDate] = useState('');
  const [interviewTime, setInterviewTime] = useState('');
  const [interviewType, setInterviewType] = useState('Technical');

  const fetchData = async () => {
    setLoading(true);
    try {
      const jobs = await api.getAdminJobs();
      setOpenings(jobs || []);
      
      const cands = await api.getAdminCandidates();
      setCandidates(cands || []);
      
      const invs = await api.getAdminInterviews();
      setInterviews(invs || []);
      
      if (jobs.length > 0 && !newCandJobId) {
        setNewCandJobId(jobs[0].id);
      }
    } catch (err) {
      console.error("Failed to load recruitment data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleAddJob = async (e) => {
    e.preventDefault();
    if (!newTitle) return;
    try {
      await api.createAdminJob({
        title: newTitle,
        department: newDept,
        type: newType,
        location: newLocation,
        vacancies: Number(newVacancies),
        status: 'Active'
      });
      alert("Job posting created successfully!");
      setNewTitle('');
      setNewLocation('Remote');
      setNewVacancies(1);
      setShowAddOpening(false);
      fetchData();
    } catch (err) {
      alert("Failed to create job opening");
    }
  };

  const handleDeleteJob = async (id) => {
    if (!window.confirm("Are you sure you want to delete this job posting?")) return;
    try {
      await api.deleteAdminJob(id);
      alert("Job posting deleted!");
      fetchData();
    } catch (err) {
      alert("Failed to delete job opening");
    }
  };

  const handleEditJobSelect = (job) => {
    setEditingJob(job);
    setEditTitle(job.title || '');
    setEditDept(job.department || 'Engineering');
    setEditType(job.type || 'Full-time');
    setEditLocation(job.location || 'Remote');
    setEditVacancies(job.vacancies || 1);
    setEditStatus(job.status || 'Active');
  };

  const handleUpdateJob = async (e) => {
    e.preventDefault();
    if (!editingJob) return;
    try {
      await api.updateAdminJob(editingJob.id, {
        title: editTitle,
        department: editDept,
        type: editType,
        location: editLocation,
        vacancies: Number(editVacancies),
        status: editStatus
      });
      alert("Job posting updated!");
      setEditingJob(null);
      fetchData();
    } catch (err) {
      alert("Failed to update job opening");
    }
  };

  const handleAddCandidate = async (e) => {
    e.preventDefault();
    if (!newCandName.trim() || !newCandEmail.trim() || !newCandJobId) return;

    const matchedJob = openings.find(j => j.id === newCandJobId);
    const jobTitleName = matchedJob ? matchedJob.title : 'General Role';

    try {
      await api.createAdminCandidate({
        name: newCandName,
        email: newCandEmail,
        phone: newCandPhone,
        jobOpeningId: newCandJobId,
        jobTitle: jobTitleName,
        rating: Number(newCandRating),
        stage: newCandStage
      });
      alert("Candidate profile registered successfully!");
      setShowAddCandidate(false);
      setNewCandName('');
      setNewCandEmail('');
      setNewCandPhone('');
      fetchData();
    } catch (err) {
      alert("Failed to create candidate: " + err.message);
    }
  };

  const moveCandidate = async (id, nextStage) => {
    try {
      await api.updateAdminCandidate(id, { stage: nextStage });
      alert(`Candidate stage advanced to ${nextStage}!`);
      fetchData();
    } catch (err) {
      alert("Failed to advance candidate stage: " + err.message);
    }
  };

  const handleDeleteCandidate = async (id) => {
    if (!window.confirm("Are you sure you want to delete this applicant profile?")) return;
    try {
      await api.deleteAdminCandidate(id);
      alert("Candidate profile deleted!");
      fetchData();
    } catch (err) {
      alert("Failed to delete candidate: " + err.message);
    }
  };

  const handleScheduleInterview = async (e) => {
    e.preventDefault();
    if (!selectedCandId || !interviewerName.trim() || !interviewDate) return;

    const matchedCand = candidates.find(c => c.id === selectedCandId);
    if (!matchedCand) return;

    try {
      await api.createAdminInterview({
        candidateId: matchedCand.id,
        candidateName: matchedCand.name,
        jobTitle: matchedCand.jobTitle,
        interviewerName,
        date: interviewDate,
        time: interviewTime,
        type: interviewType
      });

      // Also advance candidate to Interview stage automatically
      await api.updateAdminCandidate(matchedCand.id, { stage: 'Interview' });

      alert("Interview session scheduled successfully!");
      setShowScheduleModal(false);
      setInterviewerName('');
      setInterviewDate('');
      setInterviewTime('');
      fetchData();
    } catch (err) {
      alert("Failed to schedule interview: " + err.message);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      
      <AnimatePresence mode="wait">
        
        {/* SUB-VIEW 1: Dashboard / Job Openings */}
        {subTab === 'dashboard' && (
          <motion.div
            key="dashboard"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            style={{ display: 'flex', flexDirection: 'column', gap: 24 }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ fontSize: '0.95rem', fontWeight: 700 }}>Active Job Postings</h3>
              <button onClick={() => setShowAddOpening(!showAddOpening)} className="premium-btn premium-btn-primary" style={{ padding: '6px 12px' }}>
                <Plus size={14} />
                <span>New Job</span>
              </button>
            </div>

            {showAddOpening && (
              <motion.div 
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="premium-card" 
                style={{ padding: 24, border: '1px solid var(--color-border)', borderRadius: '16px' }}
              >
                <h4 style={{ fontSize: '0.95rem', fontWeight: 800, marginBottom: 14 }}>Create Job Posting</h4>
                <form onSubmit={handleAddJob} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16, alignItems: 'end' }}>
                  <div className="premium-form-group" style={{ marginBottom: 0 }}>
                    <label className="premium-label">Role Title</label>
                    <input 
                      type="text" 
                      required 
                      value={newTitle} 
                      onChange={(e) => setNewTitle(e.target.value)} 
                      className="premium-input" 
                      placeholder="e.g. Lead Designer"
                    />
                  </div>
                  <div className="premium-form-group" style={{ marginBottom: 0 }}>
                    <label className="premium-label">Department</label>
                    <select value={newDept} onChange={(e) => setNewDept(e.target.value)} className="premium-input">
                      <option value="Engineering">Engineering</option>
                      <option value="Design">Design</option>
                      <option value="Marketing">Marketing</option>
                      <option value="Sales">Sales</option>
                      <option value="HR">HR</option>
                    </select>
                  </div>
                  <div className="premium-form-group" style={{ marginBottom: 0 }}>
                    <label className="premium-label">Job Type</label>
                    <select value={newType} onChange={(e) => setNewType(e.target.value)} className="premium-input">
                      <option value="Full-time">Full-time</option>
                      <option value="Part-time">Part-time</option>
                      <option value="Contract">Contract</option>
                      <option value="Internship">Internship</option>
                    </select>
                  </div>
                  <div className="premium-form-group" style={{ marginBottom: 0 }}>
                    <label className="premium-label">Location</label>
                    <input 
                      type="text" 
                      required 
                      value={newLocation} 
                      onChange={(e) => setNewLocation(e.target.value)} 
                      className="premium-input" 
                    />
                  </div>
                  <div className="premium-form-group" style={{ marginBottom: 0 }}>
                    <label className="premium-label">Vacancies</label>
                    <input 
                      type="number" 
                      required 
                      min="1" 
                      value={newVacancies} 
                      onChange={(e) => setNewVacancies(e.target.value)} 
                      className="premium-input" 
                    />
                  </div>
                  <div style={{ display: 'flex', gap: 10 }}>
                    <button type="submit" className="premium-btn premium-btn-primary" style={{ flex: 1, height: 42, justifyContent: 'center' }}>Save</button>
                    <button type="button" onClick={() => setShowAddOpening(false)} className="premium-btn premium-btn-secondary" style={{ flex: 1, height: 42, justifyContent: 'center' }}>Cancel</button>
                  </div>
                </form>
              </motion.div>
            )}

            {editingJob && (
              <motion.div 
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="premium-card" 
                style={{ padding: 24, border: '1px solid var(--color-primary-glow)', borderRadius: '16px' }}
              >
                <h4 style={{ fontSize: '0.95rem', fontWeight: 800, marginBottom: 14, color: 'var(--color-primary)' }}>Edit Job Posting</h4>
                <form onSubmit={handleUpdateJob} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16, alignItems: 'end' }}>
                  <div className="premium-form-group" style={{ marginBottom: 0 }}>
                    <label className="premium-label">Role Title</label>
                    <input 
                      type="text" 
                      required 
                      value={editTitle} 
                      onChange={(e) => setEditTitle(e.target.value)} 
                      className="premium-input" 
                    />
                  </div>
                  <div className="premium-form-group" style={{ marginBottom: 0 }}>
                    <label className="premium-label">Department</label>
                    <select value={editDept} onChange={(e) => setEditDept(e.target.value)} className="premium-input">
                      <option value="Engineering">Engineering</option>
                      <option value="Design">Design</option>
                      <option value="Marketing">Marketing</option>
                      <option value="Sales">Sales</option>
                      <option value="HR">HR</option>
                    </select>
                  </div>
                  <div className="premium-form-group" style={{ marginBottom: 0 }}>
                    <label className="premium-label">Job Type</label>
                    <select value={editType} onChange={(e) => setEditType(e.target.value)} className="premium-input">
                      <option value="Full-time">Full-time</option>
                      <option value="Part-time">Part-time</option>
                      <option value="Contract">Contract</option>
                      <option value="Internship">Internship</option>
                    </select>
                  </div>
                  <div className="premium-form-group" style={{ marginBottom: 0 }}>
                    <label className="premium-label">Location</label>
                    <input 
                      type="text" 
                      required 
                      value={editLocation} 
                      onChange={(e) => setEditLocation(e.target.value)} 
                      className="premium-input" 
                    />
                  </div>
                  <div className="premium-form-group" style={{ marginBottom: 0 }}>
                    <label className="premium-label">Vacancies</label>
                    <input 
                      type="number" 
                      required 
                      min="1" 
                      value={editVacancies} 
                      onChange={(e) => setEditVacancies(e.target.value)} 
                      className="premium-input" 
                    />
                  </div>
                  <div className="premium-form-group" style={{ marginBottom: 0 }}>
                    <label className="premium-label">Status</label>
                    <select value={editStatus} onChange={(e) => setEditStatus(e.target.value)} className="premium-input">
                      <option value="Active">Active</option>
                      <option value="Closed">Closed</option>
                      <option value="Draft">Draft</option>
                    </select>
                  </div>
                  <div style={{ display: 'flex', gap: 10 }}>
                    <button type="submit" className="premium-btn premium-btn-primary" style={{ flex: 1, height: 42, justifyContent: 'center' }}>Update</button>
                    <button type="button" onClick={() => setEditingJob(null)} className="premium-btn premium-btn-secondary" style={{ flex: 1, height: 42, justifyContent: 'center' }}>Cancel</button>
                  </div>
                </form>
              </motion.div>
            )}

            {loading ? (
              <div style={{ padding: 24, textAlign: 'center', color: 'var(--color-text-tertiary)' }}>Loading jobs data...</div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 20 }}>
                {openings.map((job) => {
                  const activeCandsCount = candidates.filter(c => c.jobOpeningId === job.id).length;
                  return (
                    <div key={job.id} className="premium-card" style={{ padding: 20, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: 12 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <div>
                          <h4 style={{ fontSize: '0.9rem', fontWeight: 700 }}>{job.title}</h4>
                          <span style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)' }}>{job.department} • {job.type} • {job.location || 'Remote'}</span>
                        </div>
                        <span className={`badge ${job.status === 'Active' ? 'badge-success' : 'badge-primary'}`}>{job.status}</span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--color-border)', paddingTop: 12 }}>
                        <span style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)' }}>
                          Candidates: <strong className="number-font" style={{ color: 'var(--color-text-primary)' }}>{activeCandsCount}</strong>
                        </span>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <button onClick={() => handleEditJobSelect(job)} style={{ border: 'none', background: 'transparent', cursor: 'pointer', color: 'var(--color-text-secondary)', display: 'flex', alignItems: 'center', gap: 4, fontSize: '0.75rem', fontWeight: 600 }}>
                            <Edit2 size={12} />
                            <span>Edit</span>
                          </button>
                          <button onClick={() => handleDeleteJob(job.id)} style={{ border: 'none', background: 'transparent', cursor: 'pointer', color: '#ef4444', display: 'flex', alignItems: 'center', gap: 4, fontSize: '0.75rem', fontWeight: 600 }}>
                            <Trash2 size={12} />
                            <span>Delete</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </motion.div>
        )}

        {/* SUB-VIEW 2: Candidates */}
        {subTab === 'candidates' && (
          <motion.div
            key="candidates"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="premium-card"
            style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 20 }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 800 }}>Applicant Pipeline</h3>
                <span style={{ fontSize: '0.75rem', color: 'var(--color-text-tertiary)' }}>Live evaluation stages</span>
              </div>
              <button onClick={() => setShowAddCandidate(true)} className="premium-btn premium-btn-primary" style={{ padding: '6px 12px' }}>
                <Plus size={14} />
                <span>Onboard Candidate</span>
              </button>
            </div>

            <div className="premium-table-container">
              <table className="premium-table">
                <thead>
                  <tr>
                    <th>Candidate</th>
                    <th>Target Role</th>
                    <th>Evaluation Rating</th>
                    <th>Current Stage</th>
                    <th style={{ textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {candidates.map(cand => (
                    <tr key={cand.id}>
                      <td>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                          <span style={{ fontWeight: 600, color: 'var(--color-text-primary)' }}>{cand.name}</span>
                          <span style={{ fontSize: '0.7rem', color: 'var(--color-text-secondary)' }}>{cand.email}</span>
                        </div>
                      </td>
                      <td style={{ fontSize: '0.8rem', fontWeight: 600 }}>{cand.jobTitle}</td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 4, color: 'var(--color-warning)', fontSize: '0.8rem', fontWeight: 700 }}>
                          <Star size={14} fill="var(--color-warning)" />
                          <span>{cand.rating}</span>
                        </div>
                      </td>
                      <td>
                        <span className={`badge ${cand.stage === 'Hired' ? 'badge-success' : cand.stage === 'Interview' ? 'badge-warning' : cand.stage === 'Rejected' ? 'badge-danger' : 'badge-primary'}`}>
                          {cand.stage}
                        </span>
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
                          {cand.stage === 'Applied' && (
                            <button onClick={() => moveCandidate(cand.id, 'Screening')} className="premium-btn" style={{ padding: '4px 8px', fontSize: '0.7rem' }}>
                              Screen
                            </button>
                          )}
                          {cand.stage === 'Screening' && (
                            <button onClick={() => moveCandidate(cand.id, 'Interview')} className="premium-btn" style={{ padding: '4px 8px', fontSize: '0.7rem' }}>
                              Interview
                            </button>
                          )}
                          {cand.stage === 'Interview' && (
                            <button onClick={() => moveCandidate(cand.id, 'Offered')} className="premium-btn" style={{ padding: '4px 8px', fontSize: '0.7rem' }}>
                              Offer
                            </button>
                          )}
                          {cand.stage === 'Offered' && (
                            <button onClick={() => moveCandidate(cand.id, 'Hired')} className="premium-btn" style={{ padding: '4px 8px', fontSize: '0.7rem', borderColor: '#10b981', color: '#10b981' }}>
                              Hire
                            </button>
                          )}
                          {cand.stage !== 'Hired' && cand.stage !== 'Rejected' && (
                            <button onClick={() => moveCandidate(cand.id, 'Rejected')} className="premium-btn" style={{ padding: '4px 8px', fontSize: '0.7rem', borderColor: '#ef4444', color: '#ef4444' }}>
                              Reject
                            </button>
                          )}
                          <button onClick={() => handleDeleteCandidate(cand.id)} style={{ border: 'none', background: 'transparent', cursor: 'pointer', color: '#ef4444', padding: 4 }} title="Delete Candidate">
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {candidates.length === 0 && (
                    <tr><td colSpan="5" style={{ textAlign: 'center' }}>No candidates enrolled in evaluation process.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </motion.div>
        )}

        {/* SUB-VIEW 3: Interview Scheduler */}
        {subTab === 'interview' && (
          <motion.div
            key="interview"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="premium-card"
            style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 20 }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 800 }}>Interview Calendars</h3>
                <span style={{ fontSize: '0.75rem', color: 'var(--color-text-tertiary)' }}>Send invites and schedule technical sessions</span>
              </div>
              <button onClick={() => setShowScheduleModal(true)} className="premium-btn premium-btn-primary" style={{ padding: '6px 12px' }}>
                <Calendar size={14} />
                <span>Schedule Interview</span>
              </button>
            </div>

            <div className="premium-table-container">
              <table className="premium-table">
                <thead>
                  <tr>
                    <th>Candidate</th>
                    <th>Target Role</th>
                    <th>Interviewer</th>
                    <th>Schedule Date & Time</th>
                    <th>Round Type</th>
                    <th>Status</th>
                    <th style={{ textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {interviews.map(inv => (
                    <tr key={inv.id}>
                      <td style={{ fontWeight: 600 }}>{inv.candidateName}</td>
                      <td>{inv.jobTitle}</td>
                      <td>{inv.interviewerName}</td>
                      <td className="number-font">{inv.date} @ {inv.time}</td>
                      <td>{inv.type}</td>
                      <td>
                        <span className={`badge ${inv.status === 'Completed' ? 'badge-success' : inv.status === 'Cancelled' ? 'badge-danger' : 'badge-warning'}`}>
                          {inv.status}
                        </span>
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
                          {inv.status === 'Scheduled' && (
                            <>
                              <button 
                                onClick={async () => {
                                  try {
                                    await api.updateAdminInterview(inv.id, { status: 'Completed' });
                                    alert("Interview status marked completed!");
                                    fetchData();
                                  } catch (e) { alert(e.message); }
                                }}
                                className="premium-btn" 
                                style={{ padding: '4px 8px', fontSize: '0.7rem', borderColor: '#10B981', color: '#10B981', background: '#ECFDF5' }}
                              >
                                Complete
                              </button>
                              <button 
                                onClick={async () => {
                                  try {
                                    await api.updateAdminInterview(inv.id, { status: 'Cancelled' });
                                    alert("Interview session cancelled!");
                                    fetchData();
                                  } catch (e) { alert(e.message); }
                                }}
                                className="premium-btn" 
                                style={{ padding: '4px 8px', fontSize: '0.7rem', borderColor: '#ef4444', color: '#ef4444', background: '#FFEBEB' }}
                              >
                                Cancel
                              </button>
                            </>
                          )}
                          <button 
                            onClick={async () => {
                              if (!window.confirm("Remove this interview entry permanently?")) return;
                              try {
                                await api.deleteAdminInterview(inv.id);
                                alert("Interview log deleted!");
                                fetchData();
                              } catch (e) { alert(e.message); }
                            }}
                            style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#ef4444', padding: 4 }}
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {interviews.length === 0 && (
                    <tr><td colSpan="7" style={{ textAlign: 'center' }}>No scheduled interviews found.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </motion.div>
        )}

        {/* SUB-VIEW 4: Offer Letters */}
        {subTab === 'offers' && (
          <motion.div
            key="offers"
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
              <h3 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: 8 }}>Offer Generation Center</h3>
              <p style={{ fontSize: '0.9rem', color: 'var(--color-text-tertiary)', maxWidth: 420, margin: '0 auto', lineHeight: 1.5 }}>
                Compile legally compliant job offers, compensation sheets, NDAs, and onboarding contracts automatically.
              </p>
            </div>
            <button onClick={() => alert("Offer template compiled and ready for PDF generation!")} className="premium-btn premium-btn-primary" style={{ padding: '10px 20px' }}>
              <span>Generate Offer PDF</span>
            </button>
          </motion.div>
        )}

        {/* SUB-VIEW 5: Onboarding Wizard */}
        {subTab === 'onboarding' && (
          <motion.div
            key="onboarding"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="premium-card"
            style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 20 }}
          >
            <div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 800 }}>Onboarding Checklist</h3>
              <span style={{ fontSize: '0.75rem', color: 'var(--color-text-tertiary)' }}>Assign credentials and resources for new hires</span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: 12, border: '1px solid var(--color-border)', borderRadius: 12 }}>
                <input type="checkbox" defaultChecked />
                <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>Create GSuite corporate email and Slack login</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: 12, border: '1px solid var(--color-border)', borderRadius: 12 }}>
                <input type="checkbox" defaultChecked />
                <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>Ship hardware asset (MacBook Pro / accessories)</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: 12, border: '1px solid var(--color-border)', borderRadius: 12 }}>
                <input type="checkbox" />
                <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>Schedule team alignment call & assign mentor</span>
              </div>
            </div>
          </motion.div>
        )}

      </AnimatePresence>

      {/* Onboard Candidate Modal */}
      {showAddCandidate && (
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
          <div className="premium-card" style={{ padding: 24, width: 440, background: 'var(--color-bg)', display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ fontSize: '1rem', fontWeight: 800 }}>Onboard New Candidate Profile</h3>
              <button 
                onClick={() => setShowAddCandidate(false)} 
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text-tertiary)' }}
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleAddCandidate} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div className="premium-form-group" style={{ marginBottom: 0 }}>
                <label className="premium-label" style={{ fontSize: '0.65rem' }}>Full Name</label>
                <input 
                  type="text" 
                  required 
                  placeholder="e.g. John Doe" 
                  value={newCandName} 
                  onChange={(e) => setNewCandName(e.target.value)} 
                  className="premium-input" 
                />
              </div>

              <div className="premium-form-group" style={{ marginBottom: 0 }}>
                <label className="premium-label" style={{ fontSize: '0.65rem' }}>Email Address</label>
                <input 
                  type="email" 
                  required 
                  placeholder="e.g. john.doe@gmail.com" 
                  value={newCandEmail} 
                  onChange={(e) => setNewCandEmail(e.target.value)} 
                  className="premium-input" 
                />
              </div>

              <div className="premium-form-group" style={{ marginBottom: 0 }}>
                <label className="premium-label" style={{ fontSize: '0.65rem' }}>Mobile Number</label>
                <input 
                  type="text" 
                  placeholder="e.g. +91 9876543210" 
                  value={newCandPhone} 
                  onChange={(e) => setNewCandPhone(e.target.value)} 
                  className="premium-input" 
                />
              </div>

              <div className="premium-form-group" style={{ marginBottom: 0 }}>
                <label className="premium-label" style={{ fontSize: '0.65rem' }}>Target Job Opening</label>
                <select 
                  value={newCandJobId} 
                  onChange={(e) => setNewCandJobId(e.target.value)}
                  className="premium-input"
                  style={{ width: '100%' }}
                >
                  {openings.map(job => (
                    <option key={job.id} value={job.id}>{job.title} ({job.department})</option>
                  ))}
                  {openings.length === 0 && (
                    <option value="">No Active Job Openings - Create one first!</option>
                  )}
                </select>
              </div>

              <div className="premium-form-group" style={{ marginBottom: 0 }}>
                <label className="premium-label" style={{ fontSize: '0.65rem' }}>Evaluation Score (1 to 5 Stars)</label>
                <input 
                  type="number" 
                  step="0.1" 
                  min="1" 
                  max="5" 
                  value={newCandRating} 
                  onChange={(e) => setNewCandRating(e.target.value)} 
                  className="premium-input" 
                />
              </div>

              <div className="premium-form-group" style={{ marginBottom: 0 }}>
                <label className="premium-label" style={{ fontSize: '0.65rem' }}>Initial Evaluation Stage</label>
                <select 
                  value={newCandStage} 
                  onChange={(e) => setNewCandStage(e.target.value)}
                  className="premium-input"
                  style={{ width: '100%' }}
                >
                  <option value="Applied">Applied</option>
                  <option value="Screening">Screening</option>
                  <option value="Interview">Interview</option>
                  <option value="Offered">Offered</option>
                  <option value="Hired">Hired</option>
                </select>
              </div>

              <div style={{ display: 'flex', gap: 12, marginTop: 10 }}>
                <button type="submit" className="premium-btn premium-btn-primary" style={{ flex: 1, height: 42, justifyContent: 'center' }}>Save Profile</button>
                <button type="button" onClick={() => setShowAddCandidate(false)} className="premium-btn premium-btn-secondary" style={{ flex: 1, height: 42, justifyContent: 'center' }}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Schedule Interview Modal */}
      {showScheduleModal && (
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
          <div className="premium-card" style={{ padding: 24, width: 440, background: 'var(--color-bg)', display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ fontSize: '1rem', fontWeight: 800 }}>Schedule Evaluation Interview</h3>
              <button 
                onClick={() => setShowScheduleModal(false)} 
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text-tertiary)' }}
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleScheduleInterview} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div className="premium-form-group" style={{ marginBottom: 0 }}>
                <label className="premium-label" style={{ fontSize: '0.65rem' }}>Select Candidate</label>
                <select 
                  value={selectedCandId} 
                  onChange={(e) => setSelectedCandId(e.target.value)}
                  className="premium-input"
                  style={{ width: '100%' }}
                  required
                >
                  <option value="">-- Choose Candidate --</option>
                  {candidates.filter(c => c.stage !== 'Hired' && c.stage !== 'Rejected').map(cand => (
                    <option key={cand.id} value={cand.id}>{cand.name} (Applied for: {cand.jobTitle})</option>
                  ))}
                </select>
              </div>

              <div className="premium-form-group" style={{ marginBottom: 0 }}>
                <label className="premium-label" style={{ fontSize: '0.65rem' }}>Interviewer Name</label>
                <input 
                  type="text" 
                  required 
                  placeholder="e.g. Jane Dev Lead" 
                  value={interviewerName} 
                  onChange={(e) => setInterviewerName(e.target.value)} 
                  className="premium-input" 
                />
              </div>

              <div className="premium-form-group" style={{ marginBottom: 0 }}>
                <label className="premium-label" style={{ fontSize: '0.65rem' }}>Interview Round Type</label>
                <select 
                  value={interviewType} 
                  onChange={(e) => setInterviewType(e.target.value)}
                  className="premium-input"
                  style={{ width: '100%' }}
                >
                  <option value="Technical">Technical Round</option>
                  <option value="HR">HR & Cultural Fit</option>
                  <option value="System Design">System Design</option>
                  <option value="Managerial">Managerial Round</option>
                </select>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div className="premium-form-group" style={{ marginBottom: 0 }}>
                  <label className="premium-label" style={{ fontSize: '0.65rem' }}>Date</label>
                  <input 
                    type="date" 
                    required 
                    value={interviewDate} 
                    onChange={(e) => setInterviewDate(e.target.value)} 
                    className="premium-input" 
                  />
                </div>
                <div className="premium-form-group" style={{ marginBottom: 0 }}>
                  <label className="premium-label" style={{ fontSize: '0.65rem' }}>Time</label>
                  <input 
                    type="time" 
                    required 
                    value={interviewTime} 
                    onChange={(e) => setInterviewTime(e.target.value)} 
                    className="premium-input" 
                  />
                </div>
              </div>

              <div style={{ display: 'flex', gap: 12, marginTop: 10 }}>
                <button type="submit" className="premium-btn premium-btn-primary" style={{ flex: 1, height: 42, justifyContent: 'center' }}>Schedule invite</button>
                <button type="button" onClick={() => setShowScheduleModal(false)} className="premium-btn premium-btn-secondary" style={{ flex: 1, height: 42, justifyContent: 'center' }}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
