'use client';

import React, { useState, useEffect, useRef } from 'react';
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

export const LogsTab: React.FC<{ telemetry: HoustonTelemetry }> = ({ telemetry }) => {
  const terminalRef = React.useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (terminalRef.current) terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
  }, [telemetry.recentEvents]);

  return (
    <motion.div
      key="logs"
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -16 }}
      transition={{ duration: 0.35, ease: 'easeOut' }}
      className="grid grid-cols-1 xl:grid-cols-3 gap-6"
    >
      {/* Análisis */}
      <div className="xl:col-span-1 glass-premium glass-sentinel p-8 border border-white/5 group relative overflow-hidden">
        <div className="absolute -right-12 -bottom-12 bg-amber-500/10 w-32 h-32 rounded-full blur-3xl group-hover:bg-amber-500/20 transition-all duration-1000" />
        <AlertCircle className="text-amber-500 mb-6 animate-bounce-slow" size={36} />
        <h3 className="text-xl font-black text-white uppercase mb-6 tracking-tighter">
          Análisis de Datos
        </h3>
        <ul className="space-y-8 text-xs text-slate-400">
          {[
            {
              label: 'Inference',
              content: 'Optimizador táctico activo. Latencia -14% vs baseline temporal.',
            },
            { label: 'Autonomy', content: 'Richard ejecutando flujos de prospección nivel 14.' },
            {
              label: 'Appraisals',
              content: 'RA_VALUATOR detectó tendencia alcista en inventario Europeo.',
            },
          ].map((insight, idx) => (
            <li key={idx} className="flex gap-4 group/li">
              <div className="w-2 h-2 bg-amber-500 rounded-full mt-1.5 shrink-0 group-hover/li:scale-150 transition-transform shadow-[0_0_12px_#f59e0b]" />
              <p className="leading-relaxed">
                <span className="text-white font-black uppercase tracking-[0.2em] text-[10px] block mb-1">
                  {insight.label}
                </span>
                {insight.content}
              </p>
            </li>
          ))}
        </ul>
      </div>

      {/* Live Terminal Feed */}
      <div className="xl:col-span-2 glass-premium border border-white/5 p-8 flex flex-col h-[600px] group/terminal">
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
                      ? 'text-red-500'
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
      </div>
    </motion.div>
  );
};
