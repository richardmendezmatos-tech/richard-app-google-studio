import React from 'react';
import { motion } from 'framer-motion';
import { Shield, Zap, Activity, Cpu, Globe, AlertTriangle } from 'lucide-react';
import { HoustonTelemetry } from '../model/hooks/useTelemetry';

interface HoustonDashboardProps {
  telemetry: HoustonTelemetry;
}

export const HoustonDashboard: React.FC<HoustonDashboardProps> = ({ telemetry }) => {
  const isOptimal = telemetry.status === 'optimal';

  return (
    <div className="p-6 space-y-6 bg-slate-900/40 backdrop-blur-xl border border-white/10 rounded-3xl overflow-hidden relative shadow-2xl">
      {/* Background Glow */}
      <div className={`absolute -top-24 -right-24 w-48 h-48 rounded-full blur-[80px] transition-colors duration-1000 ${isOptimal ? 'bg-cyan-500/20' : 'bg-red-500/20'}`}></div>

      <header className="flex items-center justify-between relative z-10">
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-xl ${isOptimal ? 'bg-cyan-500/20 text-cyan-400' : 'bg-red-500/20 text-red-400'} border border-current/20`}>
            <Shield size={20} className={isOptimal ? 'animate-pulse' : ''} />
          </div>
          <div>
            <h3 className="text-white font-black tracking-tight text-lg">HOUSTON_CENTRAL</h3>
            <p className="text-[10px] text-slate-400 font-mono uppercase tracking-[0.2em]">Live Telemetry Feed</p>
          </div>
        </div>
        <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10">
          <div className={`w-1.5 h-1.5 rounded-full ${isOptimal ? 'bg-green-500 shadow-[0_0_8px_#22c55e]' : 'bg-red-500 animate-ping'}`}></div>
          <span className="text-[10px] text-slate-300 font-bold uppercase">{telemetry.status}</span>
        </div>
      </header>

      <div className="grid grid-cols-2 gap-4 relative z-10">
        {/* Latency Card */}
        <MetricCard
          icon={<Zap size={14} />}
          label="Latency"
          value={`${telemetry.latency}ms`}
          subValue="Optimal Edge Response"
          color="cyan"
          progress={Math.max(0, 100 - (telemetry.latency / 2))}
        />

        {/* Security / Paz Mental Card */}
        <MetricCard
          icon={<Shield size={14} />}
          label="Paz Mental"
          value={`${telemetry.securityScore}%`}
          subValue="Risk Mitigation Active"
          color="indigo"
          progress={telemetry.securityScore}
        />

        {/* Quality Card */}
        <MetricCard
          icon={<Activity size={14} />}
          label="Signal Quality"
          value={`${telemetry.quality}%`}
          subValue="Connection Stability"
          color="emerald"
          progress={telemetry.quality}
        />

        {/* Packet Loss Card */}
        <MetricCard
          icon={<Globe size={14} />}
          label="Integrity"
          value={telemetry.packetLoss === 0 ? 'Pure' : 'Lossy'}
          subValue={telemetry.packetLoss === 0 ? 'No Data Drops' : `${telemetry.packetLoss}% Drops`}
          color={telemetry.packetLoss === 0 ? 'cyan' : 'red'}
          progress={100 - (telemetry.packetLoss * 10)}
        />
      </div>

      {/* AI Hub Status Bar */}
      <footer className="pt-4 border-t border-white/5 relative z-10">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[9px] text-slate-500 font-bold uppercase tracking-widest flex items-center gap-1">
            <Cpu size={10} /> AI_CORE_PROCESSING
          </span>
          <span className="text-[9px] text-cyan-400 font-mono">STANDBY_IDLE</span>
        </div>
        <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
          <motion.div
            initial={{ width: "20%" }}
            animate={{ width: ["20%", "60%", "20%"] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            className="h-full bg-cyan-500 shadow-[0_0_10px_#06b6d4]"
          />
        </div>
      </footer>
      
      {!isOptimal && (
        <div className="absolute inset-0 bg-red-900/10 pointer-events-none animate-pulse"></div>
      )}
    </div>
  );
};

const MetricCard = ({ 
  icon, 
  label, 
  value, 
  subValue, 
  color, 
  progress 
}: { 
  icon: React.ReactNode; 
  label: string; 
  value: string; 
  subValue: string; 
  color: 'cyan' | 'indigo' | 'emerald' | 'red';
  progress: number;
}) => {
  const colorMap = {
    cyan: 'text-cyan-400 bg-cyan-400/10 border-cyan-400/20 shadow-cyan-500/5',
    indigo: 'text-indigo-400 bg-indigo-400/10 border-indigo-400/20 shadow-indigo-500/5',
    emerald: 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20 shadow-emerald-500/5',
    red: 'text-red-400 bg-red-400/10 border-red-400/20 shadow-red-500/5',
  };

  const progressColorMap = {
    cyan: 'bg-cyan-500',
    indigo: 'bg-indigo-500',
    emerald: 'bg-emerald-500',
    red: 'bg-red-500',
  };

  return (
    <div className={`p-4 rounded-2xl border transition-all duration-500 hover:border-white/20 group ${colorMap[color]}`}>
      <div className="flex items-center gap-2 mb-2">
        <span className="opacity-60 group-hover:opacity-100 transition-opacity">
          {icon}
        </span>
        <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 group-hover:text-slate-300 transition-colors">
          {label}
        </span>
      </div>
      <div className="text-xl font-black text-white mb-0.5 tracking-tight group-hover:scale-105 transition-transform origin-left">
        {value}
      </div>
      <div className="text-[9px] text-slate-500 truncate mb-3">
        {subValue}
      </div>
      <div className="h-0.5 w-full bg-white/5 rounded-full overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 1, ease: "easeOut" }}
          className={`h-full ${progressColorMap[color]}`}
        />
      </div>
    </div>
  );
};
