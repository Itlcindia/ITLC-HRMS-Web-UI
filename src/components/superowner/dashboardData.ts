import { Company, SubscriptionPlan, Payment, User, Coupon, SupportTicket, ActivityLog } from './types';

export const INITIAL_PLANS: SubscriptionPlan[] = [
  {
    id: 'demo',
    name: 'DEMO',
    price: 199,
    priceMonthly: 199,
    priceAnnual: 1990,
    billingCycle: 'monthly',
    trialDays: 14,
    employeeLimit: 10,
    storageLimit: 10,
    aiCreditsLimit: 100,
    showOnLandingPage: true,
    tagline: 'Ideal for small businesses and agile teams.',
    badge: 'STARTER TIER',
    highlightFeatures: [
      'Up to 10 Employee Seats',
      'Real-time Biometric Radar & GPS',
      'Automated GST Tax Invoicing',
      'Deals & Kanban Sales Pipeline',
      'Automated Salary Slip Generation'
    ],
    features: {
      payroll: true,
      attendance: true,
      recruitment: true,
      faceRecognition: false,
      gpsAttendance: true,
      apiAccess: false,
      whiteLabel: false
    }
  },
  {
    id: 'starter',
    name: 'STARTER',
    price: 499,
    priceMonthly: 499,
    priceAnnual: 4990,
    billingCycle: 'monthly',
    trialDays: 0,
    employeeLimit: 50,
    storageLimit: 50,
    aiCreditsLimit: 250,
    showOnLandingPage: true,
    tagline: 'Ideal for small businesses and agile teams.',
    badge: 'MOST POPULAR',
    highlightFeatures: [
      'Up to 50 Employee Seats',
      'Real-time Biometric Radar & GPS',
      'Automated GST Tax Invoicing',
      'Multi-Branch Attendance Geofencing',
      'Automated 1-Click Payroll Engine'
    ],
    features: {
      payroll: true,
      attendance: true,
      recruitment: true,
      faceRecognition: true,
      gpsAttendance: true,
      apiAccess: true,
      whiteLabel: false
    }
  },
  {
    id: 'premium',
    name: 'Premium',
    price: 999,
    priceMonthly: 999,
    priceAnnual: 9990,
    billingCycle: 'monthly',
    trialDays: 0,
    employeeLimit: 100,
    storageLimit: 100,
    aiCreditsLimit: 500,
    showOnLandingPage: true,
    tagline: 'Ideal for small businesses and agile teams.',
    badge: 'PREMIUM & SCALING',
    highlightFeatures: [
      'Up to 100 Employee Seats',
      'Real-time Biometric Radar & GPS',
      'Automated GST Tax Invoicing',
      'Super Owner Multi-Tenant Governance',
      'Dedicated 24/7 Priority Support'
    ],
    features: {
      payroll: true,
      attendance: true,
      recruitment: true,
      faceRecognition: true,
      gpsAttendance: true,
      apiAccess: true,
      whiteLabel: true
    }
  }
];

export const INITIAL_COMPANIES: Company[] = [];
export const INITIAL_PAYMENTS: Payment[] = [];
export const INITIAL_USERS: User[] = [];
export const INITIAL_COUPONS: Coupon[] = [];
export const INITIAL_TICKETS: SupportTicket[] = [];
export const INITIAL_LOGS: ActivityLog[] = [];
