import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Plus, Search, Filter, RefreshCw, Trash2, Edit3, Eye, KeyRound, 
  ChevronLeft, ChevronRight, Check, AlertCircle, Users as UsersIcon, X, UserCheck, UserX, Shield
} from 'lucide-react';
import { api } from '../../lib/api';

interface UserItem {
  _id?: string;
  id?: string;
  firstName: string;
  lastName: string;
  name?: string;
  email: string;
  mobile?: string;
  role: 'Super Admin' | 'Admin' | 'Manager' | 'Employee';
  profilePicture?: string;
  status: 'Active' | 'Inactive';
  createdAt?: string;
  lastLogin?: string;
}

export default function UsersManagement() {
  const [users, setUsers] = useState<UserItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Search & Filters
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [pendingRole, setPendingRole] = useState<string>('All');
  const [pendingStatus, setPendingStatus] = useState<string>('All');

  const [activeRole, setActiveRole] = useState<string>('All');
  const [activeStatus, setActiveStatus] = useState<string>('All');

  const [sortBy, setSortBy] = useState<string>('latest');
  const [page, setPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [totalCount, setTotalCount] = useState<number>(0);

  // Modals
  const [isFormOpen, setIsFormOpen] = useState<boolean>(false);
  const [editingItem, setEditingItem] = useState<UserItem | null>(null);
  const [viewingItem, setViewingItem] = useState<UserItem | null>(null);
  const [resettingId, setResettingId] = useState<string | null>(null);
  const [newPassword, setNewPassword] = useState<string>('');
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Form State
  const [formData, setFormData] = useState<Partial<UserItem>>({
    firstName: '',
    lastName: '',
    email: '',
    mobile: '',
    role: 'Admin',
    profilePicture: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80',
    status: 'Active'
  });

  // Toasts
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
      role: 'Admin',
      profilePicture: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80',
      status: 'Active'
    });
    setIsFormOpen(true);
  };

  const handleOpenEdit = (user: UserItem) => {
    setEditingItem(user);
    setFormData({ ...user });
    setIsFormOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.firstName || !formData.email) {
      showToast('error', 'First Name and Email are required');
      return;
    }

    try {
      const id = editingItem?._id || editingItem?.id;
      let res;
      if (id) {
        res = await api.updateUser(id, formData);
      } else {
        res = await api.createUser(formData);
      }

      if (res.success) {
        showToast('success', id ? 'User details updated successfully' : 'New user account created');
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
    try {
      const res = await api.resetUserPassword(resettingId, newPassword || 'Reset@1234');
      if (res.success) {
        showToast('success', 'Password reset successfully');
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
    const newStatus = user.status === 'Active' ? 'Inactive' : 'Active';
    try {
      const res = await api.toggleUserStatus(id, newStatus);
      if (res.success) {
        showToast('success', `User set to ${newStatus}`);
        fetchUsers();
      }
    } catch (err) {
      showToast('error', 'Failed to change user status');
    }
  };

  return (
    <div className="p-6 md:p-8 space-y-8 max-w-7xl mx-auto">
      {/* Toast */}
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

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-lg bg-primary/10 text-primary">
              <UsersIcon className="w-5 h-5" />
            </span>
            <h1 className="text-2xl font-serif font-bold text-secondary">Users & Roles Management</h1>
          </div>
          <p className="text-slate-500 text-xs sm:text-sm mt-1">
            Manage admin staff accounts, super admin access permissions, passwords, and activation statuses.
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

      {/* Search & Filter Controls */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
        <div className="flex flex-col lg:flex-row gap-4 items-stretch lg:items-center justify-between">
          
          <form onSubmit={handleSearchSubmit} className="flex-1 relative min-w-[280px]">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search users by name, email, or mobile..."
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
                <option value="Super Admin">Super Admin</option>
                <option value="Admin">Admin</option>
                <option value="Manager">Manager</option>
                <option value="Employee">Employee</option>
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

      {/* Main Table */}
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
                  <th className="py-3.5 px-4">Contact Details</th>
                  <th className="py-3.5 px-4">Role</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4">Created Date</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs font-sans text-slate-700">
                {users.map((u) => {
                  const id = u._id || u.id || '';
                  const fullName = u.name || `${u.firstName || ''} ${u.lastName || ''}`.trim() || u.email;
                  return (
                    <tr key={id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <img
                            src={u.profilePicture || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80'}
                            alt={fullName}
                            className="w-10 h-10 object-cover rounded-full border border-slate-200 shrink-0"
                          />
                          <div>
                            <p className="font-bold text-slate-900 leading-snug">{fullName}</p>
                            <p className="text-[10px] text-slate-400 font-mono">{u.email}</p>
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
                          className={`px-2.5 py-1 rounded-full text-[10px] font-bold transition-all cursor-pointer ${
                            u.status === 'Active'
                              ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                              : 'bg-rose-100 text-rose-800 border border-rose-200'
                          }`}
                        >
                          {u.status}
                        </button>
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
                            className="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                            title="Delete User"
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

        {/* Pagination */}
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
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200">
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

                <div className="sm:col-span-2">
                  <label className="block font-bold text-slate-700 mb-1">Profile Avatar URL</label>
                  <input
                    type="text"
                    value={formData.profilePicture || ''}
                    onChange={(e) => setFormData({ ...formData, profilePicture: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:border-primary text-xs"
                  />
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
                  </select>
                </div>
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
              <p className="text-xs text-slate-500 mt-1">Set a new password for this staff account.</p>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">New Password</label>
              <input
                type="password"
                placeholder="Reset@1234"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-primary"
              />
            </div>
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setResettingId(null)}
                className="px-4 py-2 rounded-xl bg-slate-100 text-slate-600 font-bold text-xs hover:bg-slate-200 cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleResetPasswordSubmit}
                className="px-4 py-2 rounded-xl bg-primary text-secondary font-bold text-xs hover:bg-primary/90 cursor-pointer shadow-sm"
              >
                Reset Password
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
                Are you sure you want to permanently delete this user account?
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
              <h2 className="text-lg font-bold text-secondary">{viewingItem.name || `${viewingItem.firstName} ${viewingItem.lastName}`}</h2>
              <span className="text-xs text-primary font-bold uppercase tracking-wider">{viewingItem.role}</span>
            </div>
            <div className="text-left bg-slate-50 p-4 rounded-xl space-y-2 text-xs font-sans text-slate-600">
              <p><b>Email:</b> {viewingItem.email}</p>
              <p><b>Mobile:</b> {viewingItem.mobile || 'N/A'}</p>
              <p><b>Status:</b> {viewingItem.status}</p>
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
