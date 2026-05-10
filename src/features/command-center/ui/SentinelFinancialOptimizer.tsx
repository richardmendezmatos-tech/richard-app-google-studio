import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { DollarSign, PieChart, TrendingDown, TrendingUp, Cpu, CreditCard, Activity } from 'lucide-react';

interface FinancialMetric {
  label: string;
  value: string;
  subLabel: string;
  trend: 'up' | 'down' | 'stable';
  status: 'good' | 'warning' | 'critical';
  icon: React.ElementType;
}

export const SentinelFinancialOptimizer: React.FC = () => {
  const [metrics, setMetrics] = useState<FinancialMetric[]>([
    { 
      label: 'CAC (Ad Spend)', 
      value: '$242', 
      subLabel: 'Per Sold Unit', 
      trend: 'down', 
      status: 'good', 
      icon: DollarSign 
    },
    { 
      label: 'Operational Burn', 
      value: '$48.12', 
      subLabel: 'Cloud/APIs Today', 
      trend: 'stable', 
      status: 'good', 
      icon: Cpu 
    },
    { 
      label: 'Automation ROI', 
      value: '22.4x', 
      subLabel: 'Efficiency Multiplier', 
      trend: 'up', 
      status: 'good', 
      icon: PieChart 
    },
    { 
      label: 'Labor Savings', 
      value: '$1,240', 
      subLabel: 'AI Task Hours/Mo', 
      trend: 'up', 
      status: 'good', 
      icon: TrendingUp 
    },
  ]);

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
            <h3 className="text-xs font-black text-white uppercase tracking-[0.4em]">Financial Intelligence</h3>
            <p className="text-[10px] text-cyan-400 font-bold uppercase tracking-widest mt-0.5">Budget & ROI Optimizer • Sentinel N25</p>
          </div>
        </div>
        <div className="px-3 py-1 bg-white/5 rounded-full border border-white/5 flex items-center gap-2">
           <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
           <span className="text-[8px] font-black text-white/40 uppercase tracking-widest italic">Live Optimization</span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 relative z-10">
        {metrics.map((metric, i) => (
          <div key={i} className="p-5 bg-white/5 rounded-3xl border border-white/5 hover:border-cyan-500/20 transition-all group">
            <div className="flex items-center justify-between mb-3">
               <div className="p-2 bg-cyan-500/10 rounded-lg group-hover:scale-110 transition-transform">
                  <metric.icon size={14} className="text-cyan-400" />
               </div>
               <span className={`text-[8px] font-black uppercase px-2 py-0.5 rounded-md ${
                 metric.trend === 'down' && metric.label.includes('CAC') ? 'bg-emerald-500/20 text-emerald-400' :
                 metric.trend === 'up' && !metric.label.includes('Burn') ? 'bg-emerald-500/20 text-emerald-400' :
                 'bg-white/5 text-slate-400'
               }`}>
                 {metric.trend === 'up' ? '↑ Increasing' : metric.trend === 'down' ? '↓ Optimizing' : '• Stable'}
               </span>
            </div>
            <p className="text-2xl font-black text-white italic tracking-tighter">{metric.value}</p>
            <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest mt-1">{metric.label}</p>
            <p className="text-[8px] font-bold text-slate-500 uppercase tracking-widest mt-1">{metric.subLabel}</p>
          </div>
        ))}
      </div>

      <div className="bg-black/40 rounded-[2rem] border border-white/5 p-6 relative z-10">
         <div className="flex items-center justify-between mb-4">
            <h4 className="text-[10px] font-black text-white/40 uppercase tracking-[0.3em]">Sentinel Burn Watcher</h4>
            <span className="text-[10px] font-black text-emerald-400 uppercase tracking-widest">Efficiency: 98.4%</span>
         </div>
         <div className="space-y-4">
            {[
               { name: 'Vercel Edge Runtime', usage: 74, limit: 100 },
               { name: 'Supabase DB Ops', usage: 22, limit: 100 },
               { name: 'Gemini 2.0 Tokens', usage: 45, limit: 100 },
            ].map(service => (
               <div key={service.name} className="space-y-1.5">
                  <div className="flex justify-between text-[8px] font-black uppercase tracking-widest">
                     <span className="text-slate-400">{service.name}</span>
                     <span className="text-white">{service.usage}%</span>
                  </div>
                  <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
                     <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${service.usage}%` }}
                        className={`h-full bg-linear-to-r ${service.usage > 80 ? 'from-rose-500 to-rose-400' : 'from-cyan-500 to-emerald-500'}`}
                     />
                  </div>
               </div>
            ))}
         </div>
      </div>

      <button className="w-full py-4 bg-white/5 hover:bg-white/10 border border-white/5 rounded-2xl text-[9px] font-black text-slate-400 uppercase tracking-[0.4em] transition-all flex items-center justify-center gap-2">
         <TrendingDown size={14} className="text-emerald-400" /> Generar Reporte de Optimización
      </button>
    </div>
  );
};
