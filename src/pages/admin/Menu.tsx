import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Plus, Search, Filter, RefreshCw, Trash2, Edit3, 
  ChevronLeft, ChevronRight, Check, AlertCircle, UtensilsCrossed, X, Star
} from 'lucide-react';
import { api } from '../../lib/api';
import DeleteConfirmModal from '../../components/ui/DeleteConfirmModal';
import SEO from '../../components/SEO';

interface MenuItem {
  _id?: string;
  id?: string;
  name: string;
  category: string;
  cuisine: string;
  dietary: 'Veg' | 'Jain' | 'Vegan' | 'Non-Veg';
  description: string;
  price: number;
  image: string;
  popular: boolean;
  chefSpecial: boolean;
  featured: boolean;
  displayOrder: number;
  status: 'Active' | 'Inactive';
  createdAt?: string;
}

const CATEGORIES = [
  "Welcome Drinks", "Mocktails", "Soups", "Starters", "Chaat Counter", 
  "Live Counters", "Indian Breads", "Paneer Curries", "Vegetable Curries", 
  "Dal Varieties", "Rice", "South Indian", "Chinese", "Punjabi Specials", 
  "Gujarati Specials", "Rajasthani Specials", "Maharashtrian Specials", 
  "Desserts & Sweets", "Ice Cream", "Beverages", "Pickles & Condiments", "Salads"
];

const CUISINES = [
  "All", "North Indian", "South Indian", "Gujarati", "Rajasthani", 
  "Maharashtrian", "Indo-Chinese", "Awadhi", "Mughlai", "Fusion", "Multi Cuisine"
];

export default function MenuManagement() {
  const [items, setItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState<string>('');
  
  const [pendingCategory, setPendingCategory] = useState<string>('All');
  const [pendingCuisine, setPendingCuisine] = useState<string>('All');
  const [pendingDietary, setPendingDietary] = useState<string>('All');
  const [pendingStatus, setPendingStatus] = useState<string>('All');

  const [activeCategory, setActiveCategory] = useState<string>('All');
  const [activeCuisine, setActiveCuisine] = useState<string>('All');
  const [activeDietary, setActiveDietary] = useState<string>('All');
  const [activeStatus, setActiveStatus] = useState<string>('All');

  const [sortBy, setSortBy] = useState<string>('latest');
  const [page, setPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [totalCount, setTotalCount] = useState<number>(0);

  // Modals & Actions
  const [isFormOpen, setIsFormOpen] = useState<boolean>(false);
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Form State
  const [formData, setFormData] = useState<Partial<MenuItem>>({
    name: '',
    category: 'Welcome Drinks',
    cuisine: 'North Indian',
    dietary: 'Veg',
    description: '',
    price: 200,
    image: 'https://images.unsplash.com/photo-1555244162-803834f70033?auto=format&fit=crop&q=80',
    popular: false,
    chefSpecial: false,
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

  const fetchMenuItems = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.getMenuItems({
        search: searchQuery,
        category: activeCategory,
        cuisine: activeCuisine,
        dietary: activeDietary,
        status: activeStatus,
        sortBy,
        page,
        limit: 10
      });

      if (res.success && res.data) {
        setItems(res.data.items || []);
        setTotalCount(res.data.total || 0);
        setTotalPages(res.data.totalPages || 1);
      } else {
        setError(res.error || 'Failed to fetch menu items');
      }
    } catch (err: any) {
      setError(err.message || 'Error fetching menu data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMenuItems();
  }, [activeCategory, activeCuisine, activeDietary, activeStatus, sortBy, page]);

  const handleApplyFilters = () => {
    setActiveCategory(pendingCategory);
    setActiveCuisine(pendingCuisine);
    setActiveDietary(pendingDietary);
    setActiveStatus(pendingStatus);
    setPage(1);
  };

  const handleResetFilters = () => {
    setPendingCategory('All');
    setPendingCuisine('All');
    setPendingDietary('All');
    setPendingStatus('All');

    setActiveCategory('All');
    setActiveCuisine('All');
    setActiveDietary('All');
    setActiveStatus('All');
    setSearchQuery('');
    setPage(1);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchMenuItems();
  };

  const handleOpenCreate = () => {
    setEditingItem(null);
    setFormData({
      name: '',
      category: 'Welcome Drinks',
      cuisine: 'North Indian',
      dietary: 'Veg',
      description: '',
      price: 250,
      image: 'https://images.unsplash.com/photo-1555244162-803834f70033?auto=format&fit=crop&q=80',
      popular: false,
      chefSpecial: false,
      featured: false,
      displayOrder: items.length + 1,
      status: 'Active'
    });
    setIsFormOpen(true);
  };

  const handleOpenEdit = (item: MenuItem) => {
    setEditingItem(item);
    setFormData({ ...item });
    setIsFormOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.category) {
      showToast('error', 'Dish Name and Category are required');
      return;
    }

    try {
      const id = editingItem?._id;
      let res;
      if (id) {
        res = await api.updateMenuItem(id, formData);
      } else {
        res = await api.createMenuItem(formData);
      }

      if (res.success) {
        showToast('success', id ? 'Dish updated successfully' : 'New dish added successfully');
        setIsFormOpen(false);
        fetchMenuItems();
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
      const res = await api.deleteMenuItem(deletingId);
      if (res.success) {
        showToast('success', 'Dish deleted successfully');
        setDeletingId(null);
        fetchMenuItems();
      } else {
        showToast('error', res.error || 'Failed to delete dish');
      }
    } catch (err: any) {
      showToast('error', err.message || 'Deletion error');
    }
  };

  const handleToggleStatus = async (item: MenuItem) => {
    const id = item._id;
    if (!id) return;
    const newStatus = item.status === 'Active' ? 'Inactive' : 'Active';
    try {
      const res = await api.updateMenuItem(id, { status: newStatus });
      if (res.success) {
        showToast('success', `Status updated to ${newStatus}`);
        fetchMenuItems();
      }
    } catch (err) {
      showToast('error', 'Failed to update status');
    }
  };

  const handleTogglePopular = async (item: MenuItem) => {
    const id = item._id;
    if (!id) return;
    try {
      const res = await api.updateMenuItem(id, { popular: !item.popular });
      if (res.success) {
        showToast('success', item.popular ? 'Removed from Popular' : 'Marked as Popular');
        fetchMenuItems();
      }
    } catch (err) {
      showToast('error', 'Failed to update popular tag');
    }
  };

  return (
    <div className="p-6 md:p-8 space-y-8 max-w-7xl mx-auto">
      <SEO title="Menu Management - Admin Panel" description="Add, edit, and organize menu items, categories, and pricing." urlPath="/admin/menu" />
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
              <UtensilsCrossed className="w-5 h-5" />
            </span>
            <h1 className="text-2xl font-serif font-bold text-secondary">Menu Management</h1>
          </div>
          <p className="text-slate-500 text-xs sm:text-sm mt-1">
            Manage your full banquet & wedding menu catalog dynamically across all categories and cuisines.
          </p>
        </div>

        <button
          onClick={handleOpenCreate}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-primary text-secondary font-bold text-xs sm:text-sm shadow-md hover:bg-primary/90 transition-all cursor-pointer shrink-0"
        >
          <Plus className="w-4 h-4" />
          Add New Dish
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
              placeholder="Search dishes by name, cuisine, category..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm focus:outline-none focus:border-primary font-sans"
            />
          </form>

          {/* Pending Filter Dropdowns */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2">
              <label className="text-xs font-bold text-slate-500">Category:</label>
              <select
                value={pendingCategory}
                onChange={(e) => setPendingCategory(e.target.value)}
                className="px-3 py-2 rounded-xl border border-slate-200 text-xs font-medium bg-slate-50 focus:outline-none focus:border-primary max-w-[150px]"
              >
                <option value="All">All Categories</option>
                {CATEGORIES.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-2">
              <label className="text-xs font-bold text-slate-500">Cuisine:</label>
              <select
                value={pendingCuisine}
                onChange={(e) => setPendingCuisine(e.target.value)}
                className="px-3 py-2 rounded-xl border border-slate-200 text-xs font-medium bg-slate-50 focus:outline-none focus:border-primary"
              >
                {CUISINES.map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-2">
              <label className="text-xs font-bold text-slate-500">Dietary:</label>
              <select
                value={pendingDietary}
                onChange={(e) => setPendingDietary(e.target.value)}
                className="px-3 py-2 rounded-xl border border-slate-200 text-xs font-medium bg-slate-50 focus:outline-none focus:border-primary"
              >
                <option value="All">All Types</option>
                <option value="Veg">Veg</option>
                <option value="Jain">Jain</option>
                <option value="Vegan">Vegan</option>
                <option value="Non-Veg">Non-Veg</option>
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
                <option value="category">Category</option>
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

            {(activeCategory !== 'All' || activeCuisine !== 'All' || activeDietary !== 'All' || activeStatus !== 'All' || searchQuery) && (
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
            <p className="text-sm font-semibold">Loading menu items...</p>
          </div>
        ) : error ? (
          <div className="p-12 text-center text-rose-500 space-y-2">
            <AlertCircle className="w-8 h-8 mx-auto text-rose-400" />
            <p className="text-sm font-bold">{error}</p>
            <button onClick={fetchMenuItems} className="text-xs text-primary underline mt-2 cursor-pointer">Retry</button>
          </div>
        ) : items.length === 0 ? (
          <div className="p-12 text-center text-slate-400 space-y-3">
            <UtensilsCrossed className="w-12 h-12 mx-auto text-slate-300" />
            <p className="text-base font-bold text-slate-600">No dishes match your filters</p>
            <p className="text-xs text-slate-400">Try resetting filters or add a new menu dish.</p>
            <button onClick={handleOpenCreate} className="px-4 py-2 rounded-xl bg-primary text-secondary text-xs font-bold mt-2 cursor-pointer">
              Add New Dish
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-[11px] uppercase tracking-wider text-slate-500 font-bold">
                  <th className="py-3.5 px-4">Dish Details</th>
                  <th className="py-3.5 px-4">Category</th>
                  <th className="py-3.5 px-4">Cuisine</th>
                  <th className="py-3.5 px-4">Dietary</th>
                  <th className="py-3.5 px-4">Price (₹)</th>
                  <th className="py-3.5 px-4">Popular</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs font-sans text-slate-700">
                {items.map((item) => {
                  const id = item._id || '';
                  return (
                    <tr key={id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3.5 px-4 max-w-xs">
                        <div className="flex items-center gap-3">
                          <img
                            src={item.image || 'https://images.unsplash.com/photo-1555244162-803834f70033?auto=format&fit=crop&q=80'}
                            alt={item.name}
                            className="w-12 h-10 object-cover rounded-lg border border-slate-200 shrink-0"
                          />
                          <div className="truncate">
                            <p className="font-bold text-slate-900 truncate leading-snug">{item.name}</p>
                            <p className="text-[10px] text-slate-400 line-clamp-1">{item.description}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="px-2.5 py-1 rounded-full bg-slate-100 text-slate-700 font-semibold text-[10px]">
                          {item.category}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 font-medium text-slate-600">
                        {item.cuisine}
                      </td>
                      <td className="py-3.5 px-4">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          item.dietary === 'Jain' ? 'bg-amber-100 text-amber-800' :
                          item.dietary === 'Vegan' ? 'bg-emerald-100 text-emerald-800' :
                          item.dietary === 'Non-Veg' ? 'bg-rose-100 text-rose-800' :
                          'bg-green-100 text-green-800'
                        }`}>
                          {item.dietary}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 font-mono font-bold text-slate-900">
                        ₹{item.price}
                      </td>
                      <td className="py-3.5 px-4">
                        <button
                          onClick={() => handleTogglePopular(item)}
                          className={`p-1.5 rounded-lg border transition-all cursor-pointer ${
                            item.popular
                              ? 'bg-amber-50 text-amber-600 border-amber-200'
                              : 'bg-slate-50 text-slate-400 border-slate-200 hover:text-amber-500'
                          }`}
                        >
                          <Star className={`w-3.5 h-3.5 ${item.popular ? 'fill-amber-400' : ''}`} />
                        </button>
                      </td>
                      <td className="py-3.5 px-4">
                        <button
                          onClick={() => handleToggleStatus(item)}
                          className={`px-2.5 py-1 rounded-full text-[10px] font-bold transition-all cursor-pointer ${
                            item.status === 'Active'
                              ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                              : 'bg-rose-100 text-rose-800 border border-rose-200'
                          }`}
                        >
                          {item.status}
                        </button>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => handleOpenEdit(item)}
                            className="p-1.5 text-slate-500 hover:text-primary hover:bg-amber-50 rounded-lg transition-colors cursor-pointer"
                            title="Edit Dish"
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
            <span>Showing page <b>{page}</b> of <b>{totalPages}</b> ({totalCount} total dishes)</span>
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

      {/* Add / Edit Drawer Modal */}
      {isFormOpen && (
        <div className="fixed inset-0 z-50 bg-secondary/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-xl w-full max-h-[90vh] overflow-y-auto p-6 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-4">
              <h2 className="text-lg font-serif font-bold text-secondary">
                {editingItem ? 'Edit Dish Details' : 'Add New Dish to Menu'}
              </h2>
              <button onClick={() => setIsFormOpen(false)} className="text-slate-400 hover:text-slate-600 p-1 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4 text-xs font-sans">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label className="block font-bold text-slate-700 mb-1">Dish Name *</label>
                  <input
                    type="text"
                    required
                    value={formData.name || ''}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g. Saffron Awadhi Dum Biryani"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:border-primary text-xs"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Category *</label>
                  <select
                    value={formData.category || 'Welcome Drinks'}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:border-primary text-xs"
                  >
                    {CATEGORIES.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Cuisine</label>
                  <select
                    value={formData.cuisine || 'North Indian'}
                    onChange={(e) => setFormData({ ...formData, cuisine: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:border-primary text-xs"
                  >
                    {CUISINES.filter(c => c !== 'All').map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Dietary Type</label>
                  <select
                    value={formData.dietary || 'Veg'}
                    onChange={(e) => setFormData({ ...formData, dietary: e.target.value as any })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:border-primary text-xs"
                  >
                    <option value="Veg">Veg</option>
                    <option value="Jain">Jain</option>
                    <option value="Vegan">Vegan</option>
                    <option value="Non-Veg">Non-Veg</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Estimated Price per Plate (₹)</label>
                  <input
                    type="number"
                    value={formData.price || 200}
                    onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:border-primary text-xs font-mono"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block font-bold text-slate-700 mb-1">Dish Image URL</label>
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
                    rows={3}
                    value={formData.description || ''}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Rich description of preparation, ingredients, and taste profile..."
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:border-primary text-xs"
                  />
                </div>

                <div className="flex items-center gap-4 sm:col-span-2 pt-2">
                  <label className="flex items-center gap-2 font-bold text-slate-700 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={Boolean(formData.popular)}
                      onChange={(e) => setFormData({ ...formData, popular: e.target.checked })}
                      className="w-4 h-4 text-primary rounded"
                    />
                    Popular Tag
                  </label>

                  <label className="flex items-center gap-2 font-bold text-slate-700 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={Boolean(formData.chefSpecial)}
                      onChange={(e) => setFormData({ ...formData, chefSpecial: e.target.checked })}
                      className="w-4 h-4 text-primary rounded"
                    />
                    Chef Special
                  </label>

                  <label className="flex items-center gap-2 font-bold text-slate-700 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={Boolean(formData.featured)}
                      onChange={(e) => setFormData({ ...formData, featured: e.target.checked })}
                      className="w-4 h-4 text-primary rounded"
                    />
                    Featured Dish
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
                  {editingItem ? 'Save Changes' : 'Add Dish'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={!!deletingId}
        onClose={() => setDeletingId(null)}
        onConfirm={handleDelete}
        title="Delete Dish"
        itemName="this dish"
        message="Are you sure you want to remove this dish from the menu catalog?"
      />
    </div>
  );
}
