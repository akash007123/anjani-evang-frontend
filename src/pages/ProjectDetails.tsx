import { useParams, Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Calendar, MapPin, Users, Award, ArrowRight, ArrowLeft, CheckSquare, Utensils, Maximize2, Share2, Check, Copy } from 'lucide-react';
import PageBanner from '../components/layout/PageBanner';
import SEO from '../components/SEO';
import { getProjectBySlug, getProjects } from '../data/getAsyncData';
import { useAsyncData } from '../hooks/useAsyncData';
import Lightbox from '../components/Lightbox';
import LazyImage from '../components/ui/LazyImage';

export default function ProjectDetails() {
  const { slug } = useParams<{ slug: string }>();

  const { data: project } = useAsyncData(() => getProjectBySlug(slug || '', 'en'), null, [slug]);
  const { data: allProjects } = useAsyncData(() => getProjects('en'), [] as any[], []);

  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [activePhotoIndex, setActivePhotoIndex] = useState(0);
  const [copied, setCopied] = useState(false);

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Auto scroll on slug change
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [slug]);

  if (!project) {
    return (
      <div className="py-24 text-center bg-cream min-h-[60vh] flex flex-col items-center justify-center gap-4">
        <h2 className="font-serif text-3xl font-bold text-secondary">Project Story Not Found</h2>
        <p className="text-slate-600 font-sans">We couldn't locate the event catering case story you requested.</p>
        <Link to="/projects" className="bg-primary text-secondary px-6 py-2.5 rounded-full font-bold">
          Back to Projects
        </Link>
      </div>
    );
  }

  // Find related projects
  const relatedProjects = allProjects.filter(p => p.id !== project.id).slice(0, 2);

  return (
    <div>
      <SEO 
        title={`${project.title} - Case Story`} 
        description={project.description}
        image={project.image}
        urlPath={`/projects/${project.slug}`}
      />
      <PageBanner 
        title={project.title} 
        breadcrumbs={[{ name: 'Projects', path: '/projects' }, { name: project.title }]} 
        backgroundImage={project.image}
      />

      {/* Main Case study Details Section */}
      <section className="py-20 bg-cream">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16">
            
            {/* Left Main details block - 8 Columns */}
            <div className="lg:col-span-8 flex flex-col gap-8 text-left">
              
              {/* Cover Narrative */}
              <div>
                <div className="flex flex-wrap justify-between items-center gap-3 mb-2">
                  <span className="text-primary font-sans text-xs sm:text-sm uppercase tracking-[0.25em] font-extrabold">
                    CASE STUDY & TRANSCRIPT
                  </span>
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
                <h2 className="font-serif text-3xl sm:text-4xl font-bold text-secondary mb-4 leading-tight">
                  How We Delivered {project.title}
                </h2>
                <p className="font-sans text-slate-600 text-sm sm:text-base leading-relaxed mb-6 font-medium">
                  {project.description}
                </p>
                <p className="font-sans text-slate-500 text-xs sm:text-sm leading-relaxed">
                  Working closely with our venue managers and client experience consultants, we finalized a culinary roadmap that aligned with the environmental colors, weather conditions, and speaker timing layouts. Every plate was dropped within a 3-minute synchronous service window, ensuring perfect heat preservation and zero programmatic delay.
                </p>
              </div>

              {/* Photo Showcase Gallery */}
              <div>
                <h3 className="font-serif text-2xl font-bold text-secondary mb-5">
                  Event Gallery & Visuals
                </h3>
                <motion.div 
                  initial="hidden"
                  animate="visible"
                  variants={{
                    hidden: { opacity: 0 },
                    visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
                  }}
                  className="grid grid-cols-1 sm:grid-cols-3 gap-4"
                >
                  {project.gallery.map((img, idx) => (
                    <motion.div
                      key={idx}
                      variants={{
                        hidden: { opacity: 0, y: 20, scale: 0.95 },
                        visible: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.4, ease: 'easeOut' } }
                      }}
                      whileHover={{ scale: 1.02 }}
                      onClick={() => {
                        setActivePhotoIndex(idx);
                        setLightboxOpen(true);
                      }}
                      className="group relative h-44 sm:h-48 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow cursor-pointer"
                    >
                      <LazyImage
                        src={img}
                        alt={`${project.title} Event Photo ${idx + 1}`}
                        wrapperClassName="w-full h-full"
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                      {/* Interactive overlay with premium hover effect */}
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                        <div className="bg-white/95 text-secondary p-3 rounded-full shadow-lg scale-90 group-hover:scale-100 transition-transform duration-300">
                          <Maximize2 className="w-5 h-5 text-secondary" />
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </motion.div>

                {/* Lightbox component stage */}
                <Lightbox
                  images={project.gallery}
                  initialIndex={activePhotoIndex}
                  isOpen={lightboxOpen}
                  onClose={() => setLightboxOpen(false)}
                  title={project.title}
                />
              </div>

              {/* Customized Menu served list */}
              <div className="bg-[#102417] text-white rounded-3xl p-6 sm:p-8 border border-white/5 shadow-md">
                <div className="flex items-center gap-2.5 mb-5 border-b border-white/10 pb-4">
                  <Utensils className="w-5 h-5 text-primary" />
                  <h3 className="font-serif text-2xl font-bold text-white">
                    Gourmet Menu Served
                  </h3>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {project.menuServed.map((dish, idx) => (
                    <div key={idx} className="flex items-start gap-3 bg-white/5 p-3 rounded-xl border border-white/5 font-sans">
                      <div className="w-5 h-5 rounded-full bg-primary/20 flex items-center justify-center shrink-0 mt-0.5">
                        <span className="text-[10px] font-bold text-primary">{idx + 1}</span>
                      </div>
                      <span className="text-xs sm:text-sm text-white/90 font-medium">
                        {dish}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

            </div>

            {/* Right Metadata Sidebar - 4 Columns */}
            <div className="lg:col-span-4 flex flex-col gap-8">
              
              {/* Event Metadata Card */}
              <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-50 shadow-md text-left flex flex-col gap-5">
                <h4 className="font-serif text-xl font-bold text-secondary border-b border-slate-100 pb-3">
                  Event Information
                </h4>
                <div className="space-y-4 font-sans text-xs sm:text-sm text-slate-600 font-medium">
                  <div className="flex justify-between items-center border-b border-slate-50 pb-2.5">
                    <span className="text-slate-400">Client:</span>
                    <strong className="text-secondary">{project.client}</strong>
                  </div>
                  <div className="flex justify-between items-center border-b border-slate-50 pb-2.5">
                    <span className="text-slate-400">Date:</span>
                    <span className="text-secondary font-semibold">{project.date}</span>
                  </div>
                  <div className="flex justify-between items-center border-b border-slate-50 pb-2.5">
                    <span className="text-slate-400">Location:</span>
                    <span className="text-secondary font-semibold text-right max-w-[180px]">{project.location}</span>
                  </div>
                  <div className="flex justify-between items-center border-b border-slate-50 pb-2.5">
                    <span className="text-slate-400">Total Guests:</span>
                    <strong className="text-secondary">{project.guestsCount}</strong>
                  </div>
                  <div className="flex justify-between items-center pb-1">
                    <span className="text-slate-400">Service Category:</span>
                    <span className="bg-linen text-primary font-sans text-[11px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-md">
                      {project.category}
                    </span>
                  </div>
                  <div className="pt-3 border-t border-slate-100">
                    <button
                      type="button"
                      onClick={handleCopyLink}
                      className="w-full flex items-center justify-center gap-2 bg-cream hover:bg-linen text-secondary border border-slate-200 py-2.5 px-4 rounded-xl text-xs font-bold transition-all"
                    >
                      {copied ? (
                        <>
                          <Check className="w-4 h-4 text-emerald-600" />
                          <span className="text-emerald-600">Link Copied to Clipboard!</span>
                        </>
                      ) : (
                        <>
                          <Share2 className="w-4 h-4 text-primary" />
                          <span>Share / Copy Story Link</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>

              {/* Related project stories suggestions */}
              <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-50 shadow-md text-left flex flex-col gap-5">
                <h4 className="font-serif text-lg font-bold text-secondary border-b border-slate-100 pb-2">
                  Other Event Stories
                </h4>
                <div className="flex flex-col gap-4">
                  {relatedProjects.map((rel) => (
                    <Link
                      key={rel.id}
                      to={`/projects/${rel.slug}`}
                      className="group flex gap-4 items-center border-b border-slate-50 pb-4 last:border-0 last:pb-0"
                    >
                      <div className="w-16 h-16 rounded-xl overflow-hidden shrink-0 bg-slate-50">
                        <LazyImage
                          src={rel.image}
                          alt={rel.title}
                          wrapperClassName="w-full h-full"
                          className="w-full h-full object-cover transition-transform group-hover:scale-105"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <span className="font-serif text-sm font-bold text-secondary group-hover:text-primary transition-colors block truncate leading-tight">
                          {rel.title}
                        </span>
                        <span className="text-[10px] uppercase tracking-wider font-bold text-primary block mt-0.5">
                          Read Story
                        </span>
                      </div>
                    </Link>
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
