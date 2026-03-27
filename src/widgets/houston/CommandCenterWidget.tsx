import React from 'react';
import { HoustonDashboard } from '@/features/houston/ui/HoustonDashboard';

export const CommandCenterWidget: React.FC = () => {
  return (
    <div className="w-full max-w-7xl mx-auto px-4 py-8 animate-in fade-in slide-in-from-bottom-8 duration-1000">
      <HoustonDashboard />
      
      {/* Decorative details for Premium feel */}
      <div className="mt-4 flex justify-between px-8">
        <div className="flex gap-4">
          <div className="w-1 h-8 bg-cyan-500/20 rounded-full" />
          <div className="w-1 h-8 bg-cyan-500/40 rounded-full" />
          <div className="w-1 h-8 bg-cyan-500/60 rounded-full animate-pulse" />
        </div>
        <div className="text-[10px] font-black text-slate-700 uppercase tracking-[0.5em]">
          Sector 7-G Monitoring Node
        </div>
      </div>
    </div>
  );
};
