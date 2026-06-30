'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
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
import { OutreachOpportunity } from '@/entities/lead';
import { BusinessHealthWidget } from '@/features/houston/ui/components/BusinessHealthWidget';

export const PipelineTab: React.FC<{
  opportunities: OutreachOpportunity[];
  telemetry: HoustonTelemetry;
}> = ({ opportunities, telemetry }) => {
  const handleShare = async (opp: OutreachOpportunity) => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Oportunidad: ${opp.suggestedAction}`,
          text: `Richard Automotive - Lead: ${opp.reason}. ROI Potencial: ${opp.potentialRoi}x`,
          url: window.location.href,
        });
      } catch (e) {
        console.error('Share failed:', e);
      }
    }
  };

  return (
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
          {
            label: 'Closing Prob. (MTD)',
            value: '78%',
            color: 'text-cyan-400',
            icon: <LineChart size={16} />,
          },
          {
            label: 'Hot Leads Activos',
            value: '+12',
            color: 'text-emerald-400',
            icon: <Activity size={16} />,
          },
          {
            label: 'EST ROI Mensual',
            value: '2.4x',
            color: 'text-white',
            icon: <DollarSign size={16} />,
          },
          {
            label: 'Autonomy Score',
            value: `${telemetry.metrics.autonomyRate?.value ?? 0}%`,
            color: 'text-purple-400',
            icon: <Shield size={16} />,
          },
        ].map((kpi, i) => (
          <div
            key={i}
            className="glass-premium p-5 border border-white/5 hover:border-white/10 transition-all group"
          >
            <div className="flex items-center gap-2 mb-3">
              <span className="text-slate-500 group-hover:text-slate-300 transition-colors">
                {kpi.icon}
              </span>
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
              <span className="text-[10px] text-slate-500 uppercase font-black tracking-[0.2em]">
                Prob. Cierre (MTD)
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
                className="h-full bg-linear-to-r from-cyan-600 via-cyan-400 to-white/40 rounded-full shadow-[0_0_20px_rgba(0,174,217,0.6)]"
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
                `¡Hola ${name}! 👋 Ví que tienes interés en ${vehicle}. Tu pre-aprobación FlexDrive™ está lista. ¿Seguimos?`,
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
                      currentOffer: opp.suggestedAction,
                    }),
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
                  className="p-5 border border-white/5 rounded-2xl bg-white/2 group relative hover:bg-white/5 transition-all overflow-hidden active:bg-white/10"
                >
                  <div className="absolute left-0 top-0 bottom-0 w-1 bg-emerald-500 opacity-30 group-hover:opacity-100 group-hover:w-1.5 transition-all shadow-[0_0_12px_#10b981]" />
                  <p className="text-[12px] md:text-[11px] text-slate-400 font-bold leading-relaxed mb-4 group-hover:text-white transition-colors">
                    <span className="text-emerald-500 mr-2 text-sm">🎯</span>
                    {opp.reason}
                  </p>
                  <div className="flex items-center justify-between gap-4 flex-wrap">
                    <span className="text-[10px] font-black text-emerald-400 uppercase tracking-widest bg-emerald-500/10 px-4 py-1.5 rounded-xl border border-emerald-500/20">
                      {opp.suggestedAction}
                    </span>
                    <div className="flex items-center gap-3 w-full sm:w-auto">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleShare(opp);
                        }}
                        className="p-3 bg-white/5 border border-white/10 text-slate-400 rounded-xl hover:bg-white/10 hover:text-white transition-all active:scale-95"
                        aria-label={`Compartir oportunidad para ${name}`}
                      >
                        <Share2 size={14} aria-hidden="true" />
                      </button>
                      <a
                        href={waLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-3 bg-[#25D366]/10 border border-[#25D366]/30 text-[#25D366] rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-[#25D366]/20 hover:border-[#25D366]/50 transition-all active:scale-95"
                        aria-label={`Enviar WhatsApp a ${name}`}
                      >
                        <svg
                          width="14"
                          height="14"
                          viewBox="0 0 24 24"
                          fill="currentColor"
                          aria-hidden="true"
                        >
                          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.464 3.488z" />
                        </svg>
                        WhatsApp
                      </a>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleJulesClosing();
                        }}
                        className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-3 bg-violet-600/20 border border-violet-500/30 text-violet-400 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-violet-600/30 hover:border-violet-500/50 transition-all active:scale-95 group/jules"
                        aria-label="Dejar que Jules cierre el negocio"
                      >
                        <Sparkles
                          size={14}
                          aria-hidden="true"
                          className="group-hover/jules:animate-pulse"
                        />
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
};
