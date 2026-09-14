import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  CheckSquare, Plus, Search, Calendar, User, Clock, 
  Trash2, CheckCircle2, X, Tag, AlertCircle, AlertTriangle
} from 'lucide-react';
import { useDashboard } from '../context/DashboardContext';

export const CrmTasksTab: React.FC = () => {
  const { addToast, addLog } = useDashboard();

  // Tasks from localStorage
  const [tasks, setTasks] = useState<any[]>(() => {
    try {
      const saved = localStorage.getItem('crm_tasks');
      if (saved) return JSON.parse(saved);
    } catch {}
    return [
      { id: 1, title: 'Follow up demo meeting with Acme Corp CTO', date: new Date().toISOString().split('T')[0], priority: 'High', assignee: 'Super Owner', completed: false },
      { id: 2, title: 'Dispatch custom enterprise pricing quotation', date: new Date().toISOString().split('T')[0], priority: 'Medium', assignee: 'Super Owner', completed: false },
      { id: 3, title: 'Quarterly pipeline audit and deal progression review', date: '2026-09-10', priority: 'Low', assignee: 'Super Owner', completed: true }
    ];
  });

  const [search, setSearch] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('ALL');
  const [showModal, setShowModal] = useState(false);

  const [formData, setFormData] = useState({
    title: '',
    date: new Date().toISOString().split('T')[0],
    priority: 'Medium',
    assignee: 'Super Owner'
  });

  const saveTasks = (newTasks: any[]) => {
    setTasks(newTasks);
    localStorage.setItem('crm_tasks', JSON.stringify(newTasks));
  };

  const handleToggleTask = (id: number) => {
    const updated = tasks.map(t => t.id === id ? { ...t, completed: !t.completed } : t);
    saveTasks(updated);
    addToast('Task status updated.', 'info');
  };

  const handleCreateTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim()) return;

    const newTask = {
      id: Date.now(),
      title: formData.title,
      date: formData.date,
      priority: formData.priority,
      assignee: formData.assignee,
      completed: false
    };

    saveTasks([newTask, ...tasks]);
    setShowModal(false);
    addToast('New task scheduled!', 'success');
    addLog('CRM Task Created', `Scheduled task: "${formData.title}"`, 'feature');
  };

  const handleDeleteTask = (id: number) => {
    saveTasks(tasks.filter(t => t.id !== id));
    addToast('Task removed.', 'info');
  };

  const filteredTasks = tasks.filter(t => {
    const matchSearch = t.title?.toLowerCase().includes(search.toLowerCase()) || t.assignee?.toLowerCase().includes(search.toLowerCase());
    const matchPriority = priorityFilter === 'ALL' || t.priority === priorityFilter;
    return matchSearch && matchPriority;
  });

  const pendingCount = tasks.filter(t => !t.completed).length;

  return (
    <div className="w-full max-w-6xl mx-auto space-y-6 sm:space-y-8 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              Tasks & Schedules
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-500/10 text-amber-300 border border-amber-500/20">
              {pendingCount} Pending Actions
            </span>
          </div>
          <p className="text-slate-400 text-xs sm:text-sm mt-1">
            CRM follow-ups, client demonstration calls, reminders, and sales operations deadlines.
          </p>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="h-11 px-5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold text-xs sm:text-sm transition shadow-lg shadow-indigo-600/30 flex items-center justify-center gap-2 cursor-pointer self-start sm:self-auto"
        >
          <Plus className="h-4 w-4" /> Add Task
        </button>
      </div>

      {/* Filter & Search Bar */}
      <div className="glass-card p-4 rounded-2xl border border-slate-200/80 dark:border-white/10 shadow-md flex flex-col sm:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search tasks or assignees..."
            className="glass-input h-11 w-full pl-10 pr-4 rounded-xl text-xs sm:text-sm text-slate-100 placeholder-slate-500"
          />
        </div>

        <select
          value={priorityFilter}
          onChange={(e) => setPriorityFilter(e.target.value)}
          className="glass-input h-11 px-3.5 rounded-xl text-xs font-semibold text-slate-300 bg-transparent cursor-pointer w-full sm:w-auto"
        >
          <option value="ALL">All Priorities</option>
          <option value="High">High</option>
          <option value="Medium">Medium</option>
          <option value="Low">Low</option>
        </select>
      </div>

      {/* Task List Container */}
      <div className="glass-card p-4 sm:p-6 rounded-2xl border border-slate-200/80 dark:border-white/10 shadow-lg space-y-3">
        {filteredTasks.map((t) => (
          <div
            key={t.id}
            className={`p-4 rounded-2xl border transition flex items-center justify-between gap-4 ${
              t.completed 
                ? 'bg-white/1 border-white/5 opacity-60' 
                : 'bg-white/3 hover:bg-white/5 border-slate-200/50 dark:border-white/10'
            }`}
          >
            <div className="flex items-center gap-3.5 min-w-0 flex-1">
              <button
                onClick={() => handleToggleTask(t.id)}
                className={`h-6 w-6 rounded-lg border flex items-center justify-center transition shrink-0 cursor-pointer ${
                  t.completed 
                    ? 'bg-emerald-500 border-emerald-500 text-white' 
                    : 'border-slate-400/50 hover:border-indigo-400'
                }`}
              >
                {t.completed && <CheckCircle2 className="h-4 w-4" />}
              </button>

              <div className="space-y-0.5 min-w-0">
                <span className={`font-bold text-sm block truncate ${t.completed ? 'line-through text-slate-400' : 'text-white'}`}>
                  {t.title}
                </span>
                <div className="flex items-center gap-3 text-[11px] text-slate-400">
                  <span className="flex items-center gap-1"><Calendar className="h-3 w-3 text-slate-400" /> {t.date}</span>
                  <span>•</span>
                  <span className="flex items-center gap-1"><User className="h-3 w-3 text-slate-400" /> {t.assignee}</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3 shrink-0">
              <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${
                t.priority === 'High' ? 'bg-rose-500/10 text-rose-400 border-rose-500/20' :
                t.priority === 'Medium' ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' :
                'bg-blue-500/10 text-blue-400 border-blue-500/20'
              }`}>
                {t.priority}
              </span>

              <button
                onClick={() => handleDeleteTask(t.id)}
                className="p-1.5 rounded-lg hover:bg-rose-500/10 text-slate-400 hover:text-rose-400 transition"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          </div>
        ))}

        {filteredTasks.length === 0 && (
          <div className="py-12 text-center text-xs text-slate-400">
            No tasks found. Click "Add Task" to schedule an activity.
          </div>
        )}
      </div>

      {/* Modal */}
      <AnimatePresence>
        {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="glass-card w-full max-w-md p-6 rounded-3xl space-y-5 border border-slate-200/80 dark:border-white/10 shadow-2xl relative"
            >
              <div className="flex items-center justify-between pb-3 border-b border-white/10">
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <CheckSquare className="h-5 w-5 text-indigo-400" /> Schedule CRM Activity
                </h3>
                <button onClick={() => setShowModal(false)} className="p-1 rounded hover:bg-white/10 text-slate-400 hover:text-white">
                  <X className="h-4 w-4" />
                </button>
              </div>

              <form onSubmit={handleCreateTask} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-slate-300">Task Title / Objective *</label>
                  <input
                    type="text"
                    required
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="e.g. Schedule Product Demo with Client CTO"
                    className="glass-input h-11 w-full px-3.5 rounded-xl text-sm text-slate-100"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="block text-xs font-semibold text-slate-300">Due Date</label>
                    <input
                      type="date"
                      value={formData.date}
                      onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                      className="glass-input h-11 w-full px-3.5 rounded-xl text-sm text-slate-200"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-xs font-semibold text-slate-300">Priority Level</label>
                    <select
                      value={formData.priority}
                      onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                      className="glass-input h-11 w-full px-3 rounded-xl text-xs font-semibold text-slate-200 bg-transparent cursor-pointer"
                    >
                      <option value="High">High</option>
                      <option value="Medium">Medium</option>
                      <option value="Low">Low</option>
                    </select>
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-3 border-t border-white/5">
                  <button type="button" onClick={() => setShowModal(false)} className="h-11 px-4 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 text-slate-300 text-xs font-semibold">
                    Cancel
                  </button>
                  <button type="submit" className="h-11 px-6 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs sm:text-sm shadow-lg shadow-indigo-600/30">
                    Schedule Task
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
};

export default CrmTasksTab;
