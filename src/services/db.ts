// Unified Mock Database Service using LocalStorage
import { Company, SupportTicket } from '../components/superowner/types';
import { INITIAL_COMPANIES, INITIAL_TICKETS } from '../components/superowner/dashboardData';

export interface DBEmployee {
  id: string | number;
  name: string;
  email: string;
  role: string;
  department: string;
  status: string;
  phone: string;
  salary: string;
  avatar: string;
  documents: string[];
  dob?: string;
  gender?: string;
  address?: string;
  joiningDate?: string;
  reportingManager?: string;
  employmentType?: string;
}

export interface DBLeaveRequest {
  id: string;
  employeeId: string | number;
  employeeName: string;
  type: string;
  fromDate: string;
  toDate: string;
  reason: string;
  status: 'Pending' | 'Approved' | 'Rejected' | 'Cancelled';
  appliedDate: string;
  totalDays: number;
}

export interface DBExpenseClaim {
  id: string;
  employeeId: string | number;
  employeeName: string;
  date: string;
  category: string;
  amount: number;
  reason: string;
  status: 'Pending' | 'Approved' | 'Rejected';
}

// Initial Mock Employees (Merged from Admin & Employee portals)
const INITIAL_EMPLOYEES: DBEmployee[] = [
  { 
    id: 1, 
    name: 'Sarah Jenkins', 
    email: 'sarah.j@company.com', 
    role: 'Senior UX Designer', 
    department: 'Design', 
    status: 'Active', 
    phone: '+1 (555) 019-2834', 
    salary: '$88,000', 
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80', 
    documents: ['Profile_Photo.jpg', 'Aadhaar_Card.pdf', 'PAN_Card.pdf', 'Offer_Letter.pdf'],
    dob: '1990-04-12',
    gender: 'Female',
    address: '102 Rosewood Ave, San Francisco, CA 94118',
    joiningDate: '2022-05-10',
    reportingManager: 'Marcus Vance',
    employmentType: 'Full-Time Permanent'
  },
  { 
    id: 2, 
    name: 'Marcus Vance', 
    email: 'marcus.v@company.com', 
    role: 'Engineering Tech Lead', 
    department: 'Engineering', 
    status: 'Active', 
    phone: '+1 (555) 014-9821', 
    salary: '$145,000', 
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80', 
    documents: ['Profile_Photo.jpg', 'Aadhaar_Card.pdf', 'PAN_Card.pdf'],
    dob: '1987-11-20',
    gender: 'Male',
    address: '744 Castro St, San Francisco, CA 94114',
    joiningDate: '2020-09-01',
    reportingManager: 'Sarah Jenkins',
    employmentType: 'Full-Time Permanent'
  },
  { 
    id: 3, 
    name: 'Sophia Patel', 
    email: 'sophia.p@company.com', 
    role: 'Growth Lead Analyst', 
    department: 'Marketing', 
    status: 'Active', 
    phone: '+1 (555) 012-7489', 
    salary: '$92,000', 
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80', 
    documents: ['Profile_Photo.jpg', 'Offer_Letter.pdf'],
    dob: '1993-02-28',
    gender: 'Female',
    address: '883 Market St, San Francisco, CA 94103',
    joiningDate: '2023-11-15',
    reportingManager: 'Marcus Vance',
    employmentType: 'Full-Time Permanent'
  },
  { 
    id: 4, 
    name: 'Alexander Wright', 
    email: 'alexander.wright@itlc.ai', 
    role: 'Senior Software Engineer', 
    department: 'Product Engineering', 
    status: 'Active', 
    phone: '+1 (555) 382-9021', 
    salary: '$120,000', 
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80', 
    documents: ['Profile_Photo.jpg', 'Aadhaar_Card.pdf', 'PAN_Card.pdf', 'Offer_Letter.pdf', 'Appointment_Letter.pdf'],
    dob: '1992-08-24',
    gender: 'Male',
    address: '482 Silver Lake Blvd, Los Angeles, CA 90026',
    joiningDate: '2023-03-15',
    reportingManager: 'Sarah Jenkins (Director of Engineering)',
    employmentType: 'Full-Time Permanent'
  },
  { 
    id: 5, 
    name: 'Diana Prince', 
    email: 'diana.p@company.com', 
    role: 'HR Director', 
    department: 'HR', 
    status: 'Active', 
    phone: '+1 (555) 011-8842', 
    salary: '$115,000', 
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80', 
    documents: ['Profile_Photo.jpg', 'PAN_Card.pdf'],
    dob: '1989-05-18',
    gender: 'Female',
    address: '320 Clay St, San Francisco, CA 94111',
    joiningDate: '2021-02-01',
    reportingManager: 'Sarah Jenkins',
    employmentType: 'Full-Time Permanent'
  }
];

const INITIAL_LEAVE_REQUESTS: DBLeaveRequest[] = [
  {
    id: 'leave_1',
    employeeId: 4,
    employeeName: 'Alexander Wright',
    type: 'Casual Leave',
    fromDate: '2026-07-10',
    toDate: '2026-07-12',
    reason: 'Family event attendance.',
    status: 'Pending',
    appliedDate: '2026-07-01',
    totalDays: 2
  },
  {
    id: 'leave_2',
    employeeId: 1,
    employeeName: 'Sarah Jenkins',
    type: 'Sick Leave',
    fromDate: '2026-06-15',
    toDate: '2026-06-16',
    reason: 'Medical checkup.',
    status: 'Approved',
    appliedDate: '2026-06-14',
    totalDays: 1
  }
];

const INITIAL_EXPENSES: DBExpenseClaim[] = [
  {
    id: 'exp_1',
    employeeId: 4,
    employeeName: 'Alexander Wright',
    date: '2026-06-28',
    category: 'Travel',
    amount: 120.50,
    reason: 'Client meeting transportation.',
    status: 'Pending'
  },
  {
    id: 'exp_2',
    employeeId: 3,
    employeeName: 'Sophia Patel',
    date: '2026-06-20',
    category: 'Food',
    amount: 45.00,
    reason: 'Team lunch.',
    status: 'Approved'
  }
];

export const initDB = () => {
  if (typeof window === 'undefined' || !window.localStorage) return;

  // Only initialize default seed data if the table has NEVER been created (null)
  // NEVER overwrite user-cleared empty arrays '[]' or existing customer records!
  if (localStorage.getItem('hrms_companies') === null) {
    localStorage.setItem('hrms_companies', JSON.stringify(INITIAL_COMPANIES));
  }
  if (localStorage.getItem('hrms_tickets') === null) {
    localStorage.setItem('hrms_tickets', JSON.stringify(INITIAL_TICKETS));
  }
  if (localStorage.getItem('hrms_employees') === null) {
    localStorage.setItem('hrms_employees', JSON.stringify(INITIAL_EMPLOYEES));
  }
  if (localStorage.getItem('hrms_leaves') === null) {
    localStorage.setItem('hrms_leaves', JSON.stringify(INITIAL_LEAVE_REQUESTS));
  }
  if (localStorage.getItem('hrms_expenses') === null) {
    localStorage.setItem('hrms_expenses', JSON.stringify(INITIAL_EXPENSES));
  }
};

export const getCompanies = (): Company[] => {
  initDB();
  return JSON.parse(localStorage.getItem('hrms_companies') || '[]');
};

export const saveCompanies = (companies: Company[]) => {
  localStorage.setItem('hrms_companies', JSON.stringify(companies));
};

export const getTickets = (): SupportTicket[] => {
  initDB();
  return JSON.parse(localStorage.getItem('hrms_tickets') || '[]');
};

export const saveTickets = (tickets: SupportTicket[]) => {
  localStorage.setItem('hrms_tickets', JSON.stringify(tickets));
};

export const getEmployees = (): DBEmployee[] => {
  initDB();
  return JSON.parse(localStorage.getItem('hrms_employees') || '[]');
};

export const saveEmployees = (employees: DBEmployee[]) => {
  localStorage.setItem('hrms_employees', JSON.stringify(employees));
};

export const getLeaves = (): DBLeaveRequest[] => {
  initDB();
  return JSON.parse(localStorage.getItem('hrms_leaves') || '[]');
};

export const saveLeaves = (leaves: DBLeaveRequest[]) => {
  localStorage.setItem('hrms_leaves', JSON.stringify(leaves));
};

export const getExpenses = (): DBExpenseClaim[] => {
  initDB();
  return JSON.parse(localStorage.getItem('hrms_expenses') || '[]');
};

export const saveExpenses = (expenses: DBExpenseClaim[]) => {
  localStorage.setItem('hrms_expenses', JSON.stringify(expenses));
};

export const getLoggedInEmployee = (email: string): DBEmployee | undefined => {
  const employees = getEmployees();
  return employees.find(e => e.email.toLowerCase() === email.toLowerCase());
};
