import React from 'react';
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
} from 'lucide-react';
import styles from './HoustonDashboard.module.css';
import { HoustonTerminalLog } from './components/HoustonTerminalLog';

export const HoustonDashboard: React.FC = () => {
  const [metrics, setMetrics] = React.useState({
    systemHealth: 98,
    connectivity: 'stable',
    activeNodes: 4,
    apiLatency: 12,
    securityScore: 100,
  });

  // Simulamos telemetría en tiempo real para dar vida al dashboard
  React.useEffect(() => {
    const interval = setInterval(() => {
      setMetrics((prev) => ({
        ...prev,
        apiLatency: Math.floor(Math.random() * (15 - 8 + 1) + 8),
        systemHealth: Math.random() > 0.9 ? 97 : 98,
      }));
    }, 3000);
    return () => clearInterval(interval);
  }, []);

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
              Richard Intelligence
            </h3>
            <h2 className="text-3xl font-black text-white tracking-tighter">
              Houston <span className="text-primary/70">Terminal</span>
            </h2>
          </div>
        </div>
        <div className="hidden sm:flex items-center gap-3 px-5 py-2.5 bg-slate-950/50 rounded-2xl border border-white/5 shadow-2xl backdrop-blur-3xl">
          <div className="w-2 h-2 rounded-full bg-emerald-500 animate-ping shadow-[0_0_10px_rgba(16,185,129,0.5)]" />
          <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest leading-none">
            RA SYNC: <span className="text-emerald-500">OPTIMAL</span>
          </span>
        </div>
      </div>

      {/* Main Grid */}
      {/* Main Grid: Telemetry + Terminal */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 relative">
        {/* Terminal Section */}
        <div className="lg:col-span-8">
          <HoustonTerminalLog />
        </div>

        {/* Telemetry Section */}
        <div className="lg:col-span-4 grid grid-cols-1 gap-4">
          <div className="glass-premium p-4 border border-white/5 flex items-center justify-between group hover:border-primary/20 transition-all">
            <div className="flex items-center gap-4">
              <div className="p-2 bg-primary/10 rounded-xl">
                <ShieldCheck className="text-primary" size={18} />
              </div>
              <div>
                <div className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-0.5">
                  ESTADO
                </div>
                <div className="text-xl font-black text-white">{metrics.systemHealth}% Health</div>
              </div>
            </div>
            <div className="w-16 h-1.5 bg-slate-900 rounded-full overflow-hidden">
              <div className="h-full bg-primary" style={{ width: `${metrics.systemHealth}%` }} />
            </div>
          </div>

          <div className="glass-premium p-4 border border-white/5 flex items-center justify-between group hover:border-cyan-500/20 transition-all">
            <div className="flex items-center gap-4">
              <div className="p-2 bg-cyan-500/10 rounded-xl">
                <Zap className="text-cyan-400" size={18} />
              </div>
              <div>
                <div className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-0.5">
                  LATENCIA
                </div>
                <div className="text-xl font-black text-white">{metrics.apiLatency}ms</div>
              </div>
            </div>
            <div className="flex gap-0.5">
              {[1, 2, 3, 4, 5].map((i) => (
                <div
                  key={i}
                  className={`w-1 h-3 rounded-full ${i <= 3 ? 'bg-cyan-500' : 'bg-slate-800'}`}
                />
              ))}
            </div>
          </div>

          <div className="glass-premium p-4 border border-white/5 flex items-center justify-between group hover:border-emerald-500/20 transition-all">
            <div className="flex items-center gap-4">
              <div className="p-2 bg-emerald-500/10 rounded-xl">
                <Lock className="text-emerald-400" size={18} />
              </div>
              <div>
                <div className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-0.5">
                  SEGURIDAD
                </div>
                <div className="text-xl font-black text-white">ACTIVE</div>
              </div>
            </div>
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_10px_rgba(16,185,129,0.5)]" />
          </div>
        </div>
      </div>

      {/* Footer / Status Bar */}
      <div className="mt-8 pt-6 border-t border-white/5 flex flex-wrap items-center justify-between gap-6 relative">
        <div className="flex items-center gap-8">
          <div className="flex items-center gap-2">
            <Server size={14} className="text-slate-500" />
            <span className="text-[10px] font-bold text-slate-400 uppercase">Nodo: </span>
            <span className="text-[10px] font-black text-cyan-400 uppercase tracking-widest">
              US-EAST-1
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Globe size={14} className="text-slate-500" />
            <span className="text-[10px] font-bold text-slate-400 uppercase">Tráfico: </span>
            <span className="text-[10px] font-black text-white uppercase tracking-widest">
              Global CDN
            </span>
          </div>
        </div>
        <div className="flex items-center gap-2 text-[10px] font-black text-slate-500 uppercase tracking-[0.3em]">
          <Database size={14} /> RA OS CORE v.4.2
        </div>
      </div>
    </div>
  );
};
