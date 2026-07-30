import React, { useState, useEffect } from 'react';
import { api } from '../../lib/api';
import { getBookings, updateBookingStatus as updateLocalStatus, deleteBooking as deleteLocalBooking, BookingRequest } from '../../lib/storage';
import { 
  Search, Filter, Trash2, CheckCircle2, Clock, XCircle, 
  Eye, Calendar, AlertCircle, FileText, MapPin, DollarSign,
  ChevronLeft, ChevronRight, RefreshCw, X, Send, Phone, Mail, Utensils
} from 'lucide-react';
import { TableSkeleton } from '../../components/ui/Skeleton';
import DeleteConfirmModal from '../../components/ui/DeleteConfirmModal';
import SEO from '../../components/SEO';

const STATUS_OPTIONS = [
  'New Booking', 'Contacted', 'Quotation Sent', 
  'Payment Pending', 'Confirmed', 'In Progress', 
  'Completed', 'Cancelled'
];

const EVENT_TYPES = [
  'Wedding', 'Reception', 'Birthday Party', 'Corporate Event', 
  'Anniversary', 'Housewarming', 'Festival', 'Engagement', 
  'Baby Shower', 'Private Party', 'Other'
];

function getId(b: any): string {
  return b._id || b.id;
}

export default function Bookings() {
  const [loading, setLoading] = useState(true);
  const [bookings, setBookings] = useState<BookingRequest[]>([]);
  const [totalItems, setTotalItems] = useState(0);

  // Form Filter State (Staged until "Apply Filters" clicked)
  const [searchDraft, setSearchDraft] = useState('');
  const [statusDraft, setStatusDraft] = useState('all');
  const [eventTypeDraft, setEventTypeDraft] = useState('all');
  const [startDateDraft, setStartDateDraft] = useState('');
  const [endDateDraft, setEndDateDraft] = useState('');

  // Applied Filter State (Used for API query / filtering)
  const [appliedFilters, setAppliedFilters] = useState({
    search: '',
    status: 'all',
    eventType: 'all',
    startDate: '',
    endDate: ''
  });

  // Sorting & Pagination
  const [sortBy, setSortBy] = useState<'createdAt' | 'fullName' | 'budget' | 'eventDate'>('createdAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  // Selected Booking for Modal Detail Inspection
  const [selectedBooking, setSelectedBooking] = useState<BookingRequest | null>(null);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Fetch Bookings from API / Local Storage
  const fetchBookings = async () => {
    setLoading(true);
    try {
      const res = await api.getBookings({
        search: appliedFilters.search,
        status: appliedFilters.status !== 'all' ? appliedFilters.status : undefined,
        eventType: appliedFilters.eventType !== 'all' ? appliedFilters.eventType : undefined,
        startDate: appliedFilters.startDate || undefined,
        endDate: appliedFilters.endDate || undefined,
        sortBy,
        sortOrder,
        page: currentPage,
        limit: pageSize
      });

      if (res.success && res.data) {
        if (Array.isArray(res.data.bookings)) {
          setBookings(res.data.bookings);
          setTotalItems(res.data.total || res.data.bookings.length);
        } else if (Array.isArray(res.data)) {
          setBookings(res.data);
          setTotalItems(res.data.length);
        } else {
          fallbackToLocalStorage();
        }
      } else {
        fallbackToLocalStorage();
      }
    } catch {
      fallbackToLocalStorage();
    } finally {
      setLoading(false);
    }
  };

  const fallbackToLocalStorage = () => {
    const local = getBookings();
    let filtered = [...local];

    if (appliedFilters.search) {
      const q = appliedFilters.search.toLowerCase();
      filtered = filtered.filter(b => 
        (b.fullName && b.fullName.toLowerCase().includes(q)) ||
        (b.name && b.name.toLowerCase().includes(q)) ||
        (b.email && b.email.toLowerCase().includes(q)) ||
        (b.phone && b.phone.toLowerCase().includes(q)) ||
        (b.bookingReference && b.bookingReference.toLowerCase().includes(q))
      );
    }
    if (appliedFilters.status !== 'all') {
      filtered = filtered.filter(b => b.status === appliedFilters.status);
    }
    if (appliedFilters.eventType !== 'all') {
      filtered = filtered.filter(b => b.eventType === appliedFilters.eventType);
    }
    if (appliedFilters.startDate) {
      filtered = filtered.filter(b => (b.eventDate || b.date || '') >= appliedFilters.startDate);
    }
    if (appliedFilters.endDate) {
      filtered = filtered.filter(b => (b.eventDate || b.date || '') <= appliedFilters.endDate);
    }

    setTotalItems(filtered.length);
    const start = (currentPage - 1) * pageSize;
    setBookings(filtered.slice(start, start + pageSize));
  };

  useEffect(() => {
    fetchBookings();
  }, [appliedFilters, sortBy, sortOrder, currentPage]);

  const handleApplyFilters = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1);
    setAppliedFilters({
      search: searchDraft,
      status: statusDraft,
      eventType: eventTypeDraft,
      startDate: startDateDraft,
      endDate: endDateDraft
    });
  };

  const handleResetFilters = () => {
    setSearchDraft('');
    setStatusDraft('all');
    setEventTypeDraft('all');
    setStartDateDraft('');
    setEndDateDraft('');
    setCurrentPage(1);
    setAppliedFilters({
      search: '',
      status: 'all',
      eventType: 'all',
      startDate: '',
      endDate: ''
    });
  };

  const handleStatusChange = async (id: string, newStatus: BookingRequest['status']) => {
    setIsUpdatingStatus(true);
    try {
      await api.updateBookingStatus(id, newStatus);
      updateLocalStatus(id, newStatus);
      if (selectedBooking && getId(selectedBooking) === id) {
        setSelectedBooking({ ...selectedBooking, status: newStatus });
      }
      fetchBookings();
    } catch (err) {
      console.error('Failed to update status:', err);
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  const handleDelete = (id: string) => {
    setDeleteTarget(id);
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    try {
      await api.deleteBooking(deleteTarget);
      deleteLocalBooking(deleteTarget);
      if (selectedBooking && getId(selectedBooking) === deleteTarget) {
        setSelectedBooking(null);
      }
      fetchBookings();
    } catch (err) {
      console.error('Failed to delete booking:', err);
    }
    setIsDeleting(false);
    setDeleteTarget(null);
  };

  const totalPages = Math.ceil(totalItems / pageSize) || 1;

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Confirmed':
      case 'approved':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'New Booking':
      case 'pending':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'Contacted':
        return 'bg-sky-50 text-sky-700 border-sky-200';
      case 'Quotation Sent':
        return 'bg-purple-50 text-purple-700 border-purple-200';
      case 'In Progress':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'Completed':
        return 'bg-indigo-50 text-indigo-700 border-indigo-200';
      case 'Cancelled':
        return 'bg-rose-50 text-rose-700 border-rose-200';
      default:
        return 'bg-slate-50 text-slate-700 border-slate-200';
    }
  };

  return (
    <div className="space-y-6">
      <SEO title="Event Bookings - Admin Panel" description="View, filter, and manage all event booking inquiries and catering reservations." urlPath="/admin/bookings" />
      {/* Delete Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={confirmDelete}
        title="Delete Booking"
        itemName="this booking record"
        isLoading={isDeleting}
      />

      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="font-serif text-2xl font-bold text-secondary">
            Booking & Event Management
          </h3>
          <p className="text-xs text-slate-500 mt-1">
            Review event inquiries, manage statuses, filter by date ranges, and oversee catering orders.
          </p>
        </div>
        <button
          onClick={fetchBookings}
          className="self-start sm:self-center inline-flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors shadow-xs"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh Data</span>
        </button>
      </div>

      {/* Filter Toolbar (With explicit "Apply Filters" button requirement) */}
      <form onSubmit={handleApplyFilters} className="bg-white p-5 rounded-2xl border border-slate-100 shadow-xs space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          
          {/* Search Input */}
          <div className="lg:col-span-2 relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={searchDraft}
              onChange={(e) => setSearchDraft(e.target.value)}
              placeholder="Search Name, Email, Phone, Ref #..."
              className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-primary text-secondary"
            />
          </div>

          {/* Status Filter */}
          <div>
            <select
              value={statusDraft}
              onChange={(e) => setStatusDraft(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 focus:outline-none focus:border-primary"
            >
              <option value="all">All Statuses</option>
              {STATUS_OPTIONS.map((st) => (
                <option key={st} value={st}>{st}</option>
              ))}
            </select>
          </div>

          {/* Event Type Filter */}
          <div>
            <select
              value={eventTypeDraft}
              onChange={(e) => setEventTypeDraft(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 focus:outline-none focus:border-primary"
            >
              <option value="all">All Event Types</option>
              {EVENT_TYPES.map((et) => (
                <option key={et} value={et}>{et}</option>
              ))}
            </select>
          </div>

          {/* Sort By Selector */}
          <div>
            <select
              value={`${sortBy}-${sortOrder}`}
              onChange={(e) => {
                const [sb, so] = e.target.value.split('-');
                setSortBy(sb as any);
                setSortOrder(so as any);
              }}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 focus:outline-none focus:border-primary"
            >
              <option value="createdAt-desc">Newest Created First</option>
              <option value="eventDate-asc">Event Date (Ascending)</option>
              <option value="eventDate-desc">Event Date (Descending)</option>
              <option value="budget-desc">Highest Budget First</option>
              <option value="fullName-asc">Customer Name (A-Z)</option>
            </select>
          </div>

        </div>

        {/* Second Row: Date Range & Apply / Reset Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2 border-t border-slate-100">
          
          <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
            <span className="text-xs font-semibold text-slate-500 flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5" /> Date Range:
            </span>
            <input
              type="date"
              value={startDateDraft}
              onChange={(e) => setStartDateDraft(e.target.value)}
              className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700"
            />
            <span className="text-xs text-slate-400">to</span>
            <input
              type="date"
              value={endDateDraft}
              onChange={(e) => setEndDateDraft(e.target.value)}
              className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700"
            />
          </div>

          <div className="flex items-center gap-2.5 w-full sm:w-auto justify-end">
            <button
              type="button"
              onClick={handleResetFilters}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold transition-colors cursor-pointer"
            >
              Reset
            </button>

            {/* MANDATORY: Filter only triggers on clicking "Apply Filters" */}
            <button
              type="submit"
              className="px-5 py-2 bg-primary hover:bg-primary-hover text-secondary font-bold rounded-xl text-xs transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
            >
              <Filter className="w-3.5 h-3.5" />
              <span>Apply Filters</span>
            </button>
          </div>

        </div>
      </form>

      {/* Bookings Table Component */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-xs overflow-hidden">
        {loading ? (
          <div className="p-6">
            <TableSkeleton rows={6} cols={7} />
          </div>
        ) : bookings.length === 0 ? (
          <div className="text-center py-20 text-slate-400 flex flex-col items-center gap-3">
            <Calendar className="w-12 h-12 text-slate-200 stroke-1" />
            <div>
              <p className="text-sm font-bold text-slate-600">No bookings found</p>
              <p className="text-xs text-slate-400 mt-1">Try adjusting search keywords or filters.</p>
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse font-sans text-xs sm:text-sm">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  <th className="py-3.5 px-4">Ref # / ID</th>
                  <th className="py-3.5 px-4">Customer Name</th>
                  <th className="py-3.5 px-4">Contact</th>
                  <th className="py-3.5 px-4">Event & Guests</th>
                  <th className="py-3.5 px-4">Event Date</th>
                  <th className="py-3.5 px-4">Budget (₹)</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-secondary">
                {bookings.map((b, idx) => {
                  const displayName = b.fullName || b.name || 'Anonymous';
                  const displayPhone = b.phone || b.mobile || 'N/A';
                  const displayGuests = b.guestCount || b.guests || '10+';
                  const displayDate = b.eventDate || b.date || '';
                  const bookingId = getId(b);
                  const displayRef = b.bookingReference || (bookingId ? bookingId.toUpperCase() : 'N/A');

                  return (
                    <tr 
                      key={bookingId || idx} 
                      className="hover:bg-slate-50/70 transition-colors cursor-pointer"
                      onClick={() => setSelectedBooking(b)}
                    >
                      <td className="py-4 px-4 font-mono text-xs font-bold text-primary">
                        {displayRef}
                      </td>

                      <td className="py-4 px-4 font-bold text-secondary">
                        {displayName}
                      </td>

                      <td className="py-4 px-4">
                        <div className="text-xs text-slate-600 font-medium">{b.email}</div>
                        <div className="text-[11px] text-slate-400">{displayPhone}</div>
                      </td>

                      <td className="py-4 px-4">
                        <span className="font-bold text-secondary block">{b.eventType || 'Event'}</span>
                        <span className="text-[11px] text-slate-400">{displayGuests} Guests</span>
                      </td>

                      <td className="py-4 px-4 font-bold text-slate-700 whitespace-nowrap">
                        {displayDate ? new Date(displayDate).toLocaleDateString('en-IN', {
                          day: 'numeric', month: 'short', year: 'numeric'
                        }) : 'TBD'}
                      </td>

                      <td className="py-4 px-4 font-bold text-emerald-700 whitespace-nowrap">
                        ₹{(b.budget || 0).toLocaleString('en-IN')}
                      </td>

                      <td className="py-4 px-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold border ${getStatusBadge(b.status)}`}>
                          {b.status}
                        </span>
                      </td>

                      <td className="py-4 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                        <div className="flex justify-end gap-1.5">
                          <button
                            onClick={() => setSelectedBooking(b)}
                            className="p-1.5 border border-slate-200 hover:bg-slate-100 rounded-lg text-slate-600 transition-colors"
                            title="View Full Booking Details"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(bookingId)}
                            className="p-1.5 border border-slate-200 hover:bg-rose-50 hover:text-rose-600 rounded-lg text-slate-400 transition-colors"
                            title="Delete Record"
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
        <div className="p-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-semibold text-slate-500">
          <div>
            Showing <span className="text-secondary font-bold">{bookings.length}</span> of <span className="text-secondary font-bold">{totalItems}</span> total bookings
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="p-2 border border-slate-200 rounded-xl hover:bg-slate-50 disabled:opacity-40 transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            <span className="px-3 py-1 bg-slate-100 rounded-xl text-secondary font-bold">
              Page {currentPage} of {totalPages}
            </span>

            <button
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="p-2 border border-slate-200 rounded-xl hover:bg-slate-50 disabled:opacity-40 transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Booking Details Modal */}
      {selectedBooking && (
        <div className="fixed inset-0 z-50 bg-secondary/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 border border-slate-100 shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto animate-fade-in">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <span className="text-[10px] font-bold text-primary uppercase tracking-widest">
                  Ref #{selectedBooking.bookingReference || (getId(selectedBooking) || '').toUpperCase()}
                </span>
                <h3 className="font-serif text-2xl font-bold text-secondary mt-0.5">
                  Booking Details
                </h3>
              </div>
              <button
                onClick={() => setSelectedBooking(null)}
                className="p-2 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Status Change Selector */}
            <div className="bg-amber-50/60 p-4 rounded-2xl border border-amber-200 flex flex-col sm:flex-row items-center justify-between gap-3">
              <span className="text-xs font-bold text-amber-900">Current Status:</span>
              <div className="flex items-center gap-2">
                <select
                  value={selectedBooking.status}
                  onChange={(e) => handleStatusChange(getId(selectedBooking), e.target.value as any)}
                  disabled={isUpdatingStatus}
                  className="px-3 py-1.5 bg-white border border-amber-300 rounded-xl text-xs font-bold text-secondary focus:outline-none"
                >
                  {STATUS_OPTIONS.map((st) => (
                    <option key={st} value={st}>{st}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Grid Breakdown */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              
              <div className="p-4 bg-slate-50 rounded-2xl space-y-2">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Customer Information</span>
                <p className="font-bold text-sm text-secondary">{selectedBooking.fullName || selectedBooking.name}</p>
                <p className="text-slate-600 flex items-center gap-1.5"><Mail className="w-3.5 h-3.5 text-primary" /> {selectedBooking.email}</p>
                <p className="text-slate-600 flex items-center gap-1.5"><Phone className="w-3.5 h-3.5 text-primary" /> {selectedBooking.phone || selectedBooking.mobile || 'N/A'}</p>
              </div>

              <div className="p-4 bg-slate-50 rounded-2xl space-y-2">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Event Logistics</span>
                <p className="font-bold text-sm text-secondary">{selectedBooking.eventType || 'Event'}</p>
                <p className="text-slate-600 flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5 text-primary" /> {selectedBooking.eventDate || selectedBooking.date} at {selectedBooking.eventTime || '12:00 PM'}</p>
                <p className="text-slate-600 flex items-center gap-1.5"><Clock className="w-3.5 h-3.5 text-primary" /> Guests: {selectedBooking.guestCount || selectedBooking.guests || 10}</p>
              </div>

              <div className="p-4 bg-slate-50 rounded-2xl space-y-2">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Catering & Package</span>
                <p className="font-bold text-slate-700 flex items-center gap-1.5"><Utensils className="w-3.5 h-3.5 text-primary" /> {selectedBooking.cateringPackage || 'Royal Buffet'}</p>
                <p className="text-slate-600">Preferred Cuisine: <strong className="text-secondary">{selectedBooking.preferredCuisine || 'Multi Cuisine'}</strong></p>
                <p className="text-emerald-700 font-bold text-sm">Budget: ₹{(selectedBooking.budget || 0).toLocaleString('en-IN')}</p>
              </div>

              <div className="p-4 bg-slate-50 rounded-2xl space-y-2">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Venue Location</span>
                <p className="text-slate-700 font-semibold flex items-start gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-primary shrink-0 mt-0.5" />
                  <span>{selectedBooking.venueAddress || 'Address not provided'}</span>
                </p>
                <p className="text-slate-500">
                  {selectedBooking.city ? `${selectedBooking.city}, ${selectedBooking.state || ''} - ${selectedBooking.pincode || ''}` : ''}
                </p>
              </div>

            </div>

            {/* Special Requirements */}
            {(selectedBooking.specialRequirements || selectedBooking.notes) && (
              <div className="p-4 bg-slate-50 rounded-2xl space-y-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Special Requests & Notes</span>
                <p className="text-xs text-slate-700 italic">
                  "{selectedBooking.specialRequirements || selectedBooking.notes}"
                </p>
              </div>
            )}

            {/* Modal Actions */}
            <div className="flex justify-between items-center pt-4 border-t border-slate-100">
              <a 
                href={`mailto:${selectedBooking.email}?subject=Regarding Your Anjani Catering & Events Booking Ref %23${selectedBooking.bookingReference || getId(selectedBooking)}`}
                className="inline-flex items-center gap-2 px-4 py-2 bg-secondary text-white rounded-xl text-xs font-bold hover:bg-secondary/90 transition-colors"
              >
                <Send className="w-3.5 h-3.5" /> Email Customer
              </a>

              <button
                onClick={() => setSelectedBooking(null)}
                className="px-5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-colors"
              >
                Close
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
