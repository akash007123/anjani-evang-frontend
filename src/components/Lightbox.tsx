import { useEffect, useState, useCallback } from 'react';
import { X, ChevronLeft, ChevronRight, ZoomIn, ZoomOut, RotateCw } from 'lucide-react';

interface LightboxProps {
  images: string[];
  initialIndex: number;
  isOpen: boolean;
  onClose: () => void;
  title?: string;
}

export default function Lightbox({
  images,
  initialIndex,
  isOpen,
  onClose,
  title = "Event Showcase"
}: LightboxProps) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [zoomScale, setZoomScale] = useState(1);
  const [rotation, setRotation] = useState(0);

  // Sync state with prop if it changes
  useEffect(() => {
    setCurrentIndex(initialIndex);
    setZoomScale(1);
    setRotation(0);
  }, [initialIndex, isOpen]);

  const handleNext = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % images.length);
    setZoomScale(1);
    setRotation(0);
  }, [images.length]);

  const handlePrev = useCallback(() => {
    setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
    setZoomScale(1);
    setRotation(0);
  }, [images.length]);

  const handleZoomIn = () => {
    setZoomScale((prev) => Math.min(prev + 0.5, 3));
  };

  const handleZoomOut = () => {
    setZoomScale((prev) => Math.max(prev - 0.5, 1));
  };

  const handleRotate = () => {
    setRotation((prev) => (prev + 90) % 360);
  };

  // Keyboard navigation
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      } else if (e.key === 'ArrowRight') {
        handleNext();
      } else if (e.key === 'ArrowLeft') {
        handlePrev();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    // Prevent background scrolling while lightbox is active
    document.body.style.overflow = 'hidden';

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [isOpen, onClose, handleNext, handlePrev]);

  if (!isOpen) return null;

  return (
    <div
      id="lightbox-container"
      className="fixed inset-0 z-50 flex flex-col justify-between bg-black/95 backdrop-blur-md transition-opacity duration-300 animate-in fade-in select-none"
      onClick={onClose}
    >
      {/* Top Bar Controls */}
      <div 
        className="w-full bg-gradient-to-b from-black/80 to-transparent p-4 sm:p-6 flex items-center justify-between z-10"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="text-left">
          <span className="font-serif text-sm sm:text-base font-bold text-primary tracking-wide block">
            {title}
          </span>
          <span className="font-sans text-[10px] sm:text-xs text-slate-400 font-semibold tracking-wider uppercase mt-0.5 block">
            Image {currentIndex + 1} of {images.length}
          </span>
        </div>

        {/* Toolbar */}
        <div className="flex items-center gap-2 sm:gap-4">
          <button
            onClick={handleZoomOut}
            disabled={zoomScale <= 1}
            className="p-2 text-white/70 hover:text-white disabled:opacity-40 hover:bg-white/10 rounded-full transition-all cursor-pointer"
            title="Zoom Out"
          >
            <ZoomOut className="w-5 h-5" />
          </button>
          <button
            onClick={handleZoomIn}
            disabled={zoomScale >= 3}
            className="p-2 text-white/70 hover:text-white disabled:opacity-40 hover:bg-white/10 rounded-full transition-all cursor-pointer"
            title="Zoom In"
          >
            <ZoomIn className="w-5 h-5" />
          </button>
          <button
            onClick={handleRotate}
            className="p-2 text-white/70 hover:text-white hover:bg-white/10 rounded-full transition-all cursor-pointer"
            title="Rotate Image"
          >
            <RotateCw className="w-4 h-4" />
          </button>
          <div className="h-6 w-[1px] bg-white/20 mx-1 sm:mx-2" />
          <button
            onClick={onClose}
            className="p-2 text-white/80 hover:text-white hover:bg-red-500/20 hover:text-red-400 rounded-full transition-all cursor-pointer"
            title="Close Lightbox"
          >
            <X className="w-6 h-6" />
          </button>
        </div>
      </div>

      {/* Main Image View Area */}
      <div className="relative flex-grow w-full flex items-center justify-center p-4">
        {/* Previous Button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            handlePrev();
          }}
          className="absolute left-4 sm:left-8 z-20 p-3 rounded-full bg-white/5 border border-white/10 hover:bg-white/20 text-white/80 hover:text-white hover:scale-105 active:scale-95 transition-all cursor-pointer focus:outline-none"
          aria-label="Previous image"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>

        {/* Scaled/Rotated Image Stage */}
        <div 
          className="relative max-w-full max-h-[70vh] sm:max-h-[75vh] flex items-center justify-center overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          <img
            src={images[currentIndex]}
            alt={`Showcase item ${currentIndex + 1}`}
            referrerPolicy="no-referrer"
            style={{
              transform: `scale(${zoomScale}) rotate(${rotation}deg)`,
              transition: zoomScale === 1 && rotation === 0 ? 'transform 0.3s cubic-bezier(0.16, 1, 0.3, 1)' : 'transform 0.1s ease-out'
            }}
            className="max-w-full max-h-[70vh] sm:max-h-[75vh] object-contain rounded-lg shadow-2xl pointer-events-none select-none transition-transform duration-300"
          />
        </div>

        {/* Next Button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            handleNext();
          }}
          className="absolute right-4 sm:right-8 z-20 p-3 rounded-full bg-white/5 border border-white/10 hover:bg-white/20 text-white/80 hover:text-white hover:scale-105 active:scale-95 transition-all cursor-pointer focus:outline-none"
          aria-label="Next image"
        >
          <ChevronRight className="w-6 h-6" />
        </button>
      </div>

      {/* Bottom Thumbnails Navigation Panel */}
      <div 
        className="w-full bg-gradient-to-t from-black/90 to-transparent p-6 flex flex-col items-center gap-4 z-10"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-2 sm:gap-3 overflow-x-auto max-w-full px-4 py-2 scrollbar-none">
          {images.map((img, idx) => (
            <button
              key={idx}
              onClick={() => {
                setCurrentIndex(idx);
                setZoomScale(1);
                setRotation(0);
              }}
              className={`relative w-12 h-12 sm:w-16 sm:h-16 rounded-xl overflow-hidden shrink-0 border-2 transition-all duration-300 focus:outline-none ${
                idx === currentIndex 
                  ? 'border-primary scale-110 shadow-lg shadow-primary/20' 
                  : 'border-white/10 hover:border-white/40 opacity-50 hover:opacity-100'
              }`}
            >
              <img
                src={img}
                alt={`Thumbnail ${idx + 1}`}
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover"
              />
              {idx === currentIndex && (
                <div className="absolute inset-0 bg-primary/10" />
              )}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
