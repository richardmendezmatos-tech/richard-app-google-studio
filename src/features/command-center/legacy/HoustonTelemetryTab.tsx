"use client";

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
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
  Brain,
  Layers,
} from 'lucide-react';
import { houstonBus, HoustonEvent, HoustonEventType } from '@/shared/lib/events/HoustonBus';
import { useTrajectoryStore } from '@/entities/session/model/useTrajectoryStore';

export const HoustonTelemetryTab: React.FC = () => {
  const [logs, setLogs] = useState<
    { id: string; time: string; msg: string; type: string; status: 'info' | 'warn' | 'error' | 'success' }[]
  >([]);
  const { currentScore, factors } = useTrajectoryStore();
  const scrollRef = useRef<HTMLDivElement>(null);

  const addLog = (event: HoustonEvent) => {
    const statusMap: Record<string, 'info' | 'warn' | 'error' | 'success'> = {
      [HoustonEventType.RESILIENCE_REHYDRATION_COMPLETED]: 'success',
      [HoustonEventType.PREDICTIVE_HIGH_INTENT]: 'warn',
      [HoustonEventType.LEAD_EMERGENCY_SAVE]: 'error',
      [HoustonEventType.PREDICTIVE_NUDGE_DISPATCHED]: 'success',
      [HoustonEventType.UI_ADAPTATION_REQUESTED]: 'info',
    };

    const newLog = {
      id: `${event.timestamp}-${Math.random()}`,
      time: new Date(event.timestamp).toLocaleTimeString(),
      msg: `${event.type}: ${JSON.stringify(event.payload).substring(0, 60)}...`,
      type: event.type,
      status: statusMap[event.type] || 'info',
    };
    setLogs((prev) => [...prev.slice(-49), newLog]);
  };

  useEffect(() => {
    // Subscribe to real-time events from the Houston Bus
    const subscription = houstonBus.events$.subscribe((event) => {
      addLog(event);
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [logs]);

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      {/* 🚀 HUD Header: Sentinel Live Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <HUDCard
          icon={<Brain size={20} className="text-cyan-400" />}
          label="Neuro-Intent Score"
          value={`${currentScore}%`}
          trend={currentScore > 70 ? 'High' : 'Normal'}
        />
        <HUDCard
          icon={<Activity size={20} className="text-emerald-400" />}
          label="Ecosystem Pulse"
          value="Active"
          trend="Sentinel 3.3"
        />
        <HUDCard
          icon={<Database size={20} className="text-purple-400" />}
          label="Resilience Layer"
          value={logs.filter(l => l.status === 'success').length > 0 ? 'Rescued' : 'Standby'}
          trend="Auto-Healing"
        />
        <HUDCard
          icon={<ShieldCheck size={20} className="text-blue-400" />}
          label="Circuit Breaker"
          value="Closed"
          trend="Prot. Active"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 📟 Terminal: Real-time Event Stream */}
        <div className="lg:col-span-2 flex flex-col h-[500px] bg-black/80 backdrop-blur-3xl rounded-2xl border border-white/10 overflow-hidden shadow-2xl shadow-cyan-900/20">
          <div className="flex items-center justify-between px-4 py-2 bg-white/5 border-b border-white/10">
            <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400">
              <Terminal size={14} className="text-cyan-500" />
              Houston Bus: sentinel-event-stream
            </div>
            <div className="flex gap-1.5 opacity-50">
              <div className="w-2 h-2 rounded-full bg-rose-500" />
              <div className="w-2 h-2 rounded-full bg-amber-500" />
              <div className="w-2 h-2 rounded-full bg-emerald-500" />
            </div>
          </div>
          <div
            ref={scrollRef}
            className="flex-1 p-4 font-mono text-[11px] overflow-y-auto space-y-1.5 scrollbar-none"
          >
            <div className="text-cyan-500/70 border-b border-white/5 pb-2 mb-2 italic">
              [SYSTEM_LEVEL_13_ESTABLISHED] - LISTENING FOR AGENT EVENTS...
            </div>
            <AnimatePresence initial={false}>
              {logs.map((log) => (
                <motion.div
                  key={log.id}
                  initial={{ x: -10, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  className="flex gap-3 leading-relaxed"
                >
                  <span className="text-slate-600 min-w-[75px]">[{log.time}]</span>
                  <span
                    className={`
                    ${log.status === 'info' ? 'text-slate-400' : ''}
                    ${log.status === 'success' ? 'text-emerald-400 font-bold' : ''}
                    ${log.status === 'warn' ? 'text-amber-400 italic' : ''}
                    ${log.status === 'error' ? 'text-rose-400 font-black' : ''}
                    uppercase tracking-tight`}
                  >
                    {log.msg}
                  </span>
                </motion.div>
              ))}
            </AnimatePresence>
            {logs.length === 0 && (
              <div className="text-slate-700 animate-pulse mt-4">
                [WAITING FOR NEXT TELEMETRY BEACON...]
              </div>
            )}
          </div>
        </div>

        {/* 🧠 Side Panel: Intent & Infrastructure */}
        <div className="space-y-6">
          <div className="glass-premium p-6 rounded-2xl border border-white/10 space-y-6 bg-gradient-to-br from-cyan-950/20 to-transparent">
            <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-white flex items-center gap-2">
              <Brain size={14} className="text-cyan-500" /> Neuro-Signals
            </h4>

            <div className="space-y-4">
              <InfrastructureItem 
                label="Interacción" 
                percent={factors.interaction * 10} 
                color="bg-cyan-500" 
              />
              <InfrastructureItem 
                label="Visitas" 
                percent={factors.velocity * 10} 
                color="bg-indigo-500" 
              />
              <InfrastructureItem 
                label="Búsqueda" 
                percent={factors.formFocus ? 100 : 20} 
                color="bg-purple-500" 
              />
              <InfrastructureItem 
                label="Calidad" 
                percent={factors.dwellTime * 10} 
                color="bg-blue-500" 
              />
            </div>
          </div>

          <div className="glass-premium p-6 rounded-2xl border border-white/10 bg-black/40">
            <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-white flex items-center gap-2 mb-4">
              <Zap size={14} className="text-amber-400" /> Operational Status
            </h4>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-white/5 rounded-xl border border-white/5">
                <span className="text-[10px] font-bold text-slate-500 uppercase">Bus Latency</span>
                <span className="text-xs font-black text-emerald-400">0.02ms</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-white/5 rounded-xl border border-white/5">
                <span className="text-[10px] font-bold text-slate-500 uppercase">Agent Sync</span>
                <span className="text-xs font-black text-white uppercase">Active</span>
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
  <div className="glass-premium p-5 rounded-2xl border border-white/10 group hover:border-cyan-500/50 transition-all">
    <div className="flex items-start justify-between">
      <div className="p-2.5 bg-white/5 rounded-xl group-hover:bg-cyan-500/10 transition-colors">
        {icon}
      </div>
      <span className="text-[8px] font-black text-cyan-400 uppercase tracking-tighter bg-cyan-500/10 px-2 py-0.5 rounded">
        {trend}
      </span>
    </div>
    <div className="mt-4">
      <div className="text-[9px] font-bold text-slate-500 uppercase tracking-[0.1em] mb-1">
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
  <div className="space-y-2">
    <div className="flex justify-between items-center text-[9px] font-bold uppercase tracking-widest">
      <span className="text-slate-500">{label}</span>
      <span className="text-white text-[10px]">{Math.round(percent)}%</span>
    </div>
    <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
      <motion.div
        initial={{ width: 0 }}
        animate={{ width: `${Math.min(100, Math.max(0, percent))}%` }}
        className={`h-full ${color} shadow-[0_0_10px_rgba(34,211,238,0.3)]`}
      />
    </div>
  </div>
);
