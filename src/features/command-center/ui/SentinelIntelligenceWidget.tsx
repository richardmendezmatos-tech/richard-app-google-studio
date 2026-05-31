'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  BrainCircuit,
  TrendingUp,
  AlertTriangle,
  Zap,
  Target,
  Search,
  PhoneCall,
  ArrowUpRight,
  Flame,
} from 'lucide-react';

export interface IntelligenceSignal {
  id: string;
  type: 'HOT_INVENTORY' | 'INVENTORY_GAP' | 'VIP_LEAD_READY';
  severity: 'critical' | 'high' | 'medium';
  message: string;
  vin?: string;
  query?: string;
  leadId?: string;
  score?: number;
  action: string;
}

interface SentinelIntelligenceWidgetProps {
  signals: IntelligenceSignal[];
  loading?: boolean;
}

export const SentinelIntelligenceWidget: React.FC<SentinelIntelligenceWidgetProps> = ({
  signals,
  loading,
}) => {
  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="h-20 bg-slate-900/50 rounded-2xl animate-pulse border border-white/5"
          />
        ))}
      </div>
    );
  }

  if (!signals || signals.length === 0) {
    return (
      <div className="p-4 bg-slate-900/40 border border-white/5 rounded-2xl mb-8 flex items-center justify-center gap-3">
        <BrainCircuit className="w-4 h-4 text-slate-500" />
        <span className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">
          Monitoreo: Sin señales urgentes detectadas.
        </span>
      </div>
    );
  }

  const getSignalMeta = (signal: IntelligenceSignal) => {
    switch (signal.type) {
      case 'HOT_INVENTORY':
        return {
          icon: Flame,
          color: 'text-orange-400',
          bg: 'bg-orange-500/10',
          border: 'border-orange-500/20',
        };
      case 'INVENTORY_GAP':
        return {
          icon: Search,
          color: 'text-cyan-400',
          bg: 'bg-cyan-500/10',
          border: 'border-cyan-500/20',
        };
      case 'VIP_LEAD_READY':
        return {
          icon: Target,
          color: 'text-rose-400',
          bg: 'bg-rose-500/10',
          border: 'border-rose-500/20',
        };
      default:
        return {
          icon: BrainCircuit,
          color: 'text-slate-400',
          bg: 'bg-slate-500/10',
          border: 'border-white/5',
        };
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
      <AnimatePresence mode="popLayout">
        {signals.slice(0, 6).map((signal, i) => {
          const meta = getSignalMeta(signal);
          return (
            <motion.div
              key={signal.id}
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ delay: i * 0.1, type: 'spring', stiffness: 200, damping: 20 }}
              className={`group relative flex flex-col p-4 rounded-2xl ${meta.bg} border ${meta.border} backdrop-blur-md overflow-hidden hover:bg-opacity-20 transition-all`}
            >
              {/* Scanline effect for critical signals */}
              {signal.severity === 'critical' && (
                <div className="absolute inset-0 bg-linear-to-b from-rose-500/5 to-transparent pointer-events-none opacity-20 animate-pulse" />
              )}

              <div className="flex items-start justify-between mb-3">
                <div className={`p-2 rounded-lg ${meta.bg} border border-white/5`}>
                  <meta.icon size={18} className={meta.color} />
                </div>
                <div className="flex flex-col items-end">
                  <span className={`text-[9px] font-black uppercase tracking-widest ${meta.color}`}>
                    {signal.type.replace('_', ' ')}
                  </span>
                  {signal.score && (
                    <span className="text-[10px] text-slate-500 font-mono">
                      Score: {signal.score}
                    </span>
                  )}
                </div>
              </div>

              <p className="text-[11px] font-bold text-slate-200 uppercase tracking-tight leading-tight mb-4 flex-grow">
                {signal.message}
              </p>

              <div className="flex items-center justify-between pt-2 border-t border-white/5">
                <span className="text-[9px] text-slate-500 uppercase font-black tracking-widest group-hover:text-white transition-colors">
                  {signal.action}
                </span>
                <button
                  className={`p-1.5 rounded-lg bg-white/5 hover:bg-white/10 ${meta.color} transition-all`}
                >
                  <ArrowUpRight size={14} />
                </button>
              </div>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
};
