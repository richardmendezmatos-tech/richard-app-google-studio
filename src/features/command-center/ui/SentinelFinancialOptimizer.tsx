import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  DollarSign,
  TrendingUp,
  CreditCard,
  ShieldCheck,
  BarChart3,
  AlertTriangle,
  Zap,
  Loader2,
} from 'lucide-react';

interface FinancialMetric {
  label: string;
  value: string;
  subLabel: string;
  trend: 'up' | 'down' | 'stable';
  status: 'good' | 'warning' | 'critical';
  icon: React.ElementType;
}

export const SentinelFinancialOptimizer: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [metrics, setMetrics] = useState<FinancialMetric[]>([
    {
      label: 'Inventory Yield',
      value: '$0',
      subLabel: 'Avg Profit / Unit',
      trend: 'stable',
      status: 'good',
      icon: DollarSign,
    },
    {
      label: 'Lending Radar',
      value: '4.89%',
      subLabel: 'Best PR Rate (Coop)',
      trend: 'down',
      status: 'good',
      icon: Zap,
    },
    {
      label: 'Bankability Rate',
      value: '0%',
      subLabel: 'Deals within LTV',
      trend: 'stable',
      status: 'good',
      icon: ShieldCheck,
    },
    {
      label: 'Backend Velocity',
      value: '2.4x',
      subLabel: 'Products / Deal',
      trend: 'up',
      status: 'good',
      icon: BarChart3,
    },
  ]);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch('/api/finance/stats');
        const data = await response.json();

        if (data.success) {
          const { inventoryYield, bankabilityRate } = data.stats;

          setMetrics((prev) => [
            { ...prev[0], value: `$${inventoryYield.toLocaleString()}`, trend: 'up' },
            prev[1],
            {
              ...prev[2],
              value: `${bankabilityRate}%`,
              trend: bankabilityRate > 70 ? 'up' : 'stable',
            },
            prev[3],
          ]);
        }
      } catch (error) {
        console.error('[FinancialOptimizer] Failed to fetch stats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  return (
    <div className="bg-slate-900/60 backdrop-blur-xl border border-white/5 rounded-[2.5rem] p-8 space-y-8 relative overflow-hidden group">
      {/* Background Grid Pattern */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[radial-gradient(#22d3ee_1px,transparent_1px)] [background-size:20px_20px]" />

      <div className="flex items-center justify-between relative z-10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-cyan-500/10 flex items-center justify-center border border-cyan-500/20">
            <CreditCard size={20} className="text-cyan-400" />
          </div>
          <div>
            <h3 className="text-xs font-black text-white uppercase tracking-[0.4em]">
              Información Financiera
            </h3>
            <p className="text-[10px] text-cyan-400 font-bold uppercase tracking-widest mt-0.5">
              Deal & Yield Optimizer • Sentinel N28
            </p>
          </div>
        </div>
        <div className="px-3 py-1 bg-white/5 rounded-full border border-white/5 flex items-center gap-2">
          {loading ? (
            <Loader2 size={10} className="text-cyan-500 animate-spin" />
          ) : (
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          )}
          <span className="text-[8px] font-black text-white/40 uppercase tracking-widest italic">
            {loading ? 'Analyzing...' : 'Profit Maximizer'}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 relative z-10">
        {metrics.map((metric, i) => (
          <div
            key={i}
            className="p-5 bg-white/5 rounded-3xl border border-white/5 hover:border-cyan-500/20 transition-all group"
          >
            <div className="flex items-center justify-between mb-3">
              <div className="p-2 bg-cyan-500/10 rounded-lg group-hover:scale-110 transition-transform">
                <metric.icon size={14} className="text-cyan-400" />
              </div>
              <span
                className={`text-[8px] font-black uppercase px-2 py-0.5 rounded-md ${
                  metric.trend === 'up'
                    ? 'bg-emerald-500/20 text-emerald-400'
                    : metric.trend === 'down' && metric.label.includes('Rate')
                      ? 'bg-emerald-500/20 text-emerald-400'
                      : 'bg-white/5 text-slate-400'
                }`}
              >
                {metric.trend === 'up'
                  ? '↑ Rising'
                  : metric.trend === 'down'
                    ? '↓ Optimal'
                    : '• Stable'}
              </span>
            </div>
            {loading && metric.value === '$0' ? (
              <div className="h-8 w-24 bg-white/5 animate-pulse rounded-lg" />
            ) : (
              <p className="text-2xl font-black text-white italic tracking-tighter">
                {metric.value}
              </p>
            )}
            <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest mt-1">
              {metric.label}
            </p>
            <p className="text-[8px] font-bold text-slate-500 uppercase tracking-widest mt-1">
              {metric.subLabel}
            </p>
          </div>
        ))}
      </div>

      <div className="bg-black/40 rounded-[2rem] border border-white/5 p-6 relative z-10">
        <div className="flex items-center justify-between mb-4">
          <h4 className="text-[10px] font-black text-white/40 uppercase tracking-[0.3em]">
            LTV Radar (Guardrails)
          </h4>
          <span className="text-[10px] font-black text-cyan-400 uppercase tracking-widest">
            Cap: 125%
          </span>
        </div>
        <div className="space-y-4">
          {[
            { name: 'Prime Portfolio (720+)', ltv: 94, status: 'safe' },
            { name: 'Near-Prime (660-719)', ltv: 112, status: 'warning' },
            { name: 'Sub-Prime (<600)', ltv: 122, status: 'critical' },
          ].map((tier) => (
            <div key={tier.name} className="space-y-1.5">
              <div className="flex justify-between text-[8px] font-black uppercase tracking-widest">
                <span className="text-slate-400">{tier.name}</span>
                <span
                  className={`${tier.ltv > 120 ? 'text-rose-400' : tier.ltv > 110 ? 'text-amber-400' : 'text-emerald-400'}`}
                >
                  {tier.ltv}% LTV
                </span>
              </div>
              <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${(tier.ltv / 125) * 100}%` }}
                  className={`h-full bg-linear-to-r ${
                    tier.ltv > 120
                      ? 'from-rose-500 to-rose-400'
                      : tier.ltv > 110
                        ? 'from-amber-500 to-amber-400'
                        : 'from-cyan-500 to-emerald-500'
                  }`}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      <button className="w-full py-4 bg-white/5 hover:bg-white/10 border border-white/5 rounded-2xl text-[9px] font-black text-slate-400 uppercase tracking-[0.4em] transition-all flex items-center justify-center gap-2">
              <TrendingUp size={14} className="text-emerald-400" /> Generar Informe de Rentabilidad
      </button>
    </div>
  );
};
