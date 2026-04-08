import React, { useLayoutEffect, useRef } from 'react';
import { Activity, TrendingUp, BarChart3, PieChart } from 'lucide-react';
import { useTelemetry } from '../../model/hooks/useTelemetry';

export const BusinessHealthWidget: React.FC = () => {
  const telemetry = useTelemetry('connected');

  const velocityRef = useRef<HTMLDivElement>(null);
  const closureRef = useRef<HTMLDivElement>(null);
  const turnoverRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    if (velocityRef.current) {
      velocityRef.current.style.width = `${(telemetry.metrics.leadVelocity.value as number / 5) * 100}%`;
    }
    if (closureRef.current) {
      closureRef.current.style.width = `${telemetry.metrics.closureProbability.value}%`;
    }
    if (turnoverRef.current) {
      turnoverRef.current.style.width = `${(1 - (telemetry.metrics.inventoryTurnover.value as number / 60)) * 100}%`;
    }
  }, [telemetry.metrics.leadVelocity, telemetry.metrics.closureProbability, telemetry.metrics.inventoryTurnover]);

  return (
    <div className="glass-premium p-6 border border-primary/20 bg-primary/5 flex flex-col gap-6 group hover:border-primary/40 transition-all">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary/20 rounded-xl">
            <Activity className="text-primary animate-pulse" size={20} />
          </div>
          <div>
            <div className="text-[10px] font-black text-primary uppercase tracking-widest">
              Nivel 14: Predictivo
            </div>
            <div className="text-xl font-black text-white tracking-tight">SALUD DEL NEGOCIO</div>
          </div>
        </div>
        <div className="text-right">
          <div className="text-3xl font-black text-white">{telemetry.businessHealthScore}%</div>
          <div className="text-[9px] font-bold text-emerald-400 uppercase tracking-widest">Optimal Flow</div>
        </div>
      </div>

      {/* Metric Grid */}
      <div className="grid grid-cols-2 gap-4">
        <div className="p-3 bg-slate-950/40 rounded-2xl border border-white/5 group/metric hover:bg-slate-900/60 transition-all">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp size={12} className="text-cyan-400" />
            <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Lead Velocity</span>
          </div>
          <div className="text-lg font-black text-white">{telemetry.metrics.leadVelocity.value} LPH</div>
          <div className="w-full h-1 bg-slate-800 rounded-full mt-2 overflow-hidden">
            <div 
              ref={velocityRef}
              className="h-full bg-cyan-500 transition-all duration-1000" 
            />
          </div>
        </div>

        <div className="p-3 bg-slate-950/40 rounded-2xl border border-white/5 group/metric hover:bg-slate-900/60 transition-all">
          <div className="flex items-center gap-2 mb-2">
            <PieChart size={12} className="text-emerald-400" />
            <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Closure Prob</span>
          </div>
          <div className="text-lg font-black text-white">{telemetry.metrics.closureProbability.value}%</div>
          <div className="w-full h-1 bg-slate-800 rounded-full mt-2 overflow-hidden">
            <div 
              ref={closureRef}
              className="h-full bg-emerald-500 transition-all duration-1000" 
            />
          </div>
        </div>

        <div className="p-3 bg-slate-950/40 rounded-2xl border border-white/5 group/metric hover:bg-slate-900/60 transition-all col-span-2">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <BarChart3 size={12} className="text-indigo-400" />
              <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Inventory Turnover (Predictive)</span>
            </div>
            <span className="text-[10px] font-black text-white">{telemetry.metrics.inventoryTurnover.value} Days</span>
          </div>
          <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
            <div 
              ref={turnoverRef}
              className="h-full bg-indigo-500 transition-all duration-1000 shadow-[0_0_10px_rgba(99,102,241,0.5)]" 
            />
          </div>
        </div>
      </div>
    </div>
  );
};
