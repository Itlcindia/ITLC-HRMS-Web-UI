import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { BookOpen, Award, CheckCircle, Clock, Plus, X, Calendar, User } from 'lucide-react';
import { api } from '../../services/api';

const initialCertificates = [
  { id: 'CERT-001', name: 'John Doe', course: 'React Development Bootcamp', date: '2026-06-15' },
  { id: 'CERT-002', name: 'Sarah Connor', course: 'Project Management & Agility', date: '2026-07-02' }
];

export default function Training() {
  const [courses, setCourses] = useState([]);
  const [certs, setCerts] = useState(initialCertificates);
  const [loading, setLoading] = useState(false);

  // Modal form states
  const [showAddModal, setShowAddModal] = useState(false);
  const [courseTitle, setCourseTitle] = useState('');
  const [instructorName, setInstructorName] = useState('');
  const [duration, setDuration] = useState('1 Week');
  const [courseType, setCourseType] = useState('Technical');
  const [enrolledCount, setEnrolledCount] = useState(0);
  const [status, setStatus] = useState('Upcoming');
  const [startDate, setStartDate] = useState('');

  const fetchTrainings = async () => {
    setLoading(true);
    try {
      const list = await api.getAdminTrainings();
      const mapped = list.map(t => ({
        id: t.id,
        name: t.title,
        duration: t.duration,
        instructor: t.instructor || 'Internal Team',
        attendees: t.enrolledCount || 0,
        type: t.type || 'Technical',
        status: t.status || 'Upcoming',
        progress: t.status === 'Completed' ? 100 : t.status === 'Ongoing' ? 65 : 0
      }));
      setCourses(mapped);
    } catch (err) {
      console.error("Failed to load training programs:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTrainings();
  }, []);

  const handleCreateProgram = async (e) => {
    e.preventDefault();
    if (!courseTitle.trim() || !instructorName.trim()) return;

    try {
      await api.createAdminTraining({
        title: courseTitle,
        instructor: instructorName,
        duration,
        type: courseType,
        enrolledCount: Number(enrolledCount),
        status,
        startDate: startDate || new Date().toISOString()
      });
      alert("New training program launched successfully!");
      setShowAddModal(false);
      setCourseTitle('');
      setInstructorName('');
      setEnrolledCount(0);
      setStartDate('');
      fetchTrainings();
    } catch (err) {
      alert("Failed to create training program: " + err.message);
    }
  };

  const claimCertificate = () => {
    const studentName = prompt("Enter Student Name to issue certificate:");
    if (!studentName) return;
    const courseSelected = prompt("Enter Course Name:");
    if (!courseSelected) return;

    const newCert = {
      id: `CERT-${Math.floor(100 + Math.random() * 900)}`,
      name: studentName,
      course: courseSelected,
      date: new Date().toISOString().split('T')[0]
    };
    setCerts(prev => [newCert, ...prev]);
    alert("New training certificate generated successfully!");
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      
      {/* Top Header Card */}
      <div className="premium-card" style={{ padding: '16px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexShrink: 0 }}>
        <div>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 800, background: 'linear-gradient(90deg, #0F172A 0%, #475569 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Training & Talent Development</h2>
          <p style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)', marginTop: 2 }}>Launch new upskilling courses, track attendance, and generate official completions.</p>
        </div>
        <button onClick={() => setShowAddModal(true)} className="premium-btn premium-btn-primary" style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 16px' }}>
          <Plus size={14} />
          <span>Launch Course</span>
        </button>
      </div>

      {/* Course List & Progress Grid */}
      {loading ? (
        <div style={{ padding: 24, textAlign: 'center', color: 'var(--color-text-tertiary)' }}>Loading training logs...</div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 20 }}>
          {courses.map((course) => (
            <div key={course.id} className="premium-card" style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <h4 style={{ fontSize: '0.9rem', fontWeight: 800 }}>{course.name}</h4>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 4, fontSize: '0.75rem', color: 'var(--color-text-secondary)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                      <Clock size={12} />
                      <span>{course.duration}</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                      <User size={12} />
                      <span>{course.instructor}</span>
                    </div>
                  </div>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 4 }}>
                  <span className="badge badge-primary">{course.attendees} Enrolled</span>
                  <span style={{ fontSize: '0.7rem' }} className={`badge ${course.status === 'Completed' ? 'badge-success' : 'badge-warning'}`}>{course.status}</span>
                </div>
              </div>
              
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', marginBottom: 6 }}>
                  <span>Overall Team Completion</span>
                  <strong className="number-font">{course.progress}%</strong>
                </div>
                <div style={{ width: '100%', height: 6, background: '#E2E8F0', borderRadius: 3, overflow: 'hidden' }}>
                  <div style={{ width: `${course.progress}%`, height: '100%', background: 'linear-gradient(90deg, var(--color-primary), var(--color-accent))' }} />
                </div>
              </div>
            </div>
          ))}
          {courses.length === 0 && (
            <div style={{ padding: 24, textAlign: 'center', color: 'var(--color-text-tertiary)', width: '100%' }}>No training programs available yet. Click Launch Course to begin!</div>
          )}
        </div>
      )}

      {/* Certificates & Training Calendar */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: 24 }}>
        
        {/* Certificate ledger */}
        <div className="premium-card" style={{ padding: 24 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
            <h3 style={{ fontSize: '0.95rem', fontWeight: 700 }}>Issued Certificates</h3>
            <button onClick={claimCertificate} className="premium-btn premium-btn-primary" style={{ padding: '6px 12px', fontSize: '0.75rem' }}>
              <span>Generate Cert</span>
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {certs.map((cert) => (
              <div key={cert.id} style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: 12,
                borderRadius: 12,
                border: '1px solid #E2E8F0',
                background: '#F8FAFC'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <Award size={16} style={{ color: 'var(--color-warning)' }} />
                  <div>
                    <div style={{ fontSize: '0.8rem', fontWeight: 700 }}>{cert.name}</div>
                    <div style={{ fontSize: '0.7rem', color: 'var(--color-text-secondary)' }}>{cert.course}</div>
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <span className="number-font" style={{ fontSize: '0.7rem', color: 'var(--color-text-tertiary)' }}>{cert.date}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Training Calendar schedules */}
        <div className="premium-card" style={{ padding: 24 }}>
          <h3 style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: 18 }}>Training Calendar</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div style={{ display: 'flex', gap: 12, borderLeft: '3px solid var(--color-primary)', paddingLeft: 12 }}>
              <div>
                <h5 style={{ fontSize: '0.8rem', fontWeight: 700 }}>Cybersecurity Awareness Drill</h5>
                <span style={{ fontSize: '0.7rem', color: 'var(--color-text-secondary)' }}>July 08 • 10:00 AM • Zoom</span>
              </div>
            </div>
            <div style={{ display: 'flex', gap: 12, borderLeft: '3px solid var(--color-accent)', paddingLeft: 12 }}>
              <div>
                <h5 style={{ fontSize: '0.8rem', fontWeight: 700 }}>Stripe Billing API integration workshop</h5>
                <span style={{ fontSize: '0.7rem', color: 'var(--color-text-secondary)' }}>July 15 • 02:00 PM • HQ Conf Room A</span>
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* Launch Course Modal */}
      {showAddModal && (
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
              <h3 style={{ fontSize: '1rem', fontWeight: 800 }}>Launch Training Program</h3>
              <button 
                onClick={() => setShowAddModal(false)} 
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text-tertiary)' }}
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCreateProgram} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div className="premium-form-group" style={{ marginBottom: 0 }}>
                <label className="premium-label" style={{ fontSize: '0.65rem' }}>Course Name / Title</label>
                <input 
                  type="text" 
                  required 
                  placeholder="e.g. React Native Mobile Dev" 
                  value={courseTitle} 
                  onChange={(e) => setCourseTitle(e.target.value)} 
                  className="premium-input" 
                />
              </div>

              <div className="premium-form-group" style={{ marginBottom: 0 }}>
                <label className="premium-label" style={{ fontSize: '0.65rem' }}>Lead Instructor / Coordinator</label>
                <input 
                  type="text" 
                  required 
                  placeholder="e.g. Sarah Connor" 
                  value={instructorName} 
                  onChange={(e) => setInstructorName(e.target.value)} 
                  className="premium-input" 
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div className="premium-form-group" style={{ marginBottom: 0 }}>
                  <label className="premium-label" style={{ fontSize: '0.65rem' }}>Duration</label>
                  <select 
                    value={duration} 
                    onChange={(e) => setDuration(e.target.value)} 
                    className="premium-input"
                  >
                    <option value="3 Days">3 Days</option>
                    <option value="1 Week">1 Week</option>
                    <option value="2 Weeks">2 Weeks</option>
                    <option value="1 Month">1 Month</option>
                  </select>
                </div>
                <div className="premium-form-group" style={{ marginBottom: 0 }}>
                  <label className="premium-label" style={{ fontSize: '0.65rem' }}>Enrolled Students</label>
                  <input 
                    type="number" 
                    min="0" 
                    value={enrolledCount} 
                    onChange={(e) => setEnrolledCount(e.target.value)} 
                    className="premium-input" 
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div className="premium-form-group" style={{ marginBottom: 0 }}>
                  <label className="premium-label" style={{ fontSize: '0.65rem' }}>Course Type</label>
                  <select 
                    value={courseType} 
                    onChange={(e) => setCourseType(e.target.value)} 
                    className="premium-input"
                  >
                    <option value="Technical">Technical</option>
                    <option value="Soft Skills">Soft Skills</option>
                    <option value="Compliance">Compliance</option>
                  </select>
                </div>
                <div className="premium-form-group" style={{ marginBottom: 0 }}>
                  <label className="premium-label" style={{ fontSize: '0.65rem' }}>Launch Status</label>
                  <select 
                    value={status} 
                    onChange={(e) => setStatus(e.target.value)} 
                    className="premium-input"
                  >
                    <option value="Upcoming">Upcoming</option>
                    <option value="Ongoing">Ongoing</option>
                    <option value="Completed">Completed</option>
                  </select>
                </div>
              </div>

              <div className="premium-form-group" style={{ marginBottom: 0 }}>
                <label className="premium-label" style={{ fontSize: '0.65rem' }}>Start Date</label>
                <input 
                  type="date" 
                  value={startDate} 
                  onChange={(e) => setStartDate(e.target.value)} 
                  className="premium-input" 
                />
              </div>

              <div style={{ display: 'flex', gap: 12, marginTop: 10 }}>
                <button type="submit" className="premium-btn premium-btn-primary" style={{ flex: 1, height: 42, justifyContent: 'center' }}>Launch Program</button>
                <button type="button" onClick={() => setShowAddModal(false)} className="premium-btn premium-btn-secondary" style={{ flex: 1, height: 42, justifyContent: 'center' }}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
