import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Plus,
  Search,
  Filter,
  RefreshCw,
  Trash2,
  Edit3,
  Eye,
  Sparkles,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Check,
  AlertCircle,
  FileText,
  X,
  Star,
  Calendar,
  User,
  Tag,
} from "lucide-react";
import DOMPurify from "dompurify";
import { api } from "../../lib/api";
import DeleteConfirmModal from "../../components/ui/DeleteConfirmModal";
import RichEditor from "../../components/ui/RichEditor";
import TagInput from "../../components/ui/TagInput";
import { slugify } from "../../lib/slugify";

interface BlogPostItem {
  _id?: string;
  id?: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  featuredImage: string;
  galleryImages?: string[];
  author: string;
  authorAvatar?: string;
  category: string;
  tags?: string[];
  readingTime: string;
  publishDate: string;
  seoTitle?: string;
  seoDescription?: string;
  metaKeywords?: string;
  featured: boolean;
  status: "Active" | "Inactive" | "Draft" | "Published";
  createdAt?: string;
}

export default function BlogsManagement() {
  const [blogs, setBlogs] = useState<BlogPostItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Filters & Search State
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [pendingCategory, setPendingCategory] = useState<string>("All");
  const [pendingStatus, setPendingStatus] = useState<string>("All");

  const [activeCategory, setActiveCategory] = useState<string>("All");
  const [activeStatus, setActiveStatus] = useState<string>("All");

  const [sortBy, setSortBy] = useState<string>("latest");
  const [page, setPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [totalCount, setTotalCount] = useState<number>(0);

  // Modals & Drawers
  const [isFormOpen, setIsFormOpen] = useState<boolean>(false);
  const [editingItem, setEditingItem] = useState<BlogPostItem | null>(null);
  const [viewingItem, setViewingItem] = useState<BlogPostItem | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const slugManuallyEdited = useRef(false);
  const [showSeo, setShowSeo] = useState(false);

  // Form Fields
  const [formData, setFormData] = useState<Partial<BlogPostItem>>({
    title: "",
    slug: "",
    excerpt: "",
    content: "",
    featuredImage: "",
    author: "Anjani Culinary Team",
    authorAvatar: "",
    category: "Culinary Arts",
    tags: [],
    readingTime: "5 min read",
    publishDate: new Date().toISOString().split("T")[0],
    seoTitle: "",
    seoDescription: "",
    metaKeywords: "",
    featured: false,
    status: "Active",
  });

  // Toasts
  const [toast, setToast] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  const showToast = (type: "success" | "error", message: string) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 3500);
  };

  const fetchBlogs = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.getBlogs({
        search: searchQuery,
        category: activeCategory,
        status: activeStatus,
        sortBy,
        page,
        limit: 8,
      });

      if (res.success && res.data) {
        setBlogs(res.data.blogs || []);
        setTotalCount(res.data.total || 0);
        setTotalPages(res.data.totalPages || 1);
      } else {
        setError(res.error || "Failed to fetch blog posts");
      }
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBlogs();
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
    fetchBlogs();
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
      excerpt: "",
      content: "",
      featuredImage:
        "https://images.unsplash.com/photo-1555244162-803834f70033?auto=format&fit=crop&q=80",
      author: "Anjani Culinary Team",
      authorAvatar: "",
      category: "Culinary Arts",
      tags: [],
      readingTime: "5 min read",
      publishDate: new Date().toISOString().split("T")[0],
      seoTitle: "",
      seoDescription: "",
      metaKeywords: "",
      featured: false,
      status: "Active",
    });
    setIsFormOpen(true);
  };

  const handleOpenEdit = async (item: BlogPostItem) => {
    slugManuallyEdited.current = true;
    setEditingItem(item);
    const id = item._id || item.id;
    if (id) {
      try {
        const res = await api.getBlogById(id);
        if (res.success && res.data) {
          setFormData({
            ...res.data,
            publishDate: res.data.publishDate
              ? res.data.publishDate.split("T")[0]
              : new Date().toISOString().split("T")[0],
          });
          setIsFormOpen(true);
          return;
        }
      } catch (e) {}
    }
    setFormData({
      ...item,
      publishDate: item.publishDate
        ? item.publishDate.split("T")[0]
        : new Date().toISOString().split("T")[0],
    });
    setIsFormOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title) {
      showToast(
        "error",
        "Please fill in required fields (Title and Full Content).",
      );
      return;
    }
    const strippedExcerpt = (formData.excerpt || "")
      .replace(/<[^>]*>/g, "")
      .trim();
    if (!strippedExcerpt) {
      showToast("error", "Short Description / Excerpt cannot be empty.");
      return;
    }
    const strippedContent = (formData.content || "")
      .replace(/<[^>]*>/g, "")
      .trim();
    if (!strippedContent) {
      showToast("error", "Full Article Content cannot be empty.");
      return;
    }

    const payload = {
      ...formData,
      seoTitle: formData.seoTitle || formData.title || '',
      seoDescription: formData.seoDescription || strippedExcerpt,
    };

    try {
      const id = editingItem?._id || editingItem?.id;
      let res;
      if (id) {
        res = await api.updateBlog(id, payload);
      } else {
        res = await api.createBlog(payload);
      }

      if (res.success) {
        showToast(
          "success",
          id
            ? "Blog post updated successfully"
            : "Blog post published successfully",
        );
        setIsFormOpen(false);
        fetchBlogs();
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
      const res = await api.deleteBlog(deletingId);
      if (res.success) {
        showToast("success", "Blog post deleted successfully");
        fetchBlogs();
      } else {
        showToast("error", res.error || "Failed to delete blog");
      }
    } catch (err: any) {
      showToast("error", err.message || "Error deleting blog");
    }
    setIsDeleting(false);
    setDeletingId(null);
  };

  const handleToggleStatus = async (item: BlogPostItem) => {
    const id = item._id || item.id;
    if (!id) return;
    const newStatus = item.status === "Active" ? "Inactive" : "Active";
    try {
      const res = await api.updateBlog(id, { status: newStatus });
      if (res.success) {
        showToast("success", `Status updated to ${newStatus}`);
        fetchBlogs();
      }
    } catch (err: any) {
      showToast("error", "Failed to update status");
    }
  };

  const handleToggleFeatured = async (item: BlogPostItem) => {
    const id = item._id || item.id;
    if (!id) return;
    try {
      const res = await api.updateBlog(id, { featured: !item.featured });
      if (res.success) {
        showToast(
          "success",
          item.featured ? "Removed from featured" : "Marked as featured",
        );
        fetchBlogs();
      }
    } catch (err: any) {
      showToast("error", "Failed to update featured state");
    }
  };

  return (
    <div className="p-6 md:p-8 space-y-8 max-w-7xl mx-auto">
      {/* Toast Banner */}
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

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-lg bg-primary/10 text-primary">
              <FileText className="w-5 h-5" />
            </span>
            <h1 className="text-2xl font-serif font-bold text-secondary">
              Blogs Management
            </h1>
          </div>
          <p className="text-slate-500 text-xs sm:text-sm mt-1">
            Create, edit, view, search, and curate dynamic blog articles for
            your website audience.
          </p>
        </div>

        <button
          onClick={handleOpenCreate}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-primary text-secondary font-bold text-xs sm:text-sm shadow-md hover:bg-primary/90 transition-all cursor-pointer shrink-0"
        >
          <Plus className="w-4 h-4" />
          Add New Blog
        </button>
      </div>

      {/* Search & Filter Control Bar */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
        <div className="flex flex-col lg:flex-row gap-4 items-stretch lg:items-center justify-between">
          {/* Search Form */}
          <form
            onSubmit={handleSearchSubmit}
            className="flex-1 relative min-w-[280px]"
          >
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search blogs by title, author, category..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm focus:outline-none focus:border-primary font-sans"
            />
          </form>

          {/* Pending Filter Controls */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2">
              <label className="text-xs font-bold text-slate-500">
                Category:
              </label>
              <select
                value={pendingCategory}
                onChange={(e) => setPendingCategory(e.target.value)}
                className="px-3 py-2 rounded-xl border border-slate-200 text-xs font-medium bg-slate-50 focus:outline-none focus:border-primary"
              >
                <option value="All">All Categories</option>
                <option value="Culinary Arts">Culinary Arts</option>
                <option value="Industry Trends">Industry Trends</option>
                <option value="Event Trends">Event Trends</option>
                <option value="General">General</option>
              </select>
            </div>

            <div className="flex items-center gap-2">
              <label className="text-xs font-bold text-slate-500">
                Status:
              </label>
              <select
                value={pendingStatus}
                onChange={(e) => setPendingStatus(e.target.value)}
                className="px-3 py-2 rounded-xl border border-slate-200 text-xs font-medium bg-slate-50 focus:outline-none focus:border-primary"
              >
                <option value="All">All Statuses</option>
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
                <option value="Published">Published</option>
                <option value="Draft">Draft</option>
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

            {/* Apply Filters Button */}
            <button
              onClick={handleApplyFilters}
              className="px-4 py-2 rounded-xl bg-secondary text-white font-bold text-xs hover:bg-secondary/90 transition-all flex items-center gap-1.5 cursor-pointer shadow-xs"
            >
              <Filter className="w-3.5 h-3.5" />
              Apply Filters
            </button>

            {(activeCategory !== "All" ||
              activeStatus !== "All" ||
              searchQuery) && (
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

      {/* Main Table / Grid Container */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-slate-500 space-y-3">
            <RefreshCw className="w-8 h-8 animate-spin mx-auto text-primary" />
            <p className="text-sm font-semibold">Loading blog articles...</p>
          </div>
        ) : error ? (
          <div className="p-12 text-center text-rose-500 space-y-2">
            <AlertCircle className="w-8 h-8 mx-auto text-rose-400" />
            <p className="text-sm font-bold">{error}</p>
            <button
              onClick={fetchBlogs}
              className="text-xs text-primary underline mt-2 cursor-pointer"
            >
              Retry
            </button>
          </div>
        ) : blogs.length === 0 ? (
          <div className="p-12 text-center text-slate-400 space-y-3">
            <FileText className="w-12 h-12 mx-auto text-slate-300" />
            <p className="text-base font-bold text-slate-600">
              No blog posts found
            </p>
            <p className="text-xs text-slate-400">
              Try adjusting your filters or add a new blog article.
            </p>
            <button
              onClick={handleOpenCreate}
              className="px-4 py-2 rounded-xl bg-primary text-secondary text-xs font-bold mt-2 cursor-pointer"
            >
              Create First Blog
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-[11px] uppercase tracking-wider text-slate-500 font-bold">
                  <th className="py-3.5 px-4">Article</th>
                  <th className="py-3.5 px-4">Category</th>
                  <th className="py-3.5 px-4">Author</th>
                  <th className="py-3.5 px-4">Date</th>
                  <th className="py-3.5 px-4">Featured</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs font-sans text-slate-700">
                {blogs.map((blog) => {
                  const id = blog._id || blog.id || "";
                  return (
                    <tr
                      key={id}
                      className="hover:bg-slate-50/70 transition-colors"
                    >
                      <td className="py-3.5 px-4 max-w-xs">
                        <div className="flex items-center gap-3">
                          <img
                            src={
                              blog.featuredImage ||
                              "https://images.unsplash.com/photo-1555244162-803834f70033?auto=format&fit=crop&q=80"
                            }
                            alt={blog.title}
                            className="w-12 h-10 object-cover rounded-lg border border-slate-200 shrink-0"
                          />
                          <div className="truncate">
                            <p className="font-bold text-slate-900 truncate leading-snug">
                              {blog.title}
                            </p>
                            <span className="text-[10px] text-slate-400 font-mono">
                              /{blog.slug}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="px-2.5 py-1 rounded-full bg-slate-100 text-slate-700 font-semibold text-[10px]">
                          {blog.category}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 font-medium text-slate-600">
                        {blog.author}
                      </td>
                      <td className="py-3.5 px-4 text-slate-500 font-mono text-[11px]">
                        {new Date(
                          blog.publishDate || blog.createdAt || Date.now(),
                        ).toLocaleDateString()}
                      </td>
                      <td className="py-3.5 px-4">
                        <button
                          onClick={() => handleToggleFeatured(blog)}
                          className={`p-1.5 rounded-lg border transition-all cursor-pointer ${
                            blog.featured
                              ? "bg-amber-50 text-amber-600 border-amber-200 hover:bg-amber-100"
                              : "bg-slate-50 text-slate-400 border-slate-200 hover:text-amber-500"
                          }`}
                          title={
                            blog.featured
                              ? "Featured on home"
                              : "Click to feature"
                          }
                        >
                          <Star
                            className={`w-3.5 h-3.5 ${blog.featured ? "fill-amber-400" : ""}`}
                          />
                        </button>
                      </td>
                      <td className="py-3.5 px-4">
                        <button
                          onClick={() => handleToggleStatus(blog)}
                          className={`px-2.5 py-1 rounded-full text-[10px] font-bold tracking-wide transition-all cursor-pointer ${
                            blog.status === "Active" ||
                            blog.status === "Published"
                              ? "bg-emerald-100 text-emerald-800 border border-emerald-200"
                              : "bg-rose-100 text-rose-800 border border-rose-200"
                          }`}
                        >
                          {blog.status}
                        </button>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => setViewingItem(blog)}
                            className="p-1.5 text-slate-500 hover:text-secondary hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                            title="Quick View"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleOpenEdit(blog)}
                            className="p-1.5 text-slate-500 hover:text-primary hover:bg-amber-50 rounded-lg transition-colors cursor-pointer"
                            title="Edit Article"
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
            <span>
              Showing page <b>{page}</b> of <b>{totalPages}</b> ({totalCount}{" "}
              items)
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

      {/* Add / Edit Drawer Modal */}
      {isFormOpen && (
        <div className="fixed inset-0 z-50 bg-secondary/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-4">
              <h2 className="text-lg font-serif font-bold text-secondary">
                {editingItem ? "Edit Blog Article" : "Publish New Blog Article"}
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
                  <label className="block font-bold text-slate-700 mb-1">
                    Blog Title *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.title || ""}
                    onChange={(e) => handleTitleChange(e.target.value)}
                    placeholder="e.g., The Art of Royal Plating in Luxury Banquets"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:border-primary text-xs"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Slug (Auto-generated)
                  </label>
                  <input
                    type="text"
                    value={formData.slug || ""}
                    onChange={(e) => {
                      slugManuallyEdited.current = true;
                      setFormData({ ...formData, slug: e.target.value });
                    }}
                    placeholder="e.g., the-art-of-royal-plating"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 font-mono text-[11px]"
                  />
                  <p className="text-[10px] text-slate-400 mt-1">
                    Slug is automatically generated from the blog title. You can
                    edit it manually if needed.
                  </p>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Category
                  </label>
                  <select
                    value={formData.category || "Culinary Arts"}
                    onChange={(e) =>
                      setFormData({ ...formData, category: e.target.value })
                    }
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:border-primary text-xs"
                  >
                    <option value="Culinary Arts">Culinary Arts</option>
                    <option value="Industry Trends">Industry Trends</option>
                    <option value="Event Trends">Event Trends</option>
                    <option value="General">General</option>
                  </select>
                </div>

                  <div className="sm:col-span-2">
                    <label className="block font-bold text-slate-700 mb-1">
                      Tags
                    </label>
                    <TagInput
                      tags={formData.tags || []}
                      onChange={(tags) => setFormData({ ...formData, tags })}
                      placeholder="Type tag and press Enter, Comma, or Tab..."
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">
                      Author Name
                    </label>
                    <input
                      type="text"
                      value={formData.author || ""}
                      onChange={(e) =>
                        setFormData({ ...formData, author: e.target.value })
                      }
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:border-primary text-xs"
                    />
                  </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Reading Time
                  </label>
                  <input
                    type="text"
                    value={formData.readingTime || "5 min read"}
                    onChange={(e) =>
                      setFormData({ ...formData, readingTime: e.target.value })
                    }
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:border-primary text-xs"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Author Avatar URL
                  </label>
                  <input
                    type="text"
                    value={formData.authorAvatar || ""}
                    onChange={(e) =>
                      setFormData({ ...formData, authorAvatar: e.target.value })
                    }
                    placeholder="https://images.unsplash.com/..."
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:border-primary text-xs"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block font-bold text-slate-700 mb-1">
                    Featured Image URL
                  </label>
                  <input
                    type="text"
                    value={formData.featuredImage || ""}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        featuredImage: e.target.value,
                      })
                    }
                    placeholder="https://images.unsplash.com/..."
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:border-primary text-xs"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block font-bold text-slate-700 mb-1">
                    Short Description / Excerpt *
                  </label>
                  <RichEditor
                    simple
                    value={formData.excerpt || ""}
                    onChange={(html) =>
                      setFormData({ ...formData, excerpt: html })
                    }
                    placeholder="Brief summary for list views..."
                    minHeight="120px"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block font-bold text-slate-700 mb-1">
                    Full Article Content *
                  </label>
                  <RichEditor
                    value={formData.content || ""}
                    onChange={(html) =>
                      setFormData({ ...formData, content: html })
                    }
                    placeholder="Write or paste full article content..."
                    minHeight="400px"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Status
                  </label>
                  <select
                    value={formData.status || "Active"}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        status: e.target.value as any,
                      })
                    }
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:border-primary text-xs"
                  >
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                    <option value="Published">Published</option>
                    <option value="Draft">Draft</option>
                  </select>
                </div>

                <div className="flex items-center gap-2 pt-5">
                  <input
                    type="checkbox"
                    id="featured"
                    checked={Boolean(formData.featured)}
                    onChange={(e) =>
                      setFormData({ ...formData, featured: e.target.checked })
                    }
                    className="w-4 h-4 text-primary rounded"
                  />
                  <label
                    htmlFor="featured"
                    className="font-bold text-slate-700 cursor-pointer"
                  >
                    Feature on Home Page
                  </label>
                </div>

                {/* SEO Settings */}
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
                          placeholder={formData.title ? `Auto: ${formData.title.slice(0, 60)}` : 'SEO-optimized page title (60 chars max)'}
                          className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:border-primary text-xs"
                        />
                        <p className="text-[10px] text-slate-400 mt-1">Auto-fills from Blog Title on save if left empty.</p>
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
                          placeholder={formData.excerpt ? `Auto: ${formData.excerpt.replace(/<[^>]*>/g, '').slice(0, 160)}` : 'Compelling meta description for search results (160 chars max)'}
                          className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:border-primary text-xs resize-none"
                        />
                        <p className="text-[10px] text-slate-400 mt-1">Auto-fills from Short Description on save if left empty.</p>
                      </div>
                      <div>
                        <label className="block font-bold text-slate-700 mb-1 flex items-center justify-between">
                          <span>SEO Keywords</span>
                          <span className={`text-[10px] font-mono font-bold ${(formData.metaKeywords || '').length > 200 ? 'text-red-500' : (formData.metaKeywords || '').length > 160 ? 'text-amber-500' : 'text-emerald-500'}`}>
                            {(formData.metaKeywords || '').length} / 200
                          </span>
                        </label>
                        <input
                          type="text"
                          maxLength={250}
                          value={formData.metaKeywords || ''}
                          onChange={(e) => setFormData({ ...formData, metaKeywords: e.target.value })}
                          placeholder="Comma-separated keywords, e.g. wedding catering, luxury events, Mumbai"
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
                  {editingItem ? "Save Changes" : "Publish Article"}
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
        title="Delete Blog Post"
        itemName="this blog post"
        isLoading={isDeleting}
      />

      {/* View Modal */}
      {viewingItem && (
        <div className="fixed inset-0 z-50 bg-secondary/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 max-h-[85vh] overflow-y-auto space-y-4 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <span className="text-xs font-bold text-primary uppercase">
                {viewingItem.category}
              </span>
              <button
                onClick={() => setViewingItem(null)}
                className="text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <h2 className="text-xl font-serif font-bold text-secondary">
              {viewingItem.title}
            </h2>
            <img
              src={viewingItem.featuredImage}
              alt={viewingItem.title}
              className="w-full h-48 object-cover rounded-xl border border-slate-200"
            />
            <div
              className="text-xs text-slate-600 italic"
              dangerouslySetInnerHTML={{
                __html: DOMPurify.sanitize(viewingItem.excerpt || ""),
              }}
            />
            <div
              className="prose prose-xs text-slate-700 border-t border-slate-100 pt-3"
              dangerouslySetInnerHTML={{
                __html: DOMPurify.sanitize(viewingItem.content || ""),
              }}
            />
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
