"use client";

import React, { useState } from "react";
import { useHRMS, ExpenseClaim } from "../context/HRMSContext";
import { Card, Button, Modal, Badge, Select, cn } from "../UI";
import {
  Receipt,
  Plus,
  Paperclip,
  TrendingUp,
  Clock,
  CheckCircle2,
  DollarSign,
} from "lucide-react";

export const ExpenseManagement: React.FC = () => {
  const { expenses, addExpense } = useHRMS();

  // Modal State
  const [isClaimOpen, setIsClaimOpen] = useState(false);
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState<"Travel" | "Food" | "Fuel" | "Accommodation" | "Other">("Travel");
  const [date, setDate] = useState("");
  const [reason, setReason] = useState("");
  const [receiptName, setReceiptName] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || !date || !reason) return;

    addExpense({
      date,
      category,
      amount: parseFloat(amount),
      reason,
      receiptName,
    });

    setIsClaimOpen(false);
    setAmount("");
    setReason("");
    setReceiptName(null);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setReceiptName(file.name);
    }
  };

  // Calculations
  const totalClaimed = expenses.reduce((acc, curr) => acc + curr.amount, 0);
  const totalApproved = expenses
    .filter((e) => e.status === "Approved")
    .reduce((acc, curr) => acc + curr.amount, 0);
  const totalPending = expenses
    .filter((e) => e.status === "Pending")
    .reduce((acc, curr) => acc + curr.amount, 0);

  const formatCurrency = (amt: number) => {
    return new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR" }).format(amt);
  };

  const statusCards = [
    { title: "Total Reimbursements", value: totalClaimed, icon: TrendingUp, color: "text-indigo-500", bg: "bg-indigo-500/10" },
    { title: "Approved Payouts", value: totalApproved, icon: CheckCircle2, color: "text-emerald-500", bg: "bg-emerald-500/10" },
    { title: "Pending Audits", value: totalPending, icon: Clock, color: "text-amber-500", bg: "bg-amber-500/10" },
  ];

  return (
    <div className="space-y-6">
      
      {/* Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        {statusCards.map((item, idx) => {
          const Icon = item.icon;
          return (
            <Card key={idx} className="p-5 border border-border flex items-center gap-4" hover>
              <div className={cn("p-3 rounded-xl shrink-0", item.bg, item.color)}>
                <Icon className="h-5 w-5" />
              </div>
              <div>
                <span className="text-[10px] text-muted-foreground uppercase font-bold block">{item.title}</span>
                <span className="text-xl font-extrabold text-foreground mt-1 block">
                  {formatCurrency(item.value)}
                </span>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Expenses Table list */}
      <Card className="space-y-4">
        <div className="flex justify-between items-center pb-2 border-b border-border">
          <div>
            <h3 className="text-sm font-bold text-foreground flex items-center gap-1.5">
              <Receipt className="h-4.5 w-4.5 text-primary" /> Out-of-Pocket Expense Log
            </h3>
            <p className="text-[11px] text-muted-foreground mt-0.5">Submit claims for corporate travel, meals, fuel and WFH allowances</p>
          </div>
          <Button
            variant="primary"
            size="sm"
            icon={<Plus className="h-3.5 w-3.5" />}
            onClick={() => {
              // Set default date to today
              setDate(new Date().toISOString().split("T")[0]);
              setIsClaimOpen(true);
            }}
            className="text-xs"
          >
            Create Expense Claim
          </Button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-border text-muted-foreground uppercase font-bold text-[9px] tracking-wider bg-secondary/35">
                <th className="p-3">Claim Date</th>
                <th className="p-3">Category</th>
                <th className="p-3">Business Reason</th>
                <th className="p-3">Receipt Document</th>
                <th className="p-3">Amount</th>
                <th className="p-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {expenses.length > 0 ? (
                expenses.map((claim) => (
                  <tr key={claim.id} className="hover:bg-secondary/25 transition-colors">
                    <td className="p-3 font-mono">{claim.date}</td>
                    <td className="p-3 font-semibold text-foreground">{claim.category}</td>
                    <td className="p-3 max-w-[200px] truncate" title={claim.reason}>
                      {claim.reason}
                    </td>
                    <td className="p-3">
                      {claim.receiptName ? (
                        <span className="inline-flex items-center gap-1 text-[10px] text-primary hover:underline cursor-pointer">
                          <Paperclip className="h-3.5 w-3.5 shrink-0" /> {claim.receiptName}
                        </span>
                      ) : (
                        <span className="text-muted-foreground">—</span>
                      )}
                    </td>
                    <td className="p-3 font-bold font-mono text-foreground">{formatCurrency(claim.amount)}</td>
                    <td className="p-3">
                      <Badge variant={claim.status === "Approved" ? "success" : claim.status === "Pending" ? "warning" : "danger"}>
                        {claim.status}
                      </Badge>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-muted-foreground">
                    No expense claims recorded. Click "Create Expense Claim" to submit.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Create Expense Claim Modal */}
      <Modal isOpen={isClaimOpen} onClose={() => setIsClaimOpen(false)} title="Create Expense Reimbursement Claim">
        <form onSubmit={handleSubmit} className="space-y-4">
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1">
              <label className="text-xs font-medium text-muted-foreground">Claim Date</label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                required
                className="px-3 py-2 text-xs md:text-sm rounded-lg border border-border bg-secondary/35 text-foreground focus:outline-none focus:border-primary"
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-xs font-medium text-muted-foreground">Expense Category</label>
              <Select
                value={category}
                onChange={(val) => setCategory(val as any)}
                options={[
                  { value: "Travel", label: "Travel" },
                  { value: "Food", label: "Food & Meals" },
                  { value: "Fuel", label: "Fuel & Transport" },
                  { value: "Accommodation", label: "Accommodation" },
                  { value: "Other", label: "Other Allowances" },
                ]}
              />
            </div>
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-muted-foreground">Claim Amount (₹ INR)</label>
            <div className="relative">
              <span className="absolute left-3 top-2 text-sm text-muted-foreground font-semibold">₹</span>
              <input
                type="number"
                step="0.01"
                placeholder="0.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                required
                className="w-full pl-7 pr-4 py-2 text-xs md:text-sm rounded-lg border border-border bg-secondary/35 text-foreground focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
              />
            </div>
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-muted-foreground">Business Justification</label>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Describe what this expense was for..."
              required
              rows={3}
              className="px-3 py-2 text-xs md:text-sm rounded-lg border border-border bg-secondary/35 text-foreground focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 resize-none"
            />
          </div>

          {/* Receipt upload mock */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-muted-foreground">Receipt Attachment (Optional)</label>
            <div className="flex items-center gap-2">
              <label className="px-3 py-2 border border-dashed border-border rounded-lg bg-secondary/20 hover:bg-secondary/40 transition-colors flex items-center gap-2 text-xs text-muted-foreground cursor-pointer">
                <Paperclip className="h-4 w-4 text-primary" />
                <span>{receiptName ? receiptName : "Upload receipts (PDF, JPG, PNG)"}</span>
                <input type="file" onChange={handleFileChange} className="hidden" />
              </label>
              {receiptName && (
                <button
                  type="button"
                  onClick={() => setReceiptName(null)}
                  className="text-xs text-rose-500 font-bold hover:underline cursor-pointer"
                >
                  Clear
                </button>
              )}
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-border mt-6">
            <Button type="button" variant="outline" onClick={() => setIsClaimOpen(false)}>
              Cancel
            </Button>
            <Button type="submit">
              Submit Claim
            </Button>
          </div>
        </form>
      </Modal>

    </div>
  );
};
