export interface Company {
  id: string;
  name: string;
  logo: string;
  ownerName: string;
  email: string;
  phone: string;
  employeesCount: number;
  subscriptionPlanId: string;
  storageUsed: number; // in GB
  status: 'active' | 'suspended' | 'trial' | 'expired';
  createdDate: string;
  modulesEnabled: Record<string, boolean>;
  password?: string;
  lat?: number | null;
  lng?: number | null;
  radius?: number;
}

export interface SubscriptionPlan {
  id: string;
  name: string;
  price: number;
  priceMonthly?: number;
  priceAnnual?: number;
  currency?: string;
  billingCycle: 'monthly' | 'yearly';
  trialDays: number;
  employeeLimit: number;
  storageLimit: number; // in GB
  aiCreditsLimit: number;
  tagline?: string;
  badge?: string;
  highlightFeatures?: string[];
  features: {
    payroll: boolean;
    attendance: boolean;
    recruitment: boolean;
    faceRecognition: boolean;
    gpsAttendance: boolean;
    apiAccess: boolean;
    whiteLabel: boolean;
  };
  showOnLandingPage?: boolean;
}

export interface Payment {
  id: string;
  companyId: string;
  companyName: string;
  amount: number;
  gateway: 'stripe' | 'razorpay' | 'paypal' | 'credit_card' | 'upi' | 'bank_transfer';
  status: 'successful' | 'pending' | 'failed';
  timestamp: string;
  invoiceNumber: string;
  currency?: string;
  date?: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'Super Owner' | 'Super Admin' | 'Company Admin' | 'HR' | 'Manager' | 'Employee' | string;
  status: 'active' | 'suspended';
  companyName: string;
  createdDate: string;
  password?: string;
  phone?: string;
}

export interface Coupon {
  id: string;
  code: string;
  discountType: 'percentage' | 'fixed';
  value: number; // percentage or flat amount
  expiryDate: string;
  usageLimit: number;
  usageCount: number;
  status: 'active' | 'inactive';
}

export interface Integration {
  id: string;
  name: string;
  description: string;
  connected: boolean;
}

export interface Webhook {
  id: string;
  url: string;
  events: string[];
  status: 'active' | 'inactive';
}

export interface TicketMessage {
  id: string;
  senderName: string;
  senderRole: string;
  content: string;
  timestamp: string;
  isAgent: boolean;
}

export interface SupportTicket {
  id: string;
  subject: string;
  companyName: string;
  requesterName: string;
  requesterEmail: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'open' | 'pending' | 'resolved';
  createdDate: string;
  messages: TicketMessage[];
}

export interface ActivityLog {
  id: string;
  action: string;
  details: string;
  timestamp: string;
  category: 'company' | 'subscription' | 'payment' | 'user' | 'feature' | 'security' | 'settings';
  actorName: string;
}

// Dummy runtime exports for Declaration Merging to satisfy Vite dev server imports
export const Company = {};
export const SubscriptionPlan = {};
export const Payment = {};
export const User = {};
export const Coupon = {};
export const Integration = {};
export const Webhook = {};
export const TicketMessage = {};
export const SupportTicket = {};
export const ActivityLog = {};
