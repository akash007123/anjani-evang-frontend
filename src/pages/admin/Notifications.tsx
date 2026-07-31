import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import {
  Bell, Search, Filter, RefreshCw, CheckCheck, Trash2, Eye, Calendar,
  Mail, ShoppingCart, Bot, Send, AlertTriangle, Info, CheckCircle2,
  ChevronLeft, ChevronRight, X, ExternalLink, ArrowUpDown, Clock, ShieldAlert, Sparkles
} from 'lucide-react';
import { api } from '../../lib/api';
import { useNotifications, NotificationItem } from '../../context/NotificationContext';
import DeleteConfirmModal from '../../components/ui/DeleteConfirmModal';
import SEO from '../../components/SEO';

function formatFullDate(dateStr: string): string {
  if (!dateStr) return 'N/A';
  try {
    return new Date(dateStr).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  } catch {
    return dateStr;
  }
}

export default function NotificationsPage() {
  const navigate = useNavigate();
  const { fetchNotifications: refreshGlobalNotifications } = useNotifications();

  // Page level state
  const [items, setItems] = useState<NotificationItem[]>([]);
  const [totalCount, setTotalCount] = useState<number>(0);
  const [unreadCountPage, setUnreadCountPage] = useState<number>(0);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [loading, setLoading] = useState<boolean>(true);

  // Search & Filter state (unapplied form inputs)
  const [searchInput, setSearchInput] = useState<string>('');
  const [typeInput, setTypeInput] = useState<string>('');
  const [priorityInput, setPriorityInput] = useState<string>('');
  const [statusInput, setStatusInput] = useState<string>('');
  const [startDateInput, setStartDateInput] = useState<string>('');
  const [endDateInput, setEndDateInput] = useState<string>('');

  // Applied filter state (filters only take effect upon clicking "Apply Filters")
  const [appliedFilters, setAppliedFilters] = useState({
    search: '',
    type: '',
    priority: '',
    readStatus: '',
    startDate: '',
    endDate: ''
  });

  // Sorting & Pagination
  const [sortBy, setSortBy] = useState<string>('latest');
  const [page, setPage] = useState<number>(1);
  const [limit, setLimit] = useState<number>(10);

  // Modal State
  const [selectedNotif, setSelectedNotif] = useState<NotificationItem | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Fetch Notifications from Server
  const loadNotifications = useCallback(async () => {
    setLoading(true);
    try {
      const params = {
        search: appliedFilters.search,
        type: appliedFilters.type,
        priority: appliedFilters.priority,
        readStatus: appliedFilters.readStatus,
        startDate: appliedFilters.startDate,
        endDate: appliedFilters.endDate,
        sortBy,
        page,
        limit
      };

      const res = await api.getNotifications(params);
      if (res.success && res.data) {
        setItems(res.data.notifications || []);
        setTotalCount(res.data.total || 0);
        setTotalPages(res.data.totalPages || 1);
        setUnreadCountPage(res.data.unreadCount || 0);
      }
    } catch (err) {
      console.error('Failed to load notifications page:', err);
    } finally {
      setLoading(false);
    }
  }, [appliedFilters, sortBy, page, limit]);

  useEffect(() => {
    loadNotifications();
  }, [loadNotifications]);

  // Apply filters on button click
  const handleApplyFilters = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setPage(1);
    setAppliedFilters({
      search: searchInput,
      type: typeInput,
      priority: priorityInput,
      readStatus: statusInput,
      startDate: startDateInput,
      endDate: endDateInput
    });
  };

  // Reset filters
  const handleResetFilters = () => {
    setSearchInput('');
    setTypeInput('');
    setPriorityInput('');
    setStatusInput('');
    setStartDateInput('');
    setEndDateInput('');
    setPage(1);
    setAppliedFilters({
      search: '',
      type: '',
      priority: '',
      readStatus: '',
      startDate: '',
      endDate: ''
    });
  };

  // Actions
  const handleMarkRead = async (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    try {
      await api.markNotificationAsRead(id);
      setItems(prev => prev.map(n => ((n._id === id || n.id === id) ? { ...n, readStatus: true } : n)));
      refreshGlobalNotifications();
    } catch (err) {
      console.error('Failed to mark read:', err);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await api.markAllNotificationsAsRead();
      setItems(prev => prev.map(n => ({ ...n, readStatus: true })));
      setUnreadCountPage(0);
      refreshGlobalNotifications();
    } catch (err) {
      console.error('Failed to mark all read:', err);
    }
  };

  const handleDelete = (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setDeleteTarget(id);
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    try {
      await api.deleteNotification(deleteTarget);
      setItems(prev => prev.filter(n => n._id !== deleteTarget && n.id !== deleteTarget));
      setTotalCount(prev => Math.max(0, prev - 1));
      refreshGlobalNotifications();
    } catch (err) {
      console.error('Failed to delete notification:', err);
    }
    setIsDeleting(false);
    setDeleteTarget(null);
  };

  const getTypeBadge = (type: string) => {
    switch (type?.toLowerCase()) {
      case 'booking':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <Calendar className="w-3.5 h-3.5" /> Booking
          </span>
        );
      case 'contact':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200">
            <Mail className="w-3.5 h-3.5" /> Contact
          </span>
        );
      case 'order':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
            <ShoppingCart className="w-3.5 h-3.5" /> Order
          </span>
        );
      case 'chatbot':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-purple-50 text-purple-700 border border-purple-200">
            <Bot className="w-3.5 h-3.5" /> AI Chatbot
          </span>
        );
      case 'newsletter':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200">
            <Send className="w-3.5 h-3.5" /> Newsletter
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-700 border border-slate-200">
            <Bell className="w-3.5 h-3.5" /> System
          </span>
        );
    }
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority?.toLowerCase()) {
      case 'critical':
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-extrabold uppercase bg-rose-100 text-rose-800 border border-rose-300">
            Critical
          </span>
        );
      case 'high':
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-extrabold uppercase bg-amber-100 text-amber-800 border border-amber-300">
            High
          </span>
        );
      case 'medium':
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-blue-100 text-blue-800 border border-blue-200">
            Medium
          </span>
        );
      default:
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-slate-100 text-slate-600 border border-slate-200">
            Low
          </span>
        );
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <SEO title="Notifications - Admin Panel" description="View and manage system notifications and alerts." urlPath="/admin/notifications" />
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-secondary to-slate-900 text-white p-6 rounded-3xl shadow-xl relative overflow-hidden">
        <div className="relative z-10 space-y-1">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-1 rounded-full bg-primary/20 text-primary text-xs font-bold uppercase tracking-wider font-sans border border-primary/30">
              Admin Notifications Center
            </span>
            {unreadCountPage > 0 && (
              <span className="px-2.5 py-1 rounded-full bg-rose-500/20 text-rose-300 text-xs font-bold font-sans border border-rose-500/30">
                {unreadCountPage} Unread Messages
              </span>
            )}
          </div>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold tracking-tight text-white">
            System Alerts & Activity
          </h1>
          <p className="text-slate-300 text-xs sm:text-sm font-sans max-w-2xl">
            Real-time automated notifications generated whenever customers submit bookings, contacts, chatbot requests, or orders.
          </p>
        </div>

        <div className="flex items-center gap-3 relative z-10">
          <button
            onClick={() => loadNotifications()}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold font-sans transition-all cursor-pointer border border-white/10"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            <span>Sync Live</span>
          </button>
          <button
            onClick={handleMarkAllRead}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary hover:bg-amber-500 text-secondary text-xs font-bold font-sans shadow-md transition-all cursor-pointer"
          >
            <CheckCheck className="w-4 h-4" />
            <span>Mark All Read</span>
          </button>
        </div>

        {/* Decorative background circle */}
        <div className="absolute -right-10 -bottom-10 w-64 h-64 bg-primary/10 rounded-full blur-3xl pointer-events-none" />
      </div>

      {/* Delete Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={confirmDelete}
        title="Delete Notification"
        itemName="this notification"
        isLoading={isDeleting}
      />

      {/* Filter & Search Controls Bar */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2 text-secondary font-serif font-bold text-sm">
            <Filter className="w-4 h-4 text-primary" />
            <span>Search & Filter Console</span>
          </div>
          <span className="text-xs text-slate-400 font-sans">
            Showing {items.length} of {totalCount} records
          </span>
        </div>

        <form onSubmit={handleApplyFilters} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Search Box */}
          <div className="relative sm:col-span-2 lg:col-span-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Search title, message, ref..."
              className="w-full pl-10 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-secondary placeholder-slate-400 focus:outline-none focus:border-primary"
            />
          </div>

          {/* Module Type Dropdown */}
          <div>
            <select
              value={typeInput}
              onChange={(e) => setTypeInput(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-secondary focus:outline-none focus:border-primary cursor-pointer"
            >
              <option value="">All Event Types</option>
              <option value="Booking">📅 Booking</option>
              <option value="Contact">📩 Contact Inquiry</option>
              <option value="Order">🛒 Catering Order</option>
              <option value="Chatbot">🤖 AI Chatbot</option>
              <option value="Newsletter">✉️ Newsletter</option>
              <option value="System">⚙️ System</option>
            </select>
          </div>

          {/* Priority Dropdown */}
          <div>
            <select
              value={priorityInput}
              onChange={(e) => setPriorityInput(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-secondary focus:outline-none focus:border-primary cursor-pointer"
            >
              <option value="">All Priorities</option>
              <option value="Critical">Critical</option>
              <option value="High">High</option>
              <option value="Medium">Medium</option>
              <option value="Low">Low</option>
            </select>
          </div>

          {/* Read Status Dropdown */}
          <div>
            <select
              value={statusInput}
              onChange={(e) => setStatusInput(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-secondary focus:outline-none focus:border-primary cursor-pointer"
            >
              <option value="">All Statuses</option>
              <option value="false">Unread Only</option>
              <option value="true">Read Only</option>
            </select>
          </div>

          {/* Date Range Start */}
          <div>
            <input
              type="date"
              value={startDateInput}
              onChange={(e) => setStartDateInput(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-secondary focus:outline-none focus:border-primary cursor-pointer"
            />
          </div>

          {/* Date Range End */}
          <div>
            <input
              type="date"
              value={endDateInput}
              onChange={(e) => setEndDateInput(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-secondary focus:outline-none focus:border-primary cursor-pointer"
            />
          </div>

          {/* Action Buttons */}
          <div className="sm:col-span-2 lg:col-span-2 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={handleResetFilters}
              className="px-4 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 text-xs font-bold transition-all cursor-pointer"
            >
              Reset
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-secondary hover:bg-slate-800 text-primary text-xs font-bold transition-all cursor-pointer shadow-sm"
            >
              Apply Filters
            </button>
          </div>
        </form>
      </div>

      {/* Sorting & Display Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50 p-3 rounded-xl border border-slate-200 text-xs">
        <div className="flex items-center gap-2">
          <ArrowUpDown className="w-4 h-4 text-slate-400" />
          <span className="font-bold text-slate-600">Sort By:</span>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="bg-white border border-slate-200 rounded-lg px-2.5 py-1 text-xs font-semibold text-secondary focus:outline-none cursor-pointer"
          >
            <option value="latest">Latest First</option>
            <option value="oldest">Oldest First</option>
            <option value="priority">Priority Order</option>
            <option value="type">Event Module</option>
          </select>
        </div>

        <div className="flex items-center gap-2">
          <span className="font-bold text-slate-600">Items per page:</span>
          <select
            value={limit}
            onChange={(e) => {
              setLimit(Number(e.target.value));
              setPage(1);
            }}
            className="bg-white border border-slate-200 rounded-lg px-2 py-1 text-xs font-semibold text-secondary focus:outline-none cursor-pointer"
          >
            <option value="10">10</option>
            <option value="20">20</option>
            <option value="50">50</option>
          </select>
        </div>
      </div>

      {/* Notifications Table */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-xs overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-slate-400 font-sans space-y-3">
            <RefreshCw className="w-8 h-8 animate-spin mx-auto text-primary" />
            <p className="text-xs font-bold">Loading live notifications...</p>
          </div>
        ) : items.length === 0 ? (
          <div className="p-12 text-center text-slate-400 font-sans space-y-3">
            <Bell className="w-10 h-10 mx-auto text-slate-300 opacity-60" />
            <p className="text-sm font-bold text-secondary">No notifications found.</p>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              Try adjusting your search terms or filters to locate historical records.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-extrabold uppercase text-slate-500 font-sans">
                  <th className="py-3.5 px-4">Status & Module</th>
                  <th className="py-3.5 px-4">Title & Details</th>
                  <th className="py-3.5 px-4">Priority</th>
                  <th className="py-3.5 px-4">Date & Time</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs font-sans">
                {items.map((notif) => {
                  const id = notif._id || notif.id || '';
                  return (
                    <tr
                      key={id}
                      onClick={() => setSelectedNotif(notif)}
                      className={`hover:bg-slate-50/80 transition-colors cursor-pointer ${
                        !notif.readStatus ? 'bg-amber-50/30 font-semibold' : ''
                      }`}
                    >
                      {/* Type & Read Indicator */}
                      <td className="py-3.5 px-4 align-top">
                        <div className="flex items-center gap-2">
                          <span
                            className={`w-2 h-2 rounded-full shrink-0 ${
                              !notif.readStatus ? 'bg-primary animate-pulse' : 'bg-slate-300'
                            }`}
                          />
                          {getTypeBadge(notif.type)}
                        </div>
                      </td>

                      {/* Title & Message */}
                      <td className="py-3.5 px-4 align-top max-w-md">
                        <p className={`font-serif text-xs ${!notif.readStatus ? 'font-bold text-secondary' : 'font-semibold text-slate-800'}`}>
                          {notif.title}
                        </p>
                        <p className="text-slate-500 text-[11px] line-clamp-2 mt-0.5">
                          {notif.message}
                        </p>
                        {notif.relatedRecordId && (
                          <span className="inline-block mt-1 text-[10px] text-slate-400 font-mono bg-slate-100 px-1.5 py-0.5 rounded">
                            Ref: #{notif.relatedRecordId}
                          </span>
                        )}
                      </td>

                      {/* Priority */}
                      <td className="py-3.5 px-4 align-top">
                        {getPriorityBadge(notif.priority)}
                      </td>

                      {/* Date */}
                      <td className="py-3.5 px-4 align-top whitespace-nowrap text-slate-500 text-[11px]">
                        <div className="flex items-center gap-1.5">
                          <Clock className="w-3.5 h-3.5 text-slate-400" />
                          <span>{formatFullDate(notif.createdAt)}</span>
                        </div>
                      </td>

                      {/* Action buttons */}
                      <td className="py-3.5 px-4 align-top text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1.5" onClick={(e) => e.stopPropagation()}>
                          {!notif.readStatus && (
                            <button
                              onClick={(e) => handleMarkRead(id, e)}
                              className="p-1.5 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors cursor-pointer"
                              title="Mark as Read"
                            >
                              <CheckCheck className="w-4 h-4" />
                            </button>
                          )}
                          <button
                            onClick={() => setSelectedNotif(notif)}
                            className="p-1.5 text-slate-400 hover:text-secondary hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                            title="View Full Details"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={(e) => handleDelete(id, e)}
                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                            title="Delete Notification"
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

        {/* Pagination Bar */}
        {totalPages > 1 && (
          <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between gap-4 text-xs">
            <p className="text-slate-500 font-medium">
              Page <span className="font-bold text-secondary">{page}</span> of{' '}
              <span className="font-bold text-secondary">{totalPages}</span>
            </p>

            <div className="flex items-center gap-1">
              <button
                disabled={page <= 1}
                onClick={() => setPage(p => Math.max(1, p - 1))}
                className="p-2 rounded-xl border border-slate-200 bg-white disabled:opacity-40 text-slate-600 hover:bg-slate-100 cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              {Array.from({ length: totalPages }).map((_, idx) => {
                const pageNum = idx + 1;
                return (
                  <button
                    key={pageNum}
                    onClick={() => setPage(pageNum)}
                    className={`w-8 h-8 rounded-xl font-bold transition-all cursor-pointer ${
                      page === pageNum
                        ? 'bg-secondary text-primary shadow-xs'
                        : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    {pageNum}
                  </button>
                );
              })}
              <button
                disabled={page >= totalPages}
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                className="p-2 rounded-xl border border-slate-200 bg-white disabled:opacity-40 text-slate-600 hover:bg-slate-100 cursor-pointer"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Notification Details Modal */}
      <AnimatePresence>
        {selectedNotif && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-secondary/50 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl border border-slate-100 shadow-2xl max-w-lg w-full overflow-hidden text-left"
            >
              {/* Modal Header */}
              <div className="p-5 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {getTypeBadge(selectedNotif.type)}
                  {getPriorityBadge(selectedNotif.priority)}
                </div>
                <button
                  onClick={() => setSelectedNotif(null)}
                  className="p-1 text-slate-400 hover:text-slate-600 hover:bg-slate-200 rounded-xl transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Modal Body */}
              <div className="p-6 space-y-4">
                <div>
                  <h3 className="font-serif text-lg font-bold text-secondary">
                    {selectedNotif.title}
                  </h3>
                  <p className="text-xs text-slate-400 font-sans mt-0.5">
                    Triggered on {formatFullDate(selectedNotif.createdAt)}
                  </p>
                </div>

                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 text-xs font-sans text-slate-700 leading-relaxed">
                  {selectedNotif.message}
                </div>

                <div className="grid grid-cols-2 gap-3 text-xs font-sans">
                  <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">Related Module</span>
                    <span className="font-bold text-secondary mt-0.5 block">{selectedNotif.relatedModule || 'N/A'}</span>
                  </div>
                  <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">Record Reference</span>
                    <span className="font-mono font-bold text-secondary mt-0.5 block">{selectedNotif.relatedRecordId || 'N/A'}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs text-slate-500 font-sans border-t border-slate-100 pt-3">
                  <span>Source: {selectedNotif.createdBy || 'System Event'}</span>
                  <span className={`font-bold ${selectedNotif.readStatus ? 'text-emerald-600' : 'text-amber-600'}`}>
                    {selectedNotif.readStatus ? 'Read' : 'Unread'}
                  </span>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between gap-3">
                {!selectedNotif.readStatus && (
                  <button
                    onClick={() => {
                      const id = selectedNotif._id || selectedNotif.id;
                      if (id) handleMarkRead(id);
                      setSelectedNotif({ ...selectedNotif, readStatus: true });
                    }}
                    className="px-4 py-2 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-800 text-xs font-bold transition-all cursor-pointer"
                  >
                    Mark as Read
                  </button>
                )}
                <button
                  onClick={() => {
                    navigate(selectedNotif.actionUrl || '/admin/dashboard');
                    setSelectedNotif(null);
                  }}
                  className="ml-auto flex items-center gap-2 px-5 py-2.5 rounded-xl bg-secondary hover:bg-slate-800 text-primary text-xs font-bold transition-all cursor-pointer shadow-md"
                >
                  <span>Open Related Module</span>
                  <ExternalLink className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
