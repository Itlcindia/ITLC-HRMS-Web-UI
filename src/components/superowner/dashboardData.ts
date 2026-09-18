import { Company, SubscriptionPlan, Payment, User, Coupon, SupportTicket, ActivityLog } from './types';

export const INITIAL_PLANS: SubscriptionPlan[] = [
  {
    id: 'demo',
    name: 'demo',
    price: 1,
    priceMonthly: 1,
    priceAnnual: 10,
    billingCycle: 'monthly',
    trialDays: 14,
    employeeLimit: 5,
    storageLimit: 2,
    aiCreditsLimit: 500,
    showOnLandingPage: true,
    tagline: 'Enterprise plan',
    badge: 'ACTIVE PLAN',
    highlightFeatures: [
      'Up to 5 Employee Seats',
      'Real-time Biometric Radar & GPS',
      'Automated GST Tax Invoicing',
      'Automated 1-Click Payroll Engine'
    ],
    features: {
      payroll: true,
      attendance: true,
      recruitment: true,
      faceRecognition: false,
      gpsAttendance: false,
      apiAccess: false,
      whiteLabel: false
    }
  }
];

export const INITIAL_COMPANIES: Company[] = [];
export const INITIAL_PAYMENTS: Payment[] = [];
export const INITIAL_USERS: User[] = [];
export const INITIAL_COUPONS: Coupon[] = [];
export const INITIAL_TICKETS: SupportTicket[] = [];
export const INITIAL_LOGS: ActivityLog[] = [];
