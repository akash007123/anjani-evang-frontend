import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Plus, Search, Filter, RefreshCw, Trash2, Edit3, Eye, KeyRound, 
  ChevronLeft, ChevronRight, Check, AlertCircle, Users as UsersIcon, X, UserCheck, UserX, Shield,
  Eye as EyeIcon, EyeOff, Lock, Hash, Calendar
} from 'lucide-react';
import { api } from '../../lib/api';
import { useAdminAuth } from '../../context/AdminAuthContext';
import SEO from '../../components/SEO';

interface UserItem {
  _id?: string;
  id?: string;
  firstName: string;
  lastName: string;
  name?: string;
  email: string;
  mobile?: string;
  username?: string;
  role: 'Super Admin' | 'Admin' | 'Manager' | 'Employee';
  profilePicture?: string;
  status: 'Active' | 'Inactive' | 'Suspended';
  createdAt?: string;
  lastLogin?: string;
  createdBy?: string;
}

export default function UsersManagement() {
  const { currentUser } = useAdminAuth();
  const [users, setUsers] = useState<UserItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const [searchQuery, setSearchQuery] = useState<string>('');
  const [pendingRole, setPendingRole] = useState<string>('All');
  const [pendingStatus, setPendingStatus] = useState<string>('All');

  const [activeRole, setActiveRole] = useState<string>('All');
  const [activeStatus, setActiveStatus] = useState<string>('All');

  const [sortBy, setSortBy] = useState<string>('latest');
  const [page, setPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [totalCount, setTotalCount] = useState<number>(0);

  const [isFormOpen, setIsFormOpen] = useState<boolean>(false);
  const [editingItem, setEditingItem] = useState<UserItem | null>(null);
  const [viewingItem, setViewingItem] = useState<UserItem | null>(null);
  const [resettingId, setResettingId] = useState<string | null>(null);
  const [newPassword, setNewPassword] = useState<string>('');
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const [formData, setFormData] = useState<Partial<UserItem & { password: string; confirmPassword: string }>>({
    firstName: '',
    lastName: '',
    email: '',
    mobile: '',
    username: '',
    role: 'Admin',
    profilePicture: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80',
    status: 'Active',
    password: '',
    confirmPassword: '',
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const showToast = (type: 'success' | 'error', message: string) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 3500);
  };

  const fetchUsers = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.getUsers({
        search: searchQuery,
        role: activeRole,
        status: activeStatus,
        sortBy,
        page,
        limit: 8
      });

      if (res.success && res.data) {
        setUsers(res.data.users || []);
        setTotalCount(res.data.total || 0);
        setTotalPages(res.data.totalPages || 1);
      } else {
        setError(res.error || 'Failed to fetch users list');
      }
    } catch (err: any) {
      setError(err.message || 'Error loading users');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [activeRole, activeStatus, sortBy, page]);

  const handleApplyFilters = () => {
    setActiveRole(pendingRole);
    setActiveStatus(pendingStatus);
    setPage(1);
  };

  const handleResetFilters = () => {
    setPendingRole('All');
    setPendingStatus('All');
    setActiveRole('All');
    setActiveStatus('All');
    setSearchQuery('');
    setPage(1);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchUsers();
  };

  const handleOpenCreate = () => {
    setEditingItem(null);
    setFormData({
      firstName: '',
      lastName: '',
      email: '',
      mobile: '',
      username: '',
      role: 'Admin',
      profilePicture: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80',
      status: 'Active',
      password: '',
      confirmPassword: '',
    });
    setShowPassword(false);
    setShowConfirmPassword(false);
    setIsFormOpen(true);
  };

  const handleOpenEdit = (user: UserItem) => {
    setEditingItem(user);
    setFormData({
      ...user,
      password: '',
      confirmPassword: '',
    });
    setIsFormOpen(true);
  };

  const pwd = formData.password || '';
  const hasMinLen = pwd.length >= 8;
  const hasUpper = /[A-Z]/.test(pwd);
  const hasLower = /[a-z]/.test(pwd);
  const hasNumber = /[0-9]/.test(pwd);
  const hasSpecial = /[^A-Za-z0-9]/.test(pwd);
  const notContainsName = !editingItem && (
    !pwd.toLowerCase().includes((formData.firstName || '').toLowerCase()) &&
    !pwd.toLowerCase().includes((formData.lastName || '').toLowerCase())
  );
  const passwordsMatch = pwd === formData.confirmPassword;
  const isPasswordValid = hasMinLen && hasUpper && hasLower && hasNumber && hasSpecial && notContainsName && passwordsMatch;

  const getStrength = (): { label: string; color: string; pct: string } => {
    let score = 0;
    if (hasMinLen) score++; if (hasUpper) score++; if (hasLower) score++;
    if (hasNumber) score++; if (hasSpecial) score++; if (notContainsName) score++;
    if (score <= 2) return { label: 'Weak', color: 'bg-red-500', pct: '33%' };
    if (score <= 4) return { label: 'Medium', color: 'bg-amber-500', pct: '66%' };
    return { label: 'Strong', color: 'bg-emerald-500', pct: '100%' };
  };
  const strength = getStrength();

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.firstName || !formData.email) {
      showToast('error', 'First Name and Email are required');
      return;
    }

    if (!editingItem) {
      if (!formData.password || formData.password.length < 8) {
        showToast('error', 'Password must be at least 8 characters');
        return;
      }
      if (!passwordsMatch) {
        showToast('error', 'Passwords do not match');
        return;
      }
      if (!isPasswordValid) {
        showToast('error', 'Password does not meet all complexity requirements');
        return;
      }
    }

    try {
      const id = editingItem?._id || editingItem?.id;
      const payload: any = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        mobile: formData.mobile || '',
        username: formData.username || '',
        role: formData.role,
        profilePicture: formData.profilePicture,
        status: formData.status,
      };
      if (!id) payload.password = formData.password;

      let res;
      if (id) {
        res = await api.updateUser(id, payload);
      } else {
        res = await api.createUser(payload);
      }

      if (res.success) {
        showToast('success', id ? 'User details updated successfully' : 'New user account created. Welcome email sent.');
        setIsFormOpen(false);
        fetchUsers();
      } else {
        showToast('error', res.error || 'Operation failed');
      }
    } catch (err: any) {
      showToast('error', err.message || 'Save error');
    }
  };

  const handleDelete = async () => {
    if (!deletingId) return;
    try {
      const res = await api.deleteUser(deletingId);
      if (res.success) {
        showToast('success', 'User deleted successfully');
        setDeletingId(null);
        fetchUsers();
      } else {
        showToast('error', res.error || 'Failed to delete user');
      }
    } catch (err: any) {
      showToast('error', err.message || 'Deletion error');
    }
  };

  const handleResetPasswordSubmit = async () => {
    if (!resettingId) return;
    if (newPassword && newPassword.length < 8) {
      showToast('error', 'Password must be at least 8 characters');
      return;
    }
    try {
      const res = await api.resetUserPassword(resettingId, newPassword || '');
      if (res.success) {
        showToast('success', 'Password reset successfully. New credentials sent via email.');
        setResettingId(null);
        setNewPassword('');
      } else {
        showToast('error', res.error || 'Password reset failed');
      }
    } catch (err: any) {
      showToast('error', 'Error resetting password');
    }
  };

  const handleToggleStatus = async (user: UserItem) => {
    const id = user._id || user.id;
    if (!id) return;
    const statusCycle: Record<string, string> = { Active: 'Inactive', Inactive: 'Suspended', Suspended: 'Active' };
    const newStatus = statusCycle[user.status] || 'Active';
    try {
      const res = await api.toggleUserStatus(id, newStatus);
      if (res.success) {
        showToast('success', `User status changed to ${newStatus}`);
        fetchUsers();
      } else {
        showToast('error', res.error || 'Failed to change user status');
      }
    } catch (err) {
      showToast('error', 'Failed to change user status');
    }
  };

  const isOwnUser = (id: string) => {
    return currentUser?.id === id || currentUser?._id === id;
  };

  return (
    <div className="p-6 md:p-8 space-y-8 max-w-7xl mx-auto">
      <SEO title="User Management - Admin Panel" description="Manage registered users, their roles, permissions, and account status." urlPath="/admin/users" />
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className={`fixed top-5 right-5 z-50 px-4 py-3 rounded-xl shadow-lg border text-sm font-semibold flex items-center gap-2 ${
              toast.type === 'success' 
                ? 'bg-emerald-900/90 text-white border-emerald-500' 
                : 'bg-rose-900/90 text-white border-rose-500'
            }`}
          >
            {toast.type === 'success' ? <Check className="w-5 h-5 text-emerald-400" /> : <AlertCircle className="w-5 h-5 text-rose-400" />}
            {toast.message}
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-lg bg-primary/10 text-primary">
              <UsersIcon className="w-5 h-5" />
            </span>
            <h1 className="text-2xl font-serif font-bold text-secondary">Users & Roles Management</h1>
          </div>
          <p className="text-slate-500 text-xs sm:text-sm mt-1">
            Manage admin staff accounts, permissions, passwords, and activation statuses.
          </p>
        </div>

        <button
          onClick={handleOpenCreate}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-primary text-secondary font-bold text-xs sm:text-sm shadow-md hover:bg-primary/90 transition-all cursor-pointer shrink-0"
        >
          <Plus className="w-4 h-4" />
          Add New User
        </button>
      </div>

      <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
        <div className="flex flex-col lg:flex-row gap-4 items-stretch lg:items-center justify-between">
          
          <form onSubmit={handleSearchSubmit} className="flex-1 relative min-w-[280px]">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search users by name, email, username, or mobile..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm focus:outline-none focus:border-primary font-sans"
            />
          </form>

          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2">
              <label className="text-xs font-bold text-slate-500">Role:</label>
              <select
                value={pendingRole}
                onChange={(e) => setPendingRole(e.target.value)}
                className="px-3 py-2 rounded-xl border border-slate-200 text-xs font-medium bg-slate-50 focus:outline-none focus:border-primary"
              >
                <option value="All">All Roles</option>
                <option value="super_admin">Super Admin</option>
                <option value="admin">Admin</option>
                <option value="manager">Manager</option>
                <option value="employee">Employee</option>
              </select>
            </div>

            <div className="flex items-center gap-2">
              <label className="text-xs font-bold text-slate-500">Status:</label>
              <select
                value={pendingStatus}
                onChange={(e) => setPendingStatus(e.target.value)}
                className="px-3 py-2 rounded-xl border border-slate-200 text-xs font-medium bg-slate-50 focus:outline-none focus:border-primary"
              >
                <option value="All">All Statuses</option>
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
                <option value="Suspended">Suspended</option>
              </select>
            </div>

            <button
              onClick={handleApplyFilters}
              className="px-4 py-2 rounded-xl bg-secondary text-white font-bold text-xs hover:bg-secondary/90 flex items-center gap-1.5 cursor-pointer shadow-xs"
            >
              <Filter className="w-3.5 h-3.5" />
              Apply Filters
            </button>

            {(activeRole !== 'All' || activeStatus !== 'All' || searchQuery) && (
              <button
                onClick={handleResetFilters}
                className="px-3 py-2 rounded-xl bg-slate-100 text-slate-600 font-medium text-xs hover:bg-slate-200 transition-all cursor-pointer"
              >
                Clear
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-slate-500 space-y-3">
            <RefreshCw className="w-8 h-8 animate-spin mx-auto text-primary" />
            <p className="text-sm font-semibold">Loading users list...</p>
          </div>
        ) : error ? (
          <div className="p-12 text-center text-rose-500 space-y-2">
            <AlertCircle className="w-8 h-8 mx-auto text-rose-400" />
            <p className="text-sm font-bold">{error}</p>
            <button onClick={fetchUsers} className="text-xs text-primary underline mt-2 cursor-pointer">Retry</button>
          </div>
        ) : users.length === 0 ? (
          <div className="p-12 text-center text-slate-400 space-y-3">
            <UsersIcon className="w-12 h-12 mx-auto text-slate-300" />
            <p className="text-base font-bold text-slate-600">No users found</p>
            <button onClick={handleOpenCreate} className="px-4 py-2 rounded-xl bg-primary text-secondary text-xs font-bold mt-2 cursor-pointer">
              Add New User
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-[11px] uppercase tracking-wider text-slate-500 font-bold">
                  <th className="py-3.5 px-4">User</th>
                  <th className="py-3.5 px-4">Contact</th>
                  <th className="py-3.5 px-4">Role</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4">Last Login</th>
                  <th className="py-3.5 px-4">Created</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs font-sans text-slate-700">
                {users.map((u) => {
                  const id = u._id || u.id || '';
                  const fullName = u.name || `${u.firstName || ''} ${u.lastName || ''}`.trim() || u.email;
                  const isSelf = isOwnUser(id);
                  return (
                    <tr key={id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3.5 px-4 max-w-[200px]">
                        <div className="flex items-center gap-3">
                          <img
                            src={u.profilePicture || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80'}
                            alt={fullName}
                            className="w-10 h-10 object-cover rounded-full border border-slate-200 shrink-0"
                          />
                          <div className="truncate min-w-0">
                            <p className="font-bold text-slate-900 leading-snug truncate flex items-center gap-1.5">
                              {fullName}
                              {isSelf && <span className="text-[9px] bg-primary/10 text-primary px-1.5 py-0.5 rounded-full font-bold">You</span>}
                            </p>
                            <p className="text-[10px] text-slate-400 font-mono truncate">{u.email}</p>
                            {u.username && <p className="text-[9px] text-slate-400">@{u.username}</p>}
                          </div>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 font-mono text-slate-600">
                        {u.mobile || 'N/A'}
                      </td>
                      <td className="py-3.5 px-4">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold ${
                          u.role === 'Super Admin' ? 'bg-amber-100 text-amber-900 border border-amber-300' :
                          u.role === 'Admin' ? 'bg-blue-100 text-blue-900 border border-blue-200' :
                          u.role === 'Manager' ? 'bg-purple-100 text-purple-900 border border-purple-200' :
                          'bg-slate-100 text-slate-700'
                        }`}>
                          <Shield className="w-3 h-3" />
                          {u.role}
                        </span>
                      </td>
                      <td className="py-3.5 px-4">
                        <button
                          onClick={() => handleToggleStatus(u)}
                          disabled={isSelf}
                          className={`px-2.5 py-1 rounded-full text-[10px] font-bold transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed ${
                            u.status === 'Active'
                              ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                              : u.status === 'Suspended'
                              ? 'bg-rose-100 text-rose-800 border border-rose-200'
                              : 'bg-slate-100 text-slate-600 border border-slate-200'
                          }`}
                        >
                          {u.status}
                        </button>
                      </td>
                      <td className="py-3.5 px-4 font-mono text-slate-500 text-[11px]">
                        {u.lastLogin ? new Date(u.lastLogin).toLocaleDateString() : 'Never'}
                      </td>
                      <td className="py-3.5 px-4 font-mono text-slate-500 text-[11px]">
                        {new Date(u.createdAt || Date.now()).toLocaleDateString()}
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => setViewingItem(u)}
                            className="p-1.5 text-slate-500 hover:text-secondary hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                            title="View Profile"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setResettingId(id)}
                            className="p-1.5 text-slate-500 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors cursor-pointer"
                            title="Reset Password"
                          >
                            <KeyRound className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleOpenEdit(u)}
                            className="p-1.5 text-slate-500 hover:text-primary hover:bg-amber-50 rounded-lg transition-colors cursor-pointer"
                            title="Edit User"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setDeletingId(id)}
                            disabled={isSelf}
                            className={`p-1.5 rounded-lg transition-colors cursor-pointer disabled:cursor-not-allowed disabled:opacity-30 ${
                              isSelf ? 'text-slate-300' : 'text-slate-500 hover:text-rose-600 hover:bg-rose-50'
                            }`}
                            title={isSelf ? 'Cannot delete your own account' : 'Delete User'}
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {!loading && totalPages > 1 && (
          <div className="p-4 border-t border-slate-100 bg-slate-50 flex items-center justify-between text-xs text-slate-500">
            <span>Showing page <b>{page}</b> of <b>{totalPages}</b> ({totalCount} total users)</span>
            <div className="flex items-center gap-2">
              <button
                disabled={page <= 1}
                onClick={() => setPage(p => Math.max(1, p - 1))}
                className="p-2 rounded-lg border border-slate-200 bg-white hover:bg-slate-100 disabled:opacity-40 cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                disabled={page >= totalPages}
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                className="p-2 rounded-lg border border-slate-200 bg-white hover:bg-slate-100 disabled:opacity-40 cursor-pointer"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Add / Edit Form Modal */}
      {isFormOpen && (
        <div className="fixed inset-0 z-50 bg-secondary/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto p-6 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-4">
              <h2 className="text-lg font-serif font-bold text-secondary">
                {editingItem ? 'Edit User Details' : 'Add New Admin / Staff Account'}
              </h2>
              <button onClick={() => setIsFormOpen(false)} className="text-slate-400 hover:text-slate-600 p-1 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4 text-xs font-sans">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">First Name *</label>
                  <input
                    type="text"
                    required
                    value={formData.firstName || ''}
                    onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:border-primary text-xs"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Last Name</label>
                  <input
                    type="text"
                    value={formData.lastName || ''}
                    onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:border-primary text-xs"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block font-bold text-slate-700 mb-1">Email Address *</label>
                  <input
                    type="email"
                    required
                    value={formData.email || ''}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:border-primary text-xs"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Mobile Number</label>
                  <input
                    type="text"
                    value={formData.mobile || ''}
                    onChange={(e) => setFormData({ ...formData, mobile: e.target.value })}
                    placeholder="+91-9685533878"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:border-primary text-xs font-mono"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Username</label>
                  <input
                    type="text"
                    value={formData.username || ''}
                    onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                    placeholder="e.g. johndoe"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:border-primary text-xs font-mono"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Role</label>
                  <select
                    value={formData.role || 'Admin'}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value as any })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:border-primary text-xs"
                  >
                    <option value="Super Admin">Super Admin</option>
                    <option value="Admin">Admin</option>
                    <option value="Manager">Manager</option>
                    <option value="Employee">Employee</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Account Status</label>
                  <select
                    value={formData.status || 'Active'}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:border-primary text-xs"
                  >
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                    <option value="Suspended">Suspended</option>
                  </select>
                </div>

                <div className="sm:col-span-2">
                  <label className="block font-bold text-slate-700 mb-1">Profile Avatar URL</label>
                  <input
                    type="text"
                    value={formData.profilePicture || ''}
                    onChange={(e) => setFormData({ ...formData, profilePicture: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:border-primary text-xs"
                  />
                </div>

                {!editingItem && (
                  <>
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Password *</label>
                      <div className="relative">
                        <input
                          type={showPassword ? 'text' : 'password'}
                          required
                          value={formData.password || ''}
                          onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                          placeholder="Min 8 chars, upper, lower, number, special"
                          className="w-full px-3 py-2 pr-10 rounded-xl border border-slate-200 focus:outline-none focus:border-primary text-xs"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                        >
                          {showPassword ? <EyeOff className="w-4 h-4" /> : <EyeIcon className="w-4 h-4" />}
                        </button>
                      </div>

                      {formData.password && (
                        <div className="mt-2 space-y-1.5">
                          <div className="flex items-center gap-2">
                            <div className="flex-1 h-1.5 rounded-full bg-slate-200 overflow-hidden">
                              <div className={`h-full rounded-full transition-all ${strength.color}`} style={{ width: strength.pct }} />
                            </div>
                            <span className={`text-[10px] font-bold ${
                              strength.label === 'Strong' ? 'text-emerald-600' : strength.label === 'Medium' ? 'text-amber-600' : 'text-red-600'
                            }`}>{strength.label}</span>
                          </div>
                          <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-[10px]">
                            <span className={hasMinLen ? 'text-emerald-600' : 'text-slate-400'}>{hasMinLen ? '✓' : '○'} 8+ characters</span>
                            <span className={hasUpper ? 'text-emerald-600' : 'text-slate-400'}>{hasUpper ? '✓' : '○'} Uppercase</span>
                            <span className={hasLower ? 'text-emerald-600' : 'text-slate-400'}>{hasLower ? '✓' : '○'} Lowercase</span>
                            <span className={hasNumber ? 'text-emerald-600' : 'text-slate-400'}>{hasNumber ? '✓' : '○'} Number</span>
                            <span className={hasSpecial ? 'text-emerald-600' : 'text-slate-400'}>{hasSpecial ? '✓' : '○'} Special char</span>
                            <span className={notContainsName ? 'text-emerald-600' : 'text-slate-400'}>{notContainsName ? '✓' : '○'} Not contain name</span>
                          </div>
                        </div>
                      )}
                    </div>

                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Confirm Password *</label>
                      <div className="relative">
                        <input
                          type={showConfirmPassword ? 'text' : 'password'}
                          required
                          value={formData.confirmPassword || ''}
                          onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                          placeholder="Repeat password"
                          className="w-full px-3 py-2 pr-10 rounded-xl border border-slate-200 focus:outline-none focus:border-primary text-xs"
                        />
                        <button
                          type="button"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                        >
                          {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <EyeIcon className="w-4 h-4" />}
                        </button>
                      </div>
                      {formData.confirmPassword && (
                        <p className={`text-[10px] mt-1 ${passwordsMatch ? 'text-emerald-600' : 'text-rose-500'}`}>
                          {passwordsMatch ? '✓ Passwords match' : '✗ Passwords do not match'}
                        </p>
                      )}
                    </div>
                  </>
                )}
              </div>

              <div className="flex items-center justify-end gap-3 border-t border-slate-100 pt-4 mt-6">
                <button
                  type="button"
                  onClick={() => setIsFormOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 text-slate-600 font-bold hover:bg-slate-200 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-primary text-secondary font-bold hover:bg-primary/90 cursor-pointer shadow-sm"
                >
                  {editingItem ? 'Save Changes' : 'Create User'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Reset Password Modal */}
      {resettingId && (
        <div className="fixed inset-0 z-50 bg-secondary/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 space-y-4 shadow-xl border border-slate-200">
            <div className="w-10 h-10 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center mx-auto">
              <KeyRound className="w-5 h-5" />
            </div>
            <div className="text-center">
              <h3 className="text-base font-bold text-slate-900">Reset User Password</h3>
              <p className="text-xs text-slate-500 mt-1">A new password will be set and sent via email to the user.</p>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">New Password (leave empty for auto-generated)</label>
              <input
                type="password"
                placeholder="Auto-generate or enter custom"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-primary"
              />
              {newPassword && newPassword.length < 8 && (
                <p className="text-[10px] text-rose-500 mt-1">Minimum 8 characters</p>
              )}
            </div>
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => { setResettingId(null); setNewPassword(''); }}
                className="px-4 py-2 rounded-xl bg-slate-100 text-slate-600 font-bold text-xs hover:bg-slate-200 cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleResetPasswordSubmit}
                className="px-4 py-2 rounded-xl bg-primary text-secondary font-bold text-xs hover:bg-primary/90 cursor-pointer shadow-sm"
              >
                Reset & Email
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deletingId && (
        <div className="fixed inset-0 z-50 bg-secondary/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 text-center space-y-4 shadow-xl border border-slate-200">
            <div className="w-12 h-12 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">Delete User</h3>
              <p className="text-xs text-slate-500 mt-1">
                Are you sure you want to soft-delete this user account? They will no longer be able to log in.
              </p>
            </div>
            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                onClick={() => setDeletingId(null)}
                className="px-4 py-2 rounded-xl bg-slate-100 text-slate-600 font-bold text-xs hover:bg-slate-200 cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                className="px-4 py-2 rounded-xl bg-rose-600 text-white font-bold text-xs hover:bg-rose-700 cursor-pointer shadow-sm"
              >
                Delete Account
              </button>
            </div>
          </div>
        </div>
      )}

      {/* View User Modal */}
      {viewingItem && (
        <div className="fixed inset-0 z-50 bg-secondary/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl border border-slate-200 text-center">
            <img
              src={viewingItem.profilePicture || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80'}
              alt="User profile"
              className="w-20 h-20 object-cover rounded-full mx-auto border-2 border-primary"
            />
            <div>
              <h2 className="text-lg font-bold text-secondary">
                {viewingItem.name || `${viewingItem.firstName} ${viewingItem.lastName}`}
              </h2>
              <span className="text-xs text-primary font-bold uppercase tracking-wider">{viewingItem.role}</span>
            </div>
            <div className="text-left bg-slate-50 p-4 rounded-xl space-y-2 text-xs font-sans text-slate-600">
              <p><b>Email:</b> {viewingItem.email}</p>
              <p><b>Mobile:</b> {viewingItem.mobile || 'N/A'}</p>
              <p><b>Username:</b> {viewingItem.username || 'N/A'}</p>
              <p><b>Status:</b> {viewingItem.status}</p>
              <p><b>Last Login:</b> {viewingItem.lastLogin ? new Date(viewingItem.lastLogin).toLocaleString() : 'Never'}</p>
              <p><b>Account Created:</b> {new Date(viewingItem.createdAt || Date.now()).toLocaleDateString()}</p>
            </div>
            <button
              onClick={() => setViewingItem(null)}
              className="px-5 py-2 rounded-xl bg-slate-200 text-slate-700 font-bold text-xs cursor-pointer"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
