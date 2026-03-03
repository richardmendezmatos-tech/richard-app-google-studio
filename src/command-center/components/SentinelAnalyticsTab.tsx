import React from 'react';
import { motion } from 'framer-motion';
import { Zap, Activity, DollarSign } from 'lucide-react';
import { Car, Lead } from '@/domain/entities';
import { InventoryHeatmap } from '@/features/inventory/ui/InventoryHeatmap';
import { LeadSourceChart } from './LeadSourceChart';
import { ConversionFunnel } from './ConversionFunnel';
import { InventoryFinancialsChart } from './InventoryFinancialsChart';

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
      {/* Row 1: Quick Stats & Heatmap */}
      <div className="bg-white/5 backdrop-blur-md rounded-[2rem] p-8 border border-white/10 shadow-xl">
        <InventoryHeatmap inventory={inventory} />
      </div>

      {/* Row 2: Lead Intelligence */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="glass-premium p-8 rounded-[2.5rem] border border-white/10">
          <h3 className="text-xl font-black text-white uppercase tracking-tighter mb-6 flex items-center gap-2">
            <Zap className="text-[#00aed9]" size={20} /> Origen de Leads
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
