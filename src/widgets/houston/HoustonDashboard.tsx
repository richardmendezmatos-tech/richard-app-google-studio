"use client";

"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

/**
 * Isolated Jitter Label to prevent full dashboard re-renders.
 */
const JitterLabel: React.FC<{ metricKey: string }> = ({ metricKey }) => {
  const [value, setValue] = useState<number | null>(null);

  useEffect(() => {
    const getJitter = () => {
      switch (metricKey) {
        case 'inferenceLatency':
          return (Math.random() - 0.5) * 4;
        case 'tokenUsage':
          return Math.floor((Math.random() - 0.5) * 50);
        case 'apiStability':
          return (Math.random() - 0.5) * 0.02;
        default:
          return null;
      }
    };

    const interval = setInterval(() => {
      setValue(getJitter());
    }, 800);

    return () => clearInterval(interval);
  }, [metricKey]);

  if (value === null) return null;

  return (
    <div className="absolute bottom-2 right-6 text-[9px] font-black text-cyan-500/20">
      MOD: {value > 0 ? '+' : ''}
      {value.toFixed(metricKey === 'apiStability' ? 3 : 1)}
    </div>
  );
};
import styles from './HoustonDashboard.module.css';
import {
  Activity,
  Zap,
  Shield,
  Cpu,
  Terminal as TerminalIcon,
  ArrowUpRight,
  AlertCircle,
  Server,
  Radio,
  CheckCircle2,
  Car as CarIcon
} from 'lucide-react';
import { DI } from '@/app/di/registry';
import { HoustonTelemetry } from '@/entities/houston';
import { OutreachOpportunity } from '@/entities/lead';
import { useMouseGlow } from '@/shared/ui/hooks/useMouseGlow';
import { BusinessHealthWidget } from './ui/BusinessHealthWidget';

/**
 * Houston Dashboard - Nivel 13 "Master Control Center"
 * Advanced telemetry UI with real-time AI performance monitoring.
 */
const HoustonDashboard: React.FC = () => {
  const [telemetry, setTelemetry] = useState<HoustonTelemetry | null>(null);
  const [opportunities, setOpportunities] = useState<OutreachOpportunity[]>([]);
  const terminalRef = React.useRef<HTMLDivElement>(null);
  const { containerRef } = useMouseGlow();

  const heatmapData = React.useMemo(() => {
    return [...Array(50)].map((_, i) => ({
      age: (i * 7) % 120,
      id: `unit-${i}-${Math.abs(Math.sin(i)).toString(36).substring(7)}`,
    }));
  }, []);

  const getHoustonTelemetry = useMemo(() => DI.getHoustonTelemetryUseCase(), []);
  const identifyOutreachOpportunities = useMemo(
    () => DI.getIdentifyOutreachOpportunitiesUseCase(),
    [],
  );

  useEffect(() => {
    const unsubscribe = getHoustonTelemetry.subscribe((data: HoustonTelemetry) => {
      setTelemetry(data);
    });

    identifyOutreachOpportunities.execute(80).then(setOpportunities);

    return () => {
      unsubscribe();
    };
  }, [getHoustonTelemetry, identifyOutreachOpportunities]);

  useEffect(() => {
    if (terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
    }
  }, [telemetry?.recentEvents]);

  if (!telemetry)
    return (
      <div className="h-screen bg-slate-950 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex flex-col items-center"
        >
          <Radio className="text-cyan-500 animate-pulse mb-4" size={48} />
          <p className="text-cyan-500 font-mono tracking-widest uppercase text-xs">
            Uplink: Establisihing Terminal...
          </p>
        </motion.div>
      </div>
    );

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { type: 'spring' as const, stiffness: 100 },
    },
  };

  return (
    <div
      ref={containerRef as any}
      className="min-h-screen bg-[#02060a] text-slate-300 font-mono p-4 md:p-8 relative overflow-hidden mesh-bg select-none"
    >
      {/* Premium Ambient Glow Layers - Refined for depth */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] bg-cyan-500/5 blur-[160px] rounded-full animate-pulse" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[60%] h-[60%] bg-purple-500/5 blur-[160px] rounded-full animate-pulse [animation-delay:3s]" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80%] h-[80%] bg-cyan-900/5 blur-[200px] rounded-full" />
      </div>

      {/* HUD Scanline Effect */}
      <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.1)_50%),linear-gradient(90deg,rgba(255,0,0,0.03),rgba(0,255,0,0.01),rgba(0,0,255,0.03))] z-50 bg-[length:100%_2px,3px_100%] opacity-20" />

      <motion.header
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="flex flex-col md:flex-row justify-between items-start md:items-center mb-16 gap-4 relative z-10"
      >
        <div>
          <h1 className="text-6xl font-black text-white tracking-tighter-caps mb-3 flex items-center gap-4 transition-all duration-500 hover:tracking-normal cursor-default group">
            <TerminalIcon
              className="text-cyan-500 group-hover:rotate-12 transition-transform"
              size={42}
            />
            Houston
            <span className="text-cyan-500 text-xl font-mono tracking-[0.5em] ml-4 opacity-70 group-hover:opacity-100 transition-opacity">
              RA SENTINEL
            </span>
          </h1>
          <div className="flex items-center gap-8 text-[11px] text-slate-500 uppercase tracking-[0.2em] font-black">
            <span className="flex items-center gap-3 group cursor-help">
              <div
                className={`w-2.5 h-2.5 rounded-full ${telemetry.systemHealth === 'online' ? 'bg-emerald-500 shadow-[0_0_12px_#10b981] animate-pulse' : 'bg-red-500'}`}
              />
              System Status:
              <span className="text-emerald-400 group-hover:text-emerald-300 transition-colors">
                {telemetry.systemHealth.toUpperCase()}
              </span>
            </span>
            <span className="border-l border-white/10 pl-8">
              Up: <span className="text-slate-300">99.99%</span>
            </span>
            <span className="border-l border-white/10 pl-8">
              Loc: <span className="text-slate-300">HQ_SAN_JUAN</span>
            </span>
            <span className="border-l border-white/10 pl-8 group cursor-pointer hover:text-cyan-400 transition-colors">
              Appraisals: <span className="text-emerald-400">RA_LIVE</span>
            </span>
          </div>
        </div>
        <div className="glass-premium px-10 py-6 flex items-center gap-10 border border-white/5 group hover:scale-[1.02] transition-all duration-500 cursor-pointer shadow-2xl relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
          <div className="text-right">
            <p className="text-[10px] text-slate-500 uppercase font-black tracking-[0.3em] mb-1">
              Autonomy Score
            </p>
            <p className="text-4xl font-black text-white group-hover:text-cyan-400 transition-colors tracking-tighter">
              {telemetry.metrics.autonomyRate.value}
              <span className="text-lg text-cyan-500/50">%</span>
            </p>
          </div>
          <div className="p-3 bg-cyan-500/10 rounded-2xl group-hover:bg-cyan-500/20 transition-colors">
            <Activity className="text-cyan-500 animate-pulse" size={32} />
          </div>
        </div>
      </motion.header>

      <motion.main
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-1 xl:grid-cols-4 gap-6 relative z-10"
      >
        {/* Metrics Sidebar */}
        <div className="xl:col-span-1 space-y-6">
          {Object.entries(telemetry.metrics).map(([key, metric]) => {
            const isPurple = key === 'inferenceLatency' || key === 'apiStability';
            const colorClass = isPurple ? 'text-purple-400' : 'text-cyan-400';
            const glowClass = isPurple
              ? 'group-hover:border-purple-500/40'
              : 'group-hover:border-cyan-500/40';
            const bgGlow = isPurple ? 'bg-purple-500/5' : 'bg-cyan-500/5';

            return (
              <motion.div
                variants={itemVariants}
                key={key}
                className={`glass-premium p-6 border border-white/5 ${glowClass} transition-all group overflow-hidden relative cursor-default`}
              >
                <div
                  className={`absolute -right-4 -top-4 opacity-0 group-hover:opacity-10 transition-all duration-700 group-hover:scale-125 ${isPurple ? 'text-purple-500' : 'text-cyan-500'}`}
                >
                  {key === 'inferenceLatency' && <Zap size={120} />}
                  {key === 'tokenUsage' && <Cpu size={120} />}
                  {key === 'autonomyRate' && <Shield size={120} />}
                  {key === 'apiStability' && <Server size={120} />}
                </div>

                <p
                  className={`text-[10px] uppercase tracking-[0.3em] ${isPurple ? 'text-purple-500/60' : 'text-cyan-500/60'} font-black mb-3`}
                >
                  {metric.label}
                </p>
                <div className="flex items-end gap-3 translate-y-1 group-hover:translate-y-0 transition-transform duration-500">
                  <span className="text-5xl font-black text-white tracking-tighter">
                    {metric.value}
                  </span>
                  <span className="text-xs text-slate-500 mb-2 font-black uppercase tracking-widest opacity-60 group-hover:opacity-100 transition-opacity">
                    {metric.unit}
                  </span>
                </div>
                <div className="mt-8 flex items-center justify-between">
                  <span
                    className={`text-[10px] font-black px-3 py-1 rounded-lg border ${
                      metric.status === 'healthy'
                        ? 'border-emerald-500/20 text-emerald-400 bg-emerald-500/5'
                        : 'border-amber-500/20 text-amber-400 bg-amber-500/5'
                    }`}
                  >
                    {metric.status.toUpperCase()}
                  </span>
                  <div className="flex items-center gap-4">
                    {metric.trend === 'up' && (
                      <ArrowUpRight className="text-emerald-500" size={18} />
                    )}
                    <div
                      className={`text-[9px] font-black ${isPurple ? 'text-purple-500/40' : 'text-cyan-500/40'} flex items-center gap-2`}
                    >
                      <div
                        className={`w-1.5 h-1.5 ${isPurple ? 'bg-purple-400' : 'bg-cyan-400'} rounded-full animate-ping`}
                      />
                      <span>LIVE_FEED</span>
                    </div>
                  </div>
                </div>
                <JitterLabel metricKey={key} />
              </motion.div>
            );
          })}

          {/* New Appraisal Pulse Metric */}
          <motion.div
            variants={itemVariants}
            className="glass-premium p-6 border border-emerald-500/20 bg-emerald-500/[0.02] transition-all group overflow-hidden relative cursor-pointer"
            onClick={() => window.open('/trade-in', '_blank')}
          >
            <div className="absolute -right-4 -top-4 opacity-5 group-hover:opacity-20 transition-all duration-700 text-emerald-500">
               <CarIcon size={120} />
            </div>
            <p className="text-[10px] uppercase tracking-[0.3em] text-emerald-500/60 font-black mb-3">
              Appraisal Pulse
            </p>
            <div className="flex items-end gap-3 translate-y-1 group-hover:translate-y-0 transition-transform duration-500">
              <span className="text-5xl font-black text-white tracking-tighter">
                24
              </span>
              <span className="text-xs text-slate-500 mb-2 font-black uppercase tracking-widest">
                / 24H
              </span>
            </div>
            <div className="mt-8 flex items-center justify-between">
              <span className="text-[10px] font-black px-3 py-1 rounded-lg border border-emerald-500/20 text-emerald-400 bg-emerald-500/5 uppercase">
                RA_Intelligence
              </span>
              <div className="flex items-center gap-2 text-[9px] font-black text-emerald-500/40">
                <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-ping" />
                <span>VALUATOR_LINK</span>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Central Visualizer */}
        <div className="xl:col-span-2 space-y-6">
          <motion.div
            variants={itemVariants}
            className="glass-premium h-[440px] border border-white/5 p-8 relative flex flex-col justify-start overflow-hidden group"
          >
            {/* Dynamic Scan Line */}
            <motion.div
              animate={{ top: ['0%', '100%', '0%'] }}
              transition={{ duration: 4, repeat: Infinity, ease: 'linear' }}
              className="absolute left-0 right-0 h-0.5 bg-cyan-500/20 z-20 shadow-[0_0_15px_rgba(0,229,255,0.4)] pointer-events-none"
            />

            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_rgba(0,174,217,0.05)_0%,_transparent_70%)] group-hover:opacity-100 opacity-60 transition-opacity" />

            <div className="relative z-10 w-full">
              <div className="flex justify-between items-center mb-10">
                <h3 className="text-xs font-black text-white uppercase tracking-[0.4em] flex items-center gap-4">
                  <div className="w-2.5 h-2.5 bg-red-500 rounded-full shadow-[0_0_12px_#ef4444] animate-pulse" />{' '}
                  Inventory Stock Matrix
                </h3>
                <div className="flex items-center gap-6">
                  <div className="flex items-center gap-3">
                    <span className="text-[10px] text-slate-500 font-black uppercase tracking-widest">
                      Deep Scanner
                    </span>
                    <div className="flex gap-1.5 h-4">
                      {[...Array(4)].map((_, i) => (
                        <div
                          key={i}
                          className={`w-1 h-full bg-cyan-500/40 animate-pulse ${styles[`delay-${i * 250}`]}`}
                        />
                      ))}
                    </div>
                  </div>
                  <div className="px-4 py-1.5 border border-cyan-500/20 rounded-full bg-cyan-500/5">
                    <span className="text-[9px] text-cyan-400 font-black uppercase tracking-widest animate-pulse">
                      Processing Data...
                    </span>
                  </div>
                </div>
              </div>

              {/* Heatmap Grid Analysis */}
              <div className="grid grid-cols-10 gap-3.5 px-4">
                {heatmapData.map((item, i) => {
                  const { age } = item;
                  const color =
                    age > 90
                      ? 'bg-rose-500 shadow-[0_0_15px_rgba(244,63,94,0.4)]'
                      : age > 60
                        ? 'bg-orange-500 shadow-[0_0_10px_rgba(249,115,22,0.2)]'
                        : age > 30
                          ? 'bg-amber-500'
                          : 'bg-emerald-500';

                  return (
                    <motion.div
                      key={item.id}
                      initial={{ scale: 0, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ delay: 0.5 + i * 0.008 }}
                      className={`${color} aspect-square rounded-md border border-white/5 relative cursor-help transition-all duration-300 hover:scale-150 hover:z-30 hover:border-white/30 group/item`}
                      title={`Unit RA-${1000 + i}: ${age} days`}
                    >
                      <div className="absolute inset-0 bg-white/20 opacity-0 group-hover/item:opacity-100 transition-opacity rounded-md" />
                      {age > 90 && (
                        <div className="absolute inset-0 bg-white/10 animate-ping rounded-md" />
                      )}
                    </motion.div>
                  );
                })}
              </div>

              <div className="mt-12 grid grid-cols-4 gap-8">
                <div className="p-5 bg-white/3 rounded-3xl border border-white/5 hover:bg-white/5 transition-all hover:translate-y-[-4px] group">
                  <p className="text-[9px] text-slate-500 uppercase font-black tracking-widest mb-2 group-hover:text-slate-400 transition-colors">
                    Avg Dwell Time
                  </p>
                  <p className="text-3xl font-black text-white tracking-tighter">
                    42<span className="text-lg text-slate-500 ml-1">d</span>
                  </p>
                </div>
                <div className="p-5 bg-rose-500/[0.03] rounded-3xl border border-rose-500/10 hover:bg-rose-500/[0.05] transition-all hover:translate-y-[-4px] group">
                  <p className="text-[9px] text-rose-500/60 uppercase font-black tracking-widest mb-2 group-hover:text-rose-500 transition-colors">
                    Critical Units
                  </p>
                  <p className="text-3xl font-black text-rose-500 tracking-tighter">
                    0.8<span className="text-lg opacity-60 ml-1">k</span>
                  </p>
                </div>
                <div className="lg:col-span-2 p-5 bg-emerald-500/[0.03] rounded-3xl border border-emerald-500/10 flex items-center gap-6 hover:bg-emerald-500/[0.05] transition-all hover:translate-y-[-4px]">
                  <div className="p-3.5 bg-emerald-500/10 rounded-2xl">
                    <CheckCircle2 size={28} className="text-emerald-500" />
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between items-center mb-2.5">
                      <p className="text-[9px] text-emerald-500 uppercase font-black tracking-widest">
                        System Efficiency
                      </p>
                      <span className="text-[11px] font-black text-white">94%</span>
                    </div>
                    <div className="h-1.5 w-full bg-emerald-500/10 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: '94%' }}
                        transition={{ duration: 1.2, ease: 'circOut' }}
                        className="h-full bg-emerald-500 shadow-[0_0_10px_#10b981]"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          <BusinessHealthWidget />

          {/* Mission Log / Terminal */}
          <motion.div
            variants={itemVariants}
            className="glass-premium border border-white/5 p-8 h-[300px] overflow-hidden flex flex-col group/terminal"
          >
            <div className="flex items-center gap-4 mb-6">
              <TerminalIcon
                size={18}
                className="text-cyan-500 group-hover/terminal:rotate-90 transition-transform duration-500"
              />
              <span className="text-xs uppercase font-black text-slate-400 tracking-[0.5em]">
                SOVEREIGN_FEED
              </span>
              <div className="ml-auto flex items-center gap-4">
                <div className="flex gap-1 h-3.5">
                  {[...Array(3)].map((_, i) => (
                    <div
                      key={i}
                      className={`w-1 h-full bg-cyan-500/40 animate-pulse ${styles[`delay-${i * 150}`]}`}
                    />
                  ))}
                </div>
                <span className="text-[10px] text-cyan-500/60 uppercase font-black tracking-widest">
                  Secure_Uplink
                </span>
              </div>
            </div>
            <div
              ref={terminalRef}
              className="flex-1 overflow-y-auto space-y-3 custom-scrollbar pr-4 scroll-smooth"
            >
              <AnimatePresence>
                {telemetry.recentEvents.map((event) => (
                  <motion.div
                    initial={{ x: -10, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    key={event.id}
                    className="text-[11px] font-mono flex gap-6 hover:bg-white/[0.04] p-2.5 rounded-xl transition-all group/log border border-transparent hover:border-white/5"
                  >
                    <span className="text-slate-600 shrink-0 font-bold select-none opacity-50">
                      [{new Date(event.timestamp).toLocaleTimeString()}]
                    </span>
                    <span
                      className={`uppercase font-black min-w-[80px] tracking-widest ${
                        event.type === 'error'
                          ? 'text-red-500 shadow-[0_0_8px_rgba(239,68,68,0.3)]'
                          : event.type === 'warning'
                            ? 'text-amber-400'
                            : 'text-cyan-400'
                      }`}
                    >
                      {event.type}
                    </span>
                    <span className="text-slate-500 font-bold group-hover/log:text-slate-400 transition-colors shrink-0">
                      {event.source.toUpperCase()}
                    </span>
                    <span className="text-slate-300 group-hover/log:text-white transition-colors flex-1 leading-relaxed">
                      {event.message}
                    </span>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </motion.div>
        </div>

        {/* Right Panel / System Insights */}
        <div className="xl:col-span-1 space-y-6">
          <motion.div
            variants={itemVariants}
            className="glass-premium glass-sentinel p-8 border border-white/5 h-fit mb-6 group relative overflow-hidden"
          >
            <div className="absolute -right-12 -bottom-12 bg-amber-500/10 w-32 h-32 rounded-full blur-3xl group-hover:bg-amber-500/20 transition-all duration-1000" />
            <AlertCircle className="text-amber-500 mb-8 animate-bounce-slow" size={42} />
            <h3 className="text-2xl font-black text-white uppercase mb-8 tracking-tighter-caps">
              Sentinel Analysis
            </h3>
            <ul className="space-y-10 text-xs text-slate-400">
              {[
                {
                  label: 'Inference',
                  content: 'Optimizador táctico activo. Latencia -14% vs baseline temporal.',
                },
                {
                  label: 'Autonomy',
                  content: 'Richard AI ejecutando flujos de prospección nivel 14.',
                },
                {
                  label: 'Appraisals',
                  content: 'RA_VALUATOR detectó tendencia alcista en inventario Europeo de alta gama.',
                },
              ].map((insight, idx) => (
                <li key={idx} className="flex gap-5 group/li">
                  <div className="w-2 h-2 bg-amber-500 rounded-full mt-2 shrink-0 group-hover/li:scale-150 transition-transform shadow-[0_0_12px_#f59e0b]" />
                  <p className="leading-relaxed">
                    <span className="text-white font-black uppercase tracking-[0.2em] text-[10px] block mb-2 opacity-60 group-hover/li:opacity-100 transition-opacity">
                      {insight.label}
                    </span>{' '}
                    {insight.content}
                  </p>
                </li>
              ))}
            </ul>
          </motion.div>

          {/* Predictive Projections */}
          <motion.div
            variants={itemVariants}
            className="glass-premium p-8 border border-cyan-500/20 bg-cyan-500/[0.02] relative overflow-hidden group/forecast"
          >
            <div className="absolute top-0 right-0 p-4">
              <Zap
                size={24}
                className="text-cyan-500 animate-pulse drop-shadow-[0_0_12px_rgba(0,229,255,0.6)]"
              />
            </div>
            <h3 className="text-xs font-black text-cyan-400 uppercase mb-10 tracking-[0.5em] flex items-center gap-4">
              <Activity size={18} /> Forecast Engine_v2
            </h3>

            <div className="space-y-10">
              <div>
                <div className="flex justify-between items-end mb-4">
                  <span className="text-[10px] text-slate-500 uppercase font-black tracking-[0.2em]">
                    Closing Probability (MTD)
                  </span>
                  <span className="text-3xl font-black text-white tracking-tighter">
                    78<span className="text-lg text-cyan-500/50">%</span>
                  </span>
                </div>
                <div className="h-2.5 w-full bg-slate-900 rounded-full overflow-hidden border border-white/5 p-0.5">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: '78%' }}
                    transition={{ duration: 2, ease: 'circOut' }}
                    className="h-full bg-gradient-to-r from-cyan-600 via-cyan-400 to-white/40 rounded-full shadow-[0_0_20px_rgba(0,174,217,0.6)]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-5">
                <div className="p-5 bg-white/3 border border-white/5 rounded-3xl group/sub hover:bg-white/5 transition-all hover:scale-[1.02]">
                  <p className="text-[9px] text-slate-500 uppercase font-black tracking-widest mb-2">
                    Hot Leads
                  </p>
                  <p className="text-3xl font-black text-emerald-400 tracking-tighter">+12</p>
                </div>
                <div className="p-5 bg-white/3 border border-white/5 rounded-3xl group/sub hover:bg-white/5 transition-all hover:scale-[1.02]">
                  <p className="text-[9px] text-slate-500 uppercase font-black tracking-widest mb-2">
                    Est ROI
                  </p>
                  <p className="text-3xl font-black text-white tracking-tighter">
                    2.4<span className="text-lg text-cyan-500/50">x</span>
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-12 space-y-5">
              {opportunities.length > 0 ? (
                opportunities.map((opp, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ x: 30, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: 0.8 + idx * 0.15 }}
                    className="p-5 border border-white/5 rounded-3xl bg-white/2 group/opp relative hover:bg-white/5 transition-all cursor-pointer overflow-hidden"
                  >
                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-cyan-500 opacity-30 group-hover/opp:opacity-100 group-hover/opp:w-1.5 transition-all shadow-[0_0_15px_#00aed9]" />
                    <p className="text-[11px] text-slate-400 font-bold leading-relaxed mb-4 group-hover/opp:text-white transition-colors">
                      <span className="text-cyan-500 mr-3 text-sm">🦅</span>
                      {opp.reason}
                    </p>
                    <div className="flex justify-between items-center bg-black/20 p-2.5 rounded-xl border border-white/5">
                      <span className="text-[10px] font-black text-emerald-400 uppercase tracking-widest">
                        {opp.suggestedAction}
                      </span>
                      <span className="text-[10px] font-black text-cyan-500 uppercase tracking-widest">
                        {opp.potentialRoi}x ROI
                      </span>
                    </div>
                  </motion.div>
                ))
              ) : (
                <div className="p-6 border border-white/5 rounded-3xl bg-white/1 flex flex-col items-center justify-center py-12 gap-4">
                  <div className="w-8 h-8 rounded-full border-2 border-cyan-500/20 border-t-cyan-500 animate-spin" />
                  <span className="text-[10px] text-slate-500 font-black uppercase tracking-[0.3em]">
                    Scanning Opportunities...
                  </span>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      </motion.main>
    </div>
  );
};

export default HoustonDashboard;
