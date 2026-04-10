import React, { useLayoutEffect, useRef, useState, useEffect } from 'react';
import {
  ShieldCheck,
  Zap,
  Activity,
  Database,
  Globe,
  Lock,
  RefreshCcw,
  Wifi,
  Server,
  Terminal,
  Brain,
  Layers,
  CircleDot,
  TrendingUp,
  BarChart,
  Target,
} from 'lucide-react';
import styles from './HoustonDashboard.module.css';
import { HoustonTerminalLog } from './components/HoustonTerminalLog';
import { BusinessHealthWidget } from './components/BusinessHealthWidget';
import { LeadIntelligenceWidget } from './components/LeadIntelligenceWidget';
import { NeuralSearchTicker } from './components/NeuralSearchTicker';
import { WhatsAppOperationsHUD } from './components/WhatsAppOperationsHUD';
import { DI } from '@/app/di/registry';
import { HoustonTelemetry } from '@/entities/houston/model/types';
import { useBusinessTelemetry } from '@/entities/houston/api/useBusinessTelemetry';

export const HoustonDashboard: React.FC = () => {
  const [telemetry, setTelemetry] = useState<HoustonTelemetry | null>(null);
  const { businessData, loading: bizLoading } = useBusinessTelemetry();
  
  // Real-time Telemetry Subscription (Nivel 13)
  useEffect(() => {
    const unsub = DI.getHoustonTelemetryUseCase().subscribe((data: HoustonTelemetry) => {
      setTelemetry(data);
    });
    return () => unsub();
  }, []);

  const healthRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    if (healthRef.current && telemetry) {
      // Use structural health percentage if available, otherwise fallback
      const healthValue = typeof telemetry.metrics.structuralHealth.value === 'string' 
        ? parseInt(telemetry.metrics.structuralHealth.value) 
        : telemetry.metrics.structuralHealth.value;
      healthRef.current.style.width = `${healthValue}%`;
    }
  }, [telemetry]);

  if (!telemetry) {
    return (
      <div className="p-8 bg-slate-950/40 backdrop-blur-xl border border-cyan-500/20 rounded-[2.5rem] flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-4">
          <Brain className="text-primary animate-pulse" size={48} />
          <span className="text-[10px] font-black text-primary uppercase tracking-[0.4em]">Initializing Houston Systems...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 bg-slate-950/40 backdrop-blur-xl border border-cyan-500/20 rounded-[2.5rem] shadow-2xl shadow-cyan-500/5 relative overflow-hidden group">
      {/* Background Glows */}
      <div className="absolute -top-24 -right-24 w-64 h-64 bg-cyan-600/10 rounded-full blur-[100px] animate-pulse" />
      <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-indigo-600/10 rounded-full blur-[100px] animate-pulse" />

      {/* Header */}
      <div className="flex items-center justify-between mb-8 relative">
        <div className="flex items-center gap-5">
          <div className="p-4 bg-primary/10 rounded-[1.5rem] border border-primary/20 shadow-[0_0_20px_rgba(var(--primary-rgb),0.1)]">
            <Brain className="text-primary animate-pulse" size={28} />
          </div>
          <div>
            <h3 className="text-[10px] font-black text-primary uppercase tracking-[0.3em] mb-1">
              Richard Intelligence • Sentinel N15
            </h3>
            <h2 className="text-3xl font-black text-white tracking-tighter">
              Houston <span className="text-primary/70">Terminal</span>
            </h2>
          </div>
        </div>
        <div className="hidden sm:flex items-center gap-3 px-5 py-2.5 bg-slate-950/50 rounded-2xl border border-white/5 shadow-2xl backdrop-blur-3xl">
          <div className={`w-2 h-2 rounded-full ${telemetry.systemHealth === 'online' ? 'bg-emerald-500' : 'bg-amber-500'} animate-ping shadow-[0_0_10px_rgba(16,185,129,0.5)]`} />
          <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest leading-none">
            RA SYNC: <span className={telemetry.systemHealth === 'online' ? 'text-emerald-500' : 'text-amber-500'}>
              {telemetry.systemHealth.toUpperCase()}
            </span>
          </span>
        </div>
      </div>

      {/* Main Grid: Dual Pulse Interface */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 relative">
        
        {/* COL LEFT: Strategic Intelligence (N15) */}
        <div className="lg:col-span-4 flex flex-col gap-6">
          <div className="flex items-center gap-2 mb-2 border-l-2 border-primary pl-3">
             <Brain size={16} className="text-primary" />
             <span className="text-[10px] font-black text-white uppercase tracking-[0.4em]">Strategic Intelligence</span>
          </div>
          
          <LeadIntelligenceWidget leads={businessData?.hotLeads} />
          <NeuralSearchTicker gaps={businessData?.searchGaps} />
          
          <div className="grid grid-cols-2 gap-4">
             <div className="glass-premium p-4 border border-white/5">
                <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest mb-1">Leads 24h</p>
                <p className="text-2xl font-black text-white">{businessData?.summary.leads_last_24h || 0}</p>
             </div>
             <div className="glass-premium p-4 border border-white/5">
                <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest mb-1">Avg Score</p>
                <p className="text-2xl font-black text-primary">{businessData?.summary.avg_score || 0}%</p>
             </div>
          </div>
        </div>

        {/* COL CENTER: Neural Operations (Technical) */}
        <div className="lg:col-span-5 flex flex-col gap-6">
           <div className="flex items-center gap-2 mb-2">
              <Layers size={16} className="text-cyan-400" />
              <span className="text-[10px] font-black text-white uppercase tracking-[0.4em]">Neural Operations</span>
           </div>
           
           <HoustonTerminalLog events={telemetry.recentEvents} />
           <WhatsAppOperationsHUD stats={businessData?.whatsappStats} />
           
           <BusinessHealthWidget />
        </div>

        {/* COL RIGHT: System Telemetry (Sentinel) */}
        <div className="lg:col-span-3 flex flex-col gap-4">
          <div className="flex items-center gap-2 mb-2">
             <Activity size={16} className="text-indigo-400" />
             <span className="text-[10px] font-black text-white uppercase tracking-[0.4em]">System Telemetry</span>
          </div>

          {/* Structural Health */}
          <div className="glass-premium p-4 border border-white/5 flex flex-col gap-3 group hover:border-primary/20 transition-all">
            <div className="flex items-center justify-between">
              <div className="text-[9px] font-black text-slate-500 uppercase tracking-widest">
                Integrity
              </div>
              <ShieldCheck className="text-primary" size={14} />
            </div>
            <div className="flex items-baseline gap-2">
               <div className="text-2xl font-black text-white">{telemetry.metrics.structuralHealth.value}</div>
               <div className="text-[8px] text-slate-500 font-bold uppercase tracking-widest">Global</div>
            </div>
            <div className="w-full h-1 bg-slate-900 rounded-full overflow-hidden">
              <div 
                ref={healthRef}
                className="h-full bg-primary transition-all duration-1000 shadow-[0_0_8px_rgba(var(--primary-rgb),0.5)]" 
              />
            </div>
          </div>

          {/* Performance Overlay (RUM) */}
          <div className="glass-premium p-6 border border-cyan-500/10 group hover:border-cyan-500/20 transition-all">
            <div className="text-[10px] font-black text-cyan-400 uppercase tracking-[0.3em] mb-6 flex items-center justify-between">
              <span>Performance</span>
              <Wifi size={14} className="animate-pulse" />
            </div>
            <div className="space-y-6">
              <div>
                <div className="flex justify-between text-[8px] font-black text-slate-500 uppercase tracking-widest mb-2">
                  <span>LCP</span>
                  <span className={telemetry.metrics.lcp.status === 'healthy' ? 'text-emerald-400' : 'text-amber-400'}>
                    {telemetry.metrics.lcp.value}{telemetry.metrics.lcp.unit || 'ms'}
                  </span>
                </div>
                <div className="h-0.5 bg-slate-900 rounded-full overflow-hidden">
                  <div 
                    className={`h-full transition-all duration-1000 ${telemetry.metrics.lcp.status === 'healthy' ? 'bg-emerald-500' : 'bg-amber-500'}`}
                    style={{ width: `${Math.min(100, (2500 / (Number(telemetry.metrics.lcp.value) || 2500)) * 100)}%` }}
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 bg-slate-950/50 rounded-2xl border border-white/5 text-center">
                  <div className="text-[7px] font-black text-slate-500 uppercase tracking-widest mb-1">FID</div>
                  <div className="text-lg font-black text-white">{telemetry.metrics.fid.value}ms</div>
                </div>
                <div className="p-3 bg-slate-950/50 rounded-2xl border border-white/5 text-center">
                  <div className="text-[7px] font-black text-slate-500 uppercase tracking-widest mb-1">CLS</div>
                  <div className="text-lg font-black text-white">{telemetry.metrics.cls.value}</div>
                </div>
              </div>
            </div>
          </div>

          {/* AI Latency */}
          <div className="glass-premium p-4 border border-indigo-500/10 flex items-center justify-between group hover:border-indigo-500/20 transition-all">
            <div>
               <div className="text-[9px] font-black text-slate-500 uppercase tracking-[0.2em] mb-1">IA INFERENCE</div>
               <div className="text-xl font-black text-white">{telemetry.metrics.inferenceLatency.value}{telemetry.metrics.inferenceLatency.unit}</div>
            </div>
            <Brain className="text-indigo-400/40" size={20} />
          </div>

          {/* Repository Integrity (Compact) */}
          <div className="glass-premium p-4 border border-white/5">
            <div className="text-[10px] font-black text-primary uppercase tracking-[0.3em] mb-3">Integrity Grid</div>
            <div className="flex justify-between">
              {['Inv', 'Lead', 'Fin'].map((label) => (
                <div key={label} className="w-10 h-10 rounded-full border-2 border-slate-900 flex items-center justify-center relative">
                   <div className="absolute inset-0 rounded-full border-2 border-primary/30 border-t-primary animate-spin" style={{ animationDuration: '3s' }} />
                   <span className="text-[8px] font-black text-white">{label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Footer / Status Bar */}
      <div className="mt-8 pt-6 border-t border-white/5 flex flex-wrap items-center justify-between gap-6 relative">
        <div className="flex items-center gap-8">
          <div className="flex items-center gap-2">
            <Server size={14} className="text-slate-500" />
            <span className="text-[10px] font-bold text-slate-400 uppercase">Nodo Core: </span>
            <span className="text-[10px] font-black text-cyan-400 uppercase tracking-widest">
              SENTINEL-AP-01
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Globe size={14} className="text-slate-500" />
            <span className="text-[10px] font-bold text-slate-400 uppercase">Estado: </span>
            <span className="text-[10px] font-black text-white uppercase tracking-widest">
              NIVEL 15 • ZERO-GRAVITY PERFORMANCE
            </span>
          </div>
        </div>
        <div className="flex items-center gap-2 text-[10px] font-black text-slate-500 uppercase tracking-[0.3em]">
          <Database size={14} /> RA COMMAND CENTER v.4.5_N13
        </div>
      </div>
    </div>
  );
};
