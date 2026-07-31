import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Plus,
  Search,
  Filter,
  RefreshCw,
  Trash2,
  Edit3,
  Eye,
  Briefcase,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Check,
  AlertCircle,
  X,
  Star,
} from "lucide-react";
import { api } from "../../lib/api";
import DeleteConfirmModal from "../../components/ui/DeleteConfirmModal";
import RichEditor from "../../components/ui/RichEditor";
import RichText from "../../components/ui/RichText";
import { slugify } from "../../lib/slugify";
import SEO from "../../components/SEO";

interface ServiceItem {
  _id?: string;
  id?: string;
  title: string;
  slug: string;
  shortDescription: string;
  fullDescription?: string;
  icon: string;
  image: string;
  category: string;
  featured: boolean;
  active: boolean;
  seoTitle?: string;
  seoDescription?: string;
  seoKeywords?: string[];
  createdAt?: string;
}

export default function ServicesManagement() {
  const [services, setServices] = useState<ServiceItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const [searchQuery, setSearchQuery] = useState<string>("");
  const [pendingCategory, setPendingCategory] = useState<string>("All");
  const [pendingStatus, setPendingStatus] = useState<string>("All");

  const [activeCategory, setActiveCategory] = useState<string>("All");
  const [activeStatus, setActiveStatus] = useState<string>("All");

  const [sortBy, setSortBy] = useState<string>("oldest");
  const [page, setPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [totalCount, setTotalCount] = useState<number>(0);

  const [isFormOpen, setIsFormOpen] = useState<boolean>(false);
  const [editingItem, setEditingItem] = useState<ServiceItem | null>(null);
  const [viewingItem, setViewingItem] = useState<ServiceItem | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const slugManuallyEdited = useRef(false);
  const [showSeo, setShowSeo] = useState(false);

  const [categories, setCategories] = useState<string[]>([]);

  const [formData, setFormData] = useState<Partial<ServiceItem>>({
    title: "",
    slug: "",
    shortDescription: "",
    fullDescription: "",
    icon: "Sparkles",
    image: "https://images.unsplash.com/photo-1555244162-803834f70033?auto=format&fit=crop&q=80",
    category: "General",
    featured: false,
    active: true,
    seoTitle: "",
    seoDescription: "",
    seoKeywords: [],
  });

  const [toast, setToast] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  const showToast = (type: "success" | "error", message: string) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 3500);
  };

  const fetchServices = async () => {
    setLoading(true);
    setError(null);
    try {
      const params: Record<string, any> = {
        search: searchQuery || undefined,
        category: activeCategory !== "All" ? activeCategory : undefined,
        active: activeStatus !== "All" ? activeStatus : undefined,
        sortBy,
        page,
        limit: 10,
      };
      Object.keys(params).forEach((k) => {
        if (params[k] === undefined) delete params[k];
      });

      const res = await api.getServices(params);
      if (res.success && res.data) {
        const d = res.data;
        setServices(d.services || []);
        setTotalCount(d.total || 0);
        setTotalPages(d.totalPages || 1);
        const cats = [...new Set((d.services || []).map((s: any) => s.category).filter(Boolean))] as string[];
        setCategories((prev) => {
          const merged = new Set([...prev, ...cats]);
          return [...merged].sort();
        });
      } else {
        setError(res.error || "Failed to fetch services");
      }
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchServices();
  }, [activeCategory, activeStatus, sortBy, page]);

  const handleApplyFilters = () => {
    setActiveCategory(pendingCategory);
    setActiveStatus(pendingStatus);
    setPage(1);
  };

  const handleResetFilters = () => {
    setPendingCategory("All");
    setPendingStatus("All");
    setActiveCategory("All");
    setActiveStatus("All");
    setSearchQuery("");
    setPage(1);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchServices();
  };

  const handleTitleChange = (val: string) => {
    setFormData((prev) => ({
      ...prev,
      title: val,
      slug: slugManuallyEdited.current ? prev.slug : slugify(val),
    }));
  };

  const handleOpenCreate = () => {
    slugManuallyEdited.current = false;
    setEditingItem(null);
    setFormData({
      title: "",
      slug: "",
      shortDescription: "",
      fullDescription: "",
      icon: "Sparkles",
      image: "https://images.unsplash.com/photo-1555244162-803834f70033?auto=format&fit=crop&q=80",
      category: "General",
      featured: false,
      active: true,
      seoTitle: "",
      seoDescription: "",
      seoKeywords: [],
    });
    setIsFormOpen(true);
  };

  const handleOpenEdit = async (item: ServiceItem) => {
    slugManuallyEdited.current = true;
    setEditingItem(item);
    const id = item._id || item.id;
    if (id) {
      try {
        const res = await api.getServiceBySlug(item.slug);
        if (res.success && res.data) {
          setFormData({ ...res.data, seoKeywords: res.data.seoKeywords || [] });
          setIsFormOpen(true);
          return;
        }
      } catch (_) {}
    }
    setFormData({ ...item, seoKeywords: item.seoKeywords || [] });
    setIsFormOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title) {
      showToast("error", "Please fill in the Title.");
      return;
    }
    const strippedDesc = (formData.shortDescription || "").replace(/<[^>]*>/g, "").trim();
    if (!strippedDesc) {
      showToast("error", "Short Description cannot be empty.");
      return;
    }

    const payload = {
      ...formData,
      seoTitle: formData.seoTitle || formData.title || "",
      seoDescription: formData.seoDescription || strippedDesc,
      seoKeywords: formData.seoKeywords || [],
    };

    try {
      const id = editingItem?._id || editingItem?.id;
      let res;
      if (id) {
        res = await api.updateService(id, payload);
      } else {
        res = await api.createService(payload);
      }

      if (res.success) {
        showToast("success", id ? "Service updated successfully" : "Service created successfully");
        setIsFormOpen(false);
        fetchServices();
      } else {
        showToast("error", res.error || "Operation failed");
      }
    } catch (err: any) {
      showToast("error", err.message || "An error occurred");
    }
  };

  const handleDelete = async () => {
    if (!deletingId) return;
    setIsDeleting(true);
    try {
      const res = await api.deleteService(deletingId);
      if (res.success) {
        showToast("success", "Service deleted successfully");
        fetchServices();
      } else {
        showToast("error", res.error || "Failed to delete service");
      }
    } catch (err: any) {
      showToast("error", err.message || "Error deleting service");
    }
    setIsDeleting(false);
    setDeletingId(null);
  };

  const handleToggleActive = async (item: ServiceItem) => {
    const id = item._id || item.id;
    if (!id) return;
    const newActive = !item.active;
    try {
      const res = await api.updateService(id, { active: newActive });
      if (res.success) {
        showToast("success", newActive ? "Service activated" : "Service deactivated");
        fetchServices();
      }
    } catch (_) {
      showToast("error", "Failed to update status");
    }
  };

  const handleToggleFeatured = async (item: ServiceItem) => {
    const id = item._id || item.id;
    if (!id) return;
    try {
      const res = await api.updateService(id, { featured: !item.featured });
      if (res.success) {
        showToast("success", item.featured ? "Removed from featured" : "Marked as featured");
        fetchServices();
      }
    } catch (_) {
      showToast("error", "Failed to update featured state");
    }
  };

  return (
    <div className="p-6 md:p-8 space-y-8 max-w-7xl mx-auto">
      <SEO title="Service Management - Admin Panel" description="Manage catering services offered, service descriptions, and pricing tiers." urlPath="/admin/services" />
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className={`fixed top-5 right-5 z-50 px-4 py-3 rounded-xl shadow-lg border text-sm font-semibold flex items-center gap-2 ${
              toast.type === "success"
                ? "bg-emerald-900/90 text-white border-emerald-500"
                : "bg-rose-900/90 text-white border-rose-500"
            }`}
          >
            {toast.type === "success" ? (
              <Check className="w-5 h-5 text-emerald-400" />
            ) : (
              <AlertCircle className="w-5 h-5 text-rose-400" />
            )}
            {toast.message}
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-lg bg-primary/10 text-primary">
              <Briefcase className="w-5 h-5" />
            </span>
            <h1 className="text-2xl font-serif font-bold text-secondary">
              Services Management
            </h1>
          </div>
          <p className="text-slate-500 text-xs sm:text-sm mt-1">
            Create, edit, manage catering & event services.
          </p>
        </div>

        <button
          onClick={handleOpenCreate}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-primary text-secondary font-bold text-xs sm:text-sm shadow-md hover:bg-primary/90 transition-all cursor-pointer shrink-0"
        >
          <Plus className="w-4 h-4" />
          Add New Service
        </button>
      </div>

      <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
        <div className="flex flex-col lg:flex-row gap-4 items-stretch lg:items-center justify-between">
          <form onSubmit={handleSearchSubmit} className="flex-1 relative min-w-[280px]">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search services by title, category..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm focus:outline-none focus:border-primary font-sans"
            />
          </form>

          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2">
              <label className="text-xs font-bold text-slate-500">Category:</label>
              <select
                value={pendingCategory}
                onChange={(e) => setPendingCategory(e.target.value)}
                className="px-3 py-2 rounded-xl border border-slate-200 text-xs font-medium bg-slate-50 focus:outline-none focus:border-primary"
              >
                <option value="All">All Categories</option>
                {categories.map((c) => (
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
                <option value="true">Active</option>
                <option value="false">Inactive</option>
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
                <option value="oldest">Oldest</option>
                <option value="title">Title A-Z</option>
              </select>
            </div>

            <button
              onClick={handleApplyFilters}
              className="px-4 py-2 rounded-xl bg-secondary text-white font-bold text-xs hover:bg-secondary/90 transition-all flex items-center gap-1.5 cursor-pointer shadow-xs"
            >
              <Filter className="w-3.5 h-3.5" />
              Apply Filters
            </button>

            {(activeCategory !== "All" || activeStatus !== "All" || searchQuery) && (
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
            <p className="text-sm font-semibold">Loading services...</p>
          </div>
        ) : error ? (
          <div className="p-12 text-center text-rose-500 space-y-2">
            <AlertCircle className="w-8 h-8 mx-auto text-rose-400" />
            <p className="text-sm font-bold">{error}</p>
            <button onClick={fetchServices} className="text-xs text-primary underline mt-2 cursor-pointer">
              Retry
            </button>
          </div>
        ) : services.length === 0 ? (
          <div className="p-12 text-center text-slate-400 space-y-3">
            <Briefcase className="w-12 h-12 mx-auto text-slate-300" />
            <p className="text-base font-bold text-slate-600">No services found</p>
            <p className="text-xs text-slate-400">Try adjusting your filters or add a new service.</p>
            <button
              onClick={handleOpenCreate}
              className="px-4 py-2 rounded-xl bg-primary text-secondary text-xs font-bold mt-2 cursor-pointer"
            >
              Create First Service
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-[11px] uppercase tracking-wider text-slate-500 font-bold">
                  <th className="py-3.5 px-4">Service</th>
                  <th className="py-3.5 px-4">Category</th>
                  <th className="py-3.5 px-4">Featured</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs font-sans text-slate-700">
                {services.map((svc) => {
                  const id = svc._id || svc.id || "";
                  return (
                    <tr key={id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3.5 px-4 max-w-xs">
                        <div className="flex items-center gap-3">
                          <img
                            src={svc.image || "https://images.unsplash.com/photo-1555244162-803834f70033?auto=format&fit=crop&q=80"}
                            alt={svc.title}
                            className="w-12 h-10 object-cover rounded-lg border border-slate-200 shrink-0"
                          />
                          <div className="truncate">
                            <p className="font-bold text-slate-900 truncate leading-snug">{svc.title}</p>
                            <span className="text-[10px] text-slate-400 font-mono">/{svc.slug}</span>
                          </div>
                        </div>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="px-2.5 py-1 rounded-full bg-slate-100 text-slate-700 font-semibold text-[10px]">
                          {svc.category}
                        </span>
                      </td>
                      <td className="py-3.5 px-4">
                        <button
                          onClick={() => handleToggleFeatured(svc)}
                          className={`p-1.5 rounded-lg border transition-all cursor-pointer ${
                            svc.featured
                              ? "bg-amber-50 text-amber-600 border-amber-200 hover:bg-amber-100"
                              : "bg-slate-50 text-slate-400 border-slate-200 hover:text-amber-500"
                          }`}
                          title={svc.featured ? "Featured on home" : "Click to feature"}
                        >
                          <Star className={`w-3.5 h-3.5 ${svc.featured ? "fill-amber-400" : ""}`} />
                        </button>
                      </td>
                      <td className="py-3.5 px-4">
                        <button
                          onClick={() => handleToggleActive(svc)}
                          className={`px-2.5 py-1 rounded-full text-[10px] font-bold tracking-wide transition-all cursor-pointer ${
                            svc.active
                              ? "bg-emerald-100 text-emerald-800 border border-emerald-200"
                              : "bg-rose-100 text-rose-800 border border-rose-200"
                          }`}
                        >
                          {svc.active ? "Active" : "Inactive"}
                        </button>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => setViewingItem(svc)}
                            className="p-1.5 text-slate-500 hover:text-secondary hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                            title="Quick View"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleOpenEdit(svc)}
                            className="p-1.5 text-slate-500 hover:text-primary hover:bg-amber-50 rounded-lg transition-colors cursor-pointer"
                            title="Edit Service"
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

        {!loading && totalPages > 1 && (
          <div className="p-4 border-t border-slate-100 bg-slate-50 flex items-center justify-between text-xs text-slate-500">
            <span>
              Showing page <b>{page}</b> of <b>{totalPages}</b> ({totalCount} items)
            </span>
            <div className="flex items-center gap-2">
              <button
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                className="p-2 rounded-lg border border-slate-200 bg-white hover:bg-slate-100 disabled:opacity-40 cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                disabled={page >= totalPages}
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                className="p-2 rounded-lg border border-slate-200 bg-white hover:bg-slate-100 disabled:opacity-40 cursor-pointer"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {isFormOpen && (
        <div className="fixed inset-0 z-50 bg-secondary/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-4">
              <h2 className="text-lg font-serif font-bold text-secondary">
                {editingItem ? "Edit Service" : "Create New Service"}
              </h2>
              <button
                onClick={() => setIsFormOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4 text-xs font-sans">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label className="block font-bold text-slate-700 mb-1">Service Title *</label>
                  <input
                    type="text"
                    required
                    value={formData.title || ""}
                    onChange={(e) => handleTitleChange(e.target.value)}
                    placeholder="e.g., Wedding Catering"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:border-primary text-xs"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Slug (Auto-generated)</label>
                  <input
                    type="text"
                    value={formData.slug || ""}
                    onChange={(e) => {
                      slugManuallyEdited.current = true;
                      setFormData({ ...formData, slug: e.target.value });
                    }}
                    placeholder="e.g., wedding-catering"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 font-mono text-[11px]"
                  />
                  <p className="text-[10px] text-slate-400 mt-1">Auto-generated from title. Can be edited manually.</p>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Category</label>
                  <select
                    value={formData.category || "General"}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:border-primary text-xs"
                  >
                    {categories.length > 0 ? categories.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    )) : (
                      <>
                        <option value="General">General</option>
                        <option value="Wedding">Wedding</option>
                        <option value="Corporate">Corporate</option>
                        <option value="Social">Social</option>
                        <option value="Buffet">Buffet</option>
                        <option value="Cocktail">Cocktail</option>
                      </>
                    )}
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Icon Name</label>
                  <input
                    type="text"
                    value={formData.icon || "Sparkles"}
                    onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                    placeholder="Sparkles, Heart, Briefcase, GlassWater"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:border-primary text-xs"
                  />
                  <p className="text-[10px] text-slate-400 mt-1">lucide-react icon name (e.g. Heart, Briefcase, Sparkles)</p>
                </div>

                <div className="flex items-center gap-6 pt-5">
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="featured"
                      checked={Boolean(formData.featured)}
                      onChange={(e) => setFormData({ ...formData, featured: e.target.checked })}
                      className="w-4 h-4 text-primary rounded"
                    />
                    <label htmlFor="featured" className="font-bold text-slate-700 cursor-pointer">Featured on Home</label>
                  </div>

                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="active"
                      checked={formData.active !== false}
                      onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
                      className="w-4 h-4 text-primary rounded"
                    />
                    <label htmlFor="active" className="font-bold text-slate-700 cursor-pointer">Active</label>
                  </div>
                </div>

                <div className="sm:col-span-2">
                  <label className="block font-bold text-slate-700 mb-1">Image URL</label>
                  <input
                    type="text"
                    value={formData.image || ""}
                    onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                    placeholder="https://images.unsplash.com/..."
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:border-primary text-xs"
                  />
                  {formData.image && (
                    <img
                      src={formData.image}
                      alt="Preview"
                      className="mt-2 h-28 w-full object-cover rounded-xl border border-slate-200"
                      onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                    />
                  )}
                </div>

                <div className="sm:col-span-2">
                  <label className="block font-bold text-slate-700 mb-1">Short Description *</label>
                  <RichEditor
                    simple
                    value={formData.shortDescription || ""}
                    onChange={(html) => setFormData({ ...formData, shortDescription: html })}
                    placeholder="Brief summary for card views..."
                    minHeight="100px"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block font-bold text-slate-700 mb-1">Full Description</label>
                  <RichEditor
                    value={formData.fullDescription || ""}
                    onChange={(html) => setFormData({ ...formData, fullDescription: html })}
                    placeholder="Detailed service description with formatting..."
                    minHeight="300px"
                  />
                </div>

                <div className="sm:col-span-2 mt-4 border border-slate-200 rounded-xl overflow-hidden">
                  <button
                    type="button"
                    onClick={() => setShowSeo(!showSeo)}
                    className="w-full flex items-center justify-between px-4 py-3 bg-slate-50 hover:bg-slate-100 transition-colors cursor-pointer"
                  >
                    <span className="font-bold text-slate-700 text-xs flex items-center gap-2">
                      <Search className="w-3.5 h-3.5 text-primary" />
                      SEO Settings
                    </span>
                    <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${showSeo ? 'rotate-180' : ''}`} />
                  </button>
                  {showSeo && (
                    <div className="p-4 space-y-4 bg-white">
                      <div>
                        <label className="block font-bold text-slate-700 mb-1 flex items-center justify-between">
                          <span>Meta Title</span>
                          <span className={`text-[10px] font-mono font-bold ${(formData.seoTitle || '').length > 60 ? 'text-red-500' : (formData.seoTitle || '').length > 48 ? 'text-amber-500' : 'text-emerald-500'}`}>
                            {(formData.seoTitle || '').length} / 60
                          </span>
                        </label>
                        <input
                          type="text"
                          maxLength={75}
                          value={formData.seoTitle || ''}
                          onChange={(e) => setFormData({ ...formData, seoTitle: e.target.value })}
                          placeholder={formData.title ? `Auto: ${formData.title.slice(0, 60)}` : 'SEO-optimized title (60 chars max)'}
                          className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:border-primary text-xs"
                        />
                      </div>
                      <div>
                        <label className="block font-bold text-slate-700 mb-1 flex items-center justify-between">
                          <span>Meta Description</span>
                          <span className={`text-[10px] font-mono font-bold ${(formData.seoDescription || '').length > 160 ? 'text-red-500' : (formData.seoDescription || '').length > 128 ? 'text-amber-500' : 'text-emerald-500'}`}>
                            {(formData.seoDescription || '').length} / 160
                          </span>
                        </label>
                        <textarea
                          rows={3}
                          maxLength={200}
                          value={formData.seoDescription || ''}
                          onChange={(e) => setFormData({ ...formData, seoDescription: e.target.value })}
                          placeholder="Compelling meta description (160 chars max)"
                          className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:border-primary text-xs resize-none"
                        />
                      </div>
                      <div>
                        <label className="block font-bold text-slate-700 mb-1">SEO Keywords</label>
                        <input
                          type="text"
                          value={(formData.seoKeywords || []).join(', ')}
                          onChange={(e) => setFormData({ ...formData, seoKeywords: e.target.value.split(',').map(s => s.trim()).filter(Boolean) })}
                          placeholder="Comma-separated keywords"
                          className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:border-primary text-xs"
                        />
                      </div>
                    </div>
                  )}
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
                  {editingItem ? "Save Changes" : "Create Service"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <DeleteConfirmModal
        isOpen={!!deletingId}
        onClose={() => setDeletingId(null)}
        onConfirm={handleDelete}
        title="Delete Service"
        itemName="this service"
        isLoading={isDeleting}
      />

      {viewingItem && (
        <div className="fixed inset-0 z-50 bg-secondary/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 max-h-[85vh] overflow-y-auto space-y-4 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <span className="text-xs font-bold text-primary uppercase">{viewingItem.category}</span>
              <button
                onClick={() => setViewingItem(null)}
                className="text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <h2 className="text-xl font-serif font-bold text-secondary">{viewingItem.title}</h2>
            {viewingItem.image && (
              <img
                src={viewingItem.image}
                alt={viewingItem.title}
                className="w-full h-48 object-cover rounded-xl border border-slate-200"
              />
            )}
            <RichText html={viewingItem.shortDescription || ""} className="text-xs text-slate-600 italic prose-p:text-xs prose-p:my-0" />
            {viewingItem.fullDescription && (
              <div className="border-t border-slate-100 pt-3">
                <RichText html={viewingItem.fullDescription} />
              </div>
            )}
            <div className="flex justify-end pt-2">
              <button
                onClick={() => setViewingItem(null)}
                className="px-4 py-2 rounded-xl bg-slate-200 text-slate-700 font-bold text-xs cursor-pointer"
              >
                Close Preview
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
