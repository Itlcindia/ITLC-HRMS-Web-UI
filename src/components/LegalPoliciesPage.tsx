import React, { useState, useEffect } from 'react';
import { LandingHeader } from './LandingHeader';
import { LandingFooter } from './LandingFooter';
import { 
  FileText, 
  ShieldCheck, 
  RefreshCw, 
  Truck, 
  CreditCard, 
  Printer, 
  Copy, 
  Check, 
  Mail, 
  Building2, 
  MapPin, 
  ChevronRight,
  Shield,
  Clock,
  ArrowRight
} from 'lucide-react';

export type PolicyType = 'terms' | 'privacy' | 'refund' | 'shipping' | 'pricing-policy';

export interface LegalPoliciesPageProps {
  initialPolicy?: PolicyType;
  onBackToHome: () => void;
  onGetStarted: () => void;
  onOpenSignIn: () => void;
  onOpenSearch: () => void;
  onNavigateTo: (page: string) => void;
  onPolicyChange?: (policy: PolicyType) => void;
}

interface PolicyTabMeta {
  id: PolicyType;
  title: string;
  badge: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  path: string;
}

const POLICY_TABS: PolicyTabMeta[] = [
  { id: 'terms', title: 'Terms & Conditions', badge: 'Legal Agreement', icon: FileText, path: '/terms' },
  { id: 'privacy', title: 'Privacy Policy', badge: 'Data Protection & DPDPA', icon: ShieldCheck, path: '/privacy' },
  { id: 'refund', title: 'Cancellation & Refund', badge: 'Billing & Returns', icon: RefreshCw, path: '/cancellation-refund' },
  { id: 'shipping', title: 'Shipping & Delivery', badge: 'Digital Service Fulfillment', icon: Truck, path: '/shipping-policy' },
  { id: 'pricing-policy', title: 'Pricing Policy', badge: 'Transparent SaaS Pricing', icon: CreditCard, path: '/pricing-policy' }
];

export const LegalPoliciesPage: React.FC<LegalPoliciesPageProps> = ({
  initialPolicy = 'terms',
  onBackToHome,
  onGetStarted,
  onOpenSignIn,
  onOpenSearch,
  onNavigateTo,
  onPolicyChange
}) => {
  const [activePolicy, setActivePolicy] = useState<PolicyType>(initialPolicy);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (initialPolicy) {
      setActivePolicy(initialPolicy);
    }
  }, [initialPolicy]);

  const handleTabSelect = (policyId: PolicyType) => {
    setActivePolicy(policyId);
    if (onPolicyChange) {
      onPolicyChange(policyId);
    }
    const targetMeta = POLICY_TABS.find(t => t.id === policyId);
    if (targetMeta) {
      window.history.pushState({}, '', targetMeta.path);
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCopyLink = () => {
    try {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      // Fallback
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const currentTab = POLICY_TABS.find(t => t.id === activePolicy) || POLICY_TABS[0];

  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc', color: '#0f172a', fontFamily: 'system-ui, -apple-system, sans-serif' }}>
      
      {/* Top Header */}
      <LandingHeader
        onHome={onBackToHome}
        onFeatures={() => onNavigateTo('modules')}
        onPricing={() => onNavigateTo('pricing')}
        onSolutions={() => onNavigateTo('workspaces')}
        onSecurity={() => onNavigateTo('security')}
        onLogin={onOpenSignIn}
        onGetStarted={onGetStarted}
      />

      {/* Hero Header Section */}
      <section style={{ maxWidth: '1180px', margin: '0 auto', padding: '44px 24px 28px', textAlign: 'center' }}>
        <div style={{ 
          display: 'inline-flex', 
          alignItems: 'center', 
          gap: '8px', 
          padding: '6px 18px', 
          borderRadius: '30px', 
          background: '#e0f2fe', 
          color: '#0284c7', 
          fontSize: '12px', 
          fontWeight: 700, 
          letterSpacing: '0.5px',
          marginBottom: '16px' 
        }}>
          <Shield size={14} />
          <span>STATUTORY LEGAL & COMPLIANCE POLICIES</span>
        </div>

        <h1 style={{ fontSize: '38px', fontWeight: 900, letterSpacing: '-0.8px', color: '#0f172a', lineHeight: 1.2, marginBottom: '12px' }}>
          ITLC India HRMS Legal & Trust Center
        </h1>
        
        <p style={{ fontSize: '15px', color: '#64748b', maxWidth: '720px', margin: '0 auto 24px', lineHeight: 1.6 }}>
          Official policies governing the use of ITLC India HRMS Cloud Platform, data privacy, billing terms, digital delivery, and refund standards compliant with Indian IT Act, 2000, DPDPA 2023, and RBI Payment Aggregator Guidelines.
        </p>

        {/* Tab Navigation Pill Bar */}
        <div style={{ 
          display: 'flex', 
          flexWrap: 'wrap', 
          justifyContent: 'center', 
          gap: '8px', 
          background: '#ffffff', 
          padding: '8px', 
          borderRadius: '16px', 
          border: '1px solid #e2e8f0', 
          maxWidth: '1040px', 
          margin: '0 auto',
          boxShadow: '0 4px 20px -2px rgba(0,0,0,0.03)'
        }}>
          {POLICY_TABS.map(tab => {
            const Icon = tab.icon;
            const isActive = activePolicy === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => handleTabSelect(tab.id)}
                type="button"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '10px 18px',
                  borderRadius: '12px',
                  fontSize: '13.5px',
                  fontWeight: isActive ? 700 : 500,
                  color: isActive ? '#ffffff' : '#475569',
                  background: isActive ? '#0284c7' : 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                  transition: 'all 0.18s ease',
                  boxShadow: isActive ? '0 4px 12px rgba(2, 132, 199, 0.28)' : 'none'
                }}
              >
                <Icon size={16} />
                <span>{tab.title}</span>
              </button>
            );
          })}
        </div>
      </section>

      {/* Main Content Layout */}
      <section style={{ maxWidth: '1180px', margin: '0 auto 60px', padding: '0 24px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) 300px', gap: '28px', alignItems: 'start' }}>
          
          {/* Main Legal Document Sheet */}
          <div style={{ 
            background: '#ffffff', 
            borderRadius: '20px', 
            border: '1px solid #e2e8f0', 
            padding: '40px', 
            boxShadow: '0 8px 30px -4px rgba(0,0,0,0.04)',
            lineHeight: 1.7
          }}>
            
            {/* Document Header */}
            <div style={{ borderBottom: '1px solid #f1f5f9', paddingBottom: '24px', marginBottom: '32px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
                <div>
                  <span style={{ 
                    display: 'inline-block', 
                    fontSize: '12px', 
                    fontWeight: 700, 
                    color: '#0284c7', 
                    background: '#f0f9ff', 
                    padding: '4px 12px', 
                    borderRadius: '8px', 
                    marginBottom: '8px' 
                  }}>
                    {currentTab.badge}
                  </span>
                  <h2 style={{ fontSize: '28px', fontWeight: 800, color: '#0f172a', margin: '4px 0 6px' }}>
                    {currentTab.title}
                  </h2>
                  <p style={{ fontSize: '13px', color: '#64748b', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Clock size={14} /> Last Updated & Effective Date: September 18, 2026
                  </p>
                </div>

                {/* Print & Share Actions */}
                <div style={{ display: 'flex', gap: '10px' }}>
                  <button
                    onClick={handleCopyLink}
                    type="button"
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '6px',
                      padding: '8px 14px',
                      background: '#f8fafc',
                      border: '1px solid #e2e8f0',
                      borderRadius: '8px',
                      fontSize: '12.5px',
                      fontWeight: 600,
                      color: '#475569',
                      cursor: 'pointer'
                    }}
                  >
                    {copied ? <Check size={14} color="#16a34a" /> : <Copy size={14} />}
                    <span>{copied ? 'Copied!' : 'Copy Link'}</span>
                  </button>

                  <button
                    onClick={handlePrint}
                    type="button"
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '6px',
                      padding: '8px 14px',
                      background: '#f8fafc',
                      border: '1px solid #e2e8f0',
                      borderRadius: '8px',
                      fontSize: '12.5px',
                      fontWeight: 600,
                      color: '#475569',
                      cursor: 'pointer'
                    }}
                  >
                    <Printer size={14} />
                    <span>Print</span>
                  </button>
                </div>
              </div>
            </div>

            {/* POLICY 1: TERMS AND CONDITIONS */}
            {activePolicy === 'terms' && (
              <div className="policy-document-body" style={{ color: '#334155', fontSize: '14.5px' }}>
                <div style={{ background: '#f8fafc', borderLeft: '4px solid #0284c7', padding: '16px 20px', borderRadius: '0 8px 8px 0', marginBottom: '28px' }}>
                  <p style={{ margin: 0, fontWeight: 500, color: '#1e293b' }}>
                    <strong>Notice:</strong> Please read these Terms and Conditions carefully before accessing or using ITLC India HRMS. By accessing, signing in, or registering an enterprise workspace, you agree to be legally bound by these terms.
                  </p>
                </div>

                <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#0f172a', marginTop: '24px', marginBottom: '10px' }}>
                  1. Agreement to Terms & Parties
                </h3>
                <p>
                  These Terms of Service ("Terms") constitute a legally binding agreement between <strong>ITLC India Private Limited</strong> ("ITLC India", "Company", "We", "Us", or "Our") and the corporate entity, company, or individual customer ("Customer", "Subscriber", "You") accessing or subscribing to the <strong>ITLC India HRMS Cloud Platform</strong>.
                </p>

                <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#0f172a', marginTop: '24px', marginBottom: '10px' }}>
                  2. SaaS License & Authorized Use
                </h3>
                <p>
                  ITLC India grants the Customer a non-exclusive, non-transferable, revocable subscription license to access and use the HRMS software suite (encompassing Core HR, Attendance, Leave Management, Recruitment, Document Locker, and Payroll workflows) solely for internal enterprise business operations in accordance with the purchased subscription plan.
                </p>

                <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#0f172a', marginTop: '24px', marginBottom: '10px' }}>
                  3. Multi-Tenant Accounts & User Responsibility
                </h3>
                <p>
                  The Customer is solely responsible for maintaining the confidentiality of administrative credentials, super-admin master access, employee credentials, and role permissions. The Customer agrees to notify ITLC India immediately at <a href="mailto:support@itlc.in" style={{ color: '#0284c7', fontWeight: 600 }}>support@itlc.in</a> upon discovering any unauthorized account activity.
                </p>

                <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#0f172a', marginTop: '24px', marginBottom: '10px' }}>
                  4. Prohibited Uses & Indian IT Act Compliance
                </h3>
                <p>
                  Customers and authorized users shall not:
                </p>
                <ul style={{ paddingLeft: '20px', marginBottom: '16px' }}>
                  <li>Decompile, reverse-engineer, disassemble, or derive the source code of ITLC HRMS.</li>
                  <li>Circumvent multi-tenant tenancy boundaries or attempt unauthorized privilege escalation.</li>
                  <li>Transmit malicious code, viruses, automated crawlers, or conduct unauthorized load testing.</li>
                  <li>Use the platform in violation of the Information Technology Act, 2000, or any applicable Indian statutory law.</li>
                </ul>

                <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#0f172a', marginTop: '24px', marginBottom: '10px' }}>
                  5. Customer Data Ownership & Confidentiality
                </h3>
                <p>
                  The Customer retains all right, title, and interest in and to all proprietary employee records, biometric punch logs, payroll files, and organizational data entered into the platform ("Customer Data"). ITLC India processes Customer Data strictly as a data processor on behalf of the Customer and does not sell, market, or share this data with third parties.
                </p>

                <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#0f172a', marginTop: '24px', marginBottom: '10px' }}>
                  6. Service Availability & SLA
                </h3>
                <p>
                  ITLC India targets a 99.9% application uptime for production cloud environments, excluding scheduled maintenance windows announced at least 48 hours in advance. Emergency security patches and node upgrades may be performed with immediate notification.
                </p>

                <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#0f172a', marginTop: '24px', marginBottom: '10px' }}>
                  7. Subscriptions, Payments & Tax Invoices
                </h3>
                <p>
                  Subscription fees are billed in Indian Rupees (INR) on a monthly or annual recurring basis as chosen by the Customer. Applicable Goods and Services Tax (GST at 18%) is charged in accordance with Indian tax regulations. Tax invoices containing the Customer's GSTIN are generated and delivered digitally upon transaction clearance.
                </p>

                <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#0f172a', marginTop: '24px', marginBottom: '10px' }}>
                  8. Limitation of Liability
                </h3>
                <p>
                  To the maximum extent permitted by Indian law, ITLC India Private Limited shall not be liable for indirect, punitive, incidental, or consequential damages, loss of business profits, or business interruption arising out of the use or inability to use the platform. In any event, ITLC India's aggregate liability shall not exceed the subscription fees paid by the Customer in the three (3) months preceding the claim.
                </p>

                <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#0f172a', marginTop: '24px', marginBottom: '10px' }}>
                  9. Governing Law & Dispute Resolution
                </h3>
                <p>
                  These Terms shall be governed by and construed in accordance with the substantive laws of the Republic of India. Any dispute, controversy, or claim arising out of or relating to these Terms shall be subject to the exclusive jurisdiction of the competent courts situated in <strong>New Delhi, India</strong>.
                </p>
              </div>
            )}

            {/* POLICY 2: PRIVACY POLICY */}
            {activePolicy === 'privacy' && (
              <div className="policy-document-body" style={{ color: '#334155', fontSize: '14.5px' }}>
                <div style={{ background: '#f8fafc', borderLeft: '4px solid #10b981', padding: '16px 20px', borderRadius: '0 8px 8px 0', marginBottom: '28px' }}>
                  <p style={{ margin: 0, fontWeight: 500, color: '#1e293b' }}>
                    <strong>DPDPA & SPDI Compliance:</strong> ITLC India Private Limited is fully committed to safeguarding enterprise and employee personal information in accordance with the <strong>Digital Personal Data Protection Act (DPDPA 2023)</strong> and the Information Technology (Reasonable Security Practices and Procedures and Sensitive Personal Data or Information) Rules, 2011.
                  </p>
                </div>

                <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#0f172a', marginTop: '24px', marginBottom: '10px' }}>
                  1. Scope of this Policy
                </h3>
                <p>
                  This Privacy Policy describes how ITLC India collects, stores, uses, encrypts, and protects personal and sensitive organizational data when employers and employees interact with the ITLC India HRMS cloud suite.
                </p>

                <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#0f172a', marginTop: '24px', marginBottom: '10px' }}>
                  2. Categories of Information Collected
                </h3>
                <p>
                  We collect information strictly necessary to provide comprehensive human resource and workforce management operations:
                </p>
                <ul style={{ paddingLeft: '20px', marginBottom: '16px' }}>
                  <li><strong>Employee Identity & Employment Data:</strong> Full name, official email address, phone number, employee code, department, designation, date of joining, and reporting hierarchy.</li>
                  <li><strong>Attendance & Biometric Sync Metadata:</strong> Punch timestamps, shift logs, IP access logs, and mobile geolocation check-in coordinates (only when geofencing is enabled by your employer).</li>
                  <li><strong>Payroll & Compliance Records:</strong> Salary structures, bank account details for direct deposit, PAN, PF, and ESIC identifiers required for statutory payroll computation.</li>
                  <li><strong>Billing & Account Information:</strong> Organization name, GSTIN, corporate billing address, and authorized contact details. (Payment gateway transactions are processed via secure PCI-DSS certified partners; ITLC does not store raw credit/debit card numbers).</li>
                </ul>

                <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#0f172a', marginTop: '24px', marginBottom: '10px' }}>
                  3. Legal Basis & Purpose of Data Processing
                </h3>
                <p>
                  ITLC India acts as a <strong>Data Processor</strong> on behalf of your employer (the <strong>Data Fiduciary / Controller</strong>). We process data to:
                </p>
                <ul style={{ paddingLeft: '20px', marginBottom: '16px' }}>
                  <li>Deliver, maintain, and optimize HRMS modules (leaves, approvals, attendance, payroll).</li>
                  <li>Authenticate authorized users via encrypted sessions and role-based permissions.</li>
                  <li>Generate audit logs and compliance reports for organizational transparency.</li>
                  <li>Provide customer service, technical diagnostics, and system notifications.</li>
                </ul>

                <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#0f172a', marginTop: '24px', marginBottom: '10px' }}>
                  4. Data Residency & Cryptographic Security
                </h3>
                <p>
                  All Customer Data is stored within enterprise-grade, ISO/IEC 27001 certified cloud data centers situated within the sovereign territory of <strong>India</strong>. Data is protected using <strong>256-bit AES encryption at rest</strong> and <strong>TLS 1.3 encryption in transit</strong>. Logical database segregation guarantees strict tenant isolation.
                </p>

                <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#0f172a', marginTop: '24px', marginBottom: '10px' }}>
                  5. Zero-Sale Commitment & Confidentiality
                </h3>
                <p>
                  We maintain a strict zero-compromise privacy commitment: <strong>ITLC India will never sell, rent, monetize, or trade employee or corporate information to advertisers or external commercial third parties.</strong>
                </p>

                <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#0f172a', marginTop: '24px', marginBottom: '10px' }}>
                  6. Data Retention, Portability & Deletion
                </h3>
                <p>
                  Customer Data is retained for the active term of the subscription. Upon subscription termination, the Customer has thirty (30) days to export all employee records, attendance archives, and payroll registers. After sixty (60) days of non-renewal, all tenant data is permanently and securely wiped from active cloud servers in accordance with DoD 5220.22-M sanitization standards.
                </p>

                <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#0f172a', marginTop: '24px', marginBottom: '10px' }}>
                  7. Statutory Grievance Redressal Officer
                </h3>
                <p>
                  In compliance with the Information Technology Act, 2000 and DPDPA Rules, the contact details of our appointed Grievance Officer are:
                </p>
                <div style={{ background: '#f1f5f9', padding: '16px 20px', borderRadius: '8px', marginTop: '12px' }}>
                  <p style={{ margin: '0 0 6px' }}><strong>Designation:</strong> Data Grievance & Compliance Officer</p>
                  <p style={{ margin: '0 0 6px' }}><strong>Company:</strong> ITLC India Private Limited</p>
                  <p style={{ margin: '0 0 6px' }}><strong>Email:</strong> <a href="mailto:grievance@itlc.in" style={{ color: '#0284c7', fontWeight: 600 }}>grievance@itlc.in</a> / <a href="mailto:support@itlc.in" style={{ color: '#0284c7', fontWeight: 600 }}>support@itlc.in</a></p>
                  <p style={{ margin: '0' }}><strong>Response Time:</strong> Written acknowledgment within 48 hours; resolution within 15 working days.</p>
                </div>
              </div>
            )}

            {/* POLICY 3: CANCELLATION & REFUND POLICY */}
            {activePolicy === 'refund' && (
              <div className="policy-document-body" style={{ color: '#334155', fontSize: '14.5px' }}>
                <div style={{ background: '#f8fafc', borderLeft: '4px solid #f59e0b', padding: '16px 20px', borderRadius: '0 8px 8px 0', marginBottom: '28px' }}>
                  <p style={{ margin: 0, fontWeight: 500, color: '#1e293b' }}>
                    <strong>Fair & Transparent Billing:</strong> At ITLC India, our pricing is straightforward with zero hidden fees. This policy clearly defines our cancellation timelines and refund mechanisms.
                  </p>
                </div>

                <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#0f172a', marginTop: '24px', marginBottom: '10px' }}>
                  1. 14-Day Free Evaluation Period
                </h3>
                <p>
                  All new organizations may evaluate ITLC India HRMS with full access to Core HR, Leave Management, and Attendance workflows under our 14-day trial period without requiring advance payment commitments.
                </p>

                <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#0f172a', marginTop: '24px', marginBottom: '10px' }}>
                  2. Subscription Cancellation Procedure
                </h3>
                <p>
                  Customers may cancel their recurring SaaS subscription at any time prior to the start of the next billing cycle:
                </p>
                <ul style={{ paddingLeft: '20px', marginBottom: '16px' }}>
                  <li><strong>Self-Service Console:</strong> Navigate to Admin Settings &gt; Subscription &gt; Cancel Subscription.</li>
                  <li><strong>Email Request:</strong> Send an email from your registered admin email address to <a href="mailto:billing@itlc.in" style={{ color: '#0284c7', fontWeight: 600 }}>billing@itlc.in</a> with your Organization Name and Workspace ID.</li>
                </ul>
                <p>
                  Upon cancellation, your subscription will remain active until the end of your prepaid billing period, and no further renewal charges will be initiated.
                </p>

                <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#0f172a', marginTop: '24px', marginBottom: '10px' }}>
                  3. Refund Eligibility Terms
                </h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px', margin: '20px 0' }}>
                  <div style={{ border: '1px solid #e2e8f0', borderRadius: '12px', padding: '18px', background: '#fafafa' }}>
                    <strong style={{ color: '#0f172a', display: 'block', marginBottom: '6px' }}>Annual Plans (7-Day Guarantee)</strong>
                    <p style={{ fontSize: '13.5px', color: '#64748b', margin: 0 }}>
                      First-time annual plan subscriptions are eligible for a 100% refund (less payment gateway transaction fees) if requested within <strong>7 calendar days</strong> of initial payment.
                    </p>
                  </div>
                  <div style={{ border: '1px solid #e2e8f0', borderRadius: '12px', padding: '18px', background: '#fafafa' }}>
                    <strong style={{ color: '#0f172a', display: 'block', marginBottom: '6px' }}>Monthly Subscriptions</strong>
                    <p style={{ fontSize: '13.5px', color: '#64748b', margin: 0 }}>
                      Monthly plans are non-refundable once the billing month commences. Cancellation stops future automatic renewals immediately.
                    </p>
                  </div>
                  <div style={{ border: '1px solid #e2e8f0', borderRadius: '12px', padding: '18px', background: '#fafafa' }}>
                    <strong style={{ color: '#0f172a', display: 'block', marginBottom: '6px' }}>Billing Errors & Duplicate Debits</strong>
                    <p style={{ fontSize: '13.5px', color: '#64748b', margin: 0 }}>
                      In the event of duplicate debit or system billing error, 100% of the erroneous amount is refunded immediately upon verification.
                    </p>
                  </div>
                </div>

                <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#0f172a', marginTop: '24px', marginBottom: '10px' }}>
                  4. Refund Processing Timelines & Source Account Reversal
                </h3>
                <p>
                  Approved refunds are credited directly back to the <strong>original payment method</strong> (Credit Card, Debit Card, UPI, or Netbanking account) used during the transaction through our RBI-authorized payment aggregator (Razorpay/Bank Gateway). Refund processing typically completes within <strong>5 to 7 Indian banking business days</strong> from the date of approval.
                </p>

                <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#0f172a', marginTop: '24px', marginBottom: '10px' }}>
                  5. Data Export & Archive Access
                </h3>
                <p>
                  Following cancellation, your workspace enters read-only status for 30 calendar days, allowing administrative personnel to download full employee records, salary slips, attendance archives, and tax reports in standard CSV and Excel formats before decommission.
                </p>
              </div>
            )}

            {/* POLICY 4: SHIPPING & DELIVERY POLICY */}
            {activePolicy === 'shipping' && (
              <div className="policy-document-body" style={{ color: '#334155', fontSize: '14.5px' }}>
                <div style={{ background: '#f8fafc', borderLeft: '4px solid #6366f1', padding: '16px 20px', borderRadius: '0 8px 8px 0', marginBottom: '28px' }}>
                  <p style={{ margin: 0, fontWeight: 500, color: '#1e293b' }}>
                    <strong>Digital Service Delivery:</strong> ITLC India HRMS is a cloud-hosted Software-as-a-Service (SaaS) application. We provide instant digital fulfillment and provisioning; no physical shipments or postal parcel deliveries are involved.
                  </p>
                </div>

                <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#0f172a', marginTop: '24px', marginBottom: '10px' }}>
                  1. Nature of Product & Fulfillment Mechanism
                </h3>
                <p>
                  ITLC India HRMS provides web-based enterprise software services. No physical media (CD-ROMs, printed user guides, or hardware dongles) are shipped. Delivery is executed entirely electronically via secure cloud workspace provisioning over the Internet.
                </p>

                <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#0f172a', marginTop: '24px', marginBottom: '10px' }}>
                  2. Instant Delivery Timelines
                </h3>
                <ul style={{ paddingLeft: '20px', marginBottom: '16px' }}>
                  <li><strong>Workspace Provisioning:</strong> Activated <strong>instantaneously (within 60 seconds)</strong> upon successful payment confirmation from the payment gateway.</li>
                  <li><strong>Credentials & Welcome Pack:</strong> The primary Superadmin / HR Administrator receives automated welcome instructions, activation links, and login credentials via email and SMS within <strong>5 to 15 minutes</strong> of registration.</li>
                  <li><strong>Employee Self-Service Access:</strong> As soon as the administrator uploads employee profiles, automated individual employee onboarding invites are dispatched electronically.</li>
                </ul>

                <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#0f172a', marginTop: '24px', marginBottom: '10px' }}>
                  3. Service Access & Device Requirements
                </h3>
                <p>
                  The software is accessible immediately via any standard, HTML5-compliant web browser (Google Chrome, Mozilla Firefox, Microsoft Edge, Safari) and mobile responsive web interfaces without requiring local client installations.
                </p>

                <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#0f172a', marginTop: '24px', marginBottom: '10px' }}>
                  4. Tax Invoice & Delivery Confirmation
                </h3>
                <p>
                  Upon successful payment transaction, an official computer-generated GST Tax Invoice containing complete order breakdown, HSN/SAC Code (997331 - Licensing services for the right to use computer software), and payment transaction IDs is automatically emailed to the registered billing email address and made available for download in the admin billing dashboard.
                </p>

                <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#0f172a', marginTop: '24px', marginBottom: '10px' }}>
                  5. Delayed Delivery Support & Escalation
                </h3>
                <p>
                  If you have completed a payment and have not received your workspace activation email within thirty (30) minutes, please contact our 24/7 technical operations desk:
                </p>
                <div style={{ background: '#f1f5f9', padding: '16px 20px', borderRadius: '8px', marginTop: '12px' }}>
                  <p style={{ margin: '0 0 6px' }}><strong>Technical Support Desk:</strong> ITLC Cloud Provisioning Operations</p>
                  <p style={{ margin: '0 0 6px' }}><strong>Email:</strong> <a href="mailto:support@itlc.in" style={{ color: '#0284c7', fontWeight: 600 }}>support@itlc.in</a></p>
                  <p style={{ margin: '0' }}><strong>Priority Escalation WhatsApp:</strong> +91 83688 17744</p>
                </div>
              </div>
            )}

            {/* POLICY 5: PRICING POLICY */}
            {activePolicy === 'pricing-policy' && (
              <div className="policy-document-body" style={{ color: '#334155', fontSize: '14.5px' }}>
                <div style={{ background: '#f8fafc', borderLeft: '4px solid #0284c7', padding: '16px 20px', borderRadius: '0 8px 8px 0', marginBottom: '28px' }}>
                  <p style={{ margin: 0, fontWeight: 500, color: '#1e293b' }}>
                    <strong>Pricing Transparency:</strong> ITLC India provides predictable, transparent SaaS subscription plans designed for Indian enterprises, MSMEs, and startups. We guarantee no hidden setup, migration, or cancellation fees.
                  </p>
                </div>

                <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#0f172a', marginTop: '24px', marginBottom: '10px' }}>
                  1. Subscription Tiers & Architecture
                </h3>
                <p>
                  ITLC India HRMS is offered under three structured subscription plans:
                </p>
                <ul style={{ paddingLeft: '20px', marginBottom: '16px' }}>
                  <li><strong>Starter Plan:</strong> Designed for small teams and growing businesses (includes Core HR, Attendance Tracking, Employee Directory, and Self-Service Portal).</li>
                  <li><strong>Growth / Professional Plan:</strong> Ideal for scaling mid-market enterprises (includes Advanced Leave Approval Workflows, Document Locker, Biometric Sync Integration, and Compliance Analytics).</li>
                  <li><strong>Enterprise Plan:</strong> Complete custom deployment with dedicated account management, custom module integrations, tailored SLAs, and priority 24/7 phone support.</li>
                </ul>

                <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#0f172a', marginTop: '24px', marginBottom: '10px' }}>
                  2. Pricing Models & Unit Calculations
                </h3>
                <p>
                  Subscriptions are billed either on a <strong>Fixed Tiered Workspace fee</strong> or a <strong>Per-Active-Employee per Month</strong> basis as detailed in the live <button onClick={() => onNavigateTo('pricing')} style={{ background: 'none', border: 'none', color: '#0284c7', fontWeight: 600, cursor: 'pointer', padding: 0, textDecoration: 'underline' }}>Pricing Table</button>. An "Active Employee" is defined as any employee record marked active in the system directory during the billing cycle.
                </p>

                <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#0f172a', marginTop: '24px', marginBottom: '10px' }}>
                  3. Currency & Applicable Taxes (GST)
                </h3>
                <p>
                  All prices listed on the ITLC India website are denominated in <strong>Indian National Rupees (INR / ₹)</strong>, exclusive of applicable statutory taxes. In accordance with the Goods and Services Tax Act, <strong>18% GST (CGST + SGST or IGST)</strong> is charged on all invoices. Valid registered GSTIN holders can claim full Input Tax Credit (ITC) on our invoices.
                </p>

                <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#0f172a', marginTop: '24px', marginBottom: '10px' }}>
                  4. Billing Frequencies & Annual Discounts
                </h3>
                <p>
                  Customers may choose between:
                </p>
                <ul style={{ paddingLeft: '20px', marginBottom: '16px' }}>
                  <li><strong>Monthly Billing:</strong> Billed on the same calendar day each month. Provides flexibility with no long-term lock-in.</li>
                  <li><strong>Annual Upfront Billing:</strong> Prepaid for 12 months with up to <strong>20% discount benefit</strong> over the monthly equivalent price.</li>
                </ul>

                <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#0f172a', marginTop: '24px', marginBottom: '10px' }}>
                  5. Price Revision Policy
                </h3>
                <p>
                  ITLC India reserves the right to adjust subscription rates to reflect continuous product enhancements, server cost changes, or new module additions. Any price adjustment will be communicated to the Customer at least <strong>thirty (30) calendar days in advance</strong> via written email before your next renewal date. Existing active prepaid annual contracts will not be impacted until their natural renewal date.
                </p>

                <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#0f172a', marginTop: '24px', marginBottom: '10px' }}>
                  6. Supported Payment Modes
                </h3>
                <p>
                  We accept secure online payments via RBI-regulated payment gateways supporting:
                </p>
                <ul style={{ paddingLeft: '20px', marginBottom: '16px' }}>
                  <li>UPI (Google Pay, PhonePe, Paytm, BHIM)</li>
                  <li>Visa, MasterCard, RuPay, and American Express Credit & Debit Cards</li>
                  <li>Net Banking across 50+ major Indian banks</li>
                  <li>NEFT / RTGS Corporate Direct Bank Transfers (for Enterprise contracts)</li>
                </ul>
              </div>
            )}

            {/* Document Footer Callout */}
            <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: '28px', marginTop: '36px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
              <div>
                <p style={{ margin: 0, fontSize: '13px', color: '#64748b' }}>
                  Questions regarding this policy? Reach our legal and compliance desk.
                </p>
                <p style={{ margin: '4px 0 0', fontSize: '13.5px', fontWeight: 600, color: '#0f172a' }}>
                  <a href="mailto:support@itlc.in" style={{ color: '#0284c7', textDecoration: 'none' }}>support@itlc.in</a> · +91 83688 17744
                </p>
              </div>

              <button
                type="button"
                onClick={onGetStarted}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '10px 20px',
                  background: '#0284c7',
                  color: '#ffffff',
                  borderRadius: '10px',
                  border: 'none',
                  fontSize: '13.5px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  boxShadow: '0 4px 14px rgba(2, 132, 199, 0.3)'
                }}
              >
                <span>Get Started with ITLC</span>
                <ArrowRight size={16} />
              </button>
            </div>
          </div>

          {/* Right Sticky Sidebar */}
          <div style={{ position: 'sticky', top: '100px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
            
            {/* Company Info Box */}
            <div style={{ background: '#ffffff', borderRadius: '16px', border: '1px solid #e2e8f0', padding: '24px', boxShadow: '0 4px 15px -2px rgba(0,0,0,0.03)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px' }}>
                <Building2 size={20} color="#0284c7" />
                <h4 style={{ margin: 0, fontSize: '15px', fontWeight: 800, color: '#0f172a' }}>
                  Corporate Entity
                </h4>
              </div>
              <p style={{ fontSize: '13.5px', fontWeight: 700, color: '#1e293b', margin: '0 0 4px' }}>
                ITLC India Private Limited
              </p>
              <p style={{ fontSize: '12.5px', color: '#64748b', margin: '0 0 12px', lineHeight: 1.5 }}>
                Registered in India under the Companies Act. Cloud provider of Enterprise HRMS & Workforce Management SaaS.
              </p>
              
              <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: '12px', display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '12.5px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#475569' }}>
                  <Mail size={14} color="#0284c7" />
                  <a href="mailto:support@itlc.in" style={{ color: '#0284c7', textDecoration: 'none' }}>support@itlc.in</a>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#475569' }}>
                  <Mail size={14} color="#0284c7" />
                  <a href="mailto:billing@itlc.in" style={{ color: '#0284c7', textDecoration: 'none' }}>billing@itlc.in</a>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#475569' }}>
                  <MapPin size={14} color="#0284c7" />
                  <span>New Delhi, India</span>
                </div>
              </div>
            </div>

            {/* Quick Policy Index Navigation */}
            <div style={{ background: '#ffffff', borderRadius: '16px', border: '1px solid #e2e8f0', padding: '24px', boxShadow: '0 4px 15px -2px rgba(0,0,0,0.03)' }}>
              <h4 style={{ margin: '0 0 14px', fontSize: '14px', fontWeight: 800, color: '#0f172a' }}>
                All Legal Policies
              </h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                {POLICY_TABS.map(item => {
                  const isCur = activePolicy === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => handleTabSelect(item.id)}
                      type="button"
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '8px 12px',
                        borderRadius: '8px',
                        border: 'none',
                        background: isCur ? '#f0f9ff' : 'transparent',
                        color: isCur ? '#0284c7' : '#475569',
                        fontWeight: isCur ? 700 : 500,
                        fontSize: '13px',
                        cursor: 'pointer',
                        textAlign: 'left',
                        transition: 'background 0.15s ease'
                      }}
                    >
                      <span>{item.title}</span>
                      <ChevronRight size={14} opacity={isCur ? 1 : 0.4} />
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Security & SOC-2 Certification Card */}
            <div style={{ background: 'linear-gradient(135deg, #0f172a, #1e293b)', color: '#ffffff', borderRadius: '16px', padding: '22px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                <ShieldCheck size={18} color="#38bdf8" />
                <h4 style={{ margin: 0, fontSize: '14px', fontWeight: 800, color: '#ffffff' }}>
                  Bank-Grade Protection
                </h4>
              </div>
              <p style={{ fontSize: '12px', color: '#94a3b8', margin: '0 0 14px', lineHeight: 1.5 }}>
                256-bit AES encryption, Indian cloud data sovereignty, role-based controls, and SOC-2 standard controls.
              </p>
              <button
                type="button"
                onClick={() => onNavigateTo('security')}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  borderRadius: '8px',
                  border: '1px solid rgba(255,255,255,0.15)',
                  background: 'rgba(255,255,255,0.06)',
                  color: '#ffffff',
                  fontSize: '12px',
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                View Security Architecture
              </button>
            </div>

          </div>

        </div>
      </section>

      {/* Footer */}
      <LandingFooter
        companyName="ITLC India Private Limited"
        supportEmail="support@itlc.in"
        onNavigate={(dest) => onNavigateTo(dest)}
      />

    </div>
  );
};

export default LegalPoliciesPage;
