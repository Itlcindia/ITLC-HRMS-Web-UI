import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  LayoutDashboard, Users, Clock, CalendarDays, ClipboardList, TrendingUp, 
  CreditCard, HardDrive, MessageSquare, FileText, Megaphone, Bell, 
  User, Settings as SettingsIcon, LogOut, CheckCircle2, XCircle, 
  AlertCircle, Plus, Calendar, Mail, Phone, ShieldCheck, MapPin, Eye, 
  UserCheck, ThumbsUp, AlertTriangle, Download, Info, Menu, Video, ChevronRight, Play,
  Trash2, UploadCloud
} from 'lucide-react';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer,
  BarChart, Bar
} from 'recharts';
import { api } from '../../services/api';
import { applyThemeColor } from '../../utils/theme';
import { Card, Button, Modal, Badge, Select, cn } from '../employee/UI';

const DEFAULT_DOCUMENTS = [
  {
    id: "profile-photo",
    name: "Profile Photo",
    type: "photo",
    status: "Uploaded",
    uploadedDate: "2026-06-01",
    fileType: "image/png",
    fileData: "DEFAULT_PHOTO",
    fileName: "profile_photo.png",
    canDelete: false,
    canReplace: true
  },
  {
    id: "aadhaar",
    name: "Aadhaar Card",
    type: "aadhaar",
    status: "Uploaded",
    uploadedDate: "2026-06-01",
    fileType: "image/jpeg",
    fileData: "DEFAULT_AADHAAR",
    fileName: "aadhaar_card.jpg",
    canDelete: false,
    canReplace: true
  },
  {
    id: "pan",
    name: "PAN Card",
    type: "pan",
    status: "Uploaded",
    uploadedDate: "2026-06-01",
    fileType: "image/jpeg",
    fileData: "DEFAULT_PAN",
    fileName: "pan_card.jpg",
    canDelete: false,
    canReplace: true
  },
  {
    id: "resume",
    name: "Resume / CV",
    type: "resume",
    status: "Uploaded",
    uploadedDate: "2026-06-05",
    fileType: "application/pdf",
    fileData: "DEFAULT_RESUME",
    fileName: "resume_cv.pdf",
    canDelete: true,
    canReplace: true
  },
  {
    id: "exp-letter",
    name: "Experience Letter",
    type: "exp-letter",
    status: "Not Uploaded",
    uploadedDate: "-",
    fileType: "-",
    fileData: null,
    fileName: null,
    canDelete: true,
    canReplace: true
  },
  {
    id: "bank-cheque",
    name: "Bank Passbook / Cancelled Cheque",
    type: "bank-cheque",
    status: "Uploaded",
    uploadedDate: "2026-06-02",
    fileType: "image/png",
    fileData: "DEFAULT_CHEQUE",
    fileName: "cancelled_cheque.png",
    canDelete: true,
    canReplace: true
  },
  {
    id: "offer-letter",
    name: "Offer Letter",
    type: "offer-letter",
    status: "Uploaded",
    uploadedDate: "2026-05-15",
    fileType: "application/pdf",
    fileData: "DEFAULT_OFFER",
    fileName: "offer_letter.pdf",
    canDelete: false,
    canReplace: false
  },
  {
    id: "appointment-letter",
    name: "Appointment Letter",
    type: "appointment-letter",
    status: "Uploaded",
    uploadedDate: "2026-05-20",
    fileType: "application/pdf",
    fileData: "DEFAULT_APPOINTMENT",
    fileName: "appointment_letter.pdf",
    canDelete: false,
    canReplace: false
  }
];

const compressImage = (base64Str, maxWidth = 800, maxHeight = 800) => {
  return new Promise((resolve) => {
    if (!base64Str || !base64Str.startsWith('data:image/')) {
      resolve(base64Str);
      return;
    }
    const img = new Image();
    img.src = base64Str;
    img.onload = () => {
      const canvas = document.createElement('canvas');
      let width = img.width;
      let height = img.height;

      if (width > height) {
        if (width > maxWidth) {
          height = Math.round((height * maxWidth) / width);
          width = maxWidth;
        }
      } else {
        if (height > maxHeight) {
          width = Math.round((width * maxHeight) / height);
          height = maxHeight;
        }
      }

      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL('image/jpeg', 0.6));
      } else {
        resolve(base64Str);
      }
    };
  });
};

export default function ManagerApp({ onLogout }) {
  const [activeTab, setActiveTab] = useState('attendance');
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      const isMob = window.innerWidth < 768;
      setIsMobile(isMob);
      if (isMob && !['attendance', 'profile', 'payroll', 'dashboard', 'team', 'leaves', 'tasks', 'performance', 'expenses', 'assets', 'meetings', 'announcements'].includes(activeTab)) {
        setActiveTab('attendance');
      }
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [activeTab]);

  const [managerProfile, setManagerProfile] = useState(null);

  const modulesEnabled = React.useMemo(() => {
    if (managerProfile?.companyDetails?.modulesEnabled) {
      try {
        const parsed = typeof managerProfile.companyDetails.modulesEnabled === 'string'
          ? JSON.parse(managerProfile.companyDetails.modulesEnabled)
          : managerProfile.companyDetails.modulesEnabled;
        return parsed;
      } catch (e) {
        console.error("Failed to parse company modulesEnabled:", e);
      }
    }
    return null;
  }, [managerProfile?.companyDetails]);

  // Guard active tab if disabled by admin configuration
  useEffect(() => {
    if (modulesEnabled) {
      const mapping = {
        dashboard: 'dashboard',
        attendance: 'attendance',
        leaves: 'leave',
        payroll: 'payroll',
        expenses: 'payroll',
        assets: 'assets'
      };

      const configKey = mapping[activeTab];
      if (configKey !== undefined && modulesEnabled[configKey] === false) {
        const order = ['dashboard', 'team', 'attendance', 'leaves', 'tasks', 'performance', 'expenses', 'assets', 'meetings', 'reports', 'announcements', 'profile', 'payroll', 'settings'];
        const fallback = order.find(tab => {
          const key = mapping[tab];
          return key === undefined || modulesEnabled[key] !== false;
        });
        if (fallback) {
          setActiveTab(fallback);
        }
      }
    }
  }, [modulesEnabled, activeTab]);
  const [documentsVault, setDocumentsVault] = useState([]);
  const [uploadingDocId, setUploadingDocId] = useState(null);
  const [expandedDocId, setExpandedDocId] = useState(null);
  const [previewDoc, setPreviewDoc] = useState(null);
  const [activeDocUploadId, setActiveDocUploadId] = useState(null);
  const docFileInputRef = React.useRef(null);
  
  // Direct reports & dashboard arrays
  const [teamMembers, setTeamMembers] = useState([]);
  const [leaves, setLeaves] = useState([]);
  const [attendance, setAttendance] = useState([]);
  const [corrections, setCorrections] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [performance, setPerformance] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [assets, setAssets] = useState([]);
  const [meetings, setMeetings] = useState([]);
  const [announcements, setAnnouncements] = useState([]);
  
  // Manager personal attendance states
  const [ownLogs, setOwnLogs] = useState([]);
  const [myPayslips, setMyPayslips] = useState([]);
  const [punchedIn, setPunchedIn] = useState(false);
  const [punchTime, setPunchTime] = useState(null);
  const [workDuration, setWorkDuration] = useState('00:00:00');
  const [attSubTab, setAttSubTab] = useState('my-attendance'); // 'my-attendance', 'team-logs', 'corrections'

  const [loading, setLoading] = useState(true);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  // Search & filters states
  const [teamSearch, setTeamSearch] = useState('');
  const [teamDeptFilter, setTeamDeptFilter] = useState('All');
  const [teamSort, setTeamSort] = useState('name');
  
  // Detail views & Modals
  const [selectedEmpProfile, setSelectedEmpProfile] = useState(null);
  const [selectedLeaveDetails, setSelectedLeaveDetails] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [activeTaskView, setActiveTaskView] = useState('kanban'); // 'kanban' | 'table'
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [showMeetingModal, setShowMeetingModal] = useState(false);
  const [showAnnouncementModal, setShowAnnouncementModal] = useState(false);
  const [showPerfModal, setShowPerfModal] = useState(false);
  const [previewImageUrl, setPreviewImageUrl] = useState(null);

  // Asset allocation states
  const [showAssetModal, setShowAssetModal] = useState(false);
  const [newAssetEmpId, setNewAssetEmpId] = useState('');
  const [newAssetName, setNewAssetName] = useState('');
  const [newAssetType, setNewAssetType] = useState('Laptop');
  const [newAssetSerial, setNewAssetSerial] = useState('');
  const [newAssetComment, setNewAssetComment] = useState('');

  // New Forms values
  const [newTask, setNewTask] = useState({ title: '', description: '', assignedTo: '', priority: 'Medium', deadline: '' });
  const [newMeeting, setNewMeeting] = useState({ title: '', agenda: '', date: '', time: '', platform: 'Google Meet', link: '', invitees: [] });
  const [newAnnouncement, setNewAnnouncement] = useState({ title: '', content: '', type: 'Announcement', sendEmail: false, sendPush: false });
  const [newPerf, setNewPerf] = useState({ employeeId: '', employeeName: '', reviewPeriod: 'June 2026', rating: 5, goals: '', kpis: '', promotionRecommendation: '', appreciation: '', warning: '' });

  // Load live data
  const loadLiveManagerPortal = async () => {
    const safeFetch = async (apiCall, fallback) => {
      try {
        return await apiCall();
      } catch (err) {
        console.warn("Failed fetching from api:", err);
        return fallback;
      }
    };

    try {
      const [profile, team, leaveList, attList, corrList, taskList, perfList, expList, assetList, meetList, annList, personalData, payrollList] = await Promise.all([
        safeFetch(() => api.getProfile(), null),
        safeFetch(() => api.getManagerTeam(), []),
        safeFetch(() => api.getManagerLeaves(), []),
        safeFetch(() => api.getManagerTeamAttendance(), []),
        safeFetch(() => api.getManagerCorrections(), []),
        safeFetch(() => api.getManagerTasks(), []),
        safeFetch(() => api.getManagerPerformance(), []),
        safeFetch(() => api.getManagerExpenses(), []),
        safeFetch(() => api.getManagerAssets(), []),
        safeFetch(() => api.getManagerMeetings(), []),
        safeFetch(() => api.getManagerAnnouncements(), []),
        safeFetch(() => api.getEmployeeAttendance(), []),
        safeFetch(() => api.getEmployeePayroll(), [])
      ]);

      if (profile) {
        setManagerProfile(profile);
        setDocumentsVault(profile.documents && profile.documents.length > 0 ? profile.documents : DEFAULT_DOCUMENTS);
        if (profile.companyDetails && profile.companyDetails.themeColor) {
          applyThemeColor(profile.companyDetails.themeColor);
        }
      }
      setTeamMembers(team || []);
      setLeaves(leaveList || []);
      setAttendance(attList || []);
      setCorrections(corrList || []);
      setTasks(taskList || []);
      setPerformance(perfList || []);
      setExpenses(expList || []);
      setAssets(assetList || []);
      setMeetings(meetList || []);
      setAnnouncements(annList || []);
      setOwnLogs(personalData || []);
      
      if (Array.isArray(payrollList)) {
        const mappedPayslips = payrollList.map((p) => ({
          id: p.id.toString(),
          month: p.month,
          year: p.year,
          grossSalary: (p.basic || 0) + (p.hra || 0) + (p.allowances || 0),
          deductions: p.deductions || 0,
          netSalary: p.netSalary || 0,
          bonus: 0,
          reimbursement: 0,
          taxDeduction: 0
        }));
        setMyPayslips(mappedPayslips);
      }
    } catch (err) {
      console.error("Critical error in loadLiveManagerPortal:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLiveManagerPortal();
    const interval = setInterval(loadLiveManagerPortal, 8000);
    return () => clearInterval(interval);
  }, []);

  const triggerDocUploadPicker = (docId) => {
    setActiveDocUploadId(docId);
    setTimeout(() => {
      docFileInputRef.current?.click();
    }, 50);
  };

  const processUploadedFile = (docId, file) => {
    const isValidType = file.type.startsWith("image/") || file.type === "application/pdf" || file.name.endsWith(".pdf") || file.name.endsWith(".jpg") || file.name.endsWith(".jpeg") || file.name.endsWith(".png");
    if (!isValidType) {
      alert("Invalid file format. Please upload an image (PNG, JPEG, JPG) or PDF file.");
      return;
    }

    setUploadingDocId(docId);

    setTimeout(() => {
      const reader = new FileReader();
      reader.onloadend = async () => {
        if (typeof reader.result === "string") {
          try {
            const compressed = await compressImage(reader.result);
            const todayStr = new Date().toISOString().split("T")[0];
            const updated = documentsVault.map((doc) => {
              if (doc.id === docId) {
                return {
                  ...doc,
                  status: "Uploaded",
                  uploadedDate: todayStr,
                  fileType: file.type.startsWith("image/") ? "image/jpeg" : file.type || (file.name.endsWith(".pdf") ? "application/pdf" : "image/jpeg"),
                  fileData: compressed,
                  fileName: file.name,
                };
              }
              return doc;
            });
            
            setDocumentsVault(updated);
            await api.updateProfile({ documents: updated });
            setManagerProfile(prev => ({ ...prev, documents: updated }));
            alert('Document uploaded successfully!');
          } catch (err) {
            alert('Upload failed: ' + err.message);
          }
        }
        setUploadingDocId(null);
      };
      reader.readAsDataURL(file);
    }, 1000);
  };

  const handleDocFilePickerChange = (e) => {
    const file = e.target.files?.[0];
    if (file && activeDocUploadId) {
      processUploadedFile(activeDocUploadId, file);
    }
    setActiveDocUploadId(null);
  };

  const handleDeleteDoc = async (docId) => {
    if (window.confirm("Are you sure you want to delete this document from your vault?")) {
      const updated = documentsVault.map((doc) => {
        if (doc.id === docId) {
          return {
            ...doc,
            status: "Not Uploaded",
            uploadedDate: "-",
            fileType: "-",
            fileData: null,
            fileName: null,
          };
        }
        return doc;
      });
      try {
        setDocumentsVault(updated);
        await api.updateProfile({ documents: updated });
        setManagerProfile(prev => ({ ...prev, documents: updated }));
        alert('Document deleted successfully!');
      } catch (err) {
        alert('Deletion failed: ' + err.message);
      }
    }
  };

  const todayDate = new Date().toISOString().split('T')[0];
  const todayOwnRecord = ownLogs.find(r => r.date === todayDate);

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

  const handlePunch = async () => {
    if (managerProfile?.companyDetails) {
      try {
        await checkGeofence(managerProfile.companyDetails);
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

  useEffect(() => {
    if (loading) return;
    const notifs = [];
    
    // 1. Pending leaves
    leaves.filter(l => l.status === 'Pending' && l.managerStatus === 'Pending').forEach(l => {
      notifs.push({
        id: `leave_${l.id}`,
        title: 'New Leave Request',
        message: `${l.employeeName} requested leave for ${l.totalDays} days.`,
        time: 'Pending review',
        read: false
      });
    });

    // 2. Pending corrections
    corrections.filter(c => c.status === 'Pending').forEach(c => {
      notifs.push({
        id: `corr_${c.id}`,
        title: 'Correction/Overtime Log',
        message: `${c.employeeName} requested correction for ${c.date}.`,
        time: 'Pending review',
        read: false
      });
    });

    // 3. Blocked tasks
    tasks.filter(t => t.status === 'Blocked').forEach(t => {
      notifs.push({
        id: `task_${t.id}`,
        title: 'Task Blocked',
        message: `Task ${t.id} assigned to ${t.assignedToName} is blocked.`,
        time: 'Attention',
        read: false
      });
    });

    setNotifications(notifs);
  }, [leaves, corrections, tasks, loading]);

  // ----------------------------------------------------------------------
  // HANDLERS & ACTIONS
  // ----------------------------------------------------------------------

  const handleLeaveRecommendation = async (id, status, comment) => {
    try {
      await api.updateManagerLeaveRecommendation(id, status, comment);
      setLeaves(leaves.map(l => l.id === id ? { ...l, managerStatus: status, managerComment: comment } : l));
      alert(`Recommendation '${status}' submitted successfully.`);
    } catch (err) {
      alert(err.message || 'Failed to submit recommendation');
    }
  };

  const handleCorrectionRequest = async (id, status, comment) => {
    try {
      await api.updateManagerCorrection(id, status, comment);
      setCorrections(corrections.map(c => c.id === id ? { ...c, status, managerComment: comment } : c));
      alert(`Attendance request status updated to '${status}'`);
      loadLiveManagerPortal();
    } catch (err) {
      alert(err.message || 'Failed to process request');
    }
  };

  const handleExpenseRequest = async (id, status) => {
    try {
      await api.updateManagerExpense(id, status);
      setExpenses(expenses.map(e => e.id === id ? { ...e, status } : e));
      alert(`Expense claim successfully ${status.toLowerCase()}.`);
    } catch (err) {
      alert(err.message || 'Failed to process expense');
    }
  };

  const handleAssetRequest = async (id, status, comment) => {
    try {
      await api.updateManagerAsset(id, { status, actionComment: comment });
      setAssets(assets.map(a => a.id === id ? { ...a, status, actionComment: comment } : a));
      alert(`Asset request ${status.toLowerCase()} successfully.`);
    } catch (err) {
      alert(err.message || 'Failed to update asset');
    }
  };

  const handleAllocateAsset = async (e) => {
    e.preventDefault();
    const empId = newAssetEmpId || teamMembers[0]?.id;
    if (!empId) {
      alert("No team member selected");
      return;
    }
    const emp = teamMembers.find(t => t.id === empId);
    if (!emp) return;

    try {
      const created = await api.createManagerAsset({
        employeeId: emp.id,
        employeeName: emp.name,
        assetName: newAssetName,
        assetType: newAssetType,
        serialNumber: newAssetSerial,
        requestComment: newAssetComment
      });
      setAssets([created, ...assets]);
      alert("Asset allocated successfully!");
      setShowAssetModal(false);
      setNewAssetName('');
      setNewAssetSerial('');
      setNewAssetComment('');
    } catch (err) {
      alert(err.message || "Failed to allocate asset");
    }
  };

  const handleCreateTaskSubmit = async (e) => {
    e.preventDefault();
    if (!newTask.title || !newTask.assignedTo) return;
    const selectedEmp = teamMembers.find(t => t.id === newTask.assignedTo);
    try {
      const created = await api.createManagerTask({
        assignedTo: newTask.assignedTo,
        assignedToName: selectedEmp ? selectedEmp.name : 'Unknown',
        title: newTask.title,
        description: newTask.description,
        priority: newTask.priority,
        deadline: newTask.deadline
      });
      setTasks([...tasks, created]);
      setShowTaskModal(false);
      setNewTask({ title: '', description: '', assignedTo: '', priority: 'Medium', deadline: '' });
      alert('Task successfully assigned to team member.');
    } catch (err) {
      alert(err.message || 'Failed to create task');
    }
  };

  const handleTaskStatusChange = async (id, status) => {
    try {
      await api.updateManagerTask(id, { status });
      setTasks(tasks.map(t => t.id === id ? { ...t, status } : t));
    } catch (err) {
      alert(err.message || 'Failed to change task status');
    }
  };

  const handleCreateMeetingSubmit = async (e) => {
    e.preventDefault();
    try {
      const created = await api.createManagerMeeting(newMeeting);
      setMeetings([...meetings, created]);
      setShowMeetingModal(false);
      setNewMeeting({ title: '', agenda: '', date: '', time: '', platform: 'Google Meet', link: '', invitees: [] });
      alert('Meeting scheduled successfully.');
    } catch (err) {
      alert(err.message || 'Failed to schedule meeting');
    }
  };

  const handleCreateAnnouncementSubmit = async (e) => {
    e.preventDefault();
    try {
      const created = await api.createManagerAnnouncement(newAnnouncement);
      setAnnouncements([...announcements, created]);
      setShowAnnouncementModal(false);
      setNewAnnouncement({ title: '', content: '', type: 'Announcement', sendEmail: false, sendPush: false });
      alert('Announcement successfully posted.');
    } catch (err) {
      alert(err.message || 'Failed to post announcement');
    }
  };

  const handleCreatePerformanceSubmit = async (e) => {
    e.preventDefault();
    const selectedEmp = teamMembers.find(t => t.id === newPerf.employeeId);
    try {
      const created = await api.saveManagerPerformance({
        ...newPerf,
        employeeName: selectedEmp ? selectedEmp.name : 'Staff Member'
      });
      setPerformance([...performance.filter(p => !(p.employeeId === newPerf.employeeId && p.reviewPeriod === newPerf.reviewPeriod)), created]);
      setShowPerfModal(false);
      setNewPerf({ employeeId: '', employeeName: '', reviewPeriod: 'June 2026', rating: 5, goals: '', kpis: '', promotionRecommendation: '', appreciation: '', warning: '' });
      alert('Performance review saved successfully.');
    } catch (err) {
      alert(err.message || 'Failed to save review');
    }
  };

  // ----------------------------------------------------------------------
  // KPI CALCULATIONS
  // ----------------------------------------------------------------------
  const totalTeam = teamMembers.length;
  const todayStr = new Date().toISOString().split('T')[0];
  const presentToday = attendance.filter(a => a.date === todayStr && (a.status === 'Present' || a.status === 'Late')).length;
  const lateToday = attendance.filter(a => a.date === todayStr && a.status === 'Late').length;
  const leaveToday = leaves.filter(l => {
    const today = new Date(todayStr);
    return l.status === 'Approved' && today >= new Date(l.fromDate) && today <= new Date(l.toDate);
  }).length;
  const wfhToday = attendance.filter(a => a.date === todayStr && a.status === 'WFH').length;
  const absentToday = totalTeam - presentToday - leaveToday - wfhToday;

  const pendingLeavesCount = leaves.filter(l => l.status === 'Pending' && l.managerStatus === 'Pending').length;
  const pendingCorrCount = corrections.filter(c => c.status === 'Pending').length;
  const pendingClaimsCount = expenses.filter(e => e.status === 'Pending').length;

  const attendanceTrendData = [
    { name: 'Mon', Present: Math.max(3, presentToday - 1), Late: 1 },
    { name: 'Tue', Present: Math.max(4, presentToday), Late: 0 },
    { name: 'Wed', Present: Math.max(2, presentToday + 1), Late: 2 },
    { name: 'Thu', Present: Math.max(3, presentToday - 2), Late: 1 },
    { name: 'Fri', Present: presentToday, Late: lateToday }
  ];

  const exportToCSV = (data, filename) => {
    if (!data.length) return;
    const headers = Object.keys(data[0]).join(',');
    const rows = data.map(row => 
      Object.values(row).map(val => `"${String(val).replace(/"/g, '""')}"`).join(',')
    );
    const csvContent = "data:text/csv;charset=utf-8," + [headers, ...rows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `${filename}_${todayStr}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
        fontFamily: 'system-ui, -apple-system, sans-serif'
      }}>
        <div style={{
          width: 50,
          height: 50,
          border: '4px solid #e2e8f0',
          borderTop: '4px solid var(--color-primary, #4f46e5)',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite',
          marginBottom: 16
        }} />
        <span style={{ fontSize: '0.9rem', color: '#64748b', fontWeight: 500 }}>
          Loading workspace...
        </span>
        <style dangerouslySetInnerHTML={{__html: `
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}} />
      </div>
    );
  }

  return (
    <div className="flex h-screen overflow-hidden bg-background text-foreground relative">
      
      {/* Mobile Drawer Overlay */}
      {mobileSidebarOpen && (
        <div 
          className="fixed inset-0 bg-slate-950/60 z-40 md:hidden"
          onClick={() => setMobileSidebarOpen(false)}
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 40
          }}
        />
      )}

      {/* SIDEBAR NAVIGATION - Styled like other panels with Card/Sidebar structure */}
      <aside 
        className={cn(
          "top-0 bottom-0 left-0 h-screen bg-card border-r border-border flex flex-col transition-all duration-300 shrink-0 w-64",
          mobileSidebarOpen 
            ? "fixed z-50 translate-x-0" 
            : "hidden md:flex md:sticky md:z-30 md:translate-x-0"
        )}
        style={mobileSidebarOpen ? { zIndex: 50 } : undefined}
      >
        {/* Brand Header */}
        <div className="h-16 flex items-center gap-3 px-4 border-b border-border select-none">
          <div className="p-1 rounded-lg bg-primary/5 text-primary flex items-center justify-center shrink-0 w-9 h-9 overflow-hidden">
            {managerProfile?.companyLogo && (managerProfile.companyLogo.startsWith('data:image/') || managerProfile.companyLogo.startsWith('http://') || managerProfile.companyLogo.startsWith('https://')) ? (
              <img src={managerProfile.companyLogo} alt="Logo" className="w-full h-full object-contain" />
            ) : (
              <ShieldCheck className="h-5 w-5" />
            )}
          </div>
          <div className="flex flex-col">
            <span className="font-bold text-foreground leading-none text-base tracking-wide">{managerProfile?.companyName || "ITLC HRMS"}</span>
            <span className="text-[10px] text-muted-foreground mt-0.5 font-extrabold uppercase">Manager Portal</span>
          </div>
        </div>

        {/* Navigation Menu */}
        <nav className="flex-1 py-4 overflow-y-auto px-2 space-y-1 scrollbar-none">
          {[
            { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
            { id: 'team', label: 'Team Directory', icon: Users },
            { id: 'attendance', label: 'Attendance Approvals', icon: Clock, badge: pendingCorrCount },
            { id: 'leaves', label: 'Leave Management', icon: CalendarDays, badge: pendingLeavesCount },
            { id: 'tasks', label: 'Task Management', icon: ClipboardList },
            { id: 'performance', label: 'Performance Review', icon: TrendingUp },
            { id: 'expenses', label: 'Expense Claims', icon: CreditCard, badge: pendingClaimsCount },
            { id: 'assets', label: 'Assigned Assets', icon: HardDrive },
            { id: 'meetings', label: 'Meetings Scheduler', icon: Video },
            { id: 'reports', label: 'Data Reports', icon: FileText },
            { id: 'announcements', label: 'Announcements', icon: Megaphone },
            { id: 'profile', label: 'Manager Profile', icon: User },
            { id: 'payroll', label: 'My Payslips', icon: CreditCard },
            { id: 'settings', label: 'Settings', icon: SettingsIcon },
          ].filter(item => {
            const isTabMobileOk = !isMobile || ['attendance', 'profile', 'payroll', 'dashboard', 'team', 'leaves', 'tasks', 'performance', 'expenses', 'assets', 'meetings', 'announcements', 'reports', 'settings'].includes(item.id);
            if (!isTabMobileOk) return false;
            if (!modulesEnabled) return true;
            const mapping = {
              dashboard: 'dashboard',
              attendance: 'attendance',
              leaves: 'leave',
              payroll: 'payroll',
              expenses: 'payroll',
              assets: 'assets'
            };
            const configKey = mapping[item.id];
            if (configKey !== undefined && modulesEnabled[configKey] === false) {
              return false;
            }
            return true;
          }).map(item => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  setActiveTab(item.id);
                  setMobileSidebarOpen(false);
                }}
                className={cn(
                  "w-full flex items-center gap-3 px-3 py-2 text-sm font-semibold rounded-lg transition-colors cursor-pointer text-left",
                  isActive 
                    ? "bg-primary/10 text-primary" 
                    : "text-muted-foreground hover:bg-secondary/50 hover:text-foreground"
                )}
              >
                <item.icon className="h-5 w-5" />
                <span className="flex-1">{item.label}</span>
                {item.badge > 0 && (
                  <Badge variant="warning" className="px-1.5 py-0.5 text-[9px] rounded-md font-extrabold">
                    {item.badge}
                  </Badge>
                )}
              </button>
            );
          })}
        </nav>

        {/* Footer Sign Out */}
        <div className="p-4 border-t border-border">
          <button 
            onClick={onLogout}
            className="w-full flex items-center gap-3 px-3 py-2 text-sm font-bold rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-600 dark:text-rose-450 transition-colors cursor-pointer text-left"
          >
            <LogOut className="h-5 w-5" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* MAIN CONTENT WRAPPER */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        
        {/* TOP NAVBAR */}
        <header className="h-16 flex items-center justify-between px-4 md:px-6 border-b border-border bg-card print:hidden">
          <button 
            onClick={() => setMobileSidebarOpen(true)}
            className="md:hidden p-1.5 rounded-lg hover:bg-secondary text-foreground cursor-pointer"
          >
            <Menu className="h-5 w-5" />
          </button>

          <div className="flex items-center gap-3 ml-auto relative">
            {/* Bell Dropdown */}
            <div className="relative">
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className="relative p-2 rounded-xl border border-border hover:bg-secondary text-foreground cursor-pointer flex items-center justify-center bg-card transition-all"
              >
                <Bell size={16} />
                {notifications.length > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-danger rounded-full border border-card" />
                )}
              </button>

              <AnimatePresence>
                {showNotifications && (
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    className="absolute right-0 mt-2 w-80 bg-card rounded-2xl border border-border shadow-xl p-4 z-50 space-y-3"
                  >
                    <div className="flex justify-between items-center pb-2 border-b border-border">
                      <span className="text-xs font-bold text-foreground">Manager Alerts ({notifications.length})</span>
                      <button onClick={() => setShowNotifications(false)} className="text-[10px] text-muted-foreground hover:text-foreground font-bold">Close</button>
                    </div>

                    <div className="max-h-60 overflow-y-auto space-y-2.5 pr-1 select-none">
                      {notifications.length === 0 ? (
                        <div className="text-center py-6 text-xs text-muted-foreground">
                          All caught up! No alerts.
                        </div>
                      ) : (
                        notifications.map(n => (
                          <div key={n.id} className="p-2.5 rounded-xl bg-secondary/15 border border-border/40 text-left text-[10px] space-y-1">
                            <div className="font-bold text-foreground flex justify-between">
                              <span>{n.title}</span>
                              <span className="text-[8px] font-mono text-primary uppercase">{n.time}</span>
                            </div>
                            <p className="text-muted-foreground leading-normal">{n.message}</p>
                          </div>
                        ))
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-primary/10 text-primary border border-primary/20 overflow-hidden flex items-center justify-center">
                {managerProfile?.avatar ? (
                  <img src={managerProfile.avatar} alt="Avatar" className="w-full h-full object-cover" />
                ) : (
                  <span className="text-xs font-bold uppercase">{managerProfile?.name ? managerProfile.name[0] : 'M'}</span>
                )}
              </div>
              <div className="text-[10px] font-bold bg-primary/10 text-primary border border-primary/20 px-3 py-1.5 rounded-xl uppercase tracking-wider select-none hidden sm:block">
                Welcome, <strong className="font-extrabold">{managerProfile?.name || 'Manager'}</strong>
              </div>
            </div>
          </div>
        </header>

        {/* MODULE CONTAINER VIEW */}
        <main className="flex-1 overflow-y-auto px-4 md:px-6 py-4 md:py-6 space-y-6 scrollbar-none">
          {loading ? (
            <div className="flex items-center justify-center h-full text-sm text-muted-foreground">
              Syncing Live database records...
            </div>
          ) : (
            <AnimatePresence mode="wait">
              
              {/* ------------------------------------------------------------------
                  TAB: DASHBOARD
                  ------------------------------------------------------------------ */}
              {activeTab === 'dashboard' && (
                <motion.div
                  key="dashboard"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="space-y-6"
                >
                  {/* KPI Cards Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {[
                      { title: 'Total Team Members', value: totalTeam, variant: 'info' },
                      { title: 'Present Today', value: presentToday, variant: 'success' },
                      { title: 'Absent Today', value: absentToday, variant: 'danger' },
                      { title: 'On Leave Today', value: leaveToday, variant: 'warning' },
                      { title: 'Work From Home', value: wfhToday, variant: 'info' },
                      { title: 'Late Employees', value: lateToday, variant: 'danger' },
                      { title: 'Pending Leaves', value: pendingLeavesCount, variant: 'warning' },
                      { title: 'Pending Attendance', value: pendingCorrCount, variant: 'info' },
                    ].map((kpi, idx) => (
                      <Card key={idx} className="p-4 flex flex-col gap-1 hover:border-primary/25 transition-all">
                        <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">{kpi.title}</span>
                        <h4 className="text-xl font-black text-foreground mt-1 font-mono">{kpi.value}</h4>
                      </Card>
                    ))}
                  </div>

                  {/* Charts Grid */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <Card className="p-5 space-y-3">
                      <h3 className="text-sm font-extrabold text-foreground uppercase tracking-wider">Daily Attendance Trend</h3>
                      <div className="w-full h-48">
                        <ResponsiveContainer>
                          <AreaChart data={attendanceTrendData}>
                            <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                            <XAxis dataKey="name" stroke="var(--color-text-muted)" fontSize={12} />
                            <YAxis stroke="var(--color-text-muted)" fontSize={12} />
                            <RechartsTooltip />
                            <Area type="monotone" dataKey="Present" stroke="var(--color-primary)" fill="rgba(79, 70, 229, 0.1)" />
                          </AreaChart>
                        </ResponsiveContainer>
                      </div>
                    </Card>

                    <Card className="p-5 space-y-3">
                      <h3 className="text-sm font-extrabold text-foreground uppercase tracking-wider">Team Task Statuses</h3>
                      <div className="w-full h-48">
                        <ResponsiveContainer>
                          <BarChart data={[
                            { name: 'Todo', count: tasks.filter(t => t.status === 'Todo').length },
                            { name: 'In Progress', count: tasks.filter(t => t.status === 'In Progress').length },
                            { name: 'Completed', count: tasks.filter(t => t.status === 'Completed').length },
                            { name: 'Blocked', count: tasks.filter(t => t.status === 'Blocked').length }
                          ]}>
                            <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                            <XAxis dataKey="name" stroke="var(--color-text-muted)" fontSize={12} />
                            <YAxis stroke="var(--color-text-muted)" fontSize={12} />
                            <RechartsTooltip />
                            <Bar dataKey="count" fill="var(--color-primary)" radius={[4, 4, 0, 0]} />
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    </Card>
                  </div>

                  {/* Quick Actions Panel */}
                  <Card className="p-5 space-y-4">
                    <h3 className="text-sm font-extrabold text-foreground uppercase tracking-wider">Quick Actions Panel</h3>
                    <div className="flex gap-3 flex-wrap">
                      <Button size="sm" variant="primary" onClick={() => { setActiveTab('tasks'); setShowTaskModal(true); }}>
                        <Plus className="h-5 w-5" /> Assign Task
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => { setActiveTab('meetings'); setShowMeetingModal(true); }}>
                        <Calendar className="h-5 w-5" /> Schedule Meeting
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => { setActiveTab('announcements'); setShowAnnouncementModal(true); }}>
                        <Megaphone className="h-5 w-5" /> Post Announcement
                      </Button>
                    </div>
                  </Card>
                </motion.div>
              )}

              {/* ------------------------------------------------------------------
                  TAB: TEAM DIRECTORY
                  ------------------------------------------------------------------ */}
              {activeTab === 'team' && (
                <motion.div
                  key="team"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="space-y-6"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <h3 className="text-base font-extrabold text-foreground uppercase tracking-wider">Direct Reports Directory</h3>
                      <p className="text-[11px] text-muted-foreground mt-0.5">View and manage assigned direct reporting employees</p>
                    </div>

                    <div className="flex gap-2">
                      <input 
                        type="text" 
                        placeholder="Search team member..." 
                        value={teamSearch} 
                        onChange={(e) => setTeamSearch(e.target.value)} 
                        className="px-3 py-1.5 text-sm rounded-lg border border-border bg-secondary/50 text-foreground focus:outline-none focus:border-primary"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {teamMembers
                      .filter(m => m.name.toLowerCase().includes(teamSearch.toLowerCase()))
                      .map(emp => (
                        <Card key={emp.id} className="p-5 flex flex-col gap-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-extrabold text-base uppercase">
                              {emp.name[0]}
                            </div>
                            <div>
                              <h4 className="text-sm font-bold text-foreground">{emp.name}</h4>
                              <span className="text-[10px] text-muted-foreground block">{emp.designation} - {emp.department}</span>
                            </div>
                          </div>

                          <div className="text-[11px] space-y-1.5 border-t border-border/60 pt-3 text-muted-foreground">
                            <div className="flex justify-between">
                              <span>Emp ID:</span>
                              <strong className="text-foreground font-mono">{emp.id}</strong>
                            </div>
                            <div className="flex justify-between">
                              <span>Email:</span>
                              <strong className="text-foreground">{emp.email}</strong>
                            </div>
                            <div className="flex justify-between">
                              <span>Phone:</span>
                              <strong className="text-foreground">{emp.phone || 'N/A'}</strong>
                            </div>
                            <div className="flex justify-between">
                              <span>Status:</span>
                              <Badge variant={emp.status === 'Active' ? 'success' : 'warning'}>{emp.status}</Badge>
                            </div>
                          </div>
                        </Card>
                      ))}
                  </div>
                </motion.div>
              )}

              {/* ------------------------------------------------------------------
                  TAB: ATTENDANCE
                  ------------------------------------------------------------------ */}
              {activeTab === 'attendance' && (
                <motion.div
                  key="attendance"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="space-y-6 animate-fadeIn"
                >
                  {/* Header SubTabs navigation */}
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start sm:items-center gap-4 pb-2 border-b border-border">
                    <div>
                      <h3 className="text-base font-extrabold text-foreground uppercase tracking-wider">Attendance Console</h3>
                      <p className="text-[11px] text-muted-foreground mt-0.5">Manage personal logins and team check-in requests</p>
                    </div>
                    
                    <div className="flex bg-secondary/50 p-0.5 rounded-lg border border-border space-x-1 shrink-0 overflow-x-auto max-w-full scrollbar-none">
                      {[
                        { id: 'my-attendance', label: 'My Attendance' },
                        { id: 'team-logs', label: 'Team Logs' },
                        { id: 'corrections', label: 'Correction Requests' }
                      ].map(tab => (
                        <button
                          key={tab.id}
                          onClick={() => setAttSubTab(tab.id)}
                          className={cn(
                            "px-3 py-1.5 rounded-md text-xs font-semibold whitespace-nowrap cursor-pointer transition-all",
                            attSubTab === tab.id
                              ? "bg-card text-foreground shadow-xs font-bold"
                              : "text-muted-foreground hover:text-foreground"
                          )}
                        >
                          {tab.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* 1. MY ATTENDANCE TAB */}
                  {attSubTab === 'my-attendance' && (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fadeIn">
                      {/* Punch Card */}
                      <Card className="lg:col-span-2 flex flex-col justify-between p-6 space-y-6 bg-card border border-border">
                        <div className="flex justify-between items-start">
                          <div>
                            <h4 className="text-sm font-bold text-foreground">Punch In / Out Control</h4>
                            <p className="text-[11px] text-muted-foreground mt-0.5">Register daily shift entries below</p>
                          </div>
                          <Badge variant={punchedIn ? "success" : "neutral"} className="text-[10px]">
                            {punchedIn ? "Shift In Progress" : todayOwnRecord ? "Shift Completed" : "Checked Out"}
                          </Badge>
                        </div>

                        <div className="flex flex-col items-center justify-center py-6 gap-4 text-center">
                          <div className={cn(
                            "w-14 h-14 rounded-full flex items-center justify-center transition-all",
                            punchedIn ? "bg-emerald-500/10 text-emerald-500 border border-emerald-500/20" : "bg-primary/10 text-primary border border-primary/20"
                          )}>
                            <Clock size={28} />
                          </div>

                          <div>
                            <h3 className="text-sm font-extrabold text-foreground">
                              {punchedIn ? 'You are Clocked In' : todayOwnRecord ? 'Shift Completed' : 'Not Clocked In'}
                            </h3>
                            <p className="text-[11px] text-muted-foreground mt-1">
                              {punchedIn ? `Punched in: ${punchTime?.toLocaleTimeString()}` : todayOwnRecord ? `Shift In: ${todayOwnRecord.checkIn} | Out: ${todayOwnRecord.checkOut}` : 'Ready to begin your workday?'}
                            </p>
                          </div>

                          {(punchedIn || todayOwnRecord) && (
                            <div className="text-3xl font-extrabold text-foreground font-mono mt-2 tracking-tight">
                              {punchedIn ? workDuration : todayOwnRecord?.workHours}
                            </div>
                          )}
                        </div>

                        <div className="w-full">
                          <Button
                            onClick={handlePunch}
                            icon={punchedIn ? <LogOut className="h-4.5 w-4.5 text-white" /> : <Play className="h-4.5 w-4.5 text-white" />}
                            className={cn(
                              "w-full h-12 text-xs font-bold transition-all shrink-0 rounded-xl cursor-pointer text-white",
                              punchedIn ? "btn-punch-out text-white bg-rose-600 hover:bg-rose-700" : "btn-punch-in text-white bg-emerald-600 hover:bg-emerald-700"
                            )}
                          >
                            {punchedIn ? 'Punch Out' : 'Punch In'}
                          </Button>
                        </div>
                      </Card>

                      {/* Personal Calendar Logs Card */}
                      <Card className="p-6 space-y-4 bg-card border border-border">
                        <div>
                          <h4 className="text-xs font-black text-foreground uppercase tracking-wider pb-2 border-b border-border">Personal Logs History</h4>
                        </div>
                        
                        <div className="overflow-y-auto space-y-2 max-h-72 pr-1">
                          {ownLogs.length === 0 ? (
                            <div className="text-center py-10 text-muted-foreground text-[11px]">
                              No login history found.
                            </div>
                          ) : (
                            ownLogs.map((log, idx) => (
                              <div key={idx} className="p-2.5 rounded-xl border border-border bg-secondary/15 flex justify-between items-center text-xs">
                                <div>
                                  <div className="font-bold text-foreground">{log.date}</div>
                                  <div className="text-[9px] text-muted-foreground mt-0.5 flex gap-2">
                                    <span>In: {log.checkIn || '--'}</span>
                                    <span>Out: {log.checkOut || '--'}</span>
                                  </div>
                                </div>
                                <div className="text-right">
                                  <div className="font-semibold text-foreground font-mono">{log.workHours || '00:00:00'}</div>
                                  <Badge variant={log.status === 'Present' || log.status === 'On Time' ? 'success' : 'warning'} className="text-[9px] mt-0.5">
                                    {log.status || 'Present'}
                                  </Badge>
                                </div>
                              </div>
                            ))
                          )}
                        </div>
                      </Card>
                    </div>
                  )}

                  {/* 2. TEAM ATTENDANCE LOGS TAB */}
                  {attSubTab === 'team-logs' && (
                    <Card className="p-0 overflow-hidden border border-border">
                      <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm border-collapse">
                          <thead>
                            <tr className="border-b border-border text-muted-foreground uppercase font-bold text-[9px] tracking-wider bg-secondary/35">
                              <th className="p-3">Employee Name</th>
                              <th className="p-3">Date</th>
                              <th className="p-3">Punch In</th>
                              <th className="p-3">Punch Out</th>
                              <th className="p-3">Work Hours</th>
                              <th className="p-3">Status</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-border">
                            {attendance.length === 0 ? (
                              <tr>
                                <td colSpan={6} className="p-8 text-center text-muted-foreground text-xs">
                                  No team attendance records logged.
                                </td>
                              </tr>
                            ) : (
                              attendance.map((log, index) => (
                                <tr key={log.id || index} className="hover:bg-secondary/25 transition-colors text-xs">
                                  <td className="p-3 font-semibold text-foreground">{log.employeeName}</td>
                                  <td className="p-3 font-mono">{log.date}</td>
                                  <td className="p-3 font-mono text-emerald-500">{log.checkIn || '--:--:--'}</td>
                                  <td className="p-3 font-mono text-rose-500">{log.checkOut || '--:--:--'}</td>
                                  <td className="p-3 font-mono font-semibold">{log.workHours || '00:00:00'}</td>
                                  <td className="p-3">
                                    <Badge variant={log.status === 'Present' || log.status === 'On Time' ? 'success' : log.status === 'Late' ? 'warning' : 'danger'}>
                                      {log.status || 'Present'}
                                    </Badge>
                                  </td>
                                </tr>
                              ))
                            )}
                          </tbody>
                        </table>
                      </div>
                    </Card>
                  )}

                  {/* 3. CORRECTION REQUESTS TAB */}
                  {attSubTab === 'corrections' && (
                    <Card className="p-0 overflow-hidden border border-border">
                      <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm border-collapse">
                          <thead>
                            <tr className="border-b border-border text-muted-foreground uppercase font-bold text-[9px] tracking-wider bg-secondary/35">
                              <th className="p-3">Employee</th>
                              <th className="p-3">Date</th>
                              <th className="p-3">Request Type</th>
                              <th className="p-3">Requested In</th>
                              <th className="p-3">Requested Out</th>
                              <th className="p-3">Reason</th>
                              <th className="p-3">Status</th>
                              <th className="p-3 text-right">Actions</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-border text-xs">
                            {corrections.length === 0 ? (
                              <tr>
                                <td colSpan={8} className="p-8 text-center text-muted-foreground">
                                  No attendance correction logs requested.
                                </td>
                              </tr>
                            ) : (
                              corrections.map(req => (
                                <tr key={req.id} className="hover:bg-secondary/25 transition-colors">
                                  <td className="p-3 font-semibold text-foreground">{req.employeeName}</td>
                                  <td className="p-3 font-mono">{req.date}</td>
                                  <td className="p-3"><Badge variant="info">{req.type}</Badge></td>
                                  <td className="p-3 font-mono">{req.requestedCheckIn || 'N/A'}</td>
                                  <td className="p-3 font-mono">{req.requestedCheckOut || 'N/A'}</td>
                                  <td className="p-3">{req.reason}</td>
                                  <td className="p-3">
                                    <Badge variant={req.status === 'Approved' ? 'success' : req.status === 'Pending' ? 'warning' : 'danger'}>
                                      {req.status}
                                    </Badge>
                                  </td>
                                  <td className="p-3 text-right">
                                    {req.status === 'Pending' ? (
                                      <div className="flex gap-1.5 justify-end">
                                        <Button size="sm" variant="primary" onClick={() => handleCorrectionRequest(req.id, 'Approved', 'Approved')}>
                                          Approve
                                        </Button>
                                        <Button size="sm" variant="danger" onClick={() => handleCorrectionRequest(req.id, 'Rejected', 'Rejected')}>
                                          Reject
                                        </Button>
                                      </div>
                                    ) : (
                                      <span className="text-[10px] text-muted-foreground">Processed</span>
                                    )}
                                  </td>
                                </tr>
                              ))
                            )}
                          </tbody>
                        </table>
                      </div>
                    </Card>
                  )}
                </motion.div>
              )}

              {/* ------------------------------------------------------------------
                  TAB: LEAVE MANAGEMENT
                  ------------------------------------------------------------------ */}
              {activeTab === 'leaves' && (
                <motion.div
                  key="leaves"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="space-y-6"
                >
                  <div>
                    <h3 className="text-base font-extrabold text-foreground uppercase tracking-wider">Team Leave Applications</h3>
                    <p className="text-[11px] text-muted-foreground mt-0.5">Add recommendation reviews which auto-forward to HR admin</p>
                  </div>

                  <Card className="p-0 overflow-hidden">
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-sm border-collapse">
                        <thead>
                          <tr className="border-b border-border text-muted-foreground uppercase font-bold text-[9px] tracking-wider bg-secondary/35">
                            <th className="p-3">Employee</th>
                            <th className="p-3">Type</th>
                            <th className="p-3">Days</th>
                            <th className="p-3">Dates</th>
                            <th className="p-3">Reason</th>
                            <th className="p-3">HR Status</th>
                            <th className="p-3">Manager Rec.</th>
                            <th className="p-3 text-right">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                          {leaves.length === 0 ? (
                            <tr>
                              <td colSpan={8} className="p-8 text-center text-muted-foreground">
                                No leave requests found.
                              </td>
                            </tr>
                          ) : (
                            leaves.map(req => (
                              <tr key={req.id} className="hover:bg-secondary/25 transition-colors">
                                <td className="p-3 font-semibold text-foreground">{req.employeeName}</td>
                                <td className="p-3"><Badge variant="info">{req.type}</Badge></td>
                                <td className="p-3 font-mono">{req.totalDays} days</td>
                                <td className="p-3 font-mono text-[10px]">{req.fromDate} to {req.toDate}</td>
                                <td className="p-3">{req.reason}</td>
                                <td className="p-3">
                                  <Badge variant={req.status === 'Approved' ? 'success' : req.status === 'Pending' ? 'warning' : 'danger'}>
                                    {req.status}
                                  </Badge>
                                </td>
                                <td className="p-3">
                                  <Badge variant={req.managerStatus === 'Approved' ? 'success' : req.managerStatus === 'Pending' ? 'warning' : 'danger'}>
                                    {req.managerStatus || 'Pending'}
                                  </Badge>
                                </td>
                                <td className="p-3 text-right">
                                  {req.managerStatus === 'Pending' && req.status === 'Pending' ? (
                                    <div className="flex gap-1.5 justify-end">
                                      <Button size="sm" variant="primary" onClick={() => handleLeaveRecommendation(req.id, 'Approved', 'Recommended')}>
                                        Recommend
                                      </Button>
                                      <Button size="sm" variant="danger" onClick={() => handleLeaveRecommendation(req.id, 'Rejected', 'Rejected')}>
                                        Reject
                                      </Button>
                                    </div>
                                  ) : (
                                    <span className="text-[10px] text-muted-foreground">Processed</span>
                                  )}
                                </td>
                              </tr>
                            ))
                          )}
                        </tbody>
                      </table>
                    </div>
                  </Card>
                </motion.div>
              )}

              {/* ------------------------------------------------------------------
                  TAB: TASK MANAGEMENT
                  ------------------------------------------------------------------ */}
              {activeTab === 'tasks' && (
                <motion.div
                  key="tasks"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="space-y-6"
                >
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="text-base font-extrabold text-foreground uppercase tracking-wider">Team Task Board</h3>
                      <p className="text-[11px] text-muted-foreground mt-0.5">Assign, review, and toggle task status cards</p>
                    </div>

                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" onClick={() => setActiveTaskView(activeTaskView === 'kanban' ? 'table' : 'kanban')}>
                        View: {activeTaskView === 'kanban' ? 'Table' : 'Kanban'}
                      </Button>
                      <Button size="sm" variant="primary" onClick={() => setShowTaskModal(true)}>
                        <Plus className="h-5 w-5" /> Assign Task
                      </Button>
                    </div>
                  </div>

                  {activeTaskView === 'kanban' ? (
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                      {['Todo', 'In Progress', 'Completed', 'Blocked'].map(col => (
                        <Card key={col} className="p-4 bg-secondary/15 flex flex-col gap-3 min-h-[350px]">
                          <span className="text-[10px] font-bold text-foreground/80 uppercase border-b border-border pb-2 tracking-wider block">
                            {col} ({tasks.filter(t => t.status === col).length})
                          </span>
                          
                          <div className="space-y-2 flex-1">
                            {tasks.filter(t => t.status === col).map(task => (
                              <Card key={task.id} className="p-3 bg-card flex flex-col gap-2 shadow-2xs hover:border-primary/25 cursor-pointer">
                                <span className="text-[9px] font-bold text-primary font-mono">{task.id}</span>
                                <h5 className="text-[11px] font-bold text-foreground">{task.title}</h5>
                                <p className="text-[10px] text-muted-foreground line-clamp-2">{task.description}</p>
                                {task.attachments && (
                                  <div onClick={() => setPreviewImageUrl(task.attachments)} className="relative rounded overflow-hidden max-h-24 bg-secondary/15 flex items-center justify-center border border-border/50 hover:opacity-80 transition-opacity">
                                    <img src={task.attachments} alt="Task attachment" className="object-contain max-h-24 w-full" />
                                  </div>
                                )}
                                <div className="flex justify-between items-center text-[9px] text-muted-foreground border-t border-border/40 pt-2">
                                  <span>{task.assignedToName}</span>
                                  <Badge variant={task.priority === 'High' ? 'danger' : 'info'}>{task.priority}</Badge>
                                </div>
                                <div className="flex gap-1 mt-1 justify-end">
                                  {col !== 'Todo' && <button onClick={() => handleTaskStatusChange(task.id, 'Todo')} className="text-[9px] px-1.5 py-0.5 rounded bg-secondary hover:bg-secondary/80">Todo</button>}
                                  {col !== 'In Progress' && <button onClick={() => handleTaskStatusChange(task.id, 'In Progress')} className="text-[9px] px-1.5 py-0.5 rounded bg-secondary hover:bg-secondary/80">Work</button>}
                                  {col !== 'Completed' && <button onClick={() => handleTaskStatusChange(task.id, 'Completed')} className="text-[9px] px-1.5 py-0.5 rounded bg-secondary hover:bg-secondary/80">Done</button>}
                                </div>
                              </Card>
                            ))}
                          </div>
                        </Card>
                      ))}
                    </div>
                  ) : (
                    <Card className="p-0 overflow-hidden">
                      <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs border-collapse">
                          <thead>
                            <tr className="border-b border-border text-muted-foreground uppercase font-bold text-[9px] tracking-wider bg-secondary/35">
                              <th className="p-3">ID</th>
                              <th className="p-3">Title</th>
                              <th className="p-3">Assigned To</th>
                              <th className="p-3">Deadline</th>
                              <th className="p-3">Priority</th>
                              <th className="p-3">Status</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-border">
                            {tasks.map(task => (
                              <tr key={task.id} className="hover:bg-secondary/25 transition-colors">
                                <td className="p-3 font-mono font-bold text-primary text-[10px]">{task.id}</td>
                                <td className="p-3 font-semibold">
                                  <div>{task.title}</div>
                                  {task.attachments && (
                                    <div className="mt-1 flex gap-1 items-center text-[9px] text-primary">
                                      <button onClick={() => setPreviewImageUrl(task.attachments)} className="font-bold underline hover:opacity-80">📷 View Attachment</button>
                                    </div>
                                  )}
                                </td>
                                <td className="p-3">{task.assignedToName}</td>
                                <td className="p-3 font-mono">{task.deadline}</td>
                                <td className="p-3"><Badge variant={task.priority === 'High' ? 'danger' : 'info'}>{task.priority}</Badge></td>
                                <td className="p-3"><Badge variant={task.status === 'Completed' ? 'success' : 'warning'}>{task.status}</Badge></td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </Card>
                  )}
                </motion.div>
              )}

              {/* ------------------------------------------------------------------
                  TAB: PERFORMANCE REVIEWS
                  ------------------------------------------------------------------ */}
              {activeTab === 'performance' && (
                <motion.div
                  key="performance"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="space-y-6"
                >
                  {/* Header */}
                  <div className="p-5 bg-gradient-to-r from-primary/10 via-primary/5 to-transparent rounded-2xl border border-primary/10 flex justify-between items-center gap-4">
                    <div>
                      <h3 className="text-sm font-bold text-foreground">Performance Review Ledger</h3>
                      <p className="text-[11px] text-muted-foreground mt-0.5">Manage goals, productivity ratings and appreciation feedback</p>
                    </div>
                    <Button variant="primary" onClick={() => setShowPerfModal(true)}>Add Performance Log</Button>
                  </div>

                  <Card className="p-0 overflow-hidden">
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs border-collapse">
                        <thead>
                          <tr className="border-b border-border text-muted-foreground uppercase font-bold text-[9px] tracking-wider bg-secondary/35">
                            <th className="p-3">Employee</th>
                            <th className="p-3">Period</th>
                            <th className="p-3">Productivity Score</th>
                            <th className="p-3">KPIs / Goals</th>
                            <th className="p-3">Status</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                          {performance.length === 0 ? (
                            <tr>
                              <td colSpan={5} className="p-8 text-center text-muted-foreground">
                                No performance logs entered.
                              </td>
                            </tr>
                          ) : (
                            performance.map(perf => (
                              <tr key={perf.id} className="hover:bg-secondary/25 transition-colors">
                                <td className="p-3 font-semibold text-foreground">{perf.employeeName}</td>
                                <td className="p-3">{perf.reviewPeriod}</td>
                                <td className="p-3 font-mono font-bold">{perf.rating} / 10</td>
                                <td className="p-3">{perf.goals}</td>
                                <td className="p-3">
                                  <Badge variant={perf.rating >= 8 ? 'success' : perf.rating >= 5 ? 'info' : 'danger'}>
                                    {perf.rating >= 8 ? 'Excellent' : perf.rating >= 5 ? 'Satisfactory' : 'Needs Review'}
                                  </Badge>
                                </td>
                              </tr>
                            ))
                          )}
                        </tbody>
                      </table>
                    </div>
                  </Card>
                </motion.div>
              )}

              {/* ------------------------------------------------------------------
                  TAB: EXPENSES COMPLIANCE
                  ------------------------------------------------------------------ */}
              {activeTab === 'expenses' && (
                <motion.div
                  key="expenses"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="space-y-6"
                >
                  <div>
                    <h3 className="text-sm font-bold text-foreground">Expense Claims</h3>
                    <p className="text-[11px] text-muted-foreground mt-0.5">Approve or reject team business expenses</p>
                  </div>

                  <Card className="p-0 overflow-hidden">
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs border-collapse">
                        <thead>
                          <tr className="border-b border-border text-muted-foreground uppercase font-bold text-[9px] tracking-wider bg-secondary/35">
                            <th className="p-3">Employee</th>
                            <th className="p-3">Date</th>
                            <th className="p-3">Category</th>
                            <th className="p-3">Amount</th>
                            <th className="p-3">Reason</th>
                            <th className="p-3">Status</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                          {expenses.length === 0 ? (
                            <tr>
                              <td colSpan={6} className="p-8 text-center text-muted-foreground">
                                No expense claims found.
                              </td>
                            </tr>
                          ) : (
                            expenses.map(exp => (
                              <tr key={exp.id} className="hover:bg-secondary/25 transition-colors">
                                <td className="p-3 font-semibold text-foreground">{exp.employeeName}</td>
                                <td className="p-3 font-mono">{exp.date}</td>
                                <td className="p-3"><Badge variant="neutral">{exp.category}</Badge></td>
                                <td className="p-3 font-mono font-bold text-foreground">${exp.amount}</td>
                                <td className="p-3">{exp.reason}</td>
                                <td className="p-3">
                                  <Badge variant={exp.status === 'Approved' ? 'success' : exp.status === 'Pending' ? 'warning' : 'danger'}>
                                    {exp.status}
                                  </Badge>
                                </td>
                              </tr>
                            ))
                          )}
                        </tbody>
                      </table>
                    </div>
                  </Card>
                </motion.div>
              )}

              {/* ------------------------------------------------------------------
                  TAB: ASSETS ALLOCATED
                  ------------------------------------------------------------------ */}
              {activeTab === 'assets' && (
                <motion.div
                  key="assets"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="space-y-6"
                >
                  <div className="p-5 bg-gradient-to-r from-primary/10 via-primary/5 to-transparent rounded-2xl border border-primary/10 flex justify-between items-center gap-4">
                    <div>
                      <h3 className="text-sm font-bold text-foreground">Assets Ledger</h3>
                      <p className="text-[11px] text-muted-foreground mt-0.5">Asset registers and company gadgets assigned to employees</p>
                    </div>
                    <Button variant="primary" onClick={() => setShowAssetModal(true)}>Allocate Asset</Button>
                  </div>

                  <Card className="p-0 overflow-hidden">
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs border-collapse">
                        <thead>
                          <tr className="border-b border-border text-muted-foreground uppercase font-bold text-[9px] tracking-wider bg-secondary/35">
                            <th className="p-3">Employee</th>
                            <th className="p-3">Asset Code</th>
                            <th className="p-3">Device Name</th>
                            <th className="p-3">Serial / Details</th>
                            <th className="p-3">Status</th>
                            <th className="p-3 text-right">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                          {assets.length === 0 ? (
                            <tr>
                              <td colSpan={6} className="p-8 text-center text-muted-foreground">
                                No assets registered.
                              </td>
                            </tr>
                          ) : (
                            assets.map(asset => (
                              <tr key={asset.id} className="hover:bg-secondary/25 transition-colors">
                                <td className="p-3 font-semibold text-foreground">{asset.employeeName}</td>
                                <td className="p-3 font-mono font-bold text-primary">{asset.id}</td>
                                <td className="p-3">{asset.assetName}</td>
                                <td className="p-3 font-mono text-muted-foreground text-[10px]">{asset.serialNumber || 'Pending'}</td>
                                <td className="p-3">
                                  <Badge variant={asset.status === 'Assigned' || asset.status === 'Allocated' ? 'success' : asset.status === 'Requested' ? 'info' : asset.status === 'Return Pending' ? 'warning' : asset.status === 'Returned' ? 'neutral' : 'danger'}>
                                    {asset.status}
                                  </Badge>
                                </td>
                                <td className="p-3 text-right">
                                  {asset.status === 'Requested' && (
                                    <div className="flex gap-1.5 justify-end">
                                      <button 
                                        onClick={() => handleAssetRequest(asset.id, 'Assigned', 'Approved by Manager')}
                                        className="px-2 py-1 rounded text-[10px] font-bold bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/20 border border-emerald-500/20 cursor-pointer"
                                      >
                                        Approve
                                      </button>
                                      <button 
                                        onClick={() => handleAssetRequest(asset.id, 'Rejected', 'Rejected by Manager')}
                                        className="px-2 py-1 rounded text-[10px] font-bold bg-rose-500/10 text-rose-600 hover:bg-rose-500/20 border border-rose-500/20 cursor-pointer"
                                      >
                                        Reject
                                      </button>
                                    </div>
                                  )}
                                  {asset.status === 'Return Pending' && (
                                    <button 
                                      onClick={() => handleAssetRequest(asset.id, 'Returned', 'Returned & verified by Manager')}
                                      className="px-2 py-1 rounded text-[10px] font-bold bg-amber-500/10 text-amber-600 hover:bg-amber-500/20 border border-amber-500/20 cursor-pointer"
                                    >
                                      Accept Return
                                    </button>
                                  )}
                                  {asset.status !== 'Requested' && asset.status !== 'Return Pending' && (
                                    <span className="text-muted-foreground">-</span>
                                  )}
                                </td>
                              </tr>
                            ))
                          )}
                        </tbody>
                      </table>
                    </div>
                  </Card>
                </motion.div>
              )}

              {/* ------------------------------------------------------------------
                  TAB: PROFILE
                  ------------------------------------------------------------------ */}
              {activeTab === 'profile' && (
                <motion.div
                  key="profile"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="max-w-2xl mx-auto space-y-6 animate-fadeIn"
                >
                  <Card className="p-6 flex flex-col items-center text-center gap-4 bg-card border border-border">
                    <div className="w-20 h-20 rounded-full bg-primary/10 text-primary flex items-center justify-center border border-primary/20 overflow-hidden relative">
                      {managerProfile?.avatar ? (
                        <img src={managerProfile.avatar} alt="Manager profile" className="w-full h-full object-cover" />
                      ) : (
                        <span className="text-2xl font-bold uppercase">{managerProfile?.name ? managerProfile.name[0] : 'M'}</span>
                      )}
                    </div>
                    
                    <div className="flex flex-col items-center gap-1">
                      <input 
                        type="file" 
                        id="manager-avatar-upload" 
                        accept="image/*" 
                        className="hidden" 
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            const reader = new FileReader();
                            reader.onloadend = async () => {
                              if (typeof reader.result === 'string') {
                                try {
                                  await api.updateProfile({ avatar: reader.result });
                                  setManagerProfile(prev => ({ ...prev, avatar: reader.result }));
                                  alert('Profile photo updated successfully!');
                                } catch (err) {
                                  alert('Failed to update profile photo: ' + err.message);
                                }
                              }
                            };
                            reader.readAsDataURL(file);
                          }
                        }} 
                      />
                      <label htmlFor="manager-avatar-upload" className="text-xs font-semibold text-primary hover:underline cursor-pointer">
                        📷 Upload Photo
                      </label>
                    </div>

                    <div>
                      <h3 className="text-base font-bold text-foreground">{managerProfile?.name}</h3>
                      <span className="text-[10px] text-muted-foreground block">{managerProfile?.designation} - {managerProfile?.department}</span>
                    </div>

                    <div className="w-full grid grid-cols-2 gap-4 text-left border-t border-border pt-6 mt-2 text-xs">
                      <div>
                        <span className="text-muted-foreground block text-[10px] uppercase font-bold">Employee ID</span>
                        <strong className="text-foreground block font-mono font-extrabold">{managerProfile?.id}</strong>
                      </div>
                      <div>
                        <span className="text-muted-foreground block text-[10px] uppercase font-bold">Email Address</span>
                        <strong className="text-foreground block">{managerProfile?.email}</strong>
                      </div>
                      <div>
                        <span className="text-muted-foreground block text-[10px] uppercase font-bold">Phone Number</span>
                        <strong className="text-foreground block">{managerProfile?.phone || 'N/A'}</strong>
                      </div>
                      <div>
                        <span className="text-muted-foreground block text-[10px] uppercase font-bold">Date of Joining</span>
                        <strong className="text-foreground block font-mono">{managerProfile?.joiningDate || 'N/A'}</strong>
                      </div>
                    </div>
                  </Card>

                  {/* Document Upload Input */}
                  <input 
                    type="file"
                    id="manager-doc-upload-picker"
                    ref={docFileInputRef}
                    className="hidden"
                    accept="image/*,application/pdf"
                    onChange={handleDocFilePickerChange}
                  />

                  {/* Document Verification Center Card */}
                  <Card className="p-6 bg-card border border-border">
                    <div className="space-y-3">
                      <div className="pb-2 border-b border-border flex justify-between items-center">
                        <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
                          <FileText className="h-4.5 w-4.5 text-primary" /> Document Verification Center
                        </h3>
                      </div>
                      {documentsVault.map((doc) => {
                        const isExpanded = expandedDocId === doc.id;
                        const isUploading = uploadingDocId === doc.id;

                        return (
                          <div
                            key={doc.id}
                            className={cn(
                              "border border-border rounded-xl overflow-hidden bg-card transition-all duration-200",
                              isExpanded ? "ring-1 ring-primary shadow-sm border-primary/30" : "hover:border-primary/20 hover:shadow-xs",
                              isUploading && "opacity-75 pointer-events-none"
                            )}
                          >
                            <div
                              onClick={() => setExpandedDocId(isExpanded ? null : doc.id)}
                              className={cn(
                                "flex flex-col sm:flex-row sm:items-center justify-between p-4 gap-3 cursor-pointer select-none transition-colors",
                                isExpanded ? "bg-secondary/25" : "hover:bg-secondary/15"
                              )}
                            >
                              <div className="flex items-center gap-3 min-w-0 sm:w-2/5">
                                <div className={cn(
                                  "p-2 rounded-lg border shrink-0",
                                  doc.status === "Uploaded"
                                    ? "bg-primary/10 text-primary border-primary/20"
                                    : "bg-secondary text-muted-foreground border-border"
                                )}>
                                  <FileText className="h-4 w-4 shrink-0" />
                                </div>
                                <div className="min-w-0 flex-1">
                                  <span className="text-xs font-bold text-foreground block truncate">{doc.name}</span>
                                  {doc.status === "Uploaded" && doc.fileName && (
                                    <span className="text-[10px] text-muted-foreground truncate block max-w-xs mt-0.5">
                                      {doc.fileName}
                                    </span>
                                  )}
                                </div>
                              </div>

                              <div className="flex items-center sm:w-1/5 shrink-0">
                                <span className={cn(
                                  "text-[9px] px-2 py-0.5 font-bold rounded-full border tracking-wide uppercase",
                                  doc.status === "Uploaded"
                                    ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20"
                                    : "bg-amber-500/10 text-amber-500 border-amber-500/20"
                                )}>
                                  {doc.status === "Uploaded" ? "Uploaded" : "Pending"}
                                </span>
                              </div>

                              <div className="text-[10px] text-muted-foreground sm:w-1/5 shrink-0">
                                {doc.status === "Uploaded" ? `Uploaded: ${doc.uploadedDate}` : "No Date Available"}
                              </div>

                              <div className="flex items-center gap-1.5 sm:w-1/5 sm:justify-end shrink-0" onClick={(e) => e.stopPropagation()}>
                                {doc.status === "Uploaded" ? (
                                  <>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => setPreviewDoc(doc)}
                                      className="text-[10px] h-7 px-2 shrink-0 border border-border"
                                    >
                                      View
                                    </Button>
                                    {doc.canDelete && (
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => handleDeleteDoc(doc.id)}
                                        className="text-[10px] h-7 px-2 shrink-0 text-rose-500 hover:bg-rose-500/10 border border-rose-500/20"
                                      >
                                        Delete
                                      </Button>
                                    )}
                                  </>
                                ) : (
                                  <Button
                                    variant="primary"
                                    size="sm"
                                    onClick={() => triggerDocUploadPicker(doc.id)}
                                    className="text-[10px] h-7 px-2 shrink-0"
                                  >
                                    Upload
                                  </Button>
                                )}
                              </div>
                            </div>

                            {/* Expanded detail preview option */}
                            {isExpanded && (
                              <div className="p-4 border-t border-border bg-secondary/5 space-y-4">
                                {doc.status === "Uploaded" && doc.fileData && (
                                  <div className="flex flex-col gap-2">
                                    <span className="text-[10px] font-bold text-muted-foreground uppercase">Document Preview:</span>
                                    <div className="max-h-60 overflow-hidden border border-border rounded-lg bg-slate-900/10 flex items-center justify-center p-2">
                                      {doc.fileType.startsWith("image/") ? (
                                        <img src={doc.fileData} alt={doc.name} className="max-h-56 max-w-full object-contain rounded" />
                                      ) : (
                                        <div className="py-8 flex flex-col items-center gap-2">
                                          <FileText className="h-10 w-10 text-rose-500" />
                                          <span className="text-xs font-semibold text-foreground">{doc.fileName} (PDF File)</span>
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                )}
                                
                                {doc.status !== "Uploaded" && (
                                  <div className="border-2 border-dashed border-border rounded-lg p-6 flex flex-col items-center justify-center gap-2 bg-secondary/10">
                                    <UploadCloud className="h-8 w-8 text-muted-foreground" />
                                    <span className="text-xs font-semibold text-foreground">Select a file from your device</span>
                                    <span className="text-[10px] text-muted-foreground">Supports JPEG, PNG, or PDF up to 2MB</span>
                                    <Button
                                      variant="primary"
                                      size="sm"
                                      onClick={() => triggerDocUploadPicker(doc.id)}
                                      className="mt-2"
                                    >
                                      Browse Files
                                    </Button>
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </Card>
                </motion.div>
              )}
              
              {/* ------------------------------------------------------------------
                  TAB: MEETINGS SCHEDULER
                  ------------------------------------------------------------------ */}
              {activeTab === 'meetings' && (
                <motion.div
                  key="meetings"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="space-y-6"
                >
                  <div className="flex justify-between items-center">
                    <div>
                      <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
                        <Video className="h-5 w-5 text-primary" /> Meetings Scheduler
                      </h2>
                      <p className="text-xs text-muted-foreground">Schedule online video conferences and sync with your team members.</p>
                    </div>
                    <Button size="sm" variant="primary" onClick={() => setShowMeetingModal(true)}>
                      <Plus className="h-4.5 w-4.5" /> Schedule Meeting
                    </Button>
                  </div>

                  <Card className="p-6 bg-card border border-border">
                    <div className="space-y-4">
                      {meetings.length === 0 ? (
                        <div className="text-center py-12 text-sm text-muted-foreground flex flex-col items-center justify-center gap-3">
                          <Video className="h-10 w-10 text-muted-foreground/40" />
                          <div>
                            <p className="font-bold text-foreground">No meetings scheduled</p>
                            <p className="text-xs mt-1">Get started by creating a Google Meet or Zoom link for your team.</p>
                          </div>
                          <Button size="sm" variant="primary" onClick={() => setShowMeetingModal(true)} className="mt-2">
                            Schedule First Meeting
                          </Button>
                        </div>
                      ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {[...meetings].reverse().map((meeting) => (
                            <div key={meeting.id} className="p-4 rounded-xl border border-border bg-secondary/15 hover:bg-secondary/25 transition-all space-y-3 flex flex-col justify-between">
                              <div className="space-y-2">
                                <div className="flex justify-between items-start gap-2">
                                  <h4 className="font-bold text-sm text-foreground leading-snug">{meeting.title}</h4>
                                  <Badge variant={meeting.platform === 'Google Meet' ? 'info' : 'warning'} className="text-[9px] font-extrabold uppercase shrink-0">
                                    {meeting.platform}
                                  </Badge>
                                </div>
                                <p className="text-xs text-muted-foreground line-clamp-2">{meeting.agenda}</p>
                              </div>
                              
                              <div className="pt-3 border-t border-border/60 flex justify-between items-center text-xs">
                                <div className="space-y-1">
                                  <div className="text-muted-foreground flex items-center gap-1">
                                    <Calendar className="h-3 w-3 text-primary" /> {meeting.date}
                                  </div>
                                  <div className="text-muted-foreground flex items-center gap-1">
                                    <Clock className="h-3 w-3 text-primary" /> {meeting.time}
                                  </div>
                                </div>
                                
                                <a 
                                  href={meeting.link} 
                                  target="_blank" 
                                  rel="noopener noreferrer" 
                                  className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-all select-none"
                                >
                                  Join Meeting <ChevronRight className="h-3.5 w-3.5" />
                                </a>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </Card>
                </motion.div>
              )}

              {/* ------------------------------------------------------------------
                  TAB: DATA REPORTS
                  ------------------------------------------------------------------ */}
              {activeTab === 'reports' && (
                <motion.div
                  key="reports"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="space-y-6"
                >
                  <div>
                    <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
                      <FileText className="h-5 w-5 text-primary" /> Data Reports
                    </h2>
                    <p className="text-xs text-muted-foreground">Export team performance, attendance, and expense records to spreadsheet files.</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <Card className="p-6 bg-card border border-border flex flex-col justify-between h-48">
                      <div className="space-y-2">
                        <h3 className="font-bold text-sm text-foreground">Attendance Records</h3>
                        <p className="text-xs text-muted-foreground">Download the complete attendance sheet for all team members under your supervision.</p>
                      </div>
                      <Button variant="primary" size="sm" onClick={() => exportToCSV(attendance, 'Team_Attendance.csv')} className="w-full">
                        Download Attendance Report
                      </Button>
                    </Card>

                    <Card className="p-6 bg-card border border-border flex flex-col justify-between h-48">
                      <div className="space-y-2">
                        <h3 className="font-bold text-sm text-foreground">Leave Balances & Logs</h3>
                        <p className="text-xs text-muted-foreground">Export all leave requests, approval history, and balances ledger for your team.</p>
                      </div>
                      <Button variant="primary" size="sm" onClick={() => exportToCSV(leaves, 'Team_Leaves.csv')} className="w-full">
                        Download Leaves Report
                      </Button>
                    </Card>

                    <Card className="p-6 bg-card border border-border flex flex-col justify-between h-48">
                      <div className="space-y-2">
                        <h3 className="font-bold text-sm text-foreground">Expense Claims Ledger</h3>
                        <p className="text-xs text-muted-foreground">Download the itemized claims list, payout amounts, and status reports for team expenses.</p>
                      </div>
                      <Button variant="primary" size="sm" onClick={() => exportToCSV(expenses, 'Team_Expenses.csv')} className="w-full">
                        Download Expenses Report
                      </Button>
                    </Card>
                  </div>
                </motion.div>
              )}

              {/* ------------------------------------------------------------------
                  TAB: ANNOUNCEMENTS
                  ------------------------------------------------------------------ */}
              {activeTab === 'announcements' && (
                <motion.div
                  key="announcements"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="space-y-6"
                >
                  <div className="flex justify-between items-center">
                    <div>
                      <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
                        <Megaphone className="h-5 w-5 text-primary" /> Announcements Board
                      </h2>
                      <p className="text-xs text-muted-foreground">Publish notices, alerts, and system-wide declarations to your direct team members.</p>
                    </div>
                    <Button size="sm" variant="primary" onClick={() => setShowAnnouncementModal(true)}>
                      <Plus className="h-4.5 w-4.5" /> Post Announcement
                    </Button>
                  </div>

                  <Card className="p-6 bg-card border border-border">
                    <div className="space-y-4">
                      {announcements.length === 0 ? (
                        <div className="text-center py-12 text-sm text-muted-foreground flex flex-col items-center justify-center gap-3">
                          <Megaphone className="h-10 w-10 text-muted-foreground/40" />
                          <div>
                            <p className="font-bold text-foreground">No announcements posted yet</p>
                            <p className="text-xs mt-1">Keep your team aligned by posting a new notice.</p>
                          </div>
                          <Button size="sm" variant="primary" onClick={() => setShowAnnouncementModal(true)} className="mt-2">
                            Post First Notice
                          </Button>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          {[...announcements].reverse().map((ann) => (
                            <div key={ann.id} className="p-4 rounded-xl border border-border bg-secondary/15 space-y-2 hover:bg-secondary/25 transition-all text-left">
                              <div className="flex justify-between items-center gap-2">
                                <h4 className="font-bold text-sm text-foreground">{ann.title}</h4>
                                <Badge variant={ann.type === 'Alert' ? 'danger' : 'info'} className="text-[9px] font-extrabold uppercase">
                                  {ann.type || 'Notice'}
                                </Badge>
                              </div>
                              <p className="text-xs text-foreground/90 leading-relaxed">{ann.content}</p>
                              <div className="pt-2 flex justify-between items-center text-[10px] text-muted-foreground border-t border-border/40 mt-1">
                                <span>Sent via: {ann.sendEmail ? '📧 Email' : ''}{ann.sendEmail && ann.sendPush ? ' & ' : ''}{ann.sendPush ? '📱 Push' : 'Dashboard Only'}</span>
                                <span className="font-mono text-primary">{ann.createdAt ? new Date(ann.createdAt).toLocaleDateString() : 'Today'}</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </Card>
                </motion.div>
              )}

              {/* ------------------------------------------------------------------
                  TAB: MANAGER MY PAYSLIPS
                  ------------------------------------------------------------------ */}
              {activeTab === 'payroll' && (
                <motion.div
                  key="payroll"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="space-y-6"
                >
                  <div>
                    <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
                      <CreditCard className="h-5 w-5 text-primary" /> My Salary & Payslips
                    </h2>
                    <p className="text-xs text-muted-foreground">Review your personal salary disbursements and download official monthly payslip receipts.</p>
                  </div>

                  {myPayslips.length === 0 ? (
                    <Card className="p-12 text-center text-sm text-muted-foreground flex flex-col items-center justify-center gap-3 bg-card border border-border">
                      <CreditCard className="h-10 w-10 text-muted-foreground/40" />
                      <div>
                        <p className="font-bold text-foreground">No payslips disbursed yet</p>
                        <p className="text-xs mt-1">Your monthly payslip history will show up here once processed by Admin.</p>
                      </div>
                    </Card>
                  ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                      {/* Left: Salary History */}
                      <Card className="p-6 bg-card border border-border lg:col-span-2 space-y-4">
                        <h3 className="font-bold text-sm text-foreground">Disbursement History</h3>
                        <div className="overflow-x-auto">
                          <table className="w-full text-left border-collapse text-xs">
                            <thead>
                              <tr className="border-b border-border text-[10px] text-muted-foreground uppercase font-bold">
                                <th className="pb-3">Period</th>
                                <th className="pb-3">Gross Salary</th>
                                <th className="pb-3">Deductions</th>
                                <th className="pb-3 text-primary">Net Paid</th>
                                <th className="pb-3 text-right">Actions</th>
                              </tr>
                            </thead>
                            <tbody>
                              {myPayslips.map((pay) => (
                                <tr key={pay.id} className="border-b border-border/50 hover:bg-secondary/10 transition-colors">
                                  <td className="py-3 font-bold text-foreground">{pay.month} {pay.year}</td>
                                  <td className="py-3 text-muted-foreground">₹{pay.grossSalary.toLocaleString('en-IN')}</td>
                                  <td className="py-3 text-danger/80">-₹{pay.deductions.toLocaleString('en-IN')}</td>
                                  <td className="py-3 font-bold text-primary">₹{pay.netSalary.toLocaleString('en-IN')}</td>
                                  <td className="py-3 text-right">
                                    <Button 
                                      size="xs" 
                                      variant="outline" 
                                      onClick={() => alert(`Downloading Payslip receipt for ${pay.month} ${pay.year}. PDF generated successfully!`)}
                                    >
                                      PDF Receipt
                                    </Button>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </Card>

                      {/* Right: Latest Payslip Details breakdown */}
                      <Card className="p-6 bg-card border border-border space-y-6">
                        <div className="border-b border-border pb-4">
                          <span className="text-[10px] text-muted-foreground font-bold uppercase">Latest Disbursed Period</span>
                          <h3 className="font-extrabold text-foreground text-base mt-1">{myPayslips[0].month} {myPayslips[0].year}</h3>
                        </div>

                        <div className="space-y-3 text-xs">
                          <div className="flex justify-between items-center py-1">
                            <span className="text-muted-foreground">Earnings (Basic + Allowances)</span>
                            <span className="font-bold text-foreground">₹{myPayslips[0].grossSalary.toLocaleString('en-IN')}</span>
                          </div>
                          <div className="flex justify-between items-center py-1 text-danger/80">
                            <span>Total Deductions (Tax & PF)</span>
                            <span>-₹{myPayslips[0].deductions.toLocaleString('en-IN')}</span>
                          </div>
                          <div className="flex justify-between items-center py-3 border-t border-border mt-2 text-sm font-bold text-primary">
                            <span>Net Salary Paid</span>
                            <span>₹{myPayslips[0].netSalary.toLocaleString('en-IN')}</span>
                          </div>
                        </div>

                        <Button 
                          variant="primary" 
                          className="w-full"
                          onClick={() => window.print()}
                        >
                          Print Details
                        </Button>
                      </Card>
                    </div>
                  )}
                </motion.div>
              )}

              {/* ------------------------------------------------------------------
                  TAB: SETTINGS
                  ------------------------------------------------------------------ */}
              {activeTab === 'settings' && (
                <motion.div
                  key="settings"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="max-w-2xl mx-auto space-y-6"
                >
                  <div>
                    <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
                      <SettingsIcon className="h-5 w-5 text-primary" /> Settings Panel
                    </h2>
                    <p className="text-xs text-muted-foreground">Manage your workspace preferences, profile settings, and notification alerts.</p>
                  </div>

                  <Card className="p-6 bg-card border border-border space-y-6">
                    <div className="space-y-4">
                      <h3 className="text-xs font-extrabold uppercase text-foreground tracking-wider pb-2 border-b border-border">Notification Rules</h3>
                      <div className="space-y-4 text-xs">
                        <label className="flex items-center gap-3 cursor-pointer">
                          <input type="checkbox" defaultChecked className="rounded border-border text-primary focus:ring-primary w-4 h-4 bg-secondary/30" />
                          <div>
                            <span className="font-bold text-foreground block">Email notifications on check-in</span>
                            <span className="text-[10px] text-muted-foreground mt-0.5 block">Send me an alert when a team member marks attendance.</span>
                          </div>
                        </label>

                        <label className="flex items-center gap-3 cursor-pointer">
                          <input type="checkbox" defaultChecked className="rounded border-border text-primary focus:ring-primary w-4 h-4 bg-secondary/30" />
                          <div>
                            <span className="font-bold text-foreground block">Leave request approvals</span>
                            <span className="text-[10px] text-muted-foreground mt-0.5 block">Send me immediate alerts when leave applications are submitted.</span>
                          </div>
                        </label>
                      </div>
                    </div>

                    <div className="space-y-4 pt-4 border-t border-border">
                      <h3 className="text-xs font-extrabold uppercase text-foreground tracking-wider pb-2 border-b border-border">Application Status</h3>
                      <div className="grid grid-cols-2 gap-4 text-xs">
                        <div className="p-3 bg-secondary/15 rounded-xl border border-border">
                          <span className="text-muted-foreground block text-[10px] uppercase font-bold">App Role</span>
                          <span className="font-bold text-foreground block mt-1">Manager / Administrator</span>
                        </div>
                        <div className="p-3 bg-secondary/15 rounded-xl border border-border">
                          <span className="text-muted-foreground block text-[10px] uppercase font-bold">Sync Status</span>
                          <span className="text-success font-bold block mt-1 flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-success animate-ping"></span> Live & Connected
                          </span>
                        </div>
                      </div>
                    </div>
                  </Card>
                </motion.div>
              )}

            </AnimatePresence>
          )}
        </main>
      </div>

      {/* Leave Details Modal */}
      {selectedLeaveDetails && (
        <Modal isOpen={!!selectedLeaveDetails} onClose={() => setSelectedLeaveDetails(null)} title="Leave Request Detail">
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4 text-xs">
              <div>
                <span className="text-muted-foreground block">Employee Name</span>
                <span className="font-bold text-foreground">{selectedLeaveDetails.employeeName}</span>
              </div>
              <div>
                <span className="text-muted-foreground block">Leave Type</span>
                <span className="font-bold text-foreground">{selectedLeaveDetails.type}</span>
              </div>
              <div>
                <span className="text-muted-foreground block">Duration</span>
                <span className="font-bold text-foreground">{selectedLeaveDetails.totalDays} Days ({selectedLeaveDetails.fromDate} to {selectedLeaveDetails.toDate})</span>
              </div>
              <div>
                <span className="text-muted-foreground block">HR Approval Status</span>
                <Badge variant={selectedLeaveDetails.status === 'Approved' ? 'success' : selectedLeaveDetails.status === 'Pending' ? 'warning' : 'danger'}>
                  {selectedLeaveDetails.status}
                </Badge>
              </div>
              <div>
                <span className="text-muted-foreground block">Manager Recommendation</span>
                <Badge variant={selectedLeaveDetails.managerStatus === 'Approved' ? 'success' : selectedLeaveDetails.managerStatus === 'Pending' ? 'warning' : 'danger'}>
                  {selectedLeaveDetails.managerStatus || 'Pending'}
                </Badge>
              </div>
            </div>

            <div className="p-3 bg-secondary/15 rounded-xl border border-border">
              <span className="text-[10px] font-bold text-muted-foreground uppercase block mb-1">Reason for Leave</span>
              <p className="text-xs text-foreground leading-relaxed">{selectedLeaveDetails.reason}</p>
            </div>

            {selectedLeaveDetails.attachment && (
              <div className="space-y-1">
                <span className="text-[10px] font-bold text-muted-foreground uppercase block">Supporting Attachment</span>
                {selectedLeaveDetails.attachment.startsWith('data:image/') ? (
                  <div className="relative rounded-xl overflow-hidden border border-border bg-secondary/10 flex items-center justify-center max-h-60 p-2">
                    <img src={selectedLeaveDetails.attachment} alt="Attachment" className="object-contain max-h-56 rounded-lg w-full" />
                  </div>
                ) : (
                  <div className="p-3 border border-border rounded-xl bg-secondary/15 flex items-center justify-between text-xs">
                    <span className="truncate font-semibold">{selectedLeaveDetails.attachmentName || 'Supporting Document'}</span>
                    <a href={selectedLeaveDetails.attachment} download="supporting_doc.pdf" className="text-primary font-bold hover:underline">Download</a>
                  </div>
                )}
              </div>
            )}

            {selectedLeaveDetails.managerStatus === 'Pending' && selectedLeaveDetails.status === 'Pending' && (
              <div className="flex gap-2 pt-4 border-t border-border justify-end">
                <Button variant="danger" onClick={() => {
                  handleLeaveRecommendation(selectedLeaveDetails.id, 'Rejected', 'Rejected');
                  setSelectedLeaveDetails(null);
                }}>
                  Reject Request
                </Button>
                <Button variant="primary" onClick={() => {
                  handleLeaveRecommendation(selectedLeaveDetails.id, 'Approved', 'Approved');
                  setSelectedLeaveDetails(null);
                }}>
                  Recommend Approval
                </Button>
              </div>
            )}
          </div>
        </Modal>
      )}

      {/* 0. Attachment Preview Modal */}
      {previewImageUrl && (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black/85 p-4 transition-all" onClick={() => setPreviewImageUrl(null)}>
          <div className="relative max-w-4xl max-h-[85vh] bg-card rounded-2xl overflow-hidden p-3 shadow-2xl flex flex-col items-center gap-4 border border-border" onClick={(e) => e.stopPropagation()}>
            <div className="w-full flex justify-between items-center border-b border-border pb-2 px-1">
              <span className="text-xs font-bold text-foreground">Task Attachment Image</span>
              <button onClick={() => setPreviewImageUrl(null)} className="text-muted-foreground hover:text-foreground text-sm font-bold">✕ Close</button>
            </div>
            <img src={previewImageUrl} alt="Attachment Preview" className="object-contain max-h-[65vh] max-w-full rounded-lg" />
            <div className="flex gap-4 pb-1">
              <a href={previewImageUrl} download="task_attachment.png" className="px-4 py-2 text-xs font-bold text-white bg-primary rounded-xl hover:opacity-90">Download Image</a>
            </div>
          </div>
        </div>
      )}

      {/* 1. Assign Task Modal */}
      <Modal isOpen={showTaskModal} onClose={() => setShowTaskModal(false)} title="Assign New Task">
        <form onSubmit={handleCreateTaskSubmit} className="space-y-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-bold text-muted-foreground uppercase">Task Title</label>
            <input type="text" value={newTask.title} onChange={(e) => setNewTask({ ...newTask, title: e.target.value })} className="px-3 py-2 text-sm rounded-xl border border-border bg-secondary/35 text-foreground focus:outline-none focus:border-primary" required placeholder="e.g. Database Review" />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-bold text-muted-foreground uppercase">Detailed Instructions</label>
            <textarea value={newTask.description} onChange={(e) => setNewTask({ ...newTask, description: e.target.value })} className="px-3 py-2 text-sm rounded-xl border border-border bg-secondary/35 text-foreground focus:outline-none focus:border-primary resize-none" required rows={3} placeholder="Specify steps..." />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-bold text-muted-foreground uppercase">Assign To</label>
              <select value={newTask.assignedTo} onChange={(e) => setNewTask({ ...newTask, assignedTo: e.target.value })} className="px-3 py-2 text-sm rounded-xl border border-border bg-secondary/35 text-foreground focus:outline-none focus:border-primary" required>
                <option value="">Select Member...</option>
                {teamMembers.map(emp => (
                  <option key={emp.id} value={emp.id}>{emp.name}</option>
                ))}
              </select>
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-bold text-muted-foreground uppercase">Priority</label>
              <select value={newTask.priority} onChange={(e) => setNewTask({ ...newTask, priority: e.target.value })} className="px-3 py-2 text-sm rounded-xl border border-border bg-secondary/35 text-foreground focus:outline-none focus:border-primary">
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
              </select>
            </div>
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-bold text-muted-foreground uppercase">Deadline Date</label>
            <input type="date" value={newTask.deadline} onChange={(e) => setNewTask({ ...newTask, deadline: e.target.value })} className="px-3 py-2 text-sm rounded-xl border border-border bg-secondary/35 text-foreground focus:outline-none focus:border-primary" required />
          </div>
          <div className="flex justify-end gap-2 pt-4 border-t border-border">
            <Button type="button" variant="outline" onClick={() => setShowTaskModal(false)}>Cancel</Button>
            <Button type="submit" variant="primary">Assign Task</Button>
          </div>
        </form>
      </Modal>

      {/* 2. Schedule Meeting Modal */}
      <Modal isOpen={showMeetingModal} onClose={() => setShowMeetingModal(false)} title="Schedule Team Meeting">
        <form onSubmit={handleCreateMeetingSubmit} className="space-y-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-bold text-muted-foreground uppercase">Meeting Title</label>
            <input type="text" value={newMeeting.title} onChange={(e) => setNewMeeting({ ...newMeeting, title: e.target.value })} className="px-3 py-2 text-sm rounded-xl border border-border bg-secondary/35 text-foreground focus:outline-none focus:border-primary" required placeholder="e.g. Sprint Planning" />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-bold text-muted-foreground uppercase">Agenda Details</label>
            <textarea value={newMeeting.agenda} onChange={(e) => setNewMeeting({ ...newMeeting, agenda: e.target.value })} className="px-3 py-2 text-sm rounded-xl border border-border bg-secondary/35 text-foreground focus:outline-none focus:border-primary resize-none" required rows={2} placeholder="Agenda items..." />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-bold text-muted-foreground uppercase">Meeting Date</label>
              <input type="date" value={newMeeting.date} onChange={(e) => setNewMeeting({ ...newMeeting, date: e.target.value })} className="px-3 py-2 text-sm rounded-xl border border-border bg-secondary/35 text-foreground focus:outline-none focus:border-primary" required />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-bold text-muted-foreground uppercase">Meeting Time</label>
              <input type="time" value={newMeeting.time} onChange={(e) => setNewMeeting({ ...newMeeting, time: e.target.value })} className="px-3 py-2 text-sm rounded-xl border border-border bg-secondary/35 text-foreground focus:outline-none focus:border-primary" required />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-bold text-muted-foreground uppercase">Platform</label>
              <select value={newMeeting.platform} onChange={(e) => setNewMeeting({ ...newMeeting, platform: e.target.value })} className="px-3 py-2 text-sm rounded-xl border border-border bg-secondary/35 text-foreground focus:outline-none focus:border-primary">
                <option value="Google Meet">Google Meet</option>
                <option value="Zoom">Zoom Meeting</option>
                <option value="Microsoft Teams">MS Teams</option>
                <option value="In Person">Physical Office Room</option>
              </select>
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-bold text-muted-foreground uppercase">Meeting Link / Room</label>
              <input type="text" value={newMeeting.link} onChange={(e) => setNewMeeting({ ...newMeeting, link: e.target.value })} className="px-3 py-2 text-sm rounded-xl border border-border bg-secondary/35 text-foreground focus:outline-none focus:border-primary" required placeholder="https://meet.google.com/abc-defg-hij" />
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-4 border-t border-border">
            <Button type="button" variant="outline" onClick={() => setShowMeetingModal(false)}>Cancel</Button>
            <Button type="submit" variant="primary">Schedule Meet</Button>
          </div>
        </form>
      </Modal>

      {/* 3. Broadcast Announcement Modal */}
      <Modal isOpen={showAnnouncementModal} onClose={() => setShowAnnouncementModal(false)} title="Broadcast Team Announcement">
        <form onSubmit={handleCreateAnnouncementSubmit} className="space-y-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-bold text-muted-foreground uppercase">Announcement Title</label>
            <input type="text" value={newAnnouncement.title} onChange={(e) => setNewAnnouncement({ ...newAnnouncement, title: e.target.value })} className="px-3 py-2 text-sm rounded-xl border border-border bg-secondary/35 text-foreground focus:outline-none focus:border-primary" required placeholder="e.g. Server Maintenance window" />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-bold text-muted-foreground uppercase">Classification</label>
            <select value={newAnnouncement.type} onChange={(e) => setNewAnnouncement({ ...newAnnouncement, type: e.target.value })} className="px-3 py-2 text-sm rounded-xl border border-border bg-secondary/35 text-foreground focus:outline-none focus:border-primary">
              <option value="Announcement">Standard Announcement</option>
              <option value="Urgent Notice">Urgent Notice</option>
              <option value="Policy Shift">Policy Update</option>
              <option value="Event">Corporate Event</option>
            </select>
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-bold text-muted-foreground uppercase">Detailed Message</label>
            <textarea value={newAnnouncement.content} onChange={(e) => setNewAnnouncement({ ...newAnnouncement, content: e.target.value })} className="px-3 py-2 text-sm rounded-xl border border-border bg-secondary/35 text-foreground focus:outline-none focus:border-primary resize-none" required rows={3} placeholder="Specify details..." />
          </div>
          <div className="flex justify-end gap-2 pt-4 border-t border-border">
            <Button type="button" variant="outline" onClick={() => setShowAnnouncementModal(false)}>Cancel</Button>
            <Button type="submit" variant="primary">Broadcast</Button>
          </div>
        </form>
      </Modal>

      {/* 4. Assign KPI / Goal Review Modal */}
      <Modal isOpen={showPerfModal} onClose={() => setShowPerfModal(false)} title="Add KPI / Performance Review">
        <form onSubmit={handleCreatePerformanceSubmit} className="space-y-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-bold text-muted-foreground uppercase">Employee</label>
            <select value={newPerf.employeeId} onChange={(e) => setNewPerf({ ...newPerf, employeeId: e.target.value })} className="px-3 py-2 text-sm rounded-xl border border-border bg-secondary/35 text-foreground focus:outline-none focus:border-primary" required>
              <option value="">Select Employee...</option>
              {teamMembers.map(emp => (
                <option key={emp.id} value={emp.id}>{emp.name}</option>
              ))}
            </select>
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-bold text-muted-foreground uppercase">Review Period</label>
            <input type="text" value={newPerf.reviewPeriod} onChange={(e) => setNewPerf({ ...newPerf, reviewPeriod: e.target.value })} className="px-3 py-2 text-sm rounded-xl border border-border bg-secondary/35 text-foreground focus:outline-none focus:border-primary" required placeholder="e.g. Q2 2026" />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-bold text-muted-foreground uppercase">Productivity Score (1-10)</label>
            <input type="number" min="1" max="10" value={newPerf.rating} onChange={(e) => setNewPerf({ ...newPerf, rating: parseFloat(e.target.value) })} className="px-3 py-2 text-sm rounded-xl border border-border bg-secondary/35 text-foreground focus:outline-none focus:border-primary" required />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-bold text-muted-foreground uppercase">Goals / Strategic Objectives</label>
            <textarea value={newPerf.goals} onChange={(e) => setNewPerf({ ...newPerf, goals: e.target.value })} className="px-3 py-2 text-sm rounded-xl border border-border bg-secondary/35 text-foreground focus:outline-none focus:border-primary resize-none" rows={2} placeholder="Target objectives..." />
          </div>
          <div className="flex justify-end gap-2 pt-4 border-t border-border">
            <Button type="button" variant="outline" onClick={() => setShowPerfModal(false)}>Cancel</Button>
            <Button type="submit" variant="primary">Save Review</Button>
          </div>
        </form>
      </Modal>

      {/* 5. Document Viewer Modal */}
      {previewDoc && (
        <Modal isOpen={!!previewDoc} onClose={() => setPreviewDoc(null)} title={previewDoc.name}>
          <div className="space-y-4">
            <div className="border border-border rounded-lg max-h-[70vh] overflow-auto flex items-center justify-center p-2 bg-slate-950/5">
              {previewDoc.fileType.startsWith("image/") ? (
                <img src={previewDoc.fileData} alt={previewDoc.name} className="max-w-full max-h-[60vh] object-contain rounded" />
              ) : (
                <div className="py-12 flex flex-col items-center gap-3">
                  <FileText className="h-16 w-16 text-rose-500" />
                  <span className="text-sm font-semibold text-foreground">{previewDoc.fileName}</span>
                  <span className="text-xs text-muted-foreground">PDF Document</span>
                </div>
              )}
            </div>
            <div className="flex justify-end gap-2 border-t border-border pt-4">
              <Button variant="outline" onClick={() => setPreviewDoc(null)}>Close</Button>
              {previewDoc.fileData && (
                <a 
                  href={previewDoc.fileData} 
                  download={previewDoc.fileName || 'document.jpg'} 
                  className="inline-flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-xl bg-primary text-primary-foreground hover:bg-primary/95 transition-all"
                >
                  <Download className="h-3.5 w-3.5" /> Download
                </a>
              )}
            </div>
          </div>
        </Modal>
      )}

      {/* 6. Allocate Asset Modal */}
      {showAssetModal && (
        <Modal isOpen={showAssetModal} onClose={() => setShowAssetModal(false)} title="Allocate Workstation Equipment">
          <form onSubmit={handleAllocateAsset} className="space-y-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-bold text-muted-foreground uppercase">Select Team Member</label>
              <select 
                value={newAssetEmpId} 
                onChange={(e) => setNewAssetEmpId(e.target.value)}
                className="px-3 py-2 text-sm rounded-xl border border-border bg-secondary/35 text-foreground focus:outline-none focus:border-primary w-full"
              >
                {teamMembers.map(emp => (
                  <option key={emp.id} value={emp.id}>{emp.name}</option>
                ))}
              </select>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-bold text-muted-foreground uppercase">Asset Category</label>
              <select 
                value={newAssetType} 
                onChange={(e) => setNewAssetType(e.target.value)}
                className="px-3 py-2 text-sm rounded-xl border border-border bg-secondary/35 text-foreground focus:outline-none focus:border-primary w-full"
              >
                <option value="Laptop">Laptop Workstation</option>
                <option value="Monitor">Desktop Monitor</option>
                <option value="Phone">Mobile Phone</option>
                <option value="Accessories">Peripherals & Keyboard</option>
              </select>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-bold text-muted-foreground uppercase">Asset Model Name</label>
              <input 
                type="text" 
                required 
                placeholder="e.g. MacBook Pro M3 or Dell 24 inch" 
                value={newAssetName} 
                onChange={(e) => setNewAssetName(e.target.value)} 
                className="px-3 py-2 text-sm rounded-xl border border-border bg-secondary/35 text-foreground focus:outline-none focus:border-primary" 
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-bold text-muted-foreground uppercase">Serial Number (Tag)</label>
              <input 
                type="text" 
                placeholder="e.g. SN-98239A8F" 
                value={newAssetSerial} 
                onChange={(e) => setNewAssetSerial(e.target.value)} 
                className="px-3 py-2 text-sm rounded-xl border border-border bg-secondary/35 text-foreground focus:outline-none focus:border-primary" 
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-bold text-muted-foreground uppercase">Allocation Comments</label>
              <textarea 
                value={newAssetComment} 
                onChange={(e) => setNewAssetComment(e.target.value)} 
                className="px-3 py-2 text-sm rounded-xl border border-border bg-secondary/35 text-foreground focus:outline-none focus:border-primary resize-none" 
                rows={2} 
                placeholder="Details of tracking, condition on issue, etc..." 
              />
            </div>

            <div className="flex justify-end gap-2 pt-4 border-t border-border">
              <Button type="button" variant="outline" onClick={() => setShowAssetModal(false)}>Cancel</Button>
              <Button type="submit" variant="primary">Allocate Asset</Button>
            </div>
          </form>
        </Modal>
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

const requestCapacitorLocationPermission = async () => {
  if (typeof window !== 'undefined' && window.Capacitor) {
    try {
      const { Geolocation } = await import('@capacitor/geolocation');
      const permStatus = await Geolocation.checkPermissions();
      if (permStatus.location === 'denied' || permStatus.location === 'prompt') {
        await Geolocation.requestPermissions();
      }
    } catch (e) {
      console.warn("Capacitor Geolocation permission request failed: ", e);
    }
  }
};

function checkGeofence(companyDetails) {
  return new Promise(async (resolve, reject) => {
    // Ask for native permission first
    await requestCapacitorLocationPermission();
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
