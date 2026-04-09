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
} from 'lucide-react';

interface TelemetryData {
  timestamp: string;
  leads: { last_24h: number; last_7d: number; last_30d: number };
  neuralSearch: { recent_gaps: any[]; gap_count: number };
  whatsapp: { sent: number; scheduled: number; failed: number };
  inventory: { vehicles_with_embeddings: number };
}

const CARD_CLASSES =
  'relative bg-slate-900/60 backdrop-blur-xl border border-white/[0.06] rounded-2xl p-6 overflow-hidden hover:border-white/10 transition-all duration-500';

export default function CommandCenterPage() {
  const [data, setData] = useState<TelemetryData | null>(null);
  const [loading, setLoading] = useState(true);
  const [lastRefresh, setLastRefresh] = useState<Date | null>(null);
  const [syncing, setSyncing] = useState(false);

  const fetchTelemetry = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/command-center/telemetry', {
        headers: { 'x-antigravity-token': 'client-internal' },
      });
      if (res.ok) {
        const json = await res.json();
        setData(json);
        setLastRefresh(new Date());
      }
    } catch (err) {
      console.error('[CommandCenter] Telemetry fetch failed:', err);
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
        alert(`✅ Sync completo: ${result.processed} vehículos procesados, ${result.failed} fallos.`);
        fetchTelemetry();
      }
    } catch (err) {
      alert('❌ Error durante la sincronización.');
    } finally {
      setSyncing(false);
    }
  };

  useEffect(() => {
    fetchTelemetry();
    const interval = setInterval(fetchTelemetry, 60000); // Auto-refresh cada 60s
    return () => clearInterval(interval);
  }, [fetchTelemetry]);

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-white/5 bg-slate-950/80 backdrop-blur-2xl">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="relative">
              <div className="w-3 h-3 bg-emerald-400 rounded-full animate-pulse" />
              <div className="absolute inset-0 w-3 h-3 bg-emerald-400 rounded-full animate-ping opacity-40" />
            </div>
            <div>
              <h1 className="text-lg font-black uppercase tracking-[0.25em]" style={{ fontFamily: 'var(--font-cinematic)' }}>
                Command <span className="text-cyan-400">Center</span>
              </h1>
              <p className="text-[10px] text-slate-500 tracking-widest uppercase">
                Nivel 18 • Protocolo Sentinel Activo
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={fetchTelemetry}
              disabled={loading}
              className="flex items-center gap-2 px-4 py-2 bg-slate-800/50 rounded-xl border border-white/5 text-xs text-slate-300 hover:text-white hover:border-cyan-500/30 transition-all"
            >
              <RefreshCcw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </button>
            <button
              onClick={triggerBulkSync}
              disabled={syncing}
              className="flex items-center gap-2 px-4 py-2 bg-cyan-500/10 rounded-xl border border-cyan-500/20 text-xs text-cyan-400 hover:bg-cyan-500/20 transition-all"
            >
              <Database className={`w-3.5 h-3.5 ${syncing ? 'animate-pulse' : ''}`} />
              {syncing ? 'Syncing...' : 'Sync Inventario'}
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8 space-y-8">
        {/* KPI Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <KPICard
            icon={<Users className="w-5 h-5" />}
            label="Leads (24h)"
            value={data?.leads.last_24h ?? '—'}
            accent="cyan"
          />
          <KPICard
            icon={<TrendingUp className="w-5 h-5" />}
            label="Leads (7 días)"
            value={data?.leads.last_7d ?? '—'}
            accent="emerald"
          />
          <KPICard
            icon={<Brain className="w-5 h-5" />}
            label="Vehículos con AI"
            value={data?.inventory.vehicles_with_embeddings ?? '—'}
            accent="violet"
          />
          <KPICard
            icon={<MessageSquare className="w-5 h-5" />}
            label="WhatsApp Enviados"
            value={data?.whatsapp.sent ?? '—'}
            accent="green"
          />
        </div>

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* WhatsApp Pipeline Status */}
          <motion.div className={CARD_CLASSES} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 rounded-xl bg-green-500/10">
                <MessageSquare className="w-5 h-5 text-green-400" />
              </div>
              <h2 className="font-bold text-sm tracking-wide">WhatsApp Pipeline</h2>
            </div>
            <div className="space-y-4">
              <StatusRow icon={<CheckCircle2 className="w-4 h-4 text-emerald-400" />} label="Enviados" value={data?.whatsapp.sent ?? 0} />
              <StatusRow icon={<Activity className="w-4 h-4 text-amber-400" />} label="En Cola" value={data?.whatsapp.scheduled ?? 0} />
              <StatusRow icon={<AlertTriangle className="w-4 h-4 text-red-400" />} label="Fallidos" value={data?.whatsapp.failed ?? 0} />
            </div>
            <div className="mt-6 pt-4 border-t border-white/5">
              <p className="text-[10px] text-slate-500 uppercase tracking-widest">Delivery Rate</p>
              <div className="mt-2 h-2 bg-slate-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-emerald-500 to-cyan-500 rounded-full transition-all duration-1000"
                  style={{
                    width: data
                      ? `${Math.round(((data.whatsapp.sent) / Math.max(data.whatsapp.sent + data.whatsapp.failed, 1)) * 100)}%`
                      : '0%',
                  }}
                />
              </div>
            </div>
          </motion.div>

          {/* Neural Search Intelligence */}
          <motion.div
            className={`${CARD_CLASSES} lg:col-span-2`}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 rounded-xl bg-violet-500/10">
                <Search className="w-5 h-5 text-violet-400" />
              </div>
              <div>
                <h2 className="font-bold text-sm tracking-wide">Neural Search Gaps</h2>
                <p className="text-[10px] text-slate-500">Búsquedas sin resultados — oportunidades de inventario</p>
              </div>
            </div>

            {data?.neuralSearch.recent_gaps.length ? (
              <div className="space-y-2 max-h-[280px] overflow-y-auto pr-2 scrollbar-thin">
                {data.neuralSearch.recent_gaps.map((gap: any, i: number) => (
                  <div
                    key={i}
                    className="flex items-center justify-between p-3 bg-slate-800/40 rounded-xl border border-white/[0.03]"
                  >
                    <div className="flex items-center gap-3">
                      <Zap className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                      <span className="text-sm text-slate-300 truncate max-w-[320px]">
                        &ldquo;{gap.query}&rdquo;
                      </span>
                    </div>
                    {gap.detected_intent && (
                      <span className="text-[10px] px-2 py-0.5 bg-violet-500/10 text-violet-400 rounded-full border border-violet-500/20 shrink-0">
                        {gap.detected_intent}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-40 text-slate-600">
                <Shield className="w-8 h-8 mb-2" />
                <p className="text-xs">Sin gaps detectados — cobertura perfecta</p>
              </div>
            )}
          </motion.div>
        </div>

        {/* Footer */}
        {lastRefresh && (
          <p className="text-center text-[10px] text-slate-600 tracking-widest uppercase">
            Última actualización: {lastRefresh.toLocaleTimeString('es-PR')}
          </p>
        )}
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
}: {
  icon: React.ReactNode;
  label: string;
  value: number | string;
  accent: string;
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
      className={`relative bg-gradient-to-br ${colors.split(' ')[0]} to-slate-900/60 backdrop-blur-xl border ${colors.split(' ')[1]} rounded-2xl p-5 overflow-hidden`}
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4 }}
    >
      <div className={`mb-3 ${colors.split(' ')[2]}`}>{icon}</div>
      <p className="text-[10px] text-slate-400 uppercase tracking-widest mb-1">{label}</p>
      <p className="text-3xl font-black tabular-nums" style={{ fontFamily: 'var(--font-cinematic)' }}>
        {value}
      </p>
    </motion.div>
  );
}

function StatusRow({ icon, label, value }: { icon: React.ReactNode; label: string; value: number }) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2.5">
        {icon}
        <span className="text-sm text-slate-400">{label}</span>
      </div>
      <span className="text-sm font-bold tabular-nums">{value}</span>
    </div>
  );
}
