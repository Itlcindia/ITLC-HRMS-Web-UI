"use client";

import React, { useState, useEffect } from "react";
import { useHRMS, LeaveRequest } from "../context/HRMSContext";
import { Card, Button, Modal, Badge, Select, cn } from "../UI";
import {
  CalendarDays,
  FilePlus,
  Trash2,
  Paperclip,
  CheckCircle2,
  Hourglass,
  XCircle,
  HelpCircle,
  FileText,
  Search,
  SlidersHorizontal,
  Calendar,
  Layers,
  History,
  Info,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

const compressImage = (base64Str: string, maxWidth = 800, maxHeight = 800): Promise<string> => {
  return new Promise((resolve) => {
    if (!base64Str.startsWith('data:image/')) {
      resolve(base64Str);
      return;
    }
    const img = new Image();
    img.src = base64Str;
    img.onload = () => {
      const canvas = document.createElement('canvas');
      let width = img.width;
      let height = img.height;

      if (width > height) {
        if (width > maxWidth) {
          height = Math.round((height * maxWidth) / width);
          width = maxWidth;
        }
      } else {
        if (height > maxHeight) {
          width = Math.round((width * maxHeight) / height);
          height = maxHeight;
        }
      }

      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL('image/jpeg', 0.6));
      } else {
        resolve(base64Str);
      }
    };
    img.onerror = () => {
      resolve(base64Str);
    };
  });
};

export const LeaveManagement: React.FC = () => {
  const { leaveBalances, leaveRequests, applyLeave, cancelLeave, activeSubTab: globalSubTab, setActiveSubTab: setGlobalSubTab, holidays } = useHRMS();

  // Sub-Navigation Tab State (mapping global subtab selectors to local ones)
  const localTabMap: Record<string, string> = {
    "leave-dashboard": "dashboard",
    "leave-apply": "apply",
    "leave-my": "my-leaves",
    "leave-balance": "balances",
    "leave-holiday": "calendar",
  };

  const globalTabMap: Record<string, string> = {
    "dashboard": "leave-dashboard",
    "apply": "leave-apply",
    "my-leaves": "leave-my",
    "balances": "leave-balance",
    "calendar": "leave-holiday",
  };

  const activeSubTab = localTabMap[globalSubTab] || (["dashboard", "apply", "my-leaves", "balances", "calendar", "history"].includes(globalSubTab) ? globalSubTab : "dashboard");
  const setActiveSubTab = (tabId: string) => {
    const globalId = globalTabMap[tabId] || tabId;
    setGlobalSubTab(globalId);
  };

  const [activeTab, setActiveTab] = useState(activeSubTab);
  
  useEffect(() => {
    setActiveTab(activeSubTab);
  }, [activeSubTab]);

  const handleTabClick = (tabId: string) => {
    setActiveTab(tabId);
    const globalId = globalTabMap[tabId] || tabId;
    setGlobalSubTab(globalId);
  };

  // Check if we redirect from the Dashboard "Quick Apply"
  useEffect(() => {
    if (typeof window !== "undefined") {
      const redirectTab = localStorage.getItem("hrms_leave_subtab");
      if (redirectTab) {
        const tabId = localTabMap[redirectTab] || redirectTab;
        setActiveTab(tabId);
        localStorage.removeItem("hrms_leave_subtab");
      }
    }
  }, [activeSubTab]);

  // 1. APPLY LEAVE FORM STATE
  const [leaveType, setLeaveType] = useState<"Casual Leave" | "Sick Leave" | "Earned Leave" | "Work From Home" | "Comp Off">("Casual Leave");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [isHalfDay, setIsHalfDay] = useState(false);
  const [reason, setReason] = useState("");
  const [attachmentName, setAttachmentName] = useState<string | null>(null);
  const [attachmentData, setAttachmentData] = useState<string | null>(null);
  const [formError, setFormError] = useState("");
  const [formSuccess, setFormSuccess] = useState("");

  // 2. MY LEAVES TABLE STATE
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");

  // 3. HOLIDAY CALENDAR STATE
  const [calendarViewMode, setCalendarViewMode] = useState<"calendar" | "list">("calendar");

  // 4. LEAVE HISTORY STATE
  const [selectedHistoryId, setSelectedHistoryId] = useState<string | null>(
    leaveRequests.length > 0 ? leaveRequests[0].id : null
  );

  // Form submit handler
  const handleApplySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");
    setFormSuccess("");

    if (!fromDate || !toDate || !reason) {
      setFormError("All input fields are required.");
      return;
    }

    const start = new Date(fromDate);
    const end = new Date(toDate);

    if (start > end) {
      setFormError("From Date cannot be later than To Date.");
      return;
    }

    // Calculate total days
    const diffTime = Math.abs(end.getTime() - start.getTime());
    let totalDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;

    if (isHalfDay) {
      totalDays = 0.5 * totalDays;
    }

    // Check balances (except WFH which is limitless)
    if (leaveType === "Casual Leave" && totalDays > leaveBalances.casual) {
      setFormError(`Insufficient Casual Leave balance. Remaining: ${leaveBalances.casual} days.`);
      return;
    }
    if (leaveType === "Sick Leave" && totalDays > leaveBalances.sick) {
      setFormError(`Insufficient Sick Leave balance. Remaining: ${leaveBalances.sick} days.`);
      return;
    }
    if (leaveType === "Earned Leave" && totalDays > leaveBalances.earned) {
      setFormError(`Insufficient Earned Leave balance. Remaining: ${leaveBalances.earned} days.`);
      return;
    }
    if (leaveType === "Comp Off" && totalDays > leaveBalances.compOff) {
      setFormError(`Insufficient Comp Off balance. Remaining: ${leaveBalances.compOff} days.`);
      return;
    }

    const todayStr = new Date().toISOString().split("T")[0];

    applyLeave({
      type: leaveType,
      fromDate,
      toDate,
      reason,
      attachmentName,
      attachment: attachmentData || "",
      isHalfDay,
      appliedDate: todayStr,
      totalDays,
    });

    setFormSuccess("Leave application submitted successfully!");
    setReason("");
    setFromDate("");
    setToDate("");
    setIsHalfDay(false);
    setAttachmentName(null);
    setAttachmentData(null);

    // Auto-scroll to my-leaves to trace it
    setTimeout(() => {
      setActiveTab("my-leaves");
      const element = document.getElementById("leave-my-leaves");
      if (element) {
        element.scrollIntoView({ behavior: "smooth", block: "start" });
      }
      setFormSuccess("");
    }, 1500);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setAttachmentName(file.name);
      const reader = new FileReader();
      reader.onloadend = async () => {
        if (typeof reader.result === 'string') {
          const compressed = await compressImage(reader.result);
          setAttachmentData(compressed);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // Limit constants
  const LIMITS = {
    casual: 12,
    sick: 8,
    earned: 18,
    compOff: 4,
  };

  // CALCULATIONS FOR DASHBOARD
  const totalBalance = 
    (leaveBalances.casual || 0) + 
    (leaveBalances.sick || 0) + 
    (leaveBalances.earned || 0) + 
    (leaveBalances.compOff || 0);

  const totalUsed =
    (LIMITS.casual - (leaveBalances.casual || 0)) +
    (LIMITS.sick - (leaveBalances.sick || 0)) +
    (LIMITS.earned - (leaveBalances.earned || 0)) +
    (LIMITS.compOff - (leaveBalances.compOff || 0));
  const totalPending = leaveRequests.filter((r) => r.status === "Pending").length;

  // Chart Data
  const chartData = [
    {
      name: "Casual",
      Used: LIMITS.casual - (leaveBalances.casual || 0),
      Available: leaveBalances.casual || 0,
    },
    {
      name: "Sick",
      Used: LIMITS.sick - (leaveBalances.sick || 0),
      Available: leaveBalances.sick || 0,
    },
    {
      name: "Earned",
      Used: LIMITS.earned - (leaveBalances.earned || 0),
      Available: leaveBalances.earned || 0,
    },
  ];

  // Filters for My Leaves
  const filteredMyLeaves = leaveRequests.filter((req) => {
    const matchesSearch =
      req.reason.toLowerCase().includes(searchQuery.toLowerCase()) ||
      req.type.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = typeFilter === "All" || req.type === typeFilter;
    const matchesStatus = statusFilter === "All" || req.status === statusFilter;
    return matchesSearch && matchesType && matchesStatus;
  });

  const getStatusVariant = (status: string) => {
    switch (status) {
      case "Approved":
        return "success" as const;
      case "Pending":
        return "warning" as const;
      case "Rejected":
        return "danger" as const;
      case "Cancelled":
        return "neutral" as const;
      default:
        return "neutral" as const;
    }
  };

  // 4. HOLIDAY CALENDAR DATA (dynamically fetched from DB via context)
  const companyHolidays = (holidays && holidays.length > 0) ? holidays.map((h: any, index: number) => ({
    id: h.id || index,
    name: h.name,
    date: h.date,
    type: h.type || 'Public Holiday'
  })) : [
    { id: 1, name: "New Year's Day", date: "2026-01-01", type: "Public Holiday" },
    { id: 2, name: "Republic Day", date: "2026-01-26", type: "Public Holiday" },
    { id: 3, name: "Independence Day", date: "2026-08-15", type: "Public Holiday" },
    { id: 4, name: "Christmas Day", date: "2026-12-25", type: "Public Holiday" },
  ];

  // Timeline Step Generator
  const renderTimeline = (req: LeaveRequest) => {
    const steps = [
      { step: 1, label: "Request Submitted", description: `Applied on ${req.appliedDate}` },
      { step: 2, label: "Manager Review", description: req.managerStatus === "Approved" ? "Sarah Jenkins (Director of Engineering) - Recommended for approval" : req.managerStatus === "Rejected" ? "Sarah Jenkins (Director of Engineering) - Rejected request" : "Sarah Jenkins (Director of Engineering) - Awaiting Review" },
      { step: 3, label: "HR Review", description: req.status === "Approved" ? "ITLC HR Operations - Approved" : req.status === "Rejected" ? "ITLC HR Operations - Rejected" : "ITLC HR Operations - Pending Compliance check" },
      { step: 4, label: "Final Decision", description: req.status === "Approved" ? "Approved" : req.status === "Cancelled" ? "Cancelled by Employee" : req.status === "Rejected" ? "Rejected" : "Pending final decision" },
    ];

    return (
      <div className="relative border-l-2 border-border ml-3 pl-6 space-y-6">
        {steps.map((st) => {
          let isCompleted = false;
          let isCurrent = false;
          let isRejected = req.status === "Rejected" && st.step === 4;
          let isCancelled = req.status === "Cancelled" && st.step === 4;

          if (req.status === "Approved") {
            isCompleted = true;
          } else if (req.status === "Rejected") {
            if (st.step < 4) isCompleted = true;
            if (st.step === 4) isRejected = true;
          } else if (req.status === "Cancelled") {
            if (st.step < 4) isCompleted = true;
            if (st.step === 4) isCancelled = true;
          } else {
            // Pending status
            if (st.step < req.currentStep) isCompleted = true;
            if (st.step === req.currentStep) isCurrent = true;
          }

          return (
            <div key={st.step} className="relative">
              <span
                className={cn(
                  "absolute -left-[31px] top-0.5 flex h-4 w-4 items-center justify-center rounded-full border transition-all text-xs font-bold",
                  isRejected
                    ? "bg-rose-500/20 border-rose-500 text-rose-500"
                    : isCancelled
                    ? "bg-muted border-muted-foreground text-muted-foreground"
                    : isCompleted
                    ? "bg-emerald-500/20 border-emerald-500 text-emerald-500"
                    : isCurrent
                    ? "bg-primary/20 border-primary text-primary animate-pulse"
                    : "bg-card border-border text-muted-foreground"
                )}
              >
                {isRejected ? (
                  <XCircle className="h-3 w-3" />
                ) : isCancelled ? (
                  <Trash2 className="h-3 w-3" />
                ) : isCompleted ? (
                  <CheckCircle2 className="h-3 w-3" />
                ) : isCurrent ? (
                  <Hourglass className="h-3 w-3" />
                ) : (
                  <HelpCircle className="h-3 w-3" />
                )}
              </span>

              <div>
                <h4
                  className={cn(
                    "text-xs font-bold leading-none",
                    isRejected
                      ? "text-rose-500"
                      : isCancelled
                      ? "text-muted-foreground"
                      : isCompleted
                      ? "text-emerald-500"
                      : isCurrent
                      ? "text-primary"
                      : "text-foreground"
                  )}
                >
                  {st.label}
                  {st.step === 2 && req.currentStep >= 2 && req.status !== "Rejected" && req.status !== "Cancelled" && " (Approved)"}
                  {st.step === 3 && req.currentStep >= 3 && req.status !== "Rejected" && req.status !== "Cancelled" && " (Approved)"}
                </h4>
                <p className="text-[10px] text-muted-foreground mt-1.5 leading-relaxed">
                  {st.description}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  const selectedHistoryRequest = leaveRequests.find((r) => r.id === selectedHistoryId);

  return (
    <div className="space-y-6">
      
      {/* Render stacked contents with dynamic spacing */}
      <div className="w-full space-y-12">
        
        {/* ========================================================
            TAB 1: LEAVE DASHBOARD
            ======================================================== */}
        {activeTab === 'dashboard' && (
          <div id="leave-dashboard" className="space-y-6 scroll-mt-32">
            <div className="border-b border-border pb-2 flex justify-between items-center">
              <h3 className="text-sm font-extrabold text-foreground uppercase tracking-wider flex items-center gap-2">
                <Layers className="h-4.5 w-4.5 text-primary" /> Leave Dashboard
              </h3>
            </div>
            <div className="space-y-6">
              {/* Stats Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                
                <Card className="p-5 border border-border" hover>
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="text-[10px] text-muted-foreground uppercase font-bold block">Total Leave Balance</span>
                      <span className="text-2xl font-extrabold text-foreground mt-1.5 block">{totalBalance} Days</span>
                    </div>
                    <div className="p-2 bg-indigo-500/10 text-indigo-500 rounded-lg">
                      <CalendarDays className="h-5 w-5" />
                    </div>
                  </div>
                </Card>

                <Card className="p-5 border border-border" hover>
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="text-[10px] text-muted-foreground uppercase font-bold block">Available Leaves</span>
                      <span className="text-2xl font-extrabold text-foreground mt-1.5 block">
                        {leaveBalances.casual + leaveBalances.sick + leaveBalances.earned + leaveBalances.compOff} Days
                      </span>
                    </div>
                    <div className="p-2 bg-emerald-500/10 text-emerald-500 rounded-lg">
                      <CheckCircle2 className="h-5 w-5" />
                    </div>
                  </div>
                </Card>

                <Card className="p-5 border border-border" hover>
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="text-[10px] text-muted-foreground uppercase font-bold block">Used Leaves</span>
                      <span className="text-2xl font-extrabold text-foreground mt-1.5 block">{totalUsed} Days</span>
                    </div>
                    <div className="p-2 bg-amber-500/10 text-amber-500 rounded-lg">
                      <History className="h-5 w-5" />
                    </div>
                  </div>
                </Card>

                <Card className="p-5 border border-border" hover>
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="text-[10px] text-muted-foreground uppercase font-bold block">Pending Requests</span>
                      <span className="text-2xl font-extrabold text-foreground mt-1.5 block">{totalPending} Requests</span>
                    </div>
                    <div className="p-2 bg-rose-500/10 text-rose-500 rounded-lg">
                      <Hourglass className="h-5 w-5" />
                    </div>
                  </div>
                </Card>

              </div>

              {/* Leave Policy Brief */}
              <Card className="space-y-4">
                <div className="pb-2 border-b border-border">
                  <h3 className="text-xs font-bold text-foreground uppercase tracking-wider">ITLC Leave Policy Brief</h3>
                  <p className="text-[11px] text-muted-foreground mt-0.5">Quick guide on company guidelines and leave accruals</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs leading-normal">
                  <div className="p-4 bg-secondary/50 rounded-xl border border-border space-y-1.5">
                    <span className="font-bold text-foreground block text-sm">Casual Leaves (CL)</span>
                    <p className="text-[10px] text-muted-foreground leading-relaxed">
                      Allocated at 1 day per month. Designed for short personal requirements. Carry-forward is not permitted at year-end.
                    </p>
                  </div>
                  <div className="p-4 bg-secondary/50 rounded-xl border border-border space-y-1.5">
                    <span className="font-bold text-foreground block text-sm">Sick Leaves (SL)</span>
                    <p className="text-[10px] text-muted-foreground leading-relaxed">
                      Allocated 8 days per year. Used for recovery and medical treatments. A doctor certificate is required for more than 2 consecutive days.
                    </p>
                  </div>
                  <div className="p-4 bg-secondary/50 rounded-xl border border-border space-y-1.5">
                    <span className="font-bold text-foreground block text-sm">Earned Leaves (EL)</span>
                    <p className="text-[10px] text-muted-foreground leading-relaxed">
                      Accrued at 1.5 days per month of service. Encashable leaves, with accumulation capped at a maximum of 45 days.
                    </p>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        )}

        {/* ========================================================
            TAB 2: APPLY LEAVE FORM
            ======================================================== */}
        {activeTab === 'apply' && (
          <div id="leave-apply" className="space-y-4 scroll-mt-32">
            <div className="border-b border-border pb-2">
              <h3 className="text-sm font-extrabold text-foreground uppercase tracking-wider flex items-center gap-2">
                <FilePlus className="h-4.5 w-4.5 text-primary" /> Apply for Leave
              </h3>
            </div>
            <div className="max-w-3xl">
              <Card className="p-6 md:p-8 space-y-6">
                <div className="pb-4 border-b border-border">
                  <h3 className="text-base font-extrabold text-foreground">Apply for Leave</h3>
                  <p className="text-xs text-muted-foreground mt-0.5">Submit a formal request for manager approval</p>
                </div>

                <form onSubmit={handleApplySubmit} className="space-y-5">
                  
                  {/* Leave Type Dropdown */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-semibold text-muted-foreground">Select Leave Category</label>
                    <Select
                      value={leaveType}
                      onChange={(val) => setLeaveType(val as any)}
                      options={[
                        { value: "Casual Leave", label: "Casual Leave" },
                        { value: "Sick Leave", label: "Sick Leave" },
                        { value: "Earned Leave", label: "Earned Leave" },
                        { value: "Work From Home", label: "Work From Home" },
                        { value: "Comp Off", label: "Comp Off" },
                      ]}
                    />
                  </div>

                  {/* From / To Date Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-semibold text-muted-foreground">From Date</label>
                      <input
                        type="date"
                        value={fromDate}
                        onChange={(e) => setFromDate(e.target.value)}
                        required
                        className="px-3 py-2.5 text-xs md:text-sm rounded-xl border border-border bg-secondary/35 text-foreground focus:outline-none focus:border-primary"
                      />
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-semibold text-muted-foreground">To Date</label>
                      <input
                        type="date"
                        value={toDate}
                        onChange={(e) => setToDate(e.target.value)}
                        required
                        className="px-3 py-2.5 text-xs md:text-sm rounded-xl border border-border bg-secondary/35 text-foreground focus:outline-none focus:border-primary"
                      />
                    </div>
                  </div>

                  {/* Half Day selector */}
                  <label className="flex items-center gap-2 select-none cursor-pointer p-1">
                    <input
                      type="checkbox"
                      checked={isHalfDay}
                      onChange={() => setIsHalfDay(!isHalfDay)}
                      className="rounded-md border border-border"
                    />
                    <span className="text-xs font-semibold text-foreground/80">Apply as Half-Day Leave</span>
                  </label>

                  {/* Reason Textarea */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-semibold text-muted-foreground">Reason justification</label>
                    <textarea
                      value={reason}
                      onChange={(e) => setReason(e.target.value)}
                      placeholder="Enter detailed reason for leave..."
                      required
                      rows={4}
                      className="px-3 py-2.5 text-xs md:text-sm rounded-xl border border-border bg-secondary/35 text-foreground focus:outline-none focus:border-primary resize-none"
                    />
                  </div>

                  {/* File Attachment */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-semibold text-muted-foreground">Supportive Documents (Optional)</label>
                    <div className="flex items-center gap-2">
                      <label className="px-3 py-2.5 border border-dashed border-border rounded-xl bg-secondary/20 hover:bg-secondary/40 transition-colors flex items-center gap-2 text-xs text-muted-foreground cursor-pointer">
                        <Paperclip className="h-4.5 w-4.5 text-primary" />
                        <span>{attachmentName ? attachmentName : "Upload file (medical cert, receipts)"}</span>
                        <input type="file" onChange={handleFileChange} className="hidden" />
                      </label>
                      {attachmentName && (
                        <button
                          type="button"
                          onClick={() => setAttachmentName(null)}
                          className="text-xs text-rose-500 font-bold hover:underline cursor-pointer"
                        >
                          Clear
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Error and Success alerts */}
                  {formError && (
                    <div className="p-3.5 bg-destructive/10 border border-destructive/20 text-destructive rounded-xl text-xs flex items-start gap-2">
                      <XCircle className="h-4.5 w-4.5 shrink-0 mt-0.5" />
                      <span>{formError}</span>
                    </div>
                  )}
                  {formSuccess && (
                    <div className="p-3.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 rounded-xl text-xs flex items-start gap-2">
                      <CheckCircle2 className="h-4.5 w-4.5 shrink-0 mt-0.5" />
                      <span>{formSuccess}</span>
                    </div>
                  )}

                  {/* Submit button */}
                  <div className="pt-4 border-t border-border flex justify-end gap-3">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        setReason("");
                        setFromDate("");
                        setToDate("");
                        setIsHalfDay(false);
                        setAttachmentName(null);
                      }}
                    >
                      Reset Form
                    </Button>
                    <Button type="submit">
                      Submit Request
                    </Button>
                  </div>

                </form>
              </Card>
            </div>
          </div>
        )}

        {/* ========================================================
            TAB 3: MY LEAVES (TABLE)
            ======================================================== */}
        {activeTab === 'my-leaves' && (
          <div id="leave-my-leaves" className="space-y-4 scroll-mt-32">
            <div className="border-b border-border pb-2">
              <h3 className="text-sm font-extrabold text-foreground uppercase tracking-wider flex items-center gap-2">
                <CalendarDays className="h-4.5 w-4.5 text-primary" /> My Leaves
              </h3>
            </div>
            <Card className="space-y-4">
              
              {/* Filter controls header */}
              <div className="flex flex-col md:flex-row gap-4 justify-between items-start md:items-center pb-2 border-b border-border">
                <div>
                  <h3 className="text-sm font-bold text-foreground">My Leave Records</h3>
                  <p className="text-[11px] text-muted-foreground mt-0.5">Filter and review details of all submitted applications</p>
                </div>

                {/* Inputs */}
                <div className="flex flex-wrap gap-2.5 w-full md:w-auto">
                  {/* Search */}
                  <div className="relative w-full sm:w-48">
                    <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
                    <input
                      type="text"
                      placeholder="Search by reason..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-8 pr-3 py-1.5 text-xs rounded-lg border border-border bg-secondary/50 text-foreground focus:outline-none focus:border-primary"
                    />
                  </div>

                  {/* Type Filter */}
                  <div className="w-full sm:w-36">
                    <Select
                      value={typeFilter}
                      onChange={(val) => setTypeFilter(val)}
                      options={[
                        { value: "All", label: "All Types" },
                        { value: "Casual Leave", label: "Casual Leave" },
                        { value: "Sick Leave", label: "Sick Leave" },
                        { value: "Earned Leave", label: "Earned Leave" },
                        { value: "Work From Home", label: "Work From Home" },
                        { value: "Comp Off", label: "Comp Off" },
                      ]}
                    />
                  </div>

                  {/* Status Filter */}
                  <div className="w-full sm:w-32">
                    <Select
                      value={statusFilter}
                      onChange={(val) => setStatusFilter(val)}
                      options={[
                        { value: "All", label: "All Status" },
                        { value: "Pending", label: "Pending" },
                        { value: "Approved", label: "Approved" },
                        { value: "Rejected", label: "Rejected" },
                        { value: "Cancelled", label: "Cancelled" },
                      ]}
                    />
                  </div>
                </div>
              </div>

              {/* Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-border text-muted-foreground uppercase font-bold text-[9px] tracking-wider bg-secondary/35">
                      <th className="p-3">Leave Type</th>
                      <th className="p-3">From Date</th>
                      <th className="p-3">To Date</th>
                      <th className="p-3">Total Days</th>
                      <th className="p-3">Applied Date</th>
                      <th className="p-3">Status</th>
                      <th className="p-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {filteredMyLeaves.length > 0 ? (
                      filteredMyLeaves.map((req) => (
                        <tr key={req.id} className="hover:bg-secondary/25 transition-colors">
                          <td className="p-3">
                            <span className="font-semibold text-foreground block">{req.type}</span>
                            {req.isHalfDay && (
                              <span className="text-[9px] text-muted-foreground">(Half-Day Session)</span>
                            )}
                          </td>
                          <td className="p-3 font-mono">{req.fromDate}</td>
                          <td className="p-3 font-mono">{req.toDate}</td>
                          <td className="p-3 font-mono font-bold text-foreground">{req.totalDays} days</td>
                          <td className="p-3 font-mono">{req.appliedDate}</td>
                          <td className="p-3">
                            <Badge variant={getStatusVariant(req.status)}>{req.status}</Badge>
                          </td>
                          <td className="p-3 text-right">
                            {req.status === "Pending" && (
                              <Button
                                variant="outline"
                                size="sm"
                                icon={<Trash2 className="h-3 w-3" />}
                                onClick={() => cancelLeave(req.id)}
                                className="text-[10px] py-1 h-7 border-rose-500/20 text-rose-500 hover:bg-rose-500/10 cursor-pointer"
                              >
                                Cancel
                              </Button>
                            )}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={7} className="p-8 text-center text-muted-foreground">
                          No leave records found matching your filters.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

            </Card>
          </div>
        )}

        {/* ========================================================
            TAB 4: LEAVE BALANCES
            ======================================================== */}
        {activeTab === 'balances' && (
          <div id="leave-balances" className="space-y-4 scroll-mt-32">
            <div className="border-b border-border pb-2">
              <h3 className="text-sm font-extrabold text-foreground uppercase tracking-wider flex items-center gap-2">
                <Info className="h-4.5 w-4.5 text-primary" /> Leave Balances
              </h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[
                {
                  title: "Casual Leave Balance",
                  remaining: leaveBalances.casual,
                  total: LIMITS.casual,
                  color: "bg-indigo-500",
                  desc: "Allocated for urgent, unplanned personal work. Accrues at 1 day per month.",
                },
                {
                  title: "Sick Leave Balance",
                  remaining: leaveBalances.sick,
                  total: LIMITS.sick,
                  color: "bg-emerald-500",
                  desc: "Allocated for medical recovery or doctor visits. Carry-forward is not encashable.",
                },
                {
                  title: "Earned Leave Balance",
                  remaining: leaveBalances.earned,
                  total: LIMITS.earned,
                  color: "bg-amber-500",
                  desc: "Accrues based on service duration. Capped at a maximum accumulation of 45 days.",
                },
                {
                  title: "Compensatory Offs",
                  remaining: leaveBalances.compOff,
                  total: LIMITS.compOff,
                  color: "bg-rose-500",
                  desc: "Granted for weekend or public holiday project assignments, approved by managers.",
                },
              ].map((bal, idx) => {
                return (
                  <Card key={idx} className="p-5 flex flex-col gap-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <span className="text-[10px] text-muted-foreground uppercase font-bold block">{bal.title}</span>
                        <span className="text-xl font-extrabold text-foreground mt-1 block">
                          {bal.remaining} / {bal.total} Days Left
                        </span>
                      </div>
                      <div className={`p-2 rounded-lg bg-secondary text-foreground`}>
                        <Info className="h-4.5 w-4.5" />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <div className="flex justify-between text-[10px] font-semibold text-muted-foreground">
                        <span>Used: {bal.total - bal.remaining} Days</span>
                        <span>{Math.round((bal.remaining / bal.total) * 100)}% Available</span>
                      </div>
                      <div className="h-1.5 w-full bg-secondary rounded-full overflow-hidden">
                        <div
                          className={cn("h-full rounded-full transition-all duration-300", bal.color)}
                          style={{ width: `${(bal.remaining / bal.total) * 100}%` }}
                        />
                      </div>
                    </div>

                    <p className="text-[10px] text-muted-foreground leading-relaxed bg-secondary/20 p-3 rounded-lg border border-border">
                      {bal.desc}
                    </p>
                  </Card>
                );
              })}
            </div>
          </div>
        )}

        {/* ========================================================
            TAB 5: HOLIDAY CALENDAR
            ======================================================== */}
        {activeTab === 'calendar' && (
          <div id="leave-calendar" className="space-y-4 scroll-mt-32">
            <div className="border-b border-border pb-2">
              <h3 className="text-sm font-extrabold text-foreground uppercase tracking-wider flex items-center gap-2">
                <Calendar className="h-4.5 w-4.5 text-primary" /> Holiday Calendar
              </h3>
            </div>
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
              
              {/* Calendar Grid / list (2 cols) */}
              <Card className="xl:col-span-2 space-y-4">
                <div className="flex justify-between items-center pb-2 border-b border-border">
                  <div>
                    <h3 className="text-sm font-bold text-foreground">Holiday Schedule</h3>
                    <p className="text-[11px] text-muted-foreground mt-0.5">Corporate holidays for calendar year {new Date().getFullYear()}</p>
                  </div>
                  
                  {/* View toggle */}
                  <div className="flex bg-secondary/50 p-0.5 rounded-lg border border-border">
                    <button
                      onClick={() => setCalendarViewMode("calendar")}
                      className={cn(
                        "px-2.5 py-1 text-[10px] font-semibold rounded-md transition-all cursor-pointer",
                        calendarViewMode === "calendar" ? "bg-card text-foreground shadow-xs" : "text-muted-foreground"
                      )}
                    >
                      Calendar
                    </button>
                    <button
                      onClick={() => setCalendarViewMode("list")}
                      className={cn(
                        "px-2.5 py-1 text-[10px] font-semibold rounded-md transition-all cursor-pointer",
                        calendarViewMode === "list" ? "bg-card text-foreground shadow-xs" : "text-muted-foreground"
                      )}
                    >
                      List View
                    </button>
                  </div>
                </div>

                {calendarViewMode === "calendar" ? (
                  <div className="grid grid-cols-7 gap-2 text-center text-[10px]">
                    {/* Days Header */}
                    {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (
                      <span key={d} className="font-bold text-muted-foreground py-1">
                        {d}
                      </span>
                    ))}
                    {(() => {
                      const curMonth = new Date().getMonth();
                      const curYear = new Date().getFullYear();
                      const daysCount = new Date(curYear, curMonth + 1, 0).getDate();
                      const offset = new Date(curYear, curMonth, 1).getDay();
                      
                      return Array.from({ length: 42 }).map((_, idx) => {
                        const dayNum = (idx - offset) + 1;
                        const isValid = dayNum > 0 && dayNum <= daysCount;
                        const cellDateStr = isValid ? `${curYear}-${(curMonth + 1).toString().padStart(2, '0')}-${dayNum.toString().padStart(2, '0')}` : '';
                        const dayHoliday = isValid ? companyHolidays.find(h => h.date === cellDateStr) : null;
                        
                        return (
                          <div
                            key={idx}
                            title={dayHoliday ? `${dayHoliday.name} (${dayHoliday.type})` : ''}
                            className={cn(
                              "aspect-square flex flex-col justify-between p-1.5 rounded-lg border border-border/40 font-mono text-[9px] relative",
                              !isValid && "opacity-0 pointer-events-none",
                              dayHoliday && "bg-destructive/5 border-destructive/20 text-destructive font-bold"
                            )}
                          >
                            <span>{isValid ? dayNum : ""}</span>
                            {dayHoliday && (
                              <span className="w-1.5 h-1.5 bg-destructive rounded-full absolute bottom-1.5 right-1/2 translate-x-1/2" />
                            )}
                          </div>
                        );
                      });
                    })()}
                  </div>
                ) : (
                  <div className="divide-y divide-border text-xs max-h-[300px] overflow-y-auto pr-1">
                    {companyHolidays.map((h, i) => (
                      <div key={i} className="py-2.5 flex justify-between items-center">
                        <div>
                          <span className="font-semibold text-foreground">{h.name}</span>
                          <span className="text-[10px] text-muted-foreground ml-2">({h.type})</span>
                        </div>
                        <span className="font-mono text-muted-foreground">{h.date}</span>
                      </div>
                    ))}
                    {companyHolidays.length === 0 && (
                      <div className="py-8 text-center text-muted-foreground">No holidays found.</div>
                    )}
                  </div>
                )}
              </Card>

              {/* Sidebar Upcoming Holidays (1 col) */}
              <Card className="space-y-4">
                <div className="pb-2 border-b border-border">
                  <h4 className="text-xs font-bold text-foreground uppercase tracking-wider flex items-center gap-1.5">
                    <Info className="h-4 w-4 text-primary" /> Upcoming Holidays
                  </h4>
                </div>
                <div className="space-y-3">
                  {companyHolidays
                    .filter(h => new Date(h.date) >= new Date(new Date().setHours(0,0,0,0)))
                    .sort((a,b) => a.date.localeCompare(b.date))
                    .slice(0, 5)
                    .map((h, idx) => (
                      <div key={idx} className="flex justify-between items-center p-3 bg-secondary/35 rounded-xl border border-border">
                        <div className="space-y-0.5">
                          <span className="font-bold text-foreground text-xs block">{h.name}</span>
                          <span className="text-[10px] text-muted-foreground block">{h.type}</span>
                        </div>
                        <div className="text-right">
                          <span className="font-semibold text-foreground font-mono block text-xs">
                            {new Date(h.date).toLocaleDateString("en-US", { month: "short", day: "2-digit" })}
                          </span>
                          <span className="text-[9px] text-muted-foreground block">
                            {new Date(h.date).toLocaleDateString("en-US", { weekday: "short" })}
                          </span>
                        </div>
                      </div>
                    ))}
                  {companyHolidays.filter(h => new Date(h.date) >= new Date(new Date().setHours(0,0,0,0))).length === 0 && (
                    <div className="text-center py-4 text-muted-foreground text-xs">No upcoming holidays.</div>
                  )}
                </div>
              </Card>

            </div>
          </div>
        )}

        {/* ========================================================
            TAB 6: LEAVE HISTORY (TIMELINE)
            ======================================================== */}
        {activeTab === 'history' && (
          <div id="leave-history" className="space-y-4 scroll-mt-32">
            <div className="border-b border-border pb-2">
              <h3 className="text-sm font-extrabold text-foreground uppercase tracking-wider flex items-center gap-2">
                <History className="h-4.5 w-4.5 text-primary" /> Leave History & Verification Path
              </h3>
            </div>
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
              
              {/* History Records selector (2 cols) */}
              <Card className="xl:col-span-2 space-y-4">
                <div className="pb-2 border-b border-border">
                  <h3 className="text-sm font-bold text-foreground">Previous Leave Records</h3>
                  <p className="text-[11px] text-muted-foreground mt-0.5">Select a leave log to check validation timelines and notes</p>
                </div>

                <div className="space-y-2.5 max-h-[500px] overflow-y-auto pr-1">
                  {leaveRequests.map((req) => (
                    <div
                      key={req.id}
                      onClick={() => setSelectedHistoryId(req.id)}
                      className={cn(
                        "p-4 rounded-xl border transition-all cursor-pointer flex justify-between items-center text-xs",
                        selectedHistoryId === req.id
                          ? "border-primary bg-primary/5"
                          : "border-border bg-secondary/15 hover:bg-secondary/25"
                      )}
                    >
                      <div className="space-y-1.5 min-w-0 pr-4">
                        <div className="flex items-center gap-2">
                          <span className="font-extrabold text-[10px] text-primary font-mono">{req.id}</span>
                          <span className="font-bold text-foreground">{req.type}</span>
                        </div>
                        <p className="text-[11px] text-muted-foreground truncate max-w-sm" title={req.reason}>
                          Reason: {req.reason}
                        </p>
                      </div>
                      <div className="text-right shrink-0">
                        <div className="font-semibold text-foreground font-mono mb-1.5">
                          {req.totalDays} {req.totalDays === 1 ? "day" : "days"}
                        </div>
                        <span className="text-[9px] text-muted-foreground block font-mono">
                          {req.fromDate} to {req.toDate}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>

              {/* Validation Journey Detail panel (1 col) */}
              <Card className="flex flex-col border border-border">
                <div className="pb-2 border-b border-border">
                  <h4 className="text-xs font-bold text-foreground uppercase tracking-wider flex items-center gap-1.5">
                    <Layers className="h-4 w-4 text-primary" /> Verification Journey
                  </h4>
                </div>

                {selectedHistoryRequest ? (
                  <div className="flex-1 flex flex-col justify-between space-y-6 pt-2">
                    <div className="space-y-5">
                      <div className="bg-secondary/35 p-3 rounded-lg border border-border space-y-1 text-xs">
                        <span className="font-bold text-foreground block">Leave Reason / Comment</span>
                        <p className="text-muted-foreground text-[11px] leading-relaxed">{selectedHistoryRequest.reason}</p>
                      </div>

                      {/* Timeline steps */}
                      <div className="space-y-4 relative pl-4 before:absolute before:left-1.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-border">
                        {renderTimeline(selectedHistoryRequest)}
                      </div>
                    </div>

                    {selectedHistoryRequest.attachment && (
                      <div className="pt-2 border-t border-border flex flex-col gap-2">
                        <span className="text-[10px] font-bold text-foreground">Attachment Preview:</span>
                        {selectedHistoryRequest.attachment.startsWith('data:image/') ? (
                          <img src={selectedHistoryRequest.attachment} alt="Leave receipt" className="max-h-40 rounded-lg border border-border object-contain" />
                        ) : (
                          <div className="p-2 border border-border rounded-lg bg-secondary/10 flex items-center justify-between text-[10px]">
                            <span className="truncate">{selectedHistoryRequest.attachmentName || 'Attachment'}</span>
                            <a href={selectedHistoryRequest.attachment} download={selectedHistoryRequest.attachmentName || 'receipt.pdf'} className="text-primary font-bold hover:underline">Download</a>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="flex-1 flex items-center justify-center text-center p-8 text-xs text-muted-foreground">
                    Select a leave request to inspect the verification path.
                  </div>
                )}
              </Card>

            </div>
          </div>
        )}

      </div>

    </div>
  );
};
