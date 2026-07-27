import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence, Variants } from 'motion/react';
import { Play, Maximize2, X, Video, Image as ImageIcon } from 'lucide-react';
import PageBanner from '../components/layout/PageBanner';
import SEO from '../components/SEO';
import { getGalleryItems } from '../data/getAsyncData';
import Lightbox from '../components/Lightbox';
import { ProjectsSkeleton } from '../components/SkeletonGrid';
import LazyImage from '../components/ui/LazyImage';
import { useLanguage } from '../context/LanguageContext';
import { useAsyncData } from '../hooks/useAsyncData';

const gridContainerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1, delayChildren: 0.05 },
  },
  exit: {
    opacity: 0,
    transition: { staggerChildren: 0.05, staggerDirection: -1 },
  },
};

const gridItemVariants: Variants = {
  hidden: { opacity: 0, y: 28, scale: 0.96 },
  visible: {
    opacity: 1, y: 0, scale: 1,
    transition: { duration: 0.45, ease: [0.25, 1, 0.5, 1] },
  },
  exit: {
    opacity: 0, y: 12, scale: 0.96,
    transition: { duration: 0.2, ease: 'easeIn' },
  },
};

export default function Gallery() {
  const { language, t } = useLanguage();
  const { data: items } = useAsyncData(() => getGalleryItems(language), [], [language]);

  const categories = ['All', ...new Set(items.map(i => i.category))];
  const [selectedFilter, setSelectedFilter] = useState<string>('All');
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [activeImages, setActiveImages] = useState<string[]>([]);
  const [lightboxTitle, setLightboxTitle] = useState('');
  const [videoModal, setVideoModal] = useState<{ url: string; title: string; type: string } | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsLoading(true);
    const timer = setTimeout(() => setIsLoading(false), 500);
    return () => clearTimeout(timer);
  }, [selectedFilter]);

  const filteredItems = selectedFilter === 'All'
    ? items
    : items.filter(i => i.category === selectedFilter);

  const openLightbox = useCallback((galleryItem: any) => {
    setActiveImages([galleryItem.imageUrl]);
    setLightboxTitle(galleryItem.title);
    setLightboxOpen(true);
  }, []);

  const openVideo = useCallback((item: any) => {
    const url = item.videoUrl;
    const ytMatch = url.match(/(?:v=|youtu\.be\/|embed\/|shorts\/)([\w-]+)/);
    const vMatch = url.match(/vimeo\.com\/(?:.*\/)?(\d+)/);
    if (ytMatch) {
      setVideoModal({ url: `https://www.youtube.com/embed/${ytMatch[1]}?autoplay=1`, title: item.title, type: 'youtube' });
    } else if (vMatch) {
      setVideoModal({ url: `https://player.vimeo.com/video/${vMatch[1]}?autoplay=1`, title: item.title, type: 'vimeo' });
    } else {
      setVideoModal({ url, title: item.title, type: 'mp4' });
    }
  }, []);

  return (
    <div>
      <SEO
        title={t('galleryTitle') || 'Gallery'}
        description={t('gallerySubtitle') || 'Explore our catering photo and video gallery'}
        urlPath="/gallery"
      />
      <PageBanner
        title={t('galleryTitle') || 'Gallery'}
        breadcrumbs={[{ name: t('gallery') || 'Gallery' }]}
        backgroundImage="https://images.unsplash.com/photo-1555244162-803834f70033?auto=format&fit=crop&w=1600&q=80"
      />

      <section className="py-20 bg-cream">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-xl mx-auto mb-16 flex flex-col gap-4">
            <span className="text-primary uppercase tracking-[0.25em] text-xs sm:text-sm font-bold block">
              {t('galleryTitle') || 'Gallery'}
            </span>
            <h2 className="font-serif text-3xl sm:text-4xl font-bold text-secondary">
              {t('gallerySubtitle') || 'Moments captured through our lens'}
            </h2>
          </div>

          {categories.length > 1 && (
            <div className="flex flex-wrap items-center justify-center gap-3 mb-16">
              {categories.map((filter) => (
                <button
                  key={filter}
                  onClick={() => setSelectedFilter(filter)}
                  className={`px-6 sm:px-8 py-3 rounded-full font-sans font-bold text-xs sm:text-sm transition-all duration-300 cursor-pointer ${
                    selectedFilter === filter
                      ? 'bg-primary text-secondary shadow-md'
                      : 'bg-white hover:bg-linen text-slate-700 border border-slate-100'
                  }`}
                >
                  {filter === 'All' ? t('all') || 'All' : filter}
                </button>
              ))}
            </div>
          )}

          <AnimatePresence mode="wait">
            {isLoading ? (
              <motion.div
                key="skeleton"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                <ProjectsSkeleton count={filteredItems.length || 3} />
              </motion.div>
            ) : filteredItems.length === 0 ? (
              <motion.div
                key="empty"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center py-20 text-slate-400"
              >
                <ImageIcon className="w-16 h-16 mx-auto mb-4 text-slate-300" />
                <p className="text-lg font-bold text-slate-500">No gallery items found</p>
              </motion.div>
            ) : (
              <motion.div
                key={selectedFilter}
                variants={gridContainerVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
              >
                {filteredItems.map((item) => {
                  const thumb = item.type === 'video' ? (item.thumbnail || item.imageUrl) : item.imageUrl;
                  return (
                    <motion.div
                      key={item.id}
                      variants={gridItemVariants}
                      whileHover={{ y: -8, transition: { duration: 0.25, ease: 'easeOut' } }}
                      className="bg-white rounded-3xl overflow-hidden border border-slate-100 shadow-sm hover:shadow-xl transition-all duration-300 group flex flex-col justify-between text-left"
                    >
                      <div>
                        <div className="h-64 overflow-hidden relative">
                          <LazyImage
                            src={thumb}
                            alt={item.title}
                            wrapperClassName="w-full h-full"
                            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                          />
                          <div className="absolute top-4 right-4 bg-secondary/80 backdrop-blur-md text-primary font-sans text-[10px] uppercase font-extrabold px-3 py-1 rounded-md">
                            {item.category}
                          </div>
                          <div className="absolute top-4 left-4 bg-secondary/80 backdrop-blur-md text-white font-sans text-[10px] uppercase font-extrabold px-3 py-1 rounded-md flex items-center gap-1">
                            {item.type === 'video' ? <Video className="w-3 h-3" /> : <ImageIcon className="w-3 h-3" />}
                            {item.type}
                          </div>

                          {item.type === 'video' ? (
                            <button
                              onClick={() => openVideo(item)}
                              className="absolute inset-0 flex items-center justify-center bg-secondary/20 opacity-60 hover:opacity-100 transition-opacity cursor-pointer"
                            >
                              <div className="w-14 h-14 rounded-full bg-primary text-secondary flex items-center justify-center shadow-lg hover:scale-110 transition-transform">
                                <Play className="w-6 h-6 fill-secondary translate-x-0.5" />
                              </div>
                            </button>
                          ) : (
                            <button
                              onClick={() => openLightbox(item)}
                              className="absolute bottom-4 right-4 bg-white/90 hover:bg-primary text-secondary p-2.5 rounded-xl shadow-md transition-all opacity-0 group-hover:opacity-100 cursor-pointer"
                              title="View Image"
                            >
                              <Maximize2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>

                        <div className="p-6 sm:p-8 flex flex-col gap-4">
                          <h3 className="font-serif text-2xl font-bold text-secondary group-hover:text-primary transition-colors leading-tight">
                            {item.title}
                          </h3>
                          {item.description && (
                            <p className="font-sans text-slate-600 text-xs sm:text-sm leading-relaxed">
                              {item.description}
                            </p>
                          )}
                        </div>
                      </div>

                      {item.featured && (
                        <div className="px-6 sm:px-8 pb-6 sm:pb-8 pt-0">
                          <span className="inline-flex items-center gap-1.5 bg-primary/10 text-primary text-[10px] font-extrabold uppercase tracking-wider px-3 py-1 rounded-full">
                            Featured
                          </span>
                        </div>
                      )}
                    </motion.div>
                  );
                })}
              </motion.div>
            )}
          </AnimatePresence>

          <Lightbox
            isOpen={lightboxOpen}
            onClose={() => setLightboxOpen(false)}
            images={activeImages}
            title={lightboxTitle}
            initialIndex={0}
          />

          {videoModal && (
            <div
              className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4"
              onClick={() => setVideoModal(null)}
            >
              <div
                className="relative w-full max-w-4xl bg-black rounded-2xl overflow-hidden shadow-2xl"
                onClick={(e) => e.stopPropagation()}
              >
                <button
                  onClick={() => setVideoModal(null)}
                  className="absolute top-4 right-4 z-10 p-2 bg-white/10 hover:bg-white/20 text-white rounded-full transition-all cursor-pointer"
                >
                  <X className="w-6 h-6" />
                </button>
                <div className="aspect-video">
                  {videoModal.type === 'mp4' ? (
                    <video
                      src={videoModal.url}
                      controls
                      autoPlay
                      className="w-full h-full object-contain"
                    />
                  ) : (
                    <iframe
                      src={videoModal.url}
                      title={videoModal.title}
                      className="w-full h-full"
                      allow="autoplay; fullscreen"
                      allowFullScreen
                    />
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}