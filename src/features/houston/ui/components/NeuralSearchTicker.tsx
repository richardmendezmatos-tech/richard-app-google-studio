'use client';

import React, { useState } from 'react';
import { Search, AlertTriangle, TrendingUp, ShoppingBag, CheckCircle, BarChart3, Info } from 'lucide-react';
import { analyzeGap, SourcingOpportunity } from '../../api/sourcingIntelligence';
import { motion, AnimatePresence } from 'framer-motion';

interface SearchGap {
  query: string;
  count: number;
  last_searched: string;
}

interface Props {
  gaps?: SearchGap[];
}

export const NeuralSearchTicker: React.FC<Props> = ({ gaps = [] }) => {
  const [activeOpportunity, setActiveOpportunity] = useState<string | null>(null);
  const [draftedOrders, setDraftedOrders] = useState<string[]>([]);

  if (!gaps.length) return null;

  const opportunities = gaps.map(g => analyzeGap(g.query, g.count));

  const handleDraftOrder = (query: string) => {
    // Simulando persistencia de intención de compra
    setDraftedOrders(prev => [...prev, query]);
    // TODO: Connect with Supabase 'purchase_orders' draft table in future phase
    console.log(`[NeuralIntelligence] Draft Order created for: ${query}`);
  };

  return (
    <div className="glass-premium p-6 border border-white/5 group hover:border-violet-500/20 transition-all overflow-hidden relative">
      {/* Background Pulse for Intelligence */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-violet-600/5 blur-[50px] rounded-full pointer-events-none" />

      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-violet-500/10 rounded-xl border border-violet-500/20 shadow-lg shadow-violet-500/5">
            <ShoppingBag className="text-violet-400" size={20} />
          </div>
          <div>
            <h4 className="text-[10px] font-black text-violet-400 uppercase tracking-[0.4em]">Neural Inventory Sourcing</h4>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="w-1 h-1 rounded-full bg-emerald-500 animate-ping" />
              <p className="text-[8px] text-slate-500 font-bold uppercase tracking-widest leading-none">Inteligencia de Abasto Activa</p>
            </div>
          </div>
        </div>
        <div className="px-3 py-1 bg-violet-500/10 rounded-full border border-violet-500/20">
           <span className="text-[8px] font-black text-violet-400 uppercase tracking-widest">RA Sentinel Intel</span>
        </div>
      </div>

      <div className="space-y-4">
        {opportunities.map((opp, i) => {
          const isDrafted = draftedOrders.includes(opp.query);
          const isActive = activeOpportunity === opp.query;

          return (
            <motion.div 
              key={i} 
              layout
              className={`p-4 rounded-2xl border transition-all cursor-pointer group/card ${
                isActive ? 'bg-violet-950/20 border-violet-500/40 shadow-xl' : 'bg-slate-900/40 border-white/5 hover:border-white/10'
              }`}
              onClick={() => setActiveOpportunity(isActive ? null : opp.query)}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`p-1.5 rounded-lg ${
                    opp.priority === 'CRITICAL' ? 'bg-rose-500/10 text-rose-400' : 
                    opp.priority === 'HIGH' ? 'bg-amber-500/10 text-amber-400' : 'bg-blue-500/10 text-blue-400'
                  }`}>
                    <AlertTriangle size={14} />
                  </div>
                  <div>
                    <span className="text-xs font-black text-white italic tracking-tight group-hover/card:text-violet-300 transition-colors uppercase">"{opp.query}"</span>
                    <div className="flex items-center gap-2 mt-1">
                      <div className="px-1.5 py-0.5 bg-white/5 rounded-md">
                        <span className="text-[7px] font-black text-slate-500 uppercase tracking-widest">Prioridad: </span>
                        <span className={`text-[7px] font-black uppercase tracking-widest ${
                          opp.priority === 'CRITICAL' ? 'text-rose-400' : 
                          opp.priority === 'HIGH' ? 'text-amber-400' : 'text-blue-400'
                        }`}>{opp.priority}</span>
                      </div>
                      <div className="flex items-center gap-1 text-[8px] font-bold text-violet-400/70 uppercase">
                        <BarChart3 size={10} />
                        <span>ROI: {opp.roi}%</span>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="hidden sm:flex flex-col items-end">
                    <span className="text-[10px] font-black text-white leading-none">{opp.count}x</span>
                    <span className="text-[7px] font-bold text-slate-500 uppercase tracking-widest mt-1">Gaps Det.</span>
                  </div>
                  <TrendingUp size={14} className="text-violet-400 group-hover/card:translate-x-1 group-hover/card:-translate-y-1 transition-transform" />
                </div>
              </div>

              {/* Expansion Detail */}
              <AnimatePresence>
                {isActive && (
                  <motion.div 
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="mt-4 pt-4 border-t border-white/5 space-y-4">
                      <div className="p-3 bg-violet-400/5 rounded-xl border border-violet-400/10">
                         <div className="flex items-center gap-2 mb-1.5">
                            <Info size={12} className="text-violet-400" />
                            <span className="text-[9px] font-black text-violet-400 uppercase tracking-widest">Sourcing Advice</span>
                         </div>
                         <p className="text-[11px] leading-relaxed text-slate-300 font-medium">
                           {opp.recommendation} <span className="text-slate-500 italic block mt-1">{opp.reason}</span>
                         </p>
                      </div>

                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          if (!isDrafted) handleDraftOrder(opp.query);
                        }}
                        disabled={isDrafted}
                        className={`w-full py-2.5 rounded-xl font-black text-[9px] uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-2 ${
                          isDrafted 
                            ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' 
                            : 'bg-violet-500 hover:bg-violet-400 text-white shadow-lg shadow-violet-500/20'
                        }`}
                      >
                        {isDrafted ? (
                          <>
                            <CheckCircle size={14} />
                            Orden en Draft
                          </>
                        ) : (
                          <>
                            Generar Orden de Compra
                          </>
                        )}
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          );
        })}
      </div>
      
      <div className="mt-8 pt-4 border-t border-white/5 text-center relative z-10">
        <p className="text-[8px] font-black text-slate-600 uppercase tracking-widest">
          Sincronizado con Sentinel Neural Ops • N15 Deployment
        </p>
      </div>
    </div>
  );
};
