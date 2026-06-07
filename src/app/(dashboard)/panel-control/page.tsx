'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Brain,
  MessageSquare,
  TrendingUp,
  Database,
  RefreshCcw,
  AlertTriangle,
  CheckCircle2,
  Zap,
  Shield,
  Activity,
  Search,
  Users,
  ChevronRight,
  Flame,
  Target,
} from 'lucide-react';
import { NeuralSearchTicker } from '@/features/houston/ui/components/NeuralSearchTicker';
import { SourcingLogWidget } from '@/features/houston/ui/components/SourcingLogWidget';
import { HoloDashboard } from '@/features/houston/ui/components/HoloDashboard';
import { NewsroomControlWidget } from '@/features/houston/ui/components/NewsroomControlWidget';
import TelemetryFeedWidget from '@/features/dashboard/ui/TelemetryFeedWidget';
import { SentinelLocalSEO } from '@/features/command-center/ui/SentinelLocalSEO';
import { SentinelFinancialOptimizer } from '@/features/command-center/ui/SentinelFinancialOptimizer';
import { BusinessHealthWidget } from '@/widgets/dashboard/ui/BusinessHealthWidget';
import { MarketPulseWidget } from '@/features/market-intelligence/ui/MarketPulseWidget';
import { SentinelDistributionWidget } from '@/features/command-center/ui/SentinelDistributionWidget';
import { PurchaseOrder } from '@/entities/houston/model/types';
import {
  SentinelIntelligenceWidget,
  IntelligenceSignal,
} from '@/features/command-center/ui/SentinelIntelligenceWidget';
import { RichardAIAdvisor } from '@/features/command-center/ui/RichardAIAdvisor';
import { subscribeDashboard } from '@/shared/api/realtime/dashboardChannel';

interface HotLead {
  id: string;
  name: string;
  phone: string;
  interest?: string;
  score: number;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  factors: string[];
}

interface TelemetryData {
  timestamp: string;
  summary: {
    leads_last_24h: number;
    avg_score: number;
    inventory_coverage: number;
    distribution_health?: number;
  };
  hotLeads: HotLead[];
  neuralSearch: { recent_gaps: any[]; gap_count: number };
  whatsapp: { sent: number; scheduled: number; failed: number };
  distribution?: { active: number; pending: number; error: number };
  purchaseOrders: PurchaseOrder[];
  signals?: IntelligenceSignal[];
  version?: string;
}

const CARD_CLASSES =
  'relative bg-slate-900/60 backdrop-blur-xl border border-white/[0.06] rounded-2xl p-6 overflow-hidden hover:border-white/10 transition-all duration-500';

export default function CommandCenterPage() {
  const [data, setData] = useState<TelemetryData | null>(null);
  const [signals, setSignals] = useState<IntelligenceSignal[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastRefresh, setLastRefresh] = useState<Date | null>(null);
  const [syncing, setSyncing] = useState(false);

  const fetchTelemetry = useCallback(async () => {
    try {
      setLoading(true);
      const telemetryRes = await fetch('/api/command-center/telemetry', {
        headers: { 'x-antigravity-token': 'client-internal' },
      });

      if (telemetryRes.ok) {
        const json = await telemetryRes.json();
        setData(json);
        setSignals(json.signals || []);
      }

      setLastRefresh(new Date());
    } catch (err) {
      console.error('[CommandCenter] Data fetch failed:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const triggerBulkSync = async () => {
    setSyncing(true);
    try {
      const res = await fetch('/api/inventory/ingest', {
        headers: { 'x-antigravity-token': 'client-internal' },
      });
      if (res.ok) {
        const result = await res.json();
        alert(`✅ Sync completo: ${result.processed} unidades procesadas inteligentes.`);
        fetchTelemetry();
      }
    } catch (err) {
      alert('❌ Error durante la sincronización inteligente.');
    } finally {
      setSyncing(false);
    }
  };

  useEffect(() => {
    fetchTelemetry();
    const unsubscribe = subscribeDashboard(() => {
      fetchTelemetry();
    });
    return () => unsubscribe();
  }, [fetchTelemetry]);

  return (
    <div className="min-h-screen bg-slate-950 text-white selection:bg-cyan-500/30 overflow-hidden relative">
      {/* Cinematic Scanline */}
      <div className="scanline-overlay" />
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-white/5 bg-slate-950/80 backdrop-blur-2xl">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="relative">
              <div className="w-3 h-3 bg-emerald-400 rounded-full animate-pulse" />
              <div className="absolute inset-0 w-3 h-3 bg-emerald-400 rounded-full animate-ping opacity-40" />
            </div>
            <div>
              <h1
                className="text-lg font-black uppercase tracking-[0.25em]"
                style={{ fontFamily: 'var(--font-cinematic)' }}
              >
                Panel de <span className="text-cyan-400">Control</span>
              </h1>
              <p className="text-[10px] text-slate-500 tracking-widest uppercase font-bold">
                Nivel 24 • Monitoreo Activo
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <button
              onClick={fetchTelemetry}
              disabled={loading}
              className="px-2 sm:px-4 py-2 bg-slate-800/50 rounded-xl border border-white/5 text-xs text-slate-300 hover:text-white transition-all flex items-center gap-1 sm:gap-2"
            >
              <RefreshCcw className={`w-4 h-4 sm:w-3.5 sm:h-3.5 ${loading ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline">Update</span>
            </button>
            <button
              onClick={triggerBulkSync}
              disabled={syncing}
              className="px-2 sm:px-4 py-2 bg-cyan-500/10 rounded-xl border border-cyan-500/20 text-xs text-cyan-400 hover:bg-cyan-500/20 transition-all flex items-center gap-1 sm:gap-2"
            >
              <Database className={`w-4 h-4 sm:w-3.5 sm:h-3.5 ${syncing ? 'animate-pulse' : ''}`} />
              <span className="hidden sm:inline">{syncing ? 'Intelligent Sync...' : 'Sync IA Ingest'}</span>
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8 space-y-8">
        {/* KPI Row */}
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          <KPICard
            icon={<Users className="w-5 h-5" />}
            label="Leads (24h)"
            value={data?.summary.leads_last_24h ?? '—'}
            accent="cyan"
            className="hud-brackets"
          />
          <KPICard
            icon={<Target className="w-5 h-5" />}
            label="Avg. Lead Score"
            value={`${data?.summary.avg_score ?? '—'}%`}
            accent="emerald"
            className="hud-brackets"
          />
          <KPICard
            icon={<Brain className="w-5 h-5" />}
            label="Neural Coverage"
            value={data?.summary.inventory_coverage ?? '—'}
            accent="violet"
            className="hud-brackets"
          />
          <KPICard
            icon={<MessageSquare className="w-5 h-5" />}
            label="WhatsApp Health"
            value={`${data ? Math.round((data.whatsapp.sent / Math.max(data.whatsapp.sent + data.whatsapp.failed, 1)) * 100) : '—'}%`}
            accent="green"
            className="hud-brackets"
          />
        </div>

        {/* Sentinel Neural Signals */}
        <SentinelIntelligenceWidget signals={signals} loading={loading} />

        {/* Richard AI Advisor - Personal Strategy Channel */}
        <div className="grid grid-cols-1 lg:grid-cols-1 gap-6">
          <RichardAIAdvisor businessContext={data} />
        </div>

        {/* Phase 3: Holo-Dashboard Intelligence */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <HoloDashboard
            leadsCount={data?.summary.leads_last_24h}
            inventoryHealth={data?.summary.inventory_coverage}
            aiConfidence={98}
          />
        </motion.div>

        {/* Intelligence Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Hot Leads Monitor */}
          <motion.div
            className={`${CARD_CLASSES} lg:col-span-2 hud-brackets`}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-orange-500/10">
                  <Flame className="w-5 h-5 text-orange-400" />
                </div>
                <div>
                  <h2 className="font-bold text-sm tracking-wide">Hot Leads Monitor</h2>
                  <p className="text-[10px] text-slate-500">
                    Prospectos con alta probabilidad de cierre
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              {data?.hotLeads.length ? (
                data.hotLeads.map((lead) => (
                  <div
                    key={lead.id}
                    className={`group p-4 bg-slate-800/30 rounded-2xl border border-white/[0.04] hover:border-cyan-500/30 transition-all flex items-center justify-between ${
                      lead.priority === 'urgent' ? 'priority-pulse-urgent border-rose-500/20' : ''
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      <div
                        className={`w-12 h-12 rounded-xl flex items-center justify-center font-bold text-lg ${
                          lead.score > 85
                            ? 'bg-orange-500/20 text-orange-400'
                            : 'bg-cyan-500/20 text-cyan-400'
                        }`}
                      >
                        {lead.score}
                      </div>
                      <div>
                        <h3 className="font-bold text-sm">{lead.name}</h3>
                        <p className="text-[10px] text-slate-500 flex items-center gap-1.5 uppercase tracking-wider">
                          <Target className="w-3 h-3" /> {lead.interest || 'Interés General'}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-6">
                      <div className="hidden md:block text-right">
                        <p
                          className={`text-[10px] font-bold uppercase tracking-widest ${
                            lead.priority === 'urgent' ? 'text-red-400' : 'text-cyan-400'
                          }`}
                        >
                          Prioridad {lead.priority}
                        </p>
                        <p className="text-[9px] text-slate-600 truncate max-w-[150px]">
                          {lead.factors[0]}
                        </p>
                      </div>
                      <ChevronRight className="w-4 h-4 text-slate-700 group-hover:text-cyan-400 transition" />
                    </div>
                  </div>
                ))
              ) : (
                <div className="py-12 text-center text-slate-600">
                  <Users className="w-12 h-12 mx-auto mb-3 opacity-20" />
                  <p className="text-xs">Esperando leads de alta intención...</p>
                </div>
              )}
            </div>
          </motion.div>

          {/* WhatsApp & Search Health */}
          <div className="space-y-4 sm:space-y-6">
            <motion.div
              className={CARD_CLASSES}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 rounded-xl bg-green-500/10">
                  <MessageSquare className="w-5 h-5 text-green-400" />
                </div>
                <h2 className="font-bold text-sm">Nurturing Status</h2>
              </div>
              <div className="space-y-4">
                <StatusRow
                  icon={<CheckCircle2 className="w-4 h-4 text-emerald-400" />}
                  label="Completados"
                  value={data?.whatsapp.sent ?? 0}
                />
                <StatusRow
                  icon={<Activity className="w-4 h-4 text-amber-400" />}
                  label="En Secuencia"
                  value={data?.whatsapp.scheduled ?? 0}
                />
                <StatusRow
                  icon={<AlertTriangle className="w-4 h-4 text-red-400" />}
                  label="Fallidos"
                  value={data?.whatsapp.failed ?? 0}
                />
              </div>
            </motion.div>

            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
              <NeuralSearchTicker gaps={data?.neuralSearch.recent_gaps} />
            </motion.div>

            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
              <SourcingLogWidget orders={data?.purchaseOrders || []} onUpdate={fetchTelemetry} />
            </motion.div>

            {/* Mobile: collapsible widgets */}
            <details className="[&_summary]:cursor-pointer group">
              <summary className="flex items-center gap-2 p-3 bg-slate-800/40 rounded-xl border border-white/5 text-xs text-slate-300 font-bold uppercase tracking-wider lg:hidden">
                <Activity className="w-4 h-4 text-cyan-400" />
                Más widgets
                <ChevronRight className="w-4 h-4 ml-auto transition-transform group-open:rotate-90" />
              </summary>
              <div className="space-y-4 mt-4 lg:!block">
                <div className="lg:hidden space-y-4">
                  <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
                    <SentinelDistributionWidget
                      stats={data?.distribution}
                      health={data?.summary.distribution_health}
                    />
                  </motion.div>
                  <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
                    <NewsroomControlWidget />
                  </motion.div>
                  <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
                    <TelemetryFeedWidget />
                  </motion.div>
                  <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
                    <MarketPulseWidget make="Toyota" model="Corolla" currentPrice={22900} />
                  </motion.div>
                  <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
                    <SentinelLocalSEO inventory={(data?.purchaseOrders as any) || []} />
                  </motion.div>
                  <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
                    <SentinelFinancialOptimizer />
                  </motion.div>
                  <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
                    <BusinessHealthWidget />
                  </motion.div>
                </div>
              </div>
            </details>

            {/* Desktop: always visible */}
            <div className="hidden lg:block space-y-6">
              <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
                <SentinelDistributionWidget
                  stats={data?.distribution}
                  health={data?.summary.distribution_health}
                />
              </motion.div>
              <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
                <NewsroomControlWidget />
              </motion.div>
              <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
                <TelemetryFeedWidget />
              </motion.div>
              <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
                <MarketPulseWidget make="Toyota" model="Corolla" currentPrice={22900} />
              </motion.div>
              <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
                <SentinelLocalSEO inventory={(data?.purchaseOrders as any) || []} />
              </motion.div>
              <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
                <SentinelFinancialOptimizer />
              </motion.div>
              <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
                <BusinessHealthWidget />
              </motion.div>
            </div>
          </div>
        </div>

        {/* Bottom Banner */}
        <div className="hidden md:flex p-4 bg-cyan-500/5 border border-cyan-500/10 rounded-2xl items-center justify-center gap-3">
          <Shield className="w-4 h-4 text-cyan-400" />
          <p className="text-[10px] text-cyan-300 uppercase tracking-[0.2em] font-bold">
            Protección de Datos Activa • Richard Automotive Command v2.4
          </p>
        </div>
      </main>
    </div>
  );
}

// ─── Subcomponents ──────────────────────────────────────────────────

function KPICard({
  icon,
  label,
  value,
  accent,
  className = '',
}: {
  icon: React.ReactNode;
  label: string;
  value: number | string;
  accent: string;
  className?: string;
}) {
  const colorMap: Record<string, string> = {
    cyan: 'from-cyan-500/10 border-cyan-500/10 text-cyan-400',
    emerald: 'from-emerald-500/10 border-emerald-500/10 text-emerald-400',
    violet: 'from-violet-500/10 border-violet-500/10 text-violet-400',
    green: 'from-green-500/10 border-green-500/10 text-green-400',
  };
  const colors = colorMap[accent] || colorMap.cyan;

  return (
    <motion.div
      className={`relative bg-linear-to-br ${colors.split(' ')[0]} to-slate-900/60 backdrop-blur-xl border ${colors.split(' ')[1]} rounded-2xl p-5 overflow-hidden ${className}`}
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
    >
      <div className={`mb-3 ${colors.split(' ')[2]}`}>{icon}</div>
      <p className="text-[9px] sm:text-[10px] text-slate-400 uppercase tracking-widest mb-1 truncate">{label}</p>
      <p
        className="text-2xl sm:text-3xl font-black tabular-nums truncate"
        style={{ fontFamily: 'var(--font-cinematic)' }}
      >
        {value}
      </p>
    </motion.div>
  );
}

function StatusRow({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
}) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2.5">
        {icon}
        <span className="text-xs text-slate-400">{label}</span>
      </div>
      <span className="text-sm font-bold tabular-nums">{value}</span>
    </div>
  );
}
