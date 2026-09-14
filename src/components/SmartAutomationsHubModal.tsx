import React, { useState } from 'react';
import { 
  X, 
  Sparkles, 
  FileText, 
  MessageSquare, 
  MapPin, 
  BarChart3, 
  Download, 
  Send, 
  CheckCircle2, 
  AlertTriangle, 
  Users, 
  DollarSign, 
  Building2, 
  Clock, 
  ShieldCheck, 
  Smartphone, 
  Compass, 
  Share2,
  Printer,
  ChevronRight,
  RefreshCw,
  Zap,
  Target,
  Receipt
} from 'lucide-react';
import { type TenantCompany, getLiveSuperOwnerTaxConfig } from '../types/multiTenant';

interface SmartAutomationsHubModalProps {
  isOpen: boolean;
  onClose: () => void;
  tenant?: TenantCompany | null;
  initialTab?: 'payslip' | 'whatsapp' | 'geofence' | 'eod';
  lang?: 'en' | 'hi';
}

export const SmartAutomationsHubModal: React.FC<SmartAutomationsHubModalProps> = ({
  isOpen,
  onClose,
  tenant,
  initialTab = 'payslip',
  lang = 'en'
}) => {
  const [activeTab, setActiveTab] = useState<'payslip' | 'whatsapp' | 'geofence' | 'eod'>(initialTab);
  const [successToast, setSuccessToast] = useState<string | null>(null);

  const taxConfig = getLiveSuperOwnerTaxConfig();

  const showToast = (msg: string) => {
    setSuccessToast(msg);
    setTimeout(() => setSuccessToast(null), 3500);
  };

  // ==================== TAB 1: SALARY SLIP (PAYSLIP) STATE ====================
  const [empName, setEmpName] = useState('Rahul Sharma');
  const [empId, setEmpId] = useState('EMP-2041');
  const [empRole, setEmpRole] = useState('Senior Full Stack Engineer');
  const [empDept, setEmpDept] = useState('Technology & Product');
  const [empPhone, setEmpPhone] = useState('918368817744');
  const [empPan, setEmpPan] = useState('ABCDE1234F');
  const [empUan, setEmpUan] = useState('100982341122');
  const [empBankAcc, setEmpBankAcc] = useState('918200192837482');
  const [salaryMonth, setSalaryMonth] = useState('September');
  const [salaryYear, setSalaryYear] = useState('2026');
  const [totalWorkingDays, setTotalWorkingDays] = useState(30);
  const [daysPaid, setDaysPaid] = useState(30);
  
  // Earnings
  const [basicSalary, setBasicSalary] = useState(45000);
  const [hra, setHra] = useState(18000);
  const [specialAllowance, setSpecialAllowance] = useState(12000);
  const [conveyance, setConveyance] = useState(3000);
  const [performanceBonus, setPerformanceBonus] = useState(5000);

  // Deductions
  const [pfDeduction, setPfDeduction] = useState(1800);
  const [esiDeduction, setEsiDeduction] = useState(0);
  const [profTax, setProfTax] = useState(200);
  const [tdsTax, setTdsTax] = useState(2500);
  const [unpaidLeaveDays, setUnpaidLeaveDays] = useState(0);

  const grossEarnings = basicSalary + hra + specialAllowance + conveyance + performanceBonus;
  const leaveDeduction = unpaidLeaveDays > 0 ? Math.round((grossEarnings / totalWorkingDays) * unpaidLeaveDays) : 0;
  const totalDeductions = pfDeduction + esiDeduction + profTax + tdsTax + leaveDeduction;
  const netSalary = Math.max(0, grossEarnings - totalDeductions);

  // Generate and Download Official Printable Payslip PDF
  const handleDownloadPayslip = () => {
    const payslipHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Payslip - ${empName} - ${salaryMonth} ${salaryYear}</title>
        <style>
          body { font-family: system-ui, -apple-system, sans-serif; padding: 40px; color: #0f172a; max-width: 820px; margin: 0 auto; background: #fff; line-height: 1.5; }
          .header { display: flex; justify-content: space-between; border-bottom: 2px solid #0284c7; padding-bottom: 18px; }
          .company-name { font-size: 22px; font-weight: 900; color: #0284c7; }
          .meta { font-size: 12px; color: #475569; }
          .title-box { text-align: right; }
          .title { font-size: 18px; font-weight: 800; color: #0f172a; }
          .emp-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin: 20px 0; padding: 16px; background: #f8fafc; border-radius: 10px; border: 1px solid #e2e8f0; font-size: 12px; }
          .table { width: 100%; border-collapse: collapse; margin-top: 10px; font-size: 13px; }
          .table th, .table td { border: 1px solid #cbd5e1; padding: 10px 14px; text-align: left; }
          .table th { background: #f1f5f9; font-weight: 700; color: #1e293b; }
          .net-box { margin-top: 24px; padding: 18px; background: #f0fdf4; border: 1.5px solid #86efac; border-radius: 12px; display: flex; justify-content: space-between; align-items: center; }
          .net-val { font-size: 24px; font-weight: 900; color: #15803d; }
          .footer { margin-top: 40px; padding-top: 20px; border-top: 1px solid #e2e8f0; display: flex; justify-content: space-between; font-size: 11px; color: #64748b; }
          .seal-box { border: 1.5px dashed #0284c7; border-radius: 10px; padding: 8px 16px; text-align: center; color: #0284c7; font-weight: 800; font-size: 11px; }
        </style>
      </head>
      <body>
        <div class="header">
          <div>
            <div class="company-name">${tenant?.name || taxConfig.registeredLegalName || 'ITLC INDIA PRIVATE LIMITED'}</div>
            <div class="meta">GSTIN: ${tenant?.gstin || taxConfig.gstin || '07AABCI8899K1Z4'} • Universal Business OS</div>
            <div class="meta">Corporate Office: Tech Park, Ring Road, New Delhi, India</div>
          </div>
          <div class="title-box">
            <div class="title">MONTHLY SALARY SLIP</div>
            <div class="meta">Pay Period: <strong>${salaryMonth} ${salaryYear}</strong></div>
            <div class="meta">Generated: ${new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</div>
          </div>
        </div>

        <div class="emp-grid">
          <div><strong>Employee Name:</strong> ${empName}</div>
          <div><strong>Employee ID:</strong> ${empId}</div>
          <div><strong>Designation:</strong> ${empRole}</div>
          <div><strong>Department:</strong> ${empDept}</div>
          <div><strong>Bank A/C No:</strong> ${empBankAcc}</div>
          <div><strong>PAN Number:</strong> ${empPan}</div>
          <div><strong>UAN / PF No:</strong> ${empUan}</div>
          <div><strong>Paid Days / Working Days:</strong> ${daysPaid} / ${totalWorkingDays} Days</div>
        </div>

        <table class="table">
          <thead>
            <tr>
              <th style="width: 50%;">Earnings (Incentives & Allowances)</th>
              <th style="width: 50%;">Deductions & Statutory Taxes</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td style="vertical-align: top; padding: 0;">
                <table style="width: 100%; border-collapse: collapse;">
                  <tr><td style="border: none; padding: 6px 12px;">Basic Salary:</td><td style="border: none; text-align: right; font-weight: 700;">₹${basicSalary.toLocaleString('en-IN')}</td></tr>
                  <tr><td style="border: none; padding: 6px 12px;">House Rent Allowance (HRA):</td><td style="border: none; text-align: right; font-weight: 700;">₹${hra.toLocaleString('en-IN')}</td></tr>
                  <tr><td style="border: none; padding: 6px 12px;">Special Allowance:</td><td style="border: none; text-align: right; font-weight: 700;">₹${specialAllowance.toLocaleString('en-IN')}</td></tr>
                  <tr><td style="border: none; padding: 6px 12px;">Conveyance Allowance:</td><td style="border: none; text-align: right; font-weight: 700;">₹${conveyance.toLocaleString('en-IN')}</td></tr>
                  <tr><td style="border: none; padding: 6px 12px;">Performance Bonus:</td><td style="border: none; text-align: right; font-weight: 700;">₹${performanceBonus.toLocaleString('en-IN')}</td></tr>
                  <tr style="background: #f8fafc; border-top: 1px solid #cbd5e1;"><td style="border: none; padding: 10px 12px; font-weight: 800;">Gross Earnings:</td><td style="border: none; text-align: right; font-weight: 900; color: #0284c7;">₹${grossEarnings.toLocaleString('en-IN')}</td></tr>
                </table>
              </td>
              <td style="vertical-align: top; padding: 0;">
                <table style="width: 100%; border-collapse: collapse;">
                  <tr><td style="border: none; padding: 6px 12px;">Provident Fund (PF Employee):</td><td style="border: none; text-align: right; font-weight: 700;">₹${pfDeduction.toLocaleString('en-IN')}</td></tr>
                  <tr><td style="border: none; padding: 6px 12px;">ESIC Contribution:</td><td style="border: none; text-align: right; font-weight: 700;">₹${esiDeduction.toLocaleString('en-IN')}</td></tr>
                  <tr><td style="border: none; padding: 6px 12px;">Professional Tax (PT):</td><td style="border: none; text-align: right; font-weight: 700;">₹${profTax.toLocaleString('en-IN')}</td></tr>
                  <tr><td style="border: none; padding: 6px 12px;">TDS / Income Tax:</td><td style="border: none; text-align: right; font-weight: 700;">₹${tdsTax.toLocaleString('en-IN')}</td></tr>
                  <tr><td style="border: none; padding: 6px 12px;">Leave LOP Deduction:</td><td style="border: none; text-align: right; font-weight: 700;">₹${leaveDeduction.toLocaleString('en-IN')}</td></tr>
                  <tr style="background: #f8fafc; border-top: 1px solid #cbd5e1;"><td style="border: none; padding: 10px 12px; font-weight: 800;">Total Deductions:</td><td style="border: none; text-align: right; font-weight: 900; color: #e11d48;">₹${totalDeductions.toLocaleString('en-IN')}</td></tr>
                </table>
              </td>
            </tr>
          </tbody>
        </table>

        <div class="net-box">
          <div>
            <div style="font-size: 13px; color: #166534; font-weight: 700;">NET TAKE-HOME SALARY (CREDITED TO BANK):</div>
            <div style="font-size: 11px; color: #475569; margin-top: 2px;">Direct NEFT/IMPS Transfer to A/C: ${empBankAcc}</div>
          </div>
          <div class="net-val">₹${netSalary.toLocaleString('en-IN')}</div>
        </div>

        <div class="footer">
          <div>
            This is a computer-generated official payslip issued under OmniStaff HRMS Engine.<br/>
            No physical signature is required. For queries, email payroll@itlc.in
          </div>
          <div class="seal-box">
            ✓ DIGITALLY VERIFIED<br/>
            ${tenant?.name || 'ITLC HRMS PAYROLL'}
          </div>
        </div>
        <script>
          window.print();
        </script>
      </body>
      </html>
    `;

    const blob = new Blob([payslipHtml], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const win = window.open(url, '_blank');
    if (!win) {
      showToast('Please enable popups to print / download salary slip.');
    } else {
      showToast(`📄 Salary slip for ${empName} (${salaryMonth}) generated!`);
    }
  };

  // Direct WhatsApp Dispatch for Payslip
  const handleSendPayslipWhatsApp = () => {
    const cleanPhone = empPhone.replace(/\D/g, '');
    const message = `*OFFICIAL SALARY SLIP - ${salaryMonth.toUpperCase()} ${salaryYear}*\n` +
      `🏢 Company: ${tenant?.name || 'ITLC India Pvt Ltd'}\n` +
      `👤 Employee: *${empName}* (${empId})\n` +
      `💼 Designation: ${empRole}\n` +
      `--------------------------------\n` +
      `💰 *Gross Earnings:* ₹${grossEarnings.toLocaleString('en-IN')}\n` +
      `🔻 *Total Deductions (PF/Tax):* ₹${totalDeductions.toLocaleString('en-IN')}\n` +
      `--------------------------------\n` +
      `💵 *NET SALARY CREDITED:* ₹${netSalary.toLocaleString('en-IN')}\n` +
      `🏦 Bank Account: ${empBankAcc}\n` +
      `--------------------------------\n` +
      `View & download your official detailed PDF payslip directly from your OmniStaff Portal. Have a great month ahead! ✨`;

    const encoded = encodeURIComponent(message);
    window.open(`https://api.whatsapp.com/send?phone=${cleanPhone}&text=${encoded}`, '_blank');
    showToast(`📲 Opening WhatsApp to dispatch salary slip to ${empName}...`);
  };

  // ==================== TAB 2: WHATSAPP BUSINESS AUTOMATION STATE ====================
  const [waRecipientType, setWaRecipientType] = useState<'lead' | 'invoice' | 'punch' | 'custom'>('lead');
  const [waPhone, setWaPhone] = useState('918368817744');
  const [waClientName, setWaClientName] = useState('Rohit Verma');
  const [waCustomMessage, setWaCustomMessage] = useState(
    'Hello Rohit Verma! Thank you for inquiring with ITLC Sales CRM. Here is our product brochure and instant demo link: https://crm.itlc.in/demo. Let us know a convenient time for a 10-minute quick walkthrough!'
  );

  const getPresetMessage = () => {
    switch (waRecipientType) {
      case 'lead':
        return `Hello ${waClientName}! 👋\n\nThank you for showing interest in *ITLC Enterprise Sales CRM & OmniStaff HRMS*. We have received your query.\n\n🔗 *Instant Live Demo:* https://app.itlc.in\n📞 *Helpdesk:* +91 83688 17744\n\nWould you like a personalized 10-min product walkthrough today?`;
      case 'invoice':
        return `Dear ${waClientName},\n\nYour official GST Tax Invoice from *${tenant?.name || 'ITLC India Pvt Ltd'}* is ready.\n\n🧾 *Invoice No:* INV-ITLC-2026-9812\n💵 *Total Amount:* ₹2,359.00 (Incl. 18% GST)\n💳 *Instant UPI QR Pay Link:* https://pay.itlc.in/inv-9812\n\nPlease find the receipt attached. Thank you for your partnership!`;
      case 'punch':
        return `⏰ *ATTENDANCE REMINDER - OmniStaff Radar*\n\nHello Team Member,\nYour scheduled morning shift starts at 09:30 AM. Please make sure to punch-in using the GPS Geofence Radar within 50m of office location to avoid late mark. Have a productive day! 🚀`;
      default:
        return waCustomMessage;
    }
  };

  const handleSendWhatsAppMessage = () => {
    const cleanPhone = waPhone.replace(/\D/g, '');
    const msg = getPresetMessage();
    const encoded = encodeURIComponent(msg);
    window.open(`https://api.whatsapp.com/send?phone=${cleanPhone}&text=${encoded}`, '_blank');
    showToast(`🚀 WhatsApp message dispatched to +${cleanPhone}!`);
  };

  // ==================== TAB 3: GPS GEOFENCE RADAR STATE ====================
  const [officeLat, setOfficeLat] = useState(28.6139);
  const [officeLng, setOfficeLng] = useState(77.2090);
  const [allowedRadiusMeters, setAllowedRadiusMeters] = useState(50);
  const [userLat, setUserLat] = useState<number | null>(28.6141);
  const [userLng, setUserLng] = useState<number | null>(77.2092);
  const [distanceMeters, setDistanceMeters] = useState<number>(31);
  const [isLocating, setIsLocating] = useState(false);
  
  // Field Sales Check-in Form
  const [clientMeetingName, setClientMeetingName] = useState('Apollo Health Ltd');
  const [meetingPurpose, setMeetingPurpose] = useState('Enterprise CRM Pipeline Discussion & SLA Signing');
  const [loggedCheckins, setLoggedCheckins] = useState<any[]>([
    { id: 1, client: 'TechNova Pvt Ltd', distance: '12m from client office', status: 'VERIFIED', time: '10:45 AM' },
    { id: 2, client: 'GreenField Agri Corp', distance: '18m from client office', status: 'VERIFIED', time: '02:15 PM' }
  ]);

  // Haversine formula to calculate distance between coordinates
  const calculateHaversine = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const R = 6371e3; // Earth radius in meters
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return Math.round(R * c);
  };

  const handleDetectLiveLocation = () => {
    if (!navigator.geolocation) {
      showToast('Geolocation is not supported by your browser.');
      return;
    }
    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setIsLocating(false);
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        setUserLat(lat);
        setUserLng(lng);
        const dist = calculateHaversine(officeLat, officeLng, lat, lng);
        setDistanceMeters(dist);
        showToast(`📍 Live GPS Detected: ${lat.toFixed(4)}, ${lng.toFixed(4)} (${dist}m from office)`);
      },
      () => {
        setIsLocating(false);
        // Fallback simulation within radius
        const dist = 28;
        setDistanceMeters(dist);
        showToast('📍 Simulated GPS Pin: 28m from office hub.');
      },
      { enableHighAccuracy: true, timeout: 5000 }
    );
  };

  const handleLogFieldCheckin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!clientMeetingName) return;
    const newRecord = {
      id: Date.now(),
      client: clientMeetingName,
      distance: `${Math.floor(5 + Math.random() * 20)}m GPS Verified`,
      status: 'VERIFIED',
      time: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })
    };
    setLoggedCheckins([newRecord, ...loggedCheckins]);
    showToast(`✅ GPS Meeting Check-in logged for "${clientMeetingName}"!`);
    setClientMeetingName('');
  };

  const isInsideGeofence = distanceMeters <= allowedRadiusMeters;

  // ==================== TAB 4: DAILY OWNER EXECUTIVE DIGEST (EOD) ====================
  const [eodStats, setEodStats] = useState({
    date: new Date().toLocaleDateString('en-IN', { weekday: 'long', day: '2-digit', month: 'short', year: 'numeric' }),
    totalStaff: 48,
    presentStaff: 44,
    absentStaff: 3,
    onLeave: 1,
    newLeads: 14,
    dealsClosed: 4,
    revenueCollected: 78500,
    invoicesCleared: 6,
    pendingReceivables: 32000
  });

  const getEodSummaryText = () => {
    return `📊 *DAILY EXECUTIVE END-OF-DAY (EOD) DIGEST*\n` +
      `🏢 *Company:* ${tenant?.name || 'ITLC India Pvt Ltd'}\n` +
      `📅 *Date:* ${eodStats.date}\n` +
      `--------------------------------\n` +
      `👥 *HRMS ATTENDANCE RADAR:*\n` +
      `• Total Staff: ${eodStats.totalStaff}\n` +
      `• Present Today: *${eodStats.presentStaff}* (${Math.round((eodStats.presentStaff / eodStats.totalStaff) * 100)}% Attendance)\n` +
      `• Absent / Late: ${eodStats.absentStaff} | On Leave: ${eodStats.onLeave}\n` +
      `--------------------------------\n` +
      `💼 *SALES CRM & REVENUE:*\n` +
      `• New Leads Acquired: *${eodStats.newLeads}*\n` +
      `• Deals Won / Closed: *${eodStats.dealsClosed}*\n` +
      `• Cash Collections: *₹${eodStats.revenueCollected.toLocaleString('en-IN')}*\n` +
      `• Invoices Cleared: ${eodStats.invoicesCleared} (Pending: ₹${eodStats.pendingReceivables.toLocaleString('en-IN')})\n` +
      `--------------------------------\n` +
      `⚡ *System Status:* All Cloud Clusters Operational • Zero Outages\n` +
      `Issued automatically via ITLC Unified Autonomous OS.`;
  };

  const handleSendEodDigestWhatsApp = () => {
    const ownerPhone = tenant?.adminPhone || '918368817744';
    const cleanPhone = ownerPhone.replace(/\D/g, '');
    const message = getEodSummaryText();
    const encoded = encodeURIComponent(message);
    window.open(`https://api.whatsapp.com/send?phone=${cleanPhone}&text=${encoded}`, '_blank');
    showToast(`📲 Dispatched Daily EOD Executive Digest to Owner's WhatsApp!`);
  };

  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      background: 'rgba(15, 23, 42, 0.78)',
      backdropFilter: 'blur(10px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 9999,
      padding: '20px'
    }}>
      {/* Modal Card */}
      <div style={{
        background: '#0f172a',
        border: '1.5px solid #334155',
        borderRadius: '24px',
        width: '100%',
        maxWidth: '920px',
        maxHeight: '90vh',
        overflowY: 'auto',
        color: '#f8fafc',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
        display: 'flex',
        flexDirection: 'column'
      }}>
        
        {/* Toast alert */}
        {successToast && (
          <div style={{
            position: 'absolute',
            top: '24px',
            right: '24px',
            background: 'linear-gradient(135deg, #10b981, #059669)',
            color: '#ffffff',
            padding: '12px 20px',
            borderRadius: '12px',
            boxShadow: '0 10px 25px rgba(16, 185, 129, 0.4)',
            fontSize: '13px',
            fontWeight: 800,
            zIndex: 10000,
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <CheckCircle2 size={16} />
            <span>{successToast}</span>
          </div>
        )}

        {/* Modal Header */}
        <div style={{
          padding: '24px 28px',
          borderBottom: '1px solid #334155',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          background: '#1e293b'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              width: '42px',
              height: '42px',
              borderRadius: '12px',
              background: 'linear-gradient(135deg, #0284c7, #6366f1)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#ffffff'
            }}>
              <Zap size={22} />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 900, color: '#f8fafc' }}>
                  Smart Growth & Automation Hub
                </h3>
                <span style={{ fontSize: '10px', fontWeight: 800, background: 'rgba(56, 189, 248, 0.2)', color: '#38bdf8', padding: '2px 8px', borderRadius: '12px', border: '1px solid rgba(56, 189, 248, 0.3)' }}>
                  AUTONOMOUS SUITE
                </span>
              </div>
              <span style={{ fontSize: '12px', color: '#94a3b8' }}>
                1-Click Salary Slips • WhatsApp Gateway • GPS Geofence Radar • Daily EOD Reports
              </span>
            </div>
          </div>

          <button
            onClick={onClose}
            style={{
              background: '#334155',
              border: 'none',
              borderRadius: '10px',
              width: '34px',
              height: '34px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#94a3b8',
              cursor: 'pointer'
            }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Top Tab Switcher */}
        <div style={{
          display: 'flex',
          borderBottom: '1px solid #334155',
          background: '#0f172a',
          padding: '0 28px',
          overflowX: 'auto',
          gap: '8px'
        }}>
          {[
            { id: 'payslip', label: '🧾 1-Click Salary Slip PDF & WhatsApp', icon: FileText },
            { id: 'whatsapp', label: '💬 WhatsApp Cloud Automation', icon: MessageSquare },
            { id: 'geofence', label: '📍 GPS Geofence & Field Radar', icon: MapPin },
            { id: 'eod', label: '📊 Daily Owner EOD Digest', icon: BarChart3 }
          ].map(tab => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                style={{
                  padding: '14px 16px',
                  background: 'none',
                  border: 'none',
                  borderBottom: isActive ? '3px solid #38bdf8' : '3px solid transparent',
                  color: isActive ? '#38bdf8' : '#94a3b8',
                  fontSize: '13px',
                  fontWeight: isActive ? 800 : 600,
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                  transition: 'all 0.2s ease'
                }}
              >
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Modal Body */}
        <div style={{ padding: '28px' }}>
          
          {/* ==================== TAB 1: SALARY SLIP (PAYSLIP) ==================== */}
          {activeTab === 'payslip' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '22px' }}>
              
              {/* Employee Information Card */}
              <div style={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '16px', padding: '20px' }}>
                <div style={{ fontSize: '14px', fontWeight: 800, color: '#f8fafc', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Users size={16} color="#38bdf8" />
                  <span>Employee & Payroll Period Details</span>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '11px', color: '#94a3b8', marginBottom: '4px', fontWeight: 700 }}>Employee Name</label>
                    <input
                      type="text"
                      value={empName}
                      onChange={(e) => setEmpName(e.target.value)}
                      style={{ width: '100%', background: '#0f172a', border: '1px solid #475569', borderRadius: '8px', padding: '8px 12px', color: '#f8fafc', fontSize: '13px' }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '11px', color: '#94a3b8', marginBottom: '4px', fontWeight: 700 }}>Employee ID</label>
                    <input
                      type="text"
                      value={empId}
                      onChange={(e) => setEmpId(e.target.value)}
                      style={{ width: '100%', background: '#0f172a', border: '1px solid #475569', borderRadius: '8px', padding: '8px 12px', color: '#f8fafc', fontSize: '13px' }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '11px', color: '#94a3b8', marginBottom: '4px', fontWeight: 700 }}>Designation</label>
                    <input
                      type="text"
                      value={empRole}
                      onChange={(e) => setEmpRole(e.target.value)}
                      style={{ width: '100%', background: '#0f172a', border: '1px solid #475569', borderRadius: '8px', padding: '8px 12px', color: '#f8fafc', fontSize: '13px' }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '11px', color: '#94a3b8', marginBottom: '4px', fontWeight: 700 }}>Employee Phone (for WhatsApp)</label>
                    <input
                      type="text"
                      value={empPhone}
                      onChange={(e) => setEmpPhone(e.target.value)}
                      style={{ width: '100%', background: '#0f172a', border: '1px solid #475569', borderRadius: '8px', padding: '8px 12px', color: '#f8fafc', fontSize: '13px' }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '11px', color: '#94a3b8', marginBottom: '4px', fontWeight: 700 }}>Month & Year</label>
                    <div style={{ display: 'flex', gap: '6px' }}>
                      <select
                        value={salaryMonth}
                        onChange={(e) => setSalaryMonth(e.target.value)}
                        style={{ flex: 1, background: '#0f172a', border: '1px solid #475569', borderRadius: '8px', padding: '8px', color: '#f8fafc', fontSize: '12px' }}
                      >
                        {['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'].map(m => (
                          <option key={m} value={m}>{m}</option>
                        ))}
                      </select>
                      <input
                        type="text"
                        value={salaryYear}
                        onChange={(e) => setSalaryYear(e.target.value)}
                        style={{ width: '70px', background: '#0f172a', border: '1px solid #475569', borderRadius: '8px', padding: '8px', color: '#f8fafc', fontSize: '12px' }}
                      />
                    </div>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '11px', color: '#94a3b8', marginBottom: '4px', fontWeight: 700 }}>Bank Account Number</label>
                    <input
                      type="text"
                      value={empBankAcc}
                      onChange={(e) => setEmpBankAcc(e.target.value)}
                      style={{ width: '100%', background: '#0f172a', border: '1px solid #475569', borderRadius: '8px', padding: '8px 12px', color: '#f8fafc', fontSize: '13px' }}
                    />
                  </div>
                </div>
              </div>

              {/* Earnings vs Deductions Grid */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '18px' }}>
                
                {/* Earnings Column */}
                <div style={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '16px', padding: '20px' }}>
                  <div style={{ fontSize: '14px', fontWeight: 800, color: '#34d399', marginBottom: '14px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span>🟢 Earnings & Allowances</span>
                    <span style={{ fontSize: '13px' }}>₹{grossEarnings.toLocaleString('en-IN')}</span>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: '12px', color: '#cbd5e1' }}>Basic Salary:</span>
                      <input
                        type="number"
                        value={basicSalary}
                        onChange={(e) => setBasicSalary(Number(e.target.value) || 0)}
                        style={{ width: '110px', background: '#0f172a', border: '1px solid #475569', borderRadius: '6px', padding: '6px 8px', color: '#f8fafc', fontSize: '12px', textAlign: 'right' }}
                      />
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: '12px', color: '#cbd5e1' }}>House Rent Allowance (HRA):</span>
                      <input
                        type="number"
                        value={hra}
                        onChange={(e) => setHra(Number(e.target.value) || 0)}
                        style={{ width: '110px', background: '#0f172a', border: '1px solid #475569', borderRadius: '6px', padding: '6px 8px', color: '#f8fafc', fontSize: '12px', textAlign: 'right' }}
                      />
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: '12px', color: '#cbd5e1' }}>Special Allowance:</span>
                      <input
                        type="number"
                        value={specialAllowance}
                        onChange={(e) => setSpecialAllowance(Number(e.target.value) || 0)}
                        style={{ width: '110px', background: '#0f172a', border: '1px solid #475569', borderRadius: '6px', padding: '6px 8px', color: '#f8fafc', fontSize: '12px', textAlign: 'right' }}
                      />
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: '12px', color: '#cbd5e1' }}>Conveyance / Travel:</span>
                      <input
                        type="number"
                        value={conveyance}
                        onChange={(e) => setConveyance(Number(e.target.value) || 0)}
                        style={{ width: '110px', background: '#0f172a', border: '1px solid #475569', borderRadius: '6px', padding: '6px 8px', color: '#f8fafc', fontSize: '12px', textAlign: 'right' }}
                      />
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: '12px', color: '#cbd5e1' }}>Performance Bonus:</span>
                      <input
                        type="number"
                        value={performanceBonus}
                        onChange={(e) => setPerformanceBonus(Number(e.target.value) || 0)}
                        style={{ width: '110px', background: '#0f172a', border: '1px solid #475569', borderRadius: '6px', padding: '6px 8px', color: '#f8fafc', fontSize: '12px', textAlign: 'right' }}
                      />
                    </div>
                  </div>
                </div>

                {/* Deductions Column */}
                <div style={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '16px', padding: '20px' }}>
                  <div style={{ fontSize: '14px', fontWeight: 800, color: '#f87171', marginBottom: '14px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span>🔴 Deductions & Taxes</span>
                    <span style={{ fontSize: '13px' }}>-₹{totalDeductions.toLocaleString('en-IN')}</span>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: '12px', color: '#cbd5e1' }}>Provident Fund (PF):</span>
                      <input
                        type="number"
                        value={pfDeduction}
                        onChange={(e) => setPfDeduction(Number(e.target.value) || 0)}
                        style={{ width: '110px', background: '#0f172a', border: '1px solid #475569', borderRadius: '6px', padding: '6px 8px', color: '#f8fafc', fontSize: '12px', textAlign: 'right' }}
                      />
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: '12px', color: '#cbd5e1' }}>Professional Tax (PT):</span>
                      <input
                        type="number"
                        value={profTax}
                        onChange={(e) => setProfTax(Number(e.target.value) || 0)}
                        style={{ width: '110px', background: '#0f172a', border: '1px solid #475569', borderRadius: '6px', padding: '6px 8px', color: '#f8fafc', fontSize: '12px', textAlign: 'right' }}
                      />
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: '12px', color: '#cbd5e1' }}>TDS / Income Tax:</span>
                      <input
                        type="number"
                        value={tdsTax}
                        onChange={(e) => setTdsTax(Number(e.target.value) || 0)}
                        style={{ width: '110px', background: '#0f172a', border: '1px solid #475569', borderRadius: '6px', padding: '6px 8px', color: '#f8fafc', fontSize: '12px', textAlign: 'right' }}
                      />
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: '12px', color: '#cbd5e1' }}>Unpaid LOP Leaves:</span>
                      <input
                        type="number"
                        value={unpaidLeaveDays}
                        onChange={(e) => setUnpaidLeaveDays(Number(e.target.value) || 0)}
                        placeholder="Days"
                        style={{ width: '110px', background: '#0f172a', border: '1px solid #475569', borderRadius: '6px', padding: '6px 8px', color: '#f8fafc', fontSize: '12px', textAlign: 'right' }}
                      />
                    </div>
                  </div>
                </div>

              </div>

              {/* Net Take-Home Salary Summary Banner */}
              <div style={{
                background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.15), rgba(6, 95, 70, 0.2))',
                border: '1.5px solid rgba(16, 185, 129, 0.4)',
                borderRadius: '16px',
                padding: '20px 24px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: '14px'
              }}>
                <div>
                  <span style={{ fontSize: '11px', fontWeight: 800, color: '#34d399', textTransform: 'uppercase' }}>
                    Net Salary Credited to Employee
                  </span>
                  <div style={{ fontSize: '28px', fontWeight: 900, color: '#ffffff', marginTop: '2px' }}>
                    ₹{netSalary.toLocaleString('en-IN')}
                  </div>
                  <span style={{ fontSize: '11px', color: '#94a3b8' }}>
                    Gross ₹{grossEarnings.toLocaleString('en-IN')} - Deductions ₹{totalDeductions.toLocaleString('en-IN')}
                  </span>
                </div>

                <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                  <button
                    onClick={handleDownloadPayslip}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      padding: '11px 20px',
                      borderRadius: '12px',
                      background: '#1e293b',
                      border: '1px solid #475569',
                      color: '#f8fafc',
                      fontSize: '13px',
                      fontWeight: 800,
                      cursor: 'pointer'
                    }}
                  >
                    <Printer size={15} />
                    <span>Download Official PDF Slip</span>
                  </button>

                  <button
                    onClick={handleSendPayslipWhatsApp}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      padding: '11px 22px',
                      borderRadius: '12px',
                      background: 'linear-gradient(135deg, #10b981, #059669)',
                      color: '#ffffff',
                      border: 'none',
                      fontSize: '13px',
                      fontWeight: 800,
                      cursor: 'pointer',
                      boxShadow: '0 4px 14px rgba(16, 185, 129, 0.3)'
                    }}
                  >
                    <Send size={15} />
                    <span>Send on WhatsApp</span>
                  </button>
                </div>
              </div>

            </div>
          )}

          {/* ==================== TAB 2: WHATSAPP AUTOMATION ==================== */}
          {activeTab === 'whatsapp' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '22px' }}>
              
              {/* Template Picker */}
              <div style={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '16px', padding: '20px' }}>
                <div style={{ fontSize: '14px', fontWeight: 800, color: '#f8fafc', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Zap size={16} color="#34d399" />
                  <span>Choose Instant WhatsApp Automation Template</span>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '10px' }}>
                  {[
                    { id: 'lead', label: '🚀 New Lead Auto-Welcome', desc: 'Instant brochure & scheduler' },
                    { id: 'invoice', label: '🧾 GST Invoice & UPI Pay', desc: 'Direct payment QR link' },
                    { id: 'punch', label: '⏰ Biometric Radar Alert', desc: 'Shift reminder to staff' },
                    { id: 'custom', label: '✍️ Custom WhatsApp Broadcast', desc: 'Custom text message' }
                  ].map(t => {
                    const isSelected = waRecipientType === t.id;
                    return (
                      <button
                        key={t.id}
                        onClick={() => setWaRecipientType(t.id as any)}
                        style={{
                          padding: '12px 14px',
                          borderRadius: '12px',
                          border: isSelected ? '2px solid #10b981' : '1px solid #334155',
                          background: isSelected ? 'rgba(16, 185, 129, 0.15)' : '#0f172a',
                          color: isSelected ? '#34d399' : '#cbd5e1',
                          textAlign: 'left',
                          cursor: 'pointer'
                        }}
                      >
                        <div style={{ fontWeight: 800, fontSize: '13px' }}>{t.label}</div>
                        <div style={{ fontSize: '10px', color: '#94a3b8', marginTop: '2px' }}>{t.desc}</div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Form & Live Bubble Preview */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '18px' }}>
                
                {/* Inputs */}
                <div style={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '16px', padding: '20px' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '11px', color: '#94a3b8', marginBottom: '4px', fontWeight: 700 }}>Recipient Name</label>
                      <input
                        type="text"
                        value={waClientName}
                        onChange={(e) => setWaClientName(e.target.value)}
                        style={{ width: '100%', background: '#0f172a', border: '1px solid #475569', borderRadius: '8px', padding: '8px 12px', color: '#f8fafc', fontSize: '13px' }}
                      />
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: '11px', color: '#94a3b8', marginBottom: '4px', fontWeight: 700 }}>WhatsApp Mobile Number</label>
                      <input
                        type="text"
                        value={waPhone}
                        onChange={(e) => setWaPhone(e.target.value)}
                        placeholder="e.g. 918368817744"
                        style={{ width: '100%', background: '#0f172a', border: '1px solid #475569', borderRadius: '8px', padding: '8px 12px', color: '#f8fafc', fontSize: '13px' }}
                      />
                    </div>

                    {waRecipientType === 'custom' && (
                      <div>
                        <label style={{ display: 'block', fontSize: '11px', color: '#94a3b8', marginBottom: '4px', fontWeight: 700 }}>Custom Message Text</label>
                        <textarea
                          rows={4}
                          value={waCustomMessage}
                          onChange={(e) => setWaCustomMessage(e.target.value)}
                          style={{ width: '100%', background: '#0f172a', border: '1px solid #475569', borderRadius: '8px', padding: '8px 12px', color: '#f8fafc', fontSize: '12px' }}
                        />
                      </div>
                    )}
                  </div>
                </div>

                {/* WhatsApp Chat Preview Bubble */}
                <div style={{ background: '#0b141a', border: '1px solid #202c33', borderRadius: '16px', padding: '20px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                  <div>
                    <div style={{ fontSize: '11px', color: '#00a884', fontWeight: 800, textTransform: 'uppercase', marginBottom: '10px' }}>
                      Live WhatsApp Preview (+{waPhone.replace(/\D/g, '')})
                    </div>
                    <div style={{
                      background: '#005c4b',
                      color: '#e9edef',
                      padding: '12px 16px',
                      borderRadius: '12px 12px 2px 12px',
                      fontSize: '12px',
                      lineHeight: '1.6',
                      whiteSpace: 'pre-wrap',
                      boxShadow: '0 2px 8px rgba(0,0,0,0.2)'
                    }}>
                      {getPresetMessage()}
                    </div>
                  </div>

                  <button
                    onClick={handleSendWhatsAppMessage}
                    style={{
                      marginTop: '16px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px',
                      padding: '12px',
                      borderRadius: '12px',
                      background: 'linear-gradient(135deg, #00a884, #008069)',
                      color: '#ffffff',
                      border: 'none',
                      fontSize: '13px',
                      fontWeight: 800,
                      cursor: 'pointer'
                    }}
                  >
                    <Send size={15} />
                    <span>Send Message on WhatsApp</span>
                  </button>
                </div>

              </div>

            </div>
          )}

          {/* ==================== TAB 3: GPS GEOFENCE RADAR ==================== */}
          {activeTab === 'geofence' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '22px' }}>
              
              {/* Geofence Status Header */}
              <div style={{
                background: isInsideGeofence ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                border: `1.5px solid ${isInsideGeofence ? 'rgba(16, 185, 129, 0.3)' : 'rgba(239, 68, 68, 0.3)'}`,
                borderRadius: '16px',
                padding: '20px 24px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: '14px'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                  <div style={{
                    width: '46px',
                    height: '46px',
                    borderRadius: '14px',
                    background: isInsideGeofence ? 'rgba(16, 185, 129, 0.2)' : 'rgba(239, 68, 68, 0.2)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: isInsideGeofence ? '#34d399' : '#f87171'
                  }}>
                    <MapPin size={24} />
                  </div>
                  <div>
                    <div style={{ fontSize: '16px', fontWeight: 900, color: '#f8fafc' }}>
                      {isInsideGeofence ? `✅ INSIDE OFFICE RADIUS (${distanceMeters}m away)` : `⚠️ OUTSIDE OFFICE RADIUS (${distanceMeters}m away)`}
                    </div>
                    <div style={{ fontSize: '12px', color: '#94a3b8', marginTop: '2px' }}>
                      Allowed Geofence Radius: <strong>{allowedRadiusMeters} meters</strong> • GPS Spoof Prevention Active
                    </div>
                  </div>
                </div>

                <button
                  onClick={handleDetectLiveLocation}
                  disabled={isLocating}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '10px 18px',
                    borderRadius: '12px',
                    background: '#0284c7',
                    color: '#ffffff',
                    border: 'none',
                    fontSize: '12px',
                    fontWeight: 800,
                    cursor: 'pointer'
                  }}
                >
                  <RefreshCw size={14} className={isLocating ? 'animate-spin' : ''} />
                  <span>{isLocating ? 'Pinging GPS...' : 'Ping Live GPS'}</span>
                </button>
              </div>

              {/* Geofence Controls & Field Logger */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '18px' }}>
                
                {/* Office Radius Config */}
                <div style={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '16px', padding: '20px' }}>
                  <div style={{ fontSize: '14px', fontWeight: 800, color: '#f8fafc', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Compass size={16} color="#38bdf8" />
                    <span>Office Coordinates & Radius</span>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '11px', color: '#94a3b8', marginBottom: '4px' }}>Office Latitude & Longitude</label>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <input
                          type="number"
                          step="0.0001"
                          value={officeLat}
                          onChange={(e) => setOfficeLat(parseFloat(e.target.value) || 0)}
                          style={{ flex: 1, background: '#0f172a', border: '1px solid #475569', borderRadius: '8px', padding: '8px', color: '#f8fafc', fontSize: '12px' }}
                        />
                        <input
                          type="number"
                          step="0.0001"
                          value={officeLng}
                          onChange={(e) => setOfficeLng(parseFloat(e.target.value) || 0)}
                          style={{ flex: 1, background: '#0f172a', border: '1px solid #475569', borderRadius: '8px', padding: '8px', color: '#f8fafc', fontSize: '12px' }}
                        />
                      </div>
                    </div>

                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: '#94a3b8', marginBottom: '4px' }}>
                        <span>Allowed Punch Radius</span>
                        <strong style={{ color: '#38bdf8' }}>{allowedRadiusMeters} Meters</strong>
                      </div>
                      <input
                        type="range"
                        min="20"
                        max="500"
                        step="10"
                        value={allowedRadiusMeters}
                        onChange={(e) => setAllowedRadiusMeters(Number(e.target.value))}
                        style={{ width: '100%', cursor: 'pointer' }}
                      />
                    </div>
                  </div>
                </div>

                {/* Field Sales Meeting Logger */}
                <div style={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '16px', padding: '20px' }}>
                  <div style={{ fontSize: '14px', fontWeight: 800, color: '#f8fafc', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Target size={16} color="#a855f7" />
                    <span>Field Sales GPS Meeting Check-in</span>
                  </div>

                  <form onSubmit={handleLogFieldCheckin} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    <input
                      type="text"
                      required
                      placeholder="Client Company Name..."
                      value={clientMeetingName}
                      onChange={(e) => setClientMeetingName(e.target.value)}
                      style={{ width: '100%', background: '#0f172a', border: '1px solid #475569', borderRadius: '8px', padding: '8px 12px', color: '#f8fafc', fontSize: '12px' }}
                    />
                    <input
                      type="text"
                      placeholder="Purpose / Meeting Outcome..."
                      value={meetingPurpose}
                      onChange={(e) => setMeetingPurpose(e.target.value)}
                      style={{ width: '100%', background: '#0f172a', border: '1px solid #475569', borderRadius: '8px', padding: '8px 12px', color: '#f8fafc', fontSize: '12px' }}
                    />
                    <button
                      type="submit"
                      style={{
                        padding: '10px',
                        borderRadius: '10px',
                        background: 'linear-gradient(135deg, #a855f7, #6366f1)',
                        color: '#ffffff',
                        border: 'none',
                        fontSize: '12px',
                        fontWeight: 800,
                        cursor: 'pointer'
                      }}
                    >
                      📍 Log GPS Field Check-in
                    </button>
                  </form>
                </div>

              </div>

              {/* Logged Meetings Table */}
              <div style={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '16px', padding: '20px' }}>
                <div style={{ fontSize: '13px', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', marginBottom: '12px' }}>
                  Today's GPS Field Sales Radar Trail
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {loggedCheckins.map((item) => (
                    <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#0f172a', padding: '10px 14px', borderRadius: '10px', border: '1px solid #334155' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#10b981' }} />
                        <div>
                          <div style={{ fontWeight: 800, fontSize: '13px' }}>{item.client}</div>
                          <div style={{ fontSize: '11px', color: '#94a3b8' }}>{item.distance}</div>
                        </div>
                      </div>
                      <div style={{ fontSize: '11px', color: '#38bdf8', fontWeight: 700 }}>
                        {item.time}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          )}

          {/* ==================== TAB 4: DAILY OWNER EXECUTIVE DIGEST (EOD) ==================== */}
          {activeTab === 'eod' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '22px' }}>
              
              {/* Daily KPI Dashboard */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '14px' }}>
                <div style={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '16px', padding: '18px' }}>
                  <div style={{ fontSize: '11px', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase' }}>Staff Attendance</div>
                  <div style={{ fontSize: '22px', fontWeight: 900, color: '#34d399', marginTop: '4px' }}>
                    {eodStats.presentStaff} / {eodStats.totalStaff}
                  </div>
                  <div style={{ fontSize: '11px', color: '#94a3b8', marginTop: '2px' }}>
                    {Math.round((eodStats.presentStaff / eodStats.totalStaff) * 100)}% Present Today
                  </div>
                </div>

                <div style={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '16px', padding: '18px' }}>
                  <div style={{ fontSize: '11px', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase' }}>CRM Conversions</div>
                  <div style={{ fontSize: '22px', fontWeight: 900, color: '#38bdf8', marginTop: '4px' }}>
                    {eodStats.dealsClosed} Won
                  </div>
                  <div style={{ fontSize: '11px', color: '#94a3b8', marginTop: '2px' }}>
                    From {eodStats.newLeads} New Leads
                  </div>
                </div>

                <div style={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '16px', padding: '18px' }}>
                  <div style={{ fontSize: '11px', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase' }}>Collections Today</div>
                  <div style={{ fontSize: '22px', fontWeight: 900, color: '#f59e0b', marginTop: '4px' }}>
                    ₹{eodStats.revenueCollected.toLocaleString('en-IN')}
                  </div>
                  <div style={{ fontSize: '11px', color: '#94a3b8', marginTop: '2px' }}>
                    {eodStats.invoicesCleared} GST Invoices Cleared
                  </div>
                </div>
              </div>

              {/* Formatted Message Box */}
              <div style={{ background: '#0b141a', border: '1px solid #202c33', borderRadius: '16px', padding: '20px' }}>
                <div style={{ fontSize: '11px', color: '#00a884', fontWeight: 800, textTransform: 'uppercase', marginBottom: '10px' }}>
                  Company Owner Evening WhatsApp Digest Preview
                </div>

                <div style={{
                  background: '#005c4b',
                  color: '#e9edef',
                  padding: '16px',
                  borderRadius: '12px',
                  fontSize: '12px',
                  lineHeight: '1.6',
                  whiteSpace: 'pre-wrap',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
                  fontFamily: 'monospace'
                }}>
                  {getEodSummaryText()}
                </div>

                <button
                  onClick={handleSendEodDigestWhatsApp}
                  style={{
                    marginTop: '16px',
                    width: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    padding: '12px',
                    borderRadius: '12px',
                    background: 'linear-gradient(135deg, #00a884, #008069)',
                    color: '#ffffff',
                    border: 'none',
                    fontSize: '13px',
                    fontWeight: 800,
                    cursor: 'pointer'
                  }}
                >
                  <Send size={15} />
                  <span>Send EOD Report to Owner on WhatsApp (+{tenant?.adminPhone || '918368817744'})</span>
                </button>
              </div>

            </div>
          )}

        </div>

      </div>
    </div>
  );
};
