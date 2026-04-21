'use client';
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ShoppingBag, 
  TrendingUp, 
  CheckCircle, 
  XCircle, 
  Clock, 
  ShieldCheck, 
  ChevronRight,
  Info
} from 'lucide-react';
import { PurchaseOrder } from '@/entities/houston/model/types';
import { updatePurchaseOrderStatus } from '@/shared/api/supabase/supabaseClient';

interface Props {
  orders: PurchaseOrder[];
  onUpdate?: () => void;
}

export const SourcingLogWidget: React.FC<Props> = ({ orders = [], onUpdate }) => {
  const [isProcessing, setIsProcessing] = useState<string | null>(null);

  const handleAction = async (id: string, status: 'confirmed' | 'archived') => {
    setIsProcessing(id);
    const result = await updatePurchaseOrderStatus(id, status);
    if (result.success && onUpdate) {
      onUpdate();
    }
    setIsProcessing(null);
  };

  if (!orders.length) {
    return (
      <div className="glass-premium p-8 flex flex-col items-center justify-center text-center hud-brackets min-h-[300px]">
        <div className="w-16 h-16 rounded-full bg-slate-800/50 flex items-center justify-center mb-4 border border-white/5">
          <ShoppingBag className="text-slate-600" size={24} />
        </div>
        <p className="text-xs font-black text-slate-500 uppercase tracking-[0.2em]">Sin Órdenes de Abasto Pendientes</p>
        <p className="text-[10px] text-slate-600 mt-2 uppercase tracking-widest font-bold">Houston está analizando los gaps del mercado...</p>
      </div>
    );
  }

  return (
    <div className="glass-premium p-6 border border-white/5 group hover:border-cyan-500/20 transition-all overflow-hidden relative hud-brackets shadow-[0_20px_50px_rgba(0,0,0,0.5)]">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <div className="relative">
            <div className="p-3 bg-cyan-500/10 rounded-2xl border border-cyan-500/20 shadow-[0_0_15px_rgba(6,182,212,0.2)]">
              <ShieldCheck className="text-cyan-400" size={24} />
            </div>
            <div className="absolute -top-1 -right-1 w-3 h-3 bg-cyan-500 rounded-full animate-ping opacity-40" />
          </div>
          <div>
            <h4 className="text-xs font-black text-cyan-400 uppercase tracking-[0.4em] mb-1">Sourcing Intelligence</h4>
            <div className="flex items-center gap-2">
              <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest leading-none">Neural Loop v2.4</span>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-6 max-h-[550px] overflow-y-auto pr-3 custom-scrollbar">
        <AnimatePresence mode="popLayout">
          {orders.map((order) => (
            <motion.div
              key={order.id}
              layout
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className={`p-5 rounded-[2rem] border transition-all relative overflow-hidden group/card ${
                order.status === 'confirmed' 
                  ? 'bg-emerald-950/20 border-emerald-500/40 shadow-[0_0_30px_rgba(16,185,129,0.1)]' 
                  : 'bg-slate-900/40 border-white/[0.03] hover:border-cyan-500/30 hover:bg-slate-900/60'
              }`}
            >
              {/* ROI Badge */}
              <div className="absolute top-0 right-0 p-4">
                <div className="flex flex-col items-end">
                  <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest mb-1">Est. ROI</span>
                  <span className="text-lg font-black text-emerald-400 italic tracking-tighter">+{order.estimated_roi}%</span>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="flex-grow pt-1">
                  <div className="flex items-center gap-2 mb-3">
                    <span className={`text-[9px] font-black px-3 py-1 rounded-full uppercase tracking-widest ${
                      order.priority === 'critical' ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30' :
                      order.priority === 'high' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' : 
                      'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30'
                    }`}>
                      {order.priority}
                    </span>
                  </div>

                  <h5 className="text-sm font-black text-white italic tracking-tight uppercase mb-2 group-hover/card:text-cyan-300 transition-colors">
                    Target: {order.query}
                  </h5>
                  
                  <div className="p-3 bg-black/20 rounded-xl border border-white/[0.02] mb-4">
                    <p className="text-[10px] text-slate-400 leading-relaxed font-medium">
                      {order.recommendation}
                    </p>
                  </div>

                  <div className="flex items-center gap-4">
                    {order.status === 'draft' && (
                      <div className="flex items-center gap-2 w-full">
                        <button
                          onClick={() => handleAction(order.id, 'confirmed')}
                          disabled={!!isProcessing}
                          className="flex-grow py-2.5 bg-cyan-500 text-slate-950 rounded-xl font-black text-[10px] uppercase tracking-[0.2em] hover:bg-cyan-400 transition-all flex items-center justify-center gap-2 shadow-[0_10px_20px_rgba(6,182,212,0.2)] active:scale-95"
                        >
                          <CheckCircle size={14} strokeWidth={3} />
                          Approve Sourcing
                        </button>
                        <button
                          onClick={() => handleAction(order.id, 'archived')}
                          disabled={!!isProcessing}
                          className="p-2.5 bg-slate-800/50 hover:bg-rose-500/10 border border-white/5 hover:border-rose-500/30 rounded-xl text-slate-500 hover:text-rose-400 transition-all"
                        >
                          <XCircle size={16} />
                        </button>
                      </div>
                    )}
                    {order.status === 'confirmed' && (
                      <div className="flex items-center gap-2 text-emerald-400 font-black text-[10px] uppercase tracking-widest bg-emerald-500/10 py-2 px-4 rounded-xl border border-emerald-500/20">
                        <ShieldCheck size={14} strokeWidth={3} />
                        Sourcing Order Active
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-white/[0.03] flex items-center justify-between">
                 <div className="flex items-center gap-2">
                    <Clock size={12} className="text-slate-600" />
                    <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">
                       {new Date(order.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} • {new Date(order.created_at).toLocaleDateString()}
                    </span>
                 </div>
                 <div className="flex items-center gap-1.5 opacity-60">
                    <TrendingUp size={12} className="text-cyan-400" />
                    <span className="text-[9px] font-black text-cyan-400 uppercase tracking-widest">Neural Projected</span>
                 </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
};
