import React, { useState, useEffect } from 'react';
import { 
  Search, Bot, Sparkles, Bell, MessageSquare, 
  ChevronDown, Sun, Moon, PlusCircle, CheckSquare, 
  FileText, Calendar, ShieldCheck, Menu
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function Header({ 
  searchQuery, 
  setSearchQuery, 
  toggleAiAssistant, 
  activeTab,
  setActiveTab,
  darkMode,
  setDarkMode,
  quickActions,
  notifications,
  onMarkNotificationRead,
  onMarkAllNotificationsRead,
  messages,
  userProfile,
  onToggleMobileSidebar
}) {
  const [showNotifications, setShowNotifications] = useState(false);
  const [showMessages, setShowMessages] = useState(false);
  const [showQuickActions, setShowQuickActions] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const media = window.matchMedia('(max-width: 768px)');
    setIsMobile(media.matches);
    const listener = (e) => setIsMobile(e.matches);
    media.addEventListener('change', listener);
    return () => media.removeEventListener('change', listener);
  }, []);

  return (
    <header style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '16px 24px',
      background: 'var(--glass-bg)',
      backdropFilter: 'blur(20px)',
      WebkitBackdropFilter: 'blur(20px)',
      border: '1px solid var(--color-border)',
      borderRadius: 20,
      boxShadow: 'var(--glass-shadow)',
      marginBottom: 24,
      position: 'relative',
      zIndex: 40
    }}>
      {/* Page Title & Search Bar */}
      <div style={{ display: 'flex', alignItems: 'center', gap: isMobile ? 12 : 24, flex: 1, minWidth: 0 }}>
        {isMobile && (
          <button
            onClick={onToggleMobileSidebar}
            style={{
              background: 'transparent',
              border: 'none',
              color: 'var(--color-text-primary)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: 4,
              flexShrink: 0
            }}
          >
            <Menu size={24} />
          </button>
        )}

        <motion.h1 
          key={activeTab}
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          style={{ 
            fontSize: isMobile ? '18px' : '28px', 
            fontWeight: 800,
            textTransform: 'capitalize',
            background: 'linear-gradient(90deg, #4F46E5 0%, #06B6D4 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            minWidth: isMobile ? 'auto' : 140,
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            margin: 0
          }}
        >
          {activeTab === 'leave' ? 'Leaves' : activeTab === 'settings' ? 'Settings' : activeTab}
        </motion.h1>

        {/* Premium Stripe/Apple style Search Bar */}
        {!isMobile && (
          <div style={{ 
            position: 'relative', 
            width: '100%', 
            maxWidth: 260,
            minWidth: 140,
            display: 'flex',
            alignItems: 'center',
            flex: 1
          }}>
            <Search size={16} style={{ 
              position: 'absolute', 
              left: 14, 
              color: 'var(--color-text-tertiary)',
              pointerEvents: 'none'
            }} />
            <input
              type="text"
              placeholder="Search employees, reports..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                width: '100%',
                padding: '10px 16px 10px 40px',
                borderRadius: 12,
                border: '1px solid rgba(226, 232, 240, 0.8)',
                background: 'rgba(255, 255, 255, 0.8)',
                fontSize: '0.85rem',
                color: 'var(--color-text-primary)',
                transition: 'all 0.2s ease',
                outline: 'none',
              }}
              onFocus={(e) => {
                e.target.style.borderColor = 'var(--color-primary)';
                e.target.style.boxShadow = '0 0 0 3px rgba(79, 70, 229, 0.15)';
                e.target.style.background = 'white';
              }}
              onBlur={(e) => {
                e.target.style.borderColor = 'rgba(226, 232, 240, 0.8)';
                e.target.style.boxShadow = 'none';
                e.target.style.background = 'rgba(255, 255, 255, 0.8)';
              }}
            />
          </div>
        )}
      </div>

      {/* Header Actions Menu */}
      <div style={{ display: 'flex', alignItems: 'center', gap: isMobile ? 8 : 14, flexShrink: 0 }}>
        
        {/* AI Assistant Button */}
        {!isMobile && (
          <motion.button
            onClick={toggleAiAssistant}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              background: 'linear-gradient(135deg, rgba(79, 70, 229, 0.1) 0%, rgba(6, 182, 212, 0.1) 100%)',
              border: '1px solid rgba(79, 70, 229, 0.2)',
              padding: '8px 14px',
              borderRadius: 12,
              color: 'var(--color-primary)',
              fontSize: '0.85rem',
              fontWeight: 700,
              cursor: 'pointer',
              boxShadow: '0 4px 15px rgba(79, 70, 229, 0.05)'
            }}
          >
            <Bot size={16} />
            <span>Ask AI</span>
            <Sparkles size={12} style={{ color: 'var(--color-accent)' }} />
          </motion.button>
        )}

        {/* Quick Actions Dropdown */}
        {!isMobile && (
          <div style={{ position: 'relative' }}>
            <button 
              onClick={() => setShowQuickActions(!showQuickActions)}
              className="premium-btn premium-btn-secondary"
              style={{ padding: '8px 14px', display: 'flex', gap: 6, alignItems: 'center' }}
            >
              <PlusCircle size={16} />
              <span>Actions</span>
              <ChevronDown size={14} />
            </button>
            
            <AnimatePresence>
              {showQuickActions && (
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  style={{
                    position: 'absolute',
                    right: 0,
                    top: '110%',
                    width: 200,
                    background: 'white',
                    borderRadius: 12,
                    boxShadow: '0 10px 25px rgba(0,0,0,0.08)',
                    border: '1px solid rgba(226, 232, 240, 0.8)',
                    padding: 8,
                    zIndex: 100,
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 4
                  }}
                >
                  <button 
                    onClick={() => { setActiveTab('employees'); setShowQuickActions(false); }}
                    style={{ display: 'flex', alignItems: 'center', gap: 10, padding: 10, border: 'none', background: 'transparent', width: '100%', textAlign: 'left', borderRadius: 8, cursor: 'pointer', fontSize: '0.85rem', fontWeight: 500, color: 'var(--color-text-primary)' }}
                    className="quick-action-item"
                  >
                    <PlusCircle size={14} style={{ color: 'var(--color-primary)' }} />
                    Add Employee
                  </button>
                  <button 
                    onClick={() => { setActiveTab('leave'); setShowQuickActions(false); }}
                    style={{ display: 'flex', alignItems: 'center', gap: 10, padding: 10, border: 'none', background: 'transparent', width: '100%', textAlign: 'left', borderRadius: 8, cursor: 'pointer', fontSize: '0.85rem', fontWeight: 500, color: 'var(--color-text-primary)' }}
                    className="quick-action-item"
                  >
                    <CheckSquare size={14} style={{ color: 'var(--color-success)' }} />
                    Approve Leaves
                  </button>
                  <button 
                    onClick={() => { setActiveTab('payroll'); setShowQuickActions(false); }}
                    style={{ display: 'flex', alignItems: 'center', gap: 10, padding: 10, border: 'none', background: 'transparent', width: '100%', textAlign: 'left', borderRadius: 8, cursor: 'pointer', fontSize: '0.85rem', fontWeight: 500, color: 'var(--color-text-primary)' }}
                    className="quick-action-item"
                  >
                    <FileText size={14} style={{ color: 'var(--color-accent)' }} />
                    Process Payroll
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}

        {/* Notifications Icon with Dropdown */}
        <div style={{ position: 'relative' }}>
          <button 
            onClick={() => { setShowNotifications(!showNotifications); setShowMessages(false); setShowProfileMenu(false); }}
            style={{
              width: 38,
              height: 38,
              borderRadius: 10,
              border: '1px solid rgba(226, 232, 240, 0.8)',
              background: 'white',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              position: 'relative'
            }}
          >
            <Bell size={18} style={{ color: 'var(--color-text-secondary)' }} />
            {notifications && notifications.filter(n => !n.read).length > 0 && (
              <span style={{
                position: 'absolute',
                top: -2,
                right: -2,
                width: 8,
                height: 8,
                background: 'var(--color-danger)',
                borderRadius: '50%',
                border: '2px solid white'
              }} />
            )}
          </button>

          <AnimatePresence>
            {showNotifications && (
              <motion.div
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                style={{
                  position: 'absolute',
                  right: 0,
                  top: '110%',
                  width: 320,
                  background: 'white',
                  borderRadius: 16,
                  boxShadow: '0 10px 30px rgba(0,0,0,0.1)',
                  border: '1px solid rgba(226, 232, 240, 0.8)',
                  padding: 16,
                  zIndex: 100
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                  <span style={{ fontWeight: 700, fontSize: '0.9rem' }}>Notifications</span>
                  <span 
                    onClick={() => onMarkAllNotificationsRead && onMarkAllNotificationsRead()}
                    style={{ fontSize: '0.75rem', color: 'var(--color-primary)', cursor: 'pointer', fontWeight: 600 }}
                  >
                    Mark all as read
                  </span>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {notifications.length === 0 ? (
                    <div style={{ fontSize: '0.75rem', color: 'var(--color-text-tertiary)', textAlign: 'center', py: 10 }}>No new notifications</div>
                  ) : (
                    notifications.map((notif, index) => (
                      <div 
                        key={index} 
                        onClick={() => !notif.read && onMarkNotificationRead && onMarkNotificationRead(notif.id)}
                        style={{ 
                          display: 'flex', 
                          gap: 12, 
                          paddingBottom: 10, 
                          borderBottom: index < notifications.length - 1 ? '1px solid #F1F5F9' : 'none',
                          opacity: notif.read ? 0.5 : 1,
                          cursor: notif.read ? 'default' : 'pointer'
                        }}
                      >
                        <div style={{
                          width: 32,
                          height: 32,
                          borderRadius: 8,
                          background: notif.type === 'alert' ? 'var(--color-danger-light)' : 'var(--color-primary-light)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: notif.type === 'alert' ? 'var(--color-danger)' : 'var(--color-primary)',
                          flexShrink: 0
                        }}>
                          {notif.type === 'alert' ? <ShieldCheck size={14} /> : <Calendar size={14} />}
                        </div>
                        <div>
                          <div style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--color-text-primary)' }}>{notif.title}</div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)', marginTop: 2 }}>{notif.message}</div>
                          <div style={{ fontSize: '0.65rem', color: 'var(--color-text-tertiary)', marginTop: 4 }}>{notif.time}</div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Messages Dropdown */}
        <div style={{ position: 'relative' }}>
          <button 
            onClick={() => { setShowMessages(!showMessages); setShowNotifications(false); setShowProfileMenu(false); }}
            style={{
              width: 38,
              height: 38,
              borderRadius: 10,
              border: '1px solid rgba(226, 232, 240, 0.8)',
              background: 'white',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              position: 'relative'
            }}
          >
            <MessageSquare size={18} style={{ color: 'var(--color-text-secondary)' }} />
            {messages && messages.length > 0 && (
              <span style={{
                position: 'absolute',
                top: -2,
                right: -2,
                width: 8,
                height: 8,
                background: 'var(--color-accent)',
                borderRadius: '50%',
                border: '2px solid white'
              }} />
            )}
          </button>

          <AnimatePresence>
            {showMessages && (
              <motion.div
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                style={{
                  position: 'absolute',
                  right: 0,
                  top: '110%',
                  width: 300,
                  background: 'white',
                  borderRadius: 16,
                  boxShadow: '0 10px 30px rgba(0,0,0,0.1)',
                  border: '1px solid rgba(226, 232, 240, 0.8)',
                  padding: 16,
                  zIndex: 100
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                  <span style={{ fontWeight: 700, fontSize: '0.9rem' }}>Messages</span>
                  <span style={{ fontSize: '0.75rem', color: 'var(--color-accent)', cursor: 'pointer', fontWeight: 600 }}>New Message</span>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {messages.map((msg, index) => (
                    <div key={index} style={{ display: 'flex', gap: 12, paddingBottom: 10, borderBottom: index < messages.length - 1 ? '1px solid #F1F5F9' : 'none', cursor: 'pointer' }}>
                      <div style={{ width: 32, height: 32, borderRadius: '50%', background: '#E2E8F0', overflow: 'hidden', flexShrink: 0 }}>
                        <img src={msg.avatar} alt={msg.sender} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      </div>
                      <div>
                        <div style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--color-text-primary)' }}>{msg.sender}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)', marginTop: 2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: 180 }}>{msg.preview}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Theme Toggle (Mock action) */}
        <button
          onClick={() => setDarkMode(!darkMode)}
          style={{
            width: 38,
            height: 38,
            borderRadius: 10,
            border: '1px solid rgba(226, 232, 240, 0.8)',
            background: 'white',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer'
          }}
        >
          {darkMode ? <Sun size={18} style={{ color: 'var(--color-warning)' }} /> : <Moon size={18} style={{ color: 'var(--color-text-secondary)' }} />}
        </button>

        {/* Vertical Divider */}
        <div style={{ width: 1, height: 24, background: 'rgba(226, 232, 240, 0.8)' }} />

        {/* User Profile Menu */}
        <div style={{ position: 'relative' }}>
          <button
            onClick={() => { setShowProfileMenu(!showProfileMenu); setShowNotifications(false); setShowMessages(false); }}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              border: 'none',
              background: 'transparent',
              cursor: 'pointer',
              padding: 0
            }}
          >
            <div style={{ width: 36, height: 36, borderRadius: 10, background: '#4F46E5', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 14, overflow: 'hidden' }}>
              <img src={userProfile.avatar} alt="Admin profile" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            </div>
            <div style={{ textAlign: 'left', display: 'flex', flexDirection: 'column' }}>
              <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--color-text-primary)' }}>{userProfile.name}</div>
              <div style={{ fontSize: '0.7rem', color: 'var(--color-success)', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 4, marginTop: 1 }}>
                <ShieldCheck size={11} style={{ color: 'var(--color-success)' }} />
                <span>HR Super Admin</span>
              </div>
            </div>
            <ChevronDown size={14} style={{ color: 'var(--color-text-secondary)' }} />
          </button>

          <AnimatePresence>
            {showProfileMenu && (
              <motion.div
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                style={{
                  position: 'absolute',
                  right: 0,
                  top: '110%',
                  width: 180,
                  background: 'white',
                  borderRadius: 12,
                  boxShadow: '0 10px 25px rgba(0,0,0,0.08)',
                  border: '1px solid rgba(226, 232, 240, 0.8)',
                  padding: 8,
                  zIndex: 100,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 4
                }}
              >
                <button 
                  onClick={() => { setActiveTab('settings'); setShowProfileMenu(false); }}
                  style={{ display: 'flex', alignItems: 'center', gap: 10, padding: 10, border: 'none', background: 'transparent', width: '100%', textAlign: 'left', borderRadius: 8, cursor: 'pointer', fontSize: '0.85rem', color: 'var(--color-text-primary)' }}
                >
                  My Profile
                </button>
                <button 
                  onClick={() => { setActiveTab('security'); setShowProfileMenu(false); }}
                  style={{ display: 'flex', alignItems: 'center', gap: 10, padding: 10, border: 'none', background: 'transparent', width: '100%', textAlign: 'left', borderRadius: 8, cursor: 'pointer', fontSize: '0.85rem', color: 'var(--color-text-primary)' }}
                >
                  Security Settings
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </header>
  );
}
