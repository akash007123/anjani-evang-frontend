import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence, Variants } from 'motion/react';
import { Calendar, MapPin, Users, ArrowRight, Maximize2 } from 'lucide-react';
import PageBanner from '../components/layout/PageBanner';
import SEO from '../components/SEO';
import { getProjects } from '../data/getAsyncData';
import Lightbox from '../components/Lightbox';
import { ProjectsSkeleton } from '../components/SkeletonGrid';
import LazyImage from '../components/ui/LazyImage';
import { useLanguage } from '../context/LanguageContext';
import { useAsyncData } from '../hooks/useAsyncData';

const gridContainerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.05,
    },
  },
  exit: {
    opacity: 0,
    transition: {
      staggerChildren: 0.05,
      staggerDirection: -1,
    },
  },
};

const gridItemVariants: Variants = {
  hidden: {
    opacity: 0,
    y: 28,
    scale: 0.96,
  },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: 0.45,
      ease: [0.25, 1, 0.5, 1],
    },
  },
  exit: {
    opacity: 0,
    y: 12,
    scale: 0.96,
    transition: {
      duration: 0.2,
      ease: 'easeIn',
    },
  },
};

export default function Projects() {
  const { language, t } = useLanguage();
  const { data: projects } = useAsyncData(() => getProjects(language), [], [language]);

  const [selectedFilter, setSelectedFilter] = useState<'All' | 'Wedding' | 'Corporate' | 'Social'>('All');
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [activeProjectImages, setActiveProjectImages] = useState<string[]>([]);
  const [lightboxTitle, setLightboxTitle] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsLoading(true);
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 500);
    return () => clearTimeout(timer);
  }, [selectedFilter]);

  const filteredProjects = selectedFilter === 'All'
    ? projects
    : projects.filter(p => p.category === selectedFilter || p.category.toLowerCase().includes(selectedFilter.toLowerCase()));

  return (
    <div>
      <SEO 
        title={t('projectsTitle')} 
        description={t('projectsSubtitle')}
        urlPath="/projects"
      />
      <PageBanner 
        title={t('projectsTitle')} 
        breadcrumbs={[{ name: t('projects') }]} 
        backgroundImage="https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&w=1600&q=80"
      />

      {/* Projects Grid Section */}
      <section className="py-20 bg-cream">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-xl mx-auto mb-16 flex flex-col gap-4">
            <span className="text-primary uppercase tracking-[0.25em] text-xs sm:text-sm font-bold block">
              {t('projectsTitle')}
            </span>
            <h2 className="font-serif text-3xl sm:text-4xl font-bold text-secondary">
              {t('projectsSubtitle')}
            </h2>
          </div>

          {/* Project Filtering Navigation Tabs */}
          <div className="flex flex-wrap items-center justify-center gap-3 mb-16">
            {['All', 'Wedding', 'Corporate', 'Social'].map((filter) => (
              <button
                key={filter}
                onClick={() => setSelectedFilter(filter as any)}
                className={`px-6 sm:px-8 py-3 rounded-full font-sans font-bold text-xs sm:text-sm transition-all duration-300 cursor-pointer ${
                  selectedFilter === filter
                    ? 'bg-primary text-secondary shadow-md'
                    : 'bg-white hover:bg-linen text-slate-700 border border-slate-100'
                }`}
              >
                {filter === 'All' ? t('all') : filter}
              </button>
            ))}
          </div>

          {/* Grid Layout or Skeleton States */}
          <AnimatePresence mode="wait">
            {isLoading ? (
              <motion.div
                key="skeleton"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                <ProjectsSkeleton count={filteredProjects.length || 3} />
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
                {filteredProjects.map((project) => (
                  <motion.div
                    key={project.id}
                    variants={gridItemVariants}
                    whileHover={{ y: -8, transition: { duration: 0.25, ease: 'easeOut' } }}
                    className="bg-white rounded-3xl overflow-hidden border border-slate-100 shadow-sm hover:shadow-xl transition-all duration-300 group flex flex-col justify-between text-left"
                  >
                    <div>
                      {/* Cover Photo */}
                      <div className="h-64 overflow-hidden relative">
                        <LazyImage
                          src={project.image}
                          alt={project.title}
                          wrapperClassName="w-full h-full"
                          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                        />
                        <div className="absolute top-4 right-4 bg-secondary/80 backdrop-blur-md text-primary font-sans text-[10px] uppercase font-extrabold px-3 py-1 rounded-md">
                          {project.category}
                        </div>

                        {/* Quick View Lightbox button */}
                        <button
                          onClick={() => {
                            setActiveProjectImages(project.gallery || [project.image]);
                            setLightboxTitle(project.title);
                            setLightboxOpen(true);
                          }}
                          className="absolute bottom-4 right-4 bg-white/90 hover:bg-primary text-secondary p-2.5 rounded-xl shadow-md transition-all opacity-0 group-hover:opacity-100 cursor-pointer"
                          title="Open Photo Gallery"
                        >
                          <Maximize2 className="w-4 h-4" />
                        </button>
                      </div>

                      {/* Content Body */}
                      <div className="p-6 sm:p-8 flex flex-col gap-4">
                        <h3 className="font-serif text-2xl font-bold text-secondary group-hover:text-primary transition-colors leading-tight">
                          {project.title}
                        </h3>

                        {/* Meta Tags */}
                        <div className="flex flex-wrap gap-4 text-xs font-sans text-slate-500 font-semibold border-y border-slate-100 py-3">
                          <span className="flex items-center gap-1.5">
                            <MapPin className="w-3.5 h-3.5 text-primary" />
                            {project.location}
                          </span>
                          <span className="flex items-center gap-1.5">
                            <Users className="w-3.5 h-3.5 text-primary" />
                            {project.guestsCount} {t('guests')}
                          </span>
                          <span className="flex items-center gap-1.5">
                            <Calendar className="w-3.5 h-3.5 text-primary" />
                            {project.date}
                          </span>
                        </div>

                        <p className="font-sans text-slate-600 text-xs sm:text-sm leading-relaxed">
                          {project.description}
                        </p>
                      </div>
                    </div>

                    <div className="px-6 sm:px-8 pb-6 sm:pb-8 pt-0">
                      <Link
                        to={`/projects/${project.slug}`}
                        className="inline-flex items-center gap-2 text-secondary hover:text-primary font-sans font-bold text-xs uppercase tracking-wider transition-colors"
                      >
                        <span>{t('exploreCase')}</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </Link>
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Lightbox Component modal */}
          <Lightbox
            isOpen={lightboxOpen}
            onClose={() => setLightboxOpen(false)}
            images={activeProjectImages}
            title={lightboxTitle}
            initialIndex={0}
          />

        </div>
      </section>
    </div>
  );
}
