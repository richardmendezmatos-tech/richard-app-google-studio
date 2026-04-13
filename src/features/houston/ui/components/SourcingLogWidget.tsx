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
    <div className="glass-premium p-6 border border-white/5 group hover:border-cyan-500/20 transition-all overflow-hidden relative hud-brackets">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-cyan-500/10 rounded-xl border border-cyan-500/20 shadow-lg shadow-cyan-500/5">
            <ShieldCheck className="text-cyan-400" size={20} />
          </div>
          <div>
            <h4 className="text-[10px] font-black text-cyan-400 uppercase tracking-[0.4em]">Sourcing Intelligence Log</h4>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="w-1 h-1 rounded-full bg-cyan-500 animate-pulse" />
              <p className="text-[8px] text-slate-500 font-bold uppercase tracking-widest leading-none">Gestión de Inventario Estratégico</p>
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
        <AnimatePresence mode="popLayout">
          {orders.map((order) => (
            <motion.div
              key={order.id}
              layout
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, x: -20 }}
              className={`p-4 rounded-2xl border transition-all relative overflow-hidden group/card ${
                order.status === 'confirmed' 
                  ? 'bg-emerald-950/10 border-emerald-500/30' 
                  : 'bg-slate-900/40 border-white/5 hover:border-white/10'
              }`}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-grow">
                  <div className="flex items-center gap-2 mb-2">
                    <span className={`text-[8px] font-black px-2 py-0.5 rounded uppercase tracking-widest ${
                      order.priority === 'critical' ? 'bg-rose-500/20 text-rose-400' :
                      order.priority === 'high' ? 'bg-amber-500/20 text-amber-400' : 'bg-blue-500/20 text-blue-400'
                    }`}>
                      {order.priority}
                    </span>
                    <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">
                      ROI Est: <span className="text-emerald-400">{order.estimated_roi}%</span>
                    </span>
                  </div>
                  <h5 className="text-xs font-black text-white italic tracking-tight uppercase group-hover/card:text-cyan-300 transition-colors">
                    "{order.query}"
                  </h5>
                  <p className="text-[10px] text-slate-400 mt-2 leading-relaxed">
                    {order.recommendation}
                  </p>
                </div>
                
                <div className="flex flex-col gap-2">
                  {order.status === 'draft' && (
                    <>
                      <button
                        onClick={() => handleAction(order.id, 'confirmed')}
                        disabled={!!isProcessing}
                        className="p-2 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 rounded-xl text-emerald-400 transition-all hover:scale-105"
                        title="Confirmar Compra"
                      >
                        <CheckCircle size={14} />
                      </button>
                      <button
                        onClick={() => handleAction(order.id, 'archived')}
                        disabled={!!isProcessing}
                        className="p-2 bg-slate-800/10 hover:bg-rose-500/10 border border-white/5 hover:border-rose-500/30 rounded-xl text-slate-500 hover:text-rose-400 transition-all hover:scale-105"
                        title="Archivar"
                      >
                        <XCircle size={14} />
                      </button>
                    </>
                  )}
                  {order.status === 'confirmed' && (
                    <div className="p-2 bg-emerald-500/20 border border-emerald-500/50 rounded-xl text-emerald-400">
                      <CheckCircle size={14} />
                    </div>
                  )}
                </div>
              </div>

              <div className="mt-3 pt-3 border-t border-white/5 flex items-center justify-between pointer-events-none opacity-50">
                 <div className="flex items-center gap-2">
                    <Clock size={10} className="text-slate-500" />
                    <span className="text-[8px] font-bold text-slate-500 uppercase tracking-widest">
                       {new Date(order.created_at).toLocaleDateString()}
                    </span>
                 </div>
                 <div className="flex items-center gap-1">
                    <TrendingUp size={10} className="text-emerald-500" />
                    <span className="text-[8px] font-black text-emerald-500 uppercase">Proyectado</span>
                 </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
};
