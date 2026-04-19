"use client";

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
} from 'lucide-react';
import { DI } from '@/app/(dashboard)/di/registry';
import { HoustonTelemetry } from '@/entities/houston';
import { OutreachOpportunity } from '@/entities/lead';
import { useMouseGlow } from '@/shared/ui/hooks/useMouseGlow';
import { BusinessHealthWidget } from './ui/BusinessHealthWidget';
import { SourcingLogWidget } from '@/features/houston/ui/components/SourcingLogWidget';
import { useBusinessTelemetry } from '@/entities/houston/api/useBusinessTelemetry';

// ─── Isolated Jitter Label ───────────────────────────────────────────────────
const JitterLabel: React.FC<{ metricKey: string }> = ({ metricKey }) => {
  const [value, setValue] = useState<number | null>(null);

  useEffect(() => {
    const getJitter = () => {
      switch (metricKey) {
        case 'inferenceLatency': return (Math.random() - 0.5) * 4;
        case 'tokenUsage': return Math.floor((Math.random() - 0.5) * 50);
        case 'apiStability': return (Math.random() - 0.5) * 0.02;
        default: return null;
      }
    };
    const interval = setInterval(() => setValue(getJitter()), 800);
    return () => clearInterval(interval);
  }, [metricKey]);

  if (value === null) return null;

  return (
    <div className="absolute bottom-2 right-6 text-[9px] font-black text-cyan-500/20">
      MOD: {value > 0 ? '+' : ''}{value.toFixed(metricKey === 'apiStability' ? 3 : 1)}
    </div>
  );
};

// ─── Tab Definitions ──────────────────────────────────────────────────────────
type DashboardTab = 'PIPELINE' | 'SOURCING' | 'TELEMETRY' | 'LOGS';

const TABS: { id: DashboardTab; label: string; icon: React.ReactNode; accentColor: string }[] = [
  {
    id: 'PIPELINE',
    label: 'Financial Pipeline',
    icon: <DollarSign size={14} />,
    accentColor: 'emerald',
  },
  {
    id: 'TELEMETRY',
    label: 'IT Telemetry',
    icon: <Gauge size={14} />,
    accentColor: 'cyan',
  },
  {
    id: 'SOURCING',
    label: 'Sourcing Intelligence',
    icon: <PackageSearch size={14} />,
    accentColor: 'purple',
  },
  {
    id: 'LOGS',
    label: 'Sentinel Logs',
    icon: <TerminalIcon size={14} />,
    accentColor: 'amber',
  },
];

// ─── Tab: Financial Pipeline ──────────────────────────────────────────────────
const PipelineTab: React.FC<{
  opportunities: OutreachOpportunity[];
  telemetry: HoustonTelemetry;
}> = ({ opportunities, telemetry }) => (
  <motion.div
    key="pipeline"
    initial={{ opacity: 0, y: 16 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -16 }}
    transition={{ duration: 0.35, ease: 'easeOut' }}
    className="grid grid-cols-1 xl:grid-cols-3 gap-6"
  >
    {/* KPI Row */}
    <div className="xl:col-span-3 grid grid-cols-2 md:grid-cols-4 gap-4">
      {[
        { label: 'Closing Prob. (MTD)', value: '78%', color: 'text-cyan-400', icon: <LineChart size={16} /> },
        { label: 'Hot Leads Activos', value: '+12', color: 'text-emerald-400', icon: <Activity size={16} /> },
        { label: 'EST ROI Mensual', value: '2.4x', color: 'text-white', icon: <DollarSign size={16} /> },
        { label: 'Autonomy Score', value: `${telemetry.metrics.autonomyRate?.value ?? 0}%`, color: 'text-purple-400', icon: <Shield size={16} /> },
      ].map((kpi, i) => (
        <div key={i} className="glass-premium p-5 border border-white/5 hover:border-white/10 transition-all group">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-slate-500 group-hover:text-slate-300 transition-colors">{kpi.icon}</span>
            <p className="text-[10px] text-slate-500 uppercase font-black tracking-[0.2em] group-hover:text-slate-400 transition-colors">
              {kpi.label}
            </p>
          </div>
          <p className={`text-4xl font-black tracking-tighter ${kpi.color}`}>{kpi.value}</p>
        </div>
      ))}
    </div>

    {/* Closing Probability Bar */}
    <div className="xl:col-span-1 glass-premium p-6 border border-cyan-500/20 bg-cyan-500/[0.02]">
      <h3 className="text-[10px] font-black text-cyan-400 uppercase tracking-[0.4em] flex items-center gap-3 mb-8">
        <Activity size={16} /> Forecast Engine_v2
      </h3>
      <div className="space-y-6">
        <div>
          <div className="flex justify-between items-end mb-3">
            <span className="text-[10px] text-slate-500 uppercase font-black tracking-[0.2em]">Prob. Cierre (MTD)</span>
            <span className="text-3xl font-black text-white tracking-tighter">78<span className="text-lg text-cyan-500/50">%</span></span>
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
        <BusinessHealthWidget />
      </div>
    </div>

    {/* Hot Leads / Outreach Opportunities */}
    <div className="xl:col-span-2 glass-premium p-6 border border-white/5">
      <h3 className="text-[10px] font-black text-emerald-400 uppercase tracking-[0.4em] flex items-center gap-3 mb-6">
        <MessageSquare size={16} /> Hot Leads — Oportunidades Inmediatas
      </h3>
      <div className="space-y-4 max-h-[420px] overflow-y-auto custom-scrollbar pr-2">
        {opportunities.length > 0 ? (
          opportunities.map((opp, idx) => {
            const phone = (opp as any).phone || '17873682880';
            const name = (opp as any).name || 'Cliente';
            const vehicle = (opp as any).vehicleOfInterest || 'tu próximo vehículo';
            const waMsg = encodeURIComponent(
              `¡Hola ${name}! 👋 Ví que tienes interés en ${vehicle}. Tu pre-aprobación FlexDrive™ está lista. ¿Seguimos?`
            );
            const waLink = `https://wa.me/${phone.replace(/\D/g, '')}?text=${waMsg}`;

            const handleJulesClosing = async () => {
              try {
                const res = await fetch('/api/command-center/outreach/generate', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({
                    leadName: name,
                    vehicleOfInterest: vehicle,
                    creditProfile: (opp as any).creditProfile || 'Good',
                    currentOffer: opp.suggestedAction
                  })
                });
                const data = await res.json();
                if (data.message) {
                  const julesWaLink = `https://wa.me/${phone.replace(/\D/g, '')}?text=${encodeURIComponent(data.message)}`;
                  window.open(julesWaLink, '_blank');
                }
              } catch (e) {
                console.error('Jules failed to close:', e);
                window.open(waLink, '_blank');
              }
            };

            return (
              <motion.div
                key={idx}
                initial={{ x: 20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.1 + idx * 0.08 }}
                className="p-4 border border-white/5 rounded-2xl bg-white/2 group relative hover:bg-white/5 transition-all overflow-hidden"
              >
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-emerald-500 opacity-30 group-hover:opacity-100 group-hover:w-1.5 transition-all shadow-[0_0_12px_#10b981]" />
                <p className="text-[11px] text-slate-400 font-bold leading-relaxed mb-3 group-hover:text-white transition-colors">
                  <span className="text-emerald-500 mr-2 text-sm">🎯</span>
                  {opp.reason}
                </p>
                <div className="flex items-center justify-between gap-3 flex-wrap">
                  <span className="text-[10px] font-black text-emerald-400 uppercase tracking-widest bg-emerald-500/10 px-3 py-1 rounded-lg border border-emerald-500/20">
                    {opp.suggestedAction}
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-black text-cyan-500 uppercase tracking-widest">
                      {opp.potentialRoi}x ROI
                    </span>
                    <a
                      href={waLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-[#25D366]/10 border border-[#25D366]/30 text-[#25D366] rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-[#25D366]/20 hover:border-[#25D366]/50 transition-all active:scale-95"
                      title="Enviar WhatsApp"
                    >
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.464 3.488z"/>
                      </svg>
                      WhatsApp
                    </a>
                    <button
                      onClick={(e) => { e.stopPropagation(); handleJulesClosing(); }}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-violet-600/20 border border-violet-500/30 text-violet-400 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-violet-600/30 hover:border-violet-500/50 transition-all active:scale-95 group/jules"
                      title="Dejar que Jules cierre el negocio"
                    >
                      <Sparkles size={12} className="group-hover/jules:animate-pulse" />
                      Jules Close
                    </button>
                  </div>
                </div>
              </motion.div>
            );
          })
        ) : (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <div className="w-8 h-8 rounded-full border-2 border-emerald-500/20 border-t-emerald-500 animate-spin" />
            <span className="text-[10px] text-slate-500 font-black uppercase tracking-[0.3em]">
              Scanning Opportunities...
            </span>
          </div>
        )}
      </div>
    </div>
  </motion.div>
);

// ─── Tab: IT Telemetry ────────────────────────────────────────────────────────
const TelemetryTab: React.FC<{ telemetry: HoustonTelemetry }> = ({ telemetry }) => {
  const heatmapData = useMemo(
    () => [...Array(50)].map((_, i) => ({ age: (i * 7) % 120, id: `unit-${i}-${Math.abs(Math.sin(i)).toString(36).substring(7)}` })),
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
          const glowClass = isPurple ? 'group-hover:border-purple-500/40' : 'group-hover:border-cyan-500/40';
          const colorClass = isPurple ? 'text-purple-400' : 'text-cyan-400';
          return (
            <div key={key} className={`glass-premium p-5 border border-white/5 ${glowClass} transition-all group overflow-hidden relative cursor-default`}>
              <div className={`absolute -right-4 -top-4 opacity-0 group-hover:opacity-10 transition-all duration-700 ${isPurple ? 'text-purple-500' : 'text-cyan-500'}`}>
                {key === 'inferenceLatency' && <Zap size={100} />}
                {key === 'tokenUsage' && <Cpu size={100} />}
                {key === 'autonomyRate' && <Shield size={100} />}
                {key === 'apiStability' && <Server size={100} />}
              </div>
              <p className={`text-[10px] uppercase tracking-[0.3em] ${isPurple ? 'text-purple-500/60' : 'text-cyan-500/60'} font-black mb-2`}>
                {metric.label}
              </p>
              <div className="flex items-end gap-2">
                <span className={`text-4xl font-black text-white tracking-tighter`}>{metric.value}</span>
                <span className="text-xs text-slate-500 mb-1 font-black uppercase tracking-widest opacity-60">{metric.unit}</span>
              </div>
              <div className="mt-4 flex items-center justify-between">
                <span className={`text-[10px] font-black px-2 py-1 rounded-lg border ${metric.status === 'healthy' ? 'border-emerald-500/20 text-emerald-400 bg-emerald-500/5' : 'border-amber-500/20 text-amber-400 bg-amber-500/5'}`}>
                  {metric.status.toUpperCase()}
                </span>
                <div className={`flex items-center gap-2 text-[9px] font-black ${isPurple ? 'text-purple-500/40' : 'text-cyan-500/40'}`}>
                  <div className={`w-1.5 h-1.5 ${isPurple ? 'bg-purple-400' : 'bg-cyan-400'} rounded-full animate-ping`} />
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
          <div className="absolute -right-4 -top-4 opacity-5 group-hover:opacity-20 transition-all duration-700 text-emerald-500"><CarIcon size={100} /></div>
          <p className="text-[10px] uppercase tracking-[0.3em] text-emerald-500/60 font-black mb-2">Appraisal Pulse</p>
          <div className="flex items-end gap-2">
            <span className="text-4xl font-black text-white tracking-tighter">24</span>
            <span className="text-xs text-slate-500 mb-1 font-black uppercase tracking-widest">/ 24H</span>
          </div>
          <div className="mt-4 flex items-center justify-between">
            <span className="text-[10px] font-black px-2 py-1 rounded-lg border border-emerald-500/20 text-emerald-400 bg-emerald-500/5 uppercase">RA_Intelligence</span>
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
            <div className="w-2.5 h-2.5 bg-red-500 rounded-full shadow-[0_0_12px_#ef4444] animate-pulse" /> Inventory Stock Matrix
          </h3>
          <div className="flex items-center gap-3 px-4 py-1.5 border border-cyan-500/20 rounded-full bg-cyan-500/5">
            <div className="flex gap-1 h-3">
              {[...Array(4)].map((_, i) => (
                <div key={i} className={`w-1 h-full bg-cyan-500/40 animate-pulse ${styles[`delay-${i * 250}`]}`} />
              ))}
            </div>
            <span className="text-[9px] text-cyan-400 font-black uppercase tracking-widest animate-pulse">Processing...</span>
          </div>
        </div>
        <div className="grid grid-cols-10 gap-3 relative z-10">
          {heatmapData.map((item, i) => {
            const { age } = item;
            const color = age > 90 ? 'bg-rose-500 shadow-[0_0_15px_rgba(244,63,94,0.4)]'
              : age > 60 ? 'bg-orange-500' : age > 30 ? 'bg-amber-500' : 'bg-emerald-500';
            return (
              <motion.div
                key={item.id}
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.3 + i * 0.006 }}
                className={`${color} aspect-square rounded-md border border-white/5 cursor-help hover:scale-150 hover:z-30 hover:border-white/30 transition-all group/item relative`}
                title={`Unit RA-${1000 + i}: ${age} days`}
              >
                {age > 90 && <div className="absolute inset-0 bg-white/10 animate-ping rounded-md" />}
              </motion.div>
            );
          })}
        </div>
        <div className="mt-10 grid grid-cols-3 gap-6 relative z-10">
          {[
            { label: 'Avg Dwell Time', value: '42', suffix: 'd', style: 'bg-white/3 border-white/5', text: 'text-white' },
            { label: 'Critical Units', value: '0.8', suffix: 'k', style: 'bg-rose-500/[0.03] border-rose-500/10', text: 'text-rose-500' },
          ].map((stat, i) => (
            <div key={i} className={`p-5 ${stat.style} rounded-3xl border hover:translate-y-[-4px] transition-all`}>
              <p className="text-[9px] text-slate-500 uppercase font-black tracking-widest mb-2">{stat.label}</p>
              <p className={`text-3xl font-black ${stat.text} tracking-tighter`}>{stat.value}<span className="text-lg text-slate-500 ml-1">{stat.suffix}</span></p>
            </div>
          ))}
          <div className="p-5 bg-emerald-500/[0.03] rounded-3xl border border-emerald-500/10 flex items-center gap-4 hover:translate-y-[-4px] transition-all">
            <div className="p-3 bg-emerald-500/10 rounded-2xl"><CheckCircle2 size={24} className="text-emerald-500" /></div>
            <div className="flex-1">
              <div className="flex justify-between items-center mb-2">
                <p className="text-[9px] text-emerald-500 uppercase font-black tracking-widest">Efficiency</p>
                <span className="text-[11px] font-black text-white">94%</span>
              </div>
              <div className="h-1.5 w-full bg-emerald-500/10 rounded-full overflow-hidden">
                <motion.div initial={{ width: 0 }} animate={{ width: '94%' }} transition={{ duration: 1.2, ease: 'circOut' }}
                  className="h-full bg-emerald-500 shadow-[0_0_10px_#10b981]" />
              </div>
            </div>
          </div>
        </div>

        {/* Legend */}
        <div className="mt-6 flex items-center gap-6 text-[10px] font-black text-slate-500 uppercase tracking-widest relative z-10">
          {[['bg-emerald-500', '0-30d'], ['bg-amber-500', '31-60d'], ['bg-orange-500', '61-90d'], ['bg-rose-500', '90d+']].map(([color, label]) => (
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

// ─── Tab: Sentinel Logs ───────────────────────────────────────────────────────
const LogsTab: React.FC<{ telemetry: HoustonTelemetry }> = ({ telemetry }) => {
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
      {/* Sentinel Analysis */}
      <div className="xl:col-span-1 glass-premium glass-sentinel p-8 border border-white/5 group relative overflow-hidden">
        <div className="absolute -right-12 -bottom-12 bg-amber-500/10 w-32 h-32 rounded-full blur-3xl group-hover:bg-amber-500/20 transition-all duration-1000" />
        <AlertCircle className="text-amber-500 mb-6 animate-bounce-slow" size={36} />
        <h3 className="text-xl font-black text-white uppercase mb-6 tracking-tighter">Sentinel Analysis</h3>
        <ul className="space-y-8 text-xs text-slate-400">
          {[
            { label: 'Inference', content: 'Optimizador táctico activo. Latencia -14% vs baseline temporal.' },
            { label: 'Autonomy', content: 'Richard AI ejecutando flujos de prospección nivel 14.' },
            { label: 'Appraisals', content: 'RA_VALUATOR detectó tendencia alcista en inventario Europeo.' },
          ].map((insight, idx) => (
            <li key={idx} className="flex gap-4 group/li">
              <div className="w-2 h-2 bg-amber-500 rounded-full mt-1.5 shrink-0 group-hover/li:scale-150 transition-transform shadow-[0_0_12px_#f59e0b]" />
              <p className="leading-relaxed">
                <span className="text-white font-black uppercase tracking-[0.2em] text-[10px] block mb-1">{insight.label}</span>
                {insight.content}
              </p>
            </li>
          ))}
        </ul>
      </div>

      {/* Live Terminal Feed */}
      <div className="xl:col-span-2 glass-premium border border-white/5 p-8 flex flex-col h-[600px] group/terminal">
        <div className="flex items-center gap-4 mb-6">
          <TerminalIcon size={18} className="text-cyan-500 group-hover/terminal:rotate-90 transition-transform duration-500" />
          <span className="text-xs uppercase font-black text-slate-400 tracking-[0.5em]">SOVEREIGN_FEED</span>
          <div className="ml-auto flex items-center gap-4">
            <div className="flex gap-1 h-3.5">
              {[...Array(3)].map((_, i) => (
                <div key={i} className={`w-1 h-full bg-cyan-500/40 animate-pulse ${styles[`delay-${i * 150}`]}`} />
              ))}
            </div>
            <span className="text-[10px] text-cyan-500/60 uppercase font-black tracking-widest">Secure_Uplink</span>
          </div>
        </div>
        <div ref={terminalRef} className="flex-1 overflow-y-auto space-y-3 custom-scrollbar pr-4 scroll-smooth">
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
                <span className={`uppercase font-black min-w-[80px] tracking-widest ${
                  event.type === 'error' ? 'text-red-500'
                  : event.type === 'warning' ? 'text-amber-400'
                  : 'text-cyan-400'
                }`}>{event.type}</span>
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

// ─── PWA Install Prompt Hook ──────────────────────────────────────────────────
const usePWAInstall = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isInstallable, setIsInstallable] = useState(false);

  useEffect(() => {
    const handler = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setIsInstallable(true);
    };
    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const installPWA = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setDeferredPrompt(null);
      setIsInstallable(false);
    }
  };

  return { isInstallable, installPWA };
};

// ─── Main Component ───────────────────────────────────────────────────────────
const HoustonDashboard: React.FC = () => {
  const [telemetry, setTelemetry] = useState<HoustonTelemetry | null>(null);
  const [opportunities, setOpportunities] = useState<OutreachOpportunity[]>([]);
  const [activeTab, setActiveTab] = useState<DashboardTab>('PIPELINE');
  const { isInstallable, installPWA } = usePWAInstall();
  const { businessData, refresh: refreshBusiness } = useBusinessTelemetry();
  const { containerRef } = useMouseGlow();

  const getHoustonTelemetry = useMemo(() => DI.getHoustonTelemetryUseCase(), []);
  const identifyOutreachOpportunities = useMemo(() => DI.getIdentifyOutreachOpportunitiesUseCase(), []);

  useEffect(() => {
    const unsubscribe = getHoustonTelemetry.subscribe((data: HoustonTelemetry) => setTelemetry(data));
    identifyOutreachOpportunities.execute(80).then(setOpportunities);
    return () => unsubscribe();
  }, [getHoustonTelemetry, identifyOutreachOpportunities]);

  if (!telemetry)
    return (
      <div className="h-screen bg-slate-950 flex items-center justify-center">
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="flex flex-col items-center">
          <Radio className="text-cyan-500 animate-pulse mb-4" size={48} />
          <p className="text-cyan-500 font-mono tracking-widest uppercase text-xs">Uplink: Establishing Terminal...</p>
        </motion.div>
      </div>
    );

  return (
    <div ref={containerRef as any} className="min-h-screen bg-[#02060a] text-slate-300 font-mono p-4 md:p-8 relative overflow-hidden mesh-bg select-none">
      {/* Ambient Glow */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] bg-cyan-500/5 blur-[160px] rounded-full animate-pulse" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[60%] h-[60%] bg-purple-500/5 blur-[160px] rounded-full animate-pulse [animation-delay:3s]" />
      </div>
      {/* Scanline */}
      <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.1)_50%),linear-gradient(90deg,rgba(255,0,0,0.03),rgba(0,255,0,0.01),rgba(0,0,255,0.03))] z-50 bg-[length:100%_2px,3px_100%] opacity-20" />

      {/* Header */}
      <motion.header initial={{ y: -50, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4 relative z-10">
        <div>
          <h1 className="text-5xl font-black text-white tracking-tighter mb-2 flex items-center gap-4 group">
            <TerminalIcon className="text-cyan-500 group-hover:rotate-12 transition-transform" size={36} />
            Houston
            <span className="text-cyan-500 text-lg font-mono tracking-[0.5em] ml-4 opacity-70">RA SENTINEL</span>
          </h1>
          <div className="flex items-center gap-6 text-[10px] text-slate-500 uppercase tracking-[0.2em] font-black">
            <span className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${telemetry.systemHealth === 'online' ? 'bg-emerald-500 shadow-[0_0_10px_#10b981] animate-pulse' : 'bg-red-500'}`} />
              {telemetry.systemHealth.toUpperCase()}
            </span>
            <span className="border-l border-white/10 pl-6">Up: <span className="text-slate-300">99.99%</span></span>
            <span className="border-l border-white/10 pl-6">HQ_SAN_JUAN</span>
          </div>
        </div>
        {/* Autonomy Score Badge */}
        <div className="glass-premium px-8 py-5 flex items-center gap-8 border border-white/5 hover:scale-[1.02] transition-all cursor-pointer shadow-xl relative overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
          <div className="text-right">
            <p className="text-[10px] text-slate-500 uppercase font-black tracking-[0.3em] mb-1">Autonomy Score</p>
            <p className="text-3xl font-black text-white group-hover:text-cyan-400 transition-colors tracking-tighter">
              {telemetry.metrics.autonomyRate.value}<span className="text-lg text-cyan-500/50">%</span>
            </p>
          </div>
          <div className="p-3 bg-cyan-500/10 rounded-2xl group-hover:bg-cyan-500/20 transition-colors">
            <Activity className="text-cyan-500 animate-pulse" size={28} />
          </div>
        </div>
        {/* PWA Install Action */}
        {isInstallable && (
          <motion.button
            initial={{ x: 20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={installPWA}
            className="glass-premium px-6 py-5 flex items-center gap-4 border border-cyan-500/20 hover:bg-cyan-500/10 transition-all cursor-pointer shadow-xl group/install ml-auto md:ml-0"
          >
            <div className="text-right">
              <p className="text-[10px] text-cyan-500/70 uppercase font-black tracking-[0.3em] mb-1">Mobile Access</p>
              <p className="text-xl font-black text-white group-hover:text-cyan-400 transition-colors tracking-tighter">
                INSTALL APP
              </p>
            </div>
            <div className="p-2 bg-cyan-500/20 rounded-xl group-hover:animate-bounce">
              <Download className="text-cyan-400" size={20} />
            </div>
          </motion.button>
        )}
      </motion.header>

      {/* Tab Navigation */}
      <div className="relative z-10 mb-8">
        <div className="flex gap-2 p-1 bg-white/[0.03] border border-white/5 rounded-2xl w-fit">
          {TABS.map((tab) => {
            const isActive = activeTab === tab.id;
            const accentMap: Record<string, string> = {
              emerald: 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300 shadow-[0_0_20px_rgba(16,185,129,0.15)]',
              cyan: 'bg-cyan-500/20 border-cyan-500/40 text-cyan-300 shadow-[0_0_20px_rgba(0,229,255,0.15)]',
              purple: 'bg-purple-500/20 border-purple-500/40 text-purple-300 shadow-[0_0_20px_rgba(168,85,247,0.15)]',
              amber: 'bg-amber-500/20 border-amber-500/40 text-amber-300 shadow-[0_0_20px_rgba(245,158,11,0.15)]',
            };
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-[11px] font-black uppercase tracking-[0.2em] border transition-all duration-300 ${
                  isActive
                    ? accentMap[tab.accentColor]
                    : 'border-transparent text-slate-500 hover:text-slate-300 hover:bg-white/5'
                }`}
              >
                {tab.icon}
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Tab Content */}
      <div className="relative z-10">
        <AnimatePresence mode="wait">
          {activeTab === 'PIPELINE' && <PipelineTab key="pipeline" opportunities={opportunities} telemetry={telemetry} />}
          {activeTab === 'SOURCING' && (
            <motion.div
              key="sourcing"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -16 }}
              className="grid grid-cols-1 lg:grid-cols-3 gap-6"
            >
              <div className="lg:col-span-2">
                <SourcingLogWidget 
                  orders={businessData?.purchaseOrders || []} 
                  onUpdate={refreshBusiness}
                />
              </div>
              <div className="lg:col-span-1 space-y-6">
                <div className="glass-premium p-6 border border-purple-500/20 bg-purple-500/[0.02] relative overflow-hidden h-full">
                  <div className="absolute top-0 right-0 p-4 opacity-10"><TrendingUp size={80} className="text-purple-400" /></div>
                  <h3 className="text-[10px] font-black text-purple-400 uppercase tracking-[0.4em] mb-8">ROI Financial Forecast</h3>
                  
                  <div className="space-y-8">
                    <div>
                      <p className="text-[9px] text-slate-500 uppercase font-black tracking-widest mb-4">Pipeline Profitability</p>
                      <div className="flex items-end gap-3 mb-4">
                        <span className="text-5xl font-black text-white tracking-tighter">
                          ${((businessData?.purchaseOrders?.length || 0) * 1250).toLocaleString()}
                        </span>
                        <span className="text-sm text-emerald-400 font-bold mb-2">+14.2% Est.</span>
                      </div>
                      <div className="h-1.5 w-full bg-slate-900 rounded-full overflow-hidden border border-white/5">
                        <motion.div 
                          initial={{ width: 0 }}
                          animate={{ width: '68%' }}
                          className="h-full bg-gradient-to-r from-purple-600 to-violet-400 shadow-[0_0_15px_#8b5cf6]"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-4 bg-white/[0.02] border border-white/5 rounded-2xl">
                        <p className="text-[8px] text-slate-500 uppercase font-black tracking-widest mb-1">Cap. en Riesgo</p>
                        <p className="text-lg font-black text-white">$42.5k</p>
                      </div>
                      <div className="p-4 bg-white/[0.02] border border-white/5 rounded-2xl">
                        <p className="text-[8px] text-slate-500 uppercase font-black tracking-widest mb-1">Turn Rate</p>
                        <p className="text-lg font-black text-emerald-400">18.4d</p>
                      </div>
                    </div>

                    <div className="p-4 border border-purple-500/20 bg-purple-500/5 rounded-2xl">
                      <p className="text-[9px] text-purple-400 font-bold leading-relaxed">
                        "Sentinel detectó 12.4% de incremento en la demanda de SUVs compactas en el norte de la isla."
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
          {activeTab === 'TELEMETRY' && <TelemetryTab key="telemetry" telemetry={telemetry} />}
          {activeTab === 'LOGS' && <LogsTab key="logs" telemetry={telemetry} />}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default HoustonDashboard;
