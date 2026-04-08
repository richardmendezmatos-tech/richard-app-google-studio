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
import { DI } from '@/app/di/registry';
import { HoustonTelemetry } from '@/entities/houston/model/types';

export const HoustonDashboard: React.FC = () => {
  const [telemetry, setTelemetry] = useState<HoustonTelemetry | null>(null);
  
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
              Richard Intelligence • Sentinel N13
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

      {/* Main Grid: Telemetry + Terminal */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 relative">
        {/* Terminal Section */}
        <div className="lg:col-span-8">
          <HoustonTerminalLog events={telemetry.recentEvents} />
        </div>

        {/* Telemetry Section */}
        <div className="lg:col-span-4 grid grid-cols-1 gap-4">
          {/* Structural Health */}
          <div className="glass-premium p-4 border border-white/5 flex items-center justify-between group hover:border-primary/20 transition-all">
            <div className="flex items-center gap-4">
              <div className="p-2 bg-primary/10 rounded-xl">
                <ShieldCheck className="text-primary" size={18} />
              </div>
              <div>
                <div className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-0.5">
                  ESTADO ESTRUCTURAL
                </div>
                <div className="text-xl font-black text-white">{telemetry.metrics.structuralHealth.value} Integrity</div>
              </div>
            </div>
            <div className="w-16 h-1.5 bg-slate-900 rounded-full overflow-hidden">
              <div 
                ref={healthRef}
                className="h-full bg-primary transition-all duration-1000 shadow-[0_0_8px_rgba(var(--primary-rgb),0.5)]" 
              />
            </div>
          </div>

          {/* Database Latency (N13) */}
          <div className="glass-premium p-4 border border-white/5 flex items-center justify-between group hover:border-cyan-500/20 transition-all">
            <div className="flex items-center gap-4">
              <div className="p-2 bg-cyan-500/10 rounded-xl">
                <Zap className="text-cyan-400" size={18} />
              </div>
              <div>
                <div className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-0.5">
                  LATENCIA DB (REAL-TIME)
                </div>
                <div className="text-xl font-black text-white">{telemetry.metrics.dbLatency.value}{telemetry.metrics.dbLatency.unit}</div>
              </div>
            </div>
            <div className="flex gap-0.5 items-end h-6">
              {[1, 2, 3, 4, 5, 6, 7].map((i) => {
                const latencyValue = typeof telemetry.metrics.dbLatency.value === 'number' ? telemetry.metrics.dbLatency.value : 10;
                const active = i <= (latencyValue < 50 ? 5 : 2);
                return (
                  <div
                    key={i}
                    className={`w-1 rounded-full transition-all duration-500 ${active ? 'bg-cyan-500' : 'bg-slate-800'}`}
                    style={{ height: `${20 + (i * 10)}%` }}
                  />
                );
              })}
            </div>
          </div>

          {/* Circuit Breakers (N13) */}
          <div className="glass-premium p-4 border border-white/5 flex items-center justify-between group hover:border-amber-500/20 transition-all">
            <div className="flex items-center gap-4">
              <div className="p-2 bg-amber-500/10 rounded-xl">
                <CircleDot className="text-amber-400" size={18} />
              </div>
              <div>
                <div className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-0.5">
                  CIRCUIT BREAKERS
                </div>
                <div className="text-xl font-black text-white">
                  {telemetry.metrics.activeBreakers.value} <span className="text-[10px] text-slate-500">ACTIVE</span>
                </div>
              </div>
            </div>
            <div className={`w-2 h-2 rounded-full ${telemetry.metrics.activeBreakers.value === 0 ? 'bg-emerald-500' : 'bg-amber-500'} animate-pulse`} />
          </div>

          {/* AI Inference Latency (N14) */}
          <div className="glass-premium p-4 border border-indigo-500/10 flex items-center justify-between group hover:border-indigo-500/20 transition-all">
            <div className="flex items-center gap-4">
              <div className="p-2 bg-indigo-500/10 rounded-xl">
                <Brain className="text-indigo-400" size={18} />
              </div>
              <div>
                <div className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-0.5">
                  IA INFERENCE (N14)
                </div>
                <div className="text-xl font-black text-white">
                  {telemetry.metrics.inferenceLatency.value} <span className="text-[10px] text-slate-500">{telemetry.metrics.inferenceLatency.unit}</span>
                </div>
              </div>
            </div>
            <Activity className="text-indigo-500/40 animate-pulse" size={16} />
          </div>

          {/* Lead Velocity (N14) */}
          <div className="glass-premium p-4 border border-blue-500/10 flex items-center justify-between group hover:border-blue-500/20 transition-all">
            <div className="flex items-center gap-4">
              <div className="p-2 bg-blue-500/10 rounded-xl">
                <TrendingUp className="text-blue-400" size={18} />
              </div>
              <div>
                <div className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-0.5">
                  LEAD VELOCITY (REAL)
                </div>
                <div className="text-xl font-black text-white">
                  {telemetry.metrics.leadVelocity.value} <span className="text-[10px] text-slate-500">{telemetry.metrics.leadVelocity.unit}</span>
                </div>
              </div>
            </div>
            <div className={`w-2 h-2 rounded-full ${telemetry.metrics.leadVelocity.status === 'healthy' ? 'bg-emerald-500' : 'bg-amber-500'} animate-pulse`} />
          </div>

          {/* Closure Probability (N14) */}
          <div className="glass-premium p-4 border border-purple-500/10 flex items-center justify-between group hover:border-purple-500/20 transition-all">
            <div className="flex items-center gap-4">
              <div className="p-2 bg-purple-500/10 rounded-xl">
                <Target className="text-purple-400" size={18} />
              </div>
              <div>
                <div className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-0.5">
                  CLOSURE PROBABILITY
                </div>
                <div className="text-xl font-black text-white">
                  {telemetry.metrics.closureProbability.value}{telemetry.metrics.closureProbability.unit}
                </div>
              </div>
            </div>
            <Activity className="text-purple-500/40 animate-pulse" size={16} />
          </div>

          <BusinessHealthWidget />

          {/* Repository Integrity Grid (N14) */}
          <div className="glass-premium p-6 border border-white/5 group hover:border-emerald-500/20 transition-all">
            <div className="text-[10px] font-black text-primary uppercase tracking-[0.3em] mb-4 flex items-center gap-2">
              <Layers size={14} /> REPOSITORY INTEGRITY GRID
            </div>
            <div className="grid grid-cols-3 gap-4">
              {[
                { label: 'Inventory', value: 99.8, color: 'text-cyan-400' },
                { label: 'Leads', value: 98.5, color: 'text-emerald-400' },
                { label: 'Finance', value: 100, color: 'text-purple-400' }
              ].map((repo) => (
                <div key={repo.label} className="flex flex-col items-center">
                  <div className="relative w-12 h-12 flex items-center justify-center mb-2">
                    <svg className="w-full h-full -rotate-90">
                      <circle
                        cx="24" cy="24" r="20"
                        stroke="currentColor"
                        strokeWidth="3"
                        fill="transparent"
                        className="text-slate-800"
                      />
                      <circle
                        cx="24" cy="24" r="20"
                        stroke="currentColor"
                        strokeWidth="3"
                        fill="transparent"
                        strokeDasharray={126}
                        strokeDashoffset={126 - (126 * repo.value) / 100}
                        className={repo.color}
                      />
                    </svg>
                    <span className="absolute text-[9px] font-bold text-white">{Math.floor(repo.value)}%</span>
                  </div>
                  <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest">{repo.label}</span>
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
              NIVEL 14 • STRUCTURAL OBSERVABILITY
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
