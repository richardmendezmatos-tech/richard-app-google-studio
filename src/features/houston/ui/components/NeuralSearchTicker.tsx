'use client';

import React from 'react';
import { Search, AlertTriangle, TrendingUp } from 'lucide-react';

interface SearchGap {
  query: string;
  count: number;
  last_searched: string;
}

interface Props {
  gaps?: SearchGap[];
}

export const NeuralSearchTicker: React.FC<Props> = ({ gaps = [] }) => {
  if (!gaps.length) return null;

  return (
    <div className="glass-premium p-6 border border-white/5 group hover:border-violet-500/20 transition-all">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-violet-500/10 rounded-xl">
          <Search className="text-violet-400" size={20} />
        </div>
        <div>
          <h4 className="text-[10px] font-black text-violet-400 uppercase tracking-[0.3em]">Neural Search Gaps</h4>
          <p className="text-[8px] text-slate-500 font-bold uppercase tracking-widest mt-0.5">Demanda no satisfecha</p>
        </div>
      </div>

      <div className="space-y-3">
        {gaps.map((gap, i) => (
          <div key={i} className="flex items-center justify-between p-3 bg-slate-900/30 rounded-xl border border-white/5">
            <div className="flex items-center gap-3">
              <AlertTriangle size={14} className="text-amber-500/50" />
              <span className="text-xs font-black text-slate-200 italic">"{gap.query}"</span>
            </div>
            <div className="flex items-center gap-2">
              <TrendingUp size={12} className="text-violet-400" />
              <span className="text-[10px] font-black text-white">{gap.count}x</span>
            </div>
          </div>
        ))}
      </div>
      
      <div className="mt-6 pt-4 border-t border-white/5 text-center">
        <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest">
          Consolidando datos de vectorización global...
        </p>
      </div>
    </div>
  );
};
