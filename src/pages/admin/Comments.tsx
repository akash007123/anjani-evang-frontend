import { useState, useEffect, useCallback } from 'react';
import { Search, CheckCircle, XCircle, Trash2, Eye, MessageSquare, Loader2 } from 'lucide-react';
import { api } from '../../lib/api';
import DeleteConfirmModal from '../../components/ui/DeleteConfirmModal';
import { getInitials, getAvatarColor } from '../../lib/avatar';
import type { BlogComment } from '../../types';
import SEO from '../../components/SEO';

export default function Comments() {
  const [comments, setComments] = useState<BlogComment[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const [deleteModal, setDeleteModal] = useState<{ isOpen: boolean; id: string; name: string }>({
    isOpen: false, id: '', name: ''
  });
  const [viewComment, setViewComment] = useState<BlogComment | null>(null);

  const fetchComments = useCallback(async () => {
    setLoading(true);
    const res = await api.getAllComments({ page, limit: 20, search, status: statusFilter });
    if (res.success && res.data) {
      setComments(res.data.comments || []);
      setTotal(res.data.total || 0);
      setTotalPages(res.data.totalPages || 1);
    }
    setLoading(false);
  }, [page, search, statusFilter]);

  useEffect(() => {
    fetchComments();
  }, [fetchComments]);

  const handleApprove = async (id: string) => {
    setActionLoading(id);
    await api.approveComment(id);
    setActionLoading(null);
    fetchComments();
  };

  const handleReject = async (id: string) => {
    setActionLoading(id);
    await api.rejectComment(id);
    setActionLoading(null);
    fetchComments();
  };

  const handleDelete = async () => {
    await api.deleteComment(deleteModal.id);
    setDeleteModal({ isOpen: false, id: '', name: '' });
    fetchComments();
  };

  const statusBadge = (status: string) => {
    const styles: Record<string, string> = {
      Pending: 'bg-amber-100 text-amber-700 border-amber-200',
      Approved: 'bg-emerald-100 text-emerald-700 border-emerald-200',
      Rejected: 'bg-rose-100 text-rose-700 border-rose-200'
    };
    return `px-2.5 py-0.5 rounded-full text-[10px] font-bold font-sans border ${styles[status] || 'bg-slate-100 text-slate-600'}`;
  };

  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto">
      <SEO title="Comment Moderation - Admin Panel" description="Moderate reader comments on blog posts and manage comment approvals." urlPath="/admin/comments" />
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-serif font-bold text-secondary">Comments</h1>
          <p className="text-xs text-slate-500 font-sans mt-0.5">{total} total</p>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3 mb-5">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search by name, email, or comment..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-200 text-sm font-sans focus:outline-none focus:border-primary bg-white"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
          className="px-3 py-2 rounded-xl border border-slate-200 text-sm font-sans bg-white focus:outline-none focus:border-primary"
        >
          <option value="All">All Status</option>
          <option value="Pending">Pending</option>
          <option value="Approved">Approved</option>
          <option value="Rejected">Rejected</option>
        </select>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20 text-slate-400">
          <Loader2 className="w-6 h-6 animate-spin mr-2" />
          <span className="text-sm font-sans">Loading comments...</span>
        </div>
      ) : comments.length === 0 ? (
        <div className="text-center py-20 text-slate-400">
          <MessageSquare className="w-12 h-12 mx-auto mb-3 opacity-50" />
          <p className="font-sans text-sm">No comments found</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/50">
                  <th className="text-left px-4 py-3 font-bold font-sans text-[11px] uppercase tracking-wider text-slate-500">Avatar</th>
                  <th className="text-left px-4 py-3 font-bold font-sans text-[11px] uppercase tracking-wider text-slate-500">Name</th>
                  <th className="text-left px-4 py-3 font-bold font-sans text-[11px] uppercase tracking-wider text-slate-500">Type</th>
                  <th className="text-left px-4 py-3 font-bold font-sans text-[11px] uppercase tracking-wider text-slate-500">Blog</th>
                  <th className="text-left px-4 py-3 font-bold font-sans text-[11px] uppercase tracking-wider text-slate-500">Email</th>
                  <th className="text-left px-4 py-3 font-bold font-sans text-[11px] uppercase tracking-wider text-slate-500">Comment</th>
                  <th className="text-left px-4 py-3 font-bold font-sans text-[11px] uppercase tracking-wider text-slate-500">Status</th>
                  <th className="text-left px-4 py-3 font-bold font-sans text-[11px] uppercase tracking-wider text-slate-500">Date</th>
                  <th className="text-right px-4 py-3 font-bold font-sans text-[11px] uppercase tracking-wider text-slate-500">Actions</th>
                </tr>
              </thead>
              <tbody>
                {comments.map((c) => (
                  <tr key={c._id} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors">
                    <td className="px-4 py-3">
                      {c.profileImage ? (
                        <img src={c.profileImage} alt="" className="w-8 h-8 rounded-full object-cover border border-slate-200" />
                      ) : (
                        <div
                          className="w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-[10px]"
                          style={{ backgroundColor: getAvatarColor(c.name) }}
                        >
                          {getInitials(c.name)}
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-3 font-sans font-semibold text-secondary text-xs">{c.name}</td>
                    <td className="px-4 py-3">
                      {c.isReply ? (
                        <span className="text-[10px] font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full border border-indigo-200">
                          Reply
                        </span>
                      ) : (
                        <span className="text-[10px] font-bold text-slate-500 bg-slate-50 px-2 py-0.5 rounded-full border border-slate-200">
                          Comment
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 font-sans text-xs text-slate-600 max-w-[160px] truncate">
                      {(c as any).blogId?.title || '—'}
                    </td>
                    <td className="px-4 py-3 font-sans text-xs text-slate-500">{c.email || '—'}</td>
                    <td className="px-4 py-3 font-sans text-xs text-slate-600 max-w-[220px] truncate">{c.comment}</td>
                    <td className="px-4 py-3"><span className={statusBadge(c.status)}>{c.status}</span></td>
                    <td className="px-4 py-3 font-sans text-[11px] text-slate-400 whitespace-nowrap">
                      {new Date(c.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => setViewComment(c)}
                          className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-secondary transition-colors"
                          title="View"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        {c.status !== 'Approved' && (
                          <button
                            onClick={() => handleApprove(c._id)}
                            disabled={actionLoading === c._id}
                            className="p-1.5 rounded-lg hover:bg-emerald-50 text-slate-400 hover:text-emerald-600 transition-colors disabled:opacity-40"
                            title="Approve"
                          >
                            {actionLoading === c._id ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
                          </button>
                        )}
                        {c.status !== 'Rejected' && (
                          <button
                            onClick={() => handleReject(c._id)}
                            disabled={actionLoading === c._id}
                            className="p-1.5 rounded-lg hover:bg-rose-50 text-slate-400 hover:text-rose-500 transition-colors disabled:opacity-40"
                            title="Reject"
                          >
                            {actionLoading === c._id ? <Loader2 className="w-4 h-4 animate-spin" /> : <XCircle className="w-4 h-4" />}
                          </button>
                        )}
                        <button
                          onClick={() => setDeleteModal({ isOpen: true, id: c._id, name: c.name })}
                          className="p-1.5 rounded-lg hover:bg-rose-50 text-slate-400 hover:text-rose-500 transition-colors"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {totalPages > 1 && (
            <div className="flex items-center justify-between px-4 py-3 border-t border-slate-100">
              <span className="text-xs text-slate-400 font-sans">Page {page} of {totalPages}</span>
              <div className="flex gap-2">
                <button
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page <= 1}
                  className="px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-sans font-semibold disabled:opacity-40 hover:bg-slate-50"
                >
                  Previous
                </button>
                <button
                  onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                  disabled={page >= totalPages}
                  className="px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-sans font-semibold disabled:opacity-40 hover:bg-slate-50"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      <DeleteConfirmModal
        isOpen={deleteModal.isOpen}
        onClose={() => setDeleteModal({ isOpen: false, id: '', name: '' })}
        onConfirm={handleDelete}
        title="Delete Comment"
        itemName={deleteModal.name}
      />

      {viewComment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4" onClick={() => setViewComment(null)}>
          <div className="bg-white rounded-2xl p-6 max-w-lg w-full shadow-xl" onClick={e => e.stopPropagation()}>
            <div className="flex items-start gap-3 mb-4">
              {viewComment.profileImage ? (
                <img src={viewComment.profileImage} alt="" className="w-10 h-10 rounded-full object-cover border border-slate-200" />
              ) : (
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-xs"
                  style={{ backgroundColor: getAvatarColor(viewComment.name) }}
                >
                  {getInitials(viewComment.name)}
                </div>
              )}
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <h3 className="font-serif font-bold text-secondary">{viewComment.name}</h3>
                  {viewComment.isReply ? (
                    <span className="text-[10px] font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full border border-indigo-200">Reply</span>
                  ) : (
                    <span className="text-[10px] font-bold text-slate-500 bg-slate-50 px-2 py-0.5 rounded-full border border-slate-200">Comment</span>
                  )}
                </div>
                <p className="text-[11px] text-slate-400 font-sans">
                  {viewComment.email && <span>{viewComment.email}</span>}
                  {viewComment.mobile && <span className="ml-2">{viewComment.mobile}</span>}
                </p>
              </div>
              <span className={statusBadge(viewComment.status)}>{viewComment.status}</span>
            </div>
            <p className="font-sans text-sm text-slate-600 leading-relaxed mb-3">{viewComment.comment}</p>
            <p className="text-[11px] text-slate-400 font-sans">
              {(viewComment as any).blogId?.title && <>Blog: {(viewComment as any).blogId.title}</>}
              {viewComment.parentCommentId && <span className="ml-2">(Reply)</span>}
            </p>
            <button
              onClick={() => setViewComment(null)}
              className="mt-4 w-full py-2 rounded-xl bg-slate-100 text-sm font-sans font-semibold text-slate-600 hover:bg-slate-200 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
