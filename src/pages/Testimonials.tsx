import React, { useState, useEffect } from 'react';
import { 
  Star, MessageSquare, Quote, Heart, ChevronLeft, ChevronRight, Play, 
  CheckCircle2, Award, Calendar, MapPin, Sparkles, Clock, ArrowRight, 
  X, Maximize2, ChevronDown, ChevronUp, Utensils, ThumbsUp, Send, UserCheck, ShieldCheck
} from 'lucide-react';
import PageBanner from '../components/layout/PageBanner';
import SEO from '../components/SEO';
import { motion, AnimatePresence } from 'motion/react';
import { Link } from 'react-router-dom';
import { 
  videoTestimonials, 
  galleryItems, 
  TestimonialItem, 
  VideoTestimonial 
} from '../data/testimonialsData';
import { getTestimonialsData } from '../data/getAsyncData';
import { useLanguage } from '../context/LanguageContext';
import { useAsyncData } from '../hooks/useAsyncData';

// --- Count-Up Stat Component ---
interface StatCardProps {
  end: number;
  suffix?: string;
  label: string;
  icon: React.ReactNode;
}

function StatCard({ end, suffix = '', label, icon }: StatCardProps) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let startTime: number | null = null;
    const duration = 1500; // ms

    const animate = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = timestamp - startTime;
      const percentage = Math.min(progress / duration, 1);
      
      // Easing out quadratic
      const easedProgress = percentage * (2 - percentage);
      setCount(Math.floor(easedProgress * end));

      if (progress < duration) {
        requestAnimationFrame(animate);
      } else {
        setCount(end);
      }
    };

    requestAnimationFrame(animate);
  }, [end]);

  return (
    <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm flex flex-col items-center text-center group hover:shadow-md transition-shadow">
      <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
        {icon}
      </div>
      <div className="font-serif text-3xl sm:text-4xl font-bold text-secondary mb-1">
        {count.toLocaleString()}{suffix}
      </div>
      <div className="text-xs sm:text-sm text-slate-500 font-bold tracking-wide uppercase">
        {label}
      </div>
    </div>
  );
}

// --- Video Player Lightbox Modal ---
interface VideoModalProps {
  isOpen: boolean;
  onClose: () => void;
  video: VideoTestimonial | null;
}

function VideoModal({ isOpen, onClose, video }: VideoModalProps) {
  if (!isOpen || !video) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="relative w-full max-w-3xl bg-slate-950 rounded-3xl overflow-hidden border border-white/10 shadow-2xl"
        >
          {/* Close Header */}
          <div className="p-4 bg-slate-900 border-b border-white/5 flex justify-between items-center text-white">
            <div>
              <h4 className="font-serif text-base sm:text-lg font-bold">{video.name}</h4>
              <p className="text-[11px] text-primary font-sans font-semibold uppercase tracking-wider">{video.eventType} • {video.city}</p>
            </div>
            <button 
              onClick={onClose}
              className="p-2 hover:bg-white/10 rounded-full transition-colors cursor-pointer text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Responsive Video Container */}
          <div className="aspect-video w-full bg-black relative flex items-center justify-center">
            {/* Embedded simulated player with luxury Indian wedding highlight cinematic loop (visual only) */}
            <iframe
              className="w-full h-full absolute inset-0"
              src={`${video.videoUrl}?autoplay=1&mute=1&loop=1&playlist=${video.videoUrl.split('/').pop()}`}
              title={video.name}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            ></iframe>
            {/* Visual fallback simulator notice */}
            <div className="absolute bottom-3 left-4 right-4 bg-black/60 backdrop-blur-md p-3 rounded-xl border border-white/10 text-left pointer-events-none z-10">
              <span className="text-[10px] bg-primary/20 text-primary border border-primary/30 px-2 py-0.5 rounded-full font-bold uppercase tracking-widest mb-1 inline-block">
                Cinematic Highlight Sim
              </span>
              <p className="text-[11px] text-white/95 font-medium">
                Showing simulated host wedding celebration showcase. Experience premium hospitality of Anjani Catering & Events.
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}

// --- Image Lightbox Modal ---
interface ImageModalProps {
  isOpen: boolean;
  onClose: () => void;
  imageIndex: number;
  images: typeof galleryItems;
  onPrev: () => void;
  onNext: () => void;
}

function ImageModal({ isOpen, onClose, imageIndex, images, onPrev, onNext }: ImageModalProps) {
  if (!isOpen || imageIndex < 0) return null;
  const currentImage = images[imageIndex];

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-md">
        {/* Absolute close trigger on background click */}
        <div className="absolute inset-0 cursor-zoom-out" onClick={onClose} />

        <button 
          onClick={onClose}
          className="absolute right-6 top-6 z-55 p-3 bg-white/10 text-white hover:bg-white/20 rounded-full transition-colors cursor-pointer"
        >
          <X className="w-6 h-6" />
        </button>

        {/* Carousel controls */}
        <button 
          onClick={(e) => { e.stopPropagation(); onPrev(); }}
          className="absolute left-4 top-1/2 -translate-y-1/2 z-55 p-3 sm:p-4 bg-white/10 text-white hover:bg-white/20 rounded-full transition-all cursor-pointer hover:scale-105 active:scale-95"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>

        <button 
          onClick={(e) => { e.stopPropagation(); onNext(); }}
          className="absolute right-4 top-1/2 -translate-y-1/2 z-55 p-3 sm:p-4 bg-white/10 text-white hover:bg-white/20 rounded-full transition-all cursor-pointer hover:scale-105 active:scale-95"
        >
          <ChevronRight className="w-6 h-6" />
        </button>

        {/* Image wrapper */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="relative max-w-4xl w-full z-10 flex flex-col items-center pointer-events-none"
        >
          <div className="relative w-full max-h-[75vh] rounded-3xl overflow-hidden border border-white/10 bg-slate-900 flex items-center justify-center">
            <img 
              src={currentImage.url} 
              alt={currentImage.title}
              referrerPolicy="no-referrer"
              className="max-w-full max-h-[75vh] object-contain"
            />
          </div>
          
          <div className="mt-4 text-center text-white pointer-events-auto">
            <span className="text-xs bg-primary/20 text-primary border border-primary/30 px-3 py-1 rounded-full font-bold uppercase tracking-wider mb-2 inline-block">
              {currentImage.category}
            </span>
            <h4 className="font-serif text-lg sm:text-xl font-bold">{currentImage.title}</h4>
            <p className="text-xs text-slate-400 mt-1">Image {imageIndex + 1} of {images.length}</p>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}


export default function Testimonials() {
  const { language, t } = useLanguage();
  const { data: testimonialsData } = useAsyncData(() => getTestimonialsData(language), [], [language]);

  // Carousel State (Main Featured)
  const [carouselIndex, setCarouselIndex] = useState(0);
  const featuredTestimonials = testimonialsData.slice(0, 3); // top 3 as main carousel attraction
  const [touchStart, setTouchStart] = useState<number | null>(null);

  // Auto-play for carousel
  useEffect(() => {
    const timer = setInterval(() => {
      setCarouselIndex((prev) => (prev + 1) % featuredTestimonials.length);
    }, 8000);
    return () => clearInterval(timer);
  }, [featuredTestimonials.length]);

  // Touch Swipe Handlers for carousel
  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStart(e.targetTouches[0].clientX);
  };
  const handleTouchMove = (e: React.TouchEvent) => {
    if (touchStart === null) return;
    const touchEnd = e.targetTouches[0].clientX;
    const diff = touchStart - touchEnd;

    if (diff > 50) {
      // Swiped left
      setCarouselIndex((prev) => (prev + 1) % featuredTestimonials.length);
      setTouchStart(null);
    } else if (diff < -50) {
      // Swiped right
      setCarouselIndex((prev) => (prev - 1 + featuredTestimonials.length) % featuredTestimonials.length);
      setTouchStart(null);
    }
  };

  // Keyboard Navigation for Carousel
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') {
        setCarouselIndex((prev) => (prev - 1 + featuredTestimonials.length) % featuredTestimonials.length);
      } else if (e.key === 'ArrowRight') {
        setCarouselIndex((prev) => (prev + 1) % featuredTestimonials.length);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [featuredTestimonials.length]);

  // Category Filtering State
  const categories = [
    'All', 'Weddings', 'Corporate Events', 'Birthday Parties', 
    'Anniversary Celebrations', 'Housewarming', 'Festival Catering', 'Reception Events'
  ];
  const [activeCategory, setActiveCategory] = useState('All');

  // Filtered testimonials
  const filteredTestimonials = testimonialsData.filter(test => {
    if (activeCategory === 'All') return true;
    return test.category === activeCategory;
  });

  // Expand / collapse reviews mapping state
  const [expandedReviews, setExpandedReviews] = useState<Record<string, boolean>>({});
  const toggleReviewExpand = (id: string) => {
    setExpandedReviews(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  // Video Lightbox Modal State
  const [videoModalOpen, setVideoModalOpen] = useState(false);
  const [selectedVideo, setSelectedVideo] = useState<VideoTestimonial | null>(null);

  // Image Lightbox Modal State
  const [imageModalOpen, setImageModalOpen] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState<number>(-1);

  // Write custom client review feedback state
  const [writeReviewName, setWriteReviewName] = useState('');
  const [writeReviewEmail, setWriteReviewEmail] = useState('');
  const [writeReviewCity, setWriteReviewCity] = useState('');
  const [writeReviewType, setWriteReviewType] = useState('Weddings');
  const [writeReviewRating, setWriteReviewRating] = useState(5);
  const [writeReviewFeedback, setWriteReviewFeedback] = useState('');
  const [reviewSubmitSuccess, setReviewSubmitSuccess] = useState(false);
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);

  const handleSubmitReview = (e: React.FormEvent) => {
    e.preventDefault();
    if (!writeReviewName || !writeReviewFeedback) return;
    setIsSubmittingReview(true);
    
    // Simulate API storage delay
    setTimeout(() => {
      setIsSubmittingReview(false);
      setReviewSubmitSuccess(true);
      // Clear inputs
      setWriteReviewName('');
      setWriteReviewEmail('');
      setWriteReviewCity('');
      setWriteReviewFeedback('');
      
      // Clear banner after 10s
      setTimeout(() => setReviewSubmitSuccess(false), 10000);
    }, 1200);
  };

  // Helper to split filtered list into 3 balanced columns for beautiful masonry display
  const getMasonryColumns = () => {
    const col1: TestimonialItem[] = [];
    const col2: TestimonialItem[] = [];
    const col3: TestimonialItem[] = [];

    filteredTestimonials.forEach((item, index) => {
      if (index % 3 === 0) col1.push(item);
      else if (index % 3 === 1) col2.push(item);
      else col3.push(item);
    });

    return [col1, col2, col3];
  };

  const [col1, col2, col3] = getMasonryColumns();

  return (
    <div className="bg-cream font-sans selection:bg-primary/20 selection:text-secondary">
      <SEO 
        title="Host Testimonials & Client Reviews" 
        description="Read reviews from luxury hosts in Mumbai. Read verified feedback from premium Indian wedding families, corporate sponsors, and high-end private celebrations."
        urlPath="/testimonials"
      />
      
      <PageBanner 
        title="Client Testimonials" 
        breadcrumbs={[{ name: 'Testimonials' }]} 
        backgroundImage="https://images.unsplash.com/photo-1555244162-803834f70033?auto=format&fit=crop&w=1600&q=80"
      />

      {/* --- Section 1: Dynamic Statistics (Counters) --- */}
      <section className="py-12 bg-cream -mt-8 relative z-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            <StatCard end={12000} suffix="+" label="Happy Clients" icon={<Heart className="w-5 h-5 fill-primary text-primary" />} />
            <StatCard end={2500} suffix="+" label="Events Catered" icon={<Utensils className="w-5 h-5" />} />
            <StatCard end={4.9} suffix="★" label="Average Rating" icon={<Star className="w-5 h-5 fill-primary text-primary" />} />
            <StatCard end={99} suffix="%" label="Satisfaction" icon={<ThumbsUp className="w-5 h-5" />} />
            <StatCard end={18} suffix="+" label="Years of Heritage" icon={<Award className="w-5 h-5" />} />
            <StatCard end={500} suffix="+" label="Palace Weddings" icon={<Sparkles className="w-5 h-5" />} />
          </div>
        </div>
      </section>

      {/* --- Section 2: Luxury Featured Testimonial Carousel --- */}
      <section className="py-16 sm:py-24 bg-linen border-y border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-xl mx-auto mb-12 sm:mb-16 flex flex-col gap-3">
            <span className="text-primary uppercase tracking-[0.25em] text-xs sm:text-sm font-bold block">
              FEATURED STORY
            </span>
            <h2 className="font-serif text-3xl sm:text-4xl font-bold text-secondary">
              The Grand Banqueting Showcase
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 font-medium">
              A deep-dive look at how our master chefs and banqueting managers design unforgettable gourmet moments.
            </p>
          </div>

          {/* Interactive Carousel wrapper */}
          <div 
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            className="relative bg-white rounded-3xl border border-slate-100 shadow-xl overflow-hidden p-6 sm:p-10 lg:p-16"
          >
            {/* Background elements */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-primary/5 to-transparent rounded-full pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-gradient-to-tr from-secondary/5 to-transparent rounded-full pointer-events-none" />
            
            {/* Main Slide Presentation with Framer Motion slide effects */}
            <div className="min-h-[450px] sm:min-h-[380px] lg:min-h-[320px] flex items-center relative">
              <AnimatePresence mode="wait">
                <motion.div
                  key={carouselIndex}
                  initial={{ opacity: 0, x: 25 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -25 }}
                  transition={{ duration: 0.45, ease: 'easeInOut' }}
                  className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center text-left"
                >
                  {/* Image Column */}
                  <div className="lg:col-span-5 relative group">
                    <div className="relative aspect-square sm:aspect-[4/3] lg:aspect-square w-full rounded-2xl overflow-hidden border-4 border-linen shadow-md">
                      <img 
                        src={featuredTestimonials[carouselIndex].eventImage} 
                        alt={featuredTestimonials[carouselIndex].name}
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                      />
                    </div>
                    {/* Portrait Avatar overlay */}
                    <div className="absolute -bottom-5 -right-5 w-20 h-20 rounded-full border-4 border-white shadow-xl overflow-hidden shrink-0 bg-cream">
                      <img 
                        src={featuredTestimonials[carouselIndex].avatar} 
                        alt={featuredTestimonials[carouselIndex].name}
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="absolute top-4 left-4 bg-secondary/95 backdrop-blur-md text-white text-[10px] sm:text-xs font-bold px-3 py-1 rounded-full shadow-lg border border-white/10 uppercase tracking-widest">
                      {featuredTestimonials[carouselIndex].category}
                    </div>
                  </div>

                  {/* Narrative Text Column */}
                  <div className="lg:col-span-7 flex flex-col justify-center">
                    <Quote className="w-10 h-10 sm:w-14 sm:h-14 text-primary/15 mb-4 fill-current rotate-180 self-start" />
                    
                    {/* Stars */}
                    <div className="flex items-center gap-1 text-primary mb-4">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star key={i} className="w-4.5 h-4.5 fill-primary text-primary" />
                      ))}
                    </div>

                    <p className="font-serif text-base sm:text-xl md:text-2xl italic leading-relaxed text-secondary font-medium mb-6">
                      "{featuredTestimonials[carouselIndex].review}"
                    </p>

                    {/* Metadata line */}
                    <div className="flex items-center gap-3.5 border-t border-slate-100 pt-5">
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-serif text-lg font-bold text-secondary leading-snug">
                            {featuredTestimonials[carouselIndex].name}
                          </h4>
                          <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-700 text-[9px] font-bold px-2 py-0.5 rounded-full border border-emerald-100">
                            <UserCheck className="w-3 h-3 text-emerald-600" />
                            <span>Verified Host</span>
                          </span>
                        </div>
                        <span className="block text-xs text-slate-500 font-sans mt-0.5 font-semibold">
                          {featuredTestimonials[carouselIndex].designation} • <span className="text-primary">{featuredTestimonials[carouselIndex].city}</span>
                        </span>
                        <div className="flex items-center gap-4 text-[11px] text-slate-400 font-bold mt-2">
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3.5 h-3.5" />
                            <span>{featuredTestimonials[carouselIndex].date}</span>
                          </span>
                          <span className="flex items-center gap-1">
                            <MapPin className="w-3.5 h-3.5" />
                            <span>{featuredTestimonials[carouselIndex].eventType}</span>
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Slider Navigation Controls */}
            <div className="flex justify-between items-center mt-8 pt-6 border-t border-slate-100">
              {/* Pagination Dots */}
              <div className="flex gap-2">
                {featuredTestimonials.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => setCarouselIndex(idx)}
                    aria-label={`Go to slide ${idx + 1}`}
                    className={`h-2 rounded-full cursor-pointer transition-all ${carouselIndex === idx ? 'w-8 bg-primary' : 'w-2 bg-slate-200 hover:bg-slate-300'}`}
                  />
                ))}
              </div>

              {/* Arrow Keys */}
              <div className="flex gap-2.5">
                <button
                  onClick={() => setCarouselIndex((prev) => (prev - 1 + featuredTestimonials.length) % featuredTestimonials.length)}
                  className="p-2.5 rounded-full border border-slate-200 text-slate-400 hover:text-primary hover:border-primary hover:bg-primary/5 transition-all cursor-pointer active:scale-95"
                  aria-label="Previous testimonial"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <button
                  onClick={() => setCarouselIndex((prev) => (prev + 1) % featuredTestimonials.length)}
                  className="p-2.5 rounded-full border border-slate-200 text-slate-400 hover:text-primary hover:border-primary hover:bg-primary/5 transition-all cursor-pointer active:scale-95"
                  aria-label="Next testimonial"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            </div>

          </div>

        </div>
      </section>

      {/* --- Section 3: Interactive Filterable Masonry Testimonials Grid --- */}
      <section className="py-20 bg-cream">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-xl mx-auto mb-12 flex flex-col gap-3">
            <span className="text-primary uppercase tracking-[0.25em] text-xs sm:text-sm font-bold block">
              CELEBRATED FEEDBACK
            </span>
            <h2 className="font-serif text-3xl sm:text-4xl font-bold text-secondary">
              Guest Diaries & Memories
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 font-medium">
              Filter through real host feedback from multiple celebration configurations across Western India.
            </p>
          </div>

          {/* Interactive Filter Chips */}
          <div className="flex flex-wrap justify-center gap-2 mb-12 max-w-3xl mx-auto">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-4 py-2 text-xs sm:text-sm font-bold rounded-full transition-all cursor-pointer ${
                  activeCategory === cat 
                    ? 'bg-secondary text-white shadow-md scale-105' 
                    : 'bg-white text-slate-600 hover:text-secondary border border-slate-100 hover:bg-slate-50 shadow-sm'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Staggered Masonry Grid with Framer Motion AnimatePresence */}
          <div className="relative">
            {filteredTestimonials.length === 0 ? (
              <div className="text-center py-16 bg-linen rounded-3xl border border-dashed border-slate-200">
                <p className="font-serif text-lg text-slate-500 italic">No testimonials available for this category yet.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 items-start text-left">
                {/* Column 1 */}
                <div className="space-y-6">
                  {col1.map((test) => (
                    <MasonryCard 
                      key={test.id} 
                      test={test} 
                      isExpanded={!!expandedReviews[test.id]}
                      onToggle={() => toggleReviewExpand(test.id)}
                    />
                  ))}
                </div>

                {/* Column 2 */}
                <div className="space-y-6">
                  {col2.map((test) => (
                    <MasonryCard 
                      key={test.id} 
                      test={test} 
                      isExpanded={!!expandedReviews[test.id]}
                      onToggle={() => toggleReviewExpand(test.id)}
                    />
                  ))}
                </div>

                {/* Column 3 */}
                <div className="space-y-6">
                  {col3.map((test) => (
                    <MasonryCard 
                      key={test.id} 
                      test={test} 
                      isExpanded={!!expandedReviews[test.id]}
                      onToggle={() => toggleReviewExpand(test.id)}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>

        </div>
      </section>

      {/* --- Section 4: Video Testimonials Lightbox Row --- */}
      <section className="py-16 sm:py-20 bg-linen border-y border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-xl mx-auto mb-12 sm:mb-16 flex flex-col gap-3">
            <span className="text-primary uppercase tracking-[0.25em] text-xs sm:text-sm font-bold block">
              CINEMATIC MEMORIES
            </span>
            <h2 className="font-serif text-3xl sm:text-4xl font-bold text-secondary">
              Video Testimonials
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 font-medium">
              Step inside real celebration banquets and witness guests enjoying live interactive food stations.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {videoTestimonials.map((v) => (
              <div 
                key={v.id}
                className="bg-white rounded-3xl overflow-hidden border border-slate-100 shadow-md group hover:shadow-xl transition-all flex flex-col h-full text-left cursor-pointer"
                onClick={() => {
                  setSelectedVideo(v);
                  setVideoModalOpen(true);
                }}
              >
                {/* Thumbnail container */}
                <div className="relative aspect-video w-full overflow-hidden bg-slate-900">
                  <img 
                    src={v.thumbnail} 
                    alt={v.name}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                  />
                  {/* Overlay gradient */}
                  <div className="absolute inset-0 bg-black/35 group-hover:bg-black/45 transition-colors" />

                  {/* Play trigger button */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-14 h-14 rounded-full bg-primary text-white flex items-center justify-center shadow-lg border-2 border-white group-hover:scale-110 transition-transform">
                      <Play className="w-6 h-6 fill-white ml-1 text-white" />
                    </div>
                  </div>

                  {/* Video Duration */}
                  <span className="absolute bottom-3 right-3 bg-black/75 text-white text-[10px] font-mono px-2 py-0.5 rounded font-bold">
                    {v.duration}
                  </span>
                </div>

                {/* Info and quote content */}
                <div className="p-6 flex flex-col flex-grow justify-between">
                  <p className="font-serif text-sm italic leading-relaxed text-secondary mb-5">
                    {v.reviewSnippet}
                  </p>

                  <div className="border-t border-slate-100 pt-4 mt-auto">
                    <h4 className="font-serif text-base font-bold text-secondary">{v.name}</h4>
                    <span className="text-[11px] font-bold text-primary block mt-0.5 uppercase tracking-wide">
                      {v.eventType} • <span className="text-slate-500">{v.city}</span>
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* --- Section 5: Overall Google Reviews Summary --- */}
      <section className="py-16 bg-cream text-left">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-3xl border border-slate-100 p-8 sm:p-12 shadow-md flex flex-col lg:flex-row items-center gap-8 justify-between">
            
            {/* Rating side */}
            <div className="flex flex-col sm:flex-row items-center gap-6 text-center sm:text-left">
              {/* Massive Badge */}
              <div className="w-24 h-24 rounded-3xl bg-secondary text-primary flex flex-col items-center justify-center border-2 border-primary/20 shadow-lg">
                <span className="font-serif text-3xl font-black text-white leading-none">4.9</span>
                <span className="text-[10px] text-primary font-bold uppercase tracking-wider mt-1">out of 5</span>
              </div>
              <div>
                <div className="flex items-center gap-1.5 justify-center sm:justify-start">
                  <img 
                    src="https://upload.wikimedia.org/wikipedia/commons/c/c1/Google_%22G%22_logo.svg" 
                    alt="Google G" 
                    className="w-5 h-5 shrink-0"
                  />
                  <span className="font-sans text-sm font-extrabold text-slate-800 tracking-tight">Google Business Reviews</span>
                </div>
                <div className="flex items-center gap-1 text-primary my-2.5 justify-center sm:justify-start">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} className="w-5 h-5 fill-primary text-primary" />
                  ))}
                  <span className="text-xs text-slate-400 font-bold ml-1">4.9 Average Rating</span>
                </div>
                <p className="text-xs sm:text-sm text-slate-500 font-bold leading-relaxed">
                  Based on <span className="text-secondary font-black">940+ verified host reviews</span> with a 99.4% recommendation rate.
                </p>
              </div>
            </div>

            {/* CTA action column */}
            <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
              <a 
                href="#submit-review"
                className="px-6 py-3.5 bg-secondary hover:bg-slate-800 text-white font-bold text-center rounded-2xl shadow-md transition-all text-xs sm:text-sm cursor-pointer"
              >
                Write Guest Review
              </a>
              <button 
                onClick={() => alert('Redirecting to Google Business profile listing. You can leave a review there!')}
                className="px-6 py-3.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold text-center rounded-2xl shadow-sm transition-all text-xs sm:text-sm cursor-pointer flex items-center justify-center gap-2"
              >
                <span>View Google Business Reviews</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>

          </div>
        </div>
      </section>

      {/* --- Section 6: Success Stories Timeline --- */}
      <section className="py-20 bg-linen border-t border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-xl mx-auto mb-16 flex flex-col gap-3">
            <span className="text-primary uppercase tracking-[0.25em] text-xs sm:text-sm font-bold block">
              SERVICE TIMELINE
            </span>
            <h2 className="font-serif text-3xl sm:text-4xl font-bold text-secondary">
              The Path to a Perfect Feast
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 font-medium">
              We coordinate our culinary and logistical timelines meticulously to construct a flawless celebratory banquet.
            </p>
          </div>

          {/* Timeline steps */}
          <div className="relative max-w-4xl mx-auto">
            {/* Vertical connector line */}
            <div className="absolute left-6 md:left-1/2 top-10 bottom-10 w-0.5 bg-primary/20 -translate-x-1/2 pointer-events-none" />

            {/* Step 1 */}
            <div className="relative flex flex-col md:flex-row items-start md:items-center gap-8 mb-12">
              <div className="w-12 h-12 rounded-2xl bg-secondary text-primary flex items-center justify-center shadow-lg shrink-0 z-10 md:absolute md:left-1/2 md:-translate-x-1/2 border border-primary/25">
                <MessageSquare className="w-5 h-5 text-white" />
              </div>
              <div className="w-full md:w-[45%] md:text-right pr-0 md:pr-12 text-left pl-14 md:pl-0">
                <span className="text-primary font-bold text-xs uppercase tracking-widest">Phase 01</span>
                <h4 className="font-serif text-lg font-bold text-secondary mt-1">Gourmet Curation Inquiry</h4>
                <p className="text-xs sm:text-sm text-slate-500 mt-2 font-semibold leading-relaxed">
                  Submit wedding dates, venues, and approximate guest tallies. Our dedicated coordinators consult to map out specific regional dietary cuisines.
                </p>
              </div>
              <div className="hidden md:block w-[45%] pl-12" />
            </div>

            {/* Step 2 */}
            <div className="relative flex flex-col md:flex-row items-start md:items-center gap-8 mb-12">
              <div className="w-12 h-12 rounded-2xl bg-primary text-secondary flex items-center justify-center shadow-lg shrink-0 z-10 md:absolute md:left-1/2 md:-translate-x-1/2 border border-white">
                <Utensils className="w-5 h-5 text-white" />
              </div>
              <div className="hidden md:block w-[45%] pr-12" />
              <div className="w-full md:w-[45%] text-left pl-14 md:pl-12">
                <span className="text-primary font-bold text-xs uppercase tracking-widest">Phase 02</span>
                <h4 className="font-serif text-lg font-bold text-secondary mt-1">Private Menu Tasting</h4>
                <p className="text-xs sm:text-sm text-slate-500 mt-2 font-semibold leading-relaxed">
                  Join our master culinary team in our development kitchen for a private menu tasting session to calibrate spice balances and pick visual platting.
                </p>
              </div>
            </div>

            {/* Step 3 */}
            <div className="relative flex flex-col md:flex-row items-start md:items-center gap-8 mb-12">
              <div className="w-12 h-12 rounded-2xl bg-secondary text-primary flex items-center justify-center shadow-lg shrink-0 z-10 md:absolute md:left-1/2 md:-translate-x-1/2 border border-primary/25">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <div className="w-full md:w-[45%] md:text-right pr-0 md:pr-12 text-left pl-14 md:pl-0">
                <span className="text-primary font-bold text-xs uppercase tracking-widest">Phase 03</span>
                <h4 className="font-serif text-lg font-bold text-secondary mt-1">Royal Setup & Execution</h4>
                <p className="text-xs sm:text-sm text-slate-500 mt-2 font-semibold leading-relaxed">
                  Our banquet team arrives hours before to establish brass chafing pots, clean burner lines, build fresh custom flower details, and set up live tables.
                </p>
              </div>
              <div className="hidden md:block w-[45%] pl-12" />
            </div>

            {/* Step 4 */}
            <div className="relative flex flex-col md:flex-row items-start md:items-center gap-8">
              <div className="w-12 h-12 rounded-2xl bg-primary text-secondary flex items-center justify-center shadow-lg shrink-0 z-10 md:absolute md:left-1/2 md:-translate-x-1/2 border border-white">
                <Heart className="w-5 h-5 text-white fill-white" />
              </div>
              <div className="hidden md:block w-[45%] pr-12" />
              <div className="w-full md:w-[45%] text-left pl-14 md:pl-12">
                <span className="text-primary font-bold text-xs uppercase tracking-widest">Phase 04</span>
                <h4 className="font-serif text-lg font-bold text-secondary mt-1">The Celebration & Review</h4>
                <p className="text-xs sm:text-sm text-slate-500 mt-2 font-semibold leading-relaxed">
                  Guests experience pristine, warm hospitality. Post-banquet, we gather client feedback to ensure our kitchen squad receives recognition.
                </p>
              </div>
            </div>

          </div>

        </div>
      </section>

      {/* --- Section 7: Customer Photo Gallery (Lightbox) --- */}
      <section className="py-20 bg-cream border-t border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-xl mx-auto mb-12 flex flex-col gap-3">
            <span className="text-primary uppercase tracking-[0.25em] text-xs sm:text-sm font-bold block">
              VISUAL FEAST
            </span>
            <h2 className="font-serif text-3xl sm:text-4xl font-bold text-secondary">
              Gourmet Layout Gallery
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 font-medium">
              Click on any photograph to inspect our hand-hammered copper setups and live active food stations.
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6">
            {galleryItems.map((item, idx) => (
              <div 
                key={item.id}
                onClick={() => {
                  setSelectedImageIndex(idx);
                  setImageModalOpen(true);
                }}
                className="relative aspect-[4/3] rounded-2xl overflow-hidden shadow-sm hover:shadow-lg group cursor-zoom-in border border-slate-100"
              >
                <img 
                  src={item.url} 
                  alt={item.title}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                />
                {/* Overlay details */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-4 text-left">
                  <span className="text-[9px] font-bold text-primary tracking-widest uppercase mb-1">
                    {item.category}
                  </span>
                  <h4 className="font-serif text-white text-sm sm:text-base font-bold leading-tight flex items-center gap-1">
                    <span>{item.title}</span>
                    <Maximize2 className="w-3.5 h-3.5" />
                  </h4>
                </div>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* --- Section 8: Awards & Recognition --- */}
      <section className="py-16 bg-linen border-y border-slate-100 text-center">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-xl mx-auto mb-12 flex flex-col gap-2">
            <span className="text-primary uppercase tracking-[0.25em] text-xs sm:text-sm font-bold block">
              HERITAGE STANDARD
            </span>
            <h2 className="font-serif text-2xl sm:text-3xl font-bold text-secondary">
              Awards & Recognitions
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Award 1 */}
            <div className="bg-white rounded-2xl p-6 border border-slate-150/50 flex flex-col items-center">
              <div className="w-16 h-16 rounded-full bg-amber-50 border border-amber-200 text-amber-600 flex items-center justify-center mb-4">
                <Award className="w-8 h-8" />
              </div>
              <h4 className="font-serif text-lg font-bold text-secondary">Times Hospitality Award</h4>
              <p className="text-xs text-slate-400 font-bold mt-1 uppercase tracking-wider">Best Wedding Catering</p>
              <p className="text-xs text-slate-500 font-semibold mt-3 max-w-[200px] leading-relaxed">
                Awarded for outstanding standard execution and gourmet curation in luxury destination events.
              </p>
            </div>

            {/* Award 2 */}
            <div className="bg-white rounded-2xl p-6 border border-slate-150/50 flex flex-col items-center">
              <div className="w-16 h-16 rounded-full bg-amber-50 border border-amber-200 text-amber-600 flex items-center justify-center mb-4">
                <Star className="w-8 h-8 fill-amber-50" />
              </div>
              <h4 className="font-serif text-lg font-bold text-secondary">Customer Choice Winner</h4>
              <p className="text-xs text-slate-400 font-bold mt-1 uppercase tracking-wider">99% Recommendation</p>
              <p className="text-xs text-slate-500 font-semibold mt-3 max-w-[200px] leading-relaxed">
                Voted as the top boutique caterer in Mumbai and Pune by verified host families.
              </p>
            </div>

            {/* Award 3 */}
            <div className="bg-white rounded-2xl p-6 border border-slate-150/50 flex flex-col items-center">
              <div className="w-16 h-16 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-600 flex items-center justify-center mb-4">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h4 className="font-serif text-lg font-bold text-secondary">A+ Grade Sanitization</h4>
              <p className="text-xs text-slate-400 font-bold mt-1 uppercase tracking-wider">ISO 22000 Certified</p>
              <p className="text-xs text-slate-500 font-semibold mt-3 max-w-[200px] leading-relaxed">
                Recognized for pristine kitchen hygiene, temperature checks, and safe culinary processes.
              </p>
            </div>

            {/* Award 4 */}
            <div className="bg-white rounded-2xl p-6 border border-slate-150/50 flex flex-col items-center">
              <div className="w-16 h-16 rounded-full bg-amber-50 border border-amber-200 text-amber-600 flex items-center justify-center mb-4">
                <Sparkles className="w-8 h-8" />
              </div>
              <h4 className="font-serif text-lg font-bold text-secondary">Sangeet Lounge Innovator</h4>
              <p className="text-xs text-slate-400 font-bold mt-1 uppercase tracking-wider">Best Live Stations</p>
              <p className="text-xs text-slate-500 font-semibold mt-3 max-w-[200px] leading-relaxed">
                Celebrated for crafting high-energy live culinary stations that bring drama and taste together.
              </p>
            </div>
          </div>

        </div>
      </section>

      {/* --- Section 9: Interactive Write Guest Review Form --- */}
      <section id="submit-review" className="py-20 bg-cream text-left">
        <div className="max-w-3xl mx-auto px-4 sm:px-6">
          <div className="bg-white rounded-3xl border border-slate-100 p-6 sm:p-10 shadow-xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full pointer-events-none" />
            
            <div className="flex flex-col items-center text-center mb-8">
              <div className="w-12 h-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mb-3">
                <Send className="w-6 h-6" />
              </div>
              <h3 className="font-serif text-2xl sm:text-3xl font-bold text-secondary">
                Submit Your Feast Review
              </h3>
              <p className="text-xs text-slate-500 font-bold font-sans mt-1 max-w-[320px]">
                Your feedback directly impacts the rewards and training of our kitchen staff and on-ground hospitality group.
              </p>
            </div>

            {reviewSubmitSuccess && (
              <div className="mb-6 p-4 bg-emerald-50 border border-emerald-100 rounded-2xl text-xs sm:text-sm font-bold text-emerald-700 flex items-start gap-2.5">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-bold text-emerald-800">Review Submitted Successfully!</h4>
                  <p className="font-semibold text-[11px] text-emerald-600 mt-1 leading-normal">
                    Thank you! Your feedback has been safely logged in our local storage system. Our culinary team celebrates every verified review.
                  </p>
                </div>
              </div>
            )}

            <form onSubmit={handleSubmitReview} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Name */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500">Your Full Name</label>
                  <input 
                    type="text" 
                    required
                    value={writeReviewName}
                    onChange={(e) => setWriteReviewName(e.target.value)}
                    placeholder="e.g. Ramesh Chandra"
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:border-primary text-secondary font-semibold placeholder-slate-400 text-xs sm:text-sm"
                  />
                </div>
                {/* Email */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500">Email Address (for verification)</label>
                  <input 
                    type="email" 
                    required
                    value={writeReviewEmail}
                    onChange={(e) => setWriteReviewEmail(e.target.value)}
                    placeholder="e.g. ramesh@gmail.com"
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:border-primary text-secondary font-semibold placeholder-slate-400 text-xs sm:text-sm"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {/* City */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500">City Location</label>
                  <input 
                    type="text" 
                    required
                    value={writeReviewCity}
                    onChange={(e) => setWriteReviewCity(e.target.value)}
                    placeholder="e.g. Mumbai"
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:border-primary text-secondary font-semibold placeholder-slate-400 text-xs sm:text-sm"
                  />
                </div>
                {/* Event Type Category */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500">Event Configuration</label>
                  <select 
                    value={writeReviewType}
                    onChange={(e) => setWriteReviewType(e.target.value)}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:border-primary text-secondary font-semibold text-xs sm:text-sm cursor-pointer"
                  >
                    <option value="Weddings">Royal Wedding</option>
                    <option value="Corporate Events">Corporate Gala</option>
                    <option value="Birthday Parties">Birthday Celebration</option>
                    <option value="Anniversary Celebrations">Anniversary Sangeet</option>
                    <option value="Housewarming">Griha Pravesh</option>
                    <option value="Festival Catering">Festival Prasad</option>
                    <option value="Reception Events">Reception Buffet</option>
                  </select>
                </div>
                {/* Star rating */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500">Rating Stars</label>
                  <div className="flex items-center gap-1.5 py-2.5 px-3 bg-slate-50 border border-slate-200 rounded-2xl">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <button
                        type="button"
                        key={i}
                        onClick={() => setWriteReviewRating(i + 1)}
                        className="text-primary hover:scale-110 transition-transform cursor-pointer"
                      >
                        <Star className={`w-5 h-5 ${writeReviewRating > i ? 'fill-primary text-primary' : 'text-slate-300'}`} />
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Feedback text */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500">Your Gourmet Experience</label>
                <textarea 
                  required
                  rows={4}
                  value={writeReviewFeedback}
                  onChange={(e) => setWriteReviewFeedback(e.target.value)}
                  placeholder="Share details about our live food stations, signature dishes, sanitization, and team hospitality..."
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:border-primary text-secondary font-semibold placeholder-slate-400 text-xs sm:text-sm leading-relaxed"
                ></textarea>
              </div>

              <button
                type="submit"
                disabled={isSubmittingReview}
                className="w-full py-4 bg-secondary text-white font-bold rounded-2xl shadow-md hover:bg-slate-800 transition-all flex items-center justify-center gap-2 cursor-pointer text-xs sm:text-sm"
              >
                {isSubmittingReview ? (
                  <>
                    <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    <span>Submitting review...</span>
                  </>
                ) : (
                  <>
                    <span>Submit Verified Review</span>
                    <ArrowRight className="w-4.5 h-4.5" />
                  </>
                )}
              </button>
            </form>

          </div>
        </div>
      </section>

      {/* --- Section 10: Compelling Premium CTA --- */}
      <section className="bg-secondary text-white py-20 relative overflow-hidden text-center">
        {/* Background Accent Lines */}
        <div className="absolute inset-y-0 left-0 w-48 bg-gradient-to-r from-primary/10 to-transparent pointer-events-none" />
        <div className="absolute inset-y-0 right-0 w-48 bg-gradient-to-l from-primary/10 to-transparent pointer-events-none" />
        <div className="absolute bottom-[-100px] left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-primary/5 rounded-full blur-[120px] pointer-events-none" />

        <div className="relative max-w-4xl mx-auto px-4 flex flex-col gap-5 items-center">
          <div className="w-14 h-14 rounded-full bg-primary/20 flex items-center justify-center text-primary border border-primary/20 shadow-lg">
            <Heart className="w-6 h-6 fill-primary text-primary" />
          </div>
          <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-white max-w-xl">
            Ready to Make Your Celebration Memorable?
          </h2>
          <p className="font-sans text-slate-300 text-sm max-w-md font-semibold leading-relaxed">
            Let our royal culinary squads construct a breathtaking traditional buffet experience for your upcoming milestone.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 mt-4 w-full sm:w-auto justify-center">
            <Link 
              to="/packages"
              className="px-8 py-4 bg-primary hover:bg-primary-hover text-white font-extrabold text-xs sm:text-sm rounded-2xl shadow-md transition-all uppercase tracking-wider cursor-pointer"
            >
              Book Catering Package
            </Link>
            <Link 
              to="/contact"
              className="px-8 py-4 bg-white/15 hover:bg-white/20 text-white font-extrabold text-xs sm:text-sm rounded-2xl shadow-sm transition-all border border-white/10 uppercase tracking-wider cursor-pointer"
            >
              Contact Coordinators
            </Link>
          </div>
        </div>
      </section>

      {/* --- Lightbox Modals --- */}
      <VideoModal 
        isOpen={videoModalOpen} 
        onClose={() => { setVideoModalOpen(false); setSelectedVideo(null); }} 
        video={selectedVideo}
      />

      <ImageModal 
        isOpen={imageModalOpen}
        onClose={() => { setImageModalOpen(false); setSelectedImageIndex(-1); }}
        imageIndex={selectedImageIndex}
        images={galleryItems}
        onPrev={() => setSelectedImageIndex((prev) => (prev - 1 + galleryItems.length) % galleryItems.length)}
        onNext={() => setSelectedImageIndex((prev) => (prev + 1) % galleryItems.length)}
      />
    </div>
  );
}

// --- Masonry Testimonial Card Component ---
interface MasonryCardProps {
  key?: string;
  test: TestimonialItem;
  isExpanded: boolean;
  onToggle: () => void;
}

function MasonryCard({ test, isExpanded, onToggle }: MasonryCardProps) {
  // Let's check length of the review text to determine if we should show a read more button
  const isLongReview = test.review.length > 130;
  const displayedReview = isLongReview && !isExpanded 
    ? `${test.review.substring(0, 130)}...` 
    : test.review;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.3 }}
      className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-100 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between text-left relative group"
    >
      {/* Quotation Mark accent */}
      <div className="absolute top-5 right-6 text-primary/5 group-hover:text-primary/10 transition-colors pointer-events-none">
        <Quote className="w-12 h-12 fill-current rotate-180" />
      </div>

      <div>
        {/* Rating and category */}
        <div className="flex justify-between items-start mb-4">
          <div className="flex items-center gap-1 text-primary">
            {Array.from({ length: 5 }).map((_, idx) => (
              <Star 
                key={idx} 
                className={`w-3.5 h-3.5 ${test.rating >= idx + 1 ? 'fill-primary text-primary' : 'text-slate-200'}`} 
              />
            ))}
          </div>
          <span className="text-[10px] bg-linen text-primary font-bold px-2 py-0.5 rounded-full border border-primary/10 uppercase tracking-widest">
            {test.category}
          </span>
        </div>

        {/* Story details */}
        <p className="font-serif text-[14px] sm:text-base leading-relaxed text-secondary font-medium italic mb-4">
          "{displayedReview}"
        </p>

        {isLongReview && (
          <button
            onClick={onToggle}
            className="text-xs font-bold text-primary hover:text-primary-hover flex items-center gap-1 mb-4 cursor-pointer"
          >
            <span>{isExpanded ? 'Show Less' : 'Read More'}</span>
            {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>
        )}
      </div>

      {/* Guest Line */}
      <div className="flex items-center gap-3 border-t border-slate-50 pt-4 mt-2">
        <div className="w-10 h-10 rounded-full overflow-hidden shrink-0 border-2 border-primary/20 bg-slate-50">
          <img 
            src={test.avatar} 
            alt={test.name}
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover"
          />
        </div>
        <div>
          <div className="flex items-center gap-1.5">
            <h4 className="font-serif text-sm font-bold text-secondary leading-snug">
              {test.name}
            </h4>
            <span className="inline-flex text-emerald-600 bg-emerald-50 rounded-full p-0.5 border border-emerald-100" title="Verified Guest Review">
              <ShieldCheck className="w-3.5 h-3.5" />
            </span>
          </div>
          <span className="block text-[10px] text-slate-400 font-bold tracking-tight uppercase mt-0.5">
            {test.city} • {test.designation}
          </span>
        </div>
      </div>
    </motion.div>
  );
}
