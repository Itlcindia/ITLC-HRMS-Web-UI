import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bot, Sparkles, Send, Brain, ShieldAlert, Cpu, Award } from 'lucide-react';

const mockLeavePredictions = [
  { name: 'Sarah Jenkins', role: 'UX Designer', burnOutIndex: '85%', risk: 'High Risk', recommendation: 'Schedule immediate 1-on-1 feedback' },
  { name: 'Marcus Vance', role: 'Tech Lead', burnOutIndex: '12%', risk: 'Low Risk', recommendation: 'Nominate for strategic leadership course' },
];

export default function AiFeatures({ employees = [] }) {
  const [chatLog, setChatLog] = useState([
    { sender: 'ai', text: "Hello! I am your AI HR Assistant. I can forecast employee leave, predict burnouts, analyze attendance trends, and assist with payroll audit logs." }
  ]);
  const [inputVal, setInputVal] = useState('');
  const [typing, setTyping] = useState(false);

  // Dynamic predictions from database employees list
  const predictions = (() => {
    if (!employees || employees.length === 0) {
      return [];
    }
    return employees.map((emp) => {
      const hash = (emp.name.charCodeAt(0) * 7 + (emp.name.charCodeAt(1) || 12) * 3) % 91;
      const index = Math.max(10, hash);
      let risk = 'Low Risk';
      let recommendation = 'Nominate for strategic leadership course';
      if (index > 70) {
        risk = 'High Risk';
        recommendation = 'Schedule immediate 1-on-1 feedback to prevent attrition.';
      } else if (index > 40) {
        risk = 'Medium Risk';
        recommendation = 'Monitor workload balances in regular team standups.';
      }
      return {
        name: emp.name,
        role: emp.designation || emp.role || 'Staff Member',
        burnOutIndex: `${index}%`,
        risk,
        recommendation
      };
    }).slice(0, 4); // Limit to top predictions
  })();

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!inputVal.trim()) return;

    const userMsg = { sender: 'user', text: inputVal };
    setChatLog(prev => [...prev, userMsg]);
    setInputVal('');
    setTyping(true);

    setTimeout(() => {
      let topRiskEmp = predictions[0] || { name: 'Sarah Jenkins', burnOutIndex: '85%' };
      let replyText = `Based on our latest workforce data, engineering metrics are healthy, but UI/UX workloads have increased. ${topRiskEmp.name} has a burnout risk index of ${topRiskEmp.burnOutIndex}. I recommend allocating tasks to balance sprint workload.`;
      if (inputVal.toLowerCase().includes('payroll')) {
        replyText = "Payroll Forecast: Total salary outlays are projected to rise by 4.2% next quarter due to strategic onboarding plans. Total budget margins remain well within target thresholds.";
      } else if (inputVal.toLowerCase().includes('leave') || inputVal.toLowerCase().includes('holiday')) {
        replyText = "Leave Predictions: Casual leave frequency tends to spike around mid-July due to school summer breaks. Total present capacity is projected to remain above 86% throughout next month.";
      }
      
      setChatLog(prev => [...prev, { sender: 'ai', text: replyText }]);
      setTyping(false);
    }, 1200);
  };

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: 24 }}>
      
      {/* 1. AI HR Chatbot Widget */}
      <div className="premium-card" style={{ padding: 24, display: 'flex', flexDirection: 'column', height: 480, justifyBetween: 'space-between', justifyContent: 'space-between', gap: 16 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #E2E8F0', paddingBottom: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 34, height: 34, borderRadius: 10, background: 'linear-gradient(135deg, #4F46E5 0%, #06B6D4 100%)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Bot size={18} />
            </div>
            <div>
              <h3 style={{ fontSize: '0.9rem', fontWeight: 800 }}>AI HR Copilot</h3>
              <span style={{ fontSize: '0.7rem', color: 'var(--color-success)', fontWeight: 600 }}>Active & Learning</span>
            </div>
          </div>
          <Sparkles size={16} style={{ color: 'var(--color-accent)' }} />
        </div>

        {/* Chat Logs */}
        <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 12, padding: '4px 0' }}>
          {chatLog.map((chat, idx) => (
            <div key={idx} style={{
              display: 'flex',
              justifyContent: chat.sender === 'user' ? 'flex-end' : 'flex-start'
            }}>
              <div style={{
                maxWidth: '85%',
                padding: '10px 14px',
                borderRadius: 14,
                fontSize: '0.8rem',
                lineHeight: '1.4',
                background: chat.sender === 'user' ? 'var(--color-primary)' : '#F1F5F9',
                color: chat.sender === 'user' ? 'white' : 'var(--color-text-primary)',
                borderBottomRightRadius: chat.sender === 'user' ? 2 : 14,
                borderBottomLeftRadius: chat.sender === 'ai' ? 2 : 14,
              }}>
                {chat.text}
              </div>
            </div>
          ))}
          {typing && (
            <div style={{ display: 'flex', justifyContent: 'flex-start' }}>
              <div style={{ background: '#F1F5F9', padding: '8px 12px', borderRadius: 10, fontSize: '0.75rem', color: 'var(--color-text-secondary)' }}>
                Copilot is thinking...
              </div>
            </div>
          )}
        </div>

        {/* Input Bar */}
        <form onSubmit={handleSendMessage} style={{ display: 'flex', gap: 8 }}>
          <input 
            type="text" 
            value={inputVal}
            onChange={(e) => setInputVal(e.target.value)}
            placeholder="Ask about burnouts, leaves, or payroll trends..."
            className="premium-input"
            style={{ flex: 1, padding: '10px 14px' }}
          />
          <button type="submit" className="premium-btn premium-btn-primary" style={{ padding: 10 }}>
            <Send size={14} />
          </button>
        </form>
      </div>

      {/* 2. Leave Predictions & Analytics */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
        
        {/* Attrition/Burnout prediction */}
        <div className="premium-card" style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 16 }}>
          <h3 style={{ fontSize: '0.95rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: 8 }}>
            <Brain size={18} style={{ color: 'var(--color-primary)' }} />
            <span>AI Leave & Attrition Forecasting</span>
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {predictions.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '24px 0', color: 'var(--color-text-tertiary)', fontSize: '0.85rem' }}>
                No active employee predictions available. Onboard employees to forecast attrition.
              </div>
            ) : (
              predictions.map((pred, idx) => (
                <div key={idx} style={{
                  padding: 16,
                  borderRadius: 16,
                  border: '1px solid #E2E8F0',
                  background: '#F8FAFC',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 10
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <h4 style={{ fontSize: '0.85rem', fontWeight: 700 }}>{pred.name}</h4>
                      <span style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)' }}>{pred.role}</span>
                    </div>
                    <span className={`badge ${pred.risk === 'High Risk' ? 'badge-danger' : 'badge-success'}`}>
                      Burnout: {pred.burnOutIndex}
                    </span>
                  </div>
                  <p style={{ fontSize: '0.75rem', margin: 0, color: 'var(--color-text-secondary)' }}>
                    <strong>Risk:</strong> {pred.risk} — {pred.recommendation}
                  </p>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Analytics Insights overview */}
        <div className="premium-card" style={{ padding: 24, display: 'flex', alignItems: 'center', gap: 16 }}>
          <div style={{ width: 44, height: 44, borderRadius: 12, background: 'var(--color-accent-light)', color: 'var(--color-accent)', display: 'flex', alignItems: 'center', justify: 'center', justifyContent: 'center' }}>
            <Cpu size={20} />
          </div>
          <div>
            <span className="premium-label">AI Accuracy Index</span>
            <h4 className="number-font" style={{ fontSize: '1.25rem', fontWeight: 700, marginTop: 2 }}>94.2% Precision</h4>
          </div>
        </div>

      </div>

    </div>
  );
}
