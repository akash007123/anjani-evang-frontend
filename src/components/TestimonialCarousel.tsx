import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence, Variants } from 'motion/react';
import { Star, ChevronLeft, ChevronRight, Quote } from 'lucide-react';

interface Testimonial {
  id: string | number;
  name: string;
  role: string;
  company?: string;
  eventType: string;
  feedback: string;
  rating: number;
  image: string;
}

interface TestimonialCarouselProps {
  testimonials: Testimonial[];
  autoplayInterval?: number;
}

const slideVariants: Variants = {
  enter: (direction: number) => ({
    x: direction > 0 ? 160 : -160,
    opacity: 0,
    scale: 0.96,
  }),
  center: {
    x: 0,
    opacity: 1,
    scale: 1,
    transition: {
      x: { type: "spring", stiffness: 220, damping: 25 },
      opacity: { duration: 0.4 },
      scale: { duration: 0.4, ease: "easeOut" },
    },
  },
  exit: (direction: number) => ({
    x: direction < 0 ? 160 : -160,
    opacity: 0,
    scale: 0.96,
    transition: {
      x: { type: "spring", stiffness: 220, damping: 25 },
      opacity: { duration: 0.3 },
      scale: { duration: 0.3, ease: "easeIn" },
    },
  }),
};

export default function TestimonialCarousel({
  testimonials,
  autoplayInterval = 6000,
}: TestimonialCarouselProps) {
  const [[page, direction], setPage] = useState<[number, number]>([0, 0]);
  const [isHovered, setIsHovered] = useState(false);
  const autoplayTimer = useRef<NodeJS.Timeout | null>(null);

  const activeIndex = (page % testimonials.length + testimonials.length) % testimonials.length;

  const handleNext = () => {
    setPage([page + 1, 1]);
  };

  const handlePrev = () => {
    setPage([page - 1, -1]);
  };

  const handleDotClick = (index: number) => {
    const dir = index > activeIndex ? 1 : -1;
    setPage([index, dir]);
  };

  // Drag hander to allow swiping to change slide
  const handleDragEnd = (event: any, info: any) => {
    const swipeThreshold = 50;
    if (info.offset.x < -swipeThreshold) {
      handleNext();
    } else if (info.offset.x > swipeThreshold) {
      handlePrev();
    }
  };

  // Reset/Start autoplay timer
  useEffect(() => {
    if (isHovered) {
      if (autoplayTimer.current) clearInterval(autoplayTimer.current);
      return;
    }

    autoplayTimer.current = setInterval(() => {
      handleNext();
    }, autoplayInterval);

    return () => {
      if (autoplayTimer.current) {
        clearInterval(autoplayTimer.current);
      }
    };
  }, [page, isHovered, autoplayInterval]);

  if (!testimonials || testimonials.length === 0) return null;

  const currentTestimonial = testimonials[activeIndex];

  return (
    <div
      id="testimonial-carousel-container"
      className="w-full max-w-4xl mx-auto px-4 sm:px-6 relative flex flex-col items-center"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Decorative Quote Symbol */}
      <div className="absolute -top-6 left-12 text-primary/10 select-none pointer-events-none hidden sm:block">
        <Quote className="w-24 h-24 rotate-180" />
      </div>

      {/* Slide window stage */}
      <div className="relative w-full overflow-hidden min-h-[300px] sm:min-h-[260px] flex items-center justify-center py-6">
        <AnimatePresence initial={false} custom={direction} mode="wait">
          <motion.div
            key={page}
            custom={direction}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            drag="x"
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={0.4}
            onDragEnd={handleDragEnd}
            className="w-full flex flex-col gap-6 items-center text-center cursor-grab active:cursor-grabbing select-none pointer-events-auto"
          >
            {/* Elegant Stars Block */}
            <div className="flex items-center gap-1 text-primary">
              {Array.from({ length: currentTestimonial.rating }).map((_, i) => (
                <Star key={i} className="w-5 h-5 fill-primary text-primary" />
              ))}
            </div>

            {/* Quote/Feedback text */}
            <p className="font-serif text-lg sm:text-2xl italic leading-relaxed text-white/90 max-w-2xl px-2 sm:px-8">
              "{currentTestimonial.feedback}"
            </p>

            {/* Author Profile section */}
            <div className="flex items-center gap-4 mt-2">
              <div className="w-14 h-14 rounded-full overflow-hidden border-2 border-primary shrink-0 bg-slate-800 shadow-md">
                <img
                  src={currentTestimonial.image}
                  alt={currentTestimonial.name}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="text-left">
                <h4 className="font-serif text-base sm:text-lg font-bold text-white leading-snug">
                  {currentTestimonial.name}
                </h4>
                <span className="block text-xs text-white/60 font-sans font-medium">
                  {currentTestimonial.role} {currentTestimonial.company ? `• ${currentTestimonial.company}` : ''} ({currentTestimonial.eventType})
                </span>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Control Dots & Arrows Container */}
      <div className="flex items-center justify-center gap-6 mt-8 z-10 w-full">
        {/* Left Control Arrow */}
        <button
          onClick={handlePrev}
          className="p-3 rounded-full bg-white/5 hover:bg-primary hover:text-secondary border border-white/10 text-white transition-all hover:scale-105 active:scale-95 focus:outline-none cursor-pointer"
          aria-label="Previous Testimonial"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>

        {/* Dynamic Dot Indicators */}
        <div className="flex items-center gap-2">
          {testimonials.map((_, i) => (
            <button
              key={i}
              onClick={() => handleDotClick(i)}
              className={`h-2 rounded-full transition-all duration-300 focus:outline-none cursor-pointer ${
                activeIndex === i 
                  ? 'bg-primary w-6 shadow-sm shadow-primary/20' 
                  : 'bg-white/25 hover:bg-white/40 w-2'
              }`}
              aria-label={`Go to testimonial slide ${i + 1}`}
            />
          ))}
        </div>

        {/* Right Control Arrow */}
        <button
          onClick={handleNext}
          className="p-3 rounded-full bg-white/5 hover:bg-primary hover:text-secondary border border-white/10 text-white transition-all hover:scale-105 active:scale-95 focus:outline-none cursor-pointer"
          aria-label="Next Testimonial"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
