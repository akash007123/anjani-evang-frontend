import React from 'react';

interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string;
  key?: React.Key;
}

/**
 * Primitive Skeleton Component
 */
export function Skeleton({ className = '', ...props }: SkeletonProps) {
  return (
    <div
      className={`animate-pulse rounded-md bg-slate-200/80 ${className}`}
      {...props}
    />
  );
}

/**
 * Reusable Table Skeleton with configurable rows and columns
 */
export function TableSkeleton({ rows = 5, cols = 5 }: { rows?: number; cols?: number }) {
  return (
    <div className="w-full space-y-3 animate-pulse">
      {/* Table Header Skeleton */}
      <div className="flex items-center space-x-4 bg-slate-100/80 p-4 rounded-xl border border-slate-200/60">
        {Array.from({ length: cols }).map((_, i) => (
          <Skeleton key={i} className="h-4 flex-1 rounded-lg bg-slate-300/70" />
        ))}
      </div>
      {/* Table Rows Skeleton */}
      <div className="space-y-2.5">
        {Array.from({ length: rows }).map((_, rIndex) => (
          <div key={rIndex} className="flex items-center space-x-4 p-4 border border-slate-100 rounded-xl bg-white">
            {Array.from({ length: cols }).map((_, cIndex) => (
              <Skeleton key={cIndex} className={`h-4 flex-1 rounded-lg ${cIndex === 0 ? 'w-1/3' : ''}`} />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

/**
 * Reusable Card Grid Skeleton
 */
export function CardGridSkeleton({
  count = 6,
  cols = 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'
}: {
  count?: number;
  cols?: string;
}) {
  return (
    <div className={`grid ${cols} gap-6 w-full animate-pulse`}>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm flex flex-col space-y-4">
          <Skeleton className="h-40 w-full rounded-xl bg-slate-200" />
          <Skeleton className="h-6 w-3/4 bg-slate-300 rounded-lg" />
          <Skeleton className="h-4 w-full bg-slate-200 rounded" />
          <Skeleton className="h-4 w-5/6 bg-slate-200 rounded" />
          <div className="pt-2 flex justify-between items-center">
            <Skeleton className="h-8 w-24 rounded-full bg-slate-200" />
            <Skeleton className="h-8 w-20 rounded-full bg-slate-200" />
          </div>
        </div>
      ))}
    </div>
  );
}

/**
 * Reusable Stat Card Skeleton for Admin Dashboard
 */
export function StatCardSkeleton({ count = 4 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 w-full animate-pulse">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between">
          <div className="space-y-3 flex-1">
            <Skeleton className="h-4 w-24 bg-slate-200 rounded" />
            <Skeleton className="h-8 w-32 bg-slate-300 rounded-lg" />
            <Skeleton className="h-3 w-20 bg-slate-200 rounded" />
          </div>
          <Skeleton className="h-12 w-12 rounded-xl bg-slate-200 shrink-0" />
        </div>
      ))}
    </div>
  );
}
