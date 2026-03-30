import React from 'react';
import { motion } from 'motion/react';
import { Zap, Activity, DollarSign } from 'lucide-react';
import { Car, Lead } from '@/entities/shared';
import { InventoryHeatmap } from '@/features/inventory';
import { LeadSourceChart } from './LeadSourceChart';
import { ConversionFunnel } from './ConversionFunnel';
import { InventoryFinancialsChart } from './InventoryFinancialsChart';

// Extra Icon for KPI
import { TrendingUp, Award, Target } from 'lucide-react';

interface Props {
  inventory: Car[];
  leads: Lead[];
}

export const SentinelAnalyticsTab: React.FC<Props> = ({ inventory, leads }) => {
  return (
    <motion.div
      key="analytics"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.2 }}
      className="space-y-8"
    >
      {/* Row 0: High-Level Business KPIs (Fase 17) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="glass-premium p-6 rounded-[2rem] border border-emerald-500/20 shadow-[0_0_15px_rgba(16,185,129,0.1)] relative overflow-hidden group">
          <div className="absolute -right-4 -top-4 w-24 h-24 bg-emerald-500/10 rounded-full blur-2xl group-hover:bg-emerald-500/20 transition-all" />
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-emerald-500/10 rounded-xl">
              <Award className="text-emerald-400" size={20} />
            </div>
            <h4 className="text-sm font-bold text-slate-400 uppercase tracking-widest">
              Cierres Mensuales
            </h4>
          </div>
          <div className="text-3xl font-black text-white mt-4 flex items-baseline gap-2">
            {leads.filter((l) => l.status === 'sold').length}{' '}
            <span className="text-sm text-emerald-500 font-bold uppercase">unidades</span>
          </div>
        </div>

        <div className="glass-premium p-6 rounded-[2rem] border border-blue-500/20 shadow-[0_0_15px_rgba(59,130,246,0.1)] relative overflow-hidden group">
          <div className="absolute -right-4 -top-4 w-24 h-24 bg-blue-500/10 rounded-full blur-2xl group-hover:bg-blue-500/20 transition-all" />
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-blue-500/10 rounded-xl">
              <TrendingUp className="text-blue-400" size={20} />
            </div>
            <h4 className="text-sm font-bold text-slate-400 uppercase tracking-widest">
              ROI Estimado (Ads)
            </h4>
          </div>
          <div className="text-3xl font-black text-white mt-4 flex items-baseline gap-2">
            345<span className="text-sm text-blue-500 font-bold">%</span>
          </div>
        </div>

        <div className="glass-premium p-6 rounded-[2rem] border border-purple-500/20 shadow-[0_0_15px_rgba(168,85,247,0.1)] relative overflow-hidden group">
          <div className="absolute -right-4 -top-4 w-24 h-24 bg-purple-500/10 rounded-full blur-2xl group-hover:bg-purple-500/20 transition-all" />
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-purple-500/10 rounded-xl">
              <Target className="text-purple-400" size={20} />
            </div>
            <h4 className="text-sm font-bold text-slate-400 uppercase tracking-widest">
              Proyección Ingresos
            </h4>
          </div>
          <div className="text-3xl font-black text-white mt-4 flex items-baseline gap-2">
            $
            {(inventory.reduce((sum, c) => sum + (Number(c.price) || 0), 0) * 0.15).toLocaleString(
              'en-US',
            )}
            <span className="text-sm text-purple-500 font-bold uppercase">GP</span>
          </div>
        </div>
      </div>

      {/* Row 1: Quick Stats & Heatmap */}
      <div className="bg-white/5 backdrop-blur-md rounded-[2rem] p-8 border border-white/10 shadow-xl">
        <InventoryHeatmap inventory={inventory} />
      </div>

      {/* Row 2: Lead Intelligence */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="glass-premium p-8 rounded-[2.5rem] border border-white/10">
          <h3 className="text-xl font-black text-white uppercase tracking-tighter mb-6 flex items-center gap-2">
            <Zap className="text-primary" size={20} /> Origen de Leads
          </h3>
          <LeadSourceChart leads={leads} />
        </div>
        <div className="glass-premium p-8 rounded-[2.5rem] border border-white/10">
          <h3 className="text-xl font-black text-white uppercase tracking-tighter mb-6 flex items-center gap-2">
            <Activity className="text-purple-500" size={20} /> Embudo de Conversión
          </h3>
          <ConversionFunnel leads={leads} />
        </div>
      </div>

      {/* Row 3: Financial Performance */}
      <div className="glass-premium p-8 rounded-[2.5rem] border border-white/10">
        <h3 className="text-xl font-black text-white uppercase tracking-tighter mb-6 flex items-center gap-2">
          <DollarSign className="text-emerald-500" size={20} /> Rendimiento de Unidades
        </h3>
        <InventoryFinancialsChart inventory={inventory} />
      </div>
    </motion.div>
  );
};
