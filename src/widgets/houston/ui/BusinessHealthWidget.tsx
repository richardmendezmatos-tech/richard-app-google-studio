"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, Heart, Target, ArrowUpRight } from 'lucide-react';

export const BusinessHealthWidget: React.FC = () => {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-premium p-8 border border-white/5 relative overflow-hidden group h-full"
    >
      <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:opacity-30 transition-opacity">
        <Target size={80} className="text-cyan-500" />
      </div>

      <h3 className="text-xs font-black text-white uppercase tracking-[0.4em] mb-8 flex items-center gap-3">
        <div className="w-2 h-2 bg-cyan-500 rounded-full shadow-[0_0_10px_#06b6d4] animate-pulse" />
        Business Velocity
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* ROI Metric */}
        <div className="space-y-4">
          <div className="flex items-center gap-3 text-slate-500 uppercase font-black text-[9px] tracking-widest">
            <TrendingUp size={14} className="text-emerald-500" /> Marketing ROI
          </div>
          <div className="flex items-end gap-2">
            <span className="text-4xl font-black text-white tracking-tighter">4.2</span>
            <span className="text-emerald-500 font-black text-sm mb-1.5 flex items-center gap-1">
              <ArrowUpRight size={14} /> 12%
            </span>
          </div>
          <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: '75%' }}
              className="h-full bg-emerald-500 shadow-[0_0_10px_#10b981]"
            />
          </div>
        </div>

        {/* Happiness Metric (Happy Senior Style) */}
        <div className="space-y-4">
          <div className="flex items-center gap-3 text-slate-500 uppercase font-black text-[9px] tracking-widest">
            <Heart size={14} className="text-rose-500" /> Client Happiness
          </div>
          <div className="flex items-end gap-2">
            <span className="text-4xl font-black text-white tracking-tighter">98</span>
            <span className="text-slate-500 font-bold text-xs mb-2 uppercase">/ 100</span>
          </div>
          <div className="flex gap-1.5 h-1">
            {[...Array(10)].map((_, i) => (
              <div key={i} className={`flex-1 rounded-full ${i < 9 ? 'bg-rose-500 shadow-[0_0_5px_#f43f5e]' : 'bg-white/5'}`} />
            ))}
          </div>
        </div>

        {/* Conversion Metric */}
        <div className="space-y-4">
          <div className="flex items-center gap-3 text-slate-500 uppercase font-black text-[9px] tracking-widest">
            <Target size={14} className="text-cyan-500" /> Lead Conversion
          </div>
          <div className="flex items-end gap-2">
            <span className="text-4xl font-black text-white tracking-tighter">18</span>
            <span className="text-cyan-500/50 font-black text-lg mb-1">%</span>
          </div>
          <div className="flex items-center justify-between text-[8px] font-black uppercase text-slate-600 tracking-tighter">
            <span>Target: 20%</span>
            <span className="text-cyan-500/40">RA_SENTINEL_ACCURATE</span>
          </div>
        </div>
      </div>

      <div className="mt-10 pt-8 border-t border-white/5 flex items-center justify-between">
         <div className="flex gap-4">
            <div className="px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-[8px] font-black text-slate-500 uppercase tracking-widest">
              Live Audits: <span className="text-white">Active</span>
            </div>
            <div className="px-3 py-1.5 rounded-lg bg-emerald-500/5 border border-emerald-500/10 text-[8px] font-black text-emerald-500 uppercase tracking-widest">
              Predictive Mode: <span className="text-emerald-400">On</span>
            </div>
         </div>
         <button className="text-[9px] font-black text-cyan-500 uppercase tracking-[0.3em] hover:text-white transition-colors">
           Deep Analysis →
         </button>
      </div>
    </motion.div>
  );
};
