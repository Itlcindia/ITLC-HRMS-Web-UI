"use client";

import React, { useState, useEffect, useRef } from "react";
import { useHRMS } from "./context/HRMSContext";
import {
  Bell,
  Sun,
  Moon,
  CheckCheck,
  Menu,
} from "lucide-react";
import { cn } from "./UI";

interface NavbarProps {
  onToggleMobileSidebar: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onToggleMobileSidebar }) => {
  const {
    notifications,
    markNotificationRead,
    markAllNotificationsRead,
    setActiveTab,
    settings,
    updateSettings,
    profile,
  } = useHRMS();

  const [showNotifications, setShowNotifications] = useState(false);

  const notificationRef = useRef<HTMLDivElement>(null);

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as Node;
      if (notificationRef.current && !notificationRef.current.contains(target)) {
        setShowNotifications(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Theme Toggler
  const toggleTheme = () => {
    const nextTheme = settings.theme === "dark" ? "light" : "dark";
    updateSettings({ theme: nextTheme });
  };

  const unreadNotifications = notifications.filter((n) => !n.read);



  return (
    <header className="h-16 border-b border-border bg-card/85 backdrop-blur-md sticky top-0 z-40 flex items-center justify-between px-4 md:px-6">
      
      <div className="flex items-center gap-2 min-w-0">
        {/* Hamburger Toggle Button */}
        <button
          onClick={onToggleMobileSidebar}
          className="p-2 rounded-lg hover:bg-secondary text-muted-foreground hover:text-foreground md:hidden cursor-pointer shrink-0"
          title="Toggle Navigation Menu"
        >
          <Menu className="h-5 w-5" />
        </button>
      </div>

      {/* Action Icons Panel */}
      <div className="flex items-center gap-4">
        
        {/* Notification Bell Dropdown */}
        <div className="relative" ref={notificationRef}>
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="p-2 rounded-lg hover:bg-secondary text-muted-foreground hover:text-foreground transition-all relative cursor-pointer"
          >
            <Bell className="h-5 w-5" />
            {unreadNotifications.length > 0 && (
              <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-destructive animate-pulse" />
            )}
          </button>

          {/* Dropdown Card */}
          {showNotifications && (
            <div className="fixed inset-x-4 top-16 md:absolute md:left-auto md:right-0 md:top-11 md:w-96 bg-card border border-border rounded-xl shadow-2xl overflow-hidden z-50">
              <div className="px-4 py-3 border-b border-border flex justify-between items-center">
                <span className="font-semibold text-sm">Notifications</span>
                {unreadNotifications.length > 0 && (
                  <button
                    onClick={markAllNotificationsRead}
                    className="text-xs text-primary hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <CheckCheck className="h-3 w-3" /> Mark all read
                  </button>
                )}
              </div>
              <div className="max-h-80 overflow-y-auto">
                {notifications.length > 0 ? (
                  <div className="divide-y divide-border">
                    {notifications.slice(0, 5).map((ntf) => (
                      <div
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
                          setShowNotifications(false);
                        }}
                        className={cn(
                          "p-4 hover:bg-secondary/40 cursor-pointer transition-colors text-left",
                          !ntf.read && "bg-primary/5"
                        )}
                      >
                        <div className="flex justify-between items-start gap-2">
                          <span className={cn("text-xs font-semibold", !ntf.read ? "text-foreground" : "text-muted-foreground")}>
                            {ntf.title}
                          </span>
                          <span className="text-[9px] text-muted-foreground whitespace-nowrap">{ntf.date}</span>
                        </div>
                        <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{ntf.message}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-8 text-center text-muted-foreground text-xs">
                    No notifications available
                  </div>
                )}
              </div>
              <div className="border-t border-border">
                <button
                  onClick={() => {
                    setActiveTab("notifications");
                    setShowNotifications(false);
                  }}
                  className="w-full text-center py-2.5 text-xs text-primary hover:bg-secondary font-medium transition-colors cursor-pointer"
                >
                  View All Notifications
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Profile Avatar */}
        <div 
          onClick={() => setActiveTab("profile")}
          className="w-8 h-8 rounded-full bg-primary/10 border border-border overflow-hidden flex items-center justify-center cursor-pointer hover:scale-105 transition-transform shrink-0"
          title="Go to My Profile"
        >
          {profile?.photo ? (
            <img src={profile.photo} alt="User Avatar" className="w-full h-full object-cover" />
          ) : (
            <span className="text-[10px] font-bold uppercase">{profile?.fullName ? profile.fullName[0] : 'E'}</span>
          )}
        </div>



      </div>
    </header>
  );
};
