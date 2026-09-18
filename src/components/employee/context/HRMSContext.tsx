"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { api } from "../../../services/api";
import { applyThemeColor } from "../../../utils/theme";

// Types
export interface EmployeeProfile {
  photo: string;
  id: string;
  fullName: string;
  email: string;
  mobile: string;
  dob: string;
  gender: string;
  address: string;
  joiningDate: string;
  department: string;
  designation: string;
  reportingManager: string;
  employmentType: string;
  companyName?: string;
  name?: string;
  employeeId?: string;
  companyId?: string;
  tenantId?: string;
  companyLogo?: string;
  documents?: any[];
  companyDetails?: {
    lat?: number | null;
    lng?: number | null;
    radius?: number;
    modulesEnabled?: any;
    themeColor?: string;
  } | null;
}

export interface AttendanceRecord {
  date: string;
  checkIn: string;
  checkOut: string;
  breakDuration: string; // HH:MM:SS
  workHours: string;     // HH:MM:SS
  status: "Present" | "Absent" | "Late" | "Half-day";
}

export interface AttendanceCorrection {
  id: string;
  date: string;
  requestedCheckIn: string;
  requestedCheckOut: string;
  reason: string;
  status: "Pending" | "Approved" | "Rejected";
  type?: "Missing Punch" | "Correction" | "Shift Change" | "Overtime";
  managerComment?: string;
}

export interface LeaveRequest {
  id: string;
  type: "Casual Leave" | "Sick Leave" | "Earned Leave" | "Work From Home" | "Comp Off";
  fromDate: string;
  toDate: string;
  reason: string;
  attachmentName: string | null;
  status: "Pending" | "Approved" | "Rejected" | "Cancelled";
  isHalfDay: boolean;
  appliedDate: string;
  totalDays: number;
  currentStep: number; // 1: Submitted, 2: Manager, 3: HR, 4: Final
  attachment?: string;
  managerStatus?: "Pending" | "Approved" | "Rejected";
  managerComment?: string;
}

export interface MeetingItem {
  id: string;
  title: string;
  agenda: string;
  date: string;
  time: string;
  platform: "Google Meet" | "Microsoft Teams" | "Zoom" | string;
  link: string;
  invitees: string;
}

export interface AnnouncementItem {
  id: string;
  title: string;
  content: string;
  type: string;
  date?: string;
  authorName?: string;
}

export interface Payslip {
  id: string;
  month: string;
  year: number;
  grossSalary: number;
  deductions: number;
  netSalary: number;
  bonus: number;
  reimbursement: number;
  taxDeduction: number;
}

export interface Document {
  id: string;
  name: string;
  category: "Contract" | "Identity" | "Compensation" | "Reference" | "KYC" | string;
  issueDate: string;
  fileSize: string;
  status?: string;
  fileData?: string | null;
  fileName?: string | null;
  fileType?: string;
  type?: string;
  canUpload?: boolean;
}

export interface ExpenseClaim {
  id: string;
  date: string;
  category: "Travel" | "Food" | "Fuel" | "Accommodation" | "Other";
  amount: number;
  reason: string;
  receiptName: string | null;
  status: "Pending" | "Approved" | "Rejected";
}

export interface Asset {
  id: string;
  name: string;
  code: string;
  issueDate: string;
  status: "Assigned" | "Return Requested" | "Returned";
}

export interface HelpdeskTicket {
  id: string;
  title: string;
  category: "IT Support" | "HR Support" | "Payroll Support" | "Asset Issue";
  description: string;
  priority: "Low" | "Medium" | "High";
  status: "Open" | "Assigned" | "In Progress" | "Resolved" | "Closed";
  createdAt: string;
}

export interface Course {
  id: string;
  title: string;
  category: string;
  duration: string;
  progress: number; // 0 to 100
  videoUrl: string;
  completed: boolean;
  examPassed: boolean;
  score: number | null;
  certificationCode: string | null;
}

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  category: "leave" | "payroll" | "policy" | "training" | "announcement" | "helpdesk";
  read: boolean;
  date: string;
  link?: string;
}

export interface UserSettings {
  theme: "light" | "dark";
  language: "en" | "es" | "fr" | "de";
  emailNotification: boolean;
  pushNotification: boolean;
  marketingEmail: boolean;
}

interface HRMSContextType {
  // Active Module tab
  activeTab: string;
  setActiveTab: (tab: string) => void;
  activeSubTab: string;
  setActiveSubTab: (subTab: string) => void;
  
  // Profile
  profile: EmployeeProfile;
  updateProfile: (profile: Partial<EmployeeProfile>) => void;
  changePassword: (oldPass: string, newPass: string) => Promise<boolean>;
  
  // Attendance
  isClockedIn: boolean;
  clockInTime: number | null; // Timestamp
  isBreakActive: boolean;
  breakStartTime: number | null; // Timestamp
  totalBreakSecondsToday: number;
  todayWorkSeconds: number;
  attendanceHistory: AttendanceRecord[];
  attendanceCorrections: AttendanceCorrection[];
  clockIn: () => void;
  clockOut: () => void;
  startBreak: () => void;
  endBreak: () => void;
  requestCorrection: (correction: Omit<AttendanceCorrection, "id" | "status">) => void;
  
  // Leaves
  leaveBalances: { casual: number; sick: number; earned: number; compOff: number };
  leaveRequests: LeaveRequest[];
  applyLeave: (leave: Omit<LeaveRequest, "id" | "status" | "currentStep">) => void;
  cancelLeave: (id: string) => void;
  
  // Payslips
  payslips: Payslip[];
  
  // Documents
  documents: Document[];
  
  // Expenses
  expenses: ExpenseClaim[];
  addExpense: (expense: Omit<ExpenseClaim, "id" | "status">) => void;
  
  // Assets
  assets: Asset[];
  requestAssetReturn: (id: string) => void;
  
  // Helpdesk
  tickets: HelpdeskTicket[];
  createTicket: (ticket: Omit<HelpdeskTicket, "id" | "status" | "createdAt">) => void;
  
  // LMS
  courses: Course[];
  updateCourseProgress: (id: string, progress: number) => void;
  completeCourse: (id: string) => void;
  passCourseExam: (id: string, score: number) => void;
  
  // Meetings & Announcements
  meetings: MeetingItem[];
  announcements: AnnouncementItem[];
  
  // Notifications
  notifications: NotificationItem[];
  markNotificationRead: (id: string) => void;
  markAllNotificationsRead: () => void;
  addNotification: (item: Omit<NotificationItem, "id" | "read" | "date">) => void;
  
  // Settings
  settings: UserSettings;
  updateSettings: (settings: Partial<UserSettings>) => void;

  // Holidays
  holidays: any[];

  // Authentication
  isAuthenticated: boolean;
  login: (email: string, pass: string) => Promise<boolean>;
  logout: () => void;
}

// Default Data
const defaultProfile: EmployeeProfile = {
  photo: "",
  id: "EMP-2026-489",
  fullName: "Alexander Wright",
  email: "alexander.wright@itlc.ai",
  mobile: "+1 (555) 382-9021",
  dob: "1992-08-24",
  gender: "Male",
  address: "482 Silver Lake Blvd, Los Angeles, CA 90026",
  joiningDate: "2023-03-15",
  department: "Product Engineering",
  designation: "Senior Software Engineer",
  reportingManager: "Sarah Jenkins (Director of Engineering)",
  employmentType: "Full-Time Permanent",
  documents: [],
};

const defaultAttendanceHistory: AttendanceRecord[] = [];

const defaultAttendanceCorrections: AttendanceCorrection[] = [];

const defaultLeaveRequests: LeaveRequest[] = [];

const defaultPayslips: Payslip[] = [];

const defaultDocuments: Document[] = [
  {
    id: "DOC-OFFER-001",
    name: "Offer_Letter.pdf",
    category: "Contract",
    issueDate: "2026-05-15",
    fileSize: "142 KB",
    status: "Verified"
  },
  {
    id: "DOC-APPOINTMENT-002",
    name: "Appointment_Letter.pdf",
    category: "Contract",
    issueDate: "2026-05-20",
    fileSize: "185 KB",
    status: "Verified"
  },
  {
    id: "DOC-ID-003",
    name: "Corporate_Digital_ID.pdf",
    category: "Identity",
    issueDate: "2026-06-01",
    fileSize: "98 KB",
    status: "Verified"
  },
  {
    id: "DOC-NDA-004",
    name: "NDA_and_Security_Policy.pdf",
    category: "Contract",
    issueDate: "2026-06-01",
    fileSize: "210 KB",
    status: "Verified"
  },
  {
    id: "DOC-HANDBOOK-005",
    name: "Employee_Code_of_Conduct.pdf",
    category: "Reference",
    issueDate: "2026-06-01",
    fileSize: "512 KB",
    status: "Verified"
  }
];

const defaultExpenses: ExpenseClaim[] = [];

const defaultAssets: Asset[] = [];

const defaultTickets: HelpdeskTicket[] = [];

const defaultCourses: Course[] = [];

const defaultNotifications: NotificationItem[] = [];


const defaultSettings: UserSettings = {
  theme: "dark",
  language: "en",
  emailNotification: true,
  pushNotification: true,
  marketingEmail: false,
};

const HRMSContext = createContext<HRMSContextType | undefined>(undefined);

export const HRMSProvider: React.FC<{ children: React.ReactNode; loggedInEmail?: string }> = ({ children, loggedInEmail }) => {
  const [activeTab, setActiveTab] = useState<string>("dashboard");
  const [activeSubTab, setActiveSubTab] = useState<string>("");
  const [hydrated, setHydrated] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(true);

  // States
  const [profile, setProfile] = useState<EmployeeProfile>(defaultProfile);
  const [isClockedIn, setIsClockedIn] = useState<boolean>(false);
  const [clockInTime, setClockInTime] = useState<number | null>(null);
  const [isBreakActive, setIsBreakActive] = useState<boolean>(false);
  const [breakStartTime, setBreakStartTime] = useState<number | null>(null);
  const [totalBreakSecondsToday, setTotalBreakSecondsToday] = useState<number>(0);
  const [todayWorkSeconds, setTodayWorkSeconds] = useState<number>(0);
  
  const [attendanceHistory, setAttendanceHistory] = useState<AttendanceRecord[]>(defaultAttendanceHistory);
  const [attendanceCorrections, setAttendanceCorrections] = useState<AttendanceCorrection[]>(defaultAttendanceCorrections);
  
  const [leaveBalances, setLeaveBalances] = useState({ casual: 12, sick: 8, earned: 18, compOff: 4 });
  const [leaveRequests, setLeaveRequests] = useState<LeaveRequest[]>(defaultLeaveRequests);
  
  const [payslips, setPayslips] = useState<Payslip[]>(defaultPayslips);
  const [documents, setDocuments] = useState<Document[]>(defaultDocuments);
  const [expenses, setExpenses] = useState<ExpenseClaim[]>(defaultExpenses);
  const [assets, setAssets] = useState<Asset[]>(defaultAssets);
  const [tickets, setTickets] = useState<HelpdeskTicket[]>(defaultTickets);
  const [courses, setCourses] = useState<Course[]>(defaultCourses);
  const [meetings, setMeetings] = useState<MeetingItem[]>([]);
  const [announcements, setAnnouncements] = useState<AnnouncementItem[]>([]);
  const [notifications, setNotifications] = useState<NotificationItem[]>(defaultNotifications);
  const [settings, setSettings] = useState<UserSettings>(defaultSettings);
  const [holidays, setHolidays] = useState<any[]>([]);

  // Load profile and business logs live from REST APIs
  useEffect(() => {
    const loadEmployeeData = async () => {
      try {
        const prof = await api.getProfile();
        setProfile(prev => ({
          photo: prof.photo || prof.avatar || prev.photo || "",
          id: prof.id || prof.employeeId || prev.id,
          fullName: prof.fullName || prof.name || prev.fullName,
          email: prof.email || prev.email,
          mobile: prof.phone || prof.mobile || prev.mobile || "",
          dob: prof.dob || prev.dob || "1992-08-24",
          gender: prof.gender || prev.gender || "Male",
          address: prof.address || prev.address || "",
          joiningDate: prof.joiningDate || prev.joiningDate || "",
          department: prof.department || prev.department || "Operations",
          designation: prof.designation || prof.role || prev.designation || "Staff",
          reportingManager: prof.reportingManager || prev.reportingManager || "None",
          employmentType: "Full-Time Permanent",
          companyName: prof.companyName || prev.companyName || "ITLC HRMS",
          companyLogo: prof.companyLogo || prev.companyLogo || "",
          documents: prof.documents && prof.documents.length > 0 ? prof.documents : (prev.documents && prev.documents.length > 0 ? prev.documents : []),
          companyDetails: prof.companyDetails || prev.companyDetails || null
        }));

        if (prof.companyDetails && prof.companyDetails.themeColor) {
          applyThemeColor(prof.companyDetails.themeColor);
        }

        // Load Leaves
        const leavesList = await api.getEmployeeLeaves();
        const mappedLeaves = leavesList.map((l: any) => ({
          id: l.id,
          type: l.type,
          fromDate: l.fromDate,
          toDate: l.toDate,
          reason: l.reason,
          attachmentName: l.attachment ? 'attachment' : null,
          attachment: l.attachment || '',
          status: l.status,
          isHalfDay: Boolean(l.isHalfDay),
          appliedDate: l.appliedDate || l.appliedOn,
          totalDays: l.totalDays,
          currentStep: l.status === 'Approved' ? 4 : l.status === 'Rejected' ? 4 : (l.managerStatus === 'Approved' ? 3 : 2)
        }));
        setLeaveRequests(mappedLeaves);

        // Dynamically compute live leave balances from real DB leaves
        const computedBalances = { casual: 12, sick: 8, earned: 18, compOff: 4 };
        mappedLeaves.forEach((l: any) => {
          if (l.status === 'Approved' || l.status === 'Pending') {
            const days = Number(l.totalDays) || 0;
            if (l.type === 'Casual Leave') computedBalances.casual = Math.max(0, computedBalances.casual - days);
            else if (l.type === 'Sick Leave') computedBalances.sick = Math.max(0, computedBalances.sick - days);
            else if (l.type === 'Earned Leave') computedBalances.earned = Math.max(0, computedBalances.earned - days);
            else if (l.type === 'Comp Off') computedBalances.compOff = Math.max(0, computedBalances.compOff - days);
          }
        });
        setLeaveBalances(computedBalances);

        // Load Expenses
        const expenseList = await api.getEmployeeExpenses();
        const mappedExpenses = expenseList.map((e: any) => ({
          id: e.id,
          date: e.date,
          category: e.category,
          amount: e.amount,
          reason: e.reason,
          receiptName: null,
          status: e.status
        }));
        setExpenses(mappedExpenses);

        // Load Tickets
        const ticketList = await api.getEmployeeTickets();
        const mappedTickets = ticketList.map((t: any) => ({
          id: t.id,
          title: t.subject,
          category: "IT Support" as any,
          description: t.messagesJson ? JSON.parse(t.messagesJson)[0]?.content : '',
          priority: t.priority === 'urgent' ? 'High' : t.priority === 'high' ? 'High' : 'Medium',
          status: t.status === 'open' ? 'Open' : t.status === 'resolved' ? 'Resolved' : 'In Progress',
          createdAt: t.createdDate
        }));
        setTickets(mappedTickets);

        // Load Payslips
        try {
          const payrollList = await api.getEmployeePayroll();
          if (Array.isArray(payrollList)) {
            const mappedPayslips = payrollList.map((p: any) => ({
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
            setPayslips(mappedPayslips);
          }
        } catch (err) {
          console.error("Failed loading employee payslips:", err);
        }

        // Load Attendance History
        try {
          const attList = await api.getEmployeeAttendance();
          if (Array.isArray(attList)) {
            setAttendanceHistory(attList);
            const todayDate = new Date().toISOString().split("T")[0];
            const todayRec = attList.find(r => r.date === todayDate);
            if (todayRec && todayRec.checkIn && !todayRec.checkOut) {
              setIsClockedIn(true);
              const [h, m, s] = todayRec.checkIn.split(':').map(Number);
              const tDate = new Date();
              tDate.setHours(h, m, s, 0);
              setClockInTime(tDate.getTime());
            }
          } else if (attList && attList.length > 0) {
            setAttendanceHistory(attList);
          }
        } catch (e) {
          console.error("Failed to load attendance history from DB:", e);
        }

        // Load Corrections
        try {
          const corrList = await api.getEmployeeCorrections();
          if (corrList) {
            const mappedCorrections = corrList.map((c: any) => ({
              id: c.id,
              date: c.date,
              type: c.type || 'Correction',
              requestedCheckIn: c.requestedCheckIn,
              requestedCheckOut: c.requestedCheckOut,
              reason: c.reason,
              status: c.status,
              managerComment: c.managerComment || ''
            }));
            setAttendanceCorrections(mappedCorrections);
          }
        } catch (e) {
          console.error("Failed to load attendance corrections from DB:", e);
        }

        // Load Meetings
        try {
          const mtgList = await api.getEmployeeMeetings();
          if (Array.isArray(mtgList)) {
            setMeetings(mtgList);
          }
        } catch (e) {
          console.error("Failed to load meetings from DB:", e);
        }

        // Load Announcements
        try {
          const annList = await api.getEmployeeAnnouncements();
          if (Array.isArray(annList)) {
            setAnnouncements(annList);
          }
        } catch (e) {
          console.error("Failed to load announcements from DB:", e);
        }

        // Load Holidays
        try {
          const holsList = await api.getAdminHolidays();
          if (Array.isArray(holsList)) {
            setHolidays(holsList);
          }
        } catch (e) {
          console.error("Failed to load holidays from DB:", e);
        }

        // Dynamically build notifications from leaves, expenses, and tickets
        const readIds = JSON.parse(localStorage.getItem("hrms_read_notification_ids") || "[]");
        const generatedNotifs: NotificationItem[] = [];

        mappedLeaves.forEach((l: any) => {
          const nId = `NTF-leave-${l.id}-${l.status}`;
          const isRead = readIds.includes(nId);
          let title = "Leave Request";
          let message = "";
          if (l.status === 'Approved') {
            title = "Leave Request Approved";
            message = `Your leave request from ${l.fromDate} to ${l.toDate} has been approved.`;
          } else if (l.status === 'Rejected') {
            title = "Leave Request Rejected";
            message = `Your leave request from ${l.fromDate} to ${l.toDate} has been rejected.`;
          } else {
            title = "Leave Request Pending";
            message = `Your leave request from ${l.fromDate} to ${l.toDate} is pending approval.`;
          }
          generatedNotifs.push({
            id: nId,
            title,
            message,
            category: 'leave',
            read: isRead,
            date: l.appliedDate || new Date().toISOString().split('T')[0]
          });
        });

        mappedExpenses.forEach((e: any) => {
          const nId = `NTF-expense-${e.id}-${e.status}`;
          const isRead = readIds.includes(nId);
          let title = "Expense Claim";
          let message = "";
          if (e.status === 'Approved') {
            title = "Expense Claim Approved";
            message = `Your expense claim of $${e.amount} has been approved.`;
          } else if (e.status === 'Rejected') {
            title = "Expense Claim Rejected";
            message = `Your expense claim of $${e.amount} has been rejected.`;
          } else {
            title = "Expense Claim Pending";
            message = `Your expense claim of $${e.amount} is pending approval.`;
          }
          generatedNotifs.push({
            id: nId,
            title,
            message,
            category: 'payroll',
            read: isRead,
            date: e.date || new Date().toISOString().split('T')[0]
          });
        });

        mappedTickets.forEach((t: any) => {
          const nId = `NTF-ticket-${t.id}-${t.status}`;
          const isRead = readIds.includes(nId);
          const statusText = t.status === 'Resolved' ? 'Resolved' : t.status === 'Open' ? 'Open' : 'In Progress';
          generatedNotifs.push({
            id: nId,
            title: `Support Ticket ${statusText}`,
            message: `Your ticket "${t.title}" is currently ${statusText.toLowerCase()}.`,
            category: 'helpdesk',
            read: isRead,
            date: t.createdAt || new Date().toISOString().split('T')[0]
          });
        });

        // Load meetings notifications
        meetings.forEach((m: any) => {
          const nId = `NTF-meeting-${m.id}`;
          const isRead = readIds.includes(nId);
          generatedNotifs.push({
            id: nId,
            title: `New Team Sync Scheduled`,
            message: `"${m.title}" is scheduled for ${m.date} at ${m.time}. Click to join.`,
            category: 'announcement',
            read: isRead,
            date: m.date || new Date().toISOString().split('T')[0],
            link: m.link
          });
        });

        // Load announcements notifications
        announcements.forEach((a: any) => {
          const nId = `NTF-announcement-${a.id}`;
          const isRead = readIds.includes(nId);
          generatedNotifs.push({
            id: nId,
            title: `Notice: ${a.title}`,
            message: a.content,
            category: 'announcement',
            read: isRead,
            date: a.date || new Date().toISOString().split('T')[0]
          });
        });

        // Load tasks and generate live notifications
        try {
          const empTasks = await api.getEmployeeTasks();
          if (Array.isArray(empTasks)) {
            empTasks.forEach((t: any) => {
              const nId = `NTF-task-${t.id}-${t.status}`;
              const isRead = readIds.includes(nId);
              let title = "New Task Assigned";
              let message = `You were assigned: "${t.title}". Deadline: ${t.deadline || 'No deadline'}.`;
              if (t.status === 'Completed') {
                title = "Task Completed";
                message = `Task "${t.title}" is marked as completed.`;
              } else if (t.status === 'In Progress') {
                title = "Task In Progress";
                message = `Task "${t.title}" is currently in progress.`;
              }
              generatedNotifs.push({
                id: nId,
                title,
                message,
                category: 'policy' as any,
                read: isRead,
                date: t.deadline || t.createdAt?.split('T')[0] || new Date().toISOString().split('T')[0]
              });
            });
          }
        } catch (e) {
          console.error("Failed to load employee tasks for notifications:", e);
        }

        // Sort by date descending
        generatedNotifs.sort((a, b) => b.date.localeCompare(a.date));
        setNotifications(generatedNotifs);

      } catch (err) {
        console.error("Failed to load employee dashboard data from REST backend:", err);
      }
    };
    loadEmployeeData();

    const handleSync = () => {
      loadEmployeeData();
    };

    window.addEventListener('profile_updated', handleSync);
    window.addEventListener('company_updated', handleSync);
    window.addEventListener('multi_tenant_updated', handleSync);
    window.addEventListener('tasks_updated', handleSync);
    window.addEventListener('leaves_updated', handleSync);
    window.addEventListener('attendance_updated', handleSync);
    window.addEventListener('corrections_updated', handleSync);
    window.addEventListener('storage', handleSync);

    const interval = setInterval(loadEmployeeData, 10000);
    return () => {
      clearInterval(interval);
      window.removeEventListener('profile_updated', handleSync);
      window.removeEventListener('company_updated', handleSync);
      window.removeEventListener('multi_tenant_updated', handleSync);
      window.removeEventListener('tasks_updated', handleSync);
      window.removeEventListener('leaves_updated', handleSync);
      window.removeEventListener('attendance_updated', handleSync);
      window.removeEventListener('corrections_updated', handleSync);
      window.removeEventListener('storage', handleSync);
    };
  }, [loggedInEmail]);

  // Hydrate states from localStorage (only local UI configurations)
  useEffect(() => {
    if (typeof window !== "undefined") {
      const storedClockedIn = localStorage.getItem("hrms_isClockedIn");
      const storedClockInTime = localStorage.getItem("hrms_clockInTime");
      const storedBreakActive = localStorage.getItem("hrms_isBreakActive");
      const storedBreakStartTime = localStorage.getItem("hrms_breakStartTime");
      const storedBreakSecs = localStorage.getItem("hrms_totalBreakSeconds");
      const storedWorkSecs = localStorage.getItem("hrms_todayWorkSeconds");
      const storedAttHistory = localStorage.getItem("hrms_attendanceHistory");
      const storedAttCorr = localStorage.getItem("hrms_attendanceCorrections");
      const storedLeaveBalances = localStorage.getItem("hrms_leaveBalances");
      const storedAssets = localStorage.getItem("hrms_assets");
      const storedCourses = localStorage.getItem("hrms_courses");
      const storedNotifications = localStorage.getItem("hrms_notifications");
      const storedSettings = localStorage.getItem("hrms_settings");
      const storedAuth = localStorage.getItem("hrms_isAuthenticated");

      if (storedAuth) setIsAuthenticated(JSON.parse(storedAuth));
      if (storedClockedIn) setIsClockedIn(JSON.parse(storedClockedIn));
      if (storedClockInTime) setClockInTime(JSON.parse(storedClockInTime));
      if (storedBreakActive) setIsBreakActive(JSON.parse(storedBreakActive));
      if (storedBreakStartTime) setBreakStartTime(JSON.parse(storedBreakStartTime));
      if (storedBreakSecs) setTotalBreakSecondsToday(JSON.parse(storedBreakSecs));
      if (storedWorkSecs) setTodayWorkSeconds(JSON.parse(storedWorkSecs));
      if (storedAttHistory) setAttendanceHistory(JSON.parse(storedAttHistory));
      if (storedAttCorr) setAttendanceCorrections(JSON.parse(storedAttCorr));
      if (storedLeaveBalances) setLeaveBalances(JSON.parse(storedLeaveBalances));
      if (storedAssets) setAssets(JSON.parse(storedAssets));
      if (storedCourses) setCourses(JSON.parse(storedCourses));
      if (storedNotifications) setNotifications(JSON.parse(storedNotifications));
      if (storedSettings) {
        const parsedSettings = JSON.parse(storedSettings);
        setSettings(parsedSettings);
        if (parsedSettings.theme === "dark") {
          document.documentElement.classList.add("dark");
        } else {
          document.documentElement.classList.remove("dark");
        }
      } else {
        document.documentElement.classList.add("dark");
      }
      setHydrated(true);
    }
  }, []);



  useEffect(() => {
    if (hydrated) {
      localStorage.setItem("hrms_isClockedIn", JSON.stringify(isClockedIn));
      localStorage.setItem("hrms_clockInTime", JSON.stringify(clockInTime));
      localStorage.setItem("hrms_isBreakActive", JSON.stringify(isBreakActive));
      localStorage.setItem("hrms_breakStartTime", JSON.stringify(breakStartTime));
      localStorage.setItem("hrms_totalBreakSeconds", JSON.stringify(totalBreakSecondsToday));
      localStorage.setItem("hrms_todayWorkSeconds", JSON.stringify(todayWorkSeconds));
    }
  }, [isClockedIn, clockInTime, isBreakActive, breakStartTime, totalBreakSecondsToday, todayWorkSeconds, hydrated]);

  useEffect(() => {
    if (hydrated) localStorage.setItem("hrms_attendanceHistory", JSON.stringify(attendanceHistory));
  }, [attendanceHistory, hydrated]);

  useEffect(() => {
    if (hydrated) localStorage.setItem("hrms_attendanceCorrections", JSON.stringify(attendanceCorrections));
  }, [attendanceCorrections, hydrated]);

  useEffect(() => {
    if (hydrated) localStorage.setItem("hrms_leaveBalances", JSON.stringify(leaveBalances));
  }, [leaveBalances, hydrated]);

  useEffect(() => {
    if (hydrated) localStorage.setItem("hrms_assets", JSON.stringify(assets));
  }, [assets, hydrated]);

  useEffect(() => {
    if (hydrated) localStorage.setItem("hrms_courses", JSON.stringify(courses));
  }, [courses, hydrated]);

  useEffect(() => {
    if (hydrated) localStorage.setItem("hrms_notifications", JSON.stringify(notifications));
  }, [notifications, hydrated]);

  useEffect(() => {
    if (hydrated) {
      localStorage.setItem("hrms_settings", JSON.stringify(settings));
      if (settings.theme === "dark") {
        document.documentElement.classList.add("dark");
      } else {
        document.documentElement.classList.remove("dark");
      }
    }
  }, [settings, hydrated]);

  useEffect(() => {
    if (hydrated) {
      localStorage.setItem("hrms_isAuthenticated", JSON.stringify(isAuthenticated));
    }
  }, [isAuthenticated, hydrated]);

  // Live Timer effect for clocked-in / break state
  useEffect(() => {
    let timer: any;
    if (isClockedIn && !isBreakActive && clockInTime !== null) {
      timer = setInterval(() => {
        // Calculate work seconds: elapsed time since clockIn minus break time
        const elapsedTotal = Math.floor((Date.now() - clockInTime) / 1000);
        const actualWork = Math.max(0, elapsedTotal - totalBreakSecondsToday);
        setTodayWorkSeconds(actualWork);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [isClockedIn, isBreakActive, clockInTime, totalBreakSecondsToday]);

  // Functions
  const clockIn = async () => {
    if (profile.companyDetails) {
      try {
        await checkGeofence(profile.companyDetails);
      } catch (err: any) {
        alert("Geofence Restriction: " + err.message);
        return;
      }
    }

    const now = new Date();
    const dateStr = now.toISOString().split("T")[0];
    const inTimeStr = now.toLocaleTimeString("en-US", { hour12: false });
    
    try {
      const record = await api.punchIn({
        date: dateStr,
        checkIn: inTimeStr,
        status: "Present",
        employeeId: profile.employeeId || profile.id,
        employeeName: profile.name || profile.fullName,
        companyId: profile.companyId || profile.tenantId
      } as any);
      
      setAttendanceHistory(prev => [record, ...prev]);
    } catch (err: any) {
      console.error("Failed to punch in on database:", err.message);
    }

    setIsClockedIn(true);
    setClockInTime(Date.now());
    setIsBreakActive(false);
    setBreakStartTime(null);
    setTotalBreakSecondsToday(0);
    setTodayWorkSeconds(0);

    // Push notification
    addNotification({
      title: "Attendance Marked Successfully",
      message: `You checked in at ${now.toLocaleTimeString()}. Have a productive day!`,
      category: "policy",
    });
  };

  const formatSeconds = (totalSeconds: number): string => {
    const hrs = Math.floor(totalSeconds / 3600);
    const mins = Math.floor((totalSeconds % 3600) / 60);
    const secs = totalSeconds % 60;
    return `${hrs.toString().padStart(2, "0")}:${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const clockOut = async () => {
    if (!isClockedIn || clockInTime === null) return;

    if (profile.companyDetails) {
      try {
        await checkGeofence(profile.companyDetails);
      } catch (err: any) {
        alert("Geofence Restriction: " + err.message);
        return;
      }
    }
    
    // Stop break if active
    let finalBreakSecs = totalBreakSecondsToday;
    if (isBreakActive && breakStartTime !== null) {
      finalBreakSecs += Math.floor((Date.now() - breakStartTime) / 1000);
    }

    const elapsedTotal = Math.floor((Date.now() - clockInTime) / 1000);
    const finalWorkSecs = Math.max(0, elapsedTotal - finalBreakSecs);

    const now = new Date();
    const dateStr = now.toISOString().split("T")[0];
    const outTimeStr = now.toLocaleTimeString("en-US", { hour12: false });
    const breakStr = formatSeconds(finalBreakSecs);
    const workStr = formatSeconds(finalWorkSecs);
    const calculatedStatus = finalWorkSecs >= 28800 ? "Present" : "Half-day";

    try {
      const record = await api.punchOut({
        date: dateStr,
        checkOut: outTimeStr,
        breakDuration: breakStr,
        workHours: workStr,
        status: calculatedStatus,
        employeeId: profile.employeeId || profile.id,
        employeeName: profile.name || profile.fullName,
        companyId: profile.companyId || profile.tenantId
      });

      setAttendanceHistory(prev => prev.map(rec => rec.date === dateStr ? record : rec));
    } catch (err: any) {
      console.error("Failed to punch out on database:", err.message);
      // Fallback update local state anyway
      const fallbackRecord: AttendanceRecord = {
        date: dateStr,
        checkIn: new Date(clockInTime).toLocaleTimeString("en-US", { hour12: false }),
        checkOut: outTimeStr,
        breakDuration: breakStr,
        workHours: workStr,
        status: calculatedStatus
      };
      setAttendanceHistory(prev => prev.map(rec => rec.date === dateStr ? fallbackRecord : rec));
    }

    setIsClockedIn(false);
    setClockInTime(null);
    setIsBreakActive(false);
    setBreakStartTime(null);
    setTotalBreakSecondsToday(0);
    setTodayWorkSeconds(0);

    addNotification({
      title: "Punch Out Successful",
      message: `You checked out at ${outTimeStr}. Total work time: ${workStr}.`,
      category: "policy",
    });
  };

  const startBreak = () => {
    if (!isClockedIn || isBreakActive) return;
    setIsBreakActive(true);
    setBreakStartTime(Date.now());
  };

  const endBreak = () => {
    if (!isClockedIn || !isBreakActive || breakStartTime === null) return;
    const breakSegment = Math.floor((Date.now() - breakStartTime) / 1000);
    setTotalBreakSecondsToday((prev) => prev + breakSegment);
    setIsBreakActive(false);
    setBreakStartTime(null);
  };

  const requestCorrection = async (correction: Omit<AttendanceCorrection, "id" | "status">) => {
    try {
      const result = await api.createEmployeeCorrection({
        date: correction.date,
        type: correction.type || 'Correction',
        requestedCheckIn: correction.requestedCheckIn,
        requestedCheckOut: correction.requestedCheckOut,
        reason: correction.reason
      });

      const newCorrection: AttendanceCorrection = {
        id: result.id,
        date: result.date,
        type: result.type as any,
        requestedCheckIn: result.requestedCheckIn,
        requestedCheckOut: result.requestedCheckOut,
        reason: result.reason,
        status: result.status as any,
        managerComment: result.managerComment || ''
      };

      setAttendanceCorrections((prev) => [newCorrection, ...prev]);

      addNotification({
        title: "Regularization Submitted",
        message: `Request for ${correction.date} submitted for approval.`,
        category: "policy",
      });
    } catch (err: any) {
      console.error(err);
      alert("Failed to submit regularization request");
    }
  };

  const applyLeave = async (leave: Omit<LeaveRequest, "id" | "status" | "currentStep">) => {
    try {
      const result = await api.createLeaveRequest({
        type: leave.type,
        fromDate: leave.fromDate,
        toDate: leave.toDate,
        reason: leave.reason,
        totalDays: leave.totalDays,
        attachment: leave.attachment || ''
      });

      const mappedRequest: LeaveRequest = {
        id: result.id,
        type: result.type as any,
        fromDate: result.fromDate,
        toDate: result.toDate,
        reason: result.reason,
        attachmentName: leave.attachmentName,
        attachment: result.attachment || '',
        status: result.status as any,
        isHalfDay: leave.isHalfDay,
        appliedDate: result.appliedDate,
        totalDays: result.totalDays,
        currentStep: 1
      };

      setLeaveRequests((prev) => [mappedRequest, ...prev]);

      // Deduct balances (simulated)
      setLeaveBalances((prev) => {
        const copy = { ...prev };
        if (leave.type === "Casual Leave") copy.casual = Math.max(0, copy.casual - leave.totalDays);
        if (leave.type === "Sick Leave") copy.sick = Math.max(0, copy.sick - leave.totalDays);
        if (leave.type === "Earned Leave") copy.earned = Math.max(0, copy.earned - leave.totalDays);
        if (leave.type === "Comp Off") copy.compOff = Math.max(0, copy.compOff - leave.totalDays);
        return copy;
      });

      addNotification({
        title: "Leave Application Submitted",
        message: `Applied for ${leave.type} from ${leave.fromDate} to ${leave.toDate}. Pending Admin/HR approval.`,
        category: "leave",
      });
    } catch (err: any) {
      console.error("Apply leave failed:", err);
    }
  };

  const cancelLeave = (id: string) => {
    const request = leaveRequests.find((r) => r.id === id);
    if (!request) return;

    // Refund balances
    if (request.status !== "Cancelled" && request.status !== "Rejected") {
      setLeaveBalances((prev) => {
        const copy = { ...prev };
        if (request.type === "Casual Leave") copy.casual += request.totalDays;
        if (request.type === "Sick Leave") copy.sick += request.totalDays;
        if (request.type === "Earned Leave") copy.earned += request.totalDays;
        if (request.type === "Comp Off") copy.compOff += request.totalDays;
        return copy;
      });
    }

    setLeaveRequests((prev) =>
      prev.map((r) => (r.id === id ? { ...r, status: "Cancelled", currentStep: 4 } : r))
    );

    // Persist cancellation to backend REST API
    try {
      api.updateAdminLeave(id, "Cancelled");
    } catch (e) {
      console.warn("Failed to persist leave cancellation to backend:", e);
    }

    addNotification({
      title: "Leave Request Cancelled",
      message: `Your leave request ${id} has been cancelled and balances restored.`,
      category: "leave",
    });
  };

  const updateProfile = async (updatedFields: Partial<EmployeeProfile>) => {
    try {
      const payload: any = {
        id: profile.id,
        email: profile.email,
        employeeId: profile.id,
        role: profile.designation || 'Employee',
        isEmployee: true
      };
      if (updatedFields.fullName !== undefined) payload.name = updatedFields.fullName;
      if (updatedFields.mobile !== undefined) payload.phone = updatedFields.mobile;
      if (updatedFields.dob !== undefined) payload.dob = updatedFields.dob;
      if (updatedFields.gender !== undefined) payload.gender = updatedFields.gender;
      if (updatedFields.address !== undefined) payload.address = updatedFields.address;
      if (updatedFields.photo !== undefined) {
        payload.avatar = updatedFields.photo;
        payload.photo = updatedFields.photo;
      }
      if (updatedFields.documents !== undefined) payload.documents = updatedFields.documents;

      setProfile((prev) => ({ ...prev, ...updatedFields }));
      await api.updateProfile(payload);
      if (profile.id) {
        try {
          await api.updateEmployee(profile.id, payload);
        } catch {}
      }
      
      addNotification({
        title: "Profile Saved",
        message: "Your profile changes and documents have been saved to the database.",
        category: "policy"
      });
    } catch (err: any) {
      console.error(err);
      alert("Failed to update profile: " + (err.message || err));
    }
  };

  const changePassword = async (oldPass: string, newPass: string): Promise<boolean> => {
    try {
      await api.changePassword({ currentPassword: oldPass, newPassword: newPass });
      addNotification({
        title: "Password Updated Successfully",
        message: "Your account password has been changed. Use your new password at next login.",
        category: "policy",
      });
      return true;
    } catch (err: any) {
      alert(err.message || "Failed to change password");
      return false;
    }
  };

  const addExpense = async (claim: Omit<ExpenseClaim, "id" | "status">) => {
    try {
      const result = await api.createExpenseClaim({
        date: claim.date,
        category: claim.category,
        amount: claim.amount,
        reason: claim.reason
      });

      const newClaim: ExpenseClaim = {
        id: result.id,
        date: result.date,
        category: result.category as any,
        amount: result.amount,
        reason: result.reason,
        receiptName: null,
        status: result.status
      };

      setExpenses((prev) => [newClaim, ...prev]);

      addNotification({
        title: "Expense Claim Submitted",
        message: `Claim for $${claim.amount} under ${claim.category} submitted.`,
        category: "payroll",
      });
    } catch (err) {
      console.error(err);
    }
  };

  const requestAssetReturn = (id: string) => {
    setAssets((prev) =>
      prev.map((asset) => {
        if (asset.id === id) {
          addNotification({
            title: "Asset Return Initiated",
            message: `Return request for ${asset.name} (${asset.code}) has been received by IT inventory.`,
            category: "announcement",
          });
          return { ...asset, status: "Return Requested" };
        }
        return asset;
      })
    );
  };

  const createTicket = async (ticket: Omit<HelpdeskTicket, "id" | "status" | "createdAt">) => {
    try {
      const result = await api.createSupportTicket({
        subject: ticket.title,
        priority: ticket.priority.toLowerCase(),
        description: ticket.description
      });

      const newTicket: HelpdeskTicket = {
        id: result.id,
        title: result.subject,
        category: ticket.category,
        description: ticket.description,
        priority: ticket.priority,
        status: "Open",
        createdAt: result.createdDate
      };

      setTickets((prev) => [newTicket, ...prev]);

      addNotification({
        title: "Helpdesk Ticket Opened",
        message: `Ticket #${newTicket.id} has been created. IT support will review shortly.`,
        category: "helpdesk",
      });

      // Auto-update ticket status sequence for demo interactivity
      setTimeout(() => {
        setTickets((prev) =>
          prev.map((t) => {
            if (t.id === newTicket.id) {
              addNotification({
                title: `Ticket #${t.id} Assigned`,
                message: `Ticket "${t.title}" has been assigned to support technician Mark Davis.`,
                category: "helpdesk",
              });
              return { ...t, status: "Assigned" };
            }
            return t;
          })
        );

        setTimeout(() => {
          setTickets((prev) =>
            prev.map((t) => {
              if (t.id === newTicket.id) {
                addNotification({
                  title: `Ticket #${t.id} in Progress`,
                  message: `Work has started on ticket "${t.title}".`,
                  category: "helpdesk",
                });
                return { ...t, status: "In Progress" };
              }
              return t;
            })
          );
        }, 5000);
      }, 4000);
    } catch (err) {
      console.error(err);
    }
  };

  const updateCourseProgress = (id: string, progress: number) => {
    setCourses((prev) =>
      prev.map((course) => {
        if (course.id === id) {
          const completed = progress >= 100;
          return { ...course, progress, completed };
        }
        return course;
      })
    );
  };

  const completeCourse = (id: string) => {
    setCourses((prev) =>
      prev.map((course) => {
        if (course.id === id) {
          return { ...course, progress: 100, completed: true };
        }
        return course;
      })
    );
  };

  const passCourseExam = (id: string, score: number) => {
    const certCode = `CERT-ITLC-${Math.floor(100000 + Math.random() * 900000)}`;
    setCourses((prev) =>
      prev.map((course) => {
        if (course.id === id) {
          addNotification({
            title: "Course Exam Passed!",
            message: `Congratulations! You passed the exam for "${course.title}" with a score of ${score}%. Certificate generated.`,
            category: "training",
          });
          return {
            ...course,
            progress: 100,
            completed: true,
            examPassed: true,
            score,
            certificationCode: certCode,
          };
        }
        return course;
      })
    );
  };

  const addNotification = (item: Omit<NotificationItem, "id" | "read" | "date">) => {
    const now = new Date();
    const formattedDate = `${now.toISOString().split("T")[0]} ${now.toLocaleTimeString("en-US", { hour12: false, hour: '2-digit', minute: '2-digit' })}`;
    
    const newNtf: NotificationItem = {
      ...item,
      id: `NTF-${Math.floor(10 + Math.random() * 90)}`,
      read: false,
      date: formattedDate,
    };
    
    setNotifications((prev) => [newNtf, ...prev]);
  };

  const markNotificationRead = (id: string) => {
    const readIds = JSON.parse(localStorage.getItem("hrms_read_notification_ids") || "[]");
    if (!readIds.includes(id)) {
      readIds.push(id);
      localStorage.setItem("hrms_read_notification_ids", JSON.stringify(readIds));
    }
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  };

  const markAllNotificationsRead = () => {
    const readIds = JSON.parse(localStorage.getItem("hrms_read_notification_ids") || "[]");
    notifications.forEach((n) => {
      if (!readIds.includes(n.id)) {
        readIds.push(n.id);
      }
    });
    localStorage.setItem("hrms_read_notification_ids", JSON.stringify(readIds));
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const updateSettings = (updatedSettings: Partial<UserSettings>) => {
    setSettings((prev) => ({ ...prev, ...updatedSettings }));
  };

  const login = async (email: string, pass: string): Promise<boolean> => {
    try {
      const response = await api.login({ email, password: pass });
      const token = response?.token || localStorage.getItem('hrms_jwt_token');
      if (response && (response.token || response.id || response.email || token)) {
        if (token) {
          localStorage.setItem('hrms_jwt_token', token);
        }
        
        // Load profile and authenticate
        const prof = (await api.getProfile()) || response;
        setProfile(prev => ({
          photo: prof.photo || prof.avatar || prev.photo || "",
          id: prof.id || prof.employeeId || prev.id || "EMP-001",
          fullName: prof.fullName || prof.name || prev.fullName || "Employee",
          email: prof.email || email || prev.email,
          mobile: prof.phone || prof.mobile || prev.mobile || "",
          dob: prof.dob || prev.dob || "1992-08-24",
          gender: prof.gender || prev.gender || "Male",
          address: prof.address || prev.address || "",
          joiningDate: prof.joiningDate || prev.joiningDate || "",
          department: prof.department || prev.department || "Operations",
          designation: prof.designation || prof.role || prev.designation || "Staff",
          reportingManager: prof.reportingManager || prev.reportingManager || "None",
          employmentType: "Full-Time Permanent",
          companyName: prof.companyName || prev.companyName || "ITLC HRMS",
          companyLogo: prof.companyLogo || prev.companyLogo || "",
          documents: prof.documents && prof.documents.length > 0 ? prof.documents : (prev.documents && prev.documents.length > 0 ? prev.documents : []),
          companyDetails: prof.companyDetails || prev.companyDetails || null
        }));

        if (prof.companyDetails && prof.companyDetails.themeColor) {
          applyThemeColor(prof.companyDetails.themeColor);
        }

        setIsAuthenticated(true);
        return true;
      }
      return false;
    } catch (err) {
      console.error("Login failed:", err);
      return false;
    }
  };

  const logout = () => {
    localStorage.removeItem('hrms_jwt_token');
    setIsAuthenticated(false);
    setActiveTab("dashboard");
  };

  return (
    <HRMSContext.Provider
      value={{
        activeTab,
        setActiveTab,
        activeSubTab,
        setActiveSubTab,
        profile,
        updateProfile,
        changePassword,
        isClockedIn,
        clockInTime,
        isBreakActive,
        breakStartTime,
        totalBreakSecondsToday,
        todayWorkSeconds,
        attendanceHistory,
        attendanceCorrections,
        clockIn,
        clockOut,
        startBreak,
        endBreak,
        requestCorrection,
        leaveBalances,
        leaveRequests,
        applyLeave,
        cancelLeave,
        payslips,
        documents,
        expenses,
        addExpense,
        assets,
        requestAssetReturn,
        tickets,
        createTicket,
        courses,
        updateCourseProgress,
        completeCourse,
        passCourseExam,
        meetings,
        announcements,
        notifications,
        markNotificationRead,
        markAllNotificationsRead,
        addNotification,
        settings,
        updateSettings,
        holidays,
        isAuthenticated,
        login,
        logout,
      }}
    >
      {children}
    </HRMSContext.Provider>
  );
};

export const useHRMS = () => {
  const context = useContext(HRMSContext);
  if (context === undefined) {
    throw new Error("useHRMS must be used within a HRMSProvider");
  }
  return context;
};

// Dummy runtime exports for Declaration Merging to satisfy Vite dev server imports
export const EmployeeProfile = {};
export const AttendanceRecord = {};
export const AttendanceCorrection = {};
export const LeaveRequest = {};
export const Payslip = {};
export const Document = {};
export const ExpenseClaim = {};
export const Asset = {};
export const HelpdeskTicket = {};
export const Course = {};
export const NotificationItem = {};
export const UserSettings = {};

// Geofence helper functions
export function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
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
  if (typeof window !== 'undefined' && (window as any).Capacitor) {
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

export function checkGeofence(companyDetails: { lat?: number | null; lng?: number | null; radius?: number } | null): Promise<boolean> {
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
          companyDetails.lat!,
          companyDetails.lng!
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
