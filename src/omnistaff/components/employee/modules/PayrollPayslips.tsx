"use client";

import React, { useState } from "react";
import { useHRMS, Payslip } from "../context/HRMSContext";
import { Card, Button, Modal, cn } from "../UI";
import {
  Download,
  Eye,
  Printer,
  Calendar,
  DollarSign,
  AlertCircle,
  CheckCircle2,
  FileText,
} from "lucide-react";

export const PayrollPayslips: React.FC = () => {
  const { payslips, profile, createTicket, activeSubTab: globalSubTab, setActiveSubTab: setGlobalSubTab } = useHRMS();

  // Normalize subtabs
  const activeSubTab = ["payslip-current", "payslip-history"].includes(globalSubTab)
    ? globalSubTab
    : "payslip-current";

  const setActiveSubTab = (tabId: string) => setGlobalSubTab(tabId);

  // Selected Payslip for preview
  const [selectedPayslip, setSelectedPayslip] = useState<Payslip | null>(null);

  // Complaint form states
  const [isComplainOpen, setIsComplainOpen] = useState(false);
  const [complainMonth, setComplainMonth] = useState("");
  const [complainSubject, setComplainSubject] = useState("");
  const [complainDetails, setComplainDetails] = useState("");
  const [complainSuccess, setComplainSuccess] = useState("");
  const [complainError, setComplainError] = useState("");
  const [complainLoading, setComplainLoading] = useState(false);

  const handlePrint = () => {
    window.print();
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR" }).format(amount);
  };

  const handleComplainSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setComplainError("");
    setComplainSuccess("");

    if (!complainMonth || !complainSubject || !complainDetails) {
      setComplainError("All fields are required.");
      return;
    }

    setComplainLoading(true);

    // Simulate backend submission delay
    setTimeout(() => {
      try {
        createTicket({
          title: `[Salary Dispute] ${complainSubject}`,
          category: "Payroll Support",
          description: `Disputed Payout Period: ${complainMonth}\n\nDetailed Issue:\n${complainDetails}`,
          priority: "High",
        });

        setComplainSuccess("Your complaint has been submitted successfully to HR Operations. A payroll support ticket has been created.");
        setComplainSubject("");
        setComplainDetails("");
        
        // Auto-close modal after a brief delay
        setTimeout(() => {
          setIsComplainOpen(false);
          setComplainSuccess("");
        }, 2500);

      } catch (err) {
        setComplainError("Could not log the ticket. Please try again.");
      } finally {
        setComplainLoading(false);
      }
    }, 1000);
  };

  return (
    <div className="space-y-6">

      {/* Tabs navigation */}
      <div className="flex bg-card p-1 rounded-xl border border-border overflow-x-auto space-x-1 shrink-0 scrollbar-none print:hidden">
        {[
          { id: "payslip-current", label: "Current Payslip", icon: DollarSign },
          { id: "payslip-history", label: "Salary History", icon: Calendar },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeSubTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveSubTab(tab.id)}
              className={cn(
                "flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold whitespace-nowrap cursor-pointer transition-all",
                isActive
                  ? "bg-primary text-primary-foreground shadow-xs font-bold"
                  : "text-muted-foreground hover:text-foreground hover:bg-secondary/40"
              )}
            >
              <Icon className="h-4 w-4 shrink-0" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* RENDER CURRENT PAYSLIP VIEW */}
      {activeSubTab === "payslip-current" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fadeIn">
          {/* Main Info Card */}
          <Card className="lg:col-span-2 p-6 space-y-6 flex flex-col justify-between">
            <div className="space-y-4">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-sm font-bold text-foreground">Latest Salary Credit</h3>
                  <p className="text-[11px] text-muted-foreground mt-0.5">
                    Your salary for the most recent processed payroll cycle.
                  </p>
                </div>
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                  Paid
                </span>
              </div>

              {payslips.length > 0 ? (
                <div className="border border-border p-6 rounded-2xl bg-secondary/15 flex flex-col items-center justify-center text-center space-y-4 relative overflow-hidden">
                  <div className="absolute -right-4 -bottom-4 text-primary/5">
                    <FileText className="h-32 w-32" />
                  </div>
                  
                  <div className="text-xs font-bold text-foreground">
                    Payout Period: {payslips[0].month} {payslips[0].year}
                  </div>
                  <p className="text-[10px] text-muted-foreground max-w-sm">
                    Your monthly payslip has been generated and is available for viewing and downloading.
                  </p>
                </div>
              ) : (
                <div className="text-center py-12 text-muted-foreground text-xs">
                  No payout records available.
                </div>
              )}
            </div>

            <div className="flex gap-3 pt-4 border-t border-border mt-6">
              {payslips.length > 0 && (
                <>
                  <Button
                    variant="primary"
                    icon={<Eye className="h-4.5 w-4.5" />}
                    onClick={() => setSelectedPayslip(payslips[0])}
                    className="flex-1 text-xs font-semibold"
                  >
                    View Salary Slip
                  </Button>
                  <Button
                    variant="outline"
                    icon={<Download className="h-4.5 w-4.5" />}
                    onClick={() => {
                      setSelectedPayslip(payslips[0]);
                      setTimeout(() => window.print(), 300);
                    }}
                    className="flex-1 text-xs font-semibold"
                  >
                    Download PDF
                  </Button>
                </>
              )}
            </div>
          </Card>

          {/* Quick Stats / Info sidebar */}
          <Card className="p-6 space-y-6">
            <h4 className="text-xs font-black text-foreground uppercase tracking-wider pb-2 border-b border-border">
              Salary Dispute
            </h4>
            <p className="text-[11px] text-muted-foreground leading-relaxed">
              If you notice any discrepancies in your salary credit, missing reimbursements, or incorrect tax deduction categories, you can report a ticket immediately.
            </p>
            <Button
              variant="danger"
              icon={<AlertCircle className="h-4 w-4" />}
              onClick={() => {
                if (payslips.length > 0) {
                  setComplainMonth(`${payslips[0].month} ${payslips[0].year}`);
                }
                setIsComplainOpen(true);
              }}
              className="w-full text-xs font-bold shadow-sm"
            >
              Salary Complain
            </Button>
          </Card>
        </div>
      )}

      {/* RENDER SALARY HISTORY VIEW */}
      {activeSubTab === "payslip-history" && (
        <Card className="space-y-4 animate-fadeIn">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-2 border-b border-border gap-3">
            <div>
              <h3 className="text-sm font-bold text-foreground">Payslip Inventory</h3>
              <p className="text-[11px] text-muted-foreground mt-0.5">Download historical salary records showing total payouts</p>
            </div>
            <Button
              variant="danger"
              size="sm"
              icon={<AlertCircle className="h-3.5 w-3.5" />}
              onClick={() => {
                if (payslips.length > 0) {
                  setComplainMonth(`${payslips[0].month} ${payslips[0].year}`);
                }
                setIsComplainOpen(true);
              }}
              className="text-xs h-8 font-semibold self-start sm:self-auto shrink-0 shadow-xs"
            >
              Salary Complain
            </Button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-border text-muted-foreground uppercase font-bold text-[9px] tracking-wider bg-secondary/35">
                  <th className="p-3">Payout Period</th>
                  <th className="p-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {payslips.map((slip) => (
                  <tr key={slip.id} className="hover:bg-secondary/25 transition-colors">
                    <td className="p-3 font-semibold text-foreground">
                      {slip.month} {slip.year}
                    </td>
                    <td className="p-3 text-right space-x-1">
                      <Button
                        variant="outline"
                        size="sm"
                        icon={<Eye className="h-3.5 w-3.5" />}
                        onClick={() => setSelectedPayslip(slip)}
                        className="text-[11px] h-8 px-2.5"
                      >
                        View Slip
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        icon={<Download className="h-3.5 w-3.5" />}
                        onClick={() => {
                          setSelectedPayslip(slip);
                          // Trigger immediate print/save simulation
                          setTimeout(() => window.print(), 300);
                        }}
                        className="text-[11px] h-8 px-2.5"
                      >
                        Download
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* Salary Complain Modal */}
      <Modal
        isOpen={isComplainOpen}
        onClose={() => {
          if (!complainLoading) {
            setIsComplainOpen(false);
            setComplainError("");
            setComplainSuccess("");
          }
        }}
        title="Report Salary Complaint / Dispute"
        size="md"
      >
        <form onSubmit={handleComplainSubmit} className="space-y-4">
          <div className="flex flex-col gap-1">
            <label className="text-xs font-semibold text-muted-foreground">Select Payout Period</label>
            <select
              value={complainMonth}
              onChange={(e) => setComplainMonth(e.target.value)}
              className="w-full px-3 py-2 text-xs md:text-sm rounded-lg border border-border bg-secondary/35 text-foreground focus:outline-none focus:border-primary"
            >
              {payslips.map((slip) => (
                <option key={slip.id} value={`${slip.month} ${slip.year}`} className="bg-card">
                  {slip.month} {slip.year}
                </option>
              ))}
            </select>
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-xs font-semibold text-muted-foreground">Subject / Query</label>
            <input
              type="text"
              placeholder="e.g. Missing reimbursement or wrong tax deduction"
              value={complainSubject}
              onChange={(e) => setComplainSubject(e.target.value)}
              required
              className="w-full px-3 py-2 text-xs md:text-sm rounded-lg border border-border bg-secondary/35 text-foreground focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-xs font-semibold text-muted-foreground">Describe Salary Issue</label>
            <textarea
              placeholder="Please provide full details about the discrepancy in your payout..."
              value={complainDetails}
              onChange={(e) => setComplainDetails(e.target.value)}
              required
              rows={4}
              className="w-full px-3 py-2 text-xs md:text-sm rounded-lg border border-border bg-secondary/35 text-foreground focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 resize-none"
            />
          </div>

          {complainError && (
            <p className="text-xs font-semibold text-rose-500 flex items-center gap-1.5 bg-rose-500/10 p-2 rounded-lg border border-rose-500/10">
              <AlertCircle className="h-4 w-4 shrink-0" /> {complainError}
            </p>
          )}

          {complainSuccess && (
            <p className="text-xs font-semibold text-emerald-500 flex items-center gap-1.5 bg-emerald-500/10 p-3 rounded-lg border border-emerald-500/10 leading-snug">
              <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-500" /> {complainSuccess}
            </p>
          )}

          <div className="flex justify-end gap-2 pt-2 border-t border-border mt-6">
            <Button
              type="button"
              variant="outline"
              disabled={complainLoading}
              onClick={() => setIsComplainOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="danger"
              loading={complainLoading}
            >
              Submit Complaint
            </Button>
          </div>
        </form>
      </Modal>

      {/* Payslip Viewer Modal */}
      <Modal
        isOpen={selectedPayslip !== null}
        onClose={() => setSelectedPayslip(null)}
        title={`Payslip - ${selectedPayslip?.month} ${selectedPayslip?.year}`}
        size="md"
      >
        {selectedPayslip && (
          <div className="space-y-6">
            
            {/* Action Bar (Print / Download) */}
            <div className="flex justify-end gap-2 pb-2 border-b border-border print:hidden">
              <Button variant="outline" size="sm" icon={<Printer className="h-4 w-4" />} onClick={handlePrint}>
                Print Payslip
              </Button>
              <Button variant="primary" size="sm" icon={<Download className="h-4 w-4" />} onClick={handlePrint}>
                Download PDF
              </Button>
            </div>

            {/* Print Layout */}
            <div className="p-6 border border-border rounded-xl space-y-6 bg-card text-foreground print:border-0 print:p-0">
              
              {/* Header Letterhead */}
              <div className="flex justify-between items-center pb-4 border-b-2 border-border">
                <div className="flex items-center gap-2">
                  <div className="h-10 w-10 bg-primary rounded-lg flex items-center justify-center text-primary-foreground font-extrabold text-sm">
                    ITLC
                  </div>
                  <div>
                    <h1 className="font-extrabold text-base tracking-wide leading-none">ITLC TECHNOLOGIES, INC.</h1>
                    <span className="text-[9px] text-muted-foreground mt-1 block">Enterprise Software ESS Portal</span>
                  </div>
                </div>
                <div className="text-right">
                  <h2 className="text-xs font-bold uppercase tracking-wider">Salary Slip</h2>
                  <span className="text-[9px] text-muted-foreground mt-0.5 block">Slip ID: {selectedPayslip.id}</span>
                </div>
              </div>

              {/* Employee Details Card */}
              <div className="bg-secondary/25 p-4 rounded-xl space-y-2 text-xs border border-border">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Employee Name:</span>
                  <span className="font-bold text-foreground">{profile.fullName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Employee Code:</span>
                  <span className="font-bold text-foreground">{profile.id}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Department:</span>
                  <span className="font-medium text-foreground">{profile.department}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Designation:</span>
                  <span className="font-medium text-foreground">{profile.designation}</span>
                </div>
              </div>

              {/* Main Payout Section - Simple & Highlighted */}
              <div className="border border-border p-6 rounded-xl bg-card text-center space-y-3 relative overflow-hidden">
                <div className="absolute top-0 right-0 p-3 text-primary/10">
                  <DollarSign className="h-16 w-16" />
                </div>
                <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider block">
                  Total Amount Deposited
                </span>
                <div className="text-3xl font-black text-foreground font-mono">
                  {formatCurrency(selectedPayslip.netSalary)}
                </div>
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 text-xs font-semibold">
                  <Calendar className="h-3.5 w-3.5" />
                  Credited for {selectedPayslip.month} {selectedPayslip.year}
                </div>
              </div>

              {/* Footer Stamp */}
              <div className="pt-4 border-t border-border flex justify-between items-center text-[10px] text-muted-foreground">
                <div>* Direct Bank Transfer completed successfully.</div>
                <div className="text-right">
                  <div className="font-semibold text-foreground">ITLC HR Operations</div>
                  <div className="scale-90 mt-0.5">Electronic Transfer Stamp</div>
                </div>
              </div>

            </div>

          </div>
        )}
      </Modal>

    </div>
  );
};
