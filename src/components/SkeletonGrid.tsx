import { Sparkles } from 'lucide-react';

interface SkeletonProps {
  count?: number;
}

/**
 * Projects Grid Skeleton Loader
 * Outputs multiple cards matching the 'Projects' layout
 */
export function ProjectsSkeleton({ count = 3 }: SkeletonProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 w-full animate-pulse">
      {Array.from({ length: count }).map((_, index) => (
        <div
          key={index}
          className="bg-white rounded-3xl overflow-hidden border border-slate-100 shadow-sm flex flex-col justify-between text-left h-[460px]"
        >
          <div>
            {/* Pulsing Cover Image Area */}
            <div className="h-64 bg-slate-200 relative overflow-hidden">
              {/* Shimmer overlay effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full animate-[shimmer_1.5s_infinite]" />
              {/* Category Badge Placeholder */}
              <div className="absolute top-4 left-4 bg-slate-300 w-24 h-6 rounded-md" />
            </div>

            {/* Content Details Area */}
            <div className="p-6 flex flex-col gap-4">
              {/* Date & Location Placeholders */}
              <div className="flex items-center gap-4">
                <div className="w-20 h-4 bg-slate-200 rounded-md" />
                <div className="w-3 h-3 bg-slate-200 rounded-full" />
                <div className="w-24 h-4 bg-slate-200 rounded-md" />
              </div>

              {/* Title Placeholder */}
              <div className="w-3/4 h-6 bg-slate-300 rounded-lg" />

              {/* Description Placeholder */}
              <div className="flex flex-col gap-2">
                <div className="w-full h-3.5 bg-slate-200 rounded" />
                <div className="w-11/12 h-3.5 bg-slate-200 rounded" />
                <div className="w-4/5 h-3.5 bg-slate-200 rounded" />
              </div>
            </div>
          </div>

          {/* Footer Placeholders */}
          <div className="px-6 pb-6 pt-2">
            <div className="border-t border-slate-100 pt-4 flex justify-between items-center">
              <div className="w-20 h-5 bg-slate-200 rounded-full" />
              <div className="w-24 h-5 bg-slate-200 rounded-full" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

/**
 * Menu Grid Skeleton Loader
 * Outputs multiple horizontal / vertical items matching the 'Menu' food card layouts
 */
export function MenuSkeleton({ count = 6 }: SkeletonProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12 max-w-5xl mx-auto w-full animate-pulse">
      {Array.from({ length: count }).map((_, index) => (
        <div
          key={index}
          className="bg-white rounded-3xl p-5 sm:p-6 flex flex-col sm:flex-row items-center gap-6 border border-slate-50 shadow-sm h-auto sm:h-48 text-left relative overflow-hidden"
        >
          {/* Pulsing Food Image Thumbnail */}
          <div className="w-28 h-28 sm:w-36 sm:h-36 rounded-2xl bg-slate-200 shrink-0 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full animate-[shimmer_1.5s_infinite]" />
          </div>

          {/* Food Specification details */}
          <div className="flex-1 flex flex-col gap-3.5 w-full">
            {/* Header Title + Price row */}
            <div className="flex items-center justify-between gap-3 border-b border-dashed border-slate-200 pb-2.5">
              <div className="w-1/2 h-5 bg-slate-300 rounded-lg" />
              <div className="w-12 h-5 bg-slate-300 rounded-lg" />
            </div>

            {/* Description lines */}
            <div className="flex flex-col gap-1.5">
              <div className="w-full h-3 bg-slate-200 rounded" />
              <div className="w-11/12 h-3 bg-slate-200 rounded" />
            </div>

            {/* Tag Pills */}
            <div className="flex gap-2 pt-1">
              <div className="w-16 h-5 bg-slate-200 rounded-md" />
              <div className="w-12 h-5 bg-slate-150 rounded-md" />
              <div className="w-14 h-5 bg-slate-150 rounded-md" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
