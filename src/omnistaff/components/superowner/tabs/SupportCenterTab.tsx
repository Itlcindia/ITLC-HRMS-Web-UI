import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  MessageSquare, Send, CheckCircle2, AlertTriangle, AlertCircle, 
  HelpCircle, User, Search, ExternalLink, LifeBuoy, X, BookOpen,
  Paperclip, Smile, Mic, MoreHorizontal
} from 'lucide-react';
import { useDashboard } from '../context/DashboardContext';
import { SupportTicket, TicketMessage } from '../types';
import { api } from '../../../services/api';

export const SupportCenterTab: React.FC = () => {
  const { tickets, setTickets, addToast, addLog } = useDashboard();
  const [selectedTicketId, setSelectedTicketId] = useState<string>(tickets[0]?.id || '');

  useEffect(() => {
    if (!selectedTicketId && tickets.length > 0) {
      setSelectedTicketId(tickets[0].id);
    }
  }, [tickets, selectedTicketId]);

  const [chatInput, setChatInput] = useState('');
  const [kbSearchQuery, setKbSearchQuery] = useState('');

  const chatEndRef = useRef<HTMLDivElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  const selectedTicket = tickets.find(t => t.id === selectedTicketId);

  // Auto scroll to chat bottom
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [selectedTicket?.messages]);

  // Responsive scroll to chat on ticket selection for mobile/tablet screen sizes
  useEffect(() => {
    if (selectedTicketId && window.innerWidth < 1024) {
      setTimeout(() => {
        chatContainerRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 100);
    }
  }, [selectedTicketId]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim() || !selectedTicketId) return;

    const newMsg: TicketMessage = {
      id: `msg_${Math.random().toString(36).substring(2, 9)}`,
      senderName: 'Priya Sharma',
      senderRole: 'Super Owner Support',
      content: chatInput,
      timestamp: new Date().toISOString(),
      isAgent: true
    };

    const targetTicket = tickets.find(t => t.id === selectedTicketId);
    if (!targetTicket) return;
    
    const updatedMessages = [...targetTicket.messages, newMsg];

    setTickets(prev => prev.map(t => {
      if (t.id === selectedTicketId) {
        return {
          ...t,
          status: 'pending', // mark pending user response
          messages: updatedMessages
        };
      }
      return t;
    }));

    try {
      await api.updateSuperOwnerTicket(selectedTicketId, {
        status: 'pending',
        messagesJson: JSON.stringify(updatedMessages)
      });
    } catch (e) {
      console.error('Failed to update ticket on server', e);
    }

    setChatInput('');
    addToast('Response sent to client admin', 'success');
  };

  const handleResolveTicket = async (id: string, subject: string) => {
    setTickets(prev => prev.map(t => t.id === id ? { ...t, status: 'resolved' } : t));
    try {
      await api.updateSuperOwnerTicket(id, { status: 'resolved' });
    } catch (e) {
      console.error('Failed to mark resolved on server', e);
    }
    addToast(`Ticket #${id} marked as Resolved`, 'success');
    addLog('Ticket Resolved', `Support Ticket #${id} ("${subject}") status marked as Resolved.`, 'settings');
  };

  const priorityColors = {
    low: 'bg-slate-600 border border-slate-500 text-white font-extrabold shadow-sm',
    medium: 'bg-indigo-600 border border-indigo-500 text-white font-extrabold shadow-sm',
    high: 'bg-amber-600 border border-amber-500 text-white font-extrabold shadow-sm',
    urgent: 'bg-rose-600 border border-rose-500 text-white font-extrabold shadow-md shadow-rose-600/25 animate-pulse'
  };

  const getCategoryBadgeStyle = (category: string) => {
    switch (category) {
      case 'SMTP Configuration':
        return 'bg-violet-600 border border-violet-500 text-white font-extrabold shadow-sm';
      case 'White Labeling':
        return 'bg-emerald-600 border border-emerald-500 text-white font-extrabold shadow-sm';
      case 'Attendance Module':
        return 'bg-sky-600 border border-sky-500 text-white font-extrabold shadow-sm';
      case 'Billing Gateways':
        return 'bg-amber-600 border border-amber-500 text-white font-extrabold shadow-sm';
      default:
        return 'bg-indigo-600 border border-indigo-500 text-white font-extrabold shadow-sm';
    }
  };

  // Knowledge Base Articles
  const kbArticles = [
    {
      title: 'Configuring SMTP Mailgun and SendGrid Relays',
      desc: 'Step-by-step setup guides to mapping white-labeled platform transactional notifications.',
      category: 'SMTP Configuration'
    },
    {
      title: 'CNAME Domain Routing & SSL Setup',
      desc: 'Point company subdomains (e.g. portal.client.com) to proxy gateways with automatic SSL certification.',
      category: 'White Labeling'
    },
    {
      title: 'Enabling Face Recognition on Tablet Terminals',
      desc: 'Deploy the Android kiosk APK and calibrate built-in camera algorithms for night shifts.',
      category: 'Attendance Module'
    },
    {
      title: 'Resolving Razorpay UPI Settlement Delays',
      desc: 'Investigate direct merchant T+2 banking clearances for Indian rupee payments.',
      category: 'Billing Gateways'
    }
  ];

  const filteredKb = kbArticles.filter(art => 
    art.title.toLowerCase().includes(kbSearchQuery.toLowerCase()) || 
    art.desc.toLowerCase().includes(kbSearchQuery.toLowerCase()) ||
    art.category.toLowerCase().includes(kbSearchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Title */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-100 font-sans">
          Support Center & Helpdesk
        </h1>
        <p className="text-slate-600 dark:text-slate-400 text-sm mt-1">
          Respond to tenant inquiries, chat live with company admins, and edit self-service Knowledge Base guides.
        </p>
      </div>

      {/* Main Split Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 items-stretch">
        {/* Ticket Selector Column */}
        <div className="glass-card p-4 rounded-2xl space-y-4 lg:col-span-2 flex flex-col justify-between">
          <div className="space-y-3">
            <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider px-1 block">Helpdesk Tickets</span>
            
            <div className="space-y-2.5 max-h-[360px] overflow-y-auto pr-1">
              {tickets.map(t => (
                <div
                  key={t.id}
                  onClick={() => setSelectedTicketId(t.id)}
                  className={`p-3.5 rounded-xl border cursor-pointer transition select-none flex flex-col justify-between ${
                    t.id === selectedTicketId 
                      ? 'bg-indigo-50 border-indigo-200 text-indigo-950 dark:bg-indigo-950/40 dark:border-indigo-900/50 dark:text-indigo-200' 
                      : 'bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-700 dark:bg-slate-900/40 dark:border-slate-800/60 dark:hover:bg-slate-900/80 dark:text-slate-400'
                  }`}
                >
                  <div className="flex justify-between items-start gap-3">
                    <span className={`font-semibold text-xs leading-relaxed block ${t.id === selectedTicketId ? 'text-indigo-950 dark:text-white font-bold' : 'text-slate-800 dark:text-slate-300'}`}>
                      {t.subject}
                    </span>
                    <span className={`px-1.5 py-0.5 rounded text-[8px] font-bold uppercase shrink-0 font-mono ${priorityColors[t.priority]}`}>
                      {t.priority}
                    </span>
                  </div>

                  <div className="flex justify-between items-center text-[10px] text-slate-500 mt-3 pt-2 border-t border-slate-200 dark:border-slate-800">
                    <span className="font-semibold">{t.companyName}</span>
                    <span className={`px-1.5 py-0.5 rounded text-[8px] font-extrabold border uppercase shadow-sm ${
                      t.status === 'open' ? 'bg-rose-600 border-rose-500 text-white' :
                      t.status === 'pending' ? 'bg-amber-600 border-amber-500 text-white' :
                      'bg-emerald-600 border-emerald-500 text-white'
                    }`}>
                      {t.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Help guide */}
          <div className="bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 p-3 rounded-xl text-xs space-y-1.5">
            <span className="font-semibold text-slate-850 dark:text-slate-300 flex items-center gap-1.5"><LifeBuoy className="h-3.5 w-3.5 text-indigo-500" /> Support SLA Status</span>
            <p className="text-slate-600 dark:text-slate-400 text-[11px] leading-relaxed font-medium">
              Standard turnaround SLA is 2 hours for urgent tickets, and 8 hours for low/medium tickets.
            </p>
          </div>
        </div>

        {/* Live Chat Column */}
        <div 
          ref={chatContainerRef}
          className="lg:col-span-3 glass-card rounded-2xl flex flex-col justify-between overflow-hidden min-h-[450px]"
        >
          {selectedTicket ? (
            <>
              {/* Chat Header (Responsive Flex wrap) */}
              <div className="p-4 border-b border-[var(--border-color)] bg-slate-50 dark:bg-slate-900/20 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <div className="h-8 w-8 rounded-lg bg-indigo-600/20 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold text-sm shrink-0">
                    <MessageSquare className="h-4.5 w-4.5" />
                  </div>
                  <div className="min-w-0">
                    <h3 className="font-semibold text-slate-900 dark:text-slate-100 text-xs md:text-sm leading-snug truncate">{selectedTicket.subject}</h3>
                    <span className="text-[10px] text-slate-500 mt-1 block">Requester: <span className="text-slate-700 dark:text-slate-300 font-medium">{selectedTicket.requesterName}</span> ({selectedTicket.companyName})</span>
                  </div>
                </div>

                {selectedTicket.status !== 'resolved' && (
                  <button
                    onClick={() => handleResolveTicket(selectedTicket.id, selectedTicket.subject)}
                    className="w-full sm:w-auto px-3 py-1.5 rounded bg-emerald-600/20 border border-emerald-500/30 hover:bg-emerald-600 text-emerald-300 hover:text-white text-[10px] font-bold tracking-wider uppercase transition shrink-0 text-center"
                  >
                    Mark Resolved
                  </button>
                )}
              </div>

              {/* Chat messages stream */}
              <div className="flex-1 p-4 space-y-3.5 overflow-y-auto max-h-[300px]">
                {selectedTicket.messages.map((msg) => (
                  <div 
                    key={msg.id}
                    className={`flex gap-3 max-w-[85%] ${msg.isAgent ? 'ml-auto flex-row-reverse' : ''}`}
                  >
                    <div className={`h-7 w-7 rounded-full flex items-center justify-center font-semibold text-white text-[10px] shrink-0 shadow-sm ${
                      msg.isAgent 
                        ? 'bg-gradient-to-r from-[var(--brand-violet)] to-[var(--brand-violet-hover)]' 
                        : 'bg-emerald-600'
                    }`}>
                      {msg.senderName.split(' ').map(n => n[0]).join('')}
                    </div>

                    <div className={`p-4 rounded-2xl text-sm space-y-2 shadow-[0_4px_12px_rgba(0,0,0,0.05)] ${
                      msg.isAgent 
                        ? 'bg-gradient-to-r from-[var(--brand-violet)] to-[var(--brand-violet-hover)] text-white rounded-tr-none' 
                        : 'bg-emerald-500/10 text-emerald-900 dark:text-emerald-200 border border-emerald-500/20 rounded-tl-none'
                    }`}>
                      <div className="flex justify-between items-baseline gap-4 text-[11px] font-semibold opacity-90">
                        <span>{msg.senderName}</span>
                        <span className="font-mono">{new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      </div>
                      <p className="leading-relaxed font-medium text-[13.5px]">{msg.content}</p>
                    </div>
                  </div>
                ))}
                <div ref={chatEndRef} />
              </div>

              {/* Chat Input form (Modern Messenger-style Chat Bar) */}
              <form onSubmit={handleSendMessage} className="p-4 border-t border-[var(--border-color)] bg-slate-50 dark:bg-slate-900/40 flex items-center gap-3">
                <div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400">
                  <button type="button" className="p-2 rounded-full hover:bg-slate-200 dark:hover:bg-slate-800 transition hover:text-slate-700 dark:hover:text-slate-200" title="Attach file">
                    <Paperclip className="h-4.5 w-4.5" />
                  </button>
                  <button type="button" className="p-2 rounded-full hover:bg-slate-200 dark:hover:bg-slate-800 transition hover:text-slate-700 dark:hover:text-slate-200" title="Insert Emoji">
                    <Smile className="h-4.5 w-4.5" />
                  </button>
                </div>
                
                <div className="flex-1 relative flex items-center">
                  <input
                    type="text"
                    required
                    placeholder="Type support response message..."
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    className="w-full bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-800 text-sm rounded-full pl-5 pr-12 py-2.5 text-slate-900 dark:text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 transition"
                  />
                  <button
                    type="button"
                    className="absolute right-3.5 text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 transition"
                    title="Voice response"
                  >
                    <Mic className="h-4 w-4" />
                  </button>
                </div>
                
                <button
                  type="submit"
                  className="h-9 w-9 rounded-full bg-gradient-to-r from-indigo-600 to-blue-600 text-white shadow-md shadow-indigo-600/20 flex items-center justify-center hover:scale-105 active:scale-95 transition shrink-0"
                  title="Send message"
                >
                  <Send className="h-4 w-4" />
                </button>
              </form>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-slate-500">
              <MessageSquare className="h-10 w-10 text-slate-600 mb-3 opacity-30 animate-pulse" />
              Select a help ticket to begin live support interaction.
            </div>
          )}
        </div>
      </div>

      {/* Self-service Knowledge Base */}
      <div className="glass-card p-6 rounded-2xl">
        <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 mb-6">
          <div>
            <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-2"><BookOpen className="h-4 w-4 text-indigo-500" /> Knowledge Base Admin</h3>
            <p className="text-xs text-slate-500">Edit self-help guides mapped to client help widgets.</p>
          </div>
          <div className="relative w-full sm:w-60">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-500" />
            <input
              type="text"
              placeholder="Search help articles..."
              value={kbSearchQuery}
              onChange={(e) => setKbSearchQuery(e.target.value)}
              className="w-full bg-white dark:bg-slate-950 border border-slate-350 dark:border-slate-800 pl-9 pr-3 py-1.5 rounded-lg text-xs placeholder-slate-500 text-slate-800 dark:text-slate-200"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredKb.map((art) => (
            <div key={art.title} className="p-4 rounded-xl bg-slate-50 hover:bg-slate-100 dark:bg-slate-900/30 border border-slate-200 dark:border-slate-800/80 dark:hover:border-slate-800 transition space-y-2">
              <span className={`px-2 py-0.5 rounded text-[9px] uppercase tracking-wider font-mono ${getCategoryBadgeStyle(art.category)}`}>
                {art.category}
              </span>
              <h4 className="font-extrabold text-sm text-slate-900 dark:text-slate-100 flex items-center gap-1 hover:text-indigo-600 dark:hover:text-indigo-400 cursor-pointer transition-colors duration-200">
                {art.title} <ExternalLink className="h-3 w-3 text-slate-500" />
              </h4>
              <p className={`text-xs leading-relaxed ${
                art.category === 'Attendance Module' 
                  ? 'text-purple-600 dark:text-purple-300 font-semibold' 
                  : 'text-slate-700 dark:text-slate-300 font-medium'
              }`}>{art.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
export default SupportCenterTab;
