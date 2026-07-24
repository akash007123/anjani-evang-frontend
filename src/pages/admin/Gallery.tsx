import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Plus, Search, Filter, RefreshCw, Trash2, Edit3, Eye, 
  ChevronLeft, ChevronRight, Check, AlertCircle, Image as ImageIcon, Video, X, Star, Play
} from 'lucide-react';
import { api } from '../../lib/api';

interface GalleryItem {
  _id?: string;
  id?: string;
  type: 'image' | 'video';
  title: string;
  description: string;
  category: string;
  imageUrl?: string;
  videoUrl?: string;
  videoType?: 'mp4' | 'youtube' | 'vimeo';
  thumbnail?: string;
  featured: boolean;
  displayOrder: number;
  status: 'Active' | 'Inactive';
  createdAt?: string;
}

const CATEGORIES = ["Weddings", "Live Stalls", "Corporate", "Kitchen & Chef", "Mocktails", "Decor & Banquets"];

export default function GalleryManagement() {
  const [galleryList, setGalleryList] = useState<GalleryItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Search & Filter
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [pendingType, setPendingType] = useState<string>('All');
  const [pendingCategory, setPendingCategory] = useState<string>('All');
  const [pendingStatus, setPendingStatus] = useState<string>('All');

  const [activeType, setActiveType] = useState<string>('All');
  const [activeCategory, setActiveCategory] = useState<string>('All');
  const [activeStatus, setActiveStatus] = useState<string>('All');

  const [sortBy, setSortBy] = useState<string>('latest');
  const [page, setPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [totalCount, setTotalCount] = useState<number>(0);

  // Actions
  const [isFormOpen, setIsFormOpen] = useState<boolean>(false);
  const [editingItem, setEditingItem] = useState<GalleryItem | null>(null);
  const [viewingItem, setViewingItem] = useState<GalleryItem | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Form State
  const [formData, setFormData] = useState<Partial<GalleryItem>>({
    type: 'image',
    title: '',
    description: '',
    category: 'Weddings',
    imageUrl: 'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?auto=format&fit=crop&q=80',
    videoUrl: '',
    videoType: 'youtube',
    thumbnail: 'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?auto=format&fit=crop&q=80',
    featured: false,
    displayOrder: 1,
    status: 'Active'
  });

  // Toasts
  const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const showToast = (type: 'success' | 'error', message: string) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 3500);
  };

  const fetchGallery = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.getGalleryItems({
        search: searchQuery,
        type: activeType,
        category: activeCategory,
        status: activeStatus,
        sortBy,
        page,
        limit: 8
      });

      if (res.success && res.data) {
        setGalleryList(res.data.gallery || []);
        setTotalCount(res.data.total || 0);
        setTotalPages(res.data.totalPages || 1);
      } else {
        setError(res.error || 'Failed to fetch gallery items');
      }
    } catch (err: any) {
      setError(err.message || 'Error loading gallery');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGallery();
  }, [activeType, activeCategory, activeStatus, sortBy, page]);

  const handleApplyFilters = () => {
    setActiveType(pendingType);
    setActiveCategory(pendingCategory);
    setActiveStatus(pendingStatus);
    setPage(1);
  };

  const handleResetFilters = () => {
    setPendingType('All');
    setPendingCategory('All');
    setPendingStatus('All');

    setActiveType('All');
    setActiveCategory('All');
    setActiveStatus('All');
    setSearchQuery('');
    setPage(1);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchGallery();
  };

  const handleOpenCreate = (defaultType: 'image' | 'video' = 'image') => {
    setEditingItem(null);
    setFormData({
      type: defaultType,
      title: '',
      description: '',
      category: 'Weddings',
      imageUrl: 'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?auto=format&fit=crop&q=80',
      videoUrl: '',
      videoType: 'youtube',
      thumbnail: 'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?auto=format&fit=crop&q=80',
      featured: false,
      displayOrder: galleryList.length + 1,
      status: 'Active'
    });
    setIsFormOpen(true);
  };

  const handleOpenEdit = (item: GalleryItem) => {
    setEditingItem(item);
    setFormData({ ...item });
    setIsFormOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.category) {
      showToast('error', 'Title and Category are required');
      return;
    }

    try {
      const id = editingItem?._id || editingItem?.id;
      let res;
      if (id) {
        res = await api.updateGalleryItem(id, formData);
      } else {
        res = await api.createGalleryItem(formData);
      }

      if (res.success) {
        showToast('success', id ? 'Gallery item updated' : 'New item added to gallery');
        setIsFormOpen(false);
        fetchGallery();
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
      const res = await api.deleteGalleryItem(deletingId);
      if (res.success) {
        showToast('success', 'Gallery item deleted');
        setDeletingId(null);
        fetchGallery();
      } else {
        showToast('error', res.error || 'Failed to delete');
      }
    } catch (err: any) {
      showToast('error', err.message || 'Deletion error');
    }
  };

  const handleToggleStatus = async (item: GalleryItem) => {
    const id = item._id || item.id;
    if (!id) return;
    const newStatus = item.status === 'Active' ? 'Inactive' : 'Active';
    try {
      const res = await api.updateGalleryItem(id, { status: newStatus });
      if (res.success) {
        showToast('success', `Status updated to ${newStatus}`);
        fetchGallery();
      }
    } catch (err) {
      showToast('error', 'Failed to update status');
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
              <ImageIcon className="w-5 h-5" />
            </span>
            <h1 className="text-2xl font-serif font-bold text-secondary">Gallery Management (Images & Videos)</h1>
          </div>
          <p className="text-slate-500 text-xs sm:text-sm mt-1">
            Organize photo albums and promotional event videos for your website portfolio showcase.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => handleOpenCreate('image')}
            className="inline-flex items-center justify-center gap-2 px-3.5 py-2.5 rounded-xl bg-primary text-secondary font-bold text-xs shadow-md hover:bg-primary/90 transition-all cursor-pointer shrink-0"
          >
            <Plus className="w-4 h-4" />
            Add Photo
          </button>
          <button
            onClick={() => handleOpenCreate('video')}
            className="inline-flex items-center justify-center gap-2 px-3.5 py-2.5 rounded-xl bg-secondary text-white font-bold text-xs shadow-md hover:bg-secondary/90 transition-all cursor-pointer shrink-0"
          >
            <Video className="w-4 h-4 text-primary" />
            Add Video
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
              placeholder="Search gallery by title, category, description..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm focus:outline-none focus:border-primary font-sans"
            />
          </form>

          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2">
              <label className="text-xs font-bold text-slate-500">Media Type:</label>
              <select
                value={pendingType}
                onChange={(e) => setPendingType(e.target.value)}
                className="px-3 py-2 rounded-xl border border-slate-200 text-xs font-medium bg-slate-50 focus:outline-none focus:border-primary"
              >
                <option value="All">All Types</option>
                <option value="image">Images Only</option>
                <option value="video">Videos Only</option>
              </select>
            </div>

            <div className="flex items-center gap-2">
              <label className="text-xs font-bold text-slate-500">Category:</label>
              <select
                value={pendingCategory}
                onChange={(e) => setPendingCategory(e.target.value)}
                className="px-3 py-2 rounded-xl border border-slate-200 text-xs font-medium bg-slate-50 focus:outline-none focus:border-primary"
              >
                <option value="All">All Categories</option>
                {CATEGORIES.map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
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

            {(activeType !== 'All' || activeCategory !== 'All' || activeStatus !== 'All' || searchQuery) && (
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

      {/* Main Grid Display */}
      {loading ? (
        <div className="bg-white p-12 text-center text-slate-500 rounded-2xl border border-slate-200 space-y-3">
          <RefreshCw className="w-8 h-8 animate-spin mx-auto text-primary" />
          <p className="text-sm font-semibold">Loading gallery items...</p>
        </div>
      ) : error ? (
        <div className="bg-white p-12 text-center text-rose-500 rounded-2xl border border-slate-200 space-y-2">
          <AlertCircle className="w-8 h-8 mx-auto text-rose-400" />
          <p className="text-sm font-bold">{error}</p>
          <button onClick={fetchGallery} className="text-xs text-primary underline mt-2 cursor-pointer">Retry</button>
        </div>
      ) : galleryList.length === 0 ? (
        <div className="bg-white p-12 text-center text-slate-400 rounded-2xl border border-slate-200 space-y-3">
          <ImageIcon className="w-12 h-12 mx-auto text-slate-300" />
          <p className="text-base font-bold text-slate-600">No gallery items found</p>
          <button onClick={() => handleOpenCreate('image')} className="px-4 py-2 rounded-xl bg-primary text-secondary text-xs font-bold mt-2 cursor-pointer">
            Add Photo
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {galleryList.map((item) => {
            const id = item._id || item.id || '';
            const thumb = item.type === 'video' ? (item.thumbnail || item.imageUrl) : item.imageUrl;
            return (
              <div key={id} className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden group flex flex-col justify-between">
                <div className="relative aspect-video bg-slate-100 overflow-hidden">
                  <img
                    src={thumb || 'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?auto=format&fit=crop&q=80'}
                    alt={item.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  {item.type === 'video' && (
                    <div className="absolute inset-0 bg-secondary/30 flex items-center justify-center">
                      <div className="w-10 h-10 rounded-full bg-primary text-secondary flex items-center justify-center shadow-lg">
                        <Play className="w-5 h-5 fill-secondary translate-x-0.5" />
                      </div>
                    </div>
                  )}
                  <span className="absolute top-2.5 left-2.5 px-2 py-0.5 rounded-full bg-secondary/80 text-white font-bold text-[9px] uppercase tracking-wider backdrop-blur-xs">
                    {item.type}
                  </span>
                  <span className="absolute top-2.5 right-2.5 px-2 py-0.5 rounded-full bg-slate-900/80 text-white font-semibold text-[9px] backdrop-blur-xs">
                    {item.category}
                  </span>
                </div>

                <div className="p-4 space-y-2 flex-1 flex flex-col justify-between">
                  <div>
                    <h3 className="font-bold text-slate-900 text-xs sm:text-sm line-clamp-1">{item.title}</h3>
                    <p className="text-[11px] text-slate-500 line-clamp-2 mt-1">{item.description}</p>
                  </div>

                  <div className="flex items-center justify-between border-t border-slate-100 pt-3 mt-3 text-[10px]">
                    <button
                      onClick={() => handleToggleStatus(item)}
                      className={`px-2 py-0.5 rounded-full font-bold cursor-pointer ${
                        item.status === 'Active' ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                      }`}
                    >
                      {item.status}
                    </button>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => setViewingItem(item)}
                        className="p-1.5 text-slate-500 hover:text-secondary hover:bg-slate-100 rounded-lg cursor-pointer"
                        title="View"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleOpenEdit(item)}
                        className="p-1.5 text-slate-500 hover:text-primary hover:bg-amber-50 rounded-lg cursor-pointer"
                        title="Edit"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => setDeletingId(id)}
                        className="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg cursor-pointer"
                        title="Delete"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Pagination */}
      {!loading && totalPages > 1 && (
        <div className="p-4 bg-white rounded-2xl border border-slate-200 flex items-center justify-between text-xs text-slate-500">
          <span>Showing page <b>{page}</b> of <b>{totalPages}</b> ({totalCount} items)</span>
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

      {/* Add / Edit Modal */}
      {isFormOpen && (
        <div className="fixed inset-0 z-50 bg-secondary/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-4">
              <h2 className="text-lg font-serif font-bold text-secondary">
                {editingItem ? 'Edit Gallery Item' : `Add New Gallery ${formData.type === 'video' ? 'Video' : 'Photo'}`}
              </h2>
              <button onClick={() => setIsFormOpen(false)} className="text-slate-400 hover:text-slate-600 p-1 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4 text-xs font-sans">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Media Type</label>
                  <select
                    value={formData.type || 'image'}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:border-primary text-xs"
                  >
                    <option value="image">Image / Photo</option>
                    <option value="video">Video</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Category *</label>
                  <select
                    value={formData.category || 'Weddings'}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:border-primary text-xs"
                  >
                    {CATEGORIES.map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>

                <div className="sm:col-span-2">
                  <label className="block font-bold text-slate-700 mb-1">Title *</label>
                  <input
                    type="text"
                    required
                    value={formData.title || ''}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="e.g. Royal Silver Banquet Setup"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:border-primary text-xs"
                  />
                </div>

                {formData.type === 'image' ? (
                  <div className="sm:col-span-2">
                    <label className="block font-bold text-slate-700 mb-1">Image URL *</label>
                    <input
                      type="text"
                      required
                      value={formData.imageUrl || ''}
                      onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                      placeholder="https://images.unsplash.com/..."
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:border-primary text-xs"
                    />
                  </div>
                ) : (
                  <>
                    <div className="sm:col-span-2">
                      <label className="block font-bold text-slate-700 mb-1">Video Source Type</label>
                      <select
                        value={formData.videoType || 'youtube'}
                        onChange={(e) => setFormData({ ...formData, videoType: e.target.value as any })}
                        className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:border-primary text-xs"
                      >
                        <option value="youtube">YouTube URL</option>
                        <option value="vimeo">Vimeo URL</option>
                        <option value="mp4">Direct MP4 URL</option>
                      </select>
                    </div>

                    <div className="sm:col-span-2">
                      <label className="block font-bold text-slate-700 mb-1">Video Link URL *</label>
                      <input
                        type="text"
                        required
                        value={formData.videoUrl || ''}
                        onChange={(e) => setFormData({ ...formData, videoUrl: e.target.value })}
                        placeholder="https://www.youtube.com/watch?v=..."
                        className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:border-primary text-xs font-mono"
                      />
                    </div>

                    <div className="sm:col-span-2">
                      <label className="block font-bold text-slate-700 mb-1">Video Cover Thumbnail URL</label>
                      <input
                        type="text"
                        value={formData.thumbnail || ''}
                        onChange={(e) => setFormData({ ...formData, thumbnail: e.target.value })}
                        placeholder="https://images.unsplash.com/..."
                        className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:border-primary text-xs"
                      />
                    </div>
                  </>
                )}

                <div className="sm:col-span-2">
                  <label className="block font-bold text-slate-700 mb-1">Description</label>
                  <textarea
                    rows={2}
                    value={formData.description || ''}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Brief caption or context..."
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:border-primary text-xs"
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

                <div className="flex items-center gap-2 pt-5">
                  <input
                    type="checkbox"
                    id="featured"
                    checked={Boolean(formData.featured)}
                    onChange={(e) => setFormData({ ...formData, featured: e.target.checked })}
                    className="w-4 h-4 text-primary rounded"
                  />
                  <label htmlFor="featured" className="font-bold text-slate-700 cursor-pointer">
                    Feature on Home Gallery
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
                  {editingItem ? 'Save Item' : 'Add Item'}
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
              <h3 className="text-base font-bold text-slate-900">Delete Gallery Item</h3>
              <p className="text-xs text-slate-500 mt-1">
                Are you sure you want to remove this media item from your website gallery?
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

      {/* View Modal */}
      {viewingItem && (
        <div className="fixed inset-0 z-50 bg-secondary/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 space-y-4 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <span className="text-xs font-bold text-primary uppercase">{viewingItem.category} • {viewingItem.type}</span>
              <button onClick={() => setViewingItem(null)} className="text-slate-400 hover:text-slate-600 p-1 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>
            <h2 className="text-xl font-serif font-bold text-secondary">{viewingItem.title}</h2>
            {viewingItem.type === 'video' ? (
              <div className="aspect-video bg-black rounded-xl overflow-hidden flex items-center justify-center">
                <iframe
                  src={viewingItem.videoUrl?.replace('watch?v=', 'embed/')}
                  title={viewingItem.title}
                  className="w-full h-full"
                  allowFullScreen
                />
              </div>
            ) : (
              <img
                src={viewingItem.imageUrl}
                alt={viewingItem.title}
                className="w-full max-h-80 object-cover rounded-xl border border-slate-200"
              />
            )}
            <p className="text-xs text-slate-600">{viewingItem.description}</p>
            <div className="flex justify-end pt-2">
              <button
                onClick={() => setViewingItem(null)}
                className="px-4 py-2 rounded-xl bg-slate-200 text-slate-700 font-bold text-xs cursor-pointer"
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
