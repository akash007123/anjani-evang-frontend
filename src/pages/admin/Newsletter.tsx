import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Send, Search, Filter, RefreshCw, Trash2, Download, 
  ChevronLeft, ChevronRight, Check, AlertCircle, Mail, CheckSquare, Square
} from 'lucide-react';
import { api } from '../../lib/api';
import SEO from '../../components/SEO';

interface Subscriber {
  _id?: string;
  id?: string;
  email: string;
  subscribedAt: string;
  status: 'Active' | 'Inactive';
  source?: string;
}

export default function NewsletterManagement() {
  const [subscribers, setSubscribers] = useState<Subscriber[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [pendingStatus, setPendingStatus] = useState<string>('All');
  const [pendingSource, setPendingSource] = useState<string>('All');

  const [activeStatus, setActiveStatus] = useState<string>('All');
  const [activeSource, setActiveSource] = useState<string>('All');

  const [page, setPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [totalCount, setTotalCount] = useState<number>(0);

  // Selection for bulk actions
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [isBulkDeleting, setIsBulkDeleting] = useState<boolean>(false);

  // Toast
  const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const showToast = (type: 'success' | 'error', message: string) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 3500);
  };

  const fetchSubscribers = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.getNewsletterSubscribers({
        search: searchQuery,
        status: activeStatus,
        source: activeSource,
        page,
        limit: 10
      });

      if (res.success && res.data) {
        setSubscribers(res.data.subscribers || []);
        setTotalCount(res.data.total || 0);
        setTotalPages(res.data.totalPages || 1);
      } else {
        setError(res.error || 'Failed to fetch subscribers');
      }
    } catch (err: any) {
      setError(err.message || 'Error loading subscriber data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubscribers();
  }, [activeStatus, activeSource, page]);

  const handleApplyFilters = () => {
    setActiveStatus(pendingStatus);
    setActiveSource(pendingSource);
    setPage(1);
  };

  const handleResetFilters = () => {
    setPendingStatus('All');
    setPendingSource('All');
    setActiveStatus('All');
    setActiveSource('All');
    setSearchQuery('');
    setPage(1);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchSubscribers();
  };

  const handleToggleSelectAll = () => {
    if (selectedIds.length === subscribers.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(subscribers.map(s => s._id || s.id || '').filter(Boolean));
    }
  };

  const handleToggleSelectOne = (id: string) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter(i => i !== id));
    } else {
      setSelectedIds([...selectedIds, id]);
    }
  };

  const handleDeleteOne = async () => {
    if (!deletingId) return;
    try {
      const res = await api.deleteSubscriber(deletingId);
      if (res.success) {
        showToast('success', 'Subscriber deleted');
        setDeletingId(null);
        setSelectedIds(selectedIds.filter(i => i !== deletingId));
        fetchSubscribers();
      } else {
        showToast('error', res.error || 'Failed to delete subscriber');
      }
    } catch (err: any) {
      showToast('error', 'Error deleting subscriber');
    }
  };

  const handleBulkDelete = async () => {
    if (selectedIds.length === 0) return;
    try {
      const res = await api.bulkDeleteSubscribers(selectedIds);
      if (res.success) {
        showToast('success', `${selectedIds.length} subscribers deleted`);
        setIsBulkDeleting(false);
        setSelectedIds([]);
        fetchSubscribers();
      } else {
        showToast('error', res.error || 'Bulk delete failed');
      }
    } catch (err: any) {
      showToast('error', 'Bulk deletion failed');
    }
  };

  const handleExportCSV = async () => {
    try {
      const baseUrl = (import.meta as any).env?.VITE_API_URL || '/api';
      window.open(`${baseUrl}/newsletter/export`, '_blank');
      showToast('success', 'Downloading CSV export...');
    } catch (err) {
      showToast('error', 'Failed to export CSV');
    }
  };

  const handleToggleStatus = async (subscriber: Subscriber) => {
    const id = subscriber._id || subscriber.id;
    if (!id) return;
    const newStatus = subscriber.status === 'Active' ? 'Inactive' : 'Active';
    try {
      const res = await api.updateSubscriberStatus(id, newStatus);
      if (res.success) {
        showToast('success', `Status updated to ${newStatus}`);
        fetchSubscribers();
      }
    } catch (err) {
      showToast('error', 'Failed to update subscriber status');
    }
  };

  return (
    <div className="p-6 md:p-8 space-y-8 max-w-7xl mx-auto">
      <SEO title="Newsletter Subscribers - Admin Panel" description="Manage email newsletter subscribers and send campaign broadcasts." urlPath="/admin/newsletter" />
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
              <Send className="w-5 h-5" />
            </span>
            <h1 className="text-2xl font-serif font-bold text-secondary">Newsletter Subscribers</h1>
          </div>
          <p className="text-slate-500 text-xs sm:text-sm mt-1">
            Manage email marketing leads, view sources, filter subscribers, and export CSV files.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {selectedIds.length > 0 && (
            <button
              onClick={() => setIsBulkDeleting(true)}
              className="inline-flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-rose-600 text-white font-bold text-xs shadow-md hover:bg-rose-700 cursor-pointer"
            >
              <Trash2 className="w-4 h-4" />
              Delete Selected ({selectedIds.length})
            </button>
          )}

          <button
            onClick={handleExportCSV}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-secondary text-white font-bold text-xs sm:text-sm shadow-md hover:bg-secondary/90 transition-all cursor-pointer"
          >
            <Download className="w-4 h-4 text-primary" />
            Export CSV
          </button>
        </div>
      </div>

      {/* Search & Filter Controls */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
        <div className="flex flex-col lg:flex-row gap-4 items-stretch lg:items-center justify-between">
          
          <form onSubmit={handleSearchSubmit} className="flex-1 relative min-w-[280px]">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search subscribers by email address..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm focus:outline-none focus:border-primary font-sans"
            />
          </form>

          <div className="flex flex-wrap items-center gap-3">
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

            <div className="flex items-center gap-2">
              <label className="text-xs font-bold text-slate-500">Source:</label>
              <select
                value={pendingSource}
                onChange={(e) => setPendingSource(e.target.value)}
                className="px-3 py-2 rounded-xl border border-slate-200 text-xs font-medium bg-slate-50 focus:outline-none focus:border-primary"
              >
                <option value="All">All Sources</option>
                <option value="Website Footer">Website Footer</option>
                <option value="Quote Popup">Quote Popup</option>
                <option value="Menu Download">Menu Download</option>
                <option value="Checkout Banner">Checkout Banner</option>
              </select>
            </div>

            <button
              onClick={handleApplyFilters}
              className="px-4 py-2 rounded-xl bg-secondary text-white font-bold text-xs hover:bg-secondary/90 flex items-center gap-1.5 cursor-pointer shadow-xs"
            >
              <Filter className="w-3.5 h-3.5" />
              Apply Filters
            </button>

            {(activeStatus !== 'All' || activeSource !== 'All' || searchQuery) && (
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
            <p className="text-sm font-semibold">Loading subscribers list...</p>
          </div>
        ) : error ? (
          <div className="p-12 text-center text-rose-500 space-y-2">
            <AlertCircle className="w-8 h-8 mx-auto text-rose-400" />
            <p className="text-sm font-bold">{error}</p>
            <button onClick={fetchSubscribers} className="text-xs text-primary underline mt-2 cursor-pointer">Retry</button>
          </div>
        ) : subscribers.length === 0 ? (
          <div className="p-12 text-center text-slate-400 space-y-3">
            <Mail className="w-12 h-12 mx-auto text-slate-300" />
            <p className="text-base font-bold text-slate-600">No newsletter subscribers found</p>
            <p className="text-xs text-slate-400">Subscribers who sign up via website footers or popups will appear here.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-[11px] uppercase tracking-wider text-slate-500 font-bold">
                  <th className="py-3.5 px-4 w-10">
                    <button onClick={handleToggleSelectAll} className="cursor-pointer">
                      {selectedIds.length === subscribers.length ? (
                        <CheckSquare className="w-4 h-4 text-primary" />
                      ) : (
                        <Square className="w-4 h-4 text-slate-400" />
                      )}
                    </button>
                  </th>
                  <th className="py-3.5 px-4">Email Address</th>
                  <th className="py-3.5 px-4">Subscription Source</th>
                  <th className="py-3.5 px-4">Subscribed Date</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs font-sans text-slate-700">
                {subscribers.map((sub) => {
                  const id = sub._id || sub.id || '';
                  const isSelected = selectedIds.includes(id);
                  return (
                    <tr key={id} className={`hover:bg-slate-50/70 transition-colors ${isSelected ? 'bg-amber-50/40' : ''}`}>
                      <td className="py-3.5 px-4">
                        <button onClick={() => handleToggleSelectOne(id)} className="cursor-pointer">
                          {isSelected ? (
                            <CheckSquare className="w-4 h-4 text-primary" />
                          ) : (
                            <Square className="w-4 h-4 text-slate-300 hover:text-slate-500" />
                          )}
                        </button>
                      </td>
                      <td className="py-3.5 px-4 font-bold text-slate-900">
                        {sub.email}
                      </td>
                      <td className="py-3.5 px-4 font-medium text-slate-600">
                        <span className="px-2.5 py-1 rounded-full bg-slate-100 text-slate-700 text-[10px]">
                          {sub.source || 'Website'}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 font-mono text-slate-500 text-[11px]">
                        {new Date(sub.subscribedAt || Date.now()).toLocaleDateString()}
                      </td>
                      <td className="py-3.5 px-4">
                        <button
                          onClick={() => handleToggleStatus(sub)}
                          className={`px-2.5 py-1 rounded-full text-[10px] font-bold transition-all cursor-pointer ${
                            sub.status === 'Active'
                              ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                              : 'bg-rose-100 text-rose-800 border border-rose-200'
                          }`}
                        >
                          {sub.status}
                        </button>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <button
                          onClick={() => setDeletingId(id)}
                          className="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                          title="Delete Subscriber"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
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
            <span>Showing page <b>{page}</b> of <b>{totalPages}</b> ({totalCount} total subscribers)</span>
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

      {/* Delete One Modal */}
      {deletingId && (
        <div className="fixed inset-0 z-50 bg-secondary/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 text-center space-y-4 shadow-xl border border-slate-200">
            <div className="w-12 h-12 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">Delete Subscriber</h3>
              <p className="text-xs text-slate-500 mt-1">
                Are you sure you want to remove this subscriber email from your newsletter list?
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
                onClick={handleDeleteOne}
                className="px-4 py-2 rounded-xl bg-rose-600 text-white font-bold text-xs hover:bg-rose-700 cursor-pointer shadow-sm"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Bulk Delete Modal */}
      {isBulkDeleting && (
        <div className="fixed inset-0 z-50 bg-secondary/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 text-center space-y-4 shadow-xl border border-slate-200">
            <div className="w-12 h-12 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">Confirm Bulk Delete</h3>
              <p className="text-xs text-slate-500 mt-1">
                Are you sure you want to delete <b>{selectedIds.length}</b> selected subscribers?
              </p>
            </div>
            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                onClick={() => setIsBulkDeleting(false)}
                className="px-4 py-2 rounded-xl bg-slate-100 text-slate-600 font-bold text-xs hover:bg-slate-200 cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleBulkDelete}
                className="px-4 py-2 rounded-xl bg-rose-600 text-white font-bold text-xs hover:bg-rose-700 cursor-pointer shadow-sm"
              >
                Delete All Selected
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
