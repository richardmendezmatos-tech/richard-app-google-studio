'use client';

import React, { useEffect, useState } from 'react';
import { TrendingUp, TrendingDown, Info, AlertCircle, CheckCircle2, Search } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  getMarketTrend,
  calculateCompetitiveness,
  MarketTrend,
} from '@/shared/api/market-pulse/marketPulseApi';

interface MarketPulseWidgetProps {
  make: string;
  model: string;
  currentPrice: number;
}

export const MarketPulseWidget: React.FC<MarketPulseWidgetProps> = ({
  make,
  model,
  currentPrice,
}) => {
  const [trend, setTrend] = useState<MarketTrend | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTrend = async () => {
      setLoading(true);
      const data = await getMarketTrend(make, model);
      setTrend(data);
      setLoading(false);
    };
    fetchTrend();
  }, [make, model]);

  if (loading) {
    return (
      <div className="h-48 flex items-center justify-center bg-slate-900/20 backdrop-blur-xl rounded-3xl border border-white/5 animate-pulse">
        <Search className="text-cyan-500/50 animate-bounce" size={24} />
      </div>
    );
  }

  const comp = trend ? calculateCompetitiveness(currentPrice, trend.average_price) : null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-6 bg-slate-900/40 backdrop-blur-xl rounded-3xl border border-white/10 shadow-2xl relative overflow-hidden"
    >
      {/* Background Decor */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/5 rounded-full blur-3xl" />

      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
            Market Pulse{' '}
            <span className="text-[10px] bg-cyan-500/10 text-cyan-400 px-2 py-0.5 rounded-full border border-cyan-500/20">
              SENTINEL N25
            </span>
          </h3>
          <p className="text-xs text-slate-500 mt-1">
            Comparativa Local: {make} {model}
          </p>
        </div>
        <div
          className={`p-2 rounded-xl border ${
            comp?.status === 'excellent'
              ? 'bg-green-500/10 border-green-500/20 text-green-400'
              : comp?.status === 'good'
                ? 'bg-blue-500/10 border-blue-500/20 text-blue-400'
                : 'bg-amber-500/10 border-amber-500/20 text-amber-400'
          }`}
        >
          {comp?.status === 'excellent' ? <CheckCircle2 size={20} /> : <Info size={20} />}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="p-4 bg-black/20 rounded-2xl border border-white/5">
          <p className="text-[10px] font-bold text-slate-500 uppercase mb-1">Precio Promedio PR</p>
          <p className="text-xl font-black text-white">${trend?.average_price.toLocaleString()}</p>
        </div>
        <div className="p-4 bg-black/20 rounded-2xl border border-white/5">
          <p className="text-[10px] font-bold text-slate-500 uppercase mb-1">Tu Unidad</p>
          <p className="text-xl font-black text-cyan-400">${currentPrice.toLocaleString()}</p>
        </div>
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider">
          <span className="text-slate-500">Competitividad</span>
          <span className={comp?.status === 'excellent' ? 'text-green-400' : 'text-cyan-400'}>
            {comp?.label} ({comp?.score}%)
          </span>
        </div>
        <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${comp?.score}%` }}
            transition={{ duration: 1, ease: 'easeOut' }}
            className={`h-full bg-linear-to-r ${
              comp?.status === 'excellent'
                ? 'from-green-500 to-emerald-400'
                : 'from-cyan-500 to-blue-600'
            }`}
          />
        </div>
      </div>

      <div className="mt-6 p-4 bg-cyan-500/5 rounded-2xl border border-cyan-500/10 flex items-start gap-3">
        <TrendingUp className="text-cyan-400 mt-0.5 shrink-0" size={16} />
        <p className="text-[11px] text-slate-300 leading-relaxed">
          {comp?.status === 'excellent'
            ? 'Tu precio está significativamente por debajo del promedio. Alta probabilidad de venta rápida (DTS < 15 días).'
            : 'Estás alineado con el mercado. Considera resaltar el millaje o extras para diferenciar la unidad.'}
        </p>
      </div>
    </motion.div>
  );
};
