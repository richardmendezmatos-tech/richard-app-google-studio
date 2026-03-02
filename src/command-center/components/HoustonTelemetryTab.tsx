import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import {
  Terminal,
  Activity,
  ShieldCheck,
  Database,
  Cpu,
  Zap,
  Wifi,
  AlertTriangle,
  Globe,
  Radio,
} from 'lucide-react';
import { container } from '@/infra/di/container';
import { HoustonTelemetry } from '@/domain/entities';

export const HoustonTelemetryTab: React.FC = () => {
  const [telemetry, setTelemetry] = useState<HoustonTelemetry | null>(null);
  const [logs, setLogs] = useState<
    { id: string; time: string; msg: string; status: 'info' | 'warn' | 'error' | 'success' }[]
  >([]);
  const scrollRef = useRef<HTMLDivElement>(null);

  const addLog = (msg: string, status: 'info' | 'warn' | 'error' | 'success' = 'info') => {
    const newLog = {
      id: Math.random().toString(36).substring(2, 9),
      time: new Date().toLocaleTimeString(),
      msg,
      status,
    };
    setLogs((prev) => [...prev.slice(-49), newLog]);
  };

  useEffect(() => {
    const useCase = container.getGetHoustonTelemetryUseCase();

    // Initial fetch
    useCase.execute().then(setTelemetry);

    // Subscribe to updates
    const unsubscribe = useCase.subscribe((data) => {
      setTelemetry(data);
      if (data.recentEvents) {
        addLog(`System sync: ${data.systemHealth}`, 'success');
      }
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [logs]);

  if (!telemetry) {
    return (
      <div className="flex items-center justify-center min-h-[500px] text-cyan-500 animate-pulse font-mono tracking-widest uppercase">
        <Radio className="mr-3 animate-bounce" /> Uplinking to Command Center...
      </div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      {/* HUD Header */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <HUDCard
          icon={<Activity size={20} className="text-cyan-400" />}
          label="System Load"
          value="42%"
          trend="Stable"
        />
        <HUDCard
          icon={<Wifi size={20} className="text-emerald-400" />}
          label="AI Latency"
          value={`${telemetry.metrics.inferenceLatency.value}ms`}
          trend="Premium"
        />
        <HUDCard
          icon={<Database size={20} className="text-purple-400" />}
          label="Firestore Sync"
          value="Online"
          trend="Verified"
        />
        <HUDCard
          icon={<ShieldCheck size={20} className="text-blue-400" />}
          label="Security Protocol"
          value="Zero Trust"
          trend="Enforced"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Terminal / Log View */}
        <div className="lg:col-span-2 flex flex-col h-[500px] bg-black/60 backdrop-blur-3xl rounded-2xl border border-white/10 overflow-hidden shadow-2xl shadow-cyan-900/20">
          <div className="flex items-center justify-between px-4 py-2 bg-white/5 border-b border-white/10">
            <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400">
              <Terminal size={14} className="text-cyan-500" />
              Terminal Access: richard-automotive-core
            </div>
            <div className="flex gap-1.5">
              <div className="w-2 h-2 rounded-full bg-rose-500/50" />
              <div className="w-2 h-2 rounded-full bg-amber-500/50" />
              <div className="w-2 h-2 rounded-full bg-emerald-500/50" />
            </div>
          </div>
          <div
            ref={scrollRef}
            className="flex-1 p-4 font-mono text-[11px] overflow-y-auto space-y-1.5 scrollbar-thin scrollbar-thumb-white/10"
          >
            <div className="text-emerald-500/70 border-b border-white/5 pb-2 mb-2">
              [SYSTEM INITIALIZATION COMPLETE] - NODE RICHARD-AUTO-DC-01
            </div>
            {logs.length === 0 && (
              <div className="text-slate-600 italic">Waiting for telemetry stream...</div>
            )}
            {logs.map((log) => (
              <div
                key={log.id}
                className="flex gap-3 animate-in fade-in slide-in-from-left-2 duration-300"
              >
                <span className="text-slate-600 min-w-[70px]">[{log.time}]</span>
                <span
                  className={`
                  ${log.status === 'info' ? 'text-slate-300' : ''}
                  ${log.status === 'success' ? 'text-emerald-400' : ''}
                  ${log.status === 'warn' ? 'text-amber-400' : ''}
                  ${log.status === 'error' ? 'text-rose-400' : ''}
                 uppercase`}
                >
                  {log.msg}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Side Panel: Infrastructure Health */}
        <div className="space-y-6">
          <div className="glass-premium p-6 rounded-2xl border border-white/10 space-y-6 overflow-hidden relative">
            <div className="absolute -top-10 -right-10 w-32 h-32 bg-cyan-500/10 rounded-full blur-3xl" />

            <h4 className="text-xs font-black uppercase tracking-widest text-white flex items-center gap-2">
              <Cpu size={14} className="text-cyan-500" /> Node Infrastructure
            </h4>

            <div className="space-y-4">
              <InfrastructureItem label="Memory Core" percent={42} color="bg-cyan-500" />
              <InfrastructureItem label="GPT Processors" percent={88} color="bg-indigo-500" />
              <InfrastructureItem label="Network Mesh" percent={99} color="bg-emerald-500" />
              <InfrastructureItem label="Audit Pipeline" percent={100} color="bg-purple-500" />
            </div>

            <div className="pt-4 border-t border-white/5 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Globe size={14} className="text-slate-500" />
                <span className="text-[10px] font-bold text-slate-400 uppercase">Region</span>
              </div>
              <span className="text-[10px] font-black text-white uppercase tracking-tighter">
                US-EAST-1 (PR)
              </span>
            </div>
          </div>

          <div className="glass-premium p-6 rounded-2xl border border-white/10 bg-gradient-to-br from-cyan-950/20 to-indigo-950/20">
            <h4 className="text-xs font-black uppercase tracking-widest text-white flex items-center gap-2 mb-4">
              <Zap size={14} className="text-amber-400" /> Real-time Ops
            </h4>
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-3 bg-white/5 rounded-xl border border-white/5">
                <div className="text-[10px] font-bold text-slate-500 uppercase mb-1">Threads</div>
                <div className="text-2xl font-black text-white">124</div>
              </div>
              <div className="text-center p-3 bg-white/5 rounded-xl border border-white/5">
                <div className="text-[10px] font-bold text-slate-500 uppercase mb-1">AI Nodes</div>
                <div className="text-2xl font-black text-cyan-400">12</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

// HELPER COMPONENTS
const HUDCard: React.FC<{ icon: React.ReactNode; label: string; value: string; trend: string }> = ({
  icon,
  label,
  value,
  trend,
}) => (
  <div className="glass-premium p-4 rounded-2xl border border-white/10 group hover:border-cyan-500/50 transition-all cursor-default">
    <div className="flex items-start justify-between">
      <div className="p-2 bg-white/5 rounded-xl group-hover:scale-110 transition-transform">
        {icon}
      </div>
      <span className="text-[9px] font-black text-emerald-500/70 uppercase tracking-tighter bg-emerald-500/10 px-1.5 rounded">
        {trend}
      </span>
    </div>
    <div className="mt-4">
      <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">
        {label}
      </div>
      <div className="text-2xl font-black text-white tracking-tight">{value}</div>
    </div>
  </div>
);

const InfrastructureItem: React.FC<{ label: string; percent: number; color: string }> = ({
  label,
  percent,
  color,
}) => (
  <div className="space-y-1.5">
    <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-widest">
      <span className="text-slate-400">{label}</span>
      <span className="text-white">{percent}%</span>
    </div>
    <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
      <motion.div
        initial={{ width: 0 }}
        animate={{ width: `${percent}%` }}
        className={`h-full ${color}`}
      />
    </div>
  </div>
);
