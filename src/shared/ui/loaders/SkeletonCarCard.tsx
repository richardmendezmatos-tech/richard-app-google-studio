import React from 'react';

/**
 * Premium Skeleton UI para tarjetas de autos para evitar Cumulative Layout Shift (CLS)
 */
export const SkeletonCarCard: React.FC = () => {
  return (
    <div className="bg-slate-800/40 rounded-[32px] overflow-hidden border border-white/5 animate-pulse w-full h-[400px] flex flex-col shadow-xl">
       {/* Image Placeholder */}
       <div className="h-[220px] bg-slate-700/30 w-full relative">
         <div className="absolute top-4 left-4 h-6 w-20 bg-slate-600/40 rounded-full" />
         <div className="absolute top-4 right-4 h-8 w-8 bg-slate-600/40 rounded-full" />
       </div>
       
       {/* Content Placeholder */}
       <div className="flex-1 p-6 space-y-4">
         <div className="h-4 bg-slate-700/40 w-24 rounded-full" />
         <div className="h-7 bg-slate-600/40 w-3/4 rounded-xl" />
         
         <div className="flex justify-between items-center mt-6 pt-4 border-t border-white/5">
           <div className="h-8 bg-slate-700/40 w-28 rounded-xl" />
           <div className="h-8 bg-slate-700/40 w-10 rounded-xl" />
         </div>
       </div>
    </div>
  );
};
