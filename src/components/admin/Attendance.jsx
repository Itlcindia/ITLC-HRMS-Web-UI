import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Play, Square, Calendar, Clock, UserCheck, AlertTriangle, 
  MapPin, CheckCircle, FileSpreadsheet, List, Table, User, ShieldAlert, Sliders, FileText, LogOut, Pencil, Upload, Download
} from 'lucide-react';

const shiftSchedule = [
  { id: 1, name: 'Morning Shift', hours: '09:00 AM - 05:00 PM', department: 'All Departments' },
  { id: 2, name: 'Swing Shift', hours: '02:00 PM - 10:00 PM', department: 'Customer Support' },
  { id: 3, name: 'Night Shift', hours: '10:00 PM - 06:00 AM', department: 'Security & DevOps' },
];

const mockCalendarDays = [
  { day: 25, status: 'Present', time: '08:58 AM' },
  { day: 26, status: 'Present', time: '08:56 AM' },
  { day: 27, status: 'Late', time: '09:15 AM' },
  { day: 28, status: 'Present', time: '08:50 AM' },
  { day: 29, status: 'Absent', time: '-' },
  { day: 30, status: 'Present', time: '09:02 AM' },
  { day: 1, status: 'Present', time: '08:59 AM' },
  { day: 2, status: 'Present', time: '08:45 AM' },
];

const mockDailyLogs = [
  { id: 1, name: 'Sarah Jenkins', dept: 'Design', inTime: '08:58 AM', outTime: '05:02 PM', status: 'On Time' },
  { id: 2, name: 'Marcus Vance', dept: 'Engineering', inTime: '09:12 AM', outTime: '06:10 PM', status: 'Late' },
  { id: 3, name: 'Clara Oswald', dept: 'Engineering', inTime: '08:45 AM', outTime: '05:00 PM', status: 'On Time' },
  { id: 4, name: 'Sophia Patel', dept: 'Marketing', inTime: '09:00 AM', outTime: '05:05 PM', status: 'On Time' },
  { id: 5, name: 'David Tennant', dept: 'Sales', inTime: '09:34 AM', outTime: '05:30 PM', status: 'Late' },
];

import { api } from '../../services/api';

export default function Attendance({ subTab = 'dashboard' }) {
  const attendanceFileInputRef = React.useRef(null);
  const [punchedIn, setPunchedIn] = useState(false);
  const [punchTime, setPunchTime] = useState(null);
  const [workDuration, setWorkDuration] = useState('00:00:00');
  const [logs, setLogs] = useState([]);
  const [ownLogs, setOwnLogs] = useState([]);
  const [loading, setLoading] = useState(false);

  const [companyDetails, setCompanyDetails] = useState(null);

  // Correction requests and manual override states
  const [corrections, setCorrections] = useState([]);
  const [loadingCorrections, setLoadingCorrections] = useState(false);
  const [editingLog, setEditingLog] = useState(null);
  const [editStatus, setEditStatus] = useState('Present');
  const [editCheckIn, setEditCheckIn] = useState('');
  const [editCheckOut, setEditCheckOut] = useState('');

  // Shift editing states
  const [editingGeneralShift, setEditingGeneralShift] = useState(false);
  const [editShiftStart, setEditShiftStart] = useState('');
  const [editShiftEnd, setEditShiftEnd] = useState('');

  // Holiday management states
  const [holidays, setHolidays] = useState([]);
  const [selectedGridDay, setSelectedGridDay] = useState(null);
  const [holidayNameInput, setHolidayNameInput] = useState('');
  const [holidayTypeInput, setHolidayTypeInput] = useState('Public Holiday');

  const todayDate = new Date().toISOString().split('T')[0];
  const todayOwnRecord = ownLogs.find(r => r.date === todayDate);

  const fetchLogs = async (isSilent = false) => {
    if (!isSilent) setLoading(true);
    try {
      const [data, personalData, company, corrData, holidayList] = await Promise.all([
        api.getAdminAttendance(),
        api.getEmployeeAttendance(),
        api.getAdminCompany(),
        api.getManagerCorrections().catch(() => []),
        api.getAdminHolidays().catch(() => [])
      ]);
      setLogs(data || []);
      setOwnLogs(personalData || []);
      setCompanyDetails(company || null);
      setCorrections(corrData || []);
      setHolidays(holidayList || []);
    } catch (err) {
      console.error("Failed to fetch admin attendance logs:", err);
    } finally {
      if (!isSilent) setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs(false);
    const interval = setInterval(() => fetchLogs(true), 5000);
    return () => clearInterval(interval);
  }, [subTab]);

  useEffect(() => {
    if (todayOwnRecord) {
      if (todayOwnRecord.checkIn && !todayOwnRecord.checkOut) {
        setPunchedIn(true);
        const [h, m, s] = todayOwnRecord.checkIn.split(':').map(Number);
        const tDate = new Date();
        tDate.setHours(h, m, s, 0);
        setPunchTime(tDate);
      } else {
        setPunchedIn(false);
        setPunchTime(null);
      }
    } else {
      setPunchedIn(false);
      setPunchTime(null);
    }
  }, [ownLogs]);
  
  useEffect(() => {
    let interval;
    if (punchedIn && punchTime) {
      interval = setInterval(() => {
        const diff = Date.now() - punchTime.getTime();
        const hrs = Math.floor(diff / 3600000);
        const mins = Math.floor((diff % 3600000) / 60000);
        const secs = Math.floor((diff % 60000) / 1000);
        setWorkDuration(`${hrs.toString().padStart(2, "0")}:${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`);
      }, 1000);
    } else {
      setWorkDuration('00:00:00');
    }
    return () => clearInterval(interval);
  }, [punchedIn, punchTime]);

  const handleSaveHoliday = async (e) => {
    e.preventDefault();
    if (!selectedGridDay) return;
    try {
      if (selectedGridDay.holiday) {
        // Delete existing holiday
        await api.deleteAdminHoliday(selectedGridDay.holiday.id);
        alert("Holiday removed successfully!");
      } else {
        // Create new holiday
        await api.createAdminHoliday({
          name: holidayNameInput,
          date: selectedGridDay.date,
          type: holidayTypeInput
        });
        alert("Holiday added successfully!");
      }
      setSelectedGridDay(null);
      fetchLogs(true); // reload to get updated holidays list
    } catch (err) {
      alert("Failed to save holiday: " + err.message);
    }
  };

  const handleRemoveHolidayDirectly = async (holidayId) => {
    try {
      await api.deleteAdminHoliday(holidayId);
      alert("Holiday removed successfully!");
      setSelectedGridDay(null);
      fetchLogs(true);
    } catch (err) {
      alert("Failed to remove holiday: " + err.message);
    }
  };

  const todayLogs = logs.filter(l => l.date === todayDate);
  const totalPresentToday = todayLogs.filter(l => l.status === 'Present' || l.status === 'Late').length;
  const lateToday = todayLogs.filter(l => l.status === 'Late').length;

  const handlePunch = async () => {
    if (companyDetails) {
      try {
        await checkGeofence(companyDetails);
      } catch (err) {
        alert("Geofence Restriction: " + err.message);
        return;
      }
    }

    const now = new Date();
    const dateStr = now.toISOString().split('T')[0];
    const timeStr = now.toLocaleTimeString('en-US', { hour12: false });
    
    if (!punchedIn) {
      try {
        const record = await api.punchIn({
          date: dateStr,
          checkIn: timeStr,
          status: 'Present'
        });
        setOwnLogs(prev => [record, ...prev]);
        alert("Attendance Marked Successfully");
      } catch (err) {
        alert("Failed to punch in: " + err.message);
      }
    } else {
      const elapsedTotal = Math.floor((now.getTime() - punchTime.getTime()) / 1000);
      const hrs = Math.floor(elapsedTotal / 3600);
      const mins = Math.floor((elapsedTotal % 3600) / 60);
      const secs = elapsedTotal % 60;
      const workStr = `${hrs.toString().padStart(2, "0")}:${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
      
      try {
        const record = await api.punchOut({
          date: dateStr,
          checkOut: timeStr,
          breakDuration: '00:00:00',
          workHours: workStr,
          status: 'Present'
        });
        setOwnLogs(prev => prev.map(r => r.date === dateStr ? record : r));
        alert("Punch Out Successful");
      } catch (err) {
        alert("Failed to punch out: " + err.message);
      }
    }
  };

  const handleProcessCorrection = async (id, status) => {
    try {
      await api.updateManagerCorrection(id, status, "Processed by Admin");
      alert(`Correction request has been ${status.toLowerCase()} successfully!`);
      fetchLogs();
    } catch (err) {
      alert("Failed to process correction request: " + err.message);
    }
  };

  const handleStartEditLog = (log) => {
    setEditingLog(log);
    setEditStatus(log.status || 'Present');
    setEditCheckIn(log.checkIn || '09:00:00');
    setEditCheckOut(log.checkOut || '18:00:00');
  };

  const handleSaveDirectEdit = async () => {
    if (!editingLog) return;
    try {
      let workHours = '08:00:00';
      if (editCheckIn && editCheckOut) {
        const [inH, inM, inS] = editCheckIn.split(':').map(Number);
        const [outH, outM, outS] = editCheckOut.split(':').map(Number);
        const totalSecs = (outH * 3600 + outM * 60 + (outS || 0)) - (inH * 3600 + inM * 60 + (inS || 0));
        if (totalSecs > 0) {
          const h = Math.floor(totalSecs / 3600);
          const m = Math.floor((totalSecs % 3600) / 60);
          const s = totalSecs % 60;
          workHours = `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
        }
      }
      await api.updateAdminAttendance(editingLog.id, {
        status: editStatus,
        checkIn: editCheckIn,
        checkOut: editCheckOut,
        workHours
      });
      alert("Attendance record updated successfully!");
      setEditingLog(null);
      fetchLogs();
    } catch (err) {
      alert("Failed to update attendance record: " + err.message);
    }
  };

  const getGeneralShiftHours = () => {
    if (!companyDetails) return '09:00 AM - 05:00 PM';
    const start = companyDetails.workdayStart || '09:00';
    const end = companyDetails.workdayEnd || '17:00';
    
    const to12h = (timeStr) => {
      if (!timeStr) return '';
      const [h, m] = timeStr.split(':');
      const hrs = Number(h);
      const ampm = hrs >= 12 ? 'PM' : 'AM';
      const formattedHrs = (hrs % 12 || 12).toString().padStart(2, '0');
      return `${formattedHrs}:${m} ${ampm}`;
    };
    
    try {
      return `${to12h(start)} - ${to12h(end)}`;
    } catch (e) {
      return `${start} - ${end}`;
    }
  };

  const handleSaveGeneralShift = async (e) => {
    e.preventDefault();
    try {
      await api.updateAdminCompany({
        workdayStart: editShiftStart,
        workdayEnd: editShiftEnd
      });
      alert("General Shift working hours updated successfully in the database!");
      setEditingGeneralShift(false);
      fetchLogs(true);
    } catch (err) {
      alert("Failed to update general shift: " + err.message);
    }
  };

  const exportAttendance = () => {
    if (!logs || logs.length === 0) {
      alert("No attendance records available to export.");
      return;
    }
    
    // Construct CSV Header
    const headers = ["Employee ID", "Employee Name", "Date", "Punch In Time", "Punch Out Time", "Status", "IP Address", "Device Info"];
    const rows = logs.map(log => [
      log.employeeId || 'N/A',
      log.employeeName || 'N/A',
      log.date || 'N/A',
      log.punchIn || 'N/A',
      log.punchOut || 'N/A',
      log.status || 'N/A',
      log.ipAddress || 'N/A',
      log.deviceInfo || 'N/A'
    ]);
    
    const csvContent = [headers, ...rows]
      .map(row => row.map(val => `"${val.toString().replace(/"/g, '""')}"`).join(","))
      .join("\n");
      
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `attendance_summary_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleImportAttendance = () => {
    attendanceFileInputRef.current?.click();
  };

  const handleImportAttendanceCSV = (e) => {
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

        // Ensure key fields: employeeid or "employee id", name/employeename, date
        const empId = data.employeeid || data["employee id"] || data.empid || data["emp id"];
        const empName = data.employeename || data["employee name"] || data.name || `Employee ${empId}`;
        const date = data.date;

        if (!empId || !date) continue;

        try {
          await api.createAdminAttendance({
            employeeId: empId.toString(),
            employeeName: empName,
            date: date,
            checkIn: data.checkin || data["check-in"] || data["check in"] || '09:00:00',
            checkOut: data.checkout || data["check-out"] || data["check out"] || '18:00:00',
            breakDuration: data.breakduration || data["break duration"] || '00:00:00',
            workHours: data.workhours || data["work hours"] || '08:00:00',
            status: data.status || 'Present'
          });
          createdCount++;
        } catch (err) {
          errors.push(`Row ${i + 1} (${empName || empId}): ${err.message}`);
        }
      }

      fetchLogs(false);

      let statusMsg = `Attendance CSV Import Done:\n- Processed ${createdCount} attendance logs.`;
      if (errors.length > 0) {
        statusMsg += `\n\nErrors encountered:\n` + errors.slice(0, 5).join('\n');
      }
      alert(statusMsg);
    };

    reader.readAsText(file);
    e.target.value = '';
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      
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
            {/* Punch & Status Board */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 20 }}>
              
              {/* Punch Card */}
              <div 
                className="premium-card" 
                style={{ 
                  padding: 28, 
                  display: 'flex', 
                  flexDirection: 'column', 
                  alignItems: 'center', 
                  justifyContent: 'center', 
                  gap: 18,
                  textAlign: 'center',
                  background: 'var(--glass-bg)',
                  backdropFilter: 'blur(20px)'
                }}
              >
                <div style={{
                  width: 60,
                  height: 60,
                  borderRadius: '50%',
                  background: punchedIn ? 'rgba(34, 197, 94, 0.1)' : 'rgba(79, 70, 229, 0.1)',
                  color: punchedIn ? 'var(--color-success)' : 'var(--color-primary)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <Clock size={30} />
                </div>

                <div>
                  <h3 style={{ fontSize: '1.2rem', fontWeight: 800 }}>
                    {punchedIn ? 'You are Punched In' : todayOwnRecord ? 'Shift Completed' : 'Not Clocked In'}
                  </h3>
                  <p style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)', marginTop: 4 }}>
                    {punchedIn ? `Started at ${punchTime.toLocaleTimeString()}` : todayOwnRecord ? `Punched in: ${todayOwnRecord.checkIn} | Out: ${todayOwnRecord.checkOut}` : 'Ready to begin your workday?'}
                  </p>
                </div>

                {(punchedIn || todayOwnRecord) && (
                  <div className="number-font" style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--color-primary)' }}>
                    {punchedIn ? workDuration : todayOwnRecord.workHours}
                  </div>
                )}

                <motion.button 
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handlePunch}
                  className={punchedIn ? 'btn-punch-out' : 'btn-punch-in'}
                  style={{ width: '100%' }}
                >
                  {punchedIn ? <LogOut size={16} /> : <Play size={16} />}
                  <span>{punchedIn ? 'Punch Out' : 'Punch In'}</span>
                </motion.button>

                <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.75rem', color: 'var(--color-text-secondary)' }}>
                  <MapPin size={12} />
                  <span>IP: 192.168.1.1 (HQ Office Gateway)</span>
                </div>
              </div>

              {/* Quick Stats */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <div className="premium-card" style={{ padding: 20, display: 'flex', alignItems: 'center', gap: 16 }}>
                  <div style={{ width: 44, height: 44, borderRadius: 12, background: 'var(--color-success-light)', color: 'var(--color-success)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <UserCheck size={20} />
                  </div>
                  <div>
                    <span className="premium-label">Total Present Today</span>
                    <h4 className="number-font" style={{ fontSize: '1.25rem', fontWeight: 700, marginTop: 2 }}>{totalPresentToday} Active</h4>
                  </div>
                </div>
                <div className="premium-card" style={{ padding: 20, display: 'flex', alignItems: 'center', gap: 16 }}>
                  <div style={{ width: 44, height: 44, borderRadius: 12, background: 'var(--color-warning-light)', color: 'var(--color-warning)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <AlertTriangle size={20} />
                  </div>
                  <div>
                    <span className="premium-label">Late Checked-in</span>
                    <h4 className="number-font" style={{ fontSize: '1.25rem', fontWeight: 700, marginTop: 2 }}>{lateToday} Employees</h4>
                  </div>
                </div>
                <div className="premium-card" style={{ padding: 20, display: 'flex', alignItems: 'center', gap: 16 }}>
                  <div style={{ width: 44, height: 44, borderRadius: 12, background: 'var(--color-primary-light)', color: 'var(--color-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Calendar size={20} />
                  </div>
                  <div>
                    <span className="premium-label">Total Logged Records</span>
                    <h4 className="number-font" style={{ fontSize: '1.25rem', fontWeight: 700, marginTop: 2 }}>{logs.length} Logs</h4>
                  </div>
                </div>
              </div>

            </div>
          </motion.div>
        )}

        {/* SUB-VIEW 2: Daily Logs */}
        {subTab === 'logs' && (
          <motion.div
            key="logs"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="premium-card"
            style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 20 }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
              <div>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 800 }}>Daily Login Logs</h3>
                <span style={{ fontSize: '0.75rem', color: 'var(--color-text-tertiary)' }}>Live check-in times of all employees</span>
              </div>
              <div style={{ display: 'flex', gap: 10 }}>
                <input 
                  type="file" 
                  ref={attendanceFileInputRef} 
                  onChange={handleImportAttendanceCSV} 
                  accept=".csv" 
                  style={{ display: 'none' }} 
                />
                <button onClick={exportAttendance} className="premium-btn premium-btn-secondary" style={{ padding: '8px 14px', display: 'flex', alignItems: 'center', gap: 6 }}>
                  <Download size={14} />
                  <span>Export Logs</span>
                </button>
                <button onClick={handleImportAttendance} className="premium-btn premium-btn-primary" style={{ padding: '8px 14px', display: 'flex', alignItems: 'center', gap: 6 }}>
                  <Upload size={14} />
                  <span>Import Attendance</span>
                </button>
              </div>
            </div>

            <div className="premium-table-container">
              {loading ? (
                <div style={{ textAlign: 'center', padding: 24, fontSize: '0.9rem', color: 'var(--color-text-secondary)' }}>
                  Loading logs from database...
                </div>
              ) : logs.length === 0 ? (
                <div style={{ textAlign: 'center', padding: 24, fontSize: '0.9rem', color: 'var(--color-text-secondary)' }}>
                  No attendance records found.
                </div>
              ) : (
                <table className="premium-table">
                  <thead>
                    <tr>
                      <th>Employee Name</th>
                      <th>Date</th>
                      <th>Punch In Time</th>
                      <th>Punch Out Time</th>
                      <th>Work Hours</th>
                      <th>Status</th>
                      <th style={{ textAlign: 'right' }}>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {logs.map((log, index) => (
                      <tr key={log.id || index}>
                        <td style={{ fontWeight: 600 }}>{log.employeeName}</td>
                        <td className="number-font" style={{ fontSize: '0.8rem' }}>{log.date}</td>
                        <td className="number-font" style={{ fontSize: '0.8rem', color: 'var(--color-success)' }}>{log.checkIn || '--:--:--'}</td>
                        <td className="number-font" style={{ fontSize: '0.8rem', color: 'var(--color-danger)' }}>{log.checkOut || '--:--:--'}</td>
                        <td className="number-font" style={{ fontSize: '0.8rem', fontWeight: 600 }}>{log.workHours || '00:00:00'}</td>
                        <td>
                          <span className={`badge ${log.status === 'Present' || log.status === 'On Time' ? 'badge-success' : log.status === 'Late' ? 'badge-warning' : 'badge-danger'}`}>
                            {log.status || 'Present'}
                          </span>
                        </td>
                        <td style={{ textAlign: 'right' }}>
                          <button 
                            onClick={() => handleStartEditLog(log)}
                            style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--color-primary)' }}
                            title="Edit Attendance Log"
                          >
                            <Pencil size={14} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </motion.div>
        )}

        {/* SUB-VIEW: Correction Requests */}
        {subTab === 'corrections' && (
          <motion.div
            key="corrections"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="premium-card"
            style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 20 }}
          >
            <div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 800 }}>Employee Correction Requests</h3>
              <span style={{ fontSize: '0.75rem', color: 'var(--color-text-tertiary)' }}>Pending attendance fixes and adjustments submitted by employees</span>
            </div>

            <div className="premium-table-container">
              {corrections.length === 0 ? (
                <div style={{ textAlign: 'center', padding: 24, fontSize: '0.9rem', color: 'var(--color-text-secondary)' }}>
                  No correction requests found.
                </div>
              ) : (
                <table className="premium-table">
                  <thead>
                    <tr>
                      <th>Employee Name</th>
                      <th>Date</th>
                      <th>Requested In</th>
                      <th>Requested Out</th>
                      <th>Reason</th>
                      <th>Status</th>
                      <th style={{ textAlign: 'right' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {corrections.map((corr) => (
                      <tr key={corr.id}>
                        <td style={{ fontWeight: 600 }}>{corr.employeeName}</td>
                        <td className="number-font" style={{ fontSize: '0.8rem' }}>{corr.date}</td>
                        <td className="number-font" style={{ fontSize: '0.8rem', color: 'var(--color-success)' }}>{corr.requestedCheckIn || '--:--:--'}</td>
                        <td className="number-font" style={{ fontSize: '0.8rem', color: 'var(--color-danger)' }}>{corr.requestedCheckOut || '--:--:--'}</td>
                        <td style={{ fontSize: '0.8rem', maxWidth: 200, whiteSpace: 'normal', wordBreak: 'break-word' }}>{corr.reason}</td>
                        <td>
                          <span className={`badge ${corr.status === 'Approved' ? 'badge-success' : corr.status === 'Pending' ? 'badge-warning' : 'badge-danger'}`}>
                            {corr.status || 'Pending'}
                          </span>
                        </td>
                        <td style={{ textAlign: 'right' }}>
                          {corr.status === 'Pending' && (
                            <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
                              <button 
                                onClick={() => handleProcessCorrection(corr.id, 'Approved')}
                                className="premium-btn premium-btn-success"
                                style={{ padding: '4px 10px', fontSize: '0.7rem' }}
                              >
                                Approve
                              </button>
                              <button 
                                onClick={() => handleProcessCorrection(corr.id, 'Rejected')}
                                className="premium-btn premium-btn-danger"
                                style={{ padding: '4px 10px', fontSize: '0.7rem' }}
                              >
                                Reject
                              </button>
                            </div>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </motion.div>
        )}

        {/* SUB-VIEW 3: Monthly Grid */}
        {subTab === 'grid' && (
          <motion.div
            key="grid"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="premium-card"
            style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 20 }}
          >
            <div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 800 }}>
                Monthly Attendance Grid ({new Date().toLocaleString('default', { month: 'long', year: 'numeric' })})
              </h3>
              <span style={{ fontSize: '0.75rem', color: 'var(--color-text-tertiary)' }}>Color-coded present, absent and leave tracking for current month</span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 10, textAlign: 'center', marginTop: 12 }}>
              {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(day => (
                <div key={day} style={{ fontWeight: 700, fontSize: '0.8rem', color: 'var(--color-text-tertiary)' }}>{day}</div>
              ))}
              {(() => {
                const now = new Date();
                const year = now.getFullYear();
                const month = now.getMonth();
                const daysInMonth = new Date(year, month + 1, 0).getDate();
                const days = [];
                
                for (let d = 1; d <= daysInMonth; d++) {
                  const dateObj = new Date(year, month, d);
                  const dateStr = `${year}-${(month + 1).toString().padStart(2, '0')}-${d.toString().padStart(2, '0')}`;
                  const log = ownLogs.find(l => l.date === dateStr);
                  const dayOfWeek = dateObj.getDay();
                  const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
                  
                  const holiday = holidays.find(h => h.date === dateStr);
                  
                  let displayColor = 'var(--color-text-tertiary)';
                  let bg = 'rgba(0,0,0,0.02)';
                  let label = 'N/A';

                  if (holiday) {
                    displayColor = '#EF4444';
                    bg = 'rgba(239, 68, 68, 0.08)';
                    label = `Holiday: ${holiday.name}`;
                  } else if (log) {
                    if (log.status === 'Present' || log.status === 'On Time') {
                      displayColor = 'var(--color-success)';
                      bg = 'var(--color-success-light)';
                      label = 'Present';
                    } else if (log.status === 'Late') {
                      displayColor = 'var(--color-warning)';
                      bg = 'var(--color-warning-light)';
                      label = 'Late';
                    } else {
                      displayColor = 'var(--color-success)';
                      bg = 'var(--color-success-light)';
                      label = 'Present';
                    }
                  } else if (dateObj > now) {
                    displayColor = 'var(--color-text-tertiary)';
                    bg = 'rgba(0,0,0,0.01)';
                    label = '-';
                  } else if (isWeekend) {
                    displayColor = 'var(--color-primary)';
                    bg = 'var(--color-primary-light)';
                    label = 'Weekend';
                  } else {
                    displayColor = 'var(--color-danger)';
                    bg = 'var(--color-danger-light)';
                    label = 'Absent';
                  }

                  days.push({ day: d, date: dateStr, displayColor, bg, label, holiday });
                }

                return days.map((dayItem) => (
                  <div 
                    key={dayItem.day} 
                    title={`${dayItem.date} - ${dayItem.label}`}
                    onClick={() => {
                      setSelectedGridDay(dayItem);
                      if (dayItem.holiday) {
                        setHolidayNameInput(dayItem.holiday.name);
                        setHolidayTypeInput(dayItem.holiday.type);
                      } else {
                        setHolidayNameInput('');
                        setHolidayTypeInput('Public Holiday');
                      }
                    }}
                    style={{
                      height: 60,
                      borderRadius: 12,
                      background: dayItem.bg,
                      border: dayItem.holiday ? '2px solid #EF4444' : '1px solid var(--color-border)',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '0.85rem',
                      fontWeight: 700,
                      color: dayItem.displayColor,
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                      position: 'relative'
                    }}
                  >
                    <span>{dayItem.day}</span>
                    {dayItem.holiday && (
                      <span style={{ 
                        fontSize: '0.65rem', 
                        fontWeight: 600, 
                        color: '#EF4444', 
                        overflow: 'hidden', 
                        textOverflow: 'ellipsis', 
                        whiteSpace: 'nowrap',
                        maxWidth: '90%',
                        marginTop: 2
                      }}>
                        🎉 {dayItem.holiday.name}
                      </span>
                    )}
                  </div>
                ));
              })()}
            </div>
          </motion.div>
        )}

        {/* SUB-VIEW 4: My Attendance */}
        {subTab === 'my' && (
          <motion.div
            key="my"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="premium-card"
            style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 20 }}
          >
            <div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 800 }}>My Logs Calendar</h3>
              <span style={{ fontSize: '0.75rem', color: 'var(--color-text-tertiary)' }}>Personal login audit records</span>
            </div>

            <div className="premium-table-container">
              <table className="premium-table">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Log Time</th>
                    <th>Work Hours</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {ownLogs.length === 0 ? (
                    <tr>
                      <td colSpan={4} style={{ textAlign: 'center', padding: 20 }} className="text-muted-foreground">
                        No personal logs recorded yet.
                      </td>
                    </tr>
                  ) : (
                    ownLogs.map((log, idx) => (
                      <tr key={log.id || idx}>
                        <td style={{ fontWeight: 600 }}>{log.date}</td>
                        <td className="number-font" style={{ fontSize: '0.8rem' }}>
                          In: {log.checkIn || '--'} | Out: {log.checkOut || '--'}
                        </td>
                        <td className="number-font" style={{ fontSize: '0.8rem', fontWeight: 600 }}>
                          {log.workHours || '00:00:00'}
                        </td>
                        <td>
                          <span className={`badge ${log.status === 'Present' || log.status === 'On Time' ? 'badge-success' : log.status === 'Late' ? 'badge-warning' : 'badge-danger'}`}>
                            {log.status || 'Present'}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </motion.div>
        )}

        {/* SUB-VIEW 5: Shift Setup */}
        {subTab === 'shift' && (
          <motion.div
            key="shift"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="premium-card"
            style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 20 }}
          >
            <div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 800 }}>Company Shift Schedules</h3>
              <span style={{ fontSize: '0.75rem', color: 'var(--color-text-tertiary)' }}>Configure work times across corporate branches</span>
            </div>

            <div className="premium-table-container">
              <table className="premium-table">
                <thead>
                  <tr>
                    <th>Shift Classification</th>
                    <th>Working Hours</th>
                    <th>Target Departments</th>
                    <th style={{ textAlign: 'right' }}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    { id: 1, name: 'Standard General Shift', hours: getGeneralShiftHours(), department: 'Product, Marketing, HR', editable: true },
                    { id: 2, name: 'Swing Shift', hours: '02:00 PM - 10:00 PM', department: 'Customer Support', editable: false },
                    { id: 3, name: 'Night Shift', hours: '10:00 PM - 06:00 AM', department: 'Security & DevOps', editable: false },
                  ].map(shift => (
                    <tr key={shift.id}>
                      <td style={{ fontWeight: 700 }}>{shift.name}</td>
                      <td className="number-font" style={{ fontSize: '0.85rem' }}>{shift.hours}</td>
                      <td><span className="badge badge-info">{shift.department}</span></td>
                      <td style={{ textAlign: 'right' }}>
                        {shift.editable && (
                          <button 
                            onClick={() => {
                              setEditShiftStart(companyDetails?.workdayStart || '09:00');
                              setEditShiftEnd(companyDetails?.workdayEnd || '17:00');
                              setEditingGeneralShift(true);
                            }}
                            className="premium-btn"
                            style={{ padding: '6px 12px', fontSize: '0.7rem', minWidth: 'auto' }}
                          >
                            Edit Hours
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* General Shift Timing Edit Modal */}
            {editingGeneralShift && (
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
                <div className="premium-card" style={{ padding: 24, width: 380, background: 'var(--color-bg)', display: 'flex', flexDirection: 'column', gap: 16 }}>
                  <h3 style={{ fontSize: '1rem', fontWeight: 800 }}>Edit Shift Timing</h3>
                  <p style={{ fontSize: '0.75rem', color: 'var(--color-text-tertiary)' }}>Set company-wide General Shift check-in & check-out limits in 24-hour format.</p>
                  
                  <form onSubmit={handleSaveGeneralShift} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                    <div className="premium-form-group">
                      <label className="premium-label">Shift Start Time (HH:MM)</label>
                      <input type="text" required value={editShiftStart} onChange={(e) => setEditShiftStart(e.target.value)} className="premium-input" placeholder="e.g. 09:00" />
                    </div>
                    <div className="premium-form-group">
                      <label className="premium-label">Shift End Time (HH:MM)</label>
                      <input type="text" required value={editShiftEnd} onChange={(e) => setEditShiftEnd(e.target.value)} className="premium-input" placeholder="e.g. 17:00" />
                    </div>
                    <div style={{ display: 'flex', gap: 12, marginTop: 8 }}>
                      <button type="submit" className="premium-btn premium-btn-primary" style={{ flex: 1, height: 42, justifyContent: 'center' }}>Save Changes</button>
                      <button type="button" onClick={() => setEditingGeneralShift(false)} className="premium-btn premium-btn-secondary" style={{ flex: 1, height: 42, justifyContent: 'center' }}>Cancel</button>
                    </div>
                  </form>
                </div>
              </div>
            )}
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
              <FileSpreadsheet size={28} />
            </div>

            <div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: 8 }}>Export Logs Sheet</h3>
              <p style={{ fontSize: '0.9rem', color: 'var(--color-text-tertiary)', maxWidth: 400, margin: '0 auto' }}>
                Download comprehensive login sheets, late markers, and hourly aggregates in XLSX or CSV format.
              </p>
            </div>

            <button onClick={exportAttendance} className="premium-btn premium-btn-primary" style={{ padding: '12px 24px' }}>
              <FileSpreadsheet size={16} />
              <span>Export CSV Spreadsheet</span>
            </button>
          </motion.div>
        )}

      </AnimatePresence>

      {editingLog && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.5)',
          backdropFilter: 'blur(8px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999
        }}>
          <div className="premium-card" style={{ width: '100%', maxWidth: 450, padding: 28, display: 'flex', flexDirection: 'column', gap: 20 }}>
            <div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: 4 }}>Edit Attendance Record</h3>
              <p style={{ fontSize: '0.8rem', color: 'var(--color-text-tertiary)' }}>Overriding logs for <strong>{editingLog.employeeName}</strong> on {editingLog.date}</p>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                <label className="premium-label" style={{ fontSize: '0.75rem', fontWeight: 600 }}>Attendance Status</label>
                <select 
                  value={editStatus} 
                  onChange={(e) => setEditStatus(e.target.value)} 
                  className="premium-input"
                  style={{ width: '100%', height: 42, padding: '0 12px' }}
                >
                  <option value="Present">Present</option>
                  <option value="Late">Late</option>
                  <option value="Half-day">Half-day</option>
                  <option value="Absent">Absent</option>
                </select>
              </div>

              <div style={{ display: 'flex', gap: 16 }}>
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 6 }}>
                  <label className="premium-label" style={{ fontSize: '0.75rem', fontWeight: 600 }}>Punch In (HH:MM:SS)</label>
                  <input 
                    type="text" 
                    value={editCheckIn} 
                    onChange={(e) => setEditCheckIn(e.target.value)} 
                    className="premium-input" 
                    placeholder="09:00:00"
                  />
                </div>
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 6 }}>
                  <label className="premium-label" style={{ fontSize: '0.75rem', fontWeight: 600 }}>Punch Out (HH:MM:SS)</label>
                  <input 
                    type="text" 
                    value={editCheckOut} 
                    onChange={(e) => setEditCheckOut(e.target.value)} 
                    className="premium-input" 
                    placeholder="18:00:00"
                  />
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12, marginTop: 8 }}>
              <button 
                onClick={() => setEditingLog(null)} 
                className="premium-btn premium-btn-secondary"
                style={{ padding: '10px 20px' }}
              >
                Cancel
              </button>
              <button 
                onClick={handleSaveDirectEdit} 
                className="premium-btn premium-btn-primary"
                style={{ padding: '10px 24px' }}
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}

      {selectedGridDay && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.5)',
          backdropFilter: 'blur(8px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999
        }}>
          <div className="premium-card" style={{ width: '100%', maxWidth: 420, padding: 28, display: 'flex', flexDirection: 'column', gap: 20 }}>
            <div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: 4 }}>
                {selectedGridDay.holiday ? 'Remove Holiday' : 'Declare Holiday'}
              </h3>
              <p style={{ fontSize: '0.8rem', color: 'var(--color-text-tertiary)' }}>
                Managing calendar schedule for <strong>{selectedGridDay.date}</strong>
              </p>
            </div>

            <form onSubmit={handleSaveHoliday} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {!selectedGridDay.holiday ? (
                <>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                    <label className="premium-label" style={{ fontSize: '0.75rem', fontWeight: 600 }}>Holiday Name</label>
                    <input 
                      type="text" 
                      required
                      value={holidayNameInput} 
                      onChange={(e) => setHolidayNameInput(e.target.value)} 
                      className="premium-input" 
                      placeholder="e.g. Independence Day, Eid-ul-Fitr"
                      style={{ width: '100%', height: 42, padding: '0 12px' }}
                    />
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                    <label className="premium-label" style={{ fontSize: '0.75rem', fontWeight: 600 }}>Holiday Type</label>
                    <select 
                      value={holidayTypeInput} 
                      onChange={(e) => setHolidayTypeInput(e.target.value)} 
                      className="premium-input"
                      style={{ width: '100%', height: 42, padding: '0 12px' }}
                    >
                      <option value="Public Holiday">Public Holiday</option>
                      <option value="Company Holiday">Company Holiday</option>
                      <option value="Restricted Holiday">Restricted Holiday</option>
                    </select>
                  </div>
                </>
              ) : (
                <div style={{ padding: '16px', borderRadius: '12px', background: 'rgba(239, 68, 68, 0.04)', border: '1px solid rgba(239, 68, 68, 0.2)', fontSize: '0.85rem' }}>
                  <p style={{ margin: '0 0 6px 0', fontWeight: 'bold', color: '#EF4444' }}>Current Holiday: {selectedGridDay.holiday.name}</p>
                  <p style={{ margin: 0, color: 'var(--color-text-secondary)', fontSize: '0.75rem' }}>
                    Type: {selectedGridDay.holiday.type}
                  </p>
                </div>
              )}

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12, marginTop: 8 }}>
                <button 
                  type="button"
                  onClick={() => setSelectedGridDay(null)} 
                  className="premium-btn premium-btn-secondary"
                  style={{ padding: '10px 20px', flex: 1, justifyContent: 'center' }}
                >
                  Cancel
                </button>
                {selectedGridDay.holiday ? (
                  <button 
                    type="button"
                    onClick={() => handleRemoveHolidayDirectly(selectedGridDay.holiday.id)} 
                    className="premium-btn"
                    style={{ 
                      padding: '10px 24px', 
                      flex: 1, 
                      justifyContent: 'center',
                      background: '#EF4444',
                      color: 'white',
                      border: 'none',
                      borderRadius: '12px',
                      cursor: 'pointer',
                      fontWeight: 600
                    }}
                  >
                    Delete Holiday
                  </button>
                ) : (
                  <button 
                    type="submit" 
                    className="premium-btn premium-btn-primary"
                    style={{ padding: '10px 24px', flex: 1, justifyContent: 'center' }}
                  >
                    Save Holiday
                  </button>
                )}
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}

// Geofence helper functions
function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371e3; // Earth radius in meters
  const φ1 = lat1 * Math.PI/180;
  const φ2 = lat2 * Math.PI/180;
  const Δφ = (lat2-lat1) * Math.PI/180;
  const Δλ = (lon2-lon1) * Math.PI/180;

  const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
            Math.cos(φ1) * Math.cos(φ2) *
            Math.sin(Δλ/2) * Math.sin(Δλ/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

  return R * c; // in meters
}

function checkGeofence(companyDetails) {
  return new Promise((resolve, reject) => {
    if (!companyDetails || companyDetails.lat === null || companyDetails.lng === null || companyDetails.lat === undefined || companyDetails.lng === undefined) {
      resolve(true);
      return;
    }

    if (!navigator.geolocation) {
      reject(new Error("Geolocation is not supported by your browser. Geofencing is enabled, so you cannot mark attendance without location access."));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const distance = calculateDistance(
          pos.coords.latitude,
          pos.coords.longitude,
          companyDetails.lat,
          companyDetails.lng
        );
        const radiusLimit = companyDetails.radius || 500;
        if (distance <= radiusLimit) {
          resolve(true);
        } else {
          reject(new Error(`You are outside the permitted range. Your distance: ${Math.round(distance)}m, Allowed limit: ${radiusLimit}m.`));
        }
      },
      (err) => {
        reject(new Error("Unable to retrieve location: " + err.message + ". Location access is required to mark attendance."));
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  });
}
