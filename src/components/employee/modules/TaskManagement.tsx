"use client";

import React, { useState, useEffect } from "react";
import { Card, Button, Badge } from "../UI";
import { 
  ClipboardList, CheckCircle2, Play, AlertCircle, XCircle, Search, 
  Calendar, User, Clock
} from "lucide-react";
import { api } from "../../../services/api";

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

export const TaskManagement: React.FC = () => {
  const [tasks, setTasks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");

  const loadTasks = async () => {
    try {
      const data = await api.getEmployeeTasks();
      setTasks(data || []);
    } catch (err) {
      console.error("Error loading employee tasks:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTasks();
    const interval = setInterval(loadTasks, 8000);
    return () => clearInterval(interval);
  }, []);

  const handleStatusChange = async (taskId: string, newStatus: string) => {
    try {
      await api.updateEmployeeTaskStatus(taskId, newStatus);
      setTasks(prev => prev.map(t => t.id === taskId ? { ...t, status: newStatus } : t));
    } catch (err) {
      alert("Failed to update task status");
    }
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case "High":
        return <Badge variant="danger">High Priority</Badge>;
      case "Medium":
        return <Badge variant="warning">Medium</Badge>;
      default:
        return <Badge variant="success">Low</Badge>;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "Completed":
        return <CheckCircle2 className="h-4.5 w-4.5 text-emerald-500" />;
      case "In Progress":
        return <Play className="h-4.5 w-4.5 text-blue-500 animate-pulse" />;
      case "Blocked":
        return <AlertCircle className="h-4.5 w-4.5 text-rose-500" />;
      case "Cancelled":
        return <XCircle className="h-4.5 w-4.5 text-gray-400" />;
      default:
        return <ClipboardList className="h-4.5 w-4.5 text-indigo-500" />;
    }
  };

  const filteredTasks = tasks.filter(t => {
    const matchesSearch = t.title.toLowerCase().includes(search.toLowerCase()) || 
                          t.description.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === "All" || t.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      
      {/* Overview Header Banner */}
      <div className="p-5 bg-gradient-to-r from-primary/10 via-primary/5 to-transparent rounded-2xl border border-primary/10 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h3 className="text-sm font-bold text-foreground flex items-center gap-1.5">
            <ClipboardList className="h-4.5 w-4.5 text-primary" /> Assigned Tasks & Actions
          </h3>
          <p className="text-[11px] text-muted-foreground mt-0.5">
            Track, update, and manage progress of tasks assigned to you by your reporting manager
          </p>
        </div>
        <div className="flex gap-2 text-xs">
          <span className="bg-card/65 px-3 py-1.5 rounded-lg border border-border">
            Pending: <strong>{tasks.filter(t => t.status !== "Completed").length}</strong>
          </span>
          <span className="bg-emerald-500/10 text-emerald-500 px-3 py-1.5 rounded-lg border border-emerald-500/20">
            Completed: <strong>{tasks.filter(t => t.status === "Completed").length}</strong>
          </span>
        </div>
      </div>

      {/* Filters & Actions Bar */}
      <div className="flex flex-col sm:flex-row gap-3 justify-between items-center bg-card/45 p-4 rounded-xl border border-border">
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search tasks..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs rounded-lg border border-border bg-secondary/50 text-foreground focus:outline-none focus:border-primary"
          />
        </div>

        <div className="flex gap-2 w-full sm:w-auto">
          {["All", "Todo", "In Progress", "Completed", "Blocked"].map(status => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                statusFilter === status 
                  ? "bg-primary text-primary-foreground" 
                  : "bg-secondary/40 text-muted-foreground hover:bg-secondary/70 border border-border"
              }`}
            >
              {status}
            </button>
          ))}
        </div>
      </div>

      {/* Task Cards Grid */}
      {loading ? (
        <div className="text-center py-12 text-xs text-muted-foreground">Loading tasks...</div>
      ) : filteredTasks.length === 0 ? (
        <div className="text-center py-12 text-xs text-muted-foreground bg-card/35 rounded-xl border border-border border-dashed">
          No tasks found matching current filters.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredTasks.map(task => (
            <Card key={task.id} className="p-5 flex flex-col gap-4 border border-border hover:border-primary/20 transition-all">
              <div className="flex justify-between items-start">
                <div className="space-y-1">
                  <span className="text-[10px] font-bold text-primary font-mono block uppercase">{task.id}</span>
                  <h4 className="text-xs font-bold text-foreground flex items-center gap-1.5">
                    {getStatusIcon(task.status)} {task.title}
                  </h4>
                </div>
                {getPriorityBadge(task.priority)}
              </div>

              <p className="text-[11px] text-muted-foreground leading-relaxed bg-secondary/20 p-3 rounded-lg border border-border/60">
                {task.description}
              </p>

              {task.attachments && (
                <div className="relative rounded-lg overflow-hidden border border-border/60 max-h-48 bg-secondary/10 flex items-center justify-center">
                  <img src={task.attachments} alt="Task photo" className="object-contain max-h-48 w-full" />
                </div>
              )}

              {/* Attributes line */}
              <div className="flex flex-wrap gap-x-4 gap-y-2 text-[10px] text-muted-foreground border-t border-border pt-3">
                <span className="flex items-center gap-1">
                  <User className="h-3.5 w-3.5 text-primary" /> Assigned by: <strong>{task.createdByName}</strong>
                </span>
                <span className="flex items-center gap-1 font-mono">
                  <Calendar className="h-3.5 w-3.5 text-primary" /> Deadline: <strong>{task.deadline}</strong>
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="h-3.5 w-3.5 text-primary" /> Status: <strong>{task.status}</strong>
                </span>
              </div>

              {/* Status Update Actions & Upload */}
              <div className="flex flex-wrap gap-2 pt-2 border-t border-border/40 justify-between items-center">
                <div className="relative">
                  <input
                    type="file"
                    accept="image/*"
                    id={`file-task-${task.id}`}
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        const reader = new FileReader();
                        reader.onloadend = async () => {
                          if (typeof reader.result === 'string') {
                            try {
                              const compressed = await compressImage(reader.result);
                              await api.updateEmployeeTask(task.id, { attachments: compressed });
                              setTasks(prev => prev.map(t => t.id === task.id ? { ...t, attachments: compressed } : t));
                              alert("Task photo uploaded successfully!");
                            } catch (err) {
                              alert("Failed to upload task photo");
                            }
                          }
                        };
                        reader.readAsDataURL(file);
                      }
                    }}
                  />
                  <label htmlFor={`file-task-${task.id}`} className="px-2.5 py-1.5 border border-dashed border-border rounded-lg bg-secondary/20 hover:bg-secondary/40 text-[10px] text-muted-foreground cursor-pointer flex items-center gap-1">
                    <span>📷 Upload Photo</span>
                  </label>
                </div>

                <div className="flex gap-2">
                  {task.status !== "In Progress" && task.status !== "Completed" && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleStatusChange(task.id, "In Progress")}
                    >
                      Start Work
                    </Button>
                  )}
                  {task.status !== "Completed" && (
                    <Button
                      size="sm"
                      variant="primary"
                      onClick={() => handleStatusChange(task.id, "Completed")}
                    >
                      Mark Done
                    </Button>
                  )}
                  {task.status !== "Blocked" && task.status !== "Completed" && (
                    <Button
                      size="sm"
                      variant="danger"
                      onClick={() => handleStatusChange(task.id, "Blocked")}
                    >
                      Report Blocked
                    </Button>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

    </div>
  );
};
