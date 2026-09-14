import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  CreditCard, RotateCcw, RefreshCw, CheckCircle, AlertCircle, 
  HelpCircle, Settings, Key, ToggleLeft, ToggleRight, ArrowRight
} from 'lucide-react';
import { useDashboard } from '../context/DashboardContext';
import { api } from '../../../services/api';
import { downloadPaymentSlip } from '../../../utils/PaymentSlip';

export const PaymentsTab: React.FC = () => {
  const { payments, setPayments, addToast, addLog, formatAmount } = useDashboard();
  const [gatewayToggles, setGatewayToggles] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('superowner_gateway_toggles');
      if (saved) {
        try { return JSON.parse(saved); } catch(e) {}
      }
    }
    return {
      stripe: true,
      razorpay: true,
      paypal: true,
      credit_card: true,
      upi: true,
      bank_transfer: false,
    };
  });

  const handleRefund = async (id: string, invoiceNo: string, amount: number, companyName: string) => {
    if (confirm(`Are you sure you want to refund ${companyName} for Invoice ${invoiceNo} ($${amount})?`)) {
      try {
        await api.updateSuperOwnerPaymentStatus(id, 'failed');
        setPayments(prev => prev.map(p => p.id === id ? { ...p, status: 'failed' } : p));
        addToast(`Refund for ${invoiceNo} initiated successfully`, 'warning');
        addLog('Payment Refunded', `Initiated refund of $${amount} for invoice ${invoiceNo} (${companyName}).`, 'payment');
      } catch (err) {
        addToast('Failed to refund payment', 'error');
      }
    }
  };

  const handleRetry = async (id: string, invoiceNo: string, amount: number, companyName: string) => {
    addToast(`Retrying payment request for ${invoiceNo}...`, 'info');
    try {
      await api.updateSuperOwnerPaymentStatus(id, 'successful');
      setPayments(prev => prev.map(p => p.id === id ? { ...p, status: 'successful' } : p));
      addToast(`Payment succeeded for ${invoiceNo}`, 'success');
      addLog('Payment Succeeded', `Retried payment of $${amount} for invoice ${invoiceNo} was settled.`, 'payment');
    } catch (err) {
      addToast('Retry failed', 'error');
    }
  };

  const toggleGateway = (gateway: keyof typeof gatewayToggles) => {
    setGatewayToggles(prev => {
      const updated = { ...prev, [gateway]: !prev[gateway] };
      if (typeof window !== 'undefined') {
        localStorage.setItem('superowner_gateway_toggles', JSON.stringify(updated));
      }
      addToast(`${String(gateway).toUpperCase().replace('_', ' ')} Gateway ${updated[gateway as keyof typeof updated] ? 'Enabled' : 'Disabled'}`, 'info');
      addLog('Gateway Configuration Changed', `Payment gateway routing updated.`, 'settings');
      return updated;
    });
  };

  return (
    <div className="space-y-6">
      {/* Title */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-white font-sans">
          Payment Gateways & Settlements
        </h1>
        <p className="text-slate-400 text-sm mt-1">
          Configure active payment merchant gateways, api integration keys, and resolve refunds/settlements.
        </p>
      </div>

      {/* Merchant Gateway Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Stripe Card */}
        <div className="glass-card p-6 rounded-2xl relative overflow-hidden">
          <div className="flex justify-between items-start">
            <div>
              <span className="font-bold text-white text-lg block">Stripe</span>
              <span className="text-[10px] text-slate-500 font-mono">Direct Card & Apple Pay settlements</span>
            </div>
            <button onClick={() => toggleGateway('stripe')}>
              {gatewayToggles.stripe ? (
                <ToggleRight className="h-7 w-7 text-indigo-400" />
              ) : (
                <ToggleLeft className="h-7 w-7 text-slate-600" />
              )}
            </button>
          </div>
          <div className="mt-6 space-y-3">
            <div className="flex justify-between text-xs">
              <span className="text-slate-400">Environment</span>
              <span className="font-mono font-semibold text-emerald-400">Production</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-slate-400">Webhook Status</span>
              <span className="font-mono text-emerald-400 flex items-center gap-1">
                <CheckCircle className="h-3 w-3" /> Listening
              </span>
            </div>
          </div>
          <div className="border-t border-white/5 pt-4 mt-6 flex justify-between items-center text-xs">
            <button className="text-indigo-400 hover:text-indigo-300 font-semibold flex items-center gap-1">
              <Settings className="h-3.5 w-3.5" /> API Keys Config
            </button>
            <span className="text-slate-500 font-mono text-[10px]">v2026_settlements</span>
          </div>
        </div>

        {/* Razorpay Card */}
        <div className="glass-card p-6 rounded-2xl relative overflow-hidden">
          <div className="flex justify-between items-start">
            <div>
              <span className="font-bold text-white text-lg block">Razorpay</span>
              <span className="text-[10px] text-slate-500 font-mono">UPI & NetBanking routing</span>
            </div>
            <button onClick={() => toggleGateway('razorpay')}>
              {gatewayToggles.razorpay ? (
                <ToggleRight className="h-7 w-7 text-indigo-400" />
              ) : (
                <ToggleLeft className="h-7 w-7 text-slate-600" />
              )}
            </button>
          </div>
          <div className="mt-6 space-y-3">
            <div className="flex justify-between text-xs">
              <span className="text-slate-400">Environment</span>
              <span className="font-mono font-semibold text-emerald-400">Production</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-slate-400">Webhook Status</span>
              <span className="font-mono text-emerald-400 flex items-center gap-1">
                <CheckCircle className="h-3 w-3" /> Listening
              </span>
            </div>
          </div>
          <div className="border-t border-white/5 pt-4 mt-6 flex justify-between items-center text-xs">
            <button className="text-indigo-400 hover:text-indigo-300 font-semibold flex items-center gap-1">
              <Settings className="h-3.5 w-3.5" /> API Keys Config
            </button>
            <span className="text-slate-500 font-mono text-[10px]">v3_webhook</span>
          </div>
        </div>

        {/* PayPal Card */}
        <div className="glass-card p-6 rounded-2xl relative overflow-hidden">
          <div className="flex justify-between items-start">
            <div>
              <span className="font-bold text-white text-lg block">PayPal</span>
              <span className="text-[10px] text-slate-500 font-mono">International buyer settlements</span>
            </div>
            <button onClick={() => toggleGateway('paypal')}>
              {gatewayToggles.paypal ? (
                <ToggleRight className="h-7 w-7 text-indigo-400" />
              ) : (
                <ToggleLeft className="h-7 w-7 text-slate-600" />
              )}
            </button>
          </div>
          <div className="mt-6 space-y-3">
            <div className="flex justify-between text-xs">
              <span className="text-slate-400">Environment</span>
              <span className="font-mono font-semibold text-emerald-400">Production</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-slate-400">Webhook Status</span>
              <span className="font-mono text-emerald-400 flex items-center gap-1">
                <CheckCircle className="h-3 w-3" /> Listening
              </span>
            </div>
          </div>
          <div className="border-t border-white/5 pt-4 mt-6 flex justify-between items-center text-xs">
            <button className="text-indigo-400 hover:text-indigo-300 font-semibold flex items-center gap-1">
              <Settings className="h-3.5 w-3.5" /> API Keys Config
            </button>
            <span className="text-slate-500 font-mono text-[10px]">paypal_standard</span>
          </div>
        </div>

        {/* Credit Card direct Gateway */}
        <div className="glass-card p-6 rounded-2xl relative overflow-hidden">
          <div className="flex justify-between items-start">
            <div>
              <span className="font-bold text-white text-lg block">Credit Card Direct</span>
              <span className="text-[10px] text-slate-500 font-mono">Direct payment processing engine</span>
            </div>
            <button onClick={() => toggleGateway('credit_card')}>
              {gatewayToggles.credit_card ? (
                <ToggleRight className="h-7 w-7 text-indigo-400" />
              ) : (
                <ToggleLeft className="h-7 w-7 text-slate-600" />
              )}
            </button>
          </div>
          <div className="mt-6 space-y-3">
            <div className="flex justify-between text-xs">
              <span className="text-slate-400">Environment</span>
              <span className="font-mono font-semibold text-emerald-400">Production</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-slate-400">Security Standard</span>
              <span className="font-mono text-emerald-400 flex items-center gap-1">
                <CheckCircle className="h-3 w-3" /> PCI-DSS Level 1
              </span>
            </div>
          </div>
          <div className="border-t border-white/5 pt-4 mt-6 flex justify-between items-center text-xs">
            <button className="text-indigo-400 hover:text-indigo-300 font-semibold flex items-center gap-1">
              <Settings className="h-3.5 w-3.5" /> API Keys Config
            </button>
            <span className="text-slate-500 font-mono text-[10px]">pci_direct</span>
          </div>
        </div>

        {/* UPI Direct Gateway */}
        <div className="glass-card p-6 rounded-2xl relative overflow-hidden">
          <div className="flex justify-between items-start">
            <div>
              <span className="font-bold text-white text-lg block">UPI Direct</span>
              <span className="text-[10px] text-slate-500 font-mono">Immediate bank transfer routing</span>
            </div>
            <button onClick={() => toggleGateway('upi')}>
              {gatewayToggles.upi ? (
                <ToggleRight className="h-7 w-7 text-indigo-400" />
              ) : (
                <ToggleLeft className="h-7 w-7 text-slate-600" />
              )}
            </button>
          </div>
          <div className="mt-6 space-y-3">
            <div className="flex justify-between text-xs">
              <span className="text-slate-400">Environment</span>
              <span className="font-mono font-semibold text-emerald-400">Production</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-slate-400">Protocol version</span>
              <span className="font-mono text-emerald-400">UPI 2.0</span>
            </div>
          </div>
          <div className="border-t border-white/5 pt-4 mt-6 flex justify-between items-center text-xs">
            <button className="text-indigo-400 hover:text-indigo-300 font-semibold flex items-center gap-1">
              <Settings className="h-3.5 w-3.5" /> API Keys Config
            </button>
            <span className="text-slate-500 font-mono text-[10px]">upi_2.0</span>
          </div>
        </div>

        {/* Bank Transfer direct */}
        <div className="glass-card p-6 rounded-2xl relative overflow-hidden">
          <div className="flex justify-between items-start">
            <div>
              <span className="font-bold text-white text-lg block">Bank Transfer (SWIFT)</span>
              <span className="text-[10px] text-slate-500 font-mono">Manual wire verification</span>
            </div>
            <button onClick={() => toggleGateway('bank_transfer')}>
              {gatewayToggles.bank_transfer ? (
                <ToggleRight className="h-7 w-7 text-indigo-400" />
              ) : (
                <ToggleLeft className="h-7 w-7 text-slate-600" />
              )}
            </button>
          </div>
          <div className="mt-6 space-y-3">
            <div className="flex justify-between text-xs">
              <span className="text-slate-400">Environment</span>
              <span className="font-mono font-semibold text-amber-400">Offline Pending</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-slate-400">Manual Matching</span>
              <span className="font-mono text-slate-400">Require approval</span>
            </div>
          </div>
          <div className="border-t border-white/5 pt-4 mt-6 flex justify-between items-center text-xs">
            <button className="text-indigo-400 hover:text-indigo-300 font-semibold flex items-center gap-1">
              <Settings className="h-3.5 w-3.5" /> Wire Accounts config
            </button>
            <span className="text-slate-500 font-mono text-[10px]">manual_wire</span>
          </div>
        </div>
      </div>

      {/* Refunds & Settlement Disputes Resolution */}
      <div className="glass-card rounded-2xl p-6">
        <h3 className="text-base font-semibold text-white mb-2">Disputes & Settlement Audits</h3>
        <p className="text-xs text-slate-400 mb-6">Resolve failed charges, issue partial/full refunds, or re-verify payment intent codes.</p>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="border-b border-white/5 text-slate-400 text-xs font-semibold uppercase tracking-wider bg-white/2">
                <th className="py-3 px-4">Invoice No</th>
                <th className="py-3 px-4">Company Name</th>
                <th className="py-3 px-4">Amount</th>
                <th className="py-3 px-4">Gateway</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Settlement Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-slate-300">
              {payments.map(p => (
                <tr key={p.id} className="hover:bg-white/2 transition">
                  <td className="py-3 px-4 font-mono text-xs text-slate-400">{p.invoiceNumber}</td>
                  <td className="py-3 px-4 font-semibold text-white">{p.companyName}</td>
                  <td className="py-3 px-4 font-mono font-bold text-white">{formatAmount(p.amount, p.currency)}</td>
                  <td className="py-3 px-4 capitalize font-mono text-xs text-indigo-300">{p.gateway.replace('_', ' ')}</td>
                  <td className="py-3 px-4">
                    <span className={`px-2.5 py-0.5 rounded text-[10px] uppercase tracking-wide border ${
                      p.status === 'successful' ? 'bg-emerald-600 border-emerald-500 text-white font-extrabold shadow-sm' :
                      p.status === 'pending' ? 'bg-amber-600 border-amber-500 text-white font-extrabold shadow-sm' :
                      'bg-rose-600 border-rose-500 text-white font-extrabold shadow-sm'
                    }`}>
                      {p.status}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <div className="flex justify-end gap-2">
                      {p.status === 'successful' && (
                        <>
                          <button
                            onClick={() => downloadPaymentSlip(p, { name: p.companyName })}
                            className="px-3 py-1 rounded-lg bg-emerald-600/10 hover:bg-emerald-600 text-emerald-300 hover:text-white border border-emerald-500/20 text-xs font-semibold flex items-center gap-1.5 transition"
                          >
                            Download Slip
                          </button>
                          <button
                            onClick={() => handleRefund(p.id, p.invoiceNumber, p.amount, p.companyName)}
                            className="px-3 py-1 rounded-lg bg-rose-600/10 hover:bg-rose-600 text-rose-300 hover:text-white border border-rose-500/20 text-xs font-semibold flex items-center gap-1.5 transition"
                          >
                            <RotateCcw className="h-3 w-3" /> Refund Charge
                          </button>
                        </>
                      )}
                      {p.status === 'failed' && (
                        <button
                          onClick={() => handleRetry(p.id, p.invoiceNumber, p.amount, p.companyName)}
                          className="px-3 py-1 rounded-lg bg-indigo-600/15 hover:bg-indigo-600 text-indigo-200 hover:text-white border border-indigo-500/20 text-xs font-semibold flex items-center gap-1.5 transition"
                        >
                          <RefreshCw className="h-3 w-3" /> Retry Payment
                        </button>
                      )}
                      {p.status === 'pending' && (
                        <button
                          onClick={() => handleRetry(p.id, p.invoiceNumber, p.amount, p.companyName)}
                          className="px-3 py-1 rounded-lg bg-emerald-600/15 hover:bg-emerald-600 text-emerald-200 hover:text-white border border-emerald-500/20 text-xs font-semibold flex items-center gap-1.5 transition"
                        >
                          <CheckCircle className="h-3 w-3" /> Approve Settle
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
export default PaymentsTab;
