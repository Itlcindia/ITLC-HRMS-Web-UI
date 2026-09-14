"use client";

import React, { useState, useEffect } from "react";
import { useHRMS, AttendanceRecord } from "../context/HRMSContext";
import { Card, Button, Modal, Badge, cn } from "../UI";
import {
  Clock,
  Coffee,
  Play,
  CalendarDays,
  FileEdit,
  SlidersHorizontal,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  LogOut,
} from "lucide-react";

export const AttendanceManagement: React.FC = () => {
  const {
    isClockedIn,
    clockInTime,
    isBreakActive,
    breakStartTime,
    totalBreakSecondsToday,
    todayWorkSeconds,
    attendanceHistory,
    attendanceCorrections,
    clockIn,
    clockOut,
    startBreak,
    endBreak,
    requestCorrection,
    activeSubTab: globalSubTab,
    setActiveSubTab: setGlobalSubTab,
  } = useHRMS();

  const activeSubTab = globalSubTab === "att-tracker"
    ? "attendance-punch"
    : ["attendance-punch", "attendance-calendar", "attendance-history", "att-regularize", "att-overtime"].includes(globalSubTab)
      ? globalSubTab
      : "attendance-punch";

  const setActiveSubTab = (tabId: string) => setGlobalSubTab(tabId);

  // Correction Modal State
  const [isCorrOpen, setIsCorrOpen] = useState(false);
  const [corrDate, setCorrDate] = useState("");
  const [corrIn, setCorrIn] = useState("09:00:00");
  const [corrOut, setCorrOut] = useState("18:00:00");
  const [corrReason, setCorrReason] = useState("");

  // Filters State
  const [filterType, setFilterType] = useState<"Monthly" | "Weekly" | "Daily">("Monthly");

  // Local counter for active break timer segment
  const [activeBreakSeg, setActiveBreakSeg] = useState(0);

  useEffect(() => {
    let timer: any;
    if (isClockedIn && isBreakActive && breakStartTime !== null) {
      timer = setInterval(() => {
        setActiveBreakSeg(Math.floor((Date.now() - breakStartTime) / 1000));
      }, 1000);
    } else {
      setActiveBreakSeg(0);
    }
    return () => clearInterval(timer);
  }, [isClockedIn, isBreakActive, breakStartTime]);

  const displayBreakSeconds = totalBreakSecondsToday + activeBreakSeg;
  const todayDateStr = new Date().toISOString().split("T")[0];
  const todayRecord = attendanceHistory?.find(r => r.date === todayDateStr);

  // Calendar setup - June 2026
  // June 2026 starts on a Monday (Index 1: Mon, 2: Tue... 0: Sun)
  // Let's create a list of days in June (30 days)
  const daysInJune = 30;
  const startDayOffset = 1; // 1 means Monday is June 1st

  const calendarDays = Array.from({ length: daysInJune }, (_, i) => {
    const dayNum = i + 1;
    const dateString = `2026-06-${dayNum.toString().padStart(2, "0")}`;
    
    // Find record
    const record = attendanceHistory.find((r) => r.date === dateString);
    return {
      dayNum,
      dateString,
      record,
    };
  });

  // Prepend empty slots for calendar spacing
  const emptySlots = Array.from({ length: startDayOffset }, (_, i) => null);

  const getStatusColor = (status?: string) => {
    if (!status) return "bg-muted/40 hover:bg-muted text-muted-foreground";
    switch (status) {
      case "Present":
        return "bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20 border-emerald-500/20";
      case "Late":
        return "bg-amber-500/10 text-amber-500 hover:bg-amber-500/20 border-amber-500/20";
      case "Half-day":
        return "bg-indigo-500/10 text-indigo-500 hover:bg-indigo-500/20 border-indigo-500/20";
      case "Absent":
        return "bg-rose-500/10 text-rose-500 hover:bg-rose-500/20 border-rose-500/20";
      default:
        return "bg-secondary text-secondary-foreground";
    }
  };

  const handleCorrectionSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!corrDate || !corrIn || !corrOut || !corrReason) return;
    requestCorrection({
      date: corrDate,
      requestedCheckIn: corrIn,
      requestedCheckOut: corrOut,
      reason: corrReason,
    });
    setIsCorrOpen(false);
    setCorrReason("");
  };

  // Filter history logic
  const filteredHistory = attendanceHistory.filter((rec) => {
    if (filterType === "Daily") {
      const todayStr = new Date().toISOString().split("T")[0];
      return rec.date === todayStr;
    }
    if (filterType === "Weekly") {
      // Past 7 days
      const limitDate = new Date();
      limitDate.setDate(limitDate.getDate() - 7);
      return new Date(rec.date) >= limitDate;
    }
    return true; // Monthly / All
  });

  const formatSeconds = (totalSeconds: number): string => {
    const hrs = Math.floor(totalSeconds / 3600);
    const mins = Math.floor((totalSeconds % 3600) / 60);
    const secs = totalSeconds % 60;
    return `${hrs.toString().padStart(2, "0")}:${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <div className="space-y-6">
      
      {/* Tabs navigation */}
      {["attendance-punch", "attendance-calendar", "attendance-history"].includes(activeSubTab) && (
        <div className="flex bg-card p-1 rounded-xl border border-border overflow-x-auto space-x-1 shrink-0 scrollbar-none print:hidden">
          {[
            { id: "attendance-punch", label: "Check In / Out", icon: Clock },
            { id: "attendance-calendar", label: "Attendance Calendar", icon: CalendarDays },
            { id: "attendance-history", label: "Attendance History", icon: SlidersHorizontal },
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
      )}

      {/* RENDER PUNCH PANEL VIEW */}
      {activeSubTab === "attendance-punch" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fadeIn">
          {/* Check-In / Break Controls Card */}
          <Card className="lg:col-span-2 flex flex-col justify-between p-6 space-y-6 bg-card">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-sm font-bold text-foreground">Attendance Punch Panel</h3>
                <p className="text-[11px] text-muted-foreground mt-0.5">
                  Register daily shift entries and breaks below.
                </p>
              </div>
              <Badge variant={isClockedIn ? "success" : "neutral"} className="text-[10px]">
                {isClockedIn ? (isBreakActive ? "On Break" : "Shift In Progress") : "Checked Out"}
              </Badge>
            </div>

            {/* Clock In-Out Buttons Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {!isClockedIn ? (
                <Button
                  onClick={clockIn}
                  icon={<Play className="h-4.5 w-4.5 text-white" />}
                  className="btn-punch-in h-14 w-full text-white font-bold"
                >
                  Punch In
                </Button>
              ) : (
                <div className="contents sm:grid sm:grid-cols-2 sm:col-span-2 gap-4">
                  <Button
                    onClick={clockOut}
                    icon={<LogOut className="h-4.5 w-4.5 text-white" />}
                    className="btn-punch-out h-14 w-full text-white font-bold"
                  >
                    Punch Out
                  </Button>
                  <Button
                    variant="outline"
                    onClick={isBreakActive ? endBreak : startBreak}
                    icon={<Coffee className="h-4.5 w-4.5" />}
                    className={`h-14 font-semibold text-sm rounded-xl border cursor-pointer w-full ${
                      isBreakActive ? "bg-amber-500/10 text-amber-500 border-amber-500/25 hover:bg-amber-500/25" : ""
                    }`}
                  >
                    {isBreakActive ? "End Break Segment" : "Start Break Segment"}
                  </Button>
                </div>
              )}
            </div>

            {/* Mini punch log */}
            {isClockedIn && clockInTime ? (
              <div className="text-[11px] text-muted-foreground flex gap-4 pt-2 border-t border-border">
                <span>
                  Shift Started: <strong className="text-foreground">{new Date(clockInTime).toLocaleTimeString()}</strong>
                </span>
                {isBreakActive && breakStartTime && (
                  <span>
                    Break Started: <strong className="text-foreground">{new Date(breakStartTime).toLocaleTimeString()}</strong>
                  </span>
                )}
              </div>
            ) : todayRecord ? (
              <div className="text-[11px] text-muted-foreground flex gap-4 pt-2 border-t border-border">
                <span>
                  Shift In: <strong className="text-foreground">{todayRecord.checkIn}</strong>
                </span>
                <span>
                  Shift Out: <strong className="text-foreground">{todayRecord.checkOut}</strong>
                </span>
                <span>
                  Status: <strong className="text-foreground">{todayRecord.status}</strong>
                </span>
              </div>
            ) : null}
          </Card>

          {/* Shift Timers Card */}
          <Card className="flex flex-col justify-between p-6 space-y-4 bg-card">
            <div className="pb-2 border-b border-border">
              <h3 className="text-xs font-bold text-foreground uppercase tracking-wider">Live Time Log</h3>
            </div>
            
            <div className="space-y-4">
              <div>
                <span className="text-[10px] text-muted-foreground uppercase font-bold block">Accumulated Work Hours</span>
                <div className="text-3xl font-extrabold text-foreground font-mono mt-1">
                  {isClockedIn ? formatSeconds(todayWorkSeconds) : (todayRecord?.workHours || "00:00:00")}
                </div>
              </div>

              <div>
                <span className="text-[10px] text-muted-foreground uppercase font-bold block">Break Duration</span>
                <div className="text-xl font-extrabold text-muted-foreground font-mono mt-1">
                  {isClockedIn ? formatSeconds(displayBreakSeconds) : (todayRecord?.breakDuration || "00:00:00")}
                </div>
              </div>
            </div>

            <div className="text-[10px] text-muted-foreground pt-2 border-t border-border flex justify-between">
              <span>Shift Target: 8.0 hrs</span>
              <span>Overtime triggers at 8.5 hrs</span>
            </div>
          </Card>
        </div>
      )}

      {/* RENDER CALENDAR GRID */}
      {activeSubTab === "attendance-calendar" && (
        <Card className="space-y-4 animate-fadeIn bg-card w-full">
          <div className="flex justify-between items-center pb-2 border-b border-border">
            <div>
              <h3 className="text-sm font-bold text-foreground flex items-center gap-1.5">
                <CalendarDays className="h-4.5 w-4.5 text-primary" /> Attendance Grid (June 2026)
              </h3>
              <p className="text-[11px] text-muted-foreground mt-0.5">Click/hover days to check work duration metrics.</p>
            </div>
            
            <div className="flex items-center gap-1">
              <Button variant="ghost" size="sm" className="p-1 cursor-pointer">
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <span className="text-xs font-bold text-foreground">June 2026</span>
              <Button variant="ghost" size="sm" className="p-1 cursor-pointer">
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-7 gap-2 text-center mt-3">
            {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((day, i) => (
              <div key={i} className="text-[10px] font-bold text-muted-foreground uppercase py-1">
                {day}
              </div>
            ))}

            {emptySlots.map((_, i) => (
              <div key={`empty-${i}`} className="aspect-square" />
            ))}

            {calendarDays.map((day) => {
              const style = getStatusColor(day.record?.status);
              const isWeekend = (day.dayNum + startDayOffset - 1) % 7 === 5 || (day.dayNum + startDayOffset - 1) % 7 === 6;

              return (
                <div
                  key={day.dayNum}
                  title={
                    day.record
                      ? `${day.dateString}: ${day.record.status} (${day.record.workHours} hrs)`
                      : `${day.dateString}: ${isWeekend ? "Weekend" : "No punch record"}`
                  }
                  className={`aspect-square border rounded-lg flex flex-col justify-between p-1.5 transition-all text-left group cursor-pointer ${
                    day.record
                      ? style
                      : isWeekend
                      ? "bg-secondary/25 border-border/30 text-muted-foreground"
                      : "border-border text-foreground hover:bg-secondary/40"
                  }`}
                >
                  <span className="text-xs font-bold">{day.dayNum}</span>
                  {day.record && (
                    <span className="text-[8px] font-mono leading-none truncate hidden sm:block">
                      {day.record.workHours.substring(0, 5)}
                    </span>
                  )}
                </div>
              );
            })}
          </div>

          <div className="flex flex-wrap gap-4 text-[10px] text-muted-foreground pt-4 border-t border-border mt-4">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-md bg-emerald-500/10 border border-emerald-500/20 inline-block" /> Present
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-md bg-amber-500/10 border border-amber-500/20 inline-block" /> Late In
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-md bg-indigo-500/10 border border-indigo-500/20 inline-block" /> Half Day
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-md bg-rose-500/10 border border-rose-500/20 inline-block" /> Absent / Unexcused
            </div>
          </div>
        </Card>
      )}

      {/* RENDER ATTENDANCE HISTORY */}
      {activeSubTab === "attendance-history" && (
        <Card className="flex flex-col space-y-4 bg-card w-full animate-fadeIn">
          <div className="flex justify-between items-center pb-2 border-b border-border">
            <div>
              <h3 className="text-sm font-bold text-foreground">Attendance Logs & Corrections</h3>
              <p className="text-[11px] text-muted-foreground mt-0.5">View historic punch segments or request corrections.</p>
            </div>
            <div className="flex gap-1">
              <Button
                variant="outline"
                size="sm"
                icon={<FileEdit className="h-3.5 w-3.5" />}
                onClick={() => setIsCorrOpen(true)}
                className="text-[11px] h-8 px-2"
              >
                Request Correction
              </Button>
            </div>
          </div>

          {/* Filters Button group */}
          <div className="flex bg-secondary/50 p-0.5 rounded-lg border border-border max-w-xs">
            {["Monthly", "Weekly", "Daily"].map((type) => (
              <button
                key={type}
                onClick={() => setFilterType(type as any)}
                className={`flex-1 text-center py-1.5 text-[11px] font-semibold rounded-md transition-all cursor-pointer ${
                  filterType === type ? "bg-card text-foreground shadow-xs" : "text-muted-foreground"
                }`}
              >
                {type}
              </button>
            ))}
          </div>

          {/* Table list */}
          <div className="overflow-y-auto space-y-2.5 max-h-96 pr-1 mt-3">
            {filteredHistory.length > 0 ? (
              filteredHistory.map((rec, idx) => (
                <div key={idx} className="p-3 rounded-xl border border-border bg-secondary/15 flex justify-between items-center text-xs">
                  <div>
                    <div className="font-bold text-foreground">{rec.date}</div>
                    <div className="text-[10px] text-muted-foreground mt-1 flex gap-2">
                      <span>In: {rec.checkIn}</span>
                      <span>Out: {rec.checkOut}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-foreground font-mono">{rec.workHours}</div>
                    <Badge variant={rec.status === "Present" ? "success" : rec.status === "Late" ? "warning" : "danger"} className="text-[9px] mt-1">
                      {rec.status}
                    </Badge>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-muted-foreground text-xs">
                No attendance logs found for this filter.
              </div>
            )}
          </div>
        </Card>
      )}

      {/* RENDER REGULARIZATION PANEL VIEW */}
      {activeSubTab === "att-regularize" && (
        <div className="space-y-6 animate-fadeIn">
          {/* Header */}
          <div className="p-5 bg-gradient-to-r from-primary/10 via-primary/5 to-transparent rounded-2xl border border-primary/10 flex justify-between items-center gap-4">
            <div>
              <h3 className="text-sm font-bold text-foreground flex items-center gap-1.5">
                <FileEdit className="h-4.5 w-4.5 text-primary" /> Attendance Regularization Requests
              </h3>
              <p className="text-[11px] text-muted-foreground mt-0.5">
                Request correction for missing punches or incorrect check-in/out logs
              </p>
            </div>
            <Button size="sm" variant="primary" onClick={() => setIsCorrOpen(true)}>
              New Request
            </Button>
          </div>

          {/* Table list */}
          <Card className="p-0 overflow-hidden border border-border">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-border text-muted-foreground uppercase font-bold text-[9px] tracking-wider bg-secondary/35">
                    <th className="p-3">ID</th>
                    <th className="p-3">Date</th>
                    <th className="p-3">Classification</th>
                    <th className="p-3">Requested In</th>
                    <th className="p-3">Requested Out</th>
                    <th className="p-3">Reason</th>
                    <th className="p-3">Status</th>
                    <th className="p-3">Manager Comment</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {attendanceCorrections.filter(c => c.type !== 'Overtime').length === 0 ? (
                    <tr>
                      <td colSpan={8} className="p-6 text-center text-muted-foreground">
                        No regularization requests submitted yet.
                      </td>
                    </tr>
                  ) : (
                    attendanceCorrections.filter(c => c.type !== 'Overtime').map(corr => (
                      <tr key={corr.id} className="hover:bg-secondary/15 font-semibold">
                        <td className="p-3 font-mono font-bold text-primary">{corr.id}</td>
                        <td className="p-3 font-mono">{corr.date}</td>
                        <td className="p-3">
                          <Badge variant="info" className="text-[9px]">{corr.type || 'Correction'}</Badge>
                        </td>
                        <td className="p-3 font-mono">{corr.requestedCheckIn || 'N/A'}</td>
                        <td className="p-3 font-mono">{corr.requestedCheckOut || 'N/A'}</td>
                        <td className="p-3">{corr.reason}</td>
                        <td className="p-3">
                          <Badge variant={corr.status === 'Approved' ? 'success' : corr.status === 'Pending' ? 'warning' : 'danger'}>
                            {corr.status}
                          </Badge>
                        </td>
                        <td className="p-3 text-muted-foreground">{corr.managerComment || 'No comment yet'}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      )}

      {/* RENDER OVERTIME PANEL VIEW */}
      {activeSubTab === "att-overtime" && (
        <div className="space-y-6 animate-fadeIn">
          {/* Header */}
          <div className="p-5 bg-gradient-to-r from-warning/10 via-warning/5 to-transparent rounded-2xl border border-warning/10 flex justify-between items-center gap-4">
            <div>
              <h3 className="text-sm font-bold text-foreground flex items-center gap-1.5">
                <Clock className="h-4.5 w-4.5 text-warning" /> Overtime Logging
              </h3>
              <p className="text-[11px] text-muted-foreground mt-0.5">
                Log and track extra working hours for manager validation and billing
              </p>
            </div>
            <Button size="sm" variant="primary" onClick={() => {
              setCorrDate(new Date().toISOString().split('T')[0]);
              setCorrIn("18:00:00");
              setCorrOut("21:00:00");
              setIsCorrOpen(true);
            }}>
              Log Overtime
            </Button>
          </div>

          {/* Table list */}
          <Card className="p-0 overflow-hidden border border-border">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-border text-muted-foreground uppercase font-bold text-[9px] tracking-wider bg-secondary/35">
                    <th className="p-3">ID</th>
                    <th className="p-3">Date</th>
                    <th className="p-3">Hours Logged</th>
                    <th className="p-3">Reason / Project</th>
                    <th className="p-3">Status</th>
                    <th className="p-3">Manager Comment</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {attendanceCorrections.filter(c => c.type === 'Overtime').length === 0 ? (
                    <tr>
                      <td colSpan={6} className="p-6 text-center text-muted-foreground">
                        No overtime hours logged yet.
                      </td>
                    </tr>
                  ) : (
                    attendanceCorrections.filter(c => c.type === 'Overtime').map(corr => (
                      <tr key={corr.id} className="hover:bg-secondary/15 font-semibold">
                        <td className="p-3 font-mono font-bold text-primary">{corr.id}</td>
                        <td className="p-3 font-mono">{corr.date}</td>
                        <td className="p-3 font-mono">{corr.requestedCheckIn} to {corr.requestedCheckOut}</td>
                        <td className="p-3">{corr.reason}</td>
                        <td className="p-3">
                          <Badge variant={corr.status === 'Approved' ? 'success' : corr.status === 'Pending' ? 'warning' : 'danger'}>
                            {corr.status}
                          </Badge>
                        </td>
                        <td className="p-3 text-muted-foreground">{corr.managerComment || 'No comment yet'}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      )}

      {/* Attendance Correction Modal */}
      <Modal isOpen={isCorrOpen} onClose={() => setIsCorrOpen(false)} title={activeSubTab === "att-overtime" ? "Log Overtime Hours" : "Submit Attendance Correction"}>
        <form onSubmit={(e) => {
          e.preventDefault();
          if (!corrDate || !corrIn || !corrOut || !corrReason) return;
          const reqType = activeSubTab === "att-overtime" ? "Overtime" : "Correction";
          requestCorrection({
            date: corrDate,
            type: reqType as any,
            requestedCheckIn: corrIn,
            requestedCheckOut: corrOut,
            reason: corrReason,
          });
          setIsCorrOpen(false);
          setCorrReason("");
        }} className="space-y-4">
          
          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-muted-foreground">Select Date</label>
            <input
              type="date"
              value={corrDate}
              onChange={(e) => setCorrDate(e.target.value)}
              required
              className="px-3 py-2 text-xs md:text-sm rounded-lg border border-border bg-secondary/35 text-foreground focus:outline-none focus:border-primary"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1">
              <label className="text-xs font-medium text-muted-foreground">{activeSubTab === "att-overtime" ? "Overtime Start (HH:MM:SS)" : "Requested Check-In (HH:MM:SS)"}</label>
              <input
                type="text"
                value={corrIn}
                onChange={(e) => setCorrIn(e.target.value)}
                placeholder="e.g. 09:00:00"
                required
                className="px-3 py-2 text-xs md:text-sm rounded-lg border border-border bg-secondary/35 text-foreground focus:outline-none focus:border-primary"
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-xs font-medium text-muted-foreground">{activeSubTab === "att-overtime" ? "Overtime End (HH:MM:SS)" : "Requested Check-Out (HH:MM:SS)"}</label>
              <input
                type="text"
                value={corrOut}
                onChange={(e) => setCorrOut(e.target.value)}
                placeholder="e.g. 18:00:00"
                required
                className="px-3 py-2 text-xs md:text-sm rounded-lg border border-border bg-secondary/35 text-foreground focus:outline-none focus:border-primary"
              />
            </div>
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-muted-foreground">{activeSubTab === "att-overtime" ? "Justification / Project details" : "Reason for Correction"}</label>
            <textarea
              value={corrReason}
              onChange={(e) => setCorrReason(e.target.value)}
              placeholder={activeSubTab === "att-overtime" ? "Enter project name or work done during overtime..." : "Provide a detailed explanation of why the correction is needed..."}
              required
              rows={3}
              className="px-3 py-2 text-xs md:text-sm rounded-lg border border-border bg-secondary/35 text-foreground focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 resize-none"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-border mt-6">
            <Button type="button" variant="outline" onClick={() => setIsCorrOpen(false)}>
              Cancel
            </Button>
            <Button type="submit">
              Submit Request
            </Button>
          </div>
        </form>
      </Modal>

    </div>
  );
};
