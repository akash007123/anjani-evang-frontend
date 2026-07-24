import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Search, Calendar, User, ArrowRight, Clock, Tag, ChevronLeft, ChevronRight, Sparkles } from 'lucide-react';
import PageBanner from '../components/layout/PageBanner';
import SEO from '../components/SEO';
import ScrollReveal from '../components/ScrollReveal';
import { getBlogs } from '../data/getAsyncData';
import { useLanguage } from '../context/LanguageContext';
import { useAsyncData } from '../hooks/useAsyncData';
import LazyImage from '../components/ui/LazyImage';

export default function Blog() {
  const { language, t } = useLanguage();
  const { data: blogs } = useAsyncData(() => getBlogs(language), [], [language]);

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTag, setSelectedTag] = useState<string | null>(null);

  const allTags = Array.from(new Set(blogs.flatMap(b => b.tags)));

  const filteredBlogs = blogs.filter((blog) => {
    const matchesSearch = blog.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          blog.excerpt.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesTag = selectedTag ? blog.tags.includes(selectedTag) : true;
    return matchesSearch && matchesTag;
  });

  return (
    <div>
      <SEO 
        title={t('blogTitle')} 
        description={t('blogSubtitle')}
        urlPath="/blogs"
      />
      <PageBanner 
        title={t('blogTitle')} 
        breadcrumbs={[{ name: t('blog') }]} 
        backgroundImage="https://images.unsplash.com/photo-1555244162-803834f70033?auto=format&fit=crop&w=1600&q=80"
      />

      {/* Main Blog Container Section */}
      <section className="py-20 bg-cream">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
            
            {/* LEFT SIDE - Blog Listing - 8 Columns */}
            <div className="lg:col-span-8 flex flex-col gap-10 text-left">
              
              {filteredBlogs.length === 0 ? (
                <div className="bg-white rounded-3xl p-10 text-center border border-slate-100 shadow-sm">
                  <h3 className="font-serif text-2xl font-bold text-secondary mb-2">{t('noResults')}</h3>
                  <button
                    onClick={() => { setSearchQuery(''); setSelectedTag(null); }}
                    className="bg-primary text-secondary px-6 py-2 rounded-full font-bold text-xs cursor-pointer"
                  >
                    Reset
                  </button>
                </div>
              ) : (
                filteredBlogs.map((blog) => (
                  <article
                    key={blog.id}
                    className="bg-white rounded-3xl overflow-hidden border border-slate-100 shadow-sm hover:shadow-lg transition-all group flex flex-col justify-between"
                  >
                    <div>
                      <div className="h-[280px] sm:h-[360px] overflow-hidden relative bg-slate-100">
                        <img
                          src={blog.image}
                          alt={blog.title}
                          referrerPolicy="no-referrer"
                          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                        />
                        <span className="absolute bottom-4 left-6 bg-primary text-secondary font-sans text-xs font-bold px-3.5 py-1.5 rounded-md shadow-sm">
                          {blog.category}
                        </span>
                      </div>

                      <div className="p-6 sm:p-8 flex flex-col gap-4">
                        <div className="flex flex-wrap gap-5 text-xs text-slate-400 font-sans font-medium">
                          <span className="flex items-center gap-1.5">
                            <Calendar className="w-4 h-4 text-primary" /> {blog.date}
                          </span>
                          <span className="flex items-center gap-1.5">
                            <User className="w-4 h-4 text-primary" /> By {blog.author.name}
                          </span>
                        </div>

                        <h3 className="font-serif text-2xl sm:text-3xl font-bold text-secondary group-hover:text-primary transition-colors leading-tight">
                          <Link to={`/blogs/${blog.slug}`}>{blog.title}</Link>
                        </h3>

                        <p className="font-sans text-slate-500 text-sm sm:text-base leading-relaxed">
                          {blog.excerpt}
                        </p>
                      </div>
                    </div>

                    <div className="px-6 sm:px-8 pb-8 pt-2">
                      <Link
                        to={`/blogs/${blog.slug}`}
                        className="inline-flex items-center gap-2 bg-secondary hover:bg-secondary-hover text-white font-sans font-bold text-xs sm:text-sm px-6 py-3 rounded-full transition-all"
                      >
                        <span>{t('readMore')}</span>
                        <ArrowRight className="w-4 h-4" />
                      </Link>
                    </div>
                  </article>
                ))
              )}

            </div>

            {/* RIGHT SIDEBAR - 4 Columns */}
            <div className="lg:col-span-4 flex flex-col gap-8 text-left">
              
              {/* Search Widget */}
              <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm">
                <h4 className="font-serif text-lg font-bold text-secondary mb-4">{t('search')}</h4>
                <div className="relative">
                  <input
                    type="text"
                    placeholder={t('searchPlaceholder')}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-cream rounded-full py-3 pl-5 pr-12 text-xs font-sans focus:outline-none focus:ring-2 focus:ring-primary/50 text-slate-700"
                  />
                  <Search className="w-4 h-4 text-slate-400 absolute right-4 top-3.5" />
                </div>
              </div>

              {/* Tags Cloud */}
              <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm">
                <h4 className="font-serif text-lg font-bold text-secondary mb-4 flex items-center gap-2">
                  <Tag className="w-4 h-4 text-primary" /> Tags
                </h4>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => setSelectedTag(null)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-sans font-bold transition-colors cursor-pointer ${
                      selectedTag === null ? 'bg-primary text-secondary' : 'bg-cream text-slate-600 hover:bg-linen'
                    }`}
                  >
                    {t('all')}
                  </button>
                  {allTags.map((tag) => (
                    <button
                      key={tag}
                      onClick={() => setSelectedTag(tag)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-sans font-bold transition-colors cursor-pointer ${
                        selectedTag === tag ? 'bg-primary text-secondary' : 'bg-cream text-slate-600 hover:bg-linen'
                      }`}
                    >
                      #{tag}
                    </button>
                  ))}
                </div>
              </div>

            </div>

          </div>
        </div>
      </section>
    </div>
  );
}
