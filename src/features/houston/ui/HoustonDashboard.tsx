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
  Server
} from 'lucide-react';
import styles from './HoustonDashboard.module.css';

export const HoustonDashboard: React.FC = () => {
  const [metrics, setMetrics] = React.useState({
    systemHealth: 98,
    connectivity: 'stable',
    activeNodes: 4,
    apiLatency: 12,
    securityScore: 100
  });

  // Simulamos telemetría en tiempo real para dar vida al dashboard
  React.useEffect(() => {
    const interval = setInterval(() => {
      setMetrics(prev => ({
        ...prev,
        apiLatency: Math.floor(Math.random() * (15 - 8 + 1) + 8),
        systemHealth: Math.random() > 0.9 ? 97 : 98
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
        <div className="flex items-center gap-4">
          <div className="p-3 bg-cyan-500/10 rounded-2xl border border-cyan-500/20">
            <Activity className="text-cyan-400 animate-kinetic-pulse" size={24} />
          </div>
          <div>
            <h3 className="text-xs font-black text-cyan-500 uppercase tracking-[0.2em] mb-1">
              Mission Control
            </h3>
            <h2 className="text-2xl font-black text-white tracking-tight">
              Houston <span className="text-cyan-400">Command Center</span>
            </h2>
          </div>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 bg-slate-900/50 rounded-full border border-white/5 ring-1 ring-white/5">
          <div className="w-2 h-2 rounded-full bg-cyan-500 animate-ping" />
          <span className="text-[10px] font-bold text-cyan-400 uppercase tracking-widest">
            En Vivo 24/7
          </span>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 relative">
        
        {/* Metric 1: System Health */}
        <div className="glass-premium p-6 border border-white/5 hover:border-cyan-500/30 transition-all duration-500">
          <div className="flex justify-between items-start mb-4">
            <ShieldCheck className="text-cyan-400" size={20} />
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Estado</span>
          </div>
          <div className="text-3xl font-black text-white mb-2">{metrics.systemHealth}%</div>
          <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
            <div 
              className={`h-full bg-gradient-to-r from-cyan-500 to-indigo-500 transition-all duration-1000 ${styles.healthBar}`} 
              style={{ '--health-width': `${metrics.systemHealth}%` } as React.CSSProperties} 
            />
          </div>
          <div className="mt-2 text-[10px] font-bold text-cyan-500/60 uppercase">Estructura Óptima</div>
        </div>

        {/* Metric 2: API Latency */}
        <div className="glass-premium p-6 border border-white/5 hover:border-indigo-500/30 transition-all duration-500">
          <div className="flex justify-between items-start mb-4">
            <Zap className="text-indigo-400" size={20} />
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Latencia</span>
          </div>
          <div className="text-3xl font-black text-white mb-2">{metrics.apiLatency}ms</div>
          <div className="flex items-center gap-1">
            {[1,2,3,4,5,6,7,8,9,10].map(i => (
              <div 
                key={i} 
                className={`w-1 h-3 rounded-full transition-all duration-300 ${i <= metrics.apiLatency/1.5 ? 'bg-indigo-500' : 'bg-slate-800'}`} 
              />
            ))}
          </div>
          <div className="mt-2 text-[10px] font-bold text-indigo-500/60 uppercase">Respuesta en milisegundos</div>
        </div>

        {/* Metric 3: Security */}
        <div className="glass-premium p-6 border border-white/5 hover:border-emerald-500/30 transition-all duration-500">
          <div className="flex justify-between items-start mb-4">
            <Lock className="text-emerald-400" size={20} />
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Seguridad</span>
          </div>
          <div className="text-3xl font-black text-white mb-2">{metrics.securityScore}%</div>
          <div className="text-[10px] font-bold text-emerald-500/80 uppercase flex items-center gap-1">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            Encriptación de Máxima Precisión
          </div>
          <div className="mt-3 text-[10px] text-slate-500 font-medium leading-relaxed">
            Protección activa contra intrusiones y fuga de datos.
          </div>
        </div>

        {/* Metric 4: Multi-Tenant Sync */}
        <div className="glass-premium p-6 border border-white/5 hover:border-amber-500/30 transition-all duration-500">
          <div className="flex justify-between items-start mb-4">
            <RefreshCcw className="text-amber-400 animate-spin-slow" size={20} />
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Sinc</span>
          </div>
          <div className="text-3xl font-black text-white mb-2">Sync</div>
          <div className="flex items-center gap-2">
            <Wifi size={14} className="text-amber-500/50" />
            <span className="text-[10px] font-bold text-amber-500/80 uppercase">Firebase Realtime</span>
          </div>
          <div className="mt-3 grid grid-cols-4 gap-1">
            {[1,2,3,4].map(i => (
              <div key={i} className="h-1 bg-amber-500/40 rounded-full" />
            ))}
          </div>
        </div>

      </div>

      {/* Footer / Status Bar */}
      <div className="mt-8 pt-6 border-t border-white/5 flex flex-wrap items-center justify-between gap-6 relative">
        <div className="flex items-center gap-8">
          <div className="flex items-center gap-2">
            <Server size={14} className="text-slate-500" />
            <span className="text-[10px] font-bold text-slate-400 uppercase">Nodo: </span>
            <span className="text-[10px] font-black text-cyan-400 uppercase tracking-widest">US-EAST-1</span>
          </div>
          <div className="flex items-center gap-2">
            <Globe size={14} className="text-slate-500" />
            <span className="text-[10px] font-bold text-slate-400 uppercase">Tráfico: </span>
            <span className="text-[10px] font-black text-white uppercase tracking-widest">Global CDN</span>
          </div>
        </div>
        <div className="flex items-center gap-2 text-[10px] font-black text-slate-500 uppercase tracking-[0.3em]">
          <Database size={14} /> RA OS CORE v.4.2
        </div>
      </div>
    </div>
  );
};
