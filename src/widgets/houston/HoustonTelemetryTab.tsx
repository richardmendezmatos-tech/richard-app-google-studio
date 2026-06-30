'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
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
  Car as CarIcon,
  DollarSign,
  Gauge,
  LineChart,
  MessageSquare,
  PackageSearch,
  Sparkles,
  TrendingUp,
  Download,
  Share2,
  Wifi,
  WifiOff,
  Power,
  PowerOff,
} from 'lucide-react';
import { HoustonTelemetry } from '@/entities/houston';

// ─── Isolated Jitter Label ───────────────────────────────────────────────────
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
    const interval = setInterval(() => setValue(getJitter()), 800);
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

export const TelemetryTab: React.FC<{ telemetry: HoustonTelemetry }> = ({ telemetry }) => {
  const heatmapData = useMemo(
    () =>
      [...Array(50)].map((_, i) => ({
        age: (i * 7) % 120,
        id: `unit-${i}-${Math.abs(Math.sin(i)).toString(36).substring(7)}`,
      })),
    [],
  );
  return (
    <motion.div
      key="telemetry"
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -16 }}
      transition={{ duration: 0.35, ease: 'easeOut' }}
      className="grid grid-cols-1 xl:grid-cols-4 gap-6"
    >
      {/* Metrics Sidebar */}
      <div className="xl:col-span-1 space-y-4">
        {Object.entries(telemetry.metrics).map(([key, metric]) => {
          const isPurple = key === 'inferenceLatency' || key === 'apiStability';
          const glowClass = isPurple
            ? 'group-hover:border-purple-500/40'
            : 'group-hover:border-cyan-500/40';
          const colorClass = isPurple ? 'text-purple-400' : 'text-cyan-400';
          return (
            <div
              key={key}
              className={`glass-premium p-5 border border-white/5 ${glowClass} transition-all group overflow-hidden relative cursor-default`}
            >
              <div
                className={`absolute -right-4 -top-4 opacity-0 group-hover:opacity-10 transition-all duration-700 ${isPurple ? 'text-purple-500' : 'text-cyan-500'}`}
              >
                {key === 'inferenceLatency' && <Zap size={100} />}
                {key === 'tokenUsage' && <Cpu size={100} />}
                {key === 'autonomyRate' && <Shield size={100} />}
                {key === 'apiStability' && <Server size={100} />}
              </div>
              <p
                className={`text-[10px] uppercase tracking-[0.3em] ${isPurple ? 'text-purple-500/60' : 'text-cyan-500/60'} font-black mb-2`}
              >
                {metric.label}
              </p>
              <div className="flex items-end gap-2">
                <span className={`text-4xl font-black text-white tracking-tighter`}>
                  {metric.value}
                </span>
                <span className="text-xs text-slate-500 mb-1 font-black uppercase tracking-widest opacity-60">
                  {metric.unit}
                </span>
              </div>
              <div className="mt-4 flex items-center justify-between">
                <span
                  className={`text-[10px] font-black px-2 py-1 rounded-lg border ${metric.status === 'healthy' ? 'border-emerald-500/20 text-emerald-400 bg-emerald-500/5' : 'border-amber-500/20 text-amber-400 bg-amber-500/5'}`}
                >
                  {metric.status.toUpperCase()}
                </span>
                <div
                  className={`flex items-center gap-2 text-[9px] font-black ${isPurple ? 'text-purple-500/40' : 'text-cyan-500/40'}`}
                >
                  <div
                    className={`w-1.5 h-1.5 ${isPurple ? 'bg-purple-400' : 'bg-cyan-400'} rounded-full animate-ping`}
                  />
                  <span>LIVE</span>
                </div>
              </div>
              <JitterLabel metricKey={key} />
            </div>
          );
        })}

        {/* Appraisal Pulse */}
        <div
          className="glass-premium p-5 border border-emerald-500/20 bg-emerald-500/[0.02] cursor-pointer group"
          onClick={() => window.open('/trade-in', '_blank')}
        >
          <div className="absolute -right-4 -top-4 opacity-5 group-hover:opacity-20 transition-all duration-700 text-emerald-500">
            <CarIcon size={100} />
          </div>
          <p className="text-[10px] uppercase tracking-[0.3em] text-emerald-500/60 font-black mb-2">
            Appraisal Pulse
          </p>
          <div className="flex items-end gap-2">
            <span className="text-4xl font-black text-white tracking-tighter">24</span>
            <span className="text-xs text-slate-500 mb-1 font-black uppercase tracking-widest">
              / 24H
            </span>
          </div>
          <div className="mt-4 flex items-center justify-between">
            <span className="text-[10px] font-black px-2 py-1 rounded-lg border border-emerald-500/20 text-emerald-400 bg-emerald-500/5 uppercase">
              RA_Intelligence
            </span>
            <div className="flex items-center gap-2 text-[9px] font-black text-emerald-500/40">
              <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-ping" />
              <span>VALUATOR</span>
            </div>
          </div>
        </div>
      </div>

      {/* Inventory Heatmap */}
      <div className="xl:col-span-3 glass-premium border border-white/5 p-8 relative flex flex-col justify-start overflow-hidden group">
        <motion.div
          animate={{ top: ['0%', '100%', '0%'] }}
          transition={{ duration: 4, repeat: Infinity, ease: 'linear' }}
          className="absolute left-0 right-0 h-0.5 bg-cyan-500/20 z-20 shadow-[0_0_15px_rgba(0,229,255,0.4)] pointer-events-none"
        />
        <div className="flex justify-between items-center mb-8 relative z-10">
          <h3 className="text-xs font-black text-white uppercase tracking-[0.4em] flex items-center gap-4">
            <div className="w-2.5 h-2.5 bg-red-500 rounded-full shadow-[0_0_12px_#ef4444] animate-pulse" />{' '}
            Inventory Stock Matrix
          </h3>
          <div className="flex items-center gap-3 px-4 py-1.5 border border-cyan-500/20 rounded-full bg-cyan-500/5">
            <div className="flex gap-1 h-3">
              {[...Array(4)].map((_, i) => (
                <div
                  key={i}
                  className={`w-1 h-full bg-cyan-500/40 animate-pulse ${styles[`delay-${i * 250}`]}`}
                />
              ))}
            </div>
            <span className="text-[9px] text-cyan-400 font-black uppercase tracking-widest animate-pulse">
              Processing...
            </span>
          </div>
        </div>
        <div className="grid grid-cols-10 gap-3 relative z-10">
          {heatmapData.map((item, i) => {
            const { age } = item;
            const color =
              age > 90
                ? 'bg-rose-500 shadow-[0_0_15px_rgba(244,63,94,0.4)]'
                : age > 60
                  ? 'bg-orange-500'
                  : age > 30
                    ? 'bg-amber-500'
                    : 'bg-emerald-500';
            return (
              <motion.div
                key={item.id}
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.3 + i * 0.006 }}
                className={`${color} aspect-square rounded-md border border-white/5 cursor-help hover:scale-150 hover:z-30 hover:border-white/30 transition-all group/item relative`}
                title={`Unit RA-${1000 + i}: ${age} days`}
              >
                {age > 90 && (
                  <div className="absolute inset-0 bg-white/10 animate-ping rounded-md" />
                )}
              </motion.div>
            );
          })}
        </div>
        <div className="mt-10 grid grid-cols-3 gap-6 relative z-10">
          {[
            {
              label: 'Avg Dwell Time',
              value: '42',
              suffix: 'd',
              style: 'bg-white/3 border-white/5',
              text: 'text-white',
            },
            {
              label: 'Critical Units',
              value: '0.8',
              suffix: 'k',
              style: 'bg-rose-500/[0.03] border-rose-500/10',
              text: 'text-rose-500',
            },
          ].map((stat, i) => (
            <div
              key={i}
              className={`p-5 ${stat.style} rounded-4xl border hover:translate-y-[-4px] transition-all`}
            >
              <p className="text-[9px] text-slate-500 uppercase font-black tracking-widest mb-2">
                {stat.label}
              </p>
              <p className={`text-3xl font-black ${stat.text} tracking-tighter`}>
                {stat.value}
                <span className="text-lg text-slate-500 ml-1">{stat.suffix}</span>
              </p>
            </div>
          ))}
          <div className="p-5 bg-emerald-500/[0.03] rounded-4xl border border-emerald-500/10 flex items-center gap-4 hover:translate-y-[-4px] transition-all">
            <div className="p-3 bg-emerald-500/10 rounded-2xl">
              <CheckCircle2 size={24} className="text-emerald-500" />
            </div>
            <div className="flex-1">
              <div className="flex justify-between items-center mb-2">
                <p className="text-[9px] text-emerald-500 uppercase font-black tracking-widest">
                  Efficiency
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

        {/* Legend */}
        <div className="mt-6 flex items-center gap-6 text-[10px] font-black text-slate-500 uppercase tracking-widest relative z-10">
          {[
            ['bg-emerald-500', '0-30d'],
            ['bg-amber-500', '31-60d'],
            ['bg-orange-500', '61-90d'],
            ['bg-rose-500', '90d+'],
          ].map(([color, label]) => (
            <div key={label} className="flex items-center gap-2">
              <div className={`w-3 h-3 rounded-sm ${color}`} />
              {label}
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
};
