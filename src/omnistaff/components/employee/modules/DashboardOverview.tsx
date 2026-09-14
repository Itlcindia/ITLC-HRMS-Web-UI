"use client";

import React, { useState, useEffect } from "react";
import { useHRMS } from "../context/HRMSContext";
import { Card, Badge, Button, cn } from "../UI";
import {
  Clock,
  Calendar,
  GripVertical,
  Edit2,
  Eye,
  EyeOff,
  Trash2,
  Plus,
  Check,
  RotateCcw,
  LayoutGrid,
  Info,
  GraduationCap,
  Bell,
  CheckSquare,
  Square,
  FileText,
  BookOpen,
  Play,
  LogOut,
  Video,
} from "lucide-react";

interface TaskItem {
  id: string;
  text: string;
  completed: boolean;
}

const DEFAULT_TASKS: TaskItem[] = [
  { id: "task-1", text: "Complete Enterprise SaaS Security assessment", completed: false },
  { id: "task-2", text: "Submit May 2026 out-of-pocket travel expense receipts", completed: true },
  { id: "task-3", text: "Register biometric card verification with HR Desk", completed: false },
];

export const DashboardOverview: React.FC = () => {
  const {
    profile,
    isClockedIn,
    clockInTime,
    todayWorkSeconds,
    clockIn,
    clockOut,
    leaveBalances,
    leaveRequests,
    setActiveTab,
    setActiveSubTab,
    courses,
    notifications,
    payslips,
    attendanceHistory,
    meetings,
    announcements,
  } = useHRMS();

  const todayDateStr = new Date().toISOString().split("T")[0];
  const todayRecord = attendanceHistory?.find((r: any) => r.date === todayDateStr);

  const [mounted, setMounted] = useState(false);

  // Layout customization states
  const [isEditMode, setIsEditMode] = useState(false);
  const [sectionOrder, setSectionOrder] = useState<string[]>(["attendance", "leave", "tasks", "lms", "news", "meetings"]);
  const [sectionTitles, setSectionTitles] = useState<Record<string, string>>({
    attendance: "Attendance Desk",
    leave: "Leave Summary",
    tasks: "Work Checklist",
    lms: "LMS Learning Desk",
    news: "Recent Notices Feed",
    meetings: "Upcoming Team Syncs"
  });
  const [sectionVisibility, setSectionVisibility] = useState<Record<string, boolean>>({
    attendance: true,
    leave: true,
    tasks: true,
    lms: true,
    news: true,
    meetings: true
  });

  // Task list states
  const [tasks, setTasks] = useState<TaskItem[]>(DEFAULT_TASKS);
  const [newTaskText, setNewTaskText] = useState("");
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);
  const [editingTaskText, setEditingTaskText] = useState("");

  // Drag states
  const [draggedId, setDraggedId] = useState<string | null>(null);
  const [dragOverId, setDragOverId] = useState<string | null>(null);

  // Widget inline title editing states
  const [editingTitleId, setEditingTitleId] = useState<string | null>(null);
  const [tempTitle, setTempTitle] = useState("");

  // Notification badge layout save
  const [showSavedToast, setShowSavedToast] = useState(false);

  // Hydrate states from localStorage on mount
  useEffect(() => {
    setMounted(true);
    
    const savedOrder = localStorage.getItem("hrms_dash_order");
    const savedTitles = localStorage.getItem("hrms_dash_titles");
    const savedVisibility = localStorage.getItem("hrms_dash_visibility");
    const savedTasks = localStorage.getItem("hrms_dash_tasks");

    if (savedOrder) {
      let order = JSON.parse(savedOrder);
      order = order.filter((id: string) => id !== "payroll");
      if (!order.includes("meetings")) {
        order.push("meetings");
      }
      setSectionOrder(order);
    }
    if (savedTitles) {
      const titles = JSON.parse(savedTitles);
      delete titles.payroll;
      if (!titles.meetings) {
        titles.meetings = "Upcoming Team Syncs";
      }
      setSectionTitles(titles);
    }
    if (savedVisibility) {
      const visibility = JSON.parse(savedVisibility);
      delete visibility.payroll;
      if (visibility.meetings === undefined) {
        visibility.meetings = true;
      }
      setSectionVisibility(visibility);
    }
    if (savedTasks) setTasks(JSON.parse(savedTasks));
  }, []);

  // Save states to localStorage
  const saveToStorage = (order: string[], titles: Record<string, string>, visibility: Record<string, boolean>) => {
    localStorage.setItem("hrms_dash_order", JSON.stringify(order));
    localStorage.setItem("hrms_dash_titles", JSON.stringify(titles));
    localStorage.setItem("hrms_dash_visibility", JSON.stringify(visibility));
    
    setShowSavedToast(true);
    setTimeout(() => setShowSavedToast(false), 2000);
  };

  const saveTasksToStorage = (updatedTasks: TaskItem[]) => {
    setTasks(updatedTasks);
    localStorage.setItem("hrms_dash_tasks", JSON.stringify(updatedTasks));
  };

  const formatTimer = (totalSeconds: number): string => {
    const hrs = Math.floor(totalSeconds / 3600);
    const bgMins = Math.floor((totalSeconds % 3600) / 60);
    const secs = totalSeconds % 60;
    return `${hrs.toString().padStart(2, "0")}:${bgMins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const handleQuickApply = () => {
    localStorage.setItem("hrms_leave_subtab", "leave-apply");
    setActiveTab("leaves");
    setActiveSubTab("leave-apply");
  };

  const handleNavigateLMS = () => {
    setActiveTab("training");
    setActiveSubTab("courses");
  };

  // Reset customized layout
  const handleResetLayout = () => {
    const defaultOrder = ["attendance", "leave", "tasks", "lms", "news", "meetings"];
    const defaultTitles = {
      attendance: "Attendance Desk",
      leave: "Leave Summary",
      tasks: "Work Checklist",
      lms: "LMS Learning Desk",
      news: "Recent Notices Feed",
      meetings: "Upcoming Team Syncs"
    };
    const defaultVisibility = {
      attendance: true,
      leave: true,
      tasks: true,
      lms: true,
      news: true,
      meetings: true
    };

    setSectionOrder(defaultOrder);
    setSectionTitles(defaultTitles);
    setSectionVisibility(defaultVisibility);
    setEditingTitleId(null);

    saveToStorage(defaultOrder, defaultTitles, defaultVisibility);
  };

  // HTML5 Drag and Drop events
  const handleDragStart = (e: React.DragEvent, id: string) => {
    e.dataTransfer.setData("text/plain", id);
    setDraggedId(id);
  };

  const handleDragOver = (e: React.DragEvent, id: string) => {
    e.preventDefault();
    if (draggedId !== id) {
      setDragOverId(id);
    }
  };

  const handleDrop = (e: React.DragEvent, targetId: string) => {
    e.preventDefault();
    const sourceId = e.dataTransfer.getData("text/plain") || draggedId;
    if (!sourceId || sourceId === targetId) return;

    const newOrder = [...sectionOrder];
    const sourceIdx = newOrder.indexOf(sourceId);
    const targetIdx = newOrder.indexOf(targetId);

    if (sourceIdx !== -1 && targetIdx !== -1) {
      newOrder[sourceIdx] = targetId;
      newOrder[targetIdx] = sourceId;
      setSectionOrder(newOrder);
      saveToStorage(newOrder, sectionTitles, sectionVisibility);
    }

    setDraggedId(null);
    setDragOverId(null);
  };

  const handleDragEnd = () => {
    setDraggedId(null);
    setDragOverId(null);
  };

  // Title edit submit
  const handleSaveTitle = (id: string) => {
    if (!tempTitle.trim()) return;
    const updatedTitles = {
      ...sectionTitles,
      [id]: tempTitle.trim(),
    };
    setSectionTitles(updatedTitles);
    setEditingTitleId(null);
    saveToStorage(sectionOrder, updatedTitles, sectionVisibility);
  };

  // Visibility toggle
  const handleToggleVisibility = (id: string) => {
    const updatedVisibility = {
      ...sectionVisibility,
      [id]: !sectionVisibility[id],
    };
    setSectionVisibility(updatedVisibility);
    saveToStorage(sectionOrder, sectionTitles, updatedVisibility);
  };

  // Tasks actions
  const handleAddTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskText.trim()) return;
    const newTasks = [
      ...tasks,
      { id: `task-${Date.now()}`, text: newTaskText.trim(), completed: false },
    ];
    saveTasksToStorage(newTasks);
    setNewTaskText("");
  };

  const handleToggleTask = (id: string) => {
    const newTasks = tasks.map((t) => (t.id === id ? { ...t, completed: !t.completed } : t));
    saveTasksToStorage(newTasks);
  };

  const handleDeleteTask = (id: string) => {
    const newTasks = tasks.filter((t) => t.id !== id);
    saveTasksToStorage(newTasks);
  };

  const handleStartEditTask = (task: TaskItem) => {
    setEditingTaskId(task.id);
    setEditingTaskText(task.text);
  };

  const handleSaveTaskEdit = (id: string) => {
    if (!editingTaskText.trim()) return;
    const newTasks = tasks.map((t) => (t.id === id ? { ...t, text: editingTaskText.trim() } : t));
    saveTasksToStorage(newTasks);
    setEditingTaskId(null);
  };

  if (!mounted) {
    return null;
  }

  const availableLeaves = leaveBalances.casual + leaveBalances.sick + leaveBalances.earned + leaveBalances.compOff;
  const pendingRequests = leaveRequests.filter((r) => r.status === "Pending").length;

  // Active or ongoing courses in LMS
  const ongoingCourse = courses.find((c) => !c.completed) || courses[0];

  // Map widgets to render functions
  const renderWidget = (id: string) => {
    switch (id) {
      case "attendance":
        return (
          <div className="space-y-6">
            <div className="space-y-2.5 text-center py-2 flex flex-col items-center justify-center">
              <div className="w-16 h-16 rounded-full bg-primary/10 text-primary border border-border overflow-hidden flex items-center justify-center mb-1">
                {profile.photo ? (
                  <img src={profile.photo} alt="Avatar" className="w-full h-full object-cover" />
                ) : (
                  <span className="text-xl font-bold uppercase">{profile.fullName ? profile.fullName[0] : 'E'}</span>
                )}
              </div>
              <h3 className="text-lg font-black text-foreground">Welcome, {profile.fullName}!</h3>
              <p className="text-xs font-mono font-bold text-muted-foreground">
                Employee ID: {profile.id}
              </p>
              <div className="inline-flex items-center justify-center px-4 py-1.5 rounded-xl text-[10px] font-extrabold uppercase tracking-wider bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/25 shadow-sm transition-all duration-300 hover:bg-indigo-500/20 hover:scale-105 select-none cursor-default font-sans">
                {profile.designation}
              </div>
              <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">
                {profile.department}
              </span>
            </div>

            <div className="bg-secondary/45 border border-border p-5 rounded-xl text-center space-y-2">
              <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider block">
                Shift Duration Today
              </span>
              <div className="text-3xl font-extrabold text-foreground font-mono leading-none tracking-tight">
                {isClockedIn ? formatTimer(todayWorkSeconds) : (todayRecord?.workHours || "00:00:00")}
              </div>
              {isClockedIn && clockInTime ? (
                <span className="text-[9px] text-muted-foreground block mt-0.5">
                  Shift started at {new Date(clockInTime).toLocaleTimeString()}
                </span>
              ) : todayRecord ? (
                <span className="text-[9px] text-muted-foreground block mt-0.5">
                  Shift In: {todayRecord.checkIn} | Out: {todayRecord.checkOut}
                </span>
              ) : null}
            </div>

            <div className="w-full">
              {!isClockedIn ? (
                <Button
                  onClick={clockIn}
                  icon={<Play className="h-4 w-4 text-white" />}
                  className="btn-punch-in h-11 w-full text-white font-bold"
                >
                  Punch In
                </Button>
              ) : (
                <Button
                  onClick={clockOut}
                  icon={<LogOut className="h-4 w-4 text-white" />}
                  className="btn-punch-out h-11 w-full text-white font-bold"
                >
                  Punch Out
                </Button>
              )}
            </div>

            <div className="text-center text-[10px] text-muted-foreground pt-4 border-t border-border flex justify-between">
              <span>Code: <strong>{profile.id}</strong></span>
              <span>Target: <strong>8.0 hrs</strong></span>
            </div>
          </div>
        );

      case "leave":
        return (
          <div className="space-y-5">
            <div className="grid grid-cols-2 gap-4">
              <div className="p-3 bg-secondary/35 rounded-xl border border-border flex flex-col justify-between">
                <span className="text-[9px] text-muted-foreground uppercase font-bold">Available Balance</span>
                <span className="text-xl font-extrabold text-foreground mt-1">{availableLeaves} Days</span>
              </div>
              <div className="p-3 bg-secondary/35 rounded-xl border border-border flex flex-col justify-between">
                <span className="text-[9px] text-muted-foreground uppercase font-bold">Pending Requests</span>
                <span className="text-xl font-extrabold text-foreground mt-1">{pendingRequests} Requests</span>
              </div>
            </div>

            <div className="bg-secondary/45 border border-border p-4 rounded-xl flex justify-between items-center text-xs">
              <div className="space-y-0.5">
                <span className="text-[9px] text-muted-foreground uppercase font-bold block">Next Holiday</span>
                <span className="font-bold text-foreground block">Independence Day</span>
              </div>
              <div className="text-right">
                <span className="font-bold font-mono block text-primary">July 04, 2026</span>
                <span className="text-[9px] text-muted-foreground block">Saturday</span>
              </div>
            </div>

            <Button
              variant="primary"
              onClick={handleQuickApply}
              className="w-full h-11 font-bold text-xs rounded-xl cursor-pointer"
            >
              Quick Apply Leave
            </Button>

            <div className="text-center text-[10px] text-muted-foreground pt-4 border-t border-border flex justify-between">
              <span>Comp Off: <strong>{leaveBalances.compOff} days</strong></span>
              <span>Casual: <strong>{leaveBalances.casual} days</strong></span>
            </div>
          </div>
        );

      case "tasks":
        return (
          <div className="space-y-4">
            {/* Task Add Form */}
            <form onSubmit={handleAddTask} className="flex gap-2">
              <input
                type="text"
                value={newTaskText}
                onChange={(e) => setNewTaskText(e.target.value)}
                placeholder="Add checklist task..."
                className="flex-1 px-3 py-1.5 text-xs rounded-lg border border-border bg-secondary/35 text-foreground focus:outline-none focus:border-primary"
              />
              <Button type="submit" size="sm" icon={<Plus className="h-3.5 w-3.5" />} className="h-8 font-semibold text-xs">
                Add
              </Button>
            </form>

            {/* Task List items */}
            <div className="space-y-2.5 max-h-[165px] overflow-y-auto pr-1">
              {tasks.length > 0 ? (
                tasks.map((task) => (
                  <div
                    key={task.id}
                    className={cn(
                      "flex items-center justify-between p-2.5 rounded-lg border border-border/60 text-xs transition-colors",
                      task.completed ? "bg-secondary/15 text-muted-foreground line-through" : "bg-card text-foreground"
                    )}
                  >
                    <div className="flex items-center gap-2.5 min-w-0 flex-1">
                      <button
                        type="button"
                        onClick={() => handleToggleTask(task.id)}
                        className="text-muted-foreground hover:text-primary transition-colors cursor-pointer shrink-0"
                      >
                        {task.completed ? (
                          <CheckSquare className="h-4.5 w-4.5 text-primary" />
                        ) : (
                          <Square className="h-4.5 w-4.5" />
                        )}
                      </button>

                      {editingTaskId === task.id ? (
                        <input
                          type="text"
                          value={editingTaskText}
                          onChange={(e) => setEditingTaskText(e.target.value)}
                          onBlur={() => handleSaveTaskEdit(task.id)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") handleSaveTaskEdit(task.id);
                            if (e.key === "Escape") setEditingTaskId(null);
                          }}
                          autoFocus
                          className="flex-1 bg-transparent border-b border-primary outline-none py-0.5 text-xs font-medium"
                        />
                      ) : (
                        <span
                          className="truncate cursor-pointer flex-1 font-medium"
                          onDoubleClick={() => handleStartEditTask(task)}
                        >
                          {task.text}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-1 shrink-0 pl-2">
                      <button
                        type="button"
                        onClick={() => handleStartEditTask(task)}
                        className="p-1 hover:bg-secondary/40 rounded text-muted-foreground hover:text-foreground cursor-pointer"
                      >
                        <Edit2 className="h-3 w-3" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteTask(task.id)}
                        className="p-1 hover:bg-rose-500/10 rounded text-muted-foreground hover:text-rose-500 cursor-pointer"
                      >
                        <Trash2 className="h-3 w-3" />
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-muted-foreground text-[11px]">
                  All tasks completed! Log checklist entries.
                </div>
              )}
            </div>
          </div>
        );

      case "lms":
        return (
          <div className="space-y-4">
            {ongoingCourse ? (
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 bg-primary/10 rounded-lg text-primary flex items-center justify-center shrink-0">
                    <GraduationCap className="h-5 w-5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <span className="text-[10px] text-primary font-bold uppercase tracking-wider block">
                      Enrolled Syllabus
                    </span>
                    <h4 className="font-bold text-foreground text-xs truncate mt-0.5">{ongoingCourse.title}</h4>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <div className="flex justify-between text-[10px] font-bold text-muted-foreground">
                    <span>Course Completion</span>
                    <span className="font-mono text-foreground">{ongoingCourse.progress}%</span>
                  </div>
                  <div className="w-full bg-secondary rounded-full h-1.5 overflow-hidden">
                    <div
                      className="bg-primary h-1.5 rounded-full transition-all duration-300"
                      style={{ width: `${ongoingCourse.progress}%` }}
                    />
                  </div>
                </div>

                <div className="flex gap-2 pt-2">
                  <Button
                    variant="primary"
                    onClick={handleNavigateLMS}
                    icon={<BookOpen className="h-4 w-4" />}
                    className="w-full h-10 font-bold text-xs rounded-xl"
                  >
                    Continue Learning
                  </Button>
                </div>
              </div>
            ) : (
              <div className="text-center py-10 text-muted-foreground text-xs">
                No active courses. Visit the LMS portal to browse chapters.
              </div>
            )}
          </div>
        );

      case "news":
        return (
          <div className="space-y-4">
            <div className="space-y-3 max-h-[195px] overflow-y-auto pr-1">
              {announcements && announcements.length > 0 ? (
                announcements.slice(0, 3).map((ann) => (
                  <div
                    key={ann.id}
                    className="p-2.5 rounded-lg border border-border bg-secondary/15 space-y-1 text-xs"
                  >
                    <div className="flex justify-between items-center">
                      <span className="text-[9px] text-primary uppercase font-bold font-mono tracking-wide">
                        {ann.type || 'Notice'}
                      </span>
                      <span className="text-[8px] text-muted-foreground">{ann.date}</span>
                    </div>
                    <h5 className="font-bold text-foreground leading-normal line-clamp-1">{ann.title}</h5>
                    <p className="text-[10px] text-muted-foreground line-clamp-2 leading-normal">{ann.content}</p>
                    {ann.authorName && (
                      <span className="text-[8px] text-muted-foreground block pt-0.5">By {ann.authorName}</span>
                    )}
                  </div>
                ))
              ) : (
                <div className="text-center py-10 text-muted-foreground text-[11px]">
                  No recent announcements.
                </div>
              )}
            </div>
          </div>
        );

      case "meetings":
        return (
          <div className="space-y-4">
            <div className="space-y-3 max-h-[195px] overflow-y-auto pr-1">
              {meetings && meetings.length > 0 ? (
                meetings.slice(0, 3).map((meeting) => (
                  <div
                    key={meeting.id}
                    className="p-3.5 rounded-xl border border-border bg-secondary/15 hover:bg-secondary/25 transition-all space-y-2 flex flex-col"
                  >
                    <div className="flex justify-between items-start gap-2">
                      <h4 className="font-bold text-xs text-foreground leading-snug truncate flex-1">
                        {meeting.title}
                      </h4>
                      <Badge variant={meeting.platform === 'Google Meet' ? 'info' : 'warning'} className="text-[8px] font-extrabold uppercase shrink-0 py-0 px-1.5 h-4.5">
                        {meeting.platform}
                      </Badge>
                    </div>
                    <p className="text-[10px] text-muted-foreground line-clamp-1 leading-normal">
                      {meeting.agenda}
                    </p>
                    <div className="flex justify-between items-center pt-1 text-[9px] text-muted-foreground font-mono">
                      <span>{meeting.date} at {meeting.time}</span>
                      {meeting.link && (
                        <a
                          href={meeting.link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-primary hover:underline font-bold inline-flex items-center gap-0.5 shrink-0"
                        >
                          Join Sync
                        </a>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-10 text-muted-foreground text-[11px]">
                  No upcoming meetings scheduled.
                </div>
              )}
            </div>
          </div>
        );

      case "payroll":
        const latestPayslip = payslips && payslips[0];
        return (
          <div className="space-y-5">
            {latestPayslip ? (
              <div className="space-y-4">
                <div className="p-3 bg-secondary/35 rounded-xl border border-border flex justify-between items-center text-xs">
                  <div>
                    <span className="text-[9px] text-muted-foreground uppercase font-bold block">Latest Payslip Month</span>
                    <span className="font-bold text-foreground block text-xs mt-1">{latestPayslip.month} {latestPayslip.year}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-[9px] text-muted-foreground uppercase font-bold block">Net Salary Paid</span>
                    <span className="font-extrabold text-emerald-500 block text-xs mt-1">${latestPayslip.netSalary.toLocaleString()}</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 text-xs">
                  <div className="p-2.5 bg-secondary/20 rounded-lg border border-border/60">
                    <span className="text-[9px] text-muted-foreground uppercase font-bold block">Deductions</span>
                    <span className="font-bold text-foreground block mt-0.5">${latestPayslip.deductions.toLocaleString()}</span>
                  </div>
                  <div className="p-2.5 bg-secondary/20 rounded-lg border border-border/60">
                    <span className="text-[9px] text-muted-foreground uppercase font-bold block">Reimbursements</span>
                    <span className="font-bold text-foreground block mt-0.5">${latestPayslip.reimbursement.toLocaleString()}</span>
                  </div>
                </div>

                <Button
                  variant="primary"
                  onClick={() => setActiveTab("payroll")}
                  icon={<FileText className="h-4 w-4" />}
                  className="w-full h-11 font-bold text-xs rounded-xl cursor-pointer"
                >
                  View All Payslips
                </Button>
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground text-xs">
                No payroll details available.
              </div>
            )}
          </div>
        );

      default:
        return null;
    }
  };

  const getIcon = (id: string) => {
    switch (id) {
      case "attendance":
        return <Clock className="h-4.5 w-4.5 text-primary" />;
      case "leave":
        return <Calendar className="h-4.5 w-4.5 text-primary" />;
      case "tasks":
        return <CheckSquare className="h-4.5 w-4.5 text-primary" />;
      case "lms":
        return <GraduationCap className="h-4.5 w-4.5 text-primary" />;
      case "news":
        return <Bell className="h-4.5 w-4.5 text-primary" />;
      case "meetings":
        return <Video className="h-4.5 w-4.5 text-primary" />;
      case "payroll":
        return <FileText className="h-4.5 w-4.5 text-primary" />;
      default:
        return <LayoutGrid className="h-4.5 w-4.5 text-primary" />;
    }
  };

  // Render visible sections in grid
  const visibleOrder = sectionOrder.filter((id) => sectionVisibility[id]);

  return (
    <div className="space-y-6">
      
      {/* RENDER DYNAMIC DRAG-AND-DROP GRID */}
      {visibleOrder.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start pb-4 md:pb-0">
          {visibleOrder.map((id) => {
            const isDragging = draggedId === id;
            const isOver = dragOverId === id;

            return (
              <div
                key={id}
                draggable={isEditMode}
                onDragStart={(e) => handleDragStart(e, id)}
                onDragOver={(e) => handleDragOver(e, id)}
                onDrop={(e) => handleDrop(e, id)}
                onDragEnd={handleDragEnd}
                className={cn(
                  "w-full transition-all duration-200 select-none",
                  id === "attendance" && "md:col-span-2",
                  isDragging && "opacity-40 scale-95 border-dashed border-2 border-primary rounded-xl",
                  isOver && "border-2 border-dashed border-primary bg-primary/5 rounded-xl scale-[1.01]"
                )}
              >
                <Card
                  className={cn(
                    "p-6 border border-border bg-card/65 shadow-xl glass-panel relative space-y-5",
                    isEditMode && "border-primary/30 ring-1 ring-primary/10"
                  )}
                >
                  {/* Header Title Section */}
                  <div className="flex justify-between items-center pb-3.5 border-b border-border/70">
                    <div className="flex items-center gap-2 min-w-0 flex-1">
                      {/* Drag Handle */}
                      {isEditMode && (
                        <div className="cursor-grab active:cursor-grabbing p-1 text-muted-foreground hover:text-foreground shrink-0 select-none">
                          <GripVertical className="h-4.5 w-4.5 text-primary" />
                        </div>
                      )}

                      <div className="p-1.5 rounded-lg bg-primary/10 text-primary shrink-0">
                        {getIcon(id)}
                      </div>

                      {editingTitleId === id ? (
                        <div className="flex items-center gap-1.5 min-w-0 flex-1 pr-4">
                          <input
                            type="text"
                            value={tempTitle}
                            onChange={(e) => setTempTitle(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === "Enter") handleSaveTitle(id);
                              if (e.key === "Escape") setEditingTitleId(null);
                            }}
                            autoFocus
                            className="w-full px-2 py-0.5 text-xs font-bold rounded border border-primary bg-secondary/50 text-foreground outline-none"
                          />
                          <button
                            onClick={() => handleSaveTitle(id)}
                            className="p-1 text-emerald-500 hover:bg-emerald-500/10 rounded cursor-pointer shrink-0"
                          >
                            <Check className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      ) : (
                        <div className="min-w-0 flex-1 flex items-center gap-1.5">
                          <h2 className="text-sm font-extrabold text-foreground truncate select-none">
                            {sectionTitles[id]}
                          </h2>
                          {isEditMode && (
                            <button
                              onClick={() => {
                                setEditingTitleId(id);
                                setTempTitle(sectionTitles[id]);
                              }}
                              className="p-1 rounded text-muted-foreground hover:text-foreground hover:bg-secondary/40 cursor-pointer"
                            >
                              <Edit2 className="h-3 w-3" />
                            </button>
                          )}
                        </div>
                      )}
                    </div>

                    <div className="flex items-center gap-1 shrink-0">
                      {isEditMode && (
                        <button
                          onClick={() => handleToggleVisibility(id)}
                          className="p-1 rounded text-muted-foreground hover:text-rose-500 cursor-pointer"
                          title="Hide Widget"
                        >
                          <EyeOff className="h-4 w-4" />
                        </button>
                      )}
                      {id === "attendance" && (
                        <Badge variant={isClockedIn ? "success" : "neutral"} className="text-[9px]">
                          {isClockedIn ? "In Shift" : "Out"}
                        </Badge>
                      )}
                      {id === "leave" && (
                        <Badge variant="info" className="text-[9px]">
                          Leaves
                        </Badge>
                      )}
                      {id === "tasks" && (
                        <Badge variant="neutral" className="text-[9px] font-mono">
                          {tasks.filter((t) => !t.completed).length} Pending
                        </Badge>
                      )}
                      {id === "lms" && (
                        <Badge variant="warning" className="text-[9px]">
                          LMS
                        </Badge>
                      )}
                      {id === "news" && (
                        <Badge variant="info" className="text-[9px]">
                          Feed
                        </Badge>
                      )}
                      {id === "payroll" && (
                        <Badge variant="success" className="text-[9px]">
                          Payslip
                        </Badge>
                      )}
                    </div>
                  </div>

                  {/* Widget Body */}
                  <div className="pt-1.5">{renderWidget(id)}</div>
                </Card>
              </div>
            );
          })}
        </div>
      ) : (
        <Card className="p-8 text-center border border-dashed border-border bg-card/50 flex flex-col items-center justify-center space-y-3">
          <Info className="h-8 w-8 text-muted-foreground" />
          <h4 className="text-xs font-bold text-foreground">No widgets visible on dashboard</h4>
          <p className="text-[10px] text-muted-foreground max-w-xs leading-normal">
            You have hidden all modules. Click "Customize Layout" and check widgets in the panel to restore.
          </p>
          <Button variant="outline" size="sm" onClick={handleResetLayout} className="text-xs">
            Reset Default Layout
          </Button>
        </Card>
      )}

      {/* Edit Mode Customizer Panel */}
      {isEditMode && (
        <Card className="p-4 border border-border/80 bg-secondary/10 space-y-3 animate-fadeIn">
          <div className="flex items-center gap-1.5 text-xs font-bold text-foreground pb-2 border-b border-border/50">
            <Info className="h-4 w-4 text-primary shrink-0" /> Configured Widgets Visibility Panel
          </div>
          <div className="flex flex-wrap gap-4 pt-1.5">
            {sectionOrder.map((id) => (
              <label key={id} className="flex items-center gap-2 text-xs font-semibold cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={sectionVisibility[id]}
                  onChange={() => handleToggleVisibility(id)}
                  className="rounded border-border text-primary focus:ring-primary h-3.5 w-3.5"
                />
                <span className="text-foreground capitalize">{sectionTitles[id]}</span>
              </label>
            ))}
          </div>
        </Card>
      )}

      {/* Bottom Customizer Actions Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-xl border border-border bg-card shadow-xs print:hidden select-none">
        <div className="flex items-center gap-2">
          <LayoutGrid className="h-5 w-5 text-primary" />
          <div>
            <h3 className="text-xs font-bold text-foreground">Interactive Dashboard Layout</h3>
            <p className="text-[10px] text-muted-foreground mt-0.5">
              Drag widgets to reorder, edit titles inline, or toggle screen visibility.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {showSavedToast && (
            <span className="text-[10px] font-bold text-emerald-500 flex items-center gap-1 bg-emerald-500/10 px-2 py-1 rounded-md border border-emerald-500/20 animate-fadeIn">
              <Check className="h-3 w-3" /> Layout Saved
            </span>
          )}
          
          {isEditMode && (
            <Button
              variant="outline"
              size="sm"
              icon={<RotateCcw className="h-3.5 w-3.5" />}
              onClick={handleResetLayout}
              className="text-[10px] h-8 px-2.5 font-bold"
            >
              Reset Default
            </Button>
          )}

          <Button
            variant={isEditMode ? "primary" : "secondary"}
            size="sm"
            onClick={() => {
              setIsEditMode(!isEditMode);
              setEditingTitleId(null);
            }}
            className="text-[10px] h-8 px-3.5 font-bold shadow-xs transition-all"
          >
            {isEditMode ? "Exit Customizer" : "Customize Layout"}
          </Button>
        </div>
      </div>

    </div>
  );
};
