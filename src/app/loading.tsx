import React from 'react';

/**
 * Loading Skeleton Grid
 * Standard modern loading state containing skeleton elements for vehicle inventory.
 */
export default function Loading() {
  return (
    <div className="w-full min-h-screen bg-slate-950 p-4 md:p-6 lg:p-8 space-y-8 max-w-[1920px] mx-auto animate-pulse">
      {/* Search and Filters Skeleton Bar */}
      <div className="h-16 w-full rounded-2xl bg-white/5 border border-white/5 flex items-center justify-between px-6" />

      {/* Grid of skeleton vehicle cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {[...Array(8)].map((_, i) => (
          <div
            key={i}
            className="flex flex-col rounded-3xl border border-white/5 bg-slate-900/50 p-5 space-y-4"
          >
            {/* Image Placeholder */}
            <div className="w-full aspect-[16/10] rounded-2xl bg-white/5" />
            
            {/* Title and Specs Placeholder */}
            <div className="space-y-3">
              <div className="h-6 w-3/4 rounded-lg bg-white/5" />
              <div className="h-4 w-1/2 rounded-lg bg-white/5" />
            </div>

            {/* Specs Row */}
            <div className="flex gap-2 pt-2">
              <div className="h-5 w-16 rounded-full bg-white/5" />
              <div className="h-5 w-16 rounded-full bg-white/5" />
            </div>

            {/* Price and CTA Row */}
            <div className="flex justify-between items-center pt-4 border-t border-white/5">
              <div className="h-6 w-24 rounded-lg bg-white/5" />
              <div className="h-10 w-24 rounded-full bg-white/5" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
