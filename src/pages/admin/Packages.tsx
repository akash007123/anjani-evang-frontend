import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Plus, Search, Filter, RefreshCw, Trash2, Edit3, Eye, 
  ChevronLeft, ChevronRight, Check, AlertCircle, Package as PackageIcon, X, Star, Users
} from 'lucide-react';
import { api } from '../../lib/api';
import SEO from '../../components/SEO';

interface CateringPackage {
  _id?: string;
  id?: string;
  name: string;
  description: string;
  price: number;
  minGuests: number;
  maxGuests: number;
  includedServices: string[];
  includedDishes: string[];
  image: string;
  popular: boolean;
  featured: boolean;
  status: 'Active' | 'Inactive';
  createdAt?: string;
}

export default function PackagesManagement() {
  const [packagesList, setPackagesList] = useState<CateringPackage[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Search & Filter
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [pendingStatus, setPendingStatus] = useState<string>('All');
  const [activeStatus, setActiveStatus] = useState<string>('All');

  const [sortBy, setSortBy] = useState<string>('latest');
  const [page, setPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [totalCount, setTotalCount] = useState<number>(0);

  // Actions
  const [isFormOpen, setIsFormOpen] = useState<boolean>(false);
  const [editingItem, setEditingItem] = useState<CateringPackage | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Form State
  const [formData, setFormData] = useState<Partial<CateringPackage>>({
    name: '',
    description: '',
    price: 999,
    minGuests: 50,
    maxGuests: 500,
    includedServices: [],
    includedDishes: [],
    image: 'https://images.unsplash.com/photo-1555244162-803834f70033?auto=format&fit=crop&q=80',
    popular: false,
    featured: false,
    status: 'Active'
  });

  const [serviceInput, setServiceInput] = useState<string>('');
  const [dishInput, setDishInput] = useState<string>('');

  // Toasts
  const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const showToast = (type: 'success' | 'error', message: string) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 3500);
  };

  const fetchPackages = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.getPackages({
        search: searchQuery,
        status: activeStatus,
        sortBy,
        page,
        limit: 8
      });

      if (res.success && res.data) {
        setPackagesList(res.data.packages || []);
        setTotalCount(res.data.total || 0);
        setTotalPages(res.data.totalPages || 1);
      } else {
        setError(res.error || 'Failed to fetch catering packages');
      }
    } catch (err: any) {
      setError(err.message || 'Error loading packages');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPackages();
  }, [activeStatus, sortBy, page]);

  const handleApplyFilters = () => {
    setActiveStatus(pendingStatus);
    setPage(1);
  };

  const handleResetFilters = () => {
    setPendingStatus('All');
    setActiveStatus('All');
    setSearchQuery('');
    setPage(1);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchPackages();
  };

  const handleOpenCreate = () => {
    setEditingItem(null);
    setServiceInput('');
    setDishInput('');
    setFormData({
      name: '',
      description: '',
      price: 1299,
      minGuests: 50,
      maxGuests: 500,
      includedServices: ['Live Chaat Counter', 'Silver Chafing Service', 'Uniformed Waiters'],
      includedDishes: ['3 Welcome Drinks', '4 Starters', '4 Main Courses', '3 Desserts'],
      image: 'https://images.unsplash.com/photo-1555244162-803834f70033?auto=format&fit=crop&q=80',
      popular: false,
      featured: false,
      status: 'Active'
    });
    setIsFormOpen(true);
  };

  const handleOpenEdit = (pkg: CateringPackage) => {
    setEditingItem(pkg);
    setServiceInput('');
    setDishInput('');
    setFormData({ ...pkg });
    setIsFormOpen(true);
  };

  const handleAddService = () => {
    if (!serviceInput.trim()) return;
    setFormData(prev => ({
      ...prev,
      includedServices: [...(prev.includedServices || []), serviceInput.trim()]
    }));
    setServiceInput('');
  };

  const handleRemoveService = (idx: number) => {
    setFormData(prev => ({
      ...prev,
      includedServices: (prev.includedServices || []).filter((_, i) => i !== idx)
    }));
  };

  const handleAddDish = () => {
    if (!dishInput.trim()) return;
    setFormData(prev => ({
      ...prev,
      includedDishes: [...(prev.includedDishes || []), dishInput.trim()]
    }));
    setDishInput('');
  };

  const handleRemoveDish = (idx: number) => {
    setFormData(prev => ({
      ...prev,
      includedDishes: (prev.includedDishes || []).filter((_, i) => i !== idx)
    }));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.price) {
      showToast('error', 'Package Name and Price are required');
      return;
    }

    try {
      const id = editingItem?._id || editingItem?.id;
      let res;
      if (id) {
        res = await api.updatePackage(id, formData);
      } else {
        res = await api.createPackage(formData);
      }

      if (res.success) {
        showToast('success', id ? 'Package updated successfully' : 'Package created successfully');
        setIsFormOpen(false);
        fetchPackages();
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
      const res = await api.deletePackage(deletingId);
      if (res.success) {
        showToast('success', 'Package deleted successfully');
        setDeletingId(null);
        fetchPackages();
      } else {
        showToast('error', res.error || 'Failed to delete package');
      }
    } catch (err: any) {
      showToast('error', err.message || 'Deletion error');
    }
  };

  const handleToggleStatus = async (pkg: CateringPackage) => {
    const id = pkg._id || pkg.id;
    if (!id) return;
    const newStatus = pkg.status === 'Active' ? 'Inactive' : 'Active';
    try {
      const res = await api.updatePackage(id, { status: newStatus });
      if (res.success) {
        showToast('success', `Status updated to ${newStatus}`);
        fetchPackages();
      }
    } catch (err) {
      showToast('error', 'Failed to update status');
    }
  };

  return (
    <div className="p-6 md:p-8 space-y-8 max-w-7xl mx-auto">
      <SEO title="Package Management - Admin Panel" description="Configure wedding and event catering packages with pricing and inclusions." urlPath="/admin/packages" />
      {/* Toast Banner */}
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
              <PackageIcon className="w-5 h-5" />
            </span>
            <h1 className="text-2xl font-serif font-bold text-secondary">Packages Management</h1>
          </div>
          <p className="text-slate-500 text-xs sm:text-sm mt-1">
            Configure banquet catering packages, guest limits, included services, and pricing tier structures.
          </p>
        </div>

        <button
          onClick={handleOpenCreate}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-primary text-secondary font-bold text-xs sm:text-sm shadow-md hover:bg-primary/90 transition-all cursor-pointer shrink-0"
        >
          <Plus className="w-4 h-4" />
          Add Package
        </button>
      </div>

      {/* Search & Filter Bar */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
        <div className="flex flex-col lg:flex-row gap-4 items-stretch lg:items-center justify-between">
          
          {/* Search Form */}
          <form onSubmit={handleSearchSubmit} className="flex-1 relative min-w-[280px]">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search packages by name or description..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm focus:outline-none focus:border-primary font-sans"
            />
          </form>

          {/* Pending Filter Dropdowns */}
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
              <label className="text-xs font-bold text-slate-500">Sort:</label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-3 py-2 rounded-xl border border-slate-200 text-xs font-medium bg-slate-50 focus:outline-none focus:border-primary"
              >
                <option value="latest">Latest</option>
                <option value="name">Name A-Z</option>
                <option value="price">Price Low-High</option>
              </select>
            </div>

            {/* Apply Filters Button */}
            <button
              onClick={handleApplyFilters}
              className="px-4 py-2 rounded-xl bg-secondary text-white font-bold text-xs hover:bg-secondary/90 transition-all flex items-center gap-1.5 cursor-pointer shadow-xs"
            >
              <Filter className="w-3.5 h-3.5" />
              Apply Filters
            </button>

            {(activeStatus !== 'All' || searchQuery) && (
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

      {/* Main Table / Grid */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-slate-500 space-y-3">
            <RefreshCw className="w-8 h-8 animate-spin mx-auto text-primary" />
            <p className="text-sm font-semibold">Loading packages...</p>
          </div>
        ) : error ? (
          <div className="p-12 text-center text-rose-500 space-y-2">
            <AlertCircle className="w-8 h-8 mx-auto text-rose-400" />
            <p className="text-sm font-bold">{error}</p>
            <button onClick={fetchPackages} className="text-xs text-primary underline mt-2 cursor-pointer">Retry</button>
          </div>
        ) : packagesList.length === 0 ? (
          <div className="p-12 text-center text-slate-400 space-y-3">
            <PackageIcon className="w-12 h-12 mx-auto text-slate-300" />
            <p className="text-base font-bold text-slate-600">No catering packages found</p>
            <button onClick={handleOpenCreate} className="px-4 py-2 rounded-xl bg-primary text-secondary text-xs font-bold mt-2 cursor-pointer">
              Add New Package
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-[11px] uppercase tracking-wider text-slate-500 font-bold">
                  <th className="py-3.5 px-4">Package</th>
                  <th className="py-3.5 px-4">Price / Plate</th>
                  <th className="py-3.5 px-4">Guest Capacity</th>
                  <th className="py-3.5 px-4">Included Highlights</th>
                  <th className="py-3.5 px-4">Popular</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs font-sans text-slate-700">
                {packagesList.map((pkg) => {
                  const id = pkg._id || pkg.id || '';
                  return (
                    <tr key={id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3.5 px-4 max-w-xs">
                        <div className="flex items-center gap-3">
                          <img
                            src={pkg.image || 'https://images.unsplash.com/photo-1555244162-803834f70033?auto=format&fit=crop&q=80'}
                            alt={pkg.name}
                            className="w-12 h-10 object-cover rounded-lg border border-slate-200 shrink-0"
                          />
                          <div className="truncate">
                            <p className="font-bold text-slate-900 truncate leading-snug">{pkg.name}</p>
                            <p className="text-[10px] text-slate-400 line-clamp-1">{pkg.description}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 font-mono font-bold text-slate-900 text-sm">
                        ₹{pkg.price}
                      </td>
                      <td className="py-3.5 px-4 text-slate-600 font-medium">
                        <span className="inline-flex items-center gap-1 bg-slate-100 px-2 py-1 rounded text-[10px]">
                          <Users className="w-3 h-3 text-slate-400" />
                          {pkg.minGuests} - {pkg.maxGuests} Guests
                        </span>
                      </td>
                      <td className="py-3.5 px-4 max-w-xs">
                        <div className="flex flex-wrap gap-1">
                          {(pkg.includedServices || []).slice(0, 2).map((s, i) => (
                            <span key={i} className="px-1.5 py-0.5 rounded bg-primary/10 text-secondary text-[9px] font-semibold">
                              {s}
                            </span>
                          ))}
                          {(pkg.includedServices || []).length > 2 && (
                            <span className="text-[9px] text-slate-400 font-bold">
                              +{(pkg.includedServices || []).length - 2} more
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          pkg.popular ? 'bg-amber-100 text-amber-800' : 'bg-slate-100 text-slate-500'
                        }`}>
                          {pkg.popular ? 'Popular' : 'Standard'}
                        </span>
                      </td>
                      <td className="py-3.5 px-4">
                        <button
                          onClick={() => handleToggleStatus(pkg)}
                          className={`px-2.5 py-1 rounded-full text-[10px] font-bold transition-all cursor-pointer ${
                            pkg.status === 'Active'
                              ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                              : 'bg-rose-100 text-rose-800 border border-rose-200'
                          }`}
                        >
                          {pkg.status}
                        </button>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => handleOpenEdit(pkg)}
                            className="p-1.5 text-slate-500 hover:text-primary hover:bg-amber-50 rounded-lg transition-colors cursor-pointer"
                            title="Edit Package"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setDeletingId(id)}
                            className="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                            title="Delete"
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

        {/* Pagination Controls */}
        {!loading && totalPages > 1 && (
          <div className="p-4 border-t border-slate-100 bg-slate-50 flex items-center justify-between text-xs text-slate-500">
            <span>Showing page <b>{page}</b> of <b>{totalPages}</b> ({totalCount} total packages)</span>
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

      {/* Add / Edit Modal */}
      {isFormOpen && (
        <div className="fixed inset-0 z-50 bg-secondary/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-xl w-full max-h-[90vh] overflow-y-auto p-6 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-4">
              <h2 className="text-lg font-serif font-bold text-secondary">
                {editingItem ? 'Edit Package' : 'Add New Catering Package'}
              </h2>
              <button onClick={() => setIsFormOpen(false)} className="text-slate-400 hover:text-slate-600 p-1 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4 text-xs font-sans">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label className="block font-bold text-slate-700 mb-1">Package Name *</label>
                  <input
                    type="text"
                    required
                    value={formData.name || ''}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g. Royal Gold Heritage Wedding Buffet"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:border-primary text-xs"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Price per Guest (₹) *</label>
                  <input
                    type="number"
                    required
                    value={formData.price || 999}
                    onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:border-primary text-xs font-mono"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Status</label>
                  <select
                    value={formData.status || 'Active'}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:border-primary text-xs"
                  >
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Minimum Guests</label>
                  <input
                    type="number"
                    value={formData.minGuests || 25}
                    onChange={(e) => setFormData({ ...formData, minGuests: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:border-primary text-xs font-mono"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Maximum Guests</label>
                  <input
                    type="number"
                    value={formData.maxGuests || 1000}
                    onChange={(e) => setFormData({ ...formData, maxGuests: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:border-primary text-xs font-mono"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block font-bold text-slate-700 mb-1">Package Cover Image URL</label>
                  <input
                    type="text"
                    value={formData.image || ''}
                    onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                    placeholder="https://images.unsplash.com/..."
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:border-primary text-xs"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block font-bold text-slate-700 mb-1">Description</label>
                  <textarea
                    rows={2}
                    value={formData.description || ''}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Brief package summary..."
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:border-primary text-xs"
                  />
                </div>

                {/* Included Services list builder */}
                <div className="sm:col-span-2 space-y-2">
                  <label className="block font-bold text-slate-700">Included Services</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={serviceInput}
                      onChange={(e) => setServiceInput(e.target.value)}
                      placeholder="Add a service (e.g. Silver Chafing Service)"
                      className="flex-1 px-3 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-primary"
                    />
                    <button
                      type="button"
                      onClick={handleAddService}
                      className="px-3 py-2 bg-secondary text-white rounded-xl font-bold text-xs hover:bg-secondary/90 cursor-pointer"
                    >
                      Add
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {(formData.includedServices || []).map((srv, idx) => (
                      <span key={idx} className="inline-flex items-center gap-1 bg-slate-100 text-slate-700 px-2.5 py-1 rounded-lg text-[11px]">
                        {srv}
                        <button type="button" onClick={() => handleRemoveService(idx)} className="text-slate-400 hover:text-rose-500 cursor-pointer">
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                </div>

                {/* Included Dishes / Structure list builder */}
                <div className="sm:col-span-2 space-y-2">
                  <label className="block font-bold text-slate-700">Included Dish Courses</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={dishInput}
                      onChange={(e) => setDishInput(e.target.value)}
                      placeholder="Add course count (e.g. 4 Starters & 2 Live Counters)"
                      className="flex-1 px-3 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-primary"
                    />
                    <button
                      type="button"
                      onClick={handleAddDish}
                      className="px-3 py-2 bg-secondary text-white rounded-xl font-bold text-xs hover:bg-secondary/90 cursor-pointer"
                    >
                      Add
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {(formData.includedDishes || []).map((dish, idx) => (
                      <span key={idx} className="inline-flex items-center gap-1 bg-amber-50 text-amber-800 border border-amber-200 px-2.5 py-1 rounded-lg text-[11px]">
                        {dish}
                        <button type="button" onClick={() => handleRemoveDish(idx)} className="text-amber-500 hover:text-rose-500 cursor-pointer">
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                </div>

                <div className="flex items-center gap-4 sm:col-span-2 pt-2">
                  <label className="flex items-center gap-2 font-bold text-slate-700 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={Boolean(formData.popular)}
                      onChange={(e) => setFormData({ ...formData, popular: e.target.checked })}
                      className="w-4 h-4 text-primary rounded"
                    />
                    Mark as Most Popular
                  </label>

                  <label className="flex items-center gap-2 font-bold text-slate-700 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={Boolean(formData.featured)}
                      onChange={(e) => setFormData({ ...formData, featured: e.target.checked })}
                      className="w-4 h-4 text-primary rounded"
                    />
                    Featured Package
                  </label>
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
                  {editingItem ? 'Save Package' : 'Create Package'}
                </button>
              </div>
            </form>
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
              <h3 className="text-base font-bold text-slate-900">Delete Package</h3>
              <p className="text-xs text-slate-500 mt-1">
                Are you sure you want to remove this package tier from the website?
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
                Yes, Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
