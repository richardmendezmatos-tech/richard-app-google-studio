'use client';

import React from 'react';
import { Target, TrendingUp, UserCheck, ChevronRight } from 'lucide-react';
import { motion } from 'framer-motion';

interface Lead {
  id: string;
  name: string;
  score: number;
  priority: string;
  interest: string;
  factors: string[];
}

interface Props {
  leads?: Lead[];
}

export const LeadIntelligenceWidget: React.FC<Props> = ({ leads = [] }) => {
  if (!leads.length) return null;

  return (
    <div className="glass-premium p-6 border border-white/5 relative overflow-hidden group hover:border-primary/20 transition-all">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary/10 rounded-xl">
            <Target className="text-primary" size={20} />
          </div>
          <h4 className="text-[10px] font-black text-primary uppercase tracking-[0.3em]">Lead Intelligence HUD</h4>
        </div>
        <div className="flex items-center gap-2 px-3 py-1 bg-emerald-500/10 rounded-full border border-emerald-500/20">
          <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-ping" />
          <span className="text-[8px] font-black text-emerald-500 uppercase tracking-widest">Active Scan</span>
        </div>
      </div>

      <div className="space-y-4">
        {leads.map((lead, idx) => (
          <motion.div 
            key={lead.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: idx * 0.1 }}
            className="p-4 bg-slate-900/40 rounded-2xl border border-white/5 hover:border-primary/30 transition-all cursor-pointer group/lead"
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center text-[10px] font-black text-white">
                  {lead.name.split(' ').map(n => n[0]).join('')}
                </div>
                <div>
                  <p className="text-xs font-black text-white uppercase tracking-tight">{lead.name}</p>
                  <p className="text-[9px] text-slate-500 font-bold uppercase tracking-widest">{lead.interest}</p>
                </div>
              </div>
              <div className="text-right">
                <p className={`text-sm font-black italic ${lead.score > 85 ? 'text-emerald-400' : 'text-primary'}`}>
                  {lead.score}<span className="text-[10px] ml-0.5">% Match</span>
                </p>
                <p className="text-[8px] font-black text-slate-600 uppercase tracking-[0.2em]">{lead.priority}</p>
              </div>
            </div>
            
            <div className="flex flex-wrap gap-2 mt-3">
              {lead.factors.slice(0, 3).map(f => (
                <span key={f} className="text-[8px] font-black px-2 py-0.5 bg-white/5 text-slate-400 rounded-md border border-white/5 uppercase">
                  {f}
                </span>
              ))}
              <div className="ml-auto opacity-0 group-hover/lead:opacity-100 transition-opacity">
                <ChevronRight size={14} className="text-primary" />
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};
