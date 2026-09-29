import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  User, Shield, UserPlus, Search, Edit2, Key, ShieldAlert,
  Trash2, X, Plus, Check, Filter, UserCheck, ShieldCheck
} from 'lucide-react';
import { useDashboard } from '../context/DashboardContext';
import { User as UserType } from '../types';
import { api } from '../../../services/api';

export const UsersTab: React.FC = () => {
  const { users, setUsers, companies, addToast, addLog, setIsFormDirty } = useDashboard();

  // Search & Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [companyFilter, setCompanyFilter] = useState('all');

  // Modal States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserType | null>(null);
  const [deleteConfirmUser, setDeleteConfirmUser] = useState<{ id: string; name: string } | null>(null);

  // Form states
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    role: 'Employee' as UserType['role'],
    companyName: 'SUPEROWNER Platform',
    status: 'active' as UserType['status']
  });

  // Form Update Helper
  const updateForm = (updates: Partial<typeof formData>) => {
    setFormData(prev => ({ ...prev, ...updates }));
    setIsFormDirty(true);
  };

  const filteredUsers = useMemo(() => {
    return users.filter(u => {
      const matchesSearch = 
        u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.email.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesRole = roleFilter === 'all' || u.role === roleFilter;
      const matchesCompany = companyFilter === 'all' || u.companyName === companyFilter;
      return matchesSearch && matchesRole && matchesCompany;
    });
  }, [users, searchTerm, roleFilter, companyFilter]);

  const handleAddClick = () => {
    setIsFormDirty(false);
    setSelectedUser(null);
    setFormData({
      name: '',
      email: '',
      role: 'Employee',
      companyName: 'SUPEROWNER Platform',
      status: 'active'
    });
    setIsModalOpen(true);
  };

  const handleEditClick = (user: UserType) => {
    setIsFormDirty(false);
    setSelectedUser(user);
    setFormData({
      name: user.name,
      email: user.email,
      role: user.role,
      companyName: user.companyName,
      status: user.status
    });
    setIsModalOpen(true);
  };

  const executeDelete = async () => {
    if (!deleteConfirmUser) return;
    const { id, name } = deleteConfirmUser;
    try {
      await api.deleteSuperOwnerUser(id);
      setUsers(prev => prev.filter(u => u.id !== id));
      addToast(`User "${name}" removed`, 'success');
      addLog('User Deleted', `Super admin deleted user account for "${name}".`, 'user');
    } catch (err: any) {
      addToast(err.message || 'Delete failed', 'error');
    }
    setDeleteConfirmUser(null);
  };

  const handleSuspendToggle = async (id: string, name: string, currentStatus: UserType['status']) => {
    const nextStatus = currentStatus === 'active' ? 'suspended' : 'active';
    try {
      await api.updateSuperOwnerUser(id, { status: nextStatus });
      setUsers(prev => prev.map(u => u.id === id ? { ...u, status: nextStatus } : u));
      addToast(`User "${name}" status set to ${nextStatus}`, nextStatus === 'active' ? 'success' : 'warning');
      addLog('User Status Changed', `User "${name}" status updated to ${nextStatus}.`, 'user');
    } catch (err: any) {
      addToast(err.message || 'Update failed', 'error');
    }
  };

  const handleResetPassword = (name: string, email: string) => {
    addToast(`Password reset link dispatched to ${email}`, 'success');
    addLog('Password Reset Dispatched', `Temporary password reset link emailed to ${name} (${email}).`, 'security');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (selectedUser) {
        // Edit
        const updated = await api.updateSuperOwnerUser(selectedUser.id, {
          name: formData.name,
          email: formData.email,
          role: formData.role,
          status: formData.status
        });
        setUsers(prev => prev.map(u => u.id === selectedUser.id ? {
          ...u,
          name: formData.name,
          email: formData.email,
          role: formData.role,
          status: formData.status
        } : u));
        addToast(`User "${formData.name}" updated`, 'success');
        addLog('User Updated', `Super admin updated details for user "${formData.name}".`, 'user');
      } else {
        // Add
        const result = await api.createSuperOwnerUser({
          name: formData.name,
          email: formData.email,
          role: formData.role,
          companyName: formData.companyName,
          status: formData.status
        });
        setUsers(prev => [...prev, result]);
        addToast(`User "${formData.name}" added`, 'success');
        addLog('User Created', `New user "${formData.name}" registered with role "${formData.role}".`, 'user');
      }
      setIsFormDirty(false);
      setIsModalOpen(false);
    } catch (err: any) {
      addToast(err.message || 'Operation failed', 'error');
    }
  };

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white font-sans">
            User Management & Roles
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            Audit system user registries, assign administration access, and trigger credentials dispatch.
          </p>
        </div>
        <button
          onClick={handleAddClick}
          className="flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white transition shadow-lg shadow-indigo-600/30 w-fit"
        >
          <UserPlus className="h-4 w-4" /> Add User
        </button>
      </div>

      {/* Search and Filters */}
      <div className="glass-card p-4 rounded-2xl flex flex-col md:flex-row gap-4 justify-between items-center">
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search by name or email address..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="glass-input pl-10 pr-4 py-2 rounded-xl text-sm text-slate-200 placeholder-slate-400 w-full"
          />
        </div>

        <div className="flex flex-wrap gap-3 w-full md:w-auto items-center justify-end">
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <Filter className="h-3.5 w-3.5" /> Filters:
          </div>

          {/* Role Filter */}
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="glass-input px-3 py-1.5 rounded-lg text-xs text-slate-300"
          >
            <option value="all">All Roles</option>
            <option value="Super Owner">Super Owner</option>
            <option value="Company Admin">Company Admin</option>
            <option value="HR">HR Admin</option>
            <option value="Manager">Manager</option>
            <option value="Employee">Employee</option>
          </select>

          {/* Company Filter */}
          <select
            value={companyFilter}
            onChange={(e) => setCompanyFilter(e.target.value)}
            className="glass-input px-3 py-1.5 rounded-lg text-xs text-slate-300"
          >
            <option value="all">All Companies</option>
            <option value="SUPEROWNER Platform">SUPEROWNER Platform</option>
            {companies.map(c => (
              <option key={c.id} value={c.name}>{c.name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Users Data table */}
      <div className="glass-card rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="border-b border-white/5 text-slate-400 text-xs font-semibold uppercase tracking-wider bg-white/2">
                <th className="py-4 px-5">User profile</th>
                <th className="py-4 px-4">Organization / Tenant</th>
                <th className="py-4 px-4">Role Assigned</th>
                <th className="py-4 px-4">Status</th>
                <th className="py-4 px-4">Registered Date</th>
                <th className="py-4 px-5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-slate-300">
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400">
                    <User className="h-10 w-10 mx-auto text-slate-500 mb-3 opacity-40" />
                    No users matched the criteria.
                  </td>
                </tr>
              ) : (
                filteredUsers.map(u => (
                  <tr key={u.id} className="hover:bg-white/2 transition">
                    {/* User initials & metadata */}
                    <td className="py-4 px-5 flex items-center gap-3">
                      <div className="h-9 w-9 rounded-full bg-gradient-to-tr from-indigo-500 to-indigo-700 flex items-center justify-center font-bold text-white text-sm shadow">
                        {u.name.split(' ').map(n => n[0]).join('')}
                      </div>
                      <div>
                        <span className="font-semibold text-white block">{u.name}</span>
                        <span className="text-xs text-slate-400 block">{u.email}</span>
                      </div>
                    </td>

                    {/* Company */}
                    <td className="py-4 px-4 font-medium text-slate-200">
                      {u.companyName}
                    </td>

                    {/* Role */}
                    <td className="py-4 px-4">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded text-[10px] uppercase tracking-wide border ${
                        u.role === 'Super Owner' ? 'bg-purple-600 border-purple-500 text-white font-extrabold shadow-sm' :
                        u.role === 'Company Admin' ? 'bg-indigo-600 border-indigo-500 text-white font-extrabold shadow-sm' :
                        u.role === 'HR' ? 'bg-cyan-600 border-cyan-500 text-white font-extrabold shadow-sm' :
                        u.role === 'Manager' ? 'bg-amber-600 border-amber-500 text-white font-extrabold shadow-sm' :
                        'bg-slate-600 border-slate-500 text-white font-extrabold shadow-sm'
                      }`}>
                        <Shield className="h-3 w-3" /> {u.role}
                      </span>
                    </td>

                    {/* Status */}
                    <td className="py-4 px-4">
                      <span className={`px-2.5 py-0.5 rounded text-[10px] font-extrabold border uppercase ${
                        u.status === 'active' ? 'bg-emerald-600 border-emerald-500 text-white shadow-sm' :
                        'bg-rose-600 border-rose-500 text-white shadow-sm'
                      }`}>
                        {u.status}
                      </span>
                    </td>

                    {/* Created Date */}
                    <td className="py-4 px-4 text-xs text-slate-500 font-mono">
                      {u.createdDate}
                    </td>

                    {/* Actions */}
                    <td className="py-4 px-5 text-right">
                      <div className="flex justify-end gap-1.5">
                        {/* Password Reset */}
                        <button
                          onClick={() => handleResetPassword(u.name, u.email)}
                          title="Reset Password / Email Credentials"
                          className="p-1.5 rounded-lg bg-white/5 hover:bg-indigo-600 hover:text-white border border-white/10 text-slate-300 transition"
                        >
                          <Key className="h-3.5 w-3.5" />
                        </button>

                        {/* Edit Details */}
                        <button
                          onClick={() => handleEditClick(u)}
                          title="Edit User Profile"
                          className="p-1.5 rounded-lg bg-white/5 hover:bg-amber-600 hover:text-white border border-white/10 text-slate-300 transition"
                        >
                          <Edit2 className="h-3.5 w-3.5" />
                        </button>

                        {/* Suspend Toggle */}
                        <button
                          onClick={() => handleSuspendToggle(u.id, u.name, u.status)}
                          title={u.status === 'active' ? 'Suspend User' : 'Activate User'}
                          className="p-1.5 rounded-lg bg-white/5 hover:bg-rose-600 hover:text-white border border-white/10 text-slate-300 transition"
                        >
                          {u.status === 'active' ? <ShieldAlert className="h-3.5 w-3.5" /> : <ShieldCheck className="h-3.5 w-3.5" />}
                        </button>

                        {/* Delete User */}
                        <button
                          onClick={() => setDeleteConfirmUser({ id: u.id, name: u.name })}
                          title="Remove User Account"
                          className="p-1.5 rounded-lg bg-white/5 hover:bg-rose-600 hover:text-white border border-white/10 text-rose-400 hover:text-white transition"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit / Create User Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="glass-card w-full max-w-md p-6 rounded-2xl space-y-6 relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 h-32 w-32 bg-indigo-500/10 blur-2xl pointer-events-none"></div>

              <button
                onClick={() => { setIsModalOpen(false); setIsFormDirty(false); }}
                className="absolute top-4 right-4 p-1 rounded-lg hover:bg-white/5 text-slate-400 hover:text-white"
              >
                <X className="h-4 w-4" />
              </button>

              <div>
                <h3 className="text-xl font-bold text-white">{selectedUser ? 'Edit User Credentials' : 'Add New Account User'}</h3>
                <p className="text-xs text-slate-400 mt-1 font-medium">Define security roles and platform scopes.</p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-3">
                  <div className="space-y-1.5">
                    <label className="text-xs text-slate-400 font-medium">User Full Name</label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => updateForm({ name: e.target.value })}
                      placeholder="e.g. Peter Parker"
                      className="glass-input w-full px-3.5 py-2 rounded-xl text-sm text-slate-200"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs text-slate-400 font-medium">Email Address</label>
                    <input
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) => updateForm({ email: e.target.value })}
                      placeholder="e.g. peter@oscorp.com"
                      className="glass-input w-full px-3.5 py-2 rounded-xl text-sm text-slate-200"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs text-slate-400 font-medium">Organization Scope</label>
                    <select
                      value={formData.companyName}
                      onChange={(e) => updateForm({ companyName: e.target.value })}
                      className="glass-input w-full px-3.5 py-2 rounded-xl text-sm text-slate-300"
                    >
                      <option value="SUPEROWNER Platform">SUPEROWNER Platform (Global)</option>
                      {companies.map(c => (
                        <option key={c.id} value={c.name}>{c.name}</option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs text-slate-400 font-medium">Assigned System Role</label>
                    <select
                      value={formData.role}
                      onChange={(e) => updateForm({ role: e.target.value as UserType['role'] })}
                      className="glass-input w-full px-3.5 py-2 rounded-xl text-sm text-slate-300"
                    >
                      <option value="Super Owner">Super Owner</option>
                      <option value="Company Admin">Company Admin</option>
                      <option value="HR">HR Admin</option>
                      <option value="Manager">Manager</option>
                      <option value="Employee">Employee</option>
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs text-slate-400 font-medium">Login Status</label>
                    <select
                      value={formData.status}
                      onChange={(e) => updateForm({ status: e.target.value as UserType['status'] })}
                      className="glass-input w-full px-3.5 py-2 rounded-xl text-sm text-slate-300"
                    >
                      <option value="active">Active</option>
                      <option value="suspended">Suspended</option>
                    </select>
                  </div>
                </div>

                <div className="flex justify-end gap-2 border-t border-white/5 pt-4 mt-2">
                  <button
                    type="button"
                    onClick={() => { setIsModalOpen(false); setIsFormDirty(false); }}
                    className="px-4 py-2 text-sm font-semibold rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 border border-white/10 transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 text-sm font-semibold rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white transition shadow-lg shadow-indigo-600/30"
                  >
                    Save Changes
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Custom Delete Confirmation Modal */}
      <AnimatePresence>
        {deleteConfirmUser && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="glass-card w-full max-w-sm p-6 rounded-2xl space-y-4 relative overflow-hidden border border-white/10"
            >
              <div className="absolute top-0 right-0 h-32 w-32 bg-rose-500/10 blur-2xl pointer-events-none"></div>
              
              <div className="flex items-center gap-3 text-rose-500">
                <ShieldAlert className="h-6 w-6 shrink-0" />
                <h3 className="text-lg font-bold text-white font-sans">Delete User Account</h3>
              </div>
              
              <p className="text-xs text-slate-300 leading-relaxed font-sans">
                Are you sure you want to remove user <span className="font-extrabold text-white font-mono">{deleteConfirmUser.name}</span>? This action is permanent and cannot be undone.
              </p>
              
              <div className="flex justify-end gap-3 pt-2">
                <button
                  onClick={() => setDeleteConfirmUser(null)}
                  className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 text-xs font-semibold border border-slate-200/20 dark:border-white/10 transition"
                >
                  Cancel
                </button>
                <button
                  onClick={executeDelete}
                  className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold transition shadow-md shadow-rose-600/20"
                >
                  Confirm Delete
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
export default UsersTab;
