import React, { useState, useEffect } from 'react';
import { 
  X, 
  Sparkles, 
  HardDrive, 
  Calendar, 
  Users, 
  CreditCard, 
  Download, 
  ArrowUpRight, 
  ShieldCheck, 
  CheckCircle2, 
  Clock, 
  Zap, 
  Plus, 
  Check, 
  Receipt, 
  TrendingUp,
  AlertTriangle
} from 'lucide-react';
import { 
  TenantCompany, 
  SubscriptionPlanDef, 
  getLiveSubscriptionPlans,
  calculateSubscriptionMetrics,
  getLiveSuperOwnerTaxConfig,
  type SuperOwnerTaxConfig,
  syncCompanySubscriptionChange 
} from '../types/multiTenant';
import { paymentService } from '../services/paymentService';

interface SubscriptionQuotaMeterModalProps {
  isOpen: boolean;
  onClose: () => void;
  tenant: TenantCompany | null;
  plans?: SubscriptionPlanDef[];
  onUpgradeSuccess?: (updatedTenant: TenantCompany) => void;
  lang?: 'en' | 'hi';
}

export const SubscriptionQuotaMeterModal: React.FC<SubscriptionQuotaMeterModalProps> = ({
  isOpen,
  onClose,
  tenant,
  plans: initialPlans,
  onUpgradeSuccess,
  lang = 'en'
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'addons' | 'receipts'>('overview');
  const [isProcessing, setIsProcessing] = useState(false);
  const [successToast, setSuccessToast] = useState<string | null>(null);

  // Live Subscription Plans State
  const [plans, setPlans] = useState<SubscriptionPlanDef[]>(initialPlans || getLiveSubscriptionPlans());

  // Live Super Owner Tax Configuration State
  const [taxConfig, setTaxConfig] = useState<SuperOwnerTaxConfig>(getLiveSuperOwnerTaxConfig());

  useEffect(() => {
    const handlePlansUpdate = () => {
      setPlans(getLiveSubscriptionPlans());
    };
    const handleTaxUpdate = () => {
      setTaxConfig(getLiveSuperOwnerTaxConfig());
    };
    window.addEventListener('subscription_plans_updated', handlePlansUpdate);
    window.addEventListener('superowner_tax_config_updated', handleTaxUpdate);
    return () => {
      window.removeEventListener('subscription_plans_updated', handlePlansUpdate);
      window.removeEventListener('superowner_tax_config_updated', handleTaxUpdate);
    };
  }, []);

  if (!isOpen) return null;

  const currentPlanDef = plans.find(p => p.id === tenant?.planId) || plans[1] || plans[0];
  const metrics = calculateSubscriptionMetrics(tenant, currentPlanDef, taxConfig);

  const triggerLocalToast = (msg: string) => {
    setSuccessToast(msg);
    setTimeout(() => setSuccessToast(null), 3500);
  };

  // Helper to compute tax breakdown for any base amount
  const calculateTaxForAmount = (basePrice: number) => {
    const effectiveRate = taxConfig.enabled ? (Number(taxConfig.ratePercent) || 0) : 0;
    if (!taxConfig.enabled || effectiveRate === 0) {
      return { base: basePrice, tax: 0, total: basePrice, rate: 0 };
    }
    if (taxConfig.isTaxInclusive) {
      const tax = Math.round(basePrice - (basePrice / (1 + effectiveRate / 100)));
      return { base: basePrice - tax, tax, total: basePrice, rate: effectiveRate };
    }
    const tax = Math.round(basePrice * (effectiveRate / 100));
    return { base: basePrice, tax, total: basePrice + tax, rate: effectiveRate };
  };

  // Handle Instant Plan Upgrade via Razorpay / Payment Gateway
  const handleUpgradePlan = (targetPlan: SubscriptionPlanDef) => {
    if (!tenant) return;
    setIsProcessing(true);

    const taxCalc = calculateTaxForAmount(targetPlan.priceMonthly);

    paymentService.openCheckout(
      {
        planId: targetPlan.id,
        amount: taxCalc.total,
        companyName: tenant.name,
        customerName: tenant.adminName,
        customerEmail: tenant.adminEmail,
        customerPhone: tenant.adminPhone
      },
      (result) => {
        setIsProcessing(false);
        const newRenewal = new Date();
        newRenewal.setDate(newRenewal.getDate() + 30);

        const updated: TenantCompany = {
          ...tenant,
          planId: targetPlan.id as any,
          userSeatLimit: targetPlan.seatLimit,
          storageLimitGb: targetPlan.storageLimitGb || 25,
          mrrAmount: targetPlan.priceMonthly,
          renewalDate: newRenewal.toISOString().split('T')[0],
          status: 'active',
          lastPayment: {
            id: `RCPT-${Date.now()}`,
            planId: targetPlan.id,
            planName: targetPlan.name,
            baseAmount: targetPlan.priceMonthly,
            gstAmount: taxCalc.tax,
            totalAmount: taxCalc.total,
            date: new Date().toISOString().split('T')[0],
            renewalDate: newRenewal.toISOString().split('T')[0],
            billingCycle: tenant.billingCycle || 'monthly',
            paymentId: result.paymentId || `PAY-${Date.now()}`,
            paymentMethod: 'Razorpay / UPI',
            status: 'paid',
            invoiceNumber: `${taxConfig.taxInvoicePrefix || 'INV-ITLC'}-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`
          }
        };

        syncCompanySubscriptionChange({
          companyId: updated.id,
          companyName: updated.name,
          email: updated.adminEmail,
          planId: updated.planId,
          renewalDate: updated.renewalDate,
          maxSeats: updated.userSeatLimit,
          status: 'active'
        });

        if (onUpgradeSuccess) {
          onUpgradeSuccess(updated);
        }
        triggerLocalToast(
          `🎉 Success! Upgraded to ${targetPlan.name} with ${targetPlan.storageLimitGb} GB Storage!`
        );
      },
      () => {
        setIsProcessing(false);
      }
    );
  };

  // Handle Storage Add-on purchase
  const handleAddStorageBoost = (extraGb: number, price: number) => {
    if (!tenant) return;
    setIsProcessing(true);

    const taxCalc = calculateTaxForAmount(price);

    paymentService.openCheckout(
      {
        planId: `addon_storage_${extraGb}gb`,
        amount: taxCalc.total,
        companyName: tenant.name,
        customerName: tenant.adminName,
        customerEmail: tenant.adminEmail,
        customerPhone: tenant.adminPhone
      },
      () => {
        setIsProcessing(false);
        const updated: TenantCompany = {
          ...tenant,
          storageLimitGb: (tenant.storageLimitGb || 25) + extraGb
        };
        syncCompanySubscriptionChange({
          companyId: updated.id,
          companyName: updated.name,
          planId: updated.planId,
          storageLimitGb: updated.storageLimitGb
        });
        if (onUpgradeSuccess) {
          onUpgradeSuccess(updated);
        }
        triggerLocalToast(`⚡ +${extraGb} GB Cloud Storage added to your quota!`);
      },
      () => setIsProcessing(false)
    );
  };

  // Generate downloadable Tax Invoice HTML/PDF
  const handleDownloadInvoice = () => {
    const taxRowHtml = !metrics.taxEnabled || metrics.taxRatePercent === 0
      ? `
        <tr>
          <td colspan="3" style="text-align: right; font-weight: 700;">Tax / GST (0% Exempt):</td>
          <td>₹0</td>
        </tr>
      `
      : taxConfig.enableStateSplit
        ? `
          <tr>
            <td colspan="3" style="text-align: right; font-weight: 700;">CGST (${(metrics.taxRatePercent / 2).toFixed(1)}%):</td>
            <td>₹${metrics.cgstAmount.toLocaleString('en-IN')}</td>
          </tr>
          <tr>
            <td colspan="3" style="text-align: right; font-weight: 700;">SGST (${(metrics.taxRatePercent / 2).toFixed(1)}%):</td>
            <td>₹${metrics.sgstAmount.toLocaleString('en-IN')}</td>
          </tr>
        `
        : `
          <tr>
            <td colspan="3" style="text-align: right; font-weight: 700;">${metrics.taxLabel} (${metrics.taxRatePercent}% IGST):</td>
            <td>₹${metrics.igstAmount.toLocaleString('en-IN')}</td>
          </tr>
        `;

    const invoiceContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Tax Invoice - ${metrics.invoiceNumber}</title>
        <style>
          body { font-family: system-ui, -apple-system, sans-serif; padding: 40px; color: #0f172a; max-width: 800px; margin: 0 auto; background: #fff; }
          .header { display: flex; justify-content: space-between; border-bottom: 2px solid #0284c7; padding-bottom: 20px; }
          .title { font-size: 22px; font-weight: 900; color: #0284c7; }
          .meta-row { font-size: 13px; color: #475569; margin-top: 3px; }
          .table { width: 100%; border-collapse: collapse; margin-top: 26px; font-size: 13px; }
          .table th, .table td { border: 1px solid #e2e8f0; padding: 12px; text-align: left; }
          .table th { background: #f8fafc; font-weight: 700; color: #334155; }
          .badge { background: #dcfce7; color: #15803d; padding: 4px 10px; border-radius: 12px; font-weight: 800; font-size: 12px; display: inline-block; margin-top: 6px; }
        </style>
      </head>
      <body>
        <div class="header">
          <div>
            <div class="title">${metrics.registeredLegalName}</div>
            <div class="meta-row"><strong>GSTIN:</strong> ${metrics.taxGstin || '07AABCI8899K1Z4'}</div>
            <div class="meta-row"><strong>HSN/SAC:</strong> ${metrics.hsnSacCode || '998313'} (Cloud SaaS Platform)</div>
            <div class="meta-row">Universal Enterprise Operating System</div>
          </div>
          <div style="text-align: right;">
            <div style="font-size: 18px; font-weight: 800; color: #0f172a;">TAX INVOICE / RECEIPT</div>
            <div class="meta-row">Invoice No: <strong>${metrics.invoiceNumber}</strong></div>
            <div class="meta-row">Date: ${new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</div>
            <div class="badge">PAID • 100% VERIFIED</div>
          </div>
        </div>
        <div style="margin-top: 24px; display: flex; justify-content: space-between; font-size: 13px;">
          <div>
            <strong>Billed To (Customer):</strong><br/>
            ${tenant?.name || 'TechNova Solutions Pvt Ltd'}<br/>
            GSTIN: ${tenant?.gstin || '07AABCT1234F1Z8'}<br/>
            Attn: ${tenant?.adminName || 'Admin'} (${tenant?.adminEmail || 'admin@itlc.in'})
          </div>
          <div style="text-align: right;">
            <strong>Transaction Details:</strong><br/>
            Txn ID: ${metrics.transactionId}<br/>
            Method: ${metrics.paymentMethod}<br/>
            Billing Mode: ${taxConfig.isTaxInclusive ? 'Tax Inclusive (MRP)' : 'Tax Exclusive'}<br/>
            Cycle: ${metrics.billingCycle.toUpperCase()}
          </div>
        </div>
        <table class="table">
          <thead>
            <tr>
              <th>Description & Service</th>
              <th>Storage / Seats Allocation</th>
              <th>Billing Period</th>
              <th>Amount (INR)</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>
                <strong>ITLC ${metrics.planName} Subscription</strong><br/>
                <span style="font-size: 12px; color: #64748b;">Full Access to Sales CRM Cloud & OmniStaff HRMS Radar</span>
              </td>
              <td>${metrics.storageLimitGb} GB Cloud Storage • ${metrics.seatsLimit} Team Seats</td>
              <td>1 Billing Cycle (Valid until ${metrics.renewalDateFormatted})</td>
              <td>₹${metrics.baseAmount.toLocaleString('en-IN')}</td>
            </tr>
            <tr>
              <td colspan="3" style="text-align: right; font-weight: 700;">Subtotal:</td>
              <td>₹${metrics.baseAmount.toLocaleString('en-IN')}</td>
            </tr>
            ${taxRowHtml}
            <tr style="background: #f0fdf4;">
              <td colspan="3" style="text-align: right; font-weight: 900; font-size: 15px; color: #15803d;">Total Paid (INR):</td>
              <td style="font-weight: 900; font-size: 15px; color: #15803d;">₹${metrics.totalPaid.toLocaleString('en-IN')}</td>
            </tr>
          </tbody>
        </table>
        <div style="margin-top: 36px; padding: 16px; background: #f8fafc; border-radius: 12px; border: 1px solid #e2e8f0; font-size: 11px; color: #64748b; line-height: 1.6;">
          <strong>Legal Terms & Regulatory Note:</strong><br/>
          ${metrics.invoiceTerms || 'Tax invoice issued in accordance with Section 31 of CGST Act, 2017. Computer generated receipt.'}<br/>
          <strong>Platform Super Owner:</strong> ${metrics.registeredLegalName} • Helpline: +91 83688 17744 • Email: billing@itlc.in
        </div>
        <script>
          window.print();
        </script>
      </body>
      </html>
    `;

    const blob = new Blob([invoiceContent], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const w = window.open(url, '_blank');
    if (!w) {
      triggerLocalToast("Please allow popups to download your tax invoice.");
    }
  };

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      background: 'rgba(15, 23, 42, 0.75)',
      backdropFilter: 'blur(8px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 9999,
      padding: '20px'
    }}>
      {/* Modal Container */}
      <div style={{
        background: '#ffffff',
        borderRadius: '24px',
        width: '100%',
        maxWidth: '860px',
        maxHeight: '90vh',
        overflowY: 'auto',
        boxShadow: '0 25px 60px -15px rgba(0, 0, 0, 0.3)',
        border: '1px solid #e2e8f0',
        fontFamily: 'system-ui, -apple-system, sans-serif',
        position: 'relative'
      }}>
        
        {/* Toast Alert */}
        {successToast && (
          <div style={{
            position: 'absolute',
            top: '20px',
            left: '50%',
            transform: 'translateX(-50%)',
            background: '#10b981',
            color: '#ffffff',
            padding: '10px 20px',
            borderRadius: '30px',
            fontWeight: 700,
            fontSize: '13px',
            boxShadow: '0 10px 25px rgba(16, 185, 129, 0.4)',
            zIndex: 100,
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <Sparkles size={16} />
            <span>{successToast}</span>
          </div>
        )}

        {/* Top Header */}
        <div style={{
          padding: '24px 28px',
          borderBottom: '1px solid #f1f5f9',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: 'linear-gradient(135deg, #f8fafc 0%, #ffffff 100%)',
          borderTopLeftRadius: '24px',
          borderTopRightRadius: '24px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <div style={{
              width: '46px',
              height: '46px',
              borderRadius: '14px',
              background: 'linear-gradient(135deg, #0284c7 0%, #2563eb 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#ffffff',
              boxShadow: '0 8px 16px rgba(2, 132, 199, 0.25)'
            }}>
              <HardDrive size={22} />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 800, color: '#0f172a' }}>
                  {tenant?.name || 'TechNova Solutions Pvt Ltd'}
                </h3>
                <span style={{
                  fontSize: '11px',
                  fontWeight: 800,
                  padding: '3px 10px',
                  borderRadius: '20px',
                  background: metrics.isExpired ? '#fef2f2' : metrics.isExpiringSoon ? '#fffbeb' : '#dcfce7',
                  color: metrics.isExpired ? '#dc2626' : metrics.isExpiringSoon ? '#d97706' : '#15803d',
                  border: `1px solid ${metrics.isExpired ? '#fca5a5' : metrics.isExpiringSoon ? '#fde68a' : '#86efac'}`
                }}>
                  {metrics.isExpired ? '🔴 EXPIRED' : metrics.isExpiringSoon ? '🟡 EXPIRING SOON' : '🟢 ACTIVE PLAN'}
                </span>
              </div>
              <span style={{ fontSize: '12px', color: '#64748b', fontWeight: 600 }}>
                Live Cloud Quota, Storage & Real-Time Validity Tracker
              </span>
            </div>
          </div>

          <button
            onClick={onClose}
            style={{
              background: '#f1f5f9',
              border: 'none',
              width: '36px',
              height: '36px',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              color: '#64748b'
            }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Tab Navigation */}
        <div style={{
          display: 'flex',
          borderBottom: '1px solid #e2e8f0',
          padding: '0 28px',
          background: '#ffffff',
          gap: '8px'
        }}>
          <button
            onClick={() => setActiveTab('overview')}
            style={{
              padding: '14px 18px',
              fontSize: '13px',
              fontWeight: 700,
              color: activeTab === 'overview' ? '#0284c7' : '#64748b',
              borderBottom: activeTab === 'overview' ? '2.5px solid #0284c7' : '2.5px solid transparent',
              background: 'transparent',
              borderTop: 'none',
              borderLeft: 'none',
              borderRight: 'none',
              cursor: 'pointer'
            }}
          >
            📊 Live Quota & Validity
          </button>
          <button
            onClick={() => setActiveTab('addons')}
            style={{
              padding: '14px 18px',
              fontSize: '13px',
              fontWeight: 700,
              color: activeTab === 'addons' ? '#0284c7' : '#64748b',
              borderBottom: activeTab === 'addons' ? '2.5px solid #0284c7' : '2.5px solid transparent',
              background: 'transparent',
              borderTop: 'none',
              borderLeft: 'none',
              borderRight: 'none',
              cursor: 'pointer'
            }}
          >
            ⚡ Upgrade & Storage Add-ons
          </button>
          <button
            onClick={() => setActiveTab('receipts')}
            style={{
              padding: '14px 18px',
              fontSize: '13px',
              fontWeight: 700,
              color: activeTab === 'receipts' ? '#0284c7' : '#64748b',
              borderBottom: activeTab === 'receipts' ? '2.5px solid #0284c7' : '2.5px solid transparent',
              background: 'transparent',
              borderTop: 'none',
              borderLeft: 'none',
              borderRight: 'none',
              cursor: 'pointer'
            }}
          >
            🧾 Tax Invoices & Receipts
          </button>
        </div>

        {/* Modal Body Content */}
        <div style={{ padding: '28px' }}>
          
          {activeTab === 'overview' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              
              {/* 4 Quick Stat Cards */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
                gap: '16px'
              }}>
                {/* Card 1: Active Plan */}
                <div style={{
                  background: '#f8fafc',
                  border: '1px solid #e2e8f0',
                  borderRadius: '16px',
                  padding: '18px'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                    <span style={{ fontSize: '11px', fontWeight: 800, color: '#64748b', textTransform: 'uppercase' }}>Current Plan</span>
                    <Sparkles size={16} color="#0284c7" />
                  </div>
                  <div style={{ fontSize: '12px', color: '#15803d', fontWeight: 700, marginTop: '4px' }}>
                    ₹{metrics.baseAmount.toLocaleString('en-IN')} / {metrics.billingCycle} {metrics.taxEnabled && metrics.taxRatePercent > 0 ? `(+${metrics.taxRatePercent}% ${metrics.taxLabel})` : '(0% Tax Exempt)'}
                  </div>
                </div>

                {/* Card 2: Validity Countdown */}
                <div style={{
                  background: '#f8fafc',
                  border: '1px solid #e2e8f0',
                  borderRadius: '16px',
                  padding: '18px'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                    <span style={{ fontSize: '11px', fontWeight: 800, color: '#64748b', textTransform: 'uppercase' }}>Month Validity</span>
                    <Calendar size={16} color="#2563eb" />
                  </div>
                  <div style={{ fontSize: '18px', fontWeight: 900, color: metrics.isExpiringSoon ? '#d97706' : '#0f172a' }}>
                    {metrics.daysRemaining} Days Left
                  </div>
                  <div style={{ fontSize: '12px', color: '#64748b', marginTop: '4px' }}>
                    Renews: {metrics.renewalDateFormatted}
                  </div>
                </div>

                {/* Card 3: Storage Meter */}
                <div style={{
                  background: '#f8fafc',
                  border: '1px solid #e2e8f0',
                  borderRadius: '16px',
                  padding: '18px'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                    <span style={{ fontSize: '11px', fontWeight: 800, color: '#64748b', textTransform: 'uppercase' }}>Cloud Storage</span>
                    <HardDrive size={16} color="#7c3aed" />
                  </div>
                  <div style={{ fontSize: '18px', fontWeight: 900, color: '#0f172a' }}>
                    {metrics.storageUsedGb} / {metrics.storageLimitGb} GB
                  </div>
                  <div style={{ fontSize: '12px', color: '#64748b', marginTop: '4px' }}>
                    {metrics.storagePercent}% Used ({((metrics.storageLimitGb - metrics.storageUsedGb)).toFixed(1)} GB Free)
                  </div>
                </div>

                {/* Card 4: Staff Seats */}
                <div style={{
                  background: '#f8fafc',
                  border: '1px solid #e2e8f0',
                  borderRadius: '16px',
                  padding: '18px'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                    <span style={{ fontSize: '11px', fontWeight: 800, color: '#64748b', textTransform: 'uppercase' }}>Team Seats</span>
                    <Users size={16} color="#059669" />
                  </div>
                  <div style={{ fontSize: '18px', fontWeight: 900, color: '#0f172a' }}>
                    {metrics.seatsUsed} / {metrics.seatsLimit} Seats
                  </div>
                  <div style={{ fontSize: '12px', color: '#64748b', marginTop: '4px' }}>
                    {metrics.seatsLimit - metrics.seatsUsed} Seats Available
                  </div>
                </div>
              </div>

              {/* REAL TIME STORAGE METER PROGRESS BAR */}
              <div style={{
                background: '#ffffff',
                border: '1.5px solid #e2e8f0',
                borderRadius: '18px',
                padding: '22px',
                boxShadow: '0 4px 20px rgba(15, 23, 42, 0.03)'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <HardDrive size={18} color="#0284c7" />
                    <span style={{ fontWeight: 800, fontSize: '14px', color: '#0f172a' }}>
                      Real-Time Cloud Storage Allocation & Metering
                    </span>
                  </div>
                  <span style={{ fontSize: '13px', fontWeight: 800, color: '#0284c7' }}>
                    {metrics.storageUsedGb} GB of {metrics.storageLimitGb} GB Allocated
                  </span>
                </div>

                {/* Multi-Segment Bar */}
                <div style={{
                  height: '14px',
                  borderRadius: '10px',
                  background: '#e2e8f0',
                  overflow: 'hidden',
                  display: 'flex',
                  marginBottom: '16px'
                }}>
                  <div style={{ width: `${Math.min(100, (1.85 / metrics.storageLimitGb) * 100)}%`, background: '#0284c7' }} title="CRM Lead Attachments (1.85 GB)" />
                  <div style={{ width: `${Math.min(100, (0.92 / metrics.storageLimitGb) * 100)}%`, background: '#7c3aed' }} title="HRMS Staff KYC & Docs (0.92 GB)" />
                  <div style={{ width: `${Math.min(100, (0.45 / metrics.storageLimitGb) * 100)}%`, background: '#10b981' }} title="GST Tax Invoices (0.45 GB)" />
                  <div style={{ width: `${Math.min(100, (0.20 / metrics.storageLimitGb) * 100)}%`, background: '#f59e0b' }} title="Database & Audit Logs (0.20 GB)" />
                </div>

                {/* Storage Legend */}
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
                  gap: '10px',
                  fontSize: '11px',
                  color: '#64748b'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#0284c7' }} />
                    <span>CRM Attachments (1.85 GB)</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#7c3aed' }} />
                    <span>Staff KYC Docs (0.92 GB)</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#10b981' }} />
                    <span>GST Invoices (0.45 GB)</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#f59e0b' }} />
                    <span>DB & Logs (0.20 GB)</span>
                  </div>
                </div>
              </div>

              {/* REAL TIME VALIDITY & EXPIRY PROGRESS */}
              <div style={{
                background: '#ffffff',
                border: '1.5px solid #e2e8f0',
                borderRadius: '18px',
                padding: '22px',
                boxShadow: '0 4px 20px rgba(15, 23, 42, 0.03)'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Clock size={18} color="#2563eb" />
                    <span style={{ fontWeight: 800, fontSize: '14px', color: '#0f172a' }}>
                      Billing Cycle & Renewal Countdown ({metrics.totalDays} Days Cycle)
                    </span>
                  </div>
                  <span style={{ fontSize: '13px', fontWeight: 800, color: metrics.isExpiringSoon ? '#d97706' : '#2563eb' }}>
                    {metrics.daysRemaining} Days Remaining
                  </span>
                </div>

                <div style={{
                  height: '10px',
                  borderRadius: '10px',
                  background: '#e2e8f0',
                  overflow: 'hidden',
                  marginBottom: '12px'
                }}>
                  <div style={{
                    width: `${100 - metrics.percentageElapsed}%`,
                    height: '100%',
                    background: metrics.isExpiringSoon ? 'linear-gradient(90deg, #f59e0b, #ef4444)' : 'linear-gradient(90deg, #0284c7, #10b981)',
                    borderRadius: '10px',
                    transition: 'width 0.4s ease'
                  }} />
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: '#64748b' }}>
                  <span>Onboarded: {tenant?.onboardDate || '15 Jul 2026'}</span>
                  <span><strong>Next Auto-Renewal:</strong> {metrics.renewalDateFormatted}</span>
                </div>
              </div>

              {/* Actions Footer */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
                <button
                  onClick={handleDownloadInvoice}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '10px 18px',
                    borderRadius: '12px',
                    background: '#ffffff',
                    border: '1.5px solid #cbd5e1',
                    color: '#0f172a',
                    fontSize: '13px',
                    fontWeight: 700,
                    cursor: 'pointer'
                  }}
                >
                  <Download size={15} />
                  <span>Download Tax Invoice (₹{metrics.totalPaid.toLocaleString('en-IN')})</span>
                </button>

                <button
                  onClick={() => setActiveTab('addons')}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '10px 22px',
                    borderRadius: '12px',
                    background: 'linear-gradient(135deg, #0284c7, #2563eb)',
                    color: '#ffffff',
                    border: 'none',
                    fontSize: '13px',
                    fontWeight: 800,
                    cursor: 'pointer',
                    boxShadow: '0 4px 14px rgba(2, 132, 199, 0.3)'
                  }}
                >
                  <Zap size={15} />
                  <span>Upgrade Plan / Add More GB</span>
                </button>
              </div>

            </div>
          )}

          {activeTab === 'addons' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              
              {/* Plan Upgrade Options */}
              <div>
                <h4 style={{ margin: '0 0 14px 0', fontSize: '15px', fontWeight: 800, color: '#0f172a' }}>
                  Select Plan Upgrade
                </h4>
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
                  gap: '16px'
                }}>
                  {plans.map((p) => {
                    const isCurrent = p.id === tenant?.planId;
                    return (
                      <div
                        key={p.id}
                        style={{
                          border: isCurrent ? '2px solid #0284c7' : '1px solid #e2e8f0',
                          borderRadius: '16px',
                          padding: '20px',
                          background: isCurrent ? 'rgba(2, 132, 199, 0.03)' : '#ffffff',
                          display: 'flex',
                          flexDirection: 'column',
                          justifyContent: 'space-between'
                        }}
                      >
                        <div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                            <span style={{ fontWeight: 800, fontSize: '16px', color: '#0f172a' }}>{p.name}</span>
                            {p.badge && (
                              <span style={{ fontSize: '10px', fontWeight: 800, background: '#0284c7', color: '#ffffff', padding: '2px 8px', borderRadius: '10px' }}>
                                {p.badge}
                              </span>
                            )}
                          </div>
                          <div style={{ fontSize: '20px', fontWeight: 900, color: '#0284c7', marginBottom: '4px' }}>
                            ₹{p.priceMonthly.toLocaleString('en-IN')}<span style={{ fontSize: '12px', color: '#64748b' }}>/mo</span>
                          </div>
                          <div style={{ fontSize: '11px', color: '#15803d', fontWeight: 700, marginBottom: '12px' }}>
                            💾 {p.storageLimitGb || 25} GB Storage • 👥 {p.seatLimit} Seats
                          </div>
                        </div>

                        <button
                          disabled={isCurrent || isProcessing}
                          onClick={() => handleUpgradePlan(p)}
                          style={{
                            width: '100%',
                            padding: '9px',
                            borderRadius: '10px',
                            background: isCurrent ? '#f1f5f9' : 'linear-gradient(135deg, #0284c7, #2563eb)',
                            color: isCurrent ? '#94a3b8' : '#ffffff',
                            border: 'none',
                            fontWeight: 700,
                            fontSize: '12px',
                            cursor: isCurrent ? 'default' : 'pointer'
                          }}
                        >
                          {isCurrent ? 'Current Plan' : `Upgrade to ${p.name}`}
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Instant Storage Boost Add-ons */}
              <div>
                <h4 style={{ margin: '0 0 14px 0', fontSize: '15px', fontWeight: 800, color: '#0f172a' }}>
                  Instant Storage Boost (GB Top-up)
                </h4>
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
                  gap: '14px'
                }}>
                  <div style={{ border: '1px solid #e2e8f0', borderRadius: '14px', padding: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <div style={{ fontWeight: 800, fontSize: '14px' }}>+10 GB Cloud Storage</div>
                      <div style={{ fontSize: '12px', color: '#0284c7', fontWeight: 700 }}>₹299 / Month</div>
                    </div>
                    <button
                      onClick={() => handleAddStorageBoost(10, 299)}
                      style={{ padding: '7px 14px', borderRadius: '8px', background: '#0284c7', color: '#ffffff', border: 'none', fontWeight: 700, fontSize: '12px', cursor: 'pointer' }}
                    >
                      + Add 10 GB
                    </button>
                  </div>

                  <div style={{ border: '1px solid #e2e8f0', borderRadius: '14px', padding: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <div style={{ fontWeight: 800, fontSize: '14px' }}>+50 GB Turbo Storage</div>
                      <div style={{ fontSize: '12px', color: '#0284c7', fontWeight: 700 }}>₹999 / Month</div>
                    </div>
                    <button
                      onClick={() => handleAddStorageBoost(50, 999)}
                      style={{ padding: '7px 14px', borderRadius: '8px', background: '#0284c7', color: '#ffffff', border: 'none', fontWeight: 700, fontSize: '12px', cursor: 'pointer' }}
                    >
                      + Add 50 GB
                    </button>
                  </div>
                </div>
              </div>

            </div>
          )}

          {activeTab === 'receipts' && (
            <div>
              <h4 style={{ margin: '0 0 16px 0', fontSize: '15px', fontWeight: 800, color: '#0f172a' }}>
                Payment History & GST Receipts
              </h4>

              <div style={{ border: '1px solid #e2e8f0', borderRadius: '14px', overflow: 'hidden' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
                  <thead style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                    <tr>
                      <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: 700, color: '#64748b' }}>Invoice / Date</th>
                      <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: 700, color: '#64748b' }}>Plan / Quota</th>
                      <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: 700, color: '#64748b' }}>Amount (INR)</th>
                      <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: 700, color: '#64748b' }}>Payment ID</th>
                      <th style={{ padding: '12px 16px', textAlign: 'right', fontWeight: 700, color: '#64748b' }}>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr style={{ borderBottom: '1px solid #f1f5f9' }}>
                      <td style={{ padding: '14px 16px' }}>
                        <div style={{ fontWeight: 800, color: '#0f172a' }}>{metrics.invoiceNumber}</div>
                        <div style={{ fontSize: '11px', color: '#64748b' }}>Paid on: {tenant?.onboardDate || '15 Jul 2026'}</div>
                      </td>
                      <td style={{ padding: '14px 16px' }}>
                        <span style={{ fontWeight: 700 }}>{metrics.planName}</span>
                        <div style={{ fontSize: '11px', color: '#15803d' }}>{metrics.storageLimitGb} GB Storage • {metrics.seatsLimit} Seats</div>
                      </td>
                      <td style={{ padding: '14px 16px', fontWeight: 800, color: '#15803d' }}>
                        ₹{metrics.totalPaid.toLocaleString('en-IN')}
                        <div style={{ fontSize: '10px', color: '#64748b' }}>
                          {metrics.taxEnabled && metrics.taxRatePercent > 0 
                            ? `(Incl. ${metrics.taxRatePercent}% ${metrics.taxLabel})` 
                            : '(0% Tax Exempt)'}
                        </div>
                      </td>
                      <td style={{ padding: '14px 16px', fontSize: '12px', color: '#64748b' }}>
                        {metrics.transactionId}
                      </td>
                      <td style={{ padding: '14px 16px', textAlign: 'right' }}>
                        <button
                          onClick={handleDownloadInvoice}
                          style={{
                            padding: '6px 12px',
                            borderRadius: '8px',
                            background: '#f1f5f9',
                            border: '1px solid #cbd5e1',
                            fontSize: '11px',
                            fontWeight: 700,
                            cursor: 'pointer',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px'
                          }}
                        >
                          <Download size={12} />
                          <span>PDF</span>
                        </button>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          )}

        </div>

      </div>
    </div>
  );
};
