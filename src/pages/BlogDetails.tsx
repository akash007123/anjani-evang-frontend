import { useParams, Link } from 'react-router-dom';
import { useState, useEffect, FormEvent, useRef } from 'react';
import { Calendar, User, ArrowLeft, Send, MessageSquare, Share2, Copy, Check, Image, Loader2 } from 'lucide-react';
import DOMPurify from 'dompurify';
import PageBanner from '../components/layout/PageBanner';
import { Helmet } from 'react-helmet-async';
import SEO from '../components/SEO';
import { getBlogBySlug, getBlogs, getBlogComments } from '../data/getAsyncData';
import { useAsyncData } from '../hooks/useAsyncData';
import { api } from '../lib/api';
import { getInitials, getAvatarColor } from '../lib/avatar';
import type { BlogComment } from '../types';

const UPLOAD_URL = (import.meta as any).env?.VITE_API_URL || '/api';

export default function BlogDetails() {
  const { slug } = useParams<{ slug: string }>();

  const { data: blog } = useAsyncData(() => getBlogBySlug(slug || '', 'en'), null, [slug]);
  const { data: allBlogs } = useAsyncData(() => getBlogs('en'), [] as any[], []);

  const [copied, setCopied] = useState(false);

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const [commentName, setCommentName] = useState('');
  const [commentEmail, setCommentEmail] = useState('');
  const [commentMobile, setCommentMobile] = useState('');
  const [commentText, setCommentText] = useState('');
  const [profileFile, setProfileFile] = useState<File | null>(null);
  const [profilePreview, setProfilePreview] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitMsg, setSubmitMsg] = useState('');
  const [submitError, setSubmitError] = useState('');
  const [refreshKey, setRefreshKey] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

const [replyingTo, setReplyingTo] = useState<string | null>(null);
const [replyName, setReplyName] = useState('');
const [replyEmail, setReplyEmail] = useState('');
const [replyMobile, setReplyMobile] = useState('');
const [replyText, setReplyText] = useState('');
const [replyFile, setReplyFile] = useState<File | null>(null);
const [replyPreview, setReplyPreview] = useState('');
const [replySubmitting, setReplySubmitting] = useState(false);
const [replyError, setReplyError] = useState('');
const replyFileRef = useRef<HTMLInputElement>(null);

const [comments, setComments] = useState<BlogComment[]>([]);
const [commentsLoading, setCommentsLoading] = useState(true);
const [repliesMap, setRepliesMap] = useState<Record<string, BlogComment[]>>({});
const [repliesLoading, setRepliesLoading] = useState(false);

useEffect(() => {
  if (!blog) return;
  let cancelled = false;
  setCommentsLoading(true);
  getBlogComments(blog.id).then(data => {
    if (!cancelled) {
      setComments(data);
      setCommentsLoading(false);
    }
  });
  return () => { cancelled = true; };
}, [blog?.id, refreshKey]);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [slug]);

  if (!blog) {
    return (
      <div className="py-24 text-center bg-cream min-h-[60vh] flex flex-col items-center justify-center gap-4">
        <h2 className="font-serif text-3xl font-bold text-secondary">Article Not Found</h2>
        <p className="text-slate-600 font-sans">We couldn't locate the blog post you requested.</p>
        <Link to="/blogs" className="bg-primary text-secondary px-6 py-2.5 rounded-full font-bold">
          Back to Blog Listing
        </Link>
      </div>
    );
  }

  // Related Blogs
  const relatedBlogs = allBlogs.filter(b => b.id !== blog.id).slice(0, 2);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setSubmitError('Only image files are allowed');
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      setSubmitError('Image must be less than 2MB');
      return;
    }
    setProfileFile(file);
    setProfilePreview(URL.createObjectURL(file));
    setSubmitError('');
  };

  const handlePostComment = async (e: FormEvent) => {
    e.preventDefault();
    setSubmitMsg('');
    setSubmitError('');

    if (!commentName || commentName.trim().length < 2) {
      setSubmitError('Name must be at least 2 characters');
      return;
    }
    if (!commentText || commentText.trim().length < 5) {
      setSubmitError('Comment must be at least 5 characters');
      return;
    }
    if (commentEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(commentEmail)) {
      setSubmitError('Invalid email format');
      return;
    }
    if (commentMobile && !/^\+?\d{6,15}$/.test(commentMobile.replace(/[\s-]/g, ''))) {
      setSubmitError('Invalid mobile number');
      return;
    }

    setSubmitting(true);

    try {
      let profileImageUrl = '';
      if (profileFile) {
        const formData = new FormData();
        formData.append('file', profileFile);
        const uploadRes = await fetch(`${UPLOAD_URL}/upload/public`, {
          method: 'POST',
          body: formData
        }).then(r => r.json());
        if (uploadRes.success || uploadRes.data?.url) {
          profileImageUrl = uploadRes.data?.url || '';
        }
      }

      const res = await api.createComment(blog.id, {
        name: commentName.trim(),
        email: commentEmail.trim(),
        mobile: commentMobile.replace(/[\s-]/g, ''),
        profileImage: profileImageUrl,
        comment: commentText.trim()
      });

      if (res.success) {
        setSubmitMsg('Thank you! Your comment has been submitted.');
        setCommentName('');
        setCommentEmail('');
        setCommentMobile('');
        setCommentText('');
        setProfileFile(null);
        setProfilePreview('');
        if (fileInputRef.current) fileInputRef.current.value = '';
        setRefreshKey(k => k + 1);
      } else {
        setSubmitError(res.error || 'Failed to submit comment');
      }
    } catch (err: any) {
      setSubmitError(err.message || 'Something went wrong');
    } finally {
      setSubmitting(false);
    }
  };

  const handleReplyFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setReplyError('Only image files are allowed');
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      setReplyError('Image must be less than 2MB');
      return;
    }
    setReplyFile(file);
    setReplyPreview(URL.createObjectURL(file));
    setReplyError('');
  };

  const handleReplySubmit = async (e: FormEvent, parentCommentId: string) => {
    e.preventDefault();
    setReplyError('');

    if (!replyName || replyName.trim().length < 2) {
      setReplyError('Name must be at least 2 characters');
      return;
    }
    if (!replyText || replyText.trim().length < 5) {
      setReplyError('Reply must be at least 5 characters');
      return;
    }
    if (replyEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(replyEmail)) {
      setReplyError('Invalid email format');
      return;
    }
    if (replyMobile && !/^\+?\d{6,15}$/.test(replyMobile.replace(/[\s-]/g, ''))) {
      setReplyError('Invalid mobile number');
      return;
    }

    setReplySubmitting(true);

    try {
      let profileImageUrl = '';
      if (replyFile) {
        const formData = new FormData();
        formData.append('file', replyFile);
        const uploadRes = await fetch(`${UPLOAD_URL}/upload/public`, {
          method: 'POST',
          body: formData
        }).then(r => r.json());
        if (uploadRes.success || uploadRes.data?.url) {
          profileImageUrl = uploadRes.data?.url || '';
        }
      }

      const res = await api.createReply(parentCommentId, {
        name: replyName.trim(),
        email: replyEmail.trim(),
        mobile: replyMobile.replace(/[\s-]/g, ''),
        profileImage: profileImageUrl,
        comment: replyText.trim()
      });

      if (res.success) {
        const newReply = res.data as BlogComment;
        setRepliesMap(prev => ({
          ...prev,
          [parentCommentId]: [...(prev[parentCommentId] || []), newReply]
        }));
        setComments(prev => prev.map(c =>
          c._id === parentCommentId
            ? { ...c, replyCount: (c.replyCount || 0) + 1 }
            : c
        ));
        setReplyName('');
        setReplyEmail('');
        setReplyMobile('');
        setReplyText('');
        setReplyFile(null);
        setReplyPreview('');
        if (replyFileRef.current) replyFileRef.current.value = '';
      } else {
        setReplyError(res.error || 'Failed to submit reply');
      }
    } catch (err: any) {
      setReplyError(err.message || 'Something went wrong');
    } finally {
      setReplySubmitting(false);
    }
  };

  const stripHtml = (s: string) => s ? s.replace(/<[^>]*>/g, '') : '';

  return (
    <div>
      <SEO 
        title={blog.seoTitle || blog.title} 
        description={blog.seoDescription || stripHtml(blog.excerpt)}
        image={blog.image}
        urlPath={`/blogs/${blog.slug}`}
        type="article"
      />
      <Helmet>
        {blog.metaKeywords && (
          <meta name="keywords" content={blog.metaKeywords} />
        )}
        {(blog.status && blog.status !== 'Active' && blog.status !== 'Published') && (
          <meta name="robots" content="noindex,nofollow" />
        )}
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            "itemListElement": [
              { "@type": "ListItem", "position": 1, "name": "Home", "item": `${typeof window !== 'undefined' ? window.location.origin : ''}/` },
              { "@type": "ListItem", "position": 2, "name": "Blog", "item": `${typeof window !== 'undefined' ? window.location.origin : ''}/blogs` },
              { "@type": "ListItem", "position": 3, "name": blog.seoTitle || blog.title, "item": typeof window !== 'undefined' ? window.location.href : '' }
            ]
          })}
        </script>
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "BlogPosting",
            "headline": blog.seoTitle || blog.title,
            "description": blog.seoDescription || stripHtml(blog.excerpt),
            "image": blog.image,
            "datePublished": blog.publishDate || blog.date,
            "dateModified": blog.publishDate || blog.date,
            "author": {
              "@type": "Person",
              "name": blog.author.name
            },
            "keywords": blog.metaKeywords || (blog.tags && blog.tags.join(', ')) || ''
          })}
        </script>
      </Helmet>
      <PageBanner 
        title={blog.title} 
        breadcrumbs={[{ name: 'Blog', path: '/blogs' }, { name: 'Post details' }]} 
        backgroundImage={blog.image}
      />

      {/* Main Blog Post Section */}
      <section className="py-20 bg-cream">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
            
            {/* LEFT MAIN ARTICLE - 8 Columns */}
            <div className="lg:col-span-8 flex flex-col gap-8 text-left">
              
              {/* Top Navigation Row with Back Link & Copy Link */}
              <div className="flex flex-wrap justify-between items-center gap-4">
                <Link
                  to="/blogs"
                  className="inline-flex items-center gap-2 text-primary hover:text-secondary font-sans text-xs sm:text-sm font-bold uppercase tracking-wider"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Back to Blog list</span>
                </Link>

                <button
                  type="button"
                  onClick={handleCopyLink}
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white border border-slate-200 text-slate-700 hover:text-primary hover:border-primary/50 text-xs font-bold transition-all shadow-sm active:scale-95"
                >
                  {copied ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                      <span className="text-emerald-600">Link Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copy Link</span>
                    </>
                  )}
                </button>
              </div>

              {/* Main Article Body Box */}
              <div className="bg-white rounded-3xl p-6 sm:p-10 border border-slate-100 shadow-sm">
                {/* Meta details header bar */}
                <div className="flex flex-wrap justify-between items-center gap-4 text-xs text-slate-400 font-sans font-medium border-b border-slate-100 pb-4 mb-6">
                  <div className="flex flex-wrap gap-5 items-center">
                    <span className="flex items-center gap-1.5">
                      <Calendar className="w-4 h-4 text-primary" /> {blog.date}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <User className="w-4 h-4 text-primary" /> By {blog.author.name}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <MessageSquare className="w-4 h-4 text-primary" /> {comments.length} Comments
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={handleCopyLink}
                    className="inline-flex items-center gap-1.5 text-slate-500 hover:text-primary transition-colors text-xs font-semibold"
                  >
                    {copied ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                        <span className="text-emerald-600">Copied!</span>
                      </>
                    ) : (
                      <>
                        <Share2 className="w-3.5 h-3.5 text-primary" />
                        <span>Share Post</span>
                      </>
                    )}
                  </button>
                </div>

                {/* Article Image */}
                <div className="aspect-[16/10] rounded-2xl overflow-hidden mb-8 shadow-sm">
                  <img
                    src={blog.image}
                    alt={blog.title}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover"
                  />
                </div>

                {/* Short Description */}
                {blog.excerpt && (() => {
                  const stripped = stripHtml(blog.excerpt);
                  if (!stripped) return null;
                  return (
                    <div className="relative pl-5 border-l-4 border-primary bg-linen/60 rounded-r-2xl p-5 sm:p-6 mb-8">
                      <h4 className="font-serif text-sm font-bold text-primary uppercase tracking-wider mb-2">
                        Article Summary
                      </h4>
                      <div className="font-sans text-slate-700 text-sm sm:text-base leading-relaxed prose prose-sm max-w-none prose-table:border-collapse prose-table:w-full prose-th:bg-slate-50 prose-th:border prose-th:border-slate-200 prose-th:p-2 prose-td:border prose-td:border-slate-200 prose-td:p-2 prose-th:text-xs prose-td:text-xs"
                        dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(blog.excerpt) }}
                      />
                    </div>
                  );
                })()}

                {/* Rich content body */}
                {blog.content && (() => {
                  const stripped = stripHtml(blog.content);
                  if (!stripped) return null;
                  return (
                    <div
                      className="prose prose-sm sm:prose-base max-w-none prose-headings:font-serif prose-headings:text-secondary prose-a:text-primary prose-a:no-underline hover:prose-a:underline prose-img:rounded-xl prose-img:shadow-sm prose-blockquote:border-l-primary prose-blockquote:bg-linen/40 prose-blockquote:py-1 prose-blockquote:px-4 prose-blockquote:rounded-r-xl prose-table:border-collapse prose-table:w-full prose-th:bg-slate-50 prose-th:border prose-th:border-slate-200 prose-th:p-2 prose-td:border prose-td:border-slate-200 prose-td:p-2 prose-th:text-xs prose-td:text-xs"
                      dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(blog.content) }}
                    />
                  );
                })()}

                {/* Tags bottom block */}
                <div className="flex flex-wrap items-center gap-2 mt-10 border-t border-slate-50 pt-6">
                  <span className="text-slate-400 font-sans text-xs font-semibold mr-1">Tags:</span>
                  {blog.tags.map((tag) => (
                    <span key={tag} className="bg-linen text-slate-600 font-sans text-xs font-semibold px-3 py-1 rounded-md">
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>

              {/* Author Profile Card Widget */}
              <div className="bg-linen rounded-3xl p-6 sm:p-8 border border-accent/10 flex flex-col sm:flex-row gap-6 items-center text-center sm:text-left">
                <div className="w-16 h-16 rounded-full overflow-hidden shrink-0 border-2 border-primary bg-slate-100">
                  <img
                    src={blog.author.avatar}
                    alt={blog.author.name}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div>
                  <span className="text-primary font-sans text-xs uppercase tracking-wider font-extrabold block mb-0.5">
                    {blog.author.role}
                  </span>
                  <h4 className="font-serif text-lg sm:text-xl font-bold text-secondary mb-2">
                    Written by {blog.author.name}
                  </h4>
                  <p className="font-sans text-slate-600 text-xs sm:text-sm leading-relaxed font-medium">
                    Our leadership is focused on combining culinary craftsmanship with exceptional logistic timing to make every single host review five stars.
                  </p>
                </div>
              </div>

              {/* INTERACTIVE COMMENTS COMPONENT */}
              <div>
                <h3 className="font-serif text-2xl font-bold text-secondary mb-6 border-b border-slate-100 pb-3">
                  Comments ({comments.length})
                </h3>
                
                {/* List */}
                <div className="space-y-4 mb-10">
                  {commentsLoading && comments.length === 0 && (
                    <div className="flex items-center justify-center py-8 text-slate-400">
                      <Loader2 className="w-5 h-5 animate-spin mr-2" />
                      <span className="text-sm font-sans">Loading comments...</span>
                    </div>
                  )}
                  {!commentsLoading && comments.length === 0 && (
                    <p className="text-center text-slate-400 font-sans text-sm py-8">
                      No comments yet. Be the first to share your thoughts!
                    </p>
                  )}
                  {comments.map((comm) => (
                    <div key={comm._id} className="bg-white rounded-2xl p-5 border border-slate-50 shadow-sm">
                      <div className="flex gap-3 sm:gap-4">
                        <div className="shrink-0">
                          {comm.profileImage ? (
                            <img
                              src={comm.profileImage}
                              alt={comm.name}
                              className="w-10 h-10 rounded-full object-cover border border-slate-200"
                            />
                          ) : (
                            <div
                              className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-xs border border-white/20"
                              style={{ backgroundColor: getAvatarColor(comm.name) }}
                            >
                              {getInitials(comm.name)}
                            </div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-baseline gap-2 flex-wrap">
                            <h4 className="font-serif text-sm sm:text-base font-bold text-secondary">
                              {DOMPurify.sanitize(comm.name)}
                            </h4>
                            <span className="text-[10px] text-slate-400 font-sans whitespace-nowrap">
                              {new Date(comm.createdAt).toLocaleDateString('en-US', {
                                year: 'numeric', month: 'long', day: 'numeric'
                              })}
                            </span>
                          </div>
                          <p className="font-sans text-slate-600 text-xs sm:text-sm leading-relaxed mt-1">
                            {DOMPurify.sanitize(comm.comment)}
                          </p>
                          <div className="flex items-center gap-4 mt-2.5">
                            <button
                              onClick={() => {
                                const isOpening = replyingTo !== comm._id;
                                setReplyingTo(isOpening ? comm._id : null);
                                if (isOpening) {
                                  setReplyError('');
                                  if (!repliesMap[comm._id]) {
                                    setRepliesLoading(true);
                                    api.getCommentReplies(comm._id).then(r => {
                                      setRepliesMap(prev => ({ ...prev, [comm._id]: r.data || [] }));
                                      setRepliesLoading(false);
                                    });
                                  }
                                }
                              }}
                              className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-400 hover:text-primary transition-colors"
                            >
                              <span className="text-base leading-none">↩</span>
                              <span>Reply{comm.replyCount && comm.replyCount > 0 ? ` (${comm.replyCount})` : ''}</span>
                            </button>
                          </div>
                        </div>
                      </div>

                      {replyingTo === comm._id && (
                        <div className="mt-4 pt-4 border-t border-slate-100">
                          {replyError && (
                            <div className="mb-3 p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-600 text-xs font-sans">
                              {replyError}
                            </div>
                          )}

                          {/* Replies Thread */}
                          <div className="mb-4">
                            <h5 className="text-xs font-bold font-sans text-slate-500 uppercase tracking-wider mb-2">
                              Replies ({repliesMap[comm._id]?.length ?? 0})
                            </h5>
                            <div className="max-h-[350px] overflow-y-auto rounded-xl border border-slate-100 bg-white p-3 space-y-3">
                              {repliesLoading && (
                                <div className="flex items-center justify-center py-6 text-slate-400">
                                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                                  <span className="text-xs font-sans">Loading replies...</span>
                                </div>
                              )}
                              {!repliesLoading && (!repliesMap[comm._id] || repliesMap[comm._id].length === 0) && (
                                <p className="text-center text-slate-400 font-sans text-xs py-6">
                                  No replies yet. Be the first to reply.
                                </p>
                              )}
                              {!repliesLoading && repliesMap[comm._id]?.map(reply => (
                                <div key={reply._id} className="flex gap-3">
                                  <div className="shrink-0">
                                    {reply.profileImage ? (
                                      <img
                                        src={reply.profileImage}
                                        alt={reply.name}
                                        className="w-7 h-7 rounded-full object-cover border border-slate-200"
                                      />
                                    ) : (
                                      <div
                                        className="w-7 h-7 rounded-full flex items-center justify-center text-white font-bold text-[9px] border border-white/20"
                                        style={{ backgroundColor: getAvatarColor(reply.name) }}
                                      >
                                        {getInitials(reply.name)}
                                      </div>
                                    )}
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <div className="flex items-baseline gap-2 flex-wrap">
                                      <h4 className="font-serif text-xs font-bold text-secondary">
                                        {DOMPurify.sanitize(reply.name)}
                                      </h4>
                                      <span className="text-[9px] text-slate-400 font-sans whitespace-nowrap">
                                        {new Date(reply.createdAt).toLocaleDateString('en-US', {
                                          year: 'numeric', month: 'long', day: 'numeric'
                                        })}
                                      </span>
                                    </div>
                                    <p className="font-sans text-slate-600 text-xs leading-relaxed mt-0.5">
                                      {DOMPurify.sanitize(reply.comment)}
                                    </p>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>

                          {/* Reply Form */}
                          <form onSubmit={(e) => handleReplySubmit(e, comm._id)} className="flex flex-col gap-3">
                            <input
                              type="text"
                              required
                              placeholder="Your full name *"
                              value={replyName}
                              onChange={(e) => setReplyName(e.target.value)}
                              className="w-full bg-cream border border-slate-100 rounded-xl py-2.5 px-3.5 text-xs focus:outline-none focus:border-primary text-secondary font-sans"
                            />
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                              <input
                                type="email"
                                placeholder="Email (optional)"
                                value={replyEmail}
                                onChange={(e) => setReplyEmail(e.target.value)}
                                className="w-full bg-cream border border-slate-100 rounded-xl py-2.5 px-3.5 text-xs focus:outline-none focus:border-primary text-secondary font-sans"
                              />
                              <input
                                type="tel"
                                placeholder="Mobile (optional)"
                                value={replyMobile}
                                onChange={(e) => setReplyMobile(e.target.value)}
                                className="w-full bg-cream border border-slate-100 rounded-xl py-2.5 px-3.5 text-xs focus:outline-none focus:border-primary text-secondary font-sans"
                              />
                            </div>
                            <div>
                              <label className="flex items-center gap-2 cursor-pointer">
                                <div className="flex items-center gap-1.5 bg-cream border border-slate-100 rounded-xl py-2.5 px-3.5 text-xs text-slate-500 font-sans hover:border-primary/50 transition-colors">
                                  <Image className="w-3.5 h-3.5" />
                                  <span>{replyFile ? replyFile.name : 'Profile Picture (optional)'}</span>
                                </div>
                                <input
                                  ref={replyFileRef}
                                  type="file"
                                  accept="image/*"
                                  onChange={handleReplyFileChange}
                                  className="hidden"
                                />
                                {replyPreview && (
                                  <div className="relative">
                                    <img src={replyPreview} alt="" className="w-8 h-8 rounded-full object-cover border border-slate-200" />
                                    <button
                                      type="button"
                                      onClick={() => { setReplyFile(null); setReplyPreview(''); if (replyFileRef.current) replyFileRef.current.value = ''; }}
                                      className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-rose-500 text-white rounded-full text-[8px] flex items-center justify-center hover:bg-rose-600"
                                    >
                                      ×
                                    </button>
                                  </div>
                                )}
                              </label>
                            </div>
                            <textarea
                              required
                              rows={3}
                              placeholder="Write your reply..."
                              value={replyText}
                              onChange={(e) => setReplyText(e.target.value)}
                              className="w-full bg-cream border border-slate-100 rounded-xl py-2.5 px-3.5 text-xs focus:outline-none focus:border-primary text-secondary font-sans"
                            />
                            <div className="flex justify-end gap-2">
                              <button
                                type="button"
                                onClick={() => { setReplyingTo(null); setReplyError(''); }}
                                className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-500 font-sans hover:bg-slate-50 transition-colors"
                              >
                                Cancel
                              </button>
                              <button
                                type="submit"
                                disabled={replySubmitting}
                                className="inline-flex items-center gap-1.5 bg-secondary hover:bg-secondary-hover text-white font-sans font-bold text-xs px-4 py-2 rounded-full transition-transform hover:scale-[1.01] disabled:opacity-60 disabled:cursor-not-allowed"
                              >
                                {replySubmitting ? (
                                  <Loader2 className="w-3 h-3 animate-spin" />
                                ) : (
                                  <Send className="w-3 h-3" />
                                )}
                                <span>{replySubmitting ? 'Submitting...' : 'Submit Reply'}</span>
                              </button>
                            </div>
                          </form>
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                {/* Form */}
                <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-150 shadow-md">
                  <h4 className="font-serif text-xl font-bold text-secondary mb-5">
                    Leave a Comment
                  </h4>

                  {submitMsg && (
                    <div className="mb-4 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-sm font-sans">
                      {submitMsg}
                    </div>
                  )}
                  {submitError && (
                    <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-600 text-sm font-sans">
                      {submitError}
                    </div>
                  )}

                  <form onSubmit={handlePostComment} className="flex flex-col gap-4">
                    <input
                      type="text"
                      required
                      placeholder="Your full name *"
                      value={commentName}
                      onChange={(e) => setCommentName(e.target.value)}
                      className="w-full bg-cream border border-slate-100 rounded-xl py-3 px-4 text-sm focus:outline-none focus:border-primary text-secondary font-sans"
                    />
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <input
                        type="email"
                        placeholder="Email (optional)"
                        value={commentEmail}
                        onChange={(e) => setCommentEmail(e.target.value)}
                        className="w-full bg-cream border border-slate-100 rounded-xl py-3 px-4 text-sm focus:outline-none focus:border-primary text-secondary font-sans"
                      />
                      <input
                        type="tel"
                        placeholder="Mobile (optional)"
                        value={commentMobile}
                        onChange={(e) => setCommentMobile(e.target.value)}
                        className="w-full bg-cream border border-slate-100 rounded-xl py-3 px-4 text-sm focus:outline-none focus:border-primary text-secondary font-sans"
                      />
                    </div>
                    <div>
                      <label className="flex items-center gap-3 cursor-pointer">
                        <div className="flex items-center gap-2 bg-cream border border-slate-100 rounded-xl py-3 px-4 text-sm text-slate-500 font-sans hover:border-primary/50 transition-colors">
                          <Image className="w-4 h-4" />
                          <span>{profileFile ? profileFile.name : 'Profile Picture (optional)'}</span>
                        </div>
                        <input
                          ref={fileInputRef}
                          type="file"
                          accept="image/*"
                          onChange={handleFileChange}
                          className="hidden"
                        />
                        {profilePreview && (
                          <div className="relative">
                            <img src={profilePreview} alt="preview" className="w-10 h-10 rounded-full object-cover border border-slate-200" />
                            <button
                              type="button"
                              onClick={() => { setProfileFile(null); setProfilePreview(''); if (fileInputRef.current) fileInputRef.current.value = ''; }}
                              className="absolute -top-1 -right-1 w-4 h-4 bg-rose-500 text-white rounded-full text-[10px] flex items-center justify-center hover:bg-rose-600"
                            >
                              ×
                            </button>
                          </div>
                        )}
                      </label>
                    </div>
                    <textarea
                      required
                      rows={4}
                      placeholder="Type your thoughts or message..."
                      value={commentText}
                      onChange={(e) => setCommentText(e.target.value)}
                      className="w-full bg-cream border border-slate-100 rounded-xl py-3 px-4 text-sm focus:outline-none focus:border-primary text-secondary font-sans"
                    />
                    <div className="text-right">
                      <button
                        type="submit"
                        disabled={submitting}
                        className="inline-flex items-center gap-1.5 bg-secondary hover:bg-secondary-hover text-white font-sans font-bold text-xs sm:text-sm px-6 py-3 rounded-full transition-transform hover:scale-[1.01] disabled:opacity-60 disabled:cursor-not-allowed"
                      >
                        {submitting ? (
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                          <Send className="w-3.5 h-3.5" />
                        )}
                        <span>{submitting ? 'Submitting...' : 'Post Comment'}</span>
                      </button>
                    </div>
                  </form>
                </div>
              </div>

            </div>

            {/* RIGHT SIDEBAR - 4 Columns */}
            <div className="lg:col-span-4 flex flex-col gap-8">
              
              {/* Related posts list */}
              <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-50 shadow-md text-left flex flex-col gap-5">
                <h4 className="font-serif text-lg font-bold text-secondary border-b border-slate-100 pb-2">
                  Other Articles
                </h4>
                <div className="flex flex-col gap-4">
                  {relatedBlogs.map((rel) => (
                    <Link
                      key={rel.id}
                      to={`/blogs/${rel.slug}`}
                      className="group flex gap-4 items-center border-b border-slate-50 pb-4 last:border-0 last:pb-0"
                    >
                      <div className="w-16 h-16 rounded-xl overflow-hidden shrink-0 bg-slate-100">
                        <img
                          src={rel.image}
                          alt={rel.title}
                          referrerPolicy="no-referrer"
                          className="w-full h-full object-cover transition-transform group-hover:scale-105"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <span className="font-serif text-sm font-bold text-secondary group-hover:text-primary transition-colors block truncate leading-tight">
                          {rel.title}
                        </span>
                        <span className="text-[10px] text-slate-400 block mt-1">
                          {rel.date}
                        </span>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>

              {/* Promo Banner block */}
              <div className="bg-[#102417] text-white rounded-3xl p-8 border border-white/5 shadow-md relative overflow-hidden text-left">
                <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-2xl pointer-events-none" />
                <h3 className="font-serif text-xl sm:text-2xl font-bold text-white mb-3">
                  Need Wedding Ideas?
                </h3>
                <p className="font-sans text-white/70 text-xs leading-relaxed mb-6">
                  Download our free gourmet checklist or request a personalized tasting session with Chef Thomas.
                </p>
                <Link
                  to="/contact"
                  className="w-full text-center bg-primary hover:bg-primary-hover text-secondary font-sans font-bold py-3 rounded-full shadow-md transition-all block text-xs"
                >
                  Request Consultation
                </Link>
              </div>

            </div>

          </div>
        </div>
      </section>
    </div>
  );
}
