import React, { useState, useEffect, useMemo } from 'react';
import { api } from '../../lib/api';
import { 
  Search, Trash2, Mail, CheckCircle2, Clock, Eye, AlertCircle, 
  XCircle, ArrowDownToLine, Phone, Calendar, Users, Send, Check 
} from 'lucide-react';
import { TableSkeleton } from '../../components/ui/Skeleton';
import DeleteConfirmModal from '../../components/ui/DeleteConfirmModal';

export default function Contacts() {
  const [loading, setLoading] = useState(true);
  const [contacts, setContacts] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedInquiry, setSelectedInquiry] = useState<any | null>(null);
  const [showExportToast, setShowExportToast] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<any | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    fetchContacts();
  }, []);

  const fetchContacts = async () => {
    setLoading(true);
    try {
      const res = await api.getContacts();
      if (res.success && res.data) {
        const list = Array.isArray(res.data) ? res.data : res.data.contacts || [];
        setContacts(list);
      }
    } catch (err) {
      console.error('Failed to fetch contacts', err);
    }
    setLoading(false);
  };

  const handleStatusChange = async (id: string, status: string) => {
    try {
      await api.updateContactStatus(id, status);
      setContacts(prev => prev.map(c => c._id === id || c.id === id ? { ...c, status } : c));
      if (selectedInquiry && (selectedInquiry._id === id || selectedInquiry.id === id)) {
        setSelectedInquiry(prev => prev ? { ...prev, status } : null);
      }
    } catch (err) {
      console.error('Failed to update contact status', err);
    }
  };

  const handleDelete = async (id: string) => {
    const target = contacts.find(c => (c._id === id || c.id === id));
    setDeleteTarget(target || id);
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    const id = deleteTarget._id || deleteTarget.id || deleteTarget;
    setIsDeleting(true);
    try {
      await api.deleteContact(id);
      setContacts(prev => prev.filter(c => c._id !== id && c.id !== id));
      if (selectedInquiry && (selectedInquiry._id === id || selectedInquiry.id === id)) {
        setSelectedInquiry(null);
      }
    } catch (err) {
      console.error('Failed to delete contact', err);
    }
    setIsDeleting(false);
    setDeleteTarget(null);
  };

  const handleExport = () => {
    setShowExportToast(true);
    setTimeout(() => setShowExportToast(false), 3000);

    // Dynamic client-side download simulation of inquiries csv
    const csvContent = "data:text/csv;charset=utf-8," 
      + ["ID,Name,Email,Phone,Event Date,Guests,Message,Status,Created At"].join(",") + "\n"
      + contacts.map(c => [
          c._id || c.id, 
          `"${c.name}"`, 
          c.email, 
          c.phone || '', 
          c.eventDate || '', 
          c.guestCount || c.guests || '', 
          `"${c.message.replace(/"/g, '""')}"`, 
          c.status, 
          c.createdAt
        ].join(",")).join("\n");
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `eveng_inquiries_export_${new Date().toISOString().slice(0,10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const filteredContacts = useMemo(() => {
    return contacts.filter(c => {
      const matchSearch = c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          c.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          c.message.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          (c.phone && c.phone.includes(searchQuery));
      const matchStatus = statusFilter === 'all' || c.status === statusFilter;
      return matchSearch && matchStatus;
    });
  }, [contacts, searchQuery, statusFilter]);

  return (
    <div className="space-y-6 relative">
      {/* Delete Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={confirmDelete}
        title="Delete Inquiry"
        itemName={deleteTarget?.name ? `"${deleteTarget.name}"'s inquiry` : 'this inquiry'}
        isLoading={isDeleting}
      />

      {/* Toast Notification */}
      {showExportToast && (
        <div className="fixed bottom-6 right-6 bg-slate-950 text-white px-5 py-3 rounded-2xl shadow-2xl flex items-center gap-3 z-50 animate-bounce font-sans text-xs sm:text-sm font-bold border border-white/10">
          <Check className="w-5 h-5 text-emerald-400" />
          <span>Simulated CSV spreadsheet successfully downloaded!</span>
        </div>
      )}

      {/* Header Meta Info */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="font-serif text-xl sm:text-2xl font-bold text-secondary">
            Client Inquiry Inbox
          </h3>
          <p className="text-xs text-slate-400 font-semibold mt-0.5 font-sans">
            Oversee corporate briefs, wedding proposal lists, and private tasting requests.
          </p>
        </div>
        <button
          onClick={handleExport}
          className="flex items-center gap-2 px-4 py-2.5 bg-primary hover:bg-primary-hover text-secondary font-bold text-xs sm:text-sm rounded-xl shadow-xs hover:shadow-md transition-all self-start sm:self-auto cursor-pointer"
        >
          <ArrowDownToLine className="w-4 h-4" />
          <span>Export Inquiries CSV</span>
        </button>
      </div>

      {/* Control Filter Toolbar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-xs flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Search */}
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search name, phone, keywords..."
            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-100 rounded-xl text-xs font-semibold focus:outline-none focus:border-primary text-secondary placeholder-slate-400"
          />
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto justify-end">
          {['all', 'new', 'reviewed', 'responded'].map((status) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold capitalize transition-all cursor-pointer ${
                statusFilter === status
                  ? 'bg-secondary text-white shadow-xs'
                  : 'bg-slate-50 hover:bg-slate-100 text-slate-500 border border-slate-100'
              }`}
            >
              {status}
            </button>
          ))}
        </div>
      </div>

      {/* Main Grid Panel */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 items-start">
        {/* Inbox List Table */}
        <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden xl:col-span-2 p-4">
          {loading ? (
            <TableSkeleton rows={5} cols={5} />
          ) : filteredContacts.length === 0 ? (
            <div className="text-center py-20 text-slate-400 flex flex-col items-center gap-3 font-sans">
              <Mail className="w-12 h-12 text-slate-200 stroke-1" />
              <div>
                <p className="text-sm font-bold">No client messages match criteria.</p>
                <p className="text-xs font-semibold text-slate-400 mt-0.5">Try widening search tags or parameters.</p>
              </div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse font-sans text-xs sm:text-sm">
                <thead>
                  <tr className="bg-slate-50/50 border-b border-slate-100 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    <th className="py-4 px-5">Client</th>
                    <th className="py-4 px-5">Message Brief</th>
                    <th className="py-4 px-5">Event Profile</th>
                    <th className="py-4 px-5">Status</th>
                    <th className="py-4 px-5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50 font-medium text-secondary">
                  {filteredContacts.map((c) => (
                    <tr 
                      key={c._id || c.id} 
                      className={`hover:bg-slate-50/50 transition-colors cursor-pointer ${
                        (selectedInquiry?._id || selectedInquiry?.id) === (c._id || c.id) ? 'bg-primary/5 border-l-4 border-l-primary' : ''
                      }`}
                      onClick={() => setSelectedInquiry(c)}
                    >
                      <td className="py-4 px-5">
                        <p className="font-bold">{c.name}</p>
                        <span className="text-[10px] text-slate-400 font-semibold block mt-0.5">{c.email}</span>
                      </td>
                      <td className="py-4 px-5 max-w-xs">
                        <p className="text-slate-600 line-clamp-1 font-semibold">"{c.message}"</p>
                        <span className="text-[10px] text-slate-400 font-semibold block mt-1">Received: {new Date(c.createdAt).toLocaleDateString()}</span>
                      </td>
                      <td className="py-4 px-5">
                        {c.eventDate ? (
                          <div className="text-slate-600 font-bold text-xs space-y-0.5">
                            <p>{new Date(c.eventDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</p>
                            <p className="text-[10px] text-slate-400 font-semibold">({c.guestCount || c.guests || '0'} guests)</p>
                          </div>
                        ) : (
                          <span className="text-slate-400 italic text-xs font-semibold">No target date</span>
                        )}
                      </td>
                      <td className="py-4 px-5">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[9px] font-bold uppercase tracking-wider ${
                          c.status === 'new' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' :
                          c.status === 'reviewed' ? 'bg-amber-50 text-amber-700 border border-amber-100' :
                          'bg-indigo-50 text-indigo-700 border border-indigo-100'
                        }`}>
                          {c.status === 'new' && <Clock className="w-2.5 h-2.5" />}
                          {c.status === 'reviewed' && <Eye className="w-2.5 h-2.5" />}
                          {c.status === 'responded' && <CheckCircle2 className="w-2.5 h-2.5" />}
                          <span>{c.status}</span>
                        </span>
                      </td>
                      <td className="py-4 px-5 text-right" onClick={(e) => e.stopPropagation()}>
                        <div className="flex justify-end gap-1.5">
                          <button 
                            onClick={() => setSelectedInquiry(c)}
                            className="p-2 border border-slate-100 hover:bg-slate-50 rounded-xl text-slate-500 cursor-pointer"
                            title="Inspect Message"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={() => handleDelete(c._id || c.id)}
                            className="p-2 border border-slate-100 hover:bg-rose-50 text-slate-400 hover:text-rose-600 rounded-xl transition-colors cursor-pointer"
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
          )}
        </div>

        {/* Detailed Message Drawer Panel */}
        <div className="bg-white rounded-3xl border border-slate-100 p-6 shadow-sm text-left">
          {selectedInquiry ? (
            <div className="space-y-6 animate-fade-in font-sans">
              <div className="flex items-center justify-between border-b border-slate-50 pb-4">
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest font-mono">Inquiry ID: {((selectedInquiry._id || selectedInquiry.id) || '').toString().toUpperCase()}</span>
                  <h4 className="font-serif text-lg font-bold text-secondary mt-1 font-sans">Message Detail</h4>
                </div>
                <button 
                  onClick={() => setSelectedInquiry(null)}
                  className="p-1 rounded-lg hover:bg-slate-50 text-slate-400"
                >
                  <XCircle className="w-5 h-5" />
                </button>
              </div>

              {/* Client Contacts Block */}
              <div className="space-y-3 text-left">
                <h5 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Client Profile & Contact</h5>
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-3">
                  <div>
                    <span className="text-[9px] text-slate-400 font-bold block">CLIENT NAME</span>
                    <p className="font-bold text-secondary text-sm">{selectedInquiry.name}</p>
                  </div>
                  <div>
                    <span className="text-[9px] text-slate-400 font-bold block">EMAIL ADDRESS</span>
                    <a href={`mailto:${selectedInquiry.email}`} className="text-xs text-primary font-semibold underline mt-0.5 block">{selectedInquiry.email}</a>
                  </div>
                  {selectedInquiry.phone && (
                    <div>
                      <span className="text-[9px] text-slate-400 font-bold block">PHONE NUMBER</span>
                      <p className="text-xs text-slate-600 font-semibold flex items-center gap-1.5 mt-0.5">
                        <Phone className="w-3.5 h-3.5 text-slate-400" />
                        <span>{selectedInquiry.phone}</span>
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Event Briefs */}
              {(selectedInquiry.eventDate || selectedInquiry.guestCount || selectedInquiry.guests) && (
                <div className="space-y-3 text-left">
                  <h5 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Event Parameters</h5>
                  <div className="grid grid-cols-2 gap-3">
                    {selectedInquiry.eventDate && (
                      <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                        <span className="text-[8px] text-slate-400 font-bold block">TARGET DATE</span>
                        <p className="text-xs font-bold text-slate-700 mt-1 flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5 text-primary" />
                          <span>{new Date(selectedInquiry.eventDate).toLocaleDateString()}</span>
                        </p>
                      </div>
                    )}
                    {(selectedInquiry.guestCount || selectedInquiry.guests) && (
                      <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                        <span className="text-[8px] text-slate-400 font-bold block">EXPECTED GUESTS</span>
                        <p className="text-xs font-bold text-slate-700 mt-1 flex items-center gap-1.5">
                          <Users className="w-3.5 h-3.5 text-primary" />
                          <span>{selectedInquiry.guestCount || selectedInquiry.guests} guests</span>
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Inquiry Message Text */}
              <div className="space-y-3 text-left">
                <h5 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Brief Message Proposal</h5>
                <div className="p-4 bg-amber-50/50 border border-amber-100 rounded-2xl">
                  <p className="text-xs sm:text-sm text-slate-700 leading-relaxed font-semibold italic">
                    "{selectedInquiry.message}"
                  </p>
                </div>
              </div>

              {/* Status Adjustments */}
              <div className="space-y-3 text-left">
                <h5 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Actionable Status</h5>
                <div className="grid grid-cols-3 gap-2 text-center text-xs font-bold">
                  <button
                    onClick={() => handleStatusChange(selectedInquiry._id || selectedInquiry.id, 'new')}
                    className={`py-2 px-1 rounded-xl border transition-all cursor-pointer ${
                      selectedInquiry.status === 'new' 
                        ? 'bg-rose-500 border-rose-500 text-white shadow-xs' 
                        : 'border-slate-200 hover:bg-slate-50 text-slate-600'
                    }`}
                  >
                    <span>Unread</span>
                  </button>
                  <button
                    onClick={() => handleStatusChange(selectedInquiry._id || selectedInquiry.id, 'reviewed')}
                    className={`py-2 px-1 rounded-xl border transition-all cursor-pointer ${
                      selectedInquiry.status === 'reviewed' 
                        ? 'bg-amber-500 border-amber-500 text-white shadow-xs' 
                        : 'border-slate-200 hover:bg-slate-50 text-slate-600'
                    }`}
                  >
                    <span>Review</span>
                  </button>
                  <button
                    onClick={() => handleStatusChange(selectedInquiry._id || selectedInquiry.id, 'responded')}
                    className={`py-2 px-1 rounded-xl border transition-all cursor-pointer ${
                      selectedInquiry.status === 'responded' 
                        ? 'bg-emerald-500 border-emerald-500 text-white shadow-xs' 
                        : 'border-slate-200 hover:bg-slate-50 text-slate-600'
                    }`}
                  >
                    <span>Respond</span>
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="py-24 text-center text-slate-400 space-y-3.5">
              <Mail className="w-10 h-10 text-slate-200 mx-auto stroke-1" />
              <div className="font-sans">
                <p className="text-xs font-bold text-secondary">No inquiry selected</p>
                <p className="text-[11px] text-slate-400 font-semibold mt-0.5">Click any message in the inbox table ledger to inspect detailed fields, email clients, or archive.</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
