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

// Initial Employees
const INITIAL_EMPLOYEES: DBEmployee[] = [];

const INITIAL_LEAVE_REQUESTS: DBLeaveRequest[] = [];

const INITIAL_EXPENSES: DBExpenseClaim[] = [];

export const initDB = () => {
  if (typeof window === 'undefined' || !window.localStorage) return;

  // Clean out any stale demo employees from browser cache
  try {
    const raw = localStorage.getItem('hrms_employees');
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.some(e => e && (e.email === 'manager@gmail.com' || e.email === 'emp@gmail.com' || e.email === 'sarah.j@company.com' || e.email === 'diana.p@company.com' || e.name === 'Sarah Jenkins'))) {
        localStorage.setItem('hrms_employees', JSON.stringify([]));
      }
    }
  } catch {}

  // Clean out stale demo companies from browser cache without deleting user companies
  try {
    ['hrms_companies_data', 'itlc_multi_tenants', 'multi_tenants_data'].forEach(key => {
      const raw = localStorage.getItem(key);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed) && parsed.some(c => c && (c.name?.includes('Demo Corp') || c.domain === 'democorp' || c.id === 'TEN-485'))) {
          const cleaned = parsed.filter(c => c && !c.name?.includes('Demo Corp') && c.domain !== 'democorp' && c.id !== 'TEN-485');
          localStorage.setItem(key, JSON.stringify(cleaned));
        }
      }
    });
  } catch {}

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
