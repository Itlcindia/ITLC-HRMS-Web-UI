"use client";

import React, { useState } from "react";
import { useHRMS, NotificationItem } from "../context/HRMSContext";
import { Card, Button, Badge, cn } from "../UI";
import {
  Bell,
  CheckCheck,
  Calendar,
  CreditCard,
  GraduationCap,
  ShieldCheck,
  Megaphone,
  LifeBuoy,
} from "lucide-react";

export const NotificationsCenter: React.FC = () => {
  const {
    notifications,
    markNotificationRead,
    markAllNotificationsRead,
    setActiveTab,
  } = useHRMS();

  // Selected filter category
  const [activeFilter, setActiveFilter] = useState<string>("All");

  const getIcon = (category: string) => {
    switch (category) {
      case "leave":
        return <Calendar className="h-4.5 w-4.5 text-indigo-500" />;
      case "payroll":
        return <CreditCard className="h-4.5 w-4.5 text-emerald-500" />;
      case "training":
        return <GraduationCap className="h-4.5 w-4.5 text-amber-500" />;
      case "policy":
        return <ShieldCheck className="h-4.5 w-4.5 text-rose-500" />;
      case "announcement":
        return <Megaphone className="h-4.5 w-4.5 text-blue-500" />;
      case "helpdesk":
        return <LifeBuoy className="h-4.5 w-4.5 text-orange-500" />;
      default:
        return <Bell className="h-4.5 w-4.5 text-primary" />;
    }
  };

  const getFilterBadgeCount = (filterName: string) => {
    if (filterName === "All") return notifications.length;
    if (filterName === "Unread") return notifications.filter((n) => !n.read).length;
    return notifications.filter((n) => n.category === filterName.toLowerCase()).length;
  };

  const filteredNotifications = notifications.filter((ntf) => {
    if (activeFilter === "All") return true;
    if (activeFilter === "Unread") return !ntf.read;
    return ntf.category === activeFilter.toLowerCase();
  });

  const filters = ["All", "Unread", "Leave", "Payroll", "Training", "Policy", "Announcement", "Helpdesk"];

  return (
    <div className="space-y-6">
      
      {/* Action Header bar */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center bg-card p-4 rounded-xl border border-border">
        <div>
          <h3 className="text-sm font-bold text-foreground">Notification Center</h3>
          <p className="text-[11px] text-muted-foreground mt-0.5">Manage policy notifications, training requests, leave updates, and payslips</p>
        </div>
        {notifications.filter(n => !n.read).length > 0 && (
          <Button
            variant="outline"
            size="sm"
            icon={<CheckCheck className="h-3.5 w-3.5" />}
            onClick={markAllNotificationsRead}
            className="text-xs font-semibold"
          >
            Mark all read
          </Button>
        )}
      </div>

      {/* Horizontal Filter Tabs */}
      <div className="flex flex-wrap gap-2 pb-2 border-b border-border">
        {filters.map((filter) => {
          const count = getFilterBadgeCount(filter);
          return (
            <button
              key={filter}
              onClick={() => setActiveFilter(filter)}
              className={cn(
                "flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all cursor-pointer",
                activeFilter === filter
                  ? "bg-primary text-primary-foreground border-primary"
                  : "bg-card text-muted-foreground border-border hover:bg-secondary/40 hover:text-foreground"
              )}
            >
              <span>{filter === "Leave" ? "Leaves" : filter === "Training" ? "LMS Trainings" : filter === "Policy" ? "Policies" : filter === "Announcement" ? "Announcements" : filter}</span>
              {count > 0 && (
                <span className={cn(
                  "px-1.5 py-0.5 rounded-full text-[9px] font-bold leading-none shrink-0",
                  activeFilter === filter ? "bg-card text-primary" : "bg-primary/20 text-primary"
                )}>
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Notification items list */}
      <div className="space-y-3 max-w-3xl">
        {filteredNotifications.length > 0 ? (
          filteredNotifications.map((ntf) => (
            <Card
              key={ntf.id}
              onClick={() => {
                markNotificationRead(ntf.id);
                if (ntf.link) {
                  window.open(ntf.link, '_blank');
                } else {
                  if (ntf.category === "leave") setActiveTab("leaves");
                  if (ntf.category === "payroll") setActiveTab("payroll");
                  if (ntf.category === "training") setActiveTab("training");
                  if (ntf.category === "helpdesk") setActiveTab("helpdesk");
                }
              }}
              className={cn(
                "p-4 border flex gap-4 cursor-pointer transition-all items-start text-xs",
                !ntf.read ? "border-primary bg-primary/5" : "border-border hover:bg-secondary/25"
              )}
              hover
            >
              {/* Category Icon */}
              <div className="p-2.5 rounded-xl bg-secondary/60 shrink-0 mt-0.5">
                {getIcon(ntf.category)}
              </div>

              {/* Title & message */}
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-baseline flex-wrap gap-2">
                  <h4 className={cn("font-bold", !ntf.read ? "text-foreground font-extrabold" : "text-foreground/80")}>
                    {ntf.title}
                  </h4>
                  <span className="text-[10px] text-muted-foreground shrink-0">{ntf.date}</span>
                </div>
                <p className="text-[11px] text-muted-foreground mt-1.5 leading-relaxed">{ntf.message}</p>
              </div>

              {/* Mark Read option */}
              {!ntf.read && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    markNotificationRead(ntf.id);
                  }}
                  className="text-[10px] text-primary hover:underline font-bold shrink-0 self-center cursor-pointer"
                >
                  Mark read
                </button>
              )}
            </Card>
          ))
        ) : (
          <div className="text-center py-12 border border-dashed border-border rounded-xl text-muted-foreground text-xs">
            No notifications found in this category.
          </div>
        )}
      </div>

    </div>
  );
};
